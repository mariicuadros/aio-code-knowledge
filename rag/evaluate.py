"""Run the frozen 24-case retrieval check; never call this an AI baseline."""

import json
from pathlib import Path

from rag.engine import ROOT, build_index, search, ask
from rag.semantic import answer, supported_claim, validate_draft

def evaluate_semantic(passages):
    suite=json.loads((ROOT/'rag/semantic-evaluation-v1.json').read_text(encoding='utf-8'))
    policy=json.loads((ROOT/'rag/answer-policy-v1.json').read_text(encoding='utf-8'))
    results=[]
    for case in suite['cases']:
        sources=ask(case['query'],passages)['sources']
        decision=answer(case['query'],sources)
        correct=(decision['status']==case['expected'] and
                 (case['expected']=='no_evidence' or decision['answer']==case['answer']))
        results.append({'case_id':case['case_id'],'category':case['category'],'correct':correct,
                        'status':decision['status'],'retrieved_paths':[s['source_path'] for s in sources]})
    rejected=[]
    for case in suite['draft_rejections']:
        claim=next(c for c in policy['claims'] if c['claim_id']==case['claim_id'])
        sources=ask(claim['queries'][0],passages)['sources']
        support=supported_claim(claim['queries'][0],sources)
        # Ensure invalid drafts cite an actually supplied, supporting source ID.
        if not support:
            rejected.append(False)
            continue
        draft={'answer':case['answer'],'abstained':False,'citations':[str(support['source_index']+1)]}
        rejected.append(not validate_draft(claim['queries'][0],draft,sources))
    return {'mode':'finite_reviewed_assertions_no_live_generation',
            'query_count':len(results),'correct_query_count':sum(r['correct'] for r in results),
            'unsupported_draft_count':len(rejected),'rejected_unsupported_draft_count':sum(rejected),
            'live_generation_evaluated':False,
            'limitation':'Finite reviewed query/answer coverage. No general semantic entailment or model accuracy claim.',
            'results':results}


def evaluate(k: int = 5) -> dict:
    version, passages = build_index()
    suite = json.loads((ROOT / "rag/evaluation-v1.json").read_text(encoding="utf-8"))
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
            "results": results, 'semantic_policy':evaluate_semantic(passages)}


if __name__ == "__main__":
    report = evaluate()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["gold_source_hit_count"] != report["gold_source_question_count"]:
        raise SystemExit("Gold-source recall regressed; inspect the failing cases")
    semantic=report['semantic_policy']
    if (semantic['query_count'] != semantic['correct_query_count'] or
        semantic['unsupported_draft_count'] != semantic['rejected_unsupported_draft_count']):
        raise SystemExit('Reviewed answer/abstention policy regressed')
