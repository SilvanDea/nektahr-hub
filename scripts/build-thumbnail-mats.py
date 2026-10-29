from pathlib import Path
from PIL import Image
import json,statistics
r=Path(__file__).resolve().parents[1];mats={}
for p in sorted((r/'assets').rglob('*.webp')):
 with Image.open(p) as original:
  im=original.convert('RGBA');im.thumbnail((96,96));w,h=im.size
  if original.width/original.height>=.75:
   edges=[[(x,y) for y in range(min(3,h)) for x in range(w)],[(x,y) for y in range(max(0,h-3),h) for x in range(w)]];angle='180deg'
  else:
   edges=[[(x,y) for x in range(min(3,w)) for y in range(h)],[(x,y) for x in range(max(0,w-3),w) for y in range(h)]];angle='90deg'
  colors=[]
  for edge in edges:
   pixels=[im.getpixel(xy) for xy in edge];opaque=[p for p in pixels if p[3]>220]
   if len(opaque)<len(pixels)*.7:colors.append('#1b1721')
   else:colors.append('#'+''.join(f'{round(statistics.median(p[c] for p in opaque)):02x}' for c in range(3)))
  mats['/'+p.relative_to(r).as_posix()]='linear-gradient('+angle+','+','.join(colors)+')'
js='''/* Fixed portrait frames; colors extend the artwork edges without cropping it or duplicating adult imagery. */
(() => {
  const mats=PALETTES;
  const decorate=grid=>grid.querySelectorAll('img').forEach(img=>{
    const frame=img.parentElement;if(!frame)return;let path;try{path=new URL(img.getAttribute('src'),location.href).pathname}catch{return}
    frame.classList.add('thumbnail-mat');frame.style.setProperty('--mat-background',mats[path]||'linear-gradient(180deg,#211b27,#19151f)');
  });
  for(const id of ['gallery-cards-grid','catalog-grid','board-highlights-grid']){const grid=document.getElementById(id);if(!grid)continue;decorate(grid);new MutationObserver(()=>decorate(grid)).observe(grid,{childList:true});}
})();
'''.replace('PALETTES',json.dumps(mats,separators=(',',':')))
(r/'assets/thumbnail-mats.js').write_text(js)
print('Generated palettes:',len(mats))
