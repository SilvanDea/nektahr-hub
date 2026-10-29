const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const nodes=new Map();
class Node{constructor(){this.children=[];this.textContent='';this.parentElement={open:false};}set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}append(...els){this.children.push(...els)}after(){}setAttribute(k,v){this[k]=v}querySelector(){return null}addEventListener(){}focus(){}showModal(){this.open=true}close(){this.open=false}}
for(const id of ['calc-copy-btn','calc-preview-text','q-sub','header-status-badge','primary-contacts-grid','contacts-title']){const el=new Node();el.id=id;}
nodes.get('calc-preview-text').textContent='A private long brief with references: https://example.test/private';
let succeeds=true,copied=[],pending=[];
const ctx={document:{getElementById:id=>nodes.get(id)||null,createElement:()=>new Node(),body:new Node(),querySelectorAll:()=>[...nodes.values()].filter(x=>x.href?.startsWith('mailto:'))},currentLang:'en',renderAllText(){},recalcTotal(){},copyToClipboard:async(value)=>{copied.push(value);return succeeds;},setTimeout:fn=>{pending.push(fn);return pending.length},clearTimeout(){},encodeURIComponent};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../assets/contact-actions.js','utf8'),ctx);
let checks=0;function check(x,msg){checks++;assert.ok(x,msg)}
(async()=>{
 check(nodes.has('quote-discord')&&nodes.has('quote-email'),'Both contact actions exist before any copy');
 const email=nodes.get('email-open-app').href;check(email.startsWith('mailto:nektahr@gmail.com?subject='),'Email uses the confirmed contact');check(!decodeURIComponent(email).includes('private'),'The private long brief is not put in a mailto URL');
 check(nodes.get('contacts-intake').textContent==='Commissions open','Intake is displayed with contacts independently of queue data');nodes.get('quote-email').onclick();check(nodes.get('email-contact-dialog').open,'Email action visibly opens choices without an OS mail handler');await nodes.get('email-copy-address').onclick();check(copied.at(-1)==='nektahr@gmail.com','Address can be copied without a mail app');check(nodes.get('email-open-gmail').href==='https://mail.google.com/','A normal browser-based email option is available');copied=[];
 await ctx.copyCalcRequest();check(copied[0].includes('private'),'Full brief remains the clipboard payload');check(nodes.get('quote-copy-status').textContent.startsWith('Request copied'),'Success is reported only after clipboard success');
 nodes.get('calc-preview-text').textContent='Updated brief';ctx.recalcTotal();check(nodes.get('quote-copy-status').textContent==='','Editing invalidates an old copy confirmation');
 succeeds=false;await ctx.copyCalcRequest();check(nodes.get('quote-copy-status').textContent.startsWith('Could not copy'),'Clipboard failure is explicit');check(nodes.get('calc-preview-text').parentElement.open,'Failure exposes the manual-copy preview');
 check(nodes.get('quote-discord').href==='https://discord.com/users/361511957129461781','Discord points to the artist-provided user ID');check(nodes.get('quote-discord').target==='_blank'&&nodes.get('quote-discord').rel.includes('noopener'),'Discord opens safely in a separate tab');
 succeeds=true;ctx.currentLang='ru';ctx.renderAllText();check(nodes.get('quote-discord').textContent==='Открыть Discord'&&!nodes.get('quote-discord').onclick,'Discord navigation no longer overwrites the copied request');
 ctx.currentLang='es';ctx.renderAllText();check(nodes.get('quote-email').textContent==='Escribir por email','Spanish contact action');
 check(nodes.get('quote-contact-actions').children.length===3,'Rendering does not duplicate the contact panel');
 console.log(JSON.stringify({suite:'contact-regression',checks,passed:true}));
})().catch(err=>{console.error(err);process.exitCode=1});
