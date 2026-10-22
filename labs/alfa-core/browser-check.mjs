// Optional browser check using an existing Playwright installation; installs nothing.
import assert from 'node:assert/strict';import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';import { tmpdir } from 'node:os';import { join,resolve } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';import { EXAMPLES } from './catalog.mjs';
const {chromium}=await import(pathToFileURL(resolve(process.argv[2])).href);
const directory=await mkdtemp(join(tmpdir(),'deos-alfa-browser-'));
const env={};for(const k of ['PATH','Path','SystemRoot','SYSTEMROOT','TEMP','TMP'])if(process.env[k])env[k]=process.env[k];
const read=['./','../deos-multiagent/','../../lib/entity-domain.mjs','../../lib/public-identity-targets.mjs'].map(p=>'--allow-fs-read='+fileURLToPath(new URL(p,import.meta.url)));
const child=spawn(process.execPath,['--permission',...read,'--allow-fs-read='+directory,'--allow-fs-write='+directory,
 '--import',new URL('./offline.mjs',import.meta.url).href,fileURLToPath(new URL('./server.mjs',import.meta.url)),'--serve',directory],{env,stdio:['ignore','pipe','pipe'],windowsHide:true});
let browser;
try{
 const origin=await new Promise((ok,no)=>{const t=setTimeout(()=>no(Error('startup_timeout')),10000);child.stdout.on('data',chunk=>{const m=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(t);ok(m[0]);}});child.once('exit',()=>{clearTimeout(t);no(Error('server_exit'));});});
 browser=await chromium.launch({headless:true});const errors=[];
 async function pageFor(user){const context=await browser.newContext();await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.selectOption('#user',user);await page.click('#login');await page.waitForFunction(()=>!document.getElementById('send').disabled);return page;}
 async function send(page,text){await page.fill('#message',text);await page.click('#send');await page.waitForFunction(()=>!document.getElementById('send').disabled);}
 const a=await pageFor('A');for(const t of EXAMPLES.A)await send(a,t);
 assert.equal(await a.textContent('#name'),'Luna');await a.click('#preview');await a.waitForFunction(()=>!document.getElementById('review').disabled);
 let preview=JSON.parse(await a.textContent('#draft'));assert.equal(preview.data.canonicalEntityId,null);assert.equal(preview.simulation.usage.provider_calls,0);
 await a.click('#review');await a.waitForFunction(()=>!document.getElementById('send').disabled);assert.ok((await a.textContent('#chat')).includes('reviewed_synthetic_draft_only'));
 await send(a,'Háblame formal');assert.equal(JSON.parse(await a.textContent('#memory')).preferences.tone.value,'informal');
 await send(a,'Confirmo el cambio');assert.equal(JSON.parse(await a.textContent('#memory')).preferences.tone.value,'formal');
 await send(a,'Olvida el tono');await a.click('#logout');await a.waitForFunction(()=>!document.getElementById('login').disabled);
 assert.equal(await a.textContent('#memory'),'');await a.click('#login');await a.waitForFunction(()=>!document.getElementById('send').disabled);
 assert.equal(await a.textContent('#name'),'Luna');assert.equal(JSON.parse(await a.textContent('#memory')).preferences.tone,undefined);
 const b=await pageFor('B');assert.deepEqual(JSON.parse(await b.textContent('#memory')).preferences,{});
 for(const t of EXAMPLES.B)await send(b,t);assert.equal(await b.textContent('#name'),'Atlas');
 assert.equal(JSON.parse(await b.textContent('#memory')).preferences.tone.value,'formal');assert.ok(!(await b.textContent('#memory')).includes('Aurora'));
 await a.screenshot({path:join(directory,'alfa.png'),fullPage:true});
 await a.route('**/api/message',route=>route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'revision_conflict'})}));
 await a.fill('#message','Soy artista');await a.click('#send');await a.waitForFunction(()=>document.getElementById('status').textContent.includes('revision_conflict'));
 assert.equal(await a.textContent('#memory'),'');assert.ok(await a.locator('#review').isDisabled());
 // Hold a legitimate response across logout; it must not repopulate memory.
 let release,observed;const held=new Promise(r=>{release=r;}),seen=new Promise(r=>{observed=r;});
 await b.route('**/api/view',async route=>{const response=await route.fetch();observed();await held;try{await route.fulfill({response});}catch{}});
 await b.click('#login');await seen;await b.click('#logout');release();
 await b.waitForFunction(()=>document.getElementById('status').textContent.includes('Sesión cerrada'));
 assert.equal(await b.textContent('#memory'),'');assert.ok(await b.locator('#workspace').isHidden());
 assert.deepEqual(errors,[]);console.log('Browser PASS: A/B, progressive chat, review, correction, deletion, session recovery, isolation, 409; no page errors. Screenshot: '+join(directory,'alfa.png'));
}finally{await browser?.close();child.kill();}
