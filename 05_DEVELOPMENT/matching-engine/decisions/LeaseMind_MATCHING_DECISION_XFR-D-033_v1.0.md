# LeaseMind Matching Decision Record — XFR-D-033

**Decision ID:** `XFR-D-033`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED QUALITATIVE PRECEDENCE — numeric thresholds and reason catalog remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`, `XFR-D-032 v1.0`

## 1. Вопрос

Как определяется один Qualification result при нескольких одновременно применимых причинах?

## 2. Решение

Утверждается детерминированная fail-closed иерархия:

1. Подтверждённый Eligibility `INELIGIBLE` с полным шестичастным доказательством → `REJECTED_BY_MATCHING`.
2. Любая обязательная human-review причина — критический конфликт, критический неразрешённый риск либо legal/rights ambiguity — → `HUMAN_REVIEW_REQUIRED`, если нет уже подтверждённого `INELIGIBLE`.
3. Любая неразрешённая необходимость проверки, missing/unknown или недостаточная доказательность → `NEEDS_VERIFICATION`, если нет причины более высокого уровня.
4. `QUALIFIED_HYPOTHESIS` допустим только при отсутствии трёх предыдущих классов и выполнении всех качественных условий Architecture §18.1.
5. `STALE` не участвует в этой иерархии как routing result; его ортогональная семантика задана `XFR-D-038`.

## 3. Non-compensation boundary

Score, rank, Confidence или иной более благоприятный показатель не компенсирует подтверждённый hard-constraint failure, обязательный human review либо отсутствие необходимой проверки.

## 4. Multi-cause boundary

Precedence выбирает итоговый route, но не удаляет остальные применимые причины. Их сохранение и primary-reason rule определены `XFR-D-040`.

## 5. Rationale

Иерархия следует порядку source stages и сохраняет unknown≠negative, human oversight и non-compensation без изобретения severity score или численных cutoffs.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №4, candidate precedence и acceptance criteria;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-033`.

## 7. Не утверждено

Numeric thresholds, ordinal severity registry, exact reason catalog/order, runtime algorithm representation и implementation authorization не утверждены.

## 8. Change control

Изменение qualitative precedence или non-compensation boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Итог

`XFR-D-033 QUALITATIVE PRECEDENCE APPROVED — NUMERIC AND CATALOG DEPENDENCIES OPEN`
