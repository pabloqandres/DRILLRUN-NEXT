import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AVATARS} from '../dist/chapter/avatars.mjs';
import {staffHeightRatio} from '../dist/mission5/patio-npc-world.mjs';
import {hasActualBonus,starterSkillLevel} from '../dist/chapter/character-select-v68.mjs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('V69: selected avatar always opens its actual specialty, never undefined keys',()=>{
 const domains=[
  {id:'contract',keys:['contractIncome']},
  {id:'maintenance',keys:['maintenanceCost','maintenanceTime']},
  {id:'geology',keys:['geologyCost']},
  {id:'construction',keys:['constructionTime']}
 ];
 const expected=['contract','maintenance','geology','construction'];
 AVATARS.forEach((avatar,i)=>{
  const active=domains.filter(domain=>hasActualBonus(avatar.bonuses,domain));
  assert.deepEqual(active.map(x=>x.id),[expected[i]]);
 });
 assert.equal(hasActualBonus({},domains[0]),false);
 assert.equal(hasActualBonus({contractIncome:null},domains[0]),false);
 assert.equal(hasActualBonus({maintenanceCost:-.04},domains[1]),true);
});
test('V69: 2 independent starter metrics per category; only 1 bonus pip',()=>{
 const first={name:'TÉCNICA',base:3,boost:true};
 const second={name:'EFICIENCIA',base:2};
 assert.equal(starterSkillLevel(first,false),3);
 assert.equal(starterSkillLevel(first,true),4);
 assert.equal(starterSkillLevel(second,true),2);
 const ui=source('dist/chapter/character-select-v68.mjs');
 for(const pair of ['NEGOCIACIÓN','GESTIÓN','TÉCNICA','EFICIENCIA','ANÁLISIS','PRECISIÓN','PLANIFICACIÓN','EJECUCIÓN'])assert(ui.includes(pair),pair);
 assert(ui.includes('this.skill=DOMAINS.find(domain=>hasActualBonus(this.bonuses,domain))'));
 assert(!ui.includes('Este personaje no tiene una bonificación adicional'));
 assert(!ui.includes('values.map(percent)'));
 assert(!ui.includes('Number(this.bonuses[k])!==0'));
 assert(ui.includes('El'));
});
test('V69: login routes directly to character creation or saved gameplay',()=>{
 const html=source('dist/index.html'),game=source('dist/chapter/game.mjs');
 assert(!html.includes('id="welcomeScreen"'));
 assert(!html.includes('id="welcomeFrame"'));
 assert(!game.includes('displayWelcomeV64('));
 assert(!game.includes('acceptWelcomeV64('));
 assert(game.includes('await chooseCharacter(true)'));
 assert(game.includes('s=readSave()'));
 assert(game.includes('beginPlay(true)'));
 assert(game.includes('cloudStartNewGame(s)'));
 assert(game.includes("if(selectorPreviewOnly){"));
 assert(game.includes('requestImmersive();'));
 assert(html.includes('selector-polish-v69.css?v=69'));
});
test('V69: adult NPC targets do not rely on transient player skinned bounding boxes',()=>{
 const npc=source('dist/mission5/patio-npc-world.mjs');
 assert(npc.includes('avatarDefinition(this.world.player.userData.character).height'));
 assert(!npc.includes('heightOf(this.world.player)'));
 assert(npc.includes("npcTargetHeight"));
 const minimum=AVATARS.at(-1).height;
 assert(staffHeightRatio(1.8,minimum,'security')>.9);
 assert(staffHeightRatio(1.8,minimum,'security')<1.1);
 assert(staffHeightRatio(1.8,minimum,'technician')>.8);
});
test('V69: portrait camera + cinematic key lights move with the actual avatar',()=>{
 const game=source('dist/chapter/game.mjs');
 const stage=source('dist/chapter/selector-stage.mjs');
 const css=source('dist/chapter/selector-polish-v69.css');
 assert(game.includes('new T.Vector3(-5.02,1.54,5.68)'));
 assert(game.includes('1.56+selectorV68Zoom*.42'));
 assert(stage.includes('const hero=this.world.player?.position'));
 assert(stage.includes('this.keyLight.position.set(dx-1.05,2.35,dz+1.5)'));
 assert(stage.includes('this.rimLight.position.set(dx+1.1,2.65,dz-.65)'));
 assert(css.includes('transparent 19% 48%'));
 assert(css.includes('.v69SkillMetrics'));
});
