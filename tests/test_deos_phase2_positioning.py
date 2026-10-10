"""Guard the phase-2 DEOS top-level description without rewriting archived evidence."""
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
class Phase2PositioningTests(unittest.TestCase):
    def test_top_level_identity_and_operating_phase(self):
        page=(ROOT/'index.html').read_text(encoding='utf-8')
        self.assertIn('Digital Entity Operating System',page)
        self.assertIn('Phase 2 expands practical implementation',page)
        self.assertIn('coverage count, not a recognition success rate',page)
        self.assertIn('Research and measurement protocols are internal operating procedures',page)
    def test_readme_does_not_equate_phase_with_evidence_ladder(self):
        doc=(ROOT/'README.md').read_text(encoding='utf-8')
        self.assertIn('Current operating phase: Phase 2',doc)
        self.assertNotIn('**Current focus: AIO CODE 1 — Evidence.**',doc)
    def test_baseline_is_immutable_coverage(self):
        import json
        baseline=json.loads((ROOT/'ai-social-baseline.json').read_text(encoding='utf-8'))
        self.assertEqual(len(baseline['records']),14)
        self.assertEqual(baseline['coverage']['planned_pairs'],49)
        self.assertEqual(baseline['coverage']['observed_pairs'],14)
        self.assertEqual(len(baseline['coverage']['missing_pairs']),35)
if __name__=='__main__': unittest.main()
