# LeaseMind MATCHING CROSS-FUNCTIONAL DECISION INVENTORY

**Версия:** 1.0
**Дата:** 2026-08-23
**Статус:** `Cross-functional decision inventory — records decision status; does not authorize implementation or approve any Proposal`
**Reviewed repository commit:** `5ebcd898a60b825e54077524777141ed2db238f8`
**Wave 1 decision records commit:** `a5fe497b9d297ef9ca4e342b636f214417bf230a`
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

Все решения остаются `OPEN`; anchor означает dependency order, не approval.

### `XFR-F3` — Qualification runtime owner escalation (`LOW`, `RESOLVED`)

Governance escalation выполнена record `XFR-D-031 v1.0`: semantic owner наследуется от утверждённого `XFR-D-030`, technical schema steward — `DEVELOPMENT`. Finding закрыт только для responsibility boundary; exact runtime representation остаётся `OPEN` и переходит в Wave 7 design.

## 8. Review waves

| Wave | Цель | Вход/ключевые IDs | Выход | Stop condition |
|---:|---|---|---|---|
| 1 | Owner/authority resolution — `COMPLETED` | `XFR-D-030`, `XFR-D-031`, `XFR-D-067` | Три versioned role/authority records | Exact runtime design и named Data Governance appointment не входят в completion |
| 2 | Qualitative policy semantics | compatibility, precedence, missing fields, aggregation candidate, presentation registry | Reviewable qualitative policy updates | Никаких numeric values до evidence |
| 3 | Evidence-plan approval | `XFR-D-057`–`071`, `XFR-D-045`, `XFR-D-083`; закрытие `XFR-F1` | Approved procedure/manifest, не результаты | Нельзя запускать evaluation без процедуры |
| 4 | Empirical evaluation | Mutual Aggregate, weights, calibration, risk, ranking, re-identification | FROZEN→EXECUTED→REVIEWED evidence record | Tuning и final evidence разделены |
| 5 | Numeric thresholds/calibration | `XFR-D-017`, `M2`, `M3`, `M5`, `M6`, `034`–`036`, `003`, `020` | Versioned numeric candidate values | Числа ещё не делают artifact Approved |
| 6 | Artifact approval/change control | `XFR-D-066`, `XFR-D-084` и отдельные approval records остальных artifacts | Controlled Artifact Manifest decision records | Требуется полный Architecture §30.3 process |
| 7 | Downstream implementation design | `XFR-D-015`, `016`, `031`, `043`, `047`, `055`, `081`, `082` | Data Contracts/runtime design proposals | Implementation gate всё ещё проверяется отдельно |

Перескакивать waves нельзя: owner precedes policy; policy precedes evidence plan; evidence precedes thresholds; approval precedes downstream implementation design.

## 9. Ready-now и blocked categories

- `READY_FOR_OWNER_REVIEW_NOW`: qualitative compatibility/mapping/precedence, missing PRODUCT fields, registry reuse, audience/purpose/localization и artifact approval-process design. Это означает только готовность обсуждать.
- `NEEDS_PRECEDING_POLICY_DECISION`: segment overrides, segment Qualification thresholds, combination-risk algorithm.
- `NEEDS_EMPIRICAL_EVIDENCE`: Mutual Aggregate, weights, Qualification thresholds, Risk human-review threshold, re-identification threshold, Feature Fit calibration, ranking metrics.
- `NEEDS_LEGAL_BASIS_OR_SOURCE_CONFIRMATION`: LEGAL verdict for candidates, protected/proxy classification, fairness standard, Lawful Basis integration.
- `DOWNSTREAM_ONLY_AFTER_GATE`: runtime enums/interfaces, Data Contracts carrier, cache/revocation implementation, integration schemas.
- `OPERATIONAL_APPOINTMENT_PENDING`: named Data Governance authority/RBAC for `XFR-D-067`; отсутствие назначения блокирует dataset use.

## 10. Architecture questions и gates

| §37 | Owner | Canonical link | Blocker | Status |
|---:|---|---|---|---|
| №2 Mutual Aggregate | `AI + PRODUCT` | `XFR-D-017` | Evaluation evidence отсутствует | `OPEN` |
| №3 weights/segment thresholds | `AI + PRODUCT` | `XFR-D-M5` | Evaluation/segment evidence отсутствует | `OPEN` |
| №6 Safe Presentation allowlist | `PRODUCT + LEGAL` | `XFR-D-072` | `XFR-D-M3` и LEGAL review | `OPEN` |
| №7 lawful sources | `LEGAL` | External anchor | LEGAL source review не выполнен | `OPEN` |
| №8 Risk human-review thresholds | `AI + LEGAL` | `XFR-D-M2` | Risk calibration evidence отсутствует | `OPEN` |
| №10 dataset/adjudication | `AI + DEVELOPMENT` | External anchor / Evaluation cluster | Owner review не выполнен | `OPEN` |
| №11 freshness/TTL | `PRODUCT + LEGAL + AI` | External anchor / `XFR-D-005` | Established method отсутствует | `OPEN` |

## 11. Следующий формат работы

Index ссылается на отдельные decision records, но сам не заменяет их. Wave 1 завершён тремя records; они не утверждают Proposal и не снимают gates.

Следующий governance package — Wave 2 qualitative policy semantics. Перед ним синхронизируются:

- Qualification Policy: `XFR-D-030` resolved и `XFR-D-031` responsibility resolved / representation open;
- Evaluation Plan: `XFR-D-067` authority model resolved / named appointment pending;
- этот inventory: Wave 1 status overlay.

Wave 2 не выбирает численные значения и не начинает runtime design.

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

`DECISION PACKAGE INDEXED — WAVE 1 GOVERNANCE ASSIGNMENTS RECORDED — NO PROPOSAL APPROVED`
