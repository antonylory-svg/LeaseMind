# LeaseMind Matching Decision Record — XFR-D-078

**Decision ID:** `XFR-D-078`

**Название:** Score/confidence/risk/Qualification presentation wording governance/evidence boundary for Safe Presentation

**Версия:** 1.0

**Дата решения:** 2026-08-30

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-08-30 working session

**Repository baseline:** `8bedd13e410dd02e0c0ffc4f46f92e8d1292ed91`

**Governance owner:** `PRODUCT + LEGAL`

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence design, measurement, or wording-candidate preparation does not replace joint `PRODUCT + LEGAL` governance ownership, does not grant unilateral approval, and does not substitute `PRODUCT`/`LEGAL` determination.

**Depends on:** `XFR-D-044 v1.0` (read-only presentation consumption — this record preserves it without reopening), `XFR-D-038 v1.0` (orthogonal STALE semantics — preserved, not restated as new content), `XFR-D-072 v1.0` (actual field/payload row and applicability/requiredness — parallel prerequisite, not a nested evidence category), `XFR-D-077 v1.0` (reason/explanation catalog governance — sibling text-governance question, non-merging). Scoring-internal semantics/ownership `XFR-D-023`/`XFR-D-028`, Risk-internal aggregation `XFR-D-048`, Risk output runtime/public representation (Risk Policy open decision №1), diagnostic terminology `XFR-D-069`, localization `XFR-D-079`, audience/purpose model `XFR-D-080`, cache/expiry/revocation `XFR-D-081`, runtime carrier `XFR-D-082`, actual evidence `XFR-D-083` and artifact approval/change control `XFR-D-084` remain independent `OPEN` decisions.

---

## 1. Вопрос

Какова governance/evidence boundary будущего score/confidence/risk/Qualification presentation wording для Safe Presentation, чтобы owner/approver roles, semantic-separation preservation (Match Score ≠ safety, Confidence ≠ attractiveness, Risk ≠ proof of violation, routing ≠ legal decision), fail-closed handling отсутствующего/неутверждённого mapping и явное разведение от смежных Scoring-internal/Risk-internal/diagnostic-terminology вопросов были однозначны, но ни одна конкретная формулировка, mapping, band, enum или runtime carrier не была преждевременно разрешена?

## 2. Source/status discipline

Architecture §37 вопрос №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами широкого вопроса о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY`.

Architecture даёт для этого record'а необычно сильные прямые textual anchors — сильнее, чем для geography (`XFR-D-074`) или successive-disclosure (`XFR-D-076`), сопоставимо с unconditional combination-deny (`XFR-D-075`):

- §5 принцип 9 (`SOURCE_NORMATIVE`): «Match Score, Confidence Score и Risk Score являются разными показателями».
- §15.6: Match Score «не включает скрытое юридическое решение, платежный статус, вывод об обходе, санкцию или возврат»; Priority Score явно опционален («может использоваться»); все исходные показатели «сохраняются и показываются раздельно для аудита».
- §16 (`SOURCE_NORMATIVE`, дословно): «Confidence Score показывает надежность оценки, а не привлекательность пары.» И: «Высокий Match Score при низком Confidence Score… не может быть представлен как готовый Квалифицированный вариант.»
- §17 (`SOURCE_NORMATIVE`, дословный закрытый список): Risk Score «не является доказательством нарушения; не является кредитным рейтингом; не заменяет юридическую проверку; не создает санкцию; не меняет плательщика; не определяет возврат или кредит; не должен использовать защищенные признаки или прокси.»
- §12.4/§13/§32 (`SOURCE_NORMATIVE`): неизвестное значение никогда не становится нулевым/отрицательным; конфликтующие evidence сохраняют все версии и снижают Confidence, не превращаясь в вердикт; устаревший профиль получает `STALE`, раскрытие запрещено.
- §33/§40/§49: audit bundle и reproducibility требования применяются к score/reason/version данным как internal/audit требование — не user-facing display authorization (тот же паттерн, что уже применён к §25 в `XFR-D-077`).
- §37/§52 и текущие Proposals не задают ни одного approved user-facing numeric value, presentation threshold/band или score/confidence/risk/routing-to-wording mapping. Internal scoring formula Architecture §15.4 остаётся отдельной internal calculation boundary и не авторизует user-facing display; вопросы №2 (Mutual Aggregate function), №3 (weights/thresholds), №8 (Risk human-review threshold) остаются `OPEN`, все — Launch/Qualification blockers.

**Ни один качественный band, label или enum не существует.** Независимо перепроверено: Risk Policy `MRP-C-001` прямо утверждает, что «высокий»/«критический» — качественная формулировка источника, не enum-значение; ни один `LOW/MEDIUM/HIGH` (или эквивалент) не существует ни в одном источнике. `SPP-C-008` независимо подтверждает тот же запрет специально для Safe Presentation candidate families. «Условная формулировка не создаёт разрешение» — тот же принцип, уже применённый к geography (`XFR-D-074`) и combination-deny (`XFR-D-075`), применяется здесь к «высокий риск»/«критический риск»/«низкая уверенность».

**Ни один approved runtime carrier не существует.** Независимо перепроверено через Qualification Policy §5 (repo-wide grep Data Contracts): ноль совпадений для любого из четырёх Qualification результатов, «confidence» или «risk» в `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`; единственный смежный артефакт, `GateState` enum, orphaned и текстуально не совпадает.

**Governance-owner паттерн Scoring Policy для internal Scoring-вопросов структурно отличается от паттерна Safe Presentation cluster — важнейшее разведение для этого record'а.** `XFR-D-023`/`XFR-D-024`/`XFR-D-026`/`XFR-D-027`/`XFR-D-028` используют governance owner `Chief AI Architect + PRODUCT` (mandatory approvers `LEGAL + DEVELOPMENT`, `AI` — только consulted), потому что эти records governs *собственный internal artifact* Scoring Policy, чей artifact owner Architecture §52 называет именно этой парой. Это **не** паттерн для этого record'а: `XFR-D-078` — Safe Presentation вопрос (`SPP-08`), governed Architecture §37 №6/§52 парой `PRODUCT + LEGAL`, тем же паттерном, уже применённым пять раз (`XFR-D-072/074/075/076/077`). `XFR-D-028` сам по себе — прямое доказательство этого разведения: он применил Scoring-internal паттерн только к internal половине Dimension Score ownership и explicitly отказался распространить его на external presentation половину, оставив её под уже существующим candidate owner `PRODUCT + LEGAL` Safe Presentation Policy.

Risk Policy открытое решение №1 (прочитано дословно): «Risk output representation / runtime-public identifiers или enum (включая `risk_category_id`…) | `Chief AI Architect + AI` — candidate assignment; источник не назначает owner этого решения напрямую | Explainability, `SAFE_PRESENTATION_POLICY` совместимость». Safe Presentation Policy §6.6 и §15 решение №8 уже цитируют эту зависимость по имени («эхо Risk Policy открытого решения №1») — подтверждает направление зависимости: Risk Policy's own runtime-representation вопрос upstream и независим от `XFR-D-078`, не resolved и не owned этим record'ом.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `PRODUCT + LEGAL`.** Напрямую Architecture §37 №6/§52 pair, совпадает с candidate assignment Safe Presentation Policy §15 решения №8 без отклонения. **Не** `Chief AI Architect + PRODUCT` (Scoring's own internal artifact-owner pattern) — см. §2 выше.
2. **Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.** Установлены by direct precedent из `XFR-D-072 v1.0`/`XFR-D-074 v1.0`/`XFR-D-075 v1.0`/`XFR-D-076 v1.0`/`XFR-D-077 v1.0` (тот же артефакт, тот же широкий вопрос №6), не source-named для именно этого под-вопроса напрямую — это precedent-based расширение того же паттерна в шестой раз, не Architecture-цитата.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Готовит candidate wording/evidence, но не принимает PRODUCT/LEGAL determination и не становится unilateral approver.
4. Ни одна из ролей не заменяет и не подменяет другую; owner-пара `PRODUCT + LEGAL` не одобряет wording boundary единолично, approvers не заменяют owner readiness.

### 3.2. Read-only consumption preserved

Safe Presentation остаётся read-only consumer. Базовый запрет пересчитывать, повышать, понижать или заменять Qualification result и менять score, rank, Confidence или Risk сохраняется из `XFR-D-044` §2 без переоткрытия. Этот record дополнительно запрещает presentation-layer округление, нормализацию, bucketing и relabeling до отдельного approved mapping; actual display transformation остаётся `OPEN`.

### 3.3. Semantic separation

1. Match Score не доказывает safety, Qualification/readiness, достаточную Confidence или отсутствие Risk (Architecture §5 принцип 9, §16).
2. Confidence показывает надёжность оценки, не привлекательность пары (Architecture §16, дословно).
3. Risk boundary — точная Architecture §17 формулировка: Risk не является доказательством нарушения, не является кредитным рейтингом, не заменяет юридическую проверку, не создаёт санкцию, не меняет плательщика и не определяет возврат или кредит. Этот record не добавляет fraud, bad-faith или compatibility claims.
4. Qualification routing не является human/legal Decision Record и не проходит downstream gates автоматически (согласовано с Qualification Policy §12–13, `XFR-D-044` §3, `MQP-C-015`).

### 3.4. Preservation of `XFR-D-038` и source freshness semantics

1. `STALE`/historical результаты не представляются как текущие или actionable — прямое наследование `XFR-D-038`, не переоткрывается и не ослабляется.
2. Unknown, conflicting и inconclusive не приводятся к positive, negative или numeric default значению (Architecture §12.4, §13, §32).
3. Conflicting evidence остаётся conflicting и не становится вердиктом через wording.

### 3.5. Architecture prose не создаёт enum

Формулировки Architecture вроде «высокий риск», «критический риск» или «низкая Confidence» не создают approved public/runtime enum, numeric threshold, band или user-facing label. Условная/качественная формулировка источника не превращается в разрешение (тот же принцип, что `XFR-D-074` §3.5 и `XFR-D-075` §3.2 уже применяют к смежным вопросам).

### 3.6. No guessed mapping

Ни один score-to-wording, confidence-to-wording, risk-to-wording или routing-to-wording mapping не может быть угадан, выведен из source prose, унаследован из другого namespace или сгенерирован через неутверждённый fallback.

### 3.7. Missing/stale/conflicting/version-incompatible — fail closed

1. Missing, stale, conflicting или version-incompatible approved mapping делает candidate presentation element недопустимым.
2. Underlying score, Risk, Confidence и Qualification result не изменяются.
3. Absence не превращается в negative business fact.
4. Этот record не авторизует элемент без required wording.
5. Этот record не разрешает автоматический отказ всего payload из-за отсутствующего wording одного элемента.
6. Exact applicability/requiredness и actual-row behavior остаются `OPEN` под `XFR-D-072`.

### 3.8. Non-compensation

Aggregate или high score, high Confidence, low Risk, Qualification result, successful Presentation Readiness, user acceptance и synthetic-only evidence не компенсируют другой inadmissible, missing или unapproved presentation element или mapping.

### 3.9. Prerequisite, не authorization

Future safe wording или mapping entry служит только governance/evidence prerequisite — не самостоятельная authorization поля, payload, Qualification result, routing decision, Reveal, release, runtime или gate. Ни одно successful evidence автоматически не публикует presentation, не меняет score/Risk/Qualification/routing/policy/model/runtime/release/gate.

### 3.10. Явное non-conflation

Этот record explicitly не переоткрывает, не расширяет и не подменяет:

1. `XFR-D-044 v1.0` — governs read-only Safe Presentation consumption; этот record сохраняет эту boundary, не расширяет её;
2. `XFR-D-038 v1.0` — governs orthogonal `STALE` semantics; сохраняется §3.4, не переоткрывается;
3. `XFR-D-072 v1.0` — governs actual field/payload row и applicability/requiredness; wording governance и actual field-row approval — параллельные prerequisites, не вложенные друг в друга (§3.11);
4. `XFR-D-077 v1.0` — governs future safe reason/explanation catalog origin; sibling text-governance вопрос, не сливается автоматически с этим record'ом (§5);
5. `XFR-D-069 v1.0` — governs diagnostic `unknown`/`abstention` terminology для evaluation; сам `XFR-D-069` §2 п.10 явно резервирует user-facing mapping как отдельное будущее решение — этот record не наследует и не подразумевает такое mapping automatically;
6. `XFR-D-023`/`XFR-D-028` — governs Scoring-internal semantics/versioning и internal ownership Dimension Score granularity; другой артефакт, другой governance-owner паттерн (`Chief AI Architect + PRODUCT`, не `PRODUCT + LEGAL`) — этот record не заимствует их owner паттерн или internal-ownership содержание;
7. `XFR-D-048` — governs Risk-internal aggregation/non-compensation до Qualification handoff; другой layer, не user-facing wording;
8. Risk Policy открытое решение №1 — governs Risk output runtime/public representation; upstream, независимый, explicitly cross-referenced Safe Presentation Policy; этот record зависит от него, не резолвит его;
9. `XFR-D-079` — governs localization; downstream rendering, не wording existence/governance;
10. `XFR-D-080` — governs audience/purpose model; applicability конкретного wording к получателю зависит от него, не определяется здесь;
11. `XFR-D-081` — governs cache/expiry/revocation; qualitative fail-closed handling stale/version-incompatible mapping не определяет TTL, cache key, invalidation trigger или revocation procedure;
12. `XFR-D-082` — governs runtime carrier; подтверждено отсутствующий в Data Contracts v1.0;
13. `XFR-D-083` — governs actual evidence package;
14. `XFR-D-084` — governs Safe Presentation artifact approval/change control;
15. Priority Score остаётся опциональным/open Scoring construct (Architecture §15.6, `XFR-D-024` governance-owner-only boundary); этот record не создаёт для него никакого presentation permission.

### 3.11. `XFR-D-072` — параллельный prerequisite, не вложенная категория

Этот record не заполняет ни одну из пятнадцати evidence categories `XFR-D-072` §3.4 и не создаёт шестнадцатую категорию. Wording governance (этот record) и actual `XFR-D-072` field-row approval — параллельные prerequisites: любой score/confidence/risk/routing элемент требует собственной approved `XFR-D-072` row **и** applicable wording governance boundary одновременно, не одно через другое.

### 3.12. Presentation, scoring и gate separation

Согласовано с `XFR-D-044`/`XFR-D-072`/`XFR-D-074`/`XFR-D-075`/`XFR-D-076`/`XFR-D-077`: Safe Presentation остаётся read-only consumer; ни одна wording-governance evidence не пересчитывает и не меняет Eligibility, Hard Constraints, score, rank, Qualification, Confidence, Risk или routing. Высокий score, `QUALIFIED_HYPOTHESIS`, Presentation Readiness или user acceptance не авторизует wording element и не обходит downstream gates.

### 3.13. Partial, never fully resolved

`XFR-D-078` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, read-only consumption preservation, semantic-separation preservation (Match Score/Confidence/Risk/routing), preservation `XFR-D-038` freshness semantics, no-enum-from-prose rule, no-guessed-mapping rule, fail-closed handling missing/stale/conflicting/version-incompatible mapping, non-compensation, prerequisite-not-authorization boundary, explicit non-conflation с `XFR-D-023`/`XFR-D-028`/`XFR-D-048`/Risk Policy открытым решением №1/`XFR-D-069`/`XFR-D-079`/`XFR-D-080`/`XFR-D-081`/`XFR-D-082`/`XFR-D-083`/`XFR-D-084` и parallel-prerequisite разведение с `XFR-D-072` разрешены qualitatively.

Numeric score/threshold/band, display precision/rounding/normalization, public labels/exact wording/templates, все score/confidence/risk/routing mappings и cardinality, ordering/severity/visual emphasis, locale/audience applicability, compatibility/version/hash mechanics, actual-row behavior сверх approved fail-closed boundary, output schema/status/enum, runtime carrier, actual field/payload rows, evidence package и вопрос единого/раздельного artifact с `XFR-D-077` остаются `OPEN`. Будущее точное решение требует нового versioned `XFR-D-078` record с `supersedes`.

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` preserved | Actual artifact approval/change control `XFR-D-084` |
| Score/Confidence/Risk separation | Architecture §5 п.9, §16, §17 (`SOURCE_NORMATIVE`) | Не изменена, не переприписана | Public label/enum/threshold |
| Read-only consumption | `XFR-D-044 v1.0` | Preserved, не расширена | — |
| STALE/freshness semantics | `XFR-D-038 v1.0` | Preserved, не переоткрыта | Runtime carrier/TTL |
| Score/confidence/risk/routing wording governance | `XFR-D-078 v1.0` (этот record) | Roles, semantic-separation preservation, no-enum-from-prose, no-guessed-mapping, fail-closed handling, non-compensation, prerequisite-not-authorization | Actual wording, mapping, bands, locale, schema |
| Field-allowlist/applicability | `XFR-D-072 v1.0` | Parallel prerequisite stated (§3.11) | Every actual row/field, requiredness |
| Reason/explanation catalog | `XFR-D-077 v1.0` | Untouched; sibling, non-merging (§3.10 п.4) | Whether artifacts merge |
| Diagnostic terminology | `XFR-D-069 v1.0` | Untouched; explicit non-inheritance stated | Future user-facing mapping |
| Scoring-internal semantics/ownership | `XFR-D-023`/`XFR-D-028` | Untouched; owner-pattern non-borrowing stated | Internal Scoring content |
| Risk-internal aggregation | `XFR-D-048` | Untouched | Risk-internal representation |
| Risk output runtime/public representation | Risk Policy открытое решение №1 | Dependency preserved | Exact representation |
| Localization | `XFR-D-079` | Untouched | Rendering per locale |
| Audience/purpose | `XFR-D-080` | Dependency preserved | Exact model, applicability |
| Cache/expiry/revocation | `XFR-D-081` | Untouched; stale/version-incompatible fail-closed boundary does not define cache semantics | TTL, cache key, invalidation/revocation procedure |
| Runtime carrier | `XFR-D-082` | No carrier inferred (confirmed absent from Data Contracts) | API/DB/event/schema/cache implementation |
| Actual evidence | `XFR-D-083` | Dependency preserved | Actual evidence package/dataset |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. Что остаётся `OPEN`

- каждый numeric score, threshold и band;
- display precision, rounding и normalization;
- public labels и exact wording/templates;
- все score-to-wording/confidence-to-wording/risk-to-wording/routing-to-wording mappings и их cardinality;
- ordering, severity и visual emphasis;
- locale и audience applicability (`XFR-D-079`/`XFR-D-080`);
- compatibility/version/hash mechanics and cache/expiry/revocation (`XFR-D-081`);
- actual-row behavior сверх approved qualitative fail-closed boundary (§3.7);
- output enum/status/schema;
- runtime/API/DB/schema/event carrier (`XFR-D-082`, подтверждено отсутствующий в Data Contracts v1.0);
- actual field/payload rows (`XFR-D-072`);
- evidence package (`XFR-D-083`);
- whether `XFR-D-077` и `XFR-D-078` eventually делят один artifact или остаются раздельными;
- Safe Presentation artifact approval/change control (`XFR-D-084`);
- production data, policy approval, runtime/API/DB/schema/event design и implementation;
- все три governance gates.

## 6. Rationale

В отличие от geography (`XFR-D-074`) и successive-disclosure (`XFR-D-076`), где Architecture почти не даёт текстового anchor'а, для этого вопроса Architecture §16/§17 дают почти дословно готовые presentation-boundary формулировки: «Confidence… а не привлекательность пары» и «Risk Score… не является доказательством нарушения» — источник уже практически формулирует то, что этот record нужно только формализовать на governance-уровне, не изобретать. Это делает qualitative половину этого record'а необычно прочной по source-grounding — сравнимо с unconditional combination-deny `XFR-D-075`, сильнее, чем у `XFR-D-076`/`XFR-D-077`.

Главная забота — не governance-owner assignment (он straightforward, как и в остальных пяти records этого cluster), а разведение с Scoring Policy's собственным internal-artifact governance паттерном (`Chief AI Architect + PRODUCT`), который легко перепутать именно потому, что предмет (score wording) физически касается Scoring-контента. `XFR-D-028` уже продемонстрировал правильное разведение для смежного вопроса (internal ownership vs external granularity), и этот record explicitly следует тому же прецеденту, не изобретая новый.

## 7. Adversarial cases

1. **Wording подразумевает, что высокий Match Score коррелирует с безопасностью, законностью или Qualification readiness.** Запрещено §3.3 п.1.
2. **Confidence представляют как «насколько хороша/привлекательна» пара, а не как надёжность оценки.** Запрещено §3.3 п.2 — прямое нарушение Architecture §16.
3. **Risk Score представляют как доказательство нарушения, кредитный рейтинг, замену юридической проверки, санкцию, основание сменить плательщика либо определить возврат/кредит.** Запрещено §3.3 п.3 — прямое нарушение Architecture §17.
4. **`QUALIFIED_HYPOTHESIS` wording представляют как authorization, гарантию или завершённый Decision Record.** Запрещено §3.3 п.4.
5. **`STALE`/historical результат представляют как текущий actionable вывод.** Запрещено §3.4 п.1 — прямое нарушение `XFR-D-038`.
6. **Unknown/conflicting значения представляют как определённо negative или positive, либо тихо заменяют числом по умолчанию.** Запрещено §3.4 п.2/п.3.
7. **«Высокий риск»/«критический» prose из Architecture переиспользуют как уже утверждённый user-facing label.** Запрещено §3.5.
8. **Missing/stale/version-incompatible score-wording mapping заполняют guessed или переиспользованным текстом вместо fail-closed для этого элемента.** Запрещено §3.6/§3.7.
9. **Чистый score по одному measurement используют, чтобы подразумевать безопасность другого, отдельного, нерезолвленного presentation element.** Запрещено §3.8 — non-compensation violation.
10. **Synthetic-only calibration evidence цитируют как доказательство production-safe wording.** Запрещено §3.8/§3.9.
11. **Risk Policy открытое решение №1 (runtime/public representation) трактуют как resolved, потому что этот record существует.** Запрещено §3.10 п.8.
12. **Localization или audience-targeting логику тихо поглощают под этот record вместо `XFR-D-079`/`XFR-D-080`.** Запрещено §3.10 п.9/п.10.
13. **Priority Score wording вводят, хотя Priority Score сам остаётся open/optional Scoring construct.** Запрещено §3.10 п.14.
14. **Отсутствие wording для одного элемента трактуют как основание для отказа всего payload, либо элемент показывают без required wording.** Запрещено §3.7 п.4/п.5.
15. **Wording этого record'а трактуют как заполняющий одну из пятнадцати `XFR-D-072` §3.4 evidence categories или создающий шестнадцатую.** Запрещено §3.11.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §§6.2, 6.5, 6.6, 6.9, §11.3, §15 решение №8, readiness и acceptance criteria могут получить это governance/evidence boundary без единой конкретной formulation, mapping, band или enum;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — owner-review overlay для `SPP-08 → XFR-D-078`, без переписывания исторических Wave 2D/§5.5/§5.5.1–§5.5.5 checkpoints;
- будущие Risk Policy открытое решение №1, `XFR-D-079`/`XFR-D-080`/`XFR-D-081`/`XFR-D-082`/`XFR-D-083`/`XFR-D-084`, actual Safe Presentation policy и runtime artifacts — отдельные passes.

Ни один future sync не должен интерпретировать этот record как approved wording, mapping, band, enum, threshold, legal determination, Safe Presentation Policy approval, actual evidence, dataset, evaluation run, production-safe payload, runtime carrier или implementation authorization.

## 9. Change control

Изменение этого qualitative boundary требует одобрения governance owner `PRODUCT + LEGAL` и mandatory approval `Chief AI Architect + AI + DEVELOPMENT` на одной version/hash, через новый versioned `XFR-D-078` record со ссылкой `supersedes` на эту версию. `AI + DEVELOPMENT` может готовить evidence, но не может одобрить governance determination единолично.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашивается current wording, mapping, band, enum или threshold, **then** значения отсутствуют и `XFR-D-078` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** governance authority, **when** роли проверяются, **then** owner — `PRODUCT + LEGAL` (не `Chief AI Architect + PRODUCT`), mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`, evidence-procedure owner `AI + DEVELOPMENT` не имеет unilateral approval.
3. **Given** Match Score, Confidence Score, Risk Score или Qualification routing, **when** формируется presentation, **then** ни один не пересчитывается, не округляется, не нормализуется, не bucket'ируется, не relabel'ится, не повышается, не понижается и не заменяется.
4. **Given** Confidence Score, **when** формируется wording, **then** она описывает надёжность оценки, не привлекательность пары.
5. **Given** Risk Score, **when** формируется wording, **then** она не утверждает доказательство нарушения, кредитный рейтинг, замену юридической проверки, санкцию, смену плательщика или определение возврата/кредита.
6. **Given** `STALE`/historical результат, **when** формируется presentation, **then** он не представлен как текущий actionable вывод.
7. **Given** unknown/conflicting/inconclusive значение, **when** формируется wording, **then** оно не приведено к positive/negative/numeric default.
8. **Given** «высокий риск»/«критический»/«низкая Confidence» prose Architecture, **when** её цитируют, **then** она не трактуется как approved public/runtime enum, threshold, band или label.
9. **Given** missing/stale/conflicting/version-incompatible mapping, **when** формируется candidate wording element, **then** он недопустим, underlying score/Risk/Confidence/Qualification result не меняется, absence не становится negative fact, весь payload не отклоняется автоматически.
10. **Given** aggregate/high score, high Confidence, low Risk, Qualification result, successful Presentation Readiness, user acceptance или synthetic-only evidence, **when** заявляется wording safety, **then** ни одно не компенсирует другой inadmissible/missing/unapproved element.
11. **Given** будущий safe wording или mapping entry, **when** запрашивается его роль, **then** он — только prerequisite, не самостоятельная authorization поля/payload/Qualification result/routing/Reveal/release/runtime/gate.
12. **Given** `XFR-D-044`, `XFR-D-038`, `XFR-D-072`, `XFR-D-077`, `XFR-D-069`, `XFR-D-023`/`XFR-D-028`, `XFR-D-048`, Risk Policy открытое решение №1, `XFR-D-079`, `XFR-D-080`, `XFR-D-081`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084`, **when** применяется этот record, **then** ни одно из них не переоткрывается, не расширяется и не подменяется.
13. **Given** пятнадцать evidence categories `XFR-D-072` §3.4, **when** проверяется, заполняет ли их этот record, **then** ни одна не заполнена и шестнадцатая не создана — wording governance и field-row approval остаются параллельными prerequisites.
14. **Given** этот record, **when** проверяются Eligibility/Hard Constraints/score/rank/Qualification/routing/policy/runtime/gate state, **then** ни одно не изменяется автоматически и все три gates остаются `BLOCKED`.
15. **Given** этот record, **when** проверяются Safe Presentation Policy approval, actual wording/mapping/enum/band, dataset, evaluation run, production-data sufficiency, runtime/API/DB/schema/event design или implementation, **then** ни одно не утверждено.

## 12. Итог

`XFR-D-078 SCORE/CONFIDENCE/RISK/QUALIFICATION PRESENTATION WORDING GOVERNANCE BOUNDARY APPROVED — ACTUAL WORDING, MAPPING, BANDS, LOCALE, SCHEMA, ACTUAL EVIDENCE, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
