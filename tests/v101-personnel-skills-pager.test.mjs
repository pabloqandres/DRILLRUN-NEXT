import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
import {staffPageSize,staffPageTotal,staffCurrentPage} from '../dist/chapter/personnel-v100-interactions.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const icon=name=>'<span class="uiIcon">'+name+'</span>';
const fixture=()=>{
 const s=newGame('es','operator01');
 s.cash=95458;s.office={status:'built',level:2};
 s.mission3={phase:'complete'};s.mission4={phase:'setup'};
 s.hsec={employee:null,assets:[]};
 return s;
};

test('V101 staff pager: both arrows have symmetric SVG paths and preserve click actions',()=>{
 const s=fixture(),before=JSON.stringify(s);
 const html=renderPersonnelPremium(s,'admin','adm-camila-rojas',icon);
 const back=html.match(/<button[^>]*data-pv-team-scroll="-1"[^>]*>([\s\S]*?)<\/button>/)?.[1];
 const next=html.match(/<button[^>]*data-pv-team-scroll="1"[^>]*>([\s\S]*?)<\/button>/)?.[1];
 assert(back&&next,'both page controls must exist');
 assert.match(back,/<svg class="pvTeamChevron" viewBox="0 0 24 24"/);
 assert.match(next,/<svg class="pvTeamChevron" viewBox="0 0 24 24"/);
 assert(back.includes('M15.5 5 L8.5 12 L15.5 19'));
 assert(next.includes('M8.5 5 L15.5 12 L8.5 19'));
 assert(!back.includes('‹')&&!next.includes('›'),'font glyphs can drift vertically');
 assert.equal(staffPageSize,3);
 assert.equal(staffPageTotal(6),2);
 assert.equal(staffCurrentPage(0,300,6),1);
 assert.equal(staffCurrentPage(300,300,6),2);
 assert(html.includes('data-pv-team-open'));
 assert.equal(JSON.stringify(s),before,'presentation-only render must never change game data');
});

test('V101 three primary skills are rows with original names and 5 pips',()=>{
 const html=renderPersonnelPremium(fixture(),'admin','adm-camila-rojas',icon);
 const skills=html.match(/<div class="pvQuickSkills"[^>]*>([\s\S]*?)<\/div>\s*<details class="pvMoreDetails"/)?.[1];
 assert(skills,'quick skill region must remain');
 assert.equal((skills.match(/class="pvQuickSkill"/g)||[]).length,3);
 for(const name of ['Negociación','Eficiencia','Planificación'])
  assert(skills.includes(name),name);
 assert.equal((skills.match(/class="pvMiniPips"/g)||[]).length,3);
 assert(skills.includes('aria-label="2 de 5"'));
 assert(html.includes('class="pvMoreDetails"'));
 assert(html.includes('data-pv-hire'));
 assert(html.includes('pvPortraitImage'));
});

test('V101 CSS: rows are one column and pager has equal-height centred chevrons',()=>{
 const css=read('dist/chapter/personnel-tuning-v101.css');
 const html=read('dist/index.html');
 for(const key of [
  '#faenaCenter .pvQuickSkills{',
  'grid-template-columns:minmax(0,1fr)!important',
  'grid-template-rows:repeat(3,26px)!important',
  'grid-template-columns:22px minmax(0,1fr) auto!important',
  '#faenaCenter .pvTeamPager{',
  'grid-template-columns:32px minmax(34px,auto) 32px!important',
  'align-items:center!important',
  '#faenaCenter .pvTeamPager button .pvTeamChevron{',
  'height:36px!important',
  'line-height:0!important',
  '#faenaCenter .pvTeamPage{',
  'font-variant-numeric:tabular-nums!important',
  'grid-template-columns:26px minmax(29px,auto) 26px!important'
 ])assert(css.includes(key),key);
 assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
 const v100=html.indexOf('personnel-compact-v100.css?v=100');
 const v101=html.indexOf('personnel-tuning-v101.css?v=101');
 assert(v101>v100,'must override V100 after it loads');
});

test('V101 modifies only presentation: no mission or financial changes',()=>{
 const pager=read('dist/chapter/personnel-v100-interactions.mjs');
 const css=read('dist/chapter/personnel-tuning-v101.css');
 const m=read('dist/chapter/personnel-premium-v76.mjs');
 assert(m.includes('personnelCapacity(s)'));
 assert(m.includes('data-pv-hire'));
 assert(!pager.includes('cash='));
 assert(!pager.includes('save('));
 assert(!css.includes('image-rendering:pixelated'));
});
