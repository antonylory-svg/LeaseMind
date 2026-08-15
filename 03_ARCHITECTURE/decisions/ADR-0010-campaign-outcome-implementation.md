# ADR-0010 — Campaign Outcome Implementation

**Дата:** 2026-08-15
**Автор:** Lead Software Architect
**Статус:** Proposed for synthetic development only
**Нормативный PRODUCT-источник:** `02_PRODUCT/CAMPAIGN_OUTCOMES.md` v0.2 (Approved for synthetic development only)
**Объём:** Sprint 6, synthetic-only

## Контекст

`02_PRODUCT/CAMPAIGN_OUTCOMES.md` v0.2 утверждён и определяет PRODUCT-контракт `business_outcome`: пять terminal outcome codes, их детерминированный mapping на lifecycle status (`Completed`/`Failed`), правила первого пилота (только авторизованный администратор, явное подтверждение пользователя), правила неизменяемости истории и correction (единственный разрешённый для Sprint 6 `correction_reason_code = OUTCOME_CLASSIFICATION_CORRECTED`, correction обязана менять `outcome_code`), продуктовые требования к идемпотентности/конкуренции (`CO-C-011`–`CO-C-014`, `CO-C-026`, `CO-C-027`, `CO-C-030`) и безопасное UI-представление (`CO-C-029`: фиксированная формулировка «Уполномоченный администратор пилота», без raw `operator_ref`). Документ прямо делегирует DEVELOPMENT выбор транзакционного механизма, схемы хранения и ролей (раздел 1).

Текущая реализация Campaign:

- `leasemind_app.campaign_current_state_projection` (migration 001) — derived read-проекция, `status` из закрытого enum 11 значений.
- `leasemind_app.campaign_event_log` + `leasemind_app.campaign_stream_head` (migration 002, ADR-0002) — канонический источник истины lifecycle. Ровно тип события `campaign.status_recorded.v1` был расширен один раз (migration 006, ADR-0008) вторым типом `campaign.subject_linked.v1` через `DROP/ADD CONSTRAINT`, с раздельными per-event-type CHECK — прецедент того, что таблица технически расширяема без потери immutability/hash-chain гарантий. Append-only (`reject_campaign_event_log_mutation` — безусловный BEFORE UPDATE/DELETE trigger); TRUNCATE закрыт отсутствием гранта на эту привилегию ни у одной роли. Идемпотентность — `UNIQUE(campaign_id, idempotency_key)` + `command_hash`. Hash chain — `previous_event_hash`/`event_hash`, domain-separated SHA-256 (`LEASEMIND_CAMPAIGN_EVENT_V1`), вычисляется TypeScript-функцией `computeEventHash` (`apps/api/src/db/campaignEvents.ts`), не PL/pgSQL. Append одной Campaign сериализуется `SELECT ... FOR UPDATE` на `campaign_stream_head`.
- `apps/api/src/db/campaignEvents.ts`: `appendCampaignStatusEvent(pool, input)` — владеет собственным `pool.connect()/BEGIN/COMMIT`, не композируется с внешней транзакцией. `rebuildCampaignProjection`/`rebuildAllCampaignProjections` читают **последнюю строку по `event_sequence`** и ожидают `payload.status` — инвариант «последнее событие потока — всегда `campaign.status_recorded.v1`» поддерживается вызывающим кодом, не схемой.
- `apps/api/src/db/launchCampaign.ts` (`launchCampaignFromTechnicalAssignment`) — единственный существующий прецедент многотабличной атомарной команды поверх Campaign Event Log: **не переиспользует** `appendCampaignStatusEvent`, а инлайнит идентичную append-логику (лок stream head, вычисление `event_sequence`/`event_hash` через тот же `computeEventHash`, `INSERT` в `campaign_event_log`, `UPDATE campaign_stream_head`) внутри одной более широкой транзакции, дополнительно пишущей `campaign_subject_link_projection` (migration 008, ADR-0009 §3 — единственное существующее, надёжное доказательство того, что Campaign была запущена через реальный launch-flow, а не создана иным путём) и переводящей Technical Assignment в `campaign_started`.
- Least-privilege (ADR-0005/ADR-0007): для существующих Campaign-объектов (`campaign_event_log`, `campaign_stream_head`, `campaign_current_state_projection`) действующий grant-паттерн — **table-wide** `SELECT, INSERT` / `SELECT, INSERT, UPDATE` соответственно (не колоночный), одинаковой формы у `lmapp_maintainer` (migration 003) и `lmapp_campaign_writer` (migration 004) — без `DELETE`/`TRUNCATE` ни у одной роли. Каждый runtime-процесс проходит fail-closed `verifyRuntime*Privileges` (`apps/api/src/dbPrivilegePolicy.ts`) с точным allowlist (запрещающие условия ИЛИ недостающие обязательные права → `DatabasePrivilegeViolation`, единственный стабильный код наружу).
- ADR-0009 (`analysis_snapshot`) — прецедент отдельного append-only журнала рядом с Campaign Event Log, отдельной immutable idempotency-mapping таблицы (durable, append-only, «старый ключ никогда не переназначается» физически гарантировано отсутствием UPDATE/DELETE), двух-шаговой advisory-lock последовательности (idempotency-key lock → recheck в autocommit → `BEGIN REPEATABLE READ`), и operational CLI-транспорта для чувствительной команды (`revoke-evidence-dataset-cli.ts`: argument-parsing до любого DB-подключения, provably read-only dry-run по умолчанию, `--execute` для записи, отсутствие какого-либо переключателя synthetic→real).
- Тесты: `apps/api/tests/campaigns.test.ts` уже содержит прямой TypeScript-верификатор hash chain (`event_hash recomputes and matches; previous_event_hash forms a correct chain`, строка 514) — импортирует `computeEventHash`/`GENESIS_EVENT_HASH` напрямую и пересчитывает хэш каждой строки `campaign_event_log`. `apps/api/tests/dbPrivilegeBoundary.test.ts` — существующий паттерн проверки exact allowlist грантов. Отдельного `campaignEvents.test.ts` нет — hash-chain и append-логика тестируются через `campaigns.test.ts`/`createCampaignCommand.test.ts`.
- Независимый read-only архитектурный аудит Sprint 6 Campaign Outcomes (предшествующий этой ADR) идентифицировал риск: расширение `campaign_event_log` новыми event types технически возможно (прецедент — migration 006), но требует нетривиального изменения `rebuildCampaignProjection`, если outcome-события не гарантированно последние в потоке. Это решение выбирает архитектуру, при которой `campaign_event_log` не меняется вообще, а `rebuildCampaignProjection` не модифицируется.

## Решение

### 1. Обзор архитектурной границы

Отдельная outcome-модель, полностью совместимая с ADR-0002 без расширения его payload-контракта:

- `leasemind_app.campaign_outcome_event_log` — канонический immutable append-only журнал истории business outcome (раздел 2).
- `leasemind_app.campaign_outcome_current_projection` — mutable, полностью rebuildable проекция текущего effective outcome (раздел 3).
- `leasemind_app.campaign_outcome_idempotency_mapping` — immutable append-only durable idempotency mapping (раздел 4).
- Каждая успешно принятая (non-replay) `record`/`correct` команда атомарно, в одной транзакции, ДОПОЛНИТЕЛЬНО дописывает обычное, ничем не отличающееся от любого другого, событие `campaign.status_recorded.v1` в **существующий** `campaign_event_log` и обновляет **существующие** `campaign_stream_head`/`campaign_current_state_projection` (раздел 5) — используя существующую TypeScript-формулу `computeEventHash`, без PL/pgSQL реализации SHA-256 и без `pgcrypto`.
- `campaign_event_log` не получает новых event types, новых CHECK, новых колонок. `rebuildCampaignProjection` не меняется: последним событием любой Campaign в потоке по-прежнему остаётся `campaign.status_recorded.v1` — outcome-транзакция не нарушает и не может нарушить этот инвариант, так как сама всегда дописывает ровно такое событие последним в рамках своей транзакции.
- Запись — только через отдельный synthetic operational CLI (раздел 7), не HTTP. Никакого нового HTTP write endpoint, никакой пользовательской авторизации в этом ADR.
- Реализация — **application-controlled транзакция** на TypeScript (модуль по образцу `launchCampaign.ts`), не SECURITY DEFINER PL/pgSQL функции: `computeEventHash` — TypeScript-код, и SQL-функция не может самостоятельно проверить/воспроизвести domain-separated hash-chain формулу без дублирования логики хеширования в PL/pgSQL или подключения `pgcrypto` — ни то, ни другое не подтверждено в текущем foundation (`ADR-0001`). Соответственно новые таблицы принадлежат `lmapp_migrator` (как и все существующие Campaign-объекты), отдельная NOLOGIN owner-роль **не создаётся** — она нужна только при SECURITY DEFINER функциях, которых здесь нет.

### 2. Каноническая история outcome — `campaign_outcome_event_log`

```sql
CREATE TABLE leasemind_app.campaign_outcome_event_log (
  outcome_record_id uuid PRIMARY KEY
    CHECK (outcome_record_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),

  campaign_id uuid NOT NULL
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  outcome_sequence bigint NOT NULL
    CHECK (outcome_sequence >= 1),

  command_type text NOT NULL
    CHECK (command_type IN ('record', 'correct')),

  outcome_code text NOT NULL
    CHECK (outcome_code IN (
      'success_via_leasemind', 'success_independently', 'success_via_broker',
      'cancelled', 'expired'
    )),
  mapped_lifecycle_status text NOT NULL
    CHECK (mapped_lifecycle_status IN ('Completed', 'Failed')),
  -- Deterministic PRODUCT mapping (CAMPAIGN_OUTCOMES.md раздел 5) enforced at
  -- the database level, not only trusted from application code.
  CONSTRAINT campaign_outcome_event_log_mapping_valid CHECK (
    (outcome_code IN ('success_via_leasemind', 'success_independently', 'success_via_broker')
      AND mapped_lifecycle_status = 'Completed')
    OR (outcome_code IN ('cancelled', 'expired')
      AND mapped_lifecycle_status = 'Failed')
  ),

  confirmation_method text NOT NULL
    CHECK (confirmation_method = 'user_attestation'),
  -- Closed, opaque, non-PII format for Sprint 6 -- structurally cannot hold
  -- a name/email/phone/free text. See раздел 8 (CLI-контракт) for the
  -- matching CLI-side validation.
  operator_ref text NOT NULL
    CHECK (operator_ref ~ '^pilot-admin:[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),

  corrects_outcome_record_id uuid NULL,
  correction_reason_code text NULL
    CHECK (correction_reason_code = 'OUTCOME_CLASSIFICATION_CORRECTED'),
  -- Fail-closed differentiation between a primary record and a correction:
  -- a 'record' row can never carry correction fields and a 'correct' row can
  -- never omit them (CAMPAIGN_OUTCOMES.md раздел 7).
  CONSTRAINT campaign_outcome_event_log_correction_shape CHECK (
    (command_type = 'record' AND corrects_outcome_record_id IS NULL AND correction_reason_code IS NULL)
    OR (command_type = 'correct' AND corrects_outcome_record_id IS NOT NULL AND correction_reason_code = 'OUTCOME_CLASSIFICATION_CORRECTED')
  ),
  CONSTRAINT campaign_outcome_event_log_correction_not_self CHECK (
    corrects_outcome_record_id IS NULL OR corrects_outcome_record_id <> outcome_record_id
  ),

  -- Sprint 6 synthetic-only: this CHECK, not just application logic, refuses
  -- any 'real' value. Permitting 'real' requires a future migration + ADR
  -- revision -- the same escalation path already established for
  -- campaign_event_log's event_type (migration 006).
  runtime_mode text NOT NULL
    CHECK (runtime_mode = 'synthetic'),

  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  -- The resulting Campaign aggregate version -- always known before this row
  -- is inserted (раздел 5: the status event is appended first, inside the
  -- same transaction). No independently-checkable event_id column: the
  -- canonical identity of "which lifecycle event this outcome produced" is
  -- the composite (campaign_id, resulting_campaign_aggregate_version) below,
  -- resolved through campaign_event_log's own existing
  -- UNIQUE(campaign_id, event_sequence) -- not a second, separately-typed
  -- UUID reference that could in principle point at a different Campaign's
  -- event than resulting_campaign_aggregate_version implies.
  resulting_campaign_aggregate_version bigint NOT NULL
    CHECK (resulting_campaign_aggregate_version >= 1),

  -- Identity tuple correction: an outcome record is addressable by
  -- (campaign_id, outcome_record_id) as a unit, so correction/mapping FKs
  -- below can pin both columns together -- a correction can never
  -- reference another Campaign's outcome_record_id even if the UUID were
  -- somehow guessed/reused.
  CONSTRAINT campaign_outcome_event_log_identity_unique UNIQUE (campaign_id, outcome_record_id),
  CONSTRAINT campaign_outcome_event_log_sequence_unique UNIQUE (campaign_id, outcome_sequence),

  -- Row-content mirror of the two DB-level invariants below (shape CHECK +
  -- partial unique index): a 'record' row is always the first (sequence 1)
  -- of its Campaign; a 'correct' row is always sequence 2 or later. Closes
  -- the gap where the immutable table itself, absent this CHECK, would
  -- structurally permit more than one command_type='record' row per
  -- Campaign even though application logic already forbids it -- any role
  -- with a plain INSERT grant (not just the intended command path) is now
  -- also stopped by the table's own shape.
  CONSTRAINT campaign_outcome_event_log_sequence_shape CHECK (
    (command_type = 'record' AND outcome_sequence = 1)
    OR (command_type = 'correct' AND outcome_sequence >= 2)
  ),

  -- Composite self-FK: a correction can only ever reference an outcome
  -- record of the SAME campaign_id. MATCH SIMPLE (default) means this FK is
  -- trivially satisfied when corrects_outcome_record_id IS NULL (plain
  -- 'record' rows) -- no separate NULL-handling needed.
  CONSTRAINT campaign_outcome_event_log_correction_fk
    FOREIGN KEY (campaign_id, corrects_outcome_record_id)
    REFERENCES leasemind_app.campaign_outcome_event_log (campaign_id, outcome_record_id),

  -- Composite FK into the existing Campaign Event Log: ties this row to
  -- exactly the (campaign_id, event_sequence) pair it claims, using the
  -- already-existing UNIQUE(campaign_id, event_sequence) (migration 002) --
  -- physically impossible to reference another Campaign's lifecycle event.
  CONSTRAINT campaign_outcome_event_log_resulting_event_fk
    FOREIGN KEY (campaign_id, resulting_campaign_aggregate_version)
    REFERENCES leasemind_app.campaign_event_log (campaign_id, event_sequence)
);

-- Ровно одна command_type='record' строка на Campaign, обеспечено на уровне
-- БД, не только application-логикой: любая попытка второй первичной записи
-- (даже от роли, имеющей только разрешённый INSERT) отклоняется уникальным
-- constraint'ом до какой-либо проверки триггером.
CREATE UNIQUE INDEX campaign_outcome_event_log_one_record_per_campaign
  ON leasemind_app.campaign_outcome_event_log (campaign_id)
  WHERE command_type = 'record';
```

`campaign_id` намеренно **без** `REFERENCES campaign_current_state_projection` — тот же выбор, что уже сделан для `campaign_event_log.campaign_id` (migration 002): каноническая история не должна зависеть от существования производной проекции. Доказательство «Campaign успешно запущена» проверяется командой fail-closed на чтении `campaign_event_log`/`campaign_subject_link_projection` (раздел 5.2, раздел 7), а не FK здесь.

**Insert-verification trigger (fail closed на INSERT) — не заменяет application checks, защищает историю от прямого ошибочного `INSERT` любой ролью с разрешённым `INSERT`.** Composite FK и partial unique index выше гарантируют форму ссылок, но не всё содержимое и не полную цепочку correction. Единый `BEFORE INSERT` trigger подтверждает:

1. связанное lifecycle-событие (`resulting_campaign_aggregate_version`) — действительно `campaign.status_recorded.v1` с `payload.status`, равным `mapped_lifecycle_status` этой строки;
2. для `command_type = 'record'` — что у Campaign ещё нет вообще никакой outcome-истории (row-content дублирование partial unique index, а не просто полагание на него);
3. для `command_type = 'correct'` — что `corrects_outcome_record_id` совпадает с `current_outcome_record_id`, который `campaign_outcome_current_projection` указывает **на этот момент** (ещё до `UPDATE` шага 21'/раздел 5.3 — указатель на этот момент по-прежнему указывает на исправляемую запись, не на новую);
4. для `command_type = 'correct'` — что исправляемая запись имеет `outcome_sequence = NEW.outcome_sequence - 1` (непрерывность цепочки, без разрывов);
5. для `command_type = 'correct'` — что `outcome_code` новой строки отличается от `outcome_code` исправляемой (DB-level зеркало `CO-C-030`).

Любое нарушение — `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, ничего не записывается:

```sql
CREATE FUNCTION leasemind_app.verify_campaign_outcome_resulting_event() RETURNS trigger AS $$
DECLARE
  linked_event_type text;
  linked_status text;
  current_pointer_id uuid;
  corrected_sequence bigint;
  corrected_outcome_code text;
BEGIN
  -- (1) Resulting lifecycle-event identity/status.
  SELECT event_type, payload->>'status'
    INTO linked_event_type, linked_status
    FROM leasemind_app.campaign_event_log
   WHERE campaign_id = NEW.campaign_id
     AND event_sequence = NEW.resulting_campaign_aggregate_version;

  IF linked_event_type IS DISTINCT FROM 'campaign.status_recorded.v1' THEN
    RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: resulting event is not campaign.status_recorded.v1';
  END IF;
  IF linked_status IS DISTINCT FROM NEW.mapped_lifecycle_status THEN
    RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: resulting event status does not match mapped_lifecycle_status';
  END IF;

  IF NEW.command_type = 'record' THEN
    -- (2) No outcome history may exist yet for this Campaign.
    IF EXISTS (
      SELECT 1 FROM leasemind_app.campaign_outcome_event_log
       WHERE campaign_id = NEW.campaign_id
    ) THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: record inserted for a Campaign that already has outcome history';
    END IF;
  ELSE -- 'correct'
    -- (3) Must reference the CURRENT effective outcome, read at this exact
    -- moment -- the projection UPDATE (раздел 5.3, шаг 21') has not run yet.
    SELECT current_outcome_record_id INTO current_pointer_id
      FROM leasemind_app.campaign_outcome_current_projection
     WHERE campaign_id = NEW.campaign_id;

    IF current_pointer_id IS DISTINCT FROM NEW.corrects_outcome_record_id THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: correction does not reference the current effective outcome';
    END IF;

    SELECT outcome_sequence, outcome_code INTO corrected_sequence, corrected_outcome_code
      FROM leasemind_app.campaign_outcome_event_log
     WHERE campaign_id = NEW.campaign_id
       AND outcome_record_id = NEW.corrects_outcome_record_id;

    -- (4) Sequence continuity.
    IF corrected_sequence IS DISTINCT FROM NEW.outcome_sequence - 1 THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: correction sequence is not contiguous with the corrected record';
    END IF;
    -- (5) outcome_code must actually change.
    IF corrected_outcome_code IS NOT DISTINCT FROM NEW.outcome_code THEN
      RAISE EXCEPTION 'CAMPAIGN_OUTCOME_STATE_INCONSISTENT: correction outcome_code matches the corrected record';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION leasemind_app.verify_campaign_outcome_resulting_event() FROM PUBLIC;

CREATE TRIGGER campaign_outcome_event_log_verify_resulting_event
  BEFORE INSERT ON leasemind_app.campaign_outcome_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.verify_campaign_outcome_resulting_event();
```

`SECURITY INVOKER` по умолчанию (не `DEFINER`, раздел 1) — функция выполняется с правами роли, вызвавшей `INSERT` (`lmapp_campaign_outcome_writer`), которая уже имеет ровно нужные для этих чтений колоночные `SELECT`-гранты (раздел 8: `SELECT` на `campaign_outcome_event_log` и на `campaign_outcome_current_projection`). Обычный `SELECT`/сравнение строк — без SQL-реализации хеширования и без `pgcrypto` (тот же принцип, что раздел 1: hash-chain остаётся исключительно TypeScript-ответственностью, эта проверка её не касается).

**Immutability.** Ровно тот же паттерн, что `reject_campaign_event_log_mutation`/`reject_analysis_snapshot_idempotency_mapping_mutation`:

```sql
CREATE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'CAMPAIGN_OUTCOME_EVENT_LOG_IMMUTABLE: % is not permitted on leasemind_app.campaign_outcome_event_log', TG_OP;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation() FROM PUBLIC;

CREATE TRIGGER campaign_outcome_event_log_reject_update
  BEFORE UPDATE ON leasemind_app.campaign_outcome_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();

CREATE TRIGGER campaign_outcome_event_log_reject_delete
  BEFORE DELETE ON leasemind_app.campaign_outcome_event_log
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();

-- TRUNCATE bypasses row-level triggers entirely and, critically, bypasses
-- table privileges for the object OWNER (lmapp_migrator owns this table --
-- раздел 8 -- and an owner's implicit rights are not reducible by REVOKE).
-- Absence of a TRUNCATE grant only stops non-owner roles; it does not stop
-- lmapp_migrator itself. A statement-level BEFORE TRUNCATE trigger is the
-- only mechanism that blocks TRUNCATE unconditionally, including for the
-- owner.
CREATE TRIGGER campaign_outcome_event_log_reject_truncate
  BEFORE TRUNCATE ON leasemind_app.campaign_outcome_event_log
  FOR EACH STATEMENT EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_event_log_mutation();
```

Никакого `is_current`, `is_effective` или иного mutable-флага в этой таблице нет — прямое исправление ошибки первого архитектурного аудита (раздел «Обязательные исправления» ниже).

### 3. Effective outcome — `campaign_outcome_current_projection`

```sql
CREATE TABLE leasemind_app.campaign_outcome_current_projection (
  campaign_id uuid PRIMARY KEY
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  current_outcome_record_id uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  -- Composite FK: the pointer can only ever point at an outcome record of
  -- the SAME campaign_id -- physically impossible to point at another
  -- Campaign's effective outcome, even if current_outcome_record_id's UUID
  -- alone would otherwise resolve to a real row.
  CONSTRAINT campaign_outcome_current_projection_pointer_fk
    FOREIGN KEY (campaign_id, current_outcome_record_id)
    REFERENCES leasemind_app.campaign_outcome_event_log (campaign_id, outcome_record_id)
);
```

`campaign_id` как `PRIMARY KEY` — «не более одного effective outcome на Campaign» гарантировано структурой таблицы, не отдельным partial unique index: строка либо существует (effective outcome есть), либо нет (Campaign без outcome — включая legacy `Completed`/`Failed` без Sprint 6 записи, раздел 7). Ровно три колонки — канонический указатель, не денормализованная копия. `outcome_code`/`mapped_lifecycle_status` **не дублируются** здесь: их согласованность с журналом ничем, кроме дисциплины приложения, не гарантирована бы (composite FK этой таблицы гарантирует только то, что указатель ссылается на реальную строку той же Campaign — не то, что денормализованная копия полей этой строки не разошлась бы с журналом после гипотетического будущего изменения). Correction (раздел 5.3) и публичное чтение (раздел 10) получают `outcome_code`/`mapped_lifecycle_status` исключительно через `JOIN` с `campaign_outcome_event_log` по `current_outcome_record_id`.

Эта таблица **mutable** (обычный `UPDATE` колонки `current_outcome_record_id`/`updated_at` разрешён при correction) и **полностью rebuildable** из `campaign_outcome_event_log` в любой момент (раздел 12) — тот же статус, что у `campaign_current_state_projection` относительно `campaign_event_log`. Immutability-триггера здесь нет и не должно быть.

### 4. Идемпотентность — `campaign_outcome_idempotency_mapping`

```sql
CREATE TABLE leasemind_app.campaign_outcome_idempotency_mapping (
  idempotency_key text PRIMARY KEY
    CHECK (length(idempotency_key) > 0 AND length(idempotency_key) <= 200),
  command_hash char(64) NOT NULL
    CHECK (command_hash ~ '^[0-9a-f]{64}$'),

  campaign_id uuid NOT NULL
    CHECK (campaign_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  outcome_record_id uuid NOT NULL,

  accepted_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  -- Composite FK: a mapping row can only ever point at an outcome record of
  -- the SAME campaign_id it itself declares -- closes the theoretical gap
  -- where a single-column FK would let a mapping for Campaign A resolve to
  -- an outcome_record_id that actually belongs to Campaign B.
  CONSTRAINT campaign_outcome_idempotency_mapping_record_fk
    FOREIGN KEY (campaign_id, outcome_record_id)
    REFERENCES leasemind_app.campaign_outcome_event_log (campaign_id, outcome_record_id)
);
```

`idempotency_key` — **глобально** уникальный PRIMARY KEY (не `UNIQUE(campaign_id, idempotency_key)`, как у `campaign_event_log`) — PRODUCT §9 требует, чтобы старый ключ не мог быть повторно использован для иной команды вообще, а не только в рамках одной Campaign. Immutable по тому же паттерну, что `analysis_snapshot_idempotency_mapping` (ADR-0009 §5): без легитимного `UPDATE`, чистый append-only.

```sql
CREATE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'CAMPAIGN_OUTCOME_IDEMPOTENCY_MAPPING_IMMUTABLE: % is not permitted on leasemind_app.campaign_outcome_idempotency_mapping', TG_OP;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation() FROM PUBLIC;

CREATE TRIGGER campaign_outcome_idempotency_mapping_reject_update
  BEFORE UPDATE ON leasemind_app.campaign_outcome_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();

CREATE TRIGGER campaign_outcome_idempotency_mapping_reject_delete
  BEFORE DELETE ON leasemind_app.campaign_outcome_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();

-- Same reasoning as campaign_outcome_event_log (раздел 2): TRUNCATE bypasses
-- row-level triggers and the owner's (lmapp_migrator) implicit rights are
-- not reducible by REVOKE -- only a statement-level trigger blocks it
-- unconditionally, including for the owner.
CREATE TRIGGER campaign_outcome_idempotency_mapping_reject_truncate
  BEFORE TRUNCATE ON leasemind_app.campaign_outcome_idempotency_mapping
  FOR EACH STATEMENT EXECUTE FUNCTION leasemind_app.reject_campaign_outcome_idempotency_mapping_mutation();
```

**Нормализованная команда** (PRODUCT §9) — domain-separated SHA-256, вычисляемый в TypeScript, той же формы, что `analysis_snapshot`'s V2 `command_hash` (ADR-0009 §5):

```
command_hash = sha256Hex(
  "LEASEMIND_CAMPAIGN_OUTCOME_COMMAND_V1|" +
  command_type + "|" +
  campaign_id + "|" +
  outcome_code + "|" +
  confirmation_method + "|" +
  expected_campaign_version + "|" +
  (corrects_outcome_record_id ?? "") + "|" +
  (correction_reason_code ?? "")
)
```

Ни `idempotency_key`, ни `operator_ref`, ни `outcome_record_id` не входят в хэш — они не часть логического запроса. Две команды с разными `idempotency_key`, но одинаковым составом полей выше, дают одинаковый `command_hash` — это легитимное схождение (раздел 6), не аномалия.

## 5. Транзакционный flow: атомарность с Campaign lifecycle

### 5.1. Transaction-aware append primitive (рефакторинг `campaignEvents.ts`)

Текущий `appendCampaignStatusEvent(pool, input)` не композируется с внешней транзакцией (свой `pool.connect()/BEGIN/COMMIT`). `launchCampaign.ts` уже решает эту проблему дублированием append-логики внутри своей более широкой транзакции. Это решение фиксирует архитектурно (не как код, как обязательное требование к будущей реализации) выделение переиспользуемого transaction-aware primitive:

```ts
// apps/api/src/db/campaignEvents.ts (новая экспортируемая функция)
export async function appendCampaignStatusEventOnClient(
  client: pg.PoolClient,
  input: { campaignId: string; status: CampaignStatus; idempotencyKey: string }
): Promise<CampaignEvent>
```

**Однозначная семантика.** `appendCampaignStatusEventOnClient` выполняет **всю** существующую append-семантику `appendCampaignStatusEvent`, кроме владения транзакцией и владения stream-head lock:

1. idempotency resolution существующего Campaign status event — тот же fast-path `SELECT ... WHERE campaign_id=$1 AND idempotency_key=$2`, что и сегодня (безопасен и для нового вызывающего: namespaced-ключ outcome-команды гарантированно уникален, значит на первом проходе всегда «не найдено»).
2. Расчёт `event_sequence`/`event_hash` через существующий `computeEventHash`, тот же `DOMAIN_SEPARATOR`.
3. `INSERT` в `campaign_event_log`.
4. `UPDATE campaign_stream_head`.
5. `INSERT ... ON CONFLICT (campaign_id) DO UPDATE` в `campaign_current_state_projection` — **та же операция, что уже выполняет существующий `appendCampaignStatusEvent` сегодня** (это не новая ответственность primitive, а перенос уже существующей). Без этого шага `campaign_current_state_projection` осталась бы рассинхронизированной с `campaign_event_log` после каждого outcome-события — primitive обязан выполнять его, а не оставлять вызывающему коду отдельным шагом.

**Что primitive НЕ делает:** не открывает и не закрывает транзакцию, не делает `COMMIT`/`ROLLBACK`, не освобождает клиента; **не берёт и не создаёт** `campaign_stream_head` lock/строку сама — предполагает, что вызывающий код уже удерживает `SELECT ... FOR UPDATE` на существующей строке `campaign_stream_head` для этой Campaign (ensure/lock — обязанность вызывающего, не primitive). Повторное взятие того же row lock внутри уже открывшей его транзакции безопасно (PostgreSQL row locks реентерабельны в пределах одной транзакции) и не меняет порядок блокировок раздела 6, но primitive и не пытается его брать заново — она рассчитывает на уже установленный вызывающим кодом lock.

Существующая `appendCampaignStatusEvent(pool, input)` становится тонкой обёрткой, сохраняющей **весь** свой текущий внешний контракт, включая genesis-семантику для совершенно новой Campaign (используется `seed.ts`): `connect() → BEGIN → INSERT campaign_stream_head ... ON CONFLICT DO NOTHING (genesis) → SELECT ... FOR UPDATE → appendCampaignStatusEventOnClient(client, input) → COMMIT (или ROLLBACK при ошибке) → release()`. Genesis-создание и lock-acquisition остаются внутри этой обёртки, не внутри primitive — именно поэтому outcome-flow (раздел 5.2/5.3), которое **обязано** отказывать fail closed при отсутствии `campaign_stream_head`, а не создавать его, использует **только** `appendCampaignStatusEventOnClient` напрямую (после собственной, отдельной, non-genesis блокировки), никогда не вызывая обёртку `appendCampaignStatusEvent` целиком.

`launchCampaign.ts` может (не обязан в рамках этого ADR) быть отдельно отрефакторен на использование нового primitive вместо своей текущей дублированной копии — это не входит в объём Sprint 6 Campaign Outcome и не требуется для его корректности.

**Status-event idempotency key.** Server-derived, namespaced от `outcome_record_id`, гарантированно не конфликтует ни с caller-supplied ключами существующих команд, ни между двумя outcome-командами (каждая минтит собственный `outcome_record_id`):

```
statusEventIdempotencyKey = `campaign-outcome:${outcome_record_id}:status`
```

### 5.2. Полный flow — `record`

Все шаги — на одном выделенном `pg.PoolClient`, роль `lmapp_campaign_outcome_writer` (раздел 8). Освобождение advisory lock (шаг 22) выполняется в едином `finally`, покрывающем **все** пути выхода — успех, любая ошибка/`ROLLBACK`, replay через fast path или после ожидания lock — не только успешный `COMMIT`.

**Fast path (без lock).**
1. `SELECT command_hash, outcome_record_id FROM campaign_outcome_idempotency_mapping WHERE idempotency_key = $1` — безопасно без lock (append-only: видимая строка уже закоммичена и неизменна).
2. Найдено, `command_hash` совпал → replay: дополнительный `SELECT` по `outcome_record_id` (те же колонки, что грант раздела 8 — включая `recorded_at`/`confirmation_method`/`resulting_campaign_aggregate_version`) возвращает полноценный machine-readable snapshot исходно принятой записи, не только её идентификатор; ничего не пишется, Campaign version не меняется.
3. Найдено, `command_hash` не совпал → `CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT`, ничего не писать.
4. Не найдено → к шагу 5.

**Ключ не найден.**
5. Session-level advisory lock на выделенном клиенте, **до `BEGIN`**, autocommit: `pg_advisory_lock(hashtextextended('campaign-outcome:idempotency-key:' || $1, 0))`.
6. Повторное чтение mapping тем же запросом, что и шаг 1 (TOCTOU close). Появилось за время ожидания lock → обработать как шаги 2/3, unlock, выйти без `BEGIN`.
7. Всё ещё не найдено → `BEGIN ISOLATION LEVEL READ COMMITTED` (не `REPEATABLE READ` — см. раздел 6 для обоснования).
8. `SELECT current_sequence, current_event_hash FROM campaign_stream_head WHERE campaign_id = $1 FOR UPDATE` — **без** предварительного `INSERT ... ON CONFLICT DO NOTHING` (outcome-flow никогда не создаёт genesis head, ни в этом, ни в любом другом ветвлении).
   - **Строка найдена** → к шагу 9.
   - **Строка не найдена** — отсутствие `campaign_stream_head` само по себе не классифицируется однозначно как `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED`: дополнительно проверяются оба launch-proof источника (те же `EXISTS`, что шаг 9), чтобы отличить обычное «Campaign действительно не запущена» от испорченного состояния:
     - оба launch-proof источника отсутствуют → `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED` (`CO-C-003`), `ROLLBACK` — ожидаемый, штатный случай для незапущенной Campaign.
     - хотя бы один launch-proof источник присутствует (`campaign.subject_linked.v1` в `campaign_event_log` и/или строка `campaign_subject_link_projection` существует, но `campaign_stream_head` — нет) → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, `ROLLBACK` — при корректной работе `launchCampaign.ts` невозможно (все три создаются одной атомарной транзакцией), сигнал повреждённого состояния, не обычный отказ команды.
9. **Launch-proof — двойная серверная проверка, не одиночный флаг** (выполняется для случая, когда `campaign_stream_head` уже найден шагом 8): `EXISTS (SELECT 1 FROM campaign_event_log WHERE campaign_id = $1 AND event_type = 'campaign.subject_linked.v1')` **и** `EXISTS (SELECT 1 FROM campaign_subject_link_projection WHERE campaign_id = $1)`.
   - Оба `true` → launch подтверждён, к шагу 10.
   - Оба `false` → `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED` (`CO-C-003`), `ROLLBACK` — не должно происходить, если `campaign_stream_head` уже найден (тот же атомарный launch создаёт все три объекта вместе), но проверяется явно, а не предполагается.
   - Ровно один `true` (immutable event существует без projection-строки, или наоборот) → рассинхронизация между каноническим Event Log и его derived-проекцией → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, `ROLLBACK`.
10. `SELECT status, aggregate_version FROM campaign_current_state_projection WHERE campaign_id = $1` (строка уже эффективно защищена сериализацией stream head, шаг 8, в `READ COMMITTED` — см. раздел 6). Канонический источник версии для сравнения с клиентским `expected_campaign_version` — `campaign_stream_head.current_sequence` (шаг 8), не `campaign_current_state_projection.aggregate_version` напрямую. `current_sequence <> expected_campaign_version` → `CAMPAIGN_OUTCOME_VERSION_CONFLICT`, `ROLLBACK`.
11. Внутренняя согласованность: `campaign_current_state_projection.aggregate_version` должен точно равняться `campaign_stream_head.current_sequence` (оба уже прочитаны, шаги 8/10). Расхождение → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, `ROLLBACK` (проекция рассинхронизирована с канонической sequence — сигнал требующей внимания проблемы, не обычный отказ команды).
12. `status = 'Paused'` → `CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE` (`CO-C-004`), `ROLLBACK`. **Любой другой утверждённый lifecycle status допустим** — включая активные (`Analyzing`, `Searching`, `Negotiating` и т.д.) и уже terminal (`Completed`/`Failed`, legacy Campaign без outcome): `record` не требует, чтобы Campaign уже была terminal — сама команда атомарно выполняет terminal-переход шагом 16.
13. `SELECT current_outcome_record_id FROM campaign_outcome_current_projection WHERE campaign_id = $1`. Строка существует → `CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS` (`record` запрещён, требуется `correct`), `ROLLBACK`.
14. Определить `mapped_lifecycle_status` по `outcome_code` (детерминированный mapping, раздел 2 — совпадает с DB CHECK и с cross-consistency trigger'ом).
15. Сминтить `outcome_record_id` (UUID v4, приложением). Вычислить `statusEventIdempotencyKey`.
16. `appendCampaignStatusEventOnClient(client, { campaignId, status: mapped_lifecycle_status, idempotencyKey: statusEventIdempotencyKey })` — на **уже удерживаемом** с шага 8 stream-head lock (primitive не берёт и не создаёт его заново, раздел 5.1). **Всегда** выполняется, даже если `mapped_lifecycle_status` совпадает с текущим `status` (шаг 10/12). Возвращает `{ eventSequence }` и **уже включает** `INSERT/UPDATE campaign_current_state_projection` внутри себя (раздел 5.1) — отдельного шага `UPDATE campaign_current_state_projection` здесь нет и не должно быть.
17. `outcome_sequence = COALESCE((SELECT MAX(outcome_sequence) FROM campaign_outcome_event_log WHERE campaign_id = $1), 0) + 1` (защищено той же сериализацией stream head — outcome-команды одной Campaign не выполняются конкурентно, раздел 6).
18. `INSERT INTO campaign_outcome_event_log (...)` — один `INSERT`, все поля известны на этот момент, включая `resulting_campaign_aggregate_version` (`eventSequence` из шага 16). Composite FK и cross-consistency trigger (раздел 2) проверяют ссылку на связанное lifecycle-событие автоматически. **Не** требует последующего `UPDATE`.
19. `INSERT INTO campaign_outcome_idempotency_mapping (idempotency_key, command_hash, campaign_id, outcome_record_id, accepted_at) VALUES ($1, $2, $3, $4, clock_timestamp())`.
20. `INSERT INTO campaign_outcome_current_projection (campaign_id, current_outcome_record_id, updated_at) VALUES (...)` (для `record` строки ещё нет — обычный `INSERT`, не `UPSERT`; таблица теперь ровно из трёх колонок, раздел 3).
21. `COMMIT`.
22. `finally`: `pg_advisory_unlock(...)` — на всех путях (успех, ошибка, replay). Неопределённость подтверждения unlock (сетевая ошибка, `false`, исключение) → клиент уничтожается, не возвращается в pool (тот же принцип ADR-0009 §6, шаг 10).

### 5.3. Полный flow — `correct`

Шаги 1–11 идентичны `record` (включая launch-proof и внутреннюю consistency-проверку). Далее:

12'. `status NOT IN ('Completed', 'Failed')` (значение уже прочитано шагом 10) → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, `ROLLBACK`. Effective outcome может существовать только после успешного `record`, который сам атомарно выполняет terminal-переход (раздел 5.2, шаг 16) — если на этот момент Campaign не terminal, это сигнал рассинхронизации, а не обычный отказ `correct`.
13'. `SELECT p.current_outcome_record_id, l.outcome_code, l.mapped_lifecycle_status FROM campaign_outcome_current_projection p JOIN campaign_outcome_event_log l ON l.campaign_id = p.campaign_id AND l.outcome_record_id = p.current_outcome_record_id WHERE p.campaign_id = $1 FOR UPDATE` (join — таблица-проекция не хранит `outcome_code`/`mapped_lifecycle_status` денормализованно, раздел 3). Строки нет → `CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME` (нечего исправлять), `ROLLBACK`.
14'. `status` (шаг 10) должен точно равняться `mapped_lifecycle_status` текущей effective-записи (шаг 13'). Расхождение → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, `ROLLBACK`.
15'. CLI-переданный `--corrects-outcome-record-id` должен совпасть с `current_outcome_record_id` из шага 13'. Не совпал (в т.ч. ссылка на superseded запись) → `CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE` (`CO-C-026`), `ROLLBACK`, ничего не пишется.
16'. Новый `--outcome-code` равен текущему `outcome_code` (шаг 13') → `CAMPAIGN_OUTCOME_SAME_CODE_REJECTED` (`CO-C-030`), `ROLLBACK`: без новой записи, без изменения lifecycle status, без изменения Campaign version.
17'. Определить новый `mapped_lifecycle_status`. Может как измениться (terminal-to-terminal, `Completed ↔ Failed`), так и остаться прежним классом (например, `success_via_leasemind → success_independently`, либо `cancelled → expired`) — в обоих случаях шаг 18' выполняется безусловно.
18'. Сминтить новый `outcome_record_id`. `appendCampaignStatusEventOnClient(...)` с `status = new mapped_lifecycle_status` — **всегда**, даже когда значение совпадает с текущим `status` Campaign (обязательное правило PRODUCT §5/этого ADR раздела 5: ровно одно новое status-событие и `aggregate_version + 1` на каждую принятую non-replay команду, без исключений). Включает `UPDATE campaign_current_state_projection` внутри себя (раздел 5.1) — отдельного шага здесь нет.
19'. `INSERT INTO campaign_outcome_event_log (..., command_type='correct', corrects_outcome_record_id = <шаг 13'>, correction_reason_code='OUTCOME_CLASSIFICATION_CORRECTED', resulting_campaign_aggregate_version = <eventSequence шага 18'>, ...)`.
20'. `INSERT INTO campaign_outcome_idempotency_mapping (...)`.
21'. `UPDATE campaign_outcome_current_projection SET current_outcome_record_id = <новый>, updated_at = clock_timestamp() WHERE campaign_id = $1` (в отличие от `record` — всегда `UPDATE`, строка уже существует по построению шага 13'; только `current_outcome_record_id`/`updated_at` — таблица трёх колонок, раздел 3).
22'. `COMMIT`.
23'. `finally`: unlock (как в 5.2, шаг 22).

Старая строка `campaign_outcome_event_log` (та, на которую ссылался `corrects_outcome_record_id`) **не изменяется и не удаляется** — она просто перестаёт быть той, на которую указывает `campaign_outcome_current_projection`.

## 6. Конкуренция и порядок блокировок

Единый порядок для `record` и `correct`:

1. idempotency-key advisory lock (session-level, до `BEGIN`, autocommit).
2. повторная проверка mapping под этим lock.
3. `BEGIN ISOLATION LEVEL READ COMMITTED`.
4. `SELECT current_sequence, current_event_hash FROM campaign_stream_head WHERE campaign_id = $1 FOR UPDATE` — единственная точка «логической» сериализации для конкретной Campaign; переиспользует существующий физический механизм (не вводится отдельный второй advisory lock на Campaign — `campaign_stream_head`'s row lock уже и есть эта сериализация, ровно как сегодня для lifecycle append). Строки нет — Campaign не запущена штатно, отказ fail closed (раздел 5.2, шаг 8), genesis-строка outcome-командой не создаётся.
5. чтение/проверка launch-proof, `expected_campaign_version`, внутренней согласованности и `campaign_outcome_current_projection` — уже под защитой шага 4, в `READ COMMITTED`.
6. выполнение атомарной команды (раздел 5.2/5.3).

**Почему `READ COMMITTED`, а не `REPEATABLE READ`.** Предыдущая версия этого ADR ошибочно использовала `BEGIN ISOLATION LEVEL REPEATABLE READ` вместе с попыткой создать `campaign_stream_head` через `INSERT ... ON CONFLICT DO NOTHING` **до** получения row lock — при таком порядке snapshot транзакции мог устанавливаться до того, как конкурирующая транзакция успевала закоммититься и освободить lock, из-за чего утверждение «вторая транзакция увидит commit первой» было неверным (в отличие от ADR-0009 §6, где `BEGIN REPEATABLE READ` действительно выполняется **после** гарантированного получения обоих advisory lock — здесь такой гарантии не было из-за смешения `INSERT ... ON CONFLICT` с `FOR UPDATE`). Исправление: `READ COMMITTED` (шаг 3) — каждый новый оператор внутри транзакции получает собственный, свежий snapshot на момент своего выполнения; после того как `SELECT ... FOR UPDATE` (шаг 4) реально дождался и получил row lock (то есть предыдущий владелец лока уже закоммитил или откатился), **все последующие** операторы этой транзакции в `READ COMMITTED`, включая повторные чтения того же ряда, детерминированно видят последний закоммиченный на этот момент state — без какой-либо зависимости от того, когда именно был установлен snapshot самой транзакции. Genesis-строка outcome-командой никогда не создаётся (раздел 5.2, шаг 8) — только `SELECT ... FOR UPDATE` на уже существующей строке.

**Почему это не создаёт deadlock.** Тот же аргумент, что ADR-0009 §6 «Почему именно такой порядок…»: любые две команды, конкурирующие за один и тот же логический запрос (один и тот же `idempotency_key`), сериализуются на шаге 1 ещё до попытки взять lock stream head — вторая уже увидит mapping на шаге 2. Любые две команды с разными ключами для одной Campaign никогда не ждут чужой idempotency-key lock — они сериализуются исключительно на shared `campaign_stream_head` row lock (шаг 4), который уже сегодня сериализует все lifecycle-append для этой Campaign; добавление outcome-команд в тот же порядок ожидания не создаёт нового ресурса, а значит не создаёт нового кругового ожидания.

**Разобранные сценарии:**

- **same key / same command** — fast path (или после ожидания lock) возвращает исходно принятую запись; новая не создаётся; version не меняется.
- **same key / different command** — `CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT`, ничего не пишется, mapping не создаётся.
- **разные ключи одной Campaign (конкурентно)** — обе проходят разные idempotency-key locks без конфликта на шаге 1, затем сериализуются на `campaign_stream_head FOR UPDATE` (шаг 4). Первая коммитит и освобождает row lock; вторая, дождавшись и получив этот lock, читает состояние (шаг 5) уже в `READ COMMITTED` — детерминированно видит результат первой команды, без зависимости от момента установки snapshot (см. обоснование выше). Если обе были `record` — вторая получает `CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS`. Если версии разошлись — `CAMPAIGN_OUTCOME_VERSION_CONFLICT`. Никогда не возникает двух effective outcomes.
- **version conflict** — `expected_campaign_version` не совпал с каноническим `campaign_stream_head.current_sequence` → отказ целиком, `ROLLBACK`, ничего не создаётся и не изменяется.
- **correction текущей записи** — `corrects_outcome_record_id` (CLI-аргумент) совпал с `campaign_outcome_current_projection.current_outcome_record_id` → принимается.
- **correction superseded записи** — не совпал → `CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE`, без изменений (`CO-C-026`).
- **replay старого record key после correction** — старый ключ по-прежнему указывает (через immutable mapping) на исходную `record`-строку; fast path шага 1 возвращает именно её, независимо от того, сколько `correct` команд с тех пор прошло и что сейчас указывает `campaign_outcome_current_projection` (`CO-C-027`). Отдельное чтение effective outcome (раздел 10) — независимая read-операция, не связанная с idempotency mapping.
- **same-code correction** — отклоняется на шаге 16' до какой-либо записи, `Campaign version` не меняется (`CO-C-030`).
- **crash до `COMMIT`** — соединение обрывается, PostgreSQL откатывает транзакцию автоматически; session-level advisory lock освобождается вместе с завершением сессии, даже без явного `pg_advisory_unlock`; mapping не был закоммичен → повтор с тем же ключом безопасно начинает заново с fast path (не находит mapping).
- **crash после `COMMIT`, до подтверждения ответа оператору** — mapping уже durably закоммичен; повтор с тем же ключом попадает в fast-path replay и возвращает уже принятый результат — без дублирования.
- **crash после `COMMIT`, до подтверждённого unlock** — клиент уничтожается (не возвращается в pool); lock — session-scoped, освобождается при закрытии этой конкретной сессии; следующая попытка получает лок на новом клиенте штатно.

Двух effective outcomes для одной Campaign быть не может: `campaign_outcome_current_projection.campaign_id` — `PRIMARY KEY`; любая гонка либо сериализуется через `campaign_stream_head`, либо отклоняется идемпотентностью.

## 7. Правила Campaign (PRODUCT v0.2, строго)

- **Launch-proof — только серверная модель, двойная проверка.** `EXISTS` на immutable `campaign.subject_linked.v1` в `campaign_event_log` **и** на согласованную строку `campaign_subject_link_projection` (шаг 9, раздел 5.2) — единственное доказательство «Campaign успешно запущена». Ни `record`, ни `correct` не принимают и не доверяют никакому CLI-флагу, утверждающему факт запуска. Рассинхронизация между этими двумя источниками (один есть, другого нет) — `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, не тихое принятие и не молчаливый отказ.
- **`Paused` никогда не создаёт outcome** — `record` для Campaign в `Paused` безусловно отклоняется (`CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE`, `CO-C-004`), до какой-либо записи. Это **единственное** lifecycle-состояние, отклоняющее `record` по причине текущего статуса.
- **`record` разрешён для любой успешно запущенной Campaign, не в `Paused`, без текущего effective outcome — включая активные статусы.** Campaign НЕ обязана быть заранее переведена в `Completed`/`Failed` до вызова `record`: сама команда атомарно пишет status-событие с `mapped_lifecycle_status` (шаг 16, раздел 5.2), переводя любую допустимую Campaign (в том числе всё ещё активную — `Analyzing`, `Searching`, `Negotiating` и т.д.) в terminal-статус за один шаг. `CO-C-003` относится исключительно к отсутствию launch-proof (Campaign вообще не запущена) — не к тому, что Campaign уже активна после успешного запуска; активная запущенная Campaign **не** отклоняется `record`.
- **Существующая до Sprint 6 Campaign без outcome — только через явную `record`, без backfill.** Ничто в этом ADR не сканирует существующие `Completed`/`Failed` Campaign и не создаёт для них строки задним числом. Такая Campaign допускает ровно одну явную `record`-команду (проходит те же проверки шагов 9–13, включая launch-proof и отсутствие текущего effective outcome) — после этого она становится «созревшей» в терминах `CAMPAIGN_OUTCOMES.md`/`ANALYSIS_SNAPSHOT.md` §9.8, но не раньше и не автоматически (`CO-C-028`).
- **Effective outcome уже существует → только `correct`.** Повторный `record` для Campaign, уже имеющей строку в `campaign_outcome_current_projection`, отклоняется (`CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS`).
- **`correct` требует terminal Campaign, согласованную с effective outcome.** В отличие от `record`, `correct` фактически применим только когда Campaign уже terminal (effective outcome может существовать только после того, как предыдущий `record` уже атомарно выполнил terminal-переход) — `correct` явно проверяет это (раздел 5.3, шаг 12'–14'): `status NOT IN ('Completed', 'Failed')`, либо `status`, расходящийся с `mapped_lifecycle_status` текущей effective-записи, → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, без записи. Это defense-in-depth против рассинхронизации, а не обычный продуктовый отказ.
- **Correction — только terminal-to-terminal.** `correct` может изменить `mapped_lifecycle_status` только между `Completed` и `Failed` — оба допустимых значения CHECK-constraint'а раздела 2; никакой третий (активный, non-terminal) статус не входит в допустимые значения `mapped_lifecycle_status`, поэтому correction физически не может вернуть Campaign в активный статус.
- **Новых lifecycle statuses не вводится.** `mapped_lifecycle_status` — подмножество уже утверждённых 11 значений `campaign_status` enum (migration 001); `campaign.status_recorded.v1`'s payload CHECK (migration 002/006) не меняется.

## 8. Runtime и безопасность

**Только synthetic CLI, никакого HTTP.** Ни `app.ts`, ни OpenAPI не получают новый write-маршрут в этом ADR. Пользовательская authn/authz — вне объёма (в кодовой базе её не существует вообще; операционный доступ к CLI/окружению — единственная существующая граница доверия, тот же принцип, что уже применён к `migrate`/`seed`/`provision-roles`/`revoke-evidence-dataset`).

**Новая LOGIN-роль:** `lmapp_campaign_outcome_writer` — не superuser, без `CREATEDB`/`CREATEROLE`/`REPLICATION`/`BYPASSRLS`, `NOINHERIT`, не член никакой другой роли. Используется исключительно новым CLI (раздел 9), никогда — `server.ts`, `worker.ts`, frontend. Отдельная строка подключения `LEASEMIND_CAMPAIGN_OUTCOME_DATABASE_URL`, отдельный пароль `LEASEMIND_CAMPAIGN_OUTCOME_WRITER_PASSWORD` — provisioning по идентичному циклу `provisionRoles.ts` (idempotent `CREATE ROLE`/безусловный `ALTER ROLE ... NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`), точечный `GRANT CONNECT` (allow-list, не default-on).

**Владение объектами:** `lmapp_migrator` — та же роль, что владеет `campaign_event_log`/`campaign_stream_head`/`campaign_current_state_projection`/`property`/`tenant_request`. Отдельная NOLOGIN owner-роль **не вводится** — она была бы нужна только для SECURITY DEFINER функций (ADR-0009 §10, `lmapp_post_launch_refresh_owner`), которых это решение сознательно не использует (Контекст/раздел 1).

**Точный allowlist `lmapp_campaign_outcome_writer`.** Для трёх существующих Campaign-объектов — table-wide, той же формы, что уже установлена для `lmapp_maintainer`/`lmapp_campaign_writer` (раздел «Контекст») — этот проверенный паттерн переиспользуется без изменений, так как именно он нужен `appendCampaignStatusEventOnClient` (раздел 5.1). Для **новых** outcome-объектов — точный колоночный `GRANT`, не table-wide `SELECT, INSERT`:

```sql
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_campaign_outcome_writer;

-- Существующие Campaign-объекты: то же самое, что уже есть у lmapp_campaign_writer
-- (нужно transaction-aware append primitive, раздел 5.1).
GRANT SELECT, INSERT ON leasemind_app.campaign_event_log TO lmapp_campaign_outcome_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_stream_head TO lmapp_campaign_outcome_writer;
GRANT SELECT, INSERT, UPDATE ON leasemind_app.campaign_current_state_projection TO lmapp_campaign_outcome_writer;

-- Launch-proof: read-only, только колонка campaign_id нужна для EXISTS (§7).
GRANT SELECT (campaign_id) ON leasemind_app.campaign_subject_link_projection TO lmapp_campaign_outcome_writer;

-- campaign_outcome_event_log: точный колоночный allowlist.
GRANT INSERT (
  outcome_record_id, campaign_id, outcome_sequence, command_type,
  outcome_code, mapped_lifecycle_status, confirmation_method, operator_ref,
  corrects_outcome_record_id, correction_reason_code, runtime_mode,
  resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log TO lmapp_campaign_outcome_writer;
-- SELECT включает recorded_at/confirmation_method/resulting_campaign_aggregate_version --
-- нужны, чтобы safe replay-ответ (раздел 6, "same key / same command") был
-- полноценным machine-readable снимком принятой записи, а не только её
-- идентификатором. НЕ включает operator_ref/correction_reason_code/
-- runtime_mode -- секретные/audit-only поля, которые writer пишет, но
-- никогда не обязан и не должен возвращать в ответе (раздел 10 применяет
-- тот же принцип к публичной read-проекции).
GRANT SELECT (
  outcome_record_id, campaign_id, outcome_sequence, command_type,
  outcome_code, mapped_lifecycle_status, corrects_outcome_record_id,
  recorded_at, confirmation_method, resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log TO lmapp_campaign_outcome_writer;

-- campaign_outcome_idempotency_mapping: точный колоночный allowlist.
GRANT SELECT (idempotency_key, command_hash, campaign_id, outcome_record_id)
  ON leasemind_app.campaign_outcome_idempotency_mapping TO lmapp_campaign_outcome_writer;
GRANT INSERT (idempotency_key, command_hash, campaign_id, outcome_record_id)
  ON leasemind_app.campaign_outcome_idempotency_mapping TO lmapp_campaign_outcome_writer;

-- campaign_outcome_current_projection: три колонки (раздел 3), точный allowlist.
GRANT SELECT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection TO lmapp_campaign_outcome_writer;
GRANT INSERT (campaign_id, current_outcome_record_id)
  ON leasemind_app.campaign_outcome_current_projection TO lmapp_campaign_outcome_writer;
GRANT UPDATE (current_outcome_record_id, updated_at)
  ON leasemind_app.campaign_outcome_current_projection TO lmapp_campaign_outcome_writer;
```

**Maintenance contract — `lmapp_maintainer`, для координированного rebuild (раздел 12).** Точный колоночный allowlist, отдельный от writer'а:

```sql
-- Достаточно для полного rebuild outcome current projection и
-- cross-consistency проверки (раздел 12) -- без operator_ref/
-- confirmation_method/correction_reason_code/runtime_mode.
GRANT SELECT (
  outcome_record_id, campaign_id, outcome_sequence,
  outcome_code, mapped_lifecycle_status, resulting_campaign_aggregate_version
) ON leasemind_app.campaign_outcome_event_log TO lmapp_maintainer;

-- Separate per-privilege column lists in one GRANT -- writing
-- "GRANT SELECT, INSERT, UPDATE (columns)" would NOT be an exact allowlist:
-- PostgreSQL applies a trailing column list only to the privilege
-- immediately preceding it, silently leaving SELECT/INSERT table-wide.
GRANT SELECT (campaign_id, current_outcome_record_id, updated_at),
      INSERT (campaign_id, current_outcome_record_id),
      UPDATE (current_outcome_record_id, updated_at)
ON leasemind_app.campaign_outcome_current_projection
TO lmapp_maintainer;
```

`lmapp_maintainer` **не получает** `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` на `campaign_outcome_event_log` (только `SELECT`) и **не получает никакого** права на `campaign_outcome_idempotency_mapping` — mapping не требует rebuild (immutable, durable по построению, раздел 4).

**Явно НЕ выдаётся ни одной из этих ролей:** `DELETE`/`TRUNCATE` — нигде, ни на одном объекте этого ADR или существующих Campaign-таблицах (для обеих immutable-таблиц `TRUNCATE` дополнительно закрыт statement-level trigger'ом, раздел 2/4 — отсутствие гранта одно не защитило бы владельца `lmapp_migrator`); `UPDATE` на `campaign_outcome_event_log` или `campaign_outcome_idempotency_mapping` (обе immutable по конструкции — писать в них можно только `INSERT`); доступ к `property_protected_address`, `schema_migrations`, `analysis_snapshot*`, `evidence_dataset_revocation`; членство в `lmapp_migrator`/`lmapp_ta_writer`/`lmapp_analysis_writer`/`lmapp_analysis_worker`/`lmapp_evidence_revocation_writer`/`lmapp_campaign_writer`/`lmapp_api_reader` (для writer'а — включая `lmapp_maintainer`).

**Остальные роли не получают outcome-write прав вообще** — ни `lmapp_campaign_writer` (создаёт Campaign, не пишет outcome), ни `lmapp_analysis_writer`/`lmapp_analysis_worker`, ни `lmapp_ta_writer`, ни `lmapp_evidence_revocation_writer`. `lmapp_api_reader` получает только `SELECT` на безопасную read-проекцию — новое `VIEW` (раздел 10), не прямой доступ к `campaign_outcome_event_log`, `campaign_outcome_idempotency_mapping` или `campaign_outcome_current_projection` (raw `operator_ref`, `correction_reason_code`, `outcome_sequence`, ссылки на конкретные события физически недостижимы через этот грант).

**Startup privilege gates.** Новая `verifyRuntimeCampaignOutcomePrivileges(pool)` (`apps/api/src/dbPrivilegePolicy.ts`) для CLI-процесса — тот же fail-closed принцип и та же трёхкратная схема проверки (отсутствие table-wide лишних прав / точный allowlist / отсутствие лишних привилегий), что уже установлена для четырёх существующих `verifyRuntime*Privileges`, теперь дополнительно проверяющая точный колоночный allowlist на всех трёх новых объектах, а не только table-wide наличие/отсутствие. Отдельная новая (или расширенная, если у `lmapp_maintainer` уже есть эквивалентная проверка для существующих грантов migration 003 — подтверждается на реализации) проверка для maintenance-соединения — тот же принцип, точный allowlist новых grant'ов `lmapp_maintainer` выше, запускается перед рескрипцией rebuild-CLI/maintenance-пути. Дополнение к существующему `verifyRuntimeDatabasePrivileges` (`lmapp_api_reader`): негативная проверка — нет прямого доступа к `campaign_outcome_event_log`/`campaign_outcome_idempotency_mapping`/`campaign_outcome_current_projection`, есть только `SELECT` на `campaign_outcome_public_projection`. `verifyRuntimeCommandPrivileges` (`lmapp_campaign_writer`) не меняется — эта роль не получает новых прав в этом ADR.

**Runtime fail-closed при не-synthetic режиме.** CLI обязан выполнить `enforceRuntimeSafetyGate()` (существующий, `apps/api/src/runtimePolicy.ts`) и явно отказаться, если `LEASEMIND_RUNTIME_MODE` (или эквивалентный существующий флаг) не равен synthetic — до подключения к БД, тем же паттерном, что уже `revoke-evidence-dataset-cli.ts`. `runtime_mode` в записи — не CLI-параметр, а server-derived константа `'synthetic'`; DB CHECK (раздел 2) физически не допускает иного значения в этом ADR. Реальный outcome этим ADR не разрешается ни при каких условиях.

**PUBLIC** не получает ни одного права ни на один новый объект: `REVOKE EXECUTE ... FROM PUBLIC` сразу после `CREATE` на всех **трёх** новых trigger-функциях — immutable guard журнала (`reject_campaign_outcome_event_log_mutation`, раздел 2), immutable guard mapping (`reject_campaign_outcome_idempotency_mapping_mutation`, раздел 4) и insert-verification function (`verify_campaign_outcome_resulting_event`, раздел 2) — плюс стандартный `REVOKE ALL ... FROM PUBLIC` на новых таблицах и view в составе migration 011.

## 9. CLI-контракт

Два действия одного CLI, по образцу `migrate-cli.ts` (позиционная команда) и `revoke-evidence-dataset-cli.ts` (argument parsing/dry-run/`--execute`): `campaign-outcome-cli.ts record ...` / `campaign-outcome-cli.ts correct ...`.

**Общие для `record`/`correct`:**

- `--campaign-id <uuid>` — обязателен.
- `--outcome-code <code>` — обязателен, один из пяти PRODUCT-кодов.
- `--expected-campaign-version <n>` — обязателен, целое ≥ 1.
- `--idempotency-key <key>` — обязателен, 1–200 символов.
- `--actor-ref <ref>` — обязателен, закрытый непрозрачный формат `pilot-admin:<UUID v4 или v7>` (например `pilot-admin:11111111-1111-4111-8111-111111111111`) — структурно не может содержать ФИО, email, телефон или произвольный текст. CLI валидирует regex до подключения к БД; сервер сохраняет значение как `operator_ref` только после совпадения с тем же CHECK, что и таблица (раздел 2). Отличается от свободного `--actor-ref` `revoke-evidence-dataset-cli.ts` (там иной риск-профиль — только факт отзыва, не связанный с представлением конкретного administrator'а пользователю, раздел 10) намеренно более узким форматом.
- `--confirmation-attested` — обязательный флаг: явное утверждение, что user attestation получена до отправки команды (PRODUCT §8.2). Отсутствие флага — отказ до подключения к БД.
- `--execute` — необязателен. Без него CLI выполняет только read-only dry-run (см. ниже). Только с ним возможна запись.

**Только для `correct`:**

- `--corrects-outcome-record-id <uuid>` — обязателен.
- `--correction-reason-code <code>` — обязателен, единственное допустимое значение `OUTCOME_CLASSIFICATION_CORRECTED`; любое другое значение (включая отсутствие точного совпадения) — отказ на этапе парсинга, до подключения к БД.

**Dry-run по умолчанию — read-only diagnostic snapshot, не «тот же flow без записи».** `BEGIN TRANSACTION READ ONLY` физически несовместим с блокирующими write-intent конструкциями: PostgreSQL отклоняет `SELECT ... FOR UPDATE`/`FOR SHARE` внутри `READ ONLY` транзакции с ошибкой. Поэтому dry-run **не может** выполнять полный авторитетный flow раздела 5.2/5.3 в укороченном виде — он выполняет принципиально более простой, независимый путь:

- **не** берёт session-level advisory lock (раздел 6);
- **не** выполняет `SELECT ... FOR UPDATE` на `campaign_stream_head` и не создаёт её строку — genesis-семантики нет ни при dry-run, ни при `--execute` (раздел 5.2, шаг 8);
- **не** вызывает `appendCampaignStatusEventOnClient` или любой другой write-primitive;
- **не** пишет и не изменяет ни `campaign_outcome_event_log`, ни `campaign_outcome_idempotency_mapping`, ни `campaign_outcome_current_projection`, ни `campaign_event_log`/`campaign_stream_head`/`campaign_current_state_projection`;
- выполняет только обычные `SELECT`-проверки (без `FOR UPDATE`/`FOR SHARE`) внутри одной `BEGIN TRANSACTION READ ONLY`: идемпотентность (fast-path `SELECT` на mapping), launch-proof (`EXISTS`), текущие `status`/`aggregate_version`, наличие/отсутствие effective outcome, соответствие `--corrects-outcome-record-id`/новизна `--outcome-code` для `correct` — те же условия, что в итоге определяют исход `--execute`, но прочитанные без единой блокировки;
- завершается `ROLLBACK` и печатает диагностический отчёт «что было бы сделано» (стабильные machine-safe поля, не текст) — этот snapshot является диагностическим и **может устареть сразу же** после завершения dry-run: конкурентная команда способна изменить состояние немедленно после его `ROLLBACK`.

**Успешный dry-run никогда не гарантирует последующий успешный `--execute`.** `--execute` всегда заново выполняет полный авторитетный flow раздела 5.2/5.3 с нуля — собственный advisory lock, собственный `SELECT ... FOR UPDATE`, собственную проверку `expected_campaign_version` и все остальные validation — независимо от того, что показал предшествующий dry-run. `--execute` использует ту же роль и тот же грант, что dry-run (DB не различает режимы на уровне привилегий) — различие исключительно в коде CLI: простая `SELECT`-only `READ ONLY` транзакция против полного flow с блокировками.

**Запрещено принимать в любом виде:** свободный текст, ПДн (ФИО/email/телефон), контакты сторон сделки, договоры/документы, суммы/платёжные данные, raw evidence, любой `confirmation_method` кроме `user_attestation` (не параметр CLI — сервер всегда пишет `user_attestation`, флаг лишь подтверждает факт получения), любой `correction_reason_code` кроме `OUTCOME_CLASSIFICATION_CORRECTED`. Парсинг аргументов — allowlist, лишний/неизвестный флаг — отказ (`CAMPAIGN_OUTCOME_ARGUMENT_INVALID`) без подключения к БД, тем же паттерном, что `parseEvidenceDatasetRevocationArgs`.

**Стабильные machine-safe коды ошибок** (без локализованного текста, локализация — задача клиента/дальнейшей интеграции, не этого CLI):

`CAMPAIGN_OUTCOME_ARGUMENT_INVALID`, `CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC`, `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED`, `CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE`, `CAMPAIGN_OUTCOME_VERSION_CONFLICT`, `CAMPAIGN_OUTCOME_STATE_INCONSISTENT` (launch-proof event/projection рассинхронизация, `campaign_current_state_projection.aggregate_version` ≠ `campaign_stream_head.current_sequence`, или `correct` при нетерминальном/расходящемся статусе — раздел 5.2/5.3), `CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT`, `CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS`, `CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME`, `CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE`, `CAMPAIGN_OUTCOME_SAME_CODE_REJECTED`, `CAMPAIGN_OUTCOME_CONFIGURATION_INVALID`, `CAMPAIGN_OUTCOME_OPERATION_FAILED`.

**Логирование.** Структурный JSON, тот же принцип, что `revoke-evidence-dataset-cli.ts`'s `writeFailure`: только событие, `campaign_id`, `outcome_code`, `command_type`, стабильный код результата/ошибки. **Raw `actor_ref` и любые секреты (пароли, connection string) никогда не попадают в обычный лог** — `operator_ref` существует только внутри immutable-записи БД, не во внешнем логе процесса.

## 10. Read model и международный UI

Безопасная read-проекция — новое `SELECT`-представление, не прямой доступ к `campaign_outcome_event_log`/`campaign_outcome_idempotency_mapping`/`campaign_outcome_current_projection`:

```sql
CREATE VIEW leasemind_app.campaign_outcome_public_projection
  WITH (security_barrier = true, security_invoker = false) AS
SELECT
  p.campaign_id,
  l.outcome_code,
  l.recorded_at,
  l.confirmation_method,
  (l.command_type = 'correct') AS is_corrected
FROM leasemind_app.campaign_outcome_current_projection p
JOIN leasemind_app.campaign_outcome_event_log l
  ON l.campaign_id = p.campaign_id AND l.outcome_record_id = p.current_outcome_record_id;
```

**Осознанный выбор owner-rights view (`security_invoker = false`, по умолчанию PostgreSQL), не `security_invoker = true`.** Предыдущая версия этого ADR ошибочно требовала `security_invoker = true` (паттерн `analysis_snapshot_freshness_projection`, ADR-0009 §11) *и одновременно* утверждала, что `lmapp_api_reader` не получает доступа к базовым таблицам — внутреннее противоречие: `security_invoker = true` физически требует, чтобы вызывающая роль имела **собственные** гранты на все таблицы, которые view соединяет, иначе `SELECT` из view завершится ошибкой доступа для этой роли. Исправление: view владеет `lmapp_migrator` (как и все объекты этого ADR, раздел 8), выполняется с правами **владельца**, а не вызывающего — именно так `lmapp_api_reader` может прочитать безопасные колонки, ни разу не получая ни `SELECT`, ни какого-либо иного права на `campaign_outcome_event_log`, `campaign_outcome_idempotency_mapping` или `campaign_outcome_current_projection` напрямую. `security_barrier = true` (query planner не может "просочить" внутренние предикаты вызывающего в приватную часть view) — дополнительная defense-in-depth, тот же принцип, что PostgreSQL рекомендует для view, инкапсулирующих доступ к более широким таблицам от менее привилегированных читателей.

`PUBLIC` не получает ни одного права на эту view (`REVOKE ALL ... FROM PUBLIC`, раздел 11). `lmapp_api_reader` получает **только** `SELECT` на саму view — ни `SELECT`, ни любое иное право на три базовые таблицы этого ADR.

**Никогда не выбираются и не возвращаются**: `operator_ref`, `correction_reason_code`, `outcome_record_id`, `corrects_outcome_record_id`, `outcome_sequence`, `resulting_campaign_aggregate_version`, `mapped_lifecycle_status` (избыточен — Campaign lifecycle status уже читается существующим `GET /api/v1/campaigns/{id}` отдельно, раздел «Правила Campaign» §CO-C-010).

**Композиция в существующий Campaign detail read model** — тем же паттерном, что `analysis_context` был добавлен в Sprint 5 H2: `getCampaignDetailById` дополняется отдельным `SELECT` из `campaign_outcome_public_projection` по `campaign_id`, компонуется в ответ как отдельное nullable поле с **окончательным** именем `outcome_context` (не предложение, не открытый вопрос — фиксируется этим ADR), не как колонка `campaign_current_state_projection`. Lifecycle status и business outcome остаются раздельными полями ответа — клиент не выводит одно из другого (`CO-C-010`).

**Международный UI.** API возвращает только безопасные machine-полей (`outcome_code`, `recorded_at`, `confirmation_method`, `is_corrected`) — ни один из них не является русским текстом. Локализация — исключительно на клиенте: `outcome_code` → локализованное название результата (тот же принцип, что уже применён к `confirmation_method`/категориям Analysis, `ANALYSIS_SNAPSHOT.md` §7.2). Обозначение оператора — **фиксированная клиентская строка** «Уполномоченный администратор пилота» (для локали `ru-RU`; иные локали — предмет будущей интернационализации, не хранится как `outcome_code` и не приходит от API вообще — raw `operator_ref` физически недостижим через `campaign_outcome_public_projection`). История correction не раскрывает `corrects_outcome_record_id`/`correction_reason_code`/`operator_ref` — единственный публичный сигнал correction — булево `is_corrected` (`CO-C-029`).

## 11. Миграция и откат

**Следующий номер:** `011_campaign_outcome.up.sql` / `011_campaign_outcome.down.sql` (001–010 существуют без пропусков; сами SQL-файлы этим ADR не создаются).

**`up.sql` — строго additive:**
1. `CREATE TABLE campaign_outcome_event_log` + три immutability-триггера (`UPDATE`/`DELETE`/`TRUNCATE`, раздел 2) + `CREATE FUNCTION verify_campaign_outcome_resulting_event` + её `BEFORE INSERT` trigger + `REVOKE EXECUTE ... FROM PUBLIC` на обеих функциях.
2. `CREATE TABLE campaign_outcome_current_projection` (три колонки, раздел 3).
3. `CREATE TABLE campaign_outcome_idempotency_mapping` + три immutability-триггера (`UPDATE`/`DELETE`/`TRUNCATE`, раздел 4) + `REVOKE EXECUTE ... FROM PUBLIC`.
4. `CREATE VIEW campaign_outcome_public_projection` (`security_barrier = true, security_invoker = false`, владелец `lmapp_migrator`, раздел 10).
5. `REVOKE ALL ON` всех четырёх новых объектов `FROM PUBLIC`.
6. Точные колоночные `GRANT` раздела 8 — `lmapp_campaign_outcome_writer` (три новых объекта, колоночно) и переиспользуемый table-wide паттерн на трёх существующих Campaign-объектах; `lmapp_maintainer` (колоночный `SELECT` на `campaign_outcome_event_log`, колоночные `SELECT/INSERT/UPDATE` на `campaign_outcome_current_projection`); `lmapp_api_reader` (`SELECT` только на `campaign_outcome_public_projection`). `lmapp_migrator` остаётся владельцем всех новых объектов, отдельной `SET ROLE` не требуется (в отличие от ADR-0009 §13's `lmapp_post_launch_refresh_owner`, здесь нет передачи владения — раздел 1).
7. Не backfill-ит ни одной строки ни для одной существующей `Completed`/`Failed` Campaign — новые таблицы после `up.sql` пусты для всех Campaign, созданных до этой миграции, как и после (раздел 7: только явная `record`-команда создаёт первую строку).

**`down.sql` — fail-closed при непустой истории.** В отличие от прецедента 008/009/010 (безусловный `DROP TABLE`), эта `down.sql` обязана **сначала проверить пустоту** новых структур и завершиться ошибкой без единого `DROP`, если хотя бы одна строка существует в `campaign_outcome_event_log` ИЛИ `campaign_outcome_idempotency_mapping` ИЛИ `campaign_outcome_current_projection`:

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM leasemind_app.campaign_outcome_event_log)
     OR EXISTS (SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping)
     OR EXISTS (SELECT 1 FROM leasemind_app.campaign_outcome_current_projection) THEN
    RAISE EXCEPTION 'CAMPAIGN_OUTCOME_DOWN_MIGRATION_BLOCKED: refusing to drop non-empty campaign outcome history';
  END IF;
END $$;
```

Только после прохождения этой проверки — симметричный откат: отзыв точечных колоночных грантов раздела 8 у `lmapp_campaign_outcome_writer`/`lmapp_maintainer`/`lmapp_api_reader` (включая ранее выданные на существующих `campaign_event_log`/`campaign_stream_head`/`campaign_current_state_projection`/`campaign_subject_link_projection` — только то, что выдал `up.sql` этой миграции, не трогая гранты 003/004/008; для `lmapp_maintainer` — ровно те же раздельные `SELECT`/`INSERT`/`UPDATE` колоночные привилегии на `campaign_outcome_current_projection`, что выдал `up.sql`, раздел 8), `DROP VIEW campaign_outcome_public_projection`, `DROP TRIGGER`/`DROP FUNCTION` для всех трёх immutability-триггеров каждой из двух immutable-таблиц (`UPDATE`/`DELETE`/`TRUNCATE`, раздел 2/4/5) и для `verify_campaign_outcome_resulting_event`, `DROP TABLE` в порядке, уважающем FK (`campaign_outcome_idempotency_mapping` и `campaign_outcome_current_projection` — до `campaign_outcome_event_log`, так как обе ссылаются на неё составными FK; `campaign_outcome_event_log` — последней, включая собственный composite self-FK `campaign_outcome_event_log_correction_fk`, который не мешает `DROP TABLE` одной таблицы). Partial unique index `campaign_outcome_event_log_one_record_per_campaign` и `CHECK`-constraint `campaign_outcome_event_log_sequence_shape` (раздел 2) — часть определения `campaign_outcome_event_log`, отдельного `DROP INDEX`/`ALTER TABLE ... DROP CONSTRAINT` не требуют: оба уничтожаются автоматически вместе с `DROP TABLE campaign_outcome_event_log` на последнем шаге, в правильном порядке относительно двух ссылающихся на неё таблиц (индекс/constraint не могут быть удалены раньше строк, которые на них полагаются, но и не должны — они просто перестают существовать вместе с таблицей).

Это единственная миграция в проекте с fail-closed non-empty-guard в `down.sql` — осознанное отступление от прецедента 008/009/010 (которые безусловно уничтожают historical data при полном down), потому что business outcome — не technical/regenerable snapshot, а зафиксированный бизнес-факт с продуктовой семантикой «immutable история» (`CAMPAIGN_OUTCOMES.md` §7): тихое уничтожение accumulated outcome history полным `down` было бы наблюдаемым нарушением этого продуктового обещания, даже в synthetic-only окружении.

**Роль provisioning-level не создаётся и не удаляется миграцией.** `lmapp_campaign_outcome_writer` provisioned отдельно, `provisionRoles.ts`, до `migrate:up` — тем же циклом, что восемь существующих LOGIN-ролей (`lmapp_migrator`, `lmapp_maintainer`, `lmapp_api_reader`, `lmapp_campaign_writer`, `lmapp_ta_writer`, `lmapp_analysis_writer`, `lmapp_analysis_worker`, `lmapp_evidence_revocation_writer`). `up.sql`/`down.sql` работают только с объектными/схемными грантами уже существующей роли, не с самой ролью и не с её provisioning-level `CONNECT`.

## 12. Rebuild и recovery

**Campaign lifecycle projection** — публичное поведение без изменений: `rebuildCampaignProjection`/`rebuildAllCampaignProjections` продолжают читать только `campaign_event_log`, ровно как сегодня, и возвращают тот же результат для тех же входов. Outcome-транзакция не вводит новых event types, значит не требует ни единого изменения бизнес-логики этой функции. Допустим внутренний transaction-aware рефакторинг (по аналогии с `appendCampaignStatusEventOnClient`, раздел 5.1) — выделение варианта, принимающего уже открытый `pg.PoolClient`, — исключительно для повторного использования координированным rebuild ниже, без изменения существующей публичной сигнатуры/поведения `rebuildCampaignProjection(pool, campaignId)`.

**Outcome current projection** — новая функция того же вида:

```ts
export async function rebuildCampaignOutcomeProjection(pool: pg.Pool, campaignId: string): Promise<void>
export async function rebuildAllCampaignOutcomeProjections(pool: pg.Pool): Promise<number>
```

Для одной Campaign: `SELECT outcome_record_id, outcome_code, mapped_lifecycle_status FROM campaign_outcome_event_log WHERE campaign_id = $1 ORDER BY outcome_sequence DESC LIMIT 1` — максимальный `outcome_sequence`, независимо от `command_type` (`record`/`correct` равноправны как «последняя запись» — именно так `campaign_outcome_current_projection` и определяется, раздел 3).

- **Нет строк в логе** → Campaign без outcome. Если строки в `campaign_outcome_current_projection` для этой Campaign тоже нет — **no-op**, ничего не делается (штатный случай: legacy Campaign без Sprint 6 записи, раздел 7). Composite FK этой проекции (раздел 3) в любом случае физически не позволил бы существовать строке-указателю без соответствующей строки в логе — рассинхронизация такого рода структурно невозможна, а не просто маловероятна.
- **Есть строка в логе** → `INSERT ... ON CONFLICT (campaign_id) DO UPDATE` в `campaign_outcome_current_projection`, приводя указатель к записи с максимальным `outcome_sequence`.
- **Обнаружена иная невозможная/orphan-рассинхронизация** (например, `campaign_outcome_current_projection` ссылается на `outcome_record_id`, которого больше не удаётся сопоставить с максимальным `outcome_sequence` этой Campaign по независимой причине) — **fail closed**, rebuild для этой Campaign прерывается с ошибкой, требующей ручного maintenance-вмешательства. Rebuild **никогда** не выполняет `DELETE` строки `campaign_outcome_current_projection` тихо: у `lmapp_maintainer` нет `DELETE`-гранта на эту таблицу вообще (раздел 8), и продуктовая семантика (§7) не допускает молчаливого исчезновения effective outcome.

Вся операция для одной Campaign — в одной `BEGIN...COMMIT` транзакции (как существующий `rebuildCampaignProjection`), чтобы снаружи никогда не была видна промежуточная рассинхронизация.

**Координированный maintenance-путь для согласованного rebuild обеих проекций.** Rebuild lifecycle-проекции и outcome-проекции по отдельности (раздел выше) достаточен, когда они точно не пересекаются во времени с конкурентными writer'ами. Для случая, когда это не гарантировано, — отдельная координированная функция:

```ts
export async function rebuildCampaignProjections(pool: pg.Pool, campaignId: string): Promise<void>
```

- Один `pg.PoolClient`, одна транзакция.
- Берёт `SELECT ... FROM campaign_stream_head WHERE campaign_id = $1 FOR UPDATE` — тот же lock, что сериализует `record`/`correct`/lifecycle append (раздел 6) — прежде чем читать любой из двух логов, гарантируя отсутствие конкурентного writer'а на время rebuild этой Campaign.
- Внутри этой же транзакции вызывает transaction-aware варианты обоих rebuild (lifecycle — внутренний рефакторинг выше; outcome — новая функция), затем `COMMIT`.
- Снаружи никогда не наблюдается пара проекций, восстановленных из разных, не связанных между собой состояний (одна — «до» некоторого commit, другая — «после»): обе читаются под одним и тем же row lock, в одной транзакции.
- Использует роль `lmapp_maintainer` с грантами раздела 8, тем же connection string, что и существующий `rebuildCampaignProjection`/`seed.ts` (`LEASEMIND_MAINTENANCE_DATABASE_URL`) — не добавляет нового runtime-процесса.

**Cross-consistency проверка** (часть координированного пути и доступна отдельно как maintenance-проверка). Соответствует новой составной lifecycle-event identity (раздел 2): для каждой строки `campaign_outcome_event_log` подтверждается, что `campaign_event_log` действительно содержит строку с `(campaign_id, event_sequence) = (campaign_id, resulting_campaign_aggregate_version)` этой outcome-записи, `event_type = 'campaign.status_recorded.v1'`, и `payload->>'status' = mapped_lifecycle_status`. Composite FK (раздел 2) и `BEFORE INSERT` trigger `verify_campaign_outcome_resulting_event` уже гарантируют это на момент записи — эта проверка при rebuild подтверждает то же самое явно, а не предполагает, что инвариант не мог быть нарушен вне обычного пути записи (например, прямым вмешательством с правами `lmapp_migrator`, которое триггеры INSERT не покрывают задним числом для уже существующих строк).

**Направление всегда одно.** История (`campaign_outcome_event_log`) и mapping (`campaign_outcome_idempotency_mapping`) — источники истины; `campaign_outcome_current_projection` — единственная mutable, всегда read-only производная от них. Rebuild никогда не пишет в лог/mapping и никогда не читает `campaign_outcome_current_projection` как источник данных для восстановления чего-либо — только как цель перезаписи (или, при обнаруженной невозможной рассинхронизации, как объект fail-closed диагностики, не автоматического исправления).

## 13. Явно НЕ входит

- Real/production outcome — CHECK на `runtime_mode = 'synthetic'` физически исключает; `PRODUCTION_LAUNCH_GATE` остаётся `blocked` (`ADR-0001`, `ADR-0003`).
- Пользовательский write HTTP API — только CLI.
- Полноценная auth/RBAC-система — не проектируется; операционный доступ к CLI остаётся единственной границей.
- Свободный текст и evidence attachments — структурно исключены схемой и CLI allowlist.
- Платежи, Escrow, Success Wallet — не затрагиваются.
- Автоматическое определение outcome (AI Manager без администратора) — не реализуется.
- Изменение порогов `ANALYSIS_SNAPSHOT.md` §9.8 (9.8.1–9.8.6) — не меняются; реальная агрегация «созревших»/событий/несобытий из этой схемы не реализуется (как и в ADR-0009 §15 для `analysis_snapshot`).
- Публикация `deal_probability_30d` — остаётся `insufficient_data` безусловно.
- Backfill старых Campaign — явно запрещён (раздел 7).
- Новые lifecycle statuses — не вводятся.
- Изменение `ADR-0002` задним числом — не редактируется; `campaign_event_log` получает новые данные исключительно существующим, неизменным путём (`campaign.status_recorded.v1`, без изменения payload-контракта).
- Рефакторинг `launchCampaign.ts` на использование нового `appendCampaignStatusEventOnClient` — не требуется для корректности этого решения, не выполняется в его объёме.

## 14. Acceptance coverage matrix (`CO-C-001`–`CO-C-030`)

| CO-C | Механизм в этом ADR |
| --- | --- |
| `CO-C-001` | Только `lmapp_campaign_outcome_writer` через CLI может создать канонический outcome record/idempotency mapping (раздел 8). `lmapp_maintainer` может изменять только rebuildable `campaign_outcome_current_projection` в maintenance-flow (раздел 12) — `SELECT`-only на `campaign_outcome_event_log`, ни одного права на `campaign_outcome_idempotency_mapping` — и не может создать сам бизнес-факт. Ни одна другая роль/путь не имеет прав записи |
| `CO-C-002` | `--confirmation-attested` обязателен; `confirmation_method` всегда `user_attestation` (CHECK, раздел 2) |
| `CO-C-003` | Launch-proof (двойной `EXISTS`, шаг 9) отсутствует для обеих проверок → `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED`. **Не** связан с активным статусом — активная запущенная Campaign `record` не отклоняет (раздел 7) |
| `CO-C-004` | `status = 'Paused'` → `CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE`, до записи (шаг 12) — единственная статус-причина отказа `record` |
| `CO-C-005`–`CO-C-007` | Три success-кода → `mapped_lifecycle_status = 'Completed'`, DB CHECK `campaign_outcome_event_log_mapping_valid` + cross-consistency trigger (раздел 2) |
| `CO-C-008`–`CO-C-009` | `cancelled`/`expired` → `Failed`, тот же CHECK/trigger |
| `CO-C-010` | `outcome_context` (окончательное имя) — отдельное nullable поле ответа, не колонка `campaign_current_state_projection` (раздел 10) |
| `CO-C-011` | Fast-path replay по `idempotency_key` (шаг 1–2, раздел 5.2) |
| `CO-C-012` | `command_hash` mismatch → `CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT` (шаг 3) |
| `CO-C-013` | `campaign_stream_head FOR UPDATE` в `READ COMMITTED` сериализует конкурентные разные ключи (раздел 6) |
| `CO-C-014` | `expected_campaign_version` против канонического `campaign_stream_head.current_sequence`, шаг 10, `ROLLBACK` целиком |
| `CO-C-015` | `reject_campaign_outcome_event_log_mutation` — безусловные BEFORE UPDATE/DELETE/TRUNCATE triggers (раздел 2) |
| `CO-C-016` | `correct` создаёт новую строку, `campaign_outcome_current_projection` указывает на неё (раздел 5.3, шаг 21') |
| `CO-C-017` | Immutable, `is_current`-подобного поля не существует; effective outcome — всегда non-null указатель либо отсутствующая строка целиком (никогда «пусто внутри записи») |
| `CO-C-018` | CLI argument allowlist (раздел 9); DB CHECK не допускает произвольных полей |
| `CO-C-019` | `runtime_mode = 'synthetic'` CHECK, не хранится в public view (раздел 2, 10) |
| `CO-C-020` | `runtime_mode` CHECK физически исключает `'real'`; fail-closed runtime gate (раздел 8) |
| `CO-C-021` | Реальная агрегация §9.8 не реализуется этим ADR (раздел 13) — политика, не код |
| `CO-C-022` | Сервер — источник истины; `campaign_outcome_public_projection` (owner-rights view) читается заново при каждом запросе (раздел 10) |
| `CO-C-023` | `mapped_lifecycle_status` CHECK допускает только `Completed`/`Failed` — активный статус недостижим через correction (раздел 7) |
| `CO-C-024`–`CO-C-025` | `correct` меняет `mapped_lifecycle_status` между `Completed`/`Failed` при смене класса (раздел 5.3, шаг 17') |
| `CO-C-026` | `corrects_outcome_record_id` (CLI) должен совпасть с текущим `current_outcome_record_id` (шаг 15') |
| `CO-C-027` | Immutable mapping — старый ключ навсегда указывает на исходную `outcome_record_id` (раздел 4, раздел 6) |
| `CO-C-028` | Launch-proof + отсутствие backfill (раздел 7); explicit `record` разрешена для legacy Campaign, включая её уже-terminal статус (раздел 7) |
| `CO-C-029` | `campaign_outcome_public_projection` (owner-rights, без прямого доступа `lmapp_api_reader` к базовым таблицам) никогда не содержит `operator_ref`; фиксированная клиентская строка (раздел 10) |
| `CO-C-030` | Явная проверка «новый код = текущий» до записи, шаг 16' (раздел 5.3) |

## 15. Verification plan

- `migrate:up` → `migrate:down` → `migrate:up` на пустой disposable PostgreSQL 18.4 (текущий CI проверяет только один цикл up→down — эта миграция обязана быть отдельно проверена локально на полный up→down→up→down цикл до слияния).
- `down.sql` отказывает (`CAMPAIGN_OUTCOME_DOWN_MIGRATION_BLOCKED`), если хотя бы одна `record`/`correct` команда была выполнена — отдельный тест, вставляющий одну строку и проверяющий, что `migrate:down` завершается ошибкой, а схема остаётся нетронутой.
- Immutability — **UPDATE/DELETE/TRUNCATE**, не только UPDATE/DELETE: прямые попытки от имени `lmapp_campaign_outcome_writer` **и отдельно от имени владельца `lmapp_migrator`** (включая суперюзер-подобный bootstrap, если тестовая инфраструктура его использует) — все три операции на обеих immutable-таблицах должны быть отклонены для обеих ролей (грантом — для writer'а на UPDATE/DELETE; statement-level trigger'ом — для TRUNCATE у обеих ролей, включая владельца, раздел 2/4/5, поскольку отсутствие грантов само по себе не останавливает владельца).
- Role/grant exact allowlist: `verifyRuntimeCampaignOutcomePrivileges` (writer) и maintenance-эквивалент (`lmapp_maintainer`, раздел 8) — позитивный (все нужные колоночные права есть) и негативный (DELETE/TRUNCATE/чужие таблицы/чужие колонки недостижимы) прогон, по образцу `dbPrivilegeBoundary.test.ts`.
- Негативный тест на `lmapp_api_reader`: прямой `SELECT` на `campaign_outcome_event_log`/`campaign_outcome_idempotency_mapping`/`campaign_outcome_current_projection` отклоняется (owner-rights view, раздел 10) — только `SELECT` на `campaign_outcome_public_projection` проходит.
- Dry-run действительно read-only: `campaign_outcome_event_log`/`campaign_outcome_idempotency_mapping`/`campaign_outcome_current_projection` не меняются ни на одну строку после dry-run вызова без `--execute`. **Отдельный тест подтверждает отсутствие `SELECT ... FOR UPDATE`/`FOR SHARE` и любого DML (`INSERT`/`UPDATE`/`DELETE`) на пути dry-run** — например, перехватом/логированием фактически выполненных SQL-операторов в интеграционном тесте и проверкой, что среди них нет ни одной блокирующей или пишущей конструкции.
- Второй `record` для одной Campaign отклоняется на уровне БД: интеграционный тест, вставляющий вторую строку `command_type='record'` для того же `campaign_id` напрямую (в обход application-flow, но с разрешённым `INSERT`-грантом) — должен быть отклонён partial unique index `campaign_outcome_event_log_one_record_per_campaign`.
- `record` с `outcome_sequence <> 1` отклоняется `campaign_outcome_event_log_sequence_shape` CHECK.
- `correct` с разрывом sequence (`outcome_sequence` не равен `outcome_sequence` исправляемой записи + 1) отклоняется `verify_campaign_outcome_resulting_event`.
- `correct`, не ссылающийся на текущую effective-запись (`corrects_outcome_record_id` не совпадает с `campaign_outcome_current_projection.current_outcome_record_id` на момент INSERT) — отклоняется тем же trigger'ом, даже при прямом `INSERT` в обход application-flow.
- `correct` с тем же `outcome_code`, что исправляемая запись, — отклоняется тем же trigger'ом на уровне БД (в дополнение к application-level проверке шага 16').
- Synthetic-only startup gate: CLI отказывает до подключения к БД, если `LEASEMIND_RUNTIME_MODE` не synthetic — по образцу `runtimeSafetyGateBootstrap.test.ts`.
- Launch-proof cross-check: Campaign с событием `campaign.subject_linked.v1`, но без строки `campaign_subject_link_projection` (и наоборот, искусственно рассогласованные в тестовой БД) → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, не тихое принятие.
- Отсутствие `campaign_stream_head` — два отдельных теста, не один: (а) Campaign без каких-либо launch-proof следов (никогда не запускалась) → `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED`; (б) искусственно удалённая/отсутствующая `campaign_stream_head` при существующем `campaign.subject_linked.v1` и/или `campaign_subject_link_projection` → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, не `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED`.
- Активная (не terminal, не `Paused`) Campaign — `record` успешно проходит и атомарно переводит её в `mapped_lifecycle_status`; отдельный тест, явно отличный от теста legacy `Completed`/`Failed` без backfill.
- `correct` при рассинхронизированном состоянии (искусственно: `campaign_current_state_projection.status` не совпадает с `mapped_lifecycle_status` текущей effective-записи, либо статус не terminal) → `CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, без записи.
- Composite FK closes cross-Campaign leakage: интеграционный тест, пытающийся вставить/сослаться на `outcome_record_id`, принадлежащий ДРУГОЙ Campaign (в `corrects_outcome_record_id`, в `campaign_outcome_idempotency_mapping.outcome_record_id`, в `campaign_outcome_current_projection.current_outcome_record_id`) — должен быть отклонён составным FK на уровне БД, не только логикой приложения.
- Cross-consistency trigger: попытка `INSERT` в `campaign_outcome_event_log` с `resulting_campaign_aggregate_version`, указывающим на событие с `event_type <> 'campaign.status_recorded.v1'` либо с несовпадающим `payload.status`, — отклоняется `verify_campaign_outcome_resulting_event`.
- Атомарный rollback на каждом потенциальном сбое шагов 9–22 (`record`)/9–23' (`correct`) — принудительная ошибка на каждом шаге в интеграционном тесте, подтверждение отсутствия частичной записи в любой из четырёх таблиц/campaign_event_log/stream_head/projection.
- Hash-chain verification существующим TypeScript-верификатором: тест по образцу `campaigns.test.ts` строки 514 (`computeEventHash` пересчитывает и совпадает) — теперь дополнительно прогоняется на потоке, содержащем событие, добавленное outcome-командой, подтверждая, что оно ничем не отличается от любого другого `campaign.status_recorded.v1`.
- Same-status event append: `record`/`correct`, когда `mapped_lifecycle_status` равен уже текущему `status`, всё равно создаёт ровно одно новое событие.
- `aggregate_version` увеличивается ровно на 1 для каждой принятой non-replay команды — прямая проверка до/после.
- Replay не меняет `aggregate_version` и не создаёт событие — прямая проверка.
- Конкурентные same/different keys — реальный параллельный `pg` client тест (не мок), по образцу существующих concurrency-тестов Analysis Snapshot (`AS-C-004`).
- Stale `expected_campaign_version` — интеграционный тест, целиком без частичного изменения.
- `Paused` rejection / pre-launch rejection — интеграционные тесты на существующих seed-фикстурах (seed уже содержит одну Campaign в `Paused`).
- Correction current/superseded/same-code — три отдельных интеграционных теста.
- `record` после уже существующего effective outcome — отдельный тест.
- Legacy `Completed`/`Failed` без backfill — прямая проверка на существующих seed-фикстурах (seed уже содержит одну `Completed` и одну `Failed` Campaign без outcome): после `seed`, `campaign_outcome_current_projection` не содержит строк для них; явный `record` для одной из них проходит успешно.
- Отсутствие raw `operator_ref` в API-ответе, в логах CLI (stdout/stderr), в UI-рендере (source-regression тест по образцу существующих `campaignLaunchWizardRegressions.test.ts`).
- Корректный rebuild обеих проекций: `rebuildCampaignProjection` (публичное поведение неизменно), новая `rebuildCampaignOutcomeProjection` (no-op на пустой истории, fail closed на невозможной рассинхронизации — не `DELETE`), координированная `rebuildCampaignProjections` (единая транзакция под stream-head lock, ни одна пара проекций не наблюдается снаружи восстановленной из разных состояний).
- CI migration cycle (добавление миграции 011 в существующий `app-foundation.yml` без нарушения текущего up→seed→smoke→down потока) и backend/frontend regression tests (`openapiContract.test.ts`, frontend regression suite) после добавления нового поля в `CampaignDetail`.

## Последствия

- Девятая LOGIN-роль в системе (`lmapp_campaign_outcome_writer`), десятая различимая connection string (`LEASEMIND_CAMPAIGN_OUTCOME_DATABASE_URL`), новый пароль (`LEASEMIND_CAMPAIGN_OUTCOME_WRITER_PASSWORD`) — provisioning расширяется тем же idempotent-циклом. `lmapp_maintainer` получает дополнительные точечные колоночные гранты (раздел 8) — без новой роли/connection string.
- `campaignEvents.ts` получает новую экспортируемую функцию (`appendCampaignStatusEventOnClient`), выполняющую append + projection update (раздел 5.1); существующая `appendCampaignStatusEvent` и все существующие вызывающие (`seed.ts`, тесты) не меняют поведение.
- `campaign_event_log`/`campaign_stream_head`/`campaign_current_state_projection`/публичное поведение `rebuildCampaignProjection` — без единого изменения схемы, констрейнтов или наблюдаемой логики.
- Campaign detail read model получает одно новое nullable поле — окончательно `outcome_context` — аддитивное расширение OpenAPI/frontend, тем же паттерном, что `analysis_context` в Sprint 5.
- Появление реального (non-synthetic) outcome остаётся отдельным, отдельно утверждаемым решением — не разблокируется этим ADR (тот же принцип, что ADR-0002/ADR-0005/ADR-0009 уже применили к своим границам).

## Обязательные исправления относительно первого архитектурного аудита

Явно учтены и закрыты в этом решении:

1. `is_current`/mutable-флаг в immutable history — не введён; effective outcome — отдельная, полностью rebuildable таблица-указатель (`campaign_outcome_current_projection`), история никогда не `UPDATE`-ится (раздел 2, 3).
2. Campaign не обязана быть заранее terminal до первичной `record` — сама команда атомарно выполняет terminal-переход (раздел 5.2, шаг 16); исключение — только `Paused`, отклоняемая PRODUCT-критерием `CO-C-004` (раздел 7). Любой другой lifecycle status, включая активные, допустим.
3. Campaign Event Log — схема и типы событий не меняются, но outcome-транзакция безопасно дописывает обычное status-событие и обновляет существующие `campaign_stream_head`/`campaign_current_state_projection` в той же транзакции (раздел 5) — не «нетронутая инфраструктура», а «неизменённая схема при активном использовании существующего append-пути».
4. Mapped status, совпадающий с текущим — не оставлено неопределённым: событие добавляется, `aggregate_version` увеличивается на 1 безусловно (раздел 5.2 шаг 16, раздел 5.3 шаг 18').
5. `down.sql` — fail-closed на непустой истории, не безусловное уничтожение (раздел 11).
6. `lmapp_campaign_outcome_writer` не получает `DELETE`/`TRUNCATE`/`UPDATE` на immutable-объектах ни при каких условиях (раздел 8).
7. Legacy `Completed`/`Failed` Campaign не считается «созревшей» до явной `record`-команды — ни автоматически, ни при rebuild (раздел 7, раздел 12).

Дополнительно исправлено этим corrective pass'ом (относительно первой версии этого ADR):

8. Активная Campaign (не `Paused`, не ещё terminal) — `record` её больше не отклоняет; `CO-C-003` переопределён исключительно как «Campaign вообще не запущена», не «Campaign ещё активна» (раздел 5.2, шаг 9/12; раздел 7).
9. `correct` получил собственные fail-closed проверки: Campaign должна быть terminal, и её текущий `status` должен совпадать с `mapped_lifecycle_status` текущей effective-записи — расхождение отклоняется как `CAMPAIGN_OUTCOME_STATE_INCONSISTENT` (раздел 5.3, шаг 12'–14').
10. `BEGIN ISOLATION LEVEL REPEATABLE READ` в сочетании с предварительным `INSERT ... ON CONFLICT DO NOTHING` для `campaign_stream_head` — ошибочная комбинация предыдущей версии — заменена на `READ COMMITTED` + `SELECT ... FOR UPDATE` без genesis-вставки, с fail-closed отказом при отсутствии строки (раздел 5.2 шаг 7–8, раздел 6).
11. Transaction-aware primitive однозначно включает обновление `campaign_current_state_projection` внутри себя — отдельный дублирующий `UPDATE` в outcome-flow удалён (раздел 5.1, раздел 5.2/5.3).
12. Одиночные FK, допускавшие теоретическую cross-Campaign ссылку (correction, mapping, current projection, resulting lifecycle event), заменены составными FK на `(campaign_id, ...)` (раздел 2, 3, 4); добавлен fail-closed trigger, проверяющий содержимое связанного lifecycle-события (раздел 2).
13. Отсутствие `GRANT TRUNCATE` больше не преподносится как защита владельца `lmapp_migrator` — добавлены statement-level `BEFORE TRUNCATE` triggers на обеих immutable-таблицах (раздел 2, 4, 5).
14. `security_invoker = true` для публичной view заменён на owner-rights view (`security_barrier = true, security_invoker = false`) — устранено внутреннее противоречие «API reader не имеет доступа к базовым таблицам, но view требует его иметь» (раздел 6/10).
15. Grants на новые outcome-таблицы — точный колоночный allowlist, не table-wide `SELECT, INSERT`; добавлен отдельный maintenance-контракт для `lmapp_maintainer` (раздел 8).
16. `operator_ref` — закрытый непрозрачный формат `pilot-admin:<UUID>` (DB CHECK + CLI-валидация), не произвольная строка 1–200 символов (раздел 2, 9).
17. Rebuild больше не «удаляет проекцию, если истории нет» — no-op на пустой истории; невозможная рассинхронизация — fail closed, не тихий `DELETE`; добавлен координированный maintenance-путь для согласованного rebuild обеих проекций под одним stream-head lock (раздел 12).
18. `outcome_context` зафиксировано как окончательное имя нового поля Campaign detail-ответа, не «предложение» (раздел 10, Последствия).

Дополнительно исправлено этим финальным точечным pass'ом:

19. `GRANT SELECT, INSERT, UPDATE (columns)` для `lmapp_maintainer` — не точный allowlist (PostgreSQL применяет колоночный список только к последней перечисленной привилегии, оставляя `SELECT`/`INSERT` table-wide) — заменён на раздельные `SELECT (...), INSERT (...), UPDATE (...)` в одном `GRANT` (раздел 8).
20. Dry-run больше не описывается как «тот же flow с `FOR UPDATE`, но `READ ONLY`» (физически невозможная комбинация) — переопределён как принципиально более простой, независимый read-only diagnostic snapshot без advisory lock, без `FOR UPDATE`, без genesis-создания, без вызова write-primitive; явно зафиксировано, что успешный dry-run не гарантирует успешный `--execute` (раздел 9).
21. Каноническая история теперь закрыта на уровне БД, не только application-логикой: `CHECK` на форму `(command_type, outcome_sequence)`, partial unique index «не более одной `record`-строки на Campaign», и расширенный `BEFORE INSERT` trigger, проверяющий отсутствие предшествующей истории для `record`, соответствие текущему effective outcome/непрерывность sequence/смену `outcome_code` для `correct` (раздел 2).
22. Отсутствие `campaign_stream_head` больше не классифицируется однозначно как `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED` — различаются «оба launch-proof источника отсутствуют» (ожидаемо, `CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED`) и «хотя бы один launch-proof источник присутствует при отсутствующей `campaign_stream_head`» (`CAMPAIGN_OUTCOME_STATE_INCONSISTENT`, раздел 5.2 шаг 8).
23. Число существующих LOGIN-ролей в системе исправлено на восемь (было ошибочно «семь») — раздел 11.
24. `CO-C-001` уточнён: только outcome writer создаёт канонический бизнес-факт; `lmapp_maintainer` ограничен rebuildable current projection в maintenance-flow. Раздел PUBLIC теперь явно называет все три новых trigger-функции. Writer's `SELECT`-грант на `campaign_outcome_event_log` расширен `recorded_at`/`confirmation_method`/`resulting_campaign_aggregate_version` для полноценного machine-readable replay-ответа, без `operator_ref`/`correction_reason_code`/`runtime_mode` (раздел 8, 14).

## Verification plan статических/эмпирических/PRODUCT-границ

- **Статически подтверждено чтением кода этой сессии:** table-wide grant-паттерн для `campaign_event_log`/`campaign_stream_head`/`campaign_current_state_projection` (migrations 003/004); отсутствие FK `campaign_id → campaign_current_state_projection` у `campaign_event_log` (migration 002); существование `campaign_subject_link_projection` как единственного текущего доказательства launch (migration 008); `computeEventHash` — чистая TypeScript-функция, принимающая generic `payload`; `appendCampaignStatusEvent` не композируется с внешней транзакцией; существующий hash-chain verifier в `campaigns.test.ts`; отсутствие `pgcrypto`-зависимости где-либо в текущем foundation; PostgreSQL 18.4 везде (ADR-0001, `docker-compose.yml`, CI); PostgreSQL statement-level `BEFORE TRUNCATE` триггеры и `UNIQUE`/составные `FOREIGN KEY` — стандартные, давно стабильные возможности ядра, не требующие расширений.
- **Решения Lead Architect при реализации:** точный SQL-текст `verifyRuntimeCampaignOutcomePrivileges`/maintenance-эквивалента (описаны раздел 8, финальная типизация — на реализации); стоит ли отдельно рефакторить `launchCampaign.ts` на новый primitive (явно не требуется этим ADR, раздел 13); конкретное имя координированной rebuild-функции и её точный внутренний рефакторинг `rebuildCampaignProjection` (раздел 12, публичное поведение зафиксировано, внутренняя реализация — нет).
- **Эмпирические вопросы (SQL/integration/load, раздел 15):** полный up→down→up→down цикл миграции 011 на реальном PostgreSQL 18.4; конкурентные интеграционные тесты (разные/одинаковые ключи, correction race, `record` для активной Campaign); фактическое отсутствие deadlock между `campaign_stream_head`-lock, используемым одновременно launch-flow и outcome-flow (теоретически не пересекаются во времени для одной Campaign, но не доказано без реального нагрузочного теста); поведение composite FK и cross-consistency trigger под конкурентной нагрузкой (ожидается стандартное поведение PostgreSQL, но не доказано без прогона).
- **PRODUCT-блокеры:** нет новых. `correction_reason_code` зафиксирован PRODUCT v0.2 как единственное значение (`OUTCOME_CLASSIFICATION_CORRECTED`) — не требует дальнейшего решения Founder для этого ADR.
