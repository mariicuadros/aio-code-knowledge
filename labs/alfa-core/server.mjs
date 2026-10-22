import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { Alfa } from './core.mjs';
import { SyntheticStore } from './store.mjs';
import { check, USERS } from './catalog.mjs';
const cookie='alfa_synthetic_session';
const files=new Map([['/','index.html'],['/ui.mjs','ui.mjs'],['/catalog.mjs','catalog.mjs']]);
export function createLabServer(directory){
 const alfa=new Alfa(new SyntheticStore(directory));let origin;
 const server=createServer(async(req,res)=>{
  const send=(status,body,extra={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',
   'x-content-type-options':'nosniff','referrer-policy':'no-referrer',...extra});res.end(JSON.stringify(body));};
  try{
   check(req.headers.host===new URL(origin).host,'origin_forbidden');
   const path=new URL(req.url,origin).pathname;
   if(req.method==='GET'&&files.has(path)){
    const body=await readFile(new URL(files.get(path),import.meta.url));
    res.writeHead(200,{'content-type':path.endsWith('.mjs')?'text/javascript; charset=utf-8':'text/html; charset=utf-8',
     'cache-control':'no-store','x-content-type-options':'nosniff','x-frame-options':'DENY',
     'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});res.end(body);return;
   }
   check(req.method==='POST'&&req.headers.origin===origin,'origin_forbidden');
   check(req.headers['content-type']==='application/json','json_required');
   let raw='';for await(const chunk of req){raw+=chunk;check(Buffer.byteLength(raw)<=4096,'payload_too_large');}
   let body;try{body=JSON.parse(raw);}catch{throw {code:'invalid_request'};}
   check(body&&typeof body==='object'&&!Array.isArray(body));
   const exact=keys=>check(Object.keys(body).length===keys.length&&keys.every(k=>Object.hasOwn(body,k)));
   const token=(req.headers.cookie??'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookie+'='))?.slice(cookie.length+1);
   if(path==='/api/login'){exact(['user']);alfa.logout(token);const session=alfa.login(body.user);
    send(200,{entities:USERS[body.user],simulation:true},{'set-cookie':`${cookie}=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900`});return;}
   if(path==='/api/logout'){exact([]);alfa.logout(token);send(200,{loggedOut:true},{'set-cookie':`${cookie}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`});return;}
   alfa.session(token);
   if(path==='/api/view'){exact(['entity']);send(200,await alfa.view(token,body.entity));}
   else if(path==='/api/message'){exact(['entity','text','revision']);send(200,await alfa.message(token,body.entity,body.text,body.revision));}
   else if(path==='/api/preview'){exact(['entity']);send(200,await alfa.preview(token,body.entity));}
   else if(path==='/api/review'){exact(['binding']);send(200,await alfa.acknowledge(token,body.binding));}
   else throw {code:'operation_denied'};
  }catch(e){
   const codes=['invalid_request','forbidden','unauthorized','revision_conflict','review_required','incomplete_or_conflicting',
    'synthetic_catalog_only','no_pending_change','capacity','origin_forbidden','json_required','payload_too_large','operation_denied','corrupt_memory'];
   const code=codes.includes(e.code)?e.code:'lab_unavailable';
   send(code==='unauthorized'?401:code==='revision_conflict'?409:['forbidden','origin_forbidden','operation_denied'].includes(code)?403:code==='lab_unavailable'||code==='corrupt_memory'?503:400,{error:code});
  }
 });
 server.requestTimeout=5000;server.headersTimeout=5000;
 return {server,alfa,async listen(){await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;return origin;}};
}
if(process.argv[2]==='--serve'){
 check(process.argv.length===4);const lab=createLabServer(process.argv[3]);console.log(await lab.listen());
}
