from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops
r=Path(__file__).resolve().parents[1]/'assets'
# Center the visible artwork, not its original transparent canvas.
source=Image.open(r/'avatar-social.webp').convert('RGBA');aw,ah=source.size
fit=216/max(aw,ah);vw,vh=aw*fit,ah*fit;vx,vy=1000-vw/2,289-vh/2
chips=[(76,150,'Gallery'),(242,142,'Prices'),(400,160,'Catalog'),(576,200,'ToS & FAQ')]
svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="portrait-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white"/><stop offset=".76" stop-color="white"/><stop offset=".9" stop-color="#888"/><stop offset="1" stop-color="black"/></linearGradient><mask id="portrait-mask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#portrait-fade)"/></mask></defs><rect width="1200" height="630" fill="#0b0a0e"/><rect x="28" y="28" width="1144" height="574" rx="20" fill="#141119"/><path d="M76 83h52" stroke="#e2b478" stroke-width="3"/><text x="76" y="143" fill="#e2b478" font-family="DejaVu Sans" font-size="25">CHARACTER ART</text><text x="68" y="280" fill="#f2ece4" font-family="DejaVu Serif" font-size="112">Nek’tahr</text><text x="76" y="353" fill="#c3b8aa" font-family="DejaVu Sans" font-size="30">Commissions · YCH · Adopts</text><circle cx="1000" cy="289" r="152" fill="none" stroke="#40312d"/><path d="M1000 119v24m-12-12h24M1152 282v20m-10-10h20M856 432v20m-10-10h20" stroke="#e2b478" stroke-width="2"/><circle cx="1000" cy="289" r="130" fill="#211b1e" stroke="#705542"/><image x="AVATAR_X" y="AVATAR_Y" width="AVATAR_W" height="AVATAR_H" mask="url(#portrait-mask)" xlink:href="avatar-social.webp"/>'
svg=svg.replace('AVATAR_X',str(vx)).replace('AVATAR_Y',str(vy)).replace('AVATAR_W',str(vw)).replace('AVATAR_H',str(vh))
for x,w,label in chips:svg+=f'<rect x="{x}" y="421" width="{w}" height="56" rx="9" fill="#211a20" stroke="#705542"/><text x="{x+w/2}" y="458" text-anchor="middle" fill="#e2b478" font-family="DejaVu Sans" font-size="25">{label.replace("&","&amp;")}</text>'
svg+='<path d="M76 516h1048" stroke="#e2b478" stroke-opacity=".25"/><text x="76" y="569" fill="#e2b478" font-family="DejaVu Sans" font-size="26">nektahr.com</text></svg>'
(r/'social-preview-v4.svg').write_text(svg)
s=2;im=Image.new('RGB',(2400,1260),'#0b0a0e');d=ImageDraw.Draw(im);box=lambda xs:tuple(int(x*s) for x in xs);font=lambda n,serif=False:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVu'+('Serif' if serif else 'Sans')+'.ttf',n*s)
d.rounded_rectangle(box((28,28,1172,602)),radius=40,fill='#141119');d.line(box((76,83,128,83)),fill='#e2b478',width=6)
for x,y,txt,n,c,serif in [(76,116,'CHARACTER ART',25,'#e2b478',False),(68,158,'Nek’tahr',112,'#f2ece4',True),(76,321,'Commissions · YCH · Adopts',30,'#c3b8aa',False),(76,539,'nektahr.com',26,'#e2b478',False)]:d.text((x*s,y*s),txt,font=font(n,serif),fill=c)
d.ellipse(box((848,137,1152,441)),outline='#40312d',width=2)
for x,y in [(1000,131),(1152,292),(856,442)]:d.line(box((x-10,y,x+10,y)),fill='#e2b478',width=4);d.line(box((x,y-10,x,y+10)),fill='#e2b478',width=4)
d.ellipse(box((870,159,1130,419)),fill='#211b1e',outline='#705542',width=2)
a=source.resize((round(vw*s),round(vh*s)),Image.Resampling.LANCZOS)
fade=Image.new('L',a.size,255);fd=ImageDraw.Draw(fade)
for y in range(a.height):
 t=max(0,min(1,(y/(a.height-1)-.76)/.24));opacity=round(255*(1-t*t*(3-2*t)));fd.line((0,y,a.width,y),fill=opacity)
a.putalpha(ImageChops.multiply(a.getchannel('A'),fade));im.paste(a,(round(vx*s),round(vy*s)),a)
for x,w,label in chips:
 d.rounded_rectangle(box((x,421,x+w,477)),radius=18,fill='#211a20',outline='#705542',width=2);f=font(25);width=d.textlength(label,font=f);d.text(((x+w/2)*s-width/2,433*s),label,font=f,fill='#e2b478')
d.line(box((76,516,1124,516)),fill='#514238',width=2)
im.resize((1200,630),Image.Resampling.LANCZOS).save(r/'social-preview-v4.jpg',quality=92,optimize=True,progressive=False)
