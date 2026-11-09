// Pure mission 3 objective readout; labels and hints cannot change phase,
// requirements, purchases or contract progress.
import {mission3Objectives} from './mission3-state.mjs';
export const M3_OBJECTIVE_NAMES={
 prepareCompany:'Preparar empresa y taller',
 knowTerrain:'Conocer el terreno',
 equipOperation:'Equipar la operación',
 executeExploration:'Realizar los sondajes',
 deliverContract:'Entregar el contrato'
};
export const M3_CHECK_TEXT={
 workshopReady:['Taller operativo','Construye el taller de mantenimiento y espera que termine su montaje.'],
 hireAdmin:['Administrador contratado','Abre Personal y contrata un administrador.'],
 requestAnalysis:['Análisis geológico solicitado','Solicita un análisis geológico desde Geología.'],
 waitForReport:['Informe geológico recibido','Espera a que termine el análisis o utiliza el acelerador disponible.'],
 reviewReport:['Informe revisado','Abre Geología y revisa el informe recibido.'],
 purchaseDrill:['Perforadora RC adquirida','Solicita una perforadora RC en Casa Matriz y recibe la entrega.'],
 hireDriller:['Operador contratado','Contrata un operador de perforadora desde Personal.'],
 orderTools:['Broca disponible en el taller','Solicita las herramientas compatibles desde Casa Matriz.'],
 receiveDelivery:['Pedido recibido','Revisa el seguimiento de pedidos y espera la entrega.'],
 startDrilling:['Perforación iniciada','Equipa la perforadora y comienza la operación.'],
 completeBoreholes:['Sondajes terminados','Completa todos los sondajes contratados.'],
 validateMeters:['Metraje contratado cumplido','Completa la profundidad requerida en todos los sondajes.'],
 submitContract:['Contrato entregado','En Contrato, entrega el resultado al cliente para habilitar el mensaje final.']
};
export function mission3Readout(s){
 const groups=mission3Objectives(s).map((obj,i)=>({
  id:obj.id,index:i+1,title:M3_OBJECTIVE_NAMES[obj.nameKey]||obj.nameKey,
  done:obj.checks.every(c=>c.done),
  checks:obj.checks.map(c=>{
   const [name,hint]=M3_CHECK_TEXT[c.labelKey]||[c.labelKey,'Revisa este objetivo'];
   let value=c.progress!==undefined&&!c.done?Math.round(c.progress*100)+'%':'';
   if(c.labelKey==='workshopReady')value=s.workshop?.status==='building'?'Taller en construcción':s.workshop?'Taller '+(s.workshop.status||'registrado'):'Taller sin construir';
   if(c.labelKey==='completeBoreholes')value=(s.boreholes||[]).filter(b=>b.status==='completed').length+' / '+((s.boreholes||[]).length||s.contract?.boreholeCount||0)+' sondajes';
   if(c.labelKey==='validateMeters')value=Math.round(s.contract?.metersCompleted||0)+' / '+(s.contract?.totalMeters||0)+' m';
   if(c.labelKey==='receiveDelivery')value=(s.orders||[]).filter(o=>o.status==='delivered').length+' pedido(s) entregado(s)';
   return {id:c.id,name,done:!!c.done,value,hint};
  })
 }));
 const pending=groups.flatMap(g=>g.checks.map(c=>({...c,group:g.title,index:g.index}))).find(c=>!c.done);
 return {groups,pending,completed:groups.reduce((n,g)=>n+g.checks.filter(c=>c.done).length,0),
  total:groups.reduce((n,g)=>n+g.checks.length,0)};
}
