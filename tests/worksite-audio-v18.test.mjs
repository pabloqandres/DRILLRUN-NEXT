import {test} from 'node:test';
import assert from 'node:assert/strict';
import {walkingSurface,WorksiteAudio} from '../dist/audio/worksite-audio.mjs';

test('footsteps detect site gravel, confirmed road and building floor',()=>{
 const state={inside:false,hsec:{assets:[{type:'vehicle',status:'built',points:[{x:0,z:0},{x:10,z:0}]}]}};
 assert.equal(walkingSurface(state,{x:4,z:8}),'gravel');
 assert.equal(walkingSurface(state,{x:4,z:.6}),'concrete');
 assert.equal(walkingSurface(state,{x:-6,z:0},[{x:-6,z:0,w:7,d:4}]),'concrete');
 assert.equal(walkingSurface({...state,inside:true},{x:40,z:12}),'concrete');
});

class Param{
 constructor(){this.value=0}
 setTargetAtTime(v){this.value=v}
 setValueAtTime(v){this.value=v}
 exponentialRampToValueAtTime(v){this.value=v}
}
class Node{
 constructor(){this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.playbackRate=new Param();}
 connect(){}disconnect(){}start(){}stop(){}
}
const context=()=>({
 sampleRate:22050,currentTime:1,state:'running',destination:new Node(),
 createGain:()=>new Node(),createOscillator:()=>new Node(),
 createBufferSource:()=>new Node(),createBiquadFilter:()=>new Node(),
 createBuffer:(channels,length)=>({getChannelData:()=>new Float32Array(length)}),
 resume:()=>Promise.resolve()
});

test('machine sound mixes attenuated audio when near, and obeys sound-off',()=>{
 const audio=new WorksiteAudio(context);
 audio.set(true);
 const state={inside:false,position:{x:-7.6,z:-9.3},
  workshop:{status:'built'},office:{status:'built'},hsec:{assets:[]}};
 audio.update(state,.05,{position:state.position,
  drilling:true,drill:{position:{x:-7,z:-8}},
  truckMoving:true,truck:{position:{x:-8,z:-8}},playing:true});
 assert(audio.workshop.out.gain.value>0);
 assert(audio.drill.out.gain.value>0);
 assert(audio.truck.out.gain.value>0);
 audio.set(false);
 assert.equal(audio.workshop.out.gain.value,0);
 assert.equal(audio.drill.out.gain.value,0);
 assert.equal(audio.truck.out.gain.value,0);
 audio.dispose();
 assert.equal(audio.ready,false);
});

test('worksite stays silent if no buildings or machines are active',()=>{
 const audio=new WorksiteAudio(context);audio.set(true);
 audio.update({position:{x:20,z:20},office:{status:'unbuilt'},hsec:{assets:[]}},
 .05,{playing:true,position:{x:20,z:20},drilling:false,truckMoving:false});
 assert.equal(audio.workshop.out.gain.value,0);
 assert.equal(audio.truck.out.gain.value,0);
 assert.equal(audio.drill.out.gain.value,0);
 assert.equal(audio.office.out.gain.value,0);
 audio.dispose();
});
