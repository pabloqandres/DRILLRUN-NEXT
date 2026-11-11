// Mission 5 — second DrillTruck® dedicated exclusively to the player.
// Does not share any M4 maintenance dispatch, zone, position or earnings state.
import {DRILLTRUCK_COST} from '../mission4/drilltruck.mjs';
import {FLEET_BAYS} from './fleet-base.mjs';
import {isPlayableTerrain} from '../chapter/navigation-areas.mjs';
import {warehouseChecked,commissionPatio} from './patio-staff.mjs';

export const PERSONAL_DRILLTRUCK_PRICE=DRILLTRUCK_COST;
export const PERSONAL_DRILLTRUCK_MODEL='drilltruck-personal';
export const PERSONAL_TRUCK_MAX_SPEED=8.3; // m/s (~30 km/h); walking is 2m/s
export const PERSONAL_TRUCK_MAX_REVERSE=2.8;
export const PERSONAL_TRUCK_ENTRY_RADIUS=3.7;
export const PERSONAL_TRUCK_FOOTPRINT=Object.freeze({halfWidth:1.08,halfLength:2.35});
// Driver's chase camera and the exported 3D vehicle are visually opposite
// to the legacy raw steering axis. Normalize one time for both touch and keys.
// Positive input is screen-right; rendered vehicle must visibly turn right.
export const personalTruckVisualSteer=horizontal=>{
 const input=Math.max(-1,Math.min(1,Number(horizontal)||0));
 return input===0?0:-input;
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export const personalTruck=s=>s?.mission5?.personalTruck||null;
export function personalTruckOrder(s){
 return (s?.orders||[]).find(o=>['pending','dispatched'].includes(o.status)&&
  o.items?.some(i=>i.category==='machinery'&&i.type==='drillTruckPersonal'))||null;
}
export function canOrderPersonalTruck(s){
 if(!s?.mission5||s.mission5.status!=='operational')return 'buildPatioFirst';
 if(s?.narrative&&!s.narrative.accepted?.includes('m5'))return 'acceptM5First';
 if(!s.mission4?.drillTruck)return 'needsAutoTruck';
 if(!warehouseChecked(s))return 'auditWarehouseFirst';
 if(personalTruck(s))return 'alreadyOwned';
 if(personalTruckOrder(s))return 'orderAlreadyPending';
 if(!Number.isFinite(s.cash)||s.cash<PERSONAL_DRILLTRUCK_PRICE+200)return 'noMoney';
 return null;
}
export function deliverPersonalTruck(s,now=Date.now()){
 if(!s?.mission5||s.mission5.status!=='operational')return null;
 if(s.mission5.personalTruck)return s.mission5.personalTruck; // idempotent paid order
 const bay=FLEET_BAYS.personalTruck;
 const truck={
  id:'drilltruck-personal-02',role:'personal',mode:'parked',
  position:{x:bay.x,z:bay.z},heading:bay.heading,
  speed:0,deliveredAt:now,parkedAt:now
 };
 s.mission5.personalTruck=truck;
 commissionPatio(s,now); // Sixth real M5 objective completes on delivery, not payment.
 return truck;
}
// Recover ownership only when the saved mission history proves that M5 was
// fully commissioned AND its completion was collected. A stray mission flag
// alone can never mint a second free vehicle or advance the storyline.
export function restoreMissingPersonalTruck(s,now=Date.now()){
 if(personalTruck(s)||s?.mission5?.status!=='operational')return false;
 if(!s.mission5.commissionedAt||!s.narrative?.rewardsCollected?.includes('m5'))return false;
 deliverPersonalTruck(s,now);
 s.mission5.personalTruck.restoredFromCompletedM5At=now;
 return true;
}
const finiteLocation=p=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
export function personalTruckAtPlayableLocation(truck){
 const p=truck?.position;
 if(!finiteLocation(p))return false;
 // Same visible terrain boundary as avatar, vehicles and save restoration.
 return isPlayableTerrain(p.x,p.z);
}
export function repairPersonalTruckPose(s,now=Date.now()){
 const truck=personalTruck(s);if(!truck||personalTruckAtPlayableLocation(truck))return false;
 const bay=FLEET_BAYS.personalTruck;
 truck.position={x:bay.x,z:bay.z};truck.heading=bay.heading;
 truck.speed=0;truck.mode='parked';truck.recoveredAt=now;
 // The player may have been inside the invalid-position truck on a
 // previous session. Reposition only if the saved avatar is also invalid.
 if(!isPlayableTerrain(s.position?.x,s.position?.z)){
  s.position={x:bay.x-3.8,z:bay.z};s.inside=false;
 }
 return true;
}
// Explicit valet recovery for a PAID/owned vehicle only. No new order, charge,
// duplicate entity, mission reward or maintenance event is generated.
export function recoverPersonalTruckToBay(s,now=Date.now()){
 const truck=personalTruck(s);
 if(!truck)throw new Error('notDelivered');
 if(Math.abs(truck.speed||0)>.42)throw new Error('stopFirst');
 const wasDriving=truck.mode==='driving';
 const bay=FLEET_BAYS.personalTruck;
 truck.position={x:bay.x,z:bay.z};truck.heading=bay.heading;
 truck.mode='parked';truck.speed=0;truck.parkedAt=now;truck.recoveredAt=now;
 if(wasDriving){s.position={x:bay.x-3.8,z:bay.z};s.inside=false;}
 return truck;
}
export function canEnterPersonalTruck(s){
 const truck=personalTruck(s);
 if(!truck)return 'notDelivered';
 if(truck.mode==='driving')return 'alreadyDriving';
 if(!s.position||dist(s.position,truck.position)>PERSONAL_TRUCK_ENTRY_RADIUS)return 'tooFar';
 return null;
}
export function enterPersonalTruck(s){
 const blocked=canEnterPersonalTruck(s);
 if(blocked)throw new Error(blocked);
 const truck=personalTruck(s);truck.mode='driving';truck.speed=0;
 s.position={...truck.position};
 return truck;
}
export function exitPositions(truck){
 if(!truck)return [];
 const {x,z}=truck.position,yaw=truck.heading;
 const side={x:Math.cos(yaw),z:-Math.sin(yaw)};
 return [2.45,-2.45].map(sideSign=>({
  x:x+side.x*sideSign,z:z+side.z*sideSign
 }));
}
export function exitPersonalTruck(s,location,now=Date.now()){
 const truck=personalTruck(s);
 if(!truck||truck.mode!=='driving')throw new Error('notDriving');
 if(Math.abs(truck.speed)>.42)throw new Error('stopFirst');
 if(!location||!Number.isFinite(location.x)||!Number.isFinite(location.z))throw new Error('noExitSpace');
 truck.mode='parked';truck.speed=0;truck.parkedAt=now;
 s.position={x:location.x,z:location.z};
 return truck;
}
export function drivePersonalTruck(s,{throttle=0,steer=0,brake=false}={},dt=0,blocked=()=>false){
 const truck=personalTruck(s);
 if(!truck||truck.mode!=='driving')return null;
 dt=clamp(Number(dt)||0,0,.08);
 throttle=clamp(Number(throttle)||0,-1,1);
 steer=clamp(Number(steer)||0,-1,1);
 let v=Number.isFinite(truck.speed)?truck.speed:0;
 if(brake)v+=clamp(-v,-16*dt,16*dt);
 else if(Math.abs(throttle)>.08)v+=throttle*(v>=0?4.1:3.4)*dt;
 else v+=clamp(-v,-2.7*dt,2.7*dt);
 v=clamp(v,-PERSONAL_TRUCK_MAX_REVERSE,PERSONAL_TRUCK_MAX_SPEED);
 if(Math.abs(v)<.045)v=0;
 let heading=Number.isFinite(truck.heading)?truck.heading:0;
 const wheel=1.05*clamp(Math.abs(v)/2.5,0,1);
 heading+=steer*wheel*dt*Math.sign(v||1);
 const dx=Math.sin(heading)*v*dt,dz=Math.cos(heading)*v*dt;
 const nx=truck.position.x+dx,nz=truck.position.z+dz;
 // Real 2.16 × 4.70 m footprint, not the avatar's radius. Road paint,
 // sidewalk markings and normal grade transitions are traversable, while the
 // caller still tests true structural footprints and the HSEC gate.
 const front={x:Math.sin(heading)*PERSONAL_TRUCK_FOOTPRINT.halfLength,
  z:Math.cos(heading)*PERSONAL_TRUCK_FOOTPRINT.halfLength};
 const side={x:Math.cos(heading)*PERSONAL_TRUCK_FOOTPRINT.halfWidth,
  z:-Math.sin(heading)*PERSONAL_TRUCK_FOOTPRINT.halfWidth};
 const probes=[[0,0],[front.x,front.z],[-front.x,-front.z],
  [side.x,side.z],[-side.x,-side.z],
  [front.x+side.x,front.z+side.z],[front.x-side.x,front.z-side.z],
  [-front.x+side.x,-front.z+side.z],[-front.x-side.x,-front.z-side.z]];
 // Gentle body tolerance (0.10 m). The old 0.38 m footprint margin
 // artificially widened the truck by 76 cm on narrow gate approaches.
 const occupied=(x,z)=>probes.reduce((n,[ox,oz])=>n+Number(!!blocked(x+ox,z+oz,.10)),0);
 const oldX=truck.position.x,oldZ=truck.position.z;
 const initial=occupied(oldX,oldZ);
 const full=occupied(nx,nz);
 let collision=full>0;
 let nextX=oldX,nextZ=oldZ;
 if(full===0||initial>0&&full<initial){ // Move free, or ESCAPE a pre-existing overlap.
  nextX=nx;nextZ=nz;
 }else if(Math.abs(v)>.05){
  // Slide parallel to walls/curbs instead of freezing when the bumper clips
  // the corner of a crosswalk fence. Never drive THROUGH physical barriers.
  const xHit=occupied(nx,oldZ),zHit=occupied(oldX,nz);
  const xOkay=xHit===0||(initial>0&&xHit<initial);
  const zOkay=zHit===0||(initial>0&&zHit<initial);
  if(xOkay&&(!zOkay||Math.abs(dx)>=Math.abs(dz)))nextX=nx;
  else if(zOkay)nextZ=nz;
  else if(xOkay)nextX=nx;
  else v=0;
 }
 if(nextX!==oldX||nextZ!==oldZ){
  truck.position.x=nextX;truck.position.z=nextZ;
  truck.heading=heading;
  if(collision)v*=.65; // Friction on the obstacle face, not an instant full brake.
 }else{
  // A stopped vehicle can reorient slightly to reverse out, but never rotate
  // into a WORSE footprint collision from the current saved location.
  const oldHeading=truck.heading;
  if(initial>0&&Math.abs(steer)>.12&&Math.abs(v)<.50)truck.heading=heading;
  else truck.heading=oldHeading;
  v=0;
 }
 truck.speed=v;
 s.position={...truck.position}; // Keep mission/POI distances tied to actual vehicle
 return {moving:Math.abs(v)>.05,blocked:collision,speed:v,heading:truck.heading,
  position:{...truck.position}};
}
