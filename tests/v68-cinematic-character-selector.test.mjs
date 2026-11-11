import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AVATARS} from '../dist/chapter/avatars.mjs';
import {CharacterSelectFeedback} from '../dist/audio/character-select-feedback-v68.mjs';
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');

test('V68: actual four GLB avatars, unchanged bonuses, and original selection IDs',()=>{
 assert.equal(AVATARS.length,4);
 assert.deepEqual(AVATARS.map(a=>a.id),['operator01','operator02','operator03','operator04']);
 assert(AVATARS.every(a=>a.asset.endsWith('.glb')));
 assert.equal(AVATARS[0].bonuses.contractIncome,.04);
 assert.equal(AVATARS[1].bonuses.maintenanceCost,-.04);
 assert.equal(AVATARS[1].bonuses.maintenanceTime,-.04);
 assert.equal(AVATARS[2].bonuses.geologyCost,-.05);
 assert.equal(AVATARS[3].bonuses.constructionTime,-.05);
});
test('V68: hero and full-body derive from original skinned GLB, never a fabricated render',()=>{
 const roster=read('dist/chapter/avatar-roster.mjs');
 const portrait=read('dist/chapter/portrait.mjs');
 assert.match(roster,/figure\(id\)/);
 assert.match(roster,/renderFullBodyPortrait\(/);
 assert.match(roster,/e\.root\.visible=show\?chosen:a\.id===this\.selected/);
 assert.match(roster,/pickSelector\(clientX,clientY\)/);
 assert.match(portrait,/original\.getVertexPosition\(i,v\)/);
 assert.match(portrait,/original\.material/);
 assert.match(portrait,/renderer\.domElement\.toDataURL\('image\/png'\)/);
 assert.doesNotMatch(roster,/mockup|valentina\.png|generated\/|artificial/);
});
test('V68: the original identity, start and Google save routes survive the visual layer',()=>{
 const game=read('dist/chapter/game.mjs');
 const html=read('dist/index.html');
 assert(game.includes("setPlayerIdentity(s,selectedAvatar,$('#playerNameInput').value)"));
 assert(game.includes('await cloudStartNewGame(s)'));
 assert(game.includes("startCinematic(false,false);save();updateStartAccount();"));
 assert(game.includes("node.querySelectorAll('button').forEach(b=>b.onclick=()=>selectAvatar(b.dataset.character))"));
 assert(game.includes('const id=avatars?.pickSelector(x,y)'));
 assert(game.includes('new CinematicCharacterSelector'));
 assert(game.includes('avatars.figure(p.id)'));
 assert(game.includes("$('#playerNameInput').oninput=()=>"));
 assert(game.includes("selectorPreviewOnly"));
 assert(game.includes("new URLSearchParams(location.search).has('selectorPreview')"));
 assert(game.includes("No se ha creado ni reemplazado ninguna partida guardada."));
 assert(game.includes("void chooseCharacter(false)"));
 assert(game.indexOf("if(selectorPreviewOnly){",game.indexOf("$('#startAdventure').onclick"))<game.indexOf("s.cloudGeneration=previousCloudGeneration+1"));
 assert(!game.includes("$('#playerNameInput').oninput=renderCharacters"));
 assert(html.includes('character-select-v68.css?v=68'));
 assert(html.includes('id="playerNameInput"'));
});
test('V68: skill rail uses real avatar bonuses instead of invented mockup stats',()=>{
 const ui=read('dist/chapter/character-select-v68.mjs');
 assert(ui.includes('this.bonuses=avatar.bonuses||{}'));
 assert(ui.includes("['maintenanceCost','maintenanceTime']"));
 assert(ui.includes("['contractIncome']"));
 assert(ui.includes("['geologyCost']"));
 assert(ui.includes("['constructionTime']"));
 assert(ui.includes("Este personaje no tiene una bonificación adicional"));
 assert(!ui.includes('20%'));
 assert(!ui.includes('VALENTINA'));
});
test('V68: layout retains hero and visible editable input on short landscape mobile',()=>{
 const css=read('dist/chapter/character-select-v68.css');
 assert(css.includes('@media(max-height:500px)'));
 assert(css.includes('orientation:landscape'));
 assert(css.includes('.v68FigureArt img'));
 assert(css.includes('#playerNameInput')===false);
 assert(css.includes('.v68Name input'));
 assert(css.includes('.v68Skills'));
 assert(css.includes('.characterSlots .avatarChoice.selected'));
});
test('V68: no sound/haptics when disabled; no per-keystroke vibration',()=>{
 const feedback=new CharacterSelectFeedback({context:()=>{throw Error('disabled audio must not initialize')},enabled:()=>false,haptics:()=>false});
 for(const kind of ['select','confirm','skill','type','focus','back'])assert.doesNotThrow(()=>feedback.play(kind));
 const source=read('dist/audio/character-select-feedback-v68.mjs');
 assert(source.includes("if(kind==='select')this.pulse(8)"));
 assert(source.includes("if(kind==='confirm')this.pulse(12)"));
 assert(!source.includes("if(kind==='type')this.pulse"));
 assert(source.includes('navigator.vibrate'));
});
