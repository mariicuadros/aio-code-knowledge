#!/usr/bin/env node
/**
 * Offline staging only. Does not connect to GitHub/Vault, open a PR, mutate a
 * public source tree or print confidential revision contents.
 *
 * node scripts/prepare_public_update_proposal.mjs
 *   --revision /outside/git/approved-revision.json
 *   --out /outside/git/danisan-review-proposal.json
 */
import { readFileSync, writeFileSync, statSync, realpathSync } from 'node:fs';
import { resolve, dirname, relative, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preparePublicUpdateProposal } from '../lib/public-update-proposal.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const outside=path=>{const r=relative(root,path);return r==='..'||r.startsWith('..'+sep)||isAbsolute(r);};
function checkedInput(path) {
  if(!isAbsolute(path))throw Error('absolute_path_required');
  const real=realpathSync(path);
  if(!outside(real)||!statSync(real).isFile()||statSync(real).size>1024*1024)throw Error('private_input_location_invalid');
  return real;
}
function checkedOutput(path) {
  if(!isAbsolute(path))throw Error('absolute_path_required');
  const parent=realpathSync(dirname(path));
  if(!outside(parent))throw Error('output_must_be_outside_git');
  return resolve(parent, path.split(/[\\/]/).at(-1));
}
try {
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=='--revision'||args[2]!=='--out')throw Error('usage');
  const input=checkedInput(args[1]),output=checkedOutput(args[3]);
  const record=JSON.parse(readFileSync(input,'utf8'));
  const result=preparePublicUpdateProposal({record,id:'DAN-001',root});
  // Exclusive create: no accidental overwrite or automatic publication.
  writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({status:result.status,entityId:result.entityId,sourceVersion:result.source.recordVersion,changes:result.changes.map(x=>({field:x.field,rule:x.rule})),blocks:result.blocks,storedOutsideGit:true}));
} catch(error) {
  // Fixed status codes only; never echo file contents, names or private values.
  const allowed=new Set(['unregistered_entity','invalid_private_revision','approved_revision_required','approval_hash_mismatch','approved_projection_mismatch','canonical_identity_mismatch','private_record_id_in_projection','public_baseline_inconsistent','usage','absolute_path_required','private_input_location_invalid','output_must_be_outside_git']);
  console.error(JSON.stringify({error:allowed.has(error?.code)?error.code:allowed.has(error?.message)?error.message:'proposal_preparation_failed'}));
  process.exitCode=1;
}
