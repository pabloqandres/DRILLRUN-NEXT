import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame,restore} from '../dist/chapter/state.mjs';
import {getCurrentMissionCard} from '../dist/chapter/mission-display.mjs';
import {mission5Readout,mission5HudVisibleSteps,renderMission5HudChecklist} from '../dist/mission5/mission-readout.mjs';

const date=Date.UTC(2026,10,10,16);
const fixture=()=>{
 const s=newGame('es','operator01',date);
 s.playerName='Operador';
 s.narrative={messages:[],accepted:[],rewardsCollected:[]};
 return s;
};
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('V47 start screen switches immediately to accepted M5, even before Patio construction',()=>{
 const s=fixture();
 s.mission4={phase:'complete'};
 s.narrative.accepted=['m1','m2','m3','m4','m5'];
 s.narrative.rewardsCollected=['m1','m2','m3','m4'];
 assert.equal(s.mission5,null);
 const card=getCurrentMissionCard(s);
 assert.equal(card.id,'m5');
 assert.equal(card.eyebrow,'MISIÓN 5');
 assert.equal(card.title,'Una base para crecer');
 assert.match(card.summary,/Patio/);
});
test('V47 restores M5 from Cloud Save and remains read-only',()=>{
 const s=fixture();s.mission4={phase:'complete'};
 s.narrative.accepted=['m1','m2','m3','m4','m5'];
 s.narrative.rewardsCollected=['m1','m2','m3','m4'];
 const raw=JSON.stringify(s);
 const restored=restore(JSON.parse(raw),date+2000);
 assert(restored,'cloud save must restore successfully');
 const before=JSON.stringify(restored),card=getCurrentMissionCard(restored);
 assert.equal(card.id,'m5');
 assert.equal(JSON.stringify(restored),before,'presentational read must not mutate save');
});
test('V47 uses latest accepted narrative mission for all five stages',()=>{
 const s=fixture();
 const ids=['m1','m2','m3','m4','m5'];
 for(const [i,id] of ids.entries()){
  s.narrative.accepted.push(id);
  if(i>0)s.narrative.rewardsCollected.push(ids[i-1]);
  const card=getCurrentMissionCard(s);
  assert.equal(card.id,id);
  assert.equal(card.number,i+1);
  assert.equal(card.eyebrow,'MISIÓN '+(i+1));
 }
});
test('V47 uses legacy progress only where there is no accepted narrative state',()=>{
 const s=fixture();
 s.chapterCompletedAt=date;s.hsec={completedAt:date};
 s.mission3={phase:'complete'};s.mission4={phase:'complete'};
 assert.equal(getCurrentMissionCard(s).id,'m4');
 s.mission5={status:'building'};
 assert.equal(getCurrentMissionCard(s).id,'m5');
});
test('V47 world HUD shows current + next only, and progresses with the actual mission',()=>{
 const s=fixture();
 s.narrative.accepted=['m5'];
 let readout=mission5Readout(s,date);
 let visible=mission5HudVisibleSteps(readout);
 assert.deepEqual(visible.map(x=>x.id),['build','guard']);
 assert.deepEqual(visible.map(x=>x.status),['current','locked']);
 let html=renderMission5HudChecklist(readout,{compact:true});
 assert.equal((html.match(/class="m5HudStep/g)||[]).length,2);
 assert.match(html,/0\/5|12\.000/);
 assert.doesNotMatch(html,/Realizar control inicial de bodega/);
 // Completed construction advances the active window to staff.
 s.mission5={status:'operational',hsecApproved:true};
 readout=mission5Readout(s,date);
 assert.deepEqual(mission5HudVisibleSteps(readout).map(x=>x.id),['guard','technician']);
 // Contracted employees advance the current window without cash grants.
 s.mission5.staff={
  'm5-gate-security':{hiredAt:date},'m5-warehouse-tech':{hiredAt:date}
 };
 readout=mission5Readout(s,date);
 assert.deepEqual(mission5HudVisibleSteps(readout).map(x=>x.id),['gate','inventory']);
 s.mission5.gateCheckedAt=date;s.mission5.warehouseCheckedAt=date;
 readout=mission5Readout(s,date);
 assert.equal(readout.done,5);
 assert.deepEqual(mission5HudVisibleSteps(readout).map(x=>x.id),['inventory']);
 const full=renderMission5HudChecklist(readout);
 assert.equal((full.match(/class="m5HudStep/g)||[]).length,5,'full details remain available');
});
test('V47 game reads shared mission source for title and HUD, and invokes compact mode',()=>{
 const game=read('dist/chapter/game.mjs');
 const menu=game.slice(game.indexOf('function updateStartCard(){'),game.indexOf('function sound(kind)'));
 assert.match(menu,/getCurrentMissionCard\(s\)/);
 assert.doesNotMatch(menu,/if\(m4On/);
 const hud=game.slice(game.indexOf('function renderHUD(){'),game.indexOf('Mission 3 contract timer',game.indexOf('function renderHUD(){')));
 assert.match(hud,/const currentMission=getCurrentMissionCard\(s\)/);
 assert.match(hud,/updateStartCard\(\)/);
 assert.match(hud,/renderMission5HudChecklist\(checklist,\{compact:true\}\)/);
 const css=read('dist/chapter/hud-reference-v4.css');
 assert.match(css,/V47 — M5 heads-up display/);
 assert.match(css,/max-height:min\(52svh,310px\)/);
});
