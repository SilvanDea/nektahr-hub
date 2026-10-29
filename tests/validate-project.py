from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,re,hashlib
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ROUTES={'index.html':'board',**{x+'/index.html':('tos' if x=='terms' else x) for x in ['pricing','catalog','gallery','queue','terms','faq']}}
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.local=[];self.body=None;self.blank=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id'in a:self.ids.append(a['id'])
  if tag=='body':self.body=a.get('data-page')
  for key in ['href','src']:
   v=a.get(key,'')
   if v.startswith('/') and not v.startswith('//'):self.local.append(v.split('?',1)[0].split('#',1)[0])
  if tag=='a' and a.get('target')=='_blank':self.blank.append(a.get('rel',''))
refs=0;script_hashes=[]
for file,route in ROUTES.items():
 s=(ROOT/file).read_text();p=Page();p.feed(s);assert p.body==route,(file,p.body);assert not [k for k,v in Counter(p.ids).items() if v>1],file+' duplicate ids'
 for url in p.local:assert (ROOT/url.lstrip('/')).exists(),(file,url)
 refs+=len(p.local);assert all('noopener' in rel for rel in p.blank),file+' unsafe target'
 chunks=[x for x in re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',s) if x.strip()];business=s[s.index('const I18N ='):s.index("    let currentLang =")]+s[s.index('    function showToast'):s.index('</script>',s.index('    function showToast'))];business='\n'.join(line for line in business.splitlines() if not any(k in line for k in ["getElementById('path-a-tag')","getElementById('path-b-tag')"]));script_hashes.append(hashlib.sha256(business.encode()).hexdigest())
 assert 'gapkuro@gmail.com' not in s and '$65' not in s,file+' stale contact/price'
assert len(set(script_hashes))==1,'Application logic differs between routes'
works=json.loads((ROOT/'assets/portfolio-data.js').read_text().split(' = ',1)[1].rstrip(';\n'));items=json.loads((ROOT/'assets/catalog-data.json').read_text());ids={w['id'] for w in works};assert len(ids)==len(works);assert len({x['id'] for x in items})==len(items)
for w in works:
 n=len(w['images']);assert n==len(w['nsfw']) and 0<=w['thumb']<n
 for lang in ['en','ru','es']:assert len(w['labels'][lang])==n and w['titles'][lang]
 for u in w['images']:assert (ROOT/u.lstrip('/')).is_file(),u
 if 'comparisonPairs'in w:
  assert len(w['comparisonPairs'])==n
  for pair in w['comparisonPairs']:assert len(pair)==2 and all(isinstance(i,int) and 0<=i<n for i in pair)
for x in items:
 assert x['processWork'] in ids|{1,2,3,4,5,6};assert (ROOT/x['image'].lstrip('/')).is_file()
 assert x['saleMode']==('repeatable' if x['type']=='ych' else 'single')
 assert not(x['type']=='ych' and x['status']=='sold'),'Reusable template incorrectly sold out'
for x in works:
 if x['id']==73:assert x['disableComparison']
 if x['id']==72:assert x['comparisonPairs']==[[0,1],[0,1],[1,2],[0,3],[3,4],[3,5]]
images=0;secrets=[]
for p in ROOT.rglob('*'):
 if not p.is_file() or {'public','.openai'}.intersection(p.relative_to(ROOT).parts):continue
 if p.suffix.lower() in ['.webp','.png','.jpg','.jpeg','.ico']:
  with Image.open(p) as im:im.verify()
  images+=1
 if p.suffix in ['.html','.js','.json','.gs','.md']:
  if re.search(r'BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|(?:ghp_|github_pat_|sk_live_)[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{30,}',p.read_text()):secrets.append(str(p.relative_to(ROOT)))
assert not secrets,'Potential secret in: '+','.join(secrets)
print(json.dumps({'suite':'validate-project','routes':len(ROUTES),'local_html_refs':refs,'decoded_images':images,'catalog_items':len(items),'work_records':len(works),'shared_business_logic':'identical (intentional hero variants excluded)','secret_pattern_scan':'no matches','passed':True}))

# Static metadata must be useful before application JavaScript executes.
import xml.etree.ElementTree as ET
urls={e.text for e in ET.parse(ROOT/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert len(urls)==7
for file in ROUTES:
 markup=(ROOT/file).read_text();route='/' if file=='index.html' else '/'+file.split('/')[0]+'/'
 expected='https://nektahr.com'+route
 assert expected in urls
 assert f'<link rel="canonical" href="{expected}"' in markup
 assert f'property="og:url" content="{expected}"' in markup
 assert 'name="twitter:card" content="summary_large_image"' in markup
 assert 'property="og:image" content="https://nektahr.com/assets/social-preview-v4.jpg"' in markup
 nav=markup.split('<nav id="nav-links"',1)[1].split('</nav>',1)[0]
 assert len(re.findall(r'<a href="/',nav))==7 and '<button' not in nav
 assert '<option value="Discord">Discord</option><option value="Email">Email</option>' in markup
 assert 'https://discord.com/users/361511957129461781' in markup
assert 'Sitemap: https://nektahr.com/sitemap.xml' in (ROOT/'robots.txt').read_text()
with Image.open(ROOT/'assets/social-preview-v4.jpg') as im:assert im.size==(1200,630)
print(json.dumps({'suite':'static-metadata-and-navigation','routes':7,'passed':True}))
