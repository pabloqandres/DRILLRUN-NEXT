// Mission 3 — 3D drill rig models (compact RC + advanced RC)
// Procedural geometry following scene.mjs cel-shading style.
import * as T from '../vendor/three.module.js';

const C={navy:0x233c53,dark:0x182c3b,cream:0xe3ddc9,yellow:0xf6bc43,steel:0x607983,orange:0xef8138,white:0xf2efe1};

// Shared gradient for MeshToonMaterial (3-step cel shading)
let gradient;
function getGradient(){
 if(!gradient){gradient=new T.DataTexture(new Uint8Array([85,85,85,255,170,170,170,255,255,255,255,255]),3,1,T.RGBAFormat);gradient.magFilter=T.NearestFilter;gradient.minFilter=T.NearestFilter;gradient.needsUpdate=true;}
 return gradient;
}
const matCache=new Map();
function mat(c){
 if(!matCache.has(c)){
  const metal=[C.steel,0x73858b,0x3c636e,0x233a46,0x536068,0x64737c].includes(c);
  matCache.set(c,metal?new T.MeshStandardMaterial({color:c,roughness:.46,metalness:.38}):new T.MeshToonMaterial({color:c,gradientMap:getGradient()}));
 }return matCache.get(c);
}
function box(g,w,h,d,x,y,z,c){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cyl(g,r,h,x,y,z,c,r2=r,sides=12){const m=new T.Mesh(new T.CylinderGeometry(r2,r,h,sides),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function beam(g,a,b,r,c){const mid=new T.Vector3().addVectors(new T.Vector3(...a),new T.Vector3(...b)).multiplyScalar(.5);const dir=new T.Vector3(...b).sub(new T.Vector3(...a));const m=cyl(g,r,dir.length(),...mid.toArray(),c);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m;}

/**
 * Creates a procedural RC drill rig model.
 * @param {'rig_rc_compact'|'rig_rc_advanced'} drillId
 * @returns {T.Group} - positioned at origin; caller places it in scene
 */
export function createDrillModel(drillId){
 const g=new T.Group();g.name='drill-'+drillId;
 const advanced=drillId==='rig_rc_advanced';
 const scale=advanced?1.15:1;
 const mastH=advanced?6.8:5.4;

 // === Tracked undercarriage ===
 for(const x of [-.9,.9]){
  box(g,.55,.5,2.8,x,.45,0,C.dark);
  for(let z=-1.1;z<=1.1;z+=.55){const wh=cyl(g,.25,.55,x,.45,z,0x57616a,.25,12);wh.rotation.z=Math.PI/2;}
  for(let z=-1.3;z<=1.3;z+=.2){box(g,.62,.06,.1,x,.74,z,0x303d47);box(g,.62,.06,.1,x,.18,z,0x303d47);}
 }

 // === Main platform ===
 box(g,1.9*scale,.3,2.6*scale,0,.88,0,C.steel);

 // === Engine housing (rear) ===
 box(g,1.5*scale,1*scale,1.4*scale,0,1.6,-.5,C.yellow);
 box(g,1.45*scale,.08,1.35*scale,0,2.18,-.5,0xffd06b);
 // exhaust pipe
 cyl(g,.07,.55,.65*scale,2.3,-.8,C.dark);
 // grille lines
 for(let i=0;i<4;i++)box(g,.03,.5,.03,-.5+i*.3,1.6,-1.18*scale,C.dark);

 // === Operator cabin ===
 box(g,.75*scale,.9,1.1*scale,-.55*scale,1.6,.65,C.yellow);
 // window (glass)
 const glass=new T.Mesh(new T.PlaneGeometry(.6*scale,.5),new T.MeshBasicMaterial({color:0x8fbdc4,transparent:true,opacity:.4,side:T.DoubleSide}));
 glass.position.set(-.55*scale,1.75,1.22*scale);g.add(glass);
 // cabin roof
 box(g,.85*scale,.08,1.2*scale,-.55*scale,2.14,.65,C.navy);

 // === Mast (drilling tower) ===
 const mastX=.45*scale;
 for(const dx of [-.2,.2]){
  box(g,.14,mastH,.2,mastX+dx,mastH/2+1.1,.1,C.navy);
 }
 // cross-members
 for(let y=1.4;y<mastH+1;y+=.6)box(g,.55,.09,.14,mastX,y,.1,C.yellow);
 // top cap
 box(g,.75,.25,.45,mastX,mastH+1.25,.1,C.yellow);
 // sheave wheel at top
 cyl(g,.15,.08,mastX,mastH+1.5,.1,C.steel);

 // === Feed cylinder (piston alongside mast) ===
 cyl(g,.08,mastH*.7,mastX,mastH*.4+1.1,-.15,0xaab6b2);

 // === Carriage (moves up/down on mast) ===
 const carriage=box(g,.6,.55,.55,mastX,3.2,.1,C.yellow);
 carriage.name='carriage';

 // === Drill shaft (extends below carriage) ===
 const shaft=cyl(g,.07,2,mastX,1.7,.1,C.steel);
 shaft.name='drillShaft';

 // === RC cyclone (reverse circulation separator) ===
 cyl(g,.2,.7,-.65*scale,1.65,-1,C.steel,.18,10);
 cyl(g,.08,.15,-.65*scale,2.05,-1,C.dark);

 // === Hydraulic hoses ===
 const hosePoints=[
  new T.Vector3(0,1.8,-.6),
  new T.Vector3(mastX-.1,2.8,-.2),
  new T.Vector3(mastX,mastH*.7,.1),
  new T.Vector3(mastX,mastH+.8,.1)
 ];
 for(let i=0;i<2;i++){
  const pts=hosePoints.map(p=>p.clone().add(new T.Vector3(i*.08,0,i*.06)));
  const tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,.035,5,false),mat(C.dark));
  g.add(tube);
 }

 // === Sign plate ===
 const label=advanced?'EXPLORA® RC-ADV':'EXPLORA® RC';
 const ca=document.createElement('canvas');ca.width=512;ca.height=128;
 const ctx=ca.getContext('2d');ctx.fillStyle='#233c53';ctx.fillRect(0,0,512,128);
 ctx.fillStyle='#f5f0df';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 52px Arial';ctx.fillText(label,256,64);
 const tex=new T.CanvasTexture(ca);tex.colorSpace=T.SRGBColorSpace;
 const signMesh=new T.Mesh(new T.PlaneGeometry(.9,.22),new T.MeshBasicMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
 signMesh.position.set(0,1.55,1.32*scale);g.add(signMesh);

 // === Safety cones at corners ===
 for(const [cx,cz] of [[-1.2,1.6],[1.2,1.6],[-1.2,-1.6],[1.2,-1.6]]){
  box(g,.3,.04,.3,cx,.04,cz,C.dark);
  cyl(g,.12,.45,cx,.26,cz,C.orange,.03,8);
  cyl(g,.08,.1,cx,.25,cz,C.white,.06,8);
 }

 // Advanced gets extra details
 if(advanced){
  // second cyclone
  cyl(g,.18,.6,.7*scale,1.65,-1,C.steel,.16,10);
  // tool rack
  box(g,.8,.1,.3,.85*scale,1.08,1.2,C.navy);
  for(let i=0;i<3;i++)cyl(g,.04,.35,.65*scale+i*.18,1.35,1.2,C.steel);
  // wider stabiliser pads
  for(const x of [-1.3,1.3])box(g,.5,.12,.5,x,.08,0,C.dark);
 }

 return g;
}

/**
 * Animate the drill rig each frame.
 * Moves carriage and shaft when drilling is active.
 */
export function animateDrill(model,dt,drilling=false){
 if(!model)return;
 const carriage=model.getObjectByName('carriage');
 const shaft=model.getObjectByName('drillShaft');
 if(!carriage||!shaft)return;

 // Store animation state on the model group
 if(!model.userData._anim)model.userData._anim={t:0,dir:1};
 const a=model.userData._anim;

 if(drilling){
  a.t+=dt*.3*a.dir;
  if(a.t>1){a.t=1;a.dir=-1;}
  if(a.t<0){a.t=0;a.dir=1;}
  const travel=1.8;
  carriage.position.y=3.2-a.t*travel;
  shaft.position.y=1.7-a.t*travel;
  // spin the shaft
  shaft.rotation.y+=dt*8;
 }
}
