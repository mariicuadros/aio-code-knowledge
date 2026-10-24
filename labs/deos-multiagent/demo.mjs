import { createOrchestrator } from './orchestrator.mjs';
import { demoRequest } from './fixtures.mjs';
// CLI intentionally stops before approval; a model cannot approve its own output.
console.log(JSON.stringify(await createOrchestrator().run(demoRequest), null, 2));
