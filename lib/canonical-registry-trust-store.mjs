import { fail, hash } from './entity-domain.mjs';
import { exact } from './canonical-registry-domain.mjs';
import { CanonicalRegistryVaultStore } from './canonical-registry-store.mjs';
import { textBlob } from './vault-client.mjs';

export const TRUST_PREFIX='canonical-registration-trust/v1/receipts/';
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);

// Isolated explicit adapter; no configured instance and no HTTP imports.
// A shared Git ledger, not a process lock, owns nonce uniqueness and admission.
export class RegistryTrustVaultStore extends CanonicalRegistryVaultStore {
  #readToken;#limit;#window;
  constructor({readToken,writeToken,maxPerWindow=10,windowSeconds=60}={}) {
    super({readToken,writeToken});
    if(!Number.isSafeInteger(maxPerWindow)||maxPerWindow<1||maxPerWindow>100||
       !Number.isSafeInteger(windowSeconds)||windowSeconds<1||windowSeconds>3600) fail('registry_trust_unconfigured',503);
    this.#readToken=readToken;this.#limit=maxPerWindow;this.#window=windowSeconds;
  }
  async snapshot(git) {
    const snapshot=await super.snapshot(git),receipts=[];
    const entries=git.entries.filter(e=>e.path?.startsWith('canonical-registration-trust/'));
    if(entries.length>10000) fail('registry_trust_unconfigured',503);
    try {
      for(const entry of entries) {
        if(entry.type!=='blob'||!entry.path.startsWith(TRUST_PREFIX)||!/^([a-f0-9]{64})\.json$/.test(entry.path.slice(TRUST_PREFIX.length))) throw Error();
        const r=JSON.parse(await textBlob(entry.sha,this.#readToken));
        exact(r,['schema_version','policy_version','nonce_hash','session_hash','subject_hash','command_hash','key_id','issued_at','operation_key']);
        if(r.schema_version!==1||!Number.isSafeInteger(r.policy_version)||r.policy_version<1||!['nonce_hash','session_hash','subject_hash','command_hash','operation_key'].every(k=>hex(r[k]))||
           typeof r.key_id!=='string'||!r.key_id||r.key_id.length>80||!Number.isSafeInteger(r.issued_at)||
           entry.path!==TRUST_PREFIX+r.nonce_hash+'.json'||receipts.some(x=>x.nonce_hash===r.nonce_hash||x.operation_key===r.operation_key)) throw Error();
        const event=snapshot.events.find(e=>e.operation_key===r.operation_key);
        if(!event||hash(event.actor.subject)!==r.subject_hash) throw Error();
        receipts.push(r);
      }
    } catch {
      fail('registry_trust_unconfigured',503);
    }
    return {...snapshot,trustReceipts:receipts};
  }
  async transactTrusted(plan,admission,clock) {
    // Capture a private immutable admission; the browser never supplies this.
    const a=structuredClone(admission);
    return super.transact(async snapshot=>{
      const result=await plan(snapshot); // Session/signature/revision checks first.
      if(snapshot.trustReceipts.some(r=>r.policy_version>a.policy_version)) fail('registry_forbidden',403);
      const now=Math.floor(clock()/1000);
      if(now<a.issued_at||now-a.issued_at>=60) fail('registry_forbidden',403);
      if(result.event.action!=='request'&&result.event.actor.subject===result.event.requester) fail('registry_independent_review_required',403);
      const receipt=snapshot.trustReceipts.find(r=>r.nonce_hash===a.nonce_hash);
      if(receipt) {
        if(receipt.command_hash!==a.command_hash||receipt.session_hash!==a.session_hash||
           receipt.subject_hash!==a.subject_hash||receipt.operation_key!==result.event.operation_key||!result.replayed)
          fail('registry_replay_conflict',409);
        return result;
      }
      // A PR B-only event may not acquire a trust receipt retroactively.
      if(result.replayed) fail('registry_replay_conflict',409);
      const recent=snapshot.trustReceipts.filter(r=>r.issued_at>now-this.#window);
      if(recent.some(r=>r.issued_at>now)) fail('registry_trust_unconfigured',503);
      if(recent.filter(r=>r.subject_hash===a.subject_hash).length>=this.#limit) fail('registry_rate_limited',429);
      const record={schema_version:1,...a,operation_key:result.event.operation_key};
      return {...result,files:[...result.files,{path:TRUST_PREFIX+a.nonce_hash+'.json',content:JSON.stringify(record)}]};
    });
  }
}
