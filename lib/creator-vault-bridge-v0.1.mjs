// Phase 2 integration seam for Vault client primitives.
// Deliberately requires injected transport; it does not import live GitHub credentials,
// register API routes, or trigger network operations on its own.
import {CreatorVaultAdapter} from './creator-vault-adapter-v0.1.mjs';
export function createCreatorVaultBridge({transport,readToken,writeToken=null}={}){
 if(!transport||typeof transport.state!=='function'||typeof transport.textBlob!=='function'||typeof transport.commitFiles!=='function')throw Error('invalid_vault_transport');
 if(typeof readToken!=='string'||!readToken)throw Error('read_credential_required');
 return new CreatorVaultAdapter({
  readSnapshot:token=>transport.state(token),
  readBlob:(sha,token)=>transport.textBlob(sha,token),
  commit:(token,files,message,marker,preflight)=>transport.commitFiles(token,files,message,marker,preflight),
  readToken,writeToken
 });
}
