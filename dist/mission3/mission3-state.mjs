// Mission 3 — High-level mission state machine
// Orchestrates the 5 objectives of "Tu Primer Contrato"
import {hasRole} from './personnel.mjs';
import {contractProgress,isContractComplete} from './contracts.mjs';
import {analysisProgress} from './geology.mjs';

export const M3_PHASES=[
 'inactive',   // M2 not completed yet
 'briefing',   // M3 unlocked, player sees introduction
 'setup',      // Obj 1: prepare company (office L3, workshop, admin)
 'survey',     // Obj 2: geological analysis
 'equip',      // Obj 3: buy drill, tools, order materials
 'drilling',   // Obj 4: execute exploration (6 boreholes)
 'delivery',   // Obj 5: submit contract, receive payment
 'complete'    // M3 done
];

export function mission3Phase(s){return s.mission3?.phase||'inactive';}

export function canStartMission3(s){
 return !!(s.hsec?.completedAt&&s.office?.status==='built'&&s.office?.level>=2);
}

export function startMission3(s,now=Date.now()){
 if(!canStartMission3(s))throw new Error('m3NotReady');
 if(s.mission3?.phase&&s.mission3.phase!=='inactive')throw new Error('m3AlreadyStarted');
 s.mission3={
  phase:'briefing',
  startedAt:now,
  objectivesCompleted:[],
  currentObjective:1
 };
 // Safety net: ensure player has minimum funds to start M3
 const totalFunds=(s.cash||0)+(s.bank||0);
 const minFunds=25000;
 if(totalFunds<minFunds){const bonus=minFunds-totalFunds;s.cash+=bonus;s.ledger.push({id:s.nextId++,key:'Subsidio operacional · Misión 3',amount:bonus,at:now});}
 return s.mission3;
}

// Detailed objective tracking for the 5 M3 objectives
export function mission3Objectives(s){
 const m=s.mission3;
 if(!m||m.phase==='inactive')return [];
 const shed=s.hsec?.assets?.some(a=>a.type==='shed'&&a.status==='built');
 const cp=contractProgress(s);
 return [
  {id:1,nameKey:'prepareCompany',checks:[
   {id:'workshop',done:!!shed,labelKey:'workshopReady'},
   {id:'admin',done:hasRole(s,'admin'),labelKey:'hireAdmin'}
  ]},
  {id:2,nameKey:'knowTerrain',checks:[
   {id:'requestGeo',done:!!s.geoAnalysis?.requested,labelKey:'requestAnalysis'},
   {id:'waitAnalysis',done:!!s.geoAnalysis?.completed,labelKey:'waitForReport',
    progress:analysisProgress(s)},
   {id:'readReport',done:!!s.geoAnalysis?.reportAvailable&&!!m.reportRead,labelKey:'reviewReport'}
  ]},
  {id:3,nameKey:'equipOperation',checks:[
   {id:'buyDrill',done:!!s.drill,labelKey:'purchaseDrill'},
   {id:'hireDriller',done:hasRole(s,'driller'),labelKey:'hireDriller'},
   {id:'orderTools',done:(s.toolInventory||[]).some(t=>t.type==='bit'),labelKey:'orderTools'},
   {id:'receiveOrder',done:(s.orders||[]).some(o=>o.status==='delivered'),labelKey:'receiveDelivery'}
  ]},
  {id:4,nameKey:'executeExploration',checks:[
   {id:'startDrill',done:['active','completed','delivered'].includes(cp?.status),labelKey:'startDrilling'},
   {id:'completeBoreholes',done:cp?.boreholesDone>0&&cp?.boreholesDone>=cp.totalBoreholes,labelKey:'completeBoreholes',
    progress:cp?cp.progress:0}
  ]},
  {id:5,nameKey:'deliverContract',checks:[
   {id:'validate',done:isContractComplete(s),labelKey:'validateMeters'},
   {id:'deliver',done:cp?.status==='delivered',labelKey:'submitContract'}
  ]}
 ];
}

// Auto-advance phase based on objective completion
export function updateMission3Phase(s){
 const m=s.mission3;
 if(!m||m.phase==='inactive'||m.phase==='complete')return m?.phase;
 const objs=mission3Objectives(s);
 // Check each phase transition
 if(m.phase==='briefing'){
  m.phase='setup';m.currentObjective=1;
 }
 if(m.phase==='setup'){
  const obj1=objs.find(o=>o.id===1);
  if(obj1&&obj1.checks.every(c=>c.done)){
   m.phase='survey';m.currentObjective=2;
   if(!m.objectivesCompleted.includes(1))m.objectivesCompleted.push(1);
  }
 }
 if(m.phase==='survey'){
  const obj2=objs.find(o=>o.id===2);
  if(obj2&&obj2.checks.every(c=>c.done)){
   m.phase='equip';m.currentObjective=3;
   if(!m.objectivesCompleted.includes(2))m.objectivesCompleted.push(2);
  }
 }
 if(m.phase==='equip'){
  const obj3=objs.find(o=>o.id===3);
  if(obj3&&obj3.checks.every(c=>c.done)){
   m.phase='drilling';m.currentObjective=4;
   if(!m.objectivesCompleted.includes(3))m.objectivesCompleted.push(3);
  }
 }
 if(m.phase==='drilling'){
  const obj4=objs.find(o=>o.id===4);
  if(obj4&&obj4.checks.every(c=>c.done)){
   m.phase='delivery';m.currentObjective=5;
   if(!m.objectivesCompleted.includes(4))m.objectivesCompleted.push(4);
  }
 }
 if(m.phase==='delivery'){
  const obj5=objs.find(o=>o.id===5);
  if(obj5&&obj5.checks.every(c=>c.done)){
   m.phase='complete';m.currentObjective=0;
   if(!m.objectivesCompleted.includes(5))m.objectivesCompleted.push(5);
  }
 }
 return m.phase;
}

// Current objective hint for the UI
export function mission3Objective(s){
 const phase=mission3Phase(s);
 const map={
  inactive:'unlockMission3',
  briefing:'readBriefing',
  setup:'prepareCompany',
  survey:'knowTerrain',
  equip:'equipOperation',
  drilling:'executeExploration',
  delivery:'submitContract',
  complete:'missionComplete'
 };
 return map[phase]||'unlockMission3';
}
