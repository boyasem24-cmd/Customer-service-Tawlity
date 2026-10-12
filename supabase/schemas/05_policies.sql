--
-- Row Level Security
-- This file declares RLS policies for all tables.
--

-- Enable RLS on all tables
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_notes enable row level security;
alter table public.deals enable row level security;
alter table public.deal_notes enable row level security;
alter table public.sales enable row level security;
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.configuration enable row level security;
alter table public.favicons_excluded_domains enable row level security;
alter table public.diners enable row level security;
alter table public.diner_tags enable row level security;
alter table public.diner_notes enable row level security;

-- Restaurant side: every signed-in, enabled team member (see is_team_member)

-- Companies
create policy "Team members can read companies" on public.companies for select to authenticated using (public.is_team_member());
create policy "Team members can insert companies" on public.companies for insert to authenticated with check (public.is_team_member());
create policy "Team members can update companies" on public.companies for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "Team members can delete companies" on public.companies for delete to authenticated using (public.is_team_member());

-- Contacts
create policy "Team members can read contacts" on public.contacts for select to authenticated using (public.is_team_member());
create policy "Team members can insert contacts" on public.contacts for insert to authenticated with check (public.is_team_member());
create policy "Team members can update contacts" on public.contacts for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "Team members can delete contacts" on public.contacts for delete to authenticated using (public.is_team_member());

-- Contact Notes
create policy "Team members can read contact notes" on public.contact_notes for select to authenticated using (public.is_team_member());
create policy "Team members can insert contact notes" on public.contact_notes for insert to authenticated with check (public.is_team_member());
create policy "Team members can update contact notes" on public.contact_notes for update to authenticated using (public.is_team_member());
create policy "Team members can delete contact notes" on public.contact_notes for delete to authenticated using (public.is_team_member());

-- Deals
create policy "Team members can read deals" on public.deals for select to authenticated using (public.is_team_member());
create policy "Team members can insert deals" on public.deals for insert to authenticated with check (public.is_team_member());
create policy "Team members can update deals" on public.deals for update to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "Team members can delete deals" on public.deals for delete to authenticated using (public.is_team_member());

-- Deal Notes
create policy "Team members can read deal notes" on public.deal_notes for select to authenticated using (public.is_team_member());
create policy "Team members can insert deal notes" on public.deal_notes for insert to authenticated with check (public.is_team_member());
create policy "Team members can update deal notes" on public.deal_notes for update to authenticated using (public.is_team_member());
create policy "Team members can delete deal notes" on public.deal_notes for delete to authenticated using (public.is_team_member());

-- Sales: users read their own row (to know whether they are a team member), team members read all
create policy "Team members can read sales" on public.sales for select to authenticated
    using (user_id = auth.uid() or public.is_team_member());

-- Tags
create policy "Team members can read tags" on public.tags for select to authenticated using (public.is_team_member());
create policy "Team members can insert tags" on public.tags for insert to authenticated with check (public.is_team_member());
create policy "Team members can update tags" on public.tags for update to authenticated using (public.is_team_member());
create policy "Team members can delete tags" on public.tags for delete to authenticated using (public.is_team_member());

-- Tasks
create policy "Team members can read tasks" on public.tasks for select to authenticated using (public.is_team_member());
create policy "Team members can insert tasks" on public.tasks for insert to authenticated with check (public.is_team_member());
create policy "Team members can update tasks" on public.tasks for update to authenticated using (public.is_team_member());
create policy "Team members can delete tasks" on public.tasks for delete to authenticated using (public.is_team_member());

-- Configuration (admin-only for writes)
create policy "Team members can read configuration" on public.configuration for select to authenticated using (public.is_team_member());
create policy "Enable insert for admins" on public.configuration for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.configuration for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Favicons excluded domains
create policy "Enable access for authenticated users only" on public.favicons_excluded_domains to authenticated using (true) with check (true);

-- Diner side (B2C app users): admins and the support team only (see can_access_diners)
create policy "Admins and support can read diners" on public.diners for select to authenticated using (public.can_access_diners());
create policy "Admins and support can insert diners" on public.diners for insert to authenticated with check (public.can_access_diners());
create policy "Admins and support can update diners" on public.diners for update to authenticated using (public.can_access_diners()) with check (public.can_access_diners());
create policy "Admins and support can delete diners" on public.diners for delete to authenticated using (public.can_access_diners());
create policy "Admins and support can read diner tags" on public.diner_tags for select to authenticated using (public.can_access_diners());
create policy "Admins and support can insert diner tags" on public.diner_tags for insert to authenticated with check (public.can_access_diners());
create policy "Admins and support can update diner tags" on public.diner_tags for update to authenticated using (public.can_access_diners());
create policy "Admins and support can delete diner tags" on public.diner_tags for delete to authenticated using (public.can_access_diners());
create policy "Admins and support can read diner notes" on public.diner_notes for select to authenticated using (public.can_access_diners());
create policy "Admins and support can insert diner notes" on public.diner_notes for insert to authenticated with check (public.can_access_diners());
create policy "Admins and support can update diner notes" on public.diner_notes for update to authenticated using (public.can_access_diners());
create policy "Admins and support can delete diner notes" on public.diner_notes for delete to authenticated using (public.can_access_diners());
