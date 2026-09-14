# LeaseMind Matching Decision Record — XFR-D-006

**Decision ID:** `XFR-D-006`

**Название:** Deal-priority placement and non-conflation governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-10

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_QUALITATIVE_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE RANKING-MODIFIER-ONLY CANDIDATE BOUNDARY — ACTIVATION, ALGORITHM, SIGN, DIRECTION, WEIGHT, NORMALIZATION, ORDER, PRECEDENCE, TIE-BREAK, CANDIDATE SET, FALLBACK AND RUNTIME CARRIER REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-10

**Repository baseline:** `84e858a4839f46d02c4ce9b151f9247b4acdef4d`

**Canonical identity:** `FS-08 → XFR-D-006`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative placement boundary for the two separately attributable `deal_priority` source values and any future derived ranking-modifier candidate. No algorithm, direction, ordering, routing, disclosure, schema, carrier, runtime or implementation is approved.

**Governance owner:** `AI + PRODUCT` — human-approved assignment derived from Feature Schema §10 row 8; it is not claimed as `SOURCE_NORMATIVE`.

**Feature Schema artifact owner:** `PRODUCT + LEGAL + AI`; artifact ownership remains separate from decision-specific governance.

**Mandatory approvers:** `Chief AI Architect + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare candidate algorithms and evidence only and has no unilateral authority to activate a modifier, select content, approve production/runtime/implementation or pass a gate.

**Depends on and preserves:** `XFR-D-021` remains the independent ranking/diversification policy authority. `XFR-D-024 v1.1` remains the independent Priority Score boundary, whose only qualitative inputs are Match Score, Confidence Score and Risk Score. All Feature/Scoring/Risk/Qualification/Safe Presentation authorities remain independent.

---

## 1. Вопрос

Где может находиться `deal_priority`: в Dimension/Match Score или только как separately governed ranking modifier?

## 2. Source/status discipline

1. Inventory §4.1 indexes `FS-08 → XFR-D-006`, `PRIMARY_STANDALONE`; indexing is not substantive approval.
2. CTA §10 maps `property_deal_priority` and `request_deal_priority` separately into each side's `strategy_preferences.deal_priority` and states that strategy preferences are a confirmed Campaign-management priority, not a Candidate filter.
3. Feature Schema §6.3 classifies `deal_priority` only as a `RANKING_ONLY_CANDIDATE` for the Rank & Diversify stage and leaves final placement to row 8.
4. The two source values remain separately attributable; their shared enum/type name does not merge, overwrite, reconcile or infer one from the other.
5. Feature Schema is a Proposal and does not activate a feature, policy, algorithm or runtime.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `AI + PRODUCT`, human-approved from the candidate assignment and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `Chief AI Architect + LEGAL + DEVELOPMENT`.
3. Feature Schema artifact owner remains `PRODUCT + LEGAL + AI`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Any future activation/content decision requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. Separate source attribution

1. `property_deal_priority` and `request_deal_priority` remain separate source-owned values attached to their respective Campaign sides.
2. Neither value overwrites, merges with, substitutes for or is inferred from the other.
3. A missing value on one side is not copied from the other, guessed, defaulted or treated as agreement/disagreement.
4. Any future derived value must retain both source identities, revisions and provenance separately; exact derivation remains `OPEN`.

### 3.3. Ranking-modifier-only candidate placement

1. A future `deal_priority` use may be considered only as a separately attributable ranking-modifier candidate under `XFR-D-021`.
2. `deal_priority` is never a Dimension Score or Match Score input.
3. It is never a Hard Constraint, Eligibility, Risk, Confidence, Qualification or Priority Score input.
4. It creates no automatic ordering, routing, rejection, disclosure or Campaign-state change.
5. This qualitative placement does not activate the candidate or select its algorithm, sign, direction, weight, normalization, precedence, tie-break, candidate set, fallback or carrier.

### 3.4. Priority Score independence

1. `XFR-D-024 v1.1` keeps Priority Score optional and limited qualitatively to separately authoritative Match Score, Confidence Score and Risk Score.
2. `deal_priority` cannot be introduced into Priority Score by analogy, naming, convenience, correlation or ranking intent.
3. Priority Score cannot be used as a bridge to import `deal_priority` into scoring, Risk, Confidence, Qualification or Eligibility.

### 3.5. Missing/incompatible handling

Missing, unknown, stale, conflicting, version-incompatible or unauthorised source material:

1. creates no guessed value, merge or fallback;
2. creates no automatic order, route, rejection, disclosure, Campaign transition, score, Risk, Confidence, Qualification or Eligibility outcome;
3. blocks only the affected future modifier use if such use is ever separately approved;
4. leaves exact status, fallback, recovery, escalation and runtime behavior `OPEN`.

### 3.6. Resolved qualitative boundary, exact contents still open

`XFR-D-006` receives `RESOLVED_QUALITATIVE_BOUNDARY`: source-side separation, ranking-modifier-only candidate placement and all prohibited conflations/actions are qualitatively settled.

Activation and every algorithmic, numeric, ordering, data, carrier, runtime, production and implementation detail remain `OPEN`. Qualitative resolution is not implementation readiness.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-08 → XFR-D-006`, `PRIMARY_STANDALONE`, unchanged | Future Inventory status overlay |
| Governance | `AI + PRODUCT`; approvers `Chief AI Architect + LEGAL + DEVELOPMENT` | Role split and qualitative placement | Actual future content verdict |
| Feature artifact | `PRODUCT + LEGAL + AI` | No artifact approval | Proposal/policy approval |
| Source values | CTA Property/TenantRequest mappings | Separate attribution preserved | Any future derived representation |
| Ranking/diversification | `XFR-D-021` | Candidate-only placement, no activation | Algorithm, ordering, tie-break, candidate set and fallback |
| Priority Score | `XFR-D-024 v1.1` | Explicit exclusion | Its independent open contents |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation role, no unilateral authority | Exact evidence and sufficiency verdict |
| Runtime/production/gates | Separate controlled authorities | No authorization | Carrier, implementation, release and gates |

## 5. Обязательные non-conflations

1. Property `deal_priority` ≠ TenantRequest `deal_priority`.
2. Shared enum/type ≠ merged, symmetric or reconciled value.
3. Ranking-modifier candidate ≠ Dimension Score or Match Score input.
4. Ranking modifier ≠ Hard Constraint, Eligibility, Risk, Confidence or Qualification.
5. `deal_priority` ≠ Priority Score input under `XFR-D-024 v1.1`.
6. Candidate placement ≠ activation, ordering, routing or Campaign transition.
7. Evidence/technical ownership ≠ unilateral approval.
8. Feature Schema/Inventory text ≠ runtime or implementation authority.

## 6. Что остаётся `OPEN`

- whether and when the candidate is activated;
- exact algorithm, derivation and attribution representation;
- sign, direction, weight, normalization and scale;
- order, precedence, tie-break and interaction with other ranking considerations;
- candidate-set construction/filtering and applicability scope;
- missing/conflict fallback, recovery and escalation;
- runtime schema/API/event/DB/storage/transport carrier and RBAC;
- exact dataset, metrics, statistics, evidence procedure and sufficiency verdict;
- ranking/diversification Policy, Feature Schema, Data Contracts, manifest, production, runtime, implementation and every gate transition.

## 7. Rationale

The product source intentionally separates strategy preference from Candidate filtering, and the Feature Schema places the field outside score arithmetic. The approved boundary prevents a business-process preference from acquiring score, eligibility or legal authority while leaving all actual ranking design subject to the independent `XFR-D-021` process.

## 8. Adversarial cases

1. **The two values are merged into one “shared priority”.** Rejected: both sources remain separately attributable.
2. **One missing side inherits the other value.** Rejected: no copy, guess or default is approved.
3. **The field enters Match Score because ranking uses scores.** Rejected: ranking-modifier-only placement does not make it score input.
4. **The field enters Priority Score.** Rejected: `XFR-D-024 v1.1` permits only Match, Confidence and Risk inputs.
5. **A high priority overrides a Hard Constraint or Qualification result.** Rejected.
6. **Enum order becomes ranking order.** Rejected: direction, order and precedence remain `OPEN`.
7. **A ranking result changes Campaign state or disclosure automatically.** Rejected: no automatic action is approved.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` may later receive a status overlay that preserves activation and exact contents `OPEN`.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` may later record `RESOLVED_QUALITATIVE_BOUNDARY` without changing canonical identity or counts.
- No Proposal, Policy, Data Contract, dataset, evaluation artifact, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Feature Schema, Inventory, Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to source-side separation, ranking-modifier-only placement, prohibited uses/actions or the role split requires a new versioned `XFR-D-006` record with `supersedes`, approved by all five functions on the same immutable version/hash: `AI + PRODUCT` and `Chief AI Architect + LEGAL + DEVELOPMENT`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record does not approve any Proposal, Feature Schema, Policy, Data Contract, dataset, evaluation run, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity remains `FS-08 → XFR-D-006`, `PRIMARY_STANDALONE`, with counts 102/90 unchanged.
2. Owner is `AI + PRODUCT`, candidate-derived and not `SOURCE_NORMATIVE`; approvers are `Chief AI Architect + LEGAL + DEVELOPMENT`; evidence/technical ownership has no unilateral authority.
3. Property and TenantRequest values remain separately attributable without merge, overwrite or inference.
4. Future use is only a separately attributable ranking-modifier candidate under `XFR-D-021`.
5. No Dimension/Match Score, Hard Constraint, Eligibility, Risk, Confidence, Qualification or Priority Score use is permitted.
6. No automatic ordering, route, rejection, disclosure or Campaign change follows.
7. Activation, algorithm, sign/direction, weight, normalization, ordering, precedence, tie-break, candidate set, fallback and carrier remain `OPEN`.
8. `XFR-D-021` and `XFR-D-024 v1.1` remain independent.
9. All three governance gates remain `BLOCKED`.

## 13. Итог

`XFR-D-006 RESOLVED_QUALITATIVE_BOUNDARY — PROPERTY_DEAL_PRIORITY AND REQUEST_DEAL_PRIORITY REMAIN SEPARATELY ATTRIBUTABLE SOURCE VALUES; ANY FUTURE USE IS ONLY A SEPARATELY GOVERNED RANKING-MODIFIER CANDIDATE UNDER XFR-D-021, NEVER SCORE, HARD CONSTRAINT, ELIGIBILITY, RISK, CONFIDENCE, QUALIFICATION OR PRIORITY SCORE INPUT; NO AUTOMATIC ORDERING, ROUTE, REJECTION, DISCLOSURE OR CAMPAIGN CHANGE IS APPROVED; ALL ACTIVATION, ALGORITHM, ORDERING, FALLBACK, CARRIER, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN`
