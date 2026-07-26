# LeaseMind — DEVELOPMENT Review of Matching Engine Architecture v1.1

**Проверка:** седьмая техническая проверка DEVELOPMENT  
**Дата:** 2026-07-26  
**Роль:** Lead Software Architect  
**Итог:** `CHANGES REQUIRED`  
**Режим:** только синтетические данные; реальные платежи, реальные персональные данные, production adapters и раскрытие защищённых данных не использовались  

## 1. Проверенный controlled set

Проверка выполнена по четырём каноническим файлам из ChatGPT Library. Файлы с суффиксами и предыдущие версии не использовались.

| Артефакт | Library version | SHA-256 | Результат |
| --- | ---: | --- | --- |
| `LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md` | 10 | `d5d3afe113ed01076ae9c4e54f5791b8b33477402838a3f5d3641a73dd286ffa` | Совпадает с submission manifest и копией в ZIP |
| `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md` | 5 | `e4c05c9e1eae08575bd5ba7763ca7abbec9f94d4ccc8e101c062a7aeef304cec` | Совпадает с submission manifest и копией в ZIP |
| `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0_EXECUTABLE.zip` | 4 | `234f59be898f8e2e0e11ea05dd58bcaa3983b22c1d95785574e1476072c0faf1` | Совпадает с submission manifest; ZIP integrity `PASS` |
| `LeaseMind_MATCHING_SUBMISSION_MANIFEST_v1.0.json` | 2 | `973a65c2accf29512953372669cc750c2a6516c23d1f1a797f2da80603ed349a` | Exact-name policy, версии, статусы и embedded evidence hashes подтверждены |

Архитектурный документ остаётся версией `1.1` со статусом `Proposal for cross-functional review and approval`. Data Contracts остаётся версией `1.0` со статусом `Proposal for DEVELOPMENT review`. `PRODUCTION_LAUNCH_GATE` остаётся заблокированным.

## 2. Воспроизведённые штатные результаты

- clean install по `package-lock.json` в новой распаковке: `PASS`;
- source manifest, отдельный hash embedded verification report и ZIP integrity до запуска: `PASS`;
- OpenAPI `@apidevtools/swagger-parser@12.1.0`: `PASS`;
- AsyncAPI `@asyncapi/parser@3.6.0`: `PASS`;
- JSON Schema `ajv@8.20.0`: `PASS`;
- evidence runner self-tests `EV-001–EV-007`: `PASS`;
- итоговые `CT-001–CT-033`: формально `PASS`;
- PostgreSQL `PG-001–PG-030` applicable set: формально `PASS`;
- 33 positive и 1020 schema-derived negative event payload probes: `PASS`;
- 15 DLP probes, включая непрерывные телефоны и паспорта: `PASS`;
- two-connection token race, two failure-injection boundaries и server-computed result hash: `PASS`;
- PostgreSQL 18.4 lifecycle `up → catalog/behavior/security → down → empty catalog`: `PASS`.

Штатный suite воспроизводим и действительно выполняет заявленные сценарии. Однако независимые adversarial probes обнаружили fail-open случаи, которых его mutation corpus и semantic counters не покрывают.

## 3. Blocking-замечания

| ID | Раздел документа / артефакт | Технический риск | Требуемое изменение | Статус |
| --- | --- | --- | --- | --- |
| `SEVENTH-B01` | Architecture §§ 42, 48, 53; Data Contracts §§ 2.1, 4–5, 8, 10; AsyncAPI UUID fields; `validate_event_payload`; `PG-019` | `SIXTH-B01` закрыт не полностью. Data Contracts разрешает только UUID v4 или v7, но AsyncAPI использует общий `format: uuid`, а DB regex принимает версии `1–8`. Независимый probe с UUID v1 `6ba7b810-9dad-11d1-80b4-00c04fd430c8` был принят. Матрица из 1020 mutations проверяет только строку `not-a-uuid`, поэтому запрещённые версии не обнаруживает. UUID v1 дополнительно способен кодировать время/узел, что несовместимо с заявленной границей pseudonymized identifiers. | Ввести общий schema type `UuidV4OrV7`: `format: uuid` плюс pattern/`oneOf`, разрешающий только version nibble `4` или `7` и RFC variant. Использовать его во всех OpenAPI/AsyncAPI полях и эквивалентный regex в DB. Добавить для каждого UUID field positive v4/v7 и negative v1/v3/v5/v6/v8 mutations с rollback-absence evidence. | `blocking` |
| `SEVENTH-B02` | Architecture §§ 42, 48, 53–54; Data Contracts §§ 5, 8, 10; `DLP_EVENT_CONTENT_V1`; `validate_no_direct_identifiers`; `containsDirectIdentifier`; `PG-026` | `SIXTH-B02` закрыт только для 15 фиксированных форматов. Service classifier нормализует все недесятичные разделители и отклоняет `7.999.123.45.67`, `7_999_123_45_67` и вариант с zero-width separators. DB classifier с тем же именем версии принял все три значения. Поэтому два слоя, заявленные как один versioned classifier, дают разные решения, и direct identifier может быть записан в event/trace. | Зафиксировать один канонический алгоритм нормализации строковых scalar values и ключей для service и PostgreSQL: Unicode normalization, удаление/классификация пробельных, punctuation и format characters, затем phone/passport/card detection. Не склеивать цифры из разных JSON scalar values. Общий generated corpus должен исполняться обоими реализациями и включать точки, `_`, NBSP/narrow NBSP, zero-width characters, смешанные разделители и безопасные controls; каждое DB rejection должно подтверждать rollback и безопасную диагностику без значения. | `blocking` |
| `SEVENTH-B03` | Architecture §§ 43–44, 53; Data Contracts §§ 5–8; `redeem_reveal_token`; `PG-030` | Функция принимает `p_redeemed_at` от вызывающего Reveal role и использует его для TTL/lease checks и audit result. Штатный suite, запущенный 2026-07-26, успешно погасил token с `expires_at = 2026-07-24T10:20:00Z`, передав исторический `p_redeemed_at = 2026-07-24T10:05:00Z`. Следовательно, истёкший token можно погасить backdated временем, а `redeemed_at` не является server-owned фактом. | Удалить `p_redeemed_at` из внешней сигнатуры. Получать время внутри `SECURITY DEFINER` из доверенного DB clock (`clock_timestamp()` либо зафиксированная policy semantics), использовать одно значение для всех TTL/lease checks, Attempt, token и result. Тестовые issued/expires timestamps строить относительно DB time. Добавить независимые expired-token, future-issued и same-key replay probes, доказывающие невозможность backdating. | `blocking` |
| `SEVENTH-B04` | Architecture §§ 42–44, 53; Data Contracts §§ 5–8; `redeem_reveal_token`; source invalidation functions; `PG-005`, `PG-030` | `SIXTH-B04` закрыл атомарность `Token → Attempt → result`, но не атомарность gate относительно source invalidation. Redemption блокирует token, однако читает guard и leases без row locks и не перепроверяет их перед commit. Независимый two-connection probe задержал транзакцию после gate read, изменил guard epoch `2 → 3` в другой committed транзакции, после чего redemption всё равно committed `redeemed token + immutable Attempt`. Это нарушает правило: source update, committed до завершения redemption, должен блокировать раскрытие. | Задать единый lock order для invalidation и redemption. Redemption должна блокировать authoritative guard и все шесть lease rows (`FOR UPDATE`/`FOR SHARE` с конфликтом к invalidation) в детерминированном порядке, затем сверять epoch, source system/version/fencing token/state/expiry и только после этого создавать Attempt и погашать token. Альтернатива допустима только при доказанном `SERIALIZABLE` conflict/retry. Добавить two-connection `redemption ↔ guard/lease invalidation` test в обеих commit order: invalidation-first обязан отклонить reveal; reveal-first может завершиться до последующего source fact. | `blocking` |
| `SEVENTH-B05` | Architecture § 53; Data Contracts §§ 4, 8, 10; AsyncAPI `x-leasemind-event-routing`; `CT-028`; `evidence_matrix.mjs` | `SIXTH-B05` не закрыт для consumer binding. `CT-028` проверяет только существование указанной receive-operation и наличие у неё channel reference, но не проверяет, что channel/message payload действительно допускает соответствующий `event_type`. Независимая mutation заменила consumer для `PAYER_RESOLUTION_REQUIRED` на `consumeDecisionRecorded`; все текущие `CT-028` assertions продолжили проходить. Counter `owner_consumer_bindings = 33` поэтому может подтверждать неверную маршрутизацию. | Для каждой routing row разрешать `consumer_operation → channel → message → payload schema` и машинно доказывать, что schema принимает именно данный `event_type`, а producer/owner соответствуют тому же envelope. Добавить отрицательный self-test со swap на другую существующую receive-operation; итог обязан стать `BLOCKED`. Evidence должен содержать 33 exact tuples, а не только count. | `blocking` |
| `SEVENTH-B06` | Architecture §§ 48, 53; Data Contracts §§ 7–8, 10; `cryptoUnlink`; `CT-024`; retention evidence | `SIXTH-B05` не закрыт для смысла `deletion_act_hash`. `cryptoUnlink` просто переносит caller-supplied `record.deletion_act_hash`. Независимый probe передал одинаковое значение в `event_hash` и `deletion_act_hash`; retention tombstone сохранил исходный event hash под разрешённым именем и прошёл текущую exact-key проверку. Тем самым запрещённый stable source hash можно сохранить без нарушения counters. | Формировать canonical deletion act server-side с domain separator и обязательными несвязываемыми полями, вычислять `deletion_act_hash` внутри доверенной операции и не принимать готовый hash из удаляемой записи/caller context. Добавить negative probes, где source event/payload/correlation hash равен предложенному deletion-act hash: значение должно быть проигнорировано/пересчитано либо операция отклонена. Evidence должно проверять derivation и отсутствие равенства любому source hash, а не только имя поля. | `blocking` |

## 4. Non-blocking comments

| ID | Раздел документа | Технический риск | Требуемое изменение | Статус |
| --- | --- | --- | --- | --- |
| `SEVENTH-NB01` | Submission manifest / executable package | Controlled-set ambiguity отсутствует: exact filenames, Library versions, top-level hashes, embedded documents и source manifest согласованы. | Сохранить передачу только четырёх канонических файлов и текущую hash policy. Независимые review probes не включать в нормативный ZIP без отдельного решения DEVELOPMENT. | `non-blocking` |
| `SEVENTH-NB02` | Architecture §§ 36–37, 51–52 | Вопросы № 2, 3, 6, 8, 10, 11 и 15, measured cost benchmark и `MATCHING_COST_ALLOCATION_DECISION` остаются implementation/Launch blockers. Настоящая проверка их не закрывает. | Не разблокировать зависимые implementation, synthetic acceptance и production gates после исправления только замечаний этой проверки. | `non-blocking` для текущего review; gate-specific blocking сохраняется |

## 5. Статус замечаний шестой проверки

| Замечание | Результат седьмой проверки |
| --- | --- |
| `SIXTH-B01` — exact DB payload validation | Calendar/range/length исправления подтверждены, но UUID v4/v7 contract не обеспечен; закрытие не подтверждено |
| `SIXTH-B02` — normalized DLP | Заявленные 15 probes проходят, но service/DB classifier расходятся на дополнительных разделителях; закрытие не подтверждено |
| `SIXTH-B03` — untrusted Reveal context | `encounter_id`, `introduction_record_id`, остальные authoritative и unknown fields отклоняются до side effects; закрыто |
| `SIXTH-B04` — atomic token redemption | Attempt/result hash/replay/failure injection исправлены, но доверие к caller time и race с guard invalidation остаются; закрытие не подтверждено |
| `SIXTH-B05` — semantic CT evidence | Inbox duplicate и пять composite mismatches подтверждены; consumer binding и deletion-act hash semantics всё ещё дают false-positive evidence; закрытие не подтверждено |

## 6. Итоговое заключение

`CHANGES REQUIRED`.

Штатный controlled suite существенно усилен и воспроизводим, но зелёный отчёт остаётся недостаточным для утверждения архитектуры: независимо подтверждены два пути записи direct/несоответствующих identifiers, обход TTL через caller-controlled time, фактическая race `redemption ↔ invalidation` и два false-positive semantic evidence сценария.

После закрытия `SEVENTH-B01–SEVENTH-B06` требуется передать тот же полный controlled set на восьмую техническую проверку DEVELOPMENT. Версии и Proposal-статусы не повышать автоматически.

До отдельного подписанного `PRODUCTION_LAUNCH_GATE` сохраняется абсолютный запрет на реальные платежи, реальные персональные данные, production adapters и раскрытие защищённых данных.
