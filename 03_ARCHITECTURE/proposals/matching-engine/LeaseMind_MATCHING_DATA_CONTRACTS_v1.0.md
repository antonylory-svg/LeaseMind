# LeaseMind Matching Data Contracts

**Версия:** 1.0  
**Дата:** 2026-07-26  
**Статус:** Proposal for DEVELOPMENT review  
**Владелец:** Chief AI Architect  
**Область:** минимальный исполнимый контракт критической цепочки Matching → Payer Resolution → Participation → Payment/Fiscal → Reveal Gate Snapshot → Introduction Record → Reveal Evidence → Dispute  
**Связанный документ:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`
**Исполнимый пакет:** `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/`

---

## 1. Назначение и нормативность

Настоящий пакет определяет минимальные машинно проверяемые контракты, необходимые для независимой реализации bounded contexts российского пилота на синтетических данных.

Нормативные части:

1. OpenAPI 3.1 commands;
2. AsyncAPI event channels;
3. JSON Schema common envelope and payloads;
4. PostgreSQL DDL constraints;
5. error catalog;
6. compatibility and invariant tests.

Контракты не меняют продуктовую механику, UX, экономику, платежную модель или юридические правила. Реальные ПД, платежи и раскрытие запрещены до `PRODUCTION_LAUNCH_GATE`.

### 1.1. Change Log технического исправления от 2026-07-23

| DEVELOPMENT-блокер | Исправленные разделы | Исправление |
| --- | --- | --- |
| `DEV-B01` — отсутствовал фактически запускаемый suite | 1, 8–10; внешний каталог пакета | Добавлены извлекаемые OpenAPI/AsyncAPI, migrations up/down, fixtures, executable verification suite, hash manifest и отчёт синтетической проверки |
| `DEV-B02` — неполный AsyncAPI и разные event namespaces | 4, 6, 8–9 | Добавлены Channel Parameters, previous-contact channel, канонические invalidation events с исчерпывающими reason codes и типизированные payloads |
| `DEV-B03` — secret Reveal token не участвовал в redemption | 3, 5, 6, 8 | Redemption принимает opaque credential, server-side сверяет hash; UUID не является credential |
| `DEV-B04` — несовместимая state machine и момент доставки | 3–6, 8 | Переходы приведены к таблице 45.1; `established_delivery_at` обязателен для доказанного automatic/human delivery; состояния типизированы |
| `DEV-B05` — недостаточная целостность Snapshot/Record | 5, 8 | Добавлены полный состав Snapshot, normalized party bindings, composite FK, append-only evidence и immutable tables |
| `DEV-B06` — небезопасный `SECURITY DEFINER` | 5, 8 | Guard перенесён в закрытую schema, объекты schema-qualified, роли и grants заданы migration-контрактом |

### 1.2. Change Log третьей проверки DEVELOPMENT от 2026-07-24

| DEVELOPMENT-блокер / комментарий | Изменённые разделы и артефакты | Исправление | Влияние на gate |
| --- | --- | --- | --- |
| `THIRD-B01` — ложнополный executable suite | 3–5, 8, 10; `package.json`, `fixtures/synthetic_fixtures.mjs`, `tests/run_contract_suite.mjs`, `tests/run_full_suite.mjs` | Зафиксированы настоящие OpenAPI, AsyncAPI и JSON Schema validators; исполняются `CT-001–CT-033`; покрыты 9 operations, каждый объявленный 4xx и 30 canonical event types | Блокер `IMPLEMENTATION_READINESS_GATE` закрыт фактическим offline run |
| `THIRD-B02` — неработающий down | 5, 8; down migration, post-down assertions | Перед teardown удаляется циклический FK; добавлена проверка отсутствия contract tables, functions, types, schema и roles | Обязательный migration lifecycle стал исполнимым |
| `THIRD-B03` — guard без безопасного lifecycle | 5–6, 8; PostgreSQL behavior suite | Добавлены идемпотентный initializer/trigger, source-version registry и одна atomic owner-controlled invalidation operation: source version → lease revoke → epoch bump → outbox | Delayed-invalidation допускается к синтетическим тестам; production по-прежнему запрещён |
| `THIRD-B04` — несоставная Acceptance → Record → Snapshot | 3, 5, 8 | Дублирующие массивы заменены normalized party bindings; composite FK связывают encounter, party, acceptance version и terms hash; deferred triggers требуют ровно OWNER + TENANT | Исключён commit смешанных участников и версий |
| `THIRD-B05` — cross-domain outbox/idempotency | 5, 8 | Добавлены owner role, FORCE RLS, producer/event/service mapping triggers, immutable idempotency result и negative tests | Восстановлены single-writer и безопасный replay |
| `THIRD-NB01` — OpenAPI lint noise | 3–4 | Добавлены summaries и license metadata, удалён unused `RevealTokenId`, уточнены conditional schemas и SemVer pattern | Non-blocking комментарий закрыт |
| `THIRD-NB02` — cleanup при падении | 8, README; `run_postgres_tests.sh`, `run_full_suite.mjs` | Добавлены trap/finally cleanup с сохранением исходной ошибки и отдельная post-down phase | Disposable environment не остаётся загрязнённым |

### 1.3. Change Log четвёртой проверки DEVELOPMENT от 2026-07-25

| DEVELOPMENT-блокер / комментарий | Изменённые разделы и артефакты | Исправление | Влияние на gate |
| --- | --- | --- | --- |
| `FOURTH-B01` — string/property-presence assertions создавали ложный PASS | 8, 10; contract/service/PostgreSQL runners, report | `CT-001–CT-033` выполняют validator fixtures, executable service behavior и database behavior; result содержит evidence level. Непроведённый обязательный уровень получает `NOT_RUN`/`BLOCKED`; regex/property presence не даёт самостоятельный PASS | Закрыт блокер достоверности `IMPLEMENTATION_READINESS_GATE` |
| `FOURTH-B02` — три Record events отсутствовали в AsyncAPI; malformed payload проходил в outbox | 4–5, 8; AsyncAPI, fixtures, migration, tests | Добавлены `RECORD_PRE_REVEAL_LOCKED`, `PRE_REVEAL_VOIDED`, `PROTECTION_END_REACHED`; единый набор содержит 33 event types. Trigger до commit проверяет exact `(event_type, schema_major)` payload; выполнено 33 positive + 33 malformed DB probes и автоматическое set equality | Consumer не получает событие без нормативной schema |
| `FOURTH-B03` — source writer видел lease другого owner | 5, 8; RLS/grants/PostgreSQL tests | Reader policy source writers удалена; owner policy разрешает только собственный `source_system`; полный read сохранён Introduction Record, Reveal и contract reader. Выполнены 30 ordered SELECT и 30 UPDATE negative probes | Least-privilege isolation подтверждена |
| `FOURTH-NB01` — clean ZIP требовал внешние Markdown | 8, 10, README, `docs/` | Обе нормативные спецификации включены в executable bundle и source manifest | Clean install не зависит от внешней layout |
| `FOURTH-NB02` — `DATABASE_URL` выполнял только catalog | 8, 10; PostgreSQL runners | Внешний PostgreSQL 15+ выполняет тот же полный catalog/behavior/security lifecycle, что embedded runner | CI matrix 15+ получает эквивалентное доказательство |
| `FOURTH-NB03` — могли передаваться старые suffix-copies | 10; submission manifest | Exact canonical filenames и SHA-256 трёх артефактов фиксируются top-level manifest; mismatch отклоняется до review | Контролируемая передача DEVELOPMENT |

### 1.4. Change Log пятой проверки DEVELOPMENT от 2026-07-25

| DEVELOPMENT-блокер | Изменённые разделы и артефакты | Исправление | Влияние на gate |
| --- | --- | --- | --- |
| `FIFTH-B01` — недостоверная связь CT с evidence | 8, 10; `tests/evidence_matrix.mjs`, `run_evidence_self_tests.mjs`, full runner | Exact dependency matrix разрешает CT `PASS` только при наличии всех validator/service/PG results со статусом `PASS`; missing/renamed получает `NOT_RUN`, failed — `BLOCKED` | Ложноположительный report блокируется |
| `FIFTH-B02` — неполная DB validation event payload | 2, 4–5, 8; migration и PostgreSQL runner | Валидируются required/null, JSON type, UUID/RFC3339/SHA-256 format, integer range, enum, unknown fields и event-specific conditions. Для каждого из 33 типов выполняются 1 positive + 7 negative mutations | Malformed/untyped event не commit |
| `FIFTH-B03` — DLP был только декларативным | 5, 7–8, 10; migration, service и PostgreSQL tests | Runtime DLP сканирует payload/trace/metadata, отклоняет direct identifiers и forbidden keys с rollback; ошибка наружу не содержит обнаруженное значение | DLP evidence обязателен для synthetic gate |
| `FIFTH-B04` — caller Reveal context замещался | 3, 6, 8; Reveal model/tests | Любой supplied recipient/snapshot/manifest/lease/epoch/record/encounter отклоняется `LM-REVEAL-CONTEXT-UNTRUSTED`; authoritative values берутся только server-side | Fail-closed trust boundary |
| `FIFTH-B05` — token replay не различал same/new key | 3, 6–8; token model/tests | Redemption связан с token hash, key, request hash и immutable result; same key+payload replay безопасен, new key даёт `LM-REVEAL-TOKEN-USED`, payload conflict отклоняется; crash boundaries покрыты | Повторная выдача исключена |
| `FIFTH-B06` — `CT-024–CT-033` не исполняли заявленные сценарии | 5, 8, 10; service/PostgreSQL runners | Выполнены crypto-unlink, token-ID-only, full reason/owner/consumer matrix, forbidden human transition, composite Token→Attempt mismatch, UPDATE/DELETE шести immutable classes, RLS ordered pairs и shadow-object attack | Test IDs теперь имеют точное evidence |

### 1.5. Change Log шестой проверки DEVELOPMENT от 2026-07-26

| DEVELOPMENT-блокер | Изменённые разделы и артефакты | Исправление | Влияние на gate |
| --- | --- | --- | --- |
| `SIXTH-B01` — неполная DB validation RFC 3339/range/length | 2.1, 4–5, 8, 10; migration/PostgreSQL runner | Добавлена calendar-safe RFC 3339 validation, все payload minimum/maximum/minLength/maxLength/type/format/enum/const/pattern constraints и per-constrained-field mutation generator. Clean run: 33 positive + 1020 negative probes, каждый rejected row проверен на отсутствие | Exact DB validation подтверждается машинным evidence, а не фиксированным числом anchor mutations |
| `SIXTH-B02` — DLP пропускала нормализованные phone/passport | 5, 8, 10; service/DB classifier | `DLP_EVENT_CONTENT_V1` распознаёт `+7`, `8`, непрерывные цифры, пробелы, дефисы и скобки в payload/trace/metadata; corpus содержит 15 DB probes, safe diagnostic и rollback | Нормализованные прямые идентификаторы блокируются до outbox/telemetry commit |
| `SIXTH-B03` — неполный Reveal context denylist | 3, 6, 8; service model/tests | Введён positive allowlist внешних inputs; `encounter_id` и `introduction_record_id` вместе с остальным authoritative context отклоняются точным кодом до token lookup/Attempt/bytes | Молчаливое замещение attacker context исключено |
| `SIXTH-B04` — token redemption не создавал Attempt атомарно и доверял result hash | 5–8; migration/service/PostgreSQL suite | Сигнатура больше не принимает result/hash. SECURITY DEFINER transaction создаёт immutable Attempt, server-owned result и SHA-256, затем погашает token; same-key replay возвращает тот же Attempt. Выполнены rollback, two-connection race и failure injection до/после DB side effects | Token без Attempt и caller-controlled result невозможны |
| `SIXTH-B05` — CT semantic evidence оставалась шире probes | 4, 8, 10; AsyncAPI/evidence runners | Добавлены semantic evidence requirements/counters и self-tests. `PG-014` делает duplicate inbox insert; AsyncAPI содержит 33 routing rows; `PG-027` делает пять отдельных mismatches; `CT-024` проверяет exact retention tombstone allowlist | Missing/undersized evidence получает `BLOCKED`, даже если dependency ID присутствует и имеет `PASS` |

### 1.6. Change Log седьмой проверки DEVELOPMENT и corrective pass от 2026-08-20

| Блокер | Изменённые разделы и артефакты | Исправление | Влияние на gate |
| --- | --- | --- | --- |
| `SEVENTH-B01` — UUID contract разрешал версии 1–8 вместо только v4/v7 | 2.1, 4–5, 8, 10; OpenAPI/AsyncAPI/DB regex | Введён переиспользуемый `UuidV4OrV7` (`format: uuid` + pattern на version nibble `[47]`) во всех OpenAPI/AsyncAPI uuid-полях; DB `validate_event_payload` regex приведён к тому же диапазону. Positive v7 и negative v1/v2/v3/v5/v6/v8 probes на каждом uuid-поле | Запрещённые версии UUID отклоняются на всех трёх слоях |
| `SEVENTH-B02` — DLP-классификаторы значений расходились на нестандартных разделителях | 5, 8, 10; DDL/service classifier | Унифицирована normalize-стратегия значений (`normalize_dlp_scalar`, NFKC + digit-strip) в JS и PostgreSQL; единый golden corpus (51 malicious + 5 safe value vectors, полная 15-разделительная матрица) исполняется обоими слоями | Service/DB parity для VALUE-классификации подтверждена |
| `SEVENTH-B03` — `redeem_reveal_token` принимал `p_redeemed_at` от вызывающей стороны | 3, 5–8; migration/service/PostgreSQL suite | Параметр удалён из сигнатуры (5→4 аргумента); время редемпшна вычисляется один раз внутри транзакции после всех locks (`clock_timestamp()`) | Backdating погашения технически невозможен — параметра для этого больше нет |
| `SEVENTH-B04` — Redemption не блокировал guard/lease rows перед commit | 5, 8; `redeem_reveal_token`/`apply_safety_critical_invalidation` | Единый lock order (token → lease, упорядоченно → guard), зеркальный обеим операциям; race в обоих направлениях (invalidation-first, redemption-first) доказан two-connection тестами с barrier по `pg_stat_activity` | Устранена гонка redemption/invalidation |
| `SEVENTH-B05` — `CT-028` не проверял соответствие payload/schema фактическому `event_type` | 4, 8, 10; AsyncAPI/evidence runner | `resolveConsumerBinding` разрешает `consumer_operation → channel → message → payload schema → event_type` исключительно от routing table; 264 ordered mismatch probes, structural-indistinguishability guard, explicit negative swap self-test | Неверная маршрутизация обнаруживается машинно, а не только по существованию operation |
| `SEVENTH-B06` — `cryptoUnlink` принимал caller-supplied `deletion_act_hash` | 5, 7–8, 10; service model/evidence | Hash вычисляется server-side из domain-separated canonical preimage (`unlink_operation_id`, `deletion_category`, `policy_version`, `deleted_at`); caller-supplied значение никогда не читается. 6 caller-controlled-hash probes, independent recompute, hash-reuse probe | Запрещённый stable source hash не может быть сохранён как deletion-act hash |
| DLP forbidden-KEY parity, V1→V2 (corrective pass) | 5, 8, 10; DDL/service classifier/golden corpus | V1 (exact-match) заменён на `DLP_FORBIDDEN_KEY_MATCH_V2`: forbidden token ищется как substring нормализованного ключа, кроме закрытого нормативного allowlist (`previous_contact_decision_id`/`_version`, `previous_contact_policy_hash`/`_version` — exhaustively проверено по всем 128 schema field names). 112 case/evasion vectors, 8 composite/prefixed/suffixed vectors (`customer_email`, `contact_email` и др.), 4 allowlist-safe и 4 ordinary-safe controls, 0 parity mismatches | Composite/prefixed identifier keys (`customer_email`, `contact_email`, `user_phone`, `passport_data`, `bank_account`, `payment_card`, `delivery_address`, `full_name_value`) больше не обходят DLP |
| Controlled ZIP/manifest не отражали ни одно из вышеперечисленных исправлений | 8, 10; `contract-tests/v1.0/artifacts/` | Воспроизводимый packaging tool (`contract-tests/v1.0/tools/build_controlled_zip.mjs`) пересобирает ZIP из актуального `source/`; два последовательных запуска дают побайтово идентичный результат | Controlled set синхронизирован с рабочей копией; статус — `candidate for eighth DEVELOPMENT review`, не `APPROVED` |

Версия `1.0` и статус `Proposal for DEVELOPMENT review` не изменены. Продуктовая, юридическая и платёжная механика, а также `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` не затрагивались.

---

## 2. Общие типы и правила

### 2.1. Форматы

- идентификаторы: UUID v4 или UUID v7, строка `format: uuid`;
- timestamps: RFC 3339 с обязательным timezone designator; DB проверяет строгую форму, календарную допустимость и безопасное преобразование к `timestamptz`, поэтому `2026-99-99T99:99:99Z` и невозможные даты отклоняются;
- денежные суммы: целое число копеек, `int64`, валюта `RUB`;
- версии агрегатов: положительный `int64`, монотонный;
- hashes: lowercase SHA-256 hex, pattern `^[a-f0-9]{64}$`;
- schema versions: SemVer;
- все `minimum`, `maximum`, `minLength`, `maxLength`, `enum`, `const` и `pattern` применяются одинаково в AsyncAPI/JSON Schema и DB validator;
- unknown не кодируется как false или zero; используется `null` только где явно разрешено;
- command и event payload не содержат открытых/прямых идентификаторов, но ID и хеши классифицируются как pseudonymized personal data.

### 2.2. Enums

```yaml
RecordState:
  enum:
    - DRAFT
    - PRE_REVEAL_LOCKED
    - REVEAL_COMMITTED
    - REVEALED_ACTIVE
    - DISCLOSURE_DISPUTED
    - DISPUTED
    - EXPIRED
    - VOID_PRE_REVEAL
    - INVALIDATED_BY_DECISION

GateState:
  enum: [NOT_EVALUATED, BLOCKED, READY, INVALIDATED]

OperationState:
  enum:
    - PENDING
    - IN_PROGRESS
    - SUCCEEDED
    - FAILED_RETRYABLE
    - FAILED_FINAL
    - UNKNOWN

PaymentPath:
  enum: [DEBIT, CREDIT, MIXED]

FinancialEventType:
  enum:
    - PAYMENT_INTENT_CREATED
    - PAYMENT_AUTHORIZED
    - PAYMENT_AUTHORIZATION_RELEASED
    - ADVANCE_DEBIT_CONFIRMED
    - CREDIT_APPLIED
    - CREDIT_REVERSED
    - ADVANCE_RECEIPT_FISCALIZED
    - ADVANCE_SETTLED_AND_FISCALIZED
    - REFUND_CONFIRMED
    - FISCAL_CORRECTION_CONFIRMED
    - SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED
    - SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED
    - FINANCIAL_READINESS_INVALIDATED
    - FINAL_SETTLEMENT_FISCALIZED

DecisionType:
  enum:
    - DELIVERY_CONFIRMED_BY_DECISION
    - NO_DELIVERY_CONFIRMED_BY_DECISION
    - DISPUTE_REJECTED
    - DISPUTE_UPHELD
```

---

## 3. OpenAPI 3.1 — команды критической цепочки

```yaml
openapi: 3.1.0
info:
  title: LeaseMind Matching Critical Chain Commands
  version: 1.0.0
  license:
    name: LeaseMind Internal Proprietary
    identifier: LicenseRef-LeaseMind-Internal
servers:
  - url: https://synthetic.invalid/internal/v1
    description: Synthetic-only placeholder; production URL is prohibited
security:
  - serviceIdentity: []
paths:
  /payer-resolutions/{encounter_id}/assign:
    post:
      summary: Assign the single payer for an encounter
      operationId: assignPayer
      parameters:
        - $ref: '#/components/parameters/EncounterId'
        - $ref: '#/components/parameters/IdempotencyKey'
        - $ref: '#/components/parameters/ExpectedAggregateVersion'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/AssignPayerCommand'}
      responses:
        '200': {$ref: '#/components/responses/PayerResolution'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

  /participation/acceptances:
    post:
      summary: Record an immutable participation acceptance
      operationId: createParticipationAcceptance
      parameters:
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/CreateAcceptanceCommand'}
      responses:
        '201': {$ref: '#/components/responses/Acceptance'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

  /payments/advance-intents:
    post:
      summary: Create the pre-reveal advance payment intent
      operationId: createAdvanceIntent
      parameters:
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/CreateAdvanceIntentCommand'}
      responses:
        '201': {$ref: '#/components/responses/AdvanceIntent'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

  /payments/authorizations/{payment_intent_id}/release:
    post:
      summary: Release a payment authorization
      operationId: releaseAuthorization
      parameters:
        - $ref: '#/components/parameters/PaymentIntentId'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/ReleaseAuthorizationCommand'}
      responses:
        '200': {$ref: '#/components/responses/FinancialOperation'}
        '409': {$ref: '#/components/responses/Conflict'}

  /reveal-gate/snapshots:
    post:
      summary: Commit an immutable reveal-gate snapshot
      operationId: commitRevealSnapshot
      parameters:
        - $ref: '#/components/parameters/IdempotencyKey'
        - $ref: '#/components/parameters/ExpectedAggregateVersion'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/CommitRevealSnapshotCommand'}
      responses:
        '201': {$ref: '#/components/responses/RevealSnapshot'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

  /reveal/tokens:
    post:
      summary: Create an opaque reveal credential
      operationId: createRevealToken
      parameters:
        - $ref: '#/components/parameters/IdempotencyKey'
        - $ref: '#/components/parameters/ExpectedAggregateVersion'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/CreateRevealTokenCommand'}
      responses:
        '201': {$ref: '#/components/responses/RevealToken'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

  /reveal/tokens/redeem:
    post:
      summary: Redeem an opaque reveal credential
      operationId: redeemRevealToken
      parameters:
        - $ref: '#/components/parameters/RevealTokenCredential'
        - $ref: '#/components/parameters/IdempotencyKey'
      responses:
        '200':
          description: Delivery attempt accepted; recipient, snapshot, manifest, epoch and leases are resolved and validated server-side before protected bytes
          content:
            application/json:
              schema: {$ref: '#/components/schemas/RevealAttemptResult'}
        '409': {$ref: '#/components/responses/Conflict'}
        '410':
          description: Token or any source-owned lease expired
          content:
            application/problem+json:
              schema: {$ref: '#/components/schemas/Problem'}

  /introduction-records/{introduction_record_id}/delivery-evidence:
    post:
      summary: Submit evidence of reveal delivery
      operationId: submitDeliveryEvidence
      parameters:
        - $ref: '#/components/parameters/IntroductionRecordId'
        - $ref: '#/components/parameters/IdempotencyKey'
        - $ref: '#/components/parameters/ExpectedAggregateVersion'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/SubmitDeliveryEvidenceCommand'}
      responses:
        '200': {$ref: '#/components/responses/IntroductionRecord'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

  /disputes/{dispute_id}/decisions:
    post:
      summary: Record an immutable dispute decision
      operationId: recordDisputeDecision
      parameters:
        - $ref: '#/components/parameters/DisputeId'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/RecordDecisionCommand'}
      responses:
        '201': {$ref: '#/components/responses/Decision'}
        '409': {$ref: '#/components/responses/Conflict'}
        '422': {$ref: '#/components/responses/Rejected'}

components:
  securitySchemes:
    serviceIdentity:
      type: mutualTLS

  parameters:
    EncounterId:
      name: encounter_id
      in: path
      required: true
      schema: {$ref: '#/components/schemas/UuidV4OrV7'}
    PaymentIntentId:
      name: payment_intent_id
      in: path
      required: true
      schema: {$ref: '#/components/schemas/UuidV4OrV7'}
    RevealTokenCredential:
      name: Reveal-Token
      in: header
      required: true
      description: Opaque one-time bearer credential returned once at token creation; UUID metadata never authorizes redemption; gateway and application logs MUST redact this header
      schema: {type: string, minLength: 32, maxLength: 512}
    IntroductionRecordId:
      name: introduction_record_id
      in: path
      required: true
      schema: {$ref: '#/components/schemas/UuidV4OrV7'}
    DisputeId:
      name: dispute_id
      in: path
      required: true
      schema: {$ref: '#/components/schemas/UuidV4OrV7'}
    IdempotencyKey:
      name: Idempotency-Key
      in: header
      required: true
      schema: {type: string, minLength: 16, maxLength: 128}
    ExpectedAggregateVersion:
      name: If-Match-Version
      in: header
      required: true
      schema: {type: integer, format: int64, minimum: 0}

  schemas:
    UuidV4OrV7:
      type: string
      format: uuid
      pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[47][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    AssignPayerCommand:
      type: object
      additionalProperties: false
      required:
        - encounter_id
        - match_pair_id
        - payer_party_id
        - payer_campaign_id
        - assignment_rule_version
        - accepted_event_id
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        match_pair_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_campaign_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        assignment_rule_version: {type: string, minLength: 1}
        accepted_event_id: {$ref: '#/components/schemas/UuidV4OrV7'}

    CreateAcceptanceCommand:
      type: object
      additionalProperties: false
      required:
        - encounter_id
        - match_id
        - party_id
        - party_role
        - payer_party_id
        - payer_campaign_id
        - identity_version
        - identity_method
        - identity_evidence_ref
        - authority_version
        - authority_status
        - authority_evidence_ref
        - terms_version
        - terms_hash
        - consent_version
        - consent_hash
        - payer_notice_version
        - confirmed_account_id
        - signature_operation_id
        - signed_action
        - signature_verification_result
        - signature_evidence_ref
        - accepted_at
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        match_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        party_role: {type: string, enum: [PAYER, NON_PAYER]}
        payer_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_campaign_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        identity_version: {type: integer, format: int64, minimum: 1}
        identity_method: {type: string, minLength: 1, maxLength: 64}
        identity_evidence_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
        authority_version: {type: integer, format: int64, minimum: 1}
        authority_status: {type: string, enum: [VERIFIED, NOT_REQUIRED]}
        authority_evidence_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
        terms_version: {type: string, minLength: 1}
        terms_hash: {$ref: '#/components/schemas/Sha256'}
        consent_version: {type: string, minLength: 1}
        consent_hash: {$ref: '#/components/schemas/Sha256'}
        payer_notice_version: {type: string, minLength: 1}
        confirmed_account_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        signature_operation_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        signed_action: {type: string, minLength: 1, maxLength: 128}
        signature_verification_result: {const: VERIFIED}
        signature_evidence_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
        accepted_at: {type: string, format: date-time}

    CreateAdvanceIntentCommand:
      type: object
      additionalProperties: false
      required:
        - encounter_id
        - payer_party_id
        - payer_assignment_version
        - fencing_token
        - payment_path
        - total_amount_minor
        - credit_amount_minor
        - debit_amount_minor
        - currency
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_assignment_version: {type: integer, format: int64, minimum: 1}
        fencing_token: {type: integer, format: int64, minimum: 1}
        payment_path: {$ref: '#/components/schemas/PaymentPath'}
        total_amount_minor: {const: 1000000}
        credit_amount_minor: {type: integer, format: int64, minimum: 0, maximum: 1000000}
        debit_amount_minor: {type: integer, format: int64, minimum: 0, maximum: 1000000}
        currency: {const: RUB}
      allOf:
        - description: credit_amount_minor + debit_amount_minor MUST equal total_amount_minor; enforced by service and DDL

    ReleaseAuthorizationCommand:
      type: object
      additionalProperties: false
      required: [encounter_id, party_id, reason_code, payer_assignment_version]
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        reason_code: {enum: [SECOND_PARTY_NOT_PAYER, PAYER_ASSIGNMENT_CHANGED, PRE_REVEAL_VOID]}
        payer_assignment_version: {type: integer, format: int64, minimum: 1}

    SourceLease:
      type: object
      additionalProperties: false
      required:
        - lease_id
        - source_system
        - aggregate_id
        - source_version
        - fencing_token
        - issued_at
        - expires_at
        - lease_state
      properties:
        lease_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        source_system:
          enum:
            - PARTICIPATION_SERVICE
            - PAYER_RESOLUTION
            - PREVIOUS_CONTACT_DECISION
            - PAYMENT_FISCAL_LEDGER
            - IDENTITY_AUTHORITY_REGISTRY
            - LAWFUL_BASIS_CONSENT_REGISTRY
        aggregate_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        source_version: {type: integer, format: int64, minimum: 1}
        fencing_token: {type: integer, format: int64, minimum: 1}
        issued_at: {type: string, format: date-time}
        expires_at: {type: string, format: date-time}
        lease_state: {const: ACTIVE}

    CommitRevealSnapshotCommand:
      type: object
      additionalProperties: false
      required:
        - introduction_record_id
        - encounter_id
        - match_pair_id
        - match_id
        - campaign_ids
        - campaign_versions
        - payer_party_id
        - payer_assignment_version
        - parties
        - previous_contact_decision_id
        - previous_contact_decision_version
        - previous_contact_policy_version
        - previous_contact_policy_hash
        - advance_ledger_version
        - advance_receipt_id
        - financial_exposure_version
        - record_version
        - reveal_guard_epoch
        - source_leases
        - manifest_hash
        - delivery_policy_version
        - delivery_policy_hash
      properties:
        introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        match_pair_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        match_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        campaign_ids:
          type: array
          minItems: 1
          maxItems: 2
          uniqueItems: true
          items: {$ref: '#/components/schemas/UuidV4OrV7'}
        campaign_versions:
          type: array
          minItems: 1
          maxItems: 2
          items: {type: integer, format: int64, minimum: 1}
        payer_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_assignment_version: {type: integer, format: int64, minimum: 1}
        parties:
          type: array
          minItems: 2
          maxItems: 2
          uniqueItems: true
          items: {$ref: '#/components/schemas/SnapshotPartyBinding'}
          description: Exactly one OWNER and one TENANT binding; the handler and deferred DDL constraints enforce exact role and party equality with the Introduction Record.
        previous_contact_decision_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        previous_contact_decision_version: {type: integer, format: int64, minimum: 1}
        previous_contact_policy_version: {type: string, minLength: 1}
        previous_contact_policy_hash: {$ref: '#/components/schemas/Sha256'}
        advance_ledger_version: {type: integer, format: int64, minimum: 1}
        advance_receipt_id: {type: string, minLength: 1}
        financial_exposure_version: {type: integer, format: int64, minimum: 1}
        record_version: {type: integer, format: int64, minimum: 1}
        reveal_guard_epoch: {type: integer, format: int64, minimum: 1}
        source_leases:
          type: array
          minItems: 6
          maxItems: 6
          uniqueItems: true
          items: {$ref: '#/components/schemas/SourceLease'}
          description: Exactly one lease for each SourceLease.source_system enum value; enforced by handler and DDL normalized snapshot-source relation
        manifest_hash: {$ref: '#/components/schemas/Sha256'}
        delivery_policy_version: {type: string, minLength: 1}
        delivery_policy_hash: {$ref: '#/components/schemas/Sha256'}

    SnapshotPartyBinding:
      type: object
      additionalProperties: false
      required:
        - party_id
        - party_role
        - acceptance_record_id
        - acceptance_version
        - terms_hash
        - identity_authority_version
        - lawful_basis_id
        - lawful_basis_version
      properties:
        party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        party_role: {type: string, enum: [OWNER, TENANT]}
        acceptance_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        acceptance_version: {type: integer, format: int64, minimum: 1}
        terms_hash: {$ref: '#/components/schemas/Sha256'}
        identity_authority_version: {type: integer, format: int64, minimum: 1}
        lawful_basis_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        lawful_basis_version: {type: integer, format: int64, minimum: 1}

    CreateRevealTokenCommand:
      type: object
      additionalProperties: false
      required:
        - introduction_record_id
        - recipient_party_id
        - reveal_gate_snapshot_id
        - manifest_hash
        - expires_at
      properties:
        introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        recipient_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        reveal_gate_snapshot_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        manifest_hash: {$ref: '#/components/schemas/Sha256'}
        expires_at: {type: string, format: date-time}
      description: Internal mTLS command. Reveal Service MUST resolve snapshot hash, guard epoch and six leases from its trusted projection and MUST verify recipient against Introduction Record. No caller-supplied lease is authoritative.

    SubmitDeliveryEvidenceCommand:
      type: object
      additionalProperties: false
      required:
        - reveal_attempt_id
        - encounter_id
        - recipient_party_id
        - reveal_gate_snapshot_id
        - manifest_hash
        - evidence_manifest_hash
        - delivery_policy_version
        - delivery_policy_hash
        - attempted_at
        - evidence_classification
      properties:
        reveal_attempt_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        recipient_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        reveal_gate_snapshot_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        manifest_hash: {$ref: '#/components/schemas/Sha256'}
        evidence_manifest_hash: {$ref: '#/components/schemas/Sha256'}
        delivery_policy_version: {type: string}
        delivery_policy_hash: {$ref: '#/components/schemas/Sha256'}
        attempted_at: {type: string, format: date-time}
        established_delivery_at:
          type: string
          format: date-time
          description: First proven sufficient delivery instant; required only for SUFFICIENT evidence
        evidence_classification: {enum: [SUFFICIENT, PARTIAL, CONTRADICTORY, ABSENT]}
      allOf:
        - if:
            properties:
              evidence_classification: {const: SUFFICIENT}
            required: [evidence_classification]
          then:
            properties:
              established_delivery_at:
                type: string
                format: date-time
            required: [established_delivery_at]
          else:
            not:
              required: [established_delivery_at]

    RecordDecisionCommand:
      type: object
      additionalProperties: false
      required:
        - dispute_id
        - introduction_record_id
        - decision_type
        - reviewer_id
        - reviewer_role
        - appointment_id
        - conflict_check_id
        - policy_version
        - policy_hash
        - evidence_bundle_hash
        - decision_order
        - decided_at
      properties:
        dispute_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        decision_type: {$ref: '#/components/schemas/DecisionType'}
        reviewer_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        reviewer_role: {type: string}
        appointment_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        conflict_check_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        policy_version: {type: string}
        policy_hash: {$ref: '#/components/schemas/Sha256'}
        evidence_bundle_hash: {$ref: '#/components/schemas/Sha256'}
        established_delivery_at:
          type: string
          format: date-time
          description: Required only for DELIVERY_CONFIRMED_BY_DECISION; the proven first sufficient delivery instant, not decision time
        second_level_approver_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        financial_consequence_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
        appeal_status: {type: string, enum: [NOT_APPEALED, APPEALED, FINAL]}
        decision_order: {type: integer, format: int64, minimum: 1}
        decided_at: {type: string, format: date-time}
      allOf:
        - if:
            properties:
              decision_type: {const: DELIVERY_CONFIRMED_BY_DECISION}
            required: [decision_type]
          then:
            properties:
              established_delivery_at:
                type: string
                format: date-time
            required: [established_delivery_at]

    PaymentPath:
      type: string
      enum: [DEBIT, CREDIT, MIXED]
    DecisionType:
      type: string
      enum:
        - DELIVERY_CONFIRMED_BY_DECISION
        - NO_DELIVERY_CONFIRMED_BY_DECISION
        - DISPUTE_REJECTED
        - DISPUTE_UPHELD
    Sha256:
      type: string
      pattern: '^[a-f0-9]{64}$'
    Problem:
      type: object
      additionalProperties: false
      required: [type, title, status, code, correlation_id, retryable]
      properties:
        type: {type: string, format: uri}
        title: {type: string}
        status: {type: integer}
        code: {type: string}
        correlation_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        retryable: {type: boolean}
    RevealAttemptResult:
      type: object
      required: [reveal_attempt_id, operation_state, evidence_submission_required]
      properties:
        reveal_attempt_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        operation_state: {enum: [IN_PROGRESS, SUCCEEDED, UNKNOWN]}
        evidence_submission_required: {const: true}

  responses:
    PayerResolution:
      description: Current payer assignment and aggregate version
      content:
        application/json:
          schema:
            type: object
            required: [payer_resolution_aggregate_id, payer_party_id, payer_campaign_id, payer_assignment_version]
            properties:
              payer_resolution_aggregate_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              payer_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              payer_campaign_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              payer_assignment_version: {type: integer, format: int64}
    Acceptance:
      description: Immutable acceptance record
      content:
        application/json:
          schema:
            type: object
            required: [acceptance_record_id, aggregate_version]
            properties:
              acceptance_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              aggregate_version: {type: integer, format: int64}
    AdvanceIntent:
      description: Advance intent
      content:
        application/json:
          schema:
            type: object
            required: [payment_intent_id, payment_path, operation_state]
            properties:
              payment_intent_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              payment_path: {$ref: '#/components/schemas/PaymentPath'}
              operation_state: {enum: [PENDING, IN_PROGRESS, SUCCEEDED, UNKNOWN]}
    FinancialOperation:
      description: Idempotent financial operation result
      content:
        application/json:
          schema:
            type: object
            required: [financial_event_id, event_type, operation_state]
            properties:
              financial_event_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              event_type: {type: string}
              operation_state: {type: string}
    RevealSnapshot:
      description: Committed reveal snapshot
      content:
        application/json:
          schema:
            type: object
            required: [reveal_gate_snapshot_id, snapshot_hash, valid_until, fencing_token, aggregate_version]
            properties:
              reveal_gate_snapshot_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              snapshot_hash: {$ref: '#/components/schemas/Sha256'}
              valid_until: {type: string, format: date-time}
              fencing_token: {type: integer, format: int64}
              aggregate_version: {type: integer, format: int64}
    RevealToken:
      description: One-time purpose-bound token metadata; the raw token is returned only once and is never stored
      content:
        application/json:
          schema:
            type: object
            additionalProperties: false
            required: [reveal_token_id, reveal_token, reveal_gate_snapshot_id, recipient_party_id, expires_at]
            properties:
              reveal_token_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              reveal_token: {type: string, minLength: 32, maxLength: 512}
              reveal_gate_snapshot_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              recipient_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              expires_at: {type: string, format: date-time}
    IntroductionRecord:
      description: Current record state
      content:
        application/json:
          schema:
            type: object
            required: [introduction_record_id, record_state, aggregate_version]
            properties:
              introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              record_state:
                enum:
                  - REVEAL_COMMITTED
                  - REVEALED_ACTIVE
                  - DISCLOSURE_DISPUTED
                  - DISPUTED
                  - EXPIRED
                  - VOID_PRE_REVEAL
                  - INVALIDATED_BY_DECISION
              aggregate_version: {type: integer, format: int64}
    Decision:
      description: Immutable decision record
      content:
        application/json:
          schema:
            type: object
            required: [decision_id, decision_type, created_at]
            properties:
              decision_id: {$ref: '#/components/schemas/UuidV4OrV7'}
              decision_type: {$ref: '#/components/schemas/DecisionType'}
              created_at: {type: string, format: date-time}
    Conflict:
      description: Version, lease, payer or state conflict
      content:
        application/problem+json:
          schema: {$ref: '#/components/schemas/Problem'}
    Rejected:
      description: Domain guard rejected
      content:
        application/problem+json:
          schema: {$ref: '#/components/schemas/Problem'}
```

---

## 4. AsyncAPI и event envelope

Файл `asyncapi.yaml` является исполнимым источником. Extension `x-leasemind-event-routing` содержит ровно 33 явные строки с `event_type`, `owner_role`, `producer` и `consumer_operation`. Contract suite подтверждает, что каждая receive operation существует, ссылается на channel и соответствует типизированному payload; общий channel без конкретного routing row не является достаточным evidence.

```yaml
asyncapi: 3.0.0
info:
  title: LeaseMind Matching Critical Chain Events
  version: 1.0.0
defaultContentType: application/json
channels:
  payerResolution:
    address: payer-resolution.{encounter_id}
    parameters:
      encounter_id:
        description: Canonical encounter UUID; value is resolved from the typed message payload
        location: $message.payload#/payload/encounter_id
    messages:
      payerAssigned: {$ref: '#/components/messages/PayerAssigned'}
  participation:
    address: participation.{encounter_id}
    parameters:
      encounter_id:
        description: Canonical encounter UUID
        location: $message.payload#/payload/encounter_id
    messages:
      acceptanceChanged: {$ref: '#/components/messages/AcceptanceChanged'}
  identityAuthority:
    address: identity-authority.{party_id}
    parameters:
      party_id:
        description: Pseudonymous party UUID
        location: $message.payload#/payload/party_id
    messages:
      identityAuthorityChanged: {$ref: '#/components/messages/IdentityAuthorityChanged'}
  lawfulBasis:
    address: lawful-basis.{party_id}
    parameters:
      party_id:
        description: Pseudonymous party UUID
        location: $message.payload#/payload/party_id
    messages:
      lawfulBasisChanged: {$ref: '#/components/messages/LawfulBasisChanged'}
  previousContact:
    address: previous-contact.{encounter_id}
    parameters:
      encounter_id:
        description: Canonical encounter UUID
        location: $message.payload#/payload/encounter_id
    messages:
      previousContactChanged: {$ref: '#/components/messages/PreviousContactChanged'}
  financial:
    address: financial.{encounter_id}
    parameters:
      encounter_id:
        description: Canonical encounter UUID
        location: $message.payload#/payload/encounter_id
    messages:
      financialFact: {$ref: '#/components/messages/FinancialFact'}
  introductionRecord:
    address: introduction-record.{introduction_record_id}
    parameters:
      introduction_record_id:
        description: Introduction Record UUID
        location: $message.payload#/payload/introduction_record_id
    messages:
      recordTransitioned: {$ref: '#/components/messages/RecordTransitioned'}
  revealEvidence:
    address: reveal-evidence.{introduction_record_id}
    parameters:
      introduction_record_id:
        description: Introduction Record UUID
        location: $message.payload#/payload/introduction_record_id
    messages:
      evidenceSubmitted: {$ref: '#/components/messages/EvidenceSubmitted'}
  decisions:
    address: decisions.{introduction_record_id}
    parameters:
      introduction_record_id:
        description: Introduction Record UUID
        location: $message.payload#/payload/introduction_record_id
    messages:
      decisionRecorded: {$ref: '#/components/messages/DecisionRecorded'}
operations:
  consumePayerAssigned:
    action: receive
    channel: {$ref: '#/channels/payerResolution'}
  consumeAcceptanceChanged:
    action: receive
    channel: {$ref: '#/channels/participation'}
  consumeIdentityAuthorityChanged:
    action: receive
    channel: {$ref: '#/channels/identityAuthority'}
  consumeLawfulBasisChanged:
    action: receive
    channel: {$ref: '#/channels/lawfulBasis'}
  consumePreviousContactChanged:
    action: receive
    channel: {$ref: '#/channels/previousContact'}
  consumeFinancialFact:
    action: receive
    channel: {$ref: '#/channels/financial'}
  consumeRecordTransitioned:
    action: receive
    channel: {$ref: '#/channels/introductionRecord'}
  consumeEvidenceSubmitted:
    action: receive
    channel: {$ref: '#/channels/revealEvidence'}
  consumeDecisionRecorded:
    action: receive
    channel: {$ref: '#/channels/decisions'}
x-leasemind-event-routing:
  - {event_type: PAYER_ASSIGNED, owner_role: leasemind_payer_writer, producer: payer-resolution, consumer_operation: consumePayerAssigned}
  - {event_type: PAYER_RESOLUTION_REQUIRED, owner_role: leasemind_payer_writer, producer: payer-resolution, consumer_operation: consumePayerAssigned}
  - {event_type: PARTICIPATION_ACCEPTED, owner_role: leasemind_participation_writer, producer: participation, consumer_operation: consumeAcceptanceChanged}
  - {event_type: PARTICIPATION_INVALIDATED, owner_role: leasemind_participation_writer, producer: participation, consumer_operation: consumeAcceptanceChanged}
  - {event_type: IDENTITY_AUTHORITY_INVALIDATED, owner_role: leasemind_identity_authority_writer, producer: identity-authority-registry, consumer_operation: consumeIdentityAuthorityChanged}
  - {event_type: LAWFUL_BASIS_INVALIDATED, owner_role: leasemind_lawful_basis_writer, producer: lawful-basis-consent-registry, consumer_operation: consumeLawfulBasisChanged}
  - {event_type: LAWFUL_BASIS_REVOKED, owner_role: leasemind_lawful_basis_writer, producer: lawful-basis-consent-registry, consumer_operation: consumeLawfulBasisChanged}
  - {event_type: PREVIOUS_CONTACT_DECISION_CHANGED, owner_role: leasemind_previous_contact_writer, producer: legal-decision, consumer_operation: consumePreviousContactChanged}
  - {event_type: PAYMENT_AUTHORIZED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: PAYMENT_AUTHORIZATION_RELEASED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: ADVANCE_DEBIT_CONFIRMED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: CREDIT_APPLIED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: CREDIT_REVERSED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: ADVANCE_RECEIPT_FISCALIZED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: ADVANCE_SETTLED_AND_FISCALIZED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: REFUND_CONFIRMED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: FISCAL_CORRECTION_CONFIRMED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: FINANCIAL_READINESS_INVALIDATED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: FINAL_SETTLEMENT_FISCALIZED, owner_role: leasemind_financial_writer, producer: payment-fiscal-ledger, consumer_operation: consumeFinancialFact}
  - {event_type: RECORD_PRE_REVEAL_LOCKED, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: PRE_REVEAL_VOIDED, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: REVEAL_COMMITTED, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: REVEAL_DELIVERY_CONFIRMED, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: REVEAL_DELIVERY_UNCERTAIN, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: DISCLOSURE_CHALLENGED, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: PROTECTION_END_REACHED, owner_role: leasemind_introduction_writer, producer: introduction-record-service, consumer_operation: consumeRecordTransitioned}
  - {event_type: REVEAL_DELIVERY_EVIDENCE_SUBMITTED, owner_role: leasemind_reveal_writer, producer: reveal-service, consumer_operation: consumeEvidenceSubmitted}
  - {event_type: DELIVERY_CONFIRMED_BY_DECISION, owner_role: leasemind_previous_contact_writer, producer: legal-decision, consumer_operation: consumeDecisionRecorded}
  - {event_type: NO_DELIVERY_CONFIRMED_BY_DECISION, owner_role: leasemind_previous_contact_writer, producer: legal-decision, consumer_operation: consumeDecisionRecorded}
  - {event_type: DISPUTE_REJECTED, owner_role: leasemind_previous_contact_writer, producer: legal-decision, consumer_operation: consumeDecisionRecorded}
  - {event_type: DISPUTE_UPHELD, owner_role: leasemind_previous_contact_writer, producer: legal-decision, consumer_operation: consumeDecisionRecorded}
components:
  messages:
    PayerAssigned:
      payload: {$ref: '#/components/schemas/PayerEventEnvelope'}
    AcceptanceChanged:
      payload: {$ref: '#/components/schemas/ParticipationEventEnvelope'}
    IdentityAuthorityChanged:
      payload: {$ref: '#/components/schemas/IdentityAuthorityEventEnvelope'}
    LawfulBasisChanged:
      payload: {$ref: '#/components/schemas/LawfulBasisEventEnvelope'}
    PreviousContactChanged:
      payload: {$ref: '#/components/schemas/PreviousContactEventEnvelope'}
    FinancialFact:
      payload: {$ref: '#/components/schemas/FinancialEventEnvelope'}
    RecordTransitioned:
      payload: {$ref: '#/components/schemas/RecordEventEnvelope'}
    EvidenceSubmitted:
      payload: {$ref: '#/components/schemas/EvidenceEventEnvelope'}
    DecisionRecorded:
      payload: {$ref: '#/components/schemas/DecisionEventEnvelope'}
  schemas:
    UuidV4OrV7:
      type: string
      format: uuid
      pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[47][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    EventEnvelopeBase:
      type: object
      required:
        - event_id
        - schema_version
        - aggregate_id
        - aggregate_version
        - occurred_at
        - producer
        - correlation_id
        - causation_id
        - trace_id
        - idempotency_key
        - payload_hash
        - data_classification
      properties:
        event_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        schema_version: {type: string, pattern: '^[0-9]+\.[0-9]+\.[0-9]+$'}
        aggregate_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        aggregate_version: {type: integer, format: int64, minimum: 1}
        occurred_at: {type: string, format: date-time}
        producer: {type: string, minLength: 1}
        correlation_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        causation_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        trace_id: {type: string, minLength: 16, maxLength: 64}
        idempotency_key: {type: string, minLength: 16, maxLength: 128}
        payload_hash: {type: string, pattern: '^[a-f0-9]{64}$'}
        data_classification:
          const: PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS

    RecordState:
      type: string
      enum: [DRAFT, PRE_REVEAL_LOCKED, REVEAL_COMMITTED, REVEALED_ACTIVE, DISCLOSURE_DISPUTED, DISPUTED, EXPIRED, VOID_PRE_REVEAL, INVALIDATED_BY_DECISION]

    PayerEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              enum: [PAYER_ASSIGNED, PAYER_RESOLUTION_REQUIRED]
            payload: {$ref: '#/components/schemas/PayerEventPayload'}
    PayerEventPayload:
      type: object
      additionalProperties: false
      required: [encounter_id, match_pair_id, resolution_state, payer_assignment_version]
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        match_pair_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        resolution_state: {enum: [ASSIGNED, PAYER_RESOLUTION_REQUIRED]}
        payer_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_campaign_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_assignment_version: {type: integer, format: int64, minimum: 0}
        reason_code: {enum: [FIRST_VERIFIED_ACCEPTANCE, PAYER_ASSIGNMENT_CHANGED, CONCURRENT_ORDER_UNPROVABLE]}

    ParticipationEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              enum: [PARTICIPATION_ACCEPTED, PARTICIPATION_INVALIDATED]
            payload: {$ref: '#/components/schemas/ParticipationEventPayload'}
    ParticipationEventPayload:
      type: object
      additionalProperties: false
      required: [encounter_id, match_id, acceptance_record_id, party_id, acceptance_aggregate_version, acceptance_status]
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        match_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        acceptance_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        acceptance_aggregate_version: {type: integer, format: int64, minimum: 1}
        acceptance_status: {enum: [ACCEPTED, SUPERSEDED, INVALIDATED]}
        reason_code:
          enum: [USER_REVOKED, TERMS_VERSION_CHANGED, PAYER_REACCEPTANCE_REQUIRED, IDENTITY_AUTHORITY_CHANGED, ACCEPTANCE_SUPERSEDED]

    IdentityAuthorityEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              const: IDENTITY_AUTHORITY_INVALIDATED
            payload: {$ref: '#/components/schemas/IdentityAuthorityEventPayload'}
    IdentityAuthorityEventPayload:
      type: object
      additionalProperties: false
      required: [party_id, identity_authority_version, reason_code, effective_at]
      properties:
        party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        identity_authority_version: {type: integer, format: int64, minimum: 1}
        reason_code: {enum: [IDENTITY_INVALIDATED, AUTHORITY_INVALIDATED, AUTHORITY_EXPIRED]}
        effective_at: {type: string, format: date-time}

    LawfulBasisEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              enum: [LAWFUL_BASIS_INVALIDATED, LAWFUL_BASIS_REVOKED]
            payload: {$ref: '#/components/schemas/LawfulBasisEventPayload'}
    LawfulBasisEventPayload:
      type: object
      additionalProperties: false
      required: [party_id, lawful_basis_id, purpose_code, lawful_basis_version, reason_code, effective_at]
      properties:
        party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        lawful_basis_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        purpose_code: {type: string, maxLength: 64}
        lawful_basis_version: {type: integer, format: int64, minimum: 1}
        reason_code: {enum: [INVALIDATED, REVOKED, EXPIRED, PROCESSING_PURPOSE_CHANGED]}
        effective_at: {type: string, format: date-time}

    PreviousContactEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              const: PREVIOUS_CONTACT_DECISION_CHANGED
            payload: {$ref: '#/components/schemas/PreviousContactEventPayload'}
    PreviousContactEventPayload:
      type: object
      additionalProperties: false
      required: [encounter_id, previous_contact_decision_id, previous_contact_decision_version, decision_status, reason_code, effective_at]
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        previous_contact_decision_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        previous_contact_decision_version: {type: integer, format: int64, minimum: 1}
        decision_status: {enum: [NO_PREVIOUS_CONTACT_CONFIRMED, PREVIOUS_CONTACT_CONFIRMED, UNDER_REVIEW, INCONCLUSIVE]}
        reason_code: {enum: [DECISION_CREATED, EVIDENCE_ADDED, DECISION_REOPENED, DECISION_INVALIDATED]}
        policy_version: {type: string, minLength: 1}
        policy_hash: {type: string, pattern: '^[a-f0-9]{64}$'}
        effective_at: {type: string, format: date-time}

    FinancialEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              enum:
                - PAYMENT_AUTHORIZED
                - PAYMENT_AUTHORIZATION_RELEASED
                - ADVANCE_DEBIT_CONFIRMED
                - CREDIT_APPLIED
                - CREDIT_REVERSED
                - ADVANCE_RECEIPT_FISCALIZED
                - ADVANCE_SETTLED_AND_FISCALIZED
                - REFUND_CONFIRMED
                - FISCAL_CORRECTION_CONFIRMED
                - SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED
                - SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED
                - FINANCIAL_READINESS_INVALIDATED
                - FINAL_SETTLEMENT_FISCALIZED
            payload: {$ref: '#/components/schemas/FinancialEventPayload'}
    FinancialEventPayload:
      type: object
      additionalProperties: false
      required: [encounter_id, financial_event_id, payment_path, amount_minor, currency]
      properties:
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payment_intent_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        financial_event_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payment_path: {enum: [DEBIT, CREDIT, MIXED]}
        amount_minor: {type: integer, format: int64, minimum: 0, maximum: 1000000}
        currency: {const: RUB}
        provider_operation_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
        receipt_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
        credit_application_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        payer_assignment_version: {type: integer, format: int64, minimum: 1}
        reason_code: {enum: [PROVIDER_RECONCILIATION_MISMATCH, KKT_OFD_RECONCILIATION_MISMATCH, CREDIT_REVERSED, SECOND_PARTY_EXPOSURE_CHANGED, REFUND_AND_CORRECTION_COMPLETED]}

    RecordEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              enum: [RECORD_PRE_REVEAL_LOCKED, PRE_REVEAL_VOIDED, REVEAL_COMMITTED, REVEAL_DELIVERY_CONFIRMED, REVEAL_DELIVERY_UNCERTAIN, DISCLOSURE_CHALLENGED, PROTECTION_END_REACHED]
            payload: {$ref: '#/components/schemas/RecordEventPayload'}
          oneOf:
            - properties:
                event_type: {const: RECORD_PRE_REVEAL_LOCKED}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - properties:
                        from_state: {const: DRAFT}
                        to_state: {const: PRE_REVEAL_LOCKED}
            - properties:
                event_type: {const: PRE_REVEAL_VOIDED}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - properties:
                        from_state: {enum: [DRAFT, PRE_REVEAL_LOCKED, DISCLOSURE_DISPUTED]}
                        to_state: {const: VOID_PRE_REVEAL}
            - properties:
                event_type: {const: REVEAL_COMMITTED}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - properties:
                        from_state: {const: PRE_REVEAL_LOCKED}
                        to_state: {const: REVEAL_COMMITTED}
            - properties:
                event_type: {const: REVEAL_DELIVERY_CONFIRMED}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - required: [established_delivery_at, protection_starts_at, protection_ends_at]
                      properties:
                        from_state: {const: REVEAL_COMMITTED}
                        to_state: {const: REVEALED_ACTIVE}
            - properties:
                event_type: {const: REVEAL_DELIVERY_UNCERTAIN}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - properties:
                        from_state: {const: REVEAL_COMMITTED}
                        to_state: {const: DISCLOSURE_DISPUTED}
            - properties:
                event_type: {const: DISCLOSURE_CHALLENGED}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - properties:
                        from_state: {const: REVEALED_ACTIVE}
                        to_state: {const: DISPUTED}
            - properties:
                event_type: {const: PROTECTION_END_REACHED}
                payload:
                  allOf:
                    - {$ref: '#/components/schemas/RecordEventPayload'}
                    - properties:
                        from_state: {const: REVEALED_ACTIVE}
                        to_state: {const: EXPIRED}
    RecordEventPayload:
      type: object
      additionalProperties: false
      required: [introduction_record_id, encounter_id, from_state, to_state]
      properties:
        introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        from_state: {$ref: '#/components/schemas/RecordState'}
        to_state: {$ref: '#/components/schemas/RecordState'}
        reveal_gate_snapshot_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        established_delivery_at: {type: string, format: date-time}
        protection_starts_at: {type: string, format: date-time}
        protection_ends_at: {type: string, format: date-time}

    EvidenceEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              const: REVEAL_DELIVERY_EVIDENCE_SUBMITTED
            payload: {$ref: '#/components/schemas/EvidenceEventPayload'}
    EvidenceEventPayload:
      type: object
      additionalProperties: false
      required: [reveal_attempt_id, introduction_record_id, encounter_id, recipient_party_id, reveal_gate_snapshot_id, manifest_hash, evidence_manifest_hash, evidence_classification, attempted_at]
      properties:
        reveal_attempt_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        encounter_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        recipient_party_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        reveal_gate_snapshot_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        manifest_hash: {type: string, pattern: '^[a-f0-9]{64}$'}
        evidence_manifest_hash: {type: string, pattern: '^[a-f0-9]{64}$'}
        evidence_classification: {enum: [SUFFICIENT, PARTIAL, CONTRADICTORY, ABSENT]}
        attempted_at: {type: string, format: date-time}
        established_delivery_at: {type: string, format: date-time}
      allOf:
        - if:
            properties:
              evidence_classification: {const: SUFFICIENT}
            required: [evidence_classification]
          then:
            required: [established_delivery_at]
          else:
            not:
              required: [established_delivery_at]

    DecisionEventEnvelope:
      unevaluatedProperties: false
      allOf:
        - {$ref: '#/components/schemas/EventEnvelopeBase'}
        - type: object
          required: [event_type, payload]
          properties:
            event_type:
              enum: [DELIVERY_CONFIRMED_BY_DECISION, NO_DELIVERY_CONFIRMED_BY_DECISION, DISPUTE_REJECTED, DISPUTE_UPHELD]
            payload: {$ref: '#/components/schemas/DecisionEventPayload'}
    DecisionEventPayload:
      type: object
      additionalProperties: false
      required: [decision_id, dispute_id, introduction_record_id, decision_type, decided_at]
      properties:
        decision_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        dispute_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        introduction_record_id: {$ref: '#/components/schemas/UuidV4OrV7'}
        decision_type: {enum: [DELIVERY_CONFIRMED_BY_DECISION, NO_DELIVERY_CONFIRMED_BY_DECISION, DISPUTE_REJECTED, DISPUTE_UPHELD]}
        established_delivery_at: {type: string, format: date-time}
        decided_at: {type: string, format: date-time}
        financial_consequence_ref: {$ref: '#/components/schemas/UuidV4OrV7'}
      allOf:
        - if:
            properties:
              decision_type: {const: DELIVERY_CONFIRMED_BY_DECISION}
            required: [decision_type]
          then:
            required: [established_delivery_at]
          else:
            not:
              required: [established_delivery_at]

    EventPayloadClassification:
      type: object
      additionalProperties: false
      description: Marker schema; event payloads may contain only pseudonymous IDs, enums, timestamps, versions, hashes and evidence references
```

Обязательные event types v1.0:

- `PAYER_ASSIGNED`;
- `PAYER_RESOLUTION_REQUIRED`;
- `PARTICIPATION_ACCEPTED`;
- `PARTICIPATION_INVALIDATED`;
- `IDENTITY_AUTHORITY_INVALIDATED`;
- `LAWFUL_BASIS_INVALIDATED`;
- `LAWFUL_BASIS_REVOKED`;
- `PREVIOUS_CONTACT_DECISION_CHANGED`;
- `PAYMENT_AUTHORIZED`;
- `PAYMENT_AUTHORIZATION_RELEASED`;
- `ADVANCE_DEBIT_CONFIRMED`;
- `CREDIT_APPLIED`;
- `CREDIT_REVERSED`;
- `ADVANCE_RECEIPT_FISCALIZED`;
- `ADVANCE_SETTLED_AND_FISCALIZED`;
- `REFUND_CONFIRMED`;
- `FISCAL_CORRECTION_CONFIRMED`;
- `SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED`;
- `SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED`;
- `FINANCIAL_READINESS_INVALIDATED`;
- `REVEAL_COMMITTED`;
- `REVEAL_DELIVERY_EVIDENCE_SUBMITTED`;
- `REVEAL_DELIVERY_CONFIRMED`;
- `REVEAL_DELIVERY_UNCERTAIN`;
- `DISCLOSURE_CHALLENGED`;
- `DELIVERY_CONFIRMED_BY_DECISION`;
- `NO_DELIVERY_CONFIRMED_BY_DECISION`;
- `DISPUTE_REJECTED`;
- `DISPUTE_UPHELD`;
- `FINAL_SETTLEMENT_FISCALIZED`.

---

## 5. PostgreSQL DDL и ограничения

DB validation эквивалентна применимым ограничениям canonical AsyncAPI payload schema: проверяются required/null, JSON types, UUID, calendar-valid RFC 3339, SHA-256, int64, minimum/maximum, minLength/maxLength, enum/const/pattern, unknown fields и event-specific conditions. Runtime `DLP_EVENT_CONTENT_V1` независимо сканирует payload, trace и metadata после нормализации распространённых форматов телефона/паспорта.

`redeem_reveal_token` не принимает caller result или result hash. В одной `SECURITY DEFINER` транзакции она блокирует token, сверяет server-owned Snapshot/leases/epoch, создаёт immutable `reveal_attempt`, формирует canonical result и вычисляет SHA-256, затем помечает token redeemed. Same-key replay обязан ссылаться на тот же Attempt. Прямой `INSERT reveal_attempt` прикладной Reveal role не разрешён.

```sql
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'leasemind_guard_owner') then
    create role leasemind_guard_owner noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_payer_writer') then
    create role leasemind_payer_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_participation_writer') then
    create role leasemind_participation_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_financial_writer') then
    create role leasemind_financial_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_previous_contact_writer') then
    create role leasemind_previous_contact_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_identity_authority_writer') then
    create role leasemind_identity_authority_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_lawful_basis_writer') then
    create role leasemind_lawful_basis_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_introduction_writer') then
    create role leasemind_introduction_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_reveal_writer') then
    create role leasemind_reveal_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_contract_reader') then
    create role leasemind_contract_reader noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_outbox_publisher') then
    create role leasemind_outbox_publisher noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_event_consumer') then
    create role leasemind_event_consumer noinherit nologin;
  end if;
end
$$;

create schema if not exists leasemind_security authorization leasemind_guard_owner;
revoke all on schema leasemind_security from public;

create type record_state as enum (
  'DRAFT',
  'PRE_REVEAL_LOCKED',
  'REVEAL_COMMITTED',
  'REVEALED_ACTIVE',
  'DISCLOSURE_DISPUTED',
  'DISPUTED',
  'EXPIRED',
  'VOID_PRE_REVEAL',
  'INVALIDATED_BY_DECISION'
);

create type payment_path as enum ('DEBIT', 'CREDIT', 'MIXED');

create type reveal_source_system as enum (
  'PARTICIPATION_SERVICE',
  'PAYER_RESOLUTION',
  'PREVIOUS_CONTACT_DECISION',
  'PAYMENT_FISCAL_LEDGER',
  'IDENTITY_AUTHORITY_REGISTRY',
  'LAWFUL_BASIS_CONSENT_REGISTRY'
);

create table payer_resolution_aggregate (
  payer_resolution_aggregate_id uuid primary key,
  encounter_id uuid not null unique,
  match_pair_id uuid not null,
  payer_party_id uuid,
  payer_campaign_id uuid,
  payer_assignment_version bigint not null default 0 check (payer_assignment_version >= 0),
  aggregate_version bigint not null check (aggregate_version >= 1),
  resolution_state text not null check (
    resolution_state in ('UNASSIGNED', 'ASSIGNED', 'PAYER_RESOLUTION_REQUIRED', 'PAYER_UNRESOLVED')
  ),
  updated_at timestamptz not null,
  check (
    (
      resolution_state = 'ASSIGNED'
      and payer_party_id is not null
      and payer_campaign_id is not null
      and payer_assignment_version >= 1
    )
    or
    (
      resolution_state <> 'ASSIGNED'
      and payer_party_id is null
      and payer_campaign_id is null
    )
  )
);

create unique index uq_active_pair_resolution
  on payer_resolution_aggregate(match_pair_id)
  where resolution_state in ('UNASSIGNED', 'ASSIGNED', 'PAYER_RESOLUTION_REQUIRED', 'PAYER_UNRESOLVED');

create table participation_acceptance (
  acceptance_record_id uuid primary key,
  encounter_id uuid not null,
  match_id uuid not null,
  party_id uuid not null,
  party_role text not null check (party_role in ('PAYER', 'NON_PAYER')),
  payer_party_id uuid not null,
  payer_campaign_id uuid not null,
  aggregate_version bigint not null check (aggregate_version >= 1),
  identity_version bigint not null check (identity_version >= 1),
  identity_method text not null,
  identity_evidence_ref uuid not null,
  authority_version bigint not null check (authority_version >= 1),
  authority_status text not null check (authority_status in ('VERIFIED', 'NOT_REQUIRED')),
  authority_evidence_ref uuid not null,
  terms_version text not null,
  terms_hash char(64) not null check (terms_hash ~ '^[a-f0-9]{64}$'),
  consent_version text not null,
  consent_hash char(64) not null check (consent_hash ~ '^[a-f0-9]{64}$'),
  payer_notice_version text not null,
  confirmed_account_id uuid not null,
  signature_operation_id uuid not null,
  signed_action text not null,
  signature_verification_result text not null check (signature_verification_result = 'VERIFIED'),
  signature_evidence_ref uuid not null,
  accepted_at timestamptz not null,
  invalidated_at timestamptz,
  unique (encounter_id, party_id, aggregate_version),
  unique (acceptance_record_id, encounter_id, party_id, aggregate_version),
  unique (acceptance_record_id, encounter_id, party_id, aggregate_version, terms_hash)
);

create unique index uq_current_acceptance
  on participation_acceptance(encounter_id, party_id)
  where invalidated_at is null;

create table financial_intent (
  payment_intent_id uuid primary key,
  encounter_id uuid not null unique,
  payer_party_id uuid not null,
  payer_assignment_version bigint not null check (payer_assignment_version >= 1),
  payment_path payment_path not null,
  total_amount_minor bigint not null check (total_amount_minor = 1000000),
  credit_amount_minor bigint not null check (credit_amount_minor between 0 and 1000000),
  debit_amount_minor bigint not null check (debit_amount_minor between 0 and 1000000),
  currency char(3) not null check (currency = 'RUB'),
  fencing_token bigint not null check (fencing_token >= 1),
  created_at timestamptz not null,
  check (credit_amount_minor + debit_amount_minor = total_amount_minor),
  check (
    (payment_path = 'DEBIT' and credit_amount_minor = 0 and debit_amount_minor = total_amount_minor)
    or (payment_path = 'CREDIT' and debit_amount_minor = 0 and credit_amount_minor = total_amount_minor)
    or (payment_path = 'MIXED' and credit_amount_minor > 0 and debit_amount_minor > 0)
  )
);

create table financial_ledger_event (
  financial_event_id uuid primary key,
  payment_intent_id uuid not null references financial_intent(payment_intent_id),
  event_type text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  provider_id text,
  provider_operation_id text,
  fiscal_provider_id text,
  receipt_id text,
  credit_application_id uuid,
  causation_id uuid not null,
  payload_hash char(64) not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  occurred_at timestamptz not null,
  check (
    event_type in (
      'PAYMENT_INTENT_CREATED',
      'PAYMENT_AUTHORIZED',
      'PAYMENT_AUTHORIZATION_RELEASED',
      'ADVANCE_DEBIT_CONFIRMED',
      'CREDIT_APPLIED',
      'CREDIT_REVERSED',
      'ADVANCE_RECEIPT_FISCALIZED',
      'ADVANCE_SETTLED_AND_FISCALIZED',
      'REFUND_CONFIRMED',
      'FISCAL_CORRECTION_CONFIRMED',
      'FINAL_SETTLEMENT_FISCALIZED'
    )
  )
);

create unique index uq_financial_provider_operation
  on financial_ledger_event(provider_id, provider_operation_id)
  where provider_id is not null and provider_operation_id is not null;

create unique index uq_financial_receipt
  on financial_ledger_event(fiscal_provider_id, receipt_id)
  where fiscal_provider_id is not null and receipt_id is not null;

create unique index uq_financial_credit_application
  on financial_ledger_event(credit_application_id)
  where credit_application_id is not null;

create table source_reveal_lease (
  lease_id uuid primary key,
  source_system reveal_source_system not null,
  source_owner_role name not null,
  aggregate_id uuid not null,
  source_version bigint not null check (source_version >= 1),
  fencing_token bigint not null check (fencing_token >= 1),
  encounter_id uuid not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  released_at timestamptz,
  revoked_at timestamptz,
  expired_at timestamptz,
  revocation_reason text,
  lease_state text not null check (lease_state in ('ACTIVE', 'RELEASED', 'REVOKED', 'EXPIRED')),
  unique (source_system, aggregate_id, fencing_token),
  unique (lease_id, source_system, source_version, fencing_token, encounter_id),
  check (expires_at > issued_at),
  check (
    (lease_state = 'ACTIVE' and released_at is null and revoked_at is null and expired_at is null)
    or (lease_state = 'RELEASED' and released_at is not null and revoked_at is null and expired_at is null)
    or (lease_state = 'REVOKED' and revoked_at is not null and expired_at is null)
    or (lease_state = 'EXPIRED' and expired_at is not null and expired_at >= expires_at and released_at is null and revoked_at is null)
  )
);

alter table source_reveal_lease enable row level security;
alter table source_reveal_lease force row level security;

create policy source_reveal_lease_owner_policy on source_reveal_lease
  using (
    (source_system = 'PARTICIPATION_SERVICE' and current_user = 'leasemind_participation_writer')
    or (source_system = 'PAYER_RESOLUTION' and current_user = 'leasemind_payer_writer')
    or (source_system = 'PREVIOUS_CONTACT_DECISION' and current_user = 'leasemind_previous_contact_writer')
    or (source_system = 'PAYMENT_FISCAL_LEDGER' and current_user = 'leasemind_financial_writer')
    or (source_system = 'IDENTITY_AUTHORITY_REGISTRY' and current_user = 'leasemind_identity_authority_writer')
    or (source_system = 'LAWFUL_BASIS_CONSENT_REGISTRY' and current_user = 'leasemind_lawful_basis_writer')
  )
  with check (
    source_owner_role = current_user
    and (
      (source_system = 'PARTICIPATION_SERVICE' and current_user = 'leasemind_participation_writer')
      or (source_system = 'PAYER_RESOLUTION' and current_user = 'leasemind_payer_writer')
      or (source_system = 'PREVIOUS_CONTACT_DECISION' and current_user = 'leasemind_previous_contact_writer')
      or (source_system = 'PAYMENT_FISCAL_LEDGER' and current_user = 'leasemind_financial_writer')
      or (source_system = 'IDENTITY_AUTHORITY_REGISTRY' and current_user = 'leasemind_identity_authority_writer')
      or (source_system = 'LAWFUL_BASIS_CONSENT_REGISTRY' and current_user = 'leasemind_lawful_basis_writer')
    )
  );

create policy source_reveal_lease_reader_policy on source_reveal_lease
  for select
  using (
    current_user in (
      'leasemind_introduction_writer',
      'leasemind_reveal_writer',
      'leasemind_contract_reader'
    )
  );

create policy source_reveal_lease_guard_owner_policy on source_reveal_lease
  for update
  using (current_user = 'leasemind_guard_owner')
  with check (current_user = 'leasemind_guard_owner');

create policy source_reveal_lease_guard_owner_select_policy on source_reveal_lease
  for select
  using (current_user = 'leasemind_guard_owner');

create unique index uq_active_source_reveal_lease
  on source_reveal_lease(source_system, aggregate_id, encounter_id)
  where lease_state = 'ACTIVE';

create table leasemind_security.reveal_guard (
  encounter_id uuid primary key,
  guard_epoch bigint not null check (guard_epoch >= 1),
  aggregate_version bigint not null check (aggregate_version >= 1),
  updated_at timestamptz not null
);

alter table leasemind_security.reveal_guard owner to leasemind_guard_owner;

create table reveal_source_state (
  source_system reveal_source_system not null,
  aggregate_id uuid not null,
  encounter_id uuid not null references payer_resolution_aggregate(encounter_id),
  source_version bigint not null check (source_version >= 1),
  updated_at timestamptz not null,
  primary key (source_system, aggregate_id, encounter_id)
);

alter table reveal_source_state enable row level security;
alter table reveal_source_state force row level security;

create policy reveal_source_state_guard_owner_policy on reveal_source_state
  using (current_user = 'leasemind_guard_owner')
  with check (current_user = 'leasemind_guard_owner');

create policy reveal_source_state_reader_policy on reveal_source_state
  for select
  using (
    current_user in (
      'leasemind_introduction_writer',
      'leasemind_reveal_writer',
      'leasemind_contract_reader'
    )
  );

create function leasemind_security.expected_source_owner_role(
  p_source_system reveal_source_system
)
returns name
language sql
immutable
set search_path = pg_catalog
as $$
  select case p_source_system
    when 'PARTICIPATION_SERVICE' then 'leasemind_participation_writer'::name
    when 'PAYER_RESOLUTION' then 'leasemind_payer_writer'::name
    when 'PREVIOUS_CONTACT_DECISION' then 'leasemind_previous_contact_writer'::name
    when 'PAYMENT_FISCAL_LEDGER' then 'leasemind_financial_writer'::name
    when 'IDENTITY_AUTHORITY_REGISTRY' then 'leasemind_identity_authority_writer'::name
    when 'LAWFUL_BASIS_CONSENT_REGISTRY' then 'leasemind_lawful_basis_writer'::name
  end
$$;

alter function leasemind_security.expected_source_owner_role(reveal_source_system)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.expected_source_owner_role(reveal_source_system) from public;

create function leasemind_security.ensure_reveal_guard(
  p_encounter_id uuid,
  p_created_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  current_epoch bigint;
begin
  if not (
    pg_has_role(session_user, 'leasemind_payer_writer', 'MEMBER')
    or pg_has_role(session_user, 'leasemind_introduction_writer', 'MEMBER')
    or session_user = 'leasemind_guard_owner'
  ) then
    raise exception using
      errcode = '42501',
      message = 'LM-GUARD-INITIALIZER-FORBIDDEN';
  end if;

  insert into leasemind_security.reveal_guard(
    encounter_id,
    guard_epoch,
    aggregate_version,
    updated_at
  ) values (
    p_encounter_id,
    1,
    1,
    p_created_at
  )
  on conflict (encounter_id) do nothing;

  select guard_epoch into current_epoch
    from leasemind_security.reveal_guard
   where encounter_id = p_encounter_id;

  return current_epoch;
end;
$$;

alter function leasemind_security.ensure_reveal_guard(uuid, timestamptz)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.ensure_reveal_guard(uuid, timestamptz) from public;
grant execute on function leasemind_security.ensure_reveal_guard(uuid, timestamptz)
  to leasemind_payer_writer, leasemind_introduction_writer;

create function leasemind_security.initialize_reveal_guard_on_encounter()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  perform leasemind_security.ensure_reveal_guard(new.encounter_id, new.updated_at);
  return new;
end;
$$;

alter function leasemind_security.initialize_reveal_guard_on_encounter()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.initialize_reveal_guard_on_encounter() from public;

create trigger initialize_reveal_guard_after_encounter
after insert on payer_resolution_aggregate
for each row execute function leasemind_security.initialize_reveal_guard_on_encounter();

create function leasemind_security.ensure_reveal_source_state_on_lease()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  expected_role name;
  current_version bigint;
begin
  expected_role := leasemind_security.expected_source_owner_role(new.source_system);
  if expected_role is null
     or not pg_has_role(session_user, expected_role, 'MEMBER') then
    raise exception using
      errcode = '42501',
      message = 'LM-SOURCE-OWNER-MISMATCH';
  end if;

  if not exists (
    select 1 from leasemind_security.reveal_guard
     where encounter_id = new.encounter_id
  ) then
    raise exception using
      errcode = '23503',
      message = 'LM-GUARD-NOT-INITIALIZED';
  end if;

  insert into public.reveal_source_state(
    source_system,
    aggregate_id,
    encounter_id,
    source_version,
    updated_at
  ) values (
    new.source_system,
    new.aggregate_id,
    new.encounter_id,
    new.source_version,
    new.issued_at
  )
  on conflict (source_system, aggregate_id, encounter_id) do nothing;

  select source_version into current_version
    from public.reveal_source_state
   where source_system = new.source_system
     and aggregate_id = new.aggregate_id
     and encounter_id = new.encounter_id;

  if current_version <> new.source_version then
    raise exception using
      errcode = '40001',
      message = 'LM-GATE-SNAPSHOT-STALE';
  end if;

  return new;
end;
$$;

alter function leasemind_security.ensure_reveal_source_state_on_lease()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.ensure_reveal_source_state_on_lease() from public;

create trigger ensure_reveal_source_state_before_lease
before insert on source_reveal_lease
for each row execute function leasemind_security.ensure_reveal_source_state_on_lease();

create function leasemind_security.bump_reveal_guard(
  p_encounter_id uuid,
  p_expected_guard_epoch bigint,
  p_changed_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  next_epoch bigint;
begin
  update leasemind_security.reveal_guard
     set guard_epoch = guard_epoch + 1,
         aggregate_version = aggregate_version + 1,
         updated_at = p_changed_at
   where encounter_id = p_encounter_id
     and guard_epoch = p_expected_guard_epoch
  returning guard_epoch into next_epoch;

  if next_epoch is null then
    raise exception using
      errcode = '40001',
      message = 'LM-CONCURRENCY-VERSION-MISMATCH';
  end if;
  return next_epoch;
end;
$$;

alter function leasemind_security.bump_reveal_guard(uuid, bigint, timestamptz)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.bump_reveal_guard(uuid, bigint, timestamptz) from public;

create function leasemind_security.apply_safety_critical_invalidation(
  p_source_system reveal_source_system,
  p_aggregate_id uuid,
  p_encounter_id uuid,
  p_expected_source_version bigint,
  p_new_source_version bigint,
  p_changed_at timestamptz,
  p_reason text,
  p_event_id uuid,
  p_event_type text,
  p_producer text,
  p_correlation_id uuid,
  p_causation_id uuid,
  p_trace_id text,
  p_idempotency_key text,
  p_payload jsonb,
  p_payload_hash char(64)
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  expected_role name;
  next_epoch bigint;
  existing_payload_hash char(64);
begin
  expected_role := leasemind_security.expected_source_owner_role(p_source_system);
  if expected_role is null
     or not pg_has_role(session_user, expected_role, 'MEMBER') then
    raise exception using
      errcode = '42501',
      message = 'LM-SOURCE-OWNER-MISMATCH';
  end if;

  if p_new_source_version <> p_expected_source_version + 1 then
    raise exception using
      errcode = '22023',
      message = 'LM-SOURCE-VERSION-NONMONOTONIC';
  end if;

  select payload_hash into existing_payload_hash
    from public.event_outbox
   where event_id = p_event_id;

  if existing_payload_hash is not null then
    if existing_payload_hash <> p_payload_hash then
      raise exception using
        errcode = '23505',
        message = 'LM-IDEMPOTENCY-PAYLOAD-CONFLICT';
    end if;
    select guard_epoch into next_epoch
      from leasemind_security.reveal_guard
     where encounter_id = p_encounter_id;
    return next_epoch;
  end if;

  update public.reveal_source_state
     set source_version = p_new_source_version,
         updated_at = p_changed_at
   where source_system = p_source_system
     and aggregate_id = p_aggregate_id
     and encounter_id = p_encounter_id
     and source_version = p_expected_source_version;

  if not found then
    raise exception using
      errcode = '40001',
      message = 'LM-CONCURRENCY-VERSION-MISMATCH';
  end if;

  update public.source_reveal_lease
     set lease_state = 'REVOKED',
         revoked_at = p_changed_at,
         revocation_reason = p_reason
   where source_system = p_source_system
     and aggregate_id = p_aggregate_id
     and encounter_id = p_encounter_id
     and lease_state = 'ACTIVE';

  update leasemind_security.reveal_guard
     set guard_epoch = guard_epoch + 1,
         aggregate_version = aggregate_version + 1,
         updated_at = p_changed_at
   where encounter_id = p_encounter_id
  returning guard_epoch into next_epoch;

  if next_epoch is null then
    raise exception using
      errcode = '23503',
      message = 'LM-GUARD-NOT-INITIALIZED';
  end if;

  insert into public.event_outbox(
    event_id,
    domain_owner_role,
    event_type,
    schema_version,
    aggregate_id,
    aggregate_version,
    occurred_at,
    producer,
    correlation_id,
    causation_id,
    trace_id,
    idempotency_key,
    data_classification,
    payload,
    payload_hash,
    created_at
  ) values (
    p_event_id,
    expected_role,
    p_event_type,
    '1.0.0',
    p_aggregate_id,
    p_new_source_version,
    p_changed_at,
    p_producer,
    p_correlation_id,
    p_causation_id,
    p_trace_id,
    p_idempotency_key,
    'PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS',
    p_payload,
    p_payload_hash,
    p_changed_at
  );

  return next_epoch;
end;
$$;

alter function leasemind_security.apply_safety_critical_invalidation(
  reveal_source_system,
  uuid,
  uuid,
  bigint,
  bigint,
  timestamptz,
  text,
  uuid,
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  jsonb,
  char
) owner to leasemind_guard_owner;

revoke all on function leasemind_security.apply_safety_critical_invalidation(
  reveal_source_system,
  uuid,
  uuid,
  bigint,
  bigint,
  timestamptz,
  text,
  uuid,
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  jsonb,
  char
) from public;

create function leasemind_security.transition_source_reveal_lease(
  p_lease_id uuid,
  p_target_state text,
  p_transitioned_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  lease_row public.source_reveal_lease%rowtype;
  expected_role name;
begin
  select * into lease_row
    from public.source_reveal_lease
   where lease_id = p_lease_id
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'LM-GATE-LEASE-MISSING';
  end if;

  expected_role := leasemind_security.expected_source_owner_role(lease_row.source_system);
  if expected_role is null
     or not pg_has_role(session_user, expected_role, 'MEMBER') then
    raise exception using errcode = '42501', message = 'LM-SOURCE-OWNER-MISMATCH';
  end if;

  if p_target_state = 'RELEASED' and lease_row.lease_state = 'ACTIVE' then
    update public.source_reveal_lease
       set lease_state = 'RELEASED', released_at = p_transitioned_at
     where lease_id = p_lease_id;
  elsif p_target_state = 'EXPIRED'
        and lease_row.lease_state = 'ACTIVE'
        and p_transitioned_at >= lease_row.expires_at then
    update public.source_reveal_lease
       set lease_state = 'EXPIRED', expired_at = p_transitioned_at
     where lease_id = p_lease_id;
  else
    raise exception using errcode = '23514', message = 'LM-GATE-LEASE-TRANSITION-FORBIDDEN';
  end if;
end;
$$;

alter function leasemind_security.transition_source_reveal_lease(uuid, text, timestamptz)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.transition_source_reveal_lease(uuid, text, timestamptz) from public;

create table introduction_record (
  introduction_record_id uuid primary key,
  encounter_id uuid not null unique,
  match_pair_id uuid not null,
  match_id uuid not null,
  campaign_ids uuid[] not null check (cardinality(campaign_ids) between 1 and 2),
  object_id uuid not null,
  record_state record_state not null,
  aggregate_version bigint not null check (aggregate_version >= 1),
  reveal_gate_snapshot_id uuid,
  snapshot_hash char(64),
  manifest_hash char(64),
  payer_party_id uuid,
  payer_campaign_id uuid,
  payer_assignment_version bigint,
  match_rule_version text not null,
  match_accepted_at timestamptz,
  previous_contact_decision_id uuid not null,
  previous_contact_policy_version text not null,
  previous_contact_policy_hash char(64) not null check (previous_contact_policy_hash ~ '^[a-f0-9]{64}$'),
  advance_receipt_id text,
  final_settlement_receipt_id text,
  reveal_delivery_confirmed_event_id uuid,
  protection_starts_at timestamptz,
  protection_ends_at timestamptz,
  protection_timezone text,
  protection_tzdb_version text,
  protection_algorithm_version text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  check ((snapshot_hash is null) or snapshot_hash ~ '^[a-f0-9]{64}$'),
  check ((manifest_hash is null) or manifest_hash ~ '^[a-f0-9]{64}$'),
  check (
    (record_state in ('REVEALED_ACTIVE', 'DISPUTED', 'EXPIRED', 'INVALIDATED_BY_DECISION')
      and protection_starts_at is not null
      and protection_ends_at is not null
      and reveal_delivery_confirmed_event_id is not null)
    or
    (record_state not in ('REVEALED_ACTIVE', 'DISPUTED', 'EXPIRED', 'INVALIDATED_BY_DECISION'))
  ),
  check (protection_ends_at is null or protection_ends_at > protection_starts_at)
);

alter table introduction_record
  add constraint uq_introduction_record_id_encounter
  unique (introduction_record_id, encounter_id);

create table introduction_record_party (
  introduction_record_id uuid not null,
  encounter_id uuid not null,
  party_id uuid not null,
  party_role text not null check (party_role in ('OWNER_SIDE', 'TENANT_SIDE')),
  acceptance_record_id uuid not null,
  acceptance_aggregate_version bigint not null check (acceptance_aggregate_version >= 1),
  terms_hash char(64) not null check (terms_hash ~ '^[a-f0-9]{64}$'),
  lawful_basis_id uuid not null,
  identity_authority_version bigint not null check (identity_authority_version >= 1),
  primary key (introduction_record_id, party_id),
  unique (introduction_record_id, party_role),
  unique (
    introduction_record_id,
    encounter_id,
    party_id,
    acceptance_record_id,
    acceptance_aggregate_version,
    terms_hash
  ),
  foreign key (introduction_record_id, encounter_id)
    references introduction_record(introduction_record_id, encounter_id),
  foreign key (
    acceptance_record_id,
    encounter_id,
    party_id,
    acceptance_aggregate_version,
    terms_hash
  ) references participation_acceptance(
    acceptance_record_id,
    encounter_id,
    party_id,
    aggregate_version,
    terms_hash
  )
);

create unique index uq_one_prereveal_record_per_encounter
  on introduction_record(encounter_id)
  where record_state in ('DRAFT', 'PRE_REVEAL_LOCKED', 'REVEAL_COMMITTED', 'DISCLOSURE_DISPUTED');

create table reveal_gate_snapshot (
  reveal_gate_snapshot_id uuid primary key,
  introduction_record_id uuid not null references introduction_record(introduction_record_id),
  encounter_id uuid not null references payer_resolution_aggregate(encounter_id),
  match_pair_id uuid not null,
  match_id uuid not null,
  campaign_ids uuid[] not null check (cardinality(campaign_ids) between 1 and 2),
  campaign_versions bigint[] not null check (
    cardinality(campaign_versions) = cardinality(campaign_ids)
  ),
  payer_party_id uuid not null,
  payer_assignment_version bigint not null check (payer_assignment_version >= 1),
  previous_contact_decision_id uuid not null,
  previous_contact_decision_version bigint not null check (previous_contact_decision_version >= 1),
  previous_contact_policy_version text not null,
  previous_contact_policy_hash char(64) not null check (previous_contact_policy_hash ~ '^[a-f0-9]{64}$'),
  advance_ledger_version bigint not null check (advance_ledger_version >= 1),
  advance_receipt_id text not null,
  financial_exposure_version bigint not null check (financial_exposure_version >= 1),
  delivery_policy_version text not null,
  delivery_policy_hash char(64) not null check (delivery_policy_hash ~ '^[a-f0-9]{64}$'),
  manifest_hash char(64) not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  record_version bigint not null check (record_version >= 1),
  snapshot_hash char(64) not null check (snapshot_hash ~ '^[a-f0-9]{64}$'),
  fencing_token bigint not null check (fencing_token >= 1),
  reveal_guard_epoch bigint not null check (reveal_guard_epoch >= 1),
  valid_until timestamptz not null,
  created_at timestamptz not null,
  unique (introduction_record_id, fencing_token),
  unique (reveal_gate_snapshot_id, encounter_id),
  unique (reveal_gate_snapshot_id, introduction_record_id, encounter_id),
  unique (reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash),
  unique (reveal_gate_snapshot_id, introduction_record_id, encounter_id, snapshot_hash, manifest_hash),
  check (valid_until > created_at)
);

create function leasemind_security.validate_reveal_gate_snapshot_epoch()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  current_epoch bigint;
begin
  select guard_epoch into current_epoch
    from leasemind_security.reveal_guard
   where encounter_id = new.encounter_id;
  if current_epoch is null then
    raise exception using errcode = '23503', message = 'LM-GUARD-NOT-INITIALIZED';
  end if;
  if current_epoch <> new.reveal_guard_epoch then
    raise exception using errcode = '40001', message = 'LM-GATE-GUARD-EPOCH-STALE';
  end if;
  return new;
end;
$$;

alter function leasemind_security.validate_reveal_gate_snapshot_epoch()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.validate_reveal_gate_snapshot_epoch() from public;

create trigger validate_reveal_gate_snapshot_epoch_before_insert
before insert on reveal_gate_snapshot
for each row execute function leasemind_security.validate_reveal_gate_snapshot_epoch();

create table reveal_gate_snapshot_party (
  reveal_gate_snapshot_id uuid not null,
  introduction_record_id uuid not null,
  encounter_id uuid not null,
  party_id uuid not null,
  party_role text not null check (party_role in ('OWNER_SIDE', 'TENANT_SIDE')),
  acceptance_record_id uuid not null,
  acceptance_aggregate_version bigint not null check (acceptance_aggregate_version >= 1),
  terms_hash char(64) not null check (terms_hash ~ '^[a-f0-9]{64}$'),
  lawful_basis_id uuid not null,
  lawful_basis_version bigint not null check (lawful_basis_version >= 1),
  identity_authority_version bigint not null check (identity_authority_version >= 1),
  primary key (reveal_gate_snapshot_id, party_id),
  unique (reveal_gate_snapshot_id, party_role),
  foreign key (reveal_gate_snapshot_id, introduction_record_id, encounter_id)
    references reveal_gate_snapshot(
      reveal_gate_snapshot_id,
      introduction_record_id,
      encounter_id
    ) on delete cascade,
  foreign key (
    introduction_record_id,
    encounter_id,
    party_id,
    acceptance_record_id,
    acceptance_aggregate_version,
    terms_hash
  ) references introduction_record_party(
    introduction_record_id,
    encounter_id,
    party_id,
    acceptance_record_id,
    acceptance_aggregate_version,
    terms_hash
  )
);

alter table introduction_record
  add constraint fk_introduction_record_committed_snapshot
  foreign key (reveal_gate_snapshot_id, introduction_record_id, encounter_id, snapshot_hash, manifest_hash)
  references reveal_gate_snapshot(
    reveal_gate_snapshot_id,
    introduction_record_id,
    encounter_id,
    snapshot_hash,
    manifest_hash
  )
  deferrable initially deferred;

create table reveal_gate_snapshot_source (
  reveal_gate_snapshot_id uuid not null,
  encounter_id uuid not null,
  source_system reveal_source_system not null,
  source_lease_id uuid not null unique,
  source_version bigint not null check (source_version >= 1),
  fencing_token bigint not null check (fencing_token >= 1),
  primary key (reveal_gate_snapshot_id, source_system),
  foreign key (reveal_gate_snapshot_id, encounter_id)
    references reveal_gate_snapshot(reveal_gate_snapshot_id, encounter_id) on delete cascade,
  foreign key (source_lease_id, source_system, source_version, fencing_token, encounter_id)
    references source_reveal_lease(lease_id, source_system, source_version, fencing_token, encounter_id)
);

create function assert_complete_introduction_record_parties()
returns trigger
language plpgsql
as $$
declare
  checked_record_id uuid;
  party_count integer;
  role_count integer;
begin
  checked_record_id := case
    when tg_table_name = 'introduction_record' then
      case when tg_op = 'DELETE' then old.introduction_record_id else new.introduction_record_id end
    else
      case when tg_op = 'DELETE' then old.introduction_record_id else new.introduction_record_id end
  end;

  if not exists (
    select 1 from introduction_record
     where introduction_record_id = checked_record_id
  ) then
    return null;
  end if;

  select count(*), count(distinct party_role)
    into party_count, role_count
    from introduction_record_party
   where introduction_record_id = checked_record_id;

  if party_count <> 2 or role_count <> 2 then
    raise exception using
      errcode = '23514',
      message = 'LM-RECORD-PARTY-SET-INCOMPLETE';
  end if;
  return null;
end;
$$;

create constraint trigger ck_record_has_two_parties
after insert or update on introduction_record
deferrable initially deferred
for each row execute function assert_complete_introduction_record_parties();

create constraint trigger ck_record_party_set_remains_complete
after insert or update or delete on introduction_record_party
deferrable initially deferred
for each row execute function assert_complete_introduction_record_parties();

create function assert_complete_reveal_snapshot_parties()
returns trigger
language plpgsql
as $$
declare
  checked_snapshot_id uuid;
  party_count integer;
  role_count integer;
begin
  checked_snapshot_id := case
    when tg_table_name = 'reveal_gate_snapshot' then
      case when tg_op = 'DELETE' then old.reveal_gate_snapshot_id else new.reveal_gate_snapshot_id end
    else
      case when tg_op = 'DELETE' then old.reveal_gate_snapshot_id else new.reveal_gate_snapshot_id end
  end;

  if not exists (
    select 1 from reveal_gate_snapshot
     where reveal_gate_snapshot_id = checked_snapshot_id
  ) then
    return null;
  end if;

  select count(*), count(distinct party_role)
    into party_count, role_count
    from reveal_gate_snapshot_party
   where reveal_gate_snapshot_id = checked_snapshot_id;

  if party_count <> 2 or role_count <> 2 then
    raise exception using
      errcode = '23514',
      message = 'LM-SNAPSHOT-PARTY-SET-INCOMPLETE';
  end if;
  return null;
end;
$$;

create constraint trigger ck_snapshot_has_two_parties
after insert or update on reveal_gate_snapshot
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_parties();

create constraint trigger ck_snapshot_party_set_remains_complete
after insert or update or delete on reveal_gate_snapshot_party
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_parties();

create function assert_complete_reveal_snapshot_sources()
returns trigger
language plpgsql
as $$
declare
  checked_snapshot_id uuid;
  source_count integer;
begin
  if tg_op = 'DELETE' then
    checked_snapshot_id := old.reveal_gate_snapshot_id;
  else
    checked_snapshot_id := new.reveal_gate_snapshot_id;
  end if;

  if not exists (
    select 1 from reveal_gate_snapshot
    where reveal_gate_snapshot_id = checked_snapshot_id
  ) then
    return null;
  end if;

  select count(*) into source_count
  from reveal_gate_snapshot_source
  where reveal_gate_snapshot_id = checked_snapshot_id;

  if source_count <> 6 then
    raise exception using
      errcode = '23514',
      message = 'LM-GATE-LEASE-SET-INCOMPLETE';
  end if;
  return null;
end;
$$;

create constraint trigger ck_snapshot_has_six_sources
after insert or update on reveal_gate_snapshot
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_sources();

create constraint trigger ck_snapshot_source_set_remains_complete
after insert or update or delete on reveal_gate_snapshot_source
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_sources();

create table reveal_token (
  reveal_token_id uuid primary key,
  token_hash char(64) not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  introduction_record_id uuid not null references introduction_record(introduction_record_id),
  encounter_id uuid not null,
  reveal_gate_snapshot_id uuid not null,
  recipient_party_id uuid not null,
  manifest_hash char(64) not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeem_idempotency_key text,
  redeem_request_hash char(64) check (
    redeem_request_hash is null or redeem_request_hash ~ '^[a-f0-9]{64}$'
  ),
  redeem_result jsonb,
  redeem_result_hash char(64) check (
    redeem_result_hash is null or redeem_result_hash ~ '^[a-f0-9]{64}$'
  ),
  operation_state text not null check (
    operation_state in ('PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED_RETRYABLE', 'FAILED_FINAL', 'UNKNOWN')
  ),
  foreign key (reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash)
    references reveal_gate_snapshot(reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash),
  foreign key (introduction_record_id, recipient_party_id)
    references introduction_record_party(introduction_record_id, party_id),
  unique (reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash),
  check (expires_at > issued_at),
  check (
    (redeemed_at is null and redeem_idempotency_key is null
      and redeem_request_hash is null and redeem_result is null and redeem_result_hash is null)
    or
    (redeemed_at is not null and redeem_idempotency_key is not null
      and redeem_request_hash is not null and redeem_result is not null
      and redeem_result_hash is not null and operation_state = 'SUCCEEDED')
  )
);

create function leasemind_security.validate_reveal_token_gate()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  snapshot_epoch bigint;
  current_epoch bigint;
  snapshot_valid_until timestamptz;
  active_source_count integer;
begin
  select snapshot.reveal_guard_epoch, snapshot.valid_until, guard.guard_epoch
    into snapshot_epoch, snapshot_valid_until, current_epoch
    from public.reveal_gate_snapshot snapshot
    join leasemind_security.reveal_guard guard
      on guard.encounter_id = snapshot.encounter_id
   where snapshot.reveal_gate_snapshot_id = new.reveal_gate_snapshot_id
     and snapshot.encounter_id = new.encounter_id;

  if snapshot_epoch is null then
    raise exception using errcode = '23503', message = 'LM-GATE-SNAPSHOT-MISSING';
  end if;
  if snapshot_epoch <> current_epoch then
    raise exception using errcode = '40001', message = 'LM-GATE-GUARD-EPOCH-STALE';
  end if;
  if new.issued_at >= snapshot_valid_until then
    raise exception using errcode = '22023', message = 'LM-GATE-SNAPSHOT-EXPIRED';
  end if;

  select count(*) into active_source_count
    from public.reveal_gate_snapshot_source snapshot_source
    join public.source_reveal_lease lease
      on lease.lease_id = snapshot_source.source_lease_id
     and lease.source_system = snapshot_source.source_system
     and lease.source_version = snapshot_source.source_version
     and lease.fencing_token = snapshot_source.fencing_token
     and lease.encounter_id = new.encounter_id
   where snapshot_source.reveal_gate_snapshot_id = new.reveal_gate_snapshot_id
     and lease.lease_state = 'ACTIVE'
     and lease.expires_at > new.issued_at;

  if active_source_count <> 6 then
    raise exception using errcode = '23514', message = 'LM-GATE-LEASE-SET-INCOMPLETE';
  end if;
  return new;
end;
$$;

alter function leasemind_security.validate_reveal_token_gate()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.validate_reveal_token_gate() from public;

create trigger validate_reveal_token_gate_before_insert
before insert on reveal_token
for each row execute function leasemind_security.validate_reveal_token_gate();

create function leasemind_security.redeem_reveal_token(
  p_reveal_token_id uuid,
  p_token_hash char(64),
  p_idempotency_key text,
  p_request_hash char(64)
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  token_row public.reveal_token%rowtype;
  snapshot_epoch bigint;
  current_epoch bigint;
  active_source_count integer;
  persisted_attempt_count integer;
  v_reveal_attempt_id uuid;
  v_result jsonb;
  v_result_hash char(64);
  v_redeemed_at timestamptz;
begin
  if char_length(p_idempotency_key) not between 16 and 128
     or p_request_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'LM-REVEAL-REQUEST-INVALID';
  end if;

  select * into token_row
    from public.reveal_token
   where reveal_token_id = p_reveal_token_id
   for update;

  if not found or token_row.token_hash <> p_token_hash then
    raise exception using errcode = '22023', message = 'LM-REVEAL-TOKEN-INVALID';
  end if;

  if token_row.redeemed_at is not null then
    if token_row.redeem_idempotency_key = p_idempotency_key
       and token_row.redeem_request_hash = p_request_hash then
      select count(*) into persisted_attempt_count
        from public.reveal_attempt attempt
       where attempt.reveal_attempt_id =
               (token_row.redeem_result ->> 'reveal_attempt_id')::uuid
         and attempt.reveal_token_id = token_row.reveal_token_id
         and attempt.introduction_record_id = token_row.introduction_record_id
         and attempt.encounter_id = token_row.encounter_id
         and attempt.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id
         and attempt.recipient_party_id = token_row.recipient_party_id
         and attempt.manifest_hash = token_row.manifest_hash;
      if persisted_attempt_count <> 1 then
        raise exception using errcode = '23514', message = 'LM-REVEAL-ATTEMPT-MISSING';
      end if;
      return token_row.redeem_result;
    elsif token_row.redeem_idempotency_key = p_idempotency_key then
      raise exception using errcode = '23505', message = 'LM-IDEMPOTENCY-PAYLOAD-CONFLICT';
    else
      raise exception using errcode = '23505', message = 'LM-REVEAL-TOKEN-USED';
    end if;
  end if;

  -- Lock order matches apply_safety_critical_invalidation exactly:
  -- reveal_token (above) -> source_reveal_lease (ordered) -> reveal_guard.
  -- No aggregate inside the locking statement; rows are locked first,
  -- counted separately below.
  perform 1
    from public.reveal_gate_snapshot_source snapshot_source
    join public.source_reveal_lease lease
      on lease.lease_id = snapshot_source.source_lease_id
   where snapshot_source.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id
   order by lease.lease_id
     for update of lease;

  select guard.guard_epoch into current_epoch
    from leasemind_security.reveal_guard guard
   where guard.encounter_id = token_row.encounter_id
   for update;

  -- Server-owned time, computed once, after all locks are held, so a token
  -- that expires while waiting on a lock cannot be redeemed.
  v_redeemed_at := clock_timestamp();

  if token_row.issued_at > v_redeemed_at then
    raise exception using errcode = '22023', message = 'LM-REVEAL-TOKEN-NOT-YET-VALID';
  end if;

  if v_redeemed_at >= token_row.expires_at then
    raise exception using errcode = '22023', message = 'LM-REVEAL-TOKEN-EXPIRED';
  end if;

  select snapshot.reveal_guard_epoch
    into snapshot_epoch
    from public.reveal_gate_snapshot snapshot
   where snapshot.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id;
  if snapshot_epoch <> current_epoch then
    raise exception using errcode = '40001', message = 'LM-GATE-GUARD-EPOCH-STALE';
  end if;

  select count(*) into active_source_count
    from public.reveal_gate_snapshot_source snapshot_source
    join public.source_reveal_lease lease
      on lease.lease_id = snapshot_source.source_lease_id
   where snapshot_source.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id
     and lease.lease_state = 'ACTIVE'
     and lease.expires_at > v_redeemed_at;
  if active_source_count <> 6 then
    raise exception using errcode = '23514', message = 'LM-GATE-LEASE-SET-INCOMPLETE';
  end if;

  v_reveal_attempt_id := pg_catalog.gen_random_uuid();
  insert into public.reveal_attempt(
    reveal_attempt_id,
    reveal_token_id,
    introduction_record_id,
    encounter_id,
    reveal_gate_snapshot_id,
    recipient_party_id,
    manifest_hash,
    operation_state,
    attempted_at
  ) values (
    v_reveal_attempt_id,
    token_row.reveal_token_id,
    token_row.introduction_record_id,
    token_row.encounter_id,
    token_row.reveal_gate_snapshot_id,
    token_row.recipient_party_id,
    token_row.manifest_hash,
    'SUCCEEDED',
    v_redeemed_at
  );

  v_result := jsonb_build_object(
    'status', 'REDEEMED',
    'redeemed_at', v_redeemed_at,
    'reveal_attempt_id', v_reveal_attempt_id
  );
  v_result_hash := encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_result::text, 'UTF8')),
    'hex'
  );

  update public.reveal_token
     set redeemed_at = v_redeemed_at,
         redeem_idempotency_key = p_idempotency_key,
         redeem_request_hash = p_request_hash,
         redeem_result = v_result,
         redeem_result_hash = v_result_hash,
         operation_state = 'SUCCEEDED'
   where reveal_token_id = p_reveal_token_id
     and redeemed_at is null;

  if not found then
    raise exception using errcode = '40001', message = 'LM-CONCURRENCY-VERSION-MISMATCH';
  end if;
  return v_result;
end;
$$;

alter function leasemind_security.redeem_reveal_token(
  uuid, char, text, char
) owner to leasemind_guard_owner;
revoke all on function leasemind_security.redeem_reveal_token(
  uuid, char, text, char
) from public;

create table reveal_attempt (
  reveal_attempt_id uuid primary key,
  reveal_token_id uuid not null unique,
  introduction_record_id uuid not null,
  encounter_id uuid not null,
  reveal_gate_snapshot_id uuid not null,
  recipient_party_id uuid not null,
  manifest_hash char(64) not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  operation_state text not null,
  attempted_at timestamptz not null,
  foreign key (reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash)
    references reveal_token(reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash),
  unique (reveal_gate_snapshot_id, recipient_party_id, manifest_hash)
);

create table reveal_delivery_evidence (
  reveal_delivery_evidence_id uuid primary key,
  reveal_attempt_id uuid not null references reveal_attempt(reveal_attempt_id),
  evidence_manifest_hash char(64) not null check (evidence_manifest_hash ~ '^[a-f0-9]{64}$'),
  evidence_classification text not null check (
    evidence_classification in ('SUFFICIENT', 'PARTIAL', 'CONTRADICTORY', 'ABSENT')
  ),
  delivery_policy_version text not null,
  delivery_policy_hash char(64) not null check (delivery_policy_hash ~ '^[a-f0-9]{64}$'),
  established_delivery_at timestamptz,
  submitted_at timestamptz not null,
  check (
    (evidence_classification = 'SUFFICIENT' and established_delivery_at is not null)
    or (evidence_classification <> 'SUFFICIENT' and established_delivery_at is null)
  ),
  unique (reveal_attempt_id, evidence_manifest_hash)
);

create table decision_record (
  decision_id uuid primary key,
  dispute_id uuid not null,
  introduction_record_id uuid not null references introduction_record(introduction_record_id),
  decision_type text not null check (
    decision_type in (
      'DELIVERY_CONFIRMED_BY_DECISION',
      'NO_DELIVERY_CONFIRMED_BY_DECISION',
      'DISPUTE_REJECTED',
      'DISPUTE_UPHELD'
    )
  ),
  reviewer_id uuid not null,
  reviewer_role text not null,
  appointment_id uuid not null,
  conflict_check_id uuid not null,
  policy_version text not null,
  policy_hash char(64) not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  evidence_bundle_hash char(64) not null check (evidence_bundle_hash ~ '^[a-f0-9]{64}$'),
  established_delivery_at timestamptz,
  second_level_approver_id uuid,
  financial_consequence_ref uuid,
  appeal_status text not null default 'NOT_APPEALED'
    check (appeal_status in ('NOT_APPEALED', 'APPEALED', 'FINAL')),
  decision_order bigint not null check (decision_order >= 1),
  decided_at timestamptz not null,
  unique (dispute_id, decision_order),
  check (
    (decision_type = 'DELIVERY_CONFIRMED_BY_DECISION' and established_delivery_at is not null)
    or (decision_type <> 'DELIVERY_CONFIRMED_BY_DECISION' and established_delivery_at is null)
  )
);

create table event_outbox (
  event_id uuid primary key,
  domain_owner_role name not null,
  event_type text not null check (event_type ~ '^[A-Z][A-Z0-9_]*$'),
  schema_version text not null check (schema_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  aggregate_id uuid not null,
  aggregate_version bigint not null check (aggregate_version >= 1),
  occurred_at timestamptz not null,
  producer text not null check (char_length(producer) >= 1),
  correlation_id uuid not null,
  causation_id uuid not null,
  trace_id text not null check (char_length(trace_id) between 16 and 64),
  idempotency_key text not null check (char_length(idempotency_key) between 16 and 128),
  data_classification text not null
    check (data_classification = 'PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS'),
  payload jsonb not null,
  payload_hash char(64) not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null,
  published_at timestamptz,
  unique (aggregate_id, aggregate_version, event_type)
);

alter table event_outbox enable row level security;
alter table event_outbox force row level security;

create function leasemind_security.normalize_dlp_scalar(p_value text)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select regexp_replace(normalize(coalesce(p_value, ''), NFKC), '[^0-9]', '', 'g');
$$;

-- SEVENTH-B02 corrective pass (DLP forbidden-KEY parity), V2: the same class
-- of punctuation/format/whitespace evasion characters already normalized
-- away for scalar VALUES (normalize_dlp_scalar) is normalized away here for
-- object KEYS. Mirrors leasemind_security.normalizeDlpKey(text) in
-- tests/synthetic_service_models.mjs -- identical normalization order
-- (NFKC, then case-fold, then strip evasion characters).
create function leasemind_security.normalize_dlp_key(p_key text)
returns text
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  evasion_pattern text := '[-_./' || chr(160) || chr(8239) || chr(8203) || chr(8204) || chr(8205) || '[:space:]]';
begin
  return regexp_replace(
    lower(normalize(coalesce(p_key, ''), NFKC)),
    evasion_pattern,
    '',
    'g'
  );
end;
$$;

-- DLP_FORBIDDEN_KEY_MATCH_V2: the V1 exact-match strategy was fail-open --
-- it missed composite/prefixed/suffixed identifier keys such as
-- customer_email, contact_email, user_phone, passport_data, bank_account,
-- payment_card, delivery_address or full_name_value, which never equal a
-- bare forbidden token exactly. V2 matches a forbidden token as a
-- SUBSTRING of the normalized key, which catches all such composites,
-- gated by a closed, exact, normative allowlist of the only real required
-- schema field names that would otherwise be false-positively blocked.
-- The allowlist was derived by exhaustively checking every `properties`
-- key across openapi.yaml and asyncapi.yaml against all 8 forbidden
-- tokens (not hand-picked): exactly four fields exist and all four belong
-- to the same normative concept (Previous Contact) --
-- previous_contact_decision_id, previous_contact_decision_version,
-- previous_contact_policy_hash, previous_contact_policy_version. No other
-- forbidden token appears as a substring of any of the 128 distinct
-- schema field names. Mirrors leasemind_security.isForbiddenDlpKey(...) /
-- DLP_NORMATIVE_KEY_ALLOWLIST in tests/synthetic_service_models.mjs --
-- identical allowlist (normalized the same way) and identical 8-token set.
create function leasemind_security.is_forbidden_dlp_key(p_key text)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  normalized text;
  token text;
begin
  normalized := leasemind_security.normalize_dlp_key(p_key);
  if normalized = any(array[
    'previouscontactdecisionid',
    'previouscontactdecisionversion',
    'previouscontactpolicyhash',
    'previouscontactpolicyversion'
  ]) then
    return false;
  end if;
  foreach token in array array['email','phone','passport','bank','card','address','contact','fullname'] loop
    if position(token in normalized) > 0 then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

create function leasemind_security.scan_dlp_scalar(p_value jsonb)
returns void
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  as_text text;
  digits text;
begin
  case jsonb_typeof(p_value)
  when 'string', 'number' then
    as_text := case jsonb_typeof(p_value)
      when 'string' then p_value #>> '{}'
      else p_value::text
    end;
    digits := leasemind_security.normalize_dlp_scalar(as_text);
    if digits ~ '^[78][0-9]{10}$'
       or digits ~ '^[0-9]{10}$'
       or digits ~ '^[0-9]{16,19}$'
       or as_text ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
       or as_text ~* '(^|[^[:alpha:]])(улица|ул\.|проспект|дом|квартира|street|address)([^[:alpha:]]|$)' then
      raise log 'LM-DLP-DIRECT-IDENTIFIER-DETECTED';
      raise exception using errcode = '22023', message = 'LM-DATA-CLASSIFICATION-VIOLATION';
    end if;
  when 'array' then
    perform leasemind_security.scan_dlp_scalar(elem)
      from jsonb_array_elements(p_value) as elem;
  when 'object' then
    if exists (
      select 1 from jsonb_object_keys(p_value) as key
       where leasemind_security.is_forbidden_dlp_key(key)
    ) then
      raise log 'LM-DLP-DIRECT-IDENTIFIER-DETECTED';
      raise exception using errcode = '22023', message = 'LM-DATA-CLASSIFICATION-VIOLATION';
    end if;
    perform leasemind_security.scan_dlp_scalar(kv.value)
      from jsonb_each(p_value) as kv(key, value);
  else
    null;
  end case;
end;
$$;

create function leasemind_security.validate_no_direct_identifiers(p_document jsonb)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
begin
  perform leasemind_security.scan_dlp_scalar(p_document);
  return true;
end;
$$;
comment on function leasemind_security.validate_no_direct_identifiers(jsonb)
  is 'DLP_EVENT_CONTENT_V1';

create function leasemind_security.is_valid_rfc3339_timestamp(p_value text)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  parsed timestamptz;
begin
  if p_value !~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|[+-]([01][0-9]|2[0-3]):[0-5][0-9])$' then
    return false;
  end if;
  perform make_date(
    substring(p_value from 1 for 4)::integer,
    substring(p_value from 6 for 2)::integer,
    substring(p_value from 9 for 2)::integer
  );
  parsed := p_value::timestamptz;
  return parsed is not null;
exception
  when others then
    return false;
end;
$$;

create function leasemind_security.validate_event_payload(
  p_event_type text,
  p_schema_version text,
  p_payload jsonb
)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  required_fields text[];
  allowed_fields text[];
  uuid_fields text[] := array[
    'encounter_id','match_pair_id','payer_party_id','payer_campaign_id','match_id',
    'acceptance_record_id','party_id','lawful_basis_id','previous_contact_decision_id',
    'financial_event_id','payment_intent_id','provider_operation_ref','receipt_ref',
    'credit_application_id','introduction_record_id','reveal_gate_snapshot_id',
    'reveal_attempt_id','recipient_party_id','decision_id','dispute_id',
    'financial_consequence_ref'
  ];
  integer_fields text[] := array[
    'payer_assignment_version','acceptance_aggregate_version','identity_authority_version',
    'lawful_basis_version','previous_contact_decision_version','amount_minor'
  ];
  timestamp_fields text[] := array[
    'effective_at','established_delivery_at','protection_starts_at',
    'protection_ends_at','attempted_at','decided_at'
  ];
  hash_fields text[] := array['policy_hash','manifest_hash','evidence_manifest_hash'];
  field_name text;
  from_state text;
  to_state text;
begin
  if split_part(p_schema_version, '.', 1) <> '1' then
    raise exception using errcode = '22023', message = 'LM-SCHEMA-MAJOR-UNSUPPORTED';
  end if;
  if jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-NOT-OBJECT';
  end if;

  case
    when p_event_type in ('PAYER_ASSIGNED', 'PAYER_RESOLUTION_REQUIRED') then
      required_fields := array['encounter_id','match_pair_id','resolution_state','payer_assignment_version'];
      allowed_fields := required_fields || array['payer_party_id','payer_campaign_id','reason_code'];
    when p_event_type in ('PARTICIPATION_ACCEPTED', 'PARTICIPATION_INVALIDATED') then
      required_fields := array['encounter_id','match_id','acceptance_record_id','party_id','acceptance_aggregate_version','acceptance_status'];
      allowed_fields := required_fields || array['reason_code'];
    when p_event_type = 'IDENTITY_AUTHORITY_INVALIDATED' then
      required_fields := array['party_id','identity_authority_version','reason_code','effective_at'];
      allowed_fields := required_fields;
    when p_event_type in ('LAWFUL_BASIS_INVALIDATED', 'LAWFUL_BASIS_REVOKED') then
      required_fields := array['party_id','lawful_basis_id','purpose_code','lawful_basis_version','reason_code','effective_at'];
      allowed_fields := required_fields;
    when p_event_type = 'PREVIOUS_CONTACT_DECISION_CHANGED' then
      required_fields := array['encounter_id','previous_contact_decision_id','previous_contact_decision_version','decision_status','reason_code','effective_at'];
      allowed_fields := required_fields || array['policy_version','policy_hash'];
    when p_event_type in (
      'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
      'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
      'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED','FISCAL_CORRECTION_CONFIRMED',
      'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
      'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED','FINANCIAL_READINESS_INVALIDATED',
      'FINAL_SETTLEMENT_FISCALIZED'
    ) then
      required_fields := array['encounter_id','financial_event_id','payment_path','amount_minor','currency'];
      allowed_fields := required_fields || array[
        'payment_intent_id','provider_operation_ref','receipt_ref','credit_application_id',
        'payer_assignment_version','reason_code'
      ];
    when p_event_type in (
      'RECORD_PRE_REVEAL_LOCKED','PRE_REVEAL_VOIDED','REVEAL_COMMITTED',
      'REVEAL_DELIVERY_CONFIRMED','REVEAL_DELIVERY_UNCERTAIN',
      'DISCLOSURE_CHALLENGED','PROTECTION_END_REACHED'
    ) then
      required_fields := array['introduction_record_id','encounter_id','from_state','to_state'];
      allowed_fields := required_fields || array[
        'reveal_gate_snapshot_id','established_delivery_at',
        'protection_starts_at','protection_ends_at'
      ];
    when p_event_type = 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED' then
      required_fields := array[
        'reveal_attempt_id','introduction_record_id','encounter_id','recipient_party_id',
        'reveal_gate_snapshot_id','manifest_hash','evidence_manifest_hash',
        'evidence_classification','attempted_at'
      ];
      allowed_fields := required_fields || array['established_delivery_at'];
    when p_event_type in (
      'DELIVERY_CONFIRMED_BY_DECISION','NO_DELIVERY_CONFIRMED_BY_DECISION',
      'DISPUTE_REJECTED','DISPUTE_UPHELD'
    ) then
      required_fields := array['decision_id','dispute_id','introduction_record_id','decision_type','decided_at'];
      allowed_fields := required_fields || array['established_delivery_at','financial_consequence_ref'];
    else
      raise exception using errcode = '22023', message = 'LM-OUTBOX-EVENT-SCHEMA-UNKNOWN';
  end case;

  foreach field_name in array required_fields loop
    if not (p_payload ? field_name) or p_payload -> field_name = 'null'::jsonb then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-REQUIRED-FIELD';
    end if;
  end loop;
  if exists (
    select 1 from jsonb_object_keys(p_payload) supplied(field_name)
     where not (supplied.field_name = any(allowed_fields))
  ) then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-UNKNOWN-FIELD';
  end if;

  foreach field_name in array allowed_fields loop
    if not (p_payload ? field_name) then continue; end if;
    if field_name = any(uuid_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'string' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if p_payload ->> field_name !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-FORMAT';
      end if;
    elsif field_name = any(integer_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'number'
         or p_payload ->> field_name !~ '^-?[0-9]+(\.0+)?$' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if (p_payload ->> field_name)::numeric
         not between -9223372036854775808::numeric and 9223372036854775807::numeric then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
      end if;
    elsif field_name = any(timestamp_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'string' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if not leasemind_security.is_valid_rfc3339_timestamp(p_payload ->> field_name) then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-FORMAT';
      end if;
    elsif field_name = any(hash_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'string' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if p_payload ->> field_name !~ '^[a-f0-9]{64}$' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-FORMAT';
      end if;
    elsif jsonb_typeof(p_payload -> field_name) <> 'string' then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
    end if;
  end loop;

  if p_payload ? 'payer_assignment_version'
     and (
       (p_payload ->> 'payer_assignment_version')::numeric < 0
       or (
         p_event_type in (
           'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
           'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
           'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED',
           'FISCAL_CORRECTION_CONFIRMED',
           'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
           'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED',
           'FINANCIAL_READINESS_INVALIDATED','FINAL_SETTLEMENT_FISCALIZED'
         )
         and (p_payload ->> 'payer_assignment_version')::numeric < 1
       )
     ) then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'acceptance_aggregate_version'
     and (p_payload ->> 'acceptance_aggregate_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'identity_authority_version'
     and (p_payload ->> 'identity_authority_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'lawful_basis_version'
     and (p_payload ->> 'lawful_basis_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'previous_contact_decision_version'
     and (p_payload ->> 'previous_contact_decision_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'amount_minor'
     and (p_payload ->> 'amount_minor')::numeric not between 0 and 1000000 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'purpose_code'
     and char_length(p_payload ->> 'purpose_code') > 64 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-LENGTH';
  end if;
  if p_payload ? 'policy_version'
     and char_length(p_payload ->> 'policy_version') < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-LENGTH';
  end if;
  if p_payload ? 'currency' and p_payload ->> 'currency' <> 'RUB' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'payment_path'
     and p_payload ->> 'payment_path' not in ('DEBIT','CREDIT','MIXED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'resolution_state'
     and p_payload ->> 'resolution_state' not in ('ASSIGNED','PAYER_RESOLUTION_REQUIRED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_event_type = 'PAYER_ASSIGNED' and p_payload ->> 'resolution_state' <> 'ASSIGNED'
     or p_event_type = 'PAYER_RESOLUTION_REQUIRED' and p_payload ->> 'resolution_state' <> 'PAYER_RESOLUTION_REQUIRED' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_payload ? 'acceptance_status'
     and p_payload ->> 'acceptance_status' not in ('ACCEPTED','SUPERSEDED','INVALIDATED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_event_type = 'PARTICIPATION_ACCEPTED' and p_payload ->> 'acceptance_status' <> 'ACCEPTED'
     or p_event_type = 'PARTICIPATION_INVALIDATED' and p_payload ->> 'acceptance_status' not in ('SUPERSEDED','INVALIDATED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_payload ? 'authority_status'
     and p_payload ->> 'authority_status' not in ('VERIFIED','NOT_REQUIRED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'decision_status'
     and p_payload ->> 'decision_status' not in ('NO_PREVIOUS_CONTACT_CONFIRMED','PREVIOUS_CONTACT_CONFIRMED','UNDER_REVIEW','INCONCLUSIVE') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'evidence_classification'
     and p_payload ->> 'evidence_classification' not in ('SUFFICIENT','PARTIAL','CONTRADICTORY','ABSENT') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'decision_type'
     and p_payload ->> 'decision_type' not in ('DELIVERY_CONFIRMED_BY_DECISION','NO_DELIVERY_CONFIRMED_BY_DECISION','DISPUTE_REJECTED','DISPUTE_UPHELD') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'decision_type' and p_payload ->> 'decision_type' <> p_event_type then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;

  if p_payload ? 'reason_code' then
    if p_event_type in ('PAYER_ASSIGNED','PAYER_RESOLUTION_REQUIRED')
       and p_payload ->> 'reason_code' not in ('FIRST_VERIFIED_ACCEPTANCE','PAYER_ASSIGNMENT_CHANGED','CONCURRENT_ORDER_UNPROVABLE')
       or p_event_type in ('PARTICIPATION_ACCEPTED','PARTICIPATION_INVALIDATED')
       and p_payload ->> 'reason_code' not in ('USER_REVOKED','TERMS_VERSION_CHANGED','PAYER_REACCEPTANCE_REQUIRED','IDENTITY_AUTHORITY_CHANGED','ACCEPTANCE_SUPERSEDED')
       or p_event_type = 'IDENTITY_AUTHORITY_INVALIDATED'
       and p_payload ->> 'reason_code' not in ('IDENTITY_INVALIDATED','AUTHORITY_INVALIDATED','AUTHORITY_EXPIRED')
       or p_event_type in ('LAWFUL_BASIS_INVALIDATED','LAWFUL_BASIS_REVOKED')
       and p_payload ->> 'reason_code' not in ('INVALIDATED','REVOKED','EXPIRED','PROCESSING_PURPOSE_CHANGED')
       or p_event_type = 'PREVIOUS_CONTACT_DECISION_CHANGED'
       and p_payload ->> 'reason_code' not in ('DECISION_CREATED','EVIDENCE_ADDED','DECISION_REOPENED','DECISION_INVALIDATED')
       or p_event_type in (
         'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
         'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
         'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED','FISCAL_CORRECTION_CONFIRMED',
         'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
         'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED','FINANCIAL_READINESS_INVALIDATED',
         'FINAL_SETTLEMENT_FISCALIZED'
       ) and p_payload ->> 'reason_code' not in (
         'PROVIDER_RECONCILIATION_MISMATCH','KKT_OFD_RECONCILIATION_MISMATCH',
         'CREDIT_REVERSED','SECOND_PARTY_EXPOSURE_CHANGED','REFUND_AND_CORRECTION_COMPLETED'
       ) then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
    end if;
  end if;

  if p_payload ? 'from_state' then
    from_state := p_payload ->> 'from_state';
    to_state := p_payload ->> 'to_state';
    if from_state not in ('DRAFT','PRE_REVEAL_LOCKED','REVEAL_COMMITTED','REVEALED_ACTIVE','DISCLOSURE_DISPUTED','DISPUTED','EXPIRED','VOID_PRE_REVEAL','INVALIDATED_BY_DECISION')
       or to_state not in ('DRAFT','PRE_REVEAL_LOCKED','REVEAL_COMMITTED','REVEALED_ACTIVE','DISCLOSURE_DISPUTED','DISPUTED','EXPIRED','VOID_PRE_REVEAL','INVALIDATED_BY_DECISION') then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
    end if;
    if not (
      (p_event_type='RECORD_PRE_REVEAL_LOCKED' and from_state='DRAFT' and to_state='PRE_REVEAL_LOCKED')
      or (p_event_type='PRE_REVEAL_VOIDED' and from_state in ('DRAFT','PRE_REVEAL_LOCKED','DISCLOSURE_DISPUTED') and to_state='VOID_PRE_REVEAL')
      or (p_event_type='REVEAL_COMMITTED' and from_state='PRE_REVEAL_LOCKED' and to_state='REVEAL_COMMITTED')
      or (p_event_type='REVEAL_DELIVERY_CONFIRMED' and from_state='REVEAL_COMMITTED' and to_state='REVEALED_ACTIVE')
      or (p_event_type='REVEAL_DELIVERY_UNCERTAIN' and from_state='REVEAL_COMMITTED' and to_state='DISCLOSURE_DISPUTED')
      or (p_event_type='DISCLOSURE_CHALLENGED' and from_state='REVEALED_ACTIVE' and to_state='DISPUTED')
      or (p_event_type='PROTECTION_END_REACHED' and from_state='REVEALED_ACTIVE' and to_state='EXPIRED')
    ) then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
    end if;
  end if;

  if p_event_type = 'REVEAL_DELIVERY_CONFIRMED'
     and not (p_payload ?& array['established_delivery_at','protection_starts_at','protection_ends_at']) then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_event_type = 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED'
     and ((p_payload ->> 'evidence_classification') = 'SUFFICIENT') <> (p_payload ? 'established_delivery_at') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_event_type = 'DELIVERY_CONFIRMED_BY_DECISION'
     and not (p_payload ? 'established_delivery_at') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_event_type in ('NO_DELIVERY_CONFIRMED_BY_DECISION','DISPUTE_REJECTED','DISPUTE_UPHELD')
     and p_payload ? 'established_delivery_at' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;

  return true;
end;
$$;

revoke all on function leasemind_security.validate_event_payload(text, text, jsonb) from public;
revoke all on function leasemind_security.validate_no_direct_identifiers(jsonb) from public;
revoke all on function leasemind_security.is_valid_rfc3339_timestamp(text) from public;
revoke all on function leasemind_security.normalize_dlp_scalar(text) from public;
revoke all on function leasemind_security.normalize_dlp_key(text) from public;
revoke all on function leasemind_security.is_forbidden_dlp_key(text) from public;
revoke all on function leasemind_security.scan_dlp_scalar(jsonb) from public;

create function validate_event_outbox_domain()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  expected_producer text;
  allowed_event_types text[];
begin
  case new.domain_owner_role
    when 'leasemind_payer_writer' then
      expected_producer := 'payer-resolution';
      allowed_event_types := array['PAYER_ASSIGNED', 'PAYER_RESOLUTION_REQUIRED'];
    when 'leasemind_participation_writer' then
      expected_producer := 'participation';
      allowed_event_types := array['PARTICIPATION_ACCEPTED', 'PARTICIPATION_INVALIDATED'];
    when 'leasemind_previous_contact_writer' then
      expected_producer := 'legal-decision';
      allowed_event_types := array[
        'PREVIOUS_CONTACT_DECISION_CHANGED',
        'DELIVERY_CONFIRMED_BY_DECISION',
        'NO_DELIVERY_CONFIRMED_BY_DECISION',
        'DISPUTE_REJECTED',
        'DISPUTE_UPHELD'
      ];
    when 'leasemind_financial_writer' then
      expected_producer := 'payment-fiscal-ledger';
      allowed_event_types := array[
        'PAYMENT_AUTHORIZED',
        'PAYMENT_AUTHORIZATION_RELEASED',
        'ADVANCE_DEBIT_CONFIRMED',
        'CREDIT_APPLIED',
        'CREDIT_REVERSED',
        'ADVANCE_RECEIPT_FISCALIZED',
        'ADVANCE_SETTLED_AND_FISCALIZED',
        'REFUND_CONFIRMED',
        'FISCAL_CORRECTION_CONFIRMED',
        'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
        'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED',
        'FINANCIAL_READINESS_INVALIDATED',
        'FINAL_SETTLEMENT_FISCALIZED'
      ];
    when 'leasemind_identity_authority_writer' then
      expected_producer := 'identity-authority-registry';
      allowed_event_types := array['IDENTITY_AUTHORITY_INVALIDATED'];
    when 'leasemind_lawful_basis_writer' then
      expected_producer := 'lawful-basis-consent-registry';
      allowed_event_types := array['LAWFUL_BASIS_INVALIDATED', 'LAWFUL_BASIS_REVOKED'];
    when 'leasemind_introduction_writer' then
      expected_producer := 'introduction-record-service';
      allowed_event_types := array[
        'RECORD_PRE_REVEAL_LOCKED',
        'PRE_REVEAL_VOIDED',
        'REVEAL_COMMITTED',
        'REVEAL_DELIVERY_CONFIRMED',
        'REVEAL_DELIVERY_UNCERTAIN',
        'DISCLOSURE_CHALLENGED',
        'PROTECTION_END_REACHED'
      ];
    when 'leasemind_reveal_writer' then
      expected_producer := 'reveal-service';
      allowed_event_types := array['REVEAL_DELIVERY_EVIDENCE_SUBMITTED'];
    else
      raise exception using errcode = '42501', message = 'LM-OUTBOX-DOMAIN-UNKNOWN';
  end case;

  if new.producer <> expected_producer
     or not (new.event_type = any(allowed_event_types)) then
    raise exception using
      errcode = '42501',
      message = 'LM-OUTBOX-DOMAIN-MISMATCH';
  end if;
  perform leasemind_security.validate_no_direct_identifiers(
    jsonb_build_object(
      'trace_id', new.trace_id,
      'idempotency_key', new.idempotency_key,
      'producer', new.producer,
      'payload', new.payload
    )
  );
  perform leasemind_security.validate_event_payload(
    new.event_type,
    new.schema_version,
    new.payload
  );
  return new;
end;
$$;

create trigger validate_event_outbox_domain_before_insert
before insert on event_outbox
for each row execute function validate_event_outbox_domain();

create function protect_event_outbox_immutable_fields()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (to_jsonb(new) - 'published_at') is distinct from
     (to_jsonb(old) - 'published_at') then
    raise exception using errcode = '55000', message = 'LM-IMMUTABLE-ARTIFACT';
  end if;
  return new;
end;
$$;

create trigger protect_event_outbox_before_update
before update on event_outbox
for each row execute function protect_event_outbox_immutable_fields();

create policy event_outbox_domain_insert_policy on event_outbox
  for insert
  with check (domain_owner_role = current_user);

create policy event_outbox_domain_select_policy on event_outbox
  for select
  using (domain_owner_role = current_user);

create policy event_outbox_guard_insert_policy on event_outbox
  for insert
  with check (current_user = 'leasemind_guard_owner');

create policy event_outbox_guard_select_policy on event_outbox
  for select
  using (current_user = 'leasemind_guard_owner');

create policy event_outbox_publisher_policy on event_outbox
  for all
  using (current_user = 'leasemind_outbox_publisher')
  with check (current_user = 'leasemind_outbox_publisher');

create table event_inbox (
  consumer_id text not null,
  event_id uuid not null,
  payload_hash char(64) not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  result_hash char(64),
  processed_at timestamptz not null,
  primary key (consumer_id, event_id)
);

create table command_idempotency_result (
  owner_role name not null,
  service_id text not null,
  idempotency_key text not null,
  command_name text not null,
  request_payload_hash char(64) not null check (request_payload_hash ~ '^[a-f0-9]{64}$'),
  response_status integer not null check (response_status between 100 and 599),
  response_schema_version text not null,
  response_payload jsonb not null,
  response_payload_hash char(64) not null check (response_payload_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null,
  expires_at timestamptz not null,
  primary key (service_id, idempotency_key),
  check (expires_at > created_at)
);

alter table command_idempotency_result enable row level security;
alter table command_idempotency_result force row level security;

create function validate_command_idempotency_owner()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  expected_service text;
begin
  expected_service := case new.owner_role
    when 'leasemind_payer_writer' then 'payer-resolution'
    when 'leasemind_participation_writer' then 'participation'
    when 'leasemind_previous_contact_writer' then 'legal-decision'
    when 'leasemind_financial_writer' then 'payment-fiscal-ledger'
    when 'leasemind_identity_authority_writer' then 'identity-authority-registry'
    when 'leasemind_lawful_basis_writer' then 'lawful-basis-consent-registry'
    when 'leasemind_introduction_writer' then 'introduction-record-service'
    when 'leasemind_reveal_writer' then 'reveal-service'
  end;

  if expected_service is null or new.service_id <> expected_service then
    raise exception using
      errcode = '42501',
      message = 'LM-IDEMPOTENCY-OWNER-MISMATCH';
  end if;
  return new;
end;
$$;

create trigger validate_command_idempotency_owner_before_insert
before insert on command_idempotency_result
for each row execute function validate_command_idempotency_owner();

create policy command_idempotency_owner_policy on command_idempotency_result
  for all
  using (owner_role = current_user)
  with check (owner_role = current_user);

create function reject_immutable_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'LM-IMMUTABLE-ARTIFACT';
end;
$$;

create trigger immutable_command_idempotency_result
before update or delete on command_idempotency_result
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_gate_snapshot
before update or delete on reveal_gate_snapshot
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_gate_snapshot_source
before update or delete on reveal_gate_snapshot_source
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_gate_snapshot_party
before update or delete on reveal_gate_snapshot_party
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_attempt
before update or delete on reveal_attempt
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_delivery_evidence
before update or delete on reveal_delivery_evidence
for each row execute function reject_immutable_mutation();

create trigger immutable_decision_record
before update or delete on decision_record
for each row execute function reject_immutable_mutation();

revoke all on
  payer_resolution_aggregate,
  participation_acceptance,
  financial_intent,
  financial_ledger_event,
  source_reveal_lease,
  reveal_source_state,
  introduction_record,
  introduction_record_party,
  reveal_gate_snapshot,
  reveal_gate_snapshot_source,
  reveal_gate_snapshot_party,
  reveal_token,
  reveal_attempt,
  reveal_delivery_evidence,
  decision_record,
  event_outbox,
  event_inbox,
  command_idempotency_result
from public;

grant usage on schema leasemind_security to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant select on leasemind_security.reveal_guard to
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.apply_safety_critical_invalidation(
  reveal_source_system,
  uuid,
  uuid,
  bigint,
  bigint,
  timestamptz,
  text,
  uuid,
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  jsonb,
  char
) to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer;

grant execute on function leasemind_security.transition_source_reveal_lease(uuid, text, timestamptz) to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer;

grant select, insert on source_reveal_lease to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer;

grant select, insert, update on reveal_source_state to leasemind_guard_owner;
grant select, update on source_reveal_lease to leasemind_guard_owner;
grant select, insert on event_outbox to leasemind_guard_owner;

grant select on source_reveal_lease to
  leasemind_introduction_writer,
  leasemind_reveal_writer,
  leasemind_contract_reader;

grant select on reveal_source_state to
  leasemind_introduction_writer,
  leasemind_reveal_writer,
  leasemind_contract_reader;

grant select, insert, update on payer_resolution_aggregate to leasemind_payer_writer;
grant select, insert, update on participation_acceptance to leasemind_participation_writer;
grant select, insert on financial_intent, financial_ledger_event to leasemind_financial_writer;
grant select, insert, update on introduction_record, introduction_record_party to leasemind_introduction_writer;
grant select, insert on reveal_gate_snapshot, reveal_gate_snapshot_source, reveal_gate_snapshot_party to leasemind_introduction_writer;
grant select on reveal_gate_snapshot, reveal_gate_snapshot_source, source_reveal_lease
  to leasemind_guard_owner;
grant select, update on reveal_token to leasemind_guard_owner;
grant select, insert on reveal_attempt to leasemind_guard_owner;
grant select, insert on reveal_token to leasemind_reveal_writer;
grant select on reveal_attempt to leasemind_reveal_writer;
grant select, insert on reveal_delivery_evidence to leasemind_reveal_writer;
grant execute on function leasemind_security.redeem_reveal_token(
  uuid, char, text, char
) to leasemind_reveal_writer;
grant select, insert on decision_record to leasemind_previous_contact_writer;

grant select, insert on event_outbox to
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant usage on schema leasemind_security to
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.validate_event_payload(text, text, jsonb) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.validate_no_direct_identifiers(jsonb) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.is_valid_rfc3339_timestamp(text) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.normalize_dlp_scalar(text) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.normalize_dlp_key(text) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.is_forbidden_dlp_key(text) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.scan_dlp_scalar(jsonb) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant select, update (published_at) on event_outbox to leasemind_outbox_publisher;
grant select, insert, update on event_inbox to leasemind_event_consumer;
grant select, insert on command_idempotency_result to
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant select on
  payer_resolution_aggregate,
  participation_acceptance,
  financial_intent,
  financial_ledger_event,
  reveal_source_state,
  introduction_record,
  introduction_record_party,
  reveal_gate_snapshot,
  reveal_gate_snapshot_source,
  reveal_gate_snapshot_party,
  reveal_token,
  reveal_attempt,
  reveal_delivery_evidence,
  decision_record
to leasemind_contract_reader;
```

DDL рассчитан на PostgreSQL 15+. Partial unique indexes не считают `NULL` глобальным идентификатором и дедуплицируют только фактически присутствующие provider/receipt/credit keys. Owner roles, RLS для source-owned leases, `PUBLIC` revocation, минимальные grants и immutable triggers являются частью исполнимой migration. `leasemind_security.reveal_guard` находится в закрытой schema; security-definer функция использует только schema-qualified objects и `search_path = pg_catalog`. Прямой `UPDATE` guard прикладным ролям не выдается. Бизнес-переходы дополнительно проверяются transaction handlers; DDL не заменяет state machine.

---

## 6. Guards критической цепочки

### 6.1. `ADVANCE_SETTLED_AND_FISCALIZED`

Статус создается только одним из путей:

1. `DEBIT`: сумма подтвержденных debit events = 1 000 000 коп.; credit = 0; существует проверенный `advance_receipt_id`.
2. `CREDIT`: сумма `CREDIT_APPLIED` = 1 000 000 коп.; debit = 0; применение разрешено внешним BUSINESS/LEGAL решением; существует необходимый `advance_receipt_id`.
3. `MIXED`: сумма `CREDIT_APPLIED` + подтвержденный debit = 1 000 000 коп.; обе части > 0; существует единый или нормативно требуемый набор авансовых кассовых документов, представленный обязательным `advance_receipt_id`.

`CREDIT_REVERSED`, refund, correction, неизвестный provider status или несовпадение reconciliation инвалидируют financial readiness. Matching Engine не определяет допустимость кредита.

### 6.2. Source-owned Reveal leases

До commit Introduction Record Service получает шесть leases:

1. Participation;
2. Payer Resolution;
3. Previous Contact Decision;
4. Payment/Fiscal Ledger;
5. Identity/Authority Registry;
6. Lawful Basis/Consent Registry.

`reveal_guard` создаётся идемпотентным `SECURITY DEFINER` initializer при первом insert `payer_resolution_aggregate`; ручная инициализация доступна только Payer Resolution и Introduction Record roles. Source lease может быть создан только после guard и одновременно инициализирует `reveal_source_state` с той же версией. Прямой частичный `UPDATE` lease/guard source writer-ам не выдаётся.

Источник выдает lease в одной сериализуемой транзакции с чтением текущей версии. Обычная управляемая мутация во время active lease отклоняется кодом `LM-GATE-LEASED` или ставится в pending без commit. Правоограничивающий или внешний safety-critical факт — отзыв/прекращение lawful basis, invalidation identity/authority, provider/ККТ/ОФД reconciliation mismatch — не задерживается за lease: единственная owner-controlled операция `apply_safety_critical_invalidation` в одной PostgreSQL-транзакции проверяет source owner и ожидаемую source version, фиксирует следующую версию, переводит active lease в `REVOKED`, увеличивает `reveal_guard.guard_epoch` и записывает доменно допустимый outbox event. Повтор того же `event_id + payload_hash` идемпотентен; другой hash или stale expected version отклоняется без частичного состояния.

Token TTL не превышает минимальный `expires_at`. При redemption клиент передаёт только opaque raw credential в `Reveal-Token`, idempotency key и свой обычный authenticated session context. UUID `reveal_token_id` не является credential и сам по себе никогда не разрешает выдачу. Reveal Service вычисляет hash credential, сравнивает его с `token_hash` безопасным server-side способом и не принимает recipient, snapshot, manifest или leases из request body. Он получает authenticated recipient из доверенного auth context, блокирует строку `leasemind_security.reveal_guard` для encounter, server-side разрешает token → Snapshot → шесть normalized leases, сравнивает `guard_epoch`, source versions, lease states, expiry и fencing tokens, атомарно помечает token погашенным и создает attempt. Только после успешного commit разрешена выдача первого байта. Неверный/повторный token, истекший, отсутствующий, освобожденный, отозванный или несовпадающий lease/epoch блокирует выдачу. Source update, committed до атомарного redemption, поэтому виден независимо от задержки event bus; update после commit redemption является последующим фактом и не меняет уже записанный timestamp попытки.

Acceptance → Introduction Record → Snapshot не кодируется параллельными массивами. `introduction_record_party` связывает `acceptance_record_id + encounter_id + party_id + aggregate_version + terms_hash`; `reveal_gate_snapshot_party` повторяет это связывание только через composite FK к Record party. Deferred constraint triggers требуют точного набора из двух разных сторон и ролей `OWNER + TENANT` как для Record, так и для Snapshot. Смешивание encounter, party, acceptance version или terms hash не может быть committed.

`event_outbox` и `command_idempotency_result` являются shared infrastructure только физически. Логическая запись разделена FORCE RLS по `domain_owner_role`; triggers связывают роль с точным `producer`, разрешёнными event types и `service_id`. Сохранённый idempotency response неизменяем. Ни одна domain role не может выдать себя за другую или обновить её результат.

### 6.3. Record transition guards

- `DRAFT → PRE_REVEAL_LOCKED`: seed complete;
- `PRE_REVEAL_LOCKED → REVEAL_COMMITTED`: six leases active, snapshot hash valid, CAS success;
- `REVEAL_COMMITTED → REVEALED_ACTIVE`: только automatic `REVEAL_DELIVERY_CONFIRMED` с sufficient evidence и обязательным `established_delivery_at`;
- `REVEAL_COMMITTED → DISCLOSURE_DISPUTED`: timeout/partial/contradictory evidence;
- `DISCLOSURE_DISPUTED → REVEALED_ACTIVE|EXPIRED`: `DELIVERY_CONFIRMED_BY_DECISION`; target is `EXPIRED`, when decision time ≥ protection end calculated from proven delivery time;
- `DISCLOSURE_DISPUTED → VOID_PRE_REVEAL`: `NO_DELIVERY_CONFIRMED_BY_DECISION`;
- `REVEALED_ACTIVE → DISPUTED`: challenge registered;
- `DISPUTED → REVEALED_ACTIVE|EXPIRED`: `DISPUTE_REJECTED`;
- `DISPUTED → INVALIDATED_BY_DECISION`: `DISPUTE_UPHELD`.

`DISPUTE_REJECTED` и `DISPUTE_UPHELD` — события/decision types, не `record_state`.

---

## 7. Error Catalog v1.0

| Code | HTTP | Retryable | Owner | Значение |
| --- | ---: | --- | --- | --- |
| `LM-CONCURRENCY-VERSION-MISMATCH` | 409 | yes after reread | Aggregate owner | CAS version stale |
| `LM-IDEMPOTENCY-PAYLOAD-CONFLICT` | 409 | no | Command owner | Один key использован с другим payload hash |
| `LM-PAYER-NOT-CURRENT` | 422 | no | Payer Resolution | Financial command не для текущего плательщика |
| `LM-PAYER-UNRESOLVED` | 422 | no | Payer Resolution | Единственный плательщик не установлен |
| `LM-PAYER-FENCE-STALE` | 409 | yes after reread | Payer Resolution | Устаревшая payer assignment version/fencing token |
| `LM-GATE-LEASED` | 409 | yes after lease expiry | Source owner | Конфликтующая мутация заблокирована Reveal lease |
| `LM-GATE-LEASE-MISSING` | 422 | no | Introduction Record | Нет обязательного source lease |
| `LM-GATE-LEASE-SET-INCOMPLETE` | 422 | no | Introduction Record | Набор не содержит ровно по одному lease каждого из шести source owners |
| `LM-GATE-LEASE-EXPIRED` | 410 | yes after new snapshot | Source owner | Lease или token истек |
| `LM-GATE-EPOCH-MISMATCH` | 409 | yes after rebuild | Reveal Guard | Source update/revocation изменил strongly-consistent epoch до redemption |
| `LM-GATE-SNAPSHOT-STALE` | 409 | yes after rebuild | Introduction Record | Snapshot/source version не актуальны |
| `LM-FINANCIAL-SUM-MISMATCH` | 422 | no | Payment/Fiscal Ledger | Debit + credit не равны 10 000 ₽ |
| `LM-FINANCIAL-RECONCILIATION-UNKNOWN` | 409 | yes after reconcile | Payment/Fiscal Ledger | Provider/ККТ/ОФД не подтверждены |
| `LM-AUTHORIZATION-RELEASE-PENDING` | 409 | yes | Payment/Fiscal Ledger | Авторизация второй стороны еще не освобождена |
| `LM-CREDIT-NOT-ELIGIBLE` | 422 | no | Payment/Fiscal Ledger | Нет внешнего разрешения применить кредит |
| `LM-ADVANCE-RECEIPT-MISSING` | 422 | no | Payment/Fiscal Ledger | Нет обязательного чека аванса |
| `LM-REVEAL-MANIFEST-MISMATCH` | 409 | no | Reveal | Hash manifest не совпадает |
| `LM-REVEAL-RECIPIENT-MISMATCH` | 403 | no | Reveal | Получатель не совпадает с Record |
| `LM-REVEAL-CONTEXT-UNTRUSTED` | 403 | no | Reveal | Recipient/snapshot/lease context не получен из server-owned auth/token state |
| `LM-REVEAL-TOKEN-INVALID` | 403 | no | Reveal | Opaque credential отсутствует, неверен или не совпадает с server-side token hash |
| `LM-REVEAL-TOKEN-USED` | 409 | no, кроме возврата сохраненного idempotent result | Reveal | Одноразовый token уже погашен |
| `LM-REVEAL-EVIDENCE-INSUFFICIENT` | 422 | no | Introduction Record | Только disputed path |
| `LM-RECORD-TRANSITION-FORBIDDEN` | 422 | no | Introduction Record | Переход отсутствует в нормативной таблице |
| `LM-IMMUTABLE-ARTIFACT` | 409 | no | Aggregate owner | Запрещена мутация append-only Snapshot/Attempt/Evidence/Decision |
| `LM-LAWFUL-BASIS-INACTIVE` | 403 | no | Lawful Basis Registry | Основание отсутствует/истекло/отозвано |
| `LM-DATA-CLASSIFICATION-VIOLATION` | 422 | no | Security | Открытый идентификатор/запрещенное значение в payload |
| `LM-SCHEMA-MAJOR-UNSUPPORTED` | 422 | no | Consumer | Неизвестная major schema version |

Ответы не содержат открытых ПД, адресов, контактов, документов или свободного текста пользователя.

---

## 8. Compatibility и contract tests

Обязательный executable test suite:

1. для каждой OpenAPI operation существуют positive fixture и fixture каждого заявленного 4xx; все они проходят validation;
2. для каждого из 33 обязательных event types существует positive и malformed fixture; envelope и типизированный payload проходят AsyncAPI/JSON Schema validation, malformed fixture отклоняется;
3. unknown field отклоняется там, где `additionalProperties: false`;
4. additive optional field в minor-version принимается старым consumer;
5. удаление required field или изменение enum требует major-version;
6. неизвестная major-version дает `LM-SCHEMA-MAJOR-UNSUPPORTED`;
7. одинаковый `idempotency_key + payload_hash` возвращает сохраненный результат;
8. одинаковый idempotency key с другим hash дает `LM-IDEMPOTENCY-PAYLOAD-CONFLICT`;
9. duplicate non-null provider operation, receipt, credit application и inbox event нарушают unique constraint; независимые rows с `NULL` в этих полях не конфликтуют;
10. две нетерминальные пары, включая `PAYER_UNRESOLVED`, с одним `match_pair_id` нарушают partial unique constraint; `ASSIGNED` без payer IDs отклоняется;
11. debit/credit composition, не равная 1 000 000 коп., отклоняется;
12. `DEBIT`, `CREDIT` и `MIXED` проходят только при разрешенной структуре суммы и `advance_receipt_id`;
13. Snapshot без ровно одного lease каждого из шести `source_system` не commit;
14. обычный source update после lease не может commit до release/expiry; safety-critical update atomically revoke lease and increments guard epoch;
15. source update, committed до lease acquisition, входит новой version в snapshot;
16. source update/revocation, committed после snapshot и до token redemption при задержанном event, дает `LM-GATE-EPOCH-MISMATCH` до выдачи байтов;
17. token redemption после истечения любого lease возвращает `LM-GATE-LEASE-EXPIRED` до выдачи байтов;
18. внешний Reveal command принимает только `opaque_credential`, `idempotency_key` и `authenticated_session_context`; `recipient_party_id`, `encounter_id`, `introduction_record_id`, Snapshot, manifest, leases, fencing tokens, epoch и любой неизвестный context отклоняются точным `LM-REVEAL-CONTEXT-UNTRUSTED` до token lookup, создания Attempt или выдачи байтов;
19. `DELIVERY_CONFIRMED_BY_DECISION` без `established_delivery_at` отклоняется; защита считается от этого времени, а не от `decided_at`;
20. forbidden Record transition дает `LM-RECORD-TRANSITION-FORBIDDEN`;
21. наборы event types в таблице 45.1 Architecture, AsyncAPI, fixtures и DB allowlist совпадают; outbox row без обязательного envelope field, с unknown schema major, malformed либо нетипизированным payload отклоняется в той же транзакции до commit;
22. cross-domain write-role и прямой update `reveal_guard` отклоняются grants test;
23. events/traces с direct identifiers отклоняются DLP/data-classification guard;
24. deletion/crypto-unlink сохраняет только точный retention allowlist `unlink_operation_id`, `deletion_category`, `policy_version`, `deleted_at`, `deletion_act_hash`; исходные ID, payload, event/correlation hashes, ciphertext и иные связующие значения отсутствуют, а удалённую связь нельзя восстановить из tombstone;
25. redemption по одному `reveal_token_id`, без opaque `Reveal-Token`, отклоняется как `LM-REVEAL-TOKEN-INVALID`;
26. redemption одной транзакцией блокирует token/guard, создаёт ровно один immutable `reveal_attempt`, строит server-owned result и SHA-256 этого результата и только затем помечает token погашенным; caller не передаёт result/hash. Same key + same request возвращает тот же `reveal_attempt_id`; новый key после commit получает `LM-REVEAL-TOKEN-USED`; тот же key с другим request hash получает conflict. Две отдельные PostgreSQL connections проверяют race, а failure injection до Attempt и после token update подтверждает полный rollback;
27. каждый AsyncAPI address parameter объявлен и разрешается из типизированного payload;
28. AsyncAPI содержит 33 явные routing rows `event_type → owner_role → producer → consumer_operation`; все canonical invalidation reason codes раздела 40.1 архитектуры имеют positive fixture и попадают к точным owner/producer/consumer;
29. `REVEAL_COMMITTED → REVEALED_ACTIVE` по `DELIVERY_CONFIRMED_BY_DECISION` отклоняется; human delivery decision разрешён только из `DISCLOSURE_DISPUTED`;
30. пять отдельных операций с подменой Snapshot, Record, encounter, recipient и manifest нарушают составную целостность Token → Attempt; после каждого отказа отдельно подтверждается отсутствие строки, а точное составное связывание принимается;
31. UPDATE/DELETE Snapshot, Snapshot Source, Attempt, Evidence или Decision возвращает `LM-IMMUTABLE-ARTIFACT`;
32. для всех 30 ordered source-owner pairs роль одного source owner не может читать или изменять lease другого owner вне отдельно утверждённой минимальной read projection; выполняются отрицательные `SELECT` и `UPDATE`; прямой UPDATE `leasemind_security.reveal_guard` запрещён;
33. shadow object в `public` не влияет на `leasemind_security.bump_reveal_guard`.

Каждый CT result содержит `level`: `validator_fixture`, `service_behavior`, `database_behavior` или `static_schema_assertion`. Последний уровень может быть только дополнительным свидетельством и не создаёт самостоятельный `PASS`. Если обязательный validator, service или database scenario не выполнен, status обязан быть `NOT_RUN` либо `BLOCKED`; общий report не может иметь `PASS`.

Исполнимая матрица `tests/evidence_matrix.mjs` перечисляет exact dependencies каждого `CT-001–CT-033`. Для сценариев, где один dependency мог скрыть неполную проверку, матрица дополнительно требует машинно проверяемые semantic evidence: точные множества, измерения, минимальные количества операций и side-effect counters. Full runner не доверяет текстовой ссылке на `PG-*`: он разрешает ID и evidence по фактическому output PostgreSQL runner. Self-tests `EV-001–EV-007` намеренно удаляют, переименовывают и переводят dependency в non-PASS, удаляют обязательный counter и занижают его значение; такие случаи дают `NOT_RUN`/`BLOCKED`, а не `PASS`.

Для каждого canonical event type PostgreSQL suite строит negative mutations для каждого применимого ограничения каждого constrained field: missing/null required, JSON type, UUID, две независимые календарные RFC 3339 ошибки, SHA-256/pattern, enum, const, int64, minimum, maximum, minLength, maxLength, unknown field и event-specific condition. В зафиксированном clean run выполнены 33 positive и 1020 negative DB probes; каждый invalid probe отклонён до commit и отдельно проверен на отсутствие строки в outbox. Число mutations вычисляется из схемы и не подменяет поимённый evidence.

Runtime `DLP_EVENT_CONTENT_V1` независимо проверяет payload, trace и metadata. Обязательный corpus содержит 15 DB probes, включая email, карты, адреса, forbidden keys, российские телефоны с `+7`/`8` и без разделителей, а также паспорта с пробелами, дефисами и непрерывными десятью цифрами. DLP rejection возвращает только safe code, не отражает найденное значение и подтверждается отсутствием commit.

Фактические `openapi.yaml`, `asyncapi.yaml`, migrations, fixtures, service models, suite, immutable Markdown copies в `docs/` и `manifest.sha256` входят в каталог `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/`. CI фиксирует их SHA-256, версии validator tools и полный отчет. Утверждение пакета для `IMPLEMENTATION_READINESS_GATE` невозможно только по визуальному чтению Markdown: обязательны успешные machine-readable parse, `$ref` resolution, positive/negative schema validation, PostgreSQL migration-up/down в disposable DB и grants/invariant tests.

Contract tests входят в `IMPLEMENTATION_READINESS_GATE`; интеграционные и failure-injection сценарии входят в `SYNTHETIC_ACCEPTANCE_GATE`.

---

## 9. Совместимость версий

- patch: исправления без изменения схемы;
- minor: только новые optional поля/event types, которые старый consumer безопасно игнорирует по утвержденной policy;
- major: удаление/переименование поля, изменение required/nullable/type/enum semantics или state transition;
- producer публикует одну major-version на channel;
- consumer поддерживает текущую и одну предыдущую major-version только в утвержденный migration window;
- schema registry хранит content hash и запрещает замену опубликованной версии;
- каждая deployment manifest фиксирует exact contract version и hash.

---

## 10. Граница допуска

Статус `Proposal for DEVELOPMENT review` разрешает только проверку и синтетическую реализацию после прохождения `ARCHITECTURE_APPROVAL_GATE`. Пакет не разрешает production-платежи, реальные персональные данные или раскрытие.

### 10.1. Результат локальной синтетической проверки

На 2026-07-26 полный offline suite завершён со статусом `PASS`:

- `CT-001–CT-033`: `PASS`, каждый test ID содержит фактически выполненный evidence level; string/property-presence-only PASS отсутствует;
- OpenAPI: `@apidevtools/swagger-parser@12.1.0`, 9/9 operations, positive fixture каждой operation и fixture каждого объявленного 4xx;
- AsyncAPI: `@asyncapi/parser@3.6.0`, 33/33 canonical event fixtures и точное равенство Architecture/AsyncAPI/fixtures/outbox allowlist;
- JSON Schema: `ajv@8.20.0` с format validation;
- PostgreSQL 18.4 disposable cluster, удовлетворяющий требованию PostgreSQL 15+: exact `up → catalog/behavior/security assertions → down → empty post-down catalog`;
- runtime guard initializer, atomic safety-critical invalidation, idempotent replay и rollback: `PASS`;
- 33 valid outbox payloads приняты; 1020 schema-derived per-constrained-field mutations отклонены до commit, и отсутствие каждой rejected row подтверждено: `PASS`;
- runtime `DLP_EVENT_CONTENT_V1`: 15 payload/trace/metadata probes, включая нормализованные телефоны и паспорта, safe diagnostic и rollback: `PASS`;
- Reveal positive allowlist и отклонение всех 11 authoritative/unknown context fields, включая `encounter_id` и `introduction_record_id`, до side effects: `PASS`;
- atomic Token → immutable Attempt → server-owned result/hash: same/new idempotency key, payload conflict, две конкурирующие connections и failure injection до/после DB side effects: `PASS`;
- пять отдельных composite Token→Attempt mismatches, 12 UPDATE/DELETE immutable operations и hostile shadow-object behavior: `PASS`;
- 33 явные AsyncAPI routing rows и полная reason/owner/producer/consumer matrix: `PASS`;
- semantic evidence self-tests `EV-001–EV-007`, включая missing/undersized counters: `PASS`;
- cross-domain outbox, immutable idempotency и все 30 ordered source-owner `SELECT`/`UPDATE` pairs: `PASS`;
- внешний runner принимает `DATABASE_URL`, требует PostgreSQL 15+ и запускает тот же behavior/security suite;
- executable ZIP включает immutable Markdown copies в `docs/`; top-level submission manifest фиксирует три canonical artifact SHA-256 и запрещает suffix copies;
- source manifest и generated report имеют отдельные SHA-256.

Полные результаты находятся в `synthetic_verification_report.json`, а PostgreSQL execution trace — в `postgres_execution.log`. Этот PASS закрывает техническую проверяемость пакета, но не заменяет повторное заключение DEVELOPMENT и не переводит документ в `APPROVED`. До отдельного `PRODUCTION_LAUNCH_GATE` реальный runtime запрещён.
