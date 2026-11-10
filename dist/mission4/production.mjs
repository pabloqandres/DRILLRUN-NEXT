// Mission 4 — Production system
// Automated income generation from converted borehole zones.

import {DTH_TRAVEL_MS} from './dth-travel.mjs';
export const CYCLE_DURATION=900; // 15 minutes in seconds
// Moderate passive income relative to one-off contract rewards (M3: 60,000 base).
export const BASE_INCOME_PER_CYCLE=500; // Legacy M4 before completion
export const ZONE1_INCOME_PER_CYCLE=1500;
export const ZONE1_METERS_PER_CYCLE=30;
// One hour of unattended cycles per zone at most when reopening the game.
export const MAX_OFFLINE_PRODUCTION_CYCLES=4;

// Read-only UI status for the first real production cycle, based on the
// persisted zone.lastCycleAt used by tickProduction. Never invent a countdown
// while DrillTruck maintenance is still pending or after the first payout.
export function firstProductionCycleStatus(s,now=Date.now()){
 const m=s?.mission4;
 if(!m||m.phase==='inactive'||m.phase==='complete'||(m.productionCycles||0)>0)
  return {visible:false,phase:'done',remainingSeconds:0,progress:1,zoneId:null};
 const zones=m.zones||[];
 const live=zones.filter(z=>z.status==='producing'&&Number.isFinite(z.lastCycleAt)&&z.lastCycleAt>0)
  .sort((a,b)=>(a.lastCycleAt||0)-(b.lastCycleAt||0));
 if(live.length){
  const z=live[0];
  const remain=Math.max(0,CYCLE_DURATION*1000-(now-z.lastCycleAt));
  return {visible:true,phase:remain>0?'producing':'finishing',
   remainingSeconds:Math.ceil(remain/1000),
   progress:Math.max(0,Math.min(1,1-remain/(CYCLE_DURATION*1000))),zoneId:z.id};
 }
 const staged=zones.find(z=>z.status==='maintenance');
 const awaiting=zones.find(z=>z.status==='idle'&&m.productionDrill?.assignedZone===z.id);
 const zone=staged||awaiting;
 if(zone)return {visible:true,phase:staged?'maintenance':'waiting',
  remainingSeconds:null,progress:0,zoneId:zone.id};
 return {visible:false,phase:'not-started',remainingSeconds:null,progress:0,zoneId:null};
}

// Permanent production V2 activates only after M4 completion.
// Migration preserves every previously credited cycle, ledger row and tool.
function activeTool(s,id){
 return (s.toolInventory||[]).find(t=>t.id===id&&t.status==='installed')||null;
}
function available(s,type,drill){
 const allowed=type==='bit'?['dth-button-6','dth-button-8','dth-tricon-8']:['puma-dth-6','puma-dth-8'];
 return (s.toolInventory||[]).find(t=>t.type===type&&allowed.includes(t.model)&&
  (t.status==='new'||t.status==='worn')&&Number(t.lifeRemaining)>0 &&
  (!drill|| (type==='bit'?['dth-button-6','dth-button-8','dth-tricon-8']:['puma-dth-6','puma-dth-8']).includes(t.model)));
}
export function dthServiceNeeded(s){
 const d=s.mission4?.productionDrill;
 if(!d)return false;
 return !activeTool(s,d.installedBit)||!activeTool(s,d.installedHammer)||
  Number(activeTool(s,d.installedBit)?.lifeRemaining)<=0||
  Number(activeTool(s,d.installedHammer)?.lifeRemaining)<=0;
}
export function dthReplacementAvailable(s){
 const d=s.mission4?.productionDrill;if(!d)return false;
 return (!!activeTool(s,d.installedBit)||!!available(s,'bit',d))&&
        (!!activeTool(s,d.installedHammer)||!!available(s,'hammer',d));
}
export function serviceDthFromStock(s,now=Date.now()){
 const m=s.mission4,d=m?.productionDrill;
 if(!d)return false;
 for(const [type,key] of [['bit','installedBit'],['hammer','installedHammer']]){
  const current=activeTool(s,d[key]);
  if(current&&Number(current.lifeRemaining)>0)continue;
  const replacement=available(s,type,d);
  if(!replacement)continue;
  replacement.status='installed';replacement.installedAt=now;d[key]=replacement.id;
 }
 const complete=!dthServiceNeeded(s);
 if(complete){d.state='producing';m.serviceRequested=false;}
 else {d.state='paused';m.serviceRequested=true;}
 return complete;
}
function retireSpentTool(s,tool,zoneId,now){
 if(!tool||tool.status==='spent')return;
 tool.status='spent';tool.spentAt=now;tool.installedAt=null;
 s.spentMaterials??=[];
 if(!s.spentMaterials.some(x=>x.originalToolId===tool.id)){
  s.spentMaterials.push({id:'spent-'+(s.nextId++),originalToolId:tool.id,
   model:tool.model,type:tool.type,metersUsed:tool.metersUsed||0,
   originZone:zoneId,discardedAt:now,recoveredAt:null,recyclingStatus:'awaiting-pickup'});
 }
}
function activatePermanentProduction(s,now){
 const m=s.mission4;
 if(!m||m.phase!=='complete'||m.productionMode==='single-dth-v2')return;
 const d=m.productionDrill;
 if(!d||!m.zones?.length)return;
 m.productionMode='single-dth-v2';m.serviceRequested=false;
 let zone=m.zones.find(z=>z.id===d.assignedZone)||m.zones.find(z=>z.status==='producing')||m.zones[0];
 d.assignedZone=zone.id;
 for(const z of m.zones){
  if(z.id!==zone.id){z.status='idle';z.lastCycleAt=null;}
  else {z.status='producing';z.lastCycleAt=now;}
 }
 m.zone1Meterage=m.zone1Meterage||0;
 if(dthServiceNeeded(s)){m.serviceRequested=true;d.state='paused';zone.status='idle';zone.lastCycleAt=null;}
 else d.state='producing';
}
function chooseNextZone(m,current){
 const candidates=(m.zones||[]).filter(z=>z.id!==current.id&&z.status!=='maintenance');
 if(!candidates.length)return current;
 // Stable pseudo-random choice avoids repeating the same site, survives save/reload.
 const seed=((m.productionCycles||0)*1103515245+12345)>>>0;
 return candidates[seed%candidates.length];
}
function processPermanentCycle(s,now){
 const m=s.mission4,d=m.productionDrill;
 const current=m.zones.find(z=>z.id===d?.assignedZone);
 if(!current)return [];
 if(m.travelUntil){
  if(now<m.travelUntil)return [];
  m.travelUntil=null;
  m.travelStartedAt=null;
  m.travelFrom=null;
  d.position={...current.position};
  if(!dthServiceNeeded(s)){current.status='producing';current.lastCycleAt=now;d.state='producing';}
  else {m.serviceRequested=true;current.status='idle';current.lastCycleAt=null;d.state='paused';}
  return [];
 }
 if(m.serviceRequested||dthServiceNeeded(s)){
  m.serviceRequested=true;d.state='paused';current.status='idle';current.lastCycleAt=null;
  return [];
 }
 if(current.status!=='producing'||!Number.isFinite(current.lastCycleAt)||current.lastCycleAt<=0)return [];
 if(now-current.lastCycleAt<CYCLE_DURATION*1000)return [];
 const bit=activeTool(s,d.installedBit),hammer=activeTool(s,d.installedHammer);
 const meters=Math.min(ZONE1_METERS_PER_CYCLE,Math.max(0,Number(bit?.lifeRemaining)||0),Math.max(0,Number(hammer?.lifeRemaining)||0));
 if(!meters){m.serviceRequested=true;d.state='paused';current.status='idle';current.lastCycleAt=null;return [];}
 for(const tool of [bit,hammer]){
  tool.lifeRemaining=Math.max(0,Number(tool.lifeRemaining)-meters);
  tool.metersUsed=(Number(tool.metersUsed)||0)+meters;
  if(tool.lifeRemaining===0)retireSpentTool(s,tool,current.id,now);
 }
 const revenue=Math.round(ZONE1_INCOME_PER_CYCLE*meters/ZONE1_METERS_PER_CYCLE);
 s.cash+=revenue;current.cycleCount=(current.cycleCount||0)+1;current.totalIncome=(current.totalIncome||0)+revenue;
 current.metersProduced=(current.metersProduced||0)+meters;
 m.zone1Meterage=(m.zone1Meterage||0)+meters;
 m.productionCycles=(m.productionCycles||0)+1;m.totalAutomatedIncome=(m.totalAutomatedIncome||0)+revenue;
 if(!m.firstIncomeAt)m.firstIncomeAt=now;
 s.ledger??=[];s.ledger.push({id:s.nextId++,key:'automatedIncome-'+current.id,amount:revenue,at:now,meters});
 current.status='idle';current.lastCycleAt=null;
 if(dthServiceNeeded(s)){m.serviceRequested=true;d.state='paused';return ['incomeGenerated','dthServiceRequired'];}
 const next=chooseNextZone(m,current);
 d.assignedZone=next.id;
 if(next.id!==current.id){
  // Keep the actual origin and the full 12-second travel window. The visual
  // renderer derives the pose from this timestamp (also after restoring).
  m.travelFrom={...current.position};
  m.travelStartedAt=now;
  m.travelUntil=now+DTH_TRAVEL_MS;
  d.position={...current.position};
  next.status='idle';next.lastCycleAt=null;d.state='moving';
 }else {
  d.position={...next.position};
  m.travelFrom=null;m.travelStartedAt=null;m.travelUntil=null;
  next.status='producing';next.lastCycleAt=now;d.state='producing';
 }
 return ['incomeGenerated'];
}

// Income for a single zone per cycle
export function zoneIncomePerCycle(zone){
 if(!zone)return 0;
 // Clamp saved values defensively: a malformed zone must never mint arbitrary money.
 const quality=Number.isFinite(zone.geologyQuality)?Math.max(0,Math.min(1,zone.geologyQuality)):0;
 const depth=Number.isFinite(zone.depthReached)?Math.max(0,Math.min(30,zone.depthReached)):0;
 return Math.round(BASE_INCOME_PER_CYCLE*quality*(depth/30));
}

// Single drill can credit only one site per 15-minute cycle after M4.
export function tickProduction(s,now=Date.now()){
 if(!s.mission4)return [];
 activatePermanentProduction(s,now);
 if(s.mission4.productionMode==='single-dth-v2')return processPermanentCycle(s,now);
 const events=[];
 for(const zone of s.mission4.zones){
  if(zone.status!=='producing'||!zone.lastCycleAt)continue;
  if(now-zone.lastCycleAt>=CYCLE_DURATION*1000){
   const income=zoneIncomePerCycle(zone);
   s.cash+=income;zone.cycleCount++;zone.totalIncome+=income;
   zone.lastCycleAt=now;s.mission4.productionCycles++;
   s.mission4.totalAutomatedIncome+=income;
   if(!s.mission4.firstIncomeAt)s.mission4.firstIncomeAt=now;
   s.ledger.push({id:s.nextId++,key:'automatedIncome-'+zone.id,amount:income,at:now});
   events.push('incomeGenerated');
  }
 }
 return events;
}

// Start production on a zone (after maintenance complete)
export function startProductionCycle(s,zoneId,now=Date.now()){
 const zone=s.mission4?.zones?.find(z=>z.id===zoneId);
 if(!zone)return;
 zone.status='producing';
 zone.lastCycleAt=now;
}

// Total income across all zones
export function totalAutomatedIncome(s){
 return s.mission4?.totalAutomatedIncome||0;
}

// Maximum gross rate when a single DTH is continuously available.
export function incomePerHour(s){
 if(!s.mission4)return 0;
 if(s.mission4.productionMode==='single-dth-v2'){
  const d=s.mission4.productionDrill;
  return d&&!s.mission4.serviceRequested&&d.state==='producing'?ZONE1_INCOME_PER_CYCLE*4:0;
 }
 let total=0;
 for(const z of s.mission4.zones)if(z.status==='producing')total+=zoneIncomePerCycle(z);
 return Math.round(total*(3600/CYCLE_DURATION));
}
