# LeaseMind Matching Decision Record — XFR-D-071

**Decision ID:** `XFR-D-071`

**Версия:** 1.0

**Дата решения:** 2026-08-29

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-08-29 working session

**Repository baseline:** `46f8fe720e6fb4af068231ee225e79cdf604c838`

**Governance owner:** `AI + DEVELOPMENT`

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence discovery, impact analysis, notification preparation or candidate disposition does not replace governance approval of the future exact procedure by the full owner/approver set and does not assign a per-run disposition quorum.

**Depends on:** `CAMPAIGN_OUTCOMES.md` §§7–9 and `CO-C-016`/`CO-C-026`/`CO-C-027`/`CO-C-030` define accepted immutable correction lineage and distinguish it from rejected/no-op commands and replay. Evaluation Plan §§4.2, 5.3–5.5, 8.1–8.2, 10 and §11 row 17 define the candidate frozen-run context. `XFR-D-059 v1.1`, `XFR-D-060 v1.0`, `XFR-D-066 v1.0`, `XFR-D-067 v1.0` and `XFR-D-070 v1.0` remain independently applicable and are not replaced by this record.

---

## 1. Вопрос

Какова governance/evidence boundary процесса, которым принятая outcome correction синхронизируется с уже `FROZEN`, `EXECUTED` или `REVIEWED` evaluation run, чтобы исторический run не переписывался, затронутое evidence не продолжало использоваться молча, а exact notification/runtime mechanism не был выдан за уже утверждённый?

## 2. Source/status discipline

`CAMPAIGN_OUTCOMES.md` §7 является `SOURCE_NORMATIVE` для PRODUCT-семантики correction:

- correction создаёт новую immutable outcome-запись и оставляет исправленную запись historical/superseded;
- correction ссылается только на текущую effective запись;
- rejected/no-op command не создаёт correction record;
- replay старого idempotency key возвращает исторически связанную запись и не меняет current effective outcome.

`XFR-D-060 v1.0` human-approved выбирает conservative option B: Campaign с принятой correction до нового freeze исключается из outcome-derived ground-truth inclusion, а frozen historical run после correction не переписывается. Exact post-freeze notification/impact-review synchronization он оставляет под `XFR-D-071`.

Evaluation Plan §§8–10 описывает `PLANNED → FROZEN → EXECUTED → REVIEWED`, freeze-time manifest, post-execution evidence record и `EVALUATION_RUN_REJECTED` как document-level `DECISION_CANDIDATE_FOR_REVIEW`, не как утверждённый runtime/API enum. Этот record использует эти термины только для governance-связи с текущим Proposal и не превращает их в runtime contract.

Architecture §30.3 требует controlled cross-functional platform release и запрещает автоматические продуктивные изменения. Architecture §49 сохраняет reproducibility evidence, а §52 требует version/hash/approval provenance controlled artifacts. Эти источники не задают exact correction-notification carrier, SLA, event schema или automated disposition.

Этот record разрешает только qualitative governance/evidence boundary ниже.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `AI + DEVELOPMENT`.** Совместно владеет completeness процесса discovery, impact review и versioned evidence linkage.
2. **Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.** Chief AI Architect проверяет architecture/reproducibility boundary; PRODUCT — outcome/claim meaning; LEGAL — data-use, retention, rights and lawful-use impact where applicable.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Может подготовить impacted-run set, lineage proof и candidate disposition, но не получает unilateral approval authority.
4. Data Governance authority по `XFR-D-067` остаётся отдельной: authority model не заменяет named appointment/RBAC и не делает Data Governance автоматическим approver этого decision record.
5. Outcome operator, dataset/model author, technical writer, Git author, CI, service, alert или AI output не могут единолично объявить run unaffected, valid, withdrawn, superseded или approved.

### 3.2. Trigger boundary

1. Trigger существует только при доказанной **принятой immutable correction record** по `CAMPAIGN_OUTCOMES.md` §7.
2. Correction command, которая rejected, конфликтна, no-op, не создала immutable record или только replayed прежний idempotency result, не является принятой correction и сама по себе не запускает impact disposition.
3. Missing, incomplete, ambiguous или conflicting correction/source-history evidence не трактуется как «correction отсутствует» или «run unaffected»; current applicability claim блокируется fail closed до разрешения evidence gap.
4. Client notification, queue delivery, timestamp observation, model inference или heuristic similarity не являются источником факта correction. Source-authoritative immutable lineage обязательна.
5. Correction, принятая до freeze нового run, остаётся в scope `XFR-D-060 v1.0`. `XFR-D-071` применяется, когда затрагиваемый run уже достиг `FROZEN` или более поздней document-level стадии.

### 3.3. Impacted-run discovery

После принятой post-freeze correction evidence-процедура обязана:

1. сохранить ссылку на новую correction record и исправленную historical/superseded record;
2. использовать source-authoritative Campaign/outcome aggregate identity и closed canonical lineage `XFR-D-059 v1.1`, а не raw text, address similarity, embeddings, AI/model output или heuristic proxy;
3. найти каждый frozen manifest/run, который прямо или через доказанную connected-component/source lineage включал Campaign, outcome record, outcome-derived label или зависимый evaluation component;
4. проверить не только строку dataset, но и metric denominator, grouping/split membership, correction policy version, comparison lineage и claims/reviews, которые ссылались на run;
5. сформировать полный impacted-run candidate set до human disposition; отсутствие известной прямой ссылки не доказывает unaffected state при неполной lineage;
6. не удалять canonical edges, не разрывать historical component и не создавать искусственную независимость оставшихся records.

Exact query, index, graph representation, detector, identity-control implementation и runtime carrier остаются `OPEN`.

### 3.4. Immutable history and append-only impact evidence

1. Freeze-time manifest, dataset snapshot, post-execution results, reviewer evidence, hashes, timestamps и достигнутая historical lifecycle stage не переписываются и не удаляются.
2. Correction создаёт отдельное append-only impact evidence с immutable references на correction lineage и каждый reviewed run; оно не редактирует correction record или run artifacts задним числом.
3. Historical fact «этот run был `EXECUTED`/`REVIEWED` на прежнем frozen input» сохраняется. Он не превращается автоматически в fact «evidence остаётся current/applicable после correction».
4. Supersession нового evaluation cycle не уничтожает и не переименовывает прежний run. Старые и новые evidence packages остаются различимыми по version/hash/lineage.
5. Correction не превращает historical label в negative, failed, `unknown`, `abstention`, `DISPUTED`, `INCONCLUSIVE`, Qualification status или новый runtime token.

### 3.5. Stage-specific qualitative handling

1. **`FROZEN`, но не `EXECUTED`.** Затронутый run не мутируется и не используется для дальнейшего current evidence claim. Если evaluation всё ещё требуется, создаётся новый versioned run/freeze с применением `XFR-D-060 v1.0`; прежний frozen package сохраняется как historical evidence.
2. **`EXECUTED`, но не `REVIEWED`.** Results сохраняются, но affected или unresolved evidence не продвигается как current reviewed claim. Требуется human impact disposition и, когда correction затрагивает outcome-derived evidence, новый versioned cycle.
3. **`REVIEWED`.** Historical review сохраняется, но run не может молча переиспользоваться для нового или возобновлённого metric, threshold, policy, fairness, release, production-readiness или gate claim. Current applicability требует impact disposition; affected impact требует нового versioned cycle before reuse, а unresolved impact остаётся заблокированным до разрешения и сам по себе не разрешает ни reuse, ни новый claim.
4. Этот record не отменяет автоматически уже совершённое историческое human decision, policy release или legal determination. Их withdrawal, rollback, remediation, notification recipients and timing требуют отдельной applicable authority/procedure.
5. Этот record не вводит новый lifecycle stage и не назначает автоматически `EVALUATION_RUN_REJECTED`; точная связь impact disposition с candidate lifecycle/evidence verdict остаётся `OPEN`.

### 3.6. Human impact disposition

Human review различает три governance meanings, не runtime enums:

- **affected** — correction/source-lineage evidence может изменить eligibility, composition, label meaning, metric/denominator, comparison or claim;
- **demonstrably unaffected** — complete source-authoritative lineage and frozen evidence prove that correction cannot affect the named run/claim;
- **unresolved** — evidence insufficient, ambiguous, conflicting or incomplete.

Rules:

1. `demonstrably unaffected` требует positive proof for the named run and named claim; отсутствие найденного effect или notification не является proof.
2. `unresolved` fails closed for current/future reuse and не является `unknown` label по `XFR-D-069`, negative outcome или evaluator abstention.
3. Aggregate success, другой run, соседняя metric family или unaffected segment не компенсируют affected/unresolved evidence.
4. AI/model output, detector score или CI result может быть evidence input, но не final disposition.
5. Affected/unresolved evidence не создаёт автоматический rollback, model/policy/routing change, user-facing claim, incident class или gate transition.
6. Exact per-run reviewer quorum, named appointments, RBAC, conflict-of-interest check, appeal/escalation path and signed-disposition carrier remain `OPEN`. Evidence preparation does not approve that future exact procedure, а governance owner/approvers этого record не назначаются автоматически per-run disposition quorum.

### 3.7. Minimum evidence categories

Candidate impact package должен содержать как минимум categories:

1. immutable correction record reference, corrected record reference, Campaign/source aggregate identity and acceptance provenance;
2. correction/source-history completeness and lineage evidence, including all known supersession/correction links;
3. impacted-run discovery scope, search/version boundary and explicit list of found, excluded and unresolved run candidates;
4. each run ID, freeze-time manifest version/hash, dataset snapshot/hash, correction policy version and component membership evidence;
5. reached historical stage and immutable result/reviewer references where applicable;
6. claim-impact analysis across eligibility, labels, composition, split/grouping, metric/denominator, comparison, segment/fairness and policy/release/gate uses where applicable;
7. candidate human disposition with rationale, limitations, adverse/ambiguous evidence and non-compensation statement;
8. new versioned run/freeze reference when reevaluation is required, without replacing historical hashes;
9. explicit synthetic-only versus future production-data applicability and data-authority/privacy limitations;
10. reviewer/approval references and any open notification/remediation/runtime dependencies.

These categories do not approve exact fields/schema, transport, SLA, recipient matrix, query/detection implementation, disposition enum, dataset, run or policy value. Missing category blocks disposition fail closed.

### 3.8. Notification boundary

1. Evidence of a correction and evidence of successful notification are separate facts.
2. Delivery failure, delayed delivery or missing acknowledgement never means unaffected/no action required.
3. Notification content must reference immutable correction/run evidence without copying prohibited raw evidence, direct identifiers or protected values into an unapproved channel.
4. Exact producer/consumer, event/API/DB schema, recipient roles, queue/topic, retry/idempotency, acknowledgement, latency/SLA, retention, escalation and incident mapping remain `OPEN`.
5. No exact event name, API field, DB column, status enum or safe error code is created by this record.

### 3.9. Independent boundaries remain independent

`XFR-D-071` does not determine or change:

- label eligibility/adjudication or grouping (`XFR-D-057`–`XFR-D-059`);
- pre-freeze conservative correction exclusion (`XFR-D-060`);
- false-exclusion maximum, dataset size/allocation, metric targets or segment coverage (`XFR-D-061`–`XFR-D-064`);
- production drift policy/operational artifact (`XFR-D-065`);
- actual Evaluation Plan approval/record/manifest entry (`XFR-D-066`);
- named Data Governance appointment/RBAC or production-data authority (`XFR-D-067`);
- fairness/legal doctrine or protected/proxy classification (`XFR-D-068`);
- `unknown`/`abstention` runtime behavior (`XFR-D-069`);
- exact/numeric statistics and threshold-search method (`XFR-D-070`);
- Scoring/Risk/Qualification Policy values, ranking/diversification, monitoring/SLO, incident/rollback policy, model release, runtime or implementation.

### 3.10. Partial, never fully resolved

`XFR-D-071` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, accepted-correction trigger, source-authoritative impacted-run discovery, immutable-history/append-only evidence, stage-specific no-silent-reuse, human impact meanings, minimum evidence categories and notification non-conflation разрешены qualitatively.

Exact notification/impact-review workflow remains `OPEN`: schemas/carriers, queries/detectors, reviewer quorum/appointments/RBAC, disposition representation, SLA/recipients/acknowledgement/retry/escalation, lifecycle/verdict mapping, claim withdrawal/remediation/rollback procedure, production-data use and implementation.

Future resolution requires a new versioned `XFR-D-071` record with `supersedes`. Open contents cannot be introduced through silent Evaluation Plan sync, code/config default, event name, database migration, implementation convention or post-hoc reviewer choice.

## 4. Layer/boundary

| Слой | Authority | Что разрешено этим record | Что остаётся `OPEN` |
|---|---|---|---|
| Outcome correction facts | `CAMPAIGN_OUTCOMES.md` §§7–9 | Не изменены; accepted immutable record is trigger | Product/runtime implementation outside this decision |
| Pre-freeze exclusion | `XFR-D-060 v1.0` | Не изменено | Quantitative selection-bias evidence and carrier |
| Post-freeze governance | `AI + DEVELOPMENT`; approvers `Chief AI Architect + PRODUCT + LEGAL` | Roles, discovery/evidence/no-silent-reuse boundary | Actual signed execution and exact procedure |
| Historical run evidence | Frozen manifest/result/review hashes | Immutable, append-only linked impact evidence | Exact impact-record schema/carrier |
| Human disposition | Future approved reviewer/authority procedure; governance boundary owned by `AI + DEVELOPMENT` with mandatory approvers `Chief AI Architect + PRODUCT + LEGAL` | Qualitative affected/unaffected/unresolved meanings | Per-run quorum, appointment/RBAC, representation and SLA |
| New evaluation cycle | Evaluation Plan + applicable dependencies | Required for affected/unresolved reuse | Actual dataset/manifest/run/approval |
| Notification/runtime | Separate downstream design | Evidence ≠ notification; failure ≠ unaffected | Events/APIs/DB, recipients, retry, acknowledgement, monitoring |
| Policy/release/gates | Architecture §30.3/§52 and separate artifacts | No automatic effect | All independent approvals remain blocked |

## 5. Что остаётся `OPEN`

- exact impacted-run query/detection algorithm, source-history identity controls and completeness proof implementation;
- exact impact-record, notification, disposition and supersession schema/carrier;
- runtime event/API/DB/configuration names and fields;
- reviewer quorum, named appointments, RBAC, independence/conflict, appeal and escalation procedure;
- notification recipients, timing/SLA, acknowledgement, retry/idempotency, retention and incident classification;
- exact mapping to Evaluation Plan candidate stages or `EVALUATION_RUN_REJECTED` evidence verdict;
- exact claim withdrawal, policy/model release review, remediation and rollback procedure;
- numeric materiality/tolerance/statistical method, if any; no conventional default is implied;
- actual dataset, manifest, run, impact package, results or reevaluation;
- production-data/privacy/data-localization authority and named Data Governance appointment;
- actual Evaluation Plan approval/approval record/Controlled Artifact Manifest entry;
- Scoring/Risk/Qualification Policy values, model release, runtime, monitoring and implementation;
- all governance-gate approvals.

## 6. Rationale

Immutable evaluation evidence is useful only if later corrections do not erase what was actually frozen and reviewed. At the same time, immutability cannot mean that known corrected source evidence remains silently current. Append-only impact evidence and a new versioned cycle preserve both truths: historical provenance stays intact, while prospective claim reuse fails closed until the correction is assessed.

The boundary deliberately does not invent a notification event, SLA or runtime status. Those choices require evidence about operational topology, recipients, privacy, reviewer appointments and failure handling. Separating evidence preparation from approval also prevents the dataset/model author or an automated detector from declaring its own run unaffected.

## 7. Adversarial cases

1. **Edit frozen manifest.** Correction replaces old outcome reference inside the existing manifest. Prohibited: preserve old hash; create linked impact evidence and a new run where required.
2. **Delete obsolete result.** Historical metric artifact is removed because the label changed. Prohibited: evidence remains immutable and explicitly impacted.
3. **No notification means no impact.** Delivery failed, so run is treated unaffected. Prohibited: notification evidence and impact evidence are separate; failure fails closed.
4. **AI says unaffected.** Detector cannot find a link and closes review. Prohibited without complete source-authoritative lineage and human disposition.
5. **Rejected correction triggers churn.** Rejected/no-op command forces reevaluation. Prohibited: only accepted immutable correction record triggers this boundary.
6. **Replay looks like a new correction.** Old idempotency result causes duplicate impact action. Prohibited: replay does not create a new correction fact.
7. **Reviewed means permanently current.** A corrected run is reused for a new threshold/release claim because it was historically `REVIEWED`. Prohibited pending impact disposition; affected impact requires a new cycle, а unresolved impact remains blocked until resolved.
8. **Retroactive gate reversal.** Correction automatically changes a historical approval or gate. Prohibited: separate authority and procedure required.
9. **Aggregate compensation.** Unaffected metric/segment hides affected label/denominator. Prohibited: affected/unresolved evidence is reported separately.
10. **Runtime enum by prose.** `affected`/`demonstrably unaffected`/`unresolved` are added to API/DB without design approval. Prohibited: they are governance meanings only.
11. **Synthetic evidence opens production.** Successful synthetic reevaluation is treated as production-data/readiness approval. Prohibited.
12. **Automatic model/policy action.** Correction or impact finding changes Hard Constraint, weights, routing, model, policy, release or rollback automatically. Prohibited.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §§4.2/5.3–5.5/8/10, §11 row 17 and readiness summary receive this qualitative boundary without runtime schema, SLA or actual run approval;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay for `EP-17 → XFR-D-071`, without crosswalk/count or historical Wave rewrite;
- future notification/impact-review, dataset/run, operational and runtime artifacts — separate downstream decisions.

No future sync may interpret this record as an approved Evaluation Plan, dataset, impact package, production-data use, exact lifecycle/verdict mapping, notification mechanism, policy/model release, runtime design or implementation authorization.

## 9. Change control

Changing governance owner, mandatory approvers, accepted-correction trigger, source-authoritative discovery, immutable-history/no-silent-reuse boundary, human impact meanings, evidence categories or notification non-conflation requires a new versioned `XFR-D-071` record approved by `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`, with a `supersedes` reference to this version.

Exact operational contents listed as `OPEN` require their own evidence-backed decision and cannot be appended silently to v1.0.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** a correction command, **when** no accepted immutable correction record exists, **then** no accepted-correction trigger is invented.
2. **Given** accepted post-freeze correction, **when** impacted runs are discovered, **then** source-authoritative correction/aggregate/component lineage is used and missing/ambiguous evidence fails closed.
3. **Given** an impacted `FROZEN`/`EXECUTED`/`REVIEWED` run, **when** synchronization occurs, **then** its manifest/results/reviews/stage/hashes remain immutable and impact evidence is append-only.
4. **Given** historically `REVIEWED` evidence, **when** a new or renewed claim reuses it after correction, **then** reuse is blocked until human impact disposition; affected impact requires a new versioned cycle, а unresolved impact remains blocked until resolved.
5. **Given** human disposition, **when** `demonstrably unaffected` is claimed, **then** complete positive lineage proof exists; absence of detected impact or notification is insufficient.
6. **Given** unresolved impact, **when** labels/status are interpreted, **then** it is not coerced to negative, `unknown`, `abstention`, `DISPUTED`, `INCONCLUSIVE` or Qualification result.
7. **Given** evidence preparation, **when** approval authority is checked, **then** governance owner is `AI + DEVELOPMENT`, mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`, and evidence-procedure owner has no unilateral approval.
8. **Given** correction impact, **when** policy/release/rollback/gate effect is requested, **then** no automatic action or retrospective approval reversal is created.
9. **Given** governance meanings in §3.6, **when** runtime/API/DB representation is requested, **then** no enum/field/event/status is approved by this record.
10. **Given** synthetic-only evidence, **when** production applicability/readiness is claimed, **then** the claim is prohibited.
11. **Given** independent decisions `XFR-D-057`–`XFR-D-070`, **when** this record is applied, **then** none is resolved, weakened or substituted.
12. **Given** this record, **when** Evaluation Plan, dataset/run, production data, policy/model release, notification/runtime implementation and gates are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 12. Итог

`XFR-D-071 POST-FREEZE CORRECTION IMPACT-REVIEW GOVERNANCE BOUNDARY APPROVED — EXACT NOTIFICATION, DISPOSITION, DATASET/RUN, PRODUCTION, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
