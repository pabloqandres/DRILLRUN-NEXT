import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../dist/chapter/phone-ui.mjs',import.meta.url),'utf8');
const classSource=source.replace(/^import .*;$/gm,'').replace(/\bexport (?=(?:function|const|class))/g,'');
const PhoneUI=new Function('icon','unreadMessages','narrativeUnread','landReady','objective',
 classSource+'\nreturn PhoneUI;')(
 ()=>'<svg></svg>',()=>[],()=>0,()=>false,()=>'clear'
);

function fixture(){
 const content={scrollTop:0,className:'',querySelectorAll:()=>[],querySelector:()=>null};
 Object.defineProperty(content,'innerHTML',{
  set(html){this.html=html;this.scrollTop=0},
  get(){return this.html}
 });
 const phone=new PhoneUI({
  shell:{classList:{remove(){}},dataset:{}},
  content,title:{},back:{style:{}},
  state:()=>({office:{status:'unbuilt'},chapterCompletedAt:null}),
  translate:()=>k=>k,format:v=>String(v),onHUD:()=>{}
 });
 phone._disposeTyping=()=>{};
 return {phone,content};
}
test('refreshing the same phone app after a purchase preserves scroll position',()=>{
 const {phone,content}=fixture();
 phone.render('inventory');
 content.scrollTop=287;
 phone.render('inventory');
 assert.equal(content.scrollTop,287);
});
test('navigating to a different phone app resets scroll to the top',()=>{
 const {phone,content}=fixture();
 phone.render('inventory');
 content.scrollTop=287;
 phone.render('objectives');
 assert.equal(content.scrollTop,0);
});
test('catalog cards are scoped and have contained preview media',()=>{
 const source=readFileSync(new URL('../dist/chapter/hud-reference-v4.css',import.meta.url),'utf8');
 const markup=readFileSync(new URL('../dist/mission3/phone-apps.mjs',import.meta.url),'utf8');
 assert(source.includes('#phoneContent .m3RigCatalogCard>.rigPreview>img'));
 assert(source.includes('object-fit:contain!important'));
 assert(source.includes('overflow-y:auto!important'));
 assert(markup.includes('inventoryCard m3RigCatalogCard'));
});
test('desktop movement keys are ignored while the phone or a modal owns focus',()=>{
 const game=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
 assert(game.includes("if(phoneOpen||modalOpen||e.target.closest?.('#phone,#modal,input,select,textarea,[contenteditable]'))return"));
 assert(game.includes("document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});"));
});
test('interior shed lighting and softer footsteps are wired into visual/audio modules',()=>{
 const site=readFileSync(new URL('../dist/graphics/site-cinematics.mjs',import.meta.url),'utf8');
 const audio=readFileSync(new URL('../dist/audio/worksite-audio.mjs',import.meta.url),'utf8');
 assert(site.includes('this.workshopInteriorLights=[]'));
 assert(site.includes('new T.PointLight(0xe7f7ff,3.3,9,1.6)'));
 assert(audio.includes("surface==='concrete'?.052:.068"));
});
