// Mission 3 — Game loop integration
// Single entry point for all M3 per-frame and per-second updates.
// Import this in game.mjs and call tickMission3(s, dt, now) each frame.
import {mission3Phase,updateMission3Phase} from './mission3-state.mjs';
import {tickAnalysis} from './geology.mjs';
import {tickDeliveries} from './headquarters.mjs';
import {advanceMeters} from './contracts.mjs';
import {applyWear} from './wear.mjs';
import {calculateOfflineProgress} from './offline-progress.mjs';

// Accumulated time for 1-second ticks
let m3Elapsed=0;

// Per-frame update (called from game.mjs frame loop)
export function tickMission3(s,dt,now=Date.now()){
 if(!s.mission3||mission3Phase(s)==='inactive')return null;
 m3Elapsed+=dt;
 if(m3Elapsed<1)return null;
 m3Elapsed=0;
 const events=[];
 // 1. Tick geological analysis timer
 if(tickAnalysis(s,now))events.push('analysisComplete');
 // 2. Tick deliveries
 const deliveryResult=tickDeliveries(s,now);
 if(deliveryResult.delivered>0)events.push('deliveryArrived');
 if(deliveryResult.machineryDelivered?.length){
  for(const m of deliveryResult.machineryDelivered)events.push({type:'machineryDelivered',machinery:m});
 }
 // 3a. Auto-transition from 'moving' to 'drilling' (drill repositioned to next borehole)
 if(s.contract?.status==='active'&&s.drill?.state==='moving'){
  s.drill._moveTimer=(s.drill._moveTimer||0)+1;
  if(s.drill._moveTimer>=3){s.drill.state='drilling';s.drill._moveTimer=0;events.push('drillRepositioned');}
 }
 // 3b. Auto-advance drilling (1 second of real-time progress)
 if(s.contract?.status==='active'&&s.drill?.state==='drilling'&&s.drill.installedBit&&s.drill.installedHammer){
  const PRODUCTIVITY_PER_SECOND=1200/3600; // 1200 m/h → m/s (~9 min for 180m)
  const metersThisTick=PRODUCTIVITY_PER_SECOND;
  const bhi=s.contract.activeBoreholeIndex;
  const bh=s.boreholes?.[bhi];
  if(bh&&bh.status==='active'){
   const wearResult=applyWear(s,metersThisTick,bh);
   const gained=advanceMeters(s,metersThisTick,now);
   if(gained>0)events.push('drillAdvance');
   if(!wearResult.bitOk){s.drill.state='idle';events.push('bitExhausted');}
   if(!wearResult.hammerOk){s.drill.state='idle';events.push('hammerExhausted');}
   if(s.contract.metersCompleted>=s.contract.totalMeters)events.push('contractReady');
  }
 }
 // 4. Update mission phase
 const newPhase=updateMission3Phase(s);
 if(newPhase==='complete')events.push('missionComplete');
 return events.length?events:null;
}

// Called once on game load to reconcile offline progress
export function restoreMission3(s,now=Date.now()){
 if(!s.mission3||mission3Phase(s)==='inactive')return null;
 return calculateOfflineProgress(s,now);
}
