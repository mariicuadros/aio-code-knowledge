/** Copy only reviewed public files. Never delete source or stale output files. */
import { readFile, lstat, readdir, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public');
const manifest = JSON.parse(await readFile(resolve(root, 'public-site-manifest.json'), 'utf8'));
const files = manifest.files;
if (manifest.version !== 1 || !Array.isArray(files) || new Set(files).size !== files.length)
  throw new Error('Invalid public site manifest');
const forbidden = /^(?:api|codex|scripts|tests|security|brain|private|vault|credentials|secrets|\.github|\.vercel|node_modules)(?:\/|$)|^observatory\/(?:intake|runs)(?:\/|$)|(?:^|\/)\.env(?:\.|$)|\.(?:pem|key|token|secret|private\.[^/]+)$/i;
async function absentOrStat(path) {
  try { return await lstat(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function rejectSymlinks(path) {
  for (let cursor = path; cursor !== root; cursor = dirname(cursor)) {
    const stat = await absentOrStat(cursor);
    if (stat?.isSymbolicLink()) throw new Error(`Symlink is not a public build input: ${path}`);
  }
}
// Validate every source and the existing output before making any writes.
for (const path of files) {
  if (typeof path !== 'string' || path.includes('\\') || path.split('/').some(p => !p || p === '.' || p === '..') || forbidden.test(path))
    throw new Error(`Unsafe public path: ${path}`);
  const source = resolve(root, path);
  if (!source.startsWith(root + sep)) throw new Error(`Path escapes source root: ${path}`);
  await rejectSymlinks(source);
  if (!(await lstat(source)).isFile()) throw new Error(`Public source is not a file: ${path}`);
}
await rejectSymlinks(output);
async function inspectExisting(dir) {
  const stat = await absentOrStat(dir);
  if (!stat) return;
  if (!stat.isDirectory()) throw new Error(`Output is not a directory: ${dir}`);
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Output symlink: ${path}`);
    if (entry.isDirectory()) await inspectExisting(path);
    else if (!files.includes(relative(output, path).split(sep).join('/')))
      throw new Error(`Unexpected existing output; review manually: ${path}`);
  }
}
await inspectExisting(output);
let copied = 0, unchanged = 0;
for (const path of files) {
  const source = resolve(root, path), destination = resolve(output, path);
  const exists = await absentOrStat(destination);
  if (exists && (await readFile(source)).equals(await readFile(destination))) { unchanged++; continue; }
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  copied++;
}
console.log(`Public site: ${files.length} allowlisted files (${copied} copied, ${unchanged} unchanged); no files deleted.`);
