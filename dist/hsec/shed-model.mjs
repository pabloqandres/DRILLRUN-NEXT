import * as T from '../vendor/three.module.js';

// Detailed shed on the existing foundation. Accesses and saved asset coordinates stay intact.
// Primitives are batched by material by assetModel, including these trusses and fixtures.
export function buildShed({box,cyl,add,C,colliders,walls}){
 const beam=(a,b,width,color,depth=width)=>{
  const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
  const m=box(width,delta.length(),depth,0,0,0,color);
  m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
 };
 // Concrete slab, sealed joints and the protected edge of the workshop.
 box(6,.08,4.8,0,.04,0,C.silver);
 for(const x of[-1.5,0,1.5])box(.012,.003,4.7,x,.082,0,C.steel);
 for(const z of[-1.2,0,1.2])box(5.9,.003,.012,0,.083,z,C.steel);
 box(6,.13,.14,0,.045,2.4,C.steel);
 for(let x=-2.9;x<3;x+=.25){const m=box(.13,.012,.13,x,.12,2.39,C.yellow);m.rotation.y=-Math.PI/4;}
 // Corrugated steel: thin backing sheet plus distinct ribs and a darker lower flashing.
 box(6,2.88,.07,0,1.52,-2.38,C.cream);
 for(const side of[-1,1]){
  box(.07,2.88,4.8,side*2.98,1.52,0,C.cream);
  box(.09,.18,4.8,side*3.01,.17,0,C.steel);
  for(let z=-2.3;z<2.4;z+=.16)box(.035,2.78,.035,side*3.03,1.53,z,C.silver);
 }
 for(let x=-2.9;x<3;x+=.16)box(.035,2.78,.035,x,1.53,-2.43,C.silver);
 box(6,.18,.09,0,.17,-2.42,C.steel);
 // Front openings match the existing pedestrian and logistics colliders exactly.
 for(const [x,w]of[[-2.8,.4],[-1.48,.65],[2.75,.5]]){
  box(w,2.88,.08,x,1.52,2.4,C.cream);
  for(let q=x-w/2+.04;q<x+w/2;q+=.16)box(.03,2.7,.03,q,1.52,2.45,C.silver);
 }
 // Gable triangle at each end, with steel fascia on the two roof slopes.
 const triangle=()=>{
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-3,2.96,0,3,2.96,0,0,3.68,0,-3,2.96,-.07,3,2.96,-.07,0,3.68,-.07],3));
  geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,.5,1,0,0,1,0,.5,1],2));geo.setIndex([0,1,2,5,4,3,0,3,1,1,3,4,1,4,2,2,4,5,2,5,0,0,5,3]);geo.computeVertexNormals();return geo;
 };
 for(const z of[-2.4,2.4])add(triangle(),C.steel,0,0,z);
 // Portal frames with I-shaped columns, bolted feet, rafters and real triangulation.
 for(const z of[-2.28,0,2.3]){
  for(const side of[-1,1]){
   const x=side*2.88;box(.22,.07,.28,x,.12,z,C.steel);
   box(.055,2.92,.14,x,1.58,z,C.steel);for(const q of[-.065,.065])box(.17,2.92,.035,x,1.58,z+q,C.steel);
   for(const q of[-.065,.065])cyl(.018,.025,x+q,.168,z+.09,C.silver);
   beam([x,2.88,z],[0,3.61,z],.09,C.steel,.14);
   beam([side*2.1,2.88,z],[side*2.88,2.28,z],.07,C.steel);
  }
  beam([-2.88,2.88,z],[2.88,2.88,z],.06,C.steel);
  for(const x of[-2,-1,0,1,2]){
   const top=3.61-Math.abs(x)*.73/2.88;
   beam([x,2.9,z],[x,top,z],.035,C.silver);
   if(x<2)beam([x,2.9,z],[x+1,3.61-Math.abs(x+1)*.73/2.88,z],.032,C.silver);
  }
 }
 // Bracing stays against side walls, clear of both entrances and the work aisle.
 for(const side of[-1,1]){
  beam([side*2.91,.3,-2.2],[side*2.91,2.8,-.1],.032,C.silver);
  beam([side*2.91,2.8,-2.2],[side*2.91,.3,-.1],.032,C.silver);
 }
 // Sloping roof sheets, raised seams, ridge cap, gutters and downpipes.
 const pitch=Math.atan2(.75,3.18),slope=Math.hypot(3.18,.75);
 for(const side of[-1,1]){
  const roof=box(slope,.07,5.16,side*1.59,3.33,0,C.silver);roof.rotation.z=-side*pitch;
  for(let z=-2.52;z<2.56;z+=.24){const rib=box(slope,.024,.026,side*1.59,3.38,z,C.steel);rib.rotation.z=-side*pitch;}
  box(.09,.12,5.2,side*3.16,2.98,0,C.steel);
  cyl(.035,2.78,side*3.07,1.42,-2.28,C.steel);
  for(const z of[-2.58,2.58])beam([side*3.18,3,z],[0,3.75,z],.09,C.steel,.09);
 }
 box(.12,.09,5.24,0,3.75,0,C.steel);
 for(const x of[-1.7,1.7]){
  box(.5,.16,.52,x,3.47,-.65,C.steel);box(.63,.06,.65,x,3.6,-.65,C.silver);
 }
 // Rear shelving: feet, uprights, cross members and stored containers.
 for(const x of[-1.75,0,1.75]){
  for(const q of[-.7,.7])box(.055,1.8,.065,x+q,.99,-2.03,C.steel);
  for(const y of[.22,.88,1.55]){
   box(1.48,.07,.6,x,y,-2.01,C.yellow);box(1.4,.025,.55,x,y+.05,-2.01,C.silver);
   for(const q of[-.39,.33]){box(.48,.32,.43,x+q,y+.23,-2.01,C.orange);box(.12,.07,.015,x+q,y+.25,-1.785,C.white);}
  }
 }
 // A side workbench, tool board, drawers and a grounded cabinet.
 box(.58,.09,1.4,2.55,.92,-.3,C.silver);for(const z of[-.86,.26])box(.065,.8,.065,2.55,.46,z,C.steel);
 box(.44,.65,.55,2.55,.48,.05,C.steel);for(const y of[.3,.5,.7])box(.018,.028,.23,2.78,y,.05,C.silver);
 box(.055,.73,1.25,2.91,1.56,-.3,C.steel);
 for(let z=-.8;z<.3;z+=.2){beam([2.86,1.4,z],[2.86,1.72,z+.07],.025,C.silver);}
 box(.48,1.52,.4,-2.57,.84,-1,C.silver);box(.03,.1,.055,-2.31,.92,-.84,C.steel);
 // Pendant lamps with stems, reflectors and lenses; no floating geometry.
 for(const z of[-1.1,1.1])for(const x of[-1.3,1.3]){
  const top=3.55-Math.abs(x)*.73/3;beam([x,top,z],[x,2.67,z],.014,C.steel);
  add(new T.CylinderGeometry(.07,.23,.10,12),C.yellow,x,2.62,z);
  cyl(.19,.025,x,2.56,z,C.white);
 }
 // Yellow corner guards, safety equipment and exterior service bins.
 for(const x of[-2.83,2.83]){cyl(.06,.8,x,.46,2.47,C.yellow);cyl(.063,.12,x,.62,2.47,C.black);box(.19,.045,.2,x,.08,2.47,C.steel);}
 box(.31,.65,.12,2.74,1.05,2.51,C.orange);box(.21,.43,.025,2.74,1.08,2.59,C.white);
 for(const [z,c]of[[-.7,C.steel],[.05,C.green],[.8,C.yellow]]){
  box(.38,.65,.46,2.67,.42,z,c);box(.43,.06,.5,2.67,.78,z,c);
  for(const q of[-.12,.12])cyl(.055,.07,2.67+q,.1,z-.12,C.black);colliders.push({x:2.67,z,w:.43,d:.5});
 }
 // Real volumes for rear storage and workbench; retain the original wall access shapes.
 colliders.push(...walls,{x:2.55,z:-.3,w:.65,d:1.4},{x:-2.57,z:-1,w:.48,d:.4});
}
