"""Read-only preflight for independent employer profiles. No publication."""
from __future__ import annotations
import argparse
import copy
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
DEFAULT=ROOT/'templates/external-employer/company-record.template.json'
REQUIRED={'record_version','record_id','record_state','classification','organization','association','method_use','discovery','publication','evidence'}

def https_url(value):
    if not isinstance(value,str) or not value: return False
    try:
        u=urlsplit(value)
        return u.scheme=='https' and bool(u.netloc) and not u.username and not u.password
    except ValueError:
        return False

def validate(j):
    errors=[]
    if not isinstance(j,dict): return ['not_an_object']
    if not REQUIRED.issubset(j):return ['missing_required_sections']
    if j.get('classification')!='independent_external_employer':errors.append('not_independent_external_employer')
    a=j['association']; m=j['method_use']; pub=j['publication']; org=j['organization']
    if a.get('related_person_id')!='MC-001':errors.append('unexpected_person_id')
    if a.get('relationship_type') not in {'employment_reported_pending_validation','employment_verified'}:errors.append('invalid_employment_relation')
    if not isinstance(a.get('do_not_infer'),dict) or not a['do_not_infer'] or not all(v is True for v in a['do_not_infer'].values()):errors.append('missing_non_affiliation_guard')
    if m.get('involves_aio_code_product') is not False or m.get('is_aio_code_commercial_implementation') is not False:errors.append('aio_affiliation_not_authorized_by_template')
    if not isinstance(org.get('official_profiles'),list):errors.append('profiles_not_list')
    else:
        for url in org['official_profiles']:
            if not https_url(url): errors.append('invalid_official_profile')
            if any(x in url.lower() for x in ('/entities/marii-cuadros/','/entities/aio-code/','aio-code.vercel.app/#aio-001')):errors.append('inherited_aio_or_mc_profile')
    if org.get('canonical_url') and not https_url(org['canonical_url']):errors.append('invalid_canonical_url')
    if org.get('official_website') and not https_url(org['official_website']):errors.append('invalid_website')
    if pub.get('can_generate_public_package') is True:
        if not all(pub.get(k) is True for k in ('organization_publication_permission','operator_approval','rights_review_completed','source_integrity_checked')):errors.append('approval_missing')
        if not all(org.get(k) for k in ('canonical_name','slug','official_website','description_es')):errors.append('entity_fields_missing')
        if not (j.get('evidence') or {}).get('provenance_public'):errors.append('source_evidence_missing')
        if a.get('role_label_es') and not a.get('employment_disclosure_approved'):errors.append('employment_disclosure_missing')
        if m.get('description_es') and not m.get('company_approved_public_claim'):errors.append('method_claim_not_approved')
        if not all(j.get('discovery',{}).get(k) for k in ('answer_first_es','title_es','description_es')):errors.append('search_metadata_missing')
    return sorted(set(errors))

def self_test():
    baseline=json.loads(DEFAULT.read_text(encoding='utf-8'))
    assert validate(baseline)==[],validate(baseline)
    altered=copy.deepcopy(baseline)
    altered['method_use']['is_aio_code_commercial_implementation']=True
    assert 'aio_affiliation_not_authorized_by_template' in validate(altered)
    ready=copy.deepcopy(baseline)
    ready['publication']['can_generate_public_package']=True
    assert 'approval_missing' in validate(ready)
    assert 'entity_fields_missing' in validate(ready)
    print('External employer template: default and negative gate checks passed.')

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--self-test',action='store_true')
    p.add_argument('--input',type=Path,default=DEFAULT)
    a=p.parse_args()
    if a.self_test: self_test(); return
    record=json.loads(a.input.read_text(encoding='utf-8'))
    errors=validate(record)
    if errors: raise SystemExit('Template validation failed: '+', '.join(errors))
    print('Template structure accepted. This is not approval to publish.')

if __name__=='__main__': main()
