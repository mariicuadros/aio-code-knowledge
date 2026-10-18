// Phase 2 isolated filesystem prototype. NOT for serverless/Vercel or production.
// Append-only per-revision files, exclusive creation, fail closed on invalid state.
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {validateCreatorBundle} from './creator-workflow-private-v0.1.mjs';
import {buildPublicCreatorPassport} from './creator-passport-public-v0.1.mjs';
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const clone=v=>structuredClone(v);
const reject=code=>{throw new Error(code)};
function validKey(v){if(typeof v!=='string'||!/^[A-Z][A-Z0-9-]{2,63}$/.test(v))reject('invalid_record_key');return v}
export class LocalCreatorRecordsStore {
 constructor(directory){if(typeof directory!=='string'||!directory)reject('invalid_directory');this.directory=directory}
 async init(){await mkdir(this.directory,{recursive:true});return this}
 filename(key,revision){return join(this.directory,validKey(key)+'--'+String(revision).padStart(8,'0')+'.json')}
 async versions(key){
  validKey(key);
  const prefix=key+'--';
  const filenames=(await readdir(this.directory)).filter(s=>s.startsWith(prefix)&&/^\d{8}\.json$/.test(s.slice(prefix.length))).sort();
  const values=[];
  for(const file of filenames){
   const value=JSON.parse(await readFile(join(this.directory,file),'utf8'));
   if(value.key!==key||value.revision!==values.length+1||!['draft','review','approved','archived'].includes(value.status)||digest(value.bundle)!==value.bundleHash)reject('corrupted_history');
   values.push(value);
  }
  return values;
 }
 async latest(key){const versions=await this.versions(key);return versions.at(-1)??null}
 async append(key,{expectedRevision,bundle,status,approvedRevision=null}){
  validKey(key);
  const prev=await this.latest(key);
  const n=prev?prev.revision+1:1;
  if(expectedRevision!==(prev?.revision??0))reject('revision_conflict');
  if(!['draft','review','approved','archived'].includes(status))reject('invalid_status');
  validateCreatorBundle(bundle);
  if(status==='approved'&&(!prev||prev.status!=='review'||approvedRevision!==prev.revision))reject('approval_requires_exact_review');
  if(status!=='approved'&&approvedRevision!==null)reject('approval_not_allowed');
  const entry={key,revision:n,status,approvedRevision,bundle:clone(bundle),bundleHash:digest(bundle),at:new Date().toISOString()};
  await writeFile(this.filename(key,n),JSON.stringify(entry),'utf8',{flag:'wx',mode:0o600});
  return clone(entry);
 }
 async create(key,bundle){return this.append(key,{expectedRevision:0,bundle,status:'draft'})}
 async edit(key,expectedRevision,bundle){const previous=await this.latest(key);if(!previous||previous.status==='archived')reject('not_editable');return this.append(key,{expectedRevision,bundle,status:'draft'})}
 async review(key,expectedRevision){const p=await this.latest(key);if(!p||p.status!=='draft')reject('review_requires_draft');return this.append(key,{expectedRevision,bundle:p.bundle,status:'review'})}
 async approve(key,expectedRevision){const p=await this.latest(key);if(!p||p.status!=='review')reject('approval_requires_review');return this.append(key,{expectedRevision,bundle:p.bundle,status:'approved',approvedRevision:p.revision})}
 async archive(key,expectedRevision){const p=await this.latest(key);if(!p||p.status==='archived')reject('already_archived');return this.append(key,{expectedRevision,bundle:p.bundle,status:'archived'})}
 async publicPassport(key,{approvedWorkIds=[],approvedEntityFields=[]}={}){
  const p=await this.latest(key);
  if(!p||p.status!=='approved'||p.approvedRevision!==p.revision-1)reject('no_active_approval');
  return buildPublicCreatorPassport({entity:p.bundle.entity,works:p.bundle.works,approvedWorkIds,approvedEntityFields});
 }
}
