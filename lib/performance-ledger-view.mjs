function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function samePlatform(a, b) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
}

function observedMetric(metric, candidateMetric, sourceRef) {
  return metric && candidateMetric &&
    metric.state === 'observed' && candidateMetric.state === 'observed' &&
    metric.value === candidateMetric.value &&
    metric.source_ref === sourceRef &&
    candidateMetric.source_ref === sourceRef;
}

export function linkPerformanceLedger(candidates, records) {
  const candidateIds = new Set(candidates.map(row => row.proposed_content_id));
  const provenanceById = new Map();
  const observationsById = new Map();
  for (const record of records) {
    if (!candidateIds.has(record.content_id)) continue;
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
  return candidates.map(candidate => {
    const provenance = provenanceById.get(candidate.proposed_content_id) || null;
    const observations = observationsById.get(candidate.proposed_content_id) || [];
    if (provenance) {
      assert(provenance.status === 'published', 'Provenance is not marked published');
      assert(provenance.content_id === candidate.proposed_content_id, 'Provenance content ID mismatch');
      assert(provenance.source_evidence_refs?.includes(candidate.source_ref), 'Provenance does not cite the media snapshot');
      assert(provenance.published_at === candidate.published_at, 'Publication timestamp mismatch');
      assert(samePlatform(provenance.platform, candidate.platform), 'Publication platform mismatch');
      assert(provenance.publication_ref === candidate.permalink, 'Publication URL mismatch');
    }
    const validObservations = observations.filter(record => {
      assert(provenance, 'Performance observation has no linked publication provenance');
      assert(record.content_id === provenance.content_id, 'Observation content ID mismatch');
      assert(samePlatform(record.platform, candidate.platform), 'Observation platform mismatch');
      assert(record.captured_at === candidate.captured_at, 'Observation capture mismatch');
      assert(record.measurement_window?.start === candidate.published_at, 'Observation start does not match publication');
      assert(record.measurement_window?.end === candidate.captured_at, 'Observation end does not match capture');
      assert(record.metrics?.like_count && record.metrics?.comments_count, 'Expected media counters are missing');
      assert(observedMetric(record.metrics.like_count, candidate.counters.like_count, candidate.source_ref),
        'Like count does not reconcile to the captured media evidence');
      assert(observedMetric(record.metrics.comments_count, candidate.counters.comments_count, candidate.source_ref),
        'Comment count does not reconcile to the captured media evidence');
      return true;
    }).sort((a, b) => b.captured_at.localeCompare(a.captured_at));
    return {
      content_id: candidate.proposed_content_id,
      published_at: candidate.published_at,
      platform: candidate.platform,
      permalink: candidate.permalink,
      media_type: candidate.media_type,
      candidate_id: candidate.candidate_id,
      captured_at: candidate.captured_at,
      counters: candidate.counters,
      provenance: provenance ? {
        content_type: provenance.content_type,
        rights_status: provenance.rights_status,
        commercial_relationship: provenance.commercial_relationship,
        status: provenance.status,
        source_ref: provenance.source_ref,
      } : null,
      latest_observation: validObservations[0] ? {
        observation_id: validObservations[0].observation_id,
        captured_at: validObservations[0].captured_at,
        measurement_window: validObservations[0].measurement_window,
        metrics: validObservations[0].metrics,
        source_ref: validObservations[0].source_ref,
      } : null,
      observation_count: validObservations.length,
    };
  }).sort((a, b) => b.published_at.localeCompare(a.published_at));
}
