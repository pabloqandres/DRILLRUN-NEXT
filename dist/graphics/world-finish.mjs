// DRILL RUN NEXT GENERATION · WORLD ART V4
// Visual-only detail layers shared by actual world buildings and their 3D previews.
// All meshes are decorative: no collider, walk surface, purchase, save or route writes.
import * as T from '../vendor/three.module.js';

function textureCanvas(size=256){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const c=canvas.getContext('2d');
 let seed=291751;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // Transparent flecks, cold mineral stains, scuffs and subdued aggregates.
 c.clearRect(0,0,size,size);
 for(let i=0;i<1200;i++){
  const x=random()*size,y=random()*size,r=.3+random()*2;
  c.fillStyle=random()>.48?'rgba(54,75,80,.12)':'rgba(239,227,195,.17)';
  c.beginPath();c.ellipse(x,y,r*(1+random()),r*.5,random()*6.28,0,Math.PI*2);c.fill();
 }
 for(let i=0;i<16;i++){
  const x=random()*size,y=random()*size,r=6+random()*26;
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,'rgba(58,70,72,.075)');g.addColorStop(1,'rgba(58,70,72,0)');
  c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
 }
 for(let i=0;i<7;i++){
  let x=random()*size,y=random()*size;
  c.beginPath();c.moveTo(x,y);
  for(let j=0;j<4;j++){x+=(random()-.5)*25;y+=5+random()*18;c.lineTo(x,y);}
  c.strokeStyle='rgba(51,67,69,.12)';c.lineWidth=.65;c.stroke();
 }
 const texture=new T.CanvasTexture(canvas);
 texture.wrapS=texture.wrapT=T.RepeatWrapping;
 texture.colorSpace=T.SRGBColorSpace;
 texture.anisotropy=4;
 return texture;
}
function shadowTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const c=canvas.getContext('2d'),g=c.createRadialGradient(64,64,7,64,64,63);
 g.addColorStop(0,'rgba(14,23,27,.41)');
 g.addColorStop(.45,'rgba(18,30,35,.27)');
 g.addColorStop(.78,'rgba(18,30,35,.11)');
 g.addColorStop(1,'rgba(18,30,35,0)');
 c.fillStyle=g;c.fillRect(0,0,128,128);
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
export function finishConcretePad(world,group,x,z,width,depth){
 world._v4ConcreteTex??=textureCanvas();
 const surface=new T.Mesh(
  new T.PlaneGeometry(width-.12,depth-.12),
  new T.MeshStandardMaterial({color:0xe0e1d7,map:world._v4ConcreteTex,transparent:true,opacity:.62,
   roughness:1,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})
 );
 surface.name='World Art V4 · mineral concrete surface';
 surface.rotation.x=-Math.PI/2;
 surface.position.set(x,.125,z);
 surface.receiveShadow=true;surface.castShadow=false;
 group.add(surface);
 // Small cold-joint seams/edge bevel hints, avoiding visible outer walls.
 const joint=new T.MeshBasicMaterial({color:0x52666a,transparent:true,opacity:.24,depthWrite:false});
 for(const side of[-1,1]){
  const edge=new T.Mesh(new T.BoxGeometry(width-.15,.006,.035),joint);
  edge.position.set(x,.130,z+side*(depth/2-.11));group.add(edge);
 }
 return surface;
}
export function softContactShadow(world,parent,width,depth,y=.024){
 world._v4ShadowTex??=shadowTexture();
 const mesh=new T.Mesh(
  new T.PlaneGeometry(width,depth),
  new T.MeshBasicMaterial({map:world._v4ShadowTex,transparent:true,opacity:.79,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})
 );
 mesh.rotation.x=-Math.PI/2;mesh.position.y=y;
 mesh.name='World Art V4 · soft ambient contact';
 mesh.renderOrder=1;mesh.castShadow=false;mesh.receiveShadow=false;
 parent.add(mesh);return mesh;
}
export function installMineralYard(world){
 // Low, flat gravel grains improve scale near the player without adding obstacles.
 // No false roads or invisible barriers. Scatters are confined to public exterior yard.
 const group=new T.Group();group.name='World Art V4 · yard mineral detail';
 const count=220,dummy=new T.Object3D(),geoms=new T.IcosahedronGeometry(.09,0);
 const material=new T.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,flatShading:true});
 const stones=new T.InstancedMesh(geoms,material,count);
 const hues=[0xb99d7e,0x907c6b,0x7d7870,0xd4b495,0x726f66];
 const hash=(i,k)=>{const n=Math.sin(i*112.31+k*317.7)*43758.5453;return n-Math.floor(n);};
 let placed=0;
 for(let i=0;i<2100&&placed<count;i++){
  const x=-16+hash(i,3)*41,z=-13+hash(i,5)*29;
  // Never put visible stones inside, on a building pad or along the office/taller passage.
  if(x>-9.7&&x<-2.4&&z>-3.8&&z<2.6)continue;
  if(x>-12.1&&x<-3.15&&z>-12.7&&z<-6.15)continue;
  if(x>-10.5&&x<-4.4&&z>-6.3&&z<-3.5)continue;
  if(x>12.0&&x<17.7&&z>-12&&z<-5.6)continue;
  const scale=.35+hash(i,7)*1.5;
  dummy.position.set(x,.04,z);dummy.rotation.set(0,hash(i,11)*6.283,0);
  dummy.scale.set(scale,.11+hash(i,13)*.15,scale*(.65+hash(i,17)*.5));
  dummy.updateMatrix();stones.setMatrixAt(placed,dummy.matrix);
  stones.setColorAt(placed,new T.Color(hues[Math.min(hues.length-1,Math.floor(hash(i,19)*hues.length))]));
  placed++;
 }
 stones.count=placed;stones.castShadow=false;stones.receiveShadow=false;
 stones.instanceMatrix.needsUpdate=true;
 if(stones.instanceColor)stones.instanceColor.needsUpdate=true;
 group.add(stones);world.scene.add(group);world.worldArtYard=group;
 return group;
}
