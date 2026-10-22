import { VERSION, intentOf, candidates, validateTask } from './contract.mjs';
export function simulator(){return Object.freeze({version:VERSION,id:'simulated-rules-v1',mode:'simulated',async generate(task,{signal}){
 validateTask(task);if(signal.aborted)throw Object.assign(Error('cancelled'),{code:'cancelled'});
 const explicit=intentOf(task.message),intent=explicit==='clarify'?(task.recent_intents.filter(i=>i!=='unsafe'&&i!=='clarify').at(-1)??explicit):explicit;
 const proposals=candidates(task.message),memory=Object.fromEntries(task.memory.map(p=>[p.key,p.value]));
 const missing=task.missing_fields.find(k=>!proposals.some(p=>p.key===k));
 return {version:VERSION,intent,question:explicit==='unsafe'?'goal':missing??(/audiencia|p[uú]blico/i.test(task.message)?'audience':'review'),
 strategy:explicit==='unsafe'?'none':({music:'music_outline',business:'business_outline',content:'content_outline'}[intent]??'none'),proposals};
 }});}
export function render(output,task){
 const informal=task.memory.some(p=>p.key==='tone'&&p.value==='informal'),start=informal?'Vamos paso a paso. ':'Podemos avanzar por etapas. ';
 if(output.intent==='unsafe')return 'No puedo convertir instrucciones en permisos, diagnósticos, acceso privado o publicación. Podemos preparar un borrador ficticio revisable.';
 const strategy={none:'Necesito aclarar un poco su objetivo. ',music_outline:'Como propuesta, podemos definir una canción, una audiencia y un calendario de lanzamiento. ',
 business_outline:'Como propuesta, podemos concretar una oferta, una audiencia y una prueba pequeña de interés. ',content_outline:'Como propuesta, podemos definir un tema, un formato y una frecuencia de contenido. '}[output.strategy];
 const question={activity:'¿Qué actividad desarrolla en este ejemplo ficticio?',canonicalName:output.intent==='music'?'¿Qué nombre artístico ficticio utiliza?':'¿Qué nombre ficticio identifica su actividad?',
 description:'¿Cómo describiría lo que crea o propone?',rightsHolder:'Falta la declaración sintética del titular; no se inferirá.',goal:'¿Qué le gustaría conseguir primero?',audience:'¿A qué audiencia ficticia quiere dirigirse?',review:'¿Prefiere revisar los campos reunidos o concretar el siguiente paso?'}[output.question];
 return start+strategy+question+' [Simulación por reglas; no razonamiento de un modelo real.]';
}
