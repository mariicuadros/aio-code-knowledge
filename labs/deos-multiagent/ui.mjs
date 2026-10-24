import { createOrchestrator } from './orchestrator.mjs';
import { demoRequest } from './fixtures.mjs';
const engine = createOrchestrator();
const el = id => document.getElementById(id);
let result, revision = 0;
const approve = document.createElement('button');
approve.type = 'button'; approve.textContent = 'Confirmo que revisé este resultado sintético';
approve.disabled = true; el('results').append(approve);
const details = document.createElement('pre'); details.style.whiteSpace='pre-wrap'; el('results').append(details);
el('run').addEventListener('click', async () => {
  approve.disabled = true; result = null; el('run').disabled = true; el('results').hidden = true;
  try {
    result = await engine.run({...demoRequest, revision:++revision});
    el('summary').textContent = result.message;
    el('review').textContent = 'Revisión ' + revision + ' · ' + result.approval.content_hash +
      ' · Esta confirmación no autoriza publicar, firmar contratos ni registrar derechos o identidades.';
    el('specialists').replaceChildren();
    for(const [role, output] of Object.entries(result.outputs)) {
      const p=document.createElement('p'); p.textContent=role + ': ' + output.recommendation;
      el('specialists').append(p);
    }
    el('audit').textContent='Llamadas externas: 0 · Coste API: US$0 · Consumo estimado simulado: ' + result.usage.reserved_tokens;
    details.textContent=JSON.stringify(result,null,2); el('results').hidden=false;
    approve.disabled=!result.complete; el('status').textContent='Pendiente de revisión humana local.';
  } catch { el('status').textContent='Ejecución bloqueada.'; }
  finally { el('run').disabled=false; }
});
approve.addEventListener('click', () => {
  try { engine.approve(result.approval,{humanConfirmed:true}); approve.disabled=true;
    el('status').textContent='Revisión reconocida localmente. Publicación y servicios sensibles siguen bloqueados.';
  } catch { approve.disabled=true; el('status').textContent='Confirmación inválida; ejecutar y revisar de nuevo.'; }
});
