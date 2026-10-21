// Preload for reproducible offline backend tests. Mocks may replace fetch, but
// no accidental fallback can open a socket or use inherited Vault credentials.
import net from 'node:net';
import tls from 'node:tls';
import { syncBuiltinESMExports } from 'node:module';
const denied=()=>{throw new Error('External network forbidden in synthetic tests');};
net.Socket.prototype.connect=denied;
net.connect=denied;
net.createConnection=denied;
tls.connect=denied;
globalThis.fetch=denied;
for(const key of ['AIO_VAULT_READ_TOKEN','AIO_VAULT_WRITE_TOKEN','AIO_DASHBOARD_ADMIN_TOKEN']) delete process.env[key];
syncBuiltinESMExports();
