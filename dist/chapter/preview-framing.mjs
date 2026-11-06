import * as T from '../vendor/three.module.js';

// Fit every corner, including stairs and AC, rather than assuming a 6 × 2.5 m box.
export function fitPreviewCamera(camera,bounds,aspect,angle=.65,padding=1.16){
 const center=bounds.getCenter(new T.Vector3()),direction=new T.Vector3(Math.sin(angle),.53,Math.cos(angle)).normalize();
 const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize(),up=new T.Vector3().crossVectors(direction,right);
 const tangent=Math.tan(camera.fov*Math.PI/360);let distance=.5;
 for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){
  const p=new T.Vector3(x,y,z).sub(center),depth=p.dot(direction);
  distance=Math.max(distance,depth+padding*Math.abs(p.dot(right))/(tangent*aspect),depth+padding*Math.abs(p.dot(up))/tangent);
 }
 camera.aspect=aspect;camera.near=.02;camera.far=Math.max(40,distance*4);camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 return {center,distance};
}
