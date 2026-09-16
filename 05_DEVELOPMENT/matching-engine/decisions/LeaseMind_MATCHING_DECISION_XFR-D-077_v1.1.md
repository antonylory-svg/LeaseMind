# LeaseMind Matching Decision Record — XFR-D-077

**Decision ID:** `XFR-D-077`

**Название:** User-facing safe reason/explanation catalog and crosswalk governance boundary

**Версия:** 1.1

**Дата решения:** 2026-09-15

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE SAFE-EXPLANATION CATALOG, CROSSWALK, LEGAL-SAFETY, EXHAUSTIVENESS, PROVENANCE AND AFFECTED-USE FAIL-CLOSED BOUNDARY — EXACT CONTENT, WORDING, LOCALIZATION, AUDIENCE, CARRIER, DATA, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-09-15 working session

**Repository baseline:** `5cf71157a9a17dba0ee5fbda523bd1a323385500`

**Supersedes:** `LeaseMind_MATCHING_DECISION_XFR-D-077_v1.0.md` prospectively. Historical presentations, decisions and references remain bound to their original record, catalog, Policy and artifact versions/hashes.

**Canonical identity:** Inventory mapping `SPP-07 → XFR-D-077`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.6); repository canonical counts remain 102 source keys / 90 canonical IDs.

**Scope:** only the human-approved qualitative Safe Presentation reason/explanation catalog boundary within the G5 topology of four independently versioned isolated catalogs and one immutable, explicitly directed crosswalk manifest. This record approves catalog separation, governed-use exhaustiveness, separately approved legal-safety eligibility, no-direct-internal-code-display, version/hash/provenance discipline and affected explanation/reference fail-closed behavior. It does not approve any catalog or crosswalk content, exact namespace, identifier, code, member, mapping row, canonical wording, template, localization, audience, carrier, API, database, schema, data, evidence verdict, Policy, production use, runtime or implementation.

**Governance owner:** `PRODUCT + LEGAL` — preserves the `SOURCE_NORMATIVE` broad Safe Presentation decision/artifact boundary established by Architecture §37 question 6 and §52. This does not make any exact catalog content source-normative or already approved.

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate catalogs, crosswalk evidence and technical-feasibility material but has no unilateral authority to approve legal safety, wording, mappings, Policy, production use, carrier, runtime or implementation.

**Preserved authorities:** Safe Presentation artifact owner remains `PRODUCT + LEGAL`; Hard Constraint, Qualification, Risk, routing, precedence, runtime carrier, evidence and artifact-approval authorities remain with their independently governed artifacts and records. This record transfers, merges or widens none of those authorities.

**Depends on/preserves:** `XFR-D-010 v1.1` (Hard Constraint catalog), `XFR-D-039 v1.1` (Qualification reasons/results catalog), `XFR-D-052 v1.1` (Risk reason-reference catalog), `XFR-D-033` (route-determining precedence), `XFR-D-040` (all-cause preservation and primary-reason authority), `XFR-D-044` (read-only presentation consumption), `XFR-D-069` (unknown/abstention terminology), `XFR-D-072` (field/payload allowlist and explanation applicability), `XFR-D-078` (score/confidence/risk/Qualification wording), `XFR-D-079` (localization), `XFR-D-080` (audience/purpose), `XFR-D-082` (runtime carrier), `XFR-D-083` (actual evidence) and `XFR-D-084` (artifact approval/change control). Their exact contents and authorities remain independent and `OPEN` where not separately approved.

---

## 1. Source/status discipline

The canonical identity remains `SPP-07 → XFR-D-077`, `PRIMARY_STANDALONE`. Architecture §37 question 6 and §52 source-normatively assign the broad Safe Presentation question and `SAFE_PRESENTATION_POLICY` artifact to `PRODUCT + LEGAL`. They do not define or approve an exact reason/explanation catalog, entry, wording, crosswalk, localization, audience rule or runtime carrier.

`LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` remains a Proposal. Its `SPP-07` candidate material and current v1.0 overlay are context for this human-approved narrow v1.1 boundary, not approval of exact content or production use. Inventory is an index/status/provenance overlay, not approval authority. Canonical counts remain 102 source keys / 90 canonical IDs.

Architecture §25 preserves distinct algorithmic, process and human internal reason families. Architecture §37/§52 establish Safe Presentation authority and launch blocking. None of these sources turns internal reasons into safe external explanations or supplies an exact mapping. Existing Data Contracts `reason_code` fields belong to separate post-Match event namespaces and are not catalog or carrier authority here.

## 2. Вопрос

Какая minimal qualitative governance boundary применяется к user-facing safe reason/explanation catalog и его будущим связям с Hard Constraint, Qualification и Risk catalogs, пока exact identifiers, membership, mapping rows, wording, localization, audience, carrier, evidence and runtime остаются неутверждёнными?

## 3. Решение

### 3.1. Authority boundary

1. Governance owner — `PRODUCT + LEGAL`, preserving the `SOURCE_NORMATIVE` broad Safe Presentation authority from Architecture §37 question 6 and §52.
2. Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral semantic, legal-safety, Policy or operational approval.
4. Safe Presentation artifact owner remains `PRODUCT + LEGAL`; exact artifact approval/change control remains under `XFR-D-084` and is not completed here.
5. Owners of `XFR-D-010`, `XFR-D-039` and `XFR-D-052` retain authority over their internal catalog domains. Safe Presentation ownership does not absorb or rewrite them.
6. Ни одна функция, reviewer, translator, transport producer, consumer, AI process или implementation не может создать или approve entry, mapping, canonical wording, audience applicability or legal-safety verdict in an individual case.

### 3.2. Four independently versioned isolated catalogs

The approved G5 topology contains exactly four independently versioned isolated catalog domains:

1. Hard Constraint internal reasons under `XFR-D-010`;
2. Qualification reasons/results under `XFR-D-039`;
3. Risk internal reason references under `XFR-D-052`;
4. user-facing safe reasons/explanations under `XFR-D-077`.

The Safe Explanation catalog remains a distinct external-presentation domain. Equal strings, prefixes, suffixes, identifiers, labels, code shapes or similar wording do not create identity, alias, equivalence, compatibility or mapping between catalogs. Architecture §25 families remain separate source-normative internal reason families, not an automatically created fifth G5 catalog and not Safe Explanation entries by implication.

### 3.3. One immutable explicit crosswalk manifest

1. Relationships among the four catalogs may exist only through one separately approved immutable crosswalk manifest bound to exact catalog versions/hashes, governed use, scope, purpose and provenance.
2. This record approves only the qualitative topology. It does not create or approve a manifest instance, filename, schema, signature, mapping row, edge, disposition vocabulary or Controlled Artifact Manifest entry.
3. The crosswalk is not a fifth catalog, does not merge namespaces and does not transfer catalog authority.
4. Individually approved catalogs do not prove that their combination or a mapping between them is approved and compatible.

### 3.4. Directed mapping and many-to-many cardinality

1. Every relationship is an explicit directed mapping `source entry → target entry/disposition` for a named governed use.
2. `A → B` does not authorize reverse `B → A`.
3. Multiple approved edges do not create a transitive mapping, alias chain or equivalence without a separately approved explicit edge.
4. Many-to-many topology is allowed qualitatively: one-to-many and many-to-one relationships require explicit approved directed edges.
5. Permission for many-to-many topology approves no actual edge, priority, route, wording, aggregation or fallback.

### 3.5. Governed-use exhaustiveness

1. Any catalog/crosswalk version activated for a governed use must contain an explicit approved disposition for every allowed source entry in that use.
2. Partial mapping, undocumented omission, implicit identity, nearest-label match, generic catch-all or consumer-specific fallback is not exhaustive.
3. `NO_MAPPING`, `NOT_APPLICABLE`, suppression, multiple targets or another disposition may be used only if that exact disposition token, meaning and applicability are separately approved; this record creates none.
4. Exhaustiveness is scoped to a named use/version and does not create universal display requiredness, catalog membership, route or whole-payload behavior.

### 3.6. Separately approved legal-safety eligibility; no direct internal display

1. Only a separately approved, legally safe, current, compatible and use-applicable Safe Explanation entry may be eligible for external explanation.
2. The upstream source entry must itself be separately approved, current, applicable and bound to its source authority, version/hash and provenance.
3. Eligibility additionally requires an explicit approved directed mapping between that approved source entry and the Safe Explanation entry, with exact version/hash/provenance compatibility for the governed use.
4. Internal Architecture §25 reasons, Hard Constraint codes, Qualification reasons/results, Risk references, evidence details, exact counterparty values, reviewer notes and Data Contracts reason codes may never be displayed directly by implication.
5. A technically available string, shared label, schema-valid field, translation, operator text, AI-generated text or successful transport does not establish source-entry approval, safe wording, legal safety, mapping or display authorization.
6. Catalog membership alone does not authorize a field, payload row, recipient, audience, purpose, locale, Reveal, production use or release. Those remain under `XFR-D-072`, `XFR-D-079`, `XFR-D-080` and other applicable authorities.
7. This record approves no actual source entry, safe entry or legal-safety verdict for any text or template.

### 3.7. Affected explanation/reference fail-closed behavior

If a required catalog version, safe entry, explicit mapping, exhaustive disposition, legal-safety determination, provenance or compatibility is missing, unknown, unmapped, ambiguous, stale, conflicting, inapplicable or version/hash-incompatible:

1. only the affected explanation/reference use is blocked;
2. no wording, translation, alias, mapping, negative fact, Hard Constraint failure, rejection, `INELIGIBLE`, Qualification result, route, primary reason or fallback is guessed or generated;
3. the underlying Match, evidence, valid causes, Risk components, Qualification result and route are not recalculated, relabeled, hidden, deleted or overwritten;
4. all other applicable causes and evidence references remain preserved;
5. the whole Match or whole presentation payload is not blocked unless another independently approved rule requires that behavior;
6. the condition does not authorize presentation without required wording, Policy/manifest change, production use, runtime behavior, release or a gate transition;
7. exact explanation requiredness, blocked unit, retry, review, fallback, cascade, error/status and recovery mechanics remain `OPEN`.

Fail closed means only that unapproved or incomplete catalog/crosswalk material cannot be consumed for the affected explanation/reference use. It is not a business verdict and not a runtime design.

### 3.8. All causes, precedence and primary reason

1. Every applicable machine-readable cause and evidence reference remains preserved; external explanation never deletes, merges, compensates, obscures or replaces the audit cause set.
2. `XFR-D-033` remains the authority for route-determining precedence.
3. `XFR-D-040` remains the authority for multi-cause preservation and primary reason as a deterministic summary from the route-determining class.
4. Incidental identifier, file, manifest-row, translation, discovery, SQL and crosswalk-row order, and mapping multiplicity, have no semantic priority and cannot select a route or primary reason.
5. Crosswalk processing cannot recalculate routing, move a cause between precedence classes or manufacture another primary cause.
6. `XFR-D-040` remains authoritative: a separately approved semantic same-class order inside a future approved versioned reason catalog may select the primary reason. The exact semantic order and primary-reason representation remain independently governed and `OPEN`; they are never inferred from incidental order.

### 3.9. Version/hash/provenance and prospective supersession

1. Every usable catalog entry and mapping remains bound to exact catalog versions/hashes, crosswalk-manifest version/hash, governed use, purpose, source/evidence provenance and applicable Safe Presentation Policy version.
2. A changed entry meaning, membership, wording, mapping or applicability requires a new approved version and prospective supersession.
3. Historical causes, decisions, presentations and references remain immutable; a later version cannot silently reinterpret, backfill, relabel or overwrite them.
4. A previous approval, matching hash-shaped value, schema compatibility or successful rendering does not prove current semantic compatibility.
5. Exact identifiers, hash composition, signatures, compatibility matrix, migration, recalculation, retention and carrier mechanics remain `OPEN`.

### 3.10. Independent downstream boundaries

1. `XFR-D-078` independently governs score/confidence/risk/Qualification presentation wording; no wording or band is imported here.
2. `XFR-D-079` independently governs localization; no locale, translation or rendering method is approved here.
3. `XFR-D-080` independently governs audience/purpose binding; no audience, recipient or purpose taxonomy is approved here.
4. `XFR-D-082` independently governs runtime carrier/Data Contracts extension; no schema, API, DB, event or carrier is approved here.
5. `XFR-D-072` retains authority over field/payload allowlist and explanation applicability/requiredness; this record creates no row.
6. `XFR-D-083` actual evidence and `XFR-D-084` artifact approval/change control remain prerequisites, not completed approvals.
7. `XFR-D-044` read-only consumption and `XFR-D-069` terminology remain independent and are not widened.

### 3.11. Evidence is prerequisite, not authorization

1. Evidence eligibility, reproducibility, completeness and technical feasibility are prerequisites for exact catalogs and mappings, not substitutes for governance or legal-safety approval.
2. Synthetic-only evidence does not approve production catalog membership, mapping, wording, localization, audience applicability or readiness.
3. Test, replay, schema validation, CI, commit, merge, translation quality or implementation success does not approve catalog content, crosswalk, Policy, production use, runtime or gates.
4. Evidence, monitoring or evaluation output cannot automatically change catalogs, mappings, wording, routes, presentation, Policy, model, release or runtime behavior.

### 3.12. Partial, never fully resolved

`XFR-D-077 v1.1` remains `PARTIALLY_RESOLVED_BOUNDARY`. It prospectively supersedes v1.0 only by adding the four-independent-catalog topology, one immutable explicit crosswalk manifest, directed many-to-many mapping, governed-use exhaustiveness, separately approved legal-safety eligibility, no-direct-internal-code-display, affected explanation/reference fail-closed behavior, all-cause/precedence preservation, catalog-order non-authority and version/hash/provenance discipline.

Every exact item in §5 remains `OPEN`. This record does not fully resolve `SPP-07`, any sibling decision, any Proposal, Policy, catalog, crosswalk manifest, production use, runtime or implementation.

---

## 4. Layer/authority table

| Layer | Preserved authority | Approved by v1.1 | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.6 | `SPP-07 → XFR-D-077`, `PRIMARY_STANDALONE`, counts 102/90 unchanged | Later status overlay only |
| Broad Safe Presentation decision/artifact | Architecture §37 question 6 and §52; `PRODUCT + LEGAL` | Authority preserved | Exact Policy approval/content |
| Safe Explanation catalog | `XFR-D-077`; owner `PRODUCT + LEGAL`; approvers `Chief AI Architect + AI + DEVELOPMENT` | Isolated versioned domain; legal-safety and entry-eligibility safeguards | Exact namespace, identifiers, codes, members and content |
| Hard Constraint catalog | `XFR-D-010` and Feature authorities | Independent catalog and directed mapping topology preserved | Exact entries and mappings |
| Qualification catalog | `XFR-D-039` and Qualification authorities | Independent catalog and directed mapping topology preserved | Exact reasons/results and mappings |
| Risk reason references | `XFR-D-052` and Risk authorities | Independent catalog and directed mapping topology preserved | Exact namespace, values and mappings |
| Crosswalk manifest | Joint applicable catalog authorities; all-five-function change control | One immutable, version/hash-bound, directed, use-scoped topology | Actual manifest, schema, rows, dispositions and approval record |
| Qualification precedence | `XFR-D-033` | Preserved; mapping cannot change route | Exact thresholds remain independently governed |
| Multi-cause/primary reason | `XFR-D-040` | All causes preserved; incidental storage/file/crosswalk order has no priority | Separately approved semantic same-class catalog order and exact primary representation |
| Field/payload applicability | `XFR-D-072` | No actual row or requiredness approved | Exact allowlist and explanation requiredness |
| Wording/localization/audience | `XFR-D-078`/`079`/`080` | Independent; no content imported | Exact text, locale, audience and purpose |
| Evidence/technical preparation | `XFR-D-083`; `AI + DEVELOPMENT` | Preparation only, non-unilateral | Actual evidence package and verdict |
| Artifact approval | `XFR-D-084` | Authority preserved | Exact Policy/manifest approval completion |
| Runtime/Data Contracts | `XFR-D-082`; separate downstream authority | Nothing approved; existing reason codes not imported | API, DB, schema, events, carrier and implementation |
| Production/gates | Separate approvals and Architecture gates | No effect | Production applicability and every gate transition |

---

## 5. Что остаётся `OPEN`

- exact Safe Explanation namespace identifier, prefix, identifier format, codes, values, membership and catalog content;
- every actual source family, source entry and coverage decision;
- every actual directed mapping edge, source/target entry, use, scope, purpose and applicability;
- exact crosswalk disposition vocabulary, mapping-row representation, exhaustiveness evidence and compatibility rules;
- canonical wording, templates, variables, allowed transformations, suppression and fallback;
- exact semantic same-class catalog order under `XFR-D-040`, presentation/storage order and exact primary-reason representation;
- localization, supported locales, translation method, locale variants and rendering;
- audience, recipient, purpose taxonomy, identity/binding and applicability;
- explanation requiredness and all actual Safe Presentation allowlist rows;
- exact legal-safety determinations, evidence and approval records for entries and mappings;
- versioning mechanics, aliases, deprecation, supersession, migration, recalculation, rollback and compatibility matrix;
- crosswalk-manifest filename, format, schema, signature, hash composition, approval record and Controlled Artifact Manifest entry;
- reviewer identities, appointments, RBAC, quorum, exception and waiver processes;
- retry, review, cache, TTL, freshness/invalidation, cascade, error/status and recovery behavior;
- API, database, events, serialization, storage, producer/consumer topology and runtime carrier;
- datasets, evidence manifests, procedures, tests, metrics, statistics, runs, results and verdicts;
- actual approval of Safe Presentation Policy, Feature Schema, Qualification Policy, Risk Policy, Data Contracts, manifests or any other controlled artifact;
- production-data authority/applicability, monitoring, release, deployment, runtime design and implementation;
- all governance-gate transitions.

No open item is supplied by implication through the approved qualitative topology.

---

## 6. Explicit non-conflations

1. Four catalog domains ≠ one merged namespace.
2. Safe Explanation catalog ≠ Architecture §25 reason families, Hard Constraint codes, Qualification reasons/results or Risk references.
3. One crosswalk manifest ≠ one catalog and ≠ the Architecture Controlled Artifact Manifest.
4. Approved topology ≠ approved manifest instance, catalog entry, mapping row, wording or display authorization.
5. Directed `A → B` ≠ reverse mapping, transitive mapping, alias, identity or equivalence.
6. Many-to-many permission ≠ approval of any edge, aggregation, priority, route, text or fallback.
7. Governed-use exhaustiveness ≠ generic fallback, negative fact or permission to ignore an entry.
8. Internal catalog membership ≠ legal safety or external-display eligibility.
9. Safe catalog membership ≠ field/payload/recipient/audience/purpose/locale authorization.
10. Incidental file/manifest/crosswalk row order ≠ semantic priority, route precedence or the separately approved semantic same-class catalog order governed by `XFR-D-040`.
11. Missing/unmapped material ≠ Match failure, rejection, `INELIGIBLE`, route, whole-payload block or negative business fact.
12. Existing Data Contracts `reason_code`, raw evidence, operator text or AI-generated text ≠ approved safe explanation.
13. `XFR-D-078` wording, `XFR-D-079` localization, `XFR-D-080` audience/purpose and `XFR-D-082` carrier remain independent.
14. Technical preparation, schema validity, CI or implementation ≠ semantic, legal, Policy, production, runtime or gate approval.
15. Historical version ≠ current compatible version; prospective supersession never rewrites history.

---

## 7. Rationale

The Safe Explanation catalog is the only G5 domain intended for external presentation. That makes explicit separation and legal-safety eligibility essential: internal reasons are audit and decision inputs, not user-facing text. An immutable directed crosswalk permits controlled relationships without importing internal codes or inferring identity from shared labels.

Use-specific exhaustiveness prevents partial mappings from silently dropping causes or inventing generic wording. Affected-use fail-closed behavior prevents missing catalog material from becoming a rejection or whole-payload decision. Preserving `XFR-D-033` and `XFR-D-040` ensures that presentation mapping cannot change routing precedence, discard causes or manufacture a primary reason.

---

## 8. Adversarial cases

1. **Internal code displayed directly.** A Hard Constraint, Qualification or Risk token is rendered to the user. Prohibited without a separately approved legally safe entry and explicit directed mapping.
2. **Shared string treated as identity.** Equal internal and safe labels are assumed equivalent. Prohibited.
3. **Reverse mapping inferred.** Internal → safe approval is cited as safe → internal authority. Prohibited.
4. **Transitive mapping inferred.** Hard Constraint → Qualification and Qualification → safe are combined without an explicit Hard Constraint → safe edge. Prohibited.
5. **Partial crosswalk activated.** One allowed source entry has no explicit disposition. Prohibited for that governed use.
6. **Catch-all text invented.** Missing coverage is mapped to unapproved `OTHER`, free text or AI-generated explanation. Prohibited.
7. **Incidental order selects primary reason.** File, manifest or crosswalk row order changes the displayed cause or route. Prohibited; `XFR-D-033` governs precedence and only a separately approved semantic same-class order in a future approved versioned reason catalog may select under `XFR-D-040`.
8. **One safe explanation hides causes.** A concise explanation is used to delete underlying causes/evidence. Prohibited.
9. **Safe membership authorizes a row.** An entry is displayed without separately approved field/payload, audience, purpose and localization applicability. Prohibited.
10. **Missing explanation rejects the Match.** Prohibited: only affected explanation/reference use is blocked unless another approved rule says otherwise.
11. **Translation creates meaning.** A locale variant adds a promise, judgment or detail absent from approved content. Prohibited; `XFR-D-079` remains independent.
12. **Carrier becomes content authority.** Data Contract or API field is cited as approval of wording or mapping. Prohibited.
13. **New version rewrites history.** Historical presentations are relabeled under current wording. Prohibited.
14. **Synthetic pass enables production.** Prohibited: evidence is prerequisite, not authorization.

---

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — a later controlled sync may update only the current `SPP-07` qualitative status overlay without adding exact catalog, mapping, wording, localization or audience contents;
- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md`, `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` and `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` — later separately authorized syncs may record only the shared topology while preserving each catalog's authority and `OPEN` contents;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a later overlay may index v1.1 without changing `SPP-07 → XFR-D-077` or canonical counts;
- actual catalogs, crosswalk, wording/localization/audience, evidence, Data Contracts, Policy, manifest and runtime artifacts require separate scoped decisions and approvals.

**No sync is performed by this record. Safe Presentation Policy, Feature Schema, Qualification Policy, Risk Policy, Inventory, Data Contracts, manifests, sibling records, runtime and code remain untouched.**

No future sync may interpret this record as approval of an identifier, code, catalog entry, mapping row, canonical wording, template, locale, audience rule, manifest instance, controlled-artifact registration, Policy, dataset/evidence verdict, production use, carrier, runtime or implementation.

---

## 10. Change control

Any change to Safe Explanation catalog isolation, four-catalog topology, crosswalk-manifest boundary, directed/many-to-many mapping, governed-use exhaustiveness, legal-safety eligibility, no-direct-internal-code-display, affected-use fail-closed behavior, all-cause/precedence preservation, catalog-order non-authority or version/hash/provenance/prospective-supersession discipline requires a new versioned `XFR-D-077` record explicitly superseding this version.

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

1. **Given** canonical identity, **when** this record is indexed later, **then** `SPP-07 → XFR-D-077`, `PRIMARY_STANDALONE`, and counts 102/90 remain unchanged.
2. **Given** versioning, **when** current authority is checked, **then** v1.1 prospectively supersedes v1.0 and historical records remain bound to original versions/hashes.
3. **Given** roles, **when** authority is checked, **then** owner is `PRODUCT + LEGAL`, preserving source-normative broad Safe Presentation authority; approvers are `Chief AI Architect + AI + DEVELOPMENT`; `AI + DEVELOPMENT` has no unilateral approval.
4. **Given** the G5 topology, **when** catalog domains are counted, **then** exactly four independently versioned isolated catalogs and one immutable crosswalk-manifest boundary are present.
5. **Given** any two entries, **when** strings, identifiers or wording match, **then** no identity, alias, equivalence or mapping is inferred.
6. **Given** approved `A → B`, **when** reverse or transitive use is requested, **then** it remains unauthorized without its own explicit approved edge.
7. **Given** cardinality, **when** one-to-many or many-to-one is needed, **then** many-to-many topology is permitted but no actual edge, priority, route or content is approved.
8. **Given** a catalog/crosswalk version proposed for a governed use, **when** coverage is checked, **then** every allowed source entry has an explicit approved disposition for that use.
9. **Given** an internal source entry, **when** external explanation is requested, **then** that source entry, a legally safe Safe Explanation entry and the explicit directed edge must each be separately approved, current, applicable and version/hash/provenance-bound; direct internal-code display is prohibited.
10. **Given** missing/unmapped/unknown/stale/conflicting/incompatible material, **when** an explanation/reference is requested, **then** only that affected use is blocked; no Match failure, rejection, `INELIGIBLE`, route, primary reason, whole-payload block or fallback text is invented.
11. **Given** multiple causes, **when** crosswalk mappings are applied, **then** all causes/evidence remain preserved, `XFR-D-033` precedence and `XFR-D-040` primary-reason authority remain unchanged; incidental file/manifest/crosswalk order has no priority, while the future separately approved semantic same-class catalog order remains `OPEN` under `XFR-D-040`.
12. **Given** wording/localization/audience/carrier questions, **when** this record is applied, **then** `XFR-D-078`, `XFR-D-079`, `XFR-D-080` and `XFR-D-082` remain independent and `OPEN` for exact contents.
13. **Given** exact IDs, codes, members, mappings, order, wording/templates, localization, audience, carrier/API/DB/schema, data/evidence, production, Policy, manifest, runtime or implementation, **when** status is checked, **then** every item remains `OPEN` under its applicable authority.
14. **Given** tests, replay, CI, merge, schema validity, translation quality or synthetic evidence, **when** activation or approval is requested, **then** none approves catalog content, mapping, Policy, production use, runtime, implementation or gate.
15. **Given** this record, **when** authorization scope is checked, **then** no sync occurred and Proposals, Inventory, Data Contracts, manifests, sibling records, runtime and code remain untouched.
16. **Given** the governance gates, **when** status is checked, **then** all three remain `BLOCKED`.

---

## 13. Итог

`XFR-D-077 v1.1 PARTIALLY RESOLVED — SAFE EXPLANATION CATALOG REMAINS ISOLATED WITHIN FOUR INDEPENDENT VERSIONED CATALOGS; ONE IMMUTABLE DIRECTED MANY-TO-MANY CROSSWALK-MANIFEST TOPOLOGY, GOVERNED-USE EXHAUSTIVENESS, SEPARATELY APPROVED LEGAL-SAFETY ELIGIBILITY, NO DIRECT INTERNAL-CODE DISPLAY, AFFECTED-USE FAIL-CLOSED, ALL-CAUSE/PRECEDENCE PRESERVATION AND PROSPECTIVE VERSION BINDING APPROVED; ALL EXACT CATALOG, MAPPING, WORDING, LOCALIZATION, AUDIENCE, DATA, POLICY, PRODUCTION, CARRIER, RUNTIME AND IMPLEMENTATION CONTENT REMAINS OPEN/BLOCKED`
