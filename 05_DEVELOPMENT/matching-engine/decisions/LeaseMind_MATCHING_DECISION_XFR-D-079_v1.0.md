# LeaseMind Matching Decision Record — XFR-D-079

**Decision ID:** `XFR-D-079`

**Название:** Linguistic/UI localization governance/evidence boundary for Safe Presentation

**Версия:** 1.0

**Дата решения:** 2026-08-31

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-08-31 working session

**Repository baseline:** `207f246db56c1c26b4a6310d402b2354b7af98c7`

**Governance owner:** `PRODUCT + LEGAL`

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence design, measurement, or locale-candidate preparation does not replace joint `PRODUCT + LEGAL` governance ownership, does not grant unilateral approval, and does not substitute `PRODUCT`/`LEGAL` determination.

**Depends on:** `XFR-D-077 v1.0` (reason/explanation catalog governance — upstream content this record only renders, does not create), `XFR-D-078 v1.0` (score/confidence/risk/Qualification presentation wording governance — upstream content this record only renders, does not create), `XFR-D-072 v1.0` (actual field/payload row and applicability/requiredness — parallel prerequisite, not a nested evidence category), `XFR-D-038 v1.0` (orthogonal STALE semantics — preserved, not restated as new content), `XFR-D-044 v1.0` (read-only presentation consumption — preserved, not reopened), `XFR-D-069 v1.0` (unknown/abstention terminology — its own §2 point 10 already reserves user-facing mapping/localization as a separate future decision). Audience/purpose model `XFR-D-080`, cache/expiry/revocation `XFR-D-081`, runtime carrier `XFR-D-082`, actual evidence `XFR-D-083` and artifact approval/change control `XFR-D-084` remain independent `OPEN` decisions.

---

## 1. Вопрос

Какова governance/evidence boundary будущей linguistic/UI localization для Safe Presentation, чтобы owner/approver roles, downstream-rendering scope (не создание content), semantic-fidelity requirement, controlled-origin requirement и fail-closed handling отсутствующего/неутверждённого locale variant были однозначны, но ни один locale, string, translation method, mapping или runtime carrier не был преждевременно разрешён — и явно разведено от структурно не связанного Architecture data-residency/data-localization boundary (§8.2, §48)?

## 2. Source/status discipline

Architecture §37 вопрос №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами широкого вопроса о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY` — тот же owner-anchor, уже применённый шесть раз (`XFR-D-072/074/075/076/077/078`).

Architecture §5 принцип 9 («Match Score, Confidence Score и Risk Score являются разными показателями») и принцип 11 («Matching Engine не использует защищенные персональные признаки или их скрытые заменители») — `SOURCE_NORMATIVE`, применимы к локализованному представлению точно так же, как к исходному: перевод не может стереть разделение показателей и не может стать скрытым заменителем защищённого признака (например, косвенным индикатором аудитории).

**Критически важное terminology-разведение.** Architecture §8.2 и §48 (`SECURITY_AND_DATA_LOCALIZATION_SPEC`) используют слово «локализация» исключительно в значении data-residency/инфраструктурного размещения: «первичная запись, систематизация, накопление, хранение, уточнение и извлечение персональных данных граждан РФ выполняются в базе данных на территории Российской Федерации» (§8.2); §48 п.1: «Все базы, object storage, очереди, резервные копии, логи, monitoring и support dumps с реальными ПД/защищенными данными размещаются в разрешенном LEGAL контуре РФ». Ни §8.2, ни §48 ни разу не упоминают язык, перевод, локаль или UI-текст. Этот record governs структурно другой вопрос — linguistic/UI localization, — поэтому §8.2/§48 не являются authority для UI-language/rendering semantics; их independently applicable data-residency obligations при этом не ослабляются и не исключаются.

Safe Presentation Policy header уже explicitly исключает «локализованный UI copy» из того, что этот Proposal разрешает (line 10). §6.9 (`XFR-D-077`-governed) устанавливает catalog-origin requirement — user-facing текст только из applicable approved, versioned catalog entry; это прямой upstream слой, на котором строится localization. §8 сценарий 8 (`DECISION_CANDIDATE_FOR_REVIEW`, до сих пор `OPEN_BLOCKED_PENDING_DECISION`) прямо называет «Localization/free text содержит скрытый identifier» adversarial-сценарием, требующим presentation-specific DLP profile, отдельного от event-level DLP §48 Architecture.

**§15 решение №9 (прочитано дословно): «Localization governance | `PRODUCT` | Candidate».** Это единственная строка в перечне открытых решений Safe Presentation Policy, где owner указан как `PRODUCT` без `LEGAL`, в отличие от строк 1/3/5/6/7/8, все из которых несут `PRODUCT + LEGAL` и цитируют Architecture §37/§52 как source-basis. Эта запись сознательно не сохраняет узкий `PRODUCT`-only candidate: governance owner для linguistic/UI localization устанавливается как `PRODUCT + LEGAL`, используя тот же Architecture §37 №6/§52 anchor и тот же established sibling Safe Presentation governance pattern, применённый шесть раз для того же артефакта и того же широкого вопроса. Semantic-fidelity boundary ниже (§3.3) — сохранение legal meaning, negation и fail-closed смысла при переводе — прямо относится к LEGAL-компетенции таким же образом, как semantic-separation boundary `XFR-D-078` (Risk §17 formulation, «не заменяет юридическую проверку») уже потребовал участия LEGAL. Эта запись не переписывает Safe Presentation Policy §15 строку 9 — обновление самого текста Policy остаётся отдельным future sync (§8).

`XFR-D-077` §3.6 п.10 и layer table уже независимо утверждают: «`XFR-D-079` — governs localization; downstream rendering, не catalog existence/governance». `XFR-D-078` §3.10 п.9 и layer table независимо повторяют ту же формулировку: «`XFR-D-079` — governs localization; downstream rendering, не wording existence/governance». Оба approved sibling records уже дважды характеризуют localization как строго downstream rendering существующего approved content — этот record формализует governance/evidence-procedure roles вокруг уже дважды подтверждённой границы, не изобретает её заново.

Repo-wide проверка `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` на предмет locale/language/translation находит только объявления `language plpgsql`/`language sql` функций PostgreSQL — структурно не связаны с UI-локализацией; runtime carrier для localization не существует. Feature Schema §9 («Canonical ordering/serialization: порядок `feature_id`... лексикографический по code point (без `localeCompare`, без зависимости от locale/ICU)») — требование детерминированности internal snapshot serialization, не про UI-язык; этот record явно не трактует его как уже покрывающее linguistic localization. Evaluation Plan §6.5 (Safety/data-leakage/DLP) покрывает только прямые идентификаторы, точный адрес и свободный текст — locale-specific или translation-quality metric family отсутствует; actual localization/DLP evidence остаётся `XFR-D-083` gap.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `PRODUCT + LEGAL`.** Прямой Architecture §37 №6/§52 pair; сознательно расширяет узкий `PRODUCT`-only Safe Presentation Policy §15 candidate до established sibling pattern (см. §2 выше) на основании semantic-fidelity/legal-meaning-preservation relevance.
2. **Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.** Precedent-based расширение того же паттерна, уже применённого шесть раз для того же артефакта/вопроса; Chief AI Architect проверяет architecture/separation, AI — evidence/translation-quality limitations, DEVELOPMENT — runtime feasibility.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Готовит candidate locale evidence/matrix, но не принимает PRODUCT/LEGAL determination и не становится unilateral approver.
4. Совпадение governance-owner pair у `XFR-D-077`/`XFR-D-078` и этого record'а не сливает scopes: approval upstream catalog/wording boundary не авторизует localization determination, а этот record не приобретает authority над catalog/wording content.
5. Ни одна роль не заменяет другую; owner-пара не одобряет locale variant единолично.

### 3.2. Downstream-rendering boundary

1. Localization governs только **rendering** applicable, уже approved catalog/wording entry (`XFR-D-077`, `XFR-D-078`) в конкретную locale.
2. Localization не создаёт field row, catalog entry, wording semantic, score/risk label, audience rule, routing outcome, legal conclusion или presentation authorization.
3. Существование locale variant не расширяет и не сужает то, что уже approved upstream — оно только определяет, как approved content отображается на конкретном языке.

### 3.3. Semantic-fidelity boundary

1. Локализованный вариант не должен усиливать, ослаблять, инвертировать или переинтерпретировать compatibility, uncertainty, Confidence, Risk, Qualification, freshness, legal meaning, negation, fail-closed смысл или required next action, переданные approved source entry.
2. Negation и uncertainty markers (unknown/conflicting/stale — `XFR-D-038`, `XFR-D-069`) должны сохраняться семантически неизменными при переводе.
3. Точная Architecture §17 Risk-формулировка (сохранена `XFR-D-078`) не может утратить свою ограничительную силу («не является доказательством нарушения», «не заменяет юридическую проверку» и т.д.) через locale-specific формулировку.
4. Exact wording/quality-review method для проверки semantic fidelity остаётся `OPEN`.

### 3.4. Controlled-origin boundary

1. Может использоваться только applicable approved, versioned locale variant.
2. Guessed translation, LLM/operator-generated free text, namespace coercion, label reuse или implicit machine translation не допускаются.
3. Default-locale или fallback-chain authorization не существует, если не approved отдельно.

### 3.5. Missing/unmapped/stale/conflicting/version-incompatible — fail closed

1. Такой locale variant делает недопустимым только candidate localized element.
2. Он не авторизует элемент без required localized wording.
3. Он не отклоняет автоматически весь payload.
4. Он не меняет underlying score, Confidence, Risk, Qualification или routing result.
5. Отсутствие не становится negative business fact.
6. Exact applicability/requiredness и actual-row behavior остаются `OPEN` под `XFR-D-072`.

### 3.6. Locale vs audience

1. Locale не выводится из защищённых или proxy-признаков и не является доказательством получателя, аудитории или цели.
2. `XFR-D-080` остаётся независимым и `OPEN`; этот record не создаёт audience-targeting или secondary-use authorization.

### 3.7. Privacy и leakage

1. Локализованные варианты остаются subject тем же joint-payload, combination-risk, successive-disclosure и presentation-channel DLP требованиям, что и другой presentation content (`XFR-D-075`, `XFR-D-076`, §8 сценарий 8).
2. Редкая или уникальная локализованная формулировка может стать searchable identifier.
3. Actual localization/DLP evidence остаётся `XFR-D-083` scope; Evaluation Plan §6.5 подтверждённо не содержит locale-specific или translation-quality metric family.

### 3.8. Non-compensation и prerequisite-not-authorization

1. Approved base wording, высокий score, высокая Confidence, низкий Risk, Qualification, успешная Presentation Readiness, user acceptance, DLP PASS или synthetic-only evidence не компенсируют отсутствующую/неутверждённую localization evidence.
2. Наличие locale variant — только prerequisite. Он не авторизует field, payload, policy, release, Reveal, runtime, implementation или governance gate.

### 3.9. Явное non-conflation

Этот record explicitly не переоткрывает, не расширяет и не подменяет:

1. `XFR-D-072` — actual field/payload row и applicability/requiredness;
2. `XFR-D-077` — catalog origin/content;
3. `XFR-D-078` — score/confidence/risk/routing wording semantics;
4. `XFR-D-069` — diagnostic terminology; no automatic user-facing mapping;
5. `XFR-D-080` — audience/purpose;
6. `XFR-D-081` — cache/expiry/revocation;
7. `XFR-D-082` — runtime carrier;
8. `XFR-D-083` — actual evidence;
9. `XFR-D-084` — artifact approval/change control;
10. Architecture §§8.2/48 — data residency, структурно другое значение «локализации», не linguistic localization;
11. Feature Schema §9 — locale-independent canonical serialization (determinism/replay ordering), не UI localization;
12. `XFR-D-038`/`XFR-D-044` — freshness и read-only consumption остаются preserved, не переоткрываются.

### 3.10. `XFR-D-072` — параллельный prerequisite, не вложенная категория

`XFR-D-079` не заполняет ни одну из пятнадцати `XFR-D-072` §3.4 evidence categories и не создаёт шестнадцатую. Localization governance и actual field-row approval остаются параллельными prerequisites: наличие или approval одного не доказывает наличие, approval либо применимость другого; когда оба применимы, требуются оба, а exact applicability/requiredness и actual-row behavior остаются `OPEN` под `XFR-D-072`.

### 3.11. Presentation, scoring и gate separation

Согласовано с `XFR-D-044`/`XFR-D-072`/`XFR-D-077`/`XFR-D-078`: localization не пересчитывает и не меняет Eligibility, Hard Constraints, score, rank, Qualification, Confidence, Risk или routing. Высокий score, `QUALIFIED_HYPOTHESIS`, Presentation Readiness или user acceptance не авторизует locale variant и не обходит downstream gates.

### 3.12. Partial, never fully resolved

`XFR-D-079` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner (расширен до `PRODUCT + LEGAL`), mandatory approvers, evidence-procedure role, downstream-rendering boundary, semantic-fidelity boundary, controlled-origin boundary, fail-closed handling missing/unmapped/stale/conflicting/version-incompatible locale variant, locale-vs-audience non-inference, privacy/leakage preservation, non-compensation, prerequisite-not-authorization, explicit non-conflation и parallel-prerequisite разведение с `XFR-D-072` разрешены qualitatively.

Supported locale list, canonical/source locale, exact strings/templates, translation method/qualifications/review, glossary, plural/gender/grammar, number/date/time/unit/currency formatting, fallback chain/default locale, mapping cardinality, compatibility/version/hash mechanics, storage/schema/runtime carrier, cache behavior, evidence dataset/metrics/thresholds, actual field/payload rows и production applicability остаются `OPEN`. Будущее точное решение требует нового versioned `XFR-D-079` record с `supersedes`.

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` (расширено с candidate `PRODUCT`) | Actual artifact approval/change control `XFR-D-084` |
| Catalog origin/content | `XFR-D-077 v1.0` | Untouched; upstream dependency | Namespace, values, wording |
| Score/confidence/risk/routing wording | `XFR-D-078 v1.0` | Untouched; upstream dependency | Exact wording, mapping |
| Localization governance | `XFR-D-079 v1.0` (этот record) | Roles, downstream-rendering, semantic-fidelity, controlled-origin, fail-closed boundary | Locale list, strings, translation method, mapping cardinality |
| Data residency | Architecture §§8.2/48 | Не является authority для UI-language/rendering semantics; independently applicable obligations не ослабляются | N/A — structurally distinct question |
| Canonical serialization | Feature Schema §9 | Explicitly non-authoritative for this record | N/A — structurally distinct question |
| Audience/purpose | `XFR-D-080` | Dependency preserved | Exact model, applicability |
| Cache/expiry/revocation | `XFR-D-081` | Untouched | TTL, cache key, invalidation/revocation procedure |
| Runtime carrier | `XFR-D-082` | No carrier inferred (confirmed absent from Data Contracts) | API/DB/event/schema/cache implementation |
| Actual evidence | `XFR-D-083` | Dependency preserved; gap confirmed (Evaluation Plan §6.5) | Actual evidence package/dataset |
| Field allowlist / requiredness | `XFR-D-072 v1.0` | Untouched; parallel prerequisite stated (§3.10) | Every actual row/field, requiredness |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. Что остаётся `OPEN`

- supported locale/language list;
- canonical/source locale;
- exact localized strings/templates;
- translation method;
- translator qualifications and review procedure;
- glossary/terminology catalog;
- plural/gender/grammar handling;
- number/date/time/unit/currency formatting;
- fallback chain and default locale;
- mapping cardinality and applicability;
- compatibility/version/hash mechanics;
- storage/schema/runtime carrier (`XFR-D-082`);
- cache behavior (`XFR-D-081`);
- evidence dataset, metrics, thresholds and acceptance results (`XFR-D-083`);
- actual field/payload rows and requiredness (`XFR-D-072`);
- audience/purpose model (`XFR-D-080`);
- production applicability;
- Safe Presentation Policy approval;
- Safe Presentation artifact approval/change control (`XFR-D-084`);
- runtime/API/DB/schema/event design and implementation;
- all three governance gates.

## 6. Rationale

Localization is the layer most likely to be misread as either (a) already covered by Architecture's data-localization spec, because the same Russian word is reused for a structurally unrelated infrastructure requirement, or (b) an independent content-creation activity that could bypass the catalog/wording governance already established for `XFR-D-077`/`XFR-D-078`. Both misreadings are foreclosed explicitly here: §8.2/§48 are named and disclaimed as non-authoritative, and localization is fixed as strictly downstream rendering — a boundary the two upstream sibling records had already stated twice, independently, before this record existed.

The role widening from Safe Presentation Policy's current `PRODUCT`-only candidate to `PRODUCT + LEGAL` is not a silent overwrite of that text (the Policy itself is not touched by this record) but an explicit governance determination that the same rationale which added LEGAL to `XFR-D-072/074/075/076/077/078` — data minimization, lawful-use, rights, and here specifically legal-meaning preservation under translation — applies with equal force to localization, since a mistranslated Risk or Qualification explanation could silently reintroduce exactly the legal overclaim `XFR-D-078` was written to prevent.

## 7. Adversarial cases

1. **§48 cited as authority for UI copy.** Architecture data-residency approval is treated as covering localized text launch. Rejected §2/§3.9 п.10 — structurally distinct question.
2. **Silent meaning drift.** A localized Risk explanation drops "не заменяет юридическую проверку." Rejected §3.3 — semantic-fidelity violation.
3. **Fallback translation.** Missing approved locale variant triggers machine translation instead of failing closed. Rejected §3.4/§3.5.
4. **Locale as audience proxy.** Locale selection is used to infer or target a specific recipient segment. Rejected §3.6 — `XFR-D-080` territory.
5. **Searchable phrase.** A rare localized phrasing becomes an externally searchable identifier. Flagged §3.7 — still `OPEN_BLOCKED_PENDING_DECISION` per SPP §8 scenario 8.
6. **Absence as negative fact.** Missing locale variant is recorded as a negative signal about the underlying Match. Rejected §3.5.
7. **Feature Schema §9 cited as coverage.** Locale-independent serialization determinism is claimed to already resolve UI localization. Rejected §2/§3.9 п.11 — distinct concept.
8. **Content creation via localization.** A new explanation is authored directly as a "localized variant" without an approved source catalog/wording entry. Rejected §3.2 — downstream-rendering violation.
9. **High Qualification overrides missing locale.** `QUALIFIED_HYPOTHESIS` or Presentation Readiness is used to justify presenting an unlocalized/mistranslated element. Rejected §3.8/§3.11.
10. **Sixteenth evidence category.** This record's evidence is treated as filling or replacing one of `XFR-D-072`'s fifteen categories. Rejected §3.10.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §6.9, §15 решение №9 (owner widened to `PRODUCT + LEGAL`), readiness matrix and relevant acceptance criteria may receive this governance/evidence boundary without any actual locale, string, or mapping;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — new owner-review overlay `§5.5.7` for `SPP-09 → XFR-D-079`, without rewriting historical Wave 2D/§5.5/§5.5.1–§5.5.6 checkpoints;
- no Architecture, Data Contracts, Evaluation Plan, manifest, runtime or implementation changes in any future sync of this record.

No future sync may interpret this record as an approved locale list, string, template, translation, mapping, Safe Presentation Policy approval, actual evidence, dataset, evaluation run, production-safe payload, runtime carrier, or implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, evidence-procedure role, downstream-rendering boundary, semantic-fidelity boundary, controlled-origin boundary, fail-closed handling, locale-vs-audience non-inference, non-compensation, prerequisite-not-authorization boundary или explicit non-conflation list требует нового versioned `XFR-D-079` record, согласованного governance owner `PRODUCT + LEGAL` и mandatory approvers `Chief AI Architect + AI + DEVELOPMENT` на одной version/hash, со ссылкой `supersedes` на эту версию. `AI + DEVELOPMENT` может готовить evidence, но не утверждает governance determination unilaterally.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** Architecture §§8.2/48, **when** cited as authority for UI localization, **then** the citation is rejected as scope mismatch; those sections govern data residency only.
2. **Given** governance authority, **when** roles are checked, **then** owner is `PRODUCT + LEGAL`, mandatory approvers are `Chief AI Architect + AI + DEVELOPMENT`, evidence-procedure owner `AI + DEVELOPMENT` has no unilateral approval.
3. **Given** a candidate localized element, **when** no applicable approved source catalog/wording entry exists, **then** localization is denied — it cannot create content independently.
4. **Given** a localized variant, **when** compared against its approved source entry, **then** no compatibility, uncertainty, Confidence, Risk, Qualification, freshness, legal-meaning, negation, or fail-closed signal differs.
5. **Given** missing/unmapped/stale/conflicting/version-incompatible locale variant, **when** presentation is requested, **then** candidate localized element недопустим и не авторизуется без required localized wording, весь payload не отклоняется автоматически, underlying result не меняется, absence не становится negative fact, а exact applicability/requiredness и actual-row behavior остаются `OPEN` под `XFR-D-072`.
6. **Given** locale, **when** checked against protected/proxy attributes, **then** no inference link to recipient/audience/purpose exists.
7. **Given** high score, high Confidence, low Risk, Qualification, Presentation Readiness, user acceptance, DLP PASS, or synthetic-only evidence, **when** localization evidence is missing, **then** none compensates.
8. **Given** `XFR-D-072`, `XFR-D-077`, `XFR-D-078`, `XFR-D-069`, `XFR-D-080`, `XFR-D-081`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084`, Architecture §§8.2/48, Feature Schema §9, `XFR-D-038`, `XFR-D-044`, **when** this record is applied, **then** none is reopened, expanded, or substituted.
9. **Given** this record, **when** checked against `XFR-D-072`'s fifteen §3.4 evidence categories, **then** none is filled and no sixteenth category is created.
10. **Given** Eligibility/Hard Constraints/score/rank/Confidence/Risk/Qualification/routing/policy/runtime/gate state, **when** this record is applied, **then** none changes automatically and all three gates remain `BLOCKED`.
11. **Given** this record, **when** Safe Presentation Policy approval, actual locale list/string/template/translation/mapping, dataset, evaluation run, production-data sufficiency, runtime/API/DB/schema/event design, or implementation is checked, **then** none is approved.

## 12. Итог

`XFR-D-079 LINGUISTIC/UI LOCALIZATION GOVERNANCE BOUNDARY APPROVED — LOCALE LIST, STRINGS, TRANSLATION METHOD, MAPPING, RUNTIME CARRIER, EVIDENCE, POLICY AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
