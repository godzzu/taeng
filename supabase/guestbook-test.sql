-- Run after guestbook.sql in SQL Editor. All test data is rolled back.
begin;
insert into public.guestbook_boards(id) values ('__guestbook_test__') on conflict do nothing;
do $$
declare
  client uuid := gen_random_uuid();
  request uuid := gen_random_uuid();
  response jsonb;
  again jsonb;
begin
  response := public.create_guestbook_entry('__guestbook_test__','테스트','축하합니다',client,request,'');
  assert response ? 'id', 'create failed';
  assert (response->>'approved')::boolean = false, 'approval must default to false';
  again := public.create_guestbook_entry('__guestbook_test__','테스트','축하합니다',client,request,'');
  assert response = again, 'request id must be idempotent';
  assert (public.list_guestbook('__guestbook_test__')->'entries') = '[]'::jsonb, 'pending must not be public';
  again := public.create_guestbook_entry('__guestbook_test__','테스트','축하합니다',gen_random_uuid(),gen_random_uuid(),'');
  assert again->>'error' = 'duplicate', 'duplicate check failed';
  again := public.create_guestbook_entry('__guestbook_test__','테스트','다른 메시지',client,gen_random_uuid(),'');
  assert again->>'error' = 'rate_limit', 'cooldown failed';
  update public.guestbook_entries set approved = true where id = (response->>'id')::bigint;
  assert jsonb_array_length(public.list_guestbook('__guestbook_test__')->'entries') = 1, 'approved entry missing';
  assert not has_table_privilege('anon', 'public.guestbook_entries', 'INSERT'), 'direct insert exposed';
  assert not has_table_privilege('anon', 'public.guestbook_entries', 'SELECT'), 'private fields exposed';
  assert not has_table_privilege('anon', 'public.guestbook_entries', 'UPDATE'), 'moderation exposed';
end $$;
rollback;
