"""Run the frozen 24-case retrieval check; never call this an AI baseline."""

import json
from pathlib import Path

from rag.engine import ROOT, build_index, search


def evaluate(k: int = 5) -> dict:
    version, passages = build_index()
    suite = json.loads((ROOT / "rag/evaluation-v0.json").read_text(encoding="utf-8"))
    results = []
    for case in suite["cases"]:
        hits = search(case["query"], passages, k)
        expected = set(case["gold_source_paths"])
        matched = sorted(expected & {x["source_path"] for x in hits})
        results.append({"case_id": case["case_id"], "expected_behavior": case["expected_behavior"],
                        "gold_source_retrieved": bool(matched) if expected else None,
                        "matching_paths": matched,
                        "retrieved_paths": [x["source_path"] for x in hits]})
    scored = [x for x in results if x["gold_source_retrieved"] is not None]
    return {"index_commit": version, "k": k, "question_count": len(results),
            "gold_source_hit_count": sum(x["gold_source_retrieved"] for x in scored),
            "gold_source_question_count": len(scored),
            "note": "Source hit is not answer correctness, citation accuracy, or external AI recognition.",
            "results": results}


if __name__ == "__main__":
    report = evaluate()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["gold_source_hit_count"] != report["gold_source_question_count"]:
        raise SystemExit("Gold-source recall regressed; inspect the failing cases")
