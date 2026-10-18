import { createHash, generateKeyPairSync, sign, randomUUID } from 'node:crypto';
import { hash } from '../lib/entity-domain.mjs';
import { registryAuthority } from '../lib/canonical-registry-domain.mjs';
import { CanonicalRegistry } from '../lib/canonical-registry-service.mjs';
import { CanonicalRegistryVaultStore } from '../lib/canonical-registry-store.mjs';

// Entire provider is in memory. Unknown requests fail; no network fallback.
export class MockPrivateGit {
  constructor() {
    this.serial=0;this.blobs=new Map();this.trees=new Map();this.commits=new Map();this.refWrites=0;this.treeWrites=0;
    this.head=this.sha();const tree=this.sha();this.trees.set(tree,[]);this.commits.set(this.head,{tree:{sha:tree},parents:[]});
    this.beforeRef=null;this.failRef=null;this.private=true;
  }
  sha(){return createHash('sha1').update('synthetic-'+this.serial++).digest('hex');}
  entries(){return structuredClone(this.trees.get(this.commits.get(this.head).tree.sha));}
  contents(){return Object.fromEntries(this.entries().map(e=>[e.path,this.blobs.get(e.sha)]));}
  seed(path,record) {
    const id=this.sha();this.blobs.set(id,JSON.stringify(record));
    const entries=this.entries();entries.push({path,type:'blob',sha:id});const tree=this.sha();this.trees.set(tree,entries);
    const next=this.sha();this.commits.set(next,{tree:{sha:tree},parents:[this.head]});this.head=next;
  }
  addCase(overrides={}) {
    const data={canonicalEntityId:null,canonicalName:'SYNTHETIC ENTITY',type:'organization',description:'Synthetic test record only.',alternateNames:[],areas:[],socials:[],officialUrls:[],location:'',locationAuthorized:false,relationships:[],claims:[],rightsHolder:'PRIVATE HOLDER CANARY',useAuthorized:false,lastReviewed:'2026-10-17',publicFields:[],typeDetail:'PRIVATE DETAIL CANARY',...overrides.data};
    const record={id:'ENT-'+randomUUID(),tenant:'admin-console',eventId:randomUUID(),version:1,createdAt:'2026-10-17T12:00:00Z',updatedAt:'2026-10-17T12:00:00Z',status:'draft',data,approvedVersion:null,approvedDataHash:null,packageData:null,publicUrl:null,operationKey:randomUUID(),operationHash:'fixture',activity:[],...overrides};record.data=data;
    this.seed('entity-console/v1/'+record.id+'/'+String(record.version).padStart(8,'0')+'.json',record);return record;
  }
  fetch=async(input,options={})=>{
    const url=new URL(input);if(url.origin!=='https://api.github.com'||!url.pathname.startsWith('/repos/mariicuadros/aio-code-vault'))throw Error('Network forbidden by mock');
    const path=url.pathname.slice('/repos/mariicuadros/aio-code-vault'.length),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;
    if(path==='')return Response.json({private:this.private});
    if(path==='/git/ref/heads/main')return Response.json({object:{sha:this.head}});
    if(path.startsWith('/git/commits/')&&method==='GET')return Response.json(this.commits.get(path.split('/').at(-1)));
    if(path.startsWith('/git/trees/')&&method==='GET')return Response.json({tree:this.trees.get(path.split('/').at(-1)),truncated:false});
    if(path.startsWith('/git/blobs/'))return Response.json({encoding:'base64',content:Buffer.from(this.blobs.get(path.split('/').at(-1))).toString('base64')});
    if(path==='/git/trees'&&method==='POST') {
      this.treeWrites++;const entries=structuredClone(this.trees.get(body.base_tree));
      for(const f of body.tree){if(entries.some(e=>e.path===f.path))throw Error('Immutable path overwrite');const sha=this.sha();this.blobs.set(sha,f.content);entries.push({path:f.path,type:'blob',sha});}
      const sha=this.sha();this.trees.set(sha,entries);return Response.json({sha});
    }
    if(path==='/git/commits'&&method==='POST'){const sha=this.sha();this.commits.set(sha,{tree:{sha:body.tree},parents:body.parents});return Response.json({sha});}
    if(path==='/git/refs/heads/main'&&method==='PATCH') {
      if(body.force!==false)throw Error('Force forbidden');
      if(this.beforeRef){const hook=this.beforeRef;this.beforeRef=null;await hook();}
      if(this.failRef==='conflict')return Response.json({},{status:409});
      if(this.failRef==='before')throw Error('PRIVATE PROVIDER FAILURE');
      if(this.commits.get(body.sha).parents[0]!==this.head)return Response.json({},{status:409});
      this.head=body.sha;this.refWrites++;
      if(this.failRef==='after')throw Error('PRIVATE LOST ACK');
      return Response.json({});
    }
    throw Error('Unknown mock request');
  };
}
export function fixture(t) {
  const git=new MockPrivateGit();const original=globalThis.fetch;globalThis.fetch=git.fetch;t.after(()=>{globalThis.fetch=original;});
  const {privateKey,publicKey}=generateKeyPairSync('ed25519');
  const clock=()=>Date.now();const issuer='synthetic-review-authority',audience='canonical-registry-v1';
  const authority=registryAuthority({publicKey:publicKey.export({type:'spki',format:'pem'}),issuer,audience,clock});
  const makeRegistry=()=>new CanonicalRegistry({authority,store:new CanonicalRegistryVaultStore({readToken:'synthetic-read',writeToken:'synthetic-write'})});
  const capability=(command,overrides={})=>{
    const now=Math.floor(clock()/1000);const claims={issuer,audience,subject:command.action==='request'?'synthetic-operator':'synthetic-registrar',role:command.action==='request'?'operator':'registrar',scope:'canonical:'+command.action,issued_at:now,expires_at:now+120,command_hash:hash(command),...overrides};
    const encoded=Buffer.from(JSON.stringify(claims)).toString('base64url');return encoded+'.'+sign(null,Buffer.from(encoded),privateKey).toString('base64url');
  };
  const registry=makeRegistry();const run=c=>registry.change(c,capability(c));
  return {git,registry,makeRegistry,capability,run,authority};
}
export function request(caseRecord,overrides={}) {
  return {schema_version:1,action:'request',request_id:'REQ-'+randomUUID(),expected_version:0,case_id:caseRecord.id,case_revision:caseRecord.version,case_hash:hash(caseRecord.data),reason:'Synthetic independent identity request',payload:{name:caseRecord.data.canonicalName,type:caseRecord.data.type,namespace:'DEMO',evidence_refs_private:['synthetic-private-evidence/ref-001']},key:randomUUID(),...overrides};
}
export function next(command,event,action,payload={}) {return {...command,action,expected_version:event.version,payload,key:randomUUID()};}
export const reviewed={decision:'approved',identity_checked:true,sources_checked:true,homonyms_resolved:true,rights_authorized:true,evidence_refs_private:['synthetic-private-evidence/review-001']};
export async function approve(f,c) {let e=await f.run(c);const review=next(c,e,'review',reviewed);e=await f.run(review);return {command:review,event:e};}
