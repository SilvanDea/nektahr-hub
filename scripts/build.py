#!/usr/bin/env python3
"""Deterministic static output. Node 22+ and Python 3; no package installation."""
from pathlib import Path
from html.parser import HTMLParser
import re,json,subprocess,hashlib,html,sys
ROOT=Path(__file__).resolve().parents[1]
import os
os.chdir(ROOT)
check='--check' in sys.argv
outputs={}
css=subprocess.check_output(['node','node_modules/tailwindcss/lib/cli.js','-i','src/tailwind.css','-c','tailwind.config.cjs','--minify'],stderr=subprocess.DEVNULL,text=True)
outputs['assets/utilities.css']=css
def emit(path,text): outputs[path]="\n".join(line.rstrip() for line in text.splitlines()).rstrip()+"\n"
emit('assets/translations.js',Path('src/translations.js').read_text())
emit('assets/app-state.js',Path('src/state.js').read_text())
emit('assets/app.js',Path('src/app.js').read_text())
snapshot=json.loads(subprocess.check_output(['node','scripts/static-content.cjs'],text=True))
# HTMLParser tracks nesting, so replacements preserve children and quoted > characters.
class Content(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=False);self.s=s;self.lines=[0];self.stack=[];self.edits=[]
  for m in re.finditer('\n',s):self.lines.append(m.end())
 def pos_offset(self):
  line,col=self.getpos();return self.lines[line-1]+col
 def handle_starttag(self,tag,attrs):
  if tag in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:return
  a=dict(attrs);self.stack.append((tag,a.get('id'),self.pos_offset()+len(self.get_starttag_text())))
 def handle_startendtag(self,tag,attrs):pass
 def handle_endtag(self,tag):
  if not self.stack:return
  t,id,start=self.stack.pop();assert t==tag,(t,tag,self.getpos())
  if id in snapshot:
   v=snapshot[id];self.edits.append((start,self.pos_offset(),v.get('html',html.escape(str(v.get('text',''))))))
def static_content(s):
 p=Content(s);p.feed(s)
 # An outer rendered block owns its descendants.
 selected=[]
 for edit in sorted(p.edits,key=lambda e:(e[0],-e[1])):
  if not selected or edit[0]>=selected[-1][1]:selected.append(edit)
 for a,b,v in reversed(selected):s=s[:a]+v+s[b:]
 return s
base=static_content(Path('src/page.html').read_text())
for route in json.loads(Path('src/routes.json').read_text()):
 s=base
 for key,value in route.items():s=s.replace('{{'+key+'}}',value)
 s=s.replace('<!-- APP_CONFIG -->','<script src="/assets/translations.js"></script>\n<script src="/assets/app-state.js"></script>')
 s=s.replace('<!-- APP_LOGIC -->','<script src="/assets/app.js"></script>')
 def section(m):
  classes=m[2].split();classes=[x for x in classes if x!='hidden']
  if m[1]!=route['page']:classes.append('hidden')
  return '<section id="page-'+m[1]+'" class="'+' '.join(classes)+'"'
 s=re.sub(r'<section id="page-([^"]+)" class="([^"]*)"',section,s)
 def navigation(m):
  active=m[2]==route['page']
  classes='nav-link px-2 py-1 '+('text-accent border-b border-accent' if active else 'text-textMuted hover:text-textMain')+' transition cursor-pointer'
  return re.sub(r'class="[^"]*"','class="'+classes+'"',m[1])+(' aria-current="page"' if active else '')+m[3]
 s=re.sub(r'(<a href="[^"]+" data-p="([^"]+)"[^>]*)(>)',navigation,s)
 # Every local stylesheet/script gets its own content-derived cache key.
 def version(m):
  p=m[2];data=outputs.get(p.lstrip('/'))
  raw=data.encode() if data is not None else Path(p.lstrip('/')).read_bytes()
  return m[1]+p+'?v='+hashlib.sha256(raw).hexdigest()[:12]+m[3]
 s=re.sub(r'((?:src|href)=")(/assets/[^"?]+\.(?:js|css))(?:\?[^\"]*)?(\")',version,s)
 emit(route['file'],s)
emit('404.html','''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Nek’tahr</title><style>body{background:#0b0a0e;color:#f2ece4;font:18px system-ui;padding:10vh 8vw}a{color:#e2b478}</style></head><body><h1>Page not found</h1><p>This address does not exist.</p><nav><a href="/">Home</a> · <a href="/gallery/">Gallery</a> · <a href="/pricing/">Pricing</a></nav></body></html>\n''')
failed=[]
for p,s in outputs.items():
 if check:
  if not Path(p).exists() or Path(p).read_text()!=s:failed.append(p)
 else:Path(p).write_text(s)
if failed:raise SystemExit('Stale generated files: '+', '.join(failed))
print(('Verified' if check else 'Generated')+f' {len(outputs)} files')
