# LeaseMind Matching Decision Record — XFR-D-056

**Decision ID:** `XFR-D-056`

**Версия:** 1.0

**Дата решения:** 2026-09-03

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-09-03 working session.

**Repository baseline reviewed:** `ddba6b3ba6311978881fe7e2d1224ae68a1dd40a`.

**Canonical source key:** `MRP-13 → XFR-D-056`, `PRIMARY_STANDALONE` — “Duplication-detection mechanism owner/authority”.

**Governance owner:** `DEVELOPMENT + AI` — human-approved decision-specific assignment preserving the candidate in `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13 row 13. The source does not assign this owner directly.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate mechanisms and evidence and checks technical feasibility, but has no unilateral authority to approve duplicate semantics, confirmation authority, Risk/Hard Constraint/Qualification consequences, Policy, schema, runtime or implementation.

**Preserved authorities:** artifact owner `MATCHING_RISK_POLICY` remains `Chief AI Architect + LEGAL`; artifact owner `MATCHING_QUALIFICATION_POLICY` remains `Chief AI Architect + PRODUCT`; Identity/Authority Registry remains the sole writer of its source-owned identity/authority facts; Legal/Decision Service remains the sole writer of motivated reviewer decisions; exact Risk→routing threshold `XFR-D-M2` remains owned by `AI + LEGAL`. This record transfers, merges or widens none of those authorities.

**Depends on:** `XFR-D-032 v1.0`, `XFR-D-033 v1.0`, `XFR-D-040 v1.0`, `XFR-D-048 v1.0`, `XFR-D-052 v1.0`, `XFR-D-055 v1.0`, `XFR-D-067 v1.0` and `XFR-D-071 v1.0` remain independently applicable and are not reopened or superseded. `XFR-D-010`, `XFR-D-M2` and all exact contents listed in §5 remain independently `OPEN`.

---

## 1. Вопрос

Какая governance/authority boundary применяется к будущему duplication-detection mechanism для Risk category 4, пока источники не определяют entity taxonomy, evidence sufficiency, exact detection/confirmation mechanism, appointed authority, runtime carrier или последствия?

---

## 2. Source and status discipline

### 2.1. Source-normative facts

1. Architecture §17 содержит source-normative Risk category “дублирование сущностей”, но не определяет механизм обнаружения, unit of identity, подтверждающую authority или последствия.
2. Architecture §25.1 содержит внутреннюю алгоритмическую reason string `DUPLICATE_ENTITY_CONFIRMED`. Наличие строки в reason family не доказывает duplicate fact и не задаёт алгоритм, threshold, evidence rule, mapping, route, merge или rejection.
3. Architecture §13 требует проверять provenance, integrity, freshness, correspondence of person/object, authority, consistency and human-review need; один непроверенный источник или предположение не создаёт негативный вывод о стороне.
4. Architecture §32 требует, чтобы missing data не считались negative, conflicting source versions сохранялись, а stale state не использовался как current actionable evidence.
5. Architecture §33 требует сохранять source/evidence statuses, unknowns, conflicts, reasons, versions and input/result hashes for reproducibility.
6. Architecture §40 устанавливает single-writer boundary: source facts исправляются новым событием их owner'а, а не consumer projection. Identity/Authority Registry владеет identity/authority facts; Legal/Decision Service владеет motivated reviewer decisions.
7. Risk Policy §5 category 4 оставляет detection mechanism, owner, human confirmation and freshness `OPEN`; structural identifier/attribute match and possible-duplicate flag названы candidates, а не approved rules.
8. Risk Policy §13 row 13 содержит только candidate owner assignment `DEVELOPMENT + AI` and explicitly states that the source does not name the owner directly.
9. Feature Schema does not approve a duplication-specific feature set or detection mechanism. Raw direct identifiers are outside its scoring registry.
10. Data Contracts contains event/inbox/idempotency duplicate controls and Identity/Authority projections, but no approved entity-duplication mechanism or carrier. Event replay/deduplication is not entity resolution.

### 2.2. Human-approved boundary in this record

This record approves only:

- the decision-specific governance/approver/evidence role split;
- advisory-only status of a possible-duplicate candidate;
- source-authority and immutable-history preservation;
- fail-closed handling for duplicate-dependent action;
- prohibitions on automatic merge, discard, rejection and cross-entity transfer;
- evidence-is-prerequisite-not-authorization discipline.

It does not approve the Risk Policy, duplication mechanism, dataset, evidence verdict, entity-resolution operation, runtime carrier or implementation.

---

## 3. Решение

### 3.1. Role and authority boundary

1. Governance owner is `DEVELOPMENT + AI`.
2. Mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`.
3. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral approval.
4. This assignment is decision-specific. It does not make `DEVELOPMENT` or `AI` the source of identity facts, the writer of legal decisions, the owner of Risk or Qualification artifact semantics, or the final authority for a future duplicate-confirmation case.
5. The exact confirming authority, named appointment, RBAC role, quorum, separation of duties and appeal/escalation process remain `OPEN` and require a separate approved decision.

### 3.2. Possible duplicate is advisory only

1. A possible-duplicate signal is only an advisory candidate for future separately approved processing.
2. It is not by itself:
   - a confirmed duplicate;
   - an identity or authority fact;
   - a Risk conclusion or approved Risk component;
   - a Hard Constraint result;
   - a Qualification result or route;
   - a legal/reviewer outcome;
   - a user-facing reason or explanation.
3. Similar or equal identifier, contact detail, address, device attribute, account attribute, string, normalized value, fuzzy match, AI/model output, event replay or transport duplicate does not by itself prove that two records refer to one entity.
4. The literal reason string `DUPLICATE_ENTITY_CONFIRMED` does not itself create confirmation, eligibility for that reason, mapping or downstream authority.

### 3.3. Future confirmation prerequisites

A future confirmed-duplicate result may be used only when all independently applicable prerequisites have been separately approved and satisfied:

1. an exact versioned/hash-bound mechanism and scope;
2. an approved entity taxonomy and comparison unit;
3. eligible, lawful, source-authoritative evidence with complete provenance and freshness;
4. an approved evidence-sufficiency and conflict-handling procedure;
5. a separately appointed authority acting within approved RBAC, scope and review procedure;
6. an immutable decision/evidence record bound to the exact mechanism, source versions and evaluated records;
7. any separately required Risk, Hard Constraint, Qualification, reason-mapping, presentation and runtime approvals.

Technical feasibility, a high confidence score, schema validation, similarity, successful replay, CI or synthetic test does not substitute for any prerequisite.

### 3.4. Fail-closed duplicate-dependent action

1. Missing, unknown, incomplete, ambiguous, conflicting, stale, invalidated, source-incompatible, version-incompatible, hash-incompatible or scope-incompatible evidence does not become “not a duplicate”, “confirmed duplicate” or a negative fact.
2. Such a state blocks only the duplicate-dependent action being considered until separately approved evidence and authority resolve it. It does not suspend or restrict general party/account access, participation or unrelated actions.
3. Both records, their distinct identifiers, versions, source provenance, evidence and history remain preserved.
4. Exact route, blocked unit, review queue, retry behavior and cascade granularity remain `OPEN`; this record does not invent `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED`, `REJECTED_BY_MATCHING`, `INELIGIBLE` or any new state as an automatic outcome.
5. Conflict is not silently collapsed into missing/unknown, and one source version is not selected by consumer preference.

### 3.5. No automatic identity or lifecycle mutation

No possible-duplicate signal, candidate mechanism or future detector output may automatically:

1. merge, link, unlink or split entities or records;
2. choose a canonical survivor or master record;
3. delete, discard, suppress, overwrite or relabel a record or its history;
4. reject a party, Property, TenantRequest, Campaign, Match or Qualification hypothesis;
5. produce `INELIGIBLE`, a Qualification route, a sanction or a legal conclusion;
6. suspend, restrict or limit a party, account, access, participation or unrelated service capability;
7. change identity/authority, consent/lawful-basis or reviewer-decision source records;
8. mutate an approved policy, reason catalog, mapping, dataset, manifest or runtime rule.

Any future merge/link/split/correction operation and its authority require separate evidence-backed approval and source-owner-compatible change control.

Architecture §31 remains controlling for access limitation: Matching Engine does not perform access restriction; the decision belongs to an authorized employee under approved policy and must remain appealable. A possible-duplicate signal or unresolved duplicate evidence cannot bypass that authority or procedure.

### 3.6. No cross-entity transfer

Suspected similarity, possible duplicate or even a separately confirmed relationship does not by itself authorize transfer, inheritance, union or propagation between entities of:

- identity/authority facts;
- evidence, evidence status or provenance;
- user statements, consent or lawful basis;
- requirements, preferences or protected/proxy attributes;
- Hard Constraint, Score, Confidence, Risk or Qualification results;
- reason references, routes, rejections or sanctions;
- reviewer/legal decisions;
- previous-contact, related-person or circumvention outcomes;
- presentation permissions, protection terms or disclosure state;
- payment, fiscal, credit, refund or payer facts.

Exact lawful cross-record linkage or transfer rules, if any, remain `OPEN` and require separate source-owner and legal approval.

### 3.7. Source authority and immutable history

1. The future mechanism may consume only approved read-only source projections and evidence references; it does not correct source facts itself.
2. Identity/Authority Registry remains the sole writer of its identity/authority domain. This record does not declare that Registry to be the duplicate-confirmation or merge authority.
3. Legal/Decision Service remains the sole writer of motivated reviewer decisions. A technical signal does not become a motivated decision.
4. Matching Engine remains the writer of its Match calculation only; it does not become the writer of external identity, consent, legal, payment or reviewer facts.
5. Corrections and later evidence create new source-owned versions/events and preserve prior history. Existing calculations and decisions are not rewritten retroactively.
6. `XFR-D-071` post-freeze correction lineage and event replay/idempotency remain distinct from entity-duplication governance.

### 3.8. Non-compensation and no automatic policy change

1. High Match/Confidence/Priority, benign evidence, absence of another Risk flag, successful schema/DLP/replay/CI or business urgency cannot compensate for missing duplicate evidence or confirmation authority.
2. A possible-duplicate signal cannot compensate for missing lawful basis, identity/authority evidence, Hard Constraint evidence or Qualification prerequisites.
3. `XFR-D-048` non-compensation applies to a duplicate Risk component only after that component has been independently classified critical under separately approved rules. This record does not classify or promote a possible or confirmed duplicate as critical.
4. Synthetic-only evidence does not create a production mechanism, production threshold, production-safe entity decision or production-readiness claim; the generic Architecture §§36/50 synthetic-only/production boundary remains controlling.
5. Evaluation, feedback, correction or model output cannot automatically change the mechanism, policy, mappings, runtime or production rules.

---

## 4. Layer boundaries and non-conflations

| Layer | Authority | Approved here | Remains `OPEN` |
| --- | --- | --- | --- |
| Duplication mechanism governance | `DEVELOPMENT + AI`, with mandatory approvers | Roles and conservative boundary only | Exact mechanism and operational authority |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Candidate preparation, feasibility and evidence support | Actual evidence package, sufficiency and verdict |
| Risk Policy semantics | `Chief AI Architect + LEGAL` | No policy content approved | Category mapping, factor semantics, artifact approval |
| Qualification Policy semantics | `Chief AI Architect + PRODUCT` | Existing boundaries preserved | Exact route/trigger/mapping |
| Identity/authority facts | Identity/Authority Registry | Single-writer preservation | Whether/how duplicate adjudication interacts with Registry |
| Motivated reviewer decisions | Legal/Decision Service | Single-writer preservation | Confirming role, appointment, quorum, Decision Record schema |
| Dataset-use governance | `XFR-D-067` authority model | No dataset/use approval | Named authority, RBAC and actual approval |
| Runtime/Data Contracts | controlled artifact authorities | No carrier or schema approved | All representation and implementation |

Explicit non-conflations:

1. entity duplication ≠ duplicate event delivery, replay or idempotency;
2. possible duplicate ≠ confirmed duplicate;
3. `DUPLICATE_ENTITY_CONFIRMED` string ≠ proof, algorithm or authorization;
4. duplicate detection ≠ Identity/Authority Registry source fact;
5. duplicate detection ≠ entity merge, master-data management or record deletion;
6. duplicate evidence ≠ Hard Constraint catalog `XFR-D-010`;
7. duplicate signal ≠ Eligibility→Qualification mapping `XFR-D-032`;
8. duplicate signal ≠ fail-closed precedence `XFR-D-033` or multi-cause/primary-reason rule `XFR-D-040`;
9. duplicate signal ≠ Risk aggregation/non-compensation `XFR-D-048`;
10. duplicate signal ≠ Risk reason-reference namespace `XFR-D-052`;
11. duplicate signal ≠ Risk→Qualification interface `XFR-D-055` or numeric trigger `XFR-D-M2`;
12. duplication governance ≠ Data Governance dataset-use authority `XFR-D-067`;
13. entity duplication ≠ post-freeze correction/replay lineage `XFR-D-071`;
14. internal duplicate reason ≠ legal/reviewer outcome or user-facing explanation.

---

## 5. Что остаётся `OPEN`

All exact contents remain `OPEN`, including:

- entity taxonomy and comparison unit: party, person, organization, representative, Property, TenantRequest, Campaign, profile, Match or another entity;
- identity keys, canonical identifiers, source catalog and lawful source set;
- exact fields/features, normalization, tokenization, blocking, deterministic, fuzzy, probabilistic, graph, heuristic, ML or hybrid algorithm;
- similarity formula, threshold, confidence, bands, tolerance, weights, aggregation, tie-breaks and uncertainty treatment;
- exact meaning and eligibility of `DUPLICATE_ENTITY_CONFIRMED` and any possible-duplicate/reference/status value;
- evidence eligibility, sufficiency, provenance package, freshness and conflict resolution;
- false-positive/false-negative targets, metrics, dataset, split, evaluation method, acceptance criteria and production evidence;
- confirming/adjudicating authority, named appointment, RBAC, quorum, four-eyes rule, conflict-of-interest check, appeal and escalation;
- exact fail-closed route, blocked unit, queue, retry, timeout, cascade and remediation;
- link/merge/unlink/split/unmerge/correction lifecycle, canonical-survivor selection and source-owner coordination;
- cross-entity linkage and transfer rules;
- versioning, hash composition, compatibility, migration, supersession, TTL and invalidation;
- Risk category/factor mapping, aggregation, criticality and reason-reference integration;
- Hard Constraint reason catalog `XFR-D-010`;
- Eligibility/Qualification route, precedence, primary reason and exact Risk→Qualification trigger/mapping;
- schema, carrier, API, database, event, topic, queue, index, graph/vector store and serialization;
- security, access, signing, encryption, retention, deletion, audit, telemetry and incident handling;
- actual Feature Schema, Risk Policy, Qualification Policy, Evaluation Plan, Data Contracts and Controlled Artifact Manifest approval;
- real or synthetic dataset approval, evaluation run, production-data use, rollout, runtime and implementation.

None of these contents may be introduced by Policy sync, schema default, implementation, CI, commit, merge or manifest entry without its own approved evidence-backed decision.

---

## 6. Rationale

The repository needs a clear owner-review boundary because Architecture names entity duplication as a Risk category and exposes an internal confirmed-duplicate reason, while deliberately leaving detection, confirmation and consequences unspecified. Without a narrow record, implementers could mistake identifier similarity, event deduplication or the reason string itself for entity truth and silently merge histories or propagate adverse outcomes.

The approved role split allows controlled technical and evidence preparation. The conservative invariants preserve source authority, distinct records and immutable history until exact evidence and an independently appointed authority exist. Keeping the mechanism and all consequences `OPEN` prevents a governance record from becoming a hidden entity-resolution implementation or rejection policy.

---

## 7. Adversarial cases

1. **Shared phone/email.** Two parties share or reuse a contact value and are auto-merged. Prohibited: equality is not proof; both records remain distinct.
2. **Similar names.** Normalized/fuzzy similarity selects a canonical survivor. Prohibited: taxonomy, fields, normalization and algorithm remain `OPEN`.
3. **Shared address.** Co-location is treated as proof of one entity. Prohibited: address equality is not identity evidence by itself.
4. **Shared device or network.** Device/IP-like evidence is used to label related persons or circumvention. Prohibited: possible duplicate is not a legal or related-person outcome, and protected/proxy rules remain applicable.
5. **AI confirmation.** Model confidence is treated as human confirmation. Prohibited: AI output is advisory and cannot appoint or replace authority.
6. **Reason-string circularity.** `DUPLICATE_ENTITY_CONFIRMED` is present in a catalog, so a duplicate is considered proven. Prohibited: the string is not evidence or authorization.
7. **Event replay conflation.** Duplicate inbox delivery is interpreted as duplicate entity. Prohibited: transport idempotency is a different domain.
8. **Automatic rejection.** Possible duplicate directly creates `INELIGIBLE` or `REJECTED_BY_MATCHING`. Prohibited: exact route remains `OPEN`; `XFR-D-032`/`XFR-D-033`/`XFR-D-055` are preserved.
9. **Cross-entity contamination.** One record's Risk, rejection, previous contact, consent, payment or legal outcome is copied to another. Prohibited: no cross-entity transfer authority exists.
10. **Conflict erased.** Conflicting sources are collapsed into one “master” record. Prohibited: versions and histories remain preserved.
11. **Unapproved reviewer.** Operator confirms or merges entities without appointment/RBAC. Prohibited: exact authority and procedure remain `OPEN`.
12. **Benign-score compensation.** High Match/Confidence allows duplicate-dependent action despite unresolved evidence. Prohibited by non-compensation.
13. **Synthetic threshold promotion.** A synthetic benchmark becomes a production similarity threshold. Prohibited: evidence is prerequisite, not authorization.
14. **Policy sync smuggling.** Later Risk Policy sync adds fields, codes, algorithm or merge behavior. Prohibited: sync may record only this partial boundary.

---

## 8. Future sync scope

After this record is committed and merged, a separate controlled sync may update only:

- `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` — category 4, §13 row 13, readiness/acceptance/DoD with this `PARTIALLY_RESOLVED_BOUNDARY` while preserving all exact contents as `OPEN`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — a new historical-preserving overlay for `MRP-13 → XFR-D-056` plus provenance and temporal/current summaries.

That sync must not modify Feature Schema, Data Contracts, Qualification Policy, reason catalogs, datasets, manifests, schemas or runtime. It must not approve any mechanism or change any gate.

---

## 9. Change control

Changing the governance owner, mandatory approvers, evidence/technical role, advisory-only boundary, source-authority preservation, no-automatic-mutation/no-transfer rules, fail-closed semantics or evidence-prerequisite discipline requires a new versioned `XFR-D-056` record approved by `DEVELOPMENT + AI + Chief AI Architect + PRODUCT + LEGAL`, with an explicit `supersedes` reference.

Any exact mechanism, authority, evidence, taxonomy, algorithm, threshold, consequence, schema, carrier, dataset, runtime or implementation additionally requires its independently applicable owner/approver set and cannot be appended silently to v1.0.

---

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

This record does not approve Risk Policy, Qualification Policy, Feature Schema, Data Contracts, dataset/evaluation, production data, runtime or implementation.

---

## 11. Acceptance criteria

1. **Given** canonical mapping, **when** identity is checked, **then** `MRP-13 → XFR-D-056`, `PRIMARY_STANDALONE`, remains unchanged.
2. **Given** governance roles, **when** authority is checked, **then** owner is `DEVELOPMENT + AI`, mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`, and `AI + DEVELOPMENT` evidence/technical role has no unilateral approval.
3. **Given** a possible-duplicate signal, **when** it is consumed, **then** it is advisory only and creates no confirmed duplicate, identity fact, Risk/Hard Constraint/Qualification result, legal outcome or user-facing explanation.
4. **Given** equal identifiers, contacts, addresses, devices, fuzzy similarity, AI output, event duplication or the string `DUPLICATE_ENTITY_CONFIRMED`, **when** confirmation is requested, **then** none alone proves a duplicate.
5. **Given** future duplicate confirmation, **when** eligibility is checked, **then** an approved version/hash-bound mechanism, eligible source evidence and separately appointed authority are required.
6. **Given** missing, unknown, ambiguous, conflicting, stale or incompatible evidence, **when** duplicate-dependent action is requested, **then** it fails closed without an invented negative/positive fact or route, both records/histories remain preserved, and general party/account access or unrelated activity is not restricted.
7. **Given** a possible or confirmed duplicate relationship, **when** record mutation or access action is requested, **then** no automatic merge/link/unlink/split/delete/discard/canonical-survivor selection or party/account/access suspension, restriction or limitation is authorized; Architecture §31 employee authority and appeal remain unchanged.
8. **Given** two records, **when** cross-entity propagation is requested, **then** facts, evidence, consent, requirements, outcomes, contact/protection/payment state and decisions are not transferred without separate authority.
9. **Given** Identity/Authority Registry and Legal/Decision Service, **when** writers are checked, **then** their source and motivated-decision authority remains unchanged.
10. **Given** Risk and Qualification, **when** routing is requested, **then** `XFR-D-032`/`XFR-D-033`/`XFR-D-040`/`XFR-D-048`/`XFR-D-052`/`XFR-D-055`/`XFR-D-M2` remain independent and no route is invented.
11. **Given** event replay/idempotency or `XFR-D-071` correction lineage, **when** entity duplication is evaluated, **then** those concepts do not substitute for entity identity evidence.
12. **Given** Data Governance authority `XFR-D-067`, **when** duplicate confirmation is requested, **then** dataset-use approval is not treated as entity-resolution authority.
13. **Given** high Match/Confidence/Priority, benign evidence, DLP/schema/CI success or business urgency, **when** a duplicate prerequisite is unresolved, **then** none compensates for it; `XFR-D-048` applies only after independent critical classification and does not make a possible or confirmed duplicate critical.
14. **Given** synthetic-only evidence, **when** production use is requested, **then** no production mechanism, threshold or readiness claim is created.
15. **Given** an exact taxonomy, key, field, algorithm, threshold, confidence, evidence rule, reviewer procedure, merge/split lifecycle, schema, carrier, dataset, runtime or implementation, **when** approval is checked, **then** it remains `OPEN`.
16. **Given** the target file set, **when** this pass is reviewed, **then** only this decision record was created; Risk Policy and Inventory were not synced.
17. **Given** the three governance gates, **when** their status is checked, **then** all remain `BLOCKED`.

---

## 12. Итог

`XFR-D-056 PARTIALLY RESOLVED — DUPLICATION-DETECTION GOVERNANCE, ADVISORY-ONLY, SOURCE-AUTHORITY, FAIL-CLOSED, NO-AUTOMATIC-MUTATION AND NO-CROSS-ENTITY-TRANSFER BOUNDARY APPROVED; EXACT ENTITY TAXONOMY, KEYS, ALGORITHM, THRESHOLDS, EVIDENCE, CONFIRMING AUTHORITY, ROUTING, MERGE/SPLIT, SCHEMA, DATA, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
