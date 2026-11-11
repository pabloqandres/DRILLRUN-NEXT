import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const splash=file('dist/title-preview-v65.html');
const game=file('dist/chapter/game.mjs');
const index=file('dist/index.html');
test('V65 keeps approved logo shine but removes ONLY the full-screen light sweep',()=>{
 assert.match(splash,/<div id="logoShine" aria-hidden="true"><\/div>/);
 assert.match(splash,/#logoShine\{[^}]*animation:titleSweep 10s/);
 assert.match(splash,/@keyframes titleSweep\{/);
 assert.doesNotMatch(splash,/<div id="scan"><\/div>/);
 assert.doesNotMatch(splash,/#scan\{/);
 assert.doesNotMatch(splash,/@keyframes scan\{/);
 assert.match(splash,/#playHero \.gleam\{[^}]*animation:titleSweep 7s/);
});
test('V65 buildings are drawn in staged and staggered SVG segments, not video',()=>{
 assert.match(splash,/<svg id="buildLines" viewBox="0 0 1672 941"/);
 assert.equal((splash.match(/class="build-site(?: left-galpon)?"/g)||[]).length,3);
 assert((splash.match(/class="construct-line /g)||[]).length>=10);
 assert((splash.match(/class="construct-trace"/g)||[]).length>=3);
 assert((splash.match(/class="holo-node"/g)||[]).length>=5);
 assert.match(splash, /--site-phase:0s/);
 assert.match(splash, /--site-phase:3\.4s/);
 assert.match(splash, /--site-phase:6\.5s/);
 assert.match(splash, /animation:blueprintConstruct 15s linear infinite/);
 assert.match(splash, /animation:blueprintEnergy 15s linear infinite/);
 assert.match(splash, /animation:blueprintNode 15s ease-in-out infinite/);
 assert.match(splash, /stroke-dasharray:100/);
 assert.match(splash, /stroke-dashoffset:100/);
 assert.match(splash, /@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(splash, /<video|<source[^>]*video|new WebGLRenderer/);
 assert(splash.length<750000,'mobile HTML is lightweight and WebP self-contained');
});
test('V69 single login replaces the old V65 welcome gate without changing restore',()=>{
 assert.doesNotMatch(index,/id="welcomeScreen"|id="welcomeFrame"/);
 assert.match(index,/id="startScreen"/);
 assert.match(index,/id="loading"/);
 assert.match(index,/id="characterScreen"/);
 assert.doesNotMatch(game,/displayWelcomeV64|acceptWelcomeV64/);
 assert.doesNotMatch(game,/title-preview-v65\.html\?embedded=1/);
 assert.match(game,/await chooseCharacter\(true\)/);
 assert.match(game,/beginPlay\(true\)/);
 assert.match(game,/cloudStartNewGame\(s\)/);
});

test('V65.1 left hall hologram respects perspective and physical prefab occlusion',()=>{
 assert.match(splash, /<mask id="galponDepthV65" maskUnits="userSpaceOnUse"/);
 assert.match(splash, /M430 560 L441 550 L500 546 L527 562 L528 656 L427 654 Z/);
 assert.match(splash, /class="build-site left-galpon" mask="url\(#galponDepthV65\)"/);
 assert.match(splash, /data:image\/webp;base64,/);
 assert.match(splash, /viewBox="0 0 1672 941"/);
 assert.match(splash, /preserveAspectRatio="none"/);
 assert.equal((splash.match(/class="build-site(?: left-galpon)?"/g)||[]).length,3);
});
test('V65.1 rolling ground dust travels behind JUGAR and stays low',()=>{
 assert.match(splash, /id="groundDust" aria-hidden="true"/);
 assert.match(splash, /#groundDust\{[^}]*z-index:7/);
 assert.match(splash, /#playHero\{[^}]*z-index:20/);
 assert.match(splash, /mask-image:linear-gradient\(to bottom,transparent 0%,transparent 67%/);
 assert.match(splash, /const groundBands=\[/);
 assert.match(splash, /const footLifts=\[/);
 assert.match(splash, /className='dust-bank'/);
 assert.match(splash, /className='ground-grit'/);
 assert.match(splash, /className='foot-lift'/);
 assert.match(splash, /@keyframes dustAcross/);
 assert.match(splash, /@keyframes gritAcross/);
 assert.match(splash, /@keyframes footDustRoll/);
 assert.match(splash, /#groundDust \.dust-bank,#groundDust \.ground-grit,#groundDust \.foot-lift\{animation:none;opacity:0\}/);
 assert.doesNotMatch(splash, /<video|canvas\.getContext\('webgl'\)/);
});

test('V69 Cloud Save lockouts remain available without intermediary overlay',()=>{
 assert.doesNotMatch(game,/phase==='welcome'/);
 assert.match(game,/function cloudLock\(\)/);
 assert.match(game,/No se pudo sincronizar · No se sobrescribió la partida/);
 assert.match(game,/phase='cloud-locked';hidden\(\$\('#startScreen'\),false\)/);
 assert.match(game,/showCloudLock\(\)/);
});
