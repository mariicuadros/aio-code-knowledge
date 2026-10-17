"""Read-only comparison of approved local DEOS sources with public Hugging Face datasets.

No Hugging Face write access, no token, no automated publishing, no private files.
A pending manual release is a *drift finding*, not evidence of damage or AI visibility.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
HF_API = "https://huggingface.co/api/datasets/"
ENTITIES_ID = "mariicuadros/aio-code-entities"
JOURNAL_ID = "mariicuadros/aio-code-journal"
ENTITY_DATA = "https://huggingface.co/datasets/mariicuadros/aio-code-entities/resolve/main/data/entities.jsonl"
FIELD_NAMES = ("canonical_name", "entity_type", "description", "relationships", "passport_path", "evidence_boundary")


def get_bytes(url: str, limit: int = 8_000_000) -> bytes:
    if not url.startswith((HF_API, ENTITY_DATA)):
        raise ValueError("Only the approved Hugging Face public URLs are allowed")
    req = Request(url, headers={"User-Agent": "AIO-CODE-ReadOnlyAudit/1.0", "Accept": "application/json,text/plain"})
    with urlopen(req, timeout=20) as resp:
        data = resp.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Remote data exceeds read-only size limit")
    return data


def parse_jsonl(raw: bytes) -> list[dict]:
    rows = []
    for n, line in enumerate(raw.decode("utf-8-sig").splitlines(), 1):
        if not line.strip():
            continue
        obj = json.loads(line)
        if not isinstance(obj, dict) or not isinstance(obj.get("entity_id"), str):
            raise ValueError(f"Invalid entity row at line {n}")
        rows.append(obj)
    return rows


def compare_entities(local: list[dict], remote: list[dict], current_sha: str | None = None) -> dict:
    local_ids = [r["entity_id"] for r in local]
    remote_ids = [r["entity_id"] for r in remote]
    problems = []
    if len(local_ids) != len(set(local_ids)):
        problems.append("duplicate_local_ids")
    if len(remote_ids) != len(set(remote_ids)):
        problems.append("duplicate_remote_ids")
    l = {r["entity_id"]: r for r in local}
    h = {r["entity_id"]: r for r in remote}
    missing = sorted(set(l) - set(h))
    extra = sorted(set(h) - set(l))
    mismatches = {}
    for entity_id in sorted(set(l) & set(h)):
        fields = [f for f in FIELD_NAMES if l[entity_id].get(f) != h[entity_id].get(f)]
        if fields:
            mismatches[entity_id] = fields
    source_commits = sorted({r.get("source_commit", "") for r in remote})
    if len(source_commits) != 1 or not source_commits[0]:
        problems.append("remote_commit_missing_or_inconsistent")
    if missing:
        problems.append("remote_missing_entity")
    if extra:
        problems.append("remote_extra_entity")
    if mismatches:
        problems.append("remote_field_drift")
    return {
        "local_count": len(local),
        "remote_count": len(remote),
        "local_ids": sorted(l),
        "remote_ids": sorted(h),
        "missing_remote": missing,
        "extra_remote": extra,
        "field_mismatch": mismatches,
        "remote_source_commits": source_commits,
        "github_review_sha": current_sha,
        "source_commit_differs": bool(current_sha and source_commits != [current_sha]),
        "findings": problems,
        "parity": not problems,
    }


def inspect_metadata(metadata: dict, expected_file: str | None = None) -> dict:
    paths = sorted({s.get("rfilename", "") for s in metadata.get("siblings", []) if isinstance(s, dict)})
    return {
        "id": metadata.get("id"),
        "revision_sha": metadata.get("sha"),
        "updated_at": metadata.get("lastModified"),
        "files": paths,
        "expected_file": expected_file,
        "expected_file_present": expected_file in paths if expected_file else None,
        "file_listing_complete": "siblings" in metadata,
    }


def build_report(fetch=get_bytes, local_rows=None, github_sha=None):
    # Import only repository-local, read-only build logic.
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    from scripts.build_hf_entities import build_rows
    expected = local_rows if local_rows is not None else build_rows()
    report = {
        "report_version": "1.0",
        "audit_mode": "public_read_only_no_HF_TOKEN",
        "github_source_repository": "mariicuadros/aio-code-knowledge",
        "release_allowed": False,
        "external_ai_visibility_verified": False,
        "datasets": {},
    }
    errors = []
    try:
        meta = json.loads(fetch(HF_API + ENTITIES_ID))
        report["datasets"]["entities"] = inspect_metadata(meta, "data/entities.jsonl")
        report["datasets"]["entities"]["comparison"] = compare_entities(expected, parse_jsonl(fetch(ENTITY_DATA)), github_sha)
    except (HTTPError, URLError, TimeoutError, ValueError, UnicodeError, json.JSONDecodeError, OSError) as exc:
        errors.append(f"entities_remote_unavailable_or_invalid: {type(exc).__name__}")
    try:
        meta = json.loads(fetch(HF_API + JOURNAL_ID))
        report["datasets"]["journal"] = inspect_metadata(meta, "data/research-journal-addendum.jsonl")
        if report["datasets"]["journal"]["file_listing_complete"] and not report["datasets"]["journal"]["expected_file_present"]:
            report["datasets"]["journal"]["note"] = "Export addendum not present at expected path; may be awaiting next authorized publication. Historical journal remains separate."
    except (HTTPError, URLError, TimeoutError, ValueError, UnicodeError, json.JSONDecodeError, OSError) as exc:
        errors.append(f"journal_remote_unavailable_or_invalid: {type(exc).__name__}")
    report["errors"] = errors
    report["status"] = ("unverifiable" if errors else
                        "drift_detected" if not report["datasets"]["entities"]["comparison"]["parity"] else "entity_parity_confirmed")
    report["note"] = "Only current Hugging Face public entity table and dataset metadata are compared. This does not verify all journal rows, source-artifacts, copyright, or third-party AI indexing."
    return report


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--github-sha", default=None, help="Full SHA of the GitHub checkout under review")
    p.add_argument("--output", default="hf-drift-report.json")
    p.add_argument("--strict", action="store_true", help="Fail when parity is absent or remote access fails")
    args = p.parse_args()
    report = build_report(github_sha=args.github_sha)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "report_path": str(out), "errors": report["errors"], "entities": report["datasets"].get("entities", {}).get("comparison", {})}, ensure_ascii=False))
    if args.strict and report["status"] != "entity_parity_confirmed":
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
