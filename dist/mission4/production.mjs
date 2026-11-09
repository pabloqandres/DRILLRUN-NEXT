// Mission 4 — Production system
// Automated income generation from converted borehole zones.

export const CYCLE_DURATION=900; // 15 minutes in seconds
// Moderate passive income relative to one-off contract rewards (M3: 60,000 base).
export const BASE_INCOME_PER_CYCLE=500;
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
