# ADR-0009 — Analysis Snapshot: серверная synthetic-only реализация

**Дата:** 2026-08-10
**Автор:** Lead Software Architect
**Статус:** Proposed for synthetic development only
**Last updated:** 2026-08-11 (точечная корректировка пятой ревизии — §10 GUC removal и fencing, §11 VIEW security-invoker, §12/§13 grant/migration composition; см. `Контекст`)

## Контекст

`02_PRODUCT/ANALYSIS_SNAPSHOT.md` v0.3 определяет контракт Analysis Snapshot
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
остальными проверками.

**После четвёртой версии** PRODUCT утвердил Analysis Snapshot v0.3 (merged
через PR #9 в `development/sprint-5-analysis`), явно решив три вопроса,
которые ADR ранее фиксировал как открытые PRODUCT-блокеры: (1) retry и
конкурентные `idempotency_key`, включая совместимость с `AS-C-004` — §6.1
v0.3; (2) durable post-launch refresh как атомарное серверное обязательство,
зафиксированное в той же транзакции, что и launch — §11.3 v0.3; (3) отзыв
evidence dataset, приоритет `freshness_reason` и разделение публичной причины
устаревания от внутреннего audit-кода — §6.4/§12.3 v0.3. Отдельный read-only
архитектурный аудит сверил ADR построчно с v0.3 и построил gap analysis по
всем затронутым разделам. Этот документ — **пятая, архитектурная** версия,
реализующая решения PRODUCT для всех трёх ранее открытых вопросов. Статус
остаётся `Proposed for synthetic development only`: PRODUCT-решения приняты
и смёржены, но эта архитектурная редакция ещё не прошла финальный Lead
Architect review и не может считаться `Accepted` в рамках этой задачи.

## Решение

### 1. Граница решения

Это решение закрывает архитектуру synthetic-only Analysis Snapshot Sprint 5
целиком, включая три ранее открытых вопроса: хранение и идентичность
Snapshot, durable idempotency (множественные `idempotency_key`, explicit
retry), транзакции, durable post-launch refresh (атомарная фиксация
намерения, worker, at-least-once, SLA), отзыв evidence dataset и
least-privilege роли для всех перечисленных механизмов. Оно по-прежнему не
рассчитывает и не калибрует `deal_probability_30d`, не реализует пороги
готовности исторических данных (`ANALYSIS_SNAPSHOT.md` §9.8,
`AS-C-021`–`AS-C-026`) и не меняет экономику, юридические правила, Matching
Engine или `PRODUCTION_LAUNCH_GATE`.

Решение заменяет **только** frontend-only placeholder Analysis из
`ADR-0008`, раздел 1, абзац «Pre-launch Analysis не персистится отдельной
таблицей... вычисляется мгновенно на фронтенде без сетевого вызова». Все
остальные решения `ADR-0008` — схема Property/TenantRequest, idempotent save
draft, `lifecycle_status`, Contacts Gate marker, разделение DB-ролей
`lmapp_ta_writer`/`lmapp_campaign_writer`/`lmapp_api_reader`, транзакционная
граница атомарного запуска Campaign — остаются в силе без изменений; это
решение добавляет к ней новые операции и новые предварительные проверки
(§3, §8), не переставляя ни одну из уже существующих.

**PRODUCT-вопросы закрыты, не открыты.** Предыдущая версия этого ADR
содержала раздел «Открытые PRODUCT-блокеры до Accepted» и абзацы,
утверждавшие, что retry-семантика, совместимость с `AS-C-004`, durable
post-launch refresh и отзыв evidence dataset — нерешённые PRODUCT-вопросы.
Это больше не так: PRODUCT v0.3 (PR #9) даёт нормативный ответ на все
четыре темы. Раздел «Открытые PRODUCT-блокеры до Accepted» удалён из этой
версии целиком; его содержимое заменено архитектурной реализацией в §5, §6,
§10, §11 ниже. Единственная причина, по которой статус остаётся `Proposed`,
а не `Accepted` — эта архитектурная редакция (пятая версия) ещё не прошла
собственный Lead Architect review; вопрос больше не в PRODUCT.

### 2. Ссылки на Technical Assignment

`technical_assignment_id` не хранится как самостоятельная непрозрачная
(polymorphic) колонка без FK. Вместо этого каждая таблица, ссылающаяся на
Technical Assignment (`campaign_subject_link_projection`, `analysis_snapshot`,
`post_launch_refresh_intent` — в этом порядке создания, см. §13), содержит
две nullable FK-колонки и производную проекцию:

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
уникальных индексах/composite FK (§3–§5, §10) и возвращается в API-контракте
без дублирования логики между SQL и TypeScript. `COALESCE` двух `uuid`-колонок
— immutable выражение, разрешённое PostgreSQL для `GENERATED ALWAYS ...
STORED`; использование generated-колонки как стороны FK (обеих сторон —
и referencing, и referenced) требует эмпирической проверки на целевом
PostgreSQL 18.4 перед написанием миграций (часть Verification plan, см.
ниже).

Оба FK физически гарантируют, что предмет анализа существует в
`property`/`tenant_request`; `CHECK` гарантирует согласованность с
`scenario` и невозможность одновременной или нулевой ссылки.

**Таблица `analysis_snapshot_idempotency_mapping` (§5) этот паттерн не
использует** — намеренно: её логический ключ определяется не собственными
FK-колонками, а через уже существующий `analysis_snapshot_id` (см. §5),
чтобы не дублировать identity-колонки в третьей таблице.

### 3. Безопасная связь Campaign–ТЗ

Вводится узкая производная таблица `leasemind_app.campaign_subject_link_projection`
— **создаётся раньше `analysis_snapshot`** (§13), поскольку `analysis_snapshot`
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
-- и legacy replay" ниже и §8.
authorization_contract_version text NOT NULL
  CHECK (authorization_contract_version IN ('legacy_v1', 'analysis_v2')),
-- Доказательство launch-time авторизации Analysis Snapshot -- см. §8
-- "Усиленное доказательство авторизации launch" ниже. FK на analysis_snapshot
-- добавляется отдельным ALTER TABLE, см. §13 (analysis_snapshot ещё не
-- существует на этом шаге).
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
-- одного Technical Assignment.
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
constraint**, на который `analysis_snapshot` и `post_launch_refresh_intent`
ссылаются собственными составными FK (§4, §10) — связь `post_launch_refresh`
доказывается декларативно, без триггера с subquery.

`campaign_subject_link_projection_one_campaign_per_ta_revision` — DB-level
закрепление уже действующего инварианта приложения (defense in depth, не
новое продуктовое решение): `launchCampaignFromTechnicalAssignment` уже
сегодня требует `lifecycle_status = ready_for_analysis` для запуска
(`ADR-0008`) и переводит ТЗ в `campaign_started` при успехе; повторное
редактирование `campaign_started` ТЗ на месте explicitly не реализовано —
то есть один `(technical_assignment_id, revision)` структурно не может
запустить вторую Campaign при существующем коде. Этот же constraint —
причина, по которой `campaign_id` в §4/§5/§10 однозначно определяется парой
`(technical_assignment_id, source_revision)` для `post_launch_refresh`, а не
требует отдельного учёта «нескольких Campaign на одну revision».

**`authorization_contract_version` и legacy replay.** Поле различает две
исторические схемы вычисления `command_hash` launch-команды:

- `legacy_v1` — Campaign, запущенные до migration 008; `analysis_snapshot_id`,
  `authorized_analysis_kind`, `authorized_analysis_status` всегда `NULL`
  (Analysis Snapshot для них никогда не существовал и не проверялся при их
  запуске).
- `analysis_v2` — Campaign, запущенные после migration 008; все три поля
  обязательны и хранят точное доказательство использованного `pre_launch`
  Snapshot (§8 "Усиленное доказательство авторизации launch").

Подробности версионирования `command_hash` launch-команды и правило "fail
closed при отсутствующей/противоречивой связи" — §8.

**Заполнение при новом launch.** Таблица заполняется ролью
`lmapp_campaign_writer` внутри уже существующей атомарной launch-транзакции
(`launchCampaign.ts`), одним `INSERT`, использующим значения, уже вычисленные
для события `campaign.subject_linked.v1` (`entityType`, `ta.id`,
`input.technicalAssignmentId`, `input.expectedRevision`, единый `occurredAt`
— переиспользуется как `linked_at`, без нового обращения к часам), плюс
`authorization_contract_version='analysis_v2'`, переданный
`analysis_snapshot_id`, `authorized_analysis_kind='pre_launch'` и
`authorized_analysis_status` — статус проверенного Snapshot (`completed`
или `insufficient_data`, из результата launch-time проверки §8).

Порядок операций в транзакции: этот `INSERT` **обязан** идти **после**
существующего upsert `campaign_current_state_projection` и **до**
`INSERT` в `post_launch_refresh_intent` (§10) и `UPDATE lifecycle_status` —
потому что `campaign_id` в `campaign_subject_link_projection` это FK на
`campaign_current_state_projection (campaign_id)`, а PostgreSQL по
умолчанию проверяет (не-`DEFERRABLE`) FK на уровне отдельного оператора: на
момент выполнения `INSERT` в `campaign_subject_link_projection` строка в
`campaign_current_state_projection` уже должна быть зафиксирована
предыдущим оператором **этой же транзакции** — так же, как `property`/
`tenant_request` уже должны существовать до `INSERT` в
`campaign_subject_link_projection` из-за собственных FK этой таблицы (§2), и
как соответствующая строка `analysis_snapshot` уже должна существовать
(она гарантированно существует — Snapshot создаётся отдельной, более ранней
транзакцией §7, задолго до launch). Полная операционная последовательность —
§8.

**Backfill.** Migration 008 заполняет проекцию из уже существующих
`campaign.subject_linked.v1` событий в две фазы: явная fail-closed
валидация, затем безусловный `INSERT ... SELECT`, устанавливающий
`authorization_contract_version='legacy_v1'` и три authorization-поля в
`NULL` для каждой строки.

- **Migration 006 недостаточна как единственное доказательство формы.**
  `campaign_event_log_payload_subject_linked_shape_check` (migration 006,
  добавлен без `NOT VALID`) уже провалидировал форму каждой существовавшей
  строки, но PostgreSQL трактует `NULL`-результат `CHECK`-выражения как
  **разрешённый**, а не как нарушение — если бы, например,
  `payload->>'entity_type'` было SQL `NULL` (ключ физически отсутствует или
  является `JSON null`), то `(payload->>'entity_type') IN ('Property',
  'TenantRequest')` вернуло бы `NULL`, а не `FALSE`, и весь `AND`-конъюнкт
  constraint'а мог бы в принципе также свернуться в `NULL` — такая строка
  была бы **разрешена** migration 006, хотя структурно дефектна. Полагаться
  на существующий `CHECK` как на исчерпывающее доказательство non-null-формы
  исторических данных нельзя.
- **Явная fail-closed validation-фаза**, без тихой фильтрации, перед
  безусловным `INSERT`:

  ```sql
  DO $$
  DECLARE
    invalid_count bigint;
  BEGIN
    -- Фаза 0a: payload обязан быть JSON object -- проверяется первой и
    -- отдельно, останавливая миграцию до того, как любая последующая
    -- проверка вызовет jsonb_object_keys/`?` на потенциально не-object
    -- значении (jsonb_object_keys на скаляре/массиве -- ошибка
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
    -- вызывать jsonb_object_keys/`?` здесь -- фаза 0a уже гарантировала,
    -- что каждый оставшийся payload -- JSON object.
    SELECT count(*) INTO invalid_count
    FROM leasemind_app.campaign_event_log e
    WHERE e.event_type = 'campaign.subject_linked.v1'
      AND (
        leasemind_app.jsonb_object_key_count(e.payload) <> 5
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
        OR e.payload->>'entity_id' <> e.payload->>'source_technical_assignment_id'
        OR e.payload->>'source_schema_version' <> '1.0'
        OR (e.payload->>'source_revision') !~ '^[1-9][0-9]*$'
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

  Все пять проверок читают `campaign_event_log` напрямую (без фильтрующего
  `WHERE`, отбрасывающего «подозрительные» строки) и останавливают миграцию
  через `RAISE EXCEPTION`, если найдено хоть одно нарушение — а не тихо
  исключают такие строки из backfill.
- **Только после успешного прохождения всех проверок** — безусловный
  `INSERT ... SELECT` из `campaign_event_log`, без `ON CONFLICT`. Если,
  несмотря на явную предварительную валидацию, `INSERT` всё же нарушит
  `PRIMARY KEY`/`UNIQUE`/FK целевой таблицы — это тоже ошибка, откатывающая
  migration 008 целиком: ни одна строка не записывается частично.
- `lmapp_migrator` может прочитать `campaign_event_log` в рамках этой
  миграции не по новому `GRANT`, а потому что мигратор — owner объекта
  (создан им в migration 002, `ADR-0005`): PostgreSQL owner имеет привилегии
  на собственный объект без явного `GRANT`. Это одноразовая, build-time
  операция; она не открывает и не предполагает никакого нового
  runtime-доступа. `lmapp_analysis_writer`/`lmapp_analysis_worker` не
  получают и не будут получать доступ к `campaign_event_log` ни в каком
  объёме.

### 4. Схема `analysis_snapshot`

**Изменение относительно четвёртой версии.** `idempotency_key` и
`command_hash` убраны из этой таблицы целиком — идемпотентность больше не
1:1 с попыткой (это противоречило бы PRODUCT v0.3 §6.1: несколько разных
`idempotency_key` должны сходиться к одному Snapshot, а старый ключ никогда
не переназначается на более новую попытку — колонка на самой строке
Snapshot физически не может выразить это отношение). Идемпотентность
вынесена в отдельную immutable-таблицу `analysis_snapshot_idempotency_mapping`
(§5).

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

country_code              text NOT NULL CHECK (country_code = 'RU'),
currency                  text NOT NULL CHECK (currency = 'RUB'),
locale                    text NOT NULL CHECK (locale = 'ru-RU'),
area_unit                 text NOT NULL CHECK (area_unit = 'sqm'),
rent_period               text NOT NULL CHECK (rent_period = 'month'),

input_fingerprint         char(64) NOT NULL CHECK (input_fingerprint ~ '^[0-9a-f]{64}$'),
evidence_dataset_revision char(64) NULL CHECK (evidence_dataset_revision ~ '^[0-9a-f]{64}$'),
evidence_as_of            timestamptz NULL,

results                   jsonb NULL,   -- форма проверяется CHECK без subquery и без SQL NULL, см. §9
failure                   jsonb NULL,   -- безопасная форма, см. ниже

created_at                timestamptz NOT NULL DEFAULT clock_timestamp(),
generated_at              timestamptz NULL CHECK (generated_at IS NULL OR generated_at >= created_at),

CONSTRAINT analysis_snapshot_campaign_link_fk
  FOREIGN KEY (campaign_id, scenario, technical_assignment_id, source_revision)
  REFERENCES leasemind_app.campaign_subject_link_projection
    (campaign_id, scenario, technical_assignment_id, source_revision),

CONSTRAINT analysis_snapshot_pre_launch_authorization_unique
  UNIQUE (analysis_snapshot_id, scenario, technical_assignment_id, source_revision, analysis_kind, status),

CONSTRAINT analysis_snapshot_post_launch_identity_unique
  UNIQUE (analysis_snapshot_id, technical_assignment_id, source_revision, analysis_kind, campaign_id)
```

`analysis_snapshot_campaign_link_fk` доказывает, что `post_launch_refresh`
действительно связан с существующей Campaign на той же revision. MATCH
SIMPLE (поведение PostgreSQL по умолчанию для составных FK): если
`campaign_id IS NULL`, проверка FK целиком пропускается — механизм «для
`pre_launch` `campaign_id` остаётся `NULL`, поэтому composite FK не
применяется».

`analysis_snapshot_pre_launch_authorization_unique` — опорный constraint для
ОБРАТНОГО составного FK из `campaign_subject_link_projection` (§8
"Усиленное доказательство авторизации launch") — доказывает, какой именно
`pre_launch` Snapshot (по ID, scenario, ТЗ, revision, kind и terminal
status) авторизовал launch. `analysis_snapshot_id` уже PK (глобально
уникален), поэтому этот более широкий UNIQUE всегда валиден.

`analysis_snapshot_post_launch_identity_unique` — тем же способом (широкий
UNIQUE поверх уже уникального `analysis_snapshot_id`, всегда валиден) даёт
опорный constraint для составного FK
`post_launch_refresh_intent_current_snapshot_identity_fk` (§10): доказывает
не только то, что `post_launch_refresh_intent.current_analysis_snapshot_id`
ссылается на существующий Snapshot, но и то, что этот Snapshot относится к
тому же `technical_assignment_id`/`source_revision`/`analysis_kind`/
`campaign_id`, что и сам intent — простой FK по одному `analysis_snapshot_id`
такого доказательства не даёт (доп. §10, correction 4).

`failure` — точная безопасная форма, без stack trace, raw SQL, payload и без
риска вернуть SQL `NULL` из `CHECK`:

```
CONSTRAINT analysis_snapshot_failure_shape_check CHECK (
  failure IS NULL OR COALESCE(
    CASE
      WHEN jsonb_typeof(failure) <> 'object' THEN FALSE
      WHEN leasemind_app.jsonb_object_key_count(failure) <> 2 THEN FALSE
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

Соответствует PRODUCT v0.3 §7 дословно: `failure = null` для `pending`/
`completed`/`insufficient_data`; для `failed` — ровно `{code, retryable}`.
`CASE` гарантирует порядок вычисления ветвей (в отличие от плоского `AND`,
для которого PostgreSQL официально не гарантирует порядок/short-circuit) —
каждая последующая ветвь опирается на то, что предыдущая уже подтвердила
тип. Финальный `COALESCE(..., FALSE)` — дополнительный барьер на случай,
если сама ветвь `CASE` всё же вернёт `NULL`. Свободный `message` не
хранится: `message` для ответа API строится frontend/API-слоем
детерминированно из `code` (доп. §7.2), а не персистится как текст.

**DB-инварианты по статусу** (все — обычный `CHECK`, без subquery):

```
CONSTRAINT analysis_snapshot_pre_launch_no_campaign CHECK (
  analysis_kind <> 'pre_launch' OR campaign_id IS NULL
),
CONSTRAINT analysis_snapshot_post_launch_requires_campaign CHECK (
  analysis_kind <> 'post_launch_refresh' OR campaign_id IS NOT NULL
),
CONSTRAINT analysis_snapshot_generated_at_matches_status CHECK (
  (status = 'pending') = (generated_at IS NULL)
),
CONSTRAINT analysis_snapshot_completed_requires_results CHECK (
  status NOT IN ('completed', 'insufficient_data')
  OR (results IS NOT NULL AND failure IS NULL)
),
CONSTRAINT analysis_snapshot_failed_requires_failure CHECK (
  status <> 'failed' OR (failure IS NOT NULL AND results IS NULL)
),
CONSTRAINT analysis_snapshot_pending_publishes_nothing CHECK (
  status <> 'pending' OR (results IS NULL AND failure IS NULL)
)
```

**Terminal immutability** — не изменилась относительно четвёртой версии:
единая функция обрабатывает и `DELETE` (всегда запрещён), и `UPDATE`
(разрешён только как переход `pending → terminal`):

```
CREATE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IMMUTABLE: DELETE is never permitted on leasemind_app.analysis_snapshot';
  END IF;
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

Второй барьер — колоночные `GRANT` (§12): `lmapp_analysis_writer`/
`lmapp_analysis_worker` получают `UPDATE` только на `status, generated_at,
results, failure, evidence_as_of, evidence_dataset_revision` — identity-
колонки (`analysis_snapshot_id`, `property_id`, `tenant_request_id`,
`source_revision`, `scenario`, `analysis_kind`, `campaign_id`,
`calculation_attempt`) и market-колонки (`schema_version`, `method_version`,
`country_code`, `currency`, `locale`, `area_unit`, `rent_period`) и
`input_fingerprint`/`created_at` не входят ни в один `UPDATE`-грант ни у
одной роли. `DELETE`/`TRUNCATE` не выданы ни одной runtime-роли.

**Раздельная уникальность попыток — исправлено по PRODUCT v0.3 §6.1.**
Логический запрос определяется отдельно по виду анализа:

- `pre_launch`: `technical_assignment_id + source_revision + analysis_kind`,
  `campaign_id IS NULL`;
- `post_launch_refresh`: `technical_assignment_id + source_revision +
  analysis_kind + campaign_id`, `campaign_id IS NOT NULL`.

Единый 4-колоночный `UNIQUE (technical_assignment_id, source_revision,
analysis_kind, calculation_attempt)` (как в четвёртой версии) не может
просто получить пятую колонку `campaign_id`: для `pre_launch`, где
`campaign_id` всегда `NULL`, обычный `UNIQUE` не защищает уникальность,
так как PostgreSQL считает каждый `NULL` отдельным значением — два `pre_launch`
Snapshot с одинаковым `calculation_attempt` и `campaign_id=NULL` не
считались бы дублирующими друг друга. Решение — два частичных индекса,
раздельных по `analysis_kind` (тот же приём, что уже применён для
`campaign_subject_link_projection` в §3):

```
CREATE UNIQUE INDEX analysis_snapshot_pre_launch_attempt_unique
  ON leasemind_app.analysis_snapshot (technical_assignment_id, source_revision, analysis_kind, calculation_attempt)
  WHERE analysis_kind = 'pre_launch';

CREATE UNIQUE INDEX analysis_snapshot_post_launch_attempt_unique
  ON leasemind_app.analysis_snapshot (technical_assignment_id, source_revision, analysis_kind, campaign_id, calculation_attempt)
  WHERE analysis_kind = 'post_launch_refresh';
```

Та же логика — для единственной `pending`-попытки внутри полного
логического ключа:

```
CREATE UNIQUE INDEX analysis_snapshot_pre_launch_single_pending
  ON leasemind_app.analysis_snapshot (technical_assignment_id, source_revision, analysis_kind)
  WHERE analysis_kind = 'pre_launch' AND status = 'pending';

CREATE UNIQUE INDEX analysis_snapshot_post_launch_single_pending
  ON leasemind_app.analysis_snapshot (technical_assignment_id, source_revision, analysis_kind, campaign_id)
  WHERE analysis_kind = 'post_launch_refresh' AND status = 'pending';
```

**Current lookup — обязательно учитывает `campaign_id` для post-launch.**

```sql
-- pre_launch
SELECT * FROM leasemind_app.analysis_snapshot
 WHERE technical_assignment_id = $1 AND source_revision = $2 AND analysis_kind = 'pre_launch'
 ORDER BY calculation_attempt DESC LIMIT 1;

-- post_launch_refresh: campaign_id обязателен в WHERE
SELECT * FROM leasemind_app.analysis_snapshot
 WHERE technical_assignment_id = $1 AND source_revision = $2
   AND analysis_kind = 'post_launch_refresh' AND campaign_id = $3
 ORDER BY calculation_attempt DESC LIMIT 1;
```

Детерминированность гарантирована соответствующим частичным уникальным
индексом — на каждый полный логический ключ + `calculation_attempt`
существует ровно одна строка, `ORDER BY calculation_attempt DESC LIMIT 1`
не нуждается в дополнительном tie-break.

`GET /api/v1/technical-assignments/{technical_assignment_id}/analysis-snapshots/current`
(доп. §11.2) принимает `campaign_id` как query-параметр: **обязательный**,
когда `analysis_kind=post_launch_refresh`, и **запрещённый** (должен
отсутствовать), когда `analysis_kind=pre_launch`. Нарушение — `400
ANALYSIS_KIND_INVALID` (доп. §12.1, «Нарушена связь kind/Campaign» —
переиспользуется буквально этот существующий код, новый не изобретается).

### 5. Immutable idempotency mapping

PRODUCT v0.3 §6.1 требует: несколько разных `idempotency_key` могут
сходиться к одному Snapshot; старый ключ **никогда** не переназначается на
более новую попытку; платформа обязана долговременно и атомарно хранить
сопоставление каждого принятого ключа. Колонка на самой строке
`analysis_snapshot` (четвёртая версия) физически не может выразить
отношение «много ключей → одна попытка» с устойчивой привязкой во времени.
Решение — отдельная append-only таблица.

```
CREATE TABLE leasemind_app.analysis_snapshot_idempotency_mapping (
  idempotency_key                text PRIMARY KEY
    CHECK (length(idempotency_key) > 0 AND length(idempotency_key) <= 200),
  command_hash                   char(64) NOT NULL
    CHECK (command_hash ~ '^[0-9a-f]{64}$'),

  analysis_snapshot_id           uuid NOT NULL
    REFERENCES leasemind_app.analysis_snapshot (analysis_snapshot_id),
  retry_of_analysis_snapshot_id  uuid NULL
    REFERENCES leasemind_app.analysis_snapshot (analysis_snapshot_id),

  accepted_at                    timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT analysis_snapshot_idempotency_mapping_retry_not_self CHECK (
    retry_of_analysis_snapshot_id IS NULL OR retry_of_analysis_snapshot_id <> analysis_snapshot_id
  )
);
```

**Намеренно не дублирует** `property_id`/`tenant_request_id`/
`technical_assignment_id`/`scenario`/`source_revision`/`analysis_kind`/
`campaign_id`. Логический запрос этой команды определяется не колонками
этой таблицы, а через `analysis_snapshot_id` (JOIN на `analysis_snapshot`,
у которой все эти колонки уже есть) — хранить их здесь ещё раз означало бы
риск рассинхронизации между двумя копиями одного и того же факта. Сама
normalized command защищена не денормализованными колонками, а
`command_hash` (ниже); retry-target хранится отдельно
(`retry_of_analysis_snapshot_id`), в том числе как явный `NULL` — это тоже
значение normalized command, а не отсутствие поля.

**Никаких `ON DELETE CASCADE`** ни на одном из двух FK — оба используют
поведение PostgreSQL по умолчанию (`NO ACTION`): удаление строки
`analysis_snapshot` (которое в любом случае невозможно, §4 запрещает
`DELETE`) никогда не должно молча утаскивать за собой запись о том, что
конкретный `idempotency_key` был принят — это стёрло бы саму историю
идемпотентности.

**Domain-separated `command_hash` v2** — вычисляется приложением, не в БД
(колонка только хранит и проверяет форму):

```text
command_hash = sha256Hex(
  "LEASEMIND_ANALYSIS_SNAPSHOT_COMMAND_V2|" +
  technical_assignment_id + "|" +
  source_revision + "|" +
  analysis_kind + "|" +
  (campaign_id ?? "") + "|" +
  (retry_of_analysis_snapshot_id ?? "")
)
```

`idempotency_key` **не входит** в хэш — это намеренно: хэш защищает
*нормализованную команду* (логический запрос + retry-target), а не связку
"конкретный ключ + команда"; один и тот же `command_hash` у двух разных
`idempotency_key` — это ровно тот легитимный случай "разные ключи сходятся
к одной попытке" (§6), а не аномалия. Это отдельная, новая V2-формула,
заменяющая V1-формулу `LEASEMIND_ANALYSIS_SNAPSHOT_V1|COMMAND|...` из
четвёртой версии ADR (которая жила как колонка на `analysis_snapshot` и
включала `method_version`, но не `retry_of_analysis_snapshot_id` — этой
командной идентичности PRODUCT v0.3 ещё не требовал).

**Immutability** — строже, чем у `analysis_snapshot`: у этой таблицы вообще
нет легитимного `UPDATE` (в отличие от одноразового `pending → terminal`
перехода) — она чисто append-only, как `campaign_event_log`:

```
CREATE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ANALYSIS_SNAPSHOT_IDEMPOTENCY_MAPPING_IMMUTABLE: % is not permitted on leasemind_app.analysis_snapshot_idempotency_mapping', TG_OP;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation() FROM PUBLIC;

CREATE TRIGGER analysis_snapshot_idempotency_mapping_reject_update
  BEFORE UPDATE ON leasemind_app.analysis_snapshot_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation();

CREATE TRIGGER analysis_snapshot_idempotency_mapping_reject_delete
  BEFORE DELETE ON leasemind_app.analysis_snapshot_idempotency_mapping
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation();
```

Это одновременно и есть DB-level гарантия «mapping одного ключа никогда не
изменяется и не переназначается»: раз строка `idempotency_key →
analysis_snapshot_id` физически не может быть ни изменена, ни удалена,
replay этого ключа годы спустя — даже после десятков новых `calculation_attempt`
для того же логического запроса — всегда вернёт ровно ту `analysis_snapshot_id`,
что была записана при первом принятии ключа.

### 6. Idempotency, lock flow и retry

Простой fast path без повторной проверки после захвата lock недостаточен
(классическая TOCTOU-гонка: два конкурирующих новых ключа могли бы оба
пройти проверку «ключ не найден» до того, как любой из них закоммитился).
Порядок обработки команды строго фиксирован.

**Ключ уже известен (fast path, без lock).**

1. До какого-либо lock выполняется один plain `SELECT idempotency_key,
   command_hash, analysis_snapshot_id FROM analysis_snapshot_idempotency_mapping
   WHERE idempotency_key = $1` — безопасно без lock, потому что таблица
   append-only: если строка вообще видна этой транзакции, она уже
   закоммичена и никогда не изменится.
2. Если mapping найден:
   - пересчитанный `command_hash` совпадает с сохранённым → `200` и
     Snapshot, на который **изначально** указывал этот ключ (не текущая
     попытка логического запроса — именно тот `analysis_snapshot_id` из
     найденной строки);
   - не совпадает → `409 ANALYSIS_IDEMPOTENCY_CONFLICT`, без записи.
3. Если mapping не найден — переход к следующему разделу.

**Ключ не найден.**

1. На **одном** выделенном `pg.PoolClient` (тот же принцип «один клиент на
   всю команду», что уже установлен для транзакций §7), в режиме autocommit,
   до какого-либо `BEGIN`, берётся **session-level** advisory lock по
   scope `analysis-snapshot:idempotency-key:${idempotencyKey}`.
2. Сразу после получения этого lock, **всё ещё до `BEGIN`**, в
   autocommit/READ COMMITTED повторно читается mapping по тому же
   `idempotency_key`. Если он **появился**, пока команда ждала lock
   (конкурент успел его вставить и закоммититься первым) — обрабатывается
   ровно как fast path выше (hash совпал → `200` replay; не совпал → `409
   ANALYSIS_IDEMPOTENCY_CONFLICT`) — locical-key lock (шаг 3) в этом случае
   не берётся вообще.
3. Если mapping всё ещё отсутствует — берётся **второй** session-level
   advisory lock, scope `technical-assignment:id:${technicalAssignmentId}`
   — тот же lock-key/namespace, что уже использует `lockCommandScopes`
   (`technicalAssignment.ts`), сохраняя интерлок с TA-save, введённый в
   третьей версии ADR (revision не может измениться, пока идёт расчёт
   Snapshot). Эта блокировка играет роль «logical-key lock»: поскольку
   `campaign_subject_link_projection_one_campaign_per_ta_revision` (§3)
   гарантирует не более одной Campaign на `(technical_assignment_id,
   source_revision)`, `campaign_id` для `post_launch_refresh` не может
   изменяться независимо от `technical_assignment_id` — блокировки по
   одному лишь `technical_assignment_id` достаточно, чтобы серилизовать
   **все** команды (и `pre_launch`, и `post_launch_refresh`, для любого
   `campaign_id`) на этот ТЗ; более тонкая гранулярность не нужна и не
   вводится, чтобы не создавать новую поверхность для deadlock.
4. Только после того как **оба** lock реально получены, на этом же клиенте
   начинается `BEGIN ISOLATION LEVEL REPEATABLE READ` — snapshot этой
   транзакции гарантированно устанавливается после любого конкурирующего
   commit, ожидавшего оба lock (тот же принцип, что уже обоснован в §7 для
   единственного lock в предыдущих версиях, теперь — для обоих).
5. Читается current attempt — максимальный `calculation_attempt` для
   полного логического ключа (§4 "Current lookup").
6. Принимается одно из трёх решений:
   - **Первая попытка** (current attempt отсутствует) — `INSERT` новой
     строки `analysis_snapshot`, `calculation_attempt = 1`.
   - **Retry** — `retry_of_analysis_snapshot_id` передан и current attempt
     находится в состоянии `failed` с `failure.retryable = true`, а
     `retry_of_analysis_snapshot_id` совпадает с `analysis_snapshot_id`
     текущей попытки — `INSERT` новой строки, `calculation_attempt =
     current + 1`.
   - **Схождение** — `retry_of_analysis_snapshot_id IS NULL` и current
     attempt в состоянии `pending`/`completed`/`insufficient_data` — новая
     строка `analysis_snapshot` **не создаётся**; используется
     `analysis_snapshot_id` текущей попытки.
   - Во всех остальных комбинациях — отказ без записи (см. таблицу кодов
     ниже), включая `ROLLBACK` и освобождение locks в порядке шага 10.
7. **В той же транзакции**, последним содержательным `INSERT`, пишется
   immutable mapping (§5): `idempotency_key`, вычисленный `command_hash`,
   выбранный `analysis_snapshot_id`, `retry_of_analysis_snapshot_id` как
   передан клиентом (включая явный `NULL`).
8. `COMMIT`.
9. Оба session-level lock освобождаются **в обратном порядке** относительно
   захвата: сначала `technical-assignment:id:...` (взят вторым — освобождён
   первым), затем `analysis-snapshot:idempotency-key:...` (взят первым —
   освобождён последним).
10. При любой неопределённости с подтверждением освобождения любого из двух
    lock (сетевая ошибка, `pg_advisory_unlock` вернул `false`, исключение
    при вызове) — клиент **уничтожается**, а не возвращается в pool: то же
    правило, что уже установлено в третьей версии для единственного lock,
    теперь применяется к обоим.

**Шаги 1–10 выше — только «команда»: они решают, какая попытка это логически
(первая/retry/схождение), и atomically создают либо находят строку
`analysis_snapshot`. Они никогда сами не выполняют и не возобновляют
расчёт.** Fast path (шаги 1–2) — чистый replay: возвращает уже сохранённый
`analysis_snapshot_id`, не трогая его содержимое. Путь «схождение» (шаг 6,
третий пункт) — тоже не более чем чтение существующей строки. Если строка,
к которой сошлась или которую создала команда, всё ещё `pending`, её обязан
выполнить отдельный, явно описанный ниже **execution flow** — команда и
исполнение разделены намеренно (correction 2 пятой ревизии), чтобы не
путать «мы вернули существующее состояние» с «мы посчитали это состояние
заново».

**Execution flow — выполнение конкретной `pending`-строки `analysis_snapshot`.**
Идемпотентен по построению: может быть вызван многократно для одного и того
же `analysis_snapshot_id` (в том числе конкурентно) без риска двойного
списания эффекта или дублирования попытки.

1. Session-level advisory lock, отдельный scope `analysis-snapshot:execution:${analysisSnapshotId}`
   — не переиспользует ни `idempotency-key`-lock, ни `technical-assignment:id:...`-lock
   команды: это защита самого исполнения одной конкретной попытки, а не
   логического запроса или ключа идемпотентности (§10 "Fencing и execution
   lock — две разные гарантии" поясняет разницу с fencing worker'а).
2. `BEGIN ISOLATION LEVEL REPEATABLE READ` (тот же принцип §7: lock — до
   `BEGIN`, в autocommit).
3. `SELECT * FROM leasemind_app.analysis_snapshot WHERE analysis_snapshot_id = $1 FOR UPDATE`.
4. Если `status <> 'pending'` — попытка уже terminal (кто-то другой её
   выполнил, пока мы ждали lock, либо это повторный вызов после уже
   успешного выполнения) — `COMMIT` без единого изменения, no-op.
5. Если `status = 'pending'` — выполняется расчёт (§7: `evidence_as_of`,
   `evidence_dataset_revision`, метрики, включая повторную проверку отзыва
   evidence непосредственно перед terminal `UPDATE`, §7 "Двойная проверка
   отзыва evidence") и ровно один `UPDATE` строки в terminal
   `completed`/`insufficient_data`/`failed` — единственный разрешённый
   переход (§4 trigger).
6. `COMMIT`.
7. Освобождение execution lock; при неподтверждённом unlock — уничтожение
   клиента (тот же принцип, что и для двух lock команды, шаг 10 выше).

Крах между командой (шаги 1–10 выше) и первым вызовом execution flow, либо
крах внутри шагов 2–6 execution flow, никогда не создаёт новый
`calculation_attempt`: следующий вызов адресуется к тому же
`analysis_snapshot_id` (для `post_launch_refresh` — найденному тем же
детерминированным `idempotency_key`, §10) и на шаге 3 просто перечитывает
всё ещё `pending` строку. В Sprint 5 `synthetic_ru_v1` не имеет
промежуточного состояния расчёта — «продолжить» и «пересчитать с нуля»
неразличимы и детерминированно дают идентичный результат при одинаковом
`evidence_as_of`/`evidence_dataset_revision» (§7).

**`pre_launch` — команда и execution flow остаются одной физической
транзакцией.** Единственный синхронный HTTP-путь (§7): logical-key lock
команды уже эксклюзивно удерживает весь путь от создания `pending`-строки
до её terminal-завершения на всё время запроса, поэтому отдельный
execution lock для `pre_launch` не требуется и не берётся — шаги 4–7 §7
(создание `pending` и переход в terminal) физически выполняются как шаги
2–6 execution flow **внутри той же** `REPEATABLE READ`-транзакции, что и
шаги 4–7 команды §6. Ответ `201` возвращается синхронно, как и раньше.

**`post_launch_refresh` — команда и execution flow отдельные обращения, и
команда выполняется не на каждом claim.** Инициирующий вызов worker'а —
команда (шаги 1–10 выше) — создаёт либо находит строку и коммитит
независимо: если результат `pending`, HTTP/RPC-семантика этого шага —
`202` (доп. §10 "Worker claim и execution"); worker, всё ещё удерживая
claim на intent, отдельно и сразу вызывает execution flow для полученного
`analysis_snapshot_id`. Команда вызывается **только** пока
`post_launch_refresh_intent.current_analysis_snapshot_id IS NULL`
(попытка 1 ещё не финализирована); после explicit retry claim возвращает
уже конкретный `analysis_snapshot_id` новой попытки, и worker переходит
сразу к execution flow, минуя команду — точная ветвящаяся логика и её
обоснование (почему детерминированный server-derived ключ команды нельзя
переиспользовать после retry) описаны в §10 "Server-derived key
используется только для попытки 1". Крах между командой и execution flow
не создаёт нового `calculation_attempt` — следующий claim того же intent
(§10) находит тот же `pending` `analysis_snapshot_id` (через тот же
детерминированный ключ для попытки 1, либо напрямую через
`current_analysis_snapshot_id` для попытки после retry) и просто
продолжает его execution flow.

**Почему именно такой порядок захвата предотвращает deadlock.** Два разных
`idempotency_key`, конкурирующие за один и тот же логический запрос
(разные ключи — `AS-C-004`), оба идут по пути "idempotency-key lock →
logical-key lock": первый получает *свой* idempotency-key lock (два разных
ключа — два разных lock, никакого конфликта на этом шаге), затем оба
пытаются получить *один и тот же* logical-key lock — здесь они естественно
сериализуются, но круговое ожидание невозможно, так как ни одна из команд
никогда не ждёт чужой idempotency-key lock. Один и тот же `idempotency_key`,
ошибочно или намеренно переданный для **разных** логических запросов
одновременно, естественно сериализуется на *том же* idempotency-key lock
(шаг 1) ещё до того, как логический lock вообще потребуется — вторая из
двух команд, получив lock после первой, увидит на шаге 2 уже вставленный
mapping и корректно завершится как `200` replay (если нормализованная
команда совпала) либо `409 ANALYSIS_IDEMPOTENCY_CONFLICT` (если нет), не
доходя до шага 3 вовсе. Правило «сначала idempotency-key lock, потом
logical-key lock» соблюдается **всегда**, без исключений — именно
фиксированный порядок захвата (а не сами по себе два lock) исключает
циклическое ожидание.

**HTTP-коды.**

| Исход | Код |
| --- | --- |
| Новая попытка (первая либо retry), синхронно завершившаяся terminal | `201` |
| Новая попытка, оставшаяся `pending` | `202` |
| Replay известного ключа (fast path или после ожидания lock) | `200` |
| Схождение нового ключа к существующей `pending`/`completed`/`insufficient_data` | `200` |
| Тот же ключ, другая нормализованная команда | `409 ANALYSIS_IDEMPOTENCY_CONFLICT` |
| Current attempt не в `failed`+`retryable=true` (в том числе: `retry_of_analysis_snapshot_id` передан, а current attempt уже не тот failed, что был исходно) | `409 ANALYSIS_RETRY_NOT_ALLOWED` |
| Current attempt `failed`+`retryable=true`, но `retry_of_analysis_snapshot_id` не передан или не совпадает с ним | `409 ANALYSIS_RETRY_TARGET_MISMATCH` |

**Две конкурентные retry-команды с разными новыми ключами** (обе целятся в
один и тот же `failed`-attempt как `retry_of_analysis_snapshot_id`):
первая, получившая оба lock первой, проходит проверку (current attempt
действительно `failed`+`retryable=true`, ID совпадает) и создаёт новую
попытку (`calculation_attempt + 1`), вставляет свой mapping, коммитит,
освобождает locks. Вторая, получив logical-key lock только после этого,
на шаге 5 читает **уже новый** current attempt — он не `failed` (это новая
попытка, только что созданная первой командой) — проверка «current attempt
в состоянии `failed`+`retryable=true`» проваливается **до** проверки
совпадения ID, поэтому вторая команда получает именно
`ANALYSIS_RETRY_NOT_ALLOWED`, а не `ANALYSIS_RETRY_TARGET_MISMATCH` (её
`retry_of_analysis_snapshot_id` технически совпадал бы со *старым* failed
ID, но этот ID больше не текущий). Mapping для отклонённого ключа **не
создаётся** — `ROLLBACK` до `INSERT` в §5.

### 7. Транзакции и evidence

Транзакционная механика (один `pg.PoolClient` на всю команду, два
session-level lock в фиксированном порядке, `BEGIN ISOLATION LEVEL
REPEATABLE READ` только после обоих lock, unlock в обратном порядке,
уничтожение клиента при неподтверждённом unlock) полностью описана в §6 —
этот раздел не повторяет её, а фиксирует, что именно происходит **внутри**
уже открытой `REPEATABLE READ`-транзакции (шаги 4–7 §6):

- `evidence_as_of = transaction_timestamp()` этой согласованной транзакции
  — единая точка отсчёта для всего расчёта.
- `evidence_dataset_revision` вычисляется как SHA-256 отсортированного
  набора `(entity_type, entity_id, revision, updated_at)`, увиденного этой
  же транзакцией под `REPEATABLE READ` (доп. §7.1). Списки исходных
  `entity_id` не сохраняются нигде за пределами момента хэширования —
  только их агрегированный хэш попадает в строку.
- Для `synthetic_ru_v1` расчёт выполняется синхронно: для `pre_launch` —
  внутри той же транзакции, что и команда §6 (переход `pending → terminal`,
  §4, без отдельного execution lock — обосновано в §6 "Execution flow");
  для `post_launch_refresh` — внутри отдельного, повторно вызываемого
  execution flow (§6), адресуемого тем же детерминированным
  `idempotency_key` (§10) на каждом claim. Ни один из двух путей не
  представляет собой «fast path сам возобновляет расчёт» — fast path (§6,
  шаги 1–2) только читает; расчёт всегда выполняет отдельно описанный
  execution flow.
- **Двойная проверка отзыва evidence — точный порядок внутри execution
  flow (§6, шаг 5).** Проверка candidate-хэша до его вычисления физически
  невозможна — порядок операций строго такой:
  1. Читается согласованный (под `REPEATABLE READ`) набор источников
     (`property`/`tenant_request`/связанные сущности), как и раньше.
  2. Из этого набора вычисляется candidate `evidence_dataset_revision`
     (SHA-256, доп. §7.1) — она уже полностью определена на этом шаге, но
     ещё не записана ни в одну колонку.
  3. **До** расчёта метрик (`price_adequacy`/`competition`/
     `deal_probability_30d`/`candidate_categories`) выполняется первая
     проверка: `SELECT 1 FROM leasemind_app.evidence_dataset_revocation
     WHERE evidence_dataset_revision = $candidate` — расчёт метрик не
     запускается вовсе, если candidate уже отозвана.
  4. Метрики вычисляются (если первая проверка не нашла отзыва).
  5. **Повторно**, непосредственно перед terminal `UPDATE`, та же проверка
     выполняется снова для того же `$candidate` (не пересчитывается — тот
     же самый хэш, полученный на шаге 2, проверяется дважды двумя
     отдельными `SELECT`).
  Если вычисленная `evidence_dataset_revision` уже отозвана (на любой из
  двух проверок) — Snapshot не публикуется как
  `completed`/`insufficient_data`: `UPDATE` вместо этого переводит строку в
  terminal `failed` с безопасной формой `{code:
  'ANALYSIS_DATASET_UNAVAILABLE', retryable: true}` (существующий код §4/§12.1
  PRODUCT-контракта — новый код не изобретается), без раскрытия
  `evidence_revocation_reason_code` пользователю ни в каком виде. Честная
  граница этой защиты: обе проверки выполняются внутри одной
  `REPEATABLE READ`-транзакции и используют один и тот же зафиксированный на
  `BEGIN` snapshot данных — они защищают от гонки «revocation, случившейся
  до нашего `BEGIN`, но ещё не учтённой первым чтением источников», а не от
  revocation, вставленной конкурентно **после** нашего `BEGIN` (такую
  `REPEATABLE READ`-транзакция структурно не может увидеть, независимо от
  того, сколько раз повторить запрос). Эта остаточная гонка закрывается не
  атомарно, а post-hoc: launch-time check (§8) и `analysis_snapshot_freshness_projection`
  (§11) читают `evidence_dataset_revocation` при каждом следующем обращении
  вне этой транзакции и корректно покажут `stale`/`evidence_revoked` для
  уже опубликованного terminal Snapshot, даже если сам terminal-`UPDATE` не
  мог этого предотвратить в момент своего `COMMIT`.
- `freshness_status`/`freshness_reason` **не хранятся**: вычисляются при
  чтении единым read-time helper'ом (§11 "Freshness projection"), без
  каких-либо `UPDATE` terminal-строки.

**Почему lock должен быть session-level, а не `pg_advisory_xact_lock` внутри
`REPEATABLE READ`.** `pg_advisory_xact_lock(...)` как первый оператор уже
внутри `BEGIN ISOLATION LEVEL REPEATABLE READ` не гарантирует, что MVCC
snapshot транзакции будет установлен **после** того, как lock реально
получен — PostgreSQL фиксирует snapshot `REPEATABLE READ`-транзакции в
момент выполнения её первого запроса, а не в момент, когда этот запрос
успешно завершился, если он блокировался в ожидании lock. Если конкурентная
транзакция удерживает тот же lock и коммитит новые данные **пока** наш
`pg_advisory_xact_lock` ещё ждёт своей очереди — наш snapshot может
оказаться зафиксирован раньше этого commit, и мы прочитаем устаревшие
данные, несмотря на успешно дождавшийся lock. Оба lock §6 берутся строго
**до** `BEGIN` в autocommit-режиме — вопрос о преждевременно
зафиксированном snapshot для них структурно не возникает. Это поведение
требует эмпирической проверки на PostgreSQL 18.4 (Verification plan).

### 8. Launch-time check и авторизация

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

**Версионирование `command_hash` launch-команды — два разных domain
separator, не «V1 плюс поле».** Использование одного и того же domain
separator для V1 и V2 с опциональным довеском создавало бы риск
неоднозначности между «V1 без поля» и «V2 с пустым полем». Вместо этого —
два самостоятельных, различающихся domain separator (не путать с
`command_hash` из §5 — это отдельный хэш launch-команды, живущий в
`campaign_event_log`, а не в `analysis_snapshot_idempotency_mapping`):

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
совпадением хэша.** Сервер выполняет строго упорядоченную проверку:

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
     `TECHNICAL_ASSIGNMENT_REVISION_CONFLICT`);
   - только после того, как оба явных условия выше пройдены, сервер
     вычисляет V2 `command_hash` и сравнивает его с сохранённым в
     `campaign_event_log` — финальное, а не единственное, подтверждение.

**Launch-time проверка для новой (не replay) команды.** После проверки
Contacts Gate и лока текущей `revision` ТЗ (`SELECT ... FOR UPDATE`, уже
существующий шаг), но до вставки событий, `lmapp_campaign_writer` проверяет
переданный `analysis_snapshot_id`, сравнивая **также `scenario`**, а не
только UUID и revision, и **дополнительно проверяет, что
`evidence_dataset_revision` этого Snapshot не отозвана** (новое условие
относительно четвёртой версии — реализует PRODUCT v0.3 §6.4 «такой Snapshot
не разрешает запуск Campaign»):

```
SELECT status FROM leasemind_app.analysis_snapshot s
 WHERE s.analysis_snapshot_id = $1
   AND s.analysis_kind = 'pre_launch'
   AND s.scenario = $2                                 -- ta.scenario, уже известный из лока ТЗ
   AND s.technical_assignment_id = $3                  -- ta.id, уже заблокированный
   AND s.source_revision = $4                          -- уже заблокированный ta.revision
   AND s.status IN ('completed', 'insufficient_data')
   AND (
     s.evidence_dataset_revision IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM leasemind_app.evidence_dataset_revocation r
        WHERE r.evidence_dataset_revision = s.evidence_dataset_revision
     )
   )
```

Поскольку `source_revision` в запросе — это только что заблокированная
текущая `revision` ТЗ, положительный результат этого `SELECT` доказывает и
«Snapshot current для заблокированной строки ТЗ» по revision, и «evidence
этого Snapshot не отозвана» — оба необходимых условия актуальности (§11)
проверяются в одном запросе, без отдельного вычисления полного
`freshness_status`. Любое несовпадение откатывает всю launch-транзакцию
целиком. `lmapp_campaign_writer` получает для этого точечный `SELECT
(evidence_dataset_revision)` на `evidence_dataset_revocation` (§12, §14).

**Усиленное, постоянное доказательство авторизации.** Runtime-проверка
выше — проверка **в момент** launch. Отдельно от неё, permanent DB-level
доказательство того, что именно этот `pre_launch` Snapshot когда-либо
авторизовал именно эту Campaign, фиксируется составным FK
`campaign_subject_link_projection_analysis_snapshot_fk`, добавляемым в §13:

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
`authorized_analysis_kind` жёстко ограничен `CHECK (... = 'pre_launch')`
(§3), поэтому FK эффективно принуждает `analysis_snapshot.analysis_kind`
референсной строки быть именно `'pre_launch'`. Для `legacy_v1` все три
authorization-поля — `NULL`, и MATCH SIMPLE пропускает проверку FK целиком
— legacy-строки остаются валидными без доказательства.

**Полная операционная последовательность** (существующие операции
`ADR-0008`/`launchCampaign.ts` не переставляются; новые отмечены **[NEW]**):

1. `SELECT ... FOR UPDATE` строки Property/TenantRequest.
2. Проверка `lifecycle_status`, `revision`, Contacts Gate evidence.
3. **[NEW]** Launch-time Analysis check (выше, включая проверку отзыва
   evidence) — до вставки каких-либо событий.
4. `INSERT` события `campaign.subject_linked.v1` (sequence N).
5. `INSERT` события `campaign.status_recorded.v1`, `status=Created`
   (sequence N+1) — порядок двух событий не меняется.
6. `UPDATE campaign_stream_head`.
7. Upsert `campaign_current_state_projection`.
8. **[NEW]** `INSERT` в `campaign_subject_link_projection`
   (`authorization_contract_version='analysis_v2'`, переданный
   `analysis_snapshot_id`, `authorized_analysis_kind='pre_launch'`,
   `authorized_analysis_status` = статус из шага 3) — строго после шага 7
   (FK-зависимость, §3).
9. **[NEW]** `INSERT` в `post_launch_refresh_intent` (§10) — durable
   намерение выполнить `post_launch_refresh`; строго после шага 8
   (FK-зависимость на `campaign_subject_link_projection`, §10).
10. `UPDATE Property/TenantRequest SET lifecycle_status='campaign_started'`.
11. `COMMIT`.

Любая ошибка на любом шаге — `ROLLBACK` всей транзакции целиком, включая
все три новых шага.

### 9. JSONB validation

Не изменилась относительно четвёртой версии — PRODUCT v0.3 не меняет форму
`results`/metric envelope. PostgreSQL не разрешает subquery внутри
`CHECK`-constraint и трактует `NULL`-результат `CHECK`-выражения как
**допустимый** (не как нарушение); функция построена так, чтобы **всегда**
возвращать строго `TRUE` или `FALSE`, через `CASE` (гарантированный порядок
вычисления ветвей, в отличие от `AND`) и финальный `COALESCE(..., FALSE)`:

```
CREATE FUNCTION leasemind_app.jsonb_object_key_count(value jsonb) RETURNS integer AS $$
  SELECT count(*)::integer FROM jsonb_object_keys(value);
$$ LANGUAGE sql IMMUTABLE STRICT;

REVOKE EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb) FROM PUBLIC;

CREATE FUNCTION leasemind_app.is_valid_metric_envelope(envelope jsonb) RETURNS boolean AS $$
  SELECT COALESCE(
    CASE
      WHEN envelope IS NULL THEN FALSE
      WHEN jsonb_typeof(envelope) <> 'object' THEN FALSE
      WHEN leasemind_app.jsonb_object_key_count(envelope) <> 7 THEN FALSE
      WHEN NOT (
        envelope ? 'metric_status' AND envelope ? 'confidence' AND envelope ? 'value'
        AND envelope ? 'sample_size' AND envelope ? 'evidence'
        AND envelope ? 'reason_codes' AND envelope ? 'assumptions'
      ) THEN FALSE
      WHEN jsonb_typeof(envelope->'metric_status') IS DISTINCT FROM 'string' THEN FALSE
      WHEN (envelope->>'metric_status') NOT IN ('assessed', 'insufficient_data') THEN FALSE
      WHEN NOT (
        (envelope->'confidence') = 'null'::jsonb OR (envelope->>'confidence') IN ('low', 'medium', 'high')
      ) THEN FALSE
      WHEN (envelope->>'metric_status') = 'assessed' AND jsonb_typeof(envelope->'value') <> 'object' THEN FALSE
      WHEN (envelope->>'metric_status') = 'insufficient_data' AND (envelope->'value') <> 'null'::jsonb THEN FALSE
      WHEN (envelope->>'metric_status') = 'insufficient_data' AND (envelope->'confidence') <> 'null'::jsonb THEN FALSE
      WHEN jsonb_typeof(envelope->'sample_size') <> 'number' THEN FALSE
      WHEN (envelope->>'sample_size') !~ '^(0|[1-9][0-9]*)$' THEN FALSE
      WHEN jsonb_typeof(envelope->'evidence') <> 'object' THEN FALSE
      WHEN leasemind_app.jsonb_object_key_count(envelope->'evidence') <> 3 THEN FALSE
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
    AND leasemind_app.jsonb_object_key_count(results) = 4
    AND leasemind_app.is_valid_metric_envelope(results->'price_adequacy')
    AND leasemind_app.is_valid_metric_envelope(results->'competition')
    AND leasemind_app.is_valid_metric_envelope(results->'deal_probability_30d')
    AND leasemind_app.is_valid_metric_envelope(results->'candidate_categories')
  )
);
```

`CASE ... WHEN` в PostgreSQL гарантированно вычисляет ветви по порядку и
останавливается на первой истинной — каждая risky операция защищена более
ранней веткой, уже подтвердившей тип. Каждый из семи ключей верхнего уровня
`envelope` проверяется на присутствие через `?` **и** через
`jsonb_object_key_count(envelope) = 7`, доказывая точный набор без единого
subquery. `value` при `metric_status='assessed'` обязан быть JSON object;
при `metric_status='insufficient_data'` обязан быть буквально JSON `null`.
`sample_size` проверяется как целое неотрицательное число через
`jsonb_typeof(...) = 'number'` **и** regex-проверку текстового
представления. DB намеренно не пытается воспроизвести весь application
contract внутри `CHECK` — глубокие типы `value` для конкретной метрики
остаются на runtime schema и тестах приложения.

По прецеденту migration 003 (`ADR-0005`) — `REVOKE EXECUTE FROM PUBLIC`
применяется ко **всем** новым helper/trigger функциям всех трёх миграций
этого ADR (§13), не только к `is_valid_metric_envelope` и
`reject_analysis_snapshot_immutable_mutation`.

### 10. Durable post-launch refresh

PRODUCT v0.3 §11.3 требует: launch атомарно фиксирует durable server intent
в той же транзакции; выполнение — ответственность сервера, at-least-once;
технические повторы автоматичны только пока Snapshot `pending`; после
terminal `failed` новая попытка — только через explicit retry пользователя;
превышение 15 минут — наблюдаемое нарушение SLA; ошибка refresh не
откатывает Campaign. Четвёртая версия ADR относила весь этот механизм «вне
объёма»; это решение реализует его целиком, в отдельной migration 009
(§13), с отдельной ролью `lmapp_analysis_worker` (§12) и отдельным worker
entrypoint.

**Ни одна runtime-роль не получает прямого `UPDATE` на эту таблицу — ни в
каком объёме, включая колоночный.** Это правка относительно предыдущей
версии, где GUC-маркер (`current_setting('leasemind.post_launch_refresh_retry_authorized', ...)`)
использовался, чтобы триггер отличал «санкционированный» `UPDATE` от
прямого — **это не является допустимой границей безопасности**:
transaction-local GUC не привязан ни к какой роли или праву, любой код,
способный выполнить произвольный `UPDATE` на этой таблице (то есть любая
роль с грантом `UPDATE`), тем же самым правом мог бы предварительно
выставить тот же GUC самостоятельно и обойти проверку. Вместо этого —
структурная гарантия: у `lmapp_analysis_worker`, `lmapp_analysis_writer` и
любой другой runtime-роли нет **вообще никакого** `UPDATE`-гранта на
`post_launch_refresh_intent` (§12) — единственный способ изменить состояние
intent — вызов одной из шести узких `SECURITY DEFINER` функций ниже
(claim, renew lease, finalize completed, finalize failed, explicit retry,
разовая фиксация SLA breach). Каждая функция сама решает, какой конкретно
`UPDATE` выполнить — вызывающая роль не передаёт и не может передать
произвольный SQL, только строго типизированные параметры.

**Владелец таблицы, transition-trigger function и шести command-функций —
восемь объектов, один владелец: bootstrap-provisioned NOLOGIN-роль
`lmapp_post_launch_refresh_owner`** (исправление повторного SQL-аудита —
**не** создаётся в migration 009: `lmapp_migrator` имеет атрибут
`NOCREATEROLE`, поэтому физически не может выполнить `CREATE ROLE` внутри
своей же миграции). Без пароля, без `LOGIN`, никто не может подключиться
под ней напрямую.

**Bootstrap-контракт (вне миграций, вне `provisionRoles.ts`'овского
password/login-цикла, §12).** Выполняется отдельным bootstrap-шагом с
более высокими правами, чем у `lmapp_migrator` (та же граница, что уже
отделяет `LEASEMIND_BOOTSTRAP_DATABASE_URL` от остальных identity, §12):

```sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lmapp_post_launch_refresh_owner') THEN
    CREATE ROLE lmapp_post_launch_refresh_owner
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

ALTER ROLE lmapp_post_launch_refresh_owner WITH NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD NULL;

GRANT lmapp_post_launch_refresh_owner TO lmapp_migrator WITH ADMIN FALSE;
GRANT lmapp_post_launch_refresh_owner TO lmapp_migrator WITH INHERIT FALSE;
GRANT lmapp_post_launch_refresh_owner TO lmapp_migrator WITH SET TRUE;
```

`ADMIN FALSE, INHERIT FALSE, SET TRUE` — точный membership-контракт PostgreSQL 18
(раздельные опции `INHERIT`/`SET` для `GRANT role TO role`, доступны с
PostgreSQL 16): `lmapp_migrator` становится членом
`lmapp_post_launch_refresh_owner` и может явно `SET ROLE
lmapp_post_launch_refresh_owner` для контролируемых операций (создание
владения объектами, выдача runtime-грантов от имени владельца, drop при
откате, ниже), но **не наследует** её привилегии автоматически в обычной
сессии (`INHERIT FALSE`) и не может передавать это membership другим ролям
(`ADMIN FALSE`) — рутинная работа `lmapp_migrator` (все остальные
миграции, весь остальной DDL) не расширяется этим membership незаметно.

**Migration 009 проверяет контракт и fail closed, если он не выполнен —
и не создаёт, и не удаляет саму роль:**

```sql
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
     WHERE rolname = 'lmapp_post_launch_refresh_owner'
       AND rolcanlogin = false
       AND rolsuper = false
       AND rolcreatedb = false
       AND rolcreaterole = false
       AND rolreplication = false
       AND rolbypassrls = false
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_OWNER_NOT_PROVISIONED: bootstrap contract missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members m
     JOIN pg_roles r ON r.oid = m.roleid
     JOIN pg_roles g ON g.oid = m.member
     WHERE r.rolname = 'lmapp_post_launch_refresh_owner'
       AND g.rolname = 'lmapp_migrator'
       AND m.set_option = true
       AND m.inherit_option = false
       AND m.admin_option = false
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_OWNER_MEMBERSHIP_INVALID: expected ADMIN FALSE, INHERIT FALSE, SET TRUE';
  END IF;
END $$;
```

**Исполнимый порядок внутри `009_post_launch_refresh_intent.up.sql`** (полный
до-объектный список — §13; здесь фиксируется сам принцип, ради которого он
именно такой): (1) проверка контракта выше; (2) `lmapp_migrator`, **не**
выполняя `SET ROLE`, создаёт таблицу/триггер-функцию/шесть command-функций
— в момент создания их временно владеет сам `lmapp_migrator` (обычное
поведение `CREATE TABLE`/`CREATE FUNCTION` — владелец — исполнитель
команды); (3) `lmapp_migrator` выдаёт `lmapp_post_launch_refresh_owner`
временный `CREATE` на схему `leasemind_app` — обязательное условие
`ALTER TABLE ... OWNER TO` для таблицы (PostgreSQL требует, чтобы новый
владелец обладал `CREATE`-правом на схему объекта в момент передачи
владения) — и постоянный `USAGE`; (4) `lmapp_migrator` выдаёт
`lmapp_post_launch_refresh_owner` точечный колоночный `SELECT` на внешние
таблицы, которые понадобятся command-функциям (`analysis_snapshot`,
`analysis_snapshot_idempotency_mapping`, полный список — ниже); (5)
`lmapp_migrator` передаёт владение всеми восемью объектами
`lmapp_post_launch_refresh_owner` (`ALTER TABLE/FUNCTION ... OWNER TO`);
(6) `lmapp_migrator` отзывает временный `CREATE ON SCHEMA` у владельца,
сохраняя только `USAGE` и колоночные `SELECT` (объект уже передан —
`CREATE` на схему больше не нужен); (7) runtime-гранты (`EXECUTE` на шесть
функций, `INSERT` на таблицу для `lmapp_campaign_writer`) выполняются
`lmapp_migrator`, явно выполнившим `SET ROLE lmapp_post_launch_refresh_owner`
непосредственно перед этими операторами и `RESET ROLE` сразу после — после
шага 5 `lmapp_migrator` больше не владеет ни одним из восьми объектов, а
`GRANT EXECUTE`/`GRANT INSERT` на чужой объект разрешён только его
владельцу (или роли с `GRANT OPTION`, или superuser) — `SET ROLE` здесь не
формальность, а единственный способ этим операторам вообще выполниться.

```
CREATE TABLE leasemind_app.post_launch_refresh_intent (
  campaign_id                     uuid PRIMARY KEY,

  property_id                     uuid NULL REFERENCES leasemind_app.property (property_id),
  tenant_request_id               uuid NULL REFERENCES leasemind_app.tenant_request (tenant_request_id),
  technical_assignment_id         uuid GENERATED ALWAYS AS (COALESCE(property_id, tenant_request_id)) STORED,
  scenario                        text NOT NULL CHECK (scenario IN ('need_tenant', 'need_property')),
  source_revision                 integer NOT NULL CHECK (source_revision >= 1),
  analysis_kind                   text NOT NULL CHECK (analysis_kind = 'post_launch_refresh'),

  status                          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'claimed', 'completed', 'failed')),
  execution_claim_count           integer NOT NULL DEFAULT 0 CHECK (execution_claim_count >= 0),
  claimed_by_worker_id            text NULL,       -- privacy-safe worker/process identity, не пользовательские данные
  claimed_at                      timestamptz NULL,
  lease_expires_at                timestamptz NULL,
  current_analysis_snapshot_id    uuid NULL,

  launched_at                     timestamptz NOT NULL,
  sla_deadline_at                 timestamptz NOT NULL GENERATED ALWAYS AS (
    timezone('UTC', timezone('UTC', launched_at) + interval '15 minutes')
  ) STORED,
  finished_at                     timestamptz NULL,
  sla_breach_reported_at          timestamptz NULL,

  created_at                      timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at                      timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT post_launch_refresh_intent_exactly_one_reference CHECK (
    (scenario = 'need_tenant'   AND property_id IS NOT NULL AND tenant_request_id IS NULL) OR
    (scenario = 'need_property' AND tenant_request_id IS NOT NULL AND property_id IS NULL)
  ),
  CONSTRAINT post_launch_refresh_intent_campaign_link_fk
    FOREIGN KEY (campaign_id, scenario, technical_assignment_id, source_revision)
    REFERENCES leasemind_app.campaign_subject_link_projection (campaign_id, scenario, technical_assignment_id, source_revision),
  CONSTRAINT post_launch_refresh_intent_current_snapshot_identity_fk
    FOREIGN KEY (current_analysis_snapshot_id, technical_assignment_id, source_revision, analysis_kind, campaign_id)
    REFERENCES leasemind_app.analysis_snapshot
      (analysis_snapshot_id, technical_assignment_id, source_revision, analysis_kind, campaign_id),
  CONSTRAINT post_launch_refresh_intent_updated_at_after_created CHECK (updated_at >= created_at),
  CONSTRAINT post_launch_refresh_intent_finished_after_launch CHECK (finished_at IS NULL OR finished_at >= launched_at),

  CONSTRAINT post_launch_refresh_intent_pending_shape CHECK (
    status <> 'pending' OR (claimed_by_worker_id IS NULL AND claimed_at IS NULL AND lease_expires_at IS NULL AND finished_at IS NULL)
  ),
  CONSTRAINT post_launch_refresh_intent_claimed_shape CHECK (
    status <> 'claimed' OR (claimed_by_worker_id IS NOT NULL AND claimed_at IS NOT NULL AND lease_expires_at IS NOT NULL AND finished_at IS NULL)
  ),
  CONSTRAINT post_launch_refresh_intent_completed_shape CHECK (
    status <> 'completed' OR (current_analysis_snapshot_id IS NOT NULL AND finished_at IS NOT NULL)
  ),
  CONSTRAINT post_launch_refresh_intent_failed_shape CHECK (
    status <> 'failed' OR (current_analysis_snapshot_id IS NOT NULL AND finished_at IS NOT NULL)
  )
);
-- владелец сразу после CREATE TABLE — lmapp_migrator (исполнитель команды);
-- передача владения lmapp_post_launch_refresh_owner происходит позже,
-- одним консолидированным шагом вместе с шестью функциями (ниже, после
-- CREATE FUNCTION mark_post_launch_refresh_intent_sla_breach) — см. процесс выше.
```

`campaign_id PRIMARY KEY` уже эквивалентен «один intent на полный
логический ключ»: `campaign_subject_link_projection_one_campaign_per_ta_revision`
(§3) гарантирует не более одной Campaign на `(technical_assignment_id,
source_revision)`, поэтому `campaign_id` 1:1 определяет весь логический
ключ `post_launch_refresh` — отдельного composite unique для этого не
требуется. `execution_claim_count` (не `attempt_count` — явно другое имя,
чтобы не путать с `analysis_snapshot.calculation_attempt`: это счётчик
попыток **технического выполнения** одного и того же intent, а не счётчик
попыток Analysis) увеличивается при каждом claim, включая повторные claim
после истёкшего lease — это же поле служит **fencing token** (ниже).

`post_launch_refresh_intent_current_snapshot_identity_fk` (correction 4,
пятая ревизия) заменяет простой FK по одному `current_analysis_snapshot_id
→ analysis_snapshot_id`: составной FK, опирающийся на
`analysis_snapshot_post_launch_identity_unique` (§4), доказывает не только
существование референсного Snapshot, но и то, что он относится к тому же
`technical_assignment_id`/`source_revision`/`analysis_kind`/`campaign_id`,
что и сам intent — без этого простой FK допускал бы (по крайней мере на
уровне схемы, без внешней проверки приложением) привязку intent к
Snapshot'у совершенно другого логического запроса. MATCH SIMPLE: при
`current_analysis_snapshot_id IS NULL` (до первого claim) проверка
пропускается целиком.

**Controlled-transition trigger — чистая структурная проверка машины
состояний, без GUC.** Identity (`campaign_id`, `property_id`,
`tenant_request_id`, `scenario`, `source_revision`, `analysis_kind`),
`launched_at` и `created_at` неизменяемы. `DELETE` запрещён безусловно.
Кросс-статусный `UPDATE` разрешён только для строго определённого набора
переходов `(OLD.status, NEW.status)` с `OLD.status <> NEW.status`,
**включая** `failed→pending` в этом списке — это безопасно именно потому,
что данный `UPDATE` физически недостижим ни для одной роли, кроме
`lmapp_post_launch_refresh_owner` (через `SECURITY DEFINER`-функции), а
среди шести функций только `request_post_launch_refresh_retry` вообще
содержит такой `UPDATE` в своём теле — сама структура функции (а не
проверка `current_setting` в триггере) и есть граница авторизации.

**Self-transition (`OLD.status = NEW.status`) — отдельная ветка, не общее
разрешение произвольного self-update.** Обнаружено повторным SQL-аудитом:
исходный список переходов не содержал ни одной пары с равными статусами,
кроме `claimed→claimed` (re-claim) — из-за этого
`mark_post_launch_refresh_intent_sla_breach` (§10, ниже), которая по
конструкции не меняет `status`, отклонялась триггером для `pending`,
`completed` и `failed` (три из четырёх статусов, для которых SLA breach в
принципе применим). Исправление — два **разных**, явно проверяемых
self-transition-сценария, ни один не открывает произвольный self-update:

- **`claimed → claimed`** — только одна из двух точных форм: lease renewal
  текущего claim (тот же worker и fencing token, меняются только
  `lease_expires_at`/`updated_at`) либо re-claim истёкшего lease (старый
  lease уже истёк, `execution_claim_count` увеличен ровно на 1, установлен
  новый privacy-safe worker, обновлены `claimed_at`/`lease_expires_at`/
  `updated_at`). `current_analysis_snapshot_id`, `finished_at` и
  `sla_breach_reported_at` в обоих вариантах неизменны. Fencing внутри
  `SECURITY DEFINER` функций остаётся основной runtime-гарантией, а trigger
  независимо запрещает произвольный self-update даже owner-контексту.
- **SLA breach marking** (любой статус, включая `pending`/`completed`/
  `failed`, не только `claimed`) — разрешена **только** если одновременно:
  `OLD.sla_breach_reported_at IS NULL`, `NEW.sla_breach_reported_at IS NOT
  NULL`, и все прочие mutable-поля (`execution_claim_count`,
  `claimed_by_worker_id`, `claimed_at`, `lease_expires_at`,
  `current_analysis_snapshot_id`, `finished_at`) совпадают побитно через
  `IS NOT DISTINCT FROM` (identity-поля и `launched_at`/`created_at` уже
  проверены безусловно выше, для любого `UPDATE`). Любой другой
  self-transition (в том числе `pending→pending`/`completed→completed`/
  `failed→failed` без изменения `sla_breach_reported_at`, либо изменение
  `sla_breach_reported_at` вместе с любым другим полем) — отклонён.

```
CREATE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_IMMUTABLE: DELETE is never permitted';
  END IF;

  IF NEW.campaign_id <> OLD.campaign_id
     OR NEW.property_id IS DISTINCT FROM OLD.property_id
     OR NEW.tenant_request_id IS DISTINCT FROM OLD.tenant_request_id
     OR NEW.scenario <> OLD.scenario
     OR NEW.source_revision <> OLD.source_revision
     OR NEW.analysis_kind <> OLD.analysis_kind
     OR NEW.launched_at <> OLD.launched_at
     OR NEW.created_at <> OLD.created_at
  THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_IMMUTABLE_IDENTITY: identity/launch time cannot change';
  END IF;

  IF OLD.status = NEW.status THEN
    IF OLD.status = 'claimed' THEN
      -- Exact lease renewal: same worker and fencing token; only lease and
      -- updated_at may advance.
      IF NEW.execution_claim_count        = OLD.execution_claim_count
         AND NEW.claimed_by_worker_id     IS NOT DISTINCT FROM OLD.claimed_by_worker_id
         AND NEW.claimed_at               IS NOT DISTINCT FROM OLD.claimed_at
         AND NEW.lease_expires_at         >= OLD.lease_expires_at
         AND NEW.current_analysis_snapshot_id IS NOT DISTINCT FROM OLD.current_analysis_snapshot_id
         AND NEW.finished_at              IS NOT DISTINCT FROM OLD.finished_at
         AND NEW.sla_breach_reported_at   IS NOT DISTINCT FROM OLD.sla_breach_reported_at
         AND NEW.updated_at               >= OLD.updated_at
      THEN
        RETURN NEW;
      END IF;

      -- Exact expired-lease re-claim: one new fencing generation; the
      -- analysis target and terminal/SLA fields remain unchanged.
      IF OLD.lease_expires_at < clock_timestamp()
         AND NEW.execution_claim_count = OLD.execution_claim_count + 1
         AND NEW.claimed_by_worker_id IS NOT NULL
         AND NEW.claimed_at IS NOT NULL
         AND NEW.lease_expires_at IS NOT NULL
         AND NEW.claimed_at >= OLD.claimed_at
         AND NEW.lease_expires_at > NEW.claimed_at
         AND NEW.current_analysis_snapshot_id IS NOT DISTINCT FROM OLD.current_analysis_snapshot_id
         AND NEW.finished_at IS NOT DISTINCT FROM OLD.finished_at
         AND NEW.sla_breach_reported_at IS NOT DISTINCT FROM OLD.sla_breach_reported_at
         AND NEW.updated_at >= OLD.updated_at
      THEN
        RETURN NEW;
      END IF;
    END IF;

    IF OLD.sla_breach_reported_at IS NULL
       AND NEW.sla_breach_reported_at IS NOT NULL
       AND NEW.execution_claim_count        IS NOT DISTINCT FROM OLD.execution_claim_count
       AND NEW.claimed_by_worker_id         IS NOT DISTINCT FROM OLD.claimed_by_worker_id
       AND NEW.claimed_at                   IS NOT DISTINCT FROM OLD.claimed_at
       AND NEW.lease_expires_at             IS NOT DISTINCT FROM OLD.lease_expires_at
       AND NEW.current_analysis_snapshot_id IS NOT DISTINCT FROM OLD.current_analysis_snapshot_id
       AND NEW.finished_at                  IS NOT DISTINCT FROM OLD.finished_at
    THEN
      -- one-time SLA breach marking: status unchanged (any of the four
      -- values), only sla_breach_reported_at (NULL -> NOT NULL) and
      -- updated_at change.
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_INVALID_SELF_TRANSITION: % self-transition only permitted for claimed re-claim or one-time SLA breach marking', OLD.status;
  END IF;

  IF NOT (
    (OLD.status = 'pending' AND NEW.status = 'claimed') OR
    (OLD.status = 'claimed' AND NEW.status = 'completed') OR
    (OLD.status = 'claimed' AND NEW.status = 'failed') OR
    (OLD.status = 'failed'  AND NEW.status = 'pending')
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_INVALID_TRANSITION: % -> % is not permitted', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = pg_catalog, leasemind_app;

-- владелец сразу после CREATE — lmapp_migrator; передача владения ниже,
-- консолидированным шагом (см. процесс выше).
REVOKE EXECUTE ON FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition() FROM PUBLIC;

CREATE TRIGGER post_launch_refresh_intent_reject_delete
  BEFORE DELETE ON leasemind_app.post_launch_refresh_intent
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition();

CREATE TRIGGER post_launch_refresh_intent_enforce_transition
  BEFORE UPDATE ON leasemind_app.post_launch_refresh_intent
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition();
```

**Fencing и execution lock — две разные гарантии, не взаимозаменяемые.**
Execution lock (§6 "Execution flow") защищает **вычисление** одной
конкретной строки `analysis_snapshot` от повторного одновременного счёта.
Fencing защищает отдельный от него ресурс — **право конкретного worker'а
считать себя текущим владельцем данного intent** прямо сейчас.
`execution_claim_count`, возвращаемый функцией claim как непрозрачный
монотонный токен, обязан передаваться каждым последующим вызовом
renew/finalize и проверяться **одновременно** с `campaign_id`,
`claimed_by_worker_id`, `status = 'claimed'` и `lease_expires_at >= now()`
одним predicate внутри `UPDATE ... WHERE`. Типичный сценарий: worker A
подвис во время расчёта, его lease истёк, worker B переклеймил тот же
intent (`execution_claim_count` увеличился); когда A наконец пытается
финализировать устаревший результат, все пять условий одновременно уже не
выполняются — `UPDATE` затрагивает **ноль строк**. Ни одна из функций
finalize/renew не трактует ноль затронутых строк как успех — каждая явно
поднимает стабильную ошибку `..._FENCING_STALE`, а не завершается тихо.

```
CREATE FUNCTION leasemind_app.claim_post_launch_refresh_intent(
  p_worker_id text,
  p_limit integer DEFAULT 1
) RETURNS TABLE (
  campaign_id                  uuid,
  property_id                  uuid,
  tenant_request_id            uuid,
  technical_assignment_id      uuid,
  scenario                     text,
  source_revision              integer,
  current_analysis_snapshot_id uuid,
  execution_claim_count        integer,
  launched_at                  timestamptz,
  sla_deadline_at              timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
BEGIN
  IF p_worker_id IS NULL OR length(p_worker_id) = 0 OR length(p_worker_id) > 200 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_CLAIM_INVALID_WORKER_ID';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 20 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_CLAIM_INVALID_LIMIT';
  END IF;

  RETURN QUERY
  UPDATE leasemind_app.post_launch_refresh_intent i
     SET status = 'claimed',
         claimed_by_worker_id = p_worker_id,
         claimed_at = clock_timestamp(),
         lease_expires_at = clock_timestamp() + interval '2 minutes',
         execution_claim_count = i.execution_claim_count + 1,
         updated_at = clock_timestamp()
    FROM (
      SELECT pri.campaign_id FROM leasemind_app.post_launch_refresh_intent pri
       WHERE pri.status = 'pending' OR (pri.status = 'claimed' AND pri.lease_expires_at < clock_timestamp())
       ORDER BY pri.launched_at
       LIMIT p_limit
       FOR UPDATE SKIP LOCKED
    ) picked
   WHERE i.campaign_id = picked.campaign_id
  RETURNING i.campaign_id, i.property_id, i.tenant_request_id, i.technical_assignment_id,
            i.scenario, i.source_revision, i.current_analysis_snapshot_id,
            i.execution_claim_count, i.launched_at, i.sla_deadline_at;
END;
$$;

-- владелец сразу после CREATE — lmapp_migrator; передача владения и
-- GRANT EXECUTE — консолидированным шагом ниже, после всех шести функций.
REVOKE ALL ON FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer) FROM PUBLIC;
```

`FOR UPDATE SKIP LOCKED` гарантирует, что несколько worker-процессов не
заберут один и тот же intent одновременно. Условие `status='claimed' AND
lease_expires_at < now()` — единственный механизм восстановления после
падения worker'а: новый (или тот же, перезапущенный) worker просто
повторно вызывает эту функцию и получает ранее «зависший» intent, увеличив
`execution_claim_count` — новый fencing token, который старый (зависший)
worker никогда не узнает и не сможет предъявить.

```
CREATE FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(
  p_campaign_id uuid,
  p_worker_id text,
  p_execution_claim_count integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent
     SET lease_expires_at = clock_timestamp() + interval '2 minutes',
         updated_at = clock_timestamp()
   WHERE campaign_id = p_campaign_id
     AND status = 'claimed'
     AND claimed_by_worker_id = p_worker_id
     AND execution_claim_count = p_execution_claim_count
     AND lease_expires_at >= clock_timestamp();
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_FENCING_STALE: worker % lost claim on campaign % (claim_count=%)', p_worker_id, p_campaign_id, p_execution_claim_count;
  END IF;
END;
$$;

-- владелец сразу после CREATE — lmapp_migrator; передача владения и
-- GRANT EXECUTE — консолидированным шагом ниже.
REVOKE ALL ON FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer) FROM PUBLIC;

CREATE FUNCTION leasemind_app.complete_post_launch_refresh_intent(
  p_campaign_id uuid,
  p_worker_id text,
  p_execution_claim_count integer,
  p_analysis_snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent
     SET status = 'completed',
         current_analysis_snapshot_id = p_analysis_snapshot_id,
         finished_at = clock_timestamp(),
         updated_at = clock_timestamp()
   WHERE campaign_id = p_campaign_id
     AND status = 'claimed'
     AND claimed_by_worker_id = p_worker_id
     AND execution_claim_count = p_execution_claim_count
     AND lease_expires_at >= clock_timestamp()
     AND EXISTS (
       SELECT 1 FROM leasemind_app.analysis_snapshot s
        WHERE s.analysis_snapshot_id = p_analysis_snapshot_id
          AND s.status IN ('completed', 'insufficient_data')
     );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_FENCING_STALE: worker % lost claim on campaign % (claim_count=%)', p_worker_id, p_campaign_id, p_execution_claim_count;
  END IF;
END;
$$;

-- владелец сразу после CREATE — lmapp_migrator; передача владения и
-- GRANT EXECUTE — консолидированным шагом ниже.
REVOKE ALL ON FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid) FROM PUBLIC;

CREATE FUNCTION leasemind_app.fail_post_launch_refresh_intent(
  p_campaign_id uuid,
  p_worker_id text,
  p_execution_claim_count integer,
  p_analysis_snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent
     SET status = 'failed',
         current_analysis_snapshot_id = p_analysis_snapshot_id,
         finished_at = clock_timestamp(),
         updated_at = clock_timestamp()
   WHERE campaign_id = p_campaign_id
     AND status = 'claimed'
     AND claimed_by_worker_id = p_worker_id
     AND execution_claim_count = p_execution_claim_count
     AND lease_expires_at >= clock_timestamp()
     AND EXISTS (
       SELECT 1 FROM leasemind_app.analysis_snapshot s
        WHERE s.analysis_snapshot_id = p_analysis_snapshot_id
          AND s.status = 'failed'
     );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_FENCING_STALE: worker % lost claim on campaign % (claim_count=%)', p_worker_id, p_campaign_id, p_execution_claim_count;
  END IF;
END;
$$;

-- владелец сразу после CREATE — lmapp_migrator; передача владения и
-- GRANT EXECUTE — консолидированным шагом ниже.
REVOKE ALL ON FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid) FROM PUBLIC;
```

`renew`/`complete`/`fail` разделяют один и тот же fencing-predicate
(`campaign_id` + `claimed_by_worker_id` + `execution_claim_count` +
`status='claimed'` + lease не истёк) и одинаково реагируют на его
нарушение — `RAISE EXCEPTION` со стабильным кодом
`POST_LAUNCH_REFRESH_INTENT_FENCING_STALE`, никогда тихий no-op. `complete`/
`fail` дополнительно требуют, чтобы соответствующий `analysis_snapshot`
уже находился в согласованном terminal-статусе (`EXISTS`-условие) — это не
дублирует fencing, а защищает от вызова finalize с чужим/неверным
`analysis_snapshot_id`, который прошёл бы fencing-предикат, но нарушил бы
`post_launch_refresh_intent_current_snapshot_identity_fk` без явного
объяснения причины отказа.

**Server-derived key используется только для попытки 1 — worker ветвится
по `current_analysis_snapshot_id`, возвращённому claim'ом (исправление
повторного SQL-аудита).** Прежняя формулировка предполагала, что worker
переиспользует один и тот же server-derived `idempotency_key` на **каждом**
claim без исключений — это ошибочно: mapping (§5) immutable, поэтому один
конкретный `idempotency_key` **навсегда** указывает на тот
`analysis_snapshot_id`, с которым он был впервые принят. После explicit
retry (ниже) `attempt 2` создаётся **новым, пользовательским**
`idempotency_key` (§6), а не server-derived — если бы worker на следующем
claim снова обратился по старому server-derived ключу, fast path (§6, шаг
2) закономерно и корректно (с точки зрения самого mapping) вернул бы
**попытку 1**, а не только что созданную retry попытку 2, и worker
никогда не увидел бы и не выполнил бы attempt 2. Server-derived ключ
поэтому применяется **исключительно** как путь создания/восстановления
самой первой попытки:

```text
idempotency_key = sha256Hex(
  "LEASEMIND_ANALYSIS_POST_LAUNCH_REFRESH_INTENT_V1|" +
  campaign_id + "|" +
  technical_assignment_id + "|" +
  source_revision + "|" +
  "post_launch_refresh"
)
```

После успешного `claim_post_launch_refresh_intent` worker ветвится **до**
какого-либо обращения к Analysis-flow, по значению
`current_analysis_snapshot_id`, которое вернул сам claim:

- **`current_analysis_snapshot_id IS NULL`** — попытка 1 этого intent ещё
  не финализирована (intent никогда не проходил через explicit retry).
  Worker выполняет команду (§6, «Ключ не найден»/fast path) **с initial
  server-derived ключом выше** — она атомарно создаёт либо находит
  `attempt 1`; затем — execution flow (§6) для полученного
  `analysis_snapshot_id`, если он ещё `pending`.
- **`current_analysis_snapshot_id IS NOT NULL`** — intent был явно
  переоткрыт `request_post_launch_refresh_retry` (единственная функция,
  устанавливающая это поле вне finalize, ниже): значение, возвращённое
  claim'ом, уже указывает на конкретный `analysis_snapshot_id` новой
  попытки (`calculation_attempt > 1`), созданной retry с новым
  пользовательским `idempotency_key`. Worker **не вызывает команду с
  initial key вовсе** — сразу вызывает execution flow (§6) непосредственно
  для `current_analysis_snapshot_id`, полученного от claim.

Раскладка по фактическому состоянию:

- **Mapping (initial key) отсутствует, `current_analysis_snapshot_id IS
  NULL`** (первый claim этого intent) — команда создаёт `pending
  analysis_snapshot` (`attempt 1`) и mapping в одной транзакции; execution
  flow выполняет расчёт и переводит её в terminal.
- **Mapping (initial key) уже указывает на `pending`,
  `current_analysis_snapshot_id IS NULL`** (worker переклеймил intent
  после падения на середине выполнения `attempt 1`, retry ещё не
  вызывался) — команда — чистый fast path, ничего не меняет; execution
  flow продолжает ту же строку — новый Snapshot и новый
  `calculation_attempt` не создаются.
- **`attempt 1` уже terminal `completed`/`insufficient_data`,
  `current_analysis_snapshot_id` всё ещё `NULL`** — команда (fast path)
  возвращает его немедленно; execution flow — no-op (§6, шаг 4); worker
  вызывает `complete_post_launch_refresh_intent` с этим
  `analysis_snapshot_id` — это первый момент, когда
  `current_analysis_snapshot_id` вообще записывается.
- **`attempt 1` уже terminal `failed`, `current_analysis_snapshot_id`
  всё ещё `NULL`** — аналогично, worker вызывает
  `fail_post_launch_refresh_intent`; claim-функция больше не отбирает этот
  intent (`status='failed'` вне `pending`/просроченный `claimed`) — новая
  попытка не создаётся автоматически ни при каких условиях, пока
  пользователь не вызовет explicit retry.
- **`current_analysis_snapshot_id IS NOT NULL`** (intent переоткрыт retry,
  claim вернул конкретный `attempt N > 1`) — worker сразу выполняет
  execution flow для этого ID; по достижении terminal — вызывает
  `complete`/`fail_post_launch_refresh_intent` с тем же ID
  (`current_analysis_snapshot_id` при этом переписывается тем же
  значением — идемпотентно).

**Crash recovery — четыре точки сбоя, разложенные по двум веткам
worker-flow выше (не по единому детерминированному ключу, как в
предыдущей версии):**

1. **Ветка `current_analysis_snapshot_id IS NULL`, до создания/нахождения
   `attempt 1`** (worker падает сразу после claim, до вызова команды) —
   lease истекает, следующий claim подбирает intent снова (новый fencing
   token), `current_analysis_snapshot_id` по-прежнему `NULL` — worker
   снова идёт по этой же ветке, команда с initial key отрабатывает как
   честный первый вызов.
2. **Ветка `current_analysis_snapshot_id IS NULL`, во время execution flow
   `attempt 1`** (worker убит в §6 "Execution flow" п.2–6) — если сама
   `REPEATABLE READ`-транзакция execution flow не закоммитилась, Postgres
   откатывает её автоматически при разрыве соединения; следующий claim
   (новый fencing token), всё ещё видя `current_analysis_snapshot_id IS
   NULL`, повторяет команду (fast path находит уже созданный `pending
   analysis_snapshot`, если он успел закоммититься) и execution flow для
   того же `analysis_snapshot_id`, того же `calculation_attempt`.
3. **Ветка `current_analysis_snapshot_id IS NOT NULL` (после retry), во
   время execution flow `attempt N`** — worker убит между claim и finalize
   для уже известного `current_analysis_snapshot_id`; lease истекает,
   следующий claim снова возвращает тот же `current_analysis_snapshot_id`
   (никто, кроме следующего вызова retry после очередного `failed`, его не
   меняет) — worker снова идёт прямо к execution flow для того же ID, того
   же `calculation_attempt`; initial key не затрагивается ни на одном шаге
   этой ветки.
4. **Любая ветка, после terminal Snapshot, но до finalize intent'а**
   (`analysis_snapshot` уже `completed`/`insufficient_data`/`failed`, но
   `complete_post_launch_refresh_intent`/`fail_post_launch_refresh_intent`
   ещё не вызваны) — lease истекает, следующий claim (новый fencing token)
   в обеих ветках получает достаточно информации, чтобы определить target
   `analysis_snapshot_id` (initial-key fast path для ветки `NULL`, либо
   прямое чтение `current_analysis_snapshot_id` для ветки retry) —
   execution flow no-op (уже terminal), worker сразу вызывает
   соответствующую finalize-функцию.

Ни в одной из веток `current_analysis_snapshot_id` не пишется
промежуточным шагом до финализации текущей попытки — единственные
функции, пишущие в это поле, это `complete`/`fail` (финализация текущей
попытки, какой бы она ни была) и `request_post_launch_refresh_retry`
(создание следующей попытки). Именно по этому полю, а не по повторному
использованию server-derived ключа, worker отличает «попытка 1 ещё не
финализирована» (`NULL`) от «есть открытая retry-попытка» (конкретный
ID) — без этой ветки, при переиспользовании initial key на каждом claim,
fast path §6 закономерно продолжал бы возвращать `attempt 1` даже после
того, как retry создал `attempt 2` (найденный дефект).

**Explicit retry для `post_launch_refresh`.** Явный retry пользователя
после terminal `failed`+`retryable=true` (§6) для `post_launch_refresh`
проходит через ту же `§6`-логику (новый **пользовательский**
`idempotency_key` — не server-derived initial key, который остаётся
навсегда связан с попыткой 1, выше; `retry_of_analysis_snapshot_id`,
`calculation_attempt + 1`) и **в той же транзакции** переоткрывает
соответствующий intent из `failed` в `pending`, записывая
`current_analysis_snapshot_id = p_new_analysis_snapshot_id`, через
единственную санкционированную функцию — **не** синхронно завершает новый
Snapshot перед requeue: новая попытка создаётся `pending`, а её реальное
выполнение остаётся ответственностью следующего worker claim, который (по
уже ненулевому `current_analysis_snapshot_id`, записанному этой функцией)
пойдёт сразу к execution flow для неё, минуя команду и initial key (выше).

**Без `SELECT *` — только перечисленные колонки**
(исправление повторного SQL-аудита: `analysis_snapshot` не принадлежит
`lmapp_post_launch_refresh_owner`, поэтому `SELECT *` по ней потребовал бы
table-wide `SELECT`-гранта, противоречащего least privilege; по собственной
таблице `post_launch_refresh_intent` функция также читает только два реально
нужных поля, чтобы код и проверяемый allowlist оставались явными):

```
CREATE FUNCTION leasemind_app.request_post_launch_refresh_retry(
  p_campaign_id uuid,
  p_new_analysis_snapshot_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_intent_status                 text;
  v_current_analysis_snapshot_id  uuid;
  v_prior_status                  text;
  v_prior_failure                 jsonb;
  v_prior_technical_assignment_id uuid;
  v_prior_source_revision         integer;
  v_prior_calculation_attempt     integer;
  v_new_status                    text;
  v_new_failure                   jsonb;
  v_new_technical_assignment_id   uuid;
  v_new_source_revision           integer;
  v_new_analysis_kind             text;
  v_new_campaign_id               uuid;
  v_new_calculation_attempt       integer;
BEGIN
  SELECT status, current_analysis_snapshot_id
    INTO v_intent_status, v_current_analysis_snapshot_id
    FROM leasemind_app.post_launch_refresh_intent
   WHERE campaign_id = p_campaign_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_NOT_FOUND: %', p_campaign_id;
  END IF;
  IF v_intent_status <> 'failed' THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_NOT_FAILED: campaign_id % is % not failed', p_campaign_id, v_intent_status;
  END IF;

  SELECT status, failure, technical_assignment_id, source_revision, calculation_attempt
    INTO v_prior_status, v_prior_failure, v_prior_technical_assignment_id, v_prior_source_revision, v_prior_calculation_attempt
    FROM leasemind_app.analysis_snapshot
   WHERE analysis_snapshot_id = v_current_analysis_snapshot_id;
  IF NOT FOUND OR v_prior_status <> 'failed'
     OR (v_prior_failure->>'retryable')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_PRIOR_NOT_RETRYABLE: %', p_campaign_id;
  END IF;

  SELECT status, failure, technical_assignment_id, source_revision, analysis_kind, campaign_id, calculation_attempt
    INTO v_new_status, v_new_failure, v_new_technical_assignment_id, v_new_source_revision, v_new_analysis_kind, v_new_campaign_id, v_new_calculation_attempt
    FROM leasemind_app.analysis_snapshot
   WHERE analysis_snapshot_id = p_new_analysis_snapshot_id;
  IF NOT FOUND
     OR v_new_status                <> 'pending'
     OR v_new_failure               IS NOT NULL
     OR v_new_technical_assignment_id <> v_prior_technical_assignment_id
     OR v_new_source_revision       <> v_prior_source_revision
     OR v_new_analysis_kind         <> 'post_launch_refresh'
     OR v_new_campaign_id           <> p_campaign_id
     OR v_new_calculation_attempt   <> v_prior_calculation_attempt + 1
  THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_RETRY_TARGET_INVALID: %', p_campaign_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM leasemind_app.analysis_snapshot_idempotency_mapping m
     WHERE m.analysis_snapshot_id = p_new_analysis_snapshot_id
       AND m.retry_of_analysis_snapshot_id = v_current_analysis_snapshot_id
  ) THEN
    RAISE EXCEPTION 'POST_LAUNCH_REFRESH_INTENT_RETRY_MAPPING_MISSING: %', p_campaign_id;
  END IF;

  UPDATE leasemind_app.post_launch_refresh_intent
     SET status = 'pending',
         current_analysis_snapshot_id = p_new_analysis_snapshot_id,
         claimed_by_worker_id = NULL,
         claimed_at = NULL,
         lease_expires_at = NULL,
         finished_at = NULL,
         updated_at = clock_timestamp()
   WHERE campaign_id = p_campaign_id;
END;
$$;

-- владелец сразу после CREATE — lmapp_migrator; передача владения и
-- GRANT EXECUTE — консолидированным шагом ниже.
REVOKE ALL ON FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid) FROM PUBLIC;
```

Внешние column-level `SELECT`, которые эта функция требует от владельца
(выданы `lmapp_migrator` до передачи владения, доп. §12, §13):
`analysis_snapshot(analysis_snapshot_id, status, failure, technical_assignment_id,
source_revision, analysis_kind, campaign_id, calculation_attempt)` —
восемь колонок, ни одной лишней относительно того, что реально читают три
`SELECT` выше — и `analysis_snapshot_idempotency_mapping(analysis_snapshot_id,
retry_of_analysis_snapshot_id)` — обе колонки, участвующие в `EXISTS`.

Функция самодостаточна (проверяет current failed Snapshot,
`retryable=true`, новую попытку в состоянии `pending` без `failure`, полный
logical key, `calculation_attempt = target + 1`, факт существования
immutable mapping-строки, связывающей новую попытку с прежней через
`retry_of_analysis_snapshot_id`, и соответствие intent — не полагается на
то, что вызывающий код уже всё проверил, так как `SECURITY DEFINER`
выполняется с повышенными правами и должна быть параноидальной сама по
себе); `search_path` зафиксирован (`pg_catalog, leasemind_app`) против
search-path injection; `EXECUTE` отозван у `PUBLIC` и выдан только
`lmapp_analysis_writer` — `lmapp_analysis_worker` не получает `EXECUTE` на
эту функцию (explicit retry инициируется исключительно пользователем через
синхронный HTTP-путь, никогда из worker'а). Обновляет только `status`,
`current_analysis_snapshot_id` и claim/terminal-поля; identity,
`launched_at`, `created_at` не трогает — дополнительно гарантировано тем же
триггером.

```
CREATE FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(
  p_campaign_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, leasemind_app
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE leasemind_app.post_launch_refresh_intent
     SET sla_breach_reported_at = clock_timestamp(),
         updated_at = clock_timestamp()
   WHERE campaign_id = p_campaign_id
     AND sla_breach_reported_at IS NULL
     AND (
       (finished_at IS NULL AND clock_timestamp() > sla_deadline_at)
       OR (finished_at IS NOT NULL AND finished_at > sla_deadline_at)
     );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- владелец сразу после CREATE — lmapp_migrator; передача владения и
-- GRANT EXECUTE — консолидированным шагом ниже (последняя из шести функций).
REVOKE ALL ON FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid) FROM PUBLIC;
```

**Консолидированная передача владения и runtime-гранты — один блок, после
того как таблица, transition-trigger function и все шесть command-функций
уже созданы** (шаги 3–7 процесса, описанного в начале §10; полная позиция
внутри `009_post_launch_refresh_intent.up.sql` — §13):

```sql
-- шаг 3: временный CREATE (для передачи владения таблицей) + постоянный USAGE
GRANT CREATE, USAGE ON SCHEMA leasemind_app TO lmapp_post_launch_refresh_owner;

-- шаг 4: точечный колоночный SELECT на внешние таблицы, нужные функциям
GRANT SELECT (analysis_snapshot_id, status, failure, technical_assignment_id, source_revision, analysis_kind, campaign_id, calculation_attempt)
  ON leasemind_app.analysis_snapshot TO lmapp_post_launch_refresh_owner;
GRANT SELECT (analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_post_launch_refresh_owner;

-- шаг 5: передача владения восемью объектами
ALTER TABLE leasemind_app.post_launch_refresh_intent OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition() OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer) OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer) OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid) OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid) OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid) OWNER TO lmapp_post_launch_refresh_owner;
ALTER FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid) OWNER TO lmapp_post_launch_refresh_owner;

-- шаг 6: временный CREATE больше не нужен — объект уже передан
REVOKE CREATE ON SCHEMA leasemind_app FROM lmapp_post_launch_refresh_owner;

-- шаг 7: runtime-гранты — только в явно авторизованном owner-контексте,
-- потому что lmapp_migrator с этого момента не владеет ни одним из восьми
-- объектов и не может GRANT на чужой объект без SET ROLE
SET ROLE lmapp_post_launch_refresh_owner;

GRANT INSERT (
  campaign_id, property_id, tenant_request_id, scenario, source_revision,
  analysis_kind, status, launched_at
) ON leasemind_app.post_launch_refresh_intent TO lmapp_campaign_writer;

GRANT EXECUTE ON FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid) TO lmapp_analysis_writer;

RESET ROLE;
```

`REVOKE ALL ... FROM PUBLIC` для каждой функции (уже выполнен сразу при
`CREATE`, пока функцией ещё владел `lmapp_migrator`) не нужно повторять
здесь — `PUBLIC`-грант уже снят до передачи владения; `RESET ROLE`
возвращает сессию к `lmapp_migrator` для всех последующих шагов миграции
(startup gates, следующие объекты и т.д.), не оставляя сессию «залипшей» в
контексте владельца.

**SLA.** Условие `status <> 'completed'` **не используется** — корректный
terminal `failed` до дедлайна является полностью завершённой обработкой, а
не просроченной незавершённой задачей, и не должен создавать ложное
нарушение SLA. `mark_post_launch_refresh_intent_sla_breach` не трогает
`status`/`current_analysis_snapshot_id` и меняет ровно одно поле, ровно
один раз на intent (условие `sla_breach_reported_at IS NULL` в `WHERE`
делает повторный вызов монитора для уже отмеченного breach безвредным
no-op, `RETURN false`, а не ошибкой) — минимальный безопасный результат,
без доступа к произвольной мутации строки. SLA-монитор переиспользует роль
`lmapp_analysis_worker` (доп. §12) — отдельная роль для монитора не
заводится, так как единственное действие монитора — вызов этой одной
функции. Terminal `failed`, зафиксированный до дедлайна, никогда не
порождает alert. Успешная Campaign **никогда** не откатывается из-за
ошибки refresh или SLA breach — оба сигнала (`status`,
`sla_breach_reported_at`) живут исключительно в `post_launch_refresh_intent`
и никак не влияют на `campaign_current_state_projection`/
`campaign_event_log`.

### 11. Evidence dataset revocation и freshness projection

PRODUCT v0.3 §6.4/§12.3 требует: платформа может отозвать конкретную
ненулевую `evidence_dataset_revision` только через авторизованную
операционную команду; операционный `evidence_revocation_reason_code`, время
и privacy-safe actor хранятся в защищённом audit trail и не выдаются
обычному пользователю; отзыв необратим; terminal Snapshot физически не
меняется; приоритет причин `stale` — `evidence_revoked → campaign_mismatch
→ revision_changed`; обычный API возвращает только публичный
`freshness_reason`. Четвёртая версия ADR не содержала этого механизма
вовсе; вводится migration 010 (§13) с отдельной ролью
`lmapp_evidence_revocation_writer` (§12) и отдельным CLI (§14).

```
CREATE TABLE leasemind_app.evidence_dataset_revocation (
  evidence_dataset_revision       char(64) PRIMARY KEY
    CHECK (evidence_dataset_revision ~ '^[0-9a-f]{64}$'),
  evidence_revocation_reason_code text NOT NULL
    CHECK (evidence_revocation_reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'),
  revoked_at                      timestamptz NOT NULL DEFAULT clock_timestamp(),
  revoked_by_actor_ref            text NOT NULL
    CHECK (length(revoked_by_actor_ref) > 0 AND length(revoked_by_actor_ref) <= 200)
);
```

`PRIMARY KEY` на `evidence_dataset_revision` сам по себе гарантирует, что
отозвать можно только конкретную, ненулевую revision — `NULL` не может быть
значением primary key, а `CHECK` требует ровно 64-символьный lowercase hex.
`evidence_revocation_reason_code` ограничен тем же машинным
snake-case-в-верхнем-регистре форматом, что и существующие стабильные коды
проекта (`ANALYSIS_DATASET_UNAVAILABLE` и т.п.). `revoked_by_actor_ref` —
только privacy-safe ссылка на инициатора (не raw идентичность), с тем же
ограничением длины, что `idempotency_key` (200 символов).

**Append-only** — тот же паттерн, что `analysis_snapshot_idempotency_mapping`
(§5): ни одна легитимная причина для `UPDATE`/`DELETE` не существует,
отзыв необратим для конкретной revision по конструкции таблицы, а не только
по соглашению приложения:

```
CREATE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'EVIDENCE_DATASET_REVOCATION_IMMUTABLE: % is not permitted on leasemind_app.evidence_dataset_revocation', TG_OP;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation() FROM PUBLIC;

CREATE TRIGGER evidence_dataset_revocation_reject_update
  BEFORE UPDATE ON leasemind_app.evidence_dataset_revocation
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation();

CREATE TRIGGER evidence_dataset_revocation_reject_delete
  BEFORE DELETE ON leasemind_app.evidence_dataset_revocation
  FOR EACH ROW EXECUTE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation();
```

Никаких FK **на** эту таблицу ни от кого нет (сверка выполняется через
`SELECT`/`EXISTS` по значению `evidence_dataset_revision`, не через
ссылочную целостность) — соответственно, `CASCADE` в down migration (§13)
не требуется и не используется: таблица самодостаточна.

Если доказательная база впоследствии исправлена, исправленные данные
получают новую `evidence_dataset_revision` (новый hash) — реабилитации
отозванной revision не существует ни как операции, ни как состояния.

**Freshness projection — единый read-time view, явный `security_invoker`.**
`freshness_status`/`freshness_reason` не хранятся нигде (как и в четвёртой
версии) — вычисляются при чтении. Приоритет при нескольких одновременно
применимых причинах: `evidence_revoked → campaign_mismatch →
revision_changed`; `NULL`/`current` — только если ни одна причина не
применима **и** текущая строка ТЗ была однозначно найдена (fail closed,
ниже).

```
CREATE VIEW leasemind_app.analysis_snapshot_freshness_projection
WITH (security_invoker = true)
AS
SELECT
  s.analysis_snapshot_id,
  CASE
    WHEN revoked.evidence_dataset_revision IS NOT NULL THEN 'stale'
    WHEN s.analysis_kind = 'post_launch_refresh' AND link.campaign_id IS NULL THEN 'stale'
    WHEN current_ta.revision IS NULL THEN 'stale'
    WHEN s.source_revision <> current_ta.revision THEN 'stale'
    ELSE 'current'
  END AS freshness_status,
  CASE
    WHEN revoked.evidence_dataset_revision IS NOT NULL THEN 'evidence_revoked'
    WHEN s.analysis_kind = 'post_launch_refresh' AND link.campaign_id IS NULL THEN 'campaign_mismatch'
    WHEN current_ta.revision IS NULL THEN 'revision_changed'
    WHEN s.source_revision <> current_ta.revision THEN 'revision_changed'
    ELSE NULL
  END AS freshness_reason
FROM leasemind_app.analysis_snapshot s
LEFT JOIN leasemind_app.evidence_dataset_revocation revoked
  ON revoked.evidence_dataset_revision = s.evidence_dataset_revision
LEFT JOIN leasemind_app.campaign_subject_link_projection link
  ON s.analysis_kind = 'post_launch_refresh'
 AND link.campaign_id = s.campaign_id AND link.scenario = s.scenario
 AND link.technical_assignment_id = s.technical_assignment_id AND link.source_revision = s.source_revision
LEFT JOIN LATERAL (
  SELECT revision FROM leasemind_app.property
   WHERE s.scenario = 'need_tenant' AND property_id = s.technical_assignment_id
  UNION ALL
  SELECT revision FROM leasemind_app.tenant_request
   WHERE s.scenario = 'need_property' AND tenant_request_id = s.technical_assignment_id
) current_ta ON true;
```

**`WITH (security_invoker = true)` обязателен и не подразумевается по
умолчанию.** Предыдущая версия ADR утверждала, что PostgreSQL VIEW
«по умолчанию выполняется с правами того, кто её запрашивает» — это
**фактически неверно** и удалено из этой версии: без явного
`security_invoker = true` (доступно начиная с PostgreSQL 15) обычный
`CREATE VIEW` по умолчанию исполняется с правами **владельца VIEW**, а не
вызывающей роли (поведение, аналогичное `SECURITY DEFINER` у функций) —
именно поэтому раньше `lmapp_api_reader` мог бы прочитать через такую VIEW
данные, на которые у него самого нет прямого гранта, если бы владелец VIEW
их имел. С `security_invoker = true` VIEW явно исполняется с правами
вызывающей роли, поэтому `lmapp_api_reader` использует эту проекцию **в
рамках своих же грантов** на `property`/`tenant_request`/
`campaign_subject_link_projection`/`analysis_snapshot` (уже выданы, §12)
плюс новый узкий `SELECT (evidence_dataset_revision)` на
`evidence_dataset_revocation` (§12, §14) — без этого явного флага запрос к
VIEW завершился бы ошибкой недостатка прав только в отсутствие
соответствующих грантов у владельца, но не гарантировал бы, что
вызывающая роль ограничена именно своими правами, а не правами владельца.
Оба GET-эндпоинта (доп. §11.2) и launch-time check (§8) применяют одну и
ту же нормативную последовательность приоритета через эту единственную
проекцию — логика приоритета не дублируется в нескольких местах
TypeScript-кода.

**Fail closed при не найденной текущей строке ТЗ.** Если `current_ta`
(LATERAL-подзапрос) не находит ни одной строки — `technical_assignment_id`
Snapshot'а больше не резолвится ни в `property`, ни в `tenant_request`
для ожидаемого `scenario` (например, запись удалена вне штатного потока,
либо `scenario` самого Snapshot'а рассогласован) — `current_ta.revision
IS NULL`; без явной ветки для этого случая `s.source_revision <>
current_ta.revision` дало бы SQL `NULL` (сравнение с `NULL` — не `TRUE` и
не `FALSE`), `CASE` пропустил бы обе ветки `WHEN` и **тихо провалился бы в
`ELSE 'current'`** — fail open там, где это недопустимо. Явная ветка
`WHEN current_ta.revision IS NULL THEN 'stale'`/`'revision_changed'`
(добавленная в этой версии, до сравнения `source_revision`) закрывает эту
дыру: отсутствие текущей строки ТЗ всегда классифицируется как `stale`, а
не как `current` по умолчанию.

**Фильтрация по `scenario` в LATERAL/UNION.** Предыдущая версия
join'ила `current_ta` без учёта `scenario` — оба ветки `UNION ALL`
(`property`/`tenant_request`) выполнялись безусловно по одному и тому же
`technical_assignment_id`. Поскольку `property_id` и `tenant_request_id` —
независимые UUID-пространства, теоретическое совпадение значения между
`property_id` одной сущности и `tenant_request_id` другой (коллизия, а не
конструктивная гарантия) могло бы заставить LATERAL найти строку в
**чужой** таблице и вернуть её `revision`, если "своя" строка отсутствует
— неверная кросс-таблица могла бы замаскировать `revision_changed` под
`current`. Каждая ветка `UNION ALL` теперь дополнительно фильтрует по
`s.scenario` (`need_tenant` → только `property`, `need_property` — только
`tenant_request`) — той же самой связке `scenario ↔ property_id/tenant_request_id`,
что уже установлена как инвариант в §2 и защищена `CHECK`-ом на
`analysis_snapshot`.

**Contacts и Launch блокируются для любой причины `stale`** — не только
`evidence_revoked`: launch-time check (§8) уже проверяет отсутствие отзыва
явно (для атомарности внутри транзакции запуска, где VIEW неудобен), а
чтение Snapshot вне launch всегда идёт через
`analysis_snapshot_freshness_projection`, откуда `freshness_status=stale`
по любой причине уже приводит к блокировке Contacts/Launch на уровне
frontend-правил (доп. §4, §15.1).

### 12. Least privilege

Шесть runtime-ролей вместо прежних четырёх/трёх, плюс одна не-runtime
NOLOGIN-роль: `lmapp_analysis_writer` (синхронный HTTP-путь Analysis,
включая explicit retry), `lmapp_analysis_worker` (**новая** — асинхронный
`post_launch_refresh` worker и SLA-монитор), `lmapp_campaign_writer`
(существующая, расширяется), `lmapp_api_reader` (существующая,
расширяется), `lmapp_evidence_revocation_writer` (**новая** — только
operational CLI, §14), и `lmapp_post_launch_refresh_owner` (**новая,
bootstrap-provisioned NOLOGIN** — владелец восьми объектов:
`post_launch_refresh_intent`, `enforce_post_launch_refresh_intent_transition`
и шести command-функций §10; не подключается никогда, не является
runtime-ролью в смысле обслуживания HTTP/worker-трафика). **Уточнение
относительно предыдущей версии** (повторный SQL-аудит нашёл ложное
утверждение): эта роль **имеет** узкий набор входящих `GRANT` — постоянный
`USAGE` на схему и точечный колоночный `SELECT` на `analysis_snapshot`/
`analysis_snapshot_idempotency_mapping` (доп. §10 "Консолидированная
передача владения", ниже), необходимый её же `SECURITY DEFINER` функциям,
чтобы не читать эти внешние таблицы через `SELECT *`/table-wide грант;
временный `CREATE` на схему выдаётся и отзывается в рамках одной и той же
миграции (нужен только на момент передачи владения таблицей, §13). Она
по-прежнему **не выдаёт** ни одного `GRANT` другим ролям от своего имени
вне явного `SET ROLE`-контекста самой миграции (§10, §13) и не получает
`LOGIN`/`CONNECT`/`TEMP`. `lmapp_ta_writer` не получает ни одного нового
гранта нигде в этом ADR.

**Гранты на `property`/`tenant_request`/`analysis_snapshot`/
`analysis_snapshot_idempotency_mapping` для `lmapp_analysis_writer` и
`lmapp_analysis_worker` — одинаковой формы, но выданы раздельными `GRANT`,
а не одной общей командой.** В предыдущей версии оба списка ролей стояли
через запятую в одних и тех же операторах `GRANT`, что расходилось с
разбиением на миграции (§13, correction 8): `lmapp_analysis_worker` как
роль появляется только в migration 009 вместе с `post_launch_refresh_intent`,
поэтому её гранты на core-таблицы физически не могут быть частью одного
`GRANT`-оператора, который целиком выполняется в migration 008. Ниже —
раздельные операторы: помеченные **(008)** входят в
`008_analysis_snapshot.up.sql`, помеченные **(009)** — в
`009_post_launch_refresh_intent.up.sql` (§13).

```
-- (008)
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_writer;
GRANT EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb) TO lmapp_analysis_writer;
GRANT EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb) TO lmapp_analysis_writer;
-- (010)
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_evidence_revocation_writer;
-- (009)
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.jsonb_object_key_count(jsonb) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.is_valid_metric_envelope(jsonb) TO lmapp_analysis_worker;

-- (008)
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
-- (009) — идентичный список колонок, отдельный оператор, отдельная миграция
GRANT SELECT (
  property_id, revision, lifecycle_status, created_at, updated_at,
  property_type, property_country_code, property_region, property_city, property_districts,
  property_area_sqm, property_floor, property_total_floors, property_entrance_type, property_condition,
  property_available_from, property_monthly_rent_rub, property_operating_expenses_included,
  property_utilities_included, property_security_deposit_rub, property_min_lease_months,
  property_allowed_business_categories, property_excluded_business_categories,
  property_target_tenant_categories, property_power_kw, property_ceiling_height_m, property_features,
  property_parking_spaces, property_loading_access, property_access_mode, property_deal_priority
) ON leasemind_app.property TO lmapp_analysis_worker;

-- (008)
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
-- (009)
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
) ON leasemind_app.tenant_request TO lmapp_analysis_worker;
```

Исключены везде: `idempotency_key`, `schema_version`, `has_exact_address`,
все `*_other`/`*_additional_requirements` колонки, `property_protected_address`
целиком (гранта нет вовсе, ни у одной из двух ролей). Ни одна не получает
доступ к `campaign_event_log`, `campaign_stream_head`, `schema_migrations`.

**`analysis_snapshot` — точный колоночный `SELECT`/`INSERT`/`UPDATE`, той же
формы для обеих ролей, но раздельными операторами по той же причине**
(`idempotency_key`/`command_hash` исключены из этого списка навсегда — они
больше не колонки этой таблицы, §4):

```
-- (008)
GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;
-- (009)
GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_worker;

-- (008)
GRANT INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;
-- (009)
GRANT INSERT (
  analysis_snapshot_id, property_id, tenant_request_id, source_revision, scenario,
  analysis_kind, campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period, input_fingerprint
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_worker;

-- (008)
GRANT UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_writer;
-- (009)
GRANT UPDATE (
  status, generated_at, results, failure, evidence_as_of, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_analysis_worker;
```

`INSERT` не включает `evidence_dataset_revision`/`evidence_as_of`/`results`/
`failure`/`generated_at`/`created_at`: строка вставляется как `pending`
(§7), эти поля заполняются только последующим `UPDATE` в той же
транзакции. `technical_assignment_id` не входит ни в один список —
PostgreSQL не разрешает явно указывать значение для `GENERATED ALWAYS`
колонки.

**`analysis_snapshot_idempotency_mapping` (§5) — точный колоночный `SELECT`/
`INSERT`, без `UPDATE`/`DELETE`; `accepted_at` не передаётся приложением
(есть `DEFAULT`); раздельными операторами по той же причине.** Table-wide
гранты запрещены прямым требованием этой задачи — в отличие от
`campaign_subject_link_projection` в предыдущих версиях, здесь колоночный
список короткий и не требует исключения:

```
-- (008)
GRANT SELECT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_writer;
-- (009)
GRANT SELECT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_worker;

-- (008)
GRANT INSERT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_writer;
-- (009)
GRANT INSERT (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_analysis_worker;
```

`lmapp_api_reader`, `lmapp_campaign_writer`, `lmapp_ta_writer` **не
получают ни одного права** на эту таблицу — ни `SELECT`, ни `INSERT`: ни
чтение Snapshot, ни launch-time проверка, ни save-draft ТЗ никогда не
резолвят `idempotency_key`, только `analysis_snapshot_id`/логический ключ
напрямую (§4, §8).

**`post_launch_refresh_intent` (§10) — ровно один прямой table-грант
(`INSERT` для `lmapp_campaign_writer`, создание intent атомарно с launch,
§8) и ни одного прямого гранта `SELECT`/`UPDATE`/`DELETE` ни для одной
runtime-роли, включая `lmapp_analysis_worker`. Всё изменение состояния —
исключительно через `EXECUTE` на шесть `SECURITY DEFINER` функций §10,
принадлежащих `lmapp_post_launch_refresh_owner`. Оба вида грантов ниже
выданы не `lmapp_migrator` напрямую, а `lmapp_migrator`, выполнившим `SET
ROLE lmapp_post_launch_refresh_owner` (§10 "Консолидированная передача
владения") — после передачи владения восемью объектами `lmapp_migrator`
физически не может выдать `GRANT` на них без этого:**

```
-- (009), выполняется под SET ROLE lmapp_post_launch_refresh_owner (§10)
GRANT INSERT (
  campaign_id, property_id, tenant_request_id, scenario, source_revision,
  analysis_kind, status, launched_at
) ON leasemind_app.post_launch_refresh_intent TO lmapp_campaign_writer;

-- (009), тот же SET ROLE-контекст; сами функции и их REVOKE ALL FROM PUBLIC
-- (выданный ДО передачи владения, ещё от lmapp_migrator) определены в §10
GRANT EXECUTE ON FUNCTION leasemind_app.claim_post_launch_refresh_intent(text, integer) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.renew_post_launch_refresh_intent_lease(uuid, text, integer) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.complete_post_launch_refresh_intent(uuid, text, integer, uuid) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.fail_post_launch_refresh_intent(uuid, text, integer, uuid) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.mark_post_launch_refresh_intent_sla_breach(uuid) TO lmapp_analysis_worker;
GRANT EXECUTE ON FUNCTION leasemind_app.request_post_launch_refresh_retry(uuid, uuid) TO lmapp_analysis_writer;
```

`lmapp_campaign_writer` получает только `INSERT` — ни `SELECT`, ни
`UPDATE`: launch не читает и не меняет intent после создания.
`lmapp_analysis_worker` не имеет ни `SELECT`, ни `UPDATE` на саму таблицу
ни в каком объёме (в отличие от предыдущей версии, где колоночный `UPDATE`
формально ограничивал набор полей, но всё ещё оставался прямым table-level
доступом) — единственный способ прочитать/изменить intent из worker'а —
пять `EXECUTE`-грантов выше, каждый из которых внутри себя жёстко
ограничен одним конкретным переходом и fencing-проверкой (§10).
Среди command-функций `lmapp_analysis_writer` получает `EXECUTE` только на
`request_post_launch_refresh_retry` — ни на одну из пяти
worker-функций, ни на саму таблицу. Отдельно writer/worker имеют `EXECUTE`
на две чистые immutable validation-функции §9: это необходимо PostgreSQL
для выполнения `CHECK` при разрешённом `INSERT`/`UPDATE` Snapshot и не даёт
доступа к данным или изменению состояния. Ни одна из шести command-функций не выдана
`PUBLIC` (`REVOKE ALL ... FROM PUBLIC`, §10, повторено при каждой функции,
выполнено ещё до передачи владения — владелец на момент `REVOKE` был
`lmapp_migrator`, что для `REVOKE ... FROM PUBLIC` не имеет значения).

**Собственные внешние гранты `lmapp_post_launch_refresh_owner`** (не
runtime-роль, но не «ноль входящих грантов», исправление ложного
утверждения предыдущей версии, доп. §10 "Консолидированная передача
владения"):

```
GRANT USAGE ON SCHEMA leasemind_app TO lmapp_post_launch_refresh_owner;  -- постоянный

GRANT SELECT (analysis_snapshot_id, status, failure, technical_assignment_id, source_revision, analysis_kind, campaign_id, calculation_attempt)
  ON leasemind_app.analysis_snapshot TO lmapp_post_launch_refresh_owner;
GRANT SELECT (analysis_snapshot_id, retry_of_analysis_snapshot_id)
  ON leasemind_app.analysis_snapshot_idempotency_mapping TO lmapp_post_launch_refresh_owner;

-- GRANT CREATE ON SCHEMA leasemind_app TO lmapp_post_launch_refresh_owner; -- временный,
-- выдан и отозван в рамках одной и той же миграции 009 (§10, §13) — не сохраняется
```

Ровно восемь внешних колонок (`analysis_snapshot`) плюс две (`mapping`) —
не больше, чем реально читают три `SELECT`-запроса внутри
`request_post_launch_refresh_retry` (§10) и два `EXISTS`-условия внутри
`complete`/`fail_post_launch_refresh_intent`; `property`/`tenant_request`/
`campaign_event_log`/audit-колонки `evidence_dataset_revocation` — вне
allowlist этой роли, как и у любой другой.

**`evidence_dataset_revocation` (§11) — только `SELECT (evidence_dataset_revision)`
для пяти читающих ролей; `INSERT` только для `lmapp_evidence_revocation_writer`:**

```
GRANT SELECT (evidence_dataset_revision) ON leasemind_app.evidence_dataset_revocation
  TO lmapp_api_reader, lmapp_campaign_writer, lmapp_analysis_writer, lmapp_analysis_worker,
     lmapp_evidence_revocation_writer;

GRANT INSERT (evidence_dataset_revision, evidence_revocation_reason_code, revoked_by_actor_ref)
  ON leasemind_app.evidence_dataset_revocation TO lmapp_evidence_revocation_writer;
```

Ни одна из пяти читающих ролей не получает `SELECT` на
`evidence_revocation_reason_code`, `revoked_at` или `revoked_by_actor_ref`
— эти три колонки читает только сам `lmapp_evidence_revocation_writer` (и
то не через `SELECT`-грант выше, а по праву владельца собственной вставки в
рамках одной CLI-сессии; постоянного `SELECT`-доступа к ним не выдаётся
никому, включая саму эту роль — CLI перед отзывом лишь проверяет **факт**
существования отзыва через `SELECT(evidence_dataset_revision)`, §14).
Обычный API возвращает пользователю только публичный
`freshness_reason=evidence_revoked` (§11) — ни один из трёх audit-полей
физически недостижим ни для одной HTTP-обслуживающей роли.

**`lmapp_api_reader` (существующая, расширяется) — только безопасные
response-колонки для двух Analysis GET endpoints:**

```
GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, source_revision, scenario, analysis_kind,
  campaign_id, calculation_attempt, status, schema_version, method_version,
  country_code, currency, locale, area_unit, rent_period,
  input_fingerprint, evidence_dataset_revision, evidence_as_of,
  results, failure, created_at, generated_at
) ON leasemind_app.analysis_snapshot TO lmapp_api_reader;

GRANT SELECT ON leasemind_app.analysis_snapshot_freshness_projection TO lmapp_api_reader;
```

Список идентичен грантам `lmapp_analysis_writer`/`lmapp_analysis_worker` на
`analysis_snapshot` (см. выше) минус `property_id`/`tenant_request_id`
(сырые FK — `lmapp_api_reader` получает только generated
`technical_assignment_id`, как и в четвёртой версии). `SELECT` на
`analysis_snapshot_freshness_projection` — новый грант; поскольку это VIEW
с `SECURITY INVOKER` (§11), он требует, чтобы у `lmapp_api_reader` уже были
собственные гранты на все таблицы, которые VIEW соединяет
(`property`/`tenant_request`/`campaign_subject_link_projection`/
`evidence_dataset_revocation` — все уже выданы этой роли ранее и в §11).

**`lmapp_campaign_writer` (существующая, расширяется) — только колонки для
launch/replay-проверки и `INSERT` на два новых объекта:**

```
GRANT SELECT (
  analysis_snapshot_id, technical_assignment_id, scenario, source_revision, analysis_kind,
  status, campaign_id, evidence_dataset_revision
) ON leasemind_app.analysis_snapshot TO lmapp_campaign_writer;
```

Без `INSERT`/`UPDATE` на `analysis_snapshot` — только `SELECT` для проверки
из §8. `INSERT` на `campaign_subject_link_projection` и
`post_launch_refresh_intent` — уже описаны в §3/§10 соответственно.

**Startup gates — fail-closed, точный allowlist, отрицательные проверки.**
Каждая из пяти ролей получает собственную `verifyRuntime...Privileges`
функцию (`dbPrivilegePolicy.ts`), запускаемую один раз при старте
соответствующего процесса (HTTP API — четыре роли; отдельный worker-процесс
— только `lmapp_analysis_worker`; отдельный CLI — только
`lmapp_evidence_revocation_writer`), с тем же fail-closed принципом, что уже
установлен для существующих ролей. Для каждой таблицы, где роль должна
иметь **только** колоночные права, проверка утверждает **три** независимых
условия одновременно — одного недостаточно:

1. **Отсутствие table-wide granta** — `has_table_privilege(current_user,
   '<table>', 'SELECT'/'INSERT'/'UPDATE') = false` для каждой таблицы этого
   ADR (`property`, `tenant_request`, `analysis_snapshot`,
   `analysis_snapshot_idempotency_mapping`, `post_launch_refresh_intent`,
   `evidence_dataset_revocation`) — эта проверка запрещена task'ом как
   единственная (table-wide гранты на mapping-таблицу запрещены прямо), и
   в этом ADR **нет ни одного** намеренного table-wide исключения (в
   отличие от `campaign_subject_link_projection` в предыдущих версиях,
   которая сохраняет table-wide `SELECT`/`INSERT` для
   `lmapp_analysis_writer`/`lmapp_campaign_writer` — единственное
   оставшееся исключение, обоснование не изменилось: сама таблица уже узкая
   производная проекция). Для `post_launch_refresh_intent` эта проверка
   теперь **безусловна для всех ролей без исключения**, включая
   `lmapp_analysis_worker`, — ни `SELECT`, ни `UPDATE`, ни `INSERT` (кроме
   `lmapp_campaign_writer`) не выданы никому.
2. **Точный allowlist** — `has_column_privilege(...)` — `true` для каждой
   колонки из allowlist этой роли на этой таблице.
3. **Отсутствие лишних привилегий** — подсчёт колонок в
   `information_schema.column_privileges` (`grantee = current_user`) равен
   длине ожидаемого allowlist.

Для шести `SECURITY DEFINER` функций §10 проверка отдельная и не
column-based: `has_function_privilege(current_user, '<function signature>',
'EXECUTE')` — точный allowlist функций на роль, без исключений.

**Обязательные отрицательные проверки** (fail closed при их нарушении):

- `lmapp_analysis_writer`/`lmapp_analysis_worker`: нет доступа к
  `property_protected_address`, `campaign_event_log`, `campaign_stream_head`,
  `schema_migrations`, ни одной из трёх audit-колонок
  `evidence_dataset_revocation`; **ни у одной из двух ролей нет ни
  `SELECT`, ни `UPDATE`, ни `DELETE` на `post_launch_refresh_intent`** —
  проверяется явно и одинаково для обеих (единственный прямой table-грант
  на эту таблицу принадлежит `lmapp_campaign_writer` и это только
  `INSERT`). `EXECUTE` на `request_post_launch_refresh_retry` — есть
  только у `lmapp_analysis_writer` (у `lmapp_analysis_worker` — явно
  проверяется **отсутствие**). `EXECUTE` на
  `claim_post_launch_refresh_intent`/`renew_post_launch_refresh_intent_lease`/
  `complete_post_launch_refresh_intent`/`fail_post_launch_refresh_intent`/
  `mark_post_launch_refresh_intent_sla_breach` — есть только у
  `lmapp_analysis_worker` (у `lmapp_analysis_writer` — явно проверяется
  **отсутствие** каждой из пяти).
- `lmapp_campaign_writer`: нет `INSERT`/`UPDATE` на `analysis_snapshot`, нет
  доступа к `analysis_snapshot_idempotency_mapping` ни в каком объёме, нет
  `SELECT`/`UPDATE` на `post_launch_refresh_intent` (только `INSERT`), нет
  `EXECUTE` ни на одной из шести `SECURITY DEFINER` функций §10, нет
  `INSERT` на `evidence_dataset_revocation`.
- `lmapp_api_reader`: нет `INSERT`/`UPDATE` нигде, нет доступа к
  `analysis_snapshot_idempotency_mapping`, `post_launch_refresh_intent`
  (ни table-грантов, ни `EXECUTE` ни на одной из шести функций), трём
  audit-колонкам `evidence_dataset_revocation`.
- `lmapp_evidence_revocation_writer`: нет доступа ни к `analysis_snapshot`,
  ни к `analysis_snapshot_idempotency_mapping`, ни к
  `post_launch_refresh_intent` (ни table-грантов, ни `EXECUTE`), ни к
  `property`/`tenant_request` (protected или нет), ни к
  `campaign_event_log` — единственные два объекта в её allowlist:
  `evidence_dataset_revocation` (колоночно) и `USAGE` на схему.
- `lmapp_ta_writer`: явно проверяется **отсутствие** любого нового гранта
  на все объекты этого ADR — этот ADR не расширяет её права нигде.
- **`lmapp_post_launch_refresh_owner` никогда не проходит ни один
  runtime-gate** — она не читает ни один connection string (§12, ниже) и
  не обслуживает трафик; единственная применимая к ней проверка — за
  пределами `dbPrivilegePolicy.ts`, в тесте миграций (§13): роль
  существует (bootstrap-provisioned, **не** созданная migration 009,
  correction 3), `NOLOGIN`, владеет ровно восемью объектами
  (`post_launch_refresh_intent`, `enforce_post_launch_refresh_intent_transition`
  и шесть command-функций §10) — не семью, точный подсчёт: 1 таблица + 1
  transition-trigger function + 6 command-функций; имеет ровно
  документированный минимальный набор входящих грантов (`USAGE` на схему,
  колоночный `SELECT` на `analysis_snapshot`(8 колонок)/
  `analysis_snapshot_idempotency_mapping`(2 колонки), без временного
  `CREATE` на схему после завершения миграции) — не «ноль грантов»; не
  выдала ни одного `GRANT` другим ролям вне явного `SET ROLE`-контекста
  самой миграции 009 (§10, §13); никогда не получает `CONNECT`.

Каждая проверка отклоняет запуск при любом лишнем или отсутствующем праве,
включая любую ошибку самой проверки — fail closed, не fail open.

**Provisioning.** Две новые фиксированные константы в `provisionRoles.ts`:
`ANALYSIS_WORKER_ROLE = 'lmapp_analysis_worker'` и
`EVIDENCE_REVOCATION_WRITER_ROLE = 'lmapp_evidence_revocation_writer'`, тот
же идемпотентный цикл `CREATE ROLE`/безусловный `ALTER ROLE ... WITH LOGIN
PASSWORD ... NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
NOINHERIT`, включённый в тот же allow-list `REVOKE CONNECT, TEMP, CREATE ON
DATABASE ... FROM PUBLIC` / точечный `GRANT CONNECT`. **Отдельно и вне этого цикла, и вне migration 009** —
`lmapp_post_launch_refresh_owner`: не LOGIN-роль, не имеет пароля, никогда
не получает `CONNECT`/`TEMP`, не участвует в цикле provisioning паролей.
**Исправление повторного SQL-аудита**: `lmapp_migrator` имеет атрибут
`NOCREATEROLE` (тот же `provisionRoles.ts`, не переопределяется этим ADR)
— физически не может выполнить `CREATE ROLE` внутри migration 009, поэтому
роль создаётся **bootstrap-шагом**, выполняемым отдельной идентичностью с
более высокими правами (`LEASEMIND_BOOTSTRAP_DATABASE_URL`, уже
существующая граница), **до** первого запуска migration 009, идемпотентно:

```sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lmapp_post_launch_refresh_owner') THEN
    CREATE ROLE lmapp_post_launch_refresh_owner
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

ALTER ROLE lmapp_post_launch_refresh_owner WITH NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD NULL;

GRANT lmapp_post_launch_refresh_owner TO lmapp_migrator WITH ADMIN FALSE;
GRANT lmapp_post_launch_refresh_owner TO lmapp_migrator WITH INHERIT FALSE;
GRANT lmapp_post_launch_refresh_owner TO lmapp_migrator WITH SET TRUE;
```

Три последовательных `GRANT` задают точный membership-контракт PostgreSQL 18:
`ADMIN FALSE, INHERIT FALSE, SET TRUE`. В синтаксисе PostgreSQL каждая
membership-опция задаётся отдельным оператором; последующие `GRANT` обновляют
существующее членство, сохраняя ранее заданные значения. Раздельные опции
доступны с PostgreSQL 16. `lmapp_migrator` может явно `SET ROLE` в owner-роль для
контролируемых DDL-операций (§10 "Консолидированная передача владения"),
но не наследует её привилегии автоматически в обычной сессии. Migration
009 **не выполняет `CREATE ROLE`** — только проверяет контракт (существование,
`NOLOGIN`, `SET`-membership `lmapp_migrator`) и fail closed, если он не
выполнен (§10). Down migration 009 симметрично **не выполняет `DROP
ROLE`** — роль provisioned вне миграций, полный откат её не удаляет (§13).

**Пересчитано полностью, не скопировано из предыдущей версии.** После
добавления всех новых ролей — **восемь** application LOGIN identities:
`lmapp_migrator`, `lmapp_maintainer`, `lmapp_api_reader`,
`lmapp_campaign_writer`, `lmapp_ta_writer`, `lmapp_analysis_writer`,
`lmapp_analysis_worker`, `lmapp_evidence_revocation_writer` — без
изменений относительно предыдущей версии, так как
`lmapp_post_launch_refresh_owner` **не LOGIN и не считается** ни
application identity, ни connection string: девятая по счёту
Postgres-роль этого ADR, но не девятая LOGIN-идентичность. Если отдельно
считать bootstrap/admin-идентичность — по-прежнему **девять** различимых
connection strings: `DATABASE_URL`, `LEASEMIND_MIGRATION_DATABASE_URL`,
`LEASEMIND_MAINTENANCE_DATABASE_URL`, `LEASEMIND_COMMAND_DATABASE_URL`,
`LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL`,
`LEASEMIND_ANALYSIS_DATABASE_URL`, `LEASEMIND_ANALYSIS_WORKER_DATABASE_URL`
(используется **только** отдельным worker-процессом, никогда HTTP API),
`LEASEMIND_EVIDENCE_REVOCATION_DATABASE_URL` (используется **только**
отдельным CLI, §14), `LEASEMIND_BOOTSTRAP_DATABASE_URL`. Два новых пароля:
`LEASEMIND_ANALYSIS_WORKER_PASSWORD`,
`LEASEMIND_EVIDENCE_REVOCATION_WRITER_PASSWORD` — только для provisioning;
`lmapp_post_launch_refresh_owner` не добавляет ни одного нового пароля или
connection string.

**Отдельный entrypoint для worker'а и для CLI.** `lmapp_analysis_worker`
запускается собственным процессом/entrypoint'ом (например,
`apps/api/src/worker.ts` + `post-launch-refresh-worker-cli.ts`, по образцу
уже существующих `migrate-cli.ts`/`seed-cli.ts`/`provision-roles-cli.ts`),
читающим `LEASEMIND_ANALYSIS_WORKER_DATABASE_URL`; `server.ts` (обычный
HTTP API) **никогда** не читает эту переменную и не создаёт пул на её
основе — так же, как сегодня `server.ts` никогда не читает
`LEASEMIND_MIGRATION_DATABASE_URL`. Симметрично, `lmapp_evidence_revocation_writer`
используется исключительно отдельным CLI (§14) — ни `server.ts`, ни
`worker.ts` его не читают.

### 13. Migration plan

Три отдельные, чисто additive миграции (файлы сейчас не создаются; номера
008/009/010 свободны — в репозитории на любой ветке миграций с номером ≥008
не существует). Разделение — осознанное решение Lead Architect: `008`
закрывает ядро Analysis Snapshot и идемпотентность (нужны немедленно, любой
Analysis-запрос), `009` — durable refresh (отдельная роль/blast radius,
может внедряться отдельным релизом), `010` — evidence revocation (ещё более
узкая, редко используемая, наиболее чувствительная по blast radius роль).

**`008_analysis_snapshot.up.sql` — только ядро и только существующие
core-роли (`lmapp_analysis_writer`, `lmapp_campaign_writer`,
`lmapp_api_reader`); `lmapp_analysis_worker` этой миграцией не упоминается
и не получает ни одного гранта — её собственные core-table права выданы в
009 (correction 8, ниже):**

1. `CREATE FUNCTION leasemind_app.jsonb_object_key_count` (§9) и отзыв
   `PUBLIC EXECUTE`; это совместимый с PostgreSQL 18.4 helper для точного
   подсчёта ключей JSON object без запрещённого subquery внутри `CHECK`.
2. `CREATE FUNCTION leasemind_app.is_valid_metric_envelope` (§9).
3. `CREATE TABLE leasemind_app.campaign_subject_link_projection` (§3) —
   без FK на `analysis_snapshot` (она ещё не существует).
4. `CREATE TABLE leasemind_app.analysis_snapshot` (§4) — включая составной
   FK на `campaign_subject_link_projection`, опорные `UNIQUE`
   `analysis_snapshot_pre_launch_authorization_unique` и
   `analysis_snapshot_post_launch_identity_unique` (последний — опора для
   составного FK `post_launch_refresh_intent_current_snapshot_identity_fk`,
   добавляемого только в 009, но сам constraint — часть определения
   таблицы 008, никакой зависимости от 009 не создаёт), все `CHECK`
   (включая `failure`-shape и `results`-shape), `calculation_attempt`, **без**
   `idempotency_key`/`command_hash` (отсутствуют в этой версии, §4).
5. `ALTER TABLE leasemind_app.campaign_subject_link_projection ADD CONSTRAINT
   campaign_subject_link_projection_analysis_snapshot_fk ...` — отложенная
   составная cross-table FK (§8), теперь обе таблицы существуют.
6. `CREATE TABLE leasemind_app.analysis_snapshot_idempotency_mapping` (§5).
7. `CREATE FUNCTION leasemind_app.reject_analysis_snapshot_immutable_mutation`
   + триггеры на `analysis_snapshot` (§4).
8. `CREATE FUNCTION leasemind_app.reject_analysis_snapshot_idempotency_mapping_mutation`
   + триггеры на `analysis_snapshot_idempotency_mapping` (§5).
9. Частичные уникальные индексы: `analysis_snapshot_pre_launch_attempt_unique`,
   `analysis_snapshot_post_launch_attempt_unique`,
   `analysis_snapshot_pre_launch_single_pending`,
   `analysis_snapshot_post_launch_single_pending` (§4), плюс вспомогательный
   индекс на `campaign_id`.
10. Backfill: явная fail-closed validation-фаза, затем безусловный
   `INSERT ... SELECT` в `campaign_subject_link_projection` (§3).
11. `GRANT USAGE ON SCHEMA leasemind_app TO lmapp_analysis_writer;`
    `REVOKE ALL ON leasemind_app.analysis_snapshot,
    leasemind_app.campaign_subject_link_projection,
    leasemind_app.analysis_snapshot_idempotency_mapping FROM PUBLIC;`
    `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC` для всех функций этого
    шага; две validation-функции §9 получают точечный `EXECUTE` только у
    `lmapp_analysis_writer`, поскольку их вызывает `CHECK`; точечные колоночные
    `GRANT` **только** `lmapp_analysis_writer`,
    `lmapp_campaign_writer`, `lmapp_api_reader` (§12, "(008)"-помеченные
    операторы). **Без** `ALTER DEFAULT PRIVILEGES`.
12. Startup gates для core-ролей (§12) — реализуются в коде отдельно от
    миграции, но зависят от точного состава грантов этого шага.

**`008_analysis_snapshot.down.sql`** (детерминированный порядок, без
`CASCADE`):

1. Отозвать у `lmapp_analysis_writer` колоночный `SELECT` на `property`/
   `tenant_request` (единственные изменения ACL этой миграции на
   **существующих** таблицах 001–007).
2. Отозвать у трёх ролей все точные `GRANT`, выданные на шаге 11 up.sql,
   включая два `EXECUTE` validation-функций у `lmapp_analysis_writer`.
3. `REVOKE USAGE ON SCHEMA leasemind_app FROM lmapp_analysis_writer;`
4. `REVOKE EXECUTE ... FROM PUBLIC` — избыточно относительно `DROP
   FUNCTION` ниже, перечисляется для полноты симметрии.
5. `DROP TRIGGER`/`DROP FUNCTION` для обоих immutability-триггеров (§4, §5).
6. `ALTER TABLE campaign_subject_link_projection DROP CONSTRAINT
   campaign_subject_link_projection_analysis_snapshot_fk;` — явно снимает
   составную cross-table FK **до** удаления любой из двух таблиц.
7. `DROP TABLE leasemind_app.analysis_snapshot_idempotency_mapping;` — её
   FK на `analysis_snapshot` требует, чтобы она была удалена **до**
   `analysis_snapshot`.
8. `DROP TABLE leasemind_app.analysis_snapshot;` — снимает вместе с собой
   `analysis_snapshot_post_launch_identity_unique`; поскольку 009 к этому
   моменту уже откачена (порядок `010 → 009 → 008`, ниже), составной FK
   `post_launch_refresh_intent_current_snapshot_identity_fk`, опиравшийся
   на этот `UNIQUE`, уже не существует — `DROP TABLE` не требует `CASCADE`.
9. `DROP TABLE leasemind_app.campaign_subject_link_projection;`
10. `DROP FUNCTION leasemind_app.is_valid_metric_envelope(jsonb);`
11. `DROP FUNCTION leasemind_app.jsonb_object_key_count(jsonb);`

`lmapp_analysis_writer` не сохраняет ни одного объектного/схемного права,
выданного migration 008; provisioning-level `CONNECT` и сама LOGIN-роль не
изменяются down-миграцией.

**`009_post_launch_refresh_intent.up.sql`** (LOGIN-роль `lmapp_analysis_worker`
уже provisioned через `provisionRoles.ts`; NOLOGIN-роль
`lmapp_post_launch_refresh_owner` **уже provisioned bootstrap-шагом до
первого запуска этой миграции** — исправление повторного SQL-аудита:
`lmapp_migrator` имеет `NOCREATEROLE` и физически не может выполнить
`CREATE ROLE`, поэтому эта миграция роль **не создаёт**, только проверяет
контракт; полный порядок и обоснование каждого шага — §10 "Bootstrap-контракт"/
"Консолидированная передача владения"):

1. Проверка bootstrap-контракта, fail closed при нарушении (§10): роль
   `lmapp_post_launch_refresh_owner` существует и имеет все безопасные
   атрибуты, включая `NOLOGIN`/`NOCREATEROLE`/`NOBYPASSRLS`;
   `lmapp_migrator` — член этой роли с `admin_option = false`,
   `inherit_option = false`, `set_option = true`
   (`pg_auth_members`).
2. `CREATE TABLE leasemind_app.post_launch_refresh_intent` (§10) — включая
   составной FK на `campaign_subject_link_projection`, составной FK
   `post_launch_refresh_intent_current_snapshot_identity_fk` на
   `analysis_snapshot`/`analysis_snapshot_post_launch_identity_unique`
   (008, correction 4). Владелец сразу после `CREATE TABLE` — исполнитель
   команды, `lmapp_migrator` (ownership transfer — шаг 6 ниже, не сразу).
3. `CREATE FUNCTION leasemind_app.enforce_post_launch_refresh_intent_transition`
   + триггеры `BEFORE DELETE`/`BEFORE UPDATE` (§10) — с отдельными точными
   self-transition-ветками для lease renewal/re-claim и SLA breach
   marking; fencing внутри `SECURITY DEFINER` функций остаётся основной
   runtime-границей. `REVOKE EXECUTE ... FROM
   PUBLIC` сразу (владелец на этот момент — `lmapp_migrator`, для `REVOKE
   FROM PUBLIC` не имеет значения).
4. `CREATE FUNCTION leasemind_app.claim_post_launch_refresh_intent`,
   `renew_post_launch_refresh_intent_lease`,
   `complete_post_launch_refresh_intent`, `fail_post_launch_refresh_intent`,
   `request_post_launch_refresh_retry` (без `SELECT *` по внешним
   таблицам — только перечисленные колонки, §10 correction 4/повторный
   аудит), `mark_post_launch_refresh_intent_sla_breach` (все шесть —
   `SECURITY DEFINER`, `SET search_path = pg_catalog, leasemind_app`,
   §10); `REVOKE ALL ... FROM PUBLIC` для каждой сразу после её `CREATE`.
5. `lmapp_analysis_worker` получает собственные точечные колоночные гранты
   на **уже существующие с 008** `property`, `tenant_request`,
   `analysis_snapshot`, `analysis_snapshot_idempotency_mapping` — те же
   колонки, что и у `lmapp_analysis_writer`, но отдельными операторами
   (§12, "(009)"-помеченные операторы) — **это и есть суть correction 8**:
   008 не знает о существовании worker'а вовсе; именно эта миграция, а не
   008, впервые даёт worker'у доступ к core-таблицам. `GRANT USAGE ON
   SCHEMA leasemind_app TO lmapp_analysis_worker;` и точечный `EXECUTE` на
   две validation-функции §9, вызываемые `CHECK` (`lmapp_analysis_writer`
   уже имеет `USAGE` и те же два validation-гранта с migration 008).
6. **Консолидированная передача владения** (§10, точный порядок и
   обоснование там): `lmapp_migrator` выдаёт
   `lmapp_post_launch_refresh_owner` временный `CREATE` и постоянный
   `USAGE` на схему; выдаёт ей точечный колоночный `SELECT` на
   `analysis_snapshot`(8 колонок, включая `analysis_snapshot_id` как ключ
   точного сопоставления)/`analysis_snapshot_idempotency_mapping`(2
   колонки); выполняет `ALTER TABLE`/`ALTER FUNCTION ... OWNER TO
   lmapp_post_launch_refresh_owner` для всех восьми объектов шагов 2–4;
   отзывает временный `CREATE ON SCHEMA` у владельца (объект уже передан).
7. `SET ROLE lmapp_post_launch_refresh_owner;` — точечные runtime-гранты,
   выполняемые в этом контексте (единственный способ, которым
   `lmapp_migrator`, более не владеющий этими объектами, может их
   выдать): `INSERT` `lmapp_campaign_writer` на `post_launch_refresh_intent`;
   `EXECUTE` на `claim_post_launch_refresh_intent`/
   `renew_post_launch_refresh_intent_lease`/
   `complete_post_launch_refresh_intent`/`fail_post_launch_refresh_intent`/
   `mark_post_launch_refresh_intent_sla_breach` только
   `lmapp_analysis_worker`; `EXECUTE` на `request_post_launch_refresh_retry`
   только `lmapp_analysis_writer` (§12). `RESET ROLE;` сразу после.
   **Без** `ALTER DEFAULT PRIVILEGES`.
8. Startup gates для `lmapp_analysis_worker` (отдельный процесс, §12) и
   обновление gate `lmapp_campaign_writer`/`lmapp_analysis_writer`
   (проверка **отсутствия** любого прямого `SELECT`/`UPDATE`/`DELETE` на
   `post_launch_refresh_intent` и **отсутствия** `EXECUTE` на чужих
   функциях §10); отдельный тест владения и минимального внешнего
   allowlist для `lmapp_post_launch_refresh_owner` (§12, Verification plan)
   — вне `dbPrivilegePolicy.ts`, поскольку эта роль никогда не проходит
   runtime-gate сама.

**`009_post_launch_refresh_intent.down.sql`** (роль
`lmapp_post_launch_refresh_owner` **не удаляется** — bootstrap-provisioned,
вне владения этой миграции; порядок ниже — обратный порядку up.sql, с
`SET ROLE`/`RESET ROLE` там, где владелец объекта — не `lmapp_migrator`):

1. Отозвать у `lmapp_analysis_worker` колоночные `SELECT`/`INSERT`/`UPDATE`
   на `property`/`tenant_request`/`analysis_snapshot`/
   `analysis_snapshot_idempotency_mapping`, выданные шагом 5 up.sql —
   **новый шаг относительно предыдущей версии**: поскольку эти гранты
   теперь выдаются в 009 (а не в 008, correction 8), именно down 009, а не
   down 008, обязан их отзывать; down 008 их больше не касается. Отозвать
   у `lmapp_analysis_worker` два `EXECUTE` validation-функций §9 и
   `USAGE ON SCHEMA`.
2. `SET ROLE lmapp_post_launch_refresh_owner;` — отозвать у трёх ролей все
   точные `GRANT`, выданные на шаге 7 up.sql (`INSERT`
   `lmapp_campaign_writer`, `EXECUTE` на пяти worker-функциях
   `lmapp_analysis_worker`, `EXECUTE` на retry-функции
   `lmapp_analysis_writer`); удалить принадлежащие владельцу объекты в
   этом же `SET ROLE`-контексте (объекты владельцу, не `lmapp_migrator`,
   поэтому `DROP` требует того же `SET ROLE`, что и создание встречных
   `GRANT` на шаге 7 up.sql): `DROP FUNCTION` для всех шести
   `SECURITY DEFINER` функций (обратный порядок относительно создания не
   требуется — между ними нет зависимостей); `DROP TRIGGER`/`DROP FUNCTION
   enforce_post_launch_refresh_intent_transition`; `DROP TABLE
   leasemind_app.post_launch_refresh_intent;` (ссылается на
   `analysis_snapshot`/`campaign_subject_link_projection`, 008, но ничто из
   008 не ссылается на неё — можно удалить без затрагивания 008). `RESET
   ROLE;` сразу после последнего `DROP`.
3. `lmapp_migrator`, вернувшись к себе (`RESET ROLE` уже выполнен), отзывает
   выданные владельцу гранты: колоночный `SELECT` на `analysis_snapshot`/
   `analysis_snapshot_idempotency_mapping`, `USAGE ON SCHEMA` — эти гранты
   выдал сам `lmapp_migrator` (шаг 6 up.sql), поэтому отозвать их может без
   `SET ROLE`. Временного `CREATE ON SCHEMA` к этому моменту уже нет (отозван
   ещё в up.sql, шаг 6) — отзывать нечего.

Роль `lmapp_analysis_worker` (LOGIN, provisioned отдельно) не удаляется;
provisioning-level `CONNECT` не отзывается. Роль
`lmapp_post_launch_refresh_owner` не удаляется и не теряет
bootstrap-membership `lmapp_migrator` (`WITH ADMIN FALSE, INHERIT FALSE, SET TRUE`) —
только объектные/схемные гранты, выданные ей **этой** миграцией; после
полного down она остаётся существующей `NOLOGIN`-ролью без единого
объектного/схемного права (§12, §13 "Полный down").

**`010_evidence_dataset_revocation.up.sql`** (роль `lmapp_evidence_revocation_writer`
уже provisioned):

1. `CREATE TABLE leasemind_app.evidence_dataset_revocation` (§11) —
   самодостаточна, без FK на другие новые таблицы и без FK от них.
2. `CREATE FUNCTION leasemind_app.reject_evidence_dataset_revocation_mutation`
   + триггеры (§11).
3. `CREATE VIEW leasemind_app.analysis_snapshot_freshness_projection` (§11)
   — ссылается на `analysis_snapshot` (008), `campaign_subject_link_projection`
   (008), `property`/`tenant_request` (существующие), `evidence_dataset_revocation`
   (этот шаг) — создаётся после них всех.
4. `GRANT USAGE ON SCHEMA leasemind_app TO lmapp_evidence_revocation_writer;`
   `REVOKE ALL ON leasemind_app.evidence_dataset_revocation FROM PUBLIC;`
   `REVOKE EXECUTE ON FUNCTION
   leasemind_app.reject_evidence_dataset_revocation_mutation() FROM PUBLIC;`
5. Точечные колоночные гранты: `SELECT (evidence_dataset_revision)` пяти
   читающим ролям, `INSERT` только `lmapp_evidence_revocation_writer`;
   `SELECT ON analysis_snapshot_freshness_projection` только
   `lmapp_api_reader` (§12). **Без** `ALTER DEFAULT PRIVILEGES`.
6. Startup gate (privilege gate) для отдельного CLI-процесса
   `lmapp_evidence_revocation_writer` — самый узкий из всех пяти, проверяет
   отсутствие любого доступа за пределами `evidence_dataset_revocation` и
   `USAGE`. Отрицательные privilege checks для всех остальных ролей на
   трёх audit-колонках (§12).

**`010_evidence_dataset_revocation.down.sql`:**

1. Отозвать у пяти читающих ролей `SELECT (evidence_dataset_revision)`.
2. Отозвать у `lmapp_evidence_revocation_writer` `INSERT` и `USAGE ON SCHEMA`.
3. Отозвать у `lmapp_api_reader` `SELECT` на
   `analysis_snapshot_freshness_projection`.
4. `REVOKE EXECUTE ... FROM PUBLIC` (симметрия).
5. `DROP VIEW leasemind_app.analysis_snapshot_freshness_projection;` — до
   удаления таблицы, на которую она ссылается.
6. `DROP TRIGGER`/`DROP FUNCTION reject_evidence_dataset_revocation_mutation`.
7. `DROP TABLE leasemind_app.evidence_dataset_revocation;`

Роль `lmapp_evidence_revocation_writer` не удаляется; provisioning-level
`CONNECT` не отзывается.

**Полный down — строго `010 → 009 → 008 → 007 → ... → 001`**, без `CASCADE`
ни на одном шаге; каждая down-миграция отзывает исключительно то, что
выдала её собственная up-миграция, и не трогает объекты/гранты соседних
миграций. Полный `down` по-прежнему заканчивается отсутствием
`leasemind_app` schema, а все пять LOGIN-ролей этого ADR (`lmapp_analysis_writer`,
`lmapp_analysis_worker`, `lmapp_campaign_writer`, `lmapp_api_reader`,
`lmapp_evidence_revocation_writer`) — без единого объектного или схемного
гранта, но по-прежнему существующими LOGIN-ролями с provisioning-level
`CONNECT`. **Исправление повторного SQL-аудита относительно предыдущей
версии** — `lmapp_post_launch_refresh_owner` (NOLOGIN) теперь **тоже не
удаляется**: она bootstrap-provisioned (§10, §12), а не создана migration
009 (`lmapp_migrator` физически не может выполнить `CREATE ROLE`, имея
`NOCREATEROLE`) — ни одна down-миграция этого ADR не выполняет `DROP
ROLE lmapp_post_launch_refresh_owner`. После полного `down` она
по-прежнему существует как `NOLOGIN`-роль, без единого объектного/схемного
гранта (шаг 3 `009_post_launch_refresh_intent.down.sql` отзывает её
последние `USAGE`/колоночный `SELECT`), но с сохранённым bootstrap
membership `lmapp_migrator → lmapp_post_launch_refresh_owner WITH ADMIN FALSE, INHERIT
FALSE, SET TRUE` — членство устанавливает и снимает bootstrap, а не
миграции.

### 14. Транспорт revocation — отдельный CLI

Принято решение: отдельный TypeScript CLI (по образцу `migrate-cli.ts`/
`seed-cli.ts`/`provision-roles-cli.ts`) — **не** HTTP admin-эндпоинт и
**не** прямой SQL-доступ оператора. Рабочее имя:
`revoke-evidence-dataset-cli.ts`.

**Контракт CLI:**

- `--evidence-dataset-revision <sha256>` — **обязательный**, валидируется
  клиентом (64 lowercase hex) до подключения к БД, повторно — `CHECK`
  таблицы.
- `--reason-code <CODE>` — **обязательный** стабильный machine-code (тот же
  формат, что `CHECK` таблицы: `^[A-Z][A-Z0-9_]{2,63}$`).
- `--actor-ref <ref>` — **обязательный** privacy-safe actor reference,
  источник — авторизованный операционный контекст (например, значение
  окружения, идентифицирующее оператора/тикет, а не произвольный
  свободный текст и никогда не raw ФИО/email/телефон).
- `--execute` — **обязательный явный флаг** для фактической записи. Без
  него CLI выполняет **только** validation/dry-run: подключается
  read-only-путём (тот же `SELECT(evidence_dataset_revision)` грант),
  проверяет, не отозвана ли уже эта revision, печатает, что **было бы**
  вставлено, и завершается без единой записи в БД.
- CLI никогда не печатает содержимое доказательной базы или
  пользовательские данные — только переданные флаги, факт
  «уже отозвано / будет отозвано», и стабильные коды ошибок.

**Роль CLI (`lmapp_evidence_revocation_writer`) получает ровно:**

- `USAGE` на схему;
- `SELECT (evidence_dataset_revision)` на `evidence_dataset_revocation` —
  единственная проверка, доступная CLI: «уже отозвано?»;
- `INSERT (evidence_dataset_revision, evidence_revocation_reason_code,
  revoked_by_actor_ref)` на `evidence_dataset_revocation`;
- без `UPDATE`/`DELETE` где-либо (гарантировано и грантами, и триггером §11);
- без единого права на `analysis_snapshot`, `analysis_snapshot_idempotency_mapping`,
  `post_launch_refresh_intent`, `property`/`tenant_request` (protected или
  нет) — CLI физически не может прочитать ни Snapshot, ни evidence payload,
  ни идентичность связанных сущностей, только сам факт отзыва конкретного
  хэша.

**Provisioning создаёт LOGIN-роль** (§12), но down migration 010 отзывает
только объектные/схемные права этой миграции — не удаляет роль и не
отзывает provisioning-level `CONNECT` (тот же принцип, что уже применён к
`lmapp_analysis_writer` в четвёртой версии и распространён здесь на все
новые роли).

### 15. Вне объёма

- Расчёт или калибровка `deal_probability_30d` — доп. §9.6 (`insufficient_data`
  безусловно) остаётся в силе без изменений.
- Реализация `AS-C-021`–`AS-C-026` (пороги готовности исторических данных,
  доп. §9.8) — они остаются будущими policy gates и требуют отдельного ADR
  для реальной истории исходов, отдельного от этого решения.
- Добавление `runtime_mode` в текущие сущности (`property`, `tenant_request`,
  Campaign-таблицы) — не входит в это решение.
- Real outcome aggregation — подсчёт «созревших кампаний»/событий/несобытий
  из `campaign_event_log` не реализуется; ни `lmapp_analysis_writer`, ни
  `lmapp_analysis_worker` не получают и не предполагают получить доступ к
  `campaign_event_log`.
- Реальные ПДн, protected reveal, платежи — не принимаются и не хранятся ни
  на одном из путей, описанных здесь; `revoked_by_actor_ref` — только
  privacy-safe ссылка, не raw идентичность.
- Matching Engine и production adapters — не меняются, не используются.
- `PRODUCTION_LAUNCH_GATE` остаётся `blocked` (`ADR-0001`, `ADR-0003`); это
  решение его не снимает и не приближает к снятию.
- Legacy Campaign replay compatibility (`legacy_v1`/V1 `command_hash`, §3,
  §8) сохранена без изменений — ни одно новое решение этой версии её не
  затрагивает.

**Background worker больше не находится «вне объёма» этого ADR** — в
отличие от четвёртой версии, где durable post-launch refresh был явно
исключён и отложен как открытый PRODUCT-блокер, §10 этой версии реализует
его полностью: таблицу `post_launch_refresh_intent`, роль
`lmapp_analysis_worker`, claim/lease, SLA и explicit retry. Это
единственный пункт, перемещённый из «Вне объёма» в реализованную
архитектуру между четвёртой и пятой версией.

**Sprint 5 остаётся synthetic-only без изменений.** Ни одна из новых
таблиц/ролей этой версии не открывает путь к реальным ПДн, реальным
платежам или production adapters — `evidence_dataset_revocation` и
`post_launch_refresh_intent` оперируют исключительно теми же
synthetic-only Property/TenantRequest/Campaign данными, что и остальная
часть этого ADR.

## Последствия

- После добавления двух новых LOGIN-ролей и одной NOLOGIN-роли — по-прежнему
  **восемь** application LOGIN identities и **девять** connection strings
  (точный список — §12, «Пересчитано полностью»); три новых пароля для
  provisioning: `LEASEMIND_ANALYSIS_WORKER_PASSWORD`,
  `LEASEMIND_EVIDENCE_REVOCATION_WRITER_PASSWORD` (и уже существующий
  `LEASEMIND_ANALYSIS_WRITER_PASSWORD` с migration 008); девятая новая
  Postgres-роль этого ADR — `lmapp_post_launch_refresh_owner`, NOLOGIN, без
  пароля и без connection string (§12).
- `launchCampaign.ts` получает **три** новые операции внутри уже
  существующей транзакции — launch-time Analysis check с проверкой отзыва
  evidence (§8, шаг 3), `INSERT` в `campaign_subject_link_projection` (шаг
  8) и `INSERT` в `post_launch_refresh_intent` (шаг 9) — в точно
  определённых позициях операционной последовательности §8; сама
  транзакционная граница (`BEGIN` … `COMMIT`/`ROLLBACK`, advisory lock,
  `FOR UPDATE`) и относительный порядок всех существующих операций не
  меняются.
- `apps/api` получает **второй runtime-процесс** — `worker.ts`/
  `post-launch-refresh-worker-cli.ts`, с собственным `pg.Pool` на
  `LEASEMIND_ANALYSIS_WORKER_DATABASE_URL` и собственным startup privilege
  gate; это первый случай в проекте, когда least-privilege identity
  используется вне HTTP-процесса `server.ts` (не считая build-time
  `migrate-cli.ts`/`seed-cli.ts`, которые не обслуживают runtime-трафик).
- `apps/api` получает **третий runtime-путь** — CLI `revoke-evidence-dataset-cli.ts`,
  используемый только операторами вне обычного деплоя API/worker.
- `dbPrivilegePolicy.ts` получает **пять** новых/обновлённых fail-closed
  проверок (`lmapp_analysis_writer`, `lmapp_analysis_worker`,
  `lmapp_campaign_writer`, `lmapp_api_reader`, `lmapp_evidence_revocation_writer`)
  вместо одной новой в четвёртой версии.
- Analysis-команда потребляет ровно один `pg.PoolClient` на всё время
  выполнения (§6/§7) — теперь с **двумя** session-level lock вместо одного,
  но по-прежнему без второго checkout; риск удвоенного потребления pool
  остаётся снятым.
- Frontend получает полностью durable Analysis Snapshot: множественные
  `idempotency_key` сходятся к одной попытке без потери данных при retry
  (§5, §6), а `post_launch_refresh` переживает закрытие вкладки, потерю
  соединения и рестарт API-процесса (§10) — оба ранее открытых
  PRODUCT-вопроса закрыты архитектурно, не документально.

## Риски реализации

**Перенесённые из предыдущих версий, всё ещё актуальны без изменений:**

- **Generated columns на `COALESCE(uuid, uuid)` по обе стороны нескольких
  FK** — использование `GENERATED ALWAYS ... STORED` колонки и как
  referencing, и как referenced стороны составных FK (§2–§4, §8, §10)
  требует эмпирической проверки на целевом PostgreSQL 18.4.
- **`has_column_privilege` на generated-колонке `technical_assignment_id`**
  независимо от `property_id`/`tenant_request_id` — требует эмпирической
  проверки.
- **Session-level advisory lock перед `REPEATABLE READ`** (§6, §7) — сам
  сценарий преждевременно зафиксированного snapshot требует эмпирического
  подтверждения на PostgreSQL 18.4, теперь для **двух** lock вместо одного.
- **Уничтожение клиента при неподтверждённом `pg_advisory_unlock`** — теперь
  применяется к обоим lock §6, а не одному; порядок освобождения (шаг 9
  §6) и корректная обработка частичного успеха (один lock снят, второй —
  нет) требуют явного теста.
- **`CASE`-порядок вычисления** внутри `is_valid_metric_envelope`/
  `failure`-shape (§4, §9) — полагается на документированную гарантию
  PostgreSQL об однозначном порядке ветвей `CASE WHEN`.
- **Backfill fail closed** (§3) — миграция 008 обязана быть атомарной
  (одна транзакция на всю миграцию); необходимо подтвердить, что
  `migrate.ts` действительно это обеспечивает.
- **Рост сопоставимой выборки** — `REPEATABLE READ`-транзакция,
  сканирующая `property`/`tenant_request` синхронно внутри HTTP-запроса
  или worker-claim'а (§7, §10), предполагает сегодняшний малый объём
  synthetic-данных; при росте на порядки синхронный путь (в том числе
  внутри worker'а) может потребовать пересмотра — вне объёма этого ADR.
- **Расхождение DB `CHECK` и runtime schema** для `results` (§9) —
  глубокая валидация конкретных метрик живёт только в приложении.

**Новые для пятой версии:**

- **`SECURITY DEFINER` + `search_path` для шести функций §10** — фиксированный
  `SET search_path = pg_catalog, leasemind_app` (единый паттерн для всех
  шести, отличается от паттерна `leasemind_app, pg_temp`, использованного
  для более старых функций §4/§5/§9/§11 — оба паттерна фиксированы и
  защищают от search-path injection, но неоднородность стоит унифицировать
  в будущей ревизии, не блокирует эту) должен быть проверен на
  устойчивость к search-path injection эмпирически, а не только по
  документации Postgres.
- **`lmapp_post_launch_refresh_owner` (bootstrap-provisioned NOLOGIN owner
  role) — bootstrap-контракт и корректность цепочки владения** (§10, §12,
  §13) — два независимых, но связанных риска:
  1. **Bootstrap membership недоступен на момент миграции.** Migration 009
     fail closed проверяет (§10) существование роли и `SET`-membership
     `lmapp_migrator`, но сам факт, что этот bootstrap-шаг — новый
     класс операции (роль/membership вне `provisionRoles.ts` и вне
     миграций), требует явного end-to-end теста на «чистом» окружении:
     запуск миграций без предварительного bootstrap обязан завершиться
     именно ошибкой fail-closed-проверки, а не непонятной ошибкой
     `INSUFFICIENT_PRIVILEGE` на первом `ALTER ... OWNER TO`.
  2. **Владение восемью объектами** (`post_launch_refresh_intent`,
     `enforce_post_launch_refresh_intent_transition`, шесть command-функций
     — не семь, как ошибочно считалось в предыдущей версии: 1 таблица + 1
     transition-trigger function + 6 command-функций) должно фактически
     перейти к владельцу консолидированным шагом (§10 "Консолидированная
     передача владения") **до** того, как любой runtime `EXECUTE`/`INSERT`
     грант, выданный через `SET ROLE`, вообще может выполниться (сам
     `GRANT` от имени `lmapp_migrator`, не владеющего объектом, завершился
     бы ошибкой раньше, чем тест успел бы это заметить) — тем не менее
     пропущенный `ALTER ... OWNER TO` для любого из восьми объектов должен
     быть пойман явным тестом (`pg_class.relowner`/`pg_proc.proowner`
     соответствует ожидаемой NOLOGIN-роли для каждого из восьми объектов),
     а не только логическим разбором или косвенно через последующую ошибку
     `GRANT`.
- **`SET ROLE`/`RESET ROLE` внутри одной migration-транзакции** (§10, §13,
  шаги 6–7 up.sql и шаг 2 down.sql) — новый для этого ADR паттерн: если
  миграция откатывается посреди `SET ROLE`-блока (ошибка на одном из
  `GRANT`), сессия не должна остаться «залипшей» в контексте владельца для
  последующих операций — `RESET ROLE` обязан быть частью того же блока
  (или транзакция целиком откатывается, что естественно возвращает роль
  сессии), это требует явного теста, а не предположения, что откат
  транзакции сам восстановит `current_user`.
- **Fencing predicate корректность под конкуренцией** (§10) — пять условий
  `campaign_id` + `claimed_by_worker_id` + `execution_claim_count` +
  `status='claimed'` + `lease_expires_at >= now()`, объединённые одним
  `UPDATE ... WHERE`, требуют явного конкурентного теста: два worker'а,
  один из которых устарел (`execution_claim_count` меньше текущего),
  пытаются финализировать один и тот же intent почти одновременно —
  устаревший обязан получить `POST_LAUNCH_REFRESH_INTENT_FENCING_STALE`,
  а не тихий успех и не порчу состояния, выставленного корректным
  worker'ом.
- **Execution lock (§6) — третий independently-acquired advisory lock в
  системе** — в дополнение к двум lock команды (§6, шаги 1–10),
  execution flow берёт собственный session-level lock по
  `analysis-snapshot:execution:${analysisSnapshotId}`; поскольку он
  берётся **после** команды уже закоммитила и отпустила свои locks (не
  вложенно), риска циклического ожидания с ними нет, но сам факт третьего
  независимого lock-namespace в системе требует отдельного упоминания в
  operational runbook и отдельного нагрузочного теста, а не предполагается
  автоматически безопасным по аналогии с уже проверенными двумя.
- **Worker claim/lease корректность под конкуренцией** (§10) — `FOR UPDATE
  SKIP LOCKED` с условием `status='pending' OR (status='claimed' AND
  lease_expires_at < now())` в одном подзапросе требует явного
  нагрузочного/конкурентного теста (несколько worker-инстансов
  одновременно), не только логического разбора.
- **Server-derived idempotency key коллизии** (§10) — детерминированный
  ключ `LEASEMIND_ANALYSIS_POST_LAUNCH_REFRESH_INTENT_V1|...` полагается
  на то, что `campaign_id` глобально уникален (уже гарантировано `PRIMARY
  KEY campaign_current_state_projection`) — риск минимален, но само
  предположение стоит явно задокументировать как инвариант, а не
  переоткрывать при будущих изменениях схемы Campaign.
- **Разделение на три миграции (008/009/010)** — увеличивает число
  independently deployable шагов; порядок `up` **между** миграциями (009
  зависит от объектов 008; 010 зависит от объектов 008 **и своей
  собственной** `evidence_dataset_revocation` — не от объектов 009,
  `analysis_snapshot_freshness_projection` их не использует) должен быть
  закреплён в `migrate.ts`/CI так же строго, как порядок **внутри** одной
  миграции — это новый класс риска, отсутствовавший при единой migration
  008 предыдущих версий.
- **`VIEW ... WITH (security_invoker = true)` кросс-грантовая
  корректность** (§11) — `analysis_snapshot_freshness_projection` требует,
  чтобы вызывающая роль имела собственные гранты на **все** таблицы,
  которые соединяет VIEW; добавление новой колонки/условия в VIEW в
  будущем может незаметно потребовать нового гранта, который легко
  забыть — startup gate должен проверять фактическую способность
  `lmapp_api_reader` выполнить `SELECT` из VIEW, а не только формальное
  наличие грантов на VIEW как объект. Отдельно — регрессионный риск:
  будущая правка могла бы случайно убрать `WITH (security_invoker =
  true)` при пересоздании VIEW (например, при добавлении колонки через
  `DROP VIEW` + `CREATE VIEW` без явного повторения опции) — тест должен
  проверять `pg_views`/`pg_class.reloptions` на наличие
  `security_invoker=true`, а не полагаться на то, что автор следующей
  правки прочитает этот ADR.
- **Двойная проверка отзыва evidence не закрывает гонку внутри самой
  `REPEATABLE READ`-транзакции** (§7, correction 12) — обе проверки
  (до начала расчёта и перед terminal `UPDATE`) используют один и тот же
  MVCC snapshot, зафиксированный на `BEGIN`, и структурно не могут увидеть
  revocation, вставленную конкурентно **после** `BEGIN`; эта остаточная
  гонка закрывается post-hoc через launch-time check (§8) и freshness
  projection (§11), а не атомарно на самом `COMMIT` — задокументированное,
  осознанно принятое ограничение, а не забытый кейс, но подлежит
  отдельному тесту, доказывающему, что post-hoc обнаружение действительно
  срабатывает для этого конкретного сценария (revocation строго между
  `BEGIN` и `COMMIT` execution flow).
- **CLI dry-run (`--execute` отсутствует) должен быть провably read-only**
  (§14) — риск, что будущая правка CLI случайно уберёт проверку флага и
  начнёт писать без `--execute`; требует отдельного теста, а не только
  code review.

## Verification plan

**Идентичность и уникальность (§4):**

- campaign-aware current lookup: для `post_launch_refresh` `GET current`
  без `campaign_id` отклоняется `ANALYSIS_KIND_INVALID`; с `campaign_id`
  для `pre_launch` — тоже отклоняется; корректный запрос каждого вида
  возвращает попытку с максимальным `calculation_attempt` в пределах
  именно своего полного логического ключа.
- Два `pre_launch` Snapshot, **оба** с `campaign_id IS NULL` (не «разными
  `campaign_id=NULL`» — некорректная формулировка предыдущей версии: два
  SQL `NULL` никогда не «различаются» и не «совпадают» друг с другом по
  определению, поэтому в тексте теста должно быть именно «оба `campaign_id
  IS NULL`», а не сравнение значений) и одинаковым `calculation_attempt`
  для одного ТЗ/revision — отклонены частичным индексом
  `analysis_snapshot_pre_launch_attempt_unique` (регрессия против бага, из-за
  которого понадобилось разделение индексов).

**Idempotency и lock flow (§5, §6):**

- `AS-C-003`: replay `idempotency_key=K1` возвращает Snapshot попытки 1
  даже после того, как явный retry с `K2` создал попытку 2 —
  `analysis_snapshot_id` в ответе неизменен независимо от порядка вызовов.
- `AS-C-004` — разбит на два независимых сценария (не один общий
  «конкурентные ключи» тест):
  - **Один и тот же ключ, отправленный конкурентно дважды.** Ровно один
    физический создатель получает `201`/`202`; второй запрос — «проигравший»
    fast-path/lock-ожидание (§6, шаг 2) — получает `200`. Оба HTTP-ответа
    содержат идентичные `analysis_snapshot_id` и `calculation_attempt`;
    второй Snapshot не создан; mapping-строка ровно одна.
  - **Разные ключи, один и тот же логический запрос, отправленные
    конкурентно.** Ровно один физический создатель получает `201`/`202`;
    второй, дождавшийся logical-key lock и увидевший уже созданную попытку
    (§6, шаг 6 "Схождение"), получает `200`. Оба HTTP-ответа содержат
    идентичные `analysis_snapshot_id` и `calculation_attempt`, несмотря на
    два разных `idempotency_key`; обе mapping-строки записаны (по одной на
    ключ) и обе указывают на один и тот же `analysis_snapshot_id`.
- Два конкурентных retry с разными новыми ключами на один и тот же
  `failed`-attempt — ровно один создаёт новую попытку; второй получает
  именно `ANALYSIS_RETRY_NOT_ALLOWED` (не `TARGET_MISMATCH`); mapping для
  отклонённого ключа не создан.
- `analysis_snapshot_idempotency_mapping` immutable: прямой `UPDATE`/`DELETE`
  любой строки — отклонён триггером, независимо от роли.
- `retry_of_analysis_snapshot_id = analysis_snapshot_id` (ссылка сама на
  себя) — отклонена `CHECK`.
- **TOCTOU-тест разбит на два независимых сценария** (не один общий тест
  «искусственная задержка»):
  - **Same-key TOCTOU.** Искусственная задержка между fast-path проверкой
    «ключ не найден» (§6, до lock) и захватом
    `analysis-snapshot:idempotency-key:${K}` lock для **того же самого**
    `K` — конкурент, вставивший mapping для этого `K` в это окно,
    проигравший запрос корректно обнаруживает его на recheck-шаге (§6,
    шаг 2, "ещё до `BEGIN`") сразу после получения lock и не доходит до
    захвата logical-key lock вовсе — не создаёт дублирующую попытку и не
    создаёт вторую mapping-строку для того же `K`.
  - **Different-keys-same-logical-request TOCTOU.** Искусственная
    задержка между recheck по `idempotency-key` lock (шаг 2, ключ **не**
    найден) и захватом `technical-assignment:id:${id}` logical-key lock
    (шаг 3) — конкурент с **другим** ключом `K2` для того же логического
    запроса, вставивший свою попытку и закоммитивший её в это окно,
    корректно обнаруживается на шаге 5 ("Current lookup") после получения
    logical-key lock — проигравший запрос сходится к уже созданной
    попытке (`200`, "Схождение"), а не создаёт вторую.
- Execution flow (§6) идемпотентен по построению: повторный вызов для уже
  terminal `analysis_snapshot_id` — no-op (шаг 4), без второй мутации
  строки и без ошибки.

**Failure contract (§4):** уже покрыт существующими тестами формы
`{code, retryable}`, `NULL` для нетерминальных статусов, `code` только из
двух разрешённых значений — без изменений относительно четвёртой версии.

**Durable post-launch refresh (§10):**

- Worker lease expiry/reclaim: intent, оставшийся `claimed` с истёкшим
  `lease_expires_at`, подбирается другим (или тем же) worker'ом через
  `claim_post_launch_refresh_intent`; `execution_claim_count` увеличивается
  (новый fencing token).
- **Fencing — устаревший worker не может финализировать чужой claim.**
  Worker A клеймит intent (`execution_claim_count = N`), его lease
  истекает без финализации; worker B переклеймивает тот же intent
  (`execution_claim_count = N+1`); worker A, не зная об этом, вызывает
  `complete_post_launch_refresh_intent`/`fail_post_launch_refresh_intent`/
  `renew_post_launch_refresh_intent_lease` со старым `p_execution_claim_count = N`
  — каждый из трёх вызовов обязан завершиться ошибкой
  `POST_LAUNCH_REFRESH_INTENT_FENCING_STALE` (`RAISE EXCEPTION`, ноль
  затронутых строк внутри функции), не изменив ни одного поля строки,
  установленной worker'ом B; после этого worker B продолжает владеть
  intent без нарушений.
- **Pending-resume — крах до terminal-обновления продолжает тот же
  `calculation_attempt`, не создаёт новый.** Симулированный обрыв
  соединения worker'а внутри execution flow (§6, между шагом 2 `BEGIN` и
  шагом 5 terminal `UPDATE`), после того как команда (§6, шаги 1–10) уже
  закоммитила `pending`-строку — следующий claim того же intent (новый
  `execution_claim_count`) находит **тот же** `analysis_snapshot_id` через
  тот же детерминированный `idempotency_key` (fast path §6), выполняет
  execution flow заново для этой же строки и доводит её до terminal —
  `calculation_attempt` не увеличивается, второй `analysis_snapshot` не
  создаётся.
- Три точки crash recovery (§10: до создания/нахождения Snapshot; во время
  execution flow; после terminal Snapshot, но до finalize intent'а) —
  каждая воспроизводится явным тестом (обрыв соединения в нужный момент) и
  проверяется, что повторный worker сходится к корректному конечному
  состоянию без дублирования Snapshot и с корректным вызовом
  `complete`/`fail` по завершении.
- `failed → pending` напрямую (прямой `UPDATE`, минуя
  `request_post_launch_refresh_retry`) — **исправление формулировки
  повторного SQL-аудита**: триггер (§10) структурно **допускает** переход
  `failed→pending` — он в общем списке разрешённых кросс-статусных
  переходов наравне с `pending→claimed`/`claimed→completed`/
  `claimed→failed`, и триггер не пытается и не может отличить «вызов через
  `request_post_launch_refresh_retry`» от «прямой `UPDATE`» — это не его
  задача и не его механизм. Единственная причина, по которой прямой
  `UPDATE` этого перехода невозможен — отсутствие `UPDATE`-гранта: ни
  `lmapp_analysis_worker`, ни `lmapp_analysis_writer`, ни какая-либо иная
  runtime-роль не имеет `UPDATE` на `post_launch_refresh_intent` ни в каком
  объёме (§12) — тест подтверждает `INSUFFICIENT_PRIVILEGE` от Postgres
  при прямой попытке от имени каждой из этих ролей **раньше, чем**
  выполнение вообще доходит до тела триггера (Postgres проверяет
  привилегии до вызова `BEFORE UPDATE` триггера) — граница авторизации
  этого перехода целиком на уровне грантов, а не на уровне логики
  триггера.
- `request_post_launch_refresh_retry`: успешный вызов с корректным
  `calculation_attempt = target + 1`, новой попыткой в состоянии `pending`
  без `failure` и существующей mapping-строкой
  (`retry_of_analysis_snapshot_id`) переоткрывает intent, не меняя
  `launched_at`/`sla_deadline_at`/identity, и **не** переводит новую
  попытку в terminal синхронно — она остаётся `pending` до следующего
  claim; вызов с неверным attempt, неверным logical key, новой попыткой не
  в состоянии `pending`, отсутствующей mapping-строкой, либо когда исходная
  попытка не `failed`+`retryable=true` — отклонён с соответствующим `RAISE
  EXCEPTION`; повторный claim после успешного retry продолжает именно
  новую попытку.
- Terminal `failed` не запускает auto retry: intent, переведённый в
  `failed`, не подбирается claim-функцией ни при каком количестве
  дальнейших worker-циклов, пока не вызвана retry-функция явно.
- **Server-derived key не переиспользуется после explicit retry (новый
  тест, повторный SQL-аудит).** Полный сценарий одним тестом:
  1. Initial server-derived `idempotency_key` связан immutable mapping'ом
     (§5) с `attempt 1` в состоянии `failed`+`retryable=true`.
  2. Explicit retry с новым **пользовательским** `idempotency_key`
     создаёт `attempt 2` (`pending`) и вызывает
     `request_post_launch_refresh_retry`, переоткрывающую intent в
     `pending` с `current_analysis_snapshot_id = attempt2`.
  3. Следующий `claim_post_launch_refresh_intent` для этого intent
     возвращает строку с `current_analysis_snapshot_id = attempt2`
     (ненулевым).
  4. Worker **не** выполняет команду §6 с initial key — проверяется прямым
     наблюдением (нет нового обращения к `analysis_snapshot_idempotency_mapping`
     по initial key, нет `SELECT`/`INSERT` в рамках flow §6 «Ключ не
     найден»/fast path для initial key на этом шаге).
  5. Execution flow выполняется для `attempt 2` и доводит её до terminal.
  6. Mapping-строка для initial key **не изменилась** — по-прежнему
     указывает на `attempt 1`, не на `attempt 2` (прямая проверка
     immutable-таблицы §5: `analysis_snapshot_id` для initial key равен
     `attempt1`, а не `attempt2`, до и после шагов 2–5).
- **SLA self-transition — работает для `pending`/`claimed`/`completed`/
  `failed`, отклонён для произвольной мутации без изменения
  `sla_breach_reported_at` (новый тест, повторный SQL-аудит).** Для каждого
  из четырёх статусов, до и после `sla_deadline_at`: вызов
  `mark_post_launch_refresh_intent_sla_breach` при выполненном условии
  breach (`finished_at IS NULL AND now() > sla_deadline_at` для
  `pending`/`claimed`, либо `finished_at > sla_deadline_at` для
  `completed`/`failed`) успешно устанавливает `sla_breach_reported_at`,
  меняя **только** это поле и `updated_at` (все прочие mutable-поля —
  побитно `IS NOT DISTINCT FROM` до/после); до дедлайна — `RETURN false`,
  no-op, без исключения. Отдельно — негативный тест: прямой `UPDATE`,
  меняющий `sla_breach_reported_at` **и** ещё одно mutable-поле (например,
  `finished_at`) в одной команде при `OLD.status = NEW.status`, — отклонён
  триггером как `POST_LAUNCH_REFRESH_INTENT_INVALID_SELF_TRANSITION`, а не
  проходит тихо под видом SLA-ветки.
- SLA before/after deadline: `finished_at IS NULL AND now() > sla_deadline_at`
  → breach; `finished_at > sla_deadline_at` → breach; `finished_at <=
  sla_deadline_at` (включая `status='failed'` до дедлайна) → **не** breach;
  `mark_post_launch_refresh_intent_sla_breach` устанавливает
  `sla_breach_reported_at` ровно один раз на intent даже при многократных
  вызовах монитора (повторный вызов после первой фиксации — `RETURN
  false`, no-op).
- Campaign не откатывается: искусственный `failed` `post_launch_refresh`
  (в том числе SLA breach) не изменяет ни одной строки
  `campaign_current_state_projection`/`campaign_event_log`.

**Evidence revocation (§11, §14):**

- Append-only: прямой `UPDATE`/`DELETE` `evidence_dataset_revocation` —
  отклонён триггером для любой роли, включая `lmapp_evidence_revocation_writer`.
- Freshness priority: Snapshot, одновременно удовлетворяющий условиям
  `evidence_revoked` и `campaign_mismatch` (или `revision_changed`) —
  `analysis_snapshot_freshness_projection` возвращает именно
  `evidence_revoked`.
- API не читает audit-поля: `lmapp_api_reader`/`lmapp_campaign_writer`/
  `lmapp_analysis_writer`/`lmapp_analysis_worker` не имеют `SELECT` на
  `evidence_revocation_reason_code`/`revoked_at`/`revoked_by_actor_ref` —
  негативная проверка привилегий, не только отсутствие соответствующего
  поля в HTTP-ответе.
- `lmapp_analysis_writer`/`lmapp_analysis_worker` не используют отозванный
  `evidence_dataset_revision` для нового расчёта: launch-time check (§8) и
  (если применимо) сам расчёт консультируются с `evidence_dataset_revocation`
  до публикации/использования `evidence_dataset_revision` в новой попытке.
- CLI без `--execute` не производит ни одной записи — тест запускает CLI в
  dry-run режиме и подтверждает нулевое количество новых строк в
  `evidence_dataset_revocation` до и после вызова.
- CLI с `--execute` для уже отозванной revision — детерминированный
  отказ (нарушение `PRIMARY KEY`), не тихий no-op и не повторная запись.

**Migrations (§13):**

- `008`/`009`/`010` проходят `up`/`down`/`up` по отдельности **и** в
  полной последовательности `001 → … → 010 → … → 001` на PostgreSQL 18.4 в
  CI — не только рассуждение об их корректности.
- Полный `down` (`010 → 009 → 008 → … → 001`) не использует `CASCADE` ни на
  одном шаге и заканчивается отсутствием `leasemind_app` schema.
- После полного `down` все пять LOGIN-ролей (`lmapp_analysis_writer`,
  `lmapp_analysis_worker`, `lmapp_campaign_writer`, `lmapp_api_reader`,
  `lmapp_evidence_revocation_writer`) — без единого объектного/схемного
  гранта, но по-прежнему существуют как LOGIN-роли с provisioning-level
  `CONNECT` (явная проверка, что down-миграции не выполняют `DROP
  ROLE`/`REVOKE CONNECT ... FROM <role>` для этих пяти). Отдельно —
  `lmapp_post_launch_refresh_owner` (NOLOGIN) после полного `down`
  **по-прежнему существует**, поскольку создаётся bootstrap-provisioning,
  а не migration 009. Проверка подтверждает наличие роли, `rolcanlogin =
  false`, остальные безопасные role attributes и сохранённое membership
  `lmapp_migrator` с `admin_option=false`/`inherit_option=false`/
  `set_option=true`, а также полное отсутствие объектных/схемных прав,
  выданных migration 009 (§13).

**Least privilege (§12) — exact positive и negative privilege tests для
всех пяти LOGIN-ролей плюс отдельная проверка владения для NOLOGIN-роли:**

- `dbPrivilegeBoundary.test.ts` расширяется точным ожидаемым набором
  грантов для `lmapp_analysis_writer`, `lmapp_analysis_worker`,
  `lmapp_campaign_writer`, `lmapp_api_reader`,
  `lmapp_evidence_revocation_writer` — для каждой: одновременная проверка
  `has_table_privilege(...) = false` (кроме единственного оставшегося
  table-wide исключения — `campaign_subject_link_projection`) **и**
  точного `has_column_privilege`-allowlist **и** отсутствия лишних
  привилегий через `information_schema.column_privileges` **и** точного
  `has_function_privilege(..., 'EXECUTE')`-allowlist по каждой из шести
  `SECURITY DEFINER` функций §10 (для `lmapp_analysis_worker` — пять из
  шести, без `request_post_launch_refresh_retry`; для
  `lmapp_analysis_writer` — ровно одна, `request_post_launch_refresh_retry`,
  без остальных пяти), по двум immutable validation-функциям §9 (только
  writer/worker) и по всем внутренним trigger-функциям (ни у одной LOGIN-роли).
- **Отдельный тест владения и bootstrap-контракта** (не `dbPrivilegePolicy.ts`,
  а тест миграций, §13; исправление повторного SQL-аудита — счёт объектов
  и утверждение об отсутствии грантов у владельца оба были неверны в
  предыдущей версии):
  - `pg_class.relowner`/`pg_proc.proowner` для всех **восьми** объектов
    (`post_launch_refresh_intent`, `enforce_post_launch_refresh_intent_transition`,
    шесть command-функций §10 — не семь) равен `oid` роли
    `lmapp_post_launch_refresh_owner`, а не `lmapp_migrator`.
  - `lmapp_post_launch_refresh_owner` сама — существует **до** первого
    запуска migration 009 (bootstrap-provisioned, не создана этой
    миграцией), имеет полный безопасный набор role attributes (`NOLOGIN`,
    `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`,
    `NOBYPASSRLS`); `pg_auth_members` подтверждает членство
    `lmapp_migrator` с `admin_option = false`, `inherit_option = false`,
    `set_option = true`.
  - **Не** «ноль входящих грантов» — точный allowlist: `USAGE` на схему,
    колоночный `SELECT` на `analysis_snapshot`(8 колонок, §10)/
    `analysis_snapshot_idempotency_mapping`(2 колонки), без `CREATE` на
    схему (временный грант отозван после передачи владения, §10) и без
    table-wide `SELECT` где-либо.
  - Runtime-гранты (`EXECUTE` на шесть функций, `INSERT` на
    `post_launch_refresh_intent`), выданные владельцем через `SET ROLE`
    (§10, §13), присутствуют в `information_schema.role_routine_grants`/
    `role_table_grants` с `grantor = lmapp_post_launch_refresh_owner` — это
    ожидаемо и не является нарушением «владелец не выдаёт грантов
    самостоятельно вне явного контекста миграции» (грант выдан в явном,
    протестированном `SET ROLE`-блоке, а не спонтанно).
  - Полный `down` (§13) не выполняет `DROP ROLE` для этой роли — после него
    роль по-прежнему существует, без единого объектного/схемного гранта, с
    сохранённым bootstrap membership.
- Отрицательные проверки по каждой роли — полный список из §12
  «Обязательные отрицательные проверки», включая явную проверку, что
  `lmapp_ta_writer` не получила ни одного нового гранта нигде в этом ADR.
- Автоматизация `AS-C-001`–`AS-C-020` и `AS-C-027` из `ANALYSIS_SNAPSHOT.md`
  §18 поверх этой схемы на synthetic fixtures, как зафиксировано в её
  собственном Definition of Done; `AS-C-021`–`AS-C-026` остаются future
  policy gates и не тестируются в рамках Sprint 5.
