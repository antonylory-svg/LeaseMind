# Analysis Snapshot v1 — контракт предварительного анализа

**Версия:** 0.1
**Статус:** Proposal for Founder and cross-functional review
**Объём:** Sprint 5, synthetic-only
**Первый рынок:** Россия
**Дата:** 2026-08-09

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
- `post_launch_refresh` не позднее 15 минут после запуска Campaign;
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
2. Результат terminal Snapshot неизменяем. Новый расчёт создаёт новый Snapshot.
3. Отсутствие доказательств возвращается как `insufficient_data`, а техническая ошибка — как `failed`.
4. Snapshot не содержит и не использует `property_exact_address`, контакты, платежные данные или свободный текст.
5. Каждый числовой вывод имеет машиночитаемую методику, evidence и размер выборки.
6. Любое пользовательское представление synthetic-only результата содержит маркировку «По синтетической базе LeaseMind».
7. Название «оценка рынка» запрещено до подключения утверждённой реальной доказательной базы. Для v1 используется «оценка по доступной синтетической выборке».
8. AI Manager не применяет вывод как изменение Campaign Context без подтверждения пользователя.

## 6. Идентичность и жизненный цикл

### 6.1. Ключи

- `analysis_snapshot_id` — UUID v4 или v7, создаётся сервером.
- Логическая уникальность: `technical_assignment_id + source_revision + analysis_kind`.
- Для `post_launch_refresh` дополнительно обязателен `campaign_id`, связанный с этим Technical Assignment.
- Повторная команда с тем же idempotency key и тем же логическим запросом возвращает тот же Snapshot.
- Тот же idempotency key с другим логическим запросом отклоняется без частичной записи.

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

`freshness_status` вычисляется сервером при чтении:

- `current` — `source_revision` равна текущей revision Технического задания и связь Campaign корректна;
- `stale` — revision изменилась, связь Campaign больше не соответствует или доказательная выборка помечена отозванной.

Terminal Snapshot не изменяется при переходе в `stale`; меняется только вычисляемая проекция актуальности.

## 7. Контракт ответа

```yaml
schema_version: "1.0"
analysis_snapshot_id: uuid
technical_assignment_id: uuid
source_revision: integer
scenario: need_tenant | need_property
analysis_kind: pre_launch | post_launch_refresh
campaign_id: uuid | null
status: pending | completed | insufficient_data | failed
freshness_status: current | stale
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
failure: null | object
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
| `market_context` | Явные единицы и рынок; бизнес-логика не выводит их из locale клиента |
| `input_fingerprint` | SHA-256 канонического allowlist-входа без точного адреса и свободного текста |
| `evidence_dataset_revision` | SHA-256 отсортированного набора `(entity_type, entity_id, revision, updated_at)`, прочитанного для расчёта |
| `evidence_as_of` | Серверное время согласованного чтения доказательной выборки |
| `generated_at` | Время завершения; `null` только для `pending` |
| `failure` | Присутствует только при `failed`; не содержит raw SQL, stack trace или payload |

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
```

Правила:

- payload Технического задания клиентом не принимается;
- `pre_launch` требует `campaign_id=null` и текущий статус `ready_for_analysis`;
- `post_launch_refresh` требует Campaign, связанную с этим Technical Assignment и revision;
- revision mismatch возвращает conflict без создания Snapshot;
- новый terminal Snapshot: `201`;
- новый асинхронный `pending`: `202`;
- идемпотентный replay: `200` с тем же `analysis_snapshot_id`.

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
| `ANALYSIS_IDEMPOTENCY_CONFLICT` | Ключ переиспользован для другой команды | Нет |

Error response содержит `code`, безопасное `message`, `request_id` и `retryable`. Raw SQL, stack trace и исходные значения запрещены.

### 12.2. Metric reason codes v1

- `REFERENCE_SAMPLE_TOO_SMALL`;
- `CALIBRATED_OUTCOME_HISTORY_REQUIRED`;
- `NO_COMPATIBLE_SYNTHETIC_RECORDS`;
- `REQUIRED_STRUCTURED_INPUT_MISSING`;
- `UNSUPPORTED_FILTERS_PRESENT`.

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
- error/reason codes.

Запрещено логировать:

- payload Технического задания;
- точный адрес и protected reference;
- контакты и пользовательский ввод;
- массив исходных entity IDs;
- ставки, бюджеты и свободный текст в raw form;
- stack trace в HTTP response.

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

Для вероятности сделки v1 показывает: «Недостаточно подтверждённой истории исходов для обоснованной оценки за 30 дней». Процент не отображается.

### 15.2. Stale и reload

- При `stale`: «Техническое задание изменилось. Обновите анализ для текущей версии».
- Старые результаты не показываются как актуальные и не открывают Contacts/Launch.
- После reload frontend получает ТЗ и текущий Snapshot с сервера; сетевой вызов не дублирует terminal Snapshot.
- Temporary error не удаляет recovery URL.

### 15.3. Post-launch

Campaign detail показывает время последнего refresh и те же четыре блока. `pending` сопровождается сроком «не позднее 15 минут после запуска». Refresh не возвращает кнопку запуска.

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

### `AS-C-003` — идемпотентный повтор

**Given:** команда уже создала Snapshot.
**When:** та же логическая команда и idempotency key повторены после потерянного ответа.
**Then:** возвращается тот же `analysis_snapshot_id`; дубликата нет.

### `AS-C-004` — конкурентные одинаковые запросы

**Given:** два запроса одновременно создают один `pre_launch`.
**When:** транзакции выполняются параллельно.
**Then:** обе сходятся к одному Snapshot и одному terminal result.

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

### `AS-C-014` — техническая ошибка

**Given:** доказательная БД временно недоступна.
**When:** расчёт не может завершиться.
**Then:** status `failed`, retryable error показан; Contacts закрыт; вымышленного результата нет.

### `AS-C-015` — запуск требует Snapshot

**Given:** Contacts подтверждён, но актуальный `pre_launch` отсутствует или stale.
**When:** запрошен запуск.
**Then:** Campaign не создаётся и ни одна частичная запись не фиксируется.

### `AS-C-016` — post-launch refresh

**Given:** Campaign успешно запущена.
**When:** создаётся `post_launch_refresh`.
**Then:** он связан с Campaign/TA/revision, завершается ≤15 минут и не создаёт новый Contacts Gate.

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

## 17. Проверки перед реализацией

До изменения application code должны быть подтверждены:

1. **Founder / PRODUCT:** два момента Analysis, состав четырёх блоков, честное отсутствие вероятности v1 и пользовательские формулировки.
2. **DEVELOPMENT:** API, persistence, идемпотентность, stale/recovery и атомарная связь с launch.
3. **SECURITY:** allowlist колонок, отдельная DB identity, privilege checks, log/telemetry boundary.
4. **AI:** методики, evidence/confidence и запрет некалиброванной вероятности.
5. **LEGAL:** информационная маркировка и отсутствие реальных ПДн не снимают production review.

После утверждения DEVELOPMENT создаёт отдельный ADR для схемы хранения, транзакционной границы и DB-role. Только затем начинается реализация.

## 18. Definition of Done Sprint 5 Analysis Snapshot

- все `AS-C-001`–`AS-C-020` автоматизированы на synthetic fixtures;
- миграция up/down и least-privilege проверки проходят в PostgreSQL CI;
- OpenAPI и runtime schema совпадают;
- typecheck, backend tests, frontend tests и production build проходят;
- ручная проверка обоих сценариев и reload выполнена;
- `post_launch_refresh` проверен по времени;
- real PII, protected reveal, payments и production adapters остаются blocked;
- документация и фактическое поведение не расходятся.
