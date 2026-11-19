-- Supabase SQL Editor에서 프로젝트 소유자로 실행하세요.
-- 선행 작업: private-info.sql 실행.
-- 이 파일은 템플릿입니다. 실제 값은 SQL Editor에서만 입력하고 Git에 저장하지 마세요.
-- 1. 'default'를 PUBLIC_GUESTBOOK_WEDDING_ID와 맞춥니다.
-- 2. <...> 자리표시자를 실제 값으로 바꾸고, 사용하지 않는 행은 삭제합니다.
--    자리표시자 전화번호/계좌번호는 CHECK 제약에 걸리므로 그대로 실행할 수 없습니다.
-- 3. 공개할 행만 is_public을 true로 변경합니다. 아래는 모두 비공개(false)입니다.
-- 4. 문자열 안의 작은따옴표는 두 번('') 적습니다. 번호도 문자열로 입력하세요.
-- 같은 (wedding_id, id)가 있으면 아래 값으로 갱신합니다. 재실행 전 공개 여부도 확인하세요.
-- 오류가 나면 ROLLBACK;을 실행하고 내용을 수정한 뒤 전체를 다시 실행하세요.

begin;

-- 연락처: 부모님 공개 시 config의 contact.items[].visible도 true로 바꾸세요.
insert into public.wedding_contacts
  (wedding_id, id, person, label, name, phone, is_public, sort_order)
values
  ('default', 'groom',        'groom',       '신랑',        '<신랑 이름>',        '<신랑 전화번호>',        false, 10),
  ('default', 'groom-father', 'groomFather', '신랑 아버지', '<신랑 아버지 이름>', '<신랑 아버지 전화번호>', false, 20),
  ('default', 'groom-mother', 'groomMother', '신랑 어머니', '<신랑 어머니 이름>', '<신랑 어머니 전화번호>', false, 30),
  ('default', 'bride',        'bride',       '신부',        '<신부 이름>',        '<신부 전화번호>',        false, 40),
  ('default', 'bride-father', 'brideFather', '신부 아버지', '<신부 아버지 이름>', '<신부 아버지 전화번호>', false, 50),
  ('default', 'bride-mother', 'brideMother', '신부 어머니', '<신부 어머니 이름>', '<신부 어머니 전화번호>', false, 60)
on conflict (wedding_id, id) do update set
  person = excluded.person,
  label = excluded.label,
  name = excluded.name,
  phone = excluded.phone,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;

-- 계좌: 부모님 계좌를 표시하려면 config의 account.items에도 id/side를 추가하세요.
insert into public.wedding_accounts
  (wedding_id, id, side, label, bank, holder, account_number, is_public, sort_order)
values
  ('default', 'groom',        'groom', '신랑',        '<은행명>', '<신랑 예금주>',        '<신랑 계좌번호>',        false, 10),
  ('default', 'groom-father', 'groom', '신랑 아버지', '<은행명>', '<신랑 아버지 예금주>', '<신랑 아버지 계좌번호>', false, 20),
  ('default', 'groom-mother', 'groom', '신랑 어머니', '<은행명>', '<신랑 어머니 예금주>', '<신랑 어머니 계좌번호>', false, 30),
  ('default', 'bride',        'bride', '신부',        '<은행명>', '<신부 예금주>',        '<신부 계좌번호>',        false, 40),
  ('default', 'bride-father', 'bride', '신부 아버지', '<은행명>', '<신부 아버지 예금주>', '<신부 아버지 계좌번호>', false, 50),
  ('default', 'bride-mother', 'bride', '신부 어머니', '<은행명>', '<신부 어머니 예금주>', '<신부 어머니 계좌번호>', false, 60)
on conflict (wedding_id, id) do update set
  side = excluded.side,
  label = excluded.label,
  bank = excluded.bank,
  holder = excluded.holder,
  account_number = excluded.account_number,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;

commit;

-- 번호를 출력하지 않고 등록·공개 상태만 확인합니다.
select wedding_id, id, person, is_public, sort_order
from public.wedding_contacts where wedding_id = 'default' order by sort_order, id;
select wedding_id, id, side, is_public, sort_order
from public.wedding_accounts where wedding_id = 'default' order by sort_order, id;
