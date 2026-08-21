# LeaseMind — DEVELOPMENT Review of Matching Engine Architecture v1.1

**Проверка:** восьмая техническая проверка DEVELOPMENT
**Дата:** 2026-08-21
**Роль:** Lead Software Architect (независимый reviewer)
**Режим:** только синтетические данные; реальные платежи, реальные персональные данные, production adapters и раскрытие защищённых данных не использовались
**Проверяемый immutable candidate commit:** `d607eb3223ff22eb67ea7af86add522e6e33b923` (branch `development/sprint-7-matching-eighth-review`, base `origin/development/sprint-7-matching-readiness` — тот же commit)

Настоящая проверка не принимает `PATCHLOG.md`, предыдущие отчёты или зелёный `synthetic_verification_report.json` на веру. Каждое утверждение ниже — либо независимо пересчитанный hash, либо код, прочитанный напрямую в исходниках, либо результат отдельно воспроизведённого прогона/adversarial-пробы в этой проверке.

---

## 1. Проверенный controlled set и независимо вычисленные hashes

| Артефакт | Метод | SHA-256 | Сверка |
| --- | --- | --- | --- |
| `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` | raw bytes, рабочая копия Windows (CRLF) | `938f9dd1db35d9f2a13d6f8192634bed72f8d5442c4cc575fcd98d64112252dc` | — (не публикуется в manifest в этой форме) |
| `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` | LF-normalized (`\r\n`→`\n`) plain SHA-256 | `d5d3afe113ed01076ae9c4e54f5791b8b33477402838a3f5d3641a73dd286ffa` | = submission manifest, = hash первоначального импорта 2026-07-26 |
| `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` | raw bytes, рабочая копия Windows (CRLF) | `69a89b950407d77c66619bb594af3ee705b41f74fbea8d362526ea1bbaa11d9c` | — |
| `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` | LF-normalized plain SHA-256 | `7ff50427c30167ff784fbd0acf7fd2a8053f17f5bb893cd514715b3cdbd46823` | = submission manifest |
| `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip` | raw bytes | `7b5a11dfe9b3fa881d7769d44bbb62b1e3d69fbd2d56ecaaa98bdb80784499da` | = submission manifest; воспроизведено двумя независимыми пересборками (см. §4) |
| `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json` | raw bytes | `ba7c088d29fae9bff4725d4feb28870baaf3040d1efcae3dd3e920baf38a0b88` | справочно |
| Внутренний `manifest.sha256` | raw bytes | `487facad1c8bd6465692365e8a89bbd91aabf42e13afa80e7742dba590a9657a` | = `report.source_manifest_sha256` |
| `synthetic_verification_report.json` | raw bytes | `25c1e25378f8864ce4499f4d3a36f83d376171697885f04614c114533a63aaab` | = `synthetic_verification_report.sha256` |
| `postgres_execution.log` | raw bytes | `63905fbe67a4e6c40270ac620796e6fba1581a0d359277250bf5e6f1365309d3` | = `report.postgres.stderr_log_sha256` |

**Замечание по терминологии (см. non-blocking finding NB01 ниже):** submission manifest называет метод для двух Markdown-документов «git blob convention». Независимая проверка показала, что это не совпадает с фактическим blob-object hash git (`git hash-object` даёт SHA-1 `4e5d301e...`/`2adf1cc4...` — другую длину и другой алгоритм). Реально применённый и воспроизводимый метод — plain SHA-256 над LF-normalized содержимым, что и подтверждено выше побайтовым совпадением с заявленными hash.

Все связи manifest↔files, report↔source-manifest, report↔log и sidecar↔report проверены путём независимого пересчёта (не чтением значений друг из друга): все 24 записи внутреннего `manifest.sha256` пересчитаны против фактических файлов распакованного ZIP — совпадение 24/24; `report.source_manifest_sha256` и `report.postgres.stderr_log_sha256` пересчитаны и совпали с фактическими файлами; `synthetic_verification_report.sha256` пересчитан и совпал.

**Archive contents:** 28 файлов, единый root prefix `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0/`, без `..`/path traversal, без `node_modules`, `.git`, temp- или suffix-файлов, фиксированный DOS timestamp `1980-01-01 00:00` на каждой записи. `diff -rq` между свежераспакованным ZIP и `source/` — без различий. Число файлов совпадает (28/28).

---

## 2. Normative consistency

- Fenced-блоки `docs/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (`yaml`×2, `sql`×1) побайтово идентичны `openapi.yaml`/`asyncapi.yaml`/`migrations/001_matching_critical_chain.up.sql` — проверено независимым regex-извлечением (не переиспользуя `verify_contracts.py`) и строковым сравнением: все три совпадения `true`.
- Top-level `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` побайтово идентичен embedded `docs/`-копии внутри ZIP (`diff -q` — без различий).
- Top-level `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` побайтово идентичен embedded `docs/`-копии (`diff -q` — без различий); не менялся с первоначального импорта (hash совпадает с записью 2026-07-26 в верхнем README).
- Версии и статусы не повышены: Architecture — `1.1`, `Proposal for cross-functional review and approval`; Data Contracts — `1.0`, `Proposal for DEVELOPMENT review`. Оба подтверждены прямым чтением заголовков документов, не только submission manifest.
- Верхний `README.md` (`05_DEVELOPMENT/matching-engine/README.md`) явно подписывает таблицу SHA-256 первоначального импорта как исторический снимок 2026-07-26 и отсылает к submission manifest за актуальными hash; статус candidate указан как `CANDIDATE FOR EIGHTH DEVELOPMENT REVIEW`, не `APPROVED`.
- `PRODUCTION_LAUNCH_GATE: BLOCKED` подтверждён во всех источниках (Architecture §36.4, верхний README, submission manifest).

---

## 3. Воспроизведённые штатные результаты (из распакованного candidate ZIP)

Все результаты ниже получены из **свежераспакованного** `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip` в изолированной temp-копии вне репозитория, не из `source/` рабочей копии репозитория (хотя `source/` также независимо сверен как побайтово идентичный ZIP).

| Проверка | Метод | Результат |
| --- | --- | --- |
| Python `verify_contracts.py` | свежий pinned venv (`PyYAML==6.0.3`), запуск из распакованного ZIP | `PASS`, 14/14 static checks |
| `npm ci` | pinned `package-lock.json`, чистая установка | 157 пакетов, без ошибок |
| Raw offline `run_contract_suite.mjs` | из распакованного ZIP | `CT-001–CT-029` (кроме `CT-022`) — **28/28 PASS** |
| `run_evidence_self_tests.mjs` | из распакованного ZIP | `EV-001–EV-007` — **7/7 PASS** |
| `run_postgres_suite.mjs` | один полный `up → PG-001–030 → down → empty catalog` на новом disposable PostgreSQL 18.4 (`127.0.0.1:55440`, `tmpfs`, без volume) | **PG-001–030 — 30/30 PASS** |
| Resolved `CT-001–033` | независимо вычислено вызовом `evidence_matrix.mjs::resolveCtEvidence` над собственными raw CT+PG выводами этой проверки (не над предзаписанным `report.json`) | **33/33 PASS** |

Post-down catalog проверен пустым (`PG-012`/`PG-013` в составе 30/30). Disposable-контейнер (`leasemind-eighth-review-pg`) уничтожен сразу после прогона; `leasemind-postgres-1`/`5433` не открывался и не запрашивался в течение всей проверки.

---

## 4. Независимые adversarial probes

Все пробы — на temp-копиях вне репозитория; ни одна мутация не переносилась в candidate.

| № | Проба | Метод | Результат |
| --- | --- | --- | --- |
| 1 | UUID v1 запрещён, v4/v7 разрешены | Прямой SQL-вызов `leasemind_security.validate_event_payload('PAYER_ASSIGNED', '1.0.0', payload)` с `encounter_id` = `6ba7b810-9dad-11d1-80b4-00c04fd430c8` (v1) на живом migrated-instance | `ERROR: LM-OUTBOX-PAYLOAD-FORMAT` — отклонено. Тот же payload с UUID v7 — принят (`t`) |
| 2 | `customer_email`/zero-width composite forbidden key запрещены, 4 normative allowlist keys разрешены | Прямой SQL-вызов `leasemind_security.validate_no_direct_identifiers(...)` с `{"customer_email": "..."}`, с `{"customer<ZWSP>email": "..."}` и со всеми 4 allowlist-полями одновременно | Оба malicious-варианта — `ERROR: LM-DATA-CLASSIFICATION-VIOLATION`. Allowlist-вариант — принят (`t`) |
| 3 | Старый 5-arg redemption отсутствует; backdating невозможен | `select count(*) from pg_proc ... where proname='redeem_reveal_token' and identity_arguments like '%timestamptz%'` → `0`; прямой вызов с 5-м `timestamptz`-аргументом | Сигнатур с `timestamptz` — 0; вызов с 5 аргументами → `ERROR: function ... does not exist` (параметра для backdating физически не существует) |
| 4 | B04 обе race order подтверждены фактическим blocking/commit behavior | Независимое чтение исходного кода двух race-проб в `run_postgres_suite.mjs` (не только evidence-полей): оба сценария используют реальные раздельные `pg.Client`, `pg_stat_activity.wait_event_type='Lock'`-polling (не `sleep`), настоящие `BEGIN`/`COMMIT`, и `assert.rejects`/`assert.equal` **до** литералов evidence — литералы недостижимы при провале assertion. Дополнительно независимо прочитан lock order в `redeem_reveal_token` (token → lease ordered `FOR UPDATE OF lease` → guard `FOR UPDATE`) и в `apply_safety_critical_invalidation` (lease `UPDATE` → guard `UPDATE`) — порядок зеркален | Тестовый код не тривиален (не test theatre); lock order подтверждён построчным чтением; `invalidation_first_race_rejected:1`, `redemption_first_race_completed:1` в независимо воспроизведённом PG-030 |
| 5 | B05 consumer-operation swap переводит evidence в `FAIL` | Точечная mutation `asyncapi.yaml`: `PAYER_ASSIGNED` → `consumer_operation: consumeDecisionRecorded`; повторный запуск `run_contract_suite.mjs`; откат | `CT-028 FAIL`: `"PAYER_ASSIGNED: consumer_operation consumeDecisionRecorded payload schema does not declare this event_type"`. После отката — `CT-028 PASS` |
| 6 | B06 caller-supplied hash не влияет на deletion hash | Прямой вызов `cryptoUnlink({..., deletion_act_hash: attackerValue})` из `tests/synthetic_service_models.mjs` | `out.deletion_act_hash !== attackerValue`; `record.deletion_act_hash` не читается (ключ отсутствует в цепочке вычисления) |
| 7 | Markdown desync ломает Python verifier | Точечная mutation `docs/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (комментарий внутри `yaml`-блока); повторный запуск `verify_contracts.py`; откат | `status: FAIL`, `AssertionError`, только 12/14 checks (оба — markdown-extraction и manifest-integrity — отсутствуют). После отката — `PASS`, 14/14 |
| 8 | Stale source-manifest binding ломает final packager | Свежий независимый harness (копия `tools/build_controlled_zip.mjs` + 28 нормативных файлов, без переиспользования предыдущих проб): `report.source_manifest_sha256` заменён на `'f'.repeat(64)` | `BUILD FAILED (fail-closed)`: manifest mismatch, ZIP не записан |
| 9 | Missing/duplicate/non-PASS PG entry ломают final packager | Тот же harness: дубликат `PG-001` в `postgres.tests` | `BUILD FAILED (fail-closed)`: `duplicate id(s) detected (31 entries, 30 unique)`, ZIP не записан |
| 10 | Non-PASS CT entry ломает final packager | Тот же harness: `CT-015.status = 'BLOCKED'` | `BUILD FAILED (fail-closed)`: `non-PASS entries: CT-015=BLOCKED`, ZIP не записан |
| 11 | Sanity: восстановленный baseline снова даёт `PASS` | Тот же harness после отката всех трёх проб выше | `PASS`, ZIP записан, `zip_sha256` совпал с §1 |
| 12 | Два deterministic ZIP build побайтово идентичны | Два независимых вызова `build_controlled_zip.mjs` в один harness, разные `--out` | `cmp` — без различий; оба `sha256` = `7b5a11dfe9...` (§1) |

Все 12 проб дали ожидаемый результат (fail-closed там, где это требовалось, и корректный `PASS` на восстановленном baseline); ни одна проба не выявила fail-open поведение.

---

## 5. Таблица `SEVENTH-B01–B06`

| ID | Требование Architecture §42–44 | Независимая проверка кода | Adversarial-подтверждение | Статус |
| --- | --- | --- | --- | --- |
| `SEVENTH-B01` | Только UUID v4/v7 на всех слоях | `openapi.yaml`/`asyncapi.yaml`: единственные `format: uuid` — определения `UuidV4OrV7` (64/36 `$ref`-использований); DB regex `[47]` (не `[1-8]`) на строке 1701 `up.sql` | Проба 1 | Закрыто |
| `SEVENTH-B02` (value) | Единая normalize-стратегия JS/DB для значений | `normalizeDlpScalar`(JS)/`normalize_dlp_scalar`(DB) — идентичная NFKC+`\D`-strip логика | golden corpus 51/51 malicious rejected, 5/5 safe accepted, `service_db_parity_mismatches: 0` (независимо воспроизведённый PG-026) | Закрыто |
| `SEVENTH-B02` (key, V1→V2) | Единая стратегия JS/DB для forbidden-KEY, включая composite/evasion | `isForbiddenDlpKey`(JS)/`is_forbidden_dlp_key`(DB) — идентичный 4-элементный allowlist gate + substring по идентичному 8-элементному token-набору; JS `KEY_EVASION_CHARACTERS` побайтово (по code point) сверен с DB `evasion_pattern` — идентичны | Проба 2 | Закрыто |
| `SEVENTH-B03` | Server-owned redemption time, backdating невозможен | `redeem_reveal_token` — ровно 4 аргумента, `v_redeemed_at := clock_timestamp()` вычисляется после всех locks | Проба 3 | Закрыто |
| `SEVENTH-B04` | Единый lock order redemption/invalidation, обе race order | Lock order token→lease→guard (redemption) зеркален lease→guard (invalidation) — подтверждено чтением обеих функций | Проба 4 | Закрыто |
| `SEVENTH-B05` | Exact `event_type`→payload schema binding, swap → `BLOCKED` | `resolveConsumerBinding` резолвит исключительно от `consumer_operation`; 264 ordered mismatch probes (33×8) в коде | Проба 5 | Закрыто |
| `SEVENTH-B06` | Server-derived domain-separated deletion hash, caller-independence | `DELETION_ACT_DOMAIN_TAG` + `canonicalJson` preimage из 4 server-owned полей; `record.deletion_act_hash` физически не читается (переменная отсутствует в теле функции) | Проба 6 | Закрыто |

Все шесть — закрыты не только штатным (потенциально предвзятым) прогоном, но и независимо сконструированными adversarial-пробами этой проверки.

---

## 6. Findings

Новых **blocking** findings не обнаружено.

| ID | Категория | Описание | Влияние | Статус |
| --- | --- | --- | --- | --- |
| `EIGHTH-NB01` | Документация / терминология | Submission manifest (`embedded_evidence` → `note` для `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`) называет метод хеширования Markdown-документов «git blob convention». Независимая проверка (§1) показывает, что `git hash-object` даёт совершенно другое значение (SHA-1 с internal blob-header, а не SHA-256). Фактически применённый и воспроизводимый метод — plain SHA-256 над LF-normalized содержимым. Сам заявленный hash корректен и независимо воспроизведён; неточен только термин. | Верификатор, буквально следующий фразе «git blob convention» через `git hash-object`, получит несовпадающее значение и может ошибочно заключить, что проверка провалена. Не влияет на корректность технической реализации, DLP, UUID, redemption, packaging tool или на сам hash. | non-blocking |

---

## 7. Раздельные verdicts

- **DEVELOPMENT (технический review executable contract package, объём настоящей проверки):** `APPROVED`. Все шесть `SEVENTH-B01–B06` независимо подтверждены закрытыми (код + adversarial-пробы, не только штатный прогон). Дополнительные corrective passes, найденные предыдущей фазой той же restart-цепочки (DLP V1→V2, синхронизация Data Contracts Markdown, packaging tool two-phase fail-closed lifecycle), также независимо подтверждены реализованными и работающими. Единственная находка (`EIGHTH-NB01`) — non-blocking документационная неточность, не техническая.
- **`ARCHITECTURE_APPROVAL_GATE`:** Настоящая проверка покрывает только пункт 4 условия §36.1 (реализуемость single-writer matrix, canonical encounter, source-owned Reveal leases, единой state machine, разделения четырёх gate — подтверждена данным executable package). Пункты 1–3 (подтверждение PRODUCT, BUSINESS, LEGAL) вне компетенции DEVELOPMENT-проверки и не оцениваются здесь. Gate в целом **не объявляется пройденным** этим документом.
- **`IMPLEMENTATION_READINESS_GATE`:** `BLOCKED`. Помимо технической проверяемости пакета (что данная проверка подтверждает), условие §36.2 требует: `MATCHING_DATA_CONTRACTS` формально `APPROVED` (сейчас — `Proposal for DEVELOPMENT review`, не `Approved`); закрытие вопросов №2, 3, 6, 8, 10, 11 раздела 37 (`MATCHING_SCORING_POLICY`, `SAFE_PRESENTATION_POLICY`, `MATCHING_RISK_POLICY`, `MATCHING_EVALUATION_PLAN`, `MATCHING_FEATURE_SCHEMA`); утверждение `PREVIOUS_CONTACT_EVIDENCE_POLICY`, `REVEAL_DELIVERY_EVIDENCE_POLICY`, `SECURITY_AND_DATA_LOCALIZATION_SPEC`, `MATCHING_REPRODUCIBILITY_SPEC`, `MATCHING_COST_MODEL`; полный Controlled Artifact Manifest с owner/version/hash/approval date. Ничего из перечисленного не входит в объём настоящей проверки и не закрыто ею.
- **`SYNTHETIC_ACCEPTANCE_GATE`:** `BLOCKED`. Требует прохождения `IMPLEMENTATION_READINESS_GATE` и выполнения всех 12 сценариев §53 против интегрированной реализации критических контуров; `apps/**` реализации Matching Engine пока не существует — проверять нечего.
- **`PRODUCTION_LAUNCH_GATE`:** `BLOCKED` абсолютно, не затронут настоящей проверкой. Реальные ПД, платежи, production adapters и раскрытие защищённых данных запрещены.

---

## 8. Ограничения и открытые policy blockers

- Реализация и тестирование этой проверки — исключительно на синтетических данных; реальные платежи, ПД, production adapters и раскрытие не использовались.
- Открытые вопросы §37, блокирующие `IMPLEMENTATION_READINESS_GATE` по явному условию §36.2.4: **№2, 3, 6, 8, 10, 11**. Вопрос №15 — отдельный абсолютный блокер `PRODUCTION_LAUNCH_GATE` (§36.4.1), не implementation-gate. Вопросы №7 и №9 в §37 не отмечены как implementation-gate условие в самом тексте §36.2 — они блокируют смежные policy-артефакты (`Qualification/Risk Policy`, `Evaluation Plan`), но не входят в explicit-список условия 4.
- `MATCHING_COST_ALLOCATION_DECISION` и производственные сертификации поставщиков платежей/ККТ/ОФД остаются `pending`.
- Известное ограничение UUID-проверки (раскрыто ещё в `SEVENTH-B01`-исправлении, не новое): uuid-поля, встречающиеся только в success-response схемах вне request/event fixtures, статически защищены общей `UuidV4OrV7`-ссылкой, но не имеют отдельного runtime negative-probe — тот же охват, что и у остального test suite, не регрессия.
- Настоящая проверка не оценивает продуктовую, юридическую или платёжную механику — они не менялись данным candidate set.

---

## 9. Итоговое заключение

По объёму настоящей восьмой технической проверки DEVELOPMENT (executable contract package `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip`, hash `7b5a11dfe9b3fa881d7769d44bbb62b1e3d69fbd2d56ecaaa98bdb80784499da`): **все шесть `SEVENTH-B01–SEVENTH-B06` независимо подтверждены закрытыми** — прямым чтением текущего кода (не только PATCHLOG) и отдельно сконструированными adversarial-пробами (не только штатным mutation corpus пакета), включая прямые SQL-вызовы к живому migrated instance, точечные mutation/revert циклы против `asyncapi.yaml` и `docs/`-Markdown, и независимый harness для packaging tool. Новых blocking-дефектов не обнаружено; единственная находка (`EIGHTH-NB01`) — non-blocking неточность терминологии в submission manifest, не влияющая на корректность или воспроизводимость самих hash.

**Итог DEVELOPMENT: `APPROVED`** — строго в объёме технической проверяемости executable contract package. Это не является и не подразумевает прохождения `ARCHITECTURE_APPROVAL_GATE` (требует PRODUCT/BUSINESS/LEGAL), `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE` — все четыре gate остаются в состоянии, зафиксированном §7, независимо друг от друга.

Версии и Proposal-статусы не повышать автоматически по итогам настоящей проверки — это отдельный governance-sync, не выполняемый этим документом.

До отдельного подписанного `PRODUCTION_LAUNCH_GATE` сохраняется абсолютный запрет на реальные платежи, реальные персональные данные, production adapters и раскрытие защищённых данных.
