// Explicit read-only smoke check: fixed PUBLIC files, metadata only, no model invocation.
import { readFile } from 'node:fs/promises';
import { preparePinnedPublicRag, PUBLIC_PIN } from './public-rag.mjs';
const [manifest,index]=await Promise.all(['corpus-manifest-v0.json','public-index-v0.json']
  .map(name=>readFile(new URL('../../rag/'+name,import.meta.url),'utf8')));
const rag=await preparePinnedPublicRag(manifest,index);
console.log(JSON.stringify({mode:rag.mode,current_passages:rag.count,pin:PUBLIC_PIN}));
