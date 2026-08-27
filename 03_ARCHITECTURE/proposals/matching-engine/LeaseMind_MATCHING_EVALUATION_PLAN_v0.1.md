# LeaseMind — MATCHING_EVALUATION_PLAN v0.1

**Версия:** 0.1
**Дата:** 2026-08-22
**Статус:** Proposal for cross-functional review
**Владельцы:** AI + DEVELOPMENT
**Координатор:** Chief AI Architect
**Review required:** PRODUCT + LEGAL для затрагиваемых label, segment, fairness, privacy и policy-boundary решений

**This proposal does not authorize implementation, model release, synthetic acceptance, production use, production data, real personal data, automated policy promotion, or launch.**

Документ не закрывает вопрос №10 `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` §37 и не переводит ни один gate в `READY`.

Human-approved governance decisions `LeaseMind_MATCHING_DECISION_XFR-D-058_v1.1.md` (fail-closed boundary + exact human adjudication governance procedure, supersedes v1.0), `LeaseMind_MATCHING_DECISION_XFR-D-059_v1.1.md` (conservative connected-component grouping/split-isolation policy, supersedes v1.0) и `LeaseMind_MATCHING_DECISION_XFR-D-069_v1.0.md` (qualitative `unknown`/`abstention` terminology boundary) обязательны для соответствующих граней ниже (§4, §5.5, §6.4, §11, `MEP-C-002`, `MEP-C-005`, `MEP-C-010`, `MEP-C-011`). Их approval не переводит этот Proposal в `APPROVED`, не утверждает dataset, split ratios/seed, runtime graph/manifest carrier или production use и не вводит runtime enum, routing mapping или численные triggers.

**Связанные документы:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`, `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (только контрактные/версионные/replay-границы), `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` (Proposal-зависимость, не утверждённый runtime contract), `LeaseMind_MATCHING_DECISION_XFR-D-057_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-058_v1.1.md` (supersedes `XFR-D-058 v1.0`), `LeaseMind_MATCHING_DECISION_XFR-D-059_v1.1.md` (supersedes `XFR-D-059 v1.0`), `LeaseMind_MATCHING_DECISION_XFR-D-067_v1.0.md`, `LeaseMind_MATCHING_DECISION_XFR-D-069_v1.0.md`, `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md`, `02_PRODUCT/ANALYSIS_SNAPSHOT.md`, `02_PRODUCT/CAMPAIGN_OUTCOMES.md`, `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md`.

**Нормативная дисциплина.** Каждое существенное утверждение этого документа помечено одним из четырёх статусов:

- `SOURCE_NORMATIVE` — уже прямо утверждено существующим источником, цитируется или пересказывается без ослабления;
- `DECISION_CANDIDATE_FOR_REVIEW` — предлагается этим proposal как безопасный кандидат, не утверждено;
- `OPEN_BLOCKED_PENDING_DECISION` — источников недостаточно или требуется отдельное решение owner'а;
- `OUT_OF_SCOPE` — принадлежит другому артефакту или gate, не решается здесь.

Кандидатный или открытый статус никогда не выдаётся за действующую норму.

---

## 1. Назначение, scope и non-goals

### 1.1. Назначение

`MATCHING_EVALUATION_PLAN` — будущая воспроизводимая процедура: подготовки dataset, label governance, split/leakage controls, evaluation runs, сбора metric evidence и threshold-search evidence для Matching Engine. `DECISION_CANDIDATE_FOR_REVIEW`.

Документ предлагает процедурный каркас для review вопроса №10 Architecture §37 («Какая размеченная выборка и процедура adjudication используются для pilot baseline?», owner `AI + DEVELOPMENT`, `SOURCE_NORMATIVE` для формулировки вопроса и его owner). `XFR-D-057 v1.0` разрешает qualitative label-evidence eligibility, `XFR-D-058 v1.1` — human adjudication governance procedure, а `XFR-D-059 v1.1` — connected-component grouping/split-isolation policy; сам вопрос №10 целиком остаётся `OPEN`, потому что конкретная размеченная выборка, `XFR-D-060` correction-history inclusion, `XFR-D-062` size/ratios/seed, operational appointments/runtime contract и прочие evidence-plan dependencies не утверждены. Этот документ не назначает dataset и не проводит adjudication.

### 1.2. Явно исключено (non-goals)

- Реализация (код, pipeline, инфраструктура) — `OUT_OF_SCOPE`;
- model training pipeline и выбор модели/провайдера/алгоритма — `OUT_OF_SCOPE`;
- runtime scoring — `OUT_OF_SCOPE`, принадлежит `MATCHING_SCORING_POLICY`;
- policy values (веса, калиброванный Feature Fit, Risk/Qualification thresholds) — `OUT_OF_SCOPE`, принадлежит `MATCHING_SCORING_POLICY`/`MATCHING_RISK_POLICY`/`MATCHING_QUALIFICATION_POLICY`;
- production monitoring/SLO — `OUT_OF_SCOPE`, отдельный operational artifact (Architecture §54);
- Cost Model — `OUT_OF_SCOPE`, `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` §51;
- разрешение на использование реальных данных — `OUT_OF_SCOPE`, требует отдельных PRODUCT/LEGAL/privacy/production gates;
- юридический вывод (legal conclusion) о fairness/дискриминации — `OUT_OF_SCOPE`, LEGAL.

---

## 2. Ownership и boundary matrix

| Артефакт/роль | Владеет | Не владеет |
| --- | --- | --- |
| `MATCHING_EVALUATION_PLAN` (этот документ) | Процедура измерения, evidence package и comparison discipline | Финальные значения весов/порогов; список признаков; runtime scoring; production monitoring/SLO/Cost |
| `MATCHING_FEATURE_SCHEMA` | Кандидаты признаков и их semantics (сам Proposal, не утверждён) | Metric families, dataset/label governance |
| `MATCHING_SCORING_POLICY`/`MATCHING_RISK_POLICY`/`MATCHING_QUALIFICATION_POLICY` | Финальные формулы, значения и routing | Процедуру измерения/сравнения candidate значений — это Evaluation Plan |
| PRODUCT | Смысл outcomes/feedback и продуктовая допустимость их использования | Metric procedure, dataset manifest формат |
| LEGAL | Допустимость данных, labels, segments, proxy/fairness use | Metric procedure как таковую |
| DEVELOPMENT | Воспроизводимость, manifests, tooling/contract feasibility | Смысл labels, продуктовую допустимость outcome |
| Chief AI Architect | Координация review | Единоличная подмена решения PRODUCT/LEGAL |

`SOURCE_NORMATIVE` для строки Evaluation Plan: Architecture §37 (вопрос №10, owner `AI + DEVELOPMENT`) и §52 (manifest-запись `MATCHING_EVALUATION_PLAN`, owner `AI + DEVELOPMENT`, «Model release blocker»).

**Отсутствие циклической зависимости.** Evaluation Plan вправе оценивать versioned **candidate** policy bundles. Утверждённые policy values не являются предусловием написания или прогона proposal-процедуры этого документа: `DECISION_CANDIDATE_FOR_REVIEW`. Результаты evaluation становятся evidence для последующего cross-functional утверждения конкретных policy versions — не заменяют это утверждение и не продвигают его автоматически (§9 ниже).

---

## 3. Dataset taxonomy

Минимум пять строго различаемых категорий. `DECISION_CANDIDATE_FOR_REVIEW` для структуры; синтетический/реальный разрыв — `SOURCE_NORMATIVE` (`CAMPAIGN_OUTCOMES.md` §10, `ANALYSIS_SNAPSHOT.md` §9.8.5).

| Категория | Allowed use | Forbidden inference | Manifest requirement | Owner approval |
| --- | --- | --- | --- | --- |
| 1. Deterministic synthetic contract fixtures | Contract-level regression (по прецеденту `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` §8) | Продуктовое качество ranking/calibration | Fixture set version/hash | DEVELOPMENT |
| 2. Synthetic scenario/evaluation dataset | Baseline измерение metric families §6 на синтетических сценариях | Экстраполяция на production quality или real calibration | Dataset manifest hash, generation method/version | AI + DEVELOPMENT |
| 3. Adversarial/safety dataset | Проверка Hard Constraint safety, DLP, protected-data leakage, robustness | Замена ranking/calibration evaluation | Manifest hash, категории атак/сценариев | AI + DEVELOPMENT |
| 4. Frozen replay/regression corpus | Detection несовместимых версий, determinism regression | Замена свежей evaluation | Frozen snapshot hash, дата заморозки | DEVELOPMENT |
| 5. Real outcome-derived dataset | `OPEN_BLOCKED_PENDING_DECISION` | Любое production-quality заключение до прохождения gates | Требуется отдельный manifest + privacy review | `PRODUCT + LEGAL + Data Governance authority` по `XFR-D-067`; `DEVELOPMENT + SECURITY` проверяют controls |

Категория 5 отдельно заблокирована: authority model `XFR-D-067` требует Data Governance authority, accountable to `LEGAL` и независимую от автора model/dataset; `AI` предоставляет evidence, `DEVELOPMENT + SECURITY` подтверждают controls. Именное назначение/RBAC остаётся operational follow-up. Применимые production/privacy gates — отдельный prerequisite, не owner-роли. `OPEN_BLOCKED_PENDING_DECISION`, не открывается этим документом.

**Запрет экстраполяции.** Нормативно утверждены (`SOURCE_NORMATIVE`) сами ограничения исходных PRODUCT-артефактов — `CAMPAIGN_OUTCOMES.md` `CO-C-019` (synthetic outcome полностью исключён из реальной статистики) и `ANALYSIS_SNAPSHOT.md` `AS-C-019`/`AS-C-025` (synthetic-записи исключены из обучения и продуктовых выводов) — а также границы synthetic-only/gates самого Matching Architecture (§36, §50 `NON_PRODUCTION_SAFETY_PROFILE`). Прямое Matching-специфичное правило «Matching synthetic evaluation нельзя представлять как production-quality/real-calibration evidence» этими источниками буквально не сформулировано для Matching Engine — оно классифицируется как `DECISION_CANDIDATE_FOR_REVIEW`, поддержанный house-style precedent перечисленных PRODUCT-артефактов и синтетическими границами Matching Architecture, а не как уже утверждённая Matching-норма. `MEP-C-001` остаётся acceptance criterion этого proposal-кандидата, не доказательство существующей Matching-нормы.

---

## 4. Evaluation unit и split/leakage controls

### 4.1. Canonical split-isolation unit

`XFR-D-059 v1.1` утверждает `RESOLVED_GROUPING_ISOLATION_BOUNDARY`: `Property`, `TenantRequest`, Campaign, `match_pair_id`, `encounter_id`, source aggregate identity (`source_system` + `aggregate_id`) через его versions/revisions и явные correction/supersedes/causal/confirmed duplicate-replay lineages образуют закрытый набор source-authoritative edge types; revision/version без aggregate identity не создаёт edge. Deterministic transitive closure этих edges образует connected component — атомарную split-isolation unit, которая целиком назначается ровно в один split и не разрезается из-за размера или желаемого ratio.

Connected component не назначается этим решением как metric denominator и не меняет смысл business entities. Raw address, free text, display-name similarity, embeddings или AI/model output не создают canonical edge. Missing, ambiguous или conflicting linkage исключается fail closed без random/heuristic assignment и без negative-label coercion.

### 4.2. Обязательные safety-инварианты

- одна логически связанная сущность/цепочка не оказывается одновременно в tuning и final evaluation — `RESOLVED_GROUPING_ISOLATION_BOUNDARY` по human-approved `XFR-D-059 v1.1`: component membership определяется deterministic transitive closure закрытого source-authoritative edge set; missing/ambiguous candidate исключается до assignment, а cross-split component или недоказанная isolation среди included records приводят к `EVALUATION_RUN_REJECTED` (§11, пункт 3; `MEP-C-002`);
- temporal/version isolation — versions/revisions одного source aggregate и доказанная correction/supersedes lineage входят в один component независимо от времени; inclusion Campaign с correction history в конкретный freeze остаётся `OPEN_BLOCKED_PENDING_DECISION` под `XFR-D-060`;
- duplicate/replay leakage fail-closed rejection — confirmed duplicate/replay lineage входит в исходный component; suspected-but-unconfirmed linkage исключается fail closed. Concrete detection implementation и runtime evidence carrier остаются `OPEN_BLOCKED_PENDING_DECISION`;
- frozen manifest до run — `DECISION_CANDIDATE_FOR_REVIEW`, согласовано с составом §8;
- корректировки outcome не переписывают уже frozen run задним числом — `DECISION_CANDIDATE_FOR_REVIEW`, согласовано с `CAMPAIGN_OUTCOMES.md` §7 (append-only, correction создаёt новую запись, не изменяет существующую).

`XFR-D-059 v1.1` supersedes v1.0 и является exact governance grouping/isolation policy: closed edge set + deterministic transitive closure + atomic one-split component + fail-closed missing/ambiguous handling. Он не утверждает physical graph/component-ID representation, duplicate detector, manifest schema/carrier, dataset или allocation algorithm.

Split ratios (доли train/validation/test, объём выборки) не фиксируются этим документом — `OPEN_BLOCKED_PENDING_DECISION` (§11, пункт 6).

---

## 5. Label taxonomy и adjudication

### 5.1. Пять категорий label

1. deterministic contract/rule expected outputs;
2. expert relevance/compatibility labels;
3. gate/safety labels;
4. business outcomes;
5. user feedback/preference signals.

`DECISION_CANDIDATE_FOR_REVIEW` для структуры категорий; основание — Architecture §27.1 (допустимые события обратной связи) и `CAMPAIGN_OUTCOMES.md` §5 (business outcome codes).

### 5.2. Нормативный label-quality enum (без добавлений)

`SELF_REPORTED | BILATERALLY_CONFIRMED | DOCUMENT_VERIFIED | EMPLOYEE_CONFIRMED | DISPUTED | INCONCLUSIVE`

`SOURCE_NORMATIVE`, дословно Architecture §27.2. Этот документ не добавляет и не переименовывает ни одно значение.

### 5.3. Явные правила — PRODUCT-факты и evaluation-кандидаты

Ниже смешаны утверждённые PRODUCT-факты и предлагаемые этим proposal правила их применения к Matching evaluation — статусы не совпадают внутри раздела и указаны индивидуально.

**`SOURCE_NORMATIVE`:**

- **AI output не ground truth.** «Только метки с разрешенным уровнем доказательности используются как ground truth для оценки или обучения. Одностороннее заявление и AI-вывод не становятся истинной меткой автоматически» (Architecture §27.2, дословно).
- **Одностороннее заявление не становится ground truth автоматически** — та же цитата §27.2.
- **Спорная неявка не является отрицательной меткой.** Matching Engine «не использует спорное заявление как отрицательную обучающую метку» (Architecture §27.3); подтверждено §34.1: «Процессный отказ, использованный как отрицательная метка fit — 0%, любое нарушение».
- **`Paused` не terminal outcome и не event/non-event label.** `CAMPAIGN_OUTCOMES.md` §4: «`Paused` — временный, возобновляемый lifecycle status Campaign, не terminal outcome»; `CO-C-004` — `business_outcome` остаётся `null`, Campaign не входит ни в историю исходов, ни в подсчёт связанных порогов.
- **Correction создаёт новую immutable запись; старая становится historical/superseded.** `CAMPAIGN_OUTCOMES.md` §7: correction создаёт новую immutable запись, которая становится текущим effective business outcome; исправляемая запись остаётся доступной только как историческая (`CO-C-016`); correction допустима только со ссылкой на текущий effective, попытка сослаться на уже superseded запись отклоняется (`CO-C-026`). Это факт о поведении `CAMPAIGN_OUTCOMES.md`, не о правилах Matching evaluation.

**`DECISION_CANDIDATE_FOR_REVIEW`:**

- **Superseded outcome-запись не используется как текущий *evaluation label*.** То, что correction создаёт новую запись и делает старую historical/superseded, — PRODUCT-факт выше (`SOURCE_NORMATIVE`). То, что именно эта historical/superseded запись не должна использоваться как current label конкретно в Matching evaluation, — предлагаемое этим proposal правило, поддержанное указанным PRODUCT-фактом, но не сформулированное источником как отдельная Matching evaluation норма.
- **Frozen historical evaluation run не переписывается после correction.** Согласовано с append-only принципом `CAMPAIGN_OUTCOMES.md` §7 и с общим запретом silent reinterpretation сохранённых артефактов (по аналогии с Feature Schema §9), но не установлено ни одним источником как готовая Matching evaluation норма.

### 5.4. Критическая развилка — не решается здесь

Включение Campaign с correction history в dataset freeze имеет **два** равно нерешённых варианта, оба зафиксированы, ни один не выбран:

- **вариант A:** использовать current effective outcome на момент freeze (Campaign включается с её текущим, на тот момент, effective outcome);
- **вариант B:** исключать из freeze любую Campaign, у которой есть хотя бы одна correction в истории.

`OPEN_BLOCKED_PENDING_DECISION`, owner `AI + PRODUCT` (§11, пункт 4). Ни один из вариантов не принят этим документом ни явно, ни по умолчанию.

### 5.5. Human-approved boundaries и остающиеся открытые решения

- `XFR-D-057 v1.0` — `RESOLVED_QUALITATIVE_ELIGIBILITY_BOUNDARY`: category/status eligibility разрешена human-approved governance decision без утверждения dataset, reviewer procedure или runtime contract. Deterministic contract/rule expected outputs используют versioned fixture/contract manifest и не получают feedback label-quality status; expert relevance допускает `EMPLOYEE_CONFIRMED` только условно после approved reviewer authority/qualification/independence procedure; gate/safety допускает `DOCUMENT_VERIFIED` или `EMPLOYEE_CONFIRMED` только при применимой source policy; business outcomes допускают `DOCUMENT_VERIFIED`, а `BILATERALLY_CONFIRMED` — только при подтверждении обеими сторонами именно данного outcome; `SELF_REPORTED` user feedback допускается только для отделённой diagnostic/user-specific analysis, не общего ground truth. Unknown combinations fail closed; original status/provenance сохраняются. Сам `XFR-D-057` не утверждает reviewer/adjudication workflow или quorum; current human procedure синхронизирована отдельно по `XFR-D-058 v1.1` ниже, а operational appointments, runtime representation и production-data use остаются `OPEN_BLOCKED_PENDING_DECISION` (§11 пункт 1/2).
- `XFR-D-058 v1.1` — `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY`, supersedes v1.0 с полным сохранением fail-closed правил: один frozen evidence packet независимо рассматривают два разных first-level human reviewers, каждый фиксирует determination до просмотра вывода другого; совпадающие determinations образуют quorum, а при расхождении third second-level reviewer с отдельной authority/RBAC ролью подтверждает один determination либо оставляет label unresolved. Все reviewers требуют qualification, independence и conflict-of-interest evidence; AI не входит в quorum; исходный status/evidence и determinations immutable; outcome — отдельная append-only запись и только eligibility candidate по `XFR-D-057`. Named appointments, конкретные RBAC IDs, SLA, sampling, status mapping и runtime carrier остаются `OPEN_BLOCKED_PENDING_DECISION` (§11 пункт 2).
- `XFR-D-069 v1.0` — approved qualitative terminology boundary: `unknown` описывает состояние знания о факте/label, `abstention` — действие evaluator не выдавать output; термины ортогональны и ни один не является negative label или Qualification result. Exact triggers, runtime representation, metric definitions и routing mapping остаются `OPEN_BLOCKED_PENDING_DECISION` (§11 пункт 15); новый runtime enum не вводится.

---

## 6. Metric family registry

Для каждого семейства: evaluation object, требуемый label/evidence, allowed use, prohibited inference, owner финального threshold, текущий статус.

### 6.1. Hard Constraint safety

- **Evaluation object:** решения Eligibility Filter (Architecture §14 этап 3).
- **Label/evidence:** проверенная разметка confirmed pair, unknown-value cases.
- **Allowed use:** измерение false exclusion / false eligibility / unknown handling.
- **Prohibited inference:** нельзя заключать production-готовность из synthetic-only измерения (§3).
- **Owner финального threshold:** прямой источник не назначает owner именно для approved false-exclusion maximum; `Chief AI Architect + AI` — `DECISION_CANDIDATE_FOR_REVIEW` этого proposal, не `SOURCE_NORMATIVE`; см. открытое решение №5 (§11), которое включает и численное значение, и само назначение owner.
- **Статус:** два элемента `SOURCE_NORMATIVE` с готовым значением — «Неизвестное значение, ошибочно обработанное как отрицательное — 0%, любое нарушение, обязательное правило архитектуры» и «Процессный отказ, использованный как отрицательная метка fit — 0%, любое нарушение» (Architecture §34.1). Третий элемент — «подтверждённая успешная пара, ошибочно исключённая Hard Filter» — имеет только `baseline, затем утверждённый максимум`; сам максимум `OPEN_BLOCKED_PENDING_DECISION` (§11, пункт 5).

### 6.2. Ranking/retrieval

- **Evaluation object:** порядок кандидатов, возвращённых Matching Engine.
- **Label/evidence:** expert relevance/compatibility labels (§5.1.2), только если разметка это позволяет.
- **Allowed use:** `Precision@K`, `Recall@K`, `NDCG@K` — измерение, не target.
- **Prohibited inference:** без размеченной тестовой выборки метрика не заключает о готовности к релизу.
- **Owner финального threshold:** Architecture §34.2 требует, чтобы точные пороги утверждались после создания размеченной тестовой выборки («До этого они измеряются как baseline и не подменяются произвольными значениями», дословно), но не называет owner напрямую; `Chief AI Architect + AI` — `DECISION_CANDIDATE_FOR_REVIEW` этого proposal, не `SOURCE_NORMATIVE`; см. открытое решение №7 (§11), которое включает и численные targets, и само назначение owner.
- **Статус:** `SOURCE_NORMATIVE` — семейство и требование future approved threshold названы явно; targets и owner их утверждения — `OPEN_BLOCKED_PENDING_DECISION`.

### 6.3. Reciprocal/mutual quality

- **Evaluation object:** взаимное соответствие (Tenant Fit / Owner Fit), только если соответствующая `MATCHING_SCORING_POLICY` утвердит конкретный измеримый объект.
- **Label/evidence:** зависит от утверждённой Scoring Policy — не определено здесь.
- **Allowed use:** измерение после утверждения объекта Scoring Policy.
- **Prohibited inference:** Evaluation Plan не определяет и не калибрует саму reciprocal-формулу (Feature Schema §2: «базовую канонизацию входа» и арифметику владеет не Evaluation Plan).
- **Owner финального threshold (роль, не артефакт):** `AI + PRODUCT` — Architecture §37 вопросы №2 (выбор функции Mutual Aggregate) и №3 (стартовые веса/сегментные пороги), `SOURCE_NORMATIVE` для owner assignment; выбранное значение фиксируется в артефакте `MATCHING_SCORING_POLICY`, который сам по себе не является owner-ролью.
- **Статус:** `OUT_OF_SCOPE` до утверждения Scoring Policy; после утверждения — `DECISION_CANDIDATE_FOR_REVIEW` для процедуры измерения.

### 6.4. Confidence/Risk calibration и uncertainty/abstention diagnostics

- **Evaluation object:** Confidence Score (8 факторов Architecture §16: полнота критических полей, качество/независимость источников, свежесть, статус верификации, отсутствие конфликтов, устойчивость ранга, согласованность методов, историческая калибровка); Risk Score (§17).
- **Label/evidence:** gate/safety labels (§5.1.3), подтверждённые исходы проверки.
- **Allowed use:** измерение полного распределения/summary Confidence Score; отдельно — counts/rates только для явно определённых states, если и когда они определены утверждённым policy/enum (например, канонический `evidence_status` Architecture §13, либо будущие Qualification routing статусы `NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`) — не как единая недоопределённая категория «low-confidence».
- **Prohibited inference:** без approved threshold нельзя вычислять «долю low-confidence» как однозначную категорию; `XFR-D-069 v1.0` запрещает сворачивать unknown facts/labels и abstained outputs в один показатель и смешивать их с negative label или Qualification result; нельзя смешивать канонический `evidence_status` Architecture §13, candidate `value_state` Feature Schema, будущий Qualification routing status и статистический bucket этого измерения в один термин.
- **Owner финального threshold (роль, не артефакт):** для Risk Score human-review thresholds — `AI + LEGAL`, Architecture §37 вопрос №8, `SOURCE_NORMATIVE`; для Confidence Score calibration target прямой источник owner не назначает — см. открытое решение №7 (`Chief AI Architect + AI`, после создания размеченной выборки), `DECISION_CANDIDATE_FOR_REVIEW`/`OPEN_BLOCKED_PENDING_DECISION`, не `SOURCE_NORMATIVE`. Выбранные значения фиксируются в артефактах `MATCHING_RISK_POLICY`/`MATCHING_SCORING_POLICY` соответственно — сами артефакты не являются owner-ролью.
- **Статус:** `SOURCE_NORMATIVE` — факторы Confidence Score названы явно (§16); численная калибровка/target `OPEN_BLOCKED_PENDING_DECISION`; qualitative terminology `unknown`/`abstention` резолвлена human-approved `XFR-D-069 v1.0`, но exact triggers, runtime mapping, metric definitions/denominators и routing остаются `OPEN_BLOCKED_PENDING_DECISION` (§11, пункт 15), новый runtime enum этим документом не вводится.

### 6.5. Safety/data-leakage/DLP

- **Evaluation object:** artifacts, logs, evaluation output на предмет прямых идентификаторов, точного адреса, свободного текста.
- **Label/evidence:** adversarial/safety dataset (§3, категория 3).
- **Allowed use:** verification отсутствия protected-data leakage.
- **Prohibited inference:** прохождение DLP-проверки не заключает production-готовность в целом.
- **Owner финального threshold:** `DEVELOPMENT + SECURITY` — `DECISION_CANDIDATE_FOR_REVIEW`, разумный вывод из зоны ответственности Architecture §48; источник не называет эту роль owner'ом напрямую.
- **Статус:** `SOURCE_NORMATIVE` для protected-contour/open-output границы (Architecture §9.4: точный адрес/координаты только в защищённом контуре, не в открытых outputs/events; §48.7 DLP — для outbox/event payload); применение того же разделения ко всем evaluation artifacts/manifests/logs этого Evaluation Plan — `DECISION_CANDIDATE_FOR_REVIEW` (§7, `MEP-C-006`), не абсолютная уже установленная для этого контекста норма.

### 6.6. Determinism/replay/version compatibility

- **Evaluation object:** повторный расчёт при неизменных входах (Architecture §49).
- **Label/evidence:** frozen replay/regression corpus (§3, категория 4).
- **Allowed use:** проверка exact replay (hashes/scores/ranking/reasons/package hash идентичны) для deterministic path; recorded/bounded replay — только после отдельного утверждения tolerance для внешнего вероятностного компонента.
- **Prohibited inference:** недетерминированный компонент не проходит Matching Qualification Gate самостоятельно (Architecture §49, дословно).
- **Owner финального threshold:** `DEVELOPMENT + AI` — `DECISION_CANDIDATE_FOR_REVIEW`; Architecture §49 описывает сам reproducibility-контракт, но не называет эту роль owner'ом bounded replay tolerance напрямую; см. открытое решение №10.
- **Статус:** `SOURCE_NORMATIVE` — «Несовпадение exact replay — severity-1 defect и блокирует соответствующую версию правил» (Architecture §49, дословно); bounded replay tolerance `OPEN_BLOCKED_PENDING_DECISION` (§11, пункт 10).

### 6.7. Robustness/adversarial

- **Evaluation object:** поведение при adversarial/edge-case входах.
- **Label/evidence:** adversarial/safety dataset (§3, категория 3).
- **Allowed use:** измерение устойчивости к edge cases.
- **Prohibited inference:** отсутствие обнаруженных проблем на текущем корпусе не означает отсутствие уязвимостей вообще.
- **Owner финального threshold:** `DEVELOPMENT + AI` — `DECISION_CANDIDATE_FOR_REVIEW`, согласовано со статусом всей metric family ниже; §36.3 условие 4 не называет owner напрямую.
- **Статус:** `DECISION_CANDIDATE_FOR_REVIEW` — семейство разумно вытекает из §36.3 условия 4 (DLP/negative tests), конкретная процедура не определена ни одним источником.

### 6.8. Segment/bias/proxy diagnostics

- **Evaluation object:** метрики по сегментам (город, тип помещения, категория бизнеса и т.п.), проверка дискриминационных признаков/прокси.
- **Label/evidence:** business outcomes или gate/safety labels, сегментированные; только после de-identification процедуры (§7).
- **Allowed use:** диагностика, не legal fairness verdict.
- **Prohibited inference:** diagnostic не устанавливает и не заменяет юридический fairness standard; не разрешает использование protected/proxy признака без отдельного lawful basis решения.
- **Owner финального threshold:** legal standard — `LEGAL + PRODUCT`; процедура diagnostic — `AI`; оба — `DECISION_CANDIDATE_FOR_REVIEW`, поддержанные §30.3 (координация PRODUCT/LEGAL при platform-level release), но не названные источником owner'ами напрямую; см. открытое решение №14.
- **Статус:** `SOURCE_NORMATIVE` для требования самой проверки — «проверку дискриминационных признаков и прокси» (Architecture §30.3, пункт 4); segment coverage minimum и re-identification threshold — `OPEN_BLOCKED_PENDING_DECISION` (§11, пункты 8, 9).

### 6.9. Operational context metrics

- **Evaluation object:** latency, cost, idempotency, availability.
- **Label/evidence:** telemetry (не dataset/label в смысле этого документа).
- **Allowed use:** только как контекстная ссылка на отдельные SLO/Cost artifacts.
- **Prohibited inference:** Evaluation Plan не выдаёт SLO- или cost-verdict.
- **Owner финального threshold:** ownership и threshold определяются отдельными approved SLO/Cost artifacts (Architecture §54 operational artifact; §51 `MATCHING_COST_MODEL`) и их назначенными functional owners — не самими артефактами и не этим Evaluation Plan. Точные functional owners этим документом не назначаются — `OUT_OF_SCOPE`/`OPEN_BLOCKED_PENDING_DECISION` там, где источник их не называет.
- **Статус:** `OUT_OF_SCOPE` для владения; допустимо только как входная ссылка.

Единственный свёрнутый aggregate score не может быть единственным основанием итогового заключения evaluation run — `DECISION_CANDIDATE_FOR_REVIEW` (см. `MEP-C-009`). Отчёт обязан покрывать все metric families, объявленные applicable в frozen run manifest/procedure (§8) конкретного run; перечень applicable families и основания исключений фиксируются в этом manifest, а не выбираются произвольно постфактум. Минимальное число families не изобретается этим документом.

---

## 7. Real-data, privacy и segment boundary

Дословный смысл Architecture §8.4 и §30.2 сохранён без ослабления, `SOURCE_NORMATIVE`:

- «Токенизированные ID, хешированные значения и псевдонимы остаются персональными данными, если LeaseMind или иной участник обработки способен восстановить связь с субъектом. Они не считаются обезличенными…» (§8.4, дословно) — pseudonymized ≠ anonymized, без исключений в этом документе;
- «Используются только проверенные и разрешенные законом данные, прошедшие необратимое обезличивание по разделу 8.4. Токены, хеши и псевдонимы не считаются достаточным обезличиванием» (§30.2, дословно);
- необратимое обезличивание перед segment-аналитикой или обучением требует: удаления прямых идентификаторов и таблиц обратного соответствия; обобщения или исключения редких комбинаций признаков, точной географии и точных временных меток; исключения малых групп и выборок с риском повторной идентификации; проверки отсутствия защищённых персональных признаков и их скрытых заменителей; документирования набора полей, метода, версии, даты и результата проверки риска повторной идентификации; получения разрешения Data Governance до использования в обучении (§8.4, шесть пунктов дословно).

**Критическая поправка.** Этот документ не ссылается на какой-либо численный «minimum» размера группы или порог риска re-identification. Порог/методика re-identification остаются `OPEN_BLOCKED_PENDING_DECISION`, owner `PRODUCT + LEGAL` (методика и допустимость), с участием `DEVELOPMENT` (измеримость) — §11, пункт 9.

**Точный адрес, координаты, прямые идентификаторы и свободный текст — protected/open boundary, не абсолютный запрет на любой internal-контур.** `SOURCE_NORMATIVE`: точный адрес и координаты остаются только в защищённом контуре и не появляются в открытых outputs/events/logs Matching Engine (Architecture §9.4); прямые идентификаторы/защищённые значения/свободный текст запрещены именно там, где это прямо установлено Architecture (§8.2; §48.7 DLP — для outbox/event payload и подобных открытых/наблюдаемых каналов). §9.4 не запрещает существование защищённого internal-контура как такового — он определяет его как единственно допустимое место для точного адреса/координат, а не утверждает, что никакой protected internal evaluation dataset не может их содержать в принципе.

Architecture §8.4 отдельно требует: для dataset, пригодного к segment-аналитике или обучению, точная география и точные временные метки обобщаются или исключаются как часть необратимого обезличивания (`SOURCE_NORMATIVE`, дословно §8.4 — см. цитату выше).

**Fail-closed правило этого proposal.** Запрет включения точного адреса/координат/прямых идентификаторов/неклассифицированного free text в конкретные evaluation artifacts, manifests и logs этого Evaluation Plan — `DECISION_CANDIDATE_FOR_REVIEW`, не более широкая уже утверждённая норма: предлагается применять то же защищённое разделение, что Architecture требует для открытых outputs, ко всем evaluation artifacts/manifests/logs без исключения, из осторожности, а не потому что источник уже прямо требует этого для internal evaluation-контура. DLP при этом не ослабляется, реальные ПДн не разрешаются ни в каком виде, а `property_exact_address` как `protected_commercial_data` (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md` §12.3) не приравнивается к прямым персональным идентификаторам (ФИО/телефон/email/документы, §12.1 того же источника) — основания запрета разные, но оба запрета сохраняются без ослабления независимо от того, к какой категории отнесено конкретное поле.

**Protected/proxy attributes.** Architecture требует проверку дискриминационных признаков и прокси перед любым platform-level изменением (§30.3, пункт 4). Применимость lawful basis для конкретного признака в конкретном diagnostic определяется существующими data-governance/legal правилами, не этим документом. Proposal не создаёт legal fairness standard и не объявляет ни один признак допустимым к использованию в diagnostic или production — `OUT_OF_SCOPE` для legal verdict, `DECISION_CANDIDATE_FOR_REVIEW` только для самой процедуры проверки.

---

## 8. Manifest, reproducibility и run record

Concept-level состав, без проектирования БД/API. `DECISION_CANDIDATE_FOR_REVIEW`, основание — Architecture §49 (буквальный состав reproducibility bundle) и `ANALYSIS_SNAPSHOT.md` §7.1 (`input_fingerprint`, `evidence_dataset_revision` как прецедент SHA-256 hashing на этом же governance-уровне). Единый «run evidence package» разделён на две фазово-различные части: result references и review-evidence появляются только после execution, поэтому не могут входить в состав, обязательный уже к моменту `FROZEN`.

### 8.1. Freeze-time manifest — обязателен до `FROZEN`

Содержит всё, что известно до выполнения run:

- dataset категория (§3), immutable dataset manifest/hash и freeze time;
- included/excluded-record policy (§4/§5 controls);
- approved grouping/isolation policy version, connected-component membership evidence и конкретные one-component-to-one-split assignments/hashes (§4.2, §11 пункт 3);
- feature schema candidate version/hash;
- scoring/risk/qualification candidate versions/hashes (все три policy, не только scoring — согласовано с Architecture §49: «scoring/risk/qualification policy versions and hashes»);
- code/build/dependency digests;
- model provider/name/version/artifact digest, если применимо (сам provider/модель этим документом не выбирается — `OUT_OF_SCOPE`);
- seed/determinism mode;
- runtime/hardware metadata, если заранее известно и влияет на результат;
- label/adjudication policy version;
- metric procedure version;
- applicable metric families list и основания любых исключений (§6, `MEP-C-009`).

Отсутствие любого из перечисленных элементов блокирует переход в `FROZEN` (`MEP-C-012`).

### 8.2. Post-execution evidence record — обязателен до `EXECUTED`/`REVIEWED` соответственно

Отдельно фиксирует то, что появляется только после выполнения:

- run ID и execution timestamps;
- ссылку/hash на freeze-time manifest (§8.1) этого run;
- metric results/result artifact references и hashes;
- replay/determinism result (§6.6);
- фактически использованные runtime/hardware metadata, если они влияют на результат, и результат их сверки с заявленными в freeze-time manifest (§8.1) — расхождение фиксируется как **compatibility finding**;
- detected leakage/compatibility/failure findings, если обнаружены;
- reviewer evidence/decision references — обязательны для перехода в `REVIEWED`, но сами по себе не являются release/gate approval (§10).

Metric results, replay/determinism result и (когда runtime/hardware metadata заранее заявлены как влияющие на результат в §8.1) их фактическая сверка обязательны для перехода в `EXECUTED`; reviewer evidence/decision references — дополнительно обязательны для перехода в `REVIEWED` (`MEP-C-016`).

**Replay.** Exact replay обязателен для deterministic path — идентичные input hashes, component scores, ranking, reasons, final package hash (Architecture §49, `SOURCE_NORMATIVE`). Recorded или bounded replay допустимы только для внешнего вероятностного компонента и только после отдельного утверждения tolerance — `OPEN_BLOCKED_PENDING_DECISION` (§11, пункт 10). Ни одна конкретная величина tolerance не вводится здесь.

---

## 9. Threshold-search boundary

Только процедура, ни одного численного threshold. `DECISION_CANDIDATE_FOR_REVIEW`, согласовано с Architecture §30.3 (review Chief AI Architect + согласование PRODUCT/LEGAL перед любым platform-level release) и §52 (manifest требует approval date/approver IDs):

- Evaluation Plan работает с candidate policy/version bundle — версионированным, но не утверждённым набором значений;
- tuning evidence хранится отдельно от final evaluation evidence;
- final test data не используется для поиска того же threshold, который на нём затем проверяется (`MEP-C-011`);
- выбранное значение фиксируется в соответствующем policy artifact (`MATCHING_SCORING_POLICY`/`MATCHING_RISK_POLICY`/`MATCHING_QUALIFICATION_POLICY`), не в этом документе;
- cross-functional human approval фиксирует выбранную version/hash — не автоматический процесс;
- evaluation output не меняет runtime rules/model автоматически ни при каком результате измерения (согласовано с Architecture §34.4: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев», и §30.3: «автоматическое продуктивное переобучение на единичных событиях» — запрещено).

Статистический метод сравнения candidate thresholds — `OPEN_BLOCKED_PENDING_DECISION` (§11, пункт 16).

---

## 10. Evaluation run lifecycle и evidence verdict

Document-level candidate lifecycle, **не** runtime/API enum, **не** утверждённый public contract — `DECISION_CANDIDATE_FOR_REVIEW`:

```
PLANNED → FROZEN → EXECUTED → REVIEWED
```

- `PLANNED` — run запланирован, dataset категория и unit of evaluation выбраны, freeze-time manifest (§8.1) ещё не завершён;
- `FROZEN` — freeze-time manifest (§8.1) полностью зафиксирован, дальнейшие изменения входа создают новый run, не изменяют этот;
- `EXECUTED` — метрики (§6) вычислены против замороженного набора, post-execution evidence record (§8.2) содержит metric results и replay/determinism result;
- `REVIEWED` — post-execution evidence record (§8.2) дополнен reviewer evidence/decision references; сам этот статус не эквивалентен approval policy value или gate.

**Fail-closed outcome и evidence verdict — вне четырёх lifecycle stages, отдельно от других REJECTED-значений источников.** `PLANNED → FROZEN → EXECUTED → REVIEWED` остаются единственными четырьмя document-level candidate stages; пятый stage этим документом не вводится. Несостоявшийся run вместо этого получает **evidence verdict `EVALUATION_RUN_REJECTED`** — не lifecycle stage, а отдельная, ортогональная классификация причины, по которой run не смог продвинуться дальше достигнутого stage. Название специально отличается от уже существующих канонического `evidence_status = REJECTED` (Architecture §13) и будущего Qualification routing статуса `REJECTED_BY_MATCHING` (Architecture §18.1), чтобы не создавать namespace collision. `EVALUATION_RUN_REJECTED` — исключительно `DECISION_CANDIDATE_FOR_REVIEW` внутри этого документа: не runtime/API enum, не `evidence_status`, не Qualification routing status и не safe error code.

Run получает verdict `EVALUATION_RUN_REJECTED` и не продвигается дальше при:

- отсутствии доказуемого применения `XFR-D-059 v1.1`, approved `XFR-D-062` allocation policy либо complete freeze-time manifest (§8.1) — блокирует переход в `FROZEN`;
- incomplete post-execution evidence record для metric results/replay result (§8.2) — блокирует переход в `EXECUTED`;
- отсутствии обязательных фактических runtime/hardware metadata (§8.2), когда они заранее заявлены в freeze-time manifest (§8.1) как влияющие на результат, — блокирует переход в `EXECUTED`;
- отсутствии reviewer evidence/decision references (§8.2) — блокирует переход в `REVIEWED`;
- incompatible schema/policy versions между сравниваемыми runs — блокирует сравнение и переход в `REVIEWED`;
- обнаруженной leakage (§4) — блокирует переход в `EXECUTED`/`REVIEWED`.

Run с verdict `EVALUATION_RUN_REJECTED` фиксируется как несостоявшийся, не как «условно пройденный», и не занимает более позднюю позицию lifecycle, чем последний реально достигнутый stage.

**Явное различие четырёх понятий**, которые этот документ не смешивает:

1. procedure/evidence package complete — факт, что run корректно выполнен и manifest полон;
2. metric target met/not met — возможно **только** после утверждения численного target соответствующей policy (§6), не выполняется этим документом;
3. model/policy release approval — отдельное cross-functional решение (§9), не автоматический результат run;
4. gate status — `IMPLEMENTATION_READINESS_GATE`/`SYNTHETIC_ACCEPTANCE_GATE`/`PRODUCTION_LAUNCH_GATE`, определяется Architecture §36, не этим документом.

Успешный evaluation run (пункт 1 выше) сам по себе не переводит ни одно из понятий 2–4 в положительное состояние.

---

## 11. Decision register

| № | Вопрос | Owner | Блокирует |
| --- | --- | --- | --- |
| 1 | **`RESOLVED_QUALITATIVE_ELIGIBILITY_BOUNDARY` — `XFR-D-057 v1.0`.** Five-category eligibility matrix утверждена: deterministic fixtures вне feedback enum; expert/gate/safety/business eligibility условна и требует applicable approved source/reviewer procedure; `SELF_REPORTED` preference — только diagnostic/user-specific; unknown combinations fail closed. Сам `XFR-D-057` не утверждает reviewer/adjudication workflow или quorum; current human procedure см. в строке №2, а runtime representation и production-data use остаются `OPEN` | `AI + DEVELOPMENT + LEGAL` (governance owner `XFR-D-057`; mandatory approvers `Chief AI Architect + PRODUCT`) | Qualitative ground-truth eligibility больше не blocking; operational label/adjudication contract и production-data prerequisites остаются blocking |
| 2 | **`RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY` — `XFR-D-058 v1.1`, supersedes v1.0.** Fail-closed eligibility сохранена; два independent first-level human reviewers фиксируют determinations до просмотра вывода друг друга и образуют quorum при совпадении, а disagreement требует distinct third second-level confirmation либо остаётся unresolved; authority/qualification/independence/conflict checks обязательны; original evidence/determinations immutable; AI не входит в quorum; `XFR-D-057` остаётся дополнительным per-case eligibility prerequisite. Named appointments, RBAC IDs, SLA, sampling и runtime representation остаются `OPEN` | `AI + LEGAL` (governance owner `XFR-D-058`; mandatory approvers `Chief AI Architect + PRODUCT + DEVELOPMENT`) | Human governance procedure больше не blocking; operational appointment и exact runtime label/adjudication contract остаются blocking |
| 3 | **`RESOLVED_GROUPING_ISOLATION_BOUNDARY` — `XFR-D-059 v1.1`, supersedes v1.0.** Closed source-authoritative edge set, deterministic transitive closure и atomic one-split connected component утверждены; revisions/corrections/confirmed duplicate-replay lineage не создают independent samples; missing/ambiguous linkage и cross-split component fail closed. `XFR-D-060` inclusion, `XFR-D-062` size/ratios/seed, identity/detection controls, manifest/runtime carrier и implementation остаются `OPEN` | `AI + DEVELOPMENT` (governance owner `XFR-D-059`; mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`) | Grouping/isolation governance boundary больше не blocking; allocation policy, complete manifest и runtime evidence остаются blocking |
| 4 | Handling Campaigns с correction history при новом freeze — вариант A vs B (§5.4) | AI + PRODUCT | Outcome leakage prevention |
| 5 | Approved false-exclusion maximum **и owner этого назначения** (§6.1) — источник не называет owner напрямую | `Chief AI Architect + AI` (candidate, не подтверждён источником) | Hard Constraint safety metric family |
| 6 | Dataset size/split ratios | AI + DEVELOPMENT | Split/leakage controls — намеренно не закрывается этим документом |
| 7 | Численные metric targets **и owner их утверждения** (Precision@K/Recall@K/NDCG@K/калибровка/диверсификация, §6.2/§6.4) — источник не называет owner напрямую | `Chief AI Architect + AI` (candidate, не подтверждён источником), после создания размеченной выборки | Model release/Launch |
| 8 | Segment coverage requirements | PRODUCT + AI + LEGAL | Segment/bias diagnostics |
| 9 | Re-identification risk method/threshold (§7) | PRODUCT + LEGAL (+ DEVELOPMENT для измеримости) | Segment diagnostics, training use de-identification |
| 10 | Bounded replay tolerance для внешнего вероятностного компонента (§8) | DEVELOPMENT + AI | Replay/determinism acceptance |
| 11 | Drift monitoring — процедура, метрики, триггеры | AI + DEVELOPMENT | Полностью не покрыто ни одним источником — 0 совпадений `drift` в Matching-источниках |
| 12 | Точный cross-functional approval flow для самого `MATCHING_EVALUATION_PLAN` как артефакта | Chief AI Architect + AI + DEVELOPMENT | `IMPLEMENTATION_READINESS_GATE` условие 5 (Controlled Artifact Manifest) |
| 13 | Конкретный owner/authority роли «Data Governance» (§7) | **RESOLVED authority model by `XFR-D-067 v1.0`:** Data Governance authority accountable to `LEGAL`, independent from model/dataset author; `AI` evidence provider; `DEVELOPMENT + SECURITY` control verification. Named appointment/RBAC remains required | Segment/training data readiness |
| 14 | Fairness diagnostic framework и юридический fairness standard | LEGAL + PRODUCT | Segment/bias diagnostics, отдельно от Feature Schema открытого решения №9 |
| 15 | **`RESOLVED_QUALITATIVE_TERMINOLOGY_BOUNDARY` — `XFR-D-069 v1.0`.** `unknown` = knowledge/fact state; `abstention` = evaluator behavior; они ортогональны, не negative и не Qualification result. Runtime representation, triggers, metrics и routing mapping остаются `OPEN` | `AI + DEVELOPMENT` (governance owner `XFR-D-069`; mandatory approvers `Chief AI Architect + PRODUCT + LEGAL`) | Runtime/reporting contract остаётся blocking; qualitative terminology больше не blocking |
| 16 | Threshold-search statistical comparison procedure (§9) | AI + DEVELOPMENT | Threshold-search evidence record |
| 17 | Точный процесс, которым correction (`CAMPAIGN_OUTCOMES.md` §7) синхронизируется с уже `FROZEN`/`EXECUTED` run (помимо запрета переписывания — сам механизм уведомления/учёта) | AI + DEVELOPMENT | Run lifecycle (§10) |

Решение №1 получило qualitative eligibility boundary `XFR-D-057`; решение №2 — human adjudication governance procedure `XFR-D-058 v1.1`; решение №3 — grouping/isolation boundary `XFR-D-059 v1.1`; решение №13 разрешено отдельным human governance record; строка №15 получила qualitative terminology boundary `XFR-D-069`. Эти records не одобряют dataset или Evaluation Plan; named appointments/RBAC, `XFR-D-060`, `XFR-D-062`, runtime representation, production-data prerequisites и прочие remaining dependencies остаются `OPEN`, а новые gaps добавляются будущими ревью, не разрешаются этим документом.

---

## 12. Acceptance criteria

Последовательный диапазон `MEP-C-001`–`MEP-C-018`, без искусственного раздувания — по одному сценарию на каждый обязательный пункт задания.

#### `MEP-C-001` — synthetic-to-production extrapolation запрещена

**Given:** evaluation run построен исключительно на dataset категорий 1–4 (§3).
**When:** формулируется заключение о production quality, real calibration или реальных outcomes.
**Then:** такое заключение не делается; отчёт run явно ограничивает вывод synthetic-only контуром.

#### `MEP-C-002` — connected-component grouping/split leakage: fail closed

**Given (часть А):** candidate record имеет missing/ambiguous/conflicting canonical linkage.
**When:** рассматривается его включение в tuning/final split.
**Then:** record исключается до assignment с явной unresolved reason/evidence reference, не получает random/heuristic assignment и не считается negative label или failed match (`XFR-D-059 v1.1`).

**Given (часть Б):** included record не имеет полной component membership evidence либо approved `XFR-D-062` allocation policy отсутствует.
**When:** рассматривается формирование tuning/final split для evaluation run.
**Then:** split не считается валидным, run не переходит в `FROZEN` и получает evidence verdict `EVALUATION_RUN_REJECTED` (§10, `XFR-D-059 v1.1`).

**Given (часть В):** component построен deterministic transitive closure закрытого source-authoritative edge set `XFR-D-059 v1.1`.
**When:** тот же component обнаружен одновременно в tuning и final evaluation split.
**Then:** run получает evidence verdict `EVALUATION_RUN_REJECTED` (§10, `XFR-D-059 v1.1`). Component не разрезается из-за размера/ratio; split ratios, seed и allocation boundaries остаются отдельно `OPEN` под `XFR-D-062`.

#### `MEP-C-003` — outcome correction/superseded leakage без выбора inclusion rule

**Given:** Campaign имеет correction history (`CAMPAIGN_OUTCOMES.md` §7) на момент dataset freeze.
**When:** Campaign рассматривается для включения в frozen dataset.
**Then:** то, что correction создаёт новую effective запись и оставляет старую historical/superseded, — `SOURCE_NORMATIVE` факт (§5.3, `CAMPAIGN_OUTCOMES.md` §7); запрет использовать эту superseded запись как current evaluation label — `DECISION_CANDIDATE_FOR_REVIEW` этого proposal (§5.3), не установленная источником Matching-норма; какой из двух вариантов §5.4 (A/B) применяется к включению самой Campaign в freeze — не определяется этим сценарием и остаётся `OPEN_BLOCKED_PENDING_DECISION`.

#### `MEP-C-004` — `Paused` не terminal label

**Given:** Campaign имеет lifecycle status `Paused`.
**When:** формируется event/non-event dataset.
**Then:** Campaign исключена из обоих множеств, согласовано с `CO-C-004`.

#### `MEP-C-005` — непригодные/неактуальные/конфликтующие записи исключены из активного расчёта

**Given:** запись имеет канонический `evidence_status ∈ {STALE, CONFLICTING, REJECTED}` (Architecture §13, `SOURCE_NORMATIVE`) либо связанное правовое основание невалидно/отозвано (Architecture §11: неактивное основание блокирует расчёт/повторное использование, `SOURCE_NORMATIVE`).
**When:** запись рассматривается как input Matching evaluation run.
**Then:** запись исключается из активного расчёта — `DECISION_CANDIDATE_FOR_REVIEW` этого proposal, поддержанный указанными нормами Architecture §11/§13 и precedent'ом `ANALYSIS_SNAPSHOT.md` §6.4 (revocation конкретной `evidence_dataset_revision` — механизм этого же продуктового артефакта, не автоматическая Matching-норма; этот документ не утверждает, что Matching evaluation dataset уже использует тот же `evidence_dataset_revision` контракт, если это прямо не определено источником).

**Given:** label имеет исходный status `DISPUTED` или `INCONCLUSIVE`. **When:** first-level determinations не зафиксированы независимо до просмотра вывода друг друга либо отсутствуют два согласованных human determinations по `XFR-D-058 v1.1`, полный reviewer authority/qualification/independence/conflict-check evidence или разрешённая per-case eligibility по `XFR-D-057`. **Then:** label не допускается как resolved ground truth; AI-only output, неполный quorum и disagreement без second-level confirmation fail closed, не создавая negative outcome.

#### `MEP-C-006` — identifiers/exact address/free text запрещены в artifacts этого Evaluation Plan

**Given:** dataset, label, manifest или лог этого Evaluation Plan.
**When:** проверяется состав полей.
**Then:** прямые персональные идентификаторы, точный адрес/координаты и неклассифицированный свободный текст отсутствуют — fail-closed правило этого proposal (§7, `DECISION_CANDIDATE_FOR_REVIEW`), применённое единообразно ко всем evaluation artifacts независимо от того, к какой защищённой категории (прямой идентификатор vs `protected_commercial_data`) отнесено конкретное поле; это не означает, что Architecture запрещает существование любого защищённого internal-контура для таких данных в принципе (§9.4) — запрет действует именно для artifacts/manifests/logs этого Evaluation Plan.

#### `MEP-C-007` — small groups/re-identification без численного minimum

**Given:** сегмент-специфичный вывод построен на выборке, потенциально допускающей re-identification.
**When:** рассматривается публикация или использование вывода в обучении.
**Then:** вывод блокируется до прохождения полной процедуры §7 (6 шагов + разрешение Data Governance); конкретный численный порог группы этим сценарием не вводится и не подразумевается.

#### `MEP-C-008` — protected/proxy diagnostic не означает legal approval

**Given:** segment/bias diagnostic использует признак, потенциально коррелирующий с защищённым атрибутом.
**When:** diagnostic выполнен и даёт результат.
**Then:** результат не интерпретируется как approval использования признака в production и не заменяет отдельное LEGAL-решение о lawful basis (§7, §6.8).

#### `MEP-C-009` — запрет единственного aggregate score как единственного основания

**Given:** отчёт evaluation run и его frozen manifest (§8), объявляющий applicable metric families для этого run.
**When:** формируется итоговое заключение о качестве.
**Then:** единственный свёрнутый aggregate score не является достаточным единственным основанием; заключение покрывает все metric families (§6), объявленные applicable в frozen run manifest/procedure; перечень applicable families и основания любых исключений зафиксированы в manifest; минимальное число families этим документом не изобретается.

#### `MEP-C-010` — uncertainty/unknown reporting без изобретённого numeric threshold и без недоопределённой категории

**Given:** отчёт evaluation run по ranking/calibration.
**When:** формируется итог.
**Then:** отчёт показывает полное распределение/summary Confidence Score и отдельно counts/rates только для states, явно определённых утверждённым policy/enum (например, канонический `evidence_status` Architecture §13); `XFR-D-069 v1.0` требует сохранять qualitative distinction: `unknown` — knowledge/fact state, `abstention` — evaluator behavior, ни один термин не является negative label или Qualification result. Они не объединяются в недифференцированный показатель; exact metric definitions/denominators, triggers, runtime representation и routing mapping остаются `OPEN`; «доля low-confidence» не вычисляется без approved threshold, численный acceptable-threshold не вводится и новый runtime enum не создаётся.

#### `MEP-C-011` — tuning/final separation

**Given:** threshold-search процедура (§9).
**When:** candidate threshold проверяется.
**Then:** финальная проверка выполняется на данных и connected components, не использованных для поиска этого же threshold; component-level overlap отклоняется по `MEP-C-002`.

#### `MEP-C-012` — freeze-time manifest обязателен до `FROZEN`

**Given:** любой evaluation run.
**When:** run переходит в `FROZEN`.
**Then:** freeze-time manifest (§8.1) содержит полный состав, включая approved grouping/isolation policy version, component membership evidence и one-component-to-one-split assignments/hashes; run без полного freeze-time manifest не переходит в `FROZEN` и получает evidence verdict `EVALUATION_RUN_REJECTED` (§10).

#### `MEP-C-013` — запрет сравнения runs с несовместимыми версиями

**Given:** два evaluation run с разными, не входящими в один согласованный version bundle `feature_schema_version`/policy versions.
**When:** результаты сравниваются.
**Then:** прямое сравнение не производится без явной пометки incompatible-version.

#### `MEP-C-014` — запрет автоматического изменения policy/model

**Given:** evaluation run завершён и предлагает candidate threshold/version.
**When:** рассматривается применение результата к production rules/weights/model.
**Then:** изменение не выполняется автоматически; требуется процедура §9 и Architecture §30.3 (review, согласование, контролируемый выпуск).

#### `MEP-C-015` — Evaluation Plan не подменяет SLO/Cost Model

**Given:** operational metric (latency, cost, alert/stop guardrail).
**When:** рассматривается включение в run report.
**Then:** метрика допустима только как контекстная ссылка; финальный verdict остаётся за отдельным SLO/Cost artifact (§6.9).

#### `MEP-C-016` — incomplete post-execution evidence record fail closed (phase-appropriate, не дублирует `MEP-C-012`)

**Given:** post-execution evidence record (§8.2) не содержит metric results/replay result, либо (когда runtime/hardware metadata заранее заявлены в freeze-time manifest §8.1 как влияющие на результат) не содержит фактически использованные runtime/hardware metadata и результат их сверки с §8.1 — применимо к переходу в `EXECUTED`; либо не содержит reviewer evidence/decision references — применимо к переходу в `REVIEWED`. Полнота freeze-time manifest для `FROZEN` проверяется отдельно `MEP-C-012`, здесь не повторяется.
**When:** run пытается перейти в `EXECUTED` или в `REVIEWED` соответственно.
**Then:** переход блокируется; run получает evidence verdict `EVALUATION_RUN_REJECTED` (§10) и не продвигается дальше последнего реально достигнутого stage.

#### `MEP-C-017` — deterministic replay mismatch блокирует candidate version

**Given:** exact replay deterministic path даёт расхождение hashes/scores/ranking/reasons/package hash.
**When:** расхождение обнаружено.
**Then:** соответствующая candidate version правил блокируется (severity-1, Architecture §49); run получает evidence verdict `EVALUATION_RUN_REJECTED` (§10) и не засчитывается как пройденный.

#### `MEP-C-018` — успешный evaluation run ≠ gate/model-release approval

**Given:** evaluation run успешно завершён (`REVIEWED`, полный manifest, метрики измерены).
**When:** оценивается статус `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE`, `PRODUCTION_LAUNCH_GATE` или model release.
**Then:** ни один статус не меняется автоматически; это отдельные cross-functional решения (§10, пункт 3–4).

---

## 13. Readiness/DoD

Настоящий документ:

- готов только к cross-functional review — не более;
- не закрывает вопрос №10 Architecture §37 — вопрос остаётся `OPEN`;
- decision register сохраняет 17 строк: №1 получил qualitative eligibility boundary `XFR-D-057`, №2 — human adjudication governance procedure `XFR-D-058 v1.1`, №3 — grouping/isolation boundary `XFR-D-059 v1.1`, №15 — qualitative terminology boundary `XFR-D-069`; named appointments/RBAC, `XFR-D-060`, `XFR-D-062` size/ratios/seed, численные targets, drift monitoring, fairness standard, re-identification threshold, runtime/reporting mappings и остальные dependencies остаются открытыми (§11);
- не обновляет и не требует обновления Controlled Artifact Manifest (Architecture §52.1) — запись `MATCHING_EVALUATION_PLAN` не добавляется до реального утверждения;
- не разрешает и не инициирует implementation, model release, реальные данные или production launch;
- не изменяет ни один существующий файл, включая `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md`, Architecture, Data Contracts, controlled-set artifacts, PR #20.

Статус gates:

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**
