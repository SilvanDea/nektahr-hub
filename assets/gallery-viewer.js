
(() => {
  const $=id=>document.getElementById(id);
  const dialog=$('artwork-dialog');let currentItem=null,returnFocus=null,viewerParent=null,sessionItems=[];
  const text=()=>({en:{close:'Close preview',prev:'Previous artwork',next:'Next artwork',prices:'View prices →',hint:'Use ← / → to browse. Escape closes the preview.',error:'This image could not load. Please try again.'},es:{close:'Cerrar vista',prev:'Obra anterior',next:'Obra siguiente',prices:'Ver precios →',hint:'Usa ← / → para navegar. Escape cierra la vista.',error:'No se pudo cargar la imagen. Inténtalo de nuevo.'},ru:{close:'Закрыть просмотр',prev:'Предыдущая работа',next:'Следующая работа',prices:'Посмотреть цены →',hint:'← / → — другие работы. Escape — закрыть просмотр.',error:'Не удалось загрузить изображение. Попробуй ещё раз.'}})[document.documentElement.lang]||{close:'Close',prev:'Previous',next:'Next',prices:'Pricing',hint:'',error:'Image unavailable'};
  const filtered=()=>sessionItems;
  function itemsForOpening(item){
    const page=document.body.dataset.page;
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
  window.openGalleryArtwork=id=>{
    const item=GALLERY_ITEMS.find(x=>x.id===Number(id));if(!item)return;
    const opening=!dialog.open;if(opening)sessionItems=itemsForOpening(item);if(!sessionItems.some(x=>x.id===item.id))return;if(opening){returnFocus=document.activeElement;viewerParent=$('art-process').parentElement;dialog.showModal();document.body.classList.add('artwork-modal-open');}
    currentItem=item;const strip=$('artwork-work-strip');strip.replaceChildren();sessionItems.filter(x=>x.processWork&&sessionItems.length>1&&sessionItems.length<15).forEach(work=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed',String(work.id===item.id));if(work.nsfw&&!showNsfwGallery)button.className='strip-adult';const thumb=document.createElement('img');thumb.src=work.img;thumb.alt='';thumb.loading='lazy';thumb.decoding='async';const title=document.createElement('span');title.textContent=getGalleryTitle(work);if(work.nsfw&&!showNsfwGallery)title.textContent+=' · 18+';button.append(thumb,title);button.onclick=()=>window.openGalleryArtwork(work.id);strip.append(button)});const t=text();$('artwork-dialog-title').textContent=getGalleryTitle(item);const items=filtered();$('artwork-dialog-prev').disabled=items.length<2;$('artwork-dialog-next').disabled=items.length<2;$('artwork-dialog-prices').hidden=document.body.dataset.page==='pricing';$('artwork-dialog-counter').textContent=[getGalleryKind(item),getGallerySeries(item),`${items.findIndex(x=>x.id===item.id)+1} / ${items.length}`].filter(Boolean).join(' · ');
    $('artwork-dialog-close').setAttribute('aria-label',t.close);$('artwork-dialog-prev').setAttribute('aria-label',t.prev);$('artwork-dialog-next').setAttribute('aria-label',t.next);$('artwork-dialog-prices').textContent=t.prices;$('artwork-dialog-hint').textContent=t.hint;
    const body=$('artwork-dialog-body'),image=$('artwork-dialog-image'),error=$('artwork-dialog-error');error.hidden=true;
    if(item.processWork){image.hidden=true;body.append($('art-process'));$('art-process').hidden=false;window.setProcessContext?.('gallery');window.openProcessWork?.(item.processWork);}
    else{restoreViewer();image.hidden=false;image.alt=getGalleryTitle(item);image.onload=()=>error.hidden=true;image.onerror=()=>{image.hidden=true;error.hidden=false;error.textContent=t.error;};image.src=item.img;}
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
