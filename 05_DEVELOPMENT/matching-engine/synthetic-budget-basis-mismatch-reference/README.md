# G22 Synthetic Budget-Basis Mismatch Reference

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manually opened, development-only Synthetic Budget-Basis Mismatch Reference.

- Authorization date: `2026-09-25`
- Baseline branch: `development/sprint-7-matching-g22-synthetic-budget-basis-mismatch-reference`
- Baseline commit: `2c816f1f4a61159909fb50d7a8f4bfc9e8a082a7`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G22_FILE_ALLOWLIST_v1.0.json` (LF-only, UTF-8 no BOM)
- Frozen allowlist SHA-256: `2942de606816d90afb77e77d4856df024ec045a33e8b8775e27ec1556e72842a`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` remains absent until the three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

## Purpose

The future page is a static, source-bound reference for the qualitative operating-expense-basis mismatch rule approved by `XFR-D-013 v1.0`. It shows all four abstract boolean combinations without receiving a Property or TenantRequest record, inventing an operating-expense amount, calculating an effective rate or executing a rent/budget comparison.

The page is a separate sibling at `http://127.0.0.1:5173/synthetic-budget-basis-mismatch-reference.html`. It is not linked from G14–G21 and is excluded from the default production build.

## Exact approved boundary

- `true`/`true` and `false`/`false`: `BASIS_ALIGNED`; the ordinary `rent ≤ budget_max` comparison remains governed elsewhere and is not executed here. Alignment alone proves no affordability, compatibility or result.
- `true`/`false` and `false`/`true`: `BASIS_MISMATCH`; candidate `value_state = UNKNOWN`; calculation blocked. No `PASS`, `FAIL`, incompatibility, rejection or `INELIGIBLE` is assigned.
- `budget_fit`, `rent_rate_fit`, `XFR-D-003` effective-rate representation and `MATCHING_QUALIFICATION_POLICY` remain independent.

Exact runtime representation of `UNKNOWN`, any future numeric operating-expense field, API/event/database/schema/carrier and downstream routing remain open. No amount, formula, threshold, rounding, serialization or evaluator is authorized.

## Non-computation boundary

The future page contains no Property or TenantRequest instance, person, organization, location, address, money amount, date, UUID, contact or plausible business record. It performs no comparison, calculation, estimation, matching, active `FeatureValue` production, scoring, confidence, Qualification, Risk, ranking, thresholding, eligibility, recommendation, routing or business action.

The terminal region contains `SYNTHETIC_NO_BUDGET_BASIS_COMPARISON_EXECUTED` and the exact non-occurrence line frozen in the allowlist. This is presentation copy only, not evidence, telemetry, a negative result or a persistent record.

## Isolation

The page has zero controls, state, effects, handlers, live regions, query/hash behavior, network, persistence, storage, logging, telemetry, timers, randomness, motion or animation. It imports no prior synthetic component and modifies no G14–G21 package, production entry, menu, router, API, package manifest, lockfile or Vite configuration.

## Required future verification

The separately authorized code phase must prove:

- exact nine-path scope and exact allowlist hash;
- exact four basis cases in one semantic table;
- aligned cases execute no comparison and imply no outcome;
- mismatch remains candidate `UNKNOWN` with calculation blocked and is never adverse;
- no expense amount, effective-rate calculation, numeric field, formula, threshold, rounding, serialization or runtime representation is invented;
- independent `budget_fit`, `rent_rate_fit`, `XFR-D-003` and Qualification boundaries remain explicit;
- terminal non-computation region remains last;
- zero business instances, computation, interaction or runtime behavior;
- G14–G21 and production entry points remain unchanged;
- typecheck, focused/full tests and browser smoke pass;
- responsive layouts at 360, 390, 768 and 1280 px have no horizontal overflow or console findings.

The sole future result label is `G22_SYNTHETIC_BUDGET_BASIS_MISMATCH_REFERENCE_VERIFIED`. It is package-local only and advances no governance gate.

## Governance

`PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, version, baseline and frozen allowlist hash. `SECURITY/DLP` provides evidence only.

Gate impact is `NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.
