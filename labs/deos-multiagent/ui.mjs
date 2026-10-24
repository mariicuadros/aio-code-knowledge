import {runDemo} from './orchestrator.mjs';
import {syntheticCase} from './fixtures.mjs';

const el=id=>document.getElementById(id);
function node(tag,cls,text){
  const e=document.createElement(tag);
  if(cls)e.className=cls;
  if(text!==undefined)e.textContent=text;
  return e;
}
function card(title,label,body){
  const section=node('article','specialist');
  section.append(node('div','status',label),node('h3','',title),node('p','',body));
  return section;
}
function display(r){
  el('summary').textContent=r.response.message;
  el('review').textContent='Revisión humana obligatoria. No se asigna ID canónico ni se publica.';
  const grid=el('specialists');grid.replaceChildren();
  const research=r.specialists.research,creative=r.specialists.creative,gov=r.specialists.governance;
  grid.append(
    card('Investigación','MOCK · RESEARCH',
      'Fuentes enlazadas: '+research.matched_source_ids.join(', ')+
      '. Discrepancias: '+research.conflicts.map(c=>c.values.join(' / ')).join('; ')),
    card('Creatividad','MOCK · CREATIVE',
      creative.proposals.map(p=>p.headline).join(' | ')+'. Solo borradores.'),
    card('Gobernanza documental','REGLAS · GOVERNANCE',
      gov.blockers.join(', ')+'. '+gov.scope),
    card('Supervisor','MOCK · MANAGER',
      r.response.next_actions.join(' '))
  );
  el('audit').textContent='Pasos internos: '+r.trace.map(x=>x.role).join(' → ')+
    ' · Llamadas API: '+r.provider_calls+' · Coste API: US$'+r.api_cost_usd+
    ' · Publicación: '+r.publication;
  el('results').hidden=false;
  el('status').textContent='Ejemplo completado localmente. No se hicieron llamadas externas.';
}
el('run').addEventListener('click',()=>{display(runDemo(syntheticCase));});
