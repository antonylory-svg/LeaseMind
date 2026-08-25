# LeaseMind Matching Decision Record — XFR-D-023

**Decision ID:** `XFR-D-023`

**Название:** Scoring-specific compatibility and version-change rules

**Версия:** 1.0

**Дата решения:** 2026-08-25

**Resolution status:** `RESOLVED_QUALITATIVE_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE SUPERSESSION BOUNDARY — bounded replay tolerance, canonical serialization and exact runtime version-bundle representation remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-25 working session

**Governance owner:** `Chief AI Architect + PRODUCT` — совпадает с artifact owner `MATCHING_SCORING_POLICY` (Architecture §52, обе строки вопросов №2/№3, «Launch/implementation blocker»).

**Mandatory approvers:** `LEGAL + DEVELOPMENT`.

**Consulted domain function:** `AI`.

**Technical schema/versioning steward:** `DEVELOPMENT` — реализуемость и версионирование carrier'а; не semantic policy owner этого решения.

## 1. Source/status discipline и authority boundary

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` использует пять статусов (§1: `SOURCE_NORMATIVE`, `DECISION_CANDIDATE_FOR_REVIEW`, `NEUTRAL_EVALUATION_BASELINE`, `OPEN_BLOCKED_PENDING_DECISION`, `OUT_OF_SCOPE`). §11 документа уже предлагает, как `DECISION_CANDIDATE_FOR_REVIEW`, supersession discipline и breaking/additive классификацию для Scoring, поддержанные Architecture §33/§49 и precedent'ом Feature Schema §9. Этот record — human-approved governance decision, layered поверх этого кандидата, аналогично `RESOLVED_QUALITATIVE_BOUNDARY` статусу, уже применённому `XFR-D-013`/`XFR-D-033`/`XFR-D-037`/`XFR-D-038`/`XFR-D-040`/`XFR-D-048` для соседних qualitative boundaries — не буквальная Architecture-норма и не approval `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` в целом.

## 2. Вопрос

`LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` §12 открытое решение №10 (`XFR-D-023`, source key `MSP-10`): что происходит с уже вычисленным Match Result при смене `scoring_policy_version`, и как качественно различаются breaking и potentially additive изменения Scoring Policy?

## 3. Решение

1. **Supersession — только prospective.** Новый `scoring_policy_version` не переписывает, не переинтерпретирует и не мутирует задним числом уже вычисленный и сохранённый Match Result. Согласовано с Architecture §33 («Повторный расчет на тех же входах и версиях должен давать тот же детерминированный результат либо явно фиксировать контролируемую недетерминированность») и §49 (severity-1 defect при exact replay mismatch) — supersession применяется только вперёд, к новым расчётам.
2. **Breaking-baseline (non-exhaustive).** Текущий минимальный идентифицированный breaking baseline для Scoring: (a) изменение активной Mutual Aggregate функции; (b) добавление или удаление активного measurement dimension; (c) изменение веса, уже влияющего на активную арифметику. Этот список — не исчерпывающий; он фиксирует только уже идентифицированный минимум, не закрывает taxonomy навсегда.
3. **Fail-closed классификация для остального.** Любое иное изменение, влияющее на активную Scoring-арифметику или на интерпретацию уже вычисленного Match Result — включая будущее утверждённое правило комбинирования Match Score (Scoring Policy §12 открытое решение №3) — требует явной governance-классификации и по умолчанию трактуется fail-closed как breaking, пока не классифицировано иначе отдельным решением.
4. **Versioning rule для breaking изменений.** Любое breaking изменение (baseline п.2 или fail-closed классифицированное по п.3) требует нового `scoring_policy_version`. Каждый новый вычисленный Match Result обязан нести новый, internally consistent reproducibility bundle snapshot, точно отражающий фактические версии и hashes, реально использованные для этого конкретного расчёта (состав bundle — Architecture §49). Неизменённые компоненты Feature Schema, Risk Policy или Qualification Policy не обязаны получать новую версию только потому, что изменилась Scoring Policy — версия каждого компонента bundle остаётся независимой и отражает только то, что фактически изменилось в этом компоненте. Ни `major`/`minor`/`patch`, ни любая иная точная semantic-versioning схема этим record'ом не утверждается — остаётся `OPEN`. Точное runtime representation, сериализация и transport/storage этого bundle остаются `OPEN`.
5. **Potentially additive изменения.** Введение нового inactive comparison candidate (например, нового кандидата в сравнение §5/§6 Scoring Policy) может быть potentially additive только пока он не способен повлиять на активное вычисление, интерпретацию output или routing; он всё равно требует явного review перед активацией — никогда не молчаливого допущения. Additive-классификация сама по себе не авторизует активацию без review.
6. **Ни одна функция, dimension, вес или численное значение не выбираются.** Этот record не выбирает Mutual Aggregate function (harmonic/geometric, Architecture §37 №2), не задаёт стартовые/segment weights (Architecture §37 №3) и не вводит ни одного numeric threshold.
7. **Independently open.** Bounded replay tolerance для любого недетерминированного/probabilistic компонента (Scoring Policy §12 пункт 14), decimal/canonical serialization и точный precision/rounding representation (§12 пункт 7), точное runtime version-bundle representation, а также exact semantic-versioning схема (major/minor/patch) остаются независимо `OPEN` — этот record их не резолвит.

## 4. Layer/boundary — Scoring supersession vs Architecture reproducibility bundle vs Feature Schema precedent

| Слой | Что регулирует | Owner/authority | Затронут этим record'ом? |
|---|---|---|---|
| Architecture §49 reproducibility bundle | Concept-level состав bundle (hashes, snapshot, version capture per component) и exact-replay/severity-1 правила для **любого** расчёта Matching Engine — **не** major-version semantics и **не** правило принудительного обновления версий неизменённых компонент | Architecture (`SOURCE_NORMATIVE`) | Нет — общая норма не переоткрывается; этот record не приписывает ей несуществующее содержание |
| Feature Schema §9 versioning precedent (`DECISION_CANDIDATE_FOR_REVIEW`, никогда не adjudicated отдельным XFR-D record'ом) | Breaking/additive классификация для feature registry, включая её собственный major-version/bundle-coordination язык | `LeaseMind_MATCHING_FEATURE_SCHEMA_v0.1.md` | Нет — этот record не наследует и не утверждает её major-version/coordinated-update язык; применяет только governance-метод разделения breaking/additive |
| **Scoring-specific supersession/breaking-baseline/versioning boundary (этот record)** | Prospective-only supersession, non-exhaustive breaking baseline, fail-closed классификация остального и corrected `scoring_policy_version`-only versioning rule | `Chief AI Architect + PRODUCT` (этот record) | **Да — единственный резолвленный этим record'ом слой** |
| Exact semantic-versioning схема (major/minor/patch) и runtime bundle representation | Точная versioning-схема и её runtime/serialization представление | Не назначен ни одним источником | Нет — остаётся `OPEN` |
| Bounded replay tolerance / exact serialization (§12 пп.7/14 Scoring Policy) | Точный representation contract и tolerance для недетерминированных компонентов | `DEVELOPMENT + AI` — candidate (не source-owned) | Нет — остаётся `OPEN` |

## 5. Rationale

Supersession-принцип «новая версия не переписывает исторический результат» уже прямо поддержан двумя независимыми Architecture-нормами (§33 детерминированный replay, §49 severity-1 при mismatch) без необходимости изобретать что-либо новое — качественное подтверждение этого принципа не создаёт нового source-факта, а фиксирует governance-интерпретацию уже существующих норм именно для Scoring domain, по аналогии с тем, как Feature Schema §9 уже применяет тот же принцип разделения breaking/additive для feature registry (без наследования её собственного, никогда не adjudicated major-version/bundle-coordination языка, см. §4 выше).

Breaking-baseline (функция/dimension/активный вес) фиксирует только текущий минимум элементов, прямо влияющих на уже активную арифметику (§15.4-15.6 Architecture) — это не исчерпывающая taxonomy, а стартовая точка, требующая fail-closed классификации для всего остального (§3 п.3), включая нерезолвленные соседние open decisions (например, Match Score combination weight, Scoring Policy §12 №3), которые могут в будущем повлиять на активную арифметику, но пока не отдельно классифицированы.

Versioning rule сознательно ограничен требованием нового `scoring_policy_version` и internally consistent bundle snapshot для конкретного расчёта — источник (Architecture §49) действительно требует точной фиксации фактически использованных версий/hashes per расчёт, но нигде не требует принудительного увеличения версии неизменённых соседних policies; это отдельная, никогда не adjudicated Proposal-level идея (Scoring Policy §11, Feature Schema §9), которую этот record сознательно не утверждает. Numeric representation (replay tolerance, serialization, rounding, exact semantic-versioning схема) сознательно исключены из этого record'а — они не имеют качественного решения без evidence, в отличие от самого supersession-принципа и non-exhaustive breaking-baseline.

## 6. Adversarial cases

1. **Смена Mutual Aggregate функции после production launch.** Гипотетическая замена harmonic на geometric — breaking по определению baseline п.2(a); требует нового `scoring_policy_version` и review, не может быть выпущена silently даже если evaluation показывает улучшение метрик (см. `MSP-C-019`, evaluation run не эквивалентен approval).
2. **Добавление нового inactive weight candidate для будущего A/B сравнения.** Potentially additive по п.5 — не требует немедленного нового `scoring_policy_version`, пока candidate не способен повлиять на активное вычисление/output/routing; не может быть активирован без explicit review; попытка «тихо» активировать candidate без review нарушает это решение.
3. **Попытка ретроактивно «исправить» исторический Match Result новой версией policy.** Прямо запрещено п.1 — исторический результат остаётся привязанным к своей `scoring_policy_version`; для нового вывода требуется новый расчёт на актуальной версии.
4. **Смешение breaking-классификации с bounded replay tolerance.** Реализатор может спутать supersession-правило (какая версия применяется к какому Match Result) с replay tolerance (сколько допустимого расхождения у недетерминированного компонента). Layer table (§4) явно разводит: первое резолвлено этим record'ом, второе остаётся `OPEN` под Scoring Policy §12 пункт 14.
5. **Изменение, не входящее в baseline (например, будущее Match Score combination weight, Scoring Policy №3).** Реализатор может решить, что раз изменение не входит явно в baseline п.2, оно автоматически additive. Запрещено п.3 — любое изменение, влияющее на активную арифметику/интерпретацию, но не классифицированное явно, трактуется fail-closed как breaking, пока отдельное governance-решение не классифицирует его иначе.
6. **Предположение, что breaking Scoring-изменение обязано увеличить версию Feature Schema/Risk/Qualification.** Неверно — п.4 explicitly разводит: только `scoring_policy_version` обязан измениться; неизменённые соседние компоненты сохраняют свою текущую версию, если они фактически не менялись; каждый компонент bundle версионируется независимо от того, что реально изменилось.

## 7. Затронутые артефакты (future separate sync, не выполняется этим record'ом)

- `LeaseMind_MATCHING_SCORING_POLICY_v0.1.md` — §11 (versioning/change control) получит cross-reference на `RESOLVED_QUALITATIVE_BOUNDARY`; §12 открытое решение №10 перейдёт от candidate-assignment к `RESOLVED_QUALITATIVE_BOUNDARY`-cross-reference;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — потребуется новый Wave status-overlay для `XFR-D-023`.

Ни один из этих будущих sync-проходов не выполняется этим record'ом.

## 8. Не утверждено (explicit non-decisions)

- Ни одна Mutual Aggregate функция (Architecture §37 №2 остаётся `OPEN`);
- ни одно стартовое/segment weight значение (Architecture §37 №3 остаётся `OPEN`);
- точная semantic-versioning схема (major/minor/patch или иная) для `scoring_policy_version` — остаётся `OPEN`;
- принудительное обновление версии неизменённых соседних компонент (Feature Schema/Risk Policy/Qualification Policy) при Scoring-only изменении — не требуется и не утверждается этим record'ом;
- bounded replay tolerance для недетерминированных компонентов (`XFR-D-M4`/Scoring Policy §12 п.14);
- decimal representation, intermediate precision, rounding algorithm, canonical serialization (Scoring Policy §12 п.7);
- exact runtime version-bundle representation, API/DB/schema/event design;
- изменение или переоткрытие любого другого open decision Scoring Policy;
- implementation authorization любого рода.

## 9. Gate impact

`NONE`. Все governance gates остаются `BLOCKED`. Architecture §37 вопросы №2 и №3 остаются `OPEN`.

## 10. Change control

Изменение утверждённой supersession/breaking-additive boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 11. Итог

`XFR-D-023 QUALITATIVE SUPERSESSION AND VERSION-CHANGE BOUNDARY APPROVED — REPLAY TOLERANCE, SERIALIZATION AND RUNTIME REPRESENTATION REMAIN OPEN`
