# LeaseMind Matching Decision Record — XFR-D-057

**Decision ID:** `XFR-D-057`

**Название:** Allowed label-evidence eligibility boundary per Evaluation label category

**Версия:** 1.0

**Дата решения:** 2026-08-27

**Resolution status:** `RESOLVED_QUALITATIVE_ELIGIBILITY_BOUNDARY`

**Статус:** `APPROVED QUALITATIVE LABEL-EVIDENCE ELIGIBILITY BOUNDARY — reviewer procedure, quorum, runtime representation and production-data use remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-27 working session

**Repository baseline:** `68fe26a4617eb13dc93269addb3ea437f96979c0`

**Scope:** governance eligibility semantics only; does not approve an Evaluation Plan, dataset, evaluation run, production-data use, numeric threshold, reviewer workflow, runtime/API/DB/schema/event representation or implementation.

**Governance owner:** `AI + DEVELOPMENT + LEGAL` — approved governance assignment, согласованная с `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §11, решение №1. Evaluation Plan остаётся Proposal; это не claim, что Architecture напрямую задаёт готовую category/status matrix.

**Mandatory approvers:** `Chief AI Architect + PRODUCT`.

**Depends on:** `XFR-D-058 v1.0` сохраняет fail-closed boundary для `DISPUTED`/`INCONCLUSIVE`; exact adjudication workflow остаётся отдельным решением. `XFR-D-060` (Campaign correction history), `XFR-D-062` (dataset size/split ratios) и production/privacy prerequisites остаются независимо `OPEN`.

---

## 1. Вопрос

Какие значения нормативного label-quality enum могут считаться допустимым evidence для каждой из пяти Evaluation Plan label-категорий, не превращая односторонние заявления, AI-выводы, спорные статусы или технические fixtures в ложный ground truth?

## 2. Source/status discipline

Architecture §27.2 нормативно задаёт закрытый label-quality enum:

`SELF_REPORTED | BILATERALLY_CONFIRMED | DOCUMENT_VERIFIED | EMPLOYEE_CONFIRMED | DISPUTED | INCONCLUSIVE`.

Architecture §27.2 также требует использовать как ground truth только labels с разрешённым уровнем доказательности и запрещает автоматически считать одностороннее заявление или AI-вывод истинной меткой. Architecture §27.3 запрещает использовать спорное заявление о неявке как отрицательную обучающую метку. Architecture §30.3 требует проверку качества меток до offline evaluation.

Evaluation Plan §5.1 предлагает пять label-категорий, но до этого record'а не задаёт разрешённую category/status matrix. Следующее решение является human-approved governance boundary, а не утверждением готового runtime label contract.

## 3. Решение

### 3.1. Category/status eligibility matrix

| Label-категория | Допустимая qualitative eligibility | Обязательная граница |
|---|---|---|
| Deterministic contract/rule expected outputs | Label-quality enum **не применяется** | Требуется versioned fixture/contract manifest с ожидаемым результатом и provenance. Технический expected output не переименовывается в `DOCUMENT_VERIFIED` или иной feedback status |
| Expert relevance/compatibility labels | `EMPLOYEE_CONFIRMED` — **условно допустим** | Reviewer authority, qualification и independence должны быть установлены approved procedure. До этого label не допускается как ground truth |
| Gate/safety labels | `DOCUMENT_VERIFIED` или `EMPLOYEE_CONFIRMED` — **условно допустимы** | Конкретная source policy должна разрешать evidence и authority для соответствующего gate/safety факта. Process-only, неподтверждённые и спорные события исключаются |
| Business outcomes | `DOCUMENT_VERIFIED`; `BILATERALLY_CONFIRMED` — только когда обе стороны подтверждают именно данный outcome | Одностороннее заявление недостаточно. Correction history и выбор current effective outcome при freeze остаются отдельно `OPEN` под `XFR-D-060` |
| User feedback/preference signals | `SELF_REPORTED` — только для явно отделённой diagnostic или user-specific analysis | Не становится общим ground truth, не переносится между пользователями и не используется для platform-level policy/model conclusions без отдельного разрешённого evidence |

### 3.2. Общие invariants

1. **`DISPUTED` и `INCONCLUSIVE` не являются resolved ground truth.** Они допускаются только после отдельного approved adjudication outcome и не переписываются задним числом; действует `XFR-D-058 v1.0`.
2. **AI output не повышает evidence level.** AI может систематизировать evidence и выявлять противоречия, но не превращает label в confirmed ground truth.
3. **Fail closed для неизвестного сочетания.** Любая category/status комбинация, не разрешённая матрицей и применимой source policy, исключается из ground-truth calculation; permissive fallback запрещён.
4. **Original status и provenance immutable.** Последующее подтверждение или adjudication создаёт отдельный auditable outcome/reference и не переписывает исходное evidence.
5. **Conditional eligibility не равна готовности к использованию.** `EMPLOYEE_CONFIRMED`, `DOCUMENT_VERIFIED` или `BILATERALLY_CONFIRMED` допускаются только при наличии применимой approved source/reviewer procedure, authority evidence и полного frozen manifest.
6. **Diagnostic use отделена от ground truth.** `SELF_REPORTED`, unresolved и иные неeligible records могут учитываться только в явно отделённых counts/rates без ground-truth claim и без влияния на threshold/model selection.

## 4. Что остаётся `OPEN`

- exact adjudication workflow, blind/double review, quorum, disagreement resolution и escalation path (`XFR-D-058` exact часть);
- reviewer qualifications, named appointment, RBAC и independence evidence;
- exact source-policy mapping для каждого конкретного gate/safety факта;
- Campaign correction-history handling at freeze (`XFR-D-060`);
- dataset size, split ratios, metric targets и statistical procedure (`XFR-D-062`, `XFR-D-063`, `XFR-D-070`);
- runtime/API/DB/schema/event representation, status mapping и reason-code catalog;
- real production-data use, privacy/legal prerequisites и Evaluation Plan approval;
- любые numeric thresholds и implementation details.

## 5. Rationale

Матрица разрешает минимальную qualitative eligibility semantics, требуемую Architecture §27.2, но не подменяет отсутствующие reviewer/source procedures. Отдельная строка для deterministic fixtures предотвращает ложное применение feedback enum к contract evidence. Условность остальных допусков сохраняет fail-closed режим: наличие подходящего status само по себе не доказывает authority, provenance или пригодность конкретной записи.

## 6. Adversarial cases

1. **Synthetic fixture помечают `DOCUMENT_VERIFIED`.** Запрещено: contract expected output использует manifest/provenance и не получает feedback label-quality status.
2. **AI подтверждает expert relevance.** Запрещено: AI-only output не создаёт `EMPLOYEE_CONFIRMED` и не допускает label в ground truth.
3. **Одна сторона сообщает успешный outcome.** `SELF_REPORTED` недостаточно для business-outcome ground truth; требуется допустимое подтверждение.
4. **Обе стороны подтверждают разные outcomes.** Конфликт не становится `BILATERALLY_CONFIRMED`; применяется `DISPUTED`/`INCONCLUSIVE` boundary и будущая adjudication procedure.
5. **Сотрудник подтверждает label без authority evidence.** Status сам по себе недостаточен; до approved reviewer procedure label остаётся ineligible.
6. **User preference переносится другому пользователю.** Запрещено: self-reported preference ограничена user-specific/diagnostic использованием.
7. **Неизвестная category/status комбинация получает fallback.** Запрещено: запись исключается fail closed из ground-truth calculation.

## 7. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §5.5, §11 решение №1 и связанные acceptance criteria;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — новый Evaluation label-evidence status overlay для `XFR-D-057`;
- будущий exact label/adjudication contract — отдельный artifact/decision, не создаётся этим record'ом.

Ни один future sync не должен интерпретировать этот record как approval Evaluation Plan, dataset или evaluation run.

## 8. Change control

Изменение этой category/status eligibility boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + AI + DEVELOPMENT + LEGAL`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 10. Acceptance criteria

1. **Given** deterministic contract fixture, **when** фиксируется expected output, **then** используется versioned manifest/provenance, а feedback label-quality enum не применяется.
2. **Given** expert relevance label со status `EMPLOYEE_CONFIRMED`, **when** reviewer authority/qualification/independence procedure не утверждена, **then** label не допускается как ground truth.
3. **Given** gate/safety label, **when** нет применимой source policy и authority evidence, **then** `DOCUMENT_VERIFIED`/`EMPLOYEE_CONFIRMED` status сам по себе не открывает eligibility.
4. **Given** business outcome, **when** он только `SELF_REPORTED`, **then** он не участвует как resolved ground truth.
5. **Given** user feedback `SELF_REPORTED`, **when** строится diagnostic, **then** он отделён от ground-truth metrics и не переносится между пользователями.
6. **Given** label `DISPUTED` или `INCONCLUSIVE`, **when** approved adjudication outcome отсутствует, **then** label не является resolved ground truth.
7. **Given** неизвестная category/status комбинация, **when** pipeline требует ground truth, **then** запись исключается fail closed без fallback coercion.
8. **Given** этот record, **when** проверяются gates и implementation authority, **then** все три gates остаются `BLOCKED`, а implementation не авторизована.

## 11. Итог

`XFR-D-057 QUALITATIVE LABEL-EVIDENCE ELIGIBILITY BOUNDARY APPROVED — EXACT REVIEWER/ADJUDICATION PROCEDURE, RUNTIME REPRESENTATION AND PRODUCTION-DATA USE REMAIN OPEN`
