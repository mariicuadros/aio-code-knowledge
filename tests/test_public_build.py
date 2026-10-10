"""Exercise the publication boundary with real copies and injected unsafe inputs."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PublicBuildTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / 'scripts').mkdir()
        shutil.copy2(ROOT / 'scripts/build_site.mjs', self.root / 'scripts/build_site.mjs')
        self.manifest = json.loads((ROOT / 'public-site-manifest.json').read_text())
        for path in self.manifest['files']:
            dest = self.root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / path, dest)
        (self.root / 'private').mkdir()
        (self.root / 'private/canary.txt').write_text('not for publication')

    def build(self):
        (self.root / 'public-site-manifest.json').write_text(json.dumps(self.manifest))
        return subprocess.run(['node', 'scripts/build_site.mjs'], cwd=self.root, capture_output=True, text=True)

    def test_output_is_exact_allowlist_and_preserves_public_sources(self):
        result = self.build()
        self.assertEqual(result.returncode, 0, result.stderr)
        files = {p.relative_to(self.root / 'public').as_posix() for p in (self.root / 'public').rglob('*') if p.is_file()}
        self.assertEqual(files, set(self.manifest['files']))
        for path in files:
            self.assertEqual((self.root / path).read_bytes(), (self.root / 'public' / path).read_bytes())
        index = json.loads((self.root / 'rag/public-index-v0.json').read_text(encoding='utf-8'))
        self.assertTrue(set(index['source_blobs']).issubset(files))
        self.assertEqual(self.build().returncode, 0)
        self.assertEqual((self.root / 'private/canary.txt').read_text(), 'not for publication')

    def test_private_paths_and_traversal_fail_before_writing(self):
        for path in ['private/canary.txt', '../escape.txt', '.env.production', 'api/answer.mjs', 'security/account-registry/accounts.json', 'observatory/intake/raw.json']:
            with self.subTest(path=path):
                original = self.manifest['files'][:]
                self.manifest['files'].append(path)
                self.assertNotEqual(self.build().returncode, 0)
                self.assertFalse((self.root / 'public').exists())
                self.manifest['files'] = original

    def test_stale_output_is_rejected_without_deletion(self):
        stale = self.root / 'public/internal.json'
        stale.parent.mkdir()
        stale.write_text('preserve me')
        self.assertNotEqual(self.build().returncode, 0)
        self.assertEqual(stale.read_text(), 'preserve me')
        self.assertFalse((self.root / 'public/index.html').exists())

    def test_missing_input_fails_before_writing(self):
        self.manifest['files'].append('missing-public-file.json')
        self.assertNotEqual(self.build().returncode, 0)
        self.assertFalse((self.root / 'public').exists())
