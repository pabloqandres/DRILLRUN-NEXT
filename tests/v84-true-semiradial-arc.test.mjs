import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SEMI_RADIAL_ITEMS,semiRadialStep} from '../dist/chapter/semi-radial-dock-v83.mjs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('V84 · renders a coherent curved three-sector arc, not rectangular floating cards',()=>{
 const module=read('dist/chapter/semi-radial-dock-v83.mjs');
 const css=read('dist/chapter/semi-radial-geometry-v84.css');
 assert(module.includes('drSemiWedge'));
 assert(module.includes('drSemiShapeCenter'));
 assert(module.includes('drSemiShapeSide'));
 assert(module.includes('M12 29 Q60 1 108 29'));
 assert(module.includes('M9 42 Q54 12 110 19'));
 assert(module.includes('drSemiHubIcon'));
 assert(module.includes('drSemiRibbon'));
 assert(module.includes('drSemiSegmentActive'));
 for(const expected of [
  '.drSemiItem[data-step="0"] .drSemiShapeCenter',
  '.drSemiItem[data-step="0"] .drSemiShapeSide',
  '.drSemiItem[data-step="1"] .drSemiWedge',
  '.drSemiItem[data-step="2"] .drSemiWedge',
  '#hud #semiRadialDock .drSemiItem{',
  'border:0!important',
  'background:none!important',
  'filter:blur(1.5px)!important',
  'mask-image:radial-gradient',
  '.drSemiTrigger .drSemiExcavator',
  '.drSemiProgress{display:none!important}',
  '@media(max-height:520px)',
 ])assert(css.includes(expected),'Missing wedge rule '+expected);
 // Center and left/right share one native shape family, mirrored for right.
 assert.equal((module.match(/drSemiShapeCenter/g)||[]).length,1);
 assert.equal((module.match(/drSemiShapeSide/g)||[]).length,1);
 // Old full grey arc no longer appears: background and shadow removed.
 assert(css.includes('background:none!important;'));
 assert(css.includes('box-shadow:none!important;'));
 assert(css.includes('opacity:0!important'));
 // Card geometry is not used on the final layer.
 assert(css.includes('border-radius:0!important'));
 for(let selected=0;selected<SEMI_RADIAL_ITEMS.length;selected++){
  const displayed=SEMI_RADIAL_ITEMS.map((_,i)=>semiRadialStep(i,selected,SEMI_RADIAL_ITEMS.length));
  assert.equal(displayed.filter(x=>x==='0'||x==='1'||x==='-1').length,3);
  assert.equal(displayed.filter(x=>x==='2'||x==='-2').length,2);
 }
});
test('V84 · no destructive navigation/audio changes; CSS ordered after V83',()=>{
 const html=read('dist/index.html'),module=read('dist/chapter/semi-radial-dock-v83.mjs');
 assert(html.indexOf('semi-radial-geometry-v84.css')>html.indexOf('semi-radial-dock-v83.css'));
 assert(module.includes("const root=document.createElement('div');"));
 assert(module.includes("feedback('confirm')"));
 assert(module.includes("feedback('skill')"));
 assert(module.includes("trigger.addEventListener('pointerdown'"));
 assert(module.includes("fan.addEventListener('pointermove'"));
 assert(module.includes("const prior=document.getElementById('semiRadialDock')"));
 assert(!module.includes('setInterval('));
});
