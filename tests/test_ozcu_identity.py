"""Founder adoption is distinct from legal or external identity validation."""
import copy
import json
from pathlib import Path
import unittest
from scripts.validate_entities import validate_ozcu_declaration, ld
from scripts.build_hf_entities import build_rows

ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))

class OzcuIdentityTests(unittest.TestCase):
    def setUp(self):
        self.args=[read('entity-graph.json'),(ROOT/'entity/ENTITY-PASSPORT-OZCU.md').read_text(encoding='utf-8'),[ld('index.html'),read('schemas/person-schema.json')['@graph'][1]],read('social-entity-map.json'),build_rows()]

    def test_current_declaration_across_graph_passport_jsonld_social_and_hf(self):
        validate_ozcu_declaration(*self.args)

    def test_missing_or_reversed_relations_are_rejected(self):
        for relation in [('MC-001','founder_of','OZCU-001'),('OZCU-001','develops','AIO-001')]:
            args=copy.deepcopy(self.args)
            args[0]['edges']=[e for e in args[0]['edges'] if (e['from'],e['relationship'],e['to'])!=relation]
            with self.subTest(relation=relation),self.assertRaises(AssertionError):validate_ozcu_declaration(*args)

    def test_legal_boundary_or_founder_mutation_is_rejected(self):
        args=copy.deepcopy(self.args);args[1]=args[1].replace('legal formalization is pending','legal formalization is complete').replace('Legal formalization is pending','Legal formalization is complete')
        with self.assertRaises(AssertionError):validate_ozcu_declaration(*args)
        args=copy.deepcopy(self.args);args[2][0]['contributor']['founder']['name']='Mari Chordà'
        with self.assertRaises(AssertionError):validate_ozcu_declaration(*args)

    def test_ozcu_unverified_accounts_are_rejected(self):
        args=copy.deepcopy(self.args);args[2][0]['contributor']['sameAs']=['https://example.invalid/unverified']
        with self.assertRaises(AssertionError):validate_ozcu_declaration(*args)

    def test_first_party_claims_have_provenance_without_verified_legal_status(self):
        claims={c['claim_id']:c for c in read('claim-ledger.json')['claims']}
        for claim_id in ['CLAIM-012','CLAIM-013','CLAIM-014']:
            c=claims[claim_id]
            self.assertEqual((c['entity_id'],c['claim_status'],c['evidence_state']),('OZCU-001','active','observed'))
            self.assertIsNone(c['verification_rule_id'])
            for ref in c['evidence_refs']:self.assertTrue((ROOT/ref).is_file())

    def test_current_sources_have_no_reserve_role_and_confusables_stay_external(self):
        paths=['README.md','ENTITY-MASTER-RECORD.md','AIO-CODE-SYSTEM-SPEC-v2.md','brain/AIO-CODE-BRAIN-v1.md','data-export/README.md','entities/aio-code/README.md','governance/IP-AND-CONTENT-RECOVERY-v1.md','entity/ENTITY-PASSPORT-OZCU.md','entity/ENTITY-PASSPORT-AIO-CODE.md','entity/ENTITY-PASSPORT-VOID-MODE.md','index.html','entity-graph.json','social-entity-map.json','rag/answer-policy-v1.json']
        for path in paths:
            with self.subTest(path=path):self.assertNotRegex((ROOT/path).read_text(encoding='utf-8'),r'(?i)\breserve\b|fallback corporate|empresa de reserva')
        graph=read('entity-graph.json')
        self.assertEqual(len(graph['nodes']),5)
        for c in read('identity/confusable-entities.json')['records']:
            self.assertEqual(c['relation_to_mc001'],'not_same_entity')
            self.assertNotIn(c['observed_label'],json.dumps(graph,ensure_ascii=False))

if __name__=='__main__':unittest.main()
