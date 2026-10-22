import { check, allowedValue } from '../alfa-core/catalog.mjs';
export const VERSION='deos.conversation-model/1';
export const KEYS=['activity','assistantName','tone','canonicalName','description'];
export const INTENTS=['clarify','music','business','content','preferences','unsafe'];
export const QUESTIONS=['activity','canonicalName','description','rightsHolder','goal','audience','review'];
export const STRATEGIES=['none','music_outline','business_outline','content_outline'];
export function exact(v,keys){check(v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k)),'invalid_contract');}
export function text(v,max){check(typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v),'invalid_contract');}
export function intentOf(message){
 if(/ignore.*instruction|ignora.*instru|vault|link_canonical|api.?key|publica.*autom|diagn[oó]stic/i.test(message))return 'unsafe';
 if(/canci[oó]n|cantante|m[uú]sica|lanzamiento|disco/i.test(message))return 'music';
 if(/emprend|negocio|empresa|cliente|producto/i.test(message))return 'business';
 if(/contenido|marca|redes|audiencia/i.test(message))return 'content';
 if(/tono|formal|ll[aá]mate|Luna|Atlas/i.test(message))return 'preferences';return 'clarify';
}
// Trusted extraction rules: proposals must cite the matching literal span, not model-invented evidence.
const rules=[['activity','cantante',/\b(?:soy cantante|canto canciones)\b/i],['activity','emprendedor',/\bsoy emprendedor\b/i],
 ['activity','artista',/\bsoy artista\b/i],['activity','creador digital',/\bsoy creador digital\b/i],['activity','organización',/somos una organización/i],
 ['tone','informal',/\b(?:tono informal|h[aá]blame informal)\b/i],['tone','formal',/\b(?:tono formal|h[aá]blame formal)\b/i],
 ['assistantName','Luna',/ll[aá]mate Luna/i],['assistantName','Atlas',/ll[aá]mate Atlas/i],['assistantName','ALFA',/ll[aá]mate ALFA/i],
 ['canonicalName','Aurora Sintética',/mi nombre (?:artístico )?es Aurora Sintética/i],
 ['canonicalName','Taller Horizonte Ficticio',/mi proyecto es Taller Horizonte Ficticio/i],
 ['description','Cantante ficticia que crea canciones de pop para esta demostración.',/creo canciones ficticias de pop/i],
 ['description','Emprendedor ficticio que desarrolla proyectos para esta demostración.',/desarrollo proyectos ficticios/i]];
export function candidates(message){if(intentOf(message)==='unsafe')return [];
 const result=rules.flatMap(([key,value,pattern])=>{const m=message.match(pattern);return m?[{key,value,quote:m[0],source:'current_message'}]:[];});
 // Contradictory simultaneous values require clarification, never last-one-wins.
 return result.filter(p=>result.filter(q=>q.key===p.key).length===1);
}
export function validateTask(t){
 exact(t,['version','message','memory','missing_fields','recent_intents','max_output_tokens']);check(t.version===VERSION&&t.max_output_tokens===512,'invalid_contract');text(t.message,1200);
 check(Array.isArray(t.memory)&&t.memory.length<=5&&Array.isArray(t.recent_intents)&&t.recent_intents.length<=2,'invalid_contract');
 const seen=new Set();for(const p of t.memory){exact(p,['key','value','origin']);check(KEYS.includes(p.key)&&allowedValue(p.key,p.value)&&['expressed','confirmed'].includes(p.origin)&&!seen.has(p.key),'invalid_context');seen.add(p.key);}
 check(Array.isArray(t.missing_fields)&&t.missing_fields.length<=4&&new Set(t.missing_fields).size===t.missing_fields.length&&t.missing_fields.every(k=>['activity','canonicalName','description','rightsHolder'].includes(k)),'invalid_context');
 check(t.recent_intents.every(i=>INTENTS.includes(i)),'invalid_context');return structuredClone(t);
}
export function validateOutput(o,t){
 exact(o,['version','intent','question','strategy','proposals']);check(o.version===VERSION&&INTENTS.includes(o.intent)&&QUESTIONS.includes(o.question)&&STRATEGIES.includes(o.strategy),'invalid_contract');
 check(Array.isArray(o.proposals)&&o.proposals.length<=5,'invalid_contract');const approved=candidates(t.message),seen=new Set();
 for(const p of o.proposals){exact(p,['key','value','quote','source']);check(approved.some(a=>['key','value','quote','source'].every(k=>a[k]===p[k]))&&!seen.has(p.key),'unsupported_proposal');seen.add(p.key);}
 if(intentOf(t.message)==='unsafe')check(o.intent==='unsafe'&&o.proposals.length===0&&o.strategy==='none','unsafe_output');
 return structuredClone(o);
}
export const OUTPUT_SCHEMA={type:'object',additionalProperties:false,required:['version','intent','question','strategy','proposals'],properties:{
 version:{type:'string',enum:[VERSION]},intent:{type:'string',enum:INTENTS},question:{type:'string',enum:QUESTIONS},strategy:{type:'string',enum:STRATEGIES},
 proposals:{type:'array',items:{type:'object',additionalProperties:false,required:['key','value','quote','source'],properties:{
 key:{type:'string',enum:KEYS},value:{type:'string'},quote:{type:'string'},source:{type:'string',enum:['current_message']}}}}}};
