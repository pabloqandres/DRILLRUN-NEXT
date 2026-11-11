// V76 · Forward-compatible, inactive skill tree contract.
// The visual levels are recorded on hires. Gameplay hooks must explicitly opt in.
// This file NEVER changes cash, production, missions, employee assignments or XP.
import {SKILLS,ROLE_GROUPS} from './personnel-candidates-v76.mjs';
export const SKILL_CAP=5;
export const PROFILE_SKILLS_VERSION=1;
export const SKILL_XP_REQUIREMENTS=Object.freeze([0,60,180,400,750]);
export const ROLE_PATHWAYS=Object.freeze({
 admin:['negotiation','planning','efficiency','reports','leadership'],
 driller:['drilling','precision','safety','coordination','efficiency'],
 helper:['logistics','coordination','safety','response','leadership'],
 hsec:['safety','reports','leadership','response','planning'],
 tecnicoDrillco:['maintenance','diagnosis','automation','efficiency','precision'],
 'm5-gate-security':['safety','response','leadership','reports','coordination'],
 'm5-warehouse-tech':['logistics','diagnosis','maintenance','efficiency','coordination']
});
export const PLAYER_SKILL_BLUEPRINT=Object.freeze([
 {id:'leadership',label:'Liderazgo',maxLevel:5},
 {id:'negotiation',label:'Negociación',maxLevel:5},
 {id:'efficiency',label:'Eficiencia',maxLevel:5},
 {id:'safety',label:'Seguridad',maxLevel:5},
 {id:'planning',label:'Planificación',maxLevel:5}
]);
export const GAMEPLAY_SKILL_EFFECTS=Object.freeze({
 // Future formula registry: no values are applied until an explicitly
 // reviewed balancing pass (e.g. +incomePerShift, -maintenanceMinutes).
 enabled:false,
 perShiftIncome:0,
 contractBonusPercent:0,
 maintenanceTimePercent:0,
 riskReductionPercent:0
});
export function skillTreeForRole(roleId){
 return (ROLE_PATHWAYS[roleId]||[]).filter(id=>Boolean(SKILLS[id]))
  .map(id=>({id,...SKILLS[id],maxLevel:SKILL_CAP,experienceLevels:SKILL_XP_REQUIREMENTS}));
}
export function profileSkillSnapshot(person){
 const skills={};
 for(const [key,value] of Object.entries(person?.profileSkills||{})){
  if(!SKILLS[key])continue;
  skills[key]={level:Math.max(1,Math.min(SKILL_CAP,Math.floor(Number(value)||1))),xp:Math.max(0,Number(person?.profileSkillXP?.[key])||0)};
 }
 return {schema:PROFILE_SKILLS_VERSION,active:person?.skillsGameplayActive===true,skills};
}
export function nextSkillMilestone(person,skillId){
 const record=profileSkillSnapshot(person).skills[skillId];
 if(!record)return null;
 if(record.level>=SKILL_CAP)return {maxed:true,remaining:0};
 return {maxed:false,remaining:Math.max(0,(SKILL_XP_REQUIREMENTS[record.level]||0)-record.xp)};
}
export function skillEffectPreview(person,skillId){
 const record=profileSkillSnapshot(person).skills[skillId];
 return record?{id:skillId,level:record.level,enabled:false,plannedEffect:'Pendiente de definir por rol',numericEffect:0}:null;
}
