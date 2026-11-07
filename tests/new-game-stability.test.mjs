import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,restore,startOffice,tick} from '../dist/chapter/state.mjs';
import {CLEARABLES,INTRO_VARIANTS,SHARED_INTRO_VIDEO} from '../dist/chapter/config.mjs';
import {startModule,accelerate,useOfficeComputer} from '../dist/chapter/state.mjs';
import {ensureHsec,tickHsec,buildAsset,evaluation} from '../dist/hsec/state.mjs';
import {suggestedPose} from '../dist/hsec/layout.mjs';
import {confirmCompletion} from '../dist/chapter/narrative.mjs';
import {placeMachineryOrder,placeOrder,tickDeliveries,reconcileDeliveredMachinery} from '../dist/mission3/headquarters.mjs';
import {restoreMission3} from '../dist/mission3/tick.mjs';
import {mission4Objectives} from '../dist/mission4/mission4-state.mjs';

const at=Date.UTC(2026,10,7,9,0,0);

test('M1 reward remains pending after save and can be collected only once',()=>{
 const s=newGame('es','operator01',at);
 s.chapterCompletedAt=at;
 s.narrative.accepted=['m1'];
 s.narrative.messages=[{id:'n:m1:start',actionTaken:'accept',actions:[]},
                       {id:'n:m1:end',actionTaken:null,actions:[{type:'collect'}]}];
 const loaded=restore(JSON.parse(JSON.stringify(s)),at+2000);
 assert.equal(loaded.cash,5000);
 assert.deepEqual(loaded.narrative.rewardsCollected,[]);
 assert.equal(confirmCompletion(loaded,'m1',at+2500).cash,5000);
 assert.equal(loaded.cash,10000);
 assert.equal(confirmCompletion(loaded,'m1',at+2600),null);
 assert.equal(loaded.cash,10000);
 const again=restore(JSON.parse(JSON.stringify(loaded)),at+3000);
 assert.equal(again.cash,10000);
 assert.equal(again.ledger.filter(l=>l.key==='missionReward').length,1);
});

test('paid machinery arrives in save state, not only via a scene event',()=>{
 const s=newGame('es','operator01',at);s.cash=50000;
 s.mission3={phase:'equip',objectivesCompleted:[],currentObjective:3};
 placeMachineryOrder(s,'drill','rig_rc_compact',12000,at);
 assert.equal(s.drill,null);
 assert.equal(s.orders.length,1);
 const first=tickDeliveries(s,at+181000);
 assert.equal(first.machineryDelivered.length,1);
 assert.equal(s.drill.id,'rig_rc_compact');
 assert.equal(s.orders[0].status,'delivered');
 assert.equal(tickDeliveries(s,at+182000).machineryDelivered.length,0);
 assert.equal(s.drill.id,'rig_rc_compact');
 assert.deepEqual(reconcileDeliveredMachinery(s),[]);
});

test('delivery during offline restore becomes owned equipment',()=>{
 const s=newGame('es','operator01',at);s.cash=50000;
 s.mission3={phase:'equip',objectivesCompleted:[],currentObjective:3};
 placeMachineryOrder(s,'drill','rig_rc_compact',12000,at);
 s.savedAt=at+1000;
 const loaded=restore(JSON.parse(JSON.stringify(s)),at+181000);
 restoreMission3(loaded,at+181000);
 assert.equal(loaded.drill?.id,'rig_rc_compact');
 assert.equal(loaded.orders[0].status,'delivered');
 const cash=loaded.cash;
 restoreMission3(loaded,at+182000);
 assert.equal(loaded.cash,cash);
 assert.equal(reconcileDeliveredMachinery(loaded).length,0);
});

test('old consumed machine orders can restore a missing paid rig without charging again',()=>{
 const s=newGame('es','operator01',at);s.cash=20000;
 s.mission3={phase:'equip',objectivesCompleted:[],currentObjective:3};
 s.orders=[{id:'order-legacy',status:'delivered',consumed:true,items:[{type:'drill',model:'rig_rc_compact',qty:1,category:'machinery'}]}];
 assert.deepEqual(reconcileDeliveredMachinery(s,at),['drill']);
 assert.equal(s.drill.id,'rig_rc_compact');
 assert.equal(s.cash,20000);
 assert.deepEqual(reconcileDeliveredMachinery(s,at),[]);
});

test('PUMA DTH consumables use the same dispatched Casa Matriz pipeline',()=>{
 const s=newGame('es','operator01',at);s.cash=20000;
 s.drill={id:'rig_rc_compact'};
 placeOrder(s,[{type:'hammer',model:'puma-dth-6',qty:1,unitPrice:6500}],at);
 assert.equal(s.toolInventory.length,0);
 tickDeliveries(s,at+121000);
 assert.equal(s.toolInventory.length,1);
 assert.equal(s.toolInventory[0].model,'puma-dth-6');
 assert.equal(s.orders[0].status,'delivered');
});

test('first automated production no longer requires converting six zones',()=>{
 const s=newGame('es','operator01',at);
 s.workshop.level=2;
 s.mission4={phase:'production',zones:[{id:'BH-01',status:'producing'}],productionCycles:1,productionDrill:{id:'rig_dth_production',installedHammer:'x',installedBit:'y',assignedZone:'BH-01'},drillTruck:{id:'drilltruck-01',assignedZone:'BH-01'}};
 const last=mission4Objectives(s).at(-1);
 assert.equal(last.checks.length,2);
 assert(last.checks.every(x=>x.done));
});

test('Office L1 automatically installs the complete workstation without Office Store',()=>{
 const s=newGame('es','operator01',at);
 s.cleared=CLEARABLES.map(o=>o.id);
 startOffice(s,'office01',at);
 tick(s,at+601000);
 assert.equal(s.office.status,'built');
 assert.deepEqual(s.inventory.map(i=>i.product).sort(),['archive','chair','computer','desk','lamp'].sort());
 assert.equal(s.furniture.length,5);
 assert.equal(s.cash,2000);
});

test('All selectable avatars retain the single approved Avatar 1 intro film',()=>{
 assert.deepEqual(Object.keys(INTRO_VARIANTS).sort(),['operator01','operator02','operator03','operator04']);
 assert(Object.values(INTRO_VARIANTS).every(v=>v.video===SHARED_INTRO_VIDEO));
});

test('Casa Matriz reserves workshop capacity before order delivery',()=>{
 const s=newGame('es','operator01',at);s.cash=50000;s.drill={id:'rig_rc_compact'};
 placeOrder(s,[{type:'bit',model:'dome-4',qty:8,unitPrice:450}],at);
 assert.throws(()=>placeOrder(s,[{type:'bit',model:'dome-4',qty:1,unitPrice:450}],at+1),/noCapacity/);
 tickDeliveries(s,at+121000);
 assert.equal(s.toolInventory.length,8);
 assert.equal(s.orders[0].status,'delivered');
});

test('Casa Matriz defers delivery if workshop storage is full',()=>{
 const s=newGame('es','operator01',at);s.cash=50000;s.drill={id:'rig_rc_compact'};
 placeOrder(s,[{type:'bit',model:'dome-4',qty:1,unitPrice:450}],at);
 s.toolInventory=Array.from({length:8},(_,i)=>({id:'legacy-'+i,status:'new'}));
 tickDeliveries(s,at+121000);
 assert.equal(s.orders[0].status,'dispatched');
 s.toolInventory=[];
 tickDeliveries(s,at+122000);
 assert.equal(s.orders[0].status,'delivered');
 assert.equal(s.toolInventory.length,1);
});

test('HSEC score alone cannot complete an unsafe faena',()=>{
 const s=newGame('es','operator01',at);
 s.cleared=CLEARABLES.map(o=>o.id);
 s.boosters=5;
 startOffice(s,'office01',at);accelerate(s,at+1);
 s.inside=true;useOfficeComputer(s,at+2);s.inside=false;
 tickHsec(s,0);
 startModule(s,'office-l2','office01',at+3);accelerate(s,at+4);
 for(const type of ['shed','vehicle','pedestrian','crossing','railing','railing','railing','tower','tower','tower','tower','cone','cone','cone','cone','cone','cone','sign','extinguisher']){
  const pose=suggestedPose(s,type);
  try{buildAsset(s,type,pose);}catch(e){throw new Error('HSEC asset '+type+' '+JSON.stringify(pose)+': '+e.message);}
  tickHsec(s,26);
 }
 const e=evaluation(s);
 assert(e.total>=80,JSON.stringify({score:e.total,critical:e.critical}));
 assert(e.vehicle&&e.pedestrian,'Ambas redes deben estar conectadas');
 assert.equal(e.conflicts.unsafe.length,0,'No se permiten cruces peligrosos');
 assert(e.light>=.8,'La red debe estar suficientemente iluminada');
 tickHsec(s,1);
 assert(s.hsec.completedAt);
});
