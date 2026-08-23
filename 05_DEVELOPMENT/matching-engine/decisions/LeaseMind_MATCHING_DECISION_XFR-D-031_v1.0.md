# LeaseMind Matching Decision Record — XFR-D-031

**Decision ID:** `XFR-D-031`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED RESPONSIBILITY BOUNDARY — exact runtime representation remains OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`

## 1. Вопрос

Кто владеет semantic decision и технической реализацией exact runtime representation четырёх Qualification results?

## 2. Решение

Ответственность разделяется:

- **Semantic owner:** artifact owner `MATCHING_QUALIFICATION_POLICY`, утверждённый `XFR-D-030`, то есть `Chief AI Architect + PRODUCT`.
- **Technical schema steward / carrier implementation owner:** `DEVELOPMENT`.
- **Architecture and replay review:** обязательный review Chief AI Architect.
- **LEGAL review:** обязателен, если изменение затрагивает rights-affecting routing semantics, human-review или disclosure boundary.

Exact field, enum, carrier, API/event representation и compatibility strategy этим record не выбираются и остаются `OPEN_BLOCKED_PENDING_DECISION`.

## 3. Authority boundary

Semantic owner определяет смысл четырёх source-normative результатов:

- `QUALIFIED_HYPOTHESIS`;
- `NEEDS_VERIFICATION`;
- `HUMAN_REVIEW_REQUIRED`;
- `REJECTED_BY_MATCHING`.

`DEVELOPMENT` проектирует versioned carrier и обеспечивает schema compatibility, serialization, validation, migration и replay, но не может единолично менять смысл результатов.

## 4. Запрещённые conflations

- orphaned `GateState` из Data Contracts v1.0 не переиспользуется автоматически;
- schema stewardship не означает policy ownership;
- выбор transport/field name не может неявно добавить пятый routing result;
- runtime representation не утверждается до отдельного design record и проверки Data Contracts;
- этот record не разрешает runtime/API/schema изменения.

## 5. Rationale

Разделение сохраняет policy accountability у владельца Qualification semantics и отдаёт реализацию техническому владельцу. Это предотвращает ситуацию, когда форма schema незаметно меняет бизнес-смысл routing.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №2 должен быть уточнён: responsibility boundary решена, representation design остаётся open;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — `XFR-D-031` получает partial-decision status и ссылку на этот record;
- будущий Data Contracts/runtime ADR — должен ссылаться на этот record и выбрать exact representation.

## 7. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 8. Change control

Изменение responsibility split требует согласования `Chief AI Architect + PRODUCT + DEVELOPMENT`, а при rights/disclosure impact также `LEGAL`, с новым record и `supersedes` ссылкой.

## 9. Итог

`XFR-D-031 RESPONSIBILITY BOUNDARY APPROVED — REPRESENTATION DESIGN OPEN`
