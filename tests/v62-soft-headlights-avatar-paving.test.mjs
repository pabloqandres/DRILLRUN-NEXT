import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {avatarPavementClearance} from '../dist/animation/avatar-pavement-clearance.mjs';
import {footSupportHeight} from '../dist/animation/support-ground.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const patio={x:-51,z:-17,w:54.4,d:43.4,y:.19,_patioL1:true};
const near=(a,b,tol=.001)=>Math.abs(a-b)<=tol;

test('V63 preserves warm, soft spotlight rig without the V61 white road laser',()=>{
 const h=source('dist/graphics/personal-drilltruck-headlights.mjs');
 const game=source('dist/chapter/game.mjs');
 assert.match(h,/new T\.SpotLight\(WARM_BEAM,0,35,Math\.PI\/7,\.65,1\.3\)/);
 assert.match(h,/lamp\.target\.position\.set\(x\*1\.7,-\.35,17\)/);
 assert.match(h,/lamp\.castShadow=false/);
 assert.match(h,/frontFill\.intensity=isOn\?3:0/);
 assert.match(h,/item\.intensity=isOn\?\(quality==='low'\?17:27\):0/);
 assert.match(game,/installPersonalTruckHeadlights\(m5PersonalTruckModel,world\)/);
 assert.match(game,/m5TruckLighting\?\.set\(truck\.mode==='driving'/);
 assert.doesNotMatch(h,/roadLightTexture|projectPersonalTruckRoadLight|makeRoadProjection|AdditiveBlending|PROJECTION_LENGTH/);
 assert.match(h,/new T\.SpotLight\(WARM_BEAM/);
 assert.match(h,/T\.NormalBlending/);
 assert.match(h,/updatePersonalTruckWarmBounce/);
 assert.doesNotMatch(game,/m5TruckLighting\?\.project\(/);
});

test('V62 boots gain only a few centimetres over general paved Patio and road',()=>{
 const surfaces=[{x:3,z:5,w:2,d:2,y:.115},patio];
 assert(near(avatarPavementClearance(-51,-24,surfaces),.032)); // outside the elevated central road
 assert(near(avatarPavementClearance(-51,-14,surfaces),.040));
 assert(near(avatarPavementClearance(-51,3.2,surfaces),.125),
  'protected pedestrian deck is raised above regular paving');
 assert(near(avatarPavementClearance(3,5,surfaces),0));
 assert(near(avatarPavementClearance(85,-80,surfaces),0));
 assert(near(avatarPavementClearance(-51,-17,[]),0));
 assert(near(avatarPavementClearance(NaN,0,surfaces),0));
});
test('V62 boot contact fades smoothly at patio edge without teleport',()=>{
 const edge=-51+patio.w/2;
 const justInside=avatarPavementClearance(edge-.1,-17,[patio]);
 const farther=avatarPavementClearance(edge-.4,-17,[patio]);
 assert(justInside>0&&justInside<farther&&farther<.032);
 assert.equal(avatarPavementClearance(edge+.01,-17,[patio]),0);
 assert.equal(avatarPavementClearance(edge,-17,[patio]),0);
});
test('V62 real avatar root and sole IK share visual pavement support, not saved terrain',()=>{
 const scene=source('dist/scene.mjs');
 assert.match(scene,/import \{avatarPavementClearance\} from '\.\/animation\/avatar-pavement-clearance\.mjs'/);
 assert.match(scene,/const avatarGround=\(x,z\)=>this\.sampleGround\(x,z\)\+/);
 assert.match(scene,/const terrainY=avatarGround\(state\.position\.x,state\.position\.z\)/);
 assert.match(scene,/footSupportHeight\(terrainY,avatarGround\(x,z\)/);
 assert.match(scene,/this\.player\.position\.set\(state\.position\.x,this\.playerGround,state\.position\.z\)/);
 assert.match(scene,/sampleGround\(x,z\)\{let y=this\.chapterMode\?desertGroundHeight\(x,z\):0/);
 assert.equal(footSupportHeight(.225,.225,false),.225);
 // Existing 15 cm wall/step protection still applies.
 assert.equal(footSupportHeight(.225,.70,true),.225);
 assert.equal(footSupportHeight(.225,.70,false),.225);
});
