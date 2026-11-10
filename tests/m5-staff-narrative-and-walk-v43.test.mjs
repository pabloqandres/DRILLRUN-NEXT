import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {placeMachineryOrder,tickDeliveries} from '../dist/mission3/headquarters.mjs';
import {PERSONAL_DRILLTRUCK_MODEL,PERSONAL_DRILLTRUCK_PRICE} from '../dist/mission5/personal-drilltruck.mjs';
import {PATIO_L1,startPatio,finishPatio,patioCanStart} from '../dist/mission5/patio-state.mjs';
import {PATIO_STAFF,hirePatioStaff,hiredPatioStaff,inspectPatioGate,inspectPatioWarehouse,mission5Objectives} from '../dist/mission5/patio-staff.mjs';
import {pendingMessage,deliverMessage,acceptMission,confirmCompletion} from '../dist/chapter/narrative.mjs';
import {npcWaypoints} from '../dist/mission5/patio-npc-world.mjs';
import {probeM5Assets} from '../dist/mission5/assets-ready.mjs';
// Test fixture models the deployment after both approved binary assets are uploaded.
before(async()=>{
 const old=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,headers:{get:key=>key==='content-length'?'1006040':'model/gltf-binary'}});
 try{assert.equal(await probeM5Assets(),true);}finally{globalThis.fetch=old;}
});
const at=Date.UTC(2026,10,10,13);
const fixture=()=>{const s=newGame('es','operator01',at);
 s.cash=120000;s.mission4={phase:'complete',drillTruck:{id:'drilltruck-01',state:'parked'}};s.narrative={messages:['m1','m2','m3','m4'].flatMap(mid=>['start','end'].map(part=>({id:'n:'+mid+':'+part,missionId:mid,characterId:'benefactor',deliveredAt:at-5000,readAt:at-3000,actionTaken:part==='start'?'accept':'collect'}))),accepted:['m1','m2','m3','m4'],rewardsCollected:['m1','m2','m3','m4']};return s;};
test('M5 opens only after player confirms M4 SMS; no automatic paid building',()=>{
 const s=fixture();const before=s.cash;
 assert.equal(pendingMessage(s)?.id,'n:m5:start');
 assert.equal(patioCanStart(s),'needsMission5');
 assert.equal(s.cash,before);assert(!s.mission5,'M5 was not purchased automatically');
 assert(deliverMessage(s,'n:m5:start'));
 assert(acceptMission(s,'m5'));
 assert.equal(patioCanStart(s),null);
});
test('M5 completion demands construction, paid staff, inspections and a delivered second truck',()=>{
 const s=fixture();deliverMessage(s,'n:m5:start');acceptMission(s,'m5');
 startPatio(s,at);
 assert.equal(s.cash,120000-PATIO_L1.price);
 assert.equal(pendingMessage(s),null);
 assert.equal(finishPatio(s,at+1200000),true);
 assert.equal(s.mission5.status,'operational');
 assert.equal(s.mission5.commissionedAt,undefined);
 assert.equal(pendingMessage(s),null,'No closing SMS just for constructing');
 hirePatioStaff(s,PATIO_STAFF[0].id,at+1200001);
 assert.throws(()=>hirePatioStaff(s,PATIO_STAFF[0].id),/alreadyHired/);
 assert.equal(hiredPatioStaff(s,PATIO_STAFF[0].id),true);
 assert.equal(s.mission5.commissionedAt,undefined);
 hirePatioStaff(s,PATIO_STAFF[1].id,at+1200002);
 inspectPatioGate(s,at+1200003);
 assert.equal(s.mission5.commissionedAt,undefined);
 const report=inspectPatioWarehouse(s,at+1200004);
 assert.equal(report.total,0,'No fabricated tools');
 assert.equal(s.mission5.commissionedAt,undefined,'Personal truck must arrive before commissioning');
 assert.equal(mission5Objectives(s).filter(x=>x.done).length,5);
 assert.equal(pendingMessage(s),null,'Closing SMS waits for second vehicle');
 placeMachineryOrder(s,'drillTruckPersonal',PERSONAL_DRILLTRUCK_MODEL,PERSONAL_DRILLTRUCK_PRICE,at+1200005);
 const delivered=tickDeliveries(s,at+1200005+180000);
 assert.equal(delivered.delivered,1);
 assert.equal(s.mission5.commissionedAt,at+1200005+180000);
 assert.equal(mission5Objectives(s).filter(x=>x.done).length,6);
 assert.equal(pendingMessage(s).id,'n:m5:end');
 assert(deliverMessage(s,'n:m5:end'));
 const cash=s.cash,confirmed=confirmCompletion(s,'m5',at+1200005);
 assert.equal(confirmed.number,5);
 assert.equal(confirmed.cash,12000,'Approved M5 commissioning bonus');
 assert.equal(s.cash,cash+12000);
 assert.equal(s.ledger.filter(e=>e.key==='m5CommissioningReward').length,1);
 assert.equal(pendingMessage(s),null);
});
test('M5 hires are one-time unique charges; no GLB or HSEC clones',()=>{
 const s=fixture();s.narrative.accepted.push('m5');s.mission5={status:'operational'};
 const before=s.cash;
 for(const def of PATIO_STAFF)hirePatioStaff(s,def.id,at);
 assert.equal(before-s.cash,PATIO_STAFF.reduce((n,p)=>n+p.cost,0));
 assert.equal(Object.keys(s.mission5.staff).length,2);
 assert.equal(s.ledger.filter(e=>e.key==='m5Personnel').length,2);
 for(const def of PATIO_STAFF){
  assert(npcWaypoints(def.id).length>=5);
  assert(!def.asset.includes('hsec-npc'));
 }
});
test('Original GLB geometry uses procedural GPU skinning and distance-driven stride',()=>{
 const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const rig=load('dist/mission5/npc-locomotion.mjs');
 const world=load('dist/mission5/patio-npc-world.mjs');
 assert.match(rig,/new T\.SkinnedMesh\(/);
 assert.match(rig,/new T\.Skeleton\(bones\)/);
 assert.match(rig,/travel\/this\.cycleDistance/);
 assert.match(rig,/geo\.setAttribute\('skinIndex'/);
 assert.match(world,/hiredPatioStaff\(s,def\.id\)/);
 assert.match(world,/npc\.rig\.update\(delta,now,moved\)/);
 assert.match(world,/this\.world\.isBlocked\(nx,nz/);
});
