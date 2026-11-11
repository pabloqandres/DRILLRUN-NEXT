import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=source('dist/index.html');
const css=source('dist/chapter/entry-cinematic-v64.css');
const screen=source('dist/title-preview-v64.html');
const game=source('dist/chapter/game.mjs');

test('V64 approved splash is self-contained and light enough for Android',()=>{
 assert(screen.includes('DRILL RUN NEXT GENERATION'));
 assert(screen.includes('data:image/webp;base64,'));
 assert.match(screen,/#logoShine/);
 assert.match(screen,/#blueprint/);
 assert.match(screen,/@keyframes holoPulse/);
 assert.match(screen,/@keyframes floatDust/);
 assert.match(screen,/@keyframes sceneDrift/);
 assert.match(screen,/@keyframes buttonBreath/);
 assert.match(screen,/prefers-reduced-motion:reduce/);
 assert(!screen.includes('http://')&&!screen.includes('https://'));
 assert(screen.length<750000,'no massive video asset in title screen');
});
test('V64 keeps interactive JUGAR as real button',()=>{
 assert.match(screen,/id="playHero" aria-label="JUGAR/);
 assert.match(screen,/addEventListener\('click'/);
 assert.match(screen,/window\.parent\.postMessage\(\{type:'drillrun-welcome-enter-v64'\},window\.location\.origin\)/);
 assert.match(screen,/body\.embedded #modeTools/);
 assert.match(screen,/data:image\/webp;base64/);
});
test('V64 approved brand logo is reused on Google login and loading screens',()=>{
 assert.match(html,/entry-cinematic-v64\.css\?v=64/);
 assert.match(css,/#welcomeScreen/);
 assert.match(css,/#welcomeFrame/);
 assert.match(css,/\.startBrand h1/);
 assert.match(css,/#loading \.loadCard \.wordmark/);
 assert.match(css,/data:image\/webp;base64,/);
 assert.match(css,/font-size:0!important/);
});
test('V64 login, load, welcome, avatar/restore flow',()=>{
 assert.match(html,/id="startScreen"/);
 assert.match(html,/id="loading"/);
 assert.match(html,/id="welcomeScreen" class="screen hidden"/);
 assert.match(html,/id="characterScreen"/);
 assert.match(html,/id="welcomeFrame"/);
 assert.match(game, /await ensureWorld\(!hasSave\);\s*displayWelcomeV64\(\)/);
 assert.match(game, /phase='welcome'/);
 assert.match(game, /if\(!hasSave\)\{\s*await chooseCharacter\(true\)/);
 assert.match(game, /prefs\.lang=s\.lang;prefs\.sound=s\.sound;t=translator\(s\.lang\)/);
 assert.match(game, /applyText\(\);hasSave=true;beginPlay\(true\)/);
 assert.match(game, /event\.origin!==location\.origin/);
 assert.match(game, /event\.source!==\$\('#welcomeFrame'\)\?\.contentWindow/);
 assert.match(game, /event\.data\?\.type!=='drillrun-welcome-enter-v64'/);
 assert.match(game, /frame\.removeAttribute\('src'\)/);
 assert.match(game, /if\(cloudSyncing\|\|cloudLocked\|\|welcomeTransitionBusy\)return/);
});
test('V64 does not alter Google auth, saves, missions or character intro',()=>{
 assert.match(game, /prepareAuth\(user=>/);
 assert.match(game, /await reconcileGoogleSave\(\)/);
 assert.match(game, /cloudStartNewGame\(s\)/);
 assert.match(game, /cinematic\.start\(s\.character,\{orbitOnly\}\)/);
 assert.match(game, /function beginPlay\(resuming=false\)/);
 assert.match(game, /function save\(\)\{if\(!s\|\|!hasSave/);
 assert.match(game, /if\(freshGameRequested\)\{/);
 assert.doesNotMatch(screen, /localStorage|firebase|cloudSave|cloudGeneration/);
});
