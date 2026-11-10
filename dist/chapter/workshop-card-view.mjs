// DRILL RUN NEXT GENERATION · Workshop compact status card v37.
// Read-only projection of the actual inventory and rigs. No writes, saves,
// gameplay events, stock creation, M4 timer changes or any artificial income.
import {WORKSHOP_LEVELS,workshopLevel,workshopCapacity,workshopUsed,workshopFree,
 workshopUpgradeJob,workshopUpgradeProgress} from '../mission3/inventory.mjs';

const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const fmtDuration=n=>{
 const total=Math.max(0,Math.ceil(Number(n)||0));
 return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
};
const stockable=t=>t&&(t.status==='new'||t.status==='worn');
function rcStatus(s){
 if(!s.drill)return {label:'No recibida',tone:'muted',detail:'Sin perforadora RC'};
 const rc=s.drill,phase=s.contract?.status;
 if(rc.state==='drilling')return {label:'En sondaje',tone:'active',detail:'Operando en faena'};
 if(s.mission5?.status==='operational'){
  if(s.mission5.rcParked)return {label:'En patio · D01',tone:'ready',detail:'Plaza abierta'};
  if(phase==='delivered')return {label:'Traslado al patio',tone:'moving',detail:'Camino al resguardo'};
 }
 if(phase==='delivered')return {label:'En resguardo',tone:'ready',detail:'Disponible en faena'};
 if(rc.state==='moving')return {label:'En traslado',tone:'moving',detail:'En ruta'};
 return {label:'Disponible',tone:'ready',detail:'Sin asignación activa'};
}
function dthStatus(s){
 const d=s.mission4?.productionDrill;
 if(!d)return {label:'No recibida',tone:'muted',detail:'Sin perforadora DTH'};
 const assigned=d.assignedZone?String(d.assignedZone):'';
 const state=d.state||'';
 if(assigned){
  if(s.mission4?.serviceRequested||state==='maintenance'||state==='paused')
   return {label:'Servicio requerido',tone:'warning',detail:'Detenida · '+assigned};
  if(state==='moving')return {label:'En traslado',tone:'moving',detail:'Hacia '+assigned};
  if(state==='producing')return {label:'Produciendo',tone:'active',detail:'Zona '+assigned};
  return {label:'En faena',tone:'active',detail:'Zona '+assigned};
 }
 if(s.mission5?.status==='operational'){
  return s.mission5.dthParked
   ?{label:'En patio · D02',tone:'ready',detail:'Plaza abierta'}
   :{label:'Sin asignación',tone:'muted',detail:'Pendiente de resguardo'};
 }
 return {label:'En resguardo',tone:'ready',detail:'Sin zona asignada'};
}
export function workshopCardData(s,now=Date.now()){
 const lvl=workshopLevel(s),cap=workshopCapacity(s),used=workshopUsed(s),free=workshopFree(s);
 const inventory=s.toolInventory||[],stored=inventory.filter(stockable),discarded=s.spentMaterials||[];
 const job=workshopUpgradeJob(s),next=WORKSHOP_LEVELS.find(w=>w.level===lvl+1)||null;
 const d=s.mission4?.productionDrill||null,activeM4=!!(s.mission4&&s.mission4.phase!=='inactive');
 const bitNeeded=!!d&&!d.installedBit,hammerNeeded=!!d&&!d.installedHammer;
 const service=!!s.mission4?.serviceRequested;
 const dthStock=stored.filter(t=>(t.type==='bit'&&t.model?.startsWith('dth-'))||
  (t.type==='hammer'&&t.model?.startsWith('puma-dth'))).length;
 let attention=null;
 if(activeM4&&d){
  if(service)attention={
   title:'Servicio DTH solicitado',
   detail:dthStock?'Revisa el proceso de recambio y las herramientas disponibles.':
    'Verifica repuestos compatibles en Casa Matriz.',
   label:dthStock?'Revisar recambio':'Solicitar repuestos',
   app:dthStock?'m4-workshop':'m4-dth-catalog'
  };
  else if(bitNeeded||hammerNeeded)attention={
   title:'Instalación pendiente',
   detail:'La DTH necesita '+(bitNeeded&&hammerNeeded?'bit y martillo compatibles':bitNeeded?'un bit compatible':'un martillo compatible')+'.',
   label:'Gestionar instalación',app:'m4-workshop'
  };
 }
 return {
  lvl,lvlName:WORKSHOP_LEVELS.find(w=>w.level===lvl)?.label||'Básico',
  cap,used,free,pct:cap?Math.round(used/cap*100):0,
  storedBits:stored.filter(x=>x.type==='bit').length,
  storedHammers:stored.filter(x=>x.type==='hammer').length,
  discarded:discarded.length,
  rc:rcStatus(s),dth:dthStatus(s),activeM4,attention,
  job:job?{
   targetLevel:job.targetLevel,
   progress:Math.round((workshopUpgradeProgress(s,now)||0)*100),
   remaining:fmtDuration((job.ends-now)/1000),
   boosters:s.boosters||0
  }:null,
  nextLevel:next?{
   level:next.level,upgradeCost:next.upgradeCost,seconds:next.constructionSeconds,
   affordable:s.cash>=next.upgradeCost
  }:null,
  maxLevel:!next&&!job
 };
}
export function renderWorkshopCard(s,{icon,money,now=Date.now(),demolitionAllowed=false}){
 const v=workshopCardData(s,now);
 const value=(x)=>esc(x);
 const stat=(label,n,cls='')=>`<div class="wsMetric ${cls}"><small>${label}</small><strong>${n}</strong></div>`;
 const machinery=(name,data,iconName)=>`<div class="wsMachine">
  <span class="wsMachineIcon">${icon(iconName)}</span>
  <span class="wsMachineName">${name}<small>${value(data.detail)}</small></span>
  <span class="wsMachineState ${data.tone}">${value(data.label)}</span>
 </div>`;
 let html=`<div class="wsHeading"><span class="wsMark">${icon('wrench')}</span>
 <div class="wsHeadingText"><small>INSTALACIONES / MANTENIMIENTO</small><h2 id="workshopCardHeading">TALLER</h2></div>
 <span class="wsLevel">Nv.${v.lvl} · ${value(v.lvlName)}</span>
 <button type="button" class="wsClose" id="workshopCardClose" aria-label="Cerrar ficha del taller">${icon('close')}</button></div>`;
 html+='<div class="wsContent">';
 html+=`<div class="wsSectionTitle">CAPACIDAD DEL TALLER</div>
 <div class="wsCapacity">
  <span class="wsCapacityValue"><strong>${v.used}</strong><span> / ${v.cap}</span><small>espacios ocupados</small></span>
  <span class="wsCapacityFree"><strong>${v.free}</strong><small>libres</small></span>
 </div>
 <div class="wsOccupancy"><span>Ocupación</span><div class="wsTrack"><i style="width:${v.pct}%"></i></div><b>${v.pct}%</b></div>`;
 html+=`<div class="wsSectionTitle wsInventoryTitle">INVENTARIO DISPONIBLE</div>
 <div class="wsMetricGrid">${stat('Bits',v.storedBits)}${stat('Martillos',v.storedHammers)}${stat('Usados · M8',v.discarded,'wsMetricDiscard')}</div>`;
 if(v.job)html+=`<div class="wsConstruction">
 <div class="wsConstructionHeading">${icon('time')} Ampliación a Nv.${v.job.targetLevel} <b>${v.job.remaining}</b></div>
 <div class="wsTrack"><i style="width:${v.job.progress}%"></i></div>
 <button type="button" id="workshopBoost" ${v.job.boosters<1?'disabled':''}>${icon('boost')} Acelerar 1 min · ${v.job.boosters} disponible(s)</button>
 </div>`;
 if(v.activeM4)html+=`<div class="wsSectionTitle wsRigTitle">MAQUINARIA · ESTADO ACTUAL</div>
 <div class="wsRigList">
 ${machinery('RC',v.rc,'machine')}${machinery('DTH',v.dth,'machine')}
 </div>`;
 if(v.attention)html+=`<div class="wsAttention"><div><b>${value(v.attention.title)}</b><small>${value(v.attention.detail)}</small></div><button type="button" id="workshopContextAction" data-app="${value(v.attention.app)}">${value(v.attention.label)}</button></div>`;
 html+='</div>';
 html+=`<div class="wsFooter">
 <div class="wsPrimaryActions">
  <button type="button" id="workshopStock">${icon('inventory')} Ver stock</button>
  ${v.activeM4?`<button type="button" id="workshopDthManage">${icon('build')} Gestionar herramientas</button>`:''}
 </div>
 ${v.nextLevel?`<button type="button" id="workshopUpgradeBtn" class="wsUpgrade" ${v.nextLevel.affordable?'':'disabled'}>
  ${icon('boost')} Ampliar a Nv.${v.nextLevel.level} · ${money(v.nextLevel.upgradeCost)}
  <small>${v.nextLevel.affordable?fmtDuration(v.nextLevel.seconds):'Saldo insuficiente'}</small>
 </button>`:''}
 ${v.maxLevel?`<div class="wsLimit">${icon('check')} Máximo habilitado actualmente · Nv.${v.lvl}</div>`:''}
 ${demolitionAllowed?`<button type="button" id="workshopDemolishBtn" class="wsDemolish">Opciones de demolición</button>`:''}
 </div>`;
 return html;
}
