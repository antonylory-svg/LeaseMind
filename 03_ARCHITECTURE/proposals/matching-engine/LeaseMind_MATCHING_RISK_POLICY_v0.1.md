# LeaseMind MATCHING_RISK_POLICY

**Версия:** 0.1
**Дата:** 2026-08-22
**Статус:** `Proposal for cross-functional review — does not authorize implementation`
**Artifact owner:** `Chief AI Architect + LEGAL` — `SOURCE_NORMATIVE`, Architecture §52 (Controlled Artifact Manifest, запись `MATCHING_RISK_POLICY`, «Qualification blocker»)
**Threshold decision owner (Architecture §37 вопрос №8, численные human-review thresholds):** `AI + LEGAL` — `SOURCE_NORMATIVE`; отдельная owner-грань, не тождественна artifact owner выше
**Lawful-sources decision owner (Architecture §37 вопрос №7):** `LEGAL` — `SOURCE_NORMATIVE`
**DEVELOPMENT review** для reproducibility/technical feasibility — `DECISION_CANDIDATE_FOR_REVIEW`, источник напрямую не назначает DEVELOPMENT единоличным owner'ом ни одного Risk-решения

**This proposal does not authorize implementation, model release, synthetic acceptance, production use, real personal data, automated policy promotion, or any gate.**

Документ не закрывает Architecture §37 вопрос №8 и не переводит ни один gate в `READY`.

**Связанные документы:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`, `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (контрактные/replay границы — проверено: Risk-специфичных names/enums там нет, ничего не расширяется), `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` (Proposal-зависимость, source facts/evidence), `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` (Proposal-зависимость, dataset/metric/threshold-search procedure evidence, не owner финальных Risk thresholds), `02_PRODUCT/CAMPAIGN_OUTCOMES.md`, `02_PRODUCT/ANALYSIS_SNAPSHOT.md`, `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md` (только DEVELOPMENT evidence, не источник новых архитектурных решений).

---

## 1. Metadata и нормативная дисциплина

Каждое существенное утверждение этого документа помечено одним из четырёх статусов:

- `SOURCE_NORMATIVE` — уже прямо утверждено существующим источником, цитируется или пересказывается без ослабления;
- `DECISION_CANDIDATE_FOR_REVIEW` — предлагается этим proposal как безопасный кандидат, не утверждено;
- `OPEN_BLOCKED_PENDING_DECISION` — источников недостаточно или требуется отдельное решение owner'а;
- `OUT_OF_SCOPE` — принадлежит другому артефакту или gate.

Precedent, предложение соседнего документа или техническая осуществимость не повышаются до нормативного решения. Кандидатный или открытый статус никогда не выдаётся за действующую норму.

---

## 2. Назначение, scope и non-goals

### 2.1. Назначение

`MATCHING_RISK_POLICY` — будущий governance-артефакт, определяющий: risk signals/factors и их допустимые источники; evidence eligibility для Risk; aggregation/calibration candidates; versioning; объяснимость; границу human-review escalation. `DECISION_CANDIDATE_FOR_REVIEW` для самой структуры документа.

Документ закрывает часть Architecture §37 вопроса №8 («Какие пороги Risk Score требуют обязательного human review?», owner `AI + LEGAL`, `SOURCE_NORMATIVE`) **только процедурно** — не назначает ни одного численного порога и не закрывает вопрос как решённый.

### 2.2. Что Risk Policy не является (`OUT_OF_SCOPE` / прямые запреты)

Risk:

- не доказательство нарушения — `SOURCE_NORMATIVE`, Architecture §17: «не является доказательством нарушения»;
- не кредитный рейтинг, юридическое заключение, санкция, решение о плательщике/возврате/отказе — `SOURCE_NORMATIVE`, Architecture §17, §5 принцип 14: «Matching Engine не принимает решение о возврате, кредите, спорной неявке, санкции или взыскании»;
- не Match Score, не Reciprocal Score, не Confidence Score, не Hard Constraint result — `SOURCE_NORMATIVE`, Architecture §5 принципы 8–9;
- не Qualification routing и не human Decision Record — `OUT_OF_SCOPE`, принадлежит `MATCHING_QUALIFICATION_POLICY` (§18.1) и Legal/Decision Service (§40) соответственно;
- не `SAFE_PRESENTATION_POLICY`, не SLO, не Cost Policy — `OUT_OF_SCOPE`, §51/§54 Architecture;
- не даёт разрешения на implementation/runtime/API/DB changes.

### 2.3. Таксономия — 9 непересекающихся уровней

```
source fact
  → evidence status/quality/freshness
    → risk signal
      → risk factor/category
        → Risk output
          → (отдельно) Confidence
            → Hard Constraint result
              → Qualification routing
                → human Decision Record / legal conclusion
```

`SOURCE_NORMATIVE`: Architecture §5 принцип 8 требует отдельно хранить факт, предположение, вывод и риск («Факт, предположение, вывод и риск хранятся раздельно»); принцип 9 требует различать Match Score, Confidence Score и Risk Score как разные показатели. Это дословно устанавливает раздельность **четырёх** и **трёх** сущностей соответственно — не девятиуровневую схему выше.

`DECISION_CANDIDATE_FOR_REVIEW`: сама девятиуровневая детализация (разбиение на 9 конкретных уровней, включая, например, отдельность «risk signal» от «risk factor/category» или «Hard Constraint result» от «Qualification routing») и правило не сворачивать все девять уровней друг в друга — предложение этого документа, поддержанное принципами 8–9 выше, но не установленное источником буквально на этом уровне детализации.

---

## 3. Источники и классификация утверждений

Прочитаны полностью: `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` (включая §5, §6, §8.4, §9, §11–19, §27, §30–34, §36–37, §40, §48–54); `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (проверено — не содержит ни одного Risk-специфичного name/enum, поэтому этот документ ничего не расширяет и не переопределяет там); `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md`; `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md`; `CAMPAIGN_OUTCOMES.md`; `ANALYSIS_SNAPSHOT.md`; восьмой DEVELOPMENT review (только как DEVELOPMENT evidence).

Источник-приоритет: буквальный текст Architecture > буквальный текст CTA/CAMPAIGN_OUTCOMES/ANALYSIS_SNAPSHOT > Proposal-зависимости (Feature Schema, Evaluation Plan, оба неутверждённые) > DEVELOPMENT review (только техническая воспроизводимость, не архитектурное решение).

---

## 4. Ownership и boundary matrix

| Артефакт/роль | Владеет | Не владеет |
| --- | --- | --- |
| `MATCHING_RISK_POLICY` (этот документ) | Определения risk signals/factors, evidence eligibility, aggregation/calibration candidates, versioning, объяснимость, граница human-review escalation | Match/Reciprocal/Dimension arithmetic; финальный Qualification routing; какие поля показывать пользователю |
| `MATCHING_FEATURE_SCHEMA` | Какие feature/facts существуют, их evidence/freshness/applicability (Proposal, не утверждён) | Risk factor definitions, aggregation |
| `MATCHING_SCORING_POLICY` | Match/Reciprocal/Dimension arithmetic — не Risk | Risk aggregation |
| `MATCHING_QUALIFICATION_POLICY` | Итоговый routing в `QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING` (Architecture §18.1) | Risk factor definitions, evidence sufficiency |
| `MATCHING_EVALUATION_PLAN` | Dataset/labels/metrics/threshold-search evidence (Proposal, не утверждён) | Финальный Risk threshold |
| `SAFE_PRESENTATION_POLICY` | Что можно показать пользователю; может использовать Risk-related classification как input | Вычисление Risk, владение Risk calculation |
| LEGAL | Юридически значимые выводы; подтверждение критического риска; lawful sources для §37 №7; protected/proxy классификация | Sole technical reproducibility |
| AI Manager | Orchestration задач Кампании | Подмена источника фактов, LEGAL, user decision (Architecture §5 принцип 2–4) |
| DEVELOPMENT | Reproducibility/technical feasibility — `DECISION_CANDIDATE_FOR_REVIEW`, если источник не назначает прямо | Смысл risk categories |
| Legal/Decision Service | Единственный writer мотивированных reviewer decisions (Architecture §40) | Risk calculation |
| Matching Engine | Единственный writer расчёта Match (включая Risk Score, §40) | Кампания, стратегия, плательщик (§5 принципы 3–4) |

**Отсутствие циклической зависимости.** Risk Policy может оцениваться против versioned candidate bundles Feature Schema/Scoring Policy до их утверждения — `DECISION_CANDIDATE_FOR_REVIEW`. Evaluation Plan производит evidence для последующего cross-functional approval конкретных Risk thresholds — не заменяет и не продвигает его автоматически (Architecture §34.4: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев»).

---

## 5. 10-category boundary registry (Architecture §17 — ровно 10, дословно)

Каждая категория по названию — `SOURCE_NORMATIVE` (буквальный текст §17). Mapping/sufficiency/detection/freshness/owner — нормативны только там, где источник это прямо говорит; иначе `DECISION_CANDIDATE_FOR_REVIEW` или `OPEN_BLOCKED_PENDING_DECISION`.

| № | Категория | Status | Source fact/evidence | Automatic signal | Human/legal confirmation | Запрещённый вывод | Freshness | Соседний artifact/gate (справочно, не owner) |
|---|---|---|---|---|---|---|---|---|
| 1 | Качество и конфликт данных | Категория `SOURCE_NORMATIVE`; mapping `DECISION_CANDIDATE_FOR_REVIEW`; sufficiency `OPEN_BLOCKED_PENDING_DECISION` | Версии значений, канонический `evidence_status` (Architecture §13) — candidate mapping | Флаг «источники противоречат» (`SOURCE_NORMATIVE`, §32) | Human review при критичности (`SOURCE_NORMATIVE`, §32); что есть «критичность» — `OPEN` | Автоматическое разрешение конфликта в пользу одной версии | Версии сохраняются, не перезаписываются (`SOURCE_NORMATIVE`, §32) | Feature Schema (evidence/freshness модель) |
| 2 | Полномочия представителя | Категория `SOURCE_NORMATIVE`; single-writer `SOURCE_NORMATIVE`; mapping в Risk factor `DECISION_CANDIDATE_FOR_REVIEW` | Versioned projection Identity/Authority Registry (`SOURCE_NORMATIVE`, §40) | Read-only ссылка на внешний verified факт | Подтверждение — исключительно внешний Registry (`SOURCE_NORMATIVE`, §40) | Matching Engine самостоятельно не подтверждает/не исправляет authority | Invalidation events Identity/Authority Registry | Identity/Authority Registry |
| 3 | Связь стороны с объектом | Категория `SOURCE_NORMATIVE`; lawful sources `OPEN_BLOCKED_PENDING_DECISION` (Architecture §37 №7, owner `LEGAL`); mapping `DECISION_CANDIDATE_FOR_REVIEW` | Допустимые lawful источники не определены — `OPEN` | Сигнал несоответствия — `DECISION_CANDIDATE_FOR_REVIEW` | Юридическая интерпретация — `LEGAL` (Architecture §37 №7, дословно: «Какие законные источники допускаются для проверки полномочий, связи с объектом и связанных лиц? \| LEGAL \| Qualification и Risk Policy») | Вывод о недобросовестности без review | Revision-bound (Feature Schema §8) — candidate mapping, не Architecture-норма для этой категории | `LEGAL` (§37 №7); Feature Schema (справочно) |
| 4 | Дублирование сущностей | Категория `SOURCE_NORMATIVE`; detection mechanism/owner `OPEN`; auto-merge запрет `DECISION_CANDIDATE_FOR_REVIEW` | Структурное совпадение идентификаторов/атрибутов — candidate | Флаг возможного дубля — candidate | Подтверждение человеком — источник не специфицирует, `OPEN` | Автоматическое слияние/отбраковка без owner-правила — запрещено этим proposal как candidate-инвариант | Не определена источником — `OPEN` | DEVELOPMENT (candidate owner assignment, источник не называет прямо) |
| 5 | Операционная несовместимость | Категория `SOURCE_NORMATIVE` (буквальное название); scope `OPEN` — источник **не** определяет её как любой confirmed hard/soft mismatch и **не** говорит, что LEGAL review никогда не требуется | Не определено источником — `OPEN` | candidate, конкретные признаки не выбраны | Не определено источником — `OPEN` | Использование как proxy операционного риска/кредитоспособности — **precedent, не готовое правило**: Feature Schema реклассифицировала `business_stage_signal` в `EXCLUDED_FROM_V0_1` именно из-за такого proxy-риска до LEGAL+PRODUCT решения (Feature Schema §6.4, Architecture §14.3 условие 4) | Не определена — `OPEN` | Feature Schema (precedent, справочно); `LEGAL` там, где proxy-риск подтверждён |
| 6 | Устаревание | Категория `SOURCE_NORMATIVE`; `STALE`-поведение `SOURCE_NORMATIVE` (§32); Risk factor/score formula и общий TTL `OPEN`, источник их не формулирует | `evidence_status`/`freshness_class` (Feature Schema §8, канонический §13) — candidate mapping | `STALE`-статус, дословно §32: «Профиль устарел → Match становится `STALE`; раскрытие по нему не разрешается» (`SOURCE_NORMATIVE`) | Не определено отдельно для этой категории | Использование stale-профиля как подтверждённого факта | TTL отсутствует в любом источнике — `OPEN`; связано с Architecture §37 №11 (`PRODUCT + LEGAL + AI`, шире) и отдельно с узким открытым решением №6 Feature Schema (`PRODUCT + AI`, через Evaluation Plan) — два разных пункта | Feature Schema (freshness classes) |
| 7 | Повторная идентификация объекта до раскрытия | Категория `SOURCE_NORMATIVE`; detection technique `OPEN`/`DECISION_CANDIDATE_FOR_REVIEW`, не утверждённый механизм | Coarse geography — **один из возможных** input candidates (Feature Schema §7.4), не единственный или обязательный источник | Гипотетический «sparse combinations detector» — candidate технология, established mechanism ни один источник не подтверждает | Численный порог агрегации — `LEGAL`/`PRODUCT`, `OPEN` (Feature Schema №7, Evaluation Plan №9) | Публикация точного адреса/координат как результата Risk (`SOURCE_NORMATIVE` запрет, §9.4, §5 принцип 13) | Не определена — `OPEN` | Feature Schema (открытое решение №7), `SAFE_PRESENTATION_POLICY` |
| 8 | Возможный прежний контакт | Категория `SOURCE_NORMATIVE`; mapping на `previous_contact_analysis_signal` `SOURCE_NORMATIVE` (дословная цитата §31) | `previous_contact_analysis_signal` (Feature Schema §7.2), только неитоговый | «Только сигнал и анализ» (`SOURCE_NORMATIVE`, §31 дословно) | «Итог подтверждает уполномоченный reviewer по доказательствам» (`SOURCE_NORMATIVE`, §31 дословно) | Автоматическое превращение AI-совпадения в доказанный previous contact (`SOURCE_NORMATIVE`, §34.4: 0 случаев) | Freshness `previous_contact_analysis_signal` относительно исходных данных — `OPEN_BLOCKED_PENDING_DECISION`; источник не формулирует | Previous Contact Gate (внешний, исключительно владеет финальным решением, §18.4), `LEGAL` |
| 9 | Возможная связь лиц/обход | Категория `SOURCE_NORMATIVE`, включая формулировку «только как сигнал» (дословно §17) | Не определено источником конкретно | Risk-сигнал, не решение (`SOURCE_NORMATIVE` формулировка) | «Решает сотрудник; взыскание — по LEGAL» (`SOURCE_NORMATIVE`, §31 дословно) | Автоматическое отнесение к «обходу» без review | Не определена численно — `OPEN` | `LEGAL`/reviewer (§31.1) |
| 10 | Аномальное поведение по конкретным проверяемым событиям | Категория `SOURCE_NORMATIVE`, но строго ограничена конкретными проверяемыми событиями (дословно: «относящееся к конкретным проверяемым событиям», не общий behavioral profile); freshness class и detection algorithm `OPEN` | Только события, относящиеся к конкретным проверяемым фактам — `SOURCE_NORMATIVE` ограничение scope | Флаг аномалии по конкретному событию — candidate | Причинная интерпретация аномалии требует review — candidate | Негативный вывод «только из свободного текста, поведенческого предположения или одного непроверенного источника» (`SOURCE_NORMATIVE`, §13 Architecture, дословно) | Класс freshness не утверждён ни одним источником — `OPEN` | Feature Schema (evidence, справочно); Risk Policy само после approval |

---

## 6. Hard Constraint / Risk / Confidence / Qualification boundary

`SOURCE_NORMATIVE` границы:

- подтверждённый Hard Constraint обрабатывается **до** scoring — Architecture §5 принцип 6, §14 этап 3 (Eligibility Filter предшествует Reciprocal Scoring);
- unknown не становится negative — §5 принцип 7, §12.4;
- conflicting/stale/inconclusive не становятся доказанным нарушением — §32 (три разные строки, см. §8 ниже);
- Confidence Score показывает надёжность оценки, а не привлекательность пары; Risk Score — проверяемые факторы, способные снизить реализуемость или потребовать проверки (§16–17, дословный смысл);
- высокий Match Score при низком Confidence Score требует проверки, не может быть представлен как готовый Квалифицированный вариант (§16, дословно);
- risk не компенсирует Hard Constraint (§5 принцип 6 — non-compensation) и не является доказательством нарушения (§17).

**Точная граница с Match Score:** «Match Score объединяет Reciprocal Fit и Deal Feasibility по утвержденной версии весов» (Architecture §15.6, дословно) — Risk Score в эту формулу **не входит**. Отдельный Priority Score **может** учитывать Match Score, Confidence Score и Risk Score вместе для ранжирования (§15.6); все исходные показатели сохраняются и показываются раздельно для аудита. Risk не скрывается внутри формулы Match Score.

Формула взаимодействия Risk/Confidence/Match этим документом не изобретается — `OPEN_BLOCKED_PENDING_DECISION`.

---

## 7. Evidence eligibility, provenance и freshness (концептуально, без DB/API)

Candidate contract (`DECISION_CANDIDATE_FOR_REVIEW`, по аналогии с Feature Schema §3, без изобретения нового поля сверх Architecture §11):

- immutable source/evidence reference;
- source owner/version;
- observed/verified time;
- evidence status (только канонический Architecture §13 enum, без добавлений);
- lawful-basis/purpose eligibility для применимых данных (Architecture §11, единственный writer — Lawful Basis/Consent Registry, §40);
- freshness/revocation/conflict handling;
- rule/policy version/hash;
- reason/explanation reference (см. §11 ниже — namespace open);
- явное различие между fact, inference и human decision (таксономия §2.3).

`SOURCE_NORMATIVE`: AI inference, similarity, anomaly или proxy не становятся confirmed fact автоматически (Architecture §5 принцип 8, §13: «Негативный вывод о стороне не создается только из свободного текста, поведенческого предположения или одного непроверенного источника»). Одного self-report недостаточно там, где Architecture требует verification/human decision (§27.2: «Одностороннее заявление и AI-вывод не становятся истинной меткой автоматически»).

---

## 8. Protected attributes, proxies и prohibited uses

`SOURCE_NORMATIVE`, Architecture §17 — **абсолютный запрет без исключений**: «Risk Score… не должен использовать защищенные признаки или прокси». Дополнительно §5 принцип 11, §30.3 пункт 4 (проверка дискриминационных признаков и прокси перед любым platform-level изменением).

**Роль LEGAL review — не «разрешение после проверки»:**

- LEGAL review определяет, является ли candidate признак protected/proxy;
- отдельно LEGAL review оценивает lawful basis уже подтверждённого **не-protected** источника/use;
- confirmed protected/proxy классификация означает exclusion/block, **не** approval after review;
- lawful basis сам по себе не отменяет architectural ban §17.

Явные прочие запреты (`SOURCE_NORMATIVE`, §17, §5, §6.2, §34.4): Risk Score не кредитный рейтинг; не юридическое доказательство; не санкция; не назначает плательщика; не решает refund/credit; не подтверждает previous contact/related persons/circumvention; не распространяет вывод между пользователями/сегментами без lawful basis и review.

Этот документ **не создаёт** legal fairness standard и не объявляет ни один конкретный признак допустимым.

**Exact address/geography:** остаётся только в защищённом контуре, не появляется в открытых outputs/events/logs (`SOURCE_NORMATIVE`, §9.4, §5 принцип 13). Метод и численный порог re-identification — `OPEN_BLOCKED_PENDING_DECISION` (см. категорию 7, §5 выше).

**Pseudonymized ≠ anonymized** (`SOURCE_NORMATIVE`, §8.4, дословно): «Токенизированные ID, хешированные значения и псевдонимы остаются персональными данными, если LeaseMind… способен восстановить связь с субъектом. Они не считаются обезличенными…» Необратимое обезличивание перед segment-аналитикой требует шести шагов §8.4 (удаление прямых идентификаторов, обобщение/исключение редких комбинаций и точной географии/времени, исключение малых групп, проверка защищённых признаков, документирование метода/версии/даты, разрешение Data Governance) — цитируется без ослабления.

---

## 9. Aggregation/calibration candidates — сравнение, без выбора

`DECISION_CANDIDATE_FOR_REVIEW`, ни один вариант не выбран:

| Вариант | Плюс | Минус / риск компенсации |
| --- | --- | --- |
| (a) Independent per-category flags | Максимальная прозрачность; ни один critical factor не скрыт | Не даёт единого сигнала для routing без отдельного правила Qualification Policy |
| (b) Max/worst-factor precedence | Гарантирует non-compensation (жёсткий фактор не размывается средним) | Может завышать риск при одном шумном факторе |
| (c) Explicit rule-based precedence | Явная, объяснимая логика приоритета | Требует ручного каталога правил, комбинаторно растёт |
| (d) Weighted aggregation | Гибкость калибровки | Требует весов (не вводятся этим документом); риск скрытой компенсации между факторами |
| (e) Multi-dimensional vector | Не сворачивает информацию | Требует, чтобы Qualification Policy умела читать вектор, не число |

Handling missing/conflicting/stale evidence, monotonicity/non-compensation properties, explainability/reason codes, calibration evidence requirements и segment-specific policy prohibition (до отдельного evidence/LEGAL review) рассмотрены как candidate requirements для любого из вариантов выше, не как выбранная формула.

**Разделение audit-требований:** общий audit bundle Architecture §33 (сохранение активных критериев, причин исключения, неизвестных/конфликтующих данных для **любого** расчёта Matching Engine) — `SOURCE_NORMATIVE`, применяется вне зависимости от Risk. То, что именно per-category Risk detail обязан оставаться отдельно видимым и non-compensating (не сворачиваться в единое непрозрачное число), — `DECISION_CANDIDATE_FOR_REVIEW` этого proposal (по аналогии с §5 принципом 6), не отдельная готовая source-норма специально для Risk aggregation.

Ни один weight/formula/threshold/TTL/calibration target не выбран.

---

## 10. Human-review и routing boundary (Architecture §37 №8)

`SOURCE_NORMATIVE` разделение:

- Evaluation Plan владеет процедурой поиска/сравнения candidate thresholds (`MATCHING_EVALUATION_PLAN` §9, не финальный owner);
- Risk Policy после cross-functional approval фиксирует Risk-specific rule/version — не эта memo/proposal;
- Qualification Policy владеет итоговым routing/precedence (`QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING`, §18.1);
- LEGAL определяет, какие факты требуют human/legal decision;
- human reviewer подтверждает критический риск по §31 («Confidence и Risk: автоматически как оценка… критический риск подтверждает сотрудник»), но не меняет policy произвольно — применяет утверждённую policy в пределах приказа/RBAC (§31.1, 7 обязательных пунктов).

**Signal ≠ routing decision.** Risk signal не является routing decision. Approved Risk + Qualification policies **могут** направить signal/risk на verification/human review согласно Architecture §17 (последняя строка: «Высокий риск переводит результат в `HUMAN_REVIEW_REQUIRED` либо `NEEDS_VERIFICATION` по утвержденной политике») — но это не означает, что любой signal обязательно идёт на review, и Risk Policy **не присваивает** самостоятельно ни один из четырёх Qualification routing statuses. Численный/качественный trigger, при котором это происходит, — `OPEN_BLOCKED_PENDING_DECISION`.

Human/legal outcome — отдельный Decision Record; единственный writer мотивированных reviewer decisions — Legal/Decision Service (Architecture §40).

Без automatic promotion результатов evaluation в policy (§34.4: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев»).

---

## 11. Versioning/replay/audit — концептуальный bundle

Concept-level состав (без проектирования storage), согласовано с Architecture §33 (`SOURCE_NORMATIVE` — точный audit-bundle для любого расчёта Matching Engine) и §49 (reproducibility spec):

- risk policy version/hash;
- feature/evidence schema version/hash;
- input/evidence snapshot hashes;
- exact reason/factor set;
- calculation method/version;
- code/build/model digest, где применимо;
- deterministic/recorded replay mode;
- human decision reference — отдельно от расчёта;
- freshness/revocation state на момент расчёта.

`DECISION_CANDIDATE_FOR_REVIEW`: Risk result history не переписывается задним числом; новое evidence/policy создаёт новый calculation/result. Architecture §33 (immutability decision events — «Исходные события не изменяются после решения» относится к юридическим/decision events, не к Risk calculation вообще) и `CAMPAIGN_OUTCOMES.md` §7 (append-only принцип другой сущности, `business_outcome`) — только supporting precedents, не прямая Risk-норма; источник не формулирует append-only/history правило именно для Risk result.

`SOURCE_NORMATIVE`, в точной мере, которую устанавливает Architecture §49: exact replay обязателен для deterministic path; несовпадение — severity-1 defect, блокирует соответствующую версию правил (§49, дословно); недетерминированный компонент не проходит Matching Qualification Gate самостоятельно, используется только как advisory signal до human-confirmed deterministic rule (§49, дословно).

`OPEN_BLOCKED_PENDING_DECISION`: bounded replay tolerance для вероятностного компонента.

**Reason references** (`DECISION_CANDIDATE_FOR_REVIEW`): каждый значимый Risk result должен иметь stable machine-readable reason reference, policy version/hash и evidence reference. Exact namespace, значения, compatibility/change process и owner — `OPEN_BLOCKED_PENDING_DECISION`. Публичный каталог кодов (в т.ч. любой `LM-MATCH-RISK-*`-подобный namespace) не вводится — Feature Schema использует лишь иллюстративный, неутверждённый pattern и не является нормативным источником публичного каталога для Risk.

**Risk output representation.** Канонического `LOW/MEDIUM/HIGH` или иного severity enum не существует ни в одном источнике (проверено repo-wide поиском). Слова Architecture «высокий риск» и «критический риск» — качественные формулировки источника, цитируются как текст, не как enum-значения или thresholds. Разрешён только design-time candidate table с внутренними рабочими обозначениями десяти категорий §5 этого документа — **не** public/runtime registry. Нужность и форма machine identifiers (включая `risk_category_id`) — `OPEN_BLOCKED_PENDING_DECISION`.

---

## 12. Gates и acceptance boundary

Различены (`SOURCE_NORMATIVE` структура, Architecture §36):

1. Risk Policy proposal reviewed — cross-functional review этого документа;
2. Risk calculation reproducible — техническая воспроизводимость (DEVELOPMENT evidence);
3. Candidate threshold evaluation complete — Evaluation Plan procedure evidence;
4. Exact Risk Policy approved — отдельное cross-functional решение, не эта memo;
5. Qualification Policy approved — отдельный артефакт;
6. `IMPLEMENTATION_READINESS_GATE` / `SYNTHETIC_ACCEPTANCE_GATE` / `PRODUCTION_LAUNCH_GATE` — Architecture §36.

Успех ранней стадии не открывает следующую. Ни одна стадия выше не достигнута этим документом.

**Synthetic ≠ production evidence.** `SOURCE_NORMATIVE`: конкретные PRODUCT exclusions synthetic outcomes/records из real statistics/training/calibration (`CAMPAIGN_OUTCOMES.md` `CO-C-019`, `ANALYSIS_SNAPSHOT.md` `AS-C-019/025`); Matching synthetic-only boundaries и gate statuses (Architecture §36, §50 `NON_PRODUCTION_SAFETY_PROFILE`). Фраза «Synthetic Risk evaluation не является production calibration/readiness evidence» — `DECISION_CANDIDATE_FOR_REVIEW`, поддержанная указанными precedents, не выдана за дословную Risk-специфичную норму.

Controlled-set manifest этим документом не синхронизируется.

### Итоговый статус gates

- `IMPLEMENTATION_READINESS_GATE`: **`BLOCKED`**
- `SYNTHETIC_ACCEPTANCE_GATE`: **`BLOCKED`**
- `PRODUCTION_LAUNCH_GATE`: **`BLOCKED`**

Architecture §37 вопрос №8 остаётся **`OPEN`**.

---

## 13. Open decisions

| № | Вопрос | Owner | Блокирует |
| --- | --- | --- | --- |
| 1 | Risk output representation / runtime-public identifiers или enum (включая `risk_category_id`, если он переходит из design-time table в runtime/public форму) | `Chief AI Architect + AI` — candidate assignment; источник не назначает owner этого решения напрямую | Explainability, `SAFE_PRESENTATION_POLICY` совместимость |
| 2 | Aggregation formula/precedence (выбор из §9) | `Chief AI Architect + AI` — candidate assignment; источник не назначает owner этого решения напрямую | Risk Score arithmetic |
| 3 | Per-factor evidence sufficiency для каждой из 10 категорий (§5) | `AI + LEGAL` — candidate assignment; источник не назначает owner этого решения напрямую | Automatic signal vs required human confirmation boundary |
| 4 | Численные human-review thresholds | `AI + LEGAL` (Architecture §37 №8, `SOURCE_NORMATIVE` owner) | `IMPLEMENTATION_READINESS_GATE`, Qualification/Launch |
| 5 | Calibration dataset/metrics/segments для Risk | `AI + DEVELOPMENT`, через `MATCHING_EVALUATION_PLAN` — candidate assignment; источник не назначает owner этого решения напрямую | Model release |
| 6 | Точные operational details для missing/conflicting/stale (§4.5/§8, при сохранении трёх разных source behaviors) | `AI + DEVELOPMENT` — candidate assignment; источник не назначает owner этого решения напрямую | Risk calculation reproducibility |
| 7 | Reason-reference namespace/values/compatibility-change process/owner | Chief AI Architect + AI, в координации с будущим Qualification routing owner (candidate assignment, не единолично артефакт `MATCHING_QUALIFICATION_POLICY`) | Qualification routing explainability |
| 8 | Reviewer authority и Decision Record link per risk class | `Chief AI Architect + LEGAL` — candidate assignment; источник не назначает owner этого решения напрямую | §31.1 применение к Risk-specific ролям |
| 9 | Protected/proxy classification catalog и lawful basis per допустимому non-protected feature | `LEGAL + PRODUCT` — candidate assignment; источник не назначает owner этого решения напрямую | Discrimination/bias diagnostics (пересекается с Feature Schema №14, Evaluation Plan №14) |
| 10 | Re-identification method/threshold | `PRODUCT + LEGAL` (+ `DEVELOPMENT` для измеримости) — candidate assignment; источник не назначает owner этого решения напрямую | Segment/geography risk category (Feature Schema №7, Evaluation Plan №9) |
| 11 | Bounded replay tolerance при вероятностном компоненте | `DEVELOPMENT + AI` — candidate assignment; источник не назначает owner этого решения напрямую | Replay/determinism acceptance (Evaluation Plan №10) |
| 12 | Точный интерфейс Risk output → Qualification routing | Chief AI Architect + AI (+ DEVELOPMENT для feasibility) — candidate assignment, источник не называет владельца интерфейса напрямую | Implementation boundary |
| 13 | Owner/authority механизма duplication detection (категория 4) | `DEVELOPMENT + AI` — candidate assignment, источник не называет владельца напрямую | Risk category §17 реализуемость |
| 14 | Численный TTL для «устаревание» (категория 6) — разведены Architecture §37 №11 (`PRODUCT + LEGAL + AI`, шире) и узкое открытое решение №6 Feature Schema (`PRODUCT + AI`, через Evaluation Plan) | `PRODUCT + LEGAL + AI` (§37 №11) / `PRODUCT + AI` (Feature Schema №6) — не выбирается здесь | Freshness-based risk signal |

Список не закрывается произвольно. В каждой из 14 строк owner либо имеет прямую source-ссылку (№4 — Architecture §37 №8; №14 — Architecture §37 №11 и отдельно Feature Schema открытое решение №6, разведены, не объединены в один owner), либо явно помечен как candidate assignment (№1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13) — источник не назначает owner этого решения напрямую.

---

## 14. Acceptance criteria (`MRP-C-001`–`MRP-C-018`)

#### `MRP-C-001` — `LOW/MEDIUM/HIGH` не изобретён; качественные слова ≠ enum
**Given:** документ описывает Risk output и цитирует качественный язык Architecture («высокий риск», «критический риск», §17/§31). **When:** запрашивается category enum. **Then:** ни один канонический enum не утверждён ни одним источником; «высокий»/«критический» остаются качественными формулировками, не enum-значениями/thresholds; runtime representation — `OPEN_BLOCKED_PENDING_DECISION` (открытое решение №1).

#### `MRP-C-002` — signal не становится fact/sanction/rejection, но approved policies могут направить его на review
**Given:** Risk category даёт сигнал (включая anomaly/similarity/proxy-подобный вход). **When:** формируется вывод. **Then:** сигнал сам по себе не становится доказанным фактом, санкцией или отказом; approved Risk + Qualification policies могут направить сигнал на verification/human review (§17, последняя строка), но это не превращает сигнал в подтверждённый факт (§17: «не является доказательством нарушения»).

#### `MRP-C-003` — previous-contact signal не признан фактом
**Given:** Matching Engine производит `previous_contact_analysis_signal`. **When:** используется downstream. **Then:** остаётся «только сигналом и анализом»; итог подтверждает только уполномоченный reviewer (§31, дословно).

#### `MRP-C-004` — distinct behavior для missing, conflicting и stale без negative-label collapse
**Given (часть 1 — missing/unknown):** evidence отсутствует. **When:** вычисляется Risk. **Then:** не negative; может вести к `NEEDS_VERIFICATION` в точном контексте источника (§5 принцип 7, §12.4, §32).
**Given (часть 2 — conflicting):** источники противоречат. **When:** вычисляется Risk. **Then:** версии сохраняются, Confidence снижается, human review при критичности (§32, дословно).
**Given (часть 3 — stale):** профиль устарел. **When:** вычисляется Risk. **Then:** Match становится `STALE`, раскрытие запрещено (§32, дословно).
**Then (все три части):** ни один случай не становится proved violation/negative label; Risk Policy не заменяет три разных source behavior одним универсальным routing rule.

#### `MRP-C-005` — Risk и Confidence разделены
**Given:** Match имеет одновременно Risk Score и Confidence Score. **When:** формируется explanation. **Then:** оба сохраняются и показываются раздельно для аудита (§15.6, §5 принцип 9); ни один не подменяет другой.

#### `MRP-C-006` — Risk не скрыто подмешан в Match arithmetic
**Given:** расчёт Match Score. **When:** Risk Score вычислен. **Then:** «Match Score объединяет Reciprocal Fit и Deal Feasibility по утвержденной версии весов» (§15.6, дословно) — Risk Score в эту формулу не входит; отдельный Priority Score может учитывать Match/Confidence/Risk вместе для ранжирования (§15.6), но все показатели остаются раздельно видимыми.

#### `MRP-C-007` — Risk Policy не присваивает Qualification routing
**Given:** Risk Policy предлагает qualitative escalation invariant. **When:** формируется финальный routing status. **Then:** конкретное правило map risk→routing принадлежит `MATCHING_QUALIFICATION_POLICY` (§18.1), не Risk Policy; Risk Policy поставляет только Risk output как input.

#### `MRP-C-008` — reviewer применяет approved policy, не меняет threshold ad hoc
**Given:** reviewer подтверждает критический риск (§31). **When:** reviewer принимает решение. **Then:** reviewer применяет утверждённую policy в пределах приказа/RBAC (§31.1), не изменяет численный threshold самостоятельно.

#### `MRP-C-009` — абсолютный запрет protected/proxy; правильная роль LEGAL review
**Given:** risk category потенциально использует признак, который может быть protected attribute или hidden proxy. **When:** признак рассматривается для использования в Risk Score. **Then:** если признак подтверждён как protected/proxy — исключён безусловно (§17, без исключений); LEGAL review не «разрешает» protected attribute — определяет (a) является ли признак protected/proxy и отдельно (b) допустим ли уже подтверждённый **не-protected** признак/источник/use по lawful basis; lawful basis сам по себе не отменяет ban §17; никакой legal fairness standard не создаётся.

#### `MRP-C-010` — geography — candidate, метод/threshold re-identification не изобретён
**Given:** risk-категория «повторная идентификация» рассматривает возможный input. **When:** формируется diagnostic. **Then:** coarse geography — один из возможных input candidates (Feature Schema §7.4), не обязательный механизм; любая detection technique — `DECISION_CANDIDATE_FOR_REVIEW`/`OPEN`, не established mechanism; численный threshold не изобретается; protected-contour запрет сохраняется без ослабления.

#### `MRP-C-011` — self-report не становится ground truth
**Given:** единственный источник — self-report стороны. **When:** оценивается достаточность evidence. **Then:** одного self-report недостаточно там, где Architecture требует verification/human decision (§27.2).

#### `MRP-C-012` — outcome correlation ≠ causation; Paused и corrected/superseded outcomes не создают leakage
**Given:** Risk calibration ссылается на outcome history через `MATCHING_EVALUATION_PLAN`. **When:** формируется calibration evidence. **Then:** корреляция не представляется как причинность; `Paused` не используется как terminal outcome (`CO-C-004`); superseded/corrected записи обрабатываются по правилам `CAMPAIGN_OUTCOMES.md`/Evaluation Plan (`CO-C-016/019/026`, Evaluation Plan §5.3–5.4), не переопределяются заново этим Risk Policy.

#### `MRP-C-013` — synthetic-to-production правило честно классифицировано как candidate
**Given:** Risk calibration построена на synthetic dataset (Evaluation Plan §3, категории 1–4). **When:** формулируется заключение о production readiness. **Then:** заключение не делается — это `DECISION_CANDIDATE_FOR_REVIEW` правило, поддержанное `SOURCE_NORMATIVE` фактами `CO-C-019`/`AS-C-019/025` и synthetic-only границами (§36, §50), не буквальная Risk-специфичная норма; согласовано с Evaluation Plan `MEP-C-001`.

#### `MRP-C-014` — нет invented Risk weights/thresholds/TTL
**Given:** любой раздел документа. **When:** выполняется поиск конкретного числа. **Then:** ни один invented численный weight/threshold/TTL для Risk calibration/aggregation не найден вне явно помеченного `OPEN_BLOCKED_PENDING_DECISION`; уже существующие source-normative числа из других разделов Architecture (например, §34.1 0%-инварианты про unknown-as-negative) допустимо цитировать только как внешние поведенческие инварианты, не как Risk calibration target.

#### `MRP-C-015` — общий audit bundle отделён от candidate per-category visibility
**Given:** выбран любой aggregation candidate (§9). **When:** формируется итоговый Risk output. **Then:** общий audit-bundle §33 (`SOURCE_NORMATIVE`) уже требует сохранения активных критериев/причин исключения/конфликтов для любого расчёта Matching Engine — не специфично для Risk; то, что именно per-category Risk detail обязан оставаться non-compensating и видимым, — `DECISION_CANDIDATE_FOR_REVIEW`, не отдельная готовая source-норма для Risk aggregation.

#### `MRP-C-016` — non-deterministic external component не проходит gate самостоятельно
**Given:** внешний вероятностный компонент участвует в Risk. **When:** оценивается допуск к Matching Qualification Gate. **Then:** компонент не проходит gate самостоятельно, используется как advisory signal до human-confirmed deterministic rule (§49, дословно).

#### `MRP-C-017` — evaluation не обновляет runtime policy автоматически
**Given:** Risk Policy candidate threshold найден через `MATCHING_EVALUATION_PLAN`. **When:** evaluation завершён. **Then:** runtime rules не меняются автоматически (§34.4: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев»; согласовано с Evaluation Plan `MEP-C-014/018`).

#### `MRP-C-018` — Safe Presentation использует Risk-related classification как input, не владеет Risk; SLO/Cost вне scope
**Given:** presentation-правило или operational metric рассматривается в контексте Risk. **When:** формируется scope документа. **Then:** `SAFE_PRESENTATION_POLICY` не подменяется Risk Policy: может использовать Risk-related classification как input для собственного presentation-решения, но не вычисляет и не владеет Risk calculation; SLO/Cost (§51/§54) остаются `OUT_OF_SCOPE`.

---

## 15. DoD и последствия

Настоящий документ:

- пригоден только для cross-functional review (AI + LEGAL + PRODUCT + DEVELOPMENT, по применимости каждого раздела);
- не закрывает Architecture §37 вопрос №8 — остаётся `OPEN`;
- не переводит `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE` в иной статус — все три `BLOCKED`;
- не синхронизирует Controlled Artifact Manifest — запись `MATCHING_RISK_POLICY` не добавляется до реального утверждения;
- не содержит ни одного численного Risk weight/threshold/TTL/calibration target, ни одного выбранного aggregation algorithm, ни одного public/runtime enum или reason-code каталога;
- не ослабляет protected/proxy prohibition Architecture §17 ни в каком виде;
- не разрешает и не инициирует implementation, model release, реальные данные или production launch;
- не изменяет ни один существующий файл, включая Architecture, Feature Schema, Evaluation Plan, Data Contracts, controlled-set artifacts, любой PR.
