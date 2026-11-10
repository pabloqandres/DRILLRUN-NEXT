import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {BuilderUI} from '../dist/chapter/builder-ui.mjs';
import {createPatioWorld} from '../dist/mission5/patio-world.mjs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Patio L1 generates catalogue image from the actual world prefab, not generic icon',()=>{
 const productPreview=source('dist/chapter/product-preview.mjs');
 const builder=source('dist/chapter/builder-ui.mjs');
 const game=source('dist/chapter/game.mjs');
 assert.match(productPreview,/export function patioThumbnail\(world,structuralSource\)/);
 assert.match(productPreview,/preview\.setBuilding\(structuralSource\)/);
 assert.match(productPreview,/cutoutPNG\(preview\.renderer\.domElement\)/);
 assert.match(builder,/p\.kind==='patio'\?this\.getPatioThumbnail\(\)/);
 assert.match(builder,/this\.getPatioPreviewSource\?\.\(\)/);
 assert.match(game,/getPatioPreviewSource:\(\)=>\{/);
 assert.match(game,/return m5World\?\.structuralSource\|\|null/);
 assert.match(source('dist/chapter/catalog-view.mjs'),/const image=p\.status==='future'\?null:thumbnail\(p\)/);
 assert.match(source('dist/chapter/catalog-view.mjs'),/thumbnail\(picked\)/);
});

test('M5 source contains assembled access, canopy, logistics, fuel and HSEC, not future plots',()=>{
 const sourceModel=source('dist/mission5/patio-world.mjs');
 assert.match(sourceModel,/const structuralSource=new T\.Group\(\)/);
 assert.match(sourceModel,/for\(const part of \[grading,structures,final\]\)structuralSource\.add\(part\.clone\(true\)\)/);
 assert.match(sourceModel,/buildCoveredFleet\(w,structures\)/);
 assert.match(sourceModel,/buildLogistics\(w,structures\)/);
 assert.match(sourceModel,/buildFuel\(w,structures\)/);
 assert.match(sourceModel,/buildAccess\(w,structures\)/);
 assert.match(sourceModel,/operationalDetails\(w,final\)/);
 assert.doesNotMatch(sourceModel,/structuralSource\.add\(future/);
});

test('A given patio preview image is generated once, cached and reused for details',()=>{
 const model=Object.create(BuilderUI.prototype);
 model.buildingThumbnails=new Map();
 model.world={};
 model.getPatioPreviewSource=()=>({children:[]});
 // Empty or missing source MUST NOT cache a false result and can retry
 assert.equal(model.getPatioThumbnail(),null);
 assert.equal(model.buildingThumbnails.size,0);
 model.buildingThumbnails.set('patio-maquinarias-l1','data:image/png;base64,stablePreview');
 assert.equal(model.getPatioThumbnail(),'data:image/png;base64,stablePreview');
 assert.equal(model.buildingThumbnails.size,1);
});

test('A technical sheet uses same thumbnail supplier as the card, without any purchase',()=>{
 const view=source('dist/chapter/catalog-view.mjs');
 assert.match(view,/catalogDetailVisual.*thumbnail\(picked\)/);
 assert.match(view,/catalogArt.*image\?/);
 const builder=source('dist/chapter/builder-ui.mjs');
 assert.match(builder,/this\.buildingThumbnails\.set\(key,image\)/);
 assert.doesNotMatch(source('dist/chapter/product-preview.mjs').slice(
  source('dist/chapter/product-preview.mjs').indexOf('export function patioThumbnail'),
  source('dist/chapter/product-preview.mjs').indexOf('// The workshop thumbnail')
 ),/cash\s*[-+]=|save\(|startPatio\(|newGame\(/);
});
