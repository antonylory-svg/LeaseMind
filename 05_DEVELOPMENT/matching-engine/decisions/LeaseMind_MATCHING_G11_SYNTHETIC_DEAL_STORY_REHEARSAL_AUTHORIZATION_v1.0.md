# LeaseMind Matching G11 Synthetic Deal Story Rehearsal Authorization v1.0

**Artifact class:** non-canonical package authorization
**Authorization date:** `2026-09-23`
**Package version:** `1.0`
**Baseline branch:** `development/sprint-7-matching-g11-synthetic-deal-story-rehearsal`
**Baseline commit:** `301bdaf85213b17449ceaf7632afd1754c731e59`
**Frozen file allowlist:** `05_DEVELOPMENT/matching-engine/synthetic-deal-story-rehearsal/G11_FILE_ALLOWLIST_v1.0.json`
**Frozen allowlist SHA-256:** `8b59e5fd0e901e06efd26e0ab9391710334a323cdec1b11f236671070e80d023`
**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`
**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Authorization boundary

This record authorizes only the documentation phase for one isolated, manually opened, development-only synthetic deal-story rehearsal. It freezes package version `1.0`, the exact baseline, the exact-byte allowlist hash, the complete nine-path file boundary and the deterministic five-step display-only interaction contract. It does not authorize creation or modification of any path marked `planned`.

The code phase remains blocked until these three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase. Documentation authorship, silence, a package result label or any function approval below cannot substitute for those two prerequisites.

This package is non-canonical. It creates no `XFR` ID, changes no canonical decision or identity count, requires no Inventory change, and does not amend or supersede any existing decision. All G7, G8, G9 and G10 files, tokens, behavior and verification meaning must remain byte-for-byte and semantically unchanged.

## 2. Authorized rehearsal

The future rehearsal is a separate sibling of the G10 walkthrough and is manually opened in development only at exactly:

`http://127.0.0.1:5173/synthetic-deal-story-rehearsal.html`

Its HTML title and always-visible page title must be exactly:

`SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED`

The other always-visible lines must be exactly:

`SCENARIO: SYNTHETIC_DEAL_STORY_A`

`DISPLAY-ONLY REHEARSAL — NO WORKFLOW EXECUTION`

The rehearsal has exactly five zero-based internal states, `0` through `4`, presented as visible steps `1` through `5`. Initial load, reload and `RESTART` show step 1. Only the current G10 panel is visible. The exact progress and current-panel copy reuses G10 unchanged:

1. `STEP 1 OF 5` and `STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A`;
2. `STEP 2 OF 5` and `STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A`;
3. `STEP 3 OF 5`, `STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A`, followed by unchanged G7 rendering of the unchanged G8 input as exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`;
4. `STEP 4 OF 5` and `STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED`;
5. `STEP 5 OF 5`, `OUTCOME — SYNTHETIC_NO_DEAL_EXECUTED`, and `NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED`.

## 3. Frozen persistent summary

The page also keeps one summary visible at every step. Its heading is exactly:

`FIVE-STEP SYNTHETIC STORY`

Its ordered entries are exactly:

1. `STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A`;
2. `STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A`;
3. `STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A`;
4. `STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED`;
5. `STEP 5 — SYNTHETIC_NO_DEAL_EXECUTED`.

The summary list has `aria-label="SYNTHETIC STORY STEP SUMMARY"`. Exactly the current summary `li` has `aria-current="step"`; non-current items have no `aria-current` attribute. The summary is a static orientation aid only. It is not a timeline, completed-work assertion, workflow state, transaction record or selectable navigation control.

## 4. Frozen interaction and accessibility contract

Exactly three native `type="button"` controls are authorized, in logical DOM order:

1. `BACK`;
2. `NEXT`;
3. `RESTART`.

`BACK` and `RESTART` are disabled on step 1. `NEXT` is disabled on step 5. Each valid `BACK` or `NEXT` activation moves exactly one step and clamps state to the five-step range; wrapping, skipping and alternate transitions are prohibited. `RESTART` returns directly to step 1 and changes nothing else. Reload resets to step 1.

The buttons are contained in navigation whose `aria-label` is exactly `SYNTHETIC REHEARSAL NAVIGATION`. The progress container has `aria-live="polite"` and `aria-atomic="true"`. Default browser keyboard focus must remain visibly discernible. Only native `Enter` and `Space` button activation is used; custom keyboard handlers are prohibited. Motion and animation are prohibited.

Autoplay, timers, randomness, URL query or hash state, network calls, persistence, storage, cookies, logging and diagnostics are prohibited.

## 5. Required unchanged reuse

The current progress and panel reproduce the G10 five-state contract unchanged. Step 3 reuses the existing G7 Safe Presentation component unchanged and passes it the existing G8 input unchanged. G7 blocked/no-echo behavior and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged. G9 story tokens, order, meaning and exclusions remain unchanged. G10 behavior, copy and verification meaning remain unchanged; this sibling page does not modify G10.

## 6. Explicit OPEN exclusions

The following capabilities remain explicitly `OPEN`, excluded and unimplemented:

- actual Matching or candidate generation;
- Scoring, Confidence, Risk, Qualification, ranking or thresholds;
- Campaign launch, deal execution, outcome recording, or legal or financial action;
- Safe Presentation Policy approval;
- Data Contracts or carrier treatment;
- Controlled Artifact Manifest treatment;
- actual evidence or production applicability;
- runtime, production build, deployment, API, database, event, storage, cache or telemetry behavior.

The abstract story tokens, persistent summary and local current-step highlight are presentation-only. Local state navigation and `RESTART` do not execute, restart or assert an underlying workflow, operation, decision, transaction or approval.

## 7. Production isolation and frozen file boundary

The package must contain no organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record. It must introduce no actual business data, forms, inputs, links, selectors, query-driven behavior, inference, computation, network calls, persistence, logging, diagnostics or cookies.

The page must have no menu entry, application link or router registration and must remain excluded from the default production build. No file outside the exact frozen allowlist may be created or modified. Changes to any G7, G8, G9 or G10 artifact; `App.tsx`; `main.tsx`; `index.html`; any Vite configuration; any package manifest; any lockfile; API code or configuration; or any production route, build or deployment configuration are prohibited.

The sole authoritative path set is the closed `allowed_paths` array in `G11_FILE_ALLOWLIST_v1.0.json`, bound to package version `1.0`, baseline commit `301bdaf85213b17449ceaf7632afd1754c731e59`, and exact-byte SHA-256 `8b59e5fd0e901e06efd26e0ab9391710334a323cdec1b11f236671070e80d023`.

Exactly these three documentation artifacts are `present` in this phase: this authorization record, the package README and the frozen allowlist. Exactly six paths are `planned`: the standalone HTML page, frozen rehearsal scenario module, isolated rehearsal component, isolated entry module, bounded test and verification result. They must remain absent until the audit and confirmation prerequisite is satisfied. The allowlist omits its own hash to avoid self-reference; this record and the README bind its final bytes.

## 8. Required bounded verification

A separately authorized future code package must verify at minimum:

- the closed nine-path boundary and absence of changes outside it;
- exact initial, reload and restart state at `STEP 1 OF 5`;
- all five exact G10 progress and current-panel states in order;
- the always-visible title, scenario, disclaimer, heading and five ordered summary entries;
- exactly the current summary `li` has `aria-current="step"`;
- `NEXT` and `BACK` one-step transitions, endpoint disabled states, clamping, and absence of wrap or skip;
- `RESTART` returns to step 1 and is disabled there;
- exactly three native buttons in logical DOM order `BACK`, `NEXT`, `RESTART`;
- exact navigation, live-region and summary accessibility attributes, visible default focus, and native keyboard activation;
- unchanged G7/G8/G9/G10 artifacts and rendering;
- no forbidden behavior, network request, persistence, logging, diagnostics, motion, workflow execution or production exposure;
- manual browser smoke at the exact development-only URL without application or default production-build integration.

## 9. Verification and non-conflation

If the separately authorized future code package passes bounded verification, its sole result label is:

`G11_SYNTHETIC_DEAL_STORY_REHEARSAL_VERIFIED`

This is a package verification result only, not a governance gate. It does not mean a match, score, confidence, Qualification, Risk decision, ranking, threshold, campaign launch, deal, outcome, approval, workflow execution or production operation occurred. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment authority.

## 10. Approval matrix

All five functions approve the same documentation boundary, package version `1.0`, baseline commit `301bdaf85213b17449ceaf7632afd1754c731e59`, and frozen exact-byte allowlist SHA-256 `8b59e5fd0e901e06efd26e0ab9391710334a323cdec1b11f236671070e80d023`.

| Function | Decision | Exact scope |
|---|---|---|
| `PRODUCT` | `APPROVED` | Persistent five-step summary and deterministic rehearsal of the unchanged abstract story on one manually opened dev-only sibling page |
| `LEGAL` | `APPROVED` | Synthetic-only fixed labels and local display state; no person, organization, asset, transaction, legal or financial action |
| `Chief AI Architect` | `APPROVED` | Unchanged G7–G10 reuse, non-conflation and closed nine-path boundary |
| `AI` | `APPROVED` | Exact five states and summary tokens; no matching, scoring, inference, workflow execution or decision |
| `DEVELOPMENT` | `APPROVED` | Exact baseline, navigation/accessibility contract, bounded verification and production isolation constraints |

`SECURITY/DLP` supplies evidence only. Its evidence may inform the independent audit, but it is not an approving function and cannot authorize the code phase or change Policy, Data Contracts, carrier, manifest, production, runtime or gate state.

## 11. Gate state

Gate impact is `NONE`. All three governance gates remain unchanged:

- `IMPLEMENTATION_READINESS_GATE`: `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE`: `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE`: `BLOCKED`.

## 12. Authorization conclusion

`G11 SYNTHETIC DEAL STORY REHEARSAL DOCUMENTATION PACKAGE AUTHORIZED — CODE FILE CREATION REQUIRES INDEPENDENT AUDIT AND SUBSEQUENT EXPLICIT HUMAN CONFIRMATION; G7/G8/G9/G10 HISTORY, MATCHING, SCORING, CONFIDENCE, QUALIFICATION, RISK, CAMPAIGN, DEAL, OUTCOME, WORKFLOW EXECUTION, POLICY, DATA CONTRACTS, CARRIER, MANIFEST, EVIDENCE, PRODUCTION, RUNTIME, IMPLEMENTATION AND ALL THREE GATES REMAIN OPEN/BLOCKED.`
