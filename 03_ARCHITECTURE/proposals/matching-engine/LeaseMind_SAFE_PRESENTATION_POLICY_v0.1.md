# LeaseMind SAFE_PRESENTATION_POLICY

**Версия:** 0.1
**Дата:** 2026-08-23
**Статус:** `Proposal for cross-functional review — does not authorize implementation`
**Artifact owner (Architecture §52, запись `SAFE_PRESENTATION_POLICY`, «Reveal blocker»):** `PRODUCT + LEGAL` — `SOURCE_NORMATIVE`
**Decision owner (Architecture §37 вопрос №6, дословно «Какие поля допустимы в безопасном описании варианта для разных типов объектов без риска повторной идентификации?»):** `PRODUCT + LEGAL` — `SOURCE_NORMATIVE`; источник называет ту же owner-пару для обеих граней (в отличие от, например, `MATCHING_SCORING_POLICY`, где artifact owner и decision owner — разные роли), поэтому здесь они не разводятся искусственно
**Technical/coordination contributors (candidate, источник не назначает owner'ами ни артефакта, ни вопроса №6):** Chief AI Architect — координация cross-functional review, по аналогии с coordinator-role precedent именно в `MATCHING_FEATURE_SCHEMA_v0.1.md` и `MATCHING_EVALUATION_PLAN_v0.1.md` (там координатор явно отделён от owner; в `MATCHING_RISK_POLICY_v0.1.md`/`MATCHING_SCORING_POLICY_v0.1.md`, напротив, Chief AI Architect входит в сам artifact owner — это другой паттерн, сюда не переносится); AI — combination-risk/evaluation procedure support; DEVELOPMENT — technical feasibility будущего carrier. Ни одна из этих ролей не подменяет и не разделяет owner-пару `PRODUCT + LEGAL`.

**This proposal does not authorize implementation, runtime/API/schema/event/table/error-catalog changes, model release, synthetic acceptance, production use, an approved field allowlist, an approved object-type registry, a qualitative or numeric presentation-risk scale, localized UI copy, a legal-basis determination, a reason/explanation namespace, or any gate.**

Architecture §37 вопрос №6 остаётся `OPEN`. Документ его не закрывает — ни полностью, ни частично.

Human-approved governance decisions `LeaseMind_MATCHING_DECISION_XFR-D-038_v1.0.md` (STALE orthogonality), `LeaseMind_MATCHING_DECISION_XFR-D-040_v1.0.md` (multi-cause/primary-reason rule) и `LeaseMind_MATCHING_DECISION_XFR-D-044_v1.0.md` (Safe Presentation read-only consumption boundary) — обязательные governance decisions для соответствующих граней ниже (§6.5, §9, §11.3, §15 №7/№8/№10); при необходимости также применимы `XFR-D-030`/`XFR-D-031` (Qualification artifact owner/responsibility boundary). Их approval не переводит этот Proposal или `MATCHING_QUALIFICATION_POLICY` в `APPROVED` и не утверждает exact wording/allowlist/audience payload.

**Связанные документы:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` (полностью, включая §§4–5, 8–14, 18.1–18.7, 21–24, 29–33, 36–38, 40, 42–50, 52–54), `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (независимо перепроверен repo-wide поиском на предмет safe-presentation carrier — см. §12), `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` / `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` / `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` / `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` / `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` (все — Proposal-зависимости, не source), `LeaseMind_MATCHING_DECISION_XFR-D-030_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-031_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-038_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-040_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-044_v1.0.md`, `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md` (только DEVELOPMENT evidence), `LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md` (Approved), `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md` (только как источник `property_type` enum и `protected_commercial_data` классификации).

---

## 1. Metadata и нормативная дисциплина

Каждое существенное утверждение этого документа помечено одним из статусов:

- `SOURCE_NORMATIVE` — прямо установлено источником, цитируется/пересказывается без ослабления;
- `DECISION_CANDIDATE_FOR_REVIEW` — предлагаемая этим Proposal конструкция для PRODUCT + LEGAL review, не утверждена;
- `OPEN_BLOCKED_PENDING_DECISION` — нет утверждённого решения/evidence, вопрос требует отдельного решения owner'а;
- `OUT_OF_SCOPE` — принадлежит другой policy/gate/domain.

**Merged Proposal не становится normative только из-за merge.** `MATCHING_FEATURE_SCHEMA_v0.1.md`, `MATCHING_SCORING_POLICY_v0.1.md`, `MATCHING_QUALIFICATION_POLICY_v0.1.md`, `MATCHING_RISK_POLICY_v0.1.md` и `MATCHING_EVALUATION_PLAN_v0.1.md` имеют статус `Proposal`, не `APPROVED`. Их собственные положения цитируются здесь только как precedent/corroborating context, не как самостоятельный source; source-нормативны только те их фрагменты, которые сами корректно и без ослабления цитируют буквальный текст Architecture — и тогда этот документ цитирует Architecture напрямую, а не Proposal.

Owners — только роли, не filenames/gates/services. Technical writer (Matching Engine, §40), coordinator (AI Manager), artifact owner, decision owner, reviewer и approver — шесть разных понятий; ни одно не подменяет другое нигде в этом документе.

Этот Proposal нигде не называется утверждённым/approved, кроме явного отрицания (см. `SPP-C-023`).

---

## 2. Источники и source hierarchy

Прочитаны полностью: `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` (2639 строк, целиком, включая все таблицы Change Log, §§5, 8–14, 18.1–18.7, 21–24, 29–33, 36–38, 40, 42–50, 52–54); `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (независимо перепроверен repo-wide поиском на presentation/safe/allowlist/disclosure/`GateState`-термины — см. §12); все пять sibling Proposals — полностью; восьмой DEVELOPMENT review — полностью; `LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md` (Approved) — полностью; `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` — целевые разделы 6, 9–12, 14, 16.

Source-приоритет:

1. буквальный текст `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` (Proposal for cross-functional review and approval, но единственный источник, прямо упоминающий `SAFE_PRESENTATION_POLICY` по имени — §37, §52);
2. буквальный текст `LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md` (**Approved**) и `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` — только там, где они прямо касаются protected data/one-option/human-decision boundary;
3. `MATCHING_DATA_CONTRACTS_v1.0.md` — только как proof-of-absence исполнимого carrier (§12), не как источник presentation-норм;
4. sibling Proposal-документы — только как corroborating precedent/candidate, никогда как independent source (§1 выше).

Ни один sibling Proposal не повышается до source-normative этим документом, даже там, где он сам корректно цитирует Architecture — в этих случаях данный документ цитирует Architecture напрямую.

---

## 3. Назначение, scope и non-goals

### 3.1. Назначение

`SAFE_PRESENTATION_POLICY` — будущий governance-артефакт, определяющий: границы минимизированного user-facing представления Квалифицированного варианта **до Reveal** (Safe Presentation); терминологию и boundary matrix относительно двух соседних объектов (внутренний Match Package и protected Reveal package); source-normative deny-boundary; candidate content families без утверждённого allowlist; forma будущей object-type matrix; re-identification/combination-risk модель на уровне концепции; concept-level presentation evidence bundle; gate-границы; boundary со Scoring/Qualification/Risk/Confidence; DLP/channel coverage; Data Contracts gap; evaluation evidence plan; open decisions.

Документ частично формализует Architecture §37 вопрос №6 (владелец решения `PRODUCT + LEGAL`, `SOURCE_NORMATIVE`) **только процедурно** — не назначает ни одного конкретного допустимого поля и не закрывает вопрос как решённый.

### 3.2. Non-goals — явно исключено

Документ **не задаёт и не создаёт**:

- внутренний Match Package целиком (§23 Architecture) — остаётся собственностью Matching Engine/AI Manager, `OUT_OF_SCOPE`;
- protected Reveal package (§21, §43, §46 Architecture) — остаётся собственностью Reveal Service/Introduction Record Service, `OUT_OF_SCOPE`;
- scoring/ranking/Qualification/Risk computation — `OUT_OF_SCOPE`, принадлежит `MATCHING_SCORING_POLICY`/`MATCHING_QUALIFICATION_POLICY`/`MATCHING_RISK_POLICY`;
- Participation/Previous Contact/Payment/Introduction Record/Reveal Delivery decisions (§18.3–18.7 Architecture) — `OUT_OF_SCOPE`, все — внешние gates;
- user acceptance, payment, protected-data disclosure — `OUT_OF_SCOPE`;
- runtime/API/schema/event/table/error catalog — не создаётся ни в каком виде (§8, §12);
- production authorization в любой форме — не разрешается.

---

## 4. Три разных объекта — boundary matrix

`SOURCE_NORMATIVE` разграничение (§23 Architecture — Match Package; §22.1/§37 №6 — Safe Presentation как отдельная «политика минимизации»; §21/§43/§46 — Reveal package):

| Объект | Источник/владелец | Аудитория | Состав (source-normative) | Правовой статус |
|---|---|---|---|---|
| **Internal Match Package** | Matching Engine → AI Manager (§23) | AI Manager (внутренний, не пользователь) | Полные ID (§23.1), все оценки (§23.2: Tenant/Owner/Reciprocal/Deal/Match/Confidence/Risk Score), объяснение (§23.3), доказательства/версии (§23.4), правовые/процессные readiness flags (§23.5), включая внутренние технические идентификаторы | Внутренний технический контур; §5 принцип 17 прямо запрещает передавать пользователю «внутренние технические идентификаторы» |
| **Safe Presentation** (этот документ) | Отдельная «политика минимизации» поверх Match Package (§22.1, дословно: «Разрешенное безопасное представление строится отдельной политикой минимизации…») | Конкретный пользователь, **до** Reveal | Не задан ни одним источником — предмет этого документа (§5) | `DECISION_CANDIDATE_FOR_REVIEW` для состава; сам факт обязательности существования такой policy — `SOURCE_NORMATIVE` |
| **Protected Reveal package** | Reveal Service, после всех обязательных gates (§18.7, §21.5, §43, §46) | Только authenticated recipient конкретной Записи, после `REVEAL_COMMITTED` и доказанной доставки | Точный адрес, контакты, документы — полный protected manifest | `OUT_OF_SCOPE` для этого документа целиком — управляется §18.6–18.7, §43, будущей `REVEAL_DELIVERY_EVIDENCE_POLICY` |

`SOURCE_NORMATIVE` границы, зафиксированные без ослабления:

- **Match Package не передаётся пользователю «как есть».** Прямое следствие §5 принципа 17 («Пользователю передаются выводы, причины и уверенность, но не внутренние технические идентификаторы») и §18.2 («Matching Engine передает данные для проверки, но не открывает вариант пользователю самостоятельно»).
- **Safe Presentation не является Reveal.** Reveal требует отдельно `ADVANCE_SETTLED_AND_FISCALIZED`, `SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED`, `NO_PREVIOUS_CONTACT_CONFIRMED`, актуальный Participation Acceptance Record и переход `PRE_REVEAL_LOCKED → REVEAL_COMMITTED` (§18.7, дословно) — ни одно из этих условий не удовлетворяется показом Safe Presentation.
- **Reveal Service и source owners (Identity/Authority Registry, Lawful Basis/Consent Registry, Payment/Fiscal Ledger, Participation Service, Legal/Decision Service, Payer Resolution) остаются полностью вне этой policy.** Этот документ не создаёт для них ни одной новой обязанности и не читает их source-of-truth напрямую (§40 Architecture — нормативная матрица writers).

---

## 5. Source-normative deny boundary

Дословный список §22.1 Architecture — `SOURCE_NORMATIVE`, без ослабления. Заголовок §22.1: «До раскрытия». Следующее предложение источника: «Запрещено передавать:»

- точный адрес;
- координаты;
- район, метро, ориентир, время в пути или расстояние, **если они позволяют определить объект**;
- ФИО или наименование второй стороны;
- телефон, email, мессенджер;
- уникальное фото, документ или описание, позволяющее найти объект;
- комбинацию признаков с высоким риском повторной идентификации;
- защищенные значения в API, аналитике, уведомлении, журнале ошибки или предварительно загруженных данных.

Далее дословно, §22.1: «Разрешенное безопасное представление строится отдельной политикой минимизации и включает только те агрегированные признаки, которые нужны для оценки варианта и не позволяют обойти LeaseMind.» — это прямое текстовое основание существования настоящего документа.

Смежные `SOURCE_NORMATIVE` нормы без ослабления:

- §5 принцип 13: «Matching Engine не раскрывает точный адрес, контакты или косвенные идентификаторы объекта»;
- §5 принцип 17: «Пользователю передаются выводы, причины и уверенность, но не внутренние технические идентификаторы»;
- §5 принцип 18: «LeaseMind не превращается в каталог объектов или арендаторов»;
- §9.4: точный адрес и координаты — «только в защищенном контуре»; §22.2: «Matching Engine может использовать точную геопозицию в защищенном контуре для расчета совместимости. Результат наружу передается как объяснение без раскрытия исходного значения»;
- §8.2/§8.4: персональные/защищённые данные хранятся отдельно; токены/псевдонимы не считаются обезличенными;
- `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §12.3: `protected_commercial_data` (включая точный адрес) требует «отдельный контроль доступа, маскирование и аудит»; `CTA-L-010`: «агент без protected scope запрашивает raw address → доступ запрещён, попытка записана в Audit Log»;
- `LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md` (Approved) §2 п.4: «Точный адрес и другие защищенные данные раскрываются только после прохождения соответствующего коммерческого и политического контроля»; §18: отдельная строка «Address Disclosure Gate для точного адреса» и «маскирование защищенных данных в контексте агента».

**Условные запреты не превращаются в разрешения.** Формулировка «если они позволяют определить объект» — условная в тексте источника, но это не даёт данному документу права трактовать любое конкретное поле как безопасное по умолчанию. Пока метод и порог re-identification risk не утверждены (§7, §14 пункт 4), **любое** спорное поле или комбинация полей — fail closed: не включается ни в один candidate allowlist и не показывается пользователю. Это относится в равной мере к «прямым и косвенным identifiers», к возможности «обойти LeaseMind» (§22.1, тот же запрет буквально) и к внутренним техническим идентификаторам (§5 принцип 17).

---

## 6. Candidate content families — не field allowlist

Ниже — девять candidate families, `DECISION_CANDIDATE_FOR_REVIEW`. **Ни одно конкретное поле, объект или значение не объявляется разрешённым этим документом.** Для каждой family — purpose, prerequisites, forbidden leakage, combination-risk dependency, owner decision.

### 6.1. Categorical compatibility explanation вместо raw value

- **Purpose:** показать пользователю, что критерий совместим/не совместим, без раскрытия исходного числового или текстового значения.
- **Prerequisites:** source-normative прецедент §22.2 (расстояние/зона → «объяснение без раскрытия исходного значения»); сама формулировка explanation не должна давать возможность реконструировать raw value через комбинацию нескольких таких объяснений.
- **Forbidden leakage:** raw value внутри «объяснения»; числовой диапазон, узкий настолько, что фактически эквивалентен raw value.
- **Combination-risk dependency:** несколько одновременных categorical explanations могут в совокупности сузить raw-профиль почти однозначно — combination-risk evidence обязательна перед допуском в production presentation.
- **Owner decision:** `PRODUCT + LEGAL`.

### 6.2. Обязательный критерий как compatibility/verification state без raw values

- **Purpose:** отразить «совместимо / требует проверки» вместо самого значения критерия.
- **Prerequisites:** зависит от того, что `MATCHING_QUALIFICATION_POLICY` сама определит routing/threshold-условия (сейчас `OPEN` в её собственном §6 — Gate-условия §18.1 качественны, численные пороги открыты) — эта family не может быть завершена раньше Qualification Policy.
- **Forbidden leakage:** исходное значение критерия, reason code с raw evidence.
- **Combination-risk dependency:** булев результат по многим критериям одновременно способен реконструировать raw-профиль почти полностью — требуется отдельная combination-risk evidence до допуска family в presentation.
- **Owner decision:** `PRODUCT + LEGAL`, зависимо от `MATCHING_QUALIFICATION_POLICY` approval.

### 6.3. Агрегированный диапазон только при доказанной non-identifiability

- **Purpose:** показать диапазон (например, площади или бюджета) вместо точного значения.
- **Prerequisites:** доказанный cohort/uniqueness метод (не существует ни в одном источнике — §7, §14 пункт 4).
- **Forbidden leakage:** диапазон, узкий до одного объекта; диапазон в сочетании с другими полями, сужающий до одного объекта.
- **Combination-risk dependency:** диапазон без доказанного minimum cohort/uniqueness method не допускается ни при какой ширине — family не может считаться безопасной без такого доказательства.
- **Owner decision:** `PRODUCT + LEGAL`, `OPEN` до re-identification method.

### 6.4. Negotiation gap без раскрытия точного значения второй стороны

- **Purpose:** показать направление и общий характер переговорного разрыва (§12.3 Architecture — переговорные критерии) без точного значения оппонента.
- **Prerequisites:** класс «переговорные критерии» уже существует (`SOURCE_NORMATIVE`, §12.3); формула gap-описания не задана ни одним источником.
- **Forbidden leakage:** точное значение второй стороны; величина gap, из которой точное значение однозначно выводится.
- **Combination-risk dependency:** повторные gap-presentations (направление плюс величина разрыва при многократном показе) способны сузить диапазон значения второй стороны.
- **Owner decision:** `PRODUCT + LEGAL`.

### 6.5. Unknown/conflicting/stale marker

- **Purpose:** показать, что данные неизвестны/противоречивы/устарели, без утаивания и без overclaim.
- **Prerequisites:** канонические статусы уже `SOURCE_NORMATIVE` (§12.4, §13, §32); conflicting-criticality качественно определена `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-037 v1.0` (`MATCHING_QUALIFICATION_POLICY`); STALE-ортогональность и non-actionable historical result качественно заданы `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-038 v1.0` — эта family описывает только их user-facing представление, не изобретает новый статус и не ослабляет ни одну из этих границ.
- **Forbidden leakage:** raw evidence, лежащий в основе статуса; конкретная причина конфликта, если она сама по себе идентифицирует источник/сторону; представление stale/historical Qualification result как текущего actionable вывода (запрещено `XFR-D-038`, `XFR-D-044`).
- **Combination-risk dependency:** статус сам по себе не является значением, но паттерн unknown/conflicting/stale статусов по многим полям потенциально коррелирует со специфическим профилем и не исключается автоматически.
- **Owner decision:** `PRODUCT` (UX-формулировка), без нового legal-риска при соблюдении §12.4/§32 без ослабления.

### 6.6. Bounded Confidence/Risk explanation без raw evidence/юридического вывода

- **Purpose:** показать, что вывод требует проверки (низкая уверенность) или связан с риском, без цифр и без юридической квалификации.
- **Prerequisites:** `SOURCE_NORMATIVE` §16 («Высокий Match Score при низком Confidence Score… не может быть представлен как готовый Квалифицированный вариант») и §17 (Risk Score «не является доказательством нарушения»); точный wording/mapping — `OPEN`, зависит от `MATCHING_RISK_POLICY` открытого решения №1 (runtime representation Risk output).
- **Forbidden leakage:** численное значение Confidence/Risk Score; raw evidence; формулировка, эквивалентная юридическому выводу (например, слова, подразумевающие подтверждённое нарушение).
- **Combination-risk dependency:** отсутствие числового значения не устраняет overclaim — формулировки, звучащие как утверждение факта, могут создать ложное впечатление подтверждённости.
- **Owner decision:** `PRODUCT + LEGAL`, совместно с owner runtime representation Risk Policy.

### 6.7. Coarse object category только после combination-risk evidence

- **Purpose:** показать тип/категорию объекта на уровне, не позволяющем идентификацию.
- **Prerequisites:** существование закрытого `property_type` enum (`SOURCE_NORMATIVE` факт для `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`, §6.1) — но его достаточность и переиспользование именно как Safe Presentation registry остаются `OPEN` (§7, §14 пункт 2).
- **Forbidden leakage:** редкая категория в сочетании с narrow attributes (площадь/ставка/дата/инженерный признак) — см. §7.
- **Combination-risk dependency:** пересечение coarse category с другими одновременно показанными признаками может однозначно сузить candidate pool; combination-risk evidence обязательна до допуска конкретной категории.
- **Owner decision:** `PRODUCT + LEGAL`.

### 6.8. Safe next verification/action

- **Purpose:** показать рекомендуемое следующее действие (например, «требуется подтверждение») без раскрытия protected data.
- **Prerequisites:** согласуется с §12.4 («может заблокировать Qualification Gate», «порождает запрос проверки») — этой family не нужно новое source-основание, только формулировка.
- **Forbidden leakage:** protected data внутри текста действия; косвенное указание на конкретный объект/сторону.
- **Combination-risk dependency:** generic (родовая) формулировка действия сама по себе не идентифицирует объект, но может утечь через сочетание с другими одновременно показанными признаками.
- **Owner decision:** `PRODUCT`.

### 6.9. Локализованный текст только из будущего approved machine-readable reason/explanation catalog

- **Purpose:** обеспечить локализованный пользовательский текст, не являющийся свободным текстом.
- **Prerequisites:** требует catalog reason/explanation references, которого не существует ни в одном источнике (Qualification Policy открытое решение №12, Risk Policy открытое решение №7 — оба `OPEN`).
- **Forbidden leakage:** свободный текст в любой форме; raw evidence внутри локализованной строки. **Source vs candidate scope:** Architecture §22.1 напрямую запрещает только «уникальное фото, документ или описание, **позволяющее найти объект**» — узкий условный запрет, не абсолютный запрет любого свободного текста. `§7.5 Feature Schema` — precedent sibling Proposal, не source. `§48 Data Contracts DLP` — контроль другого канала (event/outbox payload, §12), не готовое покрытие presentation output. Полный запрет свободного текста для этой family — консервативное `DECISION_CANDIDATE_FOR_REVIEW` расширение узкой §22.1-нормы на presentation-канал, а не уже установленная source-normative норма.
- **Combination-risk dependency:** уникальная локализованная формулировка или свободный текст может стать searchable identifier во внешних источниках (см. §7).
- **Owner decision:** совместно с будущим owner Qualification/Risk reason-namespace, `OPEN`.

**Presentation-risk classification.** Ни одна family §6.1–§6.9 не помечается `LOW`/`MEDIUM`/`HIGH`, «низкий/средний/высокий» или иным ordinal-эквивалентом — ни как формальный enum, ни как qualitative registry, ни как прозаический ярлык внутри структурного поля `Combination-risk dependency`. Каждая family вместо этого описывает конкретный механизм утечки, реконструкции, корреляции, overclaim или повторного раскрытия (см. соответствующие поля `Combination-risk dependency` §6.1–§6.9). Formal method/threshold для измерения combination-risk не введены ни одним источником и остаются `OPEN` (§7, §14).

---

## 7. Object-type matrix design — только форма

Форма будущей per-object-type/category allowlist/denylist matrix, `DECISION_CANDIDATE_FOR_REVIEW`, без заполненных значений:

| source object-type/category | candidate field/derived fact | transformation/generalization | combination set | uniqueness/cohort evidence | intended user purpose | data classification/lawful-basis reference | source/freshness version | PRODUCT decision | LEGAL decision | policy version/hash |
|---|---|---|---|---|---|---|---|---|---|---|

Существование закрытого `property_type` enum в `CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.1 (`retail_unit / office / warehouse / light_industrial / free_purpose / standalone_building / land / other`) — `SOURCE_NORMATIVE` факт **для того документа**. **Его достаточность и переиспользование как Safe Presentation object-type registry остаются `OPEN_BLOCKED_PENDING_DECISION`** (§14 пункт 2) — этот документ не объявляет эти восемь значений автоматически утверждённым presentation-registry и не изобретает никакой новый object/business category сверх уже существующих в других источниках.

`business_category` enum (демографически симметричная защита идентичности арендатора по тому же §22.1 «ФИО или наименование второй стороны») существует как отдельный enum в том же источнике, но ни один источник не подтверждает, что для него нужна отдельная per-category presentation-matrix — это тоже `OPEN`, не решается здесь.

---

## 8. Re-identification и combination-risk model — concept-level, без чисел

Девять adversarial-сценариев, все `DECISION_CANDIDATE_FOR_REVIEW`. Ни один numeric threshold (k-anonymity, cohort size, rarity, geographic radius, disclosure budget, score/risk) не вводится.

| № | Сценарий | Concept-level control | Required evidence |
|---|---|---|---|
| 1 | Coarse-поля образуют уникальную комбинацию | Совместная (joint) combination-risk review полного набора полей одновременно, не поле-за-полем | Joint re-identification evidence, не отдельная per-field |
| 2 | Редкая категория + narrow commercial/physical/timing attributes | Отдельная review для редких категорий в узких сегментах перед допуском в presentation | Cohort-size measurement (метод не задан ни одним источником) |
| 3 | Geography/travel signal указывает на один объект | Запрет geography/travel-signal field, если candidate pool в текущем инвентаре мал | Denominator (candidate pool size) — не определён ни одним источником |
| 4 | Уникальный текст/фото/reason searchable externally | Полный запрет свободного текста без отдельной safe-classification policy (уже `SOURCE_NORMATIVE`, §7.5 Feature Schema, §48 Data Contracts) | Searchability probe против внешних источников |
| 5 | Successive disclosures позволяют собрать профиль | Disclosure budget concept per Campaign/recipient (не задан ни одним источником) | Session/temporal aggregation analysis |
| 6 | Cross-Campaign/multi-user collusion | Cross-campaign correlation guard concept | Collusion-scenario adversarial dataset |
| 7 | Rank/candidate count раскрывает supply/demand | Явное исключение позиции/количества кандидатов из любой candidate family §6 | Explicit exclusion, а не отдельная allowlist-проверка |
| 8 | Localization/free text содержит скрытый identifier | Presentation-specific DLP profile, отдельный от event-level DLP (§9) | Negative test набор, специфичный для presentation output |
| 9 | Cache/preload/log/telemetry/API раскрывает то, что UI не показывает | Уже `SOURCE_NORMATIVE`, §22.1 буквально: «защищенные значения в API, аналитике, уведомлении, журнале ошибки или предварительно загруженных данных» — этому Proposal остаётся только распространить формулировку на конкретные presentation-специфичные каналы | Negative test аналогичный существующим DLP-пробам, но для presentation artifacts отдельно |

Ни один метод/threshold из перечисленных не выбран — все остаются `OPEN_BLOCKED_PENDING_DECISION` (§14 пункты 3–6, 9, 11).

---

## 9. Presentation artifact concept — не runtime schema

`DECISION_CANDIDATE_FOR_REVIEW`, concept-level future evidence bundle, без проектирования DB/API/event/JSON schema:

- policy version/hash самого `SAFE_PRESENTATION_POLICY`;
- Match/Profile/Qualification source versions, на которых построено конкретное представление;
- exact derived fields/transformations, реально использованные в конкретном выданном представлении (не общий каталог — снимок фактически применённого набора);
- audience/purpose binding — конкретный `party_id`-получатель, не любой аутентифицированный пользователь;
- `generated-at`/`valid-until`;
- combination-risk assessment reference — ссылка на решение/evidence, не raw risk score;
- DLP/minimization result reference;
- immutable audit/replay reference — по аналогии с §33 Architecture (audit bundle обязателен «для любого расчета Matching Engine»; presentation output производен от Match Result, поэтому по аналогии наследует то же требование, не по прямой цитате, так как §33 не называет presentation-уровень явно);
- invalidation/revocation reference.

Presentation artifact не должен обслуживаться, если underlying Qualification result помечен historical/non-actionable по `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-038 v1.0` — согласовано с read-only consumption boundary `XFR-D-044 v1.0` (§11.3).

**Это не утверждённая JSON schema, DTO, таблица, event или API.** Exact carrier и exact cache/TTL/invalidation runtime mechanics — `OPEN_BLOCKED_PENDING_DECISION` (§12, §14 пункт 12).

---

## 10. Gate boundaries

`SOURCE_NORMATIVE`, без ослабления:

- **§18.2 Presentation Readiness Gate — «координирует AI Manager».** Источник не называет его дословно «внешним» — в отличие от §18.3 («внешний»), §18.5 («внешний»), §18.6 («внешний»), §18.7 («внешний»); §18.4 отдельно помечен «внешний с AI-поддержкой». Это семантическое различие сохраняется без искажения: Presentation Readiness Gate структурно отделён от Matching Qualification Gate тем, что источник называет его «ответственностью» AI Manager по координации, а не отдельным полностью внешним сервисом, но остаётся отдельным, отличным от `SAFE_PRESENTATION_POLICY` gate-механизмом.
- **Matching Engine не показывает вариант пользователю самостоятельно.** Дословно §18.2: «Matching Engine передает данные для проверки, но не открывает вариант пользователю самостоятельно.»
- **Успешная Presentation Readiness не заменяет последующие gates.** Дословно §36 (вводная строка раздела «Четыре независимых gate», распространяется тем же принципом на Match-level gates §18.х): «Gate применяются последовательно и не подменяют друг друга. Успех раннего gate не разрешает действия более позднего.»
- **User acceptance safe presentation не разрешает Reveal.** Reveal требует отдельно `ADVANCE_SETTLED_AND_FISCALIZED`, `SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED`, `NO_PREVIOUS_CONTACT_CONFIRMED`, актуальный Participation Acceptance Record и `PRE_REVEAL_LOCKED → REVEAL_COMMITTED` (§18.7) — ни одно из этих условий не выполняется фактом показа или принятия Safe Presentation пользователем.
- **Один активный раскрытый вариант не прекращает внутренний поиск/скоринг.** Дословно §22.4: «Пока по текущему варианту не зафиксировано решение, следующий вариант не может перейти к раскрытию. Это ограничение влияет на Presentation Readiness, но не прекращает внутренний поиск и скоринг других гипотез.»
- **AI Manager coordination не даёт права обходить source owners.** Согласовано с §40 (нормативная матрица writers): AI Manager хранит только versioned projections внешних фактов и «не означает владение внешними юридическими, финансовыми или доказательственными фактами» (§40, дословно, в контексте координации Кампании в целом — применяется тем же принципом к координации Presentation Readiness).

---

## 11. Scoring/Qualification/Risk/Confidence boundary

### 11.1. `SOURCE_NORMATIVE` — прямо и корректно выводимо из Architecture

- **Высокий score не делает presentation безопасным.** Прямое следствие раздельности показателей (§5 принцип 9: «Match Score, Confidence Score и Risk Score являются разными показателями») и §16 (Confidence — не про data-minimization, а про надёжность оценки).
- **Unknown/conflicting/stale/low-confidence/risk должны подаваться без overclaim.** Согласовано с §12.4, §13, §16, §32 — статус показывается как есть, не усиливается и не ослабляется.

### 11.2. Self-scope / `DECISION_CANDIDATE_FOR_REVIEW` / precedent-dependent — не прямая цитата Architecture

- **Safe Presentation не меняет score/rank/Qualification routing.** Self-scope statement о собственных границах этого документа, поддержанный precedent'ом sibling Proposals — Risk Policy (`MRP-C-018`: «`SAFE_PRESENTATION_POLICY`… не вычисляет и не владеет Risk calculation») и Scoring Policy (`MSP-C-009`: score не присваивает routing). Merged sibling Proposal не становится source-normative только через merge (§1, §2) — этот документ независимо подтверждает то же ограничение относительно самого себя, не цитируя Architecture напрямую для этого конкретного утверждения.
- **Не устанавливает numeric thresholds.** Self-scope statement, проверяемое по самому документу, не по прямой Architecture-цитате: ни один mutual-fit/Confidence/completeness/Risk/presentation threshold этим документом не вводится (§6, §14).
- **Exact wording/mapping остаются PRODUCT + LEGAL decision и зависят от соответствующих policies.** Precedent-dependent: точная формулировка Confidence/Risk explanation (family §6.6) зависит от `MATCHING_RISK_POLICY` открытого решения №1 (runtime representation); обязательный критерий как compatibility state (family §6.2) зависит от `MATCHING_QUALIFICATION_POLICY`. Оба — sibling Proposals, не Architecture.
- **Reason text не содержит raw evidence/свободного текста.** Precedent-dependent: согласовано с family §6.9 (§6.9 сама классифицирует полный запрет свободного текста как `DECISION_CANDIDATE_FOR_REVIEW`, не source-normative — см. §6.9) и с precedent'ом `§7.5 Feature Schema` — sibling Proposal, не Architecture.

Практические ограничительные границы обеих групп сохраняются одинаково: документ по-прежнему не меняет score/rank/routing, не вводит thresholds и не разрешает raw evidence — различие только в normative-статусе обоснования, не в самом ограничении.

### 11.3. `RESOLVED_QUALITATIVE_BOUNDARY` — human-approved consumption overlay, `XFR-D-044 v1.0`

Отдельная, пятая категория normative-дисциплины (см. `MATCHING_QUALIFICATION_POLICY §1`) — human-approved governance decision, не буквальный текст Architecture и не approval этого Proposal:

- Safe Presentation — **read-only policy consumer** утверждённого Qualification result, freshness/actionability context и только approved safe reason references;
- может локализовать, обобщать, редактировать либо полностью скрывать представление;
- **не может** пересчитать, повысить, понизить или заменить Qualification result; не может менять score, rank, Confidence или Risk; не получает права раскрывать raw evidence или candidate details вне approved presentation allowlist;
- `QUALIFIED_HYPOTHESIS` лишь допускает переход к отдельной Presentation Readiness проверке (§18.2 Architecture, «координирует AI Manager») — это не автоматическое раскрытие;
- `NEEDS_VERIFICATION`, `HUMAN_REVIEW_REQUIRED` и `REJECTED_BY_MATCHING` могут быть представлены только безопасным общим статусом или следующим действием, без candidate details и raw evidence;
- `STALE` блокирует использование ранее созданного presentation до актуального пересчёта (согласовано с `XFR-D-038`, §6.5, §9);
- если presentation safety запрещает показ, underlying Qualification result не изменяется.

**Что остаётся `OPEN`.** Exact wording, per-object field/object allowlist, audience/purpose payload и reason catalog — отдельные решения `PRODUCT + LEGAL`, не resolved этим overlay (§15 decision row №8). `XFR-D-044` не заявляет и не подразумевает document-level `BLOCKED` статус для Presentation Readiness Gate (§18.2) — этот gate остаётся отдельной, «координирует AI Manager» проверкой, не приравненной к governance gates (§10, `SPP-C-012`).

---

## 12. DLP и channel coverage

Разведены три отдельных факта:

1. **Существующий Data Contracts DLP** (`DLP_EVENT_CONTENT_V1`, §48 Architecture) покрывает direct identifiers/forbidden content — телефон, email, паспортные/банковские реквизиты, запрещённые ключи — применительно к event/outbox payload, `trace_id` и producer metadata. Это `SOURCE_NORMATIVE` факт про существующий контур, не про presentation-контур.
2. **Отсутствие доказательства безопасности quasi-identifier combinations.** Прохождение direct-identifier DLP **не доказывает** безопасность комбинаций квазиидентификаторов (§8 этого документа). Это разные классы риска, и существующий DLP не был спроектирован для второго класса.
3. **Presentation-specific negative tests не существуют.** Необходимость отдельных negative tests для UI/API/cache/notification/log/telemetry/preload-каналов конкретно safe-presentation output — `DECISION_CANDIDATE_FOR_REVIEW` (§13).

**Существующий DLP автоматически не покрывает новый output channel.** Presentation output — отдельный канал от event bus/outbox, и этот документ не заявляет и не подразумевает, что покрытие §48 автоматически распространяется на него.

---

## 13. Data Contracts gap

Независимая проверка `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (repo-wide поиск по `presentation|Presentation|PRESENTATION|safe_|minimiz|allowlist|denylist|disclos|manifest_field|field_allowlist`, отдельно `GateState`) подтверждает: safe-presentation schema/carrier, field allowlist/version/hash, presentation artifact ID, combination-risk decision evidence storage, DLP/result audit references для presentation output, consumer/audience binding и cache/expiry/revocation contract — **ни один из них в v1.0 не найден**. Единственные совпадения `allowlist` относятся к Reveal token context allowlist (§43 доверительная граница) и DLP forbidden-key allowlist (§48) — оба структурно не связаны с user-facing safe description. `GateState` (`NOT_EVALUATED/BLOCKED/READY/INVALIDATED`) объявлен ровно один раз (§2.2) и не используется нигде в остальном документе; он не является и не становится Safe Presentation carrier.

**Осторожная формулировка.** Declared minimum scope `MATCHING_DATA_CONTRACTS_v1.0.md` (`SOURCE_NORMATIVE`, §1 документа: «минимальный исполнимый контракт критической цепочки Matching → Payer Resolution → Participation → Payment/Fiscal → Reveal Gate Snapshot → Introduction Record → Reveal Evidence → Dispute») **не включает** safe-presentation carrier — это текущий, наблюдаемый gap. Это **не доказывает**, что Safe Presentation структурно исключён навсегда, и **не снимает** необходимость будущего Data Contracts extension после утверждения этой policy. Endpoint/event/table/schema этим документом не проектируются.

---

## 14. Evaluation and approval evidence

Обязательные будущие проверки перед утверждением любого allowlist, `DECISION_CANDIDATE_FOR_REVIEW`, ни одна не заявляется уже выполненной:

- direct identifier tests;
- composite/quasi-identifier tests;
- rare combination/searchability probes;
- successive disclosure/collusion tests;
- free text/photo/document/geography negative cases;
- cache/log/notification/API/telemetry leakage tests;
- object-type-specific review;
- PRODUCT usefulness review;
- LEGAL/Data Governance review — согласовано по аналогии с §8.4 Architecture (требование «разрешения Data Governance до использования в обучении» для de-identification; presentation — не training, поэтому это аналогия, не прямая цитата);
- replay/invalidation tests;
- synthetic-only evidence limitations — согласовано по аналогии с уже принятым во всех sibling-документах правилом (`MRP-C-013` Risk Policy, `MQP-C-019` Qualification Policy, `MSP-C-019`/§10 Scoring Policy: «synthetic evaluation ≠ production readiness evidence»), применимо здесь как `DECISION_CANDIDATE_FOR_REVIEW`, не как установленная источником Safe-Presentation-специфичная норма.

**Existing Evaluation Plan не содержит готовой metric family под эту задачу.** `MATCHING_EVALUATION_PLAN_v0.1.md` §6.5 («Safety/data-leakage/DLP») покрывает только прямые идентификаторы/точный адрес/свободный текст — не комбинаторный re-identification risk quasi-identifiers. Это пробел, а не готовое покрытие; этот документ не заявляет обратного.

---

## 15. Open decisions

Ни одно решение не выбрано этим документом. Owner самого артефакта и решения №6 — `PRODUCT + LEGAL` (Architecture §37/§52, `SOURCE_NORMATIVE`); `Chief AI Architect` к source-owner артефакта или вопроса №6 не добавляется. Технические/candidate решения помечены явным `candidate`; filenames не используются как owner нигде в перечне.

| № | Вопрос | Owner | Источник-основание |
|---|---|---|---|
| 1 | Exact per-object-type allowlist (какие конкретно поля/трансформации допустимы для каждого object-type) | `PRODUCT + LEGAL` | `SOURCE_NORMATIVE` — Architecture §37 №6 дословно |
| 2 | Presentation object-type registry/reuse (переиспользовать `property_type` §6.1 CTA или создать отдельный) | `PRODUCT + LEGAL` | Candidate — `property_type` уже существует, но источник не подтверждает его достаточность именно для presentation-целей (§7) |
| 3 | Geographic generalization (уровень огрубления геопризнаков) | `PRODUCT + LEGAL` | Candidate, эхо Feature Schema открытого решения №7 |
| 4 | Cohort/uniqueness/re-identification method и thresholds | `PRODUCT + LEGAL` (+ `DEVELOPMENT` для измеримости, candidate) | Candidate, эхо Feature Schema №7, Evaluation Plan №9, Risk Policy №10 — три независимых sibling-документа уже указывают тот же owner для смежных вопросов |
| 5 | Combination-risk algorithm | `PRODUCT + LEGAL` (+ `AI`, candidate) | Candidate, источник не называет прямо |
| 6 | Successive disclosure budget | `PRODUCT + LEGAL` | Candidate, не покрыт ни одним источником |
| 7 | Safe reason/explanation catalog | `PRODUCT + LEGAL` — candidate assignment, с координацией/зависимостью от будущих owner'ов Qualification/Risk reason-namespace (Qualification Policy №12 / Risk Policy №7 — оба `OPEN`) | Candidate |
| 8 | Score/confidence/risk/Qualification presentation mapping (exact wording) | `PRODUCT + LEGAL` | Consumption/immutability boundary — `RESOLVED_QUALITATIVE_BOUNDARY`, `XFR-D-044 v1.0` (Safe Presentation не пересчитывает/не заменяет routing result, score, rank, Confidence, Risk; §11.3). Exact wording/presentation mapping формулировка остаётся `OPEN_BLOCKED_PENDING_DECISION`, эхо Risk Policy открытого решения №1 |
| 9 | Localization governance | `PRODUCT` | Candidate |
| 10 | Audience/purpose model (конкретный получатель presentation payload) | `PRODUCT + LEGAL` | Candidate, по аналогии с purpose-binding принципом §11 Architecture |
| 11 | Cache/expiry/revocation | `DEVELOPMENT + AI` (candidate) | Candidate |
| 12 | Runtime carrier/Data Contracts extension | `DEVELOPMENT + Chief AI Architect` (candidate) | Candidate; подтверждено отсутствие в Data Contracts v1.0 (§12) |
| 13 | Test dataset/evidence | `AI + DEVELOPMENT` (candidate/inherited context через `MATCHING_EVALUATION_PLAN`) | Candidate — Evaluation Plan уже owner процедуры вообще, но не имеет готовой metric family под этот случай (§14) |
| 14 | Approval/change-control process для самого артефакта `SAFE_PRESENTATION_POLICY` | `PRODUCT + LEGAL` (+ `Chief AI Architect` координация, candidate) | Candidate |

Architecture §37 вопрос №6 **не закрывается** ни одной строкой этого перечня — он остаётся полностью `OPEN`.

---

## 16. Readiness matrix и acceptance criteria

### 16.1. Readiness matrix

| Стадия | Статус |
|---|---|
| Safe Presentation Policy proposal reviewed | Cross-functional review этого документа — не завершено |
| Field allowlist approved | `OPEN` — Architecture §37 №6 |
| Object-type registry decided | `OPEN` (§14 пункт 2) |
| Re-identification method/threshold approved | `OPEN` (§14 пункт 4) |
| Evaluation evidence collected | Отдельная стадия, не завершена этим документом |
| Exact Safe Presentation Policy approved | Отдельное cross-functional решение, не этот Proposal |
| Data Contracts extension | Не спроектирован (§12) |
| `IMPLEMENTATION_READINESS_GATE` | **`BLOCKED`** |
| `SYNTHETIC_ACCEPTANCE_GATE` | **`BLOCKED`** |
| `PRODUCTION_LAUNCH_GATE` | **`BLOCKED`** |

### 16.2. Acceptance criteria (`SPP-C-001`–`SPP-C-024`)

#### `SPP-C-001` — три объекта разведены
**Given** Match Package, Safe Presentation и protected Reveal package. **When** сравниваются их владелец, аудитория и состав. **Then** все три остаются структурно разными объектами (§4); ни один документ не сливает их в один.

#### `SPP-C-002` — Match Package не передаётся пользователю как есть
**Given** сформированный Match Package (§23). **When** формируется user-facing представление. **Then** пользователю не передаются внутренние технические идентификаторы и полный состав Match Package (§5 принцип 17, §4).

#### `SPP-C-003` — все deny-категории §22.1 соблюдены без ослабления
**Given** любое предлагаемое user-facing поле. **When** оно проверяется против §22.1. **Then** ни одна из восьми запрещённых категорий (точный адрес, координаты, идентифицирующая география, ФИО/наименование, контакты, уникальное фото/документ/описание, high-risk комбинация, protected values в API/аналитике/уведомлении/логе/preload) не появляется в представлении (§5).

#### `SPP-C-004` — условные запреты не становятся разрешениями
**Given** поле, чья опасность условна («если позволяет определить объект»). **When** re-identification method/threshold не утверждены. **Then** поле остаётся fail-closed и не включается ни в один candidate allowlist (§5).

#### `SPP-C-005` — combination risk не сводится к per-field оценке
**Given** несколько полей, каждое по отдельности coarse. **When** формируется presentation. **Then** оценивается совместный (joint) риск комбинации, а не отдельно каждое поле (§6.1, §8 сценарий 1).

#### `SPP-C-006` — нет утверждённого field allowlist
**Given** любой раздел документа. **When** запрашивается конкретное разрешённое поле. **Then** ни одно конкретное поле не объявлено разрешённым; все candidate families (§6) остаются `DECISION_CANDIDATE_FOR_REVIEW`.

#### `SPP-C-007` — property_type reuse остаётся OPEN
**Given** закрытый enum `property_type` (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §6.1). **When** запрашивается его статус как Safe Presentation registry. **Then** его достаточность и переиспользование — `OPEN_BLOCKED_PENDING_DECISION` (§7, §14 пункт 2), не объявлены утверждёнными automatically.

#### `SPP-C-008` — нет качественного/численного risk registry
**Given** любая candidate family §6.1–§6.9 и её поле `Combination-risk dependency`. **When** проверяется формат. **Then** ни одна family не получает ordinal label (`LOW/MEDIUM/HIGH`, «низкий/средний/высокий», «средний-высокий» или эквивалент) ни в каком поле; combination risk описан только через конкретный механизм утечки/реконструкции/корреляции/overclaim/повторного раскрытия; formal method/threshold для его измерения — `OPEN` (§6, §7, §8).

#### `SPP-C-009` — нет свободного текста/raw evidence в reason/explanation
**Given** любая candidate family с текстовым выводом (§6.5, §6.6, §6.9). **When** проверяется её содержимое. **Then** raw evidence отсутствует во всех случаях; полный запрет свободного текста для family §6.9 — `DECISION_CANDIDATE_FOR_REVIEW` policy rule (консервативное расширение узкого §22.1-запрета «уникальное описание, позволяющее найти объект», не source-normative абсолютная норма), действующее до появления будущего approved machine-readable reason/explanation catalog; ни catalog, ни namespace этим документом не создаются (§6.9).

#### `SPP-C-010` — DLP direct-identifier coverage ≠ quasi-identifier safety
**Given** существующий `DLP_EVENT_CONTENT_V1` (§48 Architecture). **When** оценивается его применимость к combination/quasi-identifier risk presentation-контура. **Then** прохождение direct-identifier DLP не доказывает безопасность комбинаций квазиидентификаторов (§8, §12).

#### `SPP-C-011` — нет runtime carrier/schema/API/event/table
**Given** любой раздел документа. **When** проверяется наличие проектирования DB/API/event/table/JSON schema для presentation. **Then** ни один не введён; exact carrier — `OPEN` (§9, §12).

#### `SPP-C-012` — §18.2 label точен
**Given** упоминание Presentation Readiness Gate. **When** цитируется его заголовок. **Then** используется «координирует AI Manager», не дословно «внешний» (§10).

#### `SPP-C-013` — Matching Engine не открывает вариант пользователю самостоятельно
**Given** сформированный Квалифицированный вариант. **When** рассматривается его показ пользователю. **Then** Matching Engine передаёт данные для проверки, но не открывает вариант самостоятельно (§18.2, §10).

#### `SPP-C-014` — успешная Presentation Readiness не заменяет downstream gates
**Given** пройденный Presentation Readiness Gate. **When** оценивается допуск к Participation/Previous Contact/Payment/Introduction Record/Reveal. **Then** ни один из них не проходит автоматически (§10, §36).

#### `SPP-C-015` — user acceptance safe presentation не разрешает Reveal
**Given** пользователь принял безопасное представление варианта. **When** оценивается статус Reveal Gate. **Then** Reveal остаётся заблокирован до прохождения всех обязательных условий §18.7 (§4, §10).

#### `SPP-C-016` — один раскрытый вариант не прекращает внутренний поиск
**Given** активный `active_revealed_match_id`. **When** рассматривается работа Matching Engine по другим гипотезам. **Then** внутренний поиск и скоринг других гипотез продолжается; ограничение действует только на Presentation Readiness (§10, §22.4).

#### `SPP-C-017` — AI Manager coordination не обходит source owners
**Given** AI Manager координирует Presentation Readiness. **When** рассматривается доступ к protected data source owners (Identity/Authority Registry, Lawful Basis/Consent Registry и т.д.). **Then** AI Manager не получает прав раскрывать protected data в обход этих source owners (§10, §40).

#### `SPP-C-018` — высокий score не делает presentation безопасным; routing не меняется
**Given** высокий Match/Confidence/Risk Score. **When** формируется Safe Presentation. **Then** это не влияет на допустимость поля в presentation; сам документ не меняет score/rank/Qualification routing — подтверждено `RESOLVED_QUALITATIVE_BOUNDARY` `XFR-D-044` (read-only consumption, не пересчитывает/не заменяет routing result) (§11.3).

#### `SPP-C-019` — unknown/conflicting/stale/low-confidence/risk без overclaim
**Given** соответствующий статус или показатель. **When** формируется его user-facing представление. **Then** статус показан без усиления и без ослабления; conflicting-criticality (`XFR-D-037`) и STALE non-actionable orthogonality (`XFR-D-038`) качественно заданы и не ослабляются; exact wording/mapping — `OPEN`, зависит от Risk Policy открытого решения №1 и Safe Presentation decision row №8 (§6.5, §6.6, §11.3).

#### `SPP-C-020` — invalidation/cache fail closed; qualitative block approved, mechanics open
**Given** source/policy/freshness изменились после генерации presentation, либо underlying Qualification result помечен historical/non-actionable (`XFR-D-038`). **When** запрашивается уже сгенерированное представление. **Then** stale presentation не должен обслуживаться из кеша без ревалидации — качественный запрет подтверждён `RESOLVED_QUALITATIVE_BOUNDARY` (`XFR-D-038`, `XFR-D-044`); exact cache/TTL/invalidation runtime mechanics остаются `OPEN_BLOCKED_PENDING_DECISION` (§9).

#### `SPP-C-021` — Architecture §37 №6 остаётся OPEN
**Given** документ существует на уровне draft со статусом `Proposal for cross-functional review — does not authorize implementation` (не `APPROVED`). **When** запрашивается статус вопроса №6. **Then** он явно `OPEN`, decision owner `PRODUCT + LEGAL`.

#### `SPP-C-022` — три gates BLOCKED
**Given** тот же контекст. **When** оценивается статус трёх gates. **Then** `IMPLEMENTATION_READINESS_GATE`/`SYNTHETIC_ACCEPTANCE_GATE`/`PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

#### `SPP-C-023` — нет implementation/runtime/API/schema authorization; Proposal не назван утверждённым
**Given** любое упоминание статуса документа. **When** проверяется формулировка. **Then** нигде не используется «утверждён»/«approved» применительно к самому Proposal, кроме явного отрицания; implementation/runtime/API/schema changes не разрешены нигде в документе.

#### `SPP-C-024` — Data Contracts absence — текущий gap, не permanent exclusion
**Given** подтверждённое отсутствие safe-presentation carrier в `MATCHING_DATA_CONTRACTS_v1.0.md`. **When** формулируется вывод. **Then** это текущий, наблюдаемый gap declared minimum scope v1.0, не доказательство постоянного структурного исключения; будущий extension не исключается (§12, §13).

---

## 17. Definition of Done и последствия

Настоящий документ:

- пригоден только для cross-functional review (`PRODUCT + LEGAL`, с technical/coordination участием Chief AI Architect/AI/DEVELOPMENT как candidate-ролей, не owners);
- не утверждает ни один field allowlist, object-type registry, качественный/численный risk enum, threshold, локализованный UI-текст, legal basis или reason namespace;
- не закрывает Architecture §37 вопрос №6 — остаётся `OPEN`;
- не обновляет и не требует обновления Controlled Artifact Manifest (Architecture §52.1) — запись `SAFE_PRESENTATION_POLICY` не добавляется до реального утверждения;
- не переводит `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE` в иной статус — все три `BLOCKED`;
- не запускает implementation, model release, реальные данные, Reveal или production launch;
- не создаёт runtime/API/schema/event/table/error catalog;
- не изменяет ни один существующий файл, включая Architecture, Data Contracts, Feature Schema, Scoring Policy, Qualification Policy, Risk Policy, Evaluation Plan, `CAMPAIGN_TECHNICAL_ASSIGNMENT.md`, controlled-set artifacts, reviews, `apps/**`, migrations, OpenAPI/AsyncAPI, package-файлы, любой PR.
