// Elenco do Clubex (desenhos do Davy, tirados de Videos/Clubex/elenco). Fica isolado em CLUBEX para não brigar com personagens.js.
(() => {
// gerado de C:/Users/Davy/Videos/Clubex/elenco/index.html

const O='#241726';
const L=(x1,y1,x2,y2,w,c)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${O}" stroke-width="${w+10}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const E=(cx,cy,rx,ry,c,sw=6)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" stroke="${O}" stroke-width="${sw}"/>`;
const C=(cx,cy,r,c,sw=6)=>E(cx,cy,r,r,c,sw);
const P=(d,c,sw=6)=>`<path d="${d}" fill="${c}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const S=(d,w=5,c=O)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const SPL=n=>Array(n-1).fill('.42 0 .58 1').join(';');
function anim(type,v,dur,kt,extra=''){const n=v.split(';').length;kt=kt||Array.from({length:n},(_,i)=>(i/(n-1)).toFixed(3)).join(';');return `<animateTransform attributeName="transform" type="${type}" values="${v}" keyTimes="${kt}" calcMode="spline" keySplines="${SPL(n)}" dur="${dur}s" repeatCount="indefinite" ${extra}/>`;}
const R=(a,cx,cy)=>a.map(x=>`${x} ${cx} ${cy}`).join(';');
const rot=(a,cx,cy,dur,kt)=>anim('rotate',R(a,cx,cy),dur,kt);
const tr=(v,dur,kt)=>anim('translate',v,dur,kt,'additive="sum"');
const G=(inner,...an)=>`<g>${an.join('')}${inner}</g>`;
const blink=(inner,dur=3.6,delay=0)=>`<g opacity="0">${inner}<animate attributeName="opacity" values="0;0;1;0;0;1;0" keyTimes="0;0.86;0.88;0.9;0.94;0.96;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>`;
const shadow=rx=>`<ellipse cx="0" cy="4" rx="${rx}" ry="${(rx*0.14).toFixed(1)}" fill="rgba(0,0,0,.38)"/>`;
const star=(x,y,r,c,d)=>`<path class="spark" style="animation-delay:${d}s" d="M${x},${y-r} L${x+r*.28},${y-r*.28} L${x+r},${y} L${x+r*.28},${y+r*.28} L${x},${y+r} L${x-r*.28},${y+r*.28} L${x-r},${y} L${x-r*.28},${y-r*.28} Z" fill="${c}"/>`;
function body(inner,{sh=60,br=2.8,mode='idle'}={}){
  if(mode==='hop')return `<g class="shhop">${shadow(sh)}</g><g class="hop"><g class="br" style="animation-duration:${br}s">${inner}</g></g>`;
  if(mode==='float')return `<g class="shfl">${shadow(sh)}</g><g class="float">${inner}</g>`;
  return `${shadow(sh)}<g class="sway"><g class="br" style="animation-duration:${br}s">${inner}</g></g>`;
}
const DEFS=`<defs><radialGradient id="gold"><stop offset="0" stop-color="#FFD75E" stop-opacity=".55"/><stop offset=".6" stop-color="#E7B52C" stop-opacity=".15"/><stop offset="1" stop-color="#E7B52C" stop-opacity="0"/></radialGradient><radialGradient id="holy"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".7"/><stop offset="1" stop-color="#FFF4C8" stop-opacity="0"/></radialGradient><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151230"/><stop offset="1" stop-color="#3a2b52"/></linearGradient></defs>`;

function homemDistinto(){
  const Y='#F2C230',W='#EEE8DC',Rd='#8E1C22';let b='';
  b+=G(P('M-50,-292 C-92,-220 -112,-120 -102,-58 L102,-58 C112,-120 92,-220 50,-292 Z',Rd),rot([0,2.5,0,-2.5,0],0,-292,3.4));
  b+=L(-20,-125,-24,-18,20,'#2A2630')+L(20,-125,26,-18,20,'#2A2630');
  b+=E(-32,-12,26,12,'#B3202A')+E(34,-12,26,12,'#B3202A');
  b+=P('M-56,-298 L56,-298 L74,-112 L-74,-112 Z',W);
  b+=P('M-24,-296 L24,-296 L28,-122 L-28,-122 Z','#1C1A22');
  b+=P('M-10,-294 L10,-294 L6,-252 L0,-242 L-6,-252 Z','#E9B92E',4);
  b+=C(0,-205,10,'#C8202C',5);
  b+=P('M-56,-298 L-28,-298 L-50,-248 Z',Rd,5)+P('M56,-298 L28,-298 L50,-248 Z',Rd,5);
  b+=L(-58,-284,-80,-188,16,W)+C(-82,-176,13,Y,5);
  const kt='0;.3;.38;.5;.56;.6;.75;.8;1';
  b+=G(L(58,-284,82,-188,16,W)+C(84,-176,13,Y,5)+S('M90,-168 L98,-158 M84,-164 L90,-152',4),rot([0,0,14,-82,-70,-76,-76,-76,0],58,-284,4,kt));
  let h='';
  h+=E(0,-352,50,56,Y);
  h+=S('M2,-384 a5,5 0 1,1 5,5 a9,9 0 1,1 -11,-9 a13,13 0 1,1 17,14',3.5);
  h+=P('M-38,-356 L-8,-350 L-12,-340 L-35,-346 Z','#fff',4)+P('M38,-356 L8,-350 L12,-340 L35,-346 Z','#fff',4);
  h+=G(C(-20,-347,3,O,0)+C(20,-347,3,O,0),tr('0 0;0 0;3 0;3 0;0 0',4,'0;.4;.5;.8;1'));
  h+=blink(P('M-40,-358 L-6,-351 L-10,-338 L-37,-344 Z',Y,4)+P('M40,-358 L6,-351 L10,-338 L37,-344 Z',Y,4),4.4,1);
  h+=S('M-12,-320 L12,-320',4)+P('M-7,-316 L7,-316 L0,-299 Z',O,2);
  h+=`<rect x="-36" y="-470" width="72" height="66" fill="#17151C" stroke="${O}" stroke-width="5"/><rect x="-36" y="-424" width="72" height="12" fill="#C8202C"/>`+E(0,-404,60,11,'#17151C',5);
  b+=G(G(h,rot([0,0,7,0,0],0,-300,4,'0;.5;.58;.7;1')),rot([0,-3,0,3,0],0,-300,6.5));
  return body(b,{sh:72});
}
function acerolito(){
  const Y='#F2C230';let b='';
  b+=L(-14,-62,-18,-8,6,'#3A2A30')+L(14,-62,18,-8,6,'#3A2A30');
  b+=E(-22,-6,12,6,'#3A2A30',4)+E(22,-6,12,6,'#3A2A30',4);
  b+=C(0,-112,56,Y);
  b+=E(-20,-112,16,14,'#fff',5)+E(22,-118,16,14,'#fff',5);
  b+=S('M-30,-112 a10,8 0 1,0 20,0 a10,8 0 1,0 -20,0',3)+S('M12,-118 a10,8 0 1,0 20,0 a10,8 0 1,0 -20,0',3);
  b+=G(C(-18,-116,5,O,0)+C(24,-122,5,O,0),tr('0 0;0 0;-4 -1;-4 -1;4 -1;4 -1;0 0',5));
  b+=blink(E(-20,-112,18,16,Y,5)+E(22,-118,18,16,Y,5),3.1,0.7);
  b+=C(14,-86,3,O,0);
  b+=G(P('M-14,-84 C-40,-90 -66,-82 -58,-66 C-50,-58 -30,-62 -8,-68 C0,-72 -2,-82 -14,-84 Z','#F28C1E',5),rot([0,0,-8,4,0,0],-10,-76,1.8,'0;.55;.72;.84;.92;1'));
  b+=G(`<rect x="-24" y="-215" width="48" height="48" fill="#17151C" stroke="${O}" stroke-width="5"/><rect x="-24" y="-182" width="48" height="9" fill="#C8202C"/>${E(0,-167,38,8,'#17151C',5)}`,rot([-16,-16,-8,-26,-12,-16],0,-165,1.8,'0;.55;.72;.84;.92;1'));
  return body(b,{sh:42,mode:'hop'});
}
function douradex(){
  const Gd='#E7B52C',H='#D9A21E',HD='#B8841A';let b='';
  b+=`<circle class="glow" cx="0" cy="-260" r="175" fill="url(#gold)"/>`;
  b+=star(-110,-400,14,'#FFE9A0',0)+star(115,-330,10,'#FFE9A0',.6)+star(-90,-170,9,'#FFE9A0',1.1)+star(100,-430,8,'#FFE9A0',1.5);
  b+=L(-20,-125,-24,-18,22,'#A87C1C')+L(20,-125,26,-18,22,'#A87C1C');
  b+=E(-32,-12,26,12,'#F2EFE6')+E(34,-12,26,12,'#F2EFE6');
  b+=P('M-60,-292 L60,-292 L68,-112 L-68,-112 Z',H);
  b+=P('M-32,-172 L32,-172 L38,-130 L-38,-130 Z',HD,5);
  b+=P('M-48,-302 C-56,-268 56,-268 48,-302 C30,-286 -30,-286 -48,-302 Z',HD,5);
  let ch='';
  for(let i=0;i<=12;i++){const t=i/12,x=-34+68*t,y=-288+46*Math.sin(Math.PI*t);ch+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#FFD75E" stroke="#7A560C" stroke-width="2"/>`;}
  ch+=`<circle cx="0" cy="-230" r="11" fill="#FFD75E" stroke="#7A560C" stroke-width="3"/>`+star(0,-230,9,'#fff',.3);
  b+=G(ch,rot([-4,4,-4],0,-290,2.2));
  b+=L(-62,-280,-80,-186,18,H)+C(-82,-174,13,Gd,5);
  const kt='0;.25;.33;.45;.5;.54;.8;1';
  b+=G(L(62,-280,82,-186,18,H)+C(84,-174,13,Gd,5)+S('M92,-166 L104,-160',5),rot([0,0,12,-106,-94,-100,-100,0],62,-280,4,kt));
  let h='';
  h+=E(-48,-350,8,13,Gd,5)+E(48,-350,8,13,Gd,5);
  h+=E(0,-352,48,56,Gd);
  h+=E(-14,-388,13,7,'rgba(255,255,255,.55)',0);
  h+=C(-24,-350,4,'#2B1A10',0)+C(24,-350,4,'#2B1A10',0);
  h+=blink(E(-24,-350,7,6,Gd,0)+E(24,-350,7,6,Gd,0),3.8,1.2);
  h+=`<rect x="-41" y="-362" width="32" height="22" rx="4" fill="rgba(255,255,255,.18)" stroke="#2B2420" stroke-width="5"/><rect x="9" y="-362" width="32" height="22" rx="4" fill="rgba(255,255,255,.18)" stroke="#2B2420" stroke-width="5"/>`+S('M-9,-352 L9,-352',4,'#2B2420');
  h+=S('M-12,-318 Q0,-310 12,-318',4);
  b+=G(G(h,rot([0,0,0,8,8,0],0,-300,4,'0;.3;.4;.5;.8;1')),rot([0,-2,0,2,0],0,-300,7));
  return body(b,{sh:72});
}
function passarex(){
  const B='#1E1B24',W='#141118',SK='#C08A5E';let b='';
  b+=L(-18,-82,-22,-12,6,'#6B6470')+L(18,-82,22,-12,6,'#6B6470');
  b+=S('M-36,-6 L-22,-12 L-10,-4 M-22,-12 L-24,0',5,'#6B6470')+S('M8,-4 L22,-12 L36,-6 M22,-12 L24,0',5,'#6B6470');
  b+=G(P('M-46,-180 C-140,-236 -196,-150 -180,-78 C-156,-108 -126,-100 -104,-90 C-94,-118 -72,-120 -52,-108 Z',W),rot([0,-24,5,0],-46,-160,2.6,'0;.45;.8;1'));
  b+=G(P('M46,-180 C140,-236 196,-150 180,-78 C156,-108 126,-100 104,-90 C94,-118 72,-120 52,-108 Z',W),rot([0,24,-5,0],46,-160,2.6,'0;.45;.8;1'));
  b+=E(0,-140,60,76,B);
  b+=P('M-16,-212 L16,-212 L14,-196 L-14,-196 Z',B,5);
  let h='';
  h+=E(-44,-250,7,11,SK,5)+E(44,-250,7,11,SK,5);
  h+=E(0,-250,44,50,SK);
  h+=P('M-46,-258 C-48,-312 48,-312 46,-258 C34,-284 -30,-288 -46,-258 Z','#2A1E18');
  h+=`<g><ellipse cx="-16" cy="-250" rx="14" ry="11" fill="#fff" opacity=".25"><animate attributeName="opacity" values=".1;.45;.1" dur="2s" repeatCount="indefinite"/></ellipse><ellipse cx="16" cy="-250" rx="14" ry="11" fill="#fff" opacity=".25"><animate attributeName="opacity" values=".1;.45;.1" dur="2s" repeatCount="indefinite"/></ellipse></g>`;
  h+=E(-16,-250,10,7,'#fff',4)+E(16,-250,10,7,'#fff',4);
  h+=blink(E(-16,-250,12,9,SK,4)+E(16,-250,12,9,SK,4),6,0.4);
  h+=S('M-6,-238 L0,-230 L6,-238',3,'#7A4E34');
  h+=S('M-10,-218 L10,-218',4);
  b+=G(h,rot([0,0,18,18,24,16,18,18,0],0,-205,5,'0;.2;.38;.6;.61;.62;.64;.86;1'));
  return body(b,{sh:62,br:3.6});
}
function passaroEsferas(){
  const BL='#2E5E8E',BD='#244C74',CR='#F0E4C8',BK='#E8A63A';
  const gem=(x,d)=>`${C(x,-30,28,'#8B5BD6',5)}<polygon points="${x-18},-40 ${x},-54 ${x+18},-40 ${x+10},-14 ${x-10},-14" fill="#A77EE8" stroke="#5B3A9A" stroke-width="2"/><polygon points="${x-8},-46 ${x+2},-50 ${x-2},-38" fill="#E2D2FF"/>`+star(x+12,-46,9,'#fff',d);
  let b='';
  b+=G(P('M-52,-150 C-122,-196 -170,-160 -160,-104 C-140,-114 -118,-104 -100,-98 C-90,-114 -72,-114 -56,-104 Z',BD),rot([0,-28,8,0],-52,-130,0.75,'0;.4;.8;1'));
  b+=G(P('M52,-150 C122,-196 170,-160 160,-104 C140,-114 118,-104 100,-98 C90,-114 72,-114 56,-104 Z',BD),rot([0,28,-8,0],52,-130,0.75,'0;.4;.8;1'));
  let h=P('M-24,-184 L-14,-206 L-4,-188 L6,-210 L14,-188 L22,-184 Z',BL,5);
  b+=E(0,-122,62,66,BL);
  b+=E(0,-100,40,42,CR,5);
  h+=E(-20,-140,16,18,CR,5)+E(20,-140,16,18,CR,5);
  h+=G(E(-18,-138,7,9,'#3C2A5C',0)+E(18,-138,7,9,'#3C2A5C',0),tr('0 0;0 0;-3 2;-3 2;3 2;3 2;0 0',4.5));
  h+=blink(E(-20,-140,18,20,BL,5)+E(20,-140,18,20,BL,5),3.3,0.2);
  h+=P('M-9,-122 L9,-122 L0,-106 Z',BK,4);
  b+=G(h,rot([0,-6,0,6,0],0,-120,3));
  b+=gem(-30,0)+gem(30,.9);
  b+=S('M-40,-60 L-36,-46 M-32,-60 L-32,-46 M-24,-60 L-28,-46',5,BK)+S('M40,-60 L36,-46 M32,-60 L32,-46 M24,-60 L28,-46',5,BK);
  return body(b,{sh:62,mode:'float'});
}
function rosengo(){
  const PK='#F06BC8',GR='#6BD93A',OR='#E0782E',BR='#8A4A20';let b='';
  b+=P('M-40,-124 L-6,-124 L-4,-8 L-46,-8 Z',GR)+P('M2,-124 L38,-124 L42,-8 L4,-8 Z',GR);
  b+=S('M-24,-110 L-24,-20 M20,-110 L22,-20',3,'#3E9A1E');
  b+=G(L(-38,-250,-58,-150,14,PK)+C(-60,-142,10,PK,5),rot([0,4,0,-3,0],-38,-250,3.2));
  b+=P('M-50,-120 L-50,-268 C-50,-326 -30,-352 -4,-360 L30,-340 C40,-310 46,-290 46,-262 L46,-120 Z',PK);
  let h=E(22,-332,42,38,PK);
  h+=G(E(70,-322,26,22,PK)+S('M64,-330 L64,-316 M78,-330 L78,-316',4),rot([0,0,5,-5,4,0,0],70,-322,2.6,'0;.6;.66;.72;.78;.84;1'));
  h+=`<rect x="6" y="-352" width="9" height="13" fill="${O}"/>`;
  h+=blink(`<rect x="3" y="-355" width="15" height="19" fill="${PK}"/>`,3.5,0.9);
  h+=S('M30,-298 L56,-294',4);
  const kt='0;.5;.55;.6;.64;.7;.76;1';
  h+=G(P('M-16,-358 C-14,-402 48,-408 56,-364 Z',OR)+P('M44,-382 C66,-402 88,-390 76,-370 C66,-368 56,-370 50,-368 Z',BR,5)+C(18,-396,5,BR,3),rot([0,0,0,-12,7,-3,0,0],20,-370,4.2,kt));
  b+=G(h,rot([0,0,-4,-4,0],10,-300,4.2,'0;.45;.55;.7;1'));
  b+=G(L(34,-250,52,-160,14,PK)+C(54,-152,10,PK,5),rot([0,0,10,-166,-152,-160,-160,-160,0],34,-250,4.2,'0;.3;.36;.5;.55;.6;.66;.8;1'));
  return body(b,{sh:62});
}
function ratabrumga(){
  const Gr='#4E4A4C',GL='#6E6866',PK='#C98A8E';let b='';
  b+=G(S('M-58,-24 C-110,-14 -126,-62 -96,-74',11)+S('M-58,-24 C-110,-14 -126,-62 -96,-74',5,'#B07A80'),rot([0,16,-8,12,-4,0],-58,-24,1.4));
  b+=L(-38,-16,-40,-2,6,Gr)+L(-18,-14,-18,-2,6,Gr)+L(18,-14,20,-2,6,Gr)+L(34,-16,38,-2,6,Gr);
  b+=E(-8,-40,56,34,Gr);
  b+=E(-12,-30,34,14,GL,0);
  let h='';
  h+=G(E(30,-84,13,16,'#8A6E70',5),rot([0,0,-14,6,0,0],30,-72,2.2,'0;.5;.56;.62;.7;1'));
  h+=E(44,-56,30,24,Gr);
  h+=P('M62,-66 L92,-52 L62,-42 Z',Gr,5);
  h+=C(92,-52,5,PK,3);
  h+=`<circle cx="52" cy="-62" r="14" fill="rgba(255,255,255,.3)"><animate attributeName="r" values="11;19;11" dur="1.4s" repeatCount="indefinite"/></circle>`+C(52,-62,6,'#fff',3);
  h+=G(S('M80,-50 L102,-60 M80,-48 L104,-46',2,'#cfc7c8'),rot([0,6,-4,6,0],80,-50,0.5));
  b+=G(h,rot([0,5,-2,5,-1,0,0],30,-50,1.6,'0;.1;.2;.3;.4;.5;1'));
  return body(b,{sh:64,br:1.6});
}
function orelha(){
  const BK='#2A2420',TN='#B0743E',PK='#E07A8A';let b='';
  const kt='0;.4;.5;.6;.68;.75;.82;1',tilt=a=>rot([0,0,-9,-9,0],0,-130,3.6,'0;.38;.48;.78;1');
  b+=G(S('M30,-50 C60,-60 70,-90 64,-110',14,O)+S('M30,-50 C60,-60 70,-90 64,-110',7,BK),rot([-18,18,-18],30,-50,0.5));
  const ears=G(P('M-30,-176 C-118,-206 -154,-70 -116,-6 C-96,-30 -70,-112 -26,-150 Z',BK),rot([0,0,-18,7,-4,2,0,0],-30,-170,3.6,kt))
    +G(P('M30,-176 C118,-206 154,-70 116,-6 C96,-30 70,-112 26,-150 Z',BK),rot([0,0,18,-7,4,-2,0,0],30,-170,3.6,kt));
  b+=G(ears,tilt());
  b+=L(-20,-50,-22,-10,14,TN)+L(20,-50,22,-10,14,TN);
  b+=E(-24,-6,14,7,TN,5)+E(24,-6,14,7,TN,5);
  b+=E(0,-72,44,48,BK);
  b+=E(0,-70,22,30,TN,0);
  let h=E(0,-150,40,36,BK);
  h+=E(-16,-172,5,3,TN,0)+E(16,-172,5,3,TN,0);
  h+=C(-16,-160,5,'#1a1210',2)+C(16,-160,5,'#1a1210',2);
  h+=E(-14,-162,2,2,'#fff',0)+E(18,-162,2,2,'#fff',0);
  h+=blink(E(-16,-160,8,7,BK,0)+E(16,-160,8,7,BK,0),3.2,0.5);
  h+=E(0,-134,22,16,TN,5);
  h+=G(E(0,-118,8,10,PK,4),tr('0 0;0 4;0 0',0.42));
  h+=E(0,-144,8,6,O,0);
  h+=S('M-10,-128 Q0,-122 10,-128',3);
  b+=G(h,tilt());
  return body(b,{sh:90,br:0.84});
}
function uperFleguis(){
  const SK='#E3A98A',SD='#C98A6C',NS='#6B3A2E';
  const tenis=(x,y,f)=>`<g transform="translate(${x} ${y}) scale(${f} 1)"><circle class="glow" cx="2" cy="-10" r="34" fill="url(#holy)"/>${P('M-28,0 L-28,-16 C-12,-28 6,-24 14,-14 L32,-8 L32,0 Z','#F2F0EA',4)}<rect x="-30" y="-4" width="64" height="8" rx="3" fill="#3B2A20"/>${S('M-12,-18 C-2,-10 10,-10 18,-10',4,'#3B2A20')}${star(18,-30,8,'#FFF4C8',f>0?.4:1.2)}</g>`;
  let b='';
  b+=L(-18,-152,-22,-14,9,SK)+L(18,-152,22,-14,9,SK);
  b+=E(-26,-8,14,7,SK,4)+E(26,-8,14,7,SK,4);
  b+=P('M0,-400 C-26,-380 -40,-262 -56,-202 C-72,-160 -42,-138 -20,-150 C-10,-140 10,-140 20,-150 C42,-138 72,-160 56,-202 C40,-262 26,-380 0,-400 Z',SK);
  b+=S('M-8,-370 C-16,-320 -22,-260 -30,-210',4,SD);
  b+=`<ellipse cx="-22" cy="-160" rx="9" ry="5" fill="${NS}"><animate attributeName="rx" values="9;9;12;9;12;9;9" keyTimes="0;.3;.36;.42;.48;.54;1" dur="3s" repeatCount="indefinite"/></ellipse><ellipse cx="22" cy="-160" rx="9" ry="5" fill="${NS}"><animate attributeName="rx" values="9;9;12;9;12;9;9" keyTimes="0;.3;.36;.42;.48;.54;1" dur="3s" repeatCount="indefinite"/></ellipse>`;
  const kt='0;.3;.36;.5;.55;.6;.8;1';
  b+=G(L(-46,-212,-88,-150,8,SK)+tenis(-96,-138,-1),rot([0,0,-10,60,50,55,55,0],-46,-212,4,kt));
  b+=G(L(46,-212,88,-150,8,SK)+tenis(96,-138,1),rot([0,0,10,-60,-50,-55,-55,0],46,-212,4,kt));
  return body(b,{sh:62,br:3});
}
function bicho(){
  const SK='#8C5A3C',SD='#6E4430',RB='#26305A',RT='#C9A646',HR='#8E8E96',BW='#1E1612',PA='#EDE6D8';let b='';
  b+=L(-22,-80,-24,-18,18,'#1E2240')+L(22,-80,26,-18,18,'#1E2240');
  b+=E(-32,-12,24,11,'#15131A')+E(34,-12,24,11,'#15131A');
  b+=P('M-62,-298 L62,-298 L86,-40 L-86,-40 Z',RB);
  b+=P('M-56,-292 L-40,-298 L62,-110 L46,-102 Z',RT,4);
  b+=P('M-24,-300 L24,-300 L0,-268 Z',PA,4);
  b+=L(-62,-284,-74,-206,18,RB);
  b+=`<g transform="rotate(-6 -100 -200)"><rect x="-128" y="-226" width="62" height="16" fill="${PA}" stroke="${O}" stroke-width="4"/><rect x="-124" y="-212" width="60" height="16" fill="#F7F2E6" stroke="${O}" stroke-width="4"/><rect x="-130" y="-198" width="64" height="16" fill="${PA}" stroke="${O}" stroke-width="4"/><rect x="-112" y="-229" width="10" height="50" fill="#B3202A" opacity=".85"/></g>`;
  b+=C(-72,-196,13,SK,5);
  const kt='0;.42;.5;.56;.62;.68;.85;1';
  b+=G(L(62,-284,76,-196,18,RB)+C(78,-186,13,SK,5)+L(80,-196,82,-222,4,SK),rot([0,0,8,-38,-32,-36,-36,0],62,-284,4.6,kt));
  let h='';
  h+=E(-48,-350,8,13,SK,5)+E(48,-350,8,13,SK,5);
  h+=E(0,-352,48,56,SK);
  h+=P('M-48,-362 C-50,-414 50,-414 48,-362 C36,-388 -36,-388 -48,-362 Z',HR);
  h+=E(-21,-352,11,5,'#fff',3)+E(21,-352,11,5,'#fff',3);
  h+=C(-20,-352,3.5,O,0)+C(20,-352,3.5,O,0);
  h+=`<g><rect x="-34" y="-362" width="26" height="0" fill="${SK}"><animate attributeName="height" values="0;0;6;6;0;0" keyTimes="0;.42;.5;.68;.76;1" dur="4.6s" repeatCount="indefinite"/></rect><rect x="8" y="-362" width="26" height="0" fill="${SK}"><animate attributeName="height" values="0;0;6;6;0;0" keyTimes="0;.42;.5;.68;.76;1" dur="4.6s" repeatCount="indefinite"/></rect></g>`;
  h+=blink(E(-21,-352,13,7,SK,0)+E(21,-352,13,7,SK,0),5,2);
  h+=G(P('M-38,-374 L-8,-364 L-8,-358 L-38,-366 Z',BW,0)+P('M38,-374 L8,-364 L8,-358 L38,-366 Z',BW,0),tr('0 0;0 0;0 3;0 3;0 0',4.6,'0;.42;.5;.7;1'));
  h+=P('M-3,-346 L7,-330 L-6,-328 Z',SD,3);
  h+=`<ellipse cx="0" cy="-316" rx="12" ry="2.5" fill="#3a1414" stroke="${O}" stroke-width="3"><animate attributeName="ry" values="2.5;2.5;7;2.5;6;2.5;2.5" keyTimes="0;.5;.54;.58;.62;.66;1" dur="4.6s" repeatCount="indefinite"/></ellipse>`;
  b+=G(G(h,rot([0,0,-7,-7,0],0,-300,4.6,'0;.42;.5;.72;1')),rot([0,2,0,-2,0],0,-300,7));
  return body(b,{sh:72,br:3.2});
}

function macaco(){
  const BR='#8B4F2E',TN='#E3B98A',BK='#6B3E22',PG='#F3EBD6';let b='';
  b+=G(S('M22,-80 C80,-70 110,-120 92,-160 C84,-178 64,-172 70,-156',14,O)+S('M22,-80 C80,-70 110,-120 92,-160 C84,-178 64,-172 70,-156',7,BR),rot([0,8,-6,0],22,-80,2.4));
  b+=L(-14,-70,-18,-12,14,BR)+L(14,-70,18,-12,14,BR);
  b+=E(-22,-6,16,8,TN,5)+E(24,-6,16,8,TN,5);
  b+=E(0,-108,40,50,BR);
  b+=E(0,-104,24,34,TN,0);
  let h='';
  h+=C(-46,-200,16,BR,5)+C(-46,-200,9,TN,0)+S('M-51,-205 L-41,-195 M-41,-205 L-51,-195',3);
  h+=C(46,-200,16,BR,5)+C(46,-200,9,TN,0);
  h+=C(0,-200,42,BR);
  h+=P('M-8,-244 L0,-258 L8,-244 Z',BR,4);
  h+=E(0,-190,32,28,TN,4);
  h+=E(-12,-198,9,12,'#fff',3)+E(12,-198,9,12,'#fff',3);
  h+=C(-10,-192,4,O,0)+C(10,-192,4,O,0);
  h+=blink(E(-12,-198,11,14,TN,0)+E(12,-198,11,14,TN,0),3.8,.6);
  h+=S('M-6,-172 Q0,-176 6,-172',3);
  b+=G(h,rot([0,0,-6,-6,0],0,-160,3.4,'0;.5;.6;.9;1'));
  b+=`<rect x="-42" y="-154" width="84" height="60" rx="4" fill="${BK}" stroke="${O}" stroke-width="5"/>`;
  b+=`<rect x="-37" y="-150" width="37" height="52" fill="${PG}" stroke="${O}" stroke-width="3"/><rect x="0" y="-150" width="37" height="52" fill="${PG}" stroke="${O}" stroke-width="3"/>`+S('M-30,-138 L-8,-138 M-30,-128 L-8,-128 M-30,-118 L-14,-118 M8,-138 L30,-138 M8,-128 L30,-128 M8,-118 L24,-118',2,'#9a8f80');
  b+=`<g transform="translate(0 -124)"><g><rect x="0" y="-26" width="37" height="52" fill="#FFF8EA" stroke="${O}" stroke-width="3"/><animateTransform attributeName="transform" type="scale" values="1 1;1 1;-1 1;-1 1" keyTimes="0;.6;.75;1" calcMode="spline" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1" dur="3.4s" repeatCount="indefinite"/></g></g>`;
  b+=C(-44,-124,10,TN,4)+C(44,-124,10,TN,4);
  return body(b,{sh:50,br:2.4});
}
function mago(){
  const PU='#6E4BA0',PT='#C98A3E',BD='#F2EDE6',SK='#E8B98E',BN='#8A5A2E';let b='';
  b+=G(`<g transform="translate(130 0)">${P('M-50,-16 L50,-16 L40,0 L-40,0 Z','#2A2630',4)}${E(0,-60,58,48,'#2A2630')}${E(0,-96,52,12,'#7CE04A',5)}<ellipse class="glow" cx="0" cy="-110" rx="60" ry="30" fill="#7CE04A" opacity=".25"/>`+[[-20,0],[10,.7],[25,1.3]].map(([x,d])=>`<circle cx="${x}" cy="-100" r="6" fill="#B8F58A" stroke="${O}" stroke-width="2"><animate attributeName="cy" values="-100;-150" dur="1.6s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.6s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')+`</g>`);
  b+=E(-30,-10,22,10,BN)+E(30,-10,22,10,BN);
  b+=P('M-40,-300 L40,-300 L76,-16 L-76,-16 Z',PU);
  b+=`<rect x="-52" y="-120" width="22" height="20" fill="${PT}" stroke="${O}" stroke-width="3" transform="rotate(-8 -41 -110)"/><rect x="28" y="-200" width="18" height="18" fill="${PT}" stroke="${O}" stroke-width="3" transform="rotate(10 37 -191)"/>`;
  b+=L(-40,-282,-66,-200,24,PU)+C(-68,-186,12,SK,5);
  b+=G(L(40,-282,76,-214,24,PU)+C(84,-204,12,SK,5)+S('M92,-206 L104,-210',5,SK)+star(118,-214,12,'#B8F58A',0)+star(132,-190,8,'#B8F58A',.5),rot([0,0,-8,22,16,18,18,0],40,-282,3.8,'0;.3;.36;.5;.55;.6;.85;1'));
  let h='';
  h+=E(0,-338,36,40,SK);
  h+=S('M-22,-344 Q-14,-338 -6,-344 M6,-344 Q14,-338 22,-344',3.5);
  h+=S('M-28,-328 L-22,-322 M-22,-328 L-28,-322',2.5,'#B5544A');
  h+=E(2,-330,6,5,'#D99A78',3);
  h+=G(P('M-34,-330 C-40,-280 -22,-232 0,-196 C22,-232 40,-280 34,-330 C20,-316 -20,-316 -34,-330 Z',BD),rot([0,3,0,-3,0],0,-330,3));
  h+=P('M-20,-322 C-10,-314 10,-314 20,-322 C10,-318 -10,-318 -20,-322 Z',BD,3);
  h+=E(0,-368,62,12,PU,5);
  h+=G(P('M-36,-372 L36,-372 C24,-420 10,-456 -34,-478 C-8,-446 -22,-410 -36,-372 Z',PU)+`<rect x="-34" y="-388" width="66" height="10" fill="${BN}"/><rect x="2" y="-420" width="14" height="14" fill="${PT}" stroke="${O}" stroke-width="2"/>`,rot([0,-4,0,3,0],0,-372,2.6));
  b+=G(h,rot([0,0,-5,-5,0],0,-300,3.8,'0;.4;.5;.8;1'));
  return body(b,{sh:80,br:3});
}
function serjao(){
  const SK='#9A6440',AP='#5E7A3A',TS='#F0EEE8',MT='#8B3A22';let b='';
  b+=`<g transform="translate(120 0)">`+L(-44,-120,-50,0,6,'#2A2630')+L(44,-120,50,0,6,'#2A2630')+`<rect x="-58" y="-150" width="116" height="40" fill="#3A3A40" stroke="${O}" stroke-width="5"/><rect x="-50" y="-160" width="100" height="12" fill="#E2622A"><animate attributeName="fill" values="#E2622A;#FF9A3C;#E2622A" dur="0.9s" repeatCount="indefinite"/></rect>`+[[-20,0],[10,.9],[30,1.7]].map(([x,d])=>`<circle cx="${x}" cy="-200" r="14" fill="#cfc8d6" opacity="0"><animate attributeName="cy" values="-190;-300" dur="2.6s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="r" values="10;26" dur="2.6s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".55;0" dur="2.6s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')+`</g>`;
  b+=L(-20,-125,-24,-18,20,'#3D4E6E')+L(20,-125,26,-18,20,'#3D4E6E');
  b+=E(-32,-12,24,11,'#2A2420')+E(34,-12,24,11,'#2A2420');
  b+=P('M-58,-296 L58,-296 L64,-116 L-64,-116 Z',TS);
  b+=P('M-40,-260 L40,-260 L48,-110 L-48,-110 Z',AP,5)+S('M-40,-260 L-30,-296 M40,-260 L30,-296',4,AP);
  b+=G(L(-58,-282,-82,-196,18,TS)+C(-84,-184,13,SK,5)+P('M-100,-200 L-72,-206 L-80,-170 Z','#C9A646',4),rot([0,-14,6,-14,6,0],-58,-282,1.2));
  const cube=(x,d)=>`<rect x="${x}" y="-176" width="16" height="16" rx="3" stroke="${O}" stroke-width="3" fill="${MT}"><animate attributeName="fill" values="${MT};#6E2C18;${MT}" dur=".8s" begin="${d}s" repeatCount="indefinite"/></rect>`;
  b+=L(58,-282,86,-200,18,TS)+C(88,-188,13,SK,5);
  b+=G(S('M84,-170 L200,-166',4,'#BFC3C8')+cube(110,0)+cube(132,.2)+cube(154,.4)+cube(176,.6),tr('0 0;0 -2;0 0;0 2;0 0',.8));
  let h='';
  h+=E(-46,-350,8,12,SK,5)+E(46,-350,8,12,SK,5);
  h+=E(0,-352,46,54,SK);
  h+=P('M-46,-360 C-48,-410 48,-410 46,-360 C34,-382 -34,-382 -46,-360 Z','#1E1612');
  h+=C(-17,-352,4.5,O,0)+C(17,-352,4.5,O,0);
  h+=blink(E(-17,-352,8,7,SK,0)+E(17,-352,8,7,SK,0),3.6,.3);
  h+=P('M-22,-330 C-12,-338 12,-338 22,-330 C12,-326 -12,-326 -22,-330 Z','#1E1612',3);
  h+=S('M-12,-318 Q0,-310 12,-318',4);
  b+=G(h,rot([0,0,6,6,0],0,-300,3.2,'0;.4;.5;.8;1'));
  return body(b,{sh:70,br:2.6});
}


window.CLUBEX = { DEFS, homemDistinto, acerolito, douradex, passarex, passaroEsferas, rosengo, ratabrumga, orelha, uperFleguis, bicho, macaco, mago, serjao };
})();
