-- Run in Supabase SQL Editor as the project owner BEFORE deploying the client.
-- No real personal data is included. Populate rows using Table Editor.
begin;

create table if not exists public.wedding_contacts (
  wedding_id text not null check (char_length(wedding_id) between 1 and 120),
  id text not null check (id ~ '^[a-zA-Z0-9_-]{1,80}$'),
  person text not null check (person in ('groom','groomFather','groomMother','bride','brideFather','brideMother')),
  label text not null check (char_length(label) between 1 and 80),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (phone ~ '^\+?[0-9() .-]{3,30}$'),
  is_public boolean not null default false,
  sort_order integer not null default 0,
  primary key (wedding_id, id)
);
create table if not exists public.wedding_accounts (
  wedding_id text not null check (char_length(wedding_id) between 1 and 120),
  id text not null check (id ~ '^[a-zA-Z0-9_-]{1,80}$'),
  side text not null check (side in ('groom','bride','other')),
  label text not null check (char_length(label) between 1 and 80),
  bank text not null check (char_length(bank) between 1 and 80),
  holder text not null check (char_length(holder) between 1 and 120),
  account_number text not null check (account_number ~ '^[0-9 -]{1,60}$'),
  is_public boolean not null default false,
  sort_order integer not null default 0,
  primary key (wedding_id, id)
);

alter table public.wedding_contacts enable row level security;
alter table public.wedding_accounts enable row level security;
revoke all on public.wedding_contacts, public.wedding_accounts from public, anon, authenticated;
-- No client SELECT/INSERT/UPDATE/DELETE policies. Only project owners manage rows.

create or replace function public.list_public_wedding_contacts(p_wedding_id text, p_ids text[])
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'person', c.person, 'label', c.label, 'name', c.name, 'phone', c.phone
  ) order by c.sort_order, c.id), '[]'::jsonb)
  from public.wedding_contacts c
  where c.wedding_id = p_wedding_id and c.is_public = true
    and c.id = any(p_ids) and cardinality(p_ids) between 1 and 100;
$$;

create or replace function public.list_public_wedding_accounts(p_wedding_id text, p_ids text[])
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id, 'side', a.side, 'label', a.label, 'bank', a.bank,
    'holder', a.holder, 'account_number', a.account_number
  ) order by a.sort_order, a.id), '[]'::jsonb)
  from public.wedding_accounts a
  where a.wedding_id = p_wedding_id and a.is_public = true
    and a.id = any(p_ids) and cardinality(p_ids) between 1 and 100;
$$;

revoke all on function public.list_public_wedding_contacts(text, text[]) from public, anon, authenticated;
revoke all on function public.list_public_wedding_accounts(text, text[]) from public, anon, authenticated;
grant execute on function public.list_public_wedding_contacts(text, text[]) to anon, authenticated;
grant execute on function public.list_public_wedding_accounts(text, text[]) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
