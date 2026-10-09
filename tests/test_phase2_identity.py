"""Phase 2 identity/disambiguation regression checks (stdlib only)."""
import json, re, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(path): return (ROOT/path).read_text(encoding='utf-8')
def get(path): return json.loads(read(path))
class Phase2Identity(unittest.TestCase):
 def test_critical_entity_types(self):
  nodes={n['entity_id']:n for n in get('entity-graph.json')['nodes']}
  self.assertEqual(nodes['MC-001']['entity_type'],'Person')
  self.assertEqual(nodes['AIO-001']['entity_type'],'DigitalEntityOperatingSystem')
  self.assertEqual(set(nodes),{'MC-001','AIO-001','OZCU-001','VOID-001','NUX-001'})
 def test_exclusions_do_not_become_aliases(self):
  registry=get('identity/confusable-entities.json')
  self.assertEqual({x['observed_label'] for x in registry['records']},{'Mari Chordà','Cuadros María Luisa'})
  dis=get('entities/marii-cuadros/technical/schema/disambiguation.json')
  self.assertNotIn('$schema',dis)
  person=json.loads(re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>',read('entities/marii-cuadros/index.html'),re.S).group(1))['mainEntity']
  aliases=' '.join([person['name']]+person.get('alternateName',[])+person.get('sameAs',[]))
  for record in registry['records']: self.assertNotIn(record['observed_label'].casefold(),aliases.casefold())
  # Preserve the documented MC-001 identity; a shared channel is not AIO-001 sameAs.
  schema=get('schemas/person-schema.json')['@graph']
  self.assertEqual(set(person['sameAs']),set(schema[0]['sameAs']))
  self.assertEqual(set(person['sameAs']),set(get('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')['sameAs']))
  self.assertNotIn('bilibili.tv',' '.join(schema[1].get('sameAs',[])))
 def test_open_graph_on_canonical_pages(self):
  for f in ('index.html','entities/marii-cuadros/index.html'):
   s=read(f)
   for k in ('og:title','og:description','og:url','og:type'): self.assertIn('property="'+k+'"',s)
 def test_deos_remains_current(self):
  self.assertIn('Digital Entity Operating System',read('index.html'))
  self.assertIn('SUPERSEDED HISTORICAL SPEC',read('AIO-METHODOLOGY-SPEC-v1.md'))
 def test_observations_not_promoted_to_proven_results(self):
  for f in ('META-IG-AIO-20261009','META-IG-MC-20261009','GOOGLE-MC-20261009'):
   d=get('observatory/runs/'+f+'.json')
   self.assertEqual(d['replication_status'],'not_yet_replicated')
if __name__=='__main__':unittest.main()
