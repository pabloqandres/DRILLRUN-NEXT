// V76 · Compact, navigable Personal UI. Read-only presentation.
// Hiring is delegated through the host to the existing guarded game action.
import {ROLE_GROUPS,ROLE_BY_ID,CANDIDATES,CANDIDATE_BY_ID,candidatesForRole,
 hiredForRole,activeTeam,teamCapacity,missionIndex,priorityRole,
 candidateBlockReason,employeeCandidate,skillRows} from '../people/personnel-candidates-v76.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Math.round(Number(n)||0).toLocaleString('es-CL');
const pictograms={admin:'objectives',driller:'machine',helper:'wrench',hsec:'lock',
 tecnicoDrillco:'wrench','m5-gate-security':'lock','m5-warehouse-tech':'inventory'};
const skillIcons={negotiation:'objectives',efficiency:'gauge',planning:'time',
 coordination:'personnel',reports:'objectives',drilling:'machine',precision:'geology',
 safety:'lock',maintenance:'wrench',diagnosis:'geology',logistics:'inventory',
 response:'time',leadership:'personnel',automation:'wrench'};
const explain={
 invalidCandidate:'Candidato no disponible',invalidRole:'Rol no disponible',
 lockedMission:'Se habilitará al avanzar de misión',roleFull:'Puesto ya cubierto',
 needsOfficeL2:'Requiere Oficina nivel 2',needsWorkshop:'Construye el galpón primero',
 needsDrill:'Primero solicita una perforadora',needsGeoRequest:'Requiere análisis geológico',
 needsWorkshopNv2:'Requiere Taller nivel 2',noMoney:'Saldo insuficiente',
 buildPatioFirst:'Termina primero el Patio L1',acceptM5First:'Acepta la Misión 5',
 hireGuardFirst:'Primero contrata al guardia',alreadyHired:'Personal contratado'
};
const bars=(level,emphasize=false)=>'<span class="p76Pips" aria-label="'+level+' de 5">'+
 Array.from({length:5},(_,j)=>'<i class="'+(j<level?'on':'')+' '+(j===level-1&&emphasize?'accent':'')+'"></i>').join('')+'</span>';
const portrait=(c,cls='')=>'<img class="'+cls+'" src="'+esc(c.portrait)+'" alt="Retrato ilustrado de '+esc(c.name)+'" loading="lazy" decoding="async">';
function missionTitle(n){return n===5?'Una base para crecer':n===4?'Producción permanente':n===3?'Tu primer contrato':n===2?'Seguridad de tu operación':'Preparar tu faena';}
export function personnelViewState(s,roleId,candidateId){
 const priority=priorityRole(s),chosenRole=ROLE_BY_ID[roleId]||priority;
 const list=candidatesForRole(chosenRole.id);
 const chosen=CANDIDATE_BY_ID[candidateId]?.roleId===chosenRole.id?CANDIDATE_BY_ID[candidateId]:list[0];
 const count=activeTeam(s).length,capacity=teamCapacity(s);
 return {priority,chosenRole,candidates:list,chosen,count,capacity,mission:missionIndex(s)};
}
export function renderPersonalConsole(s,{roleId=null,candidateId=null,icon=()=>''}={}){
 const state=personnelViewState(s,roleId,candidateId);
 const {priority,chosenRole,candidates,chosen,count,capacity,mission}=state;
 const roleHired=hiredForRole(s,chosenRole.id).length>0;
 const reason=candidateBlockReason(s,chosen);
 const hired=roleHired;
 const recommended=chosenRole.id===priority.id;
 const chosenSkills=skillRows(chosen);
 const currentTeam=activeTeam(s);
 const displaySlots=Math.max(capacity,3);
 const missionDone=!!hiredForRole(s,priority.id).length;
 const banner='<button class="p76Mission" type="button" data-p76-mission aria-label="Ir al siguiente puesto requerido">'+
  '<span class="p76MissionBackdrop"></span><span class="p76MissionText"><small>MISIÓN '+mission+' · SIGUIENTE CONTRATACIÓN</small>'+
  '<strong>'+esc(missionTitle(mission))+'</strong><span>'+(missionDone?'Equipo requerido cubierto':'Requiere: '+esc(priority.label))+
  ' <b>'+ (missionDone?'1/1':'0/1')+'</b></span></span><i>›</i></button>';
 const roles='<nav class="p76Roles" aria-label="Categorías de contratación">'+ROLE_GROUPS.map(r=>{
  const active=r.id===chosenRole.id,owned=hiredForRole(s,r.id).length>0,locked=mission<r.minMission;
  return '<button type="button" class="p76Role '+(active?'chosen ':'')+(locked?'locked':'')+'" data-p76-role="'+r.id+'" aria-pressed="'+String(active)+'" '+(locked?'aria-label="'+esc(r.label)+' se desbloquea en Misión '+r.minMission+'"':'')+'>'+
    '<span class="p76RoleGlyph">'+icon(pictograms[r.id])+'</span><span class="p76RoleLabel">'+esc(r.label)+'</span>'+
    '<em class="'+(owned?'hasStaff':'')+'">'+(owned?'✓':locked?'M'+r.minMission:'0/1')+'</em></button>';
 }).join('')+'</nav>';
 const cards='<div class="p76Cards" role="list" aria-label="Tres candidatos de '+esc(chosenRole.label)+'">'+candidates.map(c=>{
  const active=c.id===chosen.id,disabled=candidateBlockReason(s,c),ownedCandidate=currentTeam.some(p=>p.candidateId===c.id||p.id===c.id);
  const best=skillRows(c).slice(0,2);
  return '<button role="listitem" type="button" data-p76-candidate="'+c.id+'" class="p76Candidate '+(active?'chosen ':'')+(ownedCandidate?'hired':'')+'" aria-pressed="'+String(active)+'">'+
   '<span class="p76CandidateArt">'+portrait(c)+(active?'<i class="p76ChosenMark">★</i>':'')+'</span>'+
   '<b>'+esc(c.name)+'</b><span class="p76Highlights">'+best.map(x=>'<span>'+esc(x.label)+' <em>'+x.level+'/5</em></span>').join('')+'</span>'+
   '<span class="p76Cost">'+icon('wallet')+' '+money(c.hireCost)+'</span>'+
   '<span class="p76Status">'+(ownedCandidate?'CONTRATADO':disabled?'BLOQUEADO':'DISPONIBLE')+'</span>'+
   '</button>';
 }).join('')+'</div>';
 const details='<aside class="p76Details" aria-label="Detalle del candidato elegido">'+
  '<div class="p76DetailHead">'+portrait(chosen,'p76DetailPortrait')+'<span class="p76DetailText"><small>PERFIL SELECCIONADO</small><strong>'+esc(chosen.name)+'</strong><span>'+esc(chosenRole.label)+'</span></span></div>'+
  '<div class="p76DetailSkills"><h3>HABILIDADES <small>potencial</small></h3>'+chosenSkills.map((x,j)=>
   '<div class="p76Skill"><span>'+icon(skillIcons[x.id]||'objectives')+'</span><b>'+esc(x.label)+'</b>'+bars(x.level,j===0)+'</div>'
  ).join('')+'</div>'+
  '<div class="p76HireInfo"><span>Contratación única</span><strong>'+icon('wallet')+' '+money(chosen.hireCost)+'</strong></div>'+
  '<button class="p76Hire" type="button" data-p76-hire="'+chosen.id+'" '+(reason?'disabled':'')+'>'+icon(reason?'lock':'personnel')+
   (hired?' Puesto cubierto':reason?' '+esc(explain[reason]||reason):' Contratar a '+esc(chosen.name.split(' ')[0]))+'</button>'+
  '<small class="p76SkillNote">Los atributos quedan registrados para futuras especializaciones; todavía no generan pagos adicionales.</small>'+
 '</aside>';
 const teamCards=Array.from({length:displaySlots},(_,i)=>{
  const p=currentTeam[i],c=employeeCandidate(p);
  if(!p)return '<div class="p76TeamSlot empty"><span>＋</span><small>Vacante</small></div>';
  const role=ROLE_BY_ID[p.role]||ROLE_BY_ID[p.id];
  return '<div class="p76TeamSlot occupied">'+(c?portrait(c):'<span class="p76Unknown">'+icon('personnel')+'</span>')+
   '<span><b>'+esc(c?.name||p.displayName||'Personal contratado')+'</b><small>'+esc(role?.short||p.role||'Operativo')+'</small></span><i>✓</i></div>';
 }).join('');
 return '<div class="p76Console" data-role="'+chosenRole.id+'">'+
  '<div class="p76Main">'+
   '<aside class="p76Sidebar">'+banner+'<div class="p76RoleHeader"><strong>ROLES DISPONIBLES</strong><small>'+ROLE_GROUPS.length+' especialidades</small></div>'+roles+'</aside>'+
   '<section class="p76Selection"><header class="p76SelectionHead">'+
      '<span class="p76SelectionIcon">'+icon(pictograms[chosenRole.id])+'</span>'+
      '<span><strong>'+esc(chosenRole.label)+'</strong><small>'+esc(chosenRole.detail)+'</small></span>'+
      '<em>'+ (ROLE_GROUPS.findIndex(r=>r.id===chosenRole.id)+1)+' / '+ROLE_GROUPS.length+'</em>'+
     '</header>'+cards+'</section>'+details+
  '</div>'+
  '<footer class="p76Team"><div class="p76TeamSummary"><span>'+icon('personnel')+'</span><strong>Equipo activo <b>'+count+' / '+capacity+'</b></strong><small>Los puestos disponibles aumentan al avanzar de misión</small></div>'+
    '<div class="p76TeamRail">'+teamCards+'</div>'+
    '<label class="p76VolumeLabel" title="Volumen de sonidos de interfaz"><span>'+icon('sound')+'</span><small>SONIDO</small><input data-p76-volume aria-label="Volumen de interacción" type="range" min="0" max="200" step="10" value="150"></label></footer>'+
 '</div>';
}
