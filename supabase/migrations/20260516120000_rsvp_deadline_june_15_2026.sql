-- RSVP deadline: May 31, 2026 → June 15, 2026 (invitation email copy).
update public.weddings
set rsvp_deadline = '2026-06-15'
where rsvp_deadline is not null
  and left(trim(rsvp_deadline::text), 10) = '2026-05-31';
