import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,restore} from '../dist/chapter/state.mjs';
import {CONTRACT_TEMPLATES,BOREHOLE_SITES,acceptContract,startDrilling,advanceMeters,contractProgress,isContractComplete} from '../dist/mission3/contracts.mjs';
import {mission3Objectives} from '../dist/mission3/mission3-state.mjs';
import {pendingMessage,deliverMessage,acceptMission,confirmCompletion,activeNarrativeMission} from '../dist/chapter/narrative.mjs';
const at=Date.UTC(2026,10,7,12,0,0);

test('Intro contract uses 3 of 6 reserved boreholes, 90 metres and 3 minutes',()=>{
 const s=newGame('es','operator01',at);
 s.geoAnalysis={completed:true};s.personnel=[{role:'admin'},{role:'driller'}];
 s.drill={id:'rig_rc_compact',installedBit:'test-bit',installedHammer:'test-hammer'};
 s.mission3={phase:'drilling',currentObjective:4};
 const tpl=CONTRACT_TEMPLATES[0];
 assert.equal(BOREHOLE_SITES.length,6); // remaining locations reserved for later contracts
 assert.equal(tpl.boreholeCount,3);assert.equal(tpl.totalMeters,90);assert.equal(tpl.duration,180);
 acceptContract(s,tpl.id,at);
 assert.equal(s.boreholes.length,3);
 assert.deepEqual(s.boreholes.map(b=>b.id),['BH-01','BH-02','BH-03']);
 startDrilling(s,at);
 assert.equal(s.contract.drillingStartedAt,at);
 assert.equal(s.contract.duration,180);
 for(let i=0;i<3;i++){
  assert.equal(advanceMeters(s,30,at+20000*(i+1)),30);
  assert.equal(s.boreholes[i].status,'completed');
 }
 assert.equal(s.contract.metersCompleted,90);
 assert.equal(contractProgress(s).totalBoreholes,3);
 assert.equal(contractProgress(s).boreholesDone,3);
 assert(isContractComplete(s));
 assert(mission3Objectives(s)[3].checks.find(c=>c.id==='completeBoreholes').done);
});

test('A three-minute contract keeps its time limit intact across reload',()=>{
 const s=newGame('es','operator01',at);
 s.geoAnalysis={completed:true};s.personnel=[{role:'admin'},{role:'driller'}];
 s.drill={id:'rig_rc_compact',installedBit:'bit',installedHammer:'hammer'};
 acceptContract(s,'first-contract',at);
 startDrilling(s,at);
 s.contract._timerReset4=false; // legacy migration must not modify new contracts
 const loaded=restore(JSON.parse(JSON.stringify(s)),at+240000);
 assert.equal(loaded.contract.duration,180);
 assert.equal(loaded.contract.drillingStartedAt,at);
 assert.equal(loaded.boreholes.length,3);
});

test('Mission card appears on ACCEPT and hides on confirmed END; next start opens next mission',()=>{
 const s=newGame('es','operator01',at);s.introSeen=true;
 assert.equal(activeNarrativeMission(s),null);
 let msg=pendingMessage(s);assert.equal(msg.id,'n:m1:start');
 assert(deliverMessage(s,msg.id));assert(acceptMission(s,'m1'));
 assert.equal(activeNarrativeMission(s),'m1');
 const resumed=restore(JSON.parse(JSON.stringify(s)),at+2000);
 assert.equal(activeNarrativeMission(resumed),'m1');
 resumed.chapterCompletedAt=at+1000;
 msg=pendingMessage(resumed);assert.equal(msg.id,'n:m1:end');
 assert(deliverMessage(resumed,msg.id));
 assert.equal(activeNarrativeMission(resumed),'m1'); // pending close confirmation
 assert(confirmCompletion(resumed,'m1',at+3000));
 assert.equal(activeNarrativeMission(resumed),null);
 msg=pendingMessage(resumed);assert.equal(msg.id,'n:m2:start');
 assert(deliverMessage(resumed,msg.id));assert(acceptMission(resumed,'m2'));
 assert.equal(activeNarrativeMission(resumed),'m2');
});
