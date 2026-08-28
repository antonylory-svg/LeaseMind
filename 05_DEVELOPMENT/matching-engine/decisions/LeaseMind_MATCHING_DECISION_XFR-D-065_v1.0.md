# LeaseMind Matching Decision Record — XFR-D-065

**Decision ID:** `XFR-D-065`

**Название:** Drift-monitoring governance owner, artifact-separation and qualitative evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-08-28

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER, ARTIFACT-SEPARATION AND QUALITATIVE EVIDENCE BOUNDARY — DRIFT DEFINITIONS, METRICS, BASELINES, WINDOWS, TRIGGERS AND OPERATIONAL ACTIONS REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-28 working session

**Repository baseline:** `29a2219bc45b597dd640c31b8443ee6c0e380baf`

**Scope:** governance ownership, artifact separation and qualitative evidence handling for a future drift-monitoring policy only; does not define drift taxonomy, monitored population/object, metric, numerator/denominator, baseline/reference set, window, threshold, tolerance, statistical method, alert level, SLO, runbook, escalation path, rollback/action trigger, production-data use, runtime carrier, implementation, Evaluation Plan approval or production operational-artifact approval.

**Governance owner:** `AI + DEVELOPMENT` — human-approved assignment aligned with `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §11 decision row №11. The Evaluation Plan is a Proposal and Architecture does not assign this exact drift-policy owner directly.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Monitoring/evidence-procedure owner:** `AI + DEVELOPMENT`; эта роль готовит и проверяет monitoring evidence и candidate operational procedure, но не получает unilateral approval authority. Оба owner'а действуют совместно, а approval требует полного owner/approver set.

**Depends on:** Architecture §30.3 п.9 и §54 задают только существование monitoring/rollback capability и отдельного versioned operational artifact с owner/runbook/escalation для каждого alert. `XFR-D-057`–`XFR-D-064` применяются как qualitative prerequisites только там, где будущая drift family использует соответствующие labels, adjudication, grouping, correction history, dataset allocation, metric targets или segment diagnostics; они не становятся универсальными prerequisites для любого operational signal. `XFR-D-066`, `XFR-D-068`, `XFR-D-070`, `XFR-D-071`, `XFR-D-M4` и named appointment/RBAC после `XFR-D-067` остаются независимыми решениями.

---

## 1. Вопрос

Кто владеет будущим утверждением drift-monitoring procedure/metrics/triggers и какие минимальные качественные governance-инварианты действуют до появления точных определений и evidence, если Architecture требует monitoring и rollback capability, но Matching-источники не определяют drift как отдельное понятие?

## 2. Source/status discipline

Architecture §30.3 п.9 нормативно требует после controlled release «мониторинг и возможность отката» — `SOURCE_NORMATIVE` для существования capability, но не для drift taxonomy, metric, trigger или автоматического действия. Architecture §54 нормативно требует публиковать SLO и alert thresholds в отдельном versioned operational artifact и назначать каждому alert owner, runbook и escalation — `SOURCE_NORMATIVE` для формы operational governance, не для содержания drift policy.

Evaluation Plan §1.2 относит production monitoring/SLO к `OUT_OF_SCOPE` и отдельному operational artifact. Его §11 decision row №11 предлагает `AI + DEVELOPMENT` как owner вопроса «Drift monitoring — процедура, метрики, триггеры» и честно отмечает отсутствие прямого drift-покрытия в Matching-источниках. Поэтому owner assignment и qualitative boundary ниже являются отдельным human-approved governance decision, а не пересказом существующего source-normative drift contract.

Evaluation Plan §9 и Architecture §30.3 запрещают превращать evaluation/monitoring evidence в автоматическое productive retraining или автоматическое изменение Hard Constraints/global weights. Этот record сохраняет запрет и не определяет автоматический rollback или иной runtime action.

## 3. Решение

### 3.1. Governance owner и approval-разделение

1. Governance owner будущей drift-monitoring policy — `AI + DEVELOPMENT` совместно.
2. Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.
3. Monitoring/evidence-procedure owner — `AI + DEVELOPMENT`.
4. Подготовка telemetry, metric computation, statistical analysis, recommendation или operational-artifact draft не равна approval. `AI`, `DEVELOPMENT` или Chief AI Architect не могут утвердить policy единолично.
5. Exact drift policy требует нового versioned decision record, полного owner/approver set и ссылок на approved evidence и отдельный operational artifact.

### 3.2. Artifact separation

1. Evaluation Plan может предоставить versioned baseline/evaluation evidence, если оно применимо к выбранной drift family, но не становится production-monitoring/SLO artifact.
2. Production drift monitoring, SLO, alert definitions, operational ownership, runbooks и escalation публикуются и утверждаются в отдельном versioned operational artifact согласно Architecture §54.
3. Approval Evaluation Plan (`XFR-D-066`) не утверждает operational artifact, и approval operational artifact не утверждает Evaluation Plan, dataset, model или policy values.
4. Отсутствующие drift sections нельзя молча дописать в Evaluation Plan sync и выдать за утверждённый production-monitoring contract.

### 3.3. Qualitative evidence handling

1. Отсутствующая, неполная, stale, incompatible или не имеющая доказанной lineage telemetry не является evidence «drift отсутствует», `pass`, normal behavior или production readiness.
2. Monitoring-evidence insufficiency сообщается явно как governance/evidence finding и блокирует затронутое утверждение fail closed. Эта формулировка не создаёт runtime enum, status, reason code или alert level.
3. Monitoring-system/process failure и обнаруженный drift — разные классы фактов. Failure нельзя переименовывать в drift, а отсутствие detection при failure нельзя считать отсутствием drift.
4. Drift signal, alert или diagnostic result является evidence для review. Сам по себе он не меняет model, feature, Hard Constraint, global/segment weight, Scoring/Risk/Qualification Policy, ranking/diversification, routing, dataset, release state или rollback state.
5. Если будущая policy охватывает несколько drift families, populations, segments, intersections или metric families, хороший aggregate либо успех одной части не может молча компенсировать missing/insufficient evidence другой части. Exact aggregation и weighting остаются `OPEN`.
6. Synthetic-only monitoring evidence может подтвердить только заявленную synthetic applicability; оно не создаёт production drift threshold, production SLO или production-readiness claim.

### 3.4. Минимальные категории evidence до будущего exact-policy approval

Будущая exact drift policy не может считаться approved без versioned evidence package, содержащего как минимум следующие категории, без утверждения этим record'ом их точного содержания:

1. explicit drift family/taxonomy и границы каждого monitored claim;
2. monitored population/object, source lineage, policy/model/data versions и applicability interval;
3. reference baseline/set и доказательство его допустимости, неизменности и temporal relevance;
4. metric definition, numerator/denominator/counting unit, window и missing/stale-data handling;
5. uncertainty/statistical comparison evidence, включая applicable `XFR-D-070`;
6. label/dataset/segment prerequisites `XFR-D-057`–`XFR-D-064` только там, где они materially применимы;
7. false-positive и false-negative counter-evidence, а также limitations/known blind spots;
8. отдельное описание monitoring-system health/failure evidence, не смешанное с drift evidence;
9. candidate alert/trigger/action mapping с owner, runbook и escalation для будущего operational artifact;
10. explicit synthetic-only versus production-data applicability statement, privacy/retention/access evidence и applicable Data Governance approval;
11. immutable references на candidate policy, evidence, code/configuration versions и reproducible result;
12. документированные PRODUCT/LEGAL impacts и DEVELOPMENT reproducibility/control verification.

Эти категории не утверждают конкретное значение, taxonomy, data source, metric, threshold, alert или action. Если required category отсутствует либо соответствующее dependency остаётся unresolved, exact-policy approval блокируется fail closed.

### 3.5. Явное non-conflation

`XFR-D-065` не является и не заменяет:

1. feature freshness/TTL `XFR-D-005`: stale input может быть причиной monitoring finding, но TTL policy не является drift definition или trigger;
2. bounded replay tolerance `XFR-D-M4`: replay mismatch/tolerance — самостоятельная reproducibility boundary, не surrogate drift threshold;
3. numeric metric targets `XFR-D-063`: evaluation target и production drift trigger — разные решения;
4. segment/bias/proxy dataset coverage `XFR-D-064` или fairness standard `XFR-D-068`: segment diagnostic evidence может быть входом будущего monitoring, но не утверждает protected/proxy taxonomy, lawful basis или legal verdict;
5. qualitative `unknown`/`abstention` boundary `XFR-D-069`: monitoring-evidence insufficiency или monitoring failure не переименовывается в эти concepts и не создаёт новый runtime token;
6. threshold-search statistical procedure `XFR-D-070` или correction synchronization `XFR-D-071`;
7. Evaluation Plan artifact approval `XFR-D-066`, production-data approval или Data Governance authority model `XFR-D-067`; authority model не заменяет named appointment/RBAC;
8. Architecture §54 generic SLO/incident policy: этот record не выбирает SLO, alert threshold, incident class, runbook, escalation или retention;
9. Scoring segment override, ranking/diversification algorithm, model release, rollback authorization или runtime monitoring implementation.

### 3.6. Partial, never fully resolved

`XFR-D-065` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, monitoring/evidence-procedure role, separation Evaluation Plan от operational artifact, fail-closed treatment of insufficient monitoring evidence, distinction monitoring failure vs detected drift, non-compensation и no-automatic-action boundary разрешены.

Drift taxonomy, monitored objects/populations, all numeric/statistical contents, operational alerts/actions и production implementation остаются полностью `OPEN`. Они требуют нового versioned `XFR-D-065` record с `supersedes` на эту версию и не могут появиться через silent edit, conventional default, Evaluation Plan sync, operational implementation или model configuration.

## 4. Layer/boundary

| Слой | Что регулирует | Authority | Статус после этого record |
|---|---|---|---|
| Monitoring/rollback capability | Monitoring и возможность отката после controlled release | Architecture §30.3 п.9 (`SOURCE_NORMATIVE`) | Не изменён; exact mechanism не определён |
| Operational artifact discipline | Отдельный versioned artifact; alert owner/runbook/escalation | Architecture §54 (`SOURCE_NORMATIVE`) | Не изменена; drift-specific content не утверждён |
| Governance owner/approvers | Кто владеет и согласует будущую drift policy | `AI + DEVELOPMENT`; `Chief AI Architect + PRODUCT + LEGAL` | Разрешено этим record |
| Monitoring/evidence procedure | Кто готовит и проверяет candidate evidence | `AI + DEVELOPMENT` | Role boundary разрешена; не unilateral approval |
| Evidence insufficiency/failure/non-compensation | Qualitative fail-closed review boundary | Этот record | Разрешено без runtime enum, metric или trigger |
| Drift taxonomy, metrics, baselines, windows, thresholds, statistics, alerts/actions | Exact policy content | Будущий полный owner/approver decision после evidence | `OPEN` |
| Evaluation Plan and production operational artifact approvals | Controlled artifact approval/change control | `XFR-D-066` и отдельный operational approval | `OPEN`; взаимно не подменяются |
| Runtime/production data/release/rollback | Carrier, data authority, implementation и operational action | Отдельные downstream artifacts/gates | `OPEN` |

## 5. Что остаётся `OPEN`

- drift definition и taxonomy, включая data/input, label, score, ranking, calibration, performance, segment/fairness или иные candidate families;
- monitored populations, cohorts, objects, fields, distributions, events и source authority;
- reference datasets/baselines, baseline refresh/supersession и applicability intervals;
- metric definitions, numerator, denominator, counting unit и treatment missing/stale/incompatible data;
- numeric windows, sample sizes, thresholds, tolerances, confidence/uncertainty values и statistical tests;
- seasonality, delayed labels/outcomes и aggregation/weighting across time, family, segment или intersection;
- exact false-positive/false-negative acceptance and counter-evidence procedure;
- alert levels, trigger semantics, SLOs, incident classes и action routing;
- named alert owners, named appointments/RBAC, runbooks, escalation paths и rollback authority/triggers;
- telemetry source/schema/carrier, API/DB/event/configuration design, retention, privacy, security и observability implementation;
- Evaluation Plan approval `XFR-D-066` и отдельное production operational-artifact approval;
- production-data authority, actual dataset/run/evidence package, model/policy release и implementation;
- applicable exact/numeric dependencies `XFR-D-005`, `XFR-D-057`–`XFR-D-064`, `XFR-D-068`, `XFR-D-070`, `XFR-D-071` и `XFR-D-M4`.

## 6. Rationale

Architecture требует monitoring capability и operational governance form, но не определяет drift. Назначение owner устраняет процедурную неопределённость, не превращая generic observability/SLO language в выдуманный drift contract. Отделение Evaluation Plan evidence от production operational artifact сохраняет владение артефактами и не позволяет evaluation result автоматически продвинуть release.

Fail-closed treatment неполной telemetry предотвращает наиболее опасную ошибку — интерпретацию отсутствия наблюдаемости как отсутствия drift. Одновременно разделение monitoring failure и detected drift сохраняет причинность и не создаёт ложный data/model diagnosis из operational outage. No-automatic-action boundary оставляет будущему versioned решению право определить alert/action/rollback semantics после evidence и approval.

## 7. Adversarial cases

1. **No telemetry → no drift.** Pipeline не получил данные и публикует green/pass. Запрещено: evidence недостаточно, затронутое утверждение блокируется.
2. **Collector failure → model drift.** Operational outage объявляется model/data drift. Запрещено: failure и drift должны оставаться различимыми.
3. **Alert → automatic policy change.** Signal автоматически меняет weight, Hard Constraint, ranking или routing. Не разрешено этим record'ом.
4. **Aggregate masking.** Общая метрика стабильна, но один monitored segment/family не имеет достаточного evidence. Aggregate не создаёт waiver.
5. **Evaluation target → drift trigger.** Numeric target `XFR-D-063` копируется как production alert threshold. Запрещено без отдельного evidence и exact `XFR-D-065` approval.
6. **Replay tolerance → drift tolerance.** `XFR-D-M4` используется как готовый drift threshold. Запрещено: это независимые boundaries.
7. **Synthetic → production.** Synthetic replay считается доказательством production drift readiness. Запрещено.
8. **Generic SLO → drift contract.** Architecture §54 используется для изобретения конкретного drift metric/threshold/runbook. §54 задаёт форму, не exact drift content.
9. **New runtime status by documentation.** Implementer добавляет `DRIFTED`, `NO_DRIFT` или monitoring-insufficiency token, ссылаясь на этот record. Запрещено: runtime representation остаётся `OPEN`.
10. **Silent artifact approval.** Evaluation Plan sync добавляет drift section и объявляет production operational artifact approved. Запрещено: approvals раздельны.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §11 row №11 и final readiness summary должны отразить только `PARTIALLY_RESOLVED_BOUNDARY`, сохранив exact drift policy и production monitoring `OPEN`/`OUT_OF_SCOPE`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — отдельный status overlay для `EP-11 → XFR-D-065` без изменения canonical identity/counts и исторических overlays;
- будущий versioned operational artifact Architecture §54 — создаётся и утверждается отдельно; этот record не создаёт его content или approval.

## 9. Change control

Изменение governance owner, approver set, artifact-separation, evidence-insufficiency, monitoring-failure separation, non-compensation или no-automatic-action boundary требует нового versioned decision record, согласованного `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`, со ссылкой `supersedes` на эту запись.

Любая drift taxonomy, metric, baseline, window, numeric trigger, operational alert/action или runtime representation также требует нового versioned `XFR-D-065` record после разрешения applicable dependencies и evidence; она не добавляется silent edit в v1.0.

## 10. Gate impact

`NONE`. Record не утверждает Evaluation Plan, dataset, evaluation run, production-data use, Scoring/Risk/Qualification Policy, model release, operational artifact, SLO, runtime design, implementation или rollback action.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** governance owner/approvers, **when** проверяется future drift policy, **then** owner — `AI + DEVELOPMENT`, mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`, а monitoring/evidence preparation не является unilateral approval.
2. **Given** Architecture §30.3/§54, **when** проверяется source claim, **then** они обосновывают monitoring/rollback capability и operational-artifact form, но не drift taxonomy, metric, trigger или automatic action.
3. **Given** Evaluation Plan, **when** проектируется production drift monitoring, **then** Evaluation Plan остаётся evidence artifact, а production monitoring/SLO — отдельным operational artifact.
4. **Given** missing/stale/incompatible telemetry, **when** оценивается drift claim, **then** отсутствие evidence не интерпретируется как no drift/pass/production readiness и затронутое утверждение блокируется fail closed.
5. **Given** monitoring-system failure, **when** формируется evidence, **then** failure не переименовывается в detected drift и не маскируется отсутствием alert.
6. **Given** drift signal или alert, **when** рассматривается operational action, **then** никакое model/policy/routing/release/rollback изменение не выполняется автоматически на основании этого record.
7. **Given** несколько будущих monitored families/segments, **when** evidence агрегируется, **then** успех одной части не компенсирует missing/insufficient evidence другой части без отдельно approved exact aggregation policy.
8. **Given** numeric metric/threshold/window/statistical method, runtime token или alert/action mapping, **when** проверяется его статус, **then** он остаётся `OPEN` и не создан этим record'ом.
9. **Given** synthetic-only monitoring evidence, **when** оценивается production applicability, **then** production threshold/SLO/readiness не выводится.
10. **Given** этот record, **when** проверяются `XFR-D-066`, `XFR-D-067`, `XFR-D-068`, `XFR-D-070`, `XFR-D-071`, `XFR-D-M4`, Scoring boundaries и runtime monitoring, **then** ни одно независимое решение не считается разрешённым или подменённым.
11. **Given** решение v1.0, **when** проверяются governance gates, **then** все три остаются `BLOCKED`.

## 12. Итог

`XFR-D-065 DRIFT-MONITORING GOVERNANCE-OWNER, ARTIFACT-SEPARATION AND QUALITATIVE EVIDENCE BOUNDARY APPROVED — ALL DRIFT DEFINITIONS, NUMERIC/STATISTICAL CONTENT, OPERATIONAL ALERTS/ACTIONS AND IMPLEMENTATION REMAIN OPEN`
