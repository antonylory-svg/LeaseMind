# G15 Synthetic Deal Rehearsal Board

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manual, development-only responsive product-shaped single-page synthetic deal rehearsal board.

- Authorization date: `2026-09-24`
- Baseline branch: `development/sprint-7-matching-g15-synthetic-deal-rehearsal-board`
- Baseline commit: `0b3d965c29cad04ed67a73545f8c22d054da115d`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist (LF-only line endings, UTF-8 no BOM): `G15_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256 (exact bytes of the LF-only file): `53addc8cb9c13a6fece1f8cc85b44cb332f86f56ccaa93d16ce3725c031651a2`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7, G8, G9, G10, G11, G12, G13 and G14 remain byte-for-byte and semantically unchanged.

## What "board" means here

The future board is a separate sibling page, manually accessible in development only at `http://127.0.0.1:5173/synthetic-deal-rehearsal-board.html`. Its HTML title and always-visible page title are exactly `SYNTHETIC DEAL REHEARSAL BOARD — NOT PRODUCTION APPROVED`. The other always-visible line is exactly `MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION`.

`board` denotes an accessible, product-shaped, responsive page layout only. It presents every region of one end-to-end synthetic rehearsal simultaneously on one page. It is never a stepper, never a wizard and never a progression: it has no `NEXT`, no `BACK`, no current-region hiding, no reveal-on-advance and no automatic transition. The always-visible chain warning `SEQUENCE SHOWN AT ONCE — NOT A STEPPER — NOT PROGRESSION` states this explicitly. The layout denotes no geography, tenancy, deployment, segmentation or routing, and no such meaning may be inferred from it. The board is a single synthetic rehearsal page and never a segmented, multi-tenant, multi-region, multi-deployment or routed surface.

## All-at-once regions

The board shows all of its regions at the same time, and it re-expresses the G13 six-node sequence and the G14 two-sided co-display. It embeds no G11, G12, G13 or G14 page component. The regions are:

1. `OWNER-SIDE NEED AND TENANT-SIDE CANDIDATE` — the two-sided co-display with `OWNER-SIDE NEED — SYNTHETIC_FIXTURE_PARTY_A`, `TENANT-SIDE CANDIDATE — SYNTHETIC_FIXTURE_PARTY_B`, the always-adjacent warning `CO-DISPLAY ONLY — NOT COMPARED OR MATCHED` and the pair warning `FIXTURE ONLY — NOT MATCHED OR RANKED`;
2. `END-TO-END REHEARSAL CHAIN — SHOWN AT ONCE` — the six preserved G13 nodes in fixed order, each re-expressed as a simultaneously visible tile carrying the chain warning `SEQUENCE SHOWN AT ONCE — NOT A STEPPER — NOT PROGRESSION`;
3. `PRE-AUTHORED SYNTHETIC FIXTURE` — the pre-authored fixture rows, each with the always-adjacent label `PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED`;
4. `SAFE PRESENTATION` — the unchanged G7 Safe Presentation rendering of the unchanged G8 synthetic input;
5. `WHAT THIS BOARD IS NOT` — the boundary panel;
6. `NON-OCCURRENCE RESULT` — the always-visible non-occurrence result, never a ledger and never persistent.

The preserved G13 six-node sequence, unchanged in token, order and meaning, is:

1. `SYNTHETIC_TEST_DEAL_A` — pre-authored fixture evidence row;
2. `SYNTHETIC_CAMPAIGN_PREVIEW_A` — pre-authored fixture evidence row;
3. `SYNTHETIC_FIXTURE_PARTY_A` + `SYNTHETIC_FIXTURE_PARTY_B` — two-sided co-display;
4. `SYNTHETIC_SAFE_PRESENTATION_A` with `SYNTHETIC_HEADING` and `SYNTHETIC_MESSAGE` — unchanged G7 rendering of unchanged G8 input as exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`;
5. `HUMAN REHEARSAL DISPOSITION REQUIRED` — expressed only by the human rehearsal controls;
6. `SYNTHETIC_NO_DEAL_EXECUTED` — always-visible non-occurrence result.

The two-sided co-display is co-display only; no comparison, compatibility, matching, scoring, confidence, ranking, eligibility or recommendation may be produced, shown or implied.

## Pre-authored fixture rows and safe presentation reuse

Every visible evidence or reason row is exact pre-authored fixture copy that reuses only the frozen abstract tokens and carries the always-adjacent exact label `PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED`. Rows are fixtures only. They are not requests, records, candidates, matches, rankings or outcomes, and they never trigger matching, scoring, confidence, Qualification, Risk, ranking, thresholding, contact, campaign launch, deal execution or outcome recording. Computed evidence and recommendations are prohibited.

The `SAFE PRESENTATION` region reuses the existing G7 Safe Presentation component unchanged and passes it the existing G8 synthetic input unchanged. G7 blocked/no-echo behavior and the exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged, and the rendered lines remain exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, `SYNTHETIC_HEADING` and `SYNTHETIC_MESSAGE`.

## Boundary panel

The boundary panel is titled exactly `WHAT THIS BOARD IS NOT — FIXTURE COPY` and carries the always-adjacent line `FIXTURE COPY — NOT A STATUS CLAIM`. Its rows are exactly:

- `NOT A MATCH`;
- `NOT A SCORE OR CONFIDENCE`;
- `NOT A QUALIFICATION OR RISK DECISION`;
- `NOT A RANKING OR RECOMMENDATION`;
- `NOT A CONTACT, CAMPAIGN LAUNCH, DEAL OR OUTCOME`;
- `NOT PRODUCTION APPROVED`.

The panel is fixture copy only. It is a status disclaimer and not a status claim, and it grants no business, legal, financial or production meaning.

## Always-visible non-occurrence result

The board shows one always-visible non-occurrence result with the exact token `SYNTHETIC_NO_DEAL_EXECUTED` and the exact line `NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED`.

This result is bound to the current render only. It is not a ledger, not a persistent record, not an at-rest store and not reusable evidence, and it must never be described or treated as any of these. It stays visible for both rehearsal choices, after `RESET` and on reload.

## Interaction, state, accessibility and presentation

The only authorized controls are the native `type="button"` elements `REHEARSE INTEREST`, `REHEARSE HOLD` and `RESET`, in exactly that DOM order. They are contained in navigation whose `aria-label` is exactly `SYNTHETIC DEAL REHEARSAL BOARD CONTROLS`; the rehearsal buttons are grouped with accessible name exactly `HUMAN REHEARSAL DISPOSITION`; the selection-status region has `aria-live="polite"` and `aria-atomic="true"`. Only native `Enter` and `Space` button activation is allowed, custom keyboard handlers are prohibited, and focus must remain visibly discernible.

The only mutable state is transient, in-memory and non-persistent: the in-memory `REHEARSE INTEREST`/`REHEARSE HOLD` selection and the `RESET` action that clears it. A chosen label must display with the exact transient disclaimer `UI REHEARSAL SELECTION ONLY — NOT APPROVAL`, and it transitions, hides, reorders or replaces no region. Neither choice is a decision, approval, workflow instruction, communication, transaction or business outcome. Both choices preserve the same always-visible `SYNTHETIC_NO_DEAL_EXECUTED`. `RESET` clears the selection; a page reload also clears it because no state is persisted.

The future code scope includes presentation-ready, responsive, board-local styling with readable hierarchy, sufficient contrast, visible focus and reflow without horizontal page scrolling at supported viewports. Styling must not change G7–G14 or production styles. Motion and animation are prohibited, and reduced motion is trivially satisfied because none exists.

## Frozen vocabulary and boundaries

The frozen closed abstract data vocabulary is exactly: `SYNTHETIC_TEST_DEAL_A`, `SYNTHETIC_CAMPAIGN_PREVIEW_A`, `SYNTHETIC_FIXTURE_PARTY_A`, `SYNTHETIC_FIXTURE_PARTY_B`, `SYNTHETIC_SAFE_PRESENTATION_A`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`, `SYNTHETIC_NO_DEAL_EXECUTED`. No additional data-bearing token is authorized, no new scenario token may be introduced, and no `SCENARIO` line is authorized. New structural, accessibility, control and warning copy is permitted only where its exact value is frozen in the authorization record and allowlist, including the title `SYNTHETIC DEAL REHEARSAL BOARD — NOT PRODUCTION APPROVED`, the line `MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION`, the chain warning `SEQUENCE SHOWN AT ONCE — NOT A STEPPER — NOT PROGRESSION`, the warnings `PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED`, `CO-DISPLAY ONLY — NOT COMPARED OR MATCHED`, `FIXTURE ONLY — NOT MATCHED OR RANKED` and `UI REHEARSAL SELECTION ONLY — NOT APPROVAL`, the boundary panel `WHAT THIS BOARD IS NOT — FIXTURE COPY`, `NOT A MATCH`, `NOT A SCORE OR CONFIDENCE`, `NOT A QUALIFICATION OR RISK DECISION`, `NOT A RANKING OR RECOMMENDATION`, `NOT A CONTACT, CAMPAIGN LAUNCH, DEAL OR OUTCOME`, `NOT PRODUCTION APPROVED` and `FIXTURE COPY — NOT A STATUS CLAIM`, and the controls `REHEARSE INTEREST`, `REHEARSE HOLD`, `RESET`. No token or copy may resemble a plausible person, organization, address, geography, property, money amount, date, UUID, contact detail or business record.

The board reuses the existing G7 Safe Presentation component unchanged and passes it the existing G8 synthetic input unchanged; it embeds no G11, G12, G13 or G14 page component. G7 blocked/no-echo behavior and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged, and G9, G10, G11, G12, G13 and G14 token, order, meaning and verification semantics remain unchanged. The board cannot convert those artifacts into production evidence or approval.

Matching, candidate generation, comparison, compatibility, scoring, confidence, qualification, risk, ranking, thresholds, eligibility, recommendation, contact, communication, campaign launch, deal execution and outcome recording are prohibited. Also prohibited: network, API, database, event or router integration; persistence, storage, cookies, cache, logging, diagnostics or telemetry; any ledger or persistent treatment of the non-occurrence result; menu or default production-build exposure; forms, editable inputs, selectors or links; query/hash behavior; autoplay, timers or randomness; custom keyboard handlers; motion or animation; and workflow execution or business computation.

The page has no menu entry, application link or router registration and remains excluded from the default production build. No file outside the frozen nine-path allowlist may be created or modified.

## Required future verification

The future bounded test and manual browser smoke must prove, at minimum:

- focused tests: the `apps/web/tests/syntheticDealRehearsalBoard.test.ts` suite covering the frozen copy, the eight frozen abstract tokens, the re-expressed G13/G14 tile order, all-at-once presentation, the boundary panel rows, both co-display warnings, unchanged G7/G8 reuse bytes and rendered output, native button order and type, aria navigation/group/live region, transient-only selection, prohibited-behavior absence, the closed nine-path allowlist and production-root isolation;
- full tests and typecheck: the complete `apps/web` test suite and `npm --prefix apps/web run typecheck` pass with zero failures and no new diagnostics;
- closed scope and hashes: the closed nine-path boundary, no change outside it, and the frozen exact-byte LF-only allowlist SHA-256 `53addc8cb9c13a6fece1f8cc85b44cb332f86f56ccaa93d16ce3725c031651a2` unchanged;
- responsive layout at exactly 360, 390, 768 and 1280 px with every region simultaneously visible and no horizontal page scrolling;
- native keyboard and accessibility: native `Enter`/`Space` activation, visible focus, exact accessible names and the `aria-live="polite"`/`aria-atomic="true"` region, with no custom keyboard handlers;
- browser smoke: at the exact dev-only URL with all regions shown at once, both co-display warnings visible, the boundary panel present, both choices transient with the exact disclaimer, `RESET` and reload clearing the selection, and no page-level console errors or warnings;
- production isolation: no application, menu, router or default production-build integration and no board copy in the production app;
- G14 unchanged: G14 and every prior G7–G13 file, behavior, token and verification meaning remain byte-for-byte and semantically unchanged.

The sole future success label is `G15_SYNTHETIC_DEAL_REHEARSAL_BOARD_VERIFIED`. It is a package result only, not a governance gate. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

## Governance

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `0b3d965c29cad04ed67a73545f8c22d054da115d`, and frozen exact-byte LF-only allowlist SHA-256 `53addc8cb9c13a6fece1f8cc85b44cb332f86f56ccaa93d16ce3725c031651a2`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`; gate impact is `NONE`.
