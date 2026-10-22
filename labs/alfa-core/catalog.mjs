export const USERS = Object.freeze({A:['SYN-A-MAIN','SYN-A-SECOND'], B:['SYN-B-MAIN']});
export const PHRASES = Object.freeze({
  'Soy cantante':['activity','cantante'], 'Soy emprendedor':['activity','emprendedor'],
  'Soy creador digital':['activity','creador digital'], 'Soy artista':['activity','artista'],
  'Somos una organización':['activity','organización'], 'Otra actividad ficticia':['activity','otra'],
  'Llámate Luna':['assistantName','Luna'], 'Llámate Atlas':['assistantName','Atlas'],
  'Llámate ALFA':['assistantName','ALFA'], 'Háblame informal':['tone','informal'], 'Háblame formal':['tone','formal'],
  'Mi nombre artístico es Aurora Sintética':['canonicalName','Aurora Sintética'],
  'Mi proyecto es Taller Horizonte Ficticio':['canonicalName','Taller Horizonte Ficticio'],
  'Creo canciones ficticias de pop':['description','Cantante ficticia que crea canciones de pop para esta demostración.'],
  'Desarrollo proyectos ficticios':['description','Emprendedor ficticio que desarrolla proyectos para esta demostración.'],
  'Declaro titular sintético Aurora':['rightsHolder','Aurora Sintética (declaración ficticia no verificada)'],
  'Declaro titular sintético Horizonte':['rightsHolder','Horizonte Sintético (declaración ficticia no verificada)']
});
export const DELETE = Object.freeze({'Olvida el tono':'tone','Olvida el nombre del asistente':'assistantName',
  'Olvida la descripción':'description','Olvida la actividad':'activity','Olvida el nombre de entidad':'canonicalName',
  'Olvida el titular':'rightsHolder'});
export const EXAMPLES = Object.freeze({
 A:['Soy cantante','Llámate Luna','Háblame informal','Mi nombre artístico es Aurora Sintética','Creo canciones ficticias de pop','Declaro titular sintético Aurora'],
 B:['Soy emprendedor','Llámate Atlas','Háblame formal','Mi proyecto es Taller Horizonte Ficticio','Desarrollo proyectos ficticios','Declaro titular sintético Horizonte']
});
export const allowedValue=(key,value)=>Object.values(PHRASES).some(([k,v])=>k===key&&v===value);
export function check(ok,code='invalid_request'){if(!ok)throw Object.assign(new Error(code),{code});}
export function owns(user,entity){check(Object.hasOwn(USERS,user)&&USERS[user].includes(entity),'forbidden');}
export function initial(user,entity){owns(user,entity);return {schema:'alfa.synthetic-memory/1',user,entity,revision:0,preferences:{},events:[],pending:null};}
export function validateState(s,user,entity){
 owns(user,entity);check(s&&s.schema==='alfa.synthetic-memory/1'&&s.user===user&&s.entity===entity,'corrupt_memory');
 check(Number.isSafeInteger(s.revision)&&s.revision>=0&&s.revision<=1000&&s.preferences&&Array.isArray(s.events)&&s.events.length===s.revision,'corrupt_memory');
 check(Object.keys(s).sort().join()===['schema','user','entity','revision','preferences','events','pending'].sort().join(),'corrupt_memory');
 for(const [k,p] of Object.entries(s.preferences))check(p&&Object.keys(p).sort().join()==='event,origin,value'&&allowedValue(k,p.value)&&
   Number.isInteger(p.event)&&p.event>0&&p.event<=s.revision&&['expressed','confirmed'].includes(p.origin),'corrupt_memory');
 for(let i=0;i<s.events.length;i++){const e=s.events[i];check(e.sequence===i+1&&e.actor===user&&e.source==='synthetic_chat'&&
   ['set','correction','proposed_change','delete','forget_all','cancel'].includes(e.action)&&
   (e.key===null||Object.values(PHRASES).some(([k])=>k===e.key))&&Object.keys(e).length===5,'corrupt_memory');}
 if(s.pending)check(allowedValue(s.pending.key,s.pending.value)&&s.pending.revision===s.revision&&Object.keys(s.pending).length===3,'corrupt_memory');
 return structuredClone(s);
}
