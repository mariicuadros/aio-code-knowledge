# AIO CODE — first measured Observatory window

`baseline-plan-v1.json` defines **49 system × prompt pairs** for MC-001. This
is the first measured snapshot once collected; earlier content and changes
already happened, so it cannot be described as a pristine pre-launch state.

For each pair, open a fresh conversation in the named system. Copy the exact
text for its prompt ID from `prompt-registry-v1.json`. Save the unedited full
answer in a local UTF-8 text file. Record the visible model/interface, environment (for example web desktop browser
or mobile app), whether the account was logged in, search mode, citations, location
if relevant, and time. Use the same conditions for comparable later runs.

From the repository root, capture a result with:

```bash
python -m observatory.capture --system chatgpt-web --entity-id MC-001 \
  --prompt-id ENT-01 --window MC-001-BASELINE-v1 \
  --login-state logged_out --context fresh_context --search-state unknown \
  --response-file /path/to/raw-answer.txt
```

The tool writes `observatory/runs/OBS-*.json`. Inspect the output before
publication; do not record client data, private chats, or contact details.
Evaluate each observation manually with `RECOGNITION-RUBRIC-v1.md` and add
the coded dimensions to its `evaluation` object without changing the raw
answer. Validate with `python scripts/validate_core.py`. Run
`python -m observatory.report` for a descriptive profile.

Unrun pairs remain **missing**, never false or zero. If a system is inaccessible,
add its system/prompt pair and reason to `missing_runs` in the plan. Freeze
`ai-social-baseline.json` only after all recorded observations validate and
coverage and omissions are declared. The `REC-01` prompt tests recommendation
and must not be treated as direct recognition. No single pass establishes
repeatability or drift.

After recording, fill `entity_resolution` and `citation_quality` in every
run's `evaluation` with a 0–2 grade from the rubric; add other applicable
dimensions separately. Run `python -m observatory.freeze` to inspect the
coverage gate and `python -m observatory.freeze --write` only after it passes.
The command refuses an empty baseline, duplicate or altered prompts, and
missing pairs without a documented reason. The frozen file includes explicit
coverage; a partial window cannot be described as all systems measured.
