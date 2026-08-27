# LeaseMind Matching Decision Record — XFR-D-058

**Decision ID:** `XFR-D-058`

**Название:** Human adjudication procedure for `DISPUTED` / `INCONCLUSIVE` Evaluation labels

**Версия:** 1.1

**Дата решения:** 2026-08-27

**Resolution status:** `RESOLVED_PROCEDURAL_GOVERNANCE_BOUNDARY`

**Статус:** `APPROVED HUMAN ADJUDICATION PROCEDURE — named appointments, runtime representation, SLA, sampling and production-data use remain OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-27 working session

**Repository baseline:** `9379fe6549fda6ac6dc6fa90b8e3ff76f6903c00`

**Supersedes:** `LeaseMind_MATCHING_DECISION_XFR-D-058_v1.0.md`. Версия 1.1 полностью сохраняет fail-closed label-eligibility boundary v1.0 и добавляет exact human governance procedure; v1.0 остаётся immutable historical record.

**Scope:** governance procedure only; does not authorize dataset construction, evaluation execution, production-data use, implementation, runtime/API/DB/schema/event design, new enum/status/reason-code values, numeric thresholds or Evaluation Plan approval.

**Governance owner:** `AI + LEGAL` — сохраняется из `XFR-D-058 v1.0` и Evaluation Plan §11, решение №2.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + DEVELOPMENT`.

**Depends on:** qualitative category/status eligibility matrix `XFR-D-057 v1.0`; эта dependency разрешена. Named reviewer appointment/RBAC, applicable source-policy authority, runtime carrier и production/privacy prerequisites остаются независимо `OPEN`.

---

## 1. Вопрос

Какая human adjudication procedure переводит unresolved Evaluation label из `DISPUTED`/`INCONCLUSIVE` в отдельный auditable adjudication outcome, пригодный для проверки eligibility по `XFR-D-057`, не переписывая исходный evidence и не позволяя AI или одному reviewer единолично создавать ground truth?

## 2. Source/status discipline

Architecture §27.2 нормативно задаёт label-quality statuses и требует использовать как ground truth только labels с разрешённым уровнем доказательности. Architecture §27.3 запрещает считать спорное заявление о неявке отрицательной обучающей меткой и запрещает Matching Engine устанавливать факт спорной неявки. Architecture §30.3 требует проверку качества меток до offline evaluation.

`XFR-D-058 v1.0` human-approved fail-closed boundary: `DISPUTED`/`INCONCLUSIVE` не становятся positive/negative/unknown/rejected автоматически; исходный evidence сохраняется; AI-only adjudication запрещена. `XFR-D-057 v1.0` позднее разрешил qualitative category/status eligibility matrix.

Architecture §21.7 и §19 дают source-backed governance analogues — immutable motivated Decision Record, reviewer/RBAC/appointment evidence, conflict-of-interest check и независимый second-level control — но не устанавливают эту exact Evaluation-label procedure напрямую. Следующая процедура является human-approved governance decision этого record'а, а не claim о готовом runtime contract.

## 3. Решение

### 3.1. Freeze evidence packet до review

До первого reviewer determination фиксируется versioned evidence packet, содержащий как минимум:

- исходный label и исходный label-quality status;
- label category по Evaluation Plan §5.1;
- evidence provenance и ссылки на immutable/source-controlled evidence;
- applicable source-policy reference;
- dataset/run context только как идентифицирующий governance context, не как разрешение запуска;
- policy version/hash и evidence-packet manifest hash;
- известные противоречия и missing evidence без их silent normalization.

После freeze пакет не переписывается. Дополнительное evidence создаёт новую versioned packet/review attempt, а не изменяет использованный пакет задним числом.

### 3.2. Reviewer eligibility и separation of duties

Каждый human reviewer до доступа к determination должен иметь подтверждённые:

- applicable reviewer authority и RBAC role;
- qualification для рассматриваемой label category/source evidence;
- independence от автора model/dataset и от собственного предыдущего determination в этом кейсе;
- пройденную conflict-of-interest check;
- appointment/reference evidence по будущей approved operational policy.

Именные назначения, конкретные RBAC identifiers и организационный roster этим record'ом не утверждаются. Reviewer без полного authority evidence не входит в quorum.

### 3.3. Два независимых first-level review

1. Один и тот же frozen evidence packet независимо рассматривают **два разных human reviewers**.
2. До фиксации собственного determination каждый reviewer не видит determination другого reviewer.
3. Reviewer не получает AI/model recommendation как предлагаемую истину или default outcome. AI-generated indexing/summary допустимы только как явно маркированные вспомогательные материалы, проверяемые против original evidence.
4. Каждый reviewer отдельно фиксирует:
   - установленные факты;
   - использованное evidence;
   - применённую policy version;
   - мотивированный qualitative determination;
   - unresolved uncertainty и conflict indicators.
5. Первичные determinations immutable и не редактируются для достижения согласия.

### 3.4. Quorum и second-level resolution

Adjudication outcome может считаться resolved только при наличии **двух согласованных human determinations**:

- либо совпадают два независимых first-level determinations;
- либо при их расхождении один first-level determination получает отдельное подтверждение third human second-level reviewer.

Second-level reviewer:

- является третьим человеком и не совпадает ни с одним first-level reviewer;
- имеет отдельную applicable authority/RBAC role;
- повторно проходит qualification, independence и conflict-of-interest checks;
- рассматривает frozen packet и обе immutable first-level записи;
- фиксирует собственное мотивированное confirmation одного determination либо оставляет кейс unresolved.

Second-level reviewer не создаёт permissive outcome при недостаточном evidence. Если он не может подтвердить один из determinations, label остаётся `DISPUTED`/`INCONCLUSIVE` для ground-truth целей.

### 3.5. Outcome и ground-truth eligibility

Согласованный human outcome создаётся отдельной append-only adjudication record/reference. Он не переписывает исходный label-quality status, evidence packet или first-level determinations.

Label становится eligible candidate для ground truth только когда одновременно выполнены все условия:

1. quorum из двух согласованных human determinations доказан;
2. каждый участник quorum имеет полный authority/qualification/independence/conflict-check evidence;
3. adjudication outcome допустим qualitative matrix `XFR-D-057 v1.0` и applicable source policy;
4. frozen packet и все review records полны и version/hash-consistent;
5. unresolved material conflict отсутствует.

Выполнение этих условий создаёт только eligibility candidate. Оно не утверждает dataset, evaluation run, metric result, threshold, model/policy release или production use.

### 3.6. Fail-closed outcomes

Label не допускается как resolved ground truth при любом из условий:

- недостаточное, missing или противоречивое evidence;
- неполный quorum;
- reviewer без подтверждённой authority/qualification/independence;
- неразрешённый conflict of interest;
- расхождение determinations без second-level confirmation;
- неизвестный, неподдержанный или не разрешённый `XFR-D-057` outcome/category mapping;
- несовпадение version/hash evidence packet или review records;
- попытка использовать AI-only output как determination.

Fail-closed не означает negative outcome, zero score, rejected party, failed match или absence of event. Label сохраняет unresolved semantics и может учитываться только в отдельно обозначенной diagnostic статистике без ground-truth claim.

### 3.7. Appeal и re-adjudication

Appeal, новое evidence или re-adjudication создают новый append-only evidence packet/review cycle со ссылкой на предыдущий outcome. Предыдущие packets, determinations и outcomes не удаляются, не переписываются и не переинтерпретируются задним числом.

Exact appeal deadlines, SLA, sampling/re-adjudication policy и final organizational escalation path остаются `OPEN`.

## 4. Conceptual outcomes — не runtime enum

Для governance reasoning допустимы только следующие концептуальные результаты:

- evidence supports an eligible positive determination;
- evidence supports an eligible negative determination;
- evidence remains unresolved/inconclusive.

Эти фразы не являются canonical runtime tokens и не добавляют значения в label-quality enum, reason catalog, Evaluation verdicts, Qualification results или Gate states. Exact representation и mapping остаются `OPEN`.

## 5. Что остаётся `OPEN`

- named reviewer appointments, concrete RBAC identifiers и operational roster;
- точные qualification criteria per label category/source;
- exact conflict-of-interest questionnaire/control implementation;
- SLA, appeal deadlines, sampling и обязательность periodic re-adjudication;
- runtime/API/DB/schema/event representation, status mapping и reason-code catalog;
- technical evidence-packet/manifest schema и storage;
- Campaign correction-history handling (`XFR-D-060`);
- dataset size/split ratios, metric targets и statistical procedure (`XFR-D-062`, `XFR-D-063`, `XFR-D-070`);
- production-data use, privacy/legal prerequisites, Evaluation Plan approval и implementation.

## 6. Rationale

Два independent first-level determinations предотвращают превращение субъективного решения одного reviewer в ground truth. Third second-level reviewer используется только при реальном расхождении и создаёт второй согласованный human determination, не отменяя исходную запись. Immutable packets и append-only outcomes сохраняют auditability и не позволяют подогнать evidence под желаемый результат. Fail-closed режим сохраняет v1.0 boundary и `XFR-D-057` conditional eligibility.

## 7. Adversarial cases

1. **Два reviewer обсуждают кейс до фиксации выводов.** Independence нарушена; quorum не доказан.
2. **Один reviewer подписывает обе записи.** Запрещено: нужны два разных человека.
3. **Reviewer меняет determination после просмотра вывода коллеги.** Первичная запись immutable; требуется disagreement/second-level path.
4. **AI предлагает уверенный outcome.** AI summary не входит в human quorum и не создаёт ground truth.
5. **First-level reviewers расходятся, third reviewer не уверен.** Кейс остаётся unresolved; majority-by-default или permissive fallback запрещены.
6. **Third reviewer имеет конфликт интересов.** Его confirmation не входит в quorum.
7. **Есть два согласованных вывода, но нет applicable `XFR-D-057` mapping.** Eligibility не возникает.
8. **После adjudication появилось новое evidence.** Создаётся новая versioned review cycle; прошлый outcome не переписывается.
9. **Resolved label используют для запуска evaluation.** Запрещено: eligibility не равна dataset/run approval.

## 8. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §5.5, §11 решение №2 и связанные acceptance criteria;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — current overlay для `XFR-D-058 v1.1`;
- будущий label/adjudication contract и operational reviewer policy — отдельные downstream artifacts, не создаются этим record'ом.

Ни один future sync не должен интерпретировать этот record как approval Evaluation Plan, dataset, evaluation run или implementation.

## 9. Change control

Изменение quorum, independence, separation-of-duties, fail-closed outcome или append-only правил требует нового versioned `XFR-D-058` record, согласованного `Chief AI Architect + PRODUCT + AI + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту версию.

## 10. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`.

## 11. Acceptance criteria

1. **Given** frozen evidence packet, **when** начинается review, **then** два разных first-level reviewers независимо фиксируют determinations до просмотра вывода друг друга.
2. **Given** два first-level determinations совпадают, **when** проверяется quorum, **then** присутствуют два полных authority/qualification/independence/conflict-check records.
3. **Given** first-level determinations расходятся, **when** требуется resolution, **then** third second-level reviewer подтверждает один determination либо оставляет label unresolved.
4. **Given** second-level reviewer совпадает с first-level reviewer или имеет conflict of interest, **when** проверяется quorum, **then** его confirmation недействительно.
5. **Given** AI/model output предлагает outcome, **when** human quorum отсутствует, **then** ground-truth eligibility не возникает.
6. **Given** quorum доказан, **when** `XFR-D-057`/source-policy mapping не разрешает outcome, **then** label остаётся ineligible.
7. **Given** adjudication завершена, **when** создаётся outcome, **then** исходный label/status, packet и determinations не переписываются.
8. **Given** evidence, quorum или version/hash records неполны, **when** pipeline требует ground truth, **then** label исключается fail closed без coercion в positive/negative.
9. **Given** appeal или новое evidence, **when** выполняется re-adjudication, **then** создаётся новая append-only cycle со ссылкой на прошлую.
10. **Given** этот record, **when** проверяются runtime design, dataset/evaluation approval и gates, **then** новые runtime tokens не введены, dataset/run не утверждены, implementation не авторизована и все три gates остаются `BLOCKED`.

## 12. Итог

`XFR-D-058 v1.1 HUMAN ADJUDICATION PROCEDURE APPROVED — NAMED APPOINTMENTS, RUNTIME REPRESENTATION, SLA, SAMPLING AND PRODUCTION-DATA USE REMAIN OPEN`
