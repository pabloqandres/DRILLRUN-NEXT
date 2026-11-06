// Mission 3 — Delivery vehicle (arrives with ordered materials)
// Animates a truck along a predefined route (Option B: snap routes).
import * as T from '../vendor/three.module.js';

const C={navy:0x233c53,dark:0x182c3b,cream:0xe3ddc9,yellow:0xf6bc43,steel:0x607983,orange:0xef8138,white:0xf2efe1};

let gradient;
function getGradient(){
 if(!gradient){gradient=new T.DataTexture(new Uint8Array([85,85,85,255,170,170,170,255,255,255,255,255]),3,1,T.RGBAFormat);gradient.magFilter=T.NearestFilter;gradient.minFilter=T.NearestFilter;gradient.needsUpdate=true;}
 return gradient;
}
const matCache=new Map();
function mat(c){
 if(!matCache.has(c)){
  const metal=[C.steel,0x73858b].includes(c);
  matCache.set(c,metal?new T.MeshStandardMaterial({color:c,roughness:.46,metalness:.38}):new T.MeshToonMaterial({color:c,gradientMap:getGradient()}));
 }return matCache.get(c);
}
function box(g,w,h,d,x,y,z,c){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cyl(g,r,h,x,y,z,c,r2=r,sides=12){const m=new T.Mesh(new T.CylinderGeometry(r2,r,h,sides),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}

// Predefined delivery route: enters from east, drives to workshop/shed area
const ROUTE_IN=[
 new T.Vector3(38,0,0),   // offscreen east
 new T.Vector3(28,0,0),
 new T.Vector3(16,0,-2),
 new T.Vector3(4,0,-6),
 new T.Vector3(-4,0,-7.5),
 new T.Vector3(-7.6,0,-6.2),  // workshop entrance
];
const ROUTE_OUT=[
 new T.Vector3(-7.6,0,-6.2),
 new T.Vector3(-4,0,-7.5),
 new T.Vector3(4,0,-6),
 new T.Vector3(16,0,-2),
 new T.Vector3(28,0,0),
 new T.Vector3(38,0,0),
];

/**
 * Creates the delivery truck model.
 * @returns {T.Group}
 */
export function createDeliveryVehicle(){
 const g=new T.Group();g.name='delivery-truck';g.visible=false;

 // === Chassis ===
 box(g,1.6,.3,3.2,0,.55,0,C.dark);

 // === Cab ===
 box(g,1.5,.9,1.2,0,1.2,1.3,C.yellow);
 // windshield
 const glass=new T.Mesh(new T.PlaneGeometry(1.1,.55),new T.MeshBasicMaterial({color:0x8fbdc4,transparent:true,opacity:.4,side:T.DoubleSide}));
 glass.position.set(0,1.45,1.92);g.add(glass);
 // roof
 box(g,1.55,.08,1.25,0,1.73,1.3,C.navy);
 // headlights
 for(const x of [-.5,.5])box(g,.2,.12,.05,x,.95,1.91,C.white);
 // bumper
 box(g,1.6,.15,.1,0,.5,1.95,C.steel);

 // === Cargo bed ===
 box(g,1.5,.12,1.8,0,.95,-.3,C.navy);
 // side walls
 for(const x of [-.75,.75])box(g,.08,.5,1.8,x,1.25,-.3,C.navy);
 // back wall
 box(g,1.5,.5,.08,0,1.25,-1.2,C.navy);
 // cargo items (crates)
 box(g,.6,.35,.5,-.3,1.3,-.1,0xbd9564);
 box(g,.5,.3,.4,.3,1.25,-.5,C.orange);

 // === Wheels (6 total) ===
 for(const z of [1.1,-.4,-1]){
  for(const x of [-.8,.8]){
   const wh=cyl(g,.3,.15,x,.35,z,C.dark,.3,10);
   wh.rotation.z=Math.PI/2;
   // hub cap
   cyl(g,.12,.16,x,.35,z,C.steel,.12,8).rotation.z=Math.PI/2;
  }
 }

 // === Sign ===
 const ca=document.createElement('canvas');ca.width=256;ca.height=64;
 const ctx=ca.getContext('2d');ctx.fillStyle='#f6bc43';ctx.fillRect(0,0,256,64);
 ctx.fillStyle='#233c53';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 32px Arial';ctx.fillText('DRILLCO® SUPPLY',128,32);
 const tex=new T.CanvasTexture(ca);tex.colorSpace=T.SRGBColorSpace;
 const sign=new T.Mesh(new T.PlaneGeometry(.9,.22),new T.MeshBasicMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
 sign.position.set(.76,1.1,-.3);sign.rotation.y=Math.PI/2;g.add(sign);

 // Animation state
 g.userData._delivery={active:false,route:null,index:0,t:0,phase:'idle',speed:4};

 return g;
}

/**
 * Start a delivery animation (truck drives in).
 * @param {T.Group} vehicle
 * @param {'in'|'out'} direction
 */
export function startDelivery(vehicle,direction='in'){
 if(!vehicle)return;
 vehicle.visible=true;
 const d=vehicle.userData._delivery;
 d.active=true;
 d.route=direction==='in'?ROUTE_IN:ROUTE_OUT;
 d.index=0;
 d.t=0;
 d.phase=direction;
 // Place at start
 vehicle.position.copy(d.route[0]);
 lookToward(vehicle,d.route[1]);
}

function lookToward(vehicle,target){
 const dir=new T.Vector3().subVectors(target,vehicle.position);
 if(dir.lengthSq()>.01)vehicle.rotation.y=Math.atan2(dir.x,dir.z);
}

/**
 * Update delivery animation each frame.
 * @param {T.Group} vehicle
 * @param {number} dt - delta time in seconds
 * @returns {'arrived'|'departed'|null} - event if state changed
 */
export function updateDelivery(vehicle,dt){
 if(!vehicle)return null;
 const d=vehicle.userData._delivery;
 // Auto-depart after parking for 3 seconds
 if(d.phase==='parked'){d.parkTimer=(d.parkTimer||0)+dt;if(d.parkTimer>=3){d.parkTimer=0;startDelivery(vehicle,'out');}return null;}
 if(!d.active||!d.route)return null;

 const from=d.route[d.index];
 const to=d.route[d.index+1];
 if(!to){
  // reached end of route
  d.active=false;
  if(d.phase==='in'){
   d.phase='parked';d.parkTimer=0;
   return 'arrived';
  }else{
   vehicle.visible=false;
   d.phase='idle';
   return 'departed';
  }
 }

 const segLen=from.distanceTo(to);
 const step=dt*d.speed/segLen;
 d.t+=step;

 if(d.t>=1){
  d.t=0;
  d.index++;
  vehicle.position.copy(to);
  if(d.route[d.index+1])lookToward(vehicle,d.route[d.index+1]);
  return null;
 }

 vehicle.position.lerpVectors(from,to,d.t);
 lookToward(vehicle,to);

 // Subtle bobbing for driving feel
 vehicle.position.y=Math.sin(d.t*Math.PI*3)*.03;

 return null;
}

/**
 * Send parked truck away (exit animation).
 * @param {T.Group} vehicle
 */
export function departDelivery(vehicle){
 if(!vehicle||vehicle.userData._delivery.phase!=='parked')return;
 startDelivery(vehicle,'out');
}
