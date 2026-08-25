# LeaseMind Matching Decision Record — XFR-D-028

**Decision ID:** `XFR-D-028`

**Название:** Dimension Score explanation granularity ownership boundary

**Версия:** 1.0

**Дата решения:** 2026-08-25

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED INTERNAL OWNERSHIP BOUNDARY, NEVER FULLY RESOLVED — external presentation granularity, wording and disclosure remain OPEN under Safe Presentation governance`

**Decision authority:** human project-governance confirmation in the 2026-08-25 working session

**Governance owner (internal Scoring boundary only):** `Chief AI Architect + PRODUCT` — совпадает с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52).

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Consulted domain function:** `AI`.

## 1. Source/status discipline и authority boundary

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №17 фиксирует этот вопрос как candidate assignment `Chief AI Architect + PRODUCT` — «источник не назначает owner этого решения напрямую... `SAFE_PRESENTATION_POLICY` и Scoring Policy — boundary/artifact context, не owner'ы; источник не специфицирует уровень детализации». Этот record резолвит только **внутреннюю** половину этого вопроса (существование и раздельность Dimension Score компонент как Scoring-owned artifact) — внешняя половина (что именно и как показывается пользователю) прямо и намеренно остаётся `OPEN`, распределённая по существующим `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` open decisions №1 (`XFR-D-072`, field allowlist) и №7 (`XFR-D-077`, reason/explanation catalog), независимо прочитанным и подтверждённым как `OPEN` в этой сессии.

## 2. Вопрос

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №17 (`XFR-D-028`, source key `MSP-17`): кто владеет granularity объяснения Dimension Score компонент, показываемых AI Manager/пользователю через Match Package?

## 3. Решение

Утверждается частичная (partial, never fully resolved) ownership boundary:

1. **Scoring Policy владеет internal existence/separateness/interpretation.** `MATCHING_SCORING_POLICY` владеет существованием, раздельностью и internal/audit-интерпретацией трёх Dimension Score компонент — Tenant Fit, Owner Fit, Deal Feasibility (уже `SOURCE_NORMATIVE`, Architecture §15.1-15.4, `MSP-C-007`). Это internal ownership не оспаривается и не переоткрывается этим record'ом — он лишь явно фиксирует его как governance boundary.
2. **External exposure — не решается этим record'ом.** Будут ли, как и с какой granularity какие-либо из этих трёх компонент показаны пользователю через Match Package или Safe Presentation, — не определяется этим record'ом ни в какой степени.
3. **Field selection/wording/disclosure/catalog — остаются под Safe Presentation governance.** Точный выбор поля, формулировка, disclosure-правило и любое значение user-facing reason/explanation catalog остаются `OPEN` под уже существующими открытыми решениями Safe Presentation Policy: №1 (`XFR-D-072`, per-object-type field allowlist) и №7 (`XFR-D-077`, user-facing safe reason/explanation catalog).
4. **Новый owner для будущих Safe Presentation решений не назначается.** Этот record не присваивает и не переопределяет owner ни для `XFR-D-072`, ни для `XFR-D-077`, ни для любого другого open decision Safe Presentation Policy — они остаются с уже установленным candidate owner `PRODUCT + LEGAL` (Safe Presentation Policy §15), поскольку ни один источник, прочитанный для этого record'а, не устанавливает иного.

## 4. Layer/boundary — Scoring internal ownership vs Safe Presentation external disclosure

| Слой | Что регулирует | Owner/authority | Затронут этим record'ом? |
|---|---|---|---|
| Existence/separateness Dimension Score компонент (Architecture §15.1-15.4) | Что Tenant Fit/Owner Fit/Deal Feasibility существуют и вычисляются раздельно | Architecture (`SOURCE_NORMATIVE`), Scoring Policy artifact owner | Нет — уже `SOURCE_NORMATIVE`, не переоткрывается |
| **Internal ownership granularity boundary (этот record)** | Что именно Scoring Policy владеет internal/audit-интерпретацией этих компонент, отдельно от их показа пользователю | `Chief AI Architect + PRODUCT` (этот record) | **Да — единственный резолвленный этим record'ом слой** |
| Field allowlist (`XFR-D-072`, Safe Presentation §15 №1) | Какие конкретные поля/трансформации допустимы для показа пользователю | `PRODUCT + LEGAL` (candidate, Safe Presentation) | Нет — остаётся `OPEN` |
| Reason/explanation catalog (`XFR-D-077`, Safe Presentation §15 №7) | Machine-readable/localized wording для объяснений пользователю | `PRODUCT + LEGAL` (candidate, координация с Qualification/Risk reason-namespace owner) | Нет — остаётся `OPEN` |

## 5. Rationale

Разделение internal ownership (что Scoring Policy считает своими данными для аудита) от external disclosure (что из этого показывается пользователю и как) — прямое применение уже установленного в этой сессии паттерна non-conflation (см. `XFR-D-073` §4 для аналогичного разведения registry-key identity от field-level presentation в Safe Presentation domain). Присвоение только internal-половины избегает изобретения нового owner'а для Safe Presentation decisions, которых источник не устанавливает, и не создаёт преждевременного claim о granularity, которая по своей природе — presentation-решение, а не Scoring-решение. `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved — намеренно отражает, что вопрос структурно распадается на две части с разными owners, а не является единым вопросом с частичным прогрессом к единственному ответу.

## 6. Adversarial cases

1. **Разработчик пытается вывести allowlist поля из этого record'а.** Запрещено п.3 — field allowlist остаётся исключительно под `XFR-D-072`, этот record не содержит и не подразумевает ни одного конкретного поля.
2. **Reviewer интерпретирует `Chief AI Architect + PRODUCT` как owner будущего Safe Presentation decision о granularity показа.** Неверно — metadata и §3 п.4 explicitly ограничивают governance owner только internal-половиной; external granularity остаётся под existующим Safe Presentation candidate owner `PRODUCT + LEGAL`.
3. **Попытка использовать «existence/separateness» как основание для показа сырых Dimension Score значений пользователю.** Запрещено — существование и internal-интерпретация компонент (п.1) не эквивалентны разрешению их external disclosure (п.2); показ любого значения остаётся `OPEN` под Safe Presentation allowlist/catalog decisions.
4. **Смешение этого record'а с уже утверждённым `XFR-D-044` (Safe Presentation read-only consumption boundary).** `XFR-D-044` регулирует, как Safe Presentation потребляет Qualification routing result — другой слой и другой источник входа, не Dimension Score explanation granularity; этот record его не затрагивает и не пересекается с ним содержательно.

## 7. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §12 открытое решение №17 получит `PARTIALLY_RESOLVED_BOUNDARY`-cross-reference;
- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — опциональная cross-reference заметка на decision rows №1/№7 (Safe Presentation уже трактует эти вопросы как свои открытые decisions, никакого content change не требуется);
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-028`.

Ни один из этих будущих sync-проходов не выполняется этим record'ом.

## 8. Не утверждено (explicit non-decisions)

- Ни одно конкретное поле, допустимое для показа (field allowlist, `XFR-D-072`);
- ни одно disclosure правило, wording или значение reason/explanation catalog (`XFR-D-077`);
- новый owner для `XFR-D-072`, `XFR-D-077` или любого другого open decision Safe Presentation Policy;
- фактическая granularity показа (сколько детализации, в каком виде) — остаётся полностью `OPEN`;
- runtime/API/DB/schema/event design;
- implementation authorization любого рода.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`. Architecture §37 вопрос №6 (Safe Presentation) остаётся полностью `OPEN`, как и вопросы №2/№3 (Scoring).

## 10. Change control

Изменение утверждённой internal ownership boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись. Любое будущее решение о фактической external granularity/wording/disclosure должно приниматься отдельным Safe Presentation decision record, не путём расширения этой записи.

## 11. Итог

`XFR-D-028 INTERNAL OWNERSHIP BOUNDARY APPROVED — EXTERNAL PRESENTATION GRANULARITY REMAINS OPEN UNDER SAFE PRESENTATION GOVERNANCE`
