# LeaseMind Matching Decision Record — XFR-D-073

**Decision ID:** `XFR-D-073`

**Версия:** 1.0

**Дата решения:** 2026-08-24

**Статус:** `APPROVED GOVERNANCE REGISTRY-KEY REUSE BOUNDARY — field allowlist, property_type/property_type_other presentation, and runtime/API/DB/schema design remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-24 working session

**Owner:** `PRODUCT + LEGAL`

## 1. Вопрос

Должен ли Safe Presentation переиспользовать закрытый CTA `property_type` enum (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.1) как canonical design-time registry key будущей object-type matrix, или создать отдельный parallel vocabulary (Safe Presentation Policy §14, decision row №2)?

## 2. Решение

Утверждается reuse: восемь существующих значений `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.1 —

`retail_unit`, `office`, `warehouse`, `light_industrial`, `free_purpose`, `standalone_building`, `land`, `other`

— становятся canonical design-time registry key будущей Safe Presentation object-type matrix (§7 `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md`). Отдельный parallel vocabulary не создаётся.

- Эти восемь значений — исключительно design-time governance registry keys для будущей per-object-type policy matrix; они не являются и не становятся текущим runtime/API/DB/schema enum или carrier этим решением.
- `other` — валидный internal registry key наравне с остальными семью значениями; он не становится automatically displayable field или value пользователю этим решением.
- Duplicate/parallel taxonomy не создаётся; новый vocabulary этим документом не изобретается.

Это `RESOLVED_GOVERNANCE_REGISTRY_REUSE_BOUNDARY`: identity ключа таксономии зафиксирована однозначно. Field allowlist, показ значений и runtime carrier остаются отдельными open вопросами (см. §4, §6 ниже).

## 3. Fail-closed evolution rule

Любое будущее/неизвестное значение CTA `property_type` enum (гипотетическое расширение) **не включается автоматически** в approved presentation matrix:

- без отдельной, отдельно рассмотренной matrix row для этого значения — presentation по этому типу запрещён;
- fallback к `other` или к любой другой существующей строке не допускается;
- inheritance allowlist одной строки другой строкой не допускается;
- отсутствие matrix row не считается отрицательным фактом о самом объекте — это fail-closed governance-состояние отсутствия review, не вывод о безопасности/небезопасности объекта.

## 4. `property_type` / `property_type_other` boundary

- Показ `property_type` пользователю остаётся `OPEN / NOT_AUTHORIZED_BY_THIS_DECISION`.
- Показ или включение `property_type_other` (raw free text; определение и conditional requirement при `property_type=other` — `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §7.2; передача заданного значения в Campaign `subject_snapshot` — §10.2) в user-facing presentation остаётся `OPEN / NOT_AUTHORIZED_BY_THIS_DECISION` и fail-closed вне любого будущего approved allowlist.
- Architecture §22.1 запрещает **условно** — «уникальное… описание, позволяющее найти объект» — это не blanket-запрет любого текстового поля.
- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` §6.9/`SPP-C-009` предлагает как `DECISION_CANDIDATE_FOR_REVIEW` полный запрет свободного текста до появления approved reason/explanation catalog — это policy-candidate расширение узкой source-нормы, не source-normative вечный blanket-запрет, и не становится таковым этим record.
- Этим решением не утверждается ни одна safe transformation/generalization для `property_type` или `property_type_other`.

## 5. Authority boundary

- Architecture §37 вопрос №6 (дословно: «Какие поля допустимы в безопасном описании варианта для разных типов объектов без риска повторной идентификации?») и §52 (Controlled Artifact Manifest, запись `SAFE_PRESENTATION_POLICY`) назначают `PRODUCT + LEGAL` владельцами широкого вопроса №6 и artifact ownership `SAFE_PRESENTATION_POLICY` в целом.
- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` (§14, decision row №2) выделяет narrower candidate subdecision «Presentation object-type registry/reuse» из широкого вопроса №6 и назначает ему ту же owner-пару `PRODUCT + LEGAL` — по наследованию от широкого вопроса, не потому что Architecture называет этот под-вопрос напрямую.
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` только индексирует эту Proposal-строку как `SPP-02 → XFR-D-073` (`PRIMARY_STANDALONE`) для трассируемости; Inventory прямо заявляет, что не назначает source-owner там, где Architecture его не назначает (§1 Inventory), и не является независимым owner-authority.
- Architecture не называет напрямую ни `XFR-D-073`, ни «subdecision №2», ни object-type registry как отдельную data structure — это дробление и выбор конкретной data structure принадлежат Safe Presentation Policy Proposal, не Architecture буквально.

## 6. Не утверждено

- Exact per-object-type field allowlist (`XFR-D-072`);
- показ `property_type`/`property_type_other` пользователю в любой форме;
- transformation/generalization правила для любого поля;
- combination/re-identification method и evidence (`XFR-D-M3`, `XFR-D-075`, `XFR-D-083`, где применимо);
- отдельная `business_category` presentation matrix;
- audience/purpose model (`XFR-D-080`);
- runtime carrier/Data Contracts extension (`XFR-D-082`, а также runtime-carrier decision самого Safe Presentation Policy Proposal, §9/§12/§14 пункт 12);
- cache/expiry/revocation (`XFR-D-081`);
- localization governance и safe reason/explanation catalog (`XFR-D-079`, `XFR-D-077`);
- любая implementation authorization, runtime/API/DB/schema/event/error-catalog design.

## 7. Architecture/gate boundary

Это решение резолвит ровно один узкий prerequisite/subdecision внутри Architecture §37 вопроса №6. Architecture §37 вопрос №6 остаётся полностью `OPEN`. `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` остаётся `Proposal for cross-functional review`, не переводится в `APPROVED`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 8. Затронутые артефакты

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — §7 (object-type matrix design), §14 decision row №2, readiness matrix и acceptance criteria (`SPP-C-007` и смежные) должны быть синхронизированы отдельным pass;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-073` должен быть добавлен отдельным pass.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`.

## 10. Change control

Изменение утверждённой registry-key reuse/fail-closed evolution boundary требует нового versioned decision record со ссылкой `supersedes` на эту запись, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`. Эта cross-functional approval clause не превращает всех участников в artifact owner — owner остаётся `PRODUCT + LEGAL`.

## 11. Итог

`XFR-D-073 GOVERNANCE REGISTRY-KEY REUSE BOUNDARY APPROVED — FIELD ALLOWLIST, PRESENTATION USE, AND RUNTIME DESIGN REMAIN OPEN`
