# LeaseMind Matching Decision Record — XFR-D-010

**Decision ID:** `XFR-D-010`

**Название:** Hard Constraint reason catalog and cross-catalog mapping topology boundary

**Версия:** 1.1

**Дата решения:** 2026-09-15

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED FOUR-INDEPENDENT-CATALOGS AND IMMUTABLE DIRECTED-CROSSWALK BOUNDARY — EXACT IDENTIFIERS, CODES, MEMBERSHIP, TEXT, LOCALIZATION, AUDIENCE, CARRIER, DATA, EVIDENCE, PRODUCTION AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation in the 2026-09-15 working session.

**Repository baseline:** `5cf71157a9a17dba0ee5fbda523bd1a323385500`

**Supersedes:** `LeaseMind_MATCHING_DECISION_XFR-D-010_v1.0.md` prospectively. Historical calculations, records, causes, references and evidence remain bound to the versions/hashes actually used and are not reinterpreted.

**Canonical identity:** `FS-13 → XFR-D-010`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.1). This record does not change the Inventory mapping or counts of 102 source keys / 90 canonical IDs.

**Scope:** governance topology for four independently versioned catalogs and one immutable crosswalk manifest connecting: Hard Constraint internal reasons, Qualification reasons/results, Risk internal reason references, and safe user-facing explanations. It approves only catalog independence, isolated namespaces, explicit directed many-to-many mapping, governed-use exhaustiveness, affected-reason/explanation fail-closed behavior, preservation of all causes and Qualification precedence/primary-reason authority, catalog-order non-authority, entry eligibility, version/hash/provenance binding and prospective supersession. It does not approve any exact identifier, code, catalog member, reason, result, mapping row, display text, localization, audience, carrier, API, database, schema, dataset, evidence package, production use, Policy, Controlled Artifact Manifest entry, runtime design or implementation.

**Governance owner:** `Chief AI Architect + AI` — human-approved decision-specific assignment derived from the Feature Schema row №13 candidate and explicitly not `SOURCE_NORMATIVE`. Feature Schema artifact ownership remains separately `PRODUCT + LEGAL + AI`.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence/technical-preparation owner:** `AI + DEVELOPMENT`; this role may prepare catalog/crosswalk candidates, evidence and technical-feasibility analysis but has no unilateral authority to approve semantics, entries, mappings, ordering, Policy, production, carrier, runtime or implementation.

**Depends on/preserves:** `XFR-D-014` (no final LEGAL verdict for any of the 20 Hard Constraint candidates), unresolved portions of `XFR-D-001`/`XFR-D-002`/`XFR-D-012` (compatibility semantics), `XFR-D-M1` (per-feature evidence sufficiency), `XFR-D-033` (Qualification precedence), `XFR-D-040` (multi-cause preservation and primary-reason rule), `XFR-D-039` (Qualification reason/result mapping), `XFR-D-052` (Risk reason-reference catalog), and `XFR-D-077` (safe reason/explanation catalog). `XFR-D-031`, `XFR-D-038`, `XFR-D-043`, `XFR-D-048`, `XFR-D-051`, `XFR-D-055`, `XFR-D-072`, `XFR-D-078`, `XFR-D-079`, `XFR-D-080`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084` and Architecture §25 reason families retain their independent scope and authority.

---

## 1. Source/status discipline

1. Inventory indexes `FS-13 → XFR-D-010`, `PRIMARY_STANDALONE`; it is an informational index/status overlay, not substantive approval.
2. Feature Schema remains a Proposal. Its 20 entries remain `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE`, and `automatic_ineligible_allowed = NO` remains unchanged.
3. `XFR-D-014 v1.0` issued no final LEGAL verdict for any of those candidates. A catalog entry cannot promote a candidate or substitute for the final verdict, compatibility and evidence-sufficiency prerequisites.
4. Architecture §25.1/§25.2/§25.3 reason families remain source-normative internal source families. They do not become any G5 catalog, catalog entry, mapping or user-facing explanation by naming similarity or reuse.
5. `XFR-D-033` remains authoritative for route-determining precedence. `XFR-D-040` remains authoritative for preserving all causes/evidence and selecting a primary reason from the route-determining class.
6. `XFR-D-039`, `XFR-D-052` and `XFR-D-077` retain their separate governance owners and exact-content authority for Qualification, Risk and safe-explanation catalogs. This record coordinates topology; it does not transfer their ownership to `XFR-D-010`.
7. Existing Data Contracts reason-code enums, database fields, API/event values, implementation tokens, tests, commits or schemas do not supply catalog or mapping authority.
8. Proposal text, a crosswalk-shaped file, hash presence, replay success, CI, merge or implementation does not approve an exact catalog, crosswalk manifest instance, Policy, production use or gate transition.

---

## 2. Вопрос

Какая qualitative governance topology связывает будущие Hard Constraint, Qualification, Risk и safe-explanation reason catalogs, пока exact identifiers, entries, mappings, text, carrier, evidence, production applicability and implementation remain `OPEN`?

---

## 3. Решение

### 3.1. Authority boundary

1. Governance owner of `XFR-D-010` remains `Chief AI Architect + AI`, human-approved candidate-derived and not `SOURCE_NORMATIVE`.
2. Mandatory approvers remain `PRODUCT + LEGAL + DEVELOPMENT`.
3. Evidence/technical-preparation owner remains `AI + DEVELOPMENT`, without unilateral semantic or operational approval.
4. Feature Schema artifact owner remains `PRODUCT + LEGAL + AI`; approval of this record does not approve or transfer ownership of the Feature Schema.
5. `XFR-D-039`, `XFR-D-052` and `XFR-D-077` keep their own owner/approver sets. The cross-catalog topology does not permit the owner of one catalog to approve another catalog or a mapping involving it unilaterally.

### 3.2. Four independently versioned catalogs

The approved topology contains exactly four independently versioned catalog domains:

1. **Hard Constraint internal reason catalog** — canonical governance under `FS-13 → XFR-D-010`;
2. **Qualification reason/result catalog** — independently governed under `MQP-12 → XFR-D-039`;
3. **Risk internal reason-reference catalog** — independently governed under `MRP-07 → XFR-D-052`;
4. **safe user-facing explanation catalog** — independently governed under `SPP-07 → XFR-D-077`.

Each catalog has an isolated namespace, independent version and content hash. A version, identifier or entry in one catalog is never an entry, alias, result, mapping, presentation permission or approval in another catalog by implication.

Architecture §25.1/§25.2/§25.3 values remain separate source-normative internal reason families, not a fifth G5 catalog automatically and not implicitly absorbed into any of the four catalogs. Any relationship to a G5 catalog requires an applicable separately approved directed mapping.

### 3.3. One immutable crosswalk manifest

1. Cross-catalog relationships may exist only in one explicitly governed immutable crosswalk manifest bound to the exact participating catalog versions and hashes.
2. The crosswalk manifest records mappings; it does not merge namespaces or make one catalog authoritative for another.
3. A mapping is valid only for its explicitly declared source catalog/version/entry, target catalog/version/entry, governed use, scope, purpose and provenance.
4. An actual crosswalk manifest instance requires separate approval by every applicable catalog authority and the complete cross-functional change-control set on the same exact version/hash.
5. This topology decision does not create or approve an actual crosswalk file, mapping row, Controlled Artifact Manifest entry, schema or runtime carrier.

### 3.4. Explicit directed mapping; many-to-many allowed

1. Every mapping edge is explicit and directed. Approval of `A → B` does not approve `B → A`, transitive `A → C`, aliasing, equivalence or identity.
2. Equality of strings, identifiers, prefixes, suffixes, labels, apparent meaning or shared transport representation never creates a mapping.
3. Many-to-many mappings are permitted as a topology: one approved source entry may explicitly map to multiple approved target entries, and multiple approved source entries may explicitly map to one approved target entry.
4. Many-to-many permission is not approval of any particular edge, catalog member, aggregation, priority, wording or route.
5. AI, operator judgment, heuristic, nearest-match logic, fallback, schema, API, database, carrier or implementation cannot infer or manufacture a missing edge.

### 3.5. Governed-use exhaustiveness

1. Any catalog/crosswalk version activated for a governed use must be exhaustive for every allowed source entry in that exact use.
2. Exhaustiveness means each allowed source entry has an explicit approved disposition in the crosswalk for that use; omission, silence or an unknown entry is not an implicit mapping, fallback or negative outcome.
3. Exact disposition vocabulary, mapping rows, entry membership and applicability remain `OPEN`; this record introduces no hidden `OTHER`, `DEFAULT`, `UNKNOWN`, generic failure or catch-all value.
4. Exhaustiveness for one use, version, purpose or target catalog does not prove exhaustiveness for another.
5. A catalog version cannot be activated for a use by declaring partial coverage sufficient, relying on runtime fallbacks or dropping unhandled source entries.

### 3.6. Entry eligibility and downstream safe mapping

1. Only a separately approved, current, applicable catalog entry may participate in a crosswalk mapping.
2. For the Hard Constraint catalog, an entry is ineligible until the exact constraint has the required independent lawful approval, applicable compatibility resolution and evidence sufficiency under `XFR-D-014`, `XFR-D-001`/`XFR-D-002`/`XFR-D-012` and `XFR-D-M1` where applicable.
3. A source candidate, provisional reason, Risk signal, Qualification result, raw evidence or implementation token does not become an eligible catalog entry because it is technically present.
4. Only separately approved entries and explicit directed mappings are eligible for downstream safe-explanation mapping.
5. Eligibility and mapping do not themselves authorize display. Exact wording, localization, audience/purpose applicability, field/row requiredness and presentation approval remain separately governed by `XFR-D-072`, `XFR-D-077`, `XFR-D-078`, `XFR-D-079`, `XFR-D-080`, `XFR-D-083` and `XFR-D-084`.

### 3.7. Affected-reason/explanation fail-closed behavior

If a required catalog version, entry, explicit mapping, exhaustive disposition, provenance or compatibility is missing, unknown, unmapped, ambiguous, stale, conflicting, inapplicable or version/hash-incompatible:

1. only the affected reason-reference or explanation use is blocked;
2. no code, alias, mapping, negative fact, Hard Constraint failure, rejection, `INELIGIBLE`, Qualification result, route, primary reason or display text is guessed or generated;
3. the underlying Match, evidence, valid causes and route are not recalculated, relabeled, hidden, deleted or overwritten;
4. other applicable causes and evidence references remain preserved;
5. the condition does not block the whole Match or whole presentation payload unless another independently approved rule requires that behavior;
6. it cannot authorize Policy/manifest change, production use, runtime behavior, release or a gate transition;
7. exact retry, review, fallback, cascade, error/status and recovery mechanics remain `OPEN`.

Fail closed here means that unapproved or incomplete catalog/crosswalk material is unusable for the affected reason/explanation use. It is not a business verdict or runtime design.

### 3.8. Precedence, all causes and primary reason remain authoritative

1. Every applicable machine-readable cause and evidence reference remains preserved under `XFR-D-040`.
2. The crosswalk may represent approved relationships but cannot drop causes, merge evidence histories, recalculate routing or change the precedence class.
3. `XFR-D-033` remains the authority for route-determining precedence.
4. Primary reason remains only the deterministic summary selected from the route-determining class under `XFR-D-033`/`XFR-D-040`.
5. Incidental identifier, file, manifest-row, discovery, SQL and crosswalk-row order, and mapping multiplicity, have no semantic priority and cannot select a route or primary reason.
6. `XFR-D-040` remains authoritative: a separately approved semantic same-class order inside a future approved versioned reason catalog may select the primary reason. The exact semantic order and primary-reason representation remain independently governed and `OPEN`; this record introduces no order or tie-break value.

### 3.9. Version/hash/provenance and prospective supersession

1. Each usable catalog reference and mapping remains bound to the exact catalog versions/hashes, crosswalk-manifest version/hash, governed use, purpose and source/evidence provenance used at decision time.
2. Individually approved catalog versions do not prove that their combination or mapping is approved and compatible.
3. A changed entry meaning, membership, mapping or applicability requires a new approved version and prospective supersession; historical calculations and references remain immutable.
4. A later version cannot silently reinterpret, backfill, relabel or overwrite historical causes, mappings, primary reasons or explanations.
5. Exact identifier format, hash composition, signing, compatibility matrix, migration, recalculation, retention and carrier mechanics remain `OPEN`.

### 3.10. Evidence is prerequisite, not authorization

1. Evidence eligibility, reproducibility, completeness and technical feasibility are prerequisites for exact catalogs and mappings, not substitutes for governance approval.
2. Synthetic-only evidence does not approve production catalog membership, mapping, wording, applicability or readiness.
3. Tests, replay, schema validation, CI, commit, merge or implementation success cannot approve catalog content, crosswalk mappings, Policy, production use, runtime or gates.
4. Evidence or monitoring output cannot automatically change catalogs, mappings, routing, presentation, Policy, model, release or runtime behavior.

### 3.11. Partial, never fully resolved

`XFR-D-010 v1.1` remains `PARTIALLY_RESOLVED_BOUNDARY`. It prospectively supersedes v1.0 only by adding the four-independent-catalog topology, one immutable crosswalk manifest, explicit directed many-to-many mapping, governed-use exhaustiveness, affected-reason/explanation fail-closed behavior, catalog-order non-authority, approved-entry eligibility and prospective version/hash/provenance discipline.

Every exact item in §5 remains `OPEN`. This record does not fully resolve `FS-13`, any sibling decision, any Proposal, Policy, catalog, crosswalk manifest instance, production use, runtime or implementation.

---

## 4. Layer/authority table

| Layer | Preserved authority | Approved by v1.1 | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.1 | `FS-13 → XFR-D-010`, `PRIMARY_STANDALONE`, unchanged | Later status overlay only |
| Hard Constraint catalog | `XFR-D-010`; owner `Chief AI Architect + AI`; approvers `PRODUCT + LEGAL + DEVELOPMENT` | Isolated independently versioned domain; entry eligibility safeguards | Namespace identifier, codes, membership, actual entries |
| Qualification catalog/mapping | `XFR-D-039` and Qualification authorities | Independent catalog and directed mapping topology preserved | Exact reasons/results mapping, cardinality, applicability |
| Risk reason references | `XFR-D-052` and Risk authorities | Independent internal catalog and directed mapping topology preserved | Exact namespace, values, coverage and compatibility |
| Safe explanations | `XFR-D-077` and Safe Presentation authorities | Independent catalog; only approved entries/mappings eligible downstream | Exact safe text, templates, coverage, locale and audience |
| Crosswalk manifest | Joint applicable catalog authorities; all-five-function change control | One immutable, version/hash-bound, directed, use-scoped mapping artifact topology | Actual manifest, entries, disposition vocabulary, schema and approval record |
| Qualification precedence | `XFR-D-033` | Preserved; mappings cannot change routes | Exact thresholds remain independently governed |
| Multi-cause/primary reason | `XFR-D-040` | All causes preserved; incidental storage/file/crosswalk order has no priority | Separately approved semantic same-class catalog order and exact primary representation |
| Lawful Hard Constraint eligibility | `XFR-D-014`, applicable compatibility records and `XFR-D-M1` | Dependencies required before entry eligibility | Every item-specific verdict, remaining compatibility and evidence level |
| Evidence/technical preparation | `AI + DEVELOPMENT` | Preparation only, non-unilateral | Exact evidence package, procedure and verdict |
| Presentation wording/localization/audience | `XFR-D-072`, `XFR-D-078`–`XFR-D-080`, `XFR-D-083`/`084` | Independent; no display authorization | Actual row, text, locale, audience, evidence and Policy approval |
| Runtime/Data Contracts | Separate downstream authority; `XFR-D-082` where applicable | Nothing approved | API, DB, schema, events, carrier and implementation |
| Production/gates | Separate approvals and Architecture gates | No effect | Production applicability and every gate transition |

---

## 5. Что остаётся `OPEN`

- exact namespace identifiers, prefixes and identifier formats for every catalog;
- all catalog codes, values, membership, exhaustiveness content and actual entries;
- every actual directed mapping edge, source/target entry, use, scope, purpose and applicability;
- exact crosswalk disposition vocabulary, mapping-row representation and compatibility rules;
- exact semantic same-class catalog order under `XFR-D-040`, primary-reason representation and any presentation/storage order;
- lawful Hard Constraint set and all item-specific verdicts under `XFR-D-014`;
- remaining compatibility semantics under `XFR-D-001`/`XFR-D-002`/`XFR-D-012`;
- per-feature evidence levels and sufficiency under `XFR-D-M1`;
- Qualification and Risk exact catalog content, results/coverage and mapping details under `XFR-D-039`/`XFR-D-052`;
- safe explanation text, templates, requiredness, mapping, localization, supported locales and audience/purpose applicability;
- exact crosswalk-manifest filename, format, signature, hash composition, approval record and Controlled Artifact Manifest entry;
- version compatibility, migration, recalculation, retry, fallback, cascade, error/status and recovery mechanics;
- reviewer appointments, RBAC, quorum, exception and waiver processes;
- schema, API, database, events, serialization, storage and producer/consumer topology;
- datasets, manifests, evidence procedures, tests, metrics, statistics, runs, results and verdicts;
- Proposal and Policy approvals, production-data authority/applicability, monitoring, release and deployment;
- runtime design and implementation;
- `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` transitions.

No open item is supplied by implication through the approved qualitative topology.

---

## 6. Explicit non-conflations

1. Four catalog domains ≠ one merged namespace.
2. One crosswalk manifest ≠ one catalog and ≠ the Architecture Controlled Artifact Manifest.
3. An approved topology ≠ an approved crosswalk manifest instance or mapping row.
4. Directed `A → B` ≠ reverse mapping, transitive mapping, identity, alias or equivalence.
5. Many-to-many permission ≠ approval of any edge, aggregation, priority or route.
6. Governed-use exhaustiveness ≠ generic fallback, `OTHER`, negative fact or permission to ignore an entry.
7. Architecture §25 reason values ≠ automatically approved G5 catalog entries.
8. Hard Constraint catalog membership ≠ lawful Hard Constraint approval, confirmed violation or automatic `INELIGIBLE`.
9. Incidental file/manifest/crosswalk row order ≠ semantic priority, route precedence or the separately approved semantic same-class catalog order required by `XFR-D-040`.
10. Mapping eligibility ≠ display authorization; safe wording/localization/audience remain separate.
11. Missing/unmapped catalog material ≠ Match failure, rejection, route, whole-payload block or negative business fact.
12. Technical preparation, schema validity, hash presence, CI or implementation ≠ semantic, Policy, production, runtime or gate approval.
13. Historical version ≠ current compatible version; prospective supersession never rewrites history.

---

## 7. Rationale

The four affected decisions already prohibit implicit namespace collapse but left the relationship topology open. Approving four independently versioned catalogs plus one explicit immutable crosswalk manifest makes coordination deterministic without inventing catalog content. Directed many-to-many mappings support legitimate relationships without treating shared labels as identity, while use-specific exhaustiveness prevents incomplete mappings from silently dropping causes or falling back to guessed text.

The boundary preserves existing authority: lawful Hard Constraint membership remains blocked by `XFR-D-014`, compatibility and evidence prerequisites; Qualification routing and primary-reason selection remain under `XFR-D-033`/`XFR-D-040`; Risk and safe-explanation catalogs retain independent owners. Missing mapping material therefore blocks only the affected reason/explanation use and never invents a business or runtime outcome.

---

## 8. Adversarial cases

1. **Shared label treated as identity.** Equal `MISSING_DATA` strings in two catalogs are assumed equivalent. Prohibited: only an approved directed edge creates a relationship.
2. **Reverse mapping inferred.** Approval of internal reason → safe explanation is cited as safe explanation → internal reason authority. Prohibited: direction is explicit and non-reversible by implication.
3. **Transitive mapping inferred.** Hard Constraint → Qualification and Qualification → safe explanation are combined into Hard Constraint → safe explanation without an explicit edge. Prohibited.
4. **Partial crosswalk activated.** A use is enabled while one allowed source entry has no explicit disposition. Prohibited: that catalog/crosswalk version is not exhaustive for the use.
5. **Catch-all invented.** Missing coverage is routed to an unapproved generic `OTHER` or failure. Prohibited: exact disposition vocabulary remains `OPEN`.
6. **Incidental order chooses primary reason.** File order, identifier sort or crosswalk row order selects the displayed primary cause. Prohibited: only a separately approved semantic same-class order in a future approved versioned reason catalog may select under `XFR-D-040`; `XFR-D-033` remains authoritative for precedence.
7. **Many-to-many becomes compensation.** Multiple safe mappings are used to hide one adverse cause or discard evidence. Prohibited: all causes/evidence remain preserved.
8. **Candidate gets a code and becomes a Hard Constraint.** Prohibited: `XFR-D-014`, compatibility and `XFR-D-M1` prerequisites remain unmet.
9. **Internal code displayed directly.** Prohibited without separately approved safe catalog entry, explicit mapping and presentation applicability.
10. **Missing mapping rejects the Match.** Prohibited: only the affected reason/explanation use is blocked.
11. **One catalog owner approves the whole crosswalk.** Prohibited: every applicable authority and the all-five-function change control must approve the same version/hash.
12. **Schema becomes authority.** A Data Contracts enum or API value is cited as catalog approval. Prohibited.
13. **New version rewrites history.** Historical reasons are remapped to current wording. Prohibited: prospective supersession and original version/hash attribution are mandatory.
14. **Synthetic pass enables production.** Prohibited: evidence is prerequisite, not authorization.

---

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — a later controlled sync may update the current `FS-13` status overlay, §10 row №13, readiness and acceptance criteria without adding exact catalog contents;
- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md`, `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` and `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — later separately authorized syncs may record only the shared topology while preserving each catalog's authority and `OPEN` contents;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a later overlay may index v1.1 without changing `FS-13 → XFR-D-010`, role or canonical counts;
- actual catalog, crosswalk, evidence, Data Contracts, Policy, manifest and runtime artifacts require separate scoped decisions and approvals.

**No sync is performed by this record. Feature Schema, Qualification Policy, Risk Policy, Safe Presentation Policy, Inventory, Data Contracts, manifests, sibling records, runtime and code remain untouched.**

No future sync may interpret this record as an approved identifier, code, catalog entry, mapping row, text, locale, audience rule, crosswalk-manifest instance, Controlled Artifact Manifest entry, Policy, dataset/evidence verdict, production use, carrier, runtime or implementation authorization.

---

## 10. Change control

Any change to the four-catalog topology, namespace isolation, crosswalk-manifest boundary, directed/many-to-many mapping rule, governed-use exhaustiveness, entry eligibility, affected-reason/explanation fail-closed behavior, all-cause/precedence preservation, catalog-order non-authority, or version/hash/provenance/prospective-supersession discipline requires a new versioned `XFR-D-010` record explicitly superseding this version.

The change must be approved by all five functions — `Chief AI Architect`, `AI`, `PRODUCT`, `LEGAL`, `DEVELOPMENT` — on the same exact version/hash. Evidence/technical preparation cannot self-approve.

---

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

This record approves no Proposal, Policy, catalog, mapping, crosswalk-manifest instance, Controlled Artifact Manifest entry, Data Contract, dataset/evaluation run, production data/use, runtime or implementation.

---

## 12. Acceptance criteria

1. **Given** canonical identity, **when** this record is indexed later, **then** `FS-13 → XFR-D-010`, `PRIMARY_STANDALONE`, and counts 102/90 remain unchanged.
2. **Given** versioning, **when** current authority is checked, **then** v1.1 prospectively supersedes v1.0 and historical records remain bound to their original versions/hashes.
3. **Given** roles, **when** authority is checked, **then** owner is `Chief AI Architect + AI`, candidate-derived and not source-normative; approvers are `PRODUCT + LEGAL + DEVELOPMENT`; `AI + DEVELOPMENT` has no unilateral approval; Feature artifact owner remains `PRODUCT + LEGAL + AI`.
4. **Given** the G5 topology, **when** catalog domains are counted, **then** exactly four independently versioned isolated catalogs and one immutable crosswalk-manifest boundary are present.
5. **Given** any two catalog entries, **when** strings, identifiers or wording match, **then** no identity, alias, equivalence or mapping is inferred.
6. **Given** an approved directed mapping `A → B`, **when** reverse or transitive use is requested, **then** it remains unauthorized without its own explicit approved edge.
7. **Given** mapping cardinality, **when** one-to-many or many-to-one relationships are required, **then** many-to-many topology is permitted but no actual edge, priority, route or content is approved.
8. **Given** a catalog/crosswalk version proposed for a governed use, **when** coverage is checked, **then** every allowed source entry has an explicit approved disposition for that use; partial or implicit coverage cannot be activated.
9. **Given** a source entry, **when** downstream safe mapping is requested, **then** the entry and explicit directed mapping must each be separately approved, current, applicable and version/hash/provenance-bound.
10. **Given** a Hard Constraint candidate, **when** catalog membership is requested, **then** `XFR-D-014`, applicable `XFR-D-001`/`002`/`012` and `XFR-D-M1` prerequisites remain binding and no candidate is promoted.
11. **Given** missing/unmapped/unknown/stale/conflicting/incompatible catalog or mapping material, **when** a reason/explanation is requested, **then** only that affected use is blocked; no Match failure, rejection, `INELIGIBLE`, route, primary reason, whole-payload block or display text is invented.
12. **Given** multiple causes, **when** crosswalk mappings are applied, **then** all causes/evidence remain preserved, `XFR-D-033` precedence and `XFR-D-040` primary-reason authority remain unchanged; incidental file/manifest/crosswalk order has no priority, while the future separately approved semantic same-class catalog order remains `OPEN` under `XFR-D-040`.
13. **Given** exact identifiers, codes, members, mapping rows, text, localization, audience, carrier/API/DB/schema, data/evidence, production, Policy, manifest, runtime or implementation, **when** status is checked, **then** every item remains `OPEN` under its applicable authority.
14. **Given** tests, replay, CI, merge, schema validity or synthetic evidence, **when** activation or approval is requested, **then** none approves a catalog, mapping, Policy, production use, runtime, implementation or gate.
15. **Given** this record, **when** authorization scope is checked, **then** no sync occurred and Feature Schema, sibling Proposals, Inventory, Data Contracts, manifests, sibling records, runtime and code remain untouched.
16. **Given** the governance gates, **when** their status is checked, **then** `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` all remain `BLOCKED`.

---

## 13. Итог

`XFR-D-010 v1.1 PARTIALLY RESOLVED — FOUR INDEPENDENT VERSIONED CATALOGS, ONE IMMUTABLE DIRECTED MANY-TO-MANY CROSSWALK MANIFEST, GOVERNED-USE EXHAUSTIVENESS, AFFECTED-USE FAIL-CLOSED, ALL-CAUSE/PRECEDENCE PRESERVATION AND PROSPECTIVE VERSION BINDING APPROVED; ALL EXACT CATALOG, MAPPING, TEXT, DATA, POLICY, PRODUCTION, CARRIER, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN/BLOCKED`
