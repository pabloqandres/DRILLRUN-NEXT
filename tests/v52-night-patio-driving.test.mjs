import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const patio=source('dist/mission5/patio-world.mjs');
const headlights=source('dist/graphics/personal-drilltruck-headlights.mjs');
const audio=source('dist/audio/worksite-audio.mjs');
const game=source('dist/chapter/game.mjs');
const html=source('dist/index.html');
const css=source('dist/chapter/hud-reference-v4.css');

test('Patio L1 has eight functional luminaires and additional task lights',()=>{
 assert.match(patio,/new T\.PointLight\(0xffe6b2,0,34,2\)/);
 assert.match(patio,/lamps\.push\(spotlight\(g,x,z,6\.4\)\)/);
 assert.match(patio,/const taskLights=/);
 assert.match(patio,/new T\.PointLight\(0xffe9c6,0,19,2\)/);
 assert.match(patio,/const night=status==='operational'/);
 assert.match(patio,/const budget=w\.quality==='low'\?3:w\.quality==='high'\?6:4/);
 assert.match(patio,/lamp\.light\.intensity=night\?\(selected\?\(w\.quality==='low'\?40:56\)/);
});
test('Personal vehicle headlights cast light forward and follow yaw',()=>{
 assert.match(headlights,/new T\.SpotLight\(/);
 assert.match(headlights,/lamp\.target\.position\.set\(x\*1\.55,-1\.0,14\)/);
 assert.match(headlights,/projectPersonalTruckRoadLight/);
 assert.match(headlights,/scene\.add\(mesh\)/);
 assert.match(headlights,/root\.add\(lights\)/);
 assert.match(headlights,/lamp\.castShadow=false/);
 assert.match(game,/installPersonalTruckHeadlights\(m5PersonalTruckModel\)/);
 assert.match(game,/m5TruckLighting\?\.set\(truck\.mode==='driving'/);
 assert.match(game,/truck\.headlightsOn=!truck\.headlightsOn/);
 assert.match(html,/id="personalTruckLights"/);
 assert.match(css,/#hud #personalTruckLights/);
});
test('Boarding hides exterior avatar BEFORE render and routes audio to engine',()=>{
 assert.match(game,/world\.update\(s,dt,clock,walking,false,personalTruck\(s\)\?\.mode==='driving'\)/);
 assert.match(game,/personalDriving:personalTruck\(s\)\?\.mode==='driving'/);
 assert.match(game,/personalSpeed:personalTruck\(s\)\?\.speed\|\|0/);
 assert.match(game,/moving:walking&&personalTruck\(s\)\?\.mode!=='driving'/);
 assert.match(audio,/this\.personalTruck=engine\(/);
 assert.match(audio,/this\.fade\(this\.personalTruck\.out,personalDriving\?/);
 assert.match(audio,/if\(personalDriving\)\{this\.stepDistance=0;return;\}/);
 assert.match(audio,/68\+rpm\*105/);
});

test('Night pavement pools stay above the road markings, with bay coverage',()=>{
 assert.match(patio,/pool\.position\.set\(x,\.295,z\)/);
 assert.match(patio,/const bayPools=\[/);
 assert.match(patio,/\[-7,-13,20,\.295\]/);
 assert.match(patio,/\[-17,3\.2,18,\.295\]/);
 assert.match(patio,/\[-19,-10\.8,13,\.525\]/);
 assert.match(patio,/pool\.material\.opacity=night\?\.62:0/);
 assert.match(patio,/const budget=w\.quality==='low'\?3:w\.quality==='high'\?6:4/);
});
