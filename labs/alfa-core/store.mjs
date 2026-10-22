import { readFile, writeFile, rename, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { initial, owns, validateState, check } from './catalog.mjs';
// Directory is a fresh mkdtemp created by launcher, never a request/environment path.
export class SyntheticStore {
  constructor(directory){this.directory=directory;this.queue=Promise.resolve();}
  path(user,entity){owns(user,entity);return join(this.directory,user+'-'+entity+'.json');}
  async read(user,entity){
    const path=this.path(user,entity);let raw;
    try{check(!(await lstat(path)).isSymbolicLink(),'corrupt_memory');raw=await readFile(path,'utf8');}
    catch(e){if(e.code==='ENOENT')return initial(user,entity);throw e;}
    check(raw.length<=500000,'corrupt_memory');
    try{return validateState(JSON.parse(raw),user,entity);}catch{throw Object.assign(new Error('corrupt_memory'),{code:'corrupt_memory'});}
  }
  async inspect(user,entity,inspect){
    const job=this.queue.then(async()=>inspect(await this.read(user,entity)));
    this.queue=job.catch(()=>{});return job;
  }
  async update(user,entity,revision,mutate){
    const job=this.queue.then(async()=>{
      const s=await this.read(user,entity);check(s.revision===revision,'revision_conflict');check(s.revision<1000,'capacity');
      const next=validateState(mutate(structuredClone(s)),user,entity),path=this.path(user,entity),tmp=path+'.tmp';
      await writeFile(tmp,JSON.stringify(next),{mode:0o600,flag:'wx'});
      await rename(tmp,path);return next;
    });this.queue=job.catch(()=>{});return job;
  }
}
