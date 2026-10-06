import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
const METRICS=['reach','views','total_interactions'];
const DEFINITIONS={
 reach:'Meta account reach; unique accounts reached in the provider aggregation.',
 views:'Meta account views; views or displays in the provider aggregation.',
 total_interactions:'Meta account total content interactions in the provider aggregation.'
};
const ID=/^[A-Za-z0-9][A-Za-z0-9_.-]{0,159}$/;
const SECRET=/^(access_token|ig_long_token|authorization|password|api_key|secret|aio_insights_admin_token)$/i;
export function require(condition,message){if(!condition)throw new Error(message);}
export function safeObject(value){
 if(Array.isArray(value))value.forEach(safeObject);
 else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value)){require(!SECRET.test(k),'Credential field');safeObject(v);}
}
function utc(value){require(typeof value==='string'&&/(Z|\+00:00)$/.test(value)&&Number.isFinite(Date.parse(value)),'UTC time required');return Date.parse(value);}
function metric(value,definition,source,present){
 if(present&&value!==null)require(typeof value==='number'&&Number.isFinite(value)&&value>=0,'Invalid observed metric');
 return {value:present?value:null,state:present?(value===null?'not_available':'observed'):'not_collected',unit:'count',definition,source_ref:source};
}
export function normalize(raw,source,entity,owner,recordedAt=new Date().toISOString()){
 const body=JSON.parse(raw);safeObject(body);require(body.status==='ok','Successful response required');
 require(ID.test(entity)&&ID.test(owner),'Entity mapping required');
 require(/^phase-2\/analytics\/snapshots\/instagram\/[A-Za-z0-9_.-]+\.json$/.test(source),'Private evidence path required');
 const account=body.account;require(typeof account?.id==='string'&&/^\d+$/.test(account.id),'Account ID required');
 require(typeof account.username==='string'&&account.username.trim(),'Username required');
 const captured=utc(body.fetched_at);require(captured<=utc(recordedAt),'Record predates capture');
 const request=body.request;require(request?.period==='day'&&request.metric_type==='total_value','Unsupported aggregation');
 require(Array.isArray(request.metrics)&&request.metrics.length&&request.metrics.every(m=>METRICS.includes(m)),'Unsupported metrics');
 const since=request.since??null,until=request.until??null;
 const window={status:'provider_default_unconfirmed',start:null,end:null,provider_boundary_semantics:'unconfirmed',provider_end_times:[]};
 if(since!==null||until!==null){
  require(Number.isInteger(since)&&Number.isInteger(until)&&since>=0&&since<until&&until*1000<=captured,'Invalid interval');
  const start=new Date(since*1000).toISOString(),end=new Date(until*1000).toISOString(),meta=body.measurement_window;
  require(meta?.scope==='account'&&meta.status==='explicit_requested'&&isDeepStrictEqual(meta.requested,{since,until,start_utc:start,end_utc:end}),'Conflicting window metadata');
  require(Array.isArray(meta.provider_end_times)&&meta.provider_end_times.every(t=>typeof t==='string'),'Invalid provider times');
  Object.assign(window,{status:'explicit_requested',start,end,provider_end_times:meta.provider_end_times});
 }
 const digest=createHash('sha256').update(raw).digest('hex'),values={};
 require(Array.isArray(body.insights),'Insights list required');
 for(const item of body.insights){
  const name=item.name;require(request.metrics.includes(name)&&!Object.hasOwn(values,name),'Unexpected metric');
  require(item.period===request.period,'Period mismatch');const total=item.total_value;
  require(total==null||typeof total==='object'&&!Array.isArray(total),'Invalid total');
  const present=Boolean(total&&Object.hasOwn(total,'value'));
  values[name]=metric(present?total.value:null,item.description||DEFINITIONS[name],source,present);
 }
 for(const name of METRICS)if(!Object.hasOwn(values,name))values[name]=metric(null,DEFINITIONS[name],source,false);
 require(typeof body.graph_api_version==='string'&&/^v[0-9]+[.][0-9]+$/.test(body.graph_api_version),'Graph version required');
 return {record_type:'account_performance_observation',schema_version:'phase2-1.0.0',
 observation_id:'ACCOUNT-'+digest,entity_id:entity,owner,visibility:'private',platform:'instagram',
 account_id:account.id,username:account.username,captured_at:body.fetched_at,recorded_at:recordedAt,
 source_ref:source,source_sha256:digest,graph_api_version:body.graph_api_version,request,
 measurement_window:window,metrics:values,account_state_at_capture:Object.fromEntries(
 ['followers_count','media_count'].map(name=>[name,metric(Object.hasOwn(account,name)?account[name]:null,
 'Current account '+name+' at capture, not historical interval state.',source,Object.hasOwn(account,name))])),
 limitations:['Account scope; no publication attribution.',
 'Requested bounds do not independently confirm provider boundary semantics.',
 'No causal effect or entity recognition inferred from these metrics.']};
}
export function verify(record,raw){
 const expected=normalize(raw,record.source_ref,record.entity_id,record.owner,record.recorded_at);
 require(isDeepStrictEqual(record,expected),'Record differs from evidence');return record;
}
