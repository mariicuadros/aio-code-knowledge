"""Offline Brain schemas and record-link validation; never verifies external evidence."""
import argparse
from datetime import datetime
import json
import math
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

CONTRACTS = Path(__file__).resolve().parents[1] / 'brain' / 'contracts'
ID_FIELDS = {
    'content_provenance': 'content_id', 'semantic_search': 'map_id',
    'performance_observation': 'observation_id', 'content_genome': 'genome_id',
    'commerce_music_brand': 'commerce_record_id',
    'rights_disclosure_authorship': 'rights_record_id', 'case': 'case_id',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def timestamp(value):
    result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    require(result.tzinfo is not None and result.utcoffset().total_seconds() == 0, 'Timestamp must be UTC')
    return result


def load_contracts(directory=CONTRACTS):
    schema = json.loads((directory / 'brain-record-v1.schema.json').read_text(encoding='utf-8'))
    vocabulary = json.loads((directory / 'vocabulary-v1.json').read_text(encoding='utf-8'))
    Draft202012Validator.check_schema(schema)
    for name, values in vocabulary['terms'].items():
        require(schema['$defs'][name]['enum'] == list(values), f'Vocabulary drift: {name}')
    return schema


def record_id(record):
    return record[ID_FIELDS[record['record_type']]]


def finite_json(value):
    if isinstance(value, float):
        require(math.isfinite(value), 'Non-finite numeric value')
    elif isinstance(value, dict):
        for item in value.values(): finite_json(item)
    elif isinstance(value, list):
        for item in value: finite_json(item)


def validate_record(record, schema=None):
    schema = load_contracts() if schema is None else schema
    finite_json(record)
    require(isinstance(record, dict), 'Record must be an object')
    kind = record.get('record_type')
    require(kind in ID_FIELDS, 'Unsupported record_type')
    selected = {'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/' + kind}
    error = next(Draft202012Validator(selected, format_checker=FormatChecker()).iter_errors(record), None)
    if error:
        path = '.'.join(str(x) for x in error.absolute_path) or kind
        # Report the field/rule, not a potentially sensitive submitted value.
        raise ValueError(f'{path}: contract violation ({error.validator})')
    if record.get('reviewed_at'):
        require(timestamp(record['reviewed_at']) <= timestamp(record['recorded_at']), 'Review is later than recorded_at')
    return record_id(record)


def validate_records(values, schema=None):
    schema = load_contracts() if schema is None else schema
    require(isinstance(values, list), 'Bundle must be an array')
    records = {}
    for value in values:
        ident = validate_record(value, schema)
        require(ident not in records, 'Duplicate record ID')
        records[ident] = value

    def linked(ident, kind):
        target = records.get(ident)
        require(target is not None and target['record_type'] == kind, f'Missing or wrong-type {kind} reference')
        return target

    for ident, record in records.items():
        kind = record['record_type']
        if kind == 'content_provenance':
            parent = record['parent_content_id']
            ancestors = {ident}
            while parent is not None:
                require(parent not in ancestors, 'Cyclic content lineage')
                ancestors.add(parent)
                ancestor = linked(parent, 'content_provenance')
                require(ancestor['master_asset_id'] == record['master_asset_id'], 'Derivative must preserve master_asset_id')
                parent = ancestor['parent_content_id']
            for child_id in record.get('platform_derivative_ids', []):
                require(linked(child_id, 'content_provenance')['parent_content_id'] == ident, 'Derivative back-reference mismatch')
            if record.get('rights_record_id'):
                rights = linked(record['rights_record_id'], 'rights_disclosure_authorship')
                require(rights['content_id'] == ident, 'Rights belong to another content item')
                if record.get('authorship_record_id'):
                    require(record['authorship_record_id'] == rights['authorship_record_id'], 'Authorship reference mismatch')
            if record.get('published_at'):
                require(timestamp(record['published_at']) <= timestamp(record['recorded_at']), 'Publication is later than recorded_at')
        elif kind in {'performance_observation', 'content_genome', 'commerce_music_brand', 'rights_disclosure_authorship'}:
            content = linked(record['content_id'], 'content_provenance')
            if kind == 'performance_observation':
                require(content['status'] in {'published', 'withdrawn', 'archived'} and content.get('published_at'), 'Metrics require a recorded publication')
                require(record['platform'] == content.get('platform'), 'Platform differs from publication')
                window = record['measurement_window']
                require(timestamp(content['published_at']) <= timestamp(window['start']) <= timestamp(window['end']) <= timestamp(record['captured_at']) <= timestamp(record['recorded_at']), 'Invalid measurement/capture chronology')
            if kind == 'content_genome':
                require(record['content_type'] == content['content_type'], 'Genome content_type differs from provenance')
            if kind == 'commerce_music_brand':
                require(record['status'] == content['commercial_relationship'], 'Commercial relationship differs from provenance')
                require(record['brand_presence']['relation'] == record['status'], 'Brand relationship differs from commerce status')
                if record['commercial_readiness'] in {'BRANDREADY', 'PAIDREADY'}:
                    rights = linked(record['rights_record_id'], 'rights_disclosure_authorship')
                    require(rights['content_id'] == record['content_id'], 'Readiness rights belong to another content item')
                    require(rights['review_status'] == 'reviewed', 'Readiness requires reviewed rights')
                    require(all(x in {'cleared', 'not_applicable'} for x in rights['asset_components'].values()), 'Readiness has unresolved component rights')
                    unresolved = {'unknown', 'not_collected', 'not_available', 'not_applicable', 'pending'}
                    for refs in (record['evidence_refs'], rights['permissions']['evidence_refs']):
                        require(bool(refs) and all(value.strip().lower() not in unresolved for value in refs), 'Readiness requires meaningful evidence references')
                    require(record['reviewed_by'].strip().lower() not in unresolved and rights['reviewed_by'].strip().lower() not in unresolved, 'Readiness requires identified reviewers')
                    for field in ('scope', 'duration', 'territory'):
                        require(rights['permissions'][field] not in {'unknown', 'not_applicable'}, 'Readiness requires explicit permission scope')
                    require(bool(rights['permissions']['channels']), 'Readiness requires permitted channels')
                    require(rights['disclosure']['status'] in {'satisfied', 'not_required', 'not_applicable'}, 'Readiness has unresolved disclosure')
                    require(rights['disclosure']['required'] != 'unknown' and rights['ai_generation_or_alteration']['used'] != 'unknown', 'Readiness has unknown disclosure/AI status')
                    require(rights['ai_generation_or_alteration']['disclosure_required'] != 'unknown', 'AI disclosure requirement unresolved')
                    if rights['ai_generation_or_alteration']['disclosure_required'] == 'yes':
                        require(rights['disclosure']['status'] == 'satisfied', 'Required AI disclosure is not satisfied')
                    if record.get('disclosure_required', 'unknown') not in {'no', 'not_applicable'}:
                        require(record.get('disclosure_required') == 'yes' and rights['disclosure']['status'] == 'satisfied', 'Commercial disclosure requirement unresolved')
                    if record['commercial_readiness'] == 'PAIDREADY':
                        require(rights['permissions']['paid_use_allowed'] == 'allowed', 'PAIDREADY requires paid-use permission')
                        require(record.get('usage', {}).get('paid_amplification') == 'allowed', 'PAIDREADY requires recorded paid amplification permission')
                    music = record.get('music')
                    if music and music['relation'] != 'not_applicable':
                        require(music['commercial_use'] == 'allowed' and music['license_evidence_ref'] not in {'unknown', 'not_applicable'}, 'Readiness requires music commercial-use evidence')
            if kind == 'rights_disclosure_authorship':
                disclosure = record['disclosure']
                if disclosure['required'] == 'yes':
                    require(disclosure['status'] not in {'not_required', 'not_applicable'}, 'Required disclosure cannot be not_required/not_applicable')
                if disclosure['status'] == 'satisfied':
                    require(disclosure['text_or_location'] not in {'unknown', 'not_applicable'}, 'Satisfied disclosure needs text/location')
        elif kind == 'case':
            require(not set(record['claims_supported']) & set(record['claims_not_supported']), 'Case supports and rejects the same claim')
            if record['findings']:
                require(bool(record['observation_refs']) and bool(record['limitations']), 'Findings require observations and limitations')
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('--schema-only', action='store_true', help='Validate shape only, without resolving links')
    args = parser.parse_args()
    doc = json.loads(args.input.read_text(encoding='utf-8'))
    values = doc if isinstance(doc, list) else [doc]
    schema = load_contracts()
    if args.schema_only:
        for value in values: validate_record(value, schema)
    else:
        validate_records(values, schema)
    print(f'Valid Brain records: {len(values)}; scope: {"schema only" if args.schema_only else "schema and internal links"}. External evidence not verified.')


if __name__ == '__main__':
    try: main()
    except (ValueError, KeyError, TypeError, OSError) as error:
        raise SystemExit(f'Brain validation rejected: {error}')
