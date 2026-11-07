import {CONFIG,PRODUCTS,CATEGORIES} from './config.mjs';
import {availableMessages,unreadMessages,readMessage} from './ui-state.mjs';
import {landReady,objective} from './state.mjs';
import {ProductPreview,rcDrillThumbnail} from './product-preview.mjs';
import {drillTruckImage} from './drilltruck-image.mjs';
import {icon,workerAvatar} from './icons.mjs';
import {isM3App,m3HomeApps,renderM3App} from '../mission3/phone-apps.mjs';
import {isM4App,m4HomeApps,renderM4App} from '../mission4/phone-apps.mjs';
import {renderContactList,renderConversation,NarrativeTyping} from './narrative-ui.mjs';
import {markCharacterRead,narrativeUnread} from './narrative.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categoryIcon={desks:'desk',chairs:'chair',computers:'computer',lighting:'light',storage:'storage',decoration:'decoration',finishes:'finishes'};
export class PhoneUI{
 constructor(options){Object.assign(this,options);this.category='desks';this.selected='desk';this.variants={};this.conversation=false;this.narrativeCharacter=null;this._typing=null;this.rigArtCache=new Map();}
 release(){if(this.preview)this.previewAngle=this.preview.angle;this.preview?.dispose();this.preview=null;this._disposeTyping();}
 render(app){
  this.release();const s=this.state(),t=this.translate(),c=this.content,fmt=this.format;this.app=app;
  this.shell.classList.toggle('storeMode',app==='store');this.shell.dataset.app=app;
  this.title.textContent=app==='home'?'FIELD / 01':t(app);this.back.style.visibility=app==='home'?'hidden':'visible';
  c.className=app==='store'?'catalogContent':'appContent';
  if(app==='home'){
   const name=s.playerName||t('operatorName'),count=unreadMessages(s).length+narrativeUnread(s);
   
   c.innerHTML=`<div class="phoneGreeting"><span class="eyebrow">${esc(t('fieldNetwork'))}</span><b>${esc(name)}</b><small>${esc(t('operator'))}</small></div><div class="apps">${['messages'].map(a=>`<button data-app="${a}"><span class="appTile app-${a}">${icon(a)}${count?`<i class="appBadge">${count}</i>`:''}</span><span>${esc(t(a))}</span></button>`).join('')}${m3HomeApps(s,t,icon)}${m4HomeApps(s,t,icon)}</div><div class="phoneFooter">DRILL RUN <span>·</span> ${esc(t('firstSteps'))}</div>`;
  }else if(app==='messages')this.renderMessages(s,t);
  else if(app==='bank'){
   s.bankViewed=true;this.onSave();c.innerHTML=`<div class="bankCard"><div class="bankBrand">${icon('bank')}<span>DR / BANK</span></div><small>${esc(t('bankAccount'))}</small><b>${fmt(s.bank)}</b><div class="bankWallet"><span>${esc(t('wallet'))}</span><strong>${fmt(s.cash)}</strong></div></div><div class="sectionHeading">${esc(t('bankTransfer'))}</div><label class="bankInput">${esc(t('amount'))}<input id="bankAmount" type="number" min="1" step="1" value="2500" inputmode="numeric"></label><div class="bankActions"><button class="primary" data-transfer="withdraw">${esc(t('withdraw'))}</button><button data-transfer="deposit">${esc(t('deposit'))}</button></div><small>${esc(t('bankNote'))}</small><div class="sectionHeading">${esc(t('operations'))}</div><ul class="transactions">${[...s.ledger].reverse().map(o=>`<li><span class="transactionIcon">${icon(o.key==='capital'?'bank':o.key==='withdraw'?'arrow':o.key==='deposit'?'bank':'store')}</span><span>${esc(t(o.key))}<small>${new Date(o.at).toLocaleTimeString(s.lang,{hour:'2-digit',minute:'2-digit'})}</small></span><b>${fmt(o.amount)}</b></li>`).join('')}</ul>`;
   c.querySelectorAll('[data-transfer]').forEach(b=>b.onclick=()=>this.onTransfer(b.dataset.transfer,Number(c.querySelector('#bankAmount').value)));
  }else if(app==='store')this.renderStore(s,t);
  else if(app==='inventory'){
   c.innerHTML=`<div class="inventorySummary">${icon('inventory')}<span><b>${s.inventory.length}</b> ${esc(t('inventory'))}</span></div>${[false,true].map(installed=>{const items=s.inventory.filter(item=>s.furniture.some(f=>f.id===item.id)===installed);return `<div class="sectionHeading">${esc(t(installed?'installedItems':'availableItems'))}<span>${items.length}</span></div>${items.map(item=>{const p=PRODUCTS.find(p=>p.id===item.product),v=p.variants.find(v=>v.id===item.variant)||p.variants[0];return `<article class="inventoryCard"><span class="inventoryIcon">${icon(item.product)}</span><div><b>${esc(t(item.product))}</b><small>${esc(t(v.nameKey))} · ${esc(t('quantity'))} 1</small><span class="itemStatus ${installed?'isInstalled':''}">${icon(installed?'check':'inventory')}${esc(t(installed?'installed':'owned'))}</span></div><button data-place="${item.id}">${icon(installed?'rotate':'arrow')}<span>${esc(t(installed?'relocate':'place'))}</span></button></article>`;}).join('')}`;}).join('')}${!s.inventory.length?`<div class="emptyState">${icon('inventory')}<p>${esc(t('emptyInventory'))}</p></div>`:''}`;
  }else if(app==='objectives'){
   const entries=[['clear',landReady(s)],['build',s.office.status==='built'],['equip',!!s.chapterCompletedAt]];
   c.innerHTML=`<div class="missionHeading"><span class="eyebrow">${esc(t('chapter'))}</span><h3>${esc(t('firstSteps'))}</h3></div><div class="steps">${entries.map(([key,done],i)=>`<div class="${done?'done':objective(s)===key?'active':''}"><span class="stepNumber">${done?icon('check'):String(i+1).padStart(2,'0')}</span><span><b>${esc(t(key))}</b><small>${esc(t(done?'completed':key+'Detail'))}</small></span></div>`).join('')}</div><p class="missionDetail">${esc(t(objective(s)+'Detail'))}</p>`;
  }else if(isM3App(app)){
   this.title.textContent=app.replace('m3-','').replace(/^\w/,c=>c.toUpperCase());this.back.style.visibility='visible';
   c.className='appContent';c.innerHTML=renderM3App(app,s,t,fmt,icon,{onSave:this.onSave,onNavigate:this.onNavigate});
  }else if(isM4App(app)){
   this.title.textContent=app.replace('m4-','').replace(/^\w/,c=>c.toUpperCase());this.back.style.visibility='visible';
   c.className='appContent';c.innerHTML=renderM4App(app,s,t,fmt,icon,{onSave:this.onSave,onNavigate:this.onNavigate});
  }
  // The M4 DrillTruck technical/management view shares the exact same cached
  // GLB image as the Vehicles catalog card and inline technical sheet.
  // It has no effect on purchase, assigned zones, progression or saved data.
  if(app==='m4-drilltruck'){
   const stage=c.querySelector('[data-drilltruck-asset] .drillTruckHeroStage');
   if(stage)drillTruckImage(this.getWorld()).then(src=>{
    if(this.app!=='m4-drilltruck'||!stage.isConnected)return;
    const img=document.createElement('img');
    img.src=src;img.alt='DrillTruck: imagen real del modelo 3D instalado en el juego';
    img.decoding='async';stage.replaceChildren(img);
    stage.removeAttribute('data-real-asset-loading');
   }).catch(error=>{
    console.error('[DrillTruck] no se pudo generar la imagen del GLB:',error);
    if(stage.isConnected)stage.textContent='NO SE PUDO CARGAR EL MODELO 3D';
   });
  }
  // Only actual non-DRILLCO rig models are previewed here. Consumables await
  // user-supplied official DRILLCO® GLBs, never a fabricated product rendering.
  if(app==='m3-catalog'){
   for(const slot of c.querySelectorAll('[data-rc-rig]')){
    const id=slot.dataset.rcRig;
    if(!this.rigArtCache.has(id)){
     try{this.rigArtCache.set(id,rcDrillThumbnail(this.getWorld(),id));}
     catch(err){console.warn('[Catalog] Real RC rig thumbnail unavailable:',err);this.rigArtCache.set(id,null);}
    }
    const src=this.rigArtCache.get(id);
    if(src){const img=document.createElement('img');img.src=src;img.alt='Vista 3D de perforadora';img.loading='lazy';slot.replaceChildren(img);}
   }
  }
  // DTH supply is retained under Casa Matriz instead of occupying a duplicate phone home icon.
  if(app==='m3-catalog'&&s.mission4&&s.mission4.phase!=='inactive'){
   const link=document.createElement('button');link.className='primary';link.dataset.app='m4-dth-catalog';link.textContent=s.lang==='en'?'DTH equipment and consumables':'Equipos y consumibles DTH';
   link.style.margin='12px 16px';c.appendChild(link);
  }
  c.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>{if(b.dataset.app==='messages')this.conversation=false;this.onNavigate(b.dataset.app);});
  c.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>this.onPlace(b.dataset.place));
  // M3 action bindings
  c.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('hire',b.dataset.hire);});
  c.querySelectorAll('[data-buy-drill]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('buyDrill',b.dataset.buyDrill);});
  c.querySelectorAll('[data-accept-contract]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('acceptContract',b.dataset.acceptContract);});
  c.querySelectorAll('[data-complete-contract]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('completeContract');});
  c.querySelectorAll('[data-start-drilling]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('startDrilling');});
  c.querySelectorAll('[data-request-geo]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('requestGeo');});
  c.querySelectorAll('[data-accelerate-geo]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('accelerateGeo');});
  c.querySelectorAll('[data-add-cart]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('addToCart',b.dataset.addCart);});
  c.querySelectorAll('[data-install-tool]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('installTool',b.dataset.installTool);});
  c.querySelectorAll('[data-upgrade-workshop]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('upgradeWorkshop');});
  c.querySelectorAll('[data-locate-machinery]').forEach(b=>b.onclick=()=>{if(this.onM3Action)this.onM3Action('locateMachinery',b.dataset.locateMachinery);});
  // M4 action bindings
  c.querySelectorAll('[data-m4-action]').forEach(b=>b.onclick=()=>{if(this.onM4Action)this.onM4Action(b.dataset.m4Action,b.dataset.zone||b.dataset.bh||b.dataset.drill||b.dataset.tool||b.dataset.model||null);});
  c.querySelector('#understoodMessage')?.addEventListener('click',this.onClose);c.scrollTop=0;this.onHUD();
 }
 renderMessages(s,t){
  const c=this.content;this._disposeTyping();
  if(!this.conversation){
   // Contact list — narrative characters + legacy mentor
   const narrativeHtml=renderContactList(s,t,icon);
   const legacyMsgs=availableMessages(s),legacyCount=unreadMessages(s).length,last=legacyMsgs.at(-1);
   const mentorCard=legacyMsgs.length?`<button class="conversationCard" id="mentorConversation"><span class="senderAvatar">${icon('messages')}</span><span><b>${esc(t(CONFIG.mentor.nameKey))}</b><small>${esc(t(last.id==='welcome'?'welcomePreview':'storePreview'))}</small><em>${esc(t(legacyCount?'unread':'read'))}</em></span>${legacyCount?`<i class="unreadDot">${legacyCount}</i>`:icon('check')}</button>`:'';
   c.innerHTML=narrativeHtml+mentorCard;
   // Bind narrative character cards
   c.querySelectorAll('[data-narrative-char]').forEach(b=>b.onclick=()=>{this.narrativeCharacter=b.dataset.narrativeChar;this.conversation=true;this.render('messages');});
   if(c.querySelector('#mentorConversation'))c.querySelector('#mentorConversation').onclick=()=>{this.narrativeCharacter=null;this.conversation=true;this.render('messages');};
   return;
  }
  // Conversation thread
  if(this.narrativeCharacter){
   markCharacterRead(s,this.narrativeCharacter);this.onSave();
   c.innerHTML=renderConversation(s,this.narrativeCharacter,t,icon,s.playerName);
   // Bind narrative action buttons
   c.querySelectorAll('[data-narrative-accept]').forEach(b=>b.onclick=()=>{if(this.onNarrativeAction)this.onNarrativeAction('accept',b.dataset.narrativeAccept);});
   c.querySelectorAll('[data-narrative-collect]').forEach(b=>b.onclick=()=>{if(this.onNarrativeAction)this.onNarrativeAction('collect',b.dataset.narrativeCollect);});
   // Start typing animation on last unread bubble
   const typingTarget=c.querySelector('.narrativeTypingTarget .narrativeBody');
   if(typingTarget){
    const bubble=typingTarget.closest('.narrativeBubble');
    const msgId=bubble?.dataset.msgId;
    const msg=s.narrative?.messages?.find(m=>m.id===msgId);
    if(msg){
     const body=t(msg.bodyKey)||msg.bodyKey;
     const resolved=body.replace(/\{name\}/g,esc(s.playerName||'Operador'));
     this._typing=new NarrativeTyping(typingTarget,resolved,()=>{
      if(msg&&!msg.readAt){msg.readAt=Date.now();this.onSave();}
     });
    }
   }
  }else{
   // Legacy mentor conversation
   const messages=availableMessages(s);messages.forEach(m=>readMessage(s,m.id));this.onSave();
   c.innerHTML=`<div class="conversationHeader"><span class="senderAvatar">${icon('messages')}</span><span><b>${esc(t(CONFIG.mentor.nameKey))}</b><small>${esc(t('conversation'))}</small></span></div><div class="messageThread">${messages.map(m=>`<div class="message"><small>${esc(t(m.id==='welcome'?'welcomePreview':'storePreview'))}</small><p>${esc(t(m.bodyKey))}</p><span class="readState">${icon('check')} ${esc(t('read'))}</span></div>`).join('')}</div><button class="primary messageCTA" id="understoodMessage">${icon('check')}${esc(t('understood'))}</button>`;
  }
 }
 _disposeTyping(){if(this._typing){this._typing.dispose();this._typing=null;}}
 renderStore(s,t){
  const c=this.content,products=PRODUCTS.filter(p=>p.category===this.category);if(!products.some(p=>p.id===this.selected))this.selected=products[0]?.id;
  const p=PRODUCTS.find(p=>p.id===this.selected),owned=p&&s.inventory.find(i=>i.product===p.id),v=p?.variants.find(v=>v.id===(owned?.variant||this.variants[p.id]))||p?.variants[0],placed=owned&&s.furniture.some(f=>f.id===owned.id),eligible=s.office.status==='built'&&s.hasEntered;
  c.innerHTML=`<div class="storeHeading"><div><span class="eyebrow">${esc(t('collection'))}</span><h3>OFFICE <strong>STORE</strong></h3></div><span class="storeWallet">${icon('wallet')}${this.format(s.cash)}</span></div><div class="catalogLayout"><nav class="catalogRail" aria-label="${esc(t('store'))}">${CATEGORIES.map(cat=>`<button data-category="${cat}" aria-label="${esc(t(cat))}" title="${esc(t(cat))}" class="${cat===this.category?'selected':''}">${icon(categoryIcon[cat])}<span>${esc(t(cat))}</span></button>`).join('')}</nav>${p?`<div class="productStage"><div id="productPreview" data-preview-label="${esc(t(p.nameKey))}"><span class="previewWatermark">DR / DESIGN</span><div class="previewArrows"><button id="previewLeft" aria-label="${esc(t('previewLeft'))}">‹</button><button id="previewRight" aria-label="${esc(t('previewRight'))}">›</button></div><small class="previewGesture">${icon('rotate')}${esc(t('rotatePreview'))}</small></div><div class="productThumbList">${products.map((item,index)=>`<button class="productThumbnail ${p.id===item.id?'selected':''}" data-product="${item.id}" aria-label="${esc(t(item.nameKey))}" aria-pressed="${p.id===item.id}">${icon(item.id)}<span>${esc(t(item.nameKey))}</span><span>${esc(t('preview'))} ${String(index+1).padStart(2,'0')}</span></button>`).join('')}</div></div><section class="productInfo"><div class="productIndex">${String(products.findIndex(item=>item.id===p.id)+1).padStart(2,'0')} / ${String(products.length).padStart(2,'0')}</div><h3>${esc(t(p.nameKey))}</h3><p>${esc(t(p.descriptionKey))}</p><div class="productDimensions">${esc(t('dimensions'))}<b>${new Intl.NumberFormat(s.lang).format(p.w)} × ${new Intl.NumberFormat(s.lang).format(p.d)} m</b></div><div class="finishHeading">${esc(t('finish'))}<b>${esc(t(v.nameKey))}</b></div><div class="variants">${p.variants.map(finish=>`<button data-variant="${finish.id}" ${owned?'disabled':''} class="${finish.id===v.id?'selected':''}" style="--swatch:${finish.swatch}" aria-label="${esc(t(finish.nameKey))}" aria-pressed="${finish.id===v.id}"><span>${finish.id===v.id?icon('check'):''}</span></button>`).join('')}</div><small class="productRequirement">${icon(!eligible?'lock':p.layer==='surface'?'desk':'check')}${esc(t(!eligible?'requiredOffice':p.layer==='surface'?'requiredDesk':'readyToPlace'))}</small><div class="productBuy"><strong>${this.format(p.price)}</strong>${owned?`<button class="primary" data-place="${owned.id}">${esc(t(placed?'relocate':'place'))}</button>`:`<button class="primary" data-buy="${p.id}" ${!eligible||s.cash<p.price?'disabled':''}>${icon('store')}${esc(t('buy'))}</button>`}</div></section>`:`<div class="catalogEmpty">${icon(categoryIcon[this.category])}<h3>${esc(t(this.category))}</h3><p>${esc(t('emptyCategory'))}</p></div>`}</div>`;
  c.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{this.category=b.dataset.category;this.render('store');});
  c.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>{this.selected=b.dataset.product;this.render('store');});
  c.querySelectorAll('[data-variant]').forEach(b=>b.onclick=()=>{this.variants[p.id]=b.dataset.variant;this.render('store');});
  c.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>this.onBuy(p.id,v.id));
  if(p){this.preview=new ProductPreview(c.querySelector('#productPreview'),this.getWorld());this.preview.angle=this.previewAngle??.65;this.preview.set(p,v.id);c.querySelector('#previewLeft').onclick=()=>this.preview.rotate(-.4);c.querySelector('#previewRight').onclick=()=>this.preview.rotate(.4);}
 }
 backApp(){if(this.app==='messages'&&this.conversation){this._disposeTyping();this.conversation=false;this.narrativeCharacter=null;this.render('messages');return;}if(this.app==='messages'||isM3App(this.app)||isM4App(this.app)||this.app==='store'||this.app==='inventory'||this.app==='bank'||this.app==='objectives'){this.onNavigate('home');return;}this.onClose();}
}
