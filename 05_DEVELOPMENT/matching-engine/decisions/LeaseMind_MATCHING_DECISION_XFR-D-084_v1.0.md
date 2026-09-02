# LeaseMind Matching Decision Record — XFR-D-084

**Decision ID:** `XFR-D-084`

**Название:** Exact cross-functional approval and change-control flow for `SAFE_PRESENTATION_POLICY`

**Версия:** 1.0

**Дата решения:** 2026-09-02

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY`

**Статус:** `APPROVED CROSS-FUNCTIONAL APPROVAL/CHANGE-CONTROL PROCEDURE — ACTUAL SAFE PRESENTATION POLICY APPROVAL AND CONTROLLED ARTIFACT MANIFEST ENTRY REMAIN PENDING`

**Decision authority:** human project-governance confirmation in the 2026-09-02 working session

**Repository baseline:** `440dddba690be35e062606029e6afeb138d92bb0`

**Scope:** procedural governance for approval and change control of the `SAFE_PRESENTATION_POLICY` artifact only. Этот record не утверждает текущий `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md`, field allowlist, object-type registry, transformation, wording, localization, audience/purpose model, algorithm, numeric value, evidence package/result, Data Contracts carrier, production data, runtime/API/DB/schema/event design, implementation, Controlled Artifact Manifest entry или governance gate.

**Artifact and approval-flow governance owner:** `PRODUCT + LEGAL` — `SOURCE_NORMATIVE` artifact owner from Architecture §52 and decision owner from Architecture §37 question №6. Обе роли совместно владеют readiness package и процедурой, но ни одна не получает unilateral final approval.

**Approval coordinator and mandatory independent architecture reviewer:** `Chief AI Architect` — координирует один frozen package и проверяет architecture alignment; не заменяет `PRODUCT`, `LEGAL`, `AI` или `DEVELOPMENT` determinations.

**Mandatory technical approvers for current Safe Presentation Policy v0.1:** `AI + DEVELOPMENT`. `AI` проверяет matching/safety/evidence semantics в пределах своей authority; `DEVELOPMENT` — техническую реализуемость, contract/carrier boundaries и отсутствие hidden runtime approval. Ни одна из ролей не заменяет artifact owners.

**Evidence-procedure owner:** `AI + DEVELOPMENT` по human-approved `XFR-D-083 v1.0`; evidence readiness является входом в approval flow, а не unilateral artifact approval и не заменой `PRODUCT + LEGAL` authority.

**Actual artifact approval set for current v0.1:** `PRODUCT + LEGAL + Chief AI Architect + AI + DEVELOPMENT`, все decisions относятся к одному frozen semantic version и SHA-256. Этот record разрешает flow, но не выполняет его.

**Depends on:** actual approval возможен только после разрешения всех applicable substantive dependencies exact candidate version. `XFR-D-072`–`XFR-D-083`, `XFR-D-M3`, Architecture §37 question №6 и связанные policy/data/privacy/security/evidence/carrier blockers сохраняют собственные status и authority; ни один из них не закрывается фактом существования этого record.

---

## 1. Вопрос

Каков exact cross-functional approval/change-control flow для самого `SAFE_PRESENTATION_POLICY`, чтобы owner readiness, architecture review, technical determinations, evidence, actual approval record и Controlled Artifact Manifest оставались раздельными, относились к одному immutable candidate hash и не превращали procedural decision в approval Policy, runtime или gate?

## 2. Source/status discipline

Architecture §52 `SOURCE_NORMATIVE` назначает `PRODUCT + LEGAL` owner'ами `SAFE_PRESENTATION_POLICY`, требует для controlled artifact `artifact_id`, owner, status, semantic version, SHA-256, approval date/time, approver IDs, immutable repository link и supersedes reference и определяет Policy как Reveal blocker.

Architecture §37 question №6 также назначает `PRODUCT + LEGAL` owner'ами вопроса о допустимых безопасных полях. Architecture §36.2 требует approved `SAFE_PRESENTATION_POLICY` и valid Controlled Artifact Manifest entry как отдельные необходимые, но недостаточные условия `IMPLEMENTATION_READINESS_GATE`.

Safe Presentation Policy §15 row №14 предлагает `PRODUCT + LEGAL` и coordination `Chief AI Architect`, но до этого record это оставалось candidate. Human-approved `XFR-D-072`–`XFR-D-083` разрешают только собственные governance/evidence boundaries и прямо сохраняют actual Policy approval independently `OPEN`.

`XFR-D-066 v1.0` используется только как procedural precedent для frozen same-hash review, separate actual approval record и manifest-entry-last. Он не является authority для `SAFE_PRESENTATION_POLICY` и не утверждает этот flow автоматически.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Artifact and approval-flow governance owner — `PRODUCT + LEGAL`.** Совместно формируют candidate artifact, scope/impact matrix, dependency set и readiness package. PRODUCT отвечает за product meaning, user-facing semantics и applicability; LEGAL — lawful basis, privacy, re-identification/proxy risk и rights-affecting boundaries.
2. **Chief AI Architect — approval coordinator и mandatory independent architecture reviewer.** Проверяет architecture alignment, separation of concerns, dependency completeness и отсутствие silent policy/runtime/gate approval.
3. **AI — mandatory technical approver текущей v0.1.** Проверяет matching/safety/combination-risk/evidence semantics, но не получает право единолично утверждать Policy или legal/product meaning.
4. **DEVELOPMENT — mandatory technical approver текущей v0.1.** Проверяет feasibility, contract/carrier/cache/change boundaries и отсутствие hidden implementation authorization, но не становится artifact owner.
5. **AI + DEVELOPMENT как evidence-procedure owner** поставляют и проверяют evidence readiness по `XFR-D-083`; evidence PASS, CI, audit или техническая готовность не являются artifact approval.
6. **SECURITY/Data Governance/иные evidence providers** сохраняют authority только над собственными evidence/determinations и не становятся artifact approvers автоматически.
7. Ни одна роль, Git author, document editor, AI output, PR status, merge, CI result, filename, decision record или manifest row не может заменить required approval authority другой роли.

### 3.2. Frozen approval package

До начала approval flow `PRODUCT + LEGAL` совместно формируют один frozen package, включающий как минимум:

1. canonical `artifact_id = SAFE_PRESENTATION_POLICY`;
2. semantic version и exact SHA-256 candidate artifact;
3. immutable repository link на exact version/hash;
4. supersedes reference либо explicit first-version statement;
5. change summary и exact review scope;
6. PRODUCT/LEGAL/AI/DEVELOPMENT impact matrix;
7. полный список applicable resolved/open dependencies, включая status `XFR-D-072`–`XFR-D-083` и `XFR-D-M3`;
8. exact references на required evidence и их version/hash/status без утверждения самих evidence results;
9. explicit separation Policy от Data Contracts carrier, dataset/production-data authority, runtime/implementation и gate decisions;
10. unresolved-blocker statement;
11. proposed approver role set и named-identity/RBAC references, когда они будут operationally approved;
12. approval date/time только как future field, не backdated и не заполненный до завершения approvals.

Missing version/hash/link/supersedes/scope/dependency/evidence reference, hash mismatch, stale/conflicting evidence или ambiguous applicability блокирует flow fail closed. Полнота формы сама по себе не создаёт approval.

### 3.3. Exact approval sequence

1. **Owner readiness.** `PRODUCT` и `LEGAL` независимо подтверждают exact same frozen semantic version/SHA-256 в пределах своей authority. Обе owner attestations обязательны и не являются final approval.
2. **Independent architecture review.** После owner readiness `Chief AI Architect` проверяет тот же hash. Любой blocking finding возвращает package owner'ам и прекращает finalization до новой review.
3. **AI determination.** `AI` на том же hash выдаёт approval либо rejection/blocking finding по applicable technical/safety/evidence scope.
4. **DEVELOPMENT determination.** `DEVELOPMENT` на том же hash выдаёт approval либо rejection/blocking finding по feasibility/contract/carrier/change scope.
5. **Same-hash finalization.** Approval существует только если все пять required roles завершили собственные decisions для exact same version/SHA-256, отсутствуют unresolved blocking findings и applicable substantive dependencies candidate version имеют approved disposition.
6. **Separate actual approval record.** Результат фиксируется отдельным immutable artifact-approval record с exact role decisions, identities/authority evidence, timestamps и evidence references. `XFR-D-084 v1.0` таким actual approval record не является.
7. **Manifest entry last.** Только после separate actual approval record Controlled Artifact Manifest получает/обновляет `SAFE_PRESENTATION_POLICY` entry с полным Architecture §52 field set. Manifest отражает состоявшийся approval и не создаёт его сам.

Dependency order обязателен: owner readiness предшествует independent/technical review; actual approval record предшествует manifest entry. Параллельная работа reviewers допустима только после frozen package, но finalization требует их решений на одном hash.

### 3.4. Change, supersession and invalidation

1. Любое изменение candidate bytes меняет SHA-256 и прекращает текущий approval attempt.
2. Новая candidate version получает новый frozen package; signatures, PASS и determinations не переносятся на другой hash.
3. Previous approved artifact и approval evidence остаются immutable; supersession не переписывает историю.
4. Изменение declared scope/impact/evidence applicability требует повторной review затронутых ролей; inconsistent package evidence блокирует flow.
5. Missing, unsigned, expired, revoked или hash-mismatched artifact/approval/manifest evidence сохраняет соответствующий gate `BLOCKED` по Architecture §52.1.
6. Cache expiry, carrier migration, localization update, evidence rerun, deployment или operational toggle не изменяет approval status Policy без нового applicable approval/change-control flow.

### 3.5. `NOT_APPLICABLE` guard

1. `NOT_APPLICABLE` — governance determination phrase, не runtime enum, API/DB field или новый manifest status.
2. Source-normative owners `PRODUCT + LEGAL` обязательны для самого `SAFE_PRESENTATION_POLICY` и не исключаются из artifact approval flow.
3. Потенциально неприменимая technical role может подписать `NOT_APPLICABLE` только сама за себя на exact frozen hash с reviewed scope, rationale, identity/authority evidence, timestamp и immutable reference.
4. Для current v0.1 `AI` и `DEVELOPMENT` mandatory: Policy затрагивает algorithm/evidence semantics и future carrier/runtime feasibility, поэтому `NOT_APPLICABLE` для них недопустим.
5. Ambiguous, incomplete или cross-domain impact считается applicable fail closed. Owner, coordinator, другая role, AI-generated classification или implementation heuristic не может подписать `NOT_APPLICABLE` за затронутую роль.
6. Любой future use этого guard требует доказуемо ограниченного scope и не уменьшает full approval set текущей v0.1.

### 3.6. Procedure is not approval

Этот `XFR-D-084 v1.0`:

- утверждает только approval/change-control governance procedure;
- не утверждает текущий `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` или любую будущую candidate version;
- не создаёт actual approval record или Controlled Artifact Manifest entry;
- не закрывает Architecture §37 question №6;
- не утверждает ни один exact field, transformation, value, registry, taxonomy, algorithm, threshold, wording, localization, audience/purpose mapping, TTL/cache rule или runtime carrier;
- не утверждает dataset, evidence package, test run/result/verdict или production-data use;
- не разрешает runtime/API/DB/schema/event/table/error-catalog changes, model release, Reveal, implementation или production launch;
- не меняет status `XFR-D-072`–`XFR-D-083`, `XFR-D-M3` или других controlled artifacts;
- не переводит governance gate и не заменяет независимую проверку всех Architecture §36 conditions.

Даже future actual approval `SAFE_PRESENTATION_POLICY` утверждает только exact artifact version/hash и её documented content/scope. Он не утверждает автоматически Data Contracts extension, dataset/evidence result, runtime implementation, production applicability, Reveal authorization или любой gate.

## 4. Layer/boundary

| Слой | Authority | Что разрешено этим record | Что остаётся pending |
|---|---|---|---|
| Artifact ownership | Architecture §37 №6/§52: `PRODUCT + LEGAL` | Owner/flow boundary разрешена | Actual owner attestations/identities/RBAC |
| Approval coordination/review | `Chief AI Architect` | Independent same-hash review/order разрешены | Actual signed review |
| Technical approval | `AI + DEVELOPMENT` | Mandatory current-v0.1 determinations разрешены | Actual signed decisions/evidence |
| Evidence procedure | `XFR-D-083`: `AI + DEVELOPMENT` | Input-versus-authority separation разрешена | Actual evidence package/run/result |
| Actual Policy approval | Full five-role same-hash set | Procedure определена | Separate immutable approval record |
| Controlled Artifact Manifest | Architecture §52 | Manifest-entry-last boundary разрешена | `SAFE_PRESENTATION_POLICY` entry не создаётся |
| Policy contents/dependencies | `XFR-D-072`–`XFR-D-083`, `XFR-D-M3` и source artifacts | Не переоткрыты и не закрыты | Exact OPEN contents и applicable dispositions |
| Carrier/runtime/production | Independent controlled artifacts and gates | Explicitly separated | Data Contracts extension, runtime, production approval |
| Gates | Architecture §36 | No automatic effect | Все три gates остаются `BLOCKED` |

## 5. Что остаётся `OPEN`/pending

- actual approval текущего `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md`;
- actual frozen semantic version/SHA-256 approval package и closure/disposition его applicable dependencies;
- actual `PRODUCT`, `LEGAL`, `Chief AI Architect`, `AI` и `DEVELOPMENT` attestations;
- named approver appointments, authority evidence, RBAC, delegation and conflict-of-interest controls;
- signature/identity carrier, exact approval-record schema, status/error taxonomy, API/DB/event representation, retention, expiry and revocation mechanics;
- exact operational Controlled Artifact Manifest signing/update/supersession/revocation mechanism и сама `SAFE_PRESENTATION_POLICY` entry;
- exact change-materiality taxonomy и applicability mechanics для любых future `NOT_APPLICABLE` determinations;
- все exact fields, transformations, values, registries, algorithms, thresholds, mappings, wording/localization, audience/purpose and cache lifecycle contents;
- dataset, evidence manifest/package, tests, metrics, thresholds, run/results/reviewer verdicts и production-data authority;
- Data Contracts carrier/extension, runtime/API/DB/schema/event/table/error catalog, migrations and implementation;
- production applicability, Reveal authorization, model/policy release и все gate transitions;
- независимо governed `XFR-D-072`–`XFR-D-083`, `XFR-D-M3` и другие applicable controlled-artifact approvals.

## 6. Rationale

Architecture задаёт owner, manifest fields и gate dependency, но не exact cross-functional procedure. Без same-hash flow manifest row, merged Proposal, CI evidence или coordinator review могут быть ошибочно приняты за approval. Frozen package, пять раздельных role decisions, separate actual approval record и manifest-entry-last устраняют circular approval и не расширяют source authority.

`XFR-D-066` подтверждает полезность этой дисциплины для другого artifact, но exact Safe Presentation role allocation устанавливается здесь отдельно: `PRODUCT + LEGAL` сохраняют source-normative ownership, Chief AI Architect выполняет independent architecture review, а `AI + DEVELOPMENT` обязательны для technical/evidence feasibility текущей v0.1.

## 7. Adversarial cases

1. **Merged Proposal = approved Policy.** Запрещено: merge/PR/branch status не являются role decisions или actual approval record.
2. **Manifest row first.** Запрещено: manifest entry создаётся только после separate actual approval record.
3. **Different hashes.** PRODUCT/LEGAL подписали один hash, AI/DEVELOPMENT — другой. Approval отсутствует; decisions между versions не агрегируются.
4. **Coordinator self-approval.** Chief AI Architect объявляет Policy approved без owner/technical decisions. Запрещено.
5. **Owner excludes technical role.** PRODUCT/LEGAL или coordinator объявляет AI/DEVELOPMENT `NOT_APPLICABLE`. Запрещено; current v0.1 требует обе роли.
6. **Evidence PASS = artifact approval.** Green suite, DLP PASS или `XFR-D-083` evidence result не утверждает Policy.
7. **Decision record = actual approval.** `XFR-D-084` ошибочно используется как подпись current v0.1. Запрещено: это procedure record.
8. **Citation closes dependency.** `XFR-D-072`–`XFR-D-083` или `XFR-D-M3` считаются закрытыми из-за включения в package. Запрещено.
9. **Silent edit after signatures.** Bytes меняются без нового hash/review. Approval attempt прекращается, signatures не переносятся.
10. **Carrier approval by implication.** Policy approval используется как approval Data Contracts schema/API/event. Запрещено.
11. **Synthetic evidence = production authorization.** Запрещено: production data/applicability и launch independently governed.
12. **One artifact opens gates.** Valid Policy approval/manifest entry переводит три gates. Запрещено: это только часть независимых conditions.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — §15 row №14, readiness matrix, acceptance criteria и Definition of Done должны отразить resolved procedural boundary, сохраняя actual Policy approval и manifest entry pending;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `SPP-14 → XFR-D-084` без изменения canonical identity/counts и исторических overlays;
- Controlled Artifact Manifest — не изменяется этим record или status sync; entry появляется только после separate actual approval record.

## 9. Change control

Изменение owner/role set, same-hash rule, sequence, `NOT_APPLICABLE` authority, manifest-entry-last или approval-effect boundary требует нового versioned decision record с согласованием `PRODUCT + LEGAL + Chief AI Architect + AI + DEVELOPMENT` и ссылкой `supersedes` на эту запись.

Operational carrier, named appointments/RBAC, exact approval-record schema и manifest mechanics разрешаются отдельными records; они не добавляются silent edit в v1.0.

## 10. Gate impact

`NONE`. Current Safe Presentation Policy остаётся `Proposal for cross-functional review — does not authorize implementation`; actual approval record и `SAFE_PRESENTATION_POLICY` Controlled Artifact Manifest entry не создаются. Architecture §36.2 conditions 2/5 не выполнены этим record.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** approval flow, **when** определяется artifact/governance owner, **then** это source-normative `PRODUCT + LEGAL`, без unilateral final approval.
2. **Given** current v0.1, **when** формируется approval set, **then** required roles — `PRODUCT + LEGAL + Chief AI Architect + AI + DEVELOPMENT` на одном semantic version/SHA-256.
3. **Given** evidence procedure, **when** AI/DEVELOPMENT предоставляют evidence readiness, **then** это input, не artifact approval и не замена PRODUCT/LEGAL authority.
4. **Given** frozen package, **when** отсутствует version/hash/link/scope/dependency/evidence reference или существует mismatch/conflict, **then** flow блокируется fail closed.
5. **Given** изменение bytes после любой signature, **when** hash изменён, **then** approval attempt начинается заново и signatures не переносятся.
6. **Given** current v0.1, **when** AI или DEVELOPMENT объявляются `NOT_APPLICABLE`, **then** finalization блокируется; другая роль не может подписать determination за них.
7. **Given** полный same-hash role set, **when** отсутствует separate actual approval record, **then** Policy не approved и manifest entry не создаётся.
8. **Given** manifest entry, **when** проверяется его authority, **then** он отражает prior approval и не создаёт approval сам.
9. **Given** PR/merge/CI/file/decision-record existence, **when** оно трактуется как approval, **then** такая трактовка отклоняется.
10. **Given** этот record, **when** проверяется current Safe Presentation Policy, **then** она остаётся Proposal, а exact contents/evidence/carrier/runtime/production остаются pending.
11. **Given** `XFR-D-072`–`XFR-D-083` и `XFR-D-M3`, **when** они перечислены в package, **then** их independent statuses и OPEN contents не меняются.
12. **Given** future actual Policy approval, **when** оцениваются Data Contracts, runtime, production, Reveal или gates, **then** ни один соседний artifact/action/status не approved автоматически.
13. **Given** Architecture §36.2 conditions 2/5, **when** проверяется effect этого procedural record, **then** conditions не считаются выполненными.
14. **Given** governance gates, **when** фиксируется effect, **then** все три остаются `BLOCKED`.

## 12. Итог

`XFR-D-084 SAFE PRESENTATION POLICY APPROVAL/CHANGE-CONTROL PROCEDURE APPROVED — ACTUAL POLICY APPROVAL, CONTROLLED ARTIFACT MANIFEST ENTRY, RUNTIME, PRODUCTION AND GATES REMAIN PENDING/BLOCKED`
