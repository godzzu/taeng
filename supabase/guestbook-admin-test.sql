-- Run AFTER guestbook-admin.sql as project owner. All test data rolls back.
begin;
do $$
declare
  a text := 'admin-test-' || gen_random_uuid()::text;
  b text := 'admin-test-' || gen_random_uuid()::text;
  t text;
  r jsonb;
  entry_id bigint;
  other_id bigint;
  i integer;
begin
  insert into public.guestbook_boards(id) values(a),(b);
  perform public.set_guestbook_admin_password(a, 'test-password-1234');
  perform public.set_guestbook_admin_password(b, 'other-password-1234');
  if has_function_privilege('anon', 'public.set_guestbook_admin_password(text,text)', 'execute') then raise exception 'Provisioning exposed'; end if;
  if has_table_privilege('anon', 'public.guestbook_admin_credentials', 'select') then raise exception 'Hashes exposed'; end if;
  if has_table_privilege('authenticated', 'public.guestbook_admin_sessions', 'select') then raise exception 'Sessions exposed'; end if;
  r := public.guestbook_admin('login', a, 'incorrect');
  assert r->>'error' = 'invalid_credentials';
  r := public.guestbook_admin('login', a, 'test-password-1234'); t := r->>'token';
  assert length(t) = 64;
  assert public.guestbook_admin('list', b, p_token => t)->>'error' = 'unauthorized';
  insert into public.guestbook_entries(wedding_id, request_id, client_id, author_name, message, fingerprint)
    values(a, gen_random_uuid(), gen_random_uuid(), '테스트', '<script>alert(1)</script>', 'test') returning id into entry_id;
  insert into public.guestbook_entries(wedding_id, request_id, client_id, author_name, message, fingerprint)
    values(b, gen_random_uuid(), gen_random_uuid(), '다른 방명록', '비공개', 'test') returning id into other_id;
  r := public.guestbook_admin('list', a, p_token => t);
  assert jsonb_array_length(r->'entries') = 1;
  assert (r->'entries'->0->>'approved')::boolean = false;
  assert public.guestbook_admin('set_approval', a, p_token => t, p_entry_id => other_id, p_approved => true)->>'error' = 'not_found';
  assert public.guestbook_admin('delete', a, p_token => t, p_entry_id => other_id)->>'error' = 'not_found';
  perform public.guestbook_admin('set_approval', a, p_token => t, p_entry_id => entry_id, p_approved => true);
  assert (select approved from public.guestbook_entries where id = entry_id);
  perform public.guestbook_admin('set_approval', a, p_token => t, p_entry_id => entry_id, p_approved => false);
  assert not (select approved from public.guestbook_entries where id = entry_id);
  perform public.guestbook_admin('delete', a, p_token => t, p_entry_id => entry_id);
  assert not exists(select 1 from public.guestbook_entries where id = entry_id);
  perform public.guestbook_admin('logout', a, p_token => t);
  assert public.guestbook_admin('list', a, p_token => t)->>'error' = 'unauthorized';
  for i in 1..5 loop perform public.guestbook_admin('login', a, 'wrong'); end loop;
  assert public.guestbook_admin('login', a, 'test-password-1234')->>'error' = 'invalid_credentials';
  perform public.set_guestbook_admin_password(a, 'reset-password-1234');
  t := public.guestbook_admin('login', a, 'reset-password-1234')->>'token';
  perform public.set_guestbook_admin_password(a, 'new-password-12345');
  assert public.guestbook_admin('list', a, p_token => t)->>'error' = 'unauthorized';
  t := public.guestbook_admin('login', a, 'new-password-12345')->>'token';
  update public.guestbook_admin_sessions set expires_at = now() - interval '1 second' where wedding_id = a;
  assert public.guestbook_admin('list', a, p_token => t)->>'error' = 'unauthorized';
end;
$$;
rollback;
