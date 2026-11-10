import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drivePersonalTruck,personalTruckVisualSteer} from '../dist/mission5/personal-drilltruck.mjs';
import {icon} from '../dist/chapter/icons.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('V54 screen-right and right arrow send the same corrected wheel direction',()=>{
 assert.equal(personalTruckVisualSteer(1),-1);
 assert.equal(personalTruckVisualSteer(.6),-.6);
 assert.equal(personalTruckVisualSteer(-1),1);
 assert.equal(personalTruckVisualSteer(0),0);
 assert.equal(personalTruckVisualSteer(3),-1);
 assert.equal(personalTruckVisualSteer(-3),1);
 const game=read('dist/chapter/game.mjs');
 assert.match(game,/let throttle=-joy\.y,steer=joy\.x;/);
 assert.match(game,/if\(keys\.a\|\|keys\.arrowleft\)steer-=1;/);
 assert.match(game,/if\(keys\.d\|\|keys\.arrowright\)steer\+=1;/);
 assert.match(game,/steer:personalTruckVisualSteer\(steer\)/);
});
test('V54 right versus left input produces opposite rotations at speed',()=>{
 const truck=()=>({mission5:{personalTruck:{mode:'driving',speed:3.0,heading:0,position:{x:0,z:0}}},position:{x:0,z:0}});
 const right=truck(),left=truck();
 for(let k=0;k<15;k++){
  drivePersonalTruck(right,{throttle:0,steer:personalTruckVisualSteer(1)},.08,()=>false);
  drivePersonalTruck(left,{throttle:0,steer:personalTruckVisualSteer(-1)},.08,()=>false);
 }
 assert(right.mission5.personalTruck.heading<0);
 assert(left.mission5.personalTruck.heading>0);
 assert.equal(Math.sign(right.mission5.personalTruck.heading),-Math.sign(left.mission5.personalTruck.heading));
});
test('V54 icons are pictograms, not text, with accessible labels and true yellow light state',()=>{
 const html=read('dist/index.html'),css=read('dist/chapter/drilltruck-controls-v54.css'),game=read('dist/chapter/game.mjs');
 assert.match(html,/id="personalTruckLights"[^>]*aria-pressed="false"[^>]*><span data-icon="truck-headlamp"><\/span>/);
 assert.match(html,/id="personalTruckBrake"[^>]*><span data-icon="truck-brake"><\/span>/);
 assert.match(html,/drilltruck-controls-v54\.css\?v=54/);
 assert.match(icon('truck-headlamp'),/svg/);
 assert.match(icon('truck-brake'),/svg/);
 assert.match(css,/#hud #personalTruckLights\.lightsOn/);
 assert.match(css,/color:#ffdd55!important/);
 assert.match(css,/right:var\(--safe-r,18px\)!important/);
 assert.match(css,/body\.drilltruckDriving #hud #builderButton/);
 assert.match(game,/classList\.toggle\('lightsOn',on\)/);
 assert.match(game,/setAttribute\('aria-pressed',String\(on\)\)/);
 assert.match(game,/classList\.toggle\('drilltruckDriving',driving\)/);
 assert.doesNotMatch(game,/#\('personalTruckLights'\)\.textContent=/);
 assert.match(game,/truckBrakePressed=true/);
 assert.match(game,/truckBrakePressed=false/);
});
