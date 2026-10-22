import { readFile } from 'node:fs/promises';
import { fail, hash, CANONICAL_IDS, validateEntity } from './entity-domain.mjs';
import { PUBLIC_IDENTITY_TARGETS } from './public-identity-targets.mjs';
import { assertCanonicalOccupancy } from './canonical-registry-snapshot.mjs';
import { proposeCanonicalId } from './canonical-id-allocation.mjs';
import { REGISTRY_PREFIX, validateCommand, validateHistory } from './canonical-registry-domain.mjs';

export async function protectedCanonicalIds() {
  const graph=JSON.parse(await readFile(new URL('../entity-graph.json',import.meta.url),'utf8'));
  if(!Array.isArray(graph.nodes)||graph.nodes.some(n=>typeof n.entity_id!=='string')) fail('registry_sources_invalid',503);
  return new Set([...CANONICAL_IDS,...Object.keys(PUBLIC_IDENTITY_TARGETS),...graph.nodes.map(n=>n.entity_id)]);
}
export function latestCases(cases) {
  const latest=new Map();
  for(const c of cases) {
    if(!c||!c.data||!Number.isInteger(c.version)) fail('registry_sources_invalid',503);
    if(!latest.has(c.id)||latest.get(c.id).version<c.version) latest.set(c.id,c);
  }
  return latest;
}

// Pure transaction planner. A store MUST recompute against the exact Git tree
// on each compare-and-swap attempt, never blindly reuse an old success decision.
export function registryPlan(snapshot,command,actor,blockedIds,at) {
  const groups=validateHistory(snapshot.events);
  assertCanonicalOccupancy(snapshot.cases,snapshot);
  const operationKey=hash(['canonical-registry-v1',command.key]);
  const operationHash=hash({command,actor});
  const duplicate=snapshot.events.find(e=>e.operation_key===operationKey);
  if(duplicate) {
    if(duplicate.operation_hash!==operationHash) fail('registry_idempotency_conflict',409);
    // Historical success cannot bypass today's protected-ID policy. Withdrawal
    // remains available; replay never deletes or releases the historical lock.
    if(['reserve','bind'].includes(command.action)&&blockedIds.has(duplicate.canonical_id)) fail('registry_id_unavailable',409);
    return {event:duplicate,files:[],replayed:true};
  }
  const history=groups.get(command.request_id)||[],previous=history.at(-1);
  if((previous?.version||0)!==command.expected_version) fail('registry_revision_conflict',409);
  if(previous&&previous.case_id!==command.case_id) fail('registry_case_mismatch',409);
  const current=latestCases(snapshot.cases).get(command.case_id);
  if(!current||current.tenant!=='admin-console'||current.version!==command.case_revision||hash(current.data)!==command.case_hash) fail('registry_case_revision_conflict',409);
  if(current.status==='archived'&&command.action!=='withdraw') fail('registry_case_archived',409);
  if(previous&&command.action!=='withdraw'&&(previous.case_revision!==command.case_revision||previous.case_hash!==command.case_hash)) fail('registry_case_revision_conflict',409);
  let status=previous?.status,identity=previous?.identity,review=previous?.review??null,canonicalId=previous?.canonical_id??null;
  let requester=previous?.requester,caseRecord;
  if(command.action==='request') {
    validateEntity(current.data);
    if(previous||command.expected_version!==0) fail('registry_invalid_transition',409);
    if(snapshot.cases.some(c=>c.id===current.id&&c.data?.canonicalEntityId)) fail('registry_case_already_linked',409);
    if(command.payload.name!==current.data.canonicalName||command.payload.type!==current.data.type)fail('registry_case_mismatch',409);
    identity=structuredClone(command.payload);requester=actor.subject;status='requested';
  } else if(command.action==='review') {
    if(status!=='requested') fail('registry_invalid_transition',409);
    if(actor.subject===requester) fail('registry_independent_review_required',403);
    review={...structuredClone(command.payload),reviewer:actor.subject,reviewed_at:at};status=review.decision;
  } else if(command.action==='reserve') {
    if(status!=='approved'||!review||review.decision!=='approved') fail('registry_review_required',409);
    canonicalId=command.payload.canonical_id===null
      ?proposeCanonicalId(snapshot,identity.namespace,blockedIds).candidate
      :command.payload.canonical_id;
    if(canonicalId.split('-')[0]!==identity.namespace) fail('registry_namespace_mismatch',409);
    // Every historical reservation/link counts, including archived/withdrawn.
    if(blockedIds.has(canonicalId)||snapshot.events.some(e=>e.canonical_id===canonicalId)||
      snapshot.cases.some(c=>c.data?.canonicalEntityId===canonicalId)||snapshot.reservations.includes(canonicalId)) fail('registry_id_unavailable',409);
    if(current.data.canonicalEntityId||[...groups.values()].some(g=>g.at(-1).case_id===current.id&&['reserved','bound'].includes(g.at(-1).status))) fail('registry_case_already_linked',409);
    status='reserved';
  } else if(command.action==='bind') {
    validateEntity(current.data);
    if(status!=='reserved'||!review||review.decision!=='approved'||!canonicalId) fail('registry_invalid_transition',409);
    if(blockedIds.has(canonicalId)||current.data.canonicalEntityId||snapshot.cases.some(c=>c.data?.canonicalEntityId===canonicalId)) fail('registry_id_unavailable',409);
    if(!snapshot.reservations.includes(canonicalId)) fail('registry_history_invalid',503);
    status='bound';caseRecord=caseRevision(current,canonicalId,'canonical_bind',at,operationKey,operationHash);
  } else if(command.action==='withdraw') {
    if(!previous||status==='withdrawn') fail('registry_invalid_transition',409);
    // Retain the historical canonical link. Archive the private case and remove
    // data-release approval/package. Withdrawal does not perform public takedown.
    if(status==='bound') {
      if(current.data.canonicalEntityId!==canonicalId) fail('registry_case_mismatch',409);
      caseRecord=caseRevision(current,canonicalId,'canonical_withdraw',at,operationKey,operationHash);
      caseRecord.status='archived';
    }
    status='withdrawn';
  }
  const event={schema_version:1,request_id:command.request_id,version:command.expected_version+1,action:command.action,status,
    case_id:command.case_id,case_revision:command.case_revision,case_hash:command.case_hash,identity,canonical_id:canonicalId,review,requester,actor,at,
    reason:command.reason,operation_key:operationKey,operation_hash:operationHash,previous_hash:previous?hash(previous):null,publication_authorized:false};
  validateHistory([...snapshot.events,event]);
  const eventPath=REGISTRY_PREFIX+'requests/'+event.request_id+'/'+String(event.version).padStart(8,'0')+'.json';
  const files=[{path:eventPath,content:JSON.stringify(event)},
    {path:REGISTRY_PREFIX+'operations/'+operationKey+'.json',content:JSON.stringify({request_id:event.request_id,version:event.version,operation_hash:operationHash})}];
  if(command.action==='reserve')files.push({path:REGISTRY_PREFIX+'ids/'+canonicalId+'.json',content:JSON.stringify({schema_version:1,canonical_id:canonicalId,request_id:event.request_id,reserved_at:at})});
  if(caseRecord)files.push({path:'entity-console/v1/'+caseRecord.id+'/'+String(caseRecord.version).padStart(8,'0')+'.json',content:JSON.stringify(caseRecord)});
  return {event,files,replayed:false};
}
function caseRevision(previous,id,action,at,operationKey,operationHash) {
  return {...previous,version:previous.version+1,eventId:operationKey,updatedAt:at,status:'draft',
    data:{...previous.data,canonicalEntityId:id},approvedVersion:null,approvedDataHash:null,packageData:null,publicUrl:null,
    operationKey,operationHash,
    // Keep the current single-administrator Console response contract. The exact
    // verified registrar subject/issuer/role is recorded in the private ledger.
    activity:[...previous.activity,{at,actor:'administradora',action,version:previous.version+1}]};
}
export class CanonicalRegistry {
  #authorize;#store;
  constructor({authority,store}={}) {
    if(typeof authority!=='function'||!store||typeof store.transact!=='function') fail('registry_authority_unconfigured',503);
    this.#authorize=authority;this.#store=store;
  }
  async change(input,capability) {
    const command=structuredClone(validateCommand(input));
    // Authenticate before reading a private snapshot. Check again at each retry.
    await this.#authorize(capability,command);
    const blockedIds=await protectedCanonicalIds();
    return this.#store.transact(async snapshot=>{
      const actor=await this.#authorize(capability,command);
      return registryPlan(snapshot,command,actor,blockedIds,new Date().toISOString());
    });
  }
}
