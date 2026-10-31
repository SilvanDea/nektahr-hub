
    // Public queue data is served by Google Apps Script. Only rows marked Public=TRUE are returned.
    const QUEUE_API_URL = "https://script.google.com/macros/s/AKfycbwUoTP0HxWx6icBz-KV_WVqm89uAIDUxvaNumq7hdmpOcqtuVl9tILkWvSiOPqj0ysO/exec";
    let LIVE_QUEUE_DATA = null;
    let LIVE_QUEUE_ERROR = false;
    let LIVE_QUEUE_REQUESTED = false;

    const QUEUE_CONTACT_LABEL = {
      en: "Contact on Telegram ↗",
      es: "Contactar por Telegram ↗",
      ru: "Написать в Telegram ↗"
    };

    function escapeQueueHTML(value) {
      return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[char]));
    }

    async function loadLiveQueue() {
      if (LIVE_QUEUE_REQUESTED) return;
      LIVE_QUEUE_REQUESTED = true;
      try {
        const response = await fetch(QUEUE_API_URL, {credentials:'omit', cache:'no-store', signal:AbortSignal.timeout(12000)});
        if (!response.ok) throw Error('Queue unavailable');
        const payload = await response.json();
        if (!payload || payload.error || !Array.isArray(payload.orders)) throw Error('Invalid queue');
        LIVE_QUEUE_DATA = payload.orders;
        LIVE_QUEUE_ERROR = false;
      } catch (_) { LIVE_QUEUE_ERROR = true; }
      updateHeaderQueueCounter();
      renderLiveQueue();
    }

    function updateHeaderQueueCounter() {
      const counter = document.getElementById("header-queue-counter");
      if (!counter) return;
      if (LIVE_QUEUE_DATA === null || LIVE_QUEUE_ERROR) {
        counter.textContent = "QUEUE · —";
        counter.title = "Active commission count unavailable";
        return;
      }
      const count = LIVE_QUEUE_DATA.filter(order => String(order.status || "").trim().toLowerCase() !== "completed").length;
      counter.textContent = `QUEUE · ${count}`;
      counter.title = count === 1 ? "1 active commission" : `${count} active commissions`;
      counter.setAttribute("aria-label", counter.title);
    }

    function renderLiveQueue() {
      const body = document.getElementById("queue-table-body");
      if (!body || typeof currentLang === "undefined" || !I18N[currentLang]) return;
      const t = I18N[currentLang].queue;
      const contact = QUEUE_CONTACT_LABEL[currentLang] || QUEUE_CONTACT_LABEL.en;
      const contactLink = `<div class="mt-4"><a href="https://t.me/nek_tahr" target="_blank" rel="noopener noreferrer" class="inline-block px-4 py-2 bg-accent text-bg mono text-xs uppercase">${contact}</a></div>`;

      if (LIVE_QUEUE_ERROR) {
        body.innerHTML = `<tr><td colspan="5" class="py-8 px-4 text-sm text-textMuted">${t.error}${contactLink}</td></tr>`;
        return;
      }
      if (LIVE_QUEUE_DATA === null) {
        body.innerHTML = `<tr><td colspan="5" class="py-8 px-4 text-sm text-textMuted">${t.loading}</td></tr>`;
        return;
      }
      // Completed commissions belong in the portfolio, not the active queue.
      const activeOrders = LIVE_QUEUE_DATA.filter(order => String(order.status || "").trim().toLowerCase() !== "completed");
      if (!activeOrders.length) {
        body.innerHTML = `<tr><td colspan="5" class="py-8 px-4"><div class="mx-auto max-w-xl py-7 text-center border border-accent/20 bg-accent/5 px-5">
          <div class="text-3xl mb-3" aria-hidden="true">☕ 🎨</div>
          <p class="serif text-2xl text-textMain mb-2">${t.emptyTitle}</p>
          <p class="text-sm leading-relaxed text-textMuted">${t.empty}</p>
          ${contactLink}
        </div></td></tr>`;
        return;
      }

      const statusLabels = {
        en: { "Queued": "Queued", "In Progress": "In Progress", "Waiting for Client": "Waiting for Client", "On Hold": "On Hold", "Completed": "Completed" },
        es: { "Queued": "En cola", "In Progress": "En curso", "Waiting for Client": "Esperando al cliente", "On Hold": "En pausa", "Completed": "Completado" },
        ru: { "Queued": "В очереди", "In Progress": "В работе", "Waiting for Client": "Жду ответа", "On Hold": "На паузе", "Completed": "Завершён" }
      };
      const rows = activeOrders.map(order => {
        const rawProgress = order.progress === "" || order.progress === null || typeof order.progress === "undefined" ? NaN : Number(order.progress);
        const hasProgress = Number.isFinite(rawProgress) && rawProgress > 0;
        const progress = hasProgress ? Math.max(0, Math.min(100, rawProgress)) : 0;
        const progressLabel = hasProgress ? `${progress}%` : (String(order.status || "") === "Queued" ? t.queuedProgress : t.noProgress);
        const status = String(order.status || "");
        const statusText = (statusLabels[currentLang] && statusLabels[currentLang][status]) || status;
        const dates = [];
        if (order.startedAt) dates.push(`${t.started}: ${escapeQueueHTML(order.startedAt)}`);
        if (order.estimatedCompletion) dates.push(`${t.eta}: ${escapeQueueHTML(order.estimatedCompletion)}`);
        return `
          <tr class="align-top">
            <td class="py-4 pr-4 text-textMain">${escapeQueueHTML(order.displayName || "Commission")}</td>
            <td class="py-4 px-4 text-textMuted">${escapeQueueHTML(order.orderType || "")}</td>
            <td class="py-4 px-4"><div class="text-textMain">${escapeQueueHTML(order.title || "")}</div>${dates.length ? `<div class="mt-1 text-xs text-textDim">${dates.join(" · ")}</div>` : ""}</td>
            <td class="py-4 px-4"><span class="inline-block border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-accent">${escapeQueueHTML(statusText)}</span></td>
            <td class="py-4 pl-4 text-right min-w-[120px]">
              <div class="mono text-xs text-textMain mb-2">${escapeQueueHTML(progressLabel)}</div>
              <div class="h-1.5 w-full bg-white/10"><div class="h-1.5 bg-accent transition-all" style="width:${progress}%"></div></div>
            </td>
          </tr>`;
      }).join("");
      body.innerHTML = rows;
    }

    // Primary Contacts & Platforms
    const CONTACTS_PRIMARY = [
      { id: "discord", type: "link", url: "https://discord.com/users/361511957129461781", value: "drintrava", label: "Discord", handle: "drintrava", sub: { en: "Primary Contact · Open profile", es: "Contacto principal · Abrir perfil", ru: "Основной контакт · Открыть профиль" } },
      { id: "tg1", type: "link", url: "https://t.me/nek_tahr", label: "Telegram", handle: "@nek_tahr", sub: { en: "Direct Messages · Click to Message", es: "Mensajes directos · Clic para escribir", ru: "Личные сообщения · Нажмите, чтобы написать" } },
      { id: "email", type: "link", url: "mailto:nektahr@gmail.com", label: "Email", handle: "nektahr@gmail.com", sub: { en: "Commercial inquiries · Send an email", es: "Consultas comerciales · Enviar correo", ru: "Коммерческие вопросы · Написать письмо" } }
    ];

    const PLATFORMS = [
      { name: "DeviantArt", handle: "@nektahr", url: "https://www.deviantart.com/nektahr", soon: false, note: { en: "Portfolio, adopts & commission samples", es: "Portafolio, adopts y ejemplos de comisiones", ru: "Портфолио, адопты и примеры комиссий" } },
      { name: "X (Twitter)", handle: "@Nektahr_", url: "https://x.com/Nektahr_", soon: false, note: { en: "New art, sketches & works in progress", es: "Arte nuevo, bocetos y trabajos en proceso", ru: "Новые работы, скетчи и процесс рисования" } },
      { name: "YCH.Commishes", handle: "nektahr", url: "https://ych.commishes.com/user/nektahr/", soon: false, note: { en: "YCH auctions & adoptable designs", es: "Subastas YCH y diseños adoptables", ru: "Аукционы YCH и адопты" } },
      { name: "YCH.art", handle: "Ned'hal", url: "https://ych.art/user/nedhal", soon: false, note: { en: "YCH listings & current availability", es: "Anuncios YCH y disponibilidad actual", ru: "Лоты YCH и актуальная доступность" } },
      { name: "FurAffinity", handle: "nektahr", url: "https://www.furaffinity.net/user/nektahr", soon: false, note: { en: "Furry art archive & updates", es: "Archivo de arte furry y novedades", ru: "Архив furry-арта и обновления" } },
      { name: "Pixiv", handle: "User 44242225", url: "https://www.pixiv.net/en/users/44242225", soon: false, note: { en: "Illustrations, fanart & character art", es: "Ilustraciones, fanart y arte de personajes", ru: "Иллюстрации, фанарт и персонажи" } },
      { name: "Ko-fi", handle: "nektahr", url: "https://ko-fi.com/nektahr", soon: false, note: { en: "Support my work & commission payments", es: "Apoya mi trabajo y paga comisiones", ru: "Поддержка творчества и оплата комиссий" } },
      { name: "Patreon", handle: "Coming Soon", url: "", soon: true, note: { en: "Memberships, extras & behind-the-scenes art coming soon", es: "Próximamente: membresías, extras y contenido del proceso", ru: "Скоро: подписки, бонусы и закулисье творчества" } }
    ];

    // Gallery Works
    const GALLERY_ITEMS = [
{"id": 101, "title": "Illustration 2", "cat": "comm", "nsfw": false, "img": "/assets/gallery/ofordet-bg.webp", "processWork": 1},{"id": 102, "title": "Illustration 3", "cat": "comm", "nsfw": true, "img": "/assets/process/art-2-2.webp", "processWork": 2},{"id": 103, "title": "SFW / NSFW fan art", "cat": "fanart", "nsfw": false, "img": "/assets/process/art-3-0.webp", "processWork": 3},{"id": 104, "title": "YCH example", "cat": "ych", "nsfw": false, "img": "/assets/process/art-4-1.webp", "processWork": 4},
{"id": 105, "title": "YCH \u00b7 TH", "cat": "ych", "nsfw": true, "img": "/assets/process/art-5-1.webp", "processWork": 5},{"id": 106, "title": "YCH \u00b7 All Plain to See", "cat": "ych", "nsfw": true, "img": "/assets/process/art-6-1.webp", "processWork": 6},
      { id: 1, gallery: false, title: "Portfolio Sample 01", cat: "samples", stage: "SFW Sample", price: "Portfolio", nsfw: false, img: "/assets/gallery/gal-adopt-cdg-v1bg.webp", desc: "Public SFW portfolio sample. See the source profile for context." },
      { id: 6, title: "Portfolio Sample 06", cat: "fanart", stage: "SFW Sample", price: "Portfolio", nsfw: false, img: "/assets/gallery/frieren-white-dress.jpg", desc: "Public SFW portfolio sample. See the source profile for context." },
    ];
    GALLERY_ITEMS.push(...(window.PORTFOLIO_WORKS||[]).map(work=>({id:100+work.id,title:work.title,localizedTitles:work.titles,cat:work.cat,nsfw:work.nsfw[work.thumb],img:work.images[work.thumb],processWork:work.id,gallery:work.gallery,catalogWork:true,designKind:work.designKind,hasAdultVersion:work.nsfw.some(Boolean),hoverReveal:Boolean(work.hoverReveal)})));


    // Translations (EN main · ES · RU)
    const CALC_CONFIG = {
      custom: {
        options: [
          { value: "single", price: 200, label: { en: "1 character + simple background — from $200", es: "1 personaje + fondo sencillo — desde $200", ru: "1 персонаж + простой фон — от $200" } },
          { value: "duo", price: 300, label: { en: "2 characters + simple background — from $300", es: "2 personajes + fondo sencillo — desde $300", ru: "2 персонажа + простой фон — от $300" } }
        ],
        addons: [
          { id: "outfit", price: 50, label: { en: "Extra outfit (+$50)", es: "Atuendo extra (+$50)", ru: "Дополнительный наряд (+$50)" } },
          { id: "extra_character", price: 100, label: { en: "Additional character (from +$100)", es: "Personaje adicional (desde +$100)", ru: "Дополнительный персонаж (от +$100)" } },
          { id: "rush", price: 50, label: { en: "Rush order (minimum +$50; may be +$100)", es: "Pedido urgente (mínimo +$50; puede ser +$100)", ru: "Срочный заказ (от +$50, может быть +$100)" } }
        ],
        mults: [
          { id: "nda", mult: 1.35, badge: "+35%", label: { en: "Private / NDA", es: "Privado / NDA", ru: "Приватность / NDA" } }
        ],
        note: {
          en: "Additional character: from $100. Commercial use requires a separate agreement and quote. Rush pricing depends on the deadline. All totals are estimates; confirm the final quote directly. Turnaround starts once payment and all references have been received. For an agreed payment plan, it starts after the first instalment and references.",
          es: "Personaje adicional: desde $100. El uso comercial requiere un acuerdo y presupuesto separados. El precio urgente depende de la fecha límite. El total es orientativo; confirma el precio final directamente. El plazo empieza tras recibir el pago y todas las referencias. Con un plan de pagos acordado, empieza tras la primera cuota y las referencias.",
          ru: "Дополнительный персонаж: от $100. Коммерческое использование требует отдельного соглашения и расчёта. Цена срочности зависит от дедлайна. Сумма ориентировочная, окончательную цену нужно подтвердить напрямую. Срок отсчитывается после получения оплаты и всех референсов. При согласованной рассрочке — после первого платежа и референсов."
        }
      },
      adopt: {
        options: [
          { value: "100", price: 100, label: { en: "SB — Base design ($100)", es: "SB — Diseño base ($100)", ru: "SB — Базовый дизайн ($100)" } },
          { value: "200", price: 200, label: { en: "Tier II — Full render + alternative version ($200+)", es: "Nivel II — Render + versión alternativa ($200+)", ru: "Уровень II — Рендер + альтернативная версия ($200+)" } },
          { value: "300", price: 300, label: { en: "Tier III — Bonus character artwork ($300+)", es: "Nivel III — Ilustración extra ($300+)", ru: "Уровень III — Дополнительный арт ($300+)" } },
          { value: "450", price: 450, label: { en: "AB — Reference sheet + close-ups ($450+)", es: "AB — Hoja de referencia + detalles ($450+)", ru: "AB — Референс-лист + детали ($450+)" } }
        ],
        addons: [
          { id: "feature", price: 50, label: { en: "Extra feature / variant (from +$50)", es: "Detalle o variante extra (desde +$50)", ru: "Дополнительная деталь / вариант (от +$50)" } }
        ],
        mults: [
          { id: "nda_a", mult: 1.35, badge: "+35%", label: { en: "Private / NDA", es: "Privado / NDA", ru: "Приватность / NDA" } }
        ],
        note: {
          en: "PSD files are available on request only for adoptables at AB or above. PSD files are not offered separately for commissions or YCH. From $200, one alternative is included; AB also includes NSFW. Below $200 or outside the included choice, NSFW is +$50. Tier inclusions are cumulative. Commercial use is not included automatically and requires a separate agreement and quote.",
          es: "Desde $200 se incluye una alternativa; AB también incluye NSFW. NSFW adicional o por debajo de $200: +$50. Los niveles incluyen lo anterior. El uso comercial no está incluido automáticamente y requiere un acuerdo y presupuesto separados.",
          ru: "От $200 включена одна альтернатива; в AB также включена NSFW. Ниже $200 или вне включённого выбора NSFW — +$50. Каждый уровень включает предыдущие бонусы. Коммерческое использование автоматически не включено и требует отдельного соглашения и расчёта."
        }
      },
      ych: {
        options: [
          { value: "30", price: 30, label: { en: "B&W Sketch ($30)", es: "Boceto en B/N ($30)", ru: "Ч/б скетч ($30)" } },
          { value: "65", price: 65, label: { en: "Color Sketch ($65)", es: "Boceto a color ($65)", ru: "Цветной скетч ($65)" } },
          { value: "120", price: 120, label: { en: "Full Render ($120)", es: "Render completo ($120)", ru: "Полный рендер ($120)" } },
          { value: "160", price: 160, label: { en: "AB — Full Render + NSFW ($160)", es: "AB — Render + NSFW ($160)", ru: "AB — Полный рендер + NSFW ($160)" } }
        ],
        addons: [
          { id: "outfit_y", price: 50, label: { en: "Extra outfit (+$50)", es: "Atuendo extra (+$50)", ru: "Дополнительный наряд (+$50)" } }
        ],
        mults: [
          { id: "nda_y", mult: 1.35, badge: "+35%", label: { en: "Private / NDA", es: "Privado / NDA", ru: "Приватность / NDA" } }
        ],
        note: {
          en: "YCH turnaround: up to 14 business days. NSFW must be discussed and agreed in advance. Commercial use requires a separate agreement and quote.",
          es: "Plazo de YCH: hasta 14 días laborables. El contenido NSFW debe acordarse de antemano. El uso comercial requiere un acuerdo y presupuesto separados.",
          ru: "Срок YCH: до 14 рабочих дней. NSFW нужно согласовать заранее. Коммерческое использование требует отдельного соглашения и расчёта."
        }
      }
    };

    function getProcessLabel(item) {
      if(item.processWork===7)return ({en:'Line + Color → Full Render',ru:'Лайн + цвет → Полный рендер',es:'Líneas + color → Render completo'})[currentLang];if(item.catalogWork){const model=(window.PORTFOLIO_WORKS||[]).find(w=>w.id===item.processWork);if(model?.historicalNote)return model.historicalNote[currentLang]||model.historicalNote.en;if(model?.historicalTier==='AB')return ['AB',model.year].filter(Boolean).join(' · ');if(model?.type==='single')return (model.labels[currentLang]||model.labels.en)[0];return model?.type==='process'?({en:'Art process',ru:'Процесс работы',es:'Proceso'})[currentLang]:model?.type==='ych'?({en:'Template → Examples',ru:'Шаблон → Примеры',es:'Plantilla → Ejemplos'})[currentLang]:({en:'Versions',ru:'Версии',es:'Versiones'})[currentLang];}
      const labels={en:['Art process','SFW / NSFW','Template → Result + Alt'],es:['Proceso','SFW / NSFW','Plantilla → Resultado + Alt'],ru:['Процесс работы','SFW / NSFW','Шаблон → Результат + Альт']};
      if(item.processWork===4)return ({en:'Template → Color Sketch + Alt',ru:'Шаблон → Цветной скетч + Альт',es:'Plantilla → Boceto a color + Alt'})[currentLang];if([5,6].includes(item.processWork))return ({en:'Template → Color Sketch',ru:'Шаблон → Цветной скетч',es:'Plantilla → Boceto a color'})[currentLang];if(item.processWork>=5)return ({en:'Template → Finished example',ru:'Шаблон → Готовый пример',es:'Plantilla → Ejemplo terminado'})[currentLang];return labels[currentLang][item.processWork===3?1:0];
    }
    function getGalleryKind(item) {
      const labels={en:{comm:'Commission',fanart:'Fan art',ych:'YCH',adopt:'Adopt',other:'Illustration'},ru:{comm:'Коммишен',fanart:'Фан-арт',ych:'YCH',adopt:'Адопт',other:'Иллюстрация'},es:{comm:'Encargo',fanart:'Fan art',ych:'YCH',adopt:'Adoptable',other:'Ilustración'}};
      return (labels[currentLang]||labels.en)[item.cat]||labels.en.other;
    }
    function getGallerySeries(item) {
      if(item.processWork===3)return 'Genshin Impact';
      if(item.id===6)return "Frieren: Beyond Journey’s End";return (window.PORTFOLIO_WORKS||[]).find(w=>w.id===item.processWork)?.series||'';
    }
    function getGalleryTitle(item) {
      if(item.localizedTitles)return item.localizedTitles[currentLang]||item.localizedTitles.en;
      if (item.processWork) {
        const names={en:['Illustration 2','Illustration 3','Wriothesley','Happy Bun','TH','All Plain to See'],es:['Ilustración 2','Ilustración 3','Wriothesley','Happy Bun','TH','All Plain to See'],ru:['Иллюстрация 2','Иллюстрация 3','Ризли','Happy Bun','TH','All Plain to See']};
        return names[currentLang][item.processWork-1];
      }
      if(item.id===3)return 'Thinking of You';
      if(item.id===6)return ({en:'Frieren',ru:'Фрирен',es:'Frieren'})[currentLang];
      const prefix = { en: "Portfolio Sample", es: "Muestra de portafolio", ru: "Пример портфолио" };
      return `${prefix[currentLang] || prefix.en} ${String(item.id).padStart(2, '0')}`;
    }
    function getGalleryDescription() {
      return ({
        en: "Public SFW portfolio sample. Open to view; ask me for details.",
        es: "Muestra pública SFW del portafolio. Ábrela para verla; escríbeme si quieres más detalles.",
        ru: "Публичный SFW-пример из портфолио. Откройте для просмотра, а за подробностями напишите мне."
      })[currentLang] || "Public SFW portfolio sample.";
    }
    function getGalleryStage(item) {
      if(item?.id===3)return ({en:'Color Sketch',ru:'Цветной скетч',es:'Boceto a color'})[currentLang];
      return ({ en: "SFW Sample", es: "Muestra SFW", ru: "SFW-пример" })[currentLang] || "SFW Sample";
    }
    function getGalleryPriceLabel() { return '↗'; }

    // Global State
    let currentLang = 'en'; // EN is main by default
    let currentPage = document.body.dataset.page || 'board';
    let currentPricingTab = 'custom';
    const CALC_MODE_STATE = { custom: { value: 'single', addons: [], mults: [] }, adopt: { value: '100', addons: [], mults: [] }, ych: { value: '30', addons: [], mults: [] } };
    let currentGalCat = 'all';
    let galleryAdultOnly = false;
    let gallerySearchQuery = '';
    function hasAdultArtwork(item) { return Boolean(item.nsfw || item.hasAdultVersion || [3,4].includes(item.processWork) || (window.PORTFOLIO_WORKS||[]).find(w=>w.id===item.processWork)?.nsfw.some(Boolean)); }
    function getGallerySearchHaystack(item) {
      const model = (window.PORTFOLIO_WORKS || []).find(w => w.id === item.processWork);
      const catTags = {
        comm: 'commission commissions коммишен коммишки заказ encargo encargos',
        adopt: 'adopt adopts adoptable adoptables адопт адопты',
        ych: 'ych your character here слот',
        fanart: 'fanart fan art фан-арт фанарт',
        other: 'other other works illustration illustrations иллюстрация другие работы ilustración otros trabajos'
      }[item.cat] || '';
      const parts = [
        item.title,
        getGalleryTitle(item),
        item.localizedTitles?.en,
        item.localizedTitles?.ru,
        item.localizedTitles?.es,
        item.id === 6 ? 'Frieren Фрирен' : '',
        item.processWork === 3 ? 'Wriothesley Ризли' : '',
        item.cat,
        getGalleryKind(item),
        catTags,
        getGallerySeries(item),
        item.processWork ? getProcessLabel(item) : getGalleryStage(item),
        item.id === 3 ? 'Color Sketch Цветной скетч Boceto a color' : '',
        Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''),
        model?.series,
        model?.character?.en,
        model?.character?.ru,
        model?.character?.es,
        model?.titles?.en,
        model?.titles?.ru,
        model?.titles?.es,
        model?.type,
        model?.designKind === 'twin' ? 'twin twins близнецы двойной gemelas' : model?.designKind,
        model?.historicalTier,
        model?.year,
        model?.historicalNote?.en,
        model?.historicalNote?.ru,
        model?.historicalNote?.es,
        ...(model?.labels?.en || []),
        ...(model?.labels?.ru || []),
        ...(model?.labels?.es || []),
        ...(Array.isArray(model?.tags) ? model.tags : []),
        hasAdultArtwork(item) ? '18+ nsfw mature adult' : 'sfw safe'
      ];
      return parts.filter(Boolean).join(' ').toLowerCase();
    }
    function matchesGalleryFilters(item) {
      if (item.gallery === false) return false;
      if (currentGalCat !== 'all' && item.cat !== currentGalCat) return false;
      if (galleryAdultOnly && !hasAdultArtwork(item)) return false;
      const q = gallerySearchQuery.trim().toLowerCase();
      if (!q) return true;
      const haystack = getGallerySearchHaystack(item);
      return q.split(/\s+/).every(token => haystack.includes(token));
    }
    function setGallerySearch(val) {
      gallerySearchQuery = String(val ?? '');
      const input = document.getElementById('gallery-search');
      if (input && 'value' in input && input.value !== gallerySearchQuery) input.value = gallerySearchQuery;
      renderGalleryGrid();
    }
    function toggleGalleryAdultOnly() { galleryAdultOnly=!galleryAdultOnly; renderGalleryGrid(); }
    let currentFaqCat = 'all';
    let isAdultVerified = false;try{isAdultVerified=sessionStorage.getItem('nektahr-demo-age-verified')==='yes'}catch{}
    let showNsfwGallery = false;try{showNsfwGallery=isAdultVerified&&sessionStorage.getItem('nektahr-demo-nsfw-visible')==='yes'}catch{}
    // Change the consent revision when the terms materially change.
    const TOS_CONSENT_KEY = 'nektahr-tos-consent-20261030-refunds';
    let tosAgreed = false;try{tosAgreed=sessionStorage.getItem(TOS_CONSENT_KEY)==='yes'}catch{}
    let ageModalReturnFocus = null;


/* Consistent tier names and explicit cumulative expression allowance. */
(()=>{
 const tierNames={en:['Tier I','Tier II','Tier III','Tier IV'],ru:['Тир I','Тир II','Тир III','Тир IV'],es:['Nivel I','Nivel II','Nivel III','Nivel IV']};
 for(const lang of ['en','ru','es']){
  const p=I18N[lang].pricing,tiers=tierNames[lang];
  p.adoptSection.tiers.forEach((t,i)=>{t.badge=tiers[i];if(i===0)t.title=t.title.replace(/^SB\s*[—–-]\s*/,'');});
  p.adoptSection.tiers[3].perks.push(({en:'3 extra expressions included in total',ru:'3 эмоции включены суммарно',es:'3 expresiones incluidas en total'})[lang]);
  p.ychSection.slots.forEach((slot,i)=>{slot.code=i===3?tiers[i]+' · AB':tiers[i];});
  const last=p.adoptSection.tiers[3];last.desc=last.desc.replace(/\bAB\b/g,tiers[3]);
 }
 for(const lang of ['en','ru','es']){CALC_CONFIG.adopt.note[lang]=CALC_CONFIG.adopt.note[lang].replace(/\bAB\b/g,tierNames[lang][3]);}
 CALC_CONFIG.ych.options.forEach((o,i)=>{for(const lang of ['en','ru','es'])if(o.label?.[lang])o.label[lang]=tierNames[lang][i]+' · '+o.label[lang];});
 CALC_CONFIG.adopt.options.forEach((o,i)=>{for(const lang of ['en','ru','es'])if(o.label?.[lang])o.label[lang]=o.label[lang].replace(/\bSB\b/g,tierNames[lang][0]).replace(/\bAB\b/g,tierNames[lang][3]);});
})();
