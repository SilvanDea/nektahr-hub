const fs=require('fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{}};vm.createContext(context);vm.runInContext(read('assets/portfolio-data.js'),context);
const works=context.window.PORTFOLIO_WORKS,ids=new Set();let media=0;
for(const w of works){
 assert(!ids.has(w.id),'Duplicate artwork '+w.id);ids.add(w.id);
 assert(w.images.length>0&&w.images.length===w.nsfw.length,'Adult flags '+w.id);
 assert(w.nsfw.every(v=>typeof v==='boolean'),'Boolean adult flags '+w.id);
 assert(Number.isInteger(w.thumb)&&w.thumb>=0&&w.thumb<w.images.length,'Thumbnail '+w.id);
 for(const lang of ['en','ru','es']){assert(w.titles[lang]?.trim(),'Title '+w.id+' '+lang);assert(w.labels[lang].length===w.images.length,'Stage labels '+w.id+' '+lang);assert(w.labels[lang].every(v=>v.trim()),'Empty label '+w.id);}
 for(const img of w.images){assert(img.startsWith('/assets/'),'External media '+img);assert(fs.existsSync(path.join(root,img)),img);media++;}
 if(w.comparisonPairs){assert(w.comparisonPairs.length===w.images.length);for(const pair of w.comparisonPairs)assert(pair.length===2&&pair.every(i=>Number.isInteger(i)&&i>=0&&i<w.images.length),'Pair '+w.id);}
}
const catalog=JSON.parse(read('assets/catalog-data.json'));const catalogIds=new Set();
for(const item of catalog){assert(!catalogIds.has(item.id),'Duplicate catalog '+item.id);catalogIds.add(item.id);if(item.processWork)assert(item.processWork<=6||ids.has(item.processWork),'Missing catalog artwork '+item.id);for(const l of ['en','ru','es'])assert(item.titles[l]?.trim(),'Catalog translation '+item.id);if(item.price?.amount!==undefined)assert(Number.isFinite(item.price.amount)&&item.price.amount>0,'Listing price '+item.id);}
// All languages must retain every key, list item and value type from English.
const config={};vm.createContext(config);const code=read('src/translations.js');vm.runInContext(code.slice(0,code.indexOf('    const UI_TEXT'))+';this.i18n=I18N;',config);
function shape(v){if(Array.isArray(v))return v.map(shape);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,shape(v[k])]));return typeof v;}
for(const l of ['ru','es'])assert.deepEqual(shape(config.i18n[l]),shape(config.i18n.en),'Translation structure '+l);
console.log(JSON.stringify({suite:'data-contracts',artworks:works.length,catalog:catalog.length,mediaReferences:media,languages:3,passed:true}));
