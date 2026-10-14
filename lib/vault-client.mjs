import { createHash } from 'node:crypto';
import { require, verify } from './account-observation.mjs';
import { verifyAudience } from './audience-observation.mjs';
import { verifyMediaCandidate } from './media-candidate.mjs';

const BASE = 'https://api.github.com/repos/mariicuadros/aio-code-vault';

export async function github(path, token, { method = 'GET', body } = {}) {
  require(token, 'Vault credential missing');
  const response = await fetch(BASE + path, {
    method,
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: {
      accept: 'application/vnd.github+json',
      authorization: 'Bearer ' + token,
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const error = new Error('Vault request failed');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function state(token) {
  const repo = await github('', token);
  require(repo.private === true, 'Vault must remain private');
  const ref = await github('/git/ref/heads/main', token);
  const commit = await github('/git/commits/' + ref.object.sha, token);
  const tree = await github('/git/trees/' + commit.tree.sha + '?recursive=1', token);
  require(!tree.truncated && Array.isArray(tree.tree), 'Incomplete vault tree');
  return { head: ref.object.sha, tree: commit.tree.sha, entries: tree.tree };
}

export async function textBlob(sha, token) {
  require(/^[a-f0-9]{40}$/.test(sha), 'Invalid blob');
  const blob = await github('/git/blobs/' + sha, token);
  require(blob.encoding === 'base64', 'Unsupported blob');
  return Buffer.from(blob.content.replace(/\s/g, ''), 'base64').toString('utf8');
}

export async function commitFiles(token, files, message, markerPath = null) {
  require(Array.isArray(files) && files.length > 0, 'Files required');
  let current = await state(token);
  for (let attempt = 0; attempt < 3; attempt++) {
    if (markerPath && current.entries.some(entry => entry.path === markerPath)) {
      return { status: 'already_collected', head: current.head };
    }
    const paths = new Set();
    for (const file of files) {
      require(typeof file.path === 'string' && file.path && !paths.has(file.path), 'Unique file paths required');
      paths.add(file.path);
      require(typeof file.content === 'string', 'Text file content required');
      require(!current.entries.some(entry => entry.path === file.path), 'Vault records are immutable');
    }
    const tree = await github('/git/trees', token, {
      method: 'POST',
      body: {
        base_tree: current.tree,
        tree: files.map(file => ({
          path: file.path,
          mode: '100644',
          type: 'blob',
          content: file.content,
        })),
      },
    });
    const commit = await github('/git/commits', token, {
      method: 'POST',
      body: {
        message,
        tree: tree.sha,
        parents: [current.head],
      },
    });
    try {
      await github('/git/refs/heads/main', token, {
        method: 'PATCH',
        body: { sha: commit.sha, force: false },
      });
      return { status: 'committed', commit: commit.sha };
    } catch (error) {
      if (![409, 422].includes(error.status)) throw error;
      current = await state(token);
    }
  }
  throw new Error('Vault changed concurrently; retry required');
}

// Compatibility with the collector that appended exactly one LF after hashing.
// Recover only bytes whose SHA-256 matches the recorded original; never trim JSON
// freely, accept changed metrics, or rewrite immutable historical evidence.
export function recordEvidence(raw, record, integrityNotes = []) {
  const hash = text => createHash('sha256').update(text).digest('hex');
  if (hash(raw) === record.source_sha256) return raw;
  if (raw.endsWith('\n') && hash(raw.slice(0, -1)) === record.source_sha256) {
    integrityNotes.push({kind:'legacy_terminal_lf',record_id:record.observation_id || record.candidate_id,source_ref:record.source_ref});
    return raw.slice(0, -1);
  }
  throw new Error('Evidence digest mismatch');
}

export async function accountRecords(snapshot, token, integrityNotes = []) {
  const entries = snapshot.entries.filter(entry =>
    entry.type === 'blob' &&
    /^commercial-data\/account-ledger\/ACCOUNT-[a-f0-9]{64}\.json$/.test(entry.path));
  require(entries.length <= 1000, 'Account record limit exceeded');
  const records = [];
  for (const entry of entries) {
    const record = JSON.parse(await textBlob(entry.sha, token));
    const original = snapshot.entries.find(item => item.path === record.source_ref && item.type === 'blob');
    require(original, 'Account evidence missing');
    const raw = await textBlob(original.sha, token);
    verify(record, recordEvidence(raw, record, integrityNotes));
    require(entry.path === 'commercial-data/account-ledger/' + record.observation_id + '.json',
      'Account ID filename mismatch');
    records.push(record);
  }
  return records.sort((a, b) => b.captured_at.localeCompare(a.captured_at));
}

export async function mediaCandidates(snapshot, token, integrityNotes = []) {
  const entries = snapshot.entries.filter(entry =>
    entry.type === 'blob' &&
    /^commercial-data\/content-intake\/IGMEDIA-[A-Za-z0-9_.-]+\.json$/.test(entry.path));
  require(entries.length <= 5000, 'Media candidate limit exceeded');
  const records = [];
  for (const entry of entries) {
    const record = JSON.parse(await textBlob(entry.sha, token));
    const original = snapshot.entries.find(item => item.path === record.source_ref && item.type === 'blob');
    require(original, 'Media evidence missing');
    const raw = await textBlob(original.sha, token);
    verifyMediaCandidate(record, recordEvidence(raw, record, integrityNotes));
    require(entry.path === 'commercial-data/content-intake/' + record.candidate_id + '.json',
      'Media candidate filename mismatch');
    records.push(record);
  }
  return records.sort((a, b) => b.captured_at.localeCompare(a.captured_at));
}

export async function audienceRecords(snapshot, token) {
  const entries = snapshot.entries.filter(e => e.type === 'blob' && /^commercial-data\/audience-ledger\/AUDIENCE-[a-f0-9]{64}\.json$/.test(e.path));
  require(entries.length <= 1000, 'Audience record limit exceeded');
  const rows = [];
  for (const entry of entries) {
    const row = JSON.parse(await textBlob(entry.sha, token));
    const source = snapshot.entries.find(e => e.path === row.source_ref && e.type === 'blob');
    require(source, 'Audience evidence missing');
    verifyAudience(row, await textBlob(source.sha, token));
    require(entry.path === 'commercial-data/audience-ledger/' + row.observation_id + '.json', 'Audience filename mismatch');
    rows.push(row);
  }
  return rows.sort((a,b) => b.captured_at.localeCompare(a.captured_at));
}
