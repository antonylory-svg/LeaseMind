# LeaseMind Matching Decision Record — XFR-D-070

**Decision ID:** `XFR-D-070`

**Название:** Threshold-search statistical-comparison governance and evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-08-29

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE, PRE-REGISTRATION, TUNING/FINAL SEPARATION AND QUALITATIVE COMPARISON-EVIDENCE BOUNDARY — ALL EXACT AND NUMERIC STATISTICAL CONTENT REMAINS OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-29 working session

**Repository baseline:** `e4725759a06070a91d83f7f73e0e7f052d0d64ae`

**Scope:** governance ownership and qualitative evidence discipline for a future approved threshold-search statistical comparison procedure only; does not choose a statistical paradigm, hypothesis/test, numeric significance/confidence/power/effect-size value, sample-size rule, multiple-comparison method, sequential rule, threshold, dataset, metric definition, runtime representation, implementation or Evaluation Plan approval.

**Governance owner:** `AI + DEVELOPMENT` — source-aligned with Architecture §37 question №10 and §52 ownership of `MATCHING_EVALUATION_PLAN`/dataset manifest, and with Evaluation Plan §11 decision row №16.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Evidence-procedure owner:** `AI + DEVELOPMENT`; procedure design, evidence preparation, statistical computation or reproducibility verification does not replace approval by the full owner/approver set.

**Depends on:** label eligibility `XFR-D-057 v1.0`, adjudication `XFR-D-058 v1.1`, grouping/isolation `XFR-D-059 v1.1`, correction-history exclusion `XFR-D-060 v1.0`, false-exclusion boundary `XFR-D-061 v1.0`, dataset allocation `XFR-D-062 v1.0`, metric-target boundary `XFR-D-063 v1.0`, segment-coverage boundary `XFR-D-064 v1.0`, drift-monitoring boundary `XFR-D-065 v1.0`, Evaluation Plan approval procedure `XFR-D-066 v1.0`, Data Governance authority model `XFR-D-067 v1.0`, fairness boundary `XFR-D-068 v1.0` and qualitative terminology `XFR-D-069 v1.0` remain independently applicable. Post-freeze correction synchronization `XFR-D-071` remains `OPEN` and is not resolved here.

---

## 1. Вопрос

Кто владеет будущим утверждением statistical comparison procedure для threshold search и какие qualitative evidence boundaries обязательны до exact/numeric решения, если Evaluation Plan §9 требует tuning/final separation и human approval, но оставляет сам statistical method `OPEN_BLOCKED_PENDING_DECISION`?

## 2. Source/status discipline

Evaluation Plan §9 разрешает только procedure boundary: candidate policy/version bundle, разделение tuning и final evidence, запрет поиска и final-проверки того же threshold на одних данных, фиксацию выбранного значения в соответствующем policy artifact и отдельное cross-functional human approval. §9 прямо оставляет statistical method сравнения candidate thresholds `OPEN_BLOCKED_PENDING_DECISION`.

`MEP-C-011` требует untouched final evidence относительно поиска того же threshold; `MEP-C-013` запрещает прямое сравнение runs с несовместимыми schema/policy versions; `MEP-C-014` запрещает автоматическое изменение policy/model по evaluation result.

Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, discrimination/proxy and calibration checks, Chief AI Architect review и согласование затронутых PRODUCT/LEGAL правил. Architecture §34.1/§34.2 сохраняет последовательность `baseline first, approved threshold later`. Architecture §52 назначает `AI + DEVELOPMENT` owner'ом Evaluation Plan и dataset manifest. Эти источники не выбирают:

- statistical paradigm, test family или exact hypotheses;
- significance, confidence/credible, power, effect-size или uncertainty values;
- sample-size calculation или stopping rule;
- multiple-comparison, sequential, resampling, equivalence или non-inferiority procedure;
- metric definitions, denominators, aggregation или decision mapping;
- threshold-search space, candidate-generation algorithm или winning rule.

`XFR-D-061`, `XFR-D-063`, `XFR-D-064` и `XFR-D-068` требуют applicable statistical evidence, но не утверждают его exact contents. Этот record разрешает только governance и qualitative comparison-evidence discipline. Exact/numeric statistical content и фактическое evidence остаются `OPEN`.

## 3. Решение

### 3.1. Governance owner и approval-разделение

1. Governance owner будущей threshold-search statistical comparison procedure — `AI + DEVELOPMENT`.
2. Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.
3. Evidence-procedure owner — `AI + DEVELOPMENT` в рамках Evaluation Plan.
4. Procedure proposal, computation, result review или reproducibility verification не равны approval.
5. Ни `AI`, ни `DEVELOPMENT`, ни Chief AI Architect не могут единолично утвердить exact method, numeric value или decision rule.
6. Будущее exact/numeric решение требует полного owner/approver set, нового versioned decision record и immutable evidence references.

### 3.2. Pre-registration и freeze boundary

До доступа к untouched final outcomes versioned pre-registration обязана зафиксировать как evidence categories:

1. comparison question, intended claim и affected policy/version bundle;
2. eligible population, evaluation unit, connected-component universe и split identities;
3. metric family и proposed exact definition, direction, numerator, denominator, aggregation, missing/undefined treatment и units;
4. candidate threshold set/search space и reference/baseline identity;
5. planned comparison family, applicable segments/intersections и all planned primary/secondary comparisons;
6. proposed uncertainty/statistical paradigm, exact procedure and assumptions;
7. proposed multiplicity, repeated-look/sequential, stopping, rerun and deviation treatment;
8. proposed interpretation/decision mapping, limitations and failure/insufficiency conditions;
9. dataset, manifest, label/adjudication/grouping/correction policy, code/configuration and seed/deterministic-mode versions/hashes;
10. immutable pre-registration identifier, timestamp and approver evidence.

Этот перечень утверждает только обязательные evidence categories. Он не утверждает значения, field names, physical schema, statistical method, runtime/API/DB/event carrier или policy threshold.

Запрещено после просмотра final outcomes без нового versioned cycle:

- добавлять или удалять candidate thresholds, hypotheses, metrics, segments или comparisons ради более удобного результата;
- менять numerator, denominator, aggregation, missing-data treatment, direction, method, assumptions или decision mapping;
- скрывать planned comparison, adverse/null/insufficient result или protocol deviation;
- выбирать только лучший run, seed, split, method или reporting slice;
- продолжать, останавливать или повторять final analysis по незаявленному result-dependent rule.

### 3.3. Tuning/final separation и совместимость сравнений

1. Candidate threshold ищется только на tuning evidence по заранее зафиксированной procedure/version.
2. Untouched final evidence не используется для выбора, пересмотра или ослабления того же threshold.
3. Connected component не может пересекать tuning/final или другие сравниваемые splits; `XFR-D-059 v1.1` остаётся обязательным.
4. Прямое сравнение допустимо только при доказуемо совместимых evaluation unit, eligibility/adjudication/grouping/correction policies, schema/policy version bundle, metric definition и dataset/run lineage.
5. Incompatible runs не сводятся в единый delta, winner или pass/fail; incompatibility показывается явно.
6. Post-freeze correction или newly discovered grouping/source-history fact не переписывает historical evidence; применяется `XFR-D-071` и новый versioned cycle.
7. Final evidence, затронутое leakage, post-selection, unregistered repeated looks, incompatible versions или неполным manifest, не становится условно valid: claim блокируется fail closed.

### 3.4. Statistical result не равен governance verdict

1. Statistical signal не является автоматически practical/product significance, legal/fairness determination, causal finding, production readiness, policy approval, release approval или gate transition.
2. Отсутствие обнаруженного difference не доказывает equivalence, non-inferiority, no harm, fairness, no drift или достаточность данных.
3. Point estimate, interval, probability или test result не создаёт pass/fail без заранее approved exact interpretation rule.
4. Хороший aggregate result не компенсирует adverse, unevaluable, missing или insufficient evidence по отдельной metric family, segment, intersection или safety boundary.
5. Результаты нескольких comparisons не могут скрыто объединяться, selectively reported или трактоваться без approved multiplicity/aggregation procedure.
6. `unknown` и `abstention` остаются раздельными qualitative concepts по `XFR-D-069`; operational/process failure не является statistical outcome, negative label или legitimate abstention.
7. Synthetic-only evidence не создаёт production threshold, production statistical claim или production-readiness evidence.
8. Никакой result не изменяет Hard Constraint, scoring/risk/qualification policy, model, routing, release или runtime автоматически.

### 3.5. Exact/numeric contents remain open

Этот record не выбирает и не подразумевает default для:

- null/alternative hypotheses, one-/two-sided direction или comparison unit;
- frequentist, Bayesian, resampling, permutation или иной statistical paradigm;
- exact test, estimator, interval или model;
- significance, confidence/credible, power, effect-size, precision or minimum-detectable-effect values;
- sample-size calculation, minimum count, allocation ratio или statistical small-cell sufficiency;
- multiple-comparison, family-wise, false-discovery or hierarchical procedure;
- sequential/repeated-look, stopping, early-termination or rerun rule;
- equivalence/non-inferiority margins или superiority rule;
- missing, censored, delayed, disputed, inconclusive or corrected outcome treatment;
- segment/intersection aggregation, weighting, pooling or shrinkage;
- candidate threshold search space, generation/optimization algorithm or selection criterion;
- metric-specific pass/fail mapping, remediation trigger or production applicability.

Conventional practice, library default, current baseline, pilot cap `100 Campaign`, Campaign→Qualified `40%/25%`, synthetic fixture, current model output или значение соседней metric не являются surrogate/default.

### 3.6. Minimum evidence categories before future approval

Будущее exact/numeric approval требует versioned evidence package, включающего как минимум:

1. immutable pre-registration из §3.2 до доступа к final outcomes;
2. label eligibility/adjudication/grouping/correction evidence `XFR-D-057`–`XFR-D-060`;
3. approved applicable numeric dataset/allocation sufficiency поверх qualitative `XFR-D-062`, frozen manifest и complete lineage;
4. exact metric/target proposal and evidence under applicable `XFR-D-061`/`XFR-D-063` boundaries;
5. segment coverage and applicable fairness/proxy/legal evidence `XFR-D-064`/`XFR-D-068`;
6. separate tuning evidence and untouched final evidence;
7. full results for every pre-registered comparison, including adverse, null, incompatible, unevaluable and insufficient outcomes;
8. uncertainty, assumptions, diagnostics, multiplicity and deviation reporting under the proposed exact procedure;
9. counter-evidence across false exclusion/eligibility, ranking/calibration, safety and relevant segment/intersection outcomes without compensation;
10. reproducible code/configuration/tool versions, seeds where applicable, result hashes and independent verification;
11. explicit synthetic-only versus production-data applicability and data-authority/privacy limitations;
12. immutable reviewer/approval references for the full owner/approver set and affected policy/version/hash.

Эти categories не утверждают exact metric/statistical contents, dataset, procedure schema, policy value, runtime carrier или implementation. Если dependency или required category отсутствует, approval блокируется fail closed.

### 3.7. Independent decisions не подменяются

`XFR-D-070` не определяет и не изменяет:

- label eligibility, adjudication, grouping или correction-history policy (`XFR-D-057`–`XFR-D-060`);
- false-exclusion maximum или its exact metric (`XFR-D-061`);
- dataset size/ratios/allocation algorithm/seed policy (`XFR-D-062`);
- numeric metric targets, `K`, calibration/diversification definitions (`XFR-D-063`);
- segment universe, protected/proxy classification, lawful basis или numeric coverage (`XFR-D-064`);
- drift taxonomy, monitoring thresholds, alerts/actions или operational artifact (`XFR-D-065`);
- Evaluation Plan approval, approval record или Controlled Artifact Manifest entry (`XFR-D-066`);
- named Data Governance appointment/RBAC или production-data authority (`XFR-D-067`);
- fairness doctrine, protected/proxy legality, causal/remediation standard or legal verdict (`XFR-D-068`);
- runtime triggers/representation/routing for `unknown`/`abstention` (`XFR-D-069`);
- post-freeze correction synchronization (`XFR-D-071`);
- Scoring/Risk/Qualification Policy value, model/policy release, runtime/API/DB/schema/event carrier, monitoring, rollback or implementation.

### 3.8. Partial, never fully resolved

`XFR-D-070` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, pre-registration categories, tuning/final separation, comparison compatibility, full-reporting/non-compensation and no-automatic-action qualitative boundaries разрешены.

Все exact/numeric statistical contents из §3.5, фактический dataset/manifest/run/evidence, policy values, production applicability, runtime carrier и implementation остаются `OPEN`.

Будущее решение требует нового versioned `XFR-D-070` record с `supersedes` на эту версию. Open contents не могут появиться через silent edit, Evaluation Plan sync, library default, implementation configuration или post-hoc analyst choice.

## 4. Layer/boundary

| Слой | Что регулирует | Authority | Статус после этого record |
|---|---|---|---|
| Platform evaluation/release sequence | Frozen sample, offline evaluation, Chief review, PRODUCT/LEGAL agreement, controlled release | Architecture §30.3 (`SOURCE_NORMATIVE`) | Не изменён |
| Baseline-first discipline | Named metric families measured as baseline before approved thresholds | Architecture §34.1/§34.2 (`SOURCE_NORMATIVE`) | Не изменена |
| Governance owner/approvers | Кто владеет и согласует future statistical procedure | `AI + DEVELOPMENT`; `Chief AI Architect + PRODUCT + LEGAL` | Разрешено этим record |
| Qualitative comparison evidence | Pre-registration, tuning/final separation, compatibility, full reporting, non-compensation | Этот record + Evaluation Plan §9 | Разрешено без method/value |
| Exact/numeric statistical procedure | Hypotheses, methods, values, multiplicity, stopping, interpretation | Будущий полный owner/approver decision after evidence | `OPEN` |
| Adjacent metrics/data/fairness/drift/corrections | Independent source/decision boundaries | `XFR-D-057`–`XFR-D-069`, `XFR-D-071` | Не изменены |
| Runtime/implementation/release | Carrier, enforcement, monitoring, rollback | Separate downstream artifacts/gates | `OPEN` |

## 5. Что остаётся `OPEN`

- all hypotheses, statistical paradigms, tests, estimators, models and intervals;
- all numeric significance/confidence/power/effect-size/precision/sample-size/margin values;
- multiple-comparison, sequential/stopping, resampling and deviation procedures;
- exact metric definitions, denominators, aggregation, missing/delayed/corrected-data treatment;
- candidate threshold search space, generation/optimization and selection rule;
- exact segment/intersection analysis, pooling/weighting and statistical sufficiency;
- actual dataset, manifest, pre-registration, run, results and evidence package;
- exact/numeric dependencies `XFR-D-061`–`XFR-D-065`, `XFR-D-068` and `XFR-D-071` where applicable;
- Evaluation Plan actual approval/manifest entry, production-data/privacy/legal authority and named appointments/RBAC;
- Scoring/Risk/Qualification Policy values, runtime/API/DB/schema/event carrier, implementation, monitoring and rollback;
- model/policy release and all governance-gate approvals.

## 6. Rationale

Evaluation Plan уже требует tuning/final separation, но без approved statistical procedure даже корректно разделённые данные допускают post-hoc выбор hypotheses, methods, segments, stopping rules и reporting slices. Pre-registration and complete reporting prevent cherry-picking without pretending that one universal method or conventional numeric default fits every metric and decision.

Owner assignment preserves Architecture ownership of Evaluation Plan while mandatory cross-functional approval separates evidence production from architecture, product and legal determinations. Compatibility and non-conflation boundaries ensure that a statistical result remains evidence for a named claim, not an automatic policy, fairness, causal, release or gate verdict.

## 7. Adversarial cases

1. **Используют library default.** Запрещено: statistical method и every numeric value remain `OPEN` until approved.
2. **Выбирают лучший threshold на final split.** Final evidence invalid for that claim; требуется новый untouched final cycle.
3. **Пробуют много methods и показывают один.** Запрещено как unregistered multiplicity/selective reporting.
4. **Останавливают final analysis при удобном result.** Запрещено без pre-registered approved sequential/stopping rule.
5. **После result меняют denominator или segment list.** Требуется новый versioned cycle; historical evidence не переписывается.
6. **Сравнивают runs с несовместимыми policy versions.** Direct delta/winner/pass claim запрещён; incompatibility reported explicitly.
7. **No detected difference называют equivalence/no harm.** Запрещено без separately approved exact hypothesis, margin and procedure.
8. **Statistical signal объявляют legal discrimination или fairness approval.** Запрещено: `XFR-D-068` and LEGAL/PRODUCT determination remain independent.
9. **Aggregate success скрывает adverse segment result.** Запрещено: no compensation; segment/intersection evidence reported separately.
10. **Process failure учитывают как negative outcome или abstention.** Запрещено: operational failure, `unknown`, `abstention` and labels remain distinct.
11. **Synthetic-only result задаёт production threshold.** Запрещено: no production applicability/readiness claim.
12. **Успешный comparison автоматически меняет policy/model/runtime.** Запрещено: separate approval and controlled release required; gates remain blocked.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §9, §11 decision №16, applicable evidence references and readiness summary receive the qualitative governance/pre-registration boundary without exact/numeric method;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay for `XFR-D-070`;
- future exact/numeric `XFR-D-070`, statistical procedure, affected policy artifacts and runtime artifacts — separate downstream passes.

No future sync may interpret this record as an approved statistical method/value, threshold, metric, dataset/run, Evaluation Plan, production evidence, policy release, runtime design or implementation authorization.

## 9. Change control

Changing governance owner, mandatory approvers, pre-registration categories, tuning/final separation, compatibility, full-reporting/non-compensation or no-automatic-action boundaries requires a new versioned `XFR-D-070` record approved by `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`, with a `supersedes` reference to this version.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` and `PRODUCTION_LAUNCH_GATE` remain `BLOCKED`.

## 11. Acceptance criteria

1. **Given** this record, **when** exact test, paradigm, numeric significance/confidence/power/effect-size/sample-size value or multiple-comparison method is requested, **then** none is approved and `XFR-D-070` remains `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** a future procedure, **when** authority is checked, **then** governance owner is `AI + DEVELOPMENT`, mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`, and evidence preparation does not replace approval.
3. **Given** untouched final outcomes, **when** a comparison begins, **then** the categories in §3.2 were immutably pre-registered before access; otherwise the claim is blocked fail closed.
4. **Given** a candidate threshold, **when** search and final evaluation are checked, **then** tuning and final evidence are component-isolated and the same final evidence did not choose the threshold.
5. **Given** two runs, **when** direct comparison is proposed, **then** unit, eligibility, grouping, correction, schema/policy/metric versions and lineage are compatible or incompatibility is reported without delta/winner/pass claim.
6. **Given** multiple planned comparisons or segments, **when** reporting is reviewed, **then** adverse/null/incompatible/unevaluable/insufficient outcomes and deviations are not omitted or compensated by aggregate success.
7. **Given** no detected difference, **when** equivalence/no-harm/fairness/no-drift is claimed, **then** the claim is rejected without separately approved exact procedure and relevant independent governance decision.
8. **Given** statistical evidence, **when** legal/fairness/causal/production/release/gate meaning is requested, **then** no automatic interpretation or approval is created.
9. **Given** library/conventional defaults, pilot cap `100 Campaign`, Campaign→Qualified `40%/25%`, baseline, synthetic fixture or adjacent metric, **when** a statistical value/method is chosen, **then** no item is accepted as surrogate/default.
10. **Given** post-freeze correction or source-history change, **when** historical evidence exists, **then** it is not rewritten and `XFR-D-071`/new versioned cycle remains required.
11. **Given** synthetic-only evidence, **when** production applicability/readiness is claimed, **then** the claim is prohibited.
12. **Given** this record, **when** Evaluation Plan, dataset/run, production data, Scoring/Risk/Qualification Policy, runtime, implementation and gates are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 12. Итог

`XFR-D-070 GOVERNANCE-OWNER, PRE-REGISTRATION, TUNING/FINAL SEPARATION AND QUALITATIVE STATISTICAL-EVIDENCE BOUNDARY APPROVED — ALL EXACT/NUMERIC STATISTICS, DATASET, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
