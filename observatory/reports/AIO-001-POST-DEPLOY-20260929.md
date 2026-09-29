# AIO-001 — observations after deployment, September 29, 2026

**Window:** 11:44–11:50 America/Bogota (16:44–16:50 UTC). **Evidence:** eleven owner-supplied screenshots visually reviewed; originals remain private, with filenames and SHA-256 recorded in `AIO-001-POST-DEPLOY-20260929-evidence.json`. The capture clock is not the provider's response timestamp. The production release was `36c5fef25534b15b6315670c58649096a12ceefe`, deployment `dpl_4tjdJiahJSK4kaFhRSU7qsXrrG54`, READY at 16:31:09.883 UTC. The first capture is approximately thirteen minutes after READY; this does not measure a crawl delay.

These are actual observed outputs, retained as a separate window. They do not replace or complete MC-001's frozen 14/49 baseline. Structured snapshot records are under `observatory/snapshots/`; they reference AIO-02 but preserve the actual question rather than presenting variants as exact registry repetitions.

| Surface | Prompt and condition | Result visible in capture | Sources and time |
| --- | --- | --- | --- |
| Google Search All, AI Overview | `Que es aio code?`; guest; private-window state not visible within these cropped images | Generic meanings; this entity not identified in visible overview. Modo IA tab unselected. | Generic GitHub/linux AIO and Lenovo; 11:44 |
| ChatGPT guest, Chrome incognito | `que es aio code?` | All-In-One programming interpretation and request for where the term was seen. | No visible citations; 11:46 |
| ChatGPT same-conversation follow-up | `AIO CODE` | Requests context, a link or screenshot; no identification of this project. | No visible citations; 11:46 |
| Gemini guest, Chrome incognito | `que es aio code?`; model label `Gemini 3.5 Fl…` truncated | Asynchronous I/O and All-In-One definitions; requests project/environment context. | No Blogger or Vercel citation visible; captures 11:47–11:48 |
| Perplexity guest, Chrome incognito | `que es aio code?` | Fourth interpretation identifies this AIO CODE and current digital entity operating system definition. | Visible `aio-code.vercel` citation; 10 sources indicated, full panel not captured; 11:49–11:50 |

## What this window establishes

Perplexity **did identify and cite the project**, despite generic senses preceding it. Fourth interpretation is a position in the generated answer, not a measured retrieval rank. Google AI Overview, ChatGPT's first answer and Gemini's captured response did not identify the target under these queries. ChatGPT's uppercase follow-up is contextual and cannot establish performance of uppercase questions in fresh conversations. No visible search indicator establishes that ChatGPT or Gemini performed a web search in these sessions.

Perplexity also included the current system definition with a Vercel citation on September 28. Its displayed source count differs (15 then, 10 now); neither full set of URLs was captured. This is observed continuity of entity inclusion with a changed answer/source presentation, not disappearance of our sources. The reviewed September 28 Gemini screenshots do NOT establish a Blogger citation: the morning project recognition followed an owner hint, and the later direct answer was generic. We therefore do not describe today's Gemini response as a demonstrated loss of an earlier unaided Blogger citation.

The lowercase/generic result is an observed ambiguity under particular conditions. Case, punctuation, accent, context, search mode, model and source selection can differ; these screenshots do not isolate any one factor. There is no evidence here of deindexing, a guaranteed reindexing delay, or a causal effect of the release. Earlier phase-1 citations remain documented results.

## Next measurement, deferred by owner

The owner deferred another Observatory run until September 30. No uppercase retest has been performed or fabricated. For a casing comparison use fresh conversations and two otherwise identical questions: `¿Qué es AIO CODE?` and `¿Qué es aio code?`. Today's exact strings remain archived as their own variants. Separate Google Search AI Overview from the Modo IA surface, capture the full first response and clicked source URLs, and retain login/search/model conditions. Phase-2 content and performance measurements are planned for October; the owner mentioned the nine days before publication, whose exact dates and measurements must be supplied rather than inferred.
