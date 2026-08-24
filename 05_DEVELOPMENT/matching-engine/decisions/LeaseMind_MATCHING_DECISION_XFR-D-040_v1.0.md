# LeaseMind Matching Decision Record — XFR-D-040

**Decision ID:** `XFR-D-040`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED MULTI-CAUSE AND PRIMARY-REASON RULE — reason catalog remains OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

**Depends on:** `XFR-D-030 v1.0`, `XFR-D-033 v1.0`

## 1. Вопрос

Как сохраняются несколько одновременных причин и как выбирается primary reason?

## 2. Решение

- Все одновременно применимые machine-readable причины и evidence references сохраняются для audit/explanation.
- Primary reason является только детерминированным резюме и не удаляет, не заменяет и не скрывает остальные причины.
- Primary reason выбирается из причины, определившей итоговый route по precedence `XFR-D-033`.
- Если в одном precedence-классе несколько причин, используется порядок будущего approved versioned reason catalog.
- Пока catalog и его порядок не утверждены, система не изобретает primary reason: полный multi-cause result сохраняется, а user-facing reason блокируется либо ограничивается заранее утверждённой общей формулировкой.

## 3. Determinism boundary

Порядок обнаружения, SQL row order, порядок асинхронной обработки или свободный выбор caller не могут определять primary reason.

## 4. Presentation boundary

Safe Presentation получает только approved safe reason references. Raw evidence, internal cause details и свободный текст не становятся user-facing объяснением автоматически.

## 5. Rationale

Полный набор причин нужен для аудита и replay, а versioned policy order предотвращает недетерминированный выбор primary reason. Fail-closed поведение до утверждения каталога исключает придуманные коды и тексты.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — open decision №13, candidate №4 и `MQP-C-013`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-040`;
- `XFR-D-039` и `XFR-D-077` остаются отдельными зависимостями для catalog/namespace и user-facing localization.

## 7. Не утверждено

Reason-code values, catalog order, catalog owner/change control, localized wording, runtime carrier и implementation authorization не утверждены.

## 8. Change control

Изменение multi-cause preservation или primary-reason selection rule требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Итог

`XFR-D-040 MULTI-CAUSE RULE APPROVED — REASON CATALOG OPEN`
