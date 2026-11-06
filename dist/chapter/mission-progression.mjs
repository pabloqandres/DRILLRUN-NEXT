// Mission Progression Manager — Centralized mission flow controller
// Coordinates transitions, validates prerequisites, prevents duplicate rewards,
// and provides a single source of truth for mission state.
//
// This module does NOT replace individual mission state machines.
// It wraps them to provide unified transition logic, guard checks,
// and event deduplication.

import {CONFIG} from './config.mjs';
import {objective,landReady} from './state.mjs';

// ─── Mission Registry ──────────────────────────────────────────
// Each mission defines its identity, prerequisites, and reward info.
// The actual state machines live in their own modules; this registry
// just knows how to CHECK and TRANSITION between them.

export const MISSIONS=[
 {
  id:'m1',
  code:'chapter',
  name:'Tus primeros pasos',
  narrativeIndex:1,        // "Misión 1" for the player (intro chapter)
  startCheck:s=>true,      // always available at game start
  activeCheck:s=>!s.chapterCompletedAt,
  completeCheck:s=>!!s.chapterCompletedAt,
  reward:5000,
  rewardKey:'missionReward',
  rewardLabel:'Recompensa · Misión 1',
  rewardedCheck:s=>s.ledger?.some(l=>l.key==='missionReward'),
 },
 {
  id:'m2',
  code:'hsec',
  name:'Prepara tu operación',
  narrativeIndex:2,
  startCheck:s=>!!s.chapterCompletedAt,
  activeCheck:s=>!!s.chapterCompletedAt&&!s.hsec?.completedAt,
  completeCheck:s=>!!s.hsec?.completedAt,
  reward:35000,
  rewardKey:'hsecReward',
  rewardLabel:'Recompensa · Misión 2',
  rewardedCheck:s=>!!s.hsec?.rewarded,
 },
 {
  id:'m3',
  code:'mission3',
  name:'Tu primer contrato',
  narrativeIndex:3,        // was "Misión 2" in HUD, correcting to 3
  startCheck:s=>!!s.hsec?.completedAt&&s.office?.status==='built'&&(s.office?.level||1)>=2,
  activeCheck:s=>s.mission3&&s.mission3.phase!=='inactive'&&s.mission3.phase!=='complete',
  completeCheck:s=>s.mission3?.phase==='complete',
  reward:null,             // variable (contract reward, handled by completeContract)
  rewardKey:'contractPayment',
  rewardLabel:'Recompensa · Contrato',
  rewardedCheck:s=>s.contract?.status==='delivered',
 },
 {
  id:'m4',
  code:'mission4',
  name:'Automatiza tu operación',
  narrativeIndex:4,
  startCheck:s=>s.mission3?.phase==='complete'&&s.contract?.status==='delivered',
  activeCheck:s=>s.mission4&&s.mission4.phase!=='inactive'&&s.mission4.phase!=='complete',
  completeCheck:s=>s.mission4?.phase==='complete',
  reward:null,             // production-based (tracked in totalAutomatedIncome)
  rewardKey:null,
  rewardLabel:null,
  rewardedCheck:s=>s.mission4?.phase==='complete',
 }
];

// ─── Progression Queries ────────────────────────────────────────

/** Returns the currently active mission definition, or null */
export function activeMission(s){
 for(const m of MISSIONS)if(m.activeCheck(s))return m;
 // If all complete, return the last completed one
 for(let i=MISSIONS.length-1;i>=0;i--)if(MISSIONS[i].completeCheck(s))return MISSIONS[i];
 return MISSIONS[0];
}

/** Returns the next mission that should unlock, or null if all done */
export function nextMission(s){
 for(const m of MISSIONS)if(!m.completeCheck(s)&&m.startCheck(s)&&!m.activeCheck(s))return m;
 return null;
}

/** Returns array of completed mission IDs */
export function completedMissions(s){
 return MISSIONS.filter(m=>m.completeCheck(s)).map(m=>m.id);
}

/** Returns mission by code name */
export function missionByCode(code){
 return MISSIONS.find(m=>m.code===code)||null;
}

/** Check if a specific mission can start */
export function canStartMission(s,missionId){
 const m=MISSIONS.find(x=>x.id===missionId);
 if(!m)return false;
 return m.startCheck(s);
}

/** Returns the overall player progression percentage (0-1) */
export function overallProgress(s){
 const total=MISSIONS.length;
 const done=MISSIONS.filter(m=>m.completeCheck(s)).length;
 // Add partial progress for active mission
 const active=MISSIONS.find(m=>m.activeCheck(s));
 let partial=0;
 if(active){
  if(active.code==='chapter'){
   const steps=['clear','build','speed','enter','admin','next'];
   const obj=objective(s);
   const idx=steps.indexOf(obj);
   partial=(idx>=0?idx:steps.length)/steps.length;
  }else if(active.code==='hsec'){
   // HSEC has 5 steps
   partial=0.5; // approximate
  }else if(active.code==='mission3'){
   const phases=['inactive','briefing','setup','survey','equip','drilling','delivery','complete'];
   const idx=phases.indexOf(s.mission3?.phase||'inactive');
   partial=idx/phases.length;
  }else if(active.code==='mission4'){
   const phases=['inactive','briefing','upgrade','equip','deploy','automate','production','complete'];
   const idx=phases.indexOf(s.mission4?.phase||'inactive');
   partial=idx/phases.length;
  }
 }
 return (done+partial)/total;
}

// ─── Transition Guards ──────────────────────────────────────────

/** Validates that a mission transition is safe (returns error string or null) */
export function validateTransition(s,fromMissionId,toMissionId){
 const from=MISSIONS.find(m=>m.id===fromMissionId);
 const to=MISSIONS.find(m=>m.id===toMissionId);
 if(!from||!to)return 'invalidMission';
 if(!from.completeCheck(s))return 'previousNotComplete';
 if(!to.startCheck(s))return 'prerequisitesNotMet';
 if(to.activeCheck(s)||to.completeCheck(s))return 'alreadyStarted';
 return null;
}

// ─── Reward Guards ──────────────────────────────────────────────

/** Check if a mission reward has already been given */
export function isRewardGiven(s,missionId){
 const m=MISSIONS.find(x=>x.id===missionId);
 if(!m)return true; // safety: treat unknown as already given
 return m.rewardedCheck(s);
}

/** Safe reward delivery — returns false if already given */
export function giveReward(s,missionId,now=Date.now()){
 const m=MISSIONS.find(x=>x.id===missionId);
 if(!m||!m.reward||m.rewardedCheck(s))return false;
 s.cash+=m.reward;
 s.ledger.push({id:s.nextId++,key:m.rewardKey,label:m.rewardLabel,amount:m.reward,at:now});
 return true;
}

// ─── Restore Validation ─────────────────────────────────────────

/** Called during save restore to fix mission state inconsistencies */
export function validateMissionState(s){
 const fixes=[];

 // Fix 1: M1 completed but reward never given
 if(s.chapterCompletedAt&&!s.ledger?.some(l=>l.key==='missionReward')){
  s.cash+=5000;
  s.ledger.push({id:s.nextId++,key:'missionReward',label:'Recompensa · Misión 1 (recuperada)',amount:5000,at:Date.now()});
  fixes.push('m1RewardRecovered');
 }

 // Fix 2: M3 should be started but isn't
 if(s.hsec?.completedAt&&s.office?.level>=2&&(!s.mission3||s.mission3.phase==='inactive')){
  fixes.push('m3ShouldStart');
 }

 // Fix 3: M4 should be started but isn't
 if(s.mission3?.phase==='complete'&&s.contract?.status==='delivered'&&
    (!s.mission4||s.mission4.phase==='inactive')){
  fixes.push('m4ShouldStart');
 }

 // Fix 4: Zones stuck in maintenance with no active truck maintenance
 if(s.mission4?.drillTruck&&!s.mission4.drillTruck.maintenancePhase){
  for(const z of s.mission4?.zones||[]){
   if(z.status==='maintenance'){z.status='idle';fixes.push('zoneUnstuck:'+z.id);}
  }
 }

 return fixes;
}
