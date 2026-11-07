import test from 'node:test';
import assert from 'node:assert/strict';
import {AvatarRoster} from '../dist/chapter/avatar-roster.mjs';
import * as T from '../dist/vendor/three.module.js';
import {readFileSync} from 'node:fs';

test('Touch picks the corresponding visible 3D avatar instead of a bottom card',()=>{
 const roots=['operator01','operator02','operator03','operator04'].map(id=>({
  name:id,visible:true,updateMatrixWorld(){this.updated=true;}
 }));
 const candidates=roots.map((root,i)=>({id:root.name,root}));
 const meshes=roots.map(root=>({parent:root}));
 let target=2;
 let queriedRoots=null;
 const selection={
  world:{
   renderer:{domElement:{getBoundingClientRect(){return {left:100,top:50,right:900,bottom:550,width:800,height:500};}}},
   camera:{updateMatrixWorld(){}},
   ray:{setFromCamera(pointer){assert(Math.abs(pointer.x)<.01);assert(Math.abs(pointer.y)<.01);},
        intersectObjects(visible,recursive){queriedRoots=visible;assert.equal(recursive,true);return [{object:meshes[target]}];}}
  },
  entries:new Map(candidates.map(c=>[c.id,{root:c.root}]))
 };
 assert.equal(AvatarRoster.prototype.pickSelector.call(selection,500,300),'operator03');
 assert.equal(queriedRoots.length,4);
 assert(roots.every(root=>root.updated));
 target=0;
 assert.equal(AvatarRoster.prototype.pickSelector.call(selection,500,300),'operator01');
 target=3;
 assert.equal(AvatarRoster.prototype.pickSelector.call(selection,500,300),'operator04');
});

test('Selector ignores taps outside the scene and hidden avatars',()=>{
 const root={visible:false,updateMatrixWorld(){}};
 const selection={
  world:{renderer:{domElement:{getBoundingClientRect(){return {left:100,top:50,right:900,bottom:550,width:800,height:500};}}},
    camera:{updateMatrixWorld(){}},ray:{setFromCamera(){},intersectObjects(arr){assert.equal(arr.length,0);return [];}}},
  entries:new Map([['operator01',{root}]])
 };
 assert.equal(AvatarRoster.prototype.pickSelector.call(selection,20,20),null);
 assert.equal(AvatarRoster.prototype.pickSelector.call(selection,500,300),null);
});

test('Animated GLB raycast misses fall back to actual on-screen body bounds',()=>{
 const camera=new T.PerspectiveCamera(43,800/500,.1,180);
 camera.position.set(0,1.7,7);camera.lookAt(0,.95,0);camera.updateMatrixWorld(true);
 const roots=['operator01','operator02','operator03','operator04'].map((id,i)=>{
  const root=new T.Group();root.name=id;root.position.set((i-1.5)*1.2,0,0);root.updateMatrixWorld(true);return root;
 });
 const roster={
  world:{
   camera,
   renderer:{domElement:{getBoundingClientRect(){return {left:0,top:0,right:800,bottom:500,width:800,height:500};}}},
   ray:{setFromCamera(){},intersectObjects(){return [];}}
  },
  entries:new Map(roots.map(root=>[root.name,{root,definition:{height:1.83}}]))
 };
 for(let i=0;i<4;i++){
  const mid=new T.Vector3(0,.915,0);roots[i].localToWorld(mid);mid.project(camera);
  const x=(mid.x+1)*400,y=(1-mid.y)*250;
  assert.equal(AvatarRoster.prototype.pickSelector.call(roster,x,y),roots[i].name);
 }
 assert.equal(AvatarRoster.prototype.pickSelector.call(roster,400,20),null);
});

test('3D selection taps are routed through the canvas gesture handler',()=>{
 const source=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert(source.includes("canLook:()=>phase==='character'||phase==='play'"));
 assert(source.includes("onTap:(x,y)=>{if(phase==='character'){const id=avatars?.pickSelector(x,y);if(id)selectAvatar(id);return;}"));
 assert(source.includes("node.querySelectorAll('button').forEach(b=>b.onclick=()=>selectAvatar(b.dataset.character))"));
});
