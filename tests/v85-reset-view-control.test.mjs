import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('V85: reset view control clearly conveys recenter, never photography',()=>{
 const html=read('dist/index.html');
 const button=html.match(/<button id="cameraHome"[^>]*>[\s\S]*?<\/button>/)?.[0];
 assert(button,'cameraHome must remain a real button');
 assert(button.includes('aria-label="Restablecer vista"'));
 assert(button.includes('title="Restablecer vista"'));
 assert(button.includes('class="uiIcon cameraResetGlyph"'));
 assert(button.includes('viewBox="0 0 24 24"'));
 assert(button.includes('<circle cx="12.6" cy="12" r="2.4"'));
 assert(button.includes('M4 11.8A8.3'));
 assert(!button.includes('data-icon="camera"'),'photo camera glyph must be absent');
});
test('V85: responsive geometry moves control farther from the joystick',()=>{
 const css=read('dist/chapter/reset-view-control-v85.css');
 const html=read('dist/index.html');
 for(const term of [
  '#hud #cameraHome', 'right:auto!important', 
  'clamp(164px,13.5vw,202px)', 'max(12px,var(--safe-l,12px)) + 140px',
  'max(10px,var(--safe-l,10px)) + 116px',
  'cameraResetGlyph','@media(max-height:540px)',
  'touch-action:manipulation','focus-visible',
 ])assert(css.includes(term),'missing '+term);
 assert(html.indexOf('reset-view-control-v85.css')>html.indexOf('semi-radial-geometry-v84.css'));
 assert.equal((html.match(/id="cameraHome"/g)||[]).length,1);
});
test('V85: camera action still resets orbit/zoom and saves configuration',()=>{
 const game=read('dist/chapter/game.mjs');
 const handler=game.match(/\$\('#cameraHome'\)\.onclick=\(\)=>\{([^}]*)\}/)?.[1];
 assert(handler,'reset action must not be disconnected');
 for(const call of ['world.zoom=1','resetOrbit(world.orbit)','world.cameraRig.reset()',
  'truckFreeLook.reset()','world.snapCamera=true','persistCamera()'])assert(handler.includes(call),call);
 assert(!game.includes('cameraResetGlyph'),'new pictogram belongs only to view, not game logic');
});
