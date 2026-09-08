# LeaseMind Matching Decision Record — XFR-D-M4

**Decision ID:** `XFR-D-M4`

**Название:** Bounded replay tolerance qualitative governance and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-09-08

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE REPLAY-GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — EVERY NUMERIC TOLERANCE, ERROR METRIC, INVARIANT CATALOG, DATA, STATISTIC, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-08

**Repository baseline:** `315be65098f8589bb8a5de8ddde09fdf2007116d`

**Canonical merged identity:** `EP-10 + MRP-11 + MQP-15 + MSP-14 → XFR-D-M4`; all four source keys remain `PRIMARY_MERGED_MEMBER`.

**Scope:** qualitative governance, semantic separation, fail-closed safeguards and evidence prerequisites for any future bounded replay tolerance applicable to a probabilistic Matching component. This record does not approve any tolerance, range, unit, comparator, error metric, reason-code invariant, dataset, statistic, Policy, production-data use, schema, carrier, API, database, event, runtime, monitoring, rollback or implementation.

**Governance owner:** `DEVELOPMENT + AI` — human-approved candidate-derived assignment repeated by the Evaluation, Risk, Qualification and Scoring Proposal open-decision rows; explicitly not `SOURCE_NORMATIVE` because Architecture does not directly assign an owner for this exact merged decision.

**Evaluation Plan artifact owner:** `AI + DEVELOPMENT` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Risk Policy artifact owner:** `Chief AI Architect + LEGAL` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Qualification Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `DEVELOPMENT + AI`; prepares candidate contracts and replay evidence but has no unilateral authority over tolerance, invariant sufficiency, Policy, production, runtime, implementation or a governance gate.

**Depends on and preserves:** `XFR-D-020`, `XFR-D-023`, `XFR-D-026`, `XFR-D-027`, `XFR-D-057`–`XFR-D-071`, and all independent Evaluation, Risk, Qualification and Scoring boundaries retain their identity, scope, status and authority. None is absorbed, reopened, superseded or approved by this record.

---

## 1. Вопрос

Какая qualitative governance and evidence-prerequisite boundary должна действовать до будущего утверждения bounded replay tolerance для вероятностного компонента, пока every numeric, invariant, data, statistical and operational content остаётся `OPEN`?

---

## 2. Source/status discipline

1. Inventory crosswalk фиксирует `EP-10`, `MRP-11`, `MQP-15` и `MSP-14` как `PRIMARY_MERGED_MEMBER` одного `XFR-D-M4`. Crosswalk индексирует вопрос, но сам не создаёт substantive approval.
2. Architecture §49 требует для deterministic scoring exact replay с одинаковыми input hashes, component scores, ranking, reasons и final package hash; несовпадение exact replay является severity-1 defect и блокирует соответствующую версию правил.
3. Architecture §49 допускает для внешнего вероятностного компонента только recorded replay по сохранённому неперсональному response artifact либо bounded replay с заранее утверждёнными tolerance и reason-code invariants.
4. Architecture §49 не задаёт numeric tolerance, error metric, unit, comparator, invariant catalog, data procedure or owner for `XFR-D-M4`.
5. Architecture §49 запрещает недетерминированному компоненту самостоятельно проходить Matching Qualification Gate: он остаётся advisory signal до human-confirmed deterministic rule.
6. Любой replay создаёт новый audit event и не изменяет исторический Match Result.
7. Architecture §§33 and 49 bind replay to actual inputs, code/model artifacts, dependencies, Policy and schema versions/hashes. Reproducibility is not semantic correctness, calibration, fairness or production readiness.
8. Architecture §30.3 requires frozen sample, label-quality, offline evaluation, proxy/discrimination and calibration checks, human review, controlled release, monitoring and rollback. These steps are prerequisites, not self-approval.
9. Architecture §52 separately assigns owners to Evaluation, Risk, Qualification and Scoring controlled artifacts. These artifact owners do not merge into one owner and do not replace decision-specific approval.
10. Proposal text, candidate owner, replay execution, evidence package, code, commit, merge, CI result or deployment does not approve a tolerance, invariant, Policy, production use, runtime or gate.

---

## 3. Решение

### 3.1. Decision-specific authority split

1. Governance owner is `DEVELOPMENT + AI`, human-approved and candidate-derived; this assignment is not `SOURCE_NORMATIVE`.
2. Evaluation Plan, Risk Policy, Qualification Policy and Scoring Policy artifact owners remain separate as stated above.
3. Mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`.
4. Evidence/technical-procedure owner is `DEVELOPMENT + AI`, without unilateral authority over any tolerance, invariant, evidence sufficiency, Policy, production, runtime or implementation decision.
5. Any future exact approval or modification requires `DEVELOPMENT + AI + Chief AI Architect + PRODUCT + LEGAL` approval on the same exact identified candidate version/hash and immutable evidence package.
6. No governance owner, artifact owner, approver, reviewer, technical executor or evidence preparer may self-approve or activate bounded replay behavior.

### 3.2. Deterministic exact replay is inviolable

1. Deterministic scoring remains subject to exact replay under Architecture §49.
2. No epsilon, tolerance, rounding allowance, approximate comparison, majority match, per-component masking or aggregate compensation may be applied to a deterministic mismatch.
3. A deterministic exact-replay mismatch remains a severity-1 defect and blocks the affected rule version.
4. This record does not narrow, waive or reinterpret that Architecture rule.

### 3.3. Recorded and bounded probabilistic replay remain distinct

1. **Recorded replay** uses the exact saved non-personal response artifact and its immutable provenance.
2. **Bounded replay** is a future candidate comparison for an explicitly identified probabilistic component under a separately approved tolerance and reason-code invariant set.
3. Recorded replay success does not select a bounded tolerance.
4. Bounded replay does not legalize tolerance for deterministic paths.
5. Switching, fallback or precedence between recorded and bounded modes remains `OPEN` unless separately approved.

### 3.4. Advisory-only probabilistic boundary

1. A probabilistic or nondeterministic component cannot by itself pass the Matching Qualification Gate.
2. It remains advisory until a human-confirmed deterministic rule exists under applicable controlled Policies.
3. Replay closeness, apparent stability or a favorable aggregate result cannot become Eligibility, Risk, Qualification, ranking, routing or presentation authority.
4. This record creates no exception, threshold, route or runtime status.

### 3.5. Closed, explicit, immutable future candidate discipline

Any future bounded replay candidate must be:

1. one closed specification identifying every affected probabilistic component and governed use;
2. explicit about tolerance form, comparison direction, unit, scope, edge cases and reason-code invariants without relying on platform/library defaults;
3. immutable, versioned and hash-bound to the exact inputs, code/model artifact, build, dependencies, configuration, hardware/runtime metadata where material, Feature Schema and Policy versions actually used;
4. explicit about recorded-artifact provenance and compatibility when recorded replay is part of the comparison;
5. auditable and reproducible on frozen inputs while keeping numeric representation separately governed;
6. accompanied by complete per-component and aggregate mismatch reporting without masking;
7. reviewed for uncertainty, fairness/proxy, legal applicability, segment/intersection coverage and production limitations;
8. presented to the complete owner/approver set on one identical candidate/evidence package.

These requirements do not select or approve any candidate, number, range, unit, metric, invariant or carrier.

### 3.6. Affected-use fail-closed boundary

If required replay input, recorded artifact, provenance, version/hash, configuration, tolerance candidate, invariant, evidence or compatibility is missing, unknown, stale, expired, revoked, conflicting, incomplete, contaminated, unauthorized or incompatible:

1. no zero, epsilon, nearest, average, default, prior, majority, heuristic or AI-inferred tolerance is introduced;
2. no mismatch is silently rounded, ignored, reserialized, relabeled or converted into a pass;
3. the condition does not create a negative business fact, Hard Constraint result, `INELIGIBLE`, Risk/Qualification route, reason or presentation permission;
4. only a separately approved compatible rule may be used; otherwise the affected replay/evidence/approval progression is blocked;
5. unrelated processing is not blocked unless an independently applicable approved rule requires it;
6. exact fallback, cascade, retry, recovery, observability and runtime behavior remain `OPEN`.

### 3.7. Non-compensation and no masking

1. Aggregate replay closeness cannot compensate for an out-of-bound or unevaluable applicable component.
2. Passing components, slices, metrics or runs cannot mask missing, adverse, incompatible or insufficient evidence elsewhere.
3. A favorable business outcome cannot establish replay correctness or justify a tolerance.
4. Reason-code invariants cannot be waived because numeric output is close, and numeric bounds cannot compensate for a violated invariant.
5. Exact replay, bounded replay, semantic correctness, calibration, fairness, lawful applicability and production readiness require separate evidence and cannot substitute for one another.
6. This boundary introduces no numeric aggregation, weighting or tolerance rule.

### 3.8. Minimum evidence categories before any future exact approval

No exact bounded replay tolerance may be approved without an immutable evidence package containing at least:

1. exact candidate scope, component identity, specification, versions and hashes;
2. eligible source/label/adjudication/correction lineage under applicable `XFR-D-057`–`XFR-D-060` boundaries;
3. frozen component-atomic allocation with no reroll, leakage or cherry-picking;
4. baseline measured before candidate search, with search history and rejected candidates retained;
5. strict tuning/final isolation and an untouched final set;
6. preregistered comparison directions, metric/error candidates, invariants, uncertainty methods, slices and stop/fail rules without approving them here;
7. compatible like-for-like comparison with material inputs and versions frozen or fully disclosed;
8. separate reporting for each component, reason invariant, segment/intersection and favorable/adverse/null/incompatible/unevaluable/insufficient result;
9. false-acceptance and false-rejection counter-evidence without cross-family substitution;
10. explicit deterministic-exact versus probabilistic-bounded separation;
11. segment/fairness/proxy/legal review under applicable `XFR-D-064`/`XFR-D-068` boundaries;
12. metric aggregation and statistical comparison discipline under applicable `XFR-D-063`/`XFR-D-066`/`XFR-D-070` boundaries;
13. drift and post-freeze correction/impact limitations under applicable `XFR-D-065`/`XFR-D-071` boundaries;
14. exact recorded-artifact provenance, retention and compatibility limitations where recorded replay is used;
15. explicit synthetic-only versus production-data applicability statement under `XFR-D-026`;
16. complete limitations, unsupported scopes and unresolved dependencies;
17. verification and approval by the complete decision-owner/approver set on the same immutable candidate and evidence package.

These are evidence categories only. They do not approve a dataset, split, seed, metric, tolerance, invariant, statistic, result, sufficiency verdict, Policy or production use.

### 3.9. Historical integrity and no automatic action

1. Every replay result remains bound to the actual input, artifact, code, configuration and Policy versions/hashes used.
2. Replay always creates a new audit event and never mutates, replaces, relabels or reinterprets the historical Match Result.
3. A later tolerance or invariant candidate cannot retroactively convert a historical failure into a pass.
4. Successful replay proves only the claimed reproducibility within its approved scope; it does not prove semantic correctness, calibration, fairness, lawful applicability or production readiness.
5. Synthetic-only evidence cannot establish production applicability or readiness.
6. No replay result, statistical signal, technical success or candidate recommendation may automatically change a Policy, model, score, rank, route, release, runtime, rollback action or gate.

### 3.10. Independent decisions remain independent

1. `XFR-D-020` governs numeric representation and deterministic-replay safeguards; it supplies no bounded tolerance and permits no deterministic epsilon.
2. `XFR-D-023` governs prospective Scoring supersession; versioning does not select replay tolerance.
3. `XFR-D-026` preserves synthetic/production evidentiary separation without approving production applicability.
4. `XFR-D-027` preserves evidence-procedure roles without making the evidence team a substantive approver.
5. `XFR-D-057`–`XFR-D-071` retain independent label, adjudication, grouping, correction, dataset, metric, segment, drift, aggregation, fairness, statistical and post-freeze boundaries.
6. Evaluation, Risk, Qualification and Scoring Policies retain separate approval, artifact and runtime authority.
7. Risk and Qualification thresholds, routes and outcomes cannot be inferred from replay tolerance.

### 3.11. Partial, never fully resolved

`XFR-D-M4` is `PARTIALLY_RESOLVED_BOUNDARY`: only authority separation, deterministic-exact protection, recorded-versus-bounded separation, advisory-only semantics, closed candidate discipline, affected-use fail-closed handling, non-compensation, qualitative evidence prerequisites, historical integrity and no-automatic-action safeguards are approved.

Every tolerance value/range/unit, metric, direction, comparator, invariant catalog, component/scope applicability, aggregation, weighting, dataset, statistic, Policy, production, carrier, runtime and implementation content remains `OPEN`. This record cannot be cited as complete resolution of `EP-10`, `MRP-11`, `MQP-15`, `MSP-14` or any Proposal approval.

---

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
| --- | --- | --- | --- |
| XFR-D-M4 governance | `DEVELOPMENT + AI`, human-approved candidate-derived, not source-normative | Qualitative replay governance/evidence boundary | Every exact substantive content and verdict |
| Deterministic replay | Architecture §49 | Exact-only, severity-1 mismatch rule preserved | Implementable representation details under independent governance |
| Recorded replay | Architecture §49 | Distinct from bounded replay | Artifact schema, provenance, retention, compatibility and mode selection |
| Bounded replay | Architecture §49 | Candidate discipline and safeguards only | Tolerance, metric, unit, invariant catalog and applicability |
| Evaluation artifact | `AI + DEVELOPMENT`, Architecture §52 | No artifact approval | Exact procedure/data/run/result/sufficiency |
| Risk artifact | `Chief AI Architect + LEGAL`, Architecture §52 | No artifact approval | Exact Risk use/threshold/route/runtime behavior |
| Qualification artifact | `Chief AI Architect + PRODUCT`, Architecture §52 | No artifact approval | Exact Gate use/threshold/route/runtime behavior |
| Scoring artifact | `Chief AI Architect + PRODUCT`, Architecture §52 | No artifact approval | Exact Scoring use/version/runtime behavior |
| Production/runtime | Separate approvals and gates | Nothing | Data authority, schema, API, DB, events, monitoring, rollback and implementation |

---

## 5. Обязательные non-conflations

1. Deterministic exact replay ≠ bounded probabilistic replay.
2. Recorded replay ≠ bounded replay.
3. Numeric closeness ≠ reason-code invariant preservation.
4. Replay reproducibility ≠ semantic correctness or calibration.
5. Successful replay ≠ fairness, lawful applicability or production readiness.
6. Advisory probabilistic output ≠ Qualification Gate authority.
7. Bounded tolerance ≠ rounding/serialization/representation approval.
8. Replay event ≠ mutation of historical Match Result.
9. Evidence/technical owner ≠ unilateral substantive approver.
10. Governance owner ≠ Evaluation, Risk, Qualification or Scoring artifact owner.
11. Proposal, evidence package, code, commit, merge, CI or deployment ≠ Policy/runtime/gate approval.

---

## 6. Что остаётся `OPEN`

- every tolerance value, range, unit, direction, comparator and inclusivity rule;
- absolute, relative, distributional, per-component, per-output and aggregate error metrics;
- every reason-code invariant, catalog, namespace, value, order and compatibility rule;
- component eligibility, advisory scope and recorded-versus-bounded selection/fallback;
- aggregation, weighting, masking prevention algorithm and multi-component treatment;
- recorded artifact schema, provenance, retention, access, compatibility and lawful handling;
- dataset, source, sample, allocation, split, seed, labels, adjudication, corrections and frozen manifest;
- metric, target, objective, uncertainty method, interval, window, hypothesis, test, statistic, result and verdict;
- representation, precision, rounding, serialization and numeric edge behavior;
- production-data authority, lawful applicability and readiness;
- Evaluation Plan, Risk Policy, Qualification Policy, Scoring Policy and Controlled Artifact Manifest approval;
- schema, carrier, API, DB, events, storage, runtime state, monitoring, rollback, migration and implementation;
- Risk and Qualification thresholds, routes and outcomes;
- every governance gate transition.

---

## 7. Rationale

Architecture §49 creates a strict split: deterministic scoring requires exact replay, while a probabilistic component may use only recorded replay or a separately approved bounded replay and remains advisory. The source intentionally supplies no tolerance, invariant catalog or operational contract. A narrow qualitative boundary prevents implementation defaults, rounding or aggregate closeness from silently becoming authority while preserving a controlled evidence-backed path for a future bounded candidate.

The merged identity is appropriate because the same replay-tolerance question appears in Evaluation, Risk, Qualification and Scoring. It does not merge their artifact ownership, approve any Proposal or transfer threshold/routing authority.

---

## 8. Adversarial cases

1. **Small epsilon is applied to deterministic replay.** Rejected: deterministic mismatch is exact and severity-1.
2. **Recorded response replay is called a selected tolerance.** Rejected: recorded and bounded modes are distinct.
3. **Average error passes while one governed component fails.** Rejected by separate reporting and non-compensation.
4. **Reasons differ but numeric score is close.** Rejected: reason-code invariants and numeric bounds are independent.
5. **A probabilistic component passes Qualification alone.** Rejected by Architecture §49 advisory-only rule.
6. **Library default tolerance is adopted.** Rejected: every exact value and comparison remains `OPEN`.
7. **Rounding hides mismatch.** Rejected: representation is independent and cannot waive replay failure.
8. **Missing provenance is treated as pass.** Rejected by affected-use fail closed.
9. **Successful synthetic replay becomes production approval.** Rejected by synthetic/production separation.
10. **A new replay overwrites historical Match Result.** Rejected: replay creates a new audit event only.
11. **Evidence team self-approves.** Rejected: `DEVELOPMENT + AI` has no unilateral authority.
12. **CI success activates runtime tolerance.** Rejected: no automatic Policy/model/runtime/gate action.

---

## 9. Затронутые артефакты — future separate sync only

After independent audit, this status overlay may be synchronized only through separately scoped controlled changes in the applicable governance documents, including:

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md`;
- `LeaseMind_MATCHING_RISK_POLICY_v0.1.md`;
- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md`;
- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`.

Each sync scope requires its own preflight and audit. This record does not modify or approve any Proposal, dataset, run, production-data use, manifest or implementation artifact.

---

## 10. Change control

Any modification or reclassification of this approved qualitative boundary requires a new versioned decision record and explicit approval by `DEVELOPMENT + AI + Chief AI Architect + PRODUCT + LEGAL` on the exact same identified version/hash and immutable evidence package. `DEVELOPMENT + AI` may prepare evidence and technical material but cannot self-approve tolerance, invariants, evidence sufficiency, Policy, production, runtime or implementation.

---

## 11. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

---

## 12. Acceptance criteria

1. **Given** `EP-10`, `MRP-11`, `MQP-15` and `MSP-14`, **when** canonical identity is checked, **then** all remain `PRIMARY_MERGED_MEMBER` of `XFR-D-M4`.
2. **Given** this record, **when** resolution is checked, **then** it is always `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved.
3. **Given** authority, **when** roles are checked, **then** governance owner `DEVELOPMENT + AI` is candidate-derived and not source-normative; four artifact owners remain separate; mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`; evidence owner has no unilateral authority.
4. **Given** deterministic scoring, **when** replay differs, **then** no tolerance applies; mismatch remains severity-1 and blocks the affected rule version.
5. **Given** recorded and bounded replay, **when** semantics are checked, **then** they remain distinct and neither authorizes the other.
6. **Given** a probabilistic component, **when** Qualification authority is claimed, **then** it remains advisory and cannot pass the Gate alone.
7. **Given** a future candidate, **when** review occurs, **then** it is closed, immutable, version/hash-bound and supported by frozen preregistered evidence without approving exact content here.
8. **Given** missing/stale/conflicting/incompatible replay material, **when** affected use is attempted, **then** no default/pass/negative business fact/route is invented and affected progression fails closed.
9. **Given** aggregate closeness, **when** a component or invariant is adverse or unevaluable, **then** compensation or masking is prohibited.
10. **Given** replay, **when** historical state is checked, **then** a new audit event is created and the historical Match Result is unchanged.
11. **Given** exact replay or bounded replay success, **when** correctness/calibration/fairness/production readiness is claimed, **then** replay alone is insufficient.
12. **Given** any exact tolerance/range/unit/metric/invariant/data/statistical/policy/production/carrier/runtime/implementation item, **when** this record is applied, **then** it remains `OPEN`.
13. **Given** an evaluation result, technical success or CI result, **when** Policy/model/runtime/gate state is checked, **then** no automatic change occurs.
14. **Given** governed artifacts and gates, **when** this record is applied, **then** no Proposal, dataset, run/result, production-data use, manifest, runtime or implementation is approved and all three gates remain `BLOCKED`.

---

## 13. Итог

`XFR-D-M4` approves only the qualitative governance and evidence-prerequisite boundary for the merged `EP-10`/`MRP-11`/`MQP-15`/`MSP-14` bounded replay question. It preserves deterministic exact replay, keeps recorded and bounded probabilistic replay distinct, confines probabilistic output to advisory use, prevents hidden defaults, masking, compensation, historical mutation and automatic action, and requires one immutable evidence-backed candidate. Every numeric tolerance, error metric, invariant catalog, dataset, statistic, Policy, production, schema, carrier, runtime and implementation content remains `OPEN`; all three governance gates remain `BLOCKED`.
