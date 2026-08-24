# LeaseMind Matching Decision Record — XFR-D-037

**Decision ID:** `XFR-D-037`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED QUALITATIVE CONFLICT CRITICALITY — no numeric threshold approved`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`, `XFR-D-033 v1.0`

## 1. Вопрос

Когда conflicting evidence является критическим и требует human review?

## 2. Решение

Конфликт является критическим, если выбор любой из сохранённых конфликтующих версий способен изменить хотя бы одно из следующего:

- Eligibility result;
- один из четырёх Qualification results;
- соблюдение hard constraint или обязательного условия Architecture §18.1;
- protected-attribute/proxy, lawful-basis, authority или иную legal/rights boundary;
- допустимость Safe Presentation или последующего disclosure.

Критический конфликт требует `HUMAN_REVIEW_REQUIRED` согласно precedence `XFR-D-033`.

## 3. Некритический конфликт

Некритический конфликт:

- всё равно сохраняется со всеми версиями и evidence references;
- снижает Confidence;
- не считается отрицательным фактом;
- сам по себе не создаёт automatic rejection;
- оценивается дальше по утверждённым правилам Confidence, completeness и verification.

## 4. Authority boundary

Это outcome-sensitive qualitative definition. Она не создаёт фиксированный список critical fields, численный severity threshold или runtime classifier.

## 5. Rationale

Определение связывает критичность с возможным изменением решения или правовой/disclosure границы и избегает произвольной численной шкалы без evaluation evidence.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №10 и conflicting-evidence semantics;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-037`;
- будущий versioned critical-field registry может конкретизировать правило, но не ослаблять его.

## 7. Не утверждено

Numeric threshold, exhaustive critical-field catalog, runtime schema и implementation authorization не утверждены.

## 8. Change control

Изменение определения critical conflicting evidence или его human-review boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Итог

`XFR-D-037 QUALITATIVE CRITICALITY APPROVED — NUMERIC THRESHOLD OPEN`
