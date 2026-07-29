\set ON_ERROR_STOP on

do $$
declare
  cfg text[];
begin
  select proconfig
    into cfg
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'leasemind_security'
     and p.proname = 'bump_reveal_guard';

  if cfg is null or not ('search_path=pg_catalog' = any(cfg)) then
    raise exception 'unsafe search_path for bump_reveal_guard';
  end if;

  if exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      cross join lateral aclexplode(
        coalesce(p.proacl, acldefault('f', p.proowner))
      ) acl
     where n.nspname = 'leasemind_security'
       and p.proname = 'bump_reveal_guard'
       and acl.grantee = 0
       and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'PUBLIC EXECUTE remains on bump_reveal_guard';
  end if;

  if not exists (
    select 1
      from pg_class c
     where c.relname = 'source_reveal_lease'
       and c.relrowsecurity
       and c.relforcerowsecurity
  ) then
    raise exception 'source_reveal_lease RLS is not forced';
  end if;

  if (
    select count(*)
      from pg_trigger
     where not tgisinternal
       and tgname in (
         'immutable_reveal_gate_snapshot',
         'immutable_reveal_gate_snapshot_source',
         'immutable_reveal_gate_snapshot_party',
         'immutable_reveal_attempt',
         'immutable_reveal_delivery_evidence',
         'immutable_decision_record'
       )
  ) <> 6 then
    raise exception 'immutable trigger set is incomplete';
  end if;

  if (
    select count(*)
      from pg_class c
     where c.relname in ('event_outbox', 'command_idempotency_result')
       and c.relrowsecurity
       and c.relforcerowsecurity
  ) <> 2 then
    raise exception 'shared infrastructure FORCE RLS is incomplete';
  end if;

  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'leasemind_security'
      and p.proname = 'apply_safety_critical_invalidation'
      and p.prosecdef
  ) then
    raise exception 'atomic safety-critical invalidation function is absent';
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conname = 'fk_introduction_record_committed_snapshot'
  ) then
    raise exception 'Record to Snapshot composite FK is absent';
  end if;
end
$$;
