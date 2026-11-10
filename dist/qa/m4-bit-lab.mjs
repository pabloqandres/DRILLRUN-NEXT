// DRILL RUN · M4 controlled bit-replacement verification.
// Standalone laboratory: constructs an IN-MEMORY fixture; never reads or
// writes localStorage, Firebase, player state, cloud saves or game.mjs.
import * as T from '../vendor/three.module.js';
import {tickProduction,dthReplacementAvailable,CYCLE_DURATION,ZONE1_METERS_PER_CYCLE,ZONE1_INCOME_PER_CYCLE} from '../mission4/production.mjs';
import {assignTruckToZone} from '../mission4/zones.mjs';
import {startMaintenance,tickMaintenance,advanceMaintenancePhase,MAINTENANCE_PHASES} from '../mission4/maintenance.mjs';
import {initTruckRouteState,startTruckRoute,updateTruckRoute} from '../mission4/truck-routes.mjs';
import {dthRigInspection} from '../mission4/rig-inspection.mjs';

const T0=Date.UTC(2026,10,9,12);
const clone=x=>JSON.parse(JSON.stringify(x));
const tool=(id,type,model,total,remaining,status)=>({
 id,type,model,lifeTotal:total,lifeRemaining:remaining,
 metersUsed:total-remaining,status
});

export function createM4LabFixture({spare=true,bitMeters=30}={}){
 return {
  version:6,saveKey:null,savedAt:T0,cash:25000,nextId:900,ledger:[],spentMaterials:[],
  toolInventory:[
   tool('qa-bit-installed','bit','dth-button-8',350,bitMeters,'installed'),
   tool('qa-hammer-installed','hammer','puma-dth-8',2800,1600,'installed'),
   ...(spare?[tool('qa-bit-stock','bit','dth-button-8',350,350,'new')]:[])
  ],
  mission4:{
   phase:'complete',productionMode:'single-dth-v2',serviceRequested:false,
   productionCycles:7,totalAutomatedIncome:6000,zone1Meterage:90,
   travelUntil:null,
   zones:[
    {id:'BH-01',position:{x:20,z:4},status:'producing',lastCycleAt:T0,cycleCount:3,totalIncome:1500},
    {id:'BH-02',position:{x:23,z:1},status:'idle',lastCycleAt:null,cycleCount:2,totalIncome:1000},
    {id:'BH-03',position:{x:26,z:-2},status:'idle',lastCycleAt:null,cycleCount:2,totalIncome:1000}
   ],
   productionDrill:{
    id:'rig_dth_production',assignedZone:'BH-01',state:'producing',
    position:{x:20,z:4},installedBit:'qa-bit-installed',installedHammer:'qa-hammer-installed'
   },
   drillTruck:{id:'drilltruck-01',state:'parked',position:{x:-13.5,z:-9.3},assignedZone:null,maintenancePhase:null}
  }
 };
}
function makeCheck(checks,label,passed,detail=''){
 checks.push({label,passed:!!passed,detail});
}
function snapshot(trace,s,now,label,detail=''){
 const d=dthRigInspection(s,now),m=s.mission4;
 trace.push({
  label,detail,time:now,
  bit:d?.bit?.remaining??0,hammer:d?.hammer?.remaining??0,
  cash:s.cash,activeZone:d?.zoneId,drill:d?.state,
  truck:m.drillTruck?.maintenancePhase||m.drillTruck?.state,
  discarded:s.spentMaterials?.length||0
 });
}
function moveTruck(model,zoneId,direction,time){
 startTruckRoute(model,zoneId,direction);
 let outcome=null,steps=0;
 const start=time;
 for(;steps<1200;steps++){
  outcome=updateTruckRoute(model,0.25);
  time+=250;
  if(outcome)break;
 }
 if(outcome!==(direction==='out'?'arrived':'returned'))
  throw Error('La ruta real de DrillTruck no terminó: '+direction);
 return {time,durationMs:time-start,
  distanceToRig:Math.hypot(model.position.x-20,model.position.z-4),
  at:{x:model.position.x,z:model.position.z}};
}

export function runM4BitLab({spare=true,bitMeters=30}={}){
 const s=createM4LabFixture({spare,bitMeters});
 const trace=[],checks=[],orig=clone(s);
 let now=T0;let routeOut=null,routeBack=null;
 snapshot(trace,s,now,'Inicio','DTH operando; bit próximo al agotamiento.');
 // This is time acceleration in a synthetic state only (not the player's game).
 now+=CYCLE_DURATION*1000;
 const cycleEvents=tickProduction(s,now);
 snapshot(trace,s,now,'Ciclo completado','Producción real: acreditación, avance y desgaste.');
 const expectedMeters=Math.min(ZONE1_METERS_PER_CYCLE,bitMeters);
 const expectedRevenue=Math.round(ZONE1_INCOME_PER_CYCLE*expectedMeters/ZONE1_METERS_PER_CYCLE);
 makeCheck(checks,'El bit descuenta metros reales',s.toolInventory[0].lifeRemaining===0&&expectedMeters===bitMeters,
  bitMeters+' m → 0 m');
 makeCheck(checks,'El martillo descuenta el mismo avance',s.toolInventory[1].lifeRemaining===1600-expectedMeters);
 makeCheck(checks,'Ingreso correcto (una sola DTH)',s.cash===orig.cash+expectedRevenue&&
  s.ledger.length===1&&cycleEvents.includes('incomeGenerated'));
 makeCheck(checks,'Descarte trazable y pendiente de retiro',s.toolInventory[0].status==='spent'&&
  s.spentMaterials.length===1&&s.spentMaterials[0].originalToolId==='qa-bit-installed'&&
  s.spentMaterials[0].recyclingStatus==='awaiting-pickup');
 makeCheck(checks,'La DTH se detiene por desgaste',s.mission4.serviceRequested&&
  s.mission4.productionDrill.state==='paused');
 const paid=s.cash;
 tickProduction(s,now+10);
 makeCheck(checks,'Sin doble acreditación',s.cash===paid&&s.ledger.length===1);
 if(!spare){
  const available=dthReplacementAvailable(s);
  now+=2*3600000;
  tickProduction(s,now);
  snapshot(trace,s,now,'Sin repuesto','DTH detenida; no se crea inventario ni dinero.');
  makeCheck(checks,'Sin stock no se despacha el DrillTruck',!available&&s.mission4.drillTruck.state==='parked');
  makeCheck(checks,'Sin stock no hay pagos posteriores',s.cash===paid&&s.ledger.length===1);
  makeCheck(checks,'Inventario permanece intacto',s.toolInventory.length===2);
 }else{
  const available=dthReplacementAvailable(s);
  makeCheck(checks,'Existe un bit nuevo en la bodega',available&&s.toolInventory[2].status==='new');
  assignTruckToZone(s,'BH-01',now);
  startMaintenance(s,'BH-01',now);
  snapshot(trace,s,now,'Servicio solicitado','DrillTruck despachado por agotamiento.');
  now+=3000;
  const detection=tickMaintenance(s,now);
  makeCheck(checks,'Detección activa el despacho',detection.includes('truckDispatch')&&
   s.mission4.drillTruck.maintenancePhase==='dispatch');
  const model=new T.Group();
  initTruckRouteState(model);
  routeOut=moveTruck(model,'BH-01','out',now);
  now=routeOut.time;
  advanceMaintenancePhase(s,now);
  snapshot(trace,s,now,'DrillTruck llegó','Ruta real al carril de servicio junto a BH-01.');
  makeCheck(checks,'La ruta llega sin ocupar el centro de perforación',
   routeOut.distanceToRig>=4.5&&s.mission4.drillTruck.maintenancePhase==='positioning',
   Math.round(routeOut.distanceToRig*10)/10+' m del centro');
  // Timed physical service phases from the production maintenance module.
  for(let n=0;n<MAINTENANCE_PHASES.length;n++){
   const id=s.mission4.drillTruck.maintenancePhase;
   if(id==='return')break;
   const phase=MAINTENANCE_PHASES.find(p=>p.id===id);
   if(!phase||phase.duration<=0)throw Error('Fase inesperada: '+id);
   now+=phase.duration*1000;
   const events=tickMaintenance(s,now);
   snapshot(trace,s,now,'Mantenimiento: '+phase.label,
    events.includes('truckReturn')?'DrillTruck inicia retorno a base.':'Fase completada.');
  }
  makeCheck(checks,'Las fases de mantenimiento se completan',s.mission4.drillTruck.maintenancePhase==='return');
  routeBack=moveTruck(model,'BH-01','return',now);
  now=routeBack.time;
  advanceMaintenancePhase(s,now); // actual completeMaintenance(s)
  snapshot(trace,s,now,'Recambio finalizado','DrillTruck de regreso; consumible repuesto y descarte recibido.');
  const m=s.mission4,d=m.productionDrill,bitNew=s.toolInventory.find(t=>t.id==='qa-bit-stock');
  makeCheck(checks,'Bit nuevo instalado desde stock',d.installedBit==='qa-bit-stock'&&
   bitNew.status==='installed'&&bitNew.lifeRemaining===350);
  makeCheck(checks,'Bit antiguo sigue descartado',s.toolInventory[0].status==='spent'&&s.toolInventory[0].lifeRemaining===0);
  makeCheck(checks,'Descarte recibido para M8',s.spentMaterials.length===1&&
   s.spentMaterials[0].recyclingStatus==='awaiting-yard'&&
   Number.isFinite(s.spentMaterials[0].recoveredAt));
  makeCheck(checks,'La DTH vuelve a producir',!m.serviceRequested&&d.state==='producing'&&
   m.zones[0].status==='producing'&&m.drillTruck.state==='parked');
  makeCheck(checks,'El recambio no acredita dinero extra',s.cash===paid&&s.ledger.length===1);
  now+=CYCLE_DURATION*1000;
  const newCycle=tickProduction(s,now);
  snapshot(trace,s,now,'Producción reanudada','Otro ciclo con bit de bodega.');
  makeCheck(checks,'Siguiente ciclo produce con bit reemplazado',newCycle.includes('incomeGenerated')&&
   s.cash===paid+ZONE1_INCOME_PER_CYCLE&&bitNew.lifeRemaining===320);
  makeCheck(checks,'Rotación de DTH luego del ciclo',d.assignedZone!=='BH-01'&&d.state==='moving');
 }
 return {scenario:spare?'con-repuesto':'sin-repuesto',
  passed:checks.every(c=>c.passed),checks,trace,
  initial:{cash:orig.cash,bit:bitMeters,hammer:1600,stock:spare?1:0},
  final:{cash:s.cash,bitInstalled:s.mission4.productionDrill.installedBit,
   formerBit:s.toolInventory[0].status,hammer:s.toolInventory[1].lifeRemaining,
   spareStatus:s.toolInventory[2]?.status||'no-disponible',
   stockAvailable:s.toolInventory.filter(t=>t.status==='new').length,
   materials:clone(s.spentMaterials),zone:s.mission4.productionDrill.assignedZone,
   drill:s.mission4.productionDrill.state},
  routes:{out:routeOut,back:routeBack},
  isolation:'Memoria de laboratorio: sin acceso a guardado local, Firebase o cuenta Google'
 };
}
