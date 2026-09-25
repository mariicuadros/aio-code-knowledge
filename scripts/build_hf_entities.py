"""Build stable JSONL entity rows from the canonical graph and passports."""
import argparse
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def definition(text):
    lines = text.splitlines()
    starts = [i for i, line in enumerate(lines) if line.strip() in ("## Definition", "## Entity Definition")]
    if not starts:
        raise ValueError("Passport has no definition section")
    start = starts[0] + 1
    end = next((i for i in range(start, len(lines)) if lines[i].startswith("#")), len(lines))
    value = " ".join(line.strip() for line in lines[start:end] if line.strip() and not line.startswith(chr(96) * 3))
    value = re.sub(r"[*]", "", value).replace(chr(96), "")
    return re.sub(r"\s+", " ", value).strip()


def build_rows():
    graph = json.loads((ROOT / "entity-graph.json").read_text(encoding="utf-8"))
    edges = [e for e in graph["edges"] if e["status"] == "active"]
    rows = []
    commit = os.getenv("GITHUB_SHA", "not-published")
    for node in graph["nodes"]:
        passport = node["passport"]
        text = (ROOT / passport).read_text(encoding="utf-8")
        rels = [
            f'{e["from"]} — {e["relationship"]} → {e["to"]}'
            for e in edges if node["entity_id"] in (e["from"], e["to"])
        ]
        rows.append({
            "entity_id": node["entity_id"],
            "canonical_name": node["canonical_name"],
            "entity_type": node["entity_type"],
            "description": definition(text),
            "relationships": " | ".join(rels),
            "passport_path": passport,
            "source_commit": commit,
            "source_url": f'https://github.com/mariicuadros/aio-code-knowledge/blob/{commit}/{passport}',
            "evidence_boundary": "First-party project record; not independent evidence of legal status, external indexing, AI recognition, citation, recommendation or effectiveness."
        })
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    rows = build_rows()
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")
    print(f"Wrote {len(rows)} canonical entity records to {out}")


if __name__ == "__main__":
    main()

