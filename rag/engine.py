"""Small, auditable public-corpus retriever for AIO CODE.

The index is built from an exact allowlist on every invocation. There is no
network access, private-client corpus, vector service, or model dependency.
"""

from __future__ import annotations

import json
import math
import re
import subprocess
import unicodedata
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "rag/corpus-manifest-v0.json"
STOP = set("a al and are as con de del el en es for from how is la las los of or para que the to un una what who y cual cual es does do no por se su sus their was when with it this its an be can did ya".split())
ES_EN = {
    "copias": ("copies", "copy"), "misma": ("same",), "biografia": ("bio", "biography"),
    "demuestran": ("prove",), "corroboracion": ("corroboration",),
    "independiente": ("independent",), "publicar": ("publishing", "public"),
    "garantiza": ("guarantee", "control"), "encuentre": ("retrieval", "find"),
    "chatgpt": ("third", "party", "systems"), "fuentes": ("sources",),
    "reconocimiento": ("recognition",), "relacion": ("relationship",),
}
WORDS = re.compile(r"[a-z0-9]+", re.I)
CLAIMS = re.compile(r"CLAIM-\d+")
ENTITIES = re.compile(r"\b(?:MC-001|AIO-001|NUX-001|OZCU-001|VOID-001)\b")


def tokens(value: str) -> list[str]:
    folded = unicodedata.normalize("NFKD", value.lower())
    ascii_text = "".join(c for c in folded if not unicodedata.combining(c))
    return [w for w in WORDS.findall(ascii_text) if len(w) > 1 and w not in STOP]


def _git(*args: str) -> str | None:
    try:
        return subprocess.check_output(["git", "-C", str(ROOT), *args], text=True, stderr=subprocess.DEVNULL).strip()
    except (OSError, subprocess.CalledProcessError):
        return None


@dataclass(frozen=True)
class Passage:
    text: str
    source_path: str
    section_or_record_locator: str
    source_url: str
    commit_sha: str
    document_version_or_unknown: str
    entity_id_or_null: str | None
    claim_ids_or_empty: list[str]
    published_at_or_unknown: str
    visibility: str
    evidence_state_or_not_applicable: str
    canonical_or_historical: str

    @property
    def citation(self) -> str:
        return f"{self.source_path}::{self.section_or_record_locator}@{self.commit_sha[:12]}"


def _markdown_sections(text: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    name, lines = "preamble", []
    for line in text.splitlines():
        if line.startswith("#") and re.match(r"^#{1,6} ", line):
            if "\n".join(lines).strip():
                sections.append((name, "\n".join(lines).strip()))
            name, lines = line.lstrip("# ").strip(), [line]
        else:
            lines.append(line)
    if "\n".join(lines).strip():
        sections.append((name, "\n".join(lines).strip()))
    return sections


def _json_records(path: str, raw: str) -> list[tuple[str, str]]:
    doc = json.loads(raw)
    if path == "ai-social-baseline.json":
        limited = {key: doc.get(key) for key in ("baseline_target", "important_note", "freeze")}
        limited["record_count"] = len(doc.get("records", []))
        return [("freeze.status", json.dumps(limited, ensure_ascii=False))]
    if path == "claim-ledger.json":
        return [(claim["claim_id"], json.dumps(claim, ensure_ascii=False)) for claim in doc["claims"] if claim["claim_status"] == "active"]
    if path == "entity-graph.json":
        return ([("node:" + n["entity_id"], json.dumps(n, ensure_ascii=False)) for n in doc["nodes"]]
                + [("edge:" + e["relationship_id"], json.dumps(e, ensure_ascii=False)) for e in doc["edges"] if e["status"] == "active"])
    return [("root", json.dumps(doc, ensure_ascii=False))]


def build_index(root: Path = ROOT) -> tuple[str, list[Passage]]:
    manifest = json.loads((root / "rag/corpus-manifest-v0.json").read_text(encoding="utf-8"))
    commit = _git("rev-parse", "HEAD") or "local-uncommitted"
    passages: list[Passage] = []
    seen: set[str] = set()
    for item in manifest["allowlist"]:
        path = item["path"]
        if path in seen or Path(path).is_absolute() or ".." in Path(path).parts:
            raise ValueError(f"Invalid or duplicate allowlist path: {path}")
        seen.add(path)
        file = root / path
        if not file.is_file() or file.is_symlink():
            raise ValueError(f"Missing or unsafe approved source: {path}")
        raw = file.read_text(encoding="utf-8")
        blob = _git("rev-parse", f"HEAD:{path}") if commit != "local-uncommitted" else None
        if blob and _git("hash-object", str(file)) != blob:
            raise ValueError(f"Approved source changed without commit: {path}")
        if path.endswith(".json"):
            doc = json.loads(raw)
            sections = _json_records(path, raw)
            version = str(doc.get("version", "unknown"))
            date = str(doc.get("updated", doc.get("created", "unknown")))
        else:
            sections = _markdown_sections(raw)
            version_match = re.search(r"\*\*(?:Passport )?Version:\*\*\s*([^\s]+)", raw[:1200], re.I)
            date_match = re.search(r"\*\*(?:Date|Updated|Created|Last Updated):\*\*\s*(\d{4}-\d{2}-\d{2})", raw[:1200], re.I)
            version = version_match.group(1) if version_match else "unknown"
            date = date_match.group(1) if date_match else "unknown"
        for locator, text in sections:
            if path.endswith(".md") and len(tokens(text)) < 12:
                continue
            ids = sorted(set(ENTITIES.findall(text)))
            claim_ids = sorted(set(CLAIMS.findall(text)))
            state = "not_applicable"
            if path == "claim-ledger.json":
                record = json.loads(text)
                state = record["evidence_state"]
                ids = [record["entity_id"]]
                claim_ids = [record["claim_id"]]
            passages.append(Passage(
                text=text, source_path=path, section_or_record_locator=locator,
                source_url=f"https://github.com/{manifest['source_repository']}/blob/{commit}/{path}",
                commit_sha=commit, document_version_or_unknown=version,
                entity_id_or_null=ids[0] if len(ids) == 1 else None,
                claim_ids_or_empty=claim_ids, published_at_or_unknown=date,
                visibility=item["visibility"], evidence_state_or_not_applicable=state,
                canonical_or_historical=item["canonical_or_historical"],
            ))
    return commit, passages


def search(query: str, passages: list[Passage], limit: int = 5) -> list[dict[str, Any]]:
    if not query.strip() or not 1 <= limit <= 20:
        raise ValueError("Nonempty query and limit 1..20 required")
    terms = tokens(query)
    qt = Counter(terms + [synonym for term in terms for synonym in ES_EN.get(term, ())])
    if not qt:
        return []
    doc_tokens = [Counter(tokens(p.text + " " + p.section_or_record_locator)) for p in passages]
    df = Counter(term for dt in doc_tokens for term in dt)
    average = sum(sum(dt.values()) for dt in doc_tokens) / max(1, len(doc_tokens))
    scores: list[tuple[float, Passage]] = []
    for p, dt in zip(passages, doc_tokens):
        length = sum(dt.values())
        score = sum((math.log(1 + (len(passages) - df[t] + .5) / (df[t] + .5))
                     * dt[t] * 2.2 / (dt[t] + 1.2 * (.25 + .75 * length / max(1, average))))
                    for t in qt if dt[t])
        # Exact registered entity identifiers outweigh broad narrative mentions.
        exact_ids = set(ENTITIES.findall(query))
        if exact_ids and (exact_ids & set(ENTITIES.findall(p.text))):
            score += 1.5
        if score > 0:
            scores.append((score, p))
    scores.sort(key=lambda row: (-row[0], row[1].source_path, row[1].section_or_record_locator))
    return [{"score": round(score, 5), **asdict(p), "citation": p.citation} for score, p in scores[:limit]]


def ask(query: str, passages: list[Passage], limit: int = 5) -> dict[str, Any]:
    """Return evidence, not an invented narrative; a generator can use this contract."""
    hits = search(query, passages, limit)
    return {"query": query, "status": "evidence_found" if hits else "no_evidence",
            "message": "Pasajes candidatos; comprueba que respondan a la pregunta." if hits else "No hay evidencia suficiente",
            "retrieved_at": datetime.now(timezone.utc).isoformat(), "sources": hits}
