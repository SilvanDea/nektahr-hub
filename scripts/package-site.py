from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
out=root/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
# Explicit allowlist: never publish source, tests, integrations, npm or Git metadata.
for path in ['assets','index.html','404.html','pricing','catalog','gallery','queue','terms','faq','robots.txt','sitemap.xml','favicon.ico','CNAME']:
 src=root/path;dst=out/path
 if src.is_dir():shutil.copytree(src,dst)
 else:shutil.copy2(src,dst)
print('Packaged public files in _site/')
