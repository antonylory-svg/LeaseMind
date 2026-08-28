# LeaseMind Matching Decision Record — XFR-D-063

**Decision ID:** `XFR-D-063`

**Название:** Numeric metric-target governance owner and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-08-28

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER AND EVIDENCE-PREREQUISITE BOUNDARY — ALL IN-SCOPE NUMERIC METRIC TARGETS REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-28 working session

**Repository baseline:** `4bc2ff6a614ff5af724a971af214bd7f84c3c5d3`

**Scope:** governance ownership, metric-family separation and evidence prerequisites for future approved targets for `Precision@K`, `Recall@K`, `NDCG@K`, Confidence Score calibration and upper-result diversification only; does not choose any numeric value, `K`, baseline, metric formula, denominator, calibration/diversification method, statistical procedure, dataset, threshold, runtime representation, implementation or Evaluation Plan approval.

**Governance owner (для будущего numeric target bundle):** `Chief AI Architect + AI` — human-approved candidate assignment из `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §6.2/§6.4/§11, решение №7; Architecture не назначает owner этого bundle напрямую.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence-procedure owner:** `AI + DEVELOPMENT` под `MATCHING_EVALUATION_PLAN`; эта роль готовит/проверяет evidence и не заменяет governance approval полного owner/approver set.

**Depends on:** label eligibility `XFR-D-057 v1.0`, adjudication procedure `XFR-D-058 v1.1`, grouping/isolation `XFR-D-059 v1.1`, correction-history exclusion `XFR-D-060 v1.0`, false-exclusion governance/evidence boundary `XFR-D-061 v1.0` и dataset allocation/reproducibility boundary `XFR-D-062 v1.0`. Segment coverage `XFR-D-064`, fairness framework `XFR-D-068` и threshold-search statistical comparison `XFR-D-070` остаются независимо `OPEN` и необходимы там, где применимы будущему numeric approval.

---

## 1. Вопрос

Кто владеет будущим утверждением numeric targets для ranking/retrieval, Confidence Score calibration и upper-result diversification и какое evidence обязательно до такого утверждения, если Architecture требует сначала измерить baseline на размеченной тестовой выборке, но не задаёт значения или owner напрямую?

## 2. Source/status discipline

Architecture §34.2 нормативно называет семейства измерений качества ранжирования, уверенности и риска: `Precision@K`, `Recall@K`, `NDCG@K`, калибровку Confidence Score и Risk Score, стабильность ранга, качество диверсификации верхней выдачи, подтверждённые human-review flags и пропущенные критические риски. Источник отдельно требует, чтобы точные пороги `Precision@K`, `Recall@K`, `NDCG@K`, калибровки, диверсификации и human-review утверждались только после создания размеченной тестовой выборки; до этого они измеряются как baseline и не подменяются произвольными значениями.

Этот record разрешает только Evaluation Plan decision №7 в его узком составе:

- `Precision@K`, `Recall@K`, `NDCG@K`;
- Confidence Score calibration target;
- upper-result diversification target.

Он не переносит в `XFR-D-063` соседние, независимо управляемые boundaries:

- Risk Score human-review thresholds принадлежат owner `AI + LEGAL` по Architecture §37 question №8 и будущему `MATCHING_RISK_POLICY`;
- false-exclusion maximum остаётся отдельным частично разрешённым `XFR-D-061`;
- exact replay/bounded replay tolerance не становится ranking target;
- segment coverage и fairness standards остаются `XFR-D-064`/`XFR-D-068`;
- critical-risk miss boundary, Qualification routing и human-review runtime triggers не утверждаются этим record;
- rank stability может измеряться как Architecture metric family, но этот record не создаёт для неё numeric target или tolerance.

Architecture §30.3 требует frozen sample, label-quality check, offline evaluation, proxy/discrimination review, calibration check, Chief AI Architect review и согласование затронутых PRODUCT/LEGAL правил. Architecture §52 назначает `AI + DEVELOPMENT` owner'ом `MATCHING_EVALUATION_PLAN` и dataset manifest, но не делает их единоличным owner'ом numeric policy values.

Evaluation Plan §6.2/§6.4/§11 предлагает `Chief AI Architect + AI` как candidate owner решения №7, прямо отмечая, что источник не подтверждает owner напрямую. Этот human-approved record разрешает owner/evidence-prerequisite boundary. Все target values и exact metric/statistical contents остаются `OPEN`.

## 3. Решение

### 3.1. Governance owner и обязательное approval-разделение

1. Governance owner будущего numeric target bundle в scope этого record — `Chief AI Architect + AI`.
2. Mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`.
3. Evidence-procedure owner — `AI + DEVELOPMENT` в рамках Evaluation Plan.
4. Evidence preparation, metric computation, baseline measurement или recommendation не равны approval. `AI`, `DEVELOPMENT` или Chief AI Architect не могут утвердить target единолично.
5. Финальное numeric решение требует полного owner/approver set, нового versioned decision record, точной policy version/hash и immutable evidence references.

### 3.2. Metric-family boundary и запрет скрытой агрегации

Будущие targets рассматриваются отдельно для каждого применимого семейства:

1. `Precision@K`;
2. `Recall@K`;
3. `NDCG@K`;
4. Confidence Score calibration;
5. upper-result diversification.

Этот список не утверждает:

- конкретное значение `K` или единый `K` для разных метрик/сегментов;
- metric definitions, relevance policy, numerator, denominator, averaging/aggregation method или treatment of ties;
- calibration error family, binning, calibration target или uncertainty method;
- diversity definition, protected/business dimension, distance, coverage formula или target;
- единый composite target, weighted score, pass-through rule или компенсацию провала одной метрики успехом другой;
- одинаковые targets для всех сегментов, cohorts, directions Tenant/Owner или use cases.

Ни aggregate ranking score, ни Confidence Score, ни diversification result не могут подменять false-exclusion, false-eligibility, fairness, safety, critical-risk или human-review evidence.

### 3.3. Baseline first; numeric targets remain open

1. До eligible размеченной final/test выборки семейства из §3.2 измеряются только как baseline, когда их label/evidence contract это допускает.
2. Baseline не является target, approval threshold, launch criterion или implementation default.
3. Ни одно target value не выводится из pilot cap `100 Campaign`, Campaign→Qualified `40%/25%`, conventional benchmark, synthetic fixture, текущего model result или значения другой метрики.
4. Все numeric targets, `K`, metric definitions/denominators, aggregation, calibration/diversification methods, uncertainty/confidence procedures и statistical tests остаются `OPEN_BLOCKED_PENDING_DECISION`.
5. Невозможность измерить семейство на eligible evidence не разрешает исключить его после просмотра результатов, заменить proxy или назначить convenient fallback.

### 3.4. Минимальный evidence package до numeric approval

Ни одно значение в scope этого record не может считаться approved target без versioned evidence package, включающего как минимум:

1. exact target family, metric definition, `K` где применимо, numerator/denominator, inclusion/exclusion, aggregation и units;
2. доказанную label eligibility по `XFR-D-057`, applicable source-policy evidence и adjudication по `XFR-D-058`;
3. grouping/split-isolation evidence `XFR-D-059` и correction-history handling `XFR-D-060`;
4. approved numeric sufficiency/allocation/seed policy, когда она появится поверх qualitative `XFR-D-062`, и полный frozen manifest;
5. versioned baseline на eligible verified labeling, отдельно от candidate target;
6. tuning evidence, отделённое от untouched final evaluation evidence; final split не используется для поиска target, который на нём затем проверяется;
7. применимую approved threshold-search statistical comparison procedure (`XFR-D-070`), uncertainty/confidence reporting и sample limitations без invented fallback;
8. раздельные results по metric families и совместное counter-evidence по false exclusion/eligibility, safety, human-review/critical-risk outcomes без cross-metric compensation;
9. segment coverage и применимые fairness/proxy/legal reviews (`XFR-D-064`/`XFR-D-068`) без изобретения ещё не утверждённых thresholds;
10. explicit synthetic-only versus production-data applicability statement; synthetic-only evidence не создаёт production target или production-readiness claim;
11. candidate target bundle, rationale, affected policy artifact/version/hash и immutable links на freeze-time/post-execution evidence;
12. документированные PRODUCT/LEGAL impacts и DEVELOPMENT reproducibility/control verification.

Этот перечень утверждает categories обязательного evidence, но не утверждает exact metric/statistical contents открытых решений, dataset, procedure schema, runtime carrier или target values. До разрешения применимых dependencies numeric approval блокируется fail closed.

### 3.5. Tuning/final separation и change discipline

1. Candidate target может искаться только на tuning evidence по заранее зафиксированной procedure/version.
2. Final evaluation evidence остаётся независимым и не используется для выбора, пересмотра или cherry-picking того же target.
3. Просмотр final results не разрешает менять `K`, metric definition, aggregation, included segments, calibration bins, diversity definition или target без нового versioned cycle.
4. Target не может быть ретроспективно ослаблен для прохождения конкретного run.
5. Evaluation output не меняет model, scoring/risk/qualification policy или runtime rules автоматически.

### 3.6. Independent decisions не подменяются

`XFR-D-063` не определяет и не изменяет:

- numeric false-exclusion maximum, baseline или exact metric/statistics (`XFR-D-061`);
- numeric dataset size/minimum/ratios/tolerance, exact allocation algorithm или seed policy/value (`XFR-D-062`);
- segment coverage/minimums (`XFR-D-064`);
- fairness/proxy/legal framework и standards (`XFR-D-068`);
- threshold-search statistical comparison procedure (`XFR-D-070`);
- Risk Score human-review thresholds, Qualification routing, critical-risk handling или `MATCHING_RISK_POLICY`;
- exact replay/bounded replay tolerance, drift monitoring или production monitoring thresholds;
- production-data authority, lawful basis, privacy approval или named appointments/RBAC;
- runtime/API/DB/schema/event representation, implementation, model/policy release или rollback.

### 3.7. Partial, never fully resolved

`XFR-D-063` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, narrow metric-family separation, baseline-first discipline и qualitative evidence prerequisites разрешены.

Остаются `OPEN`:

- все numeric target values и точные значения `K`;
- exact metric definitions, labels/relevance semantics, numerators/denominators и aggregation;
- calibration/diversification definitions, methods и targets;
- metric/segment-specific sample sufficiency;
- uncertainty/confidence, statistical comparison и target-search procedure;
- фактические baseline, dataset, manifest, evaluation run и evidence package;
- policy values, runtime carrier, implementation и release approval.

Будущее решение этих вопросов требует нового versioned `XFR-D-063` record с `supersedes` на эту версию. Они не могут быть добавлены silent edit, Evaluation Plan sync, conventional benchmark или implementation default.

## 4. Layer/boundary

| Слой | Что регулирует | Authority | Статус после этого record |
|---|---|---|---|
| Metric-family existence / baseline-first | Ranking, calibration и diversification measurement families; exact thresholds only after labeled test sample | Architecture §34.2 (`SOURCE_NORMATIVE`) | Не изменён |
| Governance owner будущего target bundle | Кто владеет будущим numeric decision | `Chief AI Architect + AI` | Разрешён этим record |
| Mandatory approval | Кто обязан согласовать numeric decision | `PRODUCT + LEGAL + DEVELOPMENT` | Разрешено этим record |
| Evidence procedure | Кто готовит/проверяет Evaluation evidence | `AI + DEVELOPMENT` | Разрешена role boundary; не unilateral approval |
| Numeric targets и exact metric/statistics | Values, `K`, definitions, denominators, calibration/diversity methods, uncertainty/comparison | Полный owner/approver set после evidence | `OPEN` |
| Risk/human-review/false-exclusion/segments/fairness | Independent policy and evidence boundaries | `XFR-D-061`/`064`/`068`, Architecture §37 и downstream decisions | Не изменены; отдельно governed |
| Runtime/implementation/release | Carrier, enforcement, monitoring, rollback | Отдельные downstream artifacts/gates | `OPEN` |

## 5. Что остаётся `OPEN`

- все numeric values, exact `K` и target direction/inequality;
- exact metric definitions, relevance/label contract, numerator, denominator, aggregation, tie/empty-result treatment;
- Confidence Score calibration metric/method/target и diversification definition/method/target;
- фактические baseline и metric-specific sufficiency evidence;
- numeric часть `XFR-D-061`/`XFR-D-062`, а также `XFR-D-064`, `XFR-D-068` и `XFR-D-070`;
- Risk Score human-review thresholds, critical-risk misses, Qualification routing и runtime triggers;
- actual dataset, manifest, evaluation run, statistical procedure и evidence package;
- production-data/privacy/legal prerequisites;
- runtime/API/DB/schema/event carrier, implementation, monitoring и rollback;
- Evaluation Plan, Scoring/Risk/Qualification Policy values, model release и governance-gate approval.

## 6. Rationale

Architecture требует измерять named metric families, но сознательно запрещает произвольные targets до появления размеченной test выборки. Назначение owner устраняет процедурную неопределённость, не подменяя evidence и не превращая measurement family в готовый launch threshold.

Раздельное рассмотрение ranking, calibration и diversification предотвращает скрытую компенсацию: высокий NDCG не оправдывает низкий Recall, хорошая aggregate ranking quality не скрывает false exclusion или segment harm, а calibration result не подменяет Risk/human-review policy. Full five-function approval обеспечивает model-governance, product, legal и reproducibility review до любого numeric policy decision.

## 7. Adversarial cases

1. **Для `K` берут привычное значение.** Запрещено: exact `K` остаётся `OPEN` и требует evidence/approval.
2. **Текущее измерение baseline объявляют target.** Запрещено: baseline и approved target — разные artifacts/stages.
3. **Target выбирают и проверяют на final split.** Evidence непригодно; tuning/final separation обязательна.
4. **После плохого final result меняют denominator, bins или diversity definition.** Запрещено: требуется новый versioned cycle, final evidence не переписывается.
5. **Высокий NDCG компенсирует низкий Recall либо false exclusion.** Запрещено: metric families и safety evidence не компенсируют друг друга.
6. **Campaign→Qualified `40%/25%` или pilot cap `100 Campaign` используют как metric target.** Запрещено: это другие boundaries и denominators.
7. **Synthetic-only run достигает target.** Это не создаёт production target, production-data approval или production-readiness claim.
8. **Confidence calibration target используют как Risk Score human-review threshold.** Запрещено: Risk thresholds принадлежат отдельному owner/policy boundary.
9. **Rank stability или exact replay автоматически включают в target bundle.** Запрещено: этот record не утверждает для них numeric tolerance.
10. **Chief AI Architect и AI утверждают значения без PRODUCT/LEGAL/DEVELOPMENT.** Approval неполон и недействителен.
11. **AI + DEVELOPMENT подготовили evidence и считают target утверждённым.** Запрещено: evidence-procedure ownership не равно governance approval.
12. **Успешный evaluation run автоматически меняет runtime rules.** Запрещено: требуется отдельный controlled release; все gates остаются blocked.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §6.2, §6.4, §11 решение №7 и readiness summary получат owner/evidence-prerequisite cross-reference без target values;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay для `XFR-D-063`;
- будущий numeric `XFR-D-063`, metric procedure, affected policy artifacts и runtime artifacts — отдельные downstream passes.

Ни один future sync не должен интерпретировать этот record как numeric target, Evaluation Plan/dataset/run approval, production-readiness evidence или implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, metric-family scope/separation, baseline-first discipline или minimum evidence prerequisites требует нового versioned `XFR-D-063` record, согласованного `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашиваются current target values, `K`, metric definitions или statistical method, **then** значения отсутствуют и `XFR-D-063` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** будущий numeric candidate, **when** проверяется authority, **then** governance owner — `Chief AI Architect + AI`, mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`, а evidence preparation `AI + DEVELOPMENT` не заменяет approval.
3. **Given** metric target bundle, **when** проверяется scope, **then** он ограничен `Precision@K`, `Recall@K`, `NDCG@K`, Confidence Score calibration и upper-result diversification.
4. **Given** Risk Score/human-review, false-exclusion, rank/replay, segment, fairness или critical-risk boundary, **when** применяется этот record, **then** независимая authority/dependency сохраняется и target не считается утверждённым.
5. **Given** baseline, conventional benchmark, Campaign→Qualified `40%/25%`, pilot cap `100 Campaign` или synthetic fixture, **when** ищется numeric target, **then** ни одно значение не используется как surrogate/default.
6. **Given** candidate target, **when** отсутствуют eligible labeled evidence, frozen manifest, tuning/final separation либо применимые `XFR-D-064`/`068`/`070` prerequisites, **then** approval блокируется fail closed.
7. **Given** несколько metric families, **when** одна метрика провалена, **then** успех другой метрики не компенсирует failure и composite waiver не создаётся.
8. **Given** final evidence уже просмотрено, **when** предлагается изменить target, `K`, definition, denominator, bins, segments или diversity method, **then** требуется новый versioned cycle и existing final evidence не переписывается.
9. **Given** только synthetic evidence, **when** формулируется production target/readiness claim, **then** claim запрещён.
10. **Given** будущий approved target, **when** рассматривается runtime/model/policy change, **then** автоматическое изменение запрещено и требуется отдельный controlled release.
11. **Given** этот record, **when** проверяются Evaluation Plan, dataset/run, production-data use, runtime, implementation и gates, **then** они не утверждены и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-063 GOVERNANCE-OWNER, METRIC-SEPARATION AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — ALL IN-SCOPE NUMERIC TARGETS, K, EXACT METRIC/STATISTICS, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
