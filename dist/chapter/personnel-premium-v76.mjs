// V78 · First illustrated Administration trio and more breathing room in Personnel.\n// V77 placeholders remain for every not-yet-approved role.
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
const V78_ADMIN_ART=Object.freeze({
 'adm-camila-rojas':'camila',
 'adm-matias-torres':'matias',
 'adm-sofia-ibarra':'sofia'
});
const portraitIllustration=(c,mode='card')=>{
 const art=V78_ADMIN_ART[c?.id];
 return art
  ? `<span class="pvArtPortrait pvArtPortrait--${mode} pvArtPortrait--${art}" role="img" aria-label="Retrato ilustrado de ${esc(c.name)}"><img class="pvPortraitImage" src="./assets/npc-portraits-v80/${esc(c.id)}.svg" alt="" draggable="false" loading="eager" decoding="async" width="230" height="260"></span>`
  : placeholder(c,mode);
};
const placeholder=(c,mode='card')=>`<span class="pvEmptyPortrait pvEmptyPortrait--${mode}" role="img" aria-label="Retrato pendiente de ${esc(c?.name||'personal')}"><span class="pvEmptyPortraitFigure" aria-hidden="true"><span class="pvEmptyHead"></span><span class="pvEmptyBody"></span></span><small>RETRATO PENDIENTE</small></span>`;

const statShapes=Object.freeze({
 handshake:'<path d="M2 12l5-4 3 2 4-2 8 6-5 5-4-3-2 2-4-3-2 1z"/><path d="M9 11l7 5"/>',
 bars:'<rect x="3" y="14" width="4" height="7"/><rect x="10" y="9" width="4" height="12"/><rect x="17" y="3" width="4" height="18"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m3 0h3M7 18h4"/>',
 clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
 people:'<circle cx="9" cy="7" r="3"/><circle cx="17.5" cy="8" r="2.5"/><path d="M3 21v-4a6 6 0 0 1 12 0v4m2-9a5 5 0 0 1 5 5v4"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
 shield:'<path d="M12 2L3 6v6c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10V6z"/><path d="M8 12l3 3 5-6"/>',
 wrench:'<path d="M21 5a6 6 0 0 1-7 7L6 20a3 3 0 0 1-4-4l8-8a6 6 0 0 1 7-7l-4 4 5 5z"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 truck:'<rect x="2" y="8" width="14" height="10"/><path d="M16 11h4l2 4v3h-6"/><circle cx="6" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
 analysis:'<path d="M3 21V3m0 18h18M7 16l4-5 4 2 5-8"/>'
});
const statTypes=Object.freeze({
 negotiation:'handshake',efficiency:'bars',planning:'calendar',reporting:'clipboard',
 coordination:'people',teamwork:'people',support:'people',drilling:'target',precision:'target',
 rigging:'wrench',safety:'shield',inspection:'eye',compliance:'shield',
 maintenance:'wrench',automation:'wrench',repair:'wrench',vigilance:'eye',response:'shield',
 logistics:'truck',inventory:'clipboard',fleet:'truck',analysis:'analysis'
});
const statIcon=key=>'<svg class="pvStatGlyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+statShapes[statTypes[key]||'analysis']+'</svg>';
const tabIcon=key=>statIcon(({ficha:'reporting',desarrollo:'analysis',salario:'planning',historial:'response'})[key]||'reporting');
const candidateSkillRows=c=>Object.entries(c?.skills||{}).map(([name,val])=>`<span class="pvCandidateSkill"><span class="pvSkillGlyph">${statIcon(name)}</span><span class="pvSkillLabel">${esc(PERSONNEL_SKILL_LABELS[name]||name)}</span><span class="pvMiniPips" aria-label="${val} de 5">${Array.from({length:5},(_,i)=>`<i class="${i<val?'on':''}"></i>`).join('')}</span></span>`).join('');
const skillRows=c=>Object.entries(c?.skills||{}).map(([name,val])=>
 `<div class="pvSkill" title="Habilidad registrada para progresión futura, sin bono económico activo"><span class="pvSkillGlyph">${statIcon(name)}</span><span class="pvSkillLabel">${esc(PERSONNEL_SKILL_LABELS[name]||name)}</span><span class="pvPips" aria-label="${val} de 5">${Array.from({length:5},(_,i)=>`<i class="${i<val?'on':''}"></i>`).join('')}</span><b>${val}/5</b></div>`
).join('');
const navRole=(s,g,role,ico)=>{
 const n=roleCount(s,g.id),unlocked=personnelUnlockMission(s)>=g.unlock;
 return `<button type="button" class="pvRole ${g.id===role?'selected':''} ${unlocked?'':'locked'}" data-pv-role="${g.id}" aria-pressed="${g.id===role}" title="${unlocked?g.description:'Se habilita en misión '+g.unlock}">
 <span class="pvRoleIcon">${ico(icons[g.id]||'personnel')}</span><span class="pvRoleLabel">${esc(g.label)}</span><b class="pvRoleCounter">${unlocked?n:'M'+g.unlock}</b></button>`;
};
export function renderPersonnelPremium(s,selectedRole,selectedId,icon,view='recruit',detailTab='ficha'){
 if(view==='team')return renderPersonnelManagement(s,selectedId,icon);
 const role=roleById(selectedRole)||PERSONNEL_GROUPS[0];
 const team=activePersonnel(s),count=activePersonnelCount(s),capacity=Math.max(count,personnelCapacity(s));
 const mission=personnelUnlockMission(s),required=nextRequiredRole(s),requiredDef=roleById(required);
 const entries=candidatesForRole(role.id),selected=entries.find(c=>c.id===selectedId)||entries[0];
 const blocked=personnelAvailability(s,role.id,selected?.id);
 const employed=team.find(p=>p.candidateId===selected?.id);
 const warning=blocked==='missionLocked'?'Se habilita en misión '+role.unlock:reasons[blocked]||blocked;
 const step=role.id===required&&mission>=role.unlock;
 const countTxt=`${Math.min(count,capacity)} / ${capacity}`;
 const activeTab=['ficha','desarrollo','salario','historial'].includes(detailTab)?detailTab:'ficha';
 const free=!!(s?.mission5?.commissionedAt&&s?.narrative?.rewardsCollected?.includes('m5'));
 const missionArt=free?'free':'m'+mission;
 const missionTitle=free?'Juego libre':mission===5?'Una base para crecer':mission===4?'Operación productiva':mission===3?'Tu primer contrato':'Seguridad de tu operación';
 const entryCards=entries.map((c,i)=>{
  const busy=!!team.find(p=>p.candidateId===c.id);
  const isSelected=c.id===selected.id;
  const locked=personnelAvailability(s,role.id,c.id);
  return `<button class="pvCandidate ${isSelected?'selected':''} ${busy?'hired':''} ${locked&&!busy?'unavailable':''}" type="button" data-pv-candidate="${c.id}" aria-pressed="${isSelected}">
   <span class="pvPortrait">${portraitIllustration(c)}</span>
   <span class="pvCandidateName">${esc(c.name)}</span><span class="pvCandidateStars" aria-label="Perfil de ${c.grade} estrellas">${'★'.repeat(c.grade)}<span>${'★'.repeat(5-c.grade)}</span></span>
   <span class="pvCandidateMetrics">${candidateSkillRows(c)}</span>
   <span class="pvCandidateCost">${money(c.hireCost)}</span>
   <span class="pvCandidateState">${busy?'CONTRATADO':locked?'BLOQUEADO':'DISPONIBLE'}</span>
  </button>`;
 }).join('');
 const slots=Array.from({length:Math.max(capacity,team.length)},(_,i)=>{
  const p=team[i];
  if(p){const c=candidateById(p.candidateId);return `<button class="pvTeamSlot occupied" type="button" data-pv-roster="${esc(p.role)}" data-pv-person="${esc(p.candidateId||'')}" aria-label="Ver ${esc(p.name||roleById(p.role)?.label||'contratado')}">
   ${c?`${portraitIllustration(c,'team')}`:`<span class="pvTeamFallback">${icon('personnel')}</span>`}
   <span><b>${esc(p.name||roleById(p.role)?.label||'Contratado')}</b><small>${esc(roleById(p.role)?.short||p.role)}</small></span><span class="pvHiredCheck">${icon('check')}</span></button>`;}
  return `<span class="pvTeamSlot vacant"><span class="pvPlus">+</span><span>Disponible</span></span>`;
 }).join('');
 return `<section class="pvRoot" aria-label="Personal, contratación y equipo">
 <div class="pvMain">
  <aside class="pvSidebar" aria-label="Roles y requerimientos">
   <button class="pvMission" data-pv-requirement data-pv-mission="${missionArt}" type="button" title="Ir a la siguiente contratación">
    <span class="pvMissionBadge">${free?'FAENA ACTIVA':'MISIÓN '+mission}</span><b>${missionTitle}</b>
    <small>${hiredRole(s,required)?'Contratación completada':'Siguiente contratación requerida:'}</small>
    <span class="pvMissionTarget"><span>${icon(icons[required]||'personnel')}</span>${esc(requiredDef.label)}<b>${roleCount(s,required)}/1</b></span>
   </button>
   <div class="pvRoleHeading">ROLES DISPONIBLES <span>${PERSONNEL_GROUPS.length}</span></div>
   <nav class="pvRoles" aria-label="Categorías de contratación">${PERSONNEL_GROUPS.map(g=>navRole(s,g,role.id,icon)).join('')}</nav>
  </aside>
  <section class="pvCenter" aria-label="Candidatos">
   <div class="pvSectionHead"><div class="pvRoleTitle"><span class="pvRoleTitleIcon">${icon(icons[role.id]||'dock-clipboard')}</span><div class="pvRoleTitleCopy"><span class="pvEyebrow">${step?'OBJETIVO ACTUAL':'SELECCIÓN DE PERSONAL'}</span><h3>${esc(role.label)}</h3><p>${esc(role.description)}</p></div></div>
   <div class="pvCarouselControls"><button type="button" data-pv-prev aria-label="Candidato anterior">‹</button><span>${entries.findIndex(x=>x.id===selected.id)+1} / 3</span><button type="button" data-pv-next aria-label="Siguiente candidato">›</button></div></div>
   <div class="pvCandidates">${entryCards}</div>
  </section>
  <aside class="pvDetail" aria-label="Ficha del candidato seleccionado">
   <div class="pvDetailHero">${portraitIllustration(selected,'detail')}<div class="pvDetailHeroCopy"><h3>${esc(selected.name)}</h3><span class="pvRoleBadge">${esc(role.short)}</span><span class="pvCandidateStars">${'★'.repeat(selected.grade)}<span>${'★'.repeat(5-selected.grade)}</span></span><p class="pvDetailSummary">${esc(selected.description)}</p></div></div>
   <nav class="pvDetailTabs" aria-label="Datos del candidato">${[['ficha','Ficha'],['desarrollo','Desarrollo'],['salario','Salario'],['historial','Historial']].map(([id,label])=>`<button type="button" data-pv-detail-tab="${id}" class="${activeTab===id?'active':''}" aria-pressed="${activeTab===id}">${tabIcon(id)}<span>${label}</span></button>`).join('')}</nav>
   <div class="pvDetailBody">
   ${activeTab==='ficha'? `<div class="pvSkillsHeader">HABILIDADES <span>NIVEL INICIAL</span></div>
    <div class="pvSkills">${skillRows(selected)}</div>
    <div class="pvProposedSalary"><span>Salario por turno · propuesto</span><strong>${money(selected.salaryPerShift)}</strong><small>Sin cobro activo</small></div>`:
    activeTab==='desarrollo'? `<div class="pvTabTitle">Desarrollo de habilidades</div><div class="pvSkills">${skillRows(selected)}</div><p class="pvTabNote">La progresión aún no está activada. Los empleados contratados conservan sus perfiles guardados.</p>`:
    activeTab==='salario'? `<div class="pvTabTitle">Condiciones económicas</div><div class="pvDetailMetric"><span>Contratación única</span><b>${money(selected.hireCost)}</b></div><div class="pvDetailMetric"><span>Salario propuesto por turno</span><b>${money(selected.salaryPerShift)}</b></div><p class="pvTabNote">Información de referencia: no existen cargos salariales automáticos.</p>`:
    `<div class="pvTabTitle">Historial del personaje</div><p class="pvTabNote">${employed?'Ya forma parte de tu equipo.':'Aún no has contratado a este candidato.'} Los pagos y mejoras se registrarán cuando estén disponibles.</p>`}
   </div>
   <div class="pvHireActions"><span class="pvHirePrice"><small>COSTO ÚNICO</small><b>${money(selected.hireCost)}</b></span>
    <button class="pvHire ${blocked?'blocked':''}" data-pv-hire type="button" ${blocked?'disabled':''}>${icon(blocked?'lock':'personnel')} ${employed?'Contratado':blocked?'No disponible':'Contratar'}</button></div>
   ${blocked?`<small class="pvHireReason">${esc(warning)}</small>`:''}
  </aside>
 </div>
 <footer class="pvTeam"><div class="pvTeamCount"><span>${icon('dock-users')}</span><span>Equipo activo<strong>${countTxt}</strong></span></div>
 <div class="pvTeamList" aria-label="Personal contratado y plazas">${slots}</div>
 <button class="pvTeamManage" data-pv-team-open type="button">${icon('dock-users')} Gestionar equipo</button></footer>
 </section>`;
}


/** Read-only roster management. No cash, ledger or skill mutations. */
export function renderPersonnelManagement(s,selectedId,icon){
 const members=activePersonnel(s);
 const chosen=members.find(p=>p.candidateId===selectedId||p.id===selectedId)||members[0]||null;
 const candidate=candidateById(chosen?.candidateId);
 const salary=p=>candidateById(p?.candidateId)?.salaryPerShift||0;
 const payroll=members.reduce((n,p)=>n+salary(p),0);
 const profile=chosen?.skillProfile;
 const skillData=profile?.skills||candidate?.skills||{};
 const roster=members.map(p=>{
  const c=candidateById(p.candidateId);
  return '<button type="button" class="pvManagedMember '+(p===chosen?'selected':'')+
   '" data-pv-team-person="'+esc(p.candidateId||p.id)+'" aria-pressed="'+(p===chosen)+'">'+
   portraitIllustration(c,'team')+'<span><b>'+esc(p.name||c?.name||roleById(p.role)?.label||'Personal')+'</b>'+
   '<small>'+esc(roleById(p.role)?.short||p.role)+'</small><small>'+money(salary(p))+' / turno sugerido</small></span></button>';
 }).join('');
 const skills=Object.entries(skillData).map(([key,v])=>
  '<div class="pvManageSkill"><span>'+esc(PERSONNEL_SKILL_LABELS[key]||key)+'</span>'+
  '<span class="pvPips">'+Array.from({length:5},(_,i)=>'<i class="'+(i<Number(v)?'on':'')+'"></i>').join('')+
  '</span><b>'+esc(v)+'/5</b></div>'
 ).join('');
 const details=chosen?'<div class="pvManagementHero">'+portraitIllustration(candidate,'detail')+
  '<div><small>'+esc(roleById(chosen.role)?.label||chosen.role)+'</small><h3>'+esc(chosen.name||candidate?.name||'Personal')+'</h3>'+
  '<p>'+esc(candidate?.description||'Trabajador de la faena')+'</p></div></div>'+
  '<div class="pvManagementFacts">'+
   '<div><small>Costo de contratación</small><b>'+money(candidate?.hireCost||0)+'</b></div>'+
   '<div><small>Salario por turno · sugerido</small><b>'+money(salary(chosen))+'</b></div>'+
   '<div><small>Estado de nómina</small><b>Sin cobros activos</b></div>'+
   '<div><small>Historial de pagos</small><b>Pendiente de activación</b></div></div>'+
  '<div class="pvManagementSkillsHead"><b>Desarrollo de habilidades</b><span>Nivel '+(Number(profile?.skillLevel)||1)+
  ' · '+Math.max(0,Number(profile?.skillPoints)||0)+' puntos</span></div>'+
  '<div class="pvManagementSkills">'+(skills||'<p>Perfil antiguo sin habilidades guardadas.</p>')+'</div>'+
  '<p class="pvManagementLocked">Mejoras y pagos por turno: preparados, todavía desactivados para proteger el balance.</p>'
  :'<p class="pvManageEmpty">Aún no hay personal contratado. Puedes volver a Contratación.</p>';
 return '<section class="pvRoot pvManagementRoot" aria-label="Gestión del personal contratado">'+
  '<div class="pvManagementTop"><button type="button" data-pv-team-back>'+icon('back')+' Contratación</button>'+
  '<div><strong>Gestión de equipo</strong><small>'+members.length+' integrantes</small></div></div>'+
  '<div class="pvManagementGrid"><aside class="pvManagementRoster"><h3>Equipo activo</h3>'+
  '<div class="pvManagedMembers">'+(roster||'<p class="pvManageEmpty">Equipo vacío</p>')+'</div></aside>'+
  '<section class="pvManagementDetail">'+details+'</section></div>'+
  '<footer class="pvManagementFoot"><span>Nómina proyectada por turno: <b>'+money(payroll)+
  '</b></span><small>Valor informativo, sin descuentos automáticos.</small></footer></section>';
}
