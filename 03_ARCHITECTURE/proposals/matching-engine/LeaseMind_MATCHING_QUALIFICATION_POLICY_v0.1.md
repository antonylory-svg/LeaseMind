# LeaseMind MATCHING_QUALIFICATION_POLICY

**Версия:** 0.1
**Дата:** 2026-08-23
**Статус:** `Proposal for cross-functional review — does not authorize implementation`
**Artifact owner:** `Chief AI Architect + PRODUCT`; mandatory approvers: `LEGAL + DEVELOPMENT` — утверждено governance record `LeaseMind_MATCHING_DECISION_XFR-D-030_v1.0.md`. Architecture §36.2 требует policy для gate, но сама не назначает owner; назначение сделано отдельным human governance decision, не по аналогии и не является approval этого Proposal.
**Threshold decision owner (Architecture §37 вопрос №8, Risk→routing threshold):** `AI + LEGAL` — `SOURCE_NORMATIVE`; отдельная owner-грань, ограниченная именно этим порогом, не тождественна artifact owner выше и не распространяется на остальные пороги (§10, §15 открытое решение №9).
**DEVELOPMENT:** mandatory approver policy artifact и technical schema steward runtime carrier по `XFR-D-030`/`XFR-D-031`; не владеет единолично routing semantics.

**This proposal does not authorize implementation, runtime/API/schema changes, model release, synthetic acceptance, production use, real personal data, automated policy promotion, or any gate.**

Документ не закрывает Architecture §37 вопрос №8 и не переводит ни один gate в `READY`.

Human-approved governance decision records `LeaseMind_MATCHING_DECISION_XFR-D-032_v1.0.md`, `...XFR-D-033...`, `...XFR-D-037...`, `...XFR-D-038...`, `...XFR-D-040...`, `...XFR-D-044_v1.0.md` (Wave 2A, 2026-08-23) утверждают ровно qualitative semantics шести open decisions ниже (§15 №3, №4, №10, №11, №13, №18). Это обязательные governance decisions, не переоткрываемые этим sync-проходом, но их approval не переводит настоящий Proposal или sibling Proposals в `APPROVED`/`SOURCE_NORMATIVE` — статус документа ниже не меняется.

Human-approved `LeaseMind_MATCHING_DECISION_XFR-D-055_v1.0.md` отдельно разрешает `PARTIALLY_RESOLVED_BOUNDARY` Risk output → Qualification interface: governance owner `Chief AI Architect + AI`, mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT`, evidence/technical-procedure owner `AI + DEVELOPMENT` без unilateral approval; provenance/version-bound read-only hand-off, fail-closed/non-compensation и Risk-alone routing prohibitions обязательны. Exact trigger/mapping, `XFR-D-M2`, schema/carrier/data/RBAC/policies/runtime/implementation остаются `OPEN`; этот record не меняет artifact owner настоящего Proposal или его four-result semantics.

Human-approved `LeaseMind_MATCHING_DECISION_XFR-D-043_v1.0.md` отдельно разрешает `PARTIALLY_RESOLVED_BOUNDARY` строки §15 №17: governance owner `Chief AI Architect + PRODUCT`, mandatory approvers `LEGAL + DEVELOPMENT + AI`, evidence/technical-procedure owner `DEVELOPMENT + AI` без unilateral approval. Утверждены только prospective supersession, immutable historical result с исходным полным version/hash bundle, требование separately approved compatible current bundle + нового calculation для current actionability, fail-closed compatibility без automatic `STALE`/negative fact/four-result route и отсутствие forced bumps неизменённых Feature/Scoring/Risk versions. Exact taxonomy/version scheme/matrix/triggers/cascade/migration/TTL/carrier/API/events/hash/RBAC/data/runtime/implementation остаются `OPEN`; этот record не утверждает настоящий Proposal или manifest entry.

Human-approved `LeaseMind_MATCHING_DECISION_XFR-D-039_v1.0.md` отдельно разрешает `PARTIALLY_RESOLVED_BOUNDARY` строки §15 №12: governance owner `Chief AI Architect + PRODUCT`, mandatory approvers `LEGAL + DEVELOPMENT + AI`, evidence/technical-procedure owner `AI + DEVELOPMENT` без unilateral approval. Architecture §25.1/§25.2/§25.3 остаются distinct namespaces; двенадцать §25.1 values — internal source inputs, не Qualification results, exhaustive future catalog или user-facing wording. String equality не создаёт mapping/alias; только separately approved applicable version/hash-bound mapping может consume eligible reason. Missing/unmapped/unknown/ambiguous/conflicting/stale/incompatible mapping fails closed без guessed route, negative fact или display; exact behavior остаётся `OPEN`. `XFR-D-033` precedence и `XFR-D-040` all-cause/primary-reason authority сохраняются. Exact mapping/cardinality/catalog/codes/order/fallback/compatibility/carrier/data/evidence/RBAC/policy/manifest/runtime/implementation остаются `OPEN`.

Human-approved `LeaseMind_MATCHING_DECISION_XFR-D-041_v1.0.md` отдельно разрешает `PARTIALLY_RESOLVED_BOUNDARY` строки §15 №14: governance/Qualification semantic owner `Chief AI Architect + PRODUCT`, mandatory approvers `LEGAL + DEVELOPMENT + AI`, evidence/technical-procedure owner `AI + DEVELOPMENT` без unilateral approval, `DEVELOPMENT` — technical queue/schema steward only. `HUMAN_REVIEW_REQUIRED` остаётся только version-bound request/direction к review, не queue item, enqueue, appointment, access grant, подтверждённый факт/критичность или Decision Record/legal outcome; любой будущий queue item — только read-only, version/hash-bound к неизменяемому original result/policy-version/all-cause/evidence bundle. Queue/operator non-authority, applicable Architecture §31.1 appointment/RBAC/conflict-check/four-eyes/appeal safeguards, Legal/Decision Service single-writer/Match-immutability и fail-closed review-dependent-only boundary обязательны. Exact queue owner/operator/lifecycle/appointments/RBAC/SLA/outcomes/Decision-schema/appeal/carrier/data/runtime/implementation остаются `OPEN`; этот record не утверждает настоящий Proposal или manifest entry, а `XFR-D-053` остаётся distinct.

**Связанные документы:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`, `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (прочитан полностью до EOF, 3976 строк — Qualification-специфичных carrier'ов не найдено, см. §5), `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` (Proposal-зависимость, source facts/evidence), `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` (Proposal-зависимость, dataset/metric/threshold-search procedure evidence), `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` (Proposal-зависимость, Risk output boundary), `LeaseMind_MATCHING_DECISION_XFR-D-030_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-031_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-032_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-033_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-037_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-038_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-039_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-040_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-041_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-043_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-044_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-055_v1.0.md`, `02_PRODUCT/CAMPAIGN_OUTCOMES.md`, `02_PRODUCT/ANALYSIS_SNAPSHOT.md`, `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md` (только DEVELOPMENT evidence о Data Contracts hash/executable verification, не источник новых архитектурных решений).

---

## 1. Metadata и нормативная дисциплина

Каждое существенное утверждение этого документа помечено одним из четырёх статусов:

- `SOURCE_NORMATIVE` — уже прямо утверждено существующим источником, цитируется или пересказывается без ослабления;
- `DECISION_CANDIDATE_FOR_REVIEW` — предлагается этим proposal как безопасный кандидат, не утверждено;
- `OPEN_BLOCKED_PENDING_DECISION` — источников недостаточно или требуется отдельное решение owner'а;
- `OUT_OF_SCOPE` — принадлежит другому артефакту или gate.

**Merged Proposal не становится normative только из-за merge.** `MATCHING_FEATURE_SCHEMA_v0.1.md`, `MATCHING_EVALUATION_PLAN_v0.1.md` и `MATCHING_RISK_POLICY_v0.1.md` имеют статус `Proposal`, не `APPROVED` — их собственные additions (интерпретации, предложенные taxonomy, candidate rules) остаются `DECISION_CANDIDATE_FOR_REVIEW`/precedent, а не source-нормой, даже если соответствующая задача была помечена как выполненная или PR слит. Source-нормативны только те положения этих Proposal-документов, которые корректно и без ослабления цитируют буквальный текст Architecture или PRODUCT-документов — и тогда этот документ цитирует исходный Architecture/PRODUCT-текст напрямую, а не сам Proposal как source.

Precedent, предложение соседнего документа или техническая осуществимость не повышаются до нормативного решения.

**Human-approved governance decision overlay — пятая, отдельная категория.** Records `XFR-D-032`, `XFR-D-033`, `XFR-D-037`, `XFR-D-038`, `XFR-D-040`, `XFR-D-044` (дата 2026-08-23, `Decision authority: human project-governance confirmation`) утверждают ровно qualitative semantics соответствующих open decisions №3, №4, №10, №11, №13, №18 (§15). Их статус ниже обозначается `RESOLVED_QUALITATIVE_BOUNDARY` — отдельная категория, не тождественная ни одной из четырёх выше: это не буквальный текст Architecture (`SOURCE_NORMATIVE`), не предложение этого Proposal без approval (`DECISION_CANDIDATE_FOR_REVIEW`), не отсутствие решения (`OPEN_BLOCKED_PENDING_DECISION`) и не чужой scope (`OUT_OF_SCOPE`). `RESOLVED_QUALITATIVE_BOUNDARY` обязателен для текста ниже и не подлежит переоткрытию этим sync-проходом, но принципиально уже: он резолвит только качественную семантику соответствующего вопроса и явно не резолвит numeric thresholds, reason-code values/catalog order, runtime/API/DB representation или implementation authorization — эти грани остаются `OPEN_BLOCKED_PENDING_DECISION` у каждого затронутого решения. Ни approval этих шести records, ни их наличие не переводит настоящий Proposal или любой sibling Proposal в `APPROVED`/`SOURCE_NORMATIVE`.

**Current row №17 overlay:** `XFR-D-043 v1.0` имеет отдельный статус `PARTIALLY_RESOLVED_BOUNDARY`: qualitative governance/supersession boundary обязательна, но exact taxonomy, semver scheme, compatibility matrix, lifecycle, carrier, evidence, policy/manifest approval, runtime и implementation остаются `OPEN_BLOCKED_PENDING_DECISION`. Прежний `DEVELOPMENT + AI` candidate контекст строки №17 читается только как technical/evidence context, не как semantic ownership.

**Current row №12 overlay:** `XFR-D-039 v1.0` имеет отдельный статус `PARTIALLY_RESOLVED_BOUNDARY`: roles, namespace separation, no-string-mapping, separately approved version/hash-bound mapping prerequisite, fail-closed handling и preservation `XFR-D-033`/`XFR-D-040` обязательны; exact mapping/cardinality/catalog/codes/order/fallback/compatibility/carrier/data/evidence/RBAC/policy/manifest/runtime/implementation остаются `OPEN_BLOCKED_PENDING_DECISION`.

**Current row №14 overlay:** `XFR-D-041 v1.0` имеет отдельный статус `PARTIALLY_RESOLVED_BOUNDARY`: decision-specific governance/Qualification semantic owner, mandatory approvers, non-unilateral evidence/technical-procedure role, `DEVELOPMENT` technical queue/schema steward only, request-not-queue/outcome semantics `HUMAN_REVIEW_REQUIRED`, future read-only version/hash-bound queue-item binding, queue/operator non-authority, applicable Architecture §31.1 appointment/RBAC/conflict-check/four-eyes/appeal safeguards и Legal/Decision Service single-writer/Match-immutability обязательны; production queue owner/operator, appointments, RBAC, SLA, outcomes, Decision-schema, appeal, carrier и implementation остаются `OPEN_BLOCKED_PENDING_DECISION`.

---

## 2. Источники (прочитаны полностью до EOF)

1. `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` — полностью, с фокусом на §§5, 12–19, 25, 27, 31–34, 36–40, 48–53;
2. `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` — все 3976 строк, от первой до последней, включая все Change Log таблицы, OpenAPI 3.1, AsyncAPI 3.0 (33 event routing строки), PostgreSQL DDL (все таблицы/функции/triggers/RLS/grants), guards (§6), Error Catalog (§7, 26 строк), Compatibility и contract tests (§8, `CT-001–033`), Совместимость версий (§9), Граница допуска (§10);
3. `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — полностью;
4. `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — полностью;
5. `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` — полностью;
6. `02_PRODUCT/CAMPAIGN_OUTCOMES.md` — §§4–7 (термины lifecycle/outcome, разрешённые коды, неизменяемость/исправления);
7. `02_PRODUCT/ANALYSIS_SNAPSHOT.md` — `AS-C-019`/`AS-C-025` (synthetic exclusion), §9.8-related контекст;
8. `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md` — только как DEVELOPMENT evidence (hash-верификация Data Contracts, не источник новых governance-норм).

Источник-приоритет: буквальный текст Architecture > буквальный текст CAMPAIGN_OUTCOMES/ANALYSIS_SNAPSHOT > Data Contracts (только как proof-of-absence исполнимого carrier) > Proposal-зависимости (Feature Schema/Evaluation Plan/Risk Policy, все неутверждённые) > DEVELOPMENT review (только техническая воспроизводимость).

---

## 3. Назначение, scope и non-goals

### 3.1. Назначение

`MATCHING_QUALIFICATION_POLICY` — будущий governance-артефакт, требуемый Architecture §36.2 условие 2 для `IMPLEMENTATION_READINESS_GATE`, определяющий conceptual boundary Matching Qualification Gate: состав входов, разделение терминологии от смежных пространств имён, границу с Eligibility Filter/Hard Constraint, границу с Risk/Confidence/Match, границу с human-review/Decision Record, разделение от downstream gates. Документ может сравнивать candidate-подходы (precedence, aggregation, explainability), но не выбирает ни один из них и не разрешает implementation.

### 3.2. Non-goals — явно исключено

Документ **не задаёт**:

- численные mutual-fit, Confidence, completeness и Risk thresholds;
- mapping `INELIGIBLE → REJECTED_BY_MATCHING`;
- выбранный precedence между routing causes;
- public/runtime field, enum, event, reason namespace или DB schema;
- использование orphaned `GateState` (Data Contracts §2.2) как Qualification carrier;
- изменение утверждённого `XFR-D-030` owner/approver assignment или выбор exact runtime representation сверх responsibility boundary `XFR-D-031`;
- reviewer queue/authority сверх уже утверждённого Architecture §31.1;
- legal/payment/payer/participation/presentation/previous-contact/reveal решения;
- scoring arithmetic, Risk factor definitions и Safe Presentation ownership;
- автоматическое изменение runtime policy по результатам `MATCHING_EVALUATION_PLAN`;
- production authorization в любой форме.

---

## 4. Ownership и boundary matrix

| Артефакт/роль | Владеет | Не владеет |
|---|---|---|
| `MATCHING_QUALIFICATION_POLICY` (этот документ) | Conceptual boundary Matching Qualification Gate: terminology/namespace separation, input bundle (concept-level), Eligibility/Hard Constraint boundary, four-result semantics, human-review boundary, downstream separation | Match/Reciprocal/Dimension arithmetic; Risk factor definitions; список признаков; какие поля показывать пользователю; численные thresholds |
| `MATCHING_FEATURE_SCHEMA` (Proposal) | Какие feature/facts существуют, их evidence/freshness/applicability | Routing rule, Risk categories, aggregation |
| `MATCHING_SCORING_POLICY` (не создан) | Match/Reciprocal/Dimension arithmetic | Routing, Risk, список признаков |
| `MATCHING_RISK_POLICY` (Proposal) | Risk categories, evidence eligibility для Risk, aggregation/calibration candidates, human-review escalation boundary для Risk | Итоговый Qualification routing; Match/Reciprocal arithmetic |
| `MATCHING_EVALUATION_PLAN` (Proposal) | Dataset/labels/metrics/threshold-search evidence | Финальные значения весов/порогов Qualification; runtime scoring |
| `SAFE_PRESENTATION_POLICY` (не создан) | Что можно показать пользователю; может использовать Qualification routing result как input | Вычисление или владение Qualification routing |
| LEGAL | Юридически значимые выводы; допустимые lawful sources (§37 №7); protected/proxy классификация; часть threshold decision §37 №8 (совместно с `AI`) | Sole technical reproducibility |
| AI Manager | Orchestration задач Кампании; получает Match Package | Подмена источника фактов, LEGAL, user decision (§5 принципы 2–4) |
| Legal/Decision Service | Единственный writer мотивированных reviewer decisions (§40) | Qualification calculation |
| Matching Engine | Единственный writer расчёта Match, включая Qualification Gate результат (§40) | Кампания, стратегия, плательщик (§5 принципы 3–4) |
| DEVELOPMENT | Mandatory approver policy artifact; technical schema steward/carrier implementation owner по `XFR-D-030`/`XFR-D-031` | Единоличное изменение смысла routing rule |

**Отсутствие циклической зависимости.** Qualification Policy может оцениваться против versioned candidate bundles Feature Schema/Scoring Policy/Risk Policy до их утверждения — `DECISION_CANDIDATE_FOR_REVIEW`. Evaluation Plan производит evidence для последующего cross-functional approval конкретных Qualification thresholds — не заменяет и не продвигает его автоматически (§34.4 Architecture: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев»).

---

## 5. Terminology и namespace separation — обязательное разведение

Independent grep всей Architecture на `MATCHING_QUALIFICATION_POLICY` даёт ровно одно совпадение (§36.2 условие 2). Полное чтение `MATCHING_DATA_CONTRACTS_v1.0.md` (все 3976 строк, OpenAPI/AsyncAPI/DDL/error catalog/contract tests) **не выявило ни одного** Qualification-related или семантически эквивалентного generic carrier: 0 совпадений для всех четырёх §18.1 результатов, 0 для «qualification», 0 для «eligib» (кроме несвязанного `LM-CREDIT-NOT-ELIGIBLE`), 0 для «disposition», 0 для «hard_constraint», 0 для «confidence», 0 для «risk». Data Contracts v1.0 моделирует исключительно критическую цепочку **после** Match (Payer Resolution → Participation → Payment/Fiscal → Reveal Gate Snapshot → Introduction Record → Reveal Evidence → Dispute, дословно §1 «Область» Data Contracts) — Matching/Eligibility/Qualification лежат до начала этой цепочки и не имеют в v1.0 никакого представления.

Единственная потенциально смежная находка — `GateState: enum: [NOT_EVALUATED, BLOCKED, READY, INVALIDATED]` (Data Contracts §2.2, объявление типов) — **orphaned**: объявлен один раз и ни разу не используется ни в одной OpenAPI schema, ни в одном AsyncAPI message/payload, ни в одной DDL-таблице/колонке, ни в одном error code во всём остальном документе. Значения не совпадают текстуально ни с одним из четырёх §18.1 результатов. Этот proposal **не переиспользует и не расширяет** `GateState` как Qualification carrier ни в каком виде.

| Термин | Источник | Scope/stage | Совпадает по строке с | Статус |
|---|---|---|---|---|
| `evidence_status = HUMAN_REVIEW_REQUIRED` | §11 Architecture («Каждый значимый параметр профиля содержит… Статус» — задаёт per-parameter/value scope) + §13 Architecture (7-элементный закрытый список статусов: `UNVERIFIED/SOURCE_CONFIRMED/CONTENT_VERIFIED/CONFLICTING/STALE/REJECTED/HUMAN_REVIEW_REQUIRED`; источник использует термин «Статусы доказательства», не «enum») | Статус **одного значимого параметра/значения** — scope следует из общей модели §11, конкретный список значений — из §13 | Qualification result `HUMAN_REVIEW_REQUIRED` | `SOURCE_NORMATIVE` (различие) |
| Qualification result `HUMAN_REVIEW_REQUIRED` | §18.1 | Финальный результат **всего Match** на этапе 8 | evidence status выше | `SOURCE_NORMATIVE` (различие) |
| Eligibility Filter `NEEDS_VERIFICATION` | §14 этап 3 (`ELIGIBLE`/`INELIGIBLE`/`NEEDS_VERIFICATION`) | Промежуточный результат **этапа 3**, до Reciprocal Scoring (этап 5) и до Gate (этап 8) | Qualification result `NEEDS_VERIFICATION` | `SOURCE_NORMATIVE` (различие) |
| Qualification result `NEEDS_VERIFICATION` | §18.1 | Финальный результат этапа 8 | Eligibility Filter выше | `SOURCE_NORMATIVE` (различие) |
| Eligibility result `INELIGIBLE` | §14 этап 3 | Промежуточный результат этапа 3 | — (уникальная строка) | `SOURCE_NORMATIVE` |
| Qualification result `REJECTED_BY_MATCHING` | §18.1 | Финальный результат этапа 8 | — (уникальная строка, **не** совпадает с `INELIGIBLE`) | `SOURCE_NORMATIVE` |
| `evidence_status = REJECTED` | §13 | Статус одного элемента доказательства | `EVALUATION_RUN_REJECTED`, `REJECTED_BY_MATCHING` | `SOURCE_NORMATIVE` (различие) |
| `EVALUATION_RUN_REJECTED` | `MATCHING_EVALUATION_PLAN` §10 (Proposal) | Document-level lifecycle **verdict evaluation run**, не Match | Явно спроектирован **не** совпадать ни с `evidence_status=REJECTED`, ни с `REJECTED_BY_MATCHING` (цитата Evaluation Plan: «Название специально отличается… чтобы не создавать namespace collision») | `DECISION_CANDIDATE_FOR_REVIEW` (сам термин — Proposal-конструкция, не Architecture) |
| `GateState = NOT_EVALUATED/BLOCKED/READY/INVALIDATED` | Data Contracts §2.2 | Объявлен, **orphaned/unused** нигде в исполнимом контракте | Текстуально не совпадает ни с одним из четырёх §18.1 результатов | Не Qualification carrier; не переиспользуется |

**Совпадение строк не создаёт одинаковый enum/field; различие строк не создаёт mapping.** Источник ни разу не формулирует правило «Eligibility Filter `NEEDS_VERIFICATION` = Qualification result `NEEDS_VERIFICATION`» и ни разу не формулирует «`INELIGIBLE` → `REJECTED_BY_MATCHING`». Оба mapping качественно заданы `RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-032 v1.0` (открытое решение №3, §15): Eligibility `INELIGIBLE` → Qualification `REJECTED_BY_MATCHING` только при доказанных всех шести условиях §14; Eligibility `NEEDS_VERIFICATION` → Qualification `NEEDS_VERIFICATION`, если отдельная критическая причина не требует `HUMAN_REVIEW_REQUIRED`; Eligibility `ELIGIBLE` не означает автоматически `QUALIFIED_HYPOTHESIS`. Exact runtime enum/field representation обоих mapping — открытое решение №2 / `XFR-D-031`, остаётся `OPEN_BLOCKED_PENDING_DECISION`.

---

## 6. Matching Qualification Gate — входы/условия (Architecture §18.1, §14 этап 8)

Gate проверяет девять условий — названия `SOURCE_NORMATIVE`, дословно §18.1:

| № | Условие (дословно §18.1) | Статус названия | Threshold/mapping/precedence |
|---|---|---|---|
| 1 | Отсутствие подтверждённого несовместимого Hard Constraint | `SOURCE_NORMATIVE` | Precedence с другими условиями — `RESOLVED_QUALITATIVE_BOUNDARY`, `XFR-D-033 v1.0` (пункт 1 иерархии, высший приоритет); numeric thresholds и exact runtime algorithm — `OPEN` |
| 2 | Наличие обеих сторон и объекта с immutable ID | `SOURCE_NORMATIVE` | Immutable ID уже норма (§8.1) |
| 3 | Достаточность взаимного соответствия | `SOURCE_NORMATIVE` | Численный порог — `OPEN` |
| 4 | Минимальная полнота critical data | `SOURCE_NORMATIVE` | Численный порог/правило — `OPEN` |
| 5 | Confirmed sources обязательных полей | `SOURCE_NORMATIVE` | Required evidence level per feature — `OPEN` (Feature Schema §4.1/§5.2: `BLOCKED_PENDING_DECISION` для всех 20 candidates) |
| 6 | Допустимый Confidence Score | `SOURCE_NORMATIVE` | Численный порог — `OPEN` |
| 7 | Отсутствие unresolved critical risk | `SOURCE_NORMATIVE` | «Критический» не определено численно; порог — Architecture §37 №8, `OPEN`, owner `AI + LEGAL` |
| 8 | Актуальность profile/rule versions | `SOURCE_NORMATIVE` | Revision/version-инвалидация — уже норма (§5 принцип 16: «Любой расчет воспроизводим по зафиксированной версии данных, признаков, весов и правил»; §49 reproducibility spec). §8.1 цитируется отдельно только для immutable ID (условие 2 выше) и не является источником version/revision-инвалидации; конкретный invalidation algorithm сверх этих двух source-normative утверждений этим документом не добавляется |
| 9 | Объяснимые match reasons | `SOURCE_NORMATIVE` | Multi-cause preservation и primary-reason selection rule — `RESOLVED_QUALITATIVE_BOUNDARY`, `XFR-D-040 v1.0`; reason-catalog values/order для Qualification — `OPEN` (§11 ниже) |

**Граница Gate** (`SOURCE_NORMATIVE`, дословно §14 этап 8): «Gate не выполняет юридические, платежные или reveal-проверки». §18.3–18.7 отдельно и явно маркируют Participation/Payment/Previous Contact/Introduction Record/Reveal как «внешний» дословно в заголовке; §18.2 (Presentation Readiness) маркирован источником иначе — «координирует AI Manager», без слова «внешний» в заголовке (см. точную таблицу §13 ниже). Qualification Gate (§18.1 — «ответственность Matching Engine») структурно отделён от всех них самим источником вне зависимости от точной формулировки каждого заголовка. Успех Gate не разрешает последующие gates автоматически (§13 ниже).

---

## 7. Eligibility Filter и Hard Constraint boundary

Автоматический `INELIGIBLE` на этапе 3 (§14) допустим только при одновременном выполнении всех шести условий — `SOURCE_NORMATIVE`, дословно:

1. заранее утверждённый versioned Hard Constraint;
2. явно задан стороной/обязательным правилом, не model-inferred;
3. подтверждён актуальным разрешённым источником;
4. не protected/proxy/discriminatory;
5. нет unknown/conflict/legal interpretation;
6. reason code + rule version + evidence link + доступность human review.

`SOURCE_NORMATIVE`, дословно §14: «Если хотя бы одно условие не выполнено, Matching Engine не выставляет `INELIGIBLE`, а возвращает `NEEDS_VERIFICATION` или `HUMAN_REVIEW_REQUIRED`» — precedence между этими двумя качественно задан `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-033 v1.0` (mandatory human-review tier предшествует verification-need tier, §14 иерархия пункт 2 vs пункт 3, открытое решение №4); exact runtime algorithm остаётся `OPEN`.

**Эти промежуточные Eligibility-результаты не приравниваются автоматически к одноимённым Qualification results.** Mapping Eligibility → Qualification качественно задан `RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-032 v1.0` (открытое решение №3); exact runtime enum/field representation — открытое решение №2 / `XFR-D-031`, остаётся `OPEN_BLOCKED_PENDING_DECISION`.

**Feature Schema Proposal** используется только со следующей честной классификацией (все положения — свойства неутверждённого Proposal, цитируются как факт о его содержании, не как самостоятельная Architecture-норма):

- `value_state = NOT_APPLICABLE` (constraint не выражен пользователем) ≠ candidate `value_state = UNKNOWN` (constraint выражен, соответствующее Property-значение неизвестно) — Feature Schema §5.2, два разных случая (a) и (b);
- feature candidate с `registry_readiness = BLOCKED_PENDING_DECISION` не участвует в scoring/routing — Feature Schema §3.1, `MFS-C-016`;
- `combined_minimum_term_fact` — явно реклассифицирован как non-exclusion candidate input, не reject rule (Feature Schema §6.1);
- `required_evidence_level` для всех 20 hard-constraint candidates — `BLOCKED_PENDING_DECISION` (Feature Schema §4.1/§5.2/§10 открытое решение №1);
- до approval Feature Schema и связанных policies ни один из этих 20 candidates не активирует automatic `INELIGIBLE` (Feature Schema §4.3: `automatic_ineligible_allowed = NO` для всех 20).

---

## 8. Ровно четыре Qualification результата

Четыре текстовых результата §18.1 — `SOURCE_NORMATIVE`, дословно, и только как результаты Gate в Architecture:

- `QUALIFIED_HYPOTHESIS`;
- `NEEDS_VERIFICATION`;
- `HUMAN_REVIEW_REQUIRED`;
- `REJECTED_BY_MATCHING`.

**Runtime representation не утверждена.** Полное чтение `MATCHING_DATA_CONTRACTS_v1.0.md` до EOF подтверждает: ни один из четырёх результатов не встречается ни разу ни как поле, ни как enum-значение, ни как event type, ни как error code — Data Contracts v1.0 не содержит Qualification carrier ни explicit, ни generic (см. §5 — единственный кандидат `GateState` orphaned и не подключён). `XFR-D-031` утверждает только responsibility boundary: semantic owner — owner policy из `XFR-D-030`, technical schema steward — `DEVELOPMENT`, с обязательными architecture/replay и применимым LEGAL review. Exact runtime/API/field/enum representation остаётся `OPEN_BLOCKED_PENDING_DECISION`.

**Пятый статус не создаётся.** `STALE` (§32 Architecture: «Профиль устарел → Match становится `STALE`; раскрытие по нему не разрешается») — отдельное source behavior Match/freshness, не входит в перечень §18.1. Взаимодействие `STALE` с четырьмя результатами качественно задано `RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-038 v1.0` (открытое решение №11, см. §9 ниже): `STALE` остаётся ортогональным state, не становится пятым результатом и не преобразуется автоматически в `NEEDS_VERIFICATION`; последний четырёхсостояний результат сохраняется только как historical/audit result, не текущий actionable routing; disclosure остаётся заблокирован независимо от него. Runtime carrier/TTL/invalidation implementation остаются `OPEN_BLOCKED_PENDING_DECISION`.

---

## 9. Missing, conflicting и stale — три разных source behavior

`SOURCE_NORMATIVE`, дословно §32, §12.4, §5 принцип 7 — три поведения не объединяются в одно:

| Случай | Source behavior |
|---|---|
| Missing/unknown | «`NEEDS_VERIFICATION`; неизвестное не считается отрицательным» — в соответствующем контексте источника (Eligibility Filter этап 3 и/или Qualification Gate этап 8; источник использует один и тот же ярлык на обоих этапах без объединяющего правила, см. §5) |
| Conflicting | «Сохраняются версии; снижается уверенность; human review при критичности» — «критичность» качественно определена `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-037 v1.0` (открытое решение №10); численный threshold — `OPEN` |
| Stale | «Match становится `STALE`; раскрытие по нему не разрешается» — взаимодействие с четырьмя Qualification результатами качественно задано `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-038 v1.0` (открытое решение №11) |

Ни одно из трёх поведений не сворачивается в проверенное нарушение/негативную метку. Сквозное mapping между этапами (Eligibility Filter → Qualification Gate) качественно задано: missing/unknown — `XFR-D-032`; conflicting-критичность — `XFR-D-037`; stale-ортогональность — `XFR-D-038`. Exact numeric thresholds и runtime representation для всех трёх остаются `OPEN`.

---

## 10. Match / Confidence / Risk / completeness boundary

`SOURCE_NORMATIVE` границы:

- Match Score, Confidence Score и Risk Score — разные показатели (§5 принцип 9); Risk не входит скрыто в Match arithmetic — «Match Score объединяет Reciprocal Fit и Deal Feasibility по утвержденной версии весов» (§15.6, дословно), Risk Score в эту формулу не входит;
- Qualification Gate принимает Match/Confidence/Risk/completeness как **conceptual inputs** (названы условиями Gate, §6 выше), но точный input bundle/schema — `DECISION_CANDIDATE_FOR_REVIEW` (§14, кандидат №1), не runtime-контракт;
- «достаточный mutual fit», «допустимый Confidence», «минимальная полнота» и «неразрешённый критический риск» — source-normative качественные условия (названы буквально §18.1), их численные thresholds — `OPEN` (открытые решения №5, №6, №7, №9);
- Risk signal не является proved fact/rejection — `SOURCE_NORMATIVE`, §17: «не является доказательством нарушения»;
- «Высокий риск переводит результат в `HUMAN_REVIEW_REQUIRED` либо `NEEDS_VERIFICATION` по утвержденной политике» — `SOURCE_NORMATIVE`, дословно §17, последняя строка; численный/качественный trigger — Architecture §37 №8, `OPEN`, owner `AI + LEGAL` **только для этого threshold decision**, не для всех Qualification-порогов;
- protected/proxy запрет — абсолютный, без исключений (§17, без ослабления).

**Provenance-дисциплина.** `MATCHING_RISK_POLICY_v0.1.md` имеет статус Proposal, не approved — не используется как самостоятельный normative source. Утверждение «Risk Policy поставляет Risk output, но не назначает final routing» цитируется здесь по Architecture §17/§18.1 напрямую; параллельная формулировка в Risk Policy §4/§10 учитывается только как согласованный corroborating precedent, не как независимый источник нормы.

**Human-approved interface overlay — `XFR-D-055 v1.0`, `PARTIALLY_RESOLVED_BOUNDARY`.** Risk output является provenance/version-bound read-only conceptual input; Risk Policy не пишет четыре Qualification results и не создаёт legal outcome. Только отдельно approved compatible Risk + Qualification rule может направить eligible Risk evidence в `HUMAN_REVIEW_REQUIRED`/`NEEDS_VERIFICATION`; Risk alone никогда не создаёт `QUALIFIED_HYPOTHESIS`/`REJECTED_BY_MATCHING`. Missing/unknown/unmapped/incomplete/conflicting/stale/version-incompatible input не считается clean/zero/low или authorization и обрабатывается fail closed без invented route. `XFR-D-048` non-compensation, `XFR-D-033` precedence, `XFR-D-038` `STALE` и `XFR-D-040` multi-cause semantics сохраняются. Exact trigger/mapping, выбор двух routes, numeric content, schema/carrier, compatibility/TTL/data/RBAC/policies/runtime/implementation остаются `OPEN`.

Role boundary этого interface: governance owner `Chief AI Architect + AI`; mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT`; evidence/technical-procedure owner `AI + DEVELOPMENT`, без unilateral approval. Artifact owner Qualification Policy остаётся `Chief AI Architect + PRODUCT`, artifact owner Risk Policy — `Chief AI Architect + LEGAL`, а decision row №9/`XFR-D-M2` остаётся source-owned `AI + LEGAL` и полностью `OPEN` по trigger/threshold.

---

## 11. Architecture §25 reason families — точная source-boundary

`SOURCE_NORMATIVE`, дословная структура §25 «Причины отказа и disposition»:

- §25.1 — закрытый список **ровно 12** алгоритмических причин Matching Engine;
- §25.2 — отдельные процессные причины, поступающие от AI Manager/внешнего сервиса;
- §25.3 — отдельные человеческие причины;
- «Процессная причина не должна автоматически становиться отрицательной меткой совместимости» (§25.2, дословно).

Двенадцать значений §25.1 (`SOURCE_NORMATIVE`, дословный закрытый список):

1. `HARD_CONSTRAINT_MISMATCH`;
2. `USE_INCOMPATIBLE`;
3. `BUDGET_OUTSIDE_CONFIRMED_LIMIT`;
4. `LOCATION_OUTSIDE_CONFIRMED_LIMIT`;
5. `TIMING_INCOMPATIBLE`;
6. `TECHNICAL_REQUIREMENT_MISSING`;
7. `DUPLICATE_ENTITY_CONFIRMED`;
8. `CRITICAL_DATA_UNVERIFIABLE`;
9. `CONFIDENCE_BELOW_POLICY`;
10. `CRITICAL_RISK_REQUIRES_REVIEW`;
11. `PROFILE_STALE`;
12. `SUPERSEDED_BY_NEW_PROFILE_VERSION`.

**Границы, исключающие overclaim:**

- Architecture **не задаёт** mapping этих 12 причин → четыре Qualification результата (§18.1) — ни прямо, ни через cross-reference; repo-wide проверка подтверждает отсутствие такой связки в тексте Architecture;
- источник **не называет** §25.1 финальным исчерпывающим Qualification reason namespace — не утверждается, что под будущие Qualification-specific нужды (например, детализация под Confidence/completeness/mutual-fit) достаточно только этих 12 значений;
- обязанность будущей Qualification Policy явно reconcile/не конфликтовать с §25.1 — только `DECISION_CANDIDATE_FOR_REVIEW` hygiene (осторожная практика непротиворечивости), не source-установленное обязательство;
- новый public/runtime reason namespace или catalog этим документом **не утверждается**;
- reason mapping, compatibility process и namespace/catalog owner остаются `OPEN` (открытое решение №12).

**Human-approved mapping-governance overlay — `XFR-D-039 v1.0`, `PARTIALLY_RESOLVED_BOUNDARY`.** Governance owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT + AI`; evidence/technical-procedure owner `AI + DEVELOPMENT`, без unilateral approval. §25.1/§25.2/§25.3 остаются distinct namespaces; exact twelve §25.1 values — internal source inputs, не Qualification results/exhaustive future catalog/user-facing wording. String equality/similar wording не создаёт mapping или alias. Только отдельно approved applicable version/hash-bound mapping может consume eligible reason. Missing/unmapped/unknown/ambiguous/conflicting/stale/incompatible mapping обрабатывается fail closed без guessed route, negative fact или display; exact blocking behavior остаётся `OPEN`. `XFR-D-033` precedence и `XFR-D-040` all-cause preservation/primary-reason authority не переписываются; same-class ordering не выбирается. `XFR-D-010` и `XFR-D-052` остаются independently `OPEN`; `XFR-D-077` остаётся independent `PARTIALLY_RESOLVED_BOUNDARY`, а его exact catalog namespace/values/wording/mapping/order/compatibility/carrier/operational contents — `OPEN`. Exact mapping/cardinality/catalog/codes/order/fallback/compatibility/schema/carrier/data/evidence/RBAC/policy/manifest/runtime/implementation не утверждены.

---

## 12. `REJECTED_BY_MATCHING` и human-review/Decision Record boundary

`REJECTED_BY_MATCHING` source-нормативен только как один из четырёх результатов §18.1 (`SOURCE_NORMATIVE`, дословно).

**Не называется** source-нормативно «algorithmic disposition» — Architecture §25 называется «Причины отказа **и** disposition»; союз «и» показывает, что источник трактует «disposition» как понятие, отдельное от конкретных причин отказа §25.1–25.3, и нигде не называет `REJECTED_BY_MATCHING` буквально этим термином. Обозначение «algorithmic disposition» — максимум `DECISION_CANDIDATE_FOR_REVIEW`-интерпретация, не source-normative название.

`REJECTED_BY_MATCHING` **не приравнивается** к:

- `INELIGIBLE` (§14 этап 3 — другой этап, другая строка; mapping `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-032 v1.0` (открытое решение №3) — только при доказанных всех шести условиях §14; exact runtime представление — открытое решение №2 / `XFR-D-031`, остаётся `OPEN`);
- одной или всем причинам §25.1 (mapping `OPEN`, §11);
- `evidence_status = REJECTED` (§13 — другой scope, per-evidence-item);
- process/human reason (§25.2/§25.3 — структурно отделены самим источником);
- Campaign business outcome или пользовательскому отказу (`CAMPAIGN_OUTCOMES.md` — отдельная сущность, отдельный владелец записи);
- legal Decision Record (§40 — отдельный writer).

**`HUMAN_REVIEW_REQUIRED` — направление к review, не сам Decision Record и не итоговое legal-решение.** Составной вывод из:

- §31 (таблица автоматических решений: «Confidence и Risk: автоматически как оценка… критический риск подтверждает сотрудник»);
- §21.7 (Decision Record process);
- §40 («Legal/Decision Service — единственный writer мотивированных reviewer decisions»).

Reviewer действует только в пределах приказа/RBAC/conflict check/четырёх глаз/мотивированного решения и не выражает волю за пользователя — `SOURCE_NORMATIVE`, дословно §31.1 (7 обязательных пунктов + запретительный абзац: «Ни один сотрудник не вправе от имени пользователя… заменять волеизъявление стороны»).

**Human-approved reviewer queue/authority overlay — `XFR-D-041 v1.0`, `PARTIALLY_RESOLVED_BOUNDARY`.** Governance/Qualification semantic owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT + AI`; evidence/technical-procedure owner `AI + DEVELOPMENT`, без unilateral approval; `DEVELOPMENT` — technical queue/schema steward only, не production queue owner/operator/reviewer/semantic authority/approver. `HUMAN_REVIEW_REQUIRED` остаётся только version-bound request/direction к review в составе конкретного Qualification result bundle — не enqueue, не assignment, не appointment, не access grant, не подтверждённый critical/adverse факт и не Decision Record/legal outcome. Любой будущий queue item, если отдельно утверждён, — только read-only orchestration reference, version/hash-bound к неизменяемому original Qualification result/calculation/policy-version/all-cause/evidence bundle; queue metadata (priority/age/SLA/timeout/retry/escalation/assignment/completion) не меняет evidence, route, reviewer authority или outcome. Для applicable Architecture §31.1 legally significant case обязательны separately approved version/hash-bound policy, valid written appointment, least-privilege RBAC, eligible evidence и conflict-of-interest check до открытия case/любого evidence access, с обязательной повторной check непосредственно перед решением; applicable four-eyes/appeal safeguards сохраняются без создания universal quorum. Legal/Decision Service остаётся sole writer'ом motivated outcome; original Match/Qualification calculation и history immutable. Missing/stale/incompatible/unauthorized binding, carrier, policy, appointment, RBAC, conflict-check или Decision-Record linkage обрабатываются fail closed только для review-dependent progression, без guessed route, negative/clean inference или unrelated access restriction. `XFR-D-053` (Risk reviewer-authority/queue/Decision-linkage) остаётся distinct question; Architecture §21.7/Data Contracts dispute schema/types/transitions не импортируются как generic Qualification queue content. Exact production queue owner/operator, case reviewer, appointing authority, RBAC/quorum, queue topology/lifecycle/SLA/outcomes, Decision Record schema/appeal/carrier и implementation остаются `OPEN`.

---

## 13. Downstream gate separation

`SOURCE_NORMATIVE`, §36 вводная строка: «Gate применяются последовательно и не подменяют друг друга. Успех раннего gate не разрешает действия более позднего.»

| Downstream gate | Статус относительно Matching Qualification Gate |
|---|---|
| Presentation Readiness Gate (§18.2) | «координирует AI Manager» (дословный заголовок Architecture; в отличие от §18.3–18.7, слово «внешний» в заголовке §18.2 отсутствует; semantic separation от Qualification Gate сохраняется независимо от точной формулировки) |
| Participation Gate (§18.3) | «внешний» |
| Payment Gate (§18.5) | «внешний» |
| Previous Contact Gate (§18.4) | «внешний с AI-поддержкой» |
| Introduction Record Gate (§18.6) | «внешний» |
| Reveal Gate (§18.7) | «внешний»; «Matching Engine не может выдать разрешение на раскрытие» |
| Governance gates (§36: `ARCHITECTURE_APPROVAL_GATE`/`IMPLEMENTATION_READINESS_GATE`/`SYNTHETIC_ACCEPTANCE_GATE`/`PRODUCTION_LAUNCH_GATE`) | Отдельный уровень артефакт-approval, не Match-level gates |

`QUALIFIED_HYPOTHESIS` **не разрешает автоматически**: presentation, payment, contact disclosure, reveal или production readiness. Переход от гипотезы к Квалифицированному варианту и далее выполняется через последовательность внешних gates с установленными человеческими подтверждениями (§39). Для Safe Presentation эта граница дополнительно подтверждена `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-044 v1.0`: Safe Presentation — read-only consumer Qualification result, не может пересчитать/повысить/понизить/заменить routing и не создаёт auto-disclosure для `QUALIFIED_HYPOTHESIS` (открытое решение №18, §15).

---

## 14. Candidate precedence, explainability, version/replay — сравнение без выбора

Большинство строк — `DECISION_CANDIDATE_FOR_REVIEW`, вариант не выбран; строки №2, №3 и №4 качественно резолвены `RESOLVED_QUALITATIVE_BOUNDARY` (`XFR-D-033`/`XFR-D-040`, см. последний столбец) — остальные строки продолжают оставаться честно open candidates. Для каждой строки — источник/precedent, owner/dependency, статус:

| № | Candidate | Источник/precedent | Owner/dependency | Почему candidate, не authorization |
|---|---|---|---|---|
| 1 | Orthogonal conceptual input bundle: Hard Constraint/Eligibility result, Match/Reciprocal/Deal Feasibility, Confidence, Risk, completeness, freshness, evidence/source eligibility, version/replay state | §18.1 сам перечисляет именно эти измерения как условия Gate; §33 audit bundle; Feature Schema §3 `FeatureValue` envelope, Risk Policy §7 evidence contract — обе Proposal используют такую же orthogonal-envelope модель | `Chief AI Architect + AI` (candidate, источник не называет прямо) | Перечисляет измерения, не задаёт формулу/веса/precedence между ними; не runtime schema |
| 2 | Сравнение нескольких precedence approaches (например: fail-closed категории раньше score-based; либо max/worst-factor precedence; либо явный rule-based каталог) | §5 принцип 6 (non-compensation), §14 порядок этапов (Eligibility Filter этап 3 предшествует Reciprocal Scoring этапу 5 и Gate этапу 8) | `Chief AI Architect + PRODUCT` — governance owner, наследовано от `XFR-D-030`; mandatory approvers `LEGAL + DEVELOPMENT`; `AI` — consulted domain function по `XFR-D-030`, не отдельный policy owner; изменение требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на `XFR-D-033` | `RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-033 v1.0` утвердил fail-closed rule-based иерархию (INELIGIBLE → mandatory human-review → verification-need → QUALIFIED_HYPOTHESIS) как выбранный qualitative approach; exact runtime algorithm/implementation не выбран и остаётся `OPEN` |
| 3 | Fail-closed условия (Hard Constraint, unknown, protected/proxy exclusion), рассматриваемые раньше threshold-based candidates | Тот же источник, что и №2 | `Chief AI Architect + PRODUCT` — governance owner, наследовано от `XFR-D-030`; mandatory approvers `LEGAL + DEVELOPMENT`; `AI` — consulted domain function по `XFR-D-030`, не отдельный policy owner; изменение требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на `XFR-D-033` | `RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-033 v1.0` качественно зафиксировал эту границу (fail-closed классы 1–3 предшествуют `QUALIFIED_HYPOTHESIS`); numeric thresholds внутри threshold-based условий (mutual-fit/Confidence/completeness) остаются `OPEN` |
| 4 | Multiple simultaneous causes сохраняются для audit/explanation, даже если выбран один final route | §33 (`SOURCE_NORMATIVE` audit bundle для любого расчёта Matching Engine) | `Chief AI Architect + PRODUCT` — governance owner, наследовано от `XFR-D-030`; mandatory approvers `LEGAL + DEVELOPMENT`; `AI` — consulted domain function по `XFR-D-030`, не отдельный policy owner; Matching Engine остаётся technical writer результата расчёта по §40, не owner policy-решения; изменение требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на `XFR-D-040` | `XFR-D-040 v1.0` утвердил multi-cause preservation и deterministic primary-reason selection rule (выбор из route-determining precedence-класса, `XFR-D-033`); reason-code catalog values/order и runtime algorithm implementation остаются `OPEN` |
| 5 | Distinct reason-family references per routing cause, без конкретного public namespace/каталога | §33 audit bundle; **должно явно не конфликтовать** с уже существующим `SOURCE_NORMATIVE` закрытым списком §25.1 (12 значений, §11), но не обязано трактовать его как исчерпывающий | `Chief AI Architect + AI`, координация с owner §25.1-совместимости (candidate) | Не вводит новый публичный каталог; explicit reconciliation с §25.1 остаётся `DECISION_CANDIDATE_FOR_REVIEW` hygiene, не обязательство |
| 6 | Policy version/hash + input/evidence references + replay metadata — концептуальный bundle | §49 (reproducibility spec, `SOURCE_NORMATIVE` состав bundle: exact replay для deterministic path; несовпадение — severity-1 defect; недетерминированный компонент не проходит Gate самостоятельно, только advisory) | `DEVELOPMENT + AI` (candidate, по аналогии с Risk Policy §11) | Bundle без проектирования storage/DB/API; bounded replay tolerance для вероятностного компонента — `OPEN` |
| 7 | Routing result ≠ human/legal outcome | §31.1 (7 пунктов), §40 (Legal/Decision Service — единственный writer decisions), §25.2/25.3 (раздельные taxonomies) | Наследует §40/§31.1 owner-структуру | Формулирует уже установленную границу применительно к Qualification-контексту, не новое решение |
| 8 | Отсутствие автоматического runtime policy update от Evaluation Plan | Уже почти полностью `SOURCE_NORMATIVE` — §34.4: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев»; Evaluation Plan `MEP-C-014/018` (Proposal, cited as precedent) подтверждают то же | Наследуется, не новое решение | Переформулировка уже установленной cross-cutting нормы применительно к Qualification |

**Current version/supersession overlay — `XFR-D-043 v1.0`.** Supersession применяется только prospective; исторический Qualification result не мутируется и остаётся связан с исходным полным version/hash bundle. Current actionability после применимого supersession требует отдельно approved compatible current bundle и нового calculation. Unknown/unverified/mixed/hash-mismatched compatibility обрабатывается fail closed, но не создаёт автоматически `STALE`, negative fact или один из четырёх routing results. Qualification-only change не требует bump неизменённых Feature/Scoring/Risk versions. Exact taxonomy, version scheme, matrix, triggers/cascade, grace/fallback/migration/recalculation, TTL, carrier/API/events, hash/signing, RBAC, data/evidence, policy/manifest approval, runtime и implementation остаются `OPEN`.

---

## 15. Decision register — 20 строк

Сам Proposal не выбирает policy values. Внешние human governance records разрешили owner assignment №1 и responsibility boundary части №2; qualitative semantics строк №3, №4, №10, №11, №13 и №18 разрешены `RESOLVED_QUALITATIVE_BOUNDARY` records `XFR-D-032/033/037/038/040/044` (§1), а строки №12, №14 и №17 получили только `PARTIALLY_RESOLVED_BOUNDARY` по `XFR-D-039`, `XFR-D-041` и `XFR-D-043`. Отдельный canonical Risk Policy decision `MRP-12 → XFR-D-055` разрешает только `PARTIALLY_RESOLVED_BOUNDARY` interface governance/read-only/fail-closed semantics и не добавляет строку в этот 20-row register; row №9 `XFR-D-M2` identity/status не меняются. Exact runtime representation, numeric thresholds, Risk trigger/mapping, reason-code catalog values/order и остальные substantive вопросы остаются open.

| № | Вопрос | Owner | Блокирует |
|---|---|---|---|
| 1 | Artifact owner/approvers `MATCHING_QUALIFICATION_POLICY` | **RESOLVED by `XFR-D-030 v1.0`:** owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT`. Policy approval и manifest entry всё ещё pending | Controlled Artifact Manifest entry, `IMPLEMENTATION_READINESS_GATE` условие 5 |
| 2 | Exact runtime representation/field/enum для четырёх routing results | **PARTIALLY RESOLVED by `XFR-D-031 v1.0`:** semantic owner — `XFR-D-030` owner; technical schema steward — `DEVELOPMENT`; exact representation остаётся `OPEN_BLOCKED_PENDING_DECISION`, `GateState` не переиспользуется автоматически | Data Contracts schema, `IMPLEMENTATION_READINESS_GATE` условие 1 |
| 3 | Mapping Eligibility Filter результатов (`ELIGIBLE`/`INELIGIBLE`/`NEEDS_VERIFICATION`, §14 этап 3) → Qualification routing (§18.1) | **`RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-032 v1.0`.** Exact runtime enum/field representation остаётся `OPEN_BLOCKED_PENDING_DECISION` (граница `XFR-D-031`) | Eligibility→Gate pipeline semantics — качественно закрыто; runtime representation ещё блокирует Data Contracts schema |
| 4 | Precedence между hard constraint / unknown / conflict / stale / confidence / risk / completeness / mutual-fit причинами при одновременном срабатывании | **`RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-033 v1.0`**, fail-closed иерархия (§14 candidate №2/№3 подтверждены как выбранный approach). Numeric thresholds и exact runtime algorithm остаются `OPEN` | Multi-cause routing determinism — качественно закрыто; numeric operationalization остаётся blocker |
| 5 | Numerical minimum mutual-fit threshold | — candidate assignment; §18.1 называет условие только качественно | Gate operationalization |
| 6 | Numerical Confidence threshold | — candidate assignment; §18.1 качественно | Gate operationalization |
| 7 | Minimum critical-data completeness threshold/rule | — candidate assignment; §18.1 качественно | Gate operationalization |
| 8 | Per-feature required evidence level | `PRODUCT + AI + Chief AI Architect` — candidate/inherited context (Feature Schema открытое решение №1; источник не называет владельца для Qualification напрямую, но уже назначен для родственного вопроса в смежном Proposal) | Automatic `INELIGIBLE`/routing precision |
| 9 | Risk→routing threshold/trigger | `AI + LEGAL` — **`SOURCE_NORMATIVE` owner**, Architecture §37 №8 (наследуется, не переоткрывается Qualification Policy; ограничено именно этим порогом) | `IMPLEMENTATION_READINESS_GATE`, Qualification/Launch |
| 10 | Определение «критичности», требующей human review при conflicting evidence (§32) | **`RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-037 v1.0`**, outcome-sensitive definition (изменение Eligibility/Qualification result, hard constraint, protected/proxy/lawful-basis/legal-rights boundary или допустимости Safe Presentation/disclosure). Numeric threshold и exhaustive critical-field catalog остаются `OPEN` | Conflict-routing precision — качественно закрыто; численный threshold ещё blocker |
| 11 | Трактовка `STALE` как ортогонального состояния Match vs. пятого routing cause; точное взаимодействие с четырьмя результатами | **`RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-038 v1.0`**, orthogonal state, non-actionable historical result, disclosure blocked независимо от результата. Runtime carrier/TTL/invalidation implementation остаются `OPEN` | Disclosure-boundary consistency — качественно закрыто; runtime mechanics ещё blocker |
| 12 | Relationship/mapping/compatibility между §25.1 reasons и Qualification reasons/results; namespace/catalog owner | **`PARTIALLY_RESOLVED_BOUNDARY` — `XFR-D-039 v1.0`:** governance owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT + AI`; evidence/technical-procedure owner `AI + DEVELOPMENT` без unilateral approval. Три §25 reason namespaces остаются distinct; exact twelve §25.1 values — internal source inputs, не results/catalog/user wording; string equality не создаёт mapping; separately approved version/hash-bound mapping prerequisite, fail-closed no-guessed-route/negative/display и preservation `XFR-D-033`/`XFR-D-040` утверждены. Exact mapping/cardinality/catalog/codes/order/fallback/compatibility/carrier/data/evidence/RBAC/policy/manifest/runtime/implementation остаются `OPEN` | Mapping governance качественно частично закрыто; exact catalog/mapping/runtime design остаются blocker |
| 13 | Multi-cause output/explanation и primary-reason selection при нескольких одновременно нарушенных условиях §18.1 | **`RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-040 v1.0`**: все причины/evidence references сохраняются; primary reason — deterministic резюме из route-determining precedence-класса (`XFR-D-033`); same-class order зависит от будущего approved reason catalog. Reason-code catalog values/order остаются `OPEN` (зависит от `XFR-D-039`) | Explainability, audit alignment — качественно закрыто; catalog values/order ещё blocker |
| 14 | Exact reviewer queue/authority link для `HUMAN_REVIEW_REQUIRED` (без изменения общих правил §31.1) | **`PARTIALLY_RESOLVED_BOUNDARY` — `XFR-D-041 v1.0`:** governance/Qualification semantic owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT + AI`; evidence/technical-procedure owner `AI + DEVELOPMENT` без unilateral approval; `DEVELOPMENT` — technical queue/schema steward only. `HUMAN_REVIEW_REQUIRED` — только version-bound request, не queue item/appointment/verdict/legal outcome; future queue item — только read-only version/hash-bound к immutable bundle; queue/operator non-authority и applicable §31.1 appointment/RBAC/conflict-check/four-eyes/appeal safeguards сохранены | §31.1 применение к Qualification-specific ролям — качественно частично закрыто; production queue owner/operator, appointments, RBAC, SLA, outcomes, Decision-schema, appeal, carrier и implementation остаются blocker |
| 15 | Probabilistic/advisory component handling и replay tolerance в контексте Qualification Gate | `DEVELOPMENT + AI` — candidate assignment; §49 запрещает самостоятельное прохождение gate, но bounded tolerance — `OPEN` (эхо Risk Policy №11, Evaluation Plan №10) | Replay/determinism acceptance |
| 16 | Segment-specific Qualification policies/thresholds | — candidate assignment; источник упоминает segment thresholds только для Scoring Policy (§37 №3), не для Qualification | Segment differentiation, если потребуется |
| 17 | Version compatibility и supersession правила, специфичные для Qualification Policy (что происходит с уже выданным `QUALIFIED_HYPOTHESIS` при смене `qualification_policy_version`) | **`PARTIALLY_RESOLVED_BOUNDARY` — `XFR-D-043 v1.0`:** governance owner `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT + AI`; evidence/technical-procedure owner `DEVELOPMENT + AI` без unilateral approval. Утверждены prospective-only supersession, immutable historical result с original full version/hash bundle, current actionability только через separately approved compatible current bundle + новый calculation, fail-closed unknown/mixed/hash-mismatched compatibility без automatic `STALE`/negative fact/four-result route и отсутствие forced bumps неизменённых Feature/Scoring/Risk versions. Exact taxonomy/semver/matrix/triggers/cascade/grace/fallback/migration/recalculation/TTL/carrier/API/events/hash/RBAC/data/evidence/policy/manifest/runtime/implementation остаются `OPEN` | Version-bundle governance качественно частично закрыто; exact compatibility/lifecycle/runtime design остаются blocker |
| 18 | Safe-presentation consumption Qualification routing result | **`RESOLVED_QUALITATIVE_BOUNDARY` — `XFR-D-044 v1.0`**: Safe Presentation — read-only consumer; не пересчитывает/не повышает/не понижает/не заменяет routing result; не меняет score/rank/Confidence/Risk; `QUALIFIED_HYPOTHESIS` не auto-disclosure. Exact wording/allowlist/audience payload остаются `OPEN` (`PRODUCT + LEGAL`) | `SAFE_PRESENTATION_POLICY` boundary consistency — качественно закрыто; wording/allowlist ещё blocker |
| 19 | Evaluation metrics/acceptance evidence, необходимые для approve candidate thresholds (mutual-fit/confidence/completeness) | `AI + DEVELOPMENT` — candidate/inherited context (Evaluation Plan owner); Evaluation Plan §6.1/§6.2 покрывает Hard Constraint safety и Ranking, но не отдельную metric family для Gate-специфичных порогов mutual-fit/completeness | Threshold-search evidence completeness |
| 20 | Qualification-specific synthetic-only vs. production calibration/readiness rule | — candidate assignment, по аналогии с Risk Policy `MRP-C-013`/Evaluation Plan `MEP-C-001`, но не установленная источником буквально для Qualification | Synthetic Acceptance/Launch readiness |

---

## 16. Acceptance criteria (`MQP-C-001`–`MQP-C-020`)

#### `MQP-C-001` — ровно четыре результата, без пятого
**Given** любой routing outcome Matching Qualification Gate. **When** запрашивается набор возможных статусов. **Then** ровно четыре — `QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING`; пятый (включая `STALE`-as-status) не существует.

#### `MQP-C-002` — evidence `HUMAN_REVIEW_REQUIRED` vs Qualification `HUMAN_REVIEW_REQUIRED`
**Given** `evidence_status = HUMAN_REVIEW_REQUIRED` (§13) для одного элемента доказательства и Qualification result `HUMAN_REVIEW_REQUIRED` (§18.1) для всего Match. **When** сравниваются. **Then** остаются разными по scope (per-evidence-item vs per-Match) сущностями; совпадение строки не создаёт эквивалентность.

#### `MQP-C-003` — Eligibility `NEEDS_VERIFICATION` vs Qualification `NEEDS_VERIFICATION`
**Given** Eligibility Filter `NEEDS_VERIFICATION` (этап 3) и Qualification result `NEEDS_VERIFICATION` (этап 8). **When** сравниваются. **Then** остаются разными по scope сущностями исходно; qualitative mapping (open decision №3) теперь задан `XFR-D-032`: Eligibility `NEEDS_VERIFICATION` → Qualification `NEEDS_VERIFICATION`, если отдельная критическая причина не требует `HUMAN_REVIEW_REQUIRED`; exact runtime representation — open decision №2 / `XFR-D-031`.

#### `MQP-C-004` — unknown не negative, qualitative cross-stage mapping задан, exact runtime — open
**Given** missing/unknown evidence, оцениваемое либо на этапе 3 (Eligibility Filter, §14), либо на этапе 8 (Qualification Gate, §18.1). **When** вычисляется соответствующий результат данного этапа. **Then** ни на одном из двух этапов unknown не становится negative и не создаёт исключения; `XFR-D-032` качественно связывает Eligibility `NEEDS_VERIFICATION` с Qualification `NEEDS_VERIFICATION` (если критическая причина не требует `HUMAN_REVIEW_REQUIRED`), но exact runtime representation каждого этапа остаётся отдельной открытой границей; ни один из двух `NEEDS_VERIFICATION` не эквивалентен `REJECTED_BY_MATCHING`.

#### `MQP-C-005` — conflicting/stale отличны от unknown; критичность и ортогональность качественно заданы
**Given (часть 1)** conflicting evidence; **(часть 2)** stale profile. **When** вычисляется соответствующее поведение. **Then** ни один случай не сворачивается в unknown; conflicting сохраняет версии/снижает Confidence, human review при критичности — критичность качественно определена `XFR-D-037`; stale делает Match `STALE`, блокирует disclosure — `STALE` остаётся ортогональным Match/freshness состоянием относительно четырёх Qualification routing results (`XFR-D-038`), не является пятым result и не сворачивается в unknown — три разных source behavior, не единое routing rule (§9).

#### `MQP-C-006` — `NOT_APPLICABLE` не становится verification/rejection
**Given** hard-constraint candidate с `value_state = NOT_APPLICABLE` (constraint не выражен пользователем, Feature Schema §5.2 случай a). **When** вычисляется routing. **Then** не получает `NEEDS_VERIFICATION`/`REJECTED_BY_MATCHING`; отличается от `value_state = UNKNOWN` (constraint выражен, значение неизвестно, случай b).

#### `MQP-C-007` — blocked candidate feature не routing input
**Given** feature candidate с `registry_readiness = BLOCKED_PENDING_DECISION` (Feature Schema §3.1). **When** формируется routing decision. **Then** признак не участвует ни в каком routing-решении.

#### `MQP-C-008` — automatic Eligibility `INELIGIBLE` только при всех шести условиях; Qualification-mapping качественно задан `XFR-D-032`
**Given** Hard Constraint candidate, оцениваемый на этапе 3 (Eligibility Filter, §14, а не финальный §18.1 Qualification routing). **When** проверяется автоматический `INELIGIBLE` этого этапа. **Then** допустим только при одновременном выполнении всех шести условий §14.3; отсутствие любого даёт Eligibility Filter `NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`, не `INELIGIBLE`; отображение подтверждённого `INELIGIBLE` в Qualification `REJECTED_BY_MATCHING` качественно задано `XFR-D-032` (открытое решение №3, только при доказанных всех шести условиях); exact runtime representation остаётся `OPEN` (открытое решение №2 / `XFR-D-031`).

#### `MQP-C-009` — missing/model inference/Risk signal по отдельности не создают автоматический `REJECTED_BY_MATCHING`
**Given** только missing evidence, только model inference, или только Risk signal, без подтверждённого Hard Constraint. **When** вычисляется routing. **Then** ни один по отдельности не создаёт автоматический `REJECTED_BY_MATCHING`; по `XFR-D-055` Risk alone также не создаёт `QUALIFIED_HYPOTHESIS`, а missing/unknown/unmapped/incomplete/conflicting/stale/incompatible input не считается clean/zero/low или authorization.

#### `MQP-C-010` — `REJECTED_BY_MATCHING` отличен от process/human/user/legal outcomes и от §25.1 mapping
**Given** `REJECTED_BY_MATCHING`. **When** сравнивается с §25.2/§25.3 процессными/человеческими причинами, с §25.1 списком, с пользовательским отказом и с legal Decision Record. **Then** остаётся отдельным Qualification result (§18.1), не приравнивается автоматически ни к одному из перечисленных; `XFR-D-039` сохраняет три §25 namespaces distinct и запрещает mapping/alias по string equality, а exact mapping/catalog остаются `OPEN`; termin «algorithmic disposition» — не source-normative, только candidate interpretation (§12).

#### `MQP-C-011` — high Risk routing только по approved policies, trigger OPEN
**Given** высокий Risk. **When** формируется routing. **Then** `XFR-D-055` разрешает только provenance/version-bound read-only input и переход в `HUMAN_REVIEW_REQUIRED`/`NEEDS_VERIFICATION` по отдельно approved compatible Risk + Qualification rule; точный выбор route, mapping и численный/качественный trigger остаются `OPEN` (`XFR-D-M2`, Architecture §37 №8, owner `AI + LEGAL`).

#### `MQP-C-012` — нет invented mutual-fit/Confidence/completeness/Risk thresholds
**Given** любой раздел документа. **When** выполняется поиск численного mutual-fit/Confidence/completeness/Risk threshold, веса или TTL. **Then** ни один не найден вне явно помеченного `OPEN_BLOCKED_PENDING_DECISION`.

#### `MQP-C-013` — multiple causes сохраняются как approved qualitative rule; reason-catalog order остаётся open
**Given** несколько условий §18.1 нарушены одновременно. **When** формируется routing. **Then** сохранение всех причин и evidence references для audit/explanation утверждено `XFR-D-040` (§14, ранее кандидат №4, теперь `RESOLVED_QUALITATIVE_BOUNDARY`); primary reason выбирается детерминированно из причины, определившей route по precedence `XFR-D-033`; `XFR-D-039` не пересчитывает route, не отбрасывает causes и не выбирает same-class/catalog order — до будущего exact approval primary/user-facing reason не изобретается.

#### `MQP-C-014` — `HUMAN_REVIEW_REQUIRED` не Decision Record
**Given** `HUMAN_REVIEW_REQUIRED`. **When** сравнивается с итоговым Decision Record. **Then** routing-статус — не сам Decision Record и не итоговое legal-решение; Decision Record остаётся отдельным writer'ом Legal/Decision Service (§40); `XFR-D-041` дополнительно подтверждает, что результат не создаёт enqueue/assignment/appointment/access grant, а любой будущий queue item — только read-only, version/hash-bound к неизменяемому bundle, без изменения route/evidence/authority; exact queue/appointment/RBAC/outcome contents остаются `OPEN`.

#### `MQP-C-015` — `QUALIFIED_HYPOTHESIS` не проходит downstream gates
**Given** `QUALIFIED_HYPOTHESIS`. **When** оценивается допуск к Presentation/Participation/Payment/Previous Contact/Reveal Gate. **Then** ни один downstream gate не проходит автоматически (§13): Presentation Readiness (§18.2) — отдельная проверка, «координирует AI Manager», источник не называет её внешней; Participation (§18.3), Payment (§18.5), Introduction Record (§18.6) и Reveal (§18.7) — «внешний»; Previous Contact (§18.4) — «внешний с AI-поддержкой»; для Safe Presentation это дополнительно подтверждено `XFR-D-044` — read-only consumption, `QUALIFIED_HYPOTHESIS` лишь допускает переход к отдельной Presentation Readiness проверке, не auto-disclosure.

#### `MQP-C-016` — `STALE` блокирует disclosure и не становится пятым результатом; qualitative interaction resolved by `XFR-D-038`
**Given** Match со статусом `STALE` (§32). **When** формируется Qualification routing. **Then** disclosure остаётся заблокирован независимо от сохранённого исторического routing-результата; `STALE` не становится пятым routing статусом; ортогональная качественная семантика задана `XFR-D-038` (historical/audit-only result, non-actionable до пересчёта); runtime carrier/TTL/invalidation implementation остаются `OPEN` (открытое решение №11).

#### `MQP-C-017` — exact replay/version boundary, prospective supersession; probabilistic component advisory-only
**Given** exact deterministic replay даёт расхождение либо применимая `qualification_policy_version` supersedes исходную версию. **When** оцениваются replay и current actionability. **Then** replay mismatch остаётся severity-1 defect (§49); `XFR-D-043` запрещает mutation/relabel исторического result, требует original full version/hash bundle и отдельно approved compatible current bundle + новый calculation для current actionability; unknown/mixed/hash-mismatched compatibility fail closed без automatic `STALE` или routing result; unchanged Feature/Scoring/Risk versions не получают forced bump. Exact taxonomy/matrix/lifecycle/carrier остаются `OPEN`; недетерминированный компонент не проходит Qualification Gate самостоятельно, только advisory до human-confirmed deterministic rule.

#### `MQP-C-018` — Evaluation Plan не обновляет runtime автоматически
**Given** `MATCHING_EVALUATION_PLAN` run завершён и предлагает candidate threshold. **When** рассматривается применение к runtime Qualification rules. **Then** изменение не выполняется автоматически (§34.4).

#### `MQP-C-019` — synthetic evidence не production approval; Qualification-специфичное утверждение — candidate
**Given** synthetic-only evaluation evidence. **When** формулируется заключение о production readiness Qualification thresholds. **Then** заключение не делается; конкретно Qualification-специфичная формулировка этого правила — `DECISION_CANDIDATE_FOR_REVIEW`, поддержанная `CO-C-019`/`AS-C-019/025` и synthetic-only границами Architecture (§36, §50) как precedent, не буквальная Qualification-норма источника (согласовано с Risk Policy `MRP-C-013`, Evaluation Plan `MEP-C-001`).

#### `MQP-C-020` — proposal не авторизует implementation; три gate BLOCKED
**Given** документ существует на уровне draft со статусом `Proposal for cross-functional review — does not authorize implementation` (не `APPROVED`). **When** оценивается статус трёх gates и допустимость работы в `apps/**`. **Then** `IMPLEMENTATION_READINESS_GATE`/`SYNTHETIC_ACCEPTANCE_GATE`/`PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`; Architecture §37 №8 остаётся `OPEN`; implementation, runtime/API/schema изменения не разрешены.

---

## 17. Gates, DoD и последствия

### Итоговый статус gates

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

Architecture §37 вопрос №8 остаётся **`OPEN`**.

`XFR-D-043` закрывает только partial qualitative governance boundary строки №17; exact version compatibility/supersession lifecycle, policy/manifest approval и runtime остаются **`OPEN`**.

`XFR-D-039` закрывает только partial qualitative governance boundary строки №12; exact mapping/cardinality/catalog/codes/order/fallback/compatibility/carrier/data/evidence/RBAC/policy/manifest/runtime/implementation остаются **`OPEN`**.

`XFR-D-041` закрывает только partial qualitative governance boundary строки №14; exact queue owner/operator/lifecycle/appointments/RBAC/SLA/outcomes/Decision-schema/appeal/carrier/data/runtime/implementation остаются **`OPEN`**.

### Definition of Done

Настоящий документ:

- пригоден только для cross-functional review (AI + LEGAL + PRODUCT + DEVELOPMENT, по применимости каждого раздела);
- не закрывает Architecture §37 вопрос №8 — остаётся `OPEN`;
- не переводит `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE` в иной статус — все три `BLOCKED`;
- не синхронизирует Controlled Artifact Manifest (§52.1 Architecture) — запись `MATCHING_QUALIFICATION_POLICY` не добавляется до реального утверждения;
- не содержит ни одного численного mutual-fit/Confidence/completeness/Risk weight/threshold/TTL, ни одного runtime/algorithmic precedence/aggregation implementation, ни одного exact `§25.1 → Qualification result` mapping, ни одного public/runtime enum, field, event или reason-code каталога; шесть human-approved qualitative governance decisions (`XFR-D-032/033/037/038/040/044`) сохраняются, `XFR-D-039` разрешает только `PARTIALLY_RESOLVED_BOUNDARY` roles/namespace-separation/no-string-mapping/fail-closed semantics, `XFR-D-041` — только `PARTIALLY_RESOLVED_BOUNDARY` decision-specific roles/request-not-queue-outcome/read-only future-binding/queue-non-authority/fail-closed review-dependent semantics, `XFR-D-043` — только prospective supersession/immutable-history/current-compatible-bundle/fail-closed semantics, а `XFR-D-055` — только Risk→Qualification governance/read-only/fail-closed semantics; exact taxonomy/matrix/lifecycle/trigger/mapping, values/catalog order, queue/appointment/RBAC/outcome contents, runtime carrier и implementation остаются `OPEN`;
- отражает human governance assignment `XFR-D-030`, responsibility boundary `XFR-D-031`, шесть qualitative semantics decisions `XFR-D-032/033/037/038/040/044` и partial boundaries `XFR-D-039`/`XFR-D-041`/`XFR-D-043`/`XFR-D-055`, но не утверждает сам Proposal, sibling Proposals, `XFR-D-M2`, exact compatibility/mapping или runtime representation;
- не использует orphaned `GateState` как Qualification carrier ни в каком виде;
- не ослабляет protected/proxy prohibition Architecture §17 ни в каком виде;
- не разрешает и не инициирует implementation, runtime/API/schema changes, model release, реальные данные или production launch;
- не изменяет ни один существующий файл, включая Architecture, Data Contracts, Feature Schema, Evaluation Plan, Risk Policy, CAMPAIGN_OUTCOMES, ANALYSIS_SNAPSHOT, controlled-set artifacts, любой PR.
