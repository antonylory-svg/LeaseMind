# G14 Synthetic Match Review Workspace

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manual, development-only responsive product-shaped two-sided synthetic match review workspace.

- Authorization date: `2026-09-23`
- Baseline branch: `development/sprint-7-matching-g14-synthetic-match-review-workspace`
- Baseline commit: `8e39671176db17c5ecefbf79ebe63b5faf91630d`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G14_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `9c3bafee5592b7cb37434350ac9477d50a860f59330039aa4b4fff0d492069aa`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7, G8, G9, G10, G11, G12 and G13 remain byte-for-byte and semantically unchanged.

## What "two-sided" means here

The future workspace is a separate sibling page, manually accessible in development only at `http://127.0.0.1:5173/synthetic-match-review-workspace.html`. Its HTML title and always-visible page title are exactly `SYNTHETIC MATCH REVIEW WORKSPACE — NOT PRODUCTION APPROVED`. The other always-visible line is exactly `MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION`.

`two-sided` means an accessible page layout only. It is a responsive visual arrangement of co-displayed, always-visible regions on one page. It explicitly does not denote geography, tenancy, deployment, segmentation or routing, and no such meaning may be inferred from the layout. The `OWNER-SIDE NEED` and `TENANT-SIDE CANDIDATE` labels are UI rehearsal labels only and grant no business, property, money, contact or legal meaning.

## Two-sided co-display with preserved G13 flow

The workspace co-displays exactly two sides simultaneously and is never a stepper. It has no `NEXT`, no `BACK`, no current-region hiding, no progression and no automatic transition. The two sides are:

- `OWNER-SIDE NEED` with `OWNER-SIDE NEED — SYNTHETIC_FIXTURE_PARTY_A`;
- `TENANT-SIDE CANDIDATE` with `TENANT-SIDE CANDIDATE — SYNTHETIC_FIXTURE_PARTY_B`.

The always-adjacent warning `CO-DISPLAY ONLY — NOT COMPARED OR MATCHED` stays visible with the co-displayed sides, and the preserved G13 fixture-pair warning `FIXTURE ONLY — NOT MATCHED OR RANKED` stays visible with the pair. The two sides are co-displayed only; no comparison, compatibility, matching, scoring, confidence, ranking, eligibility or recommendation may be produced, shown or implied.

The G13 six-node sequence is preserved in token, order and meaning, and is never converted into a stepper:

1. `SYNTHETIC_TEST_DEAL_A` — pre-authored fixture evidence row;
2. `SYNTHETIC_CAMPAIGN_PREVIEW_A` — pre-authored fixture evidence row;
3. `SYNTHETIC_FIXTURE_PARTY_A` + `SYNTHETIC_FIXTURE_PARTY_B` — two-sided co-display;
4. `SYNTHETIC_SAFE_PRESENTATION_A` with `SYNTHETIC_HEADING` and `SYNTHETIC_MESSAGE` — unchanged G7 rendering of unchanged G8 input as exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`;
5. `HUMAN REHEARSAL DISPOSITION REQUIRED` — expressed only by the human rehearsal controls;
6. `SYNTHETIC_NO_DEAL_EXECUTED` — always-visible non-occurrence result.

## Pre-authored fixture evidence rows

Every visible evidence or reason row is exact pre-authored fixture copy that reuses only existing G12/G13 tokens and carries the always-adjacent exact label `PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED`. Rows are fixtures only. They are not requests, records, candidates, matches, rankings or outcomes, and they never trigger matching, scoring, confidence, Qualification, Risk, ranking, thresholding, contact, campaign launch, deal execution or outcome recording. Computed evidence and recommendations are prohibited.

## Always-visible non-occurrence result

The workspace shows one always-visible non-occurrence result with the exact token `SYNTHETIC_NO_DEAL_EXECUTED` and the statement `NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED`.

This result is bound to the current render only. It is not a ledger, not a persistent record, not an at-rest store and not reusable evidence, and it must never be described or treated as any of these. It stays visible for both rehearsal choices, after `RESET` and on reload.

## Interaction, state, accessibility and presentation

All controls are native `type="button"` elements and the only authorized controls are `REHEARSE INTEREST`, `REHEARSE HOLD` and `RESET`. The controls are contained in navigation whose `aria-label` is exactly `SYNTHETIC MATCH REVIEW WORKSPACE CONTROLS`; the rehearsal buttons are grouped with accessible name exactly `HUMAN REHEARSAL DISPOSITION`; the selection-status region has `aria-live="polite"` and `aria-atomic="true"`. Only native `Enter` and `Space` button activation is allowed, and focus must remain visibly discernible.

The only mutable state is transient, in-memory and non-persistent: the in-memory `REHEARSE INTEREST`/`REHEARSE HOLD` display choice and the `RESET` action that clears it. A chosen label must display with the exact transient disclaimer `UI REHEARSAL SELECTION ONLY — NOT APPROVAL`, and it transitions, hides, reorders or replaces no region. Neither choice is a decision, approval, workflow instruction, communication, transaction or business outcome. Both choices preserve the same always-visible `SYNTHETIC_NO_DEAL_EXECUTED` result. `RESET` clears the choice; a page reload also clears the choice because no state is persisted.

The future code scope includes presentation-ready, responsive, workspace-local styling with readable hierarchy, sufficient contrast, visible focus and reflow without horizontal page scrolling at supported viewports. Styling must not change G7–G13 or production styles. Motion and animation are prohibited.

## Frozen vocabulary and boundaries

The frozen closed abstract data vocabulary is bound by the `reused_g12_g13_tokens` array of the allowlist: `SYNTHETIC_TEST_DEAL_A`, `SYNTHETIC_CAMPAIGN_PREVIEW_A`, `SYNTHETIC_FIXTURE_PARTY_A`, `SYNTHETIC_FIXTURE_PARTY_B`, `SYNTHETIC_SAFE_PRESENTATION_A`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`, `SYNTHETIC_NO_DEAL_EXECUTED`; no additional data-bearing token is authorized. New structural, accessibility, control and warning copy is permitted only where its exact value is frozen in the authorization record and allowlist, including rehearsal controls `REHEARSE INTEREST`, `REHEARSE HOLD`, `RESET` and warnings `CO-DISPLAY ONLY — NOT COMPARED OR MATCHED`, `PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED`, `UI REHEARSAL SELECTION ONLY — NOT APPROVAL` and `FIXTURE ONLY — NOT MATCHED OR RANKED`. No token may resemble a plausible person, organization, address, geography, property, money amount, date, UUID, contact detail or business record.

The workspace must always carry the visible warning `CO-DISPLAY ONLY — NOT COMPARED OR MATCHED` with the two sides and the warning `FIXTURE ONLY — NOT MATCHED OR RANKED` with the fixture pair. Node 4 reuses the existing G7 Safe Presentation component unchanged and passes the existing G8 synthetic input unchanged. G7 blocked/no-echo behavior and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged, and G9, G10, G11, G12 and G13 token, order, meaning and verification semantics remain unchanged. The workspace cannot convert those artifacts into production evidence or approval.

Matching, candidate generation, comparison, compatibility, scoring, confidence, qualification, risk, ranking, thresholds, eligibility, recommendation, contact, communication, campaign launch, deal execution and outcome recording are prohibited. Also prohibited: network, API, database, event or router integration; persistence, storage, cookies, cache, logging, diagnostics or telemetry; any ledger or persistent treatment of the non-occurrence result; menu or default production-build exposure; forms, editable inputs, selectors or links; query/hash behavior; autoplay, timers or randomness; custom keyboard handlers; motion or animation; and workflow execution or business computation.

The page has no menu entry, application link or router registration and remains excluded from the default production build. No file outside the frozen nine-path allowlist may be created or modified.

## Required future verification

The future bounded test and manual browser smoke must prove: the closed nine-path boundary; both sides co-displayed simultaneously with the always-adjacent warning `CO-DISPLAY ONLY — NOT COMPARED OR MATCHED` on initial render, reload and `RESET`; the absence of any `NEXT`, `BACK`, stepper, current-region hiding, progression or automatic transition; exact preserved G13 six-node copy, order and meaning; every evidence or reason row being exact pre-authored fixture copy carrying the always-adjacent label `PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED` with no computed evidence or recommendation; the always-visible warning `FIXTURE ONLY — NOT MATCHED OR RANKED` with the fixture pair; unchanged G7 rendering of unchanged G8 input and unchanged G9–G13 semantics; the always-visible non-occurrence result never described as a ledger or persistent; both rehearsal choices producing only transient in-memory UI state with the exact disclaimer `UI REHEARSAL SELECTION ONLY — NOT APPROVAL` while preserving the same `SYNTHETIC_NO_DEAL_EXECUTED`; `RESET` and reload clearing the selection; native-button DOM order, accessible names, live-region attributes, visible focus and native keyboard activation; responsive reflow without horizontal page scrolling at supported viewports; no motion and no prohibited behavior; and production isolation.

The sole future success label is `G14_SYNTHETIC_MATCH_REVIEW_WORKSPACE_VERIFIED`. It is a package result, not a governance gate. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

## Governance

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `8e39671176db17c5ecefbf79ebe63b5faf91630d`, and frozen exact-byte allowlist SHA-256 `9c3bafee5592b7cb37434350ac9477d50a860f59330039aa4b4fff0d492069aa`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`; gate impact is `NONE`.
