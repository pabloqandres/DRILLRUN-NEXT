import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cloudProgressStage} from '../dist/chapter/cloud-save.mjs';

test('M4 completed PC outranks phone with M3 even if phone local time is newer',()=>{
 const pc={version:6,savedAt:100,mission4:{phase:'complete'},mission3:{phase:'complete'}};
 const phone={version:6,savedAt:1000,mission4:null,mission3:{phase:'active'}};
 assert(cloudProgressStage(pc)>cloudProgressStage(phone));
});
test('M4 active outranks M3 complete',()=>{
 assert(cloudProgressStage({mission4:{phase:'active'}})>cloudProgressStage({mission3:{phase:'complete'}}));
});
test('no fabricated or invalid progression',()=>{
 assert.equal(cloudProgressStage(null),-1);
 assert.equal(cloudProgressStage({mission4:{phase:'inactive'},mission3:{phase:'inactive'}}),0);
});
