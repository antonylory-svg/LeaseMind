# LeaseMind Matching Decision Record — XFR-D-001

**Decision ID:** `XFR-D-001`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED PARTIAL QUALITATIVE COMPATIBILITY — 6 of 20 pairs remain OPEN; policy approval, runtime representation and purpose-semantics extensions not authorized`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT + DEVELOPMENT`

## 1. Вопрос

Как соотносятся значения Property `entrance_type` и TenantRequest `entrance_requirement` (Feature Schema open decision №2, признак `entrance_requirement_fit`, №8 реестра §5.1)?

## 2. Решение

Утверждается частичная качественная compatibility table (13 `COMPATIBLE` / 1 `INCOMPATIBLE_CANDIDATE` / 6 `NEEDS_VERIFICATION`):

| Property `entrance_type` | `separate_required` | `separate_preferred` | `shared_allowed` | `no_preference` |
|---|---|---|---|---|
| `separate_street` | `COMPATIBLE` | `COMPATIBLE` | `NEEDS_VERIFICATION` | `COMPATIBLE` |
| `separate_yard` | `COMPATIBLE` | `COMPATIBLE` | `NEEDS_VERIFICATION` | `COMPATIBLE` |
| `shared` | `INCOMPATIBLE_CANDIDATE` | `COMPATIBLE` | `COMPATIBLE` | `COMPATIBLE` |
| `loading_only` | `NEEDS_VERIFICATION` | `COMPATIBLE` | `NEEDS_VERIFICATION` | `COMPATIBLE` |
| `none` | `NEEDS_VERIFICATION` | `COMPATIBLE` | `NEEDS_VERIFICATION` | `COMPATIBLE` |

Статус клетки резолвит только качественную совместимость comparison-правила; не присваивает numeric threshold, runtime enum/field или Qualification routing результат.

## 3. Preference boundary

`separate_preferred` — лингвистически preference, не hard requirement. `COMPATIBLE` в этой колонке не означает, что preference фактически удовлетворена. Отдельно от hard-compatibility результата сохраняется unmet-preference diagnostic для случаев, когда property не имеет `separate_street`/`separate_yard`, а request — `separate_preferred`. Этот diagnostic:

- не меняет значение hard `COMPATIBLE`-результата в соответствующей клетке;
- не присваивает и не влияет на Qualification routing результат;
- остаётся concept-level signal для возможного будущего Scoring/Ranking рассмотрения, не runtime-полем этой записи.

## 4. Fail-closed правила

- request `entrance_requirement` не задан → `value_state = NOT_APPLICABLE` (Feature Schema §5.2, случай a) — вне матрицы;
- request задан, property `entrance_type` отсутствует (не задано вовсе) → `value_state = UNKNOWN` (случай b) — это не то же самое, что явное значение `none`, которое участвует в матрице как обычная строка;
- `INCOMPATIBLE_CANDIDATE` не разрешает automatic `INELIGIBLE`; `automatic_ineligible_allowed = NO` сохраняется без исключений для всех 20 hard-constraint candidates (Feature Schema §4.3);
- шесть клеток (`shared_allowed` против `separate_street`/`separate_yard`/`loading_only`/`none`; `separate_required` против `loading_only`/`none`) остаются `registry_readiness = BLOCKED_PENDING_DECISION`.

## 5. Authority boundary

Это human-approved governance interpretation терминологии source enum (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.5/§6.6) для 14 из 20 клеток — не буквальная source-норма. CTA §6.5/§6.6 задаёт `entrance_type` и `entrance_requirement` как два независимых identifier-списка и явно не формулирует compatibility relation между ними ни для одной пары; 14-клеточное заключение основано на буквальном лингвистическом смысле identifiers (совпадение имени, лингвистическое различие preference/requirement, буквальное значение «no preference»), а не на прямой source-норме, и без инференции физических свойств входа. Решение не утверждает гипотезу «`separate` ⊇ `shared`» и не выводит purpose-семантику `loading_only`/`none` относительно `separate_required` — именно поэтому шесть клеток остаются открытыми.

## 6. Rationale

14 клеток резолвятся как human-approved governance interpretation терминологии source enum (совпадение имени, лингвистическое различие preference/requirement, буквальное значение «no preference») — источник сам эту compatibility не формулирует; оставшиеся шесть клеток требуют либо ordering-гипотезы, либо purpose-инференции, ни одна из которых не следует из source, и поэтому оставлены `NEEDS_VERIFICATION`.

## 7. Затронутые артефакты

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — open decision №2, `entrance_requirement_fit` (№8, §5.1), `registry_readiness`/`readiness_reason` (§3.1);
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-001`.

## 8. Не утверждено

Numeric thresholds, ordering-гипотеза `separate ⊇ shared`, purpose-семантика `loading_only`/`none`, `required_evidence_level`, LEGAL verdict (§14.3 условие 4), runtime/API/DB/schema design, reason-code values и implementation authorization — не утверждены. Feature Schema Proposal не переводится в `APPROVED`.

## 9. Change control

Изменение утверждённой qualitative compatibility semantics или fail-closed boundary этого решения требует нового versioned decision record, согласованного как минимум `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись. Эта cross-functional approval clause не превращает всех approvers в artifact owner.

## 10. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 11. Итог

`XFR-D-001 PARTIAL QUALITATIVE COMPATIBILITY APPROVED — 6 OF 20 PAIRS REMAIN OPEN`
