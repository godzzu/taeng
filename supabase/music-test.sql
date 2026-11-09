-- Run after music.sql; test records are rolled back.
begin;
do $$
declare k text := 'test-' || gen_random_uuid()::text;
begin
  insert into public.music_tracks(key, name, path) values (k, '테스트 곡', 'catalog/test.mp3');
  assert public.get_wedding_track(k)->>'path' = 'catalog/test.mp3';
  update public.music_tracks set enabled = false where key = k;
  assert public.get_wedding_track(k) = 'null'::jsonb;
  assert public.get_wedding_track('unknown-' || k) = 'null'::jsonb;
  assert not has_table_privilege('anon', 'public.music_tracks', 'insert');
  assert not has_table_privilege('authenticated', 'public.music_tracks', 'update');
  assert not has_table_privilege('anon', 'public.music_tracks', 'select');
  assert to_regprocedure('public.set_guestbook_music(text,text,text,text)') is null;
  assert to_regprocedure('public.music_admin_authorized(text,text)') is null;
end;
$$;
rollback;
