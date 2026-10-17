import json
import unittest

from scripts.audit_hf_remote_readonly import compare_entities, inspect_metadata, parse_jsonl, build_report

FIELDS = {
    "canonical_name": "Marii Cuadros",
    "entity_type": "Person",
    "description": "Person record",
    "relationships": "MC-001 — creator_of → AIO-001",
    "passport_path": "entity/ENTITY-PASSPORT-MARII-CUADROS.md",
    "evidence_boundary": "first party",
}


def row(entity_id, commit="old-sha"):
    return {"entity_id": entity_id, **FIELDS, "source_commit": commit}


class HfAuditTests(unittest.TestCase):
    def test_same_entity_has_no_drift(self):
        actual = compare_entities([row("MC-001")], [row("MC-001")], "old-sha")
        self.assertTrue(actual["parity"])
        self.assertEqual(actual["missing_remote"], [])
        self.assertFalse(actual["source_commit_differs"])

    def test_new_entity_detected_without_mutating_core(self):
        actual = compare_entities([row("MC-001"), row("DAN-001")], [row("MC-001")], "new-sha")
        self.assertFalse(actual["parity"])
        self.assertEqual(actual["missing_remote"], ["DAN-001"])
        self.assertTrue(actual["source_commit_differs"])
        self.assertEqual(actual["field_mismatch"], {})

    def test_core_field_divergence_and_duplicate_rows(self):
        source = row("AIO-001")
        wrong = row("AIO-001")
        wrong["entity_type"] = "ResearchProject"
        out = compare_entities([source], [wrong, wrong])
        self.assertIn("duplicate_remote_ids", out["findings"])
        self.assertEqual(out["field_mismatch"]["AIO-001"], ["entity_type"])

    def test_remote_jsonl_rejects_invalid_row(self):
        with self.assertRaises(ValueError):
            parse_jsonl(b'{"not_entity_id": "MC"}\n')
        with self.assertRaises(ValueError):
            parse_jsonl(b'"raw line"\n')

    def test_metadata_missing_addendum_is_not_a_rights_claim(self):
        meta = inspect_metadata({"id":"mariicuadros/aio-code-journal","sha":"x","siblings":[{"rfilename":"data/research-journal.jsonl"}]}, "data/research-journal-addendum.jsonl")
        self.assertFalse(meta["expected_file_present"])

    def test_build_report_does_not_publish(self):
        def fetch(url):
            if url.endswith("aio-code-entities") or url.endswith("aio-code-journal"):
                return json.dumps({"id":url,"sha":"old","siblings":[{"rfilename":"data/entities.jsonl"}]}).encode()
            return (json.dumps(row("MC-001")) + "\n").encode()
        report = build_report(fetch=fetch, local_rows=[row("MC-001"), row("DAN-001")], github_sha="new-sha")
        self.assertFalse(report["release_allowed"])
        self.assertEqual(report["status"], "drift_detected")
        self.assertEqual(report["datasets"]["entities"]["comparison"]["missing_remote"], ["DAN-001"])


if __name__ == "__main__":
    unittest.main()
