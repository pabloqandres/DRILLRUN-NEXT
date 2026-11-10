// DRILL RUN NEXT GENERATION · Universal catalog construction blueprint.
// Architectural contract for every current/future prefab building:
// a catalog building has a fixed site and a real 3D source factory.
// The catalog is READ-ONLY: never purchase, start a timer, add a collider,
// mutate the player save, or spawn actual equipment from this module.
import * as T from '../vendor/three.module.js';
import {assetModel} from '../hsec/world.mjs';

const HOLO_COLOR=0x65e5f5;
const BUILDING_KINDS=new Set(['module','workshop','patio','building','prefab']);
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const site=(id,x,z,width,depth,height,source)=>({
 id,x,z,width,depth,height,source
});
export function constructionPreviewSpec(product){
 if(!product)return null;
 if(product.kind==='module'&&product.id==='office')
  return site('office',-6,0,6.4,3.0,3.5,'office');
 if(product.kind==='workshop')
  return site('workshop',-7.6,-9.3,8.3,6.3,4.8,'workshop');
 if(product.kind==='patio'&&product.id==='patio-maquinarias-l1')
  return site('patio-maquinarias-l1',-51,-17,54,44,7,'patio');
 if(product.kind==='hsec'&&product.id==='shed'){
  const fixed=product.model?.fixed;
  if(!fixed||!valid(fixed.x)||!valid(fixed.z))return null;
  return site('shed',fixed.x,fixed.z,product.w||6,product.d||4.8,product.h||3.8,'shed');
 }
 // All future prefab buildings inherit the same interface when registered
 // in Catálogo: model.fixed or previewSite contains the actual fixed anchor.
 if(BUILDING_KINDS.has(product.kind)){
  const fixed=product.previewSite||product.model?.fixed||product.model?.site;
  if(fixed&&valid(fixed.x)&&valid(fixed.z)&&valid(product.w)&&valid(product.d))
   return site(product.id,fixed.x,fixed.z,product.w,product.d,product.h||3,
    product.previewSource||null);
 }
 return null;
}
export function constructionPreviewCamera(spec){
 if(!spec)return null;
 // The catalog occupies the lower portion of landscape screens. A high,
 // pulled-back three-quarter camera keeps the entire footprint above it.
 const span=Math.max(spec.width,spec.depth),dist=Math.max(12,span*1.55);
 return {
  target:{x:spec.x,y:Math.max(.3,Math.min(2,spec.height*.17)),z:spec.z},
  offset:{x:dist*.65,y:dist*.85,z:dist*.95}
 };
}
function line(parent,points,material){
 const l=new T.Line(new T.BufferGeometry().setFromPoints(points),material);
 l.userData.previewOwnGeometry=true;parent.add(l);return l;
}
function outline(parent,rect,color=HOLO_COLOR){
 const lineMaterial=new T.LineBasicMaterial({color,transparent:true,opacity:.92,depthWrite:false});
 const {w,d}=rect,low=.12,high=Math.max(.4,rect.h);
 const corners=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
 const loop=(y)=>corners.concat([corners[0]]).map(([x,z])=>new T.Vector3(x,y,z));
 line(parent,loop(low),lineMaterial);
 line(parent,loop(high),lineMaterial.clone());
 for(const [x,z] of corners){
  line(parent,[new T.Vector3(x,low,z),new T.Vector3(x,high,z)],lineMaterial.clone());
 }
 const plane=new T.Mesh(new T.PlaneGeometry(w,d),
  new T.MeshBasicMaterial({color,transparent:true,opacity:.055,depthWrite:false,side:T.DoubleSide}));
 plane.rotation.x=-Math.PI/2;plane.position.y=.12;plane.userData.previewOwnGeometry=true;parent.add(plane);
}
export class BuildingBlueprint{
 constructor(world,getPatioWorld=null){
  this.world=world;this.getPatioWorld=getPatioWorld;
  this.group=new T.Group();this.group.name='CATÁLOGO · holograma universal 3D';
  this.group.visible=false;world.scene.add(this.group);
  this.selectedKey=null;this.spec=null;this.cachedWorkshop=null;
 }
 source(spec){
  if(spec.source==='office')return [this.world.office];
  if(spec.source==='workshop'){
   if(!this.cachedWorkshop)this.cachedWorkshop=this.world.makeWorkshop(true);
   return [this.cachedWorkshop];
  }
  if(spec.source==='patio'){
   const p=this.getPatioWorld?.();
   const root=p?.root;
   if(!root)return [];
   const segments=['M5 · Suelo y vialidad','M5 · Techumbre solo camionetas y DrillTruck',
    'M5 · Galpón logístico y preparación','M5 · Combustible aislado HSEC'];
   // Use EXACT modules of the real construction, not generic cubes.
   const structures=root.children.find(x=>x.name==='M5 · Suelo y vialidad');
   const assembly=root.children.find(x=>x.name==='');
   return [root.children.find(x=>x.name==='M5 · Suelo y vialidad'),
    ...root.children.filter(x=>x!==structures&&x.name!== 'M5 · Holograma blueprint')];
  }
  if(spec.source==='shed')return [assetModel({type:'shed',level:1,x:0,z:0})];
  // Future buildings may supply a source mesh factory; until then, the
  // footprint is a truthful outline, never an invented prefab.
  return [];
 }
 clear(){
  for(const child of [...this.group.children]){
   this.group.remove(child);
   child.traverse(o=>{
    if(o.userData?.previewOwnGeometry)o.geometry?.dispose?.();
    if(o.userData?.previewOwnMaterial){
     (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose?.());
    }
   });
  }
 }
 show(product){
  const spec=constructionPreviewSpec(product);
  if(!spec){this.hide();return null;}
  const key=spec.id+':'+product.status+':'+(product.level||0);
  if(this.selectedKey===key){this.group.visible=true;return this.spec;}
  this.clear();this.selectedKey=key;this.spec=spec;
  this.group.visible=true;this.group.position.set(spec.x,0,spec.z);
  this.group.rotation.set(0,0,0);
  const shell=new T.Group();shell.name='Holograma arquitectónico · solo visual';
  this.group.add(shell);
  outline(shell,{w:spec.width,d:spec.depth,h:spec.height});
  const installed=product.status==='installed'||product.status==='building';
  if(!installed){
   // Reuse actual prefab geometry. The clone has NO physics, equipment,
   // economy effects, lights, async downloads or original shared materials.
   for(const source of this.source(spec)){
    if(!source)continue;
    const cloned=source.clone(true);
    const origin=(spec.source==='patio'?source.parent?.position:source.position)||{x:0,y:0,z:0};
    if(spec.source==='patio'){cloned.position.x+=origin.x-spec.x;cloned.position.z+=origin.z-spec.z;}
    else if(spec.source==='office'||spec.source==='workshop'){
     cloned.position.x-=spec.x;cloned.position.z-=spec.z;
    }
    cloned.visible=true;
    cloned.traverse(o=>{
     if(o.isLight){o.visible=false;return;}
     if(o.isMesh){
      o.visible=true;o.castShadow=false;o.receiveShadow=false;
      o.material=new T.MeshBasicMaterial({
       color:HOLO_COLOR,wireframe:true,transparent:true,opacity:.58,
       depthWrite:false,side:T.DoubleSide
      });
      o.userData.previewOwnMaterial=true;
     }else if(o.isLine||o.isLineSegments){
      o.material=new T.LineBasicMaterial({color:HOLO_COLOR,transparent:true,opacity:.50,depthWrite:false});
      o.userData.previewOwnMaterial=true;
     }
    });
    shell.add(cloned);
   }
  }
  return spec;
 }
 hide(){
  this.group.visible=false;this.selectedKey=null;this.spec=null;
  this.clear();
 }
 camera(){
  return constructionPreviewCamera(this.spec);
 }
 dispose(){this.hide();this.group.removeFromParent();}
}
