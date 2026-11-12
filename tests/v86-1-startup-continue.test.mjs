import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('V86.1: startup labels reference ONLY live DOM, all are null-safe',()=>{
 const game=read('dist/chapter/game.mjs');
 const html=read('dist/index.html');
 const start=game.slice(game.indexOf('function applyText(){'),game.indexOf('function updateStartCard(){'));
 assert(start.includes("$('#'+id)?.setAttribute('aria-label',t(key))"));
 assert(!start.includes("'cameraHome'"),'deleted cameraHome was crashing startup, blocking Continue');
 const labels=[...start.matchAll(/\['([a-zA-Z0-9]+)','([a-zA-Z0-9]+)'\]/g)].map(m=>m[1]);
 assert(labels.length>=6);
 for(const id of labels)assert(html.includes('id="'+id+'"'),'Missing startup DOM element '+id);
 assert(!html.includes('id="cameraHome"'));
 assert(game.includes('prepareAuth(user=>'),'Google init still attached');
 assert(game.includes('initCloudSave(value,async user=>'),'cloud reconciliation preserved');
 assert(game.includes("$('#play').disabled=cloudSyncing||cloudLocked;"),'do not bypass cloud ownership while fixing render');
});
test('V86.1: no cloud/local save or mission logic changed by this hotfix',()=>{
 const game=read('dist/chapter/game.mjs');
 assert(game.includes('s=readSave();hasSave=!!s'));
 assert(game.includes("$('#play').onclick=async()=>"));
 assert(game.includes('const result=await cloudTakeControl(s,cloudLock)'));
 assert(game.includes("localStorage.setItem(CONFIG.saveKey,result.raw)"));
 assert(game.includes("installSemiRadialDock({"));
 assert(game.includes('function rescueStuckPlayer(){'));
});
