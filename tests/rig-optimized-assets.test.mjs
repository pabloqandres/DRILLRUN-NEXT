import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const asPath=p=>new URL('../dist/'+p,import.meta.url);
for(const [label,glb,maxSize,maxFaces] of [
 ['RC','drill_rc_sondaje_optimized.glb',4_000_000,160_000],
 ['DTH','drill_dth_produccion_optimized.glb',3_000_000,120_000]
]){
 test(label+' optimized GLB has valid payload and lightweight geometry', {skip:!fs.existsSync(asPath('assets3d/'+glb))},()=>{
  const buffer=fs.readFileSync(asPath('assets3d/'+glb));
  assert.equal(buffer.toString('ascii',0,4),'glTF');
  assert.equal(buffer.readUInt32LE(4),2);
  assert.equal(buffer.readUInt32LE(8),buffer.length);
  assert.ok(buffer.length<maxSize);
  const jsonLength=buffer.readUInt32LE(12);
  const json=JSON.parse(buffer.subarray(20,20+jsonLength).toString());
  const indices=json.accessors[json.meshes[0].primitives[0].indices].count;
  assert.ok(indices/3<maxFaces);
  assert.equal(json.images?.length||0,0);
  assert.ok(json.meshes[0].primitives[0].attributes.COLOR_0!==undefined);
  assert.equal(json.animations?.length||0,0); // single mesh source; animation needs manual separation
 });
}

test('visual loader uses local unbranded assets and no gameplay writes',()=>{
 const module=fs.readFileSync(asPath('chapter/rig-visuals.mjs'),'utf8');
 assert.match(module,/drill_rc_sondaje_optimized\.glb/);
 assert.match(module,/drill_dth_produccion_optimized\.glb/);
 assert.match(module,/rig_rc_advanced/);
 assert.doesNotMatch(module,/s\.cash|save\(|purchaseDrill\(|ledger\.push/);
});
