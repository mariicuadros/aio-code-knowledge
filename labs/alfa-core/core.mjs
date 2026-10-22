import { randomBytes } from 'node:crypto';
import { validateEntity } from '../../lib/entity-domain.mjs';
import { createOrchestrator } from '../deos-multiagent/orchestrator.mjs';
import { hash } from '../deos-multiagent/protocol.mjs';
import { PHRASES, DELETE, USERS, check, owns } from './catalog.mjs';
const required=['activity','canonicalName','description','rightsHolder'];
export function question(s){
 const p=s.preferences,formal=p.tone?.value!=='informal',start=formal?'Por favor, ':'Vamos: ';
 if(!p.activity)return start+'¿cuál es su actividad ficticia?';
 if(!p.canonicalName)return start+({cantante:'¿qué nombre artístico usa?',emprendedor:'¿cómo se llama su proyecto?',
   'creador digital':'¿qué nombre usa en sus contenidos?',artista:'¿cómo firma su obra?',organización:'¿cómo se llama la organización ficticia?',otra:'¿qué nombre identifica su actividad?'}[p.activity.value]);
 if(!p.description)return start+(p.activity.value==='cantante'?'¿qué música crea en este ejemplo?':'¿qué hace en este ejemplo?');
 if(!p.rightsHolder)return start+'indique el titular declarado ficticio; no verificaremos derechos.';
 return start+'puede revisar el borrador o corregir sus preferencias.';
}
export function buildDraft(s){
 const missing=required.filter(k=>!s.preferences[k]);if(missing.length)return {missing,data:null};
 const p=Object.fromEntries(Object.entries(s.preferences).map(([k,v])=>[k,v.value]));
 const data=validateEntity({canonicalName:p.canonicalName,type:p.activity==='organización'?'organization':'person',
 typeDetail:p.activity,description:p.description,alternateNames:[],areas:[],socials:[],officialUrls:[],location:'',
 locationAuthorized:false,relationships:[],claims:[],rightsHolder:p.rightsHolder,useAuthorized:false,
 lastReviewed:'2026-10-22',publicFields:[],canonicalEntityId:null});
 return {missing:[],data};
}
export class Alfa {
 constructor(store,{now=()=>Date.now()}={}){this.store=store;this.sessions=new Map();this.now=now;}
 login(user){check(Object.hasOwn(USERS,user));for(const [key,s] of this.sessions)if(s.expires<=this.now())this.sessions.delete(key);check(this.sessions.size<50,'capacity');
  const token=randomBytes(24).toString('hex');this.sessions.set(token,{user,expires:this.now()+900000,review:null});return token;}
 session(token){const s=this.sessions.get(token);check(s&&s.expires>this.now(),'unauthorized');return s;}
 logout(token){this.sessions.delete(token);}
 async view(token,entity){const session=this.session(token);owns(session.user,entity);
  const memory=await this.store.read(session.user,entity);this.session(token);
  return {memory,question:question(memory),assistantName:memory.preferences.assistantName?.value??'ALFA',
    draft:buildDraft(memory),publication:'denied',simulation:true};}
 async message(token,entity,text,revision){
  const session=this.session(token);owns(session.user,entity);session.review=null;
  check(typeof text==='string'&&text.length<=160,'synthetic_catalog_only');
  if(text==='Consulta mi memoria')return this.view(token,entity);
  const pair=Object.hasOwn(PHRASES,text)?PHRASES[text]:null,del=Object.hasOwn(DELETE,text)?DELETE[text]:null;
  check(pair||del||['Confirmo el cambio','Cancela el cambio','Olvida toda la memoria'].includes(text),'synthetic_catalog_only');
  await this.store.update(session.user,entity,revision,s=>{
    this.session(token);const sequence=s.revision+1;let action,key=null;
    if(pair){const [k,value]=pair;key=k;
      if(s.preferences[k]&&s.preferences[k].value!==value){s.pending={key:k,value,revision:sequence};action='proposed_change';}
      else{s.preferences[k]={value,event:sequence,origin:'expressed'};s.pending=null;action='set';}
    }else if(del){key=del;delete s.preferences[del];s.pending=null;action='delete';}
    else if(text==='Olvida toda la memoria'){s.preferences={};s.pending=null;action='forget_all';}
    else if(text==='Confirmo el cambio'){check(s.pending?.revision===s.revision,'no_pending_change');
      key=s.pending.key;s.preferences[key]={value:s.pending.value,event:sequence,origin:'confirmed'};s.pending=null;action='correction';}
    else{s.pending=null;action='cancel';}
    s.revision=sequence;s.events.push({sequence,actor:session.user,source:'synthetic_chat',action,key});return s;
  });
  return this.view(token,entity);
 }
 async preview(token,entity){
  const session=this.session(token);session.review=null;const view=await this.view(token,entity);
  check(view.draft.data&&!view.memory.pending,'incomplete_or_conflicting');
  // Explicitly separate demonstration of #84 from deterministic Entity Builder. No memory reaches adapters.
  const simulation=await createOrchestrator().run({fixture_id:'normal',request_id:'SYN-REQ-101',revision:1});
  this.session(token);const current=await this.store.read(session.user,entity);this.session(token);
  check(current.revision===view.memory.revision,'revision_conflict');
  const binding={entity,revision:current.revision,action:'review_synthetic_draft',content_hash:await hash({memory:current,data:view.draft.data})};
  this.session(token);session.review={binding,data:view.draft.data};
  return {binding,data:view.draft.data,changes:Object.keys(view.draft.data).map(field=>({field,before:null,after:view.draft.data[field]})),
    baseline:'new_local_draft_not_an_administrative_record',simulation,publication:'denied'};
 }
 async acknowledge(token,binding){
  const session=this.session(token),review=session.review;session.review=null;
  check(review&&JSON.stringify(binding)===JSON.stringify(review.binding),'review_required');
  return this.store.inspect(session.user,binding.entity,async s=>{
    this.session(token);
    check(s.revision===binding.revision&&await hash({memory:s,data:buildDraft(s).data})===binding.content_hash,'revision_conflict');
    this.session(token);return {status:'reviewed_synthetic_draft_only',publication:'denied',canonicalEntityId:null};
  });
 }
}
