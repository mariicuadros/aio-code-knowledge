import { state, commitFiles } from './vault-client.mjs';
import { VaultStore } from './entity-store.mjs';
import { ApiError, fail } from './entity-domain.mjs';
import { REGISTRY_PREFIX } from './canonical-registry-domain.mjs';
import { readRegistryLedger, assertCanonicalOccupancy } from './canonical-registry-snapshot.mjs';

// Explicit dependency injection only. Nothing constructs this adapter from
// environment credentials, HTTP routes or the ordinary admin token.
export class CanonicalRegistryVaultStore {
  #readToken;#writeToken;
  constructor({readToken,writeToken}={}) {
    if(!readToken||!writeToken) fail('registry_store_unconfigured',503);
    this.#readToken=readToken;this.#writeToken=writeToken;
  }
  async snapshot(git) {
    const ledger=await readRegistryLedger(git,this.#readToken);
    const cases=await new VaultStore(this.#readToken,'').recordsFromSnapshot(git);
    assertCanonicalOccupancy(cases,ledger);
    return {...ledger,cases};
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
