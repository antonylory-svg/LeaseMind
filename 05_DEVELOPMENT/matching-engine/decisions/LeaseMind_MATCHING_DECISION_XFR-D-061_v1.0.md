# LeaseMind Matching Decision Record — XFR-D-061

**Decision ID:** `XFR-D-061`

**Название:** False-exclusion maximum governance owner and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-08-27

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER AND EVIDENCE-PREREQUISITE BOUNDARY — NUMERIC FALSE-EXCLUSION MAXIMUM REMAINS OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-27 working session

**Repository baseline:** `d6d9dfdd56edcd7fb918112fca4d4dcbdb5b7280`

**Scope:** governance ownership and evidence prerequisites for a future approved false-exclusion maximum only; does not choose a numeric value, metric formula, denominator, statistical test, dataset, threshold, runtime representation, implementation or Evaluation Plan approval.

**Governance owner (для будущего numeric maximum):** `Chief AI Architect + AI` — human-approved candidate assignment из `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §6.1/§11, решение №5; Architecture не назначает owner этого maximum напрямую.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence-procedure owner:** `AI + DEVELOPMENT` под `MATCHING_EVALUATION_PLAN`; эта роль готовит/проверяет evidence и не заменяет governance approval полного owner/approver set.

**Depends on:** label eligibility `XFR-D-057 v1.0`, adjudication procedure `XFR-D-058 v1.1`, grouping/isolation `XFR-D-059 v1.1`, correction-history exclusion `XFR-D-060 v1.0`; dataset size/split/allocation/seed `XFR-D-062`, segment coverage `XFR-D-064`, fairness framework `XFR-D-068` и threshold-search statistical comparison `XFR-D-070` остаются независимо `OPEN` и необходимы там, где применимы будущему numeric approval. Иные numeric metric targets `XFR-D-063` остаются отдельным `OPEN` решением и не подменяют этот maximum.

---

## 1. Вопрос

Кто владеет будущим утверждением численного maximum для метрики «подтверждённая успешная пара, ошибочно исключённая Hard Filter», и какое evidence обязательно до такого утверждения, если Architecture задаёт только последовательность «baseline, затем утверждённый максимум», но не задаёт число или owner?

## 2. Source/status discipline

Architecture §34.1 нормативно задаёт три разные Hard Constraint safety строки:

1. «Подтверждённая успешная пара, ошибочно исключённая Hard Filter» — цель `baseline, затем утверждённый максимум`, нарушение — превышение утверждённого порога, измерение только на проверенной разметке;
2. «Неизвестное значение, ошибочно обработанное как отрицательное» — `0%`, любое нарушение;
3. «Процессный отказ, использованный как отрицательная метка fit» — `0%`, любое нарушение.

Источник не задаёт numeric maximum для первой строки и не назначает его owner. Значения `0%` второй и третьей строк уже `SOURCE_NORMATIVE`; они не являются кандидатами для калибровки и не могут быть ослаблены будущим maximum первой строки.

Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, proxy/discrimination review, calibration check, Chief AI Architect review и согласование затронутых PRODUCT/LEGAL правил; автоматическое изменение Hard Constraints запрещено. Architecture §52 назначает `AI + DEVELOPMENT` owner'ом `MATCHING_EVALUATION_PLAN` и dataset manifest, но не делает их единоличным owner'ом numeric policy decision.

Evaluation Plan §6.1/§11 предлагает `Chief AI Architect + AI` как candidate owner будущего maximum. Этот record human-approved разрешает только owner/evidence-prerequisite половину вопроса. Numeric content остаётся полностью `OPEN`.

## 3. Решение

### 3.1. Governance owner и обязательное approval-разделение

1. Governance owner будущего numeric false-exclusion maximum — `Chief AI Architect + AI`.
2. Mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`.
3. Evidence-procedure owner — `AI + DEVELOPMENT` в рамках Evaluation Plan.
4. Evidence preparation, metric computation или recommendation не равны approval. `AI`, `DEVELOPMENT` или Chief AI Architect не могут утвердить maximum единолично.
5. Финальное numeric решение требует полного owner/approver set, versioned decision record и точных evidence references.

### 3.2. Узкая metric boundary

Будущий maximum относится только к первой строке Architecture §34.1: проверенная разметка доказывает, что pair была успешной, а Hard Filter ошибочно исключил её.

Этот record:

- не меняет definition Hard Constraint, Eligibility Filter или Qualification routing;
- не определяет, что считать «успешной парой», сверх approved label/source policies;
- не задаёт numerator, denominator, aggregation window, confidence interval или segment roll-up;
- не выбирает baseline или maximum;
- не использует Campaign→Qualified цели `40%/25%` как surrogate или арифметическую подстановку;
- не применяет будущий maximum к false eligibility, unknown handling или process-failure labels.

### 3.3. Неприкосновенные `0%` safety invariants

Будущий false-exclusion maximum не может:

1. разрешить неизвестное значение как отрицательное с частотой выше `0%`;
2. разрешить process failure как negative fit label с частотой выше `0%`;
3. создать tolerance, error budget, waiver или «малое допустимое нарушение» для этих двух Architecture §34.1 строк;
4. ослабить `XFR-D-057`–`XFR-D-060`, unknown≠negative discipline или требования подтверждённого Hard Constraint.

Эти два `0%` правила проверяются и сообщаются отдельно; они не сворачиваются в aggregate false-exclusion metric.

### 3.4. Минимальный evidence package до numeric approval

Ни одно число не может считаться approved maximum без versioned evidence package, включающего как минимум:

1. exact candidate metric definition, numerator, denominator, inclusion/exclusion policy, aggregation window и единицы измерения;
2. доказанную label eligibility по `XFR-D-057`, applicable source-policy evidence и, когда требуется, adjudication по `XFR-D-058`;
3. grouping/split-isolation evidence `XFR-D-059` и correction-history handling `XFR-D-060`;
4. approved `XFR-D-062` dataset size/split/allocation/seed policy и полный frozen manifest;
5. versioned baseline на проверенной разметке, отдельно от candidate maximum;
6. tuning/final separation и применимую approved statistical comparison procedure (`XFR-D-070`);
7. uncertainty/confidence reporting и sample-size limitations без invented fallback;
8. совместное представление false exclusion, false eligibility и unknown-handling results без компенсации одного другим;
9. segment coverage и применимые fairness/proxy/legal reviews (`XFR-D-064`/`XFR-D-068`) без изобретения ещё не утверждённых thresholds;
10. explicit synthetic-only versus real-data applicability statement; synthetic-only evidence не создаёт production maximum или production-readiness claim;
11. candidate maximum, rationale, policy version/hash и immutable links на freeze-time/post-execution evidence;
12. документированные PRODUCT/LEGAL impacts и DEVELOPMENT reproducibility/control verification.

Exact metric/statistical contents перечисленных open dependencies не утверждаются этим record'ом. До их разрешения соответствующий numeric approval блокируется fail closed.

### 3.5. Approval не равен runtime или gate transition

Даже полный evidence package и будущий approved numeric maximum:

- не изменяют Hard Constraints автоматически;
- не меняют model/policy/runtime без отдельного controlled release;
- не утверждают Evaluation Plan или dataset целиком;
- не разрешают production-data use;
- не переводят governance gate автоматически.

### 3.6. Partial, never fully resolved

`XFR-D-061` остаётся `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role и qualitative evidence prerequisites разрешены; numeric maximum, exact metric/statistical definition и фактическое threshold approval остаются `OPEN`.

Будущее численное решение требует нового versioned `XFR-D-061` record с `supersedes` на эту версию. Оно не может быть добавлено путём silent edit, implementation default или Evaluation Plan sync.

## 4. Layer/boundary

| Слой | Что регулирует | Authority | Статус после этого record |
|---|---|---|---|
| Architecture §34.1 metric existence | False exclusion измеряется только на проверенной разметке; сначала baseline, затем approved maximum | Architecture (`SOURCE_NORMATIVE`) | Не изменён |
| Architecture §34.1 two `0%` safety rows | Unknown-as-negative и process-failure-as-negative | Architecture (`SOURCE_NORMATIVE`) | Не изменены; не подлежат tolerance |
| Governance owner будущего maximum | Кто владеет будущим numeric decision | `Chief AI Architect + AI` | Разрешён этим record |
| Mandatory approval | Кто обязан согласовать numeric decision | `PRODUCT + LEGAL + DEVELOPMENT` | Разрешено этим record |
| Evidence procedure | Кто готовит/проверяет Evaluation evidence | `AI + DEVELOPMENT` | Разрешена role boundary; конкретная процедура зависит от open decisions |
| Numeric maximum и exact metric/statistics | Значение, denominator, uncertainty, comparison method | Полный owner/approver set после evidence | `OPEN` |
| Runtime/implementation/release | Carrier, enforcement, monitoring, rollback | Отдельные downstream artifacts/gates | `OPEN` |

## 5. Что остаётся `OPEN`

- numeric false-exclusion maximum;
- exact numerator, denominator, aggregation window, uncertainty/confidence method и segment roll-up;
- фактический verified baseline;
- dataset size, split ratios, allocation boundaries и seed (`XFR-D-062`);
- иные numeric metric targets и их approval owner (`XFR-D-063`) — отдельный вопрос, не surrogate для XFR-D-061;
- segment coverage (`XFR-D-064`), fairness/proxy framework (`XFR-D-068`) и statistical comparison procedure (`XFR-D-070`);
- source-specific definition/evidence для confirmed successful pair и erroneous Hard Filter exclusion;
- production-data/privacy prerequisites;
- runtime/API/DB/schema/event representation, reason codes, enforcement/monitoring/rollback;
- Evaluation Plan, dataset/evaluation-run, model/policy release и implementation approval.

## 6. Rationale

Architecture требует измерять false exclusion, но сознательно не задаёт максимум до появления baseline. Назначение owner устраняет процедурную неопределённость, не подменяя отсутствующее empirical evidence. Full five-function approval сохраняет техническую, продуктовую и юридическую проверку: AI/Chief AI Architect владеют будущим threshold decision, DEVELOPMENT подтверждает воспроизводимость, PRODUCT — продуктовые последствия, LEGAL — применимость затронутых правил и данных.

Разделение первой false-exclusion строки и двух соседних `0%` invariants предотвращает опасную агрегацию, при которой допустимый maximum для одной ошибки превращается в waiver для архитектурно запрещённых negative-label ошибок.

## 7. Adversarial cases

1. **В качестве maximum копируют `40%` или `25%` Campaign→Qualified.** Запрещено: это другая метрика и другой denominator.
2. **До baseline назначают удобное число.** Запрещено: Architecture требует сначала baseline; numeric content остаётся `OPEN`.
3. **Future maximum используют как tolerance для unknown-as-negative.** Запрещено: отдельный `0%` invariant не ослабляется.
4. **Process failure иногда разрешают как negative fit ради aggregate target.** Запрещено: отдельный `0%` invariant и non-compensation discipline сохраняются.
5. **Synthetic run показывает низкую false exclusion.** Это не создаёт production maximum или production-readiness claim.
6. **AI labels successful pair без human/source eligibility.** Такая запись не входит в ground truth по `XFR-D-057`/`XFR-D-058`.
7. **Threshold выбирают и проверяют на одном dataset split.** Evidence непригодно; tuning/final separation и `XFR-D-070` остаются prerequisites.
8. **Низкую false exclusion достигают ценой высокой false eligibility.** Метрики показываются совместно и не компенсируют друг друга.
9. **Chief AI Architect и AI утверждают число без PRODUCT/LEGAL/DEVELOPMENT.** Approval неполон и недействителен по governance boundary.
10. **Owner assignment трактуют как разрешение изменить Hard Filter.** Запрещено: runtime, implementation и controlled release остаются отдельными решениями.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §6.1, §11 решение №5 и readiness summary получат owner/evidence-prerequisite cross-reference без numeric value;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay для `XFR-D-061`;
- будущий numeric `XFR-D-061` decision, metric procedure и runtime artifacts — отдельные downstream passes.

Ни один future sync не должен интерпретировать этот record как numeric maximum, Evaluation Plan/dataset approval, production-readiness evidence или implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, separation of evidence/approval roles, неприкосновенных `0%` boundaries или minimum evidence prerequisites требует нового versioned `XFR-D-061` record, согласованного `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашивается current numeric maximum, **then** значение отсутствует и `XFR-D-061` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** будущий numeric candidate, **when** проверяется authority, **then** governance owner — `Chief AI Architect + AI`, mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`, а evidence preparation не заменяет approval.
3. **Given** false-exclusion metric, **when** определяется target event, **then** он относится только к confirmed successful pair, ошибочно исключённой Hard Filter, на проверенной eligible разметке.
4. **Given** unknown-as-negative или process-failure-as-negative event, **when** применяется будущий maximum, **then** event остаётся отдельным `0%` violation без tolerance или compensation.
5. **Given** Campaign→Qualified targets `40%/25%`, **when** ищется false-exclusion maximum, **then** эти значения не используются как surrogate.
6. **Given** incomplete label, grouping, correction-history, dataset/split или statistical evidence, **when** предлагается numeric approval, **then** approval блокируется fail closed.
7. **Given** только synthetic evidence, **when** формулируется production maximum/readiness claim, **then** claim запрещён.
8. **Given** candidate выбран и проверен на одном split либо false eligibility/segment effects скрыты, **when** проверяется evidence package, **then** package неполон и maximum не утверждается.
9. **Given** будущий approved maximum, **when** рассматривается runtime change, **then** автоматическое изменение Hard Constraints запрещено и требуется отдельный controlled release.
10. **Given** этот record, **when** проверяются Evaluation Plan, dataset/run, production-data use, implementation и gates, **then** они не утверждены и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-061 GOVERNANCE-OWNER AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — NUMERIC FALSE-EXCLUSION MAXIMUM, EXACT METRIC/STATISTICS, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
