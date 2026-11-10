import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const load=rel=>readFileSync(new URL('../'+rel,import.meta.url),'utf8');
const game=load('dist/chapter/game.mjs');
const stylesheet=load('dist/chapter/office-quick-v39.css');
const html=load('dist/index.html');

test('Office modal uses independent preview/details/action columns in landscape',()=>{
 assert.match(game,/officeQuickLayout/);
 assert.match(game,/officeQuickDetails/);
 assert.match(game,/officeQuickInfo/);
 assert.match(game,/officeQuickActions/);
 assert.match(game,/officePanelPreview/);
 assert.match(stylesheet,/grid-template-columns:minmax\(150px,\.92fr\) minmax\(0,1fr\)/);
 assert.match(stylesheet,/align-self:stretch!important/);
 assert.match(stylesheet,/\.officeQuickActions\{/);
});
test('All office action controls still use existing gameplay handlers',()=>{
 assert.match(game,/id="officeUpgrade"/);
 assert.match(game,/id="officeQuickEnter"/);
 assert.match(game,/id="buyOfficeUpgrade"/);
 assert.match(game,/\$\('#officeQuickEnter'\)\?\.addEventListener/);
 assert.match(game,/\$\('#officeUpgrade'\)\?\.addEventListener/);
 assert.match(game,/\$\('#buyOfficeUpgrade'\)\?\.addEventListener/);
 assert.match(game,/\$\('#cancelOfficeUpgrade'\)\?\.addEventListener/);
});
test('Current L2 and upgrade cards show actions without pushing them below viewport',()=>{
 assert.match(stylesheet,/#modal\.officeQuick #modalCard\{/);
 assert.match(stylesheet,/max-height:calc\(100dvh - 20px\)!important/);
 assert.match(stylesheet,/overflow:hidden!important/);
 assert.match(stylesheet,/officeQuickInfo\{[\s\S]*?overflow-y:auto!important/);
 assert.match(stylesheet,/officeQuickActions\{[\s\S]*?flex:0 0 auto!important/);
 assert.match(stylesheet,/@media\(max-height:520px\) and \(min-width:590px\)/);
 assert.match(stylesheet,/#modal\.officeQuick\.upgradeSheet #modalCard \.officePanelPreview/);
});
test('New visual stylesheet loads last and cache revision changes, other modals untouched',()=>{
 const v38=html.indexOf('workshop-card-v37.css');
 const v39=html.indexOf('office-quick-v39.css?v=39');
 assert(v38>0&&v39>v38);
 assert(html.includes('game.mjs?v=20261110-office-sheet-v39'));
 assert(!/\bstartModule\(/.test(stylesheet));
 assert(game.includes("officePanelPreview=new ProductPreview"));
});
