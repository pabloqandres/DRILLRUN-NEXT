import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const file=(p)=>readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('the one canonical vehicle asset is the actual playable GLB in the repository',()=>{
 const truck=file('mission4/drilltruck.mjs');
 const renderer=file('chapter/drilltruck-image.mjs');
 const game=file('chapter/game.mjs');
 assert(truck.includes("export const DRILLTRUCK_GLB='assets3d/DRILLTRUCK_optimized.glb'"));
 assert(game.includes("../assets3d/DRILLTRUCK_optimized.glb"));
 assert(renderer.includes("import {DRILLTRUCK_GLB} from '../mission4/drilltruck.mjs'"));
 assert(renderer.includes("loader.loadAsync(drillTruckAssetUrl())"));
 assert(renderer.includes("world.scene?.getObjectByName?.('drilltruck-wrapper')"));
 assert(renderer.includes("model=live.clone(true)"));
 assert(renderer.includes("node.geometry=node.geometry.clone()"));
 assert(renderer.includes("new T.Box3().setFromObject(model)"));
 assert(renderer.includes("model.scale.setScalar(5/dimension)"));
 assert(renderer.includes("new ProductPreview(host,world,{transparent:true})"));
 assert(renderer.includes("cutoutPNG(canvas)"));
 assert(existsSync(new URL('../dist/assets3d/DRILLTRUCK_optimized.glb',import.meta.url)));
});

test('GLB rendering is cached and retryable, not a procedural truck replacement',()=>{
 const s=file('chapter/drilltruck-image.mjs');
 assert(s.includes("let imagePromise=null"));
 assert(s.includes("if(!imagePromise)imagePromise=renderRealTruck(world).catch"));
 assert(s.includes("imagePromise=null; // Permit retry"));
 assert(s.includes("host.style.cssText='position:fixed;"));
 assert(s.includes("transform:translate(-200vw,-200vh)"));
 assert(!s.includes("createProceduralTruck"));
 assert(!s.includes("image_gen"));
});

test('the vehicle catalog card and technical sheet use the identical real GLB thumbnail',()=>{
 const ui=file('chapter/builder-ui.mjs');
 const view=file('chapter/catalog-view.mjs');
 const catalog=file('chapter/construction-catalog.mjs');
 assert(ui.includes("import {drillTruckImage} from './drilltruck-image.mjs'"));
 assert(ui.includes("getDrillTruckThumbnail(){"));
 assert(ui.includes("p.kind==='vehicle'&&p.id==='drilltruck'?this.getDrillTruckThumbnail()"));
 assert(ui.includes("this.store.render(this.store.options)"));
 assert(view.includes("data-real-asset-loading"));
 assert(view.includes("Modelo 3D real de"));
 assert(view.includes('class="catalogDetailVisual"'));
 assert(catalog.includes("id:'drilltruck',kind:'vehicle',category:'vehicles'"));
});

test('DrillTruck phone management and technical screen displays same source photo',()=>{
 const phone=file('chapter/phone-ui.mjs'),m4=file('mission4/phone-apps.mjs');
 assert(phone.includes("import {drillTruckImage} from './drilltruck-image.mjs'"));
 assert(phone.includes("if(app==='m4-drilltruck')"));
 assert(phone.includes("drillTruckImage(this.getWorld()).then"));
 assert(phone.includes("stage.replaceChildren(img)"));
 assert(m4.includes('class="drillTruckHero"'));
 assert(m4.includes("data-drilltruck-asset"));
 assert(m4.includes("Camión de servicio"));
});

test('category icon holders and HUD top actions keep optical alignment',()=>{
 const view=file('chapter/catalog-view.mjs');
 const sheet=file('chapter/drilltruck-catalog-audit.css');
 const html=file('index.html');
 assert(view.includes("class=\"catalogCategoryIcon\""));
 assert(view.includes("this.host.dataset.category=category"));
 assert(sheet.includes("#builderPanel.catalogTray .catalogCategoryIcon"));
 assert(sheet.includes("#hud header .topActions .iconButton"));
 assert(sheet.includes("display:grid!important;place-items:center!important"));
 assert(sheet.includes('data-category="vehicles"'));
 assert(html.includes('drilltruck-catalog-audit.css"></head>'));
});

test('economy, saved truck and original office stay unchanged by category audit',()=>{
 const truck=file('mission4/drilltruck.mjs'),game=file('chapter/game.mjs');
 assert(truck.includes("s.cash-=DRILLTRUCK_COST"));
 assert(game.includes("const truckPresent=m3DeliveryVehicle.visible&&m3DeliveryVehicle.parent===world.scene;"));
 const sheet=file('chapter/drilltruck-catalog-audit.css');
 assert(!sheet.includes("pointer-events:none!important"));
});
