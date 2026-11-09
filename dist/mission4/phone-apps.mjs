// Mission 4 — Phone/Computer app screens
// Renders M4 UI panels inside the existing PhoneUI system.
import {mission4Phase,mission4Objectives,mission4Objective} from './mission4-state.mjs';
import {canPurchaseDrillTruck,drillTruckInfo,DRILLTRUCK_COST} from './drilltruck.mjs';
import {DTH_DRILLS,DTH_HAMMERS,DTH_BITS,dthDrillDefinition,canPurchaseDthDrill,dthDrillEquipped,dthDrillAssigned,compatibleDthHammers,compatibleDthBits,canInstallDthTool} from './drills-dth.mjs';
import {convertableBoreholes,availableZones,zoneById} from './zones.mjs';
import {maintenanceProgress,MAINTENANCE_PHASES} from './maintenance.mjs';
import {zoneIncomePerCycle,incomePerHour,CYCLE_DURATION,totalAutomatedIncome} from './production.mjs';
import {canBuildParking} from './parking.mjs';
import {mission4Readout,M4_ENTRY_PACKAGE} from './operations-guide.mjs';
import {workshopLevel,canUpgradeWorkshop,workshopUpgradeJob,WORKSHOP_LEVELS} from '../mission3/inventory.mjs';
import {hasRole,canHire} from '../mission3/personnel.mjs';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const M4_APPS=['m4-objectives','m4-operaciones','m4-workshop','m4-drilltruck','m4-zones','m4-dth-catalog'];

export function isM4App(app){return M4_APPS.includes(app);}

export function m4HomeApps(s,t,icon){
 if(!s.mission4||mission4Phase(s)==='inactive')return '';
 const apps=[];
 apps.push({id:'m4-operaciones',icon:'inventory',label:'Operación',css:'m4-operaciones'});
 apps.push({id:'m4-zones',icon:'geology',label:'Zonas',css:'m4-zones'});
 return apps.map(a=>`<button data-app="${a.id}"><span class="appTile app-${a.css}">${icon(a.icon)}</span><span>${esc(a.label)}</span></button>`).join('');
}

export function renderM4App(app,s,t,fmt,icon,callbacks){
 if(app==='m4-objectives')return renderM4Objectives(s,t,fmt,icon,callbacks);
 if(app==='m4-operaciones')return renderM4Operations(s,t,fmt,icon,callbacks);
 if(app==='m4-workshop')return renderDthWorkshop(s,t,fmt,icon,callbacks);
 if(app==='m4-drilltruck')return renderDrillTruck(s,t,fmt,icon,callbacks);
 if(app==='m4-zones')return renderZones(s,t,fmt,icon,callbacks);
 if(app==='m4-dth-catalog')return renderDthCatalog(s,t,fmt,icon,callbacks);
 return '';
}

function renderM4Objectives(s,t,fmt,icon,cb){
 const phase=mission4Phase(s);
 const objs=mission4Objectives(s);
 const objNames={
  upgradeWorkshop:'Ampliar el taller',
  equipDth:'Adquirir perforadora DTH',
  deployProduction:'Desplegar producción',
  automateDrillTruck:'Automatizar con DrillTruck',
  automatedProduction:'Producción automatizada'
 };
 const checkLabels={
  upgradeToNv2:'Taller nivel 2',
  buildParking:'Construir estacionamiento',
  purchaseDthDrill:'Perforadora DTH adquirida',
  orderPumaTools:'Herramientas PUMA DTH pedidas',
  installDthTools:'PUMA DTH + bit DTH instalados',
  convertBorehole:'Convertir sondaje a zona',
  assignDthToZone:'Perforadora DTH instalada en zona',
  hireTecnicoDrillco:'Técnico DRILLCO® contratado',
  purchaseDrillTruck:'DrillTruck adquirido',
  linkTruckToZone:'DrillTruck vinculado a zona',
  completeProductionCycle:'Primer ciclo de producción',
  convertAllZones:'Automatizar todas las zonas'
 };
 let html=`<div class="m3Header">${icon('location')}<div><span class="eyebrow">MISIÓN 4</span><h3>Automatiza tu operación</h3></div></div>`;
 html+=`<div class="steps">`;
 for(const obj of objs){
  const allDone=obj.checks.every(c=>c.done);
  const isActive=s.mission4.currentObjective===obj.id;
  html+=`<div class="${allDone?'done':isActive?'active':''}"><span class="stepNumber">${allDone?icon('check'):String(obj.id).padStart(2,'0')}</span><span><b>${esc(objNames[obj.nameKey]||obj.nameKey)}</b>`;
  for(const check of obj.checks){
   const building=check.id==='workshopNv2'&&!check.done&&workshopUpgradeJob(s);
   html+=`<small>${check.done?icon('check'):building?'⏳':'○'} ${esc(checkLabels[check.labelKey]||check.labelKey)}${building?' (en construcción)':''}</small>`;
  }
  html+=`</span></div>`;
 }
 html+=`</div>`;
 if(phase==='complete'){
  html+=`<div class="bankCard"><div class="bankBrand">${icon('check')}<span>COMPLETADA</span></div><small>Operación automatizada exitosamente</small><b>${fmt(totalAutomatedIncome(s))} generados</b></div>`;
 }
 return html;
}

// Permanent production overview shown after the narrative mission is completed.
// Read-only: it never modifies production, tools, cash, or the player's save.
function renderCompletedOperations(s,fmt,icon){
 const m=s.mission4,drill=m.productionDrill||{},truck=m.drillTruck||{};
 const zones=m.zones||[],active=zones.find(z=>z.id===drill.assignedZone)||null;
 const inventory=s.toolInventory||[];
 const hammer=inventory.find(t=>t.id===drill.installedHammer);
 const bit=inventory.find(t=>t.id===drill.installedBit);
 const unused=type=>inventory.filter(t=>t.type===type&&(t.status==='new'||t.status==='worn')&&(type==='bit'?t.model?.startsWith('dth-'):t.model?.startsWith('puma-dth'))).length;
 const discarded=inventory.filter(t=>t.status==='spent').length;
 const now=Date.now();
 const remaining=z=>Number.isFinite(z.lastCycleAt)&&z.lastCycleAt>0?Math.max(0,Math.ceil((CYCLE_DURATION*1000-(now-z.lastCycleAt))/1000)):null;
 const clock=secs=>secs===null?'Sin ciclo activo':String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');
 const toolLabel=t=>t?esc(t.model||t.type)+' · '+(Number.isFinite(t.lifeRemaining)?Math.max(0,Math.round(t.lifeRemaining))+' vida restante':'vida sin datos'):'No instalado';
 let html=`<div class="m3Header"><span class="inventoryIcon">${icon('inventory')}</span><div><span class="eyebrow">CENTRO DE OPERACIONES · PRODUCCIÓN PERMANENTE</span><h3>Zona 1 · Producción DTH</h3></div></div>`;
 html+=`<section class="m4OpsSummary"><b>MISIÓN 4 COMPLETADA · OPERACIÓN ACTIVA</b><p>La faena continúa después de la misión. Estos son los estados registrados; la rotación automática entre puntos y el desgaste por ciclo aún no están habilitados.</p></section>`;
 html+=`<div class="dcGrid"><div class="dcStat"><small>Puntos convertidos</small><b>${zones.length}</b></div><div class="dcStat"><small>Ciclos acreditados</small><b>${m.productionCycles||0}</b></div><div class="dcStat"><small>Ingresos reales</small><b>${fmt(m.totalAutomatedIncome||0)}</b></div><div class="dcStat"><small>Producción estimada/h</small><b>${fmt(incomePerHour(s))}</b></div></div>`;
 html+=`<div class="sectionHeading">Perforadora DTH · ${esc(active?.id||'Sin zona asignada')}</div><div class="m4OpsEquipment"><b>Estado</b><span>${esc(drill.state||'Sin perforadora')}</span><b>Martillo</b><span>${toolLabel(hammer)}</span><b>Bit</b><span>${toolLabel(bit)}</span><b>Destino actual</b><span>${esc(active?.id||'Pendiente')}</span></div>`;
 html+=`<div class="sectionHeading">Puntos de producción</div>`;
 if(!zones.length)html+='<p class="m4OpsHint">No hay puntos convertidos.</p>';
 for(let i=0;i<zones.length;i++){
  const z=zones[i],isCurrent=z.id===drill.assignedZone,secs=z.status==='producing'?remaining(z):null;
  const state=z.status==='producing'?'Produciendo':z.status==='maintenance'?'En mantenimiento':'En espera';
  html+=`<section class="m4OpsNext"><small>PUNTO ${i+1} · ${esc(z.id)}${isCurrent?' · DTH ASIGNADA':''}</small><h3>${state}</h3><p>Ciclos acreditados: ${z.cycleCount||0} · Ingresos: ${fmt(z.totalIncome||0)}</p>${secs!==null?`<b>Próximo cierre de ciclo: ${clock(secs)}</b>`:'<small>Sin cuenta regresiva activa</small>'}</section>`;
 }
 html+=`<div class="sectionHeading">DrillTruck® y consumibles</div><div class="m4OpsEquipment"><b>DrillTruck®</b><span>${esc(truck.maintenancePhase?'Atendiendo · '+truck.maintenancePhase:truck.state||'No disponible')}</span><b>Bits DTH en bodega</b><span>${unused('bit')}</span><b>Martillos DTH en bodega</b><span>${unused('hammer')}</span><b>Herramientas descartadas</b><span>${discarded} registradas en inventario</span></div>`;
 html+='<p class="m4OpsHint">Los consumibles descartados se conservarán para el futuro sistema de reciclaje. Esta pantalla no simula recambios ni registra descartes nuevos.</p>';
 html+=`<div class="m4OpsLinks"><button data-app="m4-zones">${icon('geology')}<span><b>Ver zonas</b><small>Estado y asignación</small></span></button><button data-app="m4-workshop">${icon('inventory')}<span><b>Taller y stock</b><small>Herramientas y perforadora</small></span></button><button data-app="m4-drilltruck">${icon('machine')}<span><b>DrillTruck®</b><small>Servicio y logística</small></span></button><button data-app="m3-catalog">${icon('store')}<span><b>Casa Matriz</b><small>Pedidos de consumibles</small></span></button></div>`;
 return html;
}

// Unified M4 operations dashboard: every link opens an existing working app.
function renderM4Operations(s,t,fmt,icon,cb){
 if(s.mission4?.phase==='complete')return renderCompletedOperations(s,fmt,icon);
 const view=mission4Readout(s);
 const next=view.next;
 let html=`<div class="m3Header"><span class="inventoryIcon">${icon('inventory')}</span><div><span class="eyebrow">OPERACIONES · MISIÓN 4</span><h3>Del sondaje a la producción</h3></div></div>`;
 html+=`<section class="m4OpsSummary"><b>PROGRESO REAL · ${view.done}/${view.total} requisitos</b><div class="m4OpsBar"><i style="width:${Math.round(view.progress*100)}%"></i></div>
   <span>Primero equipa tu DTH, luego despliega la maquinaria y automatiza la producción.</span></section>`;
 if(next){
  html+=`<section class="m4OpsNext"><small>SIGUIENTE PASO · ETAPA ${next.stageId}/5</small><h3>${esc(next.label)}</h3><p>${esc(next.description)}</p>
  <button class="primary" data-app="${next.app}">${icon('arrow')} Ir a ${esc(next.app==='m4-dth-catalog'?'Casa Matriz DTH':next.app==='m4-workshop'?'Taller':next.app==='m4-zones'?'Zonas':next.app==='m3-personnel'?'Personal':next.app==='m4-drilltruck'?'DrillTruck':'Operaciones')}</button></section>`;
 }
 html+=`<div class="sectionHeading">Dónde hacer cada cosa</div><div class="m4OpsLinks">
 <button data-app="m3-catalog">${icon('store')}<span><b>Casa Matriz</b><small>Comprar equipos RC, EXPLORA® y PUMA® DTH</small></span></button>
 <button data-app="m4-workshop">${icon('inventory')}<span><b>Taller</b><small>Stock, martillos, bits e instalación en DTH</small></span></button>
 <button data-app="m4-zones">${icon('geology')}<span><b>Zonas</b><small>Convertir sondajes y desplegar DTH</small></span></button>
 <button data-app="m4-drilltruck">${icon('machine')}<span><b>DrillTruck</b><small>Estacionar, contratar servicio y automatizar</small></span></button></div>`;
 html+=`<div class="sectionHeading">¿Dónde están mis equipos?</div>
 <div class="m4OpsEquipment"><b>Perforadora RC</b><span>${esc(view.rcStatus)}</span><b>Perforadora DTH</b><span>${esc(view.drillStatus)}</span>
 <b>Martillos PUMA® DTH</b><span>${view.hammerCount} recibidos · ${view.hammerInstalled?'instalado':'sin instalar'}</span>
 <b>Bits DTH</b><span>${view.bitCount} recibidos · ${view.bitInstalled?'instalado':'sin instalar'}</span>
 <b>Pedidos en tránsito</b><span>${view.pendingDeliveries}</span></div>`;
 html+=`<div class="sectionHeading">Presupuesto de referencia</div>
 <div class="m4OpsBudget"><p>Paquete mínimo desde taller L1 y sin maquinaria DTH: ${fmt(view.totalMinimum)} en total, incluyendo cuatro despachos.</p>
 <small>Ampliación ${fmt(M4_ENTRY_PACKAGE.workshop)} · DTH ${fmt(M4_ENTRY_PACKAGE.dthDrill)} · Martillo ${fmt(M4_ENTRY_PACKAGE.hammer)} · Bit ${fmt(M4_ENTRY_PACKAGE.bit)} · Técnico ${fmt(M4_ENTRY_PACKAGE.technician)} · DrillTruck ${fmt(M4_ENTRY_PACKAGE.drillTruck)} · Envíos ${fmt(M4_ENTRY_PACKAGE.dispatch)}.</small>
 <b>Saldo disponible: ${fmt(view.cash)}</b>
 <b>Estimación mínima todavía pendiente: ${fmt(view.remainingMinimum)}</b>
 ${view.remainingMinimum>view.cash?'<small>Atención: el presupuesto actual no cubre el mínimo pendiente. Revisa tus fondos antes de hacer compras.</small>':''}
 <small>No es un cobro adicional ni un paquete de compra: son los costos reales de las acciones separadas. Los elementos ya adquiridos o pedidos y pagados no se vuelven a cobrar.</small></div>`;
 html+=`<div class="sectionHeading">Checklist completo</div><div class="m4OpsChecklist">`;
 for(const group of view.groups){
  html+=`<section><h4>${group.id}. ${esc(group.title)}</h4>`;
  for(const check of group.checks)html+=`<div class="m4OpsCheck ${check.done?'complete':'pending'}"><span>${check.done?'✓':'○'}</span><b>${esc(check.label)}</b><small>${check.done?'Cumplido':'Pendiente'}</small>${check.done?'':`<button data-app="${check.app}">Abrir</button>`}</div>`;
  html+=`</section>`;
 }
 return html+`</div>`;
}

// A real tool and equipment workbench, using the same inventory and action
// callbacks as M4's catalog. Nothing is manufactured or purchased here.
function renderDthWorkshop(s,t,fmt,icon,cb){
 const v=mission4Readout(s),drill=v.drill;
 const items=(s.toolInventory||[]).filter(t2=>t2.status!=='spent');
 let html=`<div class="m3Header"><span class="inventoryIcon">${icon('inventory')}</span><div><span class="eyebrow">TALLER · NIVEL ${workshopLevel(s)}</span><h3>Gestión de maquinaria y herramientas</h3></div></div>`;
 html+=`<div class="m4OpsEquipment"><b>RC exploración</b><span>${esc(v.rcStatus)}</span><b>DTH producción</b><span>${esc(v.drillStatus)}</span>
 <b>Martillo instalado</b><span>${drill?.installedHammer?esc(items.find(x=>x.id===drill.installedHammer)?.model||'Instalado'):'No instalado'}</span>
 <b>Bit instalado</b><span>${drill?.installedBit?esc(items.find(x=>x.id===drill.installedBit)?.model||'Instalado'):'No instalado'}</span></div>`;
 if(!drill){html+=`<div class="m4OpsNext"><b>DTH aún no recibida</b><p>Solicita una perforadora en Casa Matriz → DTH. Cuando llegue al taller podrás instalar sus herramientas.</p><button data-app="m4-dth-catalog">Ir a Casa Matriz DTH</button></div>`;}
 for(const type of ['hammer','bit']){
  const available=items.filter(t2=>t2.type===type&&(t2.status==='new'||t2.status==='worn'));
  const dth=available.filter(t2=>type==='hammer'?t2.model?.startsWith('puma-dth'):t2.model?.startsWith('dth-'));
  const inUse=items.filter(t2=>t2.type===type&&t2.status==='installed'&&(type==='hammer'?t2.model?.startsWith('puma-dth'):t2.model?.startsWith('dth-')));
  html+=`<div class="sectionHeading">${type==='hammer'?'Martillos':'Bits'} · disponibles ${dth.length}, instalados ${inUse.length}</div>`;
  if(!dth.length)html+=`<p class="m4OpsHint">Sin ${type==='hammer'?'martillos PUMA® DTH':'bits DTH'} libres. Revisa Pedidos o solicita desde Casa Matriz.</p>`;
  for(const tool of dth){
   const blocked=canInstallDthTool(s,tool.id);
   const installed=type==='hammer'?!!drill?.installedHammer:!!drill?.installedBit;
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${esc(tool.model)}</b><small>Vida disponible: ${Math.round(tool.lifeRemaining||0)} / ${Math.round(tool.lifeTotal||0)} m</small></div><button data-m4-action="installDthTool" data-tool="${esc(tool.id)}" ${blocked||installed?'disabled':''}>${icon('arrow')} Instalar en DTH</button></article>`;
  }
 }
 const onOrder=(s.orders||[]).filter(o=>o.status==='pending'||o.status==='dispatched');
 if(onOrder.length)html+=`<div class="m4OpsHint">Tienes ${onOrder.length} pedido(s) en tránsito. Las herramientas aparecen aquí al entregarse.</div>`;
 html+=`<button class="primary" data-app="m4-dth-catalog">Comprar martillos, bits o perforadora DTH</button><button data-app="m4-zones">Ir a Zonas para desplegar DTH</button>`;
 return html;
}

// DTH catalog — purchase drill, PUMA hammers, DTH bits
function renderDthCatalog(s,t,fmt,icon,cb){
 const m=s.mission4;
 const drill=m?.productionDrill;
 let html=`<div class="m3Header">${icon('build')}<div><span class="eyebrow">CASA MATRIZ · PRODUCCIÓN</span><h3>Perforadoras y productos PUMA® DTH</h3></div></div>
 <nav class="m4CatalogTabs" aria-label="Categorías Casa Matriz"><button data-app="m3-catalog">EXPLORA® · Sondaje RC</button><span class="selected">PUMA® DTH · Producción</span></nav>
 <p class="m4CatalogExplanation">Compra aquí la DTH, martillos PUMA® y bits de producción. Los pedidos llegan al taller; para instalarlos abre Taller → Equipar DTH.</p>
 <button class="m4CatalogWorkshop" data-app="m4-workshop">${icon('inventory')} Ir al taller · Ver stock e instalar herramientas</button>`;
 // DTH Drill section
 html+=`<div class="sectionHeading">Perforadora DTH</div>`;
 if(!drill){
  const d=DTH_DRILLS[0];
  const pendingRig=(s.orders||[]).some(o=>['pending','dispatched'].includes(o.status)&&o.items?.some(i=>i.category==='machinery'&&i.type==='dthDrill'));
  const blocked=canPurchaseDthDrill(s,d.id)||pendingRig||s.cash<d.price+200;
  html+=`<div class="bankCard"><div class="bankBrand">${icon('build')}<span>DTH PRODUCCIÓN</span></div><small>Perforadora Down The Hole para producción</small><b>Profundidad máx. ${d.maxDepth}m · ${d.bitDiameter}" Ø</b><div class="bankWallet"><span>Precio</span><strong>${fmt(d.price)}</strong></div></div>`;
  html+=`<div style="padding:0 16px 16px"><button class="startDrillBtn" data-m4-action="buyDthDrill" data-drill="${d.id}" ${blocked?'disabled':''}>${icon('store')} ${pendingRig?'Perforadora DTH en camino':'Solicitar perforadora DTH'} · ${fmt(d.price)} + despacho</button></div>`;
 }else{
  const def=dthDrillDefinition(drill.id);
  const stateLabels={idle:drill.assignedZone?'Desplegada · esperando mantenimiento':'En resguardo junto al taller',producing:'En producción',maintenance:'En mantenimiento'};
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${def?.labelKey||'Perforadora DTH'}</b><small>${stateLabels[drill.state]||drill.state} · ${def?.bitDiameter||8}" Ø</small><span class="itemStatus isInstalled">${icon('check')} Recibida</span></div><button data-app="m4-workshop">Abrir taller</button></article>`;
  // Installed tools
  const installedHammer=drill.installedHammer?(s.toolInventory||[]).find(t2=>t2.id===drill.installedHammer):null;
  const installedBit=drill.installedBit?(s.toolInventory||[]).find(t2=>t2.id===drill.installedBit):null;
  html+=`<div class="dcGrid"><div class="dcStat"><small>Martillo</small><b>${installedHammer?'✓':'—'}</b></div><div class="dcStat"><small>Bit</small><b>${installedBit?'✓':'—'}</b></div><div class="dcStat"><small>Zona</small><b>${drill.assignedZone||'—'}</b></div><div class="dcStat"><small>Estado</small><b>${stateLabels[drill.state]||drill.state}</b></div></div>`;
 }
 // PUMA DTH Hammers
 html+=`<div class="sectionHeading">Martillos PUMA DTH</div>`;
 for(const h of DTH_HAMMERS){
  const owned=(s.toolInventory||[]).filter(t2=>t2.model===h.id&&t2.status!=='spent');
  const canInstall=drill&&!drill.installedHammer&&owned.length>0;
  const installable=canInstall?owned.find(t2=>!canInstallDthTool(s,t2.id)):null;
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${h.label}</b><small>Vida: ${h.lifeTotal}m · Rango: ${h.rockRange}</small>${owned.length?`<span class="itemStatus isInstalled">${owned.length} en stock</span>`:''}`;
  html+=`</div>`;
  if(installable){
   html+=`<button data-m4-action="installDthTool" data-tool="${installable.id}">${icon('arrow')} Instalar</button>`;
  }
  const inTransit=(s.orders||[]).filter(o=>['pending','dispatched'].includes(o.status)).flatMap(o=>o.items||[]).filter(i=>i.model===h.id).reduce((n,i)=>n+i.qty,0);
  html+=`<button data-m4-action="orderDthTool" data-model="${h.id}" data-type="hammer" ${s.cash<h.price+200?'disabled':''}>${icon('store')} Solicitar · ${fmt(h.price)}</button>${inTransit?'<small>En camino: '+inTransit+'</small>':''}</article>`;
 }
 // DTH Bits
 html+=`<div class="sectionHeading">Bits DTH</div>`;
 for(const b of DTH_BITS){
  const owned=(s.toolInventory||[]).filter(t2=>t2.model===b.id&&t2.status!=='spent');
  const canInstall=drill&&!drill.installedBit&&owned.length>0;
  const installable=canInstall?owned.find(t2=>!canInstallDthTool(s,t2.id)):null;
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${b.label}</b><small>Vida: ${b.lifeTotal}m · ${b.rockSuit}</small>${owned.length?`<span class="itemStatus isInstalled">${owned.length} en stock</span>`:''}`;
  html+=`</div>`;
  if(installable){
   html+=`<button data-m4-action="installDthTool" data-tool="${installable.id}">${icon('arrow')} Instalar</button>`;
  }
  const inTransit=(s.orders||[]).filter(o=>['pending','dispatched'].includes(o.status)).flatMap(o=>o.items||[]).filter(i=>i.model===b.id).reduce((n,i)=>n+i.qty,0);
  html+=`<button data-m4-action="orderDthTool" data-model="${b.id}" data-type="bit" ${s.cash<b.price+200?'disabled':''}>${icon('store')} Solicitar · ${fmt(b.price)}</button>${inTransit?'<small>En camino: '+inTransit+'</small>':''}</article>`;
 }
 return html;
}

function renderDrillTruck(s,t,fmt,icon,cb){
 const truck=drillTruckInfo(s);
 let html=`<div class="m3Header">${icon('store')}<div><span class="eyebrow">DRILLTRUCK</span><h3>Camión de servicio</h3></div></div><figure class="drillTruckHero" data-drilltruck-asset><div class="drillTruckHeroStage" data-real-asset-loading>GENERANDO IMAGEN DEL MODELO 3D REAL…</div><figcaption><b>DRILLTRUCK</b><span>Vista del asset oficial · modelo del juego</span></figcaption></figure>`;
 if(!truck){
  const pendingTruck=(s.orders||[]).some(o=>['pending','dispatched'].includes(o.status)&&o.items?.some(i=>i.category==='machinery'&&i.type==='drillTruck'));
  const blocked=canPurchaseDrillTruck(s)||pendingTruck||s.cash<DRILLTRUCK_COST+200;
  const wsLvl=workshopLevel(s);
  const hasTecnico=hasRole(s,'tecnicoDrillco');
  const hasPkg=s.mission4?.parkingBuilt;
  html+=`<div class="bankCard"><div class="bankBrand">${icon('store')}<span>DRILLTRUCK</span></div><small>Camión autónomo de mantenimiento</small><b>Automatiza zonas de producción al 100%</b><div class="bankWallet"><span>Precio</span><strong>${fmt(DRILLTRUCK_COST)}</strong></div></div>`;
  html+=`<div class="sectionHeading">Requisitos</div>`;
  html+=`<div class="steps">`;
  const wsBuilding=workshopUpgradeJob(s);
  html+=`<div class="${wsLvl>=2?'done':wsBuilding?'active':''}"><span class="stepNumber">${wsLvl>=2?icon('check'):'01'}</span><span><b>Taller Nv.2</b>${wsBuilding?'<small>En construcción</small>':''}</span></div>`;
  html+=`<div class="${hasPkg?'done':''}"><span class="stepNumber">${hasPkg?icon('check'):'02'}</span><span><b>Estacionamiento</b></span></div>`;
  html+=`<div class="${hasTecnico?'done':''}"><span class="stepNumber">${hasTecnico?icon('check'):'03'}</span><span><b>Técnico DRILLCO®</b></span></div>`;
  html+=`</div>`;
  html+=`<div style="padding:0 16px 16px"><button class="startDrillBtn" data-m4-action="buyTruck" ${blocked?'disabled':''}>${icon('store')} ${pendingTruck?'DrillTruck en camino':'Solicitar DrillTruck'} · ${fmt(DRILLTRUCK_COST)} + despacho</button></div>`;
 }else{
  const stateLabels={parked:'Estacionado',dispatched:'En ruta',onsite:'En zona',maintenance:'Mantenimiento',returning:'Retornando'};
  const stateClass=truck.state==='parked'?'idle':truck.state==='maintenance'?'active':'moving';
  html+=`<div class="dcHead">${icon('store')}<div><b>DRILLTRUCK</b><small>Camión autónomo</small></div></div>`;
  html+=`<span class="dcState ${stateClass}">${esc(stateLabels[truck.state]||truck.state)}</span>`;
  const zones=s.mission4.zones||[];
  const producing=zones.filter(z=>z.status==='producing').length;
  html+=`<div class="dcGrid"><div class="dcStat"><small>Zonas</small><b>${zones.length}/${new Set([...(s.boreholes||[]).filter(b=>b.status==='completed').map(b=>b.id),...zones.map(z=>z.id)]).size}</b></div><div class="dcStat"><small>Produciendo</small><b>${producing}</b></div><div class="dcStat"><small>Ciclos</small><b>${s.mission4.productionCycles}</b></div><div class="dcStat" title="Ingreso bruto proyectado de las zonas DTH activas. Solo se acredita al finalizar un ciclo de 15 minutos."><small>Producción estimada/h</small><b>${fmt(incomePerHour(s))}</b></div></div>`;
  const mp=maintenanceProgress(s);
  if(mp){
   html+=`<div class="dcTool"><div class="dcToolHead"><small>${esc(mp.phaseLabel)}</small><b>${Math.round(mp.overallProgress*100)}%</b></div><div class="wearBar"><i style="width:${Math.round(mp.overallProgress*100)}%;background:var(--accent)"></i></div></div>`;
  }
  // Link truck to zone (zones that have DTH drill but no truck linked yet)
  if(truck.state==='parked'&&!truck.assignedZone){
   const linkable=zones.filter(z=>z.status==='idle'&&s.mission4.productionDrill?.assignedZone===z.id);
   if(linkable.length){
    html+=`<div class="sectionHeading">Vincular a zona</div>`;
    for(const zone of linkable){
     html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('geology')}</span><div><b>${zone.id}</b><small>Calidad: ${Math.round(zone.geologyQuality*100)}% · ${fmt(zoneIncomePerCycle(zone))}/ciclo</small></div><button data-m4-action="linkTruck" data-zone="${zone.id}">${icon('arrow')} Vincular</button></article>`;
    }
   }
  }
 }
 return html;
}

function renderZones(s,t,fmt,icon,cb){
 const zones=s.mission4?.zones||[];
 const convertable=convertableBoreholes(s);
 const drill=s.mission4?.productionDrill;
 let html=`<div class="m3Header">${icon('geology')}<div><span class="eyebrow">ZONAS</span><h3>Zonas de producción</h3></div></div>`;
 // Overview
 html+=`<div class="dcGrid"><div class="dcStat"><small>Convertidas</small><b>${zones.length}/${new Set([...(s.boreholes||[]).filter(b=>b.status==='completed').map(b=>b.id),...zones.map(z=>z.id)]).size}</b></div><div class="dcStat"><small>Produciendo</small><b>${zones.filter(z=>z.status==='producing').length}</b></div><div class="dcStat"><small>Ingresos</small><b>${fmt(s.mission4?.totalAutomatedIncome||0)}</b></div><div class="dcStat" title="Ingreso bruto proyectado de las zonas DTH activas. Solo se acredita al finalizar un ciclo de 15 minutos."><small>Producción estimada/h</small><b>${fmt(incomePerHour(s))}</b></div></div>`;
 html+=`<p class="m4OpsHint">Ingreso bruto proyectado de las zonas DTH activas, no rendimiento del DrillTruck. El dinero se acredita al finalizar cada ciclo de 15 minutos.</p>`;
 if(!zones.length&&!convertable.length){
  html+=`<div class="emptyState">${icon('geology')}<p>Completa sondajes en la Misión 2 para crear zonas de producción.</p></div>`;
  return html;
 }
 // Active zones
 if(zones.length){
  html+=`<div class="sectionHeading">Zonas activas<span>${zones.length}</span></div>`;
  for(const zone of zones){
   const statusLabels={idle:'Sin producción',producing:'Produciendo',maintenance:'En mantenimiento'};
   const statusClass=zone.status==='producing'?'active':zone.status==='maintenance'?'warning':'';
   const hasDrill=drill?.assignedZone===zone.id;
   const hasTruck=s.mission4?.drillTruck?.assignedZone===zone.id;
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('geology')}</span><div><b>${zone.id}</b><small>Calidad: ${Math.round(zone.geologyQuality*100)}% · ${zone.cycleCount} ciclos</small><small>${hasDrill?'🔧 DTH ':''}${hasTruck?'🚛 DrillTruck ':''}${!hasDrill&&!hasTruck?'Sin equipar':''}</small><span class="itemStatus ${statusClass}">${esc(statusLabels[zone.status]||zone.status)}</span></div></article>`;
  }
 }
 // Convertable boreholes
 if(convertable.length){
  html+=`<div class="sectionHeading">Sondajes completados<span>${convertable.length}</span></div>`;
  for(const bh of convertable){
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${bh.id}</b><small>${bh.depthDrilled}m perforados · Completado</small></div><button data-m4-action="convertZone" data-bh="${bh.id}">${icon('check')} Convertir</button></article>`;
  }
 }
 // Assign DTH drill to zone
 if(drill&&!drill.assignedZone&&zones.length>0){
  const unassigned=zones.filter(z=>z.status==='idle');
  if(unassigned.length){
   html+=`<div class="sectionHeading">Asignar perforadora DTH</div>`;
   for(const zone of unassigned){
    html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${zone.id}</b><small>Calidad: ${Math.round(zone.geologyQuality*100)}%</small></div><button data-m4-action="assignDthDrill" data-zone="${zone.id}" ${!dthDrillEquipped(s)?'disabled':''}>${icon('arrow')} Instalar DTH</button></article>`;
   }
  }
 }
 return html;
}
