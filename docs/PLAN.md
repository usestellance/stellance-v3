# Stellance: Instaward round 2 plan

Brief: [Stellance — MVP: Stellar Payment Detection, Verification & Invoice Lifecycle](https://docs.google.com/document/d/1by5WdIAx5-vGiQwT0AppSERJcbOUU70YoeUx0rKz6hY).
Stellar **Testnet only**. Mainnet and real money are out of scope.

The goal is one demonstrable flow:

```
Create Invoice → Share Payment Request → Pay on Testnet → Detect → Verify → Match → Mark Paid → Show Transaction
```

The rule that governs everything: **an invoice is never shown as Paid until the backend has verified a matching
Stellar transaction.** Seeing a transaction is not enough.

## Status (2026-10-20)

**Frontend: built, running on demo data.** Every D3 screen exists (below, checked). The apps run on
`@repo/mock-api` by default (`NEXT_PUBLIC_API_SOURCE=mock`), which also serves the payment contract below, so the
whole lifecycle can be clicked through and demoed: "Simulate a Testnet payment" on the payment pages plays the
customer and the network. Against the live API, payments are read from Stellar Testnet directly
(`NEXT_PUBLIC_PAYMENTS_SOURCE=horizon`) with the same verification rules, which pass all PRD edge cases on real
Testnet transactions (`docs/test-results.md`). "Paid" still only ever comes from the API.

**Backend: D1 and D2 are not started.** The live API has no payment fields, no detection and none of the endpoints
below. It also marks an invoice paid from any client-supplied hash (`PATCH /invoice/{id}/mark-paid`, see
test results). Switch the web app to the backend with `NEXT_PUBLIC_API_SOURCE=live` + `NEXT_PUBLIC_PAYMENTS_SOURCE=api`
once these exist.

### Backend contract the frontend is built against

Fields come straight from `features/payments/api.ts` (`PaymentDto`) and `features/invoice/types.ts`; the mock
(`packages/mock-api/src/handlers`) implements exactly this.

| Endpoint | Returns |
| --- | --- |
| Invoice fields on `GET /invoice/{id}`, `GET /invoice`, `GET /invoice/search` | `payment_reference`, `payment_recipient`, `payment_asset_code`, `payment_asset_issuer`, `payment_amount`, `payment_expires_at` (the app falls back to invoice number, merchant wallet, USDC and total) |
| `GET /invoice/{id}/payments` (public, like the payment page) | `PaymentDto[]` for that invoice: every attempt, valid or not |
| `GET /payment?page&size&status` (merchant) | `{ payments: PaymentDto[], meta }` |
| `GET /payment/{id}` (merchant) | `PaymentDto` with checks and reasons |
| `GET /admin/payments?page&limit&status` | `{ payments: (PaymentDto & { merchant_email })[], meta }` |
| `PaymentDto` | `id, transaction_hash, sender, recipient, asset_code, asset_issuer, amount, payment_reference, transaction_successful, verification_status (detected·verified·invalid·unmatched·failed), reasons[] (insufficient_amount·wrong_asset·wrong_recipient·missing_reference·unknown_reference·transaction_failed·duplicate), checks {recipient, asset, amount, reference, success, invoice: pass·fail·skip}, invoice_id, invoice_number, expected {amount, asset_code, asset_issuer, recipient, payment_reference}, detected_at, verified_at` |
| Fixes | `/profile/me` wallet needs its `id`; `mark-paid` must verify on chain or be removed; `GET /invoice/review/{id}` should be an authenticated POST; the public invoice should not expose the merchant's phone/email; refresh the Swagger spec |

## Where Round 1 leaves us (audit of this repo)

| Area | Today | Gap against the brief |
| --- | --- | --- |
| Invoice status | `draft · sent · viewed ("Pending") · paid · overdue · cancelled` (`features/invoice/store.ts`, `components/InvoiceStatusBadge.tsx`) | No `awaiting_payment`, `payment_detected`, `expired`, `failed`, `invalid_payment`. Status and payment status are one field. |
| Payment request (`/client/[id]/make-payment`) | Shows the total in fiat format and the merchant's wallet address to copy. "Change Payment Methods" is a "Coming soon" toast. | No expected **asset**, no amount in that asset, no **memo / payment reference**, no QR or SEP-7 `web+stellar:pay` link, no live status. A payer can't produce a payment the backend can match. |
| Invoice ↔ transaction | None. `InvoiceType` has no payment record, and `ITransaction` (`features/transactions/types.ts`) has no `invoice_id`. | Needs a `Payment` record per invoice (see the data model below). |
| Transactions | List and detail of wallet activity (`funding · withdrawal · transfer`, `confirmed · pending · failed`), tx hash with copy. | No explorer link, no link back to an invoice, no `unmatched` / `invalid` / `requires review` states. |
| Wallets | Custodial: the API creates the wallet, holds the key, transfers need a PIN, keys export as a PDF. | Fine for this sprint (the brief doesn't ask for non-custodial). Note: `IWallet.private_key` is in the client type, so make sure no list or detail endpoint returns it. |
| Detection / verification | Nothing in the frontend. Nothing visible from the API either. | All of D2: backend work. |

## Deliverables, split by owner

### D1: invoice payment reference (backend first, then frontend)

**Backend**

- [ ] On send (`POST /invoice/send/{id}`), create the invoice's payment record: expected recipient (the merchant's wallet),
      expected asset (USDC on Testnet: code + issuer), expected amount in that asset (7 decimals), a unique **memo**
      (`MEMO_TEXT` ≤ 28 bytes or `MEMO_ID`; one per invoice, never reused), expiry.
- [ ] Return it on `GET /invoice/{id}` and on the public client endpoint (`invoice_url`), plus `payment_status`,
      `detected_at`, `verified_at`, `transaction_hash`.
- [ ] Status model: `draft → sent → awaiting_payment → payment_detected → paid`, exceptions `expired · failed · invalid_payment`.
      Decide what happens to `viewed` and `overdue` (keep them as flags, or fold them in).

**Frontend**

- [x] `features/invoice/types.ts`: add `payment` (`expected_asset`, `expected_amount`, `recipient`, `memo`, `expires_at`,
      `payment_status`, `transaction_hash`, `detected_at`, `verified_at`).
- [x] One status → label/colour mapping for the new states (`InvoiceStatusBadge`, filter options in `lib/constants.ts`).
      Derive badges from that mapping only, never inline in components.
- [x] Create/preview invoice: show the asset the client will pay in, and the amount in that asset next to the fiat total.

### D2: detection and verification (backend)

- [ ] Watch Testnet payments to merchant wallets: Horizon `/accounts/{id}/payments` streaming (SSE) with a saved
      **paging token cursor** so a restart resumes where it stopped; poll as a fallback when the stream drops.
- [ ] For each payment op: the tx is successful, the op is `payment` / `path_payment_*`, the destination equals the expected
      recipient, the asset code **and issuer** match, the amount is at least the expected amount, and the memo matches.
- [ ] Idempotency: a unique index on `(transaction_hash, operation_index)`. Processing an event twice is a no-op.
- [ ] Results: `verified` (invoice → `paid`, persist hash and times) · `invalid` (matched an invoice by memo, failed a check;
      store the reason: `insufficient_amount`, `wrong_asset`…) · `unmatched` (no invoice for the memo; never touches an invoice)
      · `failed` (tx failed on chain; never recorded as paid).
- [ ] Overpayment / partial payments: decide the policy (the brief only requires that insufficient stays unpaid).
- [ ] Endpoints the frontend needs: payment status for an invoice (or include it in the invoice), list of payments with
      verification status, and unmatched/invalid payments for the merchant ("requires review").
- [ ] Reliability: Horizon timeouts and 5xx retried with backoff, a delayed detection still matches, and an expired
      invoice that later receives a correct payment ends up in review rather than silently paid.

### D3: payment status UI and end-to-end validation (frontend + design)

Screens named in the brief (designer is to refine the existing flow, not redesign it):

- [x] **Payment request** (`/client/[id]/make-payment`): amount + asset (large), recipient with copy, memo with copy and a
      clear "you must include this memo" note, QR code / `web+stellar:pay` link carrying destination, amount, asset and memo,
      expiry countdown. Replace the "Coming soon" link.
- [x] **Live status** on the payment page and the invoice preview: poll the invoice (e.g. every 5 s while
      `awaiting_payment` or `payment_detected`, stop on a final state) and step through
      Awaiting payment → Payment detected (verifying…) → Payment verified → Paid, or Invalid / Unmatched with the reason.
- [x] **Invoice payment details** panel (merchant preview + client view): invoice amount, expected asset, recipient,
      payment status, detected time, verification status, tx hash, Stellar Expert Testnet link
      (`https://stellar.expert/explorer/testnet/tx/{hash}`).
- [x] **Transaction details** (`/transactions/[id]`): explorer link, linked invoice, verification status.
- [x] **Invalid / unmatched** payments: a merchant view (a tab or filter in Transactions) listing them with the reason.
- [x] **Invoice history/status**: a Payment Status column on invoice lists and the overview. (Status filters wait for the API statuses.)
- [x] Keep blockchain detail secondary in copy ("Payment confirmed", with the hash and explorer link available).

### Required edge cases (test matrix for the demo)

| Case | Setup on Testnet | Expected |
| --- | --- | --- |
| Correct payment | Right recipient, asset, amount, memo | Invoice → Paid, hash shown |
| Insufficient | Amount below the invoice | Invoice stays unpaid; payment `invalid: insufficient_amount` |
| Wrong asset | XLM, or a fake "USDC" from another issuer | Not valid; invoice unchanged |
| Wrong recipient | Payment to another account | Never associated with the invoice |
| Unmatched | Correct payment with an unknown or missing memo | `unmatched`; no invoice changes |
| Duplicate | Same event processed twice (replay the cursor) | One payment record, one status change |
| Failed tx | A transaction that fails on chain | Not recorded as a completed payment |

Record each run (invoice id, tx hash, explorer link, result) in `docs/test-results.md` for the final report.

## Suggested order

1. Agree the API contract with the backend: payment record fields, statuses, endpoints. Update the types first, and use
   a typed mock until the API is ready, as `../../blockstag-v2` does (`lib/api/source.ts` + `mocks/`).
2. Status model and badge mapping across the invoice list, preview and filters.
3. Payment request page (asset, amount, memo, QR, copy) + live status polling.
4. Payment details panel + transaction explorer links + invalid/unmatched view.
5. End-to-end runs of the edge-case matrix on Testnet, fix priority bugs, deploy, record the demo.

## Where the screens live

- `features/payments/`: `verify.ts` (the rules), `horizon.ts` (Testnet reader), `api.ts` (the one seam), `status.ts` (every label and colour), `hooks.ts`, `components/` (status badge, state icon, timeline, checklist, copy field, QR, simulator).
- Routes: `/invoices/[id]/payment` (merchant details), `/client/[id]/make-payment` (customer), `/transactions/payments` and `/transactions/payments/[id]` (verified · invalid · unmatched · failed).
- Admin (`apps/admin`): `/payments` payment review.

## Housekeeping found during the restructure

- `pnpm lint` fails on existing code: 22 errors in `apps/web` (13 `no-explicit-any`, 4 setState-in-effect, 2 `useState`
  called inside a callback in `CreateInvoiceForm{Desktop,Mobile}.tsx`, which is a real hooks bug, plus unescaped quotes),
  1 in `apps/landing`, and ~70 warnings (mostly unused imports).
- `xlsx` on npm is frozen at 0.18.5 with known advisories. SheetJS now ships from its own CDN, or switch to CSV for exports.
- `recharts` stays on 2.x (the shadcn `chart.tsx` is written for it) and `@tanstack/react-table` on 8.x; both have new
  majors that need code changes.
- Dark mode: tokens for `.dark` exist but nothing toggles it (blockstag has `theme.ts` + `ThemeProvider`).
