import {test} from 'node:test';
import assert from 'node:assert/strict';
import {firstProductionCycleStatus,tickProduction,incomePerHour} from '../dist/mission4/production.mjs';
import {RC_RESERVE,DTH_RESERVE} from '../dist/graphics/production-dth-rig.mjs';
import {reliefHeight} from '../dist/graphics/desert.mjs';
import {readFileSync} from 'node:fs';
const T=Date.UTC(2026,10,9,13);
const state=()=>({cash:0,nextId:1,ledger:[],mission4:{
 phase:'production',productionCycles:0,totalAutomatedIncome:0,
 productionDrill:{assignedZone:'BH-01',state:'producing'},
 zones:[{id:'BH-01',status:'producing',lastCycleAt:T,cycleCount:0,totalIncome:0,geologyQuality:.9,depthReached:30}]
}});

test('live first-cycle counter uses exact producing zone timestamp and stops after first income',()=>{
 const s=state();
 assert.equal(firstProductionCycleStatus(s,T).remainingSeconds,900);
 assert.equal(firstProductionCycleStatus(s,T+60000).remainingSeconds,840);
 assert.equal(firstProductionCycleStatus(s,T+899001).remainingSeconds,1);
 assert.equal(firstProductionCycleStatus(s,T+900001).phase,'finishing');
 assert(tickProduction(s,T+900001).includes('incomeGenerated'));
 assert.equal(s.mission4.productionCycles,1);
 assert.equal(firstProductionCycleStatus(s,T+900002).visible,false);
 assert.equal(s.mission4.productionDrill.state,'producing');
 assert.equal(s.mission4.zones[0].status,'producing');
 assert.equal(incomePerHour(s),1800);
});
test('counter never invents 15 minutes before DrillTruck services the zone',()=>{
 const s=state();const z=s.mission4.zones[0];z.status='maintenance';z.lastCycleAt=null;
 assert.equal(firstProductionCycleStatus(s,T).phase,'maintenance');
 assert.equal(firstProductionCycleStatus(s,T).remainingSeconds,null);
 z.status='idle';
 assert.equal(firstProductionCycleStatus(s,T).phase,'waiting');
 assert.equal(firstProductionCycleStatus(s,T).remainingSeconds,null);
});
test('RC/DTH reserve bays and full footprints stay inside flat playable ground',()=>{
 for(const bay of [RC_RESERVE,DTH_RESERVE]){
  for(const dx of [-2.25,0,2.25])for(const dz of[-3,0,3])
   assert.equal(reliefHeight(bay.x+dx,bay.z+dz),0);
 }
});
test('M4 converted-zone indicator derives actual zone and borehole count',()=>{
 const src=readFileSync(new URL('../dist/mission4/phone-apps.mjs',import.meta.url),'utf8');
 assert(!src.includes('${zones.length}/6'));
 assert(src.includes('new Set([...(s.boreholes||[])'));
 assert(src.includes('Producción estimada/h'));
});
test('localize action is callable and UI never invokes an arbitrary action string',()=>{
 const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 const notices=readFileSync(new URL('../dist/chapter/notifications.mjs',import.meta.url),'utf8');
 assert(!game.includes("action:'locateDrill'"));
 assert(game.includes('action:()=>{if(m3DrillModel)'));
 assert(notices.includes("typeof n.action==='function'"));
});
test('M4 end message is automatic, after actual income, with DTH retained in zone',()=>{
 const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert(game.includes("'n:m3:end','n:m4:end'"));
 assert(game.includes("msg.id==='n:m3:end'||msg.id==='n:m4:end'"));
 assert(game.includes("title:'Primer ciclo DTH completado'"));
 assert(!game.includes("showMissionComplete('Automatiza tu operación',null,0,'Producción automatizada habilitada')"));
 assert(game.includes("const cycle=firstProductionCycleStatus(s,Date.now())"));
});
test('DrillTruck model is contained in catalog and technical preview',()=>{
 const src=readFileSync(new URL('../dist/chapter/drilltruck-catalog-audit.css',import.meta.url),'utf8');
 assert(src.includes('.catalogDetailVisual>img'));
 assert(src.includes('.catalogArt>img'));
 assert(src.includes('object-fit:contain!important'));
});
