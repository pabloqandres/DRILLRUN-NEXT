const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createOrbit(){return{yaw:0,pitch:0,manual:false};}
export function resetOrbit(orbit){Object.assign(orbit,createOrbit());}
export function rotateOrbit(orbit,dx,dy){orbit.yaw=Math.atan2(Math.sin(orbit.yaw-dx*.005),Math.cos(orbit.yaw-dx*.005));orbit.pitch=clamp(orbit.pitch+dy*.003,-.18,.36);orbit.manual=true;}
export function orbitOffset(base,orbit){const radius=Math.hypot(base.x,base.y,base.z),elevation=Math.atan2(base.y,Math.hypot(base.x,base.z))+orbit.pitch,heading=Math.atan2(base.x,base.z)+orbit.yaw,h=radius*Math.cos(elevation);return{x:Math.sin(heading)*h,y:Math.sin(elevation)*radius,z:Math.cos(heading)*h};}
export function cameraRelativeIntent(x,z,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);return{x:x*c+z*s,z:-x*s+z*c};}
// Only pointers beginning on the canvas's right half can orbit. UI buttons and the left joystick own their pointers.
export function installCameraDrag(canvas,{canLook,onLook,onTap}){
 let touch=null;canvas.style.touchAction='none';
 canvas.onpointerdown=e=>{if(touch||e.button>0)return;const r=canvas.getBoundingClientRect();touch={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,look:canLook()&&e.clientX>=r.left+r.width*.48,dragging:false};canvas.setPointerCapture(e.pointerId);};
 canvas.onpointermove=e=>{if(!touch||e.pointerId!==touch.id)return;const distance=Math.hypot(e.clientX-touch.x,e.clientY-touch.y);if(distance>=8)touch.dragging=true;if(touch.dragging&&touch.look){onLook(e.clientX-touch.lastX,e.clientY-touch.lastY);e.preventDefault();}touch.lastX=e.clientX;touch.lastY=e.clientY;};
 canvas.onpointerup=e=>{if(!touch||e.pointerId!==touch.id)return;const was=touch;touch=null;if(!was.dragging&&Math.hypot(e.clientX-was.x,e.clientY-was.y)<8)onTap(e.clientX,e.clientY);};
 canvas.onpointercancel=canvas.onlostpointercapture=e=>{if(touch?.id===e.pointerId)touch=null;};
 return{cancel(){touch=null;}};
}
