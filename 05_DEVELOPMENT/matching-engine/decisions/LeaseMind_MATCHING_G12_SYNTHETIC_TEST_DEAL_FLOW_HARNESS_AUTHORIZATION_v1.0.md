# LeaseMind Matching G12 Synthetic Test-Deal Flow Harness Authorization v1.0

**Artifact class:** non-canonical package authorization
**Authorization date:** `2026-09-23`
**Package version:** `1.0`
**Baseline branch:** `development/sprint-7-matching-g12-synthetic-test-deal-flow-harness`
**Baseline commit:** `0082852898af31cb3fd1865c9ec9437d4969b9c7`
**Frozen file allowlist:** `05_DEVELOPMENT/matching-engine/synthetic-test-deal-flow-harness/G12_FILE_ALLOWLIST_v1.0.json`
**Frozen allowlist SHA-256:** `02851ef4d03fb8232f04c4917766750f0a5db7b53b99501d1cafe2580a7080a2`
**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`
**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Authorization boundary

This record authorizes only the documentation phase for one isolated, manually opened, development-only deterministic synthetic test-deal flow harness. It freezes package version `1.0`, the exact baseline, the exact-byte allowlist hash, the complete nine-path file boundary, a six-step display-only sequence, its accessible branch/reset controls and its responsive presentation boundary. It does not authorize creation or modification of any path marked `planned`.

The code phase remains blocked until these three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase. Documentation authorship, silence, a package result label or any function approval below cannot substitute for either prerequisite.

This package is non-canonical. It creates no `XFR` ID, changes no canonical decision or identity count, requires no Inventory change, and does not amend or supersede any existing decision. All G7, G8, G9, G10 and G11 files, behavior, tokens and verification meaning must remain byte-for-byte and semantically unchanged.

## 2. Authorized harness

The future harness is a separate sibling page, manually opened in development only at exactly:

`http://127.0.0.1:5173/synthetic-test-deal-flow-harness.html`

Its HTML title and always-visible page title must be exactly:

`SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED`

The other always-visible lines must be exactly:

`SCENARIO: SYNTHETIC_TEST_DEAL_FLOW_A`

`MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION`

The harness has exactly six zero-based internal states, `0` through `5`, presented as visible steps `1` through `6`. Initial load, reload and `RESET HARNESS` show step 1 with no selected disposition. Only the current step panel is visible.

## 3. Frozen sequence and copy

The six panels appear only in this order:

1. `STEP 1 OF 6` with `TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A`;
2. `STEP 2 OF 6` with `CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A` and `PREVIEW ONLY — NOT LAUNCHED`;
3. `STEP 3 OF 6` with `SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B` and the always-visible qualification `FIXTURE ONLY — NOT MATCHED OR RANKED`;
4. `STEP 4 OF 6` with `SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A`, followed by unchanged G7 rendering of unchanged G8 input as exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`;
5. `STEP 5 OF 6` with `HUMAN REHEARSAL DISPOSITION REQUIRED` and exactly two disposition choices: `CONTINUE REHEARSAL` and `HOLD REHEARSAL`;
6. `STEP 6 OF 6` with exact terminal result `SYNTHETIC_NO_DEAL_EXECUTED` and `NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED`.

The test-deal token, campaign preview and pair are pre-authored fixtures only. They are not requests, records, candidates, matches, rankings or outcomes. Neither disposition choice changes any business state: both lead to the same terminal result, and the selected label may be retained only as transient local UI state for display on step 6.

## 4. Frozen interaction and accessibility contract

All authorized controls are native `type="button"` elements. On steps 1 through 4, logical DOM order is `NEXT STEP`, `RESET HARNESS`. `NEXT STEP` advances exactly one step and is unavailable after step 4. On step 5, logical DOM order is `CONTINUE REHEARSAL`, `HOLD REHEARSAL`, `RESET HARNESS`. Either disposition button records only the selected display label and advances to the shared step 6. On step 6, the only control is `RESET HARNESS`. Reset clears the selected disposition and returns directly to step 1. Wrapping, skipping, alternate destinations and automatic transitions are prohibited.

The controls are contained in navigation whose `aria-label` is exactly `SYNTHETIC TEST-DEAL FLOW CONTROLS`. The disposition controls are grouped with accessible name exactly `HUMAN REHEARSAL DISPOSITION`. The progress container has `aria-live="polite"` and `aria-atomic="true"`. Default browser keyboard focus must remain visibly discernible. Only native `Enter` and `Space` button activation is used; custom keyboard handlers are prohibited.

The future page must use presentation-ready, responsive, harness-local styling: readable hierarchy, sufficient contrast, visible focus, and reflow without horizontal page scrolling at supported viewports. It cannot amend G7–G11 or production styles. Motion and animation are prohibited.

## 5. Required unchanged reuse

Step 4 reuses the existing G7 Safe Presentation component unchanged and passes it the existing G8 input unchanged. G7 blocked/no-echo behavior and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged. G9 abstract tokens, order, meaning and exclusions remain unchanged. G10 walkthrough and G11 rehearsal behavior, copy and verification meaning remain unchanged. G12 is a separate sibling and cannot reinterpret prior package results as approval or evidence.

## 6. Explicit exclusions and non-authorization

The following remain `OPEN`, excluded and unimplemented:

- actual Matching, candidate generation or pair selection;
- Scoring, Confidence, Qualification, Risk, ranking, thresholds or inference;
- contact, communication, Campaign launch or routing;
- deal execution, transaction state, outcome recording, or legal or financial action;
- Safe Presentation Policy approval;
- Data Contracts, carrier or Controlled Artifact Manifest treatment;
- actual evidence, production data or production applicability;
- runtime, production build, deployment, API, database, event, storage, cache, logging, diagnostics or telemetry behavior.

This authorization grants no Policy, Data Contracts, dataset, evidence, carrier, manifest, production-data, runtime, implementation, build or deployment approval. The words `test deal`, `campaign preview`, `fixture pair`, `continue`, `hold` and `outcome` are UI rehearsal labels only and grant no business meaning.

## 7. Production isolation and frozen file boundary

The package must contain no organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record. It must introduce no forms, editable inputs, selectors, links, actual business data, query/hash behavior, autoplay, timers, randomness, custom keyboard handling, network calls, persistence, storage, cookies, cache, logging, diagnostics or telemetry.

The page must have no menu entry, application link or router registration and must remain excluded from the default production build. No API, database, event, workflow or production integration is authorized. Changes to G7–G11; `App.tsx`; `main.tsx`; `index.html`; Vite configuration; package manifests; lockfiles; API code/configuration; or production route, build or deployment configuration are prohibited.

The sole authoritative path set is the closed `allowed_paths` array in `G12_FILE_ALLOWLIST_v1.0.json`, bound to package version `1.0`, baseline commit `0082852898af31cb3fd1865c9ec9437d4969b9c7`, and exact-byte SHA-256 `02851ef4d03fb8232f04c4917766750f0a5db7b53b99501d1cafe2580a7080a2`.

Exactly these three documentation artifacts are `present` in this phase: this authorization record, the package README and the frozen allowlist. Exactly six paths are `planned`: standalone HTML, frozen scenario module, isolated component, isolated entry module, bounded test and verification result. They must remain absent until the audit and confirmation prerequisite is satisfied. The allowlist omits its own hash to avoid self-reference; this record and README bind its final bytes.

## 8. Required bounded verification

A separately authorized future code package must verify at minimum:

- the closed nine-path boundary and absence of changes outside it;
- exact initial, reload and reset state at `STEP 1 OF 6` with no disposition;
- exact six-step copy and order;
- fixture warning `FIXTURE ONLY — NOT MATCHED OR RANKED` remains visible with the pair;
- unchanged G7 rendering of unchanged G8 input and unchanged G9–G11 semantics;
- `NEXT STEP` one-step transitions only through step 5, with no wrap or skip;
- both disposition choices produce only local UI state and lead to the same `SYNTHETIC_NO_DEAL_EXECUTED` terminal result;
- reset clears disposition and returns to step 1;
- exact native-button DOM order by step, accessible names, live-region attributes, visible focus and native keyboard activation;
- presentation-ready responsive reflow, sufficient contrast, supported-viewport readability and no horizontal page scrolling;
- no forbidden behavior, business computation, network request, persistence, storage, logging, diagnostics, telemetry or motion;
- manual browser smoke at the exact dev-only URL without application, router, menu or default production-build integration.

## 9. Verification and non-conflation

If the separately authorized future code package passes bounded verification, its sole result label is:

`G12_SYNTHETIC_TEST_DEAL_FLOW_HARNESS_VERIFIED`

This is a package verification result only, not a governance gate. It does not mean a match, score, confidence, Qualification, Risk decision, ranking, threshold, contact, campaign launch, deal, outcome, approval, workflow execution or production operation occurred.

## 10. Approval matrix

All five functions approve the same documentation boundary, package version `1.0`, baseline commit `0082852898af31cb3fd1865c9ec9437d4969b9c7`, and frozen exact-byte allowlist SHA-256 `02851ef4d03fb8232f04c4917766750f0a5db7b53b99501d1cafe2580a7080a2`.

| Function | Decision | Exact scope |
|---|---|---|
| `PRODUCT` | `APPROVED` | Fixed six-step rehearsal copy, two UI-only disposition labels and common no-deal result |
| `LEGAL` | `APPROVED` | Synthetic-only abstract tokens; no person, contact, asset, transaction, legal or financial action |
| `Chief AI Architect` | `APPROVED` | Unchanged G7–G11 semantics, non-conflation and closed nine-path boundary |
| `AI` | `APPROVED` | Pre-authored fixture-only pair and exact prohibitions on matching, scoring, confidence, qualification, risk and ranking |
| `DEVELOPMENT` | `APPROVED` | Exact baseline, isolated state/branch/reset contract, responsive accessibility, bounded verification and production isolation |

`SECURITY/DLP` supplies evidence only. Its evidence may inform the independent audit, but it is not an approving function and cannot authorize the code phase or change Policy, Data Contracts, carrier, manifest, production, runtime or gate state.

## 11. Gate state

Gate impact is `NONE`. All three governance gates remain unchanged:

- `IMPLEMENTATION_READINESS_GATE`: `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE`: `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE`: `BLOCKED`.

## 12. Authorization conclusion

`G12 SYNTHETIC TEST-DEAL FLOW HARNESS DOCUMENTATION PACKAGE AUTHORIZED — CODE FILE CREATION REQUIRES INDEPENDENT AUDIT AND SUBSEQUENT EXPLICIT HUMAN CONFIRMATION; G7/G8/G9/G10/G11 HISTORY, MATCHING, SCORING, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, CAMPAIGN, DEAL, OUTCOME, WORKFLOW EXECUTION, POLICY, DATA CONTRACTS, CARRIER, MANIFEST, EVIDENCE, PRODUCTION, RUNTIME, IMPLEMENTATION AND ALL THREE GATES REMAIN OPEN/BLOCKED.`
