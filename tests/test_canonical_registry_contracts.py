"""Versioned contracts tested against runtime-generated synthetic Git fixtures."""
import copy
import json
import subprocess
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT=Path(__file__).resolve().parents[1]
class RegistryContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        script="""
import { fixture, request, next, reviewed } from './tests/canonical-registry-fixtures.mjs';
import { hash } from './lib/entity-domain.mjs';
import { EntityService } from './lib/entity-service.mjs';
import { VaultStore } from './lib/entity-store.mjs';
const f=fixture({after(){}}),record=f.git.addCase();const commands=[],events=[];
let c=request(record),e;
for(const action of ['request','review','reserve','bind','withdraw']) {
 if(action==='review')c=next(c,e,action,reviewed);
 if(action==='reserve')c=next(c,e,action,{canonical_id:'DEMO-001'});
 if(action==='bind')c=next(c,e,action);
 if(action==='withdraw') {const r=await new EntityService(new VaultStore('synthetic-read','')).get(record.id);c={...next(c,e,action),case_revision:r.version,case_hash:hash(r.data)};}
 commands.push(c);e=await f.run(c);events.push(e);
}
console.log(JSON.stringify({commands,events}));
"""
        cls.fixtures=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=ROOT,text=True,encoding='utf-8'))
    def validator(self,name):
        schema=json.loads((ROOT/'schemas'/f'canonical-registry-{name}-v1.schema.json').read_text(encoding='utf-8'))
        Draft202012Validator.check_schema(schema)
        return Draft202012Validator(schema,format_checker=FormatChecker())
    def test_runtime_commands_match_versioned_schema(self):
        v=self.validator('command')
        for c in self.fixtures['commands']:v.validate(c)
    def test_runtime_events_match_versioned_schema(self):
        v=self.validator('event')
        for e in self.fixtures['events']:v.validate(e)
    def test_unknown_fields_versions_and_approval_gaps_rejected(self):
        v=self.validator('command')
        for original in self.fixtures['commands']:
            c=copy.deepcopy(original);c['admin_token']='synthetic-canary';self.assertFalse(v.is_valid(c))
            c=copy.deepcopy(original);c['schema_version']=2;self.assertFalse(v.is_valid(c))
        c=copy.deepcopy(self.fixtures['commands'][1]);c['payload']['homonyms_resolved']=False;self.assertFalse(v.is_valid(c))
    def test_events_cannot_authorize_publication(self):
        v=self.validator('event')
        for original in self.fixtures['events']:
            e=copy.deepcopy(original);e['publication_authorized']=True;self.assertFalse(v.is_valid(e))
