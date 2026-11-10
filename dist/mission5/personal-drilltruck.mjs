// Mission 5 — second DrillTruck® dedicated exclusively to the player.
// Does not share any M4 maintenance dispatch, zone, position or earnings state.
import {DRILLTRUCK_COST} from '../mission4/drilltruck.mjs';
import {FLEET_BAYS} from './fleet-base.mjs';
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
export const personalTruckVisualSteer=horizontal=>
 -Math.max(-1,Math.min(1,Number(horizontal)||0));
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
 // Five-point swept footprint: no pass-through on fences, buildings, props.
 const front={x:Math.sin(heading)*PERSONAL_TRUCK_FOOTPRINT.halfLength,
  z:Math.cos(heading)*PERSONAL_TRUCK_FOOTPRINT.halfLength};
 const side={x:Math.cos(heading)*PERSONAL_TRUCK_FOOTPRINT.halfWidth,
  z:-Math.sin(heading)*PERSONAL_TRUCK_FOOTPRINT.halfWidth};
 const probes=[[0,0],[front.x,front.z],[-front.x,-front.z],
  [side.x,side.z],[-side.x,-side.z]];
 const collision=probes.some(([x,z])=>blocked(nx+x,nz+z,.38));
 if(!collision){truck.position.x=nx;truck.position.z=nz;truck.heading=heading;}
 else v=0; // Explicitly stop at solid obstacles instead of teleporting through
 truck.speed=v;
 s.position={...truck.position}; // Keep mission/POI distances tied to actual vehicle
 return {moving:Math.abs(v)>.05,blocked:collision,speed:v,heading:truck.heading,
  position:{...truck.position}};
}
