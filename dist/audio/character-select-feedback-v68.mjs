// V70 · Audible but restrained tactile feedback for the character creator.
// Original procedural Web Audio only, ~2.5× V68 amplitude; no samples or dependencies.
// Uses an existing AudioContext and the user's current sound preference.
export class CharacterSelectFeedback{
 constructor({context,enabled=()=>true,haptics=()=>true}={}){
  this.context=context;this.enabled=enabled;this.haptics=haptics;
  this.last=Object.create(null);this.noise=null;this.noiseRate=0;
 }
 pulse(milliseconds){
  if(!this.haptics()||typeof navigator==='undefined'||!navigator.vibrate)return;
  try{navigator.vibrate(milliseconds);}catch{}
 }
 noiseBuffer(ctx){
  if(this.noise&&this.noiseRate===ctx.sampleRate)return this.noise;
  const count=Math.floor(ctx.sampleRate*.21),buffer=ctx.createBuffer(1,count,ctx.sampleRate);
  const data=buffer.getChannelData(0);let n=79431;
  for(let i=0;i<count;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;data[i]=n/2147483648-1;}
  this.noise=buffer;this.noiseRate=ctx.sampleRate;return buffer;
 }
 tone(ctx,{frequency=500,end=310,duration=.085,level=.024}={}){
  const t=ctx.currentTime+.003;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
  oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,t);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(65,end),t+duration);
  filter.type='lowpass';filter.frequency.value=1850;
  gain.gain.setValueAtTime(.00001,t);
  gain.gain.exponentialRampToValueAtTime(Math.min(.055,Math.max(.00001,level)),t+.011);
  gain.gain.exponentialRampToValueAtTime(.00001,t+duration);
  oscillator.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
  oscillator.start(t);oscillator.stop(t+duration+.003);
  oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect();};
 }
 whoosh(ctx){
  const t=ctx.currentTime+.003,source=ctx.createBufferSource();
  const filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=this.noiseBuffer(ctx);
  filter.type='bandpass';filter.Q.value=.44;
  filter.frequency.setValueAtTime(480,t);
  filter.frequency.exponentialRampToValueAtTime(1460,t+.12);
  gain.gain.setValueAtTime(.00001,t);
  gain.gain.exponentialRampToValueAtTime(.023,t+.035);
  gain.gain.exponentialRampToValueAtTime(.00001,t+.155);
  source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
  source.start(t);source.stop(t+.16);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 play(kind){
  if(kind==='select')this.pulse(8);
  if(kind==='confirm')this.pulse(12);
  if(!this.enabled())return;
  const now=typeof performance!=='undefined'?performance.now():Date.now();
  const interval=kind==='type'?95:kind==='select'?160:70;
  if(now-(this.last[kind]??-Infinity)<interval)return;
  this.last[kind]=now;
  try{
   const ctx=this.context?.();
   if(!ctx)return;
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   if(kind==='select'){this.whoosh(ctx);this.tone(ctx,{frequency:590,end:390,duration:.09,level:.028});}
   else if(kind==='skill'){this.tone(ctx,{frequency:620,end:430,duration:.072,level:.023});}
   else if(kind==='confirm'){this.tone(ctx,{frequency:370,end:260,duration:.12,level:.039});}
   else if(kind==='type'){this.tone(ctx,{frequency:650,end:530,duration:.032,level:.0148});}
   else if(kind==='focus'){this.tone(ctx,{frequency:570,end:500,duration:.055,level:.006});}
   else this.tone(ctx,{frequency:410,end:315,duration:.058,level:.018});
  }catch{}
 }
}
