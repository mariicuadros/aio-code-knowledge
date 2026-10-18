import test from 'node:test';
import assert from 'node:assert/strict';
import {createCreatorVaultFromExistingClient} from '../lib/creator-vault-existing-client-v0.1.mjs';
test('real Vault client functions can be wired without network access',()=>{
 const bridge=createCreatorVaultFromExistingClient({readToken:'fictional-local-test-token'});
 assert.equal(typeof bridge.latest,'function');
 assert.equal(typeof bridge.append,'function');
 assert.equal(bridge.writeToken,null);
});
test('real-client bridge refuses missing read token',()=>{
 assert.throws(()=>createCreatorVaultFromExistingClient(),/read_credential_required/);
});
test('real-client bridge fails closed on write without explicit token',async()=>{
 const bridge=createCreatorVaultFromExistingClient({readToken:'fictional-local-test-token'});
 await assert.rejects(bridge.append({key:'CASE-001',revision:1}),/write_disabled/);
});
