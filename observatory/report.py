"""Descriptive report from validated recorded observations, never invented data."""

import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIMENSIONS = ("entity_resolution", "disambiguation", "identity_accuracy", "relationship_accuracy", "citation_quality")


def summarize() -> dict:
    baseline = json.loads((ROOT / "ai-social-baseline.json").read_text(encoding="utf-8"))
    plan = json.loads((ROOT / "observatory/baseline-plan-v1.json").read_text(encoding="utf-8"))
    records = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "observatory/runs").glob("*.json"))]
    groups = defaultdict(list)
    for row in records:
        groups[row["system"]].append(row)
    systems = {}
    for system, rows in sorted(groups.items()):
        dimensions = {}
        for dimension in DIMENSIONS:
            observed = [r["evaluation"].get(dimension) for r in rows if r["evaluation"].get(dimension) in (0, 1, 2)]
            dimensions[dimension] = {"rated_runs": len(observed), "grade_counts": dict(Counter(observed))} if observed else {"rated_runs": 0, "grade_counts": {}}
        systems[system] = {"observation_count": len(rows), "dimensions": dimensions}
    planned = {(system, prompt) for system in plan["systems"] for prompt in plan["prompt_ids"]}
    observed = {(r["system"], r["prompt_id"]) for r in records if r["research_window_id"] == plan["research_window_id"]}
    missing = sorted(planned - observed)
    return {"report_type": "descriptive_observatory_profile", "baseline_status": baseline["freeze"]["status"],
            "baseline_record_count": len(baseline["records"]), "captured_run_count": len(records),
            "planned_baseline_pairs": plan["planned_pair_count"], "observed_baseline_pairs": len(planned & observed),
            "missing_baseline_pairs": [{"system": s, "prompt_id": p} for s, p in missing],
            "systems": systems,
            "limitations": ["Captured responses are not automatically benchmark-ready or a frozen baseline.",
                            "An empty evaluation is not a zero score.",
                            "External system internals and unexposed retrieval traces are unknown.",
                            "No global AIO Score or causal intervention effect is computed."]}


if __name__ == "__main__":
    print(json.dumps(summarize(), ensure_ascii=False, indent=2))
