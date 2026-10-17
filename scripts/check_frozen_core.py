"""Read-only, exact-baseline freeze gate for MC-001/AIO-001.

The baseline is intentionally pinned. Adding new entities is permitted, but
rewriting existing canonical core content is not. This supplements—not replaces—
branch protection, human review, rights checks and cross-repo HF release gates.
To lift/change freeze, use a separately approved governance release; never
quietly refresh the baseline in the same PR as an identity modification.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / 'governance/frozen-core-baseline-20261017.json'
PROTECTED = {'MC-001', 'AIO-001'}


def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def git_blob_sha(path):
    data = (ROOT / path).read_bytes()
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\\0' + data).hexdigest()


def assert_preserved(label, saved, current, key):
    current_map = {}
    for item in current:
        k = item.get(key)
        if k in current_map:
            raise AssertionError(f'duplicate {label} key: {k}')
        current_map[k] = item
    for item in saved:
        k = item[key]
        if k not in current_map:
            raise AssertionError(f'frozen {label} missing: {k}')
        if current_map[k] != item:
            raise AssertionError(f'frozen {label} modified: {k}')


def check():
    base = json.loads(BASELINE.read_text(encoding='utf-8'))
    assert base['version'] == 1
    for path, sha in base['locked_git_blobs'].items():
        actual = git_blob_sha(path)
        if actual != sha:
            raise AssertionError(f'frozen canonical file changed: {path}')
    graph = read('entity-graph.json')
    assert_preserved('graph node', list(base['entity_snapshot'].values()), graph['nodes'], 'entity_id')
    assert_preserved('graph edge', base['graph_edges_snapshot'], graph['edges'], 'relationship_id')
    social = read('social-entity-map.json')
    assert_preserved('social entity', list(base['social_snapshot'].values()), social['entities'], 'entity_id')
    claims = read('claim-ledger.json')
    assert_preserved('claim', base['claims_snapshot'], claims['claims'], 'claim_id')
    assets = read('public-assets-v2.json')
    assert_preserved('public asset', base['assets_snapshot'], assets['assets'], 'asset_id')
    text = (ROOT / 'llms.txt').read_text(encoding='utf-8').lower()
    assert 'digital entity operating system' in text, 'llms DEOS definition must remain visible'
    assert 'mc-001' in text and 'aio-001' in text, 'llms canonical ID context is missing'
    print(f"Frozen core verified: {len(base['locked_git_blobs'])} files; graph, claims, social map and assets remain unchanged for MC-001/AIO-001.")


if __name__ == '__main__':
    check()
