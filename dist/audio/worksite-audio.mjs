// DRILL RUN NEXT GENERATION · V18 original procedural worksite audio.
// No sampled third-party sound assets, downloads, music, copyrighted recordings,
// mission/state changes or scheduling outside the existing animation frame.
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const distance=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0));
const proximity=(a,b,near=2,far=18)=>1-clamp((distance(a,b)-near)/Math.max(1,far-near));
function segmentDistance(p,a,b){
 const vx=b.x-a.x,vz=b.z-a.z,l=Math.max(.0001,vx*vx+vz*vz);
 const t=clamp(((p.x-a.x)*vx+(p.z-a.z)*vz)/l);
 return Math.hypot(p.x-a.x-t*vx,p.z-a.z-t*vz);
}
export function walkingSurface(s,p,walkSurfaces=[]){
 if(s.inside)return 'concrete';
 // Prefabricated pads are flush with the terrain and never become phantom roads.
 if(walkSurfaces.some(a=>Math.abs((a.x||0)-p.x)<(a.w||0)/2&&Math.abs((a.z||0)-p.z)<(a.d||0)/2))return 'concrete';
 const segments=(s.hsec?.assets||[]).filter(a=>a.status==='built'&&['vehicle','pedestrian'].includes(a.type));
 for(const route of segments)for(let i=1;i<(route.points?.length||0);i++){
  if(segmentDistance(p,route.points[i-1],route.points[i])<(route.type==='vehicle'?1.55:.82))return 'concrete';
 }
 return 'gravel';
}
export class WorksiteAudio{
 constructor(getContext){
  this.getContext=getContext;this.enabled=false;this.ready=false;
  this.stepDistance=0;this.lastFoot=0;this.time=0;this.nextClank=5;
 }
 create(){
  if(this.ready)return;
  const ctx=this.getContext();if(!ctx||typeof ctx.createGain!=='function')return;
  this.ctx=ctx;
  const master=ctx.createGain();master.gain.value=.47;master.connect(ctx.destination);this.master=master;
  const makeNoise=(duration,seed)=>{
   const n=Math.max(1024,Math.floor(ctx.sampleRate*duration));
   const buf=ctx.createBuffer(1,n,ctx.sampleRate),data=buf.getChannelData(0);
   let x=seed>>>0||1;
   for(let i=0;i<n;i++){x=(Math.imul(x,1664525)+1013904223)>>>0;data[i]=(x/2147483648-1);}
   return buf;
  };
  this.buffers={noise:makeNoise(1.25,8271),steps:makeNoise(.20,4151)};
  const engine=(base,low,high)=>{
   const out=ctx.createGain();out.gain.value=0;out.connect(master);
   const lowOsc=ctx.createOscillator();lowOsc.type='sawtooth';lowOsc.frequency.value=base;
   const lowFilter=ctx.createBiquadFilter();lowFilter.type='lowpass';lowFilter.frequency.value=low;
   const body=ctx.createGain();body.gain.value=.22;lowOsc.connect(lowFilter);lowFilter.connect(body);body.connect(out);lowOsc.start();
   const src=ctx.createBufferSource();src.buffer=this.buffers.noise;src.loop=true;
   const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=high;filter.Q.value=.6;
   const air=ctx.createGain();air.gain.value=.16;src.connect(filter);filter.connect(air);air.connect(out);src.start();
   return {out,lowOsc,filter,src};
  };
  this.workshop=engine(68,240,680);
  this.drill=engine(48,540,1750);
  this.truck=engine(72,390,550);
  this.office=engine(90,170,160);
  this.ready=true;
 }
 fade(node,value,t=.12){
  if(!node||!this.ctx)return;
  node.gain.setTargetAtTime(Math.max(0,value),this.ctx.currentTime,t);
 }
 set(enabled){
  this.enabled=!!enabled;
  if(!enabled){if(this.ready)for(const channel of ['workshop','drill','truck','office'])this.fade(this[channel].out,0,.1);return;}
  // Only called from an established game audio-enabled user interaction.
  try{this.create();if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}
 }
 step(surface,spatial,now){
  if(!this.ready||this.ctx?.state!=='running')return;
  const ctx=this.ctx;
  const src=ctx.createBufferSource();src.buffer=this.buffers.steps;
  src.playbackRate.value=surface==='concrete'?.95+Math.random()*.16:.72+Math.random()*.21;
  const high=ctx.createBiquadFilter();high.type='bandpass';high.frequency.value=surface==='concrete'?900:380;
  high.Q.value=surface==='concrete'?.72:.45;
  const volume=ctx.createGain();const start=ctx.currentTime+.005;
  volume.gain.setValueAtTime(.0001,start);
  volume.gain.exponentialRampToValueAtTime((surface==='concrete'?.075:.11)*spatial,start+.016);
  volume.gain.exponentialRampToValueAtTime(.0001,start+(surface==='concrete'?.13:.18));
  src.connect(high);high.connect(volume);volume.connect(this.master);
  src.start(start);src.stop(start+.2);
  src.onended=()=>{src.disconnect();high.disconnect();volume.disconnect();};
  this.lastFoot=now;
 }
 metalTick(strength=.25){
  if(!this.ready||this.ctx?.state!=='running')return;
  const ctx=this.ctx,at=ctx.currentTime+.005,frequency=420+Math.random()*260;
  const osc=ctx.createOscillator();osc.type='triangle';osc.frequency.setValueAtTime(frequency,at);
  osc.frequency.exponentialRampToValueAtTime(frequency*.55,at+.14);
  const filter=ctx.createBiquadFilter();filter.type='highpass';filter.frequency.value=260;
  const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,at);
  gain.gain.exponentialRampToValueAtTime(.07*strength,at+.009);
  gain.gain.exponentialRampToValueAtTime(.0001,at+.20);
  osc.connect(filter);filter.connect(gain);gain.connect(this.master);
  osc.start(at);osc.stop(at+.21);
  osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();};
 }
 update(s,dt,{position,moving=false,walkSurfaces=[],drill=null,drilling=false,truck=null,truckMoving=false,playing=true}={}){
  this.time+=Math.max(0,dt||0);
  if(!this.enabled||!playing){if(this.ready)for(const channel of ['workshop','drill','truck','office'])this.fade(this[channel].out,0);return;}
  if(!this.ready){try{this.create()}catch{return;}}
  if(!this.ready)return;
  const player=position||s.position||{x:0,z:0};
  const active=!!s.workshop&&s.workshop.status!=='building';
  const workshopGain=active?Math.pow(proximity(player,{x:-7.6,z:-9.3},2,16),1.5):0;
  const officeGain=s.office?.status==='built'?Math.pow(proximity(player,{x:-6,z:0},1,11),1.5):0;
  const drillGain=drilling&&drill?Math.pow(proximity(player,drill.position,3,30),1.4):0;
  const truckGain=truckMoving&&truck?Math.pow(proximity(player,truck.position,3,26),1.4):0;
  this.fade(this.workshop.out,workshopGain*.24);
  this.fade(this.office.out,(s.inside?.055:officeGain*.035));
  this.fade(this.drill.out,drillGain*.54);
  this.fade(this.truck.out,truckGain*.40);
  if(this.workshop.lowOsc)this.workshop.lowOsc.frequency.setTargetAtTime(66+Math.sin(this.time*1.2)*3,this.ctx.currentTime,.18);
  if(this.drill.lowOsc)this.drill.lowOsc.frequency.setTargetAtTime(51+Math.sin(this.time*17)*7,this.ctx.currentTime,.04);
  if(this.truck.lowOsc)this.truck.lowOsc.frequency.setTargetAtTime(67+Math.sin(this.time*3.2)*8,this.ctx.currentTime,.15);
  if(active&&workshopGain>.19&&this.time>this.nextClank){
   this.nextClank=this.time+2.5+Math.random()*3.5;
   this.metalTick(workshopGain);
  }
  if(moving&&!s.inside&&dt>0){
   this.stepDistance+=Math.min(.18,dt*2);
   if(this.stepDistance>=.64){
    this.stepDistance-=.64;
    this.step(walkingSurface(s,player,walkSurfaces),1,this.time);
   }
  }else if(moving&&dt>0){
   this.stepDistance+=Math.min(.18,dt*2);
   if(this.stepDistance>=.65){this.stepDistance-=.65;this.step('concrete',.74,this.time);}
  }else this.stepDistance=0;
 }
 dispose(){
  if(!this.ready)return;
  for(const name of ['workshop','drill','truck','office']){
   const c=this[name];try{c.lowOsc.stop();c.src.stop();c.lowOsc.disconnect();c.src.disconnect();c.out.disconnect()}catch{}
  }
  try{this.master.disconnect()}catch{}
  this.ready=false;this.enabled=false;
 }
}
