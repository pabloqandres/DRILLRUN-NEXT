// M5 · Read-only mission presentation. Buying happens only in the
// explicit Catalog confirmation, never while rendering an app.
import {PATIO_L1,PATIO_FUTURE,patioState,patioProgress,patioCapacity,patioUnlocked} from './patio-state.mjs';
import {fleetOccupancy} from './fleet-base.mjs';
import {PATIO_STAFF,hiredPatioStaff,mission5Objectives,gateChecked,warehouseChecked} from './patio-staff.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const clock=secs=>String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');
export function renderPatioApp(s,fmt,icon,now=Date.now()){
 const status=patioState(s),unlocked=patioUnlocked(s),info=patioProgress(s,now);
 const caption=status==='operational'?'OPERATIVO · HSEC APROBADO':status==='building'?'OBRA EN EJECUCIÓN':unlocked?'LISTO PARA CONSTRUIR':'BLOQUEADO · COMPLETA M4';
 const stages=[
  ['01','Plan maestro','Ubicación fija y blueprint aprobados',status!=='locked'],
  ['02','Construcción del terreno','Pavimentos y vías de alto tonelaje',status==='operational'||(status==='building'&&info.progress>=.1)],
  ['03','Montaje de módulos','Galpón, cubierta ligera, caseta y combustible',status==='operational'||(status==='building'&&info.progress>=.3)],
  ['04','Recepción HSEC','Segregación, iluminación, seguridad y acceso',status==='operational'||(status==='building'&&info.progress>=.8)],
  ['05','Puesta en servicio','Capacidad real habilitada para la flota',status==='operational']
 ];
 let html=`<div class="m3Header"><span class="inventoryIcon">${icon('build')}</span><div><span class="eyebrow">MISIÓN 5 · EXPANSIÓN DE FAENA</span><h3>Patio de Maquinarias L1</h3></div></div>`;
 html+=`<section class="m4OpsSummary"><b>${esc(caption)}</b><p>Complejo fijo de ${PATIO_L1.width} × ${PATIO_L1.depth} unidades de juego. Acceso único, techumbre solo para camionetas y DrillTruck®, explanadas abiertas para RC, DTH y futuros CAEX menores.</p></section>`;
 html+=`<div class="dcGrid"><div class="dcStat"><small>Construcción</small><b>${status==='operational'?'100%':Math.round(info.progress*100)+'%'}</b></div><div class="dcStat"><small>Tiempo restante</small><b>${status==='building'?clock(info.remainingSeconds):status==='operational'?'—':'20:00'}</b></div><div class="dcStat"><small>Inversión L1</small><b>🪙 ${fmt(PATIO_L1.price)}</b></div><div class="dcStat"><small>HSEC</small><b>${status==='operational'?'Aprobado':'Pendiente'}</b></div></div>`;
 if(status==='building')html+=`<section class="m4OpsNext"><small>CONSTRUCCIÓN · ${esc(info.label||'Montaje')}</small><div class="m4OpsBar"><i style="width:${Math.round(info.progress*100)}%"></i></div><b>${clock(info.remainingSeconds)} restantes</b><p>El contador continúa con tiempo real aunque cierres el juego.</p></section>`;
 html+='<div class="sectionHeading">Evolución de la misión</div><div class="steps">';
 for(const [num,name,description,done] of stages)html+=`<div class="${done?'done':''}"><span class="stepNumber">${done?icon('check'):num}</span><span><b>${esc(name)}</b><small>${esc(description)}</small></span></div>`;
 html+='</div><div class="sectionHeading">Paquete modular incluido</div>';
 for(const id of PATIO_L1.modules)html+=`<section class="m4OpsNext"><small>MÓDULO PREDEFINIDO</small><b>${esc(id)}</b></section>`;
 const capacity=patioCapacity(s),fleet=fleetOccupancy(s);
 const occupied=items=>items.filter(e=>e.state==='parked').length;
 html+=`<div class="sectionHeading">Plazas y flota real</div><div class="m4OpsEquipment"><b>Vehículos ligeros techados</b><span>${occupied(fleet.covered)} / ${capacity.covered||PATIO_L1.coveredCapacity} plazas ocupadas</span><b>Perforadoras a cielo abierto</b><span>${occupied(fleet.openDrill)} / ${capacity.drill||PATIO_L1.openDrillCapacity} plazas ocupadas</span><b>Equipos pesados a cielo abierto</b><span>${occupied(fleet.openHeavy)} / ${capacity.heavy||PATIO_L1.heavyCapacity} plazas ocupadas</span><b>Portón fijo HSEC</b><span>${capacity.gate?'Habilitado':'Pendiente'}</span></div>`;
 const labels={parked:'Estacionado en su plaza',working:'Operando en faena', 'in-transit':'En transferencia / no estacionado'};
 html+='<div class="sectionHeading">Equipos de tu faena</div>';
 const rows=[...fleet.covered,...fleet.openDrill,...fleet.openHeavy];
 if(!rows.length)html+='<p class="m4OpsHint">Sin maquinaria asignada. Las plazas permanecen libres; el patio no genera equipos automáticamente.</p>';
 for(const equipment of rows){
  html+=`<section class="m4OpsNext"><small>PLAZA ${esc(equipment.slot)} · ${esc(equipment.state==='parked'?'OCUPADA':'LIBRE')}</small><h3>${esc(equipment.name)}</h3><p>${esc(labels[equipment.state]||equipment.state)}</p></section>`;
 }
 // Staff are separate from the building price: hiring is explicit and
 // costs player funds. Real GLB actors only appear after the hire.
 const staff=PATIO_STAFF;
 const objectives=mission5Objectives(s);
 const accepted=!!s.narrative?.accepted?.includes('m5');
 html+='<div class="sectionHeading">MISIÓN 5 · PERSONAL Y PUESTA EN SERVICIO</div>';
 html+='<section class="m4OpsNext"><small>'+objectives.filter(x=>x.done).length+' / '+objectives.length+' OBJETIVOS</small><div class="steps">'+objectives.map(o=>'<div class="'+(o.done?'done':'')+'"><span class="stepNumber">'+(o.done?icon('check'):'•')+'</span><span><b>'+esc(o.label)+'</b></span></div>').join('')+'</div></section>';
 if(!accepted)html+='<p class="m4OpsHint">Lee el mensaje de Elena Torres y acepta la Misión 5 para contratar personal o iniciar la obra.</p>';
 for(const def of staff){
  const hired=hiredPatioStaff(s,def.id),affordable=s.cash>=def.cost,ready=status==='operational'&&accepted;
  html+='<section class="m4OpsNext"><small>'+esc(def.role==='security'?'ACCESO CONTROLADO':'BODEGA Y LOGÍSTICA')+'</small><b>'+esc(def.label)+'</b><p>'+esc(hired?'Contratado · NPC asignado a su puesto':'Costo de contratación · 🪙 '+fmt(def.cost))+'</p>'+
   (!hired?'<button class="primary" data-m5-action="hire" data-m5-staff="'+esc(def.id)+'" '+(!ready||!affordable?'disabled':'')+'>'+icon('personnel')+' Contratar</button>':'')+'</section>';
 }
 if(accepted&&status==='operational'){
  const guard=hiredPatioStaff(s,'m5-gate-security');
  const tech=hiredPatioStaff(s,'m5-warehouse-tech');
  html+='<section class="m4OpsNext"><small>CONTROL DE SEGURIDAD</small><b>Caseta y barrera de acceso</b><p>'+esc(gateChecked(s)?'Verificación HSEC realizada':'Revisar apertura controlada y segregación')+'</p>'+
   '<button data-m5-action="gate" '+(!guard||gateChecked(s)?'disabled':'')+'>'+icon('check')+' Verificar portón</button></section>';
  html+='<section class="m4OpsNext"><small>CONTROL DE INVENTARIO</small><b>Revisión de bodega</b><p>'+esc(warehouseChecked(s)?'Auditoría registrada · '+s.mission5.lastWarehouseAudit?.total+' herramientas':'Contar bits y martillos disponibles en stock')+'</p>'+
   '<button data-m5-action="warehouse" '+(!tech||warehouseChecked(s)?'disabled':'')+'>'+icon('check')+' Revisar stock</button></section>';
 }
 if(s.mission5?.commissionedAt)html+='<section class="m4OpsNext"><b>Operación lista · esperando confirmación de Elena</b><p>Abre el mensaje final de M5 para cerrar la misión.</p></section>';
 html+='<div class="sectionHeading">Ampliaciones futuras</div>';
 for(const d of PATIO_FUTURE)html+=`<section class="m4OpsNext"><small>L${d.level} · BLOQUEADO</small><h3>${esc(d.name)}</h3><p>Terreno reservado. No construible todavía.</p></section>`;
 html+=`<button class="primary" data-app="builder">${icon('build')} ${status==='operational'?'Abrir Catálogo':status==='building'?'Ver obra en Catálogo':'Construir desde Catálogo'}</button>`;
 return html;
}
