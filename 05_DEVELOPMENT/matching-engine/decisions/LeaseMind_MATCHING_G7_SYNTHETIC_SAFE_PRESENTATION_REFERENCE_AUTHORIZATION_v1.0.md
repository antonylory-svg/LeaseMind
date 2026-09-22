# LeaseMind Matching G7 Synthetic Safe Presentation Reference Authorization v1.0

**Artifact class:** non-canonical package authorization  
**Authorization date:** `2026-09-22`  
**Package version:** `1.0`  
**Baseline branch:** `development/sprint-7-matching-g7-synthetic-safe-presentation-slice`  
**Baseline commit:** `91271b53aa50a9530a0ee3967975b3d286798e12`  
**Frozen file allowlist:** `05_DEVELOPMENT/matching-engine/safe-presentation-synthetic/G7_FILE_ALLOWLIST_v1.0.json`  
**Frozen allowlist SHA-256:** `a137d9ae6c4e7639ffeb4f1fc57e0674157336ecb5b7e9a3578db13668c33c9e`  
**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`  
**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Authorization and identity boundary

This record authorizes only the documentation phase for one isolated, unreachable, synthetic Safe Presentation reference/demo package. It freezes the package version, baseline, scope and exact future file set. It does not authorize creation of any planned schema, fixture, test, component, view-model or verification-result file.

The code phase requires both an independent audit of these three documentation artifacts and a subsequent explicit human confirmation before any file marked `planned` in the frozen allowlist may be created. Silence, a green check, the presence of this record or the documentation-phase approval cannot substitute for that confirmation.

This is not a canonical cross-functional decision record, creates no new `XFR` ID, changes no canonical identity or decision count, and requires no Inventory update. It does not supersede or amend any existing decision.

## 2. Authorized synthetic reference boundary

The future package is limited to a static reference/demo that is unreachable from the application and from production interfaces. It must not be imported, mounted, routed, linked, exposed through a menu, or called from any production path.

The future schema must be closed: only explicitly declared properties and enum members are accepted, with additional properties rejected. Its only permitted domain tokens are:

- recipient: `SYNTHETIC_RECIPIENT_A`;
- audience: `SYNTHETIC_AUDIENCE_A`;
- purpose: `SYNTHETIC_PURPOSE_STATIC_RENDER_TEST`;
- locale: `x-leasemind-synthetic`;
- element identifiers: `SYNTHETIC_HEADING` and `SYNTHETIC_MESSAGE`.

Every successful synthetic rendering must visibly include the exact watermark:

`SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED`

For stale, revoked, hash mismatch, binding mismatch, unknown enum, additional property, prohibited content or any other invalid condition, the only permitted presentation output is:

`SYNTHETIC PRESENTATION BLOCKED`

Rejected input must never be echoed, interpolated, rendered, logged, persisted or included in diagnostic output. A blocked result cannot partially render an otherwise accepted field.

## 3. Explicit prohibitions

The package must contain no real or production-like data, including real personal or organizational identifiers, names, addresses, contact details, geography, free text, real categories, scores, risk values, Qualification values or plausible production records.

The package must introduce no API endpoint, route, service behavior or production interface; no database, network, cache, telemetry or persistence behavior; and no change to `App.tsx`, `main.tsx`, API implementation, Vite configuration, package manifest or dependency lockfile. The allowlisted `apps/api/tests/safePresentationSyntheticContract.test.ts` is an isolated contract test only and cannot authorize an API or runtime path.

No file outside the exact path set in the frozen allowlist may be created or modified under this authorization. Renames, alternate casing, generated snapshots and incidental configuration changes are outside scope.

## 4. Verification label and non-conflation

If the separately authorized future package passes its bounded verification, its sole result label is:

`G7_SYNTHETIC_REFERENCE_PACKAGE_VERIFIED`

That label is explicitly not `SYNTHETIC_ACCEPTANCE_GATE`, does not imply it, and does not advance any governance gate. It means only that the isolated synthetic reference package matches its frozen package contract.

This authorization grants no Safe Presentation Policy approval, no Data Contracts or Data Contracts extension approval, no Controlled Artifact Manifest entry or approval, no production applicability, no runtime approval, no implementation readiness and no production launch authority.

## 5. Preserved authority and independent decisions

G6 and `XFR-D-072`, `XFR-D-078`, `XFR-D-079`, `XFR-D-080`, `XFR-D-081` and `XFR-D-082` retain their exact authority, scope, status and non-conflation boundaries. This G7 package neither resolves their open contents nor uses one sibling as authorization for another.

`XFR-D-083` remains the independent Safe Presentation evidence/test governance boundary, and `XFR-D-084` remains the independent Safe Presentation Policy approval/change-control procedure. This package is not the actual evidence package or verdict governed by `XFR-D-083`, and it is not the actual Policy approval record, manifest treatment or release authority governed by `XFR-D-084`.

Synthetic material cannot establish production applicability. Package verification cannot be transferred into Policy, Data Contracts, manifest, production, runtime, gate or implementation approval.

## 6. Frozen file boundary

The sole authoritative path set is the closed `allowed_paths` array in `G7_FILE_ALLOWLIST_v1.0.json`, package version `1.0`, bound to baseline commit `91271b53aa50a9530a0ee3967975b3d286798e12` and SHA-256 `a137d9ae6c4e7639ffeb4f1fc57e0674157336ecb5b7e9a3578db13668c33c9e`.

Exactly the following documentation artifacts are `present` in this phase:

1. this authorization record;
2. `05_DEVELOPMENT/matching-engine/safe-presentation-synthetic/README.md`;
3. `05_DEVELOPMENT/matching-engine/safe-presentation-synthetic/G7_FILE_ALLOWLIST_v1.0.json`.

Every other allowlisted path is `planned` and remains prohibited from creation until the independent-audit and human-confirmation prerequisite in §1 is satisfied. The JSON does not contain its own hash, avoiding self-reference; this record and the README carry the frozen hash of its final bytes.

## 7. Approval matrix

All five functions approve the same package version `1.0`, baseline commit and frozen allowlist hash shown above, only for the documentation authorization boundary in this record.

| Function | Decision | Exact scope |
|---|---|---|
| `PRODUCT` | `APPROVED` | Isolated synthetic reference/demo scope; no product or production exposure |
| `LEGAL` | `APPROVED` | Prohibited-data and no-production-applicability boundary |
| `Chief AI Architect` | `APPROVED` | Non-conflation, closed-contract and governance boundary |
| `AI` | `APPROVED` | Synthetic contract and future evidence procedure boundary |
| `DEVELOPMENT` | `APPROVED` | Exact path allowlist, baseline and isolation constraints |

`SECURITY/DLP` is evidence input only. A future SECURITY/DLP result may inform the independent audit, but it is not an approver, cannot unilaterally authorize the code phase and cannot change Policy, Data Contracts, manifest, production, runtime or gate state.

## 8. Gate state

Gate impact is `NONE`. All three governance gates remain unchanged:

- `IMPLEMENTATION_READINESS_GATE`: `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE`: `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE`: `BLOCKED`.

## 9. Authorization conclusion

`G7 SYNTHETIC SAFE PRESENTATION REFERENCE DOCUMENTATION PACKAGE AUTHORIZED — CODE FILE CREATION REQUIRES INDEPENDENT AUDIT AND SUBSEQUENT HUMAN CONFIRMATION; POLICY, DATA CONTRACTS, MANIFEST, PRODUCTION, RUNTIME, IMPLEMENTATION AND ALL THREE GATES REMAIN OPEN/BLOCKED.`

