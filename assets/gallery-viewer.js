
(() => {
  const $=id=>document.getElementById(id);
  const dialog=$('artwork-dialog');let currentItem=null,returnFocus=null,viewerParent=null,sessionItems=[],selectionVersion=0,examplesMode=false;
  const text=()=>({en:{close:'Close preview',prev:'Previous artwork',next:'Next artwork',prices:'View prices →',hint:'Use ← / → to browse. Escape closes the preview.',error:'This image could not load. Please try again.'},es:{close:'Cerrar vista',prev:'Obra anterior',next:'Obra siguiente',prices:'Ver precios →',hint:'Usa ← / → para navegar. Escape cierra la vista.',error:'No se pudo cargar la imagen. Inténtalo de nuevo.'},ru:{close:'Закрыть просмотр',prev:'Предыдущая работа',next:'Следующая работа',prices:'Посмотреть цены →',hint:'← / → — другие работы. Escape — закрыть просмотр.',error:'Не удалось загрузить изображение. Попробуй ещё раз.'}})[document.documentElement.lang]||{close:'Close',prev:'Previous',next:'Next',prices:'Pricing',hint:'',error:'Image unavailable'};
  const filtered=()=>sessionItems;
  function itemsForOpening(item){
    const page=document.body.dataset.page;
    if(examplesMode){const ids=[1,2,3,4,5,6,...(window.PORTFOLIO_WORKS||[]).filter(w=>w.images.length>1).map(w=>w.id)];return GALLERY_ITEMS.filter(x=>ids.includes(x.processWork));}
    if(page==='pricing'){
      const extra=(window.PORTFOLIO_WORKS||[]).filter(w=>w.pricingExample===currentPricingTab).map(w=>w.id);const allowed=[3,7].includes(item.processWork)?[3,7]:currentPricingTab==='ych'?[4,5,6,...extra]:currentPricingTab==='adopt'?extra:[1,2,...extra];
      return GALLERY_ITEMS.filter(x=>allowed.includes(x.processWork));
    }
    if(page==='catalog')return [item];
    return GALLERY_ITEMS.filter(matchesGalleryFilters);
  }
  function restoreViewer(){const viewer=$('art-process');if(viewerParent&&viewer&&viewer.parentElement!==viewerParent)viewerParent.append(viewer);window.setProcessContext?.(currentPricingTab);}
  function finishClose(){if(!document.body.classList.contains('artwork-modal-open'))return;restoreViewer();document.body.classList.remove('artwork-modal-open');if(returnFocus?.isConnected)returnFocus.focus();else $('nsfw-switch')?.focus();}
  function close(){if(dialog.open)dialog.close();finishClose();}
  function renderStrip(item){const strip=$('artwork-work-strip');const previousScroll=strip.scrollLeft;strip.replaceChildren();
    sessionItems.filter(x=>x.processWork&&sessionItems.length>1).forEach(work=>{
      const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed',String(work.id===item.id));
      const model=(window.PORTFOLIO_WORKS||[]).find(w=>w.id===work.processWork);
      const adultPreview=model?Boolean(model.nsfw[model.thumb]):Boolean(work.nsfw);
      const locked=adultPreview&&!(isAdultVerified&&showNsfwGallery);
      if(locked)button.className='strip-adult';else if(work.hoverReveal)button.className='adult-hover-preview';
      const media=document.createElement('span');media.className='strip-media';
      const thumb=document.createElement('img');thumb.src=work.img;thumb.alt='';thumb.loading='lazy';thumb.decoding='async';media.append(thumb);
      if(locked){const cover=document.createElement('span');cover.className='strip-lock';cover.innerHTML='<span class="strip-lock-icon"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="10" width="12" height="11" rx="3"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/><path d="M12 14v3"/></svg></span><small>NSFW · 18+</small>';media.append(cover);}
      else if(hasAdultArtwork(work)){const badge=document.createElement('small');badge.className='strip-age';badge.textContent='18+';media.append(badge);}
      const title=document.createElement('span');title.className='strip-title';title.textContent=getGalleryTitle(work);button.title=title.textContent;
      button.append(media,title);button.onclick=()=>window.openGalleryArtwork(work.id);strip.append(button);
    });
    strip.scrollLeft=previousScroll;const selected=strip.querySelector('[aria-pressed="true"]');if(selected){const cardRect=selected.getBoundingClientRect(),stripRect=strip.getBoundingClientRect();if(cardRect.left<stripRect.left)strip.scrollLeft-=stripRect.left-cardRect.left;else if(cardRect.right>stripRect.right)strip.scrollLeft+=cardRect.right-stripRect.right;}
}
  new MutationObserver(records=>{if(dialog.open&&currentItem&&records.some(r=>r.target.id==='adultToggle'))renderStrip(currentItem);}).observe(dialog,{subtree:true,attributes:true,attributeFilter:['aria-checked']});
  window.openGalleryArtwork=(id,options={})=>{
    const item=GALLERY_ITEMS.find(x=>x.id===Number(id));if(!item)return;
    const opening=!dialog.open;if(opening){examplesMode=Boolean(options.examples);sessionItems=itemsForOpening(item);}if(!sessionItems.some(x=>x.id===item.id))return;if(opening){returnFocus=document.activeElement;viewerParent=$('art-process').parentElement;dialog.showModal();document.body.classList.add('artwork-modal-open');}
    const version=++selectionVersion;
    currentItem=item;renderStrip(item);
    const t=text();$('artwork-dialog-title').textContent=getGalleryTitle(item);const items=filtered();$('artwork-dialog-prev').disabled=items.length<2;$('artwork-dialog-next').disabled=items.length<2;$('artwork-dialog-prices').hidden=document.body.dataset.page==='pricing';$('artwork-dialog-counter').textContent=[getGalleryKind(item),getGallerySeries(item),`${items.findIndex(x=>x.id===item.id)+1} / ${items.length}`].filter(Boolean).join(' · ');
    $('artwork-dialog-close').setAttribute('aria-label',t.close);$('artwork-dialog-prev').setAttribute('aria-label',t.prev);$('artwork-dialog-next').setAttribute('aria-label',t.next);$('artwork-dialog-prices').textContent=t.prices;$('artwork-dialog-hint').textContent=t.hint;
    const body=$('artwork-dialog-body'),image=$('artwork-dialog-image'),error=$('artwork-dialog-error');error.hidden=true;image.onload=null;image.onerror=null;image.hidden=true;image.removeAttribute('src');
    if(item.processWork){image.hidden=true;body.append($('art-process'));$('art-process').hidden=false;window.setProcessContext?.(examplesMode?'examples':'gallery');window.openProcessWork?.(item.processWork);}
    else{restoreViewer();image.hidden=false;image.alt=getGalleryTitle(item);image.onload=()=>{if(version!==selectionVersion||currentItem?.id!==item.id)return;error.hidden=true;};image.onerror=()=>{if(version!==selectionVersion||currentItem?.id!==item.id)return;image.hidden=true;error.hidden=false;error.textContent=t.error;};image.src=item.img;}
    dialog.scrollTop=0;
    if(opening)$('artwork-dialog-close').focus();
  };
  function step(dir){const items=filtered();if(items.length<2)return;const index=items.findIndex(item=>item.id===currentItem?.id);window.openGalleryArtwork(items[(index+dir+items.length)%items.length].id);}
  $('artwork-dialog-close').onclick=close;$('artwork-dialog-prev').onclick=()=>step(-1);$('artwork-dialog-next').onclick=()=>step(1);
  $('artwork-dialog-prices').onclick=()=>{const work=currentItem?.processWork;close();if(work)openArtworkProcess(work);else switchPage('pricing');};
  dialog.addEventListener('close',finishClose);dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}});
  dialog.addEventListener('keydown',event=>{if($('art-process')?.querySelector('dialog[open]'))return;if(event.target.closest('input,textarea,select,[contenteditable=true]'))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}});
  document.querySelectorAll('.ptab-btn').forEach(button=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('.ptab-btn')];const i=tabs.indexOf(button);const next=event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):tabs[(i+(event.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length];switchPricingTab(next.dataset.t);next.focus();}));
})();

