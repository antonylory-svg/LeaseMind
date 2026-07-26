#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parent
SOURCE_MD = ROOT / "docs/LeaseMind_MATCHING_DATA_CONTRACTS_v1.0.md"


class StrictLoader(yaml.SafeLoader):
    pass


def construct_unique_mapping(loader: StrictLoader, node: yaml.Node, deep: bool = False):
    mapping = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in mapping:
            raise AssertionError(
                f"duplicate YAML key {key!r} at line {key_node.start_mark.line + 1}"
            )
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


StrictLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    construct_unique_mapping,
)


def load_yaml(path: Path):
    return yaml.load(path.read_text(encoding="utf-8"), Loader=StrictLoader)


def resolve_local_refs(document: dict) -> None:
    errors: list[str] = []

    def walk(value, path="$"):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == "$ref" and isinstance(child, str) and child.startswith("#/"):
                    target = document
                    try:
                        for part in child[2:].split("/"):
                            part = part.replace("~1", "/").replace("~0", "~")
                            target = target[part]
                    except (KeyError, TypeError):
                        errors.append(f"{path}: unresolved {child}")
                walk(child, f"{path}/{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}/{index}")

    walk(document)
    assert not errors, "; ".join(errors)


def event_enum(asyncapi: dict, schema_name: str) -> set[str]:
    schema = asyncapi["components"]["schemas"][schema_name]
    typed = schema["allOf"][1]["properties"]["event_type"]
    if "const" in typed:
        return {typed["const"]}
    return set(typed["enum"])


def check_openapi(openapi: dict) -> list[str]:
    checks = []
    assert openapi["openapi"] == "3.1.0"
    resolve_local_refs(openapi)
    checks.append("OpenAPI 3.1 parse and local refs")

    operations = []
    for path, path_item in openapi["paths"].items():
        for method, operation in path_item.items():
            if method.lower() in {"get", "post", "put", "patch", "delete"}:
                operations.append(operation["operationId"])
    assert len(operations) == len(set(operations))
    checks.append("OpenAPI operationId uniqueness")

    redeem = openapi["paths"]["/reveal/tokens/redeem"]["post"]
    parameter_refs = {item["$ref"] for item in redeem["parameters"]}
    assert "#/components/parameters/RevealTokenCredential" in parameter_refs
    assert all("reveal_token_id" not in key for key in openapi["paths"])
    token_parameter = openapi["components"]["parameters"]["RevealTokenCredential"]
    assert token_parameter["in"] == "header"
    assert token_parameter["required"] is True
    checks.append("Opaque Reveal token is mandatory; token UUID is not a credential")

    evidence = openapi["components"]["schemas"]["SubmitDeliveryEvidenceCommand"]
    required = set(evidence["required"])
    assert {
        "encounter_id",
        "recipient_party_id",
        "manifest_hash",
        "evidence_manifest_hash",
    } <= required
    conditional = json.dumps(evidence["allOf"], sort_keys=True)
    assert "established_delivery_at" in conditional and "SUFFICIENT" in conditional
    checks.append("Automatic delivery evidence binds recipient/context/time")
    return checks


def check_asyncapi(asyncapi: dict) -> list[str]:
    checks = []
    assert asyncapi["asyncapi"] == "3.0.0"
    resolve_local_refs(asyncapi)
    checks.append("AsyncAPI 3 parse and local refs")

    for name, channel in asyncapi["channels"].items():
        variables = set(re.findall(r"\{([^}]+)\}", channel["address"]))
        declared = set(channel.get("parameters", {}))
        assert variables == declared, f"{name}: {variables=} {declared=}"
    checks.append("All AsyncAPI address parameters are declared")

    events = set()
    for schema_name in (
        "PayerEventEnvelope",
        "ParticipationEventEnvelope",
        "IdentityAuthorityEventEnvelope",
        "LawfulBasisEventEnvelope",
        "PreviousContactEventEnvelope",
        "FinancialEventEnvelope",
        "RecordEventEnvelope",
        "EvidenceEventEnvelope",
        "DecisionEventEnvelope",
    ):
        events |= event_enum(asyncapi, schema_name)

    required_events = {
        "PAYER_ASSIGNED",
        "PAYER_RESOLUTION_REQUIRED",
        "PARTICIPATION_ACCEPTED",
        "PARTICIPATION_INVALIDATED",
        "IDENTITY_AUTHORITY_INVALIDATED",
        "LAWFUL_BASIS_INVALIDATED",
        "LAWFUL_BASIS_REVOKED",
        "PREVIOUS_CONTACT_DECISION_CHANGED",
        "PAYMENT_AUTHORIZATION_RELEASED",
        "CREDIT_APPLIED",
        "CREDIT_REVERSED",
        "REFUND_CONFIRMED",
        "FISCAL_CORRECTION_CONFIRMED",
        "SECOND_PARTY_REFUND_AND_FISCAL_CORRECTION_CONFIRMED",
        "SECOND_PARTY_FINANCIAL_EXPOSURE_CLEARED",
        "FINANCIAL_READINESS_INVALIDATED",
        "REVEAL_DELIVERY_CONFIRMED",
        "REVEAL_DELIVERY_UNCERTAIN",
        "DELIVERY_CONFIRMED_BY_DECISION",
        "NO_DELIVERY_CONFIRMED_BY_DECISION",
        "DISPUTE_REJECTED",
        "DISPUTE_UPHELD",
        "FINAL_SETTLEMENT_FISCALIZED",
    }
    missing = required_events - events
    assert not missing, f"missing canonical events: {sorted(missing)}"
    checks.append("Canonical owner/invalidation event set")

    schemas = asyncapi["components"]["schemas"]
    reason_expectations = {
        "PayerEventPayload": {
            "FIRST_VERIFIED_ACCEPTANCE",
            "PAYER_ASSIGNMENT_CHANGED",
            "CONCURRENT_ORDER_UNPROVABLE",
        },
        "ParticipationEventPayload": {
            "USER_REVOKED",
            "TERMS_VERSION_CHANGED",
            "PAYER_REACCEPTANCE_REQUIRED",
            "IDENTITY_AUTHORITY_CHANGED",
            "ACCEPTANCE_SUPERSEDED",
        },
        "IdentityAuthorityEventPayload": {
            "IDENTITY_INVALIDATED",
            "AUTHORITY_INVALIDATED",
            "AUTHORITY_EXPIRED",
        },
        "LawfulBasisEventPayload": {
            "INVALIDATED",
            "REVOKED",
            "EXPIRED",
            "PROCESSING_PURPOSE_CHANGED",
        },
        "PreviousContactEventPayload": {
            "DECISION_CREATED",
            "EVIDENCE_ADDED",
            "DECISION_REOPENED",
            "DECISION_INVALIDATED",
        },
        "FinancialEventPayload": {
            "PROVIDER_RECONCILIATION_MISMATCH",
            "KKT_OFD_RECONCILIATION_MISMATCH",
            "CREDIT_REVERSED",
            "SECOND_PARTY_EXPOSURE_CHANGED",
            "REFUND_AND_CORRECTION_COMPLETED",
        },
    }
    for schema_name, expected in reason_expectations.items():
        actual = set(schemas[schema_name]["properties"]["reason_code"]["enum"])
        assert expected <= actual, f"{schema_name}: missing {sorted(expected - actual)}"
    checks.append("Canonical invalidation reason-code coverage")

    decision = asyncapi["components"]["schemas"]["DecisionEventPayload"]
    conditional = json.dumps(decision["allOf"], sort_keys=True)
    assert "DELIVERY_CONFIRMED_BY_DECISION" in conditional
    assert "established_delivery_at" in conditional

    record = asyncapi["components"]["schemas"]["RecordEventEnvelope"]
    transitions = json.dumps(record["allOf"][1]["oneOf"], sort_keys=True)
    assert "REVEAL_DELIVERY_CONFIRMED" in transitions
    assert "DISCLOSURE_DISPUTED" in transitions
    checks.append("Typed Record transitions and decision delivery timestamp")
    return checks


def check_fixtures(fixtures: dict) -> list[str]:
    checks = []

    allowed_transitions = {
        ("REVEAL_DELIVERY_CONFIRMED", "REVEAL_COMMITTED", "REVEALED_ACTIVE"),
        (
            "DELIVERY_CONFIRMED_BY_DECISION",
            "DISCLOSURE_DISPUTED",
            "REVEALED_ACTIVE",
        ),
    }

    for case in fixtures["positive"]:
        if case["kind"] == "redeem_request":
            assert len(case["headers"]["Reveal-Token"]) >= 32
        elif case["kind"] == "record_transition":
            assert (
                case["event_type"],
                case["from_state"],
                case["to_state"],
            ) in allowed_transitions
            assert case.get("established_delivery_at")
        elif case["kind"] == "decision":
            assert (
                case["decision_type"],
                case["from_state"],
                case["to_state"],
            ) in allowed_transitions
            assert case.get("established_delivery_at")
        elif case["kind"] == "event":
            assert case["reason_code"]

    for case in fixtures["negative"]:
        if case["id"] == "token_id_without_secret":
            assert "Reveal-Token" not in case["headers"]
            assert case["expected_error"] == "LM-REVEAL-TOKEN-INVALID"
        elif case["kind"] in {"record_transition", "decision"}:
            event = case.get("event_type") or case.get("decision_type")
            transition = (event, case["from_state"], case["to_state"])
            valid = transition in allowed_transitions and bool(
                case.get("established_delivery_at")
            )
            assert not valid
            assert case["expected_error"] in {
                "LM-RECORD-TRANSITION-FORBIDDEN",
                "LM-REVEAL-EVIDENCE-INSUFFICIENT",
            }

    checks.append("Positive and negative security/state fixtures")
    return checks


def check_ddl(ddl: str) -> list[str]:
    checks = []
    required_fragments = (
        "create schema if not exists leasemind_security",
        "security definer\nset search_path = pg_catalog",
        "update leasemind_security.reveal_guard",
        "revoke all on function leasemind_security.bump_reveal_guard",
        "alter table source_reveal_lease force row level security",
        "create policy source_reveal_lease_owner_policy",
        "fk_introduction_record_committed_snapshot",
        "references reveal_gate_snapshot(reveal_gate_snapshot_id, introduction_record_id, encounter_id, manifest_hash)",
        "references reveal_token(reveal_token_id, introduction_record_id, encounter_id, reveal_gate_snapshot_id, recipient_party_id, manifest_hash)",
        "create trigger immutable_reveal_gate_snapshot",
        "create trigger immutable_reveal_attempt",
        "create trigger immutable_reveal_delivery_evidence",
        "create trigger immutable_decision_record",
    )
    for fragment in required_fragments:
        assert fragment in ddl, f"DDL invariant missing: {fragment}"
    checks.append("DDL composite integrity, RLS and immutability declarations")

    function_match = re.search(
        r"create function leasemind_security\.bump_reveal_guard\(.*?\n\$\$;",
        ddl,
        re.S,
    )
    assert function_match
    function_text = function_match.group(0)
    assert "search_path = pg_catalog, public" not in function_text
    assert " update reveal_guard" not in function_text
    checks.append("SECURITY DEFINER safe namespace")
    return checks


def check_markdown_extraction() -> list[str]:
    markdown = SOURCE_MD.read_text(encoding="utf-8")
    yaml_blocks = re.findall(r"```yaml\n(.*?)```", markdown, re.S)
    sql_blocks = re.findall(r"```sql\n(.*?)```", markdown, re.S)
    assert len(yaml_blocks) >= 3 and len(sql_blocks) == 1
    assert (ROOT / "openapi.yaml").read_text(encoding="utf-8") == yaml_blocks[1]
    assert (ROOT / "asyncapi.yaml").read_text(encoding="utf-8") == yaml_blocks[2]
    assert (
        ROOT / "migrations/001_matching_critical_chain.up.sql"
    ).read_text(encoding="utf-8") == sql_blocks[0]
    return ["Markdown and machine-readable contract files are byte-identical"]


def verify_manifest() -> list[str]:
    manifest = ROOT / "manifest.sha256"
    if not manifest.exists():
        return ["Hash manifest generation pending"]
    for line in manifest.read_text(encoding="utf-8").splitlines():
        digest, relative = line.split("  ", 1)
        path = ROOT / relative
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        assert actual == digest, f"hash mismatch: {relative}"
    return ["Content-addressed manifest integrity"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    checks: list[str] = []
    try:
        openapi = load_yaml(ROOT / "openapi.yaml")
        asyncapi = load_yaml(ROOT / "asyncapi.yaml")
        fixtures = load_yaml(ROOT / "fixtures/contract_cases.yaml")
        checks += check_openapi(openapi)
        checks += check_asyncapi(asyncapi)
        checks += check_fixtures(fixtures)
        checks += check_ddl(
            (ROOT / "migrations/001_matching_critical_chain.up.sql").read_text(
                encoding="utf-8"
            )
        )
        checks += check_markdown_extraction()
        checks += verify_manifest()
        status = "PASS"
        error = None
    except Exception as exc:
        status = "FAIL"
        error = f"{type(exc).__name__}: {exc}"

    report = {
        "suite": "LeaseMind Matching Data Contracts v1.0",
        "status": status,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "python": sys.version.split()[0],
        "pyyaml": yaml.__version__,
        "checks": checks,
        "postgresql_migration": "NOT_RUN_BY_STATIC_SUITE",
        "error": error,
    }
    output = json.dumps(report, ensure_ascii=False, indent=2)
    print(output)
    if args.report:
        args.report.write_text(output + "\n", encoding="utf-8")
    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
