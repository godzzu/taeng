-- Catalog-based music. Run as project owner; existing audio files and legacy data are preserved.
begin;
create table if not exists public.music_tracks (
  key text primary key check (key ~ '^[a-zA-Z0-9_-]{1,80}$'),
  name text not null check (char_length(name) between 1 and 120),
  path text not null check (path ~* '\.(mp3|m4a|ogg)$'),
  enabled boolean not null default true
);
alter table public.music_tracks enable row level security;
revoke all on public.music_tracks from public, anon, authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-music', 'wedding-music', true, 10485760, array['audio/mpeg','audio/mp4','audio/ogg'])
on conflict(id) do nothing;

drop policy if exists wedding_music_no_client_insert on storage.objects;
create policy wedding_music_no_client_insert on storage.objects as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'wedding-music');
drop policy if exists wedding_music_no_client_update on storage.objects;
create policy wedding_music_no_client_update on storage.objects as restrictive for update to anon, authenticated
  using (bucket_id <> 'wedding-music') with check (bucket_id <> 'wedding-music');
drop policy if exists wedding_music_no_client_delete on storage.objects;
create policy wedding_music_no_client_delete on storage.objects as restrictive for delete to anon, authenticated
  using (bucket_id <> 'wedding-music');

create or replace function public.get_wedding_track(p_key text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce((select jsonb_build_object('path', path, 'name', name)
    from public.music_tracks where key = p_key and enabled), 'null'::jsonb);
$$;
revoke all on function public.get_wedding_track(text) from public, anon, authenticated;
grant execute on function public.get_wedding_track(text) to anon, authenticated;

-- Disable the old deployed uploader as well as its mutation interface.
-- No tables, music records or Storage files are deleted.
drop function if exists public.set_guestbook_music(text, text, text, text);
drop function if exists public.music_admin_authorized(text, text);
drop function if exists public.get_guestbook_music(text);
commit;
