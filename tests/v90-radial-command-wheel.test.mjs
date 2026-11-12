import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SEMI_RADIAL_ITEMS,semiRadialWrap,semiRadialStep,radialPoint,radialSegmentPath,RADIAL_GEOMETRY,installSemiRadialDock} from '../dist/chapter/semi-radial-dock-v90.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('V94: approved corner annulus uses four concentric segments with safe geometry',()=>{
 const g=RADIAL_GEOMETRY;
 assert.equal(g.cx,395);
 assert.equal(g.cy,247);
 assert.equal(g.outerRadius,211);
 assert.equal(g.innerRadius,132);
 assert.deepEqual(g.slotBounds,[[-90,-68],[-67,-45],[-44,-22],[-21,1]]);
 assert.equal(g.slotAngles.length,4);
 for(const [a,b] of g.slotBounds){
  const path=radialSegmentPath(a,b);
  assert.match(path,/^M.+ A211 211 0 0 1 .+ L.+ A132 132 0 0 0 .+ Z$/);
  assert(!path.includes('NaN'));
 }
 for(const angle of [-90,-56,-33,-10,1]){
  for(const r of [g.outerRadius,g.innerRadius,g.itemRadius]){
   const p=radialPoint(angle,r);
   assert(Math.abs(Math.hypot(p.x-g.cx,p.y-g.cy)-r)<.00001);
  }
 }
 assert.equal(installSemiRadialDock(),null,'no DOM stays safe');
});

test('V94: original ten distinct routes remain cyclic and preserve gameplay authority',()=>{
 assert.equal(SEMI_RADIAL_ITEMS.length,10);
 assert.equal(new Set(SEMI_RADIAL_ITEMS.map(item=>item.id)).size,10);
 assert.equal(semiRadialWrap(-1,10),9);
 assert.equal(semiRadialWrap(10,10),0);
 assert.equal(semiRadialStep(9,0,10),'-1');
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 const game=read('dist/chapter/game.mjs');
 assert(src.includes('data-semi-id'));
 assert(src.includes('dr94Base'));
 assert(src.includes('viewBox="0 0 440 285"'));
 assert(src.includes('render(drag.offset)'));
 assert(src.includes('render();')&&src.includes('root.classList.remove(\'is-dragging\')'));
 assert(!src.includes('dr90Prev')&&!src.includes('dr90Next'));
 assert(game.includes("import {installSemiRadialDock} from './semi-radial-dock-v90.mjs'"));
 assert(game.includes('installSemiRadialDock({'));
 assert(game.includes('onFeedback:kind=>selectorFeedback.play(kind)'));
 assert(game.includes('original.click()'));
});

test('V94: visually distinct action control, safe-area alignment and no arrow UI',()=>{
 const css=read('dist/chapter/semi-radial-command-v90.css');
 const html=read('dist/index.html');
 assert(css.includes('--dr94-safe-bottom'));
 assert(css.includes('--dr94-safe-right'));
 assert(css.includes('--dr94-joy-half'));
 assert(css.includes('--dr94-action-half'));
 assert(css.includes('var(--dr94-center-offset,45px)'));
 assert(css.includes('var(--dr94-bottom-offset,38px)'));
 assert(css.includes('.dr94Base'));
 assert(css.includes('.dr94Sector--far'));
 assert(css.includes('#hud #handButton.available'));
 assert(css.includes('#hud #semiRadialDock .dr90Arrows{display:none!important}'));
 assert(css.includes('touch-action:none!important'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert(html.includes('id="joystick"')&&html.includes('id="handButton"'));
 assert(html.includes('id="bottomNav"'));
 assert(!html.includes('id="cameraHome"'));
 assert.equal((html.match(/semi-radial-command-v90\.css/g)||[]).length,1);
});

test('V94: unrelated missions and saved-state systems stay wired',()=>{
 const game=read('dist/chapter/game.mjs');
 for(const term of ['initCloudSave(value,async user=>',
  "$('#play').onclick=async()=>",
  'function rescueStuckPlayer(){',
  "if(nav==='m3-personnel'){openFaena('personnel');return;}",
  "if(nav==='m3-contract'){openFaena('contracts');return;}"
 ])assert(game.includes(term),term);
});
