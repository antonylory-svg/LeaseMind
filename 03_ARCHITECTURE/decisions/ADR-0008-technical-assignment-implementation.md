# ADR-0008 — Technical Assignment: implementation of the three DEVELOPMENT blockers

**Дата:** 2026-08-01
**Автор:** Lead Software Architect
**Статус:** Accepted for synthetic development only

## Контекст

`02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md` v1.0 получил PRODUCT-approval
("APPROVED WITH NON-BLOCKING COMMENTS", §19) с тремя открытыми
DEVELOPMENT-блокерами, зафиксированными в delta-review:

1. Idempotency и atomic bootstrap — не определён формат idempotency между
   save draft / transform / launch, и границы атомарной транзакции запуска.
2. Contacts Gate — механика проверки не определена (сознательно передана
   в LEGAL, §18.3.4), но launch-команда обязана её проверять.
3. Разделение DB-ролей — нет решения, какая роль пишет Property/
   TenantRequest и кто (если кто-либо) видит `property_exact_address`.

Это решение закрывает все три вопроса ТОЛЬКО в объёме, необходимом для
synthetic-only реализации Sprint 4, не предвосхищая решения AI/SECURITY/LEGAL
по пунктам §18.3, которые documented как отдельные Launch blockers.

## Решение

### 1. Idempotency и atomic bootstrap

- `TechnicalAssignment` не хранится как отдельная сущность (§9.1.1): его
  envelope-поля (`schema_version`, `revision`, `lifecycle_status`,
  `created_at`, `updated_at`) — колонки прямо на `Property`/`TenantRequest`.
  `technical_assignment_id` — это тот же `property_id`/`tenant_request_id`,
  выданный сервером при первом сохранении черновика (не отдельный ID) —
  минимальная схема без искусственного дублирования identity.
- **Одна идемпотентная команда сохранения черновика**, `POST
  /api/v1/technical-assignments`, ключирована по `(scenario,
  idempotency_key)`: первый вызов создаёт черновик (`property_id`/
  `tenant_request_id` = random UUID, генерируется сервером); повторные
  вызовы с тем же `idempotency_key` обновляют ТОТ ЖЕ черновик. Полный
  payload сравнивается нормализованно с сохранённым: изменившиеся поля
  увеличивают `revision`; идентичный повтор не создаёт новую revision и не
  дублирует запись (§9.1.5, §13.11, CTA-C-001/002).
  `scenario` неизменяем после первого сохранения (§5.1) — попытка сменить
  сценарий под тем же `idempotency_key` отклоняется
  `TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE`, без частичной записи.
- **`lifecycle_status` вычисляется сервером внутри той же команды**, а не
  отдельным HTTP-эндпоинтом: сразу после валидации сервер проверяет
  минимально обязательный набор (§7.3/§8.3) и cross-field правила (§7.4/
  §8.4) и записывает `ready_for_analysis` или оставляет `draft`. Это
  буквально то, что говорит §5.3.3/§5.1 ("вычисляется сервером, клиент не
  задаёт") — отдельная команда "перевод в ready" не добавляет ничего, чего
  не делает валидация внутри save, и создала бы дублирующий путь для той
  же серверной проверки. `GET /api/v1/technical-assignments/{id}` —
  единственный дополнительный (read-only) эндпоинт, нужный фронтенду, чтобы
  перечитать текущее состояние без повторной отправки формы.
- **Pre-launch Analysis не персистится отдельной таблицей.** Он
  детерминированная синтетическая функция от `(technical_assignment_id,
  revision)` (см. §2 ниже) и вычисляется мгновенно на фронтенде без
  сетевого вызова. "Analysis завершён для текущей revision" эквивалентно
  "`lifecycle_status = ready_for_analysis` при этой revision" — поэтому
  свежесть Analysis проверяется launch-командой через `expected_revision`
  (переданный клиентом revision, который он в последний раз видел), а не
  через отдельную запись анализа: несовпадение с текущей revision
  означает `TECHNICAL_ASSIGNMENT_ANALYSIS_STALE`.
- **Запуск Campaign — одна транзакция** (`apps/api/src/db/launchCampaign.ts`):
  на одном соединении (`lmapp_campaign_writer`) в одном `BEGIN…COMMIT`:
  1. `SELECT … FOR UPDATE` строки Property/TenantRequest по
     `technical_assignment_id`;
  2. проверка `lifecycle_status = ready_for_analysis`,
     `revision = expected_revision`, `contacts_gate_evidence` присутствует
     и равен синтетическому маркеру (см. §2);
  3. проверка идемпотентности launch-команды по отдельному,
     launch-специфичному `idempotency_key` (не тому же, что у save draft —
     разные HTTP-команды, разные таблицы для проверки: campaign_event_log
     против Property/TenantRequest, поэтому переиспользование ключа между
     командами структурно не пересекается и не может создать частичную
     запись — принцип "та же key + другая команда отклоняется" выполняется
     самой структурой, а не дополнительной проверкой);
  4. вставка события `campaign.subject_linked.v1` (sequence N), затем
     `campaign.status_recorded.v1` со `status=Created` (sequence N+1) —
     событие provenance идёт первым, чтобы `rebuildCampaignProjection`
     (читает последнее событие по `event_sequence DESC`, ожидает
     `payload.status`) не увидело untyped payload и не потребовало
     изменений в уже протестированном коде Sprint 0/2. Эмпирически
     обнаружено: `campaign_event_log.event_type` уже защищён CHECK-ограничением
     из `002_campaign_event_log.up.sql`, допускающим только
     `campaign.status_recorded.v1` — новая, чисто additive миграция
     `006_campaign_event_log_subject_linked_event_type` расширяет это
     ограничение до двух значений, не трогая 002 и ни одной существующей
     строки;
  5. `UPDATE Property/TenantRequest SET lifecycle_status='campaign_started'`;
  6. upsert `campaign_current_state_projection`;
  7. `COMMIT`.
  Любая ошибка на любом шаге — `ROLLBACK`, ни одна из шести операций не
  фиксируется частично.

### 2. Contacts Gate (synthetic-only for Sprint 4)

- Реальная модель согласия остаётся Launch blocker (§13.6, §18.3.4) и не
  реализуется.
- Launch-команда принимает `contacts_gate_evidence: string` и принимает
  **только** один фиксированный литерал —
  `"synthetic-fixture-acknowledged-v1"` — установленный сервером как
  константа (`apps/api/src/db/contactsGate.ts`), а не значение,
  произвольно задаваемое клиентом. Любое другое значение (пустое, другое,
  отсутствующее) отклоняется `TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED`
  до какой-либо записи. Это проверяется **на сервере** внутри транзакции
  запуска (шаг 2 выше), а не только на фронтенде — фронтенд лишь решает,
  когда отправить этот маркер, но не может "объявить" gate пройденным
  иначе как отправив ровно этот литерал, который согласован только с
  прохождением синтетического экрана Contacts.

### 3. Разделение DB-ролей

Новая пятая+шестая идентичность, по образцу ADR-0005/ADR-0007:

- **`lmapp_ta_writer`** (новая) — единственная роль, которая пишет
  Property/TenantRequest: `SELECT, INSERT, UPDATE` на `property`,
  `tenant_request` и `property_protected_address`. Используется только
  командой `POST /api/v1/technical-assignments`
  (`LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL`, отдельный pool).
- **`lmapp_campaign_writer`** (существующая, расширенная) — дополнительно
  получает полный `SELECT` на `property`/`tenant_request` (нужен и для
  чтения `lifecycle_status`/`revision`/`entity_id`, и потому что
  `SELECT … FOR UPDATE` в PostgreSQL требует `UPDATE`-права, см. ниже —
  подтверждено эмпирически), плюс **колоночный** `GRANT UPDATE
  (lifecycle_status, updated_at)` — ровно те два столбца, которые запуск
  обязан менять при переводе в `campaign_started`. Ни один коммерческий
  факт (`property_monthly_rent_rub`, `request_area_min_sqm` и т.д.) не
  доступен этой роли для записи даже на уровне БД — постолбцовый грант
  проверяется сервером PostgreSQL, а не только дисциплиной кода. Доступа к
  `property_protected_address` эта роль не получает.
- **`lmapp_api_reader`** (существующая, расширенная) — дополнительно
  получает `SELECT` на `property`/`tenant_request` (не на
  `property_protected_address`) для `GET
  /api/v1/technical-assignments/{id}`. Остаётся read-only во всех
  отношениях.
- **`property_protected_address`** — доступна только `lmapp_ta_writer`
  (запись при сохранении черновика). Ни `lmapp_api_reader`, ни
  `lmapp_campaign_writer` не имеют к ней доступа ни в каком объёме.
  `property_exact_address` никогда не входит ни в один HTTP response, ни в
  один Campaign-блок (`subject_snapshot`/`hard_constraints`), ни в один
  лог — сейчас реализована только запись в защищённое хранилище (§9.2);
  Address Disclosure Gate/чтение остаются Launch blocker.
- `lmapp_migrator`/`lmapp_maintainer`/bootstrap по-прежнему никогда не
  используются в HTTP runtime.
- Startup-гейты: новая `verifyRuntimeTechnicalAssignmentPrivileges`
  (для `lmapp_ta_writer`, аналогично `verifyRuntimeCommandPrivileges`) и
  обновлённые `verifyRuntimeCommandPrivileges`/`verifyRuntimeDatabasePrivileges`,
  допускающие ровно новый `SELECT`-грант и ничего сверх него; при любом
  отклонении — fail closed (`DatabasePrivilegeViolation`), как и раньше.

## Явно НЕ входит в это решение

- Реальный DLP-движок, Address Disclosure Gate, Evidence Validator, Memory
  Write Gate, Human Decision Gateway, реальные Pricing/Competition/Demand
  Analyzer — остаются Launch blockers (см. delta-review).
- Редактирование `campaign_started` Property/TenantRequest "на месте"
  (§5.3.6) — сценарии CTA-L/T/C не требуют этого потока; не реализуется.
- Изменение §3.1 (пользовательская последовательность), 30/29 утверждённых
  полей, Campaign statuses, экономики, юридических правил, Matching
  Engine.
- Реальные ПДн, реальный точный адрес, платежи, production adapters,
  protected reveal. PRODUCTION_LAUNCH_GATE остаётся blocked.
