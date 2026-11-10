// Mission 4 — DrillTruck route system
// Predefined waypoint routes from parking to each borehole zone.
// Route goes SOUTH of workshop to avoid building collisions.
import * as T from '../vendor/three.module.js';

// Parking position — exterior left of workshop
const PARKING=new T.Vector3(-13.5,0,-9.3);
const PATIO_PARKING=new T.Vector3(-65,0,-4);
// New M5 L1 fixed gate at (-24,-14), with adequate truck turning clearance.
const PATIO_SPINE=[
 new T.Vector3(-65,0,-14),new T.Vector3(-42,0,-14),
 new T.Vector3(-31,0,-14),new T.Vector3(-24,0,-14),
 new T.Vector3(-13.5,0,-14)
];
const RELOCATE_TO_PATIO=[PARKING,new T.Vector3(-13.5,0,-14),
 ...[...PATIO_SPINE].reverse(),PATIO_PARKING];

// Route: go south to clear workshop, then east along southern edge
const ROAD_SPINE=[
 new T.Vector3(-13.5,0,-14),   // south from parking
 new T.Vector3(-4,0,-14),      // east, clearing workshop south wall (z=-12)
 new T.Vector3(4,0,-13),       // continue east
 new T.Vector3(12,0,-10),      // curve northeast
 new T.Vector3(16,0,-6),       // approaching zone area
];

// A service truck stops in the western service lane, not on the borehole.
// RC/DTH rigs occupy the boreholes at x >= 20: a truck must never use a drill
// centre as its destination. Keep >= 4.5 m lateral clearance at every stop.
const SERVICE_LANE_X=15.0;
const ZONE_APPROACH={
 'BH-01':[new T.Vector3(SERVICE_LANE_X,0,4)],
 'BH-02':[new T.Vector3(SERVICE_LANE_X,0,1)],
 'BH-03':[new T.Vector3(SERVICE_LANE_X,0,-2)],
 'BH-04':[new T.Vector3(SERVICE_LANE_X,0,-5)],
 'BH-05':[new T.Vector3(SERVICE_LANE_X,0,-8)],
 'BH-06':[new T.Vector3(SERVICE_LANE_X,0,-8)]
};

function buildRoute(zoneId,direction,usePatio=false){
 if(direction==='relocate')return RELOCATE_TO_PATIO;
 const approach=ZONE_APPROACH[zoneId]||ZONE_APPROACH['BH-01'];
 const outbound=usePatio
  ?[PATIO_PARKING,...PATIO_SPINE,...ROAD_SPINE.slice(1),...approach]
  :[PARKING,...ROAD_SPINE,...approach];
 if(direction==='out')return outbound;
 return [...outbound].reverse();
}

// Route animation state stored on the truck model's userData
export function initTruckRouteState(model){
 model.userData._truckRoute={active:false,route:null,index:0,t:0,phase:'idle',speed:5};
}

export function startTruckRoute(model,zoneId,direction='out',usePatio=false){
 if(!model)return;
 const d=model.userData._truckRoute;
 d.active=true;
 d.route=buildRoute(zoneId,direction,usePatio);
 // A browser reload may interrupt relocation: continue from the truck's
 // persisted world position instead of teleporting to its obsolete home.
 if(direction==='relocate'&&model.position){
  const current=model.position.clone();
  let nearest=0,distance=Infinity;
  for(let i=0;i<d.route.length;i++){
   const score=current.distanceTo(d.route[i]);
   if(score<distance){distance=score;nearest=i;}
  }
  if(nearest>0&&nearest<d.route.length-1)
   d.route=[current,...d.route.slice(nearest+1)];
 }
 d.index=0;
 d.t=0;
 d.phase=direction;
 model.position.copy(d.route[0]);
 lookToward(model,d.route[1]);
 model.visible=true;
}

function lookToward(model,target){
 const dir=new T.Vector3().subVectors(target,model.position);
 if(dir.lengthSq()>.01)model.rotation.y=Math.atan2(dir.x,dir.z);
}

// Per-frame update — returns 'arrived'|'returned'|null
export function updateTruckRoute(model,dt){
 if(!model)return null;
 const d=model.userData._truckRoute;
 if(!d.active||!d.route)return null;

 const from=d.route[d.index];
 const to=d.route[d.index+1];
 if(!to){
  d.active=false;
  if(d.phase==='out'){
   d.phase='onsite';
   return 'arrived';
  }
  if(d.phase==='relocate'){
   d.phase='parked';
   return 'yard-arrived';
  }
  d.phase='parked';
  return 'returned';
 }

 const segLen=from.distanceTo(to);
 const step=dt*d.speed/Math.max(segLen,0.1);
 d.t+=step;

 if(d.t>=1){
  d.t=0;
  d.index++;
  model.position.copy(to);
  if(d.route[d.index+1])lookToward(model,d.route[d.index+1]);
  return null;
 }

 model.position.lerpVectors(from,to,d.t);
 lookToward(model,to);
 // Bobbing
 model.position.y=Math.sin(d.t*Math.PI*3)*.03;
 return null;
}

export function truckRouteActive(model){
 return model?.userData?._truckRoute?.active||false;
}

export function truckRoutePhase(model){
 return model?.userData?._truckRoute?.phase||'idle';
}
