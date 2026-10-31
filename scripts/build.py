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
 s=s.replace('<!-- APP_CONFIG -->','<script src="/assets/translations.js" defer></script>\n<script src="/assets/app-state.js" defer></script>')
 s=s.replace('<!-- APP_LOGIC -->','<script src="/assets/app.js" defer></script>')
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
emit('404.html','''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found | Nek’tahr</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/assets/favicon-32.png" sizes="32x32">
  <style>
    :root {
      --bg: #0B0A0E;
      --card-bg: #141119;
      --accent: #E2B478;
      --text: #F2ECE4;
      --text-muted: #B7AABD;
      --border: rgba(226, 180, 120, 0.2);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: Inter, system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      line-height: 1.5;
    }
    .card-404 {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 48px 36px;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 24px rgba(226,180,120,0.12);
      position: relative;
      overflow: hidden;
    }
    .card-404::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }
    .badge-404 {
      display: inline-block;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(226, 180, 120, 0.1);
      border: 1px solid rgba(226, 180, 120, 0.3);
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    h1 {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 38px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 12px;
      letter-spacing: 0.02em;
    }
    p {
      color: var(--text-muted);
      font-size: 15px;
      margin-bottom: 32px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
    .btn-catalog {
      background: var(--accent);
      color: #0B0A0E;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 4px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
      box-shadow: 0 4px 20px rgba(226,180,120,0.3);
    }
    .btn-catalog:hover {
      background: #f0caa0;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(226,180,120,0.45);
    }
    nav.secondary-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      font-size: 13px;
      margin-top: 18px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
      width: 100%;
    }
    nav.secondary-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }
    nav.secondary-links a:hover {
      color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="card-404">
    <div class="badge-404">Error 404</div>
    <h1>Lost in the Sanctuary</h1>
    <p>The artwork or page you are looking for does not exist, has been archived, or was moved to another gallery.</p>
    <div class="actions">
      <a href="/catalog/" class="btn-catalog">Back to Catalog →</a>
      <nav class="secondary-links">
        <a href="/">Home</a>
        <span>·</span>
        <a href="/pricing/">Pricing</a>
        <span>·</span>
        <a href="/gallery/">Gallery</a>
        <span>·</span>
        <a href="/queue/">Queue</a>
        <span>·</span>
        <a href="/terms/">ToS</a>
      </nav>
    </div>
  </div>
</body>
</html>\n''')
failed=[]
for p,s in outputs.items():
 if check:
  if not Path(p).exists() or Path(p).read_text(encoding='utf-8')!=s:failed.append(p)
 else:Path(p).write_text(s,encoding='utf-8',newline='\n')
if failed:raise SystemExit('Stale generated files: '+', '.join(failed))
print(('Verified' if check else 'Generated')+f' {len(outputs)} files')
