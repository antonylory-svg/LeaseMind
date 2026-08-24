# LeaseMind Matching Decision Record — XFR-D-011

**Decision ID:** `XFR-D-011`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED QUALITATIVE LITERAL-MATCH BASELINE — canonicalization, aliases and catalog-ID enhancements remain OPEN; policy approval and implementation not authorized`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT + DEVELOPMENT`

## 1. Вопрос

Как в v0.1 сопоставляются string-значения `region_membership`, `city_membership` и `districts_membership` при отсутствии утверждённой case-folding, Unicode-normalization, alias или stable catalog-ID policy (Feature Schema open decision №14)?

## 2. Решение

Утверждается human-governed positive literal-match baseline после **только** уже существующей CTA §5.2 нормализации: UTF-8, удаление пробелов по краям, empty string = отсутствующее значение и нормативная серверная валидация. Дополнительная matching-normalization не выполняется.

| Признак | Условие | Качественный результат |
|---|---|---|
| `region_membership` | `property_region` и `request_region` code-point equal | `COMPATIBLE` |
| `region_membership` | строки не code-point equal | `NEEDS_VERIFICATION` |
| `city_membership` | `property_city` code-point equal хотя бы одному элементу `request_cities` | `COMPATIBLE` |
| `city_membership` | ни одного exact literal match | `NEEDS_VERIFICATION` |
| `districts_membership` | request constraint выражен, Property districts известны, exact-literal intersection непуст | `COMPATIBLE` |
| `districts_membership` | request constraint выражен, Property districts известны, exact-literal intersection пуст | `NEEDS_VERIFICATION` |
| `districts_membership` | request constraint выражен, `property_districts` отсутствует | `value_state = UNKNOWN` |
| `districts_membership` | `request_districts` не задан | `value_state = NOT_APPLICABLE` |

Явно переданный пустой `request_districts` array не переопределяется этим record как отсутствующее поле: при известных Property districts он имеет пустое intersection и идёт в `NEEDS_VERIFICATION`; при отсутствующем `property_districts` сохраняется `UNKNOWN`. Это fail-closed поведение, не automatic incompatibility.

Ни одна строка baseline не возвращает `INCOMPATIBLE_CANDIDATE`.

## 3. Normalization boundary

Не утверждены и не выполняются:

- case-folding;
- Unicode NFC/NFD/NFKC/NFKD normalization;
- `ё`↔`е` substitution;
- замена вариантов дефиса/тире;
- transliteration;
- internal-whitespace collapsing;
- alias/synonym mapping;
- fuzzy matching;
- implicit catalog lookup или stable catalog ID.

CTA-упоминание справочника для city membership не означает, что stable catalog IDs передаются в текущем contract. Literal baseline не выдаётся за source-норму: это human-approved governance interpretation поверх уже сохранённых string values.

## 4. Fail-closed правила

- literal equality может доказать положительное совпадение для v0.1;
- literal inequality не доказывает, что географические сущности различны, поэтому ведёт в `NEEDS_VERIFICATION`, не `FAIL`, `INCOMPATIBLE_CANDIDATE`, rejection или automatic `INELIGIBLE`;
- `region` и `city` required на обеих сторонах после готовности Technical Assignment, поэтому отдельные NOT_APPLICABLE/UNKNOWN cases для них не вводятся;
- districts сохраняет действующее различие request-missing `NOT_APPLICABLE` и property-missing `UNKNOWN`;
- hard geography не становится source input для soft `location_priority_alignment`;
- exact address/coordinates не участвуют.

## 5. Readiness boundary

Qualitative v0.1 method полностью определён для всех входных случаев baseline и получает `RESOLVED_QUALITATIVE_LITERAL_BASELINE`; соответствующее comparison-rule definition может перейти в `READY_AS_CANDIDATE_ONLY` при отдельном Feature Schema sync.

Это не активирует runtime, scoring, Eligibility Filter или Qualification routing: Feature Schema остаётся Proposal, applicable gates остаются `BLOCKED`, exact runtime representation не утверждена.

Case-folding/Unicode/alias policy и canonical catalog IDs — независимые future enhancement paths, не незавершённость literal baseline.

## 6. Future enhancements и replay

Любое расширение literal baseline нормализацией, aliases или catalog IDs требует отдельного versioned decision record. Оно обязано:

- ссылаться `supersedes` на эту запись, если меняет qualitative результат для ранее допустимых string pairs;
- фиксировать deterministic algorithm и locale independence;
- анализировать backward compatibility, replay и evaluation impact;
- при contract-field/catalog-ID изменениях пройти отдельный PRODUCT/Data Contracts/DEVELOPMENT review;
- не получать implementation authorization автоматически.

## 7. Затронутые артефакты

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — rows №17–19, decision row №14, readiness matrix и acceptance criteria должны быть синхронизированы отдельным pass;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-011` должен быть добавлен отдельным pass.

## 8. Не утверждено

Case/Unicode/alias/fuzzy algorithm, catalog IDs, new contract fields, numeric thresholds, scoring weights, LEGAL §14.3(4) verdict, runtime/API/DB/schema design, reason codes, Proposal approval и implementation authorization — не утверждены.

## 9. Change control

Изменение утверждённого literal-match baseline или его fail-closed boundary требует нового versioned decision record со ссылкой `supersedes` на эту запись, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`. Эта approval clause не превращает approvers в artifact owner.

## 10. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 11. Итог

`XFR-D-011 QUALITATIVE LITERAL-MATCH BASELINE APPROVED — NON-LITERAL MATCHES REQUIRE VERIFICATION, ENHANCEMENTS REMAIN OPEN`
