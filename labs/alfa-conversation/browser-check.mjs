// Optional browser check using an existing Playwright installation; installs nothing.
import assert from 'node:assert/strict';import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';import { tmpdir } from 'node:os';import { join,resolve } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
const {chromium}=await import(pathToFileURL(resolve(process.argv[2])).href);
const directory=await mkdtemp(join(tmpdir(),'deos-alfa-browser-'));
const env={};for(const k of ['PATH','Path','SystemRoot','SYSTEMROOT','TEMP','TMP'])if(process.env[k])env[k]=process.env[k];
const read=['./','../alfa-core/','../deos-multiagent/','../../lib/entity-domain.mjs','../../lib/public-identity-targets.mjs'].map(p=>'--allow-fs-read='+fileURLToPath(new URL(p,import.meta.url)));
const child=spawn(process.execPath,['--permission',...read,'--allow-fs-read='+directory,'--allow-fs-write='+directory,
 '--import',new URL('../alfa-core/offline.mjs',import.meta.url).href,fileURLToPath(new URL('./server.mjs',import.meta.url)),'--serve',directory],{env,stdio:['ignore','pipe','pipe'],windowsHide:true});
let browser;
try{
 const origin=await new Promise((ok,no)=>{const t=setTimeout(()=>no(Error('startup_timeout')),10000);child.stdout.on('data',chunk=>{const m=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(t);ok(m[0]);}});child.once('exit',()=>{clearTimeout(t);no(Error('server_exit'));});});
 browser=await chromium.launch({headless:true});const errors=[];

 async function pageFor(user){const context=await browser.newContext();await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.selectOption('#user',user);await page.click('#login');await page.waitForFunction(()=>!document.getElementById('prepare').disabled);return page;}
 const wait=page=>page.waitForFunction(()=>!document.getElementById('prepare').disabled);
 async function turn(page,text){await page.fill('#message',text);await page.click('#prepare');await page.waitForFunction(()=>!document.getElementById('consent').disabled);
  const before=JSON.parse(await page.textContent('#memory')).revision;await page.click('#consent');await wait(page);
  assert.equal(JSON.parse(await page.textContent('#memory')).revision,before);}
 async function apply(page){await page.click('#apply');await wait(page);}
 const a=await pageFor('A');await a.click('#preview');await wait(a);
 assert.ok((await a.textContent('#status')).includes('Faltan campos'));assert.ok(await a.locator('#workspace').isVisible());
 await turn(a,'Soy cantante y quiero lanzar canciones. Llámate Luna, usa tono informal.');await apply(a);assert.equal(await a.textContent('#name'),'Luna');
 await turn(a,'Mi nombre artístico es Aurora Sintética. Creo canciones ficticias de pop.');await apply(a);
 await a.getByText('Operaciones deterministas de memoria (no ejecutadas por el modelo)',{exact:true}).click();
 await a.selectOption('#command','Declaro titular sintético Aurora');await a.click('#execute');await wait(a);
 await a.click('#preview');await wait(a);assert.ok(!(await a.locator('#review').isDisabled()));
 const draft=JSON.parse(await a.textContent('#draft'));assert.equal(draft.data.canonicalEntityId,null);
 await a.click('#review');await wait(a);
 await a.selectOption('#command','Háblame formal');await a.click('#execute');await wait(a);
 await a.click('#preview');await wait(a);assert.ok((await a.textContent('#status')).includes('cambio pendiente'));
 await a.selectOption('#command','Confirmo el cambio');await a.click('#execute');await wait(a);
 assert.equal(JSON.parse(await a.textContent('#memory')).preferences.tone.value,'formal');
 const b=await pageFor('B');await turn(b,'Soy emprendedor, quiero validar un negocio. Llámate Atlas, tono formal.');await apply(b);
 assert.equal(await b.textContent('#name'),'Atlas');assert.ok(!(await b.textContent('#memory')).includes('Aurora'));
 await a.fill('#message','Quiero planear contenido ficticio');await a.click('#prepare');await a.waitForFunction(()=>!document.getElementById('consent').disabled);
 await a.fill('#message','Cambio mi objetivo ficticio');assert.ok(await a.locator('#consent').isDisabled());
 await a.click('#prepare');await a.waitForFunction(()=>!document.getElementById('consent').disabled);await a.click('#cancel');await wait(a);assert.ok(await a.locator('#consent').isDisabled());
 await b.click('#logout');await b.waitForFunction(()=>document.getElementById('status').textContent==='Sesión cerrada');assert.equal(await b.textContent('#memory'),'');
 await a.screenshot({path:join(directory,'alfa-v02.png'),fullPage:true});assert.deepEqual(errors,[]);
 console.log('Browser PASS: Luna/Atlas, open input, exact consent, proposal separation, incomplete/conflict recovery, correction, draft review, cancellation and logout. Screenshot: '+join(directory,'alfa-v02.png'));
}finally{await browser?.close();child.kill();}
