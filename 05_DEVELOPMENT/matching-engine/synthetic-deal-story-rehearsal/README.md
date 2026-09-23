# G11 Synthetic Deal Story Rehearsal

## Current status

This directory is the documentation-only shell for package version `1.0` of an isolated synthetic deal-story rehearsal.

- Authorization date: `2026-09-23`
- Baseline branch: `development/sprint-7-matching-g11-synthetic-deal-story-rehearsal`
- Baseline commit: `301bdaf85213b17449ceaf7632afd1754c731e59`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G11_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `8b59e5fd0e901e06efd26e0ab9391710334a323cdec1b11f236671070e80d023`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7, G8, G9 and G10 remain unchanged.

## Frozen rehearsal behavior

The future page is a separate sibling of G10 and is manually accessible in development only at `http://127.0.0.1:5173/synthetic-deal-story-rehearsal.html`. Its HTML title and always-visible page title are exactly `SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED`. The other always-visible lines are exactly `SCENARIO: SYNTHETIC_DEAL_STORY_A` and `DISPLAY-ONLY REHEARSAL — NO WORKFLOW EXECUTION`.

The page reuses G10's five progress and current-panel states unchanged. Initial load, reload and `RESTART` show step 1. Only the current panel is visible. Step 3 reuses unchanged G7 rendering of unchanged G8 input; G9 tokens and meaning remain unchanged.

The persistent summary heading is exactly `FIVE-STEP SYNTHETIC STORY`, and its ordered entries are exactly:

1. `STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A`;
2. `STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A`;
3. `STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A`;
4. `STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED`;
5. `STEP 5 — SYNTHETIC_NO_DEAL_EXECUTED`.

The summary list has `aria-label="SYNTHETIC STORY STEP SUMMARY"`. Exactly the current `li` has `aria-current="step"`. The summary is display-only and is not workflow history or navigation.

Exactly three native `type="button"` controls appear in logical DOM order `BACK`, `NEXT`, `RESTART`. `BACK` and `RESTART` are disabled on step 1; `NEXT` is disabled on step 5. Back/next transitions move exactly one clamped step and never wrap or skip. Restart returns to step 1. Navigation has `aria-label="SYNTHETIC REHEARSAL NAVIGATION"`; progress has `aria-live="polite"` and `aria-atomic="true"`; default keyboard focus is visible; only native `Enter` and `Space` activation is used. There is no motion.

Autoplay, timers, randomness, URL query/hash state, custom keyboard handlers, network calls, persistence, logging, diagnostics and workflow execution are prohibited.

## Boundaries

Actual Matching or candidate generation; Scoring, Confidence, Risk, Qualification, ranking or thresholds; Campaign launch, deal execution, outcome recording, legal or financial action; Safe Presentation Policy approval; Data Contracts or carrier treatment; Controlled Artifact Manifest treatment; actual evidence or production applicability; and runtime, production build, deployment, API, database, event, storage, cache or telemetry behavior all remain `OPEN`, excluded and unimplemented.

No organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record is permitted. The page has no menu entry, application link or router registration and remains excluded from the default production build. No file outside the frozen nine-path allowlist may be created or modified. G7–G10, application entry points, Vite configuration, package or lock files, API code and production route/build/deployment configuration are outside scope.

## Required verification

The future bounded test and manual browser smoke must prove the exact five G10 states, initial/reload/restart behavior, persistent summary and current-item semantics, one-step navigation, endpoint disabled states, no wrapping/skipping, exact three-button DOM order and accessibility attributes, native keyboard activation, visible focus, unchanged G7–G10 reuse, no prohibited behavior, production isolation and the closed nine-path boundary.

The sole future success label is `G11_SYNTHETIC_DEAL_STORY_REHEARSAL_VERIFIED`. It is a package result, not a governance gate, and proves none of the excluded capabilities. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `301bdaf85213b17449ceaf7632afd1754c731e59`, and frozen exact-byte allowlist SHA-256 `8b59e5fd0e901e06efd26e0ab9391710334a323cdec1b11f236671070e80d023`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`; gate impact is `NONE`.
