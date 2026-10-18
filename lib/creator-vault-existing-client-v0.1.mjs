// Explicit opt-in factory for existing GitHub Vault client primitives.
// Creating this object does not fetch or write. No Vercel route imports this factory.
import {state,textBlob,commitFiles} from './vault-client.mjs';
import {createCreatorVaultBridge} from './creator-vault-bridge-v0.1.mjs';
export function createCreatorVaultFromExistingClient({readToken,writeToken=null}={}){
 return createCreatorVaultBridge({transport:{state,textBlob,commitFiles},readToken,writeToken});
}
