# Content ID protocol — Instagram Phase 2

AIO CODE separates **platform identity** from **canonical content provenance**.

## Candidate ID

Every observed Instagram media object receives:

`candidate_id = IGMEDIA-<media_id>-<snapshot_hash_prefix>`

It identifies one immutable capture of one platform media object.

## Proposed Content ID

Every media object also receives a stable proposed ID:

`MC-001-IG-<media_id>`

Repeated captures of the same Instagram media retain the same proposed Content ID.

## Promotion to canonical content

A proposed Content ID becomes a Brain `content_provenance` record only after a human provides or confirms the required publication metadata, including creative classification, master asset reference, intervention reference, commercial relationship and rights state.

The API must not infer missing rights, authorship, master assets, creative lens, narrative function or commercial status from Instagram fields.

## Performance gate

Platform counters may be preserved in the candidate record immediately. They are admitted as a formal `performance_observation` only when the referenced canonical `content_provenance` record exists and the Brain chronology checks pass.

This prevents a platform post ID from silently becoming an ownership, rights or causal claim.
