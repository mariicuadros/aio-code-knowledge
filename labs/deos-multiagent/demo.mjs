import {runDemo} from './orchestrator.mjs';
import {syntheticCase} from './fixtures.mjs';
process.stdout.write(JSON.stringify(runDemo(syntheticCase),null,2)+'\n');
