// Mission 4 — Production system
// Automated income generation from converted borehole zones.

export const CYCLE_DURATION=900; // 15 minutes in seconds
// Moderate passive income relative to one-off contract rewards (M3: 60,000 base).
export const BASE_INCOME_PER_CYCLE=500;
// One hour of unattended cycles per zone at most when reopening the game.
export const MAX_OFFLINE_PRODUCTION_CYCLES=4;

// Income for a single zone per cycle
export function zoneIncomePerCycle(zone){
 if(!zone)return 0;
 // Clamp saved values defensively: a malformed zone must never mint arbitrary money.
 const quality=Number.isFinite(zone.geologyQuality)?Math.max(0,Math.min(1,zone.geologyQuality)):0;
 const depth=Number.isFinite(zone.depthReached)?Math.max(0,Math.min(30,zone.depthReached)):0;
 return Math.round(BASE_INCOME_PER_CYCLE*quality*(depth/30));
}

// Tick production for all active zones (called once per second)
export function tickProduction(s,now=Date.now()){
 if(!s.mission4)return [];
 const events=[];
 for(const zone of s.mission4.zones){
  if(zone.status!=='producing'||!zone.lastCycleAt)continue;
  const elapsed=now-zone.lastCycleAt;
  if(elapsed>=CYCLE_DURATION*1000){
   const income=zoneIncomePerCycle(zone);
   s.cash+=income;
   zone.cycleCount++;
   zone.totalIncome+=income;
   zone.lastCycleAt=now;
   s.mission4.productionCycles++;
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

// Estimated income per hour across all producing zones
export function incomePerHour(s){
 if(!s.mission4)return 0;
 let total=0;
 for(const zone of s.mission4.zones){
  if(zone.status==='producing')total+=zoneIncomePerCycle(zone);
 }
 return Math.round(total*(3600/CYCLE_DURATION));
}
