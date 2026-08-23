# LeaseMind MATCHING_SCORING_POLICY

**Версия:** 0.1
**Дата:** 2026-08-23
**Статус:** `Proposal for cross-functional review — does not authorize implementation`
**Artifact owner:** `Chief AI Architect + PRODUCT` — `SOURCE_NORMATIVE`, Architecture §52 (Controlled Artifact Manifest, обе строки, привязанные к этому артефакту: вопрос №2 «`MATCHING_SCORING_POLICY` с Mutual Aggregate» и вопрос №3 «Та же policy с весами и сегментными порогами», обе — owner `Chief AI Architect + PRODUCT`, «Launch/implementation blocker»).
**Decision owner вопросов №2/№3 (Architecture §37, дословно):** `AI + PRODUCT` — `SOURCE_NORMATIVE`; это отдельная owner-грань (кто принимает конкретное решение по существу вопроса), не тождественная artifact owner выше (кто владеет самим артефактом в Controlled Artifact Manifest) — обе цитируются раздельно, не сливаются в одну формулировку.
**DEVELOPMENT review** для reproducibility/technical feasibility — `DECISION_CANDIDATE_FOR_REVIEW`; источник не назначает DEVELOPMENT единоличным owner'ом ни одного Scoring-решения.

**This proposal does not authorize implementation, runtime/API/schema changes, model release, synthetic acceptance, production use, calibrated weights, approved Mutual Aggregate function, real personal data, automated policy promotion, or any gate.**

Architecture §37 вопросы №2 и №3 остаются `OPEN` до cross-functional approval и требуемой evaluation evidence. Документ их не закрывает.

**Связанные документы:** `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` (полностью, включая §§5, 8–18, 24, 25, 30–38, 42, 49–53), `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` (прочитан полностью до EOF в рамках предыдущих задач этой сессии; независимо перепроверен на предмет scoring-специфичных терминов — см. §9 ниже), `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` (Proposal-зависимость), `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` (Proposal-зависимость, threshold-search procedure), `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` (Proposal-зависимость, Risk output boundary), `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` (Proposal-зависимость, routing boundary), `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md` (только как источник границы с отдельной pre-launch analysis системой — `deal_probability_30d`/Confidence Engine, не Matching Engine), `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_EIGHTH.md` (только DEVELOPMENT evidence о Data Contracts hash-верификации, не источник новых governance-решений).

---

## 1. Metadata и нормативная дисциплина

Каждое существенное утверждение этого документа помечено одним из статусов:

- `SOURCE_NORMATIVE` — прямо установлено источником, цитируется/пересказывается без ослабления;
- `DECISION_CANDIDATE_FOR_REVIEW` — предлагаемая этим Proposal конструкция, требует решения owner'ов, не утверждена;
- `NEUTRAL_EVALUATION_BASELINE` — reference/null baseline для будущей evaluation-процедуры; **не** runtime policy и **не** calibration; не используется для qualification/routing;
- `OPEN_BLOCKED_PENDING_DECISION` — источников недостаточно, вопрос требует отдельного решения owner'а;
- `OUT_OF_SCOPE` — принадлежит другому артефакту или gate.

**Merged Proposal не становится normative только из-за merge.** `MATCHING_FEATURE_SCHEMA_v0.1.md`, `MATCHING_EVALUATION_PLAN_v0.1.md`, `MATCHING_RISK_POLICY_v0.1.md` и `MATCHING_QUALIFICATION_POLICY_v0.1.md` имеют статус `Proposal`, не `APPROVED`. Их собственные additions цитируются как precedent/candidate, не как source. Source-нормативны только положения, которые эти Proposal-документы корректно и без ослабления цитируют из буквального текста Architecture — и тогда этот документ цитирует Architecture напрямую.

Proposal не называется утверждённым нигде в этом документе, включая acceptance criteria (см. `MSP-C-020`). Artifact owner, decision owner (§37), service writer (§40) и reviewer (§31.1) — четыре разные роли; ни одна не подменяет другую.

---

## 2. Ownership и boundary matrix

| Артефакт/роль | Владеет | Не владеет |
|---|---|---|
| `MATCHING_SCORING_POLICY` (этот документ) | Match/Reciprocal/Dimension score arithmetic, Mutual Aggregate candidate comparison, weight structure (без утверждённых значений), precision/replay requirements для scoring-компонент | Feature/Hard Constraint definitions; Confidence Score modeling; Risk categories; Qualification routing; presentation/disclosure правила; юридические/payment/AML решения |
| `MATCHING_FEATURE_SCHEMA` (Proposal) | Какие feature/facts существуют, их evidence/freshness/applicability, `Feature Fit`-интерфейс `[0,1]` (без калибровки) | Веса, арифметику Dimension/Match Score, Risk, routing |
| `MATCHING_RISK_POLICY` (Proposal) | Risk categories, evidence eligibility для Risk, human-review escalation boundary для Risk | Match/Reciprocal/Dimension arithmetic |
| `MATCHING_QUALIFICATION_POLICY` (Proposal) | Итоговый routing в `QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING` (§18.1), Eligibility/Hard Constraint boundary, thresholds для Gate-условий (включая «допустимый Confidence Score», «достаточность mutual fit») | Score arithmetic, Risk categories, список признаков |
| `MATCHING_EVALUATION_PLAN` (Proposal) | Dataset/label/metric procedure, threshold-search discipline (tuning/final separation), evidence package для approval | Финальные значения весов/функций — выход процедуры фиксируется в Scoring Policy, не в Evaluation Plan |
| `SAFE_PRESENTATION_POLICY` (не создан) | Какие поля/объяснения безопасно показать пользователю | Вычисление score, владение arithmetic |
| LEGAL | Юридически значимые выводы; согласование затронутых правил на этапе `PRODUCT/LEGAL` в §30.3 | Score arithmetic |
| PRODUCT | Совместно с Chief AI Architect — artifact owner (§52); участник decision пути §37 №2/№3 (`AI + PRODUCT`) | Единоличное утверждение веса/функции без AI-стороны |
| Chief AI Architect | Review новой версии весов/модели (§30.3 п.6); координация approval | Единоличное утверждение без PRODUCT/LEGAL согласования (§30.3 п.7) |
| Matching Engine | Единственный writer расчёта Match, включая Dimension/Reciprocal/Match Score (Architecture §40) | Кампания, стратегия, плательщик (§5 принципы 3–4); **не** owner ни одного policy-решения этого документа — technical writer role отделена от decision-owner role (см. §12, открытое решение №18) |
| DEVELOPMENT | Reproducibility/technical feasibility — `DECISION_CANDIDATE_FOR_REVIEW`, источник не назначает прямо | Смысл weight/aggregate решений |

**Owner rules.** Любое назначение owner, не заданное источником напрямую, помечено `candidate` либо `OPEN`. Writer/service identity (Matching Engine, Legal/Decision Service и т.п.) нигде в этом документе не используется как owner policy-решения — только как технический system-of-record writer (Architecture §40), отдельная грань.

**Отсутствие циклической зависимости.** Scoring Policy может оцениваться против versioned candidate bundles Feature Schema/Risk Policy/Qualification Policy до их утверждения — `DECISION_CANDIDATE_FOR_REVIEW`. Evaluation Plan производит evidence для последующего cross-functional approval — не заменяет и не продвигает его автоматически (§34.4 Architecture: «Автоматическое изменение продуктивных правил по результатам обучения — 0 случаев»; §30.3, запрет «автоматическое изменение глобальных весов»).

---

## 3. Каноническая scoring taxonomy

Все термины ниже — `SOURCE_NORMATIVE` по названию и роли (Architecture §15, §16, §17, §24), кроме отдельно помеченных. Ни один design-time термин не превращается этим документом в public/runtime enum.

| Термин | Источник | Роль | Статус |
|---|---|---|---|
| Feature Fit | §15.4 (компонент формулы) | Соответствие одного признака одному критерию | `SOURCE_NORMATIVE` как компонент формулы; интерфейс `[0,1]` без калибровки — `DECISION_CANDIDATE_FOR_REVIEW`, Feature Schema §1.2 (Proposal, не Architecture) |
| Evidence Confidence (на уровне feature/value) | §15.4 (компонент формулы) | Надёжность конкретного значения, используется как множитель в Dimension Score | `SOURCE_NORMATIVE` как компонент формулы; калибровка/mapping от `evidence_status` — `OPEN` (§12, открытое решение №6) |
| Dimension Score | §15.4, дословная формула | Нормализованная оценка одного измерения (Tenant Fit / Owner Fit / Deal Feasibility) | `SOURCE_NORMATIVE` |
| Tenant Fit Score | §15.1 | Соответствие помещения подтверждённым требованиям арендатора | `SOURCE_NORMATIVE` |
| Owner Fit Score | §15.2 | Соответствие арендатора подтверждённым требованиям собственника | `SOURCE_NORMATIVE` |
| Deal Feasibility Score | §15.3 | Возможность перейти к просмотру/сделке, без утверждения самой сделки | `SOURCE_NORMATIVE` |
| Reciprocal Fit | §15.5, дословная формула `Reciprocal Fit = Mutual Aggregate(Tenant Fit, Owner Fit)` | Взаимный балл | `SOURCE_NORMATIVE` структура; конкретная Mutual Aggregate функция — `OPEN` (§5 ниже) |
| Match Score | §15.6 | Reciprocal Fit + Deal Feasibility по утверждённой версии весов | `SOURCE_NORMATIVE` структура; веса — `OPEN` (§6 ниже) |
| Confidence Score (общий) | §16 | Надёжность оценки в целом (профиль помещения / профиль спроса / взаимное соответствие / конкретный вывод / Match Package) — отдельно от привлекательности пары | `SOURCE_NORMATIVE`; **не то же самое**, что Evidence Confidence на уровне feature (§7 ниже) |
| Risk result/score | §17 | Проверяемые факторы, способные снизить реализуемость/потребовать проверки; 10 категорий | `SOURCE_NORMATIVE`; полностью `OUT_OF_SCOPE` для этого документа — владеет `MATCHING_RISK_POLICY` |
| Priority/Ranking signal | §15.6 («может использоваться отдельный Priority Score, учитывающий Match Score, Confidence Score и Risk Score»); §24 (Ранжирование и диверсификация) | Опциональный сигнал для внутреннего ранжирования, не для итогового Match Score | `SOURCE_NORMATIVE`, что он **опционален** и раздельно виден для аудита; сама формула Priority Score — `OPEN` (§12, открытое решение №11) |

`deal_probability_30d` (`CAMPAIGN_TECHNICAL_ASSIGNMENT.md`, «Confidence Engine» / Pricing-Competition Analyzer) — `OUT_OF_SCOPE`: отдельная pre-launch analysis система, не Matching Engine Reciprocal Scoring; используется другими анализаторами до запуска Campaign, не этим документом.

---

## 4. Source-normative arithmetic

Точная формула (`SOURCE_NORMATIVE`, дословно §15.4):

```
Dimension Score = сумма(Feature Fit × Feature Weight × Evidence Confidence) / сумма активных весов
```

Пять правил ниже — `SOURCE_NORMATIVE`, без ослабления:

1. **Отсутствующее значение не становится нулём.** «Отсутствующее значение исключается из числителя и знаменателя и отдельно учитывается в Confidence Score» (§15.4, дословно).
2. **Hard Constraint обрабатывается до scoring.** «Подтвержденное нарушение Hard Constraint обрабатывается до скоринга» (§15.4, дословно); согласовано с §5 принципом 6 (non-compensation — жёсткое ограничение не компенсируется высоким баллом) и §14 (Eligibility Filter, этап 3, предшествует Reciprocal Scoring, этап 5).
3. **Неизвестное не является отрицательным.** «Неизвестное значение не считается отрицательным.» (§5 принцип 7, дословно) — `SOURCE_NORMATIVE`.
4. **Tenant Fit, Owner Fit и Deal Feasibility считаются раздельно.** §14 этап 5: «Отдельно рассчитываются: Tenant Fit Score; Owner Fit Score; Deal Feasibility Score».
5. **Confidence и Risk считаются отдельно от Match.** §14 этап 6: «Отдельно рассчитываются: Confidence Score; Risk Score и категории риска; чувствительность результата к неизвестным данным»; §5 принцип 9: «Match Score, Confidence Score и Risk Score являются разными показателями».

**Runtime representation не утверждается.** Точный decimal/float representation, precision и rounding formula для `Feature Fit × Feature Weight × Evidence Confidence` не определены ни одним источником — `OPEN_BLOCKED_PENDING_DECISION` (§9, §12 открытое решение №7). Этот документ не изобретает представление, отсутствующее в источниках.

---

## 5. Mutual Aggregate — сравнение и candidate

`Reciprocal Fit = Mutual Aggregate(Tenant Fit, Owner Fit)` — `SOURCE_NORMATIVE` структура (§15.5). Требование к функции — `SOURCE_NORMATIVE`, дословно: «Mutual Aggregate должен штрафовать односторонние совпадения. Очень высокий Tenant Fit не может скрыть критически низкий Owner Fit, и наоборот. Конкретная функция — гармоническая или геометрическая — фиксируется в версионируемой Scoring Policy после оценки на пилотных данных» (§15.5). Architecture §37 вопрос №2 остаётся `OPEN`: «Какая точная функция Mutual Aggregate используется в пилоте: гармоническая или геометрическая?», owner решения `AI + PRODUCT`.

### 5.1. Сравнение двух кандидатов на `[0,1]`

Оба варианта — `DECISION_CANDIDATE_FOR_REVIEW`, ни один не выбран:

**Harmonic:** `H(a,b) = 0`, если `a = 0` или `b = 0`; иначе `H(a,b) = 2ab / (a+b)`.
**Geometric:** `G(a,b) = √(a×b)`.

| Свойство | Harmonic `H(a,b)` | Geometric `G(a,b)` |
|---|---|---|
| Symmetry | `H(a,b) = H(b,a)` — симметрична | `G(a,b) = G(b,a)` — симметрична |
| Monotonicity на `[0,1]` | Монотонно неубывающая по каждому аргументу при фиксированном другом | Монотонно неубывающая по каждому аргументу при фиксированном другом |
| Zero/near-zero behavior | При `a=0` или `b=0` — ровно `0` (явно задано определением задания, без деления на ноль при `a+b=0`) | При `a=0` или `b=0` — ровно `0` (`√0 = 0`) |
| Anti-masking (штраф за дисбаланс) | Известное математическое свойство: `H(a,b) ≤ G(a,b)` для любых `a,b ≥ 0`, равенство только при `a=b`. Harmonic сильнее штрафует дисбаланс | Штрафует дисбаланс слабее, чем harmonic, но сильнее, чем простое среднее (arithmetic mean, не рассматриваемое как candidate) |
| Interpretability | Интерпретация «слабое звено определяет результат» — распространена в бизнес-метриках (например, F-score); интуитивно ближе к формулировке §15.5 «не может скрыть критически низкий» | Интерпретация «геометрическое среднее» менее интуитивна для нетехнической аудитории, хотя тоже штрафует дисбаланс |
| Rounding/replay implications | Только рациональная арифметика (умножение, сложение, деление) — не требует извлечения корня; для repeatable fixed-point арифметики это структурно проще, чем `√` | Требует извлечения квадратного корня — потенциально иррациональный результат даже для рациональных `a,b`; требует явно зафиксированного `sqrt`-алгоритма и rounding checkpoint для bit-exact replay (§49) |

**Adversarial examples (иллюстрация anti-masking, не pilot evidence):**

| `a` (Tenant Fit) | `b` (Owner Fit) | `H(a,b)` | `G(a,b)` | Наблюдение |
|---:|---:|---:|---:|---|
| 1.0 | 0.1 | 0.1818… | 0.3162… | Harmonic сильнее штрафует одностороннее совпадение |
| 0.9 | 0.05 | 0.0947… | 0.2121… | При росте дисбаланса разрыв между `H` и `G` увеличивается |
| 0.5 | 0.5 | 0.5 | 0.5 | При равенстве `a=b` обе функции совпадают (`H(a,a)=G(a,a)=a`) |

Эти три строки — иллюстративные вычисления по определению задания, `NON_NORMATIVE_EVALUATION_CANDIDATE`: демонстрируют математическое свойство `H ≤ G`, не являются pilot evidence, dataset-based benchmark или калибровкой.

### 5.2. Verdict

Harmonic mean допустимо **рекомендовать** только как `DECISION_CANDIDATE_FOR_REVIEW` для synthetic evaluation — сильнее соответствует буквальному требованию §15.5 «не может скрыть критически низкий» и структурно проще для deterministic replay (без `sqrt`). Ни harmonic, ни geometric не называются этим документом production-calibrated, approved или pilot-selected. Architecture §37 №2 остаётся `OPEN` до cross-functional approval (owner `AI + PRODUCT`) и evaluation evidence (Evaluation Plan §6.3).

---

## 6. Weights и Match Score

`SOURCE_NORMATIVE`, дословно §15.6: «Match Score объединяет Reciprocal Fit и Deal Feasibility по утвержденной версии весов». Источник не задаёт ни конкретные значения весов, ни их число сверх этих двух компонент.

- **Стартовые/segment weights не изобретаются.** Architecture §37 вопрос №3 остаётся `OPEN`: «Какие стартовые веса и минимальные пороги применяются по сегментам?», owner решения `AI + PRODUCT` (§37), artifact owner `Chief AI Architect + PRODUCT` (§52).
- **Равные веса — только `NEUTRAL_EVALUATION_BASELINE`.** Пример: `w(Reciprocal Fit) = 0.5`, `w(Deal Feasibility) = 0.5`, сумма `= 1`. Это reference/null model для будущего сравнения candidate alternatives в Evaluation Plan (§6.3) — **не** используется для qualification/routing и не является рекомендацией.
- **Segment-specific overrides запрещены** до отдельной утверждённой версии с evidence и approval (§30.3: запрещено «автоматическое изменение глобальных весов»; согласование PRODUCT/LEGAL и review Chief AI Architect обязательны перед любым выпуском новой версии весов).
- **Ни одно число не фиксируется как threshold.** `0.60`, `0.50`, `0.40`, `0.30`, `40%` и любые другие конкретные числа этим документом не используются как qualification/risk/completeness/presentation/gate threshold. Если для sensitivity grid в будущей evaluation-процедуре потребуются числа — они помечаются `NON_NORMATIVE_EVALUATION_CANDIDATE` и явно не связываются с каноническими Match/Qualification/Risk результатами.

Architecture §37 вопрос №3 остаётся `OPEN`.

---

## 7. Missing / conflicting / stale / rejected evidence

Согласовано с Feature Schema, Risk Policy и Qualification Policy (все — Proposal, цитируются как corroborating precedent, не самостоятельный source):

- **missing/unknown ≠ zero/negative** — `SOURCE_NORMATIVE`, §5 принцип 7, §15.4 (исключение из числителя/знаменателя), Feature Schema §5.2 (`value_state = NOT_APPLICABLE`/`UNKNOWN`, ни один не даёт `PASS`/`FAIL`);
- **conflicting/stale/rejected/`HUMAN_REVIEW_REQUIRED`** (канонические `evidence_status`, §13 Architecture) **не сворачиваются тихо в обычный score**: `SOURCE_NORMATIVE`, §32 — «Источники противоречат → Сохраняются версии; снижается уверенность; human review при критичности», «Профиль устарел → Match становится `STALE`; раскрытие по нему не разрешается»; эти behaviors — Match/Confidence-уровня, не арифметическая нормализация внутри Dimension Score;
- **Feature-level eligibility и общий Confidence — не один и тот же показатель.** Eligibility (Hard Constraint / Eligibility Filter, §14 этап 3) определяет допустимость пары **до** scoring и принадлежит Feature Schema/Qualification Policy; Confidence Score (§16) — надёжность оценки **после** scoring, отдельный показатель с собственными восемью факторами (полнота критических полей, качество/независимость источников, свежесть, статус верификации, отсутствие конфликтов, устойчивость ранга, согласованность методов, историческая калибровка);
- **Evidence Confidence в Dimension Score не заменяет и не дублирует общий Confidence Score.** Evidence Confidence (компонент формулы §15.4) — множитель **одного** признака в **одном** измерении; общий Confidence Score (§16) — агрегированный показатель по профилю/спросу/взаимному соответствию/выводу/Match Package в целом. Использование заниженного Evidence Confidence внутри Dimension Score **и** отдельного снижения общего Confidence Score за то же самое основание не создаёт скрытого двойного наказания только при условии, что оба расчёта используют раздельные, явно документированные inputs — точный механизм предотвращения double-counting не специфицирован ни одним источником и остаётся `OPEN_BLOCKED_PENDING_DECISION` (§12, открытое решение №6);
- **Routing consequences — не Scoring Policy.** Точные последствия (переход в `NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING`, precedence между причинами) остаются владением `MATCHING_QUALIFICATION_POLICY` (§18.1) и `MATCHING_RISK_POLICY` — этот документ поставляет только score-level inputs, не routing decision.

---

## 8. Hard Constraints и precedence boundary

Ниже — предлагаемая последовательность этапов, **регруппировка** уже существующего конвейера §14 Architecture (`SOURCE_NORMATIVE` порядок этапов) для целей этой boundary-таблицы — сама регруппировка в семь пунктов является `DECISION_CANDIDATE_FOR_REVIEW` изложением, не новым source-normative порядком:

| № | Этап | Source-normative основание | Владелец |
|---|---|---|---|
| 1 | Request/version validation | §14 этап 1 (Request Validation) | Matching Engine, technical |
| 2 | Feature Schema applicability/evidence checks | §14 этап 2 (Normalization); Feature Schema §3–§5 (Proposal) | `MATCHING_FEATURE_SCHEMA` |
| 3 | Hard Constraint/Eligibility до scoring | §14 этап 3 (Eligibility Filter), явно предшествует этапу 5; §5 принцип 6 (non-compensation) | `MATCHING_FEATURE_SCHEMA`/`MATCHING_QUALIFICATION_POLICY` |
| 4 | Scoring arithmetic | §14 этап 5 (Reciprocal Scoring) | **`MATCHING_SCORING_POLICY`** (этот документ) |
| 5 | Отдельные Confidence и Risk | §14 этап 6 (Confidence and Risk) | `MATCHING_RISK_POLICY` + Confidence modeling (§16, owner не назначен ни одним прочитанным источником явно — `OPEN`) |
| 6 | Qualification Policy формирует один канонический routing result | §14 этап 8 (Matching Qualification Gate), §18.1 (ровно четыре результата) | `MATCHING_QUALIFICATION_POLICY` |
| 7 | Safe Presentation/Reveal gates независимо решают disclosure | §18.2 («координирует AI Manager»), §18.6–18.7 («внешний») | `SAFE_PRESENTATION_POLICY` / Reveal Service (внешние) |

Этот документ **не присваивает себе** решения строк 1–3 и 5–7 — они принадлежат другим артефактам/gates и цитируются только для целостности последовательности.

**Fail-closed без числовой подстановки.** `SOURCE_NORMATIVE`, §32: «Модель или правило недоступны → Используется только утвержденная fallback-версия либо расчет блокируется»; «Результат невозможно воспроизвести → Match не допускается к Qualification Gate». Invalid/stale/unavailable policy version или computational failure **не** получает произвольную числовую подстановку (например, дефолтный score) — вместо этого блокируется расчёт или используется только явно утверждённая fallback-версия.

Новые safe error/status codes этим документом не изобретаются. Primary-reason precedence между одновременными Eligibility/Risk/Confidence причинами остаётся `OPEN` в `MATCHING_QUALIFICATION_POLICY` (её открытое решение №4/№13) — не выбирается здесь повторно.

---

## 9. Precision, canonicalization и replay

`SOURCE_NORMATIVE` reproducibility bundle (§49 Architecture, дословный состав, применимо к scoring-компонентам Match Result):

- canonical input snapshot (canonical JSON/CBOR профиль);
- правила Unicode normalization, единиц, timezone, чисел, null/unknown, стабильной сортировки;
- SHA-256 snapshot/hash и schema version;
- content-addressed snapshots всех разрешённых источников;
- code commit, build/container digest, dependency lock digest;
- model provider/name/version и digest, если применимо;
- feature schema/version, scoring/risk/qualification policy versions and hashes;
- random seed и deterministic mode;
- hardware/runtime metadata, если влияет на результат.

`SOURCE_NORMATIVE`, дословно §49: «Для deterministic scoring exact replay должен давать одинаковые input hashes, component scores, ranking, reasons и final package hash… Несовпадение exact replay — severity-1 defect и блокирует соответствующую версию правил»; «Недетерминированный компонент не может сам пройти Matching Qualification Gate и используется только как advisory signal до human-confirmed deterministic rule».

**Candidates (`DECISION_CANDIDATE_FOR_REVIEW`, не выбраны):**

- canonical feature ordering — лексикографический порядок `feature_id` по code point, без `localeCompare`/locale-зависимости (precedent: Feature Schema §9, Proposal, не Architecture-источник);
- canonical serialization — RFC 8785-подобный JSON профиль либо canonical CBOR (оба упомянуты §49 как варианты, ни один не выбран);
- deterministic arithmetic/rounding checkpoints — fixed-point decimal с round-half-to-even на явно зафиксированных промежуточных точках vs. floating-point с зафиксированным precision — ни один вариант не выбран;
- overflow/domain checks — обязательные для деления в `Dimension Score`/`Reciprocal Fit` формулах (защита от `сумма активных весов = 0`), точный механизм — `OPEN`;
- сохранение исходных компонент (`Feature Fit`, `Feature Weight`, `Evidence Confidence`, `Tenant Fit`, `Owner Fit`, `Deal Feasibility`) и reason/evidence references для аудита — согласовано с §33 audit bundle (`SOURCE_NORMATIVE`, применяется к любому расчёту Matching Engine).

**Bit-for-bit identity не заявляется без полностью определённого representation contract.** Точный decimal scale, intermediate precision и rounding algorithm не утверждены ни одним источником — `OPEN_BLOCKED_PENDING_DECISION` (§12, открытое решение №7). Данные Contracts v1.0 (прочитан полностью до EOF; независимо перепроверено repo-wide поиском — 0 совпадений для `score`, `dimension_score`, `tenant_fit`, `owner_fit`, `deal_feasibility`, `reciprocal`, `feature_fit`, `feature_weight`, `mutual_aggregate`) не содержит ни одного scoring-специфичного поля/enum/schema — отсутствие контракта зафиксировано как `OPEN`, не как разрешение его изобрести здесь.

---

## 10. Evaluation и approval path

Proposal связан с `MATCHING_EVALUATION_PLAN` (Proposal, cited as precedent) через существующую metric family:

- **Reciprocal/mutual quality** (Evaluation Plan §6.3) — evaluation object «взаимное соответствие», применимо «только если соответствующая `MATCHING_SCORING_POLICY` утвердит конкретный измеримый объект»; harmonic vs geometric и equal-weight vs candidate alternatives сравниваются именно этой процедурой, не выбираются в этом документе;
- **tuning/final separation** (Evaluation Plan §9): «final test data не используется для поиска того же threshold, который на нём затем проверяется» — применимо к сравнению Mutual Aggregate кандидатов и весовых альтернатив;
- **calibration/robustness/fairness/leakage/replay metrics** — Evaluation Plan §6.4 (Confidence/Risk calibration), §6.6 (determinism/replay), §6.7 (robustness/adversarial), §6.8 (segment/bias/proxy diagnostics) — все применимы к оценке scoring candidates, ни один не заменяет approval;
- **frozen dataset/manifest и post-execution evidence** — Evaluation Plan §8 (freeze-time manifest, post-execution evidence record), включая `scoring_policy_version`/hash как часть обязательного version bundle;
- **review/approval, не самоутверждение.** `SOURCE_NORMATIVE`, §30.3 — девятишаговый процесс для новой версии признаков/весов/модели: (1) подготовка зафиксированной выборки; (2) проверка качества меток; (3) offline evaluation; (4) проверка дискриминационных признаков и прокси; (5) проверка калибровки; (6) review Chief AI Architect; (7) согласование затронутых PRODUCT/LEGAL правил; (8) контролируемый выпуск; (9) мониторинг и возможность отката. Запрещено: автоматическое продуктивное переобучение на единичных событиях, автоматическое изменение Hard Constraints, автоматическое изменение глобальных весов.

**Успешное вычисление score не означает qualification.** Match Score, вычисленный по этому документу, — только один из девяти условий Matching Qualification Gate (`MATCHING_QUALIFICATION_POLICY` §6) наряду с Confidence, Risk, completeness и т.д. Proposal не открывает `IMPLEMENTATION_READINESS_GATE` ни при каком результате evaluation.

---

## 11. Versioning, change control и audit

Concept-level версии (без проектирования таблиц/API/migrations/event types):

- **Version bundle** (`DECISION_CANDIDATE_FOR_REVIEW`, precedent Feature Schema §9): `feature_schema_version + scoring_policy_version + risk_policy_version + qualification_policy_version` и соответствующие hashes — согласованный набор по §49; раздельное обновление одной версии без анализа совместимости полного bundle запрещено (precedent, тот же принцип уже принят Feature Schema/Risk Policy для их версий);
- **Breaking vs additive для Scoring**: изменение Mutual Aggregate функции, введение/удаление measurement dimension или изменение веса, уже влияющего на активную арифметику, — breaking, требует новой major-версии и координированного обновления bundle; добавление нового кандидата в сравнение (§5/§6), не влияющего на активную формулу, — потенциально additive, но требует явного review, не молчаливого допущения (precedent Feature Schema §9);
- **Immutable references**: `scoring_policy_version`/hash обязательно входит в reproducibility bundle любого Match Result (§49, §33 audit bundle) — Matching Engine (единственный technical writer расчёта, §40) сохраняет это как часть неизменяемого журнала (§8.3);
- **Supersession discipline**: новая версия не переписывает исторический Match Result задним числом — согласовано с §33 («Повторный расчет на тех же входах и версиях должен давать тот же детерминированный результат либо явно фиксировать контролируемую недетерминированность») и с §49 (severity-1 при exact replay mismatch); точный append-only/history-контракт специфично для Scoring result — `OPEN`, не изобретается здесь (по аналогии с уже исправленной в Risk Policy находкой о том, что append-only правило для конкретного домена не выводится автоматически из соседних доменов).

---

## 12. Open decisions

Ни одно решение не выбрано этим документом. Owner rules: source-assigned owner указан только там, где источник назначает его прямо (№1, №2 — Architecture §37/§52); унаследованный owner от смежного Proposal/open decision помечен candidate/inherited context; строки без source owner явно говорят «candidate assignment» или «owner OPEN».

| № | Вопрос | Owner | Блокирует |
|---|---|---|---|
| 1 | Mutual Aggregate function approval (harmonic vs geometric) | `AI + PRODUCT` — `SOURCE_NORMATIVE` decision owner (Architecture §37 №2); artifact owner `Chief AI Architect + PRODUCT` (§52) | `IMPLEMENTATION_READINESS_GATE`, Launch |
| 2 | Стартовые/segment weights и минимальные пороги | `AI + PRODUCT` — `SOURCE_NORMATIVE` decision owner (Architecture §37 №3); artifact owner `Chief AI Architect + PRODUCT` (§52) | `IMPLEMENTATION_READINESS_GATE`, Launch |
| 3 | Reciprocal Fit vs Deal Feasibility combination weights (Match Score формула) | — candidate assignment; часть §37 №3, но источник не разводит эту конкретную пару весов отдельно от «стартовых весов» вообще | Match Score arithmetic |
| 4 | Segment policy и evidence, достаточный для одобрения override | — candidate assignment; часть §37 №3 | Segment differentiation |
| 5 | Qualification/minimum score thresholds | `OUT_OF_SCOPE` для Scoring Policy — принадлежит `MATCHING_QUALIFICATION_POLICY` (её открытые решения №5/№6/№7); здесь только перекрёстная ссылка, не решение | Qualification Gate operationalization |
| 6 | Evidence-confidence mapping/калибровка на уровне feature (как `evidence_status` превращается в численный Evidence Confidence) | — candidate assignment; пересекается с Feature Schema открытым решением №1 (`required_evidence_level`) и Risk Policy | Dimension Score arithmetic, double-counting prevention (§7) |
| 7 | Decimal representation, intermediate precision, rounding algorithm, canonical serialization | `DEVELOPMENT + AI` — candidate assignment; §49 описывает bundle, не конкретный representation contract | Bit-exact replay (§9) |
| 8 | Ranking/diversification exact algorithm и diversity metric | — candidate assignment; §24 называет факторы, не формулу | Ranking implementation boundary |
| 9 | Sensitivity/calibration dataset и metric targets для Mutual Aggregate/весов | `AI + DEVELOPMENT` — candidate/inherited context (Evaluation Plan owner, §37 №10 для смежного вопроса) | Model release/Launch |
| 10 | Compatibility/version change rules, специфичные для Scoring (что происходит с уже вычисленным Match Score при смене `scoring_policy_version`) | `DEVELOPMENT + AI` — candidate/inherited context; общий bundle есть (§49), Scoring-специфичное supersession-поведение — нет | Version bundle coordination |
| 11 | Priority Score — формула, обязательность, owner | — candidate assignment; §15.6 называет его опциональным, не специфицирует | Ranking explainability |
| 12 | Feature Fit калибровочная формула сверх интерфейса `[0,1]` | `Chief AI Architect + AI` — candidate assignment; источник не назначает owner этого решения напрямую. `MATCHING_SCORING_POLICY`/`MATCHING_EVALUATION_PLAN` — возможные артефакты фиксации/проверки решения, не owner'ы (эхо Feature Schema открытого решения №12) | Dimension Score arithmetic |
| 13 | Weighting между обязательными/желательными/переговорными критериями внутри Feature Weight | — candidate assignment; §12.1–12.3 Architecture называет классы критериев, не веса между ними | Dimension Score arithmetic |
| 14 | Bounded replay tolerance для любого недетерминированного/probabilistic компонента scoring (если появится) | `DEVELOPMENT + AI` — candidate assignment; эхо Risk Policy №11, Evaluation Plan №10 | Replay/determinism acceptance |
| 15 | Qualification-specific/Scoring-specific synthetic-only vs production calibration boundary | — candidate assignment, по аналогии с Risk Policy `MRP-C-013`/Qualification Policy `MQP-C-019`, не установленная источником буквально для Scoring | Synthetic Acceptance/Launch readiness |
| 16 | Owner конкретного шага §30.3 (например, кто именно готовит зафиксированную выборку и офлайн-оценку до review Chief AI Architect) | — candidate assignment; §30.3 называет шаги, не персональных/ролевых owner каждого шага отдельно от общего процесса | Approval path operational detail |
| 17 | Granularity объяснения Dimension Score компонент, показываемых AI Manager/пользователю через Match Package | `Chief AI Architect + PRODUCT` — candidate assignment; источник не назначает owner этого решения напрямую. `SAFE_PRESENTATION_POLICY` и Scoring Policy — boundary/artifact context, не owner'ы; источник не специфицирует уровень детализации | Explainability/Safe Presentation boundary |
| 18 | Явное разделение «Matching Engine technical writer расчёта» (§40) и «policy-decision owner» весов/функции, чтобы избежать conflation в будущих документах | Задокументировано этим Proposal (§2 таблица) как принцип; отдельного formal owner-решения не требует, но включено как явный anti-pattern guard | Owner-attribution дисциплина будущих ревизий |

Список не закрывается произвольно — ни одно решение не сокращено за счёт выдуманного значения.

---

## 13. Readiness/gates

| Стадия | Статус |
|---|---|
| Scoring Policy proposal reviewed | Cross-functional review этого документа — не завершено |
| Mutual Aggregate function approved | `OPEN` — Architecture §37 №2 |
| Weights approved | `OPEN` — Architecture §37 №3 |
| Evaluation Plan procedure evidence collected | Отдельная стадия, не завершена этим документом |
| Exact Scoring Policy approved | Отдельное cross-functional решение, не этот Proposal |
| Feature Schema / Risk Policy / Qualification Policy approved | Отдельные артефакты, все — Proposal |
| `IMPLEMENTATION_READINESS_GATE` | **`BLOCKED`** |
| `SYNTHETIC_ACCEPTANCE_GATE` | **`BLOCKED`** |
| `PRODUCTION_LAUNCH_GATE` | **`BLOCKED`** |

Успех ранней стадии не открывает следующую (§36 Architecture). Architecture §37 вопросы №2 и №3 остаются `OPEN`. Controlled Artifact Manifest этим документом не синхронизируется.

---

## 14. Acceptance criteria (`MSP-C-001`–`MSP-C-020`)

#### `MSP-C-001` — unknown не становится zero
**Given** отсутствующее значение признака. **When** вычисляется `Dimension Score`. **Then** значение исключается из числителя и знаменателя (§15.4, дословно), не подставляется как `0`; отдельно влияет на Confidence Score.

#### `MSP-C-002` — Hard Constraint не компенсируется высоким score
**Given** подтверждённое нарушение Hard Constraint. **When** вычисляется scoring. **Then** нарушение обрабатывается до scoring (§15.4, §5 принцип 6); никакой высокий Dimension/Match Score не компенсирует и не скрывает подтверждённое нарушение.

#### `MSP-C-003` — harmonic остаётся candidate
**Given** сравнение Mutual Aggregate кандидатов (§5). **When** запрашивается статус harmonic mean. **Then** статус — `DECISION_CANDIDATE_FOR_REVIEW`, не `SOURCE_NORMATIVE`, не approved, не production-calibrated; Architecture §37 №2 остаётся `OPEN`.

#### `MSP-C-004` — geometric остаётся candidate
**Given** тот же контекст. **When** запрашивается статус geometric mean. **Then** статус — `DECISION_CANDIDATE_FOR_REVIEW`, симметричен harmonic по уровню (не приоритизирован, не отвергнут окончательно), только сравнение свойств (§5.1).

#### `MSP-C-005` — equal weights остаются neutral evaluation baseline
**Given** пример весов `w(Reciprocal Fit) = 0.5`, `w(Deal Feasibility) = 0.5`. **When** запрашивается статус этого примера. **Then** статус — `NEUTRAL_EVALUATION_BASELINE`, сумма весов `= 1` показана явно; baseline не используется для qualification/routing и не является рекомендацией.

#### `MSP-C-006` — отсутствие утверждённых numeric thresholds
**Given** любой раздел документа. **When** выполняется поиск конкретного числа вида `0.60`/`0.50`/`0.40`/`0.30`/`40%` или иного qualification/risk/completeness/presentation/gate threshold. **Then** ни один не найден как утверждённое значение; допустимые числа в §5.1 помечены `NON_NORMATIVE_EVALUATION_CANDIDATE` и не связаны с каноническими результатами.

#### `MSP-C-007` — Tenant/Owner/Deal/Confidence/Risk разделены
**Given** любой расчёт Match. **When** запрашиваются пять показателей. **Then** Tenant Fit, Owner Fit, Deal Feasibility, Confidence Score и Risk Score вычислены и сохранены раздельно (§14 этапы 5–6, §5 принцип 9); ни один не подменяет другой.

#### `MSP-C-008` — stale/conflicting/rejected fail-closed boundary
**Given** признак с `evidence_status ∈ {CONFLICTING, STALE, REJECTED, HUMAN_REVIEW_REQUIRED}` (§13). **When** вычисляется Dimension Score. **Then** статус не сворачивается тихо в обычный численный score без снижения Confidence/пометки; согласовано с §32 (versions retained, confidence lowered, Match becomes `STALE`).

#### `MSP-C-009` — score не присваивает Qualification result
**Given** вычисленный Match Score любого значения. **When** оценивается routing. **Then** ни один из четырёх `MATCHING_QUALIFICATION_POLICY` результатов (`QUALIFIED_HYPOTHESIS`/`NEEDS_VERIFICATION`/`HUMAN_REVIEW_REQUIRED`/`REJECTED_BY_MATCHING`) не присваивается этим документом; routing принадлежит §18.1.

#### `MSP-C-010` — deterministic version/replay requirements
**Given** deterministic scoring path. **When** выполняется exact replay на тех же входах/версиях. **Then** input hashes, component scores, ranking, reasons и final package hash идентичны (§49, дословно); несовпадение — severity-1 defect, блокирует версию правил.

#### `MSP-C-011` — недетерминированный компонент не проходит gate самостоятельно
**Given** гипотетический вероятностный/model-based компонент scoring. **When** оценивается допуск к Matching Qualification Gate. **Then** компонент не проходит gate самостоятельно, используется только как advisory signal до human-confirmed deterministic rule (§49, дословно).

#### `MSP-C-012` — отсутствие public/runtime enum/schema authorization
**Given** любой раздел документа. **When** проверяется наличие public/runtime field, enum, event type, DB schema для Feature Fit/Dimension Score/Reciprocal Fit/Match Score. **Then** ни один не введён; Data Contracts v1.0 подтверждён (независимая repo-wide проверка, §9) не содержащим ни одного scoring-специфичного поля.

#### `MSP-C-013` — Architecture §37 №2 OPEN
**Given** документ на уровне draft. **When** запрашивается статус Mutual Aggregate approval. **Then** Architecture §37 вопрос №2 явно `OPEN`, decision owner `AI + PRODUCT`.

#### `MSP-C-014` — Architecture §37 №3 OPEN
**Given** тот же контекст. **When** запрашивается статус стартовых/segment weights. **Then** Architecture §37 вопрос №3 явно `OPEN`, decision owner `AI + PRODUCT`.

#### `MSP-C-015` — все три gates BLOCKED
**Given** документ существует на уровне draft со статусом `Proposal for cross-functional review — does not authorize implementation` (не `APPROVED`). **When** оценивается статус трёх gates. **Then** `IMPLEMENTATION_READINESS_GATE`/`SYNTHETIC_ACCEPTANCE_GATE`/`PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

#### `MSP-C-016` — Evidence Confidence не заменяет и не дублирует общий Confidence Score
**Given** заниженное Evidence Confidence одного признака внутри Dimension Score. **When** отдельно вычисляется общий Confidence Score (§16). **Then** оба показателя остаются раздельными измерениями; механизм предотвращения скрытого двойного наказания за одно и то же основание — `OPEN` (§7, §12 открытое решение №6), не разрешён этим документом как решённый.

#### `MSP-C-017` — invalid/stale policy version fail closed без числовой подстановки
**Given** policy version недоступна, устарела или computational failure. **When** запускается расчёт. **Then** используется только утверждённая fallback-версия либо расчёт блокируется (§32, дословно); произвольная числовая подстановка (например, дефолтный score) не производится; новый error/status code этим документом не изобретается.

#### `MSP-C-018` — segment overrides запрещены без отдельной approved версии
**Given** предложение segment-specific весов. **When** оценивается допустимость применения. **Then** override запрещён до отдельной утверждённой версии с evidence и cross-functional approval (§30.3: запрет «автоматическое изменение глобальных весов»); автоматическое продуктивное переобучение на единичных событиях также запрещено.

#### `MSP-C-019` — успешный evaluation run ≠ approval/qualification
**Given** evaluation run (Evaluation Plan, Proposal) успешно завершён и предлагает candidate weight/function. **When** оценивается статус approval. **Then** ни один статус (Mutual Aggregate approval, weights approval, gate status) не меняется автоматически; требуется отдельный девятишаговый процесс §30.3, включая review Chief AI Architect и согласование PRODUCT/LEGAL.

#### `MSP-C-020` — Proposal не называется утверждённым
**Given** любое упоминание статуса этого документа в тексте, включая acceptance criteria. **When** проверяется формулировка. **Then** нигде не используется слово «утверждён»/«approved» применительно к самому Scoring Proposal, кроме явного отрицания или гипотетического будущего состояния; действующий статус везде — `Proposal for cross-functional review — does not authorize implementation`.

---

## 15. Definition of Done и последствия

Настоящий документ:

- пригоден только для cross-functional review (AI + PRODUCT + LEGAL + DEVELOPMENT, по применимости каждого раздела);
- не закрывает Architecture §37 вопросы №2 и №3 — оба остаются `OPEN`;
- не переводит `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` или `PRODUCTION_LAUNCH_GATE` в иной статус — все три `BLOCKED`;
- не синхронизирует Controlled Artifact Manifest (§52.1 Architecture) — запись `MATCHING_SCORING_POLICY` не добавляется до реального утверждения;
- не содержит ни одного утверждённого numeric weight/threshold/precision/rounding algorithm, ни одного выбранного Mutual Aggregate function, ни одного public/runtime enum, field, event или schema;
- не назначает artifact owner сверх того, что прямо следует из Architecture §52 (`Chief AI Architect + PRODUCT`), и явно отделяет его от decision owner §37 (`AI + PRODUCT`), service writer §40 (Matching Engine) и reviewer §31.1;
- не ослабляет non-compensation Hard Constraint (§5 принцип 6), разделение Match/Confidence/Risk (§5 принцип 9) или fail-closed поведение (§32) ни в каком виде;
- не разрешает и не инициирует implementation, runtime/API/schema changes, model release, реальные данные или production launch;
- не изменяет ни один существующий файл, включая Architecture, Data Contracts, Feature Schema, Evaluation Plan, Risk Policy, Qualification Policy, controlled-set artifacts, reviews, `apps/**`, migrations, OpenAPI/AsyncAPI, package-файлы, любой PR.
