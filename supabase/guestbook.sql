-- Run once in the Supabase SQL Editor as project owner. No browser secret key is needed.
begin;
create table if not exists public.guestbook_boards (
  id text primary key,
  is_open boolean not null default true,
  require_approval boolean not null default true
);
insert into public.guestbook_boards(id) values ('default') on conflict do nothing;

create table if not exists public.guestbook_entries (
  id bigint generated always as identity primary key,
  wedding_id text not null references public.guestbook_boards(id),
  request_id uuid not null,
  client_id uuid not null,
  author_name text not null check (char_length(btrim(author_name)) between 1 and 30),
  message text not null check (char_length(btrim(message)) between 1 and 300),
  fingerprint text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (wedding_id, request_id)
);
create index if not exists guestbook_public_page on public.guestbook_entries(wedding_id, id desc) where approved;
create index if not exists guestbook_client_rate on public.guestbook_entries(wedding_id, client_id, created_at desc);
create index if not exists guestbook_global_rate on public.guestbook_entries(wedding_id, created_at desc);
create index if not exists guestbook_duplicate on public.guestbook_entries(wedding_id, fingerprint, created_at desc);

alter table public.guestbook_boards enable row level security;
alter table public.guestbook_entries enable row level security;
-- Direct access is intentionally denied; only the narrow RPC interfaces below are public.
revoke all on public.guestbook_boards, public.guestbook_entries from anon, authenticated;
revoke all on sequence public.guestbook_entries_id_seq from anon, authenticated;

create or replace function public.list_guestbook(p_wedding_id text, p_before bigint default null)
returns jsonb language sql stable security definer set search_path = ''
as $$
  with page as (
    select id, author_name, message, created_at
    from public.guestbook_entries
    where wedding_id = p_wedding_id and approved and (p_before is null or id < p_before)
    order by id desc limit 11
  ), shown as (select * from page order by id desc limit 10)
  select pg_catalog.jsonb_build_object(
    'entries', (select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'id', id::text, 'name', author_name, 'message', message, 'created_at', created_at
    ) order by id desc), '[]'::jsonb) from shown),
    'has_more', (select count(*) > 10 from page)
  );
$$;

create or replace function public.create_guestbook_entry(
  p_wedding_id text, p_name text, p_message text,
  p_client_id uuid, p_request_id uuid, p_website text default ''
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  board public.guestbook_boards%rowtype;
  existing public.guestbook_entries%rowtype;
  entry_id bigint;
  signature text;
  clean_name text := btrim(p_name, E' \t\n\r');
  clean_message text := btrim(replace(replace(p_message, E'\r\n', E'\n'), E'\r', E'\n'), E' \t\n\r');
begin
  if p_client_id is null or p_request_id is null or coalesce(p_website, '') <> '' then
    return jsonb_build_object('error', 'invalid');
  end if;
  if clean_name is null or char_length(clean_name) not between 1 and 30 then
    return jsonb_build_object('error', 'name');
  end if;
  if clean_message is null or char_length(clean_message) not between 1 and 300 then
    return jsonb_build_object('error', 'message');
  end if;
  -- Lock the board row so concurrent submissions cannot bypass rate or duplicate checks.
  select * into board from public.guestbook_boards where id = p_wedding_id for update;
  if not found then return jsonb_build_object('error', 'closed'); end if;

  select * into existing from public.guestbook_entries
    where wedding_id = p_wedding_id and request_id = p_request_id;
  if found then
    if existing.client_id = p_client_id and existing.author_name = clean_name and existing.message = clean_message then
      return jsonb_build_object('id', existing.id::text, 'approved', existing.approved);
    end if;
    return jsonb_build_object('error', 'duplicate');
  end if;
  if not board.is_open then return jsonb_build_object('error', 'closed'); end if;
  signature := md5(lower(regexp_replace(clean_name || E'\n' || clean_message, '\s+', ' ', 'g')));
  if exists (select 1 from public.guestbook_entries where wedding_id = p_wedding_id
    and fingerprint = signature and created_at > now() - interval '24 hours') then
    return jsonb_build_object('error', 'duplicate');
  end if;
  if exists (select 1 from public.guestbook_entries where wedding_id = p_wedding_id
    and client_id = p_client_id and created_at > now() - interval '60 seconds')
    or (select count(*) from public.guestbook_entries where wedding_id = p_wedding_id
      and client_id = p_client_id and created_at > now() - interval '24 hours') >= 10
    or (select count(*) from public.guestbook_entries where wedding_id = p_wedding_id
      and created_at > now() - interval '1 hour') >= 100 then
    return jsonb_build_object('error', 'rate_limit');
  end if;
  insert into public.guestbook_entries(wedding_id, request_id, client_id, author_name, message, fingerprint, approved)
  values (p_wedding_id, p_request_id, p_client_id, clean_name, clean_message, signature, not board.require_approval)
  returning id into entry_id;
  return jsonb_build_object('id', entry_id::text, 'approved', not board.require_approval);
end;
$$;
revoke all on function public.list_guestbook(text, bigint) from public, anon, authenticated;
revoke all on function public.create_guestbook_entry(text, text, text, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.list_guestbook(text, bigint) to anon, authenticated;
grant execute on function public.create_guestbook_entry(text, text, text, uuid, uuid, text) to anon, authenticated;
commit;
