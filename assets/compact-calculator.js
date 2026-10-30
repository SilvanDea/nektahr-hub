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
  function selection(){const c=t();let saving=document.getElementById('quote-bundle-saving');if(!saving){saving=document.createElement('small');saving.id='quote-bundle-saving';saving.style.cssText='display:block;color:#8ee6af;font-size:12px;margin-top:6px;text-align:right';document.getElementById('calc-total-value')?.parentElement.append(saving);}const ychBundle=currentPricingTab==='ych'&&document.getElementById('calc-stage-sel')?.value==='160';const customBundle=currentPricingTab==='custom'&&document.getElementById('calc-stage-sel')?.value==='single'&&['nsfw','furry','futa'].some(id=>CALC_MODE_STATE.custom.quantities?.[id]);saving.textContent=ychBundle||customBundle?({en:'Bundle saving: $10',ru:'Экономия комплекта: $10',es:'Ahorro del paquete: $10'})[currentLang]:'';
const tier=Number(document.getElementById('calc-stage-sel')?.value);
saving.removeAttribute('title');
let explanation=$('quote-saving-details');
if(!explanation){explanation=document.createElement('details');explanation.id='quote-saving-details';saving.after(explanation);}
explanation.hidden=true;explanation.replaceChildren();
const lc=({en:{how:'How it is calculated',base:'Base adopt',render:'Render upgrade',alt:'Included alt version',expressions:'Included expressions',art:'Bonus color-sketch artwork',back:'Back view',details:'Two close-ups',nsfw:'Included NSFW version',separate:'Separately',bundle:'Tier price',note:'Estimate using known separate rates. Unpriced work and purchased extras are excluded. This is not a claim that every higher tier has a larger discount.',partial:'An agreed custom alternative is not valued here.'},ru:{how:'Как посчитано',base:'База адопта',render:'Улучшение рендера',alt:'Включённая альт-версия',expressions:'Включённые эмоции',art:'Бонусный цветной скетч',back:'Вид сзади',details:'Два крупных плана',nsfw:'Включённая NSFW-версия',separate:'По отдельности',bundle:'Цена тира',note:'Оценка по известным отдельным тарифам. Неоценённая работа и докупленные extras исключены. Более высокий тир не обязательно даёт большую скидку.',partial:'Другая согласованная альтернатива здесь не оценена.'},es:{how:'Cómo se calcula',base:'Adopt base',render:'Mejora de render',alt:'Versión alt incluida',expressions:'Expresiones incluidas',art:'Boceto a color adicional',back:'Vista trasera',details:'Dos detalles',nsfw:'Versión NSFW incluida',separate:'Por separado',bundle:'Precio del nivel',note:'Estimación con tarifas conocidas. Sin trabajo no valorado ni extras comprados. Un nivel superior no implica un descuento mayor.',partial:'La alternativa personalizada no está valorada aquí.'}})[currentLang];
if(currentPricingTab==='adopt'&&tier>=200){
 const variant=CALC_MODE_STATE.adopt.includedVariant||'nsfw';
 const nsfwBase=Boolean(CALC_MODE_STATE.adopt.baseNsfw)||tier>=500||variant==='nsfw';
 const alt=variant==='other'?0:variant==='futa'&&nsfwBase?25:50;
 const components=[[lc.base,100],[lc.render,100]];
 if(alt)components.push([lc.alt,alt]);
 components.push([lc.expressions,tier>=500?75:25]);
 if(tier>=350)components.push([lc.art,120]);
 if(tier>=500){components.push([lc.back,55],[lc.details,50]);if(variant!=='nsfw')components.push([lc.nsfw,50]);}
 const separate=components.reduce((sum,row)=>sum+row[1],0),difference=separate-tier;
 saving.textContent=difference>0?({en:'Estimated saving on priced inclusions: $',ru:'Экономия на оценённых включениях: $',es:'Ahorro estimado en elementos valorados: $'})[currentLang]+difference:'';
 const summary=document.createElement('summary');summary.textContent=lc.how;explanation.append(summary);
 for(const [name,value]of [...components,[lc.separate,separate],[lc.bundle,tier]]){const row=document.createElement('div');row.className='quote-line';const label=document.createElement('span'),cost=document.createElement('span');label.textContent=name;cost.textContent='$'+value;row.append(label,cost);explanation.append(row);}
 const note=document.createElement('p');note.textContent=lc.note+(variant==='other'?' '+lc.partial:'');explanation.append(note);explanation.hidden=false;
}else if(ychBundle||customBundle){
 const summary=document.createElement('summary');summary.textContent=lc.how;const p=document.createElement('p');p.textContent=ychBundle?'$120 + $50 − $160 = $10':'$200 + $50 − $240 = $10';explanation.append(summary,p);explanation.hidden=false;
}
saving.style.textAlign='left';


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
