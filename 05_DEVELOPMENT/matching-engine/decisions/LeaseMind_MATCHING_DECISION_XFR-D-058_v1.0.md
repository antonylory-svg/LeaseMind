# LeaseMind Matching Decision Record — XFR-D-058

**Decision ID:** `XFR-D-058`

**Название:** Fail-closed boundary for `DISPUTED` / `INCONCLUSIVE` label adjudication

**Версия:** 1.0

**Дата решения:** 2026-08-26

**Decision status:** `APPROVED PARTIAL`

**Статус:** `APPROVED FAIL-CLOSED LABEL-ELIGIBILITY BOUNDARY — exact adjudication workflow remains OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-26 working session

**Repository baseline:** `53ca730ae02fda3b156bac633e9b4ae69ec3145f`

**Scope:** governance semantics only; does not authorize implementation, runtime/API/DB/schema/event design, label-status additions, reason-code values or production-data use.

**Owner:** `AI + LEGAL` — approved governance assignment этого record'а, согласованная с `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §11, решение №2. Evaluation Plan является Proposal, поэтому это не утверждение, что Architecture напрямую назначает owner именно `XFR-D-058`.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + DEVELOPMENT`.

**Depends on:** разрешённый evidence-level mapping `XFR-D-057` остаётся отдельной зависимостью для допуска adjudicated label в ground truth; этот record не закрывает `XFR-D-057`.

---

## 1. Вопрос

Как evaluation procedure должна обращаться с label-quality statuses `DISPUTED` и `INCONCLUSIVE`, пока точная adjudication/disagreement procedure, blind/double review и допустимый evidence-level mapping не утверждены?

## 2. Source/status discipline

Architecture §27.2 нормативно задаёт закрытый список label-quality statuses:

`SELF_REPORTED | BILATERALLY_CONFIRMED | DOCUMENT_VERIFIED | EMPLOYEE_CONFIRMED | DISPUTED | INCONCLUSIVE`.

Architecture §27.2 также требует, чтобы ground truth использовал только labels с разрешённым уровнем доказательности, и запрещает автоматически считать одностороннее заявление или AI-вывод истинной меткой. Architecture §27.3 отдельно запрещает использовать спорное заявление о неявке как отрицательную обучающую метку.

Источники не задают готовую общую adjudication procedure для `DISPUTED`/`INCONCLUSIVE`. Следующие правила являются human-approved governance boundary этого record'а, а не заявлением о наличии готового runtime contract.

## 3. Решение

1. **Fail closed для ground truth.** Label со status `DISPUTED` или `INCONCLUSIVE` не допускается как resolved positive/negative ground truth для обучения, threshold search или final evaluation до завершения отдельно утверждённой adjudication procedure и прохождения `XFR-D-057` evidence-level mapping.
2. **Не negative by default.** Ни `DISPUTED`, ни `INCONCLUSIVE` не превращаются автоматически в negative label, zero score, failed match, non-event или absence of outcome.
3. **Не positive by default.** Эти statuses также не превращаются автоматически в confirmed positive label.
4. **Статусы различны.** `DISPUTED` и `INCONCLUSIVE` сохраняются раздельно и не нормализуются в единый generic `unknown`, `unusable` или `rejected` status.
5. **Original evidence сохраняется.** Adjudication не переписывает исходный label-quality status и evidence provenance задним числом. Результат adjudication должен быть отдельным auditable outcome/reference по будущему approved contract.
6. **AI не является единоличным adjudicator.** AI может систематизировать evidence и выявлять противоречия, но AI-only output не разрешает dispute и не создаёт ground truth автоматически.
7. **Отдельная diagnostic use допустима только без ground-truth claim.** Такие records могут учитываться в отдельной диагностике counts/rates, если frozen manifest явно отделяет её от ground-truth metric calculation и не интерпретирует как resolved outcome.
8. **No silent coercion.** Missing mappings, incomplete reviewer evidence или неизвестный adjudication status приводят к исключению record из ground-truth calculation и к fail-closed evidence verdict для затронутого run, а не к fallback-преобразованию.

## 4. Что остаётся `OPEN`

- точный adjudication workflow, стадии и quorum;
- blind review / double review и правила разрешения расхождений;
- reviewer qualifications, authority, independence и escalation path;
- допустимые evidence levels per label category (`XFR-D-057`);
- SLA, sampling policy и повторная adjudication;
- exact adjudication output representation, status mapping и audit-record schema;
- reason-code catalog, runtime/API/DB/event carrier;
- численные thresholds и metric targets.

## 5. Rationale

Fail-closed граница предотвращает наиболее опасную ошибку: превращение unresolved disagreement или недостаточной определённости в удобную положительную/отрицательную метку. Одновременно record не подменяет отсутствующую cross-functional adjudication procedure и не изобретает новый status enum.

## 6. Adversarial cases

1. **Спорная неявка.** Одна сторона заявляет no-show, другая оспаривает. Record остаётся `DISPUTED`, не становится negative fit label.
2. **Недостаточно evidence.** Reviewer не может установить outcome. `INCONCLUSIVE` не превращается в negative или confirmed positive.
3. **AI предлагает уверенный вывод.** Высокая model confidence не разрешает `DISPUTED` и не заменяет adjudication authority.
4. **Смешанный dataset.** Pipeline пытается включить `DISPUTED` records в final metrics через fallback `false`. Run обязан fail closed для затронутого ground-truth calculation.
5. **Переименование для обхода.** `DISPUTED` и `INCONCLUSIVE` нельзя объединить в local `unknown` и затем считать разрешёнными без `XFR-D-057` и утверждённой adjudication procedure.

## 7. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §5.5, §11 решение №2 и связанные acceptance criteria;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-058`;
- будущий label/adjudication contract — только после отдельного решения, не создаётся этим record'ом.

## 8. Change control

Изменение fail-closed eligibility boundary для `DISPUTED`/`INCONCLUSIVE` требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 10. Acceptance criteria

1. **Given** label имеет status `DISPUTED` или `INCONCLUSIVE`, **when** отсутствует approved adjudication outcome и разрешённый evidence-level mapping, **then** label не участвует как resolved ground truth.
2. **Given** unresolved label, **when** pipeline ожидает boolean/positive-negative value, **then** silent coercion запрещён и расчёт fail closed.
3. **Given** AI output предлагает разрешение dispute, **when** нет approved adjudication authority evidence, **then** исходный status не изменяется.
4. **Given** diagnostic report учитывает unresolved labels, **when** формируются metrics, **then** diagnostic counts отделены от ground-truth metrics.
5. **Given** этот record, **when** проверяется status vocabulary, **then** новые label statuses не введены.
6. **Given** exact workflow, reviewer quorum, runtime representation и reason codes, **when** проверяется их статус, **then** все остаются `OPEN`.

## 11. Итог

`XFR-D-058 FAIL-CLOSED LABEL-ELIGIBILITY BOUNDARY APPROVED — EXACT ADJUDICATION WORKFLOW AND EVIDENCE-LEVEL MAPPING REMAIN OPEN`
