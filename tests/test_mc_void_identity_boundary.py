"""Preserve canonical personal identity and independently defined VOID MODE."""
import json,re,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return (ROOT/p).read_text(encoding='utf-8')
def obj(p):return json.loads(read(p))
class IdentityBoundaryTests(unittest.TestCase):
 def test_mc_name_same_entity_and_roles(self):
  schema=obj('schemas/person-schema.json')['@graph'][0]
  technical=obj('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')
  page=json.loads(read('entities/marii-cuadros/index.html').split('<script type="application/ld+json">',1)[1].split('</script>',1)[0])['mainEntity']
  for p in (schema,technical,page):
   self.assertEqual(p['name'],'Marii Cuadros')
   self.assertEqual(p['alternateName'],['Maria Alejandra Cuadros Lozada'])
   self.assertTrue(any('Strategist' in t or 'Estratega' in t for t in p['jobTitle']))
  self.assertEqual(len({p['@id'] for p in (schema,technical,page)}),1)
  self.assertEqual(obj('.well-known/marii-cuadros.json')['full_name'],'Maria Alejandra Cuadros Lozada')
 def test_void_independent_system(self):
  nodes={n['entity_id']:n for n in obj('entity-graph.json')['nodes']}
  self.assertEqual(nodes['VOID-001']['entity_type'],'CreativeSystem')
  self.assertEqual(nodes['MC-001']['entity_type'],'Person')
  passport=read('entity/ENTITY-PASSPORT-VOID-MODE.md')
  self.assertIn('not the personal aesthetic',passport)
  self.assertIn('cannot guarantee',passport)
 def test_exclusions_remain_unrelated(self):
  registry=obj('identity/confusable-entities.json')['records']
  aliases=obj('schemas/person-schema.json')['@graph'][0]['alternateName']
  for record in registry:self.assertNotIn(record['observed_label'],aliases)
if __name__=='__main__':unittest.main()
