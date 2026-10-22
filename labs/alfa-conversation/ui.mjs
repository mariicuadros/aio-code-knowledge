import {PHRASES,DELETE} from '/catalog.mjs';
const el=id=>document.getElementById(id);
let epoch=0,ready=false,busy=false,closing=false,revision=0,ticket=null,proposal=null,binding=null;
const requests=new Set();
const recoverable={incomplete_or_conflicting:'Faltan campos o hay un cambio pendiente. Revise el borrador y continúe; no necesita reiniciar.',
 revision_conflict:'La memoria cambió. Actualicé el estado; revise nuevamente antes de confirmar.',consent_required:'Revise y confirme el contexto del turno otra vez.',
 proposal_consent_required:'La propuesta caducó o cambió. Genere una nueva.',budget_exhausted:'Se agotó el presupuesto sintético de esta entidad. No se realizó otra llamada.',
 timeout:'El simulador tardó demasiado; puede preparar otro turno.',cancelled:'Turno cancelado.',synthetic_catalog_only:'La operación determinista solo admite valores ficticios del catálogo.',
 message_size:'Escriba entre 1 y 1200 caracteres.',no_pending_change:'No hay un cambio pendiente de confirmación.',unsupported_proposal:'La propuesta no tiene evidencia válida y fue descartada.',
 invalid_contract:'El simulador devolvió un contrato inválido. No se aplicó ningún cambio.',unsafe_output:'La respuesta intentó exceder sus permisos y fue descartada.'};
function revoke(){ticket=null;proposal=null;binding=null;el('context').textContent='';el('proposals').textContent='';}
function controls(){for(const id of ['prepare','execute','preview','entity'])el(id).disabled=!ready||busy;
 el('consent').disabled=!ready||busy||!ticket;el('apply').disabled=!ready||busy||!proposal;el('review').disabled=!ready||busy||!binding;
 el('login').disabled=busy||closing;el('logout').disabled=!ready&&!busy&&!closing;el('cancel').disabled=!ready;}
function clear(){epoch++;for(const c of requests)c.abort();requests.clear();ready=false;revoke();el('chat').replaceChildren();el('memory').textContent='';el('draft').textContent='';el('message').value='';el('workspace').hidden=true;controls();}
async function api(path,body,e=epoch){const c=new AbortController();requests.add(c);try{
 const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:c.signal});const v=await r.json();
 if(e!==epoch)throw Error('stale_session');if(!r.ok)throw Error(v.error);return v;}finally{requests.delete(c);}}
function line(who,text){const p=document.createElement('p');p.textContent=who+': '+text;el('chat').append(p);}
function view(v){revision=v.memory.revision;el('name').textContent=v.assistantName;el('memory').textContent=JSON.stringify(v.memory,null,2);el('draft').textContent=JSON.stringify({...v.draft,pending_change:v.memory.pending},null,2);el('workspace').hidden=false;}
async function refresh(e){view(await api('/api/view',{entity:el('entity').value},e));}
async function run(fn){if(busy)return;const e=epoch;busy=true;controls();el('status').textContent='Procesando localmente…';
 try{await fn(e);if(e===epoch)el('status').textContent='Simulación local · cambios solo con confirmación';}
 catch(error){if(e===epoch){revoke();if(recoverable[error.message]){el('status').textContent=recoverable[error.message];if(error.message==='revision_conflict')try{await refresh(e);}catch{busy=false;clear();el('status').textContent='No se pudo recuperar el estado. Sesión bloqueada.';busy=false;}}
 else{busy=false;clear();el('status').textContent='Estado no disponible. Inicie sesión nuevamente.';}}}
 finally{if(e===epoch){busy=false;controls();}}}
el('login').onclick=()=>{if(closing)return;clear();busy=false;return run(async e=>{const r=await api('/api/login',{user:el('user').value},e);el('entity').replaceChildren();
 for(const entity of r.entities){const o=document.createElement('option');o.value=entity;o.textContent=entity;el('entity').append(o);}await refresh(e);ready=true;line('ALFA','Cuénteme su objetivo ficticio. Soy un simulador por reglas; puedo proponer preguntas y cambios revisables.');});};
el('logout').onclick=async()=>{closing=true;clear();busy=true;controls();const e=epoch;try{await api('/api/logout',{},e);if(e===epoch){closing=false;el('status').textContent='Sesión cerrada';}}
 catch{if(e===epoch)el('status').textContent='Cierre no confirmado. Reintente.';}finally{if(e===epoch){busy=false;controls();}}};
el('user').onchange=()=>{if(ready||busy)el('logout').onclick();};
el('entity').onchange=()=>run(async e=>{revoke();el('chat').replaceChildren();await refresh(e);});
el('message').oninput=()=>{revoke();controls();};
el('prepare').onclick=()=>run(async e=>{revoke();ticket=await api('/api/prepare',{entity:el('entity').value,message:el('message').value},e);el('context').textContent=JSON.stringify(ticket,null,2);});
el('consent').onclick=()=>{const t=ticket;ticket=null;return run(async e=>{const r=await api('/api/respond',{entity:el('entity').value,hash:t.hash,consent:true},e);
 line('Usuario ficticio',t.context.message);line(el('name').textContent,r.reply);el('message').value='';el('proposals').textContent=JSON.stringify(r,null,2);proposal=r.output.proposals.length?r:null;});};
el('apply').onclick=()=>{const p=proposal;revoke();return run(async e=>{view(await api('/api/apply',{entity:el('entity').value,hash:p.proposal_hash,consent:true},e));line('DEOS','Cambios sintéticos confirmados. El modelo no ejecutó operaciones.');});};
el('execute').onclick=()=>run(async e=>{revoke();view(await api('/api/message',{entity:el('entity').value,text:el('command').value,revision},e));});
el('preview').onclick=()=>run(async e=>{binding=null;const p=await api('/api/preview',{entity:el('entity').value},e);binding=p.binding;el('draft').textContent=JSON.stringify(p,null,2);});
el('review').onclick=()=>{const b=binding;binding=null;return run(async e=>{await api('/api/review',{binding:b},e);line('DEOS','Revisión local reconocida; publicación denegada.');});};
el('cancel').onclick=async()=>{const entity=el('entity').value;epoch++;for(const c of requests)c.abort();requests.clear();revoke();busy=true;controls();const e=epoch;
 try{await api('/api/cancel',{entity},e);if(e===epoch)el('status').textContent='Turno cancelado; no revierte cambios ya aceptados. Revise la memoria.';}catch{if(e===epoch){busy=false;clear();el('status').textContent='No se pudo confirmar la cancelación. Sesión bloqueada.';busy=false;}}
 finally{if(e===epoch){busy=false;controls();}}};
for(const text of [...Object.keys(PHRASES),...Object.keys(DELETE),'Consulta mi memoria','Confirmo el cambio','Cancela el cambio','Olvida toda la memoria']){const o=document.createElement('option');o.value=text;o.textContent=text;el('command').append(o);}
controls();
