# Tawlity CRM: Design and Logic

Version 1, 20/10/2026. Describes the CRM as built on branch `claude/new-session-lcj58x`.

---

## 1. Purpose

Tawlity sells a table-booking system to restaurants in Kuwait and runs a booking app for diners. The CRM is the team's single place to:

- **Win restaurants**: track prospects from first visit to signed contract.
- **Keep restaurants**: onboard them, watch account health, send monthly reports, renew contracts.
- **Look after diners**: see app users, their booking behaviour and their support history.

The CRM does **not** replace the Tawlity admin panel. Operational work (menus, tables, bookings, payments) stays in the admin panel. The CRM receives that data through CSV exports (section 11) and adds the relationship layer on top: people, conversations, tasks, deals and follow-up.

---

## 2. Two separate sides

| | Restaurants (B2B) | Diners (B2C) |
|---|---|---|
| Who | Restaurants and holding groups, and the people who run them | People who book through the Tawlity app |
| Goal | Sell, onboard, retain, renew | Understand usage, handle support, respect WhatsApp consent |
| Main screens | Dashboard, Restaurants, Restaurant Contacts, Pipeline | Dashboard (Diners tab), Diners |
| Who can see it | Every team member | Admins and support staff only |

The two sides share the login and the dashboard, but their data is kept apart. A salesperson never sees diner records.

---

## 3. Users and roles

| Role | Can do |
|---|---|
| **Admin** | Everything, including managing users and settings, and the diners side. |
| **Support** | Everything on the restaurants side, plus the diners side. |
| **Sales** (regular user) | Restaurants side only. The Diners menu, tab and data are hidden and blocked. |

Users are never deleted, only **disabled**, so their history (notes, deals, tasks) stays intact.

---

## 4. What the CRM stores

### Restaurant (or holding group)
- **Identity:** name, logo, cuisines (one or more), governorate, area, address, phone, website, Instagram, Google Maps link.
- **Size and market:** number of branches, seating capacity, price range (KD / KDD / KDDD), booking system used before Tawlity (none, SevenRooms, Eat App, Instagram/WhatsApp DMs, other).
- **Sales origin:** lead source (door to door, referral, Meta ad, Gastronomy Association, event/expo, website, other), Kuwait Gastronomy Association member yes/no.
- **Account:** status, plan, monthly fee (KWD), contract start, renewal date, health (Green / Amber / Red) with a note, date the last monthly report was sent, onboarding checklist.
- **Group structure:** a restaurant can belong to a **holding group** (e.g. Gulf Table Group). The group has its own record with a Brands tab listing its restaurants.

### Restaurant contact
Name, job title, **role** (owner, partner, general manager, operations manager, marketing, front of house, other), **decision maker** yes/no, preferred language (Arabic / English), phones (+965), emails, background notes.

### Deal
One sales opportunity with a restaurant: name, stage, plan, monthly fee (KWD), branches covered, expected closing date, lost reason, description, linked contacts.

### Notes and tasks
- **Notes** on contacts and deals record what happened (visit, call, demo). A contact note also carries a temperature: Cold, Warm, Hot, In contract.
- **Tasks** are the next steps, with a type, due date and owner. Task types: Visit, Call, WhatsApp follow-up, Demo, Onboarding/Training, Send monthly report, Contract renewal.

### Diner
Name, phone (unique), email, language, gender, signup date and platform (iOS / Android / web), acquisition source (organic, Meta ad, referral, restaurant QR, other), total reservations, no-shows, cancellations, last booking date, WhatsApp consent with date, status (active / inactive / blocked), tags. Diner notes are either a plain note or a **support** note with status Open or Resolved.

---

## 5. Sales pipeline (winning restaurants)

Deals move across a Kanban board in this order:

**Lead → Visited → Demo done → Trial → Negotiation → Signed → Live**, or **Lost** at any point.

Rules:
- **Signed** and **Live** count as **won**. **Lost** counts as lost. The other five stages are **open**.
- Moving a deal to **Lost** requires a **lost reason** (price, chose another system, not ready, no response, other). Dragging a card into Lost opens the edit form so the reason is captured.
- The deal amount is the **monthly fee in KWD**.

---

## 6. Account lifecycle (keeping restaurants)

Every restaurant has an **account status**:

| Status | Meaning |
|---|---|
| Prospect | Not a customer yet. Sales work happens in deals. |
| Onboarding | Signed; being set up. |
| Live | Taking bookings through Tawlity. |
| Paused | Temporarily stopped (e.g. renovation, season). |
| Churned | Left Tawlity. |

**Onboarding checklist** (5 steps, ticked on the restaurant's Account tab):
1. Menu uploaded
2. Tables configured
3. Staff trained
4. First live booking
5. Listed in the app

**Health** (Live accounts): Green = fine, Amber = concerns, Red = at risk of churning. Set by the account manager today, with a free-text note explaining why.

**Monthly report:** every Live account should get a performance report at least every **35 days**. The CRM tracks the date it was last sent.

**Renewal:** the renewal date drives renewal reminders (30 days on the dashboard, 45 days in recommendations).

> Note: the account status is set by hand today. Winning a deal does not yet move the restaurant to Onboarding automatically (see section 15).

---

## 7. Dashboard (Restaurants tab)

All counts exclude holding-group records, so each restaurant is counted once. Every tile links to the matching filtered list.

### Accounts
One tile per account status (Prospect, Onboarding, Live, Paused, Churned): the number of restaurants in it.

### Revenue
| KPI | Calculation |
|---|---|
| Pipeline value | Sum of monthly fees of open deals (Lead to Negotiation, not archived). |
| Monthly recurring revenue | Sum of monthly fees of Live restaurants. |
| Won this month | Deals in Signed or Live last updated this calendar month. |
| Lost this month | Deals in Lost last updated this calendar month. |

### Follow-up
| KPI | Calculation | Click |
|---|---|---|
| Tasks to do | Open tasks (not done). Hint: how many are due this week. | Opens a panel with every open task, grouped Overdue / Today / This week / Later, each showing the **latest note** on its contact and a **Done** button. |
| Overdue tasks | Open tasks due before today. | Same panel, overdue only. |
| Renewals in 30 days | Live restaurants whose renewal date is in the next 30 days. | List |
| Red accounts | Live restaurants with Red health. | List |
| Late reports | Live restaurants with no monthly report in the last 35 days (or never). | |
| Onboarding progress | Ticked checklist steps ÷ (onboarding restaurants × 5), as a %. | |
| Win rate | Won deals ÷ (won + lost deals), all time. | |
| Average fee | Average monthly fee of Live restaurants. | |

### Lists
- **Needs attention:** Live restaurants that are Red, or renew within 30 days.
- **Restaurants by governorate:** bar chart.

### Diners tab (admins and support only)
Total diners, new this month, active, inactive, no-show rate (total no-shows ÷ total reservations), open support notes; diners by platform and by acquisition source; top diners by reservations.

---

## 8. Recommended next actions

Each restaurant page opens with a **Recommended next actions** panel. It applies a fixed playbook to the restaurant's own data: its status, deals, contacts, notes and checklist. There is no AI and no guessing; every suggestion comes from one of the rules below.

Each suggestion shows a **priority** (High / Medium / Low), a **goal** (Win the account / Keep the account), a title and the reason it appears. Suggestions are sorted High first.

**Create task** turns a suggestion into a task in one click:
- assigned to the restaurant's **decision maker** (or the first contact if none is marked);
- with the suggested task type and due date;
- with a ready-written text, e.g. "Book a Tawlity demo with Fahad".

If the restaurant has no contact, the button is disabled until one is added. If an open task **of the same type** on one of the restaurant's contacts is already due within the suggestion's window (its due delay + 7 days) or is overdue, the panel shows **Task already planned** instead, to avoid duplicates.

Holding groups get no suggestions; their individual restaurants do.

### Winning the account (status = Prospect)

| When | Suggestion | Priority | Task | Due in |
|---|---|---|---|---|
| No contact recorded | Find the right person to talk to | High | Visit | 3 days |
| Contacts exist, none is decision maker | Identify the decision maker | Medium | Call | 5 days |
| No open deal | Qualify the restaurant and open a deal | Medium | Visit | 7 days |
| Open deal untouched for **14+ days** | Revive the stalled deal | High | Call | 1 day |
| Deal at Lead | Visit the restaurant | Medium | Visit | 3 days |
| Deal at Visited | Book a demo with the owner | High | Demo | 5 days |
| Deal at Demo done | Follow up on the demo, propose a trial | High | WhatsApp | 2 days |
| Deal at Trial | Review the trial results | High | Call | 3 days |
| Deal at Negotiation | Close the deal | High | Call | 2 days |
| Uses SevenRooms or Eat App | Prepare a comparison with their system | Low | Demo | 7 days |
| More than one branch | Pitch all branches | Low | Demo | 10 days |

The deal used is the open, non-archived deal updated most recently.

### Keeping the account

| When | Suggestion | Priority | Task | Due in |
|---|---|---|---|---|
| Onboarding, a checklist step not done | The **first** missing step (upload menu, configure tables, train staff, first live booking, list in app) | High | Onboarding | 3 days |
| Live, health Red | Visit within 7 days | High | Visit | 7 days |
| Live, health Amber | Call to clear the concerns | Medium | Call | 7 days |
| Live, no health set | Assess the account health | Low | Call | 14 days |
| Live, renewal within **45 days** | Prepare the renewal (High if 15 days or less) | Medium / High | Contract renewal | renewal − 7 days, between 1 and 7 |
| Live, no report in **35 days** | Send the monthly report | Medium | Monthly report | 2 days |
| Live, no note in **30 days** | Check in with the account | Medium | Visit | 7 days |
| Live, Starter or Free trial with 2+ branches | Offer the Pro plan | Low | Call | 14 days |
| Paused | Plan the reactivation | Medium | Call | 7 days |
| Churned | Try to win it back | Low | WhatsApp | 30 days |

The thresholds (14, 30, 35, 45 days) are single settings in the code and easy to change.

---

## 9. Tasks and follow-up

- Tasks are created from a contact, from the + button, or from a recommendation.
- The dashboard's **Tasks to do** and **Overdue tasks** tiles open the follow-up panel (section 7), so a manager sees each pending task next to the latest update on that contact, and can tick it done.
- Each contact's page shows its tasks; each restaurant page shows the activity (notes) of all its contacts and deals.

---

## 10. Diners side

- **One diner per phone number.** Phones are stored as typed but compared on digits only, so `+965 5555 1234` and `96555551234` are the same person. The database refuses a second diner with the same number.
- **Support:** a diner note marked *support* has a status Open / Resolved; open ones are counted on the Diners dashboard.
- **Consent:** WhatsApp consent and its date are stored so the team only contacts diners who agreed.
- Diner records are visible only to admins and support (section 12).

---

## 11. Getting data in

Most data comes from **admin-panel CSV exports** uploaded through the Import button.

**Templates:** `docs/csv-templates/` (empty files) and `docs/Tawlity_CSV_Templates.xlsx` (column-by-column guide with examples). Full procedure: `docs/Tawlity_CRM_CSV_Import_SOP.docx`.

| File | Today's behaviour |
|---|---|
| restaurants.csv | Creates new restaurants. Reads basic fields (name, address, phone, website, description). **Does not yet read Tawlity fields** and **does not update existing restaurants**: re-uploading creates duplicates. |
| restaurant_contacts.csv | Creates contacts linked to a restaurant by **name**. Does not yet read role, language, decision maker. |
| deals.csv | Creates deals with stage, plan, fee, branches, lost reason. |
| diners.csv | **Creates or updates** by phone number: safe to re-upload. |
| restaurant_usage_monthly.csv | Template only; import not built yet. |

Formats: dates `YYYY-MM-DD` (displayed DD/MM/YYYY), KWD with a dot and up to 3 decimals (`45.000`), phones `+965` + 8 digits, yes/no as `true`/`false`, files saved as CSV UTF-8.

**Upload order today:** restaurants, then contacts, then deals; diners any time. Contacts and deals find their restaurant by name; if it is missing, a blank restaurant with that name is created, and a later restaurant upload would duplicate it.

---

## 12. Security and access

Enforced in the **database** (row-level security), not just hidden in the screens:

- Only **signed-in, active team members** can read or write any data. Visitors, and disabled users, see nothing.
- **Diners** and diner notes/tags are readable and writable only by **admins** and **support** users. A sales user's request for diner data returns nothing, and their inserts are refused.
- The screens mirror this: the Diners menu and dashboard tab are hidden from sales users.

This was tested on a local database: admin and support can read diners; a sales user, an outsider and an anonymous visitor cannot.

---

## 13. Kuwait conventions and languages

- **Currency:** KWD with 3 decimals (e.g. 45.125 KWD).
- **Phones:** +965 and 8 digits, validated on entry.
- **Dates:** DD/MM/YYYY.
- **Languages:** English and Arabic (full right-to-left layout), plus French inherited from the base product. Switch from the language button in the header.
- **Governorates:** Capital, Hawalli, Farwaniya, Ahmadi, Jahra, Mubarak Al-Kabeer.

---

## 14. Technology

- Built on **Atomic CRM** (open source, MIT licence): React + TypeScript web app.
- **Backend: Supabase**: PostgreSQL database, login, file storage, server functions. Hosted by Supabase or self-hosted.
- Works on desktop and phone (dedicated mobile layout with a bottom menu); can be installed as a phone app (PWA).
- Database structure is versioned in the repository (`supabase/schemas/`, `supabase/migrations/`), with sample data (15 restaurants including 2 holding groups, 25 contacts, 20 deals, 50 diners) in `supabase/seeds/`.
- Automated tests cover the main business rules (recommendations, follow-up KPIs, CSV imports, dates and KWD amounts).

---

## 15. Current status and gaps

**Done**
- Both sides, all screens above, English/Arabic, mobile layout.
- Pipeline, account lifecycle, KPI dashboard, follow-up panel, recommendations.
- Database with access rules, tested locally.
- Demo version with realistic sample data (resets on reload).
- CSV templates and upload SOP.

**Not done yet**
1. **Go live:** create the hosted Supabase project, deploy the app, invite the team with roles. Until then it is a demo.
2. **Safe re-uploads:** match restaurants and contacts on the admin-panel ID, update instead of duplicating, read all Tawlity columns.
3. **Usage data:** import monthly bookings, covers and no-shows per restaurant (template ready), then compute health automatically and add usage-based recommendations ("bookings down 40%: visit").
4. **Analytics link:** connect the existing monthly restaurant analytics code, ideally so it writes usage straight into the CRM. Needs access to that code.
5. **Automation:** move a restaurant to Onboarding when its deal is signed, and to Live when the checklist is complete.

**Later ideas**
- WhatsApp buttons on phone numbers with ready-made messages.
- Daily email digest per salesperson (overdue tasks, Red accounts, renewals).
- Recommendation thresholds editable in Settings.
- Phone check-in after a visit (note, stage and next task on one screen).
- Revenue history chart (MRR over time).
- Link diners to the restaurants they book.

---

## 16. Decisions for the partners

1. **Thresholds:** are 14 days (stalled deal), 30 days (silence), 35 days (report) and 45 days (renewal notice) right for how the team works?
2. **Health:** keep it manual, or compute it from usage once usage data is imported? If computed, what drop in bookings means Amber and Red?
3. **Roles:** who on the team is Admin, Support, Sales?
4. **Hosting:** Supabase cloud (simplest) or self-hosted?
5. **Data source:** CSV uploads by hand, or a direct feed from the admin panel / analytics code?
