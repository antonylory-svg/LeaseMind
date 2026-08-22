# LeaseMind MATCHING_FEATURE_SCHEMA v0.1

**Версия:** 0.1
**Дата:** 2026-08-21
**Статус:** `Proposal for cross-functional review (AI + PRODUCT + DEVELOPMENT + LEGAL) — does not authorize implementation`
**Владельцы решения:** PRODUCT + LEGAL + AI (§37 и §52.1 `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`); **координатор документа:** Chief AI Architect
**Область:** governance-контракт готовности признаков synthetic-only Matching Engine; не production data/adapters; не разрешение на реализацию
**Связанные документы:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`, `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (только как существующая граница исполнимых контрактов, не источник feature-арифметики), `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md`, `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md`

---

## 1. Назначение, объём и не-цели

### 1.1. Назначение

Настоящий документ — черновик закрытия открытого вопроса №11 `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` §37: «Какие сроки актуальности действуют для ключевых признаков помещения, спроса, полномочий и готовности?». Он фиксирует:

- реестр допустимых кандидатов признаков (features) для synthetic pilot с точным маппингом на существующие поля `Property`/`TenantRequest` (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md`);
- типы/шкалы/enum, обязательность, applicability и source ownership каждого кандидата;
- freshness-классификацию по пяти механизмам (revision-bound, event-invalidated, time-bound, immutable evidence, external gate status);
- evidence- и missing/unknown/conflict-семантику, буквально совместимую с `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` §11–13;
- формализуемые Hard Constraint candidates, проверенные по всем шести условиям §14.3 Architecture;
- границы ответственности между Feature Schema и пятью соседними policy-артефактами, явно перечисленными в Architecture §36.2.2.

### 1.2. Не-цели (явно вне объёма этого документа)

Документ **не задаёт**:

- веса измерений (`Feature Weight`) — область `MATCHING_SCORING_POLICY`;
- калиброванные формулы `Feature Fit` (кроме структуры интерфейса `[0,1]`, без калибровки) — область `MATCHING_SCORING_POLICY`;
- Risk-категории и пороги — область `MATCHING_RISK_POLICY`;
- routing-правила `QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING` — область `MATCHING_QUALIFICATION_POLICY`;
- какие поля безопасно показать пользователю — область `SAFE_PRESENTATION_POLICY`;
- dataset/labels/adjudication/threshold-search процедуру — область `MATCHING_EVALUATION_PLAN`.

### 1.3. Абсолютные запреты (без исключений в этой версии)

- Прямые персональные идентификаторы (ФИО, телефон, email, документы, платёжные реквизиты) — не входят в реестр ни в каком виде (§8.2 Architecture; §12.1 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`).
- `property_exact_address` и точные координаты — **отдельно** запрещены как scoring input; PRODUCT классифицирует точный адрес как `protected_commercial_data` (§12.3 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`), не как прямой персональный идентификатор — запрет действует по причине защищённого статуса адреса (§9.4 Architecture: «только в защищенном контуре»), а не потому что он приравнен к ФИО/телефону/email; см. §7.4.
- Свободный текст без отдельной safe-classification policy не используется как scoring input.
- Юридические, платёжные решения и решения о раскрытии (Reveal) не принимаются и не подменяются ни одним признаком этого документа.
- Production data и production adapters не используются; весь реестр — synthetic-only до отдельного `PRODUCTION_LAUNCH_GATE` (§36.4, §50 Architecture).

### 1.4. Статус после этого документа

**Утверждение этого документа не закрывает вопрос №11** — оно фиксирует кандидатный словарь и точную freshness-классификацию, часть которых (см. §10) остаётся `BLOCKED_PENDING_DECISION` до PRODUCT/LEGAL/AI решений. **`IMPLEMENTATION_READINESS_GATE` остаётся `BLOCKED`** — условие §36.2.2 требует утверждения всех шести артефактов одновременно, не только Feature Schema. Документ **не разрешает** реализацию Matching Engine в `apps/**`. Содержит unresolved sections по построению (§10, §11).

---

## 2. Ownership и boundary matrix

| Артефакт | Владеет | Не владеет (отсылка) |
| --- | --- | --- |
| **`MATCHING_FEATURE_SCHEMA`** (этот документ) | Словарь `feature_id`, типы/шкалы/enum, mandatory/optional/applicability, source ownership, revision requirement, freshness-класс, missing/unknown/conflicting/stale value states, **input normalization/canonicalization семантику** (например, каким образом сравниваются строковые/enum-значения географии — где определена; где не определена, зафиксировано как открытое решение, §10), формализация `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE` по условиям 2 и 4 §14.3 (условия 1 и 6 — совместно с Chief AI Architect при утверждении; условие 3 — см. ниже) | Веса/арифметику score, калиброванный `Feature Fit`, routing, dataset/evaluation процедуру, presentation-правила. **Не владеет единолично** достаточностью evidence (§14.3 условие 3) — это решение PRODUCT + AI + LEGAL + Chief AI Architect совместно (§4.1, §10), не одностороннее решение Feature Schema |
| `MATCHING_SCORING_POLICY` | Калиброванную арифметику `Dimension Score`/`Reciprocal Fit`/`Match Score`, выбор Mutual Aggregate функции, веса категорий, `scoring_policy_version` | Routing, список признаков, Risk, dataset, **базовую канонизацию входа** (типы/единицы/enum-принадлежность — область Feature Schema, не Scoring Policy) |
| `MATCHING_QUALIFICATION_POLICY` | Итоговое правило Matching Qualification Gate — как `Match Score` + `Confidence Score` + `Risk` + `completeness` + `Hard Constraint status` вместе дают финальный статус | Арифметику score, список признаков, Risk-категории |
| `MATCHING_RISK_POLICY` | Risk categories, конкретные пороги, переходы в `HUMAN_REVIEW_REQUIRED`/`NEEDS_VERIFICATION` по Risk | Score-арифметику, routing целиком, список признаков |
| `MATCHING_EVALUATION_PLAN` | Synthetic dataset, качество меток, adjudication, метрики, процедура подбора порогов (потребляет non-normative кандидаты этого документа как вход) | Финальные пороги (выход процедуры фиксируется в Qualification/Risk Policy) |
| `SAFE_PRESENTATION_POLICY` / Presentation Readiness Gate | Какие поля безопасно показать пользователю без риска повторной идентификации | Числовые scoring-признаки/пороги — не получает их из Feature Schema напрямую |
| Identity/Authority Registry, Previous Contact Gate, Payer Resolution, Payment/Fiscal Ledger, Reveal Gate (все — внешние, §18.3–18.7, §19, §40 Architecture) | Собственные **finality-решения** — они остаются исключительно внешними и никогда не переносятся в Matching Engine ни в каком виде | Не являются feature-источником scoring вообще, **кроме** случая, когда versioned status/ref конкретного факта отдельно одобрен как non-scoring `GATE_ONLY_CANDIDATE` input этим документом (§7) — и то не как замена finality-решения, а как read-only ссылка на его текущее состояние. Если такого отдельного одобрения/контракта нет — `BLOCKED_PENDING_DECISION`, не `GATE_ONLY_CANDIDATE` (см. §7.1) |

---

## 3. Candidate `FeatureValue` envelope (draft, без SQL/API design)

```
FeatureValue:
  feature_id                     # canonical registry id, см. §5-§6
  feature_schema_version         # + content hash
  dimension                      # TENANT_FIT | OWNER_FIT | DEAL_FEASIBILITY | GATE_ONLY | RANKING_ONLY
  classification                 # ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE | SOFT_FIT_CANDIDATE |
                                  # RANKING_ONLY_CANDIDATE | GATE_ONLY_CANDIDATE | FORBIDDEN
                                  # (Matching-специфичная классификация; НЕ то же самое, что criterion_class ниже — см. §3.3)
  criterion_class                 # Architecture §11 «Класс критерия»: обязательный | желательный | переговорный | информационный
  raw_or_derived                 # RAW | DERIVED
  source_kind                     # Architecture §11 «Источник»: пользователь | документ | открытый источник | представитель | вычисленный вывод
  value_type                     # enum | integer | decimal | boolean | date | array<enum> | derived_comparison
  unit                           # где применимо (м², ₽/месяц, кВт, м, …)
  allowed_range_or_enum          # точная ссылка на источник enum/диапазона (§5-§6)
  normalization_rule             # ссылка на применимую policy version (§9), сама формула не в этом документе
  direction_or_preference        # только если направление явно выражено пользователем (§6); иначе NOT_EXPRESSED
  source_aggregate_type          # Property | TenantRequest
  source_aggregate_id
  source_schema_version
  source_revision                # revision-bound freshness, §8 класс 1
  observed_at
  verified_at                    # только применимо, если существует class 3 (time-bound) — для v0.1 не задан ни для одного текущего поля
  expires_at / invalidation_event_ref   # для class 2/3, где применимо
  evidence_ref                   # ссылка, без raw protected payload
  confidence                      # Architecture §11 «Уверенность»; шкала/калибровка этим документом не задаётся (§1.2)
  visibility                      # Architecture §11 «Видимость»: внутреннее | защищенное | разрешенное к раскрытию;
                                   # конкретное значение per feature — решение SAFE_PRESENTATION_POLICY (§2);
                                   # default в этом draft = внутреннее для всех признаков §5-§6 до отдельного одобрения
  applicability_policy_version
  normalization_policy_version
  freshness_class                 # 1..5, см. §8

  # Правовое основание обработки (Architecture §11, дословно без ослабления) — см. §3.3:
  lawful_basis_id                 # неизменяемая ссылка на действующее правовое основание
  processing_purpose              # Architecture §11 «Цель обработки»
  lawful_basis_source              # Architecture §11 «Источник данных» основания: субъект | представитель | договор |
                                    # согласие | законный реестр | обработчик | иной разрешённый источник
  lawful_basis_version             # Architecture §11 «Версия основания»: версия/хеш документа-основания
  lawful_basis_validity            # Architecture §11 «Срок действия основания»: дата начала/окончания либо событие прекращения
  lawful_basis_status              # Architecture §11 канонический enum, без добавлений:
                                    # ACTIVE | EXPIRED | REVOKED | TERMINATED | SUSPENDED | UNDER_REVIEW
  lawful_basis_termination_ref     # Architecture §11 «Прекращение/отзыв»: дата, источник, ID события
  record_version                   # Architecture §11 «Версия»: версия записи
  change_reason                    # Architecture §11 «Версия»: причина изменения записи

  # Три ортогональные оси состояния (§4.2, §3.2) — НЕ единая свёрнутая метка:
  value_state                     # internal candidate, НЕ утверждённый API/event enum — минимальный набор см. §3.2
  evidence_status                 # ТОЛЬКО канонический Architecture §13 enum, без добавлений
  processing_eligibility          # internal candidate, НЕ утверждённый API/event enum — производный fail-closed
                                   # результат lawful_basis_status/processing_purpose/lawful_basis_validity (§3.2, §3.3),
                                   # не замена хранения самих полей выше
```

Явно: `value_state` и `processing_eligibility` — internal candidate names этого draft, не заявлены как утверждённые публичные API/event enums. Только `evidence_status` и `lawful_basis_status` используют уже нормативные списки Architecture §13/§11 без единого добавленного значения.

### 3.1. `registry_readiness` — design-time понятие реестра, не runtime-поле `FeatureValue`

`registry_readiness` — статус готовности **определения** признака (`feature_id`) или конкретного comparison operator/policy-правила в этом governance-черновике: насколько сама формализация правила, а не конкретное измеренное значение, готова к дальнейшей проработке. Это понятие целиком design-time, принадлежит только этому документу и его review-процессу и **не** является полем runtime `FeatureValue` (§3): оно никогда не присваивается как значение `value_state`, `evidence_status` или `processing_eligibility`.

`registry_readiness` имеет **ровно четыре** top-level значения — те же категории, что уже используются как заголовки §11.1: `READY_FOR_DRAFT`, `READY_AS_CANDIDATE_ONLY`, `BLOCKED_PENDING_DECISION`, `EXCLUDED_FROM_V0_1`. Эти четыре значения не перекрываются и не имеют пятого параллельного статуса.

`readiness_reason` — необязательный уточняющий **подтип причины** при `registry_readiness = BLOCKED_PENDING_DECISION`, не отдельный top-level readiness status. Единственное формализованное в этом документе значение — `BLOCKED_PENDING_COMPATIBILITY_TABLE`: когда столбец «Operator» в §5.1 содержит эту метку (№8, 15, 20 — отсутствует compatibility/mapping-таблица для оператора сравнения), это означает `registry_readiness = BLOCKED_PENDING_DECISION` с `readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE`. Другие причины `BLOCKED_PENDING_DECISION` в этом документе (например, метод строкового сопоставления geography №17–19, или operating-expenses basis mismatch §5.3) описаны текстом соответствующей ячейки/раздела без отдельного формального `readiness_reason`-тега — вводить полную таксономию причин этот документ не должен. И `registry_readiness`, и `readiness_reason` фиксируют состояние самого правила сравнения, а не runtime-значение какого-либо конкретного вычисленного `FeatureValue`.

Пока `registry_readiness` конкретного оператора/правила — `BLOCKED_PENDING_DECISION` (с любым `readiness_reason` или без него), этот документ **не производит по этому правилу активный scored/exclusion-значимый `FeatureValue`**: comparison не выполняется, не присваивается ни `PASS`, ни `FAIL`, ни (согласовано с §4.3) автоматический `INELIGIBLE`, и такой `FeatureValue` не участвует ни в `Dimension Score`, ни в Eligibility Filter, ни в каком routing будущей `MATCHING_QUALIFICATION_POLICY`. Если для audit/diagnostic целей всё же сохраняется candidate-запись (например, факт, что признак был запрошен, но правило сравнения ещё не определено), она **MAY** иметь internal `value_state = UNKNOWN` (§3.2) — это **не** активный scored `FeatureValue` и **не** утверждённый публичный API/event-контракт, а исключительно diagnostic-artefact этого draft. Design-time-статус (`registry_readiness`/`readiness_reason`) сам по себе никогда не присваивается как значение runtime `value_state`.

### 3.2. Минимальная семантика runtime-осей (candidate, не утверждённый API/event enum)

- `value_state` — минимальный непротиворечивый набор значений, фактически используемых этим draft, не исчерпывающий утверждённый enum:
  - `PRESENT` — значение снято с актуальной `(aggregate_id, revision)` и applicable к сравнению;
  - `NOT_APPLICABLE` — optional TenantRequest-ограничение не выражено пользователем, сравнение не выполняется (§5.2, случай a);
  - `UNKNOWN` — два разных по природе, но одинаково промаркированных candidate-случая для будущего утверждённого runtime: **(i)** необходимое optional Property-значение отсутствует, при том что оператор сравнения формализован с `registry_readiness = READY_AS_CANDIDATE_ONLY` (§5.2, случай b; `MFS-C-015`); **(ii)** diagnostic-only candidate-запись при `registry_readiness = BLOCKED_PENDING_DECISION` применимого правила (§3.1; `MFS-C-016`) — здесь `FeatureValue` MAY существовать только как diagnostic-artefact, не как scored результат. Ни один случай не активируется, не участвует в routing и не означает `PASS`/`FAIL`, пока Feature Schema и применимые Scoring/Qualification policies не утверждены и implementation не разрешена соответствующим gate.
  Полный утверждённый enum (включая, возможно, дополнительные runtime-состояния вроде `CONFLICTING`, и возможное разделение случаев (i)/(ii) на разные значения) остаётся открытым решением (§10, пункт 18) и не расширяется этим документом сверх перечисленных трёх значений.
- `processing_eligibility` — `ALLOWED` | `DATA_PROCESSING_BLOCKED`. Второе значение — дословный термин Architecture §11 («Отсутствующий, отозванный, прекращенный, приостановленный или несовместимый `lawful_basis_id` дает `DATA_PROCESSING_BLOCKED`»), не изобретено этим документом. `processing_eligibility` — **производный** fail-closed результат проверки `lawful_basis_status`, `processing_purpose` и `lawful_basis_validity` (§3.3); он не заменяет хранение самих оснований — все поля §3.3 хранятся независимо от текущего значения `processing_eligibility`.

### 3.3. Соответствие §11 Architecture и источник полей правового основания

Поля envelope выше покрывают все перечисленные в Architecture §11 параметры значимого параметра профиля (Значение → `value`/раздел значений §5-§6; Тип → `value_type`; Класс критерия → `criterion_class`; Источник → `source_kind`; Статус → `evidence_status`+`value_state`; Уверенность → `confidence`; Проверено → `verified_at`; Актуально до → `expires_at`; Видимость → `visibility`; Evidence ID → `evidence_ref`; `lawful_basis_id` и весь блок правового основания → одноимённые поля выше; Версия → `record_version`/`change_reason`) без ослабления их состава.

Единственный writer `lawful_basis_id`, цели, версии, срока и отзыва основания — существующий Lawful Basis/Consent Registry (Architecture §11, §21.3, §40.1). Этот документ не создаёт альтернативный источник этих полей и не заменяет Registry: он резервирует их как обязательные slot'ы envelope, значения которых предоставляет Registry, а не raw `Property`/`TenantRequest` payload. Точный интеграционный контракт (API/событие, которым Registry передаёт эти значения Matching Engine) не специфицирован ни одним прочитанным источником и не изобретается здесь; зафиксировано как отдельное открытое решение (§10, пункт 19), а не как решённый или подразумеваемый вопрос.

Этот документ не вводит `source_confirmed`/`content_verified` ни как самостоятельные, ни как производные поля: Architecture §13 перечисляет канонические статусы `evidence_status`, но нигде не утверждает правило вида `CONTENT_VERIFIED ⇒ SOURCE_CONFIRMED`; любая производная иерархия между этими двумя статусами была бы изобретена этим документом. Единственный источник истины о состоянии доказательства — `evidence_status` (§13 Architecture) как есть, без дополнительных булевых псевдополей.

---

## 4. Evidence semantics — validation ≠ confirmation

### 4.1. Разделение уровней

- **`input_validated`** — сервер подтвердил только корректность формы и внутренних invariants (диапазоны, enum-принадлежность, кросс-полевые правила §7.4/§8.4 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`). Это **не** доказательство истинности факта в реальном мире.
- **`required_evidence_level`** — минимальный уровень `evidence_status` (§13 Architecture), достаточный для использования признака как основания для `INELIGIBLE`. Для **каждого** кандидата этого документа сейчас `BLOCKED_PENDING_DECISION` — норма не утверждена ни для одного признака.
- **`automatic_ineligible_allowed`** — булев флаг per feature; **для всех признаков этого draft равен `NO`** (§4.3).

### 4.2. Правило по умолчанию

Прямой пользовательский ввод `Property`/`TenantRequest` (весь реестр §5–§6) по умолчанию имеет `evidence_status = UNVERIFIED`: «заявлено, но не проверено» (§13 Architecture, дословно). `input_validated = true` не переводит его в `SOURCE_CONFIRMED` или `CONTENT_VERIFIED` автоматически. §14.3(3) Architecture («несовместимость подтверждена актуальным разрешенным источником») не требует универсально именно `CONTENT_VERIFIED` — требуется, чтобы достаточный уровень был **определён и утверждён** в policy для каждого признака/источника; на сегодня такое определение отсутствует для всех 20 кандидатов §5.

### 4.3. Следствие

Поскольку `required_evidence_level` не утверждён ни для одного признака, **ни один** hard-constraint candidate этого draft не разрешает automatic `INELIGIBLE`. Отсутствие подтверждения ведёт к `NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED` по будущей `MATCHING_QUALIFICATION_POLICY`, не к автоматическому исключению (§14 Architecture: «Если хотя бы одно условие не выполнено, Matching Engine не выставляет `INELIGIBLE`»).

---

## 5. Hard-constraint candidate registry — 20 признаков

Источник соответствия: `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §10.1 (классификация блоков Campaign bootstrap), §10.2 (`need_tenant` mapping), §10.3 (`need_property` mapping). Каждая строка — `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE`, ни одна не подтверждённый Hard Constraint (§14.3 условие 1 не выполнено до утверждения этого документа).

**Число строк (20) выведено программно из §10.3 источника, не выбрано заранее.** Полная сверка §10.2/§10.3 против первой редакции этого документа обнаружила пять пропущенных `hard_constraints.*` полей — `country_code`, `region`, `cities`/`districts` (география) и `floor_options` — добавленных ниже как №16–20. PRODUCT-классификация конкретного raw-поля в блок `hard_constraints` — нормативный источник намерения (это поле относится к exclusion-условиям), но **не** автоматическое доказательство готовности конкретного comparison/reject rule (§14.3 условие 3 и 6 всё ещё не выполнены ни для одной строки, см. §5.2).

### 5.1. Bootstrap source mapping и operator

| № | `feature_id` | Property bootstrap path = source field | TenantRequest bootstrap path = source field | Operator |
| --- | --- | --- | --- | --- |
| 1 | `property_type_membership` | `subject_snapshot.property_type` = `property_type` | `hard_constraints.property_types` = `request_property_types` | `property_type ∈ request_property_types` |
| 2 | `area_range_fit` | `subject_snapshot.area_sqm` = `property_area_sqm` | `hard_constraints.area_min_sqm` / `area_max_sqm` = `request_area_min_sqm` / `request_area_max_sqm` | `area ∈ [min, max]` |
| 3 | `budget_fit` | `hard_constraints.monthly_rent_rub` = `property_monthly_rent_rub` | `hard_constraints.monthly_budget_max_rub` = `request_monthly_budget_max_rub` | `rent ≤ budget_max` |
| 4 | `rent_rate_fit` | derived: `property_monthly_rent_rub ÷ property_area_sqm` (отдельного Property rate-поля нет) | `hard_constraints.monthly_rent_rate_max_rub_per_sqm` = `request_monthly_rent_rate_max_rub_per_sqm`, если задан | `effective_rate ≤ rate_max`; применяется **одновременно** с `budget_fit`, не вместо (§8.4.8 источника: «Оба максимума применяются при поиске») |
| 5 | `business_category_allowed` | `hard_constraints.allowed_business_categories` / `excluded_business_categories` = `property_allowed_business_categories` / `property_excluded_business_categories` | `subject_snapshot.business_category` = `request_business_category` | `category ∈ allowed ∧ category ∉ excluded` |
| 6 | `condition_acceptability` | `subject_snapshot.condition` = `property_condition` | `hard_constraints.condition_options` = `request_condition_options` | `condition ∈ options` |
| 7 | `timing_compatibility` | `hard_constraints.available_from` = `property_available_from` | `hard_constraints.move_in_by` = `request_move_in_by` | `available_from ≤ move_in_by`, применяется **после** revision-инвалидации и same-revision calendar-time overlay каждой стороны (§8) |
| 8 | `entrance_requirement_fit` | `subject_snapshot.entrance_type` = `property_entrance_type` | `hard_constraints.entrance_requirement` = `request_entrance_requirement` | `registry_readiness = BLOCKED_PENDING_DECISION` (`readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE`, §3.1) — соответствие `entrance_type × entrance_requirement` не задано ни в одном прочитанном источнике |
| 9 | `required_features_present` | `subject_snapshot.features` = `property_features` | `hard_constraints.required_features` = `request_required_features` | `required ⊆ property_features` |
| 10 | `excluded_features_absent` | `subject_snapshot.features` = `property_features` | `hard_constraints.excluded_features` = `request_excluded_features` | `excluded ∩ property_features = ∅` |
| 11 | `loading_access_required_fit` | `subject_snapshot.loading_access` = `property_loading_access` | `hard_constraints.loading_access_required` = `request_loading_access_required` (boolean) | Сравнение создаётся **только если** `required = true`; тогда `loading_access ≠ none`. Явно назван «самостоятельный hard constraint» источником (§8.4.6) |
| 12 | `power_min_fit` | `subject_snapshot.power_kw` = `property_power_kw` | `hard_constraints.power_min_kw` = `request_power_min_kw` | `power ≥ min` |
| 13 | `ceiling_height_min_fit` | `subject_snapshot.ceiling_height_m` = `property_ceiling_height_m` | `hard_constraints.ceiling_height_min_m` = `request_ceiling_height_min_m` | `height ≥ min` |
| 14 | `parking_min_fit` | `subject_snapshot.parking_spaces` = `property_parking_spaces` | `hard_constraints.parking_min_spaces` = `request_parking_min_spaces` | `parking_spaces ≥ min` |
| 15 | `access_mode_hard_fit` | `subject_snapshot.access_mode` = `property_access_mode` | `hard_constraints.access_mode` = `request_access_mode` | `registry_readiness = BLOCKED_PENDING_DECISION` (`readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE`, §3.1) — упорядоченность/совместимость между `business_hours`/`extended_hours`/`access_24_7`/`by_agreement` не задана ни в одном прочитанном источнике |
| 16 | `country_code_membership` | `subject_snapshot.country_code` = `property_country_code` | `hard_constraints.country_code` = `request_country_code` | `property_country_code = request_country_code` — для MVP оба поля ограничены единственным значением `RU` (§7.2/§8.2 источника), поэтому сравнение формально определено и на практике всегда выполнено; не строковая нормализация — фиксированный код, не свободный текст |
| 17 | `region_membership` | `subject_snapshot.region` = `property_region` | `hard_constraints.region` = `request_region` | `BLOCKED_PENDING_DECISION` — оба поля валидируются как свободные строки (2..100 символов, буквы/цифры/пробел/дефис); источник не подтверждает общий канонический справочник именно для `region` (в отличие от `property_city`, который явно «принадлежит выбранному региону по справочнику», §7.2); метод сопоставления (точное строковое совпадение, регистронезависимость, catalog-id) не изобретается этим документом |
| 18 | `city_membership` | `subject_snapshot.city` = `property_city` | `hard_constraints.cities` = `request_cities` (массив 1..5) | Оператор членства `property_city ∈ request_cities` определён направленно; **метод строкового сопоставления** (регистр, нормализация, catalog-id vs literal) — `BLOCKED_PENDING_DECISION`, та же причина, что и №17 |
| 19 | `districts_membership` | `subject_snapshot.districts` = `property_districts` (массив 0..5, опционально) | `hard_constraints.districts` = `request_districts` (массив 0..20, опционально) | `property_districts ∩ request_districts ≠ ∅`, только если constraint выражен (`request_districts` задан пользователем); если `request_districts` не задан — `value_state = NOT_APPLICABLE` (§5.2, случай a); если `request_districts` задан, а `property_districts` отсутствует — сравнение недоказуемо, `value_state = UNKNOWN` (§5.2, случай b), **не** `NOT_APPLICABLE`; метод строкового сопоставления — `BLOCKED_PENDING_DECISION`, та же причина, что и №17 |
| 20 | `floor_option_fit` | `subject_snapshot.floor` = `property_floor` (integer, опционально; для `property_type=land` всегда `null`) | `hard_constraints.floor_options` = `request_floor_options` (массив `floor_option`, 0..5, опционально; `any` нельзя сочетать с другими значениями) | `registry_readiness = BLOCKED_PENDING_DECISION` (`readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE`, §3.1) — сопоставление целочисленного этажа `property_floor` (и, возможно, `property_total_floors` для относительных значений вроде `upper`) с категориальным enum `basement`/`semi_basement`/`ground`/`first`/`upper` не задано ни в одном прочитанном источнике; изобретать эту mapping-таблицу этот документ не должен |

**Явно исключено:** `min_lease_term_compatibility` **не входит** в эти 20 и не является reject rule. `property_min_lease_months` и `request_min_lease_months` — оба нижние границы; без верхней границы срока пара минимумов не создаёт несовместимости (совместимый срок `≥ max(property_min, request_min)` всегда существует при отсутствии верхнего предела). Оба сырых поля остаются частью product-классификации `hard_constraints` bootstrap-блока (§10.2/§10.3 источника), но реклассифицированы как `combined_minimum_term_fact` — non-exclusion input-кандидат для `MATCHING_QUALIFICATION_POLICY`/Deal Feasibility, не для этого реестра (см. §6.1).

**Явно исключены как свободный текст:** `hard_constraints.business_category_other` = `property_business_category_other` (§10.2 источника) и `hard_constraints.property_type_other` = `request_property_type_other` (§10.3 источника) не образуют отдельные feature candidates и намеренно не входят в 20 строк. Это DLP-проверяемые `*_other`-уточнения, запрещённые как scoring input без отдельной safe-classification policy (§7.5); их PRODUCT-размещение в bootstrap-блоке `hard_constraints` не отменяет запрета свободного текста и не создаёт comparison/reject rule.

### 5.2. Null/applicability, evidence и governance для всех 20 строк

| Параметр | Значение (общее для всех 20, кроме отмеченного) |
| --- | --- |
| Missing-data rule — **два разных случая, не сводятся к одному** | **(a) Constraint не выражен:** optional-поле TenantRequest-стороны не задано пользователем (`NULL`) → сравнение **не выполняется вообще**, признак получает `value_state = NOT_APPLICABLE` (не `PASS`/`FAIL`, не признак неопределённости — пользователь просто не выразил это ограничение). **(b) Constraint выражен, Property-сторона неизвестна:** TenantRequest-поле задано, а соответствующее optional Property-поле — `entrance_type` (№8), `features` (№9-10), `loading_access` (№11), `power_kw` (№12), `ceiling_height_m` (№13), `parking_spaces` (№14), `access_mode` (№15), `districts` (№19) или `floor` (№20), все перечислены как optional в §7.2/§8.2 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` — отсутствует → совместимость **не доказана и не опровергнута**; это **не** `NOT_APPLICABLE`, не `PASS`, не `FAIL`. Признак получает internal candidate `value_state = UNKNOWN` (§3.2) с маршрутизацией в unknown/needs-verification/fail-closed qualification path будущей `MATCHING_QUALIFICATION_POLICY` (согласуется с Architecture §12.4 «неизвестное значение… не трактуется как нарушение… может заблокировать Qualification Gate, если способно изменить допустимость пары» и §14 этап 3 `NEEDS_VERIFICATION`), а не автоматическое исключение. Обязательные поля (`property_type`, `area_sqm`, `budget_max`, `region`, `cities` и т.п. — см. §7.3/§8.3 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`) не могут быть `NULL` после успешного преобразования в `Property`/`TenantRequest`, поэтому случай (b) относится только к перечисленным optional-полям |
| `input_validated` | `true` для всех 20 (доказано серверной валидацией §7.2/§8.2 источника) |
| `required_evidence_level` | `BLOCKED_PENDING_DECISION` для всех 20 — не утверждён |
| `evidence_status` default | `UNVERIFIED` по умолчанию для всех 20 (§4.2); переход в иное каноническое значение §13 Architecture — только по будущей approved evidence policy |
| `automatic_ineligible_allowed` | **`NO`** для всех 20 в этом draft (§4.3) |
| §14.3 условие 1 (заранее утверждён) | Не выполнено — Feature Schema не утверждена |
| §14.3 условие 2 (явно задан стороной, не model inference) | Выполнено для всех 20 — прямой пользовательский ввод |
| §14.3 условие 3 (подтверждена разрешённым источником) | Не выполнено — см. §4.2 |
| §14.3 условие 4 (не protected/proxy/discriminatory) | **`PROVISIONAL_PENDING_LEGAL_REVIEW`** для всех 20 — см. §5.4. Документ **не** объявляет это условие выполненным; business-category- и geography-признаки (№5, 16–19) отдельно отмечены как требующие целевой LEGAL-проверки |
| §14.3 условие 5 (нет unknown/conflict/legal interpretation) | Условно — выполнено при `value_state=PRESENT`; при `NOT_APPLICABLE` конфликта не возникает (constraint не выражен); при `value_state=UNKNOWN` (§3.2, §5.2 случай b) условие **не выполнено** — это и есть unknown-case, `INELIGIBLE` запрещён |
| §14.3 условие 6 (reason code, rule version, evidence ref, human review) | Не спроектировано этим draft — конкретный `reason_code` per feature — предмет `MATCHING_QUALIFICATION_POLICY` при утверждении, stable pattern (не конкретный публичный каталог) может выглядеть как `LM-MATCH-HARD-CONSTRAINT-<feature_id>`, не утверждается здесь как публичный catalog; каталог и routing принадлежат `MATCHING_QUALIFICATION_POLICY`, не единолично Feature Schema |
| Owner/approvers | PRODUCT (исходная классификация полей в `hard_constraints`), Chief AI Architect (формализация условия 1; координация условия 6 совместно с `MATCHING_QUALIFICATION_POLICY`), DEVELOPMENT (реализуемость операторов и compatibility/mapping tables, включая №8, 15, 20), LEGAL (условие 4, провизорно — §5.4), AI (условие 3 совместно с PRODUCT/LEGAL/Chief AI Architect) |

`rent_rate_fit` (№4) — **отдельно**: требуемая decimal precision/rounding для `effective_rate = property_monthly_rent_rub ÷ property_area_sqm` **не определена** этим draft — зафиксировано как `BLOCKED_PENDING_DECISION`, чтобы не создать boundary bug (например, объект ровно на границе `rate_max` может пройти или не пройти в зависимости от невыбранного правила округления).

### 5.3. Budget/operating-expenses determinability — `budget_fit` и `rent_rate_fit`

`property_monthly_rent_rub` и `request_monthly_budget_max_rub` (и производный `effective_rate` для `rent_rate_fit`) сравнимы напрямую **только если базис обеих сторон согласован**. Оба флага — `property_operating_expenses_included` (обязательное поле Property) и `request_budget_includes_operating_expenses` (обязательное поле TenantRequest) — уточняют, включает ли соответствующая денежная сумма эксплуатационные расходы, а не задают отдельную числовую сумму расходов (числового поля суммы эксплуатационных расходов не существует ни на одной стороне).

| Комбинация флагов | Базис согласован? | Поведение `budget_fit`/`rent_rate_fit` |
| --- | --- | --- |
| `property_operating_expenses_included = true` и `request_budget_includes_operating_expenses = true` | Да — обе суммы «all-in» | `rent ≤ budget_max` вычисляется нормально |
| `property_operating_expenses_included = false` и `request_budget_includes_operating_expenses = false` | Да — обе суммы «только базовая аренда» | `rent ≤ budget_max` вычисляется нормально |
| Флаги различаются (в любую сторону) | **Нет** | Полное соответствие **доказать нельзя** — числовая сумма эксплуатационных расходов отсутствует на обеих сторонах. `registry_readiness` правила сравнения для этой комбинации флагов — `BLOCKED_PENDING_DECISION` (§3.1) до отдельного PRODUCT-решения о правиле интерпретации и/или нового числового поля суммы расходов; это design-time-статус самого правила. Активный scored `FeatureValue` по этому правилу не производится (§3.1) — нет `PASS`, `FAIL`, автоматического `INELIGIBLE` (согласовано с §4.3); если для диагностики сохраняется candidate-запись, она MAY иметь `value_state = UNKNOWN` (§3.2, diagnostic-only, не активный scored результат) |

Это правило применяется одинаково к `budget_fit` (№3) и `rent_rate_fit` (№4), поскольку оба используют одну и ту же базовую денежную величину аренды.

### 5.4. §14.3(4) — provisional verdict, не финальное решение

Условие 4 §14.3 Architecture («не protected attribute/proxy/discriminatory restriction») **не объявляется выполненным** этим документом ни для одной из 20 строк. DEVELOPMENT-черновик может дать только provisional/technical оценку («по доступному тексту не выглядит как защищённый признак»); окончательный verdict требует LEGAL review, которого этот документ не проходил. Особое внимание для будущего LEGAL review:

- **`business_category_allowed`** (№5) — категория деятельности потенциально пересекается с отраслевыми ограничениями и требует проверки на дискриминационность независимо от того, что она уже явно задана стороной (условие 2 выполнено, условие 4 — нет);
- **географические признаки** (№16–19, `country_code_membership`/`region_membership`/`city_membership`/`districts_membership`) — географические ограничения потенциально способны коррелировать с защищёнными признаками через демографию района/города; требуют отдельной LEGAL-проверки на дискриминационный эффект прежде, чем считаться подтверждёнными Hard Constraints.

Автоматический `INELIGIBLE` запрещён (`automatic_ineligible_allowed = NO`, §4.3, §5.2) для всех 20 строк независимо от исхода будущего LEGAL review.

---

## 6. Non-exclusion facts и soft/ranking candidates

### 6.1. Combined fact / informational (не Hard Constraint)

| `feature_id` | Bootstrap path | Классификация |
| --- | --- | --- |
| `combined_minimum_term_fact` | `hard_constraints.min_lease_months` на обеих сторонах (`property_min_lease_months`, `request_min_lease_months`) | Non-exclusion candidate input для Deal Feasibility / `MATCHING_QUALIFICATION_POLICY` — оба значения могут быть удовлетворены сроком `≥ max(property_min, request_min)`; сам этот факт (минимальный совместимый срок) может быть полезен как информационный/deal-feasibility сигнал, но не как reject rule |
| `utilities_included_fact` | `hard_constraints.utilities_included` = `property_utilities_included` (Property-only) | **Informational, не reject rule.** У `TenantRequest` нет парного hard-limit или preference поля по коммунальным платежам — сравнивать не с чем. Направление предпочтения не изобретается; статус — informational fact, доступный для будущего Deal Feasibility signal, не exclusion |
| `security_deposit_fact` | `hard_constraints.security_deposit_rub` = `property_security_deposit_rub` (Property-only, опционально) | **Informational, не reject rule.** У `TenantRequest` нет парного поля обеспечительного платежа вообще (ни лимита, ни preference). Статус — informational fact, `BLOCKED_PENDING_DECISION` для любого сравнения — не изобретается ни направление, ни числовой порог |

### 6.2. Soft candidates — точно по `soft_preferences.*` bootstrap-блоку

Продуктовый контракт (§10.1–10.3 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`) относит к `soft_preferences` ровно два поля:

| `feature_id` | Bootstrap path | Source fields | Классификация |
| --- | --- | --- | --- |
| `target_tenant_category_preference` | `soft_preferences.target_tenant_categories` (need_tenant) | `property_target_tenant_categories` (массив, подмножество allowed) × `request_business_category` | `SOFT_FIT_CANDIDATE`, direction явно выражен пользователем (owner явно указал предпочтение) |
| `location_priority_alignment` | `soft_preferences.location_priorities` (need_property) | `request_location_priorities` (0..5 из 10 значений enum `location_priority`) | `SOFT_FIT_CANDIDATE` только частично — см. разбивку ниже |

**Разбивка `location_priority_alignment` по всем 10 значениям enum:**

| Значение `location_priority` | Property-эквивалент | Статус |
| --- | --- | --- |
| `parking` | `property_parking_spaces > 0` | `SOFT_FIT_CANDIDATE` (derivable без новых данных) |
| `loading_access` | `property_loading_access ≠ none` | `SOFT_FIT_CANDIDATE` (derivable без новых данных) |
| `near_home`, `near_customers`, `city_center`, `near_metro`, `near_shopping_center`, `near_business_center`, `first_line`, `high_visibility` | Нет соответствующего Property-поля в `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` | `BLOCKED_PENDING_DECISION` — требует нового PRODUCT-поля на стороне Property для каждого значения либо отдельного geo-сервиса (§7.4) |

Веса/формулы Feature Fit для `target_tenant_category_preference` и `location_priority_alignment` этим документом **не задаются** (§1.2).

### 6.3. Ranking-only candidate

| `feature_id` | Bootstrap path | Обоснование |
| --- | --- | --- |
| `deal_priority` | `strategy_preferences.deal_priority` (`property_deal_priority` / `request_deal_priority`) | Прямая цитата `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §10.1: «`strategy_preferences` — подтверждённый приоритет ведения Campaign; **не является фильтром Candidate**». Кандидат на ranking-modifier этапа Rank & Diversify (§14 этап 7 Architecture), не на `Dimension Score` arithmetic. Финальное размещение — решение AI+PRODUCT (§10) |

### 6.4. Diagnostic-only / blocked / excluded soft candidates

| `feature_id` | Классификация | Обоснование |
| --- | --- | --- |
| `budget_headroom` | Diagnostic/evaluation candidate, **не** утверждённый monotonic Feature Fit | `TenantRequest` не выражает целевую цену, только максимум (`request_monthly_budget_max_rub`) — направление и форма зависимости не определены пользователем; direction = `NOT_EXPRESSED` |
| `expected_occupancy_signal` | `BLOCKED_PENDING_DECISION` | `request_expected_occupancy_people` есть, симметричного Property capacity-поля нет; вывод capacity из площади не утверждён никаким источником |
| `business_stage_signal` | `EXCLUDED_FROM_V0_1` | `request_business_stage` — `subject_snapshot`, не `soft_preferences`; риск функционировать как proxy операционного риска/кредитоспособности (пересечение с Risk Score §17 Architecture, «операционная несовместимость») требует LEGAL+PRODUCT решения до включения (§14.3 условие 4, §30.2) |

**Удалены из v0.1 как невыраженные предпочтения** (не включены нигде в этот документ): `area_centeredness` (TenantRequest не утверждает, что midpoint диапазона предпочтительнее границ), `parking_preference_fit` и `access_mode_fit` как отдельные soft-признаки (оба поля фактически лежат в `hard_constraints` — см. `parking_min_fit`/`access_mode_hard_fit` §5).

---

## 7. Gate-only / protected / forbidden classifications

### 7.1. Identity/authority — архитектурное напряжение

| `feature_id` | Классификация | Обоснование |
| --- | --- | --- |
| `identity_authority_verification_status` | `GATE_ONLY_CANDIDATE` (не числовой Owner Fit input) | Architecture §15.2 явно перечисляет «подтвержденность личности, организации и полномочий» среди критериев Owner Fit; §18.3 (Participation Gate) и §31 (таблица автоматических решений) описывают identity/authority как внешне verified факт, не Matching-стадийный вход. Это нерешённое напряжение между двумя нормативными разделами, а не отсутствие текста. Fail-closed позиция: raw evidence (документы, доверенности) никогда не входит в реестр; versioned external status/ref может стать `GATE_ONLY_CANDIDATE` только после отдельного cross-functional решения, снимающего напряжение — не решается этим документом |

### 7.2. Previous contact — analysis signal vs final decision

| `feature_id` | Классификация | Обоснование |
| --- | --- | --- |
| `previous_contact_analysis_signal` | `GATE_ONLY_CANDIDATE`, не gate decision, не score без policy | Прямая цитата Architecture §31: «Прежний контакт — Только сигнал и анализ… Итог подтверждает уполномоченный reviewer по доказательствам». Matching Engine может производить неитоговый analysis signal |
| Итоговый статус Previous Contact Gate (`NOT_DECLARED`/…/`NO_PREVIOUS_CONTACT_CONFIRMED`) | `OUT_OF_SCOPE` | Исключительно внешний Gate, §18.4 Architecture: «Matching Engine не принимает решение» |

### 7.3. Прочие внешние факты

| `feature_id` | Классификация | Обоснование |
| --- | --- | --- |
| `payer_resolution_status` | `OUT_OF_SCOPE` | §19 Architecture — определяется после Match |
| Payment/Fiscal Ledger статусы (`ADVANCE_SETTLED_AND_FISCALIZED` и т.п.) | `OUT_OF_SCOPE` | §18.5 Architecture — исключительно внешний Payment Gate |
| Reveal-связанные факты | `OUT_OF_SCOPE` | §18.6–18.7 Architecture — исключительно внешние gates, post-match |

### 7.4. Geography / exact address

Coarse geography (`property_country_code`/`region`/`city`/`districts` и их TenantRequest-парные поля `request_country_code`/`region`/`cities`/`districts`) в этом draft участвует **только** как **`ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE`** — признаки №16–19 §5.1 (точное/множественное совпадение страны/региона/города/района, вытекающее из PRODUCT-классификации соответствующих полей в блок `hard_constraints.*`, §10.3 источника). Она **не** является одновременно source-полем для `location_priority_alignment` (§6.2) — это неверное утверждение предыдущей редакции, исправлено ниже.

`location_priority_alignment` — отдельный **soft-preference вход** из независимого блока `soft_preferences.location_priorities` (`request_location_priorities` — самостоятельное enum-поле, не `request_cities`/`request_districts`). Из 10 значений этого enum только 2 (`parking`, `loading_access`) сейчас derivable — и оба выводятся из `property_parking_spaces`/`property_loading_access` (§6.2), которые **не** являются geography-полями и не пересекаются с №16–19 ни по source, ни по семантике. Оставшиеся 8 значений (`near_home`, `near_customers`, `city_center`, `near_metro`, `near_shopping_center`, `near_business_center`, `first_line`, `high_visibility`) — `BLOCKED_PENDING_DECISION` именно потому, что **ни `property_city`/`property_districts`, ни любое другое coarse-geography поле не позволяет их вычислить**: требуется либо новое PRODUCT-поле на стороне Property для каждого значения, либо отдельный geo-сервис (§6.2, §10 пункт 11). Coarse hard geography (№16–19) **не подставляется** вместо этих 8 отсутствующих сигналов и не считается их soft-input этим документом ни в каком виде.

Итог: hard-исключение по географии (№16–19) и soft location priorities (§6.2) — полностью разделены и по source-полям, и по механизму вычисления; единственное текущее пересечение — оба используют один и тот же уровень огрубления данных (страна/регион/город/район) как *концепцию*, но не как общий вычислительный вход.

| `feature_id` | Классификация | Обоснование |
| --- | --- | --- |
| `property_exact_address`, точные координаты (raw) | `FORBIDDEN_IN_SCORING_V0_1` **и** `FORBIDDEN_IN_PRESENTATION_TELEMETRY_LOGS` (постоянно, не только v0.1) | Architecture §9.4 — точный адрес «только в защищенном контуре»; PRODUCT классифицирует `property_exact_address` как `protected_commercial_data` (§12.3 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`), физически отделено (отдельная таблица `property_address`, §9.2 источника) — запрет действует по причине защищённого статуса, **не** потому что поле приравнено к прямому персональному идентификатору (см. §1.3) |
| Вычисленное расстояние/зона доступности | `PROTECTED_INTERNAL_ONLY_CANDIDATE` | Architecture §9.4 explicitly допускает «расстояния, зоны доступности… как вычисленные признаки». Гипотетический будущий сервис мог бы производить derived distance/zone без раскрытия raw координат Matching Engine — требует отдельного lawful basis, purpose binding, access control и approval; не существует сейчас, не разрешается этим документом |
| `property_country_code`/`region`/`city`/`districts` (текст/enum, coarse) | `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE` **только** (№16–19, §5.1) — **не** source-поле `location_priority_alignment` (§6.2, §7.4 исправлено) | Тот же уровень огрубления, что уже используется в существующем Analysis (Pricing/Competition Analyzer, §11.2 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`); риск повторной идентификации через редкие комбинации (§30.2 Architecture) не имеет утверждённого численного порога — **не изобретается этим документом**, зафиксировано как открытое решение (§10, пункт 7) |

### 7.5. Прямые запреты без исключений

Прямые идентификаторы (ФИО/телефон/email/документы), свободный текст без safe-classification policy (`property_additional_requirements`, `request_additional_requirements`, `*_other`-уточнения), платёжные реквизиты, защищённые/proxy-признаки — `FORBIDDEN`, не входят в реестр ни в каком виде (§1.3, §8.2 Architecture, §12.1 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`).

---

## 8. Freshness matrix

| Домен | Класс (из 5, см. ниже) | Правило v0.1 | Статус |
| --- | --- | --- | --- |
| Property/TenantRequest — **все** поля §5–§6, включая `property_available_from` и `request_move_in_by` | 1. revision-bound | Значение валидно только для `(aggregate_id, revision)`, использованной при снятии снэпшота; смена `revision` инвалидирует **любой** ранее вычисленный `FeatureValue` без исключения и без отдельного TTL — расширение уже нормативного правила `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §13 («каждое изменение… увеличивает `revision`… результат другой ревизии считается `stale`») на нового потребителя (Matching Engine). Ни одно поле, включая обе даты ниже, не освобождено от этой инвалидации | `READY_AS_CANDIDATE_ONLY` |
| `property_available_from` — **дополнительное** правило, применимое только внутри одной и той же ещё актуальной `revision` (не заменяет revision-инвалидацию выше) | 1, plus same-revision calendar-time overlay | Пока `revision` не изменилась: прохождение календарной даты `property_available_from` **не** делает признак `stale` само по себе — трактуется как «доступно сейчас», дословно §7.4.9 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`. Если же `revision` изменилась — действует обычная revision-инвалидация выше, это правило её не отменяет | `READY_FOR_DRAFT` — правило скопировано как есть, не изобретено |
| `request_move_in_by` — **дополнительное** правило, применимое только внутри одной и той же ещё актуальной `revision` (не заменяет revision-инвалидацию выше) | 1, plus same-revision calendar-time overlay | Пока `revision` не изменилась: прохождение календарной даты `request_move_in_by` требует Human Decision Gateway; AI Manager не меняет дату сама, дословно §8.4.7 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`. Если же `revision` изменилась — действует обычная revision-инвалидация выше, это правило её не отменяет | `READY_FOR_DRAFT` |
| Identity/authority | 5. external gate status (candidate) | Формулировка-кандидат: «current versioned projection/ref, invalidated by status/version/revocation event» — **предложение**, не подтверждённый механизм; сам факт, что Matching Engine получает доступ к этой projection, не подтверждён (§7.1) | `BLOCKED_PENDING_DECISION` |
| Per-value time-bound freshness (`Проверено`/`Актуально до`, §11 Architecture) | 3. time-bound | Принцип существует в Architecture, конкретный численный TTL не задан ни для одного текущего поля ни в Architecture, ни в PRODUCT-источниках | `BLOCKED_PENDING_DECISION` — численный TTL не вводится этим документом |
| Evidence-статус (§13 enum) | 4. immutable evidence | Сам evidence-объект не «протухает» физически; его *статус применимости* может стать `REJECTED`/`STALE`/`CONFLICTING` — enum используется как есть | `READY_FOR_DRAFT` |
| «Готовность» (`business_stage`, срок активности TenantRequest) | Класс не определён | Специальный TTL «как долго TenantRequest считается активным поиском» отсутствует в текущей модели данных | `BLOCKED_PENDING_DECISION` |

**Пять классов freshness (справочно, не переопределяются):** 1 — revision-bound; 2 — event-invalidated (актуально до конкретного доменного события/изменения статуса); 3 — time-bound (`observed_at`/`verified_at` + TTL); 4 — immutable evidence (не протухает, но может быть superseded/revoked); 5 — external gate status (не scoring feature, всегда текущая projection/версия).

`revoked` — это applicability state конкретного значения (ось `processing_eligibility`, §3), **не** отдельный добавленный элемент канонического `evidence_status` enum §13 Architecture, который его не содержит.

Ни один численный TTL (дни/часы/минуты) для полей помещения, спроса, полномочий или готовности не зафиксирован как норма этим документом.

---

## 9. Versioning и replay compatibility

- **Reproducibility version bundle:** `feature_schema_version + scoring_policy_version + risk_policy_version + qualification_policy_version` и соответствующие hashes — обязательный согласованный набор по §49 Architecture. Раздельное обновление одной версии без явного анализа совместимости всего набора запрещено.
- **Backward-compatible (additive) изменение** — добавление нового `feature_id` безопасно **только если одновременно**: (а) он не входит ни в одну активную формулу/условие `MATCHING_SCORING_POLICY`, `MATCHING_RISK_POLICY` или `MATCHING_QUALIFICATION_POLICY`, и (б) старый consumer имеет явно утверждённое ignore-поведение для неизвестных `feature_id` — не молчаливое допущение.
- **Breaking изменение** — переименование/удаление `feature_id`, изменение типа/диапазона/direction/dimension, изменение обязательности, **или включение** нового/существующего признака в активную scoring/risk/qualification арифметику (даже если сам признак optional по данным) — всегда breaking для replay, требует новой major-версии Feature Schema и координированного обновления всех затронутых policy versions/hashes из bundle выше.
- Любое изменение активного состава признаков или их семантики требует нового прогона `MATCHING_EVALUATION_PLAN`.
- **Canonical ordering/serialization:** порядок `feature_id` в любом сохраняемом снэпшоте — лексикографический по code point (без `localeCompare`, без зависимости от locale/ICU), тот же принцип детерминированности, что уже принят для `MATCHING_SCORING_POLICY` (fixed-point decimal, round-half-to-even на зафиксированных чекпоинтах) и для replay-контракта §49 Architecture.
- Silent reinterpretation сохранённых `FeatureValue` под новой семантикой schema **запрещена** без исключений.

---

## 10. Явные открытые решения (не закрываются этим документом)

| № | Открытое решение | Owner |
| --- | --- | --- |
| 1 | `required_evidence_level` per feature/source — достаточен ли `input_validated` сам по себе, либо нужен отдельный verification step | PRODUCT + AI + Chief AI Architect |
| 2 | Compatibility table `entrance_type × entrance_requirement` | PRODUCT + DEVELOPMENT |
| 3 | Compatibility/ordering table `access_mode` (4 значения) | PRODUCT + DEVELOPMENT |
| 4 | Decimal precision/rounding для `rent_rate_fit` | DEVELOPMENT + AI |
| 5 | Доступность `identity_authority_verification_status` для Matching Engine на этапе scoring (§7.1 напряжение §15.2 vs §18.3/§31) | Chief AI Architect + LEGAL |
| 6 | Численный TTL для time-bound freshness (класс 3) | PRODUCT + AI, через `MATCHING_EVALUATION_PLAN` |
| 7 | Порог агрегации/минимального candidate pool size против повторной идентификации через coarse-location + narrow category + rare feature (§30.2) | PRODUCT + LEGAL |
| 8 | Размещение `deal_priority` — Dimension Score input vs исключительно ranking-modifier | AI + PRODUCT |
| 9 | Правомерность `business_stage_signal` как fit-фактора (не Risk-фактора и не запрещённого proxy) | LEGAL + PRODUCT |
| 10 | Направление/форма зависимости `budget_headroom` (или отказ от него) | PRODUCT + AI |
| 11 | Новые PRODUCT-поля для 8 из 10 значений `location_priority` на стороне Property, и Property capacity-поле для `expected_occupancy_signal` | PRODUCT |
| 12 | Калибровка `Feature Fit`/интерфейса `Evidence Confidence` (сам интерфейс — §3 этого документа; калибровка — вне объёма) | `MATCHING_SCORING_POLICY` + `MATCHING_EVALUATION_PLAN` |
| 13 | Публичный `reason_code` каталог и routing `MATCHING_QUALIFICATION_POLICY` для всех 20 hard-constraint candidates | `MATCHING_QUALIFICATION_POLICY`, Chief AI Architect |
| 14 | Метод строкового сопоставления geography-полей (`region_membership`, `city_membership`, `districts_membership`, №17–19) — точное совпадение, регистронезависимость или catalog-id | PRODUCT + DEVELOPMENT |
| 15 | Mapping-таблица `property_floor` (integer, опционально `total_floors`) → enum `floor_option` для `floor_option_fit` (№20) | PRODUCT + DEVELOPMENT |
| 16 | Правило интерпретации при рассогласовании `property_operating_expenses_included`/`request_budget_includes_operating_expenses` (§5.3) — принять более строгую трактовку, ввести новое числовое поле суммы эксплуатационных расходов, либо иное решение | PRODUCT |
| 17 | Финальный LEGAL verdict по §14.3 условию 4 для всех 20 кандидатов, с приоритетной проверкой `business_category_allowed` (№5) и geography-признаков (№16–19) на дискриминационный эффект (§5.4) | LEGAL |
| 18 | Утверждение полного runtime `value_state`/`processing_eligibility` enum за пределами минимального draft-набора §3.2 (включая возможное разделение текущего `UNKNOWN` на активный runtime-случай и diagnostic-only candidate-случай, §3.1/§3.2) | Chief AI Architect + DEVELOPMENT + AI |
| 19 | Интеграционный контракт (API/событие), которым purpose-bound Lawful Basis/Consent Registry projection/invalidation (Architecture §11, §21.3, §40.1) передаётся Matching Engine (§3.3) | Chief AI Architect + DEVELOPMENT + LEGAL |

---

## 11. Readiness matrix и acceptance criteria

### 11.1. Readiness matrix

Четыре категории этой матрицы — это одновременно ровно четыре top-level значения design-time-поля `registry_readiness` (§3.1); `BLOCKED_PENDING_COMPATIBILITY_TABLE` не является пятой параллельной категорией — это `readiness_reason`-подтип при `BLOCKED_PENDING_DECISION` (§3.1). Ни одна из четырёх категорий не является и не становится значением runtime `value_state` конкретного вычисленного `FeatureValue` — соответствующее runtime-последствие для затронутых элементов см. §3.1/§3.2 (diagnostic-only `UNKNOWN`).

| Категория | Элементы |
| --- | --- |
| `READY_FOR_DRAFT` | `FeatureValue` envelope §3; orthogonal state model §3/§4; revision-инвалидация без исключений + same-revision calendar-time overlay для `property_available_from`/`request_move_in_by` (§8, скопировано дословно); evidence-статус §13 Architecture как есть; boundary matrix §2; versioning-правила §9 |
| `READY_AS_CANDIDATE_ONLY` | Все 20 строк §5.1 как `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE` (bootstrap mapping и operator-направление определены для всех; полный operator/mapping не определён для №8, 15, 20 — см. `BLOCKED_PENDING_DECISION`; метод строкового сопоставления не определён для №17–19 при определённом направлении); `target_tenant_category_preference`; `location_priority_alignment` только для `parking`/`loading_access` (оба выводятся из Property-полей, не из geography, §7.4); revision-bound freshness как расширение на Matching Engine; coarse country/region/city/district geography **только** как hard-constraint candidates №16–19 (§7.4 — не source-поле `location_priority_alignment`); `combined_minimum_term_fact`; `utilities_included_fact` (informational); `deal_priority` как ranking-only candidate; `previous_contact_analysis_signal` и `identity_authority_verification_status` как `GATE_ONLY_CANDIDATE` |
| `BLOCKED_PENDING_DECISION` | Все 19 пунктов §10; operator/mapping №8 (`entrance_requirement_fit`), №15 (`access_mode_hard_fit`), №20 (`floor_option_fit`) — все три с `readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE` (§3.1); метод строкового сопоставления №17–19 (`region`/`city`/`districts_membership`); `budget_fit`/`rent_rate_fit` при рассогласованном operating-expenses базисе (§5.3); `security_deposit_fact` (любое сравнение); `location_priority_alignment` для 8 из 10 значений; `expected_occupancy_signal`; `budget_headroom` направление; `required_evidence_level` для всех 20 hard-constraint candidates; итоговый LEGAL verdict по §14.3 условию 4 (§5.4) |
| `EXCLUDED_FROM_V0_1` | `min_lease_term_compatibility` как derived hard constraint (сырые поля — `combined_minimum_term_fact`); `area_centeredness`; `parking_preference_fit`/`access_mode_fit` как отдельные soft-признаки; `business_stage_signal` как fit-фактор; любой raw identity/authority/previous-contact/payer/payment payload; `property_exact_address`/координаты в scoring и в presentation/telemetry/logs |

### 11.2. Acceptance criteria

#### `MFS-C-001` — validation не подразумевает evidence confirmation

**Given:** признак из реестра §5 успешно прошёл серверную schema/business-rule валидацию (`input_validated = true`).
**When:** запрашивается его `evidence_status`.
**Then:** значение — `UNVERIFIED`, если отдельная approved policy не установила достаточный `required_evidence_level` и не перевела `evidence_status` в иное каноническое значение §13 Architecture; `input_validated = true` само по себе не переводит запись в `SOURCE_CONFIRMED` или `CONTENT_VERIFIED`. Этот документ не вводит производных `source_confirmed`/`content_verified` полей или иерархии между статусами `evidence_status` — только сам канонический enum (§3.3).

#### `MFS-C-002` — полнота hard-constraint реестра, включая geography и floor, и отсутствие ложного min-lease constraint

**Given:** реестр §5.1, полностью сверенный с `hard_constraints.*` блоками §10.2/§10.3 `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`.
**When:** подсчитывается число уникальных `feature_id`.
**Then:** ровно 20, включая `country_code_membership` (№16), `region_membership` (№17), `city_membership` (№18), `districts_membership` (№19) и `floor_option_fit` (№20); среди них отсутствует `min_lease_term_compatibility`; `property_min_lease_months`/`request_min_lease_months` присутствуют только как `combined_minimum_term_fact` (§6.1), не как reject rule.

#### `MFS-C-003` — rate + total budget одновременно, rounding заблокирован

**Given:** `request_monthly_rent_rate_max_rub_per_sqm` задан вместе с `request_monthly_budget_max_rub`.
**When:** оценивается применимость `rent_rate_fit` (№4) и `budget_fit` (№3).
**Then:** оба ограничения применяются одновременно (§5.1, №4), как того требует §8.4.8 источника; точная decimal precision/rounding для `effective_rate` помечена `BLOCKED_PENDING_DECISION` (§5.2), не определена этим документом.

#### `MFS-C-004` — entrance/access/floor заблокированы без compatibility/mapping table

**Given:** `entrance_requirement_fit` (№8), `access_mode_hard_fit` (№15) или `floor_option_fit` (№20).
**When:** запрашивается их comparison operator.
**Then:** для всех трёх возвращается `registry_readiness = BLOCKED_PENDING_DECISION` с `readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE` (§3.1), не `=` и не любой другой изобретённый оператор; все три перечислены в §10 как открытые решения PRODUCT+DEVELOPMENT (пункты 2, 3, 15).

#### `MFS-C-005` — constraint не выражен (случай a, §5.2) — не pass/fail

**Given:** hard-constraint candidate из §5.1 с optional TenantRequest-полем (например, `power_min_kw`), не заданным пользователем.
**When:** вычисляется сравнение.
**Then:** сравнение не выполняется; `value_state = NOT_APPLICABLE`; признак не получает ни `PASS`, ни `FAIL`, не участвует ни в каком exclusion-решении; это случай (a) §5.2 — отличается от случая (b), см. `MFS-C-015`.

#### `MFS-C-006` — automatic INELIGIBLE запрещён в этом draft

**Given:** любой из 20 hard-constraint candidates §5.
**When:** запрашивается `automatic_ineligible_allowed`.
**Then:** значение — `NO` для всех 20, независимо от `value_state`/`evidence_status`; согласовано с §4.3 и с provisional-статусом §14.3 условия 4 (§5.4).

#### `MFS-C-007` — отсутствие весов/порогов/routing

**Given:** любой раздел этого документа.
**When:** выполняется поиск численного веса измерения, калиброванной формулы `Feature Fit`, Risk-порога или routing-правила `QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING`.
**Then:** ни один не найден; такие элементы явно отнесены к `MATCHING_SCORING_POLICY`/`MATCHING_RISK_POLICY`/`MATCHING_QUALIFICATION_POLICY` (§1.2, §2).

#### `MFS-C-008` — ортогональность состояний

**Given:** `FeatureValue` с `value_state = PRESENT` и `evidence_status = UNVERIFIED`.
**When:** оценивается `processing_eligibility`.
**Then:** три оси оцениваются независимо; `PRESENT` + `UNVERIFIED` — валидная комбинация (пользователь ввёл значение, оно не подтверждено независимо); `processing_eligibility ≠ ALLOWED` блокирует использование значения независимо от состояния двух других осей (§3, §8).

#### `MFS-C-009` — revision-инвалидация без исключений + отдельное same-revision calendar-time правило для дат

**Given (часть А):** `Property`/`TenantRequest` с `revision = N`, затем изменённые до `revision = N+1`.
**When:** запрашивается freshness ранее вычисленного `FeatureValue`, привязанного к `revision = N`, включая `FeatureValue` для `timing_compatibility` (№7), построенный на `property_available_from` и `request_move_in_by`.
**Then:** значение инвалидируется (класс 1, revision-bound) **без исключений**, включая оба поля дат — revision-инвалидация применяется к ним точно так же, как к любому другому полю §5–§6.

**Given (часть Б):** `revision` остаётся неизменной (`= N`), но текущая календарная дата прошла указанную в `property_available_from` или `request_move_in_by`.
**When:** запрашивается `value_state` соответствующего поля в рамках той же `revision`.
**Then:** это отдельное, **дополнительное** правило поверх revision-инвалидации, не заменяющее её: `property_available_from` не становится `stale` — трактуется как «доступно сейчас» (§7.4.9 источника); `request_move_in_by` требует Human Decision Gateway, AI Manager не меняет дату сама (§8.4.7 источника). Ни одна из этих формулировок не отменяет и не ослабляет revision-инвалидацию из части А.

#### `MFS-C-010` — защищённые геопризнаки не пересекают границу; coarse hard geography не подменяет отсутствующие soft location signals

**Given:** `property_exact_address` или точные координаты.
**When:** запрашивается их классификация для scoring, presentation, telemetry или logs.
**Then:** `FORBIDDEN_IN_SCORING_V0_1` и `FORBIDDEN_IN_PRESENTATION_TELEMETRY_LOGS` одновременно, без исключений, и без обозначения `property_exact_address` как прямого персонального идентификатора (§1.3, §7.4); вычисленное расстояние/зона — только `PROTECTED_INTERNAL_ONLY_CANDIDATE`, не реализовано.

**Given:** coarse geography (`property_country_code`/`region`/`city`/`districts` и парные TenantRequest-поля) и `location_priority_alignment` (§6.2).
**When:** запрашивается их классификация и взаимная зависимость.
**Then:** coarse geography участвует **только** как `ELIGIBILITY_HARD_CONSTRAINT_CANDIDATE` (№16–19, §5.1); она **не** является source-полем `location_priority_alignment` и не подставляется вместо 8 из 10 значений `location_priority`, для которых Property-поле/geo-сервис отсутствует (`near_home`, `near_customers`, `city_center`, `near_metro`, `near_shopping_center`, `near_business_center`, `first_line`, `high_visibility`; §6.2, §7.4) — эти 8 остаются `BLOCKED_PENDING_DECISION`, а не выводятся из `property_city`/`property_districts`; derivable сейчас только `parking`/`loading_access`, оба из отдельных Property-полей (`property_parking_spaces`/`property_loading_access`), не из geography.

#### `MFS-C-011` — координированный version bundle

**Given:** изменение, добавляющее новый `feature_id` в активную scoring/risk/qualification арифметику.
**When:** оценивается совместимость.
**Then:** изменение классифицируется как breaking; требуется координированное обновление `feature_schema_version` и всех затронутых `scoring_policy_version`, `risk_policy_version`, `qualification_policy_version` вместе с их hashes, а также новый прогон `MATCHING_EVALUATION_PLAN`; раздельное обновление без анализа совместимости полного reproducibility bundle запрещено (§9, §49 Architecture).

#### `MFS-C-012` — gates остаются заблокированными, реализация не разрешена

**Given:** этот документ утверждён на уровне draft (`Proposal for cross-functional review`).
**When:** оценивается статус `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE`, `PRODUCTION_LAUNCH_GATE` и допустимость работы в `apps/**`.
**Then:** все три gate остаются `BLOCKED` (условие §36.2.2 требует одновременного утверждения всех шести артефактов, не только Feature Schema); вопрос №11 §37 остаётся open; реализация Matching Engine в `apps/**` не разрешена.

#### `MFS-C-013` — запрет ложного budget pass при неизвестных operating expenses

**Given:** `budget_fit` (№3) или `rent_rate_fit` (№4) с `property_operating_expenses_included` и `request_budget_includes_operating_expenses`, имеющими **разные** булевы значения (basis mismatch, §5.3).
**When:** вычисляется сравнение `rent ≤ budget_max` (или `effective_rate ≤ rate_max`).
**Then:** признак **не** получает автоматический `PASS`; `registry_readiness` этого правила сравнения — `BLOCKED_PENDING_DECISION` (§3.1, §5.3, design-time-статус); активный scored `FeatureValue` по этому правилу не производится (§3.1) — нет `PASS`, `FAIL`, автоматического `INELIGIBLE` (согласовано с `MFS-C-006`); если для диагностики сохраняется candidate-запись, она MAY иметь `value_state = UNKNOWN` (§3.2), что не является активным scored результатом и не утверждённым публичным контрактом (`MFS-C-016`); полное соответствие не может быть доказано без числовой суммы эксплуатационных расходов, которой не существует ни на одной стороне (§5.3).

#### `MFS-C-014` — pending LEGAL verdict по §14.3 условию 4

**Given:** любой из 20 hard-constraint candidates §5, особенно `business_category_allowed` (№5) и geography-признаки №16–19.
**When:** запрашивается статус условия 4 §14.3 Architecture («не protected attribute/proxy/discriminatory restriction»).
**Then:** статус — `PROVISIONAL_PENDING_LEGAL_REVIEW` (§5.2, §5.4), **не** «выполнено»; документ явно не проходил LEGAL review; окончательный verdict — отдельное решение LEGAL, не самостоятельная оценка DEVELOPMENT-черновика.

#### `MFS-C-015` — constraint выражен, candidate-side значение отсутствует (случай b, §5.2) — unknown, не NOT_APPLICABLE/PASS/FAIL

**Given:** hard-constraint candidate из §5.1, у которого TenantRequest-сторона constraint **задана** пользователем (например, `request_power_min_kw = 50`), а соответствующее optional Property-поле (`property_power_kw`) **не задано**.
**When:** вычисляется сравнение.
**Then:** сравнение **не может быть выполнено доказуемо**; candidate-семантика для будущего утверждённого runtime — `value_state = UNKNOWN` (§3.2), **не** `NOT_APPLICABLE` (constraint выражен, не отсутствует) и **не** `PASS`/`FAIL`; после будущего утверждения Feature Schema и `MATCHING_QUALIFICATION_POLICY` такой результат MAY направляться в предусмотренный policy unknown/needs-verification/fail-closed path (§5.2, случай b), но этот Proposal сам routing не активирует. Правило распространяется как минимум на entrance (№8), features (№9-10), loading access (№11), power (№12), ceiling (№13), parking (№14), access mode (№15), districts (№19) и floor (№20). Это отличается от заблокированного правила сравнения (§3.1, `MFS-C-016`): здесь оператор (например, `power ≥ min`) формализован с `registry_readiness = READY_AS_CANDIDATE_ONLY`, но остаётся только кандидатом до утверждения и разрешения implementation; отсутствуют runtime-данные для его применения.

#### `MFS-C-016` — заблокированное правило не производит активный scored `FeatureValue`; design-time `registry_readiness`/`readiness_reason` никогда не становится runtime `value_state`

**Given:** правило сравнения с `registry_readiness = BLOCKED_PENDING_DECISION` (например, №8, 15, 20 с `readiness_reason = BLOCKED_PENDING_COMPATIBILITY_TABLE`; №17–19 — метод строкового сопоставления; §5.3 — operating-expenses basis mismatch).
**When:** запрашивается runtime-результат по этому правилу.
**Then:** active scored/exclusion-значимый `FeatureValue` **не производится**: нет `PASS`, `FAIL`, автоматического `INELIGIBLE`, участия в `Dimension Score`/Eligibility Filter/routing (§3.1). Если для диагностики сохраняется candidate-запись, она MAY иметь internal `value_state = UNKNOWN` (§3.2) — это diagnostic-only artefact, не active scored `FeatureValue` и не утверждённый публичный API/event-контракт. Design-time-статусы — ровно четыре значения `registry_readiness` (`READY_FOR_DRAFT`/`READY_AS_CANDIDATE_ONLY`/`BLOCKED_PENDING_DECISION`/`EXCLUDED_FROM_V0_1`, §3.1) плюс необязательный `readiness_reason`-подтип (единственное формализованное значение — `BLOCKED_PENDING_COMPATIBILITY_TABLE`) — сами по себе **никогда** не присваиваются полю `value_state`.

#### `MFS-C-017` — lawful-basis/purpose/status failure блокирует значение согласно Architecture §11

**Given:** `FeatureValue`, для которого `lawful_basis_status ∈ {EXPIRED, REVOKED, TERMINATED, SUSPENDED, UNDER_REVIEW}`, либо `lawful_basis_id` отсутствует, либо `processing_purpose` несовместим с использованием в Matching Engine (§3.3, §11 Architecture).
**When:** оценивается `processing_eligibility` и допустимость использования значения в расчёте.
**Then:** `processing_eligibility = DATA_PROCESSING_BLOCKED` (дословный термин §11 Architecture); значение **исключается** из расчёта, не передаётся агенту/модели и не используется повторно (§11 Architecture, §3.2); это не зависит от `value_state`/`evidence_status` — все три оси оцениваются независимо (`MFS-C-008`).

---

## 12. Definition of Done и последствия

Настоящий документ:

- пригоден **только** для cross-functional review (AI + PRODUCT + DEVELOPMENT + LEGAL);
- **не** закрывает открытый вопрос №11 `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` §37 — фиксирует кандидатный словарь и точную freshness-классификацию, часть которых остаётся `BLOCKED_PENDING_DECISION` (§10, §11.1);
- **не** переводит `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE` в иной статус — все остаются `BLOCKED` независимо друг от друга (§36 Architecture; подтверждено `MFS-C-012`);
- **не** требует и не выполняет синхронизацию `Controlled Artifact Manifest` (§52.1 Architecture) — запись `MATCHING_FEATURE_SCHEMA` не добавляется до реального утверждения документа; при добавлении в будущем должна использовать паттерн `pending`/`pending`/`pending`/`pending`, уже применённый в Architecture для `MATCHING_COST_ALLOCATION_DECISION`, а не изобретённые значения;
- **не** разрешает и не инициирует реализацию Matching Engine в `apps/**`;
- не изменяет `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`, `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`, controlled source/ZIP/manifest/report/log/hashes, любой review или любой PRODUCT-документ.
