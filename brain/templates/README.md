# AIO CODE Brain v1 — record templates

Use one file per record or one row per content item in a compatible table. Keep raw observations separate from analysis. Replace example placeholders; use `unknown`, `not_collected`, or `not_applicable` where appropriate. Never invent evidence, permissions or rights.

## 1. Content Provenance Graph

```yaml
record_type: content_provenance
content_id: "AIO-VOID-MC-[master]-[platform]-[YYYYMMDD]-V##"
entity_ids: ["MC-001", "VOID-001"]
parent_content_id: null
master_asset_id: "[stable master asset ID]"
platform_derivative_ids: []
content_type: "CANON | TRAILER | LIFE | CUT | EDITORIAL | STORY | DOC | SHORT | TRIAL | SPEC"
subject: "MARIA | MARII | NUX | TWINS | FRANK | AGGIN | ALIENS | ENSEMBLE"
lens: "REAL | VOID | HYBRID"
narrative_function: "SEED | TEASE | BRIDGE | EXPAND | REVEAL | CALLBACK | PAYOFF | STANDALONE"
hook: "[opening hook]"
objective: "DISCOVERY | SEARCH | RETENTION | LORE | MUSIC | BRAND | CONVERSION | OTHER"
language: "es"
platform: "[TT | IG | FB | PT | YT | BI | OTHER]"
created_at: "[ISO-8601]"
first_seen_at: "[ISO-8601 or not_collected]"
published_at: null
intervention_id: "[INT-...]"
changeset_id: "[CHG-...]"
fingerprint:
  algorithm: "sha256"
  value: "[hash or not_collected]"
source_evidence_refs: []
rights_record_id: "[RIGHTS-...]"
authorship_record_id: "[AUTH-...]"
status: "draft | approved | published | withdrawn | archived"
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
measurement_label: "1h | 6h | 24h | 72h | 7d | 30d | custom"
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
  average_watch_time_seconds: null
  completion_rate: null
  retention_points: []
  likes: null
  comments: null
  shares: null
  saves: null
  profile_visits: null
  follows: null
  search_actions: null
  clicks: null
commercial_signals:
  brand_mentions: null
  brand_or_agency_inquiries: null
  product_questions: null
  music_or_playlist_actions: null
notes: "[context; mark unavailable metrics]"
```

## 4. Content Genome

```yaml
record_type: content_genome
genome_id: "[GENOME-...]"
content_id: "[Content ID]"
content_type: "[controlled content type]"
subject: "[controlled narrative subject]"
lens: "REAL | VOID | HYBRID"
narrative_function: "[controlled narrative function]"
format: "[vertical / horizontal / hybrid / carousel / still / other]"
hook_type: "[confession / gossip / contradiction / question / mystery / reveal / aspirational / absurd / other]"
open_question: "[unresolved audience question or not_applicable]"
theme: "[identity / power / desire / loss / faith / transformation / ambition / love / fear / betrayal / self / other]"
emotion: "[dominant emotion]"
narrative_beats: []
visual_elements: []
audio_elements: []
pause_type: "NONE | REACTION | TENSION | REVEAL | INTIMACY | UNCERTAINTY"
loop_design: "true | false | not_applicable"
call_to_action: "[CTA or not_applicable]"
search_intent: "[query/theme or not_applicable]"
brand_verticals: []
intended_audience: "[audience]"
language: "es"
source_of_description: "creator annotation"
```

## 5. Commerce, Music, and Brand

```yaml
record_type: commerce_music_brand
commerce_record_id: "[COM-...]"
content_id: "[Content ID]"
status: "NONE | ORGANIC | SPEC | GIFT | PAID | AFF | OWN"
brand_or_partner: "not_applicable"
brand_vertical: "not_applicable"
brand_presence:
  relation: "NONE | ORGANIC | SPEC | GIFT | PAID | AFF | OWN"
  placement: "BACKGROUND | PROP | WARDROBE | DIALOGUE | HERO | OTHER | not_applicable"
  prominence: "LOW | MEDIUM | HIGH | not_applicable"
  authorization: "unknown | not_required | verified | not_verified"
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
  relation: "TREND | CATALOG | OWNTRACK | PLAYLIST | OTHER | not_applicable"
  version: "not_applicable"
  rights_holder_or_source: "unknown"
  license_evidence_ref: "unknown"
  territory: "unknown"
  term: "unknown"
  platform_restrictions: []
  commercial_use: "unknown"
commercial_readiness: "ORGANIC_ONLY | BRANDREADY | PAIDREADY | REVIEW | RESTRICTED"
```

## 6. Rights, Disclosure and Human Authorship

```yaml
record_type: rights_disclosure_authorship
rights_record_id: "[RIGHTS-...]"
authorship_record_id: "[AUTH-...]"
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
ai_generation_or_alteration:
  used: "unknown"
  tools: []
  components: []
  disclosure_required: "unknown"
human_authorship:
  concept: "unknown"
  writing: "unknown"
  performance: "unknown"
  direction: "unknown"
  selection_arrangement: "unknown"
  editing_compositing: "unknown"
  music_creation_or_selection: "unknown"
  final_creative_decisions: "unknown"
  evidence_refs: []
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

## Decision state

After sufficient observation, a content record may receive one of these operational decisions:

`SCALE`, `ITERATE`, `REPACKAGE`, `RETEST`, `ARCHIVE`.

The decision must reference recorded observations. It must not be treated as proof of causation.

## Readiness rule

`BRANDREADY` and `PAIDREADY` are internal checklist outcomes, not guarantees. Do not assign either while material rights, approvals, disclosure requirements or commercial-use permissions remain `unknown`. Keep each platform's performance metrics separate.
