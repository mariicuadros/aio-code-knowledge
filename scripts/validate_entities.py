"""Cross-layer canonical identity checks; no remote ownership/legal claims."""
import json
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from rag.engine import build_index
from scripts.build_hf_entities import build_rows

EXPECTED={
    'MC-001':('Marii Cuadros','Person'),
    'AIO-001':('AIO CODE','DigitalEntityOperatingSystem'),
    'OZCU-001':('OZCU','Company'),
    'VOID-001':('VOID MODE','CreativeSystem'),
    'NUX-001':('NUX','DigitalCreativeEntity')
}
def read(path):return json.loads((ROOT/path).read_text(encoding='utf-8'))
def ld(path):
    html=(ROOT/path).read_text(encoding='utf-8')
    return json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',html,re.S)[1])

def validate_entities():
    graph=read('entity-graph.json');nodes={n['entity_id']:n for n in graph['nodes']}
    assert set(nodes)==set(EXPECTED),'Canonical entity set changed'
    for identity,(name,kind) in EXPECTED.items():
        node=nodes[identity]
        assert (node['canonical_name'],node['entity_type'])==(name,kind),identity
        passport=(ROOT/node['passport']).read_text(encoding='utf-8')
        assert f'**Entity ID:** {identity}' in passport and f'**Entity Type:** {kind}' in passport,identity
    assert 'distinct narrative entity' in (ROOT/nodes['NUX-001']['passport']).read_text(encoding='utf-8')
    assert 'does not assert legal incorporation or registration' in (ROOT/nodes['OZCU-001']['passport']).read_text(encoding='utf-8')
    person=ld('entities/marii-cuadros/index.html')['mainEntity'];aio=ld('index.html')
    schema=read('schemas/person-schema.json')['@graph'];machine=read('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')
    assert person['@type']==machine['@type']==schema[0]['@type']=='Person'
    assert person['@id']==machine['@id']==schema[0]['@id']==aio['creator']['@id']
    assert aio['@type']==schema[1]['@type']=='CreativeWork'
    assert aio['category']==schema[1]['category']=='Digital Entity Operating System'
    assert set(person['sameAs'])==set(machine['sameAs'])==set(schema[0]['sameAs'])
    assert set(aio['sameAs'])==set(schema[1]['sameAs'])
    assets=read('public-assets-v1.json')['assets']
    for entity,urls in [('MC-001',person['sameAs']),('AIO-001',aio['sameAs'])]:
        allowed={url for asset in assets if entity in asset.get('same_as_entity_ids',[]) for url in asset['urls']}
        assert set(urls)<=allowed, f'Unapproved sameAs for {entity}'
    aliases=json.dumps({'html':person,'machine':machine,'schema':schema[0]},ensure_ascii=False).casefold()
    for record in read('identity/confusable-entities.json')['records']:
        assert record['observed_label'].casefold() not in aliases,'Confusable external person became alias'
    social=read('social-entity-map.json')
    assert {e['entity_id'] for e in social['entities']}==set(nodes)
    for entity in social['entities']:
        assert entity['canonical_name']==nodes[entity['entity_id']]['canonical_name']
        if entity.get('platform_registry'):
            registry=read(entity['platform_registry'])
            assert registry['entity_id']==entity['entity_id']
            assert all(p['canonical_entity_id']==entity['entity_id'] for p in registry['platforms'])
    _,passages=build_index()
    assert not any(p.source_path.startswith('observatory/intake/') or p.source_path=='AIO-METHODOLOGY-SPEC-v1.md' for p in passages)
    current_claims=[json.loads(p.text) for p in passages if p.source_path=='claim-ledger.json']
    assert all(c['claim_status']=='active' for c in current_claims)
    rows=build_rows()
    assert {r['entity_id'] for r in rows}==set(nodes)
    for row in rows:
        assert (row['canonical_name'],row['entity_type'])==EXPECTED[row['entity_id']]
        assert row['passport_path']==nodes[row['entity_id']]['passport']
    assert 'narrative entity' in next(r['description'] for r in rows if r['entity_id']=='NUX-001')
    print('Entity coherence valid: five distinct entities, passports, JSON-LD, sameAs, social map, RAG and local HF export. Remote ownership/legal status not verified.')

if __name__=='__main__':validate_entities()
