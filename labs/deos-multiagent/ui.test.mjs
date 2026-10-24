import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
class Element {
  constructor() {this.children=[];this.handlers={};this.style={};this.disabled=false;this.hidden=false;this.textContent='';}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  addEventListener(name,fn){this.handlers[name]=fn;}
  click(){if(!this.disabled)return this.handlers.click?.();}
}
test('UI requires explicit review after each run and renders exact synthetic content',async()=>{
  const elements=Object.fromEntries(['run','results','summary','review','specialists','audit','status'].map(id=>[id,new Element()]));
  globalThis.document={getElementById:id=>elements[id],createElement:()=>new Element()};
  try {
    await import('./ui.mjs');
    const [approve,details]=elements.results.children;
    assert.equal(approve.disabled,true);
    await elements.run.click();
    assert.equal(approve.disabled,false);assert.equal(elements.specialists.children.length,4);
    const first=JSON.parse(details.textContent);
    assert.ok(elements.review.textContent.includes(first.approval.content_hash));
    assert.ok(elements.status.textContent.includes('Pendiente'));
    approve.click();assert.equal(approve.disabled,true);
    assert.ok(elements.status.textContent.includes('siguen bloqueados'));
    const next=elements.run.click();assert.equal(approve.disabled,true);
    await next;assert.equal(approve.disabled,false);
    const second=JSON.parse(details.textContent);
    assert.equal(second.request.revision,2);assert.notEqual(second.approval.content_hash,first.approval.content_hash);
    assert.ok(elements.status.textContent.includes('Pendiente'));
  } finally {delete globalThis.document;}
});
test('browser entry declares deny-network CSP, noindex and local module only',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(html.includes("connect-src 'none'")); assert.ok(html.includes("form-action 'none'"));
  assert.ok(html.includes('noindex,nofollow'));assert.ok(html.includes('src="./ui.mjs"'));
  assert.ok(!/<script[^>]+src="https?:/.test(html));
});
