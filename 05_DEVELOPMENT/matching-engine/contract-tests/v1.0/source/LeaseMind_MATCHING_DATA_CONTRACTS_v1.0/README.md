# LeaseMind Matching Data Contracts v1.0

Статус: `Proposal for DEVELOPMENT review`.

Пакет является machine-readable приложением к:

- `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`;
- `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`.

Он не разрешает реальные платежи, обработку реальных персональных данных или раскрытие защищённых данных.

## Состав

- `openapi.yaml` — команды критической цепочки;
- `asyncapi.yaml` — typed events и canonical invalidation namespace;
- `migrations/*.up.sql` и `*.down.sql` — PostgreSQL 15+ contract migrations;
- `docs/` — immutable copies двух нормативных Markdown-документов, hashes которых проверяются manifest;
- `fixtures/synthetic_fixtures.mjs` — positive и negative fixtures для 9 operations, каждого 4xx и 33 canonical events;
- `tests/synthetic_service_models.mjs` — исполнимые reference-модели compatibility, idempotency, gates, state transitions, token и crypto-unlinking;
- `tests/run_contract_suite.mjs` — фактические validator/service scenarios;
- `tests/evidence_matrix.mjs` и `tests/run_evidence_self_tests.mjs` — exact `CT-001–CT-033 → evidence` dependencies, semantic counters/sets и доказательство `NOT_RUN/BLOCKED` при missing/renamed/failed/undersized evidence;
- `tests/run_postgres_suite.mjs` — disposable PostgreSQL behavior/lifecycle tests;
- `tests/run_full_suite.mjs` — единый offline orchestrator и полный отчет;
- `tests/postgres_catalog_assertions.sql` — catalog, grants, RLS и immutable assertions;
- `tests/run_postgres_tests.sh` — полный catalog/behavior/security lifecycle через внешний `DATABASE_URL` на PostgreSQL 15+;
- `manifest.sha256` — content-addressed manifest нормативных source artifacts; generated verification report намеренно не входит в него;
- `synthetic_verification_report.json` — результат локально доступной проверки.
- `synthetic_verification_report.sha256` — отдельный hash generated report без циклического включения report в source manifest.

## Запуск

Полная offline-проверка:

```bash
npm ci
npm run verify
```

Внешний PostgreSQL 15+ с теми же behavior/security probes:

```bash
DATABASE_URL=postgresql://... tests/run_postgres_tests.sh
```

`npm run verify` использует только синтетические данные, запускает pinned validators и либо одноразовый локальный PostgreSQL 18.4, либо внешний disposable PostgreSQL 15+ при заданном `DATABASE_URL`. Оба пути выполняют одинаковые `up → catalog/behavior/security assertions → down → empty catalog` и cleanup в `finally`.

Канонический verification flow состоит из трёх независимых проверок, все обязательны для `IMPLEMENTATION_READINESS_GATE`:

1. `python -m venv` + `pip install -r requirements.txt` + `python verify_contracts.py` — статическая проверка (в контрольном прогоне 14/14 checks), включая byte-identity `docs/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (fenced blocks `yaml`×2 и `sql`×1) ↔ `openapi.yaml`/`asyncapi.yaml`/`migrations/001_matching_critical_chain.up.sql`, а также integrity внутреннего `manifest.sha256` (каждый файл из манифеста пересчитывается и сверяется по raw bytes).
2. `npm ci` + `npm run verify` (= `node tests/run_contract_suite.mjs` + `node tests/run_evidence_self_tests.mjs` + `node tests/run_postgres_suite.mjs` на одноразовом disposable PostgreSQL 18.4/15+) — фактические raw offline assertions **28/28 PASS** (`tests/run_contract_suite.mjs`; 5 из 33 resolved CT ID — `CT-022`, `CT-030`–`CT-033` — резолвятся только из PostgreSQL evidence и не имеют собственной raw-assertion), resolved-матрица **`CT-001`–`CT-033`, 33/33 PASS** (`tests/evidence_matrix.mjs`), **`EV-001`–`EV-007`, 7/7 PASS**, **`PG-001`–`PG-030`, 30/30 PASS**.
3. `node tools/build_controlled_zip.mjs --prepare-manifest`, затем шаг 2, затем `node tools/build_controlled_zip.mjs` (final build) — двухфазная детерминированная пересборка ZIP с fail-closed проверкой актуальности `manifest.sha256` и report evidence перед packaging (см. `tools/build_controlled_zip.mjs`).

Итоговый CT `PASS` создаётся только full runner после разрешения exact dependencies и semantic evidence requirements. `PG-019` выполняет 33 positive event payload probes, 33 UUID v7 positive probes и 2021 schema-derived per-constrained-field negative mutations (каждый rollback подтверждён отсутствием строки). `PG-026` выполняет 15 базовых runtime DLP probes (payload/trace/metadata, нормализованные телефоны/паспорта) плюс golden corpus: 51 malicious value vectors + 5 safe value controls, 112 forbidden-key case/evasion vectors (8 токенов × 14 вариантов), 8 composite/prefixed/suffixed key vectors + 2 nested composite-container vectors (`DLP_FORBIDDEN_KEY_MATCH_V2`), 4 normative-allowlist safe-key controls + 4 ordinary safe-key controls, с service/DB parity mismatches = 0. Также: пять отдельных составных Reveal mismatch operations, atomic Token → immutable Attempt → server-owned result/hash, two-connection race, immutable mutations и shadow-object attack.

Пакет самодостаточен: оба нормативных Markdown-документа находятся в `docs/`; внешнее расположение документов не требуется. Для передачи используется отдельный top-level `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`, который содержит hashes трёх канонических артефактов и запрещает проверку файлов с суффиксами.

Для `IMPLEMENTATION_READINESS_GATE` обязательны все три успешных результата канонического verification flow выше. PASS не переводит пакет в `APPROVED` без повторного решения DEVELOPMENT. До отдельного `PRODUCTION_LAUNCH_GATE` разрешены только синтетические данные.
