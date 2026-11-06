// Mission 4 — Offline progress system
// Calculates automated production income while player was away.
import {CYCLE_DURATION,zoneIncomePerCycle} from './production.mjs';

export function calculateOfflineProduction(s,now=Date.now()){
 const elapsed=Math.max(0,now-(s.savedAt||now));
 if(elapsed<60000)return null; // less than 1 min — skip
 const result={elapsedMs:elapsed,incomeCycles:0,totalIncome:0};
 for(const zone of (s.mission4?.zones||[])){
  if(zone.status!=='producing'||!zone.lastCycleAt)continue;
  const sinceLastCycle=now-zone.lastCycleAt;
  const cyclesCompleted=Math.floor(sinceLastCycle/(CYCLE_DURATION*1000));
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
