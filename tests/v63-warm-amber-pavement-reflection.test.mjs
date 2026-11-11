import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {readFileSync} from 'node:fs';
import {updatePersonalTruckWarmBounce} from '../dist/graphics/personal-drilltruck-headlights.mjs';
const src=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const near=(a,b,tol=.001)=>Math.abs(a-b)<=tol;
const bounce=(forward,halfWidth,halfLength)=>{
 const geometry=new T.PlaneGeometry(1,1,7,7);
 return {geometry,spec:{forward,halfWidth,halfLength}};
};
test('V63 is amber rather than white, keeps unchanged soft light cone',()=>{
 const s=src('dist/graphics/personal-drilltruck-headlights.mjs');
 assert.match(s,/const WARM_BEAM=0xffd19a/);
 assert.match(s,/const WARM_FILL=0xffbd7f/);
 assert.match(s,/const WARM_LENS=0xffd7a5/);
 assert.match(s,/new T\.SpotLight\(WARM_BEAM,0,35,Math\.PI\/7,\.65,1\.3\)/);
 assert.match(s,/lamp\.target\.position\.set\(x\*1\.7,-\.35,17\)/);
 assert.match(s,/lamp\.castShadow=false/);
 assert.match(s,/item\.intensity=isOn\?\(quality==='low'\?17:27\):0/);
});
test('V63 soft pavement reflection uses only small oval glows with fully transparent edges',()=>{
 const s=src('dist/graphics/personal-drilltruck-headlights.mjs');
 assert.match(s,/forward:3\.8,halfWidth:2\.6,halfLength:3\.2,nightOpacity:\.52/);
 assert.match(s,/forward:7\.1,halfWidth:3\.4,halfLength:3\.7,nightOpacity:\.30/);
 assert.match(s,/glow\.addColorStop\(1,'rgba\(255,202,145,0\)'\)/);
 assert.match(s,/blending:T\.NormalBlending/);
 assert.doesNotMatch(s,/AdditiveBlending|makeRoadProjection|PROJECTION_LENGTH|projectPersonalTruckRoadLight/);
 assert.match(s,/new T\.PlaneGeometry\(1,1,GRID,GRID\)/);
 assert.match(s,/bounce\.mesh\.visible=isOn/);
 assert.match(s,/bounce\.material\.opacity=isOn\?bounce\.spec\.nightOpacity\*\(night\?1:\.13\):0/);
});
test('V63 pools follow vehicle heading and actual asphalt height over road markings',()=>{
 const a=bounce(3.8,2.6,3.2),b=bounce(7.1,3.4,3.7);
 const spots=[a,b];
 assert.equal(updatePersonalTruckWarmBounce(spots,{x:10,z:20},0,()=>.19),true);
 const centerIndex=(3*8+3);
 const p=a.geometry.getAttribute('position');
 // Paving is sampled as .19; glow is above its painted road markings at .26.
 assert(near(p.getY(centerIndex),.297));
 const front=p.getZ(centerIndex),right=p.getX(centerIndex);
 assert(right>9&&front>20,'heading 0 projects ahead on +Z');
 assert.equal(updatePersonalTruckWarmBounce(spots,{x:10,z:20},Math.PI/2,()=>.19),true);
 assert(p.getX(centerIndex)>right,'turning 90 degrees moves forward puddle toward +X');
 for(const bb of spots)bb.geometry.dispose();
});
test('V63 amber reflection follows uneven desert ground without paving-height offset',()=>{
 const b=bounce(3.8,2.6,3.2),p=b.geometry.getAttribute('position');
 const sample=(x,z)=>.03*x+.02*z;
 assert.equal(updatePersonalTruckWarmBounce([b],{x:0,z:0},0,sample),true);
 const i=4*8+4;
 assert(near(p.getY(i),sample(p.getX(i),p.getZ(i))+.045));
 assert.equal(updatePersonalTruckWarmBounce([b],{x:0,z:0},NaN,sample),false);
 assert.equal(updatePersonalTruckWarmBounce([b],{x:Infinity,z:0},0,sample),false);
 b.geometry.dispose();
});
test('V63 renders only while lights are on and dims nearly invisible in daytime',()=>{
 const s=src('dist/graphics/personal-drilltruck-headlights.mjs');
 const g=src('dist/chapter/game.mjs');
 assert.match(s,/bounce\.material\.opacity=isOn\?bounce\.spec\.nightOpacity\*\(night\?1:\.13\):0/);
 assert.match(s,/if\(!isOn\|\|!bounces\.length\)return/);
 assert.match(s,/bounce\.mesh\.removeFromParent\(\)/);
 assert.match(s,/bounce\.geometry\.dispose\(\)/);
 assert.match(s,/tex\?\.dispose\(\)/);
 assert.match(g,/installPersonalTruckHeadlights\(m5PersonalTruckModel,world\)/);
 assert.match(g,/headlightHour=\(10\+\(s\.hsec\?\.time\|\|0\)\/600\*24\)%24/);
 assert.match(g,/m5TruckLighting\?\.updateGround\(truck\.position,truck\.heading/);
 assert.match(g,/m5TruckLighting\?\.set\(truck\.mode==='driving'&&!!truck\.headlightsOn/);
});
