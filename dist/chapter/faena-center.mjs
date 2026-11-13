// V53 · One operational workspace with contextual entry points.
// Renders EXISTING M3/M4/M5 controllers; no duplicate spending/progression.
import {renderM3App} from '../mission3/phone-apps.mjs';
import {renderFinancialHistory} from './finance-view-v91.mjs';
import {renderPersonnelPremium,nextRequiredRole,personnelAvailability} from './personnel-premium-v76.mjs';
import {candidatesForRole,candidateById,activePersonnelCount} from './personnel-candidates-v76.mjs';
import {renderM4App} from '../mission4/phone-apps.mjs';
import {renderPatioApp} from '../mission5/patio-ui.mjs';
import {mission5Readout} from '../mission5/mission-readout.mjs';
import {hiredPatioStaff,gateChecked,warehouseChecked} from '../mission5/patio-staff.mjs';
import {REPAIR_KITS,workshopRecoverySummary} from '../mission5/workshop-recovery.mjs';
import {workshopLevel,workshopUpgradeJob,WORKSHOP_LEVELS} from '../mission3/inventory.mjs';
import {fleetOccupancy} from '../mission5/fleet-base.mjs';
import {renderWorkshopDashboard} from './workshop-v102-view.mjs';
import {workshopConstructionReadout} from './workshop-progress-v102.mjs';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'🪙 '+Math.round(Number(n)||0).toLocaleString('es-CL');
const stamp=s=>s?new Date(s).toLocaleDateString('es-CL',{day:'2-digit',month:'short'}):'Pendiente';
const routes=Object.freeze({
 overview:'Centro de Faena',production:'Producción y zonas',logistics:'Galpón logístico',
 workshop:'Taller técnico',fleet:'Patio y flota',safety:'Seguridad HSEC',
 contracts:'Contratos',personnel:'Personal',headquarters:'Casa Matriz',
 patio:'Patio de Maquinarias',geology:'Geología',zones:'Zonas',finances:'Finanzas'
});
export const FAENA_ROUTES=routes;
export const faenaRouteForApp=app=>({
 'm3-geology':'production','m4-zones':'production',
 'm3-orders':'logistics','m3-inventory':'logistics',
 'm4-workshop':'workshop','m4-drilltruck':'fleet','m5-patio':'patio',
 'm3-contract':'contracts','m3-personnel':'personnel',
 'm3-catalog':'headquarters','m4-dth-catalog':'headquarters',
 'm4-operaciones':'overview','m4-objectives':'overview',
 'm3-objectives':'contracts'
}[app]||'overview');
const section=(title,body)=>'<section class="faenaSection"><h3>'+title+'</h3>'+body+'</section>';
const button=(route,label)=>'<button type="button" class="faenaJump" data-faena-route="'+route+'">'+label+' <span aria-hidden="true">›</span></button>';
const small=(title,value)=>'<div class="faenaMetric"><span>'+esc(title)+'</span><strong>'+esc(value)+'</strong></div>';
// V56: one explicit recovery entry point for the personal unit, reachable both
// from the Fleet dashboard and the Patio mission detail. Never auto-charge.
function personalTruckActions(s){
 const truck=s.mission5?.personalTruck;
 const completed=!!(s.mission5?.commissionedAt&&s.narrative?.rewardsCollected?.includes('m5'));
 const position=truck?.position;
 const coords=position&&Number.isFinite(position.x)&&Number.isFinite(position.z)
   ?Math.round(position.x)+' m / '+Math.round(position.z)+' m':'Sin posición registrada';
 return section('DrillTruck® personal 02 · localización',
  '<p>'+(truck?'Unidad adquirida · '+(truck.mode==='driving'?'En conducción':'Estacionada')+' · posición '+esc(coords):
     completed?'Misión 5 completada: puedes restaurar la unidad entregada sin volver a comprarla.':
     'Aún sin entrega acreditada.')+'</p>'+
  '<div class="faenaQuickLinks">'+
   '<button data-faena-personal-locate '+(truck?'':'disabled')+'>Localizar unidad 02</button>'+
   '<button data-faena-personal-recover '+(truck||completed?'':'disabled')+'>Recuperar en plaza P01 · sin costo</button>'+
  '</div><p class="faenaHint">Localizar muestra la camioneta durante unos segundos. Recuperar devuelve tu unidad comprada al estacionamiento personal; no crea otra camioneta.</p>');
}

export class FaenaCenterUI{
 constructor({host,state,translate,format,icon,onClose,onAppAction,onKitOrder,onRecovery,onHsec,onLocate,onLocatePersonalTruck,onRecoverPersonalTruck,onFeedback}){
  Object.assign(this,{host,state,translate,format,icon,onClose,onAppAction,onKitOrder,onRecovery,onHsec,onLocate,onLocatePersonalTruck,onRecoverPersonalTruck,onFeedback});
  this.route='overview';this.view='';this.lastKey='';this.workshopClock=null;
  this.personnelRole=null;this.personnelCandidate=null;this.personnelView='recruit';this.personnelDetailTab='ficha';this.financialFilter='all';
  host.addEventListener('click',event=>this.handle(event));
 }
 get visible(){return !this.host.classList.contains('hidden');}
 open(route='overview'){
  const previous=this.route;
  this.route=routes[route]?route:faenaRouteForApp(route);
  if(this.route==='personnel'&&previous!=='personnel'){
   this.personnelView='recruit';this.personnelDetailTab='ficha';
   this.personnelRole=nextRequiredRole(this.state());this.personnelDetailTab='ficha';
   this.personnelCandidate=candidatesForRole(this.personnelRole)[0]?.id||null;
  }
  this.view=route.startsWith('m3-')||route.startsWith('m4-')?route:'';
  this.host.classList.remove('hidden');this.host.hidden=false;
  this.render();
  this.syncWorkshopClock();
 }
 close(){this.host.classList.add('hidden');this.host.hidden=true;this.stopWorkshopClock();this.onClose?.();}
 stopWorkshopClock(){if(this.workshopClock!==null){clearInterval(this.workshopClock);this.workshopClock=null;}}
 syncWorkshopClock(){
  this.stopWorkshopClock();
  if(this.route==='workshop'&&!this.view&&this.visible){
   this.updateWorkshopClock();
   this.workshopClock=setInterval(()=>this.updateWorkshopClock(),1000);
  }
 }
 updateWorkshopClock(now=Date.now()){
  if(!this.visible||this.route!=='workshop'||this.view)return;
  const progress=this.host.querySelector('[data-ws102-progress]');
  if(!progress)return;
  const data=workshopConstructionReadout(this.state(),now);
  if(!data)return;
  const remaining=progress.querySelector('[data-ws102-remaining]');
  const percent=progress.querySelector('[data-ws102-percent]');
  const fill=progress.querySelector('[data-ws102-fill]');
  const track=progress.querySelector('[role="progressbar"]');
  if(remaining)remaining.textContent=data.remainingLabel;
  if(percent)percent.textContent=data.progress+'%';
  if(fill)fill.style.width=data.progress+'%';
  if(track)track.setAttribute('aria-valuenow',String(data.progress));
 }
 navigate(route){
  if(route==='messages'){this.onAppAction?.('navigatePhone','messages');return;}
  this.open(route);
 }
 pageHtml(s,t,fmt,icon){
  const m3=app=>renderM3App(app,s,t,fmt,icon,{});
  const m4=app=>renderM4App(app,s,t,fmt,icon,{});
  if(this.view==='m3-catalog'||this.view==='m4-dth-catalog')return m3or4(this.view);
  if(this.view==='m3-orders')return m3('m3-orders');
  if(this.view==='m4-workshop')return m4('m4-workshop');
  if(this.view==='m3-inventory')return m3('m3-inventory');
  if(this.view==='m3-geology')return m3('m3-geology');
  if(this.view==='m4-zones')return m4('m4-zones');
  if(this.view==='m4-drilltruck')return m4('m4-drilltruck');
  function m3or4(app){return app.startsWith('m3-')?m3(app):m4(app);}
  switch(this.route){
   case 'finances':return renderFinancialHistory(s,this.financialFilter);
   case 'production':{
    if(!s.mission3||s.mission3.phase==='inactive')return '<p class="faenaHint">La geología operativa se desbloquea en Misión 3.</p>';
    const before=section('01 · Estudio geológico',m3('m3-geology'));
    const after=s.mission4&&s.mission4.phase!=='inactive'
     ?section('02 · Habilitar y asignar zonas',m4('m4-zones'))
     :'<p class="faenaHint">La conversión de zonas se habilita con la producción DTH en la Misión 4.</p>';
    return '<p class="faenaLead">Selecciona terreno, revisa el informe y asigna la maquinaria sin salir de esta pantalla.</p>'+
     '<nav class="faenaQuickLinks">'+button('headquarters','Solicitar equipos a Casa Matriz')+button('workshop','Preparar herramientas')+'</nav>'+
     before+after;
   }
   case 'logistics':{
    const tools=(s.toolInventory||[]).filter(x=>['new','worn','available','stored'].includes(x.status));
    const counts={bit:tools.filter(x=>x.type==='bit').length,hammer:tools.filter(x=>x.type==='hammer').length};
    const kits=s.mission5?.recovery?.kits||{};
    const rows=tools.slice(0,45).map(x=>'<div class="faenaStockRow"><span><b>'+esc(x.model)+'</b><small>'+esc(x.type==='bit'?'Bit':'Martillo')+' · '+Math.round(100*(x.lifeRemaining||0)/Math.max(1,x.lifeTotal||1))+'% de vida</small></span><b>'+esc(x.status==='new'?'Nuevo':'Disponible')+'</b></div>').join('');
    const canAudit=hiredPatioStaff(s,'m5-warehouse-tech')&&gateChecked(s);
    const audit=s.mission5?.lastWarehouseAudit;
    return '<p class="faenaLead">Aquí se reciben los pedidos y se controla el stock. El Taller solicita herramientas a este galpón para operar y recuperarlas.</p>'+
     '<div class="faenaMetrics">'+small('Bits disponibles',counts.bit)+small('Martillos disponibles',counts.hammer)+small('Pedidos en camino',(s.orders||[]).filter(o=>o.status==='dispatched').length)+'</div>'+
     section('Control de inventario','<p>Última auditoría: '+stamp(audit?.at)+' · '+(audit?'Registrados: '+(audit.total||0)+' insumos':'Sin auditoría')+'</p>'+
      '<button class="faenaPrimary" data-m5-action="warehouse" '+(canAudit?'':'disabled')+'>Recontar inventario real</button>'+
      (!canAudit?'<p class="faenaHint">Requiere técnica de bodega y control de acceso aprobado.</p>':''))+
     section('Existencias disponibles',rows||'<p class="faenaHint">Sin herramientas disponibles. Solicita insumos a Casa Matriz.</p>')+
     section('Kits para recuperación de herramientas','<p>Los kits se compran en Casa Matriz y llegan con despacho real. No ocupan plazas de herramientas.</p>'+
      Object.values(REPAIR_KITS).map(k=>'<div class="faenaOrderRow"><span><b>'+esc(k.label)+'</b><small>Stock de kits: '+(kits[k.id]||0)+' · Entrega aproximada: 02:00</small></span><button data-faena-kit="'+esc(k.id)+'" '+(s.mission5?.status==='operational'?'':'disabled')+'>Pedir '+money(k.price+200)+'</button></div>').join(''))+
     '<nav class="faenaQuickLinks">'+button('headquarters','Casa Matriz · productos')+button('workshop','Taller · recuperación')+'</nav>'+
     section('Pedidos y entregas',m3('m3-orders'));
   }
   case 'workshop':return renderWorkshopDashboard(s,{icon,money,m4,now:Date.now()});
   case 'fleet':{
    const yard=fleetOccupancy(s),truck=s.mission5?.personalTruck;
    return '<p class="faenaLead">El Patio administra plazas de estacionamiento, vehículos y circulación segura. El Taller se ocupa exclusivamente de trabajos técnicos.</p>'+
     '<div class="faenaMetrics">'+small('DrillTruck® 01',s.mission4?.drillTruck?'Automático':'Pendiente')+small('DrillTruck® 02',truck?truck.mode==='driving'?'En conducción':'Disponible':'Pendiente')+small('Portón HSEC',gateChecked(s)?'Verificado':'Pendiente')+'</div>'+
     '<nav class="faenaQuickLinks">'+button('patio','Plazas, acceso y flota')+button('logistics','Galpón logístico')+'</nav>'+
     section('Unidades registradas','<p>Camionetas techadas: '+yard.covered.length+' · Perforadoras: '+yard.openDrill.length+' · Equipos pesados: '+yard.openHeavy.length+'</p>')+
     personalTruckActions(s)+
     (truck?section('Vehículo personal 02','<p>El DrillTruck® personal puede conducirse desde su plaza. La unidad automática 01 conserva su servicio de mantenimiento.</p>'):'');
   }
   case 'safety':{
    return '<p class="faenaLead">El control de acceso, las inspecciones y la segregación se gestionan aquí. El indicador HSEC original sigue siendo la autoridad sobre la seguridad.</p>'+
     '<div class="faenaMetrics">'+small('HSEC Patio',s.mission5?.hsecApproved?'Aprobado':'Pendiente')+small('Guardia',hiredPatioStaff(s,'m5-gate-security')?'Contratado':'Pendiente')+small('Barrera',gateChecked(s)?'Controlada':'Pendiente')+'</div>'+
     section('Verificación de acceso','<p>Comprueba infraestructura habilitada, guardia asignado y barrera controlada. Esta comprobación queda en el historial.</p>'+
      '<button class="faenaPrimary" data-m5-action="gate" '+(hiredPatioStaff(s,'m5-gate-security')&&hiredPatioStaff(s,'m5-warehouse-tech')&&s.mission5?.hsecApproved?'':'disabled')+'>Inspeccionar control de acceso</button>')+
      '<button class="faenaPrimary" data-faena-hsec>Ver panel HSEC completo</button>';
   }
   case 'contracts':
    if(!s.mission3||s.mission3.phase==='inactive')return '<p class="faenaHint">Los contratos se habilitan en Misión 3. Continúa la historia desde Mensajes.</p>';
    return '<p class="faenaLead">Gestiona el contrato, revisa los objetivos y continúa desde la misma ventana hacia Producción.</p>'+
     '<nav class="faenaQuickLinks">'+button('production','Ir a Producción')+button('logistics','Pedidos y materiales')+'</nav>'+m3('m3-contract');
   case 'personnel':
    if(!s.mission3||s.mission3.phase==='inactive')return '<p class="faenaHint">El personal operativo se habilita en Misión 3.</p>';
    return renderPersonnelPremium(s,this.personnelRole||nextRequiredRole(s),this.personnelCandidate,icon,this.personnelView,this.personnelDetailTab);
   case 'headquarters':
    if(!s.mission3||s.mission3.phase==='inactive')return '<p class="faenaHint">Casa Matriz se habilita con tu primer contrato de perforación.</p>';
    return '<p class="faenaLead">Todos los productos DRILLCO® se solicitan a Casa Matriz. No se compran herramientas dentro del Taller ni de la Bodega.</p>'+
     '<div class="faenaQuickLinks"><button data-faena-view="m3-catalog">RC / EXPLORA®</button><button data-faena-view="m4-dth-catalog">DTH / PUMA®</button>'+button('logistics','Seguimiento de pedidos')+'</div>'+
     m3('m3-catalog');
   case 'patio':return s.mission5?.status&&s.mission5.status!=='locked'?personalTruckActions(s)+renderPatioApp(s,fmt,icon):'<p class="faenaHint">El Patio se habilita en Misión 5.</p>';
   default:{
    // V82: worksite command center is a visual dashboard over existing routes,
    // not a second economic/mission/controller implementation.
    const readout=mission5Readout(s);
    const isM5=!!(s.mission5?.status&&s.mission5.status!=='locked');
    const isM4=!!(s.mission4?.phase&&s.mission4.phase!=='inactive');
    const isM3=!!(s.mission3?.phase&&s.mission3.phase!=='inactive');
    const free=!!(s.mission5?.commissionedAt&&s.narrative?.rewardsCollected?.includes('m5'));
    const stage=isM5?5:isM4?4:isM3?3:s.hsec?.completedAt?2:1;
    const titles={1:'Un nuevo comienzo',2:'Seguridad HSEC',3:'Tu primer contrato',4:'Operación productiva',5:'Patio y flota'};
    const captions={
     1:'Prepara la infraestructura de tu faena.',
     2:'Revisa las condiciones de seguridad.',
     3:'Gestiona el contrato y prepara los sondajes.',
     4:'Controla los sondajes y equipos DTH.',
     5:'Administra el patio y sus nuevas unidades.'
    };
    const missionRoute=free?'production':stage===5?'patio':stage===4?'production':stage===3?'contracts':stage===2?'safety':null;
    const missionCaption=free?'La faena sigue operando. Continúa expandiéndola.':captions[stage];
    const nextStep=stage===5&&readout.pending?readout.pending.label:stage===3?'Consulta los objetivos de tu contrato.':stage===4?'Consulta producción y zonas.':stage===2?'Revisa tu panel HSEC.':'Revisa los módulos disponibles.';
    const pendingOrders=(s.orders||[]).filter(o=>o.status==='dispatched').length;
    const crew=activePersonnelCount(s);
    const workshopLvl=workshopLevel(s);
    const trucks=Number(!!s.mission4?.drillTruck)+Number(!!s.mission5?.personalTruck);
    const fcIcon=(name,alt='')=>'<img class="fcIcon" width="64" height="64" loading="eager" draggable="false" alt="'+esc(alt)+'" src="./assets/faena-v82/icons/'+name+'.svg">';
    const operational=[
     ['production','Producción y zonas','Geología, sondajes y avance DTH',isM3?'Operación disponible':'Desde misión 3'],
     ['logistics','Galpón logístico','Inventario, entregas y kits','Pedidos activos: '+pendingOrders],
     ['workshop','Taller técnico','Reafilado, reparaciones y recambios',workshopLvl?'Taller nivel '+workshopLvl:'Taller pendiente'],
     ['fleet','Patio y flota','Vehículos, estacionamientos y acceso',trucks?trucks+' unidad(es) registrada(s)':'Ver vehículos']
    ];
    const management=[
     ['contracts','Contratos','Objetivos y recompensas','Ver contratos'],
     ['personnel','Personal','Contratación y equipo',crew+' integrante(s)'],
     ['safety','Seguridad HSEC','Inspecciones y controles','Ver seguridad'],
     ['headquarters','Casa Matriz','Productos y suministros','Solicitar productos']
    ];
    const renderTile=(tile,kind)=>{
     const [id,label,description,meta]=tile;
     const feature=(id===missionRoute||(stage===3&&id==='personnel'&&crew===0))?' fcTile--featured':'';
     return '<button type="button" class="fcTile fcTile--'+kind+feature+'" data-faena-route="'+id+'" data-fc-art="'+id+'" aria-label="Abrir '+esc(label)+'">'+
      '<span class="fcTilePhoto" aria-hidden="true"></span>'+
      '<span class="fcTileCopy"><span class="fcTileBadge">'+fcIcon(id)+'</span>'+
      '<span class="fcTileWords"><b>'+esc(label)+'</b><small>'+esc(description)+'</small></span>'+
      '<span class="fcTileArrow" aria-hidden="true">›</span></span>'+
      '<span class="fcTileStatus">'+esc(meta)+'</span></button>';
    };
    const missionAction=missionRoute?'data-faena-route="'+missionRoute+'"':'data-faena-close';
    const metrics=[
     ['team','Personal activo',crew],
     ['orders','Pedidos en camino',pendingOrders],
     ['workshop','Taller técnico',workshopLvl?'Nivel '+workshopLvl:'Pendiente'],
     ['safety','Seguridad HSEC','Ver panel']
    ];
    return '<section class="fcHub" aria-label="Centro de mando de la faena">'+
     '<div class="fcHubWorkspace">'+
      '<aside class="fcHubRail" aria-label="Estado y misión">'+
       '<button class="fcMission" type="button" '+missionAction+' data-fc-stage="'+stage+'" aria-label="Continuar misión actual">'+
        '<span class="fcMissionArt" aria-hidden="true"></span>'+
        '<span class="fcMissionBadge">'+(free?'JUEGO LIBRE':'MISIÓN '+stage)+'</span>'+
        '<strong>'+esc(free?'Faena en operación':titles[stage])+'</strong>'+
        '<small>'+esc(missionCaption)+'</small>'+
        '<span class="fcMissionAction">Continuar <span aria-hidden="true">›</span></span>'+
       '</button>'+
       '<div class="fcRailTitle">RESUMEN OPERATIVO</div>'+
       '<div class="fcRailMetrics">'+metrics.map(([id,title,value])=>
        '<div class="fcRailMetric">'+fcIcon(id)+'<span>'+esc(title)+'</span><b>'+esc(value)+'</b></div>'
       ).join('')+'</div>'+
       '<button class="fcFinanceLink" type="button" data-faena-route="finances" aria-label="Consultar historial financiero">Historial financiero <small aria-hidden="true">›</small></button>'+
       '<button type="button" class="fcNextStep" '+missionAction+'><span class="fcNextLabel">SIGUIENTE ACCIÓN</span>'+
        '<b>'+esc(readout.pending&&stage===5?readout.pending.label:nextStep)+'</b>'+
        '<span>Ir a '+esc(missionRoute?routes[missionRoute]:'la faena')+' <span aria-hidden="true">›</span></span></button>'+
      '</aside>'+
      '<div class="fcHubBoard" aria-label="Accesos de operación y gestión">'+
       '<div class="fcGroupTitle"><span>OPERACIONES</span><small>Instalaciones y equipos</small></div>'+
       '<div class="fcOperationGrid">'+operational.map(x=>renderTile(x,'operation')).join('')+'</div>'+
       '<div class="fcGroupTitle fcGroupTitle--management"><span>GESTIÓN Y APOYO</span><small>Servicios de faena</small></div>'+
       '<div class="fcManagementGrid">'+management.map(x=>renderTile(x,'management')).join('')+'</div>'+
      '</div>'+
     '</div></section>';
   }
  }
 }
 render(){
  if(!this.visible)return;
  const s=this.state();if(!s)return;
  const t=this.translate(),fmt=this.format,icon=this.icon,route=this.route;
  const title=this.view?({ 'm3-catalog':'Casa Matriz RC','m4-dth-catalog':'Casa Matriz DTH','m3-geology':'Geología','m4-zones':'Zonas','m3-orders':'Pedidos','m4-workshop':'Equipos DTH','m3-inventory':'Stock RC','m4-drilltruck':'DrillTruck®'})[this.view]||routes[route]:routes[route];
  const prev=this.view?route:route==='overview'?'': 'overview';
  const currentScroll=this.lastKey===route+':'+this.view?this.host.querySelector('.faenaBody')?.scrollTop||0:0;
  const isPersonnel=route==='personnel'&&!this.view;
  const isHub=route==='overview'&&!this.view;
  const isWorkshop=route==='workshop'&&!this.view;
  const pageMarkup=this.pageHtml(s,t,fmt,icon);
  if(isHub&&this._lastHubPage===pageMarkup&&this.host.querySelector('.fcHub')){
   const cash=this.host.querySelector('.fcHeaderCash strong');
   const energy=this.host.querySelector('.fcHeaderEnergy strong');
   if(cash)cash.textContent=money(s.cash);
   if(energy)energy.textContent=Math.round(s.energy||0)+'/20';
   return;
  }
  this._lastHubPage=isHub?pageMarkup:null;
  if(isPersonnel&&this._lastPersonnelPage===pageMarkup&&this.host.querySelector('.pvRoot')){
   const badge=this.host.querySelector('.pvHeaderFunds');
   if(badge&&badge.textContent!==money(s.cash))badge.textContent=money(s.cash);
   return;
  }
  this._lastPersonnelPage=isPersonnel?pageMarkup:null;
  const personnelTitle=isPersonnel?'<div class="pvScreenIdentity"><span class="pvScreenGlyph">'+icon('dock-users')+'</span><div><h2>Personal</h2><small>CONTRATACIÓN Y GESTIÓN DEL EQUIPO</small></div></div>':'<div><small>DRILL RUN · OPERACIÓN</small><h2>'+esc(title||'Centro de Faena')+'</h2></div>';
  const personnelCash=isPersonnel?'<span class="pvHeaderFunds" aria-label="Saldo actual">'+money(s.cash)+'</span>':'';
  const hubTitle=isHub?'<div class="fcHeaderIdentity"><span class="fcHeaderEmblem"><img src="./assets/faena-v82/icons/hub.svg" alt="" width="64" height="64"></span><span><small>OPERACIÓN DEL PROYECTO</small><h2>Centro de Faena</h2></span></div>':null;
  const hubResources=isHub?'<span class="fcHeaderCash"><span>Saldo</span><strong>'+money(s.cash)+'</strong></span><span class="fcHeaderEnergy"><span>'+icon('energy')+'</span><strong>'+Math.round(s.energy||0)+'/20'+'</strong></span>':'';
  this.host.innerHTML='<div class="faenaDialog '+(isPersonnel?'pvDialog':isHub?'fcOverviewDialog':isWorkshop?'ws102Dialog':'')+'" role="dialog" aria-modal="true" aria-label="Centro de Faena">'+
   '<header class="faenaHeader">'+(hubTitle||personnelTitle)+
   '<div class="faenaHeaderActions">'+(isHub?hubResources:personnelCash)+(prev?'<button data-faena-back aria-label="Volver">‹ Volver</button>':'')+
   '<button data-faena-close aria-label="Cerrar Centro de Faena">✕</button></div></header>'+
   '<div class="faenaBody"><div class="faenaContent">'+pageMarkup+'</div></div>'+
   (isPersonnel||isHub?'':'<footer class="faenaFooter"><button data-faena-route="overview">'+icon('inventory')+' Centro de Faena</button>'+
   '<button data-faena-route="production">'+icon('geology')+' Producción</button>'+
   '<button data-faena-route="logistics">'+icon('store')+' Logística</button>'+
   '<button data-faena-route="workshop">'+icon('wrench')+' Taller</button></footer>')+'</div>';
  const body=this.host.querySelector('.faenaBody');if(body)body.scrollTop=currentScroll;
  if(isPersonnel){
   const strip=this.host.querySelector('.pvCandidates'),choice=strip?.querySelector('.pvCandidate[aria-pressed="true"]');
   // Keep selected candidate in frame on phone, where only two cards fit.
   if(strip&&choice){
    const start=choice.offsetLeft-strip.offsetLeft;
    strip.scrollLeft=Math.max(0,start-(strip.clientWidth-choice.clientWidth)/2);
   }
  }
  this.lastKey=route+':'+this.view;
  if(isWorkshop)this.updateWorkshopClock();
 }
 handle(e){
  const b=e.target.closest('button');
  if(!b||b.disabled||!this.host.contains(b))return;
  if(b.dataset.financeFilter){this.financialFilter=b.dataset.financeFilter;this.onFeedback?.('select');this.render();return;}
   if(b.dataset.pvDetailTab){this.personnelDetailTab=b.dataset.pvDetailTab;this.onFeedback?.('select');this.render();return;}
  if(b.hasAttribute('data-pv-team-open')){this.personnelView='team';this.onFeedback?.('select');this.render();return;}
  if(b.hasAttribute('data-pv-team-back')){this.personnelView='recruit';this.onFeedback?.('select');this.render();return;}
  if(b.dataset.pvTeamPerson){this.personnelCandidate=b.dataset.pvTeamPerson;this.onFeedback?.('select');this.render();return;}
  if(b.dataset.pvRole){
   this.personnelRole=b.dataset.pvRole;this.personnelDetailTab='ficha';
   this.personnelCandidate=candidatesForRole(this.personnelRole)[0]?.id||null;
   this.onFeedback?.('select');this.render();return;
  }
  if(b.dataset.pvCandidate){
   this.personnelCandidate=b.dataset.pvCandidate;this.personnelDetailTab='ficha';
   this.onFeedback?.('select');this.render();return;
  }
  if(b.hasAttribute('data-pv-prev')||b.hasAttribute('data-pv-next')){
   const entries=candidatesForRole(this.personnelRole);
   const current=entries.findIndex(x=>x.id===this.personnelCandidate);
   const direction=b.hasAttribute('data-pv-next')?1:-1;
   this.personnelCandidate=entries[(current+direction+entries.length)%entries.length]?.id||null;this.personnelDetailTab='ficha';
   this.onFeedback?.('select');this.render();return;
  }
  if(b.hasAttribute('data-pv-requirement')){
   this.personnelRole=nextRequiredRole(this.state());
   this.personnelCandidate=candidatesForRole(this.personnelRole)[0]?.id||null;
   this.onFeedback?.('skill');this.render();return;
  }
  if(b.dataset.pvRoster){
   this.personnelRole=b.dataset.pvRoster;
   this.personnelView='team';
   const identity=b.dataset.pvPerson;
   this.personnelCandidate=candidatesForRole(this.personnelRole).some(c=>c.id===identity)
    ?identity:candidatesForRole(this.personnelRole)[0]?.id||null;
   this.onFeedback?.('skill');this.render();return;
  }
  if(b.hasAttribute('data-pv-hire')){
   const s=this.state(),role=this.personnelRole,candidateId=this.personnelCandidate;
   if(personnelAvailability(s,role,candidateId))return;
   this.onFeedback?.('confirm');
   this.onAppAction?.(role.startsWith('m5-')?'m5':'m3','hire',role+'|'+candidateId);
   this.render();return;
  }
  if(b.hasAttribute('data-faena-close')){this.close();return;}
  if(b.hasAttribute('data-faena-back')){if(this.view){this.view='';this.render();}else this.open('overview');return;}
  if(b.dataset.faenaRoute){this.open(b.dataset.faenaRoute);return;}
  if(b.dataset.faenaView){this.open(b.dataset.faenaView);return;}
  if(b.hasAttribute('data-faena-hsec')){this.close();this.onHsec?.();return;}
  if(b.hasAttribute('data-faena-personal-locate')){this.close();this.onLocatePersonalTruck?.();return;}
  if(b.hasAttribute('data-faena-personal-recover')){this.onRecoverPersonalTruck?.();this.render();return;}
  if(b.hasAttribute('data-faena-workshop-upgrade')){this.onAppAction?.('m3','upgradeWorkshop',null);this.render();return;}
  if(b.dataset.faenaKit){this.onKitOrder?.(b.dataset.faenaKit);this.render();return;}
  if(b.dataset.faenaRecover){this.onRecovery?.(b.dataset.faenaRecover);this.render();return;}
  if(b.dataset.app){this.navigate(b.dataset.app);return;}
  if(b.dataset.m5Action){this.onAppAction?.('m5',b.dataset.m5Action,null);this.render();return;}
  if(b.dataset.hirePatio){this.onAppAction?.('m5','hire',b.dataset.hirePatio);this.render();return;}
  if(b.dataset.m4Action){this.onAppAction?.('m4',b.dataset.m4Action,b.dataset.zone||b.dataset.bh||b.dataset.drill||b.dataset.tool||b.dataset.model||null);this.render();return;}
  const m3=[
   ['hire','hire'],['buyDrill','buyDrill'],['acceptContract','acceptContract'],['completeContract','completeContract'],
   ['startDrilling','startDrilling'],['requestGeo','requestGeo'],['accelerateGeo','accelerateGeo'],
   ['addCart','addToCart'],['installTool','installTool'],['upgradeWorkshop','upgradeWorkshop'],['locateMachinery','locateMachinery']
  ];
  for(const [key,action] of m3){const att='data-'+key.replace(/[A-Z]/g,x=>'-'+x.toLowerCase());if(b.hasAttribute(att)){
   const arg=b.dataset[key]||null;
   if(action==='locateMachinery'){this.close();this.onLocate?.(arg);}
   else{this.onAppAction?.('m3',action,arg);this.render();}
   return;
  }}
 }
}
