"""Journal chronology and public-release metadata regression tests."""
import json,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class JournalReleaseTests(unittest.TestCase):
 def test_unique_append_only_ids_and_release(self):
  rows=[json.loads(x) for x in (R/'data-export/journal-addendum.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
  ids=[row['id'] for row in rows]
  self.assertEqual(len(ids),len(set(ids)))
  self.assertEqual(ids[:4],['AIO-JOURNAL-011','AIO-JOURNAL-012','AIO-JOURNAL-013','AIO-JOURNAL-014'])
  release=next(r for r in rows if r['id']=='AIO-JOURNAL-015')
  self.assertIn('277ec5a968bff0c8b39ff85677a75a0531d25dbb',release['content'])
  self.assertIn('DigitalEntityOperatingSystem',release['content'])
 def test_card_update_is_current_and_historical_section_retained(self):
  code=(R/'scripts/prepare_hf_journal_card.py').read_text(encoding='utf-8')
  self.assertIn('metadata["last_updated"] = "2026-10-10"',code)
  self.assertIn('## Project structure and dated updates — 2026-09-25',code)
if __name__=='__main__':unittest.main()
