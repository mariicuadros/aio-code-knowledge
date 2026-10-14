"""Prepare the current HF journal card while preserving its dated history."""
import argparse
import hashlib
import os
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]
RELEASE_DATE = "2026-10-13"
HISTORY_MARKER = "<!-- AIO-HISTORICAL-CARD-BEGIN -->"
HISTORY_END = "<!-- AIO-HISTORICAL-CARD-END -->"


def split_card(text):
    if not text.startswith("---\n"):
        raise ValueError("Expected YAML front matter")
    marker = text.find("\n---", 4)
    if marker < 0:
        raise ValueError("Unclosed journal metadata")
    metadata = yaml.safe_load(text[4:marker]) or {}
    if not isinstance(metadata, dict):
        raise ValueError("Journal metadata must be a mapping")
    return metadata, text[marker + 4:].lstrip("\n")


def prepare_card(text, source_commit):
    metadata, body = split_card(text)
    archive_name = "README-before-" + hashlib.sha256(text.encode()).hexdigest()[:16] + ".md"
    if HISTORY_MARKER in body:
        # Repeated syncs retain the same historical body rather than nesting cards.
        historical = body.split(HISTORY_MARKER, 1)[1].split(HISTORY_END, 1)[0].strip("\n")
    else:
        historical = body
        # A prior malformed card left a second metadata block in the body.
        if historical.startswith("---\n"):
            extra, historical = split_card(historical)
            metadata = {**extra, **metadata}
        elif historical.startswith("language:"):
            end = historical.find("\n---")
            if end < 0:
                raise ValueError("Unclosed legacy metadata")
            extra = yaml.safe_load(historical[:end])
            if not isinstance(extra, dict):
                raise ValueError("Invalid legacy metadata")
            metadata = {**extra, **metadata}
            historical = historical[end + 4:].lstrip("\n")
        if historical.startswith("---\n"):
            historical = historical[4:].lstrip("\n")
    metadata.update({
        "pretty_name": "AIO CODE Knowledge Journal",
        "language": ["es", "en"],
        "tags": ["digital-entities", "entity-resolution", "information-retrieval", "knowledge-graph", "ai-research", "provenance"],
        "license": metadata.get("license", "other"),
        "version": "2.2", "last_updated": RELEASE_DATE,
        "configs": [{"config_name": "default", "data_files": [{"split": "train", "path": ["data/research-journal.jsonl", "data/research-journal-addendum.jsonl"]}]}],
    })
    spec = (ROOT / "AIO-CODE-SYSTEM-SPEC-v2.md").read_text(encoding="utf-8")
    definition = spec.split("## Definition\n", 1)[1].split("\n## ", 1)[0].strip().split("\n\n", 1)[0]
    current = f"""# AIO CODE — Knowledge Journal

## Current definition / Definición vigente — {RELEASE_DATE}

**{definition}**

AIO CODE is a **Digital Entity Operating System (DEOS)** that structures and manages digital identities, relationships, content, rights, evidence and observations through verifiable records and connected infrastructure. Its research and implementation methodology is one component of the system.

Marii Cuadros (MC-001) is its creator. OZCU (OZCU-001) is the declared developer venture, with legal formalization pending. VOID MODE (VOID-001) is a distinct creative system for artists; NUX (NUX-001) is a separate creative entity.

Current canonical sources: [system specification](https://github.com/mariicuadros/aio-code-knowledge/blob/{source_commit}/AIO-CODE-SYSTEM-SPEC-v2.md), [entity graph](https://github.com/mariicuadros/aio-code-knowledge/blob/{source_commit}/entity-graph.json), and [structured entity dataset](https://huggingface.co/datasets/mariicuadros/aio-code-entities).

## Reading the journal

The dataset viewer loads the original journal and its append-only addendum. Each entry describes its dated stage: earlier classifications are historical observations, not the current definition. Original rows are preserved. First-party records do not independently establish external AI recognition, causality, legal incorporation or ownership certification.

The September 25 MC-001 baseline remains frozen at 14 observed pairs out of 49 planned, with 35 missing; this historical coverage is not a current system performance score.

## Historical card — superseded descriptions

The text below is retained for chronology. Use the current definition above for present identity questions. Previous complete cards, including their original metadata, are retained under `history/`.

<details>
<summary>Read the preserved historical descriptions and dated updates</summary>

{HISTORY_MARKER}
{historical.rstrip()}
{HISTORY_END}

</details>
"""
    card = "---\n" + yaml.safe_dump(metadata, sort_keys=False, allow_unicode=True).rstrip() + "\n---\n\n" + current
    return card, archive_name


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    from huggingface_hub import hf_hub_download
    remote = hf_hub_download(repo_id="mariicuadros/aio-code-journal", repo_type="dataset", filename="README.md", token=os.environ["HF_TOKEN"])
    text = Path(remote).read_text(encoding="utf-8")
    card, archive_name = prepare_card(text, os.environ["GITHUB_SHA"])
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    history = output.parent / "history"
    history.mkdir(exist_ok=True)
    (history / archive_name).write_text(text, encoding="utf-8")
    output.write_text(card, encoding="utf-8")


if __name__ == "__main__":
    main()
