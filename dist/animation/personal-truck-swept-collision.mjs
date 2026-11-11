// DRILL RUN NEXT GENERATION · V61
// Vehicle-only swept collision sampler. The actor/mission state stays in M5.
// Fill in the FRONT, SIDES and CENTRE between former sparse 9-point probes
// and sweep the entire movement every ~0.12 m to stop tunnelling through rails.
const HALF_WIDTH=1.08,HALF_LENGTH=2.35;
const LONGITUDINAL=[-HALF_LENGTH,-1.55,-.78,0,.78,1.55,HALF_LENGTH];
const LATERAL=[-HALF_WIDTH,0,HALF_WIDTH];
export const PERSONAL_TRUCK_SWEEP_STEP=.12;
export function personalTruckFootprintProbes(heading){
 const c=Math.cos(heading),s=Math.sin(heading),points=[];
 for(const forward of LONGITUDINAL)for(const lateral of LATERAL){
  points.push([s*forward+c*lateral,c*forward-s*lateral]);
 }
 return points;
}
export function countPersonalTruckCollision(x,z,heading,blocked,limit=Infinity){
 const points=personalTruckFootprintProbes(heading);
 let hits=0;
 for(const [dx,dz] of points){
  if(blocked(x+dx,z+dz,.10)&&++hits>limit)return hits;
 }
 return hits;
}
export function sweptPersonalTruckCollision(x,z,nx,nz,heading,blocked,limit=0){
 const count=Math.max(1,Math.ceil(Math.hypot(nx-x,nz-z)/PERSONAL_TRUCK_SWEEP_STEP));
 let max=0,final=0;
 for(let i=1;i<=count;i++){
  const t=i/count;
  final=countPersonalTruckCollision(x+(nx-x)*t,z+(nz-z)*t,heading,blocked,limit);
  max=Math.max(max,final);
  if(max>limit)return {hits:max,final,blocked:true};
 }
 return {hits:max,final,blocked:false};
}
