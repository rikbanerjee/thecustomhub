# Email Setup — TheCustomHub

How email works on TheCustomHub: what sends, what receives, from which
addresses, and how to reply to customers *as* `info@thecustomhub.com`.

Everything runs through **Resend** (server-side, key in Firebase Secret Manager).
The sending domain `thecustomhub.com` is **verified** in Resend (SPF/DKIM), so any
`*@thecustomhub.com` address can be used as a `from`. No mailbox is required to
*send* from an address.

---

## 1. Outgoing email (what the site sends)

All sends go through Resend from Cloud Functions in `functions/index.js`.

| Email | Trigger | From | To |
|---|---|---|---|
| **Order notification (owner)** | Paid Stripe order (`stripeWebhook` → `sendOrderEmail`) | `orders@thecustomhub.com` | `personalizedbyrisa@gmail.com` |
| **Customer receipt** | Paid Stripe order (`stripeWebhook` → `sendCustomerReceipt`) | `orders@thecustomhub.com` | the customer's email |
| **Contact / custom-order / quick-lead / newsletter (owner)** | Any of the 4 lead forms (`sendInquiryEmail`) | `hello@thecustomhub.com` | `personalizedbyrisa@gmail.com` |

Lead-form trigger locations:
- `contact` → `/contact` (`src/pages/Contact/index.jsx`)
- `custom-order` → `/custom-orders` stepper (`src/pages/CustomOrders/index.jsx`)
- `quick-lead` → homepage quick form (`src/components/CustomOrderForm/index.jsx`)
- `newsletter` → footer signup (`src/components/Footer/index.jsx`)

The old `onboarding@resend.dev` sandbox sender has been fully retired. (Sandbox
could only deliver to the Resend account owner; the verified domain removes that
restriction, which is why the customer receipt can reach any address.)

---

## 2. Incoming email (receiving at `*@thecustomhub.com`)

Resend **receives** mail for the domain (MX records point to Resend) and pushes an
`email.received` webhook to the `resendInboundWebhook` Cloud Function. That
function:

1. Verifies the Svix signature (secret: `RESEND_WEBHOOK_SECRET`).
2. Fetches the full message from Resend's Received Emails API (the webhook payload
   is metadata only — no body).
3. Re-sends it to `personalizedbyrisa@gmail.com` from `forward@thecustomhub.com`,
   with a From/To/Subject header block and `reply_to` = the original sender.

Net effect: anything sent to `info@thecustomhub.com` (or any `*@thecustomhub.com`)
lands in the owner's Gmail. Attachments are **not** carried through in v1 — the
forward lists their filenames and points to the original in the Resend dashboard.

**Important:** Resend inbound is webhook-based, **not a real IMAP mailbox**. There is
no inbox you can log into for `info@thecustomhub.com`.

---

## 3. Replying to customers AS `info@thecustomhub.com`

Today, replying from the forwarded Gmail message goes out from
`personalizedbyrisa@gmail.com`. To reply so the customer sees
`info@thecustomhub.com`, use **Gmail "Send mail as" + Resend SMTP**. No code or new
webhook needed.

### Resend SMTP credentials
- **Host:** `smtp.resend.com`
- **Port:** `587` (STARTTLS) — or `465` (SSL)
- **Username:** `resend`
- **Password:** a Resend API key
- Requires the verified domain (already done).

### Gmail one-time setup
1. Gmail → ⚙️ **Settings → Accounts and Import → "Send mail as" → Add another email address**.
2. Name: `The CustomHub`; Email: `info@thecustomhub.com`.
3. SMTP Server `smtp.resend.com`, Port `587`, Username `resend`, Password = Resend API key, TLS.
4. Gmail emails a confirmation code to `info@thecustomhub.com` → it's **forwarded to
   Gmail** by `resendInboundWebhook` → enter the code.
5. When composing/replying, pick `info@thecustomhub.com` in the **From** dropdown.

### Caveats
- **You must manually pick `info@` in the From dropdown** each reply. Because
  forwarded mail arrives *to* your Gmail (not *to* info@), Gmail can't auto-select
  the identity, and "Reply from the same address the message was sent to" won't
  catch it for the same reason.
- SMTP sends **count against the Resend quota**, same as API sends.

---

## 4. Alternative: a real mailbox for `info@thecustomhub.com`

If you'd rather have `info@` behave like a normal inbox (native receive + reply, no
From-dropdown fiddling), move it to a mailbox provider:

- **Zoho Mail** — free tier.
- **Google Workspace** — paid.

Tradeoff: you'd repoint the domain **MX records** to that provider, which
**replaces Resend inbound receiving** — the `resendInboundWebhook` forwarding would
no longer be the receive path. Outgoing app emails (order/lead notifications,
receipts) would still go through Resend and are unaffected. This is the more
"proper" long-term setup but a bigger migration. The Gmail + Resend SMTP route in
§3 is the zero-migration option.

---

## Secrets reference (Firebase Secret Manager)

| Secret | Used by |
|---|---|
| `RESEND_API_KEY` | all sending + inbound fetch |
| `RESEND_WEBHOOK_SECRET` | `resendInboundWebhook` signature verification (Resend webhook's `whsec_…`) |
| `STRIPE_SECRET_KEY` | `createCheckoutSession`, `stripeWebhook` |
| `STRIPE_WEBHOOK_SECRET` | `stripeWebhook` signature verification (Stripe webhook's `whsec_…`) |
