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
```

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
