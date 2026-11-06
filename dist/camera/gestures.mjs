// A pointer gesture belongs to the surface on which it starts. UI pointers never enter this map.
export function installWorldGestures(canvas,{canLook,onLook,onTap,onZoom,onEnd=()=>{},dragAnywhere=()=>false}){
 const pointers=new Map();let pinch=false,lastDistance=0,blocked=false;canvas.style.touchAction='none';
 const separation=()=>{const[a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
 canvas.onpointerdown=e=>{if(e.button>0||!canLook())return;const r=canvas.getBoundingClientRect();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,look:dragAnywhere()||e.clientX>=r.left+r.width*.48,dragged:false});canvas.setPointerCapture(e.pointerId);if(pointers.size===2){pinch=true;lastDistance=separation();for(const p of pointers.values())p.dragged=true;}if(pointers.size>2)blocked=true;};
 canvas.onpointermove=e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(!canLook()){p.dragged=true;return;}if(blocked)return;if(pointers.size===2){const d=separation();if(lastDistance>4&&d>4)onZoom(Math.log(d/lastDistance));lastDistance=d;e.preventDefault();return;}if(pinch)return;if(Math.hypot(p.x-p.startX,p.y-p.startY)>=8)p.dragged=true;if(p.dragged&&p.look){onLook(dx,dy);e.preventDefault();}};
 const finish=(e,cancelled=false)=>{const p=pointers.get(e.pointerId);if(!p)return;const tap=!cancelled&&!pinch&&!blocked&&!p.dragged&&canLook();pointers.delete(e.pointerId);if(tap)onTap(e.clientX,e.clientY);if(!pointers.size){pinch=false;blocked=false;lastDistance=0;onEnd();}};
 canvas.onpointerup=e=>finish(e);canvas.onpointercancel=canvas.onlostpointercapture=e=>finish(e,true);
 return{cancel(){pointers.clear();pinch=false;blocked=false;lastDistance=0;}};
}
