// Mission 4 — High-level mission state machine
// Orchestrates "Automatiza tu operación" (user's Misión 3)
// Pipeline: sondaje RC (M3) → producción DTH (M4) → DrillTruck automation
import {workshopLevel} from '../mission3/inventory.mjs';
import {hasRole} from '../mission3/personnel.mjs';
import {dthDrillEquipped,dthDrillAssigned} from './drills-dth.mjs';

export const M4_PHASES=[
 'inactive',    // M3 not completed yet
 'briefing',    // M4 unlocked, introduction
 'upgrade',     // Obj 1: upgrade workshop to Nv.2 + build parking
 'equip',       // Obj 2: buy DTH production drill + PUMA DTH + bits DTH
 'deploy',      // Obj 3: convert zone + install DTH drill in production zone
 'automate',    // Obj 4: hire Técnico DRILLCO + buy DrillTruck + link to zone
 'production',  // Obj 5: automated production → first income cycle
 'complete'     // M4 done
];

export function mission4Phase(s){return s.mission4?.phase||'inactive';}

export function canStartMission4(s){
 return !!(s.mission3?.phase==='complete'&&s.contract?.status==='delivered');
}

export function startMission4(s,now=Date.now()){
 if(!canStartMission4(s))throw new Error('m4NotReady');
 if(s.mission4?.phase&&s.mission4.phase!=='inactive')throw new Error('m4AlreadyStarted');
 s.mission4={
  phase:'briefing',
  startedAt:now,
  objectivesCompleted:[],
  currentObjective:1,
  // DTH production drill
  productionDrill:null,
  // DrillTruck
  drillTruck:null,
  // Automated production zones
  zones:[],
  tecnicoId:null,
  productionCycles:0,
  totalAutomatedIncome:0,
  firstIncomeAt:null,
  // Parking
  parkingBuilt:false,
  parkingPosition:{x:-13.5,z:-9.3}
 };
 // Auto-build parking if workshop already Nv.2+
 if((s.workshop?.level||1)>=2){s.mission4.parkingBuilt=true;}
 // Safety net: ensure minimum funds
 const totalFunds=(s.cash||0)+(s.bank||0);
 const minFunds=30000;
 if(totalFunds<minFunds){const bonus=minFunds-totalFunds;s.cash+=bonus;s.ledger.push({id:s.nextId++,key:'Subsidio operacional · Misión 4',amount:bonus,at:now});}
 return s.mission4;
}

// Detailed objective tracking for the 5 M4 objectives
export function mission4Objectives(s){
 const m=s.mission4;
 if(!m||m.phase==='inactive')return [];
 const hasDthDrill=!!m.productionDrill;
 const dthEquipped=dthDrillEquipped(s);
 const dthAssigned=dthDrillAssigned(s);
 const truckOwned=!!m.drillTruck;
 const hasTecnico=hasRole(s,'tecnicoDrillco');
 // Once maintenance has been successfully linked and the objective advanced,
 // the truck legitimately returns to parking and clears assignedZone.
 // Preserve the completed checklist after it returns rather than regressing
 // from 8/11 back to 7/11 while the player waits for production income.
 const truckLinked=truckOwned&&(!!m.drillTruck.assignedZone||(m.objectivesCompleted||[]).includes(4));
 const hasIncome=m.productionCycles>0;
 return [
  {id:1,nameKey:'upgradeWorkshop',checks:[
   {id:'workshopNv2',done:workshopLevel(s)>=2,labelKey:'upgradeToNv2'}
  ]},
  {id:2,nameKey:'equipDth',checks:[
   {id:'buyDthDrill',done:hasDthDrill,labelKey:'purchaseDthDrill'},
   {id:'orderDthTools',done:hasDthDrill&&(s.toolInventory||[]).some(t=>t.model?.startsWith('puma-dth')),labelKey:'orderPumaTools'},
   {id:'equipDth',done:dthEquipped,labelKey:'installDthTools'}
  ]},
  {id:3,nameKey:'deployProduction',checks:[
   {id:'convertZone',done:m.zones.length>0,labelKey:'convertBorehole'},
   {id:'assignDrill',done:dthAssigned,labelKey:'assignDthToZone'}
  ]},
  {id:4,nameKey:'automateDrillTruck',checks:[
   {id:'hireTecnico',done:hasTecnico,labelKey:'hireTecnicoDrillco'},
   {id:'buyTruck',done:truckOwned,labelKey:'purchaseDrillTruck'},
   {id:'linkTruck',done:truckLinked,labelKey:'linkTruckToZone'}
  ]},
  {id:5,nameKey:'automatedProduction',checks:[
   {id:'firstCycle',done:hasIncome,labelKey:'completeProductionCycle'},
   {id:'productionZone',done:m.zones.some(z=>z.status==='producing'),labelKey:'convertBorehole'}
  ]}
 ];
}

// Auto-advance phase based on objective completion
export function updateMission4Phase(s){
 const m=s.mission4;
 if(!m||m.phase==='inactive'||m.phase==='complete')return m?.phase;
 // Retroactive parking fix: if workshop already Nv.2+ but parking not set
 if(!m.parkingBuilt&&(s.workshop?.level||1)>=2){m.parkingBuilt=true;}
 const objs=mission4Objectives(s);
 if(m.phase==='briefing'){
  m.phase='upgrade';m.currentObjective=1;
 }
 if(m.phase==='upgrade'){
  const obj=objs.find(o=>o.id===1);
  if(obj&&obj.checks.every(c=>c.done)){
   m.phase='equip';m.currentObjective=2;
   if(!m.objectivesCompleted.includes(1))m.objectivesCompleted.push(1);
  }
 }
 if(m.phase==='equip'){
  const obj=objs.find(o=>o.id===2);
  if(obj&&obj.checks.every(c=>c.done)){
   m.phase='deploy';m.currentObjective=3;
   if(!m.objectivesCompleted.includes(2))m.objectivesCompleted.push(2);
  }
 }
 if(m.phase==='deploy'){
  const obj=objs.find(o=>o.id===3);
  if(obj&&obj.checks.every(c=>c.done)){
   m.phase='automate';m.currentObjective=4;
   if(!m.objectivesCompleted.includes(3))m.objectivesCompleted.push(3);
  }
 }
 if(m.phase==='automate'){
  const obj=objs.find(o=>o.id===4);
  if(obj&&obj.checks.every(c=>c.done)){
   m.phase='production';m.currentObjective=5;
   if(!m.objectivesCompleted.includes(4))m.objectivesCompleted.push(4);
  }
 }
 if(m.phase==='production'){
  const obj=objs.find(o=>o.id===5);
  if(obj&&obj.checks.every(c=>c.done)){
   m.phase='complete';m.currentObjective=0;
   if(!m.objectivesCompleted.includes(5))m.objectivesCompleted.push(5);
  }
 }
 return m.phase;
}

// Current objective hint for the UI
export function mission4Objective(s){
 const phase=mission4Phase(s);
 const map={
  inactive:'unlockMission4',
  briefing:'readBriefing',
  upgrade:'upgradeWorkshop',
  equip:'equipDth',
  deploy:'deployProduction',
  automate:'automateDrillTruck',
  production:'automatedProduction',
  complete:'missionComplete'
 };
 return map[phase]||'unlockMission4';
}
