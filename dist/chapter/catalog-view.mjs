import {icon} from './icons.mjs';
import {catalogCopy,catalogDuration} from './construction-catalog.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// One bottom surface: selection and inspection are read-only; only the explicit CTA buys.
export class CatalogView{
 constructor(host){this.host=host;this.detailId=null;this.collapsed=false;this.scroll=new Map();this.categoryScrollLeft=0;}
 close(){this.detailId=null;this.collapsed=false;this.categoryScrollLeft=0;this.host.classList.remove('catalogTray','catalogPreview','catalogExpanded','catalogCollapsed');}
 hideDetail(){this.detailId=null;}
 render(options){
  this.options=options;
  const {products,categories,category,selected,onCategory,onSelect,onClose,format,thumbnail,lang,onStaff}=options,c=catalogCopy(lang),items=products.filter(p=>p.category===category),picked=items.find(p=>p.id===selected)||items[0],expanded=!!picked&&this.detailId===picked.id;
  this.host.classList.remove('hsecTray','hsecDraftMode','catalogPreview');this.host.classList.add('catalogTray');this.host.classList.toggle('catalogExpanded',expanded);this.host.classList.toggle('catalogCollapsed',this.collapsed);this.host.dataset.category=category;
  // The category nav is recreated by innerHTML on every selection: preserve its viewport.
  // Skip reading the hidden nav while collapsed so reopening retains the prior position.
  const previousCategoryNav=this.host.querySelector('.catalogCategories');
  if(previousCategoryNav&&!this.host.classList.contains('catalogCollapsed'))this.categoryScrollLeft=previousCategoryNav.scrollLeft;
  const status=p=>c[p.status==='available'&&p.insufficient?'insufficient':p.status];
  const quote=p=>`<span class="buildCost">${Number.isFinite(p.price)?icon('wallet')+esc(format(p.price))+(p.route?c.perMeter:''):esc(c[p.status])}</span>${Number.isFinite(p.seconds)?`<span class="catalogTime">${icon('time')}${catalogDuration(p.seconds)}</span>`:''}`;
  const canAct=p=>p.action==='manage'||p.canStart&&!p.insufficient;
  const action=p=>p.action==='manage'?(p.status==='building'?c.viewWork:c.manage):p.action==='place'?c.place:c.buy;
  const facts=p=>[[p.route?c.width:c.area,p.route?p.w+' m':Math.round(p.w*p.d*10)/10+' m² · '+p.w+' × '+p.d+' m'],[c.height,p.h+' m'],...(p.capacity?[[c.capacity,p.capacity]]:[]),[c.benefit,p.benefit]];
  this.host.innerHTML=`<div class="catalogHeader"><div class="catalogCollapsedTitle"><b>${esc(picked?.title||c.catalog)}</b>${picked&&Number.isFinite(picked.price)?`<span class="buildCost">${icon('wallet')}${esc(format(picked.price))}${picked.route?c.perMeter:''}</span>`:''}${picked?`<button id="catalogDetailsToggleCollapsed" class="catalogDetailsToggle">${icon('objectives')}<span>${esc(c.details)}</span></button><button id="catalogPurchaseCollapsed" class="primary" ${canAct(picked)?'':'disabled'}>${icon(picked.action==='manage'?'camp':picked.action==='place'?'location':'wallet')}<span>${esc(action(picked))}</span></button>`:''}</div><span class="catalogBrand">${icon('build')}<b>${esc(c.catalog)}</b></span><nav class="catalogCategories" role="tablist">${categories.map(k=>`<button role="tab" data-catalog-category="${k.id}" aria-selected="${k.id===category}" class="${k.id===category?'selected':''}"><span class="catalogCategoryIcon" aria-hidden="true">${icon(k.icon)}</span><span>${esc(k.label)}</span></button>`).join('')}</nav><button id="catalogCollapse" class="catalogCollapse iconButton" aria-label="${esc(this.collapsed?c.expand:c.collapse)}" aria-expanded="${!this.collapsed}">${icon('back')}</button><button id="closeBuilder" class="catalogClose iconButton" aria-label="${esc(c.close)}">${icon('close')}</button></div>
  ${picked?`<section class="catalogSummary" aria-label="${esc(picked.title)}"><div class="catalogSummaryText"><b>${esc(picked.title)}</b><p>${esc(picked.benefit)}</p></div><div class="catalogQuote">${quote(picked)}</div><small class="catalogRequirement">${icon(picked.reason?'lock':picked.insufficient?'wallet':'check')}<span>${esc(picked.reason||(picked.insufficient?c.insufficient:c[picked.status]))}</span></small><div class="catalogSummaryActions"><button id="catalogDetailsToggle" class="catalogDetailsToggle" aria-expanded="${expanded}" aria-controls="catalogInlineDetails">${icon('objectives')}<span>${esc(expanded?c.back:c.details)}</span></button><button id="catalogPurchase" class="primary" ${canAct(picked)?'':'disabled'}>${icon(picked.action==='manage'?'camp':picked.action==='place'?'location':'wallet')}<span>${esc(action(picked))}</span></button></div></section>`:''}
  ${expanded?`<section id="catalogInlineDetails" class="catalogInlineDetails" aria-label="${esc(c.details)}"><div class="catalogDetailVisual">${thumbnail(picked)?`<img src="${thumbnail(picked)}" alt="Modelo 3D real de ${esc(picked.title)}">`:picked.kind==='vehicle'?`<span class="realAssetLoading" data-real-asset-loading>GENERANDO VISTA DEL MODELO 3D…</span>`:icon(picked.status==='locked'||picked.status==='future'?'lock':'hsec:'+picked.category)}</div><dl class="catalogFacts">${facts(picked).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>`:`<div class="constructionRail"><button class="catalogStep" id="catalogPrevious" aria-label="${esc(c.previous)}">${icon('back')}</button><div class="catalogProducts" role="group" aria-label="${esc(c.catalog)}">${items.map(p=>{
   const image=p.status==='future'?null:thumbnail(p);const fallbackIcon=p.status==='locked'||p.status==='future'?'lock':'hsec:'+p.category;
   return `<button data-catalog-product="${p.id}" class="catalogProduct ${picked?.id===p.id?'selected':''} ${p.status==='locked'||p.status==='future'?'locked':''}" aria-pressed="${picked?.id===p.id}" aria-label="${esc(p.title+' · '+status(p))}"><span class="catalogArt">${image?`<img src="${image}" alt="Modelo 3D de ${esc(p.title)}" draggable="false">`:p.kind==='vehicle'?`<span class="realAssetLoading" data-real-asset-loading>PREPARANDO VISTA 3D…</span>`:icon(fallbackIcon)}${p.status==='locked'||p.status==='future'?`<i aria-hidden="true">${icon('lock')}</i>`:''}</span><span class="catalogName">${esc(p.title)}</span><span class="catalogLevel">${esc(c.level)} ${p.level}</span></button>`;
  }).join('')||`<div class="constructionEmpty">${icon(category==='management'?'player':'lock')}<b>${esc(category==='management'?c.staffHint:c.empty)}</b>${category==='management'?`<button id="catalogStaff" class="primary">${esc(c.staff)}</button>`:''}</div>`}</div><button class="catalogStep" id="catalogNext" aria-label="${esc(c.next)}">${icon('arrow')}</button></div>`}`;
  const categoryNav=this.host.querySelector('.catalogCategories');
  if(categoryNav&&!this.collapsed){
   categoryNav.scrollLeft=this.categoryScrollLeft;
   const activeCategory=categoryNav.querySelector('[aria-selected="true"]');
   if(activeCategory){
    const navRect=categoryNav.getBoundingClientRect(),tabRect=activeCategory.getBoundingClientRect();
    if(tabRect.left<navRect.left)categoryNav.scrollLeft-=navRect.left-tabRect.left+5;
    else if(tabRect.right>navRect.right)categoryNav.scrollLeft+=tabRect.right-navRect.right+5;
   }
   this.categoryScrollLeft=categoryNav.scrollLeft;
   categoryNav.addEventListener('scroll',()=>{this.categoryScrollLeft=categoryNav.scrollLeft;},{passive:true});
  }
  const rail=this.host.querySelector('.catalogProducts');
  if(rail){rail.scrollLeft=this.scroll.get(category)||0;const prev=this.host.querySelector('#catalogPrevious'),next=this.host.querySelector('#catalogNext');const sync=()=>{prev.disabled=rail.scrollLeft<2;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;};rail.onscroll=()=>{this.scroll.set(category,rail.scrollLeft);sync();};requestAnimationFrame(sync);prev.onclick=()=>rail.scrollBy({left:-Math.max(160,rail.clientWidth*.75),behavior:'smooth'});next.onclick=()=>rail.scrollBy({left:Math.max(160,rail.clientWidth*.75),behavior:'smooth'});}
  this.host.querySelector('#closeBuilder').onclick=onClose;
  this.host.querySelector('#catalogCollapse').onclick=()=>{this.collapsed=!this.collapsed;this.render(this.options);this.host.querySelector('#catalogCollapse')?.focus({preventScroll:true});};
  this.host.querySelectorAll('[data-catalog-category]').forEach(b=>b.onclick=()=>{this.hideDetail();onCategory(b.dataset.catalogCategory);});
  this.host.querySelectorAll('[data-catalog-product]').forEach(b=>b.onclick=()=>{const id=b.dataset.catalogProduct;this.detailId=id===picked?.id?id:null;onSelect(id);});
  this.host.querySelector('#catalogStaff')?.addEventListener('click',onStaff);
  this.host.querySelector('#catalogDetailsToggle')?.addEventListener('click',()=>{this.detailId=expanded?null:picked.id;this.render(this.options);this.host.querySelector('#catalogDetailsToggle')?.focus({preventScroll:true});});
  const purchaseHandler=()=>{if(!canAct(picked))return;this.hideDetail();if(picked.action==='manage')options.onManage(picked);else if(picked.action==='place')options.onPlace(picked);else options.onPurchase(picked);};
  this.host.querySelector('#catalogPurchase')?.addEventListener('click',purchaseHandler);
  this.host.querySelector('#catalogPurchaseCollapsed')?.addEventListener('click',purchaseHandler);
  this.host.querySelector('#catalogDetailsToggleCollapsed')?.addEventListener('click',()=>{this.collapsed=false;this.detailId=picked?.id||null;this.render(this.options);});
 }
}
