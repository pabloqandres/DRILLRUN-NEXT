export const WALK_SPEED=2.0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function angleDelta(a,b){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
export function createMotion(){return {vx:0,vz:0,yaw:0,speed:0,distance:0};}
// The controller is the only source of root displacement. Animation consumes its measured result.
export function moveController(position,motion,intent,dt,blocked){
 dt=Math.min(.08,Math.max(0,dt));const norm=Math.hypot(intent.x,intent.z),mag=Math.min(1,norm);const dead=mag<.05;let tx=0,tz=0;if(!dead){tx=intent.x/Math.max(norm,1)*WALK_SPEED;tz=intent.z/Math.max(norm,1)*WALK_SPEED;}
 if(motion.turnBeforeMove&&!dead){const desired=Math.atan2(intent.x,intent.z),alignment=Math.max(0,Math.cos(angleDelta(motion.yaw,desired)));tx*=alignment*alignment;tz*=alignment*alignment;}
 const rate=dead?22:8,blend=1-Math.exp(-rate*dt);motion.vx+=(tx-motion.vx)*blend;motion.vz+=(tz-motion.vz)*blend;if(dead&&Math.hypot(motion.vx,motion.vz)<.04){motion.vx=motion.vz=0;}
 const oldx=position.x,oldz=position.z;let x=oldx+motion.vx*dt,z=oldz+motion.vz*dt;
 if(!blocked(x,oldz))position.x=x;else motion.vx=0;if(!blocked(position.x,z))position.z=z;else motion.vz=0;
 const dx=position.x-oldx,dz=position.z-oldz,distance=Math.hypot(dx,dz);motion.speed=dt?distance/dt:0;motion.distance+=distance;
 if(mag>.025){const yaw=Math.atan2(intent.x,intent.z);motion.yaw+=clamp(angleDelta(motion.yaw,yaw),-5.0*dt,5.0*dt);}
 return {dx,dz,distance,speed:motion.speed,yaw:motion.yaw};
}
// Exact two-link solution used by the feet; forward is projected onto the knee-bend plane.
export function solveLeg(hip,ankle,l1,l2,forward){
 const dx=ankle.x-hip.x,dy=ankle.y-hip.y,dz=ankle.z-hip.z,raw=Math.hypot(dx,dy,dz),d=clamp(raw,.03,l1+l2-.003),ux=dx/(raw||1),uy=dy/(raw||1),uz=dz/(raw||1);
 const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));const dot=forward.x*ux+forward.y*uy+forward.z*uz;let bx=forward.x-ux*dot,by=forward.y-uy*dot,bz=forward.z-uz*dot,bl=Math.hypot(bx,by,bz);if(bl<.00001){bx=0;by=0;bz=1;bl=1;}return {knee:{x:hip.x+ux*along+bx/bl*height,y:hip.y+uy*along+by/bl*height,z:hip.z+uz*along+bz/bl*height},clamped:raw>d+.0001,error:Math.max(0,raw-d)};
}
