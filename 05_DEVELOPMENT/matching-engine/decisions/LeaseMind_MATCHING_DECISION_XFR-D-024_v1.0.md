# LeaseMind Matching Decision Record — XFR-D-024

**Decision ID:** `XFR-D-024`

**Название:** Priority Score future-policy governance ownership boundary (owner-only)

**Версия:** 1.0

**Дата решения:** 2026-08-26

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER-ONLY BOUNDARY — formula, weights, ranking algorithm, numeric thresholds, activation conditions and runtime representation remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-26 working session

**Repository baseline:** `3ffcebf46d2ce689d2ccbd2924e21e3c1cb0686a`

**Scope:** governance ownership semantics only; does not authorize a Priority Score formula, weight, ranking algorithm, numeric threshold, activation condition, runtime/API/DB/schema/event design, or a Scoring Policy Proposal approval.

**Governance owner (для будущей Priority Score policy):** `Chief AI Architect + PRODUCT` — candidate assignment, совпадает с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52).

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Consulted domain function:** `AI`.

**Depends on:** ни один prerequisite decision record не требуется; `XFR-D-018` (MSP-04, segment-override evidence) и `XFR-D-021` (MSP-08, ranking/diversification algorithm) остаются независимо `OPEN` и этим record'ом не затрагиваются.

---

## 1. Source/status discipline и authority boundary

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №11 (`MSP-11`) фиксирует этот вопрос буквально как «Priority Score — формула, обязательность, owner — candidate assignment; §15.6 называет его опциональным, не специфицирует».

Architecture §15.6 (нормативно, прочитано полностью в этой сессии) устанавливает ровно два факта о Priority Score: «Для ранжирования может использоваться отдельный Priority Score, учитывающий Match Score, Confidence Score и Risk Score. Все исходные показатели сохраняются и показываются раздельно для аудита.» Это — (а) опциональность («может использоваться») и (б) обязательная раздельная audit-visibility исходных показателей. Источник **не** называет формулу, веса, обязательность использования, ranking-алгоритм, numeric threshold, условия активации или owner будущей policy.

Этот record резолвит **только** governance owner будущей Priority Score policy — не саму policy, не её формулу, не её обязательность. Sibling records `XFR-D-023`, `XFR-D-026`, `XFR-D-028` использованы только как governance/change-control precedent (единый паттерн owner `Chief AI Architect + PRODUCT` + approvers `LEGAL + DEVELOPMENT` + consulted `AI`) — не как источник, устанавливающий owner именно Priority Score.

## 2. Вопрос

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №11 (`XFR-D-024`, source key `MSP-11`): кто владеет будущей governance-decision о Priority Score (формула, обязательность, ranking-алгоритм, активация), учитывая, что Architecture §15.6 устанавливает только опциональность и раздельную audit-visibility?

## 3. Решение

Утверждается исключительно governance-owner-only boundary, никогда не полное резолвирование `XFR-D-024`:

1. **Governance owner будущей Priority Score policy — `Chief AI Architect + PRODUCT`.** Candidate assignment, pattern-consistent с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52) и с governance owner `XFR-D-023`/`XFR-D-026`/`XFR-D-028`. Утверждается только то, кто будет владеть будущим решением — не само решение.
2. **Mandatory approvers — `LEGAL + DEVELOPMENT`.** Pattern-consistent с record-level approvers sibling records; LEGAL включён как mandatory approver по established паттерну, не как semantic owner Priority Score arithmetic — источник не даёт оснований для LEGAL semantic ownership score-арифметики.
3. **Consulted domain function — `AI`.**
4. **Priority Score не описывается как обязательный.** §15.6 использует «может использоваться» — этот record не переводит опциональность в обязательность и не утверждает обратное.
5. **Ничего технического не изобретается.** Формула, веса, ranking-алгоритм, numeric threshold, условия активации Priority Score и его runtime/API/DB/schema representation не утверждаются и не предлагаются этим record'ом.
6. **Partial, never fully resolved.** `XFR-D-024` остаётся `PARTIALLY_RESOLVED_BOUNDARY` — только governance-owner-половина резолвлена; содержательная policy-половина требует отдельного будущего decision record с собственной evidence-базой (вероятно, evaluation-driven, как Mutual Aggregate/weights по Architecture §37 №2/№3).

## 4. Layer/boundary — governance owner vs. содержательная будущая policy vs. audit-visibility

| Слой | Что регулирует | Owner/authority | Затронут этим record'ом? |
|---|---|---|---|
| Опциональность Priority Score (Architecture §15.6) | Что Priority Score может использоваться для ranking | Architecture (`SOURCE_NORMATIVE`) | Нет — уже `SOURCE_NORMATIVE`, не переоткрывается |
| Раздельная audit-visibility исходных показателей (Architecture §15.6) | Что Match Score, Confidence Score, Risk Score сохраняются и показываются раздельно | Architecture (`SOURCE_NORMATIVE`) | Нет — уже `SOURCE_NORMATIVE`, не переоткрывается |
| **Governance owner будущей Priority Score policy (этот record)** | Кто будет утверждать будущую policy — не сама policy | `Chief AI Architect + PRODUCT` (candidate) | **Да — единственный резолвленный этим record'ом слой** |
| Формула, веса, ranking-алгоритм, activation conditions | Содержание будущей Priority Score policy | `OPEN` — не назначено ни одним источником | Нет — остаётся полностью `OPEN` |
| Numeric thresholds, runtime/API/DB/schema representation | Техническая реализация | `OPEN` | Нет — остаётся полностью `OPEN` |
| `XFR-D-018` (MSP-04), `XFR-D-021` (MSP-08) | Segment-override evidence; ranking/diversification algorithm | `OPEN`, независимые вопросы | Нет — не затронуты, не смешиваются с Priority Score |

## 5. Rationale

Architecture §15.6 намеренно оставляет Priority Score опциональным и не специфицированным, кроме audit-visibility требования — источник explicitly не решает, кто владеет будущей policy. Присвоение governance owner (без содержания policy) устраняет чисто процедурную неопределённость («кто будет решать», не «что будет решено»), используя тот же owner-паттерн, уже human-approved для трёх sibling Scoring boundary records (`XFR-D-023/026/028`) и уже установленный Architecture §52 для всего артефакта `MATCHING_SCORING_POLICY`. `PARTIALLY_RESOLVED_BOUNDARY` — как и `XFR-D-028` — намеренно отражает, что вопрос структурно распадается на governance-owner-половину (резолвлена) и content-половину (остаётся полностью открытой, вероятно evidence-driven по аналогии с Architecture §37 №2/№3).

## 6. Adversarial cases

1. **Reviewer интерпретирует этот record как утверждение, что Priority Score обязателен.** Запрещено п.4 — источник говорит «может использоваться», этот record этого не меняет.
2. **Попытка вывести формулу или веса из назначения owner'а.** Запрещено п.5 и §4 layer table — governance owner ≠ содержание policy; ни одно числовое значение не утверждено.
3. **Смешение этого record'а с `XFR-D-018`/`XFR-D-021`.** Запрещено §1/§4 — segment-override evidence и ranking/diversification algorithm остаются независимо `OPEN`, не являются частью Priority Score governance owner boundary.
4. **Использование LEGAL как semantic owner Priority Score arithmetic.** Запрещено п.2 — LEGAL присутствует только как mandatory approver по established паттерну (как в `XFR-D-023/026/028`), источник не даёт оснований для elevation LEGAL до semantic owner score-арифметики.
5. **Попытка использовать owner-assignment как implementation authorization для runtime ranking pipeline.** Запрещено §7 — никакой runtime/API/DB/schema/event carrier этим record'ом не проектируется и не разрешается.
6. **Заявление, что `XFR-D-024` полностью резолвлен.** Запрещено п.6 и метаданными `Resolution status: PARTIALLY_RESOLVED_BOUNDARY` — только governance-owner-половина резолвлена; content-половина остаётся полностью `OPEN`.

## 7. Что остаётся `OPEN` (не утверждено этим record'ом)

- формула Priority Score (весовая комбинация Match Score/Confidence Score/Risk Score);
- обязательность использования Priority Score;
- ranking/diversification algorithm, использующий Priority Score (пересекается с `XFR-D-021`, независимо `OPEN`);
- numeric threshold, activation condition, weight value;
- runtime/API/DB/schema/event representation Priority Score;
- `XFR-D-018` (segment-override evidence) и `XFR-D-021` (ranking/diversification algorithm) — независимо `OPEN`;
- Architecture §37 вопросы №2 (Mutual Aggregate function) и №3 (стартовые веса/пороги) — полностью `OPEN`;
- approval Scoring Policy Proposal целиком.

## 8. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 9. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §12 открытое решение №11 получит governance-owner-only cross-reference;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-024`.

Ни один из этих будущих sync-проходов не выполняется этим record'ом.

## 10. Change control

Изменение утверждённой governance-owner-only boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись. Будущее решение о фактической формуле/весах/обязательности Priority Score должно приниматься отдельным decision record, не путём расширения этой записи.

## 11. Итог

`XFR-D-024 GOVERNANCE-OWNER-ONLY BOUNDARY APPROVED — FORMULA, WEIGHTS, RANKING ALGORITHM, ACTIVATION CONDITIONS AND RUNTIME REPRESENTATION REMAIN OPEN`
