# LeaseMind Matching Decision Record — XFR-D-044

**Decision ID:** `XFR-D-044`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED SAFE PRESENTATION CONSUMPTION BOUNDARY — wording and allowlist remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`, `XFR-D-031 v1.0`, `XFR-D-038 v1.0`, `XFR-D-040 v1.0`

## 1. Вопрос

Как Safe Presentation потребляет Qualification routing result?

## 2. Решение

Safe Presentation является read-only policy consumer:

- получает утверждённый Qualification result, freshness/actionability context и только approved safe reason references;
- может локализовать, обобщать, редактировать либо полностью скрывать представление;
- не может пересчитать, повысить, понизить или заменить Qualification result;
- не может менять score, rank, Confidence или Risk;
- не получает права раскрывать raw evidence или candidate details вне approved presentation allowlist.

## 3. Result-specific boundary

- `QUALIFIED_HYPOTHESIS` лишь допускает переход к отдельной Presentation Readiness проверке; это не автоматическое раскрытие.
- `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED` и `REJECTED_BY_MATCHING` могут быть представлены только безопасным общим статусом или следующим действием, без candidate details и raw evidence.
- `STALE` блокирует использование ранее созданного presentation до актуального пересчёта.
- Если presentation safety запрещает показ, underlying Qualification result не изменяется.

## 4. Ownership boundary

Qualification semantic owner владеет routing result. `PRODUCT + LEGAL` владеют отдельными решениями по exact wording, allowlist и audience/purpose presentation. Presentation policy не становится владельцем Qualification semantics.

## 5. Rationale

Read-only consumption сохраняет единственный источник routing truth, не смешивает Qualification и presentation readiness и применяет fail-closed data-minimization boundary.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №18;
- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — Qualification consumption boundary и related acceptance criteria;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-044`.

## 7. Не утверждено

Exact wording, field/object allowlist, reason catalog, audience-specific payload, runtime/API schema и implementation authorization не утверждены.

## 8. Change control

Изменение Safe Presentation consumption, routing immutability или disclosure boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Итог

`XFR-D-044 SAFE PRESENTATION CONSUMPTION BOUNDARY APPROVED — PRESENTATION DESIGN OPEN`
