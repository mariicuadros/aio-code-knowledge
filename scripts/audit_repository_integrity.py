"""Repository-wide structural audit for AIO CODE public source-of-truth.

This validator intentionally checks repository integrity, not external publication or ownership.
It uses only Python stdlib so it can run in every CI release gate.
"""
from pathlib import Path
import json,re,struct

ROOT=Path(__file__).resolve().parents[1]
SKIP={'.git','node_modules','.venv','hf-export','hf-journal-export'}
ENTITY_TYPES={'MC-001':'Person','AIO-001':'DigitalEntityOperatingSystem','OZCU-001':'Company','VOID-001':'CreativeSystem','NUX-001':'DigitalCreativeEntity'}
MEDIA_EXT={'.png','.jpg','.jpeg','.mp4'}

def fail(msg): raise AssertionError(msg)
def read_json(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def repo_files():
    return [p for p in ROOT.rglob('*') if p.is_file() and not any(part in SKIP for part in p.relative_to(ROOT).parts)]
def parse_json_everywhere():
    for p in repo_files():
        rel=p.relative_to(ROOT).as_posix()
        if p.suffix.lower() in {'.json','.jsonld'}:
            try: json.loads(p.read_text(encoding='utf-8'))
            except Exception as exc: fail(f'Invalid JSON {rel}: {exc}')
        if p.suffix.lower()=='.jsonl':
            ids=[]
            for n,line in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
                if not line.strip(): continue
                try: row=json.loads(line)
                except Exception as exc: fail(f'Invalid JSONL {rel}:{n}: {exc}')
                if 'id' in row: ids.append(row['id'])
            if len(ids)!=len(set(ids)): fail(f'Duplicate JSONL id in {rel}')

def check_repo_path_references():
    prefixes=('entities/','entity/','evidence/','observatory/','rag/','schemas/','security/','brain/','data-export/','metrics/','identity/','phase-2/','blogger/','api/','assets/','checker/','governance/','commerce/','semantic/','provenance/','logbook/','legal/','product/','experiments/','cases/')
    root_names={'ENTITY-MASTER-RECORD.md','public-assets-v1.json','social-entity-map.json','claim-ledger.json','ai-social-baseline.json','AIO-CODE-SYSTEM-SPEC-v2.md'}
    bad=[]
    source_file=None
    def walk(v):
        if isinstance(v,dict):
            for x in v.values(): walk(x)
        elif isinstance(v,list):
            for x in v: walk(x)
        elif isinstance(v,str):
            value=v.strip()
            if value.startswith(('http://','https://')) or '*' in value or ' → ' in value or ' — ' in value: return
            if ';' in value:
                for part in value.split(';'): walk(part.strip())
                return
            candidate=value.lstrip('./')
            if candidate.startswith(prefixes) or candidate in root_names:
                # Only path-like values; skip prose sentences that happen to start with a directory word.
                if '\n' in candidate or len(candidate)>240 or ' ' in candidate and not candidate.endswith(('.md','.json','.jsonld','.csv','.html','.txt','/')): return
                p=ROOT/candidate.rstrip('/')
                if not p.exists(): bad.append((source_file,candidate))
    for p in repo_files():
        if p.suffix.lower() in {'.json','.jsonld'}:
            source_file=p.relative_to(ROOT).as_posix()
            walk(json.loads(p.read_text(encoding='utf-8')))
    if bad: fail('Broken internal repository references: '+', '.join(f'{src} -> {ref}' for src,ref in sorted(set(bad))[:25]))

def check_entities_and_social():
    graph=read_json('entity-graph.json'); nodes={x['entity_id']:x for x in graph['nodes']}
    if set(nodes)!=set(ENTITY_TYPES): fail(f'Canonical entity set mismatch: {set(nodes)}')
    for eid,kind in ENTITY_TYPES.items():
        if nodes[eid]['entity_type']!=kind: fail(f'{eid} type mismatch')
        passport=ROOT/nodes[eid]['passport']
        if not passport.is_file(): fail(f'Missing passport for {eid}')
    assets=read_json('public-assets-v1.json')['assets']
    asset_urls={eid:set() for eid in ENTITY_TYPES}
    for a in assets:
        for eid in a['entity_ids']:
            if eid in asset_urls: asset_urls[eid].update(a['urls'])
    for eid in ('MC-001','AIO-001','NUX-001'):
        reg=read_json(nodes[eid]['platform_registry'])
        seen=set()
        for p in reg['platforms']:
            pid=p['platform_id']
            if pid in seen: fail(f'Duplicate platform_id {pid}')
            seen.add(pid)
            if p['canonical_entity_id']!=eid: fail(f'Platform entity mismatch {pid}')
            if p.get('status') in {'active','linked'} and not p.get('url'):
                fail(f'Active/linked platform lacks URL: {pid}')
            if p.get('url') and eid in {'MC-001','AIO-001'} and p['url'] not in asset_urls[eid]:
                fail(f'Platform URL absent from public asset inventory: {pid} {p["url"]}')
    person=read_json('entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld')
    schema=read_json('schemas/person-schema.json')['@graph'][0]
    if person['name']!='Marii Cuadros' or 'Maria Alejandra Cuadros Lozada' not in person.get('alternateName',[]): fail('MC canonical/alternate name mismatch')
    if set(person['sameAs'])!=set(schema['sameAs']): fail('MC sameAs differs between JSON-LD and schema')
    if len(person['sameAs'])!=len(set(person['sameAs'])): fail('Duplicate MC sameAs URL')
    conf=read_json('identity/confusable-entities.json')['records']
    aliases=' '.join([person['name']]+person.get('alternateName',[])).casefold()
    for c in conf:
        if c['observed_label'].casefold() in aliases: fail('Confusable identity promoted to alias')

def png_size(p):
    b=p.read_bytes()[:24]
    if len(b)<24 or b[:8]!=b'\x89PNG\r\n\x1a\n' or b[12:16]!=b'IHDR': fail(f'Invalid PNG signature/header: {p.relative_to(ROOT)}')
    return struct.unpack('>II',b[16:24])
def jpeg_size(p):
    data=p.read_bytes()
    if not data.startswith(b'\xff\xd8'): fail(f'Invalid JPEG signature: {p.relative_to(ROOT)}')
    i=2
    sof={0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF}
    while i+9<len(data):
        if data[i]!=0xFF: i+=1; continue
        marker=data[i+1]; i+=2
        if marker in {0xD8,0xD9} or 0xD0<=marker<=0xD7: continue
        if i+2>len(data): break
        n=int.from_bytes(data[i:i+2],'big')
        if marker in sof and i+7<=len(data):
            h=int.from_bytes(data[i+3:i+5],'big'); w=int.from_bytes(data[i+5:i+7],'big'); return w,h
        if n<2: break
        i+=n
    fail(f'JPEG dimensions unavailable/corrupt: {p.relative_to(ROOT)}')
def check_media():
    media=[p for p in repo_files() if p.suffix.lower() in MEDIA_EXT]
    if not media: fail('No media found')
    for p in media:
        if p.stat().st_size<=0: fail(f'Empty media file {p.relative_to(ROOT)}')
        ext=p.suffix.lower()
        if ext=='.png': w,h=png_size(p)
        elif ext in {'.jpg','.jpeg'}: w,h=jpeg_size(p)
        else:
            b=p.read_bytes()[:16]
            if len(b)<12 or b[4:8]!=b'ftyp': fail(f'Invalid MP4 header: {p.relative_to(ROOT)}')
            continue
        if w<=0 or h<=0: fail(f'Invalid dimensions {p.relative_to(ROOT)} {w}x{h}')
    carousel_dir=ROOT/'entities/aio-code/media/instagram/carousels'
    actual={p.name for p in carousel_dir.iterdir() if p.is_file() and p.suffix.lower() in MEDIA_EXT}
    man=read_json('entities/aio-code/media/instagram/carousels/manifest.json')
    listed={x['filename'] for x in man['assets']}
    if actual!=listed: fail(f'Carousel manifest mismatch actual={len(actual)} listed={len(listed)}')
    if man['media_count']!=len(actual): fail('Carousel media_count mismatch')
    if man['image_count']!=sum(1 for x in actual if Path(x).suffix.lower() in {'.png','.jpg','.jpeg'}): fail('Carousel image_count mismatch')
    if man['video_count']!=sum(1 for x in actual if Path(x).suffix.lower()=='.mp4'): fail('Carousel video_count mismatch')
    fbdir=ROOT/'entities/marii-cuadros/media/facebook/posts'
    actual_fb={p.name for p in fbdir.iterdir() if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg'}}
    fb=read_json('entities/marii-cuadros/media/facebook/posts/manifest.json')
    if actual_fb!=set(fb['assets']) or fb['asset_count']!=len(actual_fb): fail('Facebook media manifest mismatch')
    records=list((fbdir/'records').glob('*.json'))
    if len(records)!=len(actual_fb): fail('Facebook image/record count mismatch')
    for rec in records:
        d=json.loads(rec.read_text(encoding='utf-8'))
        fn=d.get('filename') or d.get('asset_filename') or d.get('file')
        if fn and fn not in actual_fb: fail(f'Facebook record points to missing asset: {rec.name} -> {fn}')

def check_vocabulary():
    vocab=read_json('brain/contracts/vocabulary-v1.json')['terms']
    defs=read_json('brain/contracts/brain-record-v1.schema.json')['$defs']
    for key,terms in vocab.items():
        if key in defs and isinstance(defs[key],dict) and 'enum' in defs[key]:
            if set(terms)!=set(defs[key]['enum']): fail(f'Vocabulary/schema enum drift: {key}')

def check_current_terminology():
    files=['README.md','index.html','llms.txt','ENTITY-MASTER-RECORD.md','entity/ENTITY-PASSPORT-AIO-CODE.md','entity/ENTITY-PASSPORT-VOID-MODE.md','entities/aio-code/social/instagram.json','entities/aio-code/evidence/sources/instagram-aiocode.json']
    banned=[r'AIO CODE is (?:a |the )?methodology\b',r'AIO CODE as (?:a |the )?methodology\b',r'VOID MODE is her system']
    for f in files:
        txt=(ROOT/f).read_text(encoding='utf-8')
        for pat in banned:
            if re.search(pat,txt,re.I): fail(f'Outdated current terminology in {f}: {pat}')
    src=read_json('entities/aio-code/evidence/sources/instagram-aiocode.json')['description']
    if 'Digital Entity Operating System' not in src: fail('AIO Instagram source lacks DEOS terminology')

def check_folder_rules():
    required=[
      'entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld',
      'entities/marii-cuadros/technical/schema/disambiguation.json',
      'entities/void-mode/technical/jsonld/void-mode.jsonld',
      'entities/void-mode/index.html',
      'entity/ENTITY-PASSPORT-AIO-CODE.md','entity/ENTITY-PASSPORT-MARII-CUADROS.md','entity/ENTITY-PASSPORT-VOID-MODE.md',
      'public-site-manifest.json','sitemap.xml','robots.txt'
    ]
    for p in required:
        if not (ROOT/p).is_file(): fail('Missing required canonical file: '+p)
    carousel=ROOT/'entities/aio-code/media/instagram/carousels'
    allowed={'.png','.jpg','.jpeg','.mp4','.json'}
    extras=[p.name for p in carousel.iterdir() if p.is_file() and p.suffix.lower() not in allowed and p.name!='.gitkeep']
    if extras: fail('Unexpected carousel files: '+', '.join(extras))

def main():
    parse_json_everywhere()
    check_repo_path_references()
    check_entities_and_social()
    check_media()
    check_vocabulary()
    check_current_terminology()
    check_folder_rules()
    print('Repository integrity audit passed: structured data, internal references, media headers/manifests, social identity, vocabulary and canonical folder rules are coherent.')

if __name__=='__main__': main()
