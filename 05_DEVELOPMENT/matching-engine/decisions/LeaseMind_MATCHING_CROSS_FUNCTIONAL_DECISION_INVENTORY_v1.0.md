# LeaseMind MATCHING CROSS-FUNCTIONAL DECISION INVENTORY

**Версия:** 1.0
**Дата:** 2026-08-30
**Статус:** `Cross-functional decision inventory — records decision status; does not authorize implementation or approve any Proposal`
**Reviewed repository commit:** `47dbc2461a7cf2c554058d1eb8d8d7c2074f1398`
**Wave 1 decision records commit:** `a5fe497b9d297ef9ca4e342b636f214417bf230a`
**Wave 2A Qualification semantics decision records commit:** `89d33ee0f1cf018cfb4e14001c5f081cc6000e80`
**Wave 2B Feature compatibility decision records commit:** `324242c88cee07f1b48b0ff134ffaefc360d1bcf`
**Wave 2C Feature input semantics decision records commit:** `9956f943329b38da109039d57b8ba4721caf2a0a`
**Wave 2D Safe Presentation registry decision records commit:** `fbd885bec655bb5f82c91c53719f1f4f153243f0`
**Safe Presentation field-allowlist governance owner-review decision record commit:** `e9aea580ab1d5181a4305781ce938f69387838a4`
**Wave 2E Risk aggregation decision record commit:** `0d3a843133f4959c82d0d41e226a10d0947d74ed`
**Wave 2F Scoring semantics decision records commit:** `900731c692a5d003804074b71d97b91630bf88de`
**Wave 2G Evaluation semantics decision records commit:** `6f086787ea799941c5bea649c9b90a6bd76eaac6`
**Scoring governance owner-review decision records commit:** `bcee8eb751bb3a61a7bdc91a919c107fe0ce6491`
**Evaluation label-evidence owner-review decision record commit:** `9dbc8049cbd8b2d14e997111d43649e76e969e01`
**Evaluation adjudication owner-review decision record commit:** `b21c3aba27c23e7f046ef6550841a03b7a6947b9`
**Evaluation grouping-isolation owner-review decision record commit:** `2371109746841469d8519cc74a968ee65a20d898`
**Evaluation correction-history owner-review decision record commit:** `64c5b251d3bb6c5ecbbd1d0f992460dbc5bb1f64`
**Evaluation false-exclusion governance owner-review decision record commit:** `4d71f2c6772559a3a9ebcfa5f6fd9ffa9c42a9e7`
**Evaluation dataset-split governance owner-review decision record commit:** `1e586116a0cb5c8dc04830d3bd65e1e487b34f4d`
**Evaluation metric-target governance owner-review decision record commit:** `7f9fe3bad51ad578e12b1bc29643c6705ba053c7`
**Evaluation segment-coverage governance owner-review decision record commit:** `8cb588fb0d613ecc7c76048d2d82870f0fc70954`
**Evaluation drift-monitoring governance owner-review decision record commit:** `b200a832d4c44f52203da28200701ee922e59e4a`
**Evaluation Plan approval-procedure owner-review decision record commit:** `8d56dded8c826c20e61b09b79749dfd394ff1bcf`
**Evaluation fairness governance owner-review decision record commit:** `b94f580b2739c4b5c8d649facf9b6fd2beb59981`
**Evaluation threshold-statistics governance owner-review decision record commit:** `f476606ae456e81275a704c34fb6bb0aa8ee298d`

**Evaluation post-freeze correction governance owner-review decision record commit:** `81f02df4cc954fe3bd25e422b59cae954a787bf4`
**Safe Presentation geographic-generalization governance owner-review decision record commit:** `2f622dc4904b525006722d485b23356688c13c7d`
**Safe Presentation combination-risk algorithm governance owner-review decision record commit:** `c09fbf5a2acfce65a2964b95ac3a017ed0038018`
**Coordination:** Chief AI Architect — coordination candidate only, not owner of every indexed decision

## 1. Назначение и граница документа

Этот документ — индекс открытых cross-functional решений шести Matching Proposal-документов. Он дедуплицирует локальные open-decision строки, сохраняет их трассируемость и задаёт безопасную последовательность review.

Документ:

- не принимает ни одного решения за `AI`, `PRODUCT`, `LEGAL` или `DEVELOPMENT`;
- не назначает source-owner там, где Architecture его не назначает;
- не переводит ни один Proposal в `APPROVED`;
- не закрывает Architecture §37 open questions;
- не утверждает weights, thresholds, field allowlists, reason namespaces, runtime enums, object registries, Data Contracts extensions или production use;
- не разрешает implementation/runtime/API/schema/event/table/error-catalog changes;
- не проходит ни один gate.

Gate status на reviewed commit:

- `IMPLEMENTATION_READINESS_GATE` — **`BLOCKED`**;
- `SYNTHETIC_ACCEPTANCE_GATE` — **`BLOCKED`**;
- `PRODUCTION_LAUNCH_GATE` — **`BLOCKED`**.

## 2. Источники и scope

Локальные open-decision строки:

| Документ | Source-key range | Count |
|---|---:|---:|
| `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` | `FS-01`–`FS-19` | 19 |
| `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` | `EP-01`–`EP-17` | 17 |
| `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` | `MRP-01`–`MRP-14` | 14 |
| `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` | `MQP-01`–`MQP-20` | 20 |
| `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` | `MSP-01`–`MSP-18` | 18 |
| `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` | `SPP-01`–`SPP-14` | 14 |
| **Итого** |  | **102** |

Нормативные anchors: `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`. Текущая executable-contract граница: `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`. Итог технической согласованности: `LeaseMind_MATCHING_GOVERNANCE_FINAL_REVIEW_v1.0.md`.

Sibling Proposal остаётся Proposal и не становится `SOURCE_NORMATIVE` только из-за merge.

## 3. Правила дедупликации

1. Одинаковый вопрос, совпадающий owner и один будущий decision output объединяются в один canonical ID.
2. Тематически близкие вопросы с разными outputs или owners остаются разными решениями и связываются dependency.
3. Policy rule не объединяется с empirical threshold/evidence.
4. Governance decision не объединяется с downstream implementation design.
5. Artifact approval/change control не объединяется с substantive policy decision.
6. Reason-catalog ownership, value set, mapping и presentation catalog не объединяются автоматически.
7. Re-identification method/threshold не объединяется с Safe Presentation field allowlist.
8. Architecture-only anchor не входит в count 102 и не создаёт source-less canonical decision.

`PRIMARY_STANDALONE` создаёт один canonical ID. `PRIMARY_MERGED_MEMBER` входит в общий merged ID. `SECONDARY_BOUNDARY_REFERENCE` указывает на уже существующий ID и нового решения не создаёт.

## 4. Полный source crosswalk

### 4.1. Feature Schema

| Source key | Canonical ID | Role | Решение |
|---|---|---|---|
| `FS-01` | `XFR-D-M1` | `PRIMARY_MERGED_MEMBER` | Required evidence level per feature |
| `FS-02` | `XFR-D-001` | `PRIMARY_STANDALONE` | Compatibility table: entrance type × requirement |
| `FS-03` | `XFR-D-002` | `PRIMARY_STANDALONE` | Compatibility/ordering table: access mode |
| `FS-04` | `XFR-D-003` | `PRIMARY_STANDALONE` | Decimal precision/rounding for rent-rate fit |
| `FS-05` | `XFR-D-004` | `PRIMARY_STANDALONE` | Identity/authority verification availability at scoring |
| `FS-06` | `XFR-D-005` | `PRIMARY_STANDALONE` | Numeric TTL for time-bound class-3 features |
| `FS-07` | `XFR-D-M3` | `PRIMARY_MERGED_MEMBER` | Re-identification method/threshold |
| `FS-08` | `XFR-D-006` | `PRIMARY_STANDALONE` | `deal_priority` placement |
| `FS-09` | `XFR-D-007` | `PRIMARY_STANDALONE` | `business_stage_signal` fit-factor legitimacy |
| `FS-10` | `XFR-D-008` | `PRIMARY_STANDALONE` | `budget_headroom` direction/form |
| `FS-11` | `XFR-D-009` | `PRIMARY_STANDALONE` | Missing PRODUCT fields for location/occupancy |
| `FS-12` | `XFR-D-M6` | `PRIMARY_MERGED_MEMBER` | Feature Fit / Evidence Confidence calibration |
| `FS-13` | `XFR-D-010` | `PRIMARY_STANDALONE` | Hard-constraint reason-code catalog and Qualification coordination |
| `FS-14` | `XFR-D-011` | `PRIMARY_STANDALONE` | Geography string-matching method |
| `FS-15` | `XFR-D-012` | `PRIMARY_STANDALONE` | `property_floor` → `floor_option` mapping |
| `FS-16` | `XFR-D-013` | `PRIMARY_STANDALONE` | Operating-expenses mismatch interpretation |
| `FS-17` | `XFR-D-014` | `PRIMARY_STANDALONE` | LEGAL verdict for 20 hard-constraint candidates |
| `FS-18` | `XFR-D-015` | `PRIMARY_STANDALONE` | Full runtime value-state/processing-eligibility representation |
| `FS-19` | `XFR-D-016` | `PRIMARY_STANDALONE` | Lawful Basis Registry → Matching Engine integration contract |

### 4.2. Evaluation Plan

| Source key | Canonical ID | Role | Решение |
|---|---|---|---|
| `EP-01` | `XFR-D-057` | `PRIMARY_STANDALONE` | Allowed label-evidence level per category |
| `EP-02` | `XFR-D-058` | `PRIMARY_STANDALONE` | DISPUTED/INCONCLUSIVE adjudication procedure |
| `EP-03` | `XFR-D-059` | `PRIMARY_STANDALONE` | Grouping/split isolation policy |
| `EP-04` | `XFR-D-060` | `PRIMARY_STANDALONE` | Campaign correction-history handling at freeze |
| `EP-05` | `XFR-D-061` | `PRIMARY_STANDALONE` | False-exclusion maximum and approval owner |
| `EP-06` | `XFR-D-062` | `PRIMARY_STANDALONE` | Dataset size and split ratios |
| `EP-07` | `XFR-D-063` | `PRIMARY_STANDALONE` | Numeric metric targets and approval owner |
| `EP-08` | `XFR-D-064` | `PRIMARY_STANDALONE` | Segment coverage requirements |
| `EP-09` | `XFR-D-M3` | `PRIMARY_MERGED_MEMBER` | Re-identification method/threshold |
| `EP-10` | `XFR-D-M4` | `PRIMARY_MERGED_MEMBER` | Bounded replay tolerance |
| `EP-11` | `XFR-D-065` | `PRIMARY_STANDALONE` | Drift monitoring procedure/metrics/triggers |
| `EP-12` | `XFR-D-066` | `PRIMARY_STANDALONE` | Evaluation Plan artifact approval flow |
| `EP-13` | `XFR-D-067` | `PRIMARY_STANDALONE` | Data Governance role owner/authority |
| `EP-14` | `XFR-D-068` | `PRIMARY_STANDALONE` | Fairness diagnostic framework and legal standard |
| `EP-15` | `XFR-D-069` | `PRIMARY_STANDALONE` | Abstention/unknown terminology policy |
| `EP-16` | `XFR-D-070` | `PRIMARY_STANDALONE` | Threshold-search statistical comparison procedure |
| `EP-17` | `XFR-D-071` | `PRIMARY_STANDALONE` | Outcome correction synchronization with frozen/executed runs |

### 4.3. Risk Policy

| Source key | Canonical ID | Role | Решение |
|---|---|---|---|
| `MRP-01` | `XFR-D-047` | `PRIMARY_STANDALONE` | Risk output representation/runtime identifiers |
| `MRP-02` | `XFR-D-048` | `PRIMARY_STANDALONE` | Risk aggregation formula/precedence |
| `MRP-03` | `XFR-D-049` | `PRIMARY_STANDALONE` | Per-factor evidence sufficiency |
| `MRP-04` | `XFR-D-M2` | `PRIMARY_MERGED_MEMBER` | Risk→routing human-review threshold |
| `MRP-05` | `XFR-D-050` | `PRIMARY_STANDALONE` | Risk calibration dataset/metrics/segments |
| `MRP-06` | `XFR-D-051` | `PRIMARY_STANDALONE` | Missing/conflicting/stale behavior for Risk |
| `MRP-07` | `XFR-D-052` | `PRIMARY_STANDALONE` | Risk reason-reference namespace/values/process |
| `MRP-08` | `XFR-D-053` | `PRIMARY_STANDALONE` | Reviewer authority and Decision Record link |
| `MRP-09` | `XFR-D-054` | `PRIMARY_STANDALONE` | Protected/proxy catalog and lawful basis |
| `MRP-10` | `XFR-D-M3` | `PRIMARY_MERGED_MEMBER` | Re-identification method/threshold |
| `MRP-11` | `XFR-D-M4` | `PRIMARY_MERGED_MEMBER` | Bounded replay tolerance |
| `MRP-12` | `XFR-D-055` | `PRIMARY_STANDALONE` | Risk output → Qualification interface |
| `MRP-13` | `XFR-D-056` | `PRIMARY_STANDALONE` | Duplication-detection mechanism owner/authority |
| `MRP-14` | `XFR-D-005` | `SECONDARY_BOUNDARY_REFERENCE` | TTL boundary: defers to Architecture §37 №11 and Feature Schema |

### 4.4. Qualification Policy

| Source key | Canonical ID | Role | Решение |
|---|---|---|---|
| `MQP-01` | `XFR-D-030` | `PRIMARY_STANDALONE` | Qualification Policy artifact owner/approvers |
| `MQP-02` | `XFR-D-031` | `PRIMARY_STANDALONE` | Runtime representation of four routing results |
| `MQP-03` | `XFR-D-032` | `PRIMARY_STANDALONE` | Eligibility Filter → Qualification mapping |
| `MQP-04` | `XFR-D-033` | `PRIMARY_STANDALONE` | Precedence among simultaneous causes |
| `MQP-05` | `XFR-D-034` | `PRIMARY_STANDALONE` | Minimum mutual-fit threshold |
| `MQP-06` | `XFR-D-035` | `PRIMARY_STANDALONE` | Confidence threshold |
| `MQP-07` | `XFR-D-036` | `PRIMARY_STANDALONE` | Critical-data completeness threshold/rule |
| `MQP-08` | `XFR-D-M1` | `PRIMARY_MERGED_MEMBER` | Per-feature required evidence level |
| `MQP-09` | `XFR-D-M2` | `PRIMARY_MERGED_MEMBER` | Risk→routing threshold/trigger |
| `MQP-10` | `XFR-D-037` | `PRIMARY_STANDALONE` | Definition of critical conflicting evidence |
| `MQP-11` | `XFR-D-038` | `PRIMARY_STANDALONE` | STALE as orthogonal state or routing cause |
| `MQP-12` | `XFR-D-039` | `PRIMARY_STANDALONE` | §25.1 ↔ Qualification reason mapping and catalog owner |
| `MQP-13` | `XFR-D-040` | `PRIMARY_STANDALONE` | Multi-cause output and primary-reason selection |
| `MQP-14` | `XFR-D-041` | `PRIMARY_STANDALONE` | Reviewer queue/authority for human review |
| `MQP-15` | `XFR-D-M4` | `PRIMARY_MERGED_MEMBER` | Probabilistic replay tolerance in Gate context |
| `MQP-16` | `XFR-D-042` | `PRIMARY_STANDALONE` | Segment-specific Qualification policies/thresholds |
| `MQP-17` | `XFR-D-043` | `PRIMARY_STANDALONE` | Qualification version compatibility/supersession |
| `MQP-18` | `XFR-D-044` | `PRIMARY_STANDALONE` | Safe Presentation consumption of routing result |
| `MQP-19` | `XFR-D-045` | `PRIMARY_STANDALONE` | Evaluation evidence for Qualification Gate thresholds |
| `MQP-20` | `XFR-D-046` | `PRIMARY_STANDALONE` | Synthetic-only vs production calibration boundary |

### 4.5. Scoring Policy

| Source key | Canonical ID | Role | Решение |
|---|---|---|---|
| `MSP-01` | `XFR-D-017` | `PRIMARY_STANDALONE` | Mutual Aggregate function |
| `MSP-02` | `XFR-D-M5` | `PRIMARY_MERGED_MEMBER` | Starting/segment weights and minimal thresholds |
| `MSP-03` | `XFR-D-M5` | `PRIMARY_MERGED_MEMBER` | Reciprocal Fit ↔ Deal Feasibility weights |
| `MSP-04` | `XFR-D-018` | `PRIMARY_STANDALONE` | Evidence sufficient for segment override |
| `MSP-05` | `XFR-D-034` | `SECONDARY_BOUNDARY_REFERENCE` | Qualification threshold is out of Scoring scope |
| `MSP-06` | `XFR-D-019` | `PRIMARY_STANDALONE` | Evidence-status → Evidence Confidence calibration |
| `MSP-07` | `XFR-D-020` | `PRIMARY_STANDALONE` | Decimal representation/precision/serialization |
| `MSP-08` | `XFR-D-021` | `PRIMARY_STANDALONE` | Ranking/diversification algorithm and metric |
| `MSP-09` | `XFR-D-022` | `PRIMARY_STANDALONE` | Sensitivity/calibration dataset and targets |
| `MSP-10` | `XFR-D-023` | `PRIMARY_STANDALONE` | Scoring version compatibility/change rules |
| `MSP-11` | `XFR-D-024` | `PRIMARY_STANDALONE` | Priority Score formula/obligation/owner |
| `MSP-12` | `XFR-D-M6` | `PRIMARY_MERGED_MEMBER` | Feature Fit calibration beyond `[0,1]` interface |
| `MSP-13` | `XFR-D-025` | `PRIMARY_STANDALONE` | Weighting among criterion classes |
| `MSP-14` | `XFR-D-M4` | `PRIMARY_MERGED_MEMBER` | Bounded replay tolerance |
| `MSP-15` | `XFR-D-026` | `PRIMARY_STANDALONE` | Synthetic-only vs production calibration boundary |
| `MSP-16` | `XFR-D-027` | `PRIMARY_STANDALONE` | Owner of the specific Architecture §30.3 step |
| `MSP-17` | `XFR-D-028` | `PRIMARY_STANDALONE` | Dimension Score explanation granularity |
| `MSP-18` | `XFR-D-029` | `PRIMARY_STANDALONE` | Technical writer ≠ policy owner guard |

### 4.6. Safe Presentation Policy

| Source key | Canonical ID | Role | Решение |
|---|---|---|---|
| `SPP-01` | `XFR-D-072` | `PRIMARY_STANDALONE` | Per-object-type field allowlist |
| `SPP-02` | `XFR-D-073` | `PRIMARY_STANDALONE` | Presentation object-type registry/reuse |
| `SPP-03` | `XFR-D-074` | `PRIMARY_STANDALONE` | Geographic generalization level |
| `SPP-04` | `XFR-D-M3` | `PRIMARY_MERGED_MEMBER` | Cohort/uniqueness/re-identification method |
| `SPP-05` | `XFR-D-075` | `PRIMARY_STANDALONE` | Combination-risk algorithm |
| `SPP-06` | `XFR-D-076` | `PRIMARY_STANDALONE` | Successive disclosure budget |
| `SPP-07` | `XFR-D-077` | `PRIMARY_STANDALONE` | User-facing safe reason/explanation catalog |
| `SPP-08` | `XFR-D-078` | `PRIMARY_STANDALONE` | Score/confidence/risk/routing presentation wording |
| `SPP-09` | `XFR-D-079` | `PRIMARY_STANDALONE` | Localization governance |
| `SPP-10` | `XFR-D-080` | `PRIMARY_STANDALONE` | Audience/purpose model |
| `SPP-11` | `XFR-D-081` | `PRIMARY_STANDALONE` | Cache/expiry/revocation |
| `SPP-12` | `XFR-D-082` | `PRIMARY_STANDALONE` | Runtime carrier/Data Contracts extension |
| `SPP-13` | `XFR-D-083` | `PRIMARY_STANDALONE` | Evidence for combination/quasi-identifier risk |
| `SPP-14` | `XFR-D-084` | `PRIMARY_STANDALONE` | Safe Presentation artifact approval/change control |

## 5. Merged decisions и count proof

| Canonical ID | Members | Decision owner status |
|---|---|---|
| `XFR-D-M1` | `FS-01`, `MQP-08` | `PRODUCT + AI + Chief AI Architect` — candidate |
| `XFR-D-M2` | `MRP-04`, `MQP-09` | `AI + LEGAL` — source-owned, Architecture §37 №8 |
| `XFR-D-M3` | `FS-07`, `EP-09`, `MRP-10`, `SPP-04` | `PRODUCT + LEGAL` (+ DEVELOPMENT for measurability) — candidate |
| `XFR-D-M4` | `EP-10`, `MRP-11`, `MQP-15`, `MSP-14` | `DEVELOPMENT + AI` — candidate |
| `XFR-D-M5` | `MSP-02`, `MSP-03` | `AI + PRODUCT` — source-owned, Architecture §37 №3 |
| `XFR-D-M6` | `FS-12`, `MSP-12` | `Chief AI Architect + AI` — candidate |

Count proof:

| Mapping class | Source rows | New canonical IDs |
|---|---:|---:|
| `PRIMARY_STANDALONE` | 84 | 84 |
| `PRIMARY_MERGED_MEMBER` | 16 | 6 |
| `SECONDARY_BOUNDARY_REFERENCE` | 2 | 0 |
| **Итого** | **102** | **90** |

Folded references:

- `MSP-05 → XFR-D-034`: Scoring Policy explicitly treats the Qualification threshold as out of its scope.
- `MRP-14 → XFR-D-005`: Risk Policy defers TTL to Architecture §37 №11 and Feature Schema.

### 5.1. Wave 1 decision-status overlay

| Canonical ID | Record | Current status |
|---|---|---|
| `XFR-D-030` | `LeaseMind_MATCHING_DECISION_XFR-D-030_v1.0.md` | Governance owner/approver assignment `APPROVED`; Qualification Policy remains Proposal |
| `XFR-D-031` | `LeaseMind_MATCHING_DECISION_XFR-D-031_v1.0.md` | Responsibility boundary `APPROVED`; exact runtime representation remains `OPEN` |
| `XFR-D-067` | `LeaseMind_MATCHING_DECISION_XFR-D-067_v1.0.md` | Authority model `APPROVED`; named appointment/RBAC remains pending |

### 5.2. Wave 2A Qualification semantics decision-status overlay

Canonical IDs/roles в §4.4 (Qualification Policy crosswalk) не изменены. Ниже — честный overlay статуса шести MQP-строк, разрешённых Wave 2A qualitative governance decisions, с remaining open dependencies.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-032` | `LeaseMind_MATCHING_DECISION_XFR-D-032_v1.0.md` | Qualitative Eligibility→Qualification mapping `APPROVED` | Exact runtime enum/field representation (граница `XFR-D-031`) |
| `XFR-D-033` | `LeaseMind_MATCHING_DECISION_XFR-D-033_v1.0.md` | Qualitative fail-closed precedence hierarchy `APPROVED` | Numeric thresholds, exact runtime algorithm, reason catalog order |
| `XFR-D-037` | `LeaseMind_MATCHING_DECISION_XFR-D-037_v1.0.md` | Qualitative critical-conflict definition `APPROVED` | Numeric threshold, exhaustive critical-field catalog |
| `XFR-D-038` | `LeaseMind_MATCHING_DECISION_XFR-D-038_v1.0.md` | Orthogonal `STALE` semantics `APPROVED` | Runtime carrier/TTL/invalidation mechanics |
| `XFR-D-040` | `LeaseMind_MATCHING_DECISION_XFR-D-040_v1.0.md` | Multi-cause preservation + primary-reason selection rule `APPROVED` | Reason-code catalog values/order (зависит от `XFR-D-039`) |
| `XFR-D-044` | `LeaseMind_MATCHING_DECISION_XFR-D-044_v1.0.md` | Safe Presentation read-only consumption boundary `APPROVED` | Exact wording/allowlist/audience payload (`PRODUCT + LEGAL`) |

Ни один из шести records не утверждает numeric thresholds, reason-code values/catalog order, runtime/API/DB design, `MATCHING_QUALIFICATION_POLICY`/`SAFE_PRESENTATION_POLICY` Proposal approval или implementation authorization.

### 5.3. Wave 2B Feature compatibility decision-status overlay

Canonical IDs/roles в §4.1 (Feature Schema crosswalk) не изменены. Ниже — честный overlay статуса четырёх FS-строк, разрешённых Wave 2B qualitative governance decisions.

| Canonical ID | Record | Current status |
|---|---|---|
| `XFR-D-001` | `LeaseMind_MATCHING_DECISION_XFR-D-001_v1.0.md` | Partial qualitative compatibility `APPROVED` — 13/1/6; 6 mapping cells remain open |
| `XFR-D-002` | `LeaseMind_MATCHING_DECISION_XFR-D-002_v1.0.md` | Partial qualitative compatibility `APPROVED` — 3/0/13; 13 cells/order remain open |
| `XFR-D-012` | `LeaseMind_MATCHING_DECISION_XFR-D-012_v1.0.md` | Wildcard-unrestricted and land-derived `NOT_APPLICABLE` rules `APPROVED`; numeric-to-category convention and exact wildcard `value_state` independently remain open |
| `XFR-D-013` | `LeaseMind_MATCHING_DECISION_XFR-D-013_v1.0.md` | Qualitative mismatch fallback rule `APPROVED`; exact runtime representation and future numeric OPEX field remain open |

Ни один из четырёх records не утверждает Feature Schema Proposal approval, runtime/API/DB/schema implementation или прохождение какого-либо governance gate.

### 5.4. Wave 2C Feature input semantics decision-status overlay

Canonical IDs/роли в §4.1 (Feature Schema crosswalk) не изменены. Ниже — честный overlay статуса двух FS-строк (`FS-11`, `FS-14`), разрешённых Wave 2C qualitative governance decisions.

| Canonical ID | Record | Current status |
|---|---|---|
| `XFR-D-009` | `LeaseMind_MATCHING_DECISION_XFR-D-009_v1.0.md` | v0.1 scope boundary `APPROVED` — derived-вклад 8 из 10 значений `location_priority` и `expected_occupancy_signal` `EXCLUDED_FROM_V0_1`; raw `request_location_priorities`/`request_expected_occupancy_people` сохраняются без изменений; будущее re-entry остаётся независимым open downstream-вопросом |
| `XFR-D-011` | `LeaseMind_MATCHING_DECISION_XFR-D-011_v1.0.md` | Qualitative code-point literal-match baseline `APPROVED` для `region_membership`/`city_membership`/`districts_membership` (№17–19); ни одна строка не возвращает `INCOMPATIBLE_CANDIDATE`; case-folding/Unicode-normalization/alias/catalog-id enhancements остаются независимыми open follow-up |

Ни один из двух records не утверждает Feature Schema Proposal approval, runtime/API/DB/schema implementation или прохождение какого-либо governance gate. Missing PRODUCT-поля для 8 исключённых значений `location_priority`, Property capacity-поле для `expected_occupancy_signal`, а также нормализация/alias/catalog-id для geography-полей остаются отдельными open вопросами, не закрытыми этими records.

### 5.5. Wave 2D Safe Presentation registry decision-status overlay

Canonical IDs/роли в §4.6 (Safe Presentation Policy crosswalk) не изменены. Ниже — честный overlay статуса одной SPP-строки (`SPP-02`), разрешённой Wave 2D qualitative governance decision.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-073` | `LeaseMind_MATCHING_DECISION_XFR-D-073_v1.0.md` | Object-type registry-key reuse `RESOLVED_GOVERNANCE_REGISTRY_REUSE_BOUNDARY` — reuse CTA `property_type` (8 значений) как design-time registry key, no parallel vocabulary, fail-closed evolution rule для будущих/неизвестных значений | `XFR-D-072` field allowlist; показ `property_type`/`property_type_other`; transformation/generalization; combination/re-identification evidence (`XFR-D-M3`, `XFR-D-075`, `XFR-D-083`); runtime carrier (`XFR-D-082`) |

Этот record не утверждает Safe Presentation Policy Proposal approval, runtime/API/DB/schema implementation или прохождение какого-либо governance gate. Architecture §37 вопрос №6 остаётся полностью `OPEN`.

### 5.5.1. Safe Presentation field-allowlist governance owner-review decision-status overlay

Этот отдельный later overlay отражает human-approved `XFR-D-072 v1.0` поверх исторического Wave 2D checkpoint §5.5. Historical §5.5 не переписывается. Canonical identity `SPP-01 → XFR-D-072`, `SPP-02 → XFR-D-073` и counts не меняются.

| Canonical ID | Decision record | Human-approved boundary | Остаётся `OPEN` |
|---|---|---|---|
| `XFR-D-072` | `LeaseMind_MATCHING_DECISION_XFR-D-072_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `PRODUCT + LEGAL`; mandatory approvers `Chief AI Architect + AI + DEVELOPMENT`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval. Default-deny, independent `registry key × field/derived fact × transformation × purpose/audience` row completeness, registry isolation, minimum qualitative evidence categories, joint combination-risk/non-compensation и no-automatic-authorization boundary утверждены | Every actual row; all fields/derived facts/transformations/values; `property_type`/`property_type_other` display; geography; audience/wording/localization; classification/lawful-basis determination; re-identification/combination/successive-disclosure methods, values and evidence (`XFR-D-074`, `XFR-D-M3`, `XFR-D-075`, `XFR-D-076`, `XFR-D-077`–`084`); policy approval, production data, runtime/API/DB/schema/event and implementation |

Record не утверждает Safe Presentation Policy, actual allowlist/evidence, concrete field/value/transformation, legal determination, risk method/value, production-safe payload, runtime carrier или implementation. `XFR-D-073` registry identity не переписывается; отсутствие row — governance absence of authorization, не negative/risk fact. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

### 5.5.2. Safe Presentation geographic-generalization governance owner-review decision-status overlay

Этот отдельный later overlay отражает human-approved `XFR-D-074 v1.0` поверх исторического Wave 2D checkpoint §5.5 и поверх §5.5.1. Historical §5.5 и §5.5.1 не переписываются. Canonical identity `SPP-01 → XFR-D-072`, `SPP-02 → XFR-D-073`, `SPP-03 → XFR-D-074` и counts не меняются.

| Canonical ID | Decision record | Human-approved boundary | Остаётся `OPEN` |
|---|---|---|---|
| `XFR-D-074` | `LeaseMind_MATCHING_DECISION_XFR-D-074_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `PRODUCT + LEGAL`; mandatory approvers `Chief AI Architect + AI + DEVELOPMENT`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval. Exact-address/coordinates unconditional deny сохранён; internal Architecture §§9.4/22.2 analysis отделён от user-facing authorization; default-deny наследуется от `XFR-D-072` (каждое поле требует собственный complete row); district/metro/landmark/travel-time/distance получают ни blanket ban, ни implicit permission; geography-specific evidence дополняет все пятнадцать `XFR-D-072` §3.4 категорий; missing/unknown/conflicting geography блокирует candidate row, не coerced в negative/failed, не AI/heuristic/proxy-imputed, а absence не засчитывается как completed evidence; aggregate/common-case/per-field-PASS/DLP-PASS/synthetic-only evidence не компенсирует rare-location/joint-combination/successive-disclosure insufficiency; explicit non-conflation с `XFR-D-011` (internal literal matching), Architecture §8.4/§30.2/`XFR-D-067` (dataset de-identification), `XFR-D-044` (read-only consumption) и `XFR-D-073` (registry identity) | Exact generalization level, precision, radius, band, range width и любой конкретный geographic field/derived signal; candidate-pool denominator, k-anonymity/cohort/uniqueness/rarity method и любое численное значение (`XFR-D-M3`); combination-risk algorithm и actual evidence (`XFR-D-075`, `XFR-D-083`); successive-disclosure budget (`XFR-D-076`); audience/purpose model (`XFR-D-080`); runtime carrier (`XFR-D-082`); actual `XFR-D-072` allowlist row для любого geographic field; Safe Presentation artifact approval/change control (`XFR-D-084`); production data, policy approval, runtime/API/DB/schema/event design и implementation |

Record не утверждает Safe Presentation Policy, actual allowlist/evidence, concrete geographic field/transformation/value/level, legal determination, re-identification method/value, production-safe payload, runtime carrier или implementation. `XFR-D-072`/`XFR-D-073` boundaries не переписываются и не расширяются; FS-07 (Feature Schema открытое решение №7) остаётся conceptual echo only и canonically maps to merged `XFR-D-M3`, не к `XFR-D-074`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

> **Temporal hygiene note for Safe Presentation §4.6/§15:** §5.5.1 и §5.5.2 являются более поздними owner-review overlays поверх исторического Wave 2D §5.5. Historical text §5.5/§5.5.1 не переписывается; §5.5.1's «Остаётся `OPEN`» столбец, называющий geography/`XFR-D-074` полностью `OPEN`, читается только как checkpoint на момент `XFR-D-072`-only sync — actual current geographic-generalization governance/evidence-prerequisite boundary теперь `PARTIALLY_RESOLVED_BOUNDARY` по §5.5.2, при полностью открытом exact level/method/value.

### 5.5.3. Safe Presentation combination-risk algorithm governance owner-review decision-status overlay

Этот отдельный later overlay отражает human-approved `XFR-D-075 v1.0` поверх исторического Wave 2D checkpoint §5.5, поверх §5.5.1 и поверх §5.5.2. Historical §5.5, §5.5.1 и §5.5.2 не переписываются. Canonical identity `SPP-01 → XFR-D-072`, `SPP-02 → XFR-D-073`, `SPP-03 → XFR-D-074`, `SPP-05 → XFR-D-075` и counts не меняются.

| Canonical ID | Decision record | Human-approved boundary | Остаётся `OPEN` |
|---|---|---|---|
| `XFR-D-075` | `LeaseMind_MATCHING_DECISION_XFR-D-075_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `PRODUCT + LEGAL` (`AI` explicitly не добавлен в owner-пару, несмотря на прежнюю candidate-формулировку Safe Presentation Policy §15 решения №5 «+ `AI`»); mandatory approvers `Chief AI Architect + AI + DEVELOPMENT`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval. Architecture §22.1 unconditional high-risk-combination deny (седьмой пункт deny-списка) сохранён без ослабления; joint review полного одновременного payload утверждён, не per-field-only; combination-set construction method не утверждён; missing/unknown/stale/conflicting assessment или required inputs/evidence блокируют candidate row fail closed, absence не coerced в negative/failed и не AI/heuristic/proxy-imputed; per-field PASS, DLP PASS, aggregate/common-case safety, synthetic-only evidence, high score, Qualification, Presentation Readiness и user acceptance не компенсируют insufficient joint evidence; future combination-risk result — только один из пятнадцати `XFR-D-072` §3.4 evidence categories, никогда independent authorization поля/payload/policy/release/runtime; explicit non-conflation с `XFR-D-072` (actual allowlist rows), `XFR-D-074` (geographic generalization), `XFR-D-M3` (re-identification method/threshold), `XFR-D-076` (successive-disclosure budget), `XFR-D-080` (audience/purpose model), `XFR-D-082` (runtime carrier), `XFR-D-083` (actual combination/quasi-identifier evidence), `XFR-D-084` (artifact approval/change control), `XFR-D-044` (read-only consumption), `XFR-D-067`/Architecture §8.4/§30.2 (dataset de-identification), direct-identifier DLP и Scoring/Risk/Qualification/gate decisions | Algorithm family/formula; feature/input representation; combination-set construction method; cohort/uniqueness/rarity/searchability method, numerator/denominator/counting unit и любое численное значение (`XFR-D-M3`); thresholds/weights/tolerances/aggregation/uncertainty-statistical method; successive-disclosure budget (`XFR-D-076`) и collusion mechanics, включая Cross-Campaign/multi-user collusion (Safe Presentation Policy §8 сценарий 6) — explicitly unassigned adjacent `OPEN` gap, не canonical ID этого record'а; output enum/status/schema; actual evidence и dataset (`XFR-D-083`); audience/purpose model (`XFR-D-080`); runtime carrier (`XFR-D-082`); actual `XFR-D-072` allowlist row для любого поля, использующего этот algorithm; Safe Presentation artifact approval/change control (`XFR-D-084`); production data, policy approval, runtime/API/DB/schema/event design и implementation |

Record не утверждает Safe Presentation Policy, actual allowlist/evidence, concrete algorithm/method/threshold/output, legal determination, re-identification method/value, production-safe payload, runtime carrier или implementation. `XFR-D-072`/`XFR-D-074` boundaries не переписываются и не расширяются. Safe Presentation Policy §8 сценарий 6 (Cross-Campaign/multi-user collusion) не имеет canonical ID и не резолвлен этим record'ом — остаётся explicitly unassigned adjacent `OPEN` gap. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

> **Temporal hygiene note for Safe Presentation §4.6/§15 (combination-risk portion):** §5.5.3 является более поздним owner-review overlay поверх исторических §5.5/§5.5.1/§5.5.2. Historical text не переписывается; там, где §5.5/§5.5.1/§5.5.2 называют combination-risk algorithm полностью `OPEN` без governance/evidence-procedure boundary, это читается только как checkpoint на момент соответствующего sync — actual current combination-risk algorithm governance/evidence-procedure boundary теперь `PARTIALLY_RESOLVED_BOUNDARY` по §5.5.3, при полностью открытых algorithm family/method/threshold/evidence.

### 5.6. Wave 2E Risk aggregation decision-status overlay

Canonical IDs/роли в §4.3 (Risk Policy crosswalk) не изменены. Ниже — честный overlay статуса одной MRP-строки (`MRP-02`), разрешённой Wave 2E qualitative governance decision.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-048` | `LeaseMind_MATCHING_DECISION_XFR-D-048_v1.0.md` | `RESOLVED_QUALITATIVE_BOUNDARY` — multi-component conceptual Risk representation (не runtime vector schema) и conditional non-compensation invariant для отдельно классифицированных critical категорий утверждены; никакой numeric formula, threshold, runtime representation, Risk→Qualification routing interface, policy approval или gate transition этим record'ом не выполнено | `XFR-D-047` (Risk output representation/runtime identifiers); `XFR-D-049` (per-factor evidence sufficiency); `XFR-D-M2` (Risk→routing human-review threshold); `XFR-D-050` (calibration dataset/metrics/segments); `XFR-D-051` (missing/conflicting/stale operational details); `XFR-D-052` (reason-reference namespace); `XFR-D-053` (reviewer authority/Decision Record link); `XFR-D-054` (protected/proxy catalog/lawful basis); `XFR-D-055` (Risk→Qualification interface); `XFR-D-M4` (bounded replay tolerance) |

Этот record не утверждает Risk Policy Proposal approval, runtime/API/DB/schema implementation или прохождение какого-либо governance gate. `XFR-D-033` и `XFR-D-040` (Qualification-level precedence и multi-cause rule) не переоткрыты и не supersedes этим record'ом. Architecture §37 вопрос №8 остаётся полностью `OPEN`.

### 5.7. Wave 2F Scoring semantics decision-status overlay

Canonical IDs/роли в §4.5 (Scoring Policy crosswalk) не изменены. Ниже — исторический Wave 2F overlay трёх MSP-строк (`MSP-10`, `MSP-15`, `MSP-17`) и тогдашнее состояние смежных строк (`MSP-16`, `MSP-18`). Более поздние owner-boundary решения `XFR-D-024`/`XFR-D-027` отражены отдельно в §5.7.1, без переписывания Wave 2F.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-023` | `LeaseMind_MATCHING_DECISION_XFR-D-023_v1.0.md` | `RESOLVED_QUALITATIVE_BOUNDARY` — prospective-only supersession; non-exhaustive breaking baseline с fail-closed классификацией остального; breaking изменение требует нового `scoring_policy_version`, без принудительного увеличения версии неизменённых Feature Schema/Risk/Qualification компонент | Exact semantic-versioning схема (major/minor/patch); bounded replay tolerance; decimal/canonical serialization; exact runtime version-bundle representation |
| `XFR-D-026` | `LeaseMind_MATCHING_DECISION_XFR-D-026_v1.0.md` | `RESOLVED_EVIDENCE_BOUNDARY` — synthetic-only evaluation evidence не устанавливает production calibration/readiness для Mutual Aggregate function, weights или иных Scoring candidates | Dataset size/split ratio/metric target; calibration procedure; acceptance threshold; production-readiness criterion; Architecture §37 №2/№3 |
| `XFR-D-028` | `LeaseMind_MATCHING_DECISION_XFR-D-028_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY`, never fully resolved — только internal existence/separateness/interpretation Dimension Score компонент резолвлена как Scoring-owned | External/user-visible granularity, wording, disclosure — `XFR-D-072` (field allowlist), `XFR-D-077` (reason/explanation catalog); ни один новый owner для них не назначен |

На момент Wave 2F `MSP-16` (`XFR-D-027`) оставался полностью `OPEN`; более поздний `XFR-D-027 v1.0` разрешает только qualitative role boundary и синхронизирован в §5.7.1. `MSP-18` (`XFR-D-029`, anti-conflation guard «technical writer ≠ policy owner») уже задокументирован Scoring Policy §2/§12 как established principle; отдельный decision record для него не требуется и не создан.

Ни один из трёх records не утверждает Scoring Policy Proposal approval, runtime/API/DB/schema implementation или прохождение какого-либо governance gate. `MRP-C-013` (Risk Policy) и `MQP-C-019` (Qualification Policy) не изменены и не supersedes этим Wave. Architecture §37 вопросы №2 и №3 остаются полностью `OPEN`.

### 5.7.1. Scoring governance owner-review decision-status overlay

Canonical IDs и source keys в §4.5 не изменены. Этот отдельный overlay синхронизирует две owner-boundary записи, принятые после Wave 2F; он не переименовывает Wave 2F и не расширяет её semantic scope.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-024` | `LeaseMind_MATCHING_DECISION_XFR-D-024_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner будущей Priority Score policy назначен как `Chief AI Architect + PRODUCT`; mandatory approvers `LEGAL + DEVELOPMENT`, consulted `AI` | Formula, weights, ranking/diversification algorithm, numeric thresholds, activation conditions, runtime/API/DB/schema representation; `XFR-D-018` и `XFR-D-021` остаются независимо `OPEN` |
| `XFR-D-027` | `LeaseMind_MATCHING_DECISION_XFR-D-027_v1.0.md` | `RESOLVED_QUALITATIVE_BOUNDARY` — operational owner шагов Architecture §30.3 №1–3 назначен как `AI + DEVELOPMENT` (`DEVELOPMENT` — technical executor); governance owner record — `Chief AI Architect + PRODUCT`; роли review шага 6 и согласования шага 7 не смешиваются | Exact fixed-sample, label-quality и offline-evaluation procedure/content; quorum, evidence criteria, dataset/metrics, runtime representation и approval Scoring Policy остаются `OPEN` |

Обе записи разрешают только ownership/role semantics. Они не утверждают Priority Score, Scoring Policy Proposal, numeric values, evaluation procedure или implementation и не меняют ни один gate: `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

### 5.8. Wave 2G Evaluation semantics decision-status overlay

Canonical IDs/роли в §4.2 (Evaluation Plan crosswalk) не изменены. Ниже — честный overlay статуса трёх EP-строк (`EP-02`, `EP-03`, `EP-15`), получивших Wave 2G governance decisions. Два records разрешают только fail-closed boundaries; один разрешает qualitative terminology. Evaluation Plan Proposal и Architecture §37 вопрос №10 остаются `OPEN`.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-058` | `LeaseMind_MATCHING_DECISION_XFR-D-058_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — `DISPUTED`/`INCONCLUSIVE` сохраняются раздельно, не coercing в positive/negative/unknown/rejected и не допускаются как resolved ground truth без approved adjudication outcome и `XFR-D-057` mapping | Exact adjudication workflow, blind/double review, quorum, reviewer authority, evidence-level mapping `XFR-D-057`, output/runtime representation и reason catalog |
| `XFR-D-059` | `LeaseMind_MATCHING_DECISION_XFR-D-059_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — до approved exact policy split невалиден; после неё policy-defined overlap, duplicate/replay leakage либо недоказанная isolation приводят к `EVALUATION_RUN_REJECTED` | Exact grouping key/formula/connected-component algorithm, unit of evaluation, version/temporal linkage, split ratios/dataset size `XFR-D-062`, manifest/runtime implementation |
| `XFR-D-069` | `LeaseMind_MATCHING_DECISION_XFR-D-069_v1.0.md` | `RESOLVED_QUALITATIVE_TERMINOLOGY_BOUNDARY` — `unknown` описывает knowledge/fact state, `abstention` — evaluator behavior; они ортогональны, не negative и не Qualification result | Exact triggers, runtime representation, metric definitions/denominators, reason catalog, Qualification routing и Safe Presentation wording |

Эти records не утверждают Evaluation Plan Proposal, dataset/evidence procedure, numeric thresholds, runtime/API/DB/schema implementation или прохождение governance gate. На момент Wave 2G `XFR-D-057` оставался `OPEN`; более поздний owner-review record синхронизирован отдельно в §5.8.1. Exact части `XFR-D-058`/`XFR-D-059`, `XFR-D-060`–`XFR-D-066`, `XFR-D-068`, runtime/reporting части `XFR-D-069` и `XFR-D-070`–`XFR-D-071` остаются независимо `OPEN`; authority model `XFR-D-067` остаётся разрешённым ранее Wave 1, named appointment/RBAC pending.

### 5.8.1. Evaluation label-evidence owner-review decision-status overlay

Canonical ID и source key `EP-01 → XFR-D-057` в §4.2 не изменены. Этот отдельный post-Wave-2G overlay синхронизирует более позднюю qualitative eligibility boundary и не переписывает исторический Wave 2G checkpoint.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-057` | `LeaseMind_MATCHING_DECISION_XFR-D-057_v1.0.md` | `RESOLVED_QUALITATIVE_ELIGIBILITY_BOUNDARY` — five-category eligibility matrix утверждена; deterministic fixtures находятся вне feedback enum; expert/gate/safety/business допуски условны; `SELF_REPORTED` preference ограничена diagnostic/user-specific analysis; unknown combinations fail closed | Exact reviewer/adjudication workflow, quorum, qualifications/authority/independence evidence, source-policy mapping для конкретных gate/safety фактов, Campaign correction handling `XFR-D-060`, runtime representation, production-data/privacy prerequisites |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, numeric thresholds, runtime/API/DB/schema implementation или прохождение governance gate. `XFR-D-058` остаётся частично разрешённым: его qualitative eligibility dependency закрыта `XFR-D-057`, но exact adjudication workflow остаётся `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.2. Evaluation adjudication owner-review decision-status overlay

Canonical ID и source key `EP-02 → XFR-D-058` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-058 v1.1`, который supersedes v1.0, полностью сохраняет его fail-closed boundary и добавляет human adjudication governance procedure. Historical Wave 2G §5.8 и post-Wave-2G label-evidence checkpoint §5.8.1 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-058` | `LeaseMind_MATCHING_DECISION_XFR-D-058_v1.1.md` | `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY` — два разных independent first-level human reviewers фиксируют determinations до просмотра вывода друг друга и образуют quorum при совпадении; disagreement требует distinct third second-level confirmation одного determination либо остаётся unresolved; authority/qualification/independence/conflict checks обязательны; AI не входит в quorum; original evidence/status/determinations immutable; outcome append-only и дополнительно проверяется по `XFR-D-057` | Named appointments, конкретные RBAC IDs, qualification details per category/source, SLA, sampling/re-adjudication policy, conflict-check implementation, runtime/API/DB/schema/event representation, status mapping, reason catalog, production-data/privacy prerequisites |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, numeric thresholds, runtime/API/DB/schema implementation или прохождение governance gate. Human governance procedure больше не `OPEN`; operational appointments и exact runtime contract остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.3. Evaluation grouping-isolation owner-review decision-status overlay

Canonical ID и source key `EP-03 → XFR-D-059` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-059 v1.1`, который supersedes v1.0, полностью сохраняет его fail-closed split-isolation boundary и разрешает conservative connected-component grouping policy. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.2 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-059` | `LeaseMind_MATCHING_DECISION_XFR-D-059_v1.1.md` | `RESOLVED_GROUPING_ISOLATION_BOUNDARY` — closed source-authoritative edge set (`Property`, `TenantRequest`, Campaign, `match_pair_id`, `encounter_id`, source aggregate identity across versions/revisions и explicit correction/supersedes/causal/confirmed duplicate-replay lineage), deterministic transitive closure и atomic one-component-to-one-split rule утверждены; revision/version alone и raw/free-text/AI similarity не создают edge; missing/ambiguous candidate исключается до assignment, а cross-split component fails closed | Campaign correction-history inclusion `XFR-D-060`; dataset size, split ratios, allocation boundaries и seed `XFR-D-062`; metric units/targets; source-specific identity controls; duplicate/replay detection implementation; component/hash/manifest/runtime carrier; remediation; production-data/privacy prerequisites |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, numeric thresholds, runtime/API/DB/schema implementation или прохождение governance gate. Grouping/isolation governance boundary больше не `OPEN`; `XFR-D-060`, `XFR-D-062`, manifest/runtime evidence и implementation остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.4. Evaluation correction-history owner-review decision-status overlay

Canonical ID и source key `EP-04 → XFR-D-060` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-060 v1.0`, который выбирает conservative option B для нового dataset freeze. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.3 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-060` | `LeaseMind_MATCHING_DECISION_XFR-D-060_v1.0.md` | `RESOLVED_CONSERVATIVE_CORRECTION_HISTORY_EXCLUSION_BOUNDARY` — Campaign хотя бы с одной принятой correction до freeze исключается из outcome-derived ground-truth inclusion; ни current effective, ни historical/superseded outcome не используется как label; rejected/no-op command без immutable correction record сама по себе не образует history, но incomplete/ambiguous/conflicting evidence fails closed; exclusion не создаёт negative/failed/unknown/disputed/Qualification status, не стирает canonical edges `XFR-D-059` и не вводит blanket component exclusion | `XFR-D-057`/`XFR-D-058` per-case eligibility evidence; source-history completeness/identity controls; quantitative selection-bias/coverage evidence; `XFR-D-062` size/ratios/allocation/seed; `XFR-D-071` post-freeze synchronization/impact review; manifest/runtime carrier; production-data/privacy prerequisites |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, numeric thresholds, runtime/API/DB/schema implementation или прохождение governance gate. Correction-history option B больше не `OPEN`; exact source controls, post-freeze synchronization, allocation и runtime evidence остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.5. Evaluation false-exclusion governance owner-review decision-status overlay

Canonical ID и source key `EP-05 → XFR-D-061` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-061 v1.0`, который разрешает только governance owner/approver и evidence-prerequisite boundary будущего false-exclusion maximum. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.4 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-061` | `LeaseMind_MATCHING_DECISION_XFR-D-061_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner будущего numeric maximum `Chief AI Architect + AI`; mandatory approvers `PRODUCT + LEGAL + DEVELOPMENT`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval authority. Future maximum относится только к confirmed successful pair, ошибочно исключённой Hard Filter на eligible verified labeling; `XFR-D-057`–`XFR-D-060` обязательны; два отдельных Architecture §34.1 правила `0%` для unknown-as-negative и process-failure-as-negative не получают tolerance, waiver, aggregation или compensation; Campaign→Qualified `40%/25%` не являются surrogate | Numeric maximum и verified baseline; exact numerator/denominator, confidence/uncertainty method, aggregation window и statistical test; complete evidence package; `XFR-D-062`, `XFR-D-064`, `XFR-D-068`, `XFR-D-070` где применимо; independently governed numeric targets/statistics `XFR-D-063`; production-data/privacy prerequisites; runtime/API/DB/schema/event carrier, enforcement, monitoring и rollback |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, numeric threshold, runtime/API/DB/schema implementation или прохождение governance gate. Synthetic-only evidence не создаёт production maximum или production-readiness claim; automatic Hard Constraint changes запрещены. Governance/evidence boundary больше не `OPEN`, но сам numeric maximum и exact metric/statistics остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.6. Evaluation dataset-split governance owner-review decision-status overlay

Canonical ID и source key `EP-06 → XFR-D-062` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-062 v1.0`, который разрешает только governance owner/approver, component-atomic allocation, pre-freeze reproducibility/no-reroll и fail-closed qualitative boundary. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.5 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-062` | `LeaseMind_MATCHING_DECISION_XFR-D-062_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `AI + DEVELOPMENT`; mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`; evidence preparation не заменяет approval. Allocation использует только полные connected components `XFR-D-059 v1.1`; algorithm/inputs/component universe/seed/deterministic mode/assignments фиксируются до просмотра результатов; reroll/reseed/cherry-picking/post-hoc reassignment запрещены; невыполнимые future constraints fail closed без component split, invented tolerance или waiver; assignment не создаёт eligibility и не превращает excluded/unresolved records в negative samples; pilot cap `100 Campaign` и conventional ratios не являются defaults | Numeric dataset size/minimum/ratios/tolerance/counting denominator; exact allocation/stratification/optimization algorithm; seed-generation policy/value; actual dataset/manifest/allocation/run; numeric часть `XFR-D-061`; independently governed numeric targets/statistics `XFR-D-063`; `XFR-D-064`, `XFR-D-068`, `XFR-D-070`, `XFR-D-071`; production-data/privacy prerequisites, named appointment/RBAC, runtime/API/DB/schema/event carrier, implementation/monitoring/rollback |

Record не утверждает Evaluation Plan Proposal, dataset, allocation, evaluation run, production-data use, numeric values, exact runtime/manifest schema или implementation и не переводит governance gate. Qualitative governance/reproducibility boundary больше не `OPEN`, но numeric sufficiency/allocation policy и фактическое evidence остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.7. Evaluation metric-target governance owner-review decision-status overlay

Canonical ID и source key `EP-07 → XFR-D-063` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-063 v1.0`, который разрешает только governance owner/approver, narrow metric-family separation, baseline-first/tuning-final и evidence-prerequisite boundary будущих in-scope metric targets. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.6 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-063` | `LeaseMind_MATCHING_DECISION_XFR-D-063_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner будущих targets `Precision@K`/`Recall@K`/`NDCG@K`/Confidence Score calibration/upper-result diversification — `Chief AI Architect + AI`; mandatory approvers — `PRODUCT + LEGAL + DEVELOPMENT`; evidence-procedure owner — `AI + DEVELOPMENT`, без unilateral approval. Baseline измеряется до approved target; tuning evidence отделено от untouched final evidence; metric families не компенсируют друг друга. Risk Score/human-review, false-exclusion `XFR-D-061`, rank/replay, critical-risk/Qualification, segment/fairness и runtime boundaries не подменяются | Все numeric targets и `K`; exact metric/relevance definitions, numerator/denominator/aggregation, calibration/diversification methods, uncertainty/confidence и statistical comparison; фактические baseline/dataset/manifest/run/evidence package; numeric части `XFR-D-061`/`XFR-D-062`; `XFR-D-064`, `XFR-D-068`, `XFR-D-070`; Risk/human-review/critical-risk/Qualification boundaries; production-data/privacy prerequisites; runtime/API/DB/schema/event carrier, implementation/monitoring/rollback |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, Scoring/Risk/Qualification Policy value, numeric target, `K`, runtime/API/DB/schema implementation или прохождение governance gate. Synthetic-only evidence не создаёт production target или production-readiness claim; automatic model/policy/runtime changes запрещены. Governance/evidence boundary больше не `OPEN`, но все in-scope numeric values и exact metric/statistics остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.8. Evaluation segment-coverage governance owner-review decision-status overlay

Canonical ID и source key `EP-08 → XFR-D-064` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-064 v1.0`, который разрешает только governance owner/approver, evidence-procedure role, missing/unclassified-segment fail-closed handling и non-compensation boundary для segment/bias/proxy diagnostic dataset coverage. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.7 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-064` | `LeaseMind_MATCHING_DECISION_XFR-D-064_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `PRODUCT + LEGAL`; mandatory approvers `Chief AI Architect + AI + DEVELOPMENT`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval authority. Record без определяемого segment-значения не coerced в negative/failed/majority и не молча исключается — учитывается в explicit unclassified/unknown-segment diagnostic-only bucket, не canonical runtime enum; aggregate diagnostic результат не компенсирует segment/intersection insufficiency; privacy small-cell suppression (Architecture §8.4) остаётся отдельно от statistical small-cell sufficiency; pilot cap `100 Campaign` и Campaign→Qualified `40%/25%` не являются surrogate | Segment universe и его исчерпывающесть; protected/proxy классификация каждого segment-измерения и lawful-basis determination (`LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13 открытое решение №9, Feature Schema №9/№17); intersection definitions; numerator/denominator/counting unit; численные minimum counts/ratios/thresholds/tolerances; aggregation/weighting; uncertainty/confidence method и statistical comparison (`XFR-D-070`); sampling/stratification/balancing policy; фактический dataset/manifest/run; production-data authority, named appointment/RBAC (`XFR-D-067` их не заменяет); runtime/API/DB/schema/event carrier, implementation, monitoring, rollback |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, Scoring/Risk/Qualification Policy value, runtime/API/DB/schema implementation или прохождение governance gate. `XFR-D-064` не смешивается с legal fairness standard (`XFR-D-068`), re-identification method/threshold (`XFR-D-M3`), protected/proxy admissibility, numeric metric targets (`XFR-D-063`), false-exclusion maximum (`XFR-D-061`), dataset-size/allocation policy (`XFR-D-062`), Scoring segment-override (`XFR-D-018`) или ranking/diversification algorithm (`XFR-D-021`). Synthetic-only evidence не создаёт production coverage claim; automatic model/policy/runtime changes запрещены. Governance/evidence-prerequisite boundary больше не `OPEN`, но segment universe, protected/proxy classification и любое численное coverage value остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.9. Evaluation drift-monitoring governance owner-review decision-status overlay

Canonical ID и source key `EP-11 → XFR-D-065` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-065 v1.0`, который разрешает только governance owner/approver, monitoring/evidence-procedure role, separation Evaluation Plan от production operational artifact, fail-closed monitoring-evidence handling, monitoring-failure-vs-detected-drift separation, non-compensation и no-automatic-action boundary. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.8 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-065` | `LeaseMind_MATCHING_DECISION_XFR-D-065_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `AI + DEVELOPMENT`; mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`; monitoring/evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval authority. Architecture §30.3 п.9/§54 задают только monitoring/rollback capability и отдельный versioned operational artifact с owner/runbook/escalation для каждого alert, не drift semantics. Evaluation Plan остаётся evidence artifact, production monitoring/SLO — `OUT_OF_SCOPE`; missing/stale/incompatible/lineage-unverified telemetry не является no-drift/pass evidence; monitoring failure и detected drift различаются; signal/alert не выполняет automatic model/policy/routing/release/rollback action; aggregate не маскирует insufficient evidence; synthetic-only evidence не создаёт production claim | Drift taxonomy; monitored objects/populations/fields/distributions; baseline/reference set и refresh/supersession; metric definitions, numerator/denominator/counting unit, missing/stale handling; windows/sample sizes/thresholds/tolerances; uncertainty/statistical method; seasonality/delayed outcomes; aggregation/weighting; false-positive/false-negative procedure; alert levels/SLO/incident classes; named owners/appointments/RBAC, runbooks/escalation, action/rollback triggers; Evaluation Plan approval `XFR-D-066`; production operational-artifact approval; applicable `XFR-D-005`, `XFR-D-057`–`XFR-D-064`, `XFR-D-068`, `XFR-D-070`, `XFR-D-071`, `XFR-D-M4`; production-data/privacy/retention/security authority; runtime/API/DB/schema/event/configuration carrier и implementation |

Record не утверждает Evaluation Plan Proposal, dataset, evaluation run, production-data use, Scoring/Risk/Qualification Policy, model release, operational artifact, SLO, runtime, rollback action, implementation или прохождение governance gate. `XFR-D-065` не смешивается с freshness/TTL (`XFR-D-005`), replay tolerance (`XFR-D-M4`), metric targets (`XFR-D-063`), segment coverage (`XFR-D-064`), Evaluation Plan approval (`XFR-D-066`), Data Governance named appointment/RBAC (`XFR-D-067`), fairness (`XFR-D-068`), `unknown`/`abstention` (`XFR-D-069`), statistical procedure (`XFR-D-070`) или correction synchronization (`XFR-D-071`). Qualitative governance/artifact/evidence boundary больше не `OPEN`, но все exact drift semantics, numeric/statistical contents, operational alerts/actions, operational-artifact approval и implementation остаются `OPEN`. Все три gates остаются `BLOCKED`.

### 5.8.10. Evaluation Plan approval-procedure owner-review decision-status overlay

Canonical ID и source key `EP-12 → XFR-D-066` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-066 v1.0`, который разрешает только exact cross-functional approval procedure для `MATCHING_EVALUATION_PLAN`: artifact owner `AI + DEVELOPMENT` по Architecture §52; approval-flow governance owner `Chief AI Architect + AI + DEVELOPMENT`; Chief AI Architect как mandatory independent architecture reviewer/coordinator; `PRODUCT + LEGAL` как mandatory domain approvers текущего v0.1. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.9 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-066` | `LeaseMind_MATCHING_DECISION_XFR-D-066_v1.0.md` | `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY` — required roles относятся к одному frozen semantic version/SHA-256; sequence: joint `AI + DEVELOPMENT` owner readiness → Chief AI Architect review → separate PRODUCT/LEGAL determinations → same-hash finalization → separate actual approval record → Controlled Artifact Manifest entry last. Для future version только сама potentially affected PRODUCT/LEGAL role может подписать `NOT_APPLICABLE` на exact hash с scope/rationale; ambiguity fail closed; current v0.1 требует обе domain roles. Manifest отражает prior approval, а не создаёт его; любое byte/hash change прекращает текущую approval attempt | Actual approval текущего Evaluation Plan и closure/approved disposition applicable substantive dependencies/Architecture §37 вопроса №10; фактические owner/reviewer/domain attestations на frozen hash; named appointments/authority evidence/RBAC/conflict controls; signature/identity carrier и exact approval-record schema/retention; separate immutable actual approval record; Controlled Artifact Manifest entry и signing/update/revocation mechanism; dataset/dataset manifest/evidence package/evaluation run; production-data/privacy/data-localization approvals; model release, operational artifacts, runtime/API/DB/event/schema representation и implementation |

Record не утверждает текущий Evaluation Plan: он остаётся `Proposal for cross-functional review`. Он не создаёт actual artifact-approval record или Controlled Artifact Manifest entry, не выполняет Architecture §36.2 conditions 2/5 и не утверждает dataset, dataset manifest, evidence package, evaluation run, production-data use, Scoring/Risk/Qualification/Feature/Safe-Presentation Policy, monitoring/SLO artifact, model release, runtime или implementation. `NOT_APPLICABLE` — governance phrase, не новый runtime/API/DB/manifest enum. Approval flow `XFR-D-066` не подменяет substantive Evaluation decisions `XFR-D-057`–`XFR-D-065`/`XFR-D-067`–`XFR-D-071`, Data Governance authority/named appointment, approval flows других controlled artifacts или independent gate conditions. Все три gates остаются `BLOCKED`.

### 5.8.11. Evaluation fairness governance owner-review decision-status overlay

Canonical ID и source key `EP-14 → XFR-D-068` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-068 v1.0`, который разрешает только governance owner/approver roles, diagnostic-vs-legal non-conflation, protected/proxy diagnostic-use, non-compensation and qualitative evidence-prerequisite boundary. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.10 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-068` | `LeaseMind_MATCHING_DECISION_XFR-D-068_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `LEGAL + PRODUCT`; mandatory approvers `Chief AI Architect + AI + DEVELOPMENT`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral legal/product approval. Architecture §30.3 п.4 требует discrimination/proxy check, но не задаёт exact standard. Diagnostic signal не является automatic legal/causal verdict; absence of disparity/labels не доказывает fairness/readiness; aggregate не компенсирует adverse/unevaluable/insufficient segment/intersection evidence. Architecture §17 Risk Score protected/proxy ban не получает waiver; diagnostic-only sensitive-dimension use требует separate purpose-specific LEGAL/PRODUCT/Data Governance/privacy authority и не переносится в model/scoring/routing/runtime; AI/heuristic/proxy imputation отсутствующей classification запрещена | Exact fairness doctrine/legal standard and rights-impact taxonomy; protected/proxy classification catalog and lawful basis; affected population/unit/segment universe/intersections; outcomes/comparators; metrics/numerator/denominator/counting unit/missing-data handling; every numeric threshold/ratio/tolerance/effect-size/severity value; aggregation/weighting; uncertainty/confidence/multiple-comparison/statistical/causal procedure (`XFR-D-070`); remediation criteria; dataset/manifest/run/evidence package; production-data authority, named appointment/RBAC and re-identification controls; actual Evaluation Plan approval/manifest entry; monitoring/runtime/API/DB/schema/event carrier and implementation |

Record не утверждает exact fairness standard, protected class/taxonomy, lawful basis, diagnostic metric/comparator/threshold/statistical method, dataset, Evaluation Plan, production-data use, model/policy/routing change, runtime или implementation. Risk Policy §13 open decision №9 and Feature Schema №9/№17 remain independently `OPEN`; `XFR-D-064`, `XFR-D-M3`, `XFR-D-061`, `XFR-D-063`, `XFR-D-070`, `XFR-D-018`, `XFR-D-021`, `XFR-D-065`, `XFR-D-067` and `XFR-D-066` are not substituted. Conventional 80%/four-fifths, parity/zero-gap/equalized-odds defaults, pilot cap `100 Campaign` and Campaign→Qualified `40%/25%` remain prohibited surrogates. Synthetic-only evidence creates no production/legal-fairness claim; fairness evidence performs no automatic model/policy/runtime action. Все три gates остаются `BLOCKED`.

### 5.8.12. Evaluation threshold-statistics governance owner-review decision-status overlay

Canonical ID и source key `EP-16 → XFR-D-070` в §4.2 не изменены. Этот overlay синхронизирует `XFR-D-070 v1.0`, который разрешает только governance owner/approver roles, pre-registration evidence categories, tuning/final component isolation, comparison compatibility, full-reporting/non-compensation and no-automatic-verdict/action qualitative boundary. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.11 не переписываются.

| Canonical ID | Record | Current status | Remaining open dependency |
|---|---|---|---|
| `XFR-D-070` | `LeaseMind_MATCHING_DECISION_XFR-D-070_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `AI + DEVELOPMENT`; mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval. Before untouched final outcomes versioned pre-registration фиксирует evidence categories, не exact contents; tuning/final evidence component-isolated; direct comparison requires compatible unit, eligibility/grouping/correction policies, schema/policy/metric versions and lineage. Post-selection, cherry-picking, selective reporting, unregistered repeated looks and result-dependent stopping/reruns запрещены. Statistical signal не является automatic practical/legal/fairness/causal/production/release/gate verdict; absence of detected difference не доказывает equivalence/no harm/fairness/no drift; aggregate не компенсирует adverse/unevaluable/insufficient metric/segment/intersection evidence; synthetic-only evidence не создаёт production claim | Exact hypotheses, paradigms, tests/estimators/models/intervals; significance/confidence/power/effect-size/precision/sample-size/margin values; multiple-comparison, sequential/stopping, resampling, equivalence/non-inferiority and deviation procedures; exact metric/denominator/aggregation/missing/delayed/corrected-data treatment; candidate threshold search space/algorithm/selection rule; segment/intersection pooling/weighting/statistical sufficiency; actual pre-registration/dataset/manifest/run/results/evidence package; exact/numeric dependencies `XFR-D-061`–`XFR-D-065`/`XFR-D-068`; `XFR-D-071`; actual Evaluation Plan/policy/production-data approval; named appointments/RBAC; runtime/API/DB/schema/event carrier, implementation, monitoring and rollback |

Record не утверждает exact/numeric statistical method or value, threshold, metric, dataset, evaluation run, Evaluation Plan, Scoring/Risk/Qualification Policy, production-data use, legal/fairness/causal verdict, model/policy/release change, runtime или implementation. `XFR-D-057`–`XFR-D-069` remain independent where applicable; `XFR-D-071` remains `OPEN`, and historical frozen/executed evidence is not rewritten. Conventional/library defaults, pilot cap `100 Campaign` and Campaign→Qualified `40%/25%` remain prohibited surrogates. Statistical evidence performs no automatic Hard Constraint/model/policy/routing/release/runtime action. Все три gates остаются `BLOCKED`.

### 5.8.13. Evaluation post-freeze correction governance owner-review decision-status overlay

Этот overlay отражает later owner-review decision `XFR-D-071 v1.0` поверх исторического Wave 2G checkpoint и §5.8.1–§5.8.12. Historical Wave 2G §5.8 и post-Wave-2G owner-review checkpoints §5.8.1–§5.8.12 не переписываются. Canonical identity `EP-17 → XFR-D-071` и counts не меняются.

| Canonical ID | Decision record | Human-approved boundary | Остаётся `OPEN` |
|---|---|---|---|
| `XFR-D-071` | `LeaseMind_MATCHING_DECISION_XFR-D-071_v1.0.md` | `PARTIALLY_RESOLVED_BOUNDARY` — governance owner `AI + DEVELOPMENT`; mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`; evidence-procedure owner `AI + DEVELOPMENT`, без unilateral approval и без автоматического назначения per-run quorum. Только accepted immutable correction record запускает boundary; rejected/no-op/replay не запускают. Source-authoritative correction/aggregate/component lineage определяет impacted runs; missing/ambiguous/conflicting evidence fails closed. Historical manifest/results/reviews/stages/hashes immutable, impact evidence append-only; affected impact требует new versioned cycle, unresolved остаётся blocked, а `demonstrably unaffected` требует positive complete proof. Governance meanings не runtime enums; historical approvals/releases/gates не отменяются автоматически; evidence, disposition и notification остаются разными facts | Exact query/detector and source-history controls; impact/disposition/notification schema/carrier; per-run quorum, named appointments/RBAC/conflict/appeal; recipients/SLA/ack/retry/escalation/retention; lifecycle/`EVALUATION_RUN_REJECTED` mapping; claim withdrawal/remediation/rollback; actual dataset/manifest/run/impact package; production-data/privacy authority; Evaluation Plan approval; policy/model release, runtime and implementation |

Record не утверждает Evaluation Plan, dataset, evaluation run, production-data use, exact notification/disposition mechanism, event/API/DB field, SLA, reviewer quorum/RBAC, policy/model release, runtime или implementation. `XFR-D-057`–`XFR-D-070` остаются независимыми; pre-freeze exclusion `XFR-D-060` не переписывается. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 6. External normative anchors — вне count 102/90

| Architecture anchor | Source owner | Связь |
|---|---|---|
| §37 №7 — lawful sources for authority/relationship | `LEGAL` | Risk descriptive boundary; собственного canonical ID среди 102 строк нет |
| §37 №10 — dataset/adjudication procedure | `AI + DEVELOPMENT` | Evaluation cluster `XFR-D-057`–`XFR-D-071` collectively; не отдельная local row |
| §37 №11 — freshness/TTL | `PRODUCT + LEGAL + AI` | `XFR-D-005` и secondary `MRP-14` |

§37 №2, №3, №6 и №8 напрямую представлены соответственно `XFR-D-017`, `XFR-D-M5`, `XFR-D-072`, `XFR-D-M2`.

## 7. Documented gaps и dependency order

### `XFR-F1` — Evaluation coverage gap (`MEDIUM`)

Evaluation Plan не содержит metric family для:

- `XFR-D-045` — Qualification Gate thresholds (mutual fit, confidence, completeness);
- `XFR-D-083` — Safe Presentation combination/quasi-identifier re-identification risk.

Оба dependent Proposal честно признают пробел. До Wave 3/4 это остаётся documented gap: нельзя ссылаться на несуществующее Evaluation coverage. Будущая отдельная policy-revision должна добавить placeholder/approved procedure; этот inventory её не создаёт.

### `XFR-F2` — reason-catalog order (`LOW`)

Разные outputs не объединяются. Порядок:

`XFR-D-039` (Qualification mapping/namespace owner, anchor) → `XFR-D-010` (hard-constraint reason codes) и `XFR-D-052` (Risk reason namespace) → `XFR-D-077` (user-facing localized catalog).

Все решения остаются `OPEN`; anchor означает dependency order, не approval. `XFR-D-040 v1.0` (Wave 2A) утвердил multi-cause preservation и primary-reason selection **rule** (Qualification Policy №13, механизм выбора при наличии approved catalog) — это не сами значения/порядок catalog; эта dependency chain остаётся полностью `OPEN`, `XFR-D-040` её не закрывает.

### `XFR-F3` — Qualification runtime owner escalation (`LOW`, `RESOLVED`)

Governance escalation выполнена record `XFR-D-031 v1.0`: semantic owner наследуется от утверждённого `XFR-D-030`, technical schema steward — `DEVELOPMENT`. Finding закрыт только для responsibility boundary; exact runtime representation остаётся `OPEN` и переходит в Wave 7 design.

## 8. Review waves

| Wave | Цель | Вход/ключевые IDs | Выход | Stop condition |
|---:|---|---|---|---|
| 1 | Owner/authority resolution — `COMPLETED` | `XFR-D-030`, `XFR-D-031`, `XFR-D-067` | Три versioned role/authority records | Exact runtime design и named Data Governance appointment не входят в completion |
| 2 | Qualitative policy semantics — `IN PROGRESS — QUALIFICATION SEMANTICS, FEATURE COMPATIBILITY, FEATURE INPUT SEMANTICS, SAFE PRESENTATION REGISTRY, RISK AGGREGATION, SCORING SEMANTICS AND EVALUATION SEMANTICS WAVE 2G RECORDED` (Wave 2A: `XFR-D-032/033/037/038/040/044` complete для Qualification/Safe-Presentation consumption; Wave 2B: records `XFR-D-001/002/012/013` recorded/complete как набор governance decisions для Feature Schema entrance/access-mode/floor/OPEX — сама compatibility semantics НЕ fully complete: entrance (`XFR-D-001`) `PARTIALLY RESOLVED`, 6 cells open; access-mode (`XFR-D-002`) `PARTIALLY RESOLVED`, 13 cells/order open; floor (`XFR-D-012`) `PARTIALLY RESOLVED`, numeric convention и exact wildcard `value_state` open; только OPEX (`XFR-D-013`) `RESOLVED_QUALITATIVE_BOUNDARY` целиком, exact runtime representation/numeric field остаются open; Wave 2C: records `XFR-D-009/011` recorded/complete как набор governance decisions для Feature Schema missing-fields scope boundary и geography string-matching — `XFR-D-009` `RESOLVED_V0_1_SCOPE_BOUNDARY` целиком (future re-entry остаётся отдельным open downstream-вопросом), `XFR-D-011` `RESOLVED_QUALITATIVE_LITERAL_BASELINE` целиком (normalization/alias/catalog-id enhancements остаются open); Wave 2D: record `XFR-D-073` recorded/complete для Safe Presentation object-type registry-key identity — `RESOLVED_GOVERNANCE_REGISTRY_REUSE_BOUNDARY` целиком, field allowlist/`property_type` display/combination-risk evidence/runtime carrier остаются independently open; Wave 2E: record `XFR-D-048` recorded/complete для Risk aggregation qualitative model — `RESOLVED_QUALITATIVE_BOUNDARY` целиком (multi-component representation + conditional non-compensation), weighted aggregation/numeric formula/runtime representation/Risk→Qualification interface остаются independently open (десять named dependencies, §5.6); Wave 2F: records `XFR-D-023/026/028` recorded/complete для Scoring version-compatibility, synthetic-to-production evidentiary boundary и Dimension Score internal ownership — `XFR-D-023` `RESOLVED_QUALITATIVE_BOUNDARY` целиком (semantic-versioning scheme/replay tolerance/runtime representation остаются independently open), `XFR-D-026` `RESOLVED_EVIDENCE_BOUNDARY` целиком (dataset/metrics/procedure/criteria остаются open), `XFR-D-028` `PARTIALLY_RESOLVED_BOUNDARY` — только internal ownership резолвлена, external granularity остаётся open под Safe Presentation (`XFR-D-072`/`XFR-D-077`); `MSP-16`/`XFR-D-027` позднее получил `RESOLVED_QUALITATIVE_BOUNDARY` только для role boundary шагов §30.3 №1–3 (exact procedure/quorum/content остаются open), `MSP-18`/`XFR-D-029` — established guard, no record needed; Wave 2G: records `XFR-D-058/059/069` recorded/complete как governance record package для Evaluation label eligibility, split isolation и terminology — `XFR-D-058`/`XFR-D-059` только `PARTIALLY_RESOLVED_BOUNDARY`, exact procedures остаются open; `XFR-D-069` резолвит qualitative terminology, но runtime/triggers/metrics/routing остаются open; Wave 2G не утверждает Evaluation Plan/evidence plan и не закрывает Architecture §37 №10. Scoring governance и Scoring Policy §12 также НЕ завершены Wave 2F: segment-override evidence, ranking/diversification boundaries, Priority Score content остаётся `OPEN` при разрешённом `XFR-D-024` governance owner; `XFR-D-027` разрешает только role boundary шагов §30.3 №1–3, exact procedure/quorum/content остаются `OPEN`; Safe Presentation field allowlist и combination-risk algorithm pending) | compatibility, precedence, Evaluation qualitative boundaries, Safe Presentation field allowlist, combination-risk algorithm | Reviewable qualitative policy updates | Никаких numeric values до evidence |
| 3 | Evidence-plan approval | `XFR-D-057`–`071`, `XFR-D-045`, `XFR-D-083`; закрытие `XFR-F1` | Approved procedure/manifest, не результаты | Нельзя запускать evaluation без процедуры |
| 4 | Empirical evaluation | Mutual Aggregate, weights, calibration, risk, ranking, re-identification | FROZEN→EXECUTED→REVIEWED evidence record | Tuning и final evidence разделены |
| 5 | Numeric thresholds/calibration | `XFR-D-017`, `M2`, `M3`, `M5`, `M6`, `034`–`036`, `003`, `020` | Versioned numeric candidate values | Числа ещё не делают artifact Approved |
| 6 | Artifact approval/change control | `XFR-D-066`, `XFR-D-084` и отдельные approval records остальных artifacts | Controlled Artifact Manifest decision records | Требуется полный Architecture §30.3 process |
| 7 | Downstream implementation design | `XFR-D-015`, `016`, `031`, `043`, `047`, `055`, `081`, `082` | Data Contracts/runtime design proposals | Implementation gate всё ещё проверяется отдельно |

> **Temporal hygiene note for Wave 2 row:** встроенное описание Scoring отражает checkpoint Wave 2F до owner review. Текущее состояние задаёт более поздний §5.7.1: `XFR-D-024` разрешает только governance owner будущей Priority Score policy, а `XFR-D-027` — только role boundary шагов §30.3 №1–3; вся содержательная policy, exact procedure/quorum/content и реализация остаются `OPEN`.

> **Temporal hygiene note for Safe Presentation portion of Wave 2 row:** встроенное описание Wave 2D/§5.5 отражает исторический registry-only checkpoint. Текущее состояние задают более поздние §5.5.1–§5.5.3: `XFR-D-072 v1.0` разрешает только `PARTIALLY_RESOLVED_BOUNDARY` owner/approver/evidence roles, default-deny, independent-row completeness, registry isolation, minimum qualitative evidence prerequisites, joint combination-risk/non-compensation и no-automatic-authorization semantics; `XFR-D-074 v1.0` — только geographic-generalization governance/evidence-prerequisite boundary; `XFR-D-075 v1.0` — только combination-risk algorithm governance/evidence-procedure boundary. Actual allowlist rows/fields/transformations/values, geographic levels, algorithm contents, methods/thresholds/evidence, policy/runtime/implementation остаются `OPEN`; Cross-Campaign/multi-user collusion остаётся explicitly unassigned adjacent `OPEN` gap; `XFR-D-073` registry identity не переписывается.

> **Temporal hygiene note for Evaluation portion of Wave 2 row:** встроенное описание `XFR-D-058 v1.0`/`XFR-D-059 v1.0` отражает исторический Wave 2G checkpoint. Текущее состояние задают более поздние §5.8.1–§5.8.13: `XFR-D-057` разрешает qualitative label-evidence eligibility, `XFR-D-058 v1.1` — human adjudication governance procedure, `XFR-D-059 v1.1` — connected-component grouping/isolation boundary, `XFR-D-060 v1.0` — conservative correction-history exclusion boundary, `XFR-D-061 v1.0` — только governance owner/approver и evidence-prerequisite boundary будущего false-exclusion maximum, `XFR-D-062 v1.0` — только governance owner/approver, component-atomic allocation, pre-freeze/no-reroll и fail-closed boundary, `XFR-D-063 v1.0` — только governance owner/approver, metric-family separation, baseline-first/tuning-final и evidence-prerequisite boundary будущих in-scope metric targets, `XFR-D-064 v1.0` — только governance owner/approver, evidence-procedure role, missing/unclassified-segment fail-closed handling и non-compensation boundary segment/bias/proxy diagnostic dataset coverage, `XFR-D-065 v1.0` — только governance owner/approver, artifact-separation, fail-closed monitoring-evidence handling, failure-vs-drift separation, non-compensation и no-automatic-action boundary, `XFR-D-066 v1.0` — только exact cross-functional approval procedure для Evaluation Plan с same-hash/manifest-entry-last safeguards, `XFR-D-068 v1.0` — только fairness governance owner/approver, diagnostic-vs-legal non-conflation, protected/proxy diagnostic-use, non-compensation и evidence-prerequisite boundary, `XFR-D-070 v1.0` — только statistical-comparison governance owner/approver, pre-registration, tuning/final isolation, compatibility, full-reporting/non-compensation и no-automatic-verdict/action boundary, а `XFR-D-071 v1.0` — только accepted-correction trigger, impacted-run discovery, immutable-history/append-only impact evidence и no-silent-reuse boundary; numeric maximum/exact metric-statistics, numeric dataset size/ratios/tolerance/exact algorithm/seed policy/value, все numeric targets/`K`/exact metric-statistics `XFR-D-063`, actual dataset/run, actual Evaluation Plan approval/approval record/Controlled Artifact Manifest entry, named appointments/RBAC/signature carrier, segment universe/protected-proxy classification/lawful-basis/numeric coverage `XFR-D-064`, drift taxonomy/monitored population/baselines/metrics/windows/triggers/statistics/alerts/actions/operational artifact/runtime `XFR-D-065`, exact fairness standard/doctrine/classification/population/comparators/metrics/thresholds/statistics/causal/remediation contents `XFR-D-068`, exact/numeric statistical contents `XFR-D-070`, exact notification/disposition/source-history/manifest/runtime contents `XFR-D-071`, production-data prerequisites и прочие dependencies Evaluation cluster остаются `OPEN`.

Перескакивать waves нельзя: owner precedes policy; policy precedes evidence plan; evidence precedes thresholds; approval precedes downstream implementation design.

## 9. Ready-now и blocked categories

- `READY_FOR_OWNER_REVIEW_NOW`: qualitative compatibility/mapping/precedence, missing PRODUCT fields, registry reuse, audience/purpose/localization и artifact approval-process design. Это означает только готовность обсуждать.
- `NEEDS_PRECEDING_POLICY_DECISION`: segment overrides, segment Qualification thresholds, exact combination-risk algorithm contents (governance/evidence-procedure boundary уже `PARTIALLY_RESOLVED_BOUNDARY` по `XFR-D-075 v1.0`).
- `NEEDS_EMPIRICAL_EVIDENCE`: Mutual Aggregate, weights, Qualification thresholds, Risk human-review threshold, re-identification threshold, Feature Fit calibration, ranking metrics.
- `NEEDS_LEGAL_BASIS_OR_SOURCE_CONFIRMATION`: LEGAL verdict for candidates, protected/proxy classification, exact fairness standard contents and Lawful Basis integration; `XFR-D-068 v1.0` resolves only governance/non-conflation/evidence boundary, not these contents.
- `DOWNSTREAM_ONLY_AFTER_GATE`: runtime enums/interfaces, Data Contracts carrier, cache/revocation implementation, integration schemas.
- `OPERATIONAL_APPOINTMENT_PENDING`: named Data Governance authority/RBAC for `XFR-D-067`; отсутствие назначения блокирует dataset use.

> **Current temporal hygiene for `XFR-D-071`:** §5.8.13 является более поздним owner-review overlay поверх исторического Wave 2G и §5.8.1–§5.8.12. Поэтому прежние строки, называющие `XFR-D-071` целиком `OPEN`, читаются только как exact notification/disposition/runtime scope; qualitative trigger/discovery/immutability/no-silent-reuse boundary теперь `PARTIALLY_RESOLVED_BOUNDARY`. Historical text не переписывается.

## 10. Architecture questions и gates

| §37 | Owner | Canonical link | Blocker | Status |
|---:|---|---|---|---|
| №2 Mutual Aggregate | `AI + PRODUCT` | `XFR-D-017` | Evaluation evidence отсутствует | `OPEN` |
| №3 weights/segment thresholds | `AI + PRODUCT` | `XFR-D-M5` | Evaluation/segment evidence отсутствует | `OPEN` |
| №6 Safe Presentation allowlist | `PRODUCT + LEGAL` | `XFR-D-072`, `XFR-D-074`, `XFR-D-075` | Field-allowlist governance/evidence prerequisites `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-072`); geographic-generalization governance/evidence prerequisites also `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-074`); combination-risk algorithm governance/evidence-procedure boundary also `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-075`); actual rows/fields/transformations/values/levels/algorithm contents, `XFR-D-M3`, `XFR-D-076`–`084`, evidence/policy/runtime remain open | `PARTIALLY_RESOLVED_BOUNDARY` |
| №7 lawful sources | `LEGAL` | External anchor | LEGAL source review не выполнен | `OPEN` |
| №8 Risk human-review thresholds | `AI + LEGAL` | `XFR-D-M2` | Risk calibration evidence отсутствует | `OPEN` |
| №10 dataset/adjudication | `AI + DEVELOPMENT` | External anchor / Evaluation cluster | Label-evidence eligibility, human adjudication procedure, grouping/isolation и conservative correction-history exclusion boundaries разрешены `XFR-D-057`/`XFR-D-058 v1.1`/`XFR-D-059 v1.1`/`XFR-D-060 v1.0`; `XFR-D-061 v1.0` разрешает только governance owner/approver и evidence-prerequisite boundary, `XFR-D-062 v1.0` — только governance owner/approver, component-atomic allocation, pre-freeze/no-reroll и fail-closed boundary, `XFR-D-063 v1.0` — только governance owner/approver, metric-family separation, baseline-first/tuning-final и evidence-prerequisite boundary, `XFR-D-064 v1.0` — только governance owner/approver, evidence-procedure role, missing/unclassified-segment fail-closed handling и non-compensation boundary segment/bias/proxy diagnostic dataset coverage, `XFR-D-065 v1.0` — только governance owner/approver, separation Evaluation Plan от production operational artifact, fail-closed monitoring-evidence handling, monitoring-failure-vs-detected-drift separation, non-compensation и no-automatic-action boundary; `XFR-D-066 v1.0` разрешает только exact Evaluation Plan approval procedure с same-hash/manifest-entry-last safeguards; `XFR-D-068 v1.0` разрешает только fairness governance owner/approver, diagnostic-vs-legal non-conflation, protected/proxy diagnostic-use, non-compensation и evidence-prerequisite boundary; `XFR-D-070 v1.0` разрешает только statistical-comparison governance owner/approver, pre-registration, tuning/final isolation, compatible-comparison, full-reporting/non-compensation и no-automatic-verdict/action boundary. Numeric maximum/exact metric-statistics, numeric dataset size/ratios/tolerance/exact algorithm/seed policy/value, все numeric targets/`K`/exact metric-statistics `XFR-D-063`, actual dataset/run, actual Plan approval/approval record/Controlled Artifact Manifest entry, segment universe/protected-proxy classification/lawful-basis/numeric coverage `XFR-D-064`, drift taxonomy/monitored population/baselines/metrics/windows/triggers/statistics/alerts/actions/operational artifact/runtime `XFR-D-065`, exact fairness standard/classification/population/comparators/metrics/thresholds/statistics/causal/remediation contents `XFR-D-068`, exact/numeric statistical contents `XFR-D-070`, `XFR-D-071`, operational appointments/RBAC/signature carrier, source-history/runtime controls и прочие evidence-plan dependencies не утверждены | `OPEN` |
| №11 freshness/TTL | `PRODUCT + LEGAL + AI` | External anchor / `XFR-D-005` | Established method отсутствует | `OPEN` |

`XFR-D-071 v1.0` также разрешает в Evaluation cluster только accepted-correction trigger, source-authoritative impacted-run discovery, immutable-history/append-only impact evidence и no-silent-reuse boundary. Exact notification/disposition/runtime mechanism, actual impact package/run, production-data and implementation remain `OPEN`; все три gates remain `BLOCKED`.

## 11. Следующий формат работы

**Current sync provenance (supersedes the prior sync-pass header below):** Safe Presentation combination-risk algorithm governance owner-review commit `c09fbf5a2acfce65a2964b95ac3a017ed0038018` поверх Safe Presentation geographic-generalization governance owner-review commit `2f622dc4904b525006722d485b23356688c13c7d`, поверх Safe Presentation field-allowlist governance owner-review commit `e9aea580ab1d5181a4305781ce938f69387838a4` и prior chain; base/reviewed commit для этого sync pass — merge commit `47dbc2461a7cf2c554058d1eb8d8d7c2074f1398`, 2026-08-30. Header metadata и §5.5.3 совпадают с этим provenance.

Index ссылается на отдельные decision records, но сам не заменяет их. Wave 1 завершён тремя records; Wave 2A (Qualification semantics) завершён шестью records `XFR-D-032/033/037/038/040/044`; Wave 2B (Feature compatibility) завершён четырьмя records `XFR-D-001/002/012/013`; Wave 2C (Feature input semantics) завершён двумя records `XFR-D-009/011`; Wave 2D (Safe Presentation registry) завершён одним record `XFR-D-073`; отдельный Safe Presentation field-allowlist governance owner-review завершён record `XFR-D-072`; отдельный Safe Presentation geographic-generalization governance owner-review завершён record `XFR-D-074`; отдельный Safe Presentation combination-risk algorithm governance owner-review завершён record `XFR-D-075`; Wave 2E (Risk aggregation) завершён одним record `XFR-D-048`; Wave 2F (Scoring semantics) завершён тремя records `XFR-D-023/026/028`; отдельный Scoring governance owner-review завершён двумя records `XFR-D-024/027`; Wave 2G (Evaluation semantics) завершён тремя records `XFR-D-058 v1.0`/`059 v1.0`/`069`; отдельные Evaluation label-evidence, adjudication, grouping-isolation, correction-history, false-exclusion governance, dataset-split governance, metric-target governance, segment-coverage governance, drift-monitoring governance, Evaluation Plan approval-procedure, fairness-governance, threshold-statistics governance and post-freeze correction governance owner reviews завершены records `XFR-D-057`, `XFR-D-058 v1.1`, `XFR-D-059 v1.1`, `XFR-D-060 v1.0`, `XFR-D-061 v1.0`, `XFR-D-062 v1.0`, `XFR-D-063 v1.0`, `XFR-D-064 v1.0`, `XFR-D-065 v1.0`, `XFR-D-066 v1.0`, `XFR-D-068 v1.0`, `XFR-D-070 v1.0` и `XFR-D-071 v1.0`. Ни одна волна не утверждает Proposal и не снимает gates.

Синхронизированы по состоянию на Safe Presentation combination-risk algorithm governance owner-review commit `c09fbf5a2acfce65a2964b95ac3a017ed0038018` поверх Safe Presentation geographic-generalization governance owner-review commit `2f622dc4904b525006722d485b23356688c13c7d`, поверх Evaluation threshold-statistics governance owner-review commit `f476606ae456e81275a704c34fb6bb0aa8ee298d`, Evaluation fairness governance owner-review commit `b94f580b2739c4b5c8d649facf9b6fd2beb59981`, Evaluation Plan approval-procedure owner-review commit `8d56dded8c826c20e61b09b79749dfd394ff1bcf`, Evaluation drift-monitoring governance owner-review commit `b200a832d4c44f52203da28200701ee922e59e4a`, Evaluation segment-coverage governance owner-review commit `8cb588fb0d613ecc7c76048d2d82870f0fc70954`, Evaluation metric-target governance owner-review commit `7f9fe3bad51ad578e12b1bc29643c6705ba053c7`, Evaluation dataset-split governance owner-review commit `1e586116a0cb5c8dc04830d3bd65e1e487b34f4d`, Evaluation false-exclusion governance owner-review commit `4d71f2c6772559a3a9ebcfa5f6fd9ffa9c42a9e7`, Evaluation correction-history owner-review commit `64c5b251d3bb6c5ecbbd1d0f992460dbc5bb1f64`, Evaluation grouping-isolation owner-review commit `2371109746841469d8519cc74a968ee65a20d898`, Evaluation adjudication owner-review commit `b21c3aba27c23e7f046ef6550841a03b7a6947b9`, Evaluation label-evidence owner-review commit `9dbc8049cbd8b2d14e997111d43649e76e969e01`, Safe Presentation field-allowlist governance owner-review commit `e9aea580ab1d5181a4305781ce938f69387838a4`, ранее зафиксированных Scoring governance owner-review commit `bcee8eb751bb3a61a7bdc91a919c107fe0ce6491` и Wave 2G commit `6f086787ea799941c5bea649c9b90a6bd76eaac6` (base/reviewed commit для этого sync pass — merge commit `47dbc2461a7cf2c554058d1eb8d8d7c2074f1398`, 2026-08-30):

- Qualification Policy: `XFR-D-030` resolved, `XFR-D-031` responsibility resolved / representation open, decision rows №3/№4/№10/№11/№13/№18 — `RESOLVED_QUALITATIVE_BOUNDARY`;
- Safe Presentation Policy: `XFR-D-044` read-only consumption boundary resolved (decision row №8 частично), `XFR-D-038` STALE-boundary отражён в §6.5/§9; decision row №1 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-072`, только governance owner/approver/evidence roles, default-deny, independent-row completeness, registry isolation, qualitative evidence prerequisites, joint combination-risk/non-compensation и no-automatic-authorization; actual allowlist/fields/transformations/values/evidence/policy/runtime remain open); decision row №2 — `RESOLVED_GOVERNANCE_REGISTRY_REUSE_BOUNDARY` (`XFR-D-073`, только registry-key identity; display/combination-risk evidence/runtime carrier остаются open); decision row №3 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-074`, только governance owner/approver/evidence roles, exact-address/coordinates deny, internal/external separation, default-deny inheritance от `XFR-D-072`, conditional geography neither-ban-nor-permission, дополнительные evidence categories, missing/unknown fail-closed handling и non-compensation; exact generalization level/precision/field/re-identification method остаются open; FS-07 остаётся conceptual echo, canonically `XFR-D-M3`, не `XFR-D-074`); decision row №5 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-075`, только governance owner `PRODUCT + LEGAL` без `AI` в owner-паре, mandatory approvers/evidence-procedure roles, Architecture §22.1 unconditional high-risk-combination deny preservation, joint-payload review requirement, missing/unknown fail-closed handling и non-compensation; algorithm family/feature representation/combination-set construction/thresholds/actual evidence остаются open; Cross-Campaign/multi-user collusion, Safe Presentation Policy §8 сценарий 6, остаётся explicitly unassigned adjacent open gap, не resolved этим record'ом);
- Evaluation Plan: decision row №1 — `RESOLVED_QUALITATIVE_ELIGIBILITY_BOUNDARY` (`XFR-D-057`); row №2 — `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY` (`XFR-D-058 v1.1`, named appointments/RBAC/runtime/production-data use remain open); `XFR-D-067` authority model resolved / named appointment pending; row №3 — `RESOLVED_GROUPING_ISOLATION_BOUNDARY` (`XFR-D-059 v1.1`, identity/detection controls и manifest/runtime carrier remain open); row №4 — `RESOLVED_CONSERVATIVE_CORRECTION_HISTORY_EXCLUSION_BOUNDARY` (`XFR-D-060 v1.0`, source-history controls, selection-bias evidence, `XFR-D-071` synchronization, manifest/runtime carrier remain open); row №5 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-061 v1.0`, только governance owner/approver и evidence prerequisites; numeric maximum/baseline/exact metric-statistics, numeric `XFR-D-062`, `XFR-D-064`/`068`, exact/numeric contents `XFR-D-070`, production/runtime остаются open); row №6 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-062 v1.0`, только governance owner/approvers, component-atomic allocation, pre-freeze/no-reroll и fail-closed boundary; numeric size/ratios/tolerance/counting denominator, exact algorithm/seed policy/value, actual dataset/manifest/run, `XFR-D-064`/`068`, exact/numeric `XFR-D-070` и `XFR-D-071` остаются open); row №7 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-063 v1.0`, только governance owner/approvers, metric-family separation, baseline-first/tuning-final и evidence prerequisites; все numeric targets/`K`/exact metric-statistics, `XFR-D-064`/`068`, exact/numeric `XFR-D-070`, Risk/human-review и production/runtime остаются open); row №8 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-064 v1.0`, только governance owner/approvers, evidence-procedure role, missing/unclassified-segment fail-closed handling и non-compensation boundary; segment universe, protected/proxy classification, lawful-basis determination, intersections, numerator/denominator и любой численный coverage minimum остаются open); row №11 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-065 v1.0`, только governance owner/approvers, monitoring/evidence-procedure role, artifact separation, fail-closed monitoring-evidence handling, monitoring-failure-vs-detected-drift separation, non-compensation и no-automatic-action boundary; drift taxonomy/monitored population/baselines/metrics/windows/triggers/statistics/alerts/actions/operational artifact/runtime остаются open); row №12 — `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY` (`XFR-D-066 v1.0`, artifact owner `AI + DEVELOPMENT`, approval-flow governance owner `Chief AI Architect + AI + DEVELOPMENT`, Chief reviewer/coordinator, current v0.1 domain approvers `PRODUCT + LEGAL`, same-hash sequence и manifest-entry-last; actual Plan approval/approval record/manifest entry, appointments/RBAC/carrier и substantive/data/runtime prerequisites остаются open); row №14 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-068 v1.0`, только governance owner `LEGAL + PRODUCT`, mandatory approvers `Chief AI Architect + AI + DEVELOPMENT`, evidence-procedure `AI + DEVELOPMENT`, diagnostic-vs-legal/protected-proxy-use/non-compensation/evidence boundary; exact fairness standard/doctrine/classification/population/comparators/metrics/thresholds/statistics/causal/remediation contents, data authority and runtime remain open); row №15 — `RESOLVED_QUALITATIVE_TERMINOLOGY_BOUNDARY` (`XFR-D-069`, runtime/triggers/metrics/routing remain open);
- Evaluation Plan row №16 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-070 v1.0`, только governance owner `AI + DEVELOPMENT`, mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`, evidence-procedure `AI + DEVELOPMENT`, pre-registration/tuning-final/compatibility/full-reporting/non-compensation/no-automatic-verdict-action boundary; all exact/numeric statistics, actual evidence, policies, production/runtime remain open);
- Feature Schema: decision rows №2/№3/№15 — `PARTIALLY RESOLVED` (`XFR-D-001`/`XFR-D-002`/`XFR-D-012`), decision row №16 — `RESOLVED_QUALITATIVE_BOUNDARY` (`XFR-D-013`), decision row №11 — `RESOLVED_V0_1_SCOPE_BOUNDARY` (`XFR-D-009`), decision row №14 — `RESOLVED_QUALITATIVE_LITERAL_BASELINE` (`XFR-D-011`);
- Risk Policy: decision row №2 — `RESOLVED_QUALITATIVE_BOUNDARY` (`XFR-D-048`, multi-component representation + conditional non-compensation; weighted aggregation/numeric formula/runtime representation/Risk→Qualification interface остаются independently open);
- Scoring Policy: decision row №10 — `RESOLVED_QUALITATIVE_BOUNDARY` (`XFR-D-023`), row №11 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-024`, только governance owner; содержательная Priority Score policy остаётся open), row №15 — `RESOLVED_EVIDENCE_BOUNDARY` (`XFR-D-026`), row №16 — `RESOLVED_QUALITATIVE_BOUNDARY` (`XFR-D-027`, только role boundary шагов §30.3 №1–3; exact procedure/quorum/content остаются open), row №17 — `PARTIALLY_RESOLVED_BOUNDARY` (`XFR-D-028`, только internal ownership; external granularity остаётся open); row №18 (`XFR-D-029`) — established guard, отдельный record не требуется;
- этот inventory: Wave 1, Wave 2A, Wave 2B, Wave 2C, Wave 2D, отдельный Safe Presentation field-allowlist governance owner-review, отдельный Safe Presentation geographic-generalization governance owner-review, отдельный Safe Presentation combination-risk algorithm governance owner-review, Wave 2E, Wave 2F, Scoring governance owner-review, Wave 2G и все Evaluation owner-review status overlays по post-freeze correction включительно (§5.1–§5.8.13, включая §5.5.1, §5.5.2 и §5.5.3).

Следующий узкий package определяется оставшимися evidence-ready qualitative decisions: Scoring governance и Scoring Policy §12 НЕ завершены (segment-override evidence, ranking/diversification boundaries и содержательная Priority Score policy остаются `OPEN`; `XFR-D-027` разрешает role boundary шагов §30.3 №1–3, но exact procedure/quorum/content остаются `OPEN`); Evaluation Plan qualitative label-evidence eligibility разрешена `XFR-D-057`, human adjudication governance procedure — `XFR-D-058 v1.1`, grouping/isolation boundary — `XFR-D-059 v1.1`, conservative correction-history exclusion — `XFR-D-060 v1.0`, `XFR-D-061 v1.0` разрешает только governance owner/approver и evidence prerequisites будущего false-exclusion maximum, `XFR-D-062 v1.0` — только governance owner/approvers, component-atomic allocation, pre-freeze/no-reroll и fail-closed boundary, `XFR-D-063 v1.0` — только governance owner/approvers, metric-family separation, baseline-first/tuning-final и evidence prerequisites будущих in-scope targets, `XFR-D-064 v1.0` — только governance owner/approvers, evidence-procedure role, missing/unclassified-segment fail-closed handling и non-compensation boundary segment/bias/proxy diagnostic dataset coverage, `XFR-D-065 v1.0` — только governance owner/approvers, artifact-separation, fail-closed monitoring-evidence handling, monitoring-failure-vs-detected-drift separation, non-compensation и no-automatic-action boundary, `XFR-D-066 v1.0` — только exact cross-functional Evaluation Plan approval procedure с same-hash, role-signed applicability и manifest-entry-last safeguards, `XFR-D-068 v1.0` — только fairness governance owner/approver, diagnostic-vs-legal, protected/proxy diagnostic-use, non-compensation and evidence-prerequisite boundary, а `XFR-D-070 v1.0` — только statistical-comparison governance owner/approvers, pre-registration, tuning/final isolation, compatible-comparison, full-reporting/non-compensation и no-automatic-verdict/action boundary. Numeric части `XFR-D-061`/`XFR-D-062`/`XFR-D-063`, operational appointments/runtime, segment universe/protected-proxy classification/lawful-basis/numeric coverage `XFR-D-064`, drift taxonomy/monitored population/baselines/metrics/windows/triggers/statistics/alerts/actions/operational artifact/runtime `XFR-D-065`, actual Evaluation Plan approval и execution evidence, separate approval record, Controlled Artifact Manifest entry, named appointments/RBAC/signature carrier/schema, exact fairness standard/doctrine/classification/population/comparators/metrics/thresholds/statistics/causal/remediation contents `XFR-D-068`, runtime/reporting части `XFR-D-069`, exact/numeric statistical contents `XFR-D-070` и `XFR-D-071` остаются `OPEN`; `XFR-D-063` не подменяет ни `XFR-D-061`, ни `XFR-D-062`, ни соседние Risk/segment/fairness/statistical decisions; `XFR-D-064` не подменяет `XFR-D-068`/`XFR-D-M3`/`XFR-D-063`/`XFR-D-061`/`XFR-D-062`; `XFR-D-065` не подменяет `XFR-D-005`/`XFR-D-M4`/`XFR-D-063`/`XFR-D-064`/`XFR-D-066`–`071`; `XFR-D-066` не подменяет substantive Evaluation decisions, dataset/data authority или approval flows других controlled artifacts; `XFR-D-068` не подменяет classification/lawful-basis, segment coverage, re-identification, statistics, Scoring overrides/ranking or runtime decisions; `XFR-D-070` не подменяет metric/target, dataset sufficiency, fairness/legal, drift, correction synchronization, policy approval or runtime decisions. Safe Presentation `XFR-D-072 v1.0` разрешает только governance/evidence-prerequisite boundary; `XFR-D-074 v1.0` разрешает только geographic-generalization governance/evidence-prerequisite boundary (роли, exact-address/coordinates deny, internal/external separation, default-deny inheritance, conditional geography neither-ban-nor-permission, дополнительные evidence categories, missing/unknown fail-closed handling, non-compensation); `XFR-D-074` не подменяет `XFR-D-M3` (re-identification method/threshold, FS-07 conceptual echo only), `XFR-D-011` (internal literal matching), Architecture §8.4/§30.2/`XFR-D-067` (dataset de-identification), `XFR-D-044` или `XFR-D-073`; `XFR-D-075 v1.0` разрешает только combination-risk algorithm governance/evidence-procedure boundary (роли — governance owner `PRODUCT + LEGAL` без `AI` в owner-паре, mandatory approvers, evidence-procedure owner, Architecture §22.1 unconditional high-risk-combination deny preservation, joint-payload review requirement, missing/unknown fail-closed handling, non-compensation, prerequisite-not-authorization boundary); `XFR-D-075` не подменяет `XFR-D-M3`, `XFR-D-072`, `XFR-D-074`, `XFR-D-076`, `XFR-D-080`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084`, `XFR-D-044` или `XFR-D-067`; Cross-Campaign/multi-user collusion (Safe Presentation Policy §8 сценарий 6) остаётся explicitly unassigned adjacent open gap, не resolved `XFR-D-075`; actual allowlist rows/fields/transformations/values/levels/algorithm contents/evidence, `XFR-D-M3`, `XFR-D-076`–`084`, Safe Presentation Policy approval, production applicability и runtime design остаются pending. Никаких numeric values, production claims или runtime design до соответствующего evidence/decision.

**Current overlay coverage:** inventory includes Safe Presentation field-allowlist governance owner-review §5.5.1, Safe Presentation geographic-generalization governance owner-review §5.5.2, Safe Presentation combination-risk algorithm governance owner-review §5.5.3 and Evaluation post-freeze correction governance owner-review §5.8.13; canonical identities `SPP-01 → XFR-D-072`, `SPP-02 → XFR-D-073`, `SPP-03 → XFR-D-074`, `SPP-05 → XFR-D-075`, `EP-17 → XFR-D-071`, 102 source keys, 90 canonical IDs and the 17-row Evaluation Plan register are unchanged.

## 12. Acceptance criteria

### `XFR-C-001` — полное покрытие
Все 102 source keys присутствуют ровно один раз в crosswalk.

### `XFR-C-002` — доказанный canonical count
Distinct canonical ID count равен 90: 84 standalone + 6 merged; две secondary rows не создают ID.

### `XFR-C-003` — отсутствие коллизий
Каждый canonical ID имеет одно значение; `XFR-D-017` означает только Mutual Aggregate, а `FS-13` использует `XFR-D-010`.

### `XFR-C-004` — owner honesty
Candidate owner нигде не представлен как source-owned; отсутствие owner остаётся escalation.

### `XFR-C-005` — evidence before numbers
Review waves не допускают numeric weights/thresholds до approved evidence plan и empirical evidence.

### `XFR-C-006` — Evaluation gaps видимы
`XFR-D-045` и `XFR-D-083` не считаются покрытыми существующей Evaluation Plan metric family.

### `XFR-C-007` — reason dependency не свёрнута
`XFR-D-039 → {XFR-D-010, XFR-D-052} → XFR-D-077`; четыре outputs остаются разными.

### `XFR-C-008` — Architecture questions остаются OPEN
§37 №2, №3, №6, №7, №8, №10, №11 явно `OPEN`.

### `XFR-C-009` — gates остаются BLOCKED
Три governance gates не изменены.

### `XFR-C-010` — отсутствие authorization
Inventory не утверждает Proposal, schema/runtime design, implementation или production use.

## 13. Итог

На reviewed commit доказано: 102 локальные open-decision строки отображаются в 90 canonical decisions без пропусков, orphan IDs или коллизий. Inventory готов только как informational index для будущего cross-functional owner review.

`DECISION PACKAGE INDEXED — WAVE 1 GOVERNANCE ASSIGNMENTS RECORDED — WAVE 2A QUALIFICATION SEMANTICS RECORDED — WAVE 2B FEATURE COMPATIBILITY SEMANTICS RECORDED — WAVE 2C FEATURE INPUT SEMANTICS RECORDED — WAVE 2D SAFE PRESENTATION REGISTRY RECORDED — WAVE 2E RISK AGGREGATION RECORDED — WAVE 2F SCORING SEMANTICS RECORDED — NO PROPOSAL APPROVED`
