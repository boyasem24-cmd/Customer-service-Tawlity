# Tawlity Support

A small customer service ticketing system for Tawlity (restaurant reservation/discovery,
Kuwait). Diners and restaurant partners open tickets through a web widget, an agent works
them from a dashboard, and unresolved tickets escalate to the agent via WhatsApp.

## Architecture

- **Node.js + Express** server (`server.js`) exposing a small JSON API.
- **JSON-file storage** (`db.js`) — no database. Each "table" is an array in
  `data/<name>.json`, read/written with `fs`. Writes to the same table are serialized
  through an in-memory promise queue so two concurrent requests can't tear each other's
  read-modify-write. This is intentionally simple and is not meant to scale past a single
  process/machine — see "Before production" below.
- **Vanilla HTML/CSS/JS frontends** in `public/`, no build step, no framework:
  - `public/index.html` — the diner/restaurant-facing widget. Submits a ticket, then
    polls `GET /api/tickets/:id` every 4s to show new agent replies.
  - `public/agent.html` — the agent dashboard. Lists tickets (polls every 6s), shows a
    conversation, lets the agent reply, escalate, or resolve.
- **`whatsapp.js`** — wraps the Meta WhatsApp Cloud API. Sends two kinds of templated
  messages: `ticket_escalated` to the on-call agent's phone when a ticket is escalated,
  and `ticket_reply_notification` to the customer when an agent replies (only for
  tickets whose `contactType` is `phone` — email contacts aren't notified yet, since
  that would need a separate email provider; the dashboard flags this when it happens).

Data model (one row per ticket in `data/tickets.json`):

```
{
  id, subject, contactInfo, contactType ('email'|'phone'),
  status ('open'|'escalated'|'resolved'),
  category, priority,        // added by the auto-tagging pass, see below
  createdAt, updatedAt, escalatedAt,
  messages: [{ id, author ('customer'|'agent'), text, createdAt }]
}
```

## Running locally

```
npm install
cp .env.example .env   # then fill in the WhatsApp values, see below
npm start              # or `npm run dev` to auto-restart on file changes
```

Open `http://localhost:3000` for the widget, `http://localhost:3000/agent.html` for the
dashboard. There's no auth on either page yet — see "Before production".

## API routes

| Method | Path                        | Purpose                                            |
|--------|-----------------------------|-----------------------------------------------------|
| POST   | `/api/tickets`               | Create a ticket. Body: `{ subject, message, contactInfo, contactType }` |
| GET    | `/api/tickets`                | List all tickets, newest-updated first             |
| GET    | `/api/tickets/:id`            | Fetch one ticket                                    |
| POST   | `/api/tickets/:id/messages`   | Append a message. Body: `{ author: 'customer'\|'agent', text }`. If `author` is `agent` and the ticket's contact is a phone number, sends a WhatsApp notification and reports the outcome in the response's `notification` field. |
| POST   | `/api/tickets/:id/escalate`   | Send the WhatsApp escalation, mark ticket `escalated` |
| POST   | `/api/tickets/:id/resolve`    | Mark ticket `resolved`                              |

## WhatsApp Cloud API setup

Escalation sends a pre-approved WhatsApp **template message** (not a free-form message,
because you can only free-form message someone who messaged you first within the last 24
hours — templates are the way to reliably reach the agent).

1. **Create a Meta App**
   - Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) → Create App →
     type "Business" → add the **WhatsApp** product.
   - This gives you a **test phone number** for free, good enough for development.

2. **Get the Phone Number ID**
   - In the App Dashboard → WhatsApp → API Setup, note the **Phone Number ID** shown under
     "From" (this is a numeric ID, *not* the phone number itself) → `WHATSAPP_PHONE_NUMBER_ID`.

3. **Add your phone as a tester number (dev mode only)**
   - Still on API Setup, under "To", click **Manage phone number list** and add the phone
     that should receive escalations. In dev mode, Meta will only deliver messages to
     numbers on this list — you'll need to verify it with an SMS/call code.
   - That verified number, in international format with no leading `+` (e.g.
     `96550001234`), is `WHATSAPP_TO_NUMBER`.

4. **Get an access token**
   - The token shown on the "Try it out" page is temporary (expires in a matter of
     hours) but is the only option for a free test WhatsApp Business Account (WABA) —
     in practice, test WABAs created this way usually **cannot** be assigned to a
     System User, so `Add Assets → WhatsApp Accounts` may say something like "unable to
     assign assets right now." That's expected in dev mode, not a bug. A truly permanent,
     non-expiring token requires a production WABA (real phone number, business
     verification) — see "Before production" below.
   - For now: copy the temporary token from the "Try it out" page and use it promptly,
     since it can expire mid-session. That token is `WHATSAPP_TOKEN`.

5. **Create and approve the `ticket_escalated` template**
   - Template creation lives in **WhatsApp Manager**
     (`business.facebook.com/wa/manage/message-templates/`), not on the "Try it out"
     quickstart page (that page can only send Meta's pre-made sample templates).
   - Category: **Utility**. Name: `ticket_escalated`. Language: match `WHATSAPP_TEMPLATE_LANG`
     (default `en_US`).
   - Body, with **named** variables — Meta requires snake_case names, not positional
     `{{1}}`/`{{2}}`, and a variable can't be the last token in the message:
     ```
     Ticket #{{ticket_id}} was just escalated.
     Subject: {{subject}}
     Contact: {{contact_info}}
     Dashboard link: {{dashboard_link}}
     Please respond soon.
     ```
   - Leave Header, Footer, and Buttons empty/None.
   - Submit for review. Utility templates with plain text are usually approved within
     minutes to a few hours. You cannot send it until it shows **Approved**.
   - **Important**: create it under the same WhatsApp Business Account (WABA) your test
     phone number belongs to. If your Meta account has more than one WABA (easy to end
     up with by accident — e.g. one from clicking around WhatsApp Manager directly vs.
     one auto-created by the app's "Try it out" flow), a template created under the
     wrong one will approve fine but fail to send with error `132001` ("template name
     does not exist"), because it doesn't exist *for that phone number's WABA*. The
     "Try it out" / API Setup page shows the correct **WhatsApp Business Account ID**
     right next to the Phone Number ID — go to WhatsApp Manager via
     `business.facebook.com/wa/manage/message-templates/?waba_id=<that ID>` to make sure
     you're creating it in the right place.

6. **Create and approve the `ticket_reply_notification` template** (for Task 2 —
   notifying the customer when an agent replies)
   - Same place, same WABA as above. Category: **Utility**. Name:
     `ticket_reply_notification`. Language: English (US) (must match
     `WHATSAPP_REPLY_TEMPLATE_LANG`, default `en_US` — picking plain "English" instead
     of "English (US)" saves as language code `en`, not `en_US`, and sending will fail
     the same way as a WABA mismatch does).
   - Body:
     ```
     Tawlity Support: new reply on ticket #{{ticket_id}}.
     {{agent_message}}
     View conversation: {{ticket_link}}
     Reply anytime.
     ```
   - Submit and wait for **Approved**.

7. **Fill in `.env`**
   - `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TO_NUMBER` from above.
   - `WHATSAPP_TEMPLATE_NAME` / `WHATSAPP_TEMPLATE_LANG` if you didn't use the defaults.
   - `WHATSAPP_REPLY_TEMPLATE_NAME` / `WHATSAPP_REPLY_TEMPLATE_LANG` if you didn't use
     the defaults.
   - `DASHBOARD_BASE_URL` — the base URL the agent will open the dashboard link from
     (`http://localhost:3000` while testing locally; if testing from a phone on the same
     network, use your machine's LAN IP so the link is actually reachable from the phone).

8. **Test it**: create a ticket through `index.html`, open it in `agent.html`, click
   **Escalate via WhatsApp**. If it fails, the dashboard shows the actual Graph API error
   message (not just an HTTP status) — `whatsapp.js` surfaces `error.message`,
   `error.type`, and `error.code` from the Graph API response. Common causes:
   - Template not yet approved (or name/language mismatch) → `132001` template not found.
   - Template exists but was created under a different WABA than the phone number
     belongs to → also `132001` — see the note in step 5.
   - `WHATSAPP_TO_NUMBER` not added as a tester in dev mode → `131030` recipient not in
     allowed list.
   - Wrong `WHATSAPP_PHONE_NUMBER_ID` (using the display phone number instead of the ID).
   - Expired temporary token → `190` authentication error. Get a fresh one from "Try it
     out" and use it right away.
   - Token valid but not granted access to the specific WABA/phone number → `100`
     (subcode `33`), "object does not exist ... or missing permissions." Free test WABAs
     usually can't be assigned to a System User at all — see step 4.
   - To test the reply notification specifically: create a ticket through `index.html`
     with **phone** selected as the contact method, using a number added as a tester,
     then reply as the agent in `agent.html` — the dashboard reports whether the
     WhatsApp notification succeeded right after you send.

## Before production

This app is deliberately minimal. Before putting it in front of real users:

- **Storage**: `db.js`'s JSON files are fine for one process on one machine. There's no
  file locking against multiple server instances, no backups, and a large ticket volume
  will make the "read whole file, rewrite whole file" pattern slow. Move to a real
  database if/when that becomes a problem — don't do it preemptively.
- **Auth**: neither `index.html` nor `agent.html` has any authentication. Anyone with the
  dashboard URL can read/reply to every ticket. Add agent login before deploying.
- **Widget identity**: ticket creation trusts whatever `contactInfo` the caller sends —
  there's no verification the diner actually owns that email/phone. Fine for a support
  widget, but don't use `contactInfo` as an identity claim elsewhere.
- **Rate limiting / abuse**: `POST /api/tickets` and `/messages` have no rate limiting,
  so they're open to spam/flooding as-is.
- **Email contacts aren't notified**: reply notifications only work for tickets whose
  `contactInfo` is a phone number. Diners/restaurants who gave an email address won't
  hear about agent replies except by having the widget open (Task 2 as originally
  scoped only covered picking one channel — email would need a separate provider).
- **Production WABA/phone number**: sending real customer notifications (not just to
  testers) requires moving past the free test WABA to a production WhatsApp Business
  Account with a real phone number and business verification — see step 2 in the setup
  above.
- **HTTPS**: run behind a reverse proxy (nginx, Caddy, a PaaS) that terminates TLS — the
  Meta Graph API also requires the `DASHBOARD_BASE_URL` links to be reachable, so this
  matters for the escalation link too.
- **Secrets**: `.env` holds a long-lived WhatsApp token; keep it out of git (already
  gitignored) and out of logs.
- **WhatsApp 24-hour window**: this app only ever sends the one templated escalation
  message. If you later want the agent to free-form reply *from* WhatsApp back into a
  ticket, you're in the 24-hour customer-service window rules and need a webhook
  receiver — not built here.
- **Retries / delivery confirmation**: `whatsapp.js` sends once and surfaces failures to
  the agent in the UI; it doesn't retry or track delivery/read receipts. Add a webhook
  subscription on the Meta app if you need delivery status.
- **Template review turnaround**: template edits require re-approval and can take longer
  than "minutes" outside of simple utility templates — don't assume a template edit is
  live immediately.
