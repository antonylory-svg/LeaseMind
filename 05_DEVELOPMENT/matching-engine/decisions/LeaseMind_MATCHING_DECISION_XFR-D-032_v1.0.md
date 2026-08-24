# LeaseMind Matching Decision Record — XFR-D-032

**Decision ID:** `XFR-D-032`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED QUALITATIVE MAPPING — runtime representation and numeric thresholds remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`, `XFR-D-031 v1.0`

## 1. Вопрос

Как результаты Eligibility Filter отображаются в один из четырёх результатов Matching Qualification Gate?

## 2. Решение

Eligibility Filter и Matching Qualification Gate остаются разными этапами и разными пространствами имён. Утверждается однонаправленная качественная семантика:

- Eligibility `INELIGIBLE` → Qualification `REJECTED_BY_MATCHING`, только если доказаны и сохранены все шесть условий автоматического `INELIGIBLE` из Architecture §14;
- Eligibility `ELIGIBLE` разрешает продолжить расчёт, но не означает автоматически `QUALIFIED_HYPOTHESIS`;
- Eligibility `NEEDS_VERIFICATION` → Qualification `NEEDS_VERIFICATION`, если отдельная критическая причина не требует `HUMAN_REVIEW_REQUIRED`; этот результат сам по себе никогда не ведёт к rejection;
- Eligibility-stage `HUMAN_REVIEW_REQUIRED`, когда он возвращён по source fallback, → Qualification `HUMAN_REVIEW_REQUIRED`.

## 3. Authority boundary

Это policy-semantic mapping. Он не объединяет одноимённые значения в один runtime enum, field или transport carrier. Exact representation остаётся в границе `XFR-D-031` и отдельного downstream design.

## 4. Fail-closed правила

- отсутствие любого из шести условий §14 запрещает mapping в `REJECTED_BY_MATCHING`;
- missing/unknown не считается отрицательным фактом;
- Risk Score, model inference, correlation или отсутствие данных сами по себе не создают rejection;
- `ELIGIBLE` не обходит остальные условия Qualification Gate §18.1.

## 5. Rationale

Mapping делает последовательность этапов операционально однозначной, сохраняя source-normative namespace separation и запрет компенсировать недоказанность автоматическим исключением.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №3 и связанные acceptance criteria;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-032`;
- будущий runtime/Data Contracts design — обязан реализовать mapping без слияния пространств имён.

## 7. Не утверждено

Numeric thresholds, runtime enum/field, API/event/schema, reason codes и implementation authorization не утверждены.

## 8. Change control

Изменение qualitative mapping или его fail-closed boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Итог

`XFR-D-032 QUALITATIVE MAPPING APPROVED — RUNTIME DESIGN OPEN`
