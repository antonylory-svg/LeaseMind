begin;

drop function if exists leasemind_security.redeem_reveal_token(
  uuid, char, text, char, timestamptz
);

alter table if exists introduction_record
  drop constraint if exists fk_introduction_record_committed_snapshot;

drop table if exists command_idempotency_result;
drop table if exists event_inbox;
drop table if exists event_outbox;
drop table if exists decision_record;
drop table if exists reveal_delivery_evidence;
drop table if exists reveal_attempt;
drop table if exists reveal_token;
drop table if exists reveal_gate_snapshot_party;
drop table if exists reveal_gate_snapshot_source;
drop table if exists reveal_gate_snapshot;
drop table if exists introduction_record_party;
drop table if exists introduction_record;
drop table if exists source_reveal_lease;
drop table if exists reveal_source_state;
drop table if exists financial_ledger_event;
drop table if exists financial_intent;
drop table if exists participation_acceptance;
drop table if exists payer_resolution_aggregate;

drop function if exists protect_event_outbox_immutable_fields();
drop function if exists validate_event_outbox_domain();
drop function if exists leasemind_security.validate_event_payload(text, text, jsonb);
drop function if exists leasemind_security.validate_no_direct_identifiers(jsonb);
drop function if exists leasemind_security.is_valid_rfc3339_timestamp(text);
drop function if exists leasemind_security.validate_reveal_token_gate();
drop function if exists leasemind_security.validate_reveal_gate_snapshot_epoch();
drop function if exists validate_command_idempotency_owner();
drop function if exists reject_immutable_mutation();
drop function if exists assert_complete_reveal_snapshot_parties();
drop function if exists assert_complete_reveal_snapshot_sources();
drop function if exists assert_complete_introduction_record_parties();
drop schema if exists leasemind_security cascade;

drop type if exists reveal_source_system;
drop type if exists payment_path;
drop type if exists record_state;

drop role if exists leasemind_contract_reader;
drop role if exists leasemind_event_consumer;
drop role if exists leasemind_outbox_publisher;
drop role if exists leasemind_reveal_writer;
drop role if exists leasemind_introduction_writer;
drop role if exists leasemind_lawful_basis_writer;
drop role if exists leasemind_identity_authority_writer;
drop role if exists leasemind_previous_contact_writer;
drop role if exists leasemind_financial_writer;
drop role if exists leasemind_participation_writer;
drop role if exists leasemind_payer_writer;
drop role if exists leasemind_guard_owner;

commit;
