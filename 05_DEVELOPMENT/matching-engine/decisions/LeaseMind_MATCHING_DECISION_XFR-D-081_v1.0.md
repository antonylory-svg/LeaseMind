# LeaseMind Matching Decision Record — XFR-D-081

**Decision ID:** `XFR-D-081`

**Название:** Cache/expiry/revocation governance/evidence boundary for Safe Presentation

**Версия:** 1.0

**Дата решения:** 2026-09-01

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-09-01 working session

**Repository baseline:** `cbf9b0ff11e177bc95d57e961be07c0ca16cd46c`

**Canonical identity:** `SPP-11 → XFR-D-081`, `PRIMARY_STANDALONE`, Cache/expiry/revocation.

**Governance owner:** `DEVELOPMENT + AI`

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`

**Evidence-procedure owner:** `DEVELOPMENT + AI`; evidence design, measurement, or mechanism-candidate preparation does not grant unilateral approval and does not substitute mandatory-approver determination.

**Role-authority note.** Technical lifecycle ownership assigned here does **not** replace `PRODUCT + LEGAL` as the source-normative owner of `SAFE_PRESENTATION_POLICY` (Architecture §52) and Architecture §37 question №6. This record deliberately departs from the tripartite `PRODUCT + LEGAL` governance-owner pattern used eight times already (`XFR-D-072/074/075/076/077/078/079/080`) because cache/expiry/revocation is a serving-mechanism question, not a content-governance question — the same distinction Safe Presentation Policy §15 already draws by giving rows 11–12 (this row and runtime carrier) `DEVELOPMENT`-led candidate owners while the listed tripartite content-governance rows (1/3/5/6/7/8/9/10) use `PRODUCT + LEGAL`. `XFR-D-073`/row 2 also has flat owner `PRODUCT + LEGAL`, but is excluded from that eight-record tripartite count because its earlier record uses a single `Owner` field rather than the governance-owner/mandatory-approvers/evidence-procedure split and resolves registry-key reuse rather than this role-pattern question. `PRODUCT + LEGAL` are retained as mandatory approvers, not owner, specifically because Architecture §53 test 9 shows this mechanism carries direct compliance exposure (see §2).

**Depends on:** `XFR-D-038 v1.0` (STALE/actionability semantics — preserved, not restated), `XFR-D-044 v1.0` (read-only presentation consumption — preserved and applied to cached serving without scope expansion), `XFR-D-072 v1.0` (actual field/payload row, applicability/requiredness — parallel prerequisite), `XFR-D-076 v1.0` (successive-disclosure history/reset/counting — this record does not create or imply a reset trigger), `XFR-D-078 v1.0`/`XFR-D-079 v1.0` (wording/localization element behavior — untouched), `XFR-D-080 v1.0` (audience/purpose binding and its deliberately open fail-closed granularity — this record does not resolve that granularity by implication). Runtime carrier `XFR-D-082`, actual evidence `XFR-D-083`, artifact approval/change control `XFR-D-084` and feature-level TTL `XFR-D-005` remain independent `OPEN` decisions.

---

## 1. Вопрос

Какова governance/evidence boundary будущего Safe Presentation cache/expiry/revocation mechanism, чтобы owner/approver roles, non-authoritative-cache principle, invalidation-precedence rule (особенно source-owned lawful-basis invalidation), fail-closed handling отсутствующего/устаревшего/несовместимого prerequisite и non-compensation были однозначны, но ни один TTL, cache key, event, consistency mechanism, cascade granularity или runtime carrier не были преждевременно разрешены — и явно разведено от downstream Reveal/Introduction Record lifecycle machinery и от feature-level TTL (`XFR-D-005`)?

## 2. Source/status discipline

Architecture §37 вопрос №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами широкого вопроса о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY`. Architecture не называет владельца именно cache/expiry/revocation sub-вопроса напрямую.

**Architecture §53, сценарий 9 (`SOURCE_NORMATIVE`, дословно):** «Прекращение/отзыв lawful basis | Блокируются ingestion, **cache reuse**, recalculation и model use; запускается retention workflow». Это прямое, не аналогийное упоминание «cache reuse» в источнике — единственное такое упоминание во всей Architecture — и оно напрямую увязывает cache reuse с той же fail-closed дисциплиной, что ingestion и recalculation, при прекращении/отзыве правового основания.

Architecture §11/§40/§40.1 (`SOURCE_NORMATIVE`) устанавливают Lawful Basis/Consent Registry единственным writer'ом lawful-basis статуса; `LAWFUL_BASIS_INVALIDATED`/`LAWFUL_BASIS_REVOKED` — canonical incoming events (§29.1) с `reason_code`; consumer projections не откатывают событие со старой версией. Последнее правило не является source-нормативным обещанием zero-lag delivery для Safe Presentation и не создаёт отсутствующий Safe Presentation consistency mechanism.

Architecture §26 rule 1 («каждый результат связан с версиями входов») и rule 2 («устаревший результат не перезаписывается, а получает `SUPERSEDED`») — прецедент versioned-result дисциплины на уровне Match, применённый здесь по аналогии к presentation serving, не по прямой цитате.

Architecture §32 (таблица «Ошибки и безопасная деградация»): «Модель или правило недоступны → используется только утвержденная fallback-версия либо расчет блокируется» — прямой Architecture-прецедент того, что единственные два допустимых ответа на отсутствие текущего актуального входа — approved fallback либо fail-closed block, никогда guessed/implicit fallback.

Architecture §34.3 («доля результатов, ошибочно оставшихся актуальными после изменения входа или правил — 0%») — operational reliability target для Matching результатов в целом, analogy-only для presentation cache correctness; этот record явно не превращает его в numeric threshold для Safe Presentation.

Architecture §§43–44 (Reveal Gate Snapshot `valid_until`/`fencing_token`/`reveal_guard_epoch`, source-owned leases `expires_at`, `PAYMENT_TO_REVEAL_SAGA`/`REVEAL_SAGA` timeouts) — полностью downstream Reveal Service/Introduction Record Service machinery (Architecture §40 writer matrix), структурно отдельная lifecycle с другими actors и другой failure semantics (CAS, guard epoch, fencing token), которых Safe Presentation не имеет и не должен заимствовать.

Repo-wide проверка `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` подтверждает отсутствие Safe-Presentation-специфичного cache carrier. Наблюдаемые `expires_at`/`valid_until` и invalidation-event поля относятся к downstream Reveal/Introduction machinery, source-owned invalidation или generic infrastructure вроде idempotency-result retention; ни одно такое вхождение не является Safe Presentation cache authority.

Feature Schema §8 («Freshness matrix», precedent, не source) задаёт пять freshness-классов (revision-bound, event-invalidated, time-bound, immutable evidence, external gate status) и явно утверждает: «Ни один численный TTL... не зафиксирован как норма этим документом» — открытое решение `FS-06 → XFR-D-005` (owner `PRODUCT + AI`) остаётся отдельным, feature-level вопросом, не Safe Presentation cache TTL.

Safe Presentation Policy §9 (`DECISION_CANDIDATE_FOR_REVIEW`) содержит `generated-at`/`valid-until` и «invalidation/revocation reference» как candidate-level поля будущего evidence bundle — «не утверждённая JSON schema, DTO, таблица, event или API». §12 п.3 отдельно называет cache среди presentation-специфичных каналов, нуждающихся в собственных negative tests (`DECISION_CANDIDATE_FOR_REVIEW`) — это смежный, но отдельный DLP-вопрос (вероятно `XFR-D-083` territory), не resolved этим record'ом. §15 решение №11 (прочитано дословно): «Cache/expiry/revocation | `DEVELOPMENT + AI` (candidate) | Candidate» — соседняя строка №12 («Runtime carrier/Data Contracts extension») независимо использует ещё один паттерн, `DEVELOPMENT + Chief AI Architect» — подтверждает, что сам Proposal уже разводит content-governance rows (1/3/5/6/7/8/9/10, все `PRODUCT + LEGAL`) от mechanism rows (11/12, `DEVELOPMENT`-led).

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `DEVELOPMENT + AI`.** Human-approved departure от `PRODUCT + LEGAL`-owner pattern, обоснованная тем, что cache/expiry/revocation — serving-mechanism вопрос, а не content-governance вопрос; тот же structural distinction, что Safe Presentation Policy §15 уже проводит между rows 1–10 и rows 11–12.
2. **Mandatory approvers — `Chief AI Architect + PRODUCT + LEGAL`.** `PRODUCT + LEGAL` сохранены как mandatory approvers (не owner) из-за прямой compliance exposure, показанной Architecture §53 test 9 (cache reuse после lawful-basis revocation).
3. **Evidence-procedure owner — `DEVELOPMENT + AI`.** Готовит candidate mechanism/evidence, но не принимает mandatory-approver determination и не становится unilateral approver.
4. Technical lifecycle ownership этого record'а не заменяет `PRODUCT + LEGAL` как source-normative owner `SAFE_PRESENTATION_POLICY` (Architecture §52) и Architecture §37 вопроса №6 в целом.

### 3.2. Non-authoritative cache principle

1. Cache является derived и non-authoritative.
2. Cache HIT, prior Presentation Readiness или previous validity не создают, не продлевают, не восстанавливают и не переносят presentation authorization.
3. Cached presentation может обслуживаться только пока каждый applicable source/profile/Qualification/policy/row/wording/localization/audience-purpose/evidence prerequisite остаётся current и compatible.

### 3.3. Fail-closed handling — без изобретения cascade granularity

1. Missing, unknown, stale, expired, revoked, invalidated, conflicting или version/hash-incompatible state fails closed для затронутого candidate scope.
2. Он не создаёт presentation authorization.
3. Он не становится negative business fact.
4. Он не меняет Eligibility, Hard Constraints, score, rank, Confidence, Risk, Qualification или routing.
5. **Exact cascade granularity — element, row, payload или artifact — остаётся `OPEN` и не изобретается этим record'ом**, ни выбором одного варианта, ни исключением остальных. Это сознательно зеркалит тот же принцип, уже применённый `XFR-D-080` к audience/purpose granularity — `XFR-D-072`'s row-level evidence structура не проецируется чисто на caching layer, и ни один источник не резолвит этот вопрос для cache specifically.

### 3.4. Historical/audit vs. current actionable

Historical/audit state остаётся отличимым от current actionable presentation — прямое сохранение `XFR-D-038` без переоткрытия. Этот record не изобретает retention, deletion или storage mechanics для этого разведения.

### 3.5. Invalidation precedence — source-owned lawful basis

Source-owned lawful-basis invalidation/revocation не может быть отложена, переопределена или скомпенсирована TTL, cache HIT, previous success, задержанным/отсутствующим event, высоким score, Qualification, DLP PASS, user acceptance, business urgency или synthetic-only evidence. Прямое основание — Architecture §53 test 9.

### 3.6. No approved consistency mechanism

Ни один Safe Presentation consistency mechanism не approved этим record'ом. Reveal leases, token TTL, minimum-expiry calculation, `reveal_guard_epoch`, fencing, CAS или Introduction Record expiry не импортируются как Safe Presentation authority — downstream, структурно отдельная lifecycle (Architecture §§43–44, §40).

### 3.7. Controlled-origin boundary

Implicit или unapproved last-known-good fallback, inheritance, default policy hash, guessed binding, cache-key coercion и cross-recipient/audience/purpose reuse запрещены. Этот record не создаёт и не запрещает навсегда отдельно approved future fallback — вопрос остаётся `OPEN` до отдельного решения.

### 3.8. Prerequisite, не authorization

Revalidation — только prerequisite. Она не авторизует field, row, payload, Policy, release, runtime или governance gate самостоятельно.

### 3.9. `XFR-D-076` non-reset boundary

Cache eviction, expiry, rebuild или revalidation не доказывает `XFR-D-076` successive-disclosure reset. Является ли re-serving cached bytes новым disclosure для целей successive-disclosure accounting — остаётся `OPEN`, не resolved этим record'ом.

### 3.10. Non-compensation

Authentication, previous success, TTL survival, high score, high Confidence, low Risk, Qualification, Presentation Readiness, DLP PASS, business urgency, user acceptance или synthetic-only evidence не компенсируют отсутствующий/неактуальный cache prerequisite.

### 3.11. Явное non-conflation

Этот record explicitly не переоткрывает, не расширяет, не поглощает и не подменяет:

1. `XFR-D-038` — STALE/actionability semantics;
2. `XFR-D-044` — read-only consumption;
3. `XFR-D-072` — actual field/payload row, applicability/requiredness;
4. `XFR-D-076` — disclosure history/reset/counting;
5. `XFR-D-078`/`XFR-D-079` — wording/localization element behavior;
6. `XFR-D-080` — audience/purpose binding и его сознательно открытую granularity;
7. `XFR-D-082` — runtime carrier/API/DB/schema/event/cache implementation;
8. `XFR-D-083` — actual evidence/tests, включая cache-channel DLP negative tests (SPP §12 п.3);
9. `XFR-D-084` — artifact approval/change control;
10. `XFR-D-005` — feature-level TTL (Feature Schema class 3);
11. Reveal/Introduction Record lifecycles (Architecture §§43–44) — downstream, независимые.

### 3.12. Presentation, scoring и gate separation

Согласовано со всем кластером: cache/expiry/revocation governance не пересчитывает и не меняет Eligibility, Hard Constraints, score, rank, Qualification, Confidence, Risk или routing. Успешная revalidation не авторизует поле/row/payload и не обходит downstream gates.

### 3.13. Partial, never fully resolved

`XFR-D-081` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner (departure from `PRODUCT + LEGAL`-owner pattern, human-approved), mandatory approvers, evidence-procedure role, non-authoritative-cache principle, fail-closed handling (без выбора cascade granularity), historical-vs-current preservation, source-owned lawful-basis invalidation precedence, no-approved-consistency-mechanism boundary, controlled-origin boundary, prerequisite-not-authorization, `XFR-D-076` non-reset boundary, non-compensation и explicit non-conflation разрешены qualitatively.

TTL/valid-until derivation, cache key/binding dimensions, tiers, invalidation-trigger catalog, event names/payloads, consistency mechanism, validation strategy, atomic serve/revalidate mechanics, fallback/recovery mechanics, cascade granularity, statuses/enums/error codes, eviction/retention/audit behavior, encryption/RBAC, successive-disclosure counting of re-served bytes, evidence package и production applicability остаются `OPEN`. Будущее точное решение требует нового versioned `XFR-D-081` record с `supersedes`.

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` preserved as source-normative owner (not this record's owner) | Actual artifact approval/change control `XFR-D-084` |
| Cache/expiry/revocation mechanism governance | `XFR-D-081 v1.0` (этот record) | Roles, non-authoritative-cache principle, fail-closed boundary, invalidation precedence, no-consistency-mechanism boundary | TTL, cache key, tiers, triggers, mechanism, granularity |
| Lawful-basis invalidation authority | Architecture §§11/40/40.1; Lawful Basis/Consent Registry | Preserved as precedence-controlling; cache reuse block cited (§53 test 9) | Integration carrier/propagation latency |
| STALE/actionability | `XFR-D-038 v1.0` | Preserved, not restated | N/A |
| Read-only consumption | `XFR-D-044 v1.0` | Preserved and applied to cached serving without scope expansion | N/A |
| Field allowlist / requiredness | `XFR-D-072 v1.0` | Untouched | Every actual row |
| Successive-disclosure/reset | `XFR-D-076 v1.0` | Non-reset boundary preserved | Re-serving-as-disclosure question |
| Wording/localization | `XFR-D-078`/`XFR-D-079` | Untouched | Exact wording/locale |
| Audience/purpose granularity | `XFR-D-080 v1.0` | Untouched, not resolved by implication | Its own fail-closed granularity |
| Runtime carrier | `XFR-D-082` | No carrier inferred (confirmed absent from Data Contracts) | API/DB/event/schema/cache implementation |
| Actual evidence | `XFR-D-083` | Dependency preserved; includes SPP §12 п.3 cache-channel DLP gap | Actual evidence package/dataset |
| Feature-level TTL | `XFR-D-005` (Feature Schema class 3) | Explicitly independent | Its own numeric value |
| Reveal/Introduction Record lifecycle | Architecture §§43–44; Reveal Service/Introduction Record Service | Explicitly non-imported | N/A — structurally downstream |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. Что остаётся `OPEN`

- numeric или qualitative TTL и valid-until derivation;
- cache key и binding dimensions;
- server/CDN/browser/client/offline/preload tiers;
- dependency и invalidation-trigger catalog;
- event names, topics и payloads;
- propagation latency, SLO и consistency mechanism;
- polling, event-driven и read-through validation;
- authoritative read strategy;
- atomic serve/revalidate, races, fencing и CAS;
- unapproved stale grace/stale-while-revalidate, retry, fallback и recovery mechanics;
- regeneration versus re-attestation;
- cascade granularity: element, row, payload или artifact;
- statuses, enums и error codes;
- eviction, deletion, tombstone, retention и audit behavior;
- encryption, access control и RBAC;
- replay и idempotency;
- считается ли cache re-serving successive disclosure;
- evidence dataset, tests, metrics и thresholds (`XFR-D-083`);
- Safe Presentation Policy approval, production applicability и runtime implementation (`XFR-D-082`, `XFR-D-084`).

## 6. Rationale

Cache/expiry/revocation is the first record in this cluster where the human-approved role pattern deliberately breaks from the eight-times-repeated `PRODUCT + LEGAL`-owner precedent, and the record must say so explicitly rather than letting a reader assume continuity. The justification is structural, not arbitrary: Safe Presentation Policy's own §15 already treats rows 11–12 (mechanism questions) differently from rows 1–10 (content-governance questions), and Architecture never names a source-normative owner for this specific sub-question the way it does for the broad artifact/question. At the same time, `PRODUCT + LEGAL` cannot be dropped entirely — Architecture §53 test 9 is a direct, non-analogical citation tying cache reuse to lawful-basis compliance, which is exactly the class of risk `PRODUCT + LEGAL` exists to gate in this cluster. Retaining them as mandatory approvers rather than owner reflects both facts without overclaiming either.

The decision to leave cascade granularity `OPEN` mirrors the same restraint `XFR-D-080` already applied to audience/purpose: `XFR-D-072`'s per-row evidence structure does not cleanly map onto a caching layer, which may fail at the level of a single derived field, an entire allowlist row, a full payload, or an entire cached artifact — no source resolves which, and selecting one here would silently narrow future evidence design the same way inventing audience/purpose granularity would have.

## 7. Adversarial cases

1. **Cache HIT without current prerequisite validation.** A cached payload is served without confirming current row/wording/locale/audience-purpose bindings. Rejected §3.2.
2. **Delayed `LAWFUL_BASIS_REVOKED` while cached content is served.** Rejected §3.5 — Architecture §53 test 9 direct citation; TTL survival does not compensate.
3. **Reveal lease `expires_at` imported as Safe Presentation `valid-until`.** Rejected §3.6 — downstream, structurally distinct.
4. **Cache eviction/revalidation treated as an `XFR-D-076` reset.** Rejected §3.9.
5. **Missing/stale cache interpreted as a negative Match fact.** Rejected §3.3 п.3.
6. **Synthetic-only evidence treated as production-safe caching proof.** Rejected §3.10.
7. **Element/row/payload/artifact granularity silently selected by a future sync.** Rejected §3.3 п.5 — this record explicitly leaves it `OPEN`.
8. **Cached re-serving silently excluded from successive-disclosure accounting.** Flagged §3.9 — remains `OPEN`, not resolved either way.
9. **Implicit last-known-good fallback used without separate approval.** Rejected §3.7.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §9 (`generated-at`/`valid-until`/invalidation-reference candidate framing preserved, not promoted), §15 решение №11 (roles), readiness matrix, `SPP-C-020` and relevant acceptance criteria may receive this governance/evidence boundary without any actual TTL, key, or mechanism;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — new owner-review overlay `§5.5.9` for `SPP-11 → XFR-D-081`, without rewriting historical Wave 2D/§5.5/§5.5.1–§5.5.8 checkpoints;
- no Architecture, Data Contracts, Feature Schema, Evaluation Plan, manifest, runtime or implementation changes in any future sync of this record.

No future sync may interpret this record as an approved TTL, cache key, event, consistency mechanism, cascade granularity, runtime carrier, Safe Presentation Policy approval, actual evidence, dataset, evaluation run, production-safe payload, or implementation authorization.

## 9. Change control

Изменение role allocation, non-authoritative-cache rule, invalidation precedence, fail-closed/non-compensation boundary, cascade-granularity `OPEN` status или non-conflation matrix требует нового versioned `XFR-D-081` record с `supersedes`, согласованного `DEVELOPMENT + AI + Chief AI Architect + PRODUCT + LEGAL`.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** governance authority, **when** roles are checked, **then** owner is `DEVELOPMENT + AI`, mandatory approvers are `Chief AI Architect + PRODUCT + LEGAL`, evidence-procedure owner `DEVELOPMENT + AI` has no unilateral approval, and `PRODUCT + LEGAL` remain source-normative owner of `SAFE_PRESENTATION_POLICY`/Architecture §37 №6 independently of this record.
2. **Given** a cache HIT, **when** current prerequisites are not confirmed, **then** no presentation authorization exists.
3. **Given** `LAWFUL_BASIS_INVALIDATED`/`REVOKED`, **when** cached presentation exists, **then** cache reuse is blocked per Architecture §53 test 9, regardless of TTL, previous success, or delayed event delivery.
4. **Given** Reveal lease/token/`reveal_guard_epoch`/fencing state, **when** cited as Safe Presentation cache authority, **then** the claim is rejected as downstream.
5. **Given** cache eviction, expiry, rebuild, or revalidation, **when** claimed to reset `XFR-D-076`'s successive-disclosure budget, **then** the claim is rejected.
6. **Given** missing/stale/conflicting/version-incompatible cache state, **when** evaluated, **then** it fails closed for the affected scope without becoming a negative fact or changing Eligibility/Hard Constraints/score/rank/Confidence/Risk/Qualification/routing.
7. **Given** cascade granularity (element/row/payload/artifact), **when** requested, **then** none is selected or excluded — it remains explicitly `OPEN`.
8. **Given** `XFR-D-038`, `XFR-D-044`, `XFR-D-072`, `XFR-D-076`, `XFR-D-078`, `XFR-D-079`, `XFR-D-080`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084`, `XFR-D-005`, and Reveal/Introduction Record lifecycles, **when** this record is applied, **then** none is reopened, expanded, absorbed, or substituted.
9. **Given** high score, high Confidence, low Risk, Qualification, Presentation Readiness, DLP PASS, business urgency, user acceptance, or synthetic-only evidence, **when** a cache prerequisite is missing, **then** none compensates.
10. **Given** this record, **when** Safe Presentation Policy approval, actual TTL, cache key, event, consistency mechanism, dataset, production-data sufficiency, or runtime/API/DB/schema/event/cache design is checked, **then** none is approved.
11. **Given** Eligibility/Hard Constraints/score/rank/Confidence/Risk/Qualification/routing/policy/runtime/gate state, **when** this record is applied, **then** none changes automatically and all three gates remain `BLOCKED`.

## 12. Итог

`XFR-D-081 CACHE/EXPIRY/REVOCATION GOVERNANCE BOUNDARY APPROVED — TTL, CACHE KEY, EVENTS, CONSISTENCY MECHANISM, CASCADE GRANULARITY, RUNTIME CARRIER, EVIDENCE, POLICY AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
