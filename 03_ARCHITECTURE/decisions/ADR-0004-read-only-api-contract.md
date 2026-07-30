# ADR-0004 — OpenAPI contract for the existing read-only API

**Дата:** 2026-07-30
**Автор:** Lead Software Architect
**Статус:** Accepted for synthetic development only

## Контекст

`apps/api/src/app.ts` реализует ровно четыре HTTP-операции: два health-проб
(`GET /api/v1/health/live`, `GET /api/v1/health/ready`) и read-only доступ к
Campaign Current State Projection (`GET /api/v1/campaigns`,
`GET /api/v1/campaigns/{campaignId}`), см. `ADR-0001`, `ADR-0002`. До этого
решения форма запросов, ответов и кодов состояния существовала только как
Fastify JSON Schema внутри `app.ts` и как утверждения в тестах — не было
единого, независимо проверяемого машинно-читаемого контракта, который можно
было бы валидировать отдельно от кода реализации или подключить к внешним
инструментам.

## Решение

Для **синтетической DEVELOPMENT-разработки** вводится:

1. **OpenAPI — нормативный машинно-читаемый контракт.**
   `apps/api/openapi/openapi.yaml` (OpenAPI 3.1.0) — нормативное описание
   ровно четырёх существующих read-only операций. Схемы ответов
   транскрибированы непосредственно из фактических Fastify JSON Schema в
   `app.ts` — контракт описывает то, что реализация действительно
   возвращает, а не желаемое или будущее поведение.
2. **Обязательная проверка соответствия через contract tests.**
   `apps/api/tests/openapiContract.test.ts` валидирует сам документ
   (`SwaggerParser.validate`), проверяет состав операций/methods/
   operationId и выполняет реальные Fastify `inject()`-вызовы всех четырёх
   операций, сверяя фактические ответы с схемами контракта через `ajv`.
   Расхождение между `app.ts` и `openapi.yaml` — красный CI, а не
   документационный долг.
3. **Скрытое добавление endpoint запрещено технически.** Contract test
   проверяет, что зарегистрированные в Fastify маршруты (`app.hasRoute`) и
   реальные HTTP-ответы (`app.inject`) не содержат ничего, кроме
   документированных четырёх операций, и что write-методы
   (`POST`/`PUT`/`PATCH`/`DELETE`) не зарегистрированы ни на одном пути. Новый
   endpoint, добавленный без одновременного обновления `openapi.yaml` и
   contract tests, либо не пройдёт эти проверки, либо останется вне
   отслеживаемого контракта до явного обновления обоих артефактов вместе.
4. **OpenAPI не открывает `PRODUCTION_LAUNCH_GATE`.** Наличие
   валидного, полностью протестированного контракта — техническая
   документация существующего synthetic-only API, а не прохождение
   `PRODUCTION_LAUNCH_GATE` (см. `ADR-0001`, `ADR-0003`). Гейт остаётся
   заблокированным независимо от статуса этого ADR.
5. **Контракт не разрешает write API.** Документированы только четыре
   существующие `GET`-операции. Ни одна схема, path или response в
   `openapi.yaml` не описывает `POST`/`PUT`/`PATCH`/`DELETE` или любую
   будущую операцию.
6. **Только synthetic testing и local/CI PostgreSQL.** Единственный
   `servers` entry — `http://127.0.0.1:3001` (synthetic local development,
   см. `apps/api/.env.example`). Contract tests выполняются только против
   disposable PostgreSQL 18.4 (локально или в CI), как и весь остальной
   `apps/api` test suite.

## Явно НЕ входит в это решение

- Это не добавление новых HTTP endpoints, write-операций или
  аутентификации — контракт документирует исключительно то, что уже
  реализовано и уже покрыто существующими тестами.
- Это не изменение Campaign statuses, Campaign Event Log, Campaign
  migrations 001/002, Matching Engine или его controlled artifacts.
- Это не решение об аутентификации, авторизации, production hosting или
  Supabase — они не затрагиваются.

## Последствия

- Любое расхождение между `app.ts` и `openapi.yaml` (новый endpoint,
  изменённая форма ответа, новый статус-код) обнаруживается
  `openapiContract.test.ts` при следующем прогоне `npm test`.
- Внешние инструменты (клиенты, будущая документация, будущие
  contract-driven тесты) могут полагаться на `apps/api/openapi/openapi.yaml`
  как на единственный источник истины по форме существующего read-only API.
- Расширение контракта на write-операции, аутентификацию или production
  сервер требует отдельного ADR и отдельного утверждения DEVELOPMENT — этот
  документ его не разблокирует автоматически.
