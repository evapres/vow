-- Split invitation location into venue (top-right label), optional church, and street/address.

alter table public.weddings
  add column if not exists venue_name text,
  add column if not exists church_name text,
  add column if not exists street_address text;

comment on column public.weddings.venue_name is 'Shown top-right on invitation (small caps meta line).';
comment on column public.weddings.church_name is 'Optional; shown in celebrate block with street.';
comment on column public.weddings.street_address is 'Address line(s) for celebrate block and map.';

-- Backfill from legacy single `location` (first segment → venue, remainder → street).
update public.weddings w
set
  venue_name = nullif(trim(split_part(w.location, ',', 1)), ''),
  street_address = nullif(
    trim(
      case
        when position(',' in w.location) > 0 then substring(w.location from position(',' in w.location) + 1)
        else ''
      end
    ),
    ''
  )
where w.location is not null
  and trim(w.location) <> ''
  and w.venue_name is null
  and w.street_address is null;
