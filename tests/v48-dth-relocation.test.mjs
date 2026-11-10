import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tickProduction,CYCLE_DURATION} from '../dist/mission4/production.mjs';
import {dthTravelPose,DTH_TRAVEL_MS} from '../dist/mission4/dth-travel.mjs';
import {dthRigInspection} from '../dist/mission4/rig-inspection.mjs';

const start=Date.UTC(2026,10,10,18);
const makeState=()=>({
 savedAt:start, cash:12000, nextId:5,ledger:[],toolInventory:[
  {id:'b',type:'bit',model:'dth-button-8',status:'installed',lifeRemaining:350,lifeTotal:350,metersUsed:0},
  {id:'h',type:'hammer',model:'puma-dth-8',status:'installed',lifeRemaining:2800,lifeTotal:2800,metersUsed:0}
 ],spentMaterials:[],
 mission4:{
  phase:'complete',productionMode:'single-dth-v2',productionCycles:36,totalAutomatedIncome:0,serviceRequested:false,
  zones:[
   {id:'BH-01',position:{x:20,z:4},status:'producing',lastCycleAt:start,cycleCount:15,totalIncome:0},
   {id:'BH-02',position:{x:23,z:1},status:'idle',lastCycleAt:null,cycleCount:11,totalIncome:0},
   {id:'BH-03',position:{x:26,z:-2},status:'idle',lastCycleAt:null,cycleCount:10,totalIncome:0}
  ],
  productionDrill:{id:'rig_dth_production',assignedZone:'BH-01',position:{x:20,z:4},
   installedBit:'b',installedHammer:'h',state:'producing'},
  drillTruck:{state:'parked',maintenancePhase:null}
 }
});

test('V48 drill traverses the entire twelve seconds instead of snapping to destination',()=>{
 const s=makeState(),t=start+CYCLE_DURATION*1000;
 assert.deepEqual(tickProduction(s,t),['incomeGenerated']);
 const m=s.mission4,d=m.productionDrill;
 assert.equal(d.state,'moving');
 assert.equal(m.travelStartedAt,t);
 assert.equal(m.travelUntil,t+DTH_TRAVEL_MS);
 assert.deepEqual(m.travelFrom,{x:20,z:4});
 assert.deepEqual(d.position,{x:20,z:4},'physical position stays at source while trip starts');
 const next=m.zones.find(z=>z.id===d.assignedZone);
 assert(next&&next.id!=='BH-01');
 const source=dthTravelPose(s,t);
 assert.equal(source.moving,true);
 assert.equal(source.progress,0);
 assert.equal(source.x,20);
 assert.equal(source.z,4);
 const half=dthTravelPose(s,t+6000);
 assert.equal(half.remainingSeconds,6);
 assert.equal(half.progress,0.5);
 assert.equal(half.x,(20+next.position.x)/2);
 assert.equal(half.z,(4+next.position.z)/2);
 const stateBefore=JSON.stringify(s);
 assert.equal(dthTravelPose(s,t+9000).progress,0.75);
 assert.equal(JSON.stringify(s),stateBefore,'visual interpolation must not mutate saves or economy');
 assert.equal(dthRigInspection(s,t+6000).travel.remainingSeconds,6);
 assert.deepEqual(tickProduction(s,t+6000),[]);
 assert.equal(m.productionCycles,37,'moving does not generate income');
 assert.deepEqual(tickProduction(s,t+12000),[]);
 assert.equal(m.travelUntil,null);
 assert.equal(m.travelFrom,null);
 assert.equal(m.travelStartedAt,null);
 assert.equal(d.state,'producing');
 assert.deepEqual(d.position,next.position);
 assert.equal(dthTravelPose(s,t+12001).moving,false);
 assert.equal(m.productionCycles,37);
 assert.equal(s.ledger.filter(x=>x.key.startsWith('automatedIncome-')).length,1);
});
test('V48 saved moving DTH resumes at the intermediate pose when player reloads',()=>{
 const s=makeState(),t=start+CYCLE_DURATION*1000;
 tickProduction(s,t);
 const restored=JSON.parse(JSON.stringify(s));
 const before=JSON.stringify(restored);
 const report=dthTravelPose(restored,t+9500);
 assert(report.moving);
 assert(report.progress>0.78&&report.progress<0.8);
 assert.equal(report.remainingSeconds,3);
 assert.equal(JSON.stringify(restored),before);
});
test('V48 legacy transit without origin remains valid and recovers a visible route',()=>{
 const s=makeState(),t=start+CYCLE_DURATION*1000;
 tickProduction(s,t);
 const d=s.mission4.productionDrill;
 d.position={...s.mission4.zones.find(z=>z.id===d.assignedZone).position};
 delete s.mission4.travelFrom;
 delete s.mission4.travelStartedAt;
 const pose=dthTravelPose(s,t+6000);
 assert.equal(pose.moving,true);
 assert(Number.isFinite(pose.x)&&Number.isFinite(pose.z));
 assert.equal(pose.remainingSeconds,6);
 assert.notDeepEqual({x:pose.x,z:pose.z},d.position,'do not display the destination during unfinished travel');
});
test('V48 world animation and inspection use the same travel helper',()=>{
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const game=read('dist/chapter/game.mjs');
 assert.match(game,/transit=dthTravelPose\(s,Date\.now\(\)\)/);
 assert.match(game,/m4DthModel\.position\.x=transit\.x/);
 assert.match(game,/report\.travel\.remainingSeconds/);
 assert.doesNotMatch(game,/Retain M4 worksite-to-worksite animation and consumption/);
});
