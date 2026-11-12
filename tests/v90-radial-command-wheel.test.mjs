import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SEMI_RADIAL_ITEMS,semiRadialWrap,semiRadialStep,radialPoint,radialSegmentPath,RADIAL_GEOMETRY,installSemiRadialDock} from '../dist/chapter/semi-radial-dock-v90.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('V94: approved corner annulus uses six concentric segments with safe geometry',()=>{
 const g=RADIAL_GEOMETRY;
 assert.equal(g.cx,500);
 assert.equal(g.cy,465);
 assert.equal(g.outerRadius,365);
 assert.equal(g.innerRadius,244);
 assert.deepEqual(g.slotBounds,[[-90,-75.4],[-74.6,-60.4],[-59.6,-45.4],[-44.6,-30.4],[-29.6,-15.4],[-14.6,0]]);
 assert.deepEqual(g.slotAngles,[-82.5,-67.5,-52.5,-37.5,-22.5,-7.5]);
 for(const [a,b] of g.slotBounds){
  const path=radialSegmentPath(a,b);
  assert.match(path,/^M.+ A365 365 0 0 1 .+ L.+ A244 244 0 0 0 .+ Z$/);
  assert(!path.includes('NaN'));
 }
 for(const angle of [-90,-67.5,-52.5,-37.5,-7.5,0]){
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
 assert.equal(semiRadialStep(0,1,10),'-1');
 assert.equal(semiRadialStep(5,1,10),'4');
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 const game=read('dist/chapter/game.mjs');
 assert(src.includes('data-semi-id'));
 assert(src.includes('dr94Base'));
 assert(src.includes('viewBox="0 0 550 470"'));
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
 assert(css.includes('var(--dr94-center-offset,95px)'));
 assert(css.includes('var(--dr94-bottom-offset,78px)'));
 assert(css.includes('.dr94Base'));
 assert(css.includes('.dr94Sector--far'));
 assert(css.includes('.dr95Sector--fifth'));
 assert(css.includes('.dr95Sector--sixth'));
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

test('V97: open-ended wheel is only glowing rim traces, never filled blocks',()=>{
 const js=read('dist/chapter/semi-radial-dock-v90.mjs');
 const css=read('dist/chapter/semi-radial-command-v90.css');
 for(const key of [
  "arcPath(-107,-90,g.outerRadius)",
  "arcPath(-107,-90,g.innerRadius)",
  "arcPath(0,21,g.outerRadius)",
  "arcPath(0,21,g.innerRadius)",
  'dr96TailLower','dr96TailUpper',
  'dr96FadeLower','dr96FadeUpper',
  'dr97TailTraces--lower','dr97TailTraces--upper',
  'dr97TailHalo','dr97TailOuter','dr97TailInner',
  "arcPath(-90,-75,g.innerRadius+3.5)",
  "arcPath(-15,0,g.innerRadius+3.5)"
 ])assert(js.includes(key),key);
 assert(!js.includes("radialSegmentPath(-103,-90)"));
 assert(!js.includes("radialSegmentPath(0,17)"));
 for(const key of [
  '#hud #semiRadialDock .dr97TailTraces{',
  '.dr97TailTraces path{',
  'fill:none!important',
  'pointer-events:none!important',
  'stroke-width:1.5px!important',
  '.dr90Orbit[data-step="-1"] .dr90Option',
  '.dr90Orbit[data-step="4"] .dr90Option',
  '.dr90Orbit[data-step="2"] .dr90Option',
  'filter:none!important'
 ])assert(css.includes(key),key);
 assert.equal(RADIAL_GEOMETRY.outerRadius,365);
 assert.equal(RADIAL_GEOMETRY.innerRadius,244);
 assert.equal(RADIAL_GEOMETRY.slotBounds.length,6);
 assert(js.includes("onNavigate(element.dataset.semiId)"));
 assert(js.includes("window.addEventListener('pointermove',moveDrag"));
 assert(!js.includes('dr90Prev'));
});

test('V97: both buttons smaller, visually contained inside the 244px inner radius',()=>{
 const css=read('dist/chapter/semi-radial-command-v90.css');
 for(const key of [
  'left:298px!important;top:358px!important',
  'width:68px!important;height:68px!important',
  'left:290px!important;top:352px!important',
  'width:248px!important;height:111px!important',
  '--dr97-action-half:clamp(32px,5dvh,54px)',
  'width:clamp(64px,10dvh,108px)!important',
  'right:calc(var(--dr94-safe-right) + var(--dr94-action-half) - var(--dr97-action-half))',
  'bottom:calc(var(--dr94-control-line) - var(--dr97-action-half))'
 ])assert(css.includes(key),key);
 const g=RADIAL_GEOMETRY;
 const hub={x:298+68/2,y:358+68/2};
 const corner={x:290,y:352};
 const hubDist=Math.hypot(hub.x-g.cx,hub.y-g.cy);
 const baseCornerDist=Math.hypot(corner.x-g.cx,corner.y-g.cy);
 assert(hubDist+68/2<g.innerRadius,'hub fully contained inside annular hole');
 assert(baseCornerDist<g.innerRadius,'plinth upper-left corner is inside annular hole');
 assert.equal(hub.y,392,'aligned with action centreline at local y=392');
});

test('V98: connected bubble outline, defined rings and disabled action readability',()=>{
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 const css=read('dist/chapter/semi-radial-command-v90.css');
 assert(src.includes('dr94Base dr98BubbleBase'));
 assert(src.includes('dr98BubbleShell'));
 assert(src.includes('dr98BubbleGlow'));
 assert(src.includes('dr98BubbleInset'));
 assert(src.includes('d="M332 345 C303 345 286 366 286 392'));
 assert(src.includes('C360 352 347 345 332 345 Z'));
 for(const key of [
  '.dr94Base.dr98BubbleBase',
  '#hud #semiRadialDock .dr98BubbleShell',
  'stroke-width:3.6px!important',
  '#hud #handButton:disabled',
  'opacity:1!important',
  'z-index:43!important',
  '#hud #objective:not(.hidden)',
  'transition:transform .32s'
 ])assert(css.includes(key),key);
 // Geometrically both controls and their shared lobe remain inside
 // the free inner circular space; the six sector positions are unchanged.
 const g=RADIAL_GEOMETRY;
 const points=[[286,392],[332,345],[514,392],[455,334]];
 for(const [x,y] of points)
  assert(Math.hypot(x-g.cx,y-g.cy)<g.innerRadius,JSON.stringify({x,y}));
 assert.deepEqual(g.slotAngles,[-82.5,-67.5,-52.5,-37.5,-22.5,-7.5]);
});

test('V98: movement only affects HUD presentation, never mission logic',()=>{
 const src=read('dist/chapter/semi-radial-dock-v90.mjs');
 for(const key of [
  "document.getElementById('joystick')",
  "document.getElementById('objective')",
  'minimizeDuringMovement',
  "objective.classList.add('collapsed')",
  'setOpen(false,true)',
  "joystick.addEventListener('pointermove',joyMove",
  "document.addEventListener('keydown',movementKey,true)",
  "document.removeEventListener('keydown',movementKey,true)"
 ])assert(src.includes(key),key);
 assert(!src.includes('save()'));
 assert(!src.includes('game.mjs'));
});
