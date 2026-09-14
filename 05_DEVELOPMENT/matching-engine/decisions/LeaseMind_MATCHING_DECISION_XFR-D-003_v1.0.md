# LeaseMind Matching Decision Record — XFR-D-003

**Decision ID:** `XFR-D-003`

**Название:** Rent-rate derived calculation/comparison representation governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-10

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE CALCULATION/COMPARISON REPRESENTATION BOUNDARY — EXACT DERIVED TYPE, SCALE, PRECISION, ROUNDING, CHECKPOINTS, EQUALITY, TOLERANCE, CONVERSION, SERIALIZATION, EDGE/DOMAIN BEHAVIOR, CARRIER, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-10

**Repository baseline:** `84e858a4839f46d02c4ce9b151f9247b4acdef4d`

**Canonical identity:** `FS-04 → XFR-D-003`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative governance, semantic-preservation and affected-calculation fail-closed boundary for a future explicit representation contract governing only derived `effective_rate` calculation and comparison. No numeric representation, scale, precision, rounding, tolerance, conversion, serialization, schema, carrier, runtime or implementation is selected here.

**Governance owner:** `DEVELOPMENT + AI` — human-approved assignment derived from the Feature Schema §10 row 4 candidate; it is not claimed as `SOURCE_NORMATIVE`.

**Feature Schema artifact owner:** `PRODUCT + LEGAL + AI`; artifact ownership remains separate from decision-specific governance.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `DEVELOPMENT + AI`; this role may prepare candidate contracts, compatibility analysis and evidence, but has no unilateral authority to select representation content, approve evidence sufficiency, authorize runtime/production/implementation or pass a gate.

**Depends on and preserves:** `XFR-D-013`, `XFR-D-015`, `XFR-D-020`, `XFR-D-023` and `XFR-D-M4` remain independent. Raw `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` field types, units, validation ranges and dual-maximum product semantics remain source-owned and unchanged.

---

## 1. Вопрос

Какой governance boundary должен действовать до утверждения exact decimal precision/rounding для `rent_rate_fit`, где `effective_rate = property_monthly_rent_rub ÷ property_area_sqm` сравнивается с `request_monthly_rent_rate_max_rub_per_sqm`?

## 2. Source/status discipline

1. Inventory §4.1 indexes `FS-04 → XFR-D-003`, `PRIMARY_STANDALONE`; Inventory indexing is not substantive approval.
2. Feature Schema §5.1 row 4 defines the candidate derivation and comparison direction, while §5.2 and §10 row 4 leave exact decimal precision/rounding `BLOCKED_PENDING_DECISION`.
3. `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` source fields remain distinct: `property_monthly_rent_rub` is integer rubles/month, `property_area_sqm` is the source area field, and the request rate maximum is decimal rubles/m²/month. This record does not change any raw type, scale, unit or validation rule.
4. CTA §8.4.8 behavior that calculates total request budget with `round(request rate × request maximum area)` belongs to form/bootstrap logic. It is not imported in reverse as the `effective_rate` division or comparison representation rule.
5. Feature Schema remains a Proposal and does not authorize implementation. Its candidate text, a conventional numeric type, library/database behavior or existing code cannot silently fill the open contract.
6. Architecture deterministic/version/hash requirements and `XFR-D-020` provide broader representation/replay safeguards but do not resolve this feature-specific question.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `DEVELOPMENT + AI`, human-approved from the candidate assignment and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`.
3. Feature Schema artifact owner remains `PRODUCT + LEGAL + AI`.
4. Evidence/technical-procedure owner is `DEVELOPMENT + AI`, without unilateral authority.
5. Any future exact contract requires all five functions to approve the same immutable version/hash and applicable evidence package.

### 3.2. Narrow governed object

1. This boundary applies only to representation of derived `effective_rate` calculation and its comparison with the separately attributable request rate maximum.
2. It does not redefine either raw source field, its type, scale, unit, validation or ownership.
3. It does not select a Feature Fit value, Hard Constraint result, Eligibility/Qualification outcome, score, Risk, ranking, route or user-facing presentation.
4. The product rule that rate maximum and total budget maximum both apply remains unchanged; neither substitutes for the other.
5. `XFR-D-013` operating-expenses-basis mismatch remains independent and can block the comparison before any numeric representation question is reached.

### 3.3. Future explicit representation contract

Any future candidate contract must be closed, explicit, immutable, versioned and hash-bound for its stated scope. The exact same applicable contract version/hash must be attributable at both:

1. the `effective_rate` calculation checkpoint; and
2. the subsequent comparison checkpoint.

No platform, programming-language, compiler, numeric-library, serializer, database or deployment default may supply omitted behavior. A calculation produced under one contract version/hash cannot be compared as though produced under another.

This requirement is a prerequisite for future review, not approval of any particular contract.

### 3.4. Semantic-preservation boundary

1. Representation is a carrier of already defined source semantics, not authority to invent a new price meaning.
2. Division/comparison must not silently change units, sign, direction, source attribution, applicability or the rule that both maxima apply.
3. The maximum budget/rate ceiling does not express a preference that a cheaper object is better.
4. Missing, unknown or inapplicable input cannot become zero, neutral, negative, `PASS`, `FAIL`, inferred rate or default rate.
5. Representation cannot absorb or override operating-expenses basis, `value_state`, evidence, processing eligibility, Qualification, Risk, scoring or ranking decisions.

### 3.5. Fail-closed affected-calculation-only boundary

If the approved compatible representation contract or its exact version/hash is missing, unknown, stale, incomplete, conflicting or incompatible:

1. only the affected derived calculation/comparison is blocked;
2. no platform/library/database default or previous-version behavior is selected;
3. no `PASS`, `FAIL`, zero, negative fact, rejection, automatic `INELIGIBLE`, score, rank, Risk, Qualification result, route, reason or display is created;
4. unrelated inputs, constraints and governed uses are not automatically blocked;
5. exact retry, recovery, error, escalation, observability and cascade behavior remains `OPEN`.

Fail closed here is not a business verdict or implementation specification.

### 3.6. Partial, never full resolution

`XFR-D-003` receives `PARTIALLY_RESOLVED_BOUNDARY`: roles, narrow calculation/comparison scope, explicit immutable version/hash discipline at both checkpoints, semantic preservation, no-default rule and affected-calculation-only fail-closed handling are approved qualitatively.

Every exact representation and operational content remains `OPEN`. This record cannot be cited as a complete solution of Feature Schema §10 row 4.

### 3.7. Independent boundaries preserved

1. `XFR-D-013` preserves the operating-expenses-basis mismatch/`UNKNOWN` boundary.
2. `XFR-D-015` preserves independent value/evidence/processing axes and their still-open runtime representation.
3. `XFR-D-020` preserves scoring-wide numeric representation governance; it does not select this feature-specific contract, and this record does not select the scoring-wide contract.
4. `XFR-D-023` preserves prospective version/change and historical-result rules.
5. `XFR-D-M4` preserves every bounded probabilistic replay tolerance question; it is not a default comparison tolerance here.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-04 → XFR-D-003`, `PRIMARY_STANDALONE`, unchanged | Future Inventory status overlay |
| Governance | `DEVELOPMENT + AI`; approvers `Chief AI Architect + PRODUCT + LEGAL` | Role split, not source-normative | Actual future content verdict |
| Feature artifact | `PRODUCT + LEGAL + AI` | No artifact approval | Proposal/policy approval |
| Raw fields/product semantics | CTA | No change | None inferred here |
| Derived calculation/comparison | Future jointly approved contract | Qualitative contract discipline | All exact numeric/serialization/edge behavior |
| Evidence/technical procedure | `DEVELOPMENT + AI` | Preparation role, no unilateral authority | Exact tests, vectors, data and sufficiency verdict |
| Runtime/production/gates | Separate controlled authorities | No authorization | Every carrier, implementation, release and gate transition |

## 5. Обязательные non-conflations

1. Raw field type/scale ≠ derived `effective_rate` representation.
2. CTA `round(rate × area)` form behavior ≠ reverse-imported division/rounding rule.
3. Derived calculation representation ≠ Feature Fit, score, Risk, ranking, Eligibility or Qualification policy.
4. Maximum/ceiling ≠ cheaper-is-better preference.
5. `XFR-D-003` ≠ scoring-wide `XFR-D-020` or bounded replay `XFR-D-M4`.
6. Version/hash presence ≠ approved numeric content or evidence sufficiency.
7. Evidence/technical ownership ≠ unilateral approval.
8. Missing/incompatible contract ≠ zero, negative fact, failure or rejection.
9. Inventory indexing or Feature Schema Proposal text ≠ substantive implementation authority.

## 6. Что остаётся `OPEN`

- exact derived numeric type and representation;
- scale, precision and intermediate precision;
- rounding mode and every rounding checkpoint;
- calculation/comparison checkpoints beyond the qualitative two-checkpoint binding requirement;
- equality, ordering and tolerance rules;
- conversions, quantization, unit transformation and serialization;
- zero/negative/overflow/underflow/`NaN`/infinity/division/domain and other edge behavior;
- error/status taxonomy, retry/recovery/escalation/observability and cascade granularity;
- schema/API/event/DB/storage/transport/runtime carrier and compatibility/migration;
- exact vectors, dataset, metrics, statistics, evidence procedure and sufficiency verdict;
- Feature Schema/Policy/Data Contracts/manifest/runtime/production/implementation approval and every gate transition.

## 7. Rationale

The source documents define the raw values, unit intent and qualitative comparison, but intentionally leave representation and rounding open because boundary results can differ under silent defaults. A narrow governance boundary prevents implementation convenience or CTA form behavior from becoming accidental Matching semantics while retaining the ability to choose a fully evidenced contract later.

## 8. Adversarial cases

1. **A developer uses the language default decimal/float type.** Rejected: no platform/language/library default is approved.
2. **CTA `round(rate × area)` is inverted to define `rent ÷ area`.** Rejected: the form rule is not this derived contract.
3. **Calculation uses one version and comparison another.** Rejected: both checkpoints must be attributable to the same approved version/hash.
4. **A missing contract produces zero or `FAIL`.** Rejected: affected calculation blocks without numeric/business coercion.
5. **A lower headroom or lower price is rewarded.** Rejected: a ceiling does not express cheaper-is-better preference.
6. **A representation choice resolves OPEX mismatch.** Rejected: `XFR-D-013` remains independent.
7. **A successful replay approves production.** Rejected: evidence does not approve policy, runtime, production or a gate.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` may later receive a status overlay that preserves all exact content `OPEN`.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` may later record `PARTIALLY_RESOLVED_BOUNDARY` without changing canonical identity or counts.
- No Proposal, Policy, Data Contract, dataset, evaluation artifact, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Feature Schema, Inventory, Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to this qualitative boundary requires a new versioned `XFR-D-003` record with `supersedes`, approved by all five functions on the same immutable version/hash: `DEVELOPMENT + AI` and `Chief AI Architect + PRODUCT + LEGAL`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record does not approve any Proposal, Feature Schema, Policy, Data Contract, dataset, evaluation run, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity remains `FS-04 → XFR-D-003`, `PRIMARY_STANDALONE`, with counts 102/90 unchanged.
2. Owner is `DEVELOPMENT + AI`, candidate-derived and not `SOURCE_NORMATIVE`; approvers are `Chief AI Architect + PRODUCT + LEGAL`; evidence/technical ownership has no unilateral authority.
3. Only derived `effective_rate` calculation/comparison representation is governed; raw CTA field types/scales remain unchanged.
4. CTA `round(rate × area)` is not imported as a reverse calculation rule.
5. A future contract is explicit, immutable, version/hash-bound and attributable identically at calculation and comparison checkpoints.
6. No platform/language/library/database default is accepted.
7. Missing/incompatible contract blocks only the affected calculation without `PASS`/`FAIL`, zero, negative fact, rejection, `INELIGIBLE`, score or route.
8. Every exact numeric, serialization, edge, carrier and runtime detail remains `OPEN`.
9. `XFR-D-013`, `XFR-D-015`, `XFR-D-020`, `XFR-D-023` and `XFR-D-M4` remain independent.
10. All three governance gates remain `BLOCKED`.

## 13. Итог

`XFR-D-003 PARTIALLY_RESOLVED_BOUNDARY — ONLY THE QUALITATIVE, EXPLICIT, IMMUTABLE VERSION/HASH-BOUND REPRESENTATION DISCIPLINE FOR DERIVED EFFECTIVE_RATE CALCULATION AND COMPARISON IS APPROVED; RAW SOURCE TYPES/SCALES AND CTA PRODUCT SEMANTICS REMAIN UNCHANGED; NO DEFAULT, PASS/FAIL, ZERO, NEGATIVE FACT, REJECTION, INELIGIBLE, SCORE OR ROUTE MAY BE INVENTED; ALL EXACT NUMERIC, SERIALIZATION, EDGE, CARRIER, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN`
