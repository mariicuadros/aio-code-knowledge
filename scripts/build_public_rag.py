"""Build/check the read-only browser index from approved committed sources."""

import argparse
import json
import subprocess
import sys
from dataclasses import asdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from rag.engine import ROOT, build_index


OUTPUT = ROOT / "rag/public-index-v0.json"


def source_blobs(paths):
    return {path: subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", "HEAD:" + path], text=True).strip() for path in paths}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    commit, passages = build_index()
    manifest = json.loads((ROOT / "rag/corpus-manifest-v0.json").read_text(encoding="utf-8"))
    blobs = source_blobs(item["path"] for item in manifest["allowlist"])
    if args.check:
        existing = json.loads(OUTPUT.read_text(encoding="utf-8"))
        if existing["source_blobs"] != blobs or len(existing["passages"]) != len(passages):
            raise SystemExit("Public index stale: rebuild with python scripts/build_public_rag.py")
        print(f"Public index valid: {len(passages)} passages from approved blobs")
    else:
        data = {"title": "AIO CODE public evidence search", "version": "0.1.0",
                "source_commit": commit, "source_blobs": blobs,
                "limitations": "First-party public records. Retrieved passages require answer-level review. This is not an external AI baseline.",
                "passages": [asdict(p) for p in passages]}
        OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        print(f"Built public index: {len(passages)} approved passages at {commit[:12]}")


if __name__ == "__main__":
    main()
