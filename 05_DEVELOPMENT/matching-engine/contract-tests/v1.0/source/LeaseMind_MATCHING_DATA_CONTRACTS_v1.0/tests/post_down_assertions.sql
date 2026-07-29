\set ON_ERROR_STOP on

do $$
declare
  residual_count integer;
begin
  select count(*) into residual_count
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in (
       'payer_resolution_aggregate',
       'participation_acceptance',
       'financial_intent',
       'financial_ledger_event',
       'source_reveal_lease',
       'reveal_source_state',
       'introduction_record',
       'introduction_record_party',
       'reveal_gate_snapshot',
       'reveal_gate_snapshot_source',
       'reveal_gate_snapshot_party',
       'reveal_token',
       'reveal_attempt',
       'reveal_delivery_evidence',
       'decision_record',
       'event_outbox',
       'event_inbox',
       'command_idempotency_result'
     );
  if residual_count <> 0 then
    raise exception 'post-down contract tables remain: %', residual_count;
  end if;

  if exists (
    select 1 from pg_namespace where nspname = 'leasemind_security'
  ) then
    raise exception 'post-down leasemind_security schema remains';
  end if;

  if exists (
    select 1 from pg_type
     where typname in ('record_state', 'payment_path', 'reveal_source_system')
       and typnamespace = 'public'::regnamespace
  ) then
    raise exception 'post-down contract types remain';
  end if;

  if exists (
    select 1 from pg_roles
     where rolname = any(array[
       'leasemind_guard_owner',
       'leasemind_payer_writer',
       'leasemind_participation_writer',
       'leasemind_financial_writer',
       'leasemind_previous_contact_writer',
       'leasemind_identity_authority_writer',
       'leasemind_lawful_basis_writer',
       'leasemind_introduction_writer',
       'leasemind_reveal_writer',
       'leasemind_contract_reader',
       'leasemind_outbox_publisher',
       'leasemind_event_consumer'
     ])
  ) then
    raise exception 'post-down contract roles remain';
  end if;

  if exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in (
         'protect_event_outbox_immutable_fields',
         'validate_event_outbox_domain',
         'validate_command_idempotency_owner',
         'reject_immutable_mutation',
         'assert_complete_reveal_snapshot_parties',
         'assert_complete_reveal_snapshot_sources',
         'assert_complete_introduction_record_parties'
       )
  ) then
    raise exception 'post-down contract functions remain';
  end if;
end
$$;
