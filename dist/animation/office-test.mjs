// Review-only controls (?officeqa=1). Each input still runs through the live movement controller.
export function installOfficeTest({world,state,motion,setInspect,resetJoy}){
 const panel=document.createElement('section');panel.id='officeValidation';panel.style.cssText='position:absolute;left:16px;top:128px;width:190px;padding:12px;background:#142b3ced;color:#eef1de;border:1px solid #ffffff35;border-radius:7px;font:11px/1.6 Arial;z-index:12';
 panel.innerHTML='<b>PRUEBA · CIRCULACIÓN</b><div id="officeTestStatus">Oficina abierta y límites físicos.</div><button id="runOfficeTest" style="padding:8px;min-height:40px">Probar oficina</button><button id="runBoundaryTest" style="padding:8px;min-height:40px">Probar barandas</button>';document.body.append(panel);
 const label=panel.querySelector('#officeTestStatus'),buttons=[...panel.querySelectorAll('button')],api=world.office.userData.api,origin=world.office.position;
 let active=false,mode='office',phase=0,time=0,results=[];
 const barrierCases=[
  {name:'baranda derecha',start:{x:10.8,z:-4.6},input:{x:-1,z:0},axis:'x',boundary:10.275,side:1},
  {name:'baranda posterior',start:{x:6,z:-9.4},input:{x:0,z:1},axis:'z',boundary:-8.725,side:-1},
  {name:'cono',start:{x:2.9,z:.7},input:{x:0,z:-1},axis:'z',boundary:-.745,side:1},
  {name:'acceso frontal libre',start:{x:6,z:.3},input:{x:0,z:-1},duration:1,open:true},
  {name:'baranda izquierda',start:{x:1.2,z:-4.6},input:{x:1,z:0},axis:'x',boundary:1.725,side:-1}
 ];
 function place(p,yaw=0){state.position={...p};motion.vx=motion.vz=0;motion.yaw=yaw;world.worker.reset();}
 function next(){phase++;time=0;}
 function end(){active=false;buttons.forEach(b=>b.disabled=false);panel.dataset.results=JSON.stringify(results);label.textContent=results.every(r=>r.pass)?'✓ '+(mode==='office'?'Oficina libre y acceso comprobados.':'Barandas y cono bloquean; acceso libre.'):'Revisar: '+JSON.stringify(results);}
 function start(which){setInspect(false);resetJoy();mode=which;phase=0;time=0;results=[];panel.removeAttribute('data-results');active=true;buttons.forEach(b=>b.disabled=true);if(mode==='office'){api.opened.entry=false;place({x:origin.x-1.99,z:3.05},Math.PI);}else{const c=barrierCases[0];place(c.start,Math.atan2(c.input.x,c.input.z));}}
 buttons[0].onclick=()=>start('office');buttons[1].onclick=()=>start('barrier');
 function to(x,z){const dx=origin.x+x-state.position.x,dz=z-state.position.z,len=Math.hypot(dx,dz);if(len<.065){next();return {x:0,z:0};}if(time>16){results.push({test:'ruta',pass:false,phase});end();return {x:0,z:0};}return{x:dx/len*Math.min(1,len/.25),z:dz/len*Math.min(1,len/.25)};}
 return {get active(){return active;},input(dt){if(!active)return null;time+=dt;
  if(mode==='barrier'){
   const c=barrierCases[phase];label.textContent=(phase+1)+' · '+c.name;
   if(time>(c.duration||2)){
    const p={...state.position},gap=(p[c.axis]-c.boundary)*c.side,pass=c.open?p.z<-.85&&p.z>-2.17:gap>=-.0001&&gap<2*.08+.0001&&motion.speed<.005;
    results.push({test:c.name,pass,position:p,speed:motion.speed});next();if(phase>=barrierCases.length){end();return {x:0,z:0};}const n=barrierCases[phase];place(n.start,Math.atan2(n.input.x,n.input.z));return {x:0,z:0};
   }return c.input;
  }
  const p={x:state.position.x-origin.x,z:state.position.z-origin.z};
  if(phase===0){label.textContent='1 · Acceso cerrado';if(time>1.8){results.push({test:'entry-closed',pass:p.z>=1.6124&&p.z<1.6125+2*.08&&motion.speed<.005,z:p.z});next();}return {x:0,z:-1};}
  if(phase===1){label.textContent='2 · Abrir acceso';if(!api.opened.entry)api.toggle('entry',p.x,p.z);if(time>1)next();return{x:0,z:0};}
  const route=[[-1.99,.65],[-1.99,-.60],[2.30,-.60],[2.30,.65]];
  if(phase<6){label.textContent='3 · Recorrer toda la oficina sin divisiones';return to(...route[phase-2]);}
  if(time>1){results.push({test:'open-plan',pass:p.x>2&&p.z>.4,position:p});end();}return{x:0,z:0};
 }};
}
