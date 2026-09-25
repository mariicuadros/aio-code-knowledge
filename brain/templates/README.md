# AIO CODE Brain v1 — record templates

Use one file per record or one row per content item in a compatible table. Keep raw observations separate from analysis. Replace example placeholders; use `unknown`, `not_collected`, or `not_applicable` where appropriate. Never invent evidence or rights.

## 1. Content Provenance Graph

```yaml
record_type: content_provenance
content_id: "AIO-VOID-MC-[master]-[platform]-[YYYYMMDD]-V##"
entity_ids: ["MC-001", "VOID-001"]
parent_content_id: null
master_asset_id: "[stable master asset ID]"
platform_derivative_ids: []
content_type: "CANON | TRIAL | LIFE | EDIT | SPEC"
hook: "[opening hook]"
objective: "[intended viewer action or understanding]"
language: "es"
platform: "[platform]"
created_at: "[ISO-8601]"
first_seen_at: "[ISO-8601]"
published_at: null
intervention_id: "[INT-...]"
changeset_id: "[CHG-...]"
fingerprint:
  algorithm: "sha256"
  value: "[hash or not_collected]"
source_evidence_refs: []
rights_record_id: "[RIGHTS-...]"
status: "draft | approved | published | withdrawn"
owner: "MC-001"
```

## 2. Semantic/Search Map

```yaml
record_type: semantic_search
map_id: "[SEM-...]"
entity_id: "[canonical entity ID]"
audience_question: "[exact question]"
language: "es"
canonical_concept: "[short concept]"
answer_first_definition: "[concise supported answer]"
aliases: []
disambiguation_terms: []
methodology_refs: ["AIO-001"]
evidence_refs: []
claim_ids: []
status: "draft | reviewed | approved"
reviewed_by: "[person or role]"
reviewed_at: "[ISO-8601]"
```

## 3. Performance Ledger

```yaml
record_type: performance_observation
observation_id: "[PERF-...]"
content_id: "[Content ID]"
platform: "[platform]"
measurement_window:
  start: "[ISO-8601]"
  end: "[ISO-8601]"
captured_at: "[ISO-8601]"
capture_source: "[native analytics / exported report / manual capture]"
metrics:
  impressions: null
  reach: null
  views: null
  watch_time_seconds: null
  completion_rate: null
  likes: null
  comments: null
  shares: null
  saves: null
  clicks: null
notes: "[context; mark unavailable metrics]"
```

## 4. Content Genome

```yaml
record_type: content_genome
genome_id: "[GENOME-...]"
content_id: "[Content ID]"
format: "[e.g., vertical video]"
hook_type: "[question / reveal / conflict / other]"
narrative_beats: []
visual_elements: []
audio_elements: []
call_to_action: "[CTA or not_applicable]"
intended_audience: "[audience]"
language: "es"
source_of_description: "creator annotation"
```

## 5. Commerce, Music, and Brand

```yaml
record_type: commerce_music_brand
commerce_record_id: "[COM-...]"
content_id: "[Content ID]"
status: "ORGANIC | GIFT | PAID | AFF | OWN"
brand_or_partner: "not_applicable"
campaign_or_brief_ref: "not_applicable"
deliverable: "not_applicable"
disclosure_required: "unknown"
disclosure_text_or_location: "not_applicable"
approval_state: "not_applicable"
usage:
  term: "unknown"
  territory: "unknown"
  channels: []
  paid_amplification: "unknown"
music:
  track_or_asset: "not_applicable"
  version: "not_applicable"
  rights_holder_or_source: "unknown"
  license_evidence_ref: "unknown"
  territory: "unknown"
  term: "unknown"
  platform_restrictions: []
  commercial_use: "unknown"
paidready_checklist_state: "not_assessed"
```

## 6. Rights and Disclosure

```yaml
record_type: rights_disclosure
rights_record_id: "[RIGHTS-...]"
content_id: "[Content ID]"
asset_components:
  image_likeness: "unknown"
  voice: "unknown"
  music: "unknown"
  footage: "unknown"
  third_party_marks: "unknown"
permissions:
  evidence_refs: []
  scope: "unknown"
  duration: "unknown"
  territory: "unknown"
  channels: []
  editing_allowed: "unknown"
  paid_use_allowed: "unknown"
  revocation_or_contact: "unknown"
ai_generation_or_alteration: "unknown"
disclosure:
  required: "unknown"
  basis: "unknown"
  text_or_location: "not_applicable"
review_status: "not_reviewed"
reviewed_by: "not_applicable"
reviewed_at: "not_applicable"
```

## 7. Case Record

```yaml
record_type: case
case_id: "[CASE-...]"
case_name: "[short name]"
entity_ids: []
research_question: "[question]"
scope: "[included platforms, content, and time window]"
intervention_ids: []
changeset_ids: []
baseline_refs: []
observation_refs: []
methods_and_conditions: "[protocol and relevant settings]"
findings: []
limitations: []
claims_supported: []
claims_not_supported: []
status: "planned | active | analyzed | closed"
owner: "MC-001"
updated_at: "[ISO-8601]"
```

## Readiness rule

`BRANDREADY` and `PAIDREADY` are internal checklist outcomes, not guarantees. Do not assign either while material rights, approvals, or disclosure fields remain `unknown`. Keep each platform's performance metrics separate.
