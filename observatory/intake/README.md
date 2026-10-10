# Observatory Intake

Preliminary, unreplicated summaries belong here. They are not controlled Runs,
baseline measurements, evidence of indexing, or proof of account ownership.
The original `baseline_role` field is retained for provenance, not eligibility.
The three initial records were moved byte-for-byte from `observatory/runs/`;
no timestamp, screenshot, session, prompt registration or evaluation was added.
Their referenced screenshots remain unavailable in the repository.

`observatory/intake-schema.json` validates the limited information actually
supplied. `python scripts/validate_intake.py` runs independently in CI. A record
cannot become replicated within this contract. Promotion requires a new complete
Runs record, authenticated context/evidence, and a reference back to the intake;
the intake itself remains preserved. Do not relax `observation-schema.json`.

Intake files are excluded from the RAG allowlist and Hugging Face export manifest.
