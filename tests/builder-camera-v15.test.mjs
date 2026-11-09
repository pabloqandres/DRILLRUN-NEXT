import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {FollowCamera} from '../dist/camera/follow-camera.mjs';

const input=(focus={x:2,z:0,key:'road-1',distance:14})=>({
 position:{x:0,z:0},ground:0,height:1.85,
 orbit:{yaw:0,pitch:0},mode:'builder',focus,
 obstacles:[{owner:'shed',x:2,z:0,w:12,d:10,minY:0,maxY:8}],
 snap:true
});

test('builder starts over nearby roof without wall-clipping down to the player',()=>{
 const cam=new T.PerspectiveCamera(57,1.6,.01,180),rig=new FollowCamera(cam);
 rig.update(1/60,{position:{x:0,z:0},ground:0,height:1.85,snap:true});
 const result=rig.update(1/60,input());
 assert.equal(result.collision,false);
 assert(result.distance>=21.9);
 assert(cam.position.y>20);
 assert.equal(result.pitch,80);
});

test('builder zoom reaches a full terrain overview and never resets with new draft points',()=>{
 const rig=new FollowCamera(new T.PerspectiveCamera());
 rig.update(1/60,input());
 rig.zoomBy(-10);
 const next=rig.update(1/60,input({x:7,z:1,key:'road-2',distance:8}));
 assert.equal(next.selectedDistance,70);
 rig.zoomBy(10);
 const close=rig.update(1/60,input({x:8,z:2,key:'road-3',distance:8}));
 assert.equal(close.selectedDistance,10);
});

test('builder pan moves the aerial frame without changing original placement focus',()=>{
 const rig=new FollowCamera(new T.PerspectiveCamera());
 const focus={x:2,z:0,key:'crossing-1',distance:14};
 rig.update(1/60,input(focus));
 rig.panBuilder(4,-3);
 rig.update(1/60,input({x:2,z:0,key:'crossing-2',distance:8}));
 assert(Math.abs(rig.target.x-6)<.0001);
 assert(Math.abs(rig.target.z+3)<.0001);
 assert.deepEqual(focus,{x:2,z:0,key:'crossing-1',distance:14});
 rig.panBuilder(1000,1000);
 rig.update(1/60,input());
 assert(rig.target.x<=19&&rig.target.z<=13);
});

test('exiting builder restores unchanged first-person camera preset/zoom',()=>{
 const rig=new FollowCamera(new T.PerspectiveCamera());
 const ordinary={position:{x:0,z:0},ground:0,height:1.85,snap:true};
 const prior=rig.update(1/60,ordinary);
 rig.update(1/60,input());
 rig.zoomBy(-10);
 const after=rig.update(1/60,ordinary);
 assert.equal(after.selectedDistance,prior.selectedDistance);
 assert.equal(after.preset,'B');
});
