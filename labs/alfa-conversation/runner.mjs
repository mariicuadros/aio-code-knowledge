import { mkdtempSync } from 'node:fs';import { tmpdir } from 'node:os';import { join } from 'node:path';
import { fileURLToPath } from 'node:url';import { spawnSync } from 'node:child_process';
const mode=process.argv[2]??'test';if(!['test','demo','serve'].includes(mode)||Number(process.versions.node.split('.')[0])<24)throw Error('Node 24+; test|demo|serve');
const directory=mkdtempSync(join(tmpdir(),'deos-alfa-synthetic-'));
const env={};for(const key of ['PATH','Path','SystemRoot','SYSTEMROOT','TEMP','TMP'])if(process.env[key])env[key]=process.env[key];
const allow=['./','../alfa-core/','../deos-multiagent/','../../lib/entity-domain.mjs','../../lib/public-identity-targets.mjs'].map(p=>'--allow-fs-read='+fileURLToPath(new URL(p,import.meta.url)));
const entry=mode==='serve'?'server.mjs':mode==='demo'?'demo.mjs':'test-entry.mjs';
console.log('Synthetic storage only: '+directory);
const args=['--permission',...allow,'--allow-fs-read='+directory,'--allow-fs-write='+directory,'--import',new URL('../alfa-core/offline.mjs',import.meta.url).href,
 fileURLToPath(new URL(entry,import.meta.url)),...(mode==='serve'?['--serve',directory]:[directory])];
const r=spawnSync(process.execPath,args,{env,stdio:'inherit',...(mode==='serve'?{}:{timeout:30000})});
if(r.error)throw Error('isolated_run_failed');process.exitCode=r.status??1;
