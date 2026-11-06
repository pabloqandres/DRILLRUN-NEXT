import {refineAvatarMaterial} from '../graphics/materials.mjs';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {WalkingPosture} from '../animation/walking-posture.mjs';
import {angleDelta} from '../animation/movement.mjs';
const assetURL=new URL('./operator-candidate.glb',import.meta.url);
export async function installCandidate(world){
 const asset=await new GLTFLoader().loadAsync(assetURL.href);const root=new T.Group(),body=asset.scene;root.name='HOTFIX 003 · Artlist original optimizado';root.userData.isWorker=true;root.add(body);root.position.copy(world.player.position);root.quaternion.copy(world.player.quaternion);const meshes=[];
 body.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;o.frustumCulled=false;const material=o.material.clone();material.name='Artlist original · cel provisional';if(new URLSearchParams(location.search).get('cel')!=='0'){
 refineAvatarMaterial(material);}
 material.userData.celCandidate=true;o.material=material;meshes.push(o);});
 const original=world.player;world.legacyCharacter={player:original,body:world.playerBody,worker:world.worker,vest:world.vest};original.visible=false;world.scene.add(root);world.player=root;world.playerBody=body;world.worker=new CandidateRig(root,body,meshes,asset.animations,asset.parser.json.extras);world.vest=meshes[0];world.candidateActive=true;
 // The old model remains available, without loading a second scene or editing the environment.
 return world.worker;
}
export class CandidateRig{
 constructor(root,body,meshes,clips,meta){this.root=root;this.body=body;this.meshes=meshes;this.meta=meta;this.stats={...meta.stats,bones:21,materials:1,height:1.85,source:'Artlist GLB',fileBytes:4703824};this.mixer=new T.AnimationMixer(body);this.actions=Object.fromEntries(clips.map(c=>{const a=this.mixer.clipAction(c);a.play();a.paused=true;return[c.name,a];}));this.clips=Object.fromEntries(clips.map(c=>[c.name,c]));this.cycleDistance=meta.motionStats.Walk.cycleDistance;this.walkBlend=0;this.turnBlend=0;this.last=null;this.lastYaw=0;this.state='Idle';this.probes=[];const geo=meshes[0].geometry,p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)<.035)this.probes.push(i);if(meta.soleProbes?.length)this.probes=[...meta.soleProbes];else if(this.probes.length>180){const every=Math.ceil(this.probes.length/180);this.probes=this.probes.filter((_,i)=>i%every===0);}this.probeVector=new T.Vector3();this.posture=new WalkingPosture(body);this.smoothCorrection=0;this.reset();}
 reset(){this.last=null;this.lastYaw=this.root.rotation.y;this.walkBlend=0;this.turnBlend=0;this.metrics={distance:0,steps:0,phaseTravel:0,soleProbes:this.probes.length};for(const a of Object.values(this.actions))a.time=0;this.steps=0;}
 update(dt,sampleGround,time){const root=this.root,pos=root.position,travel=this.last?Math.hypot(pos.x-this.last.x,pos.z-this.last.z):0,speed=travel/Math.max(dt,.001),yawStep=this.last?angleDelta(this.lastYaw,root.rotation.y):0,turnRate=Math.abs(yawStep)/Math.max(dt,.001);this.last={x:pos.x,z:pos.z};this.lastYaw=root.rotation.y;
 const walkTarget=speed>.035?1:0,turnTarget=turnRate>.20&&speed<.32?Math.min(1,turnRate/2):0;this.walkBlend+=(walkTarget-this.walkBlend)*(1-Math.exp(-dt*(walkTarget?18:40)));if(!walkTarget&&this.walkBlend<.08)this.walkBlend=0;this.turnBlend+=(turnTarget-this.turnBlend)*(1-Math.exp(-dt*16));
 const walk=this.actions.Walk,idle=this.actions.Idle,turn=this.actions.Turn;idle.time=(idle.time+dt)%this.clips.Idle.duration;if(travel>.00001)walk.time=(walk.time+travel/this.cycleDistance*this.clips.Walk.duration)%this.clips.Walk.duration;else if(this.walkBlend>0.01&&walk.time>0){const settle=Math.min(walk.time,dt*12);walk.time=Math.max(0,walk.time-settle);}if(turnRate>.04)turn.time=(turn.time+Math.abs(yawStep)/Math.PI*this.clips.Turn.duration)%this.clips.Turn.duration;
 const ww=this.walkBlend,tw=this.turnBlend*(1-ww);walk.setEffectiveWeight(ww);turn.setEffectiveWeight(tw);idle.setEffectiveWeight(Math.max(0,1-ww-tw));this.mixer.update(0);
 this.body.position.y=0;root.updateMatrixWorld(true);this.posture.apply(Math.max(ww,tw*.7));for(const m of this.meshes)m.skeleton?.update();
 // Cheap sole probes adjust height only. No foot is anchored to world coordinates during a turn.
 let correction=-Infinity;const mesh=this.meshes[0];for(const id of this.probes){mesh.getVertexPosition(id,this.probeVector).applyMatrix4(mesh.matrixWorld);correction=Math.max(correction,sampleGround(this.probeVector.x,this.probeVector.z)-this.probeVector.y);}if(Number.isFinite(correction)){correction=Math.max(correction,-.025);this.smoothCorrection+=(correction-this.smoothCorrection)*(1-Math.exp(-dt*14));this.body.position.y=this.smoothCorrection;}
 root.updateMatrixWorld(true);for(const m of this.meshes)m.skeleton?.update();this.metrics.distance+=travel;this.metrics.phaseTravel+=travel/this.cycleDistance;const steps=Math.floor(this.metrics.phaseTravel*2);this.metrics.steps=steps;this.state=ww>.1?'Walk':tw>.1?'Turn':'Idle';
 const canvas=root.userData.validationCanvas;if(canvas){canvas.dataset.characterState=this.state;canvas.dataset.characterDistance=this.metrics.distance.toFixed(4);canvas.dataset.characterPositionX=pos.x.toFixed(4);canvas.dataset.characterPositionZ=pos.z.toFixed(4);canvas.dataset.characterSpeed=speed.toFixed(3);canvas.dataset.walkPhase=(walk.time/this.clips.Walk.duration).toFixed(4);canvas.dataset.characterYaw=root.rotation.y.toFixed(3);canvas.dataset.groundCorrection=correction.toFixed(4);canvas.dataset.characterTriangles=String(this.stats.triangles);}
 }
}
