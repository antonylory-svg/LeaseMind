# LeaseMind Matching Decision Record — XFR-D-M1

**Decision ID:** `XFR-D-M1`

**Название:** Per-feature required evidence level governance/evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-09-08

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE BOUNDARY — ALL EXACT LEVELS, ASSIGNMENTS, MAPPINGS, DATA, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION CONTENTS REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-08

**Repository baseline:** `89e83dce57b39768f7b793460c8b52da2f128557`

**Canonical merged identity:** `FS-01 + MQP-08 → XFR-D-M1`; both `FS-01` and `MQP-08` remain `PRIMARY_MERGED_MEMBER`.

**Scope:** qualitative governance, authority separation, semantic separation, affected-use fail-closed safeguards and evidence prerequisites for a future per-feature/source/use/purpose `required_evidence_level` rule. This record does not approve any exact required level, assignment, sufficiency mapping, hierarchy, default, fallback, dataset, label, metric, result, Policy, production-data use, schema, carrier, API, database, event, runtime, monitoring, rollback or implementation.

**Governance owner:** `PRODUCT + AI + Chief AI Architect` — human-approved candidate-derived assignment based on the merged Feature Schema and Qualification Policy decision context; explicitly not `SOURCE_NORMATIVE`.

**Feature Schema artifact owner:** `PRODUCT + LEGAL + AI` — source-owned artifact boundary under Architecture §52; artifact ownership does not replace substantive governance approval.

**Qualification Policy artifact owner:** `Chief AI Architect + PRODUCT` — human-approved artifact boundary under `XFR-D-030 v1.0`; artifact ownership does not replace substantive governance approval.

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; prepares evidence and technical procedure but has no unilateral authority over evidence sufficiency, level assignment, Policy, production, runtime, implementation or a governance gate.

**Depends on and preserves:** `XFR-D-019`, `XFR-D-M6`, `XFR-D-010`, `XFR-D-055`, exact Qualification route/threshold decisions, `XFR-D-057`, `XFR-D-058`, `XFR-D-062`, `XFR-D-063`, `XFR-D-066`, `XFR-D-070` and `XFR-D-071`. None is absorbed, reopened, superseded or approved by this record.

---

## 1. Вопрос

Какая qualitative governance and evidence boundary должна действовать до будущего утверждения exact per-feature/source/use/purpose `required_evidence_level`, пока every level, assignment, sufficiency mapping and operational consequence остаётся `OPEN`?

---

## 2. Source/status discipline

1. Inventory crosswalk фиксирует `FS-01 → XFR-D-M1` и `MQP-08 → XFR-D-M1`, оба `PRIMARY_MERGED_MEMBER`. Inventory индексирует merged decision, но не создаёт substantive approval.
2. Architecture §13 source-normatively задаёт ровно семь значений `evidence_status`: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`. Порядок перечисления не задаёт hierarchy, rank, numeric order or sufficiency mapping.
3. Architecture §§11–14.3 separates evidence/value semantics, criterion classes and Eligibility from downstream scoring and Qualification. A `required_evidence_level` rule cannot silently rewrite these layers.
4. Architecture §18.1 keeps Qualification inputs, results and routes independently governed. Evidence sufficiency alone does not select a Qualification result or route.
5. Architecture §30.3 requires controlled evidence, review, release, monitoring and rollback discipline. These steps are not self-approval and do not supply exact M1 contents.
6. Architecture §§32–34.1 preserve fail-safe behavior and independently governed outcome/error semantics; they do not authorize an evidence default, negative business fact or automatic ineligibility.
7. Architecture §§36, 40, 49 and 52 keep governance gates, writer authority, replay and controlled-artifact ownership separate from this decision.
8. Feature Schema §§4.1–4.3 leaves `required_evidence_level` unresolved for all 20 candidates and states that `input_validated` is not sufficient evidence confirmation.
9. Qualification Policy keeps `automatic_ineligible_allowed = NO` for this unresolved boundary and does not supply an exact required level, mapping or consequence.
10. `XFR-D-019` preserves the Architecture §13 enum and a qualitative future `evidence_status → Evidence Confidence` boundary; it does not resolve per-feature required evidence.
11. `XFR-D-M6` preserves the joint Feature Fit ↔ Evidence Confidence calibration boundary; it does not resolve `XFR-D-M1`.
12. Proposal text, candidate owner, schema/parser success, `input_validated`, AI inference, model confidence, evidence package, code, commit, merge, CI result or deployment does not equal level, Policy, production, runtime, implementation or gate approval.

---

## 3. Решение

### 3.1. Decision-specific authority split

1. Governance owner is `PRODUCT + AI + Chief AI Architect`, human-approved and candidate-derived; this assignment is explicitly not `SOURCE_NORMATIVE`.
2. Feature Schema artifact owner remains separately `PRODUCT + LEGAL + AI`.
3. Qualification Policy artifact owner remains separately `Chief AI Architect + PRODUCT`.
4. Mandatory approvers are `LEGAL + DEVELOPMENT`.
5. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority over required levels, mappings, evidence sufficiency, Policy, production, runtime or implementation.
6. Any future modification, reclassification or exact approval requires `PRODUCT + AI + Chief AI Architect + LEGAL + DEVELOPMENT` approval on the same exact identified version/hash and immutable evidence package.
7. No governance owner, artifact owner, approver, reviewer, technical executor or evidence preparer may self-approve or activate a required-evidence rule.

### 3.2. Exact seven-value evidence-status preservation

The exact Architecture §13 categorical enum remains:

1. `UNVERIFIED`;
2. `SOURCE_CONFIRMED`;
3. `CONTENT_VERIFIED`;
4. `CONFLICTING`;
5. `STALE`;
6. `REJECTED`;
7. `HUMAN_REVIEW_REQUIRED`.

This enum:

- has no hidden numeric order, hierarchy, rank, promotion path or default;
- is not expanded with `input_validated`, missing, unknown, expired, revoked or runtime-specific values;
- cannot be promoted by schema/parser/technical success, AI inference, source reputation, aggregate performance or model confidence;
- does not itself determine a required evidence level, Feature Fit, Evidence Confidence, Eligibility, Risk or Qualification.

### 3.3. Exact semantic separation

The following layers remain separate and attributable:

1. **`required_evidence_level`** — future feature/source/use/purpose-specific sufficiency requirement.
2. **Actual `evidence_status`** — categorical state of the evidence actually held.
3. **Evidence Confidence** — independently governed reliability contribution; not the requirement itself.
4. **Feature Fit** — correspondence of a value to a criterion; not evidence sufficiency.
5. **Processing eligibility** — whether an affected use may proceed under an approved rule.
6. **Hard Constraint / Eligibility result** — independently governed pre-scoring decision layer.
7. **Overall Confidence** — reliability of the broader assessment; not the per-feature requirement.
8. **Risk result** — independently governed risk layer.
9. **Qualification result and route** — independently governed downstream layer.

`input_validated`, schema/parser success, type validity, technical availability, AI inference and model confidence do not establish evidence confirmation or satisfy an unidentified future required level.

### 3.4. Closed, explicit and immutable future-rule discipline

Any future exact rule candidate must be:

1. closed and explicit for every affected feature, source, use and purpose;
2. explicit about the exact accepted evidence states, authoritative source, lawful basis, reviewer authority, applicability and exceptions;
3. immutable, versioned and hash-bound to the exact Feature Schema, Qualification Policy, evidence procedure, data/manifest and dependent Policy versions used;
4. explicit about missing, unknown, unmapped, ambiguous, stale, conflicting, expired, revoked, rejected, review-required and incompatible states without hidden defaults;
5. auditable to the source evidence, provenance, correction history, reviewer authority and applicable version;
6. accompanied by explicit double-counting and consequence analysis across Evidence Confidence, Feature Fit, Hard Constraint/Eligibility, overall Confidence, Risk and Qualification;
7. reviewed for uncertainty, fairness/proxy, legal applicability, segment/intersection coverage, replay and synthetic-versus-production limitations;
8. presented to the complete owner/approver set on one identical candidate and immutable evidence package.

These requirements do not select or approve any required level, mapping, ordering, hierarchy, default, fallback or consequence.

### 3.5. Affected-use fail-closed boundary

If a required-evidence rule, assignment, source, evidence, provenance, reviewer authority, applicability, version/hash or compatibility is missing, unknown, unmapped, ambiguous, stale, conflicting, expired, revoked, rejected, review-required, incomplete or unauthorized:

1. no default, minimum, maximum, nearest, previous, zero, negative, average, heuristic or AI-inferred required level is introduced;
2. no actual evidence state is promoted or coerced into a sufficient state;
3. the condition does not become zero or negative Feature Fit, low Evidence Confidence or a negative business fact;
4. the condition does not automatically create a confirmed Hard Constraint violation, `INELIGIBLE`, rejection, Risk/Qualification result, route, reason or presentation permission;
5. only a separately approved compatible rule may be used; otherwise the affected use is blocked;
6. unrelated processing is not blocked unless an independently applicable approved rule requires it;
7. historical evidence and decisions are not relabeled, overwritten or reinterpreted;
8. exact fallback, cascade, recovery, retry, error, observability and runtime behavior remain `OPEN`.

Fail closed is an affected-use governance safeguard, not an evidence level, negative business fact, automatic route or implementation specification.

### 3.6. Non-compensation and no hidden double counting

1. Cross-feature, cross-source or aggregate success cannot compensate for insufficient, missing or ineligible evidence for an affected feature/use.
2. High Feature Fit, Evidence Confidence, overall Confidence, favorable Risk or Qualification outcome cannot waive a required-evidence failure.
3. The same evidence limitation cannot be silently counted again across Evidence Confidence, Feature Fit, Hard Constraint/Eligibility, overall Confidence, Risk and Qualification.
4. Passing slices, metrics or business outcomes cannot mask adverse, incompatible, unevaluable or insufficient evidence elsewhere.
5. Absence of detected difference does not prove sufficiency, equivalence, correctness, fairness, lawful applicability or production suitability.
6. This boundary introduces no numeric aggregation, weighting, tolerance or compensation rule.

### 3.7. Minimum evidence categories before any future exact approval

No exact per-feature required-evidence rule may be approved without an immutable evidence package containing at least:

1. exact candidate scope, features, sources, uses, purposes, specifications, versions and hashes;
2. eligible source/label/adjudication/correction-history and lineage evidence under applicable `XFR-D-057`/`XFR-D-058` boundaries;
3. frozen component-atomic allocation, no reroll, no leakage and no cherry-picking under applicable `XFR-D-062` safeguards;
4. baseline measured before candidate search, with search history and rejected candidates retained;
5. strict tuning/final isolation and an untouched final set;
6. preregistered metrics, comparison directions, uncertainty methods, slices and stop/fail rules without approving them here;
7. compatible like-for-like comparison with relevant inputs and versions frozen or explicitly disclosed;
8. separate reporting for each feature, source, use, purpose, evidence status, segment/intersection and favorable/adverse/null/incompatible/unevaluable/insufficient result;
9. false-exclusion and false-eligibility counter-evidence without cross-family substitution;
10. explicit double-counting analysis across all affected decision layers;
11. metric and aggregation discipline under `XFR-D-063` and `XFR-D-066`;
12. statistical comparison discipline under `XFR-D-070`;
13. post-freeze correction/impact limitations under `XFR-D-071`;
14. exact replay evidence bound to actual inputs, code/tool/configuration and Policy versions/hashes;
15. explicit synthetic-only versus production-data applicability statement;
16. complete limitations, unsupported scopes and unresolved dependencies;
17. verification and approval by the complete decision-owner/approver set on the same immutable candidate and evidence package.

These are qualitative evidence prerequisites only. They do not approve a dataset, label, adjudication workflow, split, seed, metric, target, objective, uncertainty method, statistic, result, sufficiency verdict, Policy or production use.

### 3.8. Historical integrity and no automatic action

1. Every evidence-sufficiency assessment remains bound to the actual evidence, source, reviewer authority, Feature Schema, Qualification Policy and implementation versions/hashes used at assessment time.
2. A later rule cannot silently recalculate, relabel, overwrite or reinterpret historical evidence status, Feature Fit, Evidence Confidence, Eligibility, Confidence, Risk or Qualification results.
3. Exact replay proves reproducibility for a frozen bundle only; it does not prove semantic correctness, sufficiency, fairness, lawful applicability or production readiness.
4. Synthetic-only evidence cannot establish production-data validity, production applicability or readiness.
5. No evaluation result, statistical signal, technical success, model confidence or recommendation may automatically change evidence status, level assignment, policy, model, score, Hard Constraint, rank, route, reason, presentation, release, runtime or gate.

### 3.9. Independent decisions remain independent

1. `XFR-D-019` preserves evidence-status taxonomy and mapping governance but does not resolve per-feature required evidence.
2. `XFR-D-M6` preserves Feature Fit ↔ Evidence Confidence calibration governance but does not resolve `XFR-D-M1`.
3. `XFR-D-010` preserves reason-code authority; an evidence failure does not automatically select a reason.
4. `XFR-D-055` preserves Qualification evidence/governance boundaries without selecting exact M1 consequences.
5. Exact Qualification routes, thresholds and outcomes remain independently governed.
6. `XFR-D-057`, `XFR-D-058`, `XFR-D-062`, `XFR-D-063`, `XFR-D-066`, `XFR-D-070` and `XFR-D-071` retain their independent label, adjudication, allocation, metric, aggregation, statistical and post-freeze boundaries.
7. Feature Schema, Qualification Policy, Evaluation Plan, Scoring Policy, Risk Policy, Safe Presentation Policy, Data Contracts and Controlled Artifact Manifest retain separate approval and artifact authority.

### 3.10. Partial, never fully resolved

`XFR-D-M1` is `PARTIALLY_RESOLVED_BOUNDARY`: only decision-specific authority separation, exact seven-value enum preservation, semantic separation, closed/versioned future-rule discipline, affected-use fail-closed handling, non-compensation/no-double-counting safeguards, qualitative evidence prerequisites, historical integrity and no-automatic-action boundary are approved.

Every exact required level, per-feature/source/use/purpose assignment, sufficiency mapping, order, hierarchy, default, fallback, freshness/conflict/expiry/revocation rule, reviewer workflow, quorum, appointment/RBAC, Qualification consequence, dataset, label, metric, statistic, Policy, production, schema, carrier, runtime and implementation content remains `OPEN`. This record cannot be cited as complete resolution of `FS-01`, `MQP-08`, any Proposal or any Policy approval.

---

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
| --- | --- | --- | --- |
| XFR-D-M1 governance | `PRODUCT + AI + Chief AI Architect`, human-approved candidate-derived, not source-normative | Qualitative governance/evidence boundary | Every exact level, mapping, assignment and verdict |
| Feature Schema artifact | `PRODUCT + LEGAL + AI`, Architecture §52 | No artifact approval | Exact schema, level catalog, carrier and manifest approval |
| Qualification Policy artifact | `Chief AI Architect + PRODUCT`, human-approved `XFR-D-030 v1.0` | No artifact approval | Exact consequence, route, threshold and Policy approval |
| Evidence procedure | `AI + DEVELOPMENT` | Evidence preparation only | Exact procedure, data, run, result and sufficiency verdict |
| `evidence_status` | Architecture §13 / `XFR-D-019` | Exact seven-value categorical taxonomy preserved | Any sufficiency mapping, order or hierarchy |
| `required_evidence_level` | Future separately approved rule | Scope/immutability/fail-closed safeguards only | Every value, assignment, mapping and consequence |
| Hard Constraint / Eligibility | Independent Architecture and Policy authority | No automatic outcome | Exact applicability, result and runtime behavior |
| Confidence, Risk and Qualification | Independent controlled boundaries | Semantic separation only | Every exact value, threshold, route and outcome |
| Production/runtime | Separate approvals and gates | Nothing | Data authority, schema, API, DB, events, monitoring, rollback and implementation |

---

## 5. Обязательные non-conflations

1. `required_evidence_level` ≠ actual `evidence_status`.
2. `input_validated` / schema/parser success ≠ evidence confirmation or sufficiency.
3. AI inference/model confidence ≠ evidence authority.
4. Required evidence ≠ Evidence Confidence.
5. Required evidence ≠ Feature Fit.
6. Affected-use processing eligibility ≠ Hard Constraint / Eligibility result.
7. Required evidence ≠ overall Confidence, Risk or Qualification.
8. Evidence failure ≠ automatic `INELIGIBLE`, rejection, route, reason or presentation permission.
9. Evidence/technical owner ≠ unilateral substantive approver.
10. Governance owner ≠ Feature Schema or Qualification Policy artifact owner.
11. Proposal, evidence package, code, commit, merge, CI or deployment ≠ Policy/runtime/gate approval.

---

## 6. Что остаётся `OPEN`

- every exact required level and per-feature/source/use/purpose assignment;
- whether `input_validated` is sufficient anywhere;
- every sufficiency mapping, ordering, hierarchy, default and fallback;
- freshness, conflict, expiry, revocation and compatibility rules;
- reviewer workflow, quorum, appointment, authority evidence and RBAC;
- exact Qualification, Risk, Eligibility, routing, reason and presentation consequences;
- dataset, source, sample, allocation, split, seed, labels, adjudication, correction history and frozen manifest;
- evidence package, metric, target, objective, uncertainty method, interval, window, hypothesis, test, statistic, result and verdict;
- production-data authority, lawful applicability and readiness;
- Feature Schema, Qualification Policy, Evaluation Plan and Controlled Artifact Manifest approval;
- Policy, manifest, schema, carrier, API, DB, event, storage, runtime state, monitoring, rollback, migration and implementation;
- every governance gate transition.

---

## 7. Rationale

The sources identify a genuine governance gap: a per-feature required evidence level is needed, but no source supplies the exact levels, assignments, sufficiency mapping or operational consequences. A narrow qualitative boundary prevents `input_validated`, enum ordering, AI confidence or implementation defaults from becoming evidence authority while preserving a controlled evidence-backed path to a future exact rule.

The merged identity is appropriate because Feature Schema and Qualification Policy expose the same unresolved evidence-sufficiency question. It does not merge their artifact ownership, approve either Proposal or transfer Qualification authority.

---

## 8. Adversarial cases

1. **`input_validated=true` promotes `UNVERIFIED`.** Rejected: technical validation is not evidence confirmation.
2. **Enum order becomes a strength hierarchy.** Rejected: the seven values are categorical and unordered here.
3. **A missing assignment uses the previous or nearest level.** Rejected by affected-use fail closed; exact fallback remains `OPEN`.
4. **Insufficient evidence becomes zero Feature Fit.** Rejected: evidence sufficiency and fit are separate.
5. **Insufficient evidence automatically makes the pair `INELIGIBLE`.** Rejected: no automatic Hard Constraint/Eligibility outcome is approved.
6. **High aggregate Confidence compensates for one affected feature.** Rejected by non-compensation.
7. **The same limitation is counted in Confidence, Risk and Qualification.** Rejected without explicit separately reviewed contribution analysis.
8. **An AI model supplies a missing evidence level.** Rejected: AI inference is not authority.
9. **A later rule rewrites historical outcomes.** Rejected: versions/hashes and historical records remain immutable.
10. **Synthetic evidence becomes production approval.** Rejected by synthetic/production separation.
11. **The evidence team self-approves.** Rejected: `AI + DEVELOPMENT` has no unilateral authority.
12. **CI success activates the rule.** Rejected: no automatic Policy/model/runtime/gate action.

---

## 9. Затронутые артефакты — future separate sync only

After independent audit, this status overlay may be synchronized only through a separately scoped controlled change in exactly:

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md`;
- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`.

This record does not modify or approve those artifacts, any dataset, evaluation run, production-data use, manifest or implementation. No Policy or Inventory sync is part of this decision-record pass.

---

## 10. Change control

Any modification or reclassification of this approved qualitative boundary requires a new versioned decision record and explicit approval by `PRODUCT + AI + Chief AI Architect + LEGAL + DEVELOPMENT` on the exact same identified version/hash and immutable evidence package. `AI + DEVELOPMENT` may prepare evidence and technical material but cannot self-approve evidence sufficiency, level assignment, Policy, production, runtime or implementation.

---

## 11. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

---

## 12. Acceptance criteria

1. **Given** `FS-01` and `MQP-08`, **when** canonical identity is checked, **then** both remain `PRIMARY_MERGED_MEMBER` of `XFR-D-M1`.
2. **Given** this record, **when** resolution is checked, **then** it is always `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved.
3. **Given** authority, **when** roles are checked, **then** governance owner `PRODUCT + AI + Chief AI Architect` is candidate-derived and not source-normative; artifact owners remain separate; approvers are `LEGAL + DEVELOPMENT`; evidence owner has no unilateral authority.
4. **Given** evidence states, **when** taxonomy is checked, **then** exactly the Architecture §13 seven values are preserved without ordering, promotion or extension.
5. **Given** `input_validated`, parser success or AI confidence, **when** evidence sufficiency is claimed, **then** none establishes confirmation or an exact required level.
6. **Given** required evidence, **when** adjacent layers are checked, **then** status, Evidence Confidence, Feature Fit, processing eligibility, Hard Constraint, overall Confidence, Risk and Qualification remain distinct.
7. **Given** a future rule, **when** review occurs, **then** feature/source/use/purpose scope, lawful authoritative source, reviewer authority, version/hash and immutable evidence are explicit.
8. **Given** missing/stale/conflicting/expired/revoked/incompatible material, **when** affected use is attempted, **then** no default, promotion, negative fact, `INELIGIBLE`, route, reason or presentation permission is invented and only the affected use fails closed.
9. **Given** cross-feature or aggregate success, **when** one applicable requirement is insufficient, **then** compensation and hidden double counting are prohibited.
10. **Given** a later rule or replay, **when** historical state is checked, **then** historical evidence and decisions remain unchanged and version-bound.
11. **Given** any exact level, assignment, mapping, hierarchy, default, fallback, reviewer workflow, consequence, data, metric, statistic, Policy, production, carrier, runtime or implementation item, **when** this record is applied, **then** it remains `OPEN`.
12. **Given** any evaluation result, technical success or CI result, **when** Policy/model/runtime/gate state is checked, **then** no automatic change occurs.
13. **Given** governed artifacts and gates, **when** this record is applied, **then** no Proposal, Policy, dataset, evaluation, production-data use, manifest, runtime or implementation is approved and all three gates remain `BLOCKED`.

---

## 13. Итог

`XFR-D-M1` approves only the qualitative governance and evidence boundary for the merged `FS-01`/`MQP-08` per-feature required-evidence question. It preserves the exact seven-value evidence taxonomy, separates technical validation and adjacent decision layers, requires one explicit immutable future rule, fails closed only for affected use, prohibits compensation, hidden double counting, historical mutation and automatic action, and requires an immutable evidence package. Every exact level, assignment, mapping, dataset, statistic, Policy, production, schema, carrier, runtime and implementation content remains `OPEN`; all three governance gates remain `BLOCKED`.
