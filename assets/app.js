
    function showToast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('opacity-0');
      setTimeout(() => el.classList.add('opacity-0'), 2200);
    }

    async function copyToClipboard(val, label) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(val);
        } else {
          const ta = document.createElement('textarea');
          ta.value = val;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          const copied = document.execCommand('copy');
          document.body.removeChild(ta);
          if (!copied) throw new Error('Clipboard permission unavailable');
        }
        showToast(`${uiText('copied')}: ${label}`);
        return true;
      } catch (error) {
        showToast(uiText('copyFailed'));
        return false;
      }
    }

    // Page Navigation: each destination is a real static HTML route.
    const PAGE_PATHS = {
      board: "/",
      pricing: "/pricing/",
      catalog: "/catalog/",
      gallery: "/gallery/",
      queue: "/queue/",
      tos: "/terms/",
      faq: "/faq/"
    };

    function switchPage(pageId) {
      const targetPath = PAGE_PATHS[pageId] || PAGE_PATHS.board;
      const normalizePath = path => path.replace(/\/+$/, "") || "/";
      if (normalizePath(window.location.pathname) !== normalizePath(targetPath)) {
        window.location.href = targetPath;
        return;
      }

      currentPage = pageId;
      document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== `page-${pageId}`);
      });
      document.querySelectorAll('.nav-link').forEach(btn => {
        const active = btn.dataset.p === pageId;
        if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
        btn.className = active
          ? "nav-link px-2 py-1 text-accent border-b border-accent transition cursor-pointer"
          : "nav-link px-2 py-1 text-textMuted hover:text-textMain transition cursor-pointer";
      });
    }

    // Language Switching (EN main, ES, RU)
    function setLang(lang) {
      if(document.getElementById('calc-stage-sel'))saveCalculatorModeState(currentPricingTab);
      if (!I18N[lang]) lang = 'en';
      currentLang = lang;
      const skip=document.getElementById('skip-content');if(skip)skip.textContent=({en:'Skip to content',ru:'Перейти к содержимому',es:'Saltar al contenido'})[lang];
      try { localStorage.setItem('nektahr-hub-language', lang); } catch (_) {}
      document.documentElement.lang = lang;
      const pageMeta = {
        board: {
          en: ["Nek'tahr | Art, Prices, YCH, Adopts & ToS", "Character art, commission prices, YCH templates and adoptable designs by Nek'tahr. Browse the gallery, read the ToS and contact me on Discord or email."],
          es: ["Nek'tahr | Portafolio y comisiones", "Explora el portafolio de Nek'tahr, precios, adopts, opciones YCH y contactos."],
          ru: ["Nek'tahr | Портфолио и коммишки", "Портфолио Nek'tahr, цены, адопты, YCH и контакты."]
        },
        catalog: {en:["Catalog | Nek’tahr","Browse YCH templates and adoptable designs, availability and versions."],es:["Catálogo | Nek’tahr","Explora plantillas YCH, diseños adoptables, disponibilidad y versiones."],ru:["Каталог | Nek’tahr","Шаблоны YCH, адопты, доступность и версии."]},
        pricing: {
          en: ["Pricing | Nek'tahr Hub", "Commission pricing, adoptable tiers, YCH slots, and a quote calculator."],
          es: ["Precios | Nek'tahr Hub", "Precios de comisiones, adopts, plazas YCH y calculadora de presupuesto."],
          ru: ["Цены | Nek'tahr Hub", "Цены на коммишки, адопты, YCH и калькулятор стоимости."]
        },
        gallery: {
          en: ["Gallery | Nek'tahr Hub", "Browse Nek'tahr's art gallery, filter works, and view artwork details."],
          es: ["Galería | Nek'tahr Hub", "Explora la galería de Nek'tahr, filtra obras y consulta sus detalles."],
          ru: ["Галерея | Nek'tahr Hub", "Галерея Nek'tahr: фильтры работ и просмотр изображений."]
        },
        queue: {
          en: ["Commission Queue | Nek'tahr Hub", "View the current public commission queue and progress."],
          es: ["Cola de comisiones | Nek'tahr Hub", "Consulta la cola pública de comisiones y su progreso."],
          ru: ["Очередь заказов | Nek'tahr Hub", "Текущая публичная очередь заказов и прогресс."]
        },
        tos: {
          en: ["Terms of Service | Nek'tahr Hub", "Read the terms for commissions, adopts, and YCH."],
          es: ["Términos | Nek'tahr Hub", "Lee las condiciones de comisiones, adopts y YCH."],
          ru: ["Правила | Nek'tahr Hub", "Условия коммишек, адоптов и YCH."]
        },
        faq: {
          en: ["FAQ | Nek'tahr Hub", "Answers to common questions about commissions, payments, and artwork."],
          es: ["Preguntas frecuentes | Nek'tahr Hub", "Respuestas sobre comisiones, pagos y arte."],
          ru: ["FAQ | Nek'tahr Hub", "Ответы на частые вопросы о заказах, оплате и арте."]
        }
      };
      const localizedTitles = { en: "Nek'tahr | Art, Prices, YCH, Adopts & ToS", es: "Nek'tahr | Portafolio y comisiones", ru: "Nek'tahr | Портфолио и коммишки" };
      const localizedDescriptions = {
        en: "Explore Nek'tahr's SFW portfolio, commission pricing, adoptables, YCH options, terms, and contact links.",
        es: "Explora el portafolio SFW de Nek'tahr, precios de comisiones y adopts, opciones YCH, términos y contactos.",
        ru: "Публичное SFW-портфолио Nek'tahr, цены на коммишки и адоптов, варианты YCH, правила и контакты."
      };
      const activeMeta = (pageMeta[currentPage] || pageMeta.board)[lang] || pageMeta.board.en;
      document.title = activeMeta[0];
      document.querySelector('meta[name="description"]').content = activeMeta[1];
      document.querySelector('meta[property="og:title"]').content = activeMeta[0];
      document.querySelector('meta[property="og:description"]').content = activeMeta[1];
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content',activeMeta[0]);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content',activeMeta[1]);
      document.querySelectorAll('.lang-btn').forEach(btn => {
        const active = btn.dataset.l === lang;
        btn.className = active
          ? "lang-btn px-2 py-0.5 bg-accent text-bg font-medium transition cursor-pointer"
          : "lang-btn px-2 py-0.5 text-textDim hover:text-textMain transition cursor-pointer";
      });
      renderAllText();
    }

    // Pricing Sub-tabs (Customs / Adopts / YCH)
    function switchPricingTab(tabKey) {
      saveCalculatorModeState(currentPricingTab);
      currentPricingTab = tabKey;
      ['custom', 'adopt', 'ych'].forEach(k => {
        document.getElementById(`pricing-view-${k}`).classList.toggle('hidden', k !== tabKey);
        const btn = document.getElementById(`ptab-${k}`);btn.setAttribute('aria-selected',String(k===tabKey));btn.tabIndex=k===tabKey?0:-1;
        if (k === tabKey) {
          btn.className = "ptab-btn px-3 py-2.5 mono text-xs uppercase whitespace-nowrap truncate text-center bg-accent text-bg border border-accent font-medium transition cursor-pointer";
        } else {
          btn.className = "ptab-btn px-3 py-2.5 mono text-xs uppercase whitespace-nowrap truncate text-center text-textMuted border hairline hover:text-textMain transition cursor-pointer";
        }
      });
      buildIndividualCalculator();
    }

    function updatePricingPresentation() {
      const examples=document.getElementById('pricing-examples');if(!examples)return;
      const mode=currentPricingTab;
      const dock=document.getElementById(mode==='ych'?'process-dock-ych':mode==='adopt'?'process-dock-adopt':'process-dock-custom');
      dock.append(examples);examples.hidden=false;
      const labels={en:{custom:'Artwork examples & drawing stages',ych:'YCH template, result & alternative',brief:'Add references & brief (optional)'},es:{custom:'Ejemplos y etapas de dibujo',ych:'Plantilla YCH, resultado y alternativa',brief:'Añadir referencias y detalles (opcional)'},ru:{custom:'Примеры работ и этапы',ych:'Шаблон YCH, результат и альт',brief:'Добавить референсы и описание (необязательно)'}}[currentLang];
      document.getElementById('pricing-examples-label').textContent=mode==='ych'?labels.ych:labels.custom;
      document.getElementById('calc-brief-summary').textContent=labels.brief;
      window.setProcessContext?.(mode);
    }
    // Keep each category's selections when switching tabs.
    function saveCalculatorModeState(mode) {
      const state = CALC_MODE_STATE[mode];
      if (!state) return;
      const sel = document.getElementById('calc-stage-sel');
      if (sel) state.value = sel.value;
      state.addons = [...document.querySelectorAll('.calc-addon-check:checked')].map(el => el.dataset.id);
      state.mults = [...document.querySelectorAll('.calc-mult-check:checked')].map(el => el.dataset.id);
    }

    // Individual Calculator Builder per Category
    function buildIndividualCalculator() {
      updatePricingPresentation();
      const t = I18N[currentLang].calc, mode = currentPricingTab, cfg = CALC_CONFIG[mode], state = CALC_MODE_STATE[mode];
      document.getElementById('calc-category-pill').textContent = t.modes[mode];
      document.getElementById('calc-estimate-note').textContent = uiText('quoteEstimateNote');
      document.getElementById('calc-notes').placeholder = t.notesPlaceholder;
      ['quoteStepBrief','quoteRefsLabel','quoteDeadlineLabel','quoteContactLabel','quoteBriefLabel'].forEach((key, i) => {
        const ids = ['calc-step-brief','calc-refs-label','calc-deadline-label','calc-contact-label','calc-brief-label'];
        document.getElementById(ids[i]).textContent = uiText(key);
      });
      ['calc-refs','calc-deadline'].forEach((id, i) => document.getElementById(id).placeholder = uiText(i ? 'quoteDeadlinePlaceholder' : 'quoteRefsPlaceholder'));
      [...document.getElementById('calc-contact').options].forEach(opt => {
        opt.textContent = uiText(opt.value === 'Telegram' ? 'quoteContactTelegram' : opt.value === 'Discord' ? 'quoteContactDiscord' : 'quoteContactEmail');
      });
      document.getElementById('calc-dynamic-body').innerHTML = `
        <div class="space-y-3">
          <div class="mono text-[10px] uppercase tracking-widest text-accent">${uiText('quoteStepPackage')}</div>
          <label for="calc-stage-sel" class="block mono text-[10px] uppercase text-textDim mb-1.5">${mode === 'custom' ? ({en:'Commission package',es:'Paquete',ru:'Пакет заказа'})[currentLang] : mode === 'adopt' ? t.stageAdopt : t.stageYch}</label>
          <select id="calc-stage-sel" onchange="recalcTotal()" class="w-full bg-bg border hairline p-3 text-sm text-textMain focus:outline-none focus:border-accent">
            ${cfg.options.map((opt, i) => `<option value="${opt.value}" ${String(state.value) === String(opt.value) || (!state.value && i === 0) ? 'selected' : ''}>${opt.label[currentLang] || opt.label.en}</option>`).join('')}
          </select>
          <fieldset class="quote-packages" aria-label="${mode === 'custom' ? ({en:'Commission package',es:'Paquete',ru:'Пакет заказа'})[currentLang] : mode === 'adopt' ? t.stageAdopt : t.stageYch}">
            ${cfg.options.map((opt,i)=>`<label class="quote-package"><input type="radio" name="quote-package" value="${opt.value}" ${String(state.value)===String(opt.value)||(!state.value&&i===0)?'checked':''} onchange="document.getElementById('calc-stage-sel').value=this.value;recalcTotal()"><span>${opt.label[currentLang]||opt.label.en}</span></label>`).join('')}
          </fieldset>
        </div>
        <div class="space-y-3 border-t hairline pt-4">
          <div class="mono text-[10px] uppercase tracking-widest text-accent">${uiText('quoteStepExtras')}</div>
          <div class="mono text-[10px] uppercase text-textDim">${mode === 'custom' ? t.addonsCustom : mode === 'adopt' ? t.addonsAdopt : t.addonsYch}</div>
          <div class="grid grid-cols-1 gap-2">
            ${cfg.addons.map(a => { const label = a.label[currentLang] || a.label.en; return `<label class="addon-pill cursor-pointer block"><input type="checkbox" value="${a.price}" data-id="${a.id}" data-label="${label}" onchange="recalcTotal()" class="calc-addon-check" ${state.addons.includes(a.id) ? 'checked' : ''}><div class="px-3 py-3 border hairline text-xs text-textMuted flex items-center justify-between gap-3 transition"><span>${label.replace(/\s*\([^)]*\$[^)]*\)/g,'')}</span><span class="mono text-accent shrink-0">${a.id==='rush'?'+$50–100':a.id==='extra_character'||a.id==='feature'?`+$${a.price}+`:`+$${a.price}`}</span></div></label>`; }).join('')}
            ${cfg.mults.map(m => { const label = m.label[currentLang] || m.label.en; return `<label class="addon-pill cursor-pointer block"><input type="checkbox" value="${m.mult}" data-id="${m.id}" data-label="${label} (${m.badge})" onchange="recalcTotal()" class="calc-mult-check" ${state.mults.includes(m.id) ? 'checked' : ''}><div class="px-3 py-3 border hairline text-xs text-textMuted flex items-center justify-between gap-3 transition"><span>${label}</span><span class="mono text-accent shrink-0">${m.badge}</span></div></label>`; }).join('')}
          </div>
          <p class="quote-config-note text-textDim">${cfg.note[currentLang] || cfg.note.en}</p>
        </div>`;
      recalcTotal();
    }

    function recalcTotal() {
      const mode = currentPricingTab;
      const cfg = CALC_CONFIG[mode];
      const sel = document.getElementById('calc-stage-sel');
      if (!sel) return;
      const selected = cfg.options.find(opt => String(opt.value) === String(sel.value)) || cfg.options[0];
      const base = selected ? selected.price : 0;
      const itemSummary = selected ? (selected.label[currentLang] || selected.label.en) : 'Unselected';

      let extras = 0;
      const pickedNames = [];
      document.querySelectorAll('.calc-addon-check:checked').forEach(chk => {
        extras += Number.parseFloat(chk.value) || 0;
        pickedNames.push(chk.dataset.label);
      });
      let mult = 1;
      document.querySelectorAll('.calc-mult-check:checked').forEach(chk => {
        mult *= Number.parseFloat(chk.value) || 1;
        pickedNames.push(chk.dataset.label);
      });

      const total = Math.round((base + extras) * mult);
      saveCalculatorModeState(mode);
      document.querySelectorAll('input[name="quote-package"]').forEach(radio=>radio.checked=String(radio.value)===String(sel.value));
      document.querySelectorAll('[data-quote-value]').forEach(card=>{const active=card.dataset.quoteMode===mode&&String(card.dataset.quoteValue)===String(sel.value);card.classList.toggle('quote-selected',active);card.setAttribute('aria-pressed',String(active));});
      const rows=document.getElementById('calc-breakdown-list');rows.replaceChildren();
      function quoteRow(label,value){const row=document.createElement('div');row.className='quote-line';const name=document.createElement('span'),price=document.createElement('span');name.textContent=label;price.textContent=value;row.append(name,price);rows.append(row);}
      quoteRow(({en:'Base package',es:'Precio base',ru:'Базовый пакет'})[currentLang],`$${base}`);
      document.querySelectorAll('.calc-addon-check:checked').forEach(chk=>quoteRow(chk.dataset.label.replace(/\s*\([^)]*\$[^)]*\)/g,''),`+$${chk.value}`));
      if(mult>1)quoteRow(({en:'Privacy surcharge',es:'Recargo de privacidad',ru:'Доплата за приватность'})[currentLang],`+$${total-base-extras}`);
      document.getElementById('calc-total-value').textContent = `$${total}${mode === 'custom' || mode === 'adopt' ? '+' : ''}`;
      document.getElementById('calc-formula').textContent = `Base $${base}` + (extras > 0 ? ` + Extras $${extras}` : '') + (mult > 1 ? ` × ${mult.toFixed(2)}` : '');

      const notes = document.getElementById('calc-notes').value.trim() || uiText('quotePlaceholder');
      const refs = document.getElementById('calc-refs').value.trim() || uiText('quoteNotProvided');
      const deadline = document.getElementById('calc-deadline').value.trim() || uiText('quoteNotProvided');
      const contactMethod = document.getElementById('calc-contact').value || 'Telegram';
      const discordVal = document.getElementById('calc-discord')?.value?.trim() || '';
      const emailVal = document.getElementById('calc-email')?.value?.trim() || '';
      const contactExtras = [
        discordVal && isValidQuoteDiscord(discordVal) ? `Discord: ${discordVal}` : '',
        emailVal && isValidQuoteEmail(emailVal) ? `Email: ${emailVal}` : ''
      ].filter(Boolean);
      const contact = contactExtras.length ? `${contactMethod} (${contactExtras.join(' · ')})` : contactMethod;
      const tosStatus = tosAgreed ? uiText('quoteAccepted') : uiText('quoteNotConfirmed');
      const msg = `${uiText('quoteGreeting')}
• ${uiText('quoteCategory')}: ${itemSummary}
• ${uiText('quoteAddons')}: ${pickedNames.length ? pickedNames.join(', ') : uiText('quoteNone')}
• ${uiText('quoteTotal')}: ~$${total} USD
• ${uiText('quoteRefsLine')}: ${refs}
• ${uiText('quoteDeadlineLine')}: ${deadline}
• ${uiText('quoteContactLine')}: ${contact}
• ${uiText('quoteReferences')}: ${notes}
• ${uiText('quoteTos')}: ${tosStatus}`;
      document.getElementById('calc-preview-text').textContent = msg;
    }

    function isValidQuoteEmail(val) {
      const s = String(val ?? '').trim();
      if (!s) return true;
      if (s.length > 254 || s.includes('..')) return false;
      const match = s.match(/^([^\s@]+)@([^\s@]+)\.([^\s@]{2,})$/);
      if (!match) return false;
      const domain = match[2];
      return !domain.startsWith('.') && !domain.endsWith('.') && !domain.startsWith('-') && !domain.endsWith('-');
    }

    function isValidQuoteDiscord(val) {
      const s = String(val ?? '').trim();
      if (!s) return true;
      if (s.includes('..')) return false;
      return /^@?(?:[a-zA-Z0-9_.]{2,32}|[^#@:\s]{2,32}#\d{4})$/.test(s);
    }

    function validateQuoteContactFields(focusInvalid = false) {
      const errCopy = ({
        en: {
          discord: 'Enter a valid Discord handle (2–32 characters: letters, numbers, _ or ., or user#1234).',
          email: 'Enter a valid email address (for example, name@example.com).'
        },
        ru: {
          discord: 'Укажи корректный ник Discord (2–32 символа: буквы, цифры, _ или ., либо user#1234).',
          email: 'Укажи корректный email-адрес (например, name@example.com).'
        },
        es: {
          discord: 'Introduce un usuario de Discord válido (2–32 caracteres: letras, números, _ o ., o user#1234).',
          email: 'Introduce un correo electrónico válido (por ejemplo, nombre@ejemplo.com).'
        }
      })[currentLang] || {
        discord: 'Enter a valid Discord handle (2–32 characters: letters, numbers, _ or ., or user#1234).',
        email: 'Enter a valid email address (for example, name@example.com).'
      };
      const discordInput = document.getElementById('calc-discord');
      const discordError = document.getElementById('calc-discord-error');
      const emailInput = document.getElementById('calc-email');
      const emailError = document.getElementById('calc-email-error');
      const discordVal = discordInput?.value?.trim() || '';
      const emailVal = emailInput?.value?.trim() || '';
      const discordOk = isValidQuoteDiscord(discordVal);
      const emailOk = isValidQuoteEmail(emailVal);

      if (discordInput) {
        discordInput.setAttribute?.('aria-invalid', String(!discordOk));
        discordInput.classList?.toggle?.('quote-input-invalid', !discordOk);
      }
      if (discordError) {
        discordError.textContent = discordOk ? '' : errCopy.discord;
        discordError.hidden = discordOk;
      }
      if (emailInput) {
        emailInput.setAttribute?.('aria-invalid', String(!emailOk));
        emailInput.classList?.toggle?.('quote-input-invalid', !emailOk);
      }
      if (emailError) {
        emailError.textContent = emailOk ? '' : errCopy.email;
        emailError.hidden = emailOk;
      }

      if (!discordOk || !emailOk) {
        if (focusInvalid) {
          const briefPanel = document.getElementById('calc-brief-panel');
          if (briefPanel) briefPanel.open = true;
          const firstInvalid = !discordOk ? discordInput : emailInput;
          firstInvalid?.focus?.();
        }
        return { valid: false, discordOk, emailOk, message: !discordOk ? errCopy.discord : errCopy.email };
      }
      return { valid: true, discordOk: true, emailOk: true, message: '' };
    }
    window.isValidQuoteEmail = isValidQuoteEmail;
    window.isValidQuoteDiscord = isValidQuoteDiscord;
    window.validateQuoteContactFields = validateQuoteContactFields;

    function resetCalculator() {
      CALC_MODE_STATE[currentPricingTab] = { value: currentPricingTab==='custom'?'single':CALC_CONFIG[currentPricingTab].options[0].value, addons: [], mults: [] };
      document.getElementById('calc-notes').value = '';
      document.getElementById('calc-refs').value = '';
      document.getElementById('calc-deadline').value = '';
      document.getElementById('calc-contact').value = 'Telegram';
      if (document.getElementById('calc-discord')) document.getElementById('calc-discord').value = '';
      if (document.getElementById('calc-email')) document.getElementById('calc-email').value = '';
      if (typeof validateQuoteContactFields === 'function') validateQuoteContactFields(false);
      buildIndividualCalculator();
    }

    function quickPickCustom(packageKey) {
      if (currentPricingTab !== 'custom') switchPricingTab('custom');
      const sel = document.getElementById('calc-stage-sel');
      if (sel) sel.value = 'single';
      const range = document.getElementById('quote-character-count');
      const out = document.getElementById('quote-character-output');
      const chars = packageKey === 'duo' ? 2 : 1;
      if (range) range.value = String(chars);
      if (out) out.textContent = String(chars);
      if (window.CALC_MODE_STATE?.custom) window.CALC_MODE_STATE.custom.characters = chars;
      recalcTotal();
      if (['single', 'duo'].includes(packageKey)) showToast(uiText(packageKey === 'single' ? 'loadedOne' : 'loadedTwo'));
    }

    function quickPickTier(mode, amount) {
      if (currentPricingTab !== mode) switchPricingTab(mode);
      const sel = document.getElementById('calc-stage-sel');
      if (sel) {
        const value = String(amount);
        if ([...sel.options].some(opt => opt.value === value)) sel.value = value;
      }
      recalcTotal();
      showToast(uiText('loadedTier').replace('$VALUE', `$${amount}`));
    }

    async function copyCalcRequest() {
      const validation = validateQuoteContactFields(true);
      if (!validation.valid) {
        showToast(validation.message);
        return false;
      }
      recalcTotal();
      const txt = document.getElementById('calc-preview-text').textContent;
      const copied = await copyToClipboard(txt, 'DM Order Request');
      if (copied) {
        const btn = document.getElementById('calc-copy-btn');
        const t = I18N[currentLang].calc;
        btn.textContent = t.copiedBtn;
        setTimeout(() => { btn.textContent = t.copyBtn; }, 2000);
      }
      return copied;
    }


    window.syncSiteNsfwFromProcess = function(visible, verified) {
      if (showNsfwGallery === visible && isAdultVerified === verified) return;
      showNsfwGallery = visible; isAdultVerified = verified;
      document.getElementById('nsfw-switch').checked = visible;
      renderGalleryGrid();
    };
    function openArtworkProcess(id) {
      const info=(window.PORTFOLIO_WORKS||[]).find(w=>w.id===id);const mode=info?(info.cat==='adopt'?'adopt':info.cat==='ych'?'ych':'custom'):id>=4?'ych':'custom';
      if(document.body.dataset.page!=='pricing'){try{sessionStorage.setItem('nektahr-pricing-tab',mode)}catch{};switchPage('pricing');return;}
      switchPricingTab(mode);document.getElementById('pricing-workspace').scrollIntoView({behavior:'smooth',block:'start'});
    }

    // Gallery categories and age-gated mature artwork.
    function setGalleryCat(cat) {
      currentGalCat = cat;
      document.querySelectorAll('.gal-filter-btn').forEach(btn => {
        const active = btn.dataset.c === cat;
        btn.setAttribute('aria-pressed', String(active));
        btn.className = active
          ? "gal-filter-btn px-3 py-1.5 bg-accent text-bg font-medium transition cursor-pointer"
          : "gal-filter-btn px-3 py-1.5 border hairline text-textMuted hover:text-textMain transition cursor-pointer";
      });
      renderGalleryGrid();
    }

    function openAgeModal(trigger) {
      ageModalReturnFocus = trigger || document.getElementById('nsfw-switch');
      document.getElementById('nsfw-modal').classList.remove('hidden');
      document.getElementById('mod-btn-no')?.focus();
    }

    function handleNsfwToggle(checkbox) {
      if (checkbox.checked && !isAdultVerified) {
        checkbox.checked = false;
        openAgeModal(checkbox);
      } else {
        showNsfwGallery = checkbox.checked;
        renderGalleryGrid();
      }
    }

    function confirmAgeModal(confirmed) {
      document.getElementById('nsfw-modal').classList.add('hidden');
      if (confirmed) {
        isAdultVerified = true;
        showNsfwGallery = true;
        document.getElementById('nsfw-switch').checked = true;
      } else {
        showNsfwGallery = false;
        document.getElementById('nsfw-switch').checked = false;
      }
      renderGalleryGrid();
      const returnFocus = ageModalReturnFocus;
      ageModalReturnFocus = null;
      if (returnFocus?.isConnected) returnFocus.focus();
      else document.getElementById('nsfw-switch')?.focus();
    }

    function renderGalleryGrid() {
      try {sessionStorage.setItem('nektahr-demo-age-verified',isAdultVerified?'yes':'no');sessionStorage.setItem('nektahr-demo-nsfw-visible',showNsfwGallery?'yes':'no');} catch (_) {}
      document.getElementById('nsfw-switch').checked=showNsfwGallery;
      window.processViewerSync?.(showNsfwGallery,isAdultVerified);
      const grid = document.getElementById('gallery-cards-grid');
      const adultFilter=document.getElementById('gallery-adult-only');
      adultFilter.textContent=({en:'Only 18+',ru:'Только 18+',es:'Solo 18+'})[currentLang];
      adultFilter.setAttribute('aria-pressed',String(galleryAdultOnly));
      const filtered = GALLERY_ITEMS.filter(matchesGalleryFilters);
      if (!filtered.length) {
        grid.innerHTML = `<p class="text-sm text-textMuted py-8" role="status">${uiText('noSamples')}</p>`;
        return;
      }
      grid.innerHTML = filtered.map(item => {
        const blurred = Boolean(item.nsfw) && !(isAdultVerified && showNsfwGallery);
        const hoverReveal = Boolean(item.hoverReveal && isAdultVerified && showNsfwGallery);
        return `
          <button type="button" onclick="openLightbox(${Number(item.id)})" class="card card-interactive overflow-hidden group cursor-pointer text-left w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" aria-label="${blurred ? ({en:'18+ artwork; confirm your age to view',ru:'Работа 18+; для просмотра подтверди возраст',es:'Obra 18+; confirma tu edad para verla'})[currentLang] : `${({en:'Open',ru:'Открыть',es:'Abrir'})[currentLang]} ${getGalleryTitle(item)}`}">
            <div class="aspect-[4/5] bg-surfaceAlt relative overflow-hidden border-b hairline ${hoverReveal ? 'adult-hover-preview' : ''}">
              <img src="${item.img}" alt="${blurred ? ({en:'Blurred 18+ artwork preview',ru:'Размытое превью работы 18+',es:'Vista difuminada de una obra 18+'})[currentLang] : getGalleryTitle(item)}" loading="lazy" decoding="async" class="w-full h-full object-contain transition duration-500 ${blurred ? 'blur-2xl scale-110' : 'group-hover:scale-105'}" />
              <div class="absolute top-2.5 left-2.5 flex gap-1.5">
                ${hasAdultArtwork(item) ? '<span class="px-2 py-0.5 bg-bg/90 border border-error/50 mono text-[10px] text-error">18+</span>' : ''}
              </div>
              ${blurred ? `<div class="absolute inset-0 bg-bg/60 flex flex-col items-center justify-center p-4 text-center"><span class="flex items-center justify-center w-10 h-10 border border-error/50 rounded-full text-error mb-2" aria-hidden="true">🔒</span><span class="mono text-[10px] uppercase text-error">NSFW · 18+</span></div>` : ''}
              ${hoverReveal ? `<span class="adult-hover-hint">${({en:'Hover or open to view · 18+',ru:'Наведи или открой · 18+',es:'Pasa el cursor o abre · 18+'})[currentLang]}</span>` : ''}
            </div>
            <div class="gallery-card-caption">
              <div class="min-w-0">
                <span class="gallery-kind" data-kind="${item.cat}">${getGalleryKind(item)}</span>
                <h3 class="serif text-xl text-textMain">${getGalleryTitle(item)}</h3>
                <p class="text-xs text-textDim">${item.processWork?getProcessLabel(item):getGalleryStage(item)}</p>
                ${getGallerySeries(item)?`<p class="gallery-series">${getGallerySeries(item)}</p>`:''}
              </div>
              <span class="mono text-xs text-accent shrink-0">${item.processWork?'↗':getGalleryPriceLabel()}</span>
            </div>
          </button>
        `;
      }).join('');
    }

    function openLightbox(id) { window.openGalleryArtwork?.(id); }

    let lastGalleryTrigger = null;
    function closeLightbox() {
      document.getElementById('lightbox-modal').classList.add('hidden');
      if (lastGalleryTrigger && typeof lastGalleryTrigger.focus === 'function') lastGalleryTrigger.focus();
    }
    document.addEventListener('keydown', event => {
      const ageModal = document.getElementById('nsfw-modal');
      if (ageModal && !ageModal.classList.contains('hidden')) {
        if (event.key === 'Escape') {
          event.preventDefault();
          confirmAgeModal(false);
          return;
        }
        if (event.key === 'Tab') {
          const focusable = [...ageModal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
        return;
      }
      if (event.key === 'Escape' && !document.getElementById('lightbox-modal').classList.contains('hidden')) closeLightbox();
    });

    function toggleTosConfirmation(checked) {
      tosAgreed = Boolean(checked);
      try{sessionStorage.setItem(TOS_CONSENT_KEY,tosAgreed?'yes':'no')}catch{}
      recalcTotal();
      if (checked) showToast(uiText('agreementAttached'));
    }

    function setFaqCat(cat) {
      currentFaqCat = cat;
      renderFaqSection();
    }

    function renderFaqSection() {
      const t = I18N[currentLang].faq;
      document.getElementById('faq-eyebrow').textContent = t.eyebrow;
      document.getElementById('faq-title').textContent = t.title;
      document.getElementById('faq-sub').textContent = t.sub;

      const catKeys = Object.keys(t.cats);
      document.getElementById('faq-cat-buttons').innerHTML = catKeys.map(k => {
        const active = k === currentFaqCat;
        return `
          <button onclick="setFaqCat('${k}')" class="${active ? 'px-3 py-1.5 bg-accent text-bg font-medium' : 'px-3 py-1.5 border hairline text-textMuted hover:text-textMain'} transition cursor-pointer">
            ${t.cats[k]}
          </button>
        `;
      }).join('');

      const filtered = t.items.filter(it => currentFaqCat === 'all' || it.cat === currentFaqCat);
      document.getElementById('faq-items-list').innerHTML = filtered.map((f, idx) => `
        <details class="card p-5 group" ${idx === 0 ? 'open' : ''}>
          <summary class="serif text-2xl text-textMain cursor-pointer list-none flex items-center justify-between gap-4">
            <span>${f.q}</span>
            <span class="mono text-accent group-open:rotate-45 transition">+</span>
          </summary>
          <p class="text-sm text-textMuted mt-3 pt-3 border-t hairline leading-relaxed">${f.a}</p>
        </details>
      `).join('');
    }

    // Master Render for All Sections & Languages
    function renderAllText() {
      const t = I18N[currentLang];
      const a11y=({en:{nav:'Main navigation',queue:'Open active commission queue',pricing:'Pricing categories',gallery:'Gallery filters',process:'Artwork process and versions'},ru:{nav:'Основная навигация',queue:'Открыть очередь заказов',pricing:'Категории заказов',gallery:'Фильтры галереи',process:'Этапы и версии работы'},es:{nav:'Navegación principal',queue:'Abrir cola de encargos',pricing:'Categorías de encargos',gallery:'Filtros de galería',process:'Proceso y versiones de la obra'}})[currentLang];
      document.getElementById('nav-links').setAttribute('aria-label',a11y.nav);
      const queueLink=document.getElementById('header-queue-counter').closest('a,button');queueLink.setAttribute('aria-label',a11y.queue);queueLink.title=a11y.queue;
      document.querySelector('[aria-label="Pricing categories"],#page-pricing [role="tablist"]').setAttribute('aria-label',a11y.pricing);
      document.getElementById('gallery-category-filters').setAttribute('aria-label',a11y.gallery);
      document.getElementById('art-process').setAttribute('aria-label',a11y.process);

      // Header Nav
      document.getElementById('nav-board').textContent = t.nav.board;
      document.getElementById('nav-pricing').textContent = t.nav.pricing;
      document.getElementById('nav-gallery').textContent = t.nav.gallery;
      document.getElementById('nav-queue').textContent = t.nav.queue;
      document.getElementById('nav-tos').textContent = t.nav.tos;
      document.getElementById('nav-faq').textContent = t.nav.faq;
      document.getElementById('header-status-badge').textContent = t.statusBadge;
      document.getElementById('header-tagline').textContent = uiText('headerTagline');
      document.getElementById('footer-rights').textContent = uiText('footerRights');
      document.getElementById('footer-telegram').textContent = uiText('footerTelegram');
      document.getElementById('lb-pricing-link').textContent = uiText('pricingLink');
      document.getElementById('toast').textContent = uiText('copied');

      // Board / Hero
      document.getElementById('hero-eyebrow').textContent = t.hero.eyebrow;
      document.getElementById('hero-title').textContent = t.hero.title;
      document.getElementById('hero-desc').textContent = t.hero.desc1;
      document.getElementById('hero-desc-2').textContent = t.hero.desc2;
      document.getElementById('path-a-title').textContent = t.hero.pathA.title;
      document.getElementById('path-a-sub').textContent = t.hero.pathA.sub;
      document.getElementById('path-b-title').textContent = t.hero.pathB.title;
      document.getElementById('path-b-sub').textContent = t.hero.pathB.sub;

      // Contacts
      document.getElementById('contacts-eyebrow').textContent = t.contacts.eyebrow;
      document.getElementById('contacts-title').textContent = t.contacts.title;
      document.getElementById('primary-contacts-label').textContent = t.contacts.primaryTitle;
      document.getElementById('platforms-label').textContent = t.contacts.platformsTitle;

      document.getElementById('primary-contacts-grid').innerHTML = CONTACTS_PRIMARY.map(c => {
        const subText = c.sub[currentLang] || c.sub.en;
        const [descriptor, action] = subText.split(' · ');
        const helper = action
          ? `<span class="block mono text-[10px] uppercase text-accent/80 mt-1">${action}</span>`
          : '';
        const topLabel = `<span class="block mono text-[10px] uppercase text-textDim">${descriptor}</span>${helper}`;
        if (c.type === 'copy') {
          return `
            <button onclick="copyToClipboard('${c.value}', '${c.label} (${c.handle})')" class="card card-interactive p-4 border-accent/40 bg-accent/5 text-left flex flex-col justify-between gap-3 cursor-pointer">
              <div class="flex items-start justify-between gap-2 w-full">
                <div>${topLabel}</div>
                <span class="mono text-xs text-accent shrink-0">${uiText('copy')}</span>
              </div>
              <div>
                <div class="serif text-2xl text-textMain">${c.label}</div>
                <div class="mono text-xs text-textMuted mt-0.5">${c.handle}</div>
              </div>
            </button>
          `;
        }
        return `
          <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="card card-interactive p-4 border-accent/40 bg-accent/5 flex flex-col justify-between gap-3">
            <div class="flex items-start justify-between gap-2 w-full">
              <div>${topLabel}</div>
              <span class="mono text-xs text-accent shrink-0">↗</span>
            </div>
            <div>
              <div class="serif text-2xl text-textMain">${c.label}</div>
              <div class="mono text-xs text-textMuted mt-0.5">${c.handle}</div>
            </div>
          </a>
        `;
      }).join('');

      document.getElementById('platforms-grid').innerHTML = PLATFORMS.map(p => {
        const note = p.note[currentLang] || p.note.en;
        if (p.soon) {
          return `
            <div class="card p-4 opacity-55 flex flex-col justify-between gap-2 select-none">
              <div class="flex items-center justify-between">
                <span class="serif text-xl text-textMuted">${p.name}</span>
                <span class="mono text-[10px] uppercase px-2 py-0.5 border hairline text-textDim">${({en:'Coming soon',ru:'Скоро',es:'Próximamente'})[currentLang]}</span>
              </div>
              <div class="text-xs text-textDim">${note}</div>
            </div>
          `;
        }
        return `
          <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="card card-interactive p-4 flex flex-col justify-between gap-2 group">
            <div class="flex items-center justify-between">
              <span class="serif text-xl text-textMain group-hover:text-accent transition">${p.name}</span>
              <span class="mono text-xs text-textDim group-hover:text-accent transition">↗</span>
            </div>
            <div class="text-xs text-textDim">${note}</div>
          </a>
        `;
      }).join('');

      // Board Highlights
      document.getElementById('feat-eyebrow').textContent = t.featured.eyebrow;
      document.getElementById('feat-title').textContent = t.featured.title;
      document.getElementById('feat-view-all').textContent = t.featured.viewAll;
      document.getElementById('hero-featured-label').textContent = t.featured.eyebrow;
      document.getElementById('hero-featured-title').textContent = t.featured.title;
      document.getElementById('hero-featured-link').textContent = t.featured.viewAll;
      document.getElementById('board-highlights-grid').innerHTML = GALLERY_ITEMS.filter(x => x.gallery!==false && !x.nsfw).slice(0, 4).map(it => `
        <button type="button" onclick="switchPage('gallery')" class="card card-interactive overflow-hidden cursor-pointer group text-left w-full">
          <div class="aspect-[4/5] bg-bg overflow-hidden border-b hairline">
            <img src="${it.img}" alt="${getGalleryTitle(it)}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          </div>
          <div class="highlight-caption"><span class="gallery-kind" data-kind="${it.cat}">${getGalleryKind(it)}</span>
            <span class="serif text-lg text-textMain">${getGalleryTitle(it)}</span>
            <span class="highlight-detail">${it.processWork?getProcessLabel(it):getGalleryStage(it)}</span>
          </div>
        </button>
      `).join('');

      window.mountProcessViewer?.();
      // Pricing Page
      document.getElementById('pricing-eyebrow').textContent = t.pricing.eyebrow;
      document.getElementById('pricing-title').textContent = t.pricing.title;
      document.getElementById('pricing-sub').textContent = t.pricing.sub;
      document.getElementById('ptab-custom').textContent = ({en:'Commissions',ru:'Коммишки',es:'Encargos'})[currentLang];
      document.getElementById('ptab-adopt').textContent = ({en:'Adopts',ru:'Адопты',es:'Adopts'})[currentLang];
      document.getElementById('ptab-ych').textContent = ({en:'YCH',ru:'YCH',es:'YCH'})[currentLang];

      document.getElementById('stage-sec-title').textContent = t.pricing.stageSectionTitle;
      document.getElementById('stage-sec-hint').textContent = t.pricing.stageSectionHint;

      document.getElementById('custom-stages-grid').innerHTML = t.pricing.stages.map(st => {
        const selectable = ['sketch', 'color', 'single', 'duo'].includes(st.key);
        const isExtras = st.key === 'extras';
        const action = selectable
          ? `onclick="quickPickCustom('${st.key}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quickPickCustom('${st.key}');}"`
          : (isExtras ? `onclick="document.getElementById('calc-dynamic-body')?.scrollIntoView({behavior:'smooth',block:'start'})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();document.getElementById('calc-dynamic-body')?.scrollIntoView({behavior:'smooth',block:'start'});}"` : '');
        return `
          <div ${selectable ? `role="button" tabindex="0" data-quote-mode="custom" data-quote-value="${st.key}" ${action}` : (isExtras ? `role="button" tabindex="0" ${action}` : '')} class="card ${selectable || isExtras ? 'card-interactive cursor-pointer' : 'price-extras-note'} p-5 flex flex-col gap-3">
            <div class="mono text-[10px] uppercase text-accent">${st.time}</div>
            <h3 class="serif text-2xl text-textMain">${st.name}</h3>
            <div class="serif text-3xl text-accent">${st.range}</div>
            <p class="text-xs text-textMuted leading-relaxed">${st.desc}</p>
          </div>`;
      }).join('');

      // Adopts Section
      document.getElementById('adopt-eyebrow').textContent = t.pricing.adoptSection.eyebrow;
      document.getElementById('adopt-title').textContent = t.pricing.adoptSection.title;
      document.getElementById('adopt-desc').textContent = t.pricing.adoptSection.desc;
      document.getElementById('adopt-tiers-grid').innerHTML = t.pricing.adoptSection.tiers.map(tr => `
        <button type="button" data-quote-mode="adopt" data-quote-value="${tr.val}" onclick="quickPickTier('adopt', ${tr.val})" class="card card-interactive overflow-hidden flex flex-col justify-between cursor-pointer text-left w-full">
          <div>
            ${tr.hasSample ? `
              <div class="h-48 bg-bg overflow-hidden relative border-b hairline">
                <img src="${tr.img}" alt="${tr.title}" class="w-full h-full object-cover" />
                <span class="absolute top-3 left-3 px-2.5 py-0.5 bg-bg/85 border hairline mono text-[10px] text-accent">${tr.badge}</span>
              </div>
            ` : `
              <span class="sr-only"></span>
            `}
            <div class="p-5 space-y-2.5">
              <div class="flex items-baseline justify-between">
                <span class="mono text-[10px] uppercase text-textDim">${tr.badge}</span>
                <span class="serif text-3xl text-accent">${tr.price}</span>
              </div>
              <h3 class="serif text-2xl text-textMain">${tr.title}</h3>
              <p class="text-xs text-textMuted leading-relaxed">${tr.desc}</p>
              <ul class="pt-2 border-t hairline space-y-1 text-xs text-textDim">
                ${tr.perks.map(p => `<li>• ${p}</li>`).join('')}
              </ul>
            </div>
          </div>
        </button>
      `).join('');

      // YCH Section
      document.getElementById('ych-eyebrow').textContent = t.pricing.ychSection.eyebrow;
      document.getElementById('ych-title').textContent = t.pricing.ychSection.title;
      document.getElementById('ych-desc').textContent = t.pricing.ychSection.desc;
      document.getElementById('ych-slots-grid').innerHTML = t.pricing.ychSection.slots.map(sl => `
        <div role="button" tabindex="0" data-quote-mode="ych" data-quote-value="${sl.val}" onclick="quickPickTier('ych', ${sl.val})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quickPickTier('ych', ${sl.val});}" class="card card-interactive p-5 flex flex-col gap-3 cursor-pointer">
          <div class="mono text-[10px] text-textDim">${sl.code}</div>
          <h3 class="serif text-2xl text-textMain">${sl.title}</h3>
          <div class="flex flex-wrap items-center justify-between gap-2 border-t hairline pt-3">
            <span class="text-xs text-textMuted">${sl.stage}</span>
            <span class="mono text-lg text-accent">${sl.price}</span>
          </div>
          <p class="text-xs text-textMuted leading-relaxed">${sl.desc}</p>
          <span class="mono text-[10px] uppercase text-textDim">${sl.status} · ${uiText('confirmAvailability')}</span>
        </div>`).join('');

      // Calculator Labels
      document.getElementById('calc-title').textContent = t.calc.title;
      document.getElementById('calc-reset-btn').textContent = t.calc.reset;
      document.getElementById('calc-total-label').textContent = t.calc.totalLabel;
      document.getElementById('calc-copy-btn').textContent = t.calc.copyBtn;
      document.getElementById('calc-preview-label').textContent = t.calc.previewLabel;
      buildIndividualCalculator();

      // Gallery Labels
      document.getElementById('gal-eyebrow').textContent = t.gallery.eyebrow;
      document.getElementById('gal-title').textContent = t.gallery.title;
      document.getElementById('gal-sub').textContent = t.gallery.sub;
      const galSearchCopy = ({
        en: { placeholder: 'Search by title, category, or tags…', label: 'Search gallery by title, category, or tags' },
        ru: { placeholder: 'Поиск по названию, категории или тегам…', label: 'Поиск по галерее: название, категория или теги' },
        es: { placeholder: 'Buscar por título, categoría o etiquetas…', label: 'Buscar en la galería por título, categoría o etiquetas' }
      })[currentLang] || { placeholder: 'Search by title, category, or tags…', label: 'Search gallery by title, category, or tags' };
      const galSearchLabel = document.getElementById('gallery-search-label');
      if (galSearchLabel) galSearchLabel.textContent = galSearchCopy.label;
      const galSearchInput = document.getElementById('gallery-search');
      if (galSearchInput) {
        galSearchInput.placeholder = galSearchCopy.placeholder;
        galSearchInput.setAttribute('aria-label', galSearchCopy.label);
      }
      Object.entries(t.gallery.filters).forEach(([key, label]) => {
        const button = document.getElementById(`gf-${key}`);
        if (button) button.textContent = label;
      });
      document.getElementById('gal-nsfw-label').textContent = t.gallery.nsfwToggle;
      document.getElementById('mod-eyebrow').textContent = t.gallery.modal.eyebrow;
      document.getElementById('mod-title').textContent = t.gallery.modal.title;
      document.getElementById('mod-desc').textContent = t.gallery.modal.desc;
      document.getElementById('mod-btn-yes').textContent = t.gallery.modal.yes;
      document.getElementById('mod-btn-no').textContent = t.gallery.modal.no;
      document.getElementById('gal-ext-title').textContent = t.gallery.extTitle;
      document.getElementById('gal-ext-sub').textContent = t.gallery.extSub;
      document.getElementById('gal-ext-platforms').innerHTML = [...PLATFORMS.filter(p => !p.soon),{name:'Inkbunny',url:'https://inkbunny.net/DrinTrava'},{name:'Baraag',url:'https://baraag.net/@DrinTrava'}].map(p => `
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="card card-interactive gallery-platform-link"><span class="serif text-textMain">${p.name}</span></a>
      `).join('');
      renderGalleryGrid();

      // Queue Page
      document.getElementById('q-eyebrow').textContent = t.queue.eyebrow;
      document.getElementById('q-title').textContent = t.queue.title;
      document.getElementById('q-sub').textContent = t.queue.sub;
      document.getElementById('q-col-slot').textContent = t.queue.cols.slot;
      document.getElementById('q-col-client').textContent = t.queue.cols.client;
      document.getElementById('q-col-details').textContent = t.queue.cols.details;
      document.getElementById('q-col-stage').textContent = t.queue.cols.stage;
      document.getElementById('q-col-progress').textContent = t.queue.cols.progress;

      renderLiveQueue();

      // ToS Page
      document.getElementById('tos-agree-checkbox').checked=tosAgreed;
      document.getElementById('tos-eyebrow').textContent = t.tos.eyebrow;
      document.getElementById('tos-title').textContent = t.tos.title;
      document.getElementById('tos-sub').textContent = t.tos.sub;
      document.getElementById('tos-summary-title').textContent = t.tos.summaryTitle;
      document.getElementById('tos-agree-label').textContent = t.tos.agreeCheck;
      document.getElementById('tos-full-title').textContent = t.tos.fullTitle;
      document.getElementById('tos-will-title').textContent = t.tos.willTitle;
      document.getElementById('tos-wont-title').textContent = t.tos.wontTitle;

      document.getElementById('tos-cards-grid').innerHTML = t.tos.cards.map((c, idx) => `
        <div class="card p-5 space-y-2 ${idx === 5 ? 'border-error/40 bg-error/5' : ''}">
          <div class="mono text-xs ${idx === 5 ? 'text-error' : 'text-accent'}">${c.num}</div>
          <h3 class="serif text-2xl text-textMain">${c.title}</h3>
          <p class="tos-summary-copy"><strong>${c.lead}</strong><span>${c.desc}</span></p>
        </div>
      `).join('');

      document.getElementById('tos-will-list').innerHTML = t.tos.willList.map(i => `<li>• ${i}</li>`).join('');
      document.getElementById('tos-wont-list').innerHTML = t.tos.wontList.map(i => `<li>• ${i}</li>`).join('');
      document.getElementById('tos-detailed-sections').innerHTML = t.tos.sections.map((sec,index) => `
        <section id="tos-section-${index+1}" class="card tos-detail p-6 space-y-3">
          <div class="mono text-[10px] uppercase text-accent">${sec.tag}</div>
          <h3 class="serif text-2xl text-textMain">${sec.title}</h3>
          <ul class="space-y-2 text-xs sm:text-sm text-textMuted leading-relaxed pt-2 border-t hairline">
            ${sec.bullets.map(b => `<li><p>${b}</p></li>`).join('')}
          </ul>
        </section>
      `).join('');
      document.getElementById('tos-contents').innerHTML=t.tos.sections.map((sec,i)=>`<a href="#tos-section-${i+1}">${sec.title}</a>`).join('');

      // FAQ Page
      renderFaqSection();
      window.renderCatalog?.();
    }

    // Apply the saved language before the page becomes visible, preventing an English flash.
    const initialLang = document.documentElement.dataset.initialLang || 'en';
    try {
      setLang(initialLang);
      switchPage(document.body.dataset.page || 'board');
    } finally {
      // Never leave the entire page invisible if initialization throws.
      document.documentElement.classList.remove('language-loading');
    }

    window.onload = function() {
      let initialPricingTab='custom';try{const saved=sessionStorage.getItem('nektahr-pricing-tab');if(['custom','adopt','ych'].includes(saved))initialPricingTab=saved;sessionStorage.removeItem('nektahr-pricing-tab')}catch{}
      switchPricingTab(initialPricingTab);
      if(!window.queueManagerReady)loadLiveQueue();
    };
