/**
 * Explicit gate for a FUTURE public-release pipeline.
 *
 * This module does NOT publish, mutate Vault, mint canonical IDs, or change
 * existing private Entity Console packages. A release implementation MUST
 * call it before creating a public PR, rendering JSON-LD, pushing RAG/HF
 * datasets, or triggering any deployment.
 */
import { fail, hash, publicPackage, validateEntity } from './entity-domain.mjs';
import { publicCanonicalTarget } from './public-identity-targets.mjs';

const PRIVATE_ENT = /\bENT-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/i;

/** Pure check: return a reviewed, fully supported private release candidate. */
export function publicReleaseCandidate(record) {
  if (!record || typeof record !== 'object' || !record.data) fail('public_release_invalid_record', 400);
  if (record.status !== 'pending_deployment' ||
      !Number.isInteger(record.approvedVersion) ||
      record.approvedVersion < 1 ||
      !record.approvedDataHash ||
      record.approvedDataHash !== hash(record.data) ||
      !record.packageData ||
      record.publicUrl !== null) fail('public_release_requires_current_approval', 409);

  // This is NOT a way to create or infer a canonical identifier.
  const validated = validateEntity(record.data);
  if (!validated.canonicalEntityId) fail('public_release_requires_canonical_identity', 409);
  if (!Array.isArray(validated.publicFields) ||
      !validated.publicFields.includes('officialUrls')) fail('public_release_requires_reviewed_page', 409);

  // Recalculate the approved projection instead of trusting a saved package.
  const computed = publicPackage({...record, data: validated});
  const target = publicCanonicalTarget(computed.entity);
  if (!target ||
      computed.entity.id !== validated.canonicalEntityId ||
      computed.jsonld['@id'] !== target.personId ||
      computed.jsonld.identifier !== validated.canonicalEntityId ||
      computed.jsonld.url !== target.pageUrl) fail('public_release_requires_reviewed_page', 409);

  if (JSON.stringify(record.packageData) !== JSON.stringify(computed)) {
    fail('public_release_package_drift', 409);
  }

  // Never let an administrative ID reach a public file, even through
  // accidentally selected fields, captions or schema extensions.
  if (PRIVATE_ENT.test(JSON.stringify(computed))) {
    fail('public_release_private_id_detected', 409);
  }

  return Object.freeze({
    canonicalEntityId: validated.canonicalEntityId,
    publicPage: target.pageUrl,
    jsonldId: target.personId,
    package: computed,
    approvedVersion: record.approvedVersion,
    approvedDataHash: record.approvedDataHash,
  });
}
