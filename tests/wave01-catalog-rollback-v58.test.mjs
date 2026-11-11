import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const src=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Wave 01 experimental catalog cards and rejected atlas are removed',()=>{
 const catalog=src('dist/chapter/construction-catalog.mjs');
 const view=src('dist/chapter/catalog-view.mjs');
 assert.doesNotMatch(catalog,/waveProducts|asset-library-wave01|circularity:'Circularidad'|id:'circularity'/);
 assert.doesNotMatch(view,/waveAtlasArtwork|asset-library-wave01|wave01ModelArtwork/);
 assert.equal(existsSync(new URL('../dist/chapter/asset-library-wave01.mjs',import.meta.url)),false);
 assert.equal(existsSync(new URL('../dist/assets3d/drillrun-pack/catalog-manifest.json',import.meta.url)),false);
});
test('Original HSEC catalog and construction blueprint remain available',()=>{
 const catalog=src('dist/chapter/construction-catalog.mjs');
 const view=src('dist/chapter/catalog-view.mjs');
 assert.match(catalog,/HSEC_ASSETS/);
 assert.match(catalog,/return HSEC_CATEGORIES\.filter\(d=>d\.id!==\x27management\x27\)\.map\(/);
 assert.match(view,/hasBuildingBlueprint/);
 assert.match(view,/personnelArt\(picked\)/);
 assert.match(view,/thumbnail\(picked\)/);
 const hsec=src('dist/hsec/catalog.mjs');
 assert.match(hsec,/def\('cone','Cono de seguridad','boundaries',25/);
 assert.match(hsec,/def\('fence','Cerco perimetral','boundaries',55/);
});
