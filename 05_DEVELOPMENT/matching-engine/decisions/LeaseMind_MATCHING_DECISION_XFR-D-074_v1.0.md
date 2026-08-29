# LeaseMind Matching Decision Record — XFR-D-074

**Decision ID:** `XFR-D-074`

**Название:** Geographic generalization governance boundary for Safe Presentation

**Версия:** 1.0

**Дата решения:** 2026-08-29

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-08-29 working session

**Repository baseline:** `ffff151a393fc8c8ba36cf6602de2a75f95c8689`

**Governance owner:** `PRODUCT + LEGAL`

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence design, measurement, or transformation-candidate preparation does not replace joint `PRODUCT + LEGAL` governance ownership, does not grant unilateral approval, and does not substitute `PRODUCT`/`LEGAL` determination.

**Depends on:** `XFR-D-072 v1.0` (field-allowlist governance/evidence-prerequisite boundary — this record fills one of its named evidence categories, §3.4 п.10 of `XFR-D-072`), `XFR-D-073 v1.0` (registry-key identity), `XFR-D-044 v1.0` (read-only presentation consumption), `XFR-D-011 v1.0` (internal literal geography compatibility), `XFR-D-067 v1.0` (Data Governance authority model). Re-identification method/threshold `XFR-D-M3`, combination-risk algorithm `XFR-D-075`, successive-disclosure budget `XFR-D-076`, audience/purpose model `XFR-D-080`, runtime carrier `XFR-D-082`, combination-risk evidence `XFR-D-083` and artifact approval/change control `XFR-D-084` remain independent `OPEN` decisions.

---

## 1. Вопрос

Какова governance/evidence boundary будущей geographic generalization policy для Safe Presentation, чтобы owner/approver roles, default-deny наследование от `XFR-D-072`, fail-closed handling отсутствующей/конфликтующей geography и явное разведение от смежных re-identification/internal-analysis/dataset-de-identification вопросов были однозначны, но ни один конкретный geographic field, derived signal, transformation, precision level или numeric method не был преждевременно разрешён?

## 2. Source/status discipline

Architecture §37 вопрос №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами широкого вопроса о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY`. Architecture не задаёт geographic generalization level, radius, precision, transformation или numeric threshold.

Architecture §22.1 (`SOURCE_NORMATIVE`, «До раскрытия», дословно «Запрещено передавать:») включает точный адрес и координаты — безусловный запрет — и отдельно «район, метро, ориентир, время в пути или расстояние, **если они позволяют определить объект**» — условный запрет. Условная формулировка не создаёт разрешение: пока метод и threshold re-identification risk не утверждены, любое спорное поле или комбинация остаётся fail closed (тот же принцип, что `XFR-D-072` §3.2.6 уже применяет к field allowlist в целом).

Architecture §5 принцип 13 («Matching Engine не раскрывает точный адрес, контакты или косвенные идентификаторы объекта») и §9.4 («точный адрес и координаты — только в защищённом контуре») — `SOURCE_NORMATIVE`, без ослабления.

Architecture §22.2 — прямой текстовый источник для существования generalized geography explanation вообще: «Matching Engine может использовать точную геопозицию в защищённом контуре для расчёта совместимости. Результат наружу передаётся как объяснение без раскрытия исходного значения.» Это разрешает internal use и generalized external explanation concept — не конкретный уровень генерализации, поле или метод.

Architecture §8.4/§30.2 требуют генерализации или исключения точной географии перед segment-аналитикой/обучением — это отдельная, dataset/training-специфичная de-identification процедура под authority model `XFR-D-067 v1.0` (Data Governance), не production Safe Presentation вопрос.

Safe Presentation Policy §15 открытое решение №3 (прочитано дословно): «Geographic generalization (уровень огрубления геопризнаков) | `PRODUCT + LEGAL` | Candidate, эхо Feature Schema открытого решения №7» — plain `DECISION_CANDIDATE_FOR_REVIEW`, не resolved ни одним прежним sync. Safe Presentation Policy §6.1 (candidate family, `DECISION_CANDIDATE_FOR_REVIEW`) и §8 сценарий 3 («Geography/travel signal указывает на один объект... Denominator (candidate pool size) — не определён ни одним источником») — Proposal-кандидаты, не source и не approved evidence.

**Важное canonical-identity разведение, независимо проверенное.** Safe Presentation Policy §15 называет это решение «эхо Feature Schema открытого решения №7». Feature Schema собственная §10 таблица открытых решений, строка 7 (прочитана дословно): «Порог агрегации/минимального candidate pool size против повторной идентификации через coarse-location + narrow category + rare feature (§30.2) | `PRODUCT + LEGAL`». Это — `FS-07` в Inventory §4.1 crosswalk, который является `PRIMARY_MERGED_MEMBER` merged canonical ID `XFR-D-M3` («Re-identification method/threshold», merging `FS-07 + EP-09 + MRP-10 + SPP-04`), **не** `XFR-D-074`. «Эхо» — концептуальное сходство (оба про geography-driven re-identification risk), не canonical-identity match. `XFR-D-074` (какой уровень генерализации применяется) и `XFR-D-M3` (какой метод/threshold доказывает, что генерализация безопасна) — два разных вопроса с двумя разными canonical ID; этот record не поглощает и не подменяет `XFR-D-M3`.

`XFR-D-072 v1.0` (прочитан полностью) уже явно резервирует это место: его `Depends on` называет «Geographic generalization `XFR-D-074`... remain independent `OPEN` decisions», §3.4 п.10 требует «geographic generalization evidence under `XFR-D-074` where geography/travel/location information is involved» как одну из своих собственных будущих per-row evidence categories, а §4 layer table содержит строку `Geography | XFR-D-074 | Dependency preserved | Generalization method/value`. Этот record разрешает именно этот зарезервированный, но пока не заполненный governance/evidence-prerequisite слой — не изобретает новый вопрос.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `PRODUCT + LEGAL`.** Напрямую Architecture §37 №6/§52 pair, совпадает с candidate assignment Safe Presentation Policy §15 решения №3 без отклонения.
2. **Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.** Установлены by direct precedent из `XFR-D-072 v1.0` (тот же артефакт, тот же широкий вопрос №6, та же working session), не source-named для именно этого под-вопроса напрямую — это precedent-based расширение, не Architecture-цитата.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Готовит candidate transformation/evidence, но не принимает PRODUCT/LEGAL determination и не становится unilateral approver.
4. Ни одна из ролей не заменяет и не подменяет другую; owner-пара `PRODUCT + LEGAL` не одобряет generalization level единолично, approvers не заменяют owner readiness.

### 3.2. Точный адрес и координаты — безусловный deny сохраняется

Точный адрес и координаты сохраняют source-normative pre-Reveal deny boundary (Architecture §22.1, §5 принцип 13, §9.4) без ослабления, waiver или исключения. Этот record не авторизует их в raw форме и не авторизует любую transformation, из которой raw-значение может быть reconstructed (differencing, narrow-range inference, repeated-query triangulation или иной reconstruction path).

### 3.3. Internal analysis остаётся внутренним

Internal geographic analysis под Architecture §§9.4/22.2 (использование точной геопозиции Matching Engine в защищённом контуре для расчёта совместимости) остаётся полностью внутри защищённого контура. Существование этого internal use не авторизует ни один user-facing geographic field или transformation этим record'ом — internal calculation permission и external presentation authorization остаются разными вопросами.

### 3.4. Наследование default-deny от `XFR-D-072`

Ни один geographic field, derived signal или transformation не может быть показан пользователю без собственного полного approved `XFR-D-072` row: `registry key × field/derived signal × transformation × purpose/audience × policy version/hash`. Этот record не создаёт alternate или reduced authorization path в обход `XFR-D-072` §3.2 default-deny/independent-row completeness boundary.

### 3.5. Conditionally identifying geography — ни blanket ban, ни implicit permission

District, metro, landmark, travel time, distance и иная conditionally identifying geography (Architecture §22.1, «если они позволяют определить объект») не получают ни blanket ban, ни implicit permission этим record'ом. Условная формулировка источника сохраняется буквально: до утверждения applicable method и evidence под `XFR-D-M3`/`XFR-D-075`/`XFR-D-083`, конкретный candidate row остаётся fail closed.

### 3.6. Geography-specific evidence дополняет, не сокращает `XFR-D-072`

Geography-specific evidence не уменьшает ни одну из пятнадцати минимальных evidence categories `XFR-D-072` §3.4. Она дополнительно обязана покрывать:

1. source/freshness конкретного geographic field/derived signal;
2. предлагаемую transformation/generalization concept и доказательство предотвращения raw-value leakage/reconstruction;
3. complete simultaneous payload (joint review, не отдельное per-field geography-only рассмотрение);
4. rare-location/external-searchability risk (например, редкий район или уникальная удалённость в малом candidate pool);
5. successive-disclosure risk при повторных показах;
6. purpose/audience binding конкретного получателя;
7. data classification/lawful-basis reference;
8. явную зависимость от будущих approved `XFR-D-M3` (method/threshold), `XFR-D-075` (combination-risk algorithm) и `XFR-D-083` (actual combination-risk evidence) — ни одна из них не подменяется этим record'ом.

### 3.7. Missing/unknown/conflicting geography — fail closed

1. Missing, unknown или conflicting geography данные блокируют соответствующий candidate row; row не переходит в approved состояние на основании отсутствующих данных.
2. Отсутствие данных не превращается в negative/failed вывод о самом Property/Tenant/Match.
3. Missing/unknown/conflicting geography не восстанавливается AI, heuristic inference или proxy-признаком.
4. Field может отсутствовать в user-facing presentation — это допустимый governance-состояние отсутствия authorization, а не отдельная категория evidence и не доказательство безопасности. Отсутствие поля никогда не засчитывается как completed evidence package или как proof of safety.

### 3.8. Non-compensation

1. Aggregate или common-case safety не компенсирует rare-location, joint-combination, intersection или successive-disclosure insufficiency.
2. Per-field PASS (geography field рассмотрено отдельно и признано безопасным) не заменяет joint payload evidence, требуемое `XFR-D-072` §3.5.2.
3. DLP PASS (прохождение direct-identifier проверки) не доказывает безопасность geographic quasi-identifier или его комбинаций.
4. Synthetic-only evidence не создаёт production cohort uniqueness, production searchability или production-safe geographic disclosure claim.

### 3.9. Явное non-conflation

Этот record explicitly не переоткрывает, не расширяет и не подменяет:

1. `XFR-D-011 v1.0` — governs исключительно internal literal-match geography compatibility (`region_membership`/`city_membership`/`districts_membership`) для расчёта mutual fit, не user-facing presentation generalization;
2. Architecture §8.4/§30.2 и `XFR-D-067 v1.0` — governs dataset/training de-identification под отдельной Data Governance authority, не production Safe Presentation;
3. `XFR-D-044 v1.0` — governs read-only Safe Presentation consumption Qualification result; этот record не меняет и не расширяет consumption boundary;
4. `XFR-D-073 v1.0` — governs object-type registry-key identity (CTA `property_type` reuse); geography — независимая ось, не затрагиваемая этим record'ом;
5. `XFR-D-M3` — governs re-identification method/threshold (merged `FS-07 + EP-09 + MRP-10 + SPP-04`); этот record не выбирает и не приближает ни один cohort/uniqueness method или numeric value;
6. `XFR-D-075`/`XFR-D-083` — governs combination-risk algorithm и его actual evidence;
7. `XFR-D-076` — governs successive-disclosure budget;
8. `XFR-D-080` — governs audience/purpose model;
9. `XFR-D-082` — governs runtime carrier.

### 3.10. Presentation, scoring и gate separation

Согласовано с `XFR-D-044`/`XFR-D-072`: Safe Presentation остаётся read-only consumer; ни одна geography-related evidence или generalization concept не пересчитывает и не меняет Eligibility, Hard Constraints, score, rank, Qualification, Confidence, Risk или routing. Высокий score, `QUALIFIED_HYPOTHESIS`, Presentation Readiness или user acceptance не авторизует geographic field и не обходит downstream gates.

### 3.11. Partial, never fully resolved

`XFR-D-074` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, безусловный deny для exact address/coordinates, internal-vs-external separation, наследование default-deny от `XFR-D-072`, conditional-geography neither-ban-nor-permission boundary, дополнительные geography-specific evidence categories, missing/unknown fail-closed handling, non-compensation и explicit non-conflation разрешены qualitatively.

Exact generalization level, precision, radius, band, range width, transformation, любой конкретный geographic field/derived signal, method/threshold, actual evidence и runtime carrier остаются `OPEN`. Будущее точное решение требует нового versioned `XFR-D-074` record с `supersedes`.

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` preserved | Actual artifact approval/change control `XFR-D-084` |
| Exact address/coordinates deny | Architecture §22.1/§5/§9.4 (`SOURCE_NORMATIVE`) | Не изменён, без ослабления | — (unconditional, never a candidate) |
| Internal geographic analysis | Architecture §§9.4/22.2 | Explicit separation from presentation stated | — (internal use unaffected) |
| Field-allowlist governance | `XFR-D-072 v1.0` | Default-deny inheritance confirmed | Every actual row/field |
| Geography generalization governance | `XFR-D-074 v1.0` (этот record) | Roles, conditional-geography boundary, evidence categories, fail-closed/non-compensation rules | Exact level/precision/radius/transformation, любой конкретный field |
| Re-identification/combination | `XFR-D-M3`, `XFR-D-075`, `XFR-D-076`, `XFR-D-083` | Mandatory dependencies preserved, не подменяются | Methods, values, evidence, disclosure budget |
| Registry identity | `XFR-D-073 v1.0` | Untouched | Any registry expansion/display |
| Presentation consumption | `XFR-D-044 v1.0` | Untouched | — |
| Dataset/training de-identification | Architecture §8.4/§30.2, `XFR-D-067 v1.0` | Untouched, explicit separation stated | Named appointment/RBAC, actual applicability |
| Audience/purpose | `XFR-D-080` | Dependency preserved | Exact model and recipients |
| Runtime carrier | `XFR-D-082` | No carrier inferred | API/DB/event/schema/cache implementation |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. Что остаётся `OPEN`

- каждый конкретный country/region/city/district/metro/landmark/travel-time/distance/zone field или derived signal;
- exact generalization level, precision, radius, band, range width и transformation;
- candidate-pool denominator, k-anonymity/cohort/uniqueness/rarity method и любое численное или conventional значение (`XFR-D-M3`);
- combination-risk algorithm и actual evidence (`XFR-D-075`, `XFR-D-083`);
- successive-disclosure budget (`XFR-D-076`);
- audience/purpose model (`XFR-D-080`);
- runtime carrier/Data Contracts extension (`XFR-D-082`);
- actual allowlist row и policy version/hash для любого geographic field (`XFR-D-072`);
- Safe Presentation artifact approval/change control (`XFR-D-084`);
- production data, policy approval, runtime/API/DB/schema/event design и implementation;
- все три governance gates.

## 6. Rationale

Geography — один из самых опасных re-identification векторов именно потому, что Architecture §22.1 делает его запрет условным («если позволяет определить объект»), а не абсолютным, как для точного адреса. Условность без governance boundary легко превращается в implicit permission через накопление удобных, по отдельности безобидных допущений. Присвоение owner/approver ролей и наследование `XFR-D-072`'s default-deny/joint-evidence дисциплины устраняет процедурную неопределённость, не изобретая ни generalization level, ни re-identification method, которых не существует ни в одном источнике.

Явное разведение от `XFR-D-M3` (метод/threshold), `XFR-D-011` (internal literal matching), Architecture §8.4/`XFR-D-067` (dataset de-identification) и Architecture §§9.4/22.2 (internal analysis) предотвращает ровно ту ошибку, которую могло бы вызвать поверхностное прочтение «эхо Feature Schema №7»: смешение четырёх структурно разных вопросов в один record, что либо преждевременно разрешило бы часть из них, либо создало бы conflicting authority между canonical decisions.

## 7. Adversarial cases

1. **Pilot cap, conventional radius или library default используются как generalization level.** Запрещено §3.11/§5 — ни один numeric/conventional value не утверждён этим record'ом.
2. **`property_region`/`property_city` (уже `commercial_data`, не `protected_commercial_data`, CTA §7.2) показывают как «безопасные по умолчанию», потому что не protected.** Запрещено §3.5/§3.4 п.3 — CTA data-classification tag не заменяет combination-risk и joint-payload evidence; безусловный deny/conditional boundary Architecture §22.1 оценивается по identifiability, не по CTA-классификации.
3. **Coarse district/metro отображают, ссылаясь на этот record как на allowlist row.** Запрещено §3.4 — этот record не создаёт и не заменяет `XFR-D-072` row; presentation остаётся fail closed без него.
4. **Internal §22.2 explanation-механизм расширяют до показа raw geoposition «поскольку внутренний расчёт уже её использует».** Запрещено §3.3 — internal use не авторизует external field.
5. **Missing district данные восстанавливают AI/heuristic inference, чтобы «не оставлять пробел».** Запрещено §3.7 п.3.
6. **Отсутствие geography field в presentation засчитывают как completed evidence package.** Запрещено §3.7 п.4 — absence не есть proof of safety.
7. **Хороший aggregate/common-case cohort результат используют, чтобы разрешить редкий район без отдельной rare-location evidence.** Запрещено §3.8 п.1.
8. **DLP PASS засчитывают как combination-risk approval для geography.** Запрещено §3.8 п.3.
9. **Synthetic-only cohort/uniqueness результат используют как production-safe claim.** Запрещено §3.8 п.4.
10. **`XFR-D-011` internal literal-match baseline цитируют как authority для presentation generalization.** Запрещено §3.9 п.1 — разные pipelines.
11. **Architecture §8.4 dataset de-identification generalization rule применяют напрямую к production Safe Presentation без отдельного `XFR-D-074`/`XFR-D-072` evidence.** Запрещено §3.9 п.2 — разные пайплайны и authority.
12. **Этот record трактуют как разрешающий `XFR-D-M3` method/threshold.** Запрещено §3.9 п.5 — только dependency preserved, метод не выбран.
13. **High Match Score или `QUALIFIED_HYPOTHESIS` используют, чтобы обойти geography field authorization.** Запрещено §3.10.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §§6.1, 7, 8, §15 решение №3, readiness и acceptance criteria могут получить это governance/evidence boundary без единого конкретного geographic field или уровня;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — owner-review overlay для `SPP-03 → XFR-D-074`, без переписывания исторических Wave 2D/§5.5 checkpoints;
- будущие `XFR-D-M3`/`XFR-D-075`/`XFR-D-076`/`XFR-D-080`/`XFR-D-082`/`XFR-D-083`/`XFR-D-084`, actual Safe Presentation policy и runtime artifacts — отдельные passes.

Ни один future sync не должен интерпретировать этот record как approved geographic field, generalization level, re-identification method, Safe Presentation Policy approval, actual evidence, production-safe payload, runtime carrier или implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, evidence-procedure role, exact-address/coordinates deny, internal/external separation, default-deny inheritance, conditional-geography neither-ban-nor-permission boundary, дополнительных evidence categories, missing/unknown fail-closed handling, non-compensation или non-conflation list требует нового versioned `XFR-D-074` record, согласованного `PRODUCT + LEGAL + Chief AI Architect + AI + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашивается current generalization level, precision, radius, band или transformation, **then** значения отсутствуют и `XFR-D-074` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** governance authority, **when** роли проверяются, **then** owner — `PRODUCT + LEGAL`, mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`, evidence-procedure owner `AI + DEVELOPMENT` не имеет unilateral approval.
3. **Given** точный адрес или координаты, **when** предлагается любая transformation, **then** authorization отсутствует, если raw-значение reconstructable.
4. **Given** internal geographic analysis Architecture §§9.4/22.2, **when** запрашивается user-facing geography field, **then** internal use само по себе не создаёт authorization.
5. **Given** любой geographic field/derived signal/transformation, **when** отсутствует complete `XFR-D-072` row, **then** presentation запрещена fail closed.
6. **Given** district/metro/landmark/travel-time/distance, **when** applicable method/evidence не утверждены, **then** конкретная row остаётся fail closed без blanket ban или implicit permission.
7. **Given** geography-specific evidence, **when** проверяется полнота, **then** все дополнительные категории §3.6 обязательны сверх `XFR-D-072` §3.4, включая явную зависимость от `XFR-D-M3`/`XFR-D-075`/`XFR-D-083`.
8. **Given** missing/unknown/conflicting geography, **when** формируется candidate row или presentation, **then** row блокируется, не coerced в negative/failed, не AI/heuristic/proxy-imputed, а отсутствие поля не засчитывается как completed evidence.
9. **Given** aggregate/common-case safety, per-field PASS, DLP PASS или synthetic-only evidence, **when** заявляется geography safety, **then** ни одно не компенсирует rare-location/joint-combination/intersection/successive-disclosure insufficiency.
10. **Given** `XFR-D-011`, Architecture §8.4/§30.2/`XFR-D-067`, `XFR-D-044`, `XFR-D-073`, **when** применяется этот record, **then** ни одно из них не переоткрывается, не расширяется и не подменяется.
11. **Given** этот record, **when** проверяются Eligibility/Hard Constraints/score/rank/Qualification/routing/policy/runtime/gate state, **then** ни одно не изменяется автоматически и все три gates остаются `BLOCKED`.
12. **Given** этот record, **when** проверяются Safe Presentation Policy approval, actual allowlist row, production-data use, runtime/API/DB/schema/event design или implementation, **then** ни одно не утверждено.

## 12. Итог

`XFR-D-074 GEOGRAPHIC GENERALIZATION GOVERNANCE BOUNDARY APPROVED — EXACT LEVEL, PRECISION, FIELDS, RE-IDENTIFICATION METHOD, ACTUAL EVIDENCE, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
