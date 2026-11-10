import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drivePersonalTruck} from '../dist/mission5/personal-drilltruck.mjs';
import {PATIO_L1} from '../dist/mission5/patio-state.mjs';
import {assetDefinition} from '../dist/hsec/catalog.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const truck=(position={x:0,z:0},heading=0,speed=3)=>({
 mission5:{personalTruck:{mode:'driving',heading,speed,position:{...position}}},
 position:{...position}
});
test('Painted pedestrian crossing is traversable while keeping physical colliders',()=>{
 const s=truck({x:PATIO_L1.gate.x-2,z:PATIO_L1.gate.z},Math.PI/2,3);
 const first={...s.position};
 for(let i=0;i<8;i++)drivePersonalTruck(s,{throttle:1,steer:0},.08,()=>false);
 assert.ok(s.position.x>first.x);
 assert.ok(s.position.x-first.x>1.5);
 assert.equal(Boolean(assetDefinition('crossing').solid),false);
 assert.equal(Boolean(assetDefinition('marking').solid),false);
});
test('Drive parallel to a curb if bumper clips its corner; no 360-degree freeze',()=>{
 const s=truck({x:0,z:0},Math.PI/4,4);
 let calls=0;
 const wall=(x,z,r)=>{calls++;return x>=2.57-r;};
 const result=drivePersonalTruck(s,{throttle:1,steer:0},.08,wall);
 assert.equal(result.blocked,true);
 assert.equal(s.position.x,0,'cannot pass through the wall');
 assert.ok(s.position.z>0,'car slides along the clear direction');
 assert.ok(s.mission5.personalTruck.speed>0,'does not stop fully on a curb');
 assert.ok(calls>=9,'physical hull probed');
});
test('Hard walls still stop the entire truck; do not disable HSEC barriers',()=>{
 const s=truck(),original={...s.position};
 const result=drivePersonalTruck(s,{throttle:1},.08,()=>true);
 assert.equal(result.blocked,true);
 assert.deepEqual(s.position,original);
 assert.equal(s.mission5.personalTruck.speed,0);
});
test('Already touching a boundary, reversing can escape safely',()=>{
 const s=truck({x:0,z:0},0,-3);
 const wall=(x,z,r)=>Math.abs(z-2.35)<r+.025;
 const result=drivePersonalTruck(s,{throttle:0,steer:0},.08,wall);
 assert.ok(result.position.z<0,'reverse backs away from obstruction');
 assert.ok(result.speed<0,'do not freeze reverse');
});
test('Catalog snapshot contexts are explicitly freed on Android',()=>{
 const source=read('dist/chapter/product-preview.mjs');
 const hsec=read('dist/hsec/world.mjs');
 assert.match(source,/this\.renderer\.dispose\?\.\(\)/);
 assert.match(source,/this\.renderer\.forceContextLoss\?\.\(\)/);
 assert.match(source,/let snapshotRenderer=null/);
 assert.match(source,/if\(ephemeral&&transparent\)/);
 assert.match(source,/new ProductPreview\(host,world,\{transparent:true,ephemeral:true\}\)/);
 assert.match(source,/antialias:false,alpha:transparent/);
 assert.match(hsec,/finally\{preview\?\.dispose\(\);host\.remove\(\);\}/);
});
test('World graphics loss produces safe reload and Settings recovery',()=>{
 const game=read('dist/chapter/game.mjs');
 const index=read('dist/index.html');
 const css=read('dist/chapter/render-recovery-v55.css');
 assert.match(game,/canvas\.addEventListener\('webglcontextlost'/);
 assert.match(game,/canvas\.addEventListener\('webglcontextrestored'/);
 assert.match(game,/event\.preventDefault\(\)/);
 assert.match(game,/sessionStorage\.getItem\(key\)/);
 assert.match(game,/function restart3DView\(\)/);
 assert.match(game,/id="recoverView3D"/);
 assert.match(game,/\$\('#recoverView3D'\)\.onclick=restart3DView/);
 assert.match(game,/if\(personalTruck\(s\)\?\.mode==='driving'\)\{/);
 assert.match(game,/catalogNav\.disabled=driving/);
 assert.match(index,/render-recovery-v55\.css/);
 assert.match(css,/#worldRenderRecovery/);
});
