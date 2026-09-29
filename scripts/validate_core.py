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
    ("schemas/public-assets-v1.schema.json", "public-assets-v1.json"),
    ("commerce/commerce-register-v1.schema.json", "commerce/commerce-register-v1.json"),
    ("schemas/semantic-search-map-v1.schema.json", "semantic/search-map-v1.json"),
)


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    for path in ROOT.rglob("*.json"):
        if any(part in {"node_modules", ".git", ".venv", "hf-export", "hf-journal-export"} for part in path.relative_to(ROOT).parts):
            continue
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
    check(nodes["AIO-001"]["entity_type"] == "DigitalEntityOperatingSystem", "AIO-001 canonical type mismatch")
    public_assets = read("public-assets-v1.json")["assets"]
    expected_platforms = {"Bilibili", "YouTube", "Instagram", "Facebook", "Threads", "X", "Bluesky",
                          "TikTok", "Reddit", "Quora", "Medium", "Substack", "Blogger", "Vercel",
                          "Spotify", "Pinterest", "GitHub", "Hugging Face"}
    check({item["platform"] for item in public_assets} == expected_platforms,
          "Public asset inventory differs from the eighteen requested categories")
    check(len({item["asset_id"] for item in public_assets}) == 18, "Duplicate public asset ID")
    social_map = read("social-entity-map.json")
    check(social_map["public_asset_inventory_ref"] == "public-assets-v1.json"
          and {item["platform"] for item in social_map["asset_categories"]} == expected_platforms,
          "Social entity map inventory coverage mismatch")
    person_graph = read("schemas/person-schema.json")["@graph"]
    person, system = person_graph
    mc_same = set(person["sameAs"])
    aio_same = set(system["sameAs"])
    check(len(person["sameAs"]) == len(mc_same) and len(system["sameAs"]) == len(aio_same),
          "Duplicate sameAs identity URL")
    expected_mc_same = set()
    for item in public_assets:
        check(set(item["entity_ids"]).issubset({"MC-001", "AIO-001"}), "Unknown public asset entity")
        check(set(item["same_as_entity_ids"]).issubset(set(item["entity_ids"])),
              f"sameAs asserts an unrelated entity: {item['asset_id']}")
        if "MC-001" in item["same_as_entity_ids"]:
            expected_mc_same.add(item["urls"][1] if item["platform"] in {"GitHub", "Hugging Face"}
                                 else item["urls"][0])
    check(mc_same == expected_mc_same, "Person sameAs differs from canonical public asset inventory")
    check(aio_same == {"https://www.instagram.com/aiocode_/"},
          "AIO CODE sameAs must contain only its distinct entity profile")
    for entity_id in ("MC-001", "AIO-001"):
        registry = read(f"entity/content/{entity_id}/platforms.json")
        check(registry["public_asset_inventory_ref"] == "public-assets-v1.json", "Missing inventory ref")
        names = {entry["platform_name"] for entry in registry["platforms"]}
        check({item["platform"] for item in public_assets if entity_id in item["entity_ids"]}.issubset(names),
              f"Platform registry missing a public asset for {entity_id}")
    relationship_ids = [edge["relationship_id"] for edge in graph["edges"]]
    check(len(relationship_ids) == len(set(relationship_ids)), "Duplicate relationship_id")
    for node in nodes.values():
        for key in ("passport", "content_registry", "platform_registry"):
            if key in node:
                check((ROOT / node[key]).is_file(), f"Missing entity {key}: {node[key]}")
    for edge in graph["edges"]:
        check((ROOT / edge["source_ref"]).is_file(), f"Missing relationship source: {edge['source_ref']}")
        check(edge["from"] in nodes and edge["to"] in nodes, "Relationship references an unknown entity")
    claim_ids = [item["claim_id"] for item in claims["claims"]]
    check(len(claim_ids) == len(set(claim_ids)), "Duplicate claim_id")
    current_system = next((item for item in claims["claims"] if item["claim_id"] == "CLAIM-010"), None)
    old_method = next((item for item in claims["claims"] if item["claim_id"] == "CLAIM-007"), None)
    check(current_system is not None and current_system["entity_id"] == "AIO-001"
          and current_system["claim_status"] == "active", "Missing active phase-2 AIO-001 definition")
    check(old_method is not None and old_method["claim_status"] == "superseded",
          "Historical top-level methodology claim must not remain active")
    for item in claims["claims"]:
        check(item["entity_id"] in nodes, "Claim references an unknown entity")
        for ref in [item["source_ref"], *item["evidence_refs"]]:
            check((ROOT / ref).is_file(), f"Claim source/evidence path missing: {ref}")
    manifest = read("rag/corpus-manifest-v0.json")
    suite = read("rag/evaluation-v1.json")
    baseline_plan = read("observatory/baseline-plan-v1.json")
    allowlist = [item["path"] for item in manifest["allowlist"]]
    check(len(allowlist) == len(set(allowlist)), "Duplicate approved RAG source")
    for path in allowlist:
        check((ROOT / path).is_file(), f"Missing approved RAG source: {path}")
    check(suite["corpus_manifest_ref"] == "rag/corpus-manifest-v0.json", "Incorrect RAG corpus ref")
    check(len(suite["cases"]) == len({case["case_id"] for case in suite["cases"]}), "Duplicate RAG question ID")
    for case in suite["cases"]:
        check(set(case["gold_source_paths"]).issubset(allowlist), f"Unapproved gold source: {case['case_id']}")
        check(set(case["relevant_claim_ids"]).issubset(claim_ids), f"Unknown gold claim: {case['case_id']}")
    # Volatile gold expectations must track the canonical records. Retrieval recall alone
    # cannot detect a stale answer key; these checks do not grade generated answers.
    cases = {case["case_id"]: case for case in suite["cases"]}
    entity_answer = cases["RAG-Q-03"]["expected_fact_or_boundary"]
    registry = read("security/account-registry/accounts.json")
    registry_nodes = {entry["entity_id"]: entry for entry in registry["entities"]}
    check(set(registry_nodes) == set(nodes), "Security registry canonical entity set differs from graph")
    check(len(registry_nodes) == len(registry["entities"]), "Duplicate security registry entity")
    for entity_id, node in nodes.items():
        check(registry_nodes[entity_id]["entity_name"] == node["canonical_name"]
              and registry_nodes[entity_id]["entity_type"] == node["entity_type"],
              f"Security registry disagrees with graph: {entity_id}")
        check(entity_id in entity_answer, f"RAG-Q-03 omits {entity_id}")
    check(f"Cinco entidades canónicas" in entity_answer and len(nodes) == 5,
          "RAG-Q-03 count differs from canonical graph; review the gold answer")
    for representation in registry["representations"]:
        check(representation["representation_id"] not in nodes
              and representation["represents_entity_id"] in nodes,
              "Security representation must reference a canonical entity without becoming one")
    check(nodes["AIO-001"]["entity_type"] in cases["RAG-Q-04"]["expected_fact_or_boundary"]
          and nodes["AIO-001"]["entity_type"] in cases["RAG-Q-07"]["expected_fact_or_boundary"],
          "RAG gold system type differs from canonical graph")
    check("creator_of" in cases["RAG-Q-07"]["expected_fact_or_boundary"],
          "RAG-Q-07 must state the canonical person-system relationship")
    baseline_answer = cases["RAG-Q-15"]["expected_fact_or_boundary"]
    check(f"freeze.status={baseline['freeze']['status']}" in baseline_answer
          and str(len(baseline["records"])) in baseline_answer
          and str(baseline_plan["planned_pair_count"]) in baseline_answer,
          "RAG-Q-15 gold answer differs from baseline status/coverage")
    current_docs = ["TECHNICAL-KNOWLEDGE-BASE.md", "index.html",
                    "observatory/OZCU-POST-INTERVENTION-v1.md"]
    for path in current_docs:
        content = (ROOT / path).read_text(encoding="utf-8")
        check("Digital Entity Operating System" in content, f"Current system definition missing: {path}")
    check("AIO CODE is a methodology" not in (ROOT / current_docs[0]).read_text(encoding="utf-8"),
          "Technical knowledge base reverts to methodology as top-level type")
    semantic_map = read("semantic/search-map-v1.json")
    query_ids = [item["query_id"] for item in semantic_map["questions"]]
    check(len(query_ids) == len(set(query_ids)), "Duplicate semantic query ID")
    for item in semantic_map["questions"]:
        check(bool(item["linked_entities"]), f"Semantic query has no entity link: {item['query_id']}")
        check(set(item["linked_entities"]).issubset(nodes), f"Unknown semantic entity: {item['query_id']}")
        for ref in item["evidence_refs"]:
            check((ROOT / ref).is_file(), f"Semantic query source missing: {ref}")

    commerce = read("commerce/commerce-register-v1.json")
    asset_ids = [item["asset_id"] for item in commerce["records"]]
    check(len(asset_ids) == len(set(asset_ids)), "Duplicate commerce asset_id")
    check(set(commerce["entity_ids"]).issubset(nodes), "Unknown commerce registry entity")
    for item in commerce["records"]:
        for key in ("creator_entity", "creator_or_curator_entity"):
            if key in item:
                check(item[key] in nodes, f"Unknown commerce creator: {item[key]}")
        if item["commercial_status"] == "PAID":
            check(item["rights_state"] == "cleared", f"PAID asset has unresolved rights: {item['asset_id']}")
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
    for path in sorted((ROOT / "observatory/snapshots").glob("*.json")):
        record = read(str(path.relative_to(ROOT)))
        Draft202012Validator(obs_schema, format_checker=FormatChecker()).validate(record)
        check(record["entity_id"] in nodes, f"Unknown snapshot entity: {path}")
        check(record["evidence_state"] == "observed", f"Snapshot must describe an observed output: {path}")
        check(record["evaluation"].get("exact_registry_repetition") is False, f"Variant snapshot misrepresented as controlled run: {path}")
        check(record["prompt_id"] in prompt_ids, f"Unknown snapshot reference prompt: {path}")
        check(set(record["related_intervention_ids"]).issubset(known_interventions), f"Unknown snapshot intervention: {path}")
    print(f"Public RAG corpus and {len(suite['cases'])} gold questions valid.")
    print("Canonical cross-references valid. Legacy ER-001 kept unchanged.")


if __name__ == "__main__":
    main()
