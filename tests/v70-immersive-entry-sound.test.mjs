import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isImmersive,canRequestImmersive,tryImmersive} from '../dist/chapter/immersive-entry-v70.mjs';
import {CharacterSelectFeedback} from '../dist/audio/character-select-feedback-v68.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('V70: a trusted play click can enter fullscreen before asynchronous loading',async()=>{
 const doc={fullscreenElement:null};
 const root={requestFullscreen(options){assert.equal(options.navigationUI,'hide');doc.fullscreenElement=root;return Promise.resolve();}};
 doc.documentElement=root;
 assert.equal(canRequestImmersive(doc),true);
 assert.equal(await tryImmersive(doc),true);
 assert.equal(isImmersive(doc),true);
});
test('V70: browser denial and unsupported containers never claim success',async()=>{
 const denied={documentElement:{requestFullscreen:()=>Promise.reject(new DOMException('Blocked','NotAllowedError'))}};
 assert.equal(await tryImmersive(denied),false);
 const absent={documentElement:{}};
 assert.equal(canRequestImmersive(absent),false);
 assert.equal(await tryImmersive(absent),false);
 const refused={documentElement:{requestFullscreen(){throw new Error('blocked');}}};
 assert.equal(await tryImmersive(refused),false);
 const already={fullscreenElement:{},documentElement:{requestFullscreen(){throw Error('must not call twice');}}};
 assert.equal(await tryImmersive(already),true);
});
test('V70: all entry choices invoke fullscreen from a direct user gesture',()=>{
 const game=read('dist/chapter/game.mjs');
 const entry=game.slice(game.indexOf("$('#play').onclick=async()=>"),game.indexOf("$('#backStart').onclick="));
 assert.match(entry,/\$\('#play'\)\.onclick=async\(\)=>\{[\s\S]{0,170}requestImmersive\(\)/);
 assert.match(entry,/\$\('#newGame'\)\.onclick=\(\)=>\{[\s\S]{0,90}requestImmersive\(\)/);
 assert.match(entry,/\$\('#replaceSave'\)\.onclick=\(\)=>\{requestImmersive\(\);closeModal\(\)/);
 const start=game.slice(game.indexOf("$('#startAdventure').onclick=async()=>"),game.indexOf('function requestImmersive()'));
 assert.match(start,/\$\('#startAdventure'\)\.onclick=async\(\)=>\{[\s\S]{0,240}requestImmersive\(\)/);
 assert(game.includes('await chooseCharacter(true)'));
 assert(game.includes('beginPlay(true)'));
 assert(game.includes('cloudStartNewGame(s)'));
 assert(game.includes('if(selectorPreviewOnly)'));
 assert(game.includes("void promise.then(ok=>"));
});
test('V70: manual fullscreen fallback is an accessible gesture and cannot cover CTA',()=>{
 const html=read('dist/index.html'),css=read('dist/chapter/immersive-entry-v70.css'),game=read('dist/chapter/game.mjs');
 assert(html.includes('id="selectorFullscreen"'));
 assert(html.includes('aria-label="Activar pantalla completa"'));
 assert(html.includes('immersive-entry-v70.css?v=70'));
 assert(css.includes('100dvh'));
 assert(css.includes('safe-area-inset-bottom'));
 assert(css.includes('max-height:650px'));
 assert(css.includes('min-height:clamp(33px'));
 assert(game.includes("'#selectorFullscreen'"));
 assert(game.includes("document.addEventListener('fullscreenchange'"));
});
test('V70: UI sounds more audible without changing mute and vibration semantics',()=>{
 const source=read('dist/audio/character-select-feedback-v68.mjs');
 assert(source.includes('level:.028'));
 assert(source.includes('level:.023'));
 assert(source.includes('level:.039'));
 assert(source.includes('level:.0068'));
 assert(source.includes('exponentialRampToValueAtTime(.023,t+.035)'));
 assert(source.includes('Math.min(.055'));
 const feedback=new CharacterSelectFeedback({context:()=>{throw Error('muted audio must not initialize')},enabled:()=>false,haptics:()=>false});
 for(const kind of ['select','confirm','skill','type','focus','back'])assert.doesNotThrow(()=>feedback.play(kind));
 assert(!source.includes("if(kind==='type')this.pulse"));
});
