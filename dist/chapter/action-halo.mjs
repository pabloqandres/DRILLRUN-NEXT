import * as T from '../vendor/three.module.js';
export const OBJECTIVE_COLORS={main:0xffc83d,secondary:0x2cdcf1,optional:0xff5ec6};
export const HALO_COLORS={ready:OBJECTIVE_COLORS.main,entry:OBJECTIVE_COLORS.main,blocked:0xee8866};
// Two small unlit surfaces. Alpha fades in height and radius; neither is a collider.
export function haloTextures(color=HALO_COLORS.ready){
 const rgb=[color>>16&255,color>>8&255,color&255],make=(w,h,alpha)=>{
  const pixels=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;pixels.set(rgb,i);pixels[i+3]=Math.round(255*Math.max(0,Math.min(1,alpha(x/(w-1),y/(h-1)))));}
  const texture=new T.DataTexture(pixels,w,h,T.RGBAFormat);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.needsUpdate=true;return texture;
 };
 return {floor:make(96,96,(u,v)=>{const r=Math.hypot(u-.5,v-.5)*2,t=Math.max(0,Math.min(1,(r-.84)/.12)),fade=1-t*t*(3-2*t);return fade*(.92*Math.exp(-(((r-.66)/.075)**2))+.30*Math.exp(-(((r-.66)/.24)**2)));}),rise:make(48,48,(u,v)=>(1-v)**2*.48*(.78+.22*Math.cos(u*Math.PI*24))),beam:make(32,96,(u,v)=>Math.exp(-(((u-.5)/.13)**2))*(1-v)**.8*.8)};
}
export class ActionHalo extends T.Group{
 constructor(color=HALO_COLORS.ready,{objective=false}={}){super();this.userData.isWorker=true;this.userData.actionHalo=true;this.color=null;this.floor=new T.Mesh(new T.CircleGeometry(.975,64));this.floor.rotation.x=-Math.PI/2;this.floor.position.y=.016;const height=objective?1.65:.72;this.rise=new T.Mesh(new T.CylinderGeometry(.63,.63,height,32,1,true));this.rise.position.y=height/2+.008;this.beams=[];this.rings=[];
  if(objective){
   for(let i=0;i<2;i++){const beam=new T.Mesh(new T.PlaneGeometry(.18,1.9));beam.position.y=.96;beam.rotation.y=i*Math.PI/2;this.beams.push(beam);this.add(beam);}
   // Real 3D beacon geometry: concentric ground rings make the destination visible
   // from oblique cameras. Purely visual — never registered as a collider.
   for(const [inside,outside,y]of[[1.025,1.075,.034],[.40,.44,.043]]){
    const ring=new T.Mesh(new T.RingGeometry(inside,outside,64));
    ring.rotation.x=-Math.PI/2;ring.position.y=y;ring.renderOrder=5;this.rings.push(ring);this.add(ring);
   }
  }
  this.add(this.floor,this.rise);this.setColor(color);this.renderOrder=4;}
 setColor(color){if(color===this.color)return;this.color=color;this.textures&&Object.values(this.textures).forEach(t=>t.dispose());this.textures=haloTextures(color);for(const [mesh,map]of [[this.floor,this.textures.floor],[this.rise,this.textures.rise],...this.beams.map(b=>[b,this.textures.beam])]){mesh.material?.dispose();mesh.material=new T.MeshBasicMaterial({color:0xffffff,map,transparent:true,opacity:.95,depthWrite:false,side:T.DoubleSide,toneMapped:false});mesh.material.userData.softHalo=true;mesh.castShadow=mesh.receiveShadow=false;mesh.renderOrder=4;}
  for(const ring of this.rings){
   ring.material?.dispose();
   ring.material=new T.MeshBasicMaterial({color,transparent:true,opacity:.66,depthWrite:false,depthTest:true,side:T.DoubleSide,toneMapped:false});
   ring.castShadow=ring.receiveShadow=false;
  }
 }
 animate(time){const breathe=.93+.07*Math.sin(time*1.8);this.floor.material.opacity=breathe;this.rise.material.opacity=.8+breathe*.15;this.rise.scale.y=1+Math.sin(time*1.2)*.04;for(let i=0;i<this.rings.length;i++){const ring=this.rings[i];ring.scale.setScalar(1+.028*Math.sin(time*1.35+i));ring.material.opacity=.55+.24*Math.sin(time*1.7+i*1.6);}}
 dispose(){for(const mesh of[this.floor,this.rise,...this.beams,...this.rings]){mesh.geometry.dispose();mesh.material.dispose();}Object.values(this.textures).forEach(t=>t.dispose());this.removeFromParent();}
}
