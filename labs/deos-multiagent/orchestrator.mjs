// DEOS Assistant synthetic-only laboratory. No real model, API, tool or Vault calls.
// Role adapter names describe future integrations; every active adapter is a mock.
const check=(ok)=>{if(!ok){const e=new Error('demo_invalid_input');e.code='demo_invalid_input';throw e;}};
const exact=(value,keys)=>check(value&&typeof value==='object'&&!Array.isArray(value)&&
  Object.keys(value).every(k=>keys.includes(k))&&keys.every(k=>Object.hasOwn(value,k)));
const plain=(value,max=1000)=>typeof value==='string'&&value.length>0&&
  value.length<=max&&value.trim()===value&&!/[\u0000-\u001f]/.test(value)&&!/<[^>]+>/.test(value);

function validated(value){
  exact(value,['schema_version','demo','case_id','intent','entity','sources']);
  check(value.schema_version===1&&value.demo===true&&
    /^SYN-CASE-\d{3,6}$/.test(value.case_id)&&value.intent==='prepare_entity_onboarding');
  exact(value.entity,['display_name','type','aliases']);
  check(plain(value.entity.display_name,100)&&
    ['person','organization','project','creative'].includes(value.entity.type)&&
    Array.isArray(value.entity.aliases)&&value.entity.aliases.length<=8&&
    value.entity.aliases.every(v=>plain(v,100)));
  check(Array.isArray(value.sources)&&value.sources.length>=1&&value.sources.length<=10);
  const seen=new Set();
  for(const s of value.sources){
    exact(s,['source_id','uri','title','excerpt']);
    check(/^SYN-SRC-\d{2,6}$/.test(s.source_id)&&!seen.has(s.source_id)&&
      /^https:\/\/example\.invalid\/[a-z0-9/-]+$/.test(s.uri)&&
      plain(s.title,100)&&plain(s.excerpt,1000));
    seen.add(s.source_id);
  }
  return structuredClone(value);
}

function research(request){
  const names=[request.entity.display_name,...request.entity.aliases].map(x=>x.toLowerCase());
  const matched=request.sources.filter(s=>names.some(name=>s.excerpt.toLowerCase().includes(name)));
  const claims=request.sources.flatMap(s=>Array.from(s.excerpt.matchAll(/\b(?:19|20)\d{2}\b/g),
    m=>({value:m[0],source_id:s.source_id})));
  const years=[...new Set(claims.map(c=>c.value))];
  return {role:'research',provider:'mock',status:'unverified',
    matched_source_ids:matched.map(s=>s.source_id),year_claims:claims,
    conflicts:years.length>1?[{field:'year',values:years,source_ids:claims.map(c=>c.source_id)}]:[],
    warning:'Las fuentes son ficticias y la coincidencia de nombres no prueba una identidad.'};
}
function creative(request,researchResult){
  const name=request.entity.display_name;
  return {role:'creative',provider:'mock',status:'draft_only',
    proposals:[
      {channel:'website',headline:'Conoce '+name,description:'Presentar identidad, propósito y fuentes aprobadas.'},
      {channel:'social',headline:'La historia de '+name,description:'Proponer un carrusel sujeto a verificación.'}
    ],flags:researchResult.conflicts.length?['No afirmar fechas contradictorias.']:[]};
}
function governance(researchResult){
  const blockers=['synthetic_sources_not_verified','public_consent_not_verified','registrar_not_connected'];
  if(researchResult.conflicts.length)blockers.push('conflicting_claims');
  return {role:'governance',provider:'deterministic',status:'human_review_required',
    blockers,may_assign_id:false,may_access_vault:false,may_publish:false,
    scope:'Gestión documental, no asesoría legal ni certificación de derechos.'};
}
function supervisor(request,researchResult,creativeResult,governanceResult){
  return {role:'supervisor',provider:'mock',status:'proposal_only',
    message:'Se preparó el expediente ficticio '+request.case_id+
      ' para '+request.entity.display_name+' con '+request.sources.length+' fuentes sintéticas.',
    evidence_refs:researchResult.matched_source_ids,
    draft_proposals:creativeResult.proposals.length,
    requires_review:governanceResult.status==='human_review_required',
    next_actions:['Verificar fuentes e identidad independientes.',
      'Resolver discrepancias y obtener consentimiento.',
      'Solicitar revisión humana de un expediente versionado.']};
}

export function runDemo(raw){
  const request=validated(raw);
  const r=research(request),c=creative(request,r),g=governance(r),s=supervisor(request,r,c,g);
  return {schema_version:1,mode:'synthetic_offline',assistant:'DEOS Assistant — laboratorio',
    case_id:request.case_id,architecture:'manager_with_specialists',
    roles:{supervisor:'mock',research:'mock',creative:'mock',governance:'deterministic'},
    model_calls:[],provider_calls:0,api_cost_usd:0,
    integrations:{openai:'not_connected',gemini:'not_connected',meta:'not_connected',vault:'not_connected'},
    response:s,specialists:{research:r,creative:c,governance:g},
    trace:[{step:1,role:'research'},{step:2,role:'creative'},
      {step:3,role:'governance'},{step:4,role:'supervisor'}],
    canonical_entity_id:null,publication:'not_authorized',human_review_required:true};
}
