-- Dashboard reads RSVPs with the host JWT; writes use service role. Without SELECT policy, RLS returns no rows.

alter table public.rsvps enable row level security;

drop policy if exists "wedding_owners_select_rsvps" on public.rsvps;

create policy "wedding_owners_select_rsvps"
  on public.rsvps
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.weddings w
      where w.id = rsvps.wedding_id
        and w.user_id = auth.uid()
    )
  );
