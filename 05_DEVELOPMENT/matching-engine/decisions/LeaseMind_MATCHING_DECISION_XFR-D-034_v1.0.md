# LeaseMind Matching Decision Record — XFR-D-034

**Decision ID:** `XFR-D-034`

**Название:** Minimum mutual-fit threshold governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-15

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE, EVIDENCE-PREREQUISITE, NON-COMPENSATION AND FAIL-CLOSED BOUNDARY — MUTUAL-FIT OBJECT, COMPARATOR, NUMERIC THRESHOLD, DATA, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation on 2026-09-15.

**Repository baseline:** `ac2f02738c5949e0c234c81bcaefa4693504314f`

**Scope:** governance ownership and qualitative evidence boundary for a future minimum mutual-fit threshold used only by the Matching Qualification Gate. This record neither defines nor approves the measurable mutual-fit object, comparator, value, unit, formula, dataset, evaluation result, Qualification/Scoring Policy, production applicability, runtime carrier, or implementation.

**Canonical identity:** `MQP-05 → XFR-D-034`, `PRIMARY_STANDALONE`; `MSP-05 → XFR-D-034`, `SECONDARY_BOUNDARY_REFERENCE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.4/§4.5). Crosswalk identities and Inventory counts (102 source keys / 90 canonical IDs) remain unchanged.

**Governance owner:** `Chief AI Architect + PRODUCT` — human-approved decision-specific assignment derived from the approved Qualification Policy artifact-owner boundary, not `SOURCE_NORMATIVE` for the threshold itself.

**Mandatory approvers:** `LEGAL + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT` under a future separately approved `MATCHING_EVALUATION_PLAN` procedure; this role cannot approve a metric family, threshold, policy, production applicability, routing, or implementation unilaterally.

**Depends on:** `XFR-D-045 v1.0` and documented `XFR-F1`; applicable `XFR-D-057 v1.0`, active `XFR-D-058 v1.1`, active `XFR-D-059 v1.1`, `XFR-D-060 v1.0`, and `XFR-D-062 v1.0`–`XFR-D-071 v1.0` remain independent evidence prerequisites. `XFR-D-035`, `XFR-D-036`, `XFR-D-M2`, `XFR-D-021`, `XFR-D-022`, `XFR-D-033`, `XFR-D-042`, `XFR-D-045`, `XFR-D-046`, `XFR-D-061`, and `XFR-D-063` are not reopened, absorbed, or completed here.

---

## 1. Вопрос

Кто владеет будущим решением о minimum mutual-fit threshold для Matching Qualification Gate и какие governance/evidence границы обязательны до появления отдельно утверждённых mutual-fit object, `XFR-F1` metric-family content, evidence package и numeric threshold?

## 2. Source/status discipline

1. Architecture §18.1 требует только «достаточность взаимного соответствия». Architecture §15.5 определяет `Reciprocal Fit = Mutual Aggregate(Tenant Fit, Owner Fit)` и требует штрафовать односторонние совпадения, но оставляет exact aggregate function будущей versioned Scoring Policy.
2. Qualification Policy §6 и §10 сохраняет sufficient mutual fit как qualitative `SOURCE_NORMATIVE` gate condition; §15 row 5 оставляет numerical minimum threshold candidate без owner.
3. Scoring Policy row `MSP-05` объявляет Qualification/minimum-score threshold `OUT_OF_SCOPE` и передаёт authority Qualification Policy; Scoring Policy не устанавливает этот threshold.
4. `XFR-D-045 v1.0` фиксирует отдельную mutual-fit evidence family, baseline-first, frozen manifest, tuning/final isolation и non-compensation, но сохраняет `XFR-F1` content и `XFR-D-034` actual threshold `OPEN`.
5. Inventory только индексирует `MQP-05` и secondary `MSP-05` к одному canonical `XFR-D-034`; он не утверждает значение или owner.

Этот record утверждает только roles и qualitative decision boundary. Любой exact/numeric content остаётся `OPEN`.

## 3. Решение

### 3.1. Roles and authority

1. Governance owner будущего minimum mutual-fit threshold — `Chief AI Architect + PRODUCT`.
2. Mandatory approvers — `LEGAL + AI + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral approval authority.
4. Actual threshold approval требует полного owner/approver set, нового versioned `XFR-D-034` record и immutable version/hash-bound evidence package.

### 3.2. Qualification-only use

Future threshold может сравнивать только separately approved measurable mutual-fit object с candidate Qualification condition. Он не пересчитывает Tenant Fit, Owner Fit, Reciprocal Fit, Deal Feasibility, Match Score, Confidence Score, Risk Score, Priority Score или ranking и не становится самостоятельным scoring weight, Hard Constraint или evidence status.

`MSP-05` остаётся только secondary boundary: Scoring Policy поставляет отдельно утверждённый measurable object, но не выбирает Qualification threshold и не получает authority над Qualification route.

### 3.3. Evidence prerequisite and non-compensation

До threshold decision отдельная mutual-fit evidence family должна сохранить `XFR-D-045`: measurable-object provenance, `XFR-F1` gap, baseline-first, immutable frozen manifest, tuning/untouched-final isolation, eligible labels/adjudication/grouping/allocation/correction history, uncertainty, segment/intersection and fairness/legal reporting, false-eligibility and false-exclusion counter-evidence.

Высокие Confidence, completeness, ranking quality, низкий Risk, business outcome или aggregate performance не компенсируют insufficient mutual-fit evidence. Высокий Tenant Fit не скрывает критически низкий Owner Fit и наоборот; exact Mutual Aggregate and penalty remain separately `OPEN`.

### 3.4. No surrogate or hidden default

Ни Match Score, ни Reciprocal Fit scale endpoint, ни ranking minimum-quality rule, ни pilot KPI, ни Campaign conversion target, ни conventional percentage не является surrogate threshold. Missing threshold не заменяется zero, midpoint, prior version, product intuition, model output, observed distribution или implementation default.

### 3.5. Fail-closed handling

Missing, unapproved, ambiguous, stale, conflicting, incomplete or version-incompatible mutual-fit object, threshold, evidence package or policy binding blocks only affected Qualification progression. It creates no negative fact, failed Hard Constraint, automatic `INELIGIBLE`, `REJECTED_BY_MATCHING`, `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED`, `QUALIFIED_HYPOTHESIS`, rank change, or unrelated processing block.

### 3.6. Independent boundaries

- `XFR-D-035` Confidence cutoff and `XFR-D-036` completeness rule remain separate non-compensating decisions.
- `XFR-D-021` ranking/diversification and its minimum-quality rule do not set this Qualification threshold.
- `XFR-D-022`/`XFR-D-063` metric-target governance and `XFR-D-061` Hard-Filter false exclusion do not substitute for Qualification evidence.
- `XFR-D-033` governs qualitative cause precedence, not the value or comparator here.
- `XFR-D-042` segment-specific policy cannot silently alter the global threshold; all its segment/lawful-basis/evidence contents remain independent.
- `XFR-D-M2` Risk-to-routing threshold remains `SOURCE_NORMATIVE` owner `AI + LEGAL` and is not this threshold.
- `XFR-D-045` evidence governance and `XFR-D-046` synthetic-only boundary remain prerequisites, not approvals of this decision.

### 3.7. No automatic action

Evidence, a model result, policy prose, code, CI, commit or merge cannot automatically choose or activate a threshold, change scoring/ranking/routing, approve production applicability, or advance any gate.

### 3.8. Partial, never fully resolved

`XFR-D-034` receives only `PARTIALLY_RESOLVED_BOUNDARY`: roles, Qualification-only placement, evidence prerequisites, non-compensation, no-surrogate/no-default, affected-progression fail closed, dependency preservation and no-automatic-action are approved. Mutual-fit object/function, comparator, numeric threshold and every exact downstream artifact remain `OPEN`.

## 4. Layer/authority table

| Layer | Authority | Resolved here | Remains `OPEN` |
|---|---|---|---|
| Qualitative condition | Architecture §18.1 | Preserved | Operational definition |
| Mutual-fit object | Architecture §15.5; future Scoring Policy | No change | Function, formula, scale, version |
| Qualification threshold governance | Human confirmation | Owner/approvers/evidence role | Appointment/RBAC/procedure detail |
| Threshold | Future `XFR-D-034` version | No value selected | Comparator, value, unit, precision, tolerance |
| Evidence | `XFR-D-045`, Evaluation cluster | Categories/principles only | `XFR-F1`, data, metrics, statistics, results, verdict |
| Segment policy | `XFR-D-042` | Independence preserved | Actual segment thresholds/applicability |
| Policy/runtime/production | Controlled artifacts and gates | No authorization | All exact contents |

## 5. Что остаётся `OPEN`

- measurable mutual-fit definition and exact relationship among Tenant Fit, Owner Fit, Reciprocal Fit, Deal Feasibility and Match Score;
- Mutual Aggregate function, formula, direction, scale, normalization and one-sided penalty;
- threshold semantic, comparator, numeric value, unit, range, precision, rounding, tolerance and boundary equality;
- global/segment/intersection/Campaign/temporal applicability and fallback/cascade behavior;
- `XFR-F1` metric-family content, numerator, denominator, counting unit, baseline, target, sample/split, confidence interval, window, statistical test and uncertainty method;
- dataset, labels, evaluation run, evidence package, results, verdict and production-data applicability;
- policy/manifest approval, appointments/RBAC/quorum/appeal;
- schema/API/DB/event/carrier, monitoring, rollout, runtime and implementation.

## 6. Rationale

The source requires sufficient mutual fit while deliberately leaving both the measurable object and threshold open. Assigning decision authority and evidence discipline prevents a scoring implementation or conventional percentage from silently becoming Qualification policy, while preserving the cross-functional evidence needed for a later defensible value.

## 7. Adversarial cases

1. A Match Score cutoff is reused as mutual-fit threshold — rejected; objects are distinct.
2. A high Tenant Fit hides weak Owner Fit — rejected by source non-compensation.
3. Confidence or completeness compensates for mutual-fit insufficiency — rejected.
4. Ranking minimum quality or pilot KPI is imported as threshold — rejected as surrogate.
5. Missing threshold becomes zero, rejection or review route — rejected by affected-progression fail closed.
6. Tuning data is reused as final evidence — rejected.
7. Synthetic-only evidence creates production approval — rejected under `XFR-D-046`.
8. Scoring owner, evidence team or implementation chooses the value alone — rejected without full decision authority.

## 8. Future separate sync only

- Qualification Policy may later receive the approved role/status/qualitative overlay for row 5.
- Scoring Policy may later reflect only that `MSP-05` remains secondary/out-of-scope for threshold ownership.
- Inventory may later record decision provenance without changing identities/counts.
- Evaluation Plan requires a separately approved revision to create actual `XFR-F1` content.

No sync is performed by this record. Qualification, Scoring and Evaluation Policies, Inventory, Feature/Risk/Safe Presentation Policies, Data Contracts, manifests, sibling records, runtime and code remain untouched.

## 9. Change control

Any change to roles, placement, evidence prerequisites, non-compensation, fail-closed handling, dependencies or no-automatic-action requires a new versioned record with `supersedes`, approved by `Chief AI Architect + PRODUCT + LEGAL + AI + DEVELOPMENT` on the same version/hash. Exact threshold/data/policy/runtime decisions require separate evidence-backed approval.

## 10. Gate impact

`NONE`.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

No Proposal, Policy, Data Contract, dataset/run/result, production-data use, manifest, runtime, release or implementation is approved.

## 11. Acceptance criteria

1. Roles are exactly owner `Chief AI Architect + PRODUCT`, approvers `LEGAL + AI + DEVELOPMENT`, evidence owner `AI + DEVELOPMENT` without unilateral authority.
2. `MQP-05 → XFR-D-034` remains primary; `MSP-05 → XFR-D-034` remains secondary; 102/90 counts are unchanged.
3. No mutual-fit function, comparator, threshold value, unit, tolerance, metric, dataset or statistic is approved.
4. Mutual fit, Confidence and completeness remain separate, non-compensating evidence families.
5. Missing or incompatible decision material blocks only affected progression without guessed value or automatic route.
6. `XFR-D-035/036`, `XFR-D-M2`, `XFR-D-021/022/033/042/045/046/061/063` and Evaluation prerequisites remain independent.
7. Evidence cannot automatically change policy, scoring, routing, production, runtime or gates.
8. All three governance gates remain `BLOCKED`.

## 12. Итог

`XFR-D-034 PARTIALLY_RESOLVED_BOUNDARY — GOVERNANCE, QUALIFICATION-ONLY PLACEMENT, EVIDENCE PREREQUISITES, NON-COMPENSATION, NO-SURROGATE/NO-DEFAULT, FAIL-CLOSED AND NO-AUTOMATIC-ACTION APPROVED; MUTUAL-FIT OBJECT, FUNCTION, COMPARATOR, NUMERIC THRESHOLD, XFR-F1, DATA, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
