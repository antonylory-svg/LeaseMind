# LeaseMind Matching Decision Record — XFR-D-047

**Decision ID:** `XFR-D-047`

**Название:** Risk output representation and runtime-identifier governance boundary

**Версия:** 1.0

**Дата решения:** 2026-09-14

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE MULTI-COMPONENT RISK REPRESENTATION BOUNDARY — RUNTIME ENUMS, IDENTIFIERS, FORM, VALUES, ORDER, AGGREGATION, FORMULA, REASON MAPPING, ROUTING, COMPATIBILITY, TTL, PRECISION, SERIALIZATION, SCHEMA AND CARRIER REMAIN OPEN`

**Decision authority:** human project-governance confirmation on 2026-09-14

**Repository baseline:** `ac1191324dc88149764679583e434eeac7bc9281`

**Canonical identity:** `MRP-01 → XFR-D-047`, `PRIMARY_STANDALONE` (Inventory §4.3). Canonical mapping and Inventory counts remain unchanged at 102 source keys / 90 canonical IDs.

**Scope:** qualitative governance boundary for future Risk output representation. It preserves the ten Architecture §17 category names and `XFR-D-048` multi-component/conditional-non-compensation semantics without creating runtime/public identifiers, enums, scalar semantics, reason mappings, routing or a technical carrier.

**Governance owner:** `Chief AI Architect + AI` — human-approved assignment derived from Risk Policy §13 row 1; it is not claimed as `SOURCE_NORMATIVE`.

**Risk Policy artifact owner:** `Chief AI Architect + LEGAL` — source-normative under Architecture §52 and separate from this decision-specific governance role.

**Mandatory approvers:** `PRODUCT + LEGAL + DEVELOPMENT`.

**Evidence/technical-procedure owner:** `AI + DEVELOPMENT`; this role may prepare representation candidates and evidence but has no unilateral authority to select content, approve policy/runtime/production/implementation or pass a gate.

**Depends on and preserves:** `XFR-D-048` multi-component Risk representation and conditional non-compensation; `XFR-D-049`–`XFR-D-055`, `XFR-D-M2`, `XFR-D-M3` and `XFR-D-M4` retain their separate authorities and open contents. Match, Confidence, Hard Constraint, Qualification, legal/reviewer and presentation layers remain independent.

---

## 1. Вопрос

Какая qualitative boundary допустима для Risk output representation и возможных runtime/public identifiers до утверждения точного Risk contract?

## 2. Source/status discipline

1. Inventory indexes `MRP-01 → XFR-D-047`, `PRIMARY_STANDALONE`; indexing is not approval.
2. Architecture §17 supplies exactly ten semantic category names; it does not supply a runtime enum, identifier catalog, ordering or scalar formula.
3. Those names are preserved exactly: `качество и конфликт данных`; `полномочия представителя`; `связь стороны с объектом`; `дублирование сущностей`; `операционная несовместимость`; `риск устаревания`; `риск повторной идентификации объекта до раскрытия`; `возможный прежний контакт`; `возможная связь лиц или обход — только как сигнал`; `аномальное поведение, относящееся к конкретным проверяемым событиям`.
4. Risk Policy §11 confirms that no canonical `LOW/MEDIUM/HIGH` or other severity enum exists and that its design-time table is not a public/runtime registry.
5. `XFR-D-048` is the substantive source for multi-component representation and conditional non-compensation, not for runtime schema.

## 3. Решение

### 3.1. Authority split

1. Governance owner is `Chief AI Architect + AI`, candidate-derived and not `SOURCE_NORMATIVE`.
2. Mandatory approvers are `PRODUCT + LEGAL + DEVELOPMENT`.
3. Risk Policy artifact owner remains `Chief AI Architect + LEGAL`.
4. Evidence/technical-procedure owner is `AI + DEVELOPMENT`, without unilateral authority.
5. Future exact content requires all five functions to approve the same immutable version/hash and evidence package.

### 3.2. Semantic category-name preservation

1. The ten Architecture §17 names remain semantic categories only.
2. Their text does not create identifiers, enum tokens, numeric values, severity levels, ordering, precedence or a storage layout.
3. No spelling similarity, table position or conventional terminology creates alias/equivalence or machine-readable identity.
4. Any future representation must bind its mapping to the exact applicable source/Risk Policy version/hash and provenance.

### 3.3. Multi-component representation preserved

1. Under `XFR-D-048`, category components remain separately visible and attributable.
2. Any future scalar may be only a supplement; it cannot replace, suppress or discard components.
3. `XFR-D-048` conditional non-compensation remains applicable only after a category is independently classified critical by separately approved rules.
4. This record does not classify any category critical and does not create aggregation, formula, weight, severity, threshold or precedence.

### 3.4. Strict layer separation

Risk output remains distinct from:

1. Match Score and Confidence Score;
2. Hard Constraint and Eligibility results;
3. Qualification result or routing;
4. legal/reviewer finding, violation, sanction or Decision Record;
5. user-facing reason, wording or disclosure authorization.

No representation token or component may silently cross those boundaries.

### 3.5. Fail-closed unavailable-representation boundary

Missing, unknown, unmapped, ambiguous, stale, conflicting or version/hash/scope-incompatible representation:

1. is not interpreted as clean, low, zero, neutral or default Risk;
2. creates no negative fact, reason, legal conclusion, route, rejection or automatic `INELIGIBLE`;
3. blocks only the affected representation-dependent use until a separately approved compatible rule exists;
4. does not erase or replace available source/category components;
5. leaves exact fallback, cascade, recovery, escalation and operational behavior `OPEN`.

### 3.6. Partial, never full resolution

`XFR-D-047` receives `PARTIALLY_RESOLVED_BOUNDARY`: role separation, ten-name semantic preservation, multi-component visibility, scalar-supplement-only, conditional non-compensation preservation, layer separation, version/hash/provenance discipline and fail-closed handling are approved qualitatively.

All identifiers, enums, form, values, order, aggregation, formula, reason mapping, route, version compatibility, TTL, precision, serialization, schema, carrier, public/runtime and implementation contents remain `OPEN`.

## 4. Layer and authority table

| Layer | Preserved authority | Approved here | Remains `OPEN` |
|---|---|---|---|
| Canonical identity | Inventory §4.3 | `MRP-01 → XFR-D-047`, `PRIMARY_STANDALONE` | Future status overlay |
| Governance | `Chief AI Architect + AI`; approvers `PRODUCT + LEGAL + DEVELOPMENT` | Qualitative boundary | Exact representation verdict |
| Risk Policy artifact | `Chief AI Architect + LEGAL` | No artifact approval | Policy approval |
| Semantic categories | Architecture §17 | Ten names preserved | IDs/enums/order/mapping |
| Aggregation | `XFR-D-048` | Multi-component/conditional non-compensation preserved | Formula, criticality, scalar and precedence |
| Qualification/legal/presentation | Independent authorities | No authority transfer | Exact mappings/routes/reasons/displays |
| Evidence/technical procedure | `AI + DEVELOPMENT` | Preparation role only | Tests/data/evidence verdict |
| Runtime/production/gates | Separate controlled authorities | No authorization | Contract/carrier/implementation/release |

## 5. Обязательные non-conflations

1. Architecture category name ≠ runtime enum or identifier.
2. Risk component ≠ Match Score, Confidence, Hard Constraint or Qualification result.
3. Scalar supplement ≠ replacement for components.
4. Conditional non-compensation ≠ critical-category classification.
5. Risk output ≠ legal/reviewer conclusion or user-facing reason.
6. Missing representation ≠ clean/low/zero/default.
7. Risk Policy artifact owner ≠ decision owner ≠ evidence owner.
8. Inventory/Proposal/runtime convenience ≠ approval.

## 6. Что остаётся `OPEN`

- runtime/public identifier and enum catalogs;
- exact field/form/value/cardinality/order/severity/precedence;
- aggregation/scalar formula, weights and criticality mapping;
- reason-reference mappings and Qualification routes;
- version compatibility, fallback, TTL/freshness and invalidation;
- numeric precision/rounding and canonical serialization;
- schema/API/event/DB/storage/transport carrier and public presentation;
- exact data, tests, metrics, evidence and sufficiency verdict;
- Risk/Qualification/Safe Presentation Policy, manifest, production, runtime, implementation and gates.

## 7. Rationale

Preserving the source category names and multi-component semantics prevents silent loss of Risk evidence. Deferring identifiers, values and carriers prevents a design-time table or familiar severity vocabulary from becoming an accidental runtime contract.

## 8. Adversarial cases

1. **The ten rows become enum values by transliteration.** Rejected: machine identifiers remain `OPEN`.
2. **`LOW/MEDIUM/HIGH` is introduced as conventional.** Rejected: no such canonical enum exists.
3. **A scalar replaces the ten components.** Rejected: any future scalar is supplement only.
4. **A critical component is averaged away.** Rejected where separately approved critical classification applies under `XFR-D-048`.
5. **Missing representation becomes low Risk or a default route.** Rejected.
6. **Risk representation directly produces Qualification or legal outcome.** Rejected.
7. **Successful serialization test approves runtime.** Rejected: evidence is not policy/runtime/gate approval.

## 9. Затронутые артефакты — future separate sync only

- Risk Policy and Inventory may later receive a status overlay preserving every exact content item `OPEN`.
- No Proposal, Policy, Data Contract, dataset, Evaluation Plan, manifest, sibling record, runtime or code is changed here.

No sync is performed by this record. Risk Policy, Inventory, other Policies, manifests, Data Contracts, sibling records, runtime and application code remain untouched.

## 10. Change control

Any change to this qualitative boundary requires a new versioned `XFR-D-047` record with `supersedes`, approved by all five functions on the same immutable version/hash: `Chief AI Architect + AI` and `PRODUCT + LEGAL + DEVELOPMENT`.

## 11. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**.
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**.
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**.

This record approves no Proposal, Policy, Data Contract, dataset, evaluation run/result, production-data use, manifest, runtime, implementation or release.

## 12. Acceptance criteria

1. Canonical identity is `MRP-01 → XFR-D-047`, `PRIMARY_STANDALONE`; counts remain 102/90.
2. Roles match the header and evidence ownership is non-unilateral.
3. All ten Architecture category names are preserved as semantic names, not runtime IDs/enums.
4. Components stay visible/separate; a future scalar is supplement only.
5. `XFR-D-048` conditional non-compensation remains intact without classifying any category critical.
6. Risk remains distinct from Match/Confidence/Hard Constraint/Qualification/legal/reviewer/presentation layers.
7. Unavailable representation creates no clean/low/zero/default/reason/route.
8. Every exact identifier/enum/form/value/order/formula/mapping/carrier/runtime item remains `OPEN`.
9. All three gates remain `BLOCKED`.

## 13. Итог

`XFR-D-047 PARTIALLY_RESOLVED_BOUNDARY — THE TEN ARCHITECTURE RISK CATEGORY NAMES REMAIN SEMANTIC, NOT A RUNTIME ENUM; MULTI-COMPONENT VISIBILITY, SCALAR-SUPPLEMENT-ONLY AND XFR-D-048 CONDITIONAL NON-COMPENSATION ARE PRESERVED; RISK REMAINS DISTINCT FROM MATCH, CONFIDENCE, HARD CONSTRAINT, QUALIFICATION, LEGAL/REVIEWER AND PRESENTATION LAYERS; UNAVAILABLE REPRESENTATION CREATES NO CLEAN/LOW/ZERO/DEFAULT/REASON/ROUTE; ALL EXACT REPRESENTATION AND RUNTIME CONTENT REMAINS OPEN`
