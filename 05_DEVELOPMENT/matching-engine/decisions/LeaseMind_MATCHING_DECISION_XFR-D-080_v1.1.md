# LeaseMind Matching Decision Record — XFR-D-080

**Decision ID:** `XFR-D-080`

**Название:** Audience/purpose model governance/evidence boundary for Safe Presentation

**Версия:** 1.1

**Дата решения:** 2026-09-21

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-09-21 working session

**Repository baseline:** `7a3ab784e30ce62ac469f041fa71beb7652fca44`

**Supersedes:** `LeaseMind_MATCHING_DECISION_XFR-D-080_v1.0.md` prospectively, as an additive overlay only. Historical presentations, decisions, audience/purpose taxonomy/identity/mapping/granularity versions/hashes and references remain bound to their original v1.0 record, baseline `f34680a5fcd7e16aa6441a8fc0b21fc0f92e2cbb` and artifact versions/hashes; v1.1 does not backfill, reinterpret, relabel, replace or overwrite them.

**Canonical identity:** Inventory mapping `SPP-10 → XFR-D-080`, `PRIMARY_STANDALONE` (`LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` §5.5.8); repository canonical counts remain 102 source keys / 90 canonical IDs.

**Scope:** only the human-approved qualitative G6 coordination overlay on top of the unchanged v1.0 audience/purpose model governance/evidence boundary. v1.1 preserves every v1.0 substantive section, all v1.0 roles, invariants, dependencies, non-conflations, `OPEN` items and future-sync scope, all ten adversarial cases (§7 п.1–10) and all thirteen acceptance criteria (§11 п.1–13); it adds only coordinated G6 synthetic/test-package semantics (§3.14) and additive `OPEN`/adversarial/acceptance hygiene. It approves no audience/purpose taxonomy, identity representation/key, compatibility mapping, fail-closed granularity, policy, Data Contracts extension, runtime or implementation.

**Governance owner:** `PRODUCT + LEGAL`

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence design, measurement, or binding-candidate preparation does not replace joint `PRODUCT + LEGAL` governance ownership, does not grant unilateral approval, and does not substitute `PRODUCT`/`LEGAL` determination.

**Depends on:** `XFR-D-072 v1.0` (actual field/payload row, applicability/requiredness, intended purpose/audience as a per-row evidence dimension — parallel prerequisite, not a nested evidence category), `XFR-D-076 v1.0` (successive-disclosure budget/reset — this record does not create or imply a reset trigger), `XFR-D-077 v1.0` (catalog origin/content), `XFR-D-078 v1.0` (score/confidence/risk/routing wording semantics), `XFR-D-079 v1.0` (linguistic/UI localization), `XFR-D-044 v1.0` (read-only presentation consumption — preserved, not reopened). Cache/expiry/revocation `XFR-D-081`, runtime carrier `XFR-D-082`, actual evidence `XFR-D-083` and artifact approval/change control `XFR-D-084` remain independent `OPEN` decisions. G6 coordination with sibling Safe Presentation records, including `XFR-D-079 v1.1` and `XFR-D-078 v1.1`, does not authorize, approve, resolve or substitute any sibling, and no sibling authorizes, approves, resolves or substitutes this record.

---

## 1. Вопрос

Какова governance/evidence boundary будущей audience/purpose model для Safe Presentation, чтобы owner/approver roles, explicit-binding requirement, compatibility-without-merger с authoritative processing-purpose model, controlled-origin/non-inference requirement и fail-closed handling отсутствующего/неоднозначного binding были однозначны, но ни одна taxonomy, identity representation, mapping или runtime carrier не была преждевременно разрешена — и явно разведено от Reveal recipient-machinery и от Lawful Basis/Consent Registry authority?

## 2. Source/status discipline

Architecture §37 вопрос №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами широкого вопроса о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY` — тот же owner-anchor, уже применённый семь раз (`XFR-D-072/074/075/076/077/078/079`). Safe Presentation Policy §15 решение №10 (прочитано дословно): «Audience/purpose model (конкретный получатель presentation payload) | `PRODUCT + LEGAL` | Candidate, по аналогии с purpose-binding принципом §11 Architecture» — в отличие от прежнего `XFR-D-079` (`PRODUCT`-only candidate), здесь candidate owner уже совпадает с established sibling pattern; role-widening decision не требуется.

Architecture §11 («Общая модель значения и доказательства») задаёт для каждого значимого параметра профиля отдельный блок правового основания: `lawful_basis_id`, «Цель обработки — конкретная совместимая цель, для которой значение получено и используется», `lawful_basis_source`, `lawful_basis_version`, «Срок действия основания», `lawful_basis_status` (`ACTIVE`, `EXPIRED`, `REVOKED`, `TERMINATED`, `SUSPENDED`, `UNDER_REVIEW`), «Прекращение/отзыв». Feature Schema §3.3 (precedent, не source) отражает этот блок как `lawful_basis_id`/`processing_purpose`/`lawful_basis_source`/`lawful_basis_version`/`lawful_basis_validity`/`lawful_basis_status`/`lawful_basis_termination_ref` и утверждает дословно: «Единственный writer `lawful_basis_id`, цели, версии, срока и отзыва основания — существующий Lawful Basis/Consent Registry (Architecture §11, §21.3, §40.1). Этот документ не создаёт альтернативный источник этих полей и не заменяет Registry». Architecture §40 (нормативная матрица writers) независимо подтверждает Lawful Basis/Consent Registry единственным writer'ом правового основания, цели, срока и отзыва; потребители получают только purpose-bound versioned projections и не продлевают/не восстанавливают/не заменяют основание самостоятельно. Feature Schema §10 пункт 19 подтверждает, что даже интеграционный контракт (API/событие) самой upstream lawful-basis/purpose projection остаётся `OPEN` (owner `Chief AI Architect + DEVELOPMENT + LEGAL`) — ни один источник не специфицирует его.

**Критически важное разведение.** «Цель обработки» (processing purpose, Architecture §11) — модель законности обработки данных, привязанная к `lawful_basis_id` и управляемая Lawful Basis/Consent Registry. Ничто в Architecture не утверждает, что она тождественна presentation purpose (кому и зачем показывается конкретный Safe Presentation payload) — это разные вопросы с разными кандидатами на владение содержанием и разными вероятными carrier'ами. Data Contracts repo-wide проверка (`recipient_party_id`, `purpose_code`, `lawful_basis_id`) подтверждает: `purpose_code` присутствует в payload событий `LAWFUL_BASIS_INVALIDATED`/`LAWFUL_BASIS_REVOKED`, а `lawful_basis_id` также используется в Participation/Introduction Record контекстах; ни одно из этих вхождений не является Safe Presentation audience/purpose carrier. Каждое вхождение `recipient_party_id` находится в Reveal Token/Reveal Attempt/internal mTLS command контексте (Reveal Service, Introduction Record Service) — ни один Safe Presentation-специфичный audience/purpose/recipient carrier не найден.

Safe Presentation Policy §9 («Presentation artifact concept — не runtime schema», `DECISION_CANDIDATE_FOR_REVIEW`) содержит: «audience/purpose binding — конкретный `party_id`-получатель, не любой аутентифицированный пользователь». Это остаётся кандидатной формулировкой самого Proposal, не approved schema field.

Architecture §22.3 («После раскрытия») и §43 («Reveal Gate Snapshot и fencing») задают отдельную, полностью downstream recipient-модель: «выдача выполняется только получателю, зафиксированному в Записи»; Snapshot содержит normalized party bindings `OWNER + TENANT`, `recipient_party_id` в Reveal Token/Attempt (Data Contracts), purpose-bound tokens и manifest-hash binding — всё это управляется Reveal Service/Introduction Record Service (Architecture §40), не Safe Presentation, и происходит строго после `PRE_REVEAL_LOCKED → REVEAL_COMMITTED`, то есть после того, как Safe Presentation уже показан.

Safe Presentation Policy §8 сценарий 6 (Cross-Campaign/multi-user collusion) остаётся explicitly unassigned adjacent `OPEN` gap — `XFR-D-075` и `XFR-D-076` уже дважды явно отказались его резолвить; этот record продолжает ту же явную дисциплину.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `PRODUCT + LEGAL`.** Прямой Architecture §37 №6/§52 pair, совпадает с уже существующим candidate Safe Presentation Policy §15 решения №10 без отклонения.
2. **Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.** Precedent-based расширение того же паттерна, уже применённого семь раз для того же артефакта/вопроса.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Готовит candidate binding evidence/matrix, но не принимает PRODUCT/LEGAL determination и не становится unilateral approver.
4. Ни одна роль не заменяет другую; owner-пара не одобряет audience/purpose taxonomy единолично.

### 3.2. Explicit-binding requirement

1. Кандидатный presentation payload требует explicit, versioned binding к конкретному recipient context, audience и intended presentation purpose.
2. Существование binding недостаточно само по себе — оно должно быть применимо (applicable) к конкретному candidate row/payload на текущей policy version/hash.
3. Binding не выводится из отсутствия deny, из внутреннего использования, из UI mockup или из implementation convenience — та же positive-authorization логика, что уже утверждена `XFR-D-072` §3.2.

### 3.3. Processing-purpose vs. presentation-purpose separation

1. Presentation purpose должен быть совместим с authoritative processing purpose (Architecture §11 «Цель обработки», `lawful_basis_status = ACTIVE`), но эти две модели не сливаются в один enum, code, mapping или carrier.
2. Lawful Basis/Consent Registry остаётся единственным writer'ом processing-purpose/lawful-basis статуса (Architecture §11/§40, Feature Schema §3.3). Этот record не создаёт альтернативный источник, echo или override lawful basis.
3. Compatibility check (presentation purpose ↔ processing purpose) — концептуальное требование; exact mapping/compatibility rule остаётся `OPEN`.

### 3.4. Controlled-origin и non-inference boundary

1. Wildcard, implicit default, inheritance от другого recipient/audience/purpose и silent secondary reuse запрещены.
2. Guessed или AI-derived audience не допускается.
3. Locale, защищённые/proxy-признаки, device/channel, членство в Campaign, score, Qualification, prior presentation и внутренняя схема не доказывают recipient/audience/purpose — прямое применение Architecture §5 принципа 11 («Matching Engine не использует защищенные персональные признаки или их скрытые заменители»), для которого `XFR-D-079` является direct sibling precedent. `XFR-D-074` §3.7 п.3 (запрет AI/heuristic/proxy-восстановления missing geography) и `XFR-D-078` (Risk-specific запрет protected features/proxies по Architecture §17) содержат смежные analogous protections, но не цитируются здесь как отдельные прямые применения §5 принципа 11.

### 3.5. Fail-closed handling — без изобретения granularity

1. Missing, ambiguous, stale, conflicting или version-incompatible binding fails closed для затронутого candidate scope.
2. Он не создаёт presentation authorization.
3. Он не становится negative business fact.
4. Он не меняет Eligibility, Hard Constraints, score, rank, Confidence, Risk, Qualification или routing.
5. **Exact fail-closed granularity — element, row или whole payload — остаётся `OPEN` и не изобретается этим record'ом.** В отличие от `XFR-D-077`/`XFR-D-078`/`XFR-D-079`, которые уже зафиксировали «только candidate element», этот record сознательно не выбирает ни одну из трёх granularity, поскольку ни один источник (Architecture, `XFR-D-072`, Safe Presentation Policy) не определяет её для audience/purpose specifically — `XFR-D-072`'s per-row quadruple («registry key × candidate field/derived fact × transformation × intended purpose/audience») предполагает, что audience/purpose уже встроен как часть строки, а не отдельный orthogonal fail-closed слой, что оставляет вопрос granularity действительно открытым, а не просто неудобным для решения.

### 3.6. `party_id` — candidate identity representation only

`party_id` остаётся только candidate recipient-identity representation из Safe Presentation Policy §9, не approved recipient key. Этот record не утверждает `party_id`, любой альтернативный идентификатор или identity representation в целом.

### 3.7. Reveal recipient machinery remains downstream

Architecture §22.3/§43 authenticated-recipient, `recipient_party_id`, purpose-bound-token, Reveal Gate Snapshot и manifest semantics остаются downstream Reveal controls, управляемые Reveal Service/Introduction Record Service (Architecture §40). Они не импортируются как Safe Presentation authorization или runtime design этим record'ом.

### 3.8. `XFR-D-076` reset authority preserved

Изменение recipient/audience/purpose само по себе не доказывает approved reset successive-disclosure budget. Safe Presentation Policy §8 сценарий 5/§15 решение №6 уже утверждают этот принцип по `XFR-D-076 v1.0` («смена session/Campaign/recipient/audience/purpose/time boundary сама по себе не доказывает approved reset»); этот record явно наследует, а не переоткрывает его.

### 3.9. Non-compensation и prerequisite-not-authorization

1. Authentication, active lawful basis сам по себе, locale, prior display, высокий score, высокая Confidence, низкий Risk, Qualification, успешная Presentation Readiness, DLP PASS, business urgency, user acceptance или synthetic-only evidence не компенсируют отсутствующий audience/purpose binding.
2. Binding — только prerequisite. Он не авторизует field, row, payload, policy, release, Reveal, runtime, implementation или governance gate самостоятельно.

### 3.10. Явное non-conflation

Этот record explicitly не переоткрывает, не расширяет, не поглощает и не подменяет:

1. `XFR-D-072` — actual field/payload row, applicability/requiredness; intended purpose/audience остаётся частью его per-row evidence, не отдельной вложенной категорией;
2. `XFR-D-076` — successive-disclosure/reset authority;
3. `XFR-D-077` — catalog origin/content;
4. `XFR-D-078` — score/confidence/risk/routing wording semantics;
5. `XFR-D-079` — linguistic/UI localization;
6. `XFR-D-081` — cache/expiry/revocation;
7. `XFR-D-082` — runtime carrier;
8. `XFR-D-083` — actual evidence;
9. `XFR-D-084` — artifact approval/change control;
10. `XFR-D-044`/`XFR-D-038` — read-only consumption/freshness, preserved not reopened;
11. Architecture §11/Lawful Basis/Consent Registry — authoritative upstream data-processing governance, не automatically Safe Presentation purpose model;
12. Reveal recipient machinery (Architecture §22.3/§43, Data Contracts Reveal Token/Attempt) — downstream, не Safe Presentation authorization;
13. Safe Presentation Policy §8 сценарий 6 (Cross-Campaign/multi-user collusion) — остаётся отдельным explicitly unassigned `OPEN` gap.

### 3.11. Presentation, scoring и gate separation

Согласовано с `XFR-D-044`/`XFR-D-072`/`XFR-D-076`/`XFR-D-077`/`XFR-D-078`/`XFR-D-079`: audience/purpose binding governance не пересчитывает и не меняет Eligibility, Hard Constraints, score, rank, Qualification, Confidence, Risk или routing. Высокий score, `QUALIFIED_HYPOTHESIS`, Presentation Readiness или user acceptance не авторизует binding и не обходит downstream gates.

### 3.12. Partial, never fully resolved

`XFR-D-080` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, explicit-binding requirement, processing-purpose-vs-presentation-purpose separation (с preservation Lawful Basis/Consent Registry authority), controlled-origin/non-inference boundary, fail-closed handling missing/ambiguous/stale/conflicting/version-incompatible binding (без выбора granularity), `party_id` candidate-only статус, Reveal recipient-machinery non-import, `XFR-D-076` reset-authority preservation, non-compensation, prerequisite-not-authorization и explicit non-conflation разрешены qualitatively.

Exact audience/presentation-purpose taxonomies, exact processing-purpose↔presentation-purpose compatibility mapping, exact recipient identity representation, user/organization/representative/shared-account roles/cardinality, authentication/authority/RBAC proof, applicability/requiredness для каждой `XFR-D-072` row, fail-closed granularity, cross-Campaign/cross-organization sharing, version/hash/expiry/reset/revocation mechanics, runtime carrier, evidence package и production applicability остаются `OPEN`. Будущее точное решение требует нового versioned `XFR-D-080` record с `supersedes`.

### 3.13. Prospective supersession and v1.0 continuity

1. `XFR-D-080 v1.1` supersedes `LeaseMind_MATCHING_DECISION_XFR-D-080_v1.0.md` prospectively only, and additively only. All v1.0 roles, invariants, dependencies, non-conflations, `OPEN` items, all ten adversarial cases (§7 п.1–10) and all thirteen acceptance criteria (§11 п.1–13) are preserved unchanged and remain in force.
2. Historical presentations, decisions, audience/purpose taxonomy/identity/mapping/granularity versions/hashes and references remain bound to their original v1.0 record, baseline `f34680a5fcd7e16aa6441a8fc0b21fc0f92e2cbb` and artifact versions/hashes; v1.1 does not backfill, reinterpret, relabel, replace or overwrite them.
3. The v1.0 text is not withdrawn, not rewritten, not shortened and not replaced. The only delta introduced by v1.1 is the coordinated G6 synthetic/test-package semantics in §3.14 plus the additive `OPEN`/adversarial/acceptance hygiene in §5, §6, §7, §8, §9 и §11. Every v1.1 addition is additive; ни одна v1.0 section, adversarial case, acceptance criterion, reference или sync scope не была изменена, сокращена или удалена.
4. This record performs no sync. Any future sync of `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md`, `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` or sibling records remains a separate pass and keeps the v1.0 sync scope stated in §8.

### 3.14. G6 coordination and synthetic/test-package semantics (v1.1 addition)

1. **Coordination ≠ cross-authorization.** This record is coordinated within the G6 Safe Presentation batch together with sibling records such as `XFR-D-079 v1.1`. Coordination exists only for consistency of governance boundaries. Neither this record nor any sibling record authorizes, approves, resolves, substitutes or widens the other; each keeps its own owner, approvers, evidence boundary and acceptance criteria.
2. **Synthetic fixtures and test transactions cannot establish production applicability.** Synthetic fixtures, seed or generated payloads, test transactions, replay, CI runs and test-package success may exercise structure only. They cannot establish production-safe audience/purpose binding, taxonomy applicability, recipient-identity validity, compatibility or any production presentation element.
3. **No audience/purpose authorization from tests.** No audience/presentation-purpose taxonomy, compatibility mapping, recipient identity representation/key, RBAC/authority proof, fail-closed granularity or mapping entry becomes authorized by the existence of a synthetic fixture, a passing test, a schema-valid package or an implementation artifact.
4. **`XFR-D-083` and `XFR-D-084` remain independent `OPEN`.** Actual evidence (`XFR-D-083`) and Safe Presentation artifact approval/change control (`XFR-D-084`) are not satisfied by this record, by any sibling record or by synthetic/test-package material; both remain independent `OPEN`.
5. **No policy, Data Contracts, runtime or implementation approval.** This record approves no Safe Presentation Policy version, no `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` extension, no runtime carrier/API/DB/event/schema and no implementation.
6. **Exact content stays `OPEN`.** Every exact audience/presentation-purpose taxonomy, compatibility mapping, identity representation/key, RBAC/authority proof, applicability/requiredness, fail-closed granularity and mapping remains `OPEN` under its applicable authority and requires future evidence-backed resolution with explicit approval; v1.1 authorizes none of them.
7. **Gate impact remains `NONE`.** The G6 overlay changes no gate state; all three governance gates remain `BLOCKED` (§10).

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` preserved | Actual artifact approval/change control `XFR-D-084` |
| Processing purpose/lawful basis | Architecture §11/§40; Lawful Basis/Consent Registry | Explicitly non-merged, authority preserved | Integration carrier (Feature Schema §10 п.19, независимо `OPEN`) |
| Presentation audience/purpose model | `XFR-D-080 v1.0` (этот record) | Explicit-binding requirement, non-inference, fail-closed boundary (roles/prerequisite level) | Taxonomies, identity representation, compatibility mapping, granularity |
| Field allowlist / requiredness | `XFR-D-072 v1.0` | Untouched; audience/purpose remains per-row dimension | Every actual row, applicability |
| Successive-disclosure/reset | `XFR-D-076 v1.0` | Untouched; reset non-proof preserved | Budget unit/scope/reset mechanics |
| Catalog origin/content | `XFR-D-077 v1.0` | Untouched | Namespace, values, wording |
| Score/confidence/risk/routing wording | `XFR-D-078 v1.0` | Untouched | Exact wording, mapping |
| Localization | `XFR-D-079 v1.0` | Untouched | Locale list, strings |
| Reveal recipient machinery | Architecture §§22.3/43; Reveal Service/Introduction Record Service | Explicitly non-imported | N/A — structurally downstream, different owner |
| Cache/expiry/revocation | `XFR-D-081` | Untouched | TTL, cache key, invalidation/revocation |
| Runtime carrier | `XFR-D-082` | No carrier inferred (confirmed absent from Data Contracts) | API/DB/event/schema/cache implementation |
| Actual evidence | `XFR-D-083` | Dependency preserved | Actual evidence package/dataset |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. Что остаётся `OPEN`

- exact audience и presentation-purpose taxonomies;
- exact processing-purpose ↔ presentation-purpose compatibility mapping;
- exact recipient identity representation, включая использование `party_id`;
- user/organization/representative/shared-account roles и cardinality;
- authentication, authority и RBAC proof;
- applicability/requiredness для каждой actual `XFR-D-072` row;
- fail-closed granularity (element, row или whole payload);
- cross-Campaign/cross-organization sharing и any approved secondary-use mechanics;
- version/hash lifecycle, compatibility, expiry, reset и revocation (`XFR-D-081`);
- runtime/API/DB/schema/event/cache carrier (`XFR-D-082`);
- evidence dataset, metrics, thresholds (`XFR-D-083`);
- Safe Presentation Policy approval/change control (`XFR-D-084`);
- production applicability of any G6 synthetic/test-package material (§3.14);
- production applicability и implementation.

## 6. Rationale

Audience/purpose is the layer most likely to be silently conflated with two adjacent, already-governed models: Architecture §11's processing-purpose/lawful-basis machinery (which shares the word "purpose" but is owned by a different registry and governs data use, not presentation recipients) and the Reveal layer's authenticated-recipient/token machinery (which shares the word "recipient" but only activates after Safe Presentation has already been shown, under a completely different gate sequence). Both misreadings are foreclosed explicitly here rather than left to accumulate as implicit assumptions.

Unlike every prior record in this cluster, this record deliberately does not select a fail-closed granularity (element/row/whole-payload). `XFR-D-072`'s own per-row evidence quadruple already embeds "intended purpose/audience" inside each field row, which means audience/purpose failure may already collapse into a row-level failure by construction — but no source states this explicitly, and inventing that collapse here would silently narrow `XFR-D-072`'s own future evidence design. Leaving it open is the more conservative reading.

The v1.1 G6 addition records the same conclusion at batch scope: sibling coordination and synthetic/test-package material are governance hygiene, not authorization. Tests and fixtures demonstrate that a boundary is implemented consistently; they never demonstrate that an audience/purpose binding, taxonomy or identity key is production-safe or applicable.

## 7. Adversarial cases

1. **ACTIVE lawful basis treated as sufficient audience proof.** `lawful_basis_status = ACTIVE` is cited as proving the presentation audience/purpose binding. Rejected §3.3/§3.9 — different model, different writer.
2. **Reveal recipient machinery imported as Safe Presentation authority.** `recipient_party_id`/Reveal Token semantics are treated as already governing Safe Presentation audience. Rejected §3.7 — downstream, different owner (Architecture §40).
3. **`party_id` treated as an already-approved key.** SPP §9's candidate mention is cited as approval. Rejected §3.6.
4. **Locale/device/channel/proxy used to infer audience.** Rejected §3.4 — non-inference boundary.
5. **Prior binding reused for another Campaign, recipient, or purpose.** Rejected §3.4 п.1 — secondary-reuse prohibition.
6. **Missing binding treated as a negative fact.** Rejected §3.5 п.3.
7. **Element-only or whole-payload behavior invented despite open granularity.** A future sync silently picks one of the three fail-closed granularities and attributes it to this record. Rejected §3.5 п.5 — this record explicitly leaves granularity `OPEN`.
8. **Recipient/audience change treated as an `XFR-D-076` reset.** Rejected §3.8.
9. **Cross-Campaign/multi-user collusion claimed resolved.** Rejected §3.10 п.13 — remains unassigned.
10. **High score/Qualification/DLP PASS/synthetic-only evidence used as compensation for missing binding.** Rejected §3.9.
11. **Synthetic fixture approves an audience/purpose binding.** A passing synthetic fixture, seed payload, test transaction, replay, CI run or test-package success is treated as production audience/purpose approval. Rejected §3.14 п.2/п.3 — synthetic/test material cannot establish production applicability.
12. **Sibling record authorizes this record.** A sibling G6 v1.1 record is cited as resolving an audience/purpose binding here. Rejected §3.14 п.1 — G6 coordination is not cross-authorization.
13. **Exact taxonomy/identity/mapping/granularity treated as v1.1-approved.** Any exact audience/presentation-purpose taxonomy, compatibility mapping, recipient identity representation/key or fail-closed granularity is attributed to v1.1. Rejected §3.14 п.6 — all remain `OPEN`.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §9 (`party_id` candidate framing preserved, not promoted), §15 решение №10, readiness matrix and relevant acceptance criteria may receive this governance/evidence boundary without any actual taxonomy, identity key, or mapping;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — new owner-review overlay `§5.5.8` for `SPP-10 → XFR-D-080`, without rewriting historical Wave 2D/§5.5/§5.5.1–§5.5.7 checkpoints;
- G6 batch sibling records (including `XFR-D-079 v1.1`) — coordination only, no cross-authorization;
- no Architecture, Data Contracts, Feature Schema, Evaluation Plan, manifest, runtime or implementation changes in any future sync of this record.

No future sync may interpret this record as an approved audience/purpose taxonomy, identity key, mapping, Safe Presentation Policy approval, actual evidence, dataset, evaluation run, production-safe payload, runtime carrier, or implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, evidence-procedure role, explicit-binding requirement, processing-purpose separation, controlled-origin/non-inference boundary, fail-closed handling, `party_id` candidate-only status, Reveal non-import boundary, `XFR-D-076` reset-authority preservation, non-compensation, prerequisite-not-authorization boundary или explicit non-conflation list требует нового versioned `XFR-D-080` record, согласованного governance owner `PRODUCT + LEGAL` и mandatory approvers `Chief AI Architect + AI + DEVELOPMENT` на одной version/hash, со ссылкой `supersedes` на эту версию. `AI + DEVELOPMENT` может готовить evidence, но не утверждает governance determination unilaterally.

Changing the v1.1 G6 coordination, synthetic/test-package, cross-authorization or production-applicability boundary likewise requires a new versioned `XFR-D-080` record with `supersedes`; it cannot be modified by test, fixture, sibling record, Policy sync or implementation.

Exact audience/purpose taxonomy/identity/mapping/granularity contents require a future evidence-backed version and cannot be appended silently to v1.1.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** governance authority, **when** roles are checked, **then** owner is `PRODUCT + LEGAL`, mandatory approvers are `Chief AI Architect + AI + DEVELOPMENT`, evidence-procedure owner `AI + DEVELOPMENT` has no unilateral approval.
2. **Given** `lawful_basis_status = ACTIVE` or another processing-purpose fact, **when** cited as audience/purpose proof, **then** the claim is rejected — the two models remain distinct and Lawful Basis/Consent Registry remains sole writer.
3. **Given** a candidate presentation element, **when** no explicit versioned recipient/audience/purpose binding is applicable, **then** the affected scope fails closed without becoming a negative fact or authorizing an element without required binding.
4. **Given** locale, device/channel, protected/proxy attributes, Campaign membership, score, Qualification, or prior presentation, **when** cited as audience/purpose proof, **then** none establishes an inference link.
5. **Given** `party_id`, **when** cited as an approved recipient key, **then** it remains only a candidate identity representation from Safe Presentation Policy §9.
6. **Given** Reveal `recipient_party_id`, purpose-bound tokens, or Reveal Gate Snapshot semantics, **when** cited as Safe Presentation authorization, **then** they remain downstream Reveal controls, not imported here.
7. **Given** a recipient/audience/purpose change, **when** claimed to reset the successive-disclosure budget, **then** `XFR-D-076`'s existing non-reset boundary governs.
8. **Given** fail-closed granularity (element/row/whole payload), **when** requested, **then** none is selected — it remains explicitly `OPEN`.
9. **Given** `XFR-D-072`, `XFR-D-076`, `XFR-D-077`, `XFR-D-078`, `XFR-D-079`, `XFR-D-081`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084`, Architecture §11/Lawful Basis authority, and Reveal recipient machinery, **when** this record is applied, **then** none is reopened, expanded, absorbed, or substituted.
10. **Given** Safe Presentation Policy §8 scenario 6 (collusion), **when** this record is applied, **then** it remains explicitly unassigned, not resolved.
11. **Given** high score, high Confidence, low Risk, Qualification, Presentation Readiness, DLP PASS, business urgency, user acceptance, or synthetic-only evidence, **when** audience/purpose binding is missing, **then** none compensates.
12. **Given** Eligibility/Hard Constraints/score/rank/Confidence/Risk/Qualification/routing/policy/runtime/gate state, **when** this record is applied, **then** none changes automatically and all three gates remain `BLOCKED`.
13. **Given** this record, **when** Safe Presentation Policy approval, actual audience/purpose taxonomy, identity key, mapping, dataset, production-data sufficiency, or runtime/API/DB/schema/event/cache design is checked, **then** none is approved.
14. **Given** v1.0 и v1.1, **when** continuity проверяется, **then** все v1.0 substantive sections, десять adversarial cases (§7 п.1–10) и тринадцать v1.0 acceptance criteria (§11 п.1–13) присутствуют без изменений, а v1.1 добавляет только coordinated G6 synthetic/test-package overlay и аддитивную hygiene (§3.13).
15. **Given** synthetic fixture, seed payload, test transaction, replay, CI run или test-package success, **when** заявляется production audience/purpose applicability, **then** claim запрещён: test material exercise'ит только структуру (§3.14 п.2/п.3).
16. **Given** `XFR-D-079 v1.1` или любой sibling G6 record, **when** authorization проверяется, **then** ни один не authorizes, не approves, не resolves и не substitutes этот record, и наоборот; каждый остаётся `PARTIALLY_RESOLVED_BOUNDARY` (§3.14 п.1).
17. **Given** `XFR-D-083` и `XFR-D-084`, **when** completion проверяется, **then** оба остаются independent `OPEN` и не satisfied ни этим record'ом, ни sibling record'ом, ни synthetic/test-package material (§3.14 п.4).
18. **Given** этот record, **when** approval scope проверяется, **then** ни Safe Presentation Policy version, ни `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` extension, ни runtime carrier/API/DB/event/schema, ни implementation не approved (§3.14 п.5).
19. **Given** любой exact audience/purpose taxonomy, compatibility mapping, recipient identity representation/key, RBAC/authority proof, applicability или fail-closed granularity, **when** он запрашивается у v1.1, **then** всё остаётся `OPEN` под применимой authority и требует future evidence-backed resolution с explicit approval (§3.14 п.6).
20. **Given** affected artifacts, **when** sync scope проверяется, **then** scope остаётся v1.0 scope (`LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — §9, §15 решение №10; `SPP-10 → XFR-D-080` owner-review overlay в `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md`) и G6 coordination его не расширяет и не заменяет (§8).
21. **Given** versioning, **when** current authority проверяется, **then** v1.1 prospectively supersedes v1.0, а исторические записи остаются bound к исходному v1.0 record, baseline `f34680a5fcd7e16aa6441a8fc0b21fc0f92e2cbb` и artifact versions/hashes (§3.13 п.2).
22. **Given** этот record, **when** gate state проверяется, **then** Gate impact остаётся `NONE` и все три gates (`IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE`, `PRODUCTION_LAUNCH_GATE`) остаются `BLOCKED` (§3.14 п.7, §10).

## 12. Итог

`XFR-D-080 AUDIENCE/PURPOSE MODEL GOVERNANCE BOUNDARY APPROVED — TAXONOMIES, IDENTITY REPRESENTATION, COMPATIBILITY MAPPING, FAIL-CLOSED GRANULARITY, RUNTIME CARRIER, EVIDENCE, POLICY AND IMPLEMENTATION REMAIN OPEN/BLOCKED`. v1.1 сохраняет v1.0 полностью и аддитивно добавляет только coordinated G6 synthetic/test-package semantics (coordination ≠ cross-authorization; synthetic fixtures и test transactions не могут установить production applicability; `XFR-D-083` и `XFR-D-084` остаются independent `OPEN`; никакой policy, Data Contracts, runtime или implementation approval; все exact audience/purpose taxonomy, identity representation, compatibility mapping и fail-closed granularity остаются `OPEN`; Gate impact `NONE`, все три gates `BLOCKED`); resolution status остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
