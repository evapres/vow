-- Add invited guest count per household and persist RSVP attending count.

alter table public.households
  add column if not exists invited_count integer null;

comment on column public.households.invited_count is 'How many people are invited in this household/party.';

alter table public.rsvps
  add column if not exists attending_count integer null;

comment on column public.rsvps.attending_count is 'How many people in the household are attending (when attending=true).';

