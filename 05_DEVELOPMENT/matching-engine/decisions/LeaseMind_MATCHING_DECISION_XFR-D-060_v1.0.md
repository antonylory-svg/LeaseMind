# LeaseMind Matching Decision Record — XFR-D-060

**Decision ID:** `XFR-D-060`

**Название:** Evaluation conservative correction-history exclusion at dataset freeze

**Версия:** 1.0

**Дата решения:** 2026-08-27

**Decision status:** `APPROVED`

**Resolution status:** `RESOLVED_CONSERVATIVE_CORRECTION_HISTORY_EXCLUSION_BOUNDARY`

**Статус:** `APPROVED CONSERVATIVE CORRECTION-HISTORY EXCLUSION BOUNDARY — DATASET, POST-FREEZE SYNCHRONIZATION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-27 working session

**Repository baseline:** `5cc168861fd2ef3523cf4fbbd8e9b08733878c7c`

**Scope:** correction-history inclusion/exclusion governance semantics for a new dataset freeze only; does not authorize an Evaluation Plan, dataset construction, evaluation execution, production-data use, implementation, runtime/API/DB/schema/event design, numeric thresholds or Proposal approval.

**Governance owner:** `AI + PRODUCT` — сохраняется из `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §5.4 и §11, решение №4.

**Mandatory approvers:** `Chief AI Architect + DEVELOPMENT + LEGAL`.

**Depends on:** qualitative business-outcome eligibility `XFR-D-057 v1.0`, human adjudication procedure `XFR-D-058 v1.1` и connected-component grouping/isolation `XFR-D-059 v1.1`. Dataset size, split ratios, allocation boundaries и seed остаются `OPEN` под `XFR-D-062`; exact synchronization correction с уже `FROZEN`/`EXECUTED` run остаётся `OPEN` под `XFR-D-071`.

---

## 1. Вопрос

Как обрабатывать Campaign с append-only correction history при новом dataset freeze: использовать current effective outcome на момент freeze или консервативно исключать такую Campaign, не переписывая исторические runs и не ослабляя `XFR-D-057`–`XFR-D-059`?

## 2. Source/status discipline

`CAMPAIGN_OUTCOMES.md` §7 нормативно устанавливает append-only и immutable history: принятая correction создаёт новую запись, делает её current effective outcome и оставляет исправленную запись historical/superseded. Correction с тем же `outcome_code`, ссылка на уже superseded запись или иная отклонённая команда не создаёт принятую correction-запись.

Evaluation Plan §5.4 фиксирует два равно открытых варианта: A — включать Campaign с current effective outcome на момент freeze; B — исключать Campaign, если в её истории есть хотя бы одна correction. До этого record'а ни один вариант не был утверждён.

Этот record human-approved выбирает консервативный вариант B. Он не изменяет PRODUCT-семантику current effective outcome, не объявляет PRODUCT outcome автоматически пригодным для Matching ground truth и не утверждает готовый механизм обнаружения correction history, manifest schema или runtime carrier.

## 3. Решение

### 3.1. Консервативное exclusion rule

При каждом новом dataset freeze Campaign исключается из outcome-derived ground-truth inclusion, если source-authoritative append-only history этой Campaign содержит хотя бы одну **принятую correction-запись**.

Для такой Campaign в этом freeze:

1. current effective outcome не используется как evaluation label;
2. ни одна historical/superseded outcome-запись не используется как evaluation label;
3. все outcome-derived candidate labels/records этой Campaign исключаются до split assignment;
4. exclusion фиксируется с auditable source/evidence reference, но exact manifest field, reason code и runtime representation остаются `OPEN`;
5. exclusion не является negative label, failed match, `unknown`, `DISPUTED`, `INCONCLUSIVE` или Qualification result.

Отклонённая correction-команда, которая по `CAMPAIGN_OUTCOMES.md` не создала immutable correction-запись, сама по себе не означает наличие correction history. Это не разрешает permissive fallback: полнота и непротиворечивость source history всё равно должны быть доказаны по §3.2.

### 3.2. Source-authoritative proof и fail closed

Наличие или отсутствие correction history определяется только по полному versioned source-authoritative snapshot и явной correction/supersedes lineage. Свободный текст, UI display state, приблизительное сходство, AI/model output или reconstructed guess не являются authority.

Если history неполна, canonical Campaign identity отсутствует, correction/supersedes lineage ambiguous/conflicting либо нельзя доказать, что snapshot охватывает применимый период до freeze, Campaign исключается fail closed. Она не считается «без correction» по отсутствию доступного evidence.

### 3.3. `XFR-D-057`/`XFR-D-058`: отсутствие correction не создаёт eligibility

Отсутствие принятой correction является только необходимой границей XFR-D-060, но не достаточным основанием для ground-truth inclusion.

Каждый outcome отдельно должен пройти qualitative eligibility `XFR-D-057 v1.0`, applicable source-policy mapping и, когда требуется, human adjudication procedure `XFR-D-058 v1.1`. PRODUCT-факт записи outcome авторизованным администратором после user confirmation сам по себе не переименовывается этим record'ом в `DOCUMENT_VERIFIED` или `BILATERALLY_CONFIRMED` и не создаёт автоматический ground truth. AI не повышает evidence level и не входит в human quorum.

### 3.4. `XFR-D-059`: exclusion не разрывает canonical linkage

Исключение outcome-derived records исправленной Campaign не удаляет source-authoritative identity/correction/supersedes edges и не превращает оставшиеся records в искусственно независимые samples.

Connected-component membership для всех included records продолжает определяться по полному source/provenance snapshot и closed edge set `XFR-D-059 v1.1`. Исправленная Campaign может оставаться conceptual bridge между другими candidate records; её exclusion как label не разрешает разрезать component или назначить связанные records в разные splits.

Само наличие исключённой исправленной Campaign в component не требует автоматически исключать все прочие records этого component, если их собственная eligibility, полная component membership evidence и one-component-to-one-split isolation доказаны. Если exclusion оставляет linkage неполной или component membership недоказанной, затронутые records исключаются fail closed по `XFR-D-059`; cross-split component приводит к `EVALUATION_RUN_REJECTED`.

### 3.5. Freeze-time и post-freeze corrections

Correction-history status оценивается as-of freeze time по зафиксированному source snapshot. Freeze evidence должен ссылаться на policy version/hash этого record'а, snapshot/freeze time и evidence, достаточное для подтверждения inclusion/exclusion; exact manifest schema/carrier остаётся `OPEN`.

Принятая correction после freeze не переписывает dataset, label, manifest или result уже frozen historical run. Для нового freeze эта Campaign подпадает под exclusion rule §3.1.

Точный процесс уведомления, impact review, сравнения и учёта post-freeze correction для уже `FROZEN`/`EXECUTED` run не определяется этим record'ом и остаётся `OPEN` под `XFR-D-071`. Этот record не объявляет historical run автоматически валидным или автоматически rejected после post-freeze correction.

### 3.6. Version boundary

Вариант A — включение current effective outcome исправленной Campaign — не допускается этой версией политики ни по умолчанию, ни как локальное исключение. Его будущее рассмотрение требует нового versioned `XFR-D-060` record с `supersedes`, evidence о label reliability/selection bias и полным сохранением `XFR-D-057`–`XFR-D-059` и post-freeze immutability.

## 4. Обязательные инварианты

1. Любая Campaign хотя бы с одной принятой correction исключается из outcome-derived ground-truth inclusion нового freeze.
2. Current effective outcome не является waiver для exclusion.
3. Historical/superseded outcome никогда не подменяет current label.
4. Missing/ambiguous/conflicting correction-history evidence fail closed.
5. Отсутствие correction не создаёт автоматическую eligibility.
6. Exclusion не создаёт negative/unknown/disputed/failed label.
7. Exclusion не удаляет canonical edges и не разрывает component `XFR-D-059`.
8. Post-freeze correction не переписывает historical run.
9. Вариант B не утверждает dataset, allocation, metrics, runtime или implementation.

## 5. Что остаётся `OPEN`

- exact synchronization/notification/impact-review procedure для correction после `FROZEN`/`EXECUTED` (`XFR-D-071`);
- dataset size, split ratios, allocation boundaries, randomization/seed rules (`XFR-D-062`);
- source-specific mechanism и controls, доказывающие полноту correction history и canonical Campaign identity;
- exact manifest schema/carrier, exclusion reason-code catalog, API/DB/event/runtime representation;
- quantitative representativeness/selection-bias evidence и допустимая граница потери coverage из-за conservative exclusion;
- возможный будущий вариант A, который требует нового superseding decision record;
- metric units/denominators, numeric targets и statistical comparison procedure;
- Evaluation Plan, dataset/evaluation-run, production-data/privacy и implementation approval.

## 6. Rationale

Current effective outcome является нормативным PRODUCT-состоянием, но correction history доказывает, что классификация конкретной Campaign уже менялась. Пока не утверждены reliability/selection-bias evidence, exact history controls и post-freeze synchronization procedure, использование даже current effective outcome создаёт риск silent label reinterpretation и неодинакового temporal cut.

Консервативное exclusion rule выбирает воспроизводимость и fail-closed label governance ценой меньшего coverage. Потеря coverage и возможный selection bias признаются явно и не маскируются: их количественная оценка остаётся отдельной evidence dependency, а не основанием ослабить boundary без нового решения.

## 7. Adversarial cases

1. **Current effective outcome выглядит достоверным после correction.** Campaign всё равно исключается; current effective не является waiver.
2. **Пытаются использовать исходную superseded запись.** Запрещено: historical outcome не используется как current evaluation label.
3. **Correction с тем же code была отклонена без записи.** Она сама по себе не образует принятую correction history, но Campaign включается только при доказанной полной и непротиворечивой history и выполнении всех остальных eligibility rules.
4. **Correction record найден, но ссылка lineage повреждена.** Campaign исключается fail closed; AI/heuristic reconstruction не разрешает inclusion.
5. **AI считает correction «несущественной».** AI не может отменить exclusion или повысить evidence level.
6. **Correction появилась после freeze.** Historical run не переписывается; новый freeze исключает Campaign, а exact impact-review mechanism остаётся `OPEN` под `XFR-D-071`.
7. **Исправленная Campaign является bridge между двумя другими records.** Её label exclusion не удаляет canonical edges; оставшиеся records сохраняют общий component по `XFR-D-059`.
8. **В одном component есть исправленная Campaign.** Остальные records не исключаются автоматически только по этому факту, но допускаются лишь при доказанной собственной eligibility, полной component evidence и atomic one-split assignment.
9. **Campaign не имеет correction, но outcome только self-reported.** XFR-D-060 не открывает eligibility; применяется `XFR-D-057`/`XFR-D-058`, fail closed.
10. **После exclusion metrics выглядят хорошими.** Это не утверждает Evaluation Plan, dataset, release, production use или governance gate.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §4.2, §5.3–§5.5, §8, §11 решение №4, `MEP-C-003` и readiness summary;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current owner-review overlay для `XFR-D-060`;
- будущие correction-history evidence/manifest/runtime artifacts — отдельные downstream artifacts, не создаются этим record'ом.

Ни один future sync не должен интерпретировать этот record как approval Evaluation Plan, dataset, evaluation run, production-data use или implementation.

## 9. Change control

Изменение conservative exclusion rule, source-proof boundary, связи с `XFR-D-057`–`XFR-D-059`, post-freeze immutability или допуск варианта A требует нового versioned `XFR-D-060` record, согласованного `Chief AI Architect + PRODUCT + AI + DEVELOPMENT + LEGAL`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** Campaign имеет хотя бы одну принятую correction до freeze, **when** рассматривается outcome-derived ground-truth inclusion, **then** Campaign и её outcome-derived labels исключаются до split assignment.
2. **Given** corrected Campaign имеет current effective outcome, **when** применяется XFR-D-060 v1.0, **then** current effective outcome не используется как waiver или evaluation label.
3. **Given** correction history отсутствует в доступном snapshot, но полнота snapshot не доказана, **when** проверяется inclusion, **then** Campaign исключается fail closed и не считается uncorrected по умолчанию.
4. **Given** Campaign не имеет принятой correction, **when** `XFR-D-057` eligibility или применимая `XFR-D-058` procedure не доказана, **then** outcome остаётся ineligible.
5. **Given** outcome-derived records исправленной Campaign исключены, **when** строится component, **then** её source-authoritative edges не удаляются и связанные records не становятся искусственно независимыми.
6. **Given** остальные records component имеют полную eligibility/component evidence, **when** corrected Campaign исключена как label, **then** они могут оставаться candidates только при atomic one-component-to-one-split assignment; blanket component exclusion этим record'ом не вводится.
7. **Given** correction принята после freeze, **when** рассматривается historical run, **then** его dataset/labels/results не переписываются; exact synchronization и impact review остаются `OPEN` под `XFR-D-071`.
8. **Given** предлагается использовать вариант A, **when** superseding `XFR-D-060` record отсутствует, **then** inclusion исправленной Campaign запрещена.
9. **Given** conservative exclusion уменьшает coverage, **when** оценивается representativeness, **then** потеря не скрывается и не превращается в автоматическое разрешение варианта A; quantitative boundary остаётся `OPEN`.
10. **Given** этот record, **when** проверяются Evaluation Plan approval, dataset/run authority, implementation и gates, **then** Proposal не получает `APPROVED`, dataset/run не утверждены, implementation не авторизована и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-060 CONSERVATIVE CORRECTION-HISTORY EXCLUSION BOUNDARY APPROVED — DATASET, POST-FREEZE SYNCHRONIZATION, RUNTIME AND IMPLEMENTATION REMAIN OPEN`
