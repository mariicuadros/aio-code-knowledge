import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dir = new URL('../governance/', import.meta.url);
const inventory=JSON.parse(readFileSync(new URL('ECOSYSTEM-MASTER-REGISTER-20261018.json',dir),'utf8'));
const registry=readFileSync(new URL('ECOSYSTEM-MASTER-REGISTER-20261018.md',dir),'utf8');
const format=/^[a-f0-9]{40}$/;

test('official internal register defines DEOS without suggesting legal incorporation or Phase 2 closure',()=>{
 assert.equal(inventory.definition.category,'Digital Entity Operating System');
 assert.equal(inventory.definition.research_methodology_role,'internal_component');
 assert.equal(inventory.snapshot_scope.phase_2_complete,false);
 assert.equal(inventory.snapshot_scope.founder_formal_signoff_recorded,false);
 assert.match(inventory.document_class,/not_legal_registration/);
 assert.match(registry,/No.*registro mercantil|No.*es registro mercantil/i);
});

test('dated graph snapshot has six unique, explicitly named independent entities',()=>{
 const e=inventory.canonical_graph.entities;
 assert.equal(e.length,inventory.canonical_graph.node_count);
 assert.equal(new Set(e.map(x=>x.id)).size,6);
 assert.deepEqual(new Set(e.map(x=>x.id)),new Set(['OZCU-001','MC-001','AIO-001','NUX-001','VOID-001','DAN-001']));
 assert.deepEqual(inventory.snapshot_scope.frozen_core,['MC-001','AIO-001']);
 assert.equal(e.find(x=>x.id==='AIO-001').graph_type,'DigitalEntityOperatingSystem');
 assert.match(e.find(x=>x.id==='DAN-001').caveat,/independent/);
});

test('snapshot links four repositories and three immutable verified deployment source shas',()=>{
 assert.equal(new Set(inventory.github.repositories.map(x=>x.name)).size,inventory.github.unique_repository_count);
 assert.equal(inventory.github.repositories.length,5); // deployed + default branches for frontend
 assert.equal(inventory.github.repositories.find(x=>x.name==='aio-code-vault').visibility,'private');
 assert.equal(inventory.vercel.primary_project_count,inventory.vercel.projects.length);
 for(const p of inventory.vercel.projects){
   assert.match(p.deployed_sha,format);
   assert.equal(p.state,'READY');
   assert.ok(p.deployment_id.startsWith('dpl_'));
 }
 for(const g of inventory.github.repositories)assert.match(g.observed_sha,format);
});

test('snapshots do not misrepresent release, legal permissions or complete security',()=>{
 assert.equal(inventory.entity_console.automatic_publication_implemented,false);
 assert.equal(inventory.entity_console.canonical_id_registration_implemented,false);
 assert.equal(inventory.entity_console.remote_csrf_complete,false);
 assert.equal(inventory.entity_console.multi_tenant_verified,false);
 assert.equal(inventory.hugging_face.datasets.length,2);
 assert.equal(inventory.hugging_face.datasets.find(x=>x.id.endsWith('aio-code-journal')).full_append_only_history_verified,false);
 assert.equal(inventory.rag.third_party_ai_recognition_claim,false);
 assert.equal(inventory.safety.no_private_vault_content,true);
 assert.match(registry,/14\/49/);
});

test('dated human/machine sources and handoff are internally consistent',()=>{
 assert.equal(inventory.human_source,'governance/ECOSYSTEM-MASTER-REGISTER-20261018.md');
 assert.equal(inventory.rag.source_count,19);
 assert.equal(inventory.rag.passage_count,189);
 assert.equal(inventory.rag.reviewed_claim_count,11);
 assert.equal(inventory.entity_console.negative_probe_positive_checks,9);
 assert.equal(inventory.hugging_face.export_source_count,30);
 assert.equal(inventory.codex_handoff.authorization,'open_pr_only_no_merge_no_deploy');
 assert.ok(inventory.open_issues.some(x=>x.number===10&&x.repo==='aio-code-frontend'));
});
