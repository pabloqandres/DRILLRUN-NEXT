// Mission 3 — 3D borehole markers in the east terrain zone
// Visual stakes/flags that show each borehole site and drilling progress.
import * as T from '../vendor/three.module.js';

const C={navy:0x233c53,yellow:0xf6bc43,steel:0x607983,orange:0xef8138,white:0xf2efe1,teal:0x67dfd0,dark:0x182c3b};

let gradient;
function getGradient(){
 if(!gradient){gradient=new T.DataTexture(new Uint8Array([85,85,85,255,170,170,170,255,255,255,255,255]),3,1,T.RGBAFormat);gradient.magFilter=T.NearestFilter;gradient.minFilter=T.NearestFilter;gradient.needsUpdate=true;}
 return gradient;
}
const matCache=new Map();
function mat(c){
 if(!matCache.has(c)){
  const metal=[C.steel,0x73858b,0x3c636e].includes(c);
  matCache.set(c,metal?new T.MeshStandardMaterial({color:c,roughness:.46,metalness:.38}):new T.MeshToonMaterial({color:c,gradientMap:getGradient()}));
 }return matCache.get(c);
}

/**
 * Creates a visual marker for a borehole site.
 * @param {string} boreholeId - e.g. 'BH-01'
 * @param {number} x
 * @param {number} z
 * @returns {T.Group}
 */
export function createBoreholeMarker(boreholeId,x,z){
 const g=new T.Group();g.name='borehole-'+boreholeId;g.position.set(x,0,z);

 // Ground pad (small concrete base)
 const pad=new T.Mesh(new T.CylinderGeometry(.6,.7,.1,8),mat(0x9faaa7));
 pad.position.y=.05;pad.receiveShadow=true;g.add(pad);

 // Stakes at cross (+) vertices — N, S, E, W
 const armLen=1.0;
 for(const [dx,dz] of [[0,-1],[0,1],[-1,0],[1,0]]){
  const stake=new T.Mesh(new T.CylinderGeometry(.025,.025,.9,6),mat(C.steel));
  stake.position.set(dx*armLen,.45,dz*armLen);stake.castShadow=true;g.add(stake);
  const tip=new T.Mesh(new T.CylinderGeometry(.03,.03,.15,6),mat(C.orange));
  tip.position.set(dx*armLen,.85,dz*armLen);g.add(tip);
 }

 // Yellow tape cross (+) connecting opposite stakes through center
 const tapeY=.7;
 // North-South arm
 const armNS=new T.Mesh(new T.BoxGeometry(.015,.04,armLen*2),mat(C.yellow));
 armNS.position.set(0,tapeY,0);g.add(armNS);
 // East-West arm
 const armEW=new T.Mesh(new T.BoxGeometry(armLen*2,.04,.015),mat(C.yellow));
 armEW.position.set(0,tapeY,0);g.add(armEW);

 // Center marker pole with flag
 const pole=new T.Mesh(new T.CylinderGeometry(.02,.02,1.6,6),mat(C.steel));
 pole.position.y=.8;pole.castShadow=true;g.add(pole);

 // Flag (small triangular pennant)
 const flagGeo=new T.BufferGeometry();
 const verts=new Float32Array([0,0,0, .4,-.05,0, 0,-.2,0]);
 flagGeo.setAttribute('position',new T.BufferAttribute(verts,3));
 flagGeo.computeVertexNormals();
 const flag=new T.Mesh(flagGeo,new T.MeshBasicMaterial({color:C.orange,side:T.DoubleSide}));
 flag.position.set(.02,1.5,0);flag.name='flag';g.add(flag);

 // ID label on a small sign
 const ca=document.createElement('canvas');ca.width=256;ca.height=64;
 const ctx=ca.getContext('2d');ctx.fillStyle='#233c53';ctx.fillRect(0,0,256,64);
 ctx.fillStyle='#f5f0df';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 36px Arial';ctx.fillText(boreholeId,128,32);
 const tex=new T.CanvasTexture(ca);tex.colorSpace=T.SRGBColorSpace;
 const sign=new T.Mesh(new T.PlaneGeometry(.5,.12),new T.MeshBasicMaterial({map:tex}));
 sign.position.set(0,.55,.82);g.add(sign);

 // Progress ring (initially invisible, shows depth %)
 const ringGeo=new T.RingGeometry(.35,.5,24);
 const ringMat=new T.MeshBasicMaterial({color:C.teal,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false});
 const ring=new T.Mesh(ringGeo,ringMat);
 ring.rotation.x=-Math.PI/2;ring.position.y=.12;ring.name='progressRing';ring.visible=false;g.add(ring);

 // Status indicator (idle/active/complete)
 g.userData.status='idle'; // idle | active | complete

 return g;
}

/**
 * Update the marker to show drilling progress.
 * @param {T.Group} marker
 * @param {number} progress - 0..1
 * @param {'idle'|'active'|'complete'} status
 */
export function updateMarkerProgress(marker,progress,status='idle'){
 if(!marker)return;
 const ring=marker.getObjectByName('progressRing');
 if(ring){
  ring.visible=progress>0;
  // Replace ring geometry to show partial fill
  if(progress>0&&progress<1){
   ring.geometry.dispose();
   ring.geometry=new T.RingGeometry(.35,.5,24,1,0,Math.PI*2*progress);
  }else if(progress>=1){
   ring.geometry.dispose();
   ring.geometry=new T.RingGeometry(.35,.5,24);
   ring.material.color.setHex(0x67dfd0);
  }
 }

 marker.userData.status=status;

 // Pulse the flag on active borehole
 const flag=marker.getObjectByName('flag');
 if(flag){
  if(status==='active')flag.material.color.setHex(C.yellow);
  else if(status==='complete')flag.material.color.setHex(C.teal);
  else flag.material.color.setHex(C.orange);
 }
}
