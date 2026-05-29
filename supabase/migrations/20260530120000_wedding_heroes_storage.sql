-- Public bucket for invitation hero photos (uploaded via admin, served on guest invites).
insert into storage.buckets (id, name, public)
values ('wedding-heroes', 'wedding-heroes', true)
on conflict (id) do update set public = true;

-- Anyone can read hero images (guest invite pages load these URLs).
drop policy if exists "Public read wedding hero images" on storage.objects;
create policy "Public read wedding hero images"
  on storage.objects for select
  using (bucket_id = 'wedding-heroes');
