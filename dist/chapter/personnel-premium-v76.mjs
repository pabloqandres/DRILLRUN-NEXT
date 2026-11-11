// V77 · Visual placeholders, three visible skills and true roster selection.
// Base V76 still handles candidate identities and mission-authoritative hires.
// Pure presentation: existing mission hire actions are the only authority.
// Candidate skill data is persisted by the employment controllers, and
// skill gameplay effects are reserved for a separately approved system.
import {PERSONNEL_GROUPS,PERSONNEL_SKILL_LABELS,candidatesForRole,candidateById,activePersonnelCount,personnelCapacity,personnelUnlockMission} from './personnel-candidates-v76.mjs';
import {canHire} from '../mission3/personnel.mjs';
import {canHirePatioStaff,hiredPatioStaff} from '../mission5/patio-staff.mjs';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={admin:'dock-clipboard',driller:'dock-hard-hat',helper:'dock-users',hsec:'dock-hsec',tecnicoDrillco:'wrench','m5-gate-security':'lock','m5-warehouse-tech':'dock-equipment'};
const money=n=>'🪙 '+Math.round(Number(n)||0).toLocaleString('es-CL');
const reasons={
 invalidRole:'Rol desconocido',invalidCandidate:'Candidato no disponible',roleFull:'Plaza ocupada',
 needsOfficeL2:'Requiere Oficina Nivel 2',needsWorkshop:'Finaliza el galpón de mantenimiento',
 needsDrill:'Adquiere primero una perforadora',needsGeoRequest:'Solicita análisis geológico',
 needsWorkshopNv2:'Amplía el Taller a Nivel 2',noMoney:'Saldo insuficiente',
 buildPatioFirst:'Finaliza Patio de Maquinarias',acceptM5First:'Acepta la misión 5',
 hireGuardFirst:'Contrata primero al guardia',alreadyHired:'Ya contratado'
};
const roleById=id=>PERSONNEL_GROUPS.find(g=>g.id===id);
const isPatio=id=>id?.startsWith('m5-');
const hiredRole=(s,id)=>{
 if(id==='hsec'&&s?.hsec?.employee)return true;
 if(isPatio(id))return hiredPatioStaff(s,id);
 return (s?.personnel||[]).some(p=>p.role===id);
};
export function activePersonnel(s){
 const people=(s?.personnel||[]).map(p=>({
  id:p.id,role:p.role,candidateId:p.candidateId||p.id,
  name:p.name||candidateById(p.id)?.name||null,level:p.level||1,state:p.state||'idle',
  skillProfile:p.skillProfile||null
 }));
 if(s?.hsec?.employee&&!people.some(p=>p.role==='hsec')){
  const e=s.hsec.employee,c=candidateById(e.id);
  people.unshift({id:e.id,role:'hsec',candidateId:c?.id||e.id,name:c?.name||'Prevencionista HSEC',level:e.level||1,state:e.state||'idle',skillProfile:null});
 }
 for(const [id,entry] of Object.entries(s?.mission5?.staff||{})){
  if(!entry?.hiredAt)continue;
  const c=candidateById(entry.candidateId);
  people.push({id,role:id,candidateId:entry.candidateId,name:c?.name||entry.name||roleById(id)?.label||id,level:1,state:'working',skillProfile:entry.skillProfile||null});
 }
 return people;
}
export const roleCount=(s,role)=>activePersonnel(s).filter(p=>p.role===role).length;
export function nextRequiredRole(s){
 const stage=personnelUnlockMission(s);
 if(stage>=5){
  if(!hiredRole(s,'m5-gate-security'))return 'm5-gate-security';
  if(!hiredRole(s,'m5-warehouse-tech'))return 'm5-warehouse-tech';
 }
 if(stage>=4&&!hiredRole(s,'tecnicoDrillco'))return 'tecnicoDrillco';
 if(stage>=3){
  if(!hiredRole(s,'admin'))return 'admin';
  if(!hiredRole(s,'driller'))return 'driller';
 }
 if(stage>=2&&!hiredRole(s,'hsec'))return 'hsec';
 return 'admin';
}
export function personnelAvailability(s,role,candidateId){
 const g=roleById(role);
 if(!g)return 'invalidRole';
 if(personnelUnlockMission(s)<g.unlock)return 'missionLocked';
 // An M2 prevencionista already in s.hsec.employee is never duplicated.
 return isPatio(role)?canHirePatioStaff(s,role,candidateId):canHire(s,role,candidateId);
}
export const portrait=c=>c?.portrait||'';
const placeholder=(c,mode='card')=>`<span class="pvEmptyPortrait pvEmptyPortrait--${mode}" role="img" aria-label="Retrato pendiente de ${esc(c?.name||'personal')}"><span class="pvEmptyPortraitFigure" aria-hidden="true"><span class="pvEmptyHead"></span><span class="pvEmptyBody"></span></span><small>RETRATO PENDIENTE</small></span>`;
const candidateSkillRows=c=>Object.entries(c?.skills||{}).map(([name,val])=>`<span class="pvCandidateSkill"><span>${esc(PERSONNEL_SKILL_LABELS[name]||name)}</span><span class="pvMiniPips" aria-label="${val} de 5">${Array.from({length:5},(_,i)=>`<i class="${i<val?'on':''}"></i>`).join('')}</span></span>`).join('');
const skillRows=c=>Object.entries(c?.skills||{}).map(([name,val])=>
 `<div class="pvSkill" title="Habilidad registrada para progresión futura, sin bono económico activo"><span>${esc(PERSONNEL_SKILL_LABELS[name]||name)}</span><span class="pvPips" aria-label="${val} de 5">${Array.from({length:5},(_,i)=>`<i class="${i<val?'on':''}"></i>`).join('')}</span><b>${val}/5</b></div>`
).join('');
const navRole=(s,g,role,ico)=>{
 const n=roleCount(s,g.id),unlocked=personnelUnlockMission(s)>=g.unlock;
 return `<button type="button" class="pvRole ${g.id===role?'selected':''} ${unlocked?'':'locked'}" data-pv-role="${g.id}" aria-pressed="${g.id===role}" title="${unlocked?g.description:'Se habilita en misión '+g.unlock}">
 <span class="pvRoleIcon">${ico(icons[g.id]||'personnel')}</span><span class="pvRoleLabel">${esc(g.label)}</span><b class="pvRoleCounter">${unlocked?n:'M'+g.unlock}</b></button>`;
};
export function renderPersonnelPremium(s,selectedRole,selectedId,icon){
 const role=roleById(selectedRole)||PERSONNEL_GROUPS[0];
 const team=activePersonnel(s),count=activePersonnelCount(s),capacity=Math.max(count,personnelCapacity(s));
 const mission=personnelUnlockMission(s),required=nextRequiredRole(s),requiredDef=roleById(required);
 const entries=candidatesForRole(role.id),selected=entries.find(c=>c.id===selectedId)||entries[0];
 const blocked=personnelAvailability(s,role.id,selected?.id);
 const employed=team.find(p=>p.candidateId===selected?.id);
 const warning=blocked==='missionLocked'?'Se habilita en misión '+role.unlock:reasons[blocked]||blocked;
 const step=role.id===required&&mission>=role.unlock;
 const countTxt=`${Math.min(count,capacity)} / ${capacity}`;
 const entryCards=entries.map((c,i)=>{
  const busy=!!team.find(p=>p.candidateId===c.id);
  const isSelected=c.id===selected.id;
  const locked=personnelAvailability(s,role.id,c.id);
  return `<button class="pvCandidate ${isSelected?'selected':''} ${busy?'hired':''} ${locked&&!busy?'unavailable':''}" type="button" data-pv-candidate="${c.id}" aria-pressed="${isSelected}">
   <span class="pvPortrait">${placeholder(c)}</span>
   <span class="pvCandidateName">${esc(c.name)}</span><span class="pvCandidateStars" aria-label="Perfil de ${c.grade} estrellas">${'★'.repeat(c.grade)}<span>${'★'.repeat(5-c.grade)}</span></span>
   <span class="pvCandidateMetrics">${candidateSkillRows(c)}</span>
   <span class="pvCandidateCost">${money(c.hireCost)}</span>
   <span class="pvCandidateState">${busy?'CONTRATADO':locked?'BLOQUEADO':'DISPONIBLE'}</span>
  </button>`;
 }).join('');
 const slots=Array.from({length:Math.min(capacity,8)},(_,i)=>{
  const p=team[i];
  if(p){const c=candidateById(p.candidateId);return `<button class="pvTeamSlot occupied" type="button" data-pv-roster="${esc(p.role)}" data-pv-person="${esc(p.candidateId||'')}" aria-label="Ver ${esc(p.name||roleById(p.role)?.label||'contratado')}">
   ${c?`${placeholder(c,'team')}`:`<span class="pvTeamFallback">${icon('personnel')}</span>`}
   <span><b>${esc(p.name||roleById(p.role)?.label||'Contratado')}</b><small>${esc(roleById(p.role)?.short||p.role)}</small></span><span class="pvHiredCheck">${icon('check')}</span></button>`;}
  return `<span class="pvTeamSlot vacant"><span class="pvPlus">+</span><span>Disponible</span></span>`;
 }).join('');
 return `<section class="pvRoot" aria-label="Personal, contratación y equipo">
 <div class="pvMain">
  <aside class="pvSidebar" aria-label="Roles y requerimientos">
   <button class="pvMission" data-pv-requirement type="button" title="Ir a la siguiente contratación">
    <span class="pvMissionBadge">MISIÓN ${mission}</span><b>${mission===5?'Una base para crecer':mission===4?'Operación productiva':mission===3?'Tu primer contrato':'Seguridad de tu operación'}</b>
    <small>${hiredRole(s,required)?'Contratación completada':'Siguiente contratación requerida:'}</small>
    <span class="pvMissionTarget"><span>${icon(icons[required]||'personnel')}</span>${esc(requiredDef.label)}<b>${roleCount(s,required)}/1</b></span>
   </button>
   <div class="pvRoleHeading">ROLES DISPONIBLES <span>${PERSONNEL_GROUPS.length}</span></div>
   <nav class="pvRoles" aria-label="Categorías de contratación">${PERSONNEL_GROUPS.map(g=>navRole(s,g,role.id,icon)).join('')}</nav>
  </aside>
  <section class="pvCenter" aria-label="Candidatos">
   <div class="pvSectionHead"><div><span class="pvEyebrow">${step?'OBJETIVO ACTUAL':'SELECCIÓN DE PERSONAL'}</span><h3>${esc(role.label)}</h3><p>${esc(role.description)}</p></div>
   <div class="pvCarouselControls"><button type="button" data-pv-prev aria-label="Candidato anterior">‹</button><span>${entries.findIndex(x=>x.id===selected.id)+1} / 3</span><button type="button" data-pv-next aria-label="Siguiente candidato">›</button></div></div>
   <div class="pvCandidates">${entryCards}</div>
  </section>
  <aside class="pvDetail" aria-label="Ficha del candidato seleccionado">
   <div class="pvDetailHero"><div><span class="pvEyebrow">CANDIDATO SELECCIONADO</span><h3>${esc(selected.name)}</h3><span class="pvCandidateStars">${'★'.repeat(selected.grade)}<span>${'★'.repeat(5-selected.grade)}</span></span></div>
   ${placeholder(selected,'detail')}</div>
   <p class="pvBio">${esc(selected.description)}</p>
   <div class="pvSkillsHeader">HABILIDADES <span>REGISTRADAS</span></div>
   <div class="pvSkills">${skillRows(selected)}</div>
   <div class="pvFutureNote">${icon('zap')} Preparadas para evolución; sin bonos de ingresos activos.</div>
   <div class="pvHireActions"><span class="pvHirePrice"><small>COSTO ÚNICO</small><b>${money(selected.hireCost)}</b></span>
    <button class="pvHire ${blocked?'blocked':''}" data-pv-hire type="button" ${blocked?'disabled':''}>${icon(blocked?'lock':'personnel')} ${employed?'Contratado':blocked?'No disponible':'Contratar'}</button></div>
   ${blocked?`<small class="pvHireReason">${esc(warning)}</small>`:''}
  </aside>
 </div>
 <footer class="pvTeam"><div class="pvTeamCount"><span>${icon('dock-users')}</span><span>Equipo activo<strong>${countTxt}</strong></span></div>
 <div class="pvTeamList" aria-label="Personal contratado y plazas">${slots}</div>
 <div class="pvTeamHelp">Las plazas se amplían automáticamente con nuevas misiones.</div></footer>
 </section>`;
}
