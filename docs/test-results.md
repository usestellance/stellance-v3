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
