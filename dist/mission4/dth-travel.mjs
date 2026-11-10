// V48: read-only physical relocation pose for the single permanent DTH.
// Uses the same 12-second persisted window as production.mjs; no cash/tool writes.
export const DTH_TRAVEL_MS=12000;
const valid=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.z);
const clamp=t=>Math.max(0,Math.min(1,t));

export function dthTravelPose(s,now=Date.now()){
 const m=s?.mission4,d=m?.productionDrill;
 if(!d)return null;
 const zones=m?.zones||[];
 const zone=zones.find(z=>z.id===d.assignedZone);
 const target=zone?.position||d.position;
 if(!valid(target))return null;
 const end=Number(m.travelUntil);
 const moving=Number.isFinite(end)&&end>now;
 if(!moving)return {moving:false,x:target.x,z:target.z,fromZoneId:null,
  toZoneId:zone?.id||null,progress:1,remainingSeconds:0,heading:null};
 // New saves have the true origin. Older saves had already overwritten
 // drill.position with the *destination*: use the most recently produced
 // alternative site as a best-effort origin, without changing the save.
 const fallback=zones.filter(z=>z.id!==zone?.id&&valid(z.position))
  .sort((a,b)=>(b.cycleCount||0)-(a.cycleCount||0))[0];
 const origin=valid(m.travelFrom)?m.travelFrom:(fallback?.position||target);
 const started=Number.isFinite(m.travelStartedAt)&&m.travelStartedAt<end
  ?m.travelStartedAt:end-DTH_TRAVEL_MS;
 const duration=Math.max(1,end-started);
 const progress=clamp((now-started)/duration);
 const dx=target.x-origin.x,dz=target.z-origin.z;
 return {moving:true,
  x:origin.x+dx*progress,z:origin.z+dz*progress,
  fromZoneId:zones.find(z=>valid(z.position)&&
   Math.hypot(z.position.x-origin.x,z.position.z-origin.z)<0.01)?.id||fallback?.id||null,
  toZoneId:zone?.id||null,progress,remainingSeconds:Math.ceil(Math.max(0,end-now)/1000),
  heading:Math.hypot(dx,dz)>.01?Math.atan2(dx,dz):null};
}
