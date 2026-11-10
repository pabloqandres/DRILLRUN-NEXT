import {m5AssetsReady} from '../mission5/assets-ready.mjs';
// Narrative Mission Flow System
// Manages character-driven mission start/end messages, acceptance, and reward confirmation.
// Reusable: each mission declares its narrative script; the engine handles state transitions.

export const CHARACTERS={
 benefactor:{id:'benefactor',nameKey:'char_benefactor',roleKey:'char_benefactorRole',color:'#f6c56d',avatarIcon:'avatar-benefactor'},
 safetySpecialist:{id:'safetySpecialist',nameKey:'char_safety',roleKey:'char_safetyRole',color:'#8bd9cf',avatarIcon:'avatar-safety'},
 contractAdmin:{id:'contractAdmin',nameKey:'char_contract',roleKey:'char_contractRole',color:'#e8a87c',avatarIcon:'avatar-contract'},
};

// Per-mission narrative declarations
// trigger: when the message becomes available for delivery
//   'immediate' = available right after newGame/beginPlay
//   'mX:complete' = after mission X reward collected
//   'mX:accepted' = after mission X accepted
//   'completion' = after mission objectives are met
export const MISSION_NARRATIVES={
 m1:{
  character:'benefactor',
  missionNameKey:'narr_m1_name',
  missionNumber:1,
  start:{id:'n:m1:start',bodyKey:'narr_m1_start',actions:[{type:'accept',labelKey:'narr_acceptMission'}]},
  end:{id:'n:m1:end',bodyKey:'narr_m1_end',actions:[{type:'collect',labelKey:'narr_completeMission'}],
   reward:{cash:5000,boosters:0,ledgerKey:'missionReward',label:'Recompensa · Misión 1'}},
 },
 m2:{
  character:'safetySpecialist',
  missionNameKey:'narr_m2_name',
  missionNumber:2,
  start:{id:'n:m2:start',bodyKey:'narr_m2_start',actions:[{type:'accept',labelKey:'narr_acceptMission'}]},
  grant:{id:'n:m2:grant',bodyKey:'narr_m2_grant',actions:[]},
  end:{id:'n:m2:end',bodyKey:'narr_m2_end',actions:[{type:'collect',labelKey:'narr_completeMission'}],
   reward:{cash:35000,boosters:1,ledgerKey:'hsecReward',label:'Recompensa · Misión 2'}},
 },
 m3:{
  character:'contractAdmin',
  missionNameKey:'narr_m3_name',
  missionNumber:3,
  start:{id:'n:m3:start',bodyKey:'narr_m3_start',actions:[{type:'accept',labelKey:'narr_acceptMission'}]},
  end:{id:'n:m3:end',bodyKey:'narr_m3_end',actions:[{type:'collect',labelKey:'narr_confirmMission'}],
   reward:null}, // M3 reward given by completeContract(), narrative just confirms
 },
 m4:{
  character:'benefactor',
  missionNameKey:'narr_m4_name',
  missionNumber:4,
  start:{id:'n:m4:start',bodyKey:'narr_m4_start',actions:[{type:'accept',labelKey:'narr_acceptMission'}]},
  end:{id:'n:m4:end',bodyKey:'narr_m4_end',actions:[{type:'collect',labelKey:'narr_confirmMission'}],
   reward:null}, // M4 production income already tracked
 },
 m5:{
  character:'benefactor',
  missionNameKey:'narr_m5_name',
  missionNumber:5,
  start:{id:'n:m5:start',bodyKey:'narr_m5_start',actions:[{type:'accept',labelKey:'narr_acceptMission'}]},
  end:{id:'n:m5:end',bodyKey:'narr_m5_end',actions:[{type:'collect',labelKey:'narr_completeMission'}],reward:null}
 },
};

// ─── State helpers ──────────────────────────────────────

export function ensureNarrative(s){
 if(!s.narrative)s.narrative={messages:[],accepted:[],rewardsCollected:[]};
 s.narrative.messages??=[];
 s.narrative.accepted??=[];
 s.narrative.rewardsCollected??=[];
 return s.narrative;
}

function hasMessage(s,id){return s.narrative.messages.some(m=>m.id===id);}
function isAccepted(s,mid){return s.narrative.accepted.includes(mid);}
function isCollected(s,mid){return s.narrative.rewardsCollected.includes(mid);}

// ─── Message delivery ───────────────────────────────────

// Returns the next narrative message that should be delivered, or null
export function pendingMessage(s){
 ensureNarrative(s);
 const n=s.narrative;

 // M1 start: immediately available for new games (intro seen, not yet delivered)
 if(!hasMessage(s,'n:m1:start')&&s.introSeen)
  return mkMsg('n:m1:start','m1',MISSION_NARRATIVES.m1);

 // M1 end: objectives done (chapterCompletedAt set) but reward not collected
 if(isAccepted(s,'m1')&&s.chapterCompletedAt&&!hasMessage(s,'n:m1:end')&&!isCollected(s,'m1'))
  return mkMsg('n:m1:end','m1',MISSION_NARRATIVES.m1);

 // M2 start: after M1 reward collected
 if(isCollected(s,'m1')&&!hasMessage(s,'n:m2:start'))
  return mkMsg('n:m2:start','m2',MISSION_NARRATIVES.m2);

 // M2 grant: after M2 accepted and HSEC grant given
 if(isAccepted(s,'m2')&&s.hsec?.grant&&!hasMessage(s,'n:m2:grant'))
  return mkMsg('n:m2:grant','m2',MISSION_NARRATIVES.m2,true);

 // M2 end: HSEC objectives done (completedAt set) but reward not collected
 if(isAccepted(s,'m2')&&s.hsec?.completedAt&&!hasMessage(s,'n:m2:end')&&!isCollected(s,'m2'))
  return mkMsg('n:m2:end','m2',MISSION_NARRATIVES.m2);

 // M3 start: after M2 reward collected
 if(isCollected(s,'m2')&&!hasMessage(s,'n:m3:start'))
  return mkMsg('n:m3:start','m3',MISSION_NARRATIVES.m3);

 // M3 end: contract delivered but not narratively confirmed
 if(isAccepted(s,'m3')&&s.mission3?.phase==='complete'&&!hasMessage(s,'n:m3:end')&&!isCollected(s,'m3'))
  return mkMsg('n:m3:end','m3',MISSION_NARRATIVES.m3);

 // M4 start: after M3 confirmed
 if(isCollected(s,'m3')&&!hasMessage(s,'n:m4:start'))
  return mkMsg('n:m4:start','m4',MISSION_NARRATIVES.m4);

 // M4 end: mission4 phase==='complete' but not narratively confirmed
 if(isAccepted(s,'m4')&&s.mission4?.phase==='complete'&&!hasMessage(s,'n:m4:end')&&!isCollected(s,'m4'))
  return mkMsg('n:m4:end','m4',MISSION_NARRATIVES.m4);

 // M5 starts only after the player confirms M4's final SMS.
 // Already-built M5 yards from older saves don't need to be re-purchased.
 if(m5AssetsReady&&isCollected(s,'m4')&&s.mission4?.phase==='complete'&&!hasMessage(s,'n:m5:start'))
  return mkMsg('n:m5:start','m5',MISSION_NARRATIVES.m5);
 // End SMS is tied to operational patio + two hires + guard/warehouse checks,
 // never to the construction timer alone.
 if(isAccepted(s,'m5')&&s.mission5?.commissionedAt&&!hasMessage(s,'n:m5:end')&&!isCollected(s,'m5'))
  return mkMsg('n:m5:end','m5',MISSION_NARRATIVES.m5);

 return null;
}

function mkMsg(id,missionId,narr,isGrant){
 const script=isGrant?narr.grant:id.endsWith(':end')?narr.end:narr.start;
 return{
  id,
  characterId:narr.character,
  missionId,
  bodyKey:script.bodyKey,
  actions:script.actions||[],
 };
}

// Deliver a pending message into the save state
export function deliverMessage(s,msgId){
 ensureNarrative(s);
 if(hasMessage(s,msgId))return false;
 const msg=pendingMessage(s);
 if(!msg||msg.id!==msgId)return false;
 s.narrative.messages.push({
  ...msg,
  deliveredAt:Date.now(),
  readAt:null,
  actionTaken:null,
 });
 return true;
}

// Mark all messages for a character as read
export function markCharacterRead(s,charId){
 ensureNarrative(s);
 const now=Date.now();
 for(const m of s.narrative.messages){
  if(m.characterId===charId&&!m.readAt)m.readAt=now;
 }
}

// ─── Player actions ─────────────────────────────────────

// Player accepts a mission (presses accept button on start message)
export function acceptMission(s,missionId){
 ensureNarrative(s);
 if(isAccepted(s,missionId))return false;
 // Find the start message and mark action taken
 const startMsg=s.narrative.messages.find(m=>m.id===`n:${missionId}:start`);
 if(!startMsg)return false;
 startMsg.actionTaken='accept';
 s.narrative.accepted.push(missionId);
 return true;
}

// Player confirms mission completion (presses collect button on end message)
// Returns reward info or null
export function confirmCompletion(s,missionId,now=Date.now()){
 ensureNarrative(s);
 if(isCollected(s,missionId))return null;
 const endMsg=s.narrative.messages.find(m=>m.id===`n:${missionId}:end`);
 if(!endMsg)return null;
 endMsg.actionTaken='collect';
 s.narrative.rewardsCollected.push(missionId);

 // Deliver reward if defined
 const narr=MISSION_NARRATIVES[missionId];
 const rewardDef=narr?.end?.reward;
 if(rewardDef&&rewardDef.cash>0&&!(s.ledger||[]).some(l=>l.key===rewardDef.ledgerKey)){
  s.cash+=rewardDef.cash;
  s.ledger.push({id:s.nextId++,key:rewardDef.ledgerKey,label:rewardDef.label,amount:rewardDef.cash,at:now});
  if(rewardDef.boosters)s.boosters=(s.boosters||0)+rewardDef.boosters;
  // Set mission-specific flags
  if(missionId==='m2'&&s.hsec)s.hsec.rewarded=true;
 }
 return{missionId,cash:rewardDef?.cash||0,boosters:rewardDef?.boosters||0,name:narr.missionNameKey,number:narr.missionNumber};
}

// The right-side mission card represents accepted, uncollected narrative missions only.
// It remains visible while the objectives are done but the closing text is unconfirmed.
export function activeNarrativeMission(s){
 ensureNarrative(s);
 for(const missionId of ['m1','m2','m3','m4','m5']){
  if(isAccepted(s,missionId)&&!isCollected(s,missionId))return missionId;
 }
 return null;
}

// ─── Query helpers ──────────────────────────────────────

export function narrativeUnread(s){
 ensureNarrative(s);
 return s.narrative.messages.filter(m=>!m.readAt).length;
}

export function characterUnread(s,charId){
 ensureNarrative(s);
 return s.narrative.messages.filter(m=>m.characterId===charId&&!m.readAt).length;
}

export function characterConversation(s,charId){
 ensureNarrative(s);
 return s.narrative.messages.filter(m=>m.characterId===charId).sort((a,b)=>a.deliveredAt-b.deliveredAt);
}

// Returns characters that have at least one message, sorted by most recent message
export function activeCharacters(s){
 ensureNarrative(s);
 const map=new Map();
 for(const m of s.narrative.messages){
  const existing=map.get(m.characterId);
  if(!existing||m.deliveredAt>existing.lastAt)
   map.set(m.characterId,{id:m.characterId,...CHARACTERS[m.characterId],lastAt:m.deliveredAt,lastBodyKey:m.bodyKey});
 }
 return [...map.values()].sort((a,b)=>b.lastAt-a.lastAt);
}

// Check if mission objectives are gated behind narrative acceptance
export function isMissionAccepted(s,missionId){
 ensureNarrative(s);
 return isAccepted(s,missionId);
}

export function isMissionCollected(s,missionId){
 ensureNarrative(s);
 return isCollected(s,missionId);
}

// ─── Migration ──────────────────────────────────────────

// Called from restore() to backfill narrative state for existing saves
export function migrateNarrative(s,now=Date.now()){
 ensureNarrative(s);
 const n=s.narrative;
 if(n.messages.length>0)return; // Already migrated

 const ts=s.savedAt||now;
 function addHistorical(id,charId,missionId,bodyKey,actionType){
  n.messages.push({id,characterId:charId,missionId,bodyKey,actions:[],deliveredAt:ts-5000,readAt:ts-4000,actionTaken:actionType});
 }

 // M1: if chapterCompletedAt is set, M1 was fully completed
 if(s.chapterCompletedAt){
  if(!n.accepted.includes('m1'))n.accepted.push('m1');
  if(!n.rewardsCollected.includes('m1'))n.rewardsCollected.push('m1');
  addHistorical('n:m1:start','benefactor','m1','narr_m1_start','accept');
  addHistorical('n:m1:end','benefactor','m1','narr_m1_end','collect');
 }

 // M2: if HSEC completed
 if(s.hsec?.completedAt){
  if(!n.accepted.includes('m2'))n.accepted.push('m2');
  addHistorical('n:m2:start','safetySpecialist','m2','narr_m2_start','accept');
  if(s.hsec?.grant)addHistorical('n:m2:grant','safetySpecialist','m2','narr_m2_grant',null);
  if(s.hsec?.rewarded){
   if(!n.rewardsCollected.includes('m2'))n.rewardsCollected.push('m2');
   addHistorical('n:m2:end','safetySpecialist','m2','narr_m2_end','collect');
  }else{
   // Edge case: HSEC completed but reward not given (old bug or crash)
   // Give reward now to avoid softlock
   s.cash+=35000;s.boosters=(s.boosters||0)+1;s.hsec.rewarded=true;
   s.ledger.push({id:s.nextId++,key:'hsecReward',label:'Recompensa · Misión 2 (recuperada)',amount:35000,at:now});
   if(!n.rewardsCollected.includes('m2'))n.rewardsCollected.push('m2');
   addHistorical('n:m2:end','safetySpecialist','m2','narr_m2_end','collect');
  }
 }else if(s.hsec&&s.chapterCompletedAt){
  // M2 active but not complete — player accepted under old system
  if(!n.accepted.includes('m2'))n.accepted.push('m2');
  addHistorical('n:m2:start','safetySpecialist','m2','narr_m2_start','accept');
  if(s.hsec?.grant)addHistorical('n:m2:grant','safetySpecialist','m2','narr_m2_grant',null);
 }

 // M3: if mission3 exists and not inactive
 if(s.mission3&&s.mission3.phase!=='inactive'){
  if(!n.accepted.includes('m3'))n.accepted.push('m3');
  addHistorical('n:m3:start','contractAdmin','m3','narr_m3_start','accept');
  if(s.mission3.phase==='complete'){
   if(!n.rewardsCollected.includes('m3'))n.rewardsCollected.push('m3');
   addHistorical('n:m3:end','contractAdmin','m3','narr_m3_end','collect');
  }
 }

 // M4: if mission4 exists and not inactive
 if(s.mission4&&s.mission4.phase!=='inactive'){
  if(!n.accepted.includes('m4'))n.accepted.push('m4');
  addHistorical('n:m4:start','benefactor','m4','narr_m4_start','accept');
  if(s.mission4.phase==='complete'){
   if(!n.rewardsCollected.includes('m4'))n.rewardsCollected.push('m4');
   addHistorical('n:m4:end','benefactor','m4','narr_m4_end','collect');
  }
 }
}
