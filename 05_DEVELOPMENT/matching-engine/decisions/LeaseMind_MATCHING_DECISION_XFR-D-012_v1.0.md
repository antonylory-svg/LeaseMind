# LeaseMind Matching Decision Record — XFR-D-012

**Decision ID:** `XFR-D-012`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED PARTIAL RULE — wildcard-unrestricted behavior and land-derived NOT_APPLICABLE resolved; exact wildcard value_state and numeric convention remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT + DEVELOPMENT`

## 1. Вопрос

Как `property_floor` (при необходимости — совместно с `property_total_floors`) сопоставляется с request-side enum `floor_option` (Feature Schema open decision №15, признак `floor_option_fit`, №20 реестра §5.1)?

## 2. Решение

Утверждаются ровно два узких правила:

- **Wildcard.** Если `request_floor_options = [any]`, raw request-значение присутствует и означает unrestricted floor constraint: floor-comparison не выполняется, и floor-признак не препятствует совместимости независимо от значения `property_floor`, включая случай, когда `property_floor` отсутствует. Это не создаёт `PASS`, `FAIL`, положительного evidence или Qualification routing результата и не разрешает пропускать какие-либо другие hard constraints — `any` затрагивает исключительно floor-comparison. Это решение **не присваивает** wildcard-случаю derived floor-feature `value_state` — wildcard не называется `NOT_APPLICABLE` и не приравнивается к land-derived случаю ниже; exact derived `value_state`/candidate runtime representation для wildcard остаётся `OPEN_BLOCKED_PENDING_DECISION`.
- **Land-derived `NOT_APPLICABLE`.** Если `property_type = land`, обязательный (по source-правилу `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §7.4) `property_floor = null` классифицируется для floor-признака как property-side `value_state = NOT_APPLICABLE`, а не как `UNKNOWN` — это структурное отсутствие применимости (объект не имеет этажности по своему типу), а не недостающие данные.

Полная numeric-to-category convention для `basement`/`semi_basement`/`ground`/`first`/`upper` этим решением **не утверждается** и остаётся `registry_readiness = BLOCKED_PENDING_DECISION` — источник не задаёт ни одной строки, устанавливающей соответствие integer-значений `property_floor` этим пяти категориям.

## 3. Non-invention boundary

Никакая numeric convention (включая любые иллюстративные пороги вида `<0`, `0`, `1`, `≥2`) этим документом не вводится и не подразумевается даже как черновик для обсуждения. Никакое новое PRODUCT-поле не вводится: `property_floor` и `property_total_floors` уже существуют в источнике; недостаёт исключительно будущей PRODUCT-интерпретирующей таблицы поверх уже существующих полей.

## 4. Fail-closed правила

- **Wildcard.** `request_floor_options = [any]` не блокирует и не создаёт `PASS` пары: floor-признак не препятствует совместимости, но это не `PASS`, не `FAIL`, не положительное evidence и не Qualification routing результат; derived `value_state` для этого случая этой записью не присваивается и не называется `NOT_APPLICABLE` — остаётся `OPEN_BLOCKED_PENDING_DECISION` (candidate/runtime representation);
- **Land.** Floor-признак при `property_type = land` получает `value_state = NOT_APPLICABLE`; `NOT_APPLICABLE` не равнозначен `PASS` или положительному evidence и не присваивает и не влияет на Qualification routing результат;
- `property_type` hard-fit (`property_type_membership`, №1 реестра §5.1) продолжает оцениваться независимо от floor-признака и не может быть скрыт или заменён ни wildcard-случаем, ни land `NOT_APPLICABLE`;
- request `floor_options` не задан (и не равен `[any]`) → `value_state = NOT_APPLICABLE` по общему правилу case (a);
- request задан не как `[any]`, property `floor` отсутствует и `property_type ≠ land` → `value_state = UNKNOWN` (case b) — недоказуемо, не `NOT_APPLICABLE`;
- automatic `INELIGIBLE` не разрешается для floor-признака ни в одном из этих случаев.

## 5. Authority boundary

CTA §8.4 правило 3 (`any` нельзя сочетать с другими значениями `floor_option`) и CTA §7.4 правило 5 (для `property_type=land` `floor`/`total_floors`/`ceiling_height`/`entrance_type` MUST быть `null`) — оба source facts; ни один сам по себе не формулирует Feature Schema value_state-семантику.

**Wildcard-правило** — human-approved governance interpretation CTA §8.4(3) в рамках applicability discipline Feature Schema: raw `[any]` присутствует и означает unrestricted/non-restrictive floor constraint. Это **не** mapping на конкретное значение `value_state` — exact derived `value_state` для wildcard-случая этой записью не назначается и остаётся open.

**Land-правило** — отдельный human-approved governance mapping CTA §7.4(5) на конкретный Feature Schema candidate `value_state = NOT_APPLICABLE` — структурное отсутствие применимости floor-признака для объектов типа `land`.

Ни wildcard-, ни land-интерпретация не являются буквальной source value-state нормой: CTA нигде не использует термины `unrestricted`/`NOT_APPLICABLE`/floor-comparison-семантику — это словарь Feature Schema, применённый здесь governance-решением к CTA-фактам. Ни одна из двух интерпретаций не требует изобретения численной floor-конвенции. Основная содержательная часть decision №15 (сопоставление конкретных integer-значений категориям) остаётся заблокированной именно потому, что source не даёт для неё никакой опоры.

## 6. Rationale

Land-правило резолвится как governance mapping буквального текста CTA §7.4(5) на существующую value_state-таксономию Feature Schema (`NOT_APPLICABLE`). Wildcard-правило резолвится как governance-интерпретация буквального текста CTA §8.4(3) в рамках applicability discipline — фиксирует поведенческий эффект (`[any]` не ограничивает совместимость), но не выбирает и не подставляет никакое конкретное значение `value_state`. Ни одна интерпретация не требует угадывания того, что source не раскрывает, и не изобретает численную floor-конвенцию. Основная numeric-конвенция и exact derived wildcard `value_state` — оба остаются отдельными open вопросами (§9), не резолвятся этим документом; будущий PRODUCT/DEVELOPMENT input по каждому из них этот документ не подменяет.

## 7. Затронутые артефакты

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — open decision №15, `floor_option_fit` (№20, §5.1), §5.2 missing-data rule;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-012`.

## 8. Не утверждено

Numeric-to-category convention для `basement`/`semi_basement`/`ground`/`first`/`upper` (включая любые иллюстративные пороги), exact derived `value_state`/candidate runtime representation для wildcard-случая (`request_floor_options = [any]`), новое PRODUCT-поле, `required_evidence_level`, runtime/API/DB/schema design, reason-code values и implementation authorization — не утверждены. Feature Schema Proposal не переводится в `APPROVED`.

## 9. Change control

Изменение утверждённых wildcard-unrestricted или land-derived `NOT_APPLICABLE` behavioral rules требует нового versioned decision record, согласованного как минимум `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

Два независимых open follow-up, ни один не требует другого как prerequisite:

1. numeric-to-category convention для `basement`/`semi_basement`/`ground`/`first`/`upper`;
2. exact derived wildcard `value_state`/candidate runtime representation.

Каждый из них может быть утверждён отдельным versioned decision record, ссылающимся на `XFR-D-012` как dependency/extension; `supersedes XFR-D-012` требуется только если такой record также изменяет уже утверждённые wildcard-unrestricted или land-derived `NOT_APPLICABLE` behavioral rules. Applicable authority/mandatory reviewers для каждого follow-up определяются отдельно, по своему governing source — единый owner/approver set для обоих не вводится. Cross-functional approval clause применяется к изменению уже утверждённых правил и не превращает approvers в artifact owner.

## 10. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 11. Итог

`XFR-D-012 PARTIAL RULE APPROVED — NUMERIC-TO-CATEGORY CONVENTION AND EXACT WILDCARD VALUE_STATE REMAIN OPEN`
