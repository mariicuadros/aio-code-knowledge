# AIO CODE — AI Representation Protocol

## Version

**Version:** 2.0  
**Date:** 2026-09-02  
**Project:** AIO CODE  
**Researcher:** Marii Cuadros  
**Case Study:** Marii Cuadros  
**Status:** Active Experimental Protocol

---

# 1. Purpose

The AI Representation Protocol defines the procedure used by AIO CODE to observe, measure and document how artificial intelligence systems represent a digital entity.

The protocol is designed to distinguish between:

- entity recognition;
- entity disambiguation;
- factual accuracy;
- source retrieval;
- citation;
- conceptual representation;
- recommendation;
- visibility;
- omissions;
- hallucinations;
- changes over time;
- cross-system differences;
- language-dependent behavior.

The objective is not to force an AI system to produce a predetermined answer.

The objective is to measure whether publicly available information produces a clearer, more consistent and more verifiable representation of an entity across different AI systems.

This protocol forms part of AIO CODE 2.0, which emphasizes structured entity architecture, cross-lingual behavior, and the distinction between indexing, retrieval, representation and recommendation.

---

# 2. Research Question

AIO CODE investigates the following question:

> How does a distributed and structured digital presence affect the way artificial intelligence systems identify, interpret, describe and retrieve a creator as a distinct entity?

The case study is Marii Cuadros.

The experiment uses her public digital presence as a living research environment.

During the period August 19 – September 2, 2026, this question was refined to account for:

- intermittent retrieval across systems;
- differences between Spanish and English queries;
- the distinction between recognition and stable recommendation;
- the role of distributed nodes (GitHub, Blogger, Hugging Face, Medium, Substack, social platforms).

---

# 3. Core Principle

AIO CODE does not assume that artificial intelligence systems share one common knowledge base.

Different systems may use different combinations of:

- model knowledge;
- search indexes;
- retrieval systems;
- external websites;
- structured data;
- platform data;
- citations;
- cached information;
- browsing tools;
- ranking systems;
- temporal updates;
- conversational context;
- language and geographic context.

Therefore:

> An entity may be recognized by one AI system and remain ambiguous or unknown to another.

This difference is itself a research observation.

Observations from August–September 2026 showed that the same entity could appear in one system (e.g., ChatGPT in Spanish) but not in another (e.g., Gemini in English), or appear only after explicit queries.

---

# 4. What AIO CODE Measures

The protocol currently measures seven primary dimensions.

## 4.1 Entity Recognition

Can the system identify the intended person?

Example:

> Who is Marii Cuadros?

Possible results:

- Correct identification.
- Partial identification.
- No identification.
- Incorrect identification.
- Ambiguous identification.

During the recent period, recognition was observed to be intermittent: the entity appeared in some sessions and not in others, even with the same prompt.

---

## 4.2 Entity Disambiguation

Can the system distinguish Marii Cuadros from other people with similar names?

This is particularly relevant because the name may be associated with other individuals, including people named María Cuadros.

The experiment therefore records whether the system:

- identifies the Colombian creator;
- identifies another person;
- combines information from different people;
- expresses uncertainty;
- asks for additional context.

---

## 4.3 Representation Accuracy

Once the system identifies the entity, the response is evaluated for factual accuracy.

Examples of information that may be evaluated:

- profession;
- location;
- projects;
- AIO CODE;
- VOID MODE;
- creative activities;
- research activities;
- relationships between entities.

Incorrect claims are recorded separately from missing information.

---

## 4.4 Source Retrieval

The protocol records which public sources appear to contribute to the representation.

Possible sources include:

- official websites;
- Blogger;
- GitHub;
- Hugging Face;
- Instagram;
- X;
- Threads;
- Medium;
- Substack;
- Quora;
- Bluesky;
- TikTok;
- Archive.org;
- third-party publications;
- institutional sources;
- other publicly accessible pages.

The appearance of a source does not automatically establish that the source caused the AI response.

During August–September 2026, sources such as Medium and Blogger began appearing in Gemini responses, while GitHub and Hugging Face were more frequently associated with ChatGPT and Perplexity.

---

## 4.5 Citation

When an AI system provides citations or identifiable sources, the protocol records:

- source name;
- source type;
- relevance;
- whether the source accurately represents the entity;
- whether the source is first-party or third-party.

First-party sources and independent third-party sources are therefore distinguished.

---

## 4.6 Conceptual Representation

The experiment evaluates whether the AI understands the concepts associated with the entity.

Examples:

> What is AIO CODE?

> What is VOID MODE?

> What does Marii Cuadros research?

> What is the relationship between Marii Cuadros and AIO CODE?

The objective is to determine whether the system retrieves isolated facts or develops a coherent representation of the relationships between them.

---

## 4.7 Recommendation

AIO CODE distinguishes recognition from recommendation.

A system may know that a creator exists without recommending that creator when asked for:

> artists working with AI;

> creators researching digital identity;

> Colombian digital artists;

> creators working at the intersection of AI and art.

Therefore, recommendation is measured separately.

The period August–September 2026 showed that recognition did not automatically translate into recommendation, even when the entity was correctly identified.

---

# 5. Test Categories

The protocol uses multiple categories of prompts.

## Category A — Direct Entity Queries

Examples:

> Who is Marii Cuadros?

> Who is Marii Cuadros in Colombia?

> What does Marii Cuadros do?

---

## Category B — Entity Disambiguation

Examples:

> Who is Marii Cuadros, the Colombian creator?

> Is Marii Cuadros the same person as María Cuadros?

> Which Marii Cuadros is associated with AIO CODE?

---

## Category C — Project Queries

Examples:

> What is AIO CODE?

> Who created AIO CODE?

> What does AIO CODE investigate?

> What is the relationship between Marii Cuadros and AIO CODE?

---

## Category D — Concept Queries

Examples:

> What is VOID MODE?

> What does VOID MODE mean in Marii Cuadros' work?

> What concepts are associated with Marii Cuadros?

---

## Category E — Recommendation Queries

Examples:

> Which creators are researching AI and digital identity?

> Which Colombian creators work with AI and digital culture?

> Which artists explore digital identity and artificial intelligence?

The purpose is to determine whether recognition eventually develops into contextual retrieval or recommendation.

---

## Category F — Source Queries

Examples:

> What are the main sources of information about Marii Cuadros?

> Where can I find official information about AIO CODE?

> What sources document Marii Cuadros' work?

---

## Category G — Multilingual Queries (New in 2.0)

Examples:

> Who is Marii Cuadros? (asked in Spanish)

> ¿Quién es Marii Cuadros? (asked in Spanish, expecting Spanish response)

> Who is Marii Cuadros? (asked in English)

> ¿Quién es Marii Cuadros? (asked in Spanish, observing if response is in English)

The purpose is to measure language-dependent retrieval and representation.

---

# 6. Testing Conditions

To reduce contamination from previous conversations, the protocol distinguishes between two conditions.

## 6.1 Contextual Testing

The AI is allowed to use the existing conversation context.

This measures:

> What can the system produce when the entity has already been explained to it?

This is useful for research assistance but is not considered a clean measure of independent retrieval.

---

## 6.2 Context-Reduced Testing

The query is performed without supplying previous information about the entity.

Whenever possible, the test should use:

- a new conversation;
- incognito/private browsing where available;
- no previous explanation;
- no manually supplied URLs;
- no copied biography;
- no leading description.

This measures:

> What information can the system independently retrieve or identify?

Context-reduced testing is the preferred condition for entity recognition experiments.

During August–September 2026, most stable observations came from context-reduced tests in incognito mode.

---

# 7. Standard Test Procedure

Each test should follow the same general sequence.

### Step 1 — Select the prompt

Use an exact prompt from the current benchmark list.

### Step 2 — Select the AI system

Record the system being tested.

### Step 3 — Record the date

The date is essential because AI retrieval can change over time.

### Step 4 — Record the testing condition

Specify:

- contextual;
- context-reduced;
- incognito;
- logged-in;
- browsing enabled;
- browsing unavailable;
- language used.

### Step 5 — Record the response

Preserve the relevant response or a structured summary.

### Step 6 — Record sources

If sources or citations are provided, record them.

### Step 7 — Classify the result

Assign the appropriate recognition and accuracy categories.

### Step 8 — Compare with previous tests

Determine whether the representation:

- improved;
- remained stable;
- degraded;
- changed;
- became more specific;
- became more ambiguous;
- appeared in a new system or language.

---

# 8. Representation Classification

Each response should receive one primary classification.

| Code | Classification | Description |
|---|---|---|
| R0 | Not Recognized | The system cannot identify the intended entity. |
| R1 | Ambiguous | The system identifies multiple possible entities or requests clarification. |
| R2 | Partial | The system identifies the entity but provides limited or incomplete information. |
| R3 | Correct | The system identifies the intended entity with substantially accurate information. |
| R4 | Strong Representation | The system identifies, contextualizes and connects the entity with relevant projects and sources. |
| R5 | Recommendation | The entity is retrieved or recommended within relevant category-based queries. |

These categories are descriptive research classifications rather than universal industry standards.

---

# 9. Accuracy Classification

Accuracy is evaluated separately from recognition.

| Code | Meaning |
|---|---|
| A0 | No usable information |
| A1 | Significant inaccuracies |
| A2 | Mixed accuracy |
| A3 | Mostly accurate |
| A4 | Highly accurate |
| A5 | Highly accurate and well-supported |

A system can therefore produce:

> R3 + A2

meaning that it recognized the correct person but provided several inaccurate or unsupported details.

This distinction is important.

Recognition does not equal accuracy.

---

# 10. Source Classification

Sources should be classified into two principal groups.

## First-Party Sources

Sources directly controlled or published by the project or creator.

Examples:

- AIO CODE GitHub;
- AIO CODE Blogger;
- Hugging Face;
- official social profiles;
- official project documentation.

## Third-Party Sources

Sources controlled by independent parties.

Examples:

- interviews;
- publications;
- institutional websites;
- independent articles;
- community discussions;
- external databases;
- external organizations.

AIO CODE does not treat first-party documentation as equivalent to independent validation.

Third-party evidence is therefore tracked separately.

---

# 11. Source Appearance Does Not Equal Causation

A source appearing in an AI response does not prove that the source caused the response.

For example:

If Medium appears after a Medium publication is created, the experiment records:

> Medium became an observable source associated with the entity.

It does **not** automatically conclude:

> Medium caused the AI system to recognize the entity.

Multiple variables may have changed simultaneously.

Possible variables include:

- GitHub updates;
- Blogger updates;
- Hugging Face updates;
- social media activity;
- Quora;
- Medium;
- Substack;
- X;
- search engine crawling;
- time;
- previous indexing;
- external links.

Causal claims therefore require additional experimentation.

---

# 12. Temporal Measurement

AI representation is treated as a changing state rather than a permanent condition.

A result observed on one date may not remain the same later.

The protocol therefore records:

**Date → System → Prompt → Result → Sources → Classification**

Example:

> August 17 → ChatGPT → "Who is Marii Cuadros?" → Not clearly identified → No reliable source → R0

Later:

> August 19 → ChatGPT → same prompt → Colombian creator identified → Medium/Hugging Face → R2/R3

Later:

> September 1 → Incognito → same prompt → Instagram profile visible → R2

Later:

> September 2 → Gemini → same prompt in Spanish → Blogger + Medium cited → R3

The difference between these observations becomes part of the research record.

---

# 13. Cross-System Comparison

AIO CODE does not treat ChatGPT, Gemini, Perplexity, Claude, Grok or other AI systems as interchangeable.

Each system is treated as an independent observation environment.

The protocol therefore compares:

- recognition;
- disambiguation;
- sources;
- accuracy;
- conceptual understanding;
- recommendation;
- temporal changes;
- language behavior.

The goal is to determine whether changes are:

### System-specific

Observed in one AI system.

### Cross-system

Observed in multiple AI systems.

### Broadly distributed

Observed across several AI systems and search environments.

During August–September 2026, most changes were cross-system but not universal, and language (Spanish vs. English) played a significant role.

---

# 14. Prompt Benchmark

The initial benchmark contains the following core prompts.

### Entity

1. Who is Marii Cuadros?
2. What does Marii Cuadros do?
3. Who is Marii Cuadros in Colombia?

### Disambiguation

4. Who is the Colombian creator Marii Cuadros?
5. Is Marii Cuadros the same person as María Cuadros?
6. Which Marii Cuadros is associated with AIO CODE?

### AIO CODE

7. What is AIO CODE?
8. Who created AIO CODE?
9. What does AIO CODE investigate?
10. What is the relationship between Marii Cuadros and AIO CODE?

### Concepts

11. What is VOID MODE?
12. What does Marii Cuadros research?
13. What is Marii Cuadros known for?

### Recommendation

14. Which Colombian creators are working at the intersection of AI and digital identity?
15. Which artists or creators are researching AI representation and digital identity?

### Multilingual (New in 2.0)

16. ¿Quién es Marii Cuadros? (Spanish)
17. Who is Marii Cuadros? (English)
18. ¿Quién es Marii Cuadros y qué es AIO CODE? (Spanish)
19. What is the relationship between Marii Cuadros and AIO CODE? (English)

The benchmark may evolve as new hypotheses emerge.

---

# 15. Baseline

The first benchmark observations were collected during August 2026.

Early testing demonstrated that different AI systems could produce substantially different representations of the same name.

Observed outcomes included:

- inability to identify Marii Cuadros;
- association with another person named María Cuadros;
- requests for additional context;
- partial recognition;
- later recognition of the Colombian creator;
- retrieval of project-related sources.

The initial baseline therefore demonstrated:

> Entity ambiguity existed before the digital documentation network became more structured.

Later observations are compared against this baseline.

The period August 19 – September 2, 2026 added a new layer to the baseline:

- intermittent visibility in Google AI Mode;
- differences between Spanish and English retrieval;
- appearance of Instagram and other social profiles in search results;
- use of Medium and Blogger as sources by Gemini.

---

# 16. Current Case Study

The current case study is:

**Entity:** Marii Cuadros  
**Country:** Colombia  
**Project:** AIO CODE  
**Researcher:** Marii Cuadros  
**Method:** Public digital documentation + controlled observation  
**Status:** Active  
**Current Version:** 2.0 (2026-09-02)

The case study is intentionally self-referential.

Marii Cuadros is simultaneously:

1. the researcher;
2. the entity being observed;
3. the creator of the methodology;
4. the primary experimental environment.

This creates limitations that must be acknowledged.

---

# 17. Experimental Limitations

AIO CODE currently operates under several limitations.

## 17.1 Single Primary Case Study

The methodology is initially being developed through one principal entity.

Therefore, results cannot yet be generalized to all creators.

---

## 17.2 Multiple Variables Change Simultaneously

During the experiment, multiple platforms and documents may be updated within the same period.

This makes causal attribution difficult.

---

## 17.3 AI Systems Are Non-Deterministic

The same prompt may produce different responses at different times.

Therefore, a single response should not be treated as definitive evidence.

---

## 17.4 Proprietary Systems

The internal ranking, retrieval and model-update mechanisms of commercial AI systems are generally not fully observable.

The experiment measures outputs rather than claiming access to internal mechanisms.

---

## 17.5 First-Party Documentation Bias

Much of the initial information about Marii Cuadros and AIO CODE comes from first-party sources.

This limits the ability to make strong claims about independent authority.

---

## 17.6 Language and Geographic Bias (New in 2.0)

The current experiment is heavily influenced by:

- Spanish-language sources;
- an increasing number of English-language experiments;
- a Colombian geographic context.

This may affect how different AI systems retrieve and represent the entity in different regions and languages.

---

# 18. Evidence Hierarchy

AIO CODE uses the following practical hierarchy when evaluating claims.

### Level 1 — AI-generated statement

Useful for observation.

Not sufficient as independent evidence.

### Level 2 — First-party documentation

Useful for establishing what the creator/project publicly states.

### Level 3 — Search-engine retrieval

Useful for observing discoverability.

### Level 4 — Structured external sources

Useful for corroboration and entity relationships.

### Level 5 — Independent third-party evidence

Strongest form of external validation within the current methodology.

Examples include:

- institutional publications;
- independent journalism;
- interviews;
- academic references;
- independent databases;
- external organizations.

---

# 19. What the Protocol Does Not Claim

AIO CODE does not claim that:

- a specific platform controls an AI model's knowledge;
- publishing on one website guarantees AI recognition;
- Schema.org automatically causes LLM recognition;
- a particular prompt can permanently change an AI model;
- AI systems have a single universal knowledge graph;
- search ranking and LLM representation are identical;
- social media activity directly causes AI recognition;
- one source is solely responsible for a change in representation;
- visibility is a permanent or binary state.

The protocol is designed to test these types of assumptions rather than assume them.

---

# 20. Research Logic

The experimental cycle follows:

**Observation**

↓

**Question**

↓

**Hypothesis**

↓

**Intervention**

↓

**Measurement**

↓

**Comparison**

↓

**Interpretation**

↓

**New Hypothesis**

This cycle is repeated as the digital environment changes.

---

# 21. Relationship to AIO CODE Methodology

The AI Representation Protocol forms one component of the broader AIO CODE methodology.

AIO CODE currently studies the relationship between:

**Identity**

→ **Documentation**

→ **Structure**

→ **Distribution**

→ **Retrieval**

→ **Representation**

→ **Recommendation**

The protocol provides the measurement layer for the final stages of this chain.

---

# 22. Future Development

Future versions of the protocol may introduce:

- larger prompt datasets;
- repeated measurements per prompt;
- statistical confidence measures;
- source-frequency analysis;
- entity graph mapping;
- multilingual testing;
- image-generation recognition tests;
- recommendation benchmarks;
- longitudinal measurement;
- independent case studies;
- control groups;
- AIO CODE visibility scores;
- AI representation accuracy scores;
- stability metrics for intermittent retrieval.

These features will only be added when sufficient observations justify them.

---

# 23. Current Research Status

**Phase:** Experimental

**Primary objective:** Measure AI representation of a newly documented digital entity.

**Current case study:** Marii Cuadros

**Current project:** AIO CODE

**Current version:** 2.0 (2026-09-02)

**Current focus:**

- Entity recognition
- Entity disambiguation
- Source retrieval
- Cross-system comparison
- Public indexing
- Representation accuracy
- Temporal change
- Multilingual behavior
- Intermittent visibility patterns
- Distinction between recognition and recommendation

The research remains active.

---

# 24. Research Principle

AIO CODE does not attempt to manufacture authority.

It attempts to study whether a creator can build a clearer, more structured and more verifiable public information environment — and whether that environment changes how artificial intelligence systems retrieve and represent that creator.

The central research question remains:

> **If the information architecture surrounding an artist changes, does the way AI systems represent that artist change as well?**

During the period August 19 – September 2, 2026, the answer appears to be:

> **Yes, but in a non-binary, system-dependent and language-dependent way.**

---

**AIO CODE — 2026**

*Experimental research into AI, digital identity, representation and information systems.*

**Protocol Version:** 2.0 (2026-09-02)
