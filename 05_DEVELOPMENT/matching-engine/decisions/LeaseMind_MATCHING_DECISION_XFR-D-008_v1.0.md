# LeaseMind Matching Decision Record — XFR-D-008

**Decision ID:** `XFR-D-008`

**Название:** Budget-headroom v0.1 exclusion and future re-entry governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-10

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_V0_1_SCOPE_BOUNDARY`

**Статус:** `APPROVED V0.1 SCOPE EXCLUSION — DERIVED BUDGET_HEADROOM IS EXCLUDED FROM EVERY V0.1 FIT, SCORE, RANK, FILTER, HARD CONSTRAINT, ELIGIBILITY, RISK, CONFIDENCE AND QUALIFICATION USE; FUTURE RE-ENTRY AND EXACT DIRECTION/FORMULA/NORMALIZATION/THRESHOLD REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-10

**Repository baseline:** `84e858a4839f46d02c4ce9b151f9247b4acdef4d`

**Canonical identity:** `FS-10 → XFR-D-008`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** v0.1 composition boundary for derived `budget_headroom` only. Raw rent/budget fields and existing `budget_fit`/`rent_rate_fit` candidate semantics remain unchanged. No future formula, direction, normalization, threshold, schema, carrier, runtime or implementation is approved.

**Governance owner:** `PRODUCT + AI` — human-approved assignment derived from Feature Schema §10 row 10; it is not claimed as `SOURCE_NORMATIVE`.

**Feature Schema artifact owner:** `PRODUCT + LEGAL + AI`; artifact ownership remains separate from decision-specific governance.

**Mandatory approvers:** `Chief AI Architect + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare future candidate analysis and evidence only and has no unilateral authority to reintroduce the signal, approve content/runtime/production/implementation or pass a gate.

**Depends on and preserves:** CTA raw rent/budget fields and both-maximum product rule; Feature Schema `budget_fit` and `rent_rate_fit`; `XFR-D-003` representation boundary; `XFR-D-013` operating-expenses mismatch rule; `XFR-D-015` value/evidence/processing axes; all Scoring, Risk, Qualification and ranking authorities.

---

## 1. Вопрос

Должен ли derived `budget_headroom` участвовать в v0.1, и если да, какое направление/форма зависимости допустимы, когда TenantRequest выражает максимальный бюджет, а не целевую цену?

## 2. Source/status discipline

1. Inventory §4.1 indexes `FS-10 → XFR-D-008`, `PRIMARY_STANDALONE`; Inventory is not substantive approval.
2. Feature Schema §6.4 calls `budget_headroom` a diagnostic/evaluation candidate, not an approved monotonic Feature Fit, because the request expresses only a ceiling and direction is `NOT_EXPRESSED`.
3. CTA preserves raw `property_monthly_rent_rub`, `request_monthly_budget_max_rub`, optional request rate maximum and both operating-expenses-basis flags. It also requires total-budget maximum and rate maximum to apply together when both exist.
4. A maximum expresses admissibility ceiling semantics; it does not source-normatively state that cheaper is better.
5. Feature Schema remains a Proposal and cannot activate the derived signal, formula or runtime.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `PRODUCT + AI`, human-approved from the candidate assignment and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `Chief AI Architect + LEGAL + DEVELOPMENT`.
3. Feature Schema artifact owner remains `PRODUCT + LEGAL + AI`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Any future re-entry/content decision requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. V0.1 exclusion

Derived `budget_headroom` is `EXCLUDED_FROM_V0_1` for every v0.1 use, including:

1. Feature Fit or Dimension/Match/Priority Score;
2. ranking, ordering or diversification;
3. filter, Hard Constraint or Eligibility;
4. Risk or Confidence;
5. Qualification, routing, rejection or Campaign transition.

The exclusion applies to the derived signal only and does not remove, rename, redefine or invalidate any raw source field.

### 3.3. Source semantics preserved

1. Raw rent/budget/rate fields and their CTA types, units, validation and provenance remain unchanged.
2. Existing `budget_fit` and `rent_rate_fit` candidates remain independent; `budget_headroom` neither replaces nor modifies them.
3. The rule that total budget maximum and rate maximum both apply remains unchanged.
4. `XFR-D-013` remains authoritative for operating-expenses-basis mismatch: absent numeric OPEX amount leaves the applicable comparison `UNKNOWN`/blocked, without `PASS`, `FAIL` or automatic `INELIGIBLE`.
5. The ceiling never becomes a cheaper-is-better preference, monotonic reward or ranking direction.

### 3.4. Absence creates no result

Because `budget_headroom` is excluded from v0.1, its absence or non-production:

1. does not become numeric zero, neutral/default or negative value;
2. does not produce `PASS`, `FAIL`, incompatibility or a Risk/Confidence change;
3. does not create a route, rejection, automatic `INELIGIBLE`, Qualification result, ordering or presentation;
4. does not alter raw inputs or other independently governed comparisons.

### 3.5. Future re-entry

Any future re-entry requires a separate versioned decision record, explicit applicability scope, compatible controlled artifact versions/hashes, evidence and approval by all five functions. Re-entry cannot be inferred from available data, conventional price optimization, implementation convenience, evaluation output, policy sync, code, CI, commit, merge or deployment.

Exact direction, formula, normalization, threshold and every operational detail remain `OPEN`.

### 3.6. Scope resolved, future content not resolved

`XFR-D-008` receives `RESOLVED_V0_1_SCOPE_BOUNDARY`: derived `budget_headroom` is unequivocally excluded from every v0.1 Matching use while raw fields and existing comparisons remain preserved.

This does not resolve or preapprove future re-entry. All future semantic, numeric, policy, data, carrier, runtime, production and implementation content remains `OPEN`.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-10 → XFR-D-008`, `PRIMARY_STANDALONE`, unchanged | Future Inventory status overlay |
| Governance | `PRODUCT + AI`; approvers `Chief AI Architect + LEGAL + DEVELOPMENT` | Role split and v0.1 exclusion | Future re-entry verdict |
| Feature artifact | `PRODUCT + LEGAL + AI` | No artifact approval | Proposal/policy approval |
| Raw rent/budget inputs | CTA | Preserved without change | No new raw fields approved |
| Existing comparisons | Feature Schema, `XFR-D-003`/`013` | Preserved, not modified | Their independent open contents |
| Derived `budget_headroom` | Separate future authority | Excluded from all v0.1 uses | Direction, formula, normalization, threshold and applicability |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation role, no unilateral authority | Exact data/evidence and sufficiency verdict |
| Runtime/production/gates | Separate controlled authorities | No authorization | Carrier, implementation, release and gates |

## 5. Обязательные non-conflations

1. Maximum budget ceiling ≠ cheaper-is-better preference.
2. Raw rent/budget/rate fields ≠ derived `budget_headroom`.
3. `budget_headroom` ≠ `budget_fit` or `rent_rate_fit`.
4. V0.1 exclusion ≠ deletion or invalidation of raw inputs.
5. Absence of an excluded signal ≠ zero, negative fact, `PASS` or `FAIL`.
6. OPEX basis mismatch ≠ headroom and remains governed by `XFR-D-013`.
7. Scope resolution ≠ future formula, re-entry, runtime or implementation approval.
8. Evidence/technical ownership ≠ unilateral approval.

## 6. Что остаётся `OPEN`

- whether any post-v0.1 re-entry is permitted and its exact scope;
- semantic direction and whether a monotonic relationship exists;
- exact formula, inputs, unit, scale, range and sign;
- normalization, clipping, thresholds, ordering and interaction with other signals;
- missing/unknown/OPEX handling beyond preserved independent boundaries;
- schema/API/event/DB/storage/transport/runtime carrier and migration;
- exact dataset, metrics, statistics, evidence procedure and sufficiency verdict;
- Feature Schema/Scoring/Risk/Qualification/ranking policy, Data Contracts, manifest, production, runtime, implementation and every gate transition.

## 7. Rationale

A tenant's ceiling establishes an upper bound, not a preference curve. Excluding the derived signal from v0.1 avoids inventing a cheaper-is-better assumption while preserving the source fields and the two actual maximum checks required by product semantics. Future use remains possible only through an explicit, evidence-backed decision.

## 8. Adversarial cases

1. **Unused budget is scored positively because it is “headroom”.** Rejected: no cheaper-is-better direction is expressed.
2. **Excluded headroom removes the raw budget or rent.** Rejected: only the derived signal is excluded.
3. **Headroom replaces `budget_fit` or `rent_rate_fit`.** Rejected: both comparisons and both-max rule remain intact.
4. **Missing headroom becomes zero or `FAIL`.** Rejected: exclusion produces no derived result.
5. **OPEX mismatch is ignored because the rent is below the ceiling.** Rejected: `XFR-D-013` remains independent.
6. **An evaluation correlation automatically reintroduces the feature.** Rejected: a separate versioned decision and approval are required.
7. **The field is used only in ranking, so exclusion does not apply.** Rejected: exclusion covers every v0.1 fit/score/rank/filter/Risk/Confidence/Qualification use.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` may later receive a status overlay recording `EXCLUDED_FROM_V0_1` while preserving future content `OPEN`.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` may later record `RESOLVED_V0_1_SCOPE_BOUNDARY` without changing canonical identity or counts.
- No Proposal, Policy, Data Contract, dataset, evaluation artifact, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Feature Schema, Inventory, Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to v0.1 exclusion, raw-field preservation, cheaper-is-better prohibition or role split requires a new versioned `XFR-D-008` record with `supersedes`, approved by all five functions on the same immutable version/hash: `PRODUCT + AI` and `Chief AI Architect + LEGAL + DEVELOPMENT`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record does not approve any Proposal, Feature Schema, Policy, Data Contract, dataset, evaluation run, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity remains `FS-10 → XFR-D-008`, `PRIMARY_STANDALONE`, with counts 102/90 unchanged.
2. Owner is `PRODUCT + AI`, candidate-derived and not `SOURCE_NORMATIVE`; approvers are `Chief AI Architect + LEGAL + DEVELOPMENT`; evidence/technical ownership has no unilateral authority.
3. Derived `budget_headroom` is excluded from every v0.1 fit, score, rank, filter, Hard Constraint, Eligibility, Risk, Confidence and Qualification use.
4. Raw rent/budget fields, `budget_fit`, `rent_rate_fit` and the both-max rule remain unchanged.
5. `XFR-D-013` OPEX `UNKNOWN` boundary remains independent.
6. A ceiling never becomes cheaper-is-better preference.
7. Absence creates no zero/negative/`PASS`/`FAIL`/Risk/route/rejection.
8. Future re-entry and exact direction/formula/normalization/threshold remain `OPEN`.
9. All three governance gates remain `BLOCKED`.

## 13. Итог

`XFR-D-008 RESOLVED_V0_1_SCOPE_BOUNDARY — DERIVED BUDGET_HEADROOM IS EXCLUDED_FROM_V0_1 FOR EVERY FIT, SCORE, RANK, FILTER, HARD CONSTRAINT, ELIGIBILITY, RISK, CONFIDENCE AND QUALIFICATION USE; RAW RENT/BUDGET FIELDS, BUDGET_FIT, RENT_RATE_FIT, BOTH-MAX AND XFR-D-013 OPEX-UNKNOWN BOUNDARIES REMAIN UNCHANGED; A CEILING DOES NOT EXPRESS CHEAPER-IS-BETTER; ABSENCE CREATES NO RESULT; FUTURE RE-ENTRY AND ALL EXACT CONTENT REMAIN OPEN`
