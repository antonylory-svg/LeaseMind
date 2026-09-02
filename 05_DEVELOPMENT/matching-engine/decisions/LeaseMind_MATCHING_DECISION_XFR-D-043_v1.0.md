# LeaseMind Matching Decision Record — XFR-D-043

**Decision ID:** `XFR-D-043`

**Название:** Qualification-policy version compatibility and supersession governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-02

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE QUALIFICATION VERSION-COMPATIBILITY AND PROSPECTIVE SUPERSESSION BOUNDARY — EXACT TAXONOMY, MATRIX, LIFECYCLE, CARRIER AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-09-02 working session

**Repository baseline:** `d51a23d92b5e2e900230345612a0ef225abe92be`

**Scope:** governance authority, prospective supersession, immutable historical-result semantics, current-actionability prerequisites and fail-closed compatibility handling for `qualification_policy_version` only. This record does not approve a Qualification Policy, version scheme, compatibility matrix, trigger, cascade, fallback, migration, schema, carrier, dataset, runtime design or implementation.

**Governance owner:** `Chief AI Architect + PRODUCT` — human-approved decision-specific assignment preserving the semantic/artifact authority established for `MATCHING_QUALIFICATION_POLICY` by `XFR-D-030` and `XFR-D-031`.

**Mandatory approvers:** `LEGAL + DEVELOPMENT + AI`.

**Evidence/technical-procedure owner:** `DEVELOPMENT + AI`; this role prepares compatibility evidence and verifies technical feasibility but has no unilateral authority to approve Qualification semantics, compatibility, policy content, runtime design or implementation. The `DEVELOPMENT + AI` entry in Qualification Policy §15 row 17 remains candidate/inherited technical context and is not semantic ownership.

**Depends on:** `XFR-D-031 v1.0` (responsibility/carrier boundary), `XFR-D-033 v1.0` (Qualification precedence), `XFR-D-038 v1.0` (orthogonal `STALE` semantics), `XFR-D-040 v1.0` (multi-cause preservation), `XFR-D-044 v1.0` (Safe Presentation read-only consumption) and `XFR-D-055 v1.0` (Risk→Qualification interface boundary). These decisions are preserved, not reopened or superseded. `XFR-D-M2` remains independently `OPEN`.

---

## 1. Source/status discipline

The canonical identity is Inventory mapping `MQP-17 → XFR-D-043`, `PRIMARY_STANDALONE`, “Qualification version compatibility/supersession”. Before this record, Qualification Policy §15 row 17 marked Qualification-specific version compatibility and supersession as open and showed `DEVELOPMENT + AI` only as candidate/inherited context.

The binding source boundaries are:

- Architecture §§33 and 49 require version/hash-bound reproducibility, preserve historical calculation artifacts, prohibit mutation by replay and treat exact replay mismatch as a blocking defect;
- Architecture §32 makes stale or unreproducible results non-actionable and blocks disclosure rather than treating missing information as a negative fact;
- Architecture §52 requires controlled artifacts and a signed environment manifest but does not itself decide Qualification-specific compatibility or approve an artifact version;
- `XFR-D-031` preserves `Chief AI Architect + PRODUCT` as semantic authority and `DEVELOPMENT` as technical schema/carrier steward while leaving exact field, enum, API/event carrier and compatibility strategy `OPEN`;
- `XFR-D-038` makes `STALE` orthogonal to the four Qualification results, keeps a stale result historical/audit-only and requires a new calculation for current actionability;
- Feature Schema §9 and Scoring-specific `XFR-D-023` are precedents for independent version/hash bundles, prospective supersession and compatibility analysis. They are not imported as Qualification authority and do not approve their candidate version taxonomies here.

`LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` and `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` remain Proposals. Inventory is a canonical index and status overlay, not policy approval. Current Data Contracts do not supply an approved Qualification result/version carrier.

## 2. Вопрос

Какая минимальная qualitative governance boundary применяется к уже выданному Qualification result при смене `qualification_policy_version`, если exact compatibility taxonomy, version scheme, lifecycle, carrier и runtime implementation ещё не утверждены?

## 3. Решение

### 3.1. Authority boundary

1. Governance owner — `Chief AI Architect + PRODUCT`.
2. Mandatory approvers — `LEGAL + DEVELOPMENT + AI`.
3. Evidence/technical-procedure owner — `DEVELOPMENT + AI`, без unilateral approval.
4. `DEVELOPMENT` остаётся technical schema/carrier steward по `XFR-D-031`, но не может единолично изменять смысл Qualification result или объявлять версии совместимыми.
5. Изменение semantics, compatibility boundary или actionability требует нового versioned human decision с полным owner/approver set.

### 3.2. Prospective supersession и immutable history

1. Supersession действует только prospective: новая `qualification_policy_version` не переписывает, не relabel'ит, не переинтерпретирует и не мутирует ранее вычисленный Qualification result.
2. Исторический result сохраняется вместе с исходным полным reproducibility bundle версий и hashes, реально использованным для его вычисления, и остаётся audit/history artifact.
3. Replay или новый calculation создаёт новый audit/calculation fact и не заменяет исторический result.
4. Version label без соответствующего immutable hash не доказывает identity. Один и тот же version ID с иным hash является mismatch и не может считаться тем же утверждённым артефактом.

### 3.3. Current actionability

1. После применимого supersession текущая actionability требует отдельно утверждённого совместимого current bundle и нового расчёта на этом bundle.
2. Старый result не становится текущим только потому, что ранее был `QUALIFIED_HYPOTHESIS`, прошёл тест, replay, CI или использовался в production-like evidence.
3. Совместимость каждого компонента и полного bundle должна быть явно подтверждена; наличие отдельных approved artifacts не доказывает совместимость их комбинации.
4. Qualification-only изменение не требует фиктивного bump неизменившихся `feature_schema_version`, `scoring_policy_version` или `risk_policy_version`. Каждый компонент сохраняет собственную фактически применённую version/hash identity.
5. Этот record не выбирает current compatible bundle, не создаёт manifest entry и не разрешает fallback.

### 3.4. Fail-closed compatibility semantics

Unverified, unknown, unmapped, incomplete, conflicting, mixed, missing-version, missing-hash или hash-mismatched compatibility:

1. не считается compatible, current, safe, clean, zero-risk или low-risk;
2. не разрешает reuse, routing action, presentation, disclosure, production use или иной downstream action;
3. не становится отрицательным фактом, подтверждением нарушения либо evidence против пользователя;
4. не преобразуется автоматически в `STALE` и не создаёт новый freshness state;
5. не создаёт автоматически ни один из четырёх Qualification results: `QUALIFIED_HYPOTHESIS`, `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED` или `REJECTED_BY_MATCHING`;
6. не угадывается AI, heuristic, carrier default, version-name comparison или implicit backward-compatibility assumption;
7. блокируется до отдельно утверждённого compatibility decision и, где требуется, нового расчёта. Exact блокирующий status, route, error, invalidation scope и cascade остаются `OPEN`.

### 3.5. Qualitative change-classification floor

1. Изменение, способное повлиять на смысл четырёх Qualification results, routing/precedence, required inputs/evidence, Eligibility/Risk mapping, missing/conflicting/stale handling либо route-dependent actionability/explanation, рассматривается как breaking для Qualification до явного утверждения и требует новой `qualification_policy_version`.
2. Перечень в п.1 — safety floor, а не исчерпывающая taxonomy.
3. Не классифицированное изменение fail-closed считается incompatible/breaking до отдельного решения; слова “minor”, “patch”, “wording-only”, “additive” или успешная schema validation не предоставляют compatibility.
4. Новый или изменённый candidate, который доказуемо не участвует в active calculation, output, routing и interpretation, может быть только potentially additive. Его activation требует отдельного compatibility review и новой применимой version identity.
5. Exact version scheme, exhaustive taxonomy и классификация реальных изменений этим record не утверждаются.

### 3.6. Evidence is prerequisite, not authorization

1. Compatibility evidence должно быть связано с точными versions/hashes, source snapshot, procedure version и review record, но exact evidence package этим решением не утверждается.
2. Synthetic-only evidence не создаёт production-compatible bundle, production actionability или production-readiness claim.
3. Replay equality подтверждает только проверенный replay scope и не утверждает semantic compatibility, policy content или supersession lifecycle.
4. Merge, commit, CI, schema validation, test report, hash presence или manifest-shaped payload сами по себе не являются approval.
5. Evaluation и monitoring output не изменяют policy, compatibility mapping, runtime behavior или active manifest автоматически.

### 3.7. Partial, never fully resolved

`XFR-D-043` остаётся `PARTIALLY_RESOLVED_BOUNDARY`: утверждены authority split, prospective supersession, immutable history, current-actionability prerequisite, independent component versioning и fail-closed qualitative compatibility floor. Все exact и operational contents из §5 остаются `OPEN`.

Будущее exact решение требует нового versioned `XFR-D-043` record с `supersedes` на эту версию. Оно не может быть внесено silent edit'ом, Policy sync, manifest update, schema/carrier change или implementation default.

## 4. Layer/boundary table

| Слой | Authority | Что утверждено | Что не утверждено |
|---|---|---|---|
| Qualification semantics/artifact | `Chief AI Architect + PRODUCT` | Исторический смысл result неизменен; supersession prospective | Actual Policy, result/routing change, compatible version selection |
| XFR-D-043 governance | owner `Chief AI Architect + PRODUCT`; approvers `LEGAL + DEVELOPMENT + AI` | Qualitative compatibility, actionability and fail-closed boundary | Exact taxonomy, matrix, lifecycle or runtime behavior |
| Evidence/technical procedure | `DEVELOPMENT + AI` | Подготовка evidence и feasibility input | Unilateral compatibility, policy or implementation approval |
| Runtime carrier | `DEVELOPMENT` steward under `XFR-D-031` | Ничего нового | Field, enum, schema, API, DB, event, cache or transport |
| Freshness | `XFR-D-038` authority preserved | `STALE` остаётся orthogonal и non-actionable | Automatic `STALE` creation or fifth Qualification result |
| Risk→Qualification | `XFR-D-055`; `XFR-D-M2` independent | Совместимость не заменяет Risk interface controls | Trigger, mapping, threshold or route |
| Safe Presentation | `XFR-D-044` | Старый/unverified result не становится disclosable | Wording, audience, payload or disclosure approval |

## 5. Что остаётся `OPEN`

- exact semantic-version scheme, identifier format and naming rules;
- exhaustive breaking/additive/backward-compatible taxonomy and classification of actual changes;
- exact per-component and full-bundle compatibility matrix;
- supersession/actionability triggers, timing, effective scope, cascade and dependency graph;
- grace period, coexistence, fallback, rollback, downgrade, mixed rollout and migration rules;
- recalculation selection, scheduling, batch invalidation, queues and downstream-consumer behavior;
- exact runtime representation under `XFR-D-031`: fields, enums, schema, API, DB, events, serialization and carrier;
- compatibility/invalidation event ordering, concurrency, atomicity, idempotency, retry, cache and TTL semantics;
- canonical serialization, hash generation/verification, signing and attestation mechanics;
- approval/manifest record schema, named appointments, RBAC, signatures, quorum, exception and waiver procedure;
- actual approved Qualification Policy, compatible bundle, fallback, manifest entry or release;
- datasets, evidence manifest, evaluation method, runs, results, statistical method and acceptance verdict;
- exact Qualification thresholds, Risk thresholds and `XFR-D-M2`;
- exact Risk→Qualification mapping/carrier under `XFR-D-055`;
- reason-code and explanation-catalog compatibility;
- bounded replay tolerance for any probabilistic/advisory component;
- production-data use, runtime monitoring, rollback, deployment and implementation.

None of these contents is implied by the qualitative rules in §3.

## 6. Explicit non-conflations

1. `XFR-D-043` compatibility governance ≠ `XFR-D-031` runtime carrier design.
2. Compatibility failure or supersession ≠ automatic `STALE`; `XFR-D-038` remains orthogonal and does not create a fifth Qualification result.
3. Scoring-specific `XFR-D-023` and Feature Schema §9 ≠ Qualification-policy authority or automatic import of their candidate taxonomies.
4. Compatibility ≠ exact replay; replay success or failure does not alone approve semantic compatibility.
5. Version bump, hash, merge, CI or manifest-shaped entry ≠ Policy or production approval.
6. Qualification-only change ≠ forced bump of unchanged Feature Schema, Scoring Policy or Risk Policy.
7. Individually approved versions ≠ an approved compatible combined bundle.
8. This decision does not reopen `XFR-D-033` precedence, `XFR-D-040` multi-cause behavior, `XFR-D-044` presentation boundary, `XFR-D-055` Risk interface or `XFR-D-M2` thresholds.
9. Compatibility failure ≠ negative user fact, legal conclusion, rejection or reviewer decision.
10. Historical availability ≠ current actionability or disclosure permission.

## 7. Adversarial cases

1. **Old success reused after supersession.** A prior `QUALIFIED_HYPOTHESIS` is served after an applicable policy change without a new compatible-bundle calculation. Prohibited: the old result remains historical/non-actionable.
2. **History rewritten.** Migration relabels an earlier result under the new policy. Prohibited: original result and bundle remain immutable.
3. **Same version, changed bytes.** The version ID is unchanged but hash differs. Fail closed: identity and compatibility are not proven.
4. **Mixed bundle accepted.** Each component is independently approved, but their combination is unreviewed. Fail closed: component approvals do not prove bundle compatibility.
5. **Wording-only bypass.** A textual change alters routing interpretation but is labelled patch/additive. It is breaking until explicitly classified otherwise.
6. **Inactive rule silently activated.** A candidate previously outside active calculation is enabled without compatibility review. Prohibited: activation requires a new applicable version and review.
7. **Synthetic evidence promoted.** Passing synthetic replay is cited as production compatibility. Prohibited: synthetic evidence is prerequisite only.
8. **Carrier invents semantics.** An orphan `GateState`, transport flag or error code is reused as compatibility/result status. Prohibited under `XFR-D-031`.
9. **Automatic `STALE` coercion.** Any version mismatch is silently mapped to `STALE` or `NEEDS_VERIFICATION`. Prohibited: exact status/route remains `OPEN`.
10. **Fake coordinated bump.** Unchanged Feature/Scoring/Risk components receive new versions only to make the bundle appear coordinated. Prohibited: versions/hashes reflect actual independent changes.
11. **Fallback by reputation.** An old version is reused because it passed previously. Prohibited unless the fallback and its current compatibility are separately approved.
12. **CI becomes approver.** Successful tests or schema validation activate a bundle automatically. Prohibited: human authority and controlled-artifact approval remain required.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — §15 row 17 and readiness may receive this partial qualitative boundary while preserving every exact content in §5 as `OPEN`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — may receive a current-status overlay for canonical `MQP-17 → XFR-D-043` without rewriting historical checkpoints or canonical mapping;
- future approved Qualification/Data Contracts/runtime design — must reference this record and separately decide exact carrier, compatibility and lifecycle contents.

No Policy, Inventory, manifest, Data Contracts or sibling record is changed or approved in this pass.

## 9. Change control

Any change to the authority split, prospective-only supersession, immutable historical-result rule, current-actionability prerequisite, independent-version rule, fail-closed compatibility floor or non-conflations requires a new versioned decision record, explicit `supersedes` reference and approval by `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT + AI`.

Technical implementation, test evidence, Policy edits or manifest changes cannot silently supersede this record.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE` remains `BLOCKED`;
- `SYNTHETIC_ACCEPTANCE_GATE` remains `BLOCKED`;
- `PRODUCTION_LAUNCH_GATE` remains `BLOCKED`.

This record approves no policy, controlled artifact, dataset, evidence package, evaluation run, runtime carrier, production-data use, deployment or implementation.

## 11. Acceptance criteria

1. Resolution status remains exactly `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved.
2. Governance owner is `Chief AI Architect + PRODUCT`.
3. Mandatory approvers are `LEGAL + DEVELOPMENT + AI`.
4. Evidence/technical-procedure owner is `DEVELOPMENT + AI` without unilateral approval authority.
5. Qualification Policy §15 row 17 candidate context is not represented as semantic ownership.
6. Supersession is prospective only and historical results are never mutated, relabelled or reinterpreted.
7. Every historical result remains bound to its original full version/hash bundle.
8. Current actionability after applicable supersession requires a separately approved compatible current bundle and a new calculation.
9. Unknown, mixed, incomplete or hash-mismatched compatibility fails closed without creating `STALE`, a negative fact or a Qualification result.
10. `STALE` remains orthogonal under `XFR-D-038` and is never a fifth Qualification result.
11. Qualification-only change does not force version bumps of unchanged Feature, Scoring or Risk components.
12. Exact taxonomy, version scheme, matrix, triggers, cascade, fallback, migration and recalculation mechanics remain `OPEN`.
13. Exact schema, API, DB, event, hash/signing, RBAC, evidence and manifest mechanics remain `OPEN`.
14. `XFR-D-031`, `XFR-D-033`, `XFR-D-040`, `XFR-D-044`, `XFR-D-055` and `XFR-D-M2` remain independent and are not reopened.
15. No numeric threshold, tolerance, grace period or default is introduced.
16. Synthetic evidence, replay, CI, merge, hash or manifest-shaped data never creates policy or production approval.
17. No Policy, dataset, evaluation, production-data, runtime or implementation approval is introduced.
18. All three governance gates remain `BLOCKED`.

## 12. Итог

`XFR-D-043 PARTIALLY RESOLVED — QUALITATIVE QUALIFICATION VERSION-COMPATIBILITY AND PROSPECTIVE SUPERSESSION BOUNDARY APPROVED; EXACT TAXONOMY, MATRIX, LIFECYCLE, CARRIER, POLICY AND IMPLEMENTATION REMAIN OPEN`
