// Mission 3 — Offline progress system
// Calculates drilling and delivery progress while player was away.
import {advanceMeters} from './contracts.mjs';
import {tickDeliveries} from './headquarters.mjs';
import {applyWear} from './wear.mjs';
import {tickAnalysis} from './geology.mjs';

// Match active drilling speed: 90 m in about 108 seconds plus repositioning.
const BASE_PRODUCTIVITY=3000; // m/h; remaining off-line progress still respects tool wear

export function calculateOfflineProgress(s,now=Date.now()){
 const elapsed=Math.max(0,now-(s.savedAt||now));
 if(elapsed<60000)return null; // less than 1 min — skip
 const hours=elapsed/3600000;
 const result={elapsedMs:elapsed,drilling:null,deliveries:0,analysisCompleted:false};
 // 1. Complete any pending deliveries
 result.deliveries=tickDeliveries(s,now);
 // 2. Complete geological analysis if pending
 result.analysisCompleted=tickAnalysis(s,now);
 // 3. Advance drilling if contract is active
 if(s.contract?.status==='active'&&s.drill?.state==='drilling'&&s.drill.installedBit&&s.drill.installedHammer){
  const metersToAdvance=BASE_PRODUCTIVITY*hours;
  let advanced=0,stopped=false;
  // Simulate in 1m increments for wear calculation
  const step=1; // 1 meter per step
  let remaining=metersToAdvance;
  while(remaining>=step&&!stopped){
   const bhi=s.contract.activeBoreholeIndex;
   const bh=s.boreholes?.[bhi];
   if(!bh||bh.status==='completed'){
    // Try next borehole
    if(bhi+1<(s.boreholes||[]).length){
     s.contract.activeBoreholeIndex=bhi+1;
     s.boreholes[bhi+1].status='active';
     s.boreholes[bhi+1].startedAt=now;
     continue;
    }
    break; // all done
   }
   const bhRemaining=bh.depthTarget-bh.depthDrilled;
   const actual=Math.min(step,bhRemaining,remaining);
   const wearResult=applyWear(s,actual,bh);
   const metersGained=advanceMeters(s,actual,now);
   advanced+=metersGained;
   remaining-=actual;
   // Stop if tools ran out
   if(!wearResult.bitOk||!wearResult.hammerOk){
    s.drill.state='idle';
    stopped=true;
   }
   // Stop if contract complete
   if(s.contract.metersCompleted>=s.contract.totalMeters)break;
  }
  result.drilling={metersAdvanced:advanced,stopped,reason:stopped?'toolsExhausted':null};
 }
 return result;
}

export function applyOfflineProgress(s,progress,now=Date.now()){
 // Progress is already applied in-place by calculateOfflineProgress
 // This function is for any post-processing or notifications
 s.savedAt=now;
 return progress;
}
