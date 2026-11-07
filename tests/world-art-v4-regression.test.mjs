import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {softContactShadow,finishConcretePad} from '../dist/graphics/world-finish.mjs';
const read=p=>readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('new premium ground assets remain visual-only and do not modify world collision arrays',()=>{
 const s=read('graphics/world-finish.mjs');
 for(const fn of ['finishConcretePad','softContactShadow','installMineralYard'])assert(s.includes('export function '+fn+'('));
 assert.doesNotMatch(s,/colliders\.push|physicalBoundaries\.push|walkSurfaces\.push|s\.cash|localStorage|mission3|mission4/);
 assert.match(s,/new T\.InstancedMesh/);
 assert.match(s,/World Art V4 · mineral concrete surface/);
 assert.match(s,/World Art V4 · soft ambient contact/);
 assert.match(s,/World Art V4 · yard mineral detail/);
});
test('world factory mounts industrial finishes to real pads, real office and workshop',()=>{
 const scene=read('scene.mjs'),office=read('assets3d/office-shell.mjs');
 assert(scene.includes('finishConcretePad(this,g,x,z,w,d)'));
 assert(scene.includes('softContactShadow(this,g,8.3,6.05,.143)'));
 assert(scene.includes('installMineralYard(this)'));
 assert(office.includes('softContactShadow(w,root,7.3,3.7,.018)'));
 assert(scene.includes("entryLight.name='Taller · warm entry light'"));
 assert(office.includes("entryGlow.name='Oficina · warm porch lighting'"));
});
test('advanced roof remains invisible at office level 1, present at level 2 and inside real roof',()=>{
 const office=read('assets3d/office-shell.mjs'),scene=read('scene.mjs'),preview=read('chapter/product-preview.mjs');
 assert(office.includes("design.visible=false;roof.add(design)"));
 assert(office.includes('roof.remove(design)'));
 assert(office.includes('batch(design)'));
 assert(office.includes('roof.add(design)'));
 assert(scene.includes('this.office.userData.premiumRoof.visible=(state.office?.level||1)>=2'));
 assert(preview.includes("if(o.name==='11 · Industrial finishes and roof equipment')o.visible=(module.level||1)>=2"));
});
test('lighting respects HSEC day/night and restores the normal sky/fog after HSEC',()=>{
 const s=read('hsec/world.mjs');
 assert(s.includes('this.w.scene.fog.color.set(night?0x233449:0xb8c2c9)'));
 assert(s.includes('this.w.sun.color.set(night?0xabc2e0:0xffdfae)'));
 assert(s.includes('this.w.scene.fog.color.set(0xb8c2c9);return;'));
});
test('decorative yard is disabled in low quality with consistent save state',()=>{
 const s=read('graphics/quality.mjs');
 assert(s.includes("world.worldArtYard.visible=id!=='low'"));
 assert(s.includes("GRAPHICS_KEY='drillrun-graphics-v1'"));
});
test('procedural pads and contact shadows are safe under DOM-free Node geometry tests',()=>{
 assert.equal(softContactShadow({},{} ,7,3),null);
 assert.equal(finishConcretePad({}, {},0,0,6,4),null);
});
