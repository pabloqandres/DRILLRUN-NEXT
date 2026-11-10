// M5 · Read-only mission presentation. Buying happens only in the
// explicit Catalog confirmation, never while rendering an app.
import {PATIO_L1,PATIO_FUTURE,patioState,patioProgress,patioCapacity,patioUnlocked} from './patio-state.mjs';
import {fleetOccupancy} from './fleet-base.mjs';
import {hiredPatioStaff,gateChecked,warehouseChecked} from './patio-staff.mjs';
import {mission5Readout} from './mission-readout.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const clock=secs=>String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');
export function renderPatioApp(s,fmt,icon,now=Date.now()){
 const status=patioState(s),unlocked=patioUnlocked(s),info=patioProgress(s,now);
 const caption=status==='operational'?(s.mission5?.commissionedAt?'PATIO HABILITADO · CONTROL COMPLETO':'PATIO CONSTRUIDO · PUESTA EN SERVICIO PENDIENTE'):status==='building'?'OBRA EN EJECUCIÓN':unlocked?'LISTO PARA CONSTRUIR':'BLOQUEADO · COMPLETA M4';
 const readout=mission5Readout(s,now);
 let html=`<div class="m3Header"><span class="inventoryIcon">${icon('build')}</span><div><span class="eyebrow">MISIÓN 5 · EXPANSIÓN DE FAENA</span><h3>Patio de Maquinarias L1</h3></div></div>`;
 html+=`<section class="m4OpsSummary"><b>${esc(caption)}</b><p>Complejo fijo de ${PATIO_L1.width} × ${PATIO_L1.depth} unidades de juego. Acceso único, techumbre solo para camionetas y DrillTruck®, explanadas abiertas para RC, DTH y futuros CAEX menores.</p></section>`;
 html+=`<div class="dcGrid"><div class="dcStat"><small>Construcción</small><b>${status==='operational'?'100%':Math.round(info.progress*100)+'%'}</b></div><div class="dcStat"><small>Tiempo restante</small><b>${status==='building'?clock(info.remainingSeconds):status==='operational'?'—':'20:00'}</b></div><div class="dcStat"><small>Inversión L1</small><b>🪙 ${fmt(PATIO_L1.price)}</b></div><div class="dcStat"><small>HSEC</small><b>${status==='operational'?'Aprobado':'Pendiente'}</b></div></div>`;
 if(status==='building')html+=`<section class="m4OpsNext"><small>CONSTRUCCIÓN · ${esc(info.label||'Montaje')}</small><div class="m4OpsBar"><i style="width:${Math.round(info.progress*100)}%"></i></div><b>${clock(info.remainingSeconds)} restantes</b><p>El contador continúa con tiempo real aunque cierres el juego.</p></section>`;
 html+='<div class="sectionHeading">Paquete modular incluido</div>';
 for(const id of PATIO_L1.modules)html+=`<section class="m4OpsNext"><small>MÓDULO PREDEFINIDO</small><b>${esc(id)}</b></section>`;
 const capacity=patioCapacity(s),fleet=fleetOccupancy(s);
 const occupied=items=>items.filter(e=>e.state==='parked').length;
 html+=`<div class="sectionHeading">Plazas y flota real</div><div class="m4OpsEquipment"><b>DrillTruck® personal (P01)</b><span>${fleet.personal?.[0]?fleet.personal[0].state==='working'?'En conducción':'Estacionado':'Libre · vehículo adicional'}</span><b>Vehículos ligeros techados</b><span>${occupied(fleet.covered)} / ${capacity.covered||PATIO_L1.coveredCapacity} plazas ocupadas</span><b>Perforadoras a cielo abierto</b><span>${occupied(fleet.openDrill)} / ${capacity.drill||PATIO_L1.openDrillCapacity} plazas ocupadas</span><b>Equipos pesados a cielo abierto</b><span>${occupied(fleet.openHeavy)} / ${capacity.heavy||PATIO_L1.heavyCapacity} plazas ocupadas</span><b>Portón fijo HSEC</b><span>${capacity.gate?'Habilitado':'Pendiente'}</span></div>`;
 const labels={parked:'Estacionado en su plaza',working:'Operando en faena', 'in-transit':'En transferencia / no estacionado'};
 html+='<div class="sectionHeading">Equipos de tu faena</div>';
 const rows=[...fleet.covered,...fleet.openDrill,...fleet.openHeavy];
 if(!rows.length)html+='<p class="m4OpsHint">Sin maquinaria asignada. Las plazas permanecen libres; el patio no genera equipos automáticamente.</p>';
 for(const equipment of rows){
  html+=`<section class="m4OpsNext"><small>PLAZA ${esc(equipment.slot)} · ${esc(equipment.state==='parked'?'OCUPADA':'LIBRE')}</small><h3>${esc(equipment.name)}</h3><p>${esc(labels[equipment.state]||equipment.state)}</p></section>`;
 }
 // Infrastructure app is read-only for personnel: all hiring lives in Personal.
 const accepted=!!s.narrative?.accepted?.includes('m5');
 const rewarded=!!s.narrative?.rewardsCollected?.includes('m5');
 html+='<div class="sectionHeading">MISIÓN 5 · 6 OBJETIVOS EN ORDEN</div>';
 html+='<section class="m4OpsNext"><small>'+readout.done+' / '+readout.total+' COMPLETADOS · '+Math.round(readout.progress*100)+'%</small><div class="steps">'+readout.steps.map(o=>
  '<div class="'+(o.done?'done':o.status)+'"><span class="stepNumber">'+(o.done?icon('check'):o.number)+'</span><span><b>'+esc(o.label)+'</b><small>'+esc(o.status==='current'?o.remainingSeconds!==null?clock(o.remainingSeconds)+' restantes · '+o.hint:o.hint:o.status==='locked'?'Se desbloquea al completar el paso anterior':'Completado')+'</small></span></div>'
 ).join('')+'</div><p><b>Siguiente paso:</b> '+esc(readout.pending?.label||'Confirmar cierre con Elena Torres')+'</p></section>';
 html+='<section class="m4OpsNext"><small>BONO ÚNICO DE CASA MATRIZ</small><b>🪙 '+fmt(readout.rewardCash)+'</b><p>'+esc(rewarded?'Bonificación acreditada':'Se acredita una sola vez al confirmar el mensaje final de Elena, después de completar los cinco pasos.')+'</p></section>';
 if(!accepted)html+='<p class="m4OpsHint">Acepta primero el mensaje de Elena Torres para habilitar la misión.</p>';
 const guardHired=hiredPatioStaff(s,'m5-gate-security');
 const techHired=hiredPatioStaff(s,'m5-warehouse-tech');
 html+='<div class="sectionHeading">Personal de la operación</div><section class="m4OpsNext"><small>CONTRATACIÓN EXCLUSIVA EN PERSONAL</small><p>Guardia de acceso: '+(guardHired?'Contratado':'Pendiente')+' · Técnica de bodega: '+(techHired?'Contratada':'Pendiente')+'</p><button class="primary" data-app="m3-personnel">'+icon('personnel')+' Abrir Personal</button></section>';
 if(accepted&&status==='operational'){
  const guard=hiredPatioStaff(s,'m5-gate-security');
  const tech=hiredPatioStaff(s,'m5-warehouse-tech');
  html+='<section class="m4OpsNext"><small>CONTROL DE SEGURIDAD</small><b>Caseta y barrera de acceso</b><p>'+esc(gateChecked(s)?'Verificación HSEC realizada':'Revisar apertura controlada y segregación')+'</p>'+
   '<button data-m5-action="gate" '+(!guard||!tech||gateChecked(s)?'disabled':'')+'>'+icon('check')+' Verificar portón</button></section>';
  html+='<section class="m4OpsNext"><small>CONTROL DE INVENTARIO</small><b>Revisión de bodega</b><p>'+esc(warehouseChecked(s)?'Auditoría registrada · '+s.mission5.lastWarehouseAudit?.total+' herramientas':'Contar bits y martillos disponibles en stock')+'</p>'+
   '<button data-m5-action="warehouse" '+(!tech||!gateChecked(s)||warehouseChecked(s)?'disabled':'')+'>'+icon('check')+' Revisar stock</button></section>';
 }
 if(s.mission5?.commissionedAt)html+='<section class="m4OpsNext"><b>Operación lista · esperando confirmación de Elena</b><p>Abre el mensaje final de M5 para cerrar la misión.</p></section>';
 html+='<div class="sectionHeading">Segundo DrillTruck® · Movilidad</div><section class="m4OpsNext"><p>La unidad 01 sigue funcionando automáticamente. Solicita la unidad 02 en Casa Matriz y condúcela desde la plaza P01 con joystick y freno.</p><button class="primary" data-app="m4-dth-catalog">'+icon('store')+' Abrir Casa Matriz</button></section>';
 html+='<div class="sectionHeading">Ampliaciones futuras</div>';
 for(const d of PATIO_FUTURE)html+=`<section class="m4OpsNext"><small>L${d.level} · BLOQUEADO</small><h3>${esc(d.name)}</h3><p>Terreno reservado. No construible todavía.</p></section>`;
 html+=`<button class="primary" data-app="builder">${icon('build')} ${status==='operational'?'Abrir Catálogo':status==='building'?'Ver obra en Catálogo':'Construir desde Catálogo'}</button>`;
 return html;
}
