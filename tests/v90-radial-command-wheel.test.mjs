import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SEMI_RADIAL_ITEMS,semiRadialStep,radialPoint,radialSegmentPath,RADIAL_GEOMETRY,installSemiRadialDock} from '../dist/chapter/semi-radial-dock-v90.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('V90: real concentric circle geometry, correct radii and symmetric segments',()=>{
 const g=RADIAL_GEOMETRY;
 assert.equal(g.cx,200);
 assert.equal(g.cy,164);
 assert.equal(g.outerRadius,154);
 assert.equal(g.innerRadius,89);
 for(const r of [g.outerRadius,g.innerRadius,g.itemRadius]){
  for(const angle of [-85,-68,-45,-23.5,0,22.5,45,68,85]){
   const p=radialPoint(angle,r);
   assert(Math.abs(Math.hypot(p.x-g.cx,p.y-g.cy)-r)<.00001,'wrong radius at '+angle);
  }
 }
 for(const range of [g.left,g.center,g.right]){
  const path=radialSegmentPath(...range);
  assert.match(path,/^M.+ A154 154 0 0 1 .+ L.+ A89 89 0 0 0 .+ Z$/);
  assert(!path.includes('NaN'));
 }
 assert.deepEqual(g.left,[-68,-23.5]);
 assert.deepEqual(g.center,[-22.5,22.5]);
 assert.deepEqual(g.right,[23.5,68]);
 assert.equal(installSemiRadialDock(),null,'safe when no browser DOM');
});

test('V90: ten routes; 3 accessible and 2 ghost choices around any index',()=>{
 assert.equal(SEMI_RADIAL_ITEMS.length,10);
 assert.equal(new Set(SEMI_RADIAL_ITEMS.map(x=>x.id)).size,10);
 for(let selected=0;selected<10;selected++){
  const steps=SEMI_RADIAL_ITEMS.map((_,i)=>semiRadialStep(i,selected,10));
  for(const key of ['-2','-1','0','1','2'])
   assert.equal(steps.filter(v=>v===key).length,1,selected+':'+key);
  assert.equal(steps.filter(v=>v==='off').length,5);
 }
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 assert(src.includes("const angle=step==='off'?(delta<0?-111:111):Number(step)*45"));
 assert(src.includes("node.style.transform='rotate('+angle+'deg)'"));
 assert(src.includes("item.style.transform='rotate('+(-angle)+'deg)'"));
 assert(src.includes("button type=\"button\" class=\"dr90Option\""));
});

test('V90: old patch-stack is NOT loaded and the fresh dock is active',()=>{
 const html=read('dist/index.html');
 const game=read('dist/chapter/game.mjs');
 for(const old of ['semi-radial-dock-v83.css','semi-radial-geometry-v84.css',
  'semi-radial-premium-v86.css','semi-radial-layout-v88.css'])
  assert(!html.includes(old),'obsolete overlay stylesheet '+old);
 assert.equal((html.match(/semi-radial-command-v90\.css/g)||[]).length,1);
 assert(game.includes("import {installSemiRadialDock} from './semi-radial-dock-v90.mjs';"));
 assert(game.includes('installSemiRadialDock({'));
 assert(game.includes('onFeedback:kind=>selectorFeedback.play(kind)'));
 assert(game.includes("original.click()"),'gameplay authority stays on legacy nav');
 assert(html.includes('id="bottomNav"'));
 assert(html.includes('id="joystick"'));
 assert(!html.includes('id="cameraHome"'));
});

test('V90: no counter, thin segment strokes, layered hub and view-safe margins',()=>{
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 const css=read('dist/chapter/semi-radial-command-v90.css');
 assert(!src.includes('drSemiCount'));
 assert(!src.includes('1 / 10'));
 assert(!css.includes('10 SECCIONES'));
 assert(!css.includes('drSemiRibbon'));
 assert(src.includes('class="dr90Prev"'));
 assert(src.includes('class="dr90Next"'));
 assert(src.includes('class="dr90Hub"'));
 assert(css.includes('border-radius:50%!important'));
 assert(css.includes('stroke-width:1.45'));
 assert(css.includes('stroke-width:1.8'));
 assert(css.includes('bottom:clamp(13px,2.4dvh,23px)'));
 assert(css.includes('.dr90Hub::before'));
 assert(css.includes('.dr90CenterAccent'));
 assert(css.includes('font:850 10.4px/1.07'));
 assert(css.includes('width:89px!important'));
 assert(css.includes('pointer-events:none!important'));
 assert(css.includes('prefers-reduced-motion:reduce'));
});

test('V90: real orbit (not linear interpolation) with keyboard, pointer, wheel and native sound',()=>{
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 const css=read('dist/chapter/semi-radial-command-v90.css');
 for(const key of [
  'pointerdown','pointermove','pointerup','lostpointercapture',
  "prev.addEventListener('click'", "next.addEventListener('click'",
  "event.key==='ArrowRight'", "event.key==='ArrowLeft'",
  "event.key==='Escape'", "event.key==='Enter'",
  "root.addEventListener('wheel'",'ResizeObserver',
  "feedback('skill')","feedback('confirm')",
  "onNavigate(element.dataset.semiId)",
  "new MutationObserver"
 ])assert(src.includes(key),key);
 assert(css.includes('.dr90Orbit{'));
 assert(css.includes('transition:transform .61s cubic-bezier(.19,.70,.22,1)'));
 assert(css.includes('transform-origin:47px 24px'));
 assert(css.includes('top:-145px'));
 assert(css.includes('top:164px'));
 assert(css.includes('touch-action:none!important'));
});

test('V90: game cash, cloud, and mission handlers remain reachable',()=>{
 const game=read('dist/chapter/game.mjs');
 for(const key of [
  'initCloudSave(value,async user=>',
  "$('#play').onclick=async()=>",
  'function rescueStuckPlayer(){',
  "if(nav==='m3-personnel'){openFaena('personnel');return;}",
  "if(nav==='m3-contract'){openFaena('contracts');return;}"
 ])assert(game.includes(key),key);
});
