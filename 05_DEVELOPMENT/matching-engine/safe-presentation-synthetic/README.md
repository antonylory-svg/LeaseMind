# G7 Synthetic Safe Presentation Reference Package

## Current status

This directory is the documentation-only shell for package version `1.0` of an isolated, unreachable synthetic reference/demo.

- Authorization date: `2026-09-22`
- Baseline branch: `development/sprint-7-matching-g7-synthetic-safe-presentation-slice`
- Baseline commit: `91271b53aa50a9530a0ee3967975b3d286798e12`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G7_FILE_ALLOWLIST_v1.0.json`
- Frozen allowlist SHA-256: `a137d9ae6c4e7639ffeb4f1fc57e0674157336ecb5b7e9a3578db13668c33c9e`

Only this README, the frozen allowlist and the authorization record are present in the authorization phase. Every allowlist entry marked `planned` must remain absent until these three artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

## Frozen behavior

The future package is a static synthetic reference only. It must be unreachable from application routes, menus, APIs and production code paths. Its closed schema may accept only the exact abstract tokens below:

- `SYNTHETIC_RECIPIENT_A`
- `SYNTHETIC_AUDIENCE_A`
- `SYNTHETIC_PURPOSE_STATIC_RENDER_TEST`
- `x-leasemind-synthetic`
- `SYNTHETIC_HEADING`
- `SYNTHETIC_MESSAGE`

Successful reference output must visibly show `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`.

Stale, revoked, hash mismatch, binding mismatch, unknown enum, additional property and prohibited-content inputs must produce only `SYNTHETIC PRESENTATION BLOCKED`. Rejected input must never be echoed or partially rendered.

Real identifiers, addresses, contacts, geography, free text, real categories, scores, risk, Qualification and production-like data are prohibited. API behavior, databases, network calls, caching, telemetry and persistence are prohibited. Changes to `App.tsx`, `main.tsx`, API implementation, Vite configuration and package or lock files are prohibited.

## Meaning of verification

The sole future success label is `G7_SYNTHETIC_REFERENCE_PACKAGE_VERIFIED`. It is explicitly not `SYNTHETIC_ACCEPTANCE_GATE` and grants no gate transition.

This non-canonical package creates no `XFR` ID and changes no Inventory identity or count. It preserves G6 and the independent authority and non-conflation boundaries of `XFR-D-072`, `XFR-D-078`, `XFR-D-079`, `XFR-D-080`, `XFR-D-081`, `XFR-D-082`, `XFR-D-083` and `XFR-D-084`. It approves no Safe Presentation Policy, Data Contracts extension, Controlled Artifact Manifest treatment, production applicability, runtime or implementation.

The five functions `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve one frozen version/hash for this documentation boundary. `SECURITY/DLP` supplies evidence input only and has no unilateral approval authority.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.

