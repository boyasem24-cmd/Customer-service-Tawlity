# MEMORY

Durable Atomic CRM knowledge. One sentence per bullet, freshest first. Maintained by the `documentator` agent — see [.claude/agents/documentator.md](.claude/agents/documentator.md).

## Business Knowledge

- This fork is Tawlity CRM (Kuwait restaurant reservations): `companies` are Restaurants, `contacts` are Restaurant Contacts, `deals` are the onboarding Pipeline, and `diners` are the B2C app users; the two sides must never be mixed.
- Diner data (`diners`, `diner_notes`, `diner_tags`) is restricted to admins and `sales.support = true` users, both in RLS (`can_access_diners()`) and in `canAccess` (`DINER_RESOURCES`).
- Restaurant-side RLS requires an enabled team member (`is_team_member()`), not just any authenticated user.
- Tawlity choice lists live in `tawlity/choices.ts` with translation keys `tawlity.choices.<group>.<id>`; default deal stages, task types and note statuses are translated via `tawlity.config.*` in `useConfigurationContext` (settings pages use `useRawConfigurationContext`).
- Kuwait conventions are centralised in `tawlity/kuwait.ts`: `formatKWD`/`formatMoney` (3 decimals), `normalizeKuwaitPhone` (+965 XXXX XXXX), `formatDateDMY`.
- `deals.amount` is the monthly fee in KWD (`numeric(12,3)`); `diners.phone_digits` is a generated column used for phone search and uniqueness.
- Arabic (`ar`) is a full catalog typed against English; `useDocumentDirection` sets `<html dir>` and Radix `DirectionProvider`, and Tailwind classes use logical `ms-/me-/ps-/pe-/start-/end-`.

- Core resources: contacts, companies, deals (Kanban pipeline), tasks, notes, tags, and sales (team members).
- Domain options (genders, sectors, deal stages/categories, note statuses, task types) are `<CRM>` props in `src/App.tsx`, not hardcoded.
- Sales users sync with Supabase `auth.users` via triggers; deletion is unsupported — accounts are disabled instead.
- Aggregated reads use database views (`contacts_summary`, `companies_summary`), which FakeRest emulates in the frontend.
- Two interchangeable data providers: Supabase (production) and FakeRest (in-browser demo, resets on reload).
- Filters use `ra-data-postgrest` syntax (`field_name@operator`); operators must be supported by the FakeRest `supabaseAdapter`.
