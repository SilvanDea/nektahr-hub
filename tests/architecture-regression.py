from pathlib import Path
import json,re,subprocess,hashlib
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
subprocess.run(['python',str(R/'scripts/build.py'),'--check'],check=True)
for route in json.loads((R/'src/routes.json').read_text()):
 s=(R/route['file']).read_text()
 assert '{{' not in s
 assert '<script>' not in s and '<style>' not in s
 assert 'language-loading body' not in s
 assert f'<section id="page-{route["page"]}" class="page-section hidden' not in s
 assert s.count('aria-current="page"')==1
 for url,rev in re.findall(r'(?:src|href)="(/assets/[^"?]+\.(?:js|css))\?v=([a-f0-9]+)"',s):
  assert hashlib.sha256((R/url.lstrip('/')).read_bytes()).hexdigest().startswith(rev)
 assert 'Payment' in s and 'Got questions?' in s
 assert '3 extra expressions included in total' in s
 assert 'https://nektahr.com/assets/social-preview' in s
 for file in ['app.js','app-state.js','translations.js']:assert s.count('/assets/'+file+'?')==1
assert (R/'404.html').exists()
for p in list((R/'assets').glob('*.js'))+list((R/'src').glob('*.js')):subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
print('Architecture: 7 static routes, content hashes, metadata, English content, JS syntax, 404 passed')
# Business prices and transport contracts: listing-specific bases must not become global tiers.
state=(R/'assets/app-state.js').read_text()
assert 'value: "110"' not in state
assert '$110' not in (R/'assets/translations.js').read_text()
for folder in ['src','assets']:
 for p in (R/folder).rglob('*'):
  if p.suffix in ['.js','.html','.json']:assert 'nektahr.carrd.co/assets/images/' not in p.read_text(),p
assert '?callback=' not in state
assert "createElement('script')" not in (R/'assets/queue-manager.js').read_text()
print('Global adopt bases, same-domain images and JSON-only queue contracts passed')
