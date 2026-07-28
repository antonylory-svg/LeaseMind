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
