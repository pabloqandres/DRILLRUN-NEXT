import {refineAvatarMaterial} from '../graphics/materials.mjs';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {CandidateRig} from '../assets3d/worker-candidate.mjs';
import {AVATARS,avatarDefinition} from './avatars.mjs';
import {renderPlayerPortrait} from './portrait.mjs';
// Runtime skin weight cleanup. Only removes incorrect influences — never replaces good weights.
// Fixes head deformation and torso bounce from shared skeleton rigging.
function cleanSkinWeights(mesh){
 if(!mesh.isSkinnedMesh||!mesh.skeleton)return;
 const bones=mesh.skeleton.bones;
 const headIdx=bones.findIndex(b=>b.name==='Head');
 const neckIdx=bones.findIndex(b=>b.name==='Neck');
 const hipsIdx=bones.findIndex(b=>b.name==='Hips');
 if(headIdx<0||hipsIdx<0)return;
 const legNames=['LeftUpLeg','LeftLeg','LeftFoot','LeftToe','RightUpLeg','RightLeg','RightFoot','RightToe'];
 const legBones=new Set(bones.map((b,i)=>legNames.includes(b.name)?i:-1).filter(i=>i>=0));
 const tmp=new T.Vector3();mesh.updateMatrixWorld(true);
 const neckY=neckIdx>=0?bones[neckIdx].getWorldPosition(tmp).y:bones[headIdx].getWorldPosition(tmp).y-.12;
 const hipsY=bones[hipsIdx].getWorldPosition(tmp).y;
 const invMat=new T.Matrix4().copy(mesh.matrixWorld).invert();
 const localNeckY=tmp.set(0,neckY,0).applyMatrix4(invMat).y*.97;
 const localHipsY=tmp.set(0,hipsY,0).applyMatrix4(invMat).y*1.1;
 const geo=mesh.geometry,pos=geo.attributes.position;
 const skinIdx=geo.attributes.skinIndex,skinWt=geo.attributes.skinWeight;
 if(!skinIdx||!skinWt)return;
 let fixed=0;
 for(let i=0;i<pos.count;i++){
  const y=pos.getY(i);
  if(y>=localNeckY){
   // Head: 100% Head bone
   skinIdx.setXYZW(i,headIdx,0,0,0);skinWt.setXYZW(i,1,0,0,0);fixed++;
  }else if(y>localHipsY){
   // Torso: only remove leg bone influence, keep everything else as-is
   const si=[skinIdx.getX(i),skinIdx.getY(i),skinIdx.getZ(i),skinIdx.getW(i)];
   const sw=[skinWt.getX(i),skinWt.getY(i),skinWt.getZ(i),skinWt.getW(i)];
   let dirty=false,total=0;
   for(let j=0;j<4;j++){if(legBones.has(si[j])){sw[j]=0;dirty=true;}total+=sw[j];}
   if(dirty&&total>0){for(let j=0;j<4;j++)sw[j]/=total;skinWt.setXYZW(i,sw[0],sw[1],sw[2],sw[3]);fixed++;}
  }
 }
 if(fixed){skinIdx.needsUpdate=true;skinWt.needsUpdate=true;}
}
export class AvatarRoster{
 constructor(world){this.world=world;this.entries=new Map([['operator01',{root:world.player,body:world.playerBody,rig:world.worker,vest:world.vest,definition:AVATARS[0]}]]);this.pending=new Map();this.selected='operator01';this.displayOffsets=[-1.8,-.6,.6,1.8];}
 async load(id){if(this.entries.has(id))return this.entries.get(id);if(this.pending.has(id))return this.pending.get(id);const promise=this.loadModel(id);this.pending.set(id,promise);try{return await promise;}finally{this.pending.delete(id);}}
 async loadModel(id){
  const definition=avatarDefinition(id),asset=await new GLTFLoader().loadAsync(new URL('../assets3d/'+definition.asset,import.meta.url).href),root=new T.Group(),body=asset.scene,meshes=[];root.name=id;root.userData.isWorker=true;root.add(body);body.scale.setScalar(definition.height/1.85);
  body.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;o.frustumCulled=false;const material=o.material.clone();refineAvatarMaterial(material);o.material=material;meshes.push(o);if(o.isSkinnedMesh)cleanSkinWeights(o);});
  root.visible=false;this.world.scene.add(root);const rig=new CandidateRig(root,body,meshes,asset.animations,asset.parser.json.extras);rig.cycleDistance*=definition.height/1.85;rig.stats={...rig.stats,height:definition.height,source:'Artlist '+id};const entry={root,body,rig,vest:meshes[0],definition};this.entries.set(id,entry);return entry;
 }
 async loadAll(onProgress=()=>{}){let done=1;onProgress(done,4);for(const a of AVATARS.slice(1)){await this.load(a.id);onProgress(++done,4);}}
 activate(id){const e=this.entries.get(id);if(!e)return false;this.selected=id;Object.assign(this.world,{player:e.root,playerBody:e.body,worker:e.rig,vest:e.vest,candidateActive:true});this.world.setCharacter(id);e.root.userData.validationCanvas=this.world.renderer.domElement;this.world.renderer.domElement.dataset.avatarId=id;this.world.renderer.domElement.dataset.avatarTextures=e.rig.meshes.map(m=>[!!m.material.map,!!m.material.normalMap,!!m.material.metalnessMap].join('/')).join(',');e.rig.reset();this.world.renderer.staticFrame=null;return true;}
 // Hit-test the four visible 3D candidates using the actual game camera.
 // Only selectable meshes are tested; backdrop props, UI panels and terrain are ignored.
 pickSelector(clientX,clientY){
  const canvas=this.world.renderer.domElement,rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height||clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;
  const pointer=new T.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
  this.world.camera.updateMatrixWorld();
  this.world.ray.setFromCamera(pointer,this.world.camera);
  const roots=[],lookup=new Map();
  for(const a of AVATARS){
   const e=this.entries.get(a.id);if(!e?.root?.visible)continue;
   e.root.updateMatrixWorld(true);roots.push(e.root);lookup.set(e.root,a.id);
  }
  for(const hit of this.world.ray.intersectObjects(roots,true)){
   for(let parent=hit.object;parent;parent=parent.parent){
    if(lookup.has(parent))return lookup.get(parent);
   }
  }
  // Skinned GLB meshes can occasionally miss raycast hits, especially during
  // animated poses. Use a tight camera-projected body hit area as touch fallback.
  // Body-space coordinates are projected with the actual selector camera.
  let closest=null,score=Infinity;
  for(const a of AVATARS){
   const e=this.entries.get(a.id);
   if(!e?.root?.visible)continue;
   const height=e.definition?.height||1.8;
   const ground=new T.Vector3(0,0,0),head=new T.Vector3(0,height,0);
   e.root.localToWorld(ground);e.root.localToWorld(head);
   ground.project(this.world.camera);head.project(this.world.camera);
   if(ground.z>=1||head.z>=1)continue;
   const cx=rect.left+(ground.x+head.x+2)*rect.width/4;
   const top=rect.top+(1-head.y)*rect.height/2;
   const bottom=rect.top+(1-ground.y)*rect.height/2;
   const bodyHeight=Math.abs(bottom-top);
   if(bodyHeight<20)continue;
   const hw=Math.max(20,Math.min(65,bodyHeight*.20));
   const cy=(top+bottom)/2;
   const dx=Math.abs(clientX-cx),dy=Math.abs(clientY-cy);
   if(dx>hw||dy>bodyHeight*.55)continue;
   const distance=(dx/hw)**2+(dy/(bodyHeight*.55))**2;
   if(distance<score){score=distance;closest=a.id;}
  }
  return closest;
 }
 portrait(id){const e=this.entries.get(id);if(!e)return '';if(!e.portrait){const host=document.createElement('span');renderPlayerPortrait({...this.world,player:e.root,worker:e.rig},host,e.definition.height);e.portrait=host.innerHTML;}return e.portrait;}
 updateSelector(show,selected,state,dt,time){
  for(const a of AVATARS){const e=this.entries.get(a.id);if(!e)continue;e.root.visible=show||a.id===this.selected;if(!show)continue;const i=AVATARS.indexOf(a),chosen=a.id===selected;const x=-5.5+this.displayOffsets[i],z=5.2+(chosen?.45:0);e.root.position.set(x,0,z);e.root.rotation.y=0;if(chosen){state.position={x,z};}else e.rig.update(dt,()=>0,time);}
 }
}
