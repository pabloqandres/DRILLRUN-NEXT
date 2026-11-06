// Metres, local to a 6 x 2.5 m module. Furniture is deliberately a separate layer.
export const OFFICE={width:6,depth:2.5,height:2.6,floor:.42,wallTop:2.90,wall:.10,
 zones:[{id:'work',name:'Oficina',x:0,z:0,w:5.78,d:2.26}],
 doors:[{id:'entry',name:'acceso',hinge:{x:-2.50,z:1.25},width:1.02,axis:0,openAngle:Math.PI/2}]
};
export function doorShape(door,angle=0){
 const a=door.axis-angle,dx=Math.cos(a),dz=Math.sin(a);
 return {id:door.id,x:door.hinge.x+dx*door.width/2,z:door.hinge.z+dz*door.width/2,w:door.width,d:.065,angle:a};
}
// Circle / oriented rectangle. Rounded corners avoid the invisible square buffer of inflated AABBs.
export function circleHitsRect(x,z,r,c){
 const a=c.angle||0,cos=Math.cos(a),sin=Math.sin(a),dx=x-c.x,dz=z-c.z;
 const u=dx*cos+dz*sin,v=-dx*sin+dz*cos;
 const qx=Math.max(Math.abs(u)-c.w/2,0),qz=Math.max(Math.abs(v)-c.d/2,0);
 return qx*qx+qz*qz<r*r;
}
export const OFFICE_WALLS=[
 {id:'front-left',x:-2.77,z:1.21,w:.46,d:.10},
 {id:'front-right',x:.75,z:1.21,w:4.46,d:.10},
 {id:'back',x:0,z:-1.21,w:6,d:.10},
 {id:'west',x:-2.95,z:0,w:.10,d:2.5},
 {id:'east',x:2.95,z:0,w:.10,d:2.5},
 {id:'entry-rail-left',x:-2.64,z:1.96,w:.055,d:1.40},
 {id:'entry-rail-right',x:-1.32,z:1.96,w:.055,d:1.40},
 {id:'ac',x:-3.31,z:-.42,w:.62,d:.90}
];
export function officeBlocked(x,z,r,doorAngles={}){
 return OFFICE_WALLS.some(c=>circleHitsRect(x,z,r,c))||OFFICE.doors.some(d=>circleHitsRect(x,z,r,doorShape(d,doorAngles[d.id]||0)));
}
export function insideOffice(x,z){return x>-2.91&&x<2.91&&z>-1.16&&z<1.16;}
export function officeGround(x,z){
 if(Math.abs(x)<2.98&&Math.abs(z)<1.26)return OFFICE.floor;
 if(x>-2.61&&x<-1.35){
  if(z>=1.25&&z<1.77)return .42;
  if(z>=1.77&&z<2.08)return .32;
  if(z>=2.08&&z<2.39)return .22;
  if(z>=2.39&&z<2.64)return .12;
 }
 return 0;
}
