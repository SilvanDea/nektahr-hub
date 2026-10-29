/* Contact shortcuts and artist-confirmed intake status; no messages are sent automatically. */
(() => {
  const $=id=>document.getElementById(id);
  const texts={
    en:{discord:'Open Discord',email:'Email me',hint:'Copy the request, open my Discord profile and send it to me. Or use email.',copied:'Request copied. Send it on Discord or paste it into your email.',failed:'Could not copy. Open the message preview below and copy it manually.',open:'Commissions open',intake:'I’m accepting orders. Timing is agreed for each project.',subject:'Art commission request',body:'Hi Nek’tahr! I would like to discuss an art order.\n\nI will paste my request and attach references here.',done:'Copied'},
    ru:{discord:'Открыть Discord',email:'Написать на почту',hint:'Скопируй заявку, открой мой профиль Discord и отправь её мне. Или напиши на почту.',copied:'Заявка скопирована. Отправь её в Discord или вставь в письмо.',failed:'Не удалось скопировать. Открой текст заявки ниже и скопируй вручную.',open:'Принимаю заказы',intake:'Принимаю заказы. Сроки согласуем для каждой работы.',subject:'Заявка на арт',body:'Привет, Nek’tahr! Хочу обсудить заказ арта.\n\nЗдесь я вставлю заявку и приложу референсы.',done:'Скопировано'},
    es:{discord:'Abrir Discord',email:'Escribir por email',hint:'Copia la solicitud, abre mi perfil de Discord y envíamela. También puedes usar email.',copied:'Solicitud copiada. Envíala por Discord o pégala en un email.',failed:'No se pudo copiar. Abre la vista previa y copia el texto manualmente.',open:'Encargos abiertos',intake:'Acepto encargos. Acordamos el plazo de cada proyecto.',subject:'Solicitud de ilustración',body:'¡Hola Nek’tahr! Quisiera consultar un encargo.\n\nAquí pegaré mi solicitud y adjuntaré referencias.',done:'Copiado'}
  };
  const emailText={en:{title:'Write to Nek’tahr',copy:'Copy email address',gmail:'Open Gmail',app:'Open email app',note:'Copy the address and your request into your preferred email service. The email-app link needs a configured mail app.',copied:'Email address copied: nektahr@gmail.com',failed:'Could not copy. Select the address above and copy it manually.',close:'Close email options'},ru:{title:'Написать Nek’tahr',copy:'Скопировать адрес',gmail:'Открыть Gmail',app:'Открыть почтовую программу',note:'Скопируй адрес и заявку в свою почту. Последняя ссылка работает, если на устройстве настроена почтовая программа.',copied:'Адрес скопирован: nektahr@gmail.com',failed:'Не удалось скопировать. Выдели адрес выше и скопируй вручную.',close:'Закрыть варианты связи'},es:{title:'Escribir a Nek’tahr',copy:'Copiar dirección',gmail:'Abrir Gmail',app:'Abrir aplicación de correo',note:'Copia la dirección y la solicitud en tu correo. El último enlace necesita una aplicación de correo configurada.',copied:'Dirección copiada: nektahr@gmail.com',failed:'No se pudo copiar. Selecciona la dirección de arriba y cópiala manualmente.',close:'Cerrar opciones de correo'}};
  let emailTrigger;
  function openEmail(opener){emailTrigger=opener;$('email-contact-dialog').showModal();$('email-copy-address').focus();}
  function emailDialog(){const c=t(),e=emailText[currentLang]||emailText.en;let dialog=$('email-contact-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='email-contact-dialog';dialog.setAttribute('aria-labelledby','email-contact-title');const close=document.createElement('button'),title=document.createElement('h2'),address=document.createElement('p'),buttons=document.createElement('div'),copy=document.createElement('button'),gmail=document.createElement('a'),app=document.createElement('a'),note=document.createElement('p'),status=document.createElement('p');close.type=copy.type='button';close.id='email-contact-close';close.textContent='×';close.onclick=()=>dialog.close();title.id='email-contact-title';address.id='email-contact-address';address.textContent='nektahr@gmail.com';copy.id='email-copy-address';copy.onclick=async()=>{const ok=await copyToClipboard('nektahr@gmail.com','Email');$('email-contact-status').textContent=emailText[currentLang][ok?'copied':'failed'];};gmail.id='email-open-gmail';gmail.href='https://mail.google.com/';gmail.target='_blank';gmail.rel='noopener noreferrer';app.id='email-open-app';note.id='email-contact-note';status.id='email-contact-status';status.setAttribute('role','status');buttons.append(copy,gmail,app);dialog.append(close,title,address,buttons,note,status);document.body.append(dialog);dialog.addEventListener('close',()=>{emailTrigger?.focus();status.textContent='';});}
    $('email-contact-title').textContent=e.title;$('email-contact-close').setAttribute('aria-label',e.close);$('email-copy-address').textContent=e.copy;$('email-open-gmail').textContent=e.gmail;$('email-open-app').textContent=e.app;$('email-open-app').href='mailto:nektahr@gmail.com?subject='+encodeURIComponent(c.subject)+'&body='+encodeURIComponent(c.body);$('email-contact-note').textContent=e.note;
    document.querySelectorAll('a[href^="mailto:"]').forEach(link=>{if(link.id!=='email-open-app')link.onclick=event=>{event.preventDefault();openEmail(link);};});
  }
  const t=()=>texts[currentLang]||texts.en;
  let messageKey='',copyTimer,lastCopied='';

  function decorateContacts(){
    const marks=[
      ['discord','◉','discord'],['mailto:','✉','email'],['t.me','➤','telegram'],
      ['deviantart','DA','deviantart'],['twitter','𝕏','x'],['x.com','𝕏','x'],
      ['commishes','YCH','ych'],['ych.art','YCH','ych'],['furaffinity','FA','fa'],
      ['pixiv','pixiv','pixiv'],['ko-fi','☕','kofi'],['patreon','P','patreon']
    ];
    document.querySelectorAll('#primary-contacts-grid>a,#primary-contacts-grid>button,#platforms-grid>a,#platforms-grid>div').forEach(card=>{
      if(card.querySelector('.contact-site-icon'))return;
      const key=(card.getAttribute('href')||card.textContent).toLowerCase();
      const mark=marks.find(([match])=>key.includes(match));if(!mark)return;
      const icon=document.createElement('span');icon.className='contact-site-icon site-'+mark[2];icon.setAttribute('aria-hidden','true');icon.textContent=mark[1];
      const brandPaths={
        discord:'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.609 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.618-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.675 4.37a.07.07 0 0 0-.032.027C.533 9.045-.319 13.579.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.095 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.095 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z',
        telegram:'M23.91 3.79 20.3 20.84c-.27 1.2-.98 1.5-1.98.94l-5.5-4.05-2.66 2.56c-.3.3-.55.55-1.13.55l.4-5.6L19.62 5.9c.44-.4-.1-.62-.68-.23L6.35 13.6.93 11.9c-1.18-.37-1.2-1.18.25-1.75L22.4 1.97c.98-.36 1.84.24 1.51 1.82z'
      };
      if(brandPaths[mark[2]]){
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','24');svg.setAttribute('height','24');svg.setAttribute('fill','currentColor');svg.setAttribute('aria-hidden','true');
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',brandPaths[mark[2]]);svg.append(path);icon.replaceChildren(svg);
      }
      card.prepend(icon);card.classList.add('contact-with-icon');
    });
  }

  function update(){const c=t();emailDialog();let actions=$('quote-contact-actions');if(!actions){actions=document.createElement('div');actions.id='quote-contact-actions';const buttons=document.createElement('div'),discord=document.createElement('a'),email=document.createElement('button'),hint=document.createElement('p'),status=document.createElement('p');discord.id='quote-discord';discord.href='https://discord.com/users/361511957129461781';discord.target='_blank';discord.rel='noopener noreferrer';email.id='quote-email';email.type='button';email.onclick=()=>openEmail(email);hint.id='quote-send-hint';status.id='quote-copy-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');buttons.append(discord,email);actions.append(buttons,hint,status);$('calc-copy-btn').after(actions);}
    $('quote-discord').textContent=c.discord;$('quote-discord').title='drintrava';$('quote-email').textContent=c.email;$('quote-email').setAttribute('aria-haspopup','dialog');$('quote-send-hint').textContent=c.hint;$('quote-copy-status').textContent=messageKey?c[messageKey]:'';
    $('header-status-badge').textContent=c.open;let badge=$('contacts-intake');if(!badge){badge=document.createElement('p');badge.id='contacts-intake';$('contacts-title').after(badge);}badge.textContent=c.open;
    let intake=$('commission-intake');if(!intake){intake=document.createElement('p');intake.id='commission-intake';$('q-sub').after(intake);}intake.textContent=c.intake;
    decorateContacts();
    const grid=$('primary-contacts-grid');if(grid?.children.length===3){const email=grid.querySelector('a[href="mailto:nektahr@gmail.com"]');if(email){grid.insertBefore(email,grid.children[1]);const label=email.querySelector('span.text-textDim');if(label)label.textContent=({en:'Art orders & questions',ru:'Заказы и вопросы',es:'Encargos y consultas'})[currentLang];}}
  }
  window.copyCalcRequest=async function(){recalcTotal();const txt=$('calc-preview-text').textContent;const ok=await copyToClipboard(txt,'DM Order Request');messageKey=ok?'copied':'failed';if(ok)lastCopied=txt;clearTimeout(copyTimer);update();if(ok){$('calc-copy-btn').textContent=t().done;copyTimer=setTimeout(()=>{$('calc-copy-btn').textContent=({en:'Copy request',ru:'Скопировать заявку',es:'Copiar solicitud'})[currentLang];},2000);}else{$('calc-preview-text').parentElement.open=true;}};
  const recalc=recalcTotal;window.recalcTotal=function(){recalc();if(messageKey==='copied'&&$('calc-preview-text').textContent!==lastCopied){messageKey='';update();}};
  const render=renderAllText;window.renderAllText=function(){render();update();};
  update();
})();
