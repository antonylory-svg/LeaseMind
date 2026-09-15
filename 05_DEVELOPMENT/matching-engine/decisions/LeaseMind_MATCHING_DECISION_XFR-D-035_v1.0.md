# LeaseMind Matching Decision Record — XFR-D-035

**Decision ID:** `XFR-D-035`

**Название:** Qualification Confidence threshold governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-15

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE, CONFIDENCE-SEPARATION, EVIDENCE-PREREQUISITE AND FAIL-CLOSED BOUNDARY — CONFIDENCE DEFINITION, CALIBRATION, COMPARATOR, NUMERIC CUTOFF, DATA, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation on 2026-09-15.

**Repository baseline:** `ac2f02738c5949e0c234c81bcaefa4693504314f`

**Scope:** governance ownership and qualitative evidence boundary for a future acceptable Confidence Score cutoff used only by the Matching Qualification Gate. This record does not define Confidence Score, approve its calibration, select a comparator or value, create bands/statuses, or authorize a dataset, policy, production use, route, runtime carrier, or implementation.

**Canonical identity:** `MQP-06 → XFR-D-035`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.4). The crosswalk and Inventory counts (102 source keys / 90 canonical IDs) remain unchanged.

**Governance owner:** `Chief AI Architect + PRODUCT` — human-approved decision-specific assignment derived from the approved Qualification Policy artifact-owner boundary, not `SOURCE_NORMATIVE` for the numeric cutoff.

**Mandatory approvers:** `LEGAL + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT` under a future separately approved `MATCHING_EVALUATION_PLAN` procedure, without unilateral authority to approve Confidence semantics, calibration, cutoff, routing, policy, production applicability, or implementation.

**Depends on:** `XFR-D-045 v1.0` and documented `XFR-F1`; applicable `XFR-D-057 v1.0`, active `XFR-D-058 v1.1`, active `XFR-D-059 v1.1`, `XFR-D-060 v1.0`, and `XFR-D-062 v1.0`–`XFR-D-071 v1.0` remain independent evidence prerequisites. `XFR-D-019`, `XFR-D-034`, `XFR-D-036`, `XFR-D-M1`, `XFR-D-M6`, `XFR-D-033`, `XFR-D-038`, `XFR-D-039`, `XFR-D-042`, `XFR-D-045`, `XFR-D-046`, `XFR-D-063`, `XFR-D-069`, and Risk thresholds remain independent.

---

## 1. Вопрос

Кто владеет будущим numerical Confidence threshold для Matching Qualification Gate и какие semantic, evidence, non-compensation and fail-closed boundaries обязательны до отдельно утверждённых Confidence definition/calibration, `XFR-F1` content, evidence package и cutoff?

## 2. Source/status discipline

1. Architecture §16 states that Confidence Score describes reliability, not pair attractiveness, and keeps it separate for property profile, demand profile, mutual fit, particular conclusion and whole Match Package. Architecture §18.1 requires only an «acceptable Confidence Score» for Qualification; no cutoff is specified.
2. Qualification Policy §6 row 6 and §10 preserve the qualitative condition as `SOURCE_NORMATIVE`, while numerical threshold remains `OPEN`; §15 row 6 is a candidate assignment without owner.
3. `XFR-D-063 v1.0` governs Confidence Score calibration target/evidence, not the Qualification routing cutoff. Calibration evidence is a prerequisite, never the cutoff itself.
4. `XFR-D-045 v1.0` establishes a separate Confidence-cutoff evidence family and preserves `XFR-F1`, actual definition, data and threshold `OPEN`.
5. Architecture `evidence_status`, Feature Evidence Confidence, `required_evidence_level`, unknown/abstention, Risk Score, Match Score and Qualification result are separate semantic spaces. Similar words or scales create no mapping.
6. Inventory indexes `MQP-06 → XFR-D-035`; it does not provide substantive authority or a value.

## 3. Решение

### 3.1. Roles and authority

1. Governance owner — `Chief AI Architect + PRODUCT`.
2. Mandatory approvers — `LEGAL + AI + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, without unilateral approval authority.
4. An actual cutoff requires the full owner/approver set, a new versioned `XFR-D-035` record and immutable evidence references on one compatible version/hash bundle.

### 3.2. Exact semantic separation

The future cutoff may consume only a separately approved overall Confidence Score representation applicable to the Qualification use. It cannot silently consume or derive from:

- categorical Architecture `evidence_status`;
- feature/value Evidence Confidence or `required_evidence_level`;
- model probability, parser/validation confidence or AI self-confidence;
- Match Score, Risk Score, completeness, ranking position or Priority Score;
- `unknown`, `abstention`, review flag, Qualification result or user-facing wording.

No ordering, numeric mapping, bucket, band, severity, status alias or fallback across those spaces is approved.

### 3.3. Calibration is prerequisite, not cutoff

`XFR-D-063` Confidence calibration evidence must be available and compatible before future cutoff approval, but calibration target, goodness-of-fit result, score distribution or conventional operating point does not automatically determine the Qualification cutoff. Exact calibration method and exact cutoff remain separate decisions.

### 3.4. Evidence and non-compensation

Future cutoff evidence preserves `XFR-D-045`: separate Confidence family; baseline-first; immutable frozen manifest; tuning/untouched-final isolation; eligible labels, adjudication, grouping/allocation/correction provenance; uncertainty and calibration reporting; segment/intersection/fairness/legal review; false-eligibility and false-exclusion counter-evidence; synthetic/production separation.

Mutual fit, completeness, low Risk, ranking quality, aggregate performance, a business outcome or high score cannot compensate for insufficient Confidence evidence. Confidence likewise cannot compensate for failure in those independent families.

### 3.5. No surrogate or hidden default

No model probability, midpoint, scale endpoint, percentile, observed distribution, prior-version cutoff, calibration target, pilot KPI, Campaign conversion target, business preference, UI band or implementation default is a surrogate. No value, direction, comparator or equality treatment is selected here.

### 3.6. Fail-closed handling

Missing, unapproved, unmapped, ambiguous, stale, conflicting, incomplete or version-incompatible Confidence definition, calibration, cutoff, evidence or policy binding blocks only affected Qualification progression. It creates no negative fact, zero confidence, guessed band, failed Hard Constraint, automatic `INELIGIBLE`, `REJECTED_BY_MATCHING`, `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED`, `QUALIFIED_HYPOTHESIS`, rank change, or unrelated processing block.

### 3.7. Independent boundaries

- `XFR-D-034` mutual-fit and `XFR-D-036` completeness remain separate non-compensating decisions.
- `XFR-D-019`/`XFR-D-M1`/`XFR-D-M6` keep evidence semantics separate and do not define this cutoff.
- `XFR-D-063` calibration and ranking-target governance remains a prerequisite, not Qualification authority.
- `XFR-D-069` preserves `unknown` versus `abstention`; neither is a Confidence band or Qualification route.
- `XFR-D-033` cause precedence does not choose a cutoff or guessed outcome.
- `XFR-D-038` `STALE` is an orthogonal freshness/actionability state.
- `XFR-D-042` segment policy cannot silently modify the global cutoff.
- Risk thresholds and `XFR-D-M2` remain separately governed by `AI + LEGAL` and cannot be imported.
- `XFR-D-045` and `XFR-D-046` remain evidence prerequisites, not cutoff or production approval.

### 3.8. No automatic action

Evidence, model output, code, CI, documentation, commit or merge cannot automatically select or activate a cutoff, create a band/status, change routing/policy/model/runtime/release, establish production applicability, or advance a gate.

### 3.9. Partial, never fully resolved

`XFR-D-035` receives only `PARTIALLY_RESOLVED_BOUNDARY`: roles, semantic separation, calibration-prerequisite/non-cutoff, evidence requirements, non-compensation, no-surrogate/no-default, affected-progression fail closed, dependencies and no-automatic-action are approved. Confidence definition/calibration, comparator, numeric cutoff and exact downstream content remain `OPEN`.

## 4. Layer/authority table

| Layer | Authority | Resolved here | Remains `OPEN` |
|---|---|---|---|
| Confidence meaning | Architecture §16 | Reliability-not-attractiveness preserved | Formula/representation |
| Qualitative Gate condition | Architecture §18.1 | Acceptable Confidence preserved | Operational cutoff |
| Cutoff governance | Human confirmation | Owner/approvers/evidence role | Appointment/RBAC/process details |
| Calibration | `XFR-D-063` | Prerequisite-not-cutoff boundary | Method, target, result, production applicability |
| Cutoff | Future `XFR-D-035` version | No value selected | Comparator, value, unit, direction, precision, tolerance |
| Evidence | `XFR-D-045`, Evaluation cluster | Categories/principles only | `XFR-F1`, data, metrics, statistics, results, verdict |
| Policy/runtime/production | Controlled artifacts/gates | No authorization | All exact contents |

## 5. Что остаётся `OPEN`

- Confidence Score formula, inputs, range, scale, normalization, direction, aggregation and representation;
- relationship among per-profile/per-fit/per-conclusion/package Confidence and which one is applicable to Qualification;
- calibration definition, metric, target, method, dataset, result and production validity;
- cutoff semantic, comparator, value, unit, direction, equality, range, precision, rounding and tolerance;
- any bucket, band, status, reason, mapping, default, fallback or cascade granularity;
- global/segment/intersection/Campaign/temporal applicability;
- `XFR-F1` content, numerator/denominator/counting unit, baseline, sample/split, confidence interval, window, statistical test and uncertainty method;
- dataset, labels, run, evidence package, result, verdict and production-data applicability;
- policy/manifest approval, appointments/RBAC/quorum/appeal;
- schema/API/DB/event/carrier, monitoring, rollout, runtime and implementation.

## 6. Rationale

The architecture deliberately separates reliability from attractiveness and leaves «acceptable Confidence» numeric meaning open. Without this boundary, model probability, calibration target or UI band could become a hidden Qualification decision. Cross-functional roles and evidence discipline allow later evaluation while preserving honest uncertainty and independent governance.

## 7. Adversarial cases

1. Model probability or AI self-confidence is used as the cutoff — rejected.
2. Feature Evidence Confidence or `evidence_status` is numerically ordered into overall Confidence — rejected.
3. Calibration target is declared the Qualification cutoff — rejected.
4. High Match Score, low Risk or completeness compensates for low/unknown Confidence — rejected.
5. Missing cutoff becomes zero confidence or automatic review/rejection — rejected by fail closed.
6. UI band or prior version becomes fallback — rejected without explicit approval.
7. Synthetic-only evidence creates production applicability — rejected.
8. Evidence team or implementation chooses and activates the cutoff — rejected without full authority.

## 8. Future separate sync only

- Qualification Policy may later receive only the approved role/status/qualitative overlay for row 6.
- Inventory may later record provenance without changing `MQP-06 → XFR-D-035` or counts.
- Evaluation Plan needs a separate approved revision to create `XFR-F1` metric-family content.

No sync is performed by this record. Qualification and Evaluation Policies, Inventory, Feature/Scoring/Risk/Safe Presentation Policies, Data Contracts, manifests, sibling records, runtime and code remain untouched.

## 9. Change control

Any change to roles, semantic separation, calibration boundary, evidence prerequisites, non-compensation, fail-closed handling, dependencies or no-automatic-action requires a new versioned record with `supersedes`, approved by `Chief AI Architect + PRODUCT + LEGAL + AI + DEVELOPMENT` on the same version/hash. Exact cutoff/data/policy/runtime decisions require separate evidence-backed approval.

## 10. Gate impact

`NONE`.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

No Proposal, Policy, Data Contract, dataset/run/result, production-data use, manifest, runtime, release or implementation is approved.

## 11. Acceptance criteria

1. Roles are exactly owner `Chief AI Architect + PRODUCT`, approvers `LEGAL + AI + DEVELOPMENT`, evidence owner `AI + DEVELOPMENT` without unilateral authority.
2. Canonical `MQP-06 → XFR-D-035`, `PRIMARY_STANDALONE`, and 102/90 counts remain unchanged.
3. Confidence remains reliability, not attractiveness; all adjacent evidence/model/score/risk/route spaces remain distinct.
4. Calibration is prerequisite, not cutoff; no comparator, numeric value, band, mapping, dataset or statistic is approved.
5. Mutual-fit, Confidence and completeness remain separate and non-compensating.
6. Missing/incompatible decision material blocks only affected progression without guessed value or route.
7. Named sibling decisions and Evaluation prerequisites remain independent.
8. Evidence cannot automatically change policy, routing, production, runtime or gates.
9. All three governance gates remain `BLOCKED`.

## 12. Итог

`XFR-D-035 PARTIALLY_RESOLVED_BOUNDARY — GOVERNANCE, CONFIDENCE-SEPARATION, CALIBRATION-PREREQUISITE, EVIDENCE, NON-COMPENSATION, NO-SURROGATE/NO-DEFAULT, FAIL-CLOSED AND NO-AUTOMATIC-ACTION APPROVED; CONFIDENCE DEFINITION, CALIBRATION, COMPARATOR, NUMERIC CUTOFF, XFR-F1, DATA, POLICY, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
