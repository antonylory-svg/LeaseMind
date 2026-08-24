# LeaseMind Matching Decision Record — XFR-D-002

**Decision ID:** `XFR-D-002`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED PARTIAL QUALITATIVE COMPATIBILITY — 13 of 16 pairs remain OPEN; ordering hypothesis, by_agreement strength and runtime representation not authorized`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT + DEVELOPMENT`

## 1. Вопрос

Как соотносятся значения общего enum `access_mode` между Property и TenantRequest (Feature Schema open decision №3, признак `access_mode_hard_fit`, №15 реестра §5.1)?

## 2. Решение

Утверждается максимально консервативный baseline `A′` — качественная compatibility только по строгому равенству:

| Property \ Request | `business_hours` | `extended_hours` | `access_24_7` | `by_agreement` |
|---|---|---|---|---|
| `business_hours` | `COMPATIBLE` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` |
| `extended_hours` | `NEEDS_VERIFICATION` | `COMPATIBLE` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` |
| `access_24_7` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` | `COMPATIBLE` | `NEEDS_VERIFICATION` |
| `by_agreement` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` |

3 `COMPATIBLE` (строгое равенство `business_hours`/`extended_hours`/`access_24_7`), 0 `INCOMPATIBLE_CANDIDATE`, 13 `NEEDS_VERIFICATION`. `by_agreement × by_agreement` явно **не** `COMPATIBLE` — negotiability, заявленная обеими сторонами независимо, не доказывает, что стороны фактически согласуют один и тот же режим.

## 3. Ordering boundary

Это решение не утверждает total или partial order между `business_hours`/`extended_hours`/`access_24_7`. Источник (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.9) задаёт эти значения как плоский enum без определяющего текста; гипотеза «более широкий временной режим покрывает более узкий» лингвистически правдоподобна, но не является source semantics и не резолвится этой записью.

## 4. `by_agreement` boundary

`by_agreement` не получает ни повышенной, ни пониженной силы относительно других трёх значений ни на property-, ни на request-стороне. Любая клетка с участием `by_agreement` — `NEEDS_VERIFICATION`, включая диагональ `by_agreement × by_agreement`.

## 5. Fail-closed правила

- request `access_mode` не задан → `value_state = NOT_APPLICABLE`;
- request задан, property `access_mode` отсутствует → `value_state = UNKNOWN`;
- ни одна клетка не получает `INCOMPATIBLE_CANDIDATE` этим решением — отсутствие source-подтверждённой ordering-гипотезы не позволяет утверждать несовместимость ни для одной пары;
- automatic `INELIGIBLE` не разрешается (`automatic_ineligible_allowed = NO` сохраняется);
- 13 клеток остаются `registry_readiness = BLOCKED_PENDING_DECISION`.

## 6. Rationale

Строгое равенство — единственная compatibility-связь, не требующая ordering- или negotiability-гипотезы. Расширение покрытия требует отдельного, явно санкционированного PRODUCT-решения по конкретной ordering-гипотезе, не подразумеваемого автоматически этим qualitative baseline.

## 7. Затронутые артефакты

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — open decision №3, `access_mode_hard_fit` (№15, §5.1);
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-002`.

## 8. Не утверждено

Ordering-гипотеза `business_hours ≤ extended_hours ≤ access_24_7`, сила/слабость `by_agreement`, numeric thresholds, `required_evidence_level`, runtime/API/DB/schema design, reason-code values и implementation authorization — не утверждены. Feature Schema Proposal не переводится в `APPROVED`.

## 9. Change control

Изменение утверждённого baseline или fail-closed boundary, включая любое последующее санкционирование ordering-гипотезы, требует нового versioned decision record, согласованного как минимум `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись. Эта cross-functional approval clause не превращает всех approvers в artifact owner.

## 10. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 11. Итог

`XFR-D-002 PARTIAL QUALITATIVE COMPATIBILITY APPROVED — 13 OF 16 PAIRS REMAIN OPEN`
