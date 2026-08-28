# LeaseMind Matching Decision Record — XFR-D-064

**Decision ID:** `XFR-D-064`

**Название:** Segment/bias/proxy diagnostic dataset-coverage governance owner and evidence-prerequisite boundary

**Версия:** 1.0

**Дата решения:** 2026-08-28

**Decision status:** `APPROVED`

**Resolution status:** `PARTIALLY_RESOLVED_BOUNDARY`

**Статус:** `APPROVED GOVERNANCE-OWNER AND EVIDENCE-PREREQUISITE BOUNDARY — SEGMENT UNIVERSE, PROTECTED/PROXY CLASSIFICATION AND ALL NUMERIC COVERAGE VALUES REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-28 working session

**Repository baseline:** `39d03ab401c1902a91ea76263eb29662998daf22`

**Scope:** governance ownership and qualitative evidence-prerequisite boundary for future approved segment/bias/proxy diagnostic dataset coverage only; does not choose any segment universe, protected/proxy classification, lawful-basis determination, intersection definition, numerator/denominator, numeric minimum count/ratio/threshold/tolerance, aggregation/weighting, suppression rule, statistical procedure, dataset, evaluation run, production-data use, runtime representation, implementation or Evaluation Plan approval.

**Governance owner:** `PRODUCT + LEGAL` — human-approved assignment, aligned with `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §6.8's own explicit split for the adjacent legal-standard question in the same section ("Owner финального threshold: legal standard — `LEGAL + PRODUCT`"); Architecture does not name an owner for segment-coverage sufficiency directly.

**Mandatory approvers:** `Chief AI Architect + AI + DEVELOPMENT`.

**Evidence-procedure owner:** `AI + DEVELOPMENT` под `MATCHING_EVALUATION_PLAN`; эта роль готовит/проверяет evidence и не заменяет governance approval полного owner/approver set.

**Depends on:** label eligibility `XFR-D-057 v1.0`, adjudication procedure `XFR-D-058 v1.1`, connected-component grouping/isolation `XFR-D-059 v1.1` и correction-history exclusion `XFR-D-060 v1.0` остаются mandatory prerequisites для любого segment-tagged label. False-exclusion governance `XFR-D-061 v1.0`, dataset allocation/reproducibility `XFR-D-062 v1.0` и numeric metric-target boundary `XFR-D-063 v1.0` остаются независимыми `PARTIALLY_RESOLVED_BOUNDARY` decisions; `XFR-D-061` §3.4 п.9 уже cites segment coverage как один из своих evidence-package prerequisites, не наоборот. Re-identification method/threshold `XFR-D-M3`, fairness legal standard `XFR-D-068` и threshold-search statistical comparison `XFR-D-070` остаются независимо `OPEN`.

---

## 1. Вопрос

Кто владеет будущим утверждением минимального per-segment coverage Evaluation dataset, достаточного для содержательных segment/bias/proxy diagnostic метрик (Architecture §30.3 п.4), и какое evidence обязательно до такого утверждения, если источник требует саму проверку, но не задаёт segment universe, классификацию protected/proxy измерений или численный минимум?

## 2. Source/status discipline

Architecture §30.3 п.4 нормативно требует «проверку дискриминационных признаков и прокси» перед любым platform-level изменением — `SOURCE_NORMATIVE` для существования самой проверки, не для её coverage-минимума. Architecture §8.4 нормативно требует «исключения малых групп и выборок с риском повторной идентификации» перед segment-аналитикой — это privacy-driven small-group rule, отдельная причина от статистической sufficiency малых сегментных ячеек; Evaluation Plan §7 уже сохраняет это правило без ослабления. Architecture §34.2 перечисляет семейства измерений качества ранжирования/уверенности/риска (`Precision@K`, `Recall@K`, `NDCG@K`, калибровка, диверсификация верхней выдачи, human-review flags, критические риски) и требует measure-as-baseline-first дисциплину, но не называет ни одной segment-coverage метрики или минимума.

Evaluation Plan §6.8 определяет evaluation object («метрики по сегментам — город, тип помещения, категория бизнеса и т.п.») и prohibited inference («diagnostic не устанавливает и не заменяет юридический fairness standard»), и явно предлагает split candidate owner: «legal standard — `LEGAL + PRODUCT`; процедура diagnostic — `AI`», помечая оба как `DECISION_CANDIDATE_FOR_REVIEW`, не source-established напрямую. §11 решение №8 фиксирует то же самое как `PRODUCT + AI + LEGAL` кандидата без owner/approver разделения. §7 «Критическая поправка» отдельно подтверждает: документ не ссылается ни на какой численный minimum группы или threshold re-identification риска — оба остаются `OPEN_BLOCKED_PENDING_DECISION`.

Этот record human-approved разрешает только governance owner/evidence-prerequisite половину вопроса №8. Segment universe, protected/proxy классификация и любое численное значение остаются полностью `OPEN`.

## 3. Решение

### 3.1. Governance owner и обязательное approval-разделение

1. Governance owner будущей segment-coverage sufficiency policy — `PRODUCT + LEGAL`.
2. Mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`.
3. Evidence-procedure owner — `AI + DEVELOPMENT` в рамках Evaluation Plan.
4. Evidence preparation, coverage computation, статистическая проверка или recommendation не равны approval. Ни `AI`, ни `DEVELOPMENT`, ни Chief AI Architect не могут утвердить coverage policy единолично.
5. Финальное решение требует полного owner/approver set, нового versioned decision record и точных evidence references.

### 3.2. Узкая scope boundary

Этот record:

- не выбирает segment universe и не решает, является ли illustrative список §6.8 («город, тип помещения, категория бизнеса и т.п.») исчерпывающим;
- не классифицирует ни одно segment-измерение как protected/proxy и не принимает lawful-basis решение;
- не определяет intersection-сегменты (например, город × категория бизнеса);
- не задаёт numerator, denominator или counting unit;
- не задаёт ни одно численное minimum count, ratio, threshold или tolerance;
- не задаёт aggregation или weighting между сегментами;
- не задаёт privacy small-cell suppression/generalization rule и не задаёт отдельное statistical small-cell sufficiency rule;
- не задаёт uncertainty/confidence method или statistical comparison procedure;
- не разрешает sampling, stratification, balancing, oversampling или undersampling policy.

### 3.3. Missing/unclassified-segment handling

1. Record без определяемого или доступного segment-значения не превращается автоматически в negative, failed diagnostic outcome или majority-сегмент.
2. Segment-значение не изобретается и не восстанавливается AI, heuristic inference или proxy-признаком там, где source-authoritative классификация недоступна.
3. Такой record не исключается из отчётности молча: он учитывается в явно обозначенном unclassified/unknown-segment bucket, отдельном от классифицированных сегментов.
4. Unclassified/unknown-segment bucket — governance-level diagnostic concept, не canonical runtime enum, status или Qualification result; exact representation остаётся `OPEN` (§5).

### 3.4. Non-compensation

1. Хороший aggregate diagnostic результат не может служить waiver для недостаточного evidence по конкретному сегменту или intersection.
2. Успех в одном сегменте или metric family не компенсирует другой uncovered или insufficient сегмент; сегменты и intersections не сворачиваются в единый pass/fail без раздельного представления.
3. Coverage insufficiency сообщается явно, а не маскируется удобной агрегацией — тот же non-compensation паттерн, что уже применён `XFR-D-061` §3.3 (два `0%` invariants) и `XFR-D-063` §3.2 (metric families не компенсируют друг друга).

### 3.5. Явное non-conflation

`XFR-D-064` — governance boundary для dataset diagnostic coverage. Это не:

1. юридический fairness standard `XFR-D-068` (owner `LEGAL + PRODUCT`, decision row №14) — coverage sufficiency не эквивалентна legal fairness verdict;
2. re-identification method/threshold `XFR-D-M3` — privacy risk малых групп, не статистическая sufficiency малых сегментных ячеек;
3. protected/proxy классификация признака или lawful-basis approval — эти решения остаются под существующими Feature Schema открытыми решениями №9/№17 и `LeaseMind_MATCHING_RISK_POLICY_v0.1.md` §13 открытое решение №9 (protected/proxy classification catalog и lawful basis, candidate owner `LEGAL + PRODUCT`), не создаются и не переопределяются этим record'ом;
4. numeric metric targets `XFR-D-063` (`Precision@K`/`Recall@K`/`NDCG@K`/calibration/diversification target) — coverage sufficiency не является metric target и не подставляется вместо него;
5. false-exclusion maximum `XFR-D-061` — отдельная Hard-Filter-специфичная метрика; segment coverage упомянута только как один из её evidence-package prerequisites (`XFR-D-061` §3.4 п.9), не наоборот;
6. dataset-size/allocation policy `XFR-D-062` — overall dataset size/split governance остаётся отдельным вопросом; segment coverage — layered per-segment sufficiency question поверх него, не замена;
7. Scoring segment-override policy `XFR-D-018`/`MSP-04` (Scoring Policy §12 row №4) — production weight differentiation по сегменту, не evaluation dataset coverage;
8. Scoring runtime ranking/diversification algorithm `XFR-D-021`/`MSP-08` (Scoring Policy §12 row №8) — production ranking behavior, не evaluation dataset coverage;
9. runtime drift/operational monitoring `XFR-D-065` — операционный monitoring, отдельный и полностью не покрытый ни одним источником вопрос.

### 3.6. Минимальный evidence package до будущего coverage approval (categories only)

Ни одно значение coverage sufficiency не может считаться approved без versioned evidence package, включающего как минимум следующие категории (без утверждения их точного содержания):

1. предлагаемый segment universe и explicit statement, является ли он исчерпывающим;
2. предлагаемую protected/proxy классификацию каждого segment-измерения с applicable lawful-basis evidence;
3. предлагаемые intersection definitions, если применимо;
4. предлагаемый numerator/denominator/counting unit;
5. доказанную label eligibility `XFR-D-057`, applicable source-policy evidence и, когда требуется, adjudication `XFR-D-058`;
6. grouping/split-isolation evidence `XFR-D-059` и correction-history handling `XFR-D-060`;
7. applicable `XFR-D-062` dataset allocation evidence и explicit statement о любой предлагаемой stratification/balancing, отдельно утверждённой, а не введённой как hidden substitute;
8. отдельные privacy small-cell suppression/generalization evidence (Architecture §8.4) и отдельные statistical small-cell sufficiency evidence — не смешанные в одно правило;
9. предлагаемый uncertainty/confidence method и applicable statistical comparison procedure (`XFR-D-070`);
10. explicit synthetic-only versus production-data applicability statement; synthetic-only evidence не создаёт production coverage claim или production-readiness claim;
11. candidate coverage policy, rationale, policy version/hash и immutable evidence references;
12. документированные PRODUCT/LEGAL impacts и DEVELOPMENT reproducibility/control verification.

Exact metric/statistical contents перечисленных open dependencies не утверждаются этим record'ом. До их разрешения coverage approval блокируется fail closed.

### 3.7. Partial, never fully resolved

`XFR-D-064` получает `PARTIALLY_RESOLVED_BOUNDARY`: governance owner, mandatory approvers, evidence-procedure role, missing/unclassified-segment handling, non-compensation boundary и explicit non-conflation list разрешены.

Будущее решение segment universe, protected/proxy классификации, numeric minimums и остальных открытых вопросов требует нового versioned `XFR-D-064` record с `supersedes` на эту версию. Они не могут быть добавлены silent edit, conventional taxonomy, implementation default или Evaluation Plan sync.

## 4. Layer/boundary

| Слой | Что регулирует | Authority | Статус после этого record |
|---|---|---|---|
| Segment/proxy check existence (Architecture §30.3 п.4) | Что проверка дискриминационных признаков и прокси обязательна перед platform-level изменением | Architecture (`SOURCE_NORMATIVE`) | Не изменён |
| Privacy small-group exclusion (Architecture §8.4) | Исключение малых групп с риском повторной идентификации перед segment-аналитикой | Architecture (`SOURCE_NORMATIVE`) | Не изменён; отдельная причина от statistical sufficiency |
| Governance owner/approvers будущей coverage policy | Кто владеет и согласует будущую segment-coverage sufficiency policy | `PRODUCT + LEGAL`; `Chief AI Architect + AI + DEVELOPMENT` | Разрешено этим record |
| Evidence procedure | Кто готовит/проверяет coverage evidence | `AI + DEVELOPMENT` | Разрешена role boundary; не unilateral approval |
| Missing/unclassified-segment handling, non-compensation | Как обрабатывать unknown segment и предотвращать aggregate masking | Этот record | Разрешено этим record |
| Segment universe, protected/proxy classification, intersections, numerator/denominator, numeric minimums, aggregation, suppression rules, statistical procedure | Точное содержание будущей coverage policy | Будущий полный owner/approver decision после evidence | `OPEN` |
| Fairness legal standard (`XFR-D-068`), re-identification threshold (`XFR-D-M3`), metric targets (`XFR-D-063`), false-exclusion maximum (`XFR-D-061`), dataset allocation (`XFR-D-062`) | Независимые смежные governance boundaries | Соответствующие owners/approvers | Не изменены; отдельно governed |
| Runtime/implementation/release | Carrier, enforcement, monitoring, rollback | Отдельные downstream artifacts/gates | `OPEN` |

## 5. Что остаётся `OPEN`

- полный segment universe и explicit statement о его исчерпывающести;
- protected/proxy классификация каждого segment-измерения и lawful-basis determination;
- intersection definitions;
- numerator, denominator и counting unit;
- численные minimum counts, ratios, thresholds и tolerances;
- aggregation и weighting между сегментами;
- privacy small-cell suppression/generalization rules (Architecture §8.4) — отдельно от statistical small-cell sufficiency rules;
- uncertainty/confidence method и statistical comparison procedure (`XFR-D-070`);
- sampling, stratification, balancing, oversampling и undersampling policy;
- фактический dataset, manifest, evaluation run и evidence package;
- production-data authority, named appointments/RBAC (`XFR-D-067` authority model их не заменяет);
- runtime/API/DB/schema/event representation, implementation, monitoring и rollback;
- `XFR-D-061`, `XFR-D-062`, `XFR-D-063`, `XFR-D-065`, `XFR-D-068`, `XFR-D-070`, `XFR-D-M3` — все остаются независимыми `OPEN`/`PARTIALLY_RESOLVED_BOUNDARY` решениями.

## 6. Rationale

Architecture требует саму проверку дискриминационных признаков и прокси, но сознательно не задаёт segment universe, классификацию или численный coverage minimum. Назначение owner устраняет процедурную неопределённость, не подменяя отсутствующее evidence и не создавая de facto protected-category taxonomy без LEGAL/PRODUCT authority. Разделение governance owner (`PRODUCT + LEGAL`, материальность и юридическая необходимость — зеркалит собственный split источника для смежного legal-standard вопроса в том же §6.8) от evidence-procedure owner (`AI + DEVELOPMENT`, статистическое исполнение) и от mandatory approvers (`Chief AI Architect + AI + DEVELOPMENT`, технический/reproducibility review) сохраняет паттерн, уже применённый во всём кластере `XFR-D-057`–`063`: `AI` нигде не выступает co-equal governance owner рядом с двумя нетехническими функциями без Chief AI Architect.

Явное разведение privacy small-group exclusion (§8.4, re-identification risk) от statistical small-cell sufficiency (эта запись) предотвращает опасное смешение двух разных причин для похожего на вид «малой группы» правила — одна защищает субъектов данных, другая защищает валидность diagnostic вывода.

## 7. Adversarial cases

1. **Pilot cap `100 Campaign` или Campaign→Qualified `40%/25%` используют как coverage minimum.** Запрещено §3.2/§3.6 — это другие Architecture boundaries и denominators, не segment-coverage sufficiency.
2. **Conventional demographic/segment taxonomy применяют без PRODUCT/LEGAL authority.** Запрещено — segment universe остаётся `OPEN` и требует governance owner approval, не может быть введена как convenient default.
3. **Unknown-сегмент record молча исключают из отчётности.** Запрещено §3.3 п.3 — запись учитывается в explicit unclassified bucket.
4. **AI восстанавливает сегмент по heuristic/proxy признаку.** Запрещено §3.3 п.2 — segment-значение не изобретается AI или heuristic inference.
5. **Хороший aggregate diagnostic результат скрывает недостаточный coverage конкретного сегмента.** Запрещено §3.4 — non-compensation сохраняется; недостаточность сообщается явно.
6. **Privacy small-cell suppression (§8.4) трактуют как statistical sufficiency evidence, или наоборот.** Запрещено §3.6 п.8 и §4 — это две разные причины с разным evidence, не взаимозаменяемые.
7. **Synthetic-only evidence используют как production coverage claim.** Запрещено §3.6 п.10 — synthetic-only evidence не создаёт production coverage или production-readiness claim.
8. **Coverage sufficiency смешивают с fairness standard, re-identification threshold или metric target.** Запрещено §3.5 — все три остаются отдельными canonical decisions (`XFR-D-068`, `XFR-D-M3`, `XFR-D-063`).
9. **`AI` или `DEVELOPMENT` (evidence-procedure owner) утверждают coverage policy единолично.** Запрещено §3.1 п.4 — evidence preparation не равна approval; требуется полный owner/approver set.
10. **Segment balancing/stratification вводят как способ достичь ratio, нарушая `XFR-D-059` component isolation или `XFR-D-062` allocation boundary.** Запрещено §3.2/§3.6 п.7 — любая stratification/balancing должна быть отдельно утверждена, не может нарушать существующий component-atomic split или служить hidden substitute.
11. **Coverage evidence автоматически меняет model, Scoring/Risk/Qualification policy или runtime rules.** Запрещено — automatic change остаётся запрещён; требуется отдельный controlled release, все gates остаются `BLOCKED`.

## 8. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §6.8, §11 решение №8 и readiness summary получат owner/evidence-prerequisite cross-reference без numeric values;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-064`;
- будущий numeric `XFR-D-064`, segment taxonomy, protected/proxy classification и runtime artifacts — отдельные downstream passes.

Ни один future sync не должен интерпретировать этот record как numeric coverage value, Evaluation Plan/dataset/run approval, production-readiness evidence или implementation authorization.

## 9. Change control

Изменение governance owner, mandatory approvers, evidence-procedure role, missing/unclassified-segment handling, non-compensation boundary или non-conflation list требует нового versioned `XFR-D-064` record, согласованного `Chief AI Architect + PRODUCT + LEGAL + AI + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** этот record, **when** запрашивается current segment universe, numeric coverage minimum, classification или statistical rule, **then** значения отсутствуют и `XFR-D-064` остаётся `PARTIALLY_RESOLVED_BOUNDARY`.
2. **Given** будущий coverage policy candidate, **when** проверяется authority, **then** governance owner — `PRODUCT + LEGAL`, mandatory approvers — `Chief AI Architect + AI + DEVELOPMENT`, а evidence preparation `AI + DEVELOPMENT` не заменяет approval.
3. **Given** record без определяемого segment-значения, **when** формируется diagnostic отчёт, **then** он учитывается в explicit unclassified/unknown-segment bucket, не как negative outcome и не молча исключается.
4. **Given** отсутствует source-authoritative segment classification, **when** требуется значение, **then** AI/heuristic/proxy inference не создаёт и не восстанавливает segment-значение.
5. **Given** хороший aggregate diagnostic результат, **when** конкретный сегмент или intersection имеет недостаточный coverage, **then** aggregate не компенсирует и не скрывает эту недостаточность.
6. **Given** privacy small-cell suppression (Architecture §8.4) и statistical small-cell sufficiency, **when** применяется любое из правил, **then** они остаются раздельными evidence categories, не взаимозаменяемыми.
7. **Given** pilot cap `100 Campaign`, Campaign→Qualified `40%/25%` или conventional demographic taxonomy, **when** ищется coverage minimum или segment universe, **then** ни одно значение не используется как surrogate/default без отдельного PRODUCT/LEGAL authority.
8. **Given** только synthetic-only evidence, **when** формулируется production coverage/readiness claim, **then** claim запрещён.
9. **Given** этот record, **when** проверяется его отношение к `XFR-D-068`, `XFR-D-M3`, `XFR-D-063`, `XFR-D-061`, `XFR-D-062`, `XFR-D-018`, `XFR-D-021` или `XFR-D-065`, **then** ни одно из них не резолвится, не переопределяется и не подменяется этим record'ом.
10. **Given** предлагается segment balancing/stratification, **when** проверяется соответствие `XFR-D-059`/`XFR-D-062`, **then** оно требует отдельного explicit approval и не может нарушать component-atomic isolation или служить hidden substitute.
11. **Given** этот record, **when** проверяются Evaluation Plan, dataset/run, production-data use, runtime, implementation и gates, **then** они не утверждены и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-064 GOVERNANCE-OWNER AND EVIDENCE-PREREQUISITE BOUNDARY APPROVED — SEGMENT UNIVERSE, PROTECTED/PROXY CLASSIFICATION, NUMERIC COVERAGE VALUES, DATASET, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
