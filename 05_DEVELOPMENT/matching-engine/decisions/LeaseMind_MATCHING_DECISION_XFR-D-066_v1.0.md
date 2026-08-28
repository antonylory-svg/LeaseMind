# LeaseMind Matching Decision Record — XFR-D-066

**Decision ID:** `XFR-D-066`

**Название:** Exact cross-functional approval flow for `MATCHING_EVALUATION_PLAN`

**Версия:** 1.0

**Дата решения:** 2026-08-28

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY`

**Статус:** `APPROVED CROSS-FUNCTIONAL APPROVAL PROCEDURE — ACTUAL EVALUATION PLAN APPROVAL, DATASET MANIFEST AND CONTROLLED ARTIFACT MANIFEST ENTRY REMAIN PENDING`

**Decision authority:** human project-governance confirmation in the 2026-08-28 working session

**Repository baseline:** `84265269d2ed54e1d483b1da140b898ed823f259`

**Scope:** procedural governance for approval of the `MATCHING_EVALUATION_PLAN` artifact only; does not approve the current Evaluation Plan, any dataset/dataset manifest, evidence package, evaluation run, production-data use, policy value, model release, Controlled Artifact Manifest entry, runtime/API/DB/schema/event design, implementation or governance gate.

**Approval-flow governance owner:** `Chief AI Architect + AI + DEVELOPMENT` — human-approved assignment aligned with `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §11 decision row №12. Это governance role для процедуры approval, не artifact-owner строка Controlled Artifact Manifest.

**Artifact owner:** `AI + DEVELOPMENT` — `SOURCE_NORMATIVE`, Architecture §52 row for `MATCHING_EVALUATION_PLAN` and dataset manifest. Оба owner'а совместно готовят и подписывают artifact-readiness package; ни один не получает unilateral final approval.

**Approval coordinator and mandatory independent architecture reviewer:** `Chief AI Architect`.

**Mandatory domain approvers for current Evaluation Plan v0.1:** `PRODUCT + LEGAL`, поскольку текущий artifact затрагивает labels, segments, fairness, privacy и policy boundaries. Для будущей candidate version роль может быть исключена только собственным role-signed `NOT_APPLICABLE` determination на том же frozen hash с explicit scope/rationale; artifact owner или coordinator не может объявить другую роль неприменимой за неё. При сомнении роль считается applicable и approval блокируется fail closed.

**Actual artifact approval set for current v0.1:** `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL`, все decisions относятся к одному frozen semantic version и SHA-256. Это не утверждает текущий v0.1: record разрешает flow, а не выполняет его.

**Depends on:** actual approval возможен только после разрешения applicable substantive dependencies candidate version, включая Evaluation cluster `XFR-D-057`–`XFR-D-071`, Architecture §37 вопрос №10 и любые связанные policy/data/privacy/reproducibility blockers. `XFR-D-027` (Architecture §30.3 steps 1–3 roles), `XFR-D-067` (Data Governance authority model), `XFR-D-084` (Safe Presentation artifact approval/change control) и approval flows других artifacts остаются независимыми и не подменяются.

---

## 1. Вопрос

Каков exact cross-functional approval flow для самого `MATCHING_EVALUATION_PLAN` artifact, чтобы его owner, review, domain approval и Controlled Artifact Manifest evidence были разделены, относились к одной immutable candidate version и не превращали procedure decision в фактическое approval документа или gate?

## 2. Source/status discipline

Architecture §52 `SOURCE_NORMATIVE` назначает owner `MATCHING_EVALUATION_PLAN` и dataset manifest как `AI + DEVELOPMENT`, делает их Model release blocker и требует для каждого controlled artifact `artifact_id`, owner, status, semantic version, SHA-256, approval date/time, approver IDs, immutable repository link и supersedes reference. Architecture §36.2 п.2 требует approved `MATCHING_EVALUATION_PLAN`, а п.5 — Controlled Artifact Manifest с owner/version/hash/approval date/immutable link; это необходимые, но не достаточные условия `IMPLEMENTATION_READINESS_GATE`.

Architecture §30.3 `SOURCE_NORMATIVE` требует для новой platform-level version review Chief AI Architect (п.6) и согласование затронутых PRODUCT/LEGAL правил (п.7). Этот источник задаёт границы review/affected-rule approval, но не полный artifact-approval workflow.

Evaluation Plan front matter называет owners `AI + DEVELOPMENT`, coordinator `Chief AI Architect` и требует PRODUCT + LEGAL review для затрагиваемых label/segment/fairness/privacy/policy-boundary решений. Его §11 row №12 предлагает `Chief AI Architect + AI + DEVELOPMENT` как owner exact approval-flow question; это `DECISION_CANDIDATE_FOR_REVIEW`, не Architecture-established artifact-owner replacement.

Этот record human-approved разрешает governance procedure ниже. Он не меняет `Proposal for cross-functional review` status Evaluation Plan и не создаёт manifest entry.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Artifact owner — `AI + DEVELOPMENT`.** Готовит candidate artifact, dependency matrix, evidence references и readiness attestation.
2. **Approval-flow governance owner — `Chief AI Architect + AI + DEVELOPMENT`.** Владеет целостностью процедуры, но не выдаёт approval без domain decisions.
3. **Chief AI Architect — independent architecture reviewer и approval coordinator.** Не подменяет owner readiness и PRODUCT/LEGAL determinations.
4. **PRODUCT — domain approver** product meaning, outcomes/labels, segment applicability и policy-boundary impacts.
5. **LEGAL — domain approver** lawful basis, privacy, protected/proxy/fairness, data-use и rights-affecting boundaries.
6. **Data Governance/SECURITY/other evidence providers** могут поставлять required evidence в пределах своих authority records, но не становятся artifact approver автоматически и не заменяют `LEGAL`/`PRODUCT`.
7. Ни одна роль не может подписать или объявить `NOT_APPLICABLE` за другую роль. Ни technical writer, filename, Git author, service, CI result, manifest row, AI output или coordinator не являются substitute approval authority.

### 3.2. Frozen approval package

До начала approval flow `AI + DEVELOPMENT` совместно формируют frozen package, включающий как минимум:

1. canonical `artifact_id = MATCHING_EVALUATION_PLAN`;
2. semantic version и exact SHA-256 candidate artifact;
3. immutable repository link на exact version/hash;
4. supersedes reference либо explicit first-version statement;
5. scope/impact matrix по PRODUCT и LEGAL domains;
6. полный список applicable open/closed dependencies и evidence references;
7. explicit separation Evaluation Plan от dataset/dataset manifest, production operational artifact и policy-value artifacts;
8. change summary и unresolved-blocker statement;
9. proposed approval date/time только как future field — не backdated и не заполненный до завершения approvals;
10. approver role set и proposed named-identity/RBAC references, когда они будут operationally approved.

Missing version/hash/link/supersedes/scope/dependency evidence, hash mismatch или ambiguous applicability блокирует flow fail closed. Package не становится approved из-за полноты формы.

### 3.3. Exact approval sequence

1. **Owner readiness.** `AI` и `DEVELOPMENT` независимо подтверждают один и тот же frozen version/hash: AI — evaluation/metric/evidence semantics в пределах authority; DEVELOPMENT — reproducibility, version/hash/link integrity и technical feasibility. Обе owner attestations обязательны и не являются final approval.
2. **Chief AI Architect review.** После двух owner attestations Chief AI Architect проверяет architecture alignment, dependency completeness, separation of concerns и absence of silent policy/runtime approval. Blocking finding возвращает package owner'ам; review не считается пройденным.
3. **PRODUCT determination.** PRODUCT на том же version/hash выдаёт approval, rejection/blocking finding либо собственный signed `NOT_APPLICABLE` с exact scope/rationale. Для текущего v0.1 `NOT_APPLICABLE` недопустим, поскольку artifact затрагивает product meanings, labels, outcomes, segments и policy boundaries.
4. **LEGAL determination.** LEGAL на том же version/hash выдаёт approval, rejection/blocking finding либо собственный signed `NOT_APPLICABLE` с exact scope/rationale. Для текущего v0.1 `NOT_APPLICABLE` недопустим, поскольку artifact затрагивает data use, privacy, labels, segments, protected/proxy/fairness и production-data boundaries.
5. **Same-hash finalization.** Approval существует только если все required roles подписали exact same semantic version/SHA-256, отсутствуют unresolved blocking findings и applicable substantive dependencies candidate version разрешены. Отсутствие, rejection, ambiguous/expired/revoked decision или different-hash signature блокирует finalization.
6. **Separate actual approval record.** Результат фиксируется отдельным immutable artifact-approval record с exact evidence references. Этот `XFR-D-066 v1.0` не является таким record'ом.
7. **Manifest entry last.** Только после actual approval record Controlled Artifact Manifest получает/обновляет entry `MATCHING_EVALUATION_PLAN` с полным Architecture §52 field set. Manifest entry отражает состоявшийся approval и не создаёт его сама.

Sequence обязателен на уровне dependency order: owner readiness предшествует independent/domain review; actual approval record предшествует manifest entry. PRODUCT и LEGAL review после Chief review могут выполняться независимо друг от друга, но finalization требует завершения обеих applicable branches на том же hash.

### 3.4. Change and invalidation rule

1. Любое изменение candidate bytes меняет SHA-256 и прекращает текущий approval attempt.
2. Новая candidate version получает новый frozen package; прежние approvals не переносятся на другой hash.
3. Previous approved artifact/approval evidence остаются immutable; supersession не переписывает историю.
4. Изменение scope/impact после domain determination требует повторной applicable role review даже если textual artifact hash каким-либо образом не изменился; inconsistent evidence блокирует flow.
5. Missing, unsigned, expired, revoked или hash-mismatched artifact/approval/manifest evidence сохраняет соответствующий gate `BLOCKED`, как требует Architecture §52.1.

### 3.5. `NOT_APPLICABLE` guard

1. `NOT_APPLICABLE` здесь — governance determination phrase, не runtime enum, API/DB field или новый canonical manifest status.
2. Его выдаёт только сама потенциально затронутая роль (`PRODUCT` или `LEGAL`) на exact frozen hash.
3. Determination содержит reviewed scope, rationale, reviewer identity/authority evidence, timestamp и immutable reference.
4. Ambiguous, incomplete или cross-domain impact нельзя объявить неприменимым; роль считается required fail closed.
5. Artifact owner, Chief AI Architect, AI-generated classification или implementation heuristic не может освободить PRODUCT/LEGAL от review.
6. Текущий Evaluation Plan v0.1 требует обе роли; этот guard предназначен только для future version, которая доказуемо не затрагивает domain role.

### 3.6. Approval effect boundary

Даже future actual approval `MATCHING_EVALUATION_PLAN`:

- утверждает только exact artifact version/hash и его documented procedure scope;
- не утверждает автоматически dataset или dataset manifest;
- не разрешает production-data use, training, evaluation run или model release;
- не утверждает Scoring/Risk/Qualification/Feature/Safe-Presentation Policy values;
- не создаёт production monitoring/SLO operational artifact;
- не закрывает содержательные XFR decisions только потому, что они процитированы;
- выполняет только собственную часть Architecture §36.2 conditions 2/5 после valid manifest entry; остальные conditions и gates проверяются независимо.

## 4. Layer/boundary

| Слой | Authority | Что разрешено этим record | Что остаётся pending |
|---|---|---|---|
| Artifact ownership | Architecture §52: `AI + DEVELOPMENT` | Не изменено; применено в flow | Named identities/RBAC, actual owner attestations |
| Approval-flow governance | `Chief AI Architect + AI + DEVELOPMENT` | Procedure ownership разрешено | Actual execution/evidence |
| Independent architecture review | Chief AI Architect | Role/order boundary разрешена | Actual signed review |
| PRODUCT/LEGAL domain approval | Evaluation Plan front matter + Architecture §30.3 п.7 + этот record | Same-hash approve/reject/role-signed N/A flow разрешён | Actual determinations; v0.1 требует обе роли |
| Actual artifact approval | Full applicable approval set | Procedure определена | Отдельный immutable approval record; current Plan remains Proposal |
| Controlled Artifact Manifest | Architecture §36.2/§52 | Entry-last/evidence-not-authority boundary разрешена | `MATCHING_EVALUATION_PLAN` entry не создаётся этим record |
| Dataset/dataset manifest | Architecture §52 question №10 row | Explicitly separated | Отдельные data/evidence approvals |
| Gate/model release/runtime | Architecture §36 | No automatic effect | Все условия и gates независимо `BLOCKED` |

## 5. Что остаётся `OPEN`/pending

- actual approval текущего `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md`;
- closure/approved disposition всех applicable substantive dependencies и Architecture §37 вопроса №10;
- фактические owner/reviewer/domain attestations на frozen hash;
- named approver appointments, authority evidence, RBAC и conflict-of-interest controls;
- signature/identity carrier, exact approval-record schema, API/DB/event representation и retention;
- Controlled Artifact Manifest entry и exact operational mechanism его signing/update/revocation;
- dataset, dataset manifest, allocation, evidence package и evaluation run;
- production-data/privacy/data-localization approvals;
- model release, production operational artifacts, runtime и implementation;
- approval/change-control flows других controlled artifacts, включая `XFR-D-084`;
- все independently governed exact/numeric parts `XFR-D-057`–`XFR-D-065`, `XFR-D-067`–`XFR-D-071` и merged IDs applicable to candidate content.

## 6. Rationale

Architecture уже задаёт owner, manifest evidence и gate effect, но без exact cross-functional sequence возникает риск circular approval: manifest row может быть ошибочно принят за источник approval, coordinator — за unilateral approver, а domain review — за необязательный comment. Frozen same-hash package, separate role attestations и manifest-entry-last устраняют этот круг.

Role-signed `NOT_APPLICABLE` guard не позволяет artifact owner самостоятельно исключать PRODUCT/LEGAL, но не превращает любую будущую техническую правку в бессодержательный повтор domain approval. Для текущего v0.1 обе роли безусловно required из-за фактического scope.

## 7. Adversarial cases

1. **Manifest row first.** Pending artifact заносится в manifest как approved, а затем собираются подписи. Запрещено: manifest entry только после separate actual approval record.
2. **Different hashes.** AI подписал один hash, DEVELOPMENT/LEGAL — другой. Approval отсутствует; signatures не агрегируются между versions.
3. **Coordinator self-approval.** Chief AI Architect объявляет artifact approved без owner/domain decisions. Запрещено.
4. **Owner exempts LEGAL.** AI/DEVELOPMENT ставит LEGAL `NOT_APPLICABLE`. Запрещено: determination может подписать только LEGAL; для current v0.1 он недопустим.
5. **CI = approval.** Green contract/evaluation run считается approval artifact. Запрещено: CI — evidence, не authority.
6. **Plan approval = dataset approval.** Approved procedure используется как разрешение dataset/production data. Запрещено: dataset manifest и data authority отдельны.
7. **Citation closes dependency.** Open XFR decision, упомянутое в Plan, считается approved вместе с artifact. Запрещено.
8. **Silent edit after signatures.** Bytes меняются без new hash/review. Approval attempt прекращается; previous evidence не переносится.
9. **One gate opens all.** Valid Plan approval/manifest entry переводит Implementation/Synthetic/Production gates. Запрещено: это только часть conditions 2/5, остальные независимы.
10. **New runtime status by governance prose.** `NOT_APPLICABLE` реализуется как новый API/DB/manifest enum без отдельного design decision. Запрещено этим record'ом.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §11 row №12 и final readiness summary должны отразить resolved procedural boundary, сохраняя actual Plan approval и manifest entry pending;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `EP-12 → XFR-D-066` без изменения canonical identity/counts и исторических overlays;
- Controlled Artifact Manifest — не изменяется этим record или будущим status sync; entry появляется только после separate actual approval record.

## 9. Change control

Изменение role set, same-hash rule, sequence, `NOT_APPLICABLE` authority, manifest-entry-last или approval-effect boundary требует нового versioned decision record с согласованием `Chief AI Architect + AI + DEVELOPMENT + PRODUCT + LEGAL` и ссылкой `supersedes` на эту запись.

Operational carrier, named appointments/RBAC и exact manifest/approval-record schema разрешаются отдельными records; они не добавляются silent edit в v1.0.

## 10. Gate impact

`NONE`. Current Evaluation Plan остаётся `Proposal for cross-functional review`; `MATCHING_EVALUATION_PLAN` manifest entry не создаётся. Architecture §36.2 conditions 2/5 не выполнены этим record.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** approval flow, **when** определяется artifact owner, **then** это `AI + DEVELOPMENT` по Architecture §52, а Chief AI Architect остаётся independent reviewer/coordinator, не artifact owner replacement.
2. **Given** current v0.1, **when** формируется approval set, **then** required roles — `AI + DEVELOPMENT + Chief AI Architect + PRODUCT + LEGAL` на одном semantic version/SHA-256.
3. **Given** future candidate role applicability, **when** PRODUCT/LEGAL не затронуты, **then** только сама роль может подписать `NOT_APPLICABLE` с exact scope/rationale; ambiguity требует review fail closed.
4. **Given** missing/hash-mismatched/revoked/expired decision, **when** выполняется finalization, **then** artifact не approved.
5. **Given** изменение bytes после любой signature, **when** hash изменён, **then** approval attempt начинается заново и signatures не переносятся.
6. **Given** полный approval set, **when** нет отдельного actual approval record, **then** manifest entry не создаётся.
7. **Given** manifest entry, **when** проверяется его authority, **then** он отражает prior approval и не создаёт approval сам.
8. **Given** approved Evaluation Plan artifact, **when** оцениваются dataset/data use/policy/model release, **then** ни один соседний artifact/action не approved автоматически.
9. **Given** этот procedural record, **when** проверяется current Evaluation Plan, **then** он остаётся Proposal и его manifest entry pending.
10. **Given** этот record, **when** проверяются Architecture §36.2 conditions 2/5, **then** они не считаются выполненными.
11. **Given** governance gates, **when** фиксируется effect, **then** все три остаются `BLOCKED`.

## 12. Итог

`XFR-D-066 CROSS-FUNCTIONAL APPROVAL PROCEDURE APPROVED — ACTUAL EVALUATION PLAN APPROVAL, DATASET MANIFEST, CONTROLLED ARTIFACT MANIFEST ENTRY, RUNTIME AND GATES REMAIN PENDING/BLOCKED`
