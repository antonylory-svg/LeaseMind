# LeaseMind Matching G22 Synthetic Budget-Basis Mismatch Reference Authorization

**Package:** `G22 Synthetic Budget-Basis Mismatch Reference`

**Version:** 1.0

**Authorization date:** 2026-09-25

**Repository baseline:** `2c816f1f4a61159909fb50d7a8f4bfc9e8a082a7`

**Baseline branch:** `development/sprint-7-matching-g22-synthetic-budget-basis-mismatch-reference`

**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Authorization boundary

This record authorizes only the documentation phase for one isolated, manually opened, development-only responsive all-at-once Synthetic Budget-Basis Mismatch Reference. It freezes package version `1.0`, the exact baseline, exact-byte allowlist hash, closed nine-path boundary, exact visible copy, exact region order, the four approved abstract basis combinations, explicit open items, non-computation boundary and future verification requirements.

It does not authorize creation or modification of any path marked `planned`. The code phase remains blocked until these three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes it.

This package is non-canonical: it creates no `XFR` ID, changes no canonical identity count, requires no Inventory sync and grants no Feature Schema, Proposal, Policy, Data Contract, carrier, manifest, dataset, evidence, production, runtime, implementation, build or deployment approval.

## 2. Frozen file boundary

The exact closed allowlist is `05_DEVELOPMENT/matching-engine/synthetic-budget-basis-mismatch-reference/G22_FILE_ALLOWLIST_v1.0.json`.

- Encoding: UTF-8 without BOM.
- Line endings: LF only.
- Raw SHA-256: `2942de606816d90afb77e77d4856df024ec045a33e8b8775e27ec1556e72842a`.
- Exactly nine paths are allowed: three documentation paths are `present`; six future code/test/evidence paths are `planned`.
- The allowlist intentionally omits its own hash; this authorization record and the package README bind the final bytes.

No rename, move, generated file, shared component edit, dependency change, package-manifest edit, lockfile edit, router/menu registration, production entry or additional artifact is authorized.

## 3. Source and status discipline

The sole substantive decision source is human-approved `LeaseMind_MATCHING_DECISION_XFR-D-013_v1.0.md`, read together with Feature Schema §5.1 rows 3–4, §5.3, §10 row 16, `MFS-C-003`, `MFS-C-006`, `MFS-C-012`, `MFS-C-013`, `MFS-C-016`, `MFS-C-028` and `MFS-C-030`. G21 is a structural presentation example only and is not a source of budget-basis semantics.

`XFR-D-013 v1.0` approves one qualitative mismatch rule. Equal basis (`true`/`true` or `false`/`false`) preserves the ordinary `rent ≤ budget_max` comparison governed elsewhere; the future page does not execute that comparison. Unequal basis (`true`/`false` or `false`/`true`) yields candidate `value_state = UNKNOWN` with calculation blocked; it never yields `PASS`, `FAIL`, incompatibility, rejection or `INELIGIBLE`.

The rule is `READY_AS_CANDIDATE_ONLY` at design time. No active scored/runtime `FeatureValue` is produced because Feature Schema remains unapproved and `IMPLEMENTATION_READINESS_GATE` remains `BLOCKED`. Exact runtime representation of `UNKNOWN`, any future numeric operating-expense amount field, `XFR-D-003` effective-rate representation and downstream Qualification routing remain independent open matters.

The future page presents source-bound, pre-authored reference copy. It does not receive a Property or TenantRequest record, invent an expense amount, calculate a rate, compare rent with budget, generate a feature result, activate an enum or route a case.

## 4. Frozen page and regions

The future page URL is `http://127.0.0.1:5173/synthetic-budget-basis-mismatch-reference.html` and the exact HTML title is `SYNTHETIC BUDGET-BASIS MISMATCH REFERENCE — NOT PRODUCTION APPROVED`.

The following lines remain visible:

- `SYNTHETIC BUDGET-BASIS MISMATCH REFERENCE — NOT PRODUCTION APPROVED`;
- `MANUAL DEV-ONLY REFERENCE — PRE-AUTHORED SOURCE COPY ONLY`;
- `NO RENT/BUDGET COMPARISON EXECUTED`.

All five regions are simultaneously visible in this exact order, without a stepper, filtering, selection, hiding, progression or automatic transition:

1. `SOURCE AND STATUS BOUNDARY`;
2. `PRE-AUTHORED 2 × 2 BASIS REFERENCE`;
3. `MISMATCH — UNKNOWN AND CALCULATION BLOCKED`;
4. `INDEPENDENT NUMERIC, RUNTIME AND QUALIFICATION BOUNDARIES`;
5. `NON-COMPUTATION RESULT`.

## 5. Exact approved basis cases

The future page contains exactly these four abstract cases:

| Property operating expenses included | Request budget includes operating expenses | Approved qualitative boundary | Explicitly not performed or inferred |
| --- | --- | --- | --- |
| `true` | `true` | `BASIS_ALIGNED`; ordinary comparison remains governed elsewhere | No rent/budget or effective-rate comparison on this page; no result |
| `false` | `false` | `BASIS_ALIGNED`; ordinary comparison remains governed elsewhere | No rent/budget or effective-rate comparison on this page; no result |
| `true` | `false` | `BASIS_MISMATCH`; candidate `value_state = UNKNOWN`; calculation blocked | No `PASS`, `FAIL`, incompatibility, rejection or `INELIGIBLE` |
| `false` | `true` | `BASIS_MISMATCH`; candidate `value_state = UNKNOWN`; calculation blocked | No `PASS`, `FAIL`, incompatibility, rejection or `INELIGIBLE` |

These are pre-authored governance interpretations of abstract booleans, not record examples, runtime values, executed outcomes or a complete operator. Equal basis does not prove affordability or compatibility; it only means the separate ordinary comparison is not blocked by basis mismatch. The page never executes that comparison.

## 6. Independence, fail-closed and open boundary

`budget_fit`, `rent_rate_fit`, the exact `XFR-D-003` effective-rate representation and `MATCHING_QUALIFICATION_POLICY` remain separately governed. None may be flattened into the static basis reference or inferred from it.

The following remain explicitly open:

- exact runtime representation of candidate `UNKNOWN` for this rule;
- any future numeric operating-expense amount field on either side;
- exact effective-rate numeric, rounding and serialization contract under `XFR-D-003`;
- public API/event/database/schema/carrier and reason-code representation;
- evidence contents, runtime routing, implementation, activation and operational consequences.

Unknown or open material cannot be coerced into zero, an estimated expense, a default basis, a negative fact, `PASS`, `FAIL`, incompatibility, rejection, automatic `INELIGIBLE`, score, Qualification result or route. A mismatch is fail-closed only by blocking the calculation and preserving candidate `UNKNOWN`; it is not an adverse result.

## 7. Prohibited inference and non-computation

The future page performs no rent/budget comparison, effective-rate calculation, operating-expense estimation, matching, candidate generation, active `FeatureValue` production, scoring, confidence, Qualification, Risk, ranking, thresholding, eligibility, recommendation, routing or business action.

It must not introduce an expense amount, numeric field, formula, threshold, rounding rule, serialization rule or runtime carrier; present basis alignment as affordability or compatibility; present mismatch as a failure or rejection; or present candidate `UNKNOWN` as an activated runtime enum or route.

The terminal region is last and contains exactly:

- `SYNTHETIC_NO_BUDGET_BASIS_COMPARISON_EXECUTED`;
- `NO RENT/BUDGET COMPARISON EXECUTED — NO EXPENSE AMOUNT, EFFECTIVE RATE, FEATURE VALUE, PASS, FAIL, INELIGIBLE, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, RECOMMENDATION OR ROUTING OCCURRED`.

This is render-local non-occurrence copy, not evidence, an outcome, a ledger record, telemetry or a persisted status.

## 8. Data, interaction and accessibility boundary

No person, organization, address, geography value, Property-value instance, TenantRequest-value instance, money amount, date value, UUID, contact or plausible business record may appear. Source field and boolean labels are abstract schema vocabulary, not values from an actual record.

The page has zero interactive elements: no anchors, buttons, forms, inputs, selectors or widgets. It has no state, effects, handlers, `aria-live`, URL query/hash behavior, network, persistence, storage, cookies, cache, logging, diagnostics, telemetry, timers, randomness, motion or animation. It exposes accessible `main`, one `h1`, region headings, one semantic four-row table, lists and static text. Responsive reflow must avoid horizontal page scrolling at exactly 360, 390, 768 and 1280 px.

## 9. Isolation and file boundary

G22 is not added to G14–G21, links to none of them and imports or embeds no prior synthetic component. Every prior package file and semantic remains unchanged.

The page remains excluded from the default production build and has no application entry, menu link or router registration. `App.tsx`, `main.tsx`, `index.html`, Vite configuration, package manifests, lockfiles, API code and production routes/configuration remain untouched.

Exactly three paths are `present`: this authorization record, the package README and the frozen allowlist. Exactly six paths are `planned`: the standalone HTML, scenario/constants module, isolated view, isolated entry, bounded test and verification result.

## 10. Required bounded verification

A separately authorized code phase must verify:

- exact closed nine-path boundary and allowlist raw SHA-256;
- exact title, always-visible lines and five-region order;
- exactly four basis cases and one semantic table;
- aligned cases never execute or imply a comparison result;
- mismatch cases remain candidate `UNKNOWN` with calculation blocked and never become `PASS`, `FAIL`, incompatibility, rejection or `INELIGIBLE`;
- no expense amount, numeric field, formula, threshold, rounding, serialization, runtime representation or evaluator exists;
- `budget_fit`, `rent_rate_fit`, `XFR-D-003` and Qualification remain independent;
- independent open follow-ups and design-time-only readiness remain explicit;
- terminal non-computation region remains last;
- zero business instances, interaction, mutable state, live regions, network, persistence, logging, telemetry, timers, randomness or motion;
- G14–G21 hashes and semantics remain unchanged;
- production-root isolation;
- focused/full tests, typecheck and browser smoke without new failures or diagnostics;
- responsive layouts at 360, 390, 768 and 1280 px without horizontal overflow or console warnings/errors.

## 11. Result and non-authorization

The sole future package result label is `G22_SYNTHETIC_BUDGET_BASIS_MISMATCH_REFERENCE_VERIFIED`. It is package-local only, not a governance gate, evidence of readiness or permission to calculate, compare, score, qualify or route.

It grants no Feature Schema, Proposal, Policy, Data Contract, carrier, manifest, dataset, evidence, production-data, runtime, implementation, build or deployment approval.

## 12. Approval matrix

| Function | Decision | Exact scope |
| --- | --- | --- |
| `PRODUCT` | `APPROVED` | Static display of the exact four-case qualitative basis boundary and explicit open items |
| `LEGAL` | `APPROVED` | Abstract schema vocabulary only; no business record, adverse action or production claim |
| `Chief AI Architect` | `APPROVED` | Source/status separation, independent boundaries and closed nine-path scope |
| `AI` | `APPROVED` | No numeric invention, comparison, scoring, eligibility, recommendation or routing |
| `DEVELOPMENT` | `APPROVED` | Exact four-case copy, isolation, accessibility and responsive verification boundary |

`SECURITY/DLP` may provide evidence only and has no approval authority. These approvals authorize only this documentation boundary; code creation still requires independent audit and subsequent human confirmation.

## 13. Gate state

Gate impact is `NONE`. All three gates remain unchanged:

- `IMPLEMENTATION_READINESS_GATE`: `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE`: `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE`: `BLOCKED`.

No case, field, enum label, page, documentation artifact or future result may advance, soften, reinterpret or satisfy a gate.

## 14. Authorization conclusion

`G22 SYNTHETIC BUDGET-BASIS MISMATCH REFERENCE DOCUMENTATION PACKAGE AUTHORIZED — CODE FILE CREATION REQUIRES INDEPENDENT AUDIT AND SUBSEQUENT EXPLICIT HUMAN CONFIRMATION; EXACT UNKNOWN RUNTIME REPRESENTATION, OPERATING-EXPENSE AMOUNT, EFFECTIVE-RATE CONTRACT, FEATURE VALUES, MATCHING, SCORING, CONFIDENCE, QUALIFICATION, RISK, RANKING, ELIGIBILITY, RECOMMENDATION, ROUTING, BUSINESS OUTCOMES, FEATURE SCHEMA, POLICY, DATA CONTRACTS, CARRIER, MANIFEST, EVIDENCE, PRODUCTION, RUNTIME, IMPLEMENTATION AND ALL THREE GATES REMAIN OPEN/BLOCKED.`
