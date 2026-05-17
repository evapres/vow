alter table public.weddings
  add column if not exists invitation_music_url text null;

comment on column public.weddings.invitation_music_url is
  'Optional invitation page music: public URL (/file.mp3) or data:audio/... base64 from admin upload.';
