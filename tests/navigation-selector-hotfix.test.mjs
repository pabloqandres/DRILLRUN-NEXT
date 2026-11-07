import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/chapter/game.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('all six bottom navigation destinations use plural DOM selector and cannot crash during startup',()=>{
  assert.match(source,/\$\$\('#bottomNav \[data-nav\]'\)\.forEach\(/);
  assert.doesNotMatch(source,/(?<!\$)\$\('#bottomNav \[data-nav\]'\)\.forEach\(/);
  const nav=[...html.matchAll(/data-nav="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(nav.length,6);
  assert.deepEqual(nav,['builder','m3-contract','m3-inventory','m3-personnel','hsec','m4-zones']);
});

test('single element getter $ remains separate from collection getter $$',()=>{
  assert.match(source,/\$\('#builderButton'\)\.onclick=openBuilder/);
  assert.match(source,/\$\$\('#bottomNav \[data-nav\]'\)/);
});
