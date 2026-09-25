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
        # Frozen baseline rows are summary records validated by the baseline schema.
        # Full raw observations live in observatory/runs/ and are validated below.
        check(bool(record["response_snapshot_or_ref"].strip()), "Frozen baseline record has no response snapshot")
        check(record["entity_id"] == baseline["primary_baseline_entity"], "Unexpected entity in frozen baseline")
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
    manifest = read("rag/corpus-manifest-v0.json")
    suite = read("rag/evaluation-v0.json")
    allowlist = [item["path"] for item in manifest["allowlist"]]
    check(len(allowlist) == len(set(allowlist)), "Duplicate approved RAG source")
    for path in allowlist:
        check((ROOT / path).is_file(), f"Missing approved RAG source: {path}")
    check(suite["corpus_manifest_ref"] == "rag/corpus-manifest-v0.json", "Incorrect RAG corpus ref")
    check(len(suite["cases"]) == len({case["case_id"] for case in suite["cases"]}), "Duplicate RAG question ID")
    for case in suite["cases"]:
        check(set(case["gold_source_paths"]).issubset(allowlist), f"Unapproved gold source: {case['case_id']}")
        check(set(case["relevant_claim_ids"]).issubset(claim_ids), f"Unknown gold claim: {case['case_id']}")
    baseline_plan = read("observatory/baseline-plan-v1.json")
    check(baseline_plan["prompt_registry_version"] == prompts["version"], "Baseline plan prompt version mismatch")
    intervention_files = sorted((ROOT / "observatory/interventions").glob("*.json"))
    known_interventions = {
        json.loads(path.read_text(encoding="utf-8"))["intervention_id"]
        for path in intervention_files
    }
    check(set(baseline_plan.get("prior_intervention_ids", [])).issubset(known_interventions), "Baseline plan references an unknown prior intervention ID")
    check(set(baseline_plan["prompt_ids"]).issubset(prompt_ids), "Unknown baseline prompt ID")
    check(baseline_plan["planned_pair_count"] == len(baseline_plan["systems"]) * len(baseline_plan["prompt_ids"]) * baseline_plan["repetitions_per_pair"], "Incorrect planned baseline denominator")
    for path in sorted((ROOT / "observatory/runs").glob("*.json")):
        record = read(str(path.relative_to(ROOT)))
        Draft202012Validator(obs_schema, format_checker=FormatChecker()).validate(record)
        check(record["prompt_id"] in prompt_ids, f"Unknown prompt ID: {path}")
        check(record["prompt_text"] == next(p["text"] for p in prompts["prompts"] if p["prompt_id"] == record["prompt_id"]), f"Prompt text changed: {path}")
        check(record["prompt_registry_version"] == prompts["version"], f"Prompt version changed: {path}")
        check(record["entity_id"] in nodes, f"Unknown observed entity: {path}")
    print(f"Public RAG corpus and {len(suite['cases'])} gold questions valid.")
    print("Canonical cross-references valid. Legacy ER-001 kept unchanged.")


if __name__ == "__main__":
    main()
