// Mission 4 — Automated production zones
// Converts completed M3 boreholes into automated production zones.
import {BOREHOLE_SITES} from '../mission3/contracts.mjs';
import {averageHardness} from '../mission3/geology.mjs';

const fail=msg=>{throw new Error(msg);};

// Calculate geology quality for a zone (0..1) based on rock layers
// Higher quality = more copper-porphyry and deeper drilling
function calcGeologyQuality(borehole){
 if(!borehole?.geology?.strata)return 0.5;
 const strata=borehole.geology.strata;
 let copperMeters=0,totalMeters=0;
 for(const l of strata){
  const m=l.to-l.from;
  totalMeters+=m;
  if(l.rock==='copper-porphyry')copperMeters+=m;
  if(l.rock==='granodiorite')copperMeters+=m*0.3;
  if(l.rock==='diorite')copperMeters+=m*0.15;
 }
 const copperRatio=totalMeters>0?copperMeters/totalMeters:0;
 // Quality from 0.3 (no mineralization) to 1.0 (rich copper)
 return Math.min(1,0.3+copperRatio*2.5);
}

export function convertableBoreholes(s){
 if(!s.mission4)return [];
 const alreadyConverted=new Set(s.mission4.zones.map(z=>z.id));
 return (s.boreholes||[]).filter(b=>b.status==='completed'&&!alreadyConverted.has(b.id));
}

export function convertBoreholeToZone(s,boreholeId,now=Date.now()){
 if(!s.mission4)fail('missionNotActive');
 const bh=(s.boreholes||[]).find(b=>b.id===boreholeId);
 if(!bh)fail('boreholeNotFound');
 if(bh.status!=='completed')fail('boreholeNotComplete');
 if(s.mission4.zones.some(z=>z.id===boreholeId))fail('alreadyConverted');
 const site=BOREHOLE_SITES.find(bs=>bs.id===boreholeId);
 const zone={
  id:boreholeId,
  position:{x:site?.x||bh.position.x,z:site?.z||bh.position.z},
  status:'idle',          // idle | producing | maintenance
  geologyQuality:calcGeologyQuality(bh),
  depthReached:bh.depthDrilled,
  lastCycleAt:null,
  cycleCount:0,
  totalIncome:0,
  convertedAt:now
 };
 s.mission4.zones.push(zone);
 return zone;
}

export function availableZones(s){
 if(!s.mission4)return [];
 return s.mission4.zones.filter(z=>z.status!=='maintenance');
}

export function assignTruckToZone(s,zoneId,now=Date.now()){
 if(!s.mission4?.drillTruck)fail('noTruck');
 const truck=s.mission4.drillTruck;
 if(truck.state!=='parked')fail('truckBusy');
 const zone=s.mission4.zones.find(z=>z.id===zoneId);
 if(!zone)fail('zoneNotFound');
 truck.assignedZone=zoneId;
 truck.state='dispatched';
 truck.lastDispatchAt=now;
 return truck;
}

export function unassignTruck(s){
 if(!s.mission4?.drillTruck)return;
 const truck=s.mission4.drillTruck;
 truck.assignedZone=null;
 truck.state='parked';
 truck.position={x:-13.5,z:-9.3};
}

export function zoneById(s,zoneId){
 return s.mission4?.zones?.find(z=>z.id===zoneId)||null;
}
