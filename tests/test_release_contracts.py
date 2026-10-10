"""Release-candidate identity and publishing boundary checks (local only)."""
import json,re,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def obj(x):return json.loads((ROOT/x).read_text(encoding='utf-8'))
class ReleaseContracts(unittest.TestCase):
 def test_canonical_node_types_and_distinct_ids(self):
  graph=obj('entity-graph.json');nodes={n['entity_id']:n for n in graph['nodes']}
  self.assertEqual({k:v['entity_type'] for k,v in nodes.items()},{'MC-001':'Person','AIO-001':'DigitalEntityOperatingSystem','OZCU-001':'Company','VOID-001':'CreativeSystem','NUX-001':'DigitalCreativeEntity'})
  self.assertEqual(len(nodes),len(graph['nodes']))
 def test_same_as_arrays_no_unrelated_person(self):
  person=obj('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')
  schema=obj('schemas/person-schema.json')['@graph'][0]
  page=(ROOT/'entities/marii-cuadros/index.html').read_text(encoding='utf-8')
  match=re.search(r'<script type="application/ld[+]json">(.*?)</script>',page,re.S)
  self.assertIsNotNone(match)
  public=json.loads(match.group(1))['mainEntity']
  for x in [person,schema,public]:
   self.assertEqual(x['@id'],person['@id'])
   self.assertEqual(x['name'],'Marii Cuadros')
   self.assertIn('Maria Alejandra Cuadros Lozada',x['alternateName'])
   self.assertEqual(set(x['sameAs']),set(person['sameAs']))
   self.assertEqual(len(x['sameAs']),len(set(x['sameAs'])))
   for forbidden in ['Mari Chordà','Cuadros María Luisa']:
    self.assertNotIn(forbidden,' '.join(x['alternateName']))
 def test_void_links_are_in_public_allowlist(self):
  manifest=obj('public-site-manifest.json')['files']
  for f in ['entities/void-mode/index.html','entities/void-mode/technical/jsonld/void-mode.jsonld']:
   self.assertIn(f,manifest)
   self.assertTrue((ROOT/f).is_file())
  self.assertIn('https://aio-code.vercel.app/entities/void-mode/',(ROOT/'sitemap.xml').read_text(encoding='utf-8'))
 def test_publication_remains_manual(self):
  self.assertIs(obj('vercel.json')['git']['deploymentEnabled'],False)
  workflow=(ROOT/'.github/workflows/sync-huggingface.yml').read_text(encoding='utf-8')
  self.assertIn('workflow_dispatch:',workflow)
  self.assertIn("inputs.publish_approved == true",workflow)
  self.assertIn('inputs.approved_commit == github.sha',workflow)
if __name__=='__main__': unittest.main()
