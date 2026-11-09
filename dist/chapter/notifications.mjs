import {icon} from './icons.mjs';
export class NotificationSystem{
 constructor(host){this.host=host;this.queue=[];this.active=null;this.seen=new Set();host.classList.add('notification');host.setAttribute('role','status');host.setAttribute('aria-live','polite');}
 push({id,title,detail='',symbol='bell',action}){if(id&&this.seen.has(id))return;if(id)this.seen.add(id);this.queue.push({title,detail,symbol,action});this.next();}
 next(){if(this.active||!this.queue.length)return;this.active=this.queue.shift();const n=this.active;this.host.innerHTML=`<span class="notificationIcon">${icon(n.symbol)}</span><span><b></b><small></small></span><span class="notificationArrow">${icon('arrow')}</span>`;this.host.querySelector('b').textContent=n.title;this.host.querySelector('small').textContent=n.detail;this.host.querySelector('.notificationArrow').hidden=typeof n.action!=='function';this.host.classList.remove('hidden');this.host.onclick=()=>{try{if(typeof n.action==='function')n.action();}catch(error){console.warn('[Notifications] action failed:',error);}finally{this.dismiss();}};clearTimeout(this.timer);this.timer=setTimeout(()=>this.dismiss(),3600);}
 dismiss(){this.host.classList.add('hidden');this.active=null;this.next();}
 clear(){this.queue=[];clearTimeout(this.timer);this.active=null;this.host.classList.add('hidden');this.host.onclick=null;}
}
