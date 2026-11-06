// Review only. Supplies input to the existing controller; never moves a foot/root via animation.
export class LocomotionReview{
 constructor({world,state,avatars,motion,applyMovement,onChange}){Object.assign(this,{world,state,avatars,motion,applyMovement,onChange});this.active=false;}
 async start(id,record=false){const s=this.state();if(s.inside)return;await this.avatars.load(id);this.stopRecording();this.avatars.activate(id);s.character=id;this.onChange(id);s.position={x:1.7,z:8.2};s.facing=Math.PI;Object.assign(this.motion,{vx:0,vz:0,speed:0,yaw:Math.PI});this.world.player.rotation.y=Math.PI;this.world.worker.reset();this.world.playerGround=0;this.stage='idle';this.age=0;this.pass=0;this.active=true;this.distance=0;this.id=id;this.world.renderer.domElement.dataset.reviewStatus='idle';if(record)this.startRecording();}
 step(dt){const s=this.state();this.age+=dt;let z=0;
  if(this.stage==='idle'&&this.age>=2){this.stage='out';this.age=0;}
  if(this.stage==='out'){const d=s.position.z-4.2;z=-Math.min(this.pass? .45:1,Math.max(0,d)/.30);if(d<.025){this.stage='pause';this.age=0;}}
  else if(this.stage==='pause'&&this.age>1){this.stage='back';this.age=0;}
  else if(this.stage==='back'){const d=8.2-s.position.z;z=Math.min(this.pass?.45:1,Math.max(0,d)/.30);if(d<.025){this.stage='settle';this.age=0;}}
  else if(this.stage==='settle'&&this.age>1){if(this.pass===0){this.pass=1;this.stage='idle';this.age=0;}else{this.active=false;this.stage='complete';this.stopRecording();}}
  const before={...s.position},walking=this.applyMovement({x:0,z},dt);this.distance+=Math.hypot(s.position.x-before.x,s.position.z-before.z);this.world.renderer.domElement.dataset.reviewStatus=this.stage+' · '+(this.pass?.45:1)+' · '+this.distance.toFixed(2)+' m';return walking;
 }
 startRecording(){const canvas=this.world.renderer.domElement;if(!canvas.captureStream||!window.MediaRecorder)return;this.chunks=[];const stream=canvas.captureStream(24);this.stream=stream;this.recorder=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm',videoBitsPerSecond:1800000});this.recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};const recordingId=this.id,chunks=this.chunks;this.recorder.onstop=()=>{const blob=new Blob(chunks,{type:'video/webm'});const old=document.querySelector('#qaDownload');old?.remove();const a=document.createElement('a');a.id='qaDownload';a.textContent='Descargar recorrido '+recordingId;a.download='DrillRun_'+recordingId+'_Caminata.webm';a.href=URL.createObjectURL(blob);document.querySelector('#chapterQA').append(a);stream.getTracks().forEach(t=>t.stop());};this.recorder.start();}
 stopRecording(){if(this.recorder?.state==='recording')this.recorder.stop();}
}
