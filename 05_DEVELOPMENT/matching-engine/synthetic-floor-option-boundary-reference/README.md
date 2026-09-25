# G21 Synthetic Floor-Option Boundary Reference

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manually opened, development-only Synthetic Floor-Option Boundary Reference.

- Authorization date: `2026-09-25`
- Baseline branch: `development/sprint-7-matching-g21-synthetic-floor-option-boundary-reference`
- Baseline commit: `d3f2b28740dc612e2ae921fd38979324c8dba7e0`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G21_FILE_ALLOWLIST_v1.0.json` (LF-only, UTF-8 no BOM)
- Frozen allowlist SHA-256: `89af48757daf357f8da9271c892076d0b531347e8a3e5153dd46bf15b4395e96`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` remains absent until the three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

## Purpose

The future page is a static, source-bound reference for the two partial qualitative `floor_option_fit` boundaries approved by `XFR-D-012 v1.0`. It shows the wildcard `[any]` behavior and the land-derived `NOT_APPLICABLE` behavior without receiving a Property or TenantRequest record, interpreting a number, mapping a floor or executing a comparison.

The page is a separate sibling at `http://127.0.0.1:5173/synthetic-floor-option-boundary-reference.html`. It is not linked from G14–G20 and is excluded from the default production build.

## Exact approved boundary

- `request_floor_options = [any]`: the raw request value is present and unrestricted; no floor comparison occurs and the floor feature does not prevent compatibility. No `PASS`, `FAIL`, positive evidence, Qualification route or derived `value_state` is produced. The wildcard is not called `NOT_APPLICABLE`.
- `property_type = land` with structurally required `property_floor = null`: the floor feature has `value_state = NOT_APPLICABLE`, not `PASS`, positive evidence or a property-type result.
- `property_type_membership` remains independent and cannot be hidden, satisfied, replaced or bypassed by either case.

The numeric-to-category convention and exact derived wildcard `value_state` remain two independent open follow-ups. No integer mapping, threshold, range, illustrative floor number, compatibility matrix or evaluator is authorized.

## Fail-closed and open boundary

- request `floor_options` absent → candidate `value_state = NOT_APPLICABLE`; no comparison occurs;
- request present and not `[any]`, Property `floor` absent and `property_type` not `land` → candidate `value_state = UNKNOWN`; no floor verdict occurs;
- row 20 remains overall `registry_readiness = BLOCKED_PENDING_DECISION` with `readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE`;
- `required_evidence_level` remains `BLOCKED_PENDING_DECISION`;
- final LEGAL verdict remains unapproved;
- `automatic_ineligible_allowed = NO` remains unchanged.

Open or missing material cannot become a default category, zero, negative fact, `PASS`, `FAIL`, incompatibility, rejection, automatic `INELIGIBLE`, score, Qualification result or route.

## Non-computation boundary

The future page contains no Property or TenantRequest instance, floor number, person, organization, location value, address, money, date, UUID, contact or plausible business record. It performs no comparison, numeric interpretation, category mapping, matching, FeatureValue production, scoring, confidence, Qualification, Risk, ranking, thresholding, eligibility, recommendation, routing or business action.

The terminal region contains `SYNTHETIC_NO_FLOOR_OPTION_COMPARISON_EXECUTED` and the exact non-occurrence line frozen in the allowlist. This is presentation copy only, not evidence, telemetry, a negative result or a persistent record.

## Isolation

The page has zero controls, state, effects, handlers, live regions, query/hash behavior, network, persistence, storage, logging, telemetry, timers, randomness, motion or animation. It imports no prior synthetic component and modifies no G14–G20 package, production entry, menu, router, API, package manifest, lockfile or Vite configuration.

## Required future verification

The separately authorized code phase must prove:

- exact nine-path scope and exact allowlist hash;
- exact two approved cases and their distinct semantics;
- no wildcard `value_state` or `NOT_APPLICABLE` overclaim;
- land-derived floor-feature `NOT_APPLICABLE` is never presented as `PASS` or a property-type result;
- independent `property_type_membership` and overall row-20 blocked status remain explicit;
- no numeric mapping, threshold, range, sample integer, matrix or evaluator exists;
- exact missing-value safeguards;
- terminal non-computation region remains last;
- zero business instances, computation, interaction or runtime behavior;
- G14–G20 and production entry points remain unchanged;
- typecheck, focused/full tests and browser smoke pass;
- responsive layouts at 360, 390, 768 and 1280 px have no horizontal overflow or console findings.

The sole future result label is `G21_SYNTHETIC_FLOOR_OPTION_BOUNDARY_REFERENCE_VERIFIED`. It is package-local only and advances no governance gate.

## Governance

`PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, version, baseline and frozen allowlist hash. `SECURITY/DLP` provides evidence only.

Gate impact is `NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.
