// Review-only route planning. Movement and hand actions still use the real controller.
export function reviewPath(start,goal,isBlocked,reach=.45){
 const step=.30,key=(x,z)=>Math.round((x-start.x)/step)+','+Math.round((z-start.z)/step),queue=[{x:start.x,z:start.z,parent:-1}],seen=new Set([key(start.x,start.z)]);let at=0,found=-1;
 while(at<queue.length){const p=queue[at];if(Math.hypot(p.x-goal.x,p.z-goal.z)<reach){found=at;break;}for(const [dx,dz]of[[step,0],[-step,0],[0,step],[0,-step]]){const x=p.x+dx,z=p.z+dz,k=key(x,z);if(seen.has(k)||x< -12.6||x>2.6||z< -5.6||z>8.6||isBlocked(x,z))continue;seen.add(k);queue.push({x,z,parent:at});}at++;}
 if(found<0)return[];const path=[];for(let n=found;n>0;n=queue[n].parent)path.push({x:queue[n].x,z:queue[n].z});return path.reverse();
}
