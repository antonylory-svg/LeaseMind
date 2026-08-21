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

## SEVENTH-B01 — UUID version enforcement (только UUID v4/v7)

- **Root cause:** три независимых слоя валидации UUID (OpenAPI `format: uuid`, AsyncAPI
  `format: uuid`, PostgreSQL regex в `validate_event_payload`) не были синхронизированы. Схемы не
  ограничивали версию вообще; DB regex ограничивал версию nibble диапазоном `[1-8]` вместо `[47]`.
  Независимый probe с UUID v1 `6ba7b810-9dad-11d1-80b4-00c04fd430c8` проходил все три слоя. Штатная
  mutation-матрица PG-019 проверяла только строку `not-a-uuid`, поэтому неверную версию (при
  корректном синтаксисе UUID) не обнаруживала.
- **Изменённые файлы:**
  - `openapi.yaml` — добавлен переиспользуемый компонент `UuidV4OrV7` (`format: uuid` +
    `pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[47][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'`);
    все 63 инлайновых `{type: string, format: uuid}` заменены на `{$ref: '#/components/schemas/UuidV4OrV7'}`.
  - `asyncapi.yaml` — тот же компонент `UuidV4OrV7` с идентичным pattern; все 35 инлайновых
    `{type: string, format: uuid}` заменены на `$ref`.
  - `migrations/001_matching_critical_chain.up.sql:1570` (`validate_event_payload`) — version nibble
    `[1-8]` заменён на `[47]`; RFC variant `[89ab]` и case-insensitive оператор `!~*` не менялись.
  - `fixtures/synthetic_fixtures.mjs` — добавлена и экспортирована детерминированная константа
    `UUID_V7 = '00000000-0000-7000-8000-000000000001'`.
  - `tests/run_postgres_suite.mjs` — `eventUuid()` параметризован версией (по умолчанию `'4'`, все
    существующие вызовы без изменений); добавлены `FORBIDDEN_UUID_VERSIONS = ['1','2','3','5','6','8']`
    и `uuidVersionSample(version, seed)`; `payloadMutations()` теперь генерирует по 6
    version-мутаций (`invalid-uuid-v1`…`invalid-uuid-v8`) на каждое uuid-поле payload в дополнение к
    прежней `invalid-uuid`; в основной цикл PG-019 добавлена positive-вставка с UUID v7 для каждого
    из 33 событий (первое использует именно `UUID_V7` из fixtures); required-kind список и evidence
    расширены (`positive_uuid_v7_probes`, `forbidden_uuid_version_mutations`), сохранив все прежние
    проверки без ослабления.
  - `tests/run_contract_suite.mjs` — добавлены `resolveRef`/`mergeSchema`/`collectUuidPaths`/
    `setAtPath`/`uuidVersionSample` (корректно разворачивают `$ref` и `allOf`-композицию); CT-002
    расширен negative/positive UUID-version проверками по всем uuid-полям envelope+payload всех 33
    AsyncAPI-событий; CT-003 расширен тем же механизмом для всех uuid-полей (включая вложенные
    `parties[]`/`source_leases[]`) во всех 9 OpenAPI-команд.
- **Разрешены только UUID v4 и v7** — на всех трёх слоях (OpenAPI ajv, AsyncAPI ajv, PostgreSQL regex)
  одновременно; версии 1, 2, 3, 5, 6, 8 отклоняются везде.
- **Количество probes:** CT-002 — 33 события × все обнаруженные uuid-поля envelope+payload × (6
  negative + 1 positive-v7); CT-003 — 9 команд × все обнаруженные uuid-поля (включая элементы
  массивов) × (6 negative + 1 positive-v7); PG-019 — 33 positive-v4 вставки (сохранены) + 33
  positive-v7 вставки (новые) + по 6 version-мутаций на каждое uuid-поле payload каждого события
  (rollback-absence проверяется существующим механизмом `assertRejected`+`select count(*)`).
  Точные числа фиксируются в `synthetic_verification_report.json` каждого прогона (поля
  `uuid_fields_checked`, `forbidden_uuid_version_rejections`, `uuid_v7_acceptances` в CT-002/CT-003;
  `positive_uuid_v7_probes`, `forbidden_uuid_version_mutations` в PG-019).
- **Известное ограничение (раскрыто, не скрыто):** автоматическая negative/positive проверка uuid-
  полей охватывает поля, достижимые через существующие request/event fixtures (request body и event
  envelope+payload). Uuid-поля, встречающиеся только в success-response схемах (не покрытых
  fixture-механизмом ни до, ни после этого патча), получили ту же схемную `UuidV4OrV7` ссылку
  (статически защищены), но не имеют отдельного runtime negative-probe в CT — это не регрессия, а
  тот же охват, что и у остальной части test suite.
- **Не ослаблены существующие проверки; идентификаторы CT/EV/PG не менялись** — все правки добавляют
  новые ассерты внутри существующих тестов (CT-002, CT-003, PG-019), не переименовывая и не удаляя
  ни одной проверки.
- **Продуктовая, юридическая и платёжная логика не менялась.** Migration up/down не меняли структуру
  данных, только regex; controlled ZIP, submission manifest, Proposal-документы и DEVELOPMENT review
  — без изменений.

## SEVENTH-B02 — DLP parity and separator normalization

- **Root cause:** service (`containsDirectIdentifier`) и PostgreSQL (`validate_no_direct_identifiers`)
  под одной версией `DLP_EVENT_CONTENT_V1` реализовывали РАЗНЫЕ алгоритмы: service — универсальный
  `\D`-strip (принимает ЛЮБОЙ нецифровой разделитель); DB — 10 regex-альтернатив над сериализованным
  документом целиком, каждая со своим явно перечисленным набором разделителей (только пробел/дефис/
  скобки). Точка, `_`, `/`, NBSP, narrow NBSP, zero-width символы не входили ни в одну DB-альтернативу
  — `7.999.123.45.67`, `7_999_123_45_67` и zero-width-вариант проходили DB, но отклонялись service.
- **Fail-closed service semantics сохранены без ослабления.** `tests/synthetic_service_models.mjs` —
  выделен именованный `normalizeDlpScalar(value)` (`String(value).normalize('NFKC').replace(/\D/g,'')`)
  — та же `\D`-strip логика, что и раньше, только вынесена в переиспользуемую функцию; дополнительно
  `containsDirectIdentifier` теперь также проверяет `number`-скаляры (ранее пропускались), что строго
  усиливает, а не ослабляет, покрытие.
- **PostgreSQL приведён к universal non-digit stripping.** `migrations/001_matching_critical_chain.up.sql`
  — добавлена `leasemind_security.normalize_dlp_scalar(text)`: `regexp_replace(normalize(p_value, NFKC),
  '[^0-9]', '', 'g')` — Unicode NFKC, затем удаление всего, кроме ASCII-цифр — зеркально service.
- **Per-scalar рекурсия вместо сериализации всего документа.** Добавлена
  `leasemind_security.scan_dlp_scalar(jsonb)` — рекурсивно обходит `object` (проверка forbidden keys
  на каждом уровне + рекурсия в значения через `jsonb_each`), `array` (рекурсия в элементы через
  `jsonb_array_elements`), `string`/`number` (нормализация через `normalize_dlp_scalar` + проверка
  10/11/16-19-значных форм, плюс email/address regex на исходном тексте). Цифры разных JSON scalar
  values никогда не объединяются — каждый scalar нормализуется независимо.
  `validate_no_direct_identifiers(jsonb)` теперь — тонкая обёртка над `scan_dlp_scalar`; имя и
  версия (`comment on function ... is 'DLP_EVENT_CONTENT_V1'`) не менялись. Добавлены `revoke`/`grant`
  для двух новых функций, зеркально существующим (те же 9 ролей).
- **Forbidden keys, email, address, другие DLP-классы не менялись.** Email/address regex —
  побайтово те же паттерны. Forbidden-keys: сохранена ИСХОДНАЯ DB-семантика точного совпадения ключа
  (`lower(key) = any(array['email',...])`, зеркально прежнему `"(email|...)"[[:space:]]*:` на
  сериализованном документе) — а не substring-семантика JS `FORBIDDEN_KEYS`. Это осознанный выбор:
  контрактные поля `previous_contact_decision_id`/`previous_contact_decision_version` содержат
  подстроку «contact», и переход DB на substring-match (для «полной параллели» с JS) при первом же
  прогоне против реальных 33 event payloads (впервые проверено сквозным прогоном, а не точечными
  фикстурами) ложно блокировал бы весь тип события `PREVIOUS_CONTACT_DECISION_CHANGED`. Это
  единственное осознанное расхождение service/DB, вне периметра SEVENTH-B02 (который про нормализацию
  разделителей чисел, а не про стратегию сопоставления ключей) и существовавшее до этого патча;
  golden corpus его не затрагивает (ни один вектор не использует «contact»-подобные ключи).
- **Дополнительно обнаружено и исправлено при верификации:** `uuidVersionSample` (SEVENTH-B01,
  `tests/run_postgres_suite.mjs` и `tests/run_contract_suite.mjs`) генерировал значения вида
  `00000000-0000-Xf00-8fff-abcdef<seq>ab`, которые при ПОЛНОМ (не только по разделителям) удалении
  нецифровых символов чаще всего давали 16-19 «выживших» цифр — ровно запрещённый диапазон новой
  строгой DLP-проверки. Заменено на `aaaaaaaa-aaaa-Xaaa-aaaa-aaaaaaaaaaaa` — единственная цифра во
  всей строке — version nibble; digit-strip даёт длину 1 независимо от версии, счётчик больше не
  нужен (значение не используется как ключ уникальности).
- **Единый golden DLP corpus — программно генерируемый cross-product**, новый файл
  `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/tests/fixtures/dlp_golden_vectors.mjs`,
  импортируется и `tests/run_contract_suite.mjs` (CT-023), и `tests/run_postgres_suite.mjs` (PG-026).
  Corpus строится через `Object.entries(CLASS_DIGITS).flatMap(...)` по 15 `SEPARATOR_VARIANTS` —
  не отдельными несогласованными массивами на класс:
  - **45 scalar vectors** = 3 класса (phone/passport/card) × 15 разделителей (без разделителя,
    пробел, дефис, скобки, точка, `_`, `/`, NBSP, narrow NBSP, zero-width space/non-joiner/joiner,
    смешанные разделители, буквы между цифрами, прочие символы между цифрами) — полная матрица
    **15/15/15**, без единого пропуска;
  - **+6 контейнерных vectors** = 3 класса × {nested-object, array} — **2/2/2**;
  - **итого 51 malicious vector** (было 32 на предыдущей итерации — добавлены все ранее
    отсутствовавшие 19 клеток для passport и card);
  - **5 safe control vectors** (без изменений) — после нормализации дают 3, 4, 7, 8 или 9 цифр
    (не 10/11/16-19), длина 16+ символов (совместимо с ограничением `trace_id`).
  Экспортирована `computeDlpMatrixCoverage()` — чистая функция без побочных эффектов, возвращающая
  `classCoverage`/`containerCoverage`/`isComplete`; вызывается явным `assert`-блоком и в CT-023, и в
  PG-026 — при исчезновении любой клетки матрицы соответствующий suite падает тестовой ошибкой
  (не необработанным исключением при импорте), с точным указанием, какого класса/скольки
  разделителей/контейнеров не хватает.
- **Service/DB parity проверяется явно в PG-026** для всех 51 malicious + 5 safe vectors: для
  каждого сравнивается вердикт `containsDirectIdentifier` (JS) с фактическим результатом INSERT в
  PostgreSQL; любое расхождение падает как `assert.equal(parityMismatchIds.length, 0, ...)` — test
  failure, а не тихий пропуск. Фактический результат прогона: **51/51 malicious rejected, 5/5 safe
  accepted, 0 parity mismatches** (оба слоя, полная матрица).
- **Синтетические идентификаторы не печатаются** — в assertion-сообщениях используются только
  `vector.id`/`vector.class`; DB-ошибка возвращает фиксированную строку `LM-DATA-CLASSIFICATION-VIOLATION`
  без интерполяции значения (не изменено).
- **CT/EV/PG идентификаторы не менялись** — правки добавляют ассерты внутри существующих CT-023 и
  PG-026, ничего не переименовано и не удалено.
- **Продуктовая, юридическая и платёжная логика не менялась.** Down-migration не трогалась (новые
  функции живут в `leasemind_security` и удаляются существующим `drop schema ... cascade`). Controlled
  ZIP, submission manifest, Proposal-документы и DEVELOPMENT review — без изменений.

## SEVENTH-B03 — server-owned время в redeem_reveal_token

- **Root cause:** `leasemind_security.redeem_reveal_token` принимал `p_redeemed_at timestamptz` от
  caller и использовал это значение как единственный источник времени для TTL-проверки токена,
  проверки актуальности lease (`expires_at > p_redeemed_at`), `attempted_at`, `redeemed_at` и
  `result.redeemed_at`. Caller мог передать произвольное (в т.ч. задним числом) значение — время
  редемпшна не было server-owned, что противоречит инварианту неизменяемого Attempt и
  server-calculated result.
- **Затронутый файл:** `migrations/001_matching_critical_chain.up.sql` (строки ~1168–1330,
  `redeem_reveal_token`), синхронно `migrations/001_matching_critical_chain.down.sql` (`drop function`).
  OpenAPI уже не принимал время от caller (`/reveal/tokens/redeem` не имеет request body и
  time-параметра) — правка приводит SQL-сигнатуру в соответствие уже корректному API-контракту;
  `openapi.yaml`/`asyncapi.yaml` не менялись.
- **Техническое исправление:**
  - параметр `p_redeemed_at` удалён из публичной сигнатуры целиком; новая сигнатура —
    `(p_reveal_token_id uuid, p_token_hash char(64), p_idempotency_key text, p_request_hash char(64))`
    (4 аргумента); старая 5-аргументная сигнатура после `up` не существует (проверено через
    `pg_proc`/`pg_get_function_identity_arguments`, `count = 1`);
  - после получения всех необходимых locks (см. SEVENTH-B04 ниже) время вычисляется один раз —
    `v_redeemed_at := clock_timestamp();` — и переиспользуется для: проверки `issued_at` (новая
    проверка `LM-REVEAL-TOKEN-NOT-YET-VALID` для токенов с будущим `issued_at`), проверки
    `expires_at` (`LM-REVEAL-TOKEN-EXPIRED`), проверки актуальности lease
    (`lease.expires_at > v_redeemed_at`), `reveal_attempt.attempted_at`, `reveal_token.redeemed_at`
    и `result.redeemed_at`/`result`-hash;
  - время вычисляется ПОСЛЕ ожидания всех locks — токен, срок действия которого истекает во время
    ожидания lock, не может быть погашен (проверка TTL видит уже актуальное время);
  - правила same-idempotency-key replay, new-key-after-use, immutable Attempt, server-owned
    result/hash — не изменены (идентичны предыдущей версии функции, оперируют теми же полями).
- **`alter function owner to` / `revoke` / `grant execute`** — обновлены на новую 4-аргументную
  сигнатуру во всех трёх местах (владелец `leasemind_guard_owner`, execute — `leasemind_reveal_writer`).
- **`tests/run_postgres_suite.mjs`** — все вызовы `redeem_reveal_token` (redeemSql, redeemParams,
  raceParams, все `assertRejected`) приведены к 4 аргументам; добавлены probes: старая 5-аргументная
  форма отклоняется PostgreSQL как несуществующая функция (`does not exist`) — это же служит
  доказательством, что caller не может передать время задним числом (параметра для этого больше
  нет); отдельный `pg_proc`-assert подтверждает единственную 4-аргументную сигнатуру после `up`;
  добавлены выделенные токены для expired (`expires_at` в прошлом относительно `clock_timestamp()`)
  и future-issued (`issued_at` в будущем, на отдельном dedicated snapshot с future `valid_until`,
  т.к. существующий `critical.snapshot` использует устаревший фиксированный `valid_until`) сценариев.
- **DB-relative время вместо фиксированных литералов там, где это необходимо.** Поскольку
  `redeem_reveal_token` теперь сверяется с реальным `clock_timestamp()`, а большая часть существующих
  fixtures в файле датирована фиксированным `2026-07-24` (в прошлом на момент реального прогона),
  добавлены `dbNow`/`dbPlusMinutes`/`dbMinusMinutes` (на основе одного `select clock_timestamp()` в
  начале прогона) и применены точечно к полям, которые реально сравниваются с текущим временем внутри
  функции: `source_reveal_lease.expires_at`, `reveal_token.expires_at`. `issued_at` существующих
  токенов и `valid_until`/`reveal_guard_epoch` существующих snapshot не менялись — они остаются
  корректными под новой server-time проверкой без изменения (старый `issued_at` всегда в прошлом
  относительно реального времени прогона).
- **Продуктовая, юридическая и платёжная логика не менялась.** Изменение ограничено источником
  времени редемпшна и синхронизацией сигнатуры функции; правила состояний Reveal/Attempt не менялись.

## SEVENTH-B04 — согласованный lock order redeem_reveal_token / invalidation

- **Root cause:** `redeem_reveal_token` не блокировал `source_reveal_lease`/`reveal_guard` явно —
  проверки epoch/lease-count читались обычным (не `FOR UPDATE`) `SELECT` после блокировки только
  `reveal_token`. Конкурентная `apply_safety_critical_invalidation` (которая блокирует
  `source_reveal_lease`, затем `leasemind_security.reveal_guard`) могла закоммититься между чтением
  и записью редемпшна, оставляя окно гонки: редемпшн мог завершиться успешно на основании уже
  устаревших epoch/lease-state.
- **Затронутый файл:** `migrations/001_matching_critical_chain.up.sql`, та же функция
  `redeem_reveal_token`, что и в SEVENTH-B03 (правки объединены в одном прогоне миграции).
- **Техническое исправление — единый lock order, зеркальный `apply_safety_critical_invalidation`:**
  1. `reveal_token` — `FOR UPDATE` по `reveal_token_id` (как и раньше, первым);
  2. требуемые `source_reveal_lease` — блокируются через `PERFORM 1 ... FOR UPDATE OF lease`,
     JOIN `reveal_gate_snapshot_source` → `source_reveal_lease` по `reveal_gate_snapshot_id`, со
     стабильным `ORDER BY lease.lease_id` (детерминированный порядок блокировки строк —
     предотвращает deadlock при пересекающемся наборе строк с любой другой транзакцией,
     блокирующей те же lease в том же порядке); агрегат (`count`) в эту блокирующую выборку не
     включён — строки сначала блокируются, количество активных считается отдельным `SELECT count(*)`
     после блокировки;
  3. `leasemind_security.reveal_guard` — `SELECT guard_epoch ... FOR UPDATE` по `encounter_id`;
  4. после этого — вычисление `v_redeemed_at` (SEVENTH-B03) и повторная проверка issued_at/expires_at/
     epoch/lease-count поверх уже заблокированных данных;
  5. только затем — мутация `reveal_attempt`/`reveal_token`.
  Порядок блокировки инвалидации (`source_reveal_lease` → `reveal_guard`, см.
  `apply_safety_critical_invalidation`) не менялся — редемпшн приведён к тому же порядку, а не
  наоборот.
- **Два детерминированных two-session probe без произвольного sleep**, добавлены в
  `tests/run_postgres_suite.mjs` на полностью изолированных encounter/lease/snapshot/token fixtures
  (`buildRaceFixture`, seed-диапазоны 3800–3839 и 3900–3939) — существующая история epoch для
  `ids.encounter` (используется в PG-025/compositeToken) не затронута:
  - **invalidation-first:** соединение A открывает транзакцию, вызывает
    `apply_safety_critical_invalidation` (блокирует lease+guard), не коммитит; соединение B
    одновременно вызывает `redeem_reveal_token` на том же encounter — блокировка подтверждается
    через `pg_stat_activity.wait_event_type = 'Lock'` (детерминированный барьер, не `sleep`); после
    commit A редемпшн B гарантированно отклоняется (`LM-GATE-GUARD-EPOCH-STALE` или
    `LM-GATE-LEASE-SET-INCOMPLETE`), токен остаётся непогашенным;
  - **redemption-first:** соединение A предварительно блокирует те же lease+guard строки в своей
    транзакции (`FOR UPDATE`/`FOR UPDATE OF lease`, тот же запрос, что использует сама функция —
    повторная блокировка тех же строк той же транзакцией не блокирует саму себя), затем вызывает
    `redeem_reveal_token` (успешно, locks уже удерживаются) и коммитит; соединение B (конкурентная
    инвалидация) блокируется на тех же строках (подтверждено тем же `pg_stat_activity`-барьером) и
    может продолжиться только после commit A — результат редемпшна остаётся неизменным и не
    откатывается последующей инвалидацией.
  - **Обнаруженная и исправленная ошибка теста при верификации:** PID целевого соединения для
    `pg_stat_activity`-проверки должен быть получен ДО отправки блокирующего запроса на этом же
    соединении — `pg` сериализует запросы по соединению, поэтому попытка получить `pg_backend_pid()`
    на уже занятом блокирующимся запросом соединении сама встаёт в очередь и никогда не выполняется.
    Исправлено: PID обеих сторон каждой гонки фиксируется сразу после `connect()`, до старта
    блокирующего запроса.
- **Не изменён порядок блокировки внутри `apply_safety_critical_invalidation`/`bump_reveal_guard`/
  `transition_source_reveal_lease`** — эти функции не редактировались.
- **Продуктовая, юридическая и платёжная логика не менялась.**
- **Controlled artifacts не изменены.** ZIP (`LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip`),
  submission manifest, `openapi.yaml`, `asyncapi.yaml`, `docs/`, Proposal-документы и review — без
  изменений (подтверждено `git status`/сверкой SHA-256 до и после правки).
- **Верификация:** offline CT (28/28 PASS) и EV (7/7 PASS) в чистой временной копии; полный
  PostgreSQL 18.4 lifecycle (up → 30 PG-проверок, включая обновлённый PG-030 и оба новых race-probe,
  → down → post-down catalog empty) на disposable-контейнере (`lmtest_admin`, синтетический пароль,
  `127.0.0.1` + случайный порт, `tmpfs`, без persistent volume, контейнер удалён после прогона).

## SEVENTH-B05 — доказанная привязка event_type к consumer payload schema

- **Root cause:** `CT-028` проверял только существование `consumer_operation`, `operation.action==='receive'`
  и truthy `operation.channel?.$ref` — но никогда не резолвил `operation.channel → channel.messages →
  message.payload → schema.properties.event_type.enum/const` и не сверял с этим множеством фактический
  `route.event_type`. Routing table (`x-leasemind-event-routing`, `asyncapi.yaml`) и schema graph
  (9 envelope-схем с собственным `event_type` discriminator) — две независимые системы истины; тест
  проверял только первую и не сверял её со второй. Независимая mutation (swap `consumer_operation`
  для `PAYER_RESOLUTION_REQUIRED` на `consumeDecisionRecorded`) проходила все существующие assertions.
  Read-only анализ (предыдущий turn) показал: 33 event_type, 9 payload-схем, 0 структурно
  неразличимых пар required-fields — существующий discriminator уже достаточен, привязку нужно было
  только начать проверять.
- **Затронутый файл:** `tests/run_contract_suite.mjs`, тест `CT-028`. Никаких изменений в
  `asyncapi.yaml`/`openapi.yaml`/migrations/fixtures/бизнес-событиях — discriminator уже существовал
  корректно в схемах, отсутствовала только проверка со стороны теста.
- **Техническое исправление:**
  - добавлен `resolveConsumerBinding(consumerOperationName)` — резолвит **только** от
    `consumer_operation` (никогда от `fixture.schemaName` или любого другого отдельно переданного
    значения): `asyncapi.operations[name] → channel (resolveRef) → channel.messages (resolveRef на
    каждое message) → message.payload (mergeSchema, разворачивает allOf) →
    schema.properties.event_type.enum ?? [schema.properties.event_type.const]`; переиспользованы
    существующие `resolveRef`/`mergeSchema` (SEVENTH-B01) — вторая независимая resolution-логика не
    создавалась;
  - для каждой из 33 routing rows: `route.event_type` должен входить в разрешённое множество, иначе
    `assert.ok` бросает с точным именем события и operation;
  - сохранены все существующие проверки: `route.producer === fixture.envelope.producer`,
    `route.owner_role === ownerRoleByProducer.get(route.producer)` (source-owner/domain binding),
    `operation.action==='receive'`, truthy `channel.$ref` — ни одна не ослаблена и не удалена;
  - построена полная ordered mismatch matrix: 33 rows × 8 «чужих» из 9 `consumer_operation`
    (корректная диагональ исключена) = **264** отдельных probe; каждый выполняет собственный
    `assert.equal(Boolean(foreignMatch), false, ...)` — ни один swap не пропускается после первого
    успешного (**"проверка только одного swap недостаточна"** выполнено буквально: 264 отдельных
    assertion-вызовов, не один общий);
  - добавлен structural-indistinguishability guard: required-fields всех 9 payload-схем (резолвятся
    от `binding.payloadSchemaName`, полученного той же цепочкой) сравниваются попарно;
    `structurally_indistinguishable_pairs` должен быть `0` — фиксирует инвариант из read-only анализа
    как исполняемую проверку, а не только вывод отчёта;
  - добавлен явный негативный self-test: swap `PAYER_RESOLUTION_REQUIRED` → `consumeDecisionRecorded`,
    `assert.equal(acceptsEventType(...), undefined, ...)` — независимая, отдельно поддерживаемая
    проверка сверх 264 ordered mismatches.
  - evidence CT-028 расширен: `valid_exact_bindings:33`, `ordered_mismatch_probes:264`,
    `accepted_mismatches:0`, `structurally_indistinguishable_pairs:0`, `swap_self_test_blocked:1`,
    `bindings:[...]` — массив из 33 immutable tuples `{event_type, consumer_operation, channel,
    message, payload_schema}`, отсортированный детерминированно (`a.event_type < b.event_type`,
    обычное сравнение строк по code point, без `localeCompare` — исключает зависимость от locale/ICU
    между машинами). Старые count-поля (`explicit_routing_rows`, `owner_consumer_bindings`,
    `consumer_operations_checked`) сохранены без изменений.
- **`tests/evidence_matrix.mjs`:** `CT_EVIDENCE_REQUIREMENTS['CT-028']` дополнен пятью scalar-проверками
  (`equals: 33/264/0/0/1`) и одной проверкой массива `bindings` через `equals` с точным hardcoded
  литералом всех 33 tuples в каноническом порядке. Поскольку `sameValue` сравнивает через
  `JSON.stringify`, один этот `equals` одновременно проверяет: отсутствие дубликатов (иначе длина/
  состав массива не совпадёт), полное совпадение с routing table (отсутствие лишних/пропущенных
  event_type), и стабильность sort (порядок должен побайтово совпасть с литералом). Литерал
  сгенерирован программно из живого `asyncapi.yaml` (не написан вручную) и независимо проверен
  сравнением с фактическим выводом CT-028 перед фиксацией в файле.
- **CT-028 корректно ловит настоящую порчу:** проверено end-to-end (вне репозитория, во временной
  копии) — реальная подмена `consumer_operation` для `PAYER_ASSIGNED` в `asyncapi.yaml` на
  `consumeDecisionRecorded` даёт `CT-028 FAIL` с сообщением `PAYER_ASSIGNED: consumer_operation
  consumeDecisionRecorded payload schema does not declare this event_type`; исходный (не изменённый)
  `asyncapi.yaml` снова даёт `CT-028 PASS`.
- **Продуктовая, юридическая и платёжная логика не менялась.** Runtime-схемы (AsyncAPI/OpenAPI),
  migrations и состав бизнес-событий не изменены — исправление целиком в тестовом слое, доказывающем
  уже существующий контракт.
- **Controlled artifacts не изменены.** ZIP, submission manifest, `openapi.yaml`, `asyncapi.yaml`,
  `docs/`, Proposal-документы и review — без изменений (подтверждено `git status` и SHA-256 до/после).
- **Верификация:** offline CT (28/28 PASS, включая `CT-028` с 33/33 exact bindings, 264/264 ordered
  mismatches blocked, 0 accepted mismatches, 0 structurally indistinguishable pairs) и EV (7/7 PASS) в
  чистой временной копии; полный PostgreSQL 18.4 lifecycle (30/30 PG-проверок, up → down → empty
  catalog) как regression на новом disposable-контейнере (`lmtest_admin`, синтетический пароль,
  `127.0.0.1` + случайный порт, `tmpfs`, без persistent volume, контейнер удалён после прогона) —
  без изменений в PostgreSQL-слое, результат идентичен предыдущему прогону.

## SEVENTH-B06 — server-derived domain-separated deletion_act_hash

- **Root cause:** `cryptoUnlink(record)` не вычислял `deletion_act_hash` — функция просто копировала
  `record.deletion_act_hash` в output без единой проверки. Caller (или любой upstream-контекст) мог
  передать в это поле исходный `event_hash`, `correlation_id`, любой другой stable source hash или
  hash другого deletion act — retention tombstone сохранял это значение под разрешённым именем поля и
  проходил существовавшую exact-key проверку `CT-024` (которая проверяла только СОСТАВ ключей output,
  никогда — независимость ЗНАЧЕНИЯ `deletion_act_hash` от каких-либо source hash). Ни в
  `openapi.yaml`, ни в `asyncapi.yaml`, ни в `migrations/001_matching_critical_chain.up.sql`
  `cryptoUnlink`/`deletion_act`/`tombstone` не упоминаются вообще — дефект целиком в service reference
  model и её test contract.
- **Затронутые файлы:** `tests/synthetic_service_models.mjs` (`cryptoUnlink`), `tests/run_contract_suite.mjs`
  (`CT-024`), `tests/evidence_matrix.mjs` (`CT_EVIDENCE_REQUIREMENTS['CT-024']`).
- **Canonical preimage и domain separator:** `deletion_act_hash` теперь вычисляется внутри
  `cryptoUnlink` через уже существующие `canonicalJson`/`sha256` (использовались ранее только в
  `IdempotencyStore`/`RevealTokenStore` — вторая независимая hashing-логика не создавалась):
  ```
  sha256(`${DELETION_ACT_DOMAIN_TAG}\0${canonicalJson({
    unlink_operation_id, deletion_category, policy_version, deleted_at
  })}`)
  ```
  `DELETION_ACT_DOMAIN_TAG = 'LEASEMIND_DELETION_ACT_V1'` — экспортированная строковая константа
  внутри доверенной реализации (`tests/synthetic_service_models.mjs`), не caller input; NUL-байт
  (`\0`) между domain tag и canonical JSON — однозначный разделитель, исключающий неоднозначную
  конкатенацию (в отличие от простого `tag + json` без разделителя, где границу тэга/JSON можно было
  бы сдвинуть подбором значений полей).
- **`record.deletion_act_hash` больше не читается вообще** — переменная убрана из функции полностью
  (не читается, не копируется, не сохраняется); это не "игнорируется после чтения", это физическое
  отсутствие обращения к этому полю входного `record` в теле функции.
- **Preimage построен только из уже разрешённых/раскрываемых полей** (`unlink_operation_id`,
  `deletion_category`, `policy_version`, `deleted_at`) — без добавления новой бизнес-информации;
  `unlink_operation_id` генерируется внутри `cryptoUnlink` через `randomUUID()` (как и раньше,
  server-owned, свежий на каждый вызов) и обеспечивает uniqueness/non-reuse hash между разными
  deletion acts даже при идентичных остальных трёх полях.
- **Состав output не изменён:** `unlink_operation_id`, `deletion_category`, `policy_version`,
  `deleted_at`, `deletion_act_hash` — те же 5 ключей, тот же порядок вычисления
  `Object.keys(out).sort()` в `CT-024`, юридический состав deletion act и правила удаления (Data
  Contracts п.24) не менялись.
- **`CT-024` acceptance probes добавлены:**
  - **caller-controlled hash probes (6):** отдельные вызовы `cryptoUnlink`, где `deletion_act_hash`
    равен по очереди `event_hash`, `correlation_id`, `payload_hash`, `result_hash`, hash другого
    deletion act и произвольному валидному SHA-256 (`sha256('attacker-chosen-arbitrary-preimage')`);
    для каждого: `assert.notEqual(out.deletion_act_hash, candidate)` и независимая server-side
    recomputation совпадает с `out.deletion_act_hash` — переданное значение не влияет на результат;
  - **derivation recompute:** `recomputeDeletionActHash(result)` берёт `unlink_operation_id` из
    РЕЗУЛЬТАТА, пересобирает точный domain-separated canonical preimage и вычисляет `sha256`;
    применяется к базовому вызову, ко всем 6 caller-controlled probes и к hash-reuse probe;
  - **hash-reuse probe:** два вызова с идентичными `deletion_category`/`policy_version`/`deleted_at`
    дают разные `unlink_operation_id` и разные `deletion_act_hash` — hash одного deletion act нельзя
    получить повторно для другого;
  - **hash format:** `deletion_act_hash` — lowercase hex, ровно 64 символа (`/^[0-9a-f]{64}$/`);
  - существующие проверки сохранены без изменений: `allowed_tombstone_fields` (key-set),
    `prohibited_source_fields_absent` (8), `stable_source_hashes_absent` (2), string-search по 7
    сырым значениям, формат `unlink_operation_id`.
  - **Проверено end-to-end (вне репозитория, во временной копии):** временный откат `cryptoUnlink` к
    старому passthrough (`deletion_act_hash: record.deletion_act_hash`) даёт немедленный `CT-024 FAIL`
    на первой же проверке (`out.deletion_act_hash` равен переданному `'d'.repeat(64)`), подтверждая,
    что новые probes реально ловят регресс, а не проходят вхолостую; после восстановления исправленной
    версии `CT-024` снова `PASS`.
- **`tests/evidence_matrix.mjs`:** `deletion_act_hash_preserved` (семантически неверное имя после
  фикса — hash больше не «preserved» от caller) заменён на четыре реально вычисляемые метрики:
  `caller_controlled_hash_probes` (equals 6, счётчик цикла), `derivation_recompute_matches` (equals 1),
  `hash_reuse_prevented` (equals 1), `hash_format_valid` (equals 1). `allowed_tombstone_fields`,
  `prohibited_source_fields_absent`, `stable_source_hashes_absent` не изменены.
- **Продуктовая, юридическая и платёжная логика не менялась.** Правила удаления и обязательный audit
  evidence (Data Contracts п.24) не менялись — только способ вычисления `deletion_act_hash` внутри
  доверенной операции.
- **Controlled artifacts не изменены.** ZIP, submission manifest, `openapi.yaml`, `asyncapi.yaml`,
  migrations, fixtures, `docs/`, Proposal-документы и review — без изменений (подтверждено
  `git status` и SHA-256 до/после).
- **Верификация:** offline CT (28/28 PASS, включая `CT-024` с 6/6 caller-controlled hash probes
  blocked, derivation recompute PASS, hash-reuse prevention PASS, hash format PASS) и EV (7/7 PASS) в
  чистой временной копии; полный PostgreSQL 18.4 lifecycle (30/30 PG-проверок, up → down → empty
  catalog) как regression на новом disposable-контейнере (`lmtest_admin`, синтетический пароль,
  `127.0.0.1` + случайный порт, `tmpfs`, без persistent volume, контейнер удалён после прогона) — без
  изменений в PostgreSQL-слое (`cryptoUnlink` не затрагивает миграции), результат идентичен
  предыдущему прогону.

## Sprint 7 corrective pass — DLP forbidden-key parity и синхронизация controlled ZIP (2026-08-20)

Read-only восьмая проверка DEVELOPMENT (фаза 1) подтвердила все шесть исправлений `SEVENTH-B01–B06`
реальными и доказанными исполняемыми тестами, но обнаружила два разрыва вне периметра любого
отдельного `SEVENTH-B0x`: (1) JS `containsDirectIdentifier` и PostgreSQL `scan_dlp_scalar`
использовали разные стратегии сопоставления forbidden-key (substring vs exact) без corpus-доказательства
паритета; (2) controlled ZIP/manifest, на которые ссылаются README и Architecture §42/§52.1, не
содержали ни одного из шести исправлений — контролируемый артефакт оставался версией, провалившей
седьмую проверку, хотя рабочая копия `source/` уже была исправлена. Настоящий corrective pass закрывает
оба разрыва без изменения продуктовой, юридической или платёжной логики.

### DLP forbidden-key parity

- **Root cause:** JS `FORBIDDEN_KEYS = /(?:email|phone|passport|bank|card|address|contact|full_name)/i`
  matчил forbidden-токен как substring где угодно внутри имени ключа; PostgreSQL `scan_dlp_scalar`
  сравнивал `lower(key)` с фиксированным массивом токенов точным совпадением. Golden corpus (`SEVENTH-B02`)
  доказывал паритет только для VALUE-normalization (разделители внутри чисел), но не содержал ни одного
  container-вектора, проверяющего сопоставление самого имени KEY — расхождение стратегий оставалось
  недоказанным и неисправленным.
- **Почему substring не выбран как каноническая стратегия:** контрактные, обязательные поля
  `previous_contact_decision_id` и `previous_contact_decision_version` (`PreviousContactEventPayload.required`,
  `asyncapi.yaml`) содержат подстроку «contact». Переход DB на substring-match сделал бы весь тип события
  `PREVIOUS_CONTACT_DECISION_CHANGED` неработоспособным — доказанный, структурный, а не гипотетический
  ложноположительный блокирующий случай. Это не новое открытие: то же обоснование уже зафиксировано в
  записи `SEVENTH-B02` выше при выборе DB-семантики. Данный corrective pass делает то же обоснование явным
  design-решением, применённым СИММЕТРИЧНО в обоих слоях, а не молчаливым расхождением между ними.
  Расширение детектора за пределы точного совпадения (например, substring/fuzzy-стратегия с explicit
  allowlist контрактных полей-исключений) — вопрос PRODUCT/LEGAL классификационной политики, не решается
  этим техническим corrective pass.
- **Канонический алгоритм (`DLP_FORBIDDEN_KEY_MATCH_V1`, применяется одинаково в обоих слоях):** Unicode
  NFKC-нормализация ключа → case-fold (lowercase) → удаление того же класса evasion-символов, что уже
  нормативен для VALUE (`SEVENTH-B02`): `-`, `_`, `.`, `/`, пробел, NBSP, narrow NBSP, zero-width
  space/non-joiner/joiner → EXACT (не substring) сравнение с фиксированным 8-токенным allowlist
  (`email`, `phone`, `passport`, `bank`, `card`, `address`, `contact`, `full_name` → нормализованные формы).
- **Изменённые файлы:**
  - `migrations/001_matching_critical_chain.up.sql` — добавлена
    `leasemind_security.normalize_dlp_key(text)` (NFKC → lower → regexp_replace evasion-класса);
    `scan_dlp_scalar`'s object-key branch переведена с `lower(key) = any(array[...])` на
    `normalize_dlp_key(key) = any(array[...нормализованные токены...])`; добавлены `revoke`/`grant execute`
    для новой функции, зеркально `normalize_dlp_scalar`/`scan_dlp_scalar` (9 ролей). `down.sql` не менялся —
    функция удаляется существующим `drop schema leasemind_security cascade`.
  - `tests/synthetic_service_models.mjs` — `FORBIDDEN_KEYS` regex заменён на экспортированную
    `normalizeDlpKey(key)` (тот же порядок: NFKC → lowercase → evasion-strip) и `FORBIDDEN_KEY_TOKENS`
    (нормализованный 8-токенный allowlist); `containsDirectIdentifier`'s object-key branch использует
    `FORBIDDEN_KEY_TOKENS.includes(normalizeDlpKey(key))`.
  - `tests/fixtures/dlp_golden_vectors.mjs` — добавлены `DLP_FORBIDDEN_KEY_VECTORS` (программный
    cross-product: 8 токенов × 14 case/evasion вариантов — lowercase, uppercase, capitalized, hyphen/dot/
    underscore/slash/space/NBSP/narrow-NBSP/zero-width-space/ZWNJ/ZWJ-inserted, NFKC-fullwidth Unicode —
    итого 112 векторов) и `DLP_SAFE_KEY_CONTROL_VECTORS` (7 контролей: реальные контрактные поля
    `previous_contact_decision_id`/`previous_contact_decision_version` плюс пять сконструированных
    аналогов на остальные токены — `cardinality_note`, `bankside_reference_code`,
    `addressable_range_flag`, `phoneme_count`, `emailable_status` — ни один не совпадает с allowlist
    после нормализации). `computeDlpMatrixCoverage()` расширена `keyCoverage`/`expectedKeyVariants` и
    учитывает их в `isComplete`.
  - `tests/run_contract_suite.mjs` (`CT-023`) — добавлены офлайн (без БД) проверки всех 112 forbidden-key
    и 7 safe-key векторов через `containsDirectIdentifier`; evidence расширен `golden_forbidden_key_vectors`/
    `golden_safe_key_vectors`/`golden_key_coverage`.
  - `tests/run_postgres_suite.mjs` (`PG-026`) — malicious key-векторы вставляются как top-level payload
    key (DLP выполняется до payload-shape/unknown-field проверки в `validate_event_outbox_domain`, поэтому
    неизвестный ключ перехватывается DLP первым — тот же механизм, что уже использовал pre-existing
    `forbidden-key` probe); safe-key контроли проверяются прямым вызовом
    `leasemind_security.validate_no_direct_identifiers(...)` (не через полный INSERT: единственное untyped
    поле-носитель `reason_code` само ограничено `validate_event_payload`'s fallback-правилом до JSON
    `string`, поэтому вложенный object туда не проходит независимо от DLP — прямой вызов функции
    тестирует именно исправляемый DLP-слой, изолированно от несвязанной shape-проверки). Полный
    parity-loop (`parityMismatchIds`) расширен обоими новыми наборами.
  - `tests/evidence_matrix.mjs` — `CT-023` получил шесть новых `equals`-проверок на PG-026: `golden_forbidden_key_vectors=112`, `golden_forbidden_key_rejected=112`, `golden_safe_key_vectors=7`, `golden_safe_key_accepted=7`, `golden_key_coverage` (exact per-token 14/14) и `service_db_parity_mismatches=0`.
- **Regression proof (temp-copy, one-off, не входит в постоянный код):** временно восстановлена старая
  `scan_dlp_scalar` (raw `lower(key) = any(array[8 буквальных токенов])`, без `normalize_dlp_key`) на
  disposable PostgreSQL 18.4; ключ `E-Mail` (case+hyphen evasion) под старым поведением был **принят**
  (`accepted=true`), тогда как исправленный слой отклоняет его (`LM-DATA-CLASSIFICATION-VIOLATION`) —
  подтверждает, что новые golden-corpus evasion-векторы реально ловят регресс. Функция немедленно
  восстановлена в исправленном виде и повторно проверена перед продолжением.

### Воспроизводимая сборка controlled ZIP

- **Root cause governance-разрыва:** `contract-tests/v1.0/artifacts/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip`
  и `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json` не пересобирались ни разу с шестой проверки — каждая
  запись `PATCHLOG.md` выше (`SEVENTH-B01–B06`, `DEV-S0-00x`) explicitly оставляла ZIP/manifest без
  изменений. Проверено: старый ZIP (SHA-256 `234f59be898f8e2e0e11ea05dd58bcaa3983b22c1d95785574e1476072c0faf1`)
  содержал `openapi.yaml` без единого вхождения `UuidV4OrV7` — т.е. предшествовал `SEVENTH-B01` целиком.
- **Новый инструмент:** `contract-tests/v1.0/tools/build_controlled_zip.mjs` (чистый Node.js, без новых
  npm-зависимостей). Единственный источник — текущее содержимое `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/`.
  Fail-closed на: отсутствующий normative-файл из allowlist; неожиданный файл вне allowlist/generated
  evidence/manifest; отсутствующий или невалидный-JSON `synthetic_verification_report.json`; статус отчёта
  не `PASS`; любой не-`PASS` элемент внутри `contract_tests`/`postgres.tests`. Инструмент не повышает
  статусы документов.
- **Allowlist:** 23 прежних normative-файла из старого `manifest.sha256` плюс `tests/fixtures/dlp_golden_vectors.mjs`
  (существовал с `SEVENTH-B02`, но никогда не входил в manifest — обнаружено и исправлено этим pass'ом) —
  итого 24. `manifest.sha256` пересчитывается полностью из этого allowlist, отсортированного по
  relative path в byte/ASCII порядке (тот же порядок, что и в прежнем файле).
- **Детерминизм:** записи ZIP добавляются в fiксированном отсортированном порядке; каждая запись — метод
  STORE (без сжатия, устраняет зависимость от deflate-реализации zlib как источника вариативности),
  фиксированные DOS date/time (1980-01-01 00:00:00 — минимальная дата формата ZIP) и фиксированные unix
  external attributes (0644, regular file) вместо реального mtime/permissions файловой системы. Один
  корневой каталог `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/`, без абсолютных путей, `..`, `node_modules`,
  git-метаданных или suffix-копий (все пути — из явного статического allowlist). Два последовательных
  запуска инструмента против неизменного `source/` дают побайтово идентичный ZIP: подтверждено `cmp`
  (без различий) и совпадающим SHA-256 в обоих прогонах.
- **Новый ZIP:** SHA-256 `e0089846f21e198b103aa6641f68af8534064c1cbd32695c7cd7282dde90a6b1`; независимо
  подтверждено содержит `UuidV4OrV7` (`SEVENTH-B01`), `normalize_dlp_key`/`DLP_FORBIDDEN_KEY_VECTORS`
  (этот corrective pass), 4-аргументную сигнатуру `redeem_reveal_token` (`SEVENTH-B03`/`B04`),
  `DELIVERY_CONFIRMED_BY_DECISION`/`DELETION_ACT_DOMAIN_TAG` (`SEVENTH-B06`),
  `resolveConsumerBinding`/`CT-028` swap self-test (`SEVENTH-B05`) — распакованы напрямую из ZIP и
  проверены `grep`, а не приняты на веру из manifest.
- **Обновлены:** `manifest.sha256` (внутри `source/`, пересчитан полностью), `synthetic_verification_report.json`
  и `synthetic_verification_report.sha256` (из финального чистого прогона на disposable PostgreSQL 18.4,
  см. ниже), `postgres_execution.log`, top-level `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`
  (submission переименован в "eighth-review candidate controlled set", реальные hashes, evidence counters
  из фактического прогона, `production_launch_gate` остался `BLOCKED`, статусы/версии не повышены),
  `README.md` (статус per-`SEVENTH-B0x` + явный `CANDIDATE FOR EIGHTH DEVELOPMENT REVIEW`, не `APPROVED`).
  **Не изменены:** Proposal-документы `03_ARCHITECTURE/proposals/matching-engine/*.md` и их embedded copies
  в `docs/` (byte-identical подтверждено git-blob SHA-256 до и после), седьмое review, `apps/**`,
  `apps/api/migrations/**`.
- **Верификация (порядок соответствует запрошенному):** статический packaging-tool dry-run → clean
  `npm ci`/`npm run verify` во временной копии вне репозитория → offline `CT-001–CT-033` (33/33 через
  resolved evidence) и `EV-001–EV-007` (7/7) → полный `PG-001–PG-030` lifecycle (`up → catalog/behavior/
  security → down → empty catalog`, 30/30) на одном новом disposable PostgreSQL 18.4 (уникальное имя
  контейнера, `127.0.0.1` + проверенный свободный порт, `tmpfs`, без persistent volume) → четыре
  regression-mutation probes во временной копии (DLP key exact-match без нормализации; UUID version-nibble
  диапазон `[1-8]` вместо `[47]`; caller-supplied `deletion_act_hash` passthrough; старая 5-аргументная
  `redeem_reveal_token` сигнатура с `p_redeemed_at`) — все четыре подтвердили, что старое поведение
  уязвимо, а текущее исправленное — нет → перенос generated evidence в `source/` только после зелёного
  прогона → пересборка manifest/ZIP → распаковка нового ZIP в отдельную temp-папку и повторная проверка
  (offline `npm ci`/`npm run verify` без БД + прямое `grep`-подтверждение всех шести `SEVENTH-B0x` и
  нового DLP-fix внутри распакованных файлов; полный PostgreSQL lifecycle не повторялся второй раз —
  вместо этого доказано побайтовое равенство каждого запакованного файла между `source/` и распакованным
  ZIP, что делает результат идентичным уже подтверждённому прогону). Disposable-контейнер уничтожен после
  использования; persistent `leasemind-postgres-1`/5433 не затронут.
- **Продуктовая, юридическая и платёжная логика не менялась.** Изменения ограничены DLP forbidden-key
  сопоставлением и воспроизводимой упаковкой controlled ZIP/manifest.

## Sprint 7 финальный corrective pass — DLP forbidden-key V2, синхронизация Data Contracts, исправление verification claims (2026-08-20)

Независимая повторная проверка candidate controlled set (после предыдущей записи) обнаружила три
дальнейших недостатка: (1) DLP forbidden-key parity V1 (exact-match) была fail-open для composite/
prefixed/suffixed ключей; (2) top-level `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` был рассинхронизирован
с текущими `openapi.yaml`/`asyncapi.yaml`/`up.sql` — `verify_contracts.py::check_markdown_extraction()`
падал бы; (3) README/manifest содержали устаревшие или неточные числа (например, смешение "raw offline
CT count" с "resolved CT-001–033"). Настоящий pass закрывает все три без изменения продуктовой,
юридической, платёжной механики и `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`.

### DLP forbidden-key V1 → V2 (substring + closed normative allowlist)

- **Root cause V1 fail-open:** exact-match (`normalize_dlp_key(key) = any(array[8 буквальных токенов])`)
  пропускал любой ключ, не равный токену буквально — `customer_email`, `contact_email`, `user_phone`,
  `passport_data`, `bank_account`, `payment_card`, `delivery_address`, `full_name_value` и подобные
  composite/prefixed/suffixed идентификаторы никогда не срабатывали.
- **Exhaustive allowlist derivation:** написан one-off audit-скрипт (вне репозитория), рекурсивно
  собирающий все ключи `properties` из `openapi.yaml` и `asyncapi.yaml` (128 различных имён) и проверяющий
  каждое на substring-совпадение со всеми 8 forbidden-токенами после нормализации. Результат — **ровно
  четыре** реальных нормативных поля: `previous_contact_decision_id`, `previous_contact_decision_version`,
  `previous_contact_policy_hash`, `previous_contact_policy_version` (последние два не были покрыты
  минимальным исключением V1). Ни один другой forbidden-токен не встречается как substring ни в одном из
  128 имён.
- **Изменённые файлы:**
  - `migrations/001_matching_critical_chain.up.sql` — добавлена
    `leasemind_security.is_forbidden_dlp_key(text)`: нормализует ключ через `normalize_dlp_key`, затем
    либо возвращает `false` для точного совпадения с одним из 4 нормализованных allowlist-значений, либо
    проверяет substring (`position(token in normalized) > 0`) по всем 8 токенам. `scan_dlp_scalar`'s
    object-key branch переведена с `normalize_dlp_key(key) = any(array[...])` на
    `is_forbidden_dlp_key(key)`. Добавлены `revoke`/`grant execute`, зеркально существующим (9 ролей).
  - `tests/synthetic_service_models.mjs` — добавлены `DLP_NORMATIVE_KEY_ALLOWLIST` (те же 4
    нормализованных значения) и экспортированная `isForbiddenDlpKey(key)` (substring + allowlist-исключение,
    идентичная DB-логике); `containsDirectIdentifier`'s object-key branch переведена на
    `isForbiddenDlpKey(key)`.
  - `tests/fixtures/dlp_golden_vectors.mjs` — из `DLP_SAFE_KEY_CONTROL_VECTORS` удалены пять
    искусственных V1 "safe" ключей (`cardinality_note`, `bankside_reference_code`,
    `addressable_range_flag`, `phoneme_count`, `emailable_status` — никогда не бывшие реальными полями
    схемы; под V2 корректно классифицируются как forbidden, поскольку каждый содержит реальный токен как
    substring). `DLP_SAFE_KEY_CONTROL_VECTORS` сокращён до ровно 4 нормативных allowlist-полей. Добавлены
    `DLP_SAFE_ORDINARY_KEY_VECTORS` (4 обычных безопасных поля без forbidden-substring: `encounter_id`,
    `payment_intent_id`, `reason_code`, `schema_version`), `DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS` (8 вручную
    заданных composite-ключей — по одному на каждый из 8 токенов, как явно потребовано) и
    `DLP_FORBIDDEN_COMPOSITE_CONTAINER_VECTORS` (2 вложенных варианта: nested-object и array).
    `computeDlpMatrixCoverage()` расширена composite-coverage и учитывает новые точные счётчики
    (`DLP_SAFE_KEY_CONTROL_VECTORS.length === 4` вместо `>= 5`, `DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS.length
    === 8`) в `isComplete`.
  - `tests/run_contract_suite.mjs` (`CT-023`) — добавлены офлайн-проверки composite/ordinary векторов;
    добавлен permanent in-suite regression self-test: реконструкция V1 exact-only логики подтверждает, что
    старая стратегия пропустила бы все 8 composite-векторов (`exact_only_regression_misses`), и что без
    allowlist-исключения все 4 safe-key вектора были бы отклонены обычным substring-сканированием
    (`allowlist_load_bearing_proofs`) — доказательство, что и V2-логика, и allowlist реально работают, а
    не декларативны.
  - `tests/run_postgres_suite.mjs` (`PG-026`) — добавлены реальные INSERT-пробы для 8 composite-key и 2
    composite-container векторов (тот же top-level-injection механизм, что и для plain forbidden-key —
    DLP выполняется раньше unknown-field проверки) и direct-function-call пробы для 4
    ordinary-safe-key векторов (тот же механизм, что у allowlist safe-key). Полный parity-loop расширен
    всеми новыми векторами.
  - `tests/evidence_matrix.mjs` — `CT-023` получил обновлённые точные `equals`-проверки: `golden_safe_key_
    vectors=4`, `golden_safe_ordinary_key_vectors=4`, `golden_composite_key_vectors=8`,
    `golden_composite_container_vectors=2`, `dlp_forbidden_key_match_version='V2'`,
    `service_db_parity_mismatches=0` (старые `equals: 7` удалены как относящиеся к V1).
- **Regression proof (temp-copy, one-off):** на живом disposable PostgreSQL 18.4 временно восстановлена
  V1-версия `scan_dlp_scalar` (exact-only, без `is_forbidden_dlp_key`) — ключ `customer_email` был
  **принят** (`accepted=true`), тогда как V2 отклоняет с `LM-DATA-CLASSIFICATION-VIOLATION`. Функция
  немедленно восстановлена в V2-виде и повторно проверена (включая sanity-проверку allowlist-исключения)
  перед продолжением.

### Синхронизация нормативного Data Contracts Markdown

- **Root cause:** `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (top-level Proposal-документ и его
  embedded-копия в `docs/`) не обновлялся с момента исходного импорта — три fenced-блока (`openapi.yaml`,
  `asyncapi.yaml`, `migrations/001_matching_critical_chain.up.sql`, section 3–5) отражали
  pre-`SEVENTH-B01` состояние машинных файлов. `verify_contracts.py::check_markdown_extraction()` (сама
  проверка не изменялась и не ослаблялась) сравнивает эти fenced-блоки байт-в-байт с текущими
  `openapi.yaml`/`asyncapi.yaml`/`up.sql` и падал бы на первом же несовпадении.
- **Метод:** написан one-off Python-скрипт (вне репозитория), использующий ТОТ ЖЕ regex, что и
  `check_markdown_extraction()` (`` ```yaml\n(.*?)``` `` / `` ```sql\n(.*?)``` ``), для программной замены
  содержимого второго yaml-блока (OpenAPI, раздел 3) на текущий `openapi.yaml`, третьего yaml-блока
  (AsyncAPI, раздел 4) — на текущий `asyncapi.yaml`, и единственного sql-блока (раздел 5) — на текущий
  `up.sql`. Ручная перепечатка больших файлов не выполнялась — риск транскрипционной ошибки исключён;
  скрипт содержит пост-записи self-check той же логикой сравнения.
- **Изменённые файлы:** `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`
  (три fenced-блока пересинхронизированы; добавлена секция `1.6. Change Log седьмой проверки DEVELOPMENT
  и corrective pass от 2026-08-20`, суммирующая закрытие `SEVENTH-B01–B06` и DLP forbidden-key V1→V2 по
  тому же табличному формату, что и предыдущие change-log секции); embedded-копия в
  `contract-tests/v1.0/source/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/docs/` синхронизирована как побайтовая
  копия top-level документа (`cmp` подтверждает идентичность).
- **Не изменены:** версия `1.0`, статус `Proposal for DEVELOPMENT review`, дата документа (кроме нового
  раздела change log), продуктовая/юридическая/платёжная механика, `LeaseMind_MATCHING_ENGINE_
  ARCHITECTURE_v1.1.md` и её embedded-копия (подтверждено `git diff --stat` — пусто).
- **Verification:** Python `verify_contracts.py` в pinned venv (`pip install -r requirements.txt`)
  подтверждает `check_markdown_extraction` PASS (проверка списком чекнутых пунктов: "Markdown and
  machine-readable contract files are byte-identical" присутствует в `checks`, без соответствующего
  `error`). **Regression proof:** та же проверка на копии с намеренно НЕ пересинхронизированным (старым,
  `git show HEAD`) top-level Markdown падает с `AssertionError` именно на этапе markdown-extraction (пункт
  отсутствует в списке успешных `checks`) — подтверждает, что проверка реально ловит рассинхронизацию, а
  не является decorative.

### Исправление verification claims

- **Root cause:** README/manifest ранее называли raw offline `tests/run_contract_suite.mjs` результат
  "29/29" (артефакт `grep -c` подсчёта, включавшего строку `"status": "PASS"` верхнего уровня отчёта) и не
  разделяли его с итоговой resolved-матрицей `CT-001–CT-033`; отдельные формулировки DLP всё ещё называли
  V1-числа (`112`/`7`) без учёта новых composite/ordinary векторов.
- **Исправлено:** `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json` и `README.md` теперь раздельно называют
  `raw_offline_contract_assertions: 28/28` (фактическое число выполненных `test('CT-xxx', ...)` — 5 из 33
  ID резолвятся только из PostgreSQL evidence и не имеют собственного raw-assertion) и
  `resolved_contract_tests: CT-001–CT-033, 33/33`; DLP-числа обновлены на фактические из финального
  прогона (112 forbidden-key + 8 composite + 2 composite-container vectors rejected; 4 + 4 safe controls
  accepted; 0 parity mismatches).

### Повторная эмпирическая проверка и repack

- **Порядок:** статические проверки → Python verifier в pinned venv (PASS, с regression-доказательством
  desync→FAIL) → `npm ci` в чистой temp-копии → offline `run_contract_suite.mjs` (28/28) и
  `run_evidence_self_tests.mjs` (7/7) → один полный `DATABASE_URL=<disposable PostgreSQL 18.4> npm run
  verify` (`up → PG-001–030 → down → empty catalog`, 30/30, включая DLP V2 evidence в `PG-026`) →
  обязательная regression-мутация DLP V2 exact-only (описана выше) на том же контейнере после повторного
  применения `up.sql` (down уже выполнен основным прогоном) → перенос generated evidence
  (`synthetic_verification_report.json`, `postgres_execution.log`) в `source/` только после зелёного
  прогона → пересборка `manifest.sha256` и ZIP (`tools/build_controlled_zip.mjs`, без изменений в самом
  инструменте) → два последовательных build, `cmp` без различий → распаковка нового ZIP в отдельную
  temp-папку и повторная проверка: Python verifier PASS, npm offline CT 28/28 PASS, побайтовое равенство
  каждого запакованного файла с `source/` (`diff -rq`, без различий) — полный PostgreSQL lifecycle из ZIP
  не повторялся третий раз (обоснованно: byte-equality уже доказывает идентичность запакованного кода
  тому, что уже прошло полный lifecycle).
- **B01/B03/B06 regression пробы не повторялись:** соответствующий код (`redeem_reveal_token` сигнатура,
  `cryptoUnlink`, UUID regex в `validate_event_payload`) в этом pass не менялся; Markdown-синхронизация
  подтверждена byte-identical текущим машинным файлам, которые уже содержат эти исправления и уже прошли
  regression-доказательство в предыдущем corrective pass.
- **Disposable-контейнер** (`lm-matching-v2-*`, синтетический пароль, `127.0.0.1:55432`, `tmpfs`, без
  persistent volume) уничтожен после использования; persistent `leasemind-postgres-1`/5433 не затронут.
  Python venv и все temp-копии удалены после использования.
- **Новый ZIP:** SHA-256 `08d858f8f3aebf9fae235f76824817aad9a10c4987ee6682948d30267baf739a` (был
  `e0089846f21e198b103aa6641f68af8534064c1cbd32695c7cd7282dde90a6b1` после предыдущего corrective pass).
  Независимо подтверждено содержит `is_forbidden_dlp_key`/`DLP_FORBIDDEN_COMPOSITE_KEY_VECTORS` (этот
  pass) и все `SEVENTH-B01–B06` маркеры — распакованы напрямую из ZIP и проверены `grep`, не приняты на
  веру из manifest.
- **Продуктовая, юридическая и платёжная логика не менялась.** Изменения ограничены DLP forbidden-key
  V1→V2, синхронизацией Data Contracts Markdown и точностью verification claims.

## Sprint 7 integrity corrective pass — двухфазный packaging tool, устранение stale claims (2026-08-21)

Узкий integrity-pass по итогам независимого повторного аудита candidate controlled set после
предыдущего corrective pass. Не затрагивает DLP-логику, OpenAPI/AsyncAPI/SQL-контракт или fenced
blocks Data Contracts Markdown — только packaging tool и точность verification claims в README/manifest.

### Root cause: circularity в `tools/build_controlled_zip.mjs`

- **Симптом:** `synthetic_verification_report.json.source_manifest_sha256` = `6a361c2100979d1d7ee0b7dc5c5698d9fa6db06018f951a5971bceb0ab3233b3`,
  но фактический SHA-256 текущего `manifest.sha256` на момент аудита = `7fb5a3b0ab09c6d8e5b7e67f2d90649b6543594925eb9005b6bb9e1a7a76dd64` —
  report криптографически привязан к устаревшей версии manifest.
- **Root cause:** старый (однофазный) `build_controlled_zip.mjs` пересчитывал и перезаписывал
  `manifest.sha256` **в рамках того же вызова**, который читал уже сгенерированный
  `synthetic_verification_report.json` (созданный отдельным более ранним запуском `npm run verify`,
  который сам читал manifest ДО этой перезаписи). Каждая последующая пересборка сдвигала
  `manifest.sha256` вперёд без пересчёта report, накапливая расхождение.
- **Также обнаружено при аудите:** final build опционально проверял только `report.status === 'PASS'`
  и отсутствие non-PASS записей в `postgres.tests`/`contract_tests` — не проверял `synthetic_data_only`,
  `production_adapters_used`, точность/полноту множеств `EV-*`/`raw_contract_assertions`, дубликаты ID,
  или свежесть `source_manifest_sha256`/`postgres.stderr_log_sha256` относительно фактических файлов.

### Исправление: двухфазный lifecycle с fail-closed проверками

- **`--prepare-manifest`** (новый режим): проверяет allowlist/missing/unexpected files, детерминированно
  пишет **только** `manifest.sha256`, выводит его SHA-256 в stdout. Не требует и не трогает
  `synthetic_verification_report.json`/`postgres_execution.log`, не создаёт ZIP. Запускается строго
  **до** канонического `npm run verify`, чтобы прогон, генерирующий report, читал уже финальный manifest.
- **Final build** (без флага, прежнее поведение вызова): теперь **никогда** не пишет `manifest.sha256`.
  Вместо этого пересчитывает ожидаемое содержимое из текущих normative-файлов и сравнивает byte-for-byte
  с фактическим `manifest.sha256` — при расхождении fail-closed с явной инструкцией "запустите
  `--prepare-manifest`, затем канонический `npm run verify`, затем этот final build снова". Не изменяет
  `manifest.sha256` ни при каких условиях. По-прежнему пересчитывает и пишет
  `synthetic_verification_report.sha256` — это чистый derived-хэш уже финализированного report, а не
  normative source, поэтому не подпадает под запрет "silent source manifest change".
- **Final build теперь ОБЯЗАТЕЛЬНО (не опционально) проверяет:**
  - `report.status === 'PASS'`, `report.synthetic_data_only === true`, `report.production_adapters_used === false`;
  - точное unique-множество `CT-001..CT-033` (33), все `PASS` — дубликаты/пропуски/лишние ID fail-closed;
  - точное unique-множество `EV-001..EV-007` (7), все `PASS`;
  - точное unique-множество `PG-001..PG-030` (30), все `PASS`;
  - точное unique-множество `raw_contract_assertions` — вычисляется динамически из
    `tests/evidence_matrix.mjs::CT_EVIDENCE_MATRIX` по признаку self-dependency (CT id входит в
    собственный dependency-список ⇒ имеет собственный raw-assertion), а не hardcoded числом — на текущем
    контракте это 28 из 33;
  - `report.source_manifest_sha256` равен SHA-256 фактического текущего `manifest.sha256`;
  - `report.postgres.stderr_log_sha256` равен SHA-256 фактического текущего `postgres_execution.log`;
  - наличие всех обязательных полей/массивов в report JSON.
- **Изменённый файл:** `contract-tests/v1.0/tools/build_controlled_zip.mjs` (единственный packaging tool,
  без новых зависимостей — один dynamic `import()` уже dependency-free `tests/evidence_matrix.mjs`).

### Fail-closed regression probes (20, в изолированной temp-копии вне репозитория)

Каждый перечисленный fail-open случай воспроизведён мутацией known-good baseline (temp-копия
`contract-tests/v1.0`, восстанавливается между пробами) и подтверждён как отклоняемый (`exit != 0`, ZIP
не записан), плюс один sanity-прогон восстановленного baseline подтверждает `PASS`:

1. stale `source_manifest_sha256` (не совпадает с текущим `manifest.sha256`) — FAIL.
2. `report.status !== 'PASS'` — FAIL.
3. `synthetic_data_only !== true` — FAIL.
4. `production_adapters_used !== false` — FAIL.
5. пропущен `CT-005` в `contract_tests` — FAIL.
6. дублирован `CT-001` в `contract_tests` — FAIL.
7. `CT-010` со статусом `BLOCKED` — FAIL.
8. пропущен `EV-003` — FAIL.
9. `EV-004` со статусом `FAIL` — FAIL.
10. пропущен `PG-026` — FAIL.
11. `PG-019` со статусом `FAIL` — FAIL.
12. `raw_contract_assertions` без `CT-023` (undercount) — FAIL.
13. `raw_contract_assertions` с дублированным `CT-001` — FAIL.
14. `raw_contract_assertions` с добавленным `CT-030` (PG-only id, не должен иметь raw-assertion) — FAIL.
15. `postgres_execution.log` изменён без обновления `stderr_log_sha256` в report — FAIL.
16. `manifest.sha256` вручную отредактирован (один hex-символ изменён на другое значение) — FAIL с
    инструкцией запустить `--prepare-manifest`.
17. `synthetic_verification_report.json` удалён — FAIL с инструкцией запустить канонический `npm run verify`.
18. `--prepare-manifest` с отсутствующим normative-файлом (`openapi.yaml` временно удалён) — FAIL.
19. `--prepare-manifest` с посторонним файлом в дереве источника — FAIL.
20. **Post-probe sanity:** восстановленный known-good baseline после всех 19 проб — final build `PASS`,
    ZIP записан (подтверждает, что fail-closed логика не false-positive на корректном состоянии).

Первая попытка пробы #16 была ложноположительной (мутация случайно заменяла первый hex-символ манифеста
на тот же самый символ — no-op, не тампер); обнаружено при разборе результата (`exit=0` вместо ожидаемого
`1`), исправлено на гарантированно отличающийся символ, повторно подтверждено `FAIL` — задокументировано
здесь как пример того, что каждая проба верифицировалась по фактическому результату, а не принималась на
веру по своему намерению.

### Исправление stale claims

- **`source/.../README.md`:** заменена секция "Запуск" — вместо статичных `1020`/`15 probes` теперь
  описан точный трёхшаговый канонический verification flow (Python verifier → `npm ci` + `npm run verify`
  → двухфазный `build_controlled_zip.mjs`) с фактическими числами текущего прогона (`PG-019`: 33 + 33 +
  2021; `PG-026`: 15 base probes, 51/5 value vectors, 112 forbidden-key vectors, 8+2 composite/container,
  4+4 safe-key controls, 0 parity mismatches). Также исправлено "13/13" → "14/14" static checks
  (предыдущий pass недосчитал одну проверку Python verifier).
- **Верхний `README.md`:** таблица SHA-256 первоначального импорта (2026-07-26) явно подписана как
  исторический снимок, не текущее состояние; статусы Architecture (`Proposal for cross-functional review
  and approval`) и Data Contracts (`Proposal for DEVELOPMENT review`) разделены (ранее объединены под
  одной неверной меткой); секция "Ограничения" уточнена — `SEVENTH-B01–B06` не исправлялись в
  первоначальном импорте, но исправлены и доказаны в текущем candidate controlled set; добавлена секция
  "Sprint 7 corrective pass #3 (integrity pass)".
- **`LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`:** обновлены `sha256` ZIP и `embedded_evidence.
  source_manifest_sha256`/`synthetic_verification_report_sha256`, `python_verifier` ("14/14"), добавлено
  описание двухфазного `verification_flow` и итог `sprint7_corrective_passes` (все три pass).

### Канонический прогон (один, без повторов)

- **Порядок:** правка `source/.../README.md` → `node tools/build_controlled_zip.mjs --prepare-manifest`
  (в реальном repo, идемпотентно) → чистая temp-копия вне репозитория → `npm ci` в temp-копии →
  `node tools/build_controlled_zip.mjs --prepare-manifest` в temp-копии (сверка) → один
  `DATABASE_URL=<disposable PostgreSQL 18.4> npm run verify` в temp-копии → Python `verify_contracts.py`
  в pinned venv на temp-копии (PASS, 14/14) → перенос `synthetic_verification_report.json`/
  `postgres_execution.log`/`manifest.sha256` из temp-копии в реальный `source/` (побайтово идентичны,
  `cmp` подтверждает) → `--prepare-manifest` в реальном repo повторно (sanity, тот же хэш) → final build
  в реальном repo (усиленные проверки, PASS) → второй build в другой output-путь, `cmp` без различий →
  распаковка нового ZIP в temp-папку, `diff -rq` против `source/` без различий, Python verifier PASS
  (14/14) и offline CT 28/28 PASS из распакованной копии.
- **Первая попытка канонического прогона выполнялась `npm ci` напрямую в реальном `source/`** (ошибка
  процесса) — `node_modules` (gitignored) начал фигурировать как "unexpected file" в `checkAllowlistAndTree`
  при следующем `--prepare-manifest`, что верно с точки зрения инструмента (дерево действительно содержало
  посторонние файлы), но противоречило конвенции "temp copies вне репозитория" из предыдущих pass.
  Исправлено: `node_modules` удалён из реального `source/`, весь канонический прогон повторён в
  изолированной temp-копии по установленной схеме.
- **DLP V1/V2 и B01/B03/B06 regression пробы не повторялись** — соответствующий код в этом pass не
  менялся; вместо этого выполнены 20 новых fail-closed проб, специфичных для дефектов packaging tool
  этого pass (см. выше).
- **Disposable-контейнер** (`leasemind-integrity-probe-pg`, синтетические credentials, `127.0.0.1:55432`,
  `tmpfs`, без persistent volume) уничтожен после использования; persistent `leasemind-postgres-1`/5433
  не затронут. Python venv и все temp-копии (probe-копия, final-verify-копия, zip-extract-копия) удалены
  после использования.
- **Новый ZIP:** SHA-256 `7b5a11dfe9b3fa881d7769d44bbb62b1e3d69fbd2d56ecaaa98bdb80784499da` (был
  `08d858f8f3aebf9fae235f76824817aad9a10c4987ee6682948d30267baf739a` после предыдущего corrective pass).
  `manifest.sha256`: `487facad1c8bd6465692365e8a89bbd91aabf42e13afa80e7742dba590a9657a`.
  `synthetic_verification_report.json`: `25c1e25378f8864ce4499f4d3a36f83d376171697885f04614c114533a63aaab`.
  `postgres_execution.log`: `63905fbe67a4e6c40270ac620796e6fba1581a0d359277250bf5e6f1365309d3` (не изменился —
  фактическое содержимое PostgreSQL lifecycle stderr идентично предыдущему прогону).
- **Продуктовая, юридическая и платёжная логика не менялась.** DLP-логика, OpenAPI/AsyncAPI/SQL-контракт
  и Data Contracts fenced blocks не менялись. Изменения ограничены packaging tool
  (`tools/build_controlled_zip.mjs`) и точностью verification claims в README/submission manifest.
