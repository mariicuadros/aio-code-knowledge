// Fase 2 isolated HTTP rehearsal. No remote persistence or publication.
// Supports POST only, requires existing administrative header, processes fictional inputs in memory.
import {adminHeaderAuthorized,json} from '../lib/private-auth.mjs';
import {previewCreatorWorkflow} from '../lib/creator-workflow-private-v0.1.mjs';
export async function handle(request){
 if(!adminHeaderAuthorized(request))return json({error:{code:'unauthorized'}},401);
 if(request.method!=='POST')return json({error:{code:'method_not_allowed'}},405,{allow:'POST'});
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:{code:'json_required'}},415);
 // Strict limit: no real client data or Vault access.
 let body;try{
  const bytes=new Uint8Array(await request.arrayBuffer());
  if(bytes.byteLength>32768)return json({error:{code:'payload_too_large'}},413);
  body=JSON.parse(Buffer.from(bytes).toString('utf8'));
 }catch{return json({error:{code:'invalid_json'}},400)}
 try{
  if(!body||Object.keys(body).some(k=>!['bundle','request','selectedWorkIds','approvedEntityFields'].includes(k)))throw new Error('invalid_fields');
  const result=previewCreatorWorkflow(body);
  return json({data:result,mode:'simulation_only',persisted:false},200,{'cache-control':'no-store'});
 }catch{
  return json({error:{code:'invalid_creator_workflow'}},400,{'cache-control':'no-store'});
 }
}
export const POST=request=>handle(request);
