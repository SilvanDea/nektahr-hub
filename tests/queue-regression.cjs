const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../assets/queue-manager.js','utf8');
let checks=0;const check=(test,message)=>{checks++;assert.ok(test,message)};
function client(seed){const nodes=new Map(),pending=[],timers=new Map(),memory=new Map(seed?[[ 'nektahr-public-queue-v4',JSON.stringify(seed) ]]:[]);let timer=0;
 const node=()=>({textContent:'',innerHTML:'',disabled:false,setAttribute(k,v){this[k]=v},addEventListener(){},remove(){this.removed=true},focus(){}});
 const ctx={console,Date,Intl,Math,JSON,setTimeout(fn,ms){timers.set(++timer,{fn,ms});return timer},clearTimeout(id){timers.delete(id)},setInterval(){},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},document:{documentElement:{lang:'en'},body:{dataset:{page:'queue'}},visibilityState:'visible',getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node,head:{append:n=>pending.push(n)}},QUEUE_API_URL:'https://example.test/queue',LIVE_QUEUE_DATA:null,LIVE_QUEUE_ERROR:false};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);
 return {ctx,nodes,pending,timers,memory,reply(payload){const name=new URL(pending.at(-1).src).searchParams.get('callback');ctx[name](payload)}};
}
{
 const c=client();c.reply({orders:[{id:'01',title:'visible',status:'Queued',public:true},{id:'02',title:'ZERO-PRIVATE',status:'Queued',public:0},{id:'03',title:'NO-PRIVATE',status:'Queued',public:'no'},{id:'04',title:'FALSE-PRIVATE',status:'Queued',public:false},{id:'05',title:'legacy',status:'Queued'},{id:'06',title:'PADDED-PRIVATE',status:'Queued',public:'false '},{id:'07',title:'NULL-PRIVATE',status:'Queued',public:null},[],null,'invalid']});
 check(c.nodes.get('queue-active-count').textContent===2,'Only public/legacy rows accepted; explicit denied flags rejected');
 check(!c.nodes.get('queue-table-body').innerHTML.includes('PRIVATE'),'Denied rows never rendered');
}
{
 const c=client();c.reply({orders:[{id:'021',displayName:'UNUSED-NAME',startedAt:'2026-01-01',title:'<img src=x onerror=alert(1)>',status:'Queued',acceptedAt:'2026-02-31'}, {id:'22',title:'done',status:'Delivered'},{id:'23',title:'cancelled',status:'Cancelled'},{id:'24',title:'hold',status:'Reserved',reservationUntil:'2026-12-01'}]});
 check(c.nodes.get('queue-active-count').textContent===1,'Closed rows excluded');check(c.nodes.get('queue-reserved-count').textContent===1,'Reservation counted separately');
 check(c.nodes.get('queue-table-body').innerHTML.includes('&lt;img'),'HTML escaped');check(!c.nodes.get('queue-table-body').innerHTML.includes('<img'),'No injected element');
 check(c.nodes.get('queue-table-body').innerHTML.includes('—'),'Invalid calendar date hidden');
 const saved=[...c.memory.values()].join('');check(!saved.includes('UNUSED-NAME'),'Unused display names are not cached');check(!saved.includes('startedAt'),'Unused work-start date not cached');
 c.nodes.get('queue-refresh').onclick();check(c.pending.length===2,'Manual refresh starts a request');c.nodes.get('queue-refresh').onclick();check(c.pending.length===2,'Concurrent refresh deduplicated');
 c.reply({error:'backend failure',orders:[]});check(c.nodes.get('queue-active-count').textContent===1,'Failure preserves last successful snapshot');check(c.nodes.get('queue-sync-status').textContent.includes('Could not refresh'),'Stale data labeled as failed refresh');check(!c.nodes.get('queue-refresh').disabled,'Retry re-enabled');
}
{
 const c=client();[...c.timers.values()].find(x=>x.ms===10000).fn();check(c.nodes.get('queue-sync-status').textContent.includes('unavailable'),'Timeout shown');check(c.nodes.get('queue-active-count').textContent==='—','Failed load is not presented as zero orders');
}
{
 const c=client({savedAt:Date.now(),orders:[{id:'9',title:'cached',status:'Queued'}]});check(c.pending.length===0,'Fresh cache avoids network');check(c.nodes.get('queue-active-count').textContent===1,'Fresh cache rendered');
}
// Exercise the Apps Script contract locally; no workbook or deployed endpoint is modified.
const api=fs.readFileSync(__dirname+'/../integrations/queue-api.gs','utf8');
function backend(values){const cache=new Map();const ctx={Date,JSON,SpreadsheetApp:{getActiveSpreadsheet:()=>({getSpreadsheetTimeZone:()=> 'UTC',getSheetByName:n=>n==='Queue'?{getDataRange:()=>({getValues:()=>values.map(r=>[...r])})}:null})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v),remove:k=>cache.delete(k)})},Utilities:{formatDate:d=>d.toISOString().slice(0,10),newBlob:s=>({getBytes:()=>Buffer.from(s)})},ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput:body=>({body,setMimeType(mime){this.mime=mime;return this}})}};vm.createContext(ctx);vm.runInContext(api,ctx);return ctx;}
{
 const ctx=backend([['Order ID','Title','Status','Public','Notes'],['1','public','Queued',true,'PRIVATE-NOTE-SENTINEL'],['2','private','Queued',false,'x'],['3','zero','Queued',0,'x'],['4','no','Queued','no','x']]);const out=ctx.doGet({parameter:{}});check(JSON.parse(out.body).orders.length===1,'Server public allowlist');check(!out.body.includes('PRIVATE-NOTE-SENTINEL'),'Notes never projected');check(!out.body.includes('Notes'),'Private field absent');check(ctx.doGet({parameter:{callback:'x);alert(1)//'}}).body.includes('Invalid callback'),'Unsafe JSONP callback rejected');
}
{
 const out=backend([['Wrong header'],['secret']]).doGet({parameter:{callback:'safe_callback'}});check(out.body.startsWith('safe_callback('),'Safe JSONP callback supported');check(out.body.includes('temporarily unavailable')&&!out.body.includes('secret'),'Schema error is sanitized');
}
console.log(JSON.stringify({suite:'queue-regression',checks,passed:true}));