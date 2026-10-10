"""Cross-source identity sync: local artifacts only; never claims remote publication."""
import html, json, re, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return (ROOT/p).read_text(encoding='utf-8')
def obj(p):return json.loads(read(p))
def ld(page):
 text=read(page)
 match=re.search(r'<script type="application/ld[+]json">(.*?)</script>',text,re.S)
 if not match:raise AssertionError('Missing LD+JSON in '+page)
 return json.loads(match.group(1))
class PublicIdentitySync(unittest.TestCase):
 def test_mc_name_and_alias_match_across_sources(self):
  graph={n['entity_id']:n for n in obj('entity-graph.json')['nodes']}
  core=obj('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')
  homepage=ld('entities/marii-cuadros/index.html')['mainEntity']
  schema=obj('schemas/person-schema.json')['@graph'][0]
  well=obj('.well-known/marii-cuadros.json')
  for record in (core,homepage,schema):
   self.assertEqual(record['name'],graph['MC-001']['canonical_name'])
   self.assertIn(well['full_name'],record['alternateName'])
   self.assertEqual(record['@id'],core['@id'])
   self.assertTrue(any('strateg' in t.lower() or 'estrateg' in t.lower() for t in record['jobTitle']))
  blogger=read('blogger/theme-aio-code-20261010.xml')
  self.assertIn('&quot;name&quot;: &quot;Marii Cuadros&quot;',blogger)
  self.assertIn('&quot;alternateName&quot;: [&quot;'+well['full_name']+'&quot;]',blogger)
  self.assertIn('Estratega digital',blogger)
  self.assertIn(core['@id'],blogger)
 def test_void_public_identity_and_separation(self):
  graph={n['entity_id']:n for n in obj('entity-graph.json')['nodes']}
  machine=obj('entities/void-mode/technical/jsonld/void-mode.jsonld')
  page=ld('entities/void-mode/index.html')['mainEntity']
  self.assertEqual(machine,page)
  self.assertEqual(machine['name'],graph['VOID-001']['canonical_name'])
  self.assertEqual(graph['VOID-001']['entity_type'],'CreativeSystem')
  self.assertNotEqual(machine['@id'],machine['creator']['@id'])
  self.assertEqual(machine['creator']['@id'],obj('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')['@id'])
  self.assertIn('VOID MODE (VOID-001)',read('blogger/theme-aio-code-20261010.xml'))
 def test_routes_are_explicit(self):
  files=obj('public-site-manifest.json')['files']
  sitemap=read('sitemap.xml')
  for name in ('marii-cuadros','void-mode'):
   self.assertIn('entities/'+name+'/index.html',files)
   self.assertIn('https://aio-code.vercel.app/entities/'+name+'/',sitemap)
if __name__=='__main__':unittest.main()
