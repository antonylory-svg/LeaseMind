# G8 Synthetic Safe Presentation Visible Demo

## Current status

This directory is the documentation-only shell for package version `1.0` of an isolated, manually opened synthetic Safe Presentation visible demo.

- Authorization date: `2026-09-22`
- Baseline branch: `development/sprint-7-matching-g8-synthetic-safe-presentation-visible-demo`
- Baseline commit: `a6d5edb23c025040487d30d2c41ac5e0b18fccd5`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G8_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `878ee8c31217b685c27aaa33c04e56ab973812637665351db30cce6b4e2e96eb`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

This package is non-canonical, creates no `XFR` ID and requires no Inventory change. All G7 historical artifacts remain untouched.

## Frozen demo behavior

The future page is manually accessible in development only at `http://127.0.0.1:5173/safe-presentation-synthetic-demo.html`. Its HTML title is exactly `SYNTHETIC SAFE PRESENTATION DEMO — NOT PRODUCTION APPROVED`.

It must use the existing G7 component with exactly:

- `recipient`: `SYNTHETIC_RECIPIENT_A`
- `audience`: `SYNTHETIC_AUDIENCE_A`
- `purpose`: `SYNTHETIC_PURPOSE_STATIC_RENDER_TEST`
- `locale`: `x-leasemind-synthetic`
- `heading`: `SYNTHETIC_HEADING`
- `message`: `SYNTHETIC_MESSAGE`
- `stale`: `false`
- `revoked`: `false`
- `hash_matches`: `true`
- `binding_matches`: `true`

The visible body must contain exactly the watermark `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, heading `SYNTHETIC_HEADING`, and message `SYNTHETIC_MESSAGE`. No additional visible copy, buttons, query behavior, editable input, selectors or other interaction is authorized.

The page has no menu entry, application link or router registration and is excluded from the default production build. Changes to `App.tsx`, `main.tsx`, `index.html`, Vite configuration, package or lock files, API code, and production route, build or deployment configuration are prohibited. Network, storage, cache, telemetry, persistence, logging and diagnostics are prohibited.

The G7 blocked output remains exactly `SYNTHETIC PRESENTATION BLOCKED`. Rejected input must never be echoed or partially rendered.

## Meaning of verification

The sole future success label is `G8_SYNTHETIC_VISIBLE_DEMO_VERIFIED`. It is package verification, not a governance gate, and grants no Policy, Data Contracts, manifest, production, runtime, implementation, build or deployment approval.

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, package version `1.0`, baseline commit `a6d5edb23c025040487d30d2c41ac5e0b18fccd5`, and frozen exact-byte allowlist SHA-256 `878ee8c31217b685c27aaa33c04e56ab973812637665351db30cce6b4e2e96eb`. `SECURITY/DLP` provides evidence only and has no approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.

