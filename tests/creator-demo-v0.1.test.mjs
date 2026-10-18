import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
test('fictional offline walkthrough enforces approval, redaction and revision withdrawal',()=>{
 const out=execFileSync(process.execPath,['scripts/demo-creator-workflow-v0.1.mjs'],{encoding:'utf8',timeout:10000});
 const result=JSON.parse(out);
 assert.equal(result.production,false);
 assert.deepEqual(result.steps.map(x=>x.step),['created','draft_private','reviewed','approved','public_preview','edited','prior_approval_withdrawn','durable_history']);
 assert.equal(result.steps[4].passport.works[0].recordId,'WORK-001');
 assert.equal(result.steps[7].versions,4);
 for(const forbidden of ['NOT_FOR_PUBLIC_EXPORT','GRANT-001','privateContact'])assert.equal(out.includes(forbidden),false);
});
