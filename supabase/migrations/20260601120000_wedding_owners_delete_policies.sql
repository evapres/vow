-- Let authenticated wedding owners delete their own invitations, guests, and RSVPs
-- (so local dev works without SUPABASE_SERVICE_ROLE_KEY for delete).

drop policy if exists "wedding_owners_delete_rsvps" on public.rsvps;
create policy "wedding_owners_delete_rsvps"
  on public.rsvps
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.weddings w
      where w.id = rsvps.wedding_id
        and w.user_id = auth.uid()
    )
  );

drop policy if exists "wedding_owners_delete_households" on public.households;
create policy "wedding_owners_delete_households"
  on public.households
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.weddings w
      where w.id = households.wedding_id
        and w.user_id = auth.uid()
    )
  );

drop policy if exists "wedding_owners_delete_weddings" on public.weddings;
create policy "wedding_owners_delete_weddings"
  on public.weddings
  for delete
  to authenticated
  using (user_id = auth.uid());
