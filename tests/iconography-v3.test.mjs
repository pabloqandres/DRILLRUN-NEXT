import {test} from 'node:test';
import assert from 'node:assert/strict';
import {icon,workerAvatar,characterAvatar} from '../dist/chapter/icons.mjs';
import {hsecIcon,hsecSymbol,HSEC_CATEGORIES,HSEC_SCORING} from '../dist/hsec/icons.mjs';

const uiNames=['time','wrench','geology','build','camp','machine','player','phone','wallet','energy','boost','messages','bank','store','inventory','objectives','settings','desk','chair','computer','close','back','check','lock','hand','rotate','camera','location','star','leaf','rock','metal','bell','arrow','light','storage','decoration','finishes','google'];
const hsecNames=['infrastructure','mobility','boundaries','lighting','emergencies','management','fire','roads','protection','signage','equipment','vehicles','furniture'];
test('all DRILL RUN core UI icons keep the same keys, SVG semantics and size',()=>{
 for(const id of uiNames){
  const svg=icon(id);
  assert.match(svg,/^<svg class="uiIcon /);
  assert.match(svg,/viewBox="0 0 24 24"/);
  assert.match(svg,/aria-hidden="true"/);
  assert.match(svg,/<\/svg>$/);
  assert(!svg.includes('undefined'),id);
 }
});
test('all 13 HSEC symbols are self-contained, aligned 32px SVGs',()=>{
 for(const id of hsecNames){
  const svg=hsecIcon(id,true);
  assert.match(svg,/viewBox="0 0 32 32"/);
  assert(svg.includes('data-hsec-icon="'+id+'"'));
  assert(svg.includes('aria-hidden="true"'));
  assert(svg.endsWith('</svg>'));
 }
 for(const cat of [...HSEC_CATEGORIES,...HSEC_SCORING])assert(hsecSymbol(cat.id));
});
test('brand and player narrative assets remain recognizable and isolated',()=>{
 assert(icon('google').includes('#4285F4'));
 assert(workerAvatar().includes('<svg'));
 for(const id of ['avatar-benefactor','avatar-safety','avatar-contract'])assert(characterAvatar(id).includes('charAvatar'));
});
