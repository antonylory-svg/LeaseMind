# ADR-0007 — Synthetic Campaign creation command boundary

**Дата:** 2026-07-31
**Автор:** Lead Software Architect
**Статус:** Accepted for synthetic development only

## Контекст

Sprint 4 реализует первый видимый сквозной продуктовый сценарий: выбор цели,
первичный анализ (информационно), контакты (только синтетический fixture),
запуск Campaign и отображение созданной Campaign. До этого решения API было
строго read-only (`ADR-0004`): `GET /api/v1/health/live`,
`GET /api/v1/health/ready`, `GET /api/v1/campaigns`,
`GET /api/v1/campaigns/{campaignId}`. Запуск Campaign требует ровно одной
новой операции записи.

Существующий внутренний путь для добавления Campaign-события уже есть и не
меняется: `apps/api/src/db/campaignEvents.ts`, `appendCampaignStatusEvent` —
единственный путь, которым когда-либо пишется `campaign_event_log`, атомарно
проецируемый в `campaign_current_state_projection`. Он уже используется
`seed.ts` (роль `lmapp_maintainer`). До этого решения он не был достижим ни
из одного HTTP-маршрута.

## Решение

1. **Ровно один новый write-endpoint.** `POST /api/v1/campaigns` — создаёт
   синтетическую Campaign в статусе `Created` (первый из 11 утверждённых
   статусов, `apps/api/src/db/campaigns.ts`). Никакой другой write-операции
   не добавляется. `GET`-контракт четырёх существующих операций не меняется.

2. **Единственное принимаемое поле — `idempotency_key`.**
   Request body: `{ idempotency_key: string }`, `additionalProperties: false`,
   `minLength: 1`, `maxLength: 200`. Структурно невозможно передать ФИО,
   телефон, email или любое иное бизнес-поле — Fastify отклоняет любое
   дополнительное свойство как `400 INVALID_IDEMPOTENCY_KEY`, до вызова
   какой-либо бизнес-логики.
   - Эмпирически обнаружено: Fastify's ajv по умолчанию использует
     `removeAdditional: true` и `coerceTypes: true`, из-за чего лишние
     свойства тихо отбрасываются, а значения неверного типа (например,
     число вместо строки) тихо приводятся к ожидаемому типу вместо отказа
     в запросе — оба поведения скрыли бы отклонение от контракта, а не
     предотвратили бы его структурно. Исправлено через
     `ajv: { customOptions: { removeAdditional: false, coerceTypes: false } }`
     в конструкторе Fastify (`apps/api/src/app.ts`), плюс
     `attachValidation: true` на самом маршруте — любая ошибка схемы (лишнее
     свойство, отсутствующее поле, неверный тип) обрабатывается вручную и
     превращается в единый безопасный ответ, без эха значения или имени
     поля от Fastify по умолчанию.

3. **Все технические идентификаторы — серверные.**
   `campaign_id`, `aggregate_version`, `created_at`, `updated_at` никогда не
   принимаются от вызывающей стороны. `campaign_id` детерминированно
   выводится сервером из `idempotency_key`
   (`apps/api/src/db/createCampaign.ts`, `deriveCampaignIdFromIdempotencyKey`:
   `sha256(DOMAIN_SEPARATOR|idempotency_key)`, первые 16 байт, версия/вариант
   нибблов зафиксированы под UUID v4). Это единственный способ сделать
   идемпотентность видимой на уровне HTTP: `appendCampaignStatusEvent` уже
   проверяет идемпотентность по паре `(campaign_id, idempotency_key)`, но
   `campaign_id` для НОВОЙ команды не существует заранее — детерминированный
   вывод гарантирует, что повтор с тем же `idempotency_key` разрешается в
   тот же `campaign_id` и, следовательно, в тот же существующий event
   (`isReplay: true`, ответ `200`), а не в новую Campaign (`201`).

4. **Campaign Event Log остаётся единственным источником истины.**
   `createCampaignCommand` не содержит собственной бизнес-логики создания —
   он только валидирует `idempotency_key`, выводит `campaign_id` и вызывает
   существующий, неизменённый `appendCampaignStatusEvent` с
   `status: 'Created'`. Ни `campaign_event_log`, ни `campaign_stream_head`,
   ни `campaign_current_state_projection` (схема, ограничения, статусы) не
   меняются.

5. **Отдельная минимально-привилегированная командная граница.**
   Новая роль `lmapp_campaign_writer` (`apps/api/migrations/
   004_campaign_command_grants.up.sql`) с ровно теми же object-level
   грантами, что и `lmapp_maintainer` (`SELECT, INSERT` на
   `campaign_event_log`; `SELECT, INSERT, UPDATE` на
   `campaign_stream_head` и `campaign_current_state_projection`), но
   отдельным логином/паролем и отдельной connection string
   (`LEASEMIND_COMMAND_DATABASE_URL`). HTTP runtime (`server.ts`) никогда не
   использует `lmapp_migrator`, `lmapp_maintainer` или bootstrap-идентичность
   — только `lmapp_api_reader` (чтение) и `lmapp_campaign_writer` (эта одна
   команда). Существующий `lmapp_api_reader` остаётся исключительно
   read-only; никакой write-путь через него не открывается.

6. **Новый pre-launch privilege-гейт, по аналогии с существующим.**
   `verifyRuntimeCommandPrivileges` (`apps/api/src/dbPrivilegePolicy.ts`) —
   тот же fail-closed принцип, что и `verifyRuntimeDatabasePrivileges`
   (`ADR-0005`): проверяет, что подключённая роль не superuser/createdb/
   createrole/replication/bypassrls, не может создавать объекты в БД/схеме,
   не имеет доступа к `schema_migrations`, не состоит в
   `lmapp_migrator`/`lmapp_maintainer`/`lmapp_api_reader`, и имеет ровно
   допустимый набор SELECT/INSERT/UPDATE (без DELETE/TRUNCATE) на трёх
   рабочих таблицах. Выполняется один раз при старте, для отдельного
   `commandPool`, до `app.listen()`, не меняя существующий порядок
   `Runtime Safety Gate → config → DB pool(s) → DB Privilege Gate(s) →
   listen` (`ADR-0003`) — только добавляя второй пул и вторую проверку в ту
   же последовательность.

7. **Наблюдаемость (ADR-0006) не ослабляется.** Новый маршрут использует тот
   же `SafeLogController` и allowlist полей; `method: 'POST'` отличает его
   от `GET` на том же логируемом `route`. Ошибки классифицируются тем же
   способом: `INVALID_IDEMPOTENCY_KEY` (400), `DATABASE_UNAVAILABLE` (503).
   Тело запроса/ответа по-прежнему никогда не логируется.

## Явно НЕ входит в это решение

- Не добавляются платежи, Reveal, Introduction Record, production adapters.
- Не принимаются и не сохраняются реальные ФИО, телефон, email или иные ПДн
  ни на этом, ни на любом другом маршруте.
- Не меняются 11 утверждённых статусов Campaign, схема
  `campaign_current_state_projection`/`campaign_event_log`/
  `campaign_stream_head`, миграции 001–003.
- Не меняется Matching Engine и его controlled artifacts.
- `PRODUCTION_LAUNCH_GATE` остаётся blocked (`ADR-0001`, `ADR-0003`).
- Не добавляется никакой другой write-endpoint, кроме
  `POST /api/v1/campaigns`.

## Последствия

- Пять различимых identity/connection strings вместо четырёх
  (`DATABASE_URL`, `LEASEMIND_MIGRATION_DATABASE_URL`,
  `LEASEMIND_MAINTENANCE_DATABASE_URL`, `LEASEMIND_COMMAND_DATABASE_URL`,
  `LEASEMIND_BOOTSTRAP_DATABASE_URL`) и соответствующий пароль
  (`LEASEMIND_CAMPAIGN_WRITER_PASSWORD`) для provisioning.
- Frontend получает первый реальный сценарий записи данных поверх
  существующего Campaign Read Model, оставаясь полностью на синтетических
  данных без изменения бизнес-логики или юридических/платёжных правил.
