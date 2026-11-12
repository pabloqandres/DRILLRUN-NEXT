import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {PERSONNEL_CANDIDATES,PERSONNEL_GROUPS,candidatesForRole} from '../dist/chapter/personnel-candidates-v76.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
import {SEMI_RADIAL_ITEMS,semiRadialStep} from '../dist/chapter/semi-radial-dock-v83.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const icon=id=>'<i>'+id+'</i>';

test('V88 · one semiradial perimeter with no redundant decorative inner rim',()=>{
 const src=read('dist/chapter/semi-radial-dock-v83.mjs');
 const css=read('dist/chapter/semi-radial-layout-v88.css');
 const html=read('dist/index.html');
 assert(src.includes('class="drSemiOutline"'));
 assert(src.includes('class="drSemiBottom"'));
 assert(src.includes('class="drSemiDividers"'));
 assert(!src.includes('class="drSemiRim"'));
 assert.equal((src.match(/class="drSemiSegment drSemiSegment(?:Left|Active|Right)"/g)||[]).length,3);
 assert(css.includes('.drSemiRim{display:none!important}'));
 assert(css.includes('top:36%!important'));
 assert(css.includes('top:56%!important'));
 assert(css.includes('width:min(400px'));
 assert(css.includes('height:130px'));
 assert(html.indexOf('semi-radial-layout-v88.css')>html.indexOf('semi-radial-premium-v86.css'));
 for(let selected=0;selected<SEMI_RADIAL_ITEMS.length;selected++){
  const steps=SEMI_RADIAL_ITEMS.map((_,i)=>semiRadialStep(i,selected,SEMI_RADIAL_ITEMS.length));
  assert.equal(steps.filter(x=>['-1','0','1'].includes(x)).length,3);
  assert.equal(steps.filter(x=>['-2','2'].includes(x)).length,2);
 }
});
test('V88 · ten desktop destinations are discoverable via real arrow buttons',()=>{
 const src=read('dist/chapter/semi-radial-dock-v83.mjs');
 const css=read('dist/chapter/semi-radial-layout-v88.css');
 assert.equal(SEMI_RADIAL_ITEMS.length,10);
 assert(src.includes('class="drSemiPrev"'));
 assert(src.includes('class="drSemiNext"'));
 assert(src.includes('class="drSemiCount"'));
 assert(src.includes("prev?.addEventListener('click',()=>rotate(-1))"));
 assert(src.includes("next?.addEventListener('click',()=>rotate(1))"));
 assert(src.includes("count.textContent=(centerIndex+1)+' / '+total"));
 assert(src.includes('lastWheelAt<270'));
 assert(css.includes('10 SECCIONES'));
 assert(css.includes('@media(hover:none),(pointer:coarse)'));
});
test('V88 · 21 existing independent illustrated portraits now render, without state changes',()=>{
 const s=newGame('es','operator01');
 s.cash=999999;
 s.office={status:'built',level:2};
 s.mission3={phase:'setup'};
 const before=JSON.stringify(s);
 assert.equal(PERSONNEL_CANDIDATES.length,21);
 for(const group of PERSONNEL_GROUPS){
  const cards=candidatesForRole(group.id);
  assert.equal(cards.length,3,group.id);
  const html=renderPersonnelPremium(s,group.id,cards[0].id,icon);
  assert.equal((html.match(/class="pvCandidate /g)||[]).length,3,group.id);
  for(const c of cards){
   const expected=c.role==='admin'?'./assets/npc-portraits-v80/'+c.id+'.svg':c.portrait;
   assert(html.includes(expected),'Missing existing portrait '+c.id);
   assert(html.includes(c.name),'Missing candidate '+c.id);
  }
  assert(!html.includes('RETRATO PENDIENTE'),'Do not regress to silhouettes: '+group.id);
 }
 assert.equal(JSON.stringify(s),before,'UI may not modify mission, cash or employment state');
});
test('V88 · Personnel has actual images and a non-clipping footer',()=>{
 const js=read('dist/chapter/personnel-premium-v76.mjs');
 const css=read('dist/chapter/personnel-surface-v88.css');
 const html=read('dist/index.html');
 assert(js.includes("c.portrait"));
 assert(js.includes('pvArtPortrait--classic'));
 assert(js.includes('npc-portraits-v80'));
 assert(css.includes('object-fit:cover!important'));
 assert(css.includes('grid-template-rows:minmax(0,1fr) 62px!important'));
 assert(css.includes('.pvTeamList{overflow-x:auto!important}'));
 assert(css.includes('overflow-y:auto!important'));
 assert(html.indexOf('personnel-surface-v88.css')>html.indexOf('personnel-layout-v86.css'));
});
test('V88 · original game data, Google sync, and menu routes stay intact',()=>{
 const g=read('dist/chapter/game.mjs'),h=read('dist/index.html');
 assert(g.includes("$('#play').onclick=async()=>"));
 assert(g.includes('initCloudSave(value,async user=>'));
 assert(g.includes('installSemiRadialDock({'));
 assert(g.includes('function rescueStuckPlayer(){'));
 assert(h.includes('id="bottomNav"'));
 assert(h.includes('id="startGoogle"'));
});
