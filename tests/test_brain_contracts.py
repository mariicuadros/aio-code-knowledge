"""Schema, vocabulary and cross-record regressions; only synthetic examples."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('brain_contracts',ROOT/'scripts/validate_brain.py')
brain=importlib.util.module_from_spec(spec);spec.loader.exec_module(brain)

class BrainContractsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema=brain.load_contracts()
        cls.example=json.loads((ROOT/'brain/contracts/examples.synthetic.json').read_text())
    def setUp(self): self.rows=copy.deepcopy(self.example)
    def validate(self):return brain.validate_records(self.rows,self.schema)
    def reject(self):
        with self.assertRaises(ValueError):self.validate()
    def test_seven_records_organization_profile(self):self.assertEqual(len(self.validate()),7)
    def test_duplicate_id(self):self.rows.append(copy.deepcopy(self.rows[0]));self.reject()
    def test_unknown_top_level_field(self):self.rows[0]['secret_token']='synthetic';self.reject()
    def test_missing_value_is_not_zero(self):self.rows[2]['metrics']['views']['state']='not_available';self.reject()
    def test_null_missing_value(self):self.rows[2]['metrics']['views'].update(state='not_available',value=None);self.validate()
    def test_nonfinite_and_boolean_metrics(self):
        for value in [True,float('nan'),float('inf'),-1]:
            self.rows[2]['metrics']['views']['value']=value;self.reject()
    def test_cyclic_lineage(self):self.rows[0]['parent_content_id']='TEST-CONTENT';self.reject()
    def test_unknown_content(self):self.rows[2]['content_id']='MISSING';self.reject()
    def test_timezone_required(self):self.rows[2]['captured_at']='2026-09-27T11:00:00';self.reject()
    def test_reversed_window(self):self.rows[2]['measurement_window']['end']='2026-09-26T10:00:00Z';self.reject()
    def test_platform_mismatch(self):self.rows[2]['platform']='other';self.reject()
    def test_genome_type_mismatch(self):self.rows[3]['content_type']='CANON';self.reject()
    def test_string_boolean_rejected(self):self.rows[3]['loop_design']='false';self.reject()
    def test_commerce_mismatch(self):self.rows[4]['status']='PAID';self.reject()
    def test_ready_without_rights_rejected(self):self.rows[4]['commercial_readiness']='PAIDREADY';self.reject()
    def test_required_disclosure_not_applicable(self):self.rows[5]['disclosure'].update(required='yes',status='not_applicable');self.reject()
    def test_findings_require_evidence(self):self.rows[6]['findings']=['Claim without observation'];self.reject()
    def test_conflicting_case_claim(self):self.rows[6].update(claims_supported=['TEST-CLAIM'],claims_not_supported=['TEST-CLAIM']);self.reject()
    def ready_bundle(self):
        commerce,rights=self.rows[4],self.rows[5]
        commerce.update(commercial_readiness='PAIDREADY',disclosure_required='no',approval_state='approved',rights_record_id='TEST-RIGHTS',reviewed_by='TEST-REVIEWER',reviewed_at='2026-09-27T11:00:00Z',evidence_refs=['synthetic'],usage={'term':'synthetic-term','territory':'synthetic-territory','channels':['test'],'paid_amplification':'allowed'})
        commerce['brand_presence']['authorization']='not_required'
        rights.update(review_status='reviewed',reviewed_by='TEST-REVIEWER',reviewed_at='2026-09-27T11:00:00Z')
        rights['asset_components']={k:'not_applicable' for k in rights['asset_components']}
        rights['permissions'].update(evidence_refs=['synthetic'],paid_use_allowed='allowed',scope='test',duration='test',territory='test',channels=['test'])
        rights['disclosure'].update(required='no',status='not_required')
        rights['ai_generation_or_alteration'].update(used='no',disclosure_required='no')
    def test_documented_readiness_passes(self):self.ready_bundle();self.validate()
    def test_placeholder_evidence_rejected(self):self.ready_bundle();self.rows[5]['permissions']['evidence_refs']=['unknown'];self.reject()
    def test_required_ai_disclosure_unmet(self):self.ready_bundle();self.rows[5]['ai_generation_or_alteration']['disclosure_required']='yes';self.reject()
    def test_paid_use_denied(self):self.ready_bundle();self.rows[5]['permissions']['paid_use_allowed']='denied';self.reject()
    def test_unknown_component_rights(self):self.ready_bundle();self.rows[5]['asset_components']['voice']='unknown';self.reject()

if __name__=='__main__':unittest.main()
