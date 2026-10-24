# Test results

Run on 2026-10-20 against `api.usestellance.com` (live), Stellar Testnet, and production builds of the three
apps on demo data. Scripts: the session scratchpad (`api.mjs`, `testnet.mts`, `ui.mjs`); ask to have them
committed under `scripts/e2e` if they should be rerun in CI.

## 1. PRD edge cases on Stellar Testnet — 9/9 pass

Real transactions between throwaway Friendbot accounts, classified by the app's own code
(`features/payments/horizon.ts` + `verify.ts`) against one invoice expecting **2 USDC** with a unique memo.

| Case | Expected | Result |
| --- | --- | --- |
| Correct payment | Verified | ✅ verified |
| Insufficient (1 USDC) | Invalid, invoice stays unpaid | ✅ invalid: insufficient_amount |
| Wrong asset (2 XLM) | Not valid | ✅ invalid: wrong_asset |
| Wrong recipient | Never associated | ✅ not detected for this merchant |
| Unknown memo | Unmatched, no invoice change | ✅ unmatched: unknown_reference |
| No memo | Unmatched | ✅ unmatched: missing_reference |
| Failed transaction (underfunded, `tx_failed`) | Not a completed payment | ✅ failed: transaction_failed |
| Second correct payment | Not counted twice | ✅ invalid: duplicate |
| Replaying every event | One record each, one settlement | ✅ 7 records, 1 verified |

Merchant account used: `GB76H2D5FSSB2EOQZA2LDPM6WDYHAHEGU34F5HQVKHVPOOXCYSYJWBWU` (Stellar Expert, Testnet).

## 2. Live API — 55/60 pass

Every endpoint the web and admin apps call, plus access control. Writes only on a throwaway invoice
(billed to the account's own email) and a notification flag that was restored.

**Failures (real issues):**

| Call | Result | Why it matters |
| --- | --- | --- |
| `PATCH /invoice/{id}/mark-paid` with a fake hash (`000…0`) | **200, invoice marked paid** | Breaks the PRD's core rule: an invoice is paid only after on-chain verification. Any client can mark any of its invoices paid. |
| `DELETE` of that invoice | 400 "Cannot delete paid invoice" | Side effect of the test above: invoice **INV-20261020-0019** ("E2E test invoice (edited)", 2.03 USDC, id `c8be667c-78aa-4246-92c0-4f801f323886`) is stuck as paid on the account. Remove it in the database. |
| `GET /wallet` | 405 | The web app's `useGetWallet` calls it. And `/profile/me` returns the wallet **without its `id`**, so live PIN, transfer and key export can't find the wallet ("Wallet not found"). Add `id` to `/profile/me`'s wallet. |

**Passing, worth noting:**

- Access control: signed-out requests get 401 on user and admin routes; wrong password → 400.
- `GET /invoice/review/{id}?approve=` is an unauthenticated **GET that changes state** (approve/reject).
  Anyone with an invoice id can approve or reject it; a link preview or crawler can trigger it. Make it a
  POST with the payer's token.
- `GET /invoice/search?url=` (public) returns the merchant's **phone number and email**. The payment page
  needs the business name and wallet address only.
- `GET /admin/config/network` → 404 "network config not set". The admin console shows Testnet.
- Swagger (`/docs/doc.json`) is out of date: it lists `/invoices`, `/transactions`, `/users/me`,
  `/notifications`; the live routes are `/invoice`, `/transaction`, `/profile/me`, `/notification`.
- Planned endpoints are absent as expected: `/invoice/{id}/payments`, `/payment`, `/payment/{id}`,
  `/admin/payments` → 404.

Create-invoice response: the full invoice (`id`, `invoice_number`, `invoice_url`, `items`, `createdBy`, …);
the app now opens the new invoice after creating it.

## 3. UI on demo data — 10/10 flows pass, 0 console errors

Production builds, Microsoft Edge (headless), every page at 320, 375, 768, 1024 and 1440 px.

- Sign in with the demo account → overview.
- Customer payment page: *Awaiting payment* → simulate a correct payment → *Payment detected* →
  *Payment successful* once the (mock) API marks the invoice paid.
- Insufficient payment → *Amount mismatch*; the invoice is not shown as paid.
- Admin: a non-admin account is refused; admin signs in; suspend and re-activate a user.

Responsive: all overflows found were fixed (landing feature images fixed at 800 px, header with five links
at 1024 px, the dashboard's main column not shrinking, Payment Details buttons at 1024 px). A landing bug
was also found and fixed: the about cards stayed invisible because a CSS `transition-all` fought the
scroll animation.

## 4. Updated API review (2026-10-21) — not linked yet

The API now has payment detection (`payments-v2`). Checked against the spec (`/docs/doc.json`) and live, with
Testnet payments from a throwaway account to the merchant wallet. The cases were chosen so none could mark an
invoice paid.

**Working**

| Check | Result |
| --- | --- |
| `GET /payments/request/{invoice_url}` (public) | Payment instructions: reference `STL-…` (fits a memo, stable), amount, USDC + issuer, recipient, network, expiry, `payment_status` |
| `GET /payments/invoice/{id}` (auth; 401 signed out) | The same plus `payments[]`, `payment_detected_at`, `verification_status` |
| `GET /payments?status&limit&offset` | Records; status filter works |
| Automatic detection | All payments recorded ~5 s after the ledger closed, with no `/verify` call |
| Insufficient (1 of 59,421.92 USDC) | `invalid` · "insufficient amount: expected 594219200000 stroops, received 10000000" |
| Wrong asset (XLM) | `invalid` · "expected asset USDC:GBBD…, received XLM" |
| No memo / unknown memo | `unmatched` · "payment has no text memo reference" / "no invoice matches the payment reference" |
| Failed transaction (`tx_failed`) | `failed` · "transaction failed on Stellar"; not paid |
| `POST /payments/verify` twice per hash | Same record returned, no duplicates (6 hashes → 6 records) |
| `PATCH /invoice/{id}/mark-paid` with a fake hash | Refused ("could not verify the transaction on Stellar"); the body is now only `transaction_hash` |

**Issues**

1. **Duplicate payment misclassified.** 2.03 USDC with the reference of an already-paid invoice came back
   `unmatched` · "payment recipient is not the invoice recipient": that invoice's `recipient` is empty (also empty on
   cancelled invoices), so the duplicate rule never runs. Every invoice needs its recipient.
2. **Bad hashes answer 502** ("could not verify… try again shortly") on `/payments/verify` and `mark-paid`. Reserve
   5xx for Horizon being unreachable; a hash that isn't on the network is a 4xx.
3. **Wallet ledger incomplete:** `/transaction` shows 1 of the 6 incoming payments, with a new type `payment`.
4. **New invoice statuses** `expired` and `invalid_payment` (old overdue invoices are now `expired`). Invalid
   payments move the invoice to `invalid_payment`; whether a later correct payment still settles it is untested.
   `/invoice/stats` counts neither as pending.
5. **Shapes differ from the frontend contract** (docs/PLAN.md): payment fields are not on `/invoice/{id}` (only on
   `/payments/invoice/{id}`); records have `failure_reason` (one string) instead of `reasons[]` + `checks`; `asset` is
   `"CODE:ISSUER"`; amounts are strings with inconsistent decimals (`"2.030000"`, `"1"`); no `invoice_number` or
   `verified_at` on records; `/payments` uses `limit/offset` with no total (other lists are page-based with meta);
   `limit=101` is accepted although the spec says max 100.
6. **Still open from last round:** `/profile/me` wallet has no `id`; `GET /wallet` → 405; `GET /invoice/review/{id}`
   still changes state; the public invoice still returns the merchant's phone and email; no `/admin/payments`;
   20 legacy plural paths in the spec (live is singular); test invoice INV-20261020-0019 still stuck as paid.
7. **Not tested:** the happy path (a correct payment marks an invoice paid) and an expired invoice receiving a
   correct payment. Both need a payable test invoice that will stay in the account afterwards.

Side effects of this run: invoice INV-20260302-0006 moved from `viewed` to `invalid_payment`; six test payment records;
the merchant Testnet wallet received 5.03 USDC and 2 XLM (no value). Payer: `GD6NW3QDMALOXNFMSBI6XR4EQ25CHEART2IJJ6QJJ2PHZRU2PA2NHZIR`.

## 5. Whole-app walkthrough against the live API (2026-10-23) — not linked

Local production builds of web and admin with `NEXT_PUBLIC_API_SOURCE=live` (`PAYMENTS_SOURCE=horizon`), Edge
headless, merchant `tlayefaah@gmail.com` and the client side
signed out. `stellardev002@gmail.com` has no account (login → 404), so it was used only as the invoice's payer email.

**Happy path proven on live.** Invoice INV-20261023-0020 (1.03 USDC) was created and sent in the UI; a throwaway
Testnet account paid it with the backend's reference `STL-AFE5F8079C1F` (tx `9797b6f7…de17`). The backend marked it
`paid` ~11 s after the ledger closed, with `verified_at`, `explorer_url`, a confirmed ledger entry and the
notification "Payment for invoice INV-20261023-0020 was verified on Stellar".

**Works on live:** sign-in, overview, invoice list, create invoice (UI), send, preview, payment details and the
customer pay page showing Paid / Payment successful, notifications, wallet balance, admin sign-in, users, user detail,
invoices, transactions, network. No horizontal overflow at 375 px on the screens checked.

**Breaks or misleads on live (frontend work when linking):**

1. Memo mismatch: the UI tells the payer to use the invoice number (`INV-…`); the backend matches on `STL-…`. A
   payer following the UI is `unmatched`. Use `payment_reference` from `/payments/request/{url}` and
   `/payments/invoice/{id}`.
2. Approve fails ("An unknown error occurred"): the UI calls `GET /invoice/review/{id}?approve=`; the API is now
   `POST` with `{ approve }` (405).
3. Wallet activity shows received payments as outgoing (red "-$2.03 USDC"): incoming funds are now type `payment`,
   and the UI treats anything but `funding` as sent. Network fee renders blank.
4. Invoice payments tab marks every payment "No matching invoice" (horizon matching on `INV-…`); the verified
   1.03 USDC payment too. Use `/payments` and its verdicts.
5. Paid invoice's Payment Details shows no transaction hash or explorer link (PRD D3); `/payments/invoice/{id}`
   has both.
6. Admin overview and payment review crash ("Something went wrong"): they read `reasons[]`; live records have
   `failure_reason`.
7. Guest comment on the client page → 401 without the email's token (expected; the link used had none).
8. Key export (`/wallet/{id}/export` → 404, moved to `/wallet/export/{id}`); not exercised.

Test data from this run: invoice INV-20261023-0020 (paid, 1.03 USDC) on the merchant account; payer
`GAKF46D55HJHBDGQR5UHBS5IC463MU5V5D5WJTRB2ZOKBR4HDQJVBNFD`.

## 6. Frontend fixes after the walkthrough (2026-10-23)

The web and admin apps now read payments-v2 (`docs/PLAN.md`); the mock serves the same shapes. Checks:
`pnpm check-types` and `pnpm lint` pass in all packages (0 errors, 0 warnings), and web, admin and landing build.

Mock smoke run of the payment flow (compiled `@repo/mock-api`, calling the adapter directly), all passing:

| Check | Result |
| --- | --- |
| `GET /payments`: bare array, live record shape, `STL-…` references, `status` filter | pass (11 seeded records: verified, invalid, unmatched, failed) |
| `GET /payments/request/{url}`: public, amount `x.xxxxxx`, no `payments[]` | pass |
| `GET /payments/invoice/{id}`: includes `payments[]`; invoice DTO has no `payment_*` placeholders | pass |
| Simulated correct payment: `pending` / `payment_detected`, then verified, invoice `paid`, tx hash on the request | pass |
| Ledger `payment` entry with `invoice_id`, no `network_fee`; "Invoice Paid" notification | pass |
| Simulated insufficient payment: `invalid`, live wording, invoice `invalid_payment` | pass |
| `POST /payments/verify`: known hash returns records, unknown hash 404; `mark-paid` with a fake hash 404 | pass |
| `POST /invoice/review/{id} {approve}`; public invoice hides merchant email and phone; `/wallet/export/{id}` | pass |
| `GET /admin/payments` `{payments, meta}` with search | pass |
