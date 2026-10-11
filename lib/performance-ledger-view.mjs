function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function samePlatform(a, b) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
}
function sameInstant(a, b) {
  return typeof a === 'string' && typeof b === 'string' &&
    Number.isFinite(Date.parse(a)) && Number.isFinite(Date.parse(b)) && Date.parse(a) === Date.parse(b);
}
function sameMetric(a, b, sourceRef) {
  return a && b && a.state === b.state && a.value === b.value &&
    a.source_ref === sourceRef && b.source_ref === sourceRef;
}
export function linkPerformanceLedger(candidates, records) {
  const capturesById = new Map();
  for (const candidate of candidates) {
    const rows = capturesById.get(candidate.proposed_content_id) || [];
    rows.push(candidate);
    capturesById.set(candidate.proposed_content_id, rows);
  }
  const provenanceById = new Map();
  const observationsById = new Map();
  for (const record of records) {
    if (!capturesById.has(record.content_id)) continue;
    assert(record.visibility === 'private', 'Linked record must remain private');
    if (record.record_type === 'content_provenance') {
      assert(!provenanceById.has(record.content_id), 'Duplicate provenance for content ID');
      provenanceById.set(record.content_id, record);
    } else if (record.record_type === 'performance_observation') {
      const rows = observationsById.get(record.content_id) || [];
      rows.push(record);
      observationsById.set(record.content_id, rows);
    }
  }
  return [...capturesById.entries()].map(([contentId, captures]) => {
    captures.sort((a, b) => b.captured_at.localeCompare(a.captured_at));
    const latestCandidate = captures[0];
    const provenance = provenanceById.get(contentId) || null;
    const observations = observationsById.get(contentId) || [];
    if (provenance) {
      assert(provenance.status === 'published', 'Provenance is not marked published');
      assert(provenance.content_id === contentId, 'Provenance content ID mismatch');
      assert(captures.every(candidate => provenance.owner === candidate.owner && provenance.entity_ids?.includes(candidate.entity_id)),
        'Provenance owner or entity mismatch');
      assert(captures.some(candidate => provenance.source_evidence_refs?.includes(candidate.source_ref)),
        'Provenance does not cite a media snapshot');
      assert(sameInstant(provenance.published_at, latestCandidate.published_at), 'Publication timestamp mismatch');
      assert(samePlatform(provenance.platform, latestCandidate.platform), 'Publication platform mismatch');
      assert(provenance.publication_ref === latestCandidate.permalink, 'Publication URL mismatch');
    }
    const validObservations = observations.map(record => {
      assert(provenance, 'Performance observation has no linked publication provenance');
      const evidence = captures.find(candidate =>
        candidate.source_ref === record.source_ref && sameInstant(candidate.captured_at, record.captured_at));
      assert(evidence, 'Observation does not match a verified media capture');
      assert(record.owner === evidence.owner && record.entity_id === evidence.entity_id, 'Observation owner or entity mismatch');
      assert(samePlatform(record.platform, evidence.platform), 'Observation platform mismatch');
      assert(sameInstant(record.measurement_window?.start, evidence.published_at), 'Observation start does not match publication');
      assert(sameInstant(record.measurement_window?.end, evidence.captured_at), 'Observation end does not match capture');
      assert(sameMetric(record.metrics?.like_count, evidence.counters.like_count, evidence.source_ref),
        'Like count does not reconcile to the captured media evidence');
      assert(sameMetric(record.metrics?.comments_count, evidence.counters.comments_count, evidence.source_ref),
        'Comment count does not reconcile to the captured media evidence');
      return record;
    }).sort((a, b) => b.captured_at.localeCompare(a.captured_at));
    return {
      content_id: contentId, published_at: latestCandidate.published_at, platform: latestCandidate.platform,
      permalink: latestCandidate.permalink, media_type: latestCandidate.media_type,
      candidate_id: latestCandidate.candidate_id, captured_at: latestCandidate.captured_at,
      counters: latestCandidate.counters,
      provenance: provenance ? {
        content_type: provenance.content_type, rights_status: provenance.rights_status,
        commercial_relationship: provenance.commercial_relationship, status: provenance.status,
        source_ref: provenance.source_ref,
      } : null,
      latest_observation: validObservations[0] ? {
        observation_id: validObservations[0].observation_id, captured_at: validObservations[0].captured_at,
        measurement_window: validObservations[0].measurement_window, metrics: validObservations[0].metrics,
        source_ref: validObservations[0].source_ref,
      } : null,
      observation_count: validObservations.length,
    };
  }).sort((a, b) => b.published_at.localeCompare(a.published_at));
}
