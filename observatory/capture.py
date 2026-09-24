"""Capture one externally observed response without inventing its evaluation."""

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def make_record(args, response: str) -> dict:
    registry = json.loads((ROOT / "prompt-registry-v1.json").read_text(encoding="utf-8"))
    prompts = {p["prompt_id"]: p for p in registry["prompts"]}
    if args.prompt_id not in prompts:
        raise ValueError("Unknown frozen prompt ID")
    if args.entity_id not in {"MC-001", "NUX-001", "AIO-001"}:
        raise ValueError("Entity not in the canonical primary set")
    if not response.strip():
        raise ValueError("Raw response cannot be empty")
    if not re.fullmatch(r"[A-Za-z0-9-]+", args.system):
        raise ValueError("System slug must be alphanumeric or hyphenated")
    timestamp = datetime.now(timezone.utc).isoformat()
    observation_id = "OBS-" + args.system.upper() + "-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    prompt = prompts[args.prompt_id]
    return {
        "observation_id": observation_id, "timestamp": timestamp,
        "entity_id": args.entity_id, "system": args.system,
        "system_interface_or_model_if_visible": args.interface,
        "prompt_id": args.prompt_id, "prompt_registry_version": registry["version"],
        "prompt_text": prompt["text"], "language": prompt["language"],
        "country_or_location_context_if_relevant": args.location,
        "logged_in_state": args.login_state, "context_condition": args.context,
        "browsing_or_search_state_if_visible": args.search_state,
        "observed_result": response,
        "response_snapshot_or_ref": f"observatory/runs/{observation_id}.json#observed_result",
        "sources_or_citations": args.citation or [], "stage": args.stage,
        "evaluation": {}, "evidence_state": "observed",
        "research_window_id": args.window, "related_intervention_ids": [], "confounder_ids": [],
        "status": "under_observation",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Record one raw Observatory result; manual evaluation follows")
    parser.add_argument("--system", required=True, help="System slug, e.g. chatgpt-web")
    parser.add_argument("--interface", default=None, help="Visible model/interface, or omit if unknown")
    parser.add_argument("--entity-id", required=True)
    parser.add_argument("--prompt-id", required=True)
    parser.add_argument("--response-file", required=True, type=Path)
    parser.add_argument("--window", required=True)
    parser.add_argument("--login-state", required=True, choices=["logged_in", "logged_out", "unknown"])
    parser.add_argument("--context", required=True, choices=["fresh_context", "contextual", "incognito_or_private", "unknown_context"])
    parser.add_argument("--search-state", required=True, choices=["enabled", "disabled", "unknown"])
    parser.add_argument("--stage", default="Entity Representation", choices=["Indexation", "Retrieval", "Entity Resolution", "Entity Representation", "Citation", "Recommendation", "Unknown"])
    parser.add_argument("--citation", action="append", help="Cited URL, repeated for multiple citations")
    parser.add_argument("--location", default=None)
    args = parser.parse_args()
    record = make_record(args, args.response_file.read_text(encoding="utf-8"))
    destination = ROOT / "observatory/runs" / (record["observation_id"] + ".json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("x", encoding="utf-8") as output:
        json.dump(record, output, ensure_ascii=False, indent=2)
        output.write("\n")
    print(destination.relative_to(ROOT))


if __name__ == "__main__":
    main()
