// Mission 4 — Offline progress system
// Calculates automated production income while player was away.
import {CYCLE_DURATION,MAX_OFFLINE_PRODUCTION_CYCLES,zoneIncomePerCycle,tickProduction,dthReplacementAvailable,serviceDthFromStock} from './production.mjs';

// A saved M4 V2 state may continue offline for at most one hour.
// The game is simulated at real cycle/service/travel boundaries and uses
// the SAME debit/credit logic as online ticks; no unearned auto-payout.
export function calculatePermanentOffline(s,now=Date.now()){
 const m=s.mission4,d=m?.productionDrill;
 const saved=Number(s.savedAt);
 const result={elapsedMs:Math.max(0,now-(saved||now)),incomeCycles:0,totalIncome:0,meters:0,serviceCount:0,paused:false};
 if(!d||!Number.isFinite(saved)||saved<=0||now<=saved)return result;
 const end=Math.min(now,saved+3600000);
 let clock=saved;
 const originalCash=s.cash,originalMeters=m.zone1Meterage||0,originalCycles=m.productionCycles||0;
 // Simulate a bounded number of production and maintenance transitions.
 for(let i=0;i<18&&clock<end;i++){
  const zone=(m.zones||[]).find(z=>z.id===d.assignedZone);
  if(!zone)break;
  if(m.serviceRequested){
   if(!m.drillTruck||m.drillTruck.maintenancePhase||!dthReplacementAvailable(s)){
    result.paused=true;break;
   }
   // One minute minimum to model dispatch, service, and return while away.
   const serviceDone=clock+60000;
   if(serviceDone>end)break;
   clock=serviceDone;
   for(const mat of (s.spentMaterials||[])){
    if(mat.originZone===zone.id&&mat.recyclingStatus==='awaiting-pickup'){
     mat.recyclingStatus='awaiting-yard';mat.recoveredAt=clock;
    }
   }
   const ready=serviceDthFromStock(s,clock);
   if(!ready){result.paused=true;break;}
   zone.status='producing';zone.lastCycleAt=clock;
   result.serviceCount++;
   continue;
  }
  if(m.travelUntil){
   const travelDone=Math.max(clock,Number(m.travelUntil));
   if(travelDone>end)break;
   clock=travelDone;tickProduction(s,clock);
   continue;
  }
  if(zone.status!=='producing'||!zone.lastCycleAt){result.paused=true;break;}
  const cycleEnd=Math.max(clock,Number(zone.lastCycleAt)+CYCLE_DURATION*1000);
  if(cycleEnd>end)break;
  clock=cycleEnd;
  tickProduction(s,clock);
  if((m.productionCycles||0)-originalCycles>=MAX_OFFLINE_PRODUCTION_CYCLES)break;
 }
 result.incomeCycles=Math.max(0,(m.productionCycles||0)-originalCycles);
 result.totalIncome=s.cash-originalCash;
 result.meters=(m.zone1Meterage||0)-originalMeters;
 // Freeze progress past the approved hour instead of giving further free cycles.
 // Any partial interval already earned within that hour is retained on return.
 const ignored=Math.max(0,now-end);
 if(ignored){
  if(m.travelUntil)m.travelUntil+=ignored;
  const active=(m.zones||[]).find(z=>z.id===d.assignedZone);
  if(active?.status==='producing'&&active.lastCycleAt)active.lastCycleAt+=ignored;
 }
 // Avoid paying extra immediately from a suspended service/timer when returning.
 if(m.serviceRequested){
  const active=(m.zones||[]).find(z=>z.id===d.assignedZone);
  if(active){active.status='idle';active.lastCycleAt=null;}
  d.state='paused';
 }
 if(result.incomeCycles||result.serviceCount){
  m.lastOfflineReport={at:now,cycles:result.incomeCycles,income:result.totalIncome,
   meters:result.meters,services:result.serviceCount,elapsedMs:Math.min(3600000,result.elapsedMs)};
 }
 return result;
}

export function calculateOfflineProduction(s,now=Date.now()){
 const elapsed=Math.max(0,now-(s.savedAt||now));
 if(elapsed<60000)return null; // less than 1 min — skip
 const result={elapsedMs:elapsed,incomeCycles:0,totalIncome:0};
 // Permanent production uses physical travel, stocked tools and serviced changes.
 // Do not credit offline cycles without simulating the inventory and logistics.
 if(s.mission4?.productionMode==='single-dth-v2')return calculatePermanentOffline(s,now);
 if(s.mission4?.phase==='complete')return result;
 for(const zone of (s.mission4?.zones||[])){
  if(zone.status!=='producing'||!zone.lastCycleAt)continue;
  const sinceLastCycle=now-zone.lastCycleAt;
  // Prevent unbounded offline accumulation that overwhelms contract rewards.
  // Preserve already earned wallet funds; apply the limit to future returns only.
  const cyclesCompleted=Math.min(MAX_OFFLINE_PRODUCTION_CYCLES,
   Math.max(0,Math.floor(sinceLastCycle/(CYCLE_DURATION*1000))));
  if(cyclesCompleted>0){
   const incomePerCycle=zoneIncomePerCycle(zone);
   const totalZoneIncome=incomePerCycle*cyclesCompleted;
   zone.cycleCount+=cyclesCompleted;
   zone.totalIncome+=totalZoneIncome;
   zone.lastCycleAt=now;
   s.cash+=totalZoneIncome;
   s.mission4.productionCycles+=cyclesCompleted;
   s.mission4.totalAutomatedIncome+=totalZoneIncome;
   if(!s.mission4.firstIncomeAt)s.mission4.firstIncomeAt=now;
   s.ledger.push({id:s.nextId++,key:'offlineAutomatedIncome',amount:totalZoneIncome,at:now});
   result.incomeCycles+=cyclesCompleted;
   result.totalIncome+=totalZoneIncome;
  }
 }
 // If truck was in maintenance, complete it
 if(s.mission4?.drillTruck?.maintenancePhase){
  const truck=s.mission4.drillTruck;
  const zoneId=truck.maintenanceZone;
  truck.maintenancePhase=null;
  truck.maintenanceStartedAt=null;
  truck.maintenanceZone=null;
  truck.maintenancePhaseStartedAt=null;
  truck.state='parked';
  truck.position={x:-13.5,z:-9.3};
  truck.assignedZone=null;
  const zone=s.mission4.zones.find(z=>z.id===zoneId);
  if(zone&&zone.status==='maintenance'){
   zone.status='producing';
   zone.lastCycleAt=now;
  }
 }
 return result;
}
