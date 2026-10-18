import { mkdir, readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { state, textBlob, commitFiles } from './vault-client.mjs';
import { ApiError, fail, assertCanonicalLinkPreserved } from './entity-domain.mjs';
const prefix='entity-console/v1/';
export class LocalStore {
  constructor(directory) { this.directory=resolve(directory); this.queue=Promise.resolve(); }
  async all() {
    await mkdir(this.directory,{recursive:true});
    const names=await readdir(this.directory);
    return Promise.all(names.filter(n=>/^event-[a-f0-9-]+\.json$/.test(n)).map(async n=>JSON.parse(await readFile(resolve(this.directory,n),'utf8'))));
  }
  async append(record) {
    const job=this.queue.then(async()=>{
      const all=await this.all();
      const duplicate=all.find(r=>r.operationKey===record.operationKey);
      if(duplicate) { if(duplicate.operationHash!==record.operationHash) fail('idempotency_conflict',409); return duplicate; }
      const current=all.filter(r=>r.id===record.id).sort((a,b)=>b.version-a.version)[0];
      assertCanonicalLinkPreserved(current,record);
      if(record.data?.canonicalEntityId) {
        const latest=new Map();
        for(const item of all) if(!latest.has(item.id)||latest.get(item.id).version<item.version) latest.set(item.id,item);
        if([...latest.values()].some(item=>item.id!==record.id&&item.status!=='archived'&&item.data?.canonicalEntityId===record.data.canonicalEntityId)) fail('canonical_link_conflict',409);
      }
      if((current?.version||0)!==record.version-1) fail('revision_conflict',409);
      const tmp=resolve(this.directory,'.tmp-'+randomUUID());
      await writeFile(tmp,JSON.stringify(record),{mode:0o600,flag:'wx'});
      await rename(tmp,resolve(this.directory,'event-'+record.eventId+'.json'));
      return record;
    });
    this.queue=job.catch(()=>{});
    return job;
  }
}
export class VaultStore {
  constructor(readToken,writeToken) { this.readToken=readToken; this.writeToken=writeToken; }
  async all() {
    if(!this.readToken) fail('vault_not_configured',503);
    return this.recordsFromSnapshot(await state(this.readToken));
  }
  async recordsFromSnapshot(snapshot) {
    if(!snapshot||!Array.isArray(snapshot.entries)) fail('vault_tree_invalid',503);
    let entries;
    try {
      entries=snapshot.entries.filter(e=>e&&e.type==='blob'&&typeof e.path==='string'&&new RegExp('^'+prefix+'ENT-[a-f0-9-]{36}/[0-9]{8}\\.json$').test(e.path));
    } catch { fail('vault_record_selection_failed',503); }
    if(entries.length>1000) fail('vault_record_limit',503);
    const records=[];
    for(const entry of entries) {
      let raw;
      try { raw=await textBlob(entry.sha,this.readToken); }
      catch(error) { if(error?.vaultReadStage) throw error; fail('vault_record_read_failed',503); }
      try { records.push(JSON.parse(raw)); }
      catch { fail('vault_record_parse_failed',503); }
    }
    return records;
  }
  async append(record) {
    if(!this.writeToken) fail('vault_write_not_configured',503);
    const all=await this.all();
    const duplicate=all.find(r=>r.operationKey===record.operationKey);
    if(duplicate) { if(duplicate.operationHash!==record.operationHash) fail('idempotency_conflict',409); return duplicate; }
    const current=all.filter(r=>r.id===record.id).sort((a,b)=>b.version-a.version)[0];
    if((current?.version||0)!==record.version-1) fail('revision_conflict',409);
    assertCanonicalLinkPreserved(current,record);
    const path=prefix+record.id+'/'+String(record.version).padStart(8,'0')+'.json';
    const marker=prefix+'operations/'+record.operationKey+'.json';
    // Check the latest immutable Vault state before each optimistic commit,
    // not just before the first commit attempt. This protects canonical links
    // and revision numbers when two writers race on the same Git ref.
    const preflight=async snapshot=>{
      const records=await this.recordsFromSnapshot(snapshot);
      const seen=records.find(r=>r.operationKey===record.operationKey);
      if(seen) fail('idempotency_conflict',409);
      const latest=new Map();
      for(const item of records) if(!latest.has(item.id)||latest.get(item.id).version<item.version) latest.set(item.id,item);
      const previous=latest.get(record.id);
      if((previous?.version||0)!==record.version-1) fail('revision_conflict',409);
      assertCanonicalLinkPreserved(previous,record);
      const target=record.data?.canonicalEntityId;
      if(target&&[...latest.values()].some(item=>item.id!==record.id&&item.status!=='archived'&&item.data?.canonicalEntityId===target)) fail('canonical_link_conflict',409);
    };
    try {
      const result=await commitFiles(this.writeToken,[{path,content:JSON.stringify(record)},{path:marker,content:JSON.stringify({hash:record.operationHash,id:record.id,version:record.version})}],'Entity Console immutable revision',marker,preflight);
      if(result.status==='already_collected') {
        const after=(await this.all()).find(r=>r.operationKey===record.operationKey);
        if(!after||after.operationHash!==record.operationHash) fail('idempotency_conflict',409);
        return after;
      }
      return record;
    } catch(error) {
      if(error instanceof ApiError) throw error;
      // A competing writer may have won the same version. Never retry a stale approval.
      const after=await this.all();
      const retry=after.find(r=>r.operationKey===record.operationKey);
      if(retry&&retry.operationHash===record.operationHash) return retry;
      if(after.some(r=>r.id===record.id&&r.version>=record.version)) fail('revision_conflict',409);
      fail('vault_unavailable',503);
    }
  }
}
let local;
export function configuredStore() {
  if(process.env.AIO_ENTITY_STORE==='local') {
    if(process.env.VERCEL||process.env.NODE_ENV==='production'||process.env.AIO_ENTITY_LOCAL_ENABLED!=='1') fail('local_store_forbidden',503);
    if(!process.env.AIO_ENTITY_LOCAL_DIR) fail('local_directory_required',503);
    return local ||= new LocalStore(process.env.AIO_ENTITY_LOCAL_DIR);
  }
  return new VaultStore(process.env.AIO_VAULT_READ_TOKEN,process.env.AIO_VAULT_WRITE_TOKEN);
}
