// V66 — safe, once-per-return positioning. Never creates a vehicle or reward.
// Called only by the real Continue/restore path, never by a new avatar/intro.
import {CONFIG} from '../chapter/config.mjs';
import {FLEET_BAYS} from './fleet-base.mjs';
import {personalTruck} from './personal-drilltruck.mjs';
export const LONG_ABSENCE_MS=3.5*60*60*1000;
const near=(a,b,eps=.25)=>!!a&&Number.isFinite(a.x)&&Number.isFinite(a.z)&&
 Math.hypot(a.x-b.x,a.z-b.z)<=eps;
export function returnToWorksite(s,{now=Date.now(),previousSavedAt=s?.savedAt,thresholdMs=LONG_ABSENCE_MS}={}){
 if(!s||!Number.isFinite(now))return {returned:false,truck:false,operator:false};
 const previous=Number(previousSavedAt);
 const longAbsence=Number.isFinite(previous)&&previous>0&&now-previous>=thresholdMs;
 const truck=personalTruck(s),bay=FLEET_BAYS.personalTruck;
 let truckReturned=false,operatorReturned=false;
 if(truck){
  const oldPos=truck.position&&{...truck.position};
  const wasDriving=truck.mode==='driving';
  const atBay=near(truck.position,bay)&&Math.abs((truck.heading||0)-bay.heading)<.08;
  // Owned personal unit only. M4's automatic fleet is never referenced.
  if(!atBay||wasDriving){
   truck.position={x:bay.x,z:bay.z};truck.heading=bay.heading;
   truck.mode='parked';truck.speed=0;truck.steerAngle=0;
   truck.parkedAt=now;truck.recoveredAt=now;
   truckReturned=true;
  }
  // If the player closed the game at the wheel or beside a remotely parked
  // truck, don't abandon them in a distant pit after teleporting the vehicle.
  if(!longAbsence&&(wasDriving||oldPos&&near(s.position,oldPos,4.1))){
   s.position={x:bay.x-3.8,z:bay.z};s.inside=false;operatorReturned=true;
  }
 }
 if(longAbsence){
  // Landing at the actual office entrance is consistent across all missions.
  // The office may not yet be built in a fresh M1 save; its approach is clear.
  s.position={...CONFIG.officeSlot.access};s.inside=false;
  s.facing=Math.PI;operatorReturned=true;
 }
 return {returned:truckReturned||operatorReturned,truck:truckReturned,
  operator:operatorReturned,longAbsence,atP01:!!truck&&near(truck.position,bay)};
}
