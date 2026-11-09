import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DTH_DRILLS,purchaseDthDrill,installDthTool,assignDthDrillToZone} from '../dist/mission4/drills-dth.mjs';
import {purchaseDrillTruck} from '../dist/mission4/drilltruck.mjs';
import {startMaintenance,completeMaintenance} from '../dist/mission4/maintenance.mjs';
import {updateMission4Phase,mission4Objectives} from '../dist/mission4/mission4-state.mjs';
import {tickProduction} from '../dist/mission4/production.mjs';
import {mission4Readout,M4_ENTRY_TOTAL} from '../dist/mission4/operations-guide.mjs';
import {renderM4App} from '../dist/mission4/phone-apps.mjs';
import {readFileSync} from 'node:fs';

const NOW=Date.UTC(2026,10,9,14);
function state(){
 return {cash:70000,bank:0,nextId:1,ledger:[],orders:[],toolInventory:[],
  contract:{status:'delivered'},drill:{id:'rig_rc_compact',state:'idle'},
  hsec:{completedAt:NOW},office:{status:'built',level:2},workshop:{level:2,status:'built'},
  personnel:[],boreholes:[{id:'BH-01',status:'completed',depthTarget:30,depthDrilled:30}],
  mission4:{phase:'equip',startedAt:NOW,currentObjective:2,objectivesCompleted:[1],
   productionDrill:null,drillTruck:null,parkingBuilt:true,productionCycles:0,
   totalAutomatedIncome:0,zones:[{id:'BH-01',status:'idle',position:{x:20,z:4},
    geologyQuality:.8,depthReached:30,lastCycleAt:null,cycleCount:0,totalIncome:0}]}
 };
}
test('actual minimum M4 cash costs are transparent and deterministic',()=>{
 assert.equal(M4_ENTRY_TOTAL,61100);
 const s=state();
 assert.equal(mission4Readout(s).remainingMinimum,53100);
 assert.equal(mission4Readout(s).next.id,'buyDthDrill');
});
test('DTH arrives, installs tools, moves to zone, then starts only after maintenance',()=>{
 const s=state();
 purchaseDthDrill(s,DTH_DRILLS[0].id,true,NOW);
 assert.equal(s.mission4.productionDrill.state,'idle');
 s.toolInventory.push({id:'H1',type:'hammer',model:'puma-dth-6',status:'new',lifeRemaining:2000,lifeTotal:2000},
   {id:'B1',type:'bit',model:'dth-button-6',status:'new',lifeRemaining:300,lifeTotal:300});
 installDthTool(s,'H1');installDthTool(s,'B1');
 assert.equal(s.mission4.productionDrill.installedHammer,'H1');
 assert.equal(s.mission4.productionDrill.installedBit,'B1');
 assert.equal(updateMission4Phase(s),'deploy');
 assignDthDrillToZone(s,'BH-01',NOW);
 assert.equal(s.mission4.productionDrill.state,'idle');
 assert.equal(s.mission4.productionDrill.assignedZone,'BH-01');
 assert.equal(updateMission4Phase(s),'automate');
 s.personnel.push({role:'tecnicoDrillco'});
 purchaseDrillTruck(s,true,NOW);
 s.mission4.drillTruck.assignedZone='BH-01';
 s.mission4.drillTruck.state='dispatched';
 startMaintenance(s,'BH-01',NOW);
 assert.equal(s.mission4.zones[0].status,'maintenance');
 assert.equal(updateMission4Phase(s),'production');
 completeMaintenance(s,NOW+60000);
 assert.equal(s.mission4.zones[0].status,'producing');
 assert.equal(s.mission4.productionDrill.state,'producing');
 assert.equal(s.mission4.drillTruck.assignedZone,null);
 assert.equal(mission4Objectives(s)[3].checks[2].done,true,
  'truck service remains completed once truck returns');
 const events=tickProduction(s,NOW+60000+900000);
 assert(events.includes('incomeGenerated'));
 assert.equal(s.mission4.productionCycles,1);
 assert.equal(updateMission4Phase(s),'complete');
 assert.equal(mission4Readout(s).done,11);
 assert.equal(mission4Readout(s).remainingMinimum,0);
});
test('operational hub shows actual next action, workshop, categories and financial guidance',()=>{
 const s=state();const fmt=n=>String(n),icon=id=>'<svg data-icon="'+id+'"></svg>';
 const operations=renderM4App('m4-operaciones',s,x=>x,fmt,icon,{});
 const workshop=renderM4App('m4-workshop',s,x=>x,fmt,icon,{});
 const catalog=renderM4App('m4-dth-catalog',s,x=>x,fmt,icon,{});
 assert(operations.includes('Recibir perforadora DTH'));
 assert(operations.includes('data-app="m4-workshop"'));
 assert(operations.includes('61'));
 assert(workshop.includes('Gestion de maquinaria')||workshop.includes('Gestión de maquinaria'));
 assert(catalog.includes('EXPLORA® · Sondaje RC'));
 assert(catalog.includes('PUMA® DTH · Producción'));
});
test('scene has state-controlled DTH and real RC reserve; M5 secure yard is not automatically built',()=>{
 const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert(game.includes('m4DthModel=createDthProductionRig()'));
 assert(game.includes('const parked=s.contract?.status===\'delivered\''));
 assert(game.includes('RC_RESERVE'));
 assert(game.includes('DTH_RESERVE'));
 assert(game.includes('animateDthRig(m4DthModel,dt,drill?.state===\'producing\')'));
 const staging=readFileSync(new URL('../dist/graphics/production-dth-rig.mjs',import.meta.url),'utf8');
 assert(staging.includes('NOT the future M5 fenced'));
});
