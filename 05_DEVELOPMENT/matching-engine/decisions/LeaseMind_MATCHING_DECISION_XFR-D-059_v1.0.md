# LeaseMind Matching Decision Record — XFR-D-059

**Decision ID:** `XFR-D-059`

**Название:** Evaluation grouping/split leakage fail-closed boundary

**Версия:** 1.0

**Дата решения:** 2026-08-26

**Decision status:** `APPROVED PARTIAL`

**Статус:** `APPROVED FAIL-CLOSED SPLIT-ISOLATION BOUNDARY — exact grouping/isolation policy remains OPEN`

**Decision authority:** human project-governance confirmation in the 2026-08-26 working session

**Repository baseline:** `53ca730ae02fda3b156bac633e9b4ae69ec3145f`

**Scope:** governance semantics only; does not authorize dataset construction, evaluation execution, implementation, runtime/API/DB/schema/event design or production-data use.

**Owner:** `AI + DEVELOPMENT` — approved governance assignment этого record'а, согласованная с `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §11, решение №3. Evaluation Plan является Proposal; это не claim, что Architecture уже задаёт точную grouping policy.

**Mandatory approvers:** `Chief AI Architect + PRODUCT + LEGAL`.

**Depends on:** exact grouping/isolation policy остаётся незакрытой частью самого `XFR-D-059`; dataset size/split ratios остаются отдельно `OPEN` под `XFR-D-062`.

---

## 1. Вопрос

Какую safety boundary можно утвердить до выбора точной grouping/isolation policy, определяющей связанность `Property`, `TenantRequest`, Campaign, `match_pair_id`, `encounter_id` и version/revision lineage?

## 2. Source/status discipline

`LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` §4.1 перечисляет возможные units of evaluation только как candidates и прямо оставляет точную grouping/isolation policy `OPEN_BLOCKED_PENDING_DECISION`. §4.2 и `MEP-C-002` предлагают fail-closed boundary: до утверждения policy split не считается валидным, а после утверждения любое пересечение связанной цепочки между tuning и final evaluation отклоняет run.

Этот record human-approves именно fail-closed boundary. Он не выдаёт candidate units за готовую source-normative grouping policy.

## 3. Решение

1. **No valid split before policy.** Пока exact grouping/isolation policy не утверждена отдельным versioned decision, ни один tuning/final split не считается валидным и evaluation run не переходит в `FROZEN`.
2. **Connected-chain isolation после утверждения policy.** После утверждения policy ни одна сущность или цепочка, признанная ею связанной, не может присутствовать одновременно в tuning и final evaluation.
3. **Leakage fails closed.** Обнаруженное cross-split пересечение, duplicate/replay leakage либо невозможность доказать isolation приводит к `EVALUATION_RUN_REJECTED`; это не warning и не условно пройденный run.
4. **Final data не участвует в tuning.** Final evaluation data не используется для выбора или настройки threshold/model/policy version, которая затем оценивается на том же final split.
5. **Version lineage учитывается будущей policy.** Exact policy обязана определить, как revisions/versions одной логической сущности группируются и изолируются; отсутствие такого определения считается неполной policy.
6. **No default widest-aggregate assumption.** Этот record не выбирает «самый широкий связанный aggregate», отдельный ID или их фиксированную комбинацию как каноническую grouping key.
7. **Ratios независимы.** Train/tuning/final ratios и minimum dataset size не выводятся из isolation boundary и остаются `OPEN` под `XFR-D-062`.
8. **Manifest evidence required.** Будущий freeze-time manifest должен ссылаться на approved policy version/hash и фиксировать split assignments/hashes; точный manifest/runtime carrier не проектируется этим record'ом.

## 4. Минимальные требования к будущей exact policy

Будущая policy должна как минимум явно определить:

- каноническую границу связанности и используемые IDs/lineage;
- обработку revisions, corrections, duplicates и replay-derived records;
- deterministic assignment одной связанной группы ровно в один split;
- доказательство отсутствия cross-split overlap;
- versioning/change control policy;
- поведение при missing/unresolvable linkage — fail closed;
- независимость final split от threshold/model selection.

Этот список является governance completeness boundary, а не готовой technical implementation specification.

## 5. Что остаётся `OPEN`

- конкретная grouping key/formula и canonical connected-component algorithm;
- выбор unit of evaluation;
- handling cross-Campaign/common-Property/common-TenantRequest relationships;
- temporal windows и version/revision cutoffs;
- split ratios, randomization/seed rules и minimum dataset size (`XFR-D-062`);
- physical storage, hashes, schema, API/CLI и implementation;
- exact operational remediation для rejected run.

## 6. Adversarial cases

1. **Один Property, разные Campaigns.** Один revision попал в tuning, другой в final. Без approved lineage rule isolation не доказана — split невалиден.
2. **Один pair, разные encounter IDs.** Разные encounter records не гарантируют независимость; решение определяется будущей policy, а до неё run не `FROZEN`.
3. **Duplicate с новым ID.** Содержательно та же запись получает новый identifier. Если duplicate/replay linkage не доказан, pipeline не может считать её независимой по умолчанию.
4. **Threshold leakage.** Final split используется для выбора threshold, затем тем же split подтверждается качество. Такой результат отклоняется независимо от достигнутой метрики.
5. **Missing linkage.** Часть records не позволяет установить цепочку связанности. Они не распределяются случайно между splits как fallback.

## 7. Затронутые артефакты (future separate sync)

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — §4, §10, §11 решение №3, `MEP-C-002` и `MEP-C-011`;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — status overlay для `XFR-D-059`;
- будущая versioned grouping/isolation policy — отдельный artifact/decision, не создаётся этим record'ом.

## 8. Change control

Изменение fail-closed split-isolation boundary требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Gate impact

`NONE`. `IMPLEMENTATION_READINESS_GATE`, `SYNTHETIC_ACCEPTANCE_GATE` и `PRODUCTION_LAUNCH_GATE` остаются `BLOCKED`. Evaluation run не может перейти в `FROZEN` до утверждения exact policy.

## 10. Acceptance criteria

1. **Given** exact grouping/isolation policy отсутствует, **when** формируется split, **then** split невалиден и run не переходит в `FROZEN`.
2. **Given** approved policy существует, **when** одна связанная policy-defined chain найдена в tuning и final, **then** run получает `EVALUATION_RUN_REJECTED`.
3. **Given** final data использована при threshold/model selection, **when** тот же final split используется для подтверждения, **then** evaluation отклоняется.
4. **Given** linkage missing или неоднозначна, **when** isolation нельзя доказать, **then** нет permissive fallback.
5. **Given** этот record, **when** ищется конкретная grouping key, split ratio или dataset size, **then** ни одно значение не утверждено.
6. **Given** будущая exact policy, **when** проверяется completeness, **then** она покрывает требования §4 и имеет versioned change control.

## 11. Итог

`XFR-D-059 FAIL-CLOSED SPLIT-ISOLATION BOUNDARY APPROVED — EXACT GROUPING POLICY, SPLIT RATIOS AND IMPLEMENTATION REMAIN OPEN`
