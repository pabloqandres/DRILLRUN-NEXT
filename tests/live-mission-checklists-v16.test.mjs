import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mission3Readout} from '../dist/mission3/mission-readout.mjs';
import {mission2Readout} from '../dist/hsec/mission-readout.mjs';

test('M3: left card and phone share correct next step when geology is done but no drill is acquired',()=>{
 const s={
  office:{level:2,status:'built'},hsec:{assets:[{type:'shed',status:'built'}]},
  workshop:{status:'built',level:1},personnel:[{role:'admin'}],
  geoAnalysis:{requested:true,completed:true,reportAvailable:true},
  mission3:{phase:'equip',reportRead:true},drill:null,toolInventory:[],orders:[],contract:null,
  boreholes:[]
 };
 const m=mission3Readout(s);
 assert.equal(m.groups.length,5);
 assert.equal(m.pending.id,'buyDrill');
 assert.equal(m.pending.name,'Adquirir perforadora RC');
 assert.equal(m.done,5);
 assert.equal(m.total,13);
 assert.equal(m.progress,5/13);
 // Emulates both consumers using precisely one readout rather than phase strings.
 assert.equal(m.groups[2].checks[0].name,m.pending.name);
});

test('M3: next instruction advances through real check order without altering state',()=>{
 const s={
  office:{level:2,status:'built'},hsec:{assets:[{type:'shed',status:'built'}]},
  workshop:{status:'built',level:1},personnel:[{role:'admin'}],
  geoAnalysis:{requested:true,completed:true,reportAvailable:true},
  mission3:{phase:'equip',reportRead:true},drill:null,toolInventory:[],orders:[],contract:null,boreholes:[]
 };
 const prior=JSON.stringify(s);
 assert.equal(mission3Readout(s).pending.id,'buyDrill');
 s.drill={id:'rig01'};
 assert.equal(mission3Readout(s).pending.id,'hireDriller');
 assert.equal(JSON.stringify({...s,drill:null}),prior);
});

test('M2 checklist derives its seven completion requirements from evaluation',()=>{
 const s={
  office:{level:1,status:'built'},hsec:{
   time:0,revision:0,assets:[],orders:[],history:[],kitCones:0,completedAt:null
  },
  inventory:[],cash:5000
 };
 const r=mission2Readout(s);
 assert.equal(r.total,7);
 assert.equal(r.items[0].id,'office');
 assert.equal(r.items[0].done,false);
 assert.equal(r.items[5].name,'Iluminación mínima');
 assert.equal(r.items[6].id,'score');
 assert(r.done<r.total);
});
