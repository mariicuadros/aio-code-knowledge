import { Alfa } from './core.mjs';import { SyntheticStore } from './store.mjs';import { EXAMPLES } from './catalog.mjs';
const directory=process.argv[2], alfa=new Alfa(new SyntheticStore(directory));
for(const user of ['A','B']){
 const entity='SYN-'+user+'-MAIN';let token=alfa.login(user), view=await alfa.view(token,entity);
 for(const text of EXAMPLES[user])view=await alfa.message(token,entity,text,view.memory.revision);
 alfa.logout(token);
 // New session and new store object read the same isolated disk snapshot.
 const resumed=new Alfa(new SyntheticStore(directory));token=resumed.login(user);
 view=await resumed.view(token,entity);const preview=await resumed.preview(token,entity);
 console.log(JSON.stringify({user,assistant:view.assistantName,tone:view.memory.preferences.tone.value,
   recovered_revision:view.memory.revision,draft:preview.data,binding:preview.binding,
   review:'pending_explicit_human_action',provider_calls:preview.simulation.usage.provider_calls},null,2));
}
