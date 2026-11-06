// Mission 4 — Maintenance sequence
// 7-phase animated maintenance cycle when DrillTruck services a zone.

export const MAINTENANCE_PHASES=[
 {id:'detection',duration:3,label:'Detección de zona'},
 {id:'dispatch',duration:0,label:'Enviando DrillTruck'},      // duration handled by route animation
 {id:'positioning',duration:5,label:'Posicionamiento'},
 {id:'descent',duration:8,label:'Descenso de herramientas'},
 {id:'arm',duration:10,label:'Mantenimiento activo'},
 {id:'update',duration:4,label:'Actualización de datos'},
 {id:'return',duration:0,label:'Retorno a base'}              // duration handled by route animation
];

// Total duration of timed phases (excluding route-animated phases)
export const MAINTENANCE_TIMED_DURATION=MAINTENANCE_PHASES.reduce((n,p)=>n+p.duration,0);

export function startMaintenance(s,zoneId,now=Date.now()){
 if(!s.mission4?.drillTruck)throw new Error('noTruck');
 const truck=s.mission4.drillTruck;
 const zone=s.mission4.zones.find(z=>z.id===zoneId);
 if(!zone)throw new Error('zoneNotFound');
 truck.maintenancePhase='detection';
 truck.maintenanceStartedAt=now;
 truck.maintenanceZone=zoneId;
 truck.maintenancePhaseStartedAt=now;
 zone.status='maintenance';
}

// Advance maintenance phases (called per second from tick)
// Returns events array
export function tickMaintenance(s,now=Date.now()){
 if(!s.mission4?.drillTruck)return [];
 const truck=s.mission4.drillTruck;
 if(!truck.maintenancePhase)return [];
 const events=[];
 const phaseIdx=MAINTENANCE_PHASES.findIndex(p=>p.id===truck.maintenancePhase);
 if(phaseIdx===-1)return [];
 const phase=MAINTENANCE_PHASES[phaseIdx];
 // 'dispatch' and 'return' are controlled by route animation, not timer
 if(phase.id==='dispatch'||phase.id==='return')return [];
 const elapsed=(now-(truck.maintenancePhaseStartedAt||now))/1000;
 if(elapsed>=phase.duration){
  // Advance to next phase
  const nextIdx=phaseIdx+1;
  if(nextIdx>=MAINTENANCE_PHASES.length){
   // Maintenance complete
   completeMaintenance(s,now);
   events.push('maintenanceComplete');
  }else{
   truck.maintenancePhase=MAINTENANCE_PHASES[nextIdx].id;
   truck.maintenancePhaseStartedAt=now;
   events.push('maintenancePhaseAdvance');
   // If entering dispatch phase, truck starts driving (handled in game.mjs)
   if(MAINTENANCE_PHASES[nextIdx].id==='dispatch')events.push('truckDispatch');
   if(MAINTENANCE_PHASES[nextIdx].id==='return')events.push('truckReturn');
  }
 }
 return events;
}

export function completeMaintenance(s,now=Date.now()){
 const truck=s.mission4.drillTruck;
 if(!truck)return;
 const zoneId=truck.maintenanceZone;
 truck.maintenancePhase=null;
 truck.maintenanceStartedAt=null;
 truck.maintenanceZone=null;
 truck.maintenancePhaseStartedAt=null;
 truck.state='parked';
 truck.position={x:-13.5,z:-9.3};
 truck.assignedZone=null;
 // Zone transitions to producing
 const zone=s.mission4.zones.find(z=>z.id===zoneId);
 if(zone){
  zone.status='producing';
  zone.lastCycleAt=now;
 }
}

// Advance to next phase manually (for route-animated phases like dispatch/return)
export function advanceMaintenancePhase(s,now=Date.now()){
 const truck=s.mission4?.drillTruck;
 if(!truck?.maintenancePhase)return;
 const phaseIdx=MAINTENANCE_PHASES.findIndex(p=>p.id===truck.maintenancePhase);
 const nextIdx=phaseIdx+1;
 if(nextIdx>=MAINTENANCE_PHASES.length){
  completeMaintenance(s,now);
 }else{
  truck.maintenancePhase=MAINTENANCE_PHASES[nextIdx].id;
  truck.maintenancePhaseStartedAt=now;
 }
}

export function maintenanceProgress(s){
 const truck=s.mission4?.drillTruck;
 if(!truck?.maintenancePhase)return null;
 const phaseIdx=MAINTENANCE_PHASES.findIndex(p=>p.id===truck.maintenancePhase);
 const phase=MAINTENANCE_PHASES[phaseIdx];
 const elapsed=phase.duration>0?(Date.now()-(truck.maintenancePhaseStartedAt||Date.now()))/1000:0;
 return {
  phase:phase.id,
  phaseLabel:phase.label,
  phaseIndex:phaseIdx,
  totalPhases:MAINTENANCE_PHASES.length,
  phaseProgress:phase.duration>0?Math.min(1,elapsed/phase.duration):0,
  overallProgress:(phaseIdx+Math.min(1,elapsed/(phase.duration||1)))/MAINTENANCE_PHASES.length,
  zoneId:truck.maintenanceZone
 };
}
