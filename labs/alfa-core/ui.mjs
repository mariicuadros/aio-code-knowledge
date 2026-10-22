import { PHRASES, DELETE } from './catalog.mjs';
const el=id=>document.getElementById(id);
let epoch=0,ready=false,busy=false,closing=false,revision=0,binding=null;
const controllers=new Set();
function clear(){epoch++;for(const c of controllers)c.abort();controllers.clear();ready=false;binding=null;
 el('chat').replaceChildren();el('memory').textContent='';el('draft').textContent='';el('message').value='';el('workspace').hidden=true;controls();}
function controls(){for(const id of ['send','preview','entity'])el(id).disabled=!ready||busy;
 el('review').disabled=!ready||busy||!binding;el('login').disabled=busy||closing;el('logout').disabled=!ready&&!busy&&!closing;}
async function request(path,body,e=epoch){const c=new AbortController();controllers.add(c);
 try{const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:c.signal});
 const value=await r.json();if(e!==epoch)throw Error('stale_session');if(!r.ok)throw Error(value.error);return value;
 }finally{controllers.delete(c);}}
function line(who,text){const p=document.createElement('p');p.textContent=who+': '+text;el('chat').append(p);}
function display(v){revision=v.memory.revision;el('name').textContent=v.assistantName;el('memory').textContent=JSON.stringify(v.memory,null,2);
 el('draft').textContent=JSON.stringify(v.draft,null,2);line(v.assistantName,v.memory.pending?'Hay una contradicción. Revise la memoria y confirme o cancele el cambio.':v.question);el('workspace').hidden=false;}
async function run(fn){if(busy)return;const e=epoch;busy=true;binding=null;controls();try{await fn(e);if(e===epoch)el('status').textContent='Laboratorio sintético · sin publicación';}
 catch(error){if(e===epoch){ready=false;binding=null;el('workspace').hidden=true;el('memory').textContent='';el('draft').textContent='';el('chat').replaceChildren();el('status').textContent='Bloqueado: '+error.message+' · reinicie sesión';}}
 finally{if(e===epoch){busy=false;controls();}}}
el('login').onclick=()=>{if(closing)return;clear();busy=false;return run(async e=>{
 const r=await request('/api/login',{user:el('user').value},e);el('entity').replaceChildren();
 for(const entity of r.entities){const o=document.createElement('option');o.textContent=entity;o.value=entity;el('entity').append(o);}
 display(await request('/api/view',{entity:el('entity').value},e));ready=true;
});};
el('logout').onclick=async()=>{closing=true;clear();busy=true;controls();const e=epoch;try{await request('/api/logout',{},e);if(e===epoch){closing=false;el('status').textContent='Sesión cerrada; memoria guardada solo en el laboratorio';}}
 catch{if(e===epoch)el('status').textContent='Cierre no confirmado; reintente';}finally{if(e===epoch){busy=false;controls();}}};
el('entity').onchange=()=>run(async e=>{el('chat').replaceChildren();display(await request('/api/view',{entity:el('entity').value},e));});
el('user').onchange=()=>{if(ready||busy)el('logout').onclick();};
el('send').onclick=()=>run(async e=>{const text=el('message').value;
 const v=await request('/api/message',{entity:el('entity').value,text,revision},e);line('Usuario sintético',text);display(v);el('message').value='';});
el('preview').onclick=()=>run(async e=>{const p=await request('/api/preview',{entity:el('entity').value},e);
 binding=p.binding;el('draft').textContent=JSON.stringify(p,null,2);});
el('review').onclick=()=>{const exact=binding;return run(async e=>{const r=await request('/api/review',{binding:exact},e);line('ALFA',r.status+' · publicación denegada');});};
for(const text of [...Object.keys(PHRASES),...Object.keys(DELETE),'Consulta mi memoria','Confirmo el cambio','Cancela el cambio','Olvida toda la memoria']){
 const o=document.createElement('option');o.value=text;el('phrases').append(o);
 const b=document.createElement('button');b.textContent=text;b.onclick=()=>{el('message').value=text;};el('suggestions').append(b);
}
controls();
