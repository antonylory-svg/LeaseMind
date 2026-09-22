# G9 Synthetic Deal Story Visible Demo

## Current status

This directory is the documentation-only shell for package version `1.0` of an isolated synthetic deal-story visible demo.

- Authorization date: `2026-09-22`
- Baseline branch: `development/sprint-7-matching-g9-synthetic-deal-story-visible-demo`
- Baseline commit: `1c1c31d25dd70579d57ed07b8f6cf057f8403340`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G9_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `45fba78599108ed604ab8f87862f77c3f3cc7659417bc241ca9cf5f925d281a9`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase. The Cline/DeepSeek attempt returned `402 Insufficient Balance`; fallback authorship is not the required independent audit.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. G7 and G8 remain unchanged.

## Frozen demo behavior

The future page is a sibling of G8 and is manually accessible in development only at `http://127.0.0.1:5173/synthetic-deal-story-demo.html`. Its HTML title is exactly `SYNTHETIC DEAL STORY DEMO — NOT PRODUCTION APPROVED`.

Its complete visible body is exactly these **11 lines in this order**; it is not a ten-line list:

1. `SYNTHETIC DEAL STORY — NOT PRODUCTION APPROVED`
2. `SCENARIO: SYNTHETIC_DEAL_STORY_A`
3. `STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A`
4. `STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A`
5. `STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A`
6. `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`
7. `SYNTHETIC_HEADING`
8. `SYNTHETIC_MESSAGE`
9. `STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED`
10. `OUTCOME — SYNTHETIC_NO_DEAL_EXECUTED`
11. `NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED`

The page must reuse the G7 Safe Presentation component and the G8 input unchanged: recipient `SYNTHETIC_RECIPIENT_A`, audience `SYNTHETIC_AUDIENCE_A`, purpose `SYNTHETIC_PURPOSE_STATIC_RENDER_TEST`, locale `x-leasemind-synthetic`, heading `SYNTHETIC_HEADING`, message `SYNTHETIC_MESSAGE`, with `stale=false`, `revoked=false`, `hash_matches=true` and `binding_matches=true`. The blocked/no-echo contract and exact blocked output `SYNTHETIC PRESENTATION BLOCKED` remain unchanged.

## Boundaries

Actual Matching or candidate generation; Scoring, Confidence, Risk, Qualification, ranking or thresholds; Campaign launch, deal execution, outcome recording, legal or financial action; Safe Presentation Policy approval; Data Contracts or carrier treatment; Controlled Artifact Manifest treatment; actual evidence or production applicability; and runtime, production build, deployment, API, database, event, storage, cache or telemetry behavior all remain `OPEN`, excluded and unimplemented.

No organization, person, address, geography, contact detail, property category, money, date, UUID or plausible business record is permitted. Controls, forms, query behavior, links, selectors, new dynamic copy, network calls, persistence, logging, diagnostics and cookies are prohibited.

The page has no menu entry, application link or router registration and remains excluded from the default production build. Changes to G7/G8 history, `App.tsx`, `main.tsx`, `index.html`, Vite configuration, package or lock files, API code, and production route, build or deployment configuration are prohibited. No path outside the frozen nine-path allowlist may be created or modified.

## Meaning of verification

The sole future success label is `G9_SYNTHETIC_DEAL_STORY_VISIBLE_DEMO_VERIFIED`. It is a package result, not a governance gate, and proves none of the excluded capabilities. It grants no Policy, Data Contracts, carrier, manifest, evidence, production, runtime, implementation, build or deployment approval.

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `1c1c31d25dd70579d57ed07b8f6cf057f8403340`, and frozen exact-byte allowlist SHA-256 `45fba78599108ed604ab8f87862f77c3f3cc7659417bc241ca9cf5f925d281a9`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.

