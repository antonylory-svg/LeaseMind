# LeaseMind Matching Decision Record — XFR-D-067

**Decision ID:** `XFR-D-067`

**Версия:** 1.0

**Дата решения:** 2026-08-23

**Статус:** `APPROVED DATA GOVERNANCE AUTHORITY MODEL — operational appointment remains required`

**Decision authority:** human project-governance confirmation in the 2026-08-23 working session

## 1. Вопрос

Какая роль обладает Data Governance authority для разрешения использования необратимо обезличенных данных в segment analytics или training?

## 2. Решение

- **Accountable function:** Data Governance authority, accountable to `LEGAL` и независимая от автора model/dataset.
- **Evidence provider:** `AI` предоставляет purpose, dataset manifest, transformation method и model-use justification.
- **Control verification:** `DEVELOPMENT + SECURITY` подтверждают техническое выполнение irreversible de-identification controls.
- **Authority actions:** `APPROVE`, `REJECT`, `REQUIRE_REMEDIATION`.
- **Conflict rule:** создатель dataset или model не может единолично одобрить собственный пакет.

Именное назначение человека/комитета, RBAC и escalation contact остаются обязательным operational follow-up до первого использования данных.

## 3. Минимальная authority boundary

Data Governance authority:

- проверяет purpose limitation и допустимый use case;
- требует доказательства удаления direct identifiers и reverse mappings;
- проверяет generalization/exclusion редких комбинаций, точной географии и точных timestamps;
- требует проверки protected attributes/proxies и re-identification risk;
- принимает только versioned evidence package с method/version/date/result;
- может остановить или отозвать ранее разрешённое использование при изменении dataset, purpose, method или risk evidence.

`LEGAL` сохраняет ответственность за lawful basis и правовую допустимость. `AI`, `DEVELOPMENT` и `SECURITY` не заменяют Data Governance authority своими техническими заключениями.

## 4. Запрещённые conflations

- Data Governance не является названием файла, gate или автоматического сервиса;
- model owner не может единолично быть reviewer собственного dataset package;
- pseudonymized personal data не считается необратимо обезличенным;
- прохождение DLP или schema validation само по себе не является Data Governance approval;
- synthetic evaluation evidence не разрешает production/training use реальных данных.

## 5. Rationale

Architecture §8.4 требует разрешение Data Governance, но не определяет authority model. Accountability перед LEGAL и независимость от автора модели обеспечивают разделение обязанностей, а DEVELOPMENT + SECURITY предоставляют проверяемое техническое evidence без получения права принять финальное governance-решение.

## 6. Затронутые артефакты

- `LeaseMind_MATCHING_EVALUATION_PLAN_v0.1.md` — open decision №13 должен быть синхронизирован с authority model и operational-appointment follow-up;
- `LeaseMind_MATCHING_CROSS_FUNCTIONAL_DECISION_INVENTORY_v1.0.md` — `XFR-D-067` получает approved authority-model status и ссылку на этот record;
- будущие dataset manifest, privacy/security specification и reviewer RBAC records должны ссылаться на это решение.

## 7. Gate impact

`NONE`. Решение не одобряет dataset, Evaluation Plan или обучение и не переводит ни один gate в `READY`.

## 8. Change control

Изменение accountability, independence или authority actions требует нового versioned record с согласованием `LEGAL + Chief AI Architect + SECURITY`, а также `PRODUCT`, если меняется допустимая цель использования.

## 9. Итог

`XFR-D-067 AUTHORITY MODEL APPROVED — NAMED APPOINTMENT AND RBAC PENDING`
