import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {SiteCinematics} from '../dist/graphics/site-cinematics.mjs';

function withCanvas(fn){
 const original=globalThis.document;
 const context={
  createRadialGradient:()=>({addColorStop(){}}),
  fillRect(){},fillStyle:''
 };
 globalThis.document={
  hidden:false,createElement:()=>({width:64,height:64,getContext:()=>context})
 };
 try{return fn()}finally{
  if(original===undefined)delete globalThis.document;
  else globalThis.document=original;
 }
}
test('decorative worksite FX display only for actual built assets and active equipment',()=>withCanvas(()=>{
 const world={scene:new T.Scene(),quality:'balanced'};
 const fx=new SiteCinematics(world);
 const drill={position:new T.Vector3(4,0,-5)},truck={position:new T.Vector3(2,0,-9),rotation:{y:1.4}};
 const s={office:{status:'built'},workshop:{status:'built'},position:{x:-7.6,z:-9.3}};
 fx.update(s,.15,6,{drill,truck,drilling:true,truckMoving:true,playing:true});
 assert.equal(fx.office.visible,true);
 assert.equal(fx.workshop.visible,true);
 assert.equal(fx.rig.visible,true);
 assert.equal(fx.truck.visible,true);
 assert.equal(fx.rigShadow.visible,true);
 assert.equal(fx.truckShadow.visible,true);
 assert.equal(fx.dust.visible,true);
 assert(fx.rigLamp.intensity>0);
 fx.update({office:{status:'unbuilt'},position:{x:0,z:0}},.12,9,{playing:true});
 assert.equal(fx.office.visible,false);
 assert.equal(fx.workshop.visible,false);
 assert.equal(fx.truck.visible,false);
 assert.equal(fx.rig.visible,false);
 fx.dispose();
 assert.equal(fx.world,null);
}));

test('low graphics preset excludes incidental particle effects',()=>withCanvas(()=>{
 const world={scene:new T.Scene(),quality:'low'};
 const fx=new SiteCinematics(world);
 fx.update({office:{status:'built'},workshop:{status:'built'},position:{x:-7,z:-9}},.2,12,{
  truck:{position:new T.Vector3(4,0,2),rotation:{y:0}},truckMoving:true,playing:true
 });
 assert.equal(fx.dust.visible,false);
 assert.equal(fx.sparks.visible,false);
 fx.dispose();
}));
