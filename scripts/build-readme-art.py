"""Build self-contained SVG README previews with the bundled font and library geometry.
Run: python3 -m pip install fonttools; python3 scripts/build-readme-art.py
The illustrations use explicit line breaks and font advance widths; browser DOM
measurement remains the runtime's source of truth. No reference screenshots used.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
import json, subprocess, html, re
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/media';OUT.mkdir(parents=True,exist_ok=True)
font=instantiateVariableFont(TTFont(ROOT/'dist/lib/fonts/TikTokSans.ttf'),{'wght':539,'opsz':30.1,'wdth':104.84},inplace=False)
glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); units=font['head'].unitsPerEm
plainfont=instantiateVariableFont(TTFont(ROOT/'dist/lib/fonts/TikTokSans.ttf'),{'wght':606,'opsz':21.46,'wdth':99.81},inplace=False)
plainGlyphs=plainfont.getGlyphSet()
palette=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {colors} from './dist/lib/roundtext.js'; console.log(JSON.stringify(colors));"],cwd=ROOT))

def textpaths(text,size,plain=False):
    selected=plainGlyphs if plain else glyphs
    x=0; parts=[]
    for char in text:
        name=cmap.get(ord(char),'.notdef');g=selected[name];pen=SVGPathPen(selected);g.draw(pen)
        if pen.getCommands():parts.append(f'<path transform="translate({x:.3f} 0)" d="{pen.getCommands()}"/>')
        x+=g.width
    return f'<g transform="scale({size/units:.6f} {-size/units:.6f})">'+''.join(parts)+'</g>',x*size/units

def label(text,x,y,size=13,fill='#64748b'):
    p,w=textpaths(text,size)
    return f'<g transform="translate({x} {y})" fill="{fill}">{p}</g>'

def caption(text,x,y,size=42,color='black',variant='box',snap=True):
    lines=text.split('\n'); rendered=[textpaths(line,size,variant=='plain') for line in lines];lh=size*1.208;px=size*.437;py=size*.1335
    bands=[dict(left=-w/2-px,right=w/2+px,top=i*lh+(size*.09 if i else 0),bottom=(i+1)*lh+py*2+(size*.04 if i<len(lines)-1 else 0)) for i,(p,w) in enumerate(rendered)]
    js="import {outline,snapLines} from './dist/lib/roundtext.js';const r=JSON.parse(process.argv[1]); console.log(outline("+('snapLines(r,'+str(size*.46)+')' if snap else 'r')+','+str(size*.23)+'));'
    d=subprocess.check_output(['node','--input-type=module','-e',js,json.dumps(bands)],cwd=ROOT,text=True).strip()
    c=palette.get(color,dict(background=color,text='#fff',ink=color,outline='#fff'))
    ink=c['text'] if variant=='box' else (c['background'] if variant=='plain' else c['ink'])
    shapes=''.join(f'<g transform="translate({-w/2:.3f} {i*lh+size*.98:.3f})">{p}</g>' for i,(p,w) in enumerate(rendered))
    out=f'<g transform="translate({x} {y})">'
    if variant=='box':out+=f'<path d="{d}" fill="{c["background"]}"/>'
    if variant in ('outline','hollow'):
        # Non-scaling stroke keeps the desired pixel width through font-unit transforms.
        stroked=shapes.replace('<path ',f'<path vector-effect="non-scaling-stroke" ')
        if variant=='hollow':
            uid=f'm{int(x)}{int(y)}{int(size)}'
            out+=f'<defs><mask id="{uid}" maskUnits="userSpaceOnUse" x="-600" y="-100" width="1200" height="800"><rect x="-600" y="-100" width="1200" height="800" fill="white"/><g fill="black">{shapes}</g></mask></defs><g mask="url(#{uid})" fill="none" stroke="{c["outline"]}" stroke-width="{size*.145}" stroke-linejoin="round">{stroked}</g>'
        else:
            out+=f'<g fill="none" stroke="{c["outline"]}" stroke-width="{size*.145}" stroke-linejoin="round">{stroked}</g><g fill="{ink}">{shapes}</g>'
    else:out+=f'<g fill="{ink}">{shapes}</g>'
    return out+'</g>'

def rect(x,y,w,h,fill,r=20):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'
def save(name,w,h,content,title):
    definitions={}
    def reuse(match):
        before,d=match.group(1),match.group(2)
        d=re.sub(r'-?\d+\.\d+',lambda m: format(float(m[0]),'.2f').rstrip('0').rstrip('.'),d)
        if d not in definitions: definitions[d]='g'+str(len(definitions))
        return f'<use xlink:href="#{definitions[d]}" {before}/>'
    content=re.sub(r'<path ([^>]*?)d="([^"]+)"/>',reuse,content)
    defs='<defs>'+''.join(f'<path id="{id}" vector-effect="non-scaling-stroke" d="{d}"/>' for d,id in definitions.items())+'</defs>'
    content=defs+content
    (OUT/(name+'.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title>{content}</svg>')

# Hero: editorial cards, deliberate contrast, no app chrome or reference images.
s=rect(0,0,1200,640,'#0c1220',28)
s+=label('ONE TAG. EVERY MOOD.',44,44,15,'#94a3b8')
s+=rect(28,72,556,360,'#dcebe6')+rect(604,72,568,170,'#f8dec9')+rect(604,262,568,170,'#5b4acb')
s+=label('CONNECTED BACKGROUND',54,105,12,'#507365')
s+=caption('Take the\nscenic route.',306,185,62,'black')
s+=label('ROUNDED OUTLINE',630,103,12,'#9b664b')+caption('Golden hour.',888,139,54,'orange','outline')
s+=label('HOLLOW LETTERS',630,293,12,'#dedaff')+caption('Stay curious.',888,328,53,'white','hollow')
s+=rect(28,452,1144,160,'#172236')+label('PLAIN TEXT',54,483,12,'#94a3b8')+caption('Make something worth sharing.',600,510,48,'white','plain')
save('showcase',1200,640,s,'Connected captions, orange outlined letters, hollow white letters on purple, and plain white text on navy')

# Palette.
s=rect(0,0,1200,680,'#f4f6fa',28)+label('A COLOR FOR EVERY STORY',36,46,18,'#162235')
for i,color in enumerate([*palette,'#be185d']):
    x=24+(i%4)*294;y=72+(i//4)*198
    s+=rect(x,y,276,180,'#1d293d' if color=='white' else '#ffffff',16)
    s+=caption('Find your\nhappy place.',x+138,y+38,32,color)
    s+=label(color,x+18,y+160,13,'#aabbd2' if color=='white' else '#64748b')
save('palette',1200,680,s,'Eleven color presets and one custom rose color, each showing Find your happy place')

# Sizes, placed on a shared baseline.
s=rect(0,0,1200,320,'#edf0fc',28)+label('SMALL LABEL. BIG STATEMENT.',36,44,18,'#29385c')
for i,size in enumerate([20,28,40,56]):
    x=150+i*300;s+=caption('Big\nideas.',x,230-(2*1.208+.267)*size,size,'indigo');s+=label('size="'+str(size)+'"',x-35,275,14,'#566384')
save('sizes',1200,320,s,'Big ideas in indigo at 20, 28, 40, and 56 pixels')

# Snapping comparison and the preserved step.
s=rect(0,0,1200,460,'#f4f6fa',28)+label('SMALL DIFFERENCES SNAP. BIG DIFFERENCES STEP.',36,44,18,'#162235')
for x,title,sub in [(24,'SNAPPING OFF','Each line keeps its own width.'),(414,'SNAPPING ON','Nearby widths become one block.'),(804,'KEEP THE SILHOUETTE','Larger changes keep rounded steps.')]:
    s+=rect(x,72,372,364,'#fff',16)+label(title,x+22,104,13,'#64748b')+label(sub,x+22,409,14,'#64748b')
s+=caption('less\nnoise\nmore\nfocus',210,134,40,snap=False)
s+=caption('less\nnoise\nmore\nfocus',600,134,40)
s+=caption('Take the\nscenic route.',990,195,39,'teal')
save('snapping',1200,460,s,'Snapping off and on for less noise more focus, beside a teal stepped caption')
print('Built 4 self-contained SVG previews with library geometry and TikTok Sans paths.')
