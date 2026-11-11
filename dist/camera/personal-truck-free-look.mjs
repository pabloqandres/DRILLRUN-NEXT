// DRILL RUN NEXT GENERATION · V58
// Independent exterior camera orbit for personal DrillTruck® 02.
// Does not touch the vehicle heading, controls, mission state or save format.
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const BASE_HORIZONTAL=10.7;
const BASE_HEIGHT=7.2;
const BASE_ELEVATION=Math.atan2(BASE_HEIGHT,BASE_HORIZONTAL);
const BASE_DISTANCE=Math.hypot(BASE_HORIZONTAL,BASE_HEIGHT);
const wrap=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));
export class PersonalTruckFreeLook {
 constructor(){this.reset();}
 reset(){this.yaw=0;this.pitch=0;this.zoom=1;}
 // Same visual drag directions and sensitivity as avatar rotateOrbit().
 rotate(dx,dy,sensitivity=1){
  const scale=Number.isFinite(sensitivity)?clamp(sensitivity,.2,3):1;
  const mx=Number.isFinite(dx)?dx:0,my=Number.isFinite(dy)?dy:0;
  this.yaw=wrap(this.yaw-mx*.005*scale);
  this.pitch=clamp(this.pitch+my*.003*scale,-.26,.34);
 }
 zoomBy(delta){
  if(!Number.isFinite(delta))return;
  this.zoom=clamp(this.zoom*Math.exp(-delta*1.1),.65,1.55);
 }
 // Return a read-only view description; the 3D renderer owns interpolation.
 // Relative yaw follows the current truck heading while leaving steering alone.
 view(position,heading=0){
  const bearing=(Number.isFinite(heading)?heading:0)+this.yaw;
  const elevation=BASE_ELEVATION+this.pitch;
  const distance=BASE_DISTANCE*this.zoom;
  const horizontal=Math.cos(elevation)*distance;
  return {
   target:{x:position.x,y:1.8,z:position.z},
   offset:{
    x:-Math.sin(bearing)*horizontal,
    y:Math.sin(elevation)*distance,
    z:-Math.cos(bearing)*horizontal
   }
  };
 }
}
