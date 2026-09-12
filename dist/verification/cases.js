// Measured placements on the supplied 1080 × 1920 reference canvases.
// Text and all foreground/background shapes are rendered by the reusable library.
const caption=(text,x,y,size=67.25,extra={})=>({text,x,y,size,...extra});
export const cases=[
 {id:'basics',name:'Plain, box & multiline',file:'IMG_3949.JPG',background:'#fefefe',captions:[
  caption('This is some simple text',540,478,66.05,{variant:'plain'}),
  caption('This is with border',540,775),
  caption('This is\nmultiline text\nthat\nwraps',540,1075)
 ]},
 {id:'snapping',name:'Intelligent width snapping',file:'IMG_3950.JPG',background:'#fefefe',captions:[
  caption('it intelligently\nsnaps\nxxxx\nsee\nhow\nthese\nare\nrectangles\nabove\ndespire being different widths',540,544)
 ]},
 {id:'sizes',name:'Four text sizes',file:'IMG_3951.JPG',background:'#fefefe',captions:[
  caption('it supports\nmultiple sizes cleanly',540,332,67.25),
  caption('it supports\nmultiple sizes cleanly',540,627,57.9),
  caption('it supports\nmultiple sizes cleanly',540,893,49.2),
  caption('it supports\nmultiple sizes cleanly',540,1113,36.2)
 ]},
 {id:'colors',name:'Ten background colors',file:'IMG_3952.JPG',background:'#fefefe',captions:[
  caption('it also supports\nmulti color',350,172,67.25,{color:'black'}),
  caption('it also supports\nmulti color',803,325,55.0,{color:'teal'}),
  caption('it also supports\nmulti color',377.5,495,67.25,{color:'red'}),
  caption('it also supports\nmulti color',803.5,677,46.55,{color:'cyan'}),
  caption('it also supports\nmulti color',356.5,783,67.25,{color:'orange'}),
  caption('it also supports\nmulti color',808,900,44.4,{color:'blue'}),
  caption('it also supports\nmulti color',358.5,1090,67.25,{color:'yellow'}),
  caption('it also supports\nmulti color',812.5,1094,39.65,{color:'indigo'}),
  caption('it also supports\nmulti color',822.5,1285,44.0,{color:'purple'}),
  caption('it also supports\nmulti color',346.5,1382,67.25,{color:'green'})
 ]},
 {id:'outlines',name:'Color & glyph outlines',file:'IMG_3953.JPG',background:'#fefefe',captions:[
  caption('This is a color demo',540,337.25,66.37,{variant:'outline',color:'yellow'}),
  caption('And a border demo',540,456,66.05,{variant:'plain',color:'yellow'}),
  caption('This is a color demo',540,936.25,66.37,{variant:'outline',color:'orange'}),
  caption('And a border demo',540,1068,66.05,{variant:'plain',color:'orange'})
 ]},
 {id:'borders',name:'Filled & hollow outlines',file:'IMG_3954.JPG',background:'#fa2c53',captions:[
  caption('More color/border demos',540,436,67.25,{variant:'outline'}),
  caption('More color/border demos',540,582,67.25,{variant:'hollow',color:'white'}),
  caption('More color/border demos',540,727,67.25,{variant:'outline',color:'orange'}),
  caption('More color/border demos',540,859,67.25,{variant:'outline',color:'yellow'}),
  caption('More color/border demos',540,996,67.25,{variant:'outline',color:'green'}),
  caption('More color/border demos',540,1144,67.25,{variant:'outline',color:'teal'}),
  caption('More color/border demos',540,1310,67.25,{variant:'outline',color:'cyan'})
 ]}
];
export function createCaption(c){
 const el=document.createElement('tiktok-text');el.textContent=c.text;
 for(const key of ['size','color','variant'])if(c[key]!==undefined)el.setAttribute(key,String(c[key]));
 el.style.position='absolute';el.style.left=(c.x-540)+'px';el.style.top=c.y+'px';el.style.width='1080px';
 if(c.style)Object.assign(el.style,c.style);return el;
}
export function createCanvas(test){const canvas=document.createElement('div');canvas.className='reference-canvas';Object.assign(canvas.style,{position:'relative',width:'1080px',height:'1920px',background:test.background,overflow:'hidden'});for(const c of test.captions)canvas.append(createCaption(c));return canvas;}
export function exampleCode(test){return `<!doctype html>\n<script type="module" src="./roundtext/roundtext.js"></script>\n<style>\n  body { margin: 0; }\n  .canvas { position: relative; width: 1080px; height: 1920px;\n    background: ${test.background}; overflow: hidden; }\n  tiktok-text { position: absolute; width: 1080px; }\n</style>\n<div class="canvas">\n`+test.captions.map(c=>`  <tiktok-text size="${c.size}"${c.variant?` variant="${c.variant}"`:''}${c.color?` color="${c.color}"`:''}\n    style="left: ${+(c.x-540).toFixed(2)}px; top: ${c.y}px;">${c.text.replaceAll('&','&amp;').replaceAll('<','&lt;')}</tiktok-text>`).join('\n')+'\n</div>';}
