# ADR-0005 — PostgreSQL least-privilege database boundary

**Дата:** 2026-07-30
**Автор:** Lead Software Architect
**Статус:** Accepted for synthetic development only

## Контекст

Read-only аудит (Sprint 2, до этого решения) подтвердил эмпирически на
disposable PostgreSQL 18.4 с теми же credentials, что использует
`docker-compose.yml`/CI: единственная существующая роль (`lmapp_dev`)
является полным cluster superuser (`rolsuper`, `rolcreatedb`,
`rolcreaterole`, `rolreplication`, `rolbypassrls` — все `true`) и
используется одновременно как API runtime, migrations, synthetic seed,
projection rebuild и backend tests. Эмпирически подтверждено: этой ролью
можно `UPDATE`/`DELETE`/`TRUNCATE` `campaign_current_state_projection`,
удалить `schema_migrations`, выполнить `DROP SCHEMA leasemind_app CASCADE`,
`CREATE ROLE`, `CREATE DATABASE` — без единого технического барьера. Только
`campaign_event_log`'s BEFORE UPDATE/DELETE trigger (`ADR-0002`) не зависит
от привилегий роли; всё остальное защищено исключительно дисциплиной
прикладного кода, а не базой данных.

## Решение

Вводятся три отдельные PostgreSQL LOGIN identity вместо одной:

### 1. `lmapp_migrator`

- `LOGIN`, не superuser, без `CREATEDB`/`CREATEROLE`/`REPLICATION`/`BYPASSRLS`.
- `CONNECT` и `CREATE` только на synthetic application database (не
  cluster-wide `CREATEDB`).
- Владелец `leasemind_app` schema и migration ledger
  (`leasemind_app.schema_migrations`).
- Используется исключительно `migrate-cli.ts`
  (`LEASEMIND_MIGRATION_DATABASE_URL`).
- Никогда не используется HTTP API.

### 2. `lmapp_maintainer`

- `LOGIN`, не superuser, без DDL и role management.
- Используется исключительно synthetic seed, append Campaign Event
  (`campaignEvents.ts: appendCampaignStatusEvent`) и projection rebuild
  (`rebuildCampaignProjection`/`rebuildAllCampaignProjections`)
  через `LEASEMIND_MAINTENANCE_DATABASE_URL`.
- Получает только минимальные `SELECT`/`INSERT`/`UPDATE`, подтверждённые
  фактическими SQL-операциями `campaignEvents.ts` (migration 003): `SELECT,
  INSERT` на `campaign_event_log`; `SELECT, INSERT, UPDATE` на
  `campaign_stream_head` (`UPDATE` требуется и для явного `UPDATE`, и для
  `SELECT ... FOR UPDATE`); `SELECT, INSERT, UPDATE` на
  `campaign_current_state_projection` (`SELECT` подтверждена эмпирически:
  PostgreSQL требует её для `INSERT ... ON CONFLICT DO UPDATE`, даже когда
  `SET` ссылается только на `EXCLUDED`). Без `DELETE`/`TRUNCATE`.
- Без доступа к `schema_migrations`.
- Никогда не используется HTTP API.

### 3. `lmapp_api_reader`

- `LOGIN`, не superuser.
- `CONNECT` на database, `USAGE` на `leasemind_app`.
- `SELECT` только на `campaign_current_state_projection` — единственная
  таблица, которую фактически используют четыре read-only HTTP операции
  (`ADR-0004`).
- Без доступа к `campaign_event_log`, `campaign_stream_head`,
  `schema_migrations`.
- Без `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE`/`CREATE`/`TEMP`.
- Не является членом `lmapp_migrator` или `lmapp_maintainer` (проверяется
  `pg_has_role(...)`), поэтому `SET ROLE` в более привилегированную роль
  технически невозможен.
- Используется исключительно `server.ts` (`DATABASE_URL`).

## Environment contract

- `DATABASE_URL` — только API runtime (`server.ts`/`config.ts`). Никогда не
  читается `migrate-cli.ts`/`seed-cli.ts`.
- `LEASEMIND_MIGRATION_DATABASE_URL` — только `migrate-cli.ts`. Без fallback
  на `DATABASE_URL`: отсутствие переменной — явная ошибка, а не тихий откат
  к менее ограниченной роли.
- `LEASEMIND_MAINTENANCE_DATABASE_URL` — только `seed-cli.ts` (и любой
  будущий отдельный rebuild CLI). Без fallback.
- `LEASEMIND_BOOTSTRAP_DATABASE_URL` — используется исключительно
  role-provisioning механизмом и тестовой инфраструктурой (для прямых
  проверок `pg_roles`/привилегий). Приложение (`server.ts`, `migrate-cli.ts`,
  `seed-cli.ts`) никогда не читает эту переменную.
- `LEASEMIND_MIGRATOR_PASSWORD`, `LEASEMIND_MAINTAINER_PASSWORD`,
  `LEASEMIND_API_READER_PASSWORD` — пароли трёх ролей, только для
  role-provisioning; никогда не встраиваются в TypeScript, SQL-файлы,
  логи или error messages.

## Role provisioning

Создание LOGIN roles — операция уровня cluster, а не отдельной database или
schema, поэтому она технически не может входить в numbered migration ledger
(роль не может выдать сама себе право на существование; ни одна из трёх
ограниченных ролей не должна иметь `CREATEROLE`). Provisioning выполняется
отдельным idempotent TypeScript CLI
(`apps/api/src/db/provisionRoles.ts` + `provision-roles-cli.ts`),
подключающимся через `LEASEMIND_BOOTSTRAP_DATABASE_URL` **до** `migrate:up`:

- Имена ролей — фиксированные строковые константы в коде, не берутся из
  входных данных.
- Пароли читаются только из environment variables и передаются как часть
  сгенерированного во время выполнения SQL-текста, отправляемого напрямую
  соединению; они никогда не записываются в файл (`.sql` в репозитории не
  содержит ни одного пароля), не логируются и не появляются в error
  messages.
- Идемпотентность: `CREATE ROLE` только если роль отсутствует
  (`pg_roles`), затем безусловный `ALTER ROLE ... WITH LOGIN PASSWORD ...
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`
  на каждом прогоне — повторный запуск сбрасывает опасные атрибуты, даже
  если их кто-то вручную включил.
- `NOINHERIT` исключает автоматическое наследование привилегий на случай,
  если членство в другой роли будет когда-либо ошибочно добавлено.
- `REVOKE CONNECT, TEMP, CREATE ON DATABASE ... FROM PUBLIC`, затем точечный
  `GRANT CONNECT` только трём именованным ролям (+ `CREATE` дополнительно
  только `lmapp_migrator`) — доступ становится allow-list, а не
  default-on для любого нового login.
- Для local Docker и CI используются только явно синтетические значения
  (тот же принцип, что уже применяется к `synthetic-dev-only-password` в
  `docker-compose.yml`).

## Migration 003

`apps/api/migrations/003_least_privilege_grants.{up,down}.sql` — только
`GRANT`/`REVOKE`/`ALTER DEFAULT PRIVILEGES`. Не меняет таблицы, колонки,
constraints, Campaign statuses или бизнес-данные. Выполняется ролью
`lmapp_migrator` (владелец объектов может выдавать права без superuser).
Явно отзывает PUBLIC EXECUTE на `reject_campaign_event_log_mutation()`
(Postgres по умолчанию выдаёт `EXECUTE` на новые функции `PUBLIC`) и
настраивает `ALTER DEFAULT PRIVILEGES` для будущих объектов `lmapp_migrator`
в этой схеме. `down.sql` отменяет ровно эти grants/default privileges, не
затрагивая 001/002. Полный `down` (003 → 002 → 001) по-прежнему
завершается отсутствием `leasemind_app` schema (001's `DROP SCHEMA ...
CASCADE`).

## Fail-closed runtime check

`apps/api/src/dbPrivilegePolicy.ts` экспортирует
`verifyRuntimeDatabasePrivileges(pool)`, вызываемую в `server.ts` один раз
при старте, строго в порядке:

```
enforceRuntimeSafetyGate() → loadConfig() → createPool() →
verifyRuntimeDatabasePrivileges() → app.listen()
```

Проверка запрашивает `pg_roles` и privilege-функции (`has_database_privilege`,
`has_schema_privilege`, `has_table_privilege`, `pg_has_role`) для
`current_user` и отклоняет запуск, если роль: superuser, `CREATEDB`,
`CREATEROLE`, `REPLICATION`, `BYPASSRLS`; имеет `CREATE`/`TEMP` на database;
имеет `CREATE` на `leasemind_app`; может писать/удалять
`campaign_current_state_projection`; может читать `campaign_event_log`,
`campaign_stream_head` или `schema_migrations`; является членом
`lmapp_migrator`/`lmapp_maintainer`; либо не имеет `SELECT` на
`campaign_current_state_projection`. При любом нарушении процесс завершается
с ненулевым кодом до `app.listen()`; порт не открывается; пул закрывается;
вывод — только стабильный код `DATABASE_PRIVILEGE_VIOLATION`, без
`DATABASE_URL`, имени пользователя, пароля, connection string или stack
trace.

## Явно НЕ входит в это решение

- Это не изменение Campaign statuses, HTTP surface, бизнес-логики, UX,
  экономики или юридических правил.
- Это не добавление write API — все три роли обслуживают исключительно
  существующие read-only операции и внутренние (не-HTTP) maintenance пути.
- Это не изменение migrations 001/002, Matching Engine, controlled
  artifacts, AI Manager Architecture или `_incoming`.
- Это не прохождение `PRODUCTION_LAUNCH_GATE` — гейт остаётся заблокирован
  (`ADR-0001`, `ADR-0003`); все credentials, роли и пароли — синтетические,
  используемые только в disposable PostgreSQL локально и в CI.

## Последствия

- Любая ошибочная конфигурация, указывающая `DATABASE_URL` на
  admin/superuser или на `lmapp_migrator`/`lmapp_maintainer`, технически не
  может запустить HTTP-сервер — проверяется автоматически при каждом
  старте, а не только документацией.
- Расширение привилегий любой из трёх ролей (например, для будущего write
  API) требует отдельного ADR и явного пересмотра migration 003 — этот
  документ его не разблокирует автоматически.
