-- Optional line under date/venue on the invitation (e.g. "Reception to follow").
-- Run in Supabase SQL editor or via `supabase db push` if you use the CLI.
alter table public.weddings
  add column if not exists note text;

comment on column public.weddings.note is 'Small-caps line under celebrate block; null or empty hides it.';
