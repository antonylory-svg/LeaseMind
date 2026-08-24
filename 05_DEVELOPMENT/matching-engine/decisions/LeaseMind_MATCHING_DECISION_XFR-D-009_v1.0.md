# LeaseMind Matching Decision Record — XFR-D-009

**Decision ID:** `XFR-D-009`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED V0.1 SCOPE BOUNDARY — unsupported derived location/occupancy signals excluded from v0.1; raw request facts preserved; future re-entry remains OPEN; policy approval and implementation not authorized`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT`

## 1. Вопрос

Как классифицировать в Matching Feature Schema v0.1 восемь значений `request_location_priorities`, для которых отсутствуют Property-side данные, и `expected_occupancy_signal`, для которого отсутствует Property capacity (Feature Schema open decision №11)?

## 2. Решение

Утверждается граница состава derived features для v0.1:

- `location_priority_alignment` остаётся derivable только для `parking` и `loading_access` из уже существующих `property_parking_spaces` и `property_loading_access`;
- derived-вклад для `near_home`, `near_customers`, `city_center`, `near_metro`, `near_shopping_center`, `near_business_center`, `first_line`, `high_visibility` получает `registry_readiness = EXCLUDED_FROM_V0_1`;
- `expected_occupancy_signal` получает `registry_readiness = EXCLUDED_FROM_V0_1`, поскольку `request_expected_occupancy_people` не имеет Property-side capacity counterpart, а вывод capacity из `property_area_sqm` не утверждён;
- новые Property fields, geo/capacity service или runtime contract этим решением не создаются.

Это `RESOLVED_V0_1_SCOPE_BOUNDARY`: текущий состав v0.1 определён однозначно. Возможное будущее возвращение исключённых derived signals является отдельным downstream-вопросом, а не незавершённостью этой v0.1-границы.

## 3. Raw-input preservation boundary

Исключаются только неподдерживаемые **derived signals**, не исходные пользовательские факты:

- `request_location_priorities` продолжает собираться, валидироваться и сохраняться в существующем `soft_preferences.location_priorities` Technical Assignment mapping;
- `request_expected_occupancy_people` продолжает собираться, валидироваться и сохраняться в существующем `subject_snapshot.expected_occupancy_people` mapping;
- эти raw facts не удаляются, не игнорируются и не переименовываются этим record;
- восемь неподдерживаемых priorities и occupancy fact не производят в v0.1 `Feature Fit`, score, ranking modifier, Qualification routing, rejection или automatic `INELIGIBLE`.

`parking`/`loading_access` semantics не меняются.

## 4. Source и authority boundary

CTA прямо устанавливает десять значений `location_priority`, request-side occupancy fact и существующие Property fields; отсутствие Property-side counterparts подтверждено текущим contract. Feature Schema прямо фиксирует, что только `parking`/`loading_access` derivable, coarse geography не подставляется вместо остальных восьми, а capacity не выводится из площади.

Переход derived signals в `EXCLUDED_FROM_V0_1` — human-approved governance scope decision поверх этих source facts, а не буквальная CTA-норма. Он не изменяет CTA и не утверждает, что отсутствующие данные существуют.

## 5. Future re-entry

Возвращение любого исключённого derived signal требует отдельного versioned governance decision, который:

- указывает доказуемый Property-side source либо approved protected derived service;
- сохраняет запрет передавать raw exact address/coordinates в Matching Engine;
- проходит применимые PRODUCT, Data Contracts/DEVELOPMENT, privacy/LEGAL, lawful-basis и evaluation reviews в зависимости от выбранного source mechanism;
- задаёт versioning/replay impact до активации feature;
- не получает implementation authorization автоматически из этого record.

Новый Property field, внешний geo-service и capacity-service — разные возможные future paths; этот record не выбирает и не проектирует ни один из них.

## 6. Fail-closed правила

- отсутствие derived signal не считается отрицательным фактом;
- excluded signal не получает `PASS`, `FAIL`, `UNKNOWN`, score или routing result: active FeatureValue для него в v0.1 не производится;
- coarse `country`/`region`/`city`/`districts` hard-geography не используется вместо восьми отсутствующих soft signals;
- raw exact address/coordinates остаются запрещёнными в scoring, presentation, telemetry и logs;
- automatic `INELIGIBLE` не разрешается.

## 7. Затронутые артефакты

- `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` — §6.2, §6.4, §7.4, decision row №11, readiness matrix и acceptance criteria должны быть синхронизированы отдельным pass;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-009` должен быть добавлен отдельным pass.

## 8. Не утверждено

Exact field names/types, Property capacity, geo/capacity service, distance/zone algorithm, scoring weights, numeric thresholds, runtime/API/DB/schema design, lawful-basis verdict, public presentation, Proposal approval и implementation authorization — не утверждены.

## 9. Change control

Изменение утверждённой v0.1 exclusion/raw-preservation boundary либо re-entry исключённого derived signal требует нового versioned decision record со ссылкой `supersedes` на эту запись, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`. Эта approval clause не превращает approvers в artifact owner.

## 10. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 11. Итог

`XFR-D-009 V0.1 SCOPE BOUNDARY APPROVED — UNSUPPORTED DERIVED SIGNALS EXCLUDED, RAW REQUEST FACTS PRESERVED, FUTURE RE-ENTRY OPEN`
