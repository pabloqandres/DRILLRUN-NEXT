// M4 operational walkthrough: read-only adapter for the existing mission engine.
// This module never changes mission predicates, purchases, money or saved data.
import {mission4Objectives} from './mission4-state.mjs';
import {DTH_DRILLS,DTH_HAMMERS,DTH_BITS} from './drills-dth.mjs';
import {DRILLTRUCK_COST} from './drilltruck.mjs';
import {WORKSHOP_LEVELS} from '../mission3/inventory.mjs';

const DISPATCH_FEE=200;
export const M4_ENTRY_PACKAGE={
 workshop:WORKSHOP_LEVELS[1].upgradeCost,
 dthDrill:DTH_DRILLS[0].price,
 hammer:DTH_HAMMERS[0].price,
 bit:DTH_BITS[0].price,
 technician:5000,
 drillTruck:DRILLTRUCK_COST,
 dispatch:DISPATCH_FEE*4,
};
export const M4_ENTRY_TOTAL=Object.values(M4_ENTRY_PACKAGE).reduce((sum,n)=>sum+n,0);

const DESCRIPTIONS={
 workshopNv2:['Ampliar el taller a nivel 2','Abre el taller y realiza la ampliación. Duración normal: 5 minutos.','m4-workshop'],
 buyDthDrill:['Recibir perforadora DTH','Solicítala en Casa Matriz → Producción DTH y espera su entrega de 3 minutos.','m4-dth-catalog'],
 orderDthTools:['Recibir martillo PUMA® DTH','Solicita un martillo compatible en Casa Matriz → Producción DTH. Entrega de 2 minutos.','m4-dth-catalog'],
 equipDth:['Instalar martillo y bit DTH','En Taller → Equipar DTH selecciona un martillo PUMA® y un bit compatibles, ya entregados.','m4-workshop'],
 convertZone:['Preparar una zona de producción','En Zonas convierte uno de los sondajes exploratorios RC ya terminados.','m4-zones'],
 assignDrill:['Desplegar la DTH en la zona','En Zonas selecciona la zona y pulsa Instalar DTH. La RC permanece en resguardo.','m4-zones'],
 hireTecnico:['Contratar técnico DRILLCO®','En Personal contrata el técnico para habilitar mantenimiento y DrillTruck.','m3-personnel'],
 buyTruck:['Recibir DrillTruck','Solicítalo desde Equipos de servicio. Llega a su estacionamiento tras 3 minutos.','m4-drilltruck'],
 linkTruck:['Vincular DrillTruck a la zona','En el panel DrillTruck, vincúlalo a la zona donde está trabajando la DTH.','m4-drilltruck'],
 firstCycle:['Completar el primer ciclo de producción','Cuando la zona esté produciendo, el primer ciclo de ingresos toma 15 minutos.','m4-zones'],
 productionZone:['Mantener una zona activa','Revisa el estado real de la producción en Zonas.','m4-zones']
};
const STAGE_NAMES=['Ampliar capacidad','Comprar y equipar DTH','Preparar y desplegar producción','Automatizar mantenimiento','Obtener primera producción'];

export function mission4Readout(s){
 const groups=mission4Objectives(s).map((g,i)=>({
  id:g.id,title:STAGE_NAMES[i]||g.nameKey,
  checks:g.checks.map(c=>{
   const [label,description,app]=DESCRIPTIONS[c.id]||[c.labelKey,c.labelKey,'m4-operaciones'];
   return {id:c.id,label,description,app,done:!!c.done};
  })
 }));
 for(const g of groups)g.complete=g.checks.every(c=>c.done);
 const total=groups.reduce((n,g)=>n+g.checks.length,0);
 const done=groups.reduce((n,g)=>n+g.checks.filter(c=>c.done).length,0);
 const next=groups.flatMap(g=>g.checks.map(c=>({...c,stage:g.title,stageId:g.id}))).find(c=>!c.done)||null;
 const dth=s.mission4?.productionDrill||null;
 const pending=(s.orders||[]).filter(o=>o.status==='dispatched'||o.status==='pending');
 const incoming=type=>pending.some(o=>(o.items||[]).some(i=>i.type===type));
 const tools=s.toolInventory||[];
 const hammers=tools.filter(t=>t.type==='hammer'&&t.model?.startsWith('puma-dth')&&t.status!=='spent');
 const bits=tools.filter(t=>t.type==='bit'&&t.model?.startsWith('dth-')&&t.status!=='spent');
 const waitingTool=prefix=>pending.some(o=>(o.items||[]).some(i=>i.model?.startsWith(prefix)));
 const hasTechnician=(s.personnel||[]).some(p=>p.role==='tecnicoDrillco');
 const budgetPending={
  workshop:(s.workshop?.level||0)>=2?0:M4_ENTRY_PACKAGE.workshop,
  dthDrill:dth||incoming('dthDrill')?0:M4_ENTRY_PACKAGE.dthDrill+DISPATCH_FEE,
  hammer:hammers.length||waitingTool('puma-dth')?0:M4_ENTRY_PACKAGE.hammer+DISPATCH_FEE,
  bit:bits.length||waitingTool('dth-')?0:M4_ENTRY_PACKAGE.bit+DISPATCH_FEE,
  technician:hasTechnician?0:M4_ENTRY_PACKAGE.technician,
  drillTruck:s.mission4?.drillTruck||incoming('drillTruck')?0:M4_ENTRY_PACKAGE.drillTruck+DISPATCH_FEE
 };
 const remainingMinimum=Object.values(budgetPending).reduce((sum,n)=>sum+n,0);
 return {groups,total,done,progress:total?done/total:0,next,remainingMinimum,
  totalMinimum:M4_ENTRY_TOTAL,
  cash:s.cash||0,
  drill:dth,
  drillStatus:dth?(dth.assignedZone?'Produciendo en '+dth.assignedZone:'Recibida · resguardo en taller'):incoming('dthDrill')?'En tránsito (3 minutos)':'Sin comprar',
  rcStatus:s.drill?(s.contract?.status==='delivered'?'En reserva tras exploración':'Operativa en exploración'):'Sin perforadora RC',
  hammerCount:hammers.length,bitCount:bits.length,
  hammerInstalled:!!dth?.installedHammer,bitInstalled:!!dth?.installedBit,
  pendingDeliveries:pending.length,
  truck:s.mission4?.drillTruck||null};
}
