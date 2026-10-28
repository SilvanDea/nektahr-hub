/** Public queue endpoint v2. Bind this script to the existing workbook.
 * Only Public=TRUE rows from Queue are returned. Never return Notes or client data.
 * Update the EXISTING deployment to preserve its URL.
 */
const PUBLIC_QUEUE_SHEET = 'Queue';
const PUBLIC_QUEUE_CACHE_KEY = 'public_queue_v2';
function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (callback && !/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({error:'Invalid callback'})).setMimeType(ContentService.MimeType.JSON);
  }
  let json;
  try {
    const cache = CacheService.getScriptCache();
    json = cache.get(PUBLIC_QUEUE_CACHE_KEY);
    if (!json) {
      const configuredId = PropertiesService.getScriptProperties().getProperty('QUEUE_SPREADSHEET_ID');
      const book = configuredId ? SpreadsheetApp.openById(configuredId) : SpreadsheetApp.getActiveSpreadsheet();
      if (!book) throw new Error('Workbook unavailable');
      const queue = book.getSheetByName(PUBLIC_QUEUE_SHEET);
      if (!queue) throw new Error('Queue unavailable');
      const values = queue.getDataRange().getValues();
      const headers = values.shift().map(value=>String(value).trim());
      const index = name=>headers.indexOf(name);
      ['Order ID','Title','Status','Public'].forEach(name=>{if(index(name)<0)throw new Error('Missing column')});
      const get = (row,name)=>index(name)<0?'':row[index(name)];
      const isPublic = value=>value===true || /^(true|yes|1)$/i.test(String(value).trim());
      const tz=book.getSpreadsheetTimeZone();
      const date = value=>value instanceof Date?Utilities.formatDate(value,tz,'yyyy-MM-dd'):(/^\d{4}-\d{2}-\d{2}/.test(String(value))?String(value).slice(0,10):'');
      // Order Date is a requested public date; no other Orders fields are emitted.
      const acceptedById = {};
      const ordersSheet = book.getSheetByName('Orders');
      if (index('Accepted At')<0 && ordersSheet) {
        const all = ordersSheet.getDataRange().getValues();const oh=all.shift().map(String);const oi=oh.indexOf('Order ID'),od=oh.indexOf('Order Date');
        if(oi>=0&&od>=0)all.forEach(row=>acceptedById[String(row[oi])]=date(row[od]));
      }
      const orders = values.filter(row=>isPublic(get(row,'Public'))).map(row=>{
        const orderId=String(get(row,'Order ID')).trim();
        return {orderId:orderId,displayName:String(get(row,'Display Name')||'').trim(),orderType:String(get(row,'Order Type')||'').trim(),title:String(get(row,'Title')||'').trim(),status:String(get(row,'Status')||'').trim(),sortOrder:Number(get(row,'Sort Order'))||0,acceptedAt:date(get(row,'Accepted At'))||acceptedById[orderId]||'',startedAt:date(get(row,'Started At')),estimatedCompletion:date(get(row,'Estimated Completion'))||date(get(row,'Deadline')),reservationUntil:date(get(row,'Reservation Until'))};
      });
      json=JSON.stringify({orders:orders});
      if(Utilities.newBlob(json).getBytes().length<90000)cache.put(PUBLIC_QUEUE_CACHE_KEY,json,60);
    }
  } catch(error) { json=JSON.stringify({orders:[],error:'Queue temporarily unavailable'}); }
  return ContentService.createTextOutput(callback?callback+'('+json+');':json).setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
}
// Run manually after editing the public queue when an immediate refresh is needed.
function clearPublicQueueCache(){CacheService.getScriptCache().remove(PUBLIC_QUEUE_CACHE_KEY)}