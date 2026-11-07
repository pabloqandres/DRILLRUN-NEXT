import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=name=>readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');

test('real HUD HTML uses integrated avatar/level and fully structured mission component',()=>{
 const html=file('index.html'),css=file('chapter/visual-overhaul-v3.css');
 const profile=html.slice(html.indexOf('class="playerStatus"'),html.indexOf('<div class="resources"'));
 assert(profile.includes('class="playerPortraitFrame"'));
 assert(profile.includes('id="levelBadge"'));
 assert(profile.includes('id="playerAvatar"'));
 for(const id of ['missionStage','objectiveTitle','objectiveDetail','objectiveProgress','objectiveCount','objToggle','hsecInline'])assert(html.includes('id="'+id+'"'));
 assert(html.includes('class="missionCardHead"'));
 assert(html.includes('class="missionCardProgress"'));
 assert(html.includes('visual-overhaul-v3.css"></head>'));
 assert(css.includes('#hud header .resources'));
 assert(css.includes('position:relative!important;left:auto!important;right:auto!important;top:auto!important'));
});

test('joystick is visually simplified while original movement handlers remain intact',()=>{
 const html=file('index.html'),css=file('chapter/visual-overhaul-v3.css'),game=file('chapter/game.mjs');
 assert(html.includes('id="joystick"')&&html.includes('id="joyKnob"'));
 assert(!html.includes('class="joyCross">✧'));
 assert(css.includes('#hud #joystick .joyCross{display:none!important}'));
 assert(css.includes('#hud #joystick::before,#hud #joystick::after'));
 assert(game.includes("function joyMove(e)"));
 assert(game.includes("setPointerCapture(pointer)"));
 assert(game.includes("applyMovement(intent,dt)"));
});

test('mission status pill always reflects actual active mission and completion',()=>{
 const game=file('chapter/game.mjs');
 assert(game.includes("const missionDone=m4Active?"));
 assert(game.includes("missionStage.textContent=missionDone?'COMPLETADA':'EN CURSO'"));
 assert(game.includes("$('#objective').classList.toggle('missionDone',missionDone)"));
});

test('environment uses lightweight deterministic scatter outside operating grounds',()=>{
 const world=file('graphics/desert.mjs'),roads=file('hsec/world.mjs');
 assert(world.includes("new T.InstancedMesh("));
 assert(world.includes("Atacama · alluvial stone scatter"));
 assert(world.includes("Atacama · wind-deposited silt"));
 assert(world.includes('if(x>-17.5&&x<20&&z>-16&&z<12)continue'));
 assert(roads.includes('wheel-wear strips'));
 assert(roads.includes('Stable pseudo-grain prevents roads flickering'));
 assert(!roads.includes('(Math.random()-.5)*10'));
});

test('RC machinery thumbnails come from exact in-world factory, not invented product photos',()=>{
 const preview=file('chapter/product-preview.mjs'),m3=file('mission3/phone-apps.mjs'),phone=file('chapter/phone-ui.mjs');
 assert(preview.includes("import {createDrillModel} from '../mission3/drill-models.mjs'"));
 assert(preview.includes('preview.model=createDrillModel(drillId)'));
 assert(m3.includes('data-rc-rig='));
 assert(phone.includes('rcDrillThumbnail(this.getWorld(),id)'));
 assert(phone.includes('this.rigArtCache=new Map()'));
 assert(m3.includes('Martillos EXPLORA®'));
});

test('staff roster and hiring use original differentiated worker portraits',()=>{
 const art=file('chapter/crew-portraits.mjs'),m3=file('mission3/phone-apps.mjs');
 assert(art.includes('export function crewPortrait('));
 for(const role of ['admin','driller','helper','hsec','techVisit','tecnicoDrillco'])assert(art.includes(role+':'));
 assert(art.includes('viewBox="0 0 80 94"'));
 assert(m3.includes('crewPortrait(p.role,p.id)'));
 assert(m3.includes('crewPortrait(role.id)'));
});
