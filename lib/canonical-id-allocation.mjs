import { fail } from './entity-domain.mjs';
import { CANONICAL_ID } from './canonical-registry-domain.mjs';

// Candidate selection only: never assigns, reserves, binds, signs, or publishes an ID.
// A privileged registrar MUST re-evaluate against the exact Git snapshot in the
// same compare-and-swap transaction that writes the immutable reservation.
const NAMESPACE=/^[A-Z][A-Z0-9]{1,11}$/;
function occupied(snapshot, blocked) {
  if(!(blocked instanceof Set)||[...blocked].some(x=>typeof x!=='string'||!CANONICAL_ID.test(x))) fail('registry_sources_invalid',503);
  if(!snapshot||!Array.isArray(snapshot.cases)||!Array.isArray(snapshot.events)||
     !Array.isArray(snapshot.reservations))fail('registry_sources_invalid',503);
  const ids=new Set(blocked);
  for(const id of snapshot.reservations) {
    if(typeof id!=='string'||!CANONICAL_ID.test(id))fail('registry_sources_invalid',503);
    ids.add(id);
  }
  // Include EVERY historical case revision and registry event, including
  // archived, withdrawn, superseded or accidentally omitted current bindings.
  for(const record of snapshot.cases) {
    if(!record||typeof record!=='object'||!record.data||
       typeof record.data!=='object'||!Object.hasOwn(record.data,'canonicalEntityId'))fail('registry_sources_invalid',503);
    const id=record.data.canonicalEntityId;
    if(id!=null) {
      if(typeof id!=='string'||!CANONICAL_ID.test(id))fail('registry_sources_invalid',503);
      ids.add(id);
    }
  }
  for(const event of snapshot.events) {
    if(!event||typeof event!=='object'||!Object.hasOwn(event,'canonical_id'))fail('registry_sources_invalid',503);
    const id=event.canonical_id;
    if(id!=null) {
      if(typeof id!=='string'||!CANONICAL_ID.test(id))fail('registry_sources_invalid',503);
      ids.add(id);
    }
  }
  return ids;
}
export function proposeCanonicalId(snapshot,namespace,blockedIds) {
  if(typeof namespace!=='string'||!NAMESPACE.test(namespace))fail('registry_invalid_contract');
  const ids=occupied(snapshot,blockedIds);
  for(let n=1;n<=999;n++){
    const id=namespace+'-'+String(n).padStart(3,'0');
    if(!ids.has(id))return Object.freeze({candidate:id,namespace,
      authority:'none',reserved:false,source:'snapshot_candidate_only'});
  }
  fail('registry_namespace_exhausted',409);
}
