import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newGame} from '../dist/chapter/state.mjs';
import {placeMachineryOrder,tickDeliveries} from '../dist/mission3/headquarters.mjs';
import {PERSONAL_DRILLTRUCK_MODEL,PERSONAL_DRILLTRUCK_PRICE} from '../dist/mission5/personal-drilltruck.mjs';
import {startPatio,finishPatio} from '../dist/mission5/patio-state.mjs';
import {hirePatioStaff,inspectPatioGate,inspectPatioWarehouse,mission5Objectives} from '../dist/mission5/patio-staff.mjs';
import {mission5Readout,renderMission5HudChecklist,M5_REWARD_CASH} from '../dist/mission5/mission-readout.mjs';
import {confirmCompletion} from '../dist/chapter/narrative.mjs';

const at=Date.UTC(2026,10,10,13);
const makeState=()=>{
 const s=newGame('es','operador',at);
 s.cash=100000;
 s.mission4={phase:'complete',drillTruck:{id:'drilltruck-01',state:'parked'}};
 s.narrative={messages:[{id:'n:m5:start',missionId:'m5',actionTaken:'accept'}],
  accepted:['m5'],rewardsCollected:[]};
 return s;
};
test('M5 HUD displays six real ordered goals and Casa Matriz reward',()=>{
 const s=makeState(),initial=mission5Readout(s,at);
 assert.equal(initial.done,0);assert.equal(initial.total,6);
 assert.deepEqual(initial.steps.map(x=>x.status),['current','locked','locked','locked','locked','locked']);
 const html=renderMission5HudChecklist(initial);
 assert.equal((html.match(/class="m5HudStep/g)||[]).length,6);
 assert.match(html,/Patio L1/);
 assert.match(html,/12\.000/);
 assert.match(html,/aria-current="step"/);
 assert.equal(s.cash,100000,'read-only rendering never grants money');
});
test('M5 actions unlock in order, preserving prices and 20-minute timer',()=>{
 const s=makeState();
 assert.throws(()=>hirePatioStaff(s,'m5-gate-security',at),/buildPatioFirst/);
 startPatio(s,at);assert.equal(s.cash,55000);
 assert.equal(mission5Readout(s,at+1000).steps[0].remainingSeconds,1199);
 assert.throws(()=>hirePatioStaff(s,'m5-warehouse-tech',at+1000),/buildPatioFirst/);
 finishPatio(s,at+1200000);
 assert.deepEqual(mission5Readout(s,at+1200000).steps.map(x=>x.status),['done','current','locked','locked','locked','locked']);
 assert.throws(()=>hirePatioStaff(s,'m5-warehouse-tech',at+1200001),/hireGuardFirst/);
 hirePatioStaff(s,'m5-gate-security',at+1200002);
 assert.equal(mission5Readout(s,at+1200002).pending.id,'technician');
 assert.throws(()=>inspectPatioGate(s,at+1200002),/hireTechnicianFirst/);
 hirePatioStaff(s,'m5-warehouse-tech',at+1200003);
 assert.equal(mission5Readout(s,at+1200003).pending.id,'gate');
 assert.throws(()=>inspectPatioWarehouse(s,at+1200003),/verifyGateFirst/);
 inspectPatioGate(s,at+1200004);
 assert.equal(mission5Readout(s,at+1200004).pending.id,'inventory');
 inspectPatioWarehouse(s,at+1200005);
 assert.equal(s.mission5.commissionedAt,undefined,'No closing before personal DrillTruck delivery');
 assert.equal(mission5Readout(s,at+1200005).pending.id,'personalTruck');
 assert.equal(s.cash,51000,'45,000 construction + 4,000 hires, no early bonus');
 placeMachineryOrder(s,'drillTruckPersonal',PERSONAL_DRILLTRUCK_MODEL,PERSONAL_DRILLTRUCK_PRICE,at+1200006);
 assert.equal(s.cash,38800,'Second paid DrillTruck and 200 dispatch fee');
 const result=tickDeliveries(s,at+1200006+180000);
 assert.equal(result.delivered,1);
 assert.equal(s.mission5.commissionedAt,at+1200006+180000);
 assert(mission5Objectives(s).every(x=>x.done));
 assert.equal(mission5Readout(s,at+1200006+180000).done,6);
 assert.equal(s.cash,38800,'Delivery grants no money');
});
test('M5 closing reward credits once upon confirmed Elena SMS',()=>{
 const s=makeState();
 s.narrative.messages.push({id:'n:m5:end',missionId:'m5',actionTaken:null});
 const before=s.cash, result=confirmCompletion(s,'m5',at+1200000);
 assert.equal(result.cash,M5_REWARD_CASH);
 assert.equal(s.cash,before+M5_REWARD_CASH);
 assert.equal(confirmCompletion(s,'m5',at+1200001),null);
 assert.equal(s.cash,before+M5_REWARD_CASH);
 assert.equal(s.ledger.filter(x=>x.key==='m5CommissioningReward').length,1);
});
test('Historic ledger blocks duplicate money and phantom closing amount',()=>{
 const s=makeState();
 s.narrative.messages.push({id:'n:m5:end',missionId:'m5'});
 s.ledger.push({id:1,key:'m5CommissioningReward',amount:12000});
 const result=confirmCompletion(s,'m5',at);
 assert.equal(result.cash,0);
 assert.equal(s.cash,100000);
});
