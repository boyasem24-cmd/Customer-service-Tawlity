# Tawlity CRM — Build Prompts for Atomic CRM Builder

**How to use:** Run the builder (`make up` → http://localhost:8080), start in **demo mode**, and paste ONE phase per new session. Check the result in the CRM preview before moving to the next phase. Only promote to the real database (Phase 6) once you're happy with how it all works.

Why phases: the builder's agent team works best on scoped requests. One giant prompt costs more (it bills as API calls) and is harder to review.

---

## Phase 0 — Context (paste at the start of EVERY session)

```
CONTEXT — read before doing anything:
This CRM is for Tawlity (tawlity.co), a restaurant reservation and waitlist
platform in Kuwait. It is a two-sided business:
  1. RESTAURANTS — B2B customers we sell to, onboard and retain (independents
     and holding companies that own several brands/branches).
  2. DINERS — B2C users of the Tawlity mobile app (iOS + Android) who book
     tables and join waitlists.
The CRM must keep these two sides clearly separated: separate sidebar
sections, separate dashboards, separate entities. Never mix diner records
into the restaurant contacts list.
Market conventions: country Kuwait, currency KWD shown with 3 decimals
(e.g. 25.000 KWD), phone numbers in +965 format, dates as DD/MM/YYYY.
The CRM is for relationship management and sales pipeline only — the
operational admin panel (approving restaurants, managing tables) already
exists elsewhere, so do not rebuild those features.
Keep existing Atomic CRM features working unless I explicitly ask to remove them.
```

---

## Phase 1 — Restaurant side: data model

```
Restructure the existing Companies and Contacts into the RESTAURANTS side.

1. Rename "Companies" to "Restaurants" everywhere in the UI (sidebar, titles,
   buttons, empty states). Add a "Holding Group" concept: a restaurant can
   optionally belong to a parent group (another record flagged as
   "Holding company"). On a holding company's page, show the list of its
   brands/branches.

2. Add these fields to Restaurants:
   - Cuisine (multi-select: Arabic, Kuwaiti, Lebanese, Italian, Japanese,
     Indian, American, Cafe, Bakery/Desserts, Seafood, Steakhouse, Other)
   - Governorate (single select: Capital, Hawalli, Farwaniya, Ahmadi, Jahra,
     Mubarak Al-Kabeer) and Area (free text)
   - Number of branches (integer), Seating capacity (integer)
   - Price range (KD, KDD, KDDD)
   - Current booking system (None/Phone only, SevenRooms, Eat App,
     Instagram/WhatsApp DMs, Other)
   - Kuwait Gastronomy Association member (yes/no)
   - Instagram handle, Google Maps link
   - Lead source (Door-to-door visit, Referral, Instagram/Meta ad,
     Gastronomy Association, Event/Expo, Inbound website, Other)
   - Account status (Prospect, Onboarding, Live, Paused, Churned)
   Show Governorate, Cuisine, Account status and Lead source as filters on
   the Restaurants list, and show Account status as a coloured badge.

3. Rename "Contacts" to "Restaurant Contacts". Add a "Role" field
   (Owner, Partner, General Manager, F&B/Operations Manager, Marketing,
   Host/Front of house, Other) and a "Preferred language" field
   (Arabic, English). Add a "Primary decision maker" checkbox.
```

## Phase 2 — Restaurant side: pipeline & account management

```
Turn Deals into the restaurant onboarding pipeline.

1. Rename "Deals" to "Pipeline". Set the stages (Kanban columns) to:
   Lead → Visited → Demo done → Trial → Negotiation → Signed → Live → Lost
   Each pipeline card links to a Restaurant.
2. Deal fields: Plan (Free trial, Starter, Pro, Group/Enterprise),
   Monthly fee in KWD (3 decimals), Expected close date, Number of branches
   covered, Lost reason (Price, Already uses another system, Not ready,
   No response, Other — required only when stage = Lost).
3. Task types: Visit, Call, WhatsApp follow-up, Demo, Onboarding/Training,
   Send monthly report, Contract renewal.
4. On each Restaurant page add an "Account" panel showing: contract start
   date, renewal date, current plan, monthly fee, onboarding checklist
   (Menu/photos uploaded, Tables configured, Staff trained,
   First live booking, Listed in app) as checkboxes, and
   "Last monthly report sent" date.
5. Add a simple Health score (Green / Amber / Red) on Live restaurants that
   I can set manually, with a note explaining why.
```

## Phase 3 — Diner side

```
Create the DINERS side as a completely separate section in the sidebar,
under its own heading "Diners", below the restaurant items.

1. New entity "Diners" with fields: first name, last name, phone (+965,
   unique), email, preferred language (Arabic/English), gender (optional),
   signup date, signup platform (iOS, Android, Web), acquisition source
   (Organic, Instagram/Meta ad, Referral, Restaurant QR code, Other),
   total reservations, total no-shows, total cancellations, last booking
   date, favourite restaurants (links to Restaurants), WhatsApp marketing
   consent (yes/no + consent date), account status (Active, Inactive,
   Blocked). Use tags for segments (e.g. VIP, Frequent no-show, New).
2. Diners list: search by name/phone, filters for status, language,
   platform, acquisition source, tag, and "inactive for 30+ days".
   Show a computed "No-show rate" column (no-shows ÷ reservations, as %),
   highlighted in red above 20%.
3. Diner detail page: profile, stats and notes timeline.
4. Allow CSV import of diners (reuse the existing contact import pattern),
   matching on phone number to update existing records instead of
   creating duplicates.
5. Diner records must never appear in Restaurant Contacts, and restaurant
   contacts must never appear in Diners.
```

## Phase 4 — Dashboards

```
Replace the single dashboard with two tabs: "Restaurants" and "Diners".

Restaurants tab: count of restaurants by Account status, pipeline value
(sum of monthly fees in open stages, KWD), MRR from Live restaurants,
deals won/lost this month, restaurants by governorate (bar chart),
upcoming tasks, and a list of Live restaurants with Red health or renewal
in the next 30 days.

Diners tab: total diners, new diners this month, active vs inactive,
split by platform and by acquisition source, overall no-show rate,
open support interactions, and the top 10 diners by reservations.
```

## Phase 5 — Branding & language

```
Apply Tawlity branding: background cream (#F7F3EA), primary forest green
(#1F4D3A), accent/highlight yellow (#F5C842), headings and the "Tawlity"
wordmark in Georgia serif. Set the CRM title to "Tawlity CRM".
Then add Arabic as a second interface language with a language switcher,
including right-to-left layout when Arabic is selected. Keep English
as default.
```
*(Adjust the hex codes to your exact brand values. Arabic/RTL is the heaviest change here — if budget is tight, skip it for now; you can still store Arabic names, since the fields accept Arabic text either way.)*

## Phase 6 — Go live with real data

```
I've validated everything in demo mode. Generate and apply the database
migrations for all the changes, then switch to the real database.
Add row-level security so only signed-in team members can read data,
and make Diners data visible only to users with an "admin" or "support"
role, while Restaurants data is visible to all team members.
Seed realistic sample data: 15 restaurants (2 holding groups),
25 restaurant contacts, 20 pipeline deals across all stages, 50 diners.
```

---

## Later (once the core is in use)

- **Sync diners from the app instead of CSV:** a scheduled job that pulls diner stats (reservations, no-shows, last booking) from Tawlity's production database on AWS into the CRM. Read-only, so the app stays the source of truth.
- **Link Tawlity Support tickets** to the Diner and Restaurant records.
- **WhatsApp actions:** "Message on WhatsApp" button on contacts and diners (wa.me link first; Cloud API later).
- **Investors pipeline** (a third section) to track Faith Capital and other leads from NEXUS Kuwait.
