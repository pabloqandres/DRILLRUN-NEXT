import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceMeters,contractProgress,drillingComplete,drillingCompletedAt,isContractComplete,completeContract} from '../dist/mission3/contracts.mjs';

const T=Date.UTC(2026,10,9,14,0,0);
function state(){
 return {
  cash:1000,ledger:[],nextId:1,
  contract:{templateId:'first-contract',status:'active',duration:180,drillingStartedAt:T,
   totalMeters:90,metersCompleted:0,reward:60000,bonusSpeed:5000,bonusUnderBudget:8000,
   expenses:0,activeBoreholeIndex:0},
  drill:{state:'drilling',currentBorehole:'BH-01'},
  boreholes:[1,2,3].map(i=>({id:'BH-0'+i,position:{x:i,z:i},status:i===1?'active':'pending',
    depthTarget:30,depthDrilled:0,completedAt:null}))
 };
}
test('per-second 3000/3600 incremental drilling hits exactly 90 m and can be delivered',()=>{
 const s=state();
 for(let b=0;b<3;b++){
  let iterations=0;
  while(s.boreholes[b].status!=='completed'&&iterations++<100)
   advanceMeters(s,3000/3600,T+110000);
 }
 assert.deepEqual(s.boreholes.map(b=>b.status),['completed','completed','completed']);
 assert.equal(s.contract.metersCompleted,90);
 assert.equal(drillingComplete(s),true);
 assert.equal(isContractComplete(s),true);
 assert.equal(contractProgress(s).progress,1);
 assert.equal(drillingCompletedAt(s),T+110000);
});
test('existing 89.99999999999997-m save with all boreholes finished is valid',()=>{
 const s=state();
 s.boreholes.forEach((b,i)=>{b.depthDrilled=30;b.status='completed';b.completedAt=T+105000+i*1000});
 s.contract.metersCompleted=89.99999999999997;
 assert.equal(isContractComplete(s),true);
 assert.equal(contractProgress(s).metersCompleted,90);
 assert.equal(drillingCompletedAt(s),T+107000);
});
test('do not validate a genuine unfinished last borehole just because display rounds up',()=>{
 const s=state();
 s.boreholes.forEach(b=>{b.depthDrilled=30;b.status='completed'});
 s.boreholes[2].depthDrilled=29.99;
 s.boreholes[2].status='active';
 s.contract.metersCompleted=89.99;
 assert.equal(isContractComplete(s),false);
});
test('speed bonus uses physical completion time even if phone delivery happens later',()=>{
 const s=state();
 s.boreholes.forEach((b,i)=>{b.depthDrilled=30;b.status='completed';b.completedAt=T+105000+i*1000});
 s.contract.metersCompleted=89.99999999999997;
 const paid=completeContract(s,T+400000);
 assert.equal(paid.speedBonus,true);
 assert.equal(paid.reward,73000);
 assert.equal(s.cash,74000);
 assert.equal(s.ledger.filter(e=>e.key==='contractPayment').length,1);
 assert.throws(()=>completeContract(s,T+410000),/alreadyComplete/);
});
test('late physical drilling does not receive speed bonus',()=>{
 const s=state();
 s.boreholes.forEach((b,i)=>{b.depthDrilled=30;b.status='completed';b.completedAt=T+200000+i*1000});
 s.contract.metersCompleted=89.99999999999997;
 const paid=completeContract(s,T+400000);
 assert.equal(paid.speedBonus,false);
 assert.equal(paid.reward,68000);
});
