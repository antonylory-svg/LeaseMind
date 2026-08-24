# LeaseMind Matching Decision Record — XFR-D-038

**Decision ID:** `XFR-D-038`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED ORTHOGONAL STALE SEMANTICS — runtime representation remains OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`, `XFR-D-031 v1.0`

## 1. Вопрос

Как `STALE` взаимодействует с четырьмя Qualification results?

## 2. Решение

- `STALE` остаётся ортогональным Match/freshness state.
- `STALE` не является пятым Qualification result.
- `STALE` не преобразуется автоматически в Qualification `NEEDS_VERIFICATION`.
- Последний четырёхсостояний Qualification result может сохраняться только как historical/audit result вместе с исходными profile/policy versions.
- Stale расчёт не является текущим actionable routing и не используется для Safe Presentation, Reveal или другого downstream-действия.
- Для получения текущего actionable результата требуется пересчёт на актуальных profile/policy versions.

## 3. Disclosure boundary

Disclosure по stale Match запрещён независимо от сохранённого исторического Qualification result. Ревалидация presentation без нового актуального расчёта не делает routing actionable.

## 4. Namespace boundary

Решение не добавляет новый routing result и не объединяет freshness с Qualification namespace. Exact runtime carrier/actionability representation остаётся отдельным downstream design.

## 5. Rationale

Ортогональная модель сохраняет ровно четыре source-normative результата, делает устаревшее решение неоперациональным и предотвращает потерю audit history.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №11 и `MQP-C-016`;
- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — stale consumption/cache boundary;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-038`.

## 7. Не утверждено

Runtime field, enum, event, storage model, TTL, invalidation implementation и implementation authorization не утверждены.

## 8. Change control

Изменение orthogonal `STALE` semantics, actionability или disclosure boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Итог

`XFR-D-038 ORTHOGONAL STALE SEMANTICS APPROVED — RUNTIME DESIGN OPEN`
