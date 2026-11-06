import {assetDefinition,HSEC_ANCHORS as A,HSEC_SHED_WALLS} from './catalog.mjs';
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const key=p=>`${Math.round(p.x*10)},${Math.round(p.z*10)}`;
export function projection(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return {x:a.x+t*dx,z:a.z+t*dz};}
export const segmentDistance=(p,a,b)=>distance(p,projection(p,a,b));
export function intersection(a,b,c,d){const ax=b.x-a.x,az=b.z-a.z,bx=d.x-c.x,bz=d.z-c.z,det=ax*bz-az*bx;if(Math.abs(det)<1e-7)return null;const t=((c.x-a.x)*bz-(c.z-a.z)*bx)/det,u=((c.x-a.x)*az-(c.z-a.z)*ax)/det;return t>=0&&t<=1&&u>=0&&u<=1?{x:a.x+t*ax,z:a.z+t*az}:null;}
export function footprint(a){const d=assetDefinition(a.type),r=a.rotation||0;return {x:a.x,z:a.z,w:Math.abs(Math.cos(r))*d.w+Math.abs(Math.sin(r))*d.d,d:Math.abs(Math.sin(r))*d.w+Math.abs(Math.cos(r))*d.d};}
export const boxHit=(p,b,r=0)=>Math.abs(p.x-b.x)<b.w/2+r&&Math.abs(p.z-b.z)<b.d/2+r;
export function routeSegments(h,kind){return h.assets.filter(a=>a.type===kind&&a.status==='built'&&a.condition.functional>=20&&a.condition.physical>=20).flatMap(a=>a.points.slice(1).map((p,i)=>({a:a.points[i],b:p,asset:a,weight:distance(a.points[i],p)})));}
export function blockedSegment(h,a,b){const n=Math.max(1,Math.ceil(distance(a,b)/.25));return h.assets.filter(o=>o.status==='built'&&assetDefinition(o.type)?.solid).some(o=>{const boxes=o.type==='shed'?HSEC_SHED_WALLS.map(b=>({...b,x:b.x+o.x,z:b.z+o.z})):[footprint(o)];for(let i=0;i<=n;i++)if(boxes.some(box=>boxHit({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},box,.18)))return true;return false;});}
export function network(h,kind='pedestrian',safe=false,noBlock=false){
 const original=routeSegments(h,kind),nodes=new Map(),adj=new Map(),edges=[],points=original.flatMap(e=>[e.a,e.b]);
 // Merge nearby endpoints across different assets (snap tolerance)
 const endpoints=original.flatMap(e=>[e.a,e.b]);
 for(let i=0;i<endpoints.length;i++)for(let j=i+1;j<endpoints.length;j++){if(distance(endpoints[i],endpoints[j])<.6&&key(endpoints[i])!==key(endpoints[j])){endpoints[j].x=endpoints[i].x;endpoints[j].z=endpoints[i].z;}}
 for(let i=0;i<original.length;i++)for(let j=i+1;j<original.length;j++){const p=intersection(original[i].a,original[i].b,original[j].a,original[j].b);if(p)points.push(p);}
 const unsafe=kind==='pedestrian'&&safe?routeConflicts(h).unsafe:[];
 const add=p=>{const k=key(p);nodes.set(k,p);if(!adj.has(k))adj.set(k,[]);return k;};
 for(const edge of original){const ps=points.filter(p=>segmentDistance(p,edge.a,edge.b)<.08).sort((a,b)=>distance(edge.a,a)-distance(edge.a,b));const unique=ps.filter((p,i)=>!i||key(p)!==key(ps[i-1]));
 for(let i=1;i<unique.length;i++){const a=unique[i-1],b=unique[i];if(distance(a,b)<.08||kind==='pedestrian'&&(!noBlock&&blockedSegment(h,a,b)||unsafe.some(p=>segmentDistance(p,a,b)<.05)))continue;const ka=add(a),kb=add(b),weight=distance(a,b);adj.get(ka).push({to:kb,cost:weight,asset:edge.asset.id});adj.get(kb).push({to:ka,cost:weight,asset:edge.asset.id});edges.push({a,b,weight,asset:edge.asset});}
 }return {nodes,adj,edges};
}
export function shortestPath(h,from,to,kind='pedestrian',safe=false,noBlock=false){
 const g=network(h,kind,safe,noBlock),start=key(from),end=key(to);if(!g.nodes.has(start)||!g.nodes.has(end))return null;
 const costs=new Map([[start,0]]),prev=new Map(),todo=new Set(g.nodes.keys());while(todo.size){let u=null;for(const k of todo)if(u===null||(costs.get(k)??Infinity)<(costs.get(u)??Infinity))u=k;if(!Number.isFinite(costs.get(u)))break;todo.delete(u);if(u===end){const out=[];let p=end;while(p){out.unshift({...g.nodes.get(p)});p=prev.get(p);}return out;}
 for(const e of g.adj.get(u)||[])if(todo.has(e.to)){const cost=costs.get(u)+e.cost;if(cost<(costs.get(e.to)??Infinity)){costs.set(e.to,cost);prev.set(e.to,u);}}
 }return null;
}
export function connectivity(h,kind){
 // Office zone ~(-9..−1), Shed zone ~(2..9)
 const officeZone=p=>p.x>-10&&p.x<0&&p.z>-4&&p.z<6;
 const shedZone=p=>p.x>1&&p.x<11&&p.z>-8&&p.z<3;
 const segs=routeSegments(h,kind);if(!segs.length)return false;
 const allPts=segs.flatMap(e=>[e.a,e.b]);
 const reachesOffice=allPts.some(officeZone)||segs.some(e=>officeZone(e.a)||officeZone(e.b));
 const reachesShed=allPts.some(shedZone)||segs.some(e=>shedZone(e.a)||shedZone(e.b));
 return reachesOffice&&reachesShed;
}
export function routeConflicts(h){const vehicle=routeSegments(h,'vehicle'),ped=routeSegments(h,'pedestrian'),crossings=h.assets.filter(a=>a.type==='crossing'&&a.status==='built'&&a.condition.visual>=40&&a.condition.functional>=40);const unsafe=[];let near=0,protectedCount=0;
 for(const p of ped){for(const v of vehicle){const hit=intersection(p.a,p.b,v.a,v.b);if(hit&&!crossings.some(c=>boxHit(hit,footprint(c),.2)))unsafe.push(hit);
 const samples=3,guards=h.assets.filter(a=>['railing','barrier','fence','bollard'].includes(a.type)&&a.status==='built');const guardReach=(g,pt)=>{const gd=assetDefinition(g.type);return gd.route&&g.points?.length>=2?Math.min(...g.points.slice(1).map((q2,k)=>segmentDistance(pt,g.points[k],q2))):distance(pt,g);};let segNear=0,segProtected=0;
 for(let i=0;i<=samples;i++){const t=i/samples,sp={x:p.a.x+(p.b.x-p.a.x)*t,z:p.a.z+(p.b.z-p.a.z)*t},q=projection(sp,v.a,v.b);if(distance(sp,q)<2.8&&!crossings.some(c=>distance(sp,c)<1.5)){segNear++;const mid={x:(sp.x+q.x)/2,z:(sp.z+q.z)/2};if(p.asset.level>=3||guards.some(a=>guardReach(a,mid)<1.8))segProtected++;}}
 if(segNear>0){near+=segNear;protectedCount+=segProtected;}}}
 return {unsafe,near,protectedCount,safe:!unsafe.length,separated:near===0||protectedCount>=near*.6};
}
export function snapPoint(p,h=null,routeKind=null){
 for(const a of Object.values(A))if(distance(p,a)<1.2)return {...a};
 if(h&&routeKind){let best=null,bd=1.5;for(const a of h.assets){if(a.status!=='built'||!a.points?.length)continue;const d=assetDefinition(a.type);if(!d||d.route!==routeKind)continue;for(const ep of [a.points[0],a.points[a.points.length-1]]){const dd=distance(p,ep);if(dd<bd){bd=dd;best=ep;}}}if(best)return {...best};}
 return {x:Math.round(p.x*2)/2,z:Math.round(p.z*2)/2};
}

export function routeFrom(h,from,to,allowUnsafe=false){
 const configs=allowUnsafe?[[true,false],[false,false],[false,true]]:[[true,false],[true,true]];
 for(const [safe,noBlock] of configs){
  const direct=shortestPath(h,from,to,'pedestrian',safe,noBlock);if(direct)return direct;
  let best=null,cost=Infinity;for(const edge of network(h,'pedestrian',safe,noBlock).edges){const p=projection(from,edge.a,edge.b);if(distance(from,p)>1.5)continue;for(const end of [edge.a,edge.b]){const tail=shortestPath(h,end,to,'pedestrian',safe,noBlock);if(!tail)continue;const route=[p,...tail],length=distance(from,p)+route.slice(1).reduce((n,v,i)=>n+distance(route[i],v),0);if(length<cost){cost=length;best=route;}}}
  if(best)return best;}return null;
}
