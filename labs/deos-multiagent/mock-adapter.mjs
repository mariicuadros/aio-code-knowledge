import { VERSION, assert, ROLES } from './protocol.mjs';
// Only reviewed, in-process code is trusted. This is NOT a sandbox for untrusted plugins.
export function createMockAdapter(role, variant = 'outline') {
  assert(ROLES.includes(role) && ['outline', 'questions'].includes(variant));
  return Object.freeze({ version: VERSION, id: 'mock-' + role + '-' + variant, role, mode: 'simulated',
    async generate(task, { signal }) {
      assert(!signal.aborted, 'cancelled');
      const claims = role === 'research' ? task.fixture.sources
        .filter(s => s.subject === task.fixture.subject)
        .flatMap(s => s.facts.map(f => ({ ...f, subject: s.subject, source_id: s.id }))) : [];
      return { version: VERSION, role, claims, recommendation: {
        research: 'review_evidence', creative: variant === 'outline' ? 'draft_outline' : 'draft_questions',
        governance: 'document_review_only', supervisor: 'request_human_review'
      }[role], usage: { kind: 'simulated', output_tokens: 32 } };
    }
  });
}
export const mockAdapters = () => Object.fromEntries(ROLES.map(role => [role, createMockAdapter(role)]));
