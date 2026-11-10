import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolveNarrativeText} from '../dist/chapter/narrative-ui.mjs';
import {NARRATIVE_STRINGS} from '../dist/chapter/narrative-strings.mjs';
import {PhoneUI} from '../dist/chapter/phone-ui.mjs';

const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('All five mission notifications use the real player name without literal {name}',()=>{
 for(let m=1;m<=5;m++)for(const stage of ['start','end']){
  const key=`narr_m${m}_${stage}`;
  assert.equal(NARRATIVE_STRINGS[key].length,5,key+' exists in all languages');
  for(const translated of NARRATIVE_STRINGS[key]){
   const personalized=resolveNarrativeText(translated,'María José');
   assert(!personalized.includes('{name}'),key);
   assert(!personalized.includes('\\n'),key+' must not display backslash-n');
  }
 }
 assert.match(resolveNarrativeText('Hola, {name}.','Pablo Rubio'),/Hola, Pablo Rubio\./);
 assert.equal(resolveNarrativeText('Hola, {name}.',null),'Hola, Operador.');
});

function phoneFixture(){
 const s={playerName:'Operador de prueba',narrative:{messages:[
  {id:'n:m1:start',characterId:'benefactor'},
  {id:'n:m4:start',characterId:'benefactor'},
  {id:'n:m5:start',characterId:'benefactor'}
 ]}};
 const bubbles=[];
 const c={
  scrollTop:0,clientHeight:225,className:'',
  getBoundingClientRect:()=>({top:100,bottom:325}),
  querySelectorAll:selector=>selector==='.narrativeBubble'?bubbles:[],
  querySelector:()=>null
 };
 const addBubble=(id,offset)=>{
  bubbles.push({dataset:{msgId:id},getBoundingClientRect:()=>({top:100+offset-c.scrollTop})});
 };
 addBubble('n:m1:start',25);addBubble('n:m4:start',310);addBubble('n:m5:start',595);
 const ui=new PhoneUI({
  shell:{classList:{remove(){}},dataset:{}},title:{},back:{style:{}},content:c,
  state:()=>s,translate:()=>key=>key,format:x=>x,onHUD(){}
 });
 ui.conversation=true;ui.narrativeCharacter='benefactor';
 // Only this test's message DOM needs to be simulated; all scroll handling
 // is the real PhoneUI.render() and its real _scrollToNarrativeMessage().
 ui.renderMessages=()=>{};ui.release=()=>{};
 return {s,c,ui,addBubble};
}

test('Opening a narrative thread jumps to most recent message from returning sender',()=>{
 const {ui,c}=phoneFixture();
 ui.render('messages');
 assert.equal(c.scrollTop,587,'M5 starts at the top of its own bubble, not M1');
});
test('Unrelated re-render preserves manual scroll; newly delivered SMS takes focus',()=>{
 const {ui,c,s,addBubble}=phoneFixture();
 ui.render('messages');c.scrollTop=333;
 ui.render('messages');
 assert.equal(c.scrollTop,333,'reading an old message must not unexpectedly jump');
 s.narrative.messages.push({id:'n:m5:end',characterId:'benefactor'});
 addBubble('n:m5:end',860);
 ui.render('messages');
 assert.equal(c.scrollTop,852,'new M5 closing should take focus even in same thread');
});
test('Explicit notification targeting jumps to that SMS, not to the wrong mission',()=>{
 const {ui,c,s}=phoneFixture();
 ui.render('messages');ui.focusNarrativeMessage(s.narrative.messages[0]);
 ui.render('messages');
 assert.equal(c.scrollTop,17);
 assert.equal(ui._focusNarrativeMessageId,null,'focus is consumed once');
});
test('New-message delivery and pending reply select latest for all five missions',()=>{
 const game=src('dist/chapter/game.mjs');
 assert.match(game,/resolveNarrativeText\(t\(msg\.bodyKey\)\|\|msg\.bodyKey,s\.playerName\)/);
 assert.match(game,/phoneUI\.focusNarrativeMessage\(msg\)/);
 assert.match(game,/findLast\(m=>!m\.actionTaken/);
 assert.match(game,/const isClosing=msg\.id\.endsWith\(':end'\)/);
 assert.match(game,/\^n:m\[1-5\]:end\$/);
 const phone=src('dist/chapter/phone-ui.mjs');
 assert.match(phone,/focusMessageId=this\._focusNarrativeMessageId/);
 assert.match(phone,/this\._scrollToNarrativeMessage\(focusMessageId\)/);
});
