# LeaseMind Matching Decision Record — XFR-D-083

**Decision ID:** `XFR-D-083`

**Название:** Safe Presentation combination/quasi-identifier evidence and test-governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-02

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-09-02 working session

**Repository baseline:** `888f66055d875cf6b0e28fa9923310e16c54ebfb`

**Canonical identity:** `SPP-13 → XFR-D-083`, `PRIMARY_STANDALONE`, Evidence for combination/quasi-identifier risk.

**Governance owner:** `AI + DEVELOPMENT`

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence-manifest design, dataset/test preparation, execution support or result measurement does not grant unilateral approval and does not substitute mandatory-approver determination.

**Role-authority note.** `AI + DEVELOPMENT` preserves the only source-backed Safe Presentation Policy §15 row 13 candidate pair and the inherited `MATCHING_EVALUATION_PLAN` procedure-owner context. `PRODUCT + LEGAL` retain authority over Safe Presentation usefulness, content, legal/data-minimization and re-identification determinations; Chief AI Architect retains architecture/separation review. Required SECURITY/DLP-domain review is an evidence dependency, not an addition to the approved owner/approver triples and not a transfer of decision authority. The Evaluation Plan's separate candidate DLP-threshold owner is not imported into this decision.

**Depends on:** `XFR-D-072 v1.0` (fifteen qualitative per-row evidence categories, actual allowlist and row decisions remain independent), `XFR-D-073 v1.0` (object-type registry identity), `XFR-D-074 v1.0` (geographic evidence prerequisites), `XFR-D-075 v1.0` (combination-risk algorithm governance), `XFR-D-076 v1.0` (successive-disclosure governance), `XFR-D-077 v1.0`–`XFR-D-080 v1.0` (catalog, wording, localization and audience/purpose), `XFR-D-081 v1.0` (cache/expiry/revocation) and `XFR-D-082 v1.0` (runtime-carrier governance). `XFR-D-M3` (re-identification method/threshold) and `XFR-D-084` (Safe Presentation artifact approval/change control) remain independently `OPEN`.

---

## 1. Вопрос

Какова qualitative governance/evidence boundary будущего Safe Presentation evidence/test package, чтобы роли, preregistration, version/hash binding, обязательное раздельное покрытие risk/channel/reviewer evidence families, fail-closed handling, non-compensation, prerequisite-not-authorization и synthetic-only limitation были однозначны, но ни один dataset, method, metric, number, statistical procedure, test implementation, run/result/verdict или production claim не были преждевременно разрешены?

## 2. Source/status discipline

Inventory §4.6 закрепляет canonical mapping `SPP-13 → XFR-D-083`, `PRIMARY_STANDALONE`, «Evidence for combination/quasi-identifier risk».

Safe Presentation Policy §15 row 13 содержит только candidate assignment: «Test dataset/evidence | `AI + DEVELOPMENT` (candidate/inherited context через `MATCHING_EVALUATION_PLAN`) | Candidate». Источник не задаёт отдельный owner/approver/evidence-procedure split; этот record разрешает human-approved split выше без изменения broad `PRODUCT + LEGAL` authority над `SAFE_PRESENTATION_POLICY`.

Safe Presentation Policy §8 перечисляет девять `DECISION_CANDIDATE_FOR_REVIEW` adversarial scenarios: joint combination uniqueness, rare-category/cohort risk, geography denominator, external searchability, successive disclosure, Cross-Campaign/multi-user collusion, rank/candidate-count leakage, localization/free-text identifier leakage и cache/preload/log/telemetry/API leakage. Ни один метод, threshold, dataset или pass/fail rule там не выбран.

Safe Presentation Policy §12 разводит три факта: существующий Data Contracts DLP покрывает direct identifiers в event/outbox контуре; DLP PASS не доказывает quasi-identifier combination safety; presentation-specific negative tests для UI/API/cache/notification/log/telemetry/preload не существуют. Existing event/outbox DLP не распространяется автоматически на новый presentation output channel.

Safe Presentation Policy §14 перечисляет обязательные будущие review/test families, но прямо утверждает, что ни одна проверка ещё не выполнена. `MATCHING_EVALUATION_PLAN_v0.1.md` §6.5 покрывает direct identifiers, exact address и free text, но не содержит готовой metric family для combination/quasi-identifier re-identification risk. Это observable gap, не готовая процедура и не evidence completion.

Architecture §§52–53 и Data Contracts §§8/10 являются только precedents evidence integrity: version/hash/manifest discipline, exact dependency binding, executable positive/negative evidence, невозможность `PASS` при missing/renamed/failed/undersized dependency и запрет static/text-only assertion как самостоятельного `PASS`. Текущий Data Contracts synthetic suite не является Safe Presentation evidence, не покрывает `XFR-D-083` и не переносит свой `PASS` на этот scope.

Architecture §22.1 deny/minimization boundary, §40 source-owner/single-writer discipline, §48 DLP/data-classification boundary и §52 controlled-artifact requirements остаются применимыми без ослабления. Required SECURITY/DLP-domain review сохраняется как evidence dependency; SECURITY не становится owner или mandatory approver этого record'а.

Этот record разрешает только qualitative governance/evidence boundary ниже.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `AI + DEVELOPMENT`.** Пара точно сохраняет Safe Presentation Policy §15 row 13 candidate/inherited context.
2. **Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.** Chief AI Architect проверяет architecture/separation; PRODUCT — usefulness и purpose fit; LEGAL — lawful/data-minimization/re-identification boundary.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Он проектирует candidate evidence procedure и готовит evidence package, но не принимает mandatory-approver determination.
4. Ни одна роль, AI/model output, test runner, CI result, DLP result, dataset curator, technical author или implementation team не имеет unilateral approval authority.
5. SECURITY/DLP-domain review обязателен там, где затронут соответствующий control domain, но является evidence dependency, а не новой owner/approver ролью.
6. Evaluation Plan's candidate DLP threshold/metric ownership, actual Evaluation Plan approval procedure и Safe Presentation artifact approval не объединяются с этим role split.

### 3.2. Preregistered version/hash-bound evidence manifest

1. Future evidence package должен быть preregistered до final execution и связан с exact immutable identity проверяемого scope.
2. Binding qualitatively включает exact Safe Presentation policy version/hash, applicable `XFR-D-072` row identities, object-type registry keys, carrier/contract version, recipient/audience/purpose scope, source versions/hashes, applicable lifecycle state и evidence/test manifest version/hash.
3. Изменение dataset, scope, scenario, method, metric, threshold, code, fixture, tool version, reviewer scope или prerequisite после freeze не переписывает исходный package; оно требует новой version/run identity и явной supersession/provenance chain.
4. Exact manifest schema, IDs, field names, signature carrier, storage, freeze procedure и runtime representation остаются `OPEN`.
5. Наличие manifest или совпадение hash является prerequisite integrity, не доказательством safety, usefulness, legality, approval или production readiness.

### 3.3. Separate mandatory evidence families

Будущий evidence manifest должен отдельно учитывать применимые families; одна family не поглощает другую:

1. direct-identifier and forbidden-content negative evidence;
2. joint full-payload combination/quasi-identifier evidence, не per-field-only;
3. rare-category, cohort, uniqueness, small-cell and external-searchability evidence;
4. geography/travel/location reconstruction evidence;
5. successive-disclosure and cross-session correlation evidence;
6. Cross-Campaign/multi-user collusion adversarial evidence;
7. free-text, photo, document, reason/explanation and localization leakage evidence;
8. separate channel evidence for every applicable UI, API, cache, notification, log, telemetry, preload, offline/client or other future carrier surface;
9. object-type-specific and applicable segment/intersection evidence;
10. replay, freshness, invalidation, revocation and stale-artifact evidence;
11. PRODUCT usefulness/purpose review evidence;
12. LEGAL/Data Governance determination evidence;
13. applicable SECURITY/DLP-domain review evidence;
14. architecture/carrier/source-authority preservation evidence;
15. limitations, uncertainty, unresolved dependencies and reviewer-decision references on the same frozen manifest.

Этот перечень организует future evidence review и не создаёт новую, шестнадцатую `XFR-D-072` per-row evidence category. Он не утверждает actual scenario contents, dataset, method, metric, number, reviewer outcome или evidence package.

### 3.4. Fail-closed evidence handling

1. Missing, incomplete, stale, conflicting, superseded, unverifiable, scope-incompatible, version-incompatible или hash-incompatible required evidence blocks the affected candidate row/scope from presentation authorization.
2. Missing evidence не становится negative business fact, proof of unsafe property/user, failed match, Risk verdict, legal verdict, `INELIGIBLE`, failed Qualification или user intent.
3. AI/heuristic/proxy inference не может заполнять отсутствующий test, reviewer decision, dataset fact, label, source authority или evidence reference.
4. Exact cascade granularity — element, row, payload, artifact, policy или иной scope — остаётся `OPEN`; этот record не выбирает и не исключает вариант.
5. Historical evidence remains distinguishable from current applicable evidence; exact retention and current-vs-historical carrier remain `OPEN`.

### 3.5. Non-compensation

Не компенсируют отсутствующую или insufficient applicable evidence family:

- direct-identifier DLP PASS или schema validation;
- per-field PASS либо aggregate/common-case safety;
- успешный synthetic test по другой row, object type, segment, locale, audience, purpose или channel;
- high Match Score, Confidence, Qualification, Presentation Readiness или user acceptance;
- cache HIT, prior validity, carrier validity или contract-test PASS;
- отсутствие наблюдаемого incident/re-identification;
- business urgency, manual assertion или post-hoc reviewer convenience.

Common-case или aggregate evidence не компенсирует rare category, joint combination, small-cell, geography, successive-disclosure, collusion, localization или channel-specific gap.

### 3.6. Prerequisite, never authorization

1. Evidence result является только prerequisite для будущего exact row/policy decision.
2. Он не создаёт и не разрешает field, transformation, generalization, combination set, catalog entry, wording, locale, audience/purpose mapping, cache rule, carrier schema, policy, runtime или gate transition.
3. Он не пересчитывает и не изменяет Eligibility, Hard Constraints, score, rank, Confidence, Risk, Qualification или routing.
4. Он не заменяет explicit PRODUCT/LEGAL determination на same policy/row/evidence version/hash.
5. Он не закрывает independently `OPEN` numeric/method/content decisions.

### 3.7. Synthetic-only limitation

1. Synthetic-only evidence не создаёт production cohort uniqueness, production searchability, production collusion protection, production channel coverage, production-data validity или production readiness.
2. Synthetic evidence MAY быть использовано только будущей explicitly approved procedure для соответствующего synthetic gate; этот record такую procedure, run или gate result не утверждает.
3. Synthetic PASS не переносится между dataset, row, object type, segment, locale, audience, purpose, channel, policy hash или carrier version.
4. Реальные данные и production-like evidence не разрешаются этим record'ом.

### 3.8. No automatic change or action

Ни PASS, ни FAIL, ни uncertainty, ни missing evidence не могут автоматически:

- изменить allowlist/policy, model, prompt, algorithm, threshold, weight or taxonomy;
- добавить/удалить field, transformation, row, catalog entry or localization;
- изменить carrier, cache, runtime configuration or monitoring action;
- изменить Eligibility, score, rank, Risk, Qualification or routing;
- approve/reject Safe Presentation artifact, model release, implementation or production launch.

Любое изменение требует своего applicable governance/change-control path.

### 3.9. Explicit non-conflation

Этот record не переоткрывает, не расширяет, не поглощает и не подменяет:

1. `XFR-D-072` — actual allowlist rows и пятнадцать qualitative evidence categories;
2. `XFR-D-073` — object-type registry identity;
3. `XFR-D-074` — geography governance/evidence prerequisites;
4. `XFR-D-075` — combination-risk algorithm governance, algorithm/method остаются `OPEN`;
5. `XFR-D-076` — successive-disclosure budget/scope/reset/counting;
6. `XFR-D-077`–`XFR-D-080` — catalog, wording, localization and audience/purpose;
7. `XFR-D-081` — cache/expiry/revocation lifecycle;
8. `XFR-D-082` — runtime carrier/Data Contracts extension;
9. `XFR-D-M3` — cohort/uniqueness/re-identification method and threshold;
10. `XFR-D-084` — Safe Presentation approval/change control;
11. Evaluation Plan metric/statistical/data-governance decisions, actual Plan approval or production operational monitoring;
12. Architecture/Data Contracts acceptance suite and DLP controls;
13. dataset de-identification, fairness/legal doctrine, segment coverage or statistical-comparison decisions.

Cross-Campaign/multi-user collusion tests are required as a future evidence family but do **not** assign or resolve the currently unassigned collusion governance gap. Passing such tests does not establish an approved collusion method, scope, threshold or policy.

### 3.10. Partial, never fully resolved

`XFR-D-083` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, preregistered version/hash-bound evidence-manifest discipline, separate mandatory risk/channel/reviewer evidence families, fail-closed handling, non-compensation, prerequisite-not-authorization, synthetic-only limitation, no-automatic-change rule and explicit non-conflation разрешены qualitatively.

Все actual datasets, sources, labels, methods, metrics, numbers, statistics, schemas, test vectors, tools, runs, results, evidence verdicts, reviewer appointments/outcomes, production applicability, runtime and implementation remain `OPEN`. Будущее exact решение требует нового versioned `XFR-D-083` record с `supersedes`.

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Safe Presentation content/legal authority | Architecture §§37/52; `XFR-D-072` | `PRODUCT + LEGAL` determinations preserved | Every actual row, field and policy approval |
| Evidence/test governance | `XFR-D-083 v1.0` | Roles, preregistration, families, fail-closed/non-compensation | Dataset, methods, metrics, suite, run, verdict |
| Re-identification method/threshold | `XFR-D-M3` | Dependency preserved | All method/numeric content |
| Combination/successive-disclosure governance | `XFR-D-075`/`XFR-D-076` | Dependencies preserved | Algorithms, budgets, scopes and values |
| Runtime carrier/cache | `XFR-D-081`/`XFR-D-082` | Evidence binding only, no carrier inferred | All lifecycle/carrier mechanics |
| Existing Architecture/Data Contracts tests | Architecture §53; Data Contracts §§8/10 | Integrity precedent only | Safe Presentation-specific evidence |
| Policy/change control | `XFR-D-084` | No approval inferred | Artifact approval, manifest entry and release |

## 5. Что остаётся `OPEN`

- actual dataset/corpus, data sources, eligibility, lawful basis, data authority and real/synthetic status;
- population, sampling, object types, segments, intersections, units of evaluation and tuning/final isolation;
- fixtures, vectors, scenario contents, scenario counts and coverage matrix;
- direct/proxy/quasi-identifier classification catalog and applicable legal determination;
- combination-set, cohort, rarity, uniqueness, small-cell, searchability, geographic and collusion methods;
- successive-disclosure unit, scope, identity representation, history horizon, reset and counting semantics;
- audience, purpose, locale, channel and carrier applicability;
- metric families, numerator, denominator, counting unit, baseline, sample size, target and acceptable range;
- every threshold, tolerance, weight, aggregation, uncertainty, confidence interval and statistical test;
- PASS/FAIL/INCONCLUSIVE/verdict semantics and report/status/error enums;
- DLP classifier, patterns, allowlists, tools, versions and presentation-channel implementation;
- replay, invalidation, cache and stale-artifact test mechanics;
- evidence manifest/record schema, identifiers, hashes, signatures, storage, retention, access, RBAC and audit;
- runner, tool/provider, environment, code version, reproducibility and execution procedure;
- reviewer identities, appointments, quorum, qualification, independence, conflict checks and adjudication;
- exact PRODUCT/LEGAL/SECURITY evidence forms and decisions;
- fail-closed cascade granularity and evidence carrier/API/event/DB representation;
- actual test execution, results, verdicts, limitations and acceptance report;
- Safe Presentation Policy and Data Contracts extension approval, `XFR-D-084` change control/manifest entry;
- production data/applicability, runtime monitoring/remediation/automation, model/policy release and implementation;
- `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` transitions.

## 6. Rationale

Direct-identifier DLP is necessary but cannot establish that individually coarse values remain non-identifying when combined, repeated, localized or exposed through a secondary channel. Conversely, a governance record cannot fabricate the missing population, method, metric, threshold or empirical run. The narrow decision therefore freezes evidence authority and integrity rules while leaving every empirical and numeric content item open.

This separation also prevents a current Data Contracts synthetic PASS from being misread as Safe Presentation evidence and prevents future test execution from becoming a self-authorizing policy mutation.

## 7. Adversarial cases

1. **Event DLP PASS reused as Safe Presentation evidence.** Rejected: the output channel and quasi-identifier risk are different scopes.
2. **Per-field PASS proves joint payload safety.** Rejected: full simultaneous combination evidence is independently required.
3. **Aggregate/common-case success hides rare category.** Rejected by non-compensation.
4. **One UI test covers API/cache/log/preload.** Rejected: every applicable channel requires separate evidence.
5. **Synthetic cohort proves production uniqueness.** Rejected: synthetic-only evidence never proves production readiness.
6. **Evidence added after seeing results.** Rejected: final execution must bind to a preregistered frozen manifest; changes create a new identity.
7. **Missing evidence inferred by AI.** Rejected: no heuristic/proxy completion.
8. **Test failure changes score or Qualification.** Rejected: evidence governance is read-only relative to underlying results.
9. **Carrier contract PASS authorizes content.** Rejected: carrier validity is only a prerequisite.
10. **Collusion suite resolves collusion governance.** Rejected: the governance gap remains unassigned and independently `OPEN`.
11. **SECURITY becomes approver because DLP review is required.** Rejected: required domain evidence does not change the approved role triples.
12. **Existing Evaluation Plan metric family is assumed.** Rejected: §6.5 has no ready combination/quasi-identifier metric family.
13. **Static document review yields PASS.** Rejected: precedent requires executable evidence where applicable; exact procedure remains `OPEN`.
14. **One approved row/policy hash evidence is reused after change.** Rejected: scope/version/hash mismatch fails closed.

## 8. Affected artifacts (future separate sync)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — §8, §12, §14, §15 row 13, readiness and acceptance criteria may receive only this qualitative governance boundary;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — future owner-review overlay for `SPP-13 → XFR-D-083`, without rewriting historical checkpoints or canonical mapping;
- future Evaluation Plan/Data Contracts/evidence artifacts — separate decisions and changes after applicable approvals;
- `XFR-D-084` and actual Safe Presentation policy approval — separate pass.

No future sync may interpret this record as an approved dataset, evidence package, method, metric, threshold, test suite, execution result, evidence verdict, Safe Presentation Policy, Data Contracts extension, production-safe payload, runtime or implementation authorization.

## 9. Change control

Changing governance owner, mandatory approvers, evidence-procedure role, preregistration/version-hash binding, mandatory evidence-family separation, fail-closed/non-compensation, prerequisite-not-authorization, synthetic-only limitation, no-automatic-change rule or non-conflation boundary requires a new versioned `XFR-D-083` record with `supersedes`, approved by `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`.

Actual evidence contents and empirical results require their separately governed versioned artifacts; they cannot be appended silently to this record.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** governance authority, **when** roles are checked, **then** owner is `AI + DEVELOPMENT`, mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`, and evidence-procedure owner `AI + DEVELOPMENT` has no unilateral approval.
2. **Given** required SECURITY/DLP-domain review, **when** authority is checked, **then** it remains evidence dependency and does not add SECURITY to the approved owner/approver triples.
3. **Given** a future evidence run, **when** final execution begins, **then** exact policy/row/object/carrier/audience-purpose/source and evidence-manifest versions/hashes are preregistered or the run cannot support authorization.
4. **Given** a post-freeze change, **when** evidence identity is evaluated, **then** the original run is not rewritten and the changed scope requires a new version/run identity.
5. **Given** direct-identifier DLP PASS, **when** combination/quasi-identifier safety is claimed, **then** the claim is rejected without independent joint evidence.
6. **Given** any two evidence families, **when** one passes and another is missing or insufficient, **then** no compensation or aggregate override is allowed.
7. **Given** missing/incomplete/stale/conflicting/version-hash-incompatible evidence, **when** the candidate scope is evaluated, **then** it fails closed without negative business, Risk, legal, Eligibility or Qualification inference.
8. **Given** fail-closed handling, **when** cascade granularity is requested, **then** element/row/payload/artifact/policy granularity remains explicitly `OPEN`.
9. **Given** synthetic-only evidence, **when** production safety/readiness is claimed, **then** the claim is rejected.
10. **Given** PASS/FAIL/missing evidence, **when** automatic policy/model/carrier/runtime/routing change is attempted, **then** it is prohibited.
11. **Given** Cross-Campaign/multi-user collusion tests, **when** collusion governance authority is claimed, **then** the claim is rejected; the unassigned governance gap remains `OPEN`.
12. **Given** current Architecture/Data Contracts acceptance evidence, **when** XFR-D-083 completion is claimed, **then** the claim is rejected as out-of-scope precedent.
13. **Given** this record, **when** any actual dataset, method, metric, number, statistic, schema, test suite, run/result or verdict is requested, **then** none is approved.
14. **Given** `XFR-D-072`–`XFR-D-082`, `XFR-D-M3` and `XFR-D-084`, **when** this boundary is applied, **then** none is reopened, absorbed, substituted or resolved by implication.
15. **Given** this record, **when** policy, carrier, production-data, runtime, implementation and gate status are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 12. Outcome

`XFR-D-083 SAFE PRESENTATION EVIDENCE/TEST GOVERNANCE BOUNDARY APPROVED — ALL DATASETS, METHODS, NUMBERS, STATISTICS, SCHEMAS, RUNS, RESULTS, VERDICTS, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
