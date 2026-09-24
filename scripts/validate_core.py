"""Validate canonical AIO CODE data before publishing an export.

Install dependency with: python -m pip install 'jsonschema>=4.23,<5'
Run from repository root: python scripts/validate_core.py
Historical ER-001 retains its original legacy record and is intentionally excluded
from the current benchmark-observation schema.
"""

import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
PAIRS = (
    ("schemas/claim-ledger-schema.json", "claim-ledger.json"),
    ("schemas/ai-social-baseline-schema.json", "ai-social-baseline.json"),
    ("schemas/entity-graph-schema.json", "entity-graph.json"),
    ("schemas/social-entity-map-schema.json", "social-entity-map.json"),
)


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    for path in ROOT.rglob("*.json"):
        json.loads(path.read_text(encoding="utf-8"))

    for schema_path, data_path in PAIRS:
        schema, data = read(schema_path), read(data_path)
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema, format_checker=FormatChecker()).validate(data)
        print(f"Valid: {data_path}")

    obs_schema = read("observatory/observation-schema.json")
    Draft202012Validator.check_schema(obs_schema)
    baseline = read("ai-social-baseline.json")
    prompts = read("prompt-registry-v1.json")
    graph = read("entity-graph.json")
    claims = read("claim-ledger.json")

    prompt_ids = [entry["prompt_id"] for entry in prompts["prompts"]]
    check(len(prompt_ids) == len(set(prompt_ids)), "Duplicate prompt_id")
    check(baseline["prompt_registry_version"] == prompts["version"], "Prompt Registry version mismatch")
    if baseline["freeze"]["status"] == "frozen":
        check(bool(baseline["records"]), "Frozen baseline has no records")
    for record in baseline["records"]:
        Draft202012Validator(obs_schema, format_checker=FormatChecker()).validate(record)
        check(record["prompt_id"] in prompt_ids, "Unknown prompt_id in baseline")
        check(record["prompt_registry_version"] == prompts["version"], "Prompt version mismatch in baseline")

    nodes = {node["entity_id"]: node for node in graph["nodes"]}
    check(len(nodes) == len(graph["nodes"]), "Duplicate entity_id")
    check(nodes["AIO-001"]["entity_type"] == "ResearchMethodology", "AIO-001 canonical type mismatch")
    for edge in graph["edges"]:
        check(edge["from"] in nodes and edge["to"] in nodes, "Relationship references an unknown entity")
    claim_ids = [item["claim_id"] for item in claims["claims"]]
    check(len(claim_ids) == len(set(claim_ids)), "Duplicate claim_id")
    for item in claims["claims"]:
        check(item["entity_id"] in nodes, "Claim references an unknown entity")
        for ref in [item["source_ref"], *item["evidence_refs"]]:
            check((ROOT / ref).is_file(), f"Claim source/evidence path missing: {ref}")
    print("Canonical cross-references valid. Legacy ER-001 kept unchanged.")


if __name__ == "__main__":
    main()
