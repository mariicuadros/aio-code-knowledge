/** Controlled lexical retrieval shared by the browser and private draft endpoint. */
export function createRetriever(passages) {
const stop = new Set('a al and are as con de del el en es for from how is la las los of or para que the to un una what who y cual does do no por se su sus was when with it this its an be can did ya'.split(' '));
const aliases = {copias:['copies','copy'],misma:['same'],biografia:['bio','biography'],demuestran:['prove'],corroboracion:['corroboration'],independiente:['independent'],publicar:['publishing','public'],garantiza:['guarantee','control'],encuentre:['retrieval','find'],chatgpt:['third','party','systems'],fuentes:['sources'],reconocimiento:['recognition'],relacion:['relationship']};
const tokens = value => (value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[]).filter(word=>word.length>1&&!stop.has(word));
const entries = passages.map(p=>{const counts=new Map();for(const t of tokens(p.text+' '+p.section_or_record_locator))counts.set(t,(counts.get(t)||0)+1);return {p,counts,length:[...counts.values()].reduce((a,b)=>a+b,0)}});
const avg = entries.reduce((n,e)=>n+e.length,0)/Math.max(1,entries.length);
const df = new Map();for(const e of entries)for(const t of e.counts.keys())df.set(t,(df.get(t)||0)+1);

function retrieve(query,limit=5){
  const terms=new Set(tokens(query));for(const t of [...terms])for(const a of aliases[t]||[])terms.add(a);
  const ids=new Set(query.match(/\b(?:MC-001|AIO-001|NUX-001|OZCU-001|VOID-001)\b/g)||[]);
  return entries.map(e=>{
    let score=0;
    for(const t of terms){const freq=e.counts.get(t)||0;if(freq)score+=Math.log(1+(entries.length-(df.get(t)||0)+.5)/((df.get(t)||0)+.5))*freq*2.2/(freq+1.2*(.25+.75*e.length/Math.max(1,avg)))}
    if(ids.size&&[...ids].some(id=>e.p.text.includes(id)))score+=1.5;
    return {p:e.p,score};
  }).filter(e=>e.score>0).sort((a,b)=>b.score-a.score||a.p.source_path.localeCompare(b.p.source_path)||a.p.section_or_record_locator.localeCompare(b.p.section_or_record_locator)).slice(0,limit).map(e=>e.p);
}

return retrieve;
}
