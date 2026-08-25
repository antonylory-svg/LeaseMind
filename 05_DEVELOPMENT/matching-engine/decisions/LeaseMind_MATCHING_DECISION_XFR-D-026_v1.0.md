# LeaseMind Matching Decision Record — XFR-D-026

**Decision ID:** `XFR-D-026`

**Название:** Scoring synthetic-only versus production calibration boundary

**Версия:** 1.0

**Дата решения:** 2026-08-25

**Resolution status:** `RESOLVED_EVIDENCE_BOUNDARY`

**Статус:** `APPROVED SYNTHETIC-TO-PRODUCTION EVIDENCE BOUNDARY — dataset, metrics, calibration procedure and production-readiness criteria remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-25 working session

**Governance owner:** `Chief AI Architect + PRODUCT` — совпадает с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52).

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Consulted domain function:** `AI`.

**Evidence-procedure owner:** `AI + DEVELOPMENT`, под `MATCHING_EVALUATION_PLAN` (эхо Architecture §37 №10 для смежного вопроса). Это explicitly **не** co-ownership этого governance decision Scoring Policy — evidence-procedure ownership (кто проводит evaluation) и governance-decision ownership (кто утверждает qualitative boundary) остаются разными ролями, не сливаются в одного joint owner.

## 1. Source/status discipline и authority boundary

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №15 явно фиксирует этот вопрос как candidate assignment «по аналогии с Risk Policy `MRP-C-013`/Qualification Policy `MQP-C-019`, не установленная источником буквально для Scoring». Оба precedent-record'а (`MRP-C-013` Risk Policy §14, `MQP-C-019` Qualification Policy) независимо прочитаны и подтверждают идентичную структуру: synthetic-only evaluation evidence не делает production-readiness заключение автоматически, поддержано `SOURCE_NORMATIVE` фактами `CO-C-019`/`AS-C-019`/`AS-C-025` (`CAMPAIGN_OUTCOMES.md`/`ANALYSIS_SNAPSHOT.md`) и Architecture §36/§50 synthetic-only границами. Этот record переносит тот же governance-метод на Scoring domain, не изменяя ни `MRP-C-013`, ни `MQP-C-019`, ни их родительские Proposal-документы.

## 2. Вопрос

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №15 (`XFR-D-026`, source key `MSP-15`): устанавливает ли synthetic-only evaluation evidence production calibration или launch readiness для Mutual Aggregate function, Scoring weights или иных Scoring candidate comparisons?

## 3. Решение

Утверждается qualitative evidentiary boundary, зеркально отражающая уже утверждённые Risk/Qualification границы:

1. **Synthetic evidence не создаёт production readiness автоматически.** Evidence, произведённое исключительно из synthetic dataset categories (`MATCHING_EVALUATION_PLAN` §3, категории 1-4), не устанавливает само по себе production calibration, production readiness или launch readiness для выбора Mutual Aggregate function, Scoring weights или любого другого Scoring candidate comparison (harmonic vs geometric, equal-weight baseline vs alternative и т.п.).
2. **Зеркальное, не самостоятельное правило.** Это качественное отражение уже утверждённых `MRP-C-013` (Risk Policy) и `MQP-C-019` (Qualification Policy) границ, применённое конкретно к Scoring domain — не новая независимая norma и не изменение исходных Risk/Qualification records.
3. **Ничего не изобретается сверх evidentiary boundary.** Этот record не задаёт dataset size, split ratio, metric target, calibration procedure, acceptance threshold или production-readiness criterion. Все они остаются `OPEN` под будущими Evaluation Plan-специфичными и Scoring-specific decisions.
4. **Architecture §37 №2/№3 не закрываются.** Mutual Aggregate function approval и стартовые/segment weights остаются полностью `OPEN`.

## 4. Layer/boundary — Scoring evidentiary boundary vs Evaluation Plan procedure vs Risk/Qualification precedent

| Слой | Что регулирует | Owner/authority | Затронут этим record'ом? |
|---|---|---|---|
| `MATCHING_EVALUATION_PLAN` synthetic dataset categories 1-4 | Что именно является synthetic evidence | `AI + DEVELOPMENT` (Evaluation Plan owner) | Нет — не переоткрывается |
| `MRP-C-013` (Risk Policy) / `MQP-C-019` (Qualification Policy) | Аналогичная evidentiary boundary для Risk и Qualification domains соответственно | Risk Policy / Qualification Policy artifact owners | Нет — оба остаются неизменёнными, этот record их не supersedes |
| **Scoring synthetic-to-production evidentiary boundary (этот record)** | Что именно synthetic evidence НЕ доказывает конкретно для Scoring candidates (Mutual Aggregate, weights) | `Chief AI Architect + PRODUCT` (этот record) | **Да — единственный резолвленный этим record'ом слой** |
| Dataset size/split/metric target/calibration procedure | Конкретное содержание evaluation procedure | `AI + DEVELOPMENT` (Evaluation Plan) — `OPEN` | Нет — остаётся `OPEN` |

## 5. Rationale

Три независимых sibling-документа (Risk Policy, Qualification Policy, Scoring Policy) уже указывают идентичную структуру этого вопроса — либо как утверждённую qualitative norma (`MRP-C-013`, `MQP-C-019`), либо как явно помеченный candidate по аналогии (`Scoring Policy §12 п.15`). Утверждение того же governance-паттерна для Scoring устраняет асимметрию (два domain уже имеют qualitative boundary, один — нет) без изобретения нового содержания: используется тот же source-normative anchor (`CO-C-019`/`AS-C-019/025`, Architecture §36/§50), та же non-goal граница (никаких чисел, никакой процедуры). Раздельность evidence-procedure owner (`AI + DEVELOPMENT`, кто выполняет evaluation) и governance-decision owner (`Chief AI Architect + PRODUCT`, кто утверждает саму boundary) явно сохранена, чтобы не создать conflation, аналогичную anti-pattern, уже задокументированному Scoring Policy §12 п.18 (technical writer ≠ policy owner).

## 6. Adversarial cases

1. **Successful synthetic evaluation run предлагает harmonic mean как «лучший» candidate.** Согласовано с `MSP-C-019` (evaluation run не эквивалентен approval) — этот результат не делает harmonic production-calibrated или approved; Architecture §37 №2 остаётся `OPEN`.
2. **Попытка объявить weights «production-ready» на основании только synthetic robustness/calibration metrics (Evaluation Plan §6.4/§6.7).** Прямо запрещено п.1 — synthetic evidence само по себе недостаточно, независимо от качества метрик.
3. **Смешение evidence-procedure ownership с governance-decision ownership.** Реализатор может принять `AI + DEVELOPMENT` (Evaluation Plan owner) за owner'а самого этого qualitative decision. Явно разведено в metadata и §4 layer table: evidence-procedure owner ≠ governance owner этого record'а.
4. **Использование этого record'а как основания для изменения Risk/Qualification policies.** Запрещено — этот record зеркалит, но не supersedes и не изменяет `MRP-C-013`/`MQP-C-019`.

## 7. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §10 (Evaluation и approval path), §12 открытое решение №15 получат `RESOLVED_EVIDENCE_BOUNDARY`-cross-reference;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-026`.

Ни один из этих будущих sync-проходов не выполняется этим record'ом.

## 8. Не утверждено (explicit non-decisions)

- Dataset size, split ratio, metric target;
- calibration procedure, acceptance threshold, production-readiness criterion;
- любая Mutual Aggregate function, weight или numeric value (Architecture §37 №2/№3 остаются `OPEN`);
- изменение `MRP-C-013` или `MQP-C-019`;
- runtime/API/DB/schema/event design;
- implementation authorization любого рода.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`. Architecture §37 вопросы №2 и №3 остаются `OPEN`.

## 10. Change control

Изменение утверждённой synthetic-to-production evidentiary boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 11. Итог

`XFR-D-026 SYNTHETIC-TO-PRODUCTION EVIDENCE BOUNDARY APPROVED — DATASET, METRICS AND PRODUCTION-READINESS CRITERIA REMAIN OPEN`
