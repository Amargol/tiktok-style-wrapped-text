import './lib/roundtext.js';
const $=id=>document.getElementById(id),caption=$('caption'),wrap=$('caption-wrap');
let alignment='center',tab='html';
const defaultText='This is\nmultiline text\nthat\nwraps';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function values(){return {text:$('text').value,size:Number($('size').value),width:Number($('width').value),color:$('preset').value,variant:$('variant').value,snap:$('snap').checked};}
function custom(){return ['radius','px','py'].filter(k=>$(k).value!==''&&Number.isFinite(Number($(k).value))).map(k=>['--rt-'+k,Math.max(0,Number($(k).value))+'px']);}
function codes(){const v=values(),css=[['max-width',v.width+'px'],...custom()];const attrs=`size="${v.size}"${v.color!=='black'?` color="${v.color}"`:''}${v.variant!=='box'?` variant="${v.variant}"`:''}${alignment!=='center'?` align="${alignment}"`:''}${v.snap?'':' snap="off"'}`;
return {html:`<script type="module" src="./roundtext/roundtext.js"></script>\n\n<tiktok-text ${attrs}\n  style="${css.map(([k,v])=>k+': '+v).join('; ')}">${escape(v.text)}</tiktok-text>`,css:`/* Font, padding, corners, and snapping already have defaults. */\n.caption {\n${css.map(([k,v])=>'  '+k+': '+v+';').join('\n')}\n}\n\n/* Optional overrides:\n   --rt-bg: #000;\n   --rt-color: #fff;\n   --rt-outline: #fff;\n*/`,react:`import { TikTokText } from 'tiktok-style-wrapped-text/react';\n\n<TikTokText size={${v.size}} color="${v.color}"${v.variant!=='box'?` variant="${v.variant}"`:''}${alignment!=='center'?` align="${alignment}"`:''}${v.snap?'':' snap="off"'}\n  style={{ maxWidth: ${v.width}${custom().map(([k,v])=>`, '${k}': '${v}'`).join('')} }}>\n  {${JSON.stringify(v.text)}}\n</TikTokText>`};}
function renderCode(){$('live-code').textContent=codes()[tab];}
function update(){const v=values();caption.textContent=v.text;wrap.style.width=v.width+'px';for(const[k,x]of Object.entries({size:v.size,color:v.color,variant:v.variant,align:alignment,snap:v.snap?'on':'off'}))caption.setAttribute(k,x);for(const k of ['radius','px','py'])caption.style.removeProperty('--rt-'+k);for(const[k,v]of custom())caption.style.setProperty(k,v);$('size-value').textContent=v.size+'px';$('width-value').textContent=v.width+'px';$('preview-area').classList.toggle('outline-stage',v.variant==='hollow');renderCode();}
for(const id of ['text','size','width','radius','px','py'])$(id).addEventListener('input',update);
for(const id of ['variant','preset','snap'])$(id).addEventListener('change',update);
function setAlign(value){alignment=value;document.querySelectorAll('[data-align]').forEach(b=>{b.classList.toggle('active',b.dataset.align===value);b.setAttribute('aria-pressed',String(b.dataset.align===value));});}
document.querySelectorAll('[data-align]').forEach(b=>b.addEventListener('click',()=>{setAlign(b.dataset.align);update();}));
$('inspect').addEventListener('change',()=>caption.toggleAttribute('debug',$('inspect').checked));
$('reset').addEventListener('click',()=>{$('text').value=defaultText;$('size').value=40;$('width').value=460;$('preset').value='black';$('variant').value='box';$('snap').checked=true;for(const k of ['radius','px','py'])$(k).value='';setAlign('center');$('inspect').checked=false;caption.removeAttribute('debug');update();});
caption.addEventListener('roundtext:render',e=>{$('line-count').textContent=e.detail.lines;$('actual-width').textContent=Math.round(wrap.getBoundingClientRect().width);});
const tabs=[...document.querySelectorAll('[data-tab]')];function selectTab(b){tab=b.dataset.tab;tabs.forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1;});$('live-code').setAttribute('aria-labelledby',b.id);renderCode();}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>selectTab(b));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectTab(tabs[n]);tabs[n].focus();}});});
let toastTimer;function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2500);}
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const text=b.dataset.copy==='live-code'?codes()[tab]:$(b.dataset.copy).textContent;try{await navigator.clipboard.writeText(text);toast('Code copied to clipboard');}catch{const sel=getSelection(),r=document.createRange();r.selectNodeContents($(b.dataset.copy));sel.removeAllRanges();sel.addRange(r);toast('Code selected. Press Ctrl+C or ⌘C.');}}));
// Select by document order at a single reading line, not observer callback order.
// Never scroll or focus the sidebar as the active section changes.
const navLinks=[...document.querySelectorAll('.navgroup a[href^="#"], .onpage a[href^="#"]')];
const sections=[...document.querySelectorAll('main>section[id]')];
let navFrame=0,activeSection='';
function updateNavigation(){
  navFrame=0;
  const readingLine=document.querySelector('.header').getBoundingClientRect().bottom+48;
  let current=sections[0];
  for(const section of sections){
    const heading=section.querySelector('h1,h2')||section;
    if(heading.getBoundingClientRect().top<=readingLine)current=section;
    else break;
  }
  if(window.scrollY>0&&window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2)current=sections.at(-1);
  if(!current||current.id===activeSection)return;
  activeSection=current.id;
  for(const link of navLinks){
    const active=link.hash==='#'+activeSection;
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  }
}
function scheduleNavigation(){if(!navFrame)navFrame=requestAnimationFrame(updateNavigation);}
window.addEventListener('scroll',scheduleNavigation,{passive:true});
window.addEventListener('resize',scheduleNavigation);
window.addEventListener('hashchange',scheduleNavigation);
new ResizeObserver(scheduleNavigation).observe(document.querySelector('main'));
document.fonts?.ready.then(scheduleNavigation);
update();scheduleNavigation();
