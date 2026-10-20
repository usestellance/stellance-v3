# Stellance

Invoicing and payments on the Stellar network (Testnet): create an invoice, share a payment request, get paid in USDC,
with every payment detected and verified against its invoice.

Turborepo + pnpm monorepo:

| Path | What | Dev URL |
|---|---|---|
| `apps/landing` | Marketing site (usestellance.com) | http://localhost:3002 |
| `apps/web` | The app: auth, dashboard, invoices, payments, wallet, client payment pages (app.usestellance.com) | http://localhost:3000 |
| `apps/admin` | Admin console (admin.usestellance.com) | http://localhost:3001 |
| `packages/ui` | `@repo/ui`: design tokens, shadcn components, motion, fonts | — |
| `packages/mock-api` | `@repo/mock-api`: the in-browser demo backend | — |
| `packages/eslint-config`, `packages/typescript-config` | Shared configs | — |

## Getting started

Requires Node ≥ 22 and pnpm 12 (`corepack enable` picks the version from `package.json`).

```bash
pnpm install
pnpm dev            # all three apps
pnpm --filter web dev
```

The apps run on **demo data** by default, with nothing to configure:

- Web app: `demo@usestellance.com` / `Password1`.
- Admin: `admin@usestellance.com` / `Password1`.

On an invoice's payment page, **Simulate a Testnet payment** walks through every payment state. Set
`NEXT_PUBLIC_API_SOURCE=live` to use the real API (see each app's `.env.example`).

```bash
pnpm check-types
pnpm lint
pnpm build
pnpm format
```

Conventions, data flow and deployment: [CLAUDE.md](CLAUDE.md). Sprint scope, status and the backend contract:
[docs/PLAN.md](docs/PLAN.md). Test runs: [docs/test-results.md](docs/test-results.md).
