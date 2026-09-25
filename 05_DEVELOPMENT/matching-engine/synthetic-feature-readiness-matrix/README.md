# G18 Synthetic Feature Readiness Matrix

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manually opened, development-only Synthetic Feature Readiness Matrix.

- Authorization date: `2026-09-25`
- Baseline branch: `development/sprint-7-matching-g18-synthetic-feature-readiness-matrix`
- Baseline commit: `a00cb75c954e0a41d4bd63723573853c40b68e78`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G18_FILE_ALLOWLIST_v1.0.json` (LF-only, UTF-8 no BOM)
- Frozen allowlist SHA-256: `2c71dc9ef7108664c1ccd1f230076621f9b8944b939cae3ae82ac2be99d397da`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` remains absent until the three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

## Purpose

The future page is a static, source-bound view of the current Feature Schema design-time readiness vocabulary and its twenty hard-constraint candidate identifiers. It explains what is ready only for continued design work, what remains blocked and what is excluded from v0.1. It does not execute or simulate a comparison.

The page is a separate sibling at `http://127.0.0.1:5173/synthetic-feature-readiness-matrix.html`. It is not linked from G16 or G17 and is excluded from the default production build.

## Source discipline

The four top-level values are exactly `READY_FOR_DRAFT`, `READY_AS_CANDIDATE_ONLY`, `BLOCKED_PENDING_DECISION` and `EXCLUDED_FROM_V0_1`. `BLOCKED_PENDING_COMPATIBILITY_TABLE` is only an optional `readiness_reason` subtype of `BLOCKED_PENDING_DECISION`, never a fifth status.

The twenty identifiers are shown in Feature Schema §5.1 order and only as an index. The page must not infer or flatten a single per-row `registry_readiness` value where the source records mixed, partial or independently open boundaries.

The following safeguards remain visible:

- all twenty are design-time `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE` entries, not approved runtime rules;
- final LEGAL verdict is not approved for any of the twenty;
- `required_evidence_level` remains `BLOCKED_PENDING_DECISION` for all twenty;
- `automatic_ineligible_allowed = NO` for all twenty;
- rows 8, 15 and 20 remain overall `BLOCKED_PENDING_DECISION` despite partial qualitative boundaries;
- rows 17–19 have only a qualitative `READY_AS_CANDIDATE_ONLY` literal-match baseline;
- row 4 has only qualitative representation governance; its exact numeric representation remains blocked.

## Non-computation boundary

The future page contains no Property or TenantRequest values, no person, organization, location value, address, money, date, UUID, contact or plausible business record. It produces no runtime `FeatureValue`, comparison, `PASS`, `FAIL`, incompatibility, `INELIGIBLE`, score, confidence, Qualification, Risk, ranking, recommendation or routing.

The terminal region contains `SYNTHETIC_NO_FEATURE_COMPARISON_COMPUTED` and the exact non-occurrence line frozen in the allowlist. This is presentation copy only, not evidence, telemetry, a negative result or a persistent record.

## Isolation

The page has zero controls, state, effects, handlers, live regions, query/hash behavior, network, persistence, storage, logging, telemetry, timers, randomness, motion or animation. It imports no G14–G17 component and modifies no prior package, production entry, menu, router, API, package manifest, lockfile or Vite configuration.

## Required future verification

The separately authorized code phase must prove:

- exact nine-path scope and exact allowlist hash;
- exact four-value vocabulary and reason-subtype distinction;
- exact twenty-feature index and source order;
- no inferred status for unlisted rows and no flattening of mixed boundaries;
- exact named boundaries for rows 4, 8, 15, 17, 18, 19 and 20;
- zero business values, computation, interaction or runtime behavior;
- G14–G17 and production entry points remain unchanged;
- typecheck, focused/full tests and browser smoke pass;
- responsive layouts at 360, 390, 768 and 1280 px have no horizontal overflow or console findings.

The sole future result label is `G18_SYNTHETIC_FEATURE_READINESS_MATRIX_VERIFIED`. It is package-local only and advances no governance gate.

## Governance

`PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, version, baseline and frozen allowlist hash. `SECURITY/DLP` provides evidence only.

Gate impact is `NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.
