import hashlib
import json
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker, ValidationError
from scripts.validate_intake import validate_intake

ROOT = Path(__file__).resolve().parents[1]

class IntakeTests(unittest.TestCase):
    def test_original_evidence_bytes_preserved(self):
        hashes = {
            'GOOGLE-MC-20261009': '9565f3b7ad4f3da4b31af3b7d7209128283673784c6291b7d14a7e93539caf86',
            'META-IG-AIO-20261009': '92233b5e391ec91082b3af142bd5e7901a8112524d172caaa43225432197c7d7',
            'META-IG-MC-20261009': 'f8e027320951f3ed33efae4f1356ec3cc083f6e53fb5ce1027f608ac8e0d76a3'
        }
        for name, expected in hashes.items():
            self.assertEqual(hashlib.sha256((ROOT/'observatory/intake'/f'{name}.json').read_bytes()).hexdigest(), expected)
            self.assertFalse((ROOT/'observatory/runs'/f'{name}.json').exists())

    def test_contract_and_no_promotion(self):
        self.assertEqual(validate_intake(), 3)
        schema = json.loads((ROOT/'observatory/intake-schema.json').read_text())
        record = json.loads((ROOT/'observatory/intake/GOOGLE-MC-20261009.json').read_text())
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        for field, value in [('replication_status', 'verified'), ('date','not-a-date'), ('timestamp','invented')]:
            with self.subTest(field=field), self.assertRaises(ValidationError):
                validator.validate({**record,field:value})

    def test_intake_is_not_run_or_export(self):
        schema=json.loads((ROOT/'observatory/observation-schema.json').read_text())
        record=json.loads((ROOT/'observatory/intake/GOOGLE-MC-20261009.json').read_text())
        with self.assertRaises(ValidationError): Draft202012Validator(schema).validate(record)
        for path,key in [('rag/corpus-manifest-v0.json','allowlist'),('data-export/export-manifest.json','sources')]:
            doc=json.loads((ROOT/path).read_text())
            paths=[x['path'] if isinstance(x,dict) else x for x in doc[key]]
            self.assertFalse(any(p.startswith('observatory/intake/') for p in paths))
