import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame} from '../dist/chapter/state.mjs';
import {renderPersonnelPremium} from '../dist/chapter/personnel-premium-v76.mjs';
import {candidatesForRole,PERSONNEL_CANDIDATES} from '../dist/chapter/personnel-candidates-v76.mjs';
const icon=x=>'<i>'+x+'</i>';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const state=()=>{const s=newGame('es','operator01');s.cash=50000;s.office={status:'built',level:2};s.mission3={phase:'setup'};s.hsec={employee:{id:'hsec01',level:1},assets:[]};return s;};
test('V78 first 3 Administration candidates have distinct illustration identifiers',()=>{
 const names=['adm-camila-rojas','adm-matias-torres','adm-sofia-ibarra'];
 const s=state(),html=renderPersonnelPremium(s,'admin',names[1],icon);
 for(const name of names){assert(PERSONNEL_CANDIDATES.find(x=>x.id===name));assert(html.includes('data-pv-candidate="'+name+'"'))}
 for(const style of ['camila','matias','sofia'])assert(html.includes('pvArtPortrait--'+style));
 assert.equal((html.match(/pvArtPortrait--card/g)||[]).length,3);
 assert(html.includes('pvArtPortrait--detail'));
 assert(html.includes('pvEmptyPortrait--team'),'existing HSEC employee remains placeholder');
 assert(html.includes('data-pv-hire'));
});
test('V78 other 18 candidates remain placeholders with all attributes and costs',()=>{
 const s=state();
 for(const role of ['driller','helper','hsec','tecnicoDrillco','m5-gate-security','m5-warehouse-tech']){
  const first=candidatesForRole(role)[0],html=renderPersonnelPremium(s,role,first.id,icon);
  assert.equal((html.match(/pvEmptyPortrait--card/g)||[]).length,3);
  assert(!html.includes('pvArtPortrait--card'));
  assert.equal((html.match(/class="pvCandidateSkill"/g)||[]).length,9);
 }
});
test('V78 optimized artifact and responsive spacing are present',()=>{
 const b=readFileSync(new URL('../dist/assets/npc-portraits-v78/admin-roster.webp',import.meta.url));
 assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');
 assert(b.length<40000,'atlas should be mobile friendly');
 const css=read('dist/chapter/personnel-premium-v76.css');
 assert(css.includes("npc-portraits-v78/admin-roster.webp"));
 assert(css.includes('min-height:520px')&&css.includes('min-width:760px'));
});
