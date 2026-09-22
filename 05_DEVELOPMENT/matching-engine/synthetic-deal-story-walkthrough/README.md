# G10 Synthetic Deal Story Walkthrough

## Current status

This directory is the documentation-only shell for package version `1.0` of an isolated synthetic deal-story walkthrough.

- Authorization date: `2026-09-22`
- Baseline branch: `development/sprint-7-matching-g10-synthetic-deal-story-walkthrough`
- Baseline commit: `fbf73505b8da915f7d8bf9218d8062f20a83625d`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G10_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `aed2142f2a4c75d704b21b6146e8bc8cd45f63aa1ab57b75d7a63c74c67a5ba3`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7, G8 and G9 remain unchanged.

## Frozen walkthrough behavior

The future page is a separate sibling of G9 and is manually accessible in development only at `http://127.0.0.1:5173/synthetic-deal-story-walkthrough.html`. Its HTML title and always-visible page title are exactly `SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED`. The other always-visible line is exactly `SCENARIO: SYNTHETIC_DEAL_STORY_A`.

The page has exactly five zero-based internal states presented as `STEP 1 OF 5` through `STEP 5 OF 5`. Initial load and reload show step 1. Only the current panel is visible:

1. `STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A`;
2. `STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A`;
3. `STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A`, followed by exact unchanged G7/G8 output `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, `SYNTHETIC_HEADING`, `SYNTHETIC_MESSAGE`;
4. `STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED`;
5. `OUTCOME — SYNTHETIC_NO_DEAL_EXECUTED` and `NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED`.

Exactly two native `type="button"` controls appear in logical DOM order `BACK`, then `NEXT`. `BACK` is disabled on step 1, `NEXT` on step 5. Transitions move exactly one step, are clamped and never wrap or skip. Navigation has `aria-label="SYNTHETIC WALKTHROUGH NAVIGATION"`; progress has `aria-live="polite"` and `aria-atomic="true"`; default keyboard focus is visible; only native `Enter` and `Space` activation is used. There is no motion.

Apart from title, scenario, current progress, current panel and `BACK`/`NEXT`, no other visible copy is authorized. Autoplay, timers, randomness, URL query/hash state, custom keyboard handlers, network calls, persistence, logging and diagnostics are prohibited.

## Required unchanged reuse

Step 3 reuses the G7 Safe Presentation component and G8 input unchanged: recipient `SYNTHETIC_RECIPIENT_A`, audience `SYNTHETIC_AUDIENCE_A`, purpose `SYNTHETIC_PURPOSE_STATIC_RENDER_TEST`, locale `x-leasemind-synthetic`, heading `SYNTHETIC_HEADING`, message `SYNTHETIC_MESSAGE`, with `stale=false`, `revoked=false`, `hash_matches=true` and `binding_matches=true`. The blocked/no-echo contract and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged. G9 story tokens, order, meaning and exclusions remain unchanged.

## Boundaries

Actual Matching or candidate generation; Scoring, Confidence, Risk, Qualification, ranking or thresholds; Campaign launch, deal execution, outcome recording, legal or financial action; Safe Presentation Policy approval; Data Contracts or carrier treatment; Controlled Artifact Manifest treatment; actual evidence or production applicability; and runtime, production build, deployment, API, database, event, storage, cache or telemetry behavior all remain `OPEN`, excluded and unimplemented.

No organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record is permitted. The page has no menu entry, application link or router registration and remains excluded from the default production build. No file outside the frozen nine-path allowlist may be created or modified. G7/G8/G9, application entry points, Vite configuration, package or lock files, API code and production route/build/deployment configuration are outside scope.

## Required verification

The future bounded test and manual browser smoke must prove the exact five states, initial/reload behavior, one-step navigation, endpoint disabled states, no wrapping/skipping, exact DOM order and accessibility attributes, native keyboard activation, visible focus, unchanged G7/G8/G9 reuse, no extra copy or prohibited behavior, production isolation and the closed nine-path boundary.

The sole future success label is `G10_SYNTHETIC_DEAL_STORY_WALKTHROUGH_VERIFIED`. It is a package result, not a governance gate, and proves none of the excluded capabilities. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `fbf73505b8da915f7d8bf9218d8062f20a83625d`, and frozen exact-byte allowlist SHA-256 `aed2142f2a4c75d704b21b6146e8bc8cd45f63aa1ab57b75d7a63c74c67a5ba3`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`; gate impact is `NONE`.
