import { GET as insights } from './insights.mjs';
import { bearer, json } from '../lib/private-auth.mjs';
import { require, normalize } from '../lib/account-observation.mjs';
import { github, state } from '../lib/vault-client.mjs';
export function previousDay(now=new Date()){
 // Colombia uses UTC-5: calendar midnight is 05:00 UTC.
 const shifted=new Date(now.getTime()-5*3600000);
 const until=Date.UTC(shifted.getUTCFullYear(),shifted.getUTCMonth(),shifted.getUTCDate(),5)/1000;
 return {since:until-86400,until};
}
export async function collect(now=new Date()){
 const token=process.env.AIO_VAULT_WRITE_TOKEN;
 require(token&&process.env.AIO_INSIGHTS_ADMIN_TOKEN&&process.env.IG_BUSINESS_ID&&process.env.IG_LONG_TOKEN,'Collection configuration missing');
 const {since,until}=previousDay(now);
 const marker='phase-2/analytics/jobs/instagram/'+process.env.IG_BUSINESS_ID+'-'+until+'.json';
 let current=await state(token);
 if(current.entries.some(e=>e.path===marker))return {status:'already_collected',since,until};
 const query=new URLSearchParams({since:String(since),until:String(until)});
 const response=await insights(new Request('https://internal.invalid/api/insights?'+query,{headers:{authorization:'Bearer '+process.env.AIO_INSIGHTS_ADMIN_TOKEN}}));
 require(response.ok,'Instagram collection failed');
 const body=await response.json();
 require(body.account?.id===process.env.IG_BUSINESS_ID&&body.account.username==='mariicuadros','Unexpected pilot account');
 const stamp=body.fetched_at.replace(/[-:.]/g,'');
 const source='phase-2/analytics/snapshots/instagram/'+stamp+'.json';
 const raw=JSON.stringify(body),record=normalize(raw,source,'MC-001','MC-001');
 const recordPath='commercial-data/account-ledger/'+record.observation_id+'.json';
 const job={status:'collected',scope:'account',since,until,captured_at:body.fetched_at,source_ref:source,observation_ref:recordPath};
 // Commit all three records atomically. A non-fast-forward update never overwrites
 // concurrent work. Retry against the latest tree, rechecking the durable job key.
 for(let attempt=0;attempt<3;attempt++){
  if(current.entries.some(e=>e.path===marker))return {status:'already_collected',since,until};
  require(!current.entries.some(e=>e.path===source||e.path===recordPath),'Snapshot collision');
  const tree=await github('/git/trees',token,{method:'POST',body:{base_tree:current.tree,tree:[
   {path:source,mode:'100644',type:'blob',content:raw},
   {path:recordPath,mode:'100644',type:'blob',content:JSON.stringify(record,null,2)+'\n'},
   {path:marker,mode:'100644',type:'blob',content:JSON.stringify(job,null,2)+'\n'}]}});
  const commit=await github('/git/commits',token,{method:'POST',body:{
   message:'Record daily authorized Instagram account snapshot',tree:tree.sha,parents:[current.head]}});
  try{
   await github('/git/refs/heads/main',token,{method:'PATCH',body:{sha:commit.sha,force:false}});
   return {status:'collected',since,until,observation_id:record.observation_id,commit:commit.sha};
  }catch(error){
   if(![409,422].includes(error.status))throw error;
   current=await state(token);
  }
 }
 throw new Error('Vault changed concurrently; retry required');
}
export async function GET(request){
 if(!bearer(request,process.env.CRON_SECRET))return json({status:'unauthorized'},401);
 if(process.env.AIO_COLLECTION_ENABLED!=='1')return json({status:'disabled'},503);
 try{return json(await collect());}catch{return json({status:'collection_failed'},503);}
}
