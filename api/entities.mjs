import { adminHeaderAuthorized, json } from '../lib/private-auth.mjs';
import { configuredStore } from '../lib/entity-store.mjs';
import { EntityService } from '../lib/entity-service.mjs';
import { ApiError, fail } from '../lib/entity-domain.mjs';
const windows=new Map();
export async function handle(request,store) {
  try {
    if(!adminHeaderAuthorized(request)) return json({error:{code:'unauthorized'}},401);
    // Single administrator MVP: a dedicated server credential, never tenant IDs from clients.
    const slot=Math.floor(Date.now()/60000), hits=windows.get(slot)||0;
    windows.clear();windows.set(slot,hits+1);
    if(hits>=120) return json({error:{code:'rate_limited'}},429,{'retry-after':'60'});
    const url=new URL(request.url),id=url.searchParams.get('id'),action=url.searchParams.get('action');
    const service=new EntityService(store||configuredStore());
    if(request.method==='GET') {
      if(action&&action!=='status') fail('invalid_action');
      const data=id?await service.get(id):await service.list();
      // Internal request hashes and tenant bookkeeping do not leave the backend.
      const clean=r=>{const {operationKey,operationHash,tenant,...visible}=r;return visible;};
      return json({data:Array.isArray(data)?data.map(clean):clean(data),mode:process.env.AIO_ENTITY_STORE==='local'?'local_test_persistence':'private_vault'});
    }
    if(!['POST','PATCH'].includes(request.method)) return json({error:{code:'method_not_allowed'}},405,{allow:'GET, POST, PATCH'});
    if(!request.headers.get('content-type')?.startsWith('application/json')) fail('json_required',415);
    const reader=request.body?.getReader(); let size=0,chunks=[];
    if(reader) while(true) { const {value,done}=await reader.read(); if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();fail('payload_too_large',413);}chunks.push(value); }
    let body; try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail('invalid_json');}
    if(!body||typeof body!=='object'||Array.isArray(body)) fail('invalid_json');
    const operation=request.method==='PATCH'?'edit':id?action:'create';
    if(!operation||(!id&&action)) fail('invalid_action');
    const record=await service.change({id:id||undefined,action:operation,body,key:request.headers.get('idempotency-key')});
    const {operationKey,operationHash,tenant,...data}=record;
    return json({data,mode:process.env.AIO_ENTITY_STORE==='local'?'local_test_persistence':'private_vault'},operation==='create'?201:200);
  } catch(error) {
    console.error('AIO_ENTITY_DIAGNOSTIC', {
  errorType: error?.constructor?.name,
  errorName: error?.name,
  vaultStage: ['repository', 'branch', 'commit', 'tree', 'blob']
    .includes(error?.vaultReadStage)
      ? error.vaultReadStage
      : 'none',
  hasHttpStatus: Number.isInteger(error?.status)
});// Diagnostic codes are intentionally coarse; never include provider bodies, token data, or paths.
    let code='vault_read_failed';
    if(error instanceof ApiError) code=error.code;
    else if(error?.status===401||error?.status===403) code='vault_access_denied';
    else if(error?.status===404) code='vault_repository_unavailable';
    else if(error?.status===429) code='vault_provider_rate_limited';
    else if(Number.isInteger(error?.status)&&error.status>=500) code='vault_provider_unavailable';
    else if(error?.name==='TimeoutError'||error?.name==='AbortError'||error instanceof TypeError) {
      // Never mislabel processing errors as network failures. Only fixed labels leave the server.
      const stage=['repository','branch','commit','tree','blob'].includes(error?.vaultReadStage)?error.vaultReadStage:null;
      code=stage?'vault_'+stage+'_network_unavailable':error instanceof TypeError?'vault_read_failed':'vault_network_unavailable';
    }
    return json({error:{code}},error instanceof ApiError?error.status:503);
  }
}
export const GET=handle;
export const POST=handle;
export const PATCH=handle;
