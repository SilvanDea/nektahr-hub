/* Compact calculator presentation only. Pricing content and calculation formulas are unchanged. */
(() => {
  const $=id=>document.getElementById(id);
  const copy={"en":{"calc":"Estimate","request":"Copy request","brief":"References & brief","estimate":"Final price confirmed before payment.","versions":"Versions & outfits","more":"Other extras","selected":"selected","extrasHint":"NSFW / furry / futa · outfits · expressions","moreHint":"Weapons · background · privacy · rush","characterRule":"Second +$100 · each further +$80","futa":"Futa: $25 with an NSFW base/version; otherwise $50.","bundle":"One alt version included. Tier IV also includes NSFW.","count":"Characters"},"ru":{"calc":"Расчёт цены","request":"Скопировать заявку","brief":"Референсы и описание","estimate":"Итоговую цену подтвердим до оплаты.","versions":"Версии и наряды","more":"Другие дополнения","selected":"выбрано","extrasHint":"NSFW / furry / futa · наряды · эмоции","moreHint":"Оружие · фон · приватность · срочность","characterRule":"Второй +$100 · каждый следующий +$80","futa":"Futa: $25 с NSFW-основой/версией, иначе $50.","bundle":"Одна альт-версия включена. В Tier IV также включена NSFW.","count":"Персонажи"},"es":{"calc":"Presupuesto","request":"Copiar solicitud","brief":"Referencias y descripción","estimate":"Precio final confirmado antes del pago.","versions":"Versiones y atuendos","more":"Otros extras","selected":"seleccionados","extrasHint":"NSFW / furry / futa · atuendos · expresiones","moreHint":"Armas · fondo · privacidad · urgencia","characterRule":"Segundo +$100 · siguientes +$80","futa":"Futa: $25 con base/versión NSFW; si no, $50.","bundle":"Una versión alt incluida. Tier IV también incluye NSFW.","count":"Personajes"}};
  const t=()=>copy[currentLang]||copy.en;
  const set=(id,value)=>{if($(id))$(id).textContent=value;};
  const openState={};
  function disclosure(key,title,hint){const el=document.createElement('details');el.className='compact-option-group';el.dataset.compactGroup=key;el.open=Boolean(openState[key]);const summary=document.createElement('summary'),heading=document.createElement('span'),sub=document.createElement('small'),badge=document.createElement('b');heading.textContent=title;sub.textContent=hint;badge.className='compact-selection-count';summary.append(heading,badge,sub);el.append(summary);el.addEventListener('toggle',()=>openState[key]=el.open);return el;}
  function calculator(){const c=t(),body=$('calc-dynamic-body');$('calc-stage-sel')?.setAttribute('aria-label',({en:'Finish / package',ru:'Уровень / пакет',es:'Acabado / paquete'})[currentLang]);if(!body?.children[1])return;const base=body.children[0],extras=body.children[1],options=body.querySelector('.quote-count-options');if(!options)return;
    const versions=disclosure('versions',c.versions,c.extrasHint),more=disclosure('more',c.more,c.moreHint);const toggles=body.querySelector('.quote-version-toggles');if(toggles)versions.append(toggles);
    options.querySelectorAll('[data-quantity-row="expression"],[data-quantity-row="outfit"],.quote-existing-label').forEach(el=>{if(el.querySelector('#quote-discount-request'))more.append(el);else versions.append(el);});
    const nsfwNote=options.querySelector('.quote-unpriced-note');if(nsfwNote){nsfwNote.textContent=c.futa;versions.append(nsfwNote);}
    const other=options.querySelector('.quote-more-options');if(other){other.querySelectorAll('[data-quantity-row],p').forEach(el=>more.append(el));other.remove();}
    extras.querySelectorAll('.calc-addon-check,.calc-mult-check').forEach(input=>more.append(input.closest('label')));
    options.remove();extras.remove();body.append(versions,more);
    const note=base.querySelector('.quote-character-range p');if(note)note.textContent=c.characterRule;
    const bundle=base.querySelector('.quote-included-group p');if(bundle){bundle.textContent=c.bundle.replace('. ','.'+String.fromCharCode(10));bundle.style.whiteSpace='pre-line';}
    set('quote-character-output',$('quote-character-count')?.value||'1');const label=base.querySelector('label[for="quote-character-count"]');if(label)label.textContent=c.count;
    set('calc-title',c.calc);set('calc-copy-btn',c.request);set('calc-brief-summary',c.brief);selection();
  }
  function selection(){const c=t();let saving=document.getElementById('quote-bundle-saving');if(!saving){saving=document.createElement('small');saving.id='quote-bundle-saving';saving.style.cssText='display:block;color:#8ee6af;font-size:12px;margin-top:6px;text-align:right';document.getElementById('calc-total-value')?.parentElement.append(saving);}const ychBundle=currentPricingTab==='ych'&&document.getElementById('calc-stage-sel')?.value==='160';const customBundle=currentPricingTab==='custom'&&document.getElementById('calc-stage-sel')?.value==='single'&&['nsfw','furry','futa'].some(id=>CALC_MODE_STATE.custom.quantities?.[id]);saving.textContent=ychBundle||customBundle?({en:'Bundle saving: $10',ru:'Экономия комплекта: $10',es:'Ahorro del paquete: $10'})[currentLang]:'';const tier=Number(document.getElementById('calc-stage-sel')?.value);if(currentPricingTab==='adopt'&&tier>=200){const variant=CALC_MODE_STATE.adopt.includedVariant||'nsfw';const value=(tier>=500?75:25)+(variant==='other'?0:variant==='futa'?25:50)+(tier>=500&&variant!=='nsfw'?50:0);saving.textContent=({en:'Included extras separately: from $',ru:'Включённые дополнения отдельно: от $',es:'Extras incluidos por separado: desde $'})[currentLang]+value;saving.title='Versions and expressions only; not total package savings.';}
    document.querySelectorAll('.compact-option-group').forEach(group=>{let count=[...group.querySelectorAll('input[type="checkbox"]')].filter(x=>x.checked).length;group.querySelectorAll('[data-quote-quantity]').forEach(x=>count+=Number(x.value)||0);const badge=group.querySelector('.compact-selection-count');badge.textContent=count?'· '+count+' '+c.selected:'';});
    set('calc-estimate-note',c.estimate);const pending=$('calc-breakdown-list')?.textContent;if(pending?.includes(({en:'To quote',ru:'По согласованию',es:'A consultar'})[currentLang]))set('calc-estimate-note',c.estimate+' '+({en:'Some extras are quoted separately.',ru:'Часть дополнений оценивается отдельно.',es:'Algunos extras se presupuestan aparte.'})[currentLang]);
  }
  const build=buildIndividualCalculator;window.buildIndividualCalculator=function(){build();calculator();};
  const recalc=recalcTotal;window.recalcTotal=function(){recalc();selection();};
  buildIndividualCalculator();
})();

/* Apply explicit catalog destination after the default page initialization. */
window.addEventListener('load',()=>{
 if(document.body.dataset.page!=='pricing')return;
 const mode=new URLSearchParams(location.search).get('type');
 if(['adopt','ych'].includes(mode))switchPricingTab(mode);
});
