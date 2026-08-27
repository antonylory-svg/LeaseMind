# LeaseMind Matching Decision Record — XFR-D-059

**Decision ID:** `XFR-D-059`

**Название:** Evaluation conservative connected-component grouping/isolation policy

**Версия:** 1.1

**Дата решения:** 2026-08-27

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_GROUPING_ISOLATION_BOUNDARY`

**Статус:** `APPROVED CONSERVATIVE CONNECTED-COMPONENT GROUPING/ISOLATION POLICY — SPLIT RATIOS, SEED, DATASET AND IMPLEMENTATION REMAIN OPEN`

**Supersedes:** `LeaseMind_MATCHING_DECISION_XFR-D-059_v1.0.md`

**Decision authority:** human project-governance confirmation in the 2026-08-27 working session

**Repository baseline:** `261a3b111cdd3fefd3e28db18a6dbfaef0c80f7c`

**Scope:** grouping/split-isolation governance semantics only; does not authorize dataset construction, evaluation execution, implementation, runtime/API/DB/schema/event design, production-data use or Proposal approval.

**Governance owner:** `AI + DEVELOPMENT` — сохраняется из `XFR-D-059 v1.0` и Evaluation Plan §11, решение №3.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Depends on:** Campaign correction-history inclusion at freeze остаётся отдельно `OPEN` под `XFR-D-060`; dataset size, split ratios, allocation boundaries, randomization/seed rules остаются отдельно `OPEN` под `XFR-D-062`. Runtime carrier и implementation не утверждаются.

---

## 1. Вопрос

Какая exact governance policy определяет связанность evaluation records и не допускает, чтобы одна логическая identity/lineage chain оказалась в разных tuning/final splits, не изобретая новую runtime-схему и не ослабляя fail-closed boundary `XFR-D-059 v1.0`?

## 2. Source/status discipline

Evaluation Plan §4.1 перечисляет `Property`, `TenantRequest`, Campaign, `match_pair_id`, `encounter_id` и source aggregate revision как кандидатов granularity, но не выбирает ни один из них как достаточный отдельный grouping key. `XFR-D-059 v1.0` утверждает no-valid-split-before-policy, connected-chain isolation, leakage rejection и minimum completeness requirements, но прямо оставляет canonical grouping algorithm `OPEN`.

Architecture §21.3 и §40.1 задают source ownership/versioned projections, а §41.1 — стабильные `match_pair_id`/`encounter_id` relationships; Architecture §49 требует version/hash reproducibility и запрещает переписывать historical result при replay. `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §13 сохраняет revisions и помечает результаты другой revision как stale. `CAMPAIGN_OUTCOMES.md` §7 делает correction новой append-only записью, а не изменением исходной.

Следующая connected-component policy является human-approved governance decision этого record'а. Она не утверждает, что готовый runtime graph, schema, duplicate detector или split allocator уже существует.

## 3. Решение

### 3.1. Graph domain

Для каждого будущего dataset freeze строится versioned conceptual linkage graph над всеми candidate records, рассматриваемыми для этого freeze. Каждый candidate record является node. Edge существует только при наличии source-authoritative, versioned и auditable evidence хотя бы одного разрешённого типа из §3.2.

Raw address, free text, display name, приблизительное сходство, embedding/model score или AI recommendation не являются canonical identity evidence и сами по себе не создают edge.

### 3.2. Разрешённые canonical edges

Два records обязаны находиться в одной связанной группе, если доказано хотя бы одно из условий:

1. они ссылаются на одну source-authoritative canonical identity `Property`;
2. они ссылаются на одну source-authoritative canonical identity `TenantRequest`;
3. они относятся к одной Campaign identity;
4. они имеют один `match_pair_id`;
5. они имеют один `encounter_id`;
6. они относятся к одному source-owned aggregate identity через его versions/revisions (`source_system` + `aggregate_id` либо эквивалентная canonical source reference; revision/version не используется без aggregate identity);
7. между ними существует явная version/revision, correction, supersedes или causal lineage;
8. source/provenance evidence подтверждает, что один record является duplicate или replay другого, включая новый technical ID для того же source-controlled record/result.

Canonical relationships между перечисленными identities также создают edges. В частности, `encounter_id`, связывающий Match из одной или двух Campaigns, и стабильный `match_pair_id` связывают соответствующие records даже при разных calculation versions или разных encounter records одной пары.

Список edge types закрыт. Новая identity/linkage category требует новой versioned policy; она не добавляется эвристически или по runtime convenience.

### 3.3. Canonical connected component

Grouping выполняется как deterministic transitive closure разрешённых edges. Все nodes, достижимые друг из друга по одному или нескольким разрешённым edges, образуют один connected component.

Connected component является атомарной **split-isolation unit**. Он может включать несколько Campaigns, Properties, TenantRequests, pairs, encounters и source revisions. Размер компонента не разрешает разрезать его на части и не создаёт исключение из isolation policy.

Этот record не назначает component как обязательный metric denominator и не меняет смысл business entities. Он определяет только неделимую grouping boundary для split isolation.

### 3.4. Split assignment

1. Все records одного connected component назначаются ровно в один split.
2. Per-record assignment внутри component запрещён.
3. Assignment выполняется на component level только по будущей approved `XFR-D-062` allocation policy; ratios, seed и allocation boundaries не выводятся из этого record'а.
4. Пока `XFR-D-062` и полный freeze-time manifest не утверждены, наличие resolved grouping policy само по себе не делает split валидным и не переводит run в `FROZEN`.
5. Любой component, найденный одновременно в tuning и final evaluation, приводит к `EVALUATION_RUN_REJECTED`.
6. Final evaluation data не используется для threshold/model/policy selection, который затем проверяется на том же final split.

### 3.5. Versions, corrections, duplicates и replay

Versions/revisions одного source aggregate находятся в одном component независимо от времени их создания, пока source-authoritative lineage доступна и допустима к использованию. Temporal window не разрывает доказанную identity/lineage.

Correction/supersedes lineage всегда связывает новую запись с исходной. Этот grouping rule не решает, включать ли Campaign с correction history в конкретный freeze: этот выбор остаётся `OPEN` под `XFR-D-060`. Если records включаются, их correction lineage не может быть разделена между splits.

Confirmed duplicate/replay lineage создаёт edge даже при разных technical IDs. Suspected duplicate/replay без достаточного source/provenance evidence не считается независимым record: затронутый record исключается из split assignment fail closed до разрешения linkage.

### 3.6. Missing или ambiguous linkage

Если для candidate record отсутствует обязательная canonical identity, lineage неполна, источники конфликтуют либо нельзя однозначно доказать component membership, permissive fallback запрещён.

Такой record не распределяется случайно, не считается новым независимым sample и не присоединяется по AI/heuristic similarity. Он исключается из ground-truth split assignment с явной unresolved reason/evidence reference. Это исключение не является negative label или failed match.

### 3.7. Freeze и позднее evidence

До `FROZEN` graph/component membership пересчитываются по полному frozen source/provenance snapshot. Freeze-time manifest обязан ссылаться на policy version/hash, зафиксировать component membership evidence и показать, что каждый component назначен ровно в один split; exact manifest schema/carrier остаётся `OPEN`.

Новое evidence, correction или обнаруженная linkage после freeze не переписывает frozen graph/run. Оно создаёт новый versioned freeze/review cycle. Если review доказывает, что уже frozen run содержал cross-split connected component или недоказанную isolation, run получает `EVALUATION_RUN_REJECTED`; historical records остаются immutable.

## 4. Обязательные инварианты

1. `XFR-D-059 v1.0` fail-closed boundary полностью сохраняется.
2. Canonical component определяется транзитивной связанностью, а не одним выбранным ID.
3. Source-authoritative identity/lineage evidence обязательно для каждого edge.
4. Один component не может быть разделён между splits.
5. Missing/ambiguous linkage не получает permissive assignment.
6. AI/model output не является identity authority, edge evidence или leakage waiver.
7. Corrections, revisions, duplicates и replay не создают искусственно независимые samples.
8. Post-freeze evidence не переписывает historical run.
9. Grouping resolution не утверждает dataset, ratios, seed, metrics, runtime или implementation.

## 5. Что остаётся `OPEN`

- Campaign correction-history inclusion/exclusion at freeze (`XFR-D-060`);
- dataset size, split ratios, allocation boundaries, randomization/seed rules (`XFR-D-062`);
- exact metric units/denominators и numeric targets (`XFR-D-063` и применимые downstream decisions);
- source-specific identity resolution controls там, где canonical linkage ещё не определена approved source policy;
- concrete duplicate/replay detection implementation и evidence carrier при полном сохранении fail-closed rule §3.5;
- physical graph/manifest storage, component identifier/hash representation, schema, API/CLI/events и reason-code catalog;
- operational remediation/re-allocation procedure для rejected run;
- Evaluation Plan, dataset/evaluation-run, production-data/privacy и implementation approval.

## 6. Rationale

Один ID недостаточен: общий Property может появиться в разных Campaigns, один TenantRequest — участвовать в нескольких matching attempts, `match_pair_id` сохраняет identity пары между calculation versions, а `encounter_id` связывает единый процессный контакт. Revisions, corrections, duplicates и replay также могут создавать технически разные записи об одной логической evidence chain.

Транзитивный connected component закрывает leakage через цепочку косвенных связей и не позволяет выбирать удобный узкий key после просмотра split. Source-authoritative closed edge set предотвращает обратную ошибку — создание identity по свободному тексту или AI similarity. Fail-closed exclusion при недоказанной linkage сохраняет safety без ложного negative outcome.

## 7. Adversarial cases

1. **Один Property, разные Campaigns.** Общая canonical Property identity соединяет records; разные Campaign IDs не разрешают разные splits.
2. **Один TenantRequest используется повторно.** Общая canonical TenantRequest identity создаёт один component для всех связанных attempts.
3. **Один match pair, новый encounter.** Общий `match_pair_id` сохраняет связанность даже при разных `encounter_id`.
4. **Один encounter объединяет две Campaigns.** Общий `encounter_id` соединяет обе Campaign chains транзитивно.
5. **Новая revision получила новый result ID.** Source aggregate lineage соединяет revisions; новый technical ID не создаёт независимый sample.
6. **Outcome correction после исходной записи.** Correction связана с original; для нового freeze они не разделяются, а frozen historical run не переписывается.
7. **Replay/duplicate получил новый UUID.** При подтверждённой provenance linkage он входит в исходный component; при подозрении без доказательства исключается fail closed.
8. **AI считает два адреса одинаковыми.** AI similarity не создаёт edge; без canonical source identity records не допускаются как доказанно независимые.
9. **Транзитивный bridge найден после предварительного assignment.** Components пересчитываются до freeze; конфликтующие assignments отменяются. После freeze обнаружение приводит к rejected run, не silent re-assignment.
10. **Component слишком велик для желаемого ratio.** Component не разрезается; ratio/coverage constraint решается `XFR-D-062` либо component исключается по approved policy.
11. **Grouping policy утверждена, но ratios/seed отсутствуют.** Split остаётся невалидным и run не переходит в `FROZEN`.
12. **Connected-component dataset показывает хорошие metrics.** Это не утверждает Evaluation Plan, policy release, gate или production use.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §4, §8, §10, §11 решение №3, `MEP-C-002`, `MEP-C-011` и readiness summary;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current overlay для `XFR-D-059 v1.1`;
- будущие grouping manifest/runtime artifacts — отдельные downstream artifacts, не создаются этим record'ом.

Ни один future sync не должен интерпретировать этот record как approval Evaluation Plan, dataset, evaluation run, production-data use или implementation.

## 9. Change control

Изменение canonical edge set, transitive-closure rule, component atomicity, missing-linkage fail-closed behavior или post-freeze immutability требует нового versioned `XFR-D-059` record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** candidate records с общей source-authoritative Property, TenantRequest, Campaign, `match_pair_id`, `encounter_id` или aggregate lineage, **when** строится grouping graph, **then** они соединяются разрешённым edge.
2. **Given** цепочка из нескольких разрешённых edges, **when** вычисляется membership, **then** применяется transitive closure и вся цепочка образует один component.
3. **Given** один component, **when** формируется split assignment, **then** все его records назначаются ровно в один split.
4. **Given** common component найден в tuning и final, **when** проверяется leakage, **then** run получает `EVALUATION_RUN_REJECTED`.
5. **Given** revision, correction, confirmed duplicate или replay, **when** существует source/provenance lineage, **then** новый technical ID не создаёт независимый sample.
6. **Given** linkage missing, ambiguous или conflicting, **when** невозможно доказать component membership, **then** record исключается fail closed без random/AI fallback и без negative-label coercion.
7. **Given** новое evidence после freeze, **when** меняется component membership, **then** создаётся новый versioned freeze/review cycle; historical run не переписывается.
8. **Given** grouping policy утверждена, **when** `XFR-D-060`/`XFR-D-062`, freeze manifest или runtime carrier отсутствуют, **then** dataset/run/implementation не считаются утверждёнными.
9. **Given** этот record, **when** проверяются Evaluation Plan approval и governance gates, **then** Proposal не получает `APPROVED`, implementation не авторизована и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-059 v1.1 CONSERVATIVE CONNECTED-COMPONENT GROUPING/ISOLATION POLICY APPROVED — DATASET, RATIOS, SEED, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
