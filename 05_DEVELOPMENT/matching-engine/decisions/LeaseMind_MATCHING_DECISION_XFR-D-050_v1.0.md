# LeaseMind Matching Decision Record — XFR-D-050

**Decision ID:** `XFR-D-050`

**Название:** Risk calibration evaluation-governance and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-09-14

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE RISK CALIBRATION EVALUATION/EVIDENCE-PREREQUISITE BOUNDARY — ALL EXACT DATASET, LABEL, METRIC, BASELINE, TARGET, THRESHOLD, STATISTICAL, RUN, RESULT, VERDICT, POLICY, PRODUCTION, CARRIER AND RUNTIME CONTENT REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-14

**Repository baseline:** `ac1191324dc88149764679583e434eeac7bc9281`

**Canonical identity:** `MRP-05 → XFR-D-050`, `PRIMARY_STANDALONE` (Inventory §4.3). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative governance and evidence prerequisites for a future Risk calibration evaluation candidate. No dataset, label contract, metric, baseline value, target, threshold, tolerance, statistical method, evaluation run/result/verdict, Risk Policy, production applicability, carrier, runtime or implementation is approved.

**Governance owner:** `AI + DEVELOPMENT` — human-approved assignment derived from Risk Policy §13 row 5 and aligned with the Evaluation Plan evidence-artifact owner; it is not claimed as source-normative Risk approval authority.

**Risk Policy artifact owner:** `Chief AI Architect + LEGAL` — source-normative under Architecture §52 and separate from decision-specific governance/evidence preparation.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares evaluation candidates/evidence but cannot unilaterally approve Risk content, data, results, production/runtime/implementation or a gate.

**Depends on and preserves:** `XFR-D-047`–`XFR-D-055`, `XFR-D-M2`, `XFR-D-M3`, `XFR-D-M4` and Evaluation governance `XFR-D-057`–`XFR-D-071` retain their exact independent status and open contents. `XFR-D-048` multi-component/conditional non-compensation applies; segment/fairness, privacy and statistical-comparison evidence remain separate.

---

## 1. Вопрос

Какая qualitative governance/evidence boundary обязательна до утверждения Risk calibration dataset, metrics and segments?

## 2. Source/status discipline

1. Inventory indexes `MRP-05 → XFR-D-050`, `PRIMARY_STANDALONE`; indexing is not approval.
2. Risk Policy §13 row 5 is an open candidate assignment, not an approved dataset or calibration procedure.
3. Evaluation Plan is a Proposal owned as evidence artifact by `AI + DEVELOPMENT`; it does not own final Risk Policy approval.
4. Architecture requires baseline measurement before later threshold approval and prohibits automatic production-rule change from learning/evaluation results.
5. Synthetic-only evidence and production evidence/applicability are separate; the former cannot establish the latter.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `AI + DEVELOPMENT`, candidate-derived and not source-normative Risk approval authority.
2. Mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`.
3. Risk Policy artifact owner remains `Chief AI Architect + LEGAL`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Any future exact content requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. Frozen immutable candidate and manifest prerequisite

Any future review requires a frozen immutable evaluation candidate and manifest bound to exact versions/hashes of all actually used:

1. Risk representation/category/factor definitions and source/evidence rules;
2. Feature, Risk, Qualification and relevant Evaluation contracts;
3. dataset snapshot, labels/adjudication state, split/allocation and exclusions;
4. metrics/statistical procedure/configuration and code/toolchain assumptions;
5. applicable privacy, segment, fairness and lawful-processing boundaries.

This list is an evidence-category prerequisite, not approval of exact manifest fields or any artifact content.

### 3.3. Baseline-first discipline

1. The first valid measurement is a baseline, not an approved target, threshold, tolerance or release criterion.
2. A baseline cannot be promoted to policy because it is available, conventional, favorable or statistically significant.
3. Any later proposed value requires a separate immutable candidate, applicable evidence and full cross-functional approval.
4. No Campaign target, unrelated metric or existing policy number may serve as a surrogate Risk threshold.

### 3.4. Tuning/final isolation and compatible comparison

1. Tuning and final evaluation evidence must remain isolated under a separately approved frozen allocation/procedure.
2. Post-hoc selection, reroll, relabeling, threshold choice or metric choice using final evidence is prohibited absent the separately governed correction/re-freeze path.
3. Comparisons require compatible definitions, population, unit, scope, versions/hashes and statistical procedure.
4. Incompatible runs cannot be silently pooled, ranked or declared improved.

Exact split, allocation, sample size, seed, comparison method and correction process remain independently `OPEN`/governed.

### 3.5. Separate uncertainty, segment and fairness evidence

1. Uncertainty must be reported separately from point estimates when an approved method eventually exists.
2. Aggregate Risk evidence cannot compensate missing/adverse/insufficient segment or intersection evidence.
3. Segment coverage, privacy small-cell sufficiency, statistical power and fairness/legal verdict remain distinct.
4. A fairness diagnostic is not a protected/proxy classification, lawful-basis determination or legal fairness verdict.
5. `XFR-D-048` prevents an aggregate/scalar from hiding applicable independently critical Risk components.

No exact uncertainty, segment, fairness or statistical content is selected here.

### 3.6. Synthetic is not production

1. Synthetic-only evaluation may support only the explicitly approved synthetic scope.
2. It does not establish production calibration, production representativeness, production threshold, production-data eligibility, deployment readiness or launch.
3. Real/production-data use requires its own legal, privacy, data-governance and gate approvals.

### 3.7. No automatic action

No metric, baseline, run, comparison, segment/fairness diagnostic or result may automatically:

1. approve/change Risk Policy, category/factor, formula, target or threshold;
2. promote/retrain/release a model;
3. choose Qualification route or reviewer/legal outcome;
4. change runtime behavior, manifest, deployment or production applicability;
5. pass any governance gate.

### 3.8. Partial, never full resolution

`XFR-D-050` receives `PARTIALLY_RESOLVED_BOUNDARY`: authority separation, frozen immutable candidate/manifest, baseline-first, tuning/final isolation, compatible-comparison, separate uncertainty/segment/fairness, non-compensation, synthetic-not-production and no-automatic-action prerequisites are approved qualitatively.

Everything exact remains `OPEN`, including dataset, labels, adjudication, population, units, segments, metrics, formulae, numerators, denominators, aggregation, baseline, target, threshold, tolerance, statistics, sample, run, result, verdict, policy, production, carrier, runtime and implementation.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.3 | `MRP-05 → XFR-D-050`, `PRIMARY_STANDALONE` | Future status overlay |
| Governance/evidence | `AI + DEVELOPMENT`; approvers `Chief AI Architect + PRODUCT + LEGAL` | Qualitative prerequisites | Exact evaluation content/verdict |
| Risk Policy artifact | `Chief AI Architect + LEGAL` | No artifact approval | Policy/value approval |
| Evaluation artifact | `AI + DEVELOPMENT` | No Plan approval | Dataset/procedure/run/result |
| Components/non-compensation | `XFR-D-048` | Preserved | Criticality/formula/aggregation |
| Segment/fairness/privacy/statistics | Independent decisions | Separation preserved | All exact contents/verdicts |
| Runtime/production/gates | Separate authorities | No authorization | Carrier/model/release/gates |

## 5. Обязательные non-conflations

1. Evaluation owner ≠ Risk Policy approval authority.
2. Frozen manifest ≠ approved contents or run.
3. Baseline ≠ target, threshold, tolerance or release criterion.
4. Tuning evidence ≠ final evidence.
5. Aggregate result ≠ sufficient segment/fairness evidence.
6. Fairness diagnostic ≠ legal/protected/proxy/lawful-basis verdict.
7. Synthetic evidence ≠ production evidence/readiness.
8. Evaluation success ≠ automatic policy/model/route/runtime/gate change.

## 6. Что остаётся `OPEN`

- exact dataset, labels, adjudication and eligibility;
- population, unit, segment/intersection universe and allocation;
- metrics, formulas, numerators, denominators and aggregation;
- baseline/target/threshold/tolerance values and comparators;
- uncertainty, confidence interval and statistical method;
- sample size, split, seed, window, run procedure and correction handling;
- results, evidence sufficiency and approval verdict;
- Risk/Qualification/Evaluation Policy and manifest approvals;
- production applicability/data use, schema/carrier/runtime/model/release/implementation and gates.

## 7. Rationale

Calibration results become meaningful only when candidate, data and procedure are frozen and comparable. The approved prerequisites prevent data leakage and post-hoc promotion while leaving every empirical and policy choice open to evidence and cross-functional approval.

## 8. Adversarial cases

1. **The first measured rate becomes the threshold.** Rejected: it is baseline only.
2. **Final data is used to tune a candidate.** Rejected: tuning/final isolation is mandatory.
3. **Incompatible versions are pooled.** Rejected: comparison requires compatible immutable definitions.
4. **Good aggregate metrics hide a failing segment.** Rejected: evidence families do not compensate.
5. **Synthetic performance is cited as production readiness.** Rejected.
6. **A favorable run automatically updates Risk Policy or routing.** Rejected.
7. **Manifest existence is treated as dataset approval.** Rejected: it is a prerequisite container, not substantive approval.

## 9. Затронутые артефакты — future separate sync only

- Risk Policy and Inventory may later receive a status overlay preserving every exact/data/result item `OPEN`.
- No Proposal, Policy, Data Contract, dataset, Evaluation Plan, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Risk Policy, Inventory, Evaluation Plan, other Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to this qualitative boundary requires a new versioned `XFR-D-050` record with `supersedes`, approved by all five functions on the same immutable version/hash: `AI + DEVELOPMENT` and `Chief AI Architect + PRODUCT + LEGAL`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record approves no Proposal, Policy, Data Contract, dataset, Evaluation Plan/run/result, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity is `MRP-05 → XFR-D-050`, `PRIMARY_STANDALONE`; counts remain 102/90.
2. Roles match the header and Evaluation/evidence ownership is not Risk approval authority.
3. A frozen immutable version/hash-bound candidate and manifest are prerequisites only.
4. Baseline is measured first and never silently promoted to target/threshold.
5. Tuning/final isolation and compatible comparison are preserved.
6. Uncertainty, segment and fairness evidence remain separate and non-compensating.
7. Synthetic-only evidence creates no production claim.
8. Results create no automatic policy/model/route/runtime/gate change.
9. Every exact dataset/label/metric/statistical/run/result/policy/carrier item remains `OPEN`.
10. All three gates remain `BLOCKED`.

## 13. Итог

`XFR-D-050 PARTIALLY_RESOLVED_BOUNDARY — A FROZEN IMMUTABLE VERSION/HASH-BOUND EVALUATION CANDIDATE AND MANIFEST, BASELINE-FIRST DISCIPLINE, TUNING/FINAL ISOLATION, COMPATIBLE COMPARISON, SEPARATE UNCERTAINTY/SEGMENT/FAIRNESS EVIDENCE, NON-COMPENSATION, SYNTHETIC-NOT-PRODUCTION AND NO-AUTOMATIC-ACTION RULES ARE APPROVED ONLY AS PREREQUISITES; ALL EXACT DATASET, METRIC, STATISTICAL, RESULT, POLICY, PRODUCTION, CARRIER, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN`
