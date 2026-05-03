-- Track when an invitation email was last sent from the dashboard.
alter table public.households
  add column if not exists email_sent_at timestamptz null;

comment on column public.households.email_sent_at is 'Set when an invitation email is sent via the app (Resend).';
