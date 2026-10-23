// Phase 2 isolated Vault adapter experiment, injection-only. NOT wired to production.
import {createHash} from 'node:crypto';
import {validateCreatorBundle} from './creator-workflow-private-v0.1.mjs';
const pathFor=(key,n)=>'creator-records/v1/'+key+'/'+String(n).padStart(8,'0')+'.json';
const validKey=key=>typeof key==='string'&&/^CASE-[A-Z0-9-]{3,59}$/.test(key);
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fail=code=>{throw new Error(code)};
export class CreatorVaultAdapter {
 constructor({readSnapshot,readBlob,commit,readToken,writeToken}){
  if(typeof readSnapshot!=='function'||typeof readBlob!=='function'||typeof commit!=='function')fail('missing_dependencies');
  this.readSnapshot=readSnapshot;this.readBlob=readBlob;this.commit=commit;this.readToken=readToken;this.writeToken=writeToken;
 }
 async fromSnapshot(snapshot,key){
  if(!validKey(key)||!snapshot||!Array.isArray(snapshot.entries)||snapshot.entries.length>20000||snapshot.entries.some(e=>!e||typeof e.path!=='string'))fail('invalid_vault_snapshot');
  const prefix='creator-records/v1/'+key+'/';
  const entries=snapshot.entries.filter(e=>e.path.startsWith(prefix));
  if(entries.length>1000)fail('record_limit');
  if(entries.some(e=>e.type!=='blob'||!new RegExp('^'+prefix+'[0-9]{8}\\.json$').test(e.path)))fail('malformed_vault_path');
  entries.sort((a,b)=>a.path.localeCompare(b.path));
  const revisions=[];
  for(const item of entries){
   const record=JSON.parse(await this.readBlob(item.sha,this.readToken));
   const n=revisions.length+1;
   if(item.path!==pathFor(key,n)||record.key!==key||record.revision!==n||!['draft','review','approved','archived'].includes(record.status)||hash(record.bundle)!==record.bundleHash)fail('corrupted_history');
   validateCreatorBundle(record.bundle);
   if(n===1&&record.status!=='draft')fail('invalid_history_transition');
   if(n>1){
    const p=revisions.at(-1);
    const ok=(record.status==='draft'&&p.status!=='archived')||(record.status==='review'&&p.status==='draft')||(record.status==='approved'&&p.status==='review'&&record.approvedRevision===p.revision&&record.bundleHash===p.bundleHash)||(record.status==='archived'&&p.status!=='archived');
    if(!ok)fail('invalid_history_transition');
    if(record.status==='review'&&record.bundleHash!==p.bundleHash)fail('invalid_review_hash');
   }
   if(record.status!=='approved'&&record.approvedRevision!==null)fail('invalid_approval_binding');
   revisions.push(record);
  }
  return revisions;
 }
 async latest(key){const versions=await this.fromSnapshot(await this.readSnapshot(this.readToken),key);return versions.at(-1)??null}
 async append(record){
  const key=record?.key;
  if(!validKey(key)||!Number.isInteger(record.revision)||record.revision<1)fail('invalid_record');
  if(!this.writeToken)fail('write_disabled');
  const target=pathFor(key,record.revision);
  const preflight=async snapshot=>{
   const prior=await this.fromSnapshot(snapshot,key);
   const previous=prior.at(-1);
   if(record.revision!==(previous?.revision??0)+1)fail('revision_conflict');
   if(record.bundleHash!==hash(record.bundle))fail('invalid_bundle_hash');
   validateCreatorBundle(record.bundle);
   if(!previous&&record.status!=='draft')fail('invalid_transition');
   if(previous){
    const ok=(record.status==='draft'&&previous.status!=='archived')||(record.status==='review'&&previous.status==='draft'&&record.bundleHash===previous.bundleHash)||(record.status==='approved'&&previous.status==='review'&&record.approvedRevision===previous.revision&&record.bundleHash===previous.bundleHash)||(record.status==='archived'&&previous.status!=='archived');
    if(!ok)fail('invalid_transition');
   }
   if(record.status!=='approved'&&record.approvedRevision!==null)fail('invalid_approval_binding');
  };
  const marker='creator-records/v1/operations/'+hash([key,record.revision,record.bundleHash])+'.json';
  const result=await this.commit(this.writeToken,[{path:target,content:JSON.stringify(record)},{path:marker,content:JSON.stringify({key,revision:record.revision,hash:record.bundleHash})}],'Creator Records immutable revision',marker,preflight);
  if(result.status==='already_collected'){
   const existing=await this.latest(key);
   if(!existing||existing.revision!==record.revision||existing.bundleHash!==record.bundleHash||existing.status!==record.status)fail('idempotency_conflict');
  }
  return result;
 }
}
