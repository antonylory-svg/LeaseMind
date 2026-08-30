# LeaseMind Matching Decision Record — XFR-D-077

**Decision ID:** `XFR-D-077`

**Название:** User-facing safe reason/explanation catalog governance/evidence boundary for Safe Presentation

**Версия:** 1.0

**Дата решения:** 2026-08-30

**Статус:** `PARTIALLY_RESOLVED_BOUNDARY`

**Decision authority:** human project-governance confirmation in the 2026-08-30 working session

**Repository baseline:** `a51751cbd309c4dc801ee4521f6d0a650ae005a0`

**Governance owner:** `PRODUCT + LEGAL`

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`

**Evidence-procedure owner:** `AI + DEVELOPMENT`; evidence design, measurement, or catalog-candidate preparation does not replace joint `PRODUCT + LEGAL` governance ownership, does not grant unilateral approval, and does not substitute `PRODUCT`/`LEGAL` determination.

**Depends on:** `XFR-D-072 v1.0` (field-allowlist governance/evidence-prerequisite boundary — it governs actual field/payload rows and explanation applicability/requiredness; this record does not create a row or add a sixteenth evidence category), `XFR-D-073 v1.0` (registry-key identity), `XFR-D-044 v1.0` (read-only presentation consumption — this record establishes only qualitative governance conditions for a future approved safe reason reference, not its value or content; `XFR-D-044` already governs how an approved reference may be consumed), `XFR-D-033 v1.0`/`XFR-D-040 v1.0` (Qualification precedence and multi-cause/primary-reason rule — this record depends on and preserves them without reopening). Mapping/catalog ownership between Architecture §25.1 and Qualification `XFR-D-039`, Hard-constraint reason-code catalog `XFR-D-010`, Risk reason-reference namespace `XFR-D-052`, unknown/abstention terminology `XFR-D-069`, score/confidence/risk/routing wording `XFR-D-078`, localization `XFR-D-079`, audience/purpose model `XFR-D-080`, runtime carrier `XFR-D-082`, actual evidence `XFR-D-083` and artifact approval/change control `XFR-D-084` remain independent `OPEN` decisions.

---

## 1. Вопрос

Какова governance/evidence boundary будущего user-facing safe reason/explanation catalog для Safe Presentation, чтобы owner/approver roles, catalog-origin requirement (safe text только из approved, versioned catalog), fail-closed handling отсутствующего/неутверждённого mapping и явное разведение от смежных internal reason-infrastructure вопросов (§25.1/`XFR-D-039`, Hard Constraint `XFR-D-010`, Risk `XFR-D-052`) и от уже утверждённого `XFR-D-033`/`XFR-D-040` precedence/multi-cause rule были однозначны, но ни один namespace, catalog value, wording, mapping или runtime carrier не был преждевременно разрешён?

## 2. Source/status discipline

Architecture §37 вопрос №6 и §52 `SOURCE_NORMATIVE` назначают `PRODUCT + LEGAL` владельцами широкого вопроса о допустимых полях безопасного описания и artifact owner `SAFE_PRESENTATION_POLICY`.

Architecture §25 (`SOURCE_NORMATIVE`, «Причины отказа и disposition») задаёт три отдельные internal reason families: §25.1 — закрытый список ровно 12 алгоритмических причин Matching Engine (`HARD_CONSTRAINT_MISMATCH`…`SUPERSEDED_BY_NEW_PROFILE_VERSION`); §25.2 — процессные причины от AI Manager/внешнего сервиса, с явным запретом «Процессная причина не должна автоматически становиться отрицательной меткой совместимости»; §25.3 — человеческие причины, каждая с источником/автором/временем/доказательством/допустимостью в обучении. Architecture §33 (audit bundle) и §40 (writer-матрица: Matching Engine — единственный writer «scores, reasons, rule versions») требуют, чтобы причины и версии правил сохранялись для аудита — но нигде не требуют и не разрешают показ этих internal reasons пользователю. Architecture **не задаёт** mapping двенадцати значений §25.1 → четыре Qualification результата ни прямо, ни через cross-reference, **не называет** §25.1 финальным исчерпывающим Qualification/user-facing reason namespace и **не утверждает** ни один public/runtime reason catalog для presentation-контура ни в каком виде.

Safe Presentation Policy §6.9 (candidate family, `DECISION_CANDIDATE_FOR_REVIEW`) уже прямо квалифицирует полный запрет свободного текста как «консервативное… расширение узкой §22.1-нормы… не source-normative абсолютная норма, действующее до появления будущего approved machine-readable reason/explanation catalog». `SPP-C-009` (прочитан дословно) подтверждает тот же статус: полный запрет свободного текста для family §6.9 — `DECISION_CANDIDATE_FOR_REVIEW` policy rule, не source-normative. Safe Presentation Policy §15 открытое решение №7 (прочитано дословно): «Safe reason/explanation catalog | `PRODUCT + LEGAL` — candidate assignment, с координацией/зависимостью от будущих owner'ов Qualification/Risk reason-namespace (Qualification Policy №12 / Risk Policy №7 — оба `OPEN`) | Candidate» — plain candidate, не resolved ни одним прежним sync, coordination-dependent на двух других тоже открытых candidate-вопросах.

Qualification Policy §15 открытое решение №12 (§25.1 ↔ Qualification reason mapping и namespace/catalog owner) и Risk Policy §13 открытое решение №7 (reason-reference namespace/values/compatibility-change process/owner) — оба независимо прочитаны и подтверждены как candidate assignment, не resolved. Feature Schema открытое решение №13 (`FS-13 → XFR-D-010`, «Публичный `reason_code` каталог… для всех 20 hard-constraint candidates») использует слово «публичный» в собственной, internal machine-readable framing — это **не** эквивалент approved, human-reviewed, user-facing wording; этот record явно не трактует framing Feature Schema как уже означающую safe-for-display статус.

**Важное non-conflation разведение, независимо проверенное через Inventory `XFR-C-007`.** Inventory явно фиксирует цепочку зависимостей `XFR-D-039 → {XFR-D-010, XFR-D-052} → XFR-D-077` и утверждает: «четыре outputs остаются разными» — то есть mapping/catalog ownership §25.1↔Qualification (`XFR-D-039`), Hard-constraint reason-code catalog (`XFR-D-010`), Risk reason-reference namespace (`XFR-D-052`) и user-facing safe reason/explanation catalog (`XFR-D-077`, этот record) — четыре структурно разных, не сворачиваемых друг в друга вопроса. Этот record — единственный из четырёх, который касается того, что реально видит пользователь; остальные три остаются независимыми upstream-вопросами, чьи будущие outputs этот record может использовать как raw material, но не определяет и не поглощает.

**Approval этого record'а не переводит его содержание в `SOURCE_NORMATIVE`.** Human-approved qualitative governance boundary ниже остаётся отдельной, пятой категорией normative-дисциплины (по аналогии с `XFR-D-044` §11.3 Qualification Policy) — не буквальным текстом Architecture и не source-normative фактом.

`XFR-D-028 v1.0` (прочитан полностью) уже независимо подтверждает существование и candidate-статус этого вопроса: его §1 явно называет `XFR-D-077` («reason/explanation catalog») одним из двух Safe Presentation open decisions (наряду с `XFR-D-072`), «независимо прочитанным и подтверждённым как `OPEN` в этой сессии», и explicitly отказывается назначать ему owner сверх уже существующего candidate `PRODUCT + LEGAL`.

## 3. Решение

### 3.1. Роли и non-conflation

1. **Governance owner — `PRODUCT + LEGAL`.** Напрямую Architecture §37 №6/§52 pair, совпадает с candidate assignment Safe Presentation Policy §15 решения №7 без отклонения.
2. **Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.** Установлены by direct precedent из `XFR-D-072 v1.0`/`XFR-D-074 v1.0`/`XFR-D-075 v1.0`/`XFR-D-076 v1.0` (тот же артефакт, тот же широкий вопрос №6), не source-named для именно этого под-вопроса напрямую — это precedent-based расширение того же паттерна в четвёртый раз, не Architecture-цитата.
3. **Evidence-procedure owner — `AI + DEVELOPMENT`.** Готовит candidate catalog/evidence, но не принимает PRODUCT/LEGAL determination и не становится unilateral approver.
4. Владельцы `XFR-D-039`, `XFR-D-010` и `XFR-D-052` (по-прежнему candidate assignment, ни один не resolved) не приобретают authority над user-facing Safe Presentation wording этим record'ом. Симметрично, этот record не приобретает и не переопределяет ownership этих трёх upstream internal namespaces.
5. Ни одна из ролей не заменяет и не подменяет другую; owner-пара `PRODUCT + LEGAL` не одобряет catalog единолично, approvers не заменяют owner readiness.

### 3.2. Catalog-origin boundary

1. User-facing explanation может происходить только из applicable entry будущего approved, versioned Safe Presentation reason/explanation catalog.
2. Одного существования entry недостаточно: должны также выполняться его approved mapping, version compatibility и applicability к конкретному случаю.
3. **Это не вечный blanket-запрет на весь текст.** Controlled catalog templates могут быть утверждены в будущем — запрет действует только до появления applicable approved entry/mapping, не как категорический запрет любого текста навсегда.
4. До появления такого applicable approved entry/mapping, uncontrolled свободный текст не допускается как user-facing explanation.
5. Raw evidence, internal cause details, точные значения второй стороны, operator-введённый свободный текст и AI-generated свободный текст не становятся user-facing автоматически.
6. Internal Architecture §25.1 коды, Hard Constraint коды, Risk references и Qualification reasons/results не могут показываться напрямую и не трактуются как safe catalog values без отдельного approved mapping/catalog entry.
7. Этот record не утверждает, что каждый Safe Presentation payload обязан содержать explanation; applicability/обязательность для любой actual row остаётся `OPEN` под `XFR-D-072`.

### 3.3. Missing/unmapped/stale/conflicting/version-incompatible — fail closed

1. Missing, unmapped, stale, conflicting или version-incompatible reason reference не может быть заменена guessed wording, label reuse, fallback inheritance или namespace coercion.
2. Такая reference делает candidate explanation недопустимой по этому record'у и не становится негативным/failed business fact о самом Property/Tenant/Match. Этот record не разрешает presentation без explanation и не блокирует весь payload: exact explanation requiredness и fail-closed behavior конкретной actual row остаются `OPEN` под `XFR-D-072`.

### 3.4. Preservation of `XFR-D-033`/`XFR-D-040`

1. Все причины и evidence references остаются доступны для audit — этот record не сокращает и не скрывает их.
2. Primary reason остаётся deterministic резюме из route-determining precedence-класса `XFR-D-033`.
3. Safe Presentation/catalog processing не пересчитывает routing, не отбрасывает audit causes, не выбирает другой precedence-класс и не изобретает другую primary cause.
4. Same-class ordering и actual reason catalog (значения, порядок) остаются `OPEN` — то же самое, что уже утверждено `XFR-D-040` §2 п.4: «Если в одном precedence-классе несколько причин, используется порядок будущего approved versioned reason catalog» — этот record не выбирает этот порядок, только резервирует governance-слой, который его в будущем утвердит.

### 3.5. Prerequisite, не authorization

1. Safe reason reference или catalog entry не авторизует поле, transformation, payload, Qualification result, routing decision, Reveal, release, runtime или governance gate.
2. Ни одно successful evidence автоматически не публикует presentation, не меняет score/Risk/Qualification/routing/policy/model/runtime/release/gate.
3. Synthetic-only evidence не создаёт production-safe wording claim.

### 3.6. Явное non-conflation

Этот record explicitly не переоткрывает, не расширяет и не подменяет:

1. `XFR-D-039` — governs §25.1 ↔ Qualification reason mapping и namespace/catalog ownership; upstream, независимый, не resolved этим record'ом;
2. `XFR-D-010` — governs Hard Constraint reason-code catalog; upstream, независимый;
3. `XFR-D-052` — governs Risk reason-reference namespace/values/process; upstream, независимый;
4. `XFR-D-033`/`XFR-D-040` — governs Qualification precedence и multi-cause/primary-reason rule; уже approved, преследуется §3.4, не переоткрывается;
5. `XFR-D-044 v1.0` — governs read-only Safe Presentation consumption Qualification result; этот record устанавливает только qualitative governance conditions будущей approved safe reason reference, не её value/content, а `XFR-D-044` уже governs, как approved reference может потребляться;
6. `XFR-D-069 v1.0` — governs unknown/abstention terminology для evaluation diagnostics; отдельный governance-vocabulary вопрос, сам `XFR-D-069` §2 п.10 явно резервирует user-facing mapping как отдельное будущее решение;
7. `XFR-D-072 v1.0` — governs actual field/payload allowlist и explanation requiredness для конкретной row; этот record не создаёт и не подразумевает ни одной actual row;
8. `XFR-D-073 v1.0` — governs object-type registry-key identity; независимая ось;
9. `XFR-D-078` — governs score/confidence/risk/routing presentation wording; смежный, но отдельный text-governance вопрос;
10. `XFR-D-079` — governs localization; downstream rendering, не catalog existence/governance;
11. `XFR-D-080` — governs audience/purpose model; applicability catalog entry к конкретной аудитории зависит от него, не определяется здесь;
12. `XFR-D-082` — governs runtime carrier; подтверждено отсутствующий в Data Contracts v1.0 (repo-wide проверка `reason_code`/`reason_reference`/`explanation_catalog`/`safe_reason` обнаружила только post-Match critical-chain reason_code enums — Payer Resolution/Participation/Identity-Authority/Lawful Basis/Previous Contact/Payment-Fiscal — структурно не связанные ни с одной Matching-side reason namespace);
13. `XFR-D-083` — governs actual evidence package;
14. `XFR-D-084` — governs Safe Presentation artifact approval/change control;
15. direct-identifier DLP и Scoring/Risk/Qualification/gate decisions — этот record не пересчитывает и не меняет score/rank/Qualification/Risk/routing/gate state.

Whether `XFR-D-077` and `XFR-D-078` eventually share один artifact или остаются раздельными artifacts — этот record не решает (§5).

### 3.7. Presentation, scoring и gate separation

Согласовано с `XFR-D-044`/`XFR-D-072`/`XFR-D-074`/`XFR-D-075`/`XFR-D-076`: Safe Presentation остаётся read-only consumer; ни одна catalog-governance evidence не пересчитывает и не меняет Eligibility, Hard Constraints, score, rank, Qualification, Confidence, Risk или routing. Высокий score, `QUALIFIED_HYPOTHESIS`, Presentation Readiness или user acceptance не авторизует catalog entry и не обходит downstream gates.

### 3.8. Partial, never fully resolved

`XFR-D-077` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, catalog-origin requirement (safe text только из approved catalog, не вечный blanket-запрет), fail-closed handling missing/unmapped/stale/conflicting/version-incompatible reference, preservation of `XFR-D-033`/`XFR-D-040` без пересчёта routing/primary cause, non-compensation через prerequisite-not-authorization boundary, explicit non-conflation с `XFR-D-039`/`XFR-D-010`/`XFR-D-052`/`XFR-D-069`/`XFR-D-078`/`XFR-D-079`/`XFR-D-080`/`XFR-D-082`/`XFR-D-083`/`XFR-D-084` разрешены qualitatively.

Namespace/name каталога, catalog codes/values, canonical wording/templates, source reason families и их coverage, mapping cardinality, same-class и catalog ordering, severity/criticality framing, locale/localized rendering, audience/purpose applicability, compatibility/change process, version/hash mechanics, fallback behavior сверх approved fail-closed boundary, evidence package, output enum/status/schema, runtime carrier и вопрос единого/раздельного artifact с `XFR-D-078` остаются `OPEN`. Будущее точное решение требует нового versioned `XFR-D-077` record с `supersedes`.

## 4. Layer/boundary

| Layer | Authority | Разрешено этим record'ом | Остаётся `OPEN` |
|---|---|---|---|
| Broad decision/artifact owner | Architecture §§37/52 | `PRODUCT + LEGAL` preserved | Actual artifact approval/change control `XFR-D-084` |
| Internal reason families (§25.1–25.3) | Architecture §25 (`SOURCE_NORMATIVE`) | Не изменены, не переприписаны user-facing статусу | Mapping в Qualification (`XFR-D-039`) |
| Hard Constraint reason-code catalog | `XFR-D-010` | Untouched; upstream dependency | Actual codes, mapping cardinality |
| Risk reason-reference namespace | `XFR-D-052` | Untouched; upstream dependency | Namespace, values, process |
| Qualification precedence/multi-cause rule | `XFR-D-033`/`XFR-D-040` | Preserved, не пересчитывается | Same-class order, actual catalog |
| Safe reason/explanation catalog governance | `XFR-D-077 v1.0` (этот record) | Roles, catalog-origin requirement, fail-closed handling, prerequisite-not-authorization boundary | Namespace, values, wording, mapping, ordering, locale, audience, runtime |
| Presentation consumption | `XFR-D-044 v1.0` | Consumption semantics untouched; этот record не определяет actual reference value/content | Actual reference/catalog contents остаются `OPEN` под `XFR-D-077` |
| Score/confidence/risk/routing wording | `XFR-D-078` | Untouched; sibling text-governance question | Exact wording, shared/separate artifact with `XFR-D-077` |
| Localization | `XFR-D-079` | Untouched | Rendering per locale |
| Audience/purpose | `XFR-D-080` | Dependency preserved | Exact model, applicability |
| Runtime carrier | `XFR-D-082` | No carrier inferred (confirmed absent from Data Contracts) | API/DB/event/schema/cache implementation |
| Actual evidence | `XFR-D-083` | Dependency preserved | Actual evidence package/dataset |
| Registry identity | `XFR-D-073 v1.0` | Untouched | Any registry expansion/display |
| Field allowlist / explanation requiredness | `XFR-D-072 v1.0` | Untouched; dependency stated (§3.2 п.7) | Every actual row/field, requiredness |
| Policy/release/gates | Separate artifacts/gates | No automatic effect | All actual approvals remain blocked |

## 5. Что остаётся `OPEN`

- catalog namespace/name;
- catalog codes/values;
- canonical wording/templates;
- source reason families фактически в scope (какие из §25.1/Hard Constraint/Risk/Qualification питают catalog, и как) и их coverage;
- mapping cardinality (один internal reason → один или много safe entries, или наоборот);
- same-class ordering (зависит от `XFR-D-040`) и catalog ordering в целом;
- severity/criticality framing;
- locale/localized rendering (`XFR-D-079`);
- audience/purpose applicability (`XFR-D-080`);
- compatibility/change process;
- version/hash mechanics;
- fallback behavior сверх approved fail-closed boundary (§3.3);
- evidence package (`XFR-D-083`);
- output enum/status/schema;
- runtime/API/DB/schema/event carrier (`XFR-D-082`, подтверждено отсутствующий в Data Contracts v1.0);
- whether `XFR-D-077` и `XFR-D-078` eventually делят один artifact или остаются раздельными;
- actual allowlist row/policy version/hash для любого поля, использующего эту evidence (`XFR-D-072`);
- Safe Presentation artifact approval/change control (`XFR-D-084`);
- production data, policy approval, runtime/API/DB/schema/event design и implementation;
- все три governance gates.

## 6. Rationale

Из четырёх структурно разных вопросов, зафиксированных Inventory как `XFR-D-039 → {XFR-D-010, XFR-D-052} → XFR-D-077`, этот record — единственный, касающийся того, что реально видит пользователь, и при этом источник (Architecture) не даёт для него вообще никакого текстового anchor: §25 задаёт только internal/algorithmic namespace, явно не предназначенный для user-facing показа. Это делает содержательную границу этого record'а особенно узкой — почти весь content-слой (namespace, values, wording, mapping, ordering, locale, audience) остаётся `OPEN`, и единственное, что можно безопасно разрешить, — тот же qualitative governance/evidence-procedure паттерн, уже четырежды валидированный для смежных Safe Presentation вопросов, применённый здесь с особым акцентом на то, чтобы (a) internal reason codes не были случайно продвинуты в user-facing статус, и (b) этот record не поглотил тихо territory трёх upstream-вопросов, от которых он зависит, но которых не решает.

Отдельная забота — сохранение уже принятого `XFR-D-040` без искажения: multi-cause preservation и deterministic primary-reason rule уже утверждены, и этот record явно формулирует, что governance каталога не может стать окольным путём для пересчёта routing или подмены primary cause, которую `XFR-D-033`/`XFR-D-040` уже определили.

## 7. Adversarial cases

1. **Raw audit evidence или internal cause detail показывают пользователю напрямую.** Запрещено §3.2 п.5 — raw evidence не становится user-facing automatically.
2. **AI-generated или operator free-text fallback используют, когда approved mapping отсутствует.** Запрещено §3.2 п.4/§3.3 п.1.
3. **§25.1, Hard Constraint или Risk код переиспользуют напрямую как user-facing текст.** Запрещено §3.2 п.6.
4. **Будущий catalog value коллидирует/затеняет один из двенадцати закрытых значений §25.1.** Запрещено §3.6 п.1/п.2/п.3 — internal namespaces и будущий safe catalog остаются разными пространствами имён; namespace collision недопустима.
5. **Catalog wording меняет routing или primary cause.** Запрещено §3.4 п.3.
6. **Audit causes отбрасывают, потому что показан только один safe reason.** Запрещено §3.4 п.1.
7. **Устаревший или version-incompatible catalog mapping переиспользуют.** Запрещено §3.3 п.1.
8. **Localization behavior тихо поглощают под `XFR-D-077` вместо `XFR-D-079`.** Запрещено §3.6 п.10.
9. **Audience applicability тихо поглощают под `XFR-D-077` вместо `XFR-D-080`.** Запрещено §3.6 п.11.
10. **Score/confidence/risk/routing wording тихо поглощают под `XFR-D-077` вместо `XFR-D-078`.** Запрещено §3.6 п.9.
11. **Существование catalog entry трактуют как authorization поля/payload.** Запрещено §3.5 п.1.
12. **Synthetic-only evidence используют как production-safe wording proof.** Запрещено §3.5 п.3.
13. **Отсутствие explanation трактуют как negative business fact или как автоматический отказ всего payload.** Запрещено §3.3 п.2/§3.2 п.7 — absence блокирует только candidate explanation, не весь payload и не сам факт о Property/Tenant/Match.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_SAFE_PRESENTATION_POLICY_v0.1.md` — metadata, §6.9, §11.3, §15 решение №7, `SPP-C-009`, readiness и acceptance criteria могут получить это governance/evidence boundary без единого конкретного catalog namespace, value, wording или mapping;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — owner-review overlay для `SPP-07 → XFR-D-077`, без переписывания исторических Wave 2D/§5.5/§5.5.1–§5.5.4 checkpoints;
- будущие `XFR-D-039`/`XFR-D-010`/`XFR-D-052`/`XFR-D-069`-mapping/`XFR-D-078`/`XFR-D-079`/`XFR-D-080`/`XFR-D-082`/`XFR-D-083`/`XFR-D-084`, actual Safe Presentation policy и runtime artifacts — отдельные passes.

Ни один future sync не должен интерпретировать этот record как approved catalog namespace, code, value, text, template, mapping, order, locale, audience rule, re-identification/Qualification/Risk/Hard-Constraint namespace, Safe Presentation Policy approval, actual evidence, dataset, evaluation run, production-safe payload, runtime carrier или implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, evidence-procedure role, catalog-origin requirement, missing/unmapped/stale/conflicting/version-incompatible fail-closed handling, preservation of `XFR-D-033`/`XFR-D-040`, prerequisite-not-authorization boundary или explicit non-conflation list требует нового versioned `XFR-D-077` record, согласованного `PRODUCT + LEGAL + Chief AI Architect + AI + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`.

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашивается current catalog namespace, values, wording, mapping или ordering, **then** значения отсутствуют и `XFR-D-077` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** governance authority, **when** роли проверяются, **then** owner — `PRODUCT + LEGAL`, mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`, evidence-procedure owner `AI + DEVELOPMENT` не имеет unilateral approval.
3. **Given** будущий catalog entry, **when** предлагается user-facing explanation, **then** она допустима только если entry applicable, approved, versioned и mapping/compatibility выполнены; отсутствие любого из условий блокирует candidate explanation, не весь payload.
4. **Given** raw evidence, internal cause detail, точное значение второй стороны или operator/AI-generated free text, **when** отсутствует applicable approved catalog entry, **then** ни один из них не становится user-facing explanation automatically.
5. **Given** §25.1, Hard Constraint или Risk internal reason code, **when** предлагается его прямой показ, **then** показ запрещён без отдельного approved mapping/catalog entry.
6. **Given** missing/unmapped/stale/conflicting/version-incompatible reason reference, **when** формируется candidate explanation, **then** она блокируется fail closed, не coerced в negative/failed business fact.
7. **Given** `XFR-D-033`/`XFR-D-040` precedence и primary-reason rule, **when** применяется catalog governance, **then** routing не пересчитывается, audit causes не отбрасываются, primary cause не заменяется; same-class order и actual catalog остаются open.
8. **Given** будущий safe reason reference или catalog entry, **when** запрашивается его роль, **then** он не авторизует поле/payload/Qualification result/routing/Reveal/release/runtime/gate.
9. **Given** `XFR-D-039`, `XFR-D-010`, `XFR-D-052`, `XFR-D-033`/`XFR-D-040`, `XFR-D-044`, `XFR-D-069`, `XFR-D-072`, `XFR-D-073`, `XFR-D-078`, `XFR-D-079`, `XFR-D-080`, `XFR-D-082`, `XFR-D-083`, `XFR-D-084`, DLP и Scoring/Risk/Qualification/gate decisions, **when** применяется этот record, **then** ни одно из них не переоткрывается, не расширяется и не подменяется.
10. **Given** этот record, **when** проверяются Eligibility/Hard Constraints/score/rank/Qualification/routing/policy/runtime/gate state, **then** ни одно не изменяется автоматически и все три gates остаются `BLOCKED`.
11. **Given** этот record, **when** проверяются Safe Presentation Policy approval, actual catalog entry/code/value/text/mapping, Qualification/Risk/Hard-Constraint namespace approval, dataset, evaluation run, production-data sufficiency, runtime/API/DB/schema/event design или implementation, **then** ни одно не утверждено.

## 12. Итог

`XFR-D-077 USER-FACING SAFE REASON/EXPLANATION CATALOG GOVERNANCE BOUNDARY APPROVED — CATALOG NAMESPACE, VALUES, WORDING, MAPPING, ORDERING, LOCALE, AUDIENCE, ACTUAL EVIDENCE, POLICY, RUNTIME AND IMPLEMENTATION REMAIN OPEN/BLOCKED`
