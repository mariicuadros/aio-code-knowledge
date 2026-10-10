# AIO CODE — AI Discovery & Retrieval Layer v1

**Phase:** 2  
**Status:** active architecture contract  
**Purpose:** model the externally observable path between publication and an AI/search answer without claiming access to private provider internals.

## Core pipeline

`entity -> canonical source -> publication -> discovery -> crawl -> index/corpus -> retrieval -> entity resolution -> attribution -> citation -> answer`

Each stage is independently observable or unknown. A later-stage success must not be back-projected as proof that every earlier stage occurred in a particular way.

## Required distinction

AIO CODE MUST keep these states separate:

- `published`: approved content is publicly reachable at its canonical URL.
- `crawlable`: access is not blocked by the site's published access policy for the tested agent.
- `crawl_observed`: a qualifying request was observed in first-party logs or equivalent evidence.
- `indexation_observed`: a provider/search surface visibly exposes the URL or source in an index/result. Do not infer private index membership.
- `retrieved`: the tested system surfaced or used the source in the observed response.
- `entity_resolved`: the system mapped the requested name/concept to the intended canonical entity.
- `attributed`: the system assigned a tested claim/relationship to the intended entity.
- `cited`: the response visibly cited or linked the qualifying source.
- `answered`: the system produced an answer; this state alone proves none of the states above.

## Evidence discipline

Every claim about a provider mechanism must carry one of:

- `provider_documented` — current first-party provider documentation supports it.
- `first_party_observed` — AIO CODE observed it directly in its own logs/session.
- `third_party_documented` — supported by a reputable external source but not provider documentation.
- `ai_reported_unverified` — an AI response asserted it; not independently verified.
- `hypothesis` — testable interpretation awaiting evidence.
- `unknown` — no adequate evidence.

AI outputs are observations, not authority. They can generate hypotheses and test cases, but MUST NOT silently become system facts.

## Test classes

### Discovery test
Fresh-context prompt without supplying a canonical URL. Measures whether the system independently finds/resolves the entity.

### Direct URL retrieval test
Provide a known public URL and test whether the system can access and correctly interpret it. This is not equivalent to discovery.

### Attribution test
Ask who created/developed/owns a defined relation and score the entity relationship separately from general recognition.

### Citation test
Record whether the response visibly cites a qualifying first-party or corroborating source.

## Provider-specific access policy

Provider crawler behavior is maintained in `phase-2/crawler-policy-v1.json`. Only provider-documented behavior may be marked `provider_documented`.

## Ledgers

- crawler requests: records conforming to `schemas/crawler-ledger.schema.json`
- AI observations: records conforming to `schemas/ai-observation-record.schema.json`

These ledgers may remain private when raw logs or responses contain sensitive data. Public summaries must preserve timestamps, evidence state and limitations.

## Boundary

This layer does not guarantee crawling, indexing, training, retrieval, ranking, recommendation or citation by any external system.
