# SkillSwap Web

The Next.js front end for **SkillSwap**, a Tinder-style skill exchange: swipe people who teach what you
want to learn, match, chat live, book sessions, review, and earn time credits.

| | |
|---|---|
| **Git (this repo)** | https://github.com/oscarMandeep/Frontend |
| **Live site (Vercel)** | https://swapskill-dusky.vercel.app |
| **API repo (Render)** | https://github.com/oscarMandeep/backend |
| **Live API** | https://skillswap-api-c1ex.onrender.com |
| **Database** | Neon Postgres (used by the API only) |

**Try it:** open the live site and sign in as `priya@skillswap.dev` / `password123`. She has matches, chat with
unread messages and sessions in every state. The API README lists more accounts.

Stack: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Framer Motion,
TanStack Query, React Hook Form + Zod, Zustand, Socket.io client.

## Screens

| Route | What it is |
|---|---|
| `/` | Landing page (static) with "Get started free" and "Log in" |
| `/register`, `/login` | Email and password forms with validation |
| `/onboarding` | Skills I have and want, availability, mode, languages |
| `/discover` | Swipe deck: drag, stamps, undo, keyboard arrows, details panel, match % ring |
| Match modal | Opens from a swipe or from a live `match:new` event |
| `/matches`, `/chat/[id]` | Matches list; chat with optimistic send, typing, presence, read receipts, infinite scroll up, block, report, archive |
| `/sessions` | Slot picker, confirm, complete, review |
| `/wallet` | Credit balance and ledger |
| `/chains` | Swap chains with an animated loop |
| `/profile` | Profile editor |
| `/skills`, `/skills/[slug]`, `/learn/[skill]/in/[city]`, `/u/[username]` | Public SEO pages (ISR) with `sitemap.xml`, `robots.txt` and OG images |

## Architecture

```
src/
  app/            routes: (marketing) static/ISR, (auth) login/register, signed-in screens
  features/       one folder per feature: components, hooks, helpers (discover, chat, sessions, ...)
  components/     shared UI: brand, app shell, auth fields, shadcn/ui
  lib/api/        generated client (orval), fetcher, public fetch helpers
  lib/socket/     events.ts (copy of the API's), SocketProvider, cache helpers
  proxy.ts        signed-in visitors skip the landing page, signed-out visitors go to /login
```

How it talks to the API:

1. **REST:** the browser calls `/api/v1/*` on the web origin and `next.config.ts` rewrites it to `API_URL`.
   Cookies stay first-party and REST needs no CORS. `lib/api/fetcher.ts` retries once after a 401 by
   refreshing, otherwise sends the user to `/login`.
2. **The client is generated** from the API's `openapi.json` (`pnpm api:generate`), so hook names
   (`useGetMe()`) and types always match the backend. `pnpm contract:check` fails if they are stale.
3. **Real time:** one Socket.io connection straight to `NEXT_PUBLIC_SOCKET_URL` with a 60-second token.
   `SocketProvider` turns server pushes into TanStack Query cache updates.
4. **Marketing pages** read only `/v1/public/*` and never call `cookies()` or `headers()`, so they stay static/ISR.
   The API calls `/internal/revalidate` (protected by `REVALIDATE_SECRET`) when public data changes.

## Run it locally

Requirements: Node 22, pnpm 12 (`corepack enable`), and the API running (see its README).

```bash
pnpm install
cp .env.example .env.local     # values below
pnpm dev                       # http://localhost:3000
```

| Variable | Local value | Production value |
|---|---|---|
| `API_URL` | `http://localhost:4000` | the Render URL, no trailing slash |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:4000` | the Render URL |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | the Vercel URL (sitemap, canonical and share links) |
| `REVALIDATE_SECRET` | any string, same as the API's | same value as on Render |
| `ENABLE_EXPERIMENTAL_COREPACK` | not needed | `1` on Vercel only, so it uses the pnpm version pinned in `package.json` |

`NEXT_PUBLIC_*` values are baked in at build time, so change one and redeploy.
In development only, `/dev-login` lists test accounts for one-click sign-in. It is a 404 in production.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | dev server with reload |
| `pnpm build` / `pnpm start` | production build and server |
| `pnpm api:generate` | regenerate the API client from `../Backend/openapi.json` |
| `pnpm contract:check` | fail if the generated client is out of date |
| `pnpm lint` | ESLint, including the React Compiler rules |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm test` | Vitest |

Never run Prettier on `src/lib/api/generated` (it is in `.prettierignore`); `contract:check` would fail.

## Tests

```bash
pnpm lint && pnpm typecheck && pnpm test    # 18 unit tests in 4 files
```

The unit tests cover logic that is easy to get wrong and has no UI: optimistic chat cache updates, the auth
form schemas, the availability builder and time formatting. The deployed flow was checked by hand with the
seeded accounts (login, swipe, match, chat between two browsers, sessions, chains). A Playwright suite is not
built yet.

## Deployment (Vercel)

1. Import the `Frontend` repo on Vercel. Preset Next.js, root directory `./`, build settings untouched.
2. Add the environment variables from the table above.
3. Deploy, copy the URL, add it as `NEXT_PUBLIC_SITE_URL`, and redeploy.
4. Put the same URL into `WEB_URL` on Render (exact, no trailing slash) so live chat is allowed to connect.

## Key decisions

| Decision | Why |
|---|---|
| REST through a Next rewrite | First-party cookies, no CORS, and the API URL stays out of the browser code |
| Generated API client | One source of truth (the OpenAPI file); the compiler catches any contract change |
| TanStack Query as the only server-state store | Sockets just update its cache, so a fetched and a pushed message go through the same code |
| Optimistic chat send with a `clientId` | Messages appear instantly and are reconciled when the server echoes them |
| Static/ISR marketing pages, dynamic app | Public pages rank in search and load fast; signed-in pages are per user |
| Initials-on-gradient avatars | No upload service needed on the free tier |
| Email and password only for now | Google login needs OAuth keys; its button is hidden until they exist |
| Design tokens only, no raw hex in components | One place to change the look (`docs/05-design-system.md` in the docs repo) |

## Known limitations

No avatar upload, no email, no Playwright suite, and Google sign-in is hidden. The API sleeps on the free
plan, so the first request after a quiet period is slow.
