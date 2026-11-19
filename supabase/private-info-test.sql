-- Run AFTER private-info.sql as project owner. Synthetic rows roll back.
begin;
insert into public.wedding_contacts(wedding_id,id,person,label,name,phone,is_public)
values ('__private_info_test__','public','groom','test','test','000-0000-0000',true),
       ('__private_info_test__','hidden','groomFather','test','test','000-0000-0000',false),
       ('__private_info_other__','public','groom','other','other','000-0000-0000',true);
insert into public.wedding_accounts(wedding_id,id,side,label,bank,holder,account_number,is_public)
values ('__private_info_test__','public','groom','test','test','test','000-001',true),
       ('__private_info_test__','hidden','bride','test','test','test','000-002',false);
do $$ begin
  assert not has_table_privilege('anon','public.wedding_contacts','select');
  assert not has_table_privilege('anon','public.wedding_accounts','insert');
  assert not has_table_privilege('authenticated','public.wedding_contacts','update');
  assert not has_table_privilege('authenticated','public.wedding_accounts','select');
end $$;
set local role anon;
do $$ declare contacts jsonb; accounts jsonb; begin
  contacts := public.list_public_wedding_contacts('__private_info_test__',array['public','hidden']);
  accounts := public.list_public_wedding_accounts('__private_info_test__',array['public','hidden']);
  assert jsonb_array_length(contacts) = 1;
  assert contacts->0->>'name' = 'test';
  assert jsonb_array_length(accounts) = 1;
  assert accounts->0->>'account_number' = '000-001';
  assert public.list_public_wedding_contacts('__missing__',array['public']) = '[]'::jsonb;
  assert public.list_public_wedding_contacts('__private_info_test__',array[]::text[]) = '[]'::jsonb;
  begin
    perform * from public.wedding_contacts;
    raise exception 'Direct SELECT unexpectedly permitted';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.wedding_accounts where wedding_id = '__private_info_test__';
    raise exception 'Direct DELETE unexpectedly permitted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
