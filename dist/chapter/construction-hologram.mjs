import * as T from '../vendor/three.module.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

export const HOLOGRAM_STYLE={color:0x28dcff,edge:0x66eaff,scanSeconds:4.8,fadeSeconds:.6,edgeBudget:{low:350,balanced:650,high:950}};
const clamp=v=>Math.max(0,Math.min(1,v));
export function hologramEnvelope(time,progress=0){
 const p=clamp(progress),phase=((time%HOLOGRAM_STYLE.scanSeconds)+HOLOGRAM_STYLE.scanSeconds)%HOLOGRAM_STYLE.scanSeconds/HOLOGRAM_STYLE.scanSeconds;
 return {phase,bodyOpacity:.035+p*.03,edgeOpacity:.57+.04*Math.sin(time*1.6),scanOpacity:.65+.12*Math.sin(Math.PI*phase),progress:p};
}
// Bake copies into the building's own local space; never retain/dispose original geometry/materials.
export function hologramGeometry(source,budget=1400){
 source.updateWorldMatrix(true,true);const inverse=source.matrixWorld.clone().invert(),surfaces=[],segments=[],seen=new Set();
 source.traverse(o=>{
  if(!o.isMesh||!o.geometry?.attributes.position||o.userData?.hologramExclude)return;
  // Planning labels and brand planes are not part of the construction structure.
  if(/Identificación de zonas|PNG original|PLANTA LIBRE/i.test(o.name))return;
  for(let parent=o.parent;parent&&parent!==source;parent=parent.parent)if(/Identificación de zonas|09 · Instalaciones|08 · Zócalos/i.test(parent.name))return;
  const relative=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld),copy=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();copy.applyMatrix4(relative);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',copy.attributes.position.clone());copy.dispose();surfaces.push(geometry);
  const edges=new T.EdgesGeometry(geometry,35),a=edges.attributes.position;
  for(let i=0;i<a.count;i+=2){const start=new T.Vector3().fromBufferAttribute(a,i).multiplyScalar(25).round().multiplyScalar(.04),end=new T.Vector3().fromBufferAttribute(a,i+1).multiplyScalar(25).round().multiplyScalar(.04),length=start.distanceToSquared(end);if(length<.0144)continue;
   const key=[start.toArray().map(n=>n.toFixed(3)).join(','),end.toArray().map(n=>n.toFixed(3)).join(',')].sort().join('|');if(seen.has(key))continue;seen.add(key);segments.push({start,end,length});
  }edges.dispose();
 });
 const surface=surfaces.length?mergeGeometries(surfaces,false):new T.BufferGeometry();surfaces.forEach(g=>g.dispose());surface.computeBoundingBox();
 const selected=segments.sort((a,b)=>b.length-a.length).slice(0,budget),positions=[];for(const e of selected)positions.push(...e.start.toArray(),...e.end.toArray());
 const edges=new T.BufferGeometry();edges.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 return {surface,edges,edgeCount:selected.length,bounds:surface.boundingBox?.clone()||new T.Box3(new T.Vector3(-1,0,-1),new T.Vector3(1,2,1))};
}
function glowGeometry(edges){
 const position=[],other=[],side=[],profile=[],p=edges.attributes.position;
 for(let i=0;i<p.count;i+=2){const a=[p.getX(i),p.getY(i),p.getZ(i)],b=[p.getX(i+1),p.getY(i+1),p.getZ(i+1)];
  for(const [end,s]of[[0,-1],[0,1],[1,1],[0,-1],[1,1],[1,-1]]){position.push(...(end?b:a));other.push(...(end?a:b));side.push(end?-s:s);profile.push(s);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(position,3));g.setAttribute('other',new T.Float32BufferAttribute(other,3));g.setAttribute('side',new T.Float32BufferAttribute(side,1));g.setAttribute('profile',new T.Float32BufferAttribute(profile,1));return g;
}
function glowMaterial(){return new T.ShaderMaterial({
 uniforms:{resolution:{value:new T.Vector2(952,442)},radius:{value:4.0},alpha:{value:.27},tint:{value:new T.Color(HOLOGRAM_STYLE.color)}},
 vertexShader:`attribute vec3 other; attribute float side; attribute float profile; uniform vec2 resolution; uniform float radius; varying float vSide;
 void main(){ vec4 a=projectionMatrix*modelViewMatrix*vec4(position,1.0); vec4 b=projectionMatrix*modelViewMatrix*vec4(other,1.0); vec2 d=(b.xy/max(.001,b.w)-a.xy/max(.001,a.w))*resolution; d=normalize(d+vec2(.00001)); vec2 normal=vec2(-d.y,d.x); a.xy+=normal*side*radius*2.0/resolution*a.w; vSide=profile; gl_Position=a; }`,
 fragmentShader:`uniform vec3 tint; uniform float alpha; varying float vSide; void main(){ float falloff=pow(max(0.0,1.0-abs(vSide)),2.0); gl_FragColor=vec4(tint,alpha*falloff); }`,
 transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false
});}
function markDynamic(o){o.userData.dynamicRender=true;o.userData.hologram=true;o.castShadow=o.receiveShadow=false;o.renderOrder=3;return o;}
export class ConstructionHologram extends T.Group{
 constructor(source,{software=false,quality='balanced',footprint=null}={}){
  super();this.name='Construction · hologram';this.userData.constructionHologram=true;this.software=software;this.quality=quality;this.disposed=false;this.finishAt=null;
  const data=hologramGeometry(source,HOLOGRAM_STYLE.edgeBudget[quality]||1400);this.bounds=data.bounds;this.edgeCount=data.edgeCount;
  const bodyMat=new T.MeshBasicMaterial({color:HOLOGRAM_STYLE.color,transparent:true,opacity:.07,side:T.FrontSide,depthWrite:false,toneMapped:false});
  this.scanUniform={value:0};this.scanAlpha={value:.11};
  bodyMat.onBeforeCompile=shader=>{shader.uniforms.holoScanY=this.scanUniform;shader.uniforms.holoScanAlpha=this.scanAlpha;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vHoloY;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHoloY=position.y;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vHoloY; uniform float holoScanY; uniform float holoScanAlpha;').replace('#include <color_fragment>','#include <color_fragment>\nfloat scan=exp(-pow((vHoloY-holoScanY)/0.14,2.0)); diffuseColor.a+=scan*holoScanAlpha;');};
  bodyMat.customProgramCacheKey=()=> 'drillrun-construction-hologram-1';
  this.body=markDynamic(new T.Mesh(data.surface,bodyMat));this.add(this.body);
  const edgeMat=new T.LineBasicMaterial({color:HOLOGRAM_STYLE.edge,transparent:true,opacity:.9,depthWrite:false,toneMapped:false});
  this.edges=markDynamic(new T.LineSegments(data.edges,edgeMat));this.add(this.edges);
  this.glow=markDynamic(new T.Mesh(glowGeometry(data.edges),glowMaterial()));this.add(this.glow);
  const size=this.bounds.getSize(new T.Vector3()),center=this.bounds.getCenter(new T.Vector3()),w=footprint?.width||size.x,d=footprint?.depth||size.z;
  this.minY=Math.max(0,this.bounds.min.y);this.maxY=Math.max(this.minY+.1,this.bounds.max.y);
  const rectangle=(width,depth,y)=>new T.BufferGeometry().setFromPoints([
   new T.Vector3(-width/2,y,-depth/2),new T.Vector3(width/2,y,-depth/2),new T.Vector3(width/2,y,-depth/2),new T.Vector3(width/2,y,depth/2),new T.Vector3(width/2,y,depth/2),new T.Vector3(-width/2,y,depth/2),new T.Vector3(-width/2,y,depth/2),new T.Vector3(-width/2,y,-depth/2)]);
  this.floor=markDynamic(new T.LineSegments(rectangle(w+.2,d+.2,.035),new T.LineBasicMaterial({color:HOLOGRAM_STYLE.color,transparent:true,opacity:.88,depthWrite:false,toneMapped:false})));this.add(this.floor);
  this.scan=markDynamic(new T.LineSegments(rectangle(size.x+.035,size.z+.035,0),new T.LineBasicMaterial({color:0x9af4ff,transparent:true,opacity:.75,depthWrite:false,toneMapped:false})));this.scan.position.set(center.x,0,center.z);this.add(this.scan);
  this.glow.visible=!software&&quality!=='low';this.edges.userData.hologramGlow=quality!=='low';this.scan.userData.hologramGlow=true;this.floor.userData.hologramGlow=true;
  Object.assign(this.userData,{edgeCount:data.edgeCount,triangleCount:data.surface.attributes.position?.count/3||0});
 }
 finish(time){if(this.finishAt===null)this.finishAt=time;}
 update(time,progress,{quality=this.quality,resolution=null}={}){
  if(this.disposed)return false;const fade=this.finishAt===null?1:1-clamp((time-this.finishAt)/HOLOGRAM_STYLE.fadeSeconds);if(fade<=0)return false;
  const envelope=hologramEnvelope(time,progress);this.body.material.opacity=envelope.bodyOpacity*fade;this.edges.material.opacity=envelope.edgeOpacity*fade;this.floor.material.opacity=.82*fade;
  const scanY=this.minY+(this.maxY-this.minY)*envelope.phase;this.scan.position.y=scanY;this.scanUniform.value=scanY;this.scanAlpha.value=.11*fade;this.scan.material.opacity=envelope.scanOpacity*fade;
  const detail=Math.min(this.edgeCount,HOLOGRAM_STYLE.edgeBudget[quality]||650);this.edges.geometry.setDrawRange(0,detail*2);this.glow.geometry.setDrawRange(0,detail*6);this.glow.visible=!this.software&&quality!=='low';this.glow.material.uniforms.alpha.value=.27*fade;this.edges.userData.hologramGlow=quality!=='low';if(resolution)this.glow.material.uniforms.resolution.value.set(resolution.width,resolution.height);
  this.userData.progress=envelope.progress;return true;
 }
 dispose(){if(this.disposed)return;this.disposed=true;const geometries=new Set(),materials=new Set();this.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.clear();this.removeFromParent();}
}
