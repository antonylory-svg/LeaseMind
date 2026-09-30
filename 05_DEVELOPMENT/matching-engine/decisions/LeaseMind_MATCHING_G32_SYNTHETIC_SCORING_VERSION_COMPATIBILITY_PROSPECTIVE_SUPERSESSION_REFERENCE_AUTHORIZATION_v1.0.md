# LeaseMind — MATCHING G32 Synthetic Scoring Version-Compatibility and Prospective-Supersession Reference Authorization v1.0

**Artifact:** `LeaseMind_MATCHING_G32_SYNTHETIC_SCORING_VERSION_COMPATIBILITY_PROSPECTIVE_SUPERSESSION_REFERENCE_AUTHORIZATION_v1.0.md`

**Package:** `G32 Synthetic Scoring Version-Compatibility and Prospective-Supersession Reference`

**Package ID:** `G32`

**Version:** 1.0

**Date:** 2026-09-30

**Branch:** `development/sprint-7-matching-g32-synthetic-scoring-version-compatibility-prospective-supersession-reference`

**Repository baseline:** `aacd6445d4115b38451f195224b664c9db111188`

**Authorization status:** `DOCUMENTATION_ONLY_AUTHORIZED`

**Code phase status:** `BLOCKED_PENDING_INDEPENDENT_AUDIT_AND_HUMAN_CONFIRMATION`

## 1. Metadata and baseline

This record authorizes a documentation-only package consisting of this authorization record, one `README.md` and one closed `G32_FILE_ALLOWLIST_v1.0.json`. Six additional code, test and verification paths are reserved as `planned` but remain absent. No code, test, HTML page, scenario, component, entry, verification record, configuration, index, router or production artifact is authorized or created in this phase.

The package derives its substantive boundary only from `LeaseMind_MATCHING_DECISION_XFR-D-023_v1.0.md`, the `XFR-D-023` / `MSP-10` and versioning portions of `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` and `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`. G31 is used only as a structural precedent. This record creates no new governance fact and edits neither the Inventory nor the Scoring Policy.

## 2. Source and status boundary

`XFR-D-023 v1.0` remains `RESOLVED_QUALITATIVE_BOUNDARY`; canonical identity remains `MSP-10 → XFR-D-023`, `PRIMARY_STANDALONE`, «Scoring version compatibility/change rules». Counts remain 102 source keys / 90 canonical IDs, the Scoring register remains 18 rows and the Evaluation register remains 17 rows. Neither the Inventory nor the Scoring Policy is modified by this package.

The approved qualitative boundary is prospective-only supersession; a non-exhaustive breaking baseline with fail-closed classification of everything else; a breaking change requiring a new `scoring_policy_version` with an internally consistent reproducibility-bundle snapshot; independent versioning of unchanged Feature Schema / Risk Policy / Qualification Policy components; and potentially additive inactive candidates that always require explicit review before activation.

Every exact function, dimension, weight, threshold, numeric value, semantic-versioning scheme, bounded replay tolerance, decimal/canonical serialization, exact runtime version-bundle representation, dataset, evidence verdict, policy, production, runtime and implementation content remains `OPEN`.

## 3. Governance and approval separation

- Governance owner: `Chief AI Architect + PRODUCT`.
- Scoring artifact owner: `Chief AI Architect + PRODUCT`.
- Mandatory approvers: `LEGAL + DEVELOPMENT`.
- Consulted domain function: `AI`.
- Technical schema/versioning steward: `DEVELOPMENT`, without unilateral authority.

These are the roles recorded by `XFR-D-023 v1.0`; this package assigns no new owner, widens no authority and permits no unilateral approval. Architecture §37 decision authority over the Mutual Aggregate function and starting/segment weights remains `AI + PRODUCT`, `SOURCE_NORMATIVE`, and numeric in-scope metric-target governance remains independently under `XFR-D-063 v1.0` with governance owner `Chief AI Architect + AI`, mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT` and evidence-procedure owner `AI + DEVELOPMENT` without unilateral authority.

## 4. Frozen qualitative version-compatibility/supersession matrix

The future reference must render the following ten rows in this exact order. Each row is a boundary, not an approval:

1. `PROSPECTIVE_ONLY_SUPERSESSION_AND_IMMUTABLE_HISTORICAL_RESULTS` — a new `scoring_policy_version` never rewrites, reinterprets or mutates an already computed and saved Match Result; supersession applies forward only to new computations.
2. `NON_EXHAUSTIVE_BREAKING_BASELINE` — the minimal identified baseline is an active Mutual Aggregate function change, an active measurement dimension add or remove, and a change of a weight already affecting active arithmetic; the list does not close the taxonomy.
3. `FAIL_CLOSED_CLASSIFICATION_OF_ALL_OTHER_CHANGES` — any other change affecting active scoring arithmetic or the interpretation of an already computed Match Result requires explicit governance classification and otherwise defaults fail-closed to breaking.
4. `BREAKING_REQUIRES_NEW_SCORING_POLICY_VERSION_AND_CONSISTENT_BUNDLE_SNAPSHOT` — every breaking change requires a new `scoring_policy_version`, and every newly computed Match Result must carry a new internally consistent reproducibility-bundle snapshot reflecting the actual versions and hashes used for that specific computation.
5. `UNCHANGED_COMPONENT_VERSIONS_REMAIN_INDEPENDENT_NOT_FORCE_INCREMENTED` — Feature Schema, Risk Policy and Qualification Policy versions are not force-incremented merely because Scoring Policy changed; each component version reflects only what actually changed in that component.
6. `INACTIVE_CANDIDATE_POTENTIALLY_ADDITIVE_ONLY_WITH_EXPLICIT_REVIEW_BEFORE_ACTIVATION` — an inactive candidate is potentially additive only while it cannot affect active computation, output or routing; activation always requires explicit review and additive classification alone never authorizes it.
7. `NO_FUNCTION_DIMENSION_WEIGHT_THRESHOLD_VALUE_SEMVER_TOLERANCE_SERIALIZATION_OR_RUNTIME_REPRESENTATION_SELECTED` — none of these is selected or approved here.
8. `INDEPENDENTLY_OPEN_BOUNDARIES_PRESERVED_NOT_RESOLVED` — the exact semantic-versioning scheme, bounded replay tolerance, decimal/canonical serialization and exact runtime version-bundle representation remain independently `OPEN`.
9. `INDEPENDENT_DECISIONS_PRESERVED_NOT_REOPENED_OR_ABSORBED` — Architecture §§33/49, Feature Schema §9 and sibling decisions retain identity, status and authority.
10. `RESOLVED_QUALITATIVE_BOUNDARY_EXACT_CONTENT_STILL_OPEN_AND_NO_AUTOMATIC_ACTION` — `XFR-D-023` remains `RESOLVED_QUALITATIVE_BOUNDARY`; synthetic evidence creates no production claim and no result changes anything automatically.

The machine-readable `frozen` values in `G32_FILE_ALLOWLIST_v1.0.json` govern the later code phase and must be reproduced verbatim.

## 5. Layer boundary — Scoring supersession vs Architecture reproducibility bundle vs Feature Schema precedent

| Layer | Regulates | Owner/authority | Affected here? |
|---|---|---|---|
| Architecture §49 reproducibility bundle | Concept-level bundle composition and exact-replay/severity-1 rules for **any** Matching Engine computation — **not** major-version semantics and **not** forced version increments of unchanged components | Architecture (`SOURCE_NORMATIVE`) | No — the general norm is not reopened or over-read |
| Feature Schema §9 versioning precedent (`DECISION_CANDIDATE_FOR_REVIEW`, never adjudicated by a separate XFR-D record) | Breaking/additive classification for the feature registry | `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` | No — its major-version/coordinated-update language is not inherited |
| **Scoring-specific supersession/breaking-baseline/versioning boundary (this decision)** | Prospective-only supersession, non-exhaustive breaking baseline, fail-closed classification of the rest and the `scoring_policy_version`-only versioning rule | `Chief AI Architect + PRODUCT` | **Yes — the only resolved layer** |
| Exact semantic-versioning scheme and runtime bundle representation | The exact versioning scheme and its runtime/serialization representation | Not assigned by any source | No — remains `OPEN` |
| Bounded replay tolerance / exact serialization | The exact representation contract and tolerance for non-deterministic components | `DEVELOPMENT + AI` — candidate (not source-owned) | No — remains `OPEN` |

## 6. Adversarial cases

1. **Changing the Mutual Aggregate function after production launch.** Breaking per baseline row 2(a); requires a new `scoring_policy_version` and review and cannot be released silently even if evaluation shows improved metrics.
2. **Adding a new inactive weight candidate for future A/B comparison.** Potentially additive only while it cannot affect active computation/output/routing; it cannot be activated without explicit review, and silent activation violates this boundary.
3. **Retroactively "fixing" a historical Match Result with a new policy version.** Directly prohibited — the historical result stays bound to its own `scoring_policy_version`; a new output requires a new computation on the current version.
4. **Mixing breaking classification with bounded replay tolerance.** The supersession rule (which version applies to which Match Result) is distinct from replay tolerance; the layer boundary keeps them separate.
5. **A change outside the baseline** (for example a future Match Score combination weight, Scoring Policy §12 open decision №3). It is not automatically additive; it fails closed as breaking until separately classified.
6. **Assuming a breaking Scoring change must bump Feature Schema/Risk/Qualification.** Incorrect — only `scoring_policy_version` must change; unchanged components keep their current versions.

## 7. Open exact content and prohibited surrogates

The exact contents listed in the allowlist remain `OPEN`, including the semantic-versioning scheme; bounded replay tolerance; decimal/canonical serialization and precision/rounding; exact runtime version-bundle representation; Mutual Aggregate function, dimension set and inactive candidate set; starting/segment weight values, thresholds and numeric content; any future Match Score combination rule and its classification; any classification taxonomy beyond the non-exhaustive baseline; dataset/evidence/run/result/sufficiency verdict; and all policy/production/runtime/implementation/gate approvals.

Conventional semver conventions, major/minor/patch defaults, common tolerance values, library defaults and current implementation behavior are not governance approval. Architecture §33 deterministic replay and §49 severity-1 mismatch rules remain separate and inviolable; bounded replay tolerance is never a substitute for the supersession rule and vice versa.

## 8. Future reference surface

If separately authorized after an independent audit, the future static manual dev-only page will expose six regions in order: `SOURCE AND STATUS BOUNDARY`; `SCORING VERSION-COMPATIBILITY AND PROSPECTIVE-SUPERSESSION MATRIX`; `ROLE AND APPROVAL SEPARATION`; `NON-EXHAUSTIVE BREAKING BASELINE AND FAIL-CLOSED CLASSIFICATION`; `OPEN EXACT CONTENT`; `NON-DECISION RESULT`.

It must always display:

- `SYNTHETIC SCORING VERSION-COMPATIBILITY AND PROSPECTIVE-SUPERSESSION REFERENCE — NOT PRODUCTION APPROVED`;
- `MANUAL DEV-ONLY REFERENCE — QUALITATIVE SCORING VERSION-COMPATIBILITY AND PROSPECTIVE-SUPERSESSION BOUNDARY ONLY`;
- `NO FUNCTION, DIMENSION, WEIGHT, THRESHOLD, NUMERIC VALUE, SEMVER SCHEME, TOLERANCE, SERIALIZATION OR RUNTIME REPRESENTATION SELECTED`.

It must terminate with `G32_SYNTHETIC_NO_FUNCTION_DIMENSION_WEIGHT_THRESHOLD_VALUE_SEMVER_TOLERANCE_SERIALIZATION_OR_RUNTIME_REPRESENTATION_SELECTED` and a non-decision statement. It contains no controls, links, live regions, mutable state, network, persistence, telemetry, person, organization, property, UUID or business-record data.

## 9. Gate impact

| Item | Status |
| --- | --- |
| `IMPLEMENTATION_READINESS_GATE` | `BLOCKED` |
| `SYNTHETIC_ACCEPTANCE_GATE` | `BLOCKED` |
| `PRODUCTION_LAUNCH_GATE` | `BLOCKED` |
| Gate impact of this package | `NONE` |

## 10. Non-authorization statement

This documentation package approves no Scoring Policy, Evaluation Plan, Feature Schema, Risk Policy, Qualification Policy, Controlled Artifact Manifest, dataset, evaluation run, production data, function, dimension, weight, threshold, numeric value, semver scheme, tolerance, serialization, runtime representation, schema, carrier, runtime or implementation. It creates no production-readiness claim and permits no automatic action. Synthetic evidence creates no production claim. The six reserved artifacts remain blocked pending an independent audit and separate human confirmation.

## 11. Closed allowlist and hash binding

The closed allowlist is `05_DEVELOPMENT/matching-engine/synthetic-scoring-version-compatibility-prospective-supersession-reference/G32_FILE_ALLOWLIST_v1.0.json`, raw SHA-256 `fc444155fdea210d6d92f23ef01e1edae2a482be7066d71e421c28f89397b45e`. It contains exactly nine paths: these three documentation artifacts as `present` and six future artifacts as `planned`. No path outside those nine may be created, modified, imported or emitted by G32. The allowlist intentionally omits its own SHA-256.

No staging, commit, push or PR mutation is performed by this authorization.

```
COMMIT CREATED: NO
PUSH PERFORMED: NO
PR MUTATION PERFORMED: NO
```
