import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=resolve('dist/assets3d/drillrun-pack');
const registry=readFileSync('dist/chapter/asset-wave01-runtime.mjs','utf8');
const known=['cono_seguridad','cerco_perimetral','contenedor_azul_reciclaje','contenedor_verde_reciclaje',
 'contenedor_oscuro_residuos','pallet_bodega','cajon_bodega','montacargas_bodega',
 'cargador_frontal_a','cargador_frontal_b','galpon_bodega','edificio_industrial_49',
 'estructura_auxiliar','maquinaria_obra_auxiliar'];

test('Wave 01 register has 14 allowlisted GLB assets and excludes C4D',()=>{
 assert.equal(new Set(known).size,14);
 for(const id of known)assert.ok(registry.includes("id:'"+id+"'"),id);
 assert.doesNotMatch(registry,/Digger\.c4d/);
 assert.match(registry,/ConstructionHologram/);
});
test('Wave 01 asset registry and catalog integration parse in Node',()=>{
 for(const name of ['dist/chapter/asset-wave01-runtime.mjs','dist/chapter/builder-ui.mjs']){
  const p=spawnSync(process.execPath,['--check',name],{encoding:'utf8'});
  assert.equal(p.status,0,name+' '+p.stderr);
 }
});
test('Existing Wave 01 manifest remains explicitly noncommercial until assets are available',()=>{
 const j=JSON.parse(readFileSync(resolve(root,'catalog-manifest.json'),'utf8'));
 assert.equal(j.sourceCount,15);assert.equal(j.convertedCount,14);
 assert.equal(j.items.filter(x=>x.asset&&x.asset.endsWith('.glb')).length,14);
 assert.ok(j.items.every(x=>x.available===false));
});
test('Wave 01 GLBs are valid after binary installation (optional until uploaded)',t=>{
 const present=known.filter(id=>existsSync(resolve(root,id+'.glb')));
 if(present.length===0){t.skip('Binary GLBs not yet uploaded to GitHub: visual changes only');return;}
 assert.equal(present.length,14,'Do not deploy partial GLB collections');
 for(const id of present){
  const data=readFileSync(resolve(root,id+'.glb'));
  assert.equal(data.toString('ascii',0,4),'glTF',id);
  assert.equal(data.readUInt32LE(4),2,id+' glTF version');
  assert.equal(data.readUInt32LE(8),data.length,id+' length');
  const thumb=resolve(root,'previews',id+'.jpg');
  assert.ok(existsSync(thumb),'missing real preview '+id);
 }
 assert.equal(readdirSync(resolve(root,'previews')).filter(x=>x.endsWith('.jpg')).length,14);
});
