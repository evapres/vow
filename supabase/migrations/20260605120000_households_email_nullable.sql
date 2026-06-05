-- Guests can be added without an email (invite link shared via Messenger / Instagram).
alter table public.households
  alter column email drop not null;

comment on column public.households.email is 'Optional. Required only for sending invitation emails from the dashboard.';
