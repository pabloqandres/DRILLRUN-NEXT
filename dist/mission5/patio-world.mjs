// M5 · Fixed north-west industrial yard: detailed modular geometry and timed
// blueprint-to-commissioning visualisation. No equipment is ever created here.
// Heavy vehicles and DTH/RC stay in OPEN pads; only small fleet under roof.
import * as T from '../vendor/three.module.js';
import {ConstructionHologram} from '../chapter/construction-hologram.mjs';
import {PATIO_L1,patioProgress,patioState} from './patio-state.mjs';
import {gateShouldOpen,barrierBlocksPlayer} from './gate-control.mjs';
import {createPatioGateMotion,advancePatioGateMotion} from '../animation/patio-gate-motion.mjs';

// PUMA wine-red: shared with existing DRILLCO corporate structures, no neon red.
const C={red:0x701e30,redBright:0x96364a,ink:0x172e40,dark:0x243b4a,
 steel:0x657a86,aluminium:0x8296a1,white:0xf4eee3,concrete:0x85918f,
 road:0x3c474a,road2:0x4a5556,blue:0x56dcf8,yellow:0xebc45b,
 fence:0x8ba9aa,glass:0x89c9d4,light:0xffdda0,earth:0xb29a7c};
const matCache=new Map(),geoCache=new Map();
function mat(color){
 if(!matCache.has(color))matCache.set(color,new T.MeshToonMaterial({color,roughness:0.83}));
 return matCache.get(color);
}
function block(g,w,h,d,x,y,z,color,cast=false){
 const key=[w,h,d].join('_');
 if(!geoCache.has(key))geoCache.set(key,new T.BoxGeometry(w,h,d));
 const mesh=new T.Mesh(geoCache.get(key),mat(color));
 mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;g.add(mesh);
 return mesh;
}
function mark(g,x,z,w,d,color=C.yellow){
 const thick=.095,y=.26;
 block(g,w,.015,thick,x,y,z-d/2,color);
 block(g,w,.015,thick,x,y,z+d/2,color);
 block(g,thick,.015,d,x-w/2,y,z,color);
 block(g,thick,.015,d,x+w/2,y,z,color);
}
function stripes(g,ax,az,bx,bz,step=2,color=C.white){
 const dx=bx-ax,dz=bz-az,n=Math.max(1,Math.floor(Math.hypot(dx,dz)/step));
 for(let i=0;i<n;i++){
  const u=(i+.4)/n;
  const m=block(g,.13,.012,.9,ax+dx*u,.255,az+dz*u,color);
  m.rotation.y=Math.atan2(dx,dz);
 }
}
function roof(g,x,z,w,d,h){
 const edge=C.red,trim=C.dark;
 for(const px of[x-w/2+1,x+w/2-1])for(const pz of[z-d/2+1,z+d/2-1]){
  // Slim I-beam legs with footings, not monolithic blocks.
  block(g,.48,.20,.48,px,.29,pz,C.concrete);
  block(g,.23,h,.23,px,h/2+.20,pz,C.steel,true);
  block(g,.35,.09,.35,px,h+.17,pz,edge);
 }
 // Raised roof with corrugated seams and a complete perimeter fascia.
 block(g,w,.22,d,x,h+.20,z,C.aluminium,true);
 for(let rx=x-w/2+.6;rx<x+w/2-.4;rx+=1.22)
  block(g,.045,.052,d-.35,rx,h+.35,z,0xa5b1b5);
 for(const pz of[z-d/2,z+d/2]){
  block(g,w,.19,.22,x,h+.35,pz,edge,true);
  block(g,w,.045,.25,x,h+.21,pz,trim);
 }
 for(const px of[x-w/2,x+w/2])block(g,.18,.19,d,px,h+.32,z,edge);
 // Purlins and diagonal side-braces give the canopies structural depth.
 for(const pz of[z-d/2+1,z+d/2-1]){
  block(g,w-1.6,.11,.16,x,h-.12,pz,C.steel);
  for(const sx of[-1,1]){
   const b=block(g,.09,1.2,.12,x+sx*(w/2-1.35),h-.52,pz,C.dark);
   b.rotation.z=sx*.42;
  }
 }
 // Downpipe and gutter: stylised but structurally legible.
 block(g,w,.12,.20,x,h+.13,z+d/2,trim);
 block(g,.10,h-1,.11,x-w/2+1,(h+1)/2,z+d/2,C.steel);
}
// A single soft-pool texture gives every fixture a visible lit surface,
 // including distant lights disabled by the mobile dynamic-light budget.
let patioLightPoolTexture=null;
function patioLightPool(x,z,diameter=20){
 if(!patioLightPoolTexture){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=96;
  const ctx=canvas.getContext('2d');
  const glow=ctx.createRadialGradient(48,48,2,48,48,47);
  glow.addColorStop(0,'rgba(255,243,206,.83)');
  glow.addColorStop(.20,'rgba(255,228,163,.44)');
  glow.addColorStop(.55,'rgba(255,214,153,.15)');
  glow.addColorStop(1,'rgba(255,214,153,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,96,96);
  patioLightPoolTexture=new T.CanvasTexture(canvas);
 }
 const pool=new T.Mesh(new T.PlaneGeometry(diameter,diameter),
  new T.MeshBasicMaterial({map:patioLightPoolTexture,color:0xffebc6,
   transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,
   side:T.DoubleSide}));
 // Keep the halo ABOVE the asphalt (.18 m), painted lanes (.26 m)
 // and other paved surfaces, rather than hiding it inside the road mesh.
 pool.rotation.x=-Math.PI/2;pool.position.set(x,.295,z);pool.renderOrder=5;
 pool.name='Patio L1 · luz difusa sobre terreno';return pool;
}
function spotlight(g,x,z,h=6){
 block(g,.17,h,.17,x,h/2+.1,z,C.steel);
 block(g,1.3,.17,.32,x+.55,h+.14,z,C.steel);
 const lens=block(g,1,.08,.26,x+.62,h+.06,z,C.light);
 lens.material=new T.MeshBasicMaterial({color:0x77746b});
 // These fixtures light the ground, not merely resemble illuminated boxes.
 const light=new T.PointLight(0xffe6b2,0,34,2);
 light.name='Patio L1 · luminaria real';light.castShadow=false;
 light.position.set(x+.62,h-.06,z);g.add(light);
 const pool=patioLightPool(x+.62,z,31);g.add(pool);
 return {x,z,lens,light,pool};
}
// Economical roof worklight: luminous fixture, real light near the player,
// and a surface-height-corrected floor wash for distant mobile view.
function canopyWorklight(g,x,z,y=4.1,surface=.295){
 const lens=new T.Mesh(new T.BoxGeometry(1.65,.045,.38),
  new T.MeshBasicMaterial({color:0x55554f}));
 lens.position.set(x,y+.20,z);lens.name='Patio · plafón de trabajo';g.add(lens);
 const light=new T.PointLight(0xffedc1,0,17,2);
 light.name='Patio · iluminación interior funcional';light.castShadow=false;
 light.position.set(x,y-.35,z);g.add(light);
 const pool=patioLightPool(x,z,13);
 pool.position.y=surface;g.add(pool);
 return {x,z,lens,light,pool};
}
function fences(g){
 // Perimeter link-fence on slim wine-red poles with galvanized chain-link.
 // A single continuous gateway remains clear at east x=+27, z=-2..8.
 const X=27,Z=22,segments=[
  [-X,-Z,X,-Z],[-X,Z,X,Z],[-X,-Z,-X,Z],
  [X,-Z,X,-2],[X,8,X,Z]
 ];
 const wirePoints=[];
 for(const [ax,az,bx,bz] of segments){
  const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz);
  const ux=dx/length,uz=dz/length;
  const count=Math.ceil(length/3.15);
  for(let i=0;i<=count;i++){
   const u=i/count,px=ax+dx*u,pz=az+dz*u;
   block(g,.14,2.42,.14,px,1.40,pz,C.red,true);
   block(g,.26,.10,.26,px,.28,pz,C.concrete);
   block(g,.20,.10,.20,px,2.66,pz,C.dark);
  }
  for(const y of[.48,2.55]){
   const beam=block(g,.065,.08,length,(ax+bx)/2,y,(az+bz)/2,C.steel);
   beam.rotation.y=Math.atan2(dx,dz);
  }
  // Wire diamonds are drawn as one single line segment mesh, economical on mobile.
  const push=(u1,y1,u2,y2)=>{
   if(u1<0||u2>length||y1<.40||y2>2.46)return;
   wirePoints.push(ax+ux*u1,y1,az+uz*u1,ax+ux*u2,y2,az+uz*u2);
  };
  for(let u=0;u<length;u+=.46)for(let y=.48;y<2.1;y+=.46){
   push(u,y,u+.46,y+.46);
   push(u,y+.46,u+.46,y);
  }
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(wirePoints,3));
 const mesh=new T.LineSegments(geometry,new T.LineBasicMaterial({
  color:C.fence,transparent:true,opacity:.66,depthWrite:false
 }));
 mesh.name='Patio L1 · malla metálica continua';g.add(mesh);
}
function markings(g){
 block(g,54.4,.19,43.4,0,.085,0,C.road);
 block(g,52,.02,9.7,0,.20,3,C.road2);
 // Two-way, wide truck turning spine toward fixed east entrance.
 stripes(g,-24,3.2,23,3.2,4.5,C.yellow);
 for(const z of[-2,8])block(g,50,.015,.13,0,.25,z,C.yellow);
 // Heavy-equipment bays: open air, turning clearances 12–13m.
 for(const x of[-7,5,17])mark(g,x,-13,11.2,15.7,C.yellow);
 // RC and DTH open bays, no overhead canopies or fake static rigs.
 for(const x of[9.4,17.2])mark(g,x,15.25,6.6,10.3,C.yellow);
 // Personal DrillTruck® bay P01 near the gate, distinct from C03 automatic
 // service truck. Kept outside the heavy equipment pads and road spine.
 mark(g,20,-3.2,6.2,3.6,C.white);
 for(const x of[17.1,22.9])block(g,.14,.07,.42,x,.30,-4.9,C.yellow);
 // Roofed light fleet: six narrow slots only for pickups and DrillTruck.
 for(const x of[-23,-19.4,-15.8,-12.2,-8.6,-5]){
  mark(g,x,14.1,3.4,7.4,C.yellow);
 }
 // Segregated protected pedestrian route outside the truck turning spine.
 block(g,50,.10,1.7,0,.265,20.2,0x536b6b);
 for(let x=-23;x<24;x+=3)block(g,.25,1.12,.25,x,.74,18.75,C.yellow);
 for(let z=-1;z<8;z+=.75)block(g,2.8,.015,.36,21.5,.27,z,C.white);
}
function buildAccess(w,g){
 const q=new T.Group();q.name='M5 · caseta de acceso y control';g.add(q);
 // Guardhouse kept to the side of a 10m unobstructed portal.
 // Prefabricated insulated panels, recessed glazing and fitted entrance.
 block(q,4.2,3.1,4.6,24.0,1.75,13.9,C.ink,true);
 block(q,4.45,.12,4.85,24,3.43,13.9,C.dark);
 block(q,4.6,.26,5.0,24,3.61,13.9,C.red,true);
 for(const z of[12.3,14.9]){
  block(q,.075,1.38,1.55,26.16,2.15,z,C.steel);
  block(q,.085,1.18,1.38,26.23,2.18,z,C.glass);
  block(q,.11,.07,1.57,26.25,2.88,z,C.aluminium);
  block(q,.11,.07,1.57,26.25,1.49,z,C.aluminium);
  block(q,.08,.10,1.48,26.27,2.22,z,C.ink);
 }
 // Door on outward-facing wall, metal frame, handle, threshold and drip edge.
 block(q,1.12,2.18,.09,22.5,1.37,16.22,C.aluminium);
 block(q,.95,1.93,.10,22.5,1.39,16.28,C.dark);
 block(q,.075,.14,.08,22.83,1.25,16.38,C.steel);
 block(q,1.25,.08,.22,22.5,.30,16.31,C.concrete);
 block(q,1.75,.08,.22,22.5,2.57,16.35,C.red);
 // Vent slots and service housing; relief materials retain toon shading.
 for(let i=0;i<5;i++)block(q,1.28,.04,.07,24.6,2.72-i*.14,16.25,C.steel);
 block(q,1.4,.4,1.1,24.2,3.92,13.2,C.steel);
 for(let i=0;i<5;i++)block(q,1.18,.035,.82,24.2,4.15,12.84+i*.15,C.dark);
 block(q,1.2,.7,.95,25.9,.60,-1.2,C.red);
 const arm=new T.Group();arm.position.set(25.9,1.25,-1.2);q.add(arm);
 block(arm,.19,.16,8.7,0,0,4.35,C.white);
 for(let z=.65;z<8.7;z+=1.5)block(arm,.21,.18,.65,0,0,z,C.red);
 block(q,.6,.7,.45,25.9,.45,8.9,C.steel);
 return arm;
}
function buildCoveredFleet(w,g){
 const q=new T.Group();q.name='M5 · Techumbre solo camionetas y DrillTruck';g.add(q);
 roof(q,-14.4,14.1,22.7,11.8,4.65);
 return q;
}
function buildLogistics(w,g){
 const q=new T.Group();q.name='M5 · Galpón logístico y preparación';g.add(q);
 block(q,13,.28,13.5,-19,.34,-11.2,C.concrete);
 block(q,13.2,4.7,.24,-19,2.72,-18,C.white,true);
 for(const x of[-25.6,-12.4])block(q,.25,4.7,13.5,x,2.7,-11.2,C.white,true);
 roof(q,-19,-11.2,14.6,14.3,5.0);
 block(q,13.2,.55,.22,-19,4.28,-4.3,C.red,true);
 // Corrugation, foundations, roller door, side door and high windows.
 for(const x of[-25.35,-12.65])for(let z=-17.15;z<-5.1;z+=.72)
  block(q,.11,4.0,.035,x,2.90,z,C.aluminium);
 for(let x=-24.9;x<-13;x+=1.2)
  block(q,.045,3.2,.07,x,2.65,-18.18,C.aluminium);
 // Front loading door: side rails, lintel and raised grille, central opening clear.
 for(const x of[-22.9,-15.1])block(q,.17,4.15,.16,x,2.40,-4.20,C.steel);
 block(q,8.1,.19,.17,-19,4.52,-4.20,C.dark);
 for(let y=3.66;y<4.32;y+=.14)block(q,7.6,.05,.10,-19,y,-4.15,C.aluminium);
 block(q,2.1,2.8,.13,-24.2,1.75,-4.15,C.dark);
 block(q,.11,.16,.11,-23.45,1.35,-4.02,C.steel);
 for(const x of[-22.6,-16.1]){
  block(q,1.2,.9,.10,x,3.78,-18.14,C.ink);
  block(q,1.05,.70,.11,x,3.80,-18.06,C.glass);
  block(q,1.25,.08,.19,x,3.29,-17.98,C.steel);
 }
 // Workshop-level rainwater details and realistic pallet stops.
 block(q,14.2,.10,.23,-19,4.91,-4.20,C.dark);
 block(q,.11,4.0,.11,-25.3,2.85,-4.2,C.steel);
 for(const x of[-23.2,-19,-14.8])block(q,3.5,.16,.4,x,.41,-9.1,C.yellow);
 // Real physical racks and stacks: cosmetic, no free inventory.
 for(const x of[-23.2,-19,-14.8]){
  for(const y of[.9,1.95])block(q,3.4,.17,1.5,x,y,-13.6,C.steel);
  for(const z of[-14.1,-12.9])block(q,1.1,.75,.95,x,.58,z,0x94765b);
 }
 return q;
}
function buildFuel(w,g){
 const q=new T.Group();q.name='M5 · Combustible aislado HSEC';g.add(q);
 block(q,6.4,.22,10,1.5,.37,14.3,C.concrete);
 roof(q,1.5,14.3,6.4,10.4,4.6);
 for(const x of[.5,2.5]){
  block(q,1.05,2.0,1.1,x,1.40,15.0,C.red,true);
  block(q,.7,.62,.07,x,1.88,15.6,C.ink);
  block(q,.12,1.1,.11,x+.43,1.01,15.6,C.ink);
 }
 // Isolated fuel island with raised bund wall and checkered platform.
 for(const x of[-1.62,4.62])block(q,.17,.49,10.25,x,.63,14.3,C.concrete);
 for(const z of[9.22,19.38])block(q,6.45,.49,.15,1.5,.63,z,C.concrete);
 block(q,5.8,.55,2.5,1.5,.55,10.65,C.steel);
 const tank=new T.Mesh(new T.CylinderGeometry(1,1,5.8,14),mat(C.white));
 tank.rotation.z=Math.PI/2;tank.position.set(1.5,1.52,10.65);q.add(tank);
 block(q,5.8,.12,.15,1.5,2.2,10.65,C.red);
 // Tank saddles, meter shields, hose runs and rail barriers.
 for(const x of[-.35,3.35]){
  block(q,.38,.75,2.85,x,.95,10.65,C.dark);
  block(q,.43,.20,2.96,x,1.38,10.65,C.steel);
 }
 for(const x of[-1.25,4.25]){
  for(const z of[11.9,13.65,16.1,18.1])block(q,.08,1.15,.08,x,1.08,z,C.steel);
  block(q,.08,.10,6.2,x,1.55,15.0,C.steel);
  block(q,.08,.10,6.2,x,.90,15.0,C.steel);
 }
 for(const x of[.5,2.5]){
  block(q,.07,.37,.05,x+.26,1.24,15.67,C.steel);
  const hose=new T.Mesh(new T.TorusGeometry(.23,.035,5,10,Math.PI*1.4),mat(C.dark));
  hose.position.set(x+.45,1.38,15.6);q.add(hose);
 }
 return q;
}
// Physical detail without text-based signs: doors, gutters, frames and rails.
function yardDetail(g){
 // Low protective sidewalk handrail with deliberately clear pedestrian crossing.
 const fence=(z,from,to)=>{
  for(let x=from;x<to+.01;x+=2.5){
   block(g,.11,1.0,.11,x,.75,z,C.steel);
   block(g,.20,.08,.20,x,1.30,z,C.red);
  }
  block(g,to-from,.07,.08,(from+to)/2,1.22,z,C.steel);
  block(g,to-from,.07,.08,(from+to)/2,.70,z,C.steel);
 };
 fence(18.75,-24,18);
 // Safer rounded bollards at corners, offset from the truck turning spine.
 for(const [x,z] of [[-24,18],[-22,18],[-13,18],[-11,18],[8,18],[10,18],[23,10]]){
  block(g,.22,.80,.22,x,.66,z,C.yellow);
  block(g,.30,.12,.30,x,1.08,z,C.dark);
  block(g,.40,.10,.40,x,.26,z,C.concrete);
 }
 // Drainage grates and a realistic equipment turning apron.
 for(let x=-22;x<22;x+=3.1){
  block(g,1.55,.020,.11,x,.24,-3,C.steel);
  for(let k=-.60;k<=.60;k+=.30)block(g,.055,.025,.11,x+k,.255,-3,C.ink);
 }
 for(const z of[-19.5,19.5])for(const x of[-22,0,22]){
  block(g,1.25,.055,.22,x,.26,z,C.steel);
  for(let k=-.48;k<=.48;k+=.24)block(g,.05,.065,.21,x+k,.27,z,C.ink);
 }
 // Little corner protection rails and maintenance platforms.
 for(const x of[-25.3,-12.6]){
  block(g,.15,1.3,.15,x,.90,-4.15,C.red);
  block(g,.12,.10,2.4,x,1.55,-5.35,C.steel);
 }
}
function operationalDetails(w,g){
 fences(g);
 yardDetail(g);
 const lamps=[];
 for(const [x,z]of [[-24,-19],[-6,-19],[11,-19],[25,-19],[-24,19],[-7,19],[8,19],[25,19]])
  lamps.push(spotlight(g,x,z,6.4));
 for(let z=-17;z<-6;z+=2.3)block(g,.18,.65,.18,25,.48,z,C.yellow);
 for(const x of[-22,22])for(const z of[-17,17]){
  block(g,.38,1.15,.38,x,.70,z,C.red);
  block(g,.56,.1,.56,x,1.31,z,C.white);
 }
 return lamps;
}
function blueprint(w,root){
 const g=new T.Group();g.name='M5 · Holograma blueprint';root.add(g);
 const m=new T.LineBasicMaterial({color:C.blue,transparent:true,opacity:.85});
 const makeOutline=(x,z,ww,dd)=>{
  const pts=[new T.Vector3(x-ww/2,.33,z-dd/2),new T.Vector3(x+ww/2,.33,z-dd/2),
   new T.Vector3(x+ww/2,.33,z+dd/2),new T.Vector3(x-ww/2,.33,z+dd/2),
   new T.Vector3(x-ww/2,.33,z-dd/2)];
  g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),m));
 };
 makeOutline(0,0,54,44);
 for(const [x,z,ww,dd]of[[-14.4,14.1,22.7,11.8],[-19,-11.2,14.6,14.3],[1.5,14.3,6.4,10.4],
   [-7,-13,11.2,15.7],[5,-13,11.2,15.7],[17,-13,11.2,15.7],[15,15.25,21,10.3]])makeOutline(x,z,ww,dd);
 for(const x of[-27,27])for(const z of[-22,22])
  block(g,.32,.38,.32,x,.45,z,C.blue);
 return g;
}
function futurePlots(w){
 const g=new T.Group();g.name='Futuras ampliaciones bloqueadas';w.scene.add(g);
 // Reserved land: visible outlines, never functional or billed.
 const m=new T.LineDashedMaterial({color:0x8798a0,transparent:true,opacity:.56,dashSize:1,gapSize:1});
 for(const p of[{x:-105,z:-17,w:44,d:42,label:'PATIO L2 · BLOQUEADO'},
                 {x:-104,z:-65,w:44,d:42,label:'PATIO L3 · BLOQUEADO'}]){
  const pts=[new T.Vector3(p.x-p.w/2,.5,p.z-p.d/2),new T.Vector3(p.x+p.w/2,.5,p.z-p.d/2),
    new T.Vector3(p.x+p.w/2,.5,p.z+p.d/2),new T.Vector3(p.x-p.w/2,.5,p.z+p.d/2),
    new T.Vector3(p.x-p.w/2,.5,p.z-p.d/2)];
  const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),m);l.computeLineDistances();g.add(l);
  // Only a visual reservation. No colliders and no gameplay actions.
 }
 return g;
}
export function createPatioWorld(w){
 const root=new T.Group();root.name='M5 · Patio de Maquinarias L1';root.position.set(-51,0,-17);w.scene.add(root);
 const hologram=blueprint(w,root);
 const grading=new T.Group();grading.name='M5 · Suelo y vialidad';root.add(grading);markings(grading);
 const structures=new T.Group();root.add(structures);
 buildCoveredFleet(w,structures);
 buildLogistics(w,structures);
 buildFuel(w,structures);
 const access=buildAccess(w,structures);
 const final=new T.Group();root.add(final);const yardLamps=operationalDetails(w,final);
 // Task lighting underneath roofs, at logistics and at the single HSEC gate.
 const taskLights=[[-14.4,14.1,.295],[-19,-11.2,.525],[1.5,14.3,.525],[24,2.5,.295]].map(([x,z,floorY])=>{
  const light=new T.PointLight(0xffe9c6,0,19,2);
  light.name='Patio L1 · luz de trabajo';light.castShadow=false;
  light.position.set(x,3.65,z);final.add(light);
  const pool=patioLightPool(x,z,16);
  // The logistics and fuel concrete slabs rise to .48 m. The old .295 m
  // glow was hidden BELOW these surfaces even when lights were switched on.
  pool.position.y=floorY;
  final.add(pool);
  return {x,z,light,pool};
 });
 // Genuine fixtures under covered parking, logistics/tool storage and fuel.
 // Most lamps are visual-only at a distance; only the closest lamps consume
 // the mobile GPU dynamic-light budget.
 const canopyLights=[
  [-23,14.1,4.15,.295],[-17,14.1,4.15,.295],
  [-11,14.1,4.15,.295],[-5,14.1,4.15,.295],
  [-23,-11.2,4.55,.525],[-16,-11.2,4.55,.525],
  [1.5,14.3,4.10,.525]
 ].map(([x,z,height,floorY])=>canopyWorklight(final,x,z,height,floorY));
 // Broad pools on open heavy-machinery bays and the personal P01 stall.
 // These are inexpensive ground-lit passes from nearby perimeter floodlights,
 // not extra point lights or collision/mission objects.
 const bayPools=[
  [-7,-13,20,.295],[5,-13,20,.295],[17,-13,20,.295],
  [-17,3.2,18,.295],[0,3.2,21,.295],[16,3.2,20,.295],
  [20,-3.2,17,.295],[-20,13.5,17,.295],[-7,13.5,15,.295],
  [-19,-10.8,13,.525],[1.5,14.3,9,.525]
 ].map(([x,z,size,floorY])=>{
   const pool=patioLightPool(x,z,size);
   pool.position.y=floorY;final.add(pool);return pool;
  });
 const future=futurePlots(w);
 // The structural source is an exact clone of the final prefab modules,
 // local to the patio's centre. Holograms read its geometry only.
 const structuralSource=new T.Group();
 structuralSource.name='M5 · Fuente real para holograma arquitectónico';
 for(const part of [grading,structures,final])structuralSource.add(part.clone(true));
 let constructionHologram=null,previousState='',registered=false;
 const patioSolids=[];
 const barrier={x:PATIO_L1.gate.x,z:PATIO_L1.gate.z,w:.34,d:9.2,
  maxY:1.35,_patio:true,_patioBarrier:true};
 let barrierOpen=false;
 const gateMotion=createPatioGateMotion();
 function setBarrierBlocking(blocked){
  const i=w.colliders.indexOf(barrier);
  if(blocked&&i<0)w.colliders.push(barrier);
  else if(!blocked&&i>=0)w.colliders.splice(i,1);
 }
 function addPatioSolid(x,z,wid,dep,tag){
  const solid={x,z,w:wid,d:dep,_patio:true,_patioPart:tag};
  patioSolids.push(solid);w.colliders.push(solid);
 }
 const updateHologram=(s,now,info)=>{
  if(s.mission5?.status!=='building'){
   if(constructionHologram){constructionHologram.finish(now/1000);
    if(!constructionHologram.update(now/1000,1,
      {quality:w.quality,resolution:w.renderer.domElement})){
     constructionHologram.dispose();constructionHologram=null;
    }
   }
   return;
  }
  if(!constructionHologram){
   // Exactly the Office L1 effect, now around the REAL full-size patio.
   constructionHologram=new ConstructionHologram(structuralSource,{
    software:w.renderer.isSoftwareRenderer,quality:w.quality,
    footprint:{width:PATIO_L1.width,depth:PATIO_L1.depth}
   });
   root.add(constructionHologram);
  }
  constructionHologram.update(now/1000,info.progress,
    {quality:w.quality,resolution:w.renderer.domElement});
 };
 return {
  root,access,future,structuralSource,
  update(s,now=Date.now()){
   const status=patioState(s),enabled=!!(s?.mission4?.phase==='complete');
   if(!enabled){root.visible=false;future.visible=false;w.yardL1Open=false;return;}
   root.visible=true;future.visible=status!=='locked';
   const info=patioProgress(s,now);
   // Mirror the HSEC day/night sun cycle, with an Android-friendly budget
   // of powered lamps near the player/driver rather than eight shadow maps.
   const hour=(10+(s.hsec?.time||0)/600*24)%24;
   const night=status==='operational'&&(hour>=19||hour<6);
   const pos=s.mission5?.personalTruck?.mode==='driving'
    ?s.mission5.personalTruck.position:s.position||PATIO_L1.center;
   const distance=l=>Math.hypot(pos.x-(PATIO_L1.center.x+l.x),pos.z-(PATIO_L1.center.z+l.z));
   const budget=w.quality==='low'?3:w.quality==='high'?6:4;
   const nearest=night?new Set([...yardLamps].sort((a,b)=>distance(a)-distance(b)).slice(0,budget)):new Set();
   for(const lamp of yardLamps){
    const selected=nearest.has(lamp);
    // Real local illumination on the nearest fixtures; all night fixtures
    // retain a faint baked pool so unselected lights never look dead.
    lamp.light.intensity=night?(selected?(w.quality==='low'?40:56):(w.quality==='low'?0:11)):0;
    lamp.lens.material.color.setHex(night?0xffebba:0x77746b);
    lamp.pool.material.opacity=night?(selected?.76:.47):0;
   }
   const taskBudget=w.quality==='low'?1:2;
   const closestTasks=night?new Set([...taskLights].sort((a,b)=>distance(a)-distance(b)).slice(0,taskBudget)):new Set();
   for(const lamp of taskLights){
    const selected=closestTasks.has(lamp);
    lamp.light.intensity=night?(selected?(w.quality==='low'?24:33):(w.quality==='low'?0:7)):0;
    lamp.pool.material.opacity=night?(selected?.68:.45):0;
   }
   const canopyBudget=w.quality==='low'?1:w.quality==='high'?4:2;
   const closestCanopy=night?new Set([...canopyLights]
    .sort((a,b)=>distance(a)-distance(b)).slice(0,canopyBudget)):new Set();
   for(const lamp of canopyLights){
    const selected=closestCanopy.has(lamp);
    lamp.light.intensity=night?(selected?(w.quality==='low'?28:41):(w.quality==='low'?0:8)):0;
    lamp.lens.material.color.setHex(night?0xfff1cb:0x55554f);
    lamp.pool.material.opacity=night?(selected?.72:.50):0;
   }
   // The full surface is visibly lit even in low-quality Android mode,
   // while only nearby fixtures add real expensive per-pixel lighting.
   for(const pool of bayPools)pool.material.opacity=night?.62:0;
   const stateKey=status+':'+info.phase;
   if(stateKey!==previousState){
    previousState=stateKey;
    // The old 2D wireframe is only a survey outline before purchase.
    // During construction the real Office L1 hologram (below) scans the
    // actual building meshes, while physical modules mount progressively.
    hologram.visible=status==='locked';
    grading.visible=status==='operational'||(status==='building'&&info.progress>=.10);
    structures.visible=status==='operational'||(status==='building'&&info.progress>=.38);
    final.visible=status==='operational'||(status==='building'&&info.progress>=.91);
    w.yardL1Open=enabled;
    // Once grading is visible (from 10% of the build), support the player's
    // feet on the actual 19cm-high yard surface, not on the buried sand.
    if(grading.visible&&!w._patioGradingWalk){
     w._patioGradingWalk=true;
     w.walkSurfaces??=[];
     w.walkSurfaces.push({x:PATIO_L1.center.x,z:PATIO_L1.center.z,w:54.4,d:43.4,y:.19,_patioL1:true});
    }
   }
   if(status==='operational'&&!registered){
    registered=true;
    // Static walls are actual collision boundaries with a single 10m-wide
    // east gate. Clear the gate route, work areas and all pedestrian lanes.
    for(const [ax,az,bx,bz]of[
     [-27,-22,27,-22],[-27,22,27,22],[-27,-22,-27,22],
     [27,-22,27,-2],[27,8,27,22]
    ])w.registerBoundary(root,ax,az,bx,bz,.20,'patio-fence');
    for(const [x,z,wid,dep,tag] of[
     [-70,-28.2,13.2,13.5,'galpon'],
     [-27,-3.1,4.2,4.6,'caseta'],
     [-49.5,-2.7,6.4,10,'combustible']
    ])addPatioSolid(x,z,wid,dep,tag);
    // Canopy posts are separate collision footprints; structural walls
    // and roof solids never block the gate's 10 m road clearance.
    for(const [cx,cz,wide,deep] of[
     [-14.4,14.1,22.7,11.8],[-19,-11.2,14.6,14.3],[1.5,14.3,6.4,10.4]
    ])for(const px of[cx-wide/2+1,cx+wide/2-1])
       for(const pz of[cz-deep/2+1,cz+deep/2-1]){
        addPatioSolid(PATIO_L1.center.x+px,PATIO_L1.center.z+pz,.38,.38,'canopy-post');
       }
    setBarrierBlocking(true);
    w.walkSurfaces??=[];
    if(!w._patioGradingWalk){
     w._patioGradingWalk=true;
     w.walkSurfaces.push({x:PATIO_L1.center.x,z:PATIO_L1.center.z,w:54.4,d:43.4,y:.19,_patioL1:true});
    }
    // Real fixed road connector, from the single gate to the M4 road spine.
    const connector=new T.Group();connector.name='Patio L1 · conector vial';
    w.scene.add(connector);
    block(connector,11.4,.13,8.5,-18.6,.07,-14,C.road);
    for(const z of[-18.05,-9.95])block(connector,11.4,.016,.10,-18.6,.16,z,C.yellow);
    w.walkSurfaces.push({x:-18.6,z:-14,w:11.4,d:8.5,y:.17});
   }
   if(status==='building'){
    // Blueprint -> graded earth -> assembly -> HSEC. The same physical
    // modular parts become solid in this order, never all at once at 30%.
    for(const [index,part] of structures.children.entries())
      part.visible=info.progress>=.38+index*.12;
   }else if(status==='operational'){
    for(const part of structures.children)part.visible=true;
   }
   updateHologram(s,now,info);
   // Vehicle route triggers remain unchanged, but the player's symmetric
   // sensor opens the boom on approach from either side and closes on exit.
   const truck=s.mission4?.drillTruck;
   const truckNear=!!truck?.position&&
    Math.hypot(truck.position.x-PATIO_L1.gate.x,truck.position.z-PATIO_L1.gate.z)<15;
   const driverTruck=s.mission5?.personalTruck;
   const personalNear=driverTruck?.mode==='driving'&&
    Math.hypot(driverTruck.position.x-PATIO_L1.gate.x,
     driverTruck.position.z-PATIO_L1.gate.z)<15;
   barrierOpen=gateShouldOpen({
    position:status==='operational'&&!s.inside?s.position:null,
    wasOpen:barrierOpen,vehicleNear:truckNear||personalNear,
    routeInUse:!!w.fleetGateInUse
   })&&status==='operational';
   // V59: full boom travel is 1.6 seconds at any frame rate, with a short
   // open hold after the sensors release; collision stays until clearance.
   access.rotation.x=advancePatioGateMotion(gateMotion,barrierOpen,now);
   if(registered)setBarrierBlocking(barrierBlocksPlayer(access.rotation.x));
  },
  dispose(){
   constructionHologram?.dispose();setBarrierBlocking(false);
   for(const solid of patioSolids){const i=w.colliders.indexOf(solid);if(i>=0)w.colliders.splice(i,1);}
   root.removeFromParent();future.removeFromParent();
  }
 };
}
