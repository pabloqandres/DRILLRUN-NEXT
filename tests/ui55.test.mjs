import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {World} from '../dist/scene.mjs';
import {ChapterScene} from '../dist/chapter/world.mjs';
import {CONFIG,CLEARABLES,PRODUCTS} from '../dist/chapter/config.mjs';
import {clearableModel} from '../dist/chapter/clearables.mjs';
import {furnitureModel} from '../dist/chapter/furniture.mjs';
import {newGame,restore,clearObject,transfer,startOffice,accelerate,purchase,placeItem} from '../dist/chapter/state.mjs';
import {availableMessages,unreadMessages,readMessage,collectUIEvents} from '../dist/chapter/ui-state.mjs';
function factory(){const w=Object.create(World.prototype);return Object.assign(w,{gradient:null,materials:new Map(),bevelCache:new Map(),unit:new T.BoxGeometry(1,1,1),edges:new T.EdgesGeometry(new T.BoxGeometry(1,1,1)),edgeMat:new T.LineBasicMaterial()});}
function built(){const s=newGame('es','gaspar',1000);for(const o of CLEARABLES){s.position={x:o.x,z:o.z+.9};clearObject(s,o.id,1000);}startOffice(s,'office01',1000);accelerate(s,1001);s.hasEntered=s.inside=true;return s;}
test('distributed debris has four readable families, stable save IDs, varied silhouettes and bounded geometry',()=>{
 assert.equal(CLEARABLES.length,16);assert.deepEqual(new Set(CLEARABLES.map(o=>o.kind)),new Set(['rock','bush','crate','metal']));assert.deepEqual(CLEARABLES.map(o=>o.id),Array.from({length:16},(_,i)=>'clear-'+i));
 assert(CLEARABLES.filter(o=>Math.abs(o.x+6)>3||Math.abs(o.z)>1.25).length>=10);assert(new Set(CLEARABLES.map(o=>o.size)).size>=8);
 const w=factory();let triangles=0,meshes=0;for(const o of CLEARABLES){const model=clearableModel(w,o);model.traverse(m=>{if(!m.isMesh)return;meshes++;const p=m.geometry.attributes.position;assert([...p.array].every(Number.isFinite));triangles+=(m.geometry.index?.count||p.count)/3;});const box=new T.Box3().setFromObject(model);assert(box.min.y>=-.02&&box.min.y<=.001,'prop must contact terrain: '+o.id);if(o.kind==='bush'&&o.variant!==1)assert(box.max.y<.65,'desert scrub must have a low silhouette');assert(box.max.y<1.5);assert(box.max.x-box.min.x> .35);}
 assert(triangles<25000);assert(meshes<=90);console.log('clearable prop budget',{triangles,meshes});
});
test('all dispersed clearables have reachable hand-action positions using the same collision query',()=>{
 const s=newGame('es','gaspar',1000),owner={state:s};const isBlocked=(x,z)=>x< -12.65||x>2.65||z< -5.65||z>8.65||ChapterScene.prototype.blocked.call(owner,x,z,.33);
 const step=.25,start={x:CONFIG.spawn.x,z:CONFIG.spawn.z},queue=[start],seen=new Set();let index=0;const key=(x,z)=>Math.round(x/step)+','+Math.round(z/step);seen.add(key(start.x,start.z));
 while(index<queue.length){const p=queue[index++];for(const [dx,dz]of[[step,0],[-step,0],[0,step],[0,-step]]){const x=p.x+dx,z=p.z+dz,k=key(x,z);if(seen.has(k)||isBlocked(x,z))continue;seen.add(k);queue.push({x,z});}}
 for(const o of CLEARABLES)assert(queue.some(p=>Math.hypot(p.x-o.x,p.z-o.z)<1.5),'unreachable '+o.id);assert(queue.some(p=>Math.hypot(p.x+7.99,p.z-2.9)<.7));
});
test('new mentor messages follow actual construction, read state and notifications survive restore without repetition',()=>{
 const s=newGame('es','gaspar',1000);assert.equal(availableMessages(s).length,1);assert.equal(unreadMessages(s).length,1);assert.equal(collectUIEvents(s).length,1);assert.equal(collectUIEvents(s).length,0);assert(!readMessage(s,'office-store'));readMessage(s,'welcome');assert.equal(unreadMessages(s).length,0);
 for(const o of CLEARABLES){s.position={x:o.x,z:o.z+.9};clearObject(s,o.id,1000);}assert.deepEqual(collectUIEvents(s).map(e=>e.id),['mission:clear']);startOffice(s,'office01',1000);assert.equal(availableMessages(s).length,1);accelerate(s,1001);assert.equal(availableMessages(s).length,2);const events=collectUIEvents(s);assert(events.some(e=>e.id==='message:office-store'));assert(events.some(e=>e.id==='mission:office'));assert.equal(unreadMessages(s).length,1);
 const restored=restore(JSON.parse(JSON.stringify(s)),1002);assert.equal(collectUIEvents(restored).length,0);assert.equal(unreadMessages(restored).length,1);readMessage(restored,'office-store');assert.equal(unreadMessages(restored).length,0);assert.equal(restored.cash,2000);
});
test('old HOTFIX 005 saves retain progress, inventory and default finishes without replaying old mission rewards',()=>{
 const old=built();delete old.messageReads;delete old.uiEvents;old.messageRead=true;old.inventory=[{id:'item-20',product:'desk'}];const restored=restore(old,1002);assert.equal(restored.inventory[0].variant,'oak');assert.deepEqual(restored.messageReads,['welcome']);assert.equal(collectUIEvents(restored).length,0);assert.equal(restored.office.status,'built');assert.equal(restored.cleared.length,16);
});
test('included workstation finishes use the same original model factory and change materials, not silhouettes',()=>{
 const s=built();assert.equal(s.inventory.find(v=>v.product==='desk').variant,'oak');assert.equal(s.inventory.find(v=>v.product==='computer').variant,'basic');const w=factory(),normal=furnitureModel(w,'desk','oak'),variant=furnitureModel(w,'desk','ivory');const colours=g=>g.children.filter(o=>o.isMesh).map(o=>o.material.color.getHex());assert.notDeepEqual(colours(normal),colours(variant));const counts=g=>g.children.filter(o=>o.isMesh).map(o=>o.geometry.attributes.position.count);assert.deepEqual(counts(normal),counts(variant));
});
import {reviewPath} from '../dist/chapter/qa-path.mjs';
import {createMotion,moveController} from '../dist/animation/movement.mjs';
test('the review route walks to all sixteen props with real collisions, hand range and finite energy',()=>{
 const s=newGame('es','gaspar',1000),owner={state:s},motion=createMotion();motion.turnBeforeMove=true;const block=(x,z)=>x< -12.65||x>2.65||z< -5.65||z>8.65||ChapterScene.prototype.blocked.call(owner,x,z,.33);
 let frames=0;while(s.cleared.length<16&&frames<30000){const obj=CLEARABLES.filter(o=>!s.cleared.includes(o.id)).sort((a,b)=>Math.hypot(a.x-s.position.x,a.z-s.position.z)-Math.hypot(b.x-s.position.x,b.z-s.position.z))[0];if(Math.hypot(s.position.x-obj.x,s.position.z-obj.z)<1.5){clearObject(s,obj.id,1000);continue;}const path=reviewPath(s.position,obj,block,1.25);assert(path.length,'no route '+obj.id);for(const goal of path){let guard=0;while(Math.hypot(goal.x-s.position.x,goal.z-s.position.z)>.12&&guard++<250){const dx=goal.x-s.position.x,dz=goal.z-s.position.z,d=Math.hypot(dx,dz),speed=Math.min(1,d/.3);moveController(s.position,motion,{x:dx/d*speed,z:dz/d*speed},1/30,block);frames++;}assert(guard<250,'controller stuck at '+obj.id);}}
 assert.equal(s.cleared.length,16);assert.equal(s.energy,4);console.log('full controller cleaning route frames',frames);
});
import {setPlayerIdentity} from '../dist/chapter/state.mjs';
test('personal identity validates an available model, persists a custom name and migrates old named slots',()=>{
 const s=newGame('es','gaspar',1000);assert.equal(CONFIG.protagonists.length,4);assert.equal(CONFIG.protagonists.filter(p=>p.available).length,4);assert.throws(()=>setPlayerIdentity(s,'invented','Pablo'),/avatarPending/);assert.throws(()=>setPlayerIdentity(s,'operator01',' '),/nameRequired/);setPlayerIdentity(s,'operator01','  Pablo   Rubio  ');assert.equal(s.playerName,'Pablo Rubio');assert.equal(s.character,'operator01');const loaded=restore(JSON.parse(JSON.stringify(s)),1001);assert.equal(loaded.playerName,'Pablo Rubio');assert.equal(loaded.character,'operator01');const old={...s,character:'paula'};delete old.playerName;const migrated=restore(old,1001);assert.equal(migrated.character,'operator01');assert.equal(migrated.playerName,'');assert.equal(migrated.cash,5000);
});

import {officeBlocked} from '../dist/assets3d/office-layout.mjs';
import {AVATARS} from '../dist/chapter/avatars.mjs';
test('every avatar can walk from the entry to the included computer without crossing walls or furniture',()=>{
 for(const avatar of AVATARS){const s=built(),owner={state:s},motion=createMotion();motion.turnBeforeMove=true;s.position={x:-7.99,z:-.5};const f=s.furniture.find(f=>s.inventory.find(i=>i.id===f.id)?.product==='computer'),goal={x:-6+f.x,z:f.z},blocked=(x,z)=>officeBlocked(x+6,z,avatar.radius,{entry:Math.PI/2})||ChapterScene.prototype.blocked.call(owner,x,z,avatar.radius),path=reviewPath(s.position,goal,blocked,1.4);assert(path.length,avatar.id+' missing computer route');for(const point of path){let guard=0;while(Math.hypot(point.x-s.position.x,point.z-s.position.z)>.12&&guard++<300){const dx=point.x-s.position.x,dz=point.z-s.position.z,d=Math.hypot(dx,dz),power=Math.min(1,d/.3);moveController(s.position,motion,{x:dx/d*power,z:dz/d*power},1/30,blocked);}assert(guard<300,avatar.id+' stuck');}assert(Math.hypot(s.position.x-goal.x,s.position.z-goal.z)<1.5,avatar.id+' outside hand reach');}
});
