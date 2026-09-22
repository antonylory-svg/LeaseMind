# LeaseMind Matching G8 Synthetic Safe Presentation Visible Demo Authorization v1.0

**Artifact class:** non-canonical package authorization  
**Authorization date:** `2026-09-22`  
**Package version:** `1.0`  
**Baseline branch:** `development/sprint-7-matching-g8-synthetic-safe-presentation-visible-demo`  
**Baseline commit:** `a6d5edb23c025040487d30d2c41ac5e0b18fccd5`  
**Frozen file allowlist:** `05_DEVELOPMENT/matching-engine/safe-presentation-synthetic-visible-demo/G8_FILE_ALLOWLIST_v1.0.json`  
**Frozen allowlist SHA-256:** `878ee8c31217b685c27aaa33c04e56ab973812637665351db30cce6b4e2e96eb`  
**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`  
**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Authorization boundary

This record authorizes only the documentation phase for one isolated synthetic Safe Presentation visible demo. It freezes package version `1.0`, the exact baseline, the exact-byte allowlist hash and the complete eight-path file boundary. It does not authorize creation of any path marked `planned`.

The code phase remains blocked until these three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase. Silence, a successful audit, this record or any function approval below cannot substitute for that explicit confirmation.

This package is non-canonical. It creates no `XFR` ID, changes no canonical decision or identity count, requires no Inventory change, and does not amend or supersede any existing decision. All G7 historical artifacts must remain untouched.

## 2. Authorized visible demo

The future demo is one manually opened, dev-only page at exactly:

`http://127.0.0.1:5173/safe-presentation-synthetic-demo.html`

Its HTML title must be exactly:

`SYNTHETIC SAFE PRESENTATION DEMO — NOT PRODUCTION APPROVED`

The page must use the already verified G7 Safe Presentation component and exactly this closed synthetic input:

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

The visible body must contain the exact watermark `SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`, the exact heading `SYNTHETIC_HEADING`, and the exact message `SYNTHETIC_MESSAGE`. No other visible copy is authorized.

The page must not contain buttons, query-driven behavior, editable input, selectors or any other interaction. It must have no menu entry, application link or router registration, and must be excluded from the default production build. Manual entry of the exact local dev URL is the only authorized access mechanism.

## 3. Preservation of the G7 safety contract

The visible demo may only supply the frozen input above to the existing G7 component. It must not weaken, fork, duplicate or replace the G7 projection and rendering rules.

For stale, revoked, hash mismatch, binding mismatch, malformed input, unknown token, additional property, prohibited content or any other invalid condition, the sole permitted presentation output remains exactly:

`SYNTHETIC PRESENTATION BLOCKED`

Rejected input must never be echoed, interpolated, rendered, logged, persisted or included in diagnostics. A blocked result must not partially render an accepted field.

## 4. Explicit prohibitions

No file outside the exact frozen allowlist may be created or modified. In particular, this authorization prohibits changes to `App.tsx`, `main.tsx`, `index.html`, any Vite configuration, any package manifest, any lockfile, API code or configuration, and any production route, build or deployment configuration.

The package must introduce no network call, storage, cache, telemetry, persistence, logging or diagnostic behavior. It must introduce no real or production-like data, no new user-facing copy, no API behavior and no production interface. Renames, alternate casing, generated snapshots and incidental formatting or configuration changes are outside scope.

## 5. Frozen file boundary

The sole authoritative path set is the closed `allowed_paths` array in `G8_FILE_ALLOWLIST_v1.0.json`, bound to package version `1.0`, baseline commit `a6d5edb23c025040487d30d2c41ac5e0b18fccd5`, and exact-byte SHA-256 `878ee8c31217b685c27aaa33c04e56ab973812637665351db30cce6b4e2e96eb`.

Exactly these three documentation artifacts are `present` in this phase:

1. this authorization record;
2. `05_DEVELOPMENT/matching-engine/safe-presentation-synthetic-visible-demo/README.md`;
3. `05_DEVELOPMENT/matching-engine/safe-presentation-synthetic-visible-demo/G8_FILE_ALLOWLIST_v1.0.json`.

Exactly five paths are `planned`: the standalone HTML page, fixed synthetic input module, isolated entry module, bounded test, and verification result listed in the allowlist. They must remain absent until the independent-audit and explicit-human-confirmation prerequisite is satisfied. The allowlist omits its own hash to avoid self-reference; this record and the README bind its final bytes.

## 6. Verification and non-conflation

If the separately authorized future code package passes bounded verification, its sole result label is:

`G8_SYNTHETIC_VISIBLE_DEMO_VERIFIED`

This label is a package verification result only. It is not a governance gate, does not imply `SYNTHETIC_ACCEPTANCE_GATE`, and grants no Safe Presentation Policy approval, Data Contracts approval or extension, Controlled Artifact Manifest treatment, production applicability, runtime approval, implementation readiness, production build or deployment authority.

## 7. Approval matrix

All five functions approve the same documentation boundary, package version `1.0`, baseline commit `a6d5edb23c025040487d30d2c41ac5e0b18fccd5`, and frozen exact-byte allowlist SHA-256 `878ee8c31217b685c27aaa33c04e56ab973812637665351db30cce6b4e2e96eb`.

| Function | Decision | Exact scope |
|---|---|---|
| `PRODUCT` | `APPROVED` | Manual dev-only visible demo; no menu, route or production exposure |
| `LEGAL` | `APPROVED` | Synthetic-only content and no-production-applicability boundary |
| `Chief AI Architect` | `APPROVED` | G7 reuse, non-conflation and closed package boundary |
| `AI` | `APPROVED` | Exact input/output contract and blocked/no-echo behavior |
| `DEVELOPMENT` | `APPROVED` | Exact baseline, eight-path allowlist and build isolation constraints |

`SECURITY/DLP` supplies evidence only. Its evidence may inform the independent audit, but it is not an approving function, cannot authorize the code phase, and cannot change Policy, Data Contracts, manifest, production, runtime or gate state.

## 8. Gate state

Gate impact is `NONE`. All three governance gates remain unchanged:

- `IMPLEMENTATION_READINESS_GATE`: `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE`: `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE`: `BLOCKED`.

## 9. Authorization conclusion

`G8 SYNTHETIC SAFE PRESENTATION VISIBLE DEMO DOCUMENTATION PACKAGE AUTHORIZED — CODE FILE CREATION REQUIRES INDEPENDENT AUDIT AND SUBSEQUENT EXPLICIT HUMAN CONFIRMATION; G7 HISTORY, POLICY, DATA CONTRACTS, MANIFEST, PRODUCTION, RUNTIME, IMPLEMENTATION AND ALL THREE GATES REMAIN OPEN/BLOCKED.`

