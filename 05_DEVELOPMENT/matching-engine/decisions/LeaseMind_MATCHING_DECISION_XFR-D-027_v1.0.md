# LeaseMind Matching Decision Record — XFR-D-027

**Decision ID:** `XFR-D-027`

**Название:** Operational and governance ownership boundary for Architecture §30.3 preparation/evaluation steps

**Версия:** 1.0

**Дата решения:** 2026-08-26

**Resolution status:** `RESOLVED_QUALITATIVE_BOUNDARY`

**Статус:** `APPROVED OWNER-ASSIGNMENT BOUNDARY — exact procedure, quorum and runtime/API/DB/schema representation remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-26 working session

**Repository baseline:** `3ffcebf46d2ce689d2ccbd2924e21e3c1cb0686a`

**Scope:** governance ownership semantics only; does not authorize implementation, runtime/API/DB/schema/event design, evaluation procedure content or a Scoring Policy Proposal approval.

**Governance owner (of this decision record):** `Chief AI Architect + PRODUCT` — candidate governance assignment, совпадает с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52, row 2/3).

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Consulted domain function:** `AI`.

**Operational/evidence-procedure owner (Architecture §30.3 шаги 1–3):** `AI + DEVELOPMENT` — candidate-by-analogy, не буквальное назначение источника. `DEVELOPMENT` выступает technical executor/steward этих шагов.

**Depends on:** ни один prerequisite decision record не требуется; `XFR-D-018` (MSP-04, segment-override evidence) и `XFR-D-021` (MSP-08, ranking/diversification algorithm) остаются независимо `OPEN` и этим record'ом не затрагиваются.

---

## 1. Source/status discipline и authority boundary

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №16 (`MSP-16`) фиксирует этот вопрос буквально как «candidate assignment; §30.3 называет шаги, не персональных/ролевых owner каждого шага отдельно от общего процесса».

Architecture §30.3 (нормативно, прочитано полностью в этой сессии) перечисляет девять шагов новой версии признаков/весов/модели: (1) подготовка зафиксированной выборки, (2) проверка качества меток, (3) offline evaluation, (4) проверка дискриминационных признаков и прокси, (5) проверка калибровки, (6) **review Chief AI Architect**, (7) **согласование затронутых PRODUCT/LEGAL правил**, (8) контролируемый выпуск, (9) мониторинг/откат. Источник называет роль на шаге 6 (Chief AI Architect review) и шаге 7 (PRODUCT/LEGAL approval затронутых правил) — но **не** называет owner шагов 1–3 ни явно, ни через кросс-ссылку.

Scoring Policy §2 ownership matrix независимо подтверждает эту границу: строка Chief AI Architect — «Review новой версии весов/модели (§30.3 п.6); координация approval», без операционной подготовки; строка LEGAL — «согласование затронутых правил на этапе PRODUCT/LEGAL в §30.3», ограничено шагом 7.

Ближайшие source-backed аналоги операционного исполнения: Architecture §37 вопрос №10 («Какая размеченная выборка и процедура adjudication используются для pilot baseline?», owner `AI + DEVELOPMENT`, source-normative) и Scoring Policy §12 открытое решение №9 («Sensitivity/calibration dataset и metric targets для Mutual Aggregate/весов», owner `AI + DEVELOPMENT` по аналогии с тем же §37 №10). Оба относятся к смежному, но не идентичному вопросу (dataset/adjudication procedure vs. §30.3 шаги 1–3) — этот record переносит ту же пару ролей на §30.3 шаги 1–3 по аналогии, не утверждая, что источник называет её напрямую для этого конкретного вопроса.

Sibling records `XFR-D-023`, `XFR-D-026`, `XFR-D-028` использованы только как governance/change-control precedent (единый паттерн owner `Chief AI Architect + PRODUCT` + approvers `LEGAL + DEVELOPMENT` + consulted `AI` + change control той же четвёрки) — не как источник, устанавливающий owner именно этого вопроса.

## 2. Вопрос

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №16 (`XFR-D-027`, source key `MSP-16`): кто именно (governance owner решения и operational owner исполнения) отвечает за Architecture §30.3 шаги 1–3 — подготовку зафиксированной выборки, проверку качества меток и offline evaluation — до review Chief AI Architect (шаг 6)?

## 3. Решение

Утверждается частичная (owner-only, partial) ownership boundary, раздельно фиксирующая шесть различных ролей:

1. **Governance owner этого decision record — `Chief AI Architect + PRODUCT`.** Candidate governance assignment, утверждающая саму эту owner-boundary запись; совпадает с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52).
2. **Operational/evidence-procedure owner шагов 1–3 — `AI + DEVELOPMENT`.** Candidate-by-analogy (Architecture §37 №10, Scoring Policy §12 решение №9), не буквальное §30.3-назначение. `DEVELOPMENT` — technical executor/steward этих шагов.
3. **Chief AI Architect — reviewer шага 6 источника, не operational preparer и не self-reviewer.** Source-established напрямую §30.3 п.6 и Scoring Policy §2. Review происходит после завершения шагов 1–5 и не совпадает с ролью п.2.
4. **PRODUCT + LEGAL — approval затронутых правил шага 7 источника.** Source-established напрямую §30.3 п.7 и Scoring Policy §2 (строка LEGAL). Эта роль уже, чем record-level mandatory approvers (п.5) — она не включает DEVELOPMENT и относится только к шагу 7, не ко всему decision record.
5. **Record-level mandatory approvers этого decision record — `LEGAL + DEVELOPMENT`.** Отдельная метаданная роль (кто согласовывает саму эту governance-запись), не смешивается с шагом 7 источника (п.4).
6. **Consulted domain function этого decision record — `AI`.** Отдельная роль от operational co-ownership `AI` в п.2 — не сливаются в одну.

Ни одна из шести ролей не заменяет и не поглощает другую. Governance owner (п.1) не является operational исполнителем; operational owner (п.2) не является governance owner записи; Chief AI Architect (п.3) не готовит выборку; PRODUCT/LEGAL шага 7 (п.4) не тождественны record-level approvers (п.5).

## 4. Layer/boundary — governance record vs. §30.3 process roles vs. sibling precedent

| Слой | Что регулирует | Owner/authority | Источник |
|---|---|---|---|
| Governance owner этого record'а | Кто утверждает саму owner-boundary запись | `Chief AI Architect + PRODUCT` | Candidate, pattern-consistent с `XFR-D-023/026/028`, Architecture §52 |
| Operational owner §30.3 шагов 1–3 | Кто готовит выборку, проверяет качество меток, проводит offline evaluation | `AI + DEVELOPMENT` (`DEVELOPMENT` — technical executor) | Candidate-by-analogy: Architecture §37 №10, Scoring Policy §12 решение №9 |
| §30.3 шаг 6 (review) | Кто проверяет завершённый результат шагов 1–5 | `Chief AI Architect` | Source-normative, Architecture §30.3 п.6; Scoring Policy §2 |
| §30.3 шаг 7 (affected-rule approval) | Кто согласовывает затронутые PRODUCT/LEGAL правила | `PRODUCT + LEGAL` | Source-normative, Architecture §30.3 п.7; Scoring Policy §2 |
| Record-level mandatory approvers | Кто согласовывает саму эту governance-запись (метаданные) | `LEGAL + DEVELOPMENT` | Candidate, pattern-consistent с sibling records |
| `XFR-D-018` (MSP-04) | Evidence sufficiency для segment override | `OPEN`, не затронуто | Не резолвится этим record'ом |
| `XFR-D-021` (MSP-08) | Ranking/diversification algorithm | `OPEN`, не затронуто | Не резолвится этим record'ом |

## 5. Rationale

Источник (§30.3) называет шаги процесса и явно называет роль только на двух конкретных шагах (6 и 7), оставляя шаги 1–3 без прямого owner — Scoring Policy §12 решение №16 подтверждает это буквально. Присвоение operational owner'а этим шагам решает практическую governance-неопределённость (кто именно готовит evidence до review), не изобретая новую роль: используется та же пара `AI + DEVELOPMENT`, уже source-established для смежного вопроса (§37 №10) и уже применённая Scoring Policy к соседнему открытому решению (№9). Раздельность шести ролей — прямое применение паттерна non-conflation, уже установленного `XFR-D-026` §23 (evidence-procedure owner ≠ governance-decision owner) и распространённого здесь на дополнительные source-established роли (§30.3 шаги 6/7), чтобы review не превратился в self-review, а approval — в смешение с record-level metadata.

## 6. Adversarial cases

1. **Reviewer интерпретирует `Chief AI Architect + PRODUCT` (governance owner записи) как owner самой offline evaluation.** Неверно — §3 п.1 ограничивает эту роль утверждением записи; операционное исполнение — отдельная роль п.2 (`AI + DEVELOPMENT`).
2. **Попытка сделать Chief AI Architect preparer'ом зафиксированной выборки.** Запрещено п.3 и §4 layer table — §30.3 явно разделяет шаги 1–3 (подготовка) и шаг 6 (review); совмещение сделало бы review self-review, что источник не предполагает.
3. **Смешение record-level mandatory approvers (`LEGAL + DEVELOPMENT`) с §30.3 шагом 7 (`PRODUCT + LEGAL`).** Явно разведено п.4/п.5 и §4 layer table — разные роли, разный состав (DEVELOPMENT присутствует только в record-level approvers, не в шаге 7; PRODUCT присутствует только в шаге 7 и в governance owner, не в record-level approvers).
4. **Использование этого record'а как основания резолвить `XFR-D-018` или `XFR-D-021`.** Запрещено §1/§4 — оба остаются независимо `OPEN`, этот record их не затрагивает и не подразумевает прогресса по ним.
5. **Попытка вывести exact adjudication/quorum/frequency процедуру из этого record'а.** Запрещено §7 — только owner-роли утверждены, сама процедура (кто именно, в каком составе, по какому расписанию выполняет шаги 1–3) остаётся `OPEN`.
6. **Попытка использовать owner-assignment как implementation authorization для runtime pipeline подготовки выборки.** Запрещено §7 и §9 — никакой runtime/API/DB/schema/event carrier этим record'ом не проектируется и не разрешается.

## 7. Что остаётся `OPEN` (не утверждено этим record'ом)

- exact adjudication/procedure content для шагов 1–3 (quorum, стадийность, frequency, escalation);
- reviewer qualifications, независимость и conflict-of-interest правила для operational owner;
- `XFR-D-018` (segment-override evidence) и `XFR-D-021` (ranking/diversification algorithm) — независимо `OPEN`;
- Architecture §37 вопросы №2 (Mutual Aggregate function) и №3 (стартовые веса/пороги) — полностью `OPEN`;
- любой numeric value, threshold, dataset size, split ratio, metric target;
- runtime/API/DB/schema/event/manifest carrier и любая implementation authorization;
- approval Scoring Policy Proposal целиком.

## 8. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 9. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §12 открытое решение №16 получит owner-boundary cross-reference;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-027`.

Ни один из этих будущих sync-проходов не выполняется этим record'ом.

## 10. Change control

Изменение утверждённой owner-assignment boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 11. Итог

`XFR-D-027 OWNER-ASSIGNMENT BOUNDARY APPROVED — EXACT §30.3 STEPS 1–3 PROCEDURE, QUORUM AND RUNTIME REPRESENTATION REMAIN OPEN`
