# LeaseMind Matching Decision Record — XFR-D-068

**Decision ID:** `XFR-D-068`

**Название:** Fairness diagnostic and legal-standard governance owner, non-conflation and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-08-29

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER, NON-CONFLATION AND EVIDENCE-PREREQUISITE BOUNDARY — EXACT FAIRNESS STANDARD, METRICS, THRESHOLDS AND LEGAL DETERMINATIONS REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-29 working session

**Repository baseline:** `7e3540b07ef1a92b78402e240d2dd8f28f79ffff`

**Scope:** governance ownership and qualitative evidence boundary for a future fairness diagnostic framework and legal fairness standard under `MATCHING_EVALUATION_PLAN`; does not select a fairness doctrine, protected/proxy taxonomy, lawful basis, segment universe, comparator/reference group, outcome, metric family, numerator/denominator, threshold/tolerance, aggregation/weighting, uncertainty/statistical method, dataset, evaluation run, production-data use, runtime representation, model/policy change, implementation or Evaluation Plan approval.

**Governance owner:** `LEGAL + PRODUCT` — human-approved assignment aligned with `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §6.8 and §11 row №14. Architecture requires the discrimination/proxy check but does not directly assign owner of the exact fairness standard.

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`.

**Evidence-procedure owner:** `AI + DEVELOPMENT` under `MATCHING_EVALUATION_PLAN`; this role prepares reproducible diagnostic evidence and does not replace governance approval by the full owner/approver set.

**Depends on:** label eligibility `XFR-D-057 v1.0`, adjudication `XFR-D-058 v1.1`, grouping/isolation `XFR-D-059 v1.1`, correction-history exclusion `XFR-D-060 v1.0`, false-exclusion boundary `XFR-D-061 v1.0`, dataset allocation `XFR-D-062 v1.0`, metric-target boundary `XFR-D-063 v1.0`, segment-coverage boundary `XFR-D-064 v1.0`, drift-monitoring boundary `XFR-D-065 v1.0`, Evaluation Plan approval procedure `XFR-D-066 v1.0`, Data Governance authority model `XFR-D-067 v1.0`, qualitative terminology `XFR-D-069 v1.0`, threshold-search statistics `XFR-D-070`, re-identification `XFR-D-M3`, Risk Policy §13 open decision №9 and Feature Schema open decisions №9/№17 remain independently applicable. None is substituted or fully resolved by this record.

---

## 1. Вопрос

Кто владеет будущим утверждением fairness diagnostic framework и юридического fairness standard для Matching evaluation, и какие qualitative safeguards обязательны до выбора exact protected/proxy classification, metric, comparator, threshold и statistical procedure?

## 2. Source/status discipline

Architecture §30.3 п.4 `SOURCE_NORMATIVE` требует «проверку дискриминационных признаков и прокси» до любого platform-level изменения. Это утверждает обязательность проверки, но не выбирает legal fairness standard, protected/proxy taxonomy, diagnostic metric, threshold, comparator или owner точного решения.

Architecture §17 отдельно запрещает Risk Score использовать protected attributes или proxies. Этот запрет не превращается в общий diagnostic-use permission или prohibition: использование любого sensitive dimension только для fairness diagnostic требует отдельного purpose/lawful-basis/data-governance решения и не делает его допустимым model/scoring/routing input. Lawful basis не отменяет §17 ban для Risk Score.

Architecture §8.4 требует irreversible de-identification, исключение малых групп с re-identification risk, проверку protected attributes/proxies и разрешение Data Governance перед segment analytics/training. Privacy small-cell protection остаётся отдельной от statistical sufficiency и fairness inference.

Evaluation Plan §6.8 прямо запрещает inference, что diagnostic устанавливает или заменяет legal fairness standard, и предлагает `LEGAL + PRODUCT` для legal standard и `AI` для diagnostic procedure как `DECISION_CANDIDATE_FOR_REVIEW`. §11 row №14 сохраняет fairness diagnostic framework/legal standard открытым. Risk Policy §13 open decision №9 сохраняет protected/proxy classification catalog и lawful basis per допустимому non-protected feature под candidate owner `LEGAL + PRODUCT`; Feature Schema №9/№17 сохраняют business-stage fit-vs-proxy legality и final LEGAL verdict для 20 candidates открытыми.

Этот record human-approved разрешает только governance-owner, evidence-procedure, non-conflation и fail-closed qualitative boundary. Exact legal standard и всё metric/statistical содержание остаются `OPEN`.

## 3. Решение

### 3.1. Governance owner и approval-разделение

1. Governance owner будущего fairness diagnostic framework и legal fairness standard — `LEGAL + PRODUCT`.
2. Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.
3. Evidence-procedure owner — `AI + DEVELOPMENT` под Evaluation Plan.
4. `LEGAL` владеет правовой допустимостью, protected/proxy/lawful-basis и rights-impact determination; `PRODUCT` — meaning of outcomes, affected population, product harm и policy applicability.
5. `AI + DEVELOPMENT` готовят metric/statistical/reproducibility evidence, но не утверждают legal standard единолично. Chief AI Architect проверяет architecture/non-conflation boundary и также не является unilateral approver.
6. Финальное exact решение требует нового versioned decision record, полного owner/approver set и immutable evidence references.

### 3.2. Diagnostic не равен legal verdict

1. Наблюдаемое различие между группами — diagnostic signal, а не автоматическое доказательство discrimination, lawfulness, unlawfulness, causation или приемлемости.
2. Отсутствие статистически заметного различия не доказывает fairness, lawful basis, отсутствие proxy или production readiness.
3. Отсутствие/недоступность protected or segment labels не является доказательством fairness и не разрешает «fairness through unawareness» claim.
4. Хороший aggregate outcome не компенсирует adverse или insufficient evidence по конкретному segment/intersection; affected groups отображаются раздельно.
5. Diagnostic не разрешает protected/proxy feature для scoring, ranking, Risk, Qualification, routing, targeting или production use.
6. Legal/product determination не выбирается AI output, heuristic, CI result, conventional framework или implementation default.

### 3.3. Protected/proxy и diagnostic-use boundary

1. Protected/proxy classification catalog и lawful basis остаются `OPEN` под Risk Policy §13 decision №9 и Feature Schema №9/№17.
2. Confirmed protected/proxy attribute не используется Risk Score согласно Architecture §17; этот record не создаёт waiver, tolerance или exception.
3. Возможное diagnostic-only использование sensitive dimension требует отдельного purpose-specific `LEGAL`, `PRODUCT` и Data Governance authority evidence, privacy/re-identification controls и exact scope. Оно не переносится автоматически в model input или runtime decision.
4. AI/heuristic/proxy inference не заполняет отсутствующий protected/segment status и не создаёт conventional classification catalog.
5. Missing/unclassified значение сохраняет `XFR-D-064` boundary: не coerced в negative/pass/majority, не молча исключяется и не превращается в новый runtime enum.
6. Pseudonymized/tokenized/hash data не считается irreversibly anonymized и не допускается к segment analytics/training под видом обезличенного.

### 3.4. Exact contents remain open

Этот record не выбирает:

- legal fairness doctrine, protected class или rights-impact taxonomy;
- affected population, unit of analysis, segment universe или intersections;
- outcome/decision point, comparator/reference group или counterfactual;
- metric family, numerator, denominator, counting unit или handling of missing values;
- numeric threshold, ratio, tolerance, minimum effect, practical-significance boundary или severity scale;
- aggregation, weighting, multiple-comparison correction или cross-segment compensation;
- confidence interval, uncertainty method, sample-size rule, statistical test или decision procedure;
- causal method, confounder treatment, error-rate decomposition или remediation trigger;
- sampling, stratification, balancing, suppression/generalization или retention rule;
- dataset, manifest, evaluation run, production-data applicability или monitoring/SLO policy.

Ни conventional `80%`/four-fifths rule, parity ratio, zero-gap target, equalized-odds/equal-opportunity threshold, pilot cap `100 Campaign`, Campaign→Qualified `40%/25%`, ни другое внешнее/common значение не становится default или surrogate.

### 3.5. Minimum evidence categories before future approval

До будущего exact fairness approval требуется versioned evidence package как минимум со следующими категориями, без утверждения их точного содержания этим record:

1. exact purpose, decision point, affected population и proposed standard scope;
2. protected/proxy classification and lawful-basis evidence per considered dimension/use;
3. Data Governance authority evidence, named appointment/RBAC и irreversible-de-identification/re-identification controls where real data apply;
4. label eligibility/adjudication/grouping/correction-history evidence `XFR-D-057`–`XFR-D-060`;
5. dataset allocation, segment coverage and unknown/unclassified reporting under `XFR-D-062`/`XFR-D-064`;
6. proposed outcomes, comparators, metric definitions, numerator/denominator/counting unit and missing-data treatment;
7. proposed uncertainty/statistical procedure and multiple-comparison handling under `XFR-D-070`;
8. separate false-exclusion, metric-target and relevant error counter-evidence under `XFR-D-061`/`XFR-D-063`, without cross-metric compensation;
9. tuning versus untouched final evidence separation and immutable dataset/manifest/run lineage;
10. explicit segment/intersection results, adverse evidence and limitations, not aggregate-only reporting;
11. synthetic-only versus production-data applicability statement; synthetic-only evidence creates no production/legal-fairness claim;
12. proposed remediation/governance response boundaries without automatic model/policy/runtime action;
13. immutable candidate standard version/hash, rationale and evidence references for the full owner/approver set.

Missing classification, lawful basis, coverage, statistical or authority evidence blocks approval fail closed. Evidence-package completeness does not itself approve the standard.

### 3.6. Independence from adjacent decisions

`XFR-D-068` does not replace or merge with:

1. `XFR-D-064` dataset segment-coverage sufficiency — coverage is prerequisite evidence, not fairness standard;
2. `XFR-D-M3` re-identification method/threshold — privacy risk, not statistical fairness sufficiency;
3. Risk Policy §13 №9 / Feature Schema №9/№17 — protected/proxy classification, lawful basis and candidate legality remain independent;
4. `XFR-D-061` false-exclusion maximum — a Hard-Filter-specific metric, not the whole fairness framework;
5. `XFR-D-063` numeric ranking/calibration/diversification targets — quality targets do not establish legal fairness;
6. `XFR-D-070` threshold-search statistical comparison — statistical procedure does not choose legal standard;
7. `XFR-D-018` Scoring segment-override evidence or `XFR-D-021` ranking/diversification algorithm — runtime product behavior is independently governed;
8. `XFR-D-065` drift monitoring — production monitoring does not approve fairness standard or production use;
9. `XFR-D-067` authority model — it does not provide named appointment/RBAC or replace `LEGAL + PRODUCT` fairness approval;
10. `XFR-D-066` Evaluation Plan approval procedure — approving a Plan artifact would not approve the contained fairness standard automatically.

### 3.7. Partial, never fully resolved

`XFR-D-068` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, diagnostic-vs-legal non-conflation, protected/proxy diagnostic-use boundary, non-compensation and minimum evidence categories are approved.

Exact fairness standard, classification, lawful basis, metrics, comparators, numeric/statistical contents, dataset/run and remediation policy require a new versioned `XFR-D-068` record with `supersedes`. They cannot be introduced by Evaluation Plan sync, implementation default, conventional rule or silent edit.

## 4. Layer/boundary

| Layer | Authority | Resolved by this record | Remains open |
|---|---|---|---|
| Discrimination/proxy check existence | Architecture §30.3 п.4 | Unchanged, mandatory | Exact framework/standard |
| Risk protected/proxy ban | Architecture §17 | Unchanged, no waiver | Classification catalog and lawful-basis evidence |
| Privacy/segment-data eligibility | Architecture §§8.4/30.2; `XFR-D-067` | Non-conflation with fairness evidence | Named appointment/RBAC, exact data approvals |
| Fairness governance | `LEGAL + PRODUCT` | Governance owner | Actual exact standard approval |
| Architecture/technical approvers | `Chief AI Architect + AI + DEVELOPMENT` | Mandatory approver roles | Actual signed decisions/evidence |
| Diagnostic evidence procedure | `AI + DEVELOPMENT` | Evidence-procedure role, not unilateral approval | Exact metrics/statistics/run |
| Qualitative interpretation | This record | Signal ≠ legal verdict; absence ≠ fairness; aggregate non-compensation | Numeric/pass-fail decision boundary |
| Runtime/release | Separate controlled artifacts/gates | No automatic effect | Model/policy/runtime/monitoring/implementation |

## 5. Что остаётся `OPEN`

- exact legal fairness standard/doctrine and rights-impact taxonomy;
- protected/proxy classification catalog and lawful basis per use;
- affected population, unit, segment universe/intersections, outcomes and comparators;
- metric families, numerator/denominator/counting unit and missing-data treatment;
- every numeric ratio/threshold/tolerance/effect-size/severity value;
- uncertainty, confidence, multiple-comparison and statistical decision procedure (`XFR-D-070`);
- causal/confounder method and remediation criteria;
- dataset/manifest/run, actual evidence package and production-data authority;
- Data Governance named appointment/RBAC, privacy/re-identification controls and real-data use;
- Evaluation Plan actual approval/manifest entry, operational monitoring, runtime/API/DB/schema/event carrier and implementation;
- exact/numeric portions of `XFR-D-061`–`XFR-D-065` and all applicable `XFR-D-069`–`XFR-D-071` dependencies.

## 6. Rationale

Architecture mandates discrimination/proxy review but intentionally leaves the legal standard and measurement design unstated. Approving a conventional metric or numeric threshold without classification, lawful basis, segment coverage and statistical evidence would silently create legal/product policy. Assigning `LEGAL + PRODUCT` as governance owner and `AI + DEVELOPMENT` as evidence-procedure owner preserves authority separation while making the next evidence package reviewable.

The non-conflation boundary prevents three unsafe shortcuts: treating a diagnostic disparity as an automatic legal verdict, treating missing sensitive data as proof of fairness, and treating aggregate success as compensation for a harmed or unevaluable segment.

## 7. Adversarial cases

1. **No protected labels, therefore fair.** Rejected: missing/unavailable labels create insufficient evidence, not a fairness claim.
2. **Observed disparity proves unlawful discrimination.** Rejected: diagnostic signal requires approved legal/product interpretation; causation and legal verdict are not automatic.
3. **No significant disparity proves production readiness.** Rejected: absence of detected effect does not prove fairness, lawful basis or gate readiness.
4. **Conventional 80% rule becomes default.** Rejected: no external/common threshold is approved by this record.
5. **Aggregate passes while one segment/intersection fails or is unevaluable.** Rejected: non-compensation and explicit limitations apply.
6. **AI imputes protected status from geography/name/behavior.** Rejected: no heuristic/proxy classification or missing-value fill is authorized.
7. **Lawful basis allows protected proxy in Risk Score.** Rejected: Architecture §17 ban remains inviolable.
8. **Sensitive field is used diagnostically and then reused as model input.** Rejected: diagnostic-only purpose does not transfer authority to scoring/routing/training/runtime use.
9. **Pseudonymized data are treated as anonymized.** Rejected under Architecture §8.4.
10. **Synthetic fairness evidence becomes production/legal claim.** Rejected: synthetic-only evidence cannot establish production fairness or production readiness.
11. **Fairness evidence auto-adjusts weights, Hard Constraints, routing or release.** Rejected: Architecture §30.3 automatic-change prohibitions and separate controlled release remain.
12. **Evaluation Plan approval approves fairness standard.** Rejected: `XFR-D-066` artifact procedure and this substantive decision remain independent.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §6.8, §11 row №14 and final readiness summary may later reflect only this partial governance/evidence boundary;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — future status overlay for unchanged `EP-14 → XFR-D-068`;
- Risk Policy, Feature Schema, Scoring Policy, Controlled Artifact Manifest and runtime artifacts are not changed by this record or its status sync.

## 9. Change control

Changing governance owner, mandatory approvers, evidence-procedure role, diagnostic-vs-legal boundary, protected/proxy diagnostic-use boundary or non-compensation requires a new versioned record approved by `Chief AI Architect + LEGAL + PRODUCT + AI + DEVELOPMENT` with `supersedes` reference.

Exact classifications, lawful basis, metric/statistical contents, numeric standard and remediation policy require a separately reviewed versioned `XFR-D-068`; they are not added as silent amendments to v1.0.

## 10. Gate impact

`NONE`. This record does not approve the Evaluation Plan, dataset, evaluation run, production-data use, fairness standard contents, model/policy change, runtime or implementation.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** this record, **when** authority is checked, **then** governance owner is `LEGAL + PRODUCT`, mandatory approvers are `Chief AI Architect + AI + DEVELOPMENT`, and `AI + DEVELOPMENT` evidence preparation is not unilateral approval.
2. **Given** an observed group difference, **when** a conclusion is produced, **then** it remains a diagnostic signal and does not automatically establish discrimination, lawfulness, unlawfulness or causation.
3. **Given** no detected difference or missing protected/segment labels, **when** fairness is assessed, **then** neither condition proves fairness or readiness.
4. **Given** a segment/intersection with adverse or insufficient evidence, **when** aggregate evidence is favorable, **then** aggregate cannot compensate or hide it.
5. **Given** a confirmed protected/proxy attribute, **when** Risk Score use is proposed, **then** Architecture §17 prohibition has no waiver.
6. **Given** diagnostic-only sensitive-dimension use, **when** authority is checked, **then** purpose-specific legal/product/Data Governance/privacy evidence is required and no model/runtime-use authority transfers.
7. **Given** an absent classification, **when** AI/heuristic/proxy inference is proposed, **then** it is prohibited and no conventional taxonomy is created.
8. **Given** a numeric threshold/metric/comparator/statistical method, **when** this record is cited, **then** no value or method is approved; `XFR-D-068` remains `PARTIALLY_RESOLVED_BOUNDARY`.
9. **Given** `XFR-D-064`, `XFR-D-M3`, Risk Policy №9, Feature Schema №9/№17, `XFR-D-061`, `XFR-D-063`, `XFR-D-070`, `XFR-D-018`, `XFR-D-021`, `XFR-D-065`, `XFR-D-067` or `XFR-D-066`, **when** dependency status is checked, **then** none is substituted or newly resolved by this record.
10. **Given** synthetic-only evidence, **when** a production/legal-fairness/readiness claim is requested, **then** the claim is prohibited.
11. **Given** fairness evidence, **when** automatic weight/Hard-Constraint/routing/release/runtime change is proposed, **then** it remains prohibited and separately governed.
12. **Given** this record, **when** Evaluation Plan, dataset/run, production data, runtime, implementation and gates are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 12. Итог

`XFR-D-068 GOVERNANCE-OWNER, NON-CONFLATION AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — EXACT FAIRNESS STANDARD, CLASSIFICATION, METRICS, THRESHOLDS, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
