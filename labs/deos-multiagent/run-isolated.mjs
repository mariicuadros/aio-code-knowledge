import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const dir=fileURLToPath(new URL('.',import.meta.url));
const mode=process.argv[2]??'test';
if(!['test','demo'].includes(mode)||Number(process.versions.node.split('.')[0])<24)
  throw new Error('Node 24+ and mode test|demo required');
// Do not inherit provider credentials, NODE_OPTIONS, proxies or repository secrets.
const env={}; for(const key of ['PATH','Path','SystemRoot','SYSTEMROOT','TEMP','TMP'])
  if(process.env[key]) env[key]=process.env[key];
const args=['--permission','--allow-fs-read='+dir,
  '--allow-fs-read='+fileURLToPath(new URL('../../rag/retriever.mjs',import.meta.url)),
  '--import',new URL('./deny-network.mjs',import.meta.url).href];
if(mode==='test') args.push(dir+'test-entry.mjs');
else args.push(dir+'demo.mjs');
const result=spawnSync(process.execPath,args,{env,stdio:'inherit',timeout:30000});
if(result.error) throw new Error('isolated_runner_failed');
process.exitCode=result.status??1;
