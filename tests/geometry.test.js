import test from 'node:test';
import assert from 'node:assert/strict';
import { outline } from '../dist/lib/roundtext.js';
const r=(left,top,right,bottom)=>({left,top,right,bottom});
function area(d){return d.split('Z').reduce((sum,sub)=>{const points=[...sub.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)].map(m=>[+m[1],+m[2]]);return sum+points.reduce((s,a,i)=>{const b=points[(i+1)%points.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;},0);}
test('traces a stepped caption, including inward circular corners',()=>{
 const rs=[r(0,0,200,40),r(40,40,160,80),r(20,80,180,120)];
 assert.equal(area(outline(rs,0)),19200);
 assert.match(outline(rs,10),/0 0 0 /);
 assert.match(outline(rs,10),/0 0 1 /);
});
test('overlap, containment and empty geometry',()=>{
 assert.equal(outline([],10),'');
 assert.equal(area(outline([r(0,0,100,100),r(20,20,40,40)],0)),10000);
 assert.equal(area(outline([r(0,0,80,80),r(40,40,100,100)],0)),8400);
});
test('disconnected components, shared edges, and point touching',()=>{
 assert.equal((outline([r(0,0,10,10),r(20,20,30,30)]).match(/M /g)||[]).length,2);
 assert.equal(area(outline([r(0,0,10,10),r(10,10,20,20)],0)),200);
 assert.equal((outline([r(0,0,10,10),r(10,0,20,10)]).match(/M /g)||[]).length,1);
});
test('hole has reverse winding, and short edges clamp large radii',()=>{
 const frame=[r(0,0,100,10),r(0,90,100,100),r(0,10,10,90),r(90,10,100,90)];
 assert.equal(area(outline(frame,0)),3600);
 assert.doesNotMatch(outline([r(0,0,100,30),r(.5,30,99.5,60)],100),/NaN|Infinity/);
});
test('200 deterministic rectangle unions preserve independently counted area',()=>{
 let state=417;const rand=n=>{state=(state*1664525+1013904223)>>>0;return state%n;};
 for(let trial=0;trial<200;trial++){
  const rs=Array.from({length:1+rand(10)},()=>{let x=rand(15),y=rand(15);return r(x,y,x+1+rand(8),y+1+rand(8));});
  let expected=0;for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(rs.some(r=>x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom))expected++;
  assert.equal(area(outline(rs,0)),expected,JSON.stringify(rs));
 }
});

test('TikTok width snapping groups transitive neighbors without swallowing a large step',async()=>{
 const {snapLines}=await import('../dist/lib/roundtext.js');
 const widths=[466,236,208,164,190,224,154,378,250,974];
 const input=widths.map((w,i)=>r(540-w/2,i*81,540+w/2,i*81+100));
 const got=snapLines(input,32);
 assert.deepEqual(got.slice(1,6).map(x=>x.right-x.left),[236,236,236,236,236]);
 assert.equal(got[6].right-got[6].left,154);
 assert.equal(got[9].right-got[9].left,974);
 assert.equal(input[3].right-input[3].left,164,'input is not mutated');
});
test('snapping respects blank lines and independent left/right alignment',async()=>{
 const {snapLines}=await import('../dist/lib/roundtext.js');
 const input=[r(0,0,100,40),r(0,40,110,80),r(0,140,120,180)];
 const got=snapLines(input,20);
 assert.equal(got[0].right,110);assert.equal(got[2].right,120);
 assert.equal(got[0].left,0);assert.equal(got[1].left,0);
});
