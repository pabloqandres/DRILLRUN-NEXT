// Mission 4 — Phone/Computer app screens
// Renders M4 UI panels inside the existing PhoneUI system.
import {mission4Phase,mission4Objectives,mission4Objective} from './mission4-state.mjs';
import {canPurchaseDrillTruck,drillTruckInfo,DRILLTRUCK_COST} from './drilltruck.mjs';
import {DTH_DRILLS,DTH_HAMMERS,DTH_BITS,dthDrillDefinition,canPurchaseDthDrill,dthDrillEquipped,dthDrillAssigned,compatibleDthHammers,compatibleDthBits,canInstallDthTool} from './drills-dth.mjs';
import {convertableBoreholes,availableZones,zoneById} from './zones.mjs';
import {maintenanceProgress,MAINTENANCE_PHASES} from './maintenance.mjs';
import {zoneIncomePerCycle,incomePerHour,CYCLE_DURATION,totalAutomatedIncome} from './production.mjs';
import {canBuildParking} from './parking.mjs';
import {workshopLevel,canUpgradeWorkshop,workshopUpgradeJob,WORKSHOP_LEVELS} from '../mission3/inventory.mjs';
import {hasRole,canHire} from '../mission3/personnel.mjs';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const M4_APPS=['m4-objectives','m4-drilltruck','m4-zones','m4-dth-catalog'];

export function isM4App(app){return M4_APPS.includes(app);}

export function m4HomeApps(s,t,icon){
 if(!s.mission4||mission4Phase(s)==='inactive')return '';
 const apps=[];
 apps.push({id:'m4-objectives',icon:'location',label:'Misión',css:'m4-mission'});
 apps.push({id:'m4-zones',icon:'geology',label:'Zonas',css:'m4-zones'});
 apps.push({id:'m4-drilltruck',icon:'store',label:'DrillTruck',css:'m4-truck'});
 apps.push({id:'m4-dth-catalog',icon:'build',label:'DTH Supply',css:'m4-dth'});
 return apps.map(a=>`<button data-app="${a.id}"><span class="appTile app-${a.css}">${icon(a.icon)}</span><span>${esc(a.label)}</span></button>`).join('');
}

export function renderM4App(app,s,t,fmt,icon,callbacks){
 if(app==='m4-objectives')return renderM4Objectives(s,t,fmt,icon,callbacks);
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
 let html=`<div class="m3Header">${icon('location')}<div><span class="eyebrow">MISIÓN 3</span><h3>Automatiza tu operación</h3></div></div>`;
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

// DTH catalog — purchase drill, PUMA hammers, DTH bits
function renderDthCatalog(s,t,fmt,icon,cb){
 const m=s.mission4;
 const drill=m?.productionDrill;
 let html=`<div class="m3Header">${icon('build')}<div><span class="eyebrow">PRODUCCIÓN DTH</span><h3>Perforadora y herramientas</h3></div></div>`;
 // DTH Drill section
 html+=`<div class="sectionHeading">Perforadora DTH</div>`;
 if(!drill){
  const d=DTH_DRILLS[0];
  const blocked=canPurchaseDthDrill(s,d.id);
  html+=`<div class="bankCard"><div class="bankBrand">${icon('build')}<span>DTH PRODUCCIÓN</span></div><small>Perforadora Down The Hole para producción</small><b>Profundidad máx. ${d.maxDepth}m · ${d.bitDiameter}" Ø</b><div class="bankWallet"><span>Precio</span><strong>${fmt(d.price)}</strong></div></div>`;
  html+=`<div style="padding:0 16px 16px"><button class="startDrillBtn" data-m4-action="buyDthDrill" data-drill="${d.id}" ${blocked?'disabled':''}>${icon('store')} Comprar perforadora DTH · ${fmt(d.price)}</button></div>`;
 }else{
  const def=dthDrillDefinition(drill.id);
  const stateLabels={idle:'En taller',producing:'En producción',maintenance:'En mantenimiento'};
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${def?.labelKey||'Perforadora DTH'}</b><small>${stateLabels[drill.state]||drill.state} · ${def?.bitDiameter||8}" Ø</small><span class="itemStatus isInstalled">${icon('check')} Adquirida</span></div></article>`;
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
  html+=`<button data-m4-action="orderDthTool" data-model="${h.id}" data-type="hammer" ${s.cash<h.price?'disabled':''}>${icon('store')} ${fmt(h.price)}</button></article>`;
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
  html+=`<button data-m4-action="orderDthTool" data-model="${b.id}" data-type="bit" ${s.cash<b.price?'disabled':''}>${icon('store')} ${fmt(b.price)}</button></article>`;
 }
 return html;
}

function renderDrillTruck(s,t,fmt,icon,cb){
 const truck=drillTruckInfo(s);
 let html=`<div class="m3Header">${icon('store')}<div><span class="eyebrow">DRILLTRUCK</span><h3>Camión de servicio</h3></div></div>`;
 if(!truck){
  const blocked=canPurchaseDrillTruck(s);
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
  html+=`<div style="padding:0 16px 16px"><button class="startDrillBtn" data-m4-action="buyTruck" ${blocked?'disabled':''}>${icon('store')} Comprar DrillTruck · ${fmt(DRILLTRUCK_COST)}</button></div>`;
 }else{
  const stateLabels={parked:'Estacionado',dispatched:'En ruta',onsite:'En zona',maintenance:'Mantenimiento',returning:'Retornando'};
  const stateClass=truck.state==='parked'?'idle':truck.state==='maintenance'?'active':'moving';
  html+=`<div class="dcHead">${icon('store')}<div><b>DRILLTRUCK</b><small>Camión autónomo</small></div></div>`;
  html+=`<span class="dcState ${stateClass}">${esc(stateLabels[truck.state]||truck.state)}</span>`;
  const zones=s.mission4.zones||[];
  const producing=zones.filter(z=>z.status==='producing').length;
  html+=`<div class="dcGrid"><div class="dcStat"><small>Zonas</small><b>${zones.length}/6</b></div><div class="dcStat"><small>Produciendo</small><b>${producing}</b></div><div class="dcStat"><small>Ciclos</small><b>${s.mission4.productionCycles}</b></div><div class="dcStat"><small>$/hora</small><b>${fmt(incomePerHour(s))}</b></div></div>`;
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
 html+=`<div class="dcGrid"><div class="dcStat"><small>Convertidas</small><b>${zones.length}/6</b></div><div class="dcStat"><small>Produciendo</small><b>${zones.filter(z=>z.status==='producing').length}</b></div><div class="dcStat"><small>Ingresos</small><b>${fmt(s.mission4?.totalAutomatedIncome||0)}</b></div><div class="dcStat"><small>$/hora</small><b>${fmt(incomePerHour(s))}</b></div></div>`;
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
