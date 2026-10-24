import { VERSION, ROLES, assert, exact, stable, hash, estimateTokens, validateAdapter, validateOutput } from './protocol.mjs';
import { getFixture } from './fixtures.mjs';
import { mockAdapters } from './mock-adapter.mjs';

const DEFAULTS = Object.freeze({ max_calls: 8, max_tokens: 12000, timeout_ms: 1000, max_attempts: 2 });
const safeCodes = new Set(['timeout', 'transient', 'budget_exhausted', 'cancelled', 'unknown_source',
  'identity_mismatch', 'unsupported_claim', 'incomplete_evidence', 'duplicate_claim',
  'forbidden_recommendation', 'unexpected_claims', 'invalid_contract', 'private_input']);
const codeOf = error => safeCodes.has(error?.code) ? error.code : 'adapter_error';
function requestValue(raw) {
  exact(raw, ['fixture_id', 'request_id', 'revision']);
  assert(typeof raw.fixture_id === 'string' && /^SYN-REQ-\d{3,6}$/.test(raw.request_id) &&
    Number.isSafeInteger(raw.revision) && raw.revision > 0 && raw.revision <= 10000);
  return structuredClone(raw);
}
function limitsValue(raw) {
  const limits = { ...DEFAULTS, ...raw }; exact(limits, Object.keys(DEFAULTS));
  for (const [key, ceiling] of Object.entries({max_calls: 16, max_tokens: 50000, timeout_ms: 5000, max_attempts: 3}))
    assert(Number.isSafeInteger(limits[key]) && limits[key] > 0 && limits[key] <= ceiling);
  return Object.freeze(limits);
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
async function boundedCall(adapter, task, timeout, signal) {
  const controller = new AbortController();
  let timer, abort;
  try {
    return await Promise.race([
      Promise.resolve().then(() => { assert(!controller.signal.aborted, 'cancelled');
        return adapter.generate(task, {signal: controller.signal}); }),
      new Promise((_, reject) => {
        const stop = code => { controller.abort(); reject(Object.assign(new Error(code), {code})); };
        timer = setTimeout(() => stop('timeout'), timeout);
        abort = () => stop('cancelled');
        signal?.addEventListener('abort', abort, {once:true});
        if (signal?.aborted) abort();
      })
    ]);
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); controller.abort(); }
}

export function createOrchestrator({ adapters = mockAdapters(), limits: rawLimits = {} } = {}) {
  exact(adapters, ROLES);
  const selected = Object.fromEntries(ROLES.map(role => {
    validateAdapter(adapters[role], role);
    return [role, Object.freeze({...adapters[role]})];
  }));
  const limits = limitsValue(rawLimits);
  // Bounded, volatile local review state; not canonical records, rights or a durable audit ledger.
  const records = new Map(); let busy = false;
  return Object.freeze({
    async run(raw, {signal} = {}) {
      const request = requestValue(raw), fixture = getFixture(request.fixture_id);
      assert(!busy, 'run_in_progress');
      const previous = records.get(request.request_id);
      assert(!previous || request.revision > previous.revision, 'stale_revision');
      assert(records.size < 100 || previous, 'session_capacity');
      // A new revision immediately revokes the old confirmation, even if this run fails.
      const state = {revision: request.revision, result: null, approved: false};
      records.set(request.request_id, state); busy = true;
      try {
        const trace = [], errors = [], outputs = {}, sources = [];
        let calls = 0, reserved = 0;
        const addTrace = entry => trace.push({sequence: trace.length + 1, ...entry});
        if (fixture.sources.some(s => s.visibility !== 'synthetic_public')) errors.push({role:null, code:'private_input'});
        else {
          for (const s of fixture.sources) sources.push({source_id:s.id, uri:s.uri, subject:s.subject,
            hash:await hash(s), verification:'fixture_only_not_independently_verified'});
          for (const role of ROLES) {
            const task = freeze({version:VERSION, role, request:structuredClone(request),
              fixture:structuredClone(fixture), prior:structuredClone(outputs), max_output_tokens:256});
            const inputHash = await hash(task), reserve = estimateTokens(task) + 256;
            for (let attempt = 1; attempt <= limits.max_attempts; attempt++) {
              if (signal?.aborted || calls >= limits.max_calls || reserved + reserve > limits.max_tokens) {
                const code = signal?.aborted ? 'cancelled' : 'budget_exhausted';
                errors.push({role, code}); addTrace({role, attempt, status:'blocked', code, input_hash:inputHash}); break;
              }
              // Failed/timeout attempts keep their full reservation. No model may lower accounting.
              calls++; reserved += reserve;
              try {
                const output = validateOutput(await boundedCall(selected[role], task, limits.timeout_ms, signal), role, fixture);
                assert(!signal?.aborted, 'cancelled');
                outputs[role] = output;
                addTrace({role, attempt, adapter:selected[role].id, status:'ok', input_hash:inputHash,
                  output_hash:await hash(output), reserved_tokens:reserve, reported_output_tokens:output.usage.output_tokens});
                break;
              } catch (error) {
                const code = codeOf(error);
                addTrace({role, attempt, adapter:selected[role].id, status:'error', code,
                  input_hash:inputHash, reserved_tokens:reserve});
                errors.push({role, attempt, code});
                if (!['timeout','transient'].includes(code) || attempt === limits.max_attempts) break;
              }
            }
            if (!outputs[role]) break;
          }
        }
        const claims = outputs.research?.claims ?? [];
        const values = [...new Set(claims.map(c => c.value))];
        const conflicts = values.length > 1 ? [{subject:fixture.subject, predicate:'start_year', values,
          source_ids:claims.map(c => c.source_id)}] : [];
        const complete = ROLES.every(role => outputs[role]);
        const content = {version:VERSION, request, subject:fixture.subject, sources, claims, conflicts,
          outputs, trace, errors, complete, usage:{kind:'simulation_estimate_not_provider_tokens',
            mock_calls:calls, reserved_tokens:reserved, provider_calls:0, api_cost_usd:0},
          policy:{canonical_entity_id:null, publication:'not_authorized', vault:'not_connected',
            rights:'not_granted', legal_certification:false, contracts_approved:false, link_canonical:false,
            human_review_required:true},
          message: complete ? 'Propuesta sintÃ©tica preparada; revisar fuentes y discrepancias.' : 'EjecuciÃ³n bloqueada; no hay propuesta aprobable.'};
        const approval = {request_id:request.request_id, entity:fixture.subject, revision:request.revision,
          action:'acknowledge_synthetic_review', content_hash:await hash(content)};
        if (complete && signal?.aborted) {
          content.complete = false; content.errors.push({role:null, code:'cancelled'});
          content.message = 'Ejecución cancelada; no hay propuesta aprobable.';
          approval.content_hash = await hash(content);
        }
        const result = {...content, approval};
        state.result = structuredClone(result);
        return structuredClone(result);
      } finally { busy = false; }
    },
    approve(binding, {humanConfirmed = false} = {}) {
      exact(binding, ['request_id','entity','revision','action','content_hash']);
      const state = records.get(binding.request_id);
      assert(humanConfirmed === true && !busy && state?.result?.complete && !state.approved &&
        stable(binding) === stable(state.result.approval), 'approval_rejected');
      state.approved = true;
      return {...structuredClone(binding), status:'human_acknowledged_locally', publication:'not_authorized',
        scope:'review_only_not_identity_rights_contract_or_publication_authority'};
    },
    invalidate(requestId) { assert(!busy, 'run_in_progress'); const s=records.get(requestId); if(s) s.result=null; }
  });
}
