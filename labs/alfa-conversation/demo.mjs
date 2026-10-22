import {Alfa} from '../alfa-core/core.mjs';import {SyntheticStore} from '../alfa-core/store.mjs';import {Conversation} from './conversation.mjs';
const alfa=new Alfa(new SyntheticStore(process.argv[2])),c=new Conversation(alfa);
for(const [user,message] of [['A','Soy cantante y quiero preparar un lanzamiento. Llámate Luna, usa tono informal.'],['B','Soy emprendedor, busco definir mi oferta. Llámate Atlas y usa tono formal.']]){
 const token=alfa.login(user),entity='SYN-'+user+'-MAIN',consent=await c.prepare(token,entity,message);
 // Simulated consent for reproducible tests only; UI requires a human button click.
 const result=await c.respond(token,entity,{hash:consent.hash,consent:true});
 console.log(JSON.stringify({user,reply:result.reply,proposals:result.changes,usage:result.usage,applied:false},null,2));c.logout(token);
}
