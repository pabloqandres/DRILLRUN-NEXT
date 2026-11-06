import {ConstructionHologram} from './construction-hologram.mjs';
import {ActionHalo,HALO_COLORS,OBJECTIVE_COLORS} from './action-halo.mjs';
import {entranceLocked} from './office-access.mjs';
import * as T from '../vendor/three.module.js';
import {CONFIG,CLEARABLES,PRODUCTS} from './config.mjs';
import {footprint,progress,validatePlacement} from './state.mjs';
import {OFFICE_WALLS,OFFICE,doorShape,circleHitsRect} from '../assets3d/office-layout.mjs';
import {furnitureModel} from './furniture.mjs';
import {clearableModel} from './clearables.mjs';
import {pendingConstruction,moduleFixtures} from './module-catalog.mjs';
export class ChapterScene{
 constructor(world){
  this.w=world;if(world.renderer.isSoftwareRenderer)world.renderer.groundShadowY=.008;this.clearMeshes=new Map();this.furniture=new T.Group();world.scene.add(this.furniture);this.effects=[];this.frameKey='';this.furnitureKey='';this.builtAt=0;
  for(const o of CLEARABLES){const g=clearableModel(world,o);g.position.set(o.x,0,o.z);world.scene.add(g);g.userData.cameraHeight=new T.Box3().setFromObject(g).max.y;this.clearMeshes.set(o.id,g);}
  this.plot=new T.Group();world.scene.add(this.plot);for(const [x,z]of[[-9.1,-1.4],[-2.9,-1.4],[-9.1,1.4],[-2.9,1.4]]){world.box(this.plot,.08,.35,.08,x,.175,z,0xd4b77a);world.box(this.plot,.12,.08,.12,x,.38,z,0xf6bc43);}
  const line=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(6.3,.01,2.9)),new T.LineDashedMaterial({color:0xf2d8aa,dashSize:.25,gapSize:.15}));line.position.set(-6,.035,0);line.computeLineDistances();this.plot.add(line);
  this.marker=null;this.interactionRing=null;
  this.ghost=world.office.clone();this.ghost.traverse(o=>{if(o.isLight)o.visible=false;if(o.isLineSegments)o.visible=false;if(o.isMesh){o.material=new T.MeshBasicMaterial({color:0x72d8ee,transparent:true,opacity:.17,wireframe:false,depthWrite:false});o.castShadow=false;}});world.scene.add(this.ghost);this.ghost.visible=false;
  this.hologram=null;this.hologramJob=null;
  world.chapterCollision=(x,z,r)=>this.blocked(x,z,r);world.cameraObstacles=()=>this.cameraObstacles();this.state=null;this.placement=null;
 }
 cameraObstacles(){const s=this.state;if(!s)return[];const boxes=[];
  if(s.office.status==='built'){
   for(const b of OFFICE_WALLS)boxes.push({...b,x:b.x-6,owner:'office',minY:b.id.startsWith('entry-rail')?0:.42,maxY:b.id.startsWith('entry-rail')?1.4:2.9});
   for(const door of OFFICE.doors)boxes.push({...doorShape(door,this.w.office.userData.api.angles[door.id]||0),x:doorShape(door,this.w.office.userData.api.angles[door.id]||0).x-6,owner:'office',minY:.42,maxY:2.9});
   boxes.push({x:-6,z:0,w:6,d:2.5,owner:'office',minY:2.84,maxY:2.94});
   for(const f of s.furniture){const item=s.inventory.find(i=>i.id===f.id),p=PRODUCTS.find(p=>p.id===item?.product);if(p)boxes.push({...footprint(item,f),x:f.x-6,z:f.z,owner:'office',minY:f.y,maxY:f.y+p.h});}
  }
  if(pendingConstruction(s))boxes.push({x:-6,z:0,w:6.4,d:3,owner:'office',minY:0,maxY:3.2});
  for(const o of CLEARABLES)if(!s.cleared.includes(o.id))boxes.push({x:o.x,z:o.z,w:o.r*2,d:o.r*2,minY:0,maxY:this.clearMeshes.get(o.id).userData.cameraHeight});
  for(const b of [...this.w.colliders,...this.w.physicalBoundaries])boxes.push({...b,minY:0,maxY:b.maxY||3});
  return boxes;
 }
 blocked(x,z,r){const s=this.state;if(!s)return false;if(entranceLocked(s,x,z,r))return true;
  if(CLEARABLES.some(o=>!s.cleared.includes(o.id)&&circleHitsRect(x,z,r,{x:o.x,z:o.z,w:o.r*2,d:o.r*2})))return true;
  if(pendingConstruction(s)&&circleHitsRect(x,z,r,{x:-6,z:0,w:6.4,d:3.0}))return true;
  return s.furniture.some(f=>{const item=s.inventory.find(i=>i.id===f.id),p=PRODUCTS.find(p=>p.id===item?.product);return p?.layer==='floor'&&circleHitsRect(x+6,z,r,footprint(item,f));});
 }
 burst(x,z){for(let i=0;i<10;i++){const mesh=new T.Mesh(new T.IcosahedronGeometry(.035,0),new T.MeshBasicMaterial({color:i%2?0xcba67f:0xf5d6ad,transparent:true,opacity:.8}));mesh.position.set(x,.2,z);this.w.scene.add(mesh);this.effects.push({mesh,life:.65,vx:Math.sin(i*2.4)*.6,vz:Math.cos(i*2.4)*.6,vy:.7+i*.04});}}
 release(group,preview=false){if(!group)return;group.traverse(o=>{o.geometry?.dispose();if(o.isLineSegments||preview)o.material?.dispose();});group.removeFromParent();}
 setUpgradePreview(level){
  this.release(this.upgradePreview,true);this.upgradePreview=null;this.w.chapterUpgradePreview=!!level;
  if(level){const group=new T.Group();group.name='upgrade-preview-level-'+level;for(const f of moduleFixtures(level)){const p=PRODUCTS.find(p=>p.id===f.product),mesh=furnitureModel(this.w,f.product,f.variant);mesh.position.set(-6+f.x,p.layer==='surface'?1.17:.42,f.z);mesh.rotation.y=f.rotation;mesh.traverse(o=>{if(o.isMesh){o.material=new T.MeshBasicMaterial({color:0x58cfe9,transparent:true,opacity:.42,depthWrite:false});o.castShadow=false;}else if(o.isLineSegments)o.material=new T.LineBasicMaterial({color:0xa8efff,transparent:true,opacity:.95});});group.add(mesh);}this.w.scene.add(group);this.upgradePreview=group;}
  this.dirty();
 }
 setPlacement(item,pose){this.placement={item,pose};this.release(this.ghostFurniture,true);this.ghostFurniture=furnitureModel(this.w,item.product,item.variant);this.w.scene.add(this.ghostFurniture);this.ghostFurniture.traverse(o=>{if(o.isLineSegments)o.visible=false;if(o.isMesh){o.material=new T.MeshBasicMaterial({color:0x70e2d4,transparent:true,opacity:.5,depthWrite:false});o.castShadow=false;}});this.dirty();}
 cancelPlacement(){this.placement=null;this.release(this.ghostFurniture,true);this.ghostFurniture=null;this.dirty();}
 setInteraction(action,state){
  if(this.interactive===false)action=null;
  const o=action?.object,computer=action?.kind==='computer'?state.furniture.find(f=>state.inventory.find(i=>i.id===f.id)?.product==='computer'):null;
  const key=[!!(o||computer),o?.id,computer?.id].join('|');
  if(key!==this.interactionKey){this.interactionKey=key;this.dirty();}
 }
 dirty(){this.w.renderer.staticFrame=null;}
 update(s,dt,now,{blueprint=false,interactive=true}={}){
  this.interactive=interactive;this.state=s;this.w.office.userData.api.opened.entry=!!s.inside;const built=s.office.status==='built',building=!!pendingConstruction(s);this.w.officeEnabled=built;this.w.office.visible=built;this.w.chapterInterior=!!s.inside;if(!interactive)this.setInteraction(null,s);this.plot.visible=!built;this.ghost.visible=blueprint&&!building;this.ghost.position.y=built?.025:0;
  const key=[s.cleared.join(','),s.office.status,s.office.level,!!s.office.upgrade,s.inside,blueprint].join('|');if(key!==this.frameKey){this.frameKey=key;for(const o of CLEARABLES)this.clearMeshes.get(o.id).visible=!s.cleared.includes(o.id);this.dirty();}
  const job=pendingConstruction(s),jobKey=job?job.module+':'+job.started:null,time=now/1000;
  if(job){
   if(jobKey!==this.hologramJob){this.hologram?.dispose();this.hologramJob=jobKey;this.hologram=new ConstructionHologram(this.w.office,{software:this.w.renderer.isSoftwareRenderer,quality:this.w.quality,footprint:{width:6,depth:2.5}});this.hologram.position.set(-6,0,0);this.w.scene.add(this.hologram);this.dirty();}
   this.hologram.visible=interactive;this.hologram.update(time,progress(s,now),{quality:this.w.quality,resolution:this.w.renderer.domElement});
  }else if(this.hologram){
   if(!built||!interactive){this.hologram.dispose();this.hologram=null;this.hologramJob=null;this.dirty();}
   else{this.hologram.finish(time);if(!this.hologram.update(time,1,{quality:this.w.quality,resolution:this.w.renderer.domElement})){this.hologram.dispose();this.hologram=null;this.hologramJob=null;this.dirty();}}
  }
  Object.assign(this.w.renderer.domElement.dataset,{officeHologram:String(!!this.hologram&&this.hologram.visible),hologramEdges:String(this.hologram?.edgeCount||0),hologramProgress:String(this.hologram?.userData.progress||0)});
  const furnitureKey=JSON.stringify([s.furniture,s.inventory]);if(furnitureKey!==this.furnitureKey){this.furnitureKey=furnitureKey;for(const child of [...this.furniture.children])this.release(child);for(const f of s.furniture){const item=s.inventory.find(i=>i.id===f.id);if(!item)continue;const mesh=furnitureModel(this.w,item.product,item.variant);mesh.name=f.id;mesh.position.set(-6+f.x,f.y,f.z);mesh.rotation.y=f.rotation;this.furniture.add(mesh);}this.dirty();}
  for(const mesh of this.furniture.children)mesh.visible=!this.upgradePreview&&(!this.placement||!(mesh.name===this.placement.item.id||s.furniture.find(f=>f.id===mesh.name)?.host===this.placement.item.id));
  if(this.placement){const {item,pose}=this.placement,result=validatePlacement(s,item.id,pose);this.ghostFurniture.position.set(-6+pose.x,result.y||.42,pose.z);this.ghostFurniture.rotation.y=pose.rotation;this.ghostFurniture.traverse(o=>{if(o.isMesh)o.material.color.setHex(result.valid?0x70e2d4:0xf16d67);});const k=JSON.stringify(pose)+result.valid;if(this.poseKey!==k){this.poseKey=k;this.dirty();}}
  if(this.builtAt){const t=Math.min(1,(now-this.builtAt)/650);this.w.office.position.y=.10*(1-t)*(1-t);this.dirty();if(t===1)this.builtAt=0;}
  for(const p of [...this.effects]){p.life-=dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.z+=p.vz*dt;p.mesh.position.y+=p.vy*dt;p.vy-=2*dt;p.mesh.material.opacity=Math.max(0,p.life);if(p.life<=0){p.mesh.removeFromParent();p.mesh.geometry.dispose();p.mesh.material.dispose();this.effects.splice(this.effects.indexOf(p),1);}this.dirty();}
 }
}
