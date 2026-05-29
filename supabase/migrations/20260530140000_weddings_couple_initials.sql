alter table public.weddings
  add column if not exists couple_initial_left text,
  add column if not exists couple_initial_right text;

comment on column public.weddings.couple_initial_left is 'Optional monogram letter for partner one (invitation header).';
comment on column public.weddings.couple_initial_right is 'Optional monogram letter for partner two (invitation header).';
