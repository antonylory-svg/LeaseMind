# LeaseMind Matching Decision Record — XFR-D-030

**Decision ID:** `XFR-D-030`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED GOVERNANCE ASSIGNMENT — does not approve MATCHING_QUALIFICATION_POLICY or authorize implementation`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

## 1. Вопрос

Кто является artifact owner и обязательными approvers для `MATCHING_QUALIFICATION_POLICY`?

## 2. Решение

- **Artifact owner:** `Chief AI Architect + PRODUCT`.
- **Mandatory approvers:** `LEGAL + DEVELOPMENT`.
- `AI` участвует как consulted domain function, если его ответственность не покрыта ролью Chief AI Architect.

Решение назначает роли, а не конкретных людей. Именные назначения и RBAC выполняются отдельным operational record.

## 3. Authority boundary

Artifact owner отвечает за:

- целостность Qualification semantics и четырёх routing results;
- согласованность с Feature Schema, Scoring, Risk, Evaluation и Safe Presentation;
- versioning, change-control proposal и supersession intent;
- подготовку полного approval package.

`LEGAL` обязательно подтверждает rights-affecting routing, human-review и protected/proxy boundaries.

`DEVELOPMENT` обязательно подтверждает реализуемость, reproducibility, version compatibility и отсутствие конфликта с Data Contracts.

Ни artifact owner, ни approver по отдельности не получают право единолично менять policy.

## 4. Запрещённые conflations

- filename, service, gate или technical writer не являются owner-ролью;
- `AI + LEGAL`, назначенные Architecture §37 №8 для Risk→routing threshold, не становятся owner всей Qualification Policy;
- approval этого owner assignment не является approval самого Proposal;
- назначение owner не выбирает thresholds, precedence, reason catalog или runtime representation.

## 5. Rationale

Qualification routing соединяет архитектурную целостность и продуктовый смысл результата. Поэтому owner объединяет Chief AI Architect и PRODUCT, а LEGAL и DEVELOPMENT сохраняют обязательное независимое подтверждение юридической границы и технической реализуемости.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_QUALIFICATION_POLICY_v0.1.md` — metadata и open decision №1 должны быть синхронизированы отдельным pass;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — `XFR-D-030` должен получить ссылку на этот record;
- Controlled Artifact Manifest design — будущая запись должна использовать утверждённые роли после approval самого policy artifact.

## 7. Gate impact

`NONE`. Все три gate остаются `BLOCKED`. Это решение не утверждает Qualification Policy и не выполняет Architecture §36.2 условия 2 или 5.

## 8. Change control

Изменение owner или обязательных approvers требует нового versioned decision record, согласованного `Chief AI Architect + PRODUCT + LEGAL + DEVELOPMENT`, со ссылкой `supersedes` на эту запись.

## 9. Итог

`XFR-D-030 GOVERNANCE ASSIGNMENT APPROVED — POLICY NOT APPROVED`
