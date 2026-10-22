// Only local listeners registered by synthetic tests may receive HTTP requests.
import http from 'node:http';import https from 'node:https';import net from 'node:net';import tls from 'node:tls';
import dns from 'node:dns';import dgram from 'node:dgram';import http2 from 'node:http2';
import { syncBuiltinESMExports } from 'node:module';
const origins=new Set(),ports=new Set();const deny=()=>{throw Error('outbound_denied');};
export function allowTestOrigin(origin){const u=new URL(origin);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1')deny();origins.add(u.origin);ports.add(Number(u.port));}
const originalFetch=globalThis.fetch;
globalThis.fetch=(url,options)=>{const u=new URL(url);if(!origins.has(u.origin))deny();return originalFetch(url,{...options,redirect:'error'});};
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){const a=Array.isArray(args[0])?args[0][0]:args[0];
 const port=typeof a==='object'?Number(a.port):Number(a),host=typeof a==='object'?a.host:args[1];
 if(host!=='127.0.0.1'||!ports.has(port))deny();return connect.apply(this,args);};
http.request=deny;http.get=deny;https.request=deny;https.get=deny;tls.connect=deny;dgram.createSocket=deny;http2.connect=deny;
for(const o of [dns,dns.promises])for(const k of Object.keys(o))if(/^(resolve|lookup)/.test(k))o[k]=deny;
dns.lookup=(host,...args)=>{if(host!=='127.0.0.1')deny();const callback=args.at(-1),all=args[0]?.all;
 queueMicrotask(()=>all?callback(null,[{address:host,family:4}]):callback(null,host,4));};
globalThis.WebSocket=deny;syncBuiltinESMExports();
