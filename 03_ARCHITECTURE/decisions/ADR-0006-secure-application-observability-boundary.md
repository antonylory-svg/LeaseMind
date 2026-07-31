# ADR-0006 — Secure application observability boundary

**Дата:** 2026-07-31
**Автор:** Lead Software Architect
**Статус:** Accepted for synthetic development only

## Контекст

Read-only preflight (Sprint 3, до этого решения) показал, что `apps/api/src/app.ts`
создаёт Fastify без единой явной настройки логирования
(`Fastify({ logger: options.logger ?? true })`). Эмпирическая проверка исходного
кода установленного `fastify@5.10.0` (не по памяти) показала:

- `requestIdHeader` по умолчанию `false` — входящий заголовок сегодня не
  становится `request.id`. Это уже безопасно, но неявно и ничем не защищено
  от случайного будущего изменения конфигурации.
- Встроенный `genReqId` — процесс-локальный счётчик (`req-<n>`), сбрасывается
  при каждом перезапуске и не несёт признака инстанса/процесса.
- Весь внутренний lifecycle-логгинг Fastify (`incoming request`, `request
  completed`, ошибки по умолчанию, `Route ... not found`) идёт через
  внутренний `LogController`, который по умолчанию сериализует `req`/`res`/`err`
  напрямую — включая полный `req.url` (с query string) и, при срабатывании
  default error handler, `err` (включая `stack`).
- Три catch-блока в `app.ts` (`/health/ready`, `/campaigns`,
  `/campaigns/:campaignId`) и `db.ts`'s `checkDatabaseConnection` полностью
  проглатывают ошибку (`catch {}`, переменная ошибки не привязывается) — это
  уже безопасно (raw error физически не может быть залогирован), но ценой
  полного отсутствия сигнала: событие "база недоступна" сегодня не оставляет
  ни одной строки лога.
- Ни один тест не проверял реальный (logger-enabled) вывод stdout/stderr —
  все тесты используют `logger: false`.

## Решение

Для **синтетической DEVELOPMENT-разработки** вводится:

1. **Структурированные JSON-логи на существующем Fastify/Pino, без внешнего
   провайдера.** Pino уже встроен в Fastify; новых production-зависимостей не
   добавляется.

2. **Единственный allowlist полей** для всех логов приложения:
   `event`, `request_id`, `method`, `route`, `status_code`, `duration_ms`,
   `safe_error_code` (только когда применимо). Никакое другое поле не
   логируется прикладным кодом.

3. **Server-owned `request_id`.** `genReqId` заменён на
   `() => randomUUID()` (Node built-in, без новой зависимости);
   `requestIdHeader` явно установлен в `false` (было и так `false` по
   умолчанию — теперь это защищено от случайного будущего изменения
   конфигурации, а не только от текущего дефолта). Caller-supplied
   `x-request-id`/`request-id` никогда не читается для этой цели и не может
   стать источником `request_id`, независимо от содержимого заголовка
   (включая CRLF/log-injection payload) — заголовок структурно никогда не
   попадает в путь генерации ID.

4. **`request_id` не публикуется.** Не добавляется ни в response body, ни в
   response header — OpenAPI-контракт (`ADR-0004`) остаётся неизменным.

5. **Замена небезопасного встроенного lifecycle-логгинга** через официальный,
   документированный расширяемый механизм Fastify 5 — `logController`
   (`class SafeLogController extends LogController`, передаётся как
   `logController: new SafeLogController()`), а не отключение автоматического
   логирования вслепую. Каждый метод (`incomingRequest`, `requestCompleted`,
   `defaultErrorLog`, `routeNotFound`, `streamError`, `writeHeadError`,
   `serializerError`, `serviceUnavailable`) переопределён так, чтобы
   логировать только allowlisted поля — `req`/`res`/`err` никогда не
   передаются логгеру целиком.

6. **`route` — только зарегистрированный шаблон маршрута**
   (`request.routeOptions.url`, например `/api/v1/campaigns/:campaignId`),
   никогда `request.url` (сырой path + query string). Для несопоставленного
   маршрута — фиксированное значение `UNMATCHED`.

7. **Defense-in-depth на уровне Pino** — `redact` для путей вида
   `req.headers.authorization`, `req.headers.cookie`,
   `req.headers["set-cookie"]`, `req.headers["x-api-key"]`, `req.headers`,
   `res.headers`, `req.body`, `res.body` (замена на `[Redacted]`), и
   `serializers.req`/`res`/`err`, которые всегда возвращают `undefined`
   (значение полностью отсутствует в выводе), если raw-объект когда-либо
   всё же попадёт в вызов логгера в обход allowlist-контроллера. Дополнительно
   `errorKey` переопределён на неиспользуемое имя: обнаружено эмпирически
   (`node_modules/pino/lib/proto.js`, функция `write`), что Pino читает
   `obj.err.message` в поле `msg` *до* применения serializers/redact, если
   объект содержит ключ `err`, — переименование `errorKey` закрывает этот путь
   независимо от serializers.

8. **Безопасный error-классификатор.** Ошибки логируются только фиксированным
   стабильным кодом (`safe_error_code`): `INVALID_CAMPAIGN_ID`,
   `CAMPAIGN_NOT_FOUND`, `DATABASE_UNAVAILABLE`, `INTERNAL_ERROR`. Исходный
   объект ошибки, `error.message` и stack trace никогда не сериализуются ни
   при каких обстоятельствах, включая путь Fastify default error handler.

9. **Безопасные startup/shutdown события**, все — валидный JSON, без
   изменения существующего порядка `Runtime Safety Gate → config → DB pool →
   DB Privilege Gate → listen`: `startup_refused` (с существующими кодами
   `RUNTIME_SAFETY_VIOLATION`/`DATABASE_PRIVILEGE_VIOLATION`, теперь JSON, а
   не голая строка), `server_started`, `shutdown_initiated_sigint` /
   `shutdown_initiated_sigterm`, `shutdown_completed`, `shutdown_failed`,
   `listen_failed`. Корректное
   закрытие Fastify (`app.close()`) и PostgreSQL pool (`onClose`-хук,
   `apps/api/src/app.ts`, не менялся) при `SIGINT`/`SIGTERM` — без изменений
   в логике закрытия, только в том, что теперь логируется вокруг неё.
   Отдельно: `app.listen()` внутри Fastify (`fastify/lib/server.js`) сам
   безусловно логирует `"Server listening at <address>"` как голую строку
   (`this.log.info(text)`), в обход `logController` целиком — единственная
   публичная точка влияния на этот вызов, `listenTextResolver`, теперь
   возвращает `undefined`, из-за чего Pino не добавляет `msg` вовсе (адрес и
   так не секретен, но это сохраняет allowlist буквально пустым от посторонних
   полей); сразу после `listen()` пишется собственное allowlisted
   `server_started`.

## Явно НЕ входит в это решение

- Это не добавление HTTP endpoints, не изменение response bodies, статус-кодов
  или OpenAPI-контракта четырёх существующих `GET`-операций (`ADR-0004`).
- Это не изменение migrations 001–003, Campaign statuses, бизнес-логики,
  платёжной или юридической логики.
- Это не подключение внешнего log-провайдера, APM, SIEM или
  production-адаптера — весь вывод остаётся на stdout/stderr того же
  процесса, как и раньше; не добавляется ни одна новая production-зависимость.
- Это не прохождение `PRODUCTION_LAUNCH_GATE` — гейт остаётся заблокированным
  (`ADR-0001`, `ADR-0003`).
- Это не построение общего DLP-механизма сканирования произвольного
  содержимого: сегодня в системе структурно нет ни одного поля, способного
  нести телефон/паспорт/карту (Campaign содержит только campaign_id/status/
  aggregate_version/timestamps); allowlist полей сам по себе исключает такие
  данные из логов, поэтому вместо построения regex-сканера вводится
  регрессионный negative-probe, фиксирующий это отсутствие.

## Последствия

- Любое новое поле, добавленное прикладным кодом в лог без явного
  прохождения через allowlist, физически не появится в выводе (redact/
  serializers), а любое расширение allowlist требует отдельного изменения
  этого ADR.
- `database_unavailable`-класс событий (ранее полностью безмолвный) теперь
  оставляет ровно одну структурированную строку лога на запрос, без утечки
  `DATABASE_URL`/пароля/raw-ошибки.
- Тесты, ранее полагавшиеся исключительно на `logger: false`, дополняются
  отдельным файлом (`apps/api/tests/observabilityBoundary.test.ts`),
  впервые захватывающим и проверяющим реальный (logger-enabled) вывод
  stdout/stderr in-memory, без создания файлов логов в репозитории.
