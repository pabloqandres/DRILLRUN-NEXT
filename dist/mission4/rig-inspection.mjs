// Pure, read-only inspection of the actual DTH rig and fitted tools.
// No inventory, mission, timer, ledger or saved value is modified here.
import {dthBitDefinition,dthHammerDefinition} from './drills-dth.mjs';
import {CYCLE_DURATION} from './production.mjs';

const finite=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
export function dthRigInspection(s,now=Date.now()){
 const m=s?.mission4,drill=m?.productionDrill;
 if(!drill)return null;
 const inventory=s?.toolInventory||[];
 const byId=id=>id?inventory.find(t=>t.id===id)||null:null;
 const makeTool=(id,type)=>{
  const item=byId(id);
  if(!item)return {id:id||null,type,name:id?'No disponible en inventario':'Sin instalar',remaining:0,total:0,used:0,percent:0,status:'missing'};
  const def=type==='bit'?dthBitDefinition(item.model):dthHammerDefinition(item.model);
  const total=Math.max(0,finite(item.lifeTotal,def?.lifeTotal||0));
  const remaining=Math.min(total,Math.max(0,finite(item.lifeRemaining,0)));
  return {id:item.id,type,name:item.name||def?.label||item.model,
   model:item.model,remaining,total,used:Math.max(0,finite(item.metersUsed,total-remaining)),
   percent:total>0?Math.max(0,Math.min(100,Math.round(100*remaining/total))):0,
   status:remaining<=0||item.status==='spent'?'spent':item.status||'installed'};
 };
 const zone=(m.zones||[]).find(z=>z.id===drill.assignedZone)||null;
 const pending=m.travelUntil&&m.travelUntil>now?'moving':
  m.serviceRequested?'paused':drill.state||'idle';
 const nextSeconds=zone?.status==='producing'&&Number.isFinite(zone.lastCycleAt)
  ?Math.max(0,Math.ceil((CYCLE_DURATION*1000-(now-zone.lastCycleAt))/1000)):null;
 return {rigId:drill.id,state:pending,zoneId:zone?.id||null,cycleCount:finite(m.productionCycles),
  metersProduced:finite(m.zone1Meterage),nextSeconds,bit:makeTool(drill.installedBit,'bit'),
  hammer:makeTool(drill.installedHammer,'hammer')};
}
