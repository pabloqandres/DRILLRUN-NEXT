// V103 · Taller gráfico. Read-only HTML of the existing Workshop:
// same recovery, DTH, upgrade handlers, cash, duration and saved progress.
import {workshopLevel,workshopCapacity,workshopUsed,workshopFree,WORKSHOP_LEVELS} from '../mission3/inventory.mjs';
import {REPAIR_KITS,workshopRecoverySummary} from '../mission5/workshop-recovery.mjs';
import {workshopConstructionReadout,workshopTimeLabel} from './workshop-progress-v102.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico=(fn,name)=>'<span class="ws103Icon" aria-hidden="true">'+fn(name)+'</span>';
const link=(route,label)=>'<button type="button" data-faena-route="'+route+'">'+esc(label)+' <span aria-hidden="true">›</span></button>';
function capacityDial(used,capacity,free){
 const fraction=capacity?Math.max(0,Math.min(1,free/capacity)):0;
 const circumference=2*Math.PI*40,fill=Math.round(fraction*circumference*100)/100;
 return '<div class="ws103CapacityDial" role="img" aria-label="'+used+' de '+capacity+' plazas ocupadas, '+free+' libres">'+
 '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">'+
 '<circle class="ws103DialBase" cx="50" cy="50" r="40"/>'+
 '<circle class="ws103DialFill" cx="50" cy="50" r="40" stroke-dasharray="'+fill+' '+(Math.round((circumference-fill)*100)/100)+'" transform="rotate(-90 50 50)"/></svg>'+
 '<div class="ws103DialText"><strong>'+free+'</strong><small>LIBRES</small></div></div>';
}
function toolRows(items,type){
 const reasons={needsRepairKit:'Sin kit',noWorkshopCapacity:'Sin espacio',toolNotWornEnough:'Todavía útil',recoveryLimit:'Límite alcanzado',toolNotRecoverable:'No recuperable',patioNotReady:'Patio pendiente',workshopNotBuilt:'Taller pendiente'};
 const subset=items.filter(x=>x.type===type);
 if(!subset.length)return '<p class="ws103None">No hay '+(type==='bit'?'bits':'martillos')+' pendientes de recuperación.</p>';
 return subset.map(t=>'<div class="ws103Item"><span><b>'+esc(t.model)+'</b><small>'+Math.round((t.lifeRemaining||0)/Math.max(1,t.lifeTotal||1)*100)+'% vida · '+Number(t.recoveryCount||0)+' ciclos</small></span>'+
 '<button type="button" data-faena-recover="'+esc(t.id)+'" '+(t.blocked?'disabled':'')+'>'+esc(t.blocked?reasons[t.blocked]||t.blocked:'Recuperar')+'</button></div>').join('');
}
export function renderWorkshopVisualV103(s,{icon,money,m4,now=Date.now()}){
 const lvl=workshopLevel(s),active=lvl>0,capacity=workshopCapacity(s),used=workshopUsed(s),free=workshopFree(s);
 const build=workshopConstructionReadout(s,now),info=workshopRecoverySummary(s,now);
 const next=WORKSHOP_LEVELS.find(x=>x.level===lvl+1);
 const bitCandidates=info.candidates.filter(x=>x.type==='bit'),hammerCandidates=info.candidates.filter(x=>x.type==='hammer');
 const kitStock=Object.values(REPAIR_KITS).reduce((n,k)=>n+Number(info.kits[k.id]||0),0);
 const status=build?'EN CONSTRUCCIÓN':active?'OPERATIVO':'NO CONSTRUIDO';
 let focus='';
 if(build){
  focus='<div class="ws103Construction" data-ws102-progress data-ws102-kind="'+esc(build.kind)+'">'+
   '<div class="ws103ConstructionTop">'+ico(icon,'time')+'<span><b>'+esc(build.kind==='upgrade'?'Ampliación a nivel '+build.targetLevel:'Construcción nivel 1')+'</b><small>Obras en progreso</small></span>'+
   '<strong data-ws102-remaining>'+build.remainingLabel+'</strong></div>'+
   '<div class="ws103ProgressRail" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+build.progress+'" aria-label="Progreso real de obra del Taller"><i data-ws102-fill style="width:'+build.progress+'%"></i></div>'+
   '<div class="ws103ProgressCaption"><span>TIEMPO RESTANTE</span><strong data-ws102-percent>'+build.progress+'%</strong></div></div>';
 }else if(active&&next){
  focus='<div class="ws103Upgrade">'+ico(icon,'boost')+
   '<span class="ws103UpgradeTitle"><small>SIGUIENTE EVOLUCIÓN</small><b>Ampliar Taller a nivel '+next.level+'</b><span>'+capacity+' → '+next.capacity+' espacios · '+workshopTimeLabel(next.constructionSeconds*1000)+'</span></span>'+
   '<button type="button" class="ws103UpgradeButton" data-faena-workshop-upgrade '+(s.cash<next.upgradeCost?'disabled':'')+'><small>'+esc(s.cash>=next.upgradeCost?'MEJORAR':'SIN SALDO')+'</small><strong>'+money(next.upgradeCost)+'</strong></button></div>';
 }else if(active){
  focus='<div class="ws103Complete">'+ico(icon,'check')+'<span>NIVEL '+lvl+' ACTIVO</span><small>Capacidad técnica ampliada · máximo habilitado por ahora</small></div>';
 }else{
  focus='<div class="ws103Pending">'+ico(icon,'wrench')+'<b>Construye el Taller desde el Catálogo para empezar.</b></div>';
 }
 const tasks=info.jobs.map(j=>'<span class="ws103RunningTask">'+ico(icon,'time')+'<b>'+esc(j.toolId)+'</b><small>'+workshopTimeLabel(j.remainingSeconds*1000)+'</small></span>').join('');
 const dth=s.mission4&&s.mission4.phase!=='inactive'?(m4?.('m4-workshop')||''):'<p class="ws103None">La gestión DTH se habilita con la Misión 4.</p>';
 const tile=(name,title,count,summary,body,cls='')=>
  '<details class="ws103Tile '+cls+'"><summary>'+ico(icon,name)+'<span class="ws103TileTitle"><b>'+title+'</b><small>'+esc(summary)+'</small></span><span class="ws103TileValue">'+count+'</span><span class="ws103TileChevron">⌄</span></summary>'+
  '<div class="ws103TileBody">'+body+'</div></details>';
 return '<div class="ws103Dashboard" aria-label="Taller técnico · control operativo">'+
  '<div class="ws103Main">'+
   '<div class="ws103Illustration"><img src="./assets/faena-v82/workshop.webp" alt="Representación del edificio del Taller" decoding="async" loading="eager"/>'+
    '<span class="ws103ImageShade"></span><span class="ws103LevelTag">TALLER · NV.'+lvl+'</span>'+
    '<span class="ws103ImageCaption">INSTALACIÓN TÉCNICA</span></div>'+
   '<div class="ws103Summary">'+
    '<div class="ws103SummaryTitle"><span>'+ico(icon,'wrench')+' CENTRO TÉCNICO</span><span class="ws103State '+(build?'busy':active?'ready':'unbuilt')+'"><i></i>'+status+'</span></div>'+
    '<div class="ws103SummaryBody">'+capacityDial(used,capacity,free)+
     '<div class="ws103SummaryStats">'+
      '<div><span>'+ico(icon,'time')+' TRABAJOS</span><strong>'+info.jobs.length+'</strong></div>'+
      '<div><span>'+ico(icon,'check')+' RECUPERADOS</span><strong>'+info.completed+'</strong></div>'+
      '<div><span>'+ico(icon,'inventory')+' CAPACIDAD</span><strong>'+capacity+'</strong></div>'+
     '</div></div>'+
    '<div class="ws103SummaryFooter">Reafilado, martillos y mantenimiento en un solo lugar.</div>'+
   '</div></div>'+
  focus+
  '<div class="ws103GridLabel"><span>ESTACIONES DE SERVICIO</span><small>Toca una estación para gestionar</small></div>'+
  '<div class="ws103Services">'+
   tile('wrench','Reafilado de bits',bitCandidates.length,'Herramientas por recuperar',toolRows(info.candidates,'bit'))+
   tile('machine','Servicio de martillos',hammerCandidates.length,'Reparación técnica',toolRows(info.candidates,'hammer'))+
   tile('inventory','Kits de servicio',kitStock,'Repuestos disponibles',
    '<div class="ws103Kits">'+Object.values(REPAIR_KITS).map(k=>'<div><span>'+esc(k.label)+'</span><b>'+Number(info.kits[k.id]||0)+'</b></div>').join('')+'</div>'+
    '<div class="ws103Routes">'+link('logistics','Solicitar kits')+link('headquarters','Casa Matriz')+'</div>','ws103TileKits')+
  '</div>'+
  '<div class="ws103Activity">'+ico(icon,'time')+'<div><b>'+esc(info.jobs.length?'Trabajos en proceso: '+info.jobs.length:'Taller disponible')+'</b>'+
   '<small>'+esc(info.jobs.length?'Operaciones de recuperación activas':'Sin trabajos activos · preparado para mantenimiento')+'</small></div>'+tasks+'</div>'+
  '<details class="ws103Dth"><summary>'+ico(icon,'machine')+'<b>Gestión de equipos DTH</b><small>Instalación, mantenimiento y recambios</small><span>⌄</span></summary><div class="ws103DthBody">'+dth+'</div></details>'+
 '</div>';
}
