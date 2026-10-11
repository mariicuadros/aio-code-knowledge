import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class LegalRightsLayerTests(unittest.TestCase):
    def test_public_registry_contains_no_obvious_sensitive_fields(self):
        data=json.loads((ROOT/"legal/rights-registry.json").read_text(encoding="utf-8"))
        forbidden={"date_of_birth","birth_date","government_id","document_number","email","phone","address","signature","ip_address"}
        def walk(v):
            if isinstance(v,dict):
                for k,x in v.items():
                    self.assertNotIn(k,forbidden)
                    walk(x)
            elif isinstance(v,list):
                for x in v: walk(x)
        walk(data)

    def test_pending_signature_does_not_assert_authorization(self):
        data=json.loads((ROOT/"legal/rights-registry.json").read_text(encoding="utf-8"))
        for r in data["records"]:
            if r["execution_status"]=="prepared_pending_signature":
                self.assertFalse(r["private_evidence_on_file"])
                self.assertIsNone(r["executed_at"])
                self.assertIsNone(r["document_hash_sha256"])
                self.assertNotIn("allowed", set(r["scopes"].values()))

    def test_participant_record_disclaims_employment_and_agency(self):
        data=json.loads((ROOT/"legal/rights-registry.json").read_text(encoding="utf-8"))
        rec=next(x for x in data["records"] if x["subject_id"]=="DANISAN-001")
        text=" ".join(rec["non_relationship_claims"]).lower()
        self.assertIn("employment",text)
        self.assertIn("partnership",text)
        self.assertIn("agency",text)

if __name__=="__main__":
    unittest.main()
