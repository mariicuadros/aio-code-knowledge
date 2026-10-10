import copy
from dataclasses import asdict, replace
import json
from pathlib import Path
import io
import unittest
import tempfile
from unittest.mock import patch

from rag.engine import Passage, TEMPORAL_STATES, search
from rag.semantic import answer, supported_claim, validate_draft
from rag.generate import generate

ROOT=Path(__file__).resolve().parents[1]
def passage(state='canonical_current',**kwargs):
    values=dict(text='Sentinel unique current identity',source_path='synthetic.md',section_or_record_locator='identity',
        source_url='https://example.invalid/synthetic',commit_sha='synthetic',document_version_or_unknown='unknown',
        entity_id_or_null=None,claim_ids_or_empty=[],published_at_or_unknown='unknown',visibility='public',
        evidence_state_or_not_applicable='not_applicable',canonical_or_historical=state)
    values.update(kwargs)
    return Passage(**values)

class RagSafetyTests(unittest.TestCase):
    def test_temporal_filter_all_states_and_private_sources(self):
        states=sorted(TEMPORAL_STATES|{'unrecognized'})
        for state in states:
            with self.subTest(state=state):
                self.assertEqual(bool(search('Sentinel',[passage(state)])),state=='canonical_current')
                self.assertEqual(bool(search('Sentinel',[passage(state)],scope='historical')),state in {'historical','superseded'})
        self.assertEqual(search('Sentinel',[passage(visibility='private')]),[])
        with self.assertRaises(ValueError):search('Sentinel',[passage()],scope='all')

    def test_real_query_and_draft_fixtures(self):
        from rag.engine import build_index
        from rag.evaluate import evaluate_semantic
        _,passages=build_index()
        report=evaluate_semantic(passages)
        self.assertEqual(report['query_count'],report['correct_query_count'],report['results'])
        self.assertEqual(report['unsupported_draft_count'],report['rejected_unsupported_draft_count'])

    def test_correct_quote_requires_current_correct_source_and_citation(self):
        policy=json.loads((ROOT/'rag/answer-policy-v1.json').read_text(encoding='utf-8'))
        claim=policy['claims'][0]; query=claim['queries'][0]
        support=asdict(passage(text=claim['required_fragments'][0],source_path=claim['source_path'],section_or_record_locator=claim['locator']))
        draft={'answer':claim['answer'],'abstained':False,'citations':['1']}
        self.assertTrue(validate_draft(query,draft,[support]))
        for key,value in [('source_path','unrelated.md'),('section_or_record_locator','wrong'),('canonical_or_historical','historical'),('text','AIO CODE unrelated hardware'),('visibility','private'),('evidence_state_or_not_applicable','unknown')]:
            with self.subTest(key=key):
                self.assertEqual(answer(query,[{**support,key:value}])['status'],'no_evidence')
                self.assertFalse(validate_draft(query,draft,[{**support,key:value}]))
        self.assertFalse(validate_draft(query,{**draft,'citations':['2']},[support,support|{'source_path':'unrelated.md'}]))
        self.assertFalse(validate_draft(query,{**draft,'answer':claim['answer']+' It guarantees indexing.'},[support]))
        self.assertFalse(validate_draft(query+' Confirm unrelated hardware.',draft,[support]))
        self.assertFalse(validate_draft(query,{**draft,'citations':[True]},[support]))

    def test_unsupported_query_never_calls_provider(self):
        with patch('rag.generate.urllib.request.urlopen',side_effect=AssertionError('Provider invoked')):
            self.assertEqual(generate('Is Marii Cuadros Mari Chordà?', [passage()])['status'],'no_evidence')

    def test_generation_adapter_rejects_unsupported_claim_with_valid_citation(self):
        import os
        policy=json.loads((ROOT/'rag/answer-policy-v1.json').read_text(encoding='utf-8'))
        claim=policy['claims'][0];query=claim['queries'][0]
        evidence=passage(text=claim['answer'],source_path=claim['source_path'],section_or_record_locator=claim['locator'])
        for text,expected in [(claim['answer'],'draft_requires_review'),('AIO CODE is hardware.','no_evidence')]:
            response={'choices':[{'message':{'content':json.dumps({'answer':text,'abstained':False,'citations':['1']})}}]}
            with patch.dict(os.environ,{'AI_GATEWAY_API_KEY':'test-only','AIO_RAG_MODEL':'mock'},clear=True), patch('rag.generate.urllib.request.urlopen',return_value=io.BytesIO(json.dumps(response).encode())):
                self.assertEqual(generate(query,[evidence])['status'],expected)

    def test_stale_index_same_count_or_citation_is_rejected(self):
        from scripts import build_public_rag
        original=json.loads(build_public_rag.OUTPUT.read_text(encoding='utf-8'))
        for key,value in [('text','tampered'),('canonical_or_historical','historical'),('source_url','https://example.invalid/wrong')]:
            with self.subTest(key=key), tempfile.TemporaryDirectory() as folder:
                changed=copy.deepcopy(original);changed['passages'][0][key]=value
                path=Path(folder)/'index.json';path.write_text(json.dumps(changed),encoding='utf-8')
                with patch.object(build_public_rag,'OUTPUT',path),patch('sys.argv',['build_public_rag.py','--check']),self.assertRaises(SystemExit):
                    build_public_rag.main()
