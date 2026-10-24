import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { get } from 'node:https';
import { connect } from 'node:net';
import { lookup } from 'node:dns';
test('runner denies network, writes, subprocesses and reading outside fixtures',()=>{
  assert.equal(process.permission?.has('fs.write'),false);
  assert.throws(()=>fetch('https://example.invalid/'),/offline_network_denied/);
  assert.throws(()=>get('https://example.invalid/'),/offline_network_denied/);
  assert.throws(()=>connect(443,'example.invalid'),/offline_network_denied/);
  assert.throws(()=>lookup('example.invalid'),/offline_network_denied/);
  assert.throws(()=>writeFileSync(new URL('./must-not-exist',import.meta.url),'synthetic'),/Access/);
  assert.throws(()=>readFileSync(new URL('../../package.json',import.meta.url)),/Access/);
  assert.throws(()=>spawnSync(process.execPath,['-e','0']),/Access/);
  assert.equal(process.env.OPENAI_API_KEY,undefined); assert.equal(process.env.GEMINI_API_KEY,undefined);
});
