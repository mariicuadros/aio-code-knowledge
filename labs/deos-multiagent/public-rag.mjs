// Pure read-only boundary. No filesystem, URL fetching, indexing or model dispatch.
import { createRetriever, eligible } from '../../rag/retriever.mjs';
import { assert, hash } from './protocol.mjs';
export const PUBLIC_PIN = Object.freeze({
  repository_commit:'41c0244387f4865f9b2ebf4c4a50e4c97055974c',
  index_source_commit:'bcbd84fb6da6e148d9a6f9561a80ef64d5cf57f9',
  manifest_sha256_lf:'8d494fad9df59f6220123473118d9d5a36c258eebb741c4d71ca280042584c2c',
  index_sha256_lf:'ef45779a50f90cb90a1a20d3d5b9363cfef9f79e0a1237b989dd814238267280'
});
async function textHash(text) {
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text.replace(/\r\n/g,'\n')));
  return Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
}
// Pin is trusted application configuration, NOT a parameter supplied by an agent or user query.
// Exported for synthetic contract tests. It grants no file/network access.
export async function preparePublicSnapshot(manifestText,indexText,pin) {
  assert(typeof manifestText==='string'&&typeof indexText==='string'&&manifestText.length<=100000&&indexText.length<=2000000);
  assert(await textHash(manifestText)===pin.manifest_sha256_lf&&await textHash(indexText)===pin.index_sha256_lf,'snapshot_hash_mismatch');
  const manifest=JSON.parse(manifestText), index=JSON.parse(indexText);
  assert(index.source_commit===pin.index_source_commit&&/^[a-f0-9]{40}$/.test(index.source_commit));
  assert(Array.isArray(manifest.allowlist)&&Array.isArray(index.passages)&&index.passages.length<=5000);
  const paths=new Set(manifest.allowlist.filter(s=>s.visibility==='public').map(s=>s.path));
  const passages=[];
  for(const p of index.passages) {
    assert(paths.has(p.source_path)&&!p.source_path.split('/').includes('..')&&
      !/vault|private|restricted/i.test(p.source_path),'source_not_allowed');
    assert(p.visibility==='public','private_input');
    assert(p.commit_sha===index.source_commit&&
      p.source_url==='https://github.com/mariicuadros/aio-code-knowledge/blob/'+index.source_commit+'/'+p.source_path,'source_commit_mismatch');
    assert(typeof p.text==='string'&&p.text.length<=100000&&typeof p.section_or_record_locator==='string');
    if(eligible(p,'current')) passages.push({...p,passage_hash:await hash(p)});
  }
  const retrieve=createRetriever(passages,{scope:'current'});
  return Object.freeze({search(query,limit=5) {
    assert(typeof query==='string'&&query.length<=500&&Number.isInteger(limit)&&limit>=1&&limit<=5);
    return structuredClone(retrieve(query,limit));
  }, count:passages.length, mode:'public_read_only_not_connected_to_models'});
}
export const preparePinnedPublicRag = (manifest,index) => preparePublicSnapshot(manifest,index,PUBLIC_PIN);
