# ADR-0001 — Application development stack (synthetic development only)

**Дата:** 2026-07-28
**Автор:** Lead Software Architect
**Статус:** Accepted for synthetic development only

## Контекст

Во всём репозитории нет утверждённого технологического стека всего приложения.
`02_PRODUCT/PRD.md`, `03_ARCHITECTURE/System_Architecture.md`, `Data_Model.md`,
`Event_Model.md`, `AI_Architecture.md`, `00_VISION/Decision_Log.md` описывают
продукт, модули, сущности и события, но не называют ни один язык, фреймворк
или хостинг. Единственный технический прецедент во всём репозитории —
Matching Engine contract-test harness (Node.js/ESM + PostgreSQL), при этом сами
Architecture v1.1 и Data Contracts v1.0 остаются в статусе `Proposal`,
`PRODUCTION_LAUNCH_GATE` заблокирован (седьмой DEVELOPMENT review).

Roadmap (`05_DEVELOPMENT/Roadmap.md`) переходит из Stage 1 (Documentation) в
Stage 2 (Prototype). Для Stage 2 нужен минимальный исполняемый каркас
(frontend + backend + PostgreSQL), не предвосхищающий бизнес-логику, UX,
экономику или юридические решения.

## Решение

Для **синтетической DEVELOPMENT-разработки** (Stage 2 Prototype, только
синтетические данные) принимается следующий стек:

- **Node.js 22** — среда выполнения backend и tooling;
- **TypeScript** — язык backend и frontend;
- **npm workspaces** — управление монорепозиторием `apps/api` + `apps/web`;
- **Fastify 5** — HTTP-фреймворк backend/API;
- **React 19.2 + Vite 8** — frontend;
- **PostgreSQL 18.4** — база данных, только в локальном Docker;
- **`pg`** — прямой драйвер доступа к PostgreSQL, **без ORM**;
- **Supabase SDK не используется** — отложено до отдельного письменного
  решения LEGAL/SECURITY (см. Architecture v1.1 §48: Supabase допустим только
  после фиксации deployment mode, региона, backup/support routes и договоров
  обработки).

## Явно НЕ входит в это решение

- Это **не** утверждение (approval) Proposal-документов Matching Engine
  (`LeaseMind_MATCHING_ENGINE_ARCHITECTURE_v1.1.md`,
  `LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md`) — они остаются в статусе
  `Proposal for cross-functional review and approval` /
  `Proposal for DEVELOPMENT review` без изменений.
- Это **не** прохождение `PRODUCTION_LAUNCH_GATE` — гейт остаётся
  заблокированным, как зафиксировано седьмым DEVELOPMENT review.
- Это **не** решение об использовании Supabase — Supabase SDK/сервисы
  сознательно **deferred** до отдельного письменного решения LEGAL/SECURITY.
- Реальные платежи, реальные персональные данные (ПДн), production adapters
  и функциональность Reveal (раскрытие защищённых контактных данных) в этом
  каркасе **запрещены** — приложение работает только с синтетическими данными
  в development-окружении.
- Это не решение о бизнес-логике, экономической модели, платёжной модели или
  юридических правилах — они не затрагиваются и не проектируются данным ADR.

## Последствия

- Backend/frontend каркас реализуется как health-check-only vertical slice
  (`GET /api/v1/health/live`, `GET /api/v1/health/ready`), без бизнес-сущностей
  из `Data_Model.md`.
- PostgreSQL поднимается только через disposable локальный Docker-контейнер с
  синтетическими credentials, портом только на `127.0.0.1` и без persistent
  volume.
- Любое расширение этого каркаса до реальных бизнес-функций требует отдельного
  решения DEVELOPMENT/Founder и не разблокируется автоматически данным ADR.
