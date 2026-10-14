# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # dev server (Turbopack via Next.js)
yarn build            # production build
yarn lint             # prettier --check + eslint src
yarn lint:fix         # prettier --write + eslint --fix + prettier --write
yarn db:migrate       # prisma migrate dev
yarn db:push          # prisma db push (no migration file)
```

### E2E tests (Playwright)

```bash
yarn test:e2e         # mobile/tablet projects (Pixel 7, iPhone 13, iPhone SE, 320px, iPad Mini) + desktop (Chrome, Safari)
yarn test:e2e:ui      # interactive runner
npx playwright install chromium webkit   # once, to download browsers
```

- Layout regression tests for mobile lists live in `e2e/`. API is mocked in the browser via `page.route` (`e2e/fixtures/mockApi.ts`, data in `e2e/fixtures/data.ts`) — no DB, cookies or `.env` keys are needed, the real DB is never touched. Import `test`/`expect` from `e2e/fixtures/mockApi`, not from `@playwright/test`: the fixture also fails a test on any `console.error`/`pageerror`.
- Reuses a running `yarn dev` on port 3000 (Next 16 refuses a second dev server on the same `.next`); otherwise starts one. Override with `E2E_PORT`.
- Service Workers are blocked (`serviceWorkers: 'block'`), since SW-handled requests bypass `page.route`. `e2e/pwa.spec.ts` opts back in and runs on WebKit only.
- Helpers in `e2e/helpers/` measure what users see: card overlaps/uneven gaps (`[data-slot=card]`, set on every `Card`), horizontal overflow, page+list double scroll, reachable list end.
- Desktop layout (>= 1024px: map + tables) is tested only by `*.desktop.spec.ts` on the `desktop-chrome`/`desktop-safari` projects; mobile projects ignore those files and desktop projects run only them.
- Pages under `(protected)/groups/[id]` work with two lists: the group-filtered `attractions` and the global `DataContext` list — never write the filtered list into `setAttractions` (that wiped other cities' objects; covered by `e2e/group-detail-data.desktop.spec.ts`).
- Not run by the pre-commit hook. No unit-test runner is configured.

Pre-commit (husky + lint-staged) runs `eslint --fix` + `prettier --write` on staged `src/**/*.{ts,tsx,js}` automatically — don't hand-fix formatting/import-order issues, just commit and let it run.

### Local database

Prisma reads `DB_DATABASE_URL`, **not** `DATABASE_URL` — `.env.example` is misleading here. See `docs/LOCAL_DB.md` for the full local Postgres setup via `docker-compose.yml` (`docker compose up -d postgres_attractions`, port 5433) plus CSV seed import from `.seed/`.

## Architecture

Next.js 16 App Router app (React 19, TypeScript) for managing "groups" (cities/regions) of "attractions" (places) on a Yandex Maps map. Auth is JWT-based, DB is PostgreSQL via Prisma.

### Routing & layout nesting

- `src/app/layout.tsx` (root) mounts, in order: `ThemeProvider` → `AuthContextProvider` → `DataProvider` → `PWALayout`. The Yandex Maps JS SDK is loaded once here via `next/script` using `YA_MAPS_API_KEY`.
- `src/app/(protected)/*` is a route group (no URL segment) whose `layout.tsx` wraps children in `<ProtectedRoute>` (`src/components/ProtectedRoute.tsx`), which client-side-redirects to `/login` if `AuthContext` has no user. There is **no `middleware.ts`** — route protection is entirely client-side, driven by a `fetch('/api/auth')` call on mount in `AuthContext`.
- `/` immediately redirects to `/main`.

### Auth flow — the Authorization header is dead code

`POST /api/login` sets the JWT in a cookie with `httpOnly: true` (`src/app/api/login/route.ts`). Every API route authenticates by reading that cookie server-side via `withAuth`/`getUserId` (`src/lib/serverAuth.ts`) — cookies are sent automatically by the browser on same-origin requests.

Separately, `src/services/request.ts` attaches an `Authorization: Bearer <token>` header to every axios call, where the token comes from `getAuthHeaders()` → `getCookie('token')` (`src/lib/clientCookies.ts`, reads `document.cookie`). Because the cookie is `httpOnly`, `document.cookie` can never see it — this header is always `Bearer undefined` and no server route ever reads an `Authorization` header. Don't "fix" auth by touching this header path; it has no effect. Actual auth state on the client comes only from `AuthContext`'s `/api/auth` check.

### State layers

Three React Contexts, no external state library:
- `AuthContext` — `user`/`isLoading`, re-checked via `/api/auth` on mount.
- `DataContext` — global `groups`/`attractions` arrays plus a derived `attractionsMap` (attractions grouped by `groupId`), backed by `useGetAllGroups`/`useGetAllAttractions`. Call `reload({ groups, attractions })` after mutations instead of refetching manually.
- `ThemeContext` — light/dark theme.

### Group/Attraction: mirrored, not shared

`Group` and `Attraction` are implemented as two parallel, hand-duplicated CRUD stacks — API routes (`src/app/api/{groups,attractions}/[id]/route.ts`), client services (`src/services/{group,attraction}Service.ts`), and fetch hooks (`src/hooks/useGetAll{Groups,Attractions}.ts`) all repeat the same shape per entity. When adding a field or endpoint to one entity, check whether the equivalent needs mirroring in the other — nothing enforces they stay in sync.

### Coordinates: stored order is `[latitude, longitude]` despite comments

`coordinates: [number, number]` fields on `Group`/`Attraction` are commented `// [долгота, широта]` (i.e. `[lng, lat]`) in `src/types/group.ts` and `src/types/attraction.ts` — **this comment is wrong**. The actual convention used everywhere (e.g. `DEFAULT_COORDINATES = [55.755819, 37.617644]` in `src/lib/constants.ts`, which is Moscow as `[lat, lng]`) is `[latitude, longitude]`. Every place that feeds coordinates into Yandex Maps (which wants `LngLat` = `[lng, lat]`) manually swaps them: `[coordinates[1], coordinates[0]]` in `src/components/ui/Map.tsx`, `GroupDetailContainer.tsx`, `GroupsContainer.tsx`, and `src/lib/getLocationSearchParams.ts`. There is no shared conversion helper and no type-level distinction between the two orders — when writing new code that touches `coordinates`, follow the swap-at-the-boundary pattern rather than the type comments, and double check against `DEFAULT_COORDINATES`.

### Yandex Maps integration

The SDK (`ymaps3`) attaches to `window.ymaps3` after the root-layout `<Script>` loads. `src/lib/ymaps.ts` (`initYMaps()`) lazily binds it to React via `reactify` and exports typed components (`YMap`, `YMapMarker`, etc.) as mutable `let` bindings — they only exist after `initYMaps()` resolves. Any component that renders a map must gate rendering on `useMapReady().isMapReady` (see `src/components/ui/Map.tsx`) before importing/using those exports.

### Attractions auto-add: coordinates come from OSM, never from the LLM

`POST /api/attractions/autoadd` (`src/lib/ai/attractionsSearch.ts`) fetches real places with exact coordinates from OpenStreetMap via Overpass (`src/lib/osm/overpass.ts`, endpoint overridable with `OVERPASS_API_URL`), then the LLM only picks ids from that list and writes category/description. LLMs can't produce accurate coordinates (they hallucinate digits past ~1–2 decimals), so don't add coordinate fields to LLM schemas. Yandex Places API is not an option (paid). OSM data is ODbL — attribution "© участники OpenStreetMap" is required wherever it's shown.

### UI components

`src/components/ui` follows shadcn/ui conventions (`components.json`, style "new-york", Tailwind, `class-variance-authority`) — prefer generating/matching that pattern for new primitives rather than hand-rolling. `next.config.ts` has `reactCompiler: true` (React Compiler / babel-plugin-react-compiler), so manual `useMemo`/`useCallback` for render-perf reasons is generally unnecessary for components under compiler coverage.
### Mobile virtual lists and hydration

- Mobile `/groups` and `/search` use `react-window` `List` with `useDynamicRowHeight` — card height depends on content and width, so never go back to a constant `rowHeight`. Spacing between rows is the row's `pb-4`, not a card margin; rows must spread `ariaAttributes`.
- `ProtectedRoute` renders `LoadingStub` until `useIsHydrated()` is true: on slow devices `/api/auth` resolves before the protected segment hydrates, and rendering content then causes a hydration mismatch and a full client re-render (flicker, lost scroll).

### Backup / restore

`GET /api/backup` returns all of the user's groups + attractions as a versioned JSON file (`src/lib/backup/format.ts`, zod schema shared by client and server); `POST /api/backup { mode, backup }` restores it in one Prisma batch transaction (`src/lib/backup/server.ts`). UI: `BackupDialog` in the navigation bar. Modes: `merge` (upsert by id, nothing deleted, re-import is idempotent) and `replace` (delete the user's data, load the file; confirmed in the UI). Import planning is a pure function (`src/lib/backup/planImport.ts`): ids are kept, except ids already owned by another user, which get a deterministic replacement (sha256 of `userId:originalId`) so repeated imports update instead of duplicating; attraction `groupId`s are remapped accordingly. When adding a field to `Group`/`Attraction`, add it to the backup schema and to `groupData`/`attractionData` too.
