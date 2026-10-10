"""Validate VOID-001 public identity and MC-001 isolation."""
import json,re,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class VoidPublicPageTests(unittest.TestCase):
 def test_page_and_machine_identity(self):
  page=(R/'entities/void-mode/index.html').read_text(encoding='utf-8')
  block=re.search(r'<script type="application/ld\\+json">(.*?)</script>',page,re.S)
  self.assertIsNotNone(block)
  web=json.loads(block.group(1));thing=web['mainEntity']
  machine=json.loads((R/'entities/void-mode/technical/jsonld/void-mode.jsonld').read_text(encoding='utf-8'))
  self.assertEqual(thing,machine)
  self.assertEqual(thing['@id'],'https://aio-code.vercel.app/entities/void-mode/#VOID-001')
  self.assertEqual(thing['name'],'VOID MODE')
  self.assertNotEqual(thing['@id'],thing['creator']['@id'])
 def test_published_allowlist_and_sitemap(self):
  manifest=json.loads((R/'public-site-manifest.json').read_text(encoding='utf-8'))['files']
  self.assertIn('entities/void-mode/index.html',manifest)
  self.assertIn('entities/void-mode/technical/jsonld/void-mode.jsonld',manifest)
  self.assertIn('https://aio-code.vercel.app/entities/void-mode/',(R/'sitemap.xml').read_text(encoding='utf-8'))
 def test_creator_universe_not_system_definition(self):
  page=(R/'entities/void-mode/index.html').read_text(encoding='utf-8')
  self.assertIn('no es la estética personal',page)
  self.assertIn('no garantiza',page)
if __name__=='__main__':unittest.main()
