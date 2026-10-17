/**
 * Phase 2: proposal-only bridge between an immutable approved private revision
 * and an existing, separately managed public Entity Home.
 *
 * This module never writes files, fetches the Vault, authorizes publication, or
 * treats a diff as evidence of legal/rights approval.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { hash, publicPackage } from './entity-domain.mjs';
import { PUBLIC_IDENTITY_TARGETS } from './public-identity-targets.mjs';
import { comparePublicEntity } from '../scripts/check_public_entity_sync.mjs';

export const PROPOSAL_SCHEMA='aio-public-update-proposal-v1';
const APPROVABLE_FIELDS=new Set(['description','alternateName','keywords']);
const jsonHash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));
function reject(code){const e=new Error(code);e.code=code;throw e;}
function aliases(x) {return x===undefined?[]:Array.isArray(x)?x:[x];}
function delta(changes,field,current,proposed,rule) {
  if(!same(current,proposed))changes.push({field,rule,current,proposed});
}
/**
 * All proposed values come exclusively from a verified publicPackage(record).
 * The public document provides the baseline, including existing editorial work.
 * The full private revision is never included in the result.
 */
export function preparePublicUpdateProposal({record,id='DAN-001',root=resolve('.')}={}) {
  const target=PUBLIC_IDENTITY_TARGETS[id];
  if(!target)reject('unregistered_entity');
  if(!record||typeof record!=='object'||Array.isArray(record))reject('invalid_private_revision');
  if(!Number.isInteger(record.version)||!Number.isInteger(record.approvedVersion)||record.approvedVersion<1||record.approvedVersion>=record.version||record.status!=='pending_deployment')reject('approved_revision_required');
  if(!record.data||record.data.canonicalEntityId!==id||typeof record.approvedDataHash!=='string'||record.approvedDataHash!==hash(record.data))reject('approval_hash_mismatch');
  const projection=publicPackage(record);
  if(!record.packageData||!same(record.packageData,projection))reject('approved_projection_mismatch');
  const j=projection.jsonld,e=projection.entity;
  if(e.id!==id||e.canonicalName!==target.name||j['@type']!==target.type||j['@id']!==target.personId||j.url!==target.pageUrl)reject('canonical_identity_mismatch');
  if(JSON.stringify(projection).includes('ENT-'))reject('private_record_id_in_projection');

  // Verify only public surfaces; never use an unpublished private record to
  // redefine the public canonical identity or silently repair site drift.
  const publicCheck=comparePublicEntity({id,root});
  if(!publicCheck.ok)reject('public_baseline_inconsistent');
  const current=JSON.parse(readFileSync(resolve(root,target.jsonldPath),'utf8'));
  const changes=[],blocks=[];
  delta(changes,'description',current.description,j.description,'editorial_review_required');
  delta(changes,'alternateName',aliases(current.alternateName),aliases(j.alternateName),'editorial_review_required');
  delta(changes,'keywords',current.keywords??null,j.keywords??null,'editorial_review_required');
  if(!sameSet(current.sameAs,j.sameAs)) {
    changes.push({field:'sameAs',rule:'cross_surface_review_required',current:current.sameAs,proposed:j.sameAs});
    blocks.push('social_changes_require_coordinated_page_and_platform_update');
  }
  // A proposal NEVER auto-adds or removes fields outside these four items.
  const protectedFields=Object.keys(current).filter(k=>!['description','alternateName','keywords','sameAs'].includes(k));
  return {
    schema:PROPOSAL_SCHEMA,
    status:changes.length?'requires_manual_review':'no_changes',
    entityId:id,
    source:{recordVersion:record.version,approvedVersion:record.approvedVersion,approvedProjectionSha256:jsonHash(projection),vaultProvenance:'not_independently_verified_offline'},
    target:{path:target.jsonldPath,pagePath:target.pagePath,platformsPath:target.platformsPath,publicDocumentSha256:jsonHash(current)},
    changes,blocks,protectedFields,
    permissions:{automaticPublication:false,needsHumanReview:true,requiresApprovedSourceRevision:true,requiresIndependentVaultProvenanceCheck:true},
    notice:'Local review proposal only. Not a live site change, legal authorization, or a publish approval.'
  };
}
/**
 * A pure preview of fields explicitly selected by a reviewer. Still does not
 * write, deploy, approve a PR, or update any public surface.
 */
export function previewReviewedCandidate({proposal,currentDocument,acceptedFields=[]}={}) {
  if(!proposal||proposal.schema!==PROPOSAL_SCHEMA||!currentDocument||!Array.isArray(acceptedFields)||proposal.blocks?.length)reject('invalid_review_state');
  if(!same(proposal.target?.publicDocumentSha256,jsonHash(currentDocument)))reject('public_baseline_changed');
  if(new Set(acceptedFields).size!==acceptedFields.length||acceptedFields.some(f=>!APPROVABLE_FIELDS.has(f)))reject('field_requires_separate_review');
  const changes=new Map(proposal.changes.map(c=>[c.field,c]));
  if(acceptedFields.some(f=>!changes.has(f)))reject('field_not_in_proposal');
  const candidate=structuredClone(currentDocument);
  for(const field of acceptedFields) {
    const change=changes.get(field);
    if(change.rule!=='editorial_review_required')reject('field_requires_separate_review');
    if(change.proposed===null||change.proposed===undefined)delete candidate[field];
    else candidate[field]=structuredClone(change.proposed);
  }
  return candidate;
}
