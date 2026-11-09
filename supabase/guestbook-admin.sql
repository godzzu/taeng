-- Run after guestbook.sql in Supabase SQL Editor. Existing entries are preserved.
begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create table if not exists public.guestbook_admin_credentials (
  wedding_id text primary key references public.guestbook_boards(id) on delete cascade,
  password_hash text not null,
  failures integer not null default 0,
  locked_until timestamptz,
  password_changed_at timestamptz not null default clock_timestamp()
);
create table if not exists public.guestbook_admin_sessions (
  token_hash text primary key,
  wedding_id text not null references public.guestbook_admin_credentials(wedding_id) on delete cascade,
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null
);
alter table public.guestbook_admin_credentials enable row level security;
alter table public.guestbook_admin_sessions enable row level security;
revoke all on public.guestbook_admin_credentials, public.guestbook_admin_sessions from public, anon, authenticated;
create index if not exists guestbook_admin_page on public.guestbook_entries(wedding_id, id desc);

-- Owner-only provisioning; never grant this function to browser roles.
create or replace function public.set_guestbook_admin_password(p_wedding_id text, p_password text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_password is null or char_length(p_password) < 12 or octet_length(p_password) > 72 then
    raise exception 'Password must contain at least 12 characters and at most 72 UTF-8 bytes';
  end if;
  insert into public.guestbook_admin_credentials(wedding_id, password_hash)
    values(p_wedding_id, extensions.crypt(p_password, extensions.gen_salt('bf', 12)))
    on conflict(wedding_id) do update set password_hash = excluded.password_hash,
      failures = 0, locked_until = null, password_changed_at = clock_timestamp();
  delete from public.guestbook_admin_sessions where wedding_id = p_wedding_id;
end;
$$;
revoke all on function public.set_guestbook_admin_password(text, text) from public, anon, authenticated;

create or replace function public.guestbook_admin(
  p_action text, p_wedding_id text, p_password text default null, p_token text default null,
  p_before bigint default null, p_entry_id bigint default null, p_approved boolean default null,
  p_max_id bigint default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  credential public.guestbook_admin_credentials%rowtype;
  session_token text;
  token_digest text;
  result jsonb;
  affected integer;
  snapshot_id bigint;
begin
  if p_action = 'login' then
    -- Serialize attempts for this board; failed attempts must commit, not raise.
    select * into credential from public.guestbook_admin_credentials where wedding_id = p_wedding_id for update;
    if not found then return jsonb_build_object('error', 'invalid_credentials'); end if;
    if credential.locked_until > clock_timestamp() then return jsonb_build_object('error', 'invalid_credentials'); end if;
    if p_password is null or octet_length(p_password) > 72 or
        extensions.crypt(p_password, credential.password_hash) is distinct from credential.password_hash then
      update public.guestbook_admin_credentials set
        failures = case when failures >= 4 then 0 else failures + 1 end,
        locked_until = case when failures >= 4 then clock_timestamp() + interval '15 minutes' else null end
        where wedding_id = p_wedding_id;
      return jsonb_build_object('error', 'invalid_credentials');
    end if;
    update public.guestbook_admin_credentials set failures = 0, locked_until = null where wedding_id = p_wedding_id;
    delete from public.guestbook_admin_sessions where expires_at <= clock_timestamp();
    session_token := encode(extensions.gen_random_bytes(32), 'hex');
    insert into public.guestbook_admin_sessions(token_hash, wedding_id, expires_at)
      values(encode(extensions.digest(session_token, 'sha256'), 'hex'), p_wedding_id, clock_timestamp() + interval '2 hours');
    return jsonb_build_object('token', session_token, 'expires_in', 7200);
  end if;
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return jsonb_build_object('error', 'unauthorized'); end if;
  token_digest := encode(extensions.digest(p_token, 'sha256'), 'hex');
  -- Serialize password changes with authorized operations.
  perform 1 from public.guestbook_admin_credentials where wedding_id = p_wedding_id for share;
  if not exists(select 1 from public.guestbook_admin_sessions s
      join public.guestbook_admin_credentials c on c.wedding_id = s.wedding_id
      where s.token_hash = token_digest and s.wedding_id = p_wedding_id
        and s.expires_at > clock_timestamp() and s.created_at >= c.password_changed_at) then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  if p_action = 'logout' then
    delete from public.guestbook_admin_sessions where token_hash = token_digest;
    return jsonb_build_object('ok', true);
  elsif p_action = 'list' then
    select coalesce(p_max_id, max(id), 0) into snapshot_id from public.guestbook_entries where wedding_id = p_wedding_id;
    with page as (
      select id, author_name, message, approved, created_at from public.guestbook_entries
      where wedding_id = p_wedding_id and id <= snapshot_id and (p_before is null or id < p_before)
      order by id desc limit 51
    ), shown as (select * from page order by id desc limit 50)
    select jsonb_build_object('entries', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id::text, 'name', author_name, 'message', message, 'approved', approved, 'created_at', created_at
    ) order by id desc) from shown), '[]'::jsonb), 'has_more', (select count(*) > 50 from page), 'max_id', snapshot_id::text) into result;
    return result;
  elsif p_action = 'set_approval' and p_approved is not null then
    update public.guestbook_entries set approved = p_approved where id = p_entry_id and wedding_id = p_wedding_id;
  elsif p_action = 'delete' then
    delete from public.guestbook_entries where id = p_entry_id and wedding_id = p_wedding_id;
  else
    return jsonb_build_object('error', 'invalid');
  end if;
  get diagnostics affected = row_count;
  if affected = 0 then return jsonb_build_object('error', 'not_found'); end if;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.guestbook_admin(text, text, text, text, bigint, bigint, boolean, bigint) from public, anon, authenticated;
grant execute on function public.guestbook_admin(text, text, text, text, bigint, bigint, boolean, bigint) to anon, authenticated;
commit;
