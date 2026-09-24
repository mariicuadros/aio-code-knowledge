# AIO CODE — controlled RAG prototype

This prototype indexes the public files listed **exactly** in
`corpus-manifest-v0.json` and retrieves passages with lexical BM25. It keeps
Git source commit, path, record/section, claim IDs, and evidence status in
each citation. It never downloads arbitrary pages or loads private client
records. It does not measure third-party AI recognition.

Run from the repository root:

```bash
python -m rag.cli ask '¿Qué es AIO CODE?'
python -m rag.evaluate
python scripts/validate_core.py
python scripts/build_public_rag.py --check
```

The `/rag/` page serves `public-index-v0.json` as a read-only search of the
approved passages with links to their exact Git versions. It is a public
evidence lookup, not an LLM answer endpoint. Rebuild its index with
`python scripts/build_public_rag.py` after approved source files change and
commit both the index and its source updates. CI checks the recorded source
blobs and passage count.

The Vercel AI SDK route at `POST /api/answer` is private and disabled by
default. It reads the same committed public index, retrieves up to five
passages, and generates a draft that requires claim-by-claim review. It never
publishes a generated answer to the site or updates the Observatory. To
activate it for an owner-only trial, set the following **Production** project
environment variables in Vercel, then redeploy:

* `AIO_RAG_ENABLED=1`
* `AIO_RAG_ADMIN_TOKEN` = a unique random secret (at least 32 characters;
  never store it in Git or send it in chat)
* `AIO_RAG_MODEL` = an exact, currently available AI Gateway model ID

Vercel functions can authenticate to AI Gateway using project OIDC, without
an API key. The route only accepts a bearer token matching the admin secret,
and does not call a paid model for empty evidence, invalid requests, or while
disabled. If the project has no available AI Gateway credits or OIDC is not
enabled, model calls will fail without altering the evidence search. Do not
expose the admin secret in a public browser form. Run `npm run check:gateway`
to check source recall and access guards without making any model calls.

The `ask` command currently returns candidate evidence and its exact source
references. A source hit alone does not establish that the passage answers
the question. Unsupported questions must receive `No hay evidencia
suficiente` after answer-level verification; do not present a retrieved
passage as a final answer without that check.

The 24 questions in `evaluation-v0.json` are an internal retrieval and answer
acceptance set. They are not the frozen external Observatory Prompt Registry.
The CLI evaluation checks source recall only; the answer support and abstention
reviews remain separate human gates. Optional draft generation uses an
OpenAI-compatible API (Vercel AI Gateway by default): set `AI_GATEWAY_API_KEY`
and `AIO_RAG_MODEL`, then run `python -m rag.cli ask '¿Qué es AIO CODE?'
--generate`. Outputs are marked `draft_requires_review`; the program validates
cited source IDs but cannot prove that a source supports every assertion.
Do not publish a generated answer without checking each claim against its
passage. No model key, hosted service or model evaluation is included here.

When approved files change, re-run the evaluator using a clean Git checkout.
The index refuses modified allowlisted files to avoid silently mixing commits.
This deliberately small approach lets us detect when graph/vector retrieval
offers measurable improvement before introducing another data store.
