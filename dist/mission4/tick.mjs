// Mission 4 — Game loop integration
// Single entry point for all M4 per-frame and per-second updates.
import {mission4Phase,updateMission4Phase} from './mission4-state.mjs';
import {tickProduction} from './production.mjs';
import {tickMaintenance} from './maintenance.mjs';
import {calculateOfflineProduction} from './offline-progress.mjs';

let m4Elapsed=0;

// Per-frame update (called from game.mjs frame loop)
export function tickMission4(s,dt,now=Date.now()){
 if(!s.mission4||mission4Phase(s)==='inactive')return null;
 m4Elapsed+=dt;
 if(m4Elapsed<1)return null;
 m4Elapsed=0;
 const events=[];
 // 0. Fix stuck zones: zones in 'maintenance' with no active truck maintenance → reset to idle
 if(s.mission4.drillTruck&&!s.mission4.drillTruck.maintenancePhase){
  for(const z of s.mission4.zones){
   if(z.status==='maintenance')z.status='idle';
  }
 }
 // 1. Tick production cycles
 const prodEvents=tickProduction(s,now);
 events.push(...prodEvents);
 // 2. Tick maintenance sequence
 const maintEvents=tickMaintenance(s,now);
 events.push(...maintEvents);
 // 3. Update mission phase
 const prevPhase=s.mission4.phase;
 const newPhase=updateMission4Phase(s);
 if(newPhase==='complete'&&prevPhase!=='complete')events.push('missionComplete');
 return events.length?events:null;
}

// Called once on game load to reconcile offline progress
export function restoreMission4(s,now=Date.now()){
 if(!s.mission4||mission4Phase(s)==='inactive')return null;
 return calculateOfflineProduction(s,now);
}
