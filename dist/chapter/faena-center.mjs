// V53 · One operational workspace with contextual entry points.
// Renders EXISTING M3/M4/M5 controllers; no duplicate spending/progression.
import {renderM3App} from '../mission3/phone-apps.mjs';
import {renderM4App} from '../mission4/phone-apps.mjs';
import {renderPatioApp} from '../mission5/patio-ui.mjs';
import {mission5Readout} from '../mission5/mission-readout.mjs';
import {hiredPatioStaff,gateChecked,warehouseChecked} from '../mission5/patio-staff.mjs';
import {REPAIR_KITS,workshopRecoverySummary} from '../mission5/workshop-recovery.mjs';
import {workshopLevel} from '../mission3/inventory.mjs';
import {fleetOccupancy} from '../mission5/fleet-base.mjs';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'🪙 '+Math.round(Number(n)||0).toLocaleString('es-CL');
const stamp=s=>s?new Date(s).toLocaleDateString('es-CL',{day:'2-digit',month:'short'}):'Pendiente';
const routes=Object.freeze({
 overview:'Centro de Faena',production:'Producción y zonas',logistics:'Galpón logístico',
 workshop:'Taller técnico',fleet:'Patio y flota',safety:'Seguridad HSEC',
 contracts:'Contratos',personnel:'Personal',headquarters:'Casa Matriz',
 patio:'Patio de Maquinarias',geology:'Geología',zones:'Zonas'
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

export class FaenaCenterUI{
 constructor({host,state,translate,format,icon,onClose,onAppAction,onKitOrder,onRecovery,onHsec,onLocate}){
  Object.assign(this,{host,state,translate,format,icon,onClose,onAppAction,onKitOrder,onRecovery,onHsec,onLocate});
  this.route='overview';this.view='';this.lastKey='';
  host.addEventListener('click',event=>this.handle(event));
 }
 get visible(){return !this.host.classList.contains('hidden');}
 open(route='overview'){
  this.route=routes[route]?route:faenaRouteForApp(route);
  this.view=route.startsWith('m3-')||route.startsWith('m4-')?route:'';
  this.host.classList.remove('hidden');this.host.hidden=false;
  this.render();
 }
 close(){this.host.classList.add('hidden');this.host.hidden=true;this.onClose?.();}
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
   case 'workshop':{
    const info=workshopRecoverySummary(s),lvl=workshopLevel(s);
    const states={needsRepairKit:'Sin kit disponible',noWorkshopCapacity:'Sin capacidad',toolNotWornEnough:'Herramienta aún útil',recoveryLimit:'Recuperación agotada',toolNotRecoverable:'No recuperable',patioNotReady:'Requiere Patio L1',workshopNotBuilt:'Construye el Taller'};
    const jobs=info.jobs.map(j=>'<div class="faenaStockRow"><span><b>'+esc(j.toolId)+'</b><small>Recuperación técnica en curso</small></span><b>'+Math.floor(j.remainingSeconds/60).toString().padStart(2,'0')+':'+(j.remainingSeconds%60).toString().padStart(2,'0')+'</b></div>').join('');
    const stock=info.candidates.map(tool=>'<div class="faenaOrderRow"><span><b>'+esc(tool.model)+'</b><small>'+esc(tool.type==='bit'?'Reafilado de bit':'Reparación de martillo')+' · '+Math.round((tool.lifeRemaining||0)/Math.max(1,tool.lifeTotal||1)*100)+'% vida · '+(tool.recoveryCount||0)+' recuperaciones</small></span><button data-faena-recover="'+esc(tool.id)+'" '+(tool.blocked?'disabled':'')+'>'+esc(tool.blocked?states[tool.blocked]||tool.blocked:'Recuperar')+'</button></div>').join('');
    const active=lvl>0;
    return '<p class="faenaLead">El Taller ya no es otra bodega. Reafila bits, repara martillos con kits y devuelve herramientas recuperadas a la operación.</p>'+
     '<div class="faenaMetrics">'+small('Nivel técnico',lvl)+small('Trabajos pendientes',info.jobs.length)+small('Recuperaciones realizadas',info.completed)+'</div>'+
     (!active?'<p class="faenaHint">Construye el Taller desde Catálogo para habilitarlo.</p>':
     section('Trabajos de recuperación',jobs||'<p class="faenaHint">No hay trabajos en proceso.</p>')+
     section('Herramientas para recuperar',stock||'<p class="faenaHint">No hay piezas desgastadas para recuperar. El material agotado que vuelva de perforación aparecerá aquí.</p>')+
     section('Kits en el Taller',Object.values(REPAIR_KITS).map(k=>small(k.label,info.kits[k.id]||0)).join('')+button('logistics','Solicitar kits en Bodega'))+
     section('Instalación y mantenimiento DTH',s.mission4&&s.mission4.phase!=='inactive'?m4('m4-workshop'):'<p class="faenaHint">La perforadora DTH se habilita en la Misión 4.</p>')+
     '<nav class="faenaQuickLinks">'+button('logistics','Ver inventario de Bodega')+button('headquarters','Casa Matriz')+'</nav>');
   }
   case 'fleet':{
    const yard=fleetOccupancy(s),truck=s.mission5?.personalTruck;
    return '<p class="faenaLead">El Patio administra plazas de estacionamiento, vehículos y circulación segura. El Taller se ocupa exclusivamente de trabajos técnicos.</p>'+
     '<div class="faenaMetrics">'+small('DrillTruck® 01',s.mission4?.drillTruck?'Automático':'Pendiente')+small('DrillTruck® 02',truck?truck.mode==='driving'?'En conducción':'Disponible':'Pendiente')+small('Portón HSEC',gateChecked(s)?'Verificado':'Pendiente')+'</div>'+
     '<nav class="faenaQuickLinks">'+button('patio','Plazas, acceso y flota')+button('logistics','Galpón logístico')+'</nav>'+
     section('Unidades registradas','<p>Camionetas techadas: '+yard.covered.length+' · Perforadoras: '+yard.openDrill.length+' · Equipos pesados: '+yard.openHeavy.length+'</p>')+
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
    return '<p class="faenaLead">Gestiona el contrato, revisa los objetivos y continúa desde la misma ventana hacia Producción.</p>'+
     '<nav class="faenaQuickLinks">'+button('production','Ir a Producción')+button('logistics','Pedidos y materiales')+'</nav>'+m3('m3-contract');
   case 'personnel':
    return '<p class="faenaLead">Un solo lugar para contratar y consultar el personal operativo, incluida la guardia y la técnica del Patio.</p>'+m3('m3-personnel');
   case 'headquarters':
    return '<p class="faenaLead">Todos los productos DRILLCO® se solicitan a Casa Matriz. No se compran herramientas dentro del Taller ni de la Bodega.</p>'+
     '<div class="faenaQuickLinks"><button data-faena-view="m3-catalog">RC / EXPLORA®</button><button data-faena-view="m4-dth-catalog">DTH / PUMA®</button>'+button('logistics','Seguimiento de pedidos')+'</div>'+
     m3('m3-catalog');
   case 'patio':return renderPatioApp(s,fmt,icon);
   default:{
    const readout=mission5Readout(s);
    const cards=[
     ['production','geology','Producción y zonas','Análisis geológico, sondajes, conversión y DTH'],
     ['logistics','inventory','Galpón logístico','Stock real, Casa Matriz, kits y pedidos'],
     ['workshop','wrench','Taller técnico','Reafiliado, reparación y recambios'],
     ['fleet','machine','Patio y flota','Plazas, DrillTruck® y circulación'],
     ['safety','lock','Seguridad HSEC','Inspecciones y barreras'],
     ['contracts','objectives','Contratos','Objetivos, etapas y recompensas']
    ];
    return '<p class="faenaLead">Toda la operación de la faena en una pantalla. Toca un módulo; desde el edificio real abres exactamente la misma interfaz.</p>'+
     '<div class="faenaMetrics">'+small('Saldo',money(s.cash))+small('Misión 5',readout.done+'/'+readout.total)+small('Pedidos activos',(s.orders||[]).filter(o=>o.status==='dispatched').length)+'</div>'+
     '<div class="faenaGrid">'+cards.map(([id,ico,title,description])=>'<button class="faenaTile" data-faena-route="'+id+'"><span class="faenaTileIcon">'+icon(ico)+'</span><b>'+title+'</b><small>'+description+'</small><span class="faenaTileArrow">›</span></button>').join('')+'</div>'+
     '<nav class="faenaQuickLinks">'+button('personnel','Personal')+button('headquarters','Casa Matriz')+button('patio','Misión 5 · Patio completo')+'</nav>'+
     (readout.pending?section('Siguiente objetivo de Misión 5','<p><b>'+esc(readout.pending.label)+'</b></p><p>'+esc(readout.pending.hint)+'</p>'):'');
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
  this.host.innerHTML='<div class="faenaDialog" role="dialog" aria-modal="true" aria-label="Centro de Faena">'+
   '<header class="faenaHeader"><div><small>DRILL RUN · OPERACIÓN</small><h2>'+esc(title||'Centro de Faena')+'</h2></div>'+
   '<div class="faenaHeaderActions">'+(prev?'<button data-faena-back aria-label="Volver">‹ Volver</button>':'')+
   '<button data-faena-close aria-label="Cerrar Centro de Faena">✕</button></div></header>'+
   '<div class="faenaBody"><div class="faenaContent">'+this.pageHtml(s,t,fmt,icon)+'</div></div>'+
   '<footer class="faenaFooter"><button data-faena-route="overview">'+icon('inventory')+' Centro de Faena</button>'+
   '<button data-faena-route="production">'+icon('geology')+' Producción</button>'+
   '<button data-faena-route="logistics">'+icon('store')+' Logística</button>'+
   '<button data-faena-route="workshop">'+icon('wrench')+' Taller</button></footer></div>';
  const body=this.host.querySelector('.faenaBody');if(body)body.scrollTop=currentScroll;
  this.lastKey=route+':'+this.view;
 }
 handle(e){
  const b=e.target.closest('button');
  if(!b||b.disabled||!this.host.contains(b))return;
  if(b.hasAttribute('data-faena-close')){this.close();return;}
  if(b.hasAttribute('data-faena-back')){if(this.view){this.view='';this.render();}else this.open('overview');return;}
  if(b.dataset.faenaRoute){this.open(b.dataset.faenaRoute);return;}
  if(b.dataset.faenaView){this.open(b.dataset.faenaView);return;}
  if(b.hasAttribute('data-faena-hsec')){this.close();this.onHsec?.();return;}
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
