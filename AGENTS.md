# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

### Install & local setup
- Install deps:
  - `npm install`
- Create local env file:
  - `cp .env.example .env.local`
  - Fill in Clerk keys and `DATABASE_URL`.

### Run the app
- Dev server (Next.js):
  - `npm run dev`
  - App is typically on `http://localhost:3000`.
- Production build:
  - `npm run build`
- Serve the production build:
  - `npm run start`

### Lint
- `npm run lint`

### Database (Drizzle)
This repo uses Drizzle ORM + `drizzle-kit` and expects `DATABASE_URL`.
- Push schema to the database (used in the deployment docs as the “create table” step):
  - `npm run db:push`
- Generate migrations (outputs to `./drizzle/` per `drizzle.config.ts`):
  - `npm run db:generate`
- Run migrations:
  - `npm run db:migrate`
- Open Drizzle Studio:
  - `npm run db:studio`

### Tests
There is currently no test runner configured (no `test` script in `package.json`). If you add a test framework, also document the new `npm run test` / single-test invocation here.

## High-level architecture

### App framework
- Next.js App Router project.
- Source lives under `src/`.
- TypeScript path alias `@/*` maps to `src/*` (see `tsconfig.json`).

### Routing + UI
- `src/app/layout.tsx` defines the root layout, imports `globals.css`, and wraps the app in `ClerkProvider`.
- `src/app/page.tsx` is the main UI (client component). It:
  - uses Clerk (`useUser`, `UserButton`) for session awareness
  - calls the entries API (`/api/entries`) for CRUD
  - implements basic client-side filtering/search/export
- Auth screens are provided by Clerk components:
  - `src/app/sign-in/[[...sign-in]]/page.tsx`
  - `src/app/sign-up/[[...sign-up]]/page.tsx`

### Auth (Clerk)
- `src/middleware.ts` uses `clerkMiddleware` to protect routes.
  - Public routes: `/sign-in*`, `/sign-up*`
  - Everything else is protected via `auth.protect()`.
- Required env vars are documented in `.env.example` and `DEPLOY.md`.

### Data layer (Postgres + Drizzle)
- Drizzle schema: `src/db/schema.ts`
  - Primary table is `entries` (scoped by `userId`).
- DB client: `src/db/index.ts`
  - Uses `postgres` (postgres.js) + `drizzle-orm` and reads `DATABASE_URL`.

### API surface
- `src/app/api/entries/route.ts` is a route handler that implements per-user CRUD:
  - Uses `@clerk/nextjs/server` `auth()` to get `userId`
  - All queries are scoped to the current user (`entries.userId = userId`)
  - GET returns newest-first (`orderBy desc(createdAt)`)

### Styling
- Tailwind CSS v4 is used via CSS-first config (`src/app/globals.css` imports `tailwindcss`).
- `globals.css` also contains Clerk dark-theme overrides.