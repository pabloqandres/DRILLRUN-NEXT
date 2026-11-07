import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
const file=p=>readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('one lightweight static WebP generated from the exact playable DrillTruck asset',()=>{
 const source=file('chapter/drilltruck-image.mjs');
 const truck=file('mission4/drilltruck.mjs');
 const game=file('chapter/game.mjs');
 const image=new URL('../dist/assets/catalog/drilltruck.webp',import.meta.url);
 assert(existsSync(image));
 assert(statSync(image).size>2000);
 assert(statSync(image).size<100000);
 assert.equal(readFileSync(image).toString('ascii',0,4),'RIFF');
 assert.equal(readFileSync(image).toString('ascii',8,12),'WEBP');
 assert(source.includes("new URL('../assets/catalog/drilltruck.webp',import.meta.url)"));
 assert(source.includes('Promise.resolve(DRILLTRUCK_IMAGE_URL)'));
 assert(!source.includes('GLTFLoader'));
 assert(!source.includes('DRACOLoader'));
 assert(!source.includes('WebGLRenderer'));
 assert(!source.includes('renderRealTruck'));
 assert(truck.includes("export const DRILLTRUCK_GLB='assets3d/DRILLTRUCK_optimized.glb'"));
 assert(game.includes('../assets3d/DRILLTRUCK_optimized.glb'));
 assert(existsSync(new URL('../dist/assets3d/DRILLTRUCK_optimized.glb',import.meta.url)));
});

test('vehicle catalog card, technical sheet and management Phone use same static URL',()=>{
 const ui=file('chapter/builder-ui.mjs');
 const view=file('chapter/catalog-view.mjs');
 const phone=file('chapter/phone-ui.mjs');
 const m4=file('mission4/phone-apps.mjs');
 assert(ui.includes("import {drillTruckImage} from './drilltruck-image.mjs'"));
 assert(ui.includes('getDrillTruckThumbnail(){'));
 assert(ui.includes("p.kind==='vehicle'&&p.id==='drilltruck'?this.getDrillTruckThumbnail()"));
 assert(view.includes('class="catalogDetailVisual"'));
 assert(phone.includes("import {drillTruckImage} from './drilltruck-image.mjs'"));
 assert(phone.includes('drillTruckImage(this.getWorld()).then'));
 assert(phone.includes('stage.replaceChildren(img)'));
 assert(m4.includes('class="drillTruckHero"'));
});

test('original purchase flow and icon layout retained',()=>{
 const truck=file('mission4/drilltruck.mjs');
 const sheet=file('chapter/drilltruck-catalog-audit.css');
 assert(truck.includes('s.cash-=DRILLTRUCK_COST'));
 assert(sheet.includes('.catalogCategoryIcon'));
 assert(!sheet.includes('pointer-events:none!important'));
});
