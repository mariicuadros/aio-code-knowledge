// LOCAL TEST BACKEND. Refuses Vercel and production; never defaults to a cloud vault.
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { handle } from '../api/entities.mjs';
if(process.env.VERCEL||process.env.NODE_ENV==='production') throw new Error('Local server forbidden in production');
if(!process.env.AIO_DASHBOARD_ADMIN_TOKEN) throw new Error('AIO_DASHBOARD_ADMIN_TOKEN required');
process.env.AIO_ENTITY_STORE='local';process.env.AIO_ENTITY_LOCAL_ENABLED='1';
process.env.AIO_ENTITY_LOCAL_DIR ||= resolve('.entity-test-data');
const server=createServer(async(req,res)=>{
  try {
    if(!req.url?.startsWith('/api/entities')) {res.writeHead(404);res.end();return;}
    const request=new Request('http://127.0.0.1:4000'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
    const response=await handle(request);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch {res.writeHead(500,{'content-type':'application/json'});res.end('{"error":{"code":"local_server_error"}}');}
});
server.listen(Number(process.env.PORT||4000),'127.0.0.1',()=>console.log('LOCAL TEST BACKEND at http://127.0.0.1:'+(process.env.PORT||4000)+' — filesystem persistence, not remote vault'));
