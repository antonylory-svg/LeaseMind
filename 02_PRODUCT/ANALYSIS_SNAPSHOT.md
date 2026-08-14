# Analysis Snapshot v1 — контракт предварительного анализа

**Версия:** 0.3
**Статус:** Proposal for Founder and cross-functional review
**Объём:** Sprint 5, synthetic-only
**Первый рынок:** Россия
**Дата:** 2026-08-10

---

## 1. Назначение

Документ определяет воспроизводимый Analysis Snapshot для двух сценариев:

- `need_tenant` — собственник ищет арендатора;
- `need_property` — арендатор ищет помещение.

Snapshot заменяет информационный экран Sprint 4 на серверный результат, привязанный к точной ревизии Технического задания и доказательной выборке.

Цель v1 — показать полезную и проверяемую предварительную оценку без вымышленных рыночных фактов, ложной точности и скрытого использования персональных или защищённых данных.

## 2. Нормативные источники

1. `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md`, разделы 3.1, 11 и 13.
2. `02_PRODUCT/FIRST_ANALYSIS.md`.
3. `02_PRODUCT/HOMEPAGE.md`.
4. `03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md` — baseline Sprint 4.
5. `05_DEVELOPMENT/matching-engine/README.md` — ограничения Matching Engine.

При расхождении по пользовательской последовательности приоритет имеет `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`. Этот документ уточняет формат Analysis, но не меняет экономику, Campaign outcomes, Contacts Gate, Escrow или полномочия AI Manager.

До принятия отдельного DEVELOPMENT ADR действующий frontend-only placeholder из ADR-0008 остаётся реализованным baseline Sprint 4. Эта Proposal сама по себе не разрешает менять application code или считать серверное хранение утверждённым архитектурным решением.

## 3. Объём v1

### 3.1. Входит

- серверное создание и чтение Analysis Snapshot;
- `pre_launch` до Contacts;
- `post_launch_refresh` — durable серверное намерение, зафиксированное атомарно с запуском Campaign и выполняемое сервером at-least-once и идемпотентно не позднее 15 минут после запуска (§11.3);
- детерминированные расчёты по разрешённым структурированным synthetic-only данным;
- оценка цены или бюджета относительно доступной синтетической выборки;
- количество аналогичных объектов или аналогичного спроса;
- безопасное состояние недостаточности данных для вероятности сделки за 30 дней;
- агрегированные потенциальные категории арендаторов или типы объектов;
- evidence, размер выборки, confidence, допущения и reason codes;
- идемпотентность, восстановление после reload и проверка актуальности revision;
- русская локализация первого пилота при независимом от языка API-контракте.

### 3.2. Не входит

- заявление о реальном рынке на основании синтетических записей;
- внешние классифайды, Росреестр, CRM, брокерские базы или иные production adapters;
- LLM-генерация чисел, фактов, evidence или категорий;
- полноценный Matching Engine и использование его proposal-контрактов как production baseline;
- реальные персональные данные, контакты, точный адрес и protected reveal;
- автоматическое изменение цены, бюджета, локации, срока или иных условий;
- юридические, финансовые и платежные решения;
- обучение или калибровка модели вероятности сделки;
- сложная геоаналитика.

`PRODUCTION_LAUNCH_GATE` остаётся `blocked`. Блокеры `SEVENTH-B01`–`SEVENTH-B06` не обходятся и не объявляются закрытыми этой спецификацией.

## 4. Пользовательская последовательность

```text
выбор роли
→ Technical Assignment со статусом ready_for_analysis
→ Analysis Snapshot pre_launch
→ Contacts
→ отдельное подтверждение запуска Campaign
→ success / detail
→ Analysis Snapshot post_launch_refresh ≤ 15 минут
```

Правила:

1. `pre_launch` не создаёт Campaign.
2. Переход к Contacts разрешён только для актуального terminal Snapshot со статусом `completed` или `insufficient_data`.
3. `failed` и `pending` не открывают Contacts.
4. Изменение нормализованного Технического задания создаёт новую revision и немедленно делает прежний Snapshot устаревшим.
5. Запуск Campaign с устаревшим или отсутствующим `pre_launch` блокируется сервером.
6. `post_launch_refresh` не повторяет Contacts и не создаёт новый gate.

## 5. Неизменяемые принципы

1. Snapshot строится только по серверно прочитанной текущей revision; клиент не передаёт значения для расчёта.
2. Результат terminal Snapshot неизменяем. Новый расчёт создаёт новый Snapshot (правила идентичности логического запроса, идемпотентности разных ключей и retry — §6.1).
3. Отсутствие доказательств возвращается как `insufficient_data`, а техническая ошибка — как `failed`.
4. Snapshot не содержит и не использует `property_exact_address`, контакты, платежные данные или свободный текст.
5. Каждый числовой вывод имеет машиночитаемую методику, evidence и размер выборки.
6. Любое пользовательское представление synthetic-only результата содержит маркировку «По синтетической базе LeaseMind».
7. Название «оценка рынка» запрещено до подключения утверждённой реальной доказательной базы. Для v1 используется «оценка по доступной синтетической выборке».
8. AI Manager не применяет вывод как изменение Campaign Context без подтверждения пользователя.

## 6. Идентичность и жизненный цикл

### 6.1. Ключи

- `analysis_snapshot_id` — UUID v4 или v7, создаётся сервером.
- Логический запрос определяется отдельно по виду анализа:
  - `pre_launch`: `technical_assignment_id + source_revision + analysis_kind`;
  - `post_launch_refresh`: `technical_assignment_id + source_revision + analysis_kind + campaign_id` — здесь `campaign_id` часть логической идентичности запроса, а не только дополнительное обязательное поле: один и тот же `technical_assignment_id + source_revision` не может иметь более одного логического `post_launch_refresh`-запроса на каждый связанный `campaign_id`.
- В рамках одного логического запроса может существовать более одной попытки (Snapshot). Попытки нумеруются `calculation_attempt` — целым, монотонно возрастающим от 1: первая попытка логического запроса получает `calculation_attempt=1`; следующая — только как явный retry после terminal `failed` предыдущей (правила retry — ниже), с `calculation_attempt`, увеличенным на 1. Текущей детерминированно считается попытка с максимальным `calculation_attempt` в рамках логического запроса — не «последняя по времени».
- «Нормализованная команда» — логический запрос (выше) плюс `retry_of_analysis_snapshot_id` (`null` — тоже значение). Две команды с одним и тем же `idempotency_key` считаются «той же самой» только если совпадает вся нормализованная команда.

**Приоритет обработки: сначала durable mapping по `idempotency_key`, затем правила текущей попытки.** Сервер обрабатывает каждую команду строго в этом порядке:

1. Проверяет, существует ли долговременный (durable) mapping для переданного `idempotency_key`.
2. Если ключ уже был принят ранее:
   - та же самая нормализованная команда возвращает `200` и ровно тот Snapshot, с которым этот ключ был первоначально связан — **независимо от текущего статуса** этого Snapshot и **независимо от того**, появилась ли позднее новая попытка с большим `calculation_attempt`; старый ключ **никогда** не переназначается на текущую или более новую попытку;
   - тот же ключ, переданный для другой нормализованной команды или другого логического запроса, отклоняется `ANALYSIS_IDEMPOTENCY_CONFLICT` (§12.1) без частичной записи;
   - в частности, повтор ранее принятой retry-команды тем же ключом возвращает попытку, созданную этим retry (`200`), а не отклоняется как `ANALYSIS_RETRY_NOT_ALLOWED` — это replay уже выполненной команды, а не новая проверка допустимости retry.
3. Только если `idempotency_key` ранее не использовался, сервер применяет правила текущей попытки логического запроса (§11.1): схождение к существующей `pending`/`completed`/`insufficient_data`, либо создание первой попытки, либо проверку explicit retry после terminal `failed`.

Платформа обязана долговременно и атомарно хранить сопоставление каждого принятого `idempotency_key` с его нормализованной командой и итоговым Snapshot, чтобы один и тот же `idempotency_key` нельзя было впоследствии переиспользовать для другой команды или другого логического запроса.

**Технический повтор выполнения — не retry.** Пока текущая попытка логического запроса остаётся `pending`, платформа вправе автоматически повторять её техническое выполнение (тот же durable intent, тот же `analysis_snapshot_id`, тот же `calculation_attempt`) — например, после сбоя worker'а или рестарта процесса (правила — §11.3). Такие технические повторы не создают новый Snapshot, не увеличивают `calculation_attempt` и не относятся к правилам retry ниже.

**Retry.** Единственный способ создать новую попытку (увеличить `calculation_attempt`) для уже существующего логического запроса — одинаково для `pre_launch` и `post_launch_refresh`:

- разрешён только если текущая попытка этого логического запроса перешла в terminal `failed`, и только если её `failure.retryable = true`;
- инициируется только явным действием пользователя («Повторить», §15.1) — автоматическое создание новой попытки после terminal `failed` запрещено; сервер никогда не создаёт новую попытку самостоятельно;
- retry-команда передаёт новый `idempotency_key` и обязательное поле `retry_of_analysis_snapshot_id`, равное `analysis_snapshot_id` последней `failed`-попытки; несовпадение или отсутствие отклоняется без создания записи (§11.1, §12.1);
- создаёт новый, самостоятельный immutable Snapshot (новую попытку, `calculation_attempt + 1`) для того же логического запроса; предыдущая `failed`-попытка не изменяется и остаётся доступной для чтения (§5, пункт 2);
- `completed`/`insufficient_data` не пересчитываются повторно для одного и того же логического запроса — retry применим только к terminal `failed`;
- stale Snapshot не retry-ится: изменение Технического задания (новая `revision`) образует новый логический запрос (`source_revision` — часть логического запроса), для которого создаётся новый, независимый Analysis с `calculation_attempt=1`, а не retry предыдущего.

### 6.2. Виды

| `analysis_kind` | Когда создаётся | Campaign существует |
| --- | --- | --- |
| `pre_launch` | После `ready_for_analysis`, до Contacts | Нет |
| `post_launch_refresh` | После успешного запуска, ≤15 минут | Да |

### 6.3. Статусы

| `status` | Значение | Terminal | Открывает Contacts |
| --- | --- | --- | --- |
| `pending` | Расчёт принят, но не завершён | Нет | Нет |
| `completed` | Хотя бы один аналитический блок рассчитан; остальные могут иметь `insufficient_data` | Да | Да, только если Snapshot актуален |
| `insufficient_data` | Ни один аналитический блок нельзя обоснованно рассчитать | Да | Да, только если Snapshot актуален |
| `failed` | Техническая ошибка расчёта | Да | Нет |

`failed` не используется для недостаточной выборки. `insufficient_data` не используется для сбоев БД, таймаута или ошибки кода.

### 6.4. Актуальность

`freshness_status` вычисляется сервером при чтении. Причина отражается в публичном `freshness_reason` (§7) — единственном значении, видимом пользователю.

- `current` — `source_revision` равна текущей revision Технического задания, связь Campaign корректна, и `evidence_dataset_revision` этого Snapshot не отозвана; `freshness_reason=null`.
- `stale` — Snapshot устарел по одной или нескольким причинам одновременно. Поскольку `freshness_reason` — одиночное значение, применяется фиксированный приоритет: `evidence_revoked` → `campaign_mismatch` → `revision_changed`. `null` разрешён только когда ни одна причина устаревания не применима (то есть только при `current`).

Terminal Snapshot не изменяется при переходе в `stale`; меняется только вычисляемая проекция актуальности.

**Отзыв evidence dataset.**

- Отозвать можно только конкретную, ненулевую `evidence_dataset_revision` — отозвать «ничего» или `null` нельзя.
- Платформа может отозвать `evidence_dataset_revision` только через авторизованную операционную команду — не через обычный пользовательский путь и не через AI Manager.
- Операционный `evidence_revocation_reason_code` (§12.3), время отзыва и инициатор в privacy-safe audit-представлении хранятся в защищённом audit trail (§14) — это внутреннее, контролируемое значение, отдельное от публичного `freshness_reason`.
- Raw `evidence_revocation_reason_code` и сведения об инициаторе обычному пользователю не выдаются — ни в API-ответе Snapshot, ни в UI. Пользователь получает только публичный `freshness_reason=evidence_revoked` и утверждённое локализованное отображение (§15.2); этот документ не определяет сам локализованный текст.
- Отзыв необратим для конкретной `evidence_dataset_revision`: он не отменяется и не редактируется. Если доказательная база впоследствии исправлена, исправленные данные получают новую `evidence_dataset_revision` (новый hash), а не реабилитацию отозванной.
- Terminal Snapshot, чья `evidence_dataset_revision` отозвана, физически не изменяется и не удаляется — он остаётся доступным для чтения как исторический факт.
- При чтении любой Snapshot, чья `evidence_dataset_revision` отозвана, получает `freshness_status=stale`, `freshness_reason=evidence_revoked` (приоритет выше), независимо от совпадения `source_revision`.
- Такой Snapshot не открывает Contacts и не разрешает запуск Campaign (§4, §11.3) — те же ограничения, что и для любой другой причины `stale`.
- Единственный путь для пользователя — создать новый Snapshot, рассчитанный на текущей (неотозванной) evidence revision; отозванный Snapshot не «реанимируется».
- Synthetic-записи, вовлечённые в отзыв или замену evidence dataset, по-прежнему не становятся реальной историей исходов и не участвуют в подсчёте порогов `AS-C-021`–`AS-C-026` (§9.8).

## 7. Контракт ответа

```yaml
schema_version: "1.0"
analysis_snapshot_id: uuid
technical_assignment_id: uuid
source_revision: integer
scenario: need_tenant | need_property
analysis_kind: pre_launch | post_launch_refresh
campaign_id: uuid | null
calculation_attempt: integer
status: pending | completed | insufficient_data | failed
freshness_status: current | stale
freshness_reason: revision_changed | campaign_mismatch | evidence_revoked | null
method_version: synthetic_ru_v1
market_context:
  country_code: RU
  currency: RUB
  locale: ru-RU
  area_unit: sqm
  rent_period: month
input_fingerprint: sha256
evidence_dataset_revision: sha256 | null
evidence_as_of: datetime | null
generated_at: datetime | null
created_at: datetime
failure: null | { code: string, retryable: boolean }
results:
  price_adequacy: metric
  competition: metric
  deal_probability_30d: metric
  candidate_categories: metric
```

### 7.1. Общие правила полей

| Поле | Правило |
| --- | --- |
| `schema_version` | Только `1.0` для этого контракта |
| `source_revision` | Revision, прочитанная сервером и совпавшая с `expected_revision` при создании |
| `method_version` | Версия алгоритмов; изменение порогов или формул требует нового значения |
| `calculation_attempt` | Целое, начинается с 1 для первой попытки логического запроса (§6.1); увеличивается на 1 только при создании новой попытки после terminal `failed` через explicit retry — не при техническом повторе выполнения `pending`-попытки |
| `freshness_reason` | `null` только при `current`; иначе одна причина `stale` по приоритету `evidence_revoked` → `campaign_mismatch` → `revision_changed` (§6.4) — не локализованный текст |
| `market_context` | Явные единицы и рынок; бизнес-логика не выводит их из locale клиента |
| `input_fingerprint` | SHA-256 канонического allowlist-входа без точного адреса и свободного текста |
| `evidence_dataset_revision` | SHA-256 отсортированного набора `(entity_type, entity_id, revision, updated_at)`, прочитанного для расчёта |
| `evidence_as_of` | Серверное время согласованного чтения доказательной выборки |
| `generated_at` | Время завершения; `null` только для `pending` |
| `failure` | `null` для `pending`/`completed`/`insufficient_data`; для `failed` — ровно `{code, retryable}`: `code` — стабильный машинный error code, `retryable` — boolean; не содержит raw SQL, stack trace, payload или пользовательский текст |

### 7.2. Общий metric envelope

```yaml
metric_status: assessed | insufficient_data
confidence: low | medium | high | null
value: object | null
sample_size: integer
evidence:
  method: string
  filters_applied: [string]
  dataset_revision: sha256 | null
reason_codes: [string]
assumptions: [string]
```

Правила:

- `value=null` и `confidence=null` при `metric_status=insufficient_data`;
- `sample_size` — число записей после фильтров для конкретной метрики;
- `reason_codes` и `assumptions` используют стабильные коды, а не локализованный текст;
- API не возвращает список исходных записей в v1;
- локализованный текст строится frontend по стабильным enum и code.

## 8. Разрешённые входы

### 8.1. Общий allowlist

Используются только структурированные поля Property/TenantRequest, необходимые для:

- страны, региона, города и укрупнённого района;
- типа, площади и состояния помещения;
- месячной аренды, бюджета, ставки за м² и признака включения эксплуатационных расходов;
- разрешённых/исключённых категорий бизнеса;
- структурированных характеристик помещения и запроса;
- `revision`, `lifecycle_status`, `created_at`, `updated_at`.

Явно запрещены:

- `property_exact_address` и любые protected references;
- `property_additional_requirements` и `request_additional_requirements`;
- contacts, email, phone, user identity;
- idempotency keys других команд;
- raw event payload и логи.

### 8.2. Допустимые записи выборки

1. Только записи runtime mode `synthetic`.
2. Только `ready_for_analysis` или `campaign_started`; `draft` исключается.
3. Текущий предмет анализа исключается из собственной comparable-выборки.
4. Сравнение строк выполняется после trim, Unicode normalization NFKC и locale-independent case folding.
5. Расчёт читает выборку согласованно; изменения после `evidence_as_of` относятся к следующему Snapshot.
6. Наблюдавшиеся локально 33 Property + 18 TenantRequest являются стартовой пилотной выборкой, но не зашитым в алгоритм количеством. Snapshot всегда показывает фактический `sample_size`.

## 9. Детерминированные расчёты v1

### 9.1. Общие правила

- денежные расчёты выполняются decimal без binary floating point;
- сравнение выполняется до округления;
- отображение RUB — до двух знаков для ставки и до целого рубля для общей суммы;
- все сортировки имеют стабильный tie-break по enum code, затем по entity UUID;
- confidence отражает достаточность синтетической выборки, а не вероятность истинности на реальном рынке.

Шкала confidence по `sample_size`:

| Размер выборки | Confidence |
| ---: | --- |
| 1–4 | `low` |
| 5–19 | `medium` |
| 20 и более | `high` |

Если расчёт не учёл присутствующее структурированное ограничение из-за отсутствия утверждённого mapping, confidence ограничивается `low`, а `assumptions` содержит `UNSUPPORTED_FILTERS_PRESENT`.

### 9.2. Нормализованная ставка

Для Property:

```text
property_rate = property_monthly_rent_rub / property_area_sqm
```

Для TenantRequest:

```text
если request_monthly_rent_rate_max_rub_per_sqm задано:
  request_rate = это значение
  rate_basis = explicit_rate_cap
иначе:
  request_rate = request_monthly_budget_max_rub / request_area_max_sqm
  rate_basis = derived_budget_at_max_area
```

Производная ставка не заменяет и не записывает отсутствующее поле Технического задания. В UI явно показывается basis расчёта.

### 9.3. Сопоставимая выборка Property

Property считается сопоставимым для цены, если выполняются все доступные условия:

1. одна страна и нормализованный регион;
2. один город либо город Property входит в `request_cities`;
3. тот же `property_type` либо тип входит в `request_property_types`;
4. для `need_tenant`: площадь от 50% до 200% площади предмета;
5. для `need_property`: площадь входит в подтверждённый диапазон запроса;
6. совместим признак включения эксплуатационных расходов;
7. для запроса состояние Property входит в `request_condition_options`.

Точный адрес не участвует. Район используется только как дополнительный фильтр, когда обе стороны имеют непустое структурированное значение.

### 9.4. Оценка цены или бюджета

Минимальный размер сопоставимой Property-выборки — 5.

При меньшей выборке:

```yaml
metric_status: insufficient_data
reason_codes: [REFERENCE_SAMPLE_TOO_SMALL]
```

При достаточной выборке ставки сортируются по возрастанию. `p25`, `median`, `p75` рассчитываются методом nearest-rank: элемент с 1-based индексом `ceil(p × n)`.

Классификация:

- `below_reference_range`, если subject rate < `p25`;
- `within_reference_range`, если `p25 ≤ subject rate ≤ p75`;
- `above_reference_range`, если subject rate > `p75`.

```yaml
value:
  subject_rate_rub_per_sqm_month: decimal
  rate_basis: property_total_div_area | explicit_rate_cap | derived_budget_at_max_area
  p25_rub_per_sqm_month: decimal
  median_rub_per_sqm_month: decimal
  p75_rub_per_sqm_month: decimal
  classification: below_reference_range | within_reference_range | above_reference_range
```

Эта классификация относится только к указанной synthetic-only выборке и не называется рыночной оценкой.

### 9.5. Количество конкурентов

Для `need_tenant` конкуренты — другие сопоставимые Property по правилам 9.3.

Для `need_property` конкурирующий спрос — другие TenantRequest, у которых совпадают страна и регион, пересекаются города, типы помещений и диапазоны площади, а business category совпадает.

Доступная выборка сканируется полностью, поэтому нулевое количество является рассчитанным значением, а не `insufficient_data`.

```yaml
value:
  comparable_count: integer
  population_scanned: integer
  comparison_side: property_supply | tenant_demand
```

### 9.6. Вероятность сделки за 30 дней

В Sprint 5 отсутствует утверждённая калиброванная история исходов Campaign. Поэтому v1 всегда возвращает:

```yaml
metric_status: insufficient_data
value: null
confidence: null
reason_codes: [CALIBRATED_OUTCOME_HISTORY_REQUIRED]
```

Frontend не показывает процент, диапазон или словесную вероятность. Числовая оценка допускается только в новой `method_version` после отдельного утверждения набора исходов, правил выборки, калибровки и проверки bias.

Раздел 9.8 фиксирует минимальные блокирующие пороги готовности исторических данных. Выполнение отдельного порога из 9.8 не отменяет правила настоящего раздела 9.6 и не разрешает публикацию вероятности. Поведение v1 с `insufficient_data` сохраняется, пока одновременно не выполнены все применимые условия 9.8.6 и отдельно не утверждена новая `method_version`.

### 9.7. Потенциальные категории

Это агрегированная подсказка, не результат Matching Engine и не список кандидатов.

Для `need_tenant`:

1. берутся synthetic TenantRequest с совместимой страной, регионом, городом, типом и площадью;
2. общий бюджет и явная ставка не должны быть ниже цены Property;
3. `request_business_category` должна быть разрешена и не исключена Property;
4. категории группируются по `request_business_category`.

Для `need_property`:

1. берутся synthetic Property из сопоставимой выборки;
2. ставка Property не превышает явный rate cap, если он задан;
3. месячная аренда не превышает общий бюджет;
4. Property группируются по `property_type`.

Возвращаются не более трёх групп, сортировка: `compatible_count DESC`, затем enum code `ASC`.

```yaml
value:
  category_kind: tenant_business_category | property_type
  items:
    - code: enum
      compatible_count: integer
```

Если совместимых записей нет, возвращается `insufficient_data` с `NO_COMPATIBLE_SYNTHETIC_RECORDS`.

### 9.8. Готовность исторических данных для калибровки вероятности

Раздел фиксирует минимальные количественные пороги, при которых обоснованно рассматривается переход от безусловного `insufficient_data` (9.6) к калиброванному `method_version` вероятности сделки за 30 дней. Раздел 9.8 не изменяет текущее поведение v1 и не вводит калиброванный расчёт — он является предварительным условием для будущего отдельного утверждения.

Все пороги ниже — необходимые, но не достаточные условия. Достижение любого из них само по себе никогда не разрешает публикацию вероятности сделки за 30 дней; каждый порог лишь снимает один конкретный блокер и должен рассматриваться вместе с остальными применимыми условиями раздела, включая 9.8.6.

Термины:

- «Созревшая кампания» — Campaign, достигшая terminal outcome (`Success via LeaseMind`, `Success independently`, `Success via broker`, `Paused`, `Cancelled`, `Expired`), пригодная для разметки исхода.
- «Событие» — созревшая кампания с terminal outcome, классифицированным как сделка (`Success via LeaseMind`, `Success independently`, `Success via broker`).
- «Несобытие» — созревшая кампания с terminal outcome, классифицированным как отсутствие сделки (`Paused`, `Cancelled`, `Expired`).

Пороги готовности:

1. **Ранние агрегированные выводы** (неперсонализированные, продуктовые): минимум 250 созревших кампаний, включая минимум 50 событий и минимум 50 несобытий. Порог разрешает рассматривать только ранние неперсонализированные дескриптивные агрегированные выводы уровня продукта. Он не разрешает показывать вероятность сделки за 30 дней для конкретной Campaign.
2. **Кандидат на персонализированную модель**: минимум 1000 созревших кампаний, включая минимум 200 событий и минимум 200 несобытий. Достижение этого порога означает только появление кандидата на разработку и проверку персонализированной модели. Публикация персональной вероятности всё ещё требует временной валидации (9.8.3), проверки bias, отдельного утверждения методики и новой `method_version`.
3. **Временная валидация** (holdout по времени): минимум 100 событий и минимум 100 несобытий в валидационном окне; предпочтительно не менее 200 событий.
4. **Вывод по отдельному сегменту** (например, город, тип помещения, категория бизнеса): минимум 100 событий и минимум 100 несобытий внутри этого сегмента.
5. **Исключение synthetic-only записей**: записи с runtime mode `synthetic` полностью исключаются из обучения, валидации и любых продуктовых выводов о готовности порогов; в подсчёт по пунктам 1–4 входят только записи с runtime mode, отличным от `synthetic`, и подтверждённым реальным terminal outcome.
6. **Запрет персональной вероятности до готовности**: персональная «вероятность сделки за 30 дней» для конкретной Campaign остаётся запрещённой к показу — в любом виде: числовом, процентном, диапазонном или словесном прогнозе, — пока одновременно не выполнены все применимые условия:
   - порог 9.8.2 (1000 созревших кампаний / 200 событий / 200 несобытий);
   - минимальная временная валидация 9.8.3 (100 событий / 100 несобытий);
   - порог 9.8.4 (100 событий / 100 несобытий внутри сегмента), если применяется сегментная модель или сегментный вывод;
   - отдельное утверждение методики и новой `method_version`.

   Невыполнение любого из перечисленных условий сохраняет `insufficient_data`. Раздел 15.1 продолжает применяться без исключений.

## 10. Формирование общего статуса

1. Пока расчёт не завершён — `pending`.
2. Если произошла техническая ошибка — `failed`, независимо от доступности отдельных промежуточных результатов; частичный result наружу не публикуется.
3. Если все четыре метрики имеют `insufficient_data` — `insufficient_data`.
4. Если хотя бы одна метрика `assessed` — `completed`.
5. Для текущей synthetic-only выборки `deal_probability_30d` не препятствует `completed`, если рассчитан другой блок.

## 11. API-контракт

### 11.1. Создание или безопасный повтор

`POST /api/v1/analysis-snapshots`

```yaml
idempotency_key: string
technical_assignment_id: uuid
expected_revision: integer
analysis_kind: pre_launch | post_launch_refresh
campaign_id: uuid | null
retry_of_analysis_snapshot_id: uuid | null
```

Правила:

- payload Технического задания клиентом не принимается;
- `pre_launch` требует `campaign_id=null` и текущий статус `ready_for_analysis`; логический запрос — `technical_assignment_id + source_revision + analysis_kind` (§6.1);
- `post_launch_refresh` требует Campaign, связанную с этим Technical Assignment и revision; логический запрос — `technical_assignment_id + source_revision + analysis_kind + campaign_id` (§6.1) — `campaign_id` часть логической идентичности, а не только дополнительное обязательное поле;
- revision mismatch возвращает conflict без создания Snapshot;
- обработка идёт по приоритету §6.1: сначала сервер проверяет durable mapping для `idempotency_key`; правила ниже про текущую попытку применяются только если этот `idempotency_key` ранее не использовался;
- если `idempotency_key` уже использовался: та же нормализованная команда (логический запрос + `retry_of_analysis_snapshot_id`, включая `null`) возвращает `200` с телом Snapshot, изначально связанного с этим ключом — независимо от его текущего статуса и от появления более новой попытки; тот же ключ для другой нормализованной команды или другого логического запроса отклоняется `ANALYSIS_IDEMPOTENCY_CONFLICT` (§12.1, §6.1);
- если `idempotency_key` ранее не использовался и текущая попытка логического запроса — `pending`, `completed` или `insufficient_data`, команда без `retry_of_analysis_snapshot_id` не создаёт новый Snapshot: сопоставление этого ранее не использованного `idempotency_key` с логическим запросом и его `analysis_snapshot_id` сохраняется атомарно и долговременно (§6.1), сервер возвращает `200` с телом этой же попытки — для `pending` тело отражает её текущий статус;
- если текущая попытка — `failed`, но `failure.retryable=false`, либо `retry_of_analysis_snapshot_id` передан при попытке, отличной от `failed` — команда отклоняется `ANALYSIS_RETRY_NOT_ALLOWED` (§12.1);
- если текущая попытка — `failed` и `retryable=true`, но `retry_of_analysis_snapshot_id` не передан или не совпадает с `analysis_snapshot_id` этой попытки — команда отклоняется `ANALYSIS_RETRY_TARGET_MISMATCH` (§12.1);
- корректный retry (ранее не использованный `idempotency_key`, текущая попытка `failed`+`retryable=true`, `retry_of_analysis_snapshot_id` совпадает) создаёт новую попытку с `calculation_attempt`, увеличенным на 1 (§6.1);
- новая попытка логического запроса, завершившаяся синхронно (первая либо через retry): `201`;
- новая попытка логического запроса, запущенная асинхронно (`pending`): `202`;
- любой ответ, сходящийся к уже существующей попытке — replay ранее использованного `idempotency_key` (шаг durable mapping) либо схождение ранее не использованного ключа к `pending`/`completed`/`insufficient_data`: `200` с телом соответствующего Snapshot и его `analysis_snapshot_id`.

### 11.2. Чтение

- `GET /api/v1/analysis-snapshots/{analysis_snapshot_id}`.
- `GET /api/v1/technical-assignments/{technical_assignment_id}/analysis-snapshots/current?revision={n}&analysis_kind={kind}`.

Второй endpoint нужен для reload, возврата в старую вкладку и восстановления без localStorage. Если Snapshot отсутствует, возвращается `404`, а frontend может безопасно предложить новый расчёт.

### 11.3. Связь с запуском Campaign

Launch command дополнительно принимает `analysis_snapshot_id` и внутри той же транзакции проверяет:

1. Snapshot существует;
2. `analysis_kind=pre_launch`;
3. `status=completed|insufficient_data`;
4. `technical_assignment_id` и `source_revision` совпадают с запускаемым заданием;
5. `freshness_status=current`;
6. Contacts Gate пройден.

Несовпадение блокирует запуск без частичной Campaign.

**Durable post-launch refresh.** Успешный запуск Campaign атомарно, в той же транзакционной границе, что и сам launch, фиксирует серверное намерение (durable intent) выполнить `post_launch_refresh` для логического запроса `campaign_id + technical_assignment_id + source_revision + analysis_kind` (§6.1) — Campaign не может быть успешно запущена без зафиксированного намерения выполнить refresh.

- Намерение идентифицируется этим логическим запросом; повторная фиксация того же намерения не создаёт дубликата.
- Выполнение — ответственность сервера, а не клиента: платформа выполняет `post_launch_refresh` at-least-once и идемпотентно.
- Вызов с frontend может ускорить отображение результата пользователю, но не является источником гарантии выполнения и не единственный триггер.
- Закрытая вкладка, потеря сетевого соединения или перезапуск серверного процесса не приводят к потере зафиксированного намерения.
- Срок `≤15 минут` (§3.1, §4) измеряется от момента успешного запуска Campaign, а не от момента, когда клиент впервые обратился за refresh.
- Превышение срока — наблюдаемое нарушение SLA независимо от исхода: платформа обязана сделать его видимым (алерт/метрика, §14) и не засчитывает его как выполнение требования, даже если Snapshot впоследствии успешно завершается.

**Технический повтор выполнения — не то же самое, что новая попытка Analysis (§6.1).** Пока текущая попытка (текущий `calculation_attempt`) этого логического запроса остаётся `pending`, платформа вправе автоматически повторять её техническое выполнение — тот же durable intent, тот же логический запрос, тот же `analysis_snapshot_id`, тот же `calculation_attempt` — например, после сбоя worker'а или рестарта процесса.

- Такие технические повторы не создают новый Snapshot и не увеличивают `calculation_attempt`.
- Они продолжаются только до одного из двух исходов: успешного terminal результата (`completed`/`insufficient_data`), либо terminal `failed` — который фиксируется после исчерпания разрешённых технических повторов, либо немедленно при non-retryable ошибке.
- После того как попытка перешла в terminal `failed`, сервер **не создаёт автоматически новую попытку** — ни для `pre_launch`, ни для `post_launch_refresh`, правило одинаково для обоих `analysis_kind`. Единственный путь к новой попытке — explicit retry пользователя (§6.1, §15.1): новый `idempotency_key` и обязательный `retry_of_analysis_snapshot_id`, увеличивающие `calculation_attempt` на 1.
- Уже успешно запущенная Campaign не откатывается и не аннулируется из-за terminal `failed` `post_launch_refresh`; пользователь видит `failed` для refresh отдельно от статуса самой Campaign (§15.3).

Точный механизм фиксации намерения и технических повторов (хранилище, роль, планировщик/worker) — решение отдельного DEVELOPMENT ADR; здесь фиксируется только нормативное поведение, наблюдаемое пользователем и API.

## 12. Ошибки и reason codes

### 12.1. API errors

| Code | Смысл | Retry |
| --- | --- | --- |
| `ANALYSIS_SNAPSHOT_NOT_FOUND` | Snapshot не найден | Нет |
| `ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_FOUND` | ТЗ не найдено | Нет |
| `ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY` | ТЗ не готово | После исправления ТЗ |
| `ANALYSIS_REVISION_CONFLICT` | Клиент запросил устаревшую revision | После reload |
| `ANALYSIS_KIND_INVALID` | Нарушена связь kind/Campaign | Нет без исправления запроса |
| `ANALYSIS_CAMPAIGN_REQUIRED` | Для refresh отсутствует Campaign | После запуска |
| `ANALYSIS_CAMPAIGN_MISMATCH` | Campaign не связана с ТЗ/revision | Нет |
| `ANALYSIS_MARKET_UNSUPPORTED` | Для страны/валюты нет утверждённого метода | Нет до появления конфигурации |
| `ANALYSIS_DATASET_UNAVAILABLE` | Доказательная БД временно недоступна | Да |
| `ANALYSIS_GENERATION_FAILED` | Внутренняя ошибка расчёта | Да |
| `ANALYSIS_IDEMPOTENCY_CONFLICT` | Тот же `idempotency_key` использован для другой команды или другого логического запроса (§6.1) | Нет |
| `ANALYSIS_RETRY_NOT_ALLOWED` | Текущая попытка логического запроса не находится в `failed` с `retryable=true` (§6.1, §11.1) | Нет |
| `ANALYSIS_RETRY_TARGET_MISMATCH` | `retry_of_analysis_snapshot_id` отсутствует либо не совпадает с текущей retryable `failed`-попыткой (§6.1, §11.1) | Нет |

Error response содержит `code`, безопасное `message`, `request_id` и `retryable`. Raw SQL, stack trace и исходные значения запрещены.

### 12.2. Metric reason codes v1

- `REFERENCE_SAMPLE_TOO_SMALL`;
- `CALIBRATED_OUTCOME_HISTORY_REQUIRED`;
- `NO_COMPATIBLE_SYNTHETIC_RECORDS`;
- `REQUIRED_STRUCTURED_INPUT_MISSING`;
- `UNSUPPORTED_FILTERS_PRESENT`.

### 12.3. Freshness reason codes v1

Значения публичного поля `freshness_reason` (§6.4, §7) — стабильные коды, не локализованный текст; локализованный текст строится frontend (§15.2). При нескольких применимых причинах действует приоритет `evidence_revoked` → `campaign_mismatch` → `revision_changed` (§6.4):

- `revision_changed` — Техническое задание изменилось после расчёта Snapshot;
- `campaign_mismatch` — связь Campaign с Technical Assignment/revision больше не соответствует;
- `evidence_revoked` — `evidence_dataset_revision`, использованная для расчёта, отозвана авторизованной операционной командой (§6.4).

Отдельно от `freshness_reason` существует `evidence_revocation_reason_code` — внутренний операционный код причины отзыва конкретной `evidence_dataset_revision`, хранимый только в защищённом audit trail (§6.4, §14). Он не публикуется в API-ответе Snapshot, не отображается пользователю и не входит в перечень выше; конкретные значения и владение этим кодом — вне объёма этого документа (операционный runbook / отдельное DEVELOPMENT-решение).

## 13. Persistence и least privilege

1. Snapshot хранится серверно; frontend state не является источником истины.
2. Миграция только additive и имеет проверяемый rollback.
3. Terminal result immutable на уровне приложения и БД.
4. Хранилище не дублирует полный payload Технического задания и не хранит exact address/free text.
5. Analysis runtime использует отдельную least-privilege DB identity, которая:
   - читает только разрешённые неперсональные столбцы Property/TenantRequest;
   - не имеет доступа к `property_protected_address`;
   - пишет только таблицы Analysis Snapshot;
   - не получает права migrator, maintainer, Campaign writer или TA writer.
6. API reader читает только безопасную проекцию Snapshot.
7. Startup privilege check fail closed при лишнем или отсутствующем grant.
8. Генерация и фиксация Snapshot выполняются с защитой от параллельных дублей по логическому ключу.

Точная схема таблиц, транзакционная граница и имя DB-role фиксируются отдельным DEVELOPMENT ADR до реализации.

## 14. Observability и безопасность

Разрешено логировать:

- `request_id`;
- `analysis_snapshot_id`;
- `technical_assignment_id` в принятом проектом privacy-safe представлении;
- `source_revision`, `analysis_kind`, `status`, `method_version`;
- длительность и количество обработанных записей;
- error/reason codes;
- нарушение SLA `post_launch_refresh` (превышение 15 минут, §11.3) как отдельное структурированное событие со стабильным кодом и `analysis_snapshot_id`/`campaign_id`;
- событие отзыва `evidence_dataset_revision`: `evidence_revocation_reason_code` (§12.3), время отзыва и инициатор в принятом проектом privacy-safe представлении (§6.4) — только в защищённый audit trail, не пользователю.

Запрещено логировать:

- payload Технического задания;
- точный адрес и protected reference;
- контакты и пользовательский ввод;
- массив исходных entity IDs;
- ставки, бюджеты и свободный текст в raw form;
- stack trace в HTTP response;
- raw идентичность инициатора отзыва evidence dataset (только privacy-safe представление, §6.4).

Метрики не содержат высококардинальные пользовательские labels.

## 15. UI первого пилота

### 15.1. Pre-launch экран

Обязательные элементы:

1. заголовок «Предварительный анализ»;
2. маркировка «По синтетической базе LeaseMind»;
3. номер revision и время расчёта;
4. четыре аналитических блока в порядке раздела 7;
5. размер выборки, confidence и понятное объяснение `insufficient_data`;
6. информационное ограничение;
7. `Назад` к Техническому заданию;
8. `Далее` к Contacts только для актуального `completed|insufficient_data`;
9. безопасный `Повторить` для retryable failure.

`Повторить` виден только когда текущая попытка перешла в terminal `failed` с `failure.retryable=true`; нажатие отправляет новую команду с новым `idempotency_key` и `retry_of_analysis_snapshot_id`, равным этой `failed`-попытке, создавая новую попытку с `calculation_attempt`, увеличенным на 1 (§6.1, §11.1). Сервер никогда не создаёт новую попытку самостоятельно — ни при `pending`, ни после terminal `failed`; технический повтор выполнения ещё не завершённой `pending`-попытки (§11.3) не относится к этой кнопке и не меняет `calculation_attempt`.

Для вероятности сделки v1 показывает: «Недостаточно подтверждённой истории исходов для обоснованной оценки за 30 дней». Процент не отображается.

### 15.2. Stale и reload

- При `stale` с `freshness_reason=revision_changed` или `campaign_mismatch`: «Техническое задание изменилось. Обновите анализ для текущей версии».
- При `stale` с `freshness_reason=evidence_revoked`: отдельное стабильное сообщение о том, что доказательная база этого расчёта отозвана и требуется новый анализ — без `evidence_revocation_reason_code`, времени отзыва, сведений об инициаторе или иных внутренних деталей платформы (§6.4); UI использует только публичный `freshness_reason` и утверждённое локализованное отображение.
- Старые результаты не показываются как актуальные и не открывают Contacts/Launch независимо от причины `stale`.
- После reload frontend получает ТЗ и текущий Snapshot с сервера; сетевой вызов не дублирует terminal Snapshot.
- Temporary error не удаляет recovery URL.

### 15.3. Post-launch

Campaign detail показывает время последнего refresh и те же четыре блока. `pending` сопровождается сроком «не позднее 15 минут после запуска». Refresh не возвращает кнопку запуска.

Статус `post_launch_refresh` (`pending`/`completed`/`insufficient_data`/`failed`) отображается отдельно от статуса самой Campaign (§11.3): ошибка refresh не откатывает и не аннулирует уже успешно запущенную Campaign. Пока попытка `pending`, сервер может автоматически повторять её техническое выполнение без действий пользователя и без создания новой попытки (§11.3) — UI показывает её как тот же `pending`, тот же `calculation_attempt`. После перехода в terminal `failed` сервер новую попытку самостоятельно не создаёт — как и для `pre_launch` (§6.1), для новой попытки требуется explicit retry.

### 15.4. Международная готовность

- API возвращает enum/code, а не русский текст;
- locale используется только для отображения;
- валюта, единица площади, период ставки и страна заданы явно;
- `synthetic_ru_v1` не применяется автоматически к другой стране или валюте;
- добавление страны требует новой конфигурации метода, доказательной базы и acceptance-набора, но не изменения общего envelope v1.

## 16. Acceptance-сценарии

### `AS-C-001` — pre-launch создаётся только для готового ТЗ

**Given:** ТЗ имеет status `ready_for_analysis`, revision N.
**When:** клиент запрашивает `pre_launch` с `expected_revision=N`.
**Then:** создаётся один Snapshot, связанный с этим ID и revision; Campaign не создаётся.

### `AS-C-002` — незавершённое ТЗ блокируется

**Given:** ТЗ имеет status `draft`.
**When:** запрошен Analysis.
**Then:** Snapshot не создаётся; возвращается `ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY`.

### `AS-C-003` — идемпотентный повтор, включая повтор старого ключа после более новой попытки

**Given:** команда с `idempotency_key=K1` уже создала Snapshot (`calculation_attempt=1`, terminal `failed`, `retryable=true`); явный retry с новым `idempotency_key=K2` и `retry_of_analysis_snapshot_id`, равным этому Snapshot, создал новую попытку (`calculation_attempt=2`).
**When:** `K1` повторён снова (та же нормализованная команда: тот же логический запрос, `retry_of_analysis_snapshot_id=null`) после потерянного ответа или спустя время, уже после появления попытки 2.
**Then:** возвращается Snapshot `calculation_attempt=1` — тот, с которым `K1` был изначально связан, — с HTTP `200`, а не `calculation_attempt=2`; `K1` не переназначается на более новую попытку (§6.1); дубликата нет; это не `ANALYSIS_IDEMPOTENCY_CONFLICT`, так как нормализованная команда для `K1` идентична исходной (§6.1, §12.1).

### `AS-C-004` — конкурентные запросы одного логического запроса

**Given:** два запроса одновременно создают один и тот же логический запрос `pre_launch` (`technical_assignment_id` + `source_revision` + `analysis_kind`), с одинаковым или с разными `idempotency_key`.
**When:** транзакции выполняются параллельно.
**Then:** ровно один из двух запросов физически создаёт попытку и получает `201` (если Snapshot завершился синхронно) либо `202` (если создан `pending`); второй запрос, обнаруживший уже существующую попытку, получает `200`; второй Snapshot не создаётся; оба ответа содержат один и тот же `analysis_snapshot_id` и один и тот же `calculation_attempt` (§6.1). При одинаковом `idempotency_key` второй ответ — обычный replay с одним сохранённым durable mapping; при разных `idempotency_key` durable mapping сохраняется для каждого из них по отдельности, но оба указывают на одну и ту же попытку (§6.1, §11.1).

### `AS-C-005` — ставка собственника

**Given:** Property имеет месячную аренду и площадь, сопоставимая выборка ≥5.
**When:** рассчитана price adequacy.
**Then:** ставка равна rent/area, nearest-rank quantiles воспроизводимы, classification соответствует p25/p75.

### `AS-C-006` — явная ставка арендатора

**Given:** TenantRequest содержит rate cap и общий бюджет.
**When:** рассчитана price adequacy.
**Then:** subject rate берётся из rate cap, `rate_basis=explicit_rate_cap`; общий бюджет не заменяет ставку.

### `AS-C-007` — производная ставка арендатора

**Given:** rate cap отсутствует.
**When:** рассчитана price adequacy.
**Then:** ставка равна budget/area_max, basis явно указан; ТЗ не изменяется.

### `AS-C-008` — малая выборка

**Given:** после фильтров осталось <5 Property.
**When:** рассчитывается price adequacy.
**Then:** возвращается `REFERENCE_SAMPLE_TOO_SMALL`; медиана и classification не выдумываются.

### `AS-C-009` — нулевая конкуренция

**Given:** выборка успешно просканирована и аналогов нет.
**When:** рассчитывается competition.
**Then:** `comparable_count=0`, metric status `assessed`, population size указан.

### `AS-C-010` — вероятность без истории исходов

**Given:** нет утверждённой калиброванной outcome history.
**When:** создаётся Snapshot v1.
**Then:** вероятность имеет `insufficient_data`; UI не показывает число или словесный прогноз.

### `AS-C-011` — стабильный порядок категорий

**Given:** две категории имеют одинаковый count.
**When:** строится top-3.
**Then:** tie разрешается по enum code ASC; повтор даёт тот же результат.

### `AS-C-012` — изменение ТЗ

**Given:** Snapshot завершён для revision N.
**When:** пользователь сохраняет изменённое ТЗ как revision N+1.
**Then:** Snapshot N читается как `stale`; Contacts и Launch блокируются до Snapshot N+1.

### `AS-C-013` — безопасное insufficient_data

**Given:** все метрики не имеют достаточных доказательств, но технических ошибок нет.
**When:** расчёт завершается.
**Then:** общий status `insufficient_data`; пользователь видит причины и может перейти к Contacts.

### `AS-C-014` — техническая ошибка, terminal failed и explicit retry

**Given:** доказательная БД временно недоступна; разрешённые технические повторы выполнения этой попытки (§11.3) исчерпаны.
**When:** попытка переходит в terminal `failed` с `failure.retryable=true`.
**Then:** status `failed` показан как retryable; Contacts закрыт; вымышленного результата нет; сервер не создаёт новую попытку автоматически. Явное нажатие «Повторить» с новым `idempotency_key` и `retry_of_analysis_snapshot_id`, равным этому Snapshot, создаёт новую попытку с `calculation_attempt`, увеличенным на 1 (§6.1); исходная `failed`-попытка не изменяется. Retry с отсутствующим или неверным `retry_of_analysis_snapshot_id` отклоняется `ANALYSIS_RETRY_TARGET_MISMATCH`; попытка retry, когда текущий Snapshot не `failed`/`retryable`, отклоняется `ANALYSIS_RETRY_NOT_ALLOWED` (§12.1).

### `AS-C-015` — запуск требует Snapshot

**Given:** Contacts подтверждён, но актуальный `pre_launch` отсутствует или stale.
**When:** запрошен запуск.
**Then:** Campaign не создаётся и ни одна частичная запись не фиксируется.

### `AS-C-016` — durable post-launch refresh: технические повторы vs terminal failed

**Given:** Campaign успешно запущена; клиент закрывает вкладку сразу после получения ответа на launch; во время выполнения `post_launch_refresh` происходит технический сбой (например, рестарт worker'а).
**When:** проходит время до истечения 15 минут после запуска.
**Then:** сервер самостоятельно, без участия клиента, повторяет техническое выполнение той же попытки (`pending`, тот же `calculation_attempt`, тот же durable intent) — это не создаёт новый Snapshot; попытка, связанная с Campaign/TA/revision/`campaign_id`, либо успешно завершается (`completed`/`insufficient_data`) не позднее 15 минут после запуска, либо переходит в terminal `failed` после исчерпания разрешённых технических повторов — в этом случае сервер не создаёт новую попытку автоматически, а требует explicit retry пользователя (§6.1), как и для `pre_launch`; превышение 15 минут в любом случае остаётся наблюдаемым нарушением SLA (§11.3), даже если Snapshot впоследствии успешно завершается; отдельный Contacts Gate не создаётся.

### `AS-C-017` — восстановление после reload

**Given:** terminal Snapshot уже существует.
**When:** пользователь перезагружает страницу или возвращается по recovery URL.
**Then:** frontend получает тот же Snapshot с сервера без повторного ввода и дубликата.

### `AS-C-018` — защищённые данные не читаются

**Given:** Property имеет `has_exact_address=true`.
**When:** строится и читается Snapshot.
**Then:** роль Analysis не может прочитать protected table; адрес отсутствует в input, fingerprint, result, logs и response.

### `AS-C-019` — synthetic-only маркировка

**Given:** runtime mode `synthetic`.
**When:** показан любой assessed result.
**Then:** UI явно указывает синтетическую базу и не использует формулировку «реальный рынок».

### `AS-C-020` — международная изоляция метода

**Given:** ТЗ относится не к `RU/RUB/sqm/month`.
**When:** клиент запрашивает Analysis, а сервер выбирает допустимый метод.
**Then:** возвращается `ANALYSIS_MARKET_UNSUPPORTED`; `synthetic_ru_v1` и российские единицы не применяются к другому рынку.

### `AS-C-021` — порог ранних агрегированных выводов не достигнут

**Given:** число созревших кампаний, событий или несобытий ниже порога из 9.8.1 (250 созревших, 50 событий, 50 несобытий).
**When:** рассматривается публикация раннего неперсонализированного дескриптивного агрегированного вывода уровня продукта.
**Then:** публикация не производится. Это правило не относится к персональной вероятности для конкретной Campaign: `deal_probability_30d` в v1 в любом случае остаётся `insufficient_data` с `CALIBRATED_OUTCOME_HISTORY_REQUIRED` независимо от достижения этого порога.

### `AS-C-022` — порог кандидата на персонализированную модель не достигнут

**Given:** число созревших кампаний, событий или несобытий ниже порога из 9.8.2 (1000 созревших, 200 событий, 200 несобытий).
**When:** рассматривается переход к персонализированной калиброванной модели.
**Then:** переход не выполняется; действующий `method_version` v1 сохраняется без изменений.

### `AS-C-023` — временная валидация ниже порога

**Given:** валидационное окно содержит менее 100 событий или менее 100 несобытий.
**When:** оценивается пригодность модели к временной валидации.
**Then:** валидация признаётся недостаточной; модель не допускается к использованию, независимо от результатов на обучающей выборке.

### `AS-C-024` — вывод по сегменту ниже внутрисегментного порога

**Given:** отдельный сегмент (город, тип помещения или категория бизнеса) содержит менее 100 событий или менее 100 несобытий внутри сегмента.
**When:** рассматривается сегмент-специфичный вывод о вероятности сделки.
**Then:** сегмент-специфичный вывод не публикуется; используется только общий `insufficient_data` или более широкий валидный уровень агрегации.

### `AS-C-025` — синтетические записи исключены из обучения и выводов

**Given:** исторический набор данных содержит записи с runtime mode `synthetic` наряду с реальными записями.
**When:** выполняется подсчёт порогов 9.8, обучение или валидация калиброванной модели.
**Then:** записи с runtime mode `synthetic` не учитываются ни в подсчёте порогов, ни в обучающей, ни в валидационной выборке.

### `AS-C-026` — персональная вероятность не показывается до готовности

**Given:** хотя бы одно из обязательных условий 9.8.6 не выполнено — порог 9.8.2 (1000/200/200), временная валидация 9.8.3 (100/100), применимый сегментный порог 9.8.4 (100/100 внутри сегмента) или отдельное утверждение методики и новой `method_version`.
**When:** пользователь просматривает Analysis Snapshot для конкретной Campaign.
**Then:** персональная числовая, процентная, диапазонная или словесная «вероятность сделки за 30 дней» не показывается; `deal_probability_30d` остаётся `insufficient_data`; UI отображает формулировку из 15.1.

### `AS-C-027` — отзыв evidence dataset: приоритет причины и audit-изоляция

**Given:** terminal Snapshot рассчитан на ненулевой `evidence_dataset_revision=X`; авторизованная операционная команда отзывает `X`, фиксируя `evidence_revocation_reason_code`, время и privacy-safe инициатора в audit trail; для этого же Snapshot независимо также верно `campaign_mismatch`.
**When:** Snapshot читается любой ролью, доступной обычному пользователю, после отзыва.
**Then:** `freshness_status=stale`, публичный `freshness_reason=evidence_revoked` — приоритет `evidence_revoked` → `campaign_mismatch` → `revision_changed` (§6.4) выбирает именно эту причину, даже при одновременной `campaign_mismatch`; ответ и UI не содержат `evidence_revocation_reason_code`, время отзыва или сведения об инициаторе — они остаются только в защищённом audit trail (§6.4, §14); Snapshot не открывает Contacts и не разрешает запуск Campaign; сам Snapshot (включая `results`) физически не изменяется; создание нового Snapshot использует текущую (неотозванную) evidence revision.

## 17. Проверки перед реализацией

До изменения application code должны быть подтверждены:

1. **Founder / PRODUCT:** два момента Analysis, состав четырёх блоков, честное отсутствие вероятности v1 и пользовательские формулировки.
2. **DEVELOPMENT:** API, persistence, идемпотентность, stale/recovery и атомарная связь с launch.
3. **SECURITY:** allowlist колонок, отдельная DB identity, privilege checks, log/telemetry boundary.
4. **AI:** методики, evidence/confidence и запрет некалиброванной вероятности.
5. **LEGAL:** информационная маркировка и отсутствие реальных ПДн не снимают production review.

После утверждения DEVELOPMENT создаёт отдельный ADR для схемы хранения, транзакционной границы и DB-role. Только затем начинается реализация.

## 18. Definition of Done Sprint 5 Analysis Snapshot

- все `AS-C-001`–`AS-C-020` и `AS-C-027` относятся к synthetic-only реализации Sprint 5 и автоматизированы на synthetic fixtures;
- `AS-C-021`–`AS-C-026` — будущие policy gates для реальной истории исходов и не расширяют объём реализации Sprint 5; их логику допустимо проверять тестовыми fixtures, но записи с runtime mode `synthetic` никогда не учитываются как реальная история;
- миграция up/down и least-privilege проверки проходят в PostgreSQL CI;
- OpenAPI и runtime schema совпадают;
- typecheck, backend tests, frontend tests и production build проходят;
- ручная проверка обоих сценариев и reload выполнена;
- `post_launch_refresh` проверен по времени;
- real PII, protected reveal, payments и production adapters остаются blocked;
- документация и фактическое поведение не расходятся.
