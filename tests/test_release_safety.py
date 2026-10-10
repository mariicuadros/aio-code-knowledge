"""Regressions that could publish during integration must fail before merge."""
import copy
import json
from pathlib import Path
import unittest
import yaml
from scripts.validate_release_safety import validate_configuration,validate_request

ROOT=Path(__file__).resolve().parents[1]

class ReleaseSafetyTests(unittest.TestCase):
    def setUp(self):
        self.workflows={p.name:yaml.load(p.read_text(encoding='utf-8'),Loader=yaml.BaseLoader) for p in (ROOT/'.github/workflows').iterdir() if p.suffix in {'.yml','.yaml'}}
        self.vercel=json.loads((ROOT/'vercel.json').read_text(encoding='utf-8'))

    def test_current_configuration_preserves_validators_and_separates_publication(self):
        validate_configuration(self.workflows,self.vercel)

    def test_only_exact_manual_main_request_is_accepted(self):
        valid={'GITHUB_EVENT_NAME':'workflow_dispatch','GITHUB_REF':'refs/heads/main','APPROVED_COMMIT':'a'*40,'GITHUB_SHA':'a'*40}
        validate_request(valid)
        for key,value in [('GITHUB_EVENT_NAME','push'),('GITHUB_EVENT_NAME','pull_request'),('GITHUB_REF','refs/heads/codex/phase2-reviewed-audit-20261009'),('APPROVED_COMMIT','a'*7),('APPROVED_COMMIT','b'*40),('APPROVED_COMMIT','$(untrusted)'),('GITHUB_SHA','b'*40)]:
            with self.subTest(key=key,value=value),self.assertRaises(AssertionError):validate_request(valid|{key:value})

    def test_push_schedule_and_workflow_run_triggers_are_rejected(self):
        for event in ['push','schedule','workflow_run','repository_dispatch']:
            changed=copy.deepcopy(self.workflows);changed['sync-huggingface.yml']['on'][event]={}
            with self.subTest(event=event),self.assertRaises(AssertionError):validate_configuration(changed,self.vercel)

    def test_approval_bypass_and_credential_leak_into_prepare_are_rejected(self):
        for mode in ['approval','default','secret','validator']:
            changed=copy.deepcopy(self.workflows);sync=changed['sync-huggingface.yml']
            if mode=='approval':sync['jobs']['publish']['if']='true'
            if mode=='default':sync['on']['workflow_dispatch']['inputs']['publish_approved']['default']='true'
            if mode=='secret':sync['jobs']['validate']['env']['HF_TOKEN']='${{ secrets.HF_TOKEN }}'
            if mode=='validator':
                for step in sync['jobs']['validate']['steps']:
                    if 'run' in step:step['run']=step['run'].replace('python scripts/validate_entities.py','')
            with self.subTest(mode=mode),self.assertRaises(AssertionError):validate_configuration(changed,self.vercel)

    def test_additional_publisher_is_rejected(self):
        changed=copy.deepcopy(self.workflows);changed['new-publisher.yml']={'on':{'push':{}},'jobs':{'upload':{'steps':[{'run':'hf upload external/repo .'}]}}}
        with self.assertRaises(AssertionError):validate_configuration(changed,self.vercel)

    def test_main_or_overlapping_vercel_enablement_is_rejected(self):
        for branch in ['main','*']:
            changed=copy.deepcopy(self.vercel);changed['git']['deploymentEnabled'][branch]=True
            with self.subTest(branch=branch),self.assertRaises(AssertionError):validate_configuration(self.workflows,changed)

if __name__=='__main__':unittest.main()
