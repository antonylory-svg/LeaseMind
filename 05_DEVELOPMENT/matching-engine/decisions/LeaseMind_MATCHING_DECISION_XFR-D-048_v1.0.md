# LeaseMind Matching Decision Record — XFR-D-048

**Decision ID:** `XFR-D-048`

**Название:** Risk aggregation qualitative model and non-compensation boundary

**Версия:** 1.0

**Дата решения:** 2026-08-25

**Decision status:** `APPROVED`

**Статус:** `APPROVED — multi-component Risk representation and conditional non-compensation invariant approved; weighted aggregation, numeric thresholds/TTL/calibration targets, runtime representation and Risk→Qualification interface remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-25 working session

**Scope:** governance semantics only; does not authorize implementation, runtime/API/DB/schema/event design, или reason-code values.

**Owner:** `Chief AI Architect + LEGAL` — approved governance assignment этого record'а, совпадающая с artifact owner `MATCHING_RISK_POLICY` (Architecture §52, «Qualification blocker»). Это **не** claim, что Architecture напрямую называет owner именно §13 открытого решения №2 (`XFR-D-048`): `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13, строка 2 до этого record указывала только `Chief AI Architect + AI` как **candidate assignment** («источник не назначает owner этого решения напрямую»). Этот record осознанно переопределяет owner именно этого конкретного decision на `Chief AI Architect + LEGAL`, не меняя artifact ownership Risk Policy в целом и не утверждая, что Architecture называла эту пару для §13 строки 2 буквально.

**Mandatory approvers:** `PRODUCT + DEVELOPMENT`.

**Consulted domain function:** `AI`.

Rationale for this approval composition: `PRODUCT` — обязательный approver, поскольку этот Risk aggregation boundary становится будущим входом Qualification/product semantics (см. §4 layer table); `DEVELOPMENT` — обязательный approver для reproducibility и technical feasibility; `AI` — обязательная consulted domain function, не отдельный approver. Это сохраняет repository-wide cross-functional approval pattern (`Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, см. §10), не меняя artifact ownership Risk Policy.

**Depends on:** нет формальных `Depends on` — record ссылается на `XFR-D-033 v1.0` и `XFR-D-040 v1.0` только как boundary precedent (см. §4), не как prerequisite; ни одна из этих записей не переоткрывается и не supersedes этим record'ом.

---

## 1. Source/status discipline и authority boundary

`LeaseMind_MATCHING_RISK_POLICY_v0.1.md` использует четыре статуса (`SOURCE_NORMATIVE`, `DECISION_CANDIDATE_FOR_REVIEW`, `OPEN_BLOCKED_PENDING_DECISION`, `OUT_OF_SCOPE`, §1 документа). Пять aggregation-кандидатов §9 Risk Policy — все `DECISION_CANDIDATE_FOR_REVIEW`, ни один не выбран источником. Этот record — human-approved governance decision, layered поверх этих кандидатов, аналогично `RESOLVED_QUALITATIVE_BOUNDARY` статусу, уже применённому `XFR-D-013`/`XFR-D-033`/`XFR-D-037`/`XFR-D-038`/`XFR-D-040` для соседних Qualification/Feature Schema qualitative boundaries — не буквальная Architecture-норма и не approval `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` в целом.

## 2. Вопрос

`LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13 открытое решение №2 (`XFR-D-048`, source key `MRP-02`): какая aggregation formula/precedence применяется к Risk output? §9 документа сравнивает пять кандидатов (a) independent per-category flags, (b) max/worst-factor precedence, (c) explicit rule-based precedence, (d) weighted aggregation, (e) multi-dimensional vector — ни один не выбран. Какой qualitative boundary может быть утверждён в Wave 2 без выбора чисел, весов или runtime представления?

## 3. Решение

Утверждается qualitative boundary, комбинирующий элементы кандидатов (a)/(e) (multi-component representation) с non-compensation-свойством кандидата (b), без выбора единой численной формулы:

1. **Multi-component representation.** Канонические governance semantics Risk — multi-component: результаты допустимых Risk-категорий (§5 Risk Policy, 10 категорий Architecture §17) остаются раздельно сохранёнными и не заменяются единым скаляром.
2. **Derived scalar — только supplement.** Любой будущий scalar, если отдельно утверждён, может быть только derived supplement поверх компонентов — он не заменяет, не подавляет и не отбрасывает лежащие в основе category-компоненты.
3. **Non-compensation для critical категорий.** Если категория классифицирована как critical по отдельно утверждённым правилам, её сигнал non-compensating: остальные, менее рискованные или benign категории не могут разбавить, усреднить или скрыть его.
4. **Conditional invariant, не готовое правило.** Это условный инвариант. Определение и evidence sufficiency для critical категории остаются `OPEN` под `XFR-D-049` и reviewer/authority-зависимостями, включая `XFR-D-053`; этот record не изобретает critical-category mapping ни для одной из 10 категорий.
5. **Missing/conflicting/stale не схлопываются.** Missing, conflicting и stale evidence не должны сворачиваться в одно состояние и не считаются negative/clean evidence (согласовано с Architecture §32, §5 принцип 7, `MRP-C-004`). Точное Risk-специфичное operational-поведение остаётся `OPEN` под `XFR-D-051`.
6. **Weighted aggregation deferred.** Weighted aggregation (кандидат d), численные веса, thresholds, TTL и calibration targets остаются deferred к empirical evidence и отдельно управляемым решениям `XFR-D-050` и `XFR-D-M2`.
7. **Runtime representation deferred.** Точные runtime поля, enums, сериализация, API/DB/schema/event representation и carrier остаются `OPEN` под `XFR-D-047`; Risk→Qualification hand-off остаётся `OPEN` под `XFR-D-055`.
8. **Qualification precedence не переоткрывается.** Этот record не меняет и не переоткрывает Qualification-level fail-closed precedence или multi-cause rules `XFR-D-033`/`XFR-D-040`. Risk-internal non-compensation и итоговый Qualification routing — разные слои (см. §4 ниже).
9. **Не storage layout/runtime schema.** Утверждённая модель концептуально соответствует multi-dimensional/per-category представлению плюс conditional non-compensation overlay. Она не описывается и не утверждается как approved storage layout или runtime vector schema — это governance semantics, не техническое проектирование.
10. **Protected/proxy запрет не ослаблен.** Ни один protected attribute или неутверждённый proxy не может населять Risk component; lawful-source и protected/proxy-решения остаются отдельно управляемыми (`XFR-D-054`, Architecture §17 без ослабления).

## 4. Layer/boundary table — Risk-internal non-compensation vs Qualification precedence vs Match Score arithmetic

| Слой | Что регулирует | Owner/authority | Затронут этим record'ом? |
|---|---|---|---|
| Match Score arithmetic (Architecture §15.6) | `Reciprocal Fit ⊕ Deal Feasibility` по утверждённой версии весов; Risk Score в эту формулу не входит | `MATCHING_SCORING_POLICY` | Нет — граница §6 Risk Policy не меняется |
| **Risk-internal aggregation (этот record)** | Как результаты 10 категорий представлены и не компенсируют друг друга **внутри** Risk output, до передачи в Qualification | `Chief AI Architect + LEGAL` (этот record) | **Да — единственный резолвленный этим record'ом слой** |
| Qualification fail-closed precedence (`XFR-D-033`) | Как несколько одновременных Qualification-level причин (Eligibility `INELIGIBLE`, human-review triggers, verification needs) определяют один из четырёх routing results | `Chief AI Architect + PRODUCT` (Qualification Policy artifact owner, `XFR-D-030`) | Нет — не переоткрывается, не меняется |
| Qualification multi-cause preservation (`XFR-D-040`) | Как сохраняются все Qualification-level причины и выбирается primary reason при нескольких причинах в одном precedence-классе | Тот же owner, что `XFR-D-033` | Нет — не переоткрывается, не меняется |
| Risk→Qualification interface (`XFR-D-055`, `XFR-D-M2`) | Как именно Risk output становится одним из входов Qualification Gate condition 7 (§18.1) и при каком триггере ведёт к `HUMAN_REVIEW_REQUIRED`/`NEEDS_VERIFICATION` | `AI + LEGAL` (Architecture §37 №8) / candidate (`XFR-D-055`) | Нет — остаётся `OPEN`; этот record поставляет только non-compensation invariant как будущий вход, не сам интерфейс |

## 5. Rationale

Из пяти кандидатов §9 только (d) weighted aggregation внутренне требует числа (веса) для самого своего существования — это прямо противоречит запрету invented Risk weights/thresholds/TTL (`MRP-C-014`, Risk Policy DoD §15) и не может быть сведено к qualitative boundary без изобретения placeholder-веса. Кандидаты (a) и (e) структурно совместимы друг с другом — (e) формализует (a) в fixed-dimension структуру; ни один сам по себе не даёт routing-usable сигнала без отдельного precedence-правила, что и обеспечивает non-compensation-свойство кандидата (b), взятое как overlay, а не как единственная output-форма (которая иначе пожертвовала бы per-category detail — детализация, поддержанная §5 принципами 8–9 Architecture, но утверждённая именно на этом уровне детализации не буквальной Architecture-нормой, а этим самым record'ом `XFR-D-048`; сами принципы 8–9 дословно требуют только раздельности четырёх и трёх сущностей соответственно; они не требуют десятикатегорийной per-Risk-component детализации, утверждённой этим record'ом: Architecture §17 задаёт названия 10 Risk-категорий, а способ их совместного концептуального представления определяется `XFR-D-048`). Кандидат (c) explicit rule-based precedence остаётся правдоподобным будущим уточнением non-compensation-инварианта, но комбинаторно дорог без предварительных `XFR-D-049`/`XFR-D-054` — не Wave 2 primitive. Комбинация (a)/(e)+non-compensation overlay — единственный вариант, который одновременно сохраняет per-category detail, auditability, non-compensation для critical сигналов и различие missing/conflicting/stale, не требуя ни одного числа — согласовано с уже утверждённым для Qualification-уровня паттерном `XFR-D-033`/`XFR-D-037`/`XFR-D-040`, не повторяя их содержание, а применяя тот же governance-метод на другом слое.

## 6. Adversarial cases

1. **Один critical фактор среди множества benign.** Категория 4 (дублирование) в confirmed critical состоянии, остальные девять — чисты. Non-compensation invariant (§3 п.3) требует, чтобы критический сигнал остался недиминированным и отдельно видимым, а не растворился в «в среднем низком риске».
2. **Несколько одновременно критических категорий.** Например, категория 1 (конфликт данных) и категория 5 (операционная несовместимость) независимо критичны. Multi-component representation (§3 п.1) обязана сохранить обе, не сворачивая в единственный «primary risk» — согласовано по духу с multi-cause philosophy, уже утверждённой для Qualification `XFR-D-040`, но применённой здесь к другому (Risk-internal) слою, не переоткрывая сам `XFR-D-040`.
3. **Missing, conflicting и stale в разных категориях одновременно.** Architecture §32 и `MRP-C-004` требуют три различных поведения. Этот record обязывает (§3 п.5), что multi-component представление сохраняет их различимыми per категория, не нормализуя в единый generic «flagged» статус.
4. **Попытка «удобного» scalar-сокращения.** Будущая реализация схлопывает все 10 категорий в одно число «для простоты». §3 пп.2/9 прямо запрещают: любой scalar — только derived supplement, не замена category-компонентов, и сама модель не есть approved storage/runtime schema — попытка ввести единственный runtime score вместо non-compensating структуры противоречит этому record'у.
5. **Смешение с Qualification-level precedence.** Ревьюер или будущий implementer путает Risk-internal non-compensation с `XFR-D-033`'s fail-closed hierarchy на уровне Qualification. Layer/boundary table (§4) явно разводит: Risk-internal правило формирует **собственный output** Risk Policy до передачи в Qualification; `XFR-D-033` резолвит, как **Qualification** обрабатывает несколько одновременных причин (включая сам Risk output как один из входов через `XFR-D-055`/`XFR-D-M2`, оба остаются `OPEN`).
6. **Risk просачивается в Match Score arithmetic.** Любая будущая реализация non-compensation/vector-модели не должна становиться входом формулы §15.6 (`Reciprocal Fit ⊕ Deal Feasibility`) — это уже установленная Architecture-граница (`MRP-C-006`), не новое правило, но explicitly reaffirmed здесь как implementation-guardrail against наиболее вероятной ошибки при появлении «vector-подобной» концепции Risk output.

## 7. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` — §9 candidate table получит аннотацию «qualitative boundary approved / numeric deferred» рядом с кандидатами (a)/(b)/(e); §13 открытое решение №2 перейдёт от plain candidate-assignment к `RESOLVED_QUALITATIVE_BOUNDARY`-cross-reference, по паттерну уже применённому в `MATCHING_QUALIFICATION_POLICY_v0.1.md` §15 (строки 4/10/11/13/18);
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-048` (аналогично §5.2/§5.3/§5.4/§5.5), явно называющий remaining open dependencies из §9 ниже;
- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — опциональная cross-reference заметка (Qualification уже трактует Risk output как внешний conceptual input, candidate №1, и не claims ownership Risk-internal aggregation) — не обязательное изменение содержания.

Ни один из этих будущих sync-проходов не выполняется этим record'ом.

## 8. Не утверждено (explicit non-decisions)

- Ни один численный weight, threshold, TTL или calibration target (weighted aggregation candidate (d) целиком остаётся deferred);
- определение «confirmed critical» за пределами conditional-invariant формы §3 п.3 — зависит от `XFR-D-049`/`XFR-D-053`, не изобретается здесь;
- explicit rule-based precedence catalog (candidate (c)) — не выбран, не отклонён, остаётся будущим возможным уточнением;
- runtime enum, field, event, reason-code value, API/DB/schema representation (`XFR-D-047`, `XFR-D-052`, `XFR-D-055`);
- точный Risk→Qualification interface/trigger (`XFR-D-055`, `XFR-D-M2`, Architecture §37 №8);
- изменение или переоткрытие `XFR-D-033`/`XFR-D-040` (Qualification-level precedence и multi-cause rule) — оба остаются Qualification-owned и неизменёнными;
- закрытие Architecture §37 вопроса №8;
- изменение статуса `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE`;
- изменение любого существующего файла кроме этого нового record'а;
- implementation authorization любого рода.

## 9. Зависимости, остающиеся `OPEN`

- `XFR-D-047` — Risk output representation/runtime-public identifiers;
- `XFR-D-049` — per-factor evidence sufficiency для всех 10 категорий;
- `XFR-D-M2` — Risk→routing human-review threshold (Architecture §37 №8, source-owned `AI + LEGAL`);
- `XFR-D-050` — Risk calibration dataset/metrics/segments;
- `XFR-D-051` — точные operational details для missing/conflicting/stale, специфичные для Risk;
- `XFR-D-052` — Risk reason-reference namespace/values/compatibility-change process/owner;
- `XFR-D-053` — reviewer authority и Decision Record link per risk class;
- `XFR-D-054` — protected/proxy classification catalog и lawful basis per допустимому non-protected feature;
- `XFR-D-055` — точный интерфейс Risk output → Qualification routing;
- `XFR-D-M4` — bounded replay tolerance при вероятностном компоненте.

Прочие открытые решения `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13 (duplication-detection owner — категория 4; re-identification method/threshold `XFR-D-M3`; численный TTL для «устаревания» — Architecture §37 №11/Feature Schema №6) остаются независимо `OPEN` и не входят в прямые dependencies этого record'а.

## 10. Change control

Изменение утверждённого qualitative aggregation/non-compensation boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись. Эта cross-functional approval clause не превращает всех участников в artifact owner Risk Policy — artifact owner остаётся `Chief AI Architect + LEGAL` per Architecture §52.

## 11. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`. Architecture §37 вопрос №8 остаётся `OPEN`.

## 12. Acceptance criteria

1. **Given** одна категория в confirmed-critical состоянии и девять категорий в clean состоянии, **when** формируется Risk output, **then** критический сигнал остаётся недиминированным и отдельно видимым, не резолвится в агрегированное «низкий риск».
2. **Given** две или более независимо критичных категорий, **when** формируется Risk output, **then** все они сохраняются для audit/explanation, ни одна не отбрасывается в пользу единственного «primary risk».
3. **Given** missing, conflicting и stale evidence в трёх разных категориях одновременно, **when** формируется Risk output, **then** все три поведения остаются различимыми per категория (Architecture §32), не сворачиваются в единый flag.
4. **Given** утверждённая модель, **when** запрашивается runtime/storage форма, **then** ни один scalar не заменяет category-компоненты; любой будущий scalar — только derived supplement.
5. **Given** любой раздел этого record'а, **when** выполняется поиск численного значения, **then** ни один weight, threshold, TTL или calibration target не найден вне явно помеченного `OPEN`.
6. **Given** этот record, **when** запрашивается runtime representation или Risk→Qualification interface, **then** ни один не введён — оба остаются `OPEN` под `XFR-D-047`/`XFR-D-055`.
7. **Given** `XFR-D-033` и `XFR-D-040`, **when** проверяется их статус после этого record'а, **then** оба остаются неизменёнными и не supersedes этим record'ом.
8. **Given** Architecture §37 вопрос №8, **when** проверяется его статус, **then** остаётся `OPEN`.
9. **Given** `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE`, `PRODUCTION_LAUNCH_GATE`, **when** проверяется их статус, **then** все три остаются `BLOCKED`.

## 13. Итог

`XFR-D-048 QUALITATIVE AGGREGATION AND NON-COMPENSATION BOUNDARY APPROVED — WEIGHTED AGGREGATION, NUMERIC THRESHOLDS, RUNTIME REPRESENTATION AND RISK→QUALIFICATION INTERFACE REMAIN OPEN`
