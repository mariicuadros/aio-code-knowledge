import { authorized, json } from '../lib/private-auth.mjs';
import { state, accountRecords, mediaCandidates, performanceLedgerRecords } from '../lib/vault-client.mjs';
import { linkPerformanceLedger } from '../lib/performance-ledger-view.mjs';

function latestByContent(rows) {
  const latest = new Map();
  for (const row of rows) {
    const prior = latest.get(row.proposed_content_id);
    if (!prior || row.captured_at > prior.captured_at) latest.set(row.proposed_content_id, row);
  }
  return [...latest.values()].sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export async function GET(request) {
  if (!authorized(request)) return json({ status: 'unauthorized' }, 401);
  const token = process.env.AIO_VAULT_READ_TOKEN;
  if (!token) return json({ status: 'vault_not_configured' }, 503);
  try {
    const snapshot = await state(token);
    const [accounts, media, ledger] = await Promise.all([
      accountRecords(snapshot, token),
      mediaCandidates(snapshot, token),
      performanceLedgerRecords(snapshot, token),
    ]);
    const mediaRecords = linkPerformanceLedger(media, ledger);
    return json({
      status: 'ok',
      generated_at: new Date().toISOString(),
      source_commit: snapshot.head,
      mode: 'verified_private_records',
      account_records: accounts,
      media_records: mediaRecords,
      counts: {
        account_observations: accounts.length,
        media_candidate_captures: media.length,
        publications_registered: mediaRecords.filter(row => row.provenance).length,
        unique_proposed_content_ids: new Set(media.map(row => row.proposed_content_id)).size,
      },
      interpretation: {
        account_metrics: 'Account-level observations only.',
        media_records: 'Publication and performance records are linked only after private provenance and evidence checks.',
        unknown_rights: 'Unknown means unverified; it is not a clearance or permission to republish.',
        causal_claims: 'Not inferred.',
      },
    });
  } catch {
    return json({ status: 'vault_verification_failed' }, 503);
  }
}
