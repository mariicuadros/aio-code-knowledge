"""Conservative reviewed-answer policy; no general semantic-entailment claims.

Only reviewed queries/answers with exact supporting current passages are eligible.
Lexical overlap or a valid citation ID alone never authorizes an assertion.
"""
import json
import re
import unicodedata
from pathlib import Path

POLICY = Path(__file__).with_name('answer-policy-v1.json')

def normalize(value):
    folded = unicodedata.normalize('NFKD', value.lower())
    return ' '.join(re.findall(r'[a-z0-9]+', ''.join(c for c in folded if not unicodedata.combining(c))))

def supported_claim(query, sources):
    policy = json.loads(POLICY.read_text(encoding='utf-8'))
    for claim in policy['claims']:
        if normalize(query) not in {normalize(q) for q in claim['queries']}:
            continue
        for i, source in enumerate(sources):
            if (source.get('canonical_or_historical') == 'canonical_current'
                and source.get('visibility') == 'public'
                and source.get('evidence_state_or_not_applicable') in {'not_applicable','observed','corroborated','verified'}
                and source.get('source_path') == claim['source_path']
                and source.get('section_or_record_locator') == claim['locator']
                and all(fragment in source.get('text','') for fragment in claim['required_fragments'])):
                return {**claim, 'source_index': i}
    return None

def answer(query, sources):
    claim = supported_claim(query, sources)
    if not claim:
        return {'status':'no_evidence','answer':'No hay evidencia suficiente','citations':[],
                'reason':'No reviewed assertion supported by current supplied evidence'}
    source = sources[claim['source_index']]
    return {'status':'supported_reviewed_answer','answer':claim['answer'],
            'claim_id':claim['claim_id'],'citations':[source],
            'scope':'Reviewed first-party statement; not independent external verification'}

def select_answer_sources(query, candidates, corpus, limit=5):
    """Route reviewed queries to exact source/section, then add lexical candidates.

    This separate answer context is not the lexical recall@5 benchmark.
    """
    claim=supported_claim(query,corpus)
    if not claim: return candidates[:limit]
    supporting=corpus[claim['source_index']]
    key=lambda p:(p['source_path'],p['section_or_record_locator'])
    return [supporting]+[p for p in candidates if key(p)!=key(supporting)][:limit-1]

def validate_draft(query, draft, sources):
    claim = supported_claim(query, sources)
    if not claim or not isinstance(draft,dict) or draft.get('abstained') is not False:
        return False
    cited = draft.get('citations')
    return (draft.get('answer') == claim['answer'] and isinstance(cited,list) and bool(cited)
            and all(isinstance(i,str) and i.isdigit() and 1 <= int(i) <= len(sources) for i in cited)
            and {int(i)-1 for i in cited} == {claim['source_index']})
