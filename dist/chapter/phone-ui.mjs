import {CONFIG} from './config.mjs';
import {availableMessages,unreadMessages,readMessage} from './ui-state.mjs';
import {landReady,objective} from './state.mjs';
import {rcDrillThumbnail} from './product-preview.mjs';
import {drillTruckImage} from './drilltruck-image.mjs';
import {icon,workerAvatar} from './icons.mjs';
import {isM3App,m3HomeApps,renderM3App} from '../mission3/phone-apps.mjs';
import {isM4App,m4HomeApps,renderM4App} from '../mission4/phone-apps.mjs';
import {renderPatioApp} from '../mission5/patio-ui.mjs';
import {renderContactList,renderConversation,NarrativeTyping,resolveNarrativeText} from './narrative-ui.mjs';
import {markCharacterRead,narrativeUnread} from './narrative.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class PhoneUI{
 constructor(options){Object.assign(this,options);this.conversation=false;this.narrativeCharacter=null;this._typing=null;this.rigArtCache=new Map();this._renderedThreadMessages=new Map();this._focusNarrativeMessageId=null;}
 // A freshly delivered SMS should open its OWN bubble, not the first
 // historical message from that sender (Elena appears in M1, M4 and M5).
 focusNarrativeMessage(message){
  if(!message)return;
  this.narrativeCharacter=message.characterId;
  this.conversation=true;
  this._focusNarrativeMessageId=message.id;
 }
 _scrollToNarrativeMessage(messageId){
  if(!messageId)return false;
  const c=this.content;
  const bubble=[...c.querySelectorAll('.narrativeBubble')].find(el=>el.dataset.msgId===messageId);
  if(!bubble)return false;
  // Align TOP of new message, so long texts can be read from the beginning.
  const position=c.scrollTop+bubble.getBoundingClientRect().top-c.getBoundingClientRect().top-8;
  c.scrollTop=Math.max(0,position);
  return true;
 }
 release(){if(this.preview)this.previewAngle=this.preview.angle;this.preview?.dispose();this.preview=null;this._disposeTyping();}
 render(app){
  // Live mission/stock updates re-render this screen. Preserve the user's
  // scroll position while they remain in the SAME phone view.
  const viewKey=app==='messages'
   ?app+':'+(this.conversation?'thread:'+String(this.narrativeCharacter||'mentor'):'contacts')
   :app;
  const keepScroll=this._lastViewKey===viewKey;
  const previousScroll=keepScroll?this.content.scrollTop:0;
  this.release();const s=this.state(),t=this.translate(),c=this.content,fmt=this.format;this.app=app;
  const lastThreadMessage=app==='messages'&&this.conversation&&this.narrativeCharacter
   ?s.narrative?.messages?.filter(m=>m.characterId===this.narrativeCharacter).at(-1)
   :null;
  const lastThreadId=lastThreadMessage?.id||null;
  // A new message in an ALREADY open conversation also overrides the saved
  // scroll position. Ordinary HUD re-renders preserve user's manual reading.
  const focusMessageId=this._focusNarrativeMessageId||
   (lastThreadId&&(!keepScroll||this._renderedThreadMessages.get(viewKey)!==lastThreadId)
    ?lastThreadId:null);
  this.shell.classList.remove('storeMode');this.shell.dataset.app=app;
  this.title.textContent=app==='home'?'FIELD / 01':t(app);this.back.style.visibility=app==='home'?'hidden':'visible';
  c.className='appContent';
  if(app==='home'){
   const name=s.playerName||t('operatorName'),count=unreadMessages(s).length+narrativeUnread(s);
   
   c.innerHTML=`<div class="phoneGreeting"><span class="eyebrow">${esc(t('fieldNetwork'))}</span><b>${esc(name)}</b><small>${esc(t('operator'))}</small></div><div class="apps">${['messages'].map(a=>`<button data-app="${a}"><span class="appTile app-${a}">${icon(a)}${count?`<i class="appBadge">${count}</i>`:''}</span><span>${esc(t(a))}</span></button>`).join('')}${m3HomeApps(s,t,icon)}${m4HomeApps(s,t,icon)}</div><div class="phoneFooter">DRILL RUN <span>·</span> ${esc(t('firstSteps'))}</div>`;
  }else if(app==='messages')this.renderMessages(s,t);
  else if(app==='bank'){
   s.bankViewed=true;this.onSave();c.innerHTML=`<div class="bankCard"><div class="bankBrand">${icon('bank')}<span>DR / BANK</span></div><small>${esc(t('bankAccount'))}</small><b>${fmt(s.bank)}</b><div class="bankWallet"><span>${esc(t('wallet'))}</span><strong>${fmt(s.cash)}</strong></div></div><div class="sectionHeading">${esc(t('bankTransfer'))}</div><label class="bankInput">${esc(t('amount'))}<input id="bankAmount" type="number" min="1" step="1" value="2500" inputmode="numeric"></label><div class="bankActions"><button class="primary" data-transfer="withdraw">${esc(t('withdraw'))}</button><button data-transfer="deposit">${esc(t('deposit'))}</button></div><small>${esc(t('bankNote'))}</small><div class="sectionHeading">${esc(t('operations'))}</div><ul class="transactions">${[...s.ledger].reverse().map(o=>`<li><span class="transactionIcon">${icon(o.key==='capital'?'bank':o.key==='withdraw'?'arrow':o.key==='deposit'?'bank':'store')}</span><span>${esc(t(o.key))}<small>${new Date(o.at).toLocaleTimeString(s.lang,{hour:'2-digit',minute:'2-digit'})}</small></span><b>${fmt(o.amount)}</b></li>`).join('')}</ul>`;
   c.querySelectorAll('[data-transfer]').forEach(b=>b.onclick=()=>this.onTransfer(b.dataset.transfer,Number(c.querySelector('#bankAmount').value)));
  }else if(app==='inventory'){
   c.innerHTML=`<div class="emptyState">${icon('machine')}<p>Los equipos y herramientas se gestionan mediante Catálogo y Casa Matriz. La oficina viene equipada.</p></div>`;
  }else if(app==='objectives'){
   const entries=[['clear',landReady(s)],['build',s.office.status==='built'],['admin',!!s.chapterCompletedAt]];
   c.innerHTML=`<div class="missionHeading"><span class="eyebrow">${esc(t('chapter'))}</span><h3>${esc(t('firstSteps'))}</h3></div><div class="steps">${entries.map(([key,done],i)=>`<div class="${done?'done':objective(s)===key?'active':''}"><span class="stepNumber">${done?icon('check'):String(i+1).padStart(2,'0')}</span><span><b>${esc(t(key))}</b><small>${esc(t(done?'completed':key+'Detail'))}</small></span></div>`).join('')}</div><p class="missionDetail">${esc(t(objective(s)+'Detail'))}</p>`;
  }else if(isM3App(app)){
   this.title.textContent=app.replace('m3-','').replace(/^\w/,c=>c.toUpperCase());this.back.style.visibility='visible';
   c.className='appContent';c.innerHTML=renderM3App(app,s,t,fmt,icon,{onSave:this.onSave,onNavigate:this.onNavigate});
  }else if(app==='m5-patio'){
   this.title.textContent='Patio de Maquinarias';
   this.back.style.visibility='visible';
   c.className='appContent';
   c.innerHTML=renderPatioApp(s,fmt,icon);
   c.querySelectorAll('[data-m5-action]').forEach(btn=>btn.onclick=()=>this.onM5Action?.(btn.dataset.m5Action,btn.dataset.m5Staff||null));
  }else if(isM4App(app)){
   const m4Titles={'m4-operaciones':'Operaciones','m4-workshop':'Taller','m4-dth-catalog':'Casa Matriz · DTH','m4-drilltruck':'DrillTruck','m4-zones':'Zonas','m4-objectives':'Objetivos'};
   this.title.textContent=m4Titles[app]||'Operaciones';this.back.style.visibility='visible';
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
  c.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>{if(b.dataset.app==='messages')this.conversation=false;this.onNavigate(b.dataset.app);});
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
  c.querySelector('#understoodMessage')?.addEventListener('click',this.onClose);
  this._lastViewKey=viewKey;
  if(lastThreadId)this._renderedThreadMessages.set(viewKey,lastThreadId);
  c.scrollTop=keepScroll?previousScroll:0;
  if(focusMessageId)this._scrollToNarrativeMessage(focusMessageId);
  this._focusNarrativeMessageId=null;
  this.onHUD();
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
   // Render before marking read: otherwise unread status disappears and
   // typewriter never begins on the first opening of a message.
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
     const resolved=resolveNarrativeText(body,s.playerName);
     this._typing=new NarrativeTyping(typingTarget,resolved,()=>{});

    }
   }
   // First opening is registered per message ID in the existing save model.
   // Do this after rendering so first-time text can animate, and ensure an
   // interrupted or closed animation does not replay on a later opening.
   markCharacterRead(s,this.narrativeCharacter);
   this.onSave();
  }else{
   // Legacy mentor conversation
   const messages=availableMessages(s);messages.forEach(m=>readMessage(s,m.id));this.onSave();
   c.innerHTML=`<div class="conversationHeader"><span class="senderAvatar">${icon('messages')}</span><span><b>${esc(t(CONFIG.mentor.nameKey))}</b><small>${esc(t('conversation'))}</small></span></div><div class="messageThread">${messages.map(m=>`<div class="message"><small>${esc(t(m.id==='welcome'?'welcomePreview':'storePreview'))}</small><p>${esc(t(m.bodyKey))}</p><span class="readState">${icon('check')} ${esc(t('read'))}</span></div>`).join('')}</div><button class="primary messageCTA" id="understoodMessage">${icon('check')}${esc(t('understood'))}</button>`;
  }
 }
 _disposeTyping(){if(this._typing){this._typing.dispose();this._typing=null;}}
 backApp(){if(this.app==='messages'&&this.conversation){this._disposeTyping();this.conversation=false;this.narrativeCharacter=null;this.render('messages');return;}if(this.app==='messages'||isM3App(this.app)||isM4App(this.app)||this.app==='m5-patio'||this.app==='inventory'||this.app==='bank'||this.app==='objectives'){this.onNavigate('home');return;}this.onClose();}
}
