// Single read-only presentation model for Mission 3.
// Every status comes directly from mission3Objectives(s), the mission engine.
import {mission3Objectives} from './mission3-state.mjs';
import {contractProgress} from './contracts.mjs';

const LABELS={
 prepareCompany:'Preparar el taller y el equipo',
 knowTerrain:'Solicitar y revisar análisis geológico',
 equipOperation:'Equipar la operación',
 executeExploration:'Realizar sondajes exploratorios',
 deliverContract:'Entregar el contrato'
};
const STEPS={
 workshopReady:['Taller operativo','Termina la construcción del taller de mantenimiento.'],
 hireAdmin:['Administrador contratado','En Personal, contrata al administrador.'],
 requestAnalysis:['Solicitar análisis geológico','Pide el análisis en la aplicación Geología.'],
 waitForReport:['Esperar informe geológico','Espera el resultado del análisis solicitado.'],
 reviewReport:['Revisar informe geológico','Abre Geología y revisa el informe recibido.'],
 purchaseDrill:['Perforadora adquirida','Solicita una perforadora en Casa Matriz.'],
 hireDriller:['Operador contratado','Contrata al operador desde Personal.'],
 orderTools:['Herramientas disponibles','Solicita las brocas y demás herramientas necesarias en Casa Matriz.'],
 receiveDelivery:['Pedido recibido','Revisa Pedidos y espera a que se entregue el suministro.'],
 startDrilling:['Iniciar perforación','Prepara el equipo y comienza el contrato desde Contrato.'],
 completeBoreholes:['Completar sondajes','Realiza todos los sondajes exigidos en el contrato.'],
 validateMeters:['Validar metraje contratado','Completa la profundidad total del contrato.'],
 submitContract:['Entregar contrato al cliente','Entrega el contrato terminado desde Contrato.']
};
export function mission3Readout(s){
 const contract=contractProgress(s);
 const groups=mission3Objectives(s).map((o,i)=>({
  id:o.id,number:i+1,name:LABELS[o.nameKey]||o.nameKey,
  checks:o.checks.map(c=>{
   const [name,hint]=STEPS[c.labelKey]||[c.labelKey,'Revisa el objetivo'];
   let value='';
   if(c.progress!==undefined&&!c.done&&Number.isFinite(c.progress))value=Math.round(c.progress*100)+' %';
   if(c.labelKey==='completeBoreholes'&&contract)value=(contract.boreholesDone||0)+' / '+(contract.totalBoreholes||0)+' sondajes';
   if(c.labelKey==='validateMeters'&&s.contract)value=Math.round(s.contract.metersCompleted||0)+' / '+(s.contract.totalMeters||0)+' m';
   if(c.labelKey==='receiveDelivery')value=(s.orders||[]).filter(o=>o.status==='delivered').length+' pedido(s) recibido(s)';
   if(c.labelKey==='workshopReady')value=s.workshop?.status==='building'?'En construcción':c.done?'Taller operativo':'Sin terminar';
   return {id:c.id,name,hint,done:!!c.done,value};
  })
 }));
 for(const g of groups)g.done=g.checks.every(c=>c.done);
 const total=groups.reduce((n,g)=>n+g.checks.length,0);
 const done=groups.reduce((n,g)=>n+g.checks.filter(c=>c.done).length,0);
 const pending=groups.flatMap(g=>g.checks.map(c=>({...c,group:g.name,groupNumber:g.number}))).find(c=>!c.done)||null;
 return {groups,total,done,progress:total?done/total:0,pending};
}
