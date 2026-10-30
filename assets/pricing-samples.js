
(() => {
  window.renderPricingSamples=()=>{
    const grid=document.getElementById('pricing-samples-grid');if(!grid)return;
    const lang=document.documentElement.lang;
    const t={en:{open:'Open example',versions:'Other examples ↗',process:'Drawing stages',ych:'Template → Color Sketch + Alt',fanart:'Fan art · SFW / NSFW'},ru:{open:'Открыть пример',versions:'Другие примеры ↗',process:'Этапы рисования',ych:'Шаблон → Цветной скетч + Альт',fanart:'Фан-арт · SFW / NSFW'},es:{open:'Abrir ejemplo',versions:'Otros ejemplos ↗',process:'Etapas de dibujo',ych:'Plantilla → Boceto a color + Alt',fanart:'Fan art · SFW / NSFW'}}[lang];
    document.getElementById('fanart-version-link').textContent=t.versions;
    const extra=(window.PORTFOLIO_WORKS||[]).filter(w=>w.pricingExample===currentPricingTab).map(w=>w.id);const ids=currentPricingTab==='ych'?[4,5,6,...extra]:currentPricingTab==='adopt'?extra:[1,2,...extra];grid.dataset.count=ids.length;grid.replaceChildren();if(currentPricingTab==='adopt')document.getElementById('pricing-examples-label').textContent=({en:'Base design, render & versions · separate examples',ru:'База, рендер и версии · отдельные примеры',es:'Base, render y versiones · ejemplos independientes'})[lang];
    if(currentPricingTab==='ych')document.getElementById('pricing-examples-label').textContent=({en:'YCH finish & version examples · different works',ru:'Примеры исполнения и версий YCH · разные работы',es:'Ejemplos de acabados y versiones YCH · obras distintas'})[lang];
    ids.forEach(id=>{
      const item=GALLERY_ITEMS.find(x=>x.processWork===id);const data=(window.PORTFOLIO_WORKS||[]).find(w=>w.id===id);const button=document.createElement('button');button.type='button';button.className='pricing-sample';button.onclick=()=>openLightbox(item.id);
      const frame=document.createElement('div');frame.className='sample-thumb';frame.classList.toggle('is-blurred',item.nsfw&&!showNsfwGallery);
      const img=document.createElement('img');img.src=item.img;img.alt='';img.loading='lazy';img.decoding='async';frame.append(img);
      if(item.nsfw||data?.nsfw?.some(Boolean)||[3,4,5,6].includes(id)){const badge=document.createElement('span');badge.className='sample-adult';badge.textContent='NSFW · 18+';frame.append(badge)}
      const text=document.createElement('div');text.className='sample-label';const name=document.createElement('strong');name.textContent=getGalleryTitle(item);const desc=document.createElement('small');desc.textContent=data?.historicalNote?(data.historicalNote[lang]||data.historicalNote.en):data?.historicalTier==='AB'?'AB · 2024':data?.pricingExample==='adopt'?({en:'Design → Render → Alternative',ru:'Дизайн → Рендер → Альт',es:'Diseño → Render → Alternativa'})[lang]:data?.pricingExample==='ych'&&data.type==='editions'?'SFW / NSFW':id===7?({en:'Line + Color → Full Render · previous stage',ru:'Лайн + цвет → Рендер · прежний уровень',es:'Líneas + color → Render · nivel anterior'})[lang]:[4,5,6].includes(id)?(id===4?t.ych:({en:'Template → Color Sketch',ru:'Шаблон → Цветной скетч',es:'Plantilla → Boceto a color'})[lang]):id>=5?({en:'Template → Finished example',ru:'Шаблон → Готовый пример',es:'Plantilla → Ejemplo terminado'})[lang]:t.process;const action=document.createElement('span');action.textContent=t.open+' ↗';text.append(name,desc,action);button.append(frame,text);grid.append(button);
    });
  };
  const update=updatePricingPresentation;window.updatePricingPresentation=function(){update();window.renderPricingSamples();};
  const render=renderGalleryGrid;window.renderGalleryGrid=function(){render();window.renderPricingSamples();};
  window.renderPricingSamples();
})();