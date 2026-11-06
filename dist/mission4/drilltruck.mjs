// Mission 4 — DrillTruck entity
// Purchase, state management, and lifecycle for the automated drill truck.

const fail=msg=>{throw new Error(msg);};

export const DRILLTRUCK_COST=12000;
export const DRILLTRUCK_GLB='assets3d/DRILLTRUCK_optimized.glb';

export function canPurchaseDrillTruck(s){
 if(!s.mission4)return 'missionNotActive';
 if(!s.mission4.parkingBuilt)return 'needsParking';
 if(!(s.personnel||[]).some(p=>p.role==='tecnicoDrillco'))return 'needsTecnico';
 if(s.mission4.drillTruck)return 'alreadyOwned';
 if(s.cash<DRILLTRUCK_COST)return 'noMoney';
 return null;
}

export function purchaseDrillTruck(s,paid=false,now=Date.now()){
 if(!paid){
  const blocked=canPurchaseDrillTruck(s);
  if(blocked)fail(blocked);
  s.cash-=DRILLTRUCK_COST;
  s.ledger.push({id:s.nextId++,key:'drillTruckPurchase',amount:-DRILLTRUCK_COST,at:now});
 }
 if(s.mission4?.drillTruck)return s.mission4.drillTruck;
 s.mission4.drillTruck={
  id:'drilltruck-01',
  state:'parked',
  assignedZone:null,
  position:{x:-13.5,z:-9.3},
  purchasedAt:now,
  lastDispatchAt:null,
  maintenancePhase:null,
  maintenanceStartedAt:null
 };
 return s.mission4.drillTruck;
}

export function drillTruckState(s){
 return s.mission4?.drillTruck?.state||null;
}

export function drillTruckInfo(s){
 return s.mission4?.drillTruck||null;
}
