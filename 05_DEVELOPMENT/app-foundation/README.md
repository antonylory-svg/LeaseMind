# App Foundation — synthetic development runtime

Статус: `Accepted for synthetic development only`
(см. `03_ARCHITECTURE/decisions/ADR-0001-application-development-stack.md`).

Только синтетические данные. Реальные платежи, реальные персональные данные,
production adapters и функциональность Reveal в этом каркасе запрещены.
Это не утверждение Proposal-документов Matching Engine и не прохождение
`PRODUCTION_LAUNCH_GATE`.

## Стек

Node.js 22, TypeScript, npm workspaces, Fastify 5 (backend), React 19.2 +
Vite 8 (frontend), PostgreSQL 18.4 (локальный disposable Docker), `pg` —
без ORM, без Supabase SDK.

## Установка

```
npm ci
```

## PostgreSQL (disposable, синтетические credentials)

```
docker compose up -d postgres
docker compose ps postgres
```

Порт публикуется только на `127.0.0.1:5433`, без persistent volume (`tmpfs`).

## Backend

```
cp apps/api/.env.example apps/api/.env
npm run dev --workspace apps/api
```

`.env` загружается автоматически (`node --env-file-if-exists`, встроенная
возможность Node.js 22) — ручной `export`/`source` не требуется. Уже заданные
переменные окружения процесса имеют приоритет над значениями из `.env`.
Слушает `127.0.0.1:3001` по умолчанию (см. `apps/api/.env.example`).

## Frontend

```
npm run dev --workspace apps/web
```

Открыть `http://127.0.0.1:5173/` — техническая health-страница, без бизнес-сущностей.
Frontend обращается к API по относительным путям (`/api/v1/...`); Vite dev
server проксирует их на `http://127.0.0.1:3001` (см. `vite.config.ts`) —
same-origin, без CORS.

## Campaign Read Model (synthetic-only)

Производная `Current State Projection` (не источник истины бизнес-событий —
Immutable Event Log остаётся будущим отдельным write-side этапом). Источник
утверждённой семантики: `03_ARCHITECTURE/ai-manager/LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md`
(Approved, v1.0, раздел 5.3) — ровно 11 статусов, без переименований и
добавлений. Только read-only API, без write endpoints и без переходов между
статусами.

```
npm run migrate:up
npm run seed
npm run migrate:down
```

`migrate:up`/`migrate:down` — plain SQL миграции с checksum ledger
(`apps/api/migrations/`); повторный `migrate:up` идемпотентен, изменение уже
применённого файла отклоняется. `seed` — ровно 11 детерминированных synthetic
Campaign (по одной на статус); повторный запуск не создаёт дубликатов. Ни
одна из команд не выполняется автоматически при `npm run dev`/`npm start`.

```
curl -s http://127.0.0.1:3001/api/v1/campaigns
curl -s http://127.0.0.1:3001/api/v1/campaigns/00000000-0000-4000-8000-000000000001
```

## Pre-launch runtime safety gate

`apps/api/src/runtimePolicy.ts` (см. `03_ARCHITECTURE/decisions/ADR-0003-pre-launch-runtime-safety-gate.md`)
проверяется в `server.ts` до создания PostgreSQL-пула и до открытия порта.
Единственное допустимое состояние до отдельного `PRODUCTION_LAUNCH_GATE`:

```
LEASEMIND_RUNTIME_MODE=synthetic
LEASEMIND_PRODUCTION_LAUNCH_GATE=blocked
LEASEMIND_ALLOW_REAL_PII=false
LEASEMIND_ALLOW_REAL_PAYMENTS=false
LEASEMIND_ALLOW_PROTECTED_REVEAL=false
LEASEMIND_ALLOW_PRODUCTION_ADAPTERS=false
```

Отсутствие любой из этих переменных равнозначно указанному безопасному
значению — по умолчанию сервер всегда стартует в этом единственном
допустимом состоянии. Любое другое значение (`production`, `staging`,
`open`, `true`, `TRUE`, `1`, `yes` и т.п.) останавливает процесс до
подключения к базе данных и до bind порта; сообщение об ошибке называет
только имя переменной, никогда не раскрывая `DATABASE_URL` или иные
значения окружения. Изменить это поведение можно только новым кодом и
новым утверждённым решением DEVELOPMENT — не изменением значения
переменной окружения.

## Проверки

```
npm run typecheck
npm run test --workspace apps/api
npm run build --workspace apps/web
curl -s http://127.0.0.1:3001/api/v1/health/live
curl -s http://127.0.0.1:3001/api/v1/health/ready
curl -s http://127.0.0.1:5173/api/v1/health/live
curl -s http://127.0.0.1:5173/api/v1/health/ready
```

## Остановка

```
docker compose down -v
docker ps -a --filter "name=leasemind"
docker volume ls
```

После `docker compose down -v` не должно оставаться ни контейнеров, ни volumes,
относящихся к этому каркасу.
