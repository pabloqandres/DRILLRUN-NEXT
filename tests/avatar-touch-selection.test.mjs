import test from 'node:test';
import assert from 'node:assert/strict';
import {AvatarRoster} from '../dist/chapter/avatar-roster.mjs';

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
