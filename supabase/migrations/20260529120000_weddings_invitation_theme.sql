alter table public.weddings
  add column if not exists invitation_theme text not null default 'classic';

comment on column public.weddings.invitation_theme is
  'Invitation visual theme: classic (cream page) or silk (taupe/mauve).';

alter table public.weddings
  drop constraint if exists weddings_invitation_theme_check;

alter table public.weddings
  add constraint weddings_invitation_theme_check
  check (invitation_theme in ('classic', 'silk'));
