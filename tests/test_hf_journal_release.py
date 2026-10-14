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
  self.assertIn('RELEASE_DATE = "2026-10-13"',code)
  self.assertIn('Historical card — superseded descriptions',code)
if __name__=='__main__':unittest.main()

class CardPreparationTests(unittest.TestCase):
 def test_legacy_duplicate_metadata_and_current_definition(self):
  import yaml
  from scripts.prepare_hf_journal_card import prepare_card, split_card
  old='---\npretty_name: Old\nconfigs: []\n---\n\nlanguage:\n  - es\nlicense: other\n---\n---\n\n# Original card\nAIO CODE es una metodología.\n## Project structure and dated updates — 2026-09-25\nHistorical observation.\n'
  card,archive=prepare_card(old,'a'*40)
  metadata,body=split_card(card)
  self.assertEqual(metadata['language'],['es','en'])
  self.assertIn('tags',metadata)
  self.assertNotIn('\nlanguage:',body)
  self.assertIn('Digital Entity Operating System',body.split('## Reading the journal')[0])
  self.assertIn('## Project structure and dated updates — 2026-09-25',body)
  self.assertIn('AIO CODE es una metodología.',body)
  self.assertTrue(archive.startswith('README-before-'))
  again,_=prepare_card(card,'a'*40)
  self.assertEqual(again,card)
 def test_root_and_source_artifacts_share_the_same_export_sources(self):
  workflow=(R/'.github/workflows/sync-huggingface.yml').read_text()
  self.assertIn('root_dst = Path("hf-export") / source',workflow)
  self.assertIn('shutil.copy2(src, root_dst)',workflow)
  manifest=json.loads((R/'data-export/export-manifest.json').read_text())
  self.assertIn('AIO-CODE-SYSTEM-SPEC-v2.md',manifest['sources'])
 def test_description_drops_markdown_separator(self):
  from scripts.build_hf_entities import definition
  self.assertEqual(definition('## Definition\nA DEOS.\n\n---\n\n## Next\nOther.'),'A DEOS.')
