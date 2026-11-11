import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPatioGateMotion,advancePatioGateMotion,GATE_TRAVEL_MS,GATE_HOLD_OPEN_MS}
 from '../dist/animation/patio-gate-motion.mjs';
import {visualTruckGroundHeight} from '../dist/graphics/personal-truck-grounding.mjs';
import {barrierBlocksPlayer} from '../dist/mission5/gate-control.mjs';
const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const patio=source('dist/mission5/patio-world.mjs'),game=source('dist/chapter/game.mjs');
const near=(a,b,tol=.001)=>Math.abs(a-b)<tol;

test('V59 gate opens over 1.6 seconds independent of 30/60/120 FPS',()=>{
 assert.equal(GATE_TRAVEL_MS,1600);
 for(const frames of [30,60,120]){
  const state=createPatioGateMotion();
  for(let i=0;i<=frames;i++)advancePatioGateMotion(state,true,1600*i/frames);
  assert(near(state.angle,-Math.PI/2),frames+' FPS did not reach raised position');
  const mid=createPatioGateMotion();
  advancePatioGateMotion(mid,true,0);
  advancePatioGateMotion(mid,true,800);
  assert(near(mid.angle,-Math.PI/4),'halfway point should be predictable');
  assert.equal(barrierBlocksPlayer(mid.angle),true,'do not disable HSEC barrier too early');
  advancePatioGateMotion(mid,true,1600);
  assert.equal(barrierBlocksPlayer(mid.angle),false);
 }
});
test('V59 gate stays open after sensor release, then closes smoothly without snapping',()=>{
 const motion=createPatioGateMotion();
 advancePatioGateMotion(motion,true,0);
 advancePatioGateMotion(motion,true,1600);
 advancePatioGateMotion(motion,false,1601);
 assert(near(motion.angle,-Math.PI/2));
 advancePatioGateMotion(motion,false,1600+GATE_HOLD_OPEN_MS-1);
 assert(near(motion.angle,-Math.PI/2),'gate must hold open for a passing vehicle');
 const t=1600+GATE_HOLD_OPEN_MS+10;
 advancePatioGateMotion(motion,false,t);
 assert(near(motion.angle,-Math.PI/2),'closing begins at open angle');
 advancePatioGateMotion(motion,false,t+800);
 assert(near(motion.angle,-Math.PI/4));
 advancePatioGateMotion(motion,false,t+1600);
 assert(near(motion.angle,0));
});
test('V59 immediate reversal is smooth and the HSEC blocker reflects real arm angle',()=>{
 const m=createPatioGateMotion();
 advancePatioGateMotion(m,true,0);
 const a=advancePatioGateMotion(m,true,400);
 advancePatioGateMotion(m,false,400); // still requested shortly before; hold, no jump
 assert(near(m.angle,a));
 const before=advancePatioGateMotion(m,false,2100);
 advancePatioGateMotion(m,true,2100);
 assert(near(before,m.angle),'re-opening may not teleport arm geometry');
 assert(m.angle<=0&&m.angle>=-Math.PI/2);
});
test('V59 personal GLB bottom is supported on raised asphalt and concrete',()=>{
 const p={x:0,z:0};
 assert(near(visualTruckGroundHeight(p,0,()=>.19,0),.205));
 assert(near(visualTruckGroundHeight(p,0,()=>.48,-.16),.655));
 assert(near(visualTruckGroundHeight(p,0,()=>.17,.08),.105));
 // A tyre crossing a raised pad should hold the underbody up.
 const elevation=(x,z)=>x>1?.48:.19;
 assert(near(visualTruckGroundHeight({x:.3,z:0},0,elevation,0),.495));
 const rotating=(x,z)=>z<-.5?.42:.19;
 assert(near(visualTruckGroundHeight({x:0,z:0},Math.PI/2,rotating,0),.435));
 assert.equal(visualTruckGroundHeight({x:NaN,z:5},0,()=>.2),.12);
});
test('V59 yard has nighttime pools above logistic slabs, covered bays and all heavy pads',()=>{
 assert.match(patio,/function canopyWorklight\(/);
 assert.match(patio,/const canopyLights=\[/);
 assert.match(patio,/const canopyBudget=w\.quality==='low'\?1/);
 assert.match(patio,/pool\.position\.y=floorY/);
 assert.match(patio,/\[-19,-11\.2,\.525\]/);
 assert.match(patio,/\[1\.5,14\.3,\.525\]/);
 assert.match(patio,/\[-7,-13,18,\.295\]/);
 assert.match(patio,/\[20,-3\.2,14,\.295\]/);
 assert.match(patio,/for\(const pool of bayPools\)pool\.material\.opacity=night\?\.39:0/);
 assert.match(patio,/new T\.PointLight\(0xffedc1,0,17,2\)/);
});
test('V59 only corrects visual height: no driving physics or paid vehicle state changes',()=>{
 assert.match(game,/m5PersonalTruckModel\.userData\.groundContactMinY/);
 assert.match(game,/new T\.Box3\(\)\.setFromObject\(m5PersonalTruckModel\)/);
 assert.match(game,/const visualY=visualTruckGroundHeight\(truck\.position,truck\.heading/);
 assert.match(game,/world\.sampleGround\(x,z\)/);
 assert.match(game,/m5PersonalTruckModel\.position\.set\(truck\.position\.x,visualY,truck\.position\.z\)/);
 assert.match(game,/drivePersonalTruck\(s,\{throttle,steer:personalTruckVisualSteer\(steer\)/);
 assert.match(patio,/advancePatioGateMotion\(gateMotion,barrierOpen,now\)/);
 assert.match(patio,/setBarrierBlocking\(barrierBlocksPlayer\(access\.rotation\.x\)\)/);
 assert.match(patio,/Math\.hypot\(driverTruck\.position\.x-PATIO_L1\.gate\.x/);
});
