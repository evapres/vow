-- If an older migration created reception_note, rename it to note (skip when note already exists).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'weddings'
      and column_name = 'reception_note'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'weddings'
      and column_name = 'note'
  ) then
    alter table public.weddings rename column reception_note to note;
  end if;
end $$;
