/* Compact calculator presentation only. Pricing content and calculation formulas are unchanged. */
(() => {
  const $=id=>document.getElementById(id);
  const copy={"en":{"calc":"Estimate","request":"Copy request","brief":"References & brief","estimate":"Final price confirmed before payment.","versions":"Versions & outfits","more":"Other extras","selected":"selected","extrasHint":"NSFW / furry / futa · outfits · expressions","moreHint":"Weapons · background · privacy · rush","characterRule":"Second +$100 · each further +$80","futa":"Futa: $25 with an NSFW base/version; otherwise $50.","bundle":"One alt version included. Tier IV also includes NSFW.","count":"Characters"},"ru":{"calc":"Расчёт цены","request":"Скопировать заявку","brief":"Референсы и описание","estimate":"Итоговую цену подтвердим до оплаты.","versions":"Версии и наряды","more":"Другие дополнения","selected":"выбрано","extrasHint":"NSFW / furry / futa · наряды · эмоции","moreHint":"Оружие · фон · приватность · срочность","characterRule":"Второй +$100 · каждый следующий +$80","futa":"Futa: $25 с NSFW-основой/версией, иначе $50.","bundle":"Одна альт-версия включена. В Tier IV также включена NSFW.","count":"Персонажи"},"es":{"calc":"Presupuesto","request":"Copiar solicitud","brief":"Referencias y descripción","estimate":"Precio final confirmado antes del pago.","versions":"Versiones y atuendos","more":"Otros extras","selected":"seleccionados","extrasHint":"NSFW / furry / futa · atuendos · expresiones","moreHint":"Armas · fondo · privacidad · urgencia","characterRule":"Segundo +$100 · siguientes +$80","futa":"Futa: $25 con base/versión NSFW; si no, $50.","bundle":"Una versión alt incluida. Tier IV también incluye NSFW.","count":"Personajes"}};
  const t=()=>copy[currentLang]||copy.en;
  const set=(id,value)=>{if($(id))$(id).textContent=value;};
  const openState={};
  function disclosure(key,title,hint){const el=document.createElement('details');el.className='compact-option-group';el.dataset.compactGroup=key;el.open=Boolean(openState[key]);const summary=document.createElement('summary'),heading=document.createElement('span'),sub=document.createElement('small'),badge=document.createElement('b');heading.textContent=title;sub.textContent=hint;badge.className='compact-selection-count';summary.append(heading,badge,sub);el.append(summary);el.addEventListener('toggle',()=>openState[key]=el.open);return el;}
  function calculator(){const c=t(),body=$('calc-dynamic-body');$('calc-stage-sel')?.setAttribute('aria-label',({en:'Finish / package',ru:'Уровень / пакет',es:'Acabado / paquete'})[currentLang]);if(!body?.children[1])return;const base=body.children[0],extras=body.children[1],options=body.querySelector('.quote-count-options');if(!options)return;
    const versions=disclosure('versions',c.versions,c.extrasHint),more=disclosure('more',currentPricingTab==='custom'?({en:'Order conditions',ru:'Условия заказа',es:'Condiciones del encargo'})[currentLang]:c.more,currentPricingTab==='custom'?({en:'Privacy · rush · individual quotes',ru:'Приватность · срочность · индивидуальный расчёт',es:'Privacidad · urgencia · presupuesto individual'})[currentLang]:c.moreHint);const toggles=body.querySelector('.quote-version-toggles');if(toggles)versions.append(toggles);
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
  // Only explicitly included bonuses are valued; this is not a discount calculation.
  function adoptBonuses(tier,variant,baseNsfw){
    if(tier<200)return [];
    const nsfwIncluded=tier>=450||variant==='nsfw';
    const alt=variant==='other'?0:variant==='futa'&&(baseNsfw||nsfwIncluded)?25:50;
    const rows=[];
    if(alt)rows.push(['alt',alt]);
    rows.push(['expressions',tier>=450?75:25]);
    if(tier>=300)rows.push(['art',120]);
    if(tier>=450&&variant!=='nsfw')rows.push(['nsfw',50]);
    return rows;
  }
  window.calculateAdoptBonuses=adoptBonuses;
  function selection(){const c=t();let saving=$('quote-bundle-saving');if(!saving){saving=document.createElement('small');saving.id='quote-bundle-saving';saving.style.cssText='display:block;color:#8ee6af;font-size:12px;margin-top:6px;text-align:left';$('calc-total-value')?.parentElement.append(saving);}
    saving.removeAttribute('title');saving.textContent='';saving.hidden=true;
    let explanation=$('quote-saving-details');if(!explanation){explanation=document.createElement('section');explanation.id='quote-saving-details';}
    explanation.hidden=true;explanation.replaceChildren();$('calc-breakdown-list')?.append(explanation);
    const lc=({
      en:{how:'Included bonuses · breakdown',label:'Priced bonuses included: $',alt:'Included alt version',expressions:'Included extra expressions',art:'Bonus color sketch',nsfw:'Additional NSFW version',total:'Bonus value',note:'Value of the listed bonuses at separate rates, not a discount on the package. Base design, rendering, reference sheet and purchased extras are excluded. An agreed custom alternative is not valued. The same version is counted once.'},
      ru:{how:'Включённые бонусы · состав',label:'Включены оценённые бонусы на $',alt:'Включённая альт-версия',expressions:'Включённые дополнительные эмоции',art:'Бонусный цветной скетч',nsfw:'Дополнительная NSFW-версия',total:'Стоимость бонусов',note:'Стоимость перечисленных бонусов по отдельным тарифам, а не скидка на пакет. База, рендер, референс и докупленные дополнения не учитываются. Другая согласованная альтернатива не оценена. Одна и та же версия считается один раз.'},
      es:{how:'Bonos incluidos · desglose',label:'Bonos valorados incluidos: $',alt:'Versión alt incluida',expressions:'Expresiones extra incluidas',art:'Boceto a color adicional',nsfw:'Versión NSFW adicional',total:'Valor de los bonos',note:'Valor de los bonos indicados con tarifas separadas, no un descuento del paquete. No incluye diseño base, render, referencia ni extras comprados. La alternativa personalizada no está valorada. Cada versión se cuenta una sola vez.'}
    })[currentLang]||null;
    const tier=Number($('calc-stage-sel')?.value);
    if(currentPricingTab==='adopt'&&tier>=200){
      const s=CALC_MODE_STATE.adopt,components=adoptBonuses(tier,s.includedVariant||'nsfw',Boolean(s.baseNsfw));
      const total=components.reduce((sum,row)=>sum+row[1],0);
      saving.hidden=false;saving.textContent=lc.label+total;
      const heading=document.createElement('h4');heading.textContent=lc.how;heading.style.cssText='margin:12px 0 8px;padding-top:12px;border-top:1px solid rgba(228,182,117,.18);font-size:12px;font-weight:600;color:var(--accent,#e4b675)';explanation.append(heading);
      for(const [key,value]of [...components,['total',total]]){const row=document.createElement('div');row.className='quote-line';const label=document.createElement('span'),cost=document.createElement('span');label.textContent=lc[key];cost.textContent='$'+value;row.append(label,cost);explanation.append(row);}
      const note=document.createElement('p');note.textContent=lc.note;explanation.append(note);explanation.hidden=false;
    }
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

