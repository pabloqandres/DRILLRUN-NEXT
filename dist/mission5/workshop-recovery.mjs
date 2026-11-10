// DRILL RUN NEXT GENERATION · Taller L1 recovery and repair.
// Separate from Patio warehouse and from M3/M4 drilling/dispatch. No free kits
// and no change to automatic bit replacement in M3/M4.
import {workshopBuilt,workshopFree} from '../mission3/inventory.mjs';

export const REPAIR_KITS=Object.freeze({
 'bit-sharpen-kit':Object.freeze({id:'bit-sharpen-kit',type:'bit',label:'Kit de reafiliado de bits',price:600,seconds:90,recoveryFraction:.48,maxCycles:2}),
 'hammer-service-kit':Object.freeze({id:'hammer-service-kit',type:'hammer',label:'Kit de servicio de martillos DTH',price:1000,seconds:180,recoveryFraction:.55,maxCycles:1})
});
export const repairKitFor=type=>Object.values(REPAIR_KITS).find(k=>k.type===type)||null;
export const recoveryState=s=>s?.mission5?.recovery||null;
export const recoveredStock=s=>s?.mission5?.recovery?.kits||{};
export const recoveryJobs=s=>s?.mission5?.recovery?.jobs||[];
export const recoveryHistory=s=>s?.mission5?.recovery?.history||[];
export function creditRepairKit(s,id,qty=1){
 const kit=REPAIR_KITS[id];
 if(!kit||!Number.isInteger(qty)||qty<1||qty>10)throw new Error('invalidKit');
 s.mission5??={};
 s.mission5.recovery??={kits:{},jobs:[],history:[]};
 s.mission5.recovery.kits??={};
 s.mission5.recovery.kits[id]=(s.mission5.recovery.kits[id]||0)+qty;
 return s.mission5.recovery.kits[id];
}
export function canStartRecovery(s,toolId){
 if(!workshopBuilt(s))return 'workshopNotBuilt';
 if(s?.mission5?.status!=='operational')return 'patioNotReady';
 const tool=(s.toolInventory||[]).find(t=>t.id===toolId);
 if(!tool)return 'toolNotFound';
 const kit=repairKitFor(tool.type);
 if(!kit)return 'toolNotRecoverable';
 if(!['spent','worn'].includes(tool.status))return 'toolNotRecoverable';
 if((tool.recoveryCount||0)>=kit.maxCycles)return 'recoveryLimit';
 if(!Number.isFinite(tool.lifeTotal)||tool.lifeTotal<=0)return 'invalidTool';
 // Recovering a healthy (worn) item repeatedly would create free life.
 if(tool.status==='worn'&&tool.lifeRemaining>tool.lifeTotal*.4)return 'toolNotWornEnough';
 if(tool.status==='spent'&&workshopFree(s)<1)return 'noWorkshopCapacity';
 if((recoveredStock(s)[kit.id]||0)<1)return 'needsRepairKit';
 if(recoveryJobs(s).some(job=>job.toolId===toolId))return 'alreadyRepairing';
 return null;
}
export function startRecovery(s,toolId,now=Date.now()){
 const reason=canStartRecovery(s,toolId);
 if(reason)throw new Error(reason);
 const tool=s.toolInventory.find(t=>t.id===toolId),kit=repairKitFor(tool.type);
 s.mission5.recovery.kits[kit.id]--;
 tool.status='repairing';
 const job={id:'recovery-'+(s.nextId++),toolId:tool.id,kitId:kit.id,startedAt:now,endsAt:now+kit.seconds*1000};
 s.mission5.recovery.jobs??=[];
 s.mission5.recovery.jobs.push(job);
 s.ledger??=[];
 s.ledger.push({id:s.nextId++,key:'workshopRecovery',label:kit.label+' · '+tool.model,amount:0,kitConsumed:kit.id,at:now});
 return job;
}
export function finishRecoveries(s,now=Date.now()){
 const state=recoveryState(s);
 if(!state?.jobs?.length)return [];
 const ready=[],pending=[];
 for(const job of state.jobs){
  if(now<job.endsAt){pending.push(job);continue;}
  const tool=(s.toolInventory||[]).find(t=>t.id===job.toolId);
  const kit=REPAIR_KITS[job.kitId];
  if(!tool||!kit||tool.status!=='repairing'){continue;} // preserve healthy existing state
  const cycles=(tool.recoveryCount||0);
  // Repair is partial, progressively less useful and never new-equivalent.
  const fraction=kit.recoveryFraction*Math.max(.40,1-cycles*.25);
  tool.lifeRemaining=Math.max(1,Math.min(tool.lifeTotal*.70,Math.round(tool.lifeTotal*fraction)));
  tool.recoveryCount=cycles+1;
  tool.status='worn';
  tool.lastRecoveredAt=now;
  const event={id:job.id,toolId:tool.id,model:tool.model,type:tool.type,kit:kit.id,completedAt:now,lifeRemaining:tool.lifeRemaining};
  state.history??=[];
  if(!state.history.some(e=>e.id===event.id))state.history.push(event);
  const record=(s.spentMaterials||[]).find(m=>m.originalToolId===tool.id&&!m.recoveredForReuseAt);
  if(record)record.recoveredForReuseAt=now;
  ready.push(event);
 }
 state.jobs=pending;
 return ready;
}
export function workshopRecoverySummary(s,now=Date.now()){
 const inventory=s.toolInventory||[];
 const candidates=inventory.filter(t=>t.type==='bit'||t.type==='hammer').filter(t=>['spent','worn'].includes(t.status));
 return {candidates:candidates.map(tool=>{
  const kit=repairKitFor(tool.type);
  return {...tool,kitId:kit?.id||'',kitLabel:kit?.label||'',blocked:canStartRecovery(s,tool.id)};
 }),kits:recoveredStock(s),jobs:recoveryJobs(s).map(j=>({...j,remainingSeconds:Math.max(0,Math.ceil((j.endsAt-now)/1000))})),completed:recoveryHistory(s).length};
}
