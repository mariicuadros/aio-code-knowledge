"""DAN-001 regression tests: reviewed Q/A without inferred ownership or homonym merges."""
import json
import unittest
from pathlib import Path

from rag.engine import build_index, ask
from rag.semantic import answer, supported_claim

ROOT = Path(__file__).resolve().parents[1]


class DanisanRagTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.commit, cls.passages = build_index()
        cls.policy = json.loads((ROOT / "rag/answer-policy-v1.json").read_text(encoding="utf-8"))

    def test_public_pasport_is_allowlisted_not_private_vault(self):
        manifest = json.loads((ROOT / "rag/corpus-manifest-v0.json").read_text(encoding="utf-8"))
        paths = [item["path"] for item in manifest["allowlist"]]
        self.assertIn("entity/ENTITY-PASSPORT-DANISAN.md", paths)
        self.assertEqual(len(paths), len(set(paths)))
        self.assertFalse(any("vault" in path.lower() or path.startswith("private/") for path in paths))
        dan = [p for p in self.passages if p.source_path == "entity/ENTITY-PASSPORT-DANISAN.md"]
        self.assertTrue(dan)
        self.assertTrue(all(p.visibility == "public" and p.canonical_or_historical == "canonical_current" for p in dan))
        self.assertTrue(any(p.section_or_record_locator == "Definition" and p.entity_id_or_null == "DAN-001" for p in dan))

    def test_danisan_reviewed_answers_are_cited_to_correct_section(self):
        claims = [c for c in self.policy["claims"] if c["claim_id"].startswith("DAN-")]
        self.assertEqual({c["claim_id"] for c in claims}, {"DAN-IDENTITY", "DAN-INDEPENDENCE", "DAN-DECLARED-INSTAGRAM", "DAN-AIO-RELATIONSHIP"})
        for claim in claims:
            for query in claim["queries"]:
                with self.subTest(claim=claim["claim_id"], query=query):
                    result = ask(query, self.passages)
                    self.assertEqual(result["status"], "supported_reviewed_answer")
                    cited = result["answer_decision"]["citations"]
                    self.assertEqual(len(cited), 1)
                    self.assertEqual(result["answer_decision"]["answer"], claim["answer"])
                    self.assertEqual(cited[0]["source_path"], "entity/ENTITY-PASSPORT-DANISAN.md")
                    self.assertEqual(cited[0]["section_or_record_locator"], claim["locator"])

    def test_danisan_homonyms_rights_and_unapproved_questions_abstain(self):
        suite = json.loads((ROOT / "rag/semantic-evaluation-v1.json").read_text(encoding="utf-8"))
        negatives = [c for c in suite["cases"] if c["case_id"].startswith("DAN-ABSTAIN-")]
        self.assertGreaterEqual(len(negatives), 8)
        for case in negatives:
            with self.subTest(id=case["case_id"]):
                result = ask(case["query"], self.passages)
                self.assertEqual(result["answer_decision"]["status"], "no_evidence")
        for q in ("¿DANISAN tiene un contrato legal verificado con AIO CODE?",
                  "¿DANISAN es la cantante homónima de Apple Music?"):
            self.assertIsNone(supported_claim(q, []))

    def test_original_reviewed_core_answers_stay_identical(self):
        suite = json.loads((ROOT / "rag/semantic-evaluation-v1.json").read_text(encoding="utf-8"))
        original = [c for c in suite["cases"] if c["case_id"].startswith("SUPPORTED-") or c["case_id"].startswith("OZCU-DECLARATION-")]
        self.assertTrue(original)
        for case in original:
            with self.subTest(case=case["case_id"]):
                decision = answer(case["query"], ask(case["query"], self.passages)["sources"])
                self.assertEqual(decision["status"], "supported_reviewed_answer")
                self.assertEqual(decision["answer"], case["answer"])


if __name__ == "__main__":
    unittest.main()
