import {test} from 'node:test';import assert from 'node:assert/strict';
import {newGame,startOffice,accelerate,useOfficeComputer,restore} from '../dist/chapter/state.mjs';
import {CLEARABLES,CONFIG} from '../dist/chapter/config.mjs';
import {missionDestination,edgeBearing,guidanceTargets,GUIDE_CATEGORIES,markerIcon} from '../dist/chapter/guidance.mjs';
import {syncOfficeAccess,entranceLocked} from '../dist/chapter/office-access.mjs';
import {footSupportHeight} from '../dist/animation/support-ground.mjs';
import {transitionLook} from '../dist/camera/transition-look.mjs';
import {createMotion,moveController} from '../dist/animation/movement.mjs';
test('each first chapter mission points to a real location and cleaning targets remain stable until removed',()=>{
 const s=newGame('es'),g=missionDestination(s,null,()=>.5);assert.equal(g.id,'clear-8');assert.equal(missionDestination(s,g.id,()=>0).id,g.id);s.cleared.push(g.id);assert.notEqual(missionDestination(s,g.id,()=>0).id,g.id);
 s.cleared=CLEARABLES.map(o=>o.id);assert.equal(missionDestination(s).mission,'build');assert.equal(missionDestination(s).x,CONFIG.officeSlot.access.x);
 startOffice(s,'office01',100);assert.equal(missionDestination(s).mission,'speed');accelerate(s,101);assert.equal(missionDestination(s).mission,'enter');
 s.position={x:-7.99,z:-.5};syncOfficeAccess(s);const c=missionDestination(s);assert.equal(c.icon,'computer');assert.equal(c.mission,'admin');useOfficeComputer(s,102);assert.equal(missionDestination(s).mission,'hsec');assert.equal(missionDestination(s).id,'hsec-step-0');
});
test('edge indicator preserves behind/right/left bearings when the camera rotates, in small landscape sizes',()=>{
 for(const [w,h]of[[844,390],[568,320]])for(const heading of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  const right={x:Math.cos(heading)*5+Math.sin(heading)*3,z:-Math.sin(heading)*5+Math.cos(heading)*3};
  const edge=edgeBearing(right.x,right.z,heading,w,h);assert(edge.behind);assert(edge.x>w/2);assert(edge.y>h/2);assert(edge.x<=w-54+.001);assert(edge.y<=h-94+.001);
 }
 assert(edgeBearing(-5,3,0,844,390).x<422);
});
test('an old save walked into the office without entry becomes usable without relocating or charging the player',()=>{
 const s=newGame();s.cleared=CLEARABLES.map(o=>o.id);startOffice(s,'office01',100);accelerate(s,101);s.position={x:-7,z:0};s.inside=false;s.hasEntered=false;const cash=s.cash,ledger=s.ledger.length,pos={...s.position};assert(syncOfficeAccess(s));assert(s.inside&&s.hasEntered);useOfficeComputer(s,102);assert(s.chapterCompletedAt);assert.deepEqual(s.position,pos);assert.equal(s.cash,cash);assert.equal(s.ledger.length,ledger);assert.equal(syncOfficeAccess(s),false);assert(restore(s).chapterCompletedAt);
});
test('closed exterior entrance cannot be bypassed; exit keeps the door open through the landing then relocks',()=>{
 const s=newGame();s.office={status:'built',level:1};s.position={...CONFIG.officeSlot.access};assert(entranceLocked(s,-7.99,1.3,.33));
 s.inside=true;s.position={x:-7.99,z:2.4};assert.equal(syncOfficeAccess(s),false);assert(!entranceLocked(s,-7.99,1.3,.33));s.position.z=2.9;assert(syncOfficeAccess(s));assert(!s.inside);assert(entranceLocked(s,-7.99,1.3,.33));
});
test('foot probes cannot lift a grounded body through a wall but can follow real staircase treads',()=>{
 assert.equal(footSupportHeight(0,.42),0);assert.equal(footSupportHeight(0,.12),.12);assert.equal(footSupportHeight(.42,0),.42);assert.equal(footSupportHeight(.22,.32),.32);assert.equal(footSupportHeight(0,.12,true),0);
});
test('safety margin stops the controller before a prop with no movement into it and no continued steps',()=>{
 for(const dt of[1/60,1/30,.08]){const pos={x:0,z:2},m=createMotion();for(let i=0;i<4/dt;i++)moveController(pos,m,{x:0,z:-1},dt,(x,z)=>Math.hypot(x,z)<.5+.33+.045);assert(pos.z>=.875);assert(m.speed<.001);assert.equal(footSupportHeight(0,.42),0);}
});
test('cinematic registration slips are subtle and return exactly to an unobstructed game image',()=>{
 assert.equal(transitionLook(0).opacity,1);assert.equal(transitionLook(1).opacity,0);assert.equal(transitionLook(1).shift,0);assert(transitionLook(.21).glitch>0);assert(transitionLook(.53).glitch>0);
 for(let i=0;i<=100;i++){const fx=transitionLook(i/100);assert(Math.abs(fx.shift)<=3);assert(fx.glow<=.18);assert(fx.opacity>=0&&fx.opacity<=1);}
});

test('category glyphs are distinct and only real available targets are rendered, capped at three',()=>{
 assert.equal(new Set(Object.values(GUIDE_CATEGORIES).map(v=>v.color)).size,3);assert.equal(new Set(['main','secondary','optional'].map(markerIcon)).size,3);
 const primary={id:'a',x:1,z:2},goals=guidanceTargets(primary,[{id:'b',x:2,z:2,category:'secondary'},{id:'c',x:3,z:2,category:'optional'},{id:'d',x:4,z:2}]);assert.deepEqual(goals.map(g=>g.category),['main','secondary','optional']);assert.equal(goals.length,3);
 assert.equal(guidanceTargets(primary,[{...primary},{id:'done',x:1,z:2,completed:true},{id:'future',x:1,z:2,available:false},{id:'bad',x:NaN,z:2}]).length,1);
});
