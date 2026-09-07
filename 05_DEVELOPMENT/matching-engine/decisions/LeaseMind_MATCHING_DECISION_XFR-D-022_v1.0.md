# LeaseMind Matching Decision Record — XFR-D-022

**Decision ID:** `XFR-D-022`

**Название:** Sensitivity/calibration dataset and target governance/evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-09-07

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — EXACT DATASET, SENSITIVITY DESIGN, CALIBRATION, METRICS, TARGETS, STATISTICS, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-07

**Repository baseline:** `5fccff86c68fac2082c662c9a9953585a7fbc343`

**Canonical identity:** `MSP-09 → XFR-D-022`, `PRIMARY_STANDALONE` — «Sensitivity/calibration dataset and targets».

**Scope:** qualitative governance, immutable-evidence, eligibility/lineage, frozen-allocation, baseline-first, tuning/final-isolation, pre-registration, compatible-comparison, full-reporting/non-compensation, uncertainty/fairness/replay, synthetic-versus-production, fail-closed and no-automatic-action boundary for future sensitivity/calibration evidence supporting Scoring candidates. This record does not select or approve any dataset, split, seed, label, sensitivity axis/perturbation, candidate, Mutual Aggregate function, weight, metric, `K`, calibration method, target, threshold, tolerance, statistic, result, Scoring/Evaluation Policy, production-data applicability, schema/carrier/runtime, monitoring, rollback or implementation.

**Governance owner:** `AI + DEVELOPMENT` — human-approved assignment derived from Scoring Policy §12 row 9 candidate/inherited context and the source-owned Evaluation Plan/dataset-manifest responsibility in Architecture §37 question №10 and §52. No source directly assigns this exact standalone `XFR-D-022` decision owner, so the assignment is not claimed as `SOURCE_NORMATIVE`.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact owner under Architecture §52. Artifact ownership remains separate from decision-specific evidence governance.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate dataset, manifest, sensitivity/calibration procedure and evidence, but has no unilateral authority to approve evidence sufficiency, metric/target contents, Mutual Aggregate/weights, Scoring/Evaluation Policy, production use, runtime, implementation or a governance gate.

**Preserved substantive authorities:** Architecture §37 decision owner for Mutual Aggregate function and starting/segment weights remains `AI + PRODUCT`, `SOURCE_NORMATIVE`. Numeric in-scope metric-target governance remains independently under `XFR-D-063 v1.0`: governance owner `Chief AI Architect + AI`, mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT`, evidence-procedure owner `AI + DEVELOPMENT` without unilateral authority.

**Depends on and preserves:** `XFR-D-017`, `XFR-D-M5`, `XFR-D-018`, `XFR-D-019`, `XFR-D-020`, `XFR-D-021`, `XFR-D-023`, `XFR-D-026`, `XFR-D-027`, `XFR-D-057`–`XFR-D-071`, especially dataset allocation `XFR-D-062`, metric targets `XFR-D-063` and statistical comparison `XFR-D-070`, retain their independent authority, status and `OPEN` contents. Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Controlled Artifact Manifest, production operational artifacts and runtime remain separately governed.

---

## 1. Вопрос

Какая qualitative governance и evidence-prerequisite boundary должна действовать до утверждения exact sensitivity/calibration dataset, study design, metric targets and statistical contents для будущих Mutual Aggregate/weight и иных Scoring candidate comparisons?

## 2. Source/status discipline

1. Inventory canonical crosswalk фиксирует `MSP-09 → XFR-D-022`, `PRIMARY_STANDALONE`. Inventory индексирует вопрос, но не создаёт substantive approval.
2. Architecture §15 задаёт раздельные Tenant Fit, Owner Fit, Deal Feasibility, Mutual Aggregate и Match Score structures, но не задаёт sensitivity dataset, calibration dataset, metric targets или evaluation design.
3. Architecture §15.5 требует фиксировать Mutual Aggregate в versioned Scoring Policy после оценки на pilot data; это не выбирает dataset, function, evidence criterion или winner.
4. Architecture §16 называет устойчивость ранга к неизвестным данным и историческую калибровку факторами overall Confidence Score. Эти факторы не определяют `XFR-D-022` dataset, sensitivity method, target или routing rule.
5. Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, discrimination/proxy and calibration checks, Chief AI Architect review, affected PRODUCT/LEGAL agreement, controlled release, monitoring and rollback. Она не утверждает exact contents или result.
6. Architecture §34.2 называет ranking/calibration metric families and requires baseline before future approved thresholds. Metric names and baseline-first sequence do not provide numeric targets, `K`, definitions or acceptance criteria.
7. Architecture §37 questions №2/№3 source-assign substantive Mutual Aggregate/weight decisions to `AI + PRODUCT`; question №10 assigns the labeled pilot-baseline sample/adjudication question to `AI + DEVELOPMENT`. None directly assigns the standalone `XFR-D-022` governance owner.
8. Architecture §52 assigns `MATCHING_SCORING_POLICY` to `Chief AI Architect + PRODUCT` and `MATCHING_EVALUATION_PLAN`/dataset manifest to `AI + DEVELOPMENT`. Artifact ownership does not merge Scoring-content authority with evidence preparation.
9. Scoring Policy §12 row 9 lists `AI + DEVELOPMENT` only as candidate/inherited context and leaves the dataset/targets question `OPEN`.
10. Evaluation Plan §6.3 cannot define or calibrate the reciprocal formula; §8/§9 provide candidate-manifest, replay, tuning/final and threshold-search boundaries, not approval of dataset, metric, target or policy.
11. `XFR-D-063` independently governs future numeric in-scope targets; `XFR-D-062` governs qualitative dataset allocation; `XFR-D-070` governs qualitative statistical comparison. Their boundaries are mandatory inputs, not contents supplied by this record.
12. Proposal text, candidate owner, dataset draft, manifest, synthetic fixture, baseline, evaluation result, CI, commit, merge or deployment does not equal Scoring/Evaluation Policy, production or gate approval.

## 3. Решение

### 3.1. Authority split

1. Governance owner `XFR-D-022` — `AI + DEVELOPMENT`, human-approved candidate-derived assignment, not `SOURCE_NORMATIVE`.
2. Scoring Policy artifact owner remains `Chief AI Architect + PRODUCT` under Architecture §52.
3. Mandatory approvers for this qualitative evidence-governance boundary — `Chief AI Architect + PRODUCT + LEGAL`.
4. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, without unilateral approval authority.
5. Mutual Aggregate/function and starting/segment-weight decisions remain with source-normative `AI + PRODUCT`; this record supplies no substantive Scoring choice.
6. Numeric metric targets remain under `XFR-D-063` governance owner `Chief AI Architect + AI` and its mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT`; the word “targets” in `MSP-09` does not transfer or duplicate that authority.
7. A future complete package must be reviewed against one immutable candidate/evidence version and satisfy every independently applicable owner/approver boundary. Evidence preparation, artifact ownership, model expertise, technical execution or a successful run grants no unilateral approval.

### 3.2. Immutable candidate and evidence binding

Any future sensitivity/calibration claim must bind to:

1. one exact candidate Scoring Policy semantic version and hash;
2. exact candidate Mutual Aggregate/function and weight configuration identities without treating them as approved;
3. exact Feature Schema, Scoring, Risk and Qualification policy versions/hashes used by the run;
4. immutable dataset/manifest identity, source snapshot, freeze time and lineage;
5. exact label/adjudication/grouping/correction-policy versions and hashes;
6. exact metric-procedure, sensitivity-procedure, code/configuration/build/dependency and deterministic-mode identities;
7. applicable model/provider/artifact and runtime/hardware identity when they can affect the result;
8. post-execution result/replay artifacts and reviewer evidence linked back to the same freeze-time manifest.

This approves required evidence categories only. It does not select field names, physical schema, candidate configuration, dataset, procedure or result.

### 3.3. Eligibility, lineage and frozen allocation

1. Only evidence eligible under independently approved label/source/adjudication boundaries may support a claim; `XFR-D-057`–`XFR-D-060` remain mandatory where applicable.
2. Group-linked records remain in one connected component under `XFR-D-059`; a component cannot cross tuning/final or other separately approved split boundaries.
3. Dataset allocation is component-atomic and frozen under `XFR-D-062`; algorithm, eligible component universe, inputs, seed and assignments must be fixed before inspection of labels/outcomes/metrics.
4. Reroll, reseed, selective exclusion, repeated allocation, leakage, post-hoc regrouping or cherry-picking for a more favorable result is prohibited.
5. Accepted correction history and post-freeze impact are governed independently by `XFR-D-060`/`XFR-D-071`; historical manifests/results remain immutable and cannot be silently reused after an applicable correction.
6. Missing, ambiguous, stale, conflicting, incompatible or lineage-unverified evidence blocks only the affected claim fail closed and does not become clean, stable, calibrated, favorable, negative or production evidence.

### 3.4. Baseline-first and tuning/final isolation

1. Applicable metric families are measured as baseline before any numeric target is approved.
2. Baseline is descriptive evidence, not a target, threshold, tolerance, acceptance criterion, winner or production policy.
3. Candidate selection, sensitivity design and calibration tuning use tuning evidence only.
4. Untouched final evidence is not used to choose, revise, weaken or regroup the candidate, metric, target, perturbation or comparison that it later evaluates.
5. Post-selection, metric/denominator/segment switching, result-dependent stopping/reruns and repeated looks not covered by an approved pre-registration are prohibited.
6. Failure of tuning/final isolation invalidates the affected claim; it does not authorize a new split, seed or final cycle automatically.

### 3.5. Pre-registration and compatible comparison

Before access to final outcomes, the evidence package must freeze at least the following categories:

1. intended claim and exact candidate policy/version/hash set;
2. eligible population, evaluation unit, connected-component universe and split assignments;
3. proposed sensitivity/calibration objects and separately attributable inputs/outputs;
4. proposed metric families, denominators, aggregation, missing/unknown/conflict treatment and limitations;
5. candidate comparison set, reference/baseline identity and planned comparisons;
6. planned segment/intersection reporting and applicable fairness/proxy/legal review;
7. proposed uncertainty, statistical, multiplicity, sequential/stopping and deviation treatment;
8. immutable data, label, correction, code/configuration, model and procedure lineage;
9. synthetic-only versus production-data applicability statement;
10. expected replay mode and evidence required to establish reproducibility.

Direct comparison is permitted only between demonstrably compatible evaluation units, eligibility/adjudication/grouping/correction rules, candidate/policy/metric versions, dataset lineage and run assumptions. Incompatible candidates/runs receive an explicit incompatible/unevaluable outcome, not a delta, winner, pass or substitute comparison.

### 3.6. Full separate reporting and non-compensation

1. Favorable, adverse, null, incompatible, unevaluable and insufficient outcomes are reported without selective omission.
2. Results remain separately attributable by candidate, metric family, evaluation object, dataset scope and applicable segment/intersection.
3. Tenant Fit, Owner Fit, Deal Feasibility, Reciprocal Fit, Match Score, Evidence Confidence, overall Confidence Score, Risk, Qualification and ranking outputs remain separate; no aggregate result silently rewrites another layer.
4. Success of one metric, candidate, segment, source, split or aggregate does not compensate adverse, incompatible, unevaluable or insufficient evidence in another applicable slice.
5. Sensitivity analysis does not become overall Confidence Score, causal proof, robustness guarantee, fairness/legal verdict, Qualification cutoff, ranking rule or production-readiness verdict.
6. Exact deterministic replay proves only reproducibility under the same frozen assumptions; it does not prove semantic correctness, calibration, fairness, safety or production readiness.

### 3.7. Synthetic/production and no-automatic-action boundary

1. Synthetic-only evidence supports only an explicitly scoped synthetic claim under `XFR-D-026`; it cannot establish production calibration, production target, production-data applicability or production readiness.
2. Production evidence requires separately approved data authority, lawful basis, purpose, de-identification/privacy controls, source eligibility, segment coverage and fairness/proxy review. Mere availability of real data is not approval to use it.
3. An evaluation result, baseline, apparent winner, calibration signal or sensitivity finding cannot automatically change a function, weight, mapping, threshold, model, policy, candidate set, ranking, routing, release, runtime, monitoring action, rollback or gate.
4. Any substantive selection or release follows its own owner decision, Architecture §30.3 review/approval path and Controlled Artifact Manifest discipline.

### 3.8. Prohibited surrogate values and defaults

1. Pilot cap `100 Campaign` is not a dataset size, minimum, split basis, power calculation or production-sufficiency criterion.
2. Campaign→Qualified `40%/25%` targets are not sensitivity, calibration, ranking, mutual-fit, Confidence, weight or model-release targets.
3. Conventional split ratios, default `K`, common calibration metrics, library thresholds, statistical defaults or current code behavior have no authority unless separately approved.
4. Architecture §34.1 zero-tolerance rules for unknown-as-negative and process-failure-as-negative remain separate inviolable safeguards and cannot be absorbed into, averaged with or waived by this evidence package.

### 3.9. Independent decisions preserved

1. `XFR-D-017` retains Mutual Aggregate qualitative governance; harmonic/geometric or any other exact function remains unselected.
2. `XFR-D-M5` retains starting/segment weights and Reciprocal Fit/Deal Feasibility combination authority; no weight or threshold is approved here.
3. `XFR-D-018`, `XFR-D-019`, `XFR-D-020` and `XFR-D-021` retain segment-override, Evidence Confidence, numeric-representation and ranking/diversification boundaries.
4. `XFR-D-026` retains synthetic-to-production evidence authority; `XFR-D-027` retains the separate operational-owner boundary for Architecture §30.3 steps 1–3.
5. `XFR-D-057`–`XFR-D-061` retain label eligibility, adjudication, grouping, correction and false-exclusion boundaries.
6. `XFR-D-062` retains dataset allocation/size/split/seed authority; this record does not define or complete its numeric contents.
7. `XFR-D-063` retains metric-family/target authority; this record does not define a metric, `K`, target or calibration method.
8. `XFR-D-064`/`XFR-D-068` retain segment coverage and fairness/proxy/legal authority; diagnostic results are not legal verdicts.
9. `XFR-D-065` retains drift-monitoring governance; sensitivity/calibration evidence is not a production monitoring artifact or alert/action policy.
10. `XFR-D-066` retains Evaluation Plan approval procedure; `XFR-D-067` retains Data Governance authority; `XFR-D-069` retains unknown/abstention terminology; `XFR-D-070` retains statistical-comparison discipline; `XFR-D-071` retains post-freeze correction impact handling.

### 3.10. Partial, never fully resolved

`XFR-D-022` receives `PARTIALLY_RESOLVED_BOUNDARY`: decision-specific roles, immutable version/hash evidence categories, eligibility/lineage, frozen component-atomic allocation/no-reroll/no-leakage/no-cherry-pick, baseline-first, tuning/final isolation, pre-registration, compatible comparison, full separate reporting/non-compensation, uncertainty/fairness/replay and synthetic/production scope, fail-closed and no-automatic-action qualitative boundaries are approved.

Every exact dataset, split, seed, label, sensitivity design, candidate, function, weight, metric, `K`, calibration, target, threshold, tolerance, statistic, result, policy, production, carrier, runtime and implementation content remains `OPEN`. This record cannot be cited as a complete resolution of Scoring Policy §12 row 9 or any independent decision named above.

## 4. Authority and layer table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| `XFR-D-022` evidence governance | `AI + DEVELOPMENT`, human-approved candidate-derived | Qualitative governance/evidence boundary | Actual dataset/procedure/evidence/result |
| Scoring artifact | Architecture §52: `Chief AI Architect + PRODUCT` | No artifact approval | Exact Scoring Policy version/hash and approval |
| Mutual Aggregate/weights | Architecture §37: `AI + PRODUCT`, `SOURCE_NORMATIVE` | No substantive selection | Function, weights, thresholds and policy |
| Numeric metric targets | `XFR-D-063`: `Chief AI Architect + AI`; approvers `PRODUCT + LEGAL + DEVELOPMENT` | Explicit authority preservation | Every metric/target/calibration/statistical value |
| Evidence procedure | `AI + DEVELOPMENT` | Preparation responsibility, no unilateral authority | Exact method, data and sufficiency verdict |
| Mandatory approval | `Chief AI Architect + PRODUCT + LEGAL` for this boundary | Required participation | Future actual package approval |
| Production/runtime | Separate controlled artifacts and gates | No authorization | Data authority, carrier, monitoring, rollback and implementation |

## 5. Что остаётся `OPEN`

- dataset identity/content/source records, eligibility, evaluation unit, inclusion/exclusion and actual lineage;
- sample size/minimum, split names/ratios/tolerances, allocation/stratification algorithm and seed-generation policy/value;
- label taxonomy/application, adjudication, grouping/linkage and correction-history contents beyond independently approved boundaries;
- sensitivity object, axes, perturbations, ranges, grid, ordering, reference/baseline and interpretation;
- candidate set, Mutual Aggregate function, all weights, directions and segment overrides;
- metric/relevance definitions, `K`, numerator, denominator, aggregation, weighting and missing/unknown/conflict treatment;
- calibration method, objective, loss, bins, curves, score transformation and acceptance interpretation;
- every target, threshold, tolerance, margin, stop level and production-readiness criterion;
- uncertainty/confidence method, hypotheses, tests, estimators, intervals, effect-size/power/significance values, multiple-comparison, sequential/stopping, equivalence/non-inferiority and winner rules;
- segment universe/intersections, protected/proxy classification, lawful basis, fairness standard/comparator/causal/remediation method;
- exact dataset/manifest schema, run, results, report, evidence package and sufficiency/verdict;
- production-data authority, de-identification proof, calibration/applicability/readiness;
- Scoring/Evaluation/Feature/Risk/Qualification Policy and Controlled Artifact Manifest approval;
- representation/precision/rounding/serialization and schema/API/DB/events/carrier/storage;
- runtime behavior, error/status codes, retry/recovery/escalation, monitoring, rollback and implementation;
- all governance gates.

## 6. Rationale

Sources require evidence before Scoring selection and provide strong frozen-sample, calibration, replay and human-approval constraints, but they do not specify a sensitivity/calibration dataset or numeric target. A narrow qualitative record can therefore establish who prepares and reviews future evidence and which integrity safeguards are mandatory without inventing the missing contents.

Separating evidence governance from Scoring artifact ownership, substantive Mutual Aggregate/weight authority and numeric-target authority prevents a successful analysis or an Evaluation Plan artifact from selecting production scoring behavior. Baseline-first, immutable lineage, tuning/final isolation, compatible comparison and complete non-compensating reporting prevent post-hoc optimization from masquerading as independent evidence.

## 7. Adversarial cases

1. **Pilot cap becomes sample size.** Prohibited: `100 Campaign` is a scope cap, not statistical sufficiency.
2. **Campaign→Qualified targets become calibration targets.** Prohibited: `40%/25%` belong to a separate business/Matching metric and are not surrogates.
3. **A conventional split, default `K` or library metric is adopted automatically.** Prohibited: every exact value/method remains `OPEN`.
4. **Final evidence chooses the candidate it later validates.** The affected claim is invalid; a new untouched final cycle is required through separate approval.
5. **Repeated seeds/splits are tried until a favorable result appears.** Prohibited reroll/cherry-pick; frozen component-atomic allocation is mandatory.
6. **Aggregate success hides an adverse candidate, metric, segment or intersection.** Prohibited by separate reporting and non-compensation.
7. **A synthetic winner becomes a production function or weight.** Prohibited by `XFR-D-026`; production applicability remains separate.
8. **Exact replay is presented as proof of calibration or fairness.** Prohibited: reproducibility is not semantic/evidentiary correctness.
9. **AI + DEVELOPMENT prepare evidence and approve the target alone.** Prohibited: preparation is not approval; XFR-D-022 approvers and `XFR-D-063` target authority remain mandatory.
10. **XFR-D-022 is cited as selecting Mutual Aggregate or weights.** Prohibited: `XFR-D-017`/Architecture §37 and `XFR-D-M5` remain independent.
11. **Missing correction or lineage evidence is interpreted as no correction/no issue.** Prohibited: affected claim fails closed.
12. **Sensitivity to unknown inputs is written directly into overall Confidence or Qualification routing.** Prohibited: diagnostic evidence does not define scoring/routing semantics.
13. **A metric target is declared because the dataset baseline reached it.** Prohibited: baseline does not self-create an approved target.
14. **Evaluation success automatically updates policy/model/runtime or gate state.** Prohibited: separate controlled human approval/release is required.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §10, §12 row 9 and readiness/acceptance summaries may receive this qualitative owner/evidence-boundary cross-reference without dataset, metric or target contents;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay for `XFR-D-022`;
- Evaluation Plan only through separately scoped, separately approved future work if an exact cross-reference is required; no Evaluation Plan change is authorized by this record;
- future exact `XFR-D-022`, `XFR-D-062`, `XFR-D-063`, `XFR-D-070`, Scoring/Evaluation Policy, dataset/manifest, metric/statistical and runtime artifacts — separate downstream passes.

No future sync may interpret this record as an approved dataset, split, seed, sensitivity design, metric, target, calibration, statistical procedure, result, policy, production-data use, runtime or implementation.

## 9. Change control

Changing governance owner, mandatory approvers, preserved source authorities, immutable evidence categories, eligibility/lineage, frozen-allocation/no-reroll, baseline-first, tuning/final isolation, pre-registration, compatible-comparison, full-reporting/non-compensation, synthetic/production, fail-closed or no-automatic-action boundaries requires a new versioned `XFR-D-022` record approved by `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`, with a `supersedes` reference to this version.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

## 11. Acceptance criteria

1. **Given** this record, **when** an exact dataset, split, seed, sensitivity axis, perturbation, metric, target, calibration or statistical value is requested, **then** none is approved and `XFR-D-022` remains `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** authority review, **when** roles are checked, **then** `AI + DEVELOPMENT` is human-approved governance/evidence owner without unilateral authority, Scoring artifact owner remains `Chief AI Architect + PRODUCT`, and mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`.
3. **Given** Mutual Aggregate/function or weights, **when** XFR-D-022 is cited, **then** source-normative `AI + PRODUCT` authority is preserved and no candidate is selected.
4. **Given** a numeric metric target, **when** approval authority is checked, **then** `XFR-D-063` owner `Chief AI Architect + AI` and approvers `PRODUCT + LEGAL + DEVELOPMENT` remain independently required.
5. **Given** a candidate evidence package, **when** version/hash, eligible labels, lineage, frozen component allocation, tuning/final isolation or applicable pre-registration is missing, **then** the affected claim is blocked fail closed.
6. **Given** final evidence, **when** it was used to choose/revise the same candidate, metric, perturbation, target or comparison, **then** it is not valid final evidence for that claim.
7. **Given** incompatible candidate/run versions or lineage, **when** direct comparison is attempted, **then** no delta/winner/pass claim is produced.
8. **Given** aggregate success, **when** an applicable candidate/metric/segment/intersection result is adverse, incompatible, unevaluable or insufficient, **then** it remains separately visible and is not compensated.
9. **Given** `100 Campaign`, `40%/25%`, a conventional split, default `K` or library/statistical default, **when** a dataset/target/method is requested, **then** none is used as authority or surrogate.
10. **Given** synthetic-only evidence, **when** a production calibration/target/readiness claim is proposed, **then** the claim is prohibited.
11. **Given** an evaluation result, **when** an automatic function/weight/threshold/model/policy/routing/runtime/release/rollback/gate change is proposed, **then** the change is prohibited and requires separate controlled approval.
12. **Given** `XFR-D-017`, `XFR-D-M5`, `XFR-D-019`–`XFR-D-021`, `XFR-D-026`–`XFR-D-027` and `XFR-D-057`–`XFR-D-071`, **when** this record is applied, **then** none is absorbed, reopened or substantively completed.
13. **Given** this record, **when** Scoring/Evaluation Policy, dataset/manifest/run/result, production-data use, schema/carrier/runtime, implementation and gates are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 12. Итог

`XFR-D-022 SENSITIVITY/CALIBRATION EVIDENCE-GOVERNANCE BOUNDARY APPROVED — EXACT DATASET, SPLIT, SEED, SENSITIVITY DESIGN, CANDIDATE, FUNCTION, WEIGHT, METRIC, TARGET, CALIBRATION, STATISTICS, RESULT, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
