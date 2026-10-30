(() => {let lang='en';try{const saved=localStorage.getItem('nektahr-hub-language');if(['en','ru','es'].includes(saved))lang=saved;}catch{}document.documentElement.dataset.initialLang=lang;})();
