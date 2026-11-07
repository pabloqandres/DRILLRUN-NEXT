// Mission 3 — Phone/Computer app screens
// Renders M3 UI panels inside the existing PhoneUI system.
import {ROLES,personnelRoster,canHire,hasRole} from './personnel.mjs';
import {CONTRACT_TEMPLATES,contractTemplate,canAcceptContract,contractProgress,contractDeadline,isContractComplete,startDrilling} from './contracts.mjs';
import {analysisProgress,analysisReport,requestAnalysis,accelerateAnalysis} from './geology.mjs';
import {DRILLS,HAMMERS,BITS,drillDefinition,compatibleHammers,compatibleBits,canPurchaseDrill} from './drills.mjs';
import {pendingOrders,deliveryProgress,allOrders,canPlaceOrder} from './headquarters.mjs';
import {inventorySummary,availableTools,workshopLevel,workshopCapacity,workshopUsed,workshopFree,canUpgradeWorkshop,workshopUpgradeJob,workshopUpgradeProgress,WORKSHOP_LEVELS} from './inventory.mjs';
import {toolCondition} from './wear.mjs';
import {mission3Phase,mission3Objectives,mission3Objective} from './mission3-state.mjs';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// M3 app IDs that the phone can navigate to
export const M3_APPS=['m3-personnel','m3-contract','m3-catalog','m3-geology','m3-inventory','m3-objectives','m3-orders'];

export function isM3App(app){return M3_APPS.includes(app);}

// Returns extra home-screen app buttons for M3
export function m3HomeApps(s,t,icon){
 if(!s.mission3||mission3Phase(s)==='inactive')return '';
 const phase=mission3Phase(s);
 const L={es:{mission:'Misión',personnel:'Personal',contract:'Contrato',geology:'Geología',workshop:'Taller',catalog:'Casa Matriz'},en:{mission:'Mission',personnel:'Personnel',contract:'Contract',geology:'Geology',workshop:'Workshop',catalog:'HQ Supply'}};
 const l=L[s.lang]||L.es,apps=[];
 apps.push({id:'m3-objectives',icon:'location',label:l.mission,css:'m3-mission'});
 apps.push({id:'m3-personnel',icon:'player',label:l.personnel,css:'m3-personnel'});
 apps.push({id:'m3-contract',icon:'build',label:l.contract,css:'m3-contract'});
 apps.push({id:'m3-geology',icon:'geology',label:l.geology,css:'m3-geology'});
 apps.push({id:'m3-inventory',icon:'inventory',label:l.workshop,css:'m3-workshop'});
 apps.push({id:'m3-catalog',icon:'store',label:l.catalog,css:'m3-catalog'});
 const orderCount=(s.orders||[]).filter(o=>o.status==='dispatched').length;
 const orderLabel=s.lang==='en'?'Orders':'Pedidos';
 apps.push({id:'m3-orders',icon:'build',label:orderLabel,css:'m3-orders',badge:orderCount||null});
 return apps.map(a=>`<button data-app="${a.id}"><span class="appTile app-${a.css}">${icon(a.icon)}${a.badge?`<i class="appBadge">${a.badge}</i>`:''}</span><span>${esc(a.label)}</span></button>`).join('');
}

// Render an M3 app screen. Returns HTML string.
export function renderM3App(app,s,t,fmt,icon,callbacks){
 if(app==='m3-personnel')return renderPersonnel(s,t,fmt,icon,callbacks);
 if(app==='m3-contract')return renderContract(s,t,fmt,icon,callbacks);
 if(app==='m3-catalog')return renderCatalog(s,t,fmt,icon,callbacks);
 if(app==='m3-geology'){if(s.geoAnalysis?.completed&&s.mission3&&!s.mission3.reportRead){s.mission3.reportRead=true;}return renderGeology(s,t,fmt,icon,callbacks);}
 if(app==='m3-inventory')return renderInventory(s,t,fmt,icon,callbacks);
 if(app==='m3-objectives')return renderM3Objectives(s,t,fmt,icon,callbacks);
 if(app==='m3-orders')return renderOrders(s,t,fmt,icon,callbacks);
 return '';
}

function renderPersonnel(s,t,fmt,icon,cb){
 const roster=personnelRoster(s);
 const roleNames={hsec:'Prevencionista HSEC',admin:'Administrador',driller:'Operador Perforadora',helper:'Ayudante',techVisit:'Técnico DRILLCO®'};
 const stateNames={idle:'Disponible',working:'Trabajando',field:'En terreno',operating:'Operando',resting:'Descansando'};
 let html=`<div class="m3Header">${icon('player')}<div><span class="eyebrow">PERSONAL</span><h3>Equipo de trabajo</h3></div></div>`;
 if(roster.length){
  html+=`<div class="sectionHeading">Equipo activo<span>${roster.length}</span></div>`;
  for(const p of roster){
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('player')}</span><div><b>${esc(roleNames[p.role]||p.role)}</b><small>Nivel ${p.level} · ${esc(stateNames[p.state]||p.state)}</small><span class="itemStatus">${icon('check')} Contratado</span></div></article>`;
  }
 }else{
  html+=`<div class="emptyState">${icon('player')}<p>No tienes personal contratado aún.</p></div>`;
 }
 // Hire buttons
 html+=`<div class="sectionHeading">Contratar</div>`;
 for(const role of ROLES.filter(r=>!r.temporary)){
  const blocked=canHire(s,role.id);
  const current=roster.filter(p=>p.role===role.id).length;
  if(current>=role.limit)continue;
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('player')}</span><div><b>${esc(roleNames[role.id]||role.id)}</b><small>${role.hireCost>0?fmt(role.hireCost):'Gratuito'} · Límite: ${role.limit}</small>${blocked?`<span class="itemStatus">${icon('lock')} ${esc(blocked)}</span>`:''}</div><button data-hire="${role.id}" ${blocked?'disabled':''}>${icon('store')}<span>Contratar</span></button></article>`;
 }
 return html;
}

function renderContract(s,t,fmt,icon,cb){
 const cp=contractProgress(s);
 let html=`<div class="m3Header">${icon('build')}<div><span class="eyebrow">CONTRATO</span><h3>Tu Primer Contrato</h3></div></div>`;
 if(!s.contract){
  const tpl=CONTRACT_TEMPLATES[0];
  const blocked=canAcceptContract(s,tpl.id);
  html+=`<div class="bankCard"><div class="bankBrand">${icon('build')}<span>EXPLORACIÓN</span></div><small>Contrato de exploración geológica</small><b>180 metros · 6 sondajes</b><div class="bankWallet"><span>Recompensa</span><strong>${fmt(tpl.reward)}</strong></div></div>`;
  html+=`<div class="sectionHeading">Requisitos</div>`;
  html+=`<div class="steps"><div class="${hasRole(s,'admin')?'done':''}"><span class="stepNumber">${hasRole(s,'admin')?icon('check'):'01'}</span><span><b>Administrador contratado</b></span></div>`;
  html+=`<div class="${s.geoAnalysis?.completed?'done':''}"><span class="stepNumber">${s.geoAnalysis?.completed?icon('check'):'02'}</span><span><b>Análisis geológico completado</b></span></div>`;
  html+=`<div class="${s.drill?'done':''}"><span class="stepNumber">${s.drill?icon('check'):'03'}</span><span><b>Perforadora adquirida</b></span></div></div>`;
  html+=`<div class="productBuy"><strong>${fmt(tpl.reward)} recompensa</strong><button class="primary" data-accept-contract="${tpl.id}" ${blocked?'disabled':''}>${icon('check')} Aceptar contrato</button></div>`;
  if(blocked)html+=`<small class="productRequirement">${icon('lock')} ${esc(blocked)}</small>`;
 }else if(s.contract.status==='accepted'){
  // Contract accepted but drilling not started yet
  const hasDriller=hasRole(s,'driller');
  const hasBit=!!s.drill?.installedBit;
  const hasHammer=!!s.drill?.installedHammer;
  const canStart=hasDriller&&s.drill&&hasBit&&hasHammer;
  html+=`<div class="bankCard"><div class="bankBrand">${icon('build')}<span>CONTRATO ACEPTADO</span></div><small>Preparando perforación</small><b>0 / ${s.contract.totalMeters} m</b></div>`;
  html+=`<div class="sectionHeading">Checklist de inicio</div>`;
  html+=`<div class="steps">`;
  html+=`<div class="${s.drill?'done':''}"><span class="stepNumber">${s.drill?icon('check'):'01'}</span><span><b>Perforadora lista</b></span></div>`;
  html+=`<div class="${hasHammer?'done':''}"><span class="stepNumber">${hasHammer?icon('check'):'02'}</span><span><b>Martillo instalado</b></span></div>`;
  html+=`<div class="${hasBit?'done':''}"><span class="stepNumber">${hasBit?icon('check'):'03'}</span><span><b>Bit instalado</b></span></div>`;
  html+=`<div class="${hasDriller?'done':''}"><span class="stepNumber">${hasDriller?icon('check'):'04'}</span><span><b>Operador contratado</b></span></div>`;
  html+=`</div>`;
  html+=`<div style="padding:12px 0"><button class="startDrillBtn" data-start-drilling ${canStart?'':'disabled'}>${icon('drill')||icon('build')} Iniciar perforación</button></div>`;
  if(!canStart)html+=`<small class="productRequirement">${icon('lock')} Completa los requisitos para iniciar</small>`;
 }else{
  const pct=cp?Math.round(cp.progress*100):0;
  const deadline=contractDeadline(s);
  const timeLeft=deadline?Math.max(0,Math.ceil((deadline-Date.now())/60000)):null;
  html+=`<div class="bankCard"><div class="bankBrand">${icon('build')}<span>PERFORACIÓN ACTIVA</span></div><small>Progreso de perforación</small><b>${Math.round(s.contract.metersCompleted)} / ${s.contract.totalMeters} m</b><div class="bankWallet"><span>Sondajes</span><strong>${cp?.boreholesDone||0} / ${cp?.totalBoreholes||6}</strong></div></div>`;
  html+=`<div style="background:var(--surface);border-radius:8px;padding:12px;margin:8px 0"><div style="height:8px;border-radius:4px;background:var(--border)"><div style="height:100%;border-radius:4px;background:var(--accent);width:${pct}%;transition:width .3s"></div></div><small style="display:flex;justify-content:space-between;margin-top:4px"><span>${pct}%</span>${timeLeft!==null?`<span>${timeLeft} min restantes</span>`:''}</small></div>`;
  // Boreholes detail
  if(s.boreholes?.length){
   html+=`<div class="sectionHeading">Sondajes</div>`;
   for(const bh of s.boreholes){
    const bhPct=bh.depthTarget>0?Math.round((bh.depthDrilled/bh.depthTarget)*100):0;
    const statusIcon=bh.status==='completed'?icon('check'):bh.status==='active'?'⛏':'○';
    html+=`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><span style="width:20px;text-align:center">${statusIcon}</span><span style="flex:1"><b>${bh.id}</b><small> · ${Math.round(bh.depthDrilled)}/${bh.depthTarget}m</small></span><span style="font-size:.8em;opacity:.7">${bhPct}%</span></div>`;
   }
  }
  if(isContractComplete(s)&&s.contract.status==='active'){
   html+=`<div style="padding:14px 0"><button class="startDrillBtn" style="background:linear-gradient(135deg,#4caf50,#2e7d32)" data-complete-contract>${icon('check')} Entregar contrato</button></div>`;
  }
 }
 return html;
}

function renderCatalog(s,t,fmt,icon,cb){
 const free=workshopFree(s),cap=workshopCapacity(s),used=workshopUsed(s);
 let html=`<div class="m3Header">${icon('store')}<div><span class="eyebrow">CASA MATRIZ</span><h3>Solicitud de equipos</h3></div><span class="storeWallet">${icon('wallet')}${fmt(s.cash)}</span></div>`;
 html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:${free<2?'#ef535022':'#0e2a4044'};border:1px solid ${free<2?'#ef535066':'#5ab8e822'};border-radius:8px;margin-bottom:10px;font-size:10px"><span style="color:${free<2?'#ef5350':'#9ec5dd'}">${icon('store')} Taller: ${used}/${cap} ocupado</span><b style="color:${free<2?'#ef5350':'#fff'}">${free} libres</b></div>`;
 // Drills section
 html+=`<div class="sectionHeading">Perforadoras RC</div>`;
 if(s.drill){
  const d=drillDefinition(s.drill.id);
  html+=`<article class="inventoryCard"><span class="inventoryIcon rigPreview" data-rc-rig="${esc(s.drill.id)}">${icon('machine')}</span><div><b>${esc(d?.labelKey||s.drill.id)}</b><small>Estado: ${s.drill.state}</small><span class="itemStatus isInstalled">${icon('check')} Adquirida</span></div></article>`;
 }else{
  for(const d of DRILLS){
   const blocked=canPurchaseDrill(s,d.id);
   html+=`<article class="inventoryCard"><span class="inventoryIcon rigPreview" data-rc-rig="${esc(d.id)}">${icon('machine')}</span><div><b>${esc(d.labelKey)}</b><small>Prof. máx: ${d.maxDepth}m · ${fmt(d.price)}</small><small>Martillos: ${d.compatibleHammers.join(', ')}</small>${blocked&&blocked!=='drillOwned'?`<span class="itemStatus">${icon('lock')} ${esc(blocked)}</span>`:''}</div><button data-buy-drill="${d.id}" ${blocked?'disabled':''}>${icon('store')}<span>${fmt(d.price)}</span></button></article>`;
  }
 }
 // Hammers section
 html+=`<div class="sectionHeading">Martillos EXPLORA®</div>`;
 const drill=s.drill?drillDefinition(s.drill.id):null;
 for(const h of HAMMERS){
  const compat=drill?drill.compatibleHammers.includes(h.id):true;
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${esc(h.nameKey)}</b><small>Ø${h.diameter}" · Vida: ${h.lifeTotal}m · ${fmt(h.price)}</small>${!compat?`<span class="itemStatus">${icon('lock')} Incompatible</span>`:''}</div><button data-add-cart="hammer:${h.id}:${h.price}" ${!compat||!s.drill?'disabled':''}>${icon('store')}<span>${fmt(h.price)}</span></button></article>`;
 }
 // Bits section
 html+=`<div class="sectionHeading">Bits DTH</div>`;
 for(const b of BITS){
  const compat=drill?drill.compatibleBits.includes(b.id):true;
  html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${esc(b.nameKey)}</b><small>Ø${b.diameter}" · ${b.type} · Vida: ${b.lifeTotal}m · ${fmt(b.price)}</small>${!compat?`<span class="itemStatus">${icon('lock')} Incompatible</span>`:''}</div><button data-add-cart="bit:${b.id}:${b.price}" ${!compat||!s.drill?'disabled':''}>${icon('store')}<span>${fmt(b.price)}</span></button></article>`;
 }
 // Pending orders
 const pending=pendingOrders(s);
 if(pending.length){
  html+=`<div class="sectionHeading">Pedidos en tránsito<span>${pending.length}</span></div>`;
  for(const o of pending){
   const pct=Math.round(deliveryProgress(o)*100);
   const itemNames=o.items.map(i=>i.model||i.type).join(', ');
   const eta=o.dispatchDuration?Math.max(0,Math.ceil((o.dispatchDuration-((Date.now()-o.dispatchedAt)/1000))/60)):0;
   html+=`<div class="orderCard"><small>${icon('store')} ${esc(itemNames)}</small><div class="orderBar"><i style="width:${pct}%"></i></div><div class="orderPct"><span>${pct}% completado</span><span>${eta>0?eta+' min':'Llegando...'}</span></div></div>`;
  }
 }
 return html;
}

function renderGeology(s,t,fmt,icon,cb){
 let html=`<div class="m3Header">${icon('geology')||icon('location')}<div><span class="eyebrow">GEOLOGÍA</span><h3>Informe geológico</h3></div></div>`;
 if(!s.geoAnalysis?.requested){
  html+=`<div class="emptyState">${icon('location')}<p>Solicita un análisis geológico para conocer el terreno antes de perforar.</p><button class="primary" data-request-geo>${icon('store')} Solicitar análisis (${fmt(500)})</button></div>`;
 }else if(!s.geoAnalysis.completed){
  const pct=Math.round(analysisProgress(s)*100);
  html+=`<div class="bankCard"><div class="bankBrand">${icon('location')}<span>ANÁLISIS EN CURSO</span></div><small>El técnico DRILLCO® está procesando las muestras</small><b>${pct}%</b></div>`;
  html+=`<div style="background:var(--surface);border-radius:8px;padding:12px;margin:8px 0"><div style="height:8px;border-radius:4px;background:var(--border)"><div style="height:100%;border-radius:4px;background:var(--accent);width:${pct}%;transition:width .3s"></div></div></div>`;
  if(s.knowledgeAccelerators>0&&!s.geoAnalysis.accelerated){
   html+=`<button class="primary" data-accelerate-geo>${icon('build')} Usar acelerador de conocimiento (${s.knowledgeAccelerators} disponible)</button>`;
  }
 }else{
  const report=analysisReport(s);
  html+=`<div class="bankCard"><div class="bankBrand">${icon('check')}<span>INFORME COMPLETADO</span></div><small>${esc(report?.sector||'')}</small><b>Informe disponible</b></div>`;
  html+=`<p style="padding:8px;font-size:.85em;opacity:.8">${esc(report?.generalDescription||'')}</p>`;
  if(report?.analyses?.length){
   html+=`<div class="sectionHeading">Columnas litológicas</div>`;
   for(const a of report.analyses){
    html+=`<div style="background:var(--surface);border-radius:8px;padding:10px;margin:4px 0"><b>${a.boreholeId}</b><small> · (${a.siteX}, ${a.siteZ}) · ${a.depth}m</small>`;
    for(const layer of a.layers){
     const w=((layer.to-layer.from)/a.depth*100).toFixed(0);
     const color='#'+layer.color?.toString(16).padStart(6,'0')||'888';
     html+=`<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><div style="width:24px;height:16px;border-radius:3px;background:${color}"></div><span style="font-size:.8em">${layer.from}-${layer.to}m · ${esc(layer.rock)} · Dureza ${layer.hardness} · ${esc(layer.abrasivity)}</span></div>`;
    }
    html+=`</div>`;
   }
  }
  if(report?.recommendation){
   html+=`<div style="background:var(--accent-bg,#2a3040);border-radius:8px;padding:10px;margin:8px 0;font-size:.85em"><b>Recomendación:</b> ${esc(report.recommendation)}</div>`;
  }
 }
 return html;
}

function renderInventory(s,t,fmt,icon,cb){
 const summary=inventorySummary(s);
 const lvl=workshopLevel(s),cap=workshopCapacity(s),used=workshopUsed(s),free=workshopFree(s);
 const lvlDef=WORKSHOP_LEVELS.find(w=>w.level===lvl)||WORKSHOP_LEVELS[0];
 const nextLvl=WORKSHOP_LEVELS.find(w=>w.level===lvl+1);
 const capPct=cap>0?Math.round(used/cap*100):0;
 let html=`<div class="m3Header">${icon('inventory')}<div><span class="eyebrow">TALLER · Nv.${lvl}</span><h3>Inventario de herramientas</h3></div></div>`;
 // Capacity bar
 html+=`<div class="workshopCap"><div class="workshopCapHead"><span>${icon('store')} Capacidad</span><b>${used} / ${cap}</b></div><div class="workshopCapBar"><i style="width:${capPct}%;background:${capPct>85?'linear-gradient(90deg,#ef5350,#c62828)':capPct>60?'linear-gradient(90deg,#ffb74d,#f57c00)':'linear-gradient(90deg,#4caf50,#388e3c)'}"></i></div><small>${free} espacios libres</small></div>`;
 // Upgrade option
 const wsJob=workshopUpgradeJob(s);
 if(wsJob){
  const buildPct=Math.round((workshopUpgradeProgress(s)||0)*100);
  const remaining=Math.max(0,Math.ceil((wsJob.ends-Date.now())/1000));
  const mm=Math.floor(remaining/60),ss=remaining%60;
  html+=`<div class="workshopUpgrade building"><div><b>Ampliación a Nv.${wsJob.targetLevel} en curso</b><small>${buildPct}% — ${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')} restante</small></div><div class="workshopCapBar"><i style="width:${buildPct}%;background:linear-gradient(90deg,#64b5f6,#42a5f5)"></i></div></div>`;
 }else if(nextLvl){
  const canUp=canUpgradeWorkshop(s)===null;
  html+=`<div class="workshopUpgrade"><div><b>Ampliar a Nv.${nextLvl.level} · ${nextLvl.label}</b><small>Capacidad: ${nextLvl.capacity} slots · ${String(Math.floor(nextLvl.constructionSeconds/60)).padStart(2,'0')}:${String(nextLvl.constructionSeconds%60).padStart(2,'0')}</small></div><button class="upgradeWorkshopBtn" data-upgrade-workshop ${canUp?'':'disabled'}>${fmt(nextLvl.upgradeCost)}</button></div>`;
 }else{
  html+=`<div class="workshopUpgrade done"><b>Nivel máximo alcanzado</b><small>Capacidad industrial · ${cap} slots</small></div>`;
 }
 // Installed tools
 if(s.drill){
  html+=`<div class="sectionHeading">Herramientas instaladas</div>`;
  const bitId=s.drill.installedBit,hammerId=s.drill.installedHammer;
  const bit=bitId?(s.toolInventory||[]).find(t=>t.id===bitId):null;
  const hammer=hammerId?(s.toolInventory||[]).find(t=>t.id===hammerId):null;
  if(hammer){
   const cond=Math.round(toolCondition(hammer));
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>Martillo: ${esc(hammer.model)}</b><small>Vida: ${cond}% · ${Math.round(hammer.lifeRemaining)}/${hammer.lifeTotal}m</small><div style="height:4px;border-radius:2px;background:var(--border);margin-top:4px"><div style="height:100%;border-radius:2px;background:${cond>30?'var(--accent)':'#e44'};width:${cond}%"></div></div></div></article>`;
  }else html+=`<div style="padding:8px;opacity:.6">Sin martillo instalado</div>`;
  if(bit){
   const cond=Math.round(toolCondition(bit));
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>Bit: ${esc(bit.model)}</b><small>Vida: ${cond}% · ${Math.round(bit.lifeRemaining)}/${bit.lifeTotal}m</small><div style="height:4px;border-radius:2px;background:var(--border);margin-top:4px"><div style="height:100%;border-radius:2px;background:${cond>30?'var(--accent)':'#e44'};width:${cond}%"></div></div></div></article>`;
  }else html+=`<div style="padding:8px;opacity:.6">Sin bit instalado</div>`;
 }
 // Stock summary
 html+=`<div class="sectionHeading">Stock disponible</div>`;
 const toolsByModel={};
 for(const tool of(s.toolInventory||[]).filter(t=>t.status==='new'||t.status==='worn')){
  toolsByModel[tool.model]=(toolsByModel[tool.model]||0)+1;
 }
 if(Object.keys(toolsByModel).length){
  for(const [model,qty] of Object.entries(toolsByModel)){
   html+=`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)"><span>${esc(model)}</span><b>×${qty}</b></div>`;
  }
 }else{
  html+=`<div style="padding:8px;opacity:.6">Sin herramientas en stock. Solicita desde Casa Matriz.</div>`;
 }
 // Install buttons for available tools
 const availBits=availableTools(s,'bit');
 const availHammers=availableTools(s,'hammer');
 if(s.drill&&(availBits.length||availHammers.length)){
  html+=`<div class="sectionHeading">Instalar herramientas</div>`;
  for(const tool of[...availHammers,...availBits]){
   if(tool.id===s.drill.installedBit||tool.id===s.drill.installedHammer)continue;
   const cond=Math.round(toolCondition(tool));
   html+=`<article class="inventoryCard"><span class="inventoryIcon">${icon('build')}</span><div><b>${esc(tool.model)}</b><small>${tool.type} · ${cond}% vida</small></div><button data-install-tool="${tool.id}">${icon('arrow')}<span>Instalar</span></button></article>`;
  }
 }
 // Spent materials
 if(s.spentMaterials?.length){
  html+=`<div class="sectionHeading">Materiales usados<span>${s.spentMaterials.length}</span></div>`;
  for(const m of s.spentMaterials){
   html+=`<div style="display:flex;justify-content:space-between;padding:4px 0;opacity:.6;font-size:.85em"><span>${esc(m.model)} (${m.type})</span><small>${m.metersUsed}m perforados</small></div>`;
  }
 }
 return html;
}

function renderM3Objectives(s,t,fmt,icon,cb){
 const phase=mission3Phase(s);
 const objs=mission3Objectives(s);
 const phaseNames={briefing:'Briefing Inicial',setup:'Preparación',survey:'Estudio Geológico',equip:'Equipamiento',drilling:'Perforación Activa',delivery:'Entrega Final',complete:'¡Misión Completa!'};
 const phaseIcons={briefing:'messages',setup:'build',survey:'location',equip:'inventory',drilling:'drill',delivery:'check',complete:'check'};
 const objNames={prepareCompany:'Preparar la empresa',knowTerrain:'Conocer el terreno',equipOperation:'Equipar la operación',executeExploration:'Ejecutar exploración',deliverContract:'Entregar contrato'};
 const checkNames={workshopReady:'Taller operativo',hireAdmin:'Administrador contratado',requestAnalysis:'Solicitar análisis geológico',waitForReport:'Esperar informe',reviewReport:'Revisar informe',purchaseDrill:'Adquirir perforadora',hireDriller:'Contratar operador',orderTools:'Ordenar herramientas',receiveDelivery:'Recibir pedido',startDrilling:'Iniciar perforación',complete6Boreholes:'Completar 6 sondajes',validateMeters:'Validar metraje',submitContract:'Entregar al cliente'};

 // Total progress
 const totalChecks=objs.reduce((n,o)=>n+o.checks.length,0);
 const doneChecks=objs.reduce((n,o)=>n+o.checks.filter(c=>c.done).length,0);
 const totalPct=totalChecks?Math.round(doneChecks/totalChecks*100):0;

 // Contract stats
 const cp=contractProgress(s);
 const meters=s.contract?Math.round(s.contract.metersCompleted):0;
 const totalMeters=s.contract?s.contract.totalMeters:180;

 let html=`<div class="missionHeading"><span class="eyebrow">MISIÓN 3 · TU PRIMER CONTRATO</span><h3 style="font-size:22px;margin:6px 0 0">Exploración RC</h3><p style="font-size:10px;color:#a8b8b8;margin-top:6px">Completa 180 metros de perforación en 6 sondajes de exploración geológica.</p></div>`;

 // Phase badge + progress ring
 html+=`<div style="display:flex;gap:14px;align-items:center;padding:14px;background:linear-gradient(135deg,#2a5040,#1e3a30);border-radius:14px;border:1px solid #4a826a55;margin-bottom:14px">`;
 html+=`<div style="position:relative;width:56px;height:56px;flex-shrink:0"><svg viewBox="0 0 36 36" style="width:56px;height:56px;transform:rotate(-90deg)"><circle cx="18" cy="18" r="16" fill="none" stroke="#ffffff15" stroke-width="2.5"/><circle cx="18" cy="18" r="16" fill="none" stroke="#67dfd0" stroke-width="2.5" stroke-dasharray="${totalPct} ${100-totalPct}" stroke-linecap="round"/></svg><span style="position:absolute;inset:0;display:grid;place-items:center;font-size:13px;font-weight:800;color:#67dfd0">${totalPct}%</span></div>`;
 html+=`<div style="flex:1"><span style="font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#67dfd0;font-weight:700">FASE ACTUAL</span><b style="display:block;font-size:15px;margin-top:3px">${esc(phaseNames[phase]||phase)}</b>`;
 if(s.contract)html+=`<small style="font-size:9px;color:#a8c8b8;margin-top:2px;display:block">${meters} / ${totalMeters} metros perforados</small>`;
 html+=`</div>${icon(phaseIcons[phase]||'location')}</div>`;

 // Progress bar
 html+=`<div style="height:6px;border-radius:3px;background:#ffffff12;margin-bottom:16px;overflow:hidden"><div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#67dfd0,#4ab89e);width:${totalPct}%;transition:width .4s"></div></div>`;

 // Objectives as steps
 html+=`<div class="steps">`;
 for(let i=0;i<objs.length;i++){
  const obj=objs[i];
  const allDone=obj.checks.every(c=>c.done);
  const someStarted=obj.checks.some(c=>c.done);
  const isActive=!allDone&&someStarted;
  const firstUndone=!allDone&&!someStarted&&(i===0||objs[i-1].checks.every(c=>c.done));
  html+=`<div class="${allDone?'done':isActive||firstUndone?'active':''}">`;
  html+=`<span class="stepNumber">${allDone?icon('check'):String(i+1).padStart(2,'0')}</span>`;
  html+=`<span style="flex:1"><b>${esc(objNames[obj.nameKey]||obj.nameKey)}</b>`;
  for(const check of obj.checks){
   const name=checkNames[check.labelKey]||check.labelKey;
   const hasProg=check.progress!==undefined&&!check.done&&check.progress>0;
   html+=`<small style="display:flex;align-items:center;gap:5px;margin:4px 0">`;
   if(check.done)html+=`<span style="color:var(--mint)">${icon('check')}</span>`;
   else html+=`<span style="width:14px;height:14px;border-radius:50%;border:1.5px solid ${isActive||firstUndone?'#e7c886':'#ffffff30'};display:inline-block;flex-shrink:0"></span>`;
   html+=`<span style="${check.done?'text-decoration:line-through;opacity:.5':''}">${esc(name)}</span>`;
   if(hasProg)html+=`<span style="margin-left:auto;font-size:8px;color:#67dfd0;font-weight:700">${Math.round(check.progress*100)}%</span>`;
   html+=`</small>`;
  }
  html+=`</span></div>`;
 }
 html+=`</div>`;

 // Reward preview
 html+=`<div style="margin-top:16px;padding:14px;background:#ffffff06;border:1px solid #e7c88630;border-radius:12px;display:flex;align-items:center;gap:12px">`;
 html+=`<div style="width:40px;height:40px;border-radius:12px;background:radial-gradient(circle,#b6843b44,#77562d11);border:1px solid #e1bb7340;display:grid;place-items:center">${icon('wallet')}</div>`;
 html+=`<div><span style="font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#e7c886;font-weight:700">RECOMPENSA</span><b style="display:block;font-size:16px;color:var(--gold);margin-top:2px">${fmt(s.contract?.reward||60000)}</b></div>`;
 html+=`</div>`;

 return html;
}

function renderOrders(s,t,fmt,icon,cb){
 const orders=allOrders(s);
 const statusLabels={pending:'Solicitado',dispatched:'En tránsito',delivered:'Entregado'};
 const typeLabels={hammer:'Martillo',bit:'Bit',drill:'Perforadora RC',dthDrill:'Perforadora DTH',drillTruck:'DrillTruck'};
 let html=`<div class="m3Header">${icon('build')}<div><span class="eyebrow">MIS PEDIDOS</span><h3>Seguimiento de pedidos</h3></div></div>`;
 const active=orders.filter(o=>o.status==='dispatched');
 const completed=orders.filter(o=>o.status==='delivered').reverse();
 if(!orders.length){
  html+=`<div class="emptyState">${icon('build')}<p>No tienes pedidos aún. Compra desde el Catálogo o Casa Matriz.</p></div>`;
  return html;
 }
 if(active.length){
  html+=`<div class="sectionHeading">En tránsito<span>${active.length}</span></div>`;
  for(const o of active){
   const pct=Math.round(deliveryProgress(o)*100);
   const eta=o.dispatchDuration?Math.max(0,Math.ceil((o.dispatchDuration-((Date.now()-o.dispatchedAt)/1000))/60)):0;
   const items=o.items.map(i=>typeLabels[i.type]||i.model).join(', ');
   html+=`<div class="orderCard" style="background:var(--surface);border-radius:12px;padding:12px;margin:6px 0;border:1px solid var(--border)">`;
   html+=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:11px;font-weight:700">${esc(items)}</span><span style="font-size:9px;color:var(--accent)">${esc(statusLabels[o.status])}</span></div>`;
   html+=`<div style="height:6px;border-radius:3px;background:var(--border);overflow:hidden"><div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#64b5f6,#42a5f5);width:${pct}%;transition:width .3s"></div></div>`;
   html+=`<div style="display:flex;justify-content:space-between;font-size:9px;margin-top:4px;opacity:.7"><span>${pct}%</span><span>${eta>0?eta+' min':'Llegando...'}</span></div>`;
   html+=`<small style="display:block;margin-top:4px;font-size:9px;opacity:.5">Total: ${fmt(o.totalCost)} (envío: ${fmt(o.deliveryFee)})</small>`;
   html+=`</div>`;
  }
 }
 if(completed.length){
  html+=`<div class="sectionHeading">Completados<span>${completed.length}</span></div>`;
  for(const o of completed.slice(0,10)){
   const items=o.items.map(i=>typeLabels[i.type]||i.model).join(', ');
   const date=new Date(o.deliveredAt||o.orderedAt);
   const isMachinery=o.items.some(i=>i.category==='machinery');
   html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">`;
   html+=`<span style="flex:1"><b style="font-size:11px">${esc(items)}</b><small style="display:block;font-size:9px;opacity:.6">${date.toLocaleTimeString(s.lang,{hour:'2-digit',minute:'2-digit'})} · ${fmt(o.totalCost)}</small></span>`;
   html+=`<span style="color:var(--mint);font-size:10px">${icon('check')} Entregado</span>`;
   if(isMachinery){
    const machItem=o.items.find(i=>i.category==='machinery');
    html+=`<button data-locate-machinery="${machItem?.type||''}" style="margin-left:8px;font-size:9px;padding:4px 8px">${icon('location')} Localizar</button>`;
   }
   html+=`</div>`;
  }
 }
 return html;
}
