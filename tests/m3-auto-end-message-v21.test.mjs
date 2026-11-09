import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pendingMessage,deliverMessage,confirmCompletion} from '../dist/chapter/narrative.mjs';
import {mission3Objectives,updateMission3Phase} from '../dist/mission3/mission3-state.mjs';

function paidM3(){
 const time=Date.UTC(2026,10,9,14,0,0);
 return {
  cash:74000,ledger:[{id:1,key:'contractPayment',amount:73000,at:time}],nextId:2,
  office:{level:2,status:'built'},workshop:{status:'built'},
  hsec:{completedAt:time-10000,assets:[{type:'shed',status:'built'}]},
  mission3:{phase:'delivery',startedAt:time-100000,currentObjective:5,objectivesCompleted:[1,2,3,4],reportRead:true},
  contract:{status:'delivered',metersCompleted:90,totalMeters:90,deliveredAt:time},
  boreholes:Array.from({length:3},(_,i)=>({id:'BH-0'+(i+1),status:'completed',depthDrilled:30,depthTarget:30})),
  personnel:[{role:'admin'},{role:'driller'}],drill:{id:'rig01'},
  toolInventory:[{type:'bit'}],orders:[{status:'delivered'}],
  geoAnalysis:{requested:true,completed:true,reportAvailable:true},
  narrative:{messages:[{id:'n:m3:start',characterId:'contractAdmin',missionId:'m3',readAt:1,actionTaken:'accept'}],
  accepted:['m1','m2','m3'],rewardsCollected:['m1','m2']}
 };
}
test('M3 payout is followed by Camila closing message, never a second payout',()=>{
 const s=paidM3();
 updateMission3Phase(s);
 assert.equal(s.mission3.phase,'complete');
 assert.equal(mission3Objectives(s).every(g=>g.checks.every(c=>c.done)),true);
 assert.equal(pendingMessage(s)?.id,'n:m3:end');
 assert.equal(deliverMessage(s,'n:m3:end'),true);
 assert.equal(deliverMessage(s,'n:m3:end'),false);
 assert.equal(s.narrative.messages.filter(m=>m.id==='n:m3:end').length,1);
 const before=s.cash;
 const confirm=confirmCompletion(s,'m3');
 assert.equal(confirm.cash,0);
 assert.equal(s.cash,before);
 assert.equal(s.ledger.filter(l=>l.key==='contractPayment').length,1);
 assert.equal(confirmCompletion(s,'m3'),null);
 assert.equal(pendingMessage(s)?.id,'n:m4:start');
});
test('M3 closing conversation remains recoverable for preexisting unread saves',()=>{
 const s=paidM3();
 s.mission3.phase='complete';
 deliverMessage(s,'n:m3:end');
 const unread=s.narrative.messages.find(m=>m.id==='n:m3:end'&&!m.readAt&&!m.actionTaken);
 assert(unread);
 assert.equal(unread.characterId,'contractAdmin');
});
test('closing delivery is wired to immediate presentation in M3 contract action',async()=>{
 const {readFileSync}=await import('node:fs');
 const code=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert(code.includes("if(type==='completeContract'&&s.mission3?.phase==='complete')narrativeTick(1.5)"));
 assert(code.includes("const isM3Closing=msg.id==='n:m3:end'"));
 assert(code.includes("missedM3End=s.narrative.messages.find"));
});
