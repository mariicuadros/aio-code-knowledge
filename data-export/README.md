# AIO CODE Data Export

## Purpose

This directory defines the controlled boundary between the GitHub **Source of Truth** and downstream structured-data mirrors such as Hugging Face.

GitHub remains the canonical repository. The export layer identifies which machine-readable artifacts may be synchronized downstream without copying the entire research/documentation repository.

## Export Principle

```text
GitHub Source of Truth
        ↓
Controlled Data Export
        ↓
Hugging Face / downstream mirrors
```

Documentation, ethics files, research narratives and internal methodology are not automatically exported merely because they exist in GitHub.

## Current Canonical Export Sources

- `entity-graph.json`
- `social-entity-map.json`
- `claim-ledger.json`
- `ai-social-baseline.json`
- `observatory/observation-schema.json`
- `observatory/ER-001.json`
- `entity-labs/experiment-schema.json`
- `entity-labs/EXP-001.json`
- `metrics/metric-schema.json`
- `entity/content/MC-001/content-registry.json`
- `entity/content/MC-001/platforms.json`
- `entity/content/MC-001/spotify-playlists.json`
- `entity/content/NUX-001/content-registry.json`
- `entity/content/NUX-001/platforms.json`
- `entity/content/AIO-001/content-registry.json`
- `entity/content/AIO-001/platforms.json`

## Important

The export list is a source manifest, not a duplicate data store. A future GitHub Action should generate or synchronize downstream artifacts from these canonical sources.

No secret, token, credential or private data belongs in this directory.
