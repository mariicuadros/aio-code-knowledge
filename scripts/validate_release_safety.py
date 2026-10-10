"""Check release configuration locally, without publishing or accessing credentials."""
import argparse
import ast
import json
import os
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
PUBLISH_CONDITION="github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main' && inputs.publish_approved == true && inputs.approved_commit == github.sha"

def validate_request(env):
    assert env.get('GITHUB_EVENT_NAME')=='workflow_dispatch','Manual dispatch required'
    assert env.get('GITHUB_REF')=='refs/heads/main','Only main may prepare or publish'
    approved=env.get('APPROVED_COMMIT','')
    assert re.fullmatch(r'[0-9a-f]{40}',approved),'Full lowercase approved commit SHA required'
    assert approved==env.get('GITHUB_SHA'),'Dispatch commit differs from approved commit'

def validate_configuration(workflows,vercel):
    # BaseLoader keeps YAML's `on` and boolean-looking strings unambiguous.
    sync=workflows['sync-huggingface.yml']
    assert set(sync['on'])=={'workflow_dispatch'},'HF must have only a manual trigger'
    inputs=sync['on']['workflow_dispatch']['inputs']
    assert inputs['approved_commit']['required']=='true' and inputs['approved_commit']['type']=='string'
    assert inputs['publish_approved']['type']=='boolean' and inputs['publish_approved']['default']=='false'
    assert sync['permissions']=={'contents':'read'}
    assert set(sync['jobs'])=={'validate','publish'}
    assert sync['jobs']['publish']['needs']=='validate'
    assert sync['jobs']['publish']['if']==PUBLISH_CONDITION,'Publication approval/main/SHA gate changed'
    prepare=sync['jobs']['validate'];publish=sync['jobs']['publish']
    for job in [prepare,publish]:
        assert job['env']['APPROVED_COMMIT']=='${{ inputs.approved_commit }}'
        assert any('--request' in s.get('run','') for s in job['steps'])
        assert all(s.get('with',{}).get('persist-credentials')=='false' for s in job['steps'] if s.get('uses','').startswith('actions/checkout@'))
    assert 'HF_TOKEN' not in json.dumps(prepare),'Preparation must not receive HF credentials'
    for command in ['validate_core.py','validate_intake.py','validate_brain.py','validate_entities.py','validate_site.py','build_public_rag.py --check','unittest discover','rag.evaluate']:
        assert command in json.dumps(prepare),f'Missing validator: {command}'
    upload=next(s for s in prepare['steps'] if s.get('uses','').startswith('actions/upload-artifact@'))
    download=next(s for s in publish['steps'] if s.get('uses','').startswith('actions/download-artifact@'))
    assert upload['with']['name']==download['with']['name']=='hf-export-${{ github.sha }}'
    assert 'delete_patterns' not in json.dumps(sync),'No implicit downstream file deletion'
    publisher=re.compile(r'HfApi|upload_folder|push_to_hub|\bhf\s+upload|vercel\s+(?:deploy|--prod)',re.I)
    for name,w in workflows.items():
        for job in w['jobs'].values():
            for step in job.get('steps',[]):
                for block in re.findall(r"python - <<'PY'\n(.*?)^PY$",step.get('run',''),re.M|re.S):
                    ast.parse(block)
        if publisher.search(json.dumps(w)):
            assert name=='sync-huggingface.yml','Additional publisher requires explicit review'
            assert not publisher.search(json.dumps(w['jobs']['validate'])),'Publisher escaped manual approval job'
    enabled=vercel['git']['deploymentEnabled']
    assert enabled['main'] is False and enabled['codex/phase2-reviewed-audit-20261009'] is False
    assert all(v is False for v in enabled.values()),'Overlapping true Vercel rule could enable main'

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--request',action='store_true');args=parser.parse_args()
    if args.request:
        validate_request(os.environ)
        print('Manual main request matches the approved commit; publication still requires the job approval flag.')
        return
    import yaml
    workflows={p.name:yaml.load(p.read_text(encoding='utf-8'),Loader=yaml.BaseLoader) for p in (ROOT/'.github/workflows').iterdir() if p.suffix in {'.yml','.yaml'}}
    validate_configuration(workflows,json.loads((ROOT/'vercel.json').read_text(encoding='utf-8')))
    print('Release safety valid: manual HF approval/main/SHA gates, no other repository workflow publisher, main and PR Vercel Git blocks. External project settings/hooks not verified here.')

if __name__=='__main__':main()
