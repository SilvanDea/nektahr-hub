
(() => {
  window.renderPricingSamples=()=>{
    const grid=document.getElementById('pricing-samples-grid');if(!grid)return;
    const lang=document.documentElement.lang;
    const t={en:{open:'Open example',versions:'SFW / NSFW versions on fan art ↗',process:'Drawing stages',ych:'Template → Color Sketch + Alt',fanart:'Fan art · SFW / NSFW'},ru:{open:'Открыть пример',versions:'SFW / NSFW: пример версий на фан-арте ↗',process:'Этапы рисования',ych:'Шаблон → Цветной скетч + Альт',fanart:'Фан-арт · SFW / NSFW'},es:{open:'Abrir ejemplo',versions:'SFW / NSFW: versiones de fan art ↗',process:'Etapas de dibujo',ych:'Plantilla → Boceto a color + Alt',fanart:'Fan art · SFW / NSFW'}}[lang];
    document.getElementById('fanart-version-link').textContent=t.versions;
    const ids=currentPricingTab==='ych'?[4,5,6]:[1,2,7];grid.replaceChildren();
    ids.forEach(id=>{
      const item=GALLERY_ITEMS.find(x=>x.processWork===id);const button=document.createElement('button');button.type='button';button.className='pricing-sample';button.onclick=()=>openLightbox(item.id);
      const frame=document.createElement('div');frame.className='sample-thumb';frame.classList.toggle('is-blurred',item.nsfw&&!showNsfwGallery);
      const img=document.createElement('img');img.src=item.img;img.alt='';img.loading='lazy';img.decoding='async';frame.append(img);
      if(item.nsfw){const badge=document.createElement('span');badge.className='sample-adult';badge.textContent='NSFW · 18+';frame.append(badge)}
      const text=document.createElement('div');text.className='sample-label';const name=document.createElement('strong');name.textContent=getGalleryTitle(item);const desc=document.createElement('small');desc.textContent=id===7?({en:'Line + Color → Full Render · previous stage',ru:'Лайн + цвет → Рендер · прежний уровень',es:'Líneas + color → Render · nivel anterior'})[lang]:id===4?t.ych:id>=5?({en:'Template → Finished example',ru:'Шаблон → Готовый пример',es:'Plantilla → Ejemplo terminado'})[lang]:t.process;const action=document.createElement('span');action.textContent=t.open+' ↗';text.append(name,desc,action);button.append(frame,text);grid.append(button);
    });
  };
  const update=updatePricingPresentation;window.updatePricingPresentation=function(){update();window.renderPricingSamples();};
  const render=renderGalleryGrid;window.renderGalleryGrid=function(){render();window.renderPricingSamples();};
  window.renderPricingSamples();
})();