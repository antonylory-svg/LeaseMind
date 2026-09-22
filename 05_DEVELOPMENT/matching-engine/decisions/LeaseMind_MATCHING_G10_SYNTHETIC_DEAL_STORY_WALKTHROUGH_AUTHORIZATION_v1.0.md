# LeaseMind Matching G10 Synthetic Deal Story Walkthrough Authorization v1.0

**Artifact class:** non-canonical package authorization
**Authorization date:** `2026-09-22`
**Package version:** `1.0`
**Baseline branch:** `development/sprint-7-matching-g10-synthetic-deal-story-walkthrough`
**Baseline commit:** `fbf73505b8da915f7d8bf9218d8062f20a83625d`
**Frozen file allowlist:** `05_DEVELOPMENT/matching-engine/synthetic-deal-story-walkthrough/G10_FILE_ALLOWLIST_v1.0.json`
**Frozen allowlist SHA-256:** `aed2142f2a4c75d704b21b6146e8bc8cd45f63aa1ab57b75d7a63c74c67a5ba3`
**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`
**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Authorization boundary

This record authorizes only the documentation phase for one isolated, manually opened, development-only synthetic deal-story walkthrough. It freezes package version `1.0`, the exact baseline, the exact-byte allowlist hash, the complete nine-path file boundary and the deterministic five-step interaction contract. It does not authorize creation or modification of any path marked `planned`.

The code phase remains blocked until these three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase. Documentation authorship, silence, a package result label or any function approval below cannot substitute for those two prerequisites.

This package is non-canonical. It creates no `XFR` ID, changes no canonical decision or identity count, requires no Inventory change, and does not amend or supersede any existing decision. All G7, G8 and G9 files, tokens, behavior and verification meaning must remain byte-for-byte and semantically unchanged.

## 2. Authorized walkthrough

The future walkthrough is a separate sibling of the G9 visible demo and is manually opened in development only at exactly:

`http://127.0.0.1:5173/synthetic-deal-story-walkthrough.html`

Its HTML title and always-visible page title must be exactly:

`SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED`

The second always-visible line must be exactly:

`SCENARIO: SYNTHETIC_DEAL_STORY_A`

The walkthrough has exactly five zero-based internal states, `0` through `4`, presented as visible steps `1` through `5`. Initial load and every reload show step 1. Only the current panel is visible. The exact progress and panel copy is:

1. `STEP 1 OF 5` and `STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A`;
2. `STEP 2 OF 5` and `STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A`;
3. `STEP 3 OF 5`, `STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A`, followed by the unchanged G7 component rendering the unchanged G8 input as exactly `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`;
4. `STEP 4 OF 5` and `STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED`;
5. `STEP 5 OF 5`, `OUTCOME — SYNTHETIC_NO_DEAL_EXECUTED`, and `NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED`.

Apart from the two always-visible lines, the current progress line, the current panel lines and the two controls specified below, no other visible copy is authorized.

## 3. Frozen interaction and accessibility contract

Exactly two native `type="button"` controls are authorized, in logical DOM order:

1. `BACK`;
2. `NEXT`.

`BACK` is disabled on step 1. `NEXT` is disabled on step 5. Each valid activation moves exactly one step backward or forward. State is clamped to the five-step range; wrapping, skipping and alternate transitions are prohibited. Reload resets to step 1.

The two buttons are contained in navigation whose `aria-label` is exactly `SYNTHETIC WALKTHROUGH NAVIGATION`. The progress container has `aria-live="polite"` and `aria-atomic="true"`. Default browser keyboard focus must remain visibly discernible. Only native `Enter` and `Space` button activation is used; custom keyboard handlers are prohibited. Motion and animation are prohibited.

Autoplay, timers, randomness, URL query or hash state, network calls, persistence, storage, cookies, logging and diagnostics are prohibited.

## 4. Required unchanged reuse

Step 3 must reuse the existing G7 Safe Presentation component unchanged and pass it the existing G8 input unchanged:

- recipient: `SYNTHETIC_RECIPIENT_A`;
- audience: `SYNTHETIC_AUDIENCE_A`;
- purpose: `SYNTHETIC_PURPOSE_STATIC_RENDER_TEST`;
- locale: `x-leasemind-synthetic`;
- heading: `SYNTHETIC_HEADING`;
- message: `SYNTHETIC_MESSAGE`;
- stale: `false`;
- revoked: `false`;
- hash_matches: `true`;
- binding_matches: `true`.

The G7 blocked/no-echo behavior and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged. Rejected input must never be echoed, interpolated, partially rendered, logged, persisted or included in diagnostics. G10 may reveal the already frozen G9 abstract story one step at a time, but must not change its tokens, order, meaning or exclusions.

## 5. Explicit OPEN exclusions

The following capabilities remain explicitly `OPEN`, excluded and unimplemented:

- actual Matching or candidate generation;
- Scoring, Confidence, Risk, Qualification, ranking or thresholds;
- Campaign launch, deal execution, outcome recording, or legal or financial action;
- Safe Presentation Policy approval;
- Data Contracts or carrier treatment;
- Controlled Artifact Manifest treatment;
- actual evidence or production applicability;
- runtime, production build, deployment, API, database, event, storage, cache or telemetry behavior.

The abstract story tokens are presentation-only labels. State navigation is local display state only. Neither the current step nor a button activation asserts that an underlying workflow, operation, decision, transaction or approval occurred.

## 6. Explicit prohibitions and production isolation

The package must contain no organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record. It must introduce no actual business data, controls beyond `BACK` and `NEXT`, forms, inputs, links, selectors, query-driven behavior, new dynamic copy, inference, computation, network calls, persistence, logging, diagnostics or cookies.

The page must have no menu entry, application link or router registration and must remain excluded from the default production build. No file outside the exact frozen allowlist may be created or modified. Changes to any G7, G8 or G9 artifact; `App.tsx`; `main.tsx`; `index.html`; any Vite configuration; any package manifest; any lockfile; API code or configuration; or any production route, build or deployment configuration are prohibited. Renames, alternate casing, generated snapshots and incidental formatting or configuration changes are outside scope.

## 7. Frozen file boundary

The sole authoritative path set is the closed `allowed_paths` array in `G10_FILE_ALLOWLIST_v1.0.json`, bound to package version `1.0`, baseline commit `fbf73505b8da915f7d8bf9218d8062f20a83625d`, and exact-byte SHA-256 `aed2142f2a4c75d704b21b6146e8bc8cd45f63aa1ab57b75d7a63c74c67a5ba3`.

Exactly these three documentation artifacts are `present` in this phase:

1. this authorization record;
2. `05_DEVELOPMENT/matching-engine/synthetic-deal-story-walkthrough/README.md`;
3. `05_DEVELOPMENT/matching-engine/synthetic-deal-story-walkthrough/G10_FILE_ALLOWLIST_v1.0.json`.

Exactly six paths are `planned`: the standalone HTML page, frozen scenario module, isolated walkthrough component, isolated entry module, bounded test and verification result listed in the allowlist. They must remain absent until the independent-audit and explicit-human-confirmation prerequisite is satisfied. The allowlist omits its own hash to avoid self-reference; this record and the README bind its final bytes.

## 8. Required bounded verification

A separately authorized future code package must verify at minimum:

- the closed nine-path boundary and absence of changes outside it;
- exact initial and reload state at `STEP 1 OF 5`;
- all five exact progress and panel-copy states in order;
- `NEXT` and `BACK` one-step transitions, endpoint disabled states, clamping, and absence of wrap or skip;
- exactly two native buttons in logical DOM order `BACK`, then `NEXT`;
- the exact navigation and live-region accessibility attributes, visible default focus, and native keyboard activation;
- unchanged G7/G8/G9 artifacts, unchanged G8 input and unchanged G7 rendered and blocked outputs;
- no extra visible copy, forbidden behavior, network request, persistence, logging, diagnostics, motion or production exposure;
- manual browser smoke at the exact development-only URL without integrating the page into the application or default production build.

## 9. Verification and non-conflation

If the separately authorized future code package passes bounded verification, its sole result label is:

`G10_SYNTHETIC_DEAL_STORY_WALKTHROUGH_VERIFIED`

This is a package verification result only, not a governance gate. It does not mean a match, score, confidence, Qualification, Risk decision, ranking, threshold, campaign launch, deal, outcome, approval or production operation occurred. It grants no Safe Presentation Policy approval, Data Contracts or carrier treatment, Controlled Artifact Manifest treatment, actual evidence, production applicability, runtime approval, implementation readiness, production build or deployment authority.

## 10. Approval matrix

All five functions approve the same documentation boundary, package version `1.0`, baseline commit `fbf73505b8da915f7d8bf9218d8062f20a83625d`, and frozen exact-byte allowlist SHA-256 `aed2142f2a4c75d704b21b6146e8bc8cd45f63aa1ab57b75d7a63c74c67a5ba3`.

| Function | Decision | Exact scope |
|---|---|---|
| `PRODUCT` | `APPROVED` | Deterministic five-step reveal of the unchanged abstract G9 story on one manually opened dev-only sibling page |
| `LEGAL` | `APPROVED` | Synthetic-only fixed labels and local display state; no person, organization, asset, transaction, legal or financial action |
| `Chief AI Architect` | `APPROVED` | Unchanged G7/G8/G9 reuse, non-conflation and closed nine-path boundary |
| `AI` | `APPROVED` | Exact five states and tokens; no matching, scoring, inference or decision |
| `DEVELOPMENT` | `APPROVED` | Exact baseline, navigation/accessibility contract, bounded verification and production isolation constraints |

`SECURITY/DLP` supplies evidence only. Its evidence may inform the independent audit, but it is not an approving function, cannot authorize the code phase, and cannot change Policy, Data Contracts, carrier, manifest, production, runtime or gate state.

## 11. Gate state

Gate impact is `NONE`. All three governance gates remain unchanged:

- `IMPLEMENTATION_READINESS_GATE`: `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE`: `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE`: `BLOCKED`.

## 12. Authorization conclusion

`G10 SYNTHETIC DEAL STORY WALKTHROUGH DOCUMENTATION PACKAGE AUTHORIZED — CODE FILE CREATION REQUIRES INDEPENDENT AUDIT AND SUBSEQUENT EXPLICIT HUMAN CONFIRMATION; G7/G8/G9 HISTORY, MATCHING, SCORING, CONFIDENCE, QUALIFICATION, RISK, CAMPAIGN, DEAL, OUTCOME, POLICY, DATA CONTRACTS, CARRIER, MANIFEST, EVIDENCE, PRODUCTION, RUNTIME, IMPLEMENTATION AND ALL THREE GATES REMAIN OPEN/BLOCKED.`
