"""Check cross-page entity IDs and locally published canonical routes."""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aio-code.vercel.app/"


def ldjson(path):
    html = (ROOT / path).read_text(encoding="utf-8")
    scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if len(scripts) != 1:
        raise ValueError(f"Expected one JSON-LD block in {path}")
    return json.loads(scripts[0]), html


aio, homepage = ldjson("index.html")
marii, profile = ldjson("entities/marii-cuadros/index.html")
nux_page = (ROOT / "entities/nux/index.html").read_text(encoding="utf-8")
checker_page = (ROOT / "checker/index.html").read_text(encoding="utf-8")
person = json.loads((ROOT / "schemas/person-schema.json").read_text(encoding="utf-8"))["@graph"][0]
marii_json = json.loads((ROOT / "entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld").read_text(encoding="utf-8"))
MC = BASE + "entities/marii-cuadros/#MC-001"
AIO = BASE + "#AIO-001"
assert person["@id"] == marii_json["@id"] == marii["mainEntity"]["@id"] == aio["creator"]["@id"] == MC
assert aio["@id"] == AIO
assert f'id="AIO-001"' in homepage
assert 'href="/entities/marii-cuadros/"' in homepage
assert 'href="/entities/nux/"' in homepage
assert 'href="/checker/"' in homepage
assert '<link rel="canonical" href="https://aio-code.vercel.app/checker/">' in checker_page
assert "does not query" in checker_page.lower()
assert "No external AI/search systems were queried" in checker_page
assert 'fetch(' not in checker_page and 'XMLHttpRequest' not in checker_page
assert 'href="/entities/marii-cuadros/"' in nux_page
assert marii["mainEntity"]["url"] == BASE + "entities/marii-cuadros/"
print("Static pages, checker limits, privacy behavior, and published @id references are locally consistent.")
