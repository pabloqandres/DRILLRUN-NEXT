import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ASSET_LIBRARY_WAVE01,ASSET_WAVE_VISUAL_ONLY,waveProducts,waveCellForProduct,waveAtlasArtwork,waveAtlasUrl} from '../dist/chapter/asset-library-wave01.mjs';
import {HSEC_ASSETS} from '../dist/hsec/catalog.mjs';

test('wave01 catalog provides eight new assets with read-only states, never a paid transaction',()=>{
 const cards=waveProducts({});
 assert.equal(cards.length,8);
 assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
 for(const c of cards){
  assert.equal(c.canStart,false);
  assert.equal(c.status,'future');
  assert.equal(c.price,null);
  assert.equal(c.insufficient,false);
  assert.notEqual(c.action,'buy');
  assert.ok(c.w>0&&c.d>0&&c.h>0);
 }
 assert.equal(ASSET_WAVE_VISUAL_ONLY,true);
});
test('real model sprite atlas covers Wave 01 new-product previews without overriding existing HSEC world previews',()=>{
 assert.ok(waveAtlasUrl.startsWith('data:image/webp;base64,'));
 assert.ok(waveAtlasUrl.length>400);
 const cells=ASSET_LIBRARY_WAVE01.map(i=>i.cell);
 assert.equal(new Set(cells).size,cells.length);
 assert.equal(waveCellForProduct({kind:'hsec',id:'cone'}),undefined);
 assert.equal(waveCellForProduct({kind:'hsec',id:'fence'}),undefined);
 assert.equal(waveAtlasArtwork({kind:'hsec',id:'cone'}),'');
 for(const product of waveProducts({}))assert.match(waveAtlasArtwork(product),/background-position:/);
});
test('original HSEC prices remain exactly as defined (no duplicate SKU)',()=>{
 assert.equal(HSEC_ASSETS.find(a=>a.id==='cone')?.price,25);
 assert.equal(HSEC_ASSETS.find(a=>a.id==='fence')?.price,55);
 assert.ok(!waveProducts({}).some(p=>['cone','fence'].includes(p.id)));
});
test('catalog UI is wired to asset cards and uses authored preview code',()=>{
 const catalog=readFileSync(new URL('../dist/chapter/construction-catalog.mjs',import.meta.url),'utf8');
 const view=readFileSync(new URL('../dist/chapter/catalog-view.mjs',import.meta.url),'utf8');
 assert.match(catalog,/products\.push\(\.\.\.waveProducts\(s\)\)/);
 assert.match(catalog,/id:'circularity'/);
 assert.match(view,/waveAtlasArtwork\(picked\)/);
 assert.match(view,/waveAtlasArtwork\(p\)/);
});
