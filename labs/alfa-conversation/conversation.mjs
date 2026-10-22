import { hash, stable } from '../deos-multiagent/protocol.mjs';
import { check, owns } from '../alfa-core/catalog.mjs';
import { VERSION, KEYS, intentOf, validateTask, validateOutput } from './contract.mjs';
import { simulator,render } from './simulator.mjs';
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
export class Conversation {
 constructor(alfa,{adapter=simulator(),maxCalls=20,maxTokens=16000,timeout=1000,now=()=>Date.now()}={}){
  check(adapter.version===VERSION&&adapter.mode==='simulated'&&typeof adapter.generate==='function','provider_disabled');
  check(Number.isInteger(maxCalls)&&maxCalls>0&&maxCalls<=40&&Number.isInteger(maxTokens)&&maxTokens>0&&maxTokens<=32000&&Number.isInteger(timeout)&&timeout>0&&timeout<=5000,'invalid_limits');
  this.alfa=alfa;this.adapter=Object.freeze({...adapter});this.maxCalls=maxCalls;this.maxTokens=maxTokens;this.timeout=timeout;this.now=now;this.states=new WeakMap();this.budgets=new Map();
 }
 scope(token,entity){const session=this.alfa.session(token);owns(session.user,entity);let map=this.states.get(session);if(!map){map=new Map();this.states.set(session,map);}
  if(!map.has(entity))map.set(entity,{generation:0,ticket:null,proposal:null,controller:null,recent:[]});return {session,state:map.get(entity)};}
 cancel(token,entity){const {state}=this.scope(token,entity);state.generation++;state.controller?.abort();state.ticket=null;state.proposal=null;}
 logout(token){const session=this.alfa.sessions.get(token);if(session)for(const state of this.states.get(session)?.values()??[]){state.generation++;state.controller?.abort();state.ticket=null;state.proposal=null;state.recent=[];}
  this.alfa.logout(token);}
 async command(token,entity,text,revision){
  this.cancel(token,entity);if(typeof text==='string'&&text.startsWith('Olvida '))this.scope(token,entity).state.recent=[];
  return this.alfa.message(token,entity,text,revision);
 }
 async prepare(token,entity,message){
  this.cancel(token,entity);const {state}=this.scope(token,entity),generation=state.generation;
  check(typeof message==='string'&&message.trim().length>0&&message.length<=1200,'message_size');
  const view=await this.alfa.view(token,entity);check(state.generation===generation,'cancelled');
  const wanted=new Set(['activity','tone','assistantName']);if(/nombre|identidad|borrador|describe|descripci/i.test(message)){wanted.add('canonicalName');wanted.add('description');}
  const memory=Object.entries(view.memory.preferences).filter(([key])=>KEYS.includes(key)&&wanted.has(key)).map(([key,p])=>({key,value:p.value,origin:p.origin}));
  const task=validateTask({version:VERSION,message:message.trim(),memory,missing_fields:view.draft.missing,recent_intents:state.recent.slice(-2),max_output_tokens:512});
  const fingerprint=await hash({task,entity,revision:view.memory.revision,generation});this.alfa.session(token);check(state.generation===generation,'cancelled');
  state.ticket={task,hash:fingerprint,revision:view.memory.revision,expires:this.now()+120000};
  return {hash:fingerprint,context:task,revision:view.memory.revision,expires:state.ticket.expires,mode:'simulated_only',notice:'Solo este mensaje/contexto se usará localmente. No se persiste el texto ni se envía a OpenAI.'};
 }
 async respond(token,entity,{hash:fingerprint,consent}){
  const {session,state}=this.scope(token,entity),ticket=state.ticket;state.ticket=null;state.proposal=null;
  check(consent===true&&ticket&&ticket.hash===fingerprint&&ticket.expires>this.now(),'consent_required');
  const generation=state.generation,current=()=>{this.alfa.session(token);check(state.generation===generation,'cancelled');};
  const view=await this.alfa.view(token,entity);current();check(view.memory.revision===ticket.revision,'revision_conflict');
  const key=session.user+':'+entity,b=this.budgets.get(key)??{calls:0,reserved:0};
  const reserve=new TextEncoder().encode(JSON.stringify(ticket.task)).length+512; // Conservative bytes bound, not a tokenizer.
  check(b.calls<this.maxCalls&&b.reserved+reserve<=this.maxTokens,'budget_exhausted');b.calls++;b.reserved+=reserve;this.budgets.set(key,b);
  const controller=new AbortController();state.controller=controller;let timer,abort;
  try{
   const pending=Promise.resolve().then(()=>{current();return this.adapter.generate(freeze(structuredClone(ticket.task)),{signal:controller.signal});});
   const stop=new Promise((_,reject)=>{abort=()=>reject(Object.assign(Error('cancelled'),{code:'cancelled'}));controller.signal.addEventListener('abort',abort,{once:true});
    timer=setTimeout(()=>{reject(Object.assign(Error('timeout'),{code:'timeout'}));controller.abort();},this.timeout);});
   const output=validateOutput(await Promise.race([pending,stop]),ticket.task);current();
   const latest=await this.alfa.view(token,entity);current();check(latest.memory.revision===ticket.revision,'revision_conflict');
   const proposalHash=await hash({input:fingerprint,output,revision:ticket.revision,entity}),outputHash=await hash(output);current();
   state.recent=[...state.recent,output.intent].slice(-2);
   state.proposal={hash:proposalHash,revision:ticket.revision,output,expires:this.now()+120000};
   return {reply:render(output,ticket.task),output,proposal_hash:proposalHash,revision:ticket.revision,
    changes:output.proposals.map(p=>({key:p.key,before:latest.memory.preferences[p.key]?.value??null,after:p.value,quote:p.quote})),
    trace:{input_hash:fingerprint,output_hash:outputHash,adapter:this.adapter.id},usage:{...b,kind:'synthetic_byte_reservations',provider_calls:0,cost_usd:0}};
  }finally{clearTimeout(timer);controller.signal.removeEventListener('abort',abort);controller.abort();if(state.controller===controller)state.controller=null;}
 }
 async apply(token,entity,{hash:fingerprint,consent}){
  const {session,state}=this.scope(token,entity),p=state.proposal;state.proposal=null;this.alfa.session(token).review=null;
  check(consent===true&&p&&p.hash===fingerprint&&p.expires>this.now()&&p.output.proposals.length,'proposal_consent_required');
  const generation=state.generation;
  await this.alfa.store.update(session.user,entity,p.revision,s=>{
   this.alfa.session(token);check(state.generation===generation,'cancelled');check(!s.pending,'incomplete_or_conflicting');
   for(const change of p.output.proposals){const old=s.preferences[change.key];s.revision++;
    s.preferences[change.key]={value:change.value,event:s.revision,origin:'confirmed'};
    s.events.push({sequence:s.revision,actor:session.user,source:'synthetic_chat',action:old?'correction':'set',key:change.key});}
   s.pending=null;return s;
  });this.cancel(token,entity);return this.alfa.view(token,entity);
 }
}
