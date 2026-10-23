// Phase 2 local-only HTTP handler: dependency-injected store, no Vercel entrypoint.
// No automatic external writes. Do not connect this to production routing.
import {adminHeaderAuthorized,json} from './private-auth.mjs';
const fail=(code,status=400)=>json({error:{code}},status);
const cleanError=e=>{
 const code=String(e?.message||'');
 if(code==='revision_conflict')return fail('revision_conflict',409);
 if(code==='no_active_approval')return fail('approval_required',409);
 if(code==='approval_requires_review'||code==='review_requires_draft'||code==='approval_requires_exact_review'||code==='not_editable'||code==='already_archived')return fail('invalid_transition',409);
 return fail('invalid_creator_record');
};
export async function handleLocalCreatorRecords(request,store){
 if(!adminHeaderAuthorized(request))return fail('unauthorized',401);
 // Explicit store injection is required. This is not an API route.
 if(!store||typeof store.latest!=='function'||typeof store.create!=='function')return fail('store_unavailable',503);
 const url=new URL(request.url,'http://localhost');
 const key=url.searchParams.get('key');
 if(!key||!/^CASE-[A-Z0-9-]{3,59}$/.test(key))return fail('invalid_record_key');
 try{
  if(request.method==='GET'){
    const record=await store.latest(key);
    if(!record)return fail('not_found',404);
    return json({data:record,mode:'local_private_only'});
  }
  if(request.method!=='POST')return fail('method_not_allowed',405);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return fail('json_required',415);
  const data=await request.arrayBuffer();
  if(data.byteLength>32768)return fail('payload_too_large',413);
  let body;
  try{body=JSON.parse(Buffer.from(data).toString('utf8'))}catch{return fail('invalid_json')}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['action','expectedRevision','bundle','approvedWorkIds','approvedEntityFields'].includes(k)))return fail('invalid_fields');
  const {action,expectedRevision,bundle,approvedWorkIds,approvedEntityFields}=body;
  if(action==='public_preview'){
    if(bundle!==undefined||expectedRevision!==undefined)return fail('invalid_fields');
    const result=await store.publicPassport(key,{approvedWorkIds,approvedEntityFields});
    return json({data:result,mode:'private_preview_not_published'});
  }
  if(!['create','edit','review','approve','archive'].includes(action))return fail('invalid_action');
  if(!Number.isInteger(expectedRevision)||expectedRevision<0)return fail('invalid_expected_revision');
  if((action==='create'||action==='edit')===false&&bundle!==undefined)return fail('invalid_fields');
  if(approvedWorkIds!==undefined||approvedEntityFields!==undefined)return fail('invalid_fields');
  let result;
  if(action==='create'){
    if(expectedRevision!==0||!bundle)return fail('invalid_fields');
    result=await store.create(key,bundle);
  }else if(action==='edit'){
    if(!bundle)return fail('invalid_fields');
    result=await store.edit(key,expectedRevision,bundle);
  }else if(action==='review')result=await store.review(key,expectedRevision);
  else if(action==='approve')result=await store.approve(key,expectedRevision);
  else result=await store.archive(key,expectedRevision);
  // Do not echo confidential bundle on write response.
  return json({data:{key:result.key,revision:result.revision,status:result.status},mode:'local_private_only'},action==='create'?201:200);
 }catch(e){return cleanError(e)}
}
