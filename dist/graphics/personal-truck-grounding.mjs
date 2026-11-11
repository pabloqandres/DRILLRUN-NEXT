// DRILL RUN NEXT GENERATION · V59
// Purely visual support height for the purchased personal DrillTruck®.
// No vehicle physics, collision footprint, save state or purchase values here.
export function visualTruckGroundHeight(position,heading,sampleGround,clearance=0){
 const x=position?.x,z=position?.z,yaw=Number.isFinite(heading)?heading:0;
 if(!Number.isFinite(x)||!Number.isFinite(z)||typeof sampleGround!=='function')return .12;
 // Ground contacts below the four tyre corners plus the vehicle centre.
 // Sampling in truck-local coordinates respects its rotation on ramps.
 const c=Math.cos(yaw),s=Math.sin(yaw);
 const contactPoints=[[0,0],[-.92,-1.72],[.92,-1.72],[-.92,1.72],[.92,1.72]];
 let support=-Infinity;
 for(const [px,pz] of contactPoints){
  const gx=x+px*c+pz*s,gz=z-px*s+pz*c;
  const v=sampleGround(gx,gz);
  if(Number.isFinite(v))support=Math.max(support,v);
 }
 const foot=Number.isFinite(support)?support:.12;
 const bottomOffset=Number.isFinite(clearance)?clearance:0;
 return foot+Math.max(0,bottomOffset)+.015;
}
