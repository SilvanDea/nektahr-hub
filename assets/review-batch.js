/* Shared review fixes; no orders or messages are submitted by these controls. */
(()=>{
 const $=id=>document.getElementById(id),lang=()=>document.documentElement.lang;
 const rules={en:[['Free hold','48 hours.'],['Paid hold','From 7 days; longer terms can be agreed.'],['Advance','At least $10, credited toward the price. The hold starts when it arrives; pay the balance before the hold expires.'],['Auction listings','Only unsold listings after bidding ends and more than 14 days after listing. A confirmed hold closes new offers. For YCH, this reserves a slot; the template stays reusable.'],['Please note','A reservation does not mean drawing has started.']],ru:[['Бесплатная бронь','48 часов.'],['Платная бронь','От 7 дней; более долгий срок обсудим.'],['Предоплата','От $10 в счёт покупки. Срок брони начинается после её получения; остаток нужно оплатить до окончания брони.'],['Аукционы','Бронь доступна непроданным работам после завершения торгов и спустя более 14 дней с публикации. Подтверждённая бронь закрывает новые предложения. У YCH бронируется слот; шаблон остаётся доступным для повторных заказов.'],['Важно','Бронь ещё не означает начало рисования.']],es:[['Reserva gratuita','48 horas.'],['Reserva pagada','Desde 7 días; podemos acordar más tiempo.'],['Anticipo','Al menos $10, descontados del precio. La reserva empieza al recibirlo; el resto se paga antes de que termine.'],['Subastas','Solo obras sin vender, tras cerrar las pujas y más de 14 días después de publicarse. La reserva confirmada cierra nuevas ofertas. En YCH se reserva una plaza; la plantilla sigue disponible para otros pedidos.'],['Importante','Reservar no significa que haya empezado a dibujar.']]};
 const lock='<span class="media-lock-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="10" width="12" height="11" rx="3"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/><circle cx="12" cy="15" r="1"/><path d="M12 16v2"/></svg></span><span>NSFW · 18+</span>';
 let busy=false;function decorate(){if(busy)return;busy=true;observer.disconnect();
  document.querySelectorAll('#gallery-cards-grid>button>div:first-child,.sample-thumb,.catalog-art').forEach(frame=>{
   const img=frame.querySelector('img');const locked=img?.classList.contains('blur-2xl')||frame.classList.contains('is-blurred')||frame.classList.contains('catalog-blurred');
   frame.querySelectorAll('.catalog-adult-cover').forEach(e=>e.remove());
   if(img?.classList.contains('blur-2xl'))[...frame.children].filter(e=>e.classList.contains('absolute')&&e.classList.contains('inset-0')).forEach(e=>e.remove());
   let cover=frame.querySelector('.media-lock');if(locked&&!cover){cover=document.createElement('span');cover.className='media-lock';cover.innerHTML=lock;frame.append(cover)}else if(!locked)cover?.remove();
  });
  for(const id of ['catalog-reserve-description','reservation-description']){const el=$(id);if(!el)continue;el.classList.add('readable-rules');el.innerHTML=(rules[lang()]||rules.en).map(([a,b])=>'<span><strong>'+a+':</strong> '+b+'</span>').join('');}
  if($('reservation-terms'))$('reservation-terms').hidden=true;
  const intake=$('contacts-intake');if(intake){intake.setAttribute('role','link');intake.tabIndex=0;intake.onclick=()=>location.assign('/pricing/?type=custom#order-conditions');intake.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();intake.click()}}}
  const link=$('fanart-version-link');if(link){link.textContent=({en:'Other examples ↗',ru:'Другие примеры ↗',es:'Otros ejemplos ↗'})[lang()];link.onclick=e=>{e.preventDefault();window.openGalleryArtwork?.(101,{examples:true});};}
  observer.observe(document.body,{childList:true,subtree:true});busy=false;
 }
 const observer=new MutationObserver(()=>{if(!busy)decorate()});decorate();
 // Capture delegated clicks: dynamically rebuilt contact cards must not escape to mailto.
 document.addEventListener('click',event=>{const a=event.target.closest('a[href^="mailto:"]');if(!a||a.id==='email-open-app')return;event.preventDefault();event.stopImmediatePropagation();$('quote-email')?.click();},true);
 function openConditions(){if(document.body.dataset.page!=='pricing'||location.hash!=='#order-conditions')return;switchPricingTab('custom');const group=document.querySelector('details[data-compact-group="more"]');if(group){group.id='order-conditions';group.open=true;group.scrollIntoView({block:'center'})}}
 window.addEventListener('load',openConditions);

 // Mobile navigation drawer toggle and click-away
 const navToggle=$('mobile-nav-toggle'),navLinks=$('nav-links'),header=document.querySelector('header.sticky'),bnavMore=$('bnav-more');
 function toggleMobileMenu(force){
  if(!navToggle||!navLinks)return;
  const open=typeof force==='boolean'?force:navToggle.getAttribute('aria-expanded')!=='true';
  navToggle.setAttribute('aria-expanded',String(open));
  if(bnavMore){
   bnavMore.setAttribute('aria-expanded',String(open));
   bnavMore.classList.toggle('bnav-menu-open',open);
  }
  header?.classList.toggle('mobile-menu-active',open);
  navLinks.classList.toggle('is-open',open);
  document.body.classList.toggle('mobile-menu-open',open);
 }
 if(navToggle)navToggle.onclick=()=>toggleMobileMenu();
 if(navLinks){
  navLinks.querySelectorAll('.nav-link').forEach(link=>{
   link.addEventListener('click',()=>toggleMobileMenu(false));
  });
 }
 document.addEventListener('click',e=>{
  if(header&&!header.contains(e.target)&&(!bnavMore||!bnavMore.contains(e.target)))toggleMobileMenu(false);
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape')toggleMobileMenu(false);
 });

 // Mobile floating quote bar sync & visibility
 const quoteLabels={
  en:{label:'Estimated Total',btn:'To Quote'},
  ru:{label:'Ориентировочно',btn:'К расчёту'},
  es:{label:'Total estimado',btn:'Al cálculo'}
 };
 function syncMobileQuote(){
  const total=$('calc-total-value')?.textContent;
  const amount=$('mobile-quote-amount');
  if(amount&&total)amount.textContent=total;
  const l=quoteLabels[lang()]||quoteLabels.en;
  if($('mobile-quote-label'))$('mobile-quote-label').textContent=l.label;
  if($('mobile-quote-btn-text'))$('mobile-quote-btn-text').textContent=l.btn;
 }
 const calcTotal=$('calc-total-value');
 if(calcTotal){
  new MutationObserver(syncMobileQuote).observe(calcTotal,{childList:true,characterData:true,subtree:true});
  syncMobileQuote();
 }
 const quotePanel=document.querySelector('.quote-panel'),quoteBar=$('mobile-quote-bar');
 if(quotePanel&&quoteBar&&window.IntersectionObserver){
  new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    quoteBar.classList.toggle('quote-bar-hidden',entry.isIntersecting);
   });
  },{threshold:0.12}).observe(quotePanel);
 }

 // Mobile bottom dock localization and active state sync
 const bnavLabels={
  en:{board:'Home',pricing:'Pricing',catalog:'Catalog',gallery:'Gallery',more:'More'},
  ru:{board:'Главная',pricing:'Прайс',catalog:'Каталог',gallery:'Галерея',more:'Ещё'},
  es:{board:'Inicio',pricing:'Precios',catalog:'Catálogo',gallery:'Galería',more:'Más'}
 };
 function syncBottomNav(){
  const l=bnavLabels[lang()]||bnavLabels.en;
  const page=document.body.dataset.page||'board';
  for(const[k,v]of Object.entries(l)){
   const item=document.getElementById('bnav-'+k);
   if(!item)continue;
   const el=item.querySelector('.bnav-label');
   if(el)el.textContent=v;
   const isActive=k===page||(k==='more'&&['queue','tos','faq'].includes(page));
   item.classList.toggle('bnav-active',isActive);
  }
  syncMobileQuote();
 }
 syncBottomNav();
 window.addEventListener('languagechange',syncBottomNav);
 if(typeof window.renderAllText==='function'){
  const prevRenderAll=window.renderAllText;
  window.renderAllText=function(){
   prevRenderAll();
   syncBottomNav();
  };
 }

 // Backdrop click-to-close for catalog bottom sheet and email contact modal
 for(const id of ['catalog-dialog','email-contact-dialog']){
  const dlg=$(id);
  if(!dlg)continue;
  dlg.addEventListener('click',e=>{
   if(e.target!==dlg)return;
   const r=dlg.getBoundingClientRect();
   if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close();
  });
 }

 // Touch swipe left/right for artwork preview modal (outside curtain slider & strip)
 const artDialog=$('artwork-dialog');
 let touchX=0,touchY=0,touchBlocked=false;
 if(artDialog){
  artDialog.addEventListener('touchstart',e=>{
   if(e.touches.length!==1){touchBlocked=true;return;}
   const tgt=e.target;
   touchBlocked=Boolean(tgt?.closest?.('.curtain,input[type="range"],#artwork-work-strip,button,a'));
   touchX=e.touches[0].clientX;
   touchY=e.touches[0].clientY;
  },{passive:true});
  artDialog.addEventListener('touchend',e=>{
   if(touchBlocked||!e.changedTouches.length)return;
   const dx=e.changedTouches[0].clientX-touchX;
   const dy=e.changedTouches[0].clientY-touchY;
   if(Math.abs(dx)>64&&Math.abs(dx)>Math.abs(dy)*1.6){
    const btn=$(dx<0?'artwork-dialog-next':'artwork-dialog-prev');
    if(btn&&!btn.disabled)btn.click();
   }
  },{passive:true});
 }
})();
