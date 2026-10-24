# Stellance: Instaward round 2 plan

Brief: [Stellance — MVP: Stellar Payment Detection, Verification & Invoice Lifecycle](https://docs.google.com/document/d/1by5WdIAx5-vGiQwT0AppSERJcbOUU70YoeUx0rKz6hY).
Stellar **Testnet only**. Mainnet and real money are out of scope.

The goal is one demonstrable flow:

```
Create Invoice → Share Payment Request → Pay on Testnet → Detect → Verify → Match → Mark Paid → Show Transaction
```

The rule that governs everything: **an invoice is never shown as Paid until the backend has verified a matching
Stellar transaction.** Seeing a transaction is not enough.

## Status (2026-10-23)

**Backend: payments-v2 is live.** The API detects Testnet payments to merchant wallets, verifies them against the
invoice (recipient, asset code + issuer, amount, `STL-…` memo reference, tx success), marks the invoice paid and
sends an "Invoice Paid" notification. Proven end to end on INV-20261023-0020 (paid about 11 s after the payment). Gaps
still on the backend side are listed in the backend-gaps document and `docs/test-results.md` §4.

**Frontend: wired to payments-v2, still on demo data by default.** The payment screens read the endpoints below (the
client no longer reads Horizon or derives references), and `@repo/mock-api` serves the same shapes, so
`NEXT_PUBLIC_API_SOURCE=live` is the only switch. "Simulate a Testnet payment" on the payment pages plays the customer
and the network in demo mode. `pnpm check-types`, `pnpm lint` (0 errors, 0 warnings) and all three builds pass.

### Backend contract (live, captured 2026-10-22)

| Endpoint | Returns |
| --- | --- |
| `GET /payments/request/{invoice_url}` (public) | `invoice_id, invoice_number, invoice_status, payment_status, amount ("x.xxxxxx"), asset, asset_issuer, recipient, payment_reference (STL-…), network, expires_at`, plus `payment_detected_at, verification_status, verified_at, paid_at, transaction_hash, explorer_url` once paid |
| `GET /payments/invoice/{id}` (merchant) | The same plus `payments[]` (every attempt) |
| `GET /payments?status&limit&offset` (merchant) | Bare array of payment records |
| `POST /payments/verify {transaction_hash}` | The records for that hash (404 if Stellar has no such tx) |
| `GET /admin/payments?page&limit&status&search` | `{ payments, meta }` |
| Payment record | `id, invoice_id?, transaction_hash, explorer_url, sender, recipient, asset ("CODE:ISSUER" or "XLM"), amount (string), payment_reference, verification_status (pending·verified·invalid·unmatched·failed), failure_reason?, ledger_closed_at, detected_at, verified_at?` |
| Other changes | Invoice statuses add `expired`, `invalid_payment` (no `overdue`); review is `POST /invoice/review/{id} {approve}`; key export is `GET /wallet/export/{id}`; incoming ledger entries are type `payment` with `invoice_id` |

Still wanted from the backend: `GET /payments/{id}`, a machine-readable `failure_code` and per-check results (the
app parses `failure_reason` text for now), `invoice_number` / `merchant_email` on records, notifications for
invalid and unmatched payments, and consistent paging across list endpoints.

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

- `features/payments/`: `api.ts` (the one seam: DTOs and mapping), `status.ts` (every label and colour), `hooks.ts`, `components/` (status badge, state icon, timeline, checklist, copy field, QR, simulator).
- Routes: `/invoices/[id]/payment` (merchant details), `/client/[id]/make-payment` (customer), `/transactions/payments` and `/transactions/payments/[id]` (verified · invalid · unmatched · failed).
- Admin (`apps/admin`): `/payments` payment review.

## Housekeeping found during the restructure

- Lint debt from round 1 (`any`, setState-in-effect, the `useState`-in-callback hooks bug in the create forms, unused
  imports) is cleared: 0 errors, 0 warnings.
- `xlsx` on npm is frozen at 0.18.5 with known advisories. SheetJS now ships from its own CDN, or switch to CSV for exports.
- `recharts` stays on 2.x (the shadcn `chart.tsx` is written for it) and `@tanstack/react-table` on 8.x; both have new
  majors that need code changes.
- Dark mode: tokens for `.dark` exist but nothing toggles it (blockstag has `theme.ts` + `ThemeProvider`).
