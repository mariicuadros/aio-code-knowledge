import { textBlob } from './vault-client.mjs';
import { fail } from './entity-domain.mjs';
import { REGISTRY_PREFIX, REQUEST_ID, CANONICAL_ID, validateHistory, exact } from './canonical-registry-domain.mjs';

// One ledger reader for ordinary persistence and the isolated registry.
export async function readRegistryLedger(git,readToken) {
    const events=[],reservations=[],locks=[],markers=[];
    const entries=git.entries.filter(e=>e.path?.startsWith(REGISTRY_PREFIX));
    if(entries.length>10000) fail('registry_record_limit',503);
    for(const entry of entries) {
      if(entry.type!=='blob')continue;
      const path=entry.path.slice(REGISTRY_PREFIX.length);
      if(path.startsWith('requests/')) {
        const parts=path.split('/');
        if(parts.length!==3||!REQUEST_ID.test(parts[1])||!/^\d{8}\.json$/.test(parts[2])) fail('registry_history_invalid',503);
        const event=JSON.parse(await textBlob(entry.sha,readToken));
        if(event.request_id!==parts[1]||String(event.version).padStart(8,'0')+'.json'!==parts[2]) fail('registry_history_invalid',503);
        events.push(event);
      } else if(path.startsWith('ids/')) {
        const id=path.slice(4,-5);
        if(!path.endsWith('.json')||!CANONICAL_ID.test(id)) fail('registry_history_invalid',503);
        const lock=JSON.parse(await textBlob(entry.sha,readToken));
        exact(lock,['schema_version','canonical_id','request_id','reserved_at']);
        if(lock.schema_version!==1||lock.canonical_id!==id||!REQUEST_ID.test(lock.request_id)) fail('registry_history_invalid',503);
        reservations.push(id);locks.push(lock);
      } else if(/^operations\/[a-f0-9]{64}\.json$/.test(path)) {
        const marker=JSON.parse(await textBlob(entry.sha,readToken));
        exact(marker,['request_id','version','operation_hash']);
        markers.push({key:path.slice(11,-5),...marker});
      } else fail('registry_history_invalid',503);
    }
    validateHistory(events);
    if(new Set(reservations).size!==reservations.length) fail('registry_history_invalid',503);
    const reserved=events.filter(e=>e.action==='reserve');
    if(new Set(reserved.map(e=>e.canonical_id)).size!==reserved.length||locks.length!==reserved.length||markers.length!==events.length)fail('registry_history_invalid',503);
    for(const e of reserved)if(!locks.some(l=>l.canonical_id===e.canonical_id&&l.request_id===e.request_id&&l.reserved_at===e.at)) fail('registry_history_invalid',503);
    for(const e of events)if(!markers.some(m=>m.key===e.operation_key&&m.operation_hash===e.operation_hash&&m.request_id===e.request_id&&m.version===e.version))fail('registry_history_invalid',503);
    return {events,reservations,locks};
}

// Every historical binding occupies an ID permanently. A registry reservation
// may coexist with a case only after the matching request atomically bound it.
export function assertCanonicalOccupancy(cases,{events=[],locks=[]}={}) {
  const owners=new Map();
  for(const record of cases) {
    const id=record.data?.canonicalEntityId;
    if(!id)continue;
    if(owners.has(id)&&owners.get(id)!==record.id) fail('canonical_link_conflict',409);
    owners.set(id,record.id);
  }
  for(const event of events.filter(e=>e.action==='bind')) {
    if(!cases.some(c=>c.id===event.case_id&&c.version===event.case_revision+1&&
       c.data?.canonicalEntityId===event.canonical_id&&c.operationKey===event.operation_key&&
       c.operationHash===event.operation_hash)) fail('registry_history_invalid',503);
  }
  for(const lock of locks) {
    const owner=owners.get(lock.canonical_id);
    if(!owner)continue;
    const bound=events.find(e=>e.request_id===lock.request_id&&e.action==='bind'&&e.canonical_id===lock.canonical_id);
    if(!bound||bound.case_id!==owner) fail('canonical_link_conflict',409);
  }
}
