"""Freeze a measured baseline only when every planned run is accounted for."""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]


def prepare_freeze() -> dict:
    plan = json.loads((ROOT / "observatory/baseline-plan-v1.json").read_text(encoding="utf-8"))
    baseline_path = ROOT / "ai-social-baseline.json"
    baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
    if baseline["freeze"]["status"] != "not_frozen" or baseline["records"]:
        raise ValueError("Baseline already contains results or is frozen; never overwrite it")
    schema = json.loads((ROOT / "observatory/observation-schema.json").read_text(encoding="utf-8"))
    prompts = json.loads((ROOT / "prompt-registry-v1.json").read_text(encoding="utf-8"))
    by_id = {p["prompt_id"]: p for p in prompts["prompts"]}
    expected = {(s, p) for s in plan["systems"] for p in plan["prompt_ids"]}
    runs = {}
    for file in sorted((ROOT / "observatory/runs").glob("*.json")):
        row = json.loads(file.read_text(encoding="utf-8"))
        if row["research_window_id"] != plan["research_window_id"]:
            continue
        Draft202012Validator(schema, format_checker=FormatChecker()).validate(row)
        pair = (row["system"], row["prompt_id"])
        if pair not in expected or pair in runs:
            raise ValueError(f"Unexpected or duplicated baseline pair: {pair}")
        if row["entity_id"] != plan["entity_id"] or row["context_condition"] != plan["required_context_condition"]:
            raise ValueError(f"Incorrect entity/context in {file}")
        if row["prompt_text"] != by_id[row["prompt_id"]]["text"] or row["prompt_registry_version"] != prompts["version"]:
            raise ValueError(f"Prompt changed in {file}")
        if not row["observed_result"].strip() or row["evaluation"].get("entity_resolution") not in (0, 1, 2) or row["evaluation"].get("citation_quality") not in (0, 1, 2):
            raise ValueError(f"Raw answer or minimum manual evaluation missing in {file}")
        runs[pair] = row
    declared_missing = {}
    for item in plan["missing_runs"]:
        pair = (item["system"], item["prompt_id"])
        if pair not in expected or not item.get("reason") or pair in declared_missing:
            raise ValueError(f"Invalid declared missing pair: {pair}")
        declared_missing[pair] = item["reason"]
    if set(runs) & set(declared_missing) or set(runs) | set(declared_missing) != expected:
        raise ValueError("Every planned pair must be observed or explicitly declared missing")
    if not runs:
        raise ValueError("No empirical runs; cannot freeze an empty baseline")
    now = datetime.now(timezone.utc)
    baseline["records"] = [
        {key: row[key] for key in ("observation_id", "timestamp", "entity_id", "system", "prompt_id", "prompt_registry_version", "response_snapshot_or_ref")}
        for _, row in sorted(runs.items())
    ]
    baseline["freeze"].update(status="frozen", frozen_at=now.isoformat(),
                              freeze_id=plan["research_window_id"] + "-" + now.strftime("%Y%m%d"))
    baseline["updated"] = now.date().isoformat()
    baseline["important_note"] = f"Empirical snapshot: {len(runs)}/{len(expected)} planned pairs observed; {len(declared_missing)} explicitly missing. No causal or stability claim."
    baseline["coverage"] = {"plan_id": plan["plan_id"], "planned_pairs": len(expected),
                            "observed_pairs": len(runs), "missing_pairs": [
                                {"system": s, "prompt_id": p, "reason": reason}
                                for (s, p), reason in sorted(declared_missing.items())]}
    schema_baseline = json.loads((ROOT / "schemas/ai-social-baseline-schema.json").read_text(encoding="utf-8"))
    Draft202012Validator(schema_baseline, format_checker=FormatChecker()).validate(baseline)
    return baseline


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="Write the frozen baseline after the checks pass")
    args = parser.parse_args()
    baseline = prepare_freeze()
    if args.write:
        (ROOT / "ai-social-baseline.json").write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"freeze": baseline["freeze"], "coverage": baseline["coverage"], "written": args.write}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
