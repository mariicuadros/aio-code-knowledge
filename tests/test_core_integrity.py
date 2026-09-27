"""Regression cases for referential integrity, isolated from real records."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('core', ROOT / 'scripts/validate_core.py')
core = importlib.util.module_from_spec(spec)
spec.loader.exec_module(core)

class CoreIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.original_root = core.ROOT
        self.addCleanup(setattr, core, 'ROOT', self.original_root)
        core.ROOT = Path(self.temp.name)
        for path in ROOT.rglob('*'):
            relative = path.relative_to(ROOT)
            if any(part in {'.git', 'node_modules', '__pycache__', '.venv'} for part in relative.parts):
                continue
            if path.is_file() and path.suffix in {'.json', '.md'}:
                destination = core.ROOT / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(path, destination)
    def reject(self, filename, change, message):
        path = core.ROOT / filename
        doc = json.loads(path.read_text()); change(doc)
        path.write_text(json.dumps(doc))
        with contextlib.redirect_stdout(io.StringIO()), self.assertRaisesRegex(ValueError, message):
            core.main()
    def test_duplicate_relationship(self):
        self.reject('entity-graph.json', lambda d: d['edges'].append(d['edges'][0]), 'Duplicate relationship_id')
    def test_missing_passport(self):
        self.reject('entity-graph.json', lambda d: d['nodes'][0].update(passport='missing.md'), 'Missing entity passport')
    def test_missing_relationship_source(self):
        self.reject('entity-graph.json', lambda d: d['edges'][0].update(source_ref='missing.md'), 'Missing relationship source')
    def test_duplicate_commerce_asset(self):
        self.reject('commerce/commerce-register-v1.json', lambda d: d['records'].append(d['records'][0]), 'Duplicate commerce asset_id')
    def test_unknown_creator(self):
        self.reject('commerce/commerce-register-v1.json', lambda d: d['records'][0].update(creator_entity='MISSING'), 'Unknown commerce creator')

if __name__ == '__main__': unittest.main()
