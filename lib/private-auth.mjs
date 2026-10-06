import { createHash, createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
const COOKIE = '__Host-aio_brain';
const equal = (a,b) => timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());
export const json = (body,status=200,extra={}) => new Response(JSON.stringify(body),{status,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
export function bearer(request,secret){const value=request.headers.get('authorization')||'';return Boolean(secret&&value.startsWith('Bearer ')&&equal(value.slice(7),secret));}
const signingKey=()=>process.env.AIO_INSIGHTS_ADMIN_TOKEN;
export function cookie(value,maxAge=3600){return COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+maxAge;}
export function session(now=Date.now()){
 const body=Buffer.from(JSON.stringify({exp:Math.floor(now/1000)+3600,nonce:randomBytes(16).toString('hex')})).toString('base64url');
 return body+'.'+createHmac('sha256',signingKey()).update(body).digest('base64url');
}
export function authorized(request,now=Date.now()){
 if(bearer(request,signingKey()))return true;
 if(!signingKey())return false;
 const token=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!token||token.length>1024)return false;
 const parts=token.split('.');if(parts.length!==2)return false;
 const expected=createHmac('sha256',signingKey()).update(parts[0]).digest('base64url');
 if(!equal(parts[1],expected))return false;
 try{const value=JSON.parse(Buffer.from(parts[0],'base64url'));return Number.isInteger(value.exp)&&value.exp>now/1000&&value.exp<=now/1000+3600;}catch{return false;}
}
export function sameOrigin(request){return request.headers.get('origin')===new URL(request.url).origin;}
