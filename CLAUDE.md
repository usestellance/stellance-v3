# Stellance

Invoicing and payment platform on Stellar. This sprint (Instaward round 2): Stellar **Testnet** payment detection and
verification for invoices: create invoice → payment request → pay → detect → verify → match → mark Paid → show the
transaction. Brief: https://docs.google.com/document/d/1by5WdIAx5-vGiQwT0AppSERJcbOUU70YoeUx0rKz6hY.
**Scope, status and the backend contract: `docs/PLAN.md`. Test runs: `docs/test-results.md`.** Structure mirrors
`../../blockstag-v2`; when in doubt about a convention, check how blockstag did it.

## Monorepo

Turborepo + pnpm 12 (`packageManager`), Node ≥ 22.

```
apps/landing/      (:3002) public marketing site, usestellance.com
apps/web/          (:3000) app.usestellance.com: auth /auth, dashboard /overview, public client pages /client/[id]
apps/admin/        (:3001) admin.usestellance.com: admin console (admins only)
packages/ui/       @repo/ui — design tokens, shadcn components, motion, fonts, the social card
packages/mock-api/ @repo/mock-api — the in-browser demo backend (axios adapter + seed data)
packages/eslint-config, packages/typescript-config
```

`pnpm dev` (all) · `pnpm build` · `pnpm check-types` · `pnpm lint` (UI and mock packages: `--max-warnings 0`)
· `pnpm format` (prettier: tabs, width 130).

## Deployment (Vercel Services)

One Vercel project, three services, routed by host in root `vercel.json`: `app.usestellance.com` → `web`,
`admin.usestellance.com` → `admin`, `usestellance.com` → `landing`. Previews have one generated host, so there `web`
sits at `/app` and `admin` at `/admin`, and each app's `next.config.ts` sets that basePath when `VERCEL_ENV=preview`
(`NEXT_PUBLIC_BASE_PATH`). Production origins are fixed per app in `src/lib/site.ts`. `site.ts` reads
`NEXT_PUBLIC_VERCEL_ENV` (inlined by `next.config.ts` `env`), never `VERCEL_ENV`, so client and server renders agree.

- `<Link>`, `router`, static imports and `/_next` get the basePath automatically; hand-built URLs and plain
  `next/image` `src` strings don't (`withBasePath`).
- Links between apps are plain `<a>` (or `location.assign`): landing → `APP_LINKS`, web → `LANDING_URL`.
- The app used to live on usestellance.com, so `apps/landing/next.config.ts` redirects the old app paths
  (`/auth/*`, `/client/*`, `/overview`, `/invoices/*`…) to the app; links already sent by email keep working.
- Each host serves its own `robots.txt`: landing allows all; web and admin disallow everything and are `noindex`.
- Link previews: `opengraph-image.tsx` / `twitter-image.tsx` per app (1200×630, built once), drawn by
  `@repo/ui/og-card` with static Satoshi weights from `packages/ui/src/assets/fonts/static`. Read files with literal
  `join(process.cwd(), "…")` paths; a dynamic path makes the build trace the whole repo.

## Stack

Next.js 16 (App Router, React Compiler, Turbopack), React 19, Tailwind v4, shadcn/ui (Radix) in `@repo/ui`, TanStack
Query + Table, zustand, react-hook-form + zod 4, axios, js-cookie, lucide + react-icons, sonner toasts, recharts 2,
jspdf (+ autotable) and xlsx for exports, `qrcode`, `@react-oauth/google`, gsap (landing only).

## Data

- **Source switch** (`lib/api/source.ts` in web and admin): the apps call the live API by default (since 2026-10-25).
  `NEXT_PUBLIC_API_SOURCE=mock` instead answers every request in the browser from `@repo/mock-api` (installed as an
  axios `adapter`, loaded only in mock mode). Same URLs, envelopes and error shapes either way, so hooks never know. Demo accounts:
  `demo@usestellance.com` / `Password1` (merchant), `admin@usestellance.com` / `Password1` (admin). The mock DB is one
  JSON document in localStorage (`stellance-mock-db`); "Reset demo data" on the sign-in page restores the seed. Seed
  dates are relative to the first run. Shape mock data like the live responses (captured shapes in `docs/test-results.md`).
- Backend: `https://api.usestellance.com/api/v1` (separate repo). Live routes are singular (`/invoice`, `/transaction`,
  `/profile/me`, `/notification`); the Swagger at `/docs` (`/docs/doc.json`) is current as of 2026-10-24. Success
  `{ status_code?, message, data }`. Lists page with `page` + `limit` and return `items` + `meta {page, limit, total,
  total_pages}` (older keys kept); `/transaction` filters with `type` and `status`, no search.
- Google sign-in posts `{ id_token }` to `/auth/social` (the API verifies it), so it uses Google's own button
  (`GoogleLogin`); the client id needs every app origin in its authorized JavaScript origins.
- The browser calls `/api/v1/*` on its own origin, rewritten in each app's `next.config.ts` to the backend
  (`API_PROXY_TARGET`). `NEXT_PUBLIC_API_URL` (or the old `NEXT_PUBLIC_BASE_URL`) forces direct calls.
- Web client: `lib/api/client.ts` (`axiosInstance` public, `axiosAuth` signed-in) and `lib/api/use-axios-auth.ts` (adds
  the `access_token` cookie). Code outside components sends the header itself (`features/payments/api.ts`). Session:
  `features/auth/store.ts`; `AuthProvider` gates `(dashboard)`. Admin: its own session (`stellance-admin-session`,
  zustand persisted), `RequireAdmin`, and sign-in refuses accounts that can't read `/admin/stats`.
- Wallets are custodial (the API creates them and signs); transfers need the wallet PIN. Never log, persist or render a
  private key outside the explicit export flow.
- Mutations never auto-retry (`retry: false`): a retried transfer could go out twice.

## Payments (`apps/web/src/features/payments`)

- The API detects and verifies payments; the frontend only reads the results. Endpoints (payments-v2): public
  `GET /payments/request/{invoice_url}`, merchant `GET /payments/invoice/{id}` (adds `payments[]`), `GET /payments`
  (bare array, `status`/`limit`/`offset`), `POST /payments/verify {transaction_hash}`, admin `GET /admin/payments`.
- `api.ts` is the one seam: DTOs, `fromRecord` (record → `DetectedPayment`), `stateFrom` (request → `InvoicePaymentState`),
  `reasonsFrom` (parses the API's `failure_reason` text into reasons; unknown text is shown as is), `paymentStatusOf`
  (badge status from the invoice alone). The reference is the API's `STL-…` memo; never invent one in the client.
- `status.ts` holds every label, colour and sentence (`PAYMENT_STATUS`, `VERIFICATION_STATUS`, `reasonCopy`).
  Components never decide these. "paid" only ever comes from the API's invoice status.
- Open invoices poll (6 s) until final; when the status changes, `useRefreshOnSettle` invalidates invoices, payments,
  notifications and transactions. Live returns an in-flight payment as `pending`; `api.ts` maps it to `detected`.
- Invoice statuses: draft, sent, viewed, pending, payment_detected, paid, expired, invalid_payment, cancelled, refunded;
  invoices carry the API's `payment_status` and `payment_reference`. Incoming money is a `payment` ledger entry with
  `invoice_id` and no `network_fee`; outgoing transfers are `path_payment` (shown as "transfer").
- Paying from the client's own wallet (`features/payer-wallet`, as in ../../go-medi): Stellar Wallets Kit, loaded on
  first use. Varial (formerly Freighter; module id still `freighter`) / xBull extensions, Albedo, and LOBSTR or the
  Varial app over WalletConnect on phones (`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`; the Reown project must list every
  Stellance domain). Laptops check for Varial's extension and offer its store link; phones can't see installed apps,
  so the page deep-links straight to the chosen app and offers the App Store / Play link if it's still in front
  2.5 s later (in Varial's own browser, `window.stellar.platform === "mobile"`, it pairs in place). `pay.ts` builds the
  exact payment (reference as text memo) after checking trustline and balance, the wallet signs, Horizon Testnet
  takes it; the API still detects and verifies. A submit with no answer is never retried.
- `PaymentSimulator` (mock only) sends the PRD's scenarios through the mock backend: detected for 4 s, then the result,
  then the invoice paid 3 s later if valid.
- Stellar constants and explorer links: `lib/stellar/config.ts`.

## Domain rules (this sprint)

- Never show an invoice as **Paid** until the API says its Stellar transaction is verified. A detected transaction is
  "Payment detected", a verified one "Payment verified", and only the API's `paid` is "Paid".
- Keep blockchain detail secondary in copy ("Payment confirmed", with the tx hash and a Stellar Expert Testnet link available).

## Design system (`packages/ui`)

Tokens in `src/styles/globals.css`: primary navy scale `primary-50…600` (`primary-500` #000C3B), `neutral-500…900`
(`neutral-500` #FFFFFF background), `success-*`, `error-*`, `info-*`, `warning-*`, `black-500` #14171F text. Use these
instead of hex. Font: Satoshi (variable, `@font-face` in globals.css). Shared layout classes: `landing-container`,
`custom-container`, `h2-auth`, `h2-app`, `in-app-btn`, `invoice-shadow`, `scroll`, `hide-scroll`.

Import as `@repo/ui/<file>` (`@repo/ui/button`, `@repo/ui/sonner`, `@repo/ui/animated-number`, `@repo/ui/lib/utils`,
`@repo/ui/hooks/use-mobile`). New shadcn components go in `packages/ui/src` (`components.json` there). In the web app,
toasts go through `useToast()` (`lib/use-toast.ts`, sonner underneath).

## Motion

App (CSS only, in `packages/ui` globals, all off for reduced motion): calm and precise for a payments product.
`.animate-rise` (stagger with `style={{ "--i": n }}`), `.animate-page` (every `template.tsx`), `.animate-pop` (a settled
result), `.animate-signal` (only on statuses waiting for the network), `.animate-scan` (verifying), `.animate-check`
(the Paid tick), and `AnimatedNumber` for stats.

Landing (gsap, `features/landing/motion.ts`): everything goes through `useMotion` (reduced-motion visitors get the static
layout; reruns on the 1024px breakpoint; `mm.revert()` cleans up). `revealWords` for headlines, `revealOnScroll` for
content. Never animate an element that has its own CSS `transition` (`transition-all` froze the about cards
invisible): animate a wrapper or limit the transition to the properties it needs.

## Conventions

- Feature folders: `src/features/<domain>/{hooks, components/, store.ts, schema.ts, types.ts, api.ts}`. `src/app/**`
  pages stay thin; layout pieces live in `src/components/layouts`, providers in `src/components/providers`.
- Imports use `@/…` inside an app and `@repo/ui/…` for shared UI, never long `../../..` chains.
- Named exports for new components; route files keep default exports.
- App-only images live in that app's `public/images`; shared assets in `packages/ui/src/assets`.
- Every `<form>` using `form.handleSubmit` needs `noValidate`.
- Never `setState` synchronously in `useEffect`, and never read `ref.current` during render.
- A component using `useSearchParams` needs a `<Suspense>` boundary above it.
- Flex children that hold tables or long text need `min-w-0` (the dashboard `<main>` has it) or they push the page wide.

## Landmines

1. pnpm strict linking: a package imported in a file must be a dependency of _that_ workspace package. `next/*` imports
   stay in the apps, never in `@repo/ui`.
2. Restart the dev server after `pnpm install`.
3. New dependency with build scripts → list it under `allowBuilds` in `pnpm-workspace.yaml`.
4. Never run `next build` into `.next` while `pnpm dev` runs. Use `NEXT_DIST_DIR=.next-verify npx next build`.
5. Next 16 error boundaries get `retry()` (not `reset()`). Route params are Promises (`PageProps<"/route/[id]">`).
6. Keep all `@radix-ui/*` packages on the same release.
7. `recharts` stays on 2.x (shadcn `chart.tsx`) and `@tanstack/react-table` on 8.x until those are migrated.
8. Many older source files use CRLF line endings; scripted edits must normalise them (or use exact edits).
