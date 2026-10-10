"""Validate preliminary intake separately from controlled Observatory Runs."""
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]

def validate_intake(root=ROOT):
    schema = json.loads((root / 'observatory/intake-schema.json').read_text(encoding='utf-8'))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    seen = set()
    paths = sorted((root / 'observatory/intake').glob('*.json'))
    for path in paths:
        record = json.loads(path.read_text(encoding='utf-8'))
        validator.validate(record)
        identity = record['observation_id']
        if identity in seen or path.stem != identity:
            raise ValueError('Duplicate or mismatched intake observation ID')
        if (root / 'observatory/runs' / path.name).exists():
            raise ValueError('Intake summary must not also be a controlled Run')
        seen.add(identity)
    return len(paths)

if __name__ == '__main__':
    print(f'Valid Observatory Intake: {validate_intake()} preliminary records; not benchmark runs.')
