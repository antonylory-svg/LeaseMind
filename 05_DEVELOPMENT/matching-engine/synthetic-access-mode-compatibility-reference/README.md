# G19 Synthetic Access-Mode Compatibility Reference

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manually opened, development-only Synthetic Access-Mode Compatibility Reference.

- Authorization date: `2026-09-25`
- Baseline branch: `development/sprint-7-matching-g19-synthetic-access-mode-compatibility-reference`
- Baseline commit: `517fb2cf3d0aa342ce62bcbcc668df673ae3d302`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G19_FILE_ALLOWLIST_v1.0.json` (LF-only, UTF-8 no BOM)
- Frozen allowlist SHA-256: `4a173bee48ef3c3b4eff285373bc0086f031e557c7ec8a64621c00d7f566d2ae`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` remains absent until the three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

## Purpose

The future page is a static, source-bound reference for the partial qualitative `access_mode_hard_fit` baseline approved by `XFR-D-002 v1.0`. It makes the complete 4 × 4 pre-authored matrix visible without receiving a Property or TenantRequest record and without executing a comparison.

The page is a separate sibling at `http://127.0.0.1:5173/synthetic-access-mode-compatibility-reference.html`. It is not linked from G16–G18 and is excluded from the default production build.

## Exact source boundary

The axes use the source enum order `business_hours`, `extended_hours`, `access_24_7`, `by_agreement`. The enum is flat: no total or partial order, broader-mode coverage, strength, weakness or negotiability relation is approved.

The pre-authored 16-cell matrix contains exactly:

- three `COMPATIBLE` cells: strict-equality diagonals for `business_hours`, `extended_hours` and `access_24_7`;
- thirteen `NEEDS_VERIFICATION` cells;
- zero `INCOMPATIBLE_CANDIDATE` cells;
- every cell involving `by_agreement`, including `by_agreement × by_agreement`, is `NEEDS_VERIFICATION`.

These labels are qualitative reference copy from `XFR-D-002 v1.0`, not an active runtime enum, executed pair result, `FeatureValue`, `PASS`, `FAIL` or permission to reject.

## Fail-closed boundary

- request `access_mode` absent → candidate `value_state = NOT_APPLICABLE`; no comparison occurs;
- request present and property `access_mode` absent → candidate `value_state = UNKNOWN`; no compatibility verdict occurs;
- `required_evidence_level` remains `BLOCKED_PENDING_DECISION`;
- final LEGAL verdict remains unapproved;
- `automatic_ineligible_allowed = NO` remains unchanged;
- row 15 remains overall `registry_readiness = BLOCKED_PENDING_DECISION`.

The candidate state tokens are not promoted to a full or public runtime enum. Missing or open information cannot become zero, a negative fact, incompatibility, rejection, `INELIGIBLE`, score, route or another status axis.

## Non-computation boundary

The future page contains no Property or TenantRequest instance, person, organization, location value, address, money, date, UUID, contact or plausible business record. It performs no comparison, matching, candidate generation, compatibility calculation, FeatureValue production, scoring, confidence, Qualification, Risk, ranking, thresholding, eligibility, recommendation, routing or business action.

The terminal region contains `SYNTHETIC_NO_ACCESS_MODE_COMPARISON_EXECUTED` and the exact non-occurrence line frozen in the allowlist. This is presentation copy only, not evidence, telemetry, a negative result or a persistent record.

## Isolation

The page has zero controls, state, effects, handlers, live regions, query/hash behavior, network, persistence, storage, logging, telemetry, timers, randomness, motion or animation. It imports no prior synthetic component and modifies no G14–G18 package, production entry, menu, router, API, package manifest, lockfile or Vite configuration.

## Required future verification

The separately authorized code phase must prove:

- exact nine-path scope and exact allowlist hash;
- exact axis values and source order;
- exact 4 × 4 cell contents and totals 3/13/0;
- every `by_agreement` cell remains `NEEDS_VERIFICATION`;
- no ordering, coverage, strength, negotiability or equivalence inference;
- exact missing-value and all-candidate safeguards;
- the terminal non-computation region remains last;
- zero business instances, computation, interaction or runtime behavior;
- G14–G18 and production entry points remain unchanged;
- typecheck, focused/full tests and browser smoke pass;
- responsive layouts at 360, 390, 768 and 1280 px have no horizontal overflow or console findings.

The sole future result label is `G19_SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_VERIFIED`. It is package-local only and advances no governance gate.

## Governance

`PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, version, baseline and frozen allowlist hash. `SECURITY/DLP` provides evidence only.

Gate impact is `NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.
