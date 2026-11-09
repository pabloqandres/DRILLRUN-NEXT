import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cloudChoice,cloudGeneration} from '../dist/chapter/cloud-save.mjs';

const completedM4={version:6,cloudGeneration:0,savedAt:100,
 mission3:{phase:'complete'},mission4:{phase:'complete'}};
const oldPhoneM3={version:6,cloudGeneration:0,savedAt:1000,
 mission3:{phase:'active'},mission4:null};
const freshM1={version:6,cloudGeneration:1,cloudGameId:'new-run',
 cloudResetPending:false,mission3:null,mission4:null,savedAt:2000};

test('pre-reset migration keeps completed M4 over older M3 device',()=>{
 assert.equal(cloudChoice(oldPhoneM3,completedM4).source,'cloud');
});
test('explicit new-game generation takes precedence over old completed M4',()=>{
 assert.equal(cloudChoice(completedM4,freshM1).state,freshM1);
 assert.equal(cloudChoice(freshM1,completedM4).state,freshM1);
});
test('pending explicit reset increases generation and clears marker',()=>{
 const pending={...freshM1,cloudResetPending:true};
 const result=cloudChoice(pending,completedM4);
 assert.equal(result.source,'new-game');
 assert.equal(result.state.cloudResetPending,false);
 assert(cloudGeneration(result.state)>cloudGeneration(completedM4));
});
test('pending new game also clears marker when there is no previous cloud save',()=>{
 const result=cloudChoice({...freshM1,cloudResetPending:true},null);
 assert.equal(result.source,'new-game');
 assert.equal(result.state.cloudResetPending,false);
});
