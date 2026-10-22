/** Provider-neutral wire contract v1. Runtime acceptance currently permits simulated mode only. */
export type Role = 'supervisor' | 'research' | 'creative' | 'governance';
export type Claim = { subject: string; predicate: 'start_year'; value: string; source_id: string };
export type Recommendation = 'review_evidence' | 'draft_outline' | 'draft_questions' |
  'document_review_only' | 'request_human_review';
export interface AdapterOutput {
  version: 'deos.model-adapter/1'; role: Role; claims: Claim[]; recommendation: Recommendation;
  usage: { kind: 'simulated'; output_tokens: number };
}
export interface AdapterTask {
  version: 'deos.model-adapter/1'; role: Role;
  request: { fixture_id: string; request_id: string; revision: number };
  fixture: { subject: string; label: string; sources: ReadonlyArray<{
    id: string; subject: string; visibility: 'synthetic_public'; uri: string; text: string;
    facts: ReadonlyArray<{ predicate: 'start_year'; value: string }>;
  }> };
  prior: Partial<Record<Role, AdapterOutput>>; max_output_tokens: 256;
}
export interface ModelAdapter {
  version: 'deos.model-adapter/1'; id: string; role: Role; mode: 'simulated';
  generate(task: Readonly<AdapterTask>, context: { signal: AbortSignal }): Promise<AdapterOutput>;
}
// Exceptions: transient/timeout are retryable; all other codes stop the pipeline.
// Types document the interface. protocol.mjs enforces it at runtime; no TypeScript build is needed.
