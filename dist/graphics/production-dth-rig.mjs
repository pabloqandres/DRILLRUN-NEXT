// DRILL RUN · visually distinct generic production DTH rig until original
// 68 MB user GLB is optimized for mobile. No competitor/trademark logos.
// Pure 3D scenery; location and ownership come from the real game state.
import * as T from '../vendor/three.module.js';

export const RC_RESERVE={x:-18,z:-9.3};
export const DTH_RESERVE={x:-23,z:-9.3};
const color={
 navy:0x203848,graphite:0x17262e,steel:0x607883,orange:0xe38b42,
 cream:0xd7d6ca,light:0xa5bfc7,white:0xf3efe6,earth:0x3b4e51
};
const mat={};
for(const [key,value] of Object.entries(color)){
 mat[key]=new T.MeshStandardMaterial({color:value,roughness:key==='steel'?.43:.71,metalness:key==='steel'?.43:.08,flatShading:true});
}
const b=(g,w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat[m]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
const c=(g,r,h,x,y,z,m,n=12)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,n),mat[m]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};

export function createDthProductionRig(){
 const g=new T.Group();g.name='production-dth-generic';
 // Robust twin-tracked undercarriage and heavyweight modular production deck
 for(const x of[-1.22,1.22]){
  b(g,.56,.56,3.6,x,.5,0,'graphite');
  for(let z=-1.45;z<=1.45;z+=.58){const wheel=c(g,.26,.56,x,.52,z,'steel',10);wheel.rotation.z=Math.PI/2;}
  for(let z=-1.7;z<=1.7;z+=.23)b(g,.66,.06,.13,x,.17,z,'earth');
 }
 b(g,3.05,.33,3.6,0,1.02,0,'steel');
 // Rear engine canopy, ventilation and sloped cab
 b(g,2.16,1.45,1.4,0,1.9,-.95,'cream');
 b(g,2.22,.16,1.5,0,2.68,-.95,'navy');
 for(let i=0;i<5;i++)b(g,.07,.65,.035,-.71+i*.35,1.92,-1.68,'graphite');
 b(g,1.1,1.55,1.1,-.92,1.9,.68,'orange');
 b(g,1.25,.12,1.2,-.92,2.75,.68,'navy');
 b(g,.05,.83,.95,-1.51,2.08,.65,'graphite');
 // Tall DTH production mast + feed rails, driven head and rod carriage
 const height=8.35;
 for(const x of[.34,1.02]){
  b(g,.19,height,.25,x,height/2+1.11,.78,'navy');
 }
 for(let y=1.4;y<height+1.12;y+=.6)b(g,.95,.09,.26,.68,y,.78,'steel');
 b(g,1.12,.38,.6,.68,height+1.2,.78,'orange');
 const hydraulic=c(g,.115,height*.7,1.2,height*.4+1.12,.42,'graphite');
 hydraulic.name='feed-hydraulic';
 const head=b(g,1.02,.71,.88,.68,4.3,.78,'orange');
 head.name='dthHead';
 const rod=c(g,.09,4.15,.68,2.22,.78,'light');
 rod.name='dthRod';
 // Heavy external stabilizers and staging worklights
 for(const x of[-1.52,1.52]){
  b(g,.52,.16,.72,x,.08,1.65,'graphite');
  const rod=c(g,.085,1.1,x,.55,1.65,'steel');
  rod.name='stabilizer';
 }
 const beacon=c(g,.13,.22,-.92,2.92,.68,'orange',10);
 beacon.name='rigBeacon';
 g.userData.dthReady=true;
 return g;
}
export function animateDthRig(group,dt,isProducing=false){
 if(!group)return;
 const head=group.getObjectByName('dthHead'),rod=group.getObjectByName('dthRod');
 if(!head||!rod)return;
 if(!isProducing){head.position.y+=(4.3-head.position.y)*Math.min(1,dt*3);return;}
 const t=(group.userData.drillTime||0)+dt*5.7;
 group.userData.drillTime=t;
 head.position.y=4.3+Math.sin(t)*.18;
 rod.rotation.y+=dt*11;
}
export function createMachineryStaging(){
 // An unprotected temporary worksite staging zone, NOT the future M5 fenced
 // equipment yard. Buildings, lighting and HSEC gates must be constructed later.
 const g=new T.Group();g.name='temporary-machinery-staging';
 const asphalt=new T.MeshStandardMaterial({color:0x38454a,roughness:1});
 const paint=new T.MeshStandardMaterial({color:0xe5b65e,roughness:1});
 for(const [x,z] of [[RC_RESERVE.x,RC_RESERVE.z],[DTH_RESERVE.x,DTH_RESERVE.z]]){
  const base=new T.Mesh(new T.BoxGeometry(4.5,.055,6),asphalt);
  base.position.set(x,.062,z);base.receiveShadow=true;g.add(base);
  for(const zOff of[-2.8,2.8]){
   const stripe=new T.Mesh(new T.BoxGeometry(4.3,.009,.11),paint);
   stripe.position.set(x,.099,z+zOff);g.add(stripe);
  }
  for(const xOff of[-2.12,2.12]){
   const stripe=new T.Mesh(new T.BoxGeometry(.11,.009,5.55),paint);
   stripe.position.set(x+xOff,.099,z);g.add(stripe);
  }
 }
 return g;
}
