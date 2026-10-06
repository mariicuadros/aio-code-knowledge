import { require, verify } from './account-observation.mjs';
const BASE='https://api.github.com/repos/mariicuadros/aio-code-vault';
export async function github(path,token,{method='GET',body}={}){
 require(token,'Vault credential missing');
 const response=await fetch(BASE+path,{method,redirect:'error',signal:AbortSignal.timeout(15000),
 headers:{accept:'application/vnd.github+json',authorization:'Bearer '+token,'x-github-api-version':'2022-11-28',
 'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok){const error=new Error('Vault request failed');error.status=response.status;throw error;}
 return response.json();
}
export async function state(token){
 const repo=await github('',token);require(repo.private===true,'Vault must remain private');
 const ref=await github('/git/ref/heads/main',token);
 const commit=await github('/git/commits/'+ref.object.sha,token);
 const tree=await github('/git/trees/'+commit.tree.sha+'?recursive=1',token);
 require(!tree.truncated&&Array.isArray(tree.tree),'Incomplete vault tree');
 return {head:ref.object.sha,tree:commit.tree.sha,entries:tree.tree};
}
export async function textBlob(sha,token){
 require(/^[a-f0-9]{40}$/.test(sha),'Invalid blob');
 const blob=await github('/git/blobs/'+sha,token);require(blob.encoding==='base64','Unsupported blob');
 return Buffer.from(blob.content.replace(/\s/g,''),'base64').toString('utf8');
}
export async function accountRecords(snapshot,token){
 const entries=snapshot.entries.filter(e=>e.type==='blob'&&/^commercial-data\/account-ledger\/ACCOUNT-[a-f0-9]{64}\.json$/.test(e.path));
 require(entries.length<=500,'Account record limit exceeded');
 const records=[];
 for(const e of entries){
  const record=JSON.parse(await textBlob(e.sha,token));
  const original=snapshot.entries.find(x=>x.path===record.source_ref&&x.type==='blob');
  require(original,'Evidence missing');const raw=await textBlob(original.sha,token);verify(record,raw);
  require(e.path==='commercial-data/account-ledger/'+record.observation_id+'.json','ID filename mismatch');
  records.push(record);
 }
 return records.sort((a,b)=>b.captured_at.localeCompare(a.captured_at));
}
