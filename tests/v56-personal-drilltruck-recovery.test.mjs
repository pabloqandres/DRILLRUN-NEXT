import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 personalTruck,deliverPersonalTruck,restoreMissingPersonalTruck,repairPersonalTruckPose,
 recoverPersonalTruckToBay,personalTruckAtPlayableLocation,PERSONAL_TRUCK_MAX_SPEED
} from '../dist/mission5/personal-drilltruck.mjs';
import {FLEET_BAYS} from '../dist/mission5/fleet-base.mjs';
import {mission5Objectives} from '../dist/mission5/patio-staff.mjs';
import {FaenaCenterUI} from '../dist/chapter/faena-center.mjs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const state=()=>({
 mission5:{status:'operational',commissionedAt:1000,hsecApproved:true},
 narrative:{accepted:['m5'],rewardsCollected:['m5']},
 orders:[],cash:28110,bank:1000,ledger:[{id:1,key:'personalTruckPaid',amount:-12000,at:1000}],
 nextId:44,position:{x:-9,z:1},inside:false
});
test('V56 M5 paid-completion evidence restores lost ownership without new charge or reward',()=>{
 const s=state(),initialCash=s.cash,ledgerLength=s.ledger.length;
 assert.equal(restoreMissingPersonalTruck(s,2000),true);
 assert.equal(personalTruck(s).id,'drilltruck-personal-02');
 assert.deepEqual(personalTruck(s).position,{x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z});
 assert.equal(restoreMissingPersonalTruck(s,3000),false);
 assert.equal(s.cash,initialCash);
 assert.equal(s.ledger.length,ledgerLength);
 assert.equal(s.mission5.commissionedAt,1000);
});
test('V56 incomplete M5 and missing paid delivery never get a free truck',()=>{
 const s=state();
 delete s.mission5.commissionedAt;
 assert.equal(restoreMissingPersonalTruck(s),false);
 assert.equal(personalTruck(s),null);
 s.mission5.commissionedAt=1000;
 s.narrative.rewardsCollected=[];
 assert.equal(restoreMissingPersonalTruck(s),false);
});
test('V56 recover EXISTING truck wherever parked to P01, without touching finances',()=>{
 const s=state(),cash=s.cash,bank=s.bank,ledger=structuredClone(s.ledger),initialPosition={...s.position};
 deliverPersonalTruck(s,2000);
 const truck=personalTruck(s);
 truck.position={x:-69,z:-31};truck.heading=-1.2;truck.mode='parked';truck.speed=0;
 const recovered=recoverPersonalTruckToBay(s,5000);
 assert.equal(recovered,truck);
 assert.equal(truck.mode,'parked');assert.equal(truck.speed,0);
 assert.deepEqual(truck.position,{x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z});
 assert.equal(truck.heading,FLEET_BAYS.personalTruck.heading);
 assert.deepEqual(s.position,initialPosition);
 assert.equal(s.cash,cash);assert.equal(s.bank,bank);assert.deepEqual(s.ledger,ledger);
 assert.equal(s.mission5.commissionedAt,1000);
});
test('V56 recovery of saved parked car cannot silently charge for or duplicate it',()=>{
 const s=state();deliverPersonalTruck(s,2000);
 const first=personalTruck(s);
 for(let i=0;i<3;i++)recoverPersonalTruckToBay(s,3000+i);
 assert.strictEqual(personalTruck(s),first);
 assert.equal(s.cash,28110);
});
test('V56 out-of-map saved pose self-heals while a legitimate far-away car is preserved',()=>{
 const s=state();deliverPersonalTruck(s,2000);
 s.mission5.personalTruck.position={x:-70,z:-32};
 assert.equal(repairPersonalTruckPose(s),false);
 assert.deepEqual(personalTruck(s).position,{x:-70,z:-32});
 s.mission5.personalTruck.position={x:-555,z:999};
 assert.equal(personalTruckAtPlayableLocation(personalTruck(s)),false);
 assert.equal(repairPersonalTruckPose(s,4000),true);
 assert.deepEqual(personalTruck(s).position,{x:FLEET_BAYS.personalTruck.x,z:FLEET_BAYS.personalTruck.z});
 assert.equal(personalTruck(s).mode,'parked');
});
test('V56 unit while driven cannot be repossessed at speed, but can recover when stopped',()=>{
 const s=state();deliverPersonalTruck(s,2000);
 const truck=personalTruck(s);truck.mode='driving';truck.speed=2.2;
 assert.throws(()=>recoverPersonalTruckToBay(s),/stopFirst/);
 assert.equal(truck.mode,'driving');
 truck.speed=0;
 recoverPersonalTruckToBay(s,5000);
 assert.equal(truck.mode,'parked');
 assert.deepEqual(s.position,{x:FLEET_BAYS.personalTruck.x-3.8,z:FLEET_BAYS.personalTruck.z});
});
test('V56 game always has a temporary visual before the official GLB loads',()=>{
 const game=src('dist/chapter/game.mjs');
 assert.match(game,/const officialReady=!!m4DrillTruckModel\?\.children\?\.length/);
 assert.match(game,/m4DrillTruckModel\.clone\(true\):createProceduralTruck\(\)/);
 assert.match(game,/m5PersonalTruckFallback&&officialReady/);
 assert.match(game,/restoreMissingPersonalTruck\(value\);repairPersonalTruckPose\(value\);/);
 assert.match(game,/restoreMissingPersonalTruck\(s\);repairPersonalTruckPose\(s\);/);
 assert.match(game,/m5PersonalTruckModel\.position\.set\(truck\.position\.x,\.12,truck\.position\.z\)/);
});
test('V56 both Fleet and Patio have an explicit locator and P01 retrieval',()=>{
 const s=state();deliverPersonalTruck(s,2000);
 const view=Object.create(FaenaCenterUI.prototype);
 const t=k=>k,fmt=n=>String(n),icon=k=>'<i>'+k+'</i>';
 view.view='';view.route='fleet';
 const fleet=view.pageHtml(s,t,fmt,icon);
 assert.match(fleet,/data-faena-personal-locate/);
 assert.match(fleet,/data-faena-personal-recover/);
 assert.match(fleet,/Recuperar en plaza P01/);
 view.route='patio';
 const patio=view.pageHtml(s,t,fmt,icon);
 assert.match(patio,/data-faena-personal-locate/);
 const game=src('dist/chapter/game.mjs');
 assert.match(game,/onLocatePersonalTruck:locatePersonalTruckInWorld/);
 assert.match(game,/onRecoverPersonalTruck:recoverPersonalTruckFromFaena/);
 assert.match(game,/world\.chapterCamera=view/);
});

test('V57 Faena Center actually wires Locate and Recover callbacks at construction',()=>{
 let located=0,recovered=0,rendered=0,closed=0;
 const host={
  addEventListener(){},contains(){return true},
  classList:{contains:()=>false,add:()=>{closed++;}}
 };
 const ui=new FaenaCenterUI({
  host,state:()=>state(),translate:()=>x=>x,format:String,icon:x=>x,
  onLocatePersonalTruck:()=>{located++;},
  onRecoverPersonalTruck:()=>{recovered++;}
 });
 ui.render=()=>{rendered++;};
 const event=attr=>({target:{closest:()=>({
  disabled:false,dataset:{},hasAttribute:name=>name===attr
 })}});
 ui.handle(event('data-faena-personal-recover'));
 assert.equal(recovered,1,'Recovery must execute saved-state movement');
 assert.equal(rendered,1,'Recovery must refresh visible vehicle location');
 ui.handle(event('data-faena-personal-locate'));
 assert.equal(located,1,'Locate must activate camera flyover');
 assert.equal(closed,1,'Locate must leave the Faena overlay to show the truck');
});
