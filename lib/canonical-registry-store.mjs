import { state, textBlob, commitFiles } from './vault-client.mjs';
import { VaultStore } from './entity-store.mjs';
import { ApiError, fail } from './entity-domain.mjs';
import { REGISTRY_PREFIX, REQUEST_ID, CANONICAL_ID, validateHistory, exact } from './canonical-registry-domain.mjs';

// Explicit dependency injection only. Nothing constructs this adapter from
// environment credentials, HTTP routes or the ordinary admin token.
export class CanonicalRegistryVaultStore {
  #readToken;#writeToken;
  constructor({readToken,writeToken}={}) {
    if(!readToken||!writeToken) fail('registry_store_unconfigured',503);
    this.#readToken=readToken;this.#writeToken=writeToken;
  }
  async snapshot(git) {
    const events=[],reservations=[],locks=[],markers=[];
    const entries=git.entries.filter(e=>e.path?.startsWith(REGISTRY_PREFIX));
    if(entries.length>10000) fail('registry_record_limit',503);
    for(const entry of entries) {
      if(entry.type!=='blob')continue;
      const path=entry.path.slice(REGISTRY_PREFIX.length);
      if(path.startsWith('requests/')) {
        const parts=path.split('/');
        if(parts.length!==3||!REQUEST_ID.test(parts[1])||!/^\d{8}\.json$/.test(parts[2])) fail('registry_history_invalid',503);
        const event=JSON.parse(await textBlob(entry.sha,this.#readToken));
        if(event.request_id!==parts[1]||String(event.version).padStart(8,'0')+'.json'!==parts[2]) fail('registry_history_invalid',503);
        events.push(event);
      } else if(path.startsWith('ids/')) {
        const id=path.slice(4,-5);
        if(!path.endsWith('.json')||!CANONICAL_ID.test(id)) fail('registry_history_invalid',503);
        const lock=JSON.parse(await textBlob(entry.sha,this.#readToken));
        exact(lock,['schema_version','canonical_id','request_id','reserved_at']);
        if(lock.schema_version!==1||lock.canonical_id!==id||!REQUEST_ID.test(lock.request_id)) fail('registry_history_invalid',503);
        reservations.push(id);locks.push(lock);
      } else if(/^operations\/[a-f0-9]{64}\.json$/.test(path)) {
        const marker=JSON.parse(await textBlob(entry.sha,this.#readToken));
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
    return {events,reservations,cases:await new VaultStore(this.#readToken,'').recordsFromSnapshot(git)};
  }
  async transact(plan) {
    let result;
    try {
      const initial=await state(this.#readToken);
      result=await plan(await this.snapshot(initial));
      if(result.replayed)return result.event;
      const marker=result.files.find(f=>f.path.startsWith(REGISTRY_PREFIX+'operations/')).path;
      const preflight=async git=>{
        const fresh=await plan(await this.snapshot(git));
        if(fresh.replayed)fail('registry_retry_replayed',409);
        // Retry only the same immutable decision/revision, not a recomputed
        // decision with altered data. Ignore timestamp chosen by the planner.
        if(fresh.event.previous_hash!==result.event.previous_hash||fresh.event.operation_hash!==result.event.operation_hash||fresh.event.case_hash!==result.event.case_hash) fail('registry_revision_conflict',409);
      };
      await commitFiles(this.#writeToken,result.files,'Private canonical registry decision',marker,preflight);
      // Also handles marker short-circuit / competing identical retry.
      const confirmed=await plan(await this.snapshot(await state(this.#readToken)));
      if(!confirmed.replayed) fail('registry_commit_unconfirmed',503);
      return confirmed.event;
    } catch(error) {
      if(error instanceof ApiError&&error.code!=='registry_retry_replayed')throw error;
      // A provider may lose the response after a successful ref update. Resolve
      // the operation marker via a fresh private snapshot; never blindly append.
      try {
        const recovered=await plan(await this.snapshot(await state(this.#readToken)));
        if(recovered.replayed)return recovered.event;
      } catch(recovery) { if(recovery instanceof ApiError)throw recovery; }
      fail('registry_provider_unavailable',503);
    }
  }
}
