// V102 · Taller dashboard, pure projection of existing state. No economy writes.
import {workshopLevel,WORKSHOP_LEVELS} from '../mission3/inventory.mjs';
import {REPAIR_KITS,workshopRecoverySummary} from '../mission5/workshop-recovery.mjs';
import {workshopConstructionReadout,workshopTimeLabel} from './workshop-progress-v102.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(id,label)=>'<button type="button" data-faena-route="'+id+'">'+label+' <span aria-hidden="true">›</span></button>';
const stat=(ico,label,value)=>'<div class="ws102Metric"><span>'+ico+' '+label+'</span><strong>'+esc(value)+'</strong></div>';
export function renderWorkshopDashboard(s,{icon,money,m4,now=Date.now()}){
 const info=workshopRecoverySummary(s,now),lvl=workshopLevel(s),active=lvl>0;
 const built=workshopConstructionReadout(s,now);
 const next=WORKSHOP_LEVELS.find(x=>x.level===lvl+1);
 const work=info.jobs.map(j=>'<div class="ws102Job"><span class="ws102JobGlyph">'+icon('wrench')+'</span><span class="ws102JobText"><b>'+esc(j.toolId)+'</b><small>Recuperación en curso</small></span><strong>'+workshopTimeLabel(j.remainingSeconds*1000)+'</strong></div>').join('');
 const reasons={needsRepairKit:'Sin kit disponible',noWorkshopCapacity:'Sin capacidad',toolNotWornEnough:'Herramienta aún útil',recoveryLimit:'Recuperación agotada',toolNotRecoverable:'No recuperable',patioNotReady:'Requiere Patio L1',workshopNotBuilt:'Construye el Taller'};
 const pieces=info.candidates.map(tool=>'<div class="faenaOrderRow"><span><b>'+esc(tool.model)+'</b><small>'+esc(tool.type==='bit'?'Reafilado de bit':'Reparación de martillo')+' · '+Math.round((tool.lifeRemaining||0)/Math.max(1,tool.lifeTotal||1)*100)+'% vida · '+(tool.recoveryCount||0)+' recuperaciones</small></span><button data-faena-recover="'+esc(tool.id)+'" '+(tool.blocked?'disabled':'')+'>'+esc(tool.blocked?reasons[tool.blocked]||tool.blocked:'Recuperar')+'</button></div>').join('');
 const badge=built?built.shortLabel:active?'OPERATIVO':'PENDIENTE';
 let focus='';
 if(built){
  focus='<section class="ws102Progress" data-ws102-progress data-ws102-kind="'+esc(built.kind)+'">'+
   '<div class="ws102ProgressTop"><span class="ws102ProgressIcon">'+icon('time')+'</span>'+
   '<div class="ws102ProgressCopy"><small>'+esc(built.shortLabel)+'</small><h3>'+esc(built.kind==='upgrade'?'Ampliando a nivel '+built.targetLevel:'Construcción del Taller nivel 1')+'</h3></div>'+
   '<b data-ws102-remaining>'+built.remainingLabel+'</b></div>'+
   '<div class="ws102ProgressTrack" role="progressbar" aria-label="Progreso real de construcción del Taller" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+built.progress+'"><i data-ws102-fill style="width:'+built.progress+'%"></i></div>'+
   '<div class="ws102ProgressFoot"><span>Obras en curso · tiempo restante</span><strong data-ws102-percent>'+built.progress+'%</strong></div></section>';
 }else if(active&&next){
  focus='<section class="ws102Upgrade"><span class="ws102UpgradeGlyph">'+icon('boost')+'</span>'+
   '<div class="ws102UpgradeCopy"><small>MEJORA DISPONIBLE</small><h3>Ampliación técnica · Nivel '+next.level+'</h3><p>Mayor capacidad para herramientas y mantenimiento.</p>'+
   '<span class="ws102UpgradeDuration">'+icon('time')+' Tiempo de obra: '+workshopTimeLabel(next.constructionSeconds*1000)+'</span></div>'+
   '<button class="ws102UpgradeBtn" type="button" data-faena-workshop-upgrade '+(s.cash<next.upgradeCost?'disabled':'')+'>'+
   '<span>'+esc(s.cash<next.upgradeCost?'SALDO INSUFICIENTE':'MEJORAR A NIVEL '+next.level)+'</span><strong>'+money(next.upgradeCost)+'</strong></button></section>';
 }else if(!active){
  focus='<section class="ws102Pending"><b>Taller pendiente</b><p>Construye el Taller desde Catálogo para habilitar el mantenimiento.</p>'+link('overview','Centro de Faena')+'</section>';
 }else{
  focus='<section class="ws102Ready"><span>'+icon('check')+'</span><div><b>Ampliación completada</b><small>El Taller está operando con su nivel máximo disponible.</small></div></section>';
 }
 const capacity=active?(WORKSHOP_LEVELS.find(x=>x.level===lvl)?.capacity||0):0;
 const m4Html=s.mission4&&s.mission4.phase!=='inactive'?(m4?.('m4-workshop')||''):'<p class="faenaHint">La perforadora DTH se habilita en la Misión 4.</p>';
 return '<section class="ws102Dashboard" aria-label="Control del Taller técnico">'+
  '<div class="ws102Hero"><div class="ws102HeroIcon">'+icon('wrench')+'</div><div class="ws102HeroCopy">'+
  '<span>OPERACIONES · MANTENIMIENTO</span><h3>Centro técnico del Taller</h3>'+
  '<p>Reafilado, reparaciones y capacidad operativa</p></div>'+
  '<span class="ws102Status '+(built?'building':active?'ready':'pending')+'"><i></i>'+esc(badge)+'</span></div>'+
  '<div class="ws102MetricRow">'+
   stat(icon('wrench'),'Nivel técnico',lvl)+
   stat(icon('time'),'Trabajos activos',info.jobs.length)+
   stat(icon('check'),'Recuperaciones',info.completed)+
   stat(icon('inventory'),'Capacidad',capacity)+
  '</div>'+focus+
  '<div class="ws102Columns">'+
   '<section class="ws102Panel ws102Jobs"><header><div><small>ACTIVIDAD</small><h3>Trabajos de recuperación</h3></div><span class="ws102Count">'+info.jobs.length+'</span></header>'+
   (work||'<div class="ws102Empty"><span>'+icon('check')+'</span><div><b>Sin trabajos en proceso</b><small>El taller está disponible para nuevas reparaciones.</small></div></div>')+
   '</section>'+
   '<section class="ws102Panel ws102Kits"><header><div><small>RECURSOS</small><h3>Kits disponibles</h3></div></header>'+
   '<div class="ws102KitGrid">'+Object.values(REPAIR_KITS).map(k=>'<div><span>'+esc(k.label)+'</span><strong>'+Number(info.kits[k.id]||0)+'</strong></div>').join('')+'</div>'+
   '<div class="ws102Tools">'+link('logistics','Solicitar kits')+link('headquarters','Casa Matriz')+'</div></section>'+
  '</div>'+
  '<details class="ws102More"><summary>'+icon('inventory')+' Herramientas para recuperar <small>'+info.candidates.length+' piezas</small></summary>'+
   '<div class="ws102MoreBody">'+(pieces||'<p class="faenaHint">No hay piezas desgastadas disponibles para recuperar.</p>')+'</div></details>'+
  '<details class="ws102More"><summary>'+icon('machine')+' Instalación y mantenimiento DTH</summary>'+
   '<div class="ws102MoreBody">'+m4Html+'</div></details>'+
 '</section>';
}
