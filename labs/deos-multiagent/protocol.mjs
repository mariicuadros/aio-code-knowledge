// No provider SDK, credentials, network or privileged tools in this contract.
export const VERSION = 'deos.model-adapter/1';
export const ROLES = Object.freeze(['research', 'creative', 'governance', 'supervisor']);
export function assert(ok, code = 'invalid_contract') {
  if (!ok) throw Object.assign(new Error(code), { code });
}
export function exact(value, keys) {
  assert(value && Object.getPrototypeOf(value) === Object.prototype &&
    Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k)));
}
export function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort()
    .map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export async function hash(value) {
  const bytes = new TextEncoder().encode(stable(value));
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    n => n.toString(16).padStart(2, '0')).join('');
}
export const estimateTokens = value => Math.ceil(new TextEncoder().encode(stable(value)).length / 4);
export function validateAdapter(adapter, role) {
  exact(adapter, ['version', 'id', 'role', 'mode', 'generate']);
  assert(adapter.version === VERSION && adapter.role === role && adapter.mode === 'simulated' &&
    /^mock-[a-z0-9-]{1,40}$/.test(adapter.id) && typeof adapter.generate === 'function');
}
export function validateOutput(out, role, fixture) {
  exact(out, ['version', 'role', 'claims', 'recommendation', 'usage']);
  assert(out.version === VERSION && out.role === role && Array.isArray(out.claims) && out.claims.length <= 10);
  exact(out.usage, ['kind', 'output_tokens']);
  assert(out.usage.kind === 'simulated' && Number.isSafeInteger(out.usage.output_tokens) &&
    out.usage.output_tokens >= 0 && out.usage.output_tokens <= 256);
  const recommendations = { research: ['review_evidence'], creative: ['draft_outline', 'draft_questions'],
    governance: ['document_review_only'], supervisor: ['request_human_review'] };
  assert(recommendations[role].includes(out.recommendation), 'forbidden_recommendation');
  if (role !== 'research') assert(out.claims.length === 0, 'unexpected_claims');
  const seen = new Set();
  for (const claim of out.claims) {
    exact(claim, ['subject', 'predicate', 'value', 'source_id']);
    const source = fixture.sources.find(s => s.id === claim.source_id && s.visibility === 'synthetic_public');
    assert(source, 'unknown_source');
    assert(claim.subject === fixture.subject && source.subject === fixture.subject, 'identity_mismatch');
    assert(source.facts.some(f => f.predicate === claim.predicate && f.value === claim.value), 'unsupported_claim');
    assert(!seen.has(stable(claim)), 'duplicate_claim'); seen.add(stable(claim));
  }
  // A model cannot hide one side of contradictory evidence by omitting it.
  if (role === 'research') {
    const expected = fixture.sources.filter(s => s.visibility === 'synthetic_public' && s.subject === fixture.subject)
      .flatMap(s => s.facts.map(f => ({ ...f, subject: s.subject, source_id: s.id })));
    assert(stable([...out.claims].sort((a,b) => stable(a).localeCompare(stable(b)))) ===
      stable(expected.sort((a,b) => stable(a).localeCompare(stable(b)))), 'incomplete_evidence');
  }
  return structuredClone(out);
}
