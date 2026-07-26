do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'leasemind_guard_owner') then
    create role leasemind_guard_owner noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_payer_writer') then
    create role leasemind_payer_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_participation_writer') then
    create role leasemind_participation_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_financial_writer') then
    create role leasemind_financial_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_previous_contact_writer') then
    create role leasemind_previous_contact_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_identity_authority_writer') then
    create role leasemind_identity_authority_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_lawful_basis_writer') then
    create role leasemind_lawful_basis_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_introduction_writer') then
    create role leasemind_introduction_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_reveal_writer') then
    create role leasemind_reveal_writer noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_contract_reader') then
    create role leasemind_contract_reader noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_outbox_publisher') then
    create role leasemind_outbox_publisher noinherit nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'leasemind_event_consumer') then
    create role leasemind_event_consumer noinherit nologin;
  end if;
end
$$;

create schema if not exists leasemind_security authorization leasemind_guard_owner;
revoke all on schema leasemind_security from public;

create type record_state as enum (
  'DRAFT',
  'PRE_REVEAL_LOCKED',
  'REVEAL_COMMITTED',
  'REVEALED_ACTIVE',
  'DISCLOSURE_DISPUTED',
  'DISPUTED',
  'EXPIRED',
  'VOID_PRE_REVEAL',
  'INVALIDATED_BY_DECISION'
);

create type payment_path as enum ('DEBIT', 'CREDIT', 'MIXED');

create type reveal_source_system as enum (
  'PARTICIPATION_SERVICE',
  'PAYER_RESOLUTION',
  'PREVIOUS_CONTACT_DECISION',
  'PAYMENT_FISCAL_LEDGER',
  'IDENTITY_AUTHORITY_REGISTRY',
  'LAWFUL_BASIS_CONSENT_REGISTRY'
);

create table payer_resolution_aggregate (
  payer_resolution_aggregate_id uuid primary key,
  encounter_id uuid not null unique,
  match_pair_id uuid not null,
  payer_party_id uuid,
  payer_campaign_id uuid,
  payer_assignment_version bigint not null default 0 check (payer_assignment_version >= 0),
  aggregate_version bigint not null check (aggregate_version >= 1),
  resolution_state text not null check (
    resolution_state in ('UNASSIGNED', 'ASSIGNED', 'PAYER_RESOLUTION_REQUIRED', 'PAYER_UNRESOLVED')
  ),
  updated_at timestamptz not null,
  check (
    (
      resolution_state = 'ASSIGNED'
      and payer_party_id is not null
      and payer_campaign_id is not null
      and payer_assignment_version >= 1
    )
    or
    (
      resolution_state <> 'ASSIGNED'
      and payer_party_id is null
      and payer_campaign_id is null
    )
  )
);

create unique index uq_active_pair_resolution
  on payer_resolution_aggregate(match_pair_id)
  where resolution_state in ('UNASSIGNED', 'ASSIGNED', 'PAYER_RESOLUTION_REQUIRED', 'PAYER_UNRESOLVED');

create table participation_acceptance (
  acceptance_record_id uuid primary key,
  encounter_id uuid not null,
  match_id uuid not null,
  party_id uuid not null,
  party_role text not null check (party_role in ('PAYER', 'NON_PAYER')),
  payer_party_id uuid not null,
  payer_campaign_id uuid not null,
  aggregate_version bigint not null check (aggregate_version >= 1),
  identity_version bigint not null check (identity_version >= 1),
  identity_method text not null,
  identity_evidence_ref uuid not null,
  authority_version bigint not null check (authority_version >= 1),
  authority_status text not null check (authority_status in ('VERIFIED', 'NOT_REQUIRED')),
  authority_evidence_ref uuid not null,
  terms_version text not null,
  terms_hash char(64) not null check (terms_hash ~ '^[a-f0-9]{64}$'),
  consent_version text not null,
  consent_hash char(64) not null check (consent_hash ~ '^[a-f0-9]{64}$'),
  payer_notice_version text not null,
  confirmed_account_id uuid not null,
  signature_operation_id uuid not null,
  signed_action text not null,
  signature_verification_result text not null check (signature_verification_result = 'VERIFIED'),
  signature_evidence_ref uuid not null,
  accepted_at timestamptz not null,
  invalidated_at timestamptz,
  unique (encounter_id, party_id, aggregate_version),
  unique (acceptance_record_id, encounter_id, party_id, aggregate_version),
  unique (acceptance_record_id, encounter_id, party_id, aggregate_version, terms_hash)
);

create unique index uq_current_acceptance
  on participation_acceptance(encounter_id, party_id)
  where invalidated_at is null;

create table financial_intent (
  payment_intent_id uuid primary key,
  encounter_id uuid not null unique,
  payer_party_id uuid not null,
  payer_assignment_version bigint not null check (payer_assignment_version >= 1),
  payment_path payment_path not null,
  total_amount_minor bigint not null check (total_amount_minor = 1000000),
  credit_amount_minor bigint not null check (credit_amount_minor between 0 and 1000000),
  debit_amount_minor bigint not null check (debit_amount_minor between 0 and 1000000),
  currency char(3) not null check (currency = 'RUB'),
  fencing_token bigint not null check (fencing_token >= 1),
  created_at timestamptz not null,
  check (credit_amount_minor + debit_amount_minor = total_amount_minor),
  check (
    (payment_path = 'DEBIT' and credit_amount_minor = 0 and debit_amount_minor = total_amount_minor)
    or (payment_path = 'CREDIT' and debit_amount_minor = 0 and credit_amount_minor = total_amount_minor)
    or (payment_path = 'MIXED' and credit_amount_minor > 0 and debit_amount_minor > 0)
  )
);

create table financial_ledger_event (
  financial_event_id uuid primary key,
  payment_intent_id uuid not null references financial_intent(payment_intent_id),
  event_type text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  provider_id text,
  provider_operation_id text,
  fiscal_provider_id text,
  receipt_id text,
  credit_application_id uuid,
  causation_id uuid not null,
  payload_hash char(64) not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  occurred_at timestamptz not null,
  check (
    event_type in (
      'PAYMENT_INTENT_CREATED',
      'PAYMENT_AUTHORIZED',
      'PAYMENT_AUTHORIZATION_RELEASED',
      'ADVANCE_DEBIT_CONFIRMED',
      'CREDIT_APPLIED',
      'CREDIT_REVERSED',
      'ADVANCE_RECEIPT_FISCALIZED',
      'ADVANCE_SETTLED_AND_FISCALIZED',
      'REFUND_CONFIRMED',
      'FISCAL_CORRECTION_CONFIRMED',
      'FINAL_SETTLEMENT_FISCALIZED'
    )
  )
);

create unique index uq_financial_provider_operation
  on financial_ledger_event(provider_id, provider_operation_id)
  where provider_id is not null and provider_operation_id is not null;

create unique index uq_financial_receipt
  on financial_ledger_event(fiscal_provider_id, receipt_id)
  where fiscal_provider_id is not null and receipt_id is not null;

create unique index uq_financial_credit_application
  on financial_ledger_event(credit_application_id)
  where credit_application_id is not null;

create table source_reveal_lease (
  lease_id uuid primary key,
  source_system reveal_source_system not null,
  source_owner_role name not null,
  aggregate_id uuid not null,
  source_version bigint not null check (source_version >= 1),
  fencing_token bigint not null check (fencing_token >= 1),
  encounter_id uuid not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  released_at timestamptz,
  revoked_at timestamptz,
  expired_at timestamptz,
  revocation_reason text,
  lease_state text not null check (lease_state in ('ACTIVE', 'RELEASED', 'REVOKED', 'EXPIRED')),
  unique (source_system, aggregate_id, fencing_token),
  unique (lease_id, source_system, source_version, fencing_token, encounter_id),
  check (expires_at > issued_at),
  check (
    (lease_state = 'ACTIVE' and released_at is null and revoked_at is null and expired_at is null)
    or (lease_state = 'RELEASED' and released_at is not null and revoked_at is null and expired_at is null)
    or (lease_state = 'REVOKED' and revoked_at is not null and expired_at is null)
    or (lease_state = 'EXPIRED' and expired_at is not null and expired_at >= expires_at and released_at is null and revoked_at is null)
  )
);

alter table source_reveal_lease enable row level security;
alter table source_reveal_lease force row level security;

create policy source_reveal_lease_owner_policy on source_reveal_lease
  using (
    (source_system = 'PARTICIPATION_SERVICE' and current_user = 'leasemind_participation_writer')
    or (source_system = 'PAYER_RESOLUTION' and current_user = 'leasemind_payer_writer')
    or (source_system = 'PREVIOUS_CONTACT_DECISION' and current_user = 'leasemind_previous_contact_writer')
    or (source_system = 'PAYMENT_FISCAL_LEDGER' and current_user = 'leasemind_financial_writer')
    or (source_system = 'IDENTITY_AUTHORITY_REGISTRY' and current_user = 'leasemind_identity_authority_writer')
    or (source_system = 'LAWFUL_BASIS_CONSENT_REGISTRY' and current_user = 'leasemind_lawful_basis_writer')
  )
  with check (
    source_owner_role = current_user
    and (
      (source_system = 'PARTICIPATION_SERVICE' and current_user = 'leasemind_participation_writer')
      or (source_system = 'PAYER_RESOLUTION' and current_user = 'leasemind_payer_writer')
      or (source_system = 'PREVIOUS_CONTACT_DECISION' and current_user = 'leasemind_previous_contact_writer')
      or (source_system = 'PAYMENT_FISCAL_LEDGER' and current_user = 'leasemind_financial_writer')
      or (source_system = 'IDENTITY_AUTHORITY_REGISTRY' and current_user = 'leasemind_identity_authority_writer')
      or (source_system = 'LAWFUL_BASIS_CONSENT_REGISTRY' and current_user = 'leasemind_lawful_basis_writer')
    )
  );

create policy source_reveal_lease_reader_policy on source_reveal_lease
  for select
  using (
    current_user in (
      'leasemind_introduction_writer',
      'leasemind_reveal_writer',
      'leasemind_contract_reader'
    )
  );

create policy source_reveal_lease_guard_owner_policy on source_reveal_lease
  for update
  using (current_user = 'leasemind_guard_owner')
  with check (current_user = 'leasemind_guard_owner');

create policy source_reveal_lease_guard_owner_select_policy on source_reveal_lease
  for select
  using (current_user = 'leasemind_guard_owner');

create unique index uq_active_source_reveal_lease
  on source_reveal_lease(source_system, aggregate_id, encounter_id)
  where lease_state = 'ACTIVE';

create table leasemind_security.reveal_guard (
  encounter_id uuid primary key,
  guard_epoch bigint not null check (guard_epoch >= 1),
  aggregate_version bigint not null check (aggregate_version >= 1),
  updated_at timestamptz not null
);

alter table leasemind_security.reveal_guard owner to leasemind_guard_owner;

create table reveal_source_state (
  source_system reveal_source_system not null,
  aggregate_id uuid not null,
  encounter_id uuid not null references payer_resolution_aggregate(encounter_id),
  source_version bigint not null check (source_version >= 1),
  updated_at timestamptz not null,
  primary key (source_system, aggregate_id, encounter_id)
);

alter table reveal_source_state enable row level security;
alter table reveal_source_state force row level security;

create policy reveal_source_state_guard_owner_policy on reveal_source_state
  using (current_user = 'leasemind_guard_owner')
  with check (current_user = 'leasemind_guard_owner');

create policy reveal_source_state_reader_policy on reveal_source_state
  for select
  using (
    current_user in (
      'leasemind_introduction_writer',
      'leasemind_reveal_writer',
      'leasemind_contract_reader'
    )
  );

create function leasemind_security.expected_source_owner_role(
  p_source_system reveal_source_system
)
returns name
language sql
immutable
set search_path = pg_catalog
as $$
  select case p_source_system
    when 'PARTICIPATION_SERVICE' then 'leasemind_participation_writer'::name
    when 'PAYER_RESOLUTION' then 'leasemind_payer_writer'::name
    when 'PREVIOUS_CONTACT_DECISION' then 'leasemind_previous_contact_writer'::name
    when 'PAYMENT_FISCAL_LEDGER' then 'leasemind_financial_writer'::name
    when 'IDENTITY_AUTHORITY_REGISTRY' then 'leasemind_identity_authority_writer'::name
    when 'LAWFUL_BASIS_CONSENT_REGISTRY' then 'leasemind_lawful_basis_writer'::name
  end
$$;

alter function leasemind_security.expected_source_owner_role(reveal_source_system)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.expected_source_owner_role(reveal_source_system) from public;

create function leasemind_security.ensure_reveal_guard(
  p_encounter_id uuid,
  p_created_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  current_epoch bigint;
begin
  if not (
    pg_has_role(session_user, 'leasemind_payer_writer', 'MEMBER')
    or pg_has_role(session_user, 'leasemind_introduction_writer', 'MEMBER')
    or session_user = 'leasemind_guard_owner'
  ) then
    raise exception using
      errcode = '42501',
      message = 'LM-GUARD-INITIALIZER-FORBIDDEN';
  end if;

  insert into leasemind_security.reveal_guard(
    encounter_id,
    guard_epoch,
    aggregate_version,
    updated_at
  ) values (
    p_encounter_id,
    1,
    1,
    p_created_at
  )
  on conflict (encounter_id) do nothing;

  select guard_epoch into current_epoch
    from leasemind_security.reveal_guard
   where encounter_id = p_encounter_id;

  return current_epoch;
end;
$$;

alter function leasemind_security.ensure_reveal_guard(uuid, timestamptz)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.ensure_reveal_guard(uuid, timestamptz) from public;
grant execute on function leasemind_security.ensure_reveal_guard(uuid, timestamptz)
  to leasemind_payer_writer, leasemind_introduction_writer;

create function leasemind_security.initialize_reveal_guard_on_encounter()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  perform leasemind_security.ensure_reveal_guard(new.encounter_id, new.updated_at);
  return new;
end;
$$;

alter function leasemind_security.initialize_reveal_guard_on_encounter()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.initialize_reveal_guard_on_encounter() from public;

create trigger initialize_reveal_guard_after_encounter
after insert on payer_resolution_aggregate
for each row execute function leasemind_security.initialize_reveal_guard_on_encounter();

create function leasemind_security.ensure_reveal_source_state_on_lease()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  expected_role name;
  current_version bigint;
begin
  expected_role := leasemind_security.expected_source_owner_role(new.source_system);
  if expected_role is null
     or not pg_has_role(session_user, expected_role, 'MEMBER') then
    raise exception using
      errcode = '42501',
      message = 'LM-SOURCE-OWNER-MISMATCH';
  end if;

  if not exists (
    select 1 from leasemind_security.reveal_guard
     where encounter_id = new.encounter_id
  ) then
    raise exception using
      errcode = '23503',
      message = 'LM-GUARD-NOT-INITIALIZED';
  end if;

  insert into public.reveal_source_state(
    source_system,
    aggregate_id,
    encounter_id,
    source_version,
    updated_at
  ) values (
    new.source_system,
    new.aggregate_id,
    new.encounter_id,
    new.source_version,
    new.issued_at
  )
  on conflict (source_system, aggregate_id, encounter_id) do nothing;

  select source_version into current_version
    from public.reveal_source_state
   where source_system = new.source_system
     and aggregate_id = new.aggregate_id
     and encounter_id = new.encounter_id;

  if current_version <> new.source_version then
    raise exception using
      errcode = '40001',
      message = 'LM-GATE-SNAPSHOT-STALE';
  end if;

  return new;
end;
$$;

alter function leasemind_security.ensure_reveal_source_state_on_lease()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.ensure_reveal_source_state_on_lease() from public;

create trigger ensure_reveal_source_state_before_lease
before insert on source_reveal_lease
for each row execute function leasemind_security.ensure_reveal_source_state_on_lease();

create function leasemind_security.bump_reveal_guard(
  p_encounter_id uuid,
  p_expected_guard_epoch bigint,
  p_changed_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  next_epoch bigint;
begin
  update leasemind_security.reveal_guard
     set guard_epoch = guard_epoch + 1,
         aggregate_version = aggregate_version + 1,
         updated_at = p_changed_at
   where encounter_id = p_encounter_id
     and guard_epoch = p_expected_guard_epoch
  returning guard_epoch into next_epoch;

  if next_epoch is null then
    raise exception using
      errcode = '40001',
      message = 'LM-CONCURRENCY-VERSION-MISMATCH';
  end if;
  return next_epoch;
end;
$$;

alter function leasemind_security.bump_reveal_guard(uuid, bigint, timestamptz)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.bump_reveal_guard(uuid, bigint, timestamptz) from public;

create function leasemind_security.apply_safety_critical_invalidation(
  p_source_system reveal_source_system,
  p_aggregate_id uuid,
  p_encounter_id uuid,
  p_expected_source_version bigint,
  p_new_source_version bigint,
  p_changed_at timestamptz,
  p_reason text,
  p_event_id uuid,
  p_event_type text,
  p_producer text,
  p_correlation_id uuid,
  p_causation_id uuid,
  p_trace_id text,
  p_idempotency_key text,
  p_payload jsonb,
  p_payload_hash char(64)
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  expected_role name;
  next_epoch bigint;
  existing_payload_hash char(64);
begin
  expected_role := leasemind_security.expected_source_owner_role(p_source_system);
  if expected_role is null
     or not pg_has_role(session_user, expected_role, 'MEMBER') then
    raise exception using
      errcode = '42501',
      message = 'LM-SOURCE-OWNER-MISMATCH';
  end if;

  if p_new_source_version <> p_expected_source_version + 1 then
    raise exception using
      errcode = '22023',
      message = 'LM-SOURCE-VERSION-NONMONOTONIC';
  end if;

  select payload_hash into existing_payload_hash
    from public.event_outbox
   where event_id = p_event_id;

  if existing_payload_hash is not null then
    if existing_payload_hash <> p_payload_hash then
      raise exception using
        errcode = '23505',
        message = 'LM-IDEMPOTENCY-PAYLOAD-CONFLICT';
    end if;
    select guard_epoch into next_epoch
      from leasemind_security.reveal_guard
     where encounter_id = p_encounter_id;
    return next_epoch;
  end if;

  update public.reveal_source_state
     set source_version = p_new_source_version,
         updated_at = p_changed_at
   where source_system = p_source_system
     and aggregate_id = p_aggregate_id
     and encounter_id = p_encounter_id
     and source_version = p_expected_source_version;

  if not found then
    raise exception using
      errcode = '40001',
      message = 'LM-CONCURRENCY-VERSION-MISMATCH';
  end if;

  update public.source_reveal_lease
     set lease_state = 'REVOKED',
         revoked_at = p_changed_at,
         revocation_reason = p_reason
   where source_system = p_source_system
     and aggregate_id = p_aggregate_id
     and encounter_id = p_encounter_id
     and lease_state = 'ACTIVE';

  update leasemind_security.reveal_guard
     set guard_epoch = guard_epoch + 1,
         aggregate_version = aggregate_version + 1,
         updated_at = p_changed_at
   where encounter_id = p_encounter_id
  returning guard_epoch into next_epoch;

  if next_epoch is null then
    raise exception using
      errcode = '23503',
      message = 'LM-GUARD-NOT-INITIALIZED';
  end if;

  insert into public.event_outbox(
    event_id,
    domain_owner_role,
    event_type,
    schema_version,
    aggregate_id,
    aggregate_version,
    occurred_at,
    producer,
    correlation_id,
    causation_id,
    trace_id,
    idempotency_key,
    data_classification,
    payload,
    payload_hash,
    created_at
  ) values (
    p_event_id,
    expected_role,
    p_event_type,
    '1.0.0',
    p_aggregate_id,
    p_new_source_version,
    p_changed_at,
    p_producer,
    p_correlation_id,
    p_causation_id,
    p_trace_id,
    p_idempotency_key,
    'PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS',
    p_payload,
    p_payload_hash,
    p_changed_at
  );

  return next_epoch;
end;
$$;

alter function leasemind_security.apply_safety_critical_invalidation(
  reveal_source_system,
  uuid,
  uuid,
  bigint,
  bigint,
  timestamptz,
  text,
  uuid,
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  jsonb,
  char
) owner to leasemind_guard_owner;

revoke all on function leasemind_security.apply_safety_critical_invalidation(
  reveal_source_system,
  uuid,
  uuid,
  bigint,
  bigint,
  timestamptz,
  text,
  uuid,
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  jsonb,
  char
) from public;

create function leasemind_security.transition_source_reveal_lease(
  p_lease_id uuid,
  p_target_state text,
  p_transitioned_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  lease_row public.source_reveal_lease%rowtype;
  expected_role name;
begin
  select * into lease_row
    from public.source_reveal_lease
   where lease_id = p_lease_id
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'LM-GATE-LEASE-MISSING';
  end if;

  expected_role := leasemind_security.expected_source_owner_role(lease_row.source_system);
  if expected_role is null
     or not pg_has_role(session_user, expected_role, 'MEMBER') then
    raise exception using errcode = '42501', message = 'LM-SOURCE-OWNER-MISMATCH';
  end if;

  if p_target_state = 'RELEASED' and lease_row.lease_state = 'ACTIVE' then
    update public.source_reveal_lease
       set lease_state = 'RELEASED', released_at = p_transitioned_at
     where lease_id = p_lease_id;
  elsif p_target_state = 'EXPIRED'
        and lease_row.lease_state = 'ACTIVE'
        and p_transitioned_at >= lease_row.expires_at then
    update public.source_reveal_lease
       set lease_state = 'EXPIRED', expired_at = p_transitioned_at
     where lease_id = p_lease_id;
  else
    raise exception using errcode = '23514', message = 'LM-GATE-LEASE-TRANSITION-FORBIDDEN';
  end if;
end;
$$;

alter function leasemind_security.transition_source_reveal_lease(uuid, text, timestamptz)
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.transition_source_reveal_lease(uuid, text, timestamptz) from public;

create table introduction_record (
  introduction_record_id uuid primary key,
  encounter_id uuid not null unique,
  match_pair_id uuid not null,
  match_id uuid not null,
  campaign_ids uuid[] not null check (cardinality(campaign_ids) between 1 and 2),
  object_id uuid not null,
  record_state record_state not null,
  aggregate_version bigint not null check (aggregate_version >= 1),
  reveal_gate_snapshot_id uuid,
  snapshot_hash char(64),
  manifest_hash char(64),
  payer_party_id uuid,
  payer_campaign_id uuid,
  payer_assignment_version bigint,
  match_rule_version text not null,
  match_accepted_at timestamptz,
  previous_contact_decision_id uuid not null,
  previous_contact_policy_version text not null,
  previous_contact_policy_hash char(64) not null check (previous_contact_policy_hash ~ '^[a-f0-9]{64}$'),
  advance_receipt_id text,
  final_settlement_receipt_id text,
  reveal_delivery_confirmed_event_id uuid,
  protection_starts_at timestamptz,
  protection_ends_at timestamptz,
  protection_timezone text,
  protection_tzdb_version text,
  protection_algorithm_version text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  check ((snapshot_hash is null) or snapshot_hash ~ '^[a-f0-9]{64}$'),
  check ((manifest_hash is null) or manifest_hash ~ '^[a-f0-9]{64}$'),
  check (
    (record_state in ('REVEALED_ACTIVE', 'DISPUTED', 'EXPIRED', 'INVALIDATED_BY_DECISION')
      and protection_starts_at is not null
      and protection_ends_at is not null
      and reveal_delivery_confirmed_event_id is not null)
    or
    (record_state not in ('REVEALED_ACTIVE', 'DISPUTED', 'EXPIRED', 'INVALIDATED_BY_DECISION'))
  ),
  check (protection_ends_at is null or protection_ends_at > protection_starts_at)
);

alter table introduction_record
  add constraint uq_introduction_record_id_encounter
  unique (introduction_record_id, encounter_id);

create table introduction_record_party (
  introduction_record_id uuid not null,
  encounter_id uuid not null,
  party_id uuid not null,
  party_role text not null check (party_role in ('OWNER_SIDE', 'TENANT_SIDE')),
  acceptance_record_id uuid not null,
  acceptance_aggregate_version bigint not null check (acceptance_aggregate_version >= 1),
  terms_hash char(64) not null check (terms_hash ~ '^[a-f0-9]{64}$'),
  lawful_basis_id uuid not null,
  identity_authority_version bigint not null check (identity_authority_version >= 1),
  primary key (introduction_record_id, party_id),
  unique (introduction_record_id, party_role),
  unique (
    introduction_record_id,
    encounter_id,
    party_id,
    acceptance_record_id,
    acceptance_aggregate_version,
    terms_hash
  ),
  foreign key (introduction_record_id, encounter_id)
    references introduction_record(introduction_record_id, encounter_id),
  foreign key (
    acceptance_record_id,
    encounter_id,
    party_id,
    acceptance_aggregate_version,
    terms_hash
  ) references participation_acceptance(
    acceptance_record_id,
    encounter_id,
    party_id,
    aggregate_version,
    terms_hash
  )
);

create unique index uq_one_prereveal_record_per_encounter
  on introduction_record(encounter_id)
  where record_state in ('DRAFT', 'PRE_REVEAL_LOCKED', 'REVEAL_COMMITTED', 'DISCLOSURE_DISPUTED');

create table reveal_gate_snapshot (
  reveal_gate_snapshot_id uuid primary key,
  introduction_record_id uuid not null references introduction_record(introduction_record_id),
  encounter_id uuid not null references payer_resolution_aggregate(encounter_id),
  match_pair_id uuid not null,
  match_id uuid not null,
  campaign_ids uuid[] not null check (cardinality(campaign_ids) between 1 and 2),
  campaign_versions bigint[] not null check (
    cardinality(campaign_versions) = cardinality(campaign_ids)
  ),
  payer_party_id uuid not null,
  payer_assignment_version bigint not null check (payer_assignment_version >= 1),
  previous_contact_decision_id uuid not null,
  previous_contact_decision_version bigint not null check (previous_contact_decision_version >= 1),
  previous_contact_policy_version text not null,
  previous_contact_policy_hash char(64) not null check (previous_contact_policy_hash ~ '^[a-f0-9]{64}$'),
  advance_ledger_version bigint not null check (advance_ledger_version >= 1),
  advance_receipt_id text not null,
  financial_exposure_version bigint not null check (financial_exposure_version >= 1),
  delivery_policy_version text not null,
  delivery_policy_hash char(64) not null check (delivery_policy_hash ~ '^[a-f0-9]{64}$'),
  manifest_hash char(64) not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  record_version bigint not null check (record_version >= 1),
  snapshot_hash char(64) not null check (snapshot_hash ~ '^[a-f0-9]{64}$'),
  fencing_token bigint not null check (fencing_token >= 1),
  reveal_guard_epoch bigint not null check (reveal_guard_epoch >= 1),
  valid_until timestamptz not null,
  created_at timestamptz not null,
  unique (introduction_record_id, fencing_token),
  unique (reveal_gate_snapshot_id, encounter_id),
  unique (reveal_gate_snapshot_id, introduction_record_id, encounter_id),
  unique (reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash),
  unique (reveal_gate_snapshot_id, introduction_record_id, encounter_id, snapshot_hash, manifest_hash),
  check (valid_until > created_at)
);

create function leasemind_security.validate_reveal_gate_snapshot_epoch()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  current_epoch bigint;
begin
  select guard_epoch into current_epoch
    from leasemind_security.reveal_guard
   where encounter_id = new.encounter_id;
  if current_epoch is null then
    raise exception using errcode = '23503', message = 'LM-GUARD-NOT-INITIALIZED';
  end if;
  if current_epoch <> new.reveal_guard_epoch then
    raise exception using errcode = '40001', message = 'LM-GATE-GUARD-EPOCH-STALE';
  end if;
  return new;
end;
$$;

alter function leasemind_security.validate_reveal_gate_snapshot_epoch()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.validate_reveal_gate_snapshot_epoch() from public;

create trigger validate_reveal_gate_snapshot_epoch_before_insert
before insert on reveal_gate_snapshot
for each row execute function leasemind_security.validate_reveal_gate_snapshot_epoch();

create table reveal_gate_snapshot_party (
  reveal_gate_snapshot_id uuid not null,
  introduction_record_id uuid not null,
  encounter_id uuid not null,
  party_id uuid not null,
  party_role text not null check (party_role in ('OWNER_SIDE', 'TENANT_SIDE')),
  acceptance_record_id uuid not null,
  acceptance_aggregate_version bigint not null check (acceptance_aggregate_version >= 1),
  terms_hash char(64) not null check (terms_hash ~ '^[a-f0-9]{64}$'),
  lawful_basis_id uuid not null,
  lawful_basis_version bigint not null check (lawful_basis_version >= 1),
  identity_authority_version bigint not null check (identity_authority_version >= 1),
  primary key (reveal_gate_snapshot_id, party_id),
  unique (reveal_gate_snapshot_id, party_role),
  foreign key (reveal_gate_snapshot_id, introduction_record_id, encounter_id)
    references reveal_gate_snapshot(
      reveal_gate_snapshot_id,
      introduction_record_id,
      encounter_id
    ) on delete cascade,
  foreign key (
    introduction_record_id,
    encounter_id,
    party_id,
    acceptance_record_id,
    acceptance_aggregate_version,
    terms_hash
  ) references introduction_record_party(
    introduction_record_id,
    encounter_id,
    party_id,
    acceptance_record_id,
    acceptance_aggregate_version,
    terms_hash
  )
);

alter table introduction_record
  add constraint fk_introduction_record_committed_snapshot
  foreign key (reveal_gate_snapshot_id, introduction_record_id, encounter_id, snapshot_hash, manifest_hash)
  references reveal_gate_snapshot(
    reveal_gate_snapshot_id,
    introduction_record_id,
    encounter_id,
    snapshot_hash,
    manifest_hash
  )
  deferrable initially deferred;

create table reveal_gate_snapshot_source (
  reveal_gate_snapshot_id uuid not null,
  encounter_id uuid not null,
  source_system reveal_source_system not null,
  source_lease_id uuid not null unique,
  source_version bigint not null check (source_version >= 1),
  fencing_token bigint not null check (fencing_token >= 1),
  primary key (reveal_gate_snapshot_id, source_system),
  foreign key (reveal_gate_snapshot_id, encounter_id)
    references reveal_gate_snapshot(reveal_gate_snapshot_id, encounter_id) on delete cascade,
  foreign key (source_lease_id, source_system, source_version, fencing_token, encounter_id)
    references source_reveal_lease(lease_id, source_system, source_version, fencing_token, encounter_id)
);

create function assert_complete_introduction_record_parties()
returns trigger
language plpgsql
as $$
declare
  checked_record_id uuid;
  party_count integer;
  role_count integer;
begin
  checked_record_id := case
    when tg_table_name = 'introduction_record' then
      case when tg_op = 'DELETE' then old.introduction_record_id else new.introduction_record_id end
    else
      case when tg_op = 'DELETE' then old.introduction_record_id else new.introduction_record_id end
  end;

  if not exists (
    select 1 from introduction_record
     where introduction_record_id = checked_record_id
  ) then
    return null;
  end if;

  select count(*), count(distinct party_role)
    into party_count, role_count
    from introduction_record_party
   where introduction_record_id = checked_record_id;

  if party_count <> 2 or role_count <> 2 then
    raise exception using
      errcode = '23514',
      message = 'LM-RECORD-PARTY-SET-INCOMPLETE';
  end if;
  return null;
end;
$$;

create constraint trigger ck_record_has_two_parties
after insert or update on introduction_record
deferrable initially deferred
for each row execute function assert_complete_introduction_record_parties();

create constraint trigger ck_record_party_set_remains_complete
after insert or update or delete on introduction_record_party
deferrable initially deferred
for each row execute function assert_complete_introduction_record_parties();

create function assert_complete_reveal_snapshot_parties()
returns trigger
language plpgsql
as $$
declare
  checked_snapshot_id uuid;
  party_count integer;
  role_count integer;
begin
  checked_snapshot_id := case
    when tg_table_name = 'reveal_gate_snapshot' then
      case when tg_op = 'DELETE' then old.reveal_gate_snapshot_id else new.reveal_gate_snapshot_id end
    else
      case when tg_op = 'DELETE' then old.reveal_gate_snapshot_id else new.reveal_gate_snapshot_id end
  end;

  if not exists (
    select 1 from reveal_gate_snapshot
     where reveal_gate_snapshot_id = checked_snapshot_id
  ) then
    return null;
  end if;

  select count(*), count(distinct party_role)
    into party_count, role_count
    from reveal_gate_snapshot_party
   where reveal_gate_snapshot_id = checked_snapshot_id;

  if party_count <> 2 or role_count <> 2 then
    raise exception using
      errcode = '23514',
      message = 'LM-SNAPSHOT-PARTY-SET-INCOMPLETE';
  end if;
  return null;
end;
$$;

create constraint trigger ck_snapshot_has_two_parties
after insert or update on reveal_gate_snapshot
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_parties();

create constraint trigger ck_snapshot_party_set_remains_complete
after insert or update or delete on reveal_gate_snapshot_party
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_parties();

create function assert_complete_reveal_snapshot_sources()
returns trigger
language plpgsql
as $$
declare
  checked_snapshot_id uuid;
  source_count integer;
begin
  if tg_op = 'DELETE' then
    checked_snapshot_id := old.reveal_gate_snapshot_id;
  else
    checked_snapshot_id := new.reveal_gate_snapshot_id;
  end if;

  if not exists (
    select 1 from reveal_gate_snapshot
    where reveal_gate_snapshot_id = checked_snapshot_id
  ) then
    return null;
  end if;

  select count(*) into source_count
  from reveal_gate_snapshot_source
  where reveal_gate_snapshot_id = checked_snapshot_id;

  if source_count <> 6 then
    raise exception using
      errcode = '23514',
      message = 'LM-GATE-LEASE-SET-INCOMPLETE';
  end if;
  return null;
end;
$$;

create constraint trigger ck_snapshot_has_six_sources
after insert or update on reveal_gate_snapshot
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_sources();

create constraint trigger ck_snapshot_source_set_remains_complete
after insert or update or delete on reveal_gate_snapshot_source
deferrable initially deferred
for each row execute function assert_complete_reveal_snapshot_sources();

create table reveal_token (
  reveal_token_id uuid primary key,
  token_hash char(64) not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  introduction_record_id uuid not null references introduction_record(introduction_record_id),
  encounter_id uuid not null,
  reveal_gate_snapshot_id uuid not null,
  recipient_party_id uuid not null,
  manifest_hash char(64) not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeem_idempotency_key text,
  redeem_request_hash char(64) check (
    redeem_request_hash is null or redeem_request_hash ~ '^[a-f0-9]{64}$'
  ),
  redeem_result jsonb,
  redeem_result_hash char(64) check (
    redeem_result_hash is null or redeem_result_hash ~ '^[a-f0-9]{64}$'
  ),
  operation_state text not null check (
    operation_state in ('PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED_RETRYABLE', 'FAILED_FINAL', 'UNKNOWN')
  ),
  foreign key (reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash)
    references reveal_gate_snapshot(reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash),
  foreign key (introduction_record_id, recipient_party_id)
    references introduction_record_party(introduction_record_id, party_id),
  unique (reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash),
  check (expires_at > issued_at),
  check (
    (redeemed_at is null and redeem_idempotency_key is null
      and redeem_request_hash is null and redeem_result is null and redeem_result_hash is null)
    or
    (redeemed_at is not null and redeem_idempotency_key is not null
      and redeem_request_hash is not null and redeem_result is not null
      and redeem_result_hash is not null and operation_state = 'SUCCEEDED')
  )
);

create function leasemind_security.validate_reveal_token_gate()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  snapshot_epoch bigint;
  current_epoch bigint;
  snapshot_valid_until timestamptz;
  active_source_count integer;
begin
  select snapshot.reveal_guard_epoch, snapshot.valid_until, guard.guard_epoch
    into snapshot_epoch, snapshot_valid_until, current_epoch
    from public.reveal_gate_snapshot snapshot
    join leasemind_security.reveal_guard guard
      on guard.encounter_id = snapshot.encounter_id
   where snapshot.reveal_gate_snapshot_id = new.reveal_gate_snapshot_id
     and snapshot.encounter_id = new.encounter_id;

  if snapshot_epoch is null then
    raise exception using errcode = '23503', message = 'LM-GATE-SNAPSHOT-MISSING';
  end if;
  if snapshot_epoch <> current_epoch then
    raise exception using errcode = '40001', message = 'LM-GATE-GUARD-EPOCH-STALE';
  end if;
  if new.issued_at >= snapshot_valid_until then
    raise exception using errcode = '22023', message = 'LM-GATE-SNAPSHOT-EXPIRED';
  end if;

  select count(*) into active_source_count
    from public.reveal_gate_snapshot_source snapshot_source
    join public.source_reveal_lease lease
      on lease.lease_id = snapshot_source.source_lease_id
     and lease.source_system = snapshot_source.source_system
     and lease.source_version = snapshot_source.source_version
     and lease.fencing_token = snapshot_source.fencing_token
     and lease.encounter_id = new.encounter_id
   where snapshot_source.reveal_gate_snapshot_id = new.reveal_gate_snapshot_id
     and lease.lease_state = 'ACTIVE'
     and lease.expires_at > new.issued_at;

  if active_source_count <> 6 then
    raise exception using errcode = '23514', message = 'LM-GATE-LEASE-SET-INCOMPLETE';
  end if;
  return new;
end;
$$;

alter function leasemind_security.validate_reveal_token_gate()
  owner to leasemind_guard_owner;
revoke all on function leasemind_security.validate_reveal_token_gate() from public;

create trigger validate_reveal_token_gate_before_insert
before insert on reveal_token
for each row execute function leasemind_security.validate_reveal_token_gate();

create function leasemind_security.redeem_reveal_token(
  p_reveal_token_id uuid,
  p_token_hash char(64),
  p_idempotency_key text,
  p_request_hash char(64),
  p_redeemed_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  token_row public.reveal_token%rowtype;
  snapshot_epoch bigint;
  current_epoch bigint;
  active_source_count integer;
  persisted_attempt_count integer;
  v_reveal_attempt_id uuid;
  v_result jsonb;
  v_result_hash char(64);
begin
  if char_length(p_idempotency_key) not between 16 and 128
     or p_request_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'LM-REVEAL-REQUEST-INVALID';
  end if;

  select * into token_row
    from public.reveal_token
   where reveal_token_id = p_reveal_token_id
   for update;

  if not found or token_row.token_hash <> p_token_hash then
    raise exception using errcode = '22023', message = 'LM-REVEAL-TOKEN-INVALID';
  end if;

  if token_row.redeemed_at is not null then
    if token_row.redeem_idempotency_key = p_idempotency_key
       and token_row.redeem_request_hash = p_request_hash then
      select count(*) into persisted_attempt_count
        from public.reveal_attempt attempt
       where attempt.reveal_attempt_id =
               (token_row.redeem_result ->> 'reveal_attempt_id')::uuid
         and attempt.reveal_token_id = token_row.reveal_token_id
         and attempt.introduction_record_id = token_row.introduction_record_id
         and attempt.encounter_id = token_row.encounter_id
         and attempt.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id
         and attempt.recipient_party_id = token_row.recipient_party_id
         and attempt.manifest_hash = token_row.manifest_hash;
      if persisted_attempt_count <> 1 then
        raise exception using errcode = '23514', message = 'LM-REVEAL-ATTEMPT-MISSING';
      end if;
      return token_row.redeem_result;
    elsif token_row.redeem_idempotency_key = p_idempotency_key then
      raise exception using errcode = '23505', message = 'LM-IDEMPOTENCY-PAYLOAD-CONFLICT';
    else
      raise exception using errcode = '23505', message = 'LM-REVEAL-TOKEN-USED';
    end if;
  end if;

  if p_redeemed_at >= token_row.expires_at then
    raise exception using errcode = '22023', message = 'LM-REVEAL-TOKEN-EXPIRED';
  end if;

  select snapshot.reveal_guard_epoch, guard.guard_epoch
    into snapshot_epoch, current_epoch
    from public.reveal_gate_snapshot snapshot
    join leasemind_security.reveal_guard guard
      on guard.encounter_id = snapshot.encounter_id
   where snapshot.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id;
  if snapshot_epoch <> current_epoch then
    raise exception using errcode = '40001', message = 'LM-GATE-GUARD-EPOCH-STALE';
  end if;

  select count(*) into active_source_count
    from public.reveal_gate_snapshot_source snapshot_source
    join public.source_reveal_lease lease
      on lease.lease_id = snapshot_source.source_lease_id
   where snapshot_source.reveal_gate_snapshot_id = token_row.reveal_gate_snapshot_id
     and lease.lease_state = 'ACTIVE'
     and lease.expires_at > p_redeemed_at;
  if active_source_count <> 6 then
    raise exception using errcode = '23514', message = 'LM-GATE-LEASE-SET-INCOMPLETE';
  end if;

  v_reveal_attempt_id := pg_catalog.gen_random_uuid();
  insert into public.reveal_attempt(
    reveal_attempt_id,
    reveal_token_id,
    introduction_record_id,
    encounter_id,
    reveal_gate_snapshot_id,
    recipient_party_id,
    manifest_hash,
    operation_state,
    attempted_at
  ) values (
    v_reveal_attempt_id,
    token_row.reveal_token_id,
    token_row.introduction_record_id,
    token_row.encounter_id,
    token_row.reveal_gate_snapshot_id,
    token_row.recipient_party_id,
    token_row.manifest_hash,
    'SUCCEEDED',
    p_redeemed_at
  );

  v_result := jsonb_build_object(
    'status', 'REDEEMED',
    'redeemed_at', p_redeemed_at,
    'reveal_attempt_id', v_reveal_attempt_id
  );
  v_result_hash := encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_result::text, 'UTF8')),
    'hex'
  );

  update public.reveal_token
     set redeemed_at = p_redeemed_at,
         redeem_idempotency_key = p_idempotency_key,
         redeem_request_hash = p_request_hash,
         redeem_result = v_result,
         redeem_result_hash = v_result_hash,
         operation_state = 'SUCCEEDED'
   where reveal_token_id = p_reveal_token_id
     and redeemed_at is null;

  if not found then
    raise exception using errcode = '40001', message = 'LM-CONCURRENCY-VERSION-MISMATCH';
  end if;
  return v_result;
end;
$$;

alter function leasemind_security.redeem_reveal_token(
  uuid, char, text, char, timestamptz
) owner to leasemind_guard_owner;
revoke all on function leasemind_security.redeem_reveal_token(
  uuid, char, text, char, timestamptz
) from public;

create table reveal_attempt (
  reveal_attempt_id uuid primary key,
  reveal_token_id uuid not null unique,
  introduction_record_id uuid not null,
  encounter_id uuid not null,
  reveal_gate_snapshot_id uuid not null,
  recipient_party_id uuid not null,
  manifest_hash char(64) not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  operation_state text not null,
  attempted_at timestamptz not null,
  foreign key (reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash)
    references reveal_token(reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash),
  unique (reveal_gate_snapshot_id, recipient_party_id, manifest_hash)
);

create table reveal_delivery_evidence (
  reveal_delivery_evidence_id uuid primary key,
  reveal_attempt_id uuid not null references reveal_attempt(reveal_attempt_id),
  evidence_manifest_hash char(64) not null check (evidence_manifest_hash ~ '^[a-f0-9]{64}$'),
  evidence_classification text not null check (
    evidence_classification in ('SUFFICIENT', 'PARTIAL', 'CONTRADICTORY', 'ABSENT')
  ),
  delivery_policy_version text not null,
  delivery_policy_hash char(64) not null check (delivery_policy_hash ~ '^[a-f0-9]{64}$'),
  established_delivery_at timestamptz,
  submitted_at timestamptz not null,
  check (
    (evidence_classification = 'SUFFICIENT' and established_delivery_at is not null)
    or (evidence_classification <> 'SUFFICIENT' and established_delivery_at is null)
  ),
  unique (reveal_attempt_id, evidence_manifest_hash)
);

create table decision_record (
  decision_id uuid primary key,
  dispute_id uuid not null,
  introduction_record_id uuid not null references introduction_record(introduction_record_id),
  decision_type text not null check (
    decision_type in (
      'DELIVERY_CONFIRMED_BY_DECISION',
      'NO_DELIVERY_CONFIRMED_BY_DECISION',
      'DISPUTE_REJECTED',
      'DISPUTE_UPHELD'
    )
  ),
  reviewer_id uuid not null,
  reviewer_role text not null,
  appointment_id uuid not null,
  conflict_check_id uuid not null,
  policy_version text not null,
  policy_hash char(64) not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  evidence_bundle_hash char(64) not null check (evidence_bundle_hash ~ '^[a-f0-9]{64}$'),
  established_delivery_at timestamptz,
  second_level_approver_id uuid,
  financial_consequence_ref uuid,
  appeal_status text not null default 'NOT_APPEALED'
    check (appeal_status in ('NOT_APPEALED', 'APPEALED', 'FINAL')),
  decision_order bigint not null check (decision_order >= 1),
  decided_at timestamptz not null,
  unique (dispute_id, decision_order),
  check (
    (decision_type = 'DELIVERY_CONFIRMED_BY_DECISION' and established_delivery_at is not null)
    or (decision_type <> 'DELIVERY_CONFIRMED_BY_DECISION' and established_delivery_at is null)
  )
);

create table event_outbox (
  event_id uuid primary key,
  domain_owner_role name not null,
  event_type text not null check (event_type ~ '^[A-Z][A-Z0-9_]*$'),
  schema_version text not null check (schema_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  aggregate_id uuid not null,
  aggregate_version bigint not null check (aggregate_version >= 1),
  occurred_at timestamptz not null,
  producer text not null check (char_length(producer) >= 1),
  correlation_id uuid not null,
  causation_id uuid not null,
  trace_id text not null check (char_length(trace_id) between 16 and 64),
  idempotency_key text not null check (char_length(idempotency_key) between 16 and 128),
  data_classification text not null
    check (data_classification = 'PSEUDONYMIZED_PERSONAL_DATA_NO_DIRECT_IDENTIFIERS'),
  payload jsonb not null,
  payload_hash char(64) not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null,
  published_at timestamptz,
  unique (aggregate_id, aggregate_version, event_type)
);

alter table event_outbox enable row level security;
alter table event_outbox force row level security;

create function leasemind_security.validate_no_direct_identifiers(p_document jsonb)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  serialized text := p_document::text;
begin
  if serialized ~* '"(email|phone|passport|bank|card|address|contact|full_name)"[[:space:]]*:'
     or serialized ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
     or serialized ~ '([+]7[[:space:]() -]*|8[[:space:](]+)[0-9]{3}[[:space:]() -]*[0-9]{3}[[:space:] -]*[0-9]{2}[[:space:] -]*[0-9]{2}'
     or serialized ~ '(^|[^0-9])[78]([[:space:]()\\-]*[0-9]){10}([^0-9]|$)'
     or serialized ~ '(^|[^0-9])[78][0-9]{10}([^0-9]|$)'
     or serialized ~ '(^|[^0-9])[0-9]{4}[[:space:]]+[0-9]{6}([^0-9]|$)'
     or serialized ~ '(^|[^0-9])([0-9][[:space:]\\-]*){10}([^0-9]|$)'
     or serialized ~ '(^|[^0-9])[0-9]{10}([^0-9]|$)'
     or serialized ~ '(^|[^0-9])([0-9]{4}[[:space:]\\-]){3}[0-9]{4}([^0-9]|$)'
     or serialized ~ '(^|[^0-9])[0-9]{16,19}([^0-9]|$)'
     or serialized ~* '(^|[^[:alpha:]])(улица|ул\.|проспект|дом|квартира|street|address)([^[:alpha:]]|$)' then
    raise log 'LM-DLP-DIRECT-IDENTIFIER-DETECTED';
    raise exception using errcode = '22023', message = 'LM-DATA-CLASSIFICATION-VIOLATION';
  end if;
  return true;
end;
$$;
comment on function leasemind_security.validate_no_direct_identifiers(jsonb)
  is 'DLP_EVENT_CONTENT_V1';

create function leasemind_security.is_valid_rfc3339_timestamp(p_value text)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  parsed timestamptz;
begin
  if p_value !~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|[+-]([01][0-9]|2[0-3]):[0-5][0-9])$' then
    return false;
  end if;
  perform make_date(
    substring(p_value from 1 for 4)::integer,
    substring(p_value from 6 for 2)::integer,
    substring(p_value from 9 for 2)::integer
  );
  parsed := p_value::timestamptz;
  return parsed is not null;
exception
  when others then
    return false;
end;
$$;

create function leasemind_security.validate_event_payload(
  p_event_type text,
  p_schema_version text,
  p_payload jsonb
)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  required_fields text[];
  allowed_fields text[];
  uuid_fields text[] := array[
    'encounter_id','match_pair_id','payer_party_id','payer_campaign_id','match_id',
    'acceptance_record_id','party_id','lawful_basis_id','previous_contact_decision_id',
    'financial_event_id','payment_intent_id','provider_operation_ref','receipt_ref',
    'credit_application_id','introduction_record_id','reveal_gate_snapshot_id',
    'reveal_attempt_id','recipient_party_id','decision_id','dispute_id',
    'financial_consequence_ref'
  ];
  integer_fields text[] := array[
    'payer_assignment_version','acceptance_aggregate_version','identity_authority_version',
    'lawful_basis_version','previous_contact_decision_version','amount_minor'
  ];
  timestamp_fields text[] := array[
    'effective_at','established_delivery_at','protection_starts_at',
    'protection_ends_at','attempted_at','decided_at'
  ];
  hash_fields text[] := array['policy_hash','manifest_hash','evidence_manifest_hash'];
  field_name text;
  from_state text;
  to_state text;
begin
  if split_part(p_schema_version, '.', 1) <> '1' then
    raise exception using errcode = '22023', message = 'LM-SCHEMA-MAJOR-UNSUPPORTED';
  end if;
  if jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-NOT-OBJECT';
  end if;

  case
    when p_event_type in ('PAYER_ASSIGNED', 'PAYER_RESOLUTION_REQUIRED') then
      required_fields := array['encounter_id','match_pair_id','resolution_state','payer_assignment_version'];
      allowed_fields := required_fields || array['payer_party_id','payer_campaign_id','reason_code'];
    when p_event_type in ('PARTICIPATION_ACCEPTED', 'PARTICIPATION_INVALIDATED') then
      required_fields := array['encounter_id','match_id','acceptance_record_id','party_id','acceptance_aggregate_version','acceptance_status'];
      allowed_fields := required_fields || array['reason_code'];
    when p_event_type = 'IDENTITY_AUTHORITY_INVALIDATED' then
      required_fields := array['party_id','identity_authority_version','reason_code','effective_at'];
      allowed_fields := required_fields;
    when p_event_type in ('LAWFUL_BASIS_INVALIDATED', 'LAWFUL_BASIS_REVOKED') then
      required_fields := array['party_id','lawful_basis_id','purpose_code','lawful_basis_version','reason_code','effective_at'];
      allowed_fields := required_fields;
    when p_event_type = 'PREVIOUS_CONTACT_DECISION_CHANGED' then
      required_fields := array['encounter_id','previous_contact_decision_id','previous_contact_decision_version','decision_status','reason_code','effective_at'];
      allowed_fields := required_fields || array['policy_version','policy_hash'];
    when p_event_type in (
      'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
      'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
      'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED','FISCAL_CORRECTION_CONFIRMED',
      'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
      'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED','FINANCIAL_READINESS_INVALIDATED',
      'FINAL_SETTLEMENT_FISCALIZED'
    ) then
      required_fields := array['encounter_id','financial_event_id','payment_path','amount_minor','currency'];
      allowed_fields := required_fields || array[
        'payment_intent_id','provider_operation_ref','receipt_ref','credit_application_id',
        'payer_assignment_version','reason_code'
      ];
    when p_event_type in (
      'RECORD_PRE_REVEAL_LOCKED','PRE_REVEAL_VOIDED','REVEAL_COMMITTED',
      'REVEAL_DELIVERY_CONFIRMED','REVEAL_DELIVERY_UNCERTAIN',
      'DISCLOSURE_CHALLENGED','PROTECTION_END_REACHED'
    ) then
      required_fields := array['introduction_record_id','encounter_id','from_state','to_state'];
      allowed_fields := required_fields || array[
        'reveal_gate_snapshot_id','established_delivery_at',
        'protection_starts_at','protection_ends_at'
      ];
    when p_event_type = 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED' then
      required_fields := array[
        'reveal_attempt_id','introduction_record_id','encounter_id','recipient_party_id',
        'reveal_gate_snapshot_id','manifest_hash','evidence_manifest_hash',
        'evidence_classification','attempted_at'
      ];
      allowed_fields := required_fields || array['established_delivery_at'];
    when p_event_type in (
      'DELIVERY_CONFIRMED_BY_DECISION','NO_DELIVERY_CONFIRMED_BY_DECISION',
      'DISPUTE_REJECTED','DISPUTE_UPHELD'
    ) then
      required_fields := array['decision_id','dispute_id','introduction_record_id','decision_type','decided_at'];
      allowed_fields := required_fields || array['established_delivery_at','financial_consequence_ref'];
    else
      raise exception using errcode = '22023', message = 'LM-OUTBOX-EVENT-SCHEMA-UNKNOWN';
  end case;

  foreach field_name in array required_fields loop
    if not (p_payload ? field_name) or p_payload -> field_name = 'null'::jsonb then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-REQUIRED-FIELD';
    end if;
  end loop;
  if exists (
    select 1 from jsonb_object_keys(p_payload) supplied(field_name)
     where not (supplied.field_name = any(allowed_fields))
  ) then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-UNKNOWN-FIELD';
  end if;

  foreach field_name in array allowed_fields loop
    if not (p_payload ? field_name) then continue; end if;
    if field_name = any(uuid_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'string' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if p_payload ->> field_name !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-FORMAT';
      end if;
    elsif field_name = any(integer_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'number'
         or p_payload ->> field_name !~ '^-?[0-9]+(\.0+)?$' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if (p_payload ->> field_name)::numeric
         not between -9223372036854775808::numeric and 9223372036854775807::numeric then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
      end if;
    elsif field_name = any(timestamp_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'string' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if not leasemind_security.is_valid_rfc3339_timestamp(p_payload ->> field_name) then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-FORMAT';
      end if;
    elsif field_name = any(hash_fields) then
      if jsonb_typeof(p_payload -> field_name) <> 'string' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
      end if;
      if p_payload ->> field_name !~ '^[a-f0-9]{64}$' then
        raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-FORMAT';
      end if;
    elsif jsonb_typeof(p_payload -> field_name) <> 'string' then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-TYPE';
    end if;
  end loop;

  if p_payload ? 'payer_assignment_version'
     and (
       (p_payload ->> 'payer_assignment_version')::numeric < 0
       or (
         p_event_type in (
           'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
           'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
           'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED',
           'FISCAL_CORRECTION_CONFIRMED',
           'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
           'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED',
           'FINANCIAL_READINESS_INVALIDATED','FINAL_SETTLEMENT_FISCALIZED'
         )
         and (p_payload ->> 'payer_assignment_version')::numeric < 1
       )
     ) then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'acceptance_aggregate_version'
     and (p_payload ->> 'acceptance_aggregate_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'identity_authority_version'
     and (p_payload ->> 'identity_authority_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'lawful_basis_version'
     and (p_payload ->> 'lawful_basis_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'previous_contact_decision_version'
     and (p_payload ->> 'previous_contact_decision_version')::numeric < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'amount_minor'
     and (p_payload ->> 'amount_minor')::numeric not between 0 and 1000000 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-RANGE';
  end if;
  if p_payload ? 'purpose_code'
     and char_length(p_payload ->> 'purpose_code') > 64 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-LENGTH';
  end if;
  if p_payload ? 'policy_version'
     and char_length(p_payload ->> 'policy_version') < 1 then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-LENGTH';
  end if;
  if p_payload ? 'currency' and p_payload ->> 'currency' <> 'RUB' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'payment_path'
     and p_payload ->> 'payment_path' not in ('DEBIT','CREDIT','MIXED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'resolution_state'
     and p_payload ->> 'resolution_state' not in ('ASSIGNED','PAYER_RESOLUTION_REQUIRED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_event_type = 'PAYER_ASSIGNED' and p_payload ->> 'resolution_state' <> 'ASSIGNED'
     or p_event_type = 'PAYER_RESOLUTION_REQUIRED' and p_payload ->> 'resolution_state' <> 'PAYER_RESOLUTION_REQUIRED' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_payload ? 'acceptance_status'
     and p_payload ->> 'acceptance_status' not in ('ACCEPTED','SUPERSEDED','INVALIDATED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_event_type = 'PARTICIPATION_ACCEPTED' and p_payload ->> 'acceptance_status' <> 'ACCEPTED'
     or p_event_type = 'PARTICIPATION_INVALIDATED' and p_payload ->> 'acceptance_status' not in ('SUPERSEDED','INVALIDATED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_payload ? 'authority_status'
     and p_payload ->> 'authority_status' not in ('VERIFIED','NOT_REQUIRED') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'decision_status'
     and p_payload ->> 'decision_status' not in ('NO_PREVIOUS_CONTACT_CONFIRMED','PREVIOUS_CONTACT_CONFIRMED','UNDER_REVIEW','INCONCLUSIVE') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'evidence_classification'
     and p_payload ->> 'evidence_classification' not in ('SUFFICIENT','PARTIAL','CONTRADICTORY','ABSENT') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'decision_type'
     and p_payload ->> 'decision_type' not in ('DELIVERY_CONFIRMED_BY_DECISION','NO_DELIVERY_CONFIRMED_BY_DECISION','DISPUTE_REJECTED','DISPUTE_UPHELD') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
  end if;
  if p_payload ? 'decision_type' and p_payload ->> 'decision_type' <> p_event_type then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;

  if p_payload ? 'reason_code' then
    if p_event_type in ('PAYER_ASSIGNED','PAYER_RESOLUTION_REQUIRED')
       and p_payload ->> 'reason_code' not in ('FIRST_VERIFIED_ACCEPTANCE','PAYER_ASSIGNMENT_CHANGED','CONCURRENT_ORDER_UNPROVABLE')
       or p_event_type in ('PARTICIPATION_ACCEPTED','PARTICIPATION_INVALIDATED')
       and p_payload ->> 'reason_code' not in ('USER_REVOKED','TERMS_VERSION_CHANGED','PAYER_REACCEPTANCE_REQUIRED','IDENTITY_AUTHORITY_CHANGED','ACCEPTANCE_SUPERSEDED')
       or p_event_type = 'IDENTITY_AUTHORITY_INVALIDATED'
       and p_payload ->> 'reason_code' not in ('IDENTITY_INVALIDATED','AUTHORITY_INVALIDATED','AUTHORITY_EXPIRED')
       or p_event_type in ('LAWFUL_BASIS_INVALIDATED','LAWFUL_BASIS_REVOKED')
       and p_payload ->> 'reason_code' not in ('INVALIDATED','REVOKED','EXPIRED','PROCESSING_PURPOSE_CHANGED')
       or p_event_type = 'PREVIOUS_CONTACT_DECISION_CHANGED'
       and p_payload ->> 'reason_code' not in ('DECISION_CREATED','EVIDENCE_ADDED','DECISION_REOPENED','DECISION_INVALIDATED')
       or p_event_type in (
         'PAYMENT_AUTHORIZED','PAYMENT_AUTHORIZATION_RELEASED','ADVANCE_DEBIT_CONFIRMED',
         'CREDIT_APPLIED','CREDIT_REVERSED','ADVANCE_RECEIPT_FISCALIZED',
         'ADVANCE_SETTLED_AND_FISCALIZED','REFUND_CONFIRMED','FISCAL_CORRECTION_CONFIRMED',
         'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
         'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED','FINANCIAL_READINESS_INVALIDATED',
         'FINAL_SETTLEMENT_FISCALIZED'
       ) and p_payload ->> 'reason_code' not in (
         'PROVIDER_RECONCILIATION_MISMATCH','KKT_OFD_RECONCILIATION_MISMATCH',
         'CREDIT_REVERSED','SECOND_PARTY_EXPOSURE_CHANGED','REFUND_AND_CORRECTION_COMPLETED'
       ) then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
    end if;
  end if;

  if p_payload ? 'from_state' then
    from_state := p_payload ->> 'from_state';
    to_state := p_payload ->> 'to_state';
    if from_state not in ('DRAFT','PRE_REVEAL_LOCKED','REVEAL_COMMITTED','REVEALED_ACTIVE','DISCLOSURE_DISPUTED','DISPUTED','EXPIRED','VOID_PRE_REVEAL','INVALIDATED_BY_DECISION')
       or to_state not in ('DRAFT','PRE_REVEAL_LOCKED','REVEAL_COMMITTED','REVEALED_ACTIVE','DISCLOSURE_DISPUTED','DISPUTED','EXPIRED','VOID_PRE_REVEAL','INVALIDATED_BY_DECISION') then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-ENUM';
    end if;
    if not (
      (p_event_type='RECORD_PRE_REVEAL_LOCKED' and from_state='DRAFT' and to_state='PRE_REVEAL_LOCKED')
      or (p_event_type='PRE_REVEAL_VOIDED' and from_state in ('DRAFT','PRE_REVEAL_LOCKED','DISCLOSURE_DISPUTED') and to_state='VOID_PRE_REVEAL')
      or (p_event_type='REVEAL_COMMITTED' and from_state='PRE_REVEAL_LOCKED' and to_state='REVEAL_COMMITTED')
      or (p_event_type='REVEAL_DELIVERY_CONFIRMED' and from_state='REVEAL_COMMITTED' and to_state='REVEALED_ACTIVE')
      or (p_event_type='REVEAL_DELIVERY_UNCERTAIN' and from_state='REVEAL_COMMITTED' and to_state='DISCLOSURE_DISPUTED')
      or (p_event_type='DISCLOSURE_CHALLENGED' and from_state='REVEALED_ACTIVE' and to_state='DISPUTED')
      or (p_event_type='PROTECTION_END_REACHED' and from_state='REVEALED_ACTIVE' and to_state='EXPIRED')
    ) then
      raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
    end if;
  end if;

  if p_event_type = 'REVEAL_DELIVERY_CONFIRMED'
     and not (p_payload ?& array['established_delivery_at','protection_starts_at','protection_ends_at']) then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_event_type = 'REVEAL_DELIVERY_EVIDENCE_SUBMITTED'
     and ((p_payload ->> 'evidence_classification') = 'SUFFICIENT') <> (p_payload ? 'established_delivery_at') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_event_type = 'DELIVERY_CONFIRMED_BY_DECISION'
     and not (p_payload ? 'established_delivery_at') then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;
  if p_event_type in ('NO_DELIVERY_CONFIRMED_BY_DECISION','DISPUTE_REJECTED','DISPUTE_UPHELD')
     and p_payload ? 'established_delivery_at' then
    raise exception using errcode = '22023', message = 'LM-OUTBOX-PAYLOAD-CONDITIONAL-FIELD';
  end if;

  return true;
end;
$$;

revoke all on function leasemind_security.validate_event_payload(text, text, jsonb) from public;
revoke all on function leasemind_security.validate_no_direct_identifiers(jsonb) from public;
revoke all on function leasemind_security.is_valid_rfc3339_timestamp(text) from public;

create function validate_event_outbox_domain()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  expected_producer text;
  allowed_event_types text[];
begin
  case new.domain_owner_role
    when 'leasemind_payer_writer' then
      expected_producer := 'payer-resolution';
      allowed_event_types := array['PAYER_ASSIGNED', 'PAYER_RESOLUTION_REQUIRED'];
    when 'leasemind_participation_writer' then
      expected_producer := 'participation';
      allowed_event_types := array['PARTICIPATION_ACCEPTED', 'PARTICIPATION_INVALIDATED'];
    when 'leasemind_previous_contact_writer' then
      expected_producer := 'legal-decision';
      allowed_event_types := array[
        'PREVIOUS_CONTACT_DECISION_CHANGED',
        'DELIVERY_CONFIRMED_BY_DECISION',
        'NO_DELIVERY_CONFIRMED_BY_DECISION',
        'DISPUTE_REJECTED',
        'DISPUTE_UPHELD'
      ];
    when 'leasemind_financial_writer' then
      expected_producer := 'payment-fiscal-ledger';
      allowed_event_types := array[
        'PAYMENT_AUTHORIZED',
        'PAYMENT_AUTHORIZATION_RELEASED',
        'ADVANCE_DEBIT_CONFIRMED',
        'CREDIT_APPLIED',
        'CREDIT_REVERSED',
        'ADVANCE_RECEIPT_FISCALIZED',
        'ADVANCE_SETTLED_AND_FISCALIZED',
        'REFUND_CONFIRMED',
        'FISCAL_CORRECTION_CONFIRMED',
        'SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED',
        'SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED',
        'FINANCIAL_READINESS_INVALIDATED',
        'FINAL_SETTLEMENT_FISCALIZED'
      ];
    when 'leasemind_identity_authority_writer' then
      expected_producer := 'identity-authority-registry';
      allowed_event_types := array['IDENTITY_AUTHORITY_INVALIDATED'];
    when 'leasemind_lawful_basis_writer' then
      expected_producer := 'lawful-basis-consent-registry';
      allowed_event_types := array['LAWFUL_BASIS_INVALIDATED', 'LAWFUL_BASIS_REVOKED'];
    when 'leasemind_introduction_writer' then
      expected_producer := 'introduction-record-service';
      allowed_event_types := array[
        'RECORD_PRE_REVEAL_LOCKED',
        'PRE_REVEAL_VOIDED',
        'REVEAL_COMMITTED',
        'REVEAL_DELIVERY_CONFIRMED',
        'REVEAL_DELIVERY_UNCERTAIN',
        'DISCLOSURE_CHALLENGED',
        'PROTECTION_END_REACHED'
      ];
    when 'leasemind_reveal_writer' then
      expected_producer := 'reveal-service';
      allowed_event_types := array['REVEAL_DELIVERY_EVIDENCE_SUBMITTED'];
    else
      raise exception using errcode = '42501', message = 'LM-OUTBOX-DOMAIN-UNKNOWN';
  end case;

  if new.producer <> expected_producer
     or not (new.event_type = any(allowed_event_types)) then
    raise exception using
      errcode = '42501',
      message = 'LM-OUTBOX-DOMAIN-MISMATCH';
  end if;
  perform leasemind_security.validate_no_direct_identifiers(
    jsonb_build_object(
      'trace_id', new.trace_id,
      'idempotency_key', new.idempotency_key,
      'producer', new.producer,
      'payload', new.payload
    )
  );
  perform leasemind_security.validate_event_payload(
    new.event_type,
    new.schema_version,
    new.payload
  );
  return new;
end;
$$;

create trigger validate_event_outbox_domain_before_insert
before insert on event_outbox
for each row execute function validate_event_outbox_domain();

create function protect_event_outbox_immutable_fields()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (to_jsonb(new) - 'published_at') is distinct from
     (to_jsonb(old) - 'published_at') then
    raise exception using errcode = '55000', message = 'LM-IMMUTABLE-ARTIFACT';
  end if;
  return new;
end;
$$;

create trigger protect_event_outbox_before_update
before update on event_outbox
for each row execute function protect_event_outbox_immutable_fields();

create policy event_outbox_domain_insert_policy on event_outbox
  for insert
  with check (domain_owner_role = current_user);

create policy event_outbox_domain_select_policy on event_outbox
  for select
  using (domain_owner_role = current_user);

create policy event_outbox_guard_insert_policy on event_outbox
  for insert
  with check (current_user = 'leasemind_guard_owner');

create policy event_outbox_guard_select_policy on event_outbox
  for select
  using (current_user = 'leasemind_guard_owner');

create policy event_outbox_publisher_policy on event_outbox
  for all
  using (current_user = 'leasemind_outbox_publisher')
  with check (current_user = 'leasemind_outbox_publisher');

create table event_inbox (
  consumer_id text not null,
  event_id uuid not null,
  payload_hash char(64) not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  result_hash char(64),
  processed_at timestamptz not null,
  primary key (consumer_id, event_id)
);

create table command_idempotency_result (
  owner_role name not null,
  service_id text not null,
  idempotency_key text not null,
  command_name text not null,
  request_payload_hash char(64) not null check (request_payload_hash ~ '^[a-f0-9]{64}$'),
  response_status integer not null check (response_status between 100 and 599),
  response_schema_version text not null,
  response_payload jsonb not null,
  response_payload_hash char(64) not null check (response_payload_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null,
  expires_at timestamptz not null,
  primary key (service_id, idempotency_key),
  check (expires_at > created_at)
);

alter table command_idempotency_result enable row level security;
alter table command_idempotency_result force row level security;

create function validate_command_idempotency_owner()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  expected_service text;
begin
  expected_service := case new.owner_role
    when 'leasemind_payer_writer' then 'payer-resolution'
    when 'leasemind_participation_writer' then 'participation'
    when 'leasemind_previous_contact_writer' then 'legal-decision'
    when 'leasemind_financial_writer' then 'payment-fiscal-ledger'
    when 'leasemind_identity_authority_writer' then 'identity-authority-registry'
    when 'leasemind_lawful_basis_writer' then 'lawful-basis-consent-registry'
    when 'leasemind_introduction_writer' then 'introduction-record-service'
    when 'leasemind_reveal_writer' then 'reveal-service'
  end;

  if expected_service is null or new.service_id <> expected_service then
    raise exception using
      errcode = '42501',
      message = 'LM-IDEMPOTENCY-OWNER-MISMATCH';
  end if;
  return new;
end;
$$;

create trigger validate_command_idempotency_owner_before_insert
before insert on command_idempotency_result
for each row execute function validate_command_idempotency_owner();

create policy command_idempotency_owner_policy on command_idempotency_result
  for all
  using (owner_role = current_user)
  with check (owner_role = current_user);

create function reject_immutable_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'LM-IMMUTABLE-ARTIFACT';
end;
$$;

create trigger immutable_command_idempotency_result
before update or delete on command_idempotency_result
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_gate_snapshot
before update or delete on reveal_gate_snapshot
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_gate_snapshot_source
before update or delete on reveal_gate_snapshot_source
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_gate_snapshot_party
before update or delete on reveal_gate_snapshot_party
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_attempt
before update or delete on reveal_attempt
for each row execute function reject_immutable_mutation();

create trigger immutable_reveal_delivery_evidence
before update or delete on reveal_delivery_evidence
for each row execute function reject_immutable_mutation();

create trigger immutable_decision_record
before update or delete on decision_record
for each row execute function reject_immutable_mutation();

revoke all on
  payer_resolution_aggregate,
  participation_acceptance,
  financial_intent,
  financial_ledger_event,
  source_reveal_lease,
  reveal_source_state,
  introduction_record,
  introduction_record_party,
  reveal_gate_snapshot,
  reveal_gate_snapshot_source,
  reveal_gate_snapshot_party,
  reveal_token,
  reveal_attempt,
  reveal_delivery_evidence,
  decision_record,
  event_outbox,
  event_inbox,
  command_idempotency_result
from public;

grant usage on schema leasemind_security to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant select on leasemind_security.reveal_guard to
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.apply_safety_critical_invalidation(
  reveal_source_system,
  uuid,
  uuid,
  bigint,
  bigint,
  timestamptz,
  text,
  uuid,
  text,
  text,
  uuid,
  uuid,
  text,
  text,
  jsonb,
  char
) to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer;

grant execute on function leasemind_security.transition_source_reveal_lease(uuid, text, timestamptz) to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer;

grant select, insert on source_reveal_lease to
  leasemind_participation_writer,
  leasemind_payer_writer,
  leasemind_previous_contact_writer,
  leasemind_financial_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer;

grant select, insert, update on reveal_source_state to leasemind_guard_owner;
grant select, update on source_reveal_lease to leasemind_guard_owner;
grant select, insert on event_outbox to leasemind_guard_owner;

grant select on source_reveal_lease to
  leasemind_introduction_writer,
  leasemind_reveal_writer,
  leasemind_contract_reader;

grant select on reveal_source_state to
  leasemind_introduction_writer,
  leasemind_reveal_writer,
  leasemind_contract_reader;

grant select, insert, update on payer_resolution_aggregate to leasemind_payer_writer;
grant select, insert, update on participation_acceptance to leasemind_participation_writer;
grant select, insert on financial_intent, financial_ledger_event to leasemind_financial_writer;
grant select, insert, update on introduction_record, introduction_record_party to leasemind_introduction_writer;
grant select, insert on reveal_gate_snapshot, reveal_gate_snapshot_source, reveal_gate_snapshot_party to leasemind_introduction_writer;
grant select on reveal_gate_snapshot, reveal_gate_snapshot_source, source_reveal_lease
  to leasemind_guard_owner;
grant select, update on reveal_token to leasemind_guard_owner;
grant select, insert on reveal_attempt to leasemind_guard_owner;
grant select, insert on reveal_token to leasemind_reveal_writer;
grant select on reveal_attempt to leasemind_reveal_writer;
grant select, insert on reveal_delivery_evidence to leasemind_reveal_writer;
grant execute on function leasemind_security.redeem_reveal_token(
  uuid, char, text, char, timestamptz
) to leasemind_reveal_writer;
grant select, insert on decision_record to leasemind_previous_contact_writer;

grant select, insert on event_outbox to
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant usage on schema leasemind_security to
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.validate_event_payload(text, text, jsonb) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.validate_no_direct_identifiers(jsonb) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant execute on function leasemind_security.is_valid_rfc3339_timestamp(text) to
  leasemind_guard_owner,
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant select, update (published_at) on event_outbox to leasemind_outbox_publisher;
grant select, insert, update on event_inbox to leasemind_event_consumer;
grant select, insert on command_idempotency_result to
  leasemind_payer_writer,
  leasemind_participation_writer,
  leasemind_financial_writer,
  leasemind_previous_contact_writer,
  leasemind_identity_authority_writer,
  leasemind_lawful_basis_writer,
  leasemind_introduction_writer,
  leasemind_reveal_writer;

grant select on
  payer_resolution_aggregate,
  participation_acceptance,
  financial_intent,
  financial_ledger_event,
  reveal_source_state,
  introduction_record,
  introduction_record_party,
  reveal_gate_snapshot,
  reveal_gate_snapshot_source,
  reveal_gate_snapshot_party,
  reveal_token,
  reveal_attempt,
  reveal_delivery_evidence,
  decision_record
to leasemind_contract_reader;
