import { authorized, json } from '../lib/private-auth.mjs';
import { state, accountRecords } from '../lib/vault-client.mjs';
export async function GET(request){
 if(!authorized(request))return json({status:'unauthorized'},401);
 const token=process.env.AIO_VAULT_READ_TOKEN;
 if(!token)return json({status:'vault_not_configured'},503);
 try{
  const snapshot=await state(token),records=await accountRecords(snapshot,token);
  return json({generated_at:new Date().toISOString(),records,mode:'verified_private_records',source_commit:snapshot.head});
 }catch{return json({status:'vault_verification_failed'},503);}
}
