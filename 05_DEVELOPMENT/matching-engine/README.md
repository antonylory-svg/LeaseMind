# Matching Engine — DEVELOPMENT import (2026-07-26)

Технический факт-лист по импортированному комплекту Matching Engine из ChatGPT Library.
Документ не содержит продуктовых, юридических или экономических решений и не изменяет
роль AI Manager.

## Импортированные файлы и SHA-256

| Файл | Library version | SHA-256 |
| --- | ---: | --- |
| `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` | 10 | `d5d3afe113ed01076ae9c4e54f5791b8b33477402838a3f5d3641a73dd286ffa` |
| `03_ARCHITECTURE/proposals/matching-engine/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` | 5 | `e4c05c9e1eae08575bd5ba7763ca7abbec9f94d4ccc8e101c062a7aeef304cec` |
| `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/artifacts/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip` | 4 | `234f59be898f8e2e0e11ea05dd58bcaa3983b22c1d95785574e1476072c0faf1` |
| `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/artifacts/LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json` | 2 | `973a65c2accf29512953372669cc750c2a6516c23d1f1a797f2da80603ed349a` |
| `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_SEVENTH.md` | — | `1a70b5cdb0c8b804c0710c4dbdd20bfef381d99fcd248204eb1e39a268ea38eb` |

Все пять файлов скопированы byte-for-byte из `_incoming/` и сверены по SHA-256 после копирования.
Содержимое ZIP распаковано без изменений в `05_DEVELOPMENT/matching-engine/contract-tests/v1.0/source/`.

## Статус документов

- `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` и `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`:
  **Proposal for cross-functional review and approval**.
- Документы в `03_ARCHITECTURE/proposals/matching-engine/` **не являются утверждённым
  production baseline**. Они не заменяют и не изменяют существующие документы
  `03_ARCHITECTURE/System_Architecture.md`, `03_ARCHITECTURE/Data_Model.md`,
  `03_ARCHITECTURE/Event_Model.md`.

## Итог седьмой технической проверки

**`CHANGES REQUIRED`**.

**`PRODUCTION_LAUNCH_GATE: BLOCKED`**.

Полное заключение: `05_DEVELOPMENT/matching-engine/reviews/LeaseMind_DEVELOPMENT_REVIEW_MATCHING_ENGINE_v1.1_SEVENTH.md`.

### Blocking-замечания (не исправлены в рамках импорта)

| ID | Кратко |
| --- | --- |
| `SEVENTH-B01` | UUID contract разрешает только v4/v7, но AsyncAPI/DB regex пропускают версии 1–8 |
| `SEVENTH-B02` | Service- и DB-классификаторы DLP расходятся на нестандартных разделителях |
| `SEVENTH-B03` | `redeem_reveal_token` принимает `p_redeemed_at` от вызывающей стороны — возможен backdating |
| `SEVENTH-B04` | Redemption не блокирует guard/lease rows перед commit — race с invalidation |
| `SEVENTH-B05` | `CT-028` не проверяет соответствие payload/schema фактическому `event_type` |
| `SEVENTH-B06` | `cryptoUnlink` принимает caller-supplied `deletion_act_hash` без пересчёта |

Подробности и требуемые изменения по каждому пункту — только в файле заключения, см. ссылку выше.

## Ограничения (действуют до отдельного PRODUCTION_LAUNCH_GATE)

- Реализация и тестирование разрешены только на синтетических данных.
- Запрещены: реальные платежи, реальные персональные данные, production adapters,
  раскрытие защищённых данных.
- `SEVENTH-B01`–`SEVENTH-B06` в рамках данного импорта не исправлялись.
