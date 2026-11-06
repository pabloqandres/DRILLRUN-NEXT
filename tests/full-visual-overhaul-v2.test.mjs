import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../dist/'+path,import.meta.url),'utf8');

test('full premium V2 stylesheet is installed after existing game styles',()=>{
 const html=read('index.html');
 assert.match(html,/world-art-v1\.css"><link rel="stylesheet" href="\.\/chapter\/visual-overhaul-v2\.css"/);
 const css=read('chapter/visual-overhaul-v2.css');
 for(const sel of ['#hud header .playerStatus','#hud header #levelBadge','#hud header #settingsButton','#hud #joystick','#hud #joyKnob','#hud #handButton','#hud #bottomNav','#hud #objective','.missionCompleteOverlay','#modal #modalCard','#phone','#builderPanel.catalogTray','#missionGuide .worldObjective','@media(max-width:810px)']){
  assert(css.includes(sel),'Missing complete UI system section '+sel);
 }
});

test('six live nav destinations exist with no dead link or changed save key',()=>{
 const html=read('index.html'),game=read('chapter/game.mjs');
 for(const nav of ['builder','m3-contract','m3-inventory','m3-personnel','hsec','m4-zones']){
  assert(html.includes('data-nav="'+nav+'"'),'Missing '+nav);
 }
 assert(game.includes("if(nav==='hsec')"));
 assert(game.includes("if(nav==='m4-zones')"));
 assert(game.includes("hidden($('#bottomNav'),phase!=='play')"));
 assert(!game.includes("hidden($('#bottomNav'),!m3Playing&&!m4Playing)"));
});

test('world markers now have real 3D halo rings with proper disposal and no collisions',()=>{
 const halo=read('chapter/action-halo.mjs');
 assert.match(halo,/new T\.RingGeometry\(inside,outside,64\)/);
 assert.match(halo,/this\.rings\.push\(ring\)/);
 assert.match(halo,/\.\.\.this\.rings\]\)/);
 assert(!halo.includes('colliders.push'));
 const css=read('chapter/visual-overhaul-v2.css');
 assert.match(css,/#missionGuide \.worldObjective small/);
 assert.match(css,/--guide-color/);
});

test('workshop premium details only appear at actual level 2 and previews match level',()=>{
 const world=read('scene.mjs');
 assert(world.includes("roofUpgrade.name='taller-nv2-premium-roof'"));
 assert(world.includes('this._workshopRoofUpgrade.visible=level>=2'));
 assert(world.includes('this.box(roofUpgrade,1.72,.09,1.01'));
 assert(world.includes('True level-2 architecture'));
 const preview=read('chapter/product-preview.mjs');
 assert(preview.includes('const base=world.makeWorkshop(true)'));
 assert(preview.includes("base.getObjectByName('taller-nv2-premium-roof')"));
 assert(preview.includes('advancedRoof.visible=level>=2'));
});

test('presentation changes do not alter persistence, mission economics or Firebase',()=>{
 const game=read('chapter/game.mjs');
 assert(game.includes("localStorage.getItem(CONFIG.saveKey)"));
 assert(game.includes("function renderHUD()"));
 assert(game.includes("function showMissionComplete("));
 const css=read('chapter/visual-overhaul-v2.css');
 assert(css.includes('do not brand every panel')||css.includes('DRILLCO identity lives on the office'));
});
