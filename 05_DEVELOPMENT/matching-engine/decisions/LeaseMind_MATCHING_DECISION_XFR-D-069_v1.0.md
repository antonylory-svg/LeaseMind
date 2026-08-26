# LeaseMind Matching Decision Record — XFR-D-069

**Decision ID:** `XFR-D-069`

**Название:** Evaluation terminology boundary for `unknown` and `abstention`

**Версия:** 1.0

**Дата решения:** 2026-08-26

**Decision status:** `APPROVED`

**Статус:** `APPROVED QUALITATIVE TERMINOLOGY BOUNDARY — exact runtime representation and numeric triggers remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-26 working session

**Repository baseline:** `53ca730ae02fda3b156bac633e9b4ae69ec3145f`

**Scope:** evaluation/governance terminology only; does not introduce runtime enums, statuses, fields, reason codes, thresholds, API/DB/schema/event design or implementation authorization.

**Owner:** `AI + DEVELOPMENT` — approved governance assignment этого record'а, согласованная с `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §11, решение №15. Evaluation Plan является Proposal; это не claim, что Architecture уже задаёт именно этот terminology contract.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Depends on:** нет prerequisite decision records. Любое mapping на canonical runtime states или Qualification routing остаётся отдельным решением.

---

## 1. Вопрос

Как единообразно различать `unknown` и `abstention` в evaluation diagnostics, не создавая новый runtime enum и не смешивая их с evidence status, value state, Qualification result или отрицательной меткой?

## 2. Решение

1. **`unknown` — состояние знания о факте/label.** В этом governance vocabulary `unknown` означает, что требуемое значение, факт или label невозможно определить из доступного eligible evidence на рассматриваемый момент.
2. **`abstention` — действие/диспозиция evaluator.** `abstention` означает, что evaluator/model/procedure намеренно не выдаёт запрошенную classification/prediction/decision, потому что approved applicability или evidence-sufficiency conditions не выполнены.
3. **Ортогональность.** `unknown` описывает предмет знания; `abstention` описывает поведение evaluator. Они могут встречаться вместе, но ни один термин не является синонимом или обязательным следствием другого.
4. **Не negative.** Ни `unknown`, ни `abstention` не интерпретируются как negative fit, failed outcome, zero score, rejection или отсутствие события.
5. **Не канонические runtime tokens.** Lowercase terms в этом record — governance concepts. Они не добавляют значения в canonical `value_state`, `evidence_status`, label-quality statuses, Qualification results или Gate states.
6. **Не схлопывать соседние состояния.** `DISPUTED`, `INCONCLUSIVE`, `STALE`, `CONFLICTING`, `REJECTED`, missing evidence и out-of-scope остаются самостоятельными понятиями. Их возможное влияние на abstention определяется будущей approved policy; автоматическое mapping не вводится.
7. **Раздельная отчётность.** Evaluation report не объединяет unknown facts/labels и abstained outputs в одну недифференцированную метрику. Counts/rates, если они применимы, указываются раздельно и с denominator/policy version.
8. **No silent fallback.** Если procedure требует output, но approved abstention rule или mapping отсутствует, система не изобретает local status и не подставляет negative/default value; затронутый расчёт fail closed.
9. **Routing boundary.** `abstention` не является пятым Qualification result и само по себе не присваивает `QUALIFIED_HYPOTHESIS`, `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED` или `REJECTED_BY_MATCHING`.
10. **Presentation boundary.** Эти internal evaluation concepts не становятся user-facing wording автоматически; Safe Presentation требует отдельного approved mapping/localization.

## 3. Examples

| Ситуация | `unknown` | `abstention` | Комментарий |
|---|---:|---:|---|
| Eligible evidence не содержит требуемого факта | Да | Возможно | Procedure может abstain, но это отдельное решение |
| Evidence существует, но конфликтует | Не переименовывается автоматически в unknown | Возможно | `CONFLICTING`/`DISPUTED` сохраняются самостоятельно |
| Fact известен, но case out-of-scope для evaluator | Нет | Да | Abstention не означает неизвестность факта |
| Model confidence ниже будущего approved threshold | Не обязательно | Возможно | Сам threshold этим record'ом не вводится |
| Process failure | Нет автоматического mapping | Нет автоматического legitimate abstention | Process failure не превращается в negative label или policy-approved abstention |

## 4. Что остаётся `OPEN`

- canonical runtime representation и mapping на существующие enums/states;
- exact abstention triggers, evidence sufficiency и численные thresholds;
- reason-code/catalog values и user-facing wording;
- metric definitions, denominators и acceptable targets;
- mapping abstention на Qualification routing или Safe Presentation;
- API/DB/schema/event/manifest carrier;
- implementation и operational monitoring.

## 5. Rationale

Разведение knowledge state и evaluator action предотвращает две системные ошибки: превращение missing/uncertain evidence в negative label и превращение отказа процедуры выдать результат в утверждение о факте. Одновременно terminology boundary остаётся независимой от runtime design и не расширяет существующие canonical enums.

## 6. Adversarial cases

1. **Unknown → false.** Missing fact преобразуется в boolean `false`. Запрещено: unknown не negative.
2. **Abstention → rejected.** Model abstains, а pipeline записывает Qualification rejection. Запрещено без отдельного routing decision.
3. **Conflict masking.** `CONFLICTING` переименовывается в unknown и теряет provenance. Запрещено: исходное состояние сохраняется.
4. **Metric conflation.** Report публикует единый `unknown_or_abstained_rate`. Запрещено без раздельных counts, denominators и approved aggregation.
5. **Process crash as abstention.** Technical failure учитывается как корректная model abstention. Запрещено: operational failure и policy-approved abstention различны.
6. **New enum by documentation.** Implementer добавляет `ABSTAINED` в runtime schema, ссылаясь на этот record. Запрещено: exact representation остаётся `OPEN`.

## 7. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §5.5, §6.4, §11 решение №15 и `MEP-C-010`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-069`;
- будущие runtime/reporting contracts — только после отдельных решений, не создаются этим record'ом.

## 8. Change control

Изменение qualitative terminology boundary `unknown`/`abstention` требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 10. Acceptance criteria

1. **Given** required fact нельзя определить из eligible evidence, **when** формируется evaluation record, **then** он не превращается в negative/default value.
2. **Given** evaluator намеренно не выдаёт output по approved rule, **when** формируется report, **then** это учитывается как abstention, а не как unknown fact или Qualification result.
3. **Given** fact известен, но evaluator out-of-scope, **when** output отсутствует, **then** abstention не изменяет известность fact.
4. **Given** `DISPUTED`, `INCONCLUSIVE`, `STALE` или `CONFLICTING`, **when** применяется terminology, **then** ни одно состояние не переименовывается автоматически в `unknown`.
5. **Given** этот record, **when** проверяются canonical enums и Qualification results, **then** новые значения не добавлены.
6. **Given** exact triggers, thresholds, runtime carrier и routing mapping, **when** проверяется их статус, **then** все остаются `OPEN`.

## 11. Итог

`XFR-D-069 UNKNOWN/ABSTENTION QUALITATIVE TERMINOLOGY BOUNDARY APPROVED — RUNTIME REPRESENTATION, TRIGGERS AND ROUTING REMAIN OPEN`
