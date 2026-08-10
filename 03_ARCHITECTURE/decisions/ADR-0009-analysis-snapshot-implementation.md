# ADR-0009 — Analysis Snapshot: серверная synthetic-only реализация

**Дата:** 2026-08-10
**Автор:** Lead Software Architect
**Статус:** Proposed for synthetic development only

## Контекст

`02_PRODUCT/ANALYSIS_SNAPSHOT.md` v0.2 определяет контракт Analysis Snapshot
(§1–§18): серверное хранение, идемпотентность, актуальность/`stale`,
атомарную связь с запуском Campaign и least-privilege роль. До этого решения
Analysis не персистится — ADR-0008, раздел 1, фиксирует его как
детерминированную frontend-only функцию `(technical_assignment_id,
revision)` без сетевого вызова.

Read-only архитектурный анализ (предшествующий этому ADR) исследовал
существующую кодовую базу (`apps/api`) и выявил, что прямое
persistence-решение сталкивается с тремя нерешёнными вопросами: (1) как
ссылаться на Technical Assignment, если он физически хранится как одна из
двух разных таблиц (`property`/`tenant_request`) без единого domain entity;
(2) как `post_launch_refresh` подтверждает связь `campaign_id ↔
technical_assignment_id`, не выдавая роли Analysis доступ к
`campaign_event_log` (нарушение границы `ADR-0005`); (3) как обеспечить
terminal-неизменяемость и least-privilege по образцу уже принятых `ADR-0005`/
`ADR-0007`/`ADR-0008`.

Первая версия этого ADR прошла построчное ревью Lead Architect (неисполнимый
`CHECK` с subquery, порядок операций относительно FK, отсутствие retry,
неполный immutability-trigger, риск MVCC snapshot при advisory lock,
псевдосинтаксис грантов, неоднозначные формулировки). Вторая версия
устранила эти замечания. **Второе** построчное ревью выявило: `is_valid_metric_envelope`
может вернуть SQL `NULL` вместо `FALSE` (PostgreSQL считает `NULL` в `CHECK`
допустимым результатом); двухсоединенческая транзакционная схема удваивает
потребление pool; retry-механика описывалась как решённая, хотя PRODUCT
её не подтвердил и `AS-C-004` не полностью совместим; ложное утверждение о
том, что существующий `composite unique` защищает от повторного
использования `technical_assignment_id + source_revision` другим
`campaign_id`; backfill полагался на migration 006 как достаточное
доказательство формы данных, хотя `CHECK` может пропустить SQL `NULL`;
launch-time доказательство было неполным (не покрывало `scenario`/статус);
`down.sql` допускал `CASCADE` вместо детерминированного порядка; не хватало
`GRANT USAGE ON SCHEMA`; не были явно зафиксированы незакрытые PRODUCT-обязательства
(`AS-C-016`, отзыв evidence). **Третье**, точечное ревью выявило: `is_valid_metric_envelope`
всё ещё не тотальна (SQL `NULL` на входе или в `metric_status` мог пройти в
`ELSE TRUE`); описание конкуренции разных `idempotency_key` содержало
неверное утверждение о нарушении partial unique индекса; `analysis_snapshot`
одновременно объявлялась колоночно-ограниченной таблицей и получала
table-wide `GRANT SELECT`, что противоречило собственному startup gate;
legacy/V2 replay не проверял явно сохранённый `analysis_snapshot_id`, а
ошибка для новой команды без Snapshot использовала не относящийся к делу
код `INVALID_IDEMPOTENCY_KEY`; `down.sql` не отзывал гранты
`lmapp_analysis_writer` на существующих `property`/`tenant_request`; backfill
validation не проверяла точную object-форму и набор ключей payload перед
остальными проверками. Этот документ — четвёртая, исправленная версия.

## Решение

### 1. Граница решения

Это решение закрывает только архитектуру synthetic-only Analysis Snapshot
Sprint 5: хранение, идемпотентность, транзакции, серверную проверку при
запуске Campaign и least-privilege роли. Оно не рассчитывает и не
калибрует `deal_probability_30d`, не реализует пороги готовности
исторических данных (`ANALYSIS_SNAPSHOT.md` §9.8, `AS-C-021`–`AS-C-026`) и не
меняет экономику, юридические правила, Matching Engine или
`PRODUCTION_LAUNCH_GATE`.

Решение заменяет **только** frontend-only placeholder Analysis из
`ADR-0008`, раздел 1, абзац «Pre-launch Analysis не персистится отдельной
таблицей... вычисляется мгновенно на фронтенде без сетевого вызова». Все
остальные решения `ADR-0008` — схема Property/TenantRequest, idempotent save
draft, `lifecycle_status`, Contacts Gate marker, разделение DB-ролей
`lmapp_ta_writer`/`lmapp_campaign_writer`/`lmapp_api_reader`, транзакционная
граница атомарного запуска Campaign — остаются в силе без изменений; это
решение добавляет к ней новые операции и новую предварительную проверку (§3,
§7), не переставляя ни одну из уже существующих.

Перед переводом статуса в `Accepted` должны быть закрыты открытые PRODUCT-вопросы,
перечисленные в §5 (retry-семантика, `AS-C-004`) и в отдельном разделе
«Открытые PRODUCT-блокеры до Accepted» ниже (`AS-C-016`, отзыв evidence).

### 2. Ссылки на Technical Assignment

`technical_assignment_id` не хранится как самостоятельная непрозрачная
(polymorphic) колонка без FK. Вместо этого каждая таблица, ссылающаяся на
Technical Assignment (`campaign_subject_link_projection`, `analysis_snapshot`
— в этом порядке создания, см. §10), содержит две nullable FK-колонки и
производную проекцию:

```
property_id        uuid NULL REFERENCES leasemind_app.property (property_id),
tenant_request_id  uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),

CONSTRAINT ..._subject_exactly_one_reference CHECK (
  (scenario = 'need_tenant'   AND property_id       IS NOT NULL AND tenant_request_id IS NULL) OR
  (scenario = 'need_property' AND tenant_request_id  IS NOT NULL AND property_id       IS NULL)
),

technical_assignment_id uuid
  GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED
```

`technical_assignment_id` — stored generated-колонка, а не вычисление в
приложении: она детерминированно равна ровно заданной FK-колонке, участвует в
уникальных индексах/composite FK (§3–§5) и возвращается в API-контракте без
дублирования логики между SQL и TypeScript. `COALESCE` двух `uuid`-колонок —
immutable выражение, разрешённое PostgreSQL для `GENERATED ALWAYS ...
STORED`; использование generated-колонки как стороны FK (обеих сторон —
и referencing, и referenced, см. §3–§5) требует эмпирической проверки на
целевом PostgreSQL 18.4 перед написанием migration 008 (часть Verification
plan, см. ниже).

Оба FK физически гарантируют, что предмет анализа существует в
`property`/`tenant_request`; `CHECK` гарантирует согласованность с
`scenario` и невозможность одновременной или нулевой ссылки.

### 3. Безопасная связь Campaign–ТЗ

Вводится узкая производная таблица `leasemind_app.campaign_subject_link_projection`
— **создаётся раньше `analysis_snapshot`** (§10), поскольку `analysis_snapshot`
ссылается на неё составным FK:

```
campaign_id                    uuid PRIMARY KEY
  REFERENCES leasemind_app.campaign_current_state_projection (campaign_id),
scenario                       text NOT NULL CHECK (scenario IN ('need_tenant', 'need_property')),
property_id                    uuid NULL REFERENCES leasemind_app.property (property_id),
tenant_request_id              uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),
  -- тот же CHECK "ровно одна ссылка, согласованная со scenario", что в §2
technical_assignment_id        uuid GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED,
source_revision                integer NOT NULL CHECK (source_revision >= 1),
source_schema_version          text NOT NULL CHECK (source_schema_version = '1.0'),
linked_at                       timestamptz NOT NULL,

-- Версия схемы авторизации launch-команды -- см. "authorization_contract_version
-- и legacy replay" ниже и §6/§7.
authorization_contract_version text NOT NULL
  CHECK (authorization_contract_version IN ('legacy_v1', 'analysis_v2')),
-- Доказательство launch-time авторизации Analysis Snapshot -- см. §5 "Усиленное
-- доказательство авторизации launch" ниже. FK на analysis_snapshot добавляется
-- отдельным ALTER TABLE, см. §10 (analysis_snapshot ещё не существует на этом шаге).
analysis_snapshot_id            uuid NULL,
authorized_analysis_kind       text NULL CHECK (authorized_analysis_kind = 'pre_launch'),
authorized_analysis_status     text NULL CHECK (authorized_analysis_status IN ('completed', 'insufficient_data')),

CONSTRAINT campaign_subject_link_projection_composite_unique
  UNIQUE (campaign_id, scenario, technical_assignment_id, source_revision),

-- Отдельно от composite_unique выше: тот запрещает дубли строк в рамках
-- одного campaign_id, но НЕ запрещает двум разным campaign_id разделить один
-- (technical_assignment_id, source_revision) -- campaign_id входит в
-- composite_unique, поэтому разные campaign_id делают весь кортеж разным.
-- Эта отдельная UNIQUE явно запрещает более одной Campaign на одну revision
-- одного Technical Assignment -- см. "Уникальность Campaign-ТЗ" ниже.
CONSTRAINT campaign_subject_link_projection_one_campaign_per_ta_revision
  UNIQUE (scenario, technical_assignment_id, source_revision),

CONSTRAINT campaign_subject_link_projection_authorization_shape CHECK (
  (
    authorization_contract_version = 'legacy_v1'
    AND analysis_snapshot_id IS NULL
    AND authorized_analysis_kind IS NULL
    AND authorized_analysis_status IS NULL
  ) OR (
    authorization_contract_version = 'analysis_v2'
    AND analysis_snapshot_id IS NOT NULL
    AND authorized_analysis_kind IS NOT NULL
    AND authorized_analysis_status IS NOT NULL
  )
)
```

`campaign_id` — одновременно PRIMARY KEY (один Campaign линкуется ровно один
раз) и FK на существующую `campaign_current_state_projection`. Composite
`UNIQUE (campaign_id, scenario, technical_assignment_id, source_revision)` —
не просто доказательство тройки для конкретного `campaign_id`, а **опорный
constraint**, на который `analysis_snapshot` ссылается собственным составным
FK (§4) — связь `post_launch_refresh` доказывается декларативно, без
триггера с subquery.

**Уникальность Campaign–ТЗ.** Предыдущая версия этого ADR ошибочно
утверждала, что `campaign_subject_link_projection_composite_unique` защищает
от повторного использования одного `technical_assignment_id + source_revision`
под другим `campaign_id` — это неверно: `campaign_id` **входит** в этот
`UNIQUE`, поэтому разные значения `campaign_id` делают весь составной ключ
различным и никакого конфликта не создают. Добавлен отдельный
`CONSTRAINT campaign_subject_link_projection_one_campaign_per_ta_revision
UNIQUE (scenario, technical_assignment_id, source_revision)`, явно
запрещающий более одной Campaign на одну и ту же revision одного Technical
Assignment. Это согласуется с уже существующим поведением приложения (не
новое бизнес-правило, изобретённое этим ADR): `launchCampaignFromTechnicalAssignment`
уже сегодня требует `lifecycle_status = ready_for_analysis` для запуска
(`ADR-0008`) и переводит ТЗ в `campaign_started` при успехе; повторное
редактирование `campaign_started` ТЗ на месте explicitly не реализовано
(`ADR-0008`, «Явно НЕ входит»), то есть один `(technical_assignment_id,
revision)` структурно не может запустить вторую Campaign при существующем
коде. Этот `UNIQUE` — DB-level закрепление уже действующего инварианта
приложения (defense in depth), а не новое продуктовое решение.

**`authorization_contract_version` и legacy replay.** Поле различает две
исторические схемы вычисления `command_hash` launch-команды:

- `legacy_v1` — Campaign, запущенные до этой миграции; `analysis_snapshot_id`,
  `authorized_analysis_kind`, `authorized_analysis_status` всегда `NULL`
  (Analysis Snapshot для них никогда не существовал и не проверялся при их
  запуске).
- `analysis_v2` — Campaign, запущенные после этой миграции; все три поля
  обязательны и хранят точное доказательство использованного `pre_launch`
  Snapshot (§5 "Усиленное доказательство авторизации launch", §7).

Подробности версионирования `command_hash` и правило "fail closed при
отсутствующей/противоречивой связи" — §7.

**Заполнение при новом launch.** Таблица заполняется ролью
`lmapp_campaign_writer` внутри уже существующей атомарной launch-транзакции
(`launchCampaign.ts`), одним `INSERT`, использующим значения, уже вычисленные
для события `campaign.subject_linked.v1` (`entityType`, `ta.id`,
`input.technicalAssignmentId`, `input.expectedRevision`, единый `occurredAt`
— переиспользуется как `linked_at`, без нового обращения к часам), плюс
`authorization_contract_version='analysis_v2'`, переданный
`analysis_snapshot_id`, `authorized_analysis_kind='pre_launch'` и
`authorized_analysis_status` — статус проверенного Snapshot (`completed`
или `insufficient_data`, из результата launch-time проверки §7).

Порядок операций в транзакции: этот `INSERT` **обязан** идти **после**
существующего upsert `campaign_current_state_projection` и **до** `UPDATE
lifecycle_status` — потому что `campaign_id` в `campaign_subject_link_projection`
это FK на `campaign_current_state_projection (campaign_id)`, а PostgreSQL по
умолчанию проверяет (не-`DEFERRABLE`) FK на уровне отдельного оператора: на
момент выполнения `INSERT` в `campaign_subject_link_projection` строка в
`campaign_current_state_projection` уже должна быть зафиксирована
предыдущим оператором **этой же транзакции** — так же, как `property`/
`tenant_request` уже должны существовать до `INSERT` в
`campaign_subject_link_projection` из-за собственных FK этой таблицы (§2), и
как соответствующая строка `analysis_snapshot` уже должна существовать
(она гарантированно существует — Snapshot создаётся отдельной, более ранней
транзакцией §6, задолго до launch). Порядок двух Campaign-событий
(`subject_linked`, затем `status_recorded`) и их относительный порядок к
`campaign_stream_head`/lifecycle-обновлению не меняются. Полная операционная
последовательность — §7.

**Backfill.** Migration 008 заполняет проекцию из уже существующих
`campaign.subject_linked.v1` событий в две фазы: явная fail-closed
валидация, затем безусловный `INSERT ... SELECT`, устанавливающий
`authorization_contract_version='legacy_v1'` и три authorization-поля в
`NULL` для каждой строки.

- **Migration 006 недостаточна как единственное доказательство формы.**
  Предыдущая версия этого ADR полагалась на то, что
  `campaign_event_log_payload_subject_linked_shape_check` (migration 006,
  добавлен без `NOT VALID`) уже провалидировал форму каждой существовавшей
  строки. Это верно лишь отчасти: PostgreSQL трактует `NULL`-результат
  `CHECK`-выражения как **разрешённый**, а не как нарушение — если бы,
  например, `payload->>'entity_type'` было SQL `NULL` (ключ физически
  отсутствует или является `JSON null`), то `(payload->>'entity_type') IN
  ('Property', 'TenantRequest')` вернуло бы `NULL`, а не `FALSE`, и весь
  `AND`-конъюнкт constraint'а мог бы в принципе также свернуться в `NULL` —
  такая строка была бы **разрешена** migration 006, хотя структурно
  дефектна. Полагаться на существующий `CHECK` как на исчерпывающее
  доказательство non-null-формы исторических данных нельзя.
- **Явная fail-closed validation-фаза**, без тихой фильтрации, перед
  безусловным `INSERT`:

  ```sql
  DO $$
  DECLARE
    invalid_count bigint;
  BEGIN
    -- Фаза 0a: payload обязан быть JSON object -- проверяется первой и
    -- отдельно, останавливая миграцию до того, как любая последующая
    -- проверка вызовет jsonb_object_length/`?` на потенциально не-object
    -- значении (jsonb_object_length на скаляре/массиве -- ошибка
    -- PostgreSQL, а не NULL/FALSE; последовательные RAISE EXCEPTION в этом
    -- DO-блоке гарантируют, что фаза 0b выполняется только если 0a уже
    -- подтвердила нулевое число не-object payload).
    SELECT count(*) INTO invalid_count
    FROM leasemind_app.campaign_event_log e
    WHERE e.event_type = 'campaign.subject_linked.v1'
      AND jsonb_typeof(e.payload) IS DISTINCT FROM 'object';
    IF invalid_count > 0 THEN
      RAISE EXCEPTION
        'ANALYSIS_SNAPSHOT_BACKFILL_INVALID_SOURCE_EVENTS: % campaign.subject_linked.v1 row(s) have a non-object payload',
        invalid_count;
    END IF;

    -- Фаза 0b: ровно пять обязательных ключей и их присутствие. Безопасно
    -- вызывать jsonb_object_length/`?` здесь -- фаза 0a уже гарантировала,
    -- что каждый оставшийся payload -- JSON object.
    SELECT count(*) INTO invalid_count
    FROM leasemind_app.campaign_event_log e
    WHERE e.event_type = 'campaign.subject_linked.v1'
      AND (
        jsonb_object_length(e.payload) <> 5
        OR NOT (
          e.payload ? 'entity_type' AND e.payload ? 'entity_id'
          AND e.payload ? 'source_technical_assignment_id'
          AND e.payload ? 'source_schema_version' AND e.payload ? 'source_revision'
        )
      );
    IF invalid_count > 0 THEN
      RAISE EXCEPTION
        'ANALYSIS_SNAPSHOT_BACKFILL_INVALID_SOURCE_EVENTS: % campaign.subject_linked.v1 row(s) do not have exactly the five required payload keys',
        invalid_count;
    END IF;

    -- Точная non-null форма и типы каждого поля payload -- не полагается
    -- на migration 006 (см. выше). Безопасно вызывать ->>'...' здесь --
    -- фазы 0a/0b уже гарантировали object-форму и полный набор ключей.
    SELECT count(*) INTO invalid_count
    FROM leasemind_app.campaign_event_log e
    WHERE e.event_type = 'campaign.subject_linked.v1'
      AND (
        e.payload->>'entity_type' IS NULL
        OR e.payload->>'entity_id' IS NULL
        OR e.payload->>'source_technical_assignment_id' IS NULL
        OR e.payload->>'source_schema_version' IS NULL
        OR e.payload->'source_revision' IS NULL
        OR jsonb_typeof(e.payload->'source_revision') IS DISTINCT FROM 'number'
        OR e.payload->>'entity_type' NOT IN ('Property', 'TenantRequest')
        -- entity_id обязан совпадать с source_technical_assignment_id.
        OR e.payload->>'entity_id' <> e.payload->>'source_technical_assignment_id'
        OR e.payload->>'source_schema_version' <> '1.0'
        OR (e.payload->>'source_revision') !~ '^[1-9][0-9]*$'
        -- entity_type обязан соответствовать таблице, где реально существует entity_id.
        OR (
          e.payload->>'entity_type' = 'Property'
          AND NOT EXISTS (
            SELECT 1 FROM leasemind_app.property p
            WHERE p.property_id::text = e.payload->>'entity_id'
          )
        )
        OR (
          e.payload->>'entity_type' = 'TenantRequest'
          AND NOT EXISTS (
            SELECT 1 FROM leasemind_app.tenant_request t
            WHERE t.tenant_request_id::text = e.payload->>'entity_id'
          )
        )
        -- current-state projection обязана существовать для каждого campaign_id.
        OR NOT EXISTS (
          SELECT 1 FROM leasemind_app.campaign_current_state_projection c
          WHERE c.campaign_id = e.campaign_id
        )
      );

    IF invalid_count > 0 THEN
      RAISE EXCEPTION
        'ANALYSIS_SNAPSHOT_BACKFILL_INVALID_SOURCE_EVENTS: % campaign.subject_linked.v1 row(s) fail explicit shape/reference validation',
        invalid_count;
    END IF;

    -- Дубликаты: более одного subject_linked события на campaign_id.
    SELECT count(*) INTO invalid_count FROM (
      SELECT campaign_id FROM leasemind_app.campaign_event_log
      WHERE event_type = 'campaign.subject_linked.v1'
      GROUP BY campaign_id HAVING count(*) > 1
    ) duplicates;
    IF invalid_count > 0 THEN
      RAISE EXCEPTION
        'ANALYSIS_SNAPSHOT_BACKFILL_DUPLICATE_CAMPAIGN_LINK: % campaign_id value(s) have more than one subject_linked event',
        invalid_count;
    END IF;

    -- Противоречивая связь: один (technical_assignment_id, source_revision) под разными campaign_id.
    SELECT count(*) INTO invalid_count FROM (
      SELECT
        e.payload->>'source_technical_assignment_id' AS ta_id,
        (e.payload->>'source_revision')::integer AS rev
      FROM leasemind_app.campaign_event_log e
      WHERE e.event_type = 'campaign.subject_linked.v1'
      GROUP BY 1, 2 HAVING count(DISTINCT e.campaign_id) > 1
    ) contradictory;
    IF invalid_count > 0 THEN
      RAISE EXCEPTION
        'ANALYSIS_SNAPSHOT_BACKFILL_CONTRADICTORY_LINK: % (technical_assignment_id, source_revision) pair(s) linked to more than one campaign_id',
        invalid_count;
    END IF;
  END;
  $$;
  ```

  Все пять проверок (object-форма; ровно пять ключей и их присутствие;
  non-null форма/типы/ссылочная целостность; дубликаты; противоречивая
  связь) читают `campaign_event_log` напрямую (без фильтрующего `WHERE`,
  отбрасывающего «подозрительные» строки) и останавливают миграцию через
  `RAISE EXCEPTION`, если найдено хоть одно нарушение — а не тихо исключают
  такие строки из backfill. Первые две проверки выполняются раньше
  остальных и гарантируют, что к моменту проверки non-null формы каждый
  `payload` уже подтверждённо является JSON object с полным набором из пяти
  ключей — без этой гарантии обращение к отсутствующему ключу или вызов
  `jsonb_object_length` на не-object значении был бы небезопасен (см. фазы
  0a/0b выше).
- **Только после успешного прохождения всех проверок** — безусловный
  `INSERT ... SELECT` из `campaign_event_log`, без `ON CONFLICT`. Если,
  несмотря на явную предварительную валидацию, `INSERT` всё же нарушит
  `PRIMARY KEY`/`UNIQUE`/FK целевой таблицы — это тоже ошибка, откатывающая
  migration 008 целиком (миграции применяются транзакционно, как 001–007):
  ни одна строка не записывается частично, миграция завершается ошибкой, а
  не тихим пропуском некорректных событий.
- `lmapp_migrator` может прочитать `campaign_event_log` в рамках этой
  миграции не по новому `GRANT`, а потому что мигратор — owner объекта
  (создан им в migration 002, `ADR-0005`): PostgreSQL owner имеет привилегии
  на собственный объект без явного `GRANT`. Это одноразовая, build-time
  операция; она не открывает и не предполагает никакого нового
  runtime-доступа. `lmapp_analysis_writer` не получает и не будет получать
  доступ к `campaign_event_log` ни в каком объёме.

### 4. Схема `analysis_snapshot`

```
analysis_snapshot_id     uuid PRIMARY KEY,                          -- server-generated (randomUUID)

property_id              uuid NULL REFERENCES leasemind_app.property (property_id),
tenant_request_id        uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),
  -- CHECK "ровно одна ссылка, согласованная со scenario" -- см. §2
technical_assignment_id  uuid GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED,

source_revision          integer NOT NULL CHECK (source_revision >= 1),
scenario                 text NOT NULL CHECK (scenario IN ('need_tenant', 'need_property')),
analysis_kind            text NOT NULL CHECK (analysis_kind IN ('pre_launch', 'post_launch_refresh')),
campaign_id              uuid NULL,   -- FK см. ниже (составной, MATCH SIMPLE)
calculation_attempt      integer NOT NULL CHECK (calculation_attempt >= 1),

status                   text NOT NULL CHECK (status IN ('pending', 'completed', 'insufficient_data', 'failed')),
schema_version           text NOT NULL CHECK (schema_version = '1.0'),
method_version            text NOT NULL CHECK (method_version = 'synthetic_ru_v1'),

-- market_context как отдельные типизированные колонки, не вложенный jsonb.
-- Для method_version='synthetic_ru_v1' -- строго литеральные значения, не
-- регекс-класс: расширение на другой рынок/валюту -- отдельный ADR/migration.
country_code              text NOT NULL CHECK (country_code = 'RU'),
currency                  text NOT NULL CHECK (currency = 'RUB'),
locale                    text NOT NULL CHECK (locale = 'ru-RU'),
area_unit                 text NOT NULL CHECK (area_unit = 'sqm'),
rent_period               text NOT NULL CHECK (rent_period = 'month'),

input_fingerprint         char(64) NOT NULL CHECK (input_fingerprint ~ '^[0-9a-f]{64}$'),
evidence_dataset_revision char(64) NULL CHECK (evidence_dataset_revision ~ '^[0-9a-f]{64}$'),
evidence_as_of            timestamptz NULL,

results                   jsonb NULL,   -- форма проверяется CHECK без subquery и без SQL NULL, см. §8
failure                   jsonb NULL,   -- безопасная форма, см. ниже

idempotency_key           text NOT NULL CHECK (length(idempotency_key) > 0 AND length(idempotency_key) <= 200),
command_hash              char(64) NOT NULL CHECK (command_hash ~ '^[0-9a-f]{64}$'),

created_at                timestamptz NOT NULL DEFAULT clock_timestamp(),
generated_at              timestamptz NULL CHECK (generated_at IS NULL OR generated_at >= created_at),

-- Составной FK на campaign_subject_link_projection (создаётся раньше -- см.
-- §3, §10): доказывает, что post_launch_refresh действительно связан с
-- существующей Campaign на той же revision. MATCH SIMPLE (поведение
-- PostgreSQL по умолчанию для составных FK) означает: если campaign_id IS
-- NULL, проверка FK целиком пропускается независимо от scenario/
-- technical_assignment_id/source_revision -- это и есть механизм "для
-- pre_launch campaign_id остаётся NULL, поэтому composite FK не применяется".
CONSTRAINT analysis_snapshot_campaign_link_fk
  FOREIGN KEY (campaign_id, scenario, technical_assignment_id, source_revision)
  REFERENCES leasemind_app.campaign_subject_link_projection
    (campaign_id, scenario, technical_assignment_id, source_revision),

-- Опорный composite UNIQUE для ОБРАТНОГО FK из campaign_subject_link_projection
-- (§3 "Усиленное доказательство авторизации launch" ниже) -- доказывает,
-- какой именно pre_launch Snapshot (по ID, scenario, ТЗ, revision, kind и
-- terminal status) авторизовал launch. analysis_snapshot_id уже PK
-- (глобально уникален), поэтому этот более широкий UNIQUE всегда валиден.
CONSTRAINT analysis_snapshot_pre_launch_authorization_unique
  UNIQUE (analysis_snapshot_id, scenario, technical_assignment_id, source_revision, analysis_kind, status)
```

`failure` — точная безопасная форма, без stack trace, raw SQL, payload и без
риска вернуть SQL `NULL` из `CHECK` (см. §8 про общий принцип):

```
CONSTRAINT analysis_snapshot_failure_shape_check CHECK (
  failure IS NULL OR COALESCE(
    CASE
      WHEN jsonb_typeof(failure) <> 'object' THEN FALSE
      WHEN jsonb_object_length(failure) <> 2 THEN FALSE
      WHEN NOT (failure ? 'code' AND failure ? 'retryable') THEN FALSE
      WHEN jsonb_typeof(failure->'code') <> 'string' THEN FALSE
      WHEN (failure->>'code') = '' THEN FALSE
      WHEN (failure->>'code') NOT IN ('ANALYSIS_DATASET_UNAVAILABLE', 'ANALYSIS_GENERATION_FAILED') THEN FALSE
      WHEN jsonb_typeof(failure->'retryable') <> 'boolean' THEN FALSE
      ELSE TRUE
    END,
    FALSE
  )
)
```

`CASE` гарантирует порядок вычисления ветвей (в отличие от плоского `AND`,
для которого PostgreSQL официально не гарантирует порядок/short-circuit) —
каждая последующая ветвь опирается на то, что предыдущая уже подтвердила тип,
поэтому `jsonb_object_length`/`->>` никогда не вызываются на значении
неожиданной формы. Финальный `COALESCE(..., FALSE)` — дополнительный барьер
на случай, если сама ветвь `CASE` всё же вернёт `NULL` (например, если
`failure` содержит `"code": null`, тогда `jsonb_typeof(failure->'code')`
возвращает `'null'`, что уже отфильтровывается веткой
`<> 'string'` → `TRUE` → `FALSE`, но `COALESCE` остаётся сеткой безопасности
для любых не предусмотренных промежуточных `NULL`).

Свободный `message` не хранится: по аналогии с `reason_codes`/`assumptions`
(доп. §7.2 — «локализованный текст строится frontend по стабильным enum и
code»), `message` для ответа API строится frontend/API-слоем детерминированно
из `code`, а не персистится как текст.

**DB-инварианты по статусу** (все — обычный `CHECK`, без subquery):

```
-- pre_launch требует campaign_id IS NULL
CONSTRAINT analysis_snapshot_pre_launch_no_campaign CHECK (
  analysis_kind <> 'pre_launch' OR campaign_id IS NULL
),

-- post_launch_refresh требует campaign_id (доказанная связь -- составной FK выше)
CONSTRAINT analysis_snapshot_post_launch_requires_campaign CHECK (
  analysis_kind <> 'post_launch_refresh' OR campaign_id IS NOT NULL
),

-- terminal status <=> generated_at задан; pending <=> generated_at пуст
CONSTRAINT analysis_snapshot_generated_at_matches_status CHECK (
  (status = 'pending') = (generated_at IS NULL)
),

-- completed/insufficient_data требуют results и не имеют failure
CONSTRAINT analysis_snapshot_completed_requires_results CHECK (
  status NOT IN ('completed', 'insufficient_data')
  OR (results IS NOT NULL AND failure IS NULL)
),

-- failed требует failure и не публикует частичный result
CONSTRAINT analysis_snapshot_failed_requires_failure CHECK (
  status <> 'failed' OR (failure IS NOT NULL AND results IS NULL)
),

-- pending не публикует ни result, ни failure
CONSTRAINT analysis_snapshot_pending_publishes_nothing CHECK (
  status <> 'pending' OR (results IS NULL AND failure IS NULL)
)
```

Связь `post_launch_refresh → campaign_subject_link_projection` — не триггер:
она доказывается декларативно составным FK `analysis_snapshot_campaign_link_fk`
выше. Отдельного `validate_analysis_snapshot_campaign_link`-триггера в этом
решении нет.

**Terminal immutability.** Единая функция обрабатывает и `DELETE` (всегда
запрещён), и `UPDATE` (разрешён только как переход `pending → terminal`):

```
CREATE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: DELETE is never permitted on leasemind_app.analysis_snapshot';
  END IF;

  -- TG_OP = 'UPDATE' с этой точки.
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: UPDATE on a terminal row is not permitted';
  END IF;
  IF NEW.status NOT IN ('completed', 'insufficient_data', 'failed') THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: pending may only transition to a terminal status';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation() FROM PUBLIC;

CREATE TRIGGER analysis_snapshot_reject_delete
  BEFORE DELETE ON leasemind_app.analysis_snapshot
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation();

CREATE TRIGGER analysis_snapshot_reject_invalid_update
  BEFORE UPDATE ON leasemind_app.analysis_snapshot
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation();
```

`DELETE` отклоняется безусловно (любой статус, включая `pending`). `UPDATE`
отклоняется, если исходная строка уже terminal (`OLD.status <> 'pending'`
— любая модификация terminal-строки запрещена), и отдельно отклоняется, если
новый статус не входит в три терминальных значения — это исключает и
`pending → pending`, и любой другой недопустимый переход, одним и тем же
условием, без специального случая.

Второй барьер — колоночные `GRANT`: `lmapp_analysis_writer` получает `UPDATE`
только на `status, generated_at, results, failure, evidence_as_of,
evidence_dataset_revision` (§9) — identity-колонки (`analysis_snapshot_id`,
`property_id`, `tenant_request_id`, `source_revision`, `scenario`,
`analysis_kind`, `campaign_id`, `calculation_attempt`), command-колонки
(`idempotency_key`, `command_hash`), market-колонки (`schema_version`,
`method_version`, `country_code`, `currency`, `locale`, `area_unit`,
`rent_period`) и `input_fingerprint`/`created_at` не входят ни в один
`UPDATE`-грант ни у одной роли — их нельзя переписать даже если триггер
почему-то не сработает. `DELETE`/`TRUNCATE` не выданы ни одной runtime-роли.

**Индексы и уникальность** — §5.

### 5. Idempotency и уникальность

- `idempotency_key` — endpoint-level `UNIQUE`:

  ```
  CREATE UNIQUE INDEX analysis_snapshot_idempotency_key_key
    ON leasemind_app.analysis_snapshot (idempotency_key);
  ```

  Один ключ не может относиться к двум разным логическим Analysis-командам
  или попыткам, аналогично `property_idempotency_key_key`/
  `tenant_request_idempotency_key_key` (migration 005).
- `command_hash = sha256Hex(\`LEASEMIND_ANALYSIS_SNAPSHOT_V1|COMMAND|${technical_assignment_id}|${source_revision}|${analysis_kind}|${campaign_id ?? ''}|${method_version}\`)` —
  тот же домен-разделённый приём, что `computeLaunchCommandHash`
  (`launchCampaign.ts`) и `DOMAIN_SEPARATOR`-хэши в `campaignEvents.ts`.
- Тот же `idempotency_key` + тот же `command_hash` → возврат той же строки
  без новой записи (replay).
- Тот же `idempotency_key` + другой `command_hash` → conflict
  (`ANALYSIS_IDEMPOTENCY_CONFLICT`, доп. §12.1) без частичной записи.

**Retry и `calculation_attempt` — рекомендуемое, но не окончательно принятое
архитектурное решение.** Без явного номера попытки terminal-неизменяемость
(§4) сделала бы retry после `failed` невозможным в принципе, а
`ANALYSIS_SNAPSHOT.md` §5 (принцип 2: «Новый расчёт создаёт новый Snapshot»)
и кнопка «Повторить» §15.1 требуют какого-то механизма новой попытки. Этот
ADR предлагает `calculation_attempt integer NOT NULL CHECK
(calculation_attempt >= 1)`:

```
CREATE UNIQUE INDEX analysis_snapshot_logical_attempt_unique
  ON leasemind_app.analysis_snapshot
  (technical_assignment_id, source_revision, analysis_kind, calculation_attempt);

CREATE UNIQUE INDEX analysis_snapshot_single_pending_per_logical_key
  ON leasemind_app.analysis_snapshot (technical_assignment_id, source_revision, analysis_kind)
  WHERE status = 'pending';
```

Первый индекс — логическая уникальность конкретной попытки. Второй —
частичный уникальный индекс, гарантирующий не более одной незавершённой
(`pending`) попытки на логическую команду одновременно, независимо от
`calculation_attempt`.

Под тем же advisory lock, что и создание Snapshot (§6), новая попытка после
`failed` получает следующий `calculation_attempt` (`max(calculation_attempt)
+ 1` для этой логической команды) и новый `analysis_snapshot_id`; вызывающая
сторона обязана предъявить новый `idempotency_key` — тот же `idempotency_key`
по-прежнему детерминированно означает replay той же самой попытки (см. выше),
никогда не новую попытку.

`GET .../current` (доп. §11.2) выбирает текущую попытку стабильно:

```
SELECT * FROM leasemind_app.analysis_snapshot
 WHERE technical_assignment_id = $1 AND source_revision = $2 AND analysis_kind = $3
 ORDER BY calculation_attempt DESC
 LIMIT 1
```

Детерминированность гарантирована `analysis_snapshot_logical_attempt_unique`
— на каждую четвёрку `(technical_assignment_id, source_revision,
analysis_kind, calculation_attempt)` существует ровно одна строка, поэтому
`ORDER BY calculation_attempt DESC LIMIT 1` не нуждается в дополнительном
tie-break.

**Область гарантии конкурентного replay и совместимость с `AS-C-004` —
исправлено после третьего ревью.** Предыдущая версия этого ADR утверждала,
что второй запрос с **другим** `idempotency_key`, но тем же логическим
смыслом (`technical_assignment_id` + `source_revision` + `analysis_kind`),
получит нарушение уникальности `analysis_snapshot_single_pending_per_logical_key`
(`WHERE status = 'pending'`). Это неверно для описанной в §6 транзакционной
схемы: session-level advisory lock по `technical_assignment_id`
удерживается **на протяжении всей команды** — от захвата до `COMMIT`/
`ROLLBACK` и `pg_advisory_unlock` в `finally` — а не только на момент
чтения. Поэтому две команды на один `technical_assignment_id` полностью
сериализуются: вторая физически не может начать `BEGIN` своей транзакции,
пока первая не завершится целиком. Поскольку `synthetic_ru_v1` считается
синхронно и первая команда успевает пройти `pending → terminal` внутри
одной и той же транзакции (§6) **до** освобождения lock, к моменту, когда
вторая команда получает lock и приступает к работе, строка первой попытки
уже **не `pending`** — partial unique index `analysis_snapshot_single_pending_per_logical_key`
её больше не покрывает, и никакого нарушения уникальности не возникает.

Поведение в этом сценарии — второй запрос с другим `idempotency_key`
приходит уже после того, как первый завершился terminal — **не определено
этим ADR**. Ни один из следующих вариантов не выбран и не должен
реализовываться до решения PRODUCT: (a) автоматическое создание новой
попытки (`calculation_attempt + 1`); (b) автоматический возврат уже
существующей первой строки как «replay» для другого ключа; (c) отказ с
ошибкой конфликта. Наивная реализация — просто вставить новую строку, раз
partial-unique-индекс этому не препятствует — была бы недокументированным
продуктовым решением, тихо принятым в коде, а не PRODUCT.

`ANALYSIS_SNAPSHOT.md` §6.1 фиксирует логическую уникальность без понятия
`calculation_attempt`, а `AS-C-004` («два запроса одновременно создают один
`pre_launch`... обе сходятся к одному Snapshot и одному terminal result»)
буквально не уточняет, используют ли эти два запроса один и тот же
`idempotency_key`. При модели этого ADR гарантия `AS-C-004` выполняется
полностью **только** для одинакового `idempotency_key` (стандартный replay,
описанный в начале раздела). Для сценария «два разных клиента одновременно
инициируют один и тот же логический `pre_launch` с разными ключами» эта
архитектура **ничего не гарантирует** — ни схождения к одной записи, ни
отказа — до одного из двух продуктовых решений: (a) отдельной
idempotency-command mapping table, сопоставляющей произвольные
`idempotency_key` одному логическому Snapshot, либо (b) явного продуктового
правила, ограничивающего инициацию конкретного логического Snapshot одним
клиентом/одним `idempotency_key` одновременно.

**Явно нерешённый продуктовый вопрос.** Этот механизм уточняет техническую
неоднозначность `ANALYSIS_SNAPSHOT.md` — принцип §5 (пункт 2), логическую
уникальность §6.1, кнопку «Повторить» §15.1 и совместимость с `AS-C-004` —
только на уровне *механизма* (как хранится и адресуется попытка). Он **не
решает** продуктовые вопросы: при каких именно условиях допустима новая
попытка (только после `failed`? допустим ли повторный расчёт поверх уже
`completed`/`insufficient_data`? кто инициирует новый `idempotency_key` —
всегда явное нажатие «Повторить», или также автоматический retry?); и в
особенности — как должен вести себя запрос с новым `idempotency_key` после
уже существующего terminal Snapshot (см. выше). `calculation_attempt`
остаётся **рекомендуемым** механизмом retry (§5, начало раздела) — сам
номер попытки и его схема хранения не оспариваются этим замечанием, — но
реализация пути «новый ключ после terminal» заблокирована до решения
PRODUCT. Этот ADR не изобретает такой продуктовый смысл. **До перевода
статуса ADR из `Proposed` в `Accepted` требуется синхронизация с PRODUCT**
и явное уточнение `ANALYSIS_SNAPSHOT.md` §5/§6.1/§15.1 по обоим вопросам.

### 6. Транзакции и evidence

**Проблема исходной версии.** `pg_advisory_xact_lock(...)` как первый
оператор уже внутри `BEGIN ISOLATION LEVEL REPEATABLE READ` не гарантирует,
что MVCC snapshot транзакции будет установлен **после** того, как lock
реально получен. PostgreSQL фиксирует snapshot `REPEATABLE READ`-транзакции
в момент выполнения её первого запроса — а не в момент, когда этот запрос
успешно завершился, если он блокировался в ожидании lock. Если конкурентная
`save Technical Assignment`-транзакция удерживает тот же advisory lock и
коммитит новую `revision` **пока** наш `pg_advisory_xact_lock` ещё ждёт
своей очереди, есть риск, что наш snapshot окажется зафиксирован раньше
этого commit — мы дождёмся lock, но всё равно прочитаем устаревшую
`revision`/evidence, что полностью обесценивает цель захвата lock. Это
поведение требует эмпирической проверки на PostgreSQL 18.4 (Verification
plan), но сама возможность такого исхода уже делает исходный порядок
недостаточно надёжным для инварианта «revision не может измениться во время
создания Snapshot».

**Второе ревью:** первое исправление (session-level lock на **отдельном**
соединении, транзакция — на **другом** пуловом соединении) устраняло риск
snapshot, но вводило новую проблему: одна Analysis-команда занимала **два**
клиента из pool одновременно, удваивая потребление пула и создавая риск pool
starvation под параллельной нагрузкой. Исправленная схема использует **один**
выделенный `pg.PoolClient` на всю команду.

**Исправленный порядок — один клиент:**

1. Из `lmapp_analysis_writer` pool извлекается **один** `pg.PoolClient`,
   используемый для всей команды целиком.
2. На этом клиенте, **до** `BEGIN`, в режиме autocommit берётся
   **session-level** advisory lock: `SELECT pg_advisory_lock(hashtextextended(
   'technical-assignment:id:' || $technical_assignment_id, 0))` — тот же
   lock-key/namespace, что уже использует `lockCommandScopes`
   (`technicalAssignment.ts`) для scope
   `technical-assignment:id:${technicalAssignmentId}`; `pg_advisory_lock` и
   `pg_advisory_xact_lock` делят один и тот же 64-битный key space в
   PostgreSQL, поэтому эта session-level блокировка реально взаимно
   исключает себя с xact-level блокировками `lockCommandScopes` на тот же
   ключ. Поскольку вызов происходит вне какой-либо транзакции этого
   клиента, вопрос о преждевременно зафиксированном `REPEATABLE READ`
   snapshot здесь структурно не возникает.
3. Только после того как `pg_advisory_lock` фактически вернул управление
   (lock гарантированно получен, а значит любая конкурирующая
   `save Technical Assignment`-транзакция на этот `technical_assignment_id`
   уже закоммичена и завершена), **на этом же клиенте** выполняется `BEGIN
   ISOLATION LEVEL REPEATABLE READ` — snapshot этой транзакции гарантированно
   устанавливается уже после чужого commit.
4. **На этом же клиенте**, внутри уже открытой `REPEATABLE READ`-транзакции,
   отдельно берётся `pg_advisory_xact_lock` по scope
   `analysis-snapshot:key:${idempotencyKey}` — сериализация повторов одной и
   той же команды; авто-освобождается при `COMMIT`/`ROLLBACK`, отдельного
   `finally`-освобождения не требует.
5. **На этом же клиенте** выполняются чтение `revision`/evidence, расчёт и
   запись (`INSERT` строки `pending`, последующий `UPDATE` в terminal — §4),
   затем `COMMIT` либо `ROLLBACK`.
6. В `finally`, **на этом же клиенте**, выполняется `SELECT
   pg_advisory_unlock(...)` для session-level lock из шага 2 (session-level
   advisory locks привязаны к сессии, а не к транзакции — они не снимаются
   автоматически ни `COMMIT`, ни `ROLLBACK` из шага 5). Если подтверждение
   `pg_advisory_unlock` не получено (сетевая ошибка, сама функция вернула
   `false`, исключение при вызове) — клиент **уничтожается**, а не
   возвращается в pool: нельзя рисковать тем, что физическое соединение с
   фактически всё ещё удерживаемым lock будет молча выдано следующему
   заёмщику пула и создаст постоянную блокировку для всех будущих операций
   над этим `technical_assignment_id`. Если `pg_advisory_unlock` подтверждён
   — клиент возвращается в pool штатно.

Поскольку вся команда потребляет ровно один `pg.PoolClient` на всё время
выполнения (как обычная транзакция, без второго checkout), риск удвоенного
расхода pool и pool starvation, присущий предыдущей версии, снят.

Поскольку в этой схеме между Analysis-командой и `lockCommandScopes`
(save Technical Assignment) реально разделяется **ровно один** lock-key
(`technical-assignment:id:...`) — Analysis никогда не удерживает его
одновременно с каким-либо другим *разделяемым* с TA-save ключом (её
собственный `analysis-snapshot:key:...` не пересекается ни с одним из двух
scope, которые использует `lockCommandScopes`) — циклическое ожидание
(deadlock) между этими двумя путями структурно невозможно: единственный
общий ресурс не может образовать цикл сам с собой.

- `evidence_as_of = transaction_timestamp()` этой согласованной транзакции
  (шаг 3) — единая точка отсчёта для всего расчёта.
- `evidence_dataset_revision` вычисляется как SHA-256 отсортированного
  набора `(entity_type, entity_id, revision, updated_at)`, увиденного этой
  же транзакцией под `REPEATABLE READ` (доп. §7.1). Списки исходных
  `entity_id` не сохраняются нигде за пределами момента хэширования —
  только их агрегированный хэш попадает в строку.
- Для `synthetic_ru_v1` расчёт выполняется синхронно в этой же транзакции:
  допустимо вставить `pending` и завершить переход `pending → terminal`
  (§4) внутри одной и той же транзакции — клиент в Sprint 5 всегда получает
  terminal-ответ. Durable background очередь не добавляется; `202`/`pending`
  как асинхронный контракт (доп. §11.1) остаётся объявленной, но нереализуемой
  в Sprint 5 границей для будущего решения — HTTP-контракт её не теряет, но
  код её не порождает.
- `freshness_status` **не хранится**: он вычисляется при чтении сравнением
  `analysis_snapshot.source_revision` с текущей `revision` строки
  `property`/`tenant_request` на роли `lmapp_api_reader` — ровно так же, как
  описано в доп. §6.4, без каких-либо `UPDATE` terminal-строки.

### 7. Launch-time check и авторизация

`POST /api/v1/campaigns` (launch) принимает `analysis_snapshot_id` как
**опциональное на транспортной границе** поле JSON Schema (не в `required`)
— это необходимо, чтобы replay старой `legacy_v1` команды, отправленной ещё
до migration 008 и никогда не содержавшей этого поля, не ломался на
schema-валидации при повторной отправке тем же клиентом. Для **новой**
(не replay) команды поле обязательно на уровне application-логики, уже
после того, как replay lookup определил, что это не повтор существующей
команды (см. ниже).

Отсутствие поля для новой команды — **не ошибка формата idempotency key**,
а отсутствие обязательного условия для запуска: сервер отклоняет запрос уже
существующим стабильным кодом `TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED`
(`TechnicalAssignmentAnalysisRequiredError`, уже определён в
`launchCampaign.ts` для семантически того же случая — «нет валидного
Analysis, авторизующего запуск»; `ADR-0008`), а не `INVALID_IDEMPOTENCY_KEY`
и не новым, не утверждённым PRODUCT кодом. Тот же код используется, если
поле присутствует, но launch-time проверка (`SELECT` ниже) не находит
подходящей `completed`/`insufficient_data` строки для этого
`technical_assignment_id`/`scenario`/`source_revision` — обе ситуации
семантически одно и то же: «нет валидного pre-launch Analysis, которым
можно авторизовать этот запуск».

**Версионирование `command_hash` — два разных domain separator, не «V1 плюс
поле».** Использование одного и того же domain separator для V1 и V2 с
опциональным довеском создавало бы риск неоднозначности между «V1 без поля»
и «V2 с пустым полем». Вместо этого — два самостоятельных, различающихся
domain separator:

- **V1 (legacy, без изменений)** — уже используемая сегодня
  `computeLaunchCommandHash`:
  `sha256Hex(\`LEASEMIND_CAMPAIGN_LAUNCH_V1|COMMAND|${campaignId}|${technicalAssignmentId}|${expectedRevision}\`)`.
  Каждая Campaign, запущенная до migration 008, имеет `command_hash` в
  `campaign_event_log`, вычисленный именно так — переписывать исторические
  события нельзя (`campaign_event_log` immutable, `ADR-0002`).
- **V2 (новый, отдельный separator)**:
  `sha256Hex(\`LEASEMIND_CAMPAIGN_LAUNCH_V2|COMMAND|${campaignId}|${technicalAssignmentId}|${expectedRevision}|${analysisSnapshotId}\`)`.

Replay lookup **остаётся первым шагом**, раньше проверок Contacts Gate, ТЗ и
Analysis: поиск по `(campaign_id, idempotency_key, event_type)` в
`campaign_event_log`, без изменений.

**Проверка при replay — авторизация подтверждается явно, не только
совпадением хэша (исправлено после третьего ревью).** Предыдущая версия
полагалась исключительно на то, что несовпадение `analysis_snapshot_id`
рано или поздно проявится как несовпадение пересчитанного `command_hash`.
Это технически верно, но недостаточно явно и не даёт специфичной причины
отказа. Вместо этого сервер выполняет строго упорядоченную проверку:

1. Для найденного `campaign_id` сервер читает из
   `campaign_subject_link_projection` **одной строкой** сразу оба поля —
   `authorization_contract_version` и сохранённый `analysis_snapshot_id`
   (`storedAnalysisSnapshotId`).
2. Если строка отсутствует, или `authorization_contract_version` не равен
   ни `legacy_v1`, ни `analysis_v2` — **fail closed**: запрос отклоняется
   стабильной ошибкой немедленно, ни один из следующих шагов не
   выполняется, ни одна формула хэша не подбирается угадыванием.
3. Если `authorization_contract_version = 'legacy_v1'` — отсутствие
   `analysis_snapshot_id` во входящем запросе остаётся допустимым (как и
   раньше); используется формула V1, без него.
4. Если `authorization_contract_version = 'analysis_v2'`:
   - отсутствие `analysis_snapshot_id` во входящем запросе отклоняется
     `TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED` (см. выше), до вычисления
     любого хэша;
   - если `analysis_snapshot_id` присутствует, но **не равен**
     `storedAnalysisSnapshotId` — отклоняется явной проверкой равенства (не
     косвенно, через несовпадение хэша), тем же путём, что и «другой
     `command_hash` под тем же ключом» (`LaunchIdempotencyConflictError` →
     `TECHNICAL_ASSIGNMENT_REVISION_CONFLICT`) — по сути тот же случай: тот
     же `idempotency_key` использован для другой логической команды;
   - только после того, как оба явных условия выше пройдены, сервер
     вычисляет V2 `command_hash` (используя уже подтверждённый
     `analysis_snapshot_id`) и сравнивает его с сохранённым в
     `campaign_event_log` — финальное, а не единственное, подтверждение.

Явная проверка равенства ID на шаге 4 не избыточна по отношению к сравнению
хэшей: она даёт более раннее и специфичное отклонение (до вычисления
SHA-256), делает причину отказа проверяемой напрямую по данным
`campaign_subject_link_projection`, а не только выводимой из совпадения/
несовпадения хэша.

**Launch-time проверка для новой (не replay) команды.** После проверки
Contacts Gate и лока текущей `revision` ТЗ (`SELECT ... FOR UPDATE`, уже
существующий шаг), но до вставки событий, `lmapp_campaign_writer` проверяет
переданный `analysis_snapshot_id`, сравнивая **также `scenario`**, а не
только UUID и revision:

```
SELECT status FROM leasemind_app.analysis_snapshot
 WHERE analysis_snapshot_id = $1
   AND analysis_kind = 'pre_launch'
   AND scenario = $2                                 -- ta.scenario, уже известный из лока ТЗ
   AND technical_assignment_id = $3                  -- ta.id, уже заблокированный
   AND source_revision = $4                          -- уже заблокированный ta.revision
   AND status IN ('completed', 'insufficient_data')
```

Поскольку `source_revision` в запросе — это только что заблокированная
текущая `revision` ТЗ, положительный результат этого `SELECT` автоматически
доказывает «Snapshot current для заблокированной строки ТЗ» — отдельного
вычисления `freshness_status` на этом пути не требуется. Любое несовпадение
откатывает всю launch-транзакцию целиком.

**Усиленное, постоянное доказательство авторизации (§3, §4).** Runtime-проверка
выше — проверка **в момент** launch. Отдельно от неё, permanent DB-level
доказательство того, что именно этот `pre_launch` Snapshot когда-либо
авторизовал именно эту Campaign, фиксируется составным FK
`campaign_subject_link_projection_analysis_snapshot_fk`, добавляемым в §10:

```
-- На campaign_subject_link_projection (referencing сторона):
CONSTRAINT campaign_subject_link_projection_analysis_snapshot_fk
  FOREIGN KEY (analysis_snapshot_id, scenario, technical_assignment_id, source_revision,
               authorized_analysis_kind, authorized_analysis_status)
  REFERENCES leasemind_app.analysis_snapshot
    (analysis_snapshot_id, scenario, technical_assignment_id, source_revision, analysis_kind, status)
```

Простой FK только по `analysis_snapshot_id` доказывал бы лишь то, что такой
`analysis_snapshot_id` где-то существует — но не то, что он относится к
тому же `scenario`/`technical_assignment_id`/`source_revision`, что и сама
запись `campaign_subject_link_projection`, и не то, что его `analysis_kind`
действительно `pre_launch`, а `status` действительно terminal-разрешённый.
Составной FK требует **одновременного** совпадения всех шести компонент с
соответствующими колонками `analysis_snapshot` — расхождение в любой
компоненте делает `INSERT` невозможным на уровне БД, а не только на уровне
runtime-проверки в момент запроса. `authorized_analysis_kind` жёстко
ограничен `CHECK (... = 'pre_launch')` (§3), поэтому FK эффективно
принуждает `analysis_snapshot.analysis_kind` референсной строки быть именно
`'pre_launch'`, хотя сам FK synatically не умеет сравнивать колонку с
литералом. Для `legacy_v1` все три authorization-поля — `NULL`, и MATCH
SIMPLE (поведение по умолчанию для составных FK) пропускает проверку FK
целиком — legacy-строки остаются валидными без доказательства.

**Полная операционная последовательность** (существующие операции
`ADR-0008`/`launchCampaign.ts` не переставляются; новые отмечены **[NEW]**):

1. `SELECT ... FOR UPDATE` строки Property/TenantRequest.
2. Проверка `lifecycle_status`, `revision`, Contacts Gate evidence.
3. **[NEW]** Launch-time Analysis check (выше) — до вставки каких-либо
   событий.
4. `INSERT` события `campaign.subject_linked.v1` (sequence N).
5. `INSERT` события `campaign.status_recorded.v1`, `status=Created`
   (sequence N+1) — порядок двух событий не меняется.
6. `UPDATE campaign_stream_head`.
7. Upsert `campaign_current_state_projection`.
8. **[NEW]** `INSERT` в `campaign_subject_link_projection`
   (`authorization_contract_version='analysis_v2'`, переданный
   `analysis_snapshot_id`, `authorized_analysis_kind='pre_launch'`,
   `authorized_analysis_status` = статус из шага 3) — строго после шага 7,
   поскольку её FK на `campaign_current_state_projection` требует, чтобы
   соответствующая строка уже существовала в этой же транзакции (§3), и её
   составной FK на `analysis_snapshot` требует, чтобы referenced-строка уже
   существовала (гарантированно, т.к. Snapshot создаётся отдельной, более
   ранней транзакцией §6).
9. `UPDATE Property/TenantRequest SET lifecycle_status='campaign_started'`.
10. `COMMIT`.

Любая ошибка на любом шаге — `ROLLBACK` всей транзакции целиком, включая оба
новых шага.

### 8. JSONB validation

PostgreSQL не разрешает subquery (`SELECT`, `jsonb_object_keys(...)` как
table function) внутри `CHECK`-constraint — исходная версия этого ADR была
неисполнима. **Второе ревью дополнительно выявило**, что PostgreSQL трактует
`NULL`-результат `CHECK`-выражения как **допустимый** (не как нарушение) — а
плоский `AND`, применённый к условиям, из которых хотя бы одно оперирует
отсутствующим ключом (`envelope->>'missing_key'` возвращает SQL `NULL`),
легко сворачивается в `NULL` вместо `FALSE`. Функция переписана так, чтобы
**всегда** возвращать строго `TRUE` или `FALSE`, через `CASE`
(гарантированный порядок вычисления ветвей, в отличие от `AND`) и финальный
`COALESCE(..., FALSE)`:

```
CREATE FUNCTION leasemind_app.is_valid_metric_envelope(envelope jsonb) RETURNS boolean AS $$
  SELECT COALESCE(
    CASE
      WHEN envelope IS NULL THEN FALSE
      WHEN jsonb_typeof(envelope) <> 'object' THEN FALSE
      WHEN jsonb_object_length(envelope) <> 7 THEN FALSE
      WHEN NOT (
        envelope ? 'metric_status' AND envelope ? 'confidence' AND envelope ? 'value'
        AND envelope ? 'sample_size' AND envelope ? 'evidence'
        AND envelope ? 'reason_codes' AND envelope ? 'assumptions'
      ) THEN FALSE
      -- Явная проверка типа перед проверкой enum: если ключ 'metric_status'
      -- присутствует, но его значение -- JSON null (или неожиданный
      -- скалярный тип), envelope->>'metric_status' вернёт SQL NULL, а
      -- `NULL NOT IN (...)` -- тоже SQL NULL, что CASE трактует как "ветка
      -- не сработала" и пропускает дальше, а не как явный отказ.
      -- IS DISTINCT FROM гарантированно даёт TRUE/FALSE, никогда NULL.
      WHEN jsonb_typeof(envelope->'metric_status') IS DISTINCT FROM 'string' THEN FALSE
      WHEN (envelope->>'metric_status') NOT IN ('assessed', 'insufficient_data') THEN FALSE
      WHEN NOT (
        (envelope->'confidence') = 'null'::jsonb OR (envelope->>'confidence') IN ('low', 'medium', 'high')
      ) THEN FALSE
      -- assessed => value обязан быть JSON object; insufficient_data => value обязан быть JSON null.
      WHEN (envelope->>'metric_status') = 'assessed' AND jsonb_typeof(envelope->'value') <> 'object' THEN FALSE
      WHEN (envelope->>'metric_status') = 'insufficient_data' AND (envelope->'value') <> 'null'::jsonb THEN FALSE
      WHEN (envelope->>'metric_status') = 'insufficient_data' AND (envelope->'confidence') <> 'null'::jsonb THEN FALSE
      WHEN jsonb_typeof(envelope->'sample_size') <> 'number' THEN FALSE
      WHEN (envelope->>'sample_size') !~ '^(0|[1-9][0-9]*)$' THEN FALSE   -- целое, неотрицательное, без fractional part
      WHEN jsonb_typeof(envelope->'evidence') <> 'object' THEN FALSE
      WHEN jsonb_object_length(envelope->'evidence') <> 3 THEN FALSE
      WHEN NOT (
        (envelope->'evidence') ? 'method' AND (envelope->'evidence') ? 'filters_applied'
        AND (envelope->'evidence') ? 'dataset_revision'
      ) THEN FALSE
      WHEN jsonb_typeof(envelope->'evidence'->'method') <> 'string' THEN FALSE
      WHEN jsonb_typeof(envelope->'evidence'->'filters_applied') <> 'array' THEN FALSE
      WHEN NOT (
        (envelope->'evidence'->'dataset_revision') = 'null'::jsonb
        OR (envelope->'evidence'->>'dataset_revision') ~ '^[0-9a-f]{64}$'
      ) THEN FALSE
      WHEN jsonb_typeof(envelope->'reason_codes') <> 'array' THEN FALSE
      WHEN jsonb_typeof(envelope->'assumptions') <> 'array' THEN FALSE
      ELSE TRUE
    END,
    FALSE
  );
$$ LANGUAGE sql IMMUTABLE;

REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb) FROM PUBLIC;

ALTER TABLE leasemind_app.analysis_snapshot ADD CONSTRAINT analysis_snapshot_results_shape_check CHECK (
  results IS NULL OR (
    jsonb_typeof(results) = 'object'
    AND results ? 'price_adequacy'
    AND results ? 'competition'
    AND results ? 'deal_probability_30d'
    AND results ? 'candidate_categories'
    AND jsonb_object_length(results) = 4   -- ровно эти четыре ключа, не больше
    AND leasemind_app.is_valid_metric_envelope(results->'price_adequacy')
    AND leasemind_app.is_valid_metric_envelope(results->'competition')
    AND leasemind_app.is_valid_metric_envelope(results->'deal_probability_30d')
    AND leasemind_app.is_valid_metric_envelope(results->'candidate_categories')
  )
);
```

`CASE ... WHEN` в PostgreSQL гарантированно вычисляет ветви по порядку и
останавливается на первой истинной (документированное поведение, в отличие
от `AND`/`OR`, для которых такой гарантии официально нет) — каждая risky
операция (`jsonb_object_length` на потенциально не-object значении,
`->>`-извлечение) защищена более ранней веткой, уже подтвердившей тип.
Финальный `COALESCE(..., FALSE)` — сетка безопасности сверху: функция
физически не может вернуть что-либо, кроме `TRUE`/`FALSE`, что делает
результат совместимым с ожиданиями `CHECK` (`NULL` в `CHECK` == разрешено,
чего мы явно избегаем).

**Тотальность функции — второе замечание третьего ревью.** Первая ветвь
`WHEN envelope IS NULL THEN FALSE` закрывает случай, когда сам аргумент —
SQL `NULL` (без неё `jsonb_typeof(NULL::jsonb)` тоже возвращает SQL `NULL`,
`NULL <> 'object'` — снова `NULL`, ни одна ветвь `CASE` не срабатывает, и
выполнение проваливается в `ELSE TRUE`, то есть некорректный envelope был
бы принят). Отдельная ветвь `jsonb_typeof(envelope->'metric_status') IS
DISTINCT FROM 'string'` закрывает случай `"metric_status": null` (или любой
не-строковый тип): `envelope->>'metric_status'` в этом случае возвращает
SQL `NULL`, а `NULL NOT IN (...)` — тоже `NULL`, что для `CASE WHEN`
означает «условие не выполнено», а не «отказ» — без явной проверки типа
такая строка также приняла бы `ELSE TRUE`. `IS DISTINCT FROM` (а не `<>`)
используется намеренно везде, где результат сравнения должен быть строго
`TRUE`/`FALSE` даже при SQL `NULL` на одной из сторон.

Каждый из семи ключей верхнего уровня `envelope` (`metric_status`,
`confidence`, `value`, `sample_size`, `evidence`, `reason_codes`,
`assumptions`) проверяется на присутствие через `?` **и** через
`jsonb_object_length(envelope) = 7`, доказывая точный набор без единого
subquery — лишний восьмой ключ сделает `jsonb_object_length` `<> 7`. Тот же
приём — для `evidence` (ровно `method`/`filters_applied`/`dataset_revision`,
`jsonb_object_length(envelope->'evidence') = 3`). `value` при
`metric_status='assessed'` обязан быть JSON object; при
`metric_status='insufficient_data'` обязан быть буквально JSON `null`, не
просто «не объект». Аналогично для `results` (§9.7 доп.) — точный набор из
четырёх верхних ключей через `?` плюс `jsonb_object_length(results) = 4`.

`sample_size` проверяется как целое неотрицательное число через
`jsonb_typeof(...) = 'number'` **и** regex-проверку текстового
представления (`~ '^(0|[1-9][0-9]*)$'`) — это отклоняет и дробные (`3.5`), и
отрицательные, и ведущие нули, не полагаясь на численное сравнение
`numeric`.

DB проверяет ровно: точный набор семи ключей `envelope` и четырёх верхних
ключей `results`; что `envelope`/`evidence`/`results` — `object`; enum
`metric_status`/`confidence`; тип `value` по `metric_status`; `sample_size`
— целое `>= 0`; точную форму `evidence` (`method` — `string`,
`filters_applied` — `array`, `dataset_revision` — `NULL` либо sha256);
базовую форму `reason_codes`/`assumptions` (`array`). Глубокие типы `value`
для конкретной метрики (`price_adequacy.value.classification`, состав
`candidate_categories.items` и т.д., доп. §9.4–§9.7) DB не проверяет — это
остаётся на runtime schema и тестах приложения. DB намеренно не пытается
воспроизвести весь application contract внутри `CHECK`.

По прецеденту migration 003 (`ADR-0005`, явный `REVOKE EXECUTE ON FUNCTION
leasemind_app.reject_campaign_event_log_mutation() FROM PUBLIC`) —
`REVOKE EXECUTE FROM PUBLIC` применяется ко **всем** новым helper/trigger
функциям этой миграции: `is_valid_metric_envelope` и
`reject_analysis_snapshot_immutable_mutation`. PostgreSQL по умолчанию выдаёт
`EXECUTE` на новые функции `PUBLIC`.

### 9. Least privilege

Новая роль:

- `lmapp_analysis_writer`
- `LEASEMIND_ANALYSIS_DATABASE_URL`
- `LEASEMIND_ANALYSIS_WRITER_PASSWORD` (только для provisioning, как
  остальные пять паролей)

**Обязательный `USAGE` на схему** — пропущен в предыдущей версии:

```
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_writer;
```

Без него ни один последующий колоночный `GRANT` не даёт роли фактического
доступа: `USAGE` на схему — предпосылка для любого доступа к объектам внутри
неё, по тому же прецеденту, что migration 005's `GRANT USAGE ON SCHEMA
leasemind_app TO lmapp_ta_writer`.

**Точные column-level гранты на `property`/`tenant_request`** — раздельные
списки для каждой таблицы, построенные по фактическим колонкам migration
005/007, не псевдосинтаксис:

```
GRANT SELECT (
  property_id, revision, lifecycle_status, created_at, updated_at,
  property_type, property_country_code, property_region, property_city, property_districts,
  property_area_sqm, property_floor, property_total_floors, property_entrance_type, property_condition,
  property_available_from, property_monthly_rent_rub, property_operating_expenses_included,
  property_utilities_included, property_security_deposit_rub, property_min_lease_months,
  property_allowed_business_categories, property_excluded_business_categories,
  property_target_tenant_categories, property_power_kw, property_ceiling_height_m, property_features,
  property_parking_spaces, property_loading_access, property_access_mode, property_deal_priority
) ON leasemind_app.property TO lmapp_analysis_writer;

GRANT SELECT (
  tenant_request_id, revision, lifecycle_status, created_at, updated_at,
  request_business_category, request_business_stage, request_expected_occupancy_people,
  request_country_code, request_region, request_cities, request_districts, request_location_priorities,
  request_property_types, request_area_min_sqm, request_area_max_sqm, request_monthly_budget_max_rub,
  request_monthly_rent_rate_max_rub_per_sqm, request_budget_includes_operating_expenses,
  request_condition_options, request_move_in_by, request_min_lease_months, request_power_min_kw,
  request_ceiling_height_min_m, request_entrance_requirement, request_floor_options,
  request_parking_min_spaces, request_loading_access_required, request_access_mode,
  request_required_features, request_excluded_features, request_deal_priority
) ON leasemind_app.tenant_request TO lmapp_analysis_writer;
```

Исключены везде: `idempotency_key`, `schema_version`, `has_exact_address`,
`property_type_other`, `property_business_category_other`,
`property_additional_requirements`, `request_business_category_other`,
`request_property_type_other`, `request_additional_requirements` — и
`property_protected_address` целиком (гранта на эту таблицу нет вовсе, как у
`lmapp_campaign_writer`/`lmapp_api_reader` сегодня). Роль не может прочитать
также `campaign_event_log`, `campaign_stream_head` (граница `ADR-0005` не
расширяется) и `schema_migrations`.

```
GRANT SELECT ON leasemind_app.campaign_subject_link_projection TO lmapp_analysis_writer;

GRANT INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint,
  idempotency_key, command_hash
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;

GRANT UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;

-- Точный колоночный SELECT -- не table-wide (см. "Противоречие устранено"
-- ниже). generated technical_assignment_id вместо raw property_id/
-- tenant_request_id: роль уже пишет через FK-колонки при INSERT, но для
-- собственного replay-lookup, поиска текущего calculation_attempt и
-- построения тела ответа ей достаточно generated-колонки -- отдельного
-- чтения property_id/tenant_request_id не требуется.
GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at, idempotency_key, command_hash
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;
```

`INSERT` не включает `evidence_dataset_revision`/`evidence_as_of`/`results`/
`failure`/`generated_at`/`created_at`: строка вставляется как `pending` (§6),
эти поля заполняются только последующим `UPDATE` в той же транзакции.
`technical_assignment_id` не может входить ни в один список — PostgreSQL не
разрешает явно указывать значение для `GENERATED ALWAYS` колонки независимо
от грантов.

**Противоречие устранено.** Предыдущая версия этого ADR выдавала
`lmapp_analysis_writer` table-wide `GRANT SELECT ON leasemind_app.analysis_snapshot`
сразу после того, как этот же раздел объявлял `analysis_snapshot` таблицей
с исключительно колоночными правами, а startup gate («Startup gates» ниже)
требовал `has_table_privilege(..., 'SELECT') = false` именно для нее — это
было внутреннее противоречие, а не осознанное исключение. `SELECT` заменён
на точный колоночный список выше; список включает `idempotency_key`/
`command_hash` (нужны роли для собственной replay/conflict-логики, в
отличие от `lmapp_api_reader`, который их не получает — см. ниже) и не
включает `property_id`/`tenant_request_id`.

`campaign_subject_link_projection` — единственное осознанное table-wide
исключение для `lmapp_analysis_writer` (сама таблица уже узкая производная
проекция без коммерческих фактов, PII или свободного текста, §3;
дополнительное колоночное сужение не добавляет защиты), выданное только как
`SELECT`, без `INSERT`/`UPDATE` (заполняет её только `lmapp_campaign_writer`,
§3).

`lmapp_campaign_writer` (существующая, расширяется) — только колонки для
launch/replay-проверки, `technical_assignment_id` включена (generated),
`property_id`/`tenant_request_id` — нет:

```
GRANT INSERT, SELECT ON leasemind_app.campaign_subject_link_projection TO lmapp_campaign_writer;

GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, scenario, source_revision, analysis_kind,
  status, campaign_id
) ON leasemind_app.analysis_snapshot TO lmapp_campaign_writer;
```

Без `INSERT`/`UPDATE` на `analysis_snapshot` — только `SELECT` для проверки
из §7 (теперь включая `scenario`). `SELECT` на `campaign_subject_link_projection`
нужен для определения `authorization_contract_version` при replay (§7) —
это **второе** сознательное table-wide исключение, по той же причине, что
выше.

`lmapp_api_reader` (существующая, расширяется) — только безопасные
response-колонки для двух Analysis GET endpoints; получает generated
`technical_assignment_id`, но не `property_id`/`tenant_request_id` (сырые FK)
и не `idempotency_key`/`command_hash`:

```
GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_api_reader;
```

**Startup gates.** Новая `verifyRuntimeAnalysisPrivileges` (для
`lmapp_analysis_writer` pool, тот же fail-closed принцип, что три
существующие функции `dbPrivilegePolicy.ts`) плюс обновление
`verifyRuntimeCommandPrivileges`/`verifyRuntimeDatabasePrivileges`. Для
каждой таблицы, на которую роль должна иметь **только** колоночные права
(`property`, `tenant_request`, `analysis_snapshot`), проверка утверждает
**три** независимых условия одновременно — одного из них недостаточно:

1. **Отсутствие table-wide granta.** `has_table_privilege(current_user,
   'leasemind_app.property', 'SELECT') = false` (аналогично для `INSERT`/
   `UPDATE` там, где применимо, и для `tenant_request`/`analysis_snapshot`).
   Это самостоятельная проверка, а не следствие проверки allowlist ниже:
   подсчёт колонок в `information_schema.column_privileges` сам по себе не
   доказывает отсутствие отдельного table-wide `GRANT` — оба вида грантов
   независимы в системном каталоге PostgreSQL, table-wide грант не обязан
   проявляться как N строк в `column_privileges`.
2. **Точный allowlist.** `has_column_privilege(...)` — `true` для каждой
   колонки из allowlist этой роли на этой таблице.
3. **Отсутствие лишних привилегий.** Запрос к
   `information_schema.column_privileges` (`grantee = current_user`) по
   каждой таблице проверяет, что число колонок с выданным `SELECT`/
   `INSERT`/`UPDATE` **равно** длине соответствующего ожидаемого allowlist —
   обнаруживая любой лишний (просочившийся) грант, который позитивные
   `has_column_privilege`-проверки сами по себе не поймали бы.

Для двух **намеренных** table-wide исключений (`campaign_subject_link_projection`
для `lmapp_analysis_writer`/`lmapp_campaign_writer`, обоснование — выше)
проверка утверждает обратное: `has_table_privilege(..., 'SELECT') = true` (и
`INSERT` — для `lmapp_campaign_writer`), поскольку здесь table-wide грант —
осознанное решение ADR, а не то, чего быть не должно.

Каждая проверка отклоняет запуск при любом лишнем или отсутствующем праве,
включая любую ошибку самой проверки — fail closed, не fail open, как во всех
существующих функциях этого файла.

**Provisioning.** Шестая фиксированная константа `ANALYSIS_WRITER_ROLE =
'lmapp_analysis_writer'` в `provisionRoles.ts`, тот же идемпотентный цикл
`CREATE ROLE`/безусловный `ALTER ROLE ... WITH LOGIN PASSWORD ...
NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`,
включённая в тот же allow-list `REVOKE CONNECT, TEMP, CREATE ON DATABASE ...
FROM PUBLIC` / точечный `GRANT CONNECT`.

### 10. Migration plan

Будущая, чисто additive миграция (файлы сейчас не создаются). Порядок
учитывает все FK-зависимости — в частности, циклическую на первый взгляд
пару `campaign_subject_link_projection.analysis_snapshot_id → analysis_snapshot`
и `analysis_snapshot.campaign_id → campaign_subject_link_projection`,
разрешённую разнесением первой (широкой, авторизационной) FK в отдельный
поздний `ALTER TABLE`:

**`008_analysis_snapshot.up.sql`:**

1. `CREATE FUNCTION leasemind_app.is_valid_metric_envelope` (§8) — не
   зависит ни от одной новой таблицы.
2. `CREATE TABLE leasemind_app.campaign_subject_link_projection` (§3) —
   включая `authorized_analysis_kind`/`authorized_analysis_status`,
   расширенный `authorization_shape` `CHECK`, `campaign_subject_link_projection_composite_unique`
   и **новый** `campaign_subject_link_projection_one_campaign_per_ta_revision`
   (§3 "Уникальность Campaign–ТЗ"); **без** FK на `analysis_snapshot` (она
   ещё не существует) — `analysis_snapshot_id`/`authorized_analysis_kind`/
   `authorized_analysis_status` пока просто nullable-колонки с локальным
   `CHECK`.
3. `CREATE TABLE leasemind_app.analysis_snapshot` (§4) — включая составной
   FK `analysis_snapshot_campaign_link_fk` на `campaign_subject_link_projection`
   (обе стороны уже существуют на этом шаге), опорный `analysis_snapshot_pre_launch_authorization_unique`,
   все `CHECK` (включая `failure`-shape и `results`-shape через уже
   существующую `is_valid_metric_envelope`), `calculation_attempt`.
4. `ALTER TABLE leasemind_app.campaign_subject_link_projection ADD CONSTRAINT
   campaign_subject_link_projection_analysis_snapshot_fk FOREIGN KEY
   (analysis_snapshot_id, scenario, technical_assignment_id, source_revision,
   authorized_analysis_kind, authorized_analysis_status) REFERENCES
   leasemind_app.analysis_snapshot (analysis_snapshot_id, scenario,
   technical_assignment_id, source_revision, analysis_kind, status)` —
   отложенная составная cross-table FK (§7 "Усиленное, постоянное
   доказательство авторизации»), теперь обе таблицы существуют.
5. `CREATE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation`
   + `BEFORE DELETE`/`BEFORE UPDATE` триггеры на `analysis_snapshot` (§4).
6. Уникальные индексы: `analysis_snapshot_idempotency_key_key`,
   `analysis_snapshot_logical_attempt_unique`,
   `analysis_snapshot_single_pending_per_logical_key` (§5), плюс
   вспомогательный индекс на `campaign_id`.
7. Backfill: явная fail-closed validation-фаза (`DO`/`RAISE EXCEPTION`), затем
   безусловный `INSERT ... SELECT` из `campaign_event_log` в
   `campaign_subject_link_projection`, `authorization_contract_version='legacy_v1'`,
   остальные authorization-поля `NULL`, выполняемый `lmapp_migrator` (§3).
8. `GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_writer;`
   `REVOKE ALL ON leasemind_app.analysis_snapshot,
   leasemind_app.campaign_subject_link_projection FROM PUBLIC`;
   `REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb),
   leasemind_app.reject_analysis_snapshot_immutable_mutation() FROM PUBLIC`;
   точечные колоночные `GRANT` трём ролям плюс два намеренных table-wide
   исключения (§9). **Без** `ALTER DEFAULT PRIVILEGES`: этот ADR намеренно
   не выдаёт `lmapp_analysis_writer` (или любой другой роли) автоматический
   доступ к будущим объектам схемы — каждая будущая таблица/функция получает
   собственный explicit review и `GRANT` в своей миграции, а не наследует
   права по умолчанию.

**Ни одна операция не изменяет схему или данные 001–007** — существующие
таблицы `property`, `tenant_request`, `campaign_event_log`,
`campaign_stream_head`, `campaign_current_state_projection` не получают ни
одной новой колонки, constraint'а или строки. Но миграция **изменяет
privilege ACL** двух из них: `property` и `tenant_request` (обе — из
migration 005) получают новый колоночный `GRANT SELECT` для
`lmapp_analysis_writer` (шаг 8 выше, §9) — это additive изменение прав
доступа, а не изменение структуры или содержимого данных, и оно полностью
отзывается в `down.sql` ниже. Чтение `campaign_event_log` мигратором-владельцем
в шаге 7 остаётся read-only и не требует нового `GRANT` (owner privilege,
§3).

**`008_analysis_snapshot.down.sql`:** детерминированный порядок, **без**
`CASCADE` — предыдущая версия допускала вариант «положиться на `CASCADE`»,
что скрывает фактический порядок отзыва от читателя миграции. Также
предыдущая версия отзывала гранты только на двух новых таблицах, оставляя
`lmapp_analysis_writer` с доступом к `property`/`tenant_request` после
отката — исправлено ниже:

1. Отозвать у `lmapp_analysis_writer` колоночный `GRANT SELECT` на
   `leasemind_app.property` и на `leasemind_app.tenant_request` (шаг 8 up.sql,
   §9) — единственные грантовые изменения этой миграции на **существующих**
   (не создаваемых ею) таблицах.
2. Отозвать у всех трёх ролей (`lmapp_analysis_writer`, `lmapp_campaign_writer`,
   `lmapp_api_reader`) все точные `GRANT`, выданные в шаге 8 up.sql на
   `leasemind_app.analysis_snapshot` и `leasemind_app.campaign_subject_link_projection`
   (`SELECT`/`INSERT`/`UPDATE`, включая два намеренных table-wide исключения
   на `campaign_subject_link_projection`).
3. `REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_analysis_writer;` —
   единственный `USAGE`, выданный этой миграцией (§9); роль сохраняется в
   кластере (provisioning — вне migration ledger, `ADR-0005`), но полностью
   теряет любой доступ к схеме после отката.
4. `REVOKE EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb),
   leasemind_app.reject_analysis_snapshot_immutable_mutation() FROM PUBLIC`
   — симметрично отменяется вместе с `DROP FUNCTION` на шагах 9–10 (сам
   `REVOKE` становится избыточным при `DROP`, но перечисляется для полноты
   симметрии).
5. `DROP TRIGGER analysis_snapshot_reject_delete ON leasemind_app.analysis_snapshot;`
   `DROP TRIGGER analysis_snapshot_reject_invalid_update ON leasemind_app.analysis_snapshot;`
6. `ALTER TABLE leasemind_app.campaign_subject_link_projection DROP CONSTRAINT
   campaign_subject_link_projection_analysis_snapshot_fk;` — явно снимает
   составную cross-table FK (шаг 4 up.sql) **до** удаления любой из двух
   таблиц; без этого шага `DROP TABLE analysis_snapshot` на шаге 7 упёрся бы
   в зависимость без `CASCADE`.
7. `DROP TABLE leasemind_app.analysis_snapshot;` — её собственная FK на
   `campaign_subject_link_projection` (`analysis_snapshot_campaign_link_fk`)
   определена **на этой же таблице**, поэтому удаляется вместе с ней без
   необходимости в `CASCADE` и без затрагивания `campaign_subject_link_projection`.
8. `DROP TABLE leasemind_app.campaign_subject_link_projection;` — к этому
   моменту на неё больше ничего не ссылается.
9. `DROP FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation();`
10. `DROP FUNCTION leasemind_app.is_valid_metric_envelope(jsonb);`

001–007 не затрагиваются ни в схеме/данных, ни в privilege ACL; полный
`down` (008 → … → 001) по-прежнему заканчивается отсутствием
`leasemind_app` schema, а `lmapp_analysis_writer` не сохраняет ни одного
объектного или схемного права, выданного migration 008; provisioning-level
`CONNECT` и сама LOGIN-роль не изменяются down-миграцией.

### 11. Вне объёма

- Расчёт или калибровка `deal_probability_30d` — доп. §9.6 (`insufficient_data`
  безусловно) остаётся в силе без изменений.
- Реализация `AS-C-021`–`AS-C-026` (пороги готовности исторических данных,
  доп. §9.8) — они остаются будущими policy gates и требуют отдельного ADR
  для реальной истории исходов, отдельного от этого решения.
- Добавление `runtime_mode` в текущие сущности (`property`, `tenant_request`,
  Campaign-таблицы) — не входит в это решение; необходимость такой колонки
  для будущей агрегации реальной истории зафиксирована как открытый вопрос
  для отдельного ADR, не решается здесь.
- Real outcome aggregation — подсчёт «созревших кампаний»/событий/несобытий
  из `campaign_event_log` не реализуется; `lmapp_analysis_writer` не
  получает и не предполагает получить доступ к `campaign_event_log`.
- Background worker/очередь — расчёт остаётся синхронным (§6); durable
  async pipeline не добавляется (но см. блокер по `AS-C-016` ниже).
- Реальные ПДн, protected reveal, платежи — не принимаются и не хранятся ни
  на одном из путей, описанных здесь.
- Matching Engine и production adapters — не меняются, не используются.
- `PRODUCTION_LAUNCH_GATE` остаётся `blocked` (`ADR-0001`, `ADR-0003`); это
  решение его не снимает и не приближает к снятию.

## Открытые PRODUCT-блокеры до Accepted

Помимо retry-семантики и совместимости с `AS-C-004` (§5), второе ревью
выявило два дополнительных обязательства, которые эта архитектура **не**
закрывает и которые должны быть явно разрешены до перевода статуса из
`Proposed` в `Accepted`.

**1. `post_launch_refresh ≤ 15 минут` (доп. §3.1, §15.3, `AS-C-016`).** Этот
ADR делает синхронный расчёт Analysis быстрым (§6) — сам вызов
`post_launch_refresh`, если он происходит, завершается в пределах одного
HTTP-запроса. Но ADR **не гарантирует**, что такой вызов вообще будет
инициирован в течение 15 минут после запуска Campaign: инициация — это
best-effort вызов с frontend, без durable scheduling, transactional outbox
или background worker (последний explicitly вне объёма, §11). Если клиент
закрыл вкладку, потерял связь или frontend не вызвал `post_launch_refresh`
вовремя — ничего в этой архитектуре не восстановит и не гарантирует срок.
**Это не значит, что `AS-C-016` закрыт этой архитектурой** — утверждение об
обратном было бы неверным и не делается нигде в этом ADR. Блокирующий
вопрос до `Accepted`: либо вводится durable-механизм (transactional outbox
или background worker — потребует пересмотра §11 «Вне объёма»), либо
PRODUCT явно смягчает/переформулирует нормативную гарантию `≤15 минут` для
synthetic-only v1 Sprint 5.

**2. Отзыв evidence dataset и `stale` (доп. §6.4).** `ANALYSIS_SNAPSHOT.md`
§6.4 определяет `stale`, среди прочего, как «доказательная выборка помечена
отозванной». Ни в этом ADR, ни где-либо в Sprint 5 не существует реестра
или механизма отзыва — `evidence_dataset_revision` вычисляется и хранится
(§4, §6), но нигде не может быть помечен как revoked, и такого понятия
(таблицы, статуса, команды) в этом решении нет. Блокирующий вопрос до
`Accepted`: либо проектируется механизм отзыва (реестр отозванных
`evidence_dataset_revision`, кто и как инициирует отзыв, как это
взаимодействует с уже terminal, неизменяемым Snapshot), либо PRODUCT явно
уточняет, что этот конкретный критерий `stale` не применяется в
synthetic-only v1 Sprint 5.

## Последствия

- После добавления роли — **шесть** application LOGIN identities
  (`lmapp_migrator`, `lmapp_maintainer`, `lmapp_api_reader`,
  `lmapp_campaign_writer`, `lmapp_ta_writer`, `lmapp_analysis_writer`) и,
  если отдельно считать bootstrap/admin-идентичность — **семь** различимых
  connection strings (`DATABASE_URL`, `LEASEMIND_MIGRATION_DATABASE_URL`,
  `LEASEMIND_MAINTENANCE_DATABASE_URL`, `LEASEMIND_COMMAND_DATABASE_URL`,
  `LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL`,
  `LEASEMIND_ANALYSIS_DATABASE_URL`, `LEASEMIND_BOOTSTRAP_DATABASE_URL`) и
  соответствующий новый пароль (`LEASEMIND_ANALYSIS_WRITER_PASSWORD`) для
  provisioning.
- `launchCampaign.ts` получает две новые операции внутри уже существующей
  транзакции — предварительную проверку (§7, шаг 3) и `INSERT` в
  `campaign_subject_link_projection` (§7, шаг 8) — в точно определённых
  позициях операционной последовательности §7; сама транзакционная граница
  (`BEGIN` … `COMMIT`/`ROLLBACK`, advisory lock, `FOR UPDATE`) и относительный
  порядок всех существующих операций не меняются.
- `dbPrivilegePolicy.ts` получает четвёртую fail-closed проверку
  (`verifyRuntimeAnalysisPrivileges`) и точечные дополнения двух
  существующих — `server.ts` получает четвёртый pool в той же
  последовательности `Runtime Safety Gate → config → DB pool(s) → DB
  Privilege Gate(s) → listen`.
- Analysis-команда потребляет ровно один `pg.PoolClient` из
  `lmapp_analysis_writer` pool на всё время выполнения (session-level lock →
  `BEGIN` → работа → `COMMIT`/`ROLLBACK` → unlock → release/destroy, всё на
  одном клиенте) — не два, как в предыдущей версии; риск удвоенного
  потребления pool и pool starvation под параллельной нагрузкой снят.
- Frontend впервые получает по-настоящему персистентный, переживающий
  reload Analysis Snapshot вместо мгновенно пересчитываемого на клиенте
  значения — recovery-сценарии доп. §15.2/§17 становятся выполнимыми без
  localStorage, включая повторные попытки после `failed` (§5, с оговоркой
  об открытом продуктовом вопросе).

## Риски реализации

- **Generated columns на `COALESCE(uuid, uuid)` по обе стороны нескольких FK**
  — использование `GENERATED ALWAYS ... STORED` колонки и как referencing, и
  как referenced стороны составных FK (§3, §4, §7) требует эмпирической
  проверки на целевом PostgreSQL 18.4 перед написанием migration 008.
- **`has_column_privilege` на generated-колонке `technical_assignment_id`**,
  предоставляемой независимо от `property_id`/`tenant_request_id` (§9) —
  должна быть проверена эмпирически: подтвердить, что PostgreSQL действительно
  разрешает читать значение generated-колонки без грантов на исходные
  колонки выражения.
- **Session-level advisory lock перед `REPEATABLE READ` на одном клиенте**
  (§6) — сам сценарий «snapshot фиксируется раньше, чем завершилось ожидание
  блокирующего первого запроса» требует эмпирического подтверждения на
  PostgreSQL 18.4, а не только теоретического обоснования; если поведение
  окажется иным, часть §6 потребует пересмотра до реализации.
- **Уничтожение клиента при неподтверждённом `pg_advisory_unlock`** (§6) —
  должно быть реализовано так, чтобы клиент физически не возвращался в
  `lmapp_analysis_writer` pool (`node-postgres`: `client.release(true)` либо
  ручное закрытие соединения) — конкретный механизм требует проверки перед
  реализацией.
- **`CASE`-порядок вычисления внутри `is_valid_metric_envelope`/`failure`-shape**
  (§4, §8) полагается на документированную гарантию PostgreSQL об
  однозначном порядке ветвей `CASE WHEN` — стоит подтвердить это поведение
  тестами, а не только чтением документации, учитывая, что для `AND`/`OR`
  аналогичной гарантии официально нет и путаница между ними — источник
  исходной ошибки этого ADR.
- **Backfill fail closed, включая явную validation-фазу** (§3) — миграция
  008 **обязана** быть атомарной (одна транзакция на всю миграцию, как
  принято для 001–007), иначе ни `DO`/`RAISE EXCEPTION`-фаза, ни
  constraint-нарушения безусловного `INSERT` не дают атомарного отката;
  необходимо подтвердить, что `migrate.ts` действительно оборачивает
  применение каждой `.up.sql`-миграции в одну транзакцию.
- **Рост сопоставимой выборки** — `REPEATABLE READ`-транзакция,
  сканирующая `property`/`tenant_request` синхронно внутри HTTP-запроса,
  предполагает сегодняшний малый объём synthetic-данных (доп. §8.2.6). Если
  выборка вырастет на порядки, синхронный путь может потребовать пересмотра
  до перехода за пределы Sprint 5 — вне объёма этого ADR, но стоит
  зафиксировать как известный предел.
- **Расхождение DB `CHECK` и runtime schema** для `results` (§8) — глубокая
  валидация конкретных метрик живёт только в приложении; без контрактных
  тестов, синхронизирующих оба слоя, они могут разойтись незаметно.
- **Продуктовая неоднозначность retry-семантики и `AS-C-004`** (§5) —
  механизм `calculation_attempt` реализуем независимо от точного
  продуктового правила «когда именно допустима новая попытка» и от решения
  по конкурентным разным `idempotency_key`, но сама ADR не может считаться
  `Accepted` до синхронизации с PRODUCT по этому вопросу.
- **Незакрытые PRODUCT-обязательства `AS-C-016` и отзыв evidence** — см.
  отдельный раздел «Открытые PRODUCT-блокеры до Accepted» выше; оба —
  блокеры перевода статуса в `Accepted`, не только «риски реализации».

## Verification plan

- Расширение `dbPrivilegeBoundary.test.ts` точным ожидаемым набором грантов
  для `lmapp_analysis_writer` и обновлённых `lmapp_campaign_writer`/
  `lmapp_api_reader`, включая: `GRANT USAGE ON SCHEMA` присутствует;
  `lmapp_analysis_writer` не имеет table-wide `SELECT` на `analysis_snapshot`
  (только точный колоночный allowlist, включая `idempotency_key`/
  `command_hash`, но **без** `property_id`/`tenant_request_id`); отрицательные
  проверки (`property_protected_address`, `campaign_event_log`,
  `campaign_stream_head`, `schema_migrations` — недоступны никому из трёх
  ролей; `idempotency_key`/`command_hash` на `analysis_snapshot` — недоступны
  именно `lmapp_api_reader` и `lmapp_campaign_writer`, но доступны
  `lmapp_analysis_writer`; `property_id`/`tenant_request_id` на
  `analysis_snapshot` — недоступны ни одной из трёх ролей; все `*_other`/
  `*_additional_requirements` колонки `property`/`tenant_request` —
  недоступны); одновременную проверку отсутствия table-wide `SELECT`/
  `INSERT`/`UPDATE` через `has_table_privilege(...) = false` **и** точного
  allowlist через `has_column_privilege`/подсчёт в
  `information_schema.column_privileges` для колоночно-ограниченных таблиц
  (`property`, `tenant_request`, `analysis_snapshot`); и подтверждение
  table-wide `SELECT`/`INSERT` там, где это осознанное единственное
  исключение (`campaign_subject_link_projection`).
- Реальное выполнение migration 008 (up/down/up) на PostgreSQL 18.4 в CI —
  не только рассуждение о её корректности, а фактический прогон.
- Тест `is_valid_metric_envelope`/`failure`-shape на `NULL` vs `FALSE`:
  отсутствующие обязательные поля (`envelope`/`failure` без одного из
  требуемых ключей), поля со значением JSON `null` там, где ожидается
  конкретный тип, `metric_status='assessed'` со scalar или array вместо
  object в `value`, неправильный/пустой/не-string `failure.code` — каждый
  случай должен детерминированно давать `FALSE` (нарушение `CHECK`), а не
  проходить как `NULL`. Отдельно — прямой вызов `SELECT
  leasemind_app.is_valid_metric_envelope(NULL)` должен вернуть `FALSE`
  (не `NULL`); `envelope` с `"metric_status": null` должен вернуть `FALSE`;
  `envelope` с `metric_status` неправильного JSON-типа (число, массив,
  boolean) должен вернуть `FALSE`.
- Тест точных JSONB-ключей без subquery: `envelope` с восемью ключами
  (лишний) или без одного из семи обязательных — отклонён; `evidence` с
  четырьмя ключами (лишний) — отклонён; `results` с пятью ключами или без
  одного из четырёх обязательных — отклонён; точные наборы — приняты.
- Тест целочисленности `sample_size`: `3.5`, `"5.0"`, отрицательное значение
  — отклонены; целое неотрицательное — принято.
- Тест составного FK (`campaign_subject_link_projection_analysis_snapshot_fk`):
  `INSERT` в `campaign_subject_link_projection` с `analysis_snapshot_id`,
  указывающим на существующий Snapshot, но с несовпадающим `scenario`/
  `technical_assignment_id`/`source_revision`/`analysis_kind`/`status` —
  отклонён; со всеми совпадающими значениями — принят; `legacy_v1` строка
  с `NULL` во всех трёх authorization-полях — принята без ошибки FK (MATCH
  SIMPLE).
- Тест уникальности Campaign–ТЗ: попытка связать второй `campaign_id` с уже
  занятым `(scenario, technical_assignment_id, source_revision)` —
  отклонена `campaign_subject_link_projection_one_campaign_per_ta_revision`.
- Тест `pending → pending`: явная попытка такого `UPDATE` — отклонена
  триггером.
- Тест `DELETE`: попытка удалить и `pending`, и terminal-строку — отклонена
  в обоих случаях.
- Тест replay: `legacy_v1` Campaign (существовавшая до migration 008)
  успешно повторяется по V1-формуле `command_hash`
  (`LEASEMIND_CAMPAIGN_LAUNCH_V1`) без `analysis_snapshot_id` в запросе;
  `analysis_v2` Campaign — по V2-формуле (`LEASEMIND_CAMPAIGN_LAUNCH_V2`),
  требующей `analysis_snapshot_id`, совпадающий с сохранённым в
  `campaign_subject_link_projection.analysis_snapshot_id`. Отдельно: replay
  `analysis_v2`-команды **без** `analysis_snapshot_id` в запросе →
  `TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED`, до вычисления хэша; replay с
  **другим** `analysis_snapshot_id` → явная проверка равенства ловит это до
  вычисления хэша и возвращает `TECHNICAL_ASSIGNMENT_REVISION_CONFLICT`
  (`LaunchIdempotencyConflictError`) — оба случая проверяются как отдельные,
  специфичные отказы, а не только опосредованно через несовпадение хэша.
  Новая команда без Snapshot (не replay) → `TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED`,
  не `INVALID_IDEMPOTENCY_KEY`.
- Тест retry: Snapshot в статусе `failed` → новая попытка с новым
  `idempotency_key` создаёт строку с `calculation_attempt = 2` и новым
  `analysis_snapshot_id`, не нарушая уникальность.
- **Будущий, пока не реализуемый тест** (заблокирован до решения PRODUCT,
  см. §5): запрос с новым `idempotency_key` для того же логического ключа
  **после** уже существующего terminal (не `failed`) Snapshot — точное
  ожидаемое поведение (новая попытка / возврат существующей строки / отказ)
  не определено этим ADR; тест должен быть написан и включён в CI только
  после того, как PRODUCT утвердит правило, а не как часть текущего DoD.
- Тест `current GET`: при нескольких `calculation_attempt` для одной
  логической команды выбирается строго последняя попытка.
- Тест отсутствия lock leak и единственного checkout: session-level advisory
  lock не остаётся удержанным на клиенте, возвращённом в pool, — сценарии
  success, explicit rollback и необработанное исключение; отдельно —
  подтверждение, что вся команда потребляет ровно один `pg.PoolClient` (без
  второго checkout) на всё время выполнения.
- Тест backfill fail closed: подготовить synthetic `campaign.subject_linked.v1`
  события с payload, не являющимся JSON object (массив, скаляр); с payload,
  содержащим не ровно пять ключей (лишний или отсутствующий); с явным
  `NULL`/некорректным полем payload; с дублирующимся `campaign_id`; с
  отсутствующей `campaign_current_state_projection` строкой; и с
  противоречивой связью — каждый случай должен провалить migration 008
  целиком (через соответствующую фазу `DO`/`RAISE EXCEPTION`), а не быть
  тихо пропущен. Отдельно — подтвердить, что фаза проверки object-формы
  (0a) действительно выполняется и останавливает миграцию **до** попытки
  вызвать `jsonb_object_length`/`?` на не-object payload (а не полагается на
  то, что PostgreSQL сам не упадёт на такой попытке).
- Интеграционный тест launch: валидный `analysis_snapshot_id` → успех;
  несовпадение `technical_assignment_id`/`scenario`/`source_revision`/
  `status` → откат всей транзакции, Campaign не создаётся (расширение
  `createCampaignCommand.test.ts`/`campaigns.test.ts`).
- Расширение `openapiContract.test.ts` на два новых Analysis-эндпоинта —
  OpenAPI и runtime schema не расходятся, включая опциональность
  `analysis_snapshot_id` на транспортной границе launch-эндпоинта.
- Автоматизация `AS-C-001`–`AS-C-020` из `ANALYSIS_SNAPSHOT.md` §18 поверх
  этой схемы на synthetic fixtures, как и зафиксировано в её собственном
  Definition of Done.
