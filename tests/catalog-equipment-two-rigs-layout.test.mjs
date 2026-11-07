import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=path=>readFileSync(new URL('../dist/'+path,import.meta.url),'utf8');

test('vehicle category keeps the Catalog identity rail in desktop and compact viewport',()=>{
 const css=file('chapter/drilltruck-catalog-audit.css');
 assert.match(css,/data-category="vehicles"\]:not\(\.catalogCollapsed\) \.constructionRail\s*\{[^}]*padding:10px 14px 10px 144px!important;/);
 assert.match(css,/@media\(max-width:900px\),\(max-height:510px\)\s*\{[^}]*data-category="vehicles"\]:not\(\.catalogCollapsed\) \.constructionRail\s*\{padding-left:101px!important\}/);
});

test('equipment card names are player-readable, and only two active rig types show',async()=>{
 const js=file('chapter/construction-catalog.mjs');
 assert(js.includes("rig_rc_compact:'PIONERO RC'"));
 assert(js.includes("rig_dth_production:'TITÁN DTH'"));
 assert(js.includes("rig_rc_advanced:'PIONERO RC PRO'"));
 assert(js.includes("if(d.id!==visibleRcId)continue"));
 assert(js.includes("s.drill?.id==='rig_rc_advanced'||rcOrderedAdvanced"));
 assert(js.includes("title:EQUIPMENT_DISPLAY_NAMES[d.id]||d.labelKey||d.nameKey"));
 const rigs=file('mission3/drills.mjs');
 const dth=file('mission4/drills-dth.mjs');
 assert(rigs.includes("id:'rig_rc_advanced'"));
 assert(rigs.includes("id:'rig_rc_compact'"));
 assert(dth.includes("id:'rig_dth_production'"));
});
