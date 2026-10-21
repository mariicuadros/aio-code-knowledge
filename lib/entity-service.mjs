import { randomUUID } from 'node:crypto';
import { fail, hash, validateEntity, publicPackage, reviewedCanonicalLink } from './entity-domain.mjs';
const tenant='admin-console';
export class EntityService {
  constructor(store) { this.store=store; }
  async records() { return (await this.store.all()).filter(r=>r.tenant===tenant); }
  async list() {
    const latest=new Map();
    for(const r of await this.records()) if(!latest.has(r.id)||latest.get(r.id).version<r.version) latest.set(r.id,r);
    return [...latest.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  }
  async get(id) {
    if(!/^ENT-[a-f0-9-]{36}$/.test(id||'')) fail('not_found',404);
    const entity=(await this.list()).find(r=>r.id===id);
    if(!entity) fail('not_found',404);
    return entity;
  }
  async change({id,action='create',body,key}) {
    if(!/^[a-f0-9-]{36}$/.test(key||'')) fail('idempotency_key_required');
    // Fail closed: no independent registrar authorization is wired yet.
    // This guard precedes idempotency replay, so historical link operations cannot bypass it.
    if(action==='link_canonical') fail('registrar_authorization_required',403);
    const operationKey=hash([tenant,key]);
    const operationHash=hash({id,action,body});
    const duplicate=(await this.records()).find(r=>r.operationKey===operationKey);
    if(duplicate) { if(duplicate.operationHash!==operationHash) fail('idempotency_conflict',409);return duplicate; }
    let previous, data, status, approvedVersion=null, packageData=null;
    if(action==='create') {
      if(Object.keys(body).some(k=>k!=='data')) fail('invalid_fields');
      data=validateEntity(body.data);
      // Ordinary creation never assigns an externally meaningful canonical identity.
      if(data.canonicalEntityId) fail('canonical_link_requires_reviewed_action',409);
      status='draft'; id='ENT-'+randomUUID();
    } else {
      previous=await this.get(id);
      if(body.expectedVersion!==previous.version) fail('revision_conflict',409);
      const keys=action==='edit'?['expectedVersion','data']:action==='link_canonical'?['expectedVersion','canonicalEntityId']:['expectedVersion'];
      if(Object.keys(body).some(k=>!keys.includes(k))) fail('invalid_fields');
      data=previous.data;status=previous.status;approvedVersion=previous.approvedVersion;packageData=previous.packageData;
      if(action==='edit') { if(status==='archived') fail('invalid_transition',409); data=validateEntity(body.data); if(data.canonicalEntityId!==previous.data.canonicalEntityId) fail('canonical_link_requires_reviewed_action',409); if(data.canonicalEntityId) reviewedCanonicalLink(data.canonicalEntityId,data); status='draft';approvedVersion=null;packageData=null; }
      else if(action==='link_canonical') {
        if(status==='archived') fail('invalid_transition',409);
        if(data.canonicalEntityId) fail('canonical_already_linked',409);
        if(status!=='review'||!data.useAuthorized) fail('canonical_link_requires_reviewed_action',409);
        if(typeof body.canonicalEntityId!=='string') fail('invalid_canonical_link');
        data=validateEntity({...data,canonicalEntityId:body.canonicalEntityId});
        reviewedCanonicalLink(body.canonicalEntityId,data);
        status='draft';approvedVersion=null;packageData=null;
      }
      else if(action==='validate') { validateEntity(data); if(status!=='draft') fail('invalid_transition',409);status='review'; }
      else if(action==='approve') {
        if(status!=='review'||!data.useAuthorized) fail('approval_requires_review_and_authorization',409);
        status='approved'; approvedVersion=previous.version;
      }
      else if(action==='publish') {
        if(status!=='approved'||!approvedVersion) fail('approval_required',409);
        status='pending_deployment';packageData=publicPackage(previous);
      }
      else if(action==='refresh_package') {
        // The previously approved data remain immutable; only regenerate a private projection.
        if(status!=='pending_deployment'||!approvedVersion||previous.approvedDataHash!==hash(data)) fail('approval_required',409);
        packageData=publicPackage(previous);
      }
      else if(action==='archive') { status='archived';packageData=null;approvedVersion=null; }
      else fail('invalid_action');
    }
    if(data.canonicalEntityId) {
      const existing=(await this.records()).find(r=>r.id!==id&&r.data?.canonicalEntityId===data.canonicalEntityId);
      // Historical bindings remain occupied even after archive or withdrawal.
      if(existing) fail('canonical_link_conflict',409);
    }
    const now=new Date().toISOString();
    const record={id,tenant,eventId:randomUUID(),version:(previous?.version||0)+1,createdAt:previous?.createdAt||now,updatedAt:now,status,data,approvedVersion,approvedDataHash:approvedVersion?hash(data):null,packageData,publicUrl:null,operationKey,operationHash,activity:[...(previous?.activity||[]),{at:now,actor:'administradora',action,version:(previous?.version||0)+1}]};
    return this.store.append(record);
  }
}
