# Matching Engine — Patch Log

Технический журнал точечных правок, применённых к рабочей распакованной копии
Matching Engine contract suite в `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/source/`.
Журнал не содержит продуктовых, юридических или экономических решений.

## DEV-S0-001 — cross-platform file URL path handling

- **Причина:** на Windows `new URL(relativePath, import.meta.url).pathname` возвращает путь вида
  `/C:/Users/.../file.yaml` (ведущий `/` перед буквой диска — корректное поведение WHATWG URL).
  `@apidevtools/swagger-parser` и `@asyncapi/parser` ожидают обычный путь файловой системы, а не
  `pathname` файлового URL; в результате получался задвоенный путь `C:\C:\Users\...` и ошибка
  `ENOENT: no such file or directory`.
- **Затронутый файл:** `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/tests/run_contract_suite.mjs`
  - строка 3 (после правки): добавлен `import {fileURLToPath} from 'node:url';`
  - строка 39 (после правки, ранее 38): `SwaggerParser.validate(...)` — было
    `new URL('../openapi.yaml', import.meta.url).pathname`, стало
    `fileURLToPath(new URL('../openapi.yaml', import.meta.url))`
  - строка 68 (после правки, ранее 67): `fromFile(parser, ...)` — было
    `new URL('../asyncapi.yaml', import.meta.url).pathname`, стало
    `fileURLToPath(new URL('../asyncapi.yaml', import.meta.url))`
- **Техническое исправление:** преобразование file URL в путь файловой системы выполняется через
  `fileURLToPath` из `node:url` — кросс-платформенный API, корректно работающий на Windows, macOS
  и Linux. Других использований `.pathname` в файле не было; прочая логика (`new URL(path, ...)`
  без `.pathname`, используемая в `loadYaml`/`readFile`) не изменялась.
- **Продуктовая, юридическая и платёжная логика не менялась.** Правка затрагивает только способ
  передачи локального файлового пути валидатору; контрактные проверки, схемы, migrations,
  fixtures и сервисные reference-модели не тронуты.
- **Controlled ZIP остался неизменным.** `contract-tests/v1.0/artifacts/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip`
  и `contract-tests/v1.0/artifacts/LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`, а также
  Proposal-документы в `03_ARCHITECTURE/proposals/matching-engine/` и заключение седьмой проверки
  в `05_DEVELOPMENT/matching-engine/reviews/` — не изменялись.
- **Проверка выполняется из чистой временной копии** вне репозитория: изменённый `tests/run_contract_suite.mjs`
  копируется вместе с остальной рабочей source-копией во временную папку под Windows TEMP,
  там выполняются `npm ci --ignore-scripts` и `npm run verify`. Репозиторий для выполнения тестов
  не используется.
- **Статус:** не заменяет и не снимает `SEVENTH-B01`–`SEVENTH-B06` из седьмой технической проверки —
  это отдельная Windows-совместимость тестового раннера, не относящаяся к предметным blocking-замечаниям.

## DEV-S0-002 — cross-platform PostgreSQL orchestration

- **Причина:** оркестратор `tests/run_full_suite.mjs` безусловно компилировал через `gcc`
  Linux-only `LD_PRELOAD`-шим (`tests/local_postgres_nonroot_shim.c`) и запускал embedded
  PostgreSQL с `LD_PRELOAD`/`HOME=/tmp`/жёстко прописанным путём к
  `node_modules/@embedded-postgres/linux-x64/native/lib/` — независимо от того, задан ли внешний
  `DATABASE_URL`. На Windows `gcc` отсутствует, а сам механизм (`LD_PRELOAD`, ELF `.so`) неприменим,
  из-за чего offline suite падал на этом шаге даже после `DEV-S0-001`.
- **Затронутый файл:** `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/tests/run_full_suite.mjs`
  - добавлена константа `useExternalDatabase = Boolean(process.env.DATABASE_URL)`;
  - вызов `run_postgres_suite.mjs` разделён на три ветки:
    - **`DATABASE_URL` задан:** `gcc` не вызывается, `LD_PRELOAD`/ELF-шим не собирается, embedded
      PostgreSQL не запускается; `tests/run_postgres_suite.mjs` вызывается без переопределения
      `env` — дочерний процесс наследует `process.env` (включая `DATABASE_URL`) стандартным
      механизмом `spawnSync`, само значение нигде не читается, не выводится и не логируется этим
      файлом;
    - **`DATABASE_URL` не задан и платформа не Linux:** выбрасывается явная ошибка с требованием
      задать `DATABASE_URL` (текст ошибки не содержит значений переменных окружения); `gcc` не
      вызывается;
    - **`DATABASE_URL` не задан и платформа Linux:** прежний embedded-путь (`gcc` +
      `LD_PRELOAD`-шим) сохранён без изменения логики, побайтово идентичен предыдущему поведению;
  - поле отчёта `postgres.version` теперь отражает фактический режим (`external disposable
    instance via DATABASE_URL` либо `18.4 embedded disposable cluster`) — только описательная
    метаинформация, не влияет на сами проверки.
- **External DATABASE_URL path:** реализован условно, использует штатные скрипты пакета
  (`tests/run_postgres_suite.mjs`, который уже содержит ветвление `embedded = !DATABASE_URL` и
  выполняет migrations/assertions/teardown через `pg.Client`), без добавления собственной логики
  подключения к БД в оркестраторе.
- **Linux embedded path сохранён без изменений** — та же команда `gcc`, те же флаги, тот же
  `LD_PRELOAD`/`LD_LIBRARY_PATH`, просто вынесены в отдельную ветку `else`.
- **Продуктовая, юридическая и платёжная логика не менялась.** Изменения ограничены оркестрацией
  выбора embedded/external PostgreSQL; contract/business-модели, схемы, migrations, fixtures не
  тронуты.
- **Docker не управляется из `run_full_suite.mjs`** — поднятие/остановка disposable-контейнера
  остаётся обязанностью внешнего test harness; оркестратор только потребляет уже заданный
  `DATABASE_URL`.
- **DATABASE_URL и пароли не выводятся в логи** — файл нигде не читает и не печатает
  `process.env.DATABASE_URL` или его части; дочерний процесс получает переменную только через
  стандартное наследование окружения `spawnSync`.
- **Controlled artifacts не изменены.** ZIP, submission manifest, Proposal-документы и review —
  без изменений (см. `DEV-S0-001` выше, тот же периметр).

## DEV-S0-003 — точная post-down проверка контрактных ролей

- **Предыдущий `FAIL` был false positive.** Down-миграция (`migrations/001_matching_critical_chain.down.sql`)
  корректно удаляет все 12 ролей, создаваемых up-миграцией — это подтверждено анализом: к моменту
  `DROP ROLE IF EXISTS` ни одна из 12 ролей уже не владеет объектами (владение `leasemind_guard_owner`
  снимается через `DROP SCHEMA leasemind_security CASCADE` до строк `DROP ROLE`) и не имеет grants
  (права снимаются автоматически вместе с удаляемыми объектами).
- **Причина false positive — слишком широкий `LIKE`-шаблон.** `tests/post_down_assertions.sql` проверял
  `rolname LIKE 'leasemind_%'` вместо точного списка 12 контрактных ролей. `_` в PostgreSQL `LIKE`
  является wildcard-символом, соответствующим ЛЮБОМУ одному символу (а не только буквальному
  подчёркиванию) — поэтому шаблон `'leasemind_%'` совпадает с любой ролью, начинающейся на
  `leasemind`, за которой следует произвольный символ и произвольный хвост. В процессе Sprint 0
  disposable-контейнер был поднят с admin-ролью `leasemind_synthetic_user`, которая сама подпадает
  под этот шаблон, из-за чего assertion ошибочно считал «контрактные роли остались», хотя ни одна
  из 12 фактических контрактных ролей уже не существовала.
- **Затронутый файл:** `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/tests/post_down_assertions.sql`
  — проверка `rolname like 'leasemind_%'` заменена на `rolname = any(array[...])` с точным закрытым
  списком из 12 имён (`leasemind_guard_owner`, `leasemind_payer_writer`,
  `leasemind_participation_writer`, `leasemind_financial_writer`, `leasemind_previous_contact_writer`,
  `leasemind_identity_authority_writer`, `leasemind_lawful_basis_writer`, `leasemind_introduction_writer`,
  `leasemind_reveal_writer`, `leasemind_contract_reader`, `leasemind_outbox_publisher`,
  `leasemind_event_consumer`). `current_user` как механизм исключения не используется — проверка
  подтверждает отсутствие именно этих 12 ролей независимо от имени администратора, который выполняет
  проверку.
- **Migration up/down не менялись** — исправление затронуло только тестовый assertion-файл.
- **Риск заранее существовавших ролей остаётся отдельным Launch blocker.** Поскольку up-миграция
  создаёт роли только через `IF NOT EXISTS`, а down — безусловный `DROP ROLE IF EXISTS` по точным
  именам, на **shared/persistent** PostgreSQL-кластере роль с одним из этих 12 имён, существовавшая
  до применения миграции по не связанной причине, была бы удалена наравне с созданной этой
  миграцией. Это не устраняется данным исправлением и остаётся отдельным вопросом для
  `PRODUCTION_LAUNCH_GATE`.
- **Для Sprint 0 используется только disposable PostgreSQL** (одноразовый контейнер на каждый
  прогон, ничего не существует заранее) — в этом режиме риск отсутствует.

## DEV-S0-004 — корректная передача ошибок PostgreSQL runner

- **Причина:** `tests/run_postgres_suite.mjs` при внутренней ошибке (`primaryError`) устанавливал
  только `process.exitCode = 1`, не вызывая `process.exit()`. Эмпирически при top-level-await
  ESM-модуле это приводило к тому, что фактический OS-level exit code, доходящий до родителя через
  `spawnSync`, оказывался `0` вместо `1`. `tests/run_full_suite.mjs` проверял только
  `result.status !== 0` и затем безусловно вызывал `JSON.parse(postgres.stdout)`; поскольку runner
  при ошибке пишет отчёт только в stderr (stdout остаётся пустой строкой), а ложный exit code `0` не
  давал сработать проверке статуса, `JSON.parse('')` падал с `SyntaxError: Unexpected end of JSON input`
  вместо понятного сообщения о сбое PostgreSQL-проверок.
- **Затронутые файлы:**
  - `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/tests/run_postgres_suite.mjs`
    — добавлен `import {writeSync} from 'node:fs'`; добавлены `rawDatabaseUrl`/`scrubSecrets` сразу
    после определения `embedded`; в ветке `primaryError` сообщение об ошибке пишется синхронно через
    `writeSync(2, scrubSecrets(...))` (гарантированная синхронная запись в stderr вне зависимости от
    типа потока — TTY/pipe/файл), после чего вызывается явный `process.exit()` (завершает процесс с
    уже установленным `process.exitCode = 1`, не полагаясь на неявное естественное завершение).
  - `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/tests/run_full_suite.mjs`
    — добавлены `rawDatabaseUrl`/`scrubSecrets`; `run()` теперь дополнительно проверяет непустоту
    `result.stdout` ПОСЛЕ проверки exit code и ДО любого `JSON.parse`, с понятным сообщением при
    нарушении; добавлен `parseJsonOutput(label, text)`, оборачивающий `JSON.parse` в `try/catch` с
    указанием, какой именно дочерний процесс вернул невалидный JSON; вызовы `JSON.parse(...)` для
    contract/postgres/evidence-self выводов заменены на `parseJsonOutput(...)`; запись
    `postgres_execution.log` теперь санитизируется через `scrubSecrets(...)` перед записью на диск.
- **Санитизация секретов:** `scrubSecrets` в обоих файлах сначала вырезает точное значение
  `process.env.DATABASE_URL` (если оно задано) из любого текста перед выводом в stderr/лог, затем
  дополнительно вырезает regex-паттерном `postgres(ql)?://...` любую connection-string-подобную
  подстроку — двойная защита от утечки пароля/URL как в штатном, так и в нестандартном сценарии
  ошибки (например, если сообщение `pg`-драйвера само по себе содержит фрагмент connection string).
- **CT/EV/PG acceptance logic и их идентификаторы не менялись** — исправление затрагивает только
  передачу кода возврата, санитизацию логов и обработку JSON, не сами проверки и не их ID.
- **Продуктовая, юридическая и платёжная логика не менялась.** Controlled ZIP, submission manifest,
  Proposal-документы и DEVELOPMENT review — без изменений.
