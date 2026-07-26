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

Итоговый CT `PASS` создаётся только full runner после разрешения exact dependencies и semantic evidence requirements. PostgreSQL suite выполняет 33 positive и schema-derived per-constrained-field negative event payload probes (1020 в контрольном clean run), 15 runtime DLP probes с нормализованными телефонами/паспортами и rollback/safe diagnostic, пять отдельных составных Reveal mismatch operations, atomic Token → immutable Attempt → server-owned result/hash, two-connection race, immutable mutations и shadow-object attack.

Пакет самодостаточен: оба нормативных Markdown-документа находятся в `docs/`; внешнее расположение документов не требуется. Для передачи используется отдельный top-level `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json`, который содержит hashes трёх канонических артефактов и запрещает проверку файлов с суффиксами.

Для `IMPLEMENTATION_READINESS_GATE` обязательны оба успешных результата. PASS не переводит пакет в `APPROVED` без повторного решения DEVELOPMENT. До отдельного `PRODUCTION_LAUNCH_GATE` разрешены только синтетические данные.
