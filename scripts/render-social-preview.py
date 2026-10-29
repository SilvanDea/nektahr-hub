from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import base64
r=Path(__file__).resolve().parents[1]/'assets';a=base64.b64encode((r/'favicon.png').read_bytes()).decode()
chips=[(76,150,'Gallery'),(242,142,'Prices'),(400,160,'Catalog'),(576,200,'ToS & FAQ')]
svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0b0a0e"/><rect x="28" y="28" width="1144" height="574" rx="20" fill="#141119"/><path d="M76 83h52" stroke="#e2b478" stroke-width="3"/><text x="76" y="143" fill="#e2b478" font-family="DejaVu Sans" font-size="25">CHARACTER ART</text><text x="68" y="280" fill="#f2ece4" font-family="DejaVu Serif" font-size="112">Nek’tahr</text><text x="76" y="353" fill="#c3b8aa" font-family="DejaVu Sans" font-size="30">Commissions · YCH · Adopts</text><circle cx="1000" cy="289" r="130" fill="#211b1e" stroke="#705542"/><image x="900" y="189" width="200" height="200" xlink:href="data:image/png;base64,'+a+'"/>'
for x,w,label in chips:svg+=f'<rect x="{x}" y="421" width="{w}" height="56" rx="9" fill="#211a20" stroke="#705542"/><text x="{x+w/2}" y="458" text-anchor="middle" fill="#e2b478" font-family="DejaVu Sans" font-size="25">{label.replace("&","&amp;")}</text>'
svg+='<path d="M76 516h1048" stroke="#e2b478" stroke-opacity=".25"/><text x="76" y="569" fill="#e2b478" font-family="DejaVu Sans" font-size="26">nektahr.com</text></svg>'
(r/'social-preview-v2.svg').write_text(svg)
s=2;im=Image.new('RGB',(2400,1260),'#0b0a0e');d=ImageDraw.Draw(im);box=lambda xs:tuple(int(x*s) for x in xs);font=lambda n,serif=False:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVu'+('Serif' if serif else 'Sans')+'.ttf',n*s)
d.rounded_rectangle(box((28,28,1172,602)),radius=40,fill='#141119');d.line(box((76,83,128,83)),fill='#e2b478',width=6)
for x,y,txt,n,c,serif in [(76,116,'CHARACTER ART',25,'#e2b478',False),(68,158,'Nek’tahr',112,'#f2ece4',True),(76,321,'Commissions · YCH · Adopts',30,'#c3b8aa',False),(76,539,'nektahr.com',26,'#e2b478',False)]:d.text((x*s,y*s),txt,font=font(n,serif),fill=c)
d.ellipse(box((870,159,1130,419)),fill='#211b1e',outline='#705542',width=2)
a=Image.open(r/'favicon.png').convert('RGBA').resize((400,400),Image.Resampling.LANCZOS);im.paste(a,(1800,378),a)
for x,w,label in chips:
 d.rounded_rectangle(box((x,421,x+w,477)),radius=18,fill='#211a20',outline='#705542',width=2);f=font(25);width=d.textlength(label,font=f);d.text(((x+w/2)*s-width/2,433*s),label,font=f,fill='#e2b478')
d.line(box((76,516,1124,516)),fill='#514238',width=2)
im.resize((1200,630),Image.Resampling.LANCZOS).save(r/'social-preview-v2.jpg',quality=92,optimize=True,progressive=False)
