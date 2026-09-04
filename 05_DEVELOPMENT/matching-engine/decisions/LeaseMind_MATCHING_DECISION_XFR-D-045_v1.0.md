# LeaseMind Matching Decision Record — XFR-D-045

**Decision ID:** `XFR-D-045`

**Название:** Evaluation evidence governance and prerequisite boundary for Qualification Gate thresholds

**Версия:** 1.0

**Дата решения:** 2026-09-04

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER AND EVIDENCE-PREREQUISITE BOUNDARY FOR FUTURE QUALIFICATION-THRESHOLD EVALUATION EVIDENCE — XFR-F1 METRIC-FAMILY GAP, EXACT DEFINITIONS, DATASET, EVALUATION RUN, EVIDENCE PACKAGE, PRODUCTION APPLICABILITY, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** explicit human project-governance confirmation on 2026-09-04.

**Repository baseline:** `23a932f8115364384b3be980c152274658c40c0b`

**Scope:** governance ownership and qualitative evidence-prerequisite boundary for a future, separately approved evaluation evidence package/procedure supporting Matching Qualification Gate numeric thresholds (mutual-fit, Confidence routing cutoff, completeness) only. Does not create or approve the `XFR-F1` metric family, any metric definition/formula/numerator/denominator/counting unit, baseline, target, threshold, tolerance, sample size, split ratio, confidence interval, window, statistical test, uncertainty method, dataset, evaluation run, evidence package content/results/verdict, production-data applicability, policy/manifest approval, or runtime/API/DB/schema/event/implementation content.

**Canonical identity:** `MQP-19 → XFR-D-045`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.4, row `MQP-19`). This record does not change this mapping or any Inventory count (102 source keys / 90 canonical IDs).

**Governance owner (для future Qualification-threshold evidence package):** `Chief AI Architect + AI` — human-approved decision-specific assignment, consistent with the owner pattern already applied to the adjacent Hard-Filter false-exclusion (`XFR-D-061 v1.0`) and ranking/calibration metric-target (`XFR-D-063 v1.0`) boundaries. Neither Architecture nor the Qualification Policy source row assigns this exact owner directly.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT` под `MATCHING_EVALUATION_PLAN`; эта роль готовит/проверяет evidence и candidate technical procedure, но не получает unilateral authority утвердить metric family, evidence package, threshold или production applicability.

**Depends on:** `XFR-D-057 v1.0`, `XFR-D-058 v1.1`, `XFR-D-059 v1.1`, `XFR-D-060 v1.0` and `XFR-D-062 v1.0`–`XFR-D-071 v1.0` (Evaluation cluster) remain independently applicable qualitative prerequisites wherever a future Qualification-threshold evidence package relies on label eligibility, adjudication, grouping/isolation, correction-history exclusion, dataset allocation, segment coverage, drift-monitoring artifact separation, Evaluation Plan approval procedure, Data Governance authority, fairness/legal boundary, `unknown`/`abstention` terminology, threshold-search statistical comparison, or post-freeze correction synchronization; none is reopened, absorbed or fully resolved here. `XFR-D-061 v1.0` (Hard-Filter false-exclusion, Eligibility Filter stage 3) and `XFR-D-063 v1.0` (`Precision@K`/`Recall@K`/`NDCG@K`/Confidence Score calibration/diversification) remain independent and explicitly out of Qualification Gate scope. `MQP-05`/`MQP-06`/`MQP-07` → `XFR-D-034`/`XFR-D-035`/`XFR-D-036` (actual numeric mutual-fit/Confidence/completeness thresholds) remain independent `OPEN` candidate assignments with no owner assigned by this record. `MQP-09`/`XFR-D-M2` (Risk→routing threshold/trigger) remains independently `SOURCE_NORMATIVE`, owner `AI + LEGAL`, Architecture §37 №8, unchanged. `XFR-D-042 v1.0` (segment-specific Qualification policy governance) remains independently `PARTIALLY_RESOLVED_BOUNDARY`, owner `Chief AI Architect + PRODUCT`, and is not merged with this record.

---

## 1. Вопрос

Кто владеет будущим evidence package/procedure, необходимым для approve numeric Matching Qualification Gate thresholds — minimum mutual-fit threshold, Confidence routing cutoff и minimum critical-data completeness threshold/rule (`MQP-05`/`MQP-06`/`MQP-07` → `XFR-D-034`/`XFR-D-035`/`XFR-D-036`) — и какая qualitative governance boundary (evidence categories, non-conflation, non-compensation, fail-closed handling) применяется до этого утверждения, если `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` открытое решение №19 честно признаёт отсутствие отдельной metric family для этих условий, а Evaluation Plan §6.1/§6.2 покрывают только Hard Constraint safety (Eligibility Filter, этап 3) и Ranking/retrieval, не Qualification Gate (этап 8, §18.1)?

## 2. Source/status discipline

1. `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` §15, decision register row 19 (verbatim): «Evaluation metrics/acceptance evidence, необходимые для approve candidate thresholds (mutual-fit/confidence/completeness) | `AI + DEVELOPMENT` — candidate/inherited context (Evaluation Plan owner); Evaluation Plan §6.1/§6.2 покрывает Hard Constraint safety и Ranking, но не отдельную metric family для Gate-специфичных порогов mutual-fit/completeness | Threshold-search evidence completeness». Этот row до данного record'а не имеет human-approved owner/approver split — только candidate/inherited context.
2. `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §4.4 row `MQP-19` устанавливает canonical mapping `MQP-19 → XFR-D-045`, `PRIMARY_STANDALONE`, «Evaluation evidence for Qualification Gate thresholds». Inventory индексирует вопрос и не является источником нового решения.
3. Inventory §7 `XFR-F1` — «Evaluation coverage gap (`MEDIUM`)»: «Evaluation Plan не содержит metric family для: `XFR-D-045` — Qualification Gate thresholds (mutual fit, confidence, completeness); `XFR-D-083` — Safe Presentation combination/quasi-identifier re-identification risk. Оба dependent Proposal честно признают пробел. До Wave 3/4 это остаётся documented gap: нельзя ссылаться на несуществующее Evaluation coverage. Будущая отдельная policy-revision должна добавить placeholder/approved procedure; этот inventory её не создаёт.» Inventory `XFR-C-006` подтверждает то же: «`XFR-D-045` и `XFR-D-083` не считаются покрытыми существующей Evaluation Plan metric family.» Этот record признаёт `XFR-F1` как existing documented gap и governs только будущую evidence procedure/package вокруг него; он не создаёт и не утверждает содержание пропущенной metric family.
4. `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §6.1 (Hard Constraint safety) — evaluation object: решения Eligibility Filter, Architecture §14 этап 3, не Qualification Gate этап 8. `XFR-D-061 v1.0` governs только эту false-exclusion metric.
5. Evaluation Plan §6.2 (Ranking/retrieval) — evaluation object: порядок кандидатов, `Precision@K`/`Recall@K`/`NDCG@K`. `XFR-D-063 v1.0` governs эти targets, Confidence Score calibration target и upper-result diversification, но не Qualification Gate mutual-fit/completeness/routing cutoff напрямую.
6. Evaluation Plan §6.3 (Reciprocal/mutual quality) — `OUT_OF_SCOPE до утверждения Scoring Policy»: measurable mutual-fit object определяется только после того, как `MATCHING_SCORING_POLICY` утвердит конкретный объект (Architecture §37 №2 выбор функции Mutual Aggregate, №3 стартовые веса/сегментные пороги, owner `AI + PRODUCT`, `SOURCE_NORMATIVE` для owner assignment). Qualification mutual-fit threshold evidence зависит от этого отдельно утверждаемого объекта.
7. Evaluation Plan §6.4 (Confidence/Risk calibration) различает: Risk Score human-review thresholds — owner `AI + LEGAL`, Architecture §37 №8, `SOURCE_NORMATIVE`, вне `XFR-D-063`; Confidence Score calibration target — governance owner `Chief AI Architect + AI` по `XFR-D-063 v1.0`. Ни один из них не является Qualification Policy row 6 «Numerical Confidence threshold» (routing cutoff), который у источника остаётся candidate assignment, качественно заданный только §18.1.
8. Qualification Policy §15 rows 5/6/7 (`MQP-05`/`MQP-06`/`MQP-07` → `XFR-D-034`/`XFR-D-035`/`XFR-D-036`) остаются candidate assignments без owner; §18.1 задаёт условия только качественно. Row 8 (Feature Schema `required_evidence_level`, candidate/inherited `PRODUCT + AI + Chief AI Architect`) остаётся отдельным вопросом. Row 9 (`XFR-D-M2`, Risk→routing, `AI + LEGAL`, `SOURCE_NORMATIVE`) остаётся неизменным и независимым.
9. Evaluation cluster (`XFR-D-057 v1.0`, `XFR-D-058 v1.1`, `XFR-D-059 v1.1`, `XFR-D-060 v1.0`, `XFR-D-061 v1.0`–`XFR-D-071 v1.0`) уже устанавливает applicable qualitative prerequisites — label eligibility, adjudication, grouping/isolation, correction-history exclusion, false-exclusion boundary, dataset allocation, metric-target boundary, segment coverage, drift-monitoring separation, Evaluation Plan approval flow, Data Governance authority, fairness/legal boundary, `unknown`/`abstention` terminology, statistical-comparison governance, post-freeze correction synchronization. Ни один record не переоткрывается и не поглощается этим решением.
10. `XFR-D-042 v1.0` (decision date 2026-09-04, тот же день) устанавливает независимую governance boundary для segment-specific Qualification policy content — отдельный вопрос (Qualification Policy row 16) от evidence governance этого record'а (row 19).

Этот record human-approved разрешает только owner/evidence-prerequisite половину открытого решения №19. XFR-F1 metric-family content, exact definitions и всё numeric/dataset/evidence содержание остаются полностью `OPEN`.

## 3. Решение

### 3.1. Governance owner и обязательное approval-разделение

1. Governance owner будущего Qualification-threshold evaluation evidence package/procedure — `Chief AI Architect + AI`.
2. Mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`.
3. Evidence/technical-procedure owner — `AI + DEVELOPMENT` под `MATCHING_EVALUATION_PLAN`; эта роль готовит/проверяет evidence и candidate technical procedure и не получает unilateral approval authority.
4. Ни `Chief AI Architect + AI`, ни evidence/technical-procedure owner не могут утвердить metric family, evidence package, threshold-candidate bundle или production applicability единолично.
5. Финальное решение о фактическом evidence package и о любом кандидатном threshold требует полного owner/approver set, нового versioned decision record и immutable evidence references.
6. Evidence ownership не конфликтует с owners фактических threshold decisions: `MQP-05`/`MQP-06`/`MQP-07` → `XFR-D-034`/`XFR-D-035`/`XFR-D-036` остаются независимыми `OPEN` candidate assignments без owner, назначенного этим record'ом; `MQP-09`/`XFR-D-M2` остаётся независимым `SOURCE_NORMATIVE`, owner `AI + LEGAL`; `XFR-D-042` segment-policy governance остаётся независимым, owner `Chief AI Architect + PRODUCT`.

### 3.2. Признание пробела `XFR-F1` без создания содержания

Этот record явно признаёт `XFR-F1`: Evaluation Plan в текущем виде не содержит Qualification-specific metric family для minimum mutual-fit threshold, Confidence routing cutoff или completeness threshold (§2 п.3). Признание пробела не создаёт и не утверждает эту metric-family content; оно governs только future evidence package/procedure вокруг неё.

### 3.3. Три раздельные evidence-семьи; запрет агрегации и компенсации

Mutual-fit, Confidence cutoff и completeness рассматриваются как три отдельные evidence families. Они никогда не сворачиваются в единый aggregate; успех в одной семье не компенсирует insufficiency или adverse evidence в другой.

### 3.4. Baseline-first, frozen immutable manifest, tuning/final isolation

Сохраняется baseline-first дисциплина (Architecture §34.1/§34.2: сначала baseline, затем approved threshold), immutable frozen manifest и строгая изоляция tuning/final evidence. Baseline измеряется до candidate threshold search; tuning evidence никогда не переиспользуется как final evidence.

### 3.5. Сохранение eligible-labeling/adjudication/grouping/correction и смежных boundaries

Этот record сохраняет без изменения статус и открытое содержание:

- `XFR-D-057 v1.0` (label-evidence eligibility), `XFR-D-058 v1.1` (human adjudication), `XFR-D-059 v1.1` (grouping/isolation), `XFR-D-060 v1.0` (correction-history exclusion);
- `XFR-D-062 v1.0` (dataset allocation/no-reroll/frozen-manifest boundary);
- `XFR-D-063 v1.0` (metric-family separation и target governance для `Precision@K`/`Recall@K`/`NDCG@K`/Confidence Score calibration/diversification);
- `XFR-D-064 v1.0` (segment/intersection coverage);
- `XFR-D-065 v1.0` (monitoring/artifact separation);
- `XFR-D-066 v1.0` (Evaluation Plan approval procedure);
- `XFR-D-067 v1.0` (Data Governance authority);
- `XFR-D-068 v1.0` (fairness/legal diagnostic boundary);
- `XFR-D-069 v1.0` (`unknown`/`abstention` terminology);
- `XFR-D-070 v1.0` (statistical comparison/tuning-final boundary);
- `XFR-D-071 v1.0` (post-freeze correction).

Ни один из перечисленных не поглощается, не переоткрывается и не получает изменённый resolution status этим record'ом; их собственный `OPEN` контент сохраняется полностью.

### 3.6. Полная отчётность, uncertainty, сегментная достаточность, counter-evidence

Будущий evidence package обязан обеспечивать full reporting, uncertainty disclosure, applicable segment/intersection sufficiency и counter-evidence для both false exclusion и false eligibility. Ни aggregate performance, ни другая metric family не компенсирует insufficiency.

### 3.7. Никаких автоматических изменений policy/model/runtime

Evidence является prerequisite only. Ни один evaluation result не изменяет и не утверждает автоматически threshold, ranking, Hard Constraint, routing, policy, model, release или runtime rule и не является threshold approval или production authorization сам по себе.

### 3.8. Fail-closed boundary

Missing, absent, stale, incompatible, ambiguous, conflicting, leakage-contaminated, improperly post-freeze-corrected, incomplete или unauthorized evidence/manifest/baseline/final split не может рассматриваться как zero/clean/pass/sufficient или быть угаданным. Он блокирует затронутую threshold-evidence progression fail closed, без изобретения новой Qualification route, adverse fact, access restriction или unrelated processing block.

### 3.9. Non-conflation зависимых measurable objects

1. Mutual-fit evidence зависит от отдельно утверждённого measurable Scoring/Mutual Aggregate объекта (Architecture §37 №2/№3, `MATCHING_SCORING_POLICY`, owner `AI + PRODUCT`); этот record не создаёт и не утверждает такой объект.
2. Confidence calibration `XFR-D-063 v1.0` является prerequisite input, но не Qualification cutoff: Qualification Policy row 6 (Confidence routing cutoff) остаётся отдельным `OPEN` candidate assignment.
3. Completeness evidence остаётся отдельной от per-feature `required_evidence_level` (Feature Schema, Qualification Policy row 8).
4. `XFR-D-061 v1.0` false-exclusion evidence относится к Eligibility Filter, этап 3, и не может подменять stage-8 mutual-fit/completeness evidence.
5. Risk evidence/`XFR-D-M2` (Architecture §37 №8, `AI + LEGAL`) не может подменять ни одну из трёх Qualification-специфичных evidence families.

### 3.10. Минимальные категории будущего evidence package (только categories, не содержание)

Ни один evidence package в scope этого record'а не может считаться approved без versioned package, включающего как минимум следующие категории:

1. explicit metric-family presence/gap statement для каждого из трёх условий;
2. mutual-fit measurable-object/Scoring dependency status;
3. Confidence calibration dependency/status;
4. Feature Schema `required_evidence_level` dependency/status для completeness;
5. label eligibility, adjudication, grouping/isolation и correction-history provenance;
6. applicable dataset allocation и immutable frozen manifest;
7. versioned baseline, измеренный до candidate search;
8. отдельные tuning и нетронутые final evidence;
9. отдельная отчётность для всех трёх families, uncertainty и non-compensation statement;
10. applicable segment/intersection coverage и fairness/legal review;
11. explicit synthetic-only versus production applicability statement, без разрешения `XFR-D-046`;
12. candidate threshold-bundle rationale, affected policy/version/hash и immutable evidence references;
13. документированный PRODUCT/LEGAL impact review и DEVELOPMENT reproducibility verification.

Этот перечень утверждает только обязательные categories, не их точное содержание, schema, dataset или значения. До разрешения применимых dependencies numeric approval блокируется fail closed.

### 3.11. Partial, never fully resolved

`XFR-D-045` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence/technical-procedure role, признание `XFR-F1`, разделение трёх evidence families, baseline-first/tuning-final дисциплина, non-compensation и minimum evidence categories разрешены. Numeric content, exact metric definitions и фактический evidence package остаются полностью `OPEN`.

## 4. Layer/authority table

| Layer | Authority | Resolved by this record | Remains `OPEN` |
|---|---|---|---|
| `XFR-F1` gap existence | `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §7 | Признано, не создано содержание | Metric-family content |
| Qualification Policy row 19 governance | `AI + DEVELOPMENT` candidate/inherited (source) | `Chief AI Architect + AI` owner; `PRODUCT + LEGAL + DEVELOPMENT` approvers; `AI + DEVELOPMENT` evidence-procedure разрешены этим record | Actual evidence package/procedure |
| Mutual-fit measurable object | `AI + PRODUCT`, Architecture §37 №2/№3, `MATCHING_SCORING_POLICY` | Не изменено; explicit dependency признана | Scoring Mutual Aggregate content |
| Confidence Score calibration target | `Chief AI Architect + AI` (`XFR-D-063 v1.0`) | Не изменено; prerequisite-not-cutoff boundary признана | Exact calibration metric/method/value |
| Confidence routing cutoff (Qualification row 6) | Candidate assignment, source qualitative only | Не изменено | Owner и numeric value |
| Completeness threshold/rule (Qualification row 7) | Candidate assignment, source qualitative only | Не изменено | Owner и exact rule/value |
| Feature Schema `required_evidence_level` | `PRODUCT + AI + Chief AI Architect` (Qualification row 8) | Не изменено; distinctness признана | Exact per-feature values |
| Hard-Filter false exclusion | `Chief AI Architect + AI` (`XFR-D-061 v1.0`) | Не изменено; non-substitution признана | Numeric maximum |
| Risk→routing threshold | `AI + LEGAL`, Architecture §37 №8 (`XFR-D-M2`) | Не изменено; non-substitution признана | Numeric trigger/mapping |
| Segment-specific Qualification policy | `Chief AI Architect + PRODUCT` (`XFR-D-042 v1.0`) | Не изменено; независимость подтверждена | Segment universe/thresholds |
| Evaluation cluster prerequisites | `XFR-D-057`–`071` respective owners | Не изменены; применимость подтверждена | Их собственные `OPEN` contents |
| Runtime/implementation/release | Отдельные downstream artifacts/gates | No automatic effect | Всё содержание |

## 5. Обязательные non-conflations

1. `XFR-D-045` evidence governance ≠ actual numeric mutual-fit/Confidence/completeness threshold decisions (`XFR-D-034`/`XFR-D-035`/`XFR-D-036`).
2. `XFR-D-045` ≠ `XFR-D-M2` Risk→routing threshold/trigger (Architecture §37 №8, `AI + LEGAL`, `SOURCE_NORMATIVE`).
3. `XFR-D-045` ≠ `XFR-D-042` segment-specific Qualification policy governance.
4. `XFR-D-045` ≠ `XFR-D-061` Hard-Filter false-exclusion (Eligibility Filter, stage 3).
5. `XFR-D-045` ≠ `XFR-D-063` ranking/calibration/diversification metric-target governance (Confidence calibration is prerequisite input, not the Qualification cutoff).
6. `XFR-D-045` ≠ Scoring Mutual Aggregate object approval (Architecture §37 №2/№3, `MATCHING_SCORING_POLICY`).
7. `XFR-D-045` ≠ Feature Schema `required_evidence_level` values (Qualification row 8).
8. `XFR-D-045` ≠ `XFR-D-046` synthetic-only versus production calibration rule.
9. Evidence/technical-procedure owner (`AI + DEVELOPMENT`) ≠ governance owner (`Chief AI Architect + AI`) or mandatory approvers (`PRODUCT + LEGAL + DEVELOPMENT`).
10. Признание `XFR-F1` gap ≠ approval, closure или content-creation этого gap.
11. This record ≠ approval любого actual dataset, evaluation run, evidence package, results, verdict, production data/applicability, policy/manifest approval или implementation.

## 6. Что остаётся `OPEN`

- `XFR-F1` metric family и все её exact definitions, формулы, numerator/denominator/counting unit, baselines, targets, thresholds, tolerances, sample sizes, split ratios, confidence intervals, windows, statistical tests и uncertainty methods;
- actual `MQP-05`/`MQP-06`/`MQP-07` thresholds `XFR-D-034`/`XFR-D-035`/`XFR-D-036` и их ownership;
- Scoring Mutual Aggregate и Architecture §37 №2/№3;
- Feature Schema `required_evidence_level` values;
- `XFR-D-063` exact Confidence calibration metrics/methods;
- `XFR-D-M2`/Architecture §37 №8 Risk-to-routing trigger;
- `XFR-D-042` segment-specific policy contents;
- `XFR-D-046` synthetic-only versus production calibration rule;
- actual dataset, Evaluation Plan content/approval, evaluation run, evidence package/results/verdict, production data/applicability, policy/manifest approval, schema/API/DB/event/runtime/implementation.

## 7. Rationale

`LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` уже честно признаёт (row 19), что Evaluation Plan не содержит metric family для Gate-специфичных условий mutual-fit/Confidence/completeness, а Inventory `XFR-F1` независимо подтверждает этот же пробел как documented gap уровня `MEDIUM`. Оставлять этот пробел без owner создаёт риск, что будущая evidence подготовка будет выполнена без cross-functional approval или подменит соседние, уже частично разрешённые boundaries (`XFR-D-061` false exclusion, `XFR-D-063` ranking/calibration targets, `XFR-D-042` segment policy). Назначение owner по тому же паттерну, что уже применён к `XFR-D-061`/`XFR-D-063` (`Chief AI Architect + AI` governance owner, `PRODUCT + LEGAL + DEVELOPMENT` approvers, `AI + DEVELOPMENT` evidence-procedure owner), сохраняет consistency governance-кластера, не подменяя отсутствующий empirical evidence и не создавая metric-family content, которое источник сознательно не задаёт.

Разделение трёх evidence families и явный запрет substitution соседними boundaries (`XFR-D-061`, `XFR-D-063`, `XFR-D-M2`, Feature Schema) предотвращают опасную агрегацию, при которой достаточная evidence по одному условию маскирует insufficiency по другому.

## 8. Adversarial cases

1. **`XFR-D-061` false-exclusion evidence используют как готовое stage-8 mutual-fit/completeness evidence.** Запрещено §3.9 п.4/§5 п.4 — это Eligibility Filter, stage 3, другой evaluation object.
2. **Confidence Score calibration target (`XFR-D-063`) объявляют Qualification routing cutoff.** Запрещено §3.9 п.2/§5 п.5 — calibration является prerequisite input, cutoff остаётся отдельным `OPEN` candidate assignment (row 6).
3. **Отсутствие XFR-F1 metric family молча заполняют существующей несвязанной метрикой.** Запрещено §3.2/§3.9 — признание пробела не разрешает subsitution.
4. **Хороший aggregate результат по одной evidence-семье компенсирует недостаточность по другой.** Запрещено §3.3/§3.6 — non-compensation сохраняется для всех трёх families.
5. **Threshold утверждают на tuning evidence и там же финально проверяют.** Запрещено §3.4 — tuning/final isolation обязательна.
6. **Synthetic-only evidence объявляют production-ready.** Запрещено §3.10 п.11 — требуется explicit synthetic-only vs production applicability statement, `XFR-D-046` не разрешается этим record'ом.
7. **`Chief AI Architect + AI` утверждают evidence package единолично, без `PRODUCT + LEGAL + DEVELOPMENT`.** Запрещено §3.1 п.4-5 — approval неполон.
8. **`AI + DEVELOPMENT` (evidence/technical-procedure owner) объявляют package approved.** Запрещено §3.1 п.3-4 — evidence preparation не равна governance approval.
9. **Missing/incomplete evidence трактуют как «zero» или «pass».** Запрещено §3.8 — fail-closed boundary без permissive fallback и без изобретения adverse route.
10. **Этот record цитируют как closing `XFR-D-034`/`035`/`036`, `XFR-D-M2`, `XFR-D-042` или `XFR-D-046`.** Запрещено §5 — ни одно из них не резолвится этим record'ом.
11. **Evidence package автоматически меняет Qualification/Scoring/Risk Policy или runtime.** Запрещено §3.7 — требуется отдельный controlled release; implementation gates остаются `BLOCKED`.

## 9. Затронутые артефакты — future separate sync only

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — decision-register row 19 может получить owner/evidence-prerequisite cross-reference при сохранении всего exact operational содержания `OPEN`;
- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §6.1/§6.2 и readiness summary могут получить cross-reference на признанный `XFR-F1` gap и на governance boundary этого record'а, без создания metric-family content;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — future overlay может отразить `MQP-19 → XFR-D-045` status и `XFR-F1` provenance без изменения canonical identity/counts.

Ни один из этих syncs не выполняется этим record'ом. Qualification Policy, Evaluation Plan, Inventory, manifests и sibling records остаются untouched этим изменением.

## 10. Change control

Любое изменение governance owner, mandatory approvers, evidence/technical-procedure role, признания `XFR-F1`, разделения трёх evidence families, non-compensation, baseline-first/tuning-final дисциплины, non-conflation boundaries, минимальных evidence-package категорий или fail-closed boundary требует нового versioned `XFR-D-045` record с `supersedes`, согласованного `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT`.

Exact `XFR-F1` metric-family content, actual numeric thresholds, dataset, evaluation run, evidence package, production applicability, carrier, RBAC или implementation contents требуют собственного evidence-backed approval и не могут быть введены silent edit, conventional metric, Evaluation Plan sync, implementation, CI, commit, merge или deployment.

## 11. Gate impact

`NONE`.

`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

Этот record не approves ни один Qualification/Scoring/Risk/Evaluation Policy, metric-family, dataset, evaluation-run, production-data use, runtime или implementation.

## 12. Acceptance criteria

1. **Given** governance roles, **when** проверяются, **then** governance owner будущего evidence package — `Chief AI Architect + AI`, mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`, а `AI + DEVELOPMENT` evidence/technical-procedure owner не имеет unilateral approval authority.
2. **Given** `XFR-F1` gap, **when** этот record цитируется, **then** признание пробела не создаёт и не утверждает metric-family content, и `XFR-D-045` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
3. **Given** mutual-fit, Confidence cutoff и completeness evidence, **when** формируется evidence package, **then** три семьи рассматриваются раздельно, без единого aggregate и без cross-family compensation.
4. **Given** `XFR-D-061`, `XFR-D-063`, `XFR-D-M2`, `XFR-D-042`, Feature Schema `required_evidence_level` или Scoring Mutual Aggregate, **when** сравниваются с этим record'ом, **then** ни один не резолвится, не поглощается и не подменяется `XFR-D-045`.
5. **Given** только synthetic-only evidence, **when** формулируется production applicability claim, **then** claim запрещён, а `XFR-D-046` не разрешается этим record'ом.
6. **Given** tuning evidence, **when** используется для final claim того же threshold, **then** это запрещено; final evidence остаётся untouched.
7. **Given** missing/incomplete/stale/incompatible/ambiguous/conflicting/leakage-contaminated evidence, **when** оценивается threshold progression, **then** она блокируется fail closed без coercion в zero/pass/sufficient и без изобретения adverse route.
8. **Given** `Chief AI Architect + AI` либо evidence/technical-procedure owner в одиночку, **when** предлагается approval, **then** approval недействителен без полного owner/approver set.
9. **Given** implementation, commit, merge, CI, Evaluation Plan sync или documentation prose, **when** цитируется этот record, **then** ни один не создаёт новую metric family, threshold, runtime enum, schema или production authorization.
10. **Given** все три governance gates, **when** проверяется статус, **then** `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 13. Итог

`XFR-D-045 PARTIALLY_RESOLVED_BOUNDARY — GOVERNANCE OWNER, MANDATORY APPROVERS, EVIDENCE/TECHNICAL-PROCEDURE ROLE, XFR-F1 GAP RECOGNITION, THREE-FAMILY SEPARATION, NON-COMPENSATION, BASELINE-FIRST/TUNING-FINAL DISCIPLINE AND MINIMUM EVIDENCE-PACKAGE CATEGORIES APPROVED; XFR-F1 METRIC-FAMILY CONTENT, ACTUAL NUMERIC THRESHOLDS, DATASET, EVALUATION RUN, EVIDENCE PACKAGE, PRODUCTION APPLICABILITY, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
