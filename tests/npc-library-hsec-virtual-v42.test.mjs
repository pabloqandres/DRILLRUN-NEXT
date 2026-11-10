import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NPC_LIBRARY_RESERVATIONS,verifyUniqueNpcIds} from '../dist/assets3d/npc-library/registry.mjs';
const file=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('HSEC employs a virtual specialist but never loads duplicate visual 3D actors',()=>{
 const world=file('dist/hsec/world.mjs'),ui=file('dist/hsec/ui.mjs'),game=file('dist/chapter/game.mjs');
 assert.doesNotMatch(world,/loadNpc\(|this\.npcs|new GLTFLoader\(|CandidateRig\(|npcBubble/);
 assert.doesNotMatch(ui,/loadNpc\(/);
 assert.doesNotMatch(game,/kind:'hsecStaff'/);
 assert.match(file('dist/hsec/state.mjs'),/export function hire\(s,id\)/);
 assert.match(file('dist/hsec/state.mjs'),/export function startInspection\(s\)/);
 assert.match(file('dist/hsec/state.mjs'),/export function moveNpc\(s,dt\)/);
});
test('Unassigned M5/future roster slots cannot spawn or reuse same id',()=>{
 assert.equal(NPC_LIBRARY_RESERVATIONS.length,6);
 assert.equal(verifyUniqueNpcIds(),true);
 assert.equal(verifyUniqueNpcIds([...NPC_LIBRARY_RESERVATIONS,NPC_LIBRARY_RESERVATIONS[0]]),false);
 assert(NPC_LIBRARY_RESERVATIONS.every(e=>e.asset===null));
 assert(!file('dist/chapter/game.mjs').includes("npc-library/registry.mjs"));
});
test('Legacy HSEC GLBs stay in project metadata but are not used in scene',()=>{
 const catalog=file('dist/hsec/catalog.mjs');
 assert.match(catalog,/hsec-npc1\.glb/);assert.match(catalog,/hsec-npc2\.glb/);
 const w=file('dist/hsec/world.mjs'),ui=file('dist/hsec/ui.mjs');
 assert.doesNotMatch(w,/\.asset,import\.meta\.url/);
 assert.doesNotMatch(ui,/\.portrait/);
});
