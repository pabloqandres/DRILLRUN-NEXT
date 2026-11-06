// Mission 4 — Parking spot for DrillTruck
// Adjacent to workshop, unlocked when workshop reaches Nv.2
import {workshopLevel} from '../mission3/inventory.mjs';

export const PARKING_POSITION={x:-13.5,z:-9.3};
export const PARKING_SIZE={w:3,d:5};

export function canBuildParking(s){
 if(workshopLevel(s)<2)return 'needsWorkshopNv2';
 if(!s.mission4)return 'missionNotActive';
 if(s.mission4.parkingBuilt)return 'alreadyBuilt';
 return null;
}

export function buildParking(s,now=Date.now()){
 const blocked=canBuildParking(s);
 if(blocked)throw new Error(blocked);
 s.mission4.parkingBuilt=true;
 s.mission4.parkingPosition={...PARKING_POSITION};
 return true;
}
