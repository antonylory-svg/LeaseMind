# LeaseMind Matching Decision Record — XFR-D-013

**Decision ID:** `XFR-D-013`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED QUALITATIVE MISMATCH RULE — exact runtime representation and future numeric field remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT`; `DEVELOPMENT` — consulted/informational for implementability, not a separate policy owner of this decision

**Depends on:** `XFR-D-032 v1.0`, `XFR-D-033 v1.0`

## 1. Вопрос

Как интерпретируется рассогласование `property_operating_expenses_included` / `request_budget_includes_operating_expenses` для `budget_fit` (№3) и `rent_rate_fit` (№4) (Feature Schema open decision №16, §5.3)?

## 2. Решение

- Одинаковый basis (`true`/`true` либо `false`/`false`) сохраняет обычное сравнение `rent ≤ budget_max` по действующей Feature Schema §5.3 semantics — не переоткрывается этим решением.
- Несовпадающий basis (`true`/`false` либо `false`/`true`) → `value_state = UNKNOWN`, calculation blocked. Comparison не выполняется; `PASS`/`FAIL` не присваивается.
- Downstream используется существующий missing/unknown Qualification path: `NEEDS_VERIFICATION`, если отдельная критическая причина не требует `HUMAN_REVIEW_REQUIRED` (согласовано с `XFR-D-032`/`XFR-D-033`, `MATCHING_QUALIFICATION_POLICY`).

## 3. Non-invention boundary

Mismatch не является automatic pass, automatic fail, hard incompatibility или rejection. Числовая сумма эксплуатационных расходов не изобретается ни в каком виде; номинальное сравнение rent/budget по несогласованному basis не выполняется. Возможное будущее числовое поле суммы расходов остаётся отдельным, не начатым здесь `OPEN` follow-up — вне scope этой записи и вне Wave 2B.

## 4. Fail-closed правила

- automatic `INELIGIBLE` не разрешается для `budget_fit`/`rent_rate_fit` ни при каком basis-исходе;
- unknown не считается отрицательным фактом — routing строго через missing/unknown path, не через exclusion;
- exact runtime representation значения `UNKNOWN` для этого конкретного правила остаётся `OPEN_BLOCKED_PENDING_DECISION`.

## 5. Authority boundary

Правило — отдельное human-approved qualitative governance decision для вопроса, который Feature Schema §5.3 оставляет `registry_readiness = BLOCKED_PENDING_DECISION`. Tracked `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` этим record'ом и этим pass не редактируется и не синхронизируется — до отдельного policy-sync tracked Proposal продолжает буквально содержать прежний design-time blocked status §5.3. Отдельный будущий sync может отразить это governance decision в тексте Feature Schema, но сам по себе такой sync не является implementation authorization. Это governance rule должно управлять будущим runtime behavior только после отдельной implementation authorization и фактической реализации. Эта запись сама не разрешает implementation и не описывает уже существующее поведение системы; exact runtime representation остаётся open.

## 6. Rationale

Из четырёх рассмотренных вариантов (строгий automatic fail, optimistic pass, `UNKNOWN`/calculation blocked, новое числовое поле) только `UNKNOWN`/blocked не создаёт ни false pass, ни false exclusion и не требует изобретения суммы расходов — соответствует Architecture-принципу «неизвестное не считается отрицательным» (§5 принцип 7) и сквозной unknown≠negative дисциплине, уже применённой в Wave 1/2A decisions.

## 7. Затронутые артефакты

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — open decision №16, §5.3 (`budget_fit`/`rent_rate_fit` basis mismatch);
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-013`.

## 8. Не утверждено

Числовая сумма эксплуатационных расходов, новое PRODUCT/Data Contracts-поле, exact runtime representation `value_state = UNKNOWN` для этого правила, numeric thresholds, runtime/API/DB/schema design, reason-code values и implementation authorization — не утверждены. Feature Schema Proposal не переводится в `APPROVED`.

## 9. Change control

Изменение утверждённого qualitative mismatch fallback rule требует нового versioned decision record, согласованного как минимум `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись. Введение будущего числового поля суммы эксплуатационных расходов — отдельный downstream decision; он обязан `supersede` эту запись только если фактически меняет утверждённый здесь mismatch fallback (а не просто расширяет доступные данные, оставляя fallback валидным резервным поведением). Эта cross-functional approval clause не превращает всех approvers в artifact owner.

## 10. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 11. Итог

`XFR-D-013 QUALITATIVE MISMATCH RULE APPROVED — RUNTIME REPRESENTATION AND NUMERIC FIELD REMAIN OPEN`
