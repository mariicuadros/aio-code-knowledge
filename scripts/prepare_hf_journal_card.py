"""Preserve and update the existing HF journal dataset card without rewriting its history."""

import argparse
import os
from pathlib import Path

import yaml
from huggingface_hub import hf_hub_download


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    token = os.environ["HF_TOKEN"]
    remote = hf_hub_download(
        repo_id="mariicuadros/aio-code-journal",
        repo_type="dataset",
        filename="README.md",
        token=token,
    )

    text = Path(remote).read_text(encoding="utf-8")

    if not text.startswith("---"):
        raise ValueError("Expected a YAML front matter block in the current journal card")

    marker = text.find("\n---", 3)
    if marker < 0:
        raise ValueError("Could not find the end of the journal card metadata")

    metadata = yaml.safe_load(text[3:marker]) or {}
    body = text[marker + 4:].lstrip("\n")

    if body.startswith("---"):
        body = body[3:].lstrip("\n")

    metadata["pretty_name"] = "AIO CODE Knowledge Journal"
    metadata["version"] = "2.1"
    metadata["last_updated"] = "2026-09-25"
    metadata["configs"] = [{
        "config_name": "default",
        "data_files": [{
            "split": "train",
            "path": [
                "data/research-journal.jsonl",
                "data/research-journal-addendum.jsonl",
            ],
        }],
    }]

    section = """## Project structure and dated updates — 2026-09-25

At this dated stage AIO CODE was described as Marii Cuadros's research and implementation methodology. VOID MODE was documented separately as Marii's creative ecosystem. OZCU was being considered as a possible venture identity; this dated journal section does not assert a registered company, CEO appointment or transfer of ownership.

The MC-001 Observatory snapshot frozen on 2026-09-25 is partial: 14 observed pairs out of 49 planned, with 35 documented missing because of sign-in or verification gates. It does not support a seven-system recognition rate, stability claim or causal conclusion.

Historical journal rows are retained in data/research-journal.jsonl. New dated entries are appended in data/research-journal-addendum.jsonl. First-party project definitions are not independent verification of legal registration or third-party AI recognition.
"""

    if "## Project structure and dated updates — 2026-09-25" not in body:
        body = body.rstrip() + "\n\n" + section

    phase_two = """## Phase 2 — current definition, 2026-09-27

AIO CODE (AIO-001) is now described as a Digital Entity Operating System, with the phase-1 research and implementation methodology retained as one internal component. This is a first-party classification change and a new public intervention, not a rewrite of the 2026-09-25 definition, a new AI baseline, proof of software completeness, or proof of external recognition. The partial 14/49 MC-001 snapshot retains its original date and conditions. See AIO-CODE-SYSTEM-SPEC-v2.md and the dated intervention record in the public repository.
"""

    if "## Phase 2 — current definition, 2026-09-27" not in body:
        body = body.rstrip() + "\n\n" + phase_two

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "---\n"
        + yaml.safe_dump(metadata, sort_keys=False, allow_unicode=True).rstrip()
        + "\n---\n\n"
        + body,
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()