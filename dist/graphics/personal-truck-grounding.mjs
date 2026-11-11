// DRILL RUN NEXT GENERATION · V60
// Purely visual wheel contact. Never change vehicle state, collision or saves.
// A single raised patch beside one tyre must not lift the ENTIRE chassis.
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
export function visualTruckGroundHeight(position,heading,sampleGround,modelMinY=0){
 const x=position?.x,z=position?.z,yaw=Number.isFinite(heading)?heading:0;
 if(!Number.isFinite(x)||!Number.isFinite(z)||typeof sampleGround!=='function')return .12;
 const center=sampleGround(x,z);
 const c=Math.cos(yaw),s=Math.sin(yaw);
 const wheelContacts=[[-.92,-1.72],[.92,-1.72],[-.92,1.72],[.92,1.72]];
 const heights=[];
 for(const [px,pz] of wheelContacts){
  const gx=x+px*c+pz*s,gz=z-px*s+pz*c;
  const v=sampleGround(gx,gz);
  if(Number.isFinite(v))heights.push(v);
 }
 heights.sort((a,b)=>a-b);
 const median=heights.length?heights[Math.floor((heights.length-1)/2)]*.5+
   heights[Math.floor(heights.length/2)]*.5:NaN;
 const base=Number.isFinite(center)?center:Number.isFinite(median)?median:.12;
 // Support mostly on the centre ground; adapt slightly to average tyre grade.
 // V59's maximum-wheel sampling caused the car to float over uneven sand.
 const grade=Number.isFinite(median)?clamp(median-base,-.12,.12)*.25:0;
 const surface=base+grade;
 const bottom=Number.isFinite(modelMinY)?modelMinY:0;
 return surface-bottom+.015;
}
