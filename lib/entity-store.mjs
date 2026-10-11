import { mkdir, readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { state, textBlob, commitFiles } from './vault-client.mjs';
import { ApiError, fail } from './entity-domain.mjs';
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
    const snapshot=await state(this.readToken);
    const entries=snapshot.entries.filter(e=>e.type==='blob'&&new RegExp('^'+prefix+'ENT-[a-f0-9-]{36}/[0-9]{8}\\.json$').test(e.path));
    if(entries.length>1000) fail('vault_record_limit',503);
    const records=[];
    // Sequential provider reads deliberately bound API concurrency.
    for(const entry of entries) records.push(JSON.parse(await textBlob(entry.sha,this.readToken)));
    return records;
  }
  async append(record) {
    if(!this.writeToken) fail('vault_write_not_configured',503);
    const all=await this.all();
    const duplicate=all.find(r=>r.operationKey===record.operationKey);
    if(duplicate) { if(duplicate.operationHash!==record.operationHash) fail('idempotency_conflict',409); return duplicate; }
    const current=all.filter(r=>r.id===record.id).sort((a,b)=>b.version-a.version)[0];
    if((current?.version||0)!==record.version-1) fail('revision_conflict',409);
    const path=prefix+record.id+'/'+String(record.version).padStart(8,'0')+'.json';
    const marker=prefix+'operations/'+record.operationKey+'.json';
    try {
      const result=await commitFiles(this.writeToken,[{path,content:JSON.stringify(record)},{path:marker,content:JSON.stringify({hash:record.operationHash,id:record.id,version:record.version})}],'Entity Console immutable revision',marker);
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
