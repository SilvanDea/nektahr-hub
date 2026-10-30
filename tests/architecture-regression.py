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
 assert 'Payment' in s and 'Frequently Asked Questions' in s
 assert '3 extra expressions included in total' in s
 assert 'https://nektahr.com/assets/social-preview' in s
 for file in ['app.js','app-state.js','translations.js']:assert s.count('/assets/'+file+'?')==1
assert (R/'404.html').exists()
for p in list((R/'assets').glob('*.js'))+list((R/'src').glob('*.js')):subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
print('Architecture: 7 static routes, content hashes, metadata, English content, JS syntax, 404 passed')
