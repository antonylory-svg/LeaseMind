# LeaseMind Matching Decision Record — XFR-D-062

**Decision ID:** `XFR-D-062`

**Название:** Dataset size/split/allocation governance and reproducibility boundary

**Версия:** 1.0

**Дата решения:** 2026-08-28

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE, COMPONENT-ATOMIC ALLOCATION AND REPRODUCIBILITY BOUNDARY — NUMERIC SIZE, RATIOS, EXACT ALGORITHM AND SEED VALUE REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-28 working session

**Repository baseline:** `bb46d6c64644e321e2d8a7c015289be7b3548c3c`

**Scope:** governance ownership and qualitative reproducibility/fail-closed requirements for a future approved dataset size, split ratios, allocation policy and seed only; does not choose any numeric size, ratio, minimum, tolerance, seed value, exact allocation algorithm, dataset, label, metric target, runtime representation, implementation or Evaluation Plan approval.

**Governance owner:** `AI + DEVELOPMENT` — source-aligned with Architecture §37 question №10 and §52 ownership of `MATCHING_EVALUATION_PLAN` and dataset manifest, and with Evaluation Plan §11 decision row №6.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence preparation, allocation execution or reproducibility verification does not replace approval by the full owner/approver set.

**Depends on:** label eligibility `XFR-D-057 v1.0`, human adjudication `XFR-D-058 v1.1`, connected-component grouping/isolation `XFR-D-059 v1.1` and correction-history exclusion `XFR-D-060 v1.0`. False-exclusion governance `XFR-D-061 v1.0` remains a downstream `PARTIALLY_RESOLVED_BOUNDARY` consumer of future approved XFR-D-062 evidence; this record does not choose its maximum. Numeric metric targets `XFR-D-063`, segment coverage `XFR-D-064`, fairness/proxy framework `XFR-D-068`, threshold-search statistical comparison `XFR-D-070` and post-freeze correction synchronization `XFR-D-071` remain independent `OPEN` decisions and cannot be silently resolved by allocation.

---

## 1. Вопрос

Кто владеет будущим утверждением dataset size, split ratios, allocation policy и seed для Matching evaluation, и какие qualitative allocation/reproducibility границы обязательны до численного решения, если Architecture требует frozen sample, reproducibility bundle и owner `AI + DEVELOPMENT`, но не задаёт размеры, ratios, minimums, tolerance, exact algorithm или seed value?

## 2. Source/status discipline

Architecture §30.3 требует до platform-level изменения подготовить зафиксированную выборку, проверить качество меток, выполнить offline evaluation, proxy/discrimination и calibration checks, review Chief AI Architect и согласование затронутых PRODUCT/LEGAL правил. Architecture §37 question №10 назначает `AI + DEVELOPMENT` owner'ом вопроса о размеченной выборке и adjudication для pilot baseline. Architecture §49 требует random seed и deterministic mode в reproducibility bundle. Architecture §52 назначает `AI + DEVELOPMENT` owner'ом `MATCHING_EVALUATION_PLAN` и dataset manifest.

Эти источники не задают:

- numeric dataset size или minimum eligible sample;
- tuning/final или иных split ratios;
- tolerance/deviation от target ratio;
- exact allocation/stratification/optimization algorithm;
- конкретный seed value;
- правило достаточности sample для отдельной метрики или сегмента.

Architecture §34.1 pilot boundary «не более 100 запущенных Кампаний» не является размером evaluation dataset, sample-size minimum, split ratio или statistical-adequacy доказательством и не может использоваться как surrogate.

Evaluation Plan §4 и `XFR-D-059 v1.1` уже утверждают connected component как атомарную split-isolation unit: компонент целиком назначается ровно в один split и не разрезается из-за размера или желаемого ratio. Evaluation Plan §8 требует freeze-time manifest с dataset hash, component membership/assignments и seed/determinism mode. Evaluation Plan §9 требует отделять tuning evidence от final evaluation evidence. Эти правила не выбирают numeric size/ratios или exact allocation algorithm.

Этот record разрешает только governance и qualitative allocation/reproducibility boundary. Numeric content и фактическое evidence остаются `OPEN`.

## 3. Решение

### 3.1. Governance owner и approval-разделение

1. Governance owner будущей dataset size/split/allocation/seed policy — `AI + DEVELOPMENT`.
2. Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.
3. Evidence-procedure owner — `AI + DEVELOPMENT` в рамках Evaluation Plan.
4. Подготовка dataset evidence, выполнение allocation, вычисление достигнутых ratios или воспроизводимость не равны approval.
5. Ни `AI`, ни `DEVELOPMENT`, ни Chief AI Architect не могут единолично утвердить numeric size/ratios, exact algorithm или seed policy.
6. Будущее численное решение требует полного owner/approver set, нового versioned decision record и immutable evidence references.

### 3.2. Component-atomic allocation boundary

1. Единственная разрешённая split-assignment unit — полный connected component, определённый `XFR-D-059 v1.1`.
2. Все records одного component назначаются ровно в один split; per-record разрезание component запрещено.
3. Размер component или несовпадение с желаемым ratio не создают leakage waiver и не разрешают разрезание.
4. Labels, outcomes, model/AI scores, post-allocation metrics, свободный текст или similarity не создают и не изменяют component membership сверх `XFR-D-059 v1.1`.
5. Allocation не делает record eligible: до assignment обязательны `XFR-D-057`/`XFR-D-058`, а correction-history handling выполняется по `XFR-D-060`.
6. Excluded, unresolved или ineligible record не становится negative sample и не используется для искусственного достижения size/ratio.

### 3.3. Pre-freeze determinism и seed discipline

До перехода run в `FROZEN` versioned evidence обязано зафиксировать:

- dataset snapshot/manifest identity и hash;
- approved inclusion/exclusion, grouping и correction-history policy versions/hashes;
- полный eligible component universe и component-membership evidence;
- declared counting units и фактически включённые/исключённые counts без подмены units;
- exact allocation procedure/version и все её входные параметры;
- если применяется randomization — конкретный seed value и deterministic mode для этого freeze;
- final one-component-to-one-split assignments и их immutable hashes;
- фактически достигнутое allocation distribution и любые отклонения от будущей approved policy;
- rationale/evidence для исключений, не превращающий исключение в negative label.

Этот перечень задаёт evidence categories, а не утверждает физическую schema, field names, API/DB/event carrier или конкретное значение.

Запрещено:

1. выбирать или менять seed после просмотра labels, outcomes, segment composition, model results или final metrics ради более удобного результата;
2. выполнять скрытый reroll/reseed и оставлять только лучший allocation;
3. менять allocation algorithm/parameters после freeze без нового versioned freeze cycle;
4. переносить component между splits после просмотра результатов;
5. использовать final split для выбора policy/model/threshold, который затем заявляется проверенным на том же final split;
6. считать декларацию seed достаточной без versioned algorithm, inputs, component universe и assignments.

### 3.4. Fail-closed handling несоответствий

До будущего numeric approval отсутствие size/ratio/algorithm/seed policy означает, что `XFR-D-062` остаётся частично открытым и dataset/run не получает статус approved или valid только из этого record.

После будущего approval:

- component, который невозможно разместить без нарушения atomic isolation, не разрезается;
- недоказанная component isolation, missing manifest evidence или несогласованный replay отклоняют freeze/run fail closed;
- отклонение от approved ratio/minimum/tolerance не скрывается округлением, агрегацией или исключением неудобных components;
- если approved constraints одновременно невыполнимы, freeze блокируется до нового versioned governance decision либо явно разрешённого и доказанного deviation; этот record не создаёт default tolerance или waiver;
- post-freeze correction/component evidence не переписывает historical allocation; применяется отдельный versioned cycle и `XFR-D-071`.

### 3.5. Independent decisions не подменяются

`XFR-D-062` не определяет:

- numeric metric targets, metric denominators или threshold owner (`XFR-D-063`);
- numeric false-exclusion maximum, baseline или exact metric/statistics (`XFR-D-061`);
- segment coverage requirements или minimum per segment (`XFR-D-064`);
- fairness/proxy/legal diagnostic framework (`XFR-D-068`);
- statistical comparison, uncertainty/confidence procedure или power/significance rule (`XFR-D-070`);
- correction synchronization для уже frozen/executed runs (`XFR-D-071`);
- production-data authority, lawful basis или privacy approval; authority model `XFR-D-067` не заменяет pending named appointment/RBAC;
- runtime/API/DB/schema/event representation, scheduler, storage или implementation.

Stratification, balancing, oversampling, undersampling, weighting или optimization по label/segment/metric не допускаются как скрытый substitute для этих решений. Если они когда-либо предлагаются, их semantics, leakage/fairness effects и evidence утверждаются явно до freeze.

### 3.6. Partial, never fully resolved

`XFR-D-062` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, component-atomic allocation, pre-freeze evidence/seed discipline, no-reroll rule и fail-closed qualitative boundary разрешены.

Остаются `OPEN`:

- numeric dataset size и minimum eligible sample;
- split names beyond already required tuning/final separation и все split ratios;
- counting denominator/units для statistical adequacy;
- exact allocation/stratification/optimization algorithm;
- seed-generation policy и конкретный seed value для будущего freeze;
- ratio/minimum tolerance и deviation policy;
- metric- и segment-specific sufficiency criteria;
- фактический dataset manifest, allocation и run evidence.

Будущее решение этих вопросов требует нового versioned `XFR-D-062` record с `supersedes` на эту версию. Они не могут быть добавлены silent edit, implementation default, conventional split или Evaluation Plan sync.

## 4. Layer/boundary

| Слой | Что регулирует | Authority | Статус после этого record |
|---|---|---|---|
| Label/adjudication eligibility | Какие records могут быть ground-truth candidates | `XFR-D-057`/`XFR-D-058` | Не изменена; mandatory prerequisite |
| Grouping/isolation | Closed source-authoritative component и one-component-to-one-split rule | `XFR-D-059 v1.1` | Не изменена; mandatory prerequisite |
| Correction-history exclusion | Какие corrected Campaign outcomes исключаются до split | `XFR-D-060 v1.0` | Не изменена; mandatory prerequisite |
| Governance owner/approvers | Кто владеет и согласует будущую size/split/allocation/seed policy | `AI + DEVELOPMENT`; `Chief AI Architect + PRODUCT + LEGAL` | Разрешено этим record |
| Qualitative allocation/reproducibility | Atomic components, pre-freeze evidence, deterministic seed discipline, no reroll, fail closed | Этот record + Architecture §30.3/§49/§52 | Разрешено этим record |
| Numeric size/ratios/exact algorithm/seed policy | Значения, counting units, tolerances, allocation method | Будущий полный owner/approver decision после evidence | `OPEN` |
| Metrics/segments/fairness/statistics | Targets, coverage, fairness и comparison procedure | `XFR-D-063`/`064`/`068`/`070` | `OPEN`, independently governed |
| Runtime/implementation/release | Physical carrier, execution, monitoring, rollback | Отдельные downstream artifacts/gates | `OPEN` |

## 5. Что остаётся `OPEN`

- все numeric dataset sizes, minimums, ratios и tolerances;
- exact counting unit/denominator для sufficiency claims;
- exact allocation, stratification, balancing или optimization algorithm;
- seed-generation method и конкретный seed value;
- metric- и segment-specific sample sufficiency;
- фактический dataset, manifest, source snapshot, allocation и run;
- `XFR-D-063`, `XFR-D-064`, `XFR-D-068`, `XFR-D-070`, `XFR-D-071`;
- production-data/privacy/legal prerequisites и pending named appointments/RBAC после authority model `XFR-D-067`;
- runtime/API/DB/schema/event carrier, implementation, monitoring и rollback;
- Evaluation Plan, model/policy release и governance-gate approval.

## 6. Rationale

Architecture требует frozen sample и воспроизводимость, но намеренно не задаёт произвольные числа до появления подходящего evidence. Owner assignment и qualitative allocation discipline предотвращают leakage и cherry-picking, не подменяя статистическую достаточность удобным conventional split.

Component-atomic assignment сохраняет утверждённую `XFR-D-059` isolation boundary. Pre-freeze seed/algorithm evidence и запрет reroll предотвращают выбор удобного partition после просмотра labels или metrics. Full owner/approver set обеспечивает техническую воспроизводимость, model-governance review, продуктовую применимость и юридическую проверку данных/сегментов.

## 7. Adversarial cases

1. **Берут распространённый split по привычке.** Запрещено: никакие conventional ratios этим record не утверждены.
2. **Используют pilot cap `100 Campaign` как minimum/maximum dataset size.** Запрещено: это другая Architecture boundary, не statistical sample policy.
3. **Большой component мешает желаемому ratio.** Component не разрезается; freeze блокируется либо применяется будущая явно approved policy.
4. **Seed перебирают до красивых metrics.** Запрещено как post-selection/cherry-picking; seed и algorithm фиксируются до просмотра результатов.
5. **Указывают seed, но не algorithm или component universe.** Evidence неполно и не доказывает воспроизводимость.
6. **Неудобные components исключают после allocation.** Запрещено без заранее утверждённой inclusion/exclusion policy и immutable rationale.
7. **Record попал в split и считается eligible label.** Запрещено: assignment не заменяет `XFR-D-057`/`XFR-D-058`.
8. **Corrected Campaign используют для добора size.** Запрещено `XFR-D-060`; excluded outcome не становится negative sample.
9. **На final split выбирают threshold и там же заявляют final evidence.** Запрещено tuning/final separation.
10. **Synthetic dataset достаточно велик.** Это не создаёт production-data approval, production adequacy или gate transition.
11. **Allocation соответствует ratio, но нарушает component isolation.** Run/freeze отклоняется fail closed; ratio не компенсирует leakage.
12. **Хороший aggregate скрывает segment insufficiency.** `XFR-D-064`/`XFR-D-068` остаются независимыми prerequisites; allocation не подменяет их.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §4, §8, §11 решение №6 и readiness summary получат qualitative governance/reproducibility cross-reference без чисел;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay для `XFR-D-062`;
- будущий numeric `XFR-D-062`, manifest procedure и runtime artifacts — отдельные downstream passes.

Ни один future sync не должен интерпретировать этот record как dataset, allocation, numeric ratio/minimum, statistical adequacy, Evaluation Plan approval, production-readiness evidence или implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, component-atomic boundary, pre-freeze seed/evidence discipline, no-reroll rule или fail-closed requirements требует нового versioned `XFR-D-062` record, согласованного `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашиваются current dataset size, split ratios, exact allocation algorithm или seed value, **then** значения отсутствуют и `XFR-D-062` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** будущий numeric/allocation candidate, **when** проверяется authority, **then** governance owner — `AI + DEVELOPMENT`, mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`, а evidence preparation не заменяет approval.
3. **Given** connected component `XFR-D-059`, **when** выполняется allocation, **then** весь component назначается ровно в один split и не разрезается ради ratio.
4. **Given** randomization, **when** run переходит в `FROZEN`, **then** seed value, deterministic mode, algorithm/version, inputs/component universe и assignments уже зафиксированы immutable evidence.
5. **Given** просмотр labels/outcomes/metrics, **when** предлагается reroll, reseed или post-hoc reassignment, **then** операция запрещена и требует нового versioned freeze cycle.
6. **Given** pilot cap `100 Campaign` или conventional split, **when** ищется dataset size/ratio, **then** они не используются как surrogate или default.
7. **Given** невозможно одновременно выполнить будущие approved constraints и component isolation, **when** формируется freeze, **then** component не разрезается и freeze блокируется до versioned decision; default tolerance не изобретается.
8. **Given** assignment, **when** проверяется label eligibility/correction history, **then** `XFR-D-057`–`XFR-D-060` остаются mandatory prerequisites, а excluded/unresolved record не становится negative sample.
9. **Given** allocation evidence, **when** проверяются false-exclusion/metric/segment/fairness/statistical claims, **then** numeric часть `XFR-D-061` и решения `XFR-D-063`/`064`/`068`/`070` остаются independently `OPEN` и не считаются разрешёнными.
10. **Given** этот record, **when** проверяются dataset, Evaluation Plan, evaluation run, production-data use, runtime, implementation и gates, **then** они не утверждены и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-062 GOVERNANCE, COMPONENT-ATOMIC ALLOCATION AND REPRODUCIBILITY BOUNDARY APPROVED — NUMERIC SIZE, RATIOS, EXACT ALGORITHM, SEED VALUE, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
