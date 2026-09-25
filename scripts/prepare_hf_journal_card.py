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
    metadata["pretty_name"] = "AIO CODE Knowledge Journal — OZCU"
    metadata["configs"] = [{
        "config_name": "default",
        "data_files": [{
            "split": "train",
            "path": ["data/research-journal.jsonl", "data/research-journal-addendum.jsonl"],
        }],
    }]
    section = """## Project structure and dated updates — 2026-09-25

OZCU is the company/venture brand. Marii Cuadros is its CEO. AIO CODE is the methodology developed by Marii and applied by OZCU. VOID MODE is the creative system for artists developed by Marii and applied by OZCU. These are distinct entities.

The MC-001 Observatory snapshot frozen on 2026-09-25 is partial: 14 observed pairs out of 49 planned, with 35 documented missing because of sign-in or verification gates. It does not support a seven-system recognition rate, stability claim or causal conclusion.

Historical journal rows are retained in data/research-journal.jsonl. New dated entries are appended in data/research-journal-addendum.jsonl. First-party project definitions are not independent verification of legal registration or third-party AI recognition.
"""
    if "## Project structure and dated updates — 2026-09-25" not in body:
        body = body.rstrip() + "\n\n" + section
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("---\n" + yaml.safe_dump(metadata, sort_keys=False, allow_unicode=True).rstrip() + "\n---\n\n" + body, encoding="utf-8")


if __name__ == "__main__":
    main()
