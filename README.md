# Tawlity CRM

Relationship-management and sales CRM for **Tawlity** ([tawlity.co](https://tawlity.co)), the restaurant reservation and waitlist platform in Kuwait. It is built on [Atomic CRM](https://github.com/marmelab/atomic-crm) (React, shadcn-admin-kit, Supabase).

The CRM keeps Tawlity's two sides of the business apart:

| Side | What it holds | Who can see it |
| --- | --- | --- |
| **Restaurants** (B2B) | Restaurants and holding groups, restaurant contacts, the onboarding pipeline, account management | Every team member |
| **Diners** (B2C) | Users of the Tawlity app, their booking stats, segments, notes and support interactions | Admins and the support team only |

The operational admin panel (approving restaurants, managing tables) lives elsewhere and is not part of this CRM.

## What's in it

**Restaurants**
- Restaurants with cuisine, governorate/area, branches, seating, price range (KD/KDD/KDDD), current booking system, Kuwait Gastronomy Association membership, Instagram, Google Maps link, lead source and a coloured account-status badge (Prospect, Onboarding, Live, Paused, Churned). Filters on governorate, cuisine, status and lead source.
- Holding groups: a restaurant can belong to a holding company, whose page lists its brands and branches.
- Restaurant contacts with role, preferred language (Arabic/English) and a primary-decision-maker flag.
- **Pipeline**: Lead → Visited → Demo done → Trial → Negotiation → Signed → Live → Lost, with plan, monthly fee in KWD (3 decimals), branches covered and a lost reason that is required on Lost (also when a card is dragged to the Lost column).
- **Account** tab on each restaurant: contract start and renewal dates, plan, monthly fee, onboarding checklist, last monthly report sent, and a manual Green/Amber/Red health score with a note (Live restaurants).
- Task types: Visit, Call, WhatsApp follow-up, Demo, Onboarding/Training, Send monthly report, Contract renewal.

**Diners**
- Diner profiles: phone (+965, unique), email, language, gender, signup date and platform, acquisition source, reservations / no-shows / cancellations, last booking, favourite restaurants, WhatsApp marketing consent, account status and segments (VIP, Frequent no-show, New...).
- List with search by name or phone, filters (status, segment, platform, acquisition source, language, inactive 30+ days, WhatsApp opt-in) and a no-show rate column, in red above 20%.
- Diner page with stats, favourite restaurants and a notes & support timeline (support items can be marked resolved).
- CSV import that matches on the phone number, so re-importing updates diners instead of duplicating them. A sample CSV is offered in the import dialog.

**Dashboards**: a Restaurants tab (accounts per status, pipeline value, MRR from Live restaurants, deals won/lost this month, restaurants by governorate, upcoming tasks, Live restaurants with Red health or a renewal in the next 30 days) and a Diners tab (totals, new this month, active/inactive, split by platform and acquisition source, overall no-show rate, open support interactions, top 10 diners).

**Kuwait conventions**: KWD with 3 decimals (`25.000 KWD`), phone numbers validated and stored as `+965 XXXX XXXX`, dates shown as DD/MM/YYYY.

**Branding & language**: cream / forest green / yellow Tawlity theme with Georgia headings, and an Arabic interface with right-to-left layout (language menu in the header; English is the default).

## Try it in demo mode

Demo mode runs entirely in the browser with generated Kuwaiti sample data; nothing is saved and nothing connects to a database.

```sh
npm install
npm run dev:demo      # http://localhost:5174 (log in with janedoe@atomic.dev / demo)
```

## Run it on a real database

Requirements: Node 24, Docker (for local Supabase), Make.

### Locally

```sh
make install          # npm dependencies
make start            # local Supabase + Vite on http://localhost:5173
```

The first `supabase start` (and every `make supabase-reset-database`, which wipes the local database) applies every migration in `supabase/migrations/` and loads `supabase/seed.sql` plus the fictional Tawlity sample data in `supabase/seeds/tawlity_sample_data.sql` (15 restaurants incl. 2 holding groups, 25 restaurant contacts, 20 deals across all stages, 50 diners). Remove the sample file from `[db.seed]` in `supabase/config.toml` once you load real data.

The first account you create in the app becomes the administrator.

### On Supabase cloud (production)

```sh
make supabase-remote-init   # creates/links the project, pushes the migrations, deploys the edge functions, writes .env.production.local
make build                  # then deploy dist/ to your static host
```

If the project already exists, the equivalent manual steps are:

```sh
npx supabase link --project-ref <project-ref>
npx supabase db push                       # applies supabase/migrations, incl. 20261012120000_tawlity_crm.sql
npx supabase functions deploy users        # the users function now saves the "support" flag
```

To load the sample data into the cloud database, run `supabase/seeds/tawlity_sample_data.sql` once in the Supabase SQL editor (it expects empty tables). Skip it if you're going straight to real data.

The front end needs `VITE_SUPABASE_URL` and `VITE_SB_PUBLISHABLE_KEY` (see `.env.development`).

### Access rules (row-level security)

- Only **signed-in team members** (a row in `sales` that is not disabled) can read or write CRM data. Anonymous visitors and signed-in users who aren't team members see nothing.
- **Diners**, diner notes and diner segments are restricted to **admins** and users with the **Support team** flag (Users page → edit a user). Other team members don't see the Diners section at all, and the database refuses their queries.
- After creating the first (admin) account, **turn off "Allow new users to sign up"** in Supabase → Authentication → Sign In / Providers, and add teammates from the Users page. Otherwise anyone could sign up and become a team member.

## Development

```sh
npm run typecheck
make lint
make test             # unit tests (Vitest, browser mode)
```

- Tawlity-specific code: `src/components/atomic-crm/tawlity/` (choices, Kuwait formatting/validation), `diners/`, `dashboard/tawlity/`, `companies/AccountPanel.tsx`, `companies/BrandsTab.tsx`.
- Translations: `providers/commons/englishCrmMessages.ts` and `arabicCrmMessages.ts` (typed against the English file, so a missing Arabic key fails the type check).
- Database: declarative schema in `supabase/schemas/` and the matching migration `supabase/migrations/20261012120000_tawlity_crm.sql`.
- Demo data generator: `src/components/atomic-crm/providers/fakerest/dataGenerator/`.
- The original build prompts are in `docs/Tawlity_CRM_Prompts.md`.

Atomic CRM's own documentation still applies to everything not listed above: see [`doc/`](./doc/) or <https://marmelab.com/atomic-crm/doc/>.

## License

MIT, based on Atomic CRM by [Marmelab](https://marmelab.com). See [LICENSE.md](./LICENSE.md).
