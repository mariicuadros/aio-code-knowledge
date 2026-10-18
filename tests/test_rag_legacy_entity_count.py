"""Issue #45: preserve legacy five-entity evidence without presenting it as current."""
import json
import unittest
from pathlib import Path

from rag.engine import build_index, eligible, search

ROOT = Path(__file__).resolve().parents[1]
LEGACY = "ENTITY-MASTER-RECORD.md"
OLD_SECTIONS = {"2. Canonical Entity Set", "15. Related Documents"}


class HistoricalEntityCountTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.passages = build_index()
        cls.index = json.loads((ROOT / "rag/public-index-v0.json").read_text(encoding="utf-8"))

    def test_original_snapshot_unchanged_and_graph_now_has_six(self):
        source = (ROOT / LEGACY).read_text(encoding="utf-8")
        self.assertIn("contains five distinct entities", source)
        graph = json.loads((ROOT / "entity-graph.json").read_text(encoding="utf-8"))
        self.assertEqual(len(graph["nodes"]), 6)
        self.assertIn("DAN-001", {n["entity_id"] for n in graph["nodes"]})

    def test_both_obsolete_passages_explicitly_superseded(self):
        observed = {p.section_or_record_locator: p for p in self.passages
                    if p.source_path == LEGACY and p.section_or_record_locator in OLD_SECTIONS}
        self.assertEqual(set(observed), OLD_SECTIONS)
        for locator, passage in observed.items():
            with self.subTest(locator=locator):
                self.assertEqual(passage.canonical_or_historical, "superseded")
                self.assertFalse(eligible(passage, "current"))
                self.assertTrue(eligible(passage, "historical"))
        generated = {p["section_or_record_locator"]: p for p in self.index["passages"]
                     if p["source_path"] == LEGACY and p["section_or_record_locator"] in OLD_SECTIONS}
        self.assertEqual(set(generated), OLD_SECTIONS)
        self.assertTrue(all(p["canonical_or_historical"] == "superseded" for p in generated.values()))

    def test_current_scope_does_not_retrieve_old_five_entity_claim(self):
        for q in ("five distinct entities", "current canonical entity set", "OZCU-001 MC-001 AIO-001"):
            with self.subTest(query=q):
                found = search(q, self.passages, limit=20, scope="current")
                self.assertFalse(any(p["source_path"] == LEGACY and p["section_or_record_locator"] in OLD_SECTIONS for p in found))
        history = search("five distinct entities", self.passages, scope="historical", limit=20)
        self.assertTrue(any(p["source_path"] == LEGACY and p["section_or_record_locator"] == "2. Canonical Entity Set" for p in history))

    def test_overrides_exactly_target_old_passages(self):
        manifest = json.loads((ROOT / "rag/corpus-manifest-v0.json").read_text(encoding="utf-8"))
        rules = manifest["section_temporal_overrides"]
        self.assertEqual(len(rules), 2)
        self.assertEqual({x["section_or_record_locator"] for x in rules}, OLD_SECTIONS)
        self.assertTrue(all(x["state"] == "superseded" and x["source_path"] == LEGACY
                            and x["superseded_by"] == "entity-graph.json"
                            and x["reason"] for x in rules))
        current_dan = [p for p in self.passages if p.source_path == "entity/ENTITY-PASSPORT-DANISAN.md"]
        self.assertEqual(len(current_dan), 7)
        self.assertTrue(all(p.canonical_or_historical == "canonical_current" for p in current_dan))


if __name__ == "__main__":
    unittest.main()
