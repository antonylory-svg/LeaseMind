# LeaseMind Matching Decision Record — XFR-D-072

**Decision ID:** `XFR-D-072`

**Версия:** 1.0

**Дата решения:** 2026-08-29

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-08-29 working session

**Repository baseline:** `55f3518d6e4ef66da90106e9db6bae687351452c`

**Governance owner:** `PRODUCT + LEGAL`

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence design, measurement, matrix preparation or technical feasibility review does not replace joint `PRODUCT + LEGAL` governance ownership or approval by the full owner/approver set.

**Depends on:** Architecture §§5, 9.4, 18.2, 22.1, 23, 37 question №6 and 52; `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` §§4–8, 12–16; `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.1 and applicable classification boundaries; `XFR-D-028 v1.0`, `XFR-D-044 v1.0` and `XFR-D-073 v1.0`. Geographic generalization `XFR-D-074`, cohort/uniqueness/re-identification method `XFR-D-M3`, combination-risk algorithm `XFR-D-075`, successive-disclosure budget `XFR-D-076`, audience/purpose model `XFR-D-080`, runtime carrier `XFR-D-082`, combination-risk evidence `XFR-D-083` and artifact approval/change control `XFR-D-084` remain independent `OPEN` decisions.

---

## 1. Вопрос

Какова governance/evidence boundary будущего exact per-object-type Safe Presentation field allowlist, чтобы owner/approver roles, default-deny, matrix completeness и joint combination-risk evidence были однозначны, но ни одно конкретное поле, transformation, user-facing value, legal determination или runtime carrier не было преждевременно разрешено?

## 2. Source/status discipline

Architecture §37 question №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами решения о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY`. Architecture не задаёт field allowlist, re-identification method, numeric threshold, per-object matrix, presentation schema или runtime carrier.

Architecture §22.1 задаёт source-normative pre-Reveal deny boundary. Условная формулировка риска идентификации не является разрешением конкретного поля: без approved method/evidence спорное поле или combination остаётся fail closed.

`XFR-D-073 v1.0` human-approved разрешает только reuse восьми CTA `property_type` values как canonical design-time registry keys и fail-closed evolution rule. Он не разрешает показ `property_type`, `property_type_other`, field allowlist, transformation или runtime design.

Safe Presentation Policy §§6–8 предлагает candidate content families, matrix form и combination-risk scenarios, но остаётся `Proposal for cross-functional review`. Эти candidates не являются разрешёнными fields или source-normative risk method.

Этот record разрешает только qualitative governance/evidence boundary ниже.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `PRODUCT + LEGAL`.** PRODUCT совместно владеет user purpose/product meaning; LEGAL — data minimization, lawful-use and rights/re-identification boundary. Ни одна сторона не одобряет allowlist единолично.
2. **Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.** Chief AI Architect проверяет architecture/separation; AI — evidence/model-derived claim limitations; DEVELOPMENT — reproducibility and carrier feasibility. Эти роли не заменяют owner-пару.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Готовит candidate matrix/evidence, но не принимает PRODUCT/LEGAL determination и не становится unilateral approver.
4. Data Governance/SECURITY/privacy reviewers могут предоставлять required evidence по своим authority records, но не становятся автоматически artifact/decision owner или substitute LEGAL approval.
5. Technical writer, Git author, implementation team, AI/model output, CI, DLP result, filename, service or existing internal schema не являются approval authority.

### 3.2. Default-deny and row-completeness boundary

1. Пока exact row не approved полным applicable owner/approver set на одной policy version/hash, candidate field/derived fact/transformation не показывается пользователю.
2. Allowlist является explicit positive authorization, не выводится из отсутствия deny, существования source field, internal calculation use, UI mockup, prior display, sibling Proposal или implementation convenience.
3. Каждая комбинация `registry key × candidate field/derived fact × transformation × intended purpose/audience` требует собственной reviewed row; wildcard, implicit default или blanket family approval запрещены.
4. Отсутствующая, неполная, ambiguous, conflicting, expired, revoked or hash-mismatched row fails closed without presentation.
5. Отсутствие approved row не является отрицательным или risk-фактом о самом Property/Tenant/Match; это только governance state отсутствия authorization.
6. Source-normative deny boundary Architecture §22.1 не получает waiver от allowlist row, risk score, consent-like UI action, high Match Score, Qualification result or business urgency.

### 3.3. Registry identity and object-type isolation

1. Registry keys — ровно восемь CTA `property_type` values, утверждённых `XFR-D-073 v1.0` как design-time identity; parallel vocabulary не создаётся.
2. `other` — самостоятельный registry key, не fallback/catch-all и не разрешение `property_type_other` or free text.
3. Row/allowlist одного registry key не наследуется другим key.
4. Future/unknown `property_type` value требует новой independently reviewed row and applicable change control; fallback к `other` или ближайшему type запрещён.
5. Этот record не утверждает отдельную `business_category` matrix и не переносит Property allowlist на Tenant/business identity.

### 3.4. Per-row minimum evidence categories

Future exact row требует versioned evidence package, включающего как минимум:

1. canonical registry key and exact candidate field/derived-fact identity;
2. source system/aggregate/field, semantic definition, source version and freshness/staleness behavior;
3. exact proposed transformation/generalization and proof that raw input cannot pass through fallback/error/debug/localization paths;
4. intended user purpose, concrete audience/recipient context and prohibition of secondary reuse;
5. data classification, applicable lawful-basis/purpose-limitation reference and retention constraints;
6. full simultaneously presentable combination set, not only the individual field;
7. cohort/uniqueness/re-identification evidence under future approved `XFR-D-M3`, including rare-category/small-cell/searchability limitations where applicable;
8. combination-risk result under future approved `XFR-D-075` with actual evidence package governed by `XFR-D-083`;
9. successive/cumulative disclosure evidence under future approved `XFR-D-076`, including repeated presentation and cross-session correlation;
10. geographic generalization evidence under `XFR-D-074` where geography/travel/location information is involved;
11. raw-value reconstruction, differencing, enumeration, inference, external-searchability and overclaim adversarial tests;
12. DLP/channel evidence separated from quasi-identifier/combination evidence;
13. explicit PRODUCT determination and explicit LEGAL determination on the same row/policy version/hash;
14. Chief AI Architect/AI/DEVELOPMENT review references, deviations, limitations and unresolved dependencies;
15. policy version/hash, immutable evidence references, supersedes relation and change summary.

These categories do not approve their exact schema, numeric method/value, actual evidence or any field. Missing applicable category blocks approval fail closed.

### 3.5. Joint combination risk, never per-field only

1. A field is not safe merely because it lacks direct identifiers or appears coarse.
2. Review covers the complete simultaneous payload, transformations, purpose, audience and successive disclosures; per-field PASS cannot substitute joint evidence.
3. Aggregate or common-case safety cannot compensate rare object type, segment, geography, unusual attribute combination or unresolved evidence.
4. DLP/direct-identifier scan does not prove safety from quasi-identifiers, reconstruction, differencing, enumeration or external search.
5. Synthetic-only evidence cannot establish production cohort uniqueness, production searchability or production-safe allowlisting.
6. No conventional k-anonymity/cohort value, radius, range width, rarity threshold, disclosure budget, risk score or ordinal `LOW/MEDIUM/HIGH` default is introduced.
7. Absence of observed re-identification does not prove non-identifiability without approved method, coverage and uncertainty/evidence boundary.

### 3.6. Field/family non-authorization

This record approves **no** concrete:

- raw Property, Tenant, Campaign, Match, Qualification, Risk or Confidence field;
- derived fact, categorical explanation, range, negotiation gap or next-action text;
- `property_type` or `property_type_other` display;
- candidate family §6.1–§6.9 as a whole;
- geographic level, precision, radius, band or transformation;
- localized text, reason/explanation catalog entry or free text;
- audience/purpose payload;
- combination set, cohort, uniqueness method or threshold;
- runtime/API/DB/event/schema field or error/status enum.

A family name is an evidence-organizing category, not an allowlist row or permission.

### 3.7. Presentation, scoring and gate separation

1. Internal Match Package remains distinct from Safe Presentation and protected Reveal package.
2. Safe Presentation is read-only consumer under `XFR-D-044`; it cannot recalculate or change Eligibility, score, rank, Qualification, Confidence, Risk, routing or source facts.
3. High score, `QUALIFIED_HYPOTHESIS`, Presentation Readiness or user acceptance does not authorize a field or bypass downstream Participation/Previous Contact/Payment/Introduction/Reveal gates.
4. One safe row does not authorize another field, another object type, another audience/purpose, another policy hash or the whole artifact.
5. No successful evidence automatically publishes presentation, changes policy/runtime, approves model release or transitions a governance gate.

### 3.8. Partial, never fully resolved

`XFR-D-072` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, default-deny, explicit independent row completeness, registry isolation, minimum evidence categories, joint combination-risk/non-compensation and no-automatic-authorization boundaries разрешены qualitatively.

Exact per-object-type allowlist, all row contents, fields/derived facts/transformations, risk methods/values, actual evidence, PRODUCT/LEGAL determinations, policy artifact approval, runtime carrier and implementation remain `OPEN`.

Future exact approval requires a new versioned `XFR-D-072` record with `supersedes`, after applicable dependencies. Open contents cannot enter through Safe Presentation Policy sync, UI copy, schema default, implementation, migration, config, DLP rule, test fixture or post-hoc reviewer choice.

## 4. Layer/boundary

| Layer | Authority | Resolved by this record | Remains `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` preserved | Actual artifact approval/change control `XFR-D-084` |
| Registry identity | `XFR-D-073 v1.0` | Reused, not changed | Any registry expansion/display |
| Allowlist governance | `XFR-D-072 v1.0` | Roles, default-deny, row/evidence boundary | Every actual row and field |
| Re-identification/combination | `XFR-D-M3`, `XFR-D-075`, `XFR-D-076`, `XFR-D-083` | Mandatory dependencies/non-compensation | Methods, values, evidence, disclosure budget |
| Geography | `XFR-D-074` | Dependency preserved | Generalization method/value |
| Audience/purpose | `XFR-D-080` | Dependency preserved | Exact model and recipients |
| Runtime carrier | `XFR-D-082` | No carrier inferred | API/DB/event/schema/cache implementation |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. What remains `OPEN`

- every concrete allowlist row and denylist exception proposal;
- every field/derived fact/transformation/generalization and display value;
- `property_type`/`property_type_other` presentation and any business-category matrix;
- re-identification/cohort/uniqueness method and all numeric thresholds (`XFR-D-M3`);
- geographic generalization (`XFR-D-074`);
- combination-risk algorithm and actual evidence (`XFR-D-075`, `XFR-D-083`);
- successive-disclosure budget (`XFR-D-076`);
- reason/explanation catalog, wording and localization (`XFR-D-077`–`XFR-D-079`);
- audience/purpose model (`XFR-D-080`);
- cache/expiry/revocation (`XFR-D-081`);
- runtime carrier/Data Contracts extension (`XFR-D-082`);
- Safe Presentation artifact approval/change control (`XFR-D-084`);
- actual policy version/hash, evidence package, named appointments/RBAC and production applicability;
- implementation, model/policy release and all governance gates.

## 6. Rationale

An allowlist is dangerous if it is treated as a flat list of individually harmless field names. A coarse field may identify an object when combined with category, geography, timing or commercial facts, and repeated disclosures can reconstruct values even when each payload appears minimized. Therefore governance must authorize exact purpose-bound rows on a frozen policy hash with joint and successive-disclosure evidence.

At the same time, the repository does not contain approved re-identification, combination-risk, disclosure-budget or actual field evidence. Resolving roles and evidence prerequisites now removes governance ambiguity without fabricating fields, methods or production safety.

## 7. Adversarial cases

1. **No direct identifier = safe.** Rejected: quasi-identifier and joint combination evidence remain required.
2. **Field exists internally.** Internal Match Package/source field is copied to UI. Rejected: internal use is not presentation authorization.
3. **Family approved wholesale.** All categorical explanations are allowed. Rejected: every exact row/purpose/combination requires review.
4. **Inheritance across types.** Office allowlist is reused for warehouse. Rejected: independent rows; no inheritance.
5. **`other` fallback.** Unknown type or free text uses `other` row. Rejected by `XFR-D-073` and this boundary.
6. **Per-field PASS.** Ten individually reviewed fields are presented together without joint evidence. Rejected.
7. **DLP PASS.** Direct-identifier scan is treated as combination-risk approval. Rejected.
8. **Synthetic cohort.** Synthetic uniqueness result approves production. Rejected.
9. **One-time-safe.** Repeated presentations reconstruct a value. Requires `XFR-D-076`; no authorization here.
10. **High score overrides privacy.** Rejected: score/routing/gate state never authorizes fields.
11. **Policy sync creates permission.** Proposal matrix text is treated as approved allowlist. Rejected: actual versioned decision/evidence required.
12. **Runtime enum by prose.** Matrix columns become API/DB fields automatically. Rejected.

## 8. Affected artifacts (future separate sync)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §§5–8, §14 row 1, readiness and acceptance criteria may receive this governance/evidence boundary without any actual field row;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — owner-review overlay for `SPP-01 → XFR-D-072`, without rewriting historical Wave 2D or crosswalk/counts;
- future `XFR-D-074`/`XFR-D-M3`/`XFR-D-075`/`076`/`080`/`083`/`084`, actual Safe Presentation policy and runtime artifacts — separate passes.

No sync may interpret this record as an approved field allowlist, Safe Presentation Policy, risk method, actual evidence, legal determination, production-safe payload, runtime carrier or implementation authorization.

## 9. Change control

Changing governance owner, mandatory approvers, default-deny, independent-row, registry-isolation, evidence-category, joint-combination/non-compensation or no-automatic-authorization boundary requires a new versioned `XFR-D-072` record approved by `PRODUCT + LEGAL + Chief AI Architect + AI + DEVELOPMENT`, with `supersedes` reference.

Exact allowlist contents require future evidence-backed version and cannot be appended silently to v1.0.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** any candidate field/transformation, **when** no complete approved row exists on one policy version/hash, **then** presentation is denied fail closed.
2. **Given** existing internal field, source schema, UI mockup, sibling Proposal or implementation, **when** allowlist authority is requested, **then** none creates authorization.
3. **Given** eight registry keys, **when** row reuse is attempted across keys or future unknown value, **then** inheritance/fallback is rejected; `other` is not catch-all.
4. **Given** a candidate row, **when** evidence is reviewed, **then** source/freshness, transformation, purpose/audience, classification/lawful basis, joint combination, successive disclosure, adversarial tests and same-hash decisions are complete or the row remains blocked.
5. **Given** individually safe-looking fields, **when** simultaneous presentation is proposed, **then** joint evidence is mandatory and per-field PASS is insufficient.
6. **Given** DLP PASS or absence of observed identification, **when** quasi-identifier safety is claimed, **then** the claim is rejected without approved method/evidence.
7. **Given** governance authority, **when** roles are checked, **then** owner is `PRODUCT + LEGAL`, mandatory approvers are `Chief AI Architect + AI + DEVELOPMENT`, and evidence-procedure owner `AI + DEVELOPMENT` has no unilateral approval.
8. **Given** this record, **when** any concrete field, value, family, transformation, geographic level, method, threshold, text, audience or runtime field is requested, **then** none is approved.
9. **Given** synthetic-only evidence, **when** production allowlisting is claimed, **then** the claim is prohibited.
10. **Given** high score/Qualification/Presentation Readiness/user acceptance, **when** field disclosure is requested, **then** no state bypasses the approved allowlist or downstream gates.
11. **Given** independent decisions `XFR-D-074`–`XFR-D-084` and `XFR-D-M3`, **when** this boundary is applied, **then** none is resolved or substituted.
12. **Given** this record, **when** Safe Presentation Policy, actual allowlist/evidence, production data, runtime, implementation and governance gates are checked, **then** none is approved and all three gates remain `BLOCKED`.

## 12. Outcome

`XFR-D-072 FIELD-ALLOWLIST GOVERNANCE AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — ALL FIELDS, TRANSFORMATIONS, RISK METHODS, ACTUAL EVIDENCE, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
