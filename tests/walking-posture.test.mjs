import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {sourceMotion} from '../tools/source-motion.mjs';
import {WalkingPosture} from '../dist/animation/walking-posture.mjs';
import {ChapterScene} from '../dist/chapter/world.mjs';
import {HALO_COLORS,OBJECTIVE_COLORS} from '../dist/chapter/action-halo.mjs';

for(const id of ['candidate','02','03','04'])test('natural foot tracks preserve stride and rigid leg lengths: '+id,()=>{
 const src=sourceMotion(new URL('../dist/assets3d/operator-'+id+'.glb',import.meta.url));
 const action=src.mixer.clipAction(src.clips.find(c=>c.name==='Walk'));action.play();action.paused=true;
 const posture=new WalkingPosture(src.group),root=new T.Group();root.add(src.group);src.group.scale.setScalar(id==='04'?1.66/1.85:1);root.rotation.y=1.13;
 let beforeWidth=0,afterWidth=0;
 for(let i=0;i<60;i++){
  action.time=i/60*action.getClip().duration;src.mixer.update(0);root.updateMatrixWorld(true);
  const before=posture.legs.map(l=>({ankle:src.group.worldToLocal(l.foot.getWorldPosition(new T.Vector3())),lengths:[l.lower.position.length(),l.foot.position.length()]}));
  posture.apply(1);root.updateMatrixWorld(true);
  const after=posture.legs.map(l=>src.group.worldToLocal(l.foot.getWorldPosition(new T.Vector3())));
  beforeWidth+=before[0].ankle.x-before[1].ankle.x;afterWidth+=after[0].x-after[1].x;
  assert.ok(after[0].x-after[1].x>=.20,'no crossing of boot tracks');
  posture.legs.forEach((l,j)=>{
   assert.ok(Math.abs(after[j].z-before[j].ankle.z)<1e-6,'fore/aft stride unchanged under rotation');
   assert.ok(Math.abs(after[j].y-before[j].ankle.y)<1e-6,'ankle contact height unchanged');
   assert.equal(l.lower.position.length(),before[j].lengths[0]);assert.equal(l.foot.position.length(),before[j].lengths[1]);
  });
 }
 assert.ok(afterWidth<beforeWidth*.90,'narrower, forward leg movement');
 // Zero correction never changes an idle or paused pose.
 const pose=posture.legs.map(l=>l.upper.quaternion.clone());posture.apply(0);
 posture.legs.forEach((l,i)=>assert.deepEqual(l.upper.quaternion.toArray(),pose[i].toArray()));
});
test('selection suppresses proximity halos; approaching a mission keeps its category color',()=>{
 const scene={interactive:false,placement:null,interactionRing:{visible:false,position:{set(){}},scale:{setScalar(){}},setColor(c){this.color=c;}},dirty(){}};
 const state={furniture:[],inventory:[]},action={kind:'clear',object:{id:'rock',x:1,z:2,r:.5}};
 ChapterScene.prototype.setInteraction.call(scene,action,state);assert.equal(scene.interactionRing.visible,false);
 scene.interactive=true;
 for(const category of ['main','secondary','optional'])for(const blocked of [false,true]){
  ChapterScene.prototype.setInteraction.call(scene,{...action,category,blocked},state);
  assert.equal(scene.interactionRing.visible,true);assert.equal(scene.interactionRing.color,OBJECTIVE_COLORS[category]);
 }
 assert.equal(HALO_COLORS.ready,OBJECTIVE_COLORS.main);
});
