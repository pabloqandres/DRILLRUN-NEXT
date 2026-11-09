import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cloudChoice,cloudGeneration} from '../dist/chapter/cloud-save.mjs';

const oldM4={version:6,mission4:{phase:'complete'},cloudGeneration:0,savedAt:1000};
const newM1={version:6,mission4:null,mission3:null,cloudGeneration:1,savedAt:100};

test('explicit new game overrides previously completed M4 even with lower stage and time',()=>{
 const choice=cloudChoice(newM1,oldM4,false);
 assert.equal(choice.source,'device');
 assert.equal(choice.state.cloudGeneration,1);
});
test('fresh reset awaiting Google upload supersedes old M4',()=>{
 const choice=cloudChoice({...newM1,cloudGeneration:0,cloudResetPending:true},oldM4,false);
 assert.equal(choice.source,'new-game');
 assert.equal(choice.state.cloudGeneration,1);
 assert.equal(choice.state.cloudResetPending,false);
});
test('old PC M4 cannot reclaim newer new-game generation',()=>{
 const choice=cloudChoice(oldM4,newM1,false);
 assert.equal(choice.source,'cloud');
});
test('same generation still protects completed game from stale phone',()=>{
 const choice=cloudChoice({...newM1,cloudGeneration:0},oldM4,false);
 assert.equal(choice.source,'cloud');
});
test('generation uses integer nonnegative counter',()=>{
 assert.equal(cloudGeneration({cloudGeneration:4.8}),4);
 assert.equal(cloudGeneration({cloudGeneration:-2}),0);
});
