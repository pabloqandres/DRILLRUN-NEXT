// DRILL RUN NEXT GENERATION · V62
// Visual-only boot clearance over the actual raised paving of Patio L1.
// The character's saved position, walking collision and vehicle physics remain
// unchanged. Returns zero everywhere else, including normal desert terrain.
const clamp=x=>Math.max(0,Math.min(1,x));
export function avatarPavementClearance(x,z,walkSurfaces=[]){
 if(!Number.isFinite(x)||!Number.isFinite(z))return 0;
 for(const surface of walkSurfaces||[]){
  if(!surface?._patioL1)continue;
  const dx=x-surface.x,dz=z-surface.z;
  const edge=Math.min(surface.w/2-Math.abs(dx),surface.d/2-Math.abs(dz));
  if(edge<=0)return 0;
  // Gentle easing over the last 60 cm avoids a visible pop at the patio edge.
  const edgeFade=clamp(edge/.60),smoothFade=edgeFade*edgeFade*(3-2*edgeFade);
  // The paved road finish and the operator's skinned sole both extend
  // slightly above the generic .19m collision-level walk surface.
  let clearance=.032;
  // Central paved circulation lane is finished at .21m.
  if(Math.abs(dx)<25.9&&Math.abs(dz-3)<4.8)clearance=.040;
  // Elevated protected pedestrian deck top is ~.315m, not the generic
  // .19m road support. This is a VISUAL boot correction only.
  if(Math.abs(dx)<24.9&&Math.abs(dz-20.2)<.84)clearance=.125;
  return clearance*smoothFade;
 }
 return 0;
}
