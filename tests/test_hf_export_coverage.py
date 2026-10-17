"""Ensure every public entity exported as JSONL has source artifacts retained in HF."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class HuggingFaceExportCoverageTests(unittest.TestCase):
    def test_every_public_graph_entity_has_source_files_in_manifest(self):
        graph = json.loads((ROOT / "entity-graph.json").read_text(encoding="utf-8"))
        manifest = json.loads((ROOT / "data-export/export-manifest.json").read_text(encoding="utf-8"))
        files = manifest["sources"]
        self.assertEqual(len(files), len(set(files)), "Duplicate HF source paths")
        self.assertTrue(files, "Empty HF export manifest")
        for path in files:
            self.assertTrue((ROOT / path).is_file(), f"HF artifact missing: {path}")
            self.assertFalse(path.startswith(("aio-code-vault/", "private/", ".env")))
        for node in graph["nodes"]:
            eid = node["entity_id"]
            self.assertIn(node["passport"], files, f"Passport omitted from HF source artifacts for {eid}")
            if node.get("platform_registry"):
                self.assertIn(node["platform_registry"], files, f"Platform sources omitted for {eid}")

    def test_danisan_public_source_bundle_is_complete(self):
        manifest = json.loads((ROOT / "data-export/export-manifest.json").read_text(encoding="utf-8"))
        sources = set(manifest["sources"])
        for source in (
            "entity/ENTITY-PASSPORT-DANISAN.md",
            "entity/content/DAN-001/platforms.json",
            "entities/danisan/technical/jsonld/danisan.jsonld",
            "public-assets-v2.json",
        ):
            self.assertIn(source, sources)


if __name__ == "__main__":
    unittest.main()
