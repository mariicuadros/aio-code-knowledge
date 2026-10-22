// Defense in depth for the reviewed synthetic suite, not a sandbox for arbitrary JS.
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import dns from 'node:dns';
import dgram from 'node:dgram';
import http2 from 'node:http2';
import { syncBuiltinESMExports } from 'node:module';
const denied = () => { throw new Error('offline_network_denied'); };
for (const [object,keys] of [
  [http,['request','get','createServer']], [https,['request','get','createServer']],
  [net,['connect','createConnection','createServer']], [net.Socket.prototype,['connect']],
  [tls,['connect','createServer']], [dgram,['createSocket']], [http2,['connect','createServer','createSecureServer']]
]) for(const key of keys) object[key]=denied;
for(const object of [dns,dns.promises]) for(const key of Object.keys(object))
  if(/^(resolve|lookup)/.test(key)) object[key]=denied;
Object.defineProperty(globalThis,'fetch',{value:denied,writable:false,configurable:false});
Object.defineProperty(globalThis,'WebSocket',{value:denied,writable:false,configurable:false});
syncBuiltinESMExports();
