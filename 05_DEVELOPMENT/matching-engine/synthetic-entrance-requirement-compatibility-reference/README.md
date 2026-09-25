# G20 Synthetic Entrance-Requirement Compatibility Reference

## Current status

This directory is the documentation-only shell for package version `1.0` of one isolated, manually opened, development-only Synthetic Entrance-Requirement Compatibility Reference.

- Authorization date: `2026-09-25`
- Baseline branch: `development/sprint-7-matching-g20-synthetic-entrance-requirement-compatibility-reference`
- Baseline commit: `3da6ddd451ed87b448308b1e6ab20edc8257e41d`
- Authorization status: `DOCUMENTATION_ONLY_AUTHORIZED`
- Code phase status: `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`
- Frozen allowlist: `G20_FILE_ALLOWLIST_v1.0.json` (LF-only, UTF-8 no BOM)
- Frozen allowlist SHA-256: `f19668d1fa74078ff1fb7a1eae9ed7ad9fe8eadff97e03516d8e08bda3cbbe8e`

Only this README, the frozen allowlist and the authorization record are present in the documentation phase. Every path marked `planned` remains absent until the three documentation artifacts pass an independent audit and a subsequent explicit human confirmation authorizes the code phase.

## Purpose

The future page is a static, source-bound reference for the partial qualitative `entrance_requirement_fit` table approved by `XFR-D-001 v1.0`. It makes the complete 5 × 4 pre-authored matrix visible without receiving a Property or TenantRequest record and without executing a comparison.

The page is a separate sibling at `http://127.0.0.1:5173/synthetic-entrance-requirement-compatibility-reference.html`. It is not linked from G16–G19 and is excluded from the default production build.

## Exact source boundary

Property rows use `separate_street`, `separate_yard`, `shared`, `loading_only`, `none`. TenantRequest columns use `separate_required`, `separate_preferred`, `shared_allowed`, `no_preference`.

The pre-authored 20-cell matrix contains exactly:

- thirteen `COMPATIBLE` cells;
- one `INCOMPATIBLE_CANDIDATE` cell: `shared × separate_required`;
- six `NEEDS_VERIFICATION` cells frozen in the allowlist;
- no permission to treat any cell as `PASS`, `FAIL`, rejection or automatic `INELIGIBLE`.

This is a human-approved governance interpretation, not a compatibility relation stated by the source CTA and not an active runtime enum or result. No `separate ⊇ shared` ordering, physical entrance property or `loading_only`/`none` purpose semantics is approved.

## Preference and fail-closed boundary

`separate_preferred` remains a preference, not a hard requirement. Its five cells are hard-compatible, but that result does not prove satisfaction. Any unmet-preference diagnostic remains concept-level, separate from the hard result, outside Qualification routing and unauthorized as a runtime field.

- request `entrance_requirement` absent → candidate `value_state = NOT_APPLICABLE`; no comparison occurs;
- request present and property `entrance_type` absent → candidate `value_state = UNKNOWN`; no compatibility verdict occurs;
- explicit `none` is distinct from absence and remains an ordinary matrix row;
- `required_evidence_level` remains `BLOCKED_PENDING_DECISION`;
- final LEGAL verdict remains unapproved;
- `automatic_ineligible_allowed = NO` remains unchanged;
- row 8 remains overall `registry_readiness = BLOCKED_PENDING_DECISION`.

## Non-computation boundary

The future page contains no Property or TenantRequest instance, person, organization, location value, address, money, date, UUID, contact or plausible business record. It performs no comparison, matching, candidate generation, compatibility calculation, FeatureValue production, preference diagnostic calculation, scoring, confidence, Qualification, Risk, ranking, thresholding, eligibility, recommendation, routing or business action.

The terminal region contains `SYNTHETIC_NO_ENTRANCE_REQUIREMENT_COMPARISON_EXECUTED` and the exact non-occurrence line frozen in the allowlist. This is presentation copy only, not evidence, telemetry, a negative result or a persistent record.

## Isolation

The page has zero controls, state, effects, handlers, live regions, query/hash behavior, network, persistence, storage, logging, telemetry, timers, randomness, motion or animation. It imports no prior synthetic component and modifies no G14–G19 package, production entry, menu, router, API, package manifest, lockfile or Vite configuration.

## Required future verification

The separately authorized code phase must prove:

- exact nine-path scope and exact allowlist hash;
- exact distinct axis values and source order;
- exact 5 × 4 cell contents and totals 13/1/6;
- exact six open cells and sole `INCOMPATIBLE_CANDIDATE` cell;
- preference diagnostic separation and absence of preference-satisfaction inference;
- no ordering, coverage, physical-property, purpose or equivalence inference;
- exact missing-value safeguards and explicit `none`/absence distinction;
- terminal non-computation region remains last;
- zero business instances, computation, interaction or runtime behavior;
- G14–G19 and production entry points remain unchanged;
- typecheck, focused/full tests and browser smoke pass;
- responsive layouts at 360, 390, 768 and 1280 px have no horizontal overflow or console findings.

The sole future result label is `G20_SYNTHETIC_ENTRANCE_REQUIREMENT_COMPATIBILITY_REFERENCE_VERIFIED`. It is package-local only and advances no governance gate.

## Governance

`PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` and `DEVELOPMENT` approve the same documentation boundary, version, baseline and frozen allowlist hash. `SECURITY/DLP` provides evidence only.

Gate impact is `NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.
