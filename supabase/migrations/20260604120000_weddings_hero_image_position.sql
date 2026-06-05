alter table public.weddings
  add column if not exists hero_image_position text not null default 'center';

comment on column public.weddings.hero_image_position is
  'Vertical focal point for couple hero photo in polaroid (center | top | bottom).';

alter table public.weddings
  drop constraint if exists weddings_hero_image_position_check;

alter table public.weddings
  add constraint weddings_hero_image_position_check
  check (hero_image_position in ('center', 'top', 'bottom'));
