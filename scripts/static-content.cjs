// Render editorial English content with the same functions used in the browser.
// No network, cookies, consent or queue data is read during generation.
const fs=require('fs'),vm=require('node:vm');
const values={};const node=id=>values[id]??=( {setAttribute(){},closest(){return node('_parent')},classList:{toggle(){},add(){},remove(){}}});
const context={console,document:{addEventListener(){},body:{dataset:{page:'board'}},getElementById:node,querySelector:()=>node('_query'),querySelectorAll:()=>[]},sessionStorage:{getItem:()=>null},setTimeout(){},clearTimeout(){}};
context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync('assets/portfolio-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('src/translations.js','utf8')+fs.readFileSync('src/state.js','utf8'),context);
const logic=fs.readFileSync('src/app.js','utf8').split('    // Apply the saved language')[0];
vm.runInContext(logic,context);
vm.runInContext('buildIndividualCalculator=()=>{};renderGalleryGrid=()=>{};renderLiveQueue=()=>{};renderAllText();',context);
console.log(JSON.stringify(Object.fromEntries(Object.entries(values).filter(([id,n])=>!id.startsWith('_')&&(n.textContent!==undefined||n.innerHTML!==undefined)).map(([id,n])=>[id,n.innerHTML!==undefined?{html:n.innerHTML}:{text:n.textContent}]))));
