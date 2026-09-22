/** Roundtext 0.2.1 · MIT · No dependencies. */

/** Trace the exact union of axis-aligned rectangles, then round both convex and concave corners. */
export function outline(rectangles, radius = 10) {
  const rects = rectangles.filter(r => r.right > r.left && r.bottom > r.top);
  if (!rects.length) return '';
  const xs = [...new Set(rects.flatMap(r => [r.left, r.right]))].sort((a,b)=>a-b);
  const ys = [...new Set(rects.flatMap(r => [r.top, r.bottom]))].sort((a,b)=>a-b);
  const w=xs.length-1, h=ys.length-1, cells=new Uint8Array(w*h);
  const xi=new Map(xs.map((x,i)=>[x,i])), yi=new Map(ys.map((y,i)=>[y,i]));
  for (const r of rects) for(let y=yi.get(r.top);y<yi.get(r.bottom);y++)
    for(let x=xi.get(r.left);x<xi.get(r.right);x++) cells[y*w+x]=1;
  const filled=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&cells[y*w+x];
  const edges=[], starts=new Map();
  function edge(x1,y1,x2,y2,dir){
    const e={a:[xs[x1],ys[y1]],b:[xs[x2],ys[y2]],dir,used:false};
    edges.push(e); const key=e.a.join(',');
    if(!starts.has(key)) starts.set(key,[]); starts.get(key).push(e);
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(filled(x,y)) {
    if(!filled(x,y-1)) edge(x,y,x+1,y,0);
    if(!filled(x+1,y)) edge(x+1,y,x+1,y+1,1);
    if(!filled(x,y+1)) edge(x+1,y+1,x,y+1,2);
    if(!filled(x-1,y)) edge(x,y+1,x,y,3);
  }
  const paths=[];
  for(const first of edges) {
    if(first.used) continue;
    const points=[]; let e=first;
    while(e&&!e.used) {
      e.used=true; points.push(e.a);
      const candidates=(starts.get(e.b.join(','))||[]).filter(c=>!c.used);
      // Right-hand turn first keeps point-touching components independent.
      const priority=d=>d===1?0:d===0?1:d===3?2:3;
      candidates.sort((a,b)=>priority((a.dir-e.dir+4)%4)-priority((b.dir-e.dir+4)%4));
      e=candidates[0];
    }
    const p=points.filter((v,i)=>{
      const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];
      return (v[0]-a[0])*(b[1]-v[1])!==(v[1]-a[1])*(b[0]-v[0]);
    });
    if(p.length<3) continue;
    const corners=p.map((v,i)=>{
      const a=p[(i+p.length-1)%p.length],b=p[(i+1)%p.length];
      const la=Math.hypot(v[0]-a[0],v[1]-a[1]),lb=Math.hypot(b[0]-v[0],b[1]-v[1]);
      const r=Math.max(0,Math.min(Number(radius)||0,la/2,lb/2));
      const u=[(v[0]-a[0])/la,(v[1]-a[1])/la], t=[(b[0]-v[0])/lb,(b[1]-v[1])/lb];
      return {before:[v[0]-u[0]*r,v[1]-u[1]*r],after:[v[0]+t[0]*r,v[1]+t[1]*r],r,sweep:u[0]*t[1]-u[1]*t[0]>0?1:0};
    });
    const f=n=>Math.round(n*1000)/1000, pt=p=>p.map(f).join(' ');
    let d=`M ${pt(corners[0].before)}`;
    for(const c of corners) d+=` L ${pt(c.before)}`+(c.r?` A ${f(c.r)} ${f(c.r)} 0 0 ${c.sweep} ${pt(c.after)}`:` L ${pt(c.after)}`);
    paths.push(d+' Z');
  }
  return paths.join(' ');
}

/** Snap near-neighbor edges transitively; compare original edges, not already widened ones. */
export function snapLines(rectangles, threshold) {
  const result=rectangles.map(r=>({...r}));
  for(const side of ['left','right']){
    const parent=result.map((_,i)=>i),find=i=>parent[i]===i?i:(parent[i]=find(parent[i]));
    for(let i=1;i<result.length;i++){
      if(rectangles[i].top<=rectangles[i-1].bottom && Math.abs(rectangles[i][side]-rectangles[i-1][side])<=threshold)
        parent[find(i)]=find(i-1);
    }
    const groups=new Map();
    for(let i=0;i<result.length;i++){
      const root=find(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(i);
    }
    for(const group of groups.values()){
      const value=Math[side==='left'?'min':'max'](...group.map(i=>rectangles[i][side]));
      for(const i of group)result[i][side]=value;
    }
  }
  return result;
}
export const colors = Object.freeze({
  black: { background:'#000000', text:'#ffffff', outline:'#000000', ink:'#ffffff' },
  white: { background:'#ffffff', text:'#000000', outline:'#ffffff', ink:'#000000' },
  red: { background:'#ea4040', text:'#ffffff', outline:'#ffffff', ink:'#ea4040' },
  orange: { background:'#ff923d', text:'#ffffff', outline:'#571b06', ink:'#ff923d' },
  yellow: { background:'#f2ce46', text:'#8e4d12', outline:'#86511a', ink:'#f2ce46' },
  green: { background:'#77c25d', text:'#ffffff', outline:'#ffffff', ink:'#77c25d' },
  teal: { background:'#00b09b', text:'#ffffff', outline:'#ffffff', ink:'#00b09b' },
  cyan: { background:'#00a8cd', text:'#ffffff', outline:'#ffffff', ink:'#00a8cd' },
  blue: { background:'#3496ef', text:'#ffffff', outline:'#ffffff', ink:'#3496ef' },
  indigo: { background:'#2444b3', text:'#ffffff', outline:'#ffffff', ink:'#2444b3' },
  purple: { background:'#5756d5', text:'#ffffff', outline:'#ffffff', ink:'#5756d5' }
});
let fontReady;
let instanceId=0;
export function ready(){
  if(typeof document==='undefined')return Promise.resolve();
  if(!fontReady){
    const face=new FontFace('Roundtext TikTok',`url("${new URL('./fonts/TikTokSans.ttf',import.meta.url)}")`,{weight:'300 900',style:'normal',stretch:'75% 150%',display:'swap'});
    document.fonts.add(face);
    fontReady=face.load().then(()=>document.fonts.ready).then(()=>undefined);
  }
  return fontReady;
}
const template=`<style>
:host{display:block;position:relative;isolation:isolate;box-sizing:border-box;font-family:'Roundtext TikTok',Arial,sans-serif;font-size:var(--rt-size,40px);font-weight:539;font-variation-settings:'opsz' 30.1,'wdth' 104.84;font-optical-sizing:none;line-height:1.208;text-align:var(--rt-align,center);color:var(--rt-color,var(--preset-text,#fff))}
.content{position:relative;z-index:1;display:block;box-sizing:border-box;transform:translateY(-.0375em);padding:var(--rt-py,.1335em) var(--rt-px,.437em);white-space:pre-wrap;overflow-wrap:anywhere}
svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0}
.background{fill:var(--rt-bg,var(--preset-bg,#000))}
.debug{fill:none;stroke:#ed4168;stroke-width:1;stroke-dasharray:4 3}
:host([variant='plain']) .background,:host([variant='outline']) .background,:host([variant='hollow']) .background{display:none}
:host([variant='plain']){color:var(--rt-color,var(--preset-plain,#000));font-weight:606;font-variation-settings:'opsz' 21.46,'wdth' 99.81}
:host([variant='outline']),:host([variant='hollow']){color:var(--rt-color,var(--preset-ink,#fff))}
.glyph-stroke{fill:none;stroke:var(--rt-outline,var(--preset-outline,#000));stroke-linejoin:round;stroke-linecap:round;paint-order:stroke fill}
:host([variant='hollow']) .content{color:transparent}
:host([variant='hollow']) .glyph-stroke{stroke:var(--rt-outline,var(--preset-bg,#fff))}
</style><svg aria-hidden="true" focusable="false" preserveAspectRatio="none"><path class="background"></path><g class="glyphs"></g><g class="boxes"></g></svg><span class="content"><slot></slot></span>`;

export class RoundText extends (globalThis.HTMLElement || class {}) {
  static observedAttributes=['style','class','dir','debug','size','color','variant','align','snap'];
  constructor(){
    super();this.attachShadow({mode:'open'}).innerHTML=template;this._maskId='rt-cutout-'+(++instanceId);
    this._schedule=()=>{cancelAnimationFrame(this._frame);this._frame=requestAnimationFrame(()=>this.refresh());};
  }
  connectedCallback(){
    this._resize=new ResizeObserver(this._schedule);this._resize.observe(this);this._resize.observe(this.shadowRoot.querySelector('.content'));
    this._mutations=new MutationObserver(this._schedule);
    this._mutations.observe(this,{subtree:true,childList:true,characterData:true,attributes:true});
    this.shadowRoot.querySelector('slot').addEventListener('slotchange',this._schedule);
    document.fonts?.addEventListener('loadingdone',this._schedule);
    ready().then(()=>{if(this.isConnected)this._schedule();}).catch(()=>this.dispatchEvent(new CustomEvent('roundtext:error',{detail:{message:'The caption font could not load. Check the fonts directory or your CSP.'}})));
    window.addEventListener('resize',this._schedule);this._sync();this._schedule();
  }
  disconnectedCallback(){
    this._resize?.disconnect();this._mutations?.disconnect();cancelAnimationFrame(this._frame);
    document.fonts?.removeEventListener('loadingdone',this._schedule);window.removeEventListener('resize',this._schedule);
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange',this._schedule);
  }
  attributeChangedCallback(name){if(this.isConnected){if(['size','color','variant','align'].includes(name))this._sync();this._schedule();}}
  _sync(){
    const set=(k,v)=>{if(this.style.getPropertyValue(k)!==v)this.style.setProperty(k,v);};
    const size=Number(this.getAttribute('size'));if(size>0)set('--rt-size',size+'px');else this.style.removeProperty('--rt-size');
    set('--rt-align',['left','center','right','start','end'].includes(this.getAttribute('align'))?this.getAttribute('align'):'center');
    const name=this.getAttribute('color')||'black',p=colors[name]||{background:name,text:'#ffffff',outline:'#000000',ink:name};
    for(const [k,v] of Object.entries({bg:p.background,text:p.text,ink:p.ink,outline:p.outline,plain:p.background}))set('--preset-'+k,v);
  }
  /** Call after external typography changes or await ready() before capturing. */
  refresh(){
    if(!this.isConnected)return;
    const content=this.shadowRoot.querySelector('.content'),box=content.getBoundingClientRect();
    const svg=this.shadowRoot.querySelector('svg'),path=svg.querySelector('.background');
    const glyphs=svg.querySelector('.glyphs'),debug=svg.querySelector('.boxes');glyphs.replaceChildren();debug.replaceChildren();svg.querySelector('defs')?.remove();glyphs.removeAttribute('mask');
    if(!box.width||!box.height){path.setAttribute('d','');return;}
    const css=getComputedStyle(content),hostCSS=getComputedStyle(this);
    const localWidth=parseFloat(css.width),localHeight=parseFloat(css.height);
    const sx=box.width/localWidth||1,sy=box.height/localHeight||1;
    const px=parseFloat(css.paddingLeft)||0,py=parseFloat(css.paddingTop)||0;
    const fontSize=parseFloat(hostCSS.fontSize)||40,lineHeight=parseFloat(hostCSS.lineHeight)||fontSize*1.208;
    const rects=[],runs=[],walker=document.createTreeWalker(this,NodeFilter.SHOW_TEXT),range=document.createRange();
    while(walker.nextNode()){
      const node=walker.currentNode;if(node.parentElement?.closest('script,style,[hidden]'))continue;
      for(const match of node.textContent.matchAll(/\S+/gu)){
        range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
        const fragments=[...range.getClientRects()].filter(r=>r.width>.01&&r.height>.01);
        for(const r of fragments)rects.push({left:(r.left-box.left)/sx,right:(r.right-box.left)/sx,top:(r.top-box.top)/sy,bottom:(r.bottom-box.top)/sy});
        if(fragments.length===1)runs.push({text:match[0],rect:rects[rects.length-1],element:node.parentElement});
        else if(fragments.length>1){
          // A long word may wrap: measure each Unicode code point for its outline.
          let offset=match.index;
          for(const char of match[0]){range.setStart(node,offset);range.setEnd(node,offset+char.length);const r=range.getBoundingClientRect();
            runs.push({text:char,rect:{left:(r.left-box.left)/sx,top:(r.top-box.top)/sy},element:node.parentElement});offset+=char.length;}
        }
      }
    }
    rects.sort((a,b)=>a.top-b.top||a.left-b.left);const lines=[];
    for(const r of rects){const cy=(r.top+r.bottom)/2;const line=lines.find(l=>Math.abs((l.top+l.bottom)/2-cy)<Math.min(l.bottom-l.top,r.bottom-r.top)*.4);
      if(line){line.left=Math.min(line.left,r.left);line.right=Math.max(line.right,r.right);line.top=Math.min(line.top,r.top);line.bottom=Math.max(line.bottom,r.bottom);}
      else lines.push({...r});}
    // Overlapping bands preserve TikTok's extra breathing room around wider lines.
    const bands=lines.map((l,i)=>{
      const rowTop=(l.top+l.bottom-lineHeight)/2-py;
      const previous=lines[i-1],next=lines[i+1];
      const joinsPrevious=previous&&l.top-previous.top<lineHeight*1.6;
      const joinsNext=next&&next.top-l.top<lineHeight*1.6;
      return {left:l.left-px,right:l.right+px,top:rowTop+(joinsPrevious?fontSize*.09:0),bottom:rowTop+lineHeight+py*2+(joinsNext?fontSize*.04:0)};
    });
    // One component is one bubble, even across explicit blank lines or reduced
    // vertical padding. Meet halfway across a gap without moving the text or
    // widening either line; already-overlapping bands keep their exact geometry.
    for(let i=1;i<bands.length;i++){
      const previous=bands[i-1],current=bands[i];
      if(current.top>previous.bottom){
        const seam=(previous.bottom+current.top)/2;
        previous.bottom=seam;current.top=seam;
      }
    }
    const radiusValue=hostCSS.getPropertyValue('--rt-radius').trim();
    const length=(s,fallback)=>{if(!s)return fallback;const n=parseFloat(s);return Number.isFinite(n)?Math.max(0,n*(s.endsWith('em')?fontSize:1)):fallback;};
    const radius=length(radiusValue,fontSize*.23);
    const snapped=this.getAttribute('snap')==='off'?bands:snapLines(bands,length(hostCSS.getPropertyValue('--rt-snap').trim(),radius*2));
    path.setAttribute('d',outline(snapped,radius));
    svg.setAttribute('viewBox',`0 0 ${localWidth} ${localHeight}`);
    const ns='http://www.w3.org/2000/svg',variant=this.getAttribute('variant');
    if(variant==='outline'||variant==='hollow'){
      for(const run of runs){const text=document.createElementNS(ns,'text'),cs=getComputedStyle(run.element||this);
        text.textContent=run.text;text.setAttribute('x',run.rect.left);text.setAttribute('y',run.rect.top+fontSize-fontSize*.0375);
        text.setAttribute('class','glyph-stroke');text.setAttribute('stroke-width',length(hostCSS.getPropertyValue('--rt-stroke').trim(),fontSize*.145));
        for(const prop of ['fontFamily','fontSize','fontWeight','fontStyle','fontVariationSettings','fontOpticalSizing','letterSpacing'])text.style[prop]=cs[prop];
        glyphs.append(text);
      }
      if(variant==='hollow'){
        const defs=document.createElementNS(ns,'defs'),mask=document.createElementNS(ns,'mask'),area=document.createElementNS(ns,'rect');
        mask.id=this._maskId;mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x',-fontSize);mask.setAttribute('y',-fontSize);mask.setAttribute('width',localWidth+fontSize*2);mask.setAttribute('height',localHeight+fontSize*2);
        for(const[k,v]of Object.entries({x:-fontSize,y:-fontSize,width:localWidth+fontSize*2,height:localHeight+fontSize*2,fill:'white'}))area.setAttribute(k,v);mask.append(area);
        for(const source of glyphs.children){const cut=source.cloneNode(true);cut.removeAttribute('class');cut.removeAttribute('stroke-width');cut.setAttribute('fill','black');cut.setAttribute('stroke','none');mask.append(cut);}
        defs.append(mask);svg.prepend(defs);glyphs.setAttribute('mask',`url(#${this._maskId})`);
      }
    }
    if(this.hasAttribute('debug'))for(const r of snapped){const el=document.createElementNS(ns,'rect');for(const[k,v]of Object.entries({x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top,class:'debug'}))el.setAttribute(k,String(v));debug.append(el);}
    this.dispatchEvent(new CustomEvent('roundtext:render',{detail:{lines:lines.length,path:path.getAttribute('d'),rectangles:snapped,unsnapped:bands}}));
  }
}
export class TikTokText extends RoundText {}
if(globalThis.customElements){
  if(!customElements.get('round-text'))customElements.define('round-text',RoundText);
  if(!customElements.get('tiktok-text'))customElements.define('tiktok-text',TikTokText);
}
