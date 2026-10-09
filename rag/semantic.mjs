/** Finite reviewed assertions, independently checked against supplied evidence. */
export const normalize = value => (value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[]).join(' ');
export function supportedClaim(query,sources,policy){
  for(const claim of policy.claims){
    if(!claim.queries.some(q=>normalize(q)===normalize(query)))continue;
    const sourceIndex=sources.findIndex(s=>s.canonical_or_historical==='canonical_current'&&s.visibility==='public'
      &&['not_applicable','observed','corroborated','verified'].includes(s.evidence_state_or_not_applicable)
      &&s.source_path===claim.source_path&&s.section_or_record_locator===claim.locator
      &&claim.required_fragments.every(fragment=>s.text.includes(fragment)));
    if(sourceIndex>=0)return {...claim,sourceIndex};
  }
  return null;
}
export function answer(query,sources,policy){
  const claim=supportedClaim(query,sources,policy);
  if(!claim)return {status:'no_evidence',answer:'No hay evidencia suficiente',citations:[],reason:'No reviewed assertion supported by current supplied evidence'};
  return {status:'supported_reviewed_answer',answer:claim.answer,claim_id:claim.claim_id,citations:[sources[claim.sourceIndex]],scope:'Reviewed first-party statement; not independent external verification'};
}
export function selectAnswerSources(query,candidates,corpus,policy,limit=5){
  const claim=supportedClaim(query,corpus,policy);
  if(!claim)return candidates.slice(0,limit);
  const supporting=corpus[claim.sourceIndex];
  return [supporting,...candidates.filter(p=>p.source_path!==supporting.source_path||p.section_or_record_locator!==supporting.section_or_record_locator).slice(0,limit-1)];
}
export function validateDraft(query,draft,sources,policy){
  const claim=supportedClaim(query,sources,policy);
  return Boolean(claim&&draft&&draft.abstained===false&&draft.answer===claim.answer&&Array.isArray(draft.citations)
    &&draft.citations.length&&draft.citations.every(id=>id===`S${claim.sourceIndex+1}`));
}
