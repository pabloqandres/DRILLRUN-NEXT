import {moduleDefinition,moduleAvailability} from './module-catalog.mjs';
import {landReady} from './state.mjs';
import {CatalogView} from './catalog-view.mjs';
import {officeThumbnail,workshopThumbnail} from './product-preview.mjs';
import {catalogProducts,catalogCategories} from './construction-catalog.mjs';
export class BuilderUI{
 constructor(options){Object.assign(this,options);this.category='infrastructure';this.selected='office';this.zone='office01';this.store=new CatalogView(this.host);this.buildingThumbnails=new Map();}
 open(){this.store.close();this.selected='office';this.category='infrastructure';this.render();}
 close(){this.store.close();this.onSelection(null);}
 render(){
  this.host.classList.remove('hsecTray','hsecDraftMode');
  if(this.hsec?.mode){this.hsec.renderBuilder(this);return;}
  this.renderStore(this.category,this.selected,id=>{this.category=id;this.render();},id=>{this.selected=id;this.render();});
 }
 // Lazy, one-shot snapshots of the real 3D construction geometry by workshop level.
 // No invented stock images or extra live render loops.
 getOfficeThumbnail(level=1){
  if(level<2||!this.world?.extension?.children.length)return this.thumbnail||null;
  const key='office-'+level;
  if(!this.buildingThumbnails.has(key)){
   try{this.buildingThumbnails.set(key,officeThumbnail(this.world,level));}
   catch(error){console.warn('[Catalog] office L'+level+' snapshot unavailable',error);return this.thumbnail||null;}
  }
  return this.buildingThumbnails.get(key);
 }
 getWorkshopThumbnail(level=1){
  if(!this.world)return null;
  const key='workshop-'+level;
  if(!this.buildingThumbnails.has(key)){
   try{this.buildingThumbnails.set(key,workshopThumbnail(this.world,level));}
   catch(error){console.warn('[Catalog] workshop snapshot unavailable',error);return null;}
  }
  return this.buildingThumbnails.get(key);
 }
 renderStore(category,selected,onCategory,onSelect){
  const s=this.state(),t=this.translate();this.onSelection(null);
  let products;try{products=catalogProducts(s,t);}catch(e){console.error('catalogProducts error:',e);products=[];}
  this.store.render({lang:s.lang,products,categories:catalogCategories(s.lang),category,selected,format:this.format,
   thumbnail:p=>p.kind==='module'?this.getOfficeThumbnail(p.level):p.kind==='workshop'?this.getWorkshopThumbnail(p.level):p.kind==='hsec'&&p.status!=='future'&&this.hsec?.world?this.hsec.world.thumbnail(p.id):null,
   onCategory,onSelect,onClose:this.onClose,onStaff:()=>this.hsec?.open('staff'),
   onManage:p=>{
    if(p.kind==='module')return s.office.status==='building'?this.onClose():this.onManage();
    if(p.kind==='workshop')return (this.onClose(),this.onWorkshopManage?.());
    if(p.kind==='drill'||p.kind==='hammer'||p.kind==='bit')return (this.onClose(),this.onPhoneNav?.('m3-catalog'));
    if(p.kind==='dthDrill'||p.kind==='dthHammer'||p.kind==='dthBit')return (this.onClose(),this.onPhoneNav?.('m4-dth-catalog'));
    if(p.kind==='vehicle')return (this.onClose(),this.onPhoneNav?.('m4-drilltruck'));
    if(p.kind==='furniture')return (this.onClose(),this.onPhoneNav?.('store'));
    if(p.kind==='personnel')return (this.onClose(),this.onPhoneNav?.('m3-personnel'));
    this.hsec.open('assets');
   },
   onPurchase:p=>{
    if(p.kind==='module'){const current=this.state(),m=moduleDefinition('office-l1');if(!moduleAvailability(current,m)&&landReady(current)&&current.cash>=m.price)this.onConfirm(m,this.zone);return;}
    if(p.kind==='drill')return this.onCatalogAction?.('buyDrill',p.model.id);
    if(p.kind==='dthDrill')return this.onCatalogAction?.('buyDthDrill',p.model.id);
    if(p.kind==='vehicle')return this.onCatalogAction?.('buyTruck',p.model.id);
    if(p.kind==='furniture')return this.onCatalogAction?.('buyFurniture',p.model.id);
    if(p.kind==='personnel')return this.onCatalogAction?.('hire',p.model.id);
    this.hsec?.purchaseFixed(p.id);
   },
   onPlace:p=>this.hsec?.beginDraft(p.id)
  });
 }
}
