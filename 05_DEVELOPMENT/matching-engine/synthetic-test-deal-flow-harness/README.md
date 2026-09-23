# G12 Synthetic Test-Deal Flow Harness

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manual, development-only deterministic synthetic test-deal flow harness.

- Authorization date: `2026-09-23`
- Baseline branch: `development/sprint-7-matching-g12-synthetic-test-deal-flow-harness`
- Baseline commit: `0082852898af31cb3fd1865c9ec9437d4969b9c7`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G12_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `02851ef4d03fb8232f04c4917766750f0a5db7b53b99501d1cafe2580a7080a2`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7, G8, G9, G10 and G11 remain unchanged.

## Frozen six-step harness

The future page is a separate sibling, manually accessible in development only at `http://127.0.0.1:5173/synthetic-test-deal-flow-harness.html`. Its HTML title and always-visible page title are exactly `SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED`. The other always-visible lines are exactly `SCENARIO: SYNTHETIC_TEST_DEAL_FLOW_A` and `MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION`.

The deterministic visible sequence is exactly:

1. `TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A`;
2. `CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A` and `PREVIEW ONLY — NOT LAUNCHED`;
3. `SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B` and `FIXTURE ONLY — NOT MATCHED OR RANKED`;
4. `SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A`, followed by unchanged G7 Safe Presentation rendering of unchanged G8 input;
5. `HUMAN REHEARSAL DISPOSITION REQUIRED`, with the two UI-only choices `CONTINUE REHEARSAL` and `HOLD REHEARSAL`;
6. exact result `SYNTHETIC_NO_DEAL_EXECUTED` and `NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED`.

Both disposition choices advance to the same terminal result. The selected choice may be displayed only as local UI state; it is not a decision, approval, workflow instruction, communication, transaction or business outcome.

## Interaction, accessibility and presentation

All controls are native `type="button"` elements. Before the disposition step, controls are `NEXT STEP` followed by `RESET HARNESS`. The disposition step contains `CONTINUE REHEARSAL`, `HOLD REHEARSAL`, then `RESET HARNESS`. The terminal step contains only `RESET HARNESS`. `NEXT STEP` advances exactly one step through step 5 and cannot wrap or skip. Either disposition button records only the local display choice and advances to the common step 6. `RESET HARNESS` clears the choice and returns to step 1. Initial load and reload also show step 1 with no choice.

Controls are contained in navigation with `aria-label="SYNTHETIC TEST-DEAL FLOW CONTROLS"`; the disposition buttons are grouped with accessible name `HUMAN REHEARSAL DISPOSITION`; progress has `aria-live="polite"` and `aria-atomic="true"`. Only native `Enter` and `Space` button activation is allowed, and focus must remain visibly discernible.

The future code scope includes presentation-ready, responsive, harness-local styling with readable hierarchy, sufficient contrast, visible focus and reflow without horizontal page scrolling at supported viewports. Styling must not change G7–G11 or production styles. Motion and animation are prohibited.

## Frozen boundaries

The test-deal token, campaign preview and fixture pair are fixed display tokens only. They are not actual data and do not trigger or assert matching, candidate generation, scoring, confidence, Qualification, Risk, ranking, thresholding, contact, campaign launch, deal execution or outcome recording. The fixture pair must always carry the visible warning `FIXTURE ONLY — NOT MATCHED OR RANKED`.

Step 4 reuses the existing G7 Safe Presentation component unchanged and passes the existing G8 synthetic input unchanged. G7 blocked/no-echo behavior, G9 tokens and exclusions, and G10/G11 meanings remain unchanged. The harness cannot convert those artifacts into production evidence or approval.

No organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record is permitted. There are no forms, editable inputs, selectors, links, query/hash behavior, autoplay, timers, randomness, custom keyboard handlers, network calls, persistence, storage, cookies, cache, logging, diagnostics or telemetry.

The page has no menu entry, application link or router registration and remains excluded from the default production build. No API, database, event, application route, workflow or production integration is authorized. No file outside the frozen nine-path allowlist may be created or modified.

## Required future verification

The future bounded test and manual browser smoke must prove the exact six-step order and copy, initial/reload/reset state, one-step progression, both branch buttons leading to the same exact terminal result, local-only disposition state, unchanged G7/G8 rendering and G9–G11 semantics, native-control order, accessibility attributes, visible focus, responsive reflow, no horizontal page scrolling at supported viewports, no motion, no prohibited behavior, production isolation and the closed nine-path boundary.

The sole future success label is `G12_SYNTHETIC_TEST_DEAL_FLOW_HARNESS_VERIFIED`. It is a package result, not a governance gate. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `0082852898af31cb3fd1865c9ec9437d4969b9c7`, and frozen exact-byte allowlist SHA-256 `02851ef4d03fb8232f04c4917766750f0a5db7b53b99501d1cafe2580a7080a2`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`; gate impact is `NONE`.
