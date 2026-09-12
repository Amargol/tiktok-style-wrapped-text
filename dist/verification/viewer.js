import {ready} from '../lib/roundtext.js';
import {cases,createCanvas,exampleCode} from './cases.js';
const $=id=>document.getElementById(id);
const report=await fetch('./metrics.json').then(r=>{if(!r.ok)throw Error('Measurements unavailable');return r.json();});
$('method').textContent=report.method;
let current=cases.find(c=>c.id===location.hash.slice(1))||cases[0],mode='split',downloadUrl;
for(const c of cases){const b=document.createElement('button');b.textContent=c.name;b.dataset.id=c.id;b.addEventListener('click',()=>{current=c;history.replaceState(null,'','#'+c.id);render();});$('cases').append(b);}
function resize(){
 const metric=report.results.find(r=>r.id===current.id),[x,y,x2,y2]=$('crop').checked?[Math.max(0,metric.bounds[0]-25),Math.max(0,metric.bounds[1]-25),Math.min(1080,metric.bounds[2]+25),Math.min(1920,metric.bounds[3]+25)]:[0,0,1080,1920];
 for(const prefix of ['original','render']){const frame=$(prefix+'-frame'),inner=$(prefix+'-inner'),scale=frame.clientWidth/(x2-x);frame.style.height=((y2-y)*scale)+'px';inner.style.transform=`matrix(${scale},0,0,${scale},${-x*scale},${-y*scale})`;}
}
async function render(){
 document.querySelectorAll('[data-id]').forEach(b=>{b.classList.toggle('active',b.dataset.id===current.id);b.setAttribute('aria-pressed',String(b.dataset.id===current.id));});
 const metric=report.results.find(r=>r.id===current.id);$('case-name').textContent=current.name;$('source-name').textContent=current.file;
 $('original').src='../references/'+current.file;$('overlay').src='../references/'+current.file;$('difference').src='./'+current.id+'-diff.png';
 $('live-render').replaceChildren(createCanvas(current));$('render-state').textContent='Loading font…';$('full-render').href='./render.html?case='+current.id;
 $('shape-iou').textContent=metric.backgroundIoU===null?'No filled boxes':(metric.backgroundIoU*100).toFixed(2)+'%';$('foreground-error').textContent=(metric.foregroundMAE*100).toFixed(2)+'%';
 const code=exampleCode(current);$('example-code').textContent=code;$('code-name').textContent=current.id+'.html';if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(new Blob([code],{type:'text/html'}));$('download-html').href=downloadUrl;$('download-html').download=current.id+'.html';
 resize();try{await ready();$('live-render').querySelectorAll('tiktok-text').forEach(t=>t.refresh());$('render-state').textContent='Live HTML + SVG';}catch{$('render-state').textContent='Font failed to load';}
}
const frames=new ResizeObserver(resize);frames.observe($('comparison'));
$('crop').addEventListener('change',resize);window.addEventListener('resize',resize);
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;$('comparison').className='comparison-view '+mode;document.querySelectorAll('[data-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('opacity-control').hidden=mode!=='overlay';$('render-label').textContent=mode==='split'?'LIVE LIBRARY RECREATION':mode==='overlay'?'ORIGINAL + LIVE RECREATION':'SAVED CHROME PIXEL DIFFERENCE ×4';resize();}));
$('opacity').addEventListener('input',()=>{$('overlay').style.opacity=$('opacity').value/100;$('opacity-value').textContent=$('opacity').value+'%';});
$('copy-example').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(exampleCode(current));$('toast').textContent='HTML copied';}catch{const r=document.createRange();r.selectNodeContents($('example-code'));const s=getSelection();s.removeAllRanges();s.addRange(r);$('toast').textContent='Code selected. Press Ctrl+C or ⌘C.';}$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200);});
render();
