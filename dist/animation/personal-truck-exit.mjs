// DRILL RUN NEXT GENERATION · V60
// Choose a genuinely walkable place to step out of DrillTruck® personal 02.
// The caller MUST ignore ONLY this truck's own collision box during sampling.
export function personalTruckExitCandidates(truck){
 const p=truck?.position,yaw=truck?.heading;
 if(!Number.isFinite(p?.x)||!Number.isFinite(p?.z)||!Number.isFinite(yaw))return [];
 const side={x:Math.cos(yaw),z:-Math.sin(yaw)};
 const front={x:Math.sin(yaw),z:Math.cos(yaw)};
 // Left/right door first; if near a fence or machine, use adjacent door
 // clearance, then rear or front. Never move the player farther than ~4 m.
 const offsets=[
  [2.35,0],[-2.35,0],
  [2.8,0],[-2.8,0],
  [2.55,-.95],[-2.55,-.95],
  [2.55,.95],[-2.55,.95],
  [3.25,0],[-3.25,0],
  [0,-3.45],[0,3.45],
  [2.35,-1.65],[-2.35,-1.65],
  [2.35,1.65],[-2.35,1.65]
 ];
 return offsets.map(([lateral,longitudinal])=>({
  x:p.x+side.x*lateral+front.x*longitudinal,
  z:p.z+side.z*lateral+front.z*longitudinal,
  lateral,longitudinal
 }));
}
export function findSafePersonalTruckExit(truck,isFree){
 if(typeof isFree!=='function')return null;
 const p=truck?.position;
 for(const candidate of personalTruckExitCandidates(truck)){
  const dx=candidate.x-p.x,dz=candidate.z-p.z;
  // Avoid stepping THROUGH a wall to an apparently free point. The centre
  // of our vehicle was already excluded by the caller, never other solids.
  let clear=true;
  for(const t of [.4,.6,.8,1]){
   if(!isFree({x:p.x+dx*t,z:p.z+dz*t})){clear=false;break;}
  }
  if(clear)return {x:candidate.x,z:candidate.z};
 }
 return null;
}
