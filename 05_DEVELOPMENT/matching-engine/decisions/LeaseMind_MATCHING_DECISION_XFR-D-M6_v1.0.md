# LeaseMind Matching Decision Record — XFR-D-M6

**Decision ID:** `XFR-D-M6`

**Название:** Feature Fit ↔ Evidence Confidence joint-calibration qualitative governance and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-09-07

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — ALL EXACT MAPPINGS, FUNCTIONS, ORDERS, VALUES, RANGES, CALIBRATION, DATA, STATISTICS, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION CONTENTS REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-07

**Repository baseline:** `d7d1d9dabfc74d4ee91f731925bdf12bf86a5511`

**Canonical merged identity:** `FS-12 + MSP-12 → XFR-D-M6`; both `FS-12` and `MSP-12` remain `PRIMARY_MERGED_MEMBER`. `FS-12` covers Feature Fit / Evidence Confidence calibration; `MSP-12` covers Feature Fit calibration beyond the Proposal-level `[0,1]` interface.

**Scope:** qualitative governance, semantic separation, fail-closed safeguards and evidence prerequisites for a future joint Feature Fit ↔ feature/value-level Evidence Confidence calibration. This record does not approve any mapping, function, ordering, hierarchy, value, range, direction, monotonicity, default, fallback, dataset, metric, statistic, result, Policy, production-data use, schema, carrier, API, database, event, runtime, monitoring, rollback or implementation.

**Governance owner:** `Chief AI Architect + AI` — human-approved candidate-derived assignment repeated by the Feature Schema and Scoring Policy open-decision rows and the Inventory crosswalk; explicitly not `SOURCE_NORMATIVE` because Architecture does not directly assign an owner for this exact merged decision.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Feature Schema artifact owner:** `PRODUCT + LEGAL + AI` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Evaluation Plan/evidence artifact owner:** `AI + DEVELOPMENT` — source-owned artifact/evidence boundary under Architecture §52; evidence ownership does not replace substantive governance approval.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; prepares evidence and technical procedure but has no unilateral authority over calibration, evidence sufficiency, policy, production, runtime, implementation or a governance gate.

**Depends on and preserves:** `XFR-D-019`, `XFR-D-020`, `XFR-D-022`, `XFR-D-025`, `XFR-D-026`, `XFR-D-027`, `XFR-D-057`–`XFR-D-071`, and the independent Feature, Scoring, Evaluation, Risk and Qualification boundaries retain their identity, scope, status and authority. None is absorbed, reopened, superseded or approved by this record.

---

## 1. Вопрос

Какая qualitative governance and evidence-prerequisite boundary должна действовать до будущего утверждения exact joint calibration между Feature Fit и feature/value-level Evidence Confidence, пока every mapping, function, numeric and operational content остаётся `OPEN`?

---

## 2. Source/status discipline

1. Inventory crosswalk фиксирует `FS-12 → XFR-D-M6` и `MSP-12 → XFR-D-M6`, оба `PRIMARY_MERGED_MEMBER`. Inventory индексирует merged decision, но не создаёт substantive approval.
2. Architecture §15.4 source-normatively включает `Feature Fit × Feature Weight × Evidence Confidence` в Dimension Score. Источник не задаёт exact Feature Fit function, Evidence Confidence mapping, value, range, ordering, normalization or calibration.
3. Architecture §15.4 отдельно требует исключать absent value из numerator/denominator и учитывать его в overall Confidence Score; confirmed Hard Constraint violation обрабатывается до scoring. Joint calibration не может заменить эти нормы.
4. Architecture §13 source-normatively задаёт ровно семь значений `evidence_status`: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`. Их порядок перечисления не задаёт numeric order, hierarchy or calibration.
5. Architecture §16 определяет overall Confidence Score как reliability of the wider assessment, separately from attractiveness. Он не тождествен feature/value-level Evidence Confidence.
6. Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, proxy/discrimination and calibration checks, Chief AI Architect review, affected PRODUCT/LEGAL rule agreement, controlled release, monitoring and rollback. Эти шаги не являются self-approval.
7. Architecture §§34 and 37 do not provide a Feature Fit/Evidence Confidence mapping, value, range, calibration function or exact owner for this merged decision.
8. Architecture §52 separately assigns owners to the controlled Feature Schema, Scoring Policy and Evaluation Plan/evidence artifacts. These artifact owners are not a substitute for decision-specific governance approval.
9. Feature Schema and Scoring Policy both list `Chief AI Architect + AI` only as a candidate owner for the exact calibration question and explicitly say the source does not assign that owner directly.
10. Feature Schema’s `[0,1]` Feature Fit interface and its `confidence` carrier are Proposal-level candidates, not Architecture-approved numeric range, mapping or runtime contract.
11. `XFR-D-019` preserves the Architecture §13 seven-value enum and approves only qualitative governance for a future `evidence_status → Evidence Confidence` mapping. It explicitly leaves `XFR-D-M6` independently `OPEN`.
12. Proposal text, Inventory entry, candidate owner, enum order, schema/type validation, AI/model confidence, evidence package, reproducibility, commit, merge, CI result or deployment do not equal calibration, policy, production, runtime, implementation or gate approval.

---

## 3. Решение

### 3.1. Decision-specific authority split

1. Governance owner is `Chief AI Architect + AI`, human-approved and candidate-derived; this assignment is explicitly not `SOURCE_NORMATIVE`.
2. Scoring Policy artifact owner remains separately `Chief AI Architect + PRODUCT`.
3. Feature Schema artifact owner remains separately `PRODUCT + LEGAL + AI`.
4. Evaluation Plan/evidence artifact owner remains separately `AI + DEVELOPMENT`.
5. Mandatory approvers are `PRODUCT + LEGAL + DEVELOPMENT`.
6. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority over mapping, function, value, evidence sufficiency, policy, production, release, runtime or implementation.
7. Any future modification, reclassification or exact approval requires `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT` approval on the same exact identified version/hash and immutable evidence package.
8. No governance owner, artifact owner, approver, reviewer, technical executor or evidence-preparation role may self-approve calibration or activate runtime behavior.

### 3.2. Exact semantic separation

The following layers remain separate and attributable:

1. **Feature Fit** — correspondence of one value to one criterion.
2. **Feature Weight** — independent numeric influence of a feature in Scoring; not calibrated by this record.
3. **`evidence_status`** — categorical evidence state using the exact Architecture §13 enum.
4. **Feature/value-level Evidence Confidence** — reliability multiplier for the particular value used by Architecture §15.4.
5. **`required_evidence_level`** — separate evidence-sufficiency/applicability condition; not a Confidence number.
6. **Overall Confidence Score** — reliability of the broader profile, reciprocal assessment, conclusion or Match Package under Architecture §16.
7. **Hard Constraint and Eligibility result** — independently governed pre-scoring layers.
8. **Risk Score/category** — independently governed risk layer.
9. **Qualification threshold/result/route** — independently governed downstream layer.

No shared wording, token, numeric representation, ordering, carrier or implementation convenience creates equality, alias, mapping or authority transfer among these layers.

### 3.3. Exact seven-value evidence-status preservation

`XFR-D-019` remains authoritative for preserving exactly:

1. `UNVERIFIED`;
2. `SOURCE_CONFIRMED`;
3. `CONTENT_VERIFIED`;
4. `CONFLICTING`;
5. `STALE`;
6. `REJECTED`;
7. `HUMAN_REVIEW_REQUIRED`.

This enum:

- is categorical and does not create numeric order, hierarchy, rank, monotonic direction or default;
- does not imply that a later-listed value is stronger, weaker, higher or lower;
- does not itself determine Feature Fit or Evidence Confidence;
- cannot be promoted by parser/schema validation, technical success, AI inference, source reputation, aggregate performance or model confidence;
- is not expanded by this record with missing, unknown, expired, revoked, validated or any runtime-specific status.

`XFR-D-019` does not resolve `XFR-D-M6`: a status-to-Confidence boundary is not the joint calibration of Feature Fit and Evidence Confidence.

### 3.4. Closed, explicit, immutable future candidate discipline

Any future joint calibration candidate must be:

1. one closed and explicit specification for every affected Feature Fit function, Evidence Confidence mapping, feature/source/use scope, applicability condition and exception;
2. immutable, versioned and hash-bound to the exact Feature Schema, Scoring Policy, Evaluation Plan, source-policy and data/manifest bundle actually used;
3. explicit about the treatment of missing, unknown, unmapped, ambiguous, conflicting, stale, rejected, review-required, expired, revoked and incompatible states without hidden defaults;
4. auditable to input facts, source, evidence status, provenance, lawful authority and applicable policy version;
5. reproducible on the same frozen inputs and versions/hashes while keeping arithmetic representation separately governed;
6. accompanied by explicit double-counting analysis across Feature Fit, Evidence Confidence, overall Confidence Score, Risk and Qualification;
7. reviewed on uncertainty, fairness/proxy, legal applicability, segment coverage and replay limitations;
8. presented to the complete owner/approver set on one identical candidate/evidence package.

These requirements do not select or approve any candidate, `[0,1]` range, mapping, function, value or carrier.

### 3.5. Affected-use fail-closed boundary

If required mapping, function, source, evidence, applicability, version/hash or compatibility is missing, unknown, unmapped, ambiguous, stale, revoked, conflicting, rejected, review-required, incomplete or unauthorized:

1. no zero, one, midpoint, equal, average, nearest, neutral, minimum, maximum, previous, heuristic or AI-inferred Feature Fit or Evidence Confidence is introduced;
2. missing/conflicting/stale/rejected/review-required evidence does not become zero or negative Feature Fit;
3. technical/schema validation or AI/model confidence does not promote `evidence_status` or Evidence Confidence;
4. the condition does not create a confirmed Hard Constraint violation, `INELIGIBLE`, rejection, Risk/Qualification result, route, reason or presentation permission;
5. only a separately approved compatible policy/fallback may be used; otherwise the affected calibration/scoring use is blocked;
6. unrelated processing is not blocked unless an independently applicable approved rule requires it;
7. exact fallback, cascade, recovery, retry, error, observability and runtime behavior remain `OPEN`.

Fail closed is an affected-use governance safeguard, not a numeric mapping, negative business fact or implementation specification.

### 3.6. Double-counting and non-compensation boundary

1. The same evidence limitation cannot be silently encoded in Feature Fit, Evidence Confidence, overall Confidence, Risk and Qualification without explicit, separately reviewed contribution analysis.
2. High Feature Fit cannot compensate for absent or ineligible evidence authority.
3. High Evidence Confidence cannot transform poor correspondence into high Feature Fit.
4. Aggregate performance cannot compensate for failure or insufficiency in an applicable feature, evidence-status/source slice, segment, intersection, fairness/proxy review, Hard Constraint, Confidence, Risk or Qualification safeguard.
5. A favorable metric cannot suppress an adverse, null, incompatible, unevaluable or insufficient result in another applicable family.
6. Absence of detected difference does not prove equivalence, correctness, fairness, calibration or production suitability.
7. This boundary introduces no numeric cap, tolerance, aggregation rule or double-counting formula.

### 3.7. Minimum evidence categories before any future exact approval

No exact joint calibration may be approved without an immutable evidence package containing at least:

1. exact candidate scope, specification, versions and hashes;
2. eligible source/label/adjudication/correction-history and lineage evidence under applicable `XFR-D-057`–`XFR-D-060` boundaries;
3. frozen component-atomic allocation, no reroll, no leakage and no cherry-picking;
4. baseline measured before candidate search, with search history and rejected candidates retained;
5. strict tuning/final isolation and an untouched final set;
6. preregistered metrics, comparison directions, objectives/loss proposals, uncertainty methods, slices and stop/fail rules without approving them here;
7. compatible like-for-like comparison with relevant data, preprocessing, feature, weight and policy inputs frozen or explicitly disclosed;
8. separate reporting for each feature, source, evidence status, applicability scope, segment/intersection and favorable/adverse/null/incompatible/unevaluable/insufficient result;
9. explicit false-exclusion and false-eligibility counter-evidence without cross-family substitution;
10. double-counting analysis for Feature Fit, Evidence Confidence, overall Confidence, Risk and Qualification;
11. segment coverage and fairness/proxy/legal review under applicable `XFR-D-064`/`XFR-D-068` boundaries;
12. metric aggregation and statistical comparison discipline under applicable `XFR-D-063`/`XFR-D-066`/`XFR-D-070` boundaries;
13. drift and post-freeze correction/impact limitations under applicable `XFR-D-065`/`XFR-D-071` boundaries;
14. exact replay evidence bound to actual inputs, code/tool/configuration and policy versions/hashes, separated from semantic correctness;
15. explicit synthetic-only versus production-data applicability statement under `XFR-D-026`;
16. complete limitations, unsupported scopes and unresolved dependencies;
17. verification and approval by the complete decision-owner/approver set on the same immutable candidate and evidence package.

These are evidence categories only. They do not approve a dataset, label, split, seed, metric, target, objective, loss, uncertainty method, statistic, result, sufficiency verdict, policy or production use.

### 3.8. Historical integrity, replay and no automatic action

1. Every calculation and result remains bound to the actual Feature Schema, Scoring Policy, evidence and implementation versions/hashes used at calculation time.
2. A later candidate cannot silently recalculate, relabel or overwrite a historical Feature Fit, Evidence Confidence, Dimension Score, Confidence, Risk or Qualification result.
3. Exact replay proves reproducibility for a frozen bundle only; it does not prove semantic correctness, calibration quality, fairness, lawful applicability, evidence sufficiency or production readiness.
4. Synthetic-only evidence cannot establish production calibration, production-data validity, production applicability or readiness.
5. No evaluation result, statistical signal, technical success, model confidence or candidate recommendation may automatically change a mapping, function, value, range, weight, Hard Constraint, policy, model, score, rank, route, release, runtime or gate.

### 3.9. Independent decision boundaries remain independent

1. `XFR-D-019` preserves exact evidence-status semantics and qualitative mapping governance but does not resolve joint calibration.
2. `XFR-D-020` preserves numeric-representation/replay governance; decimal/fixed/float, precision, rounding and serialization remain separately `OPEN`.
3. `XFR-D-022` preserves sensitivity/calibration evidence governance but does not select a function, range, value, metric or target.
4. `XFR-D-025` preserves criterion-class semantics and weighting governance; class assignment, participation and exact weighting remain separate.
5. `XFR-D-026` preserves the synthetic-only/production evidentiary boundary without approving production applicability.
6. `XFR-D-027` preserves evidence/technical-procedure roles without making the evidence team a substantive approver.
7. `XFR-D-057`–`XFR-D-071` retain their independent label, adjudication, grouping, correction, dataset, metric, segment, drift, aggregation, fairness, statistical and post-freeze boundaries and `OPEN` exact contents.
8. Feature Weight and all weight-policy contents remain separately governed, including `XFR-D-M5` and segment overrides.
9. Hard Constraint/Eligibility, Risk and Qualification thresholds, routes and outcomes remain separate and cannot be inferred from calibration.
10. Feature Schema, Scoring Policy, Evaluation Plan, Risk Policy, Qualification Policy, Data Contracts and Controlled Artifact Manifest retain separate approval and artifact authority.

### 3.10. Partial, never fully resolved

`XFR-D-M6` is `PARTIALLY_RESOLVED_BOUNDARY`: only role and artifact-owner separation, exact semantic distinctions, seven-value enum preservation, closed/versioned candidate discipline, affected-use fail-closed handling, explicit double-counting/non-compensation requirements, qualitative evidence prerequisites, historical version binding and no-automatic-action boundary are approved.

Every exact mapping, function, order, hierarchy, value, range, direction, monotonicity, default, fallback, normalization, denominator, missing arithmetic, dataset, metric, statistic, policy, production, carrier, runtime and implementation content remains `OPEN`. This record cannot be cited as complete resolution of `FS-12`, `MSP-12`, `XFR-D-019` or any Policy approval.

---

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
| --- | --- | --- | --- |
| XFR-D-M6 governance | `Chief AI Architect + AI`, human-approved candidate-derived, not source-normative | Qualitative governance/evidence boundary | Every exact substantive content and future verdict |
| Scoring Policy artifact | `Chief AI Architect + PRODUCT`, Architecture §52 | No artifact approval | Exact policy/version/hash and manifest approval |
| Feature Schema artifact | `PRODUCT + LEGAL + AI`, Architecture §52 | No artifact approval | Exact schema/range/carrier and manifest approval |
| Evaluation/evidence artifact | `AI + DEVELOPMENT`, Architecture §52 | Evidence preparation only | Exact procedure/data/run/result/sufficiency |
| Evidence status | Architecture §13 / `XFR-D-019` | Exact seven-value taxonomy preserved | Numeric order, mapping and calibration |
| Feature Fit | Architecture §15.4 component | Semantic separation only | Function, values, range and applicability |
| Evidence Confidence | Architecture §15.4 multiplier | Semantic separation only | Mapping, values, range and applicability |
| Overall Confidence | Architecture §16 | Non-conflation only | Formula, calibration and downstream thresholds |
| Risk/Qualification | Independent controlled policies | No authority transfer | Thresholds, routes, outcomes and runtime behavior |
| Production/runtime | Separate artifacts, approvals and gates | Nothing | Data authority, schema, API, DB, events, monitoring, rollback and implementation |

---

## 5. Обязательные non-conflations

1. Feature Fit ≠ Evidence Confidence ≠ Feature Weight.
2. Categorical `evidence_status` ≠ numeric Evidence Confidence, order or hierarchy.
3. `XFR-D-019` status-to-Confidence governance ≠ XFR-D-M6 joint calibration.
4. Feature/value-level Evidence Confidence ≠ overall Confidence Score.
5. `required_evidence_level` ≠ Evidence Confidence value or mapping.
6. Missing/unknown/conflicting/stale/rejected/review-required evidence ≠ zero or negative Feature Fit.
7. Technical/schema validation or AI/model confidence ≠ evidence promotion.
8. Joint calibration ≠ Hard Constraint, Eligibility, Risk or Qualification decision.
9. `[0,1]` Proposal interface ≠ approved numeric range or runtime contract.
10. Governance owner ≠ Scoring, Feature or Evaluation artifact owner.
11. Evidence owner `AI + DEVELOPMENT` ≠ unilateral calibration or policy approver.
12. Deterministic replay ≠ semantic correctness, calibration quality, fairness or readiness.
13. Synthetic-only evidence ≠ production calibration, production-data authority or readiness.
14. Proposal, crosswalk, candidate, evidence package, code, commit, merge, CI or deployment ≠ policy/runtime/gate approval.

---

## 6. Что остаётся `OPEN`

- every Feature Fit and Evidence Confidence mapping, table, function and joint functional form;
- every numeric order, hierarchy, value, range, direction, monotonicity, default and fallback;
- feature-specific, source-specific, status-specific, purpose-specific and use-specific calibration;
- `[0,1]` or any numeric range as an approved interface or contract;
- multiplication semantics beyond the source Dimension Score structure, normalization, numerator, denominator, missing arithmetic, zero-active-weight and exact double-counting treatment;
- Feature Weight and criterion-class/global/segment weight policy;
- `required_evidence_level`, evidence sufficiency and applicability rules;
- dataset, source, sample, allocation, split, seed, labels, adjudication, corrections and frozen manifest;
- metric, target, objective, loss, uncertainty, aggregation, tolerance, interval, window, hypothesis, test, statistic, result and verdict;
- precision, rounding, serialization, deterministic and bounded replay mechanics;
- production-data authority, lawful applicability, calibration and readiness;
- Scoring Policy, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy and Controlled Artifact Manifest approval;
- schema, carrier, API, DB, events, storage, reason code, runtime state, monitoring, rollback, migration and implementation;
- Qualification and Risk thresholds, routes and outcomes;
- every governance gate transition.

---

## 7. Rationale

Architecture requires Feature Fit and Evidence Confidence as separate inputs to Dimension Score but supplies neither their numeric definitions nor their joint calibration. The seven evidence statuses are categorical, and the overall Confidence Score is a different assessment layer. A narrow qualitative boundary prevents enum order, technical validation, missing evidence or implementation defaults from silently becoming scoring arithmetic while preserving a controlled path for future evidence-backed calibration.

The merged identity is appropriate because Feature Schema and Scoring Policy point to the same joint-calibration problem. It does not merge their artifact ownership, approve either Proposal or collapse `XFR-D-019` into XFR-D-M6.

---

## 8. Adversarial cases

1. **Enum order becomes numeric order.** Rejected: Architecture lists categories, not rank or calibration.
2. **`CONTENT_VERIFIED = 1`, `UNVERIFIED = 0`.** Rejected: every value and range remains `OPEN`.
3. **The `[0,1]` Feature Fit interface is called source-normative.** Rejected: it is Proposal-level candidate content.
4. **Schema validation promotes evidence.** Rejected: technical success cannot change status or Confidence.
5. **AI/model confidence promotes evidence.** Rejected: model output is not source/content verification.
6. **Missing/conflicting/stale evidence becomes zero Feature Fit.** Rejected by affected-use fail closed without negative coercion.
7. **Low Evidence Confidence creates `INELIGIBLE`.** Rejected: Eligibility and Qualification remain separate.
8. **`required_evidence_level` is reused as numeric Confidence.** Rejected: sufficiency and scoring reliability are different layers.
9. **One defect is silently penalized in Fit, Evidence Confidence, overall Confidence and Risk.** Rejected: explicit double-counting analysis is mandatory and exact treatment remains `OPEN`.
10. **`XFR-D-019` is cited as complete joint calibration.** Rejected: it preserves status semantics and mapping governance only.
11. **Aggregate accuracy hides a failed source/status/segment slice.** Rejected by separate reporting and non-compensation.
12. **Exact replay proves semantic correctness.** Rejected: reproducibility alone is not calibration or fairness proof.
13. **Synthetic-only calibration becomes production policy.** Rejected: production authority/applicability remain separate.
14. **Evidence team self-approves.** Rejected: `AI + DEVELOPMENT` has no unilateral approval authority.
15. **A successful run automatically changes policy/runtime.** Rejected: exact same-version/hash human approval and controlled release are required.

---

## 9. Затронутые артефакты — future separate sync only

After independent audit, this status overlay may be synchronized only through separately scoped controlled changes in the applicable governance documents, including:

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md`;
- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`.

Evaluation Plan or other artifacts may change only through a separately approved scope. This record does not modify or approve any Proposal, dataset, run, production-data use, manifest or implementation artifact.

---

## 10. Change control

Any modification or reclassification of this approved qualitative boundary requires a new versioned decision record and explicit approval by `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT` on the exact same identified version/hash and immutable evidence package. `AI + DEVELOPMENT` may prepare evidence and technical material but cannot self-approve calibration, evidence sufficiency, Policy, production, runtime or implementation.

---

## 11. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

---

## 12. Acceptance criteria

1. **Given** `FS-12` and `MSP-12`, **when** canonical identity is checked, **then** both remain `PRIMARY_MERGED_MEMBER` of `XFR-D-M6` and neither becomes a standalone decision.
2. **Given** this record, **when** resolution is checked, **then** it is always `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved.
3. **Given** authority, **when** roles are checked, **then** governance owner `Chief AI Architect + AI` is human-approved candidate-derived and not source-normative; Scoring, Feature and Evaluation artifact owners remain separate; mandatory approvers are `PRODUCT + LEGAL + DEVELOPMENT`; evidence owner `AI + DEVELOPMENT` has no unilateral authority.
4. **Given** Feature Fit, Evidence Confidence, Feature Weight, `evidence_status`, `required_evidence_level` and overall Confidence, **when** semantics are checked, **then** all remain separate and no alias or authority transfer is created.
5. **Given** Architecture §13, **when** statuses are checked, **then** exactly seven values are preserved without numeric order, hierarchy, mapping, promotion or new runtime status.
6. **Given** `XFR-D-019`, **when** XFR-D-M6 status is checked, **then** XFR-D-019 does not resolve or supply the joint calibration.
7. **Given** `[0,1]` or another range, **when** approval is requested, **then** it remains Proposal/candidate content and `OPEN`, not an approved contract.
8. **Given** technical validation, AI inference or model confidence, **when** evidence is assessed, **then** no evidence status or Confidence promotion occurs.
9. **Given** missing/unknown/unmapped/conflicting/stale/rejected/review-required/expired/revoked material, **when** affected use is attempted, **then** no default, zero, negative fit, Eligibility, Risk, Qualification, route, reason or display outcome is invented and the affected use fails closed.
10. **Given** a future candidate, **when** evidence sufficiency is reviewed, **then** closed version/hash binding, frozen allocation, baseline-first, preregistration, tuning/final isolation, compatible comparison, separate reporting, non-compensation, double-counting, uncertainty/fairness/legal/replay and synthetic-production discipline are required without approving exact content.
11. **Given** historical results, **when** a new calibration candidate exists, **then** prior results retain their actual original versions/hashes and are not silently recalculated or relabeled.
12. **Given** exact replay, **when** correctness/calibration/fairness/readiness is claimed, **then** replay alone is insufficient.
13. **Given** synthetic-only evidence, **when** production applicability is claimed, **then** the claim is rejected.
14. **Given** every exact mapping/function/order/hierarchy/value/range/calibration/data/statistical/policy/production/carrier/runtime/implementation item, **when** this record is applied, **then** each remains `OPEN`.
15. **Given** an evaluation result or technical success, **when** policy/model/runtime/gate status is checked, **then** no automatic change occurs.
16. **Given** governed artifacts and gates, **when** this record is applied, **then** no Policy, dataset, run/result, production-data use, manifest, runtime or implementation is approved and all three gates remain `BLOCKED`.

---

## 13. Итог

`XFR-D-M6` approves only the qualitative governance and evidence-prerequisite boundary for the merged `FS-12`/`MSP-12` joint-calibration question. It preserves separate Feature Fit, Evidence Confidence, Feature Weight, categorical evidence status, required evidence level, overall Confidence, Risk and Qualification semantics; prevents hidden defaults, enum-order inference, evidence promotion, negative-fit coercion, double counting and automatic action; and requires one immutable evidence-backed candidate. Every exact mapping, function, order, hierarchy, value, range, calibration, dataset, statistic, Policy, production, schema, carrier, runtime and implementation content remains `OPEN`; all three governance gates remain `BLOCKED`.
