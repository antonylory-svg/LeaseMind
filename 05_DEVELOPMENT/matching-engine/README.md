# Matching Engine — DEVELOPMENT import (2026-07-26)

Технический факт-лист по импортированному комплекту Matching Engine из ChatGPT Library.
Документ не содержит продуктовых, юридических или экономических решений и не изменяет
роль AI Manager.

## Импортированные файлы и SHA-256 (исторический initial import controlled set, 2026-07-26)

Таблица ниже фиксирует состояние файлов **на момент первоначального импорта** из
ChatGPT Library и не обновляется задним числом. Это исторический факт, а не текущее
состояние: `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` и оба controlled-артефакта
(`..._EXECUTABLE.zip`, `..._SUBMISSION_MANIFEST_v1.0.json`) с тех пор менялись
Sprint 7 corrective passes (см. ниже) и их SHA-256 больше не совпадают со строками
таблицы. **Актуальные hashes текущего candidate controlled set — только в
`LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`**, не в этой таблице.

| Файл | Library version | SHA-256 (на момент импорта 2026-07-26) |
| --- | ---: | --- |
| `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` | 10 | `d5d3afe113ed01076ae9c4e54f5791b8b33477402838a3f5d3641a73dd286ffa` |
| `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` | 5 | `e4c05c9e1eae08575bd5ba7763ca7abbec9f94d4ccc8e101c062a7aeef304cec` |
| `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/artifacts/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip` | 4 | `234f59be898f8e2e0e11ea05dd58bcaa3983b22c1d95785574e1476072c0faf1` |
| `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/artifacts/LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json` | 2 | `973a65c2accf29512953372669cc750c2a6516c23d1f1a797f2da80603ed349a` |
| `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_SEVENTH.md` | — | `1a70b5cdb0c8b804c0710c4dbdd20bfef381d99fcd248204eb1e39a268ea38eb` |

Все пять файлов были скопированы byte-for-byte из `_incoming/` и сверены по SHA-256 после копирования 2026-07-26.
Содержимое ZIP было распаковано без изменений в `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/source/` на тот момент.
`LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` и `LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_SEVENTH.md` этим
пассом не затрагивались, их строки в таблице выше остаются актуальными.

## Статус документов

- `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`: **Proposal for cross-functional review and approval**.
- `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`: **Proposal for DEVELOPMENT review** (не тот же статус, что у Architecture —
  см. заголовок самого документа и `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`).
- Документы в `03_ARCHITECTURE/proposals/matching-engine/` **не являются утверждённым
  production baseline**. Они не заменяют и не изменяют существующие документы
  `03_ARCHITECTURE/System_Architecture.md`, `03_ARCHITECTURE/Data_Model.md`,
  `03_ARCHITECTURE/Event_Model.md`.

## Итог седьмой технической проверки

**`CHANGES REQUIRED`**.

**`PRODUCTION_LAUNCH_GATE: BLOCKED`**.

Полное заключение: `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_SEVENTH.md`. Заключение седьмой проверки не переписывается задним числом — его текст и вердикт остаются как есть; технический статус блокеров ниже отражает состояние рабочей копии после точечных правок `PATCHLOG.md`, а не пересмотр самого заключения.

### Blocking-замечания седьмой проверки

| ID | Кратко | Статус в рабочей копии `source/` |
| --- | --- | --- |
| `SEVENTH-B01` | UUID contract разрешает только v4/v7, но AsyncAPI/DB regex пропускают версии 1–8 | Исправлено (`PATCHLOG.md`) |
| `SEVENTH-B02` | Service- и DB-классификаторы DLP расходятся на нестандартных разделителях | Исправлено для значений (`PATCHLOG.md`); forbidden-key parity закрыта двумя corrective pass (см. ниже, финальная версия — V2) |
| `SEVENTH-B03` | `redeem_reveal_token` принимает `p_redeemed_at` от вызывающей стороны — возможен backdating | Исправлено (`PATCHLOG.md`) |
| `SEVENTH-B04` | Redemption не блокирует guard/lease rows перед commit — race с invalidation | Исправлено (`PATCHLOG.md`) |
| `SEVENTH-B05` | `CT-028` не проверяет соответствие payload/schema фактическому `event_type` | Исправлено (`PATCHLOG.md`) |
| `SEVENTH-B06` | `cryptoUnlink` принимает caller-supplied `deletion_act_hash` без пересчёта | Исправлено (`PATCHLOG.md`) |

### Sprint 7 corrective pass #1 (2026-08-20) — controlled set синхронизирован

Восьмая проверка DEVELOPMENT (read-only, фаза 1) независимо подтвердила, что все шесть исправлений выше реальны и доказаны исполняемыми тестами, но обнаружила два разрыва: (1) DLP forbidden-key детектор JS и PostgreSQL расходились на стратегии сопоставления (substring vs exact) без corpus-доказательства; (2) controlled ZIP/manifest, на которые ссылается этот README и `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` §42/§52.1, не содержали ни одного из шести исправлений — контролируемый артефакт оставался версией, провалившей седьмую проверку.

Оба разрыва закрыты точечным corrective pass, задокументированным отдельной записью в `PATCHLOG.md`: DLP forbidden-key parity получила exact-match стратегию (V1); controlled ZIP пересобран воспроизводимым инструментом `contract-tests/v1.0/tools/build_controlled_zip.mjs`.

### Sprint 7 corrective pass #2 (финальный, 2026-08-20) — DLP V2, синхронизация Data Contracts, исправление claims

Независимая повторная проверка кандидата после pass #1 обнаружила три дальнейших недостатка:

1. **DLP forbidden-key V1 была fail-open.** Exact-match стратегия пропускала composite/prefixed/suffixed ключи (`customer_email`, `contact_email`, `user_phone`, `passport_data`, `bank_account`, `payment_card`, `delivery_address`, `full_name_value`), которые никогда не равны запрещённому токену буквально. Заменено на `DLP_FORBIDDEN_KEY_MATCH_V2`: forbidden token ищется как substring нормализованного ключа, кроме закрытого нормативного allowlist из **четырёх** реальных обязательных полей схемы — `previous_contact_decision_id`, `previous_contact_decision_version`, `previous_contact_policy_hash`, `previous_contact_policy_version` (exhaustively проверено по всем 128 `properties`-именам в `openapi.yaml`/`asyncapi.yaml`, а не выбрано вручную). Пять искусственных "safe" ключей из V1 (`cardinality_note` и др., никогда не бывшие реальными полями схемы) удалены из safe-корпуса — под V2 они корректно классифицируются как forbidden.
2. **Top-level `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` был рассинхронизирован** с машинными `openapi.yaml`/`asyncapi.yaml`/`migrations/001_matching_critical_chain.up.sql` — `verify_contracts.py::check_markdown_extraction()` (byte-identity fenced blocks ↔ machine files) был бы красным. Три fenced-блока пересинхронизированы программно (без ручной перепечатки больших файлов); добавлена компактная секция 1.6 "Change Log седьмой проверки DEVELOPMENT и corrective pass". Версия `1.0` и статус `Proposal for DEVELOPMENT review` не изменены; `Architecture v1.1` не затронута.
3. **README/manifest claims были устаревшими или неточными** (например, "112/7" для DLP-корпуса без учёта V2, старые `1020`/`15 probes` формулировки в отдельных местах). Обновлены на фактические числа этого прогона.

**Фактические результаты финального прогона** (Python verifier в pinned venv + `npm ci` + `run_full_suite.mjs` на одноразовом disposable PostgreSQL 18.4):

- Python `verify_contracts.py`: **PASS** (14/14 статических проверок, включая byte-identity Markdown↔machine и manifest integrity); подтверждено регрессией — на намеренно рассинхронизированной копии тот же verifier падает именно на проверке `check_markdown_extraction`.
- `tests/run_contract_suite.mjs` (raw offline, без БД): **28/28 PASS** — это число фактически выполненных `test('CT-xxx', ...)`, не 33: пять ID (`CT-022`, `CT-030`–`CT-033`) резолвятся только из PostgreSQL evidence через `evidence_matrix.mjs` и не имеют собственного raw-assertion.
- Итоговая resolved-матрица `CT-001–CT-033`: **33/33 PASS**.
- `tests/run_evidence_self_tests.mjs`: **EV-001–EV-007, 7/7 PASS**.
- `tests/run_postgres_suite.mjs` (полный lifecycle `up → PG-001–030 → down → empty catalog` на disposable PostgreSQL 18.4): **30/30 PASS**, включая `PG-026` с полным DLP V2 evidence (112 forbidden-key + 8 composite + 2 composite-container vectors rejected; 4 normative-allowlist + 4 ordinary safe-key controls accepted; 0 service/DB parity mismatches).
- Regression mutation (обязательная для этого pass): временный откат `scan_dlp_scalar` к V1 exact-only поведению на живом disposable Postgres — composite-ключ `customer_email` был **принят** (уязвимость воспроизведена); V2 отклоняет с `LM-DATA-CLASSIFICATION-VIOLATION`. Функция немедленно восстановлена. Regression-пробы B01/B03/B06 из pass #1 не повторялись — соответствующий код (`redeem_reveal_token`, `cryptoUnlink`, UUID regex) в этом pass не менялся, а Markdown-синхронизация подтверждена byte-identical машинным файлам, содержащим те же исправления.
- Controlled ZIP пересобран `tools/build_controlled_zip.mjs`; два последовательных запуска — побайтово идентичны; ZIP распакован в новую temp-папку и повторно проверен (Python verifier PASS, npm offline CT 28/28 PASS, побайтовое равенство каждого файла с `source/` подтверждено `diff -rq`).

**Текущий статус controlled set остаётся `CANDIDATE FOR EIGHTH DEVELOPMENT REVIEW`, не `APPROVED`.** Статусы Proposal-документов и версии (`1.1`/`1.0`) не повышены. `PRODUCTION_LAUNCH_GATE` остаётся `BLOCKED`.

### Sprint 7 corrective pass #3 (integrity pass, 2026-08-21) — packaging tool circularity, stale claims

Независимый повторный аудит candidate controlled set после pass #2 обнаружил три дальнейших дефекта, не связанных с DLP или семантикой контракта:

1. **`tools/build_controlled_zip.mjs` пересчитывал `manifest.sha256` в рамках того же шага, который упаковывал `synthetic_verification_report.json`.** В результате `report.source_manifest_sha256` мог ссылаться на состояние манифеста, уже не совпадающее с тем, что реально было упаковано (обнаружено: report называл `6a361c21...`, фактический `manifest.sha256` — `7fb5a3b0...`). Исправлено разделением на два строгих режима: `--prepare-manifest` (пишет только `manifest.sha256`, не трогает report/log/ZIP) — запускается **до** канонического `npm run verify`; и final build — никогда не пишет `manifest.sha256`, вместо этого fail-closed, если текущий файл не совпадает с пересчитанным содержимым (с явной инструкцией сначала запустить `--prepare-manifest`). Final build также теперь **обязательно** (не опционально) проверяет: `status === PASS`, `synthetic_data_only === true`, `production_adapters_used === false`, точные unique-множества `CT-001..033`/`EV-001..007`/`PG-001..030` (все PASS), точное derived-множество raw-assertion ID (28, вычисляется из `tests/evidence_matrix.mjs` по признаку self-dependency, не hardcoded), и криптографическую свежесть `report.source_manifest_sha256`/`report.postgres.stderr_log_sha256` относительно фактических файлов. Проверено 20 fail-closed regression-проб в изолированной temp-копии (19 целевых мутаций каждого перечисленного дефекта + 1 post-probe sanity PASS на восстановленном baseline) — все прошли корректно.
2. **`source/.../README.md` всё ещё называл устаревшие числа** (`1020` negative payload mutations, `15 runtime DLP probes`) из периода до DLP V2. Заменено на фактический канонический verification flow (Python verifier → `npm run verify` → двухфазная пересборка) с точными измеренными числами: `PG-019` — 33 positive + 33 UUID v7 positive + 2021 negative mutations; `PG-026` — 15 базовых probes, 51 malicious/5 safe value vectors, 112 forbidden-key vectors, 8 composite + 2 container vectors, 4 normative allowlist + 4 ordinary safe keys, 0 parity mismatches.
3. **Верхний `README.md` (этот файл) смешивал исторический факт-лист первоначального импорта (2026-07-26) с текущим candidate controlled set** и объединял статусы Architecture (`Proposal for cross-functional review and approval`) и Data Contracts (`Proposal for DEVELOPMENT review`) под одной неверной меткой. Таблица SHA-256 теперь явно подписана как исторический снимок; статусы разделены; текст про `SEVENTH-B01`–`B06` уточнён (не исправлялись в первоначальном импорте, исправлены и доказаны в текущем candidate).

**Фактические результаты этого прогона** (Python verifier в pinned venv + двухфазный `tools/build_controlled_zip.mjs` + один канонический `npm run verify` на одноразовом disposable PostgreSQL 18.4, запущенный строго между `--prepare-manifest` и final build):

- Python `verify_contracts.py`: **PASS**, 14/14 static checks.
- `tests/run_contract_suite.mjs` (raw offline): **28/28 PASS**; resolved `CT-001–CT-033`: **33/33 PASS**; `EV-001–EV-007`: **7/7 PASS**; `PG-001–PG-030`: **30/30 PASS** (один прогон, без повторов).
- `report.source_manifest_sha256` (`487facad1c8bd6465692365e8a89bbd91aabf42e13afa80e7742dba590a9657a`) подтверждён равным SHA-256 фактического `manifest.sha256`; `report.postgres.stderr_log_sha256` (`63905fbe67a4e6c40270ac620796e6fba1581a0d359277250bf5e6f1365309d3`) подтверждён равным SHA-256 фактического `postgres_execution.log` — оба сняты программной проверкой, не визуальным сравнением.
- Final build (усиленные проверки) — **PASS**; второй build в другой output-путь — побайтово идентичен первому (`cmp`, без различий); ZIP распакован в новую temp-папку — `diff -rq` против `source/` без различий, Python verifier PASS (14/14) и offline CT 28/28 PASS из распакованной копии.
- Regression-пробы B01/B03/B06 и DLP V1/V2 из pass #1/#2 не повторялись — соответствующий код в этом pass не менялся (изменения ограничены packaging tool и README claims); вместо этого выполнены 20 новых fail-closed проб, специфичных именно для дефектов этого pass (см. `PATCHLOG.md`).
- Disposable PostgreSQL (без persistent volume, свободный порт `55432`) уничтожен после использования; `leasemind-postgres-1`/`5433` не затронут.

**Новый ZIP:** SHA-256 `7b5a11dfe9b3fa881d7769d44bbb62b1e3d69fbd2d56ecaaa98bdb80784499da` (был `08d858f8f3aebf9fae235f76824817aad9a10c4987ee6682948d30267baf739a` после pass #2). Разница — исключительно обновлённый `source/.../README.md` (claims) и синхронизированный `manifest.sha256`/`synthetic_verification_report.json`/`postgres_execution.log`; DLP-логика, OpenAPI/AsyncAPI/SQL-контракт и Data Contracts fenced blocks в этом pass не менялись.

**Текущий статус остаётся `CANDIDATE FOR EIGHTH DEVELOPMENT REVIEW`, не `APPROVED`.** Статусы Proposal-документов и версии (`1.1`/`1.0`) не повышены. `PRODUCTION_LAUNCH_GATE` остаётся `BLOCKED`.

Актуальные hashes — только в `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`; не дублируются здесь, чтобы не расходиться при следующей пересборке.

## Ограничения (действуют до отдельного PRODUCTION_LAUNCH_GATE)

- Реализация и тестирование разрешены только на синтетических данных.
- Запрещены: реальные платежи, реальные персональные данные, production adapters,
  раскрытие защищённых данных.
- Первоначальный импорт (2026-07-26) не содержал исправлений `SEVENTH-B01`–`SEVENTH-B06`.
  Текущий candidate controlled set (Sprint 7 corrective pass #1, #2 и #3, см. выше) их содержит
  и доказывает исполняемыми тестами, но эти исправления ещё не утверждены восьмым
  DEVELOPMENT review — статус остаётся `CANDIDATE FOR EIGHTH DEVELOPMENT REVIEW`.
