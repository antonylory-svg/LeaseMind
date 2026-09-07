# LeaseMind Matching Decision Record — XFR-D-019

**Decision ID:** `XFR-D-019`

**Название:** Evidence-status → Evidence Confidence calibration governance/evidence boundary

**Версия:** 1.0

**Дата решения:** 2026-09-07

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY — EXACT EVIDENCE-STATUS → EVIDENCE CONFIDENCE MAPPING, ALL NUMERIC VALUES, CALIBRATION, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-07

**Repository baseline:** `d8edadeb3eb63265a00efae1fa28b0823ee2fe74`

**Canonical identity:** `MSP-06 → XFR-D-019`, `PRIMARY_STANDALONE` — «Evidence-confidence mapping/калибровка на уровне feature».

**Scope:** qualitative governance, semantic-separation, fail-closed and evidence-prerequisite boundary for a future mapping from canonical `evidence_status` to feature/value-level Evidence Confidence. This record does not approve a mapping table or function, numeric value/range/order, calibration method, `required_evidence_level`, Feature Fit/Evidence Confidence joint calibration, dataset, evaluation result, Scoring/Feature/Risk/Qualification Policy, production-data applicability, schema/carrier/runtime, monitoring, rollback or implementation.

**Governance owner:** `Chief AI Architect + AI` — human-approved assignment derived from the Scoring Policy §12 row 6 and related Feature Schema/Scoring calibration candidate ownership; no source directly assigns this exact standalone decision owner, so the assignment is not claimed as `SOURCE_NORMATIVE`.

**Scoring Policy artifact owner:** `Chief AI Architect + PRODUCT` — source-owned artifact owner under Architecture §52. Artifact ownership remains separate from decision-specific governance.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role prepares candidate mapping/calibration specifications and evidence, but has no unilateral authority to approve mapping values, evidence sufficiency, policy, production use, runtime, implementation or a governance gate.

**Depends on and preserves:** Architecture §§13, 15.4, 16, 30.3 and 33; `XFR-D-019` remains distinct from `XFR-D-M6`; `XFR-D-057`–`XFR-D-060`, `XFR-D-062`, `XFR-D-063`, `XFR-D-064`, `XFR-D-068`, `XFR-D-070` and `XFR-D-071` retain their independent authority and status. The Scoring Policy, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy, Controlled Artifact Manifest, Data Contracts and downstream runtime artifacts remain separately governed.

---

## 1. Вопрос

Какая qualitative governance и evidence-prerequisite boundary должна действовать до утверждения точного преобразования канонического `evidence_status` в числовой Evidence Confidence на уровне feature/value?

## 2. Source/status discipline

1. Inventory canonical crosswalk фиксирует `MSP-06 → XFR-D-019`, `PRIMARY_STANDALONE`. Inventory индексирует вопрос, но не создаёт substantive approval.
2. Architecture §13 задаёт ровно семь канонических значений `evidence_status`: `UNVERIFIED`, `SOURCE_CONFIRMED`, `CONTENT_VERIFIED`, `CONFLICTING`, `STALE`, `REJECTED`, `HUMAN_REVIEW_REQUIRED`.
3. Architecture §15.4 задаёт Evidence Confidence как отдельный множитель в формуле `Dimension Score = сумма(Feature Fit × Feature Weight × Evidence Confidence) / сумма активных весов`, но не задаёт mapping, numeric values, range, ordering или calibration.
4. Architecture §15.4 отдельно требует исключать отсутствующее значение из числителя и знаменателя и учитывать его в общем Confidence Score; подтверждённое нарушение Hard Constraint обрабатывается до scoring. Эти нормы нельзя заменить числовым Evidence Confidence.
5. Architecture §16 определяет общий Confidence Score как надёжность оценки в целом, отдельно от привлекательности пары. Он не тождествен feature/value-level Evidence Confidence.
6. Feature Schema сохраняет `required_evidence_level` как отдельный eligibility/evidence-sufficiency вопрос и запрещает повышать `evidence_status` только потому, что `input_validated = true`.
7. Scoring Policy §12 row 6 оставляет mapping/калибровку `OPEN`; пересечение с Feature Schema open decision №1 и Risk Policy не означает их слияния или approval.
8. `FS-12 + MSP-12 → XFR-D-M6` — отдельное merged decision о Feature Fit/Evidence Confidence calibration. Оно не является `XFR-D-019` и не может быть silently resolved этим record.
9. Architecture §§30.3/33 требуют frozen, auditable, reproducible and reviewable evidence, но не утверждают mapping или численные значения.
10. Proposal text, candidate assignment, current code/library behavior, technical validation, synthetic fixture, business outcome, Inventory entry, commit, merge, CI or deployment не равны mapping, policy, production or gate approval.

## 3. Решение

### 3.1. Authority split

1. Governance owner `XFR-D-019` — `Chief AI Architect + AI`, human-approved assignment, не `SOURCE_NORMATIVE`.
2. Scoring Policy artifact owner остаётся `Chief AI Architect + PRODUCT` по Architecture §52.
3. Mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`.
4. Evidence/technical-procedure owner — `AI + DEVELOPMENT`, без unilateral approval authority.
5. Будущий exact mapping/calibration approval требует согласования полного набора `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT` на одной immutable candidate policy/version/hash и одном evidence package.
6. Artifact ownership, model expertise, evidence preparation, implementation ownership или successful evaluation не разрешают единолично выбирать mapping, признавать evidence достаточным, утверждать policy/runtime/production use или менять gate.

### 3.2. Exact canonical status boundary

В scope этого record сохраняется только следующий закрытый семизначный `evidence_status` enum из Architecture §13:

1. `UNVERIFIED`;
2. `SOURCE_CONFIRMED`;
3. `CONTENT_VERIFIED`;
4. `CONFLICTING`;
5. `STALE`;
6. `REJECTED`;
7. `HUMAN_REVIEW_REQUIRED`.

Этот список:

- не задаёт numeric values, ranges, rank, hierarchy или monotonic ordering;
- не утверждает, что следующий элемент «сильнее», «слабее», «выше» или «ниже» предыдущего;
- не разрешает добавлять `revoked`, `missing`, `unknown`, `validated` или иной runtime status в канонический enum;
- не определяет один общий numeric mapping для всех feature, source, purpose, lawful basis, freshness или use cases;
- не заменяет source provenance, authority, validity, expiry, revocation или conflict evidence.

### 3.3. Semantic separation

1. `evidence_status` — категориальное состояние доказательства; Evidence Confidence — будущий feature/value-level scoring multiplier. Они не являются одним полем или взаимозаменяемыми значениями.
2. Evidence Confidence не является Feature Fit, `required_evidence_level`, overall Confidence Score, Risk Score, Qualification status, lawful-processing eligibility, business outcome, reviewer verdict или presentation reason.
3. Feature Fit описывает соответствие значения критерию; Evidence Confidence — надёжность конкретного значения; overall Confidence Score — агрегированную надёжность оценки. Один слой не может silently кодировать другой.
4. `required_evidence_level` определяет применимую sufficiency/eligibility boundary, но не выбирает числовое значение Evidence Confidence.
5. `input_validated = true`, schema/type validation, parser success, AI inference, model confidence или технически успешная обработка не повышают `evidence_status` и не создают более высокий Evidence Confidence.
6. Низкий, отсутствующий или неутверждённый Evidence Confidence не создаёт negative Feature Fit, confirmed Hard Constraint violation, `INELIGIBLE`, rejection, routing, safe reason или display permission.
7. Успешный business outcome не переписывает исходный evidence status и не является автоматическим proof будущего mapping.

### 3.4. Fail-closed affected-use boundary

Missing, unknown, unmapped, ambiguous, conflicting, stale, rejected, review-required, expired, revoked or otherwise ineligible evidence condition:

1. не получает invented/default/average/nearest numeric Evidence Confidence;
2. не превращается автоматически в `0`, negative fact, failed fit, Hard Constraint violation, `INELIGIBLE`, rejection, route, reason or presentation;
3. не разрешает promotion в `SOURCE_CONFIRMED` или `CONTENT_VERIFIED` через validation, AI/heuristic inference, source reputation, aggregate score или implementation default;
4. блокирует только затронутое использование mapping/scoring, пока separately approved rule не определит более широкий effect;
5. не компенсируется Feature Fit, Feature Weight, aggregate Dimension/Match/Confidence score, majority of other evidence, business outcome или synthetic-only success;
6. сохраняет exact error/status carrier, retry, escalation, cascade, routing and runtime behavior `OPEN`.

`Revoked` здесь описывает состояние validity/authority вне канонического enum и не вводит новое значение `evidence_status`. Fail closed является governance boundary, а не business verdict или implementation specification.

### 3.5. Explicit, version/hash-bound future mapping

Любой future mapping candidate должен быть:

1. closed и explicit для каждого затронутого `evidence_status`, feature/source/use scope и исключения;
2. versioned и hash-bound к exact Scoring Policy, Feature Schema, source-policy bundle, dataset/manifest and implementation assumptions, которые он реально использует;
3. deterministic and reproducible на одинаковом frozen input и одинаковых versions/hashes;
4. explicit в отношении missing/unknown/unmapped/conflict/stale/rejected/review-required/expiry/revocation handling без hidden defaults;
5. auditable до исходного evidence item, source, status, provenance and applicable authority;
6. reviewed на предмет double counting между Evidence Confidence, Feature Fit, overall Confidence Score, Risk and Qualification layers;
7. accompanied by applicable calibration, uncertainty, fairness/proxy, legal and reproducibility evidence.

Эти требования являются prerequisites для будущего review, но не выбирают mapping или numeric contents.

### 3.6. Evidence prerequisites, not evidence approval

До future exact mapping approval требуется immutable evidence package, включающий как минимум:

1. exact candidate mapping specification, scope, version and hash;
2. доказанную eligibility и source authority для frozen evidence items;
3. applicable label-quality/adjudication, split/group isolation, correction-history and dataset-sufficiency evidence по независимым `XFR-D-057`–`XFR-D-060` и `XFR-D-062`;
4. заранее зафиксированные metric/calibration definitions, denominators, aggregation, uncertainty and statistical comparison procedure, когда они будут утверждены по `XFR-D-063`/`XFR-D-070`;
5. tuning evidence, отделённое от untouched final evaluation evidence;
6. segment coverage, fairness/proxy and legal review по применимым `XFR-D-064`/`XFR-D-068` без invented thresholds;
7. source expiry/revocation/correction-history treatment и applicable post-freeze discipline по `XFR-D-071`;
8. отдельное reporting для каждого status/scope и counter-evidence, которое не скрывается aggregate result;
9. double-counting analysis для Evidence Confidence, Feature Fit, overall Confidence Score и downstream Risk/Qualification use;
10. reproducibility evidence и immutable links на freeze-time/post-execution artifacts;
11. explicit synthetic-only versus production-data applicability statement;
12. documented review of the same candidate/evidence package by the full owner/approver set.

Перечень утверждает только категории evidence. Он не утверждает exact dataset, labels, procedure, metrics, statistical contents, thresholds, results, sufficiency verdict или production applicability. Missing applicable prerequisite блокирует approval fail closed.

### 3.7. Calibration and non-compensation boundary

1. Mapping quality нельзя доказывать одним aggregate metric или average across statuses/features/sources/segments.
2. Успех одного status, feature, source, segment или metric не компенсирует failure/insufficiency другого applicable slice.
3. Tuning и final evidence должны быть разделены; final evidence не используется для выбора mapping, пересмотра numeric values или post-hoc category grouping.
4. Uncertainty, unsupported scope, missing strata and unresolved dependencies сообщаются отдельно и не превращаются в convenient default.
5. Fairness/proxy/legal review не заменяется aggregate performance, а успешный fairness check не утверждает calibration accuracy.
6. Synthetic-only evidence может поддерживать только явно ограниченный synthetic claim; оно не создаёт production mapping, production-data approval или production-readiness claim.
7. Evaluation result не может автоматически менять mapping, Feature Fit, weights, overall Confidence, Risk/Qualification rules, model, policy, routing, runtime or gate state.

### 3.8. Independent decisions preserved

1. `XFR-D-019` не решает `XFR-D-M6`: joint Feature Fit/Evidence Confidence calibration остаётся отдельным merged decision.
2. Feature Schema open decision №1 сохраняет отдельный `required_evidence_level`; evidence sufficiency не сворачивается в numeric mapping.
3. `XFR-D-057`–`XFR-D-060` сохраняют label/source eligibility, adjudication, split/group isolation and correction-history boundaries.
4. `XFR-D-062` сохраняет dataset size/allocation/seed contents; `XFR-D-063` — numeric metric targets/calibration contents; `XFR-D-064` — segment coverage; `XFR-D-068` — fairness/proxy/legal standards; `XFR-D-070` — threshold-search statistical comparison; `XFR-D-071` — post-freeze expiry/revocation/correction handling.
5. Scoring, Feature, Risk and Qualification Policies сохраняют собственные authority, values and approvals.
6. Evidence Confidence не создаёт lawful basis, processing permission, source authority, reviewer appointment/RBAC, runtime route, reason code or safe-presentation permission.
7. Data Contracts, API/DB/schema/events/storage, Controlled Artifact Manifest, monitoring, rollback, runtime and implementation остаются отдельными artifacts/approvals.

### 3.9. Partial, never fully resolved

`XFR-D-019` получает `PARTIALLY_RESOLVED_BOUNDARY`: roles, exact enum preservation, semantic separation, no hidden hierarchy/defaults, fail-closed affected-use handling, version/hash discipline, qualitative evidence prerequisites, non-compensation, tuning/final and synthetic/production separation утверждены.

Exact mapping/calibration и все numeric, dataset, statistical, policy, schema, carrier, runtime, production and implementation contents остаются `OPEN`. Этот record нельзя цитировать как полное решение Scoring Policy §12 row 6, Feature Schema open decision №1, `XFR-D-M6` или как утверждение готового scoring behavior.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical evidence status | Architecture §13 | Exact seven-value enum preserved | No numeric order or mapping |
| Evidence Confidence mapping | `XFR-D-019` governance owner `Chief AI Architect + AI` | Qualitative governance/evidence boundary | Exact function/table and all numeric values |
| Scoring Policy artifact | Architecture §52: `Chief AI Architect + PRODUCT` | No artifact approval | Exact policy version/hash and approval |
| Mandatory approval | `PRODUCT + LEGAL + DEVELOPMENT` | Required participation | Actual future approval verdict |
| Evidence procedure | `AI + DEVELOPMENT` | Preparation responsibility, no unilateral authority | Exact dataset/method/evidence and sufficiency |
| Required evidence level | Feature Schema open decision №1 | Explicit separation | Per-feature/source eligibility rule |
| Joint Fit/Confidence calibration | `XFR-D-M6` | Explicit separation | Entire substantive merged decision |
| Runtime/production | Separate controlled artifacts and gates | No authorization | Schema, carrier, monitoring, rollback, implementation and production use |

## 5. Что остаётся `OPEN`

- exact `evidence_status → Evidence Confidence` table, function or other mapping;
- every numeric value, range, direction, ordering, hierarchy, monotonicity, default and fallback;
- combinations with source type, provenance, authority, freshness, conflict, expiry, revocation and use purpose;
- per-feature/source `required_evidence_level` and eligibility semantics;
- `XFR-D-M6` Feature Fit/Evidence Confidence joint calibration;
- normalization, denominator, zero-active-weight and double-counting prevention;
- metric definitions, targets, thresholds, tolerances, objective/loss, uncertainty and statistical tests;
- dataset, sample size/allocation/seed, split, labels, adjudication, correction manifest and frozen manifest;
- actual evaluation run, results, sufficiency verdict and production-data applicability;
- representation, precision, rounding, serialization and canonical carrier;
- schema/API/DB/event/storage/runtime behavior, monitoring, rollback and implementation;
- Scoring Policy, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy and manifest approval;
- all governance gates.

## 6. Rationale

Architecture требует учитывать надёжность конкретного feature/value как отдельный множитель, но не задаёт числового преобразования из категориального статуса доказательства. Поэтому безопасно разрешить только authority и qualitative review boundary. Это предотвращает скрытое превращение enum order, validation success или implementation default в числовую policy.

Разделение Evidence Confidence, Feature Fit, overall Confidence Score, evidence sufficiency, Risk and Qualification защищает от двойного наказания и от переноса authority между слоями. Frozen, versioned and independently reviewed evidence необходимо до numeric approval, но наличие evidence само по себе не является approval.

## 7. Adversarial cases

1. **Enum перечислен в порядке от слабого к сильному.** Запрещено: Architecture задаёт значения, но не numeric hierarchy или monotonic order.
2. **`CONTENT_VERIFIED` получает `1`, а `UNVERIFIED` — `0` как очевидный default.** Запрещено: все numeric values остаются `OPEN`.
3. **`input_validated = true` повышает status или Confidence.** Запрещено: техническая validation не является evidence promotion.
4. **Missing/conflicting/stale value превращают в zero Feature Fit.** Запрещено: affected use fail closed; negative business fact не создаётся.
5. **Low Evidence Confidence делает пару `INELIGIBLE`.** Запрещено: eligibility/Qualification принадлежат отдельным rules and approvals.
6. **`required_evidence_level` используют как numeric Confidence.** Запрещено: sufficiency и scoring multiplier — разные слои.
7. **Один и тот же недостаток дважды снижает Dimension Score и overall Confidence Score без explicit analysis.** Запрещено: точный double-counting prevention остаётся `OPEN` и требует evidence.
8. **`XFR-D-M6` считают закрытым вместе с `XFR-D-019`.** Запрещено: joint Fit/Confidence calibration остаётся независимым decision.
9. **AI output или высокий model confidence подтверждает source/content.** Запрещено: AI inference не повышает canonical evidence status.
10. **`revoked` добавляют как восьмой enum status.** Запрещено: revocation handling не изменяет exact seven-value enum этим record'ом.
11. **Aggregate metric скрывает провал отдельного status/source/segment.** Запрещено: applicable slices сообщаются отдельно и не компенсируются.
12. **Synthetic-only calibration объявляют production mapping.** Запрещено: production-data applicability и readiness остаются `OPEN`.
13. **Успешный evaluation run автоматически обновляет policy/runtime.** Запрещено: требуется отдельное human-controlled approval/release.
14. **Chief AI Architect и AI утверждают mapping без PRODUCT/LEGAL/DEVELOPMENT.** Approval неполон и недействителен.
15. **AI + DEVELOPMENT подготовили evidence и считают mapping утверждённым.** Запрещено: evidence-procedure ownership не равно governance approval.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §7, §12 row 6 and readiness summary may receive the qualitative owner/evidence-boundary cross-reference without numeric mapping;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay for `XFR-D-019`;
- Feature Schema, Evaluation Plan or other artifacts only through separately scoped, separately approved future work if an exact need is established;
- future numeric `XFR-D-019`, `XFR-D-M6`, mapping/calibration procedure, dataset/manifest and runtime artifacts — separate downstream passes.

Ни один future sync не должен интерпретировать этот record как numeric mapping, policy, dataset/run, production-data, runtime or implementation approval.

## 9. Change control

Изменение governance owner, mandatory approvers, canonical enum preservation, semantic separation, fail-closed handling или minimum evidence prerequisites требует нового versioned `XFR-D-019` record, согласованного `Chief AI Architect + AI + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашивается current mapping/value/range/order, **then** значение отсутствует и `XFR-D-019` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** canonical status list, **when** проверяется identity, **then** присутствуют ровно семь значений из Architecture §13 без добавления, переименования или numeric hierarchy.
3. **Given** future mapping candidate, **when** проверяется authority, **then** governance owner — `Chief AI Architect + AI`, mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`, Scoring Policy artifact owner отдельно `Chief AI Architect + PRODUCT`, а evidence preparation `AI + DEVELOPMENT` не заменяет approval.
4. **Given** `input_validated`, AI inference or technical success, **when** определяется evidence status/Confidence, **then** promotion или numeric default не происходит.
5. **Given** missing/unknown/unmapped/conflicting/stale/rejected/review-required/expired/revoked condition, **when** mapping не утверждён, **then** affected use блокируется без coercion в zero, negative fact, failed fit, eligibility/routing/reason/display decision.
6. **Given** `required_evidence_level`, Feature Fit, overall Confidence Score, Risk or Qualification result, **when** применяется этот record, **then** каждый слой остаётся отдельным и не подменяется Evidence Confidence.
7. **Given** `XFR-D-M6` или независимые `XFR-D-057`–`060`/`062`/`063`/`064`/`068`/`070`/`071`, **when** цитируется `XFR-D-019`, **then** ни одна зависимость не считается автоматически resolved.
8. **Given** candidate evidence package, **when** отсутствует version/hash binding, eligible frozen evidence, tuning/final isolation, applicable uncertainty/fairness/legal review или full approval set, **then** numeric approval блокируется fail closed.
9. **Given** aggregate success, **when** отдельный applicable status/source/feature/segment недостаточен, **then** aggregate не компенсирует insufficiency.
10. **Given** synthetic-only evidence, **when** формулируется production mapping/readiness claim, **then** claim запрещён.
11. **Given** evaluation result, **when** предлагается автоматическое изменение model/policy/runtime/routing, **then** изменение запрещено и требуется separate controlled approval/release.
12. **Given** этот record, **when** проверяются Scoring/Feature/Evaluation/Risk/Qualification Policy, dataset/run, production-data use, schema/carrier/runtime, implementation and gates, **then** они не утверждены и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-019 GOVERNANCE-OWNER, SEMANTIC-SEPARATION AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — EXACT EVIDENCE-STATUS → EVIDENCE CONFIDENCE MAPPING, ALL NUMERIC VALUES, CALIBRATION, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
