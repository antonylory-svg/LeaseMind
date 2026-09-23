# G13 Synthetic Matching Flow Console

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manual, development-only responsive multi-panel synthetic matching flow console.

- Authorization date: `2026-09-23`
- Baseline branch: `development/sprint-7-matching-g13-synthetic-matching-flow-console`
- Baseline commit: `c3ab5c1c78d739d1e0cc59db88095e59083eef74`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G13_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `293a762abe050c77db6a9aaab3d44c980e1b182259edc2dc758ae31d5bb8af67`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7, G8, G9, G10, G11 and G12 remain byte-for-byte and semantically unchanged.

## What "multi-panel" means here

The future console is a separate sibling page, manually accessible in development only at `http://127.0.0.1:5173/synthetic-matching-flow-console.html`. Its HTML title and always-visible page title are exactly `SYNTHETIC MATCHING FLOW CONSOLE — NOT PRODUCTION APPROVED`. The other always-visible lines are exactly `SCENARIO: SYNTHETIC_MATCHING_FLOW_CONSOLE_A` and `MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION`.

`multi-panel` means an accessible page layout only. It is a purely visual, responsive arrangement of always-visible regions on one page. It explicitly does not denote geography, tenancy, deployment, segmentation or routing, and no such meaning may be inferred from the layout.

## Simultaneous six-stage-node console

Unlike the G12 stepping harness, the console has no `NEXT`, no `BACK`, no stepper, no current-panel hiding, no progression and no automatic transition. All six G12 stage nodes and their closed synthetic tokens are visible at the same time, in this fixed order:

1. `STAGE NODE 1 — TEST DEAL TOKEN` with `TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A`;
2. `STAGE NODE 2 — CAMPAIGN PREVIEW` with `CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A` and `PREVIEW ONLY — NOT LAUNCHED`;
3. `STAGE NODE 3 — FIXTURE PAIR` with `SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B` and the always-visible warning `FIXTURE ONLY — NOT MATCHED OR RANKED`;
4. `STAGE NODE 4 — SAFE PRESENTATION` with `SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A`, followed by unchanged G7 rendering of unchanged G8 input as exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`;
5. `STAGE NODE 5 — HUMAN REHEARSAL DISPOSITION` with `HUMAN REHEARSAL DISPOSITION REQUIRED` and exactly two choices, `CONTINUE REHEARSAL` and `HOLD REHEARSAL`;
6. `STAGE NODE 6 — NON-OCCURRENCE RESULT` with exact terminal result `SYNTHETIC_NO_DEAL_EXECUTED` and `NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED`.

The test-deal token, campaign preview and fixture pair are pre-authored fixtures only. They are not requests, records, candidates, matches, rankings or outcomes, and they never trigger matching, scoring, confidence, Qualification, Risk, ranking, thresholding, contact, campaign launch, deal execution or outcome recording.

## Always-visible current-render-only non-occurrence panel

The console shows one additional always-visible panel, the `CURRENT-RENDER NON-OCCURRENCE PANEL`, with the visible line `CURRENT RENDER ONLY — NOT A LEDGER — NOT PERSISTENT` and the non-occurrence statement `NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED`.

This panel is bound to the current render only. It is not a ledger, not a persistent record, not an at-rest store and not reusable evidence, and it must never be described or treated as any of these.

## Interaction, state, accessibility and presentation

All controls are native `type="button"` elements and the only authorized controls are `CONTINUE REHEARSAL`, `HOLD REHEARSAL` and `RESET`. The controls are contained in navigation whose `aria-label` is exactly `SYNTHETIC MATCHING FLOW CONSOLE CONTROLS`; the disposition buttons are grouped with accessible name exactly `HUMAN REHEARSAL DISPOSITION`; the selection-status region has `aria-live="polite"` and `aria-atomic="true"`. Only native `Enter` and `Space` button activation is allowed, and focus must remain visibly discernible.

The only mutable state is transient, in-memory and non-persistent: the in-memory `CONTINUE REHEARSAL`/`HOLD REHEARSAL` display choice and the `RESET` action that clears it. Either disposition choice may display the chosen label as transient in-memory UI state only, and both choices preserve the same always-visible `SYNTHETIC_NO_DEAL_EXECUTED` result. Neither choice is a decision, approval, workflow instruction, communication, transaction or business outcome. `RESET` clears the choice; a page reload also clears the choice because no state is persisted.

The future code scope includes presentation-ready, responsive, console-local styling with readable hierarchy, sufficient contrast, visible focus and reflow without horizontal page scrolling at supported viewports. Styling must not change G7–G12 or production styles. Motion and animation are prohibited.

## Frozen vocabulary and boundaries

The frozen closed abstract vocabulary is bound by the `frozen_vocabulary` object of the allowlist: scenario token `SYNTHETIC_MATCHING_FLOW_CONSOLE_A`; stage tokens `SYNTHETIC_TEST_DEAL_A`, `SYNTHETIC_CAMPAIGN_PREVIEW_A`, `SYNTHETIC_FIXTURE_PARTY_A`, `SYNTHETIC_FIXTURE_PARTY_B`, `SYNTHETIC_SAFE_PRESENTATION_A`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`, `SYNTHETIC_NO_DEAL_EXECUTED`; disposition tokens `CONTINUE REHEARSAL` and `HOLD REHEARSAL`; reset token `RESET`. No token may resemble a plausible person, organization, address, geography, property, money amount, date, UUID, contact detail or business record.

The console must always carry the visible warning `FIXTURE ONLY — NOT MATCHED OR RANKED` with the fixture pair. Stage node 4 reuses the existing G7 Safe Presentation component unchanged and passes the existing G8 synthetic input unchanged. G7 blocked/no-echo behavior and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged, and G9, G10, G11 and G12 token, order, meaning and verification semantics remain unchanged. The console cannot convert those artifacts into production evidence or approval.

Matching, candidate generation, scoring, confidence, qualification, risk, ranking, thresholds, contact, communication, campaign launch, deal execution and outcome recording are prohibited. Also prohibited: network, API, database, event or router integration; persistence, storage, cookies, cache, logging, diagnostics or telemetry; any ledger or persistent treatment of the non-occurrence panel; menu or default production-build exposure; forms, editable inputs, selectors or links; query/hash behavior; autoplay, timers or randomness; custom keyboard handlers; motion or animation; and workflow execution or business computation.

The page has no menu entry, application link or router registration and remains excluded from the default production build. No file outside the frozen nine-path allowlist may be created or modified.

## Required future verification

The future bounded test and manual browser smoke must prove: the closed nine-path boundary; all six stage nodes visible simultaneously on initial render, reload and `RESET`; the absence of any `NEXT`, `BACK`, stepper, current-panel hiding, progression or automatic transition; exact stage-node copy and order; the always-visible fixture warning `FIXTURE ONLY — NOT MATCHED OR RANKED`; unchanged G7 rendering of unchanged G8 input and unchanged G9–G12 semantics; the always-visible current-render-only non-occurrence panel never described as a ledger or persistent; both disposition choices producing only transient in-memory UI state while preserving the same `SYNTHETIC_NO_DEAL_EXECUTED` result; `RESET` and reload clearing the choice; native-control accessible names, live-region attributes, visible focus and native keyboard activation; responsive reflow without horizontal page scrolling at supported viewports; no motion and no prohibited behavior; and production isolation.

The sole future success label is `G13_SYNTHETIC_MATCHING_FLOW_CONSOLE_VERIFIED`. It is a package result, not a governance gate. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

## Governance

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `c3ab5c1c78d739d1e0cc59db88095e59083eef74`, and frozen exact-byte allowlist SHA-256 `293a762abe050c77db6a9aaab3d44c980e1b182259edc2dc758ae31d5bb8af67`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`; gate impact is `NONE`.
