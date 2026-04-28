-- Store invitation language choice (English vs Greek).
alter table public.weddings
  add column if not exists language text not null default 'en';

comment on column public.weddings.language is 'Invitation language. Currently: en | el.';

