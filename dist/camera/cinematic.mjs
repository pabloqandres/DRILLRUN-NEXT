import {transitionLook} from './transition-look.mjs';
import {INTRO_VARIANTS,SHARED_INTRO_VIDEO} from '../chapter/config.mjs';
export class CinematicDirector{
 constructor({world,host,translate,sound,onComplete,onSound}){Object.assign(this,{world,host,translate,sound,onComplete,onSound});this.video=host.querySelector('video');this.retry=host.querySelector('#playCinematic');this.caption=host.querySelector('#introText');this.sweep=host.querySelector('#digitalSweep');this.backdrop=host.querySelector('.introBackdrop');this.particles=host.querySelector('#digitalParticles');this.glitch=host.querySelector('#digitalGlitch');this.stage='off';this.progress=0;
  this.particles.innerHTML=Array.from({length:24},(_,i)=>`<i style="left:${8+(i*37%86)}%;top:${10+(i*23%75)}%;--drift:${(i%5-2)*12}px"></i>`).join('');
  this.video.onended=()=>{if(this.stage==='video')this.transform();};
  // Keep the approved Avatar 1 film as a safe fallback until every dedicated file is deployed.
  this.video.onerror=()=>{
   if(this.stage!=='video')return;
   const shared=new URL(SHARED_INTRO_VIDEO,new URL('../',import.meta.url)).href;
   if(this.video.src!==shared){
    this.video.src=shared;this.video.load();this.play();
   }else this.transform();
  };
  this.retry.onclick=()=>this.play();
 }
 start(avatar,{orbitOnly=false}={}){this.stop();this.avatar=avatar;const variant=INTRO_VARIANTS[avatar];this.stage=orbitOnly?'orbit':variant?.video?'video':'provisional';this.age=0;this.progress=0;this.host.classList.remove('hidden');this.host.dataset.stage=this.stage;this.caption.textContent=this.stage==='provisional'?this.translate()('provisionalIntro'):'';this.world.cameraRig.startEntrance();this.world.cameraRig.entranceAt(0);this.renderReveal(0);
  if(this.stage==='video'){this.video.hidden=false;this.video.src=new URL(variant.video,new URL('../',import.meta.url)).href;this.video.muted=!this.sound();this.video.volume=this.sound()?1:0;this.play();}else{this.video.style.opacity='0';this.backdrop.style.opacity='0';this.sweep.style.opacity='0';this.particles.style.opacity='0';}
 }
 play(){this.retry.classList.add('hidden');const task=this.video.play();task?.catch(()=>{if(this.stage==='video')this.retry.classList.remove('hidden');});}
 transform(){if(this.stage==='off'||this.stage==='orbit')return;this.stage='transform';this.age=0;this.caption.textContent='';this.retry.classList.add('hidden');this.onSound?.();}
 renderReveal(progress){this.progress=progress;const fx=transitionLook(progress),edge=fx.edge;this.video.style.opacity=String(fx.opacity);this.video.style.maskImage=`linear-gradient(100deg,#000 ${edge-18}%,transparent ${edge+25}%)`;this.video.style.transform=`translateX(${fx.shift}px) scale(${1+Math.abs(fx.shift)*.001})`;this.video.style.filter=`saturate(${fx.saturation}) contrast(${1+fx.glow})`;this.backdrop.style.opacity=String(fx.opacity*.5);this.sweep.style.left=edge+'%';this.sweep.style.opacity=String(fx.glow);this.particles.style.opacity=String(Math.sin(progress*Math.PI)*.45);this.particles.style.setProperty('--progress',String(progress));
  if(this.glitch){this.glitch.style.opacity=String(fx.glitch);this.glitch.style.transform=`translateX(${fx.shift*-2}px)`;const canvas=this.glitch,ctx=canvas.getContext('2d');if(ctx&&this.video.readyState>=2&&fx.glitch>0){canvas.width=this.host.clientWidth||1280;canvas.height=this.host.clientHeight||720;const k=Math.max(canvas.width/this.video.videoWidth,canvas.height/this.video.videoHeight),w=this.video.videoWidth*k,h=this.video.videoHeight*k;ctx.clearRect(0,0,canvas.width,canvas.height);for(const [top,height]of[[.28,.028],[.63,.016],[.78,.009]]){ctx.save();ctx.beginPath();ctx.rect(0,canvas.height*top,canvas.width,Math.max(1,canvas.height*height));ctx.clip();ctx.drawImage(this.video,(canvas.width-w)/2+fx.shift*3,(canvas.height-h)/2,w,h);ctx.restore();}}}
 }
 update(dt){if(this.stage==='off')return;const cfg=this.world.cameraRig.settings.transition;this.host.dataset.stage=this.stage;this.age+=dt;
  if(this.stage==='video'){this.video.muted=!this.sound();const remaining=this.video.duration-this.video.currentTime;this.video.volume=this.sound()&&Number.isFinite(remaining)?Math.min(1,Math.max(0,remaining/.45)):0;if(remaining>0&&remaining<.18)this.transform();return;}
  if(this.stage==='provisional'){if(this.age>=1.4){this.stage='orbit';this.age=0;}return;}
  if(this.stage==='transform'){const p=Math.min(1,this.age/cfg.revealSeconds);this.renderReveal(p);if(p===1){this.releaseVideo();this.stage='orbit';this.age=0;}return;}
  if(this.stage==='orbit'){const p=Math.min(1,this.age/cfg.duration);this.world.cameraRig.entranceAt(p);if(this.age>=cfg.duration+cfg.stabilizeSeconds){this.stage='off';this.host.dataset.stage='off';this.world.cameraRig.finishEntrance();this.host.classList.add('hidden');this.onComplete();}}
 }
 releaseVideo(){this.video.pause();this.video.hidden=true;this.video.removeAttribute('src');this.video.load();this.video.style.opacity='0';this.video.style.transform='';this.backdrop.style.opacity='0';if(this.glitch)this.glitch.style.opacity='0';this.retry.classList.add('hidden');}
 stop(){this.stage='off';this.host.dataset.stage='off';this.releaseVideo();this.host?.classList.add('hidden');this.world.cameraRig.finishEntrance();}
}
