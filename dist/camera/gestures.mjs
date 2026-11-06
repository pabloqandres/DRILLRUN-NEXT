// A pointer gesture belongs to the surface on which it starts. UI pointers never enter this map.
export function installWorldGestures(canvas,{canLook,onLook,onTap,onZoom,onEnd=()=>{},dragAnywhere=()=>false}){
 const pointers=new Map();let pinch=false,lastDistance=0,blocked=false;canvas.style.touchAction='none';
 const separation=()=>{const[a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
 canvas.onpointerdown=e=>{if(e.button>0||!canLook())return;const r=canvas.getBoundingClientRect();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,look:dragAnywhere()||e.clientX>=r.left+r.width*.48,dragged:false});canvas.setPointerCapture(e.pointerId);if(pointers.size===2){pinch=true;lastDistance=separation();for(const p of pointers.values())p.dragged=true;}if(pointers.size>2)blocked=true;};
 canvas.onpointermove=e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(!canLook()){p.dragged=true;return;}if(blocked)return;if(pointers.size===2){const d=separation();if(lastDistance>4&&d>4)onZoom(Math.log(d/lastDistance));lastDistance=d;e.preventDefault();return;}if(pinch)return;if(Math.hypot(p.x-p.startX,p.y-p.startY)>=8)p.dragged=true;if(p.dragged&&p.look){onLook(dx,dy);e.preventDefault();}};
 const finish=(e,cancelled=false)=>{const p=pointers.get(e.pointerId);if(!p)return;const tap=!cancelled&&!pinch&&!blocked&&!p.dragged&&canLook();pointers.delete(e.pointerId);if(tap)onTap(e.clientX,e.clientY);if(!pointers.size){pinch=false;blocked=false;lastDistance=0;onEnd();}};
 canvas.onpointerup=e=>finish(e);canvas.onpointercancel=canvas.onlostpointercapture=e=>finish(e,true);
 // Desktop scroll wheel and trackpad pinch dispatch wheel events rather than
 // pointer gestures. Positive deltaY zooms out, negative zooms in.
 canvas.addEventListener('wheel',e=>{
  if(!canLook())return;
  e.preventDefault(); // Avoid scrolling/zooming the page while using the game canvas.
  const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight||600:1);
  const bounded=Math.max(-240,Math.min(240,pixels));
  if(Math.abs(bounded)<.01)return;
  onZoom(-bounded*.0017);
  onEnd(); // Persist chosen camera zoom in the existing camera preferences.
 },{passive:false});
 return{cancel(){pointers.clear();pinch=false;blocked=false;lastDistance=0;}};
}
