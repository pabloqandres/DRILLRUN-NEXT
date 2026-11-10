// Shared fixed-site holographic building preview for M1 -> endgame.
// Exactly the SAME ConstructionHologram used by the Office L1 construction.
// Preview is visual-only: no saves, economy, construction, colliders or spawn.
import * as T from '../vendor/three.module.js';
import {assetModel} from '../hsec/world.mjs';
import {ConstructionHologram} from './construction-hologram.mjs';

const BUILDINGS=new Set(['module','workshop','patio','building','prefab']);
const good=n=>typeof n==='number'&&Number.isFinite(n);
const site=(id,x,z,width,depth,height,source)=>({id,x,z,width,depth,height,source});
export function constructionPreviewSpec(product){
 if(!product)return null;
 if(product.kind==='module'&&product.id==='office')
  return site('office',-6,0,6.4,3,3.5,'office');
 if(product.kind==='workshop')
  return site('workshop',-7.6,-9.3,8.3,6.3,4.8,'workshop');
 if(product.kind==='patio'&&product.id==='patio-maquinarias-l1')
  return site('patio-maquinarias-l1',-51,-17,54,44,7,'patio');
 if(product.kind==='hsec'&&product.id==='shed'){
  const fixed=product.model?.fixed;
  if(!fixed||!good(fixed.x)||!good(fixed.z))return null;
  return site('shed',fixed.x,fixed.z,product.w||6,product.d||4.8,product.h||3.8,'shed');
 }
 // Future prefab modules must register a precise fixed-site anchor and
 // ideally a real structuralSource; all share identical mechanics.
 if(BUILDINGS.has(product.kind)){
  const fixed=product.previewSite||product.model?.fixed||product.model?.site;
  if(fixed&&good(fixed.x)&&good(fixed.z)&&good(product.w)&&good(product.d))
   return site(product.id,fixed.x,fixed.z,product.w,product.d,product.h||3,
    product.previewSource||null);
 }
 return null;
}
export function constructionPreviewCamera(spec){
 if(!spec)return null;
 const span=Math.max(spec.width,spec.depth),dist=Math.max(12,span*1.55);
 return {target:{x:spec.x,y:Math.max(.3,Math.min(2,spec.height*.17)),z:spec.z},
  offset:{x:dist*.65,y:dist*.85,z:dist*.95}};
}
export class BuildingBlueprint{
 constructor(world,getPatioWorld){
  this.world=world;this.getPatioWorld=getPatioWorld;
  this.group=new T.Group();this.group.name='CATÁLOGO · Blueprint 3D universal';
  this.group.visible=false;world.scene.add(this.group);
  this.selectedKey=null;this.spec=null;this.hologram=null;
  this.workshopSource=null;this.walkMode=false;
 }
 source(spec){
  if(spec.source==='office')return this.world.office;
  if(spec.source==='workshop'){
   if(!this.workshopSource)this.workshopSource=this.world.makeWorkshop(true);
   return this.workshopSource;
  }
  if(spec.source==='patio')return this.getPatioWorld?.()?.structuralSource||null;
  if(spec.source==='shed')return assetModel({type:'shed',level:1,x:0,z:0});
  // A future prefab without a linked real GLB/factory only gets a factual
  // volume envelope, never a fictitious building with fake equipment.
  const g=new T.Group();
  const mesh=new T.Mesh(new T.BoxGeometry(spec.width,spec.height,spec.depth),
   new T.MeshBasicMaterial({color:0x28dcff,transparent:true,opacity:.01}));
  mesh.position.y=spec.height/2;g.add(mesh);
  return g;
 }
 show(product){
  const spec=constructionPreviewSpec(product);
  if(!spec){this.hide();return null;}
  const key=spec.id+':'+(product.level||0)+':'+(product.status||'');
  if(key===this.selectedKey){
   this.group.visible=true;return this.spec;
  }
  this.hide();
  const source=this.source(spec);
  if(!source)return null;
  this.selectedKey=key;this.spec=spec;
  const holo=new ConstructionHologram(source,{
   software:this.world.renderer.isSoftwareRenderer,
   quality:this.world.quality,footprint:{width:spec.width,depth:spec.depth}
  });
  holo.position.set(spec.x,0,spec.z);
  this.hologram=holo;this.group.add(holo);
  this.group.visible=true;
  this.update(performance.now()/1000);
  return spec;
 }
 update(time=performance.now()/1000){
  if(!this.hologram||!this.group.visible)return;
  this.hologram.update(time,.26,{
   quality:this.world.quality,resolution:this.world.renderer.domElement
  });
 }
 hide(){
  this.group.visible=false;
  this.hologram?.dispose();this.hologram=null;
  this.selectedKey=null;this.spec=null;
 }
 camera(){return constructionPreviewCamera(this.spec);}
 dispose(){this.hide();this.group.removeFromParent();}
}
