// REGISTRO 1367 · motor do jogo (render PS1 + VHS, jogador, interação, som, HUD, fases)
import * as THREE from 'three';
import * as casa from './fases/casa.js';
import * as colinas from './fases/colinas.js';
import * as amarelas from './fases/amarelas.js';
import * as vilasol from './fases/vilasol.js';
import * as estrelas from './fases/estrelas.js';
import * as reino from './fases/reino.js';
import * as brinquedo from './fases/brinquedo.js';
import * as avenida from './fases/avenida.js';
import * as navio from './fases/navio.js';
import * as salabranca from './fases/salabranca.js';
import * as centro from './fases/centro.js';
import * as floresta from './fases/floresta.js';
import * as portoes from './fases/portoes.js';
import * as ilha from './fases/ilha.js';
import * as matagale from './fases/matagale.js';
import * as arvore from './fases/arvore.js';
import { instalar as instalarExtras } from './extras.js';

const FASES = { casa, colinas, amarelas, vilasol, estrelas, reino, brinquedo, navio, salabranca, avenida, centro, floresta, matagale, arvore, portoes, ilha };
const $ = id => document.getElementById(id);
const RW = 426, RH = 240;   // 16:9 (era 4:3, 320x240, até a v2.9.1)
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');

const E = { THREE, $ };
const state = E.state = {
  noticed: 0, clues: {}, penas: 0, flags: {}, rota: null,
  started: false, paused: false, ended: false, noteOpen: false, choosing: null, trans: null
};
let L = null;

/* ============ render ============ */
const wrap = $('wrap');
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(1);
wrap.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 16 / 9, .1, 90);
camera.rotation.order = 'YXZ';
E.scene = scene; E.camera = camera;
const rt = new THREE.WebGLRenderTarget(RW, RH, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });

const postU = E.post = {
  tDiffuse: { value: rt.texture }, time: { value: 0 }, glitch: { value: 0 }, pull: { value: 0 },
  red: { value: 0 }, fade: { value: 0 }, res: { value: new THREE.Vector2(854, 480) }
};
const postMat = new THREE.ShaderMaterial({
  uniforms: postU,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, glitch, pull, red, fade; uniform vec2 res; varying vec2 vUv;
    const float VHS = .85;   // intensidade do visual de fita (1.0 = como era até a v2.8); sustos e transições não mudam
    float rnd(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
    vec2 curve(vec2 uv){ uv = uv*2.-1.; vec2 o = abs(uv.yx)/vec2(5.5,4.5); uv += uv*o*o; return uv*.5+.5; }
    void main(){
      vec2 uv = curve(vUv);
      if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.){ gl_FragColor = vec4(0.,0.,0.,1.); return; }
      vec2 c = uv - .5; c *= 1. - pull*.55; float a = pull*pull*4.*length(c);
      c = mat2(cos(a),-sin(a),sin(a),cos(a))*c; uv = c + .5;
      float row = floor(uv.y*240.);
      uv.x += (rnd(vec2(row, floor(time*24.)))-.5)*(.0018*VHS + glitch*.02);
      float band = smoothstep(.0,.02, abs(fract(uv.y*.7 - time*.11) - .5) - .47);
      uv.x += band*(.006*VHS + glitch*.03);
      float ca = .0022*VHS + glitch*.008;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + vec2(ca,0.)).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - vec2(ca,0.)).b;
      col += texture2D(tDiffuse, uv - vec2(.006,0.)).rgb*(.12*VHS);
      col *= 1. - .1*VHS;
      col *= (1. - .16*VHS) + .16*VHS*sin(gl_FragCoord.y*3.14159*.5);
      float n = rnd(uv*res + time*61.);
      col += (n-.5)*(.07*VHS + glitch*.25 + pull*.3);
      col += band*(.06*VHS);
      col = mix(col, vec3(.75,.04,.05)*(.6+.4*n), red);
      col = mix(col, vec3(.97,.95,.93) + (n-.5)*.08, fade);
      vec2 v = vUv*(1.-vUv.yx); col *= pow(v.x*v.y*18., .28*VHS);
      col = mix(col, vec3(.95), smoothstep(.82, 1., pull));
      gl_FragColor = vec4(col, 1.);
      #include <colorspace_fragment>
    }`
});
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));
function resize() {
  const h = Math.min(innerHeight, innerWidth * 9 / 16), w = h * 16 / 9;
  renderer.setSize(w, h);
  wrap.style.width = w + 'px'; wrap.style.height = h + 'px';
  postU.res.value.set(w, h);
}
addEventListener('resize', resize); resize();

/* ============ materiais e texturas ============ */
const snapU = { value: new THREE.Vector2(RW / 2, RH / 2) };
function psx(mat) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uSnap = snapU;
    sh.vertexShader = 'uniform vec2 uSnap;\n' + sh.vertexShader.replace('#include <project_vertex>',
      `#include <project_vertex>
       vec4 sp = gl_Position; sp.xy = floor(sp.xy / sp.w * uSnap + .5) / uSnap * sp.w; gl_Position = sp;`);
  };
  return mat;
}
E.lam = o => psx(new THREE.MeshLambertMaterial(o));
E.basic = o => psx(new THREE.MeshBasicMaterial(o));
let seed = 7;
E.seed = s => { seed = s; };
E.rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function texFrom(c, rep) {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.userData.canvas = c; t.userData.ctx = c.getContext('2d');
  return t;
}
E.texFrom = texFrom;
E.canvasTex = (w, h, draw, rep) => {
  // textura com letra: desenha em resolução maior (mesmo desenho, letras nítidas); o resto continua pixelado
  const k = /fillText/.test(draw.toString()) ? Math.max(1, Math.min(4, Math.floor(1024 / Math.max(w, h)))) : 1;
  const c = document.createElement('canvas'); c.width = w * k; c.height = h * k;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (k > 1) g.scale(k, k); draw(g, w, h);
  return texFrom(c, rep);
};
E.speckle = (g, w, h, n, colors) => {
  for (let i = 0; i < n; i++) { g.fillStyle = colors[(E.rnd() * colors.length) | 0]; g.fillRect((E.rnd() * w) | 0, (E.rnd() * h) | 0, 1, 1); }
};

/* Passarex: o desenho da série virando figurinha */
const PXC = {};
E.passarexCanvas = (s = .16, o = {}) => {
  const key = s + '|' + !!o.sil + '|' + !!o.outline;
  if (PXC[key]) return PXC[key];
  const guarda = !!window.PX_OK;   // a imagem do Passarex ainda carregando: não guarda o quadro vazio
  const pw = Math.ceil(420 * s) + 40, ph = Math.ceil(780 * s) + 40, ox = pw / 2, oy = ph - 22;
  const base = document.createElement('canvas'); base.width = pw; base.height = ph;
  const b = base.getContext('2d'); b.save(); b.translate(ox, oy); b.scale(s, s);
  window.drawPassarex(b, 1.6, { sil: !!o.sil }); b.restore();
  let out = base;
  if (o.outline) {
    out = document.createElement('canvas'); out.width = pw; out.height = ph;
    const c = out.getContext('2d'), r = Math.max(2, 13 * s);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; c.drawImage(base, Math.cos(a) * r, Math.sin(a) * r); }
    c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fffaf2'; c.fillRect(0, 0, pw, ph);
    c.globalCompositeOperation = 'source-over'; c.drawImage(base, 0, 0);
  }
  const r = { canvas: out, pw, ph, ox, oy, s }; if (guarda) PXC[key] = r; return r;
};
// figurinha em pé no mundo 3D, sempre virada para o jogador
E.sticker = (height, o = {}) => {
  const pc = E.passarexCanvas(o.s || .16, o);
  const w = height * pc.pw / pc.ph;
  const grp = new THREE.Group();
  const lift = height / 2 - height * (pc.ph - pc.oy) / pc.ph;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, height),
    E.basic({ map: texFrom(pc.canvas), transparent: true, alphaTest: .5, fog: o.fog ?? true }));
  m.position.y = lift; grp.add(m);
  if (o.eyes) {
    const c = document.createElement('canvas'); c.width = pc.pw; c.height = pc.ph;
    const g = c.getContext('2d'); g.fillStyle = '#f4e2a8';
    const PE = window.PX_EYE; for (const sx of [PE.lx, PE.rx]) { g.beginPath(); g.arc(pc.ox + sx * pc.s, pc.oy + PE.y * pc.s, 7 * pc.s + 1.2, 0, 7); g.fill(); }
    const e = new THREE.Mesh(new THREE.PlaneGeometry(w, height), E.basic({ map: texFrom(c), transparent: true, alphaTest: .3, fog: false }));
    e.position.set(0, lift, .01); grp.add(e);
  }
  L.billboards.push(grp);
  return grp;
};

/* elenco do Arquivo Passarex (Douradex, Colombo, Tonho): desenho em Canvas, redesenhado de vez em quando para respirar */
E.figura = (fn, height, o = {}) => {
  const s = o.s || .13, pw = Math.ceil(470 * s) + 16, ph = Math.ceil(800 * s) + 16, ox = Math.ceil(165 * s) + 8, oy = ph - 10;
  const c = document.createElement('canvas'); c.width = pw; c.height = ph;
  const tex = texFrom(c), g = c.getContext('2d');
  const draw = t => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, pw, ph);
    if (o.flip) { g.translate(pw, 0); g.scale(-1, 1); }
    g.translate(ox, oy); g.scale(s, s); window[fn](g, t, o.draw || {});
    tex.needsUpdate = true;
  };
  draw(0);
  const w = height * pw / ph, grp = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, height), E.basic({ map: tex, transparent: true, alphaTest: .5, fog: o.fog ?? true }));
  m.position.set((o.flip ? -1 : 1) * (pw / 2 - ox) / pw * w, height / 2 - height * (ph - oy) / ph, 0); grp.add(m);
  let nextT = 0;
  grp.userData.anim = t => { if (t >= nextT) { nextT = t + .14; draw(t); } };
  L.billboards.push(grp);
  return grp;
};

/* elenco do Clubex (SVG do Davy) virando imagem: figurinhas no 3D, quadros na parede e o minijogo */
const CLUB_BOX = {
  acerolito: [-59, -215, 115, 225], bicho: [-133, -408, 224, 422], douradex: [-175, -438, 350, 452], homemDistinto: [-105, -470, 209, 484],
  macaco: [-62, -258, 159, 269], mago: [-80, -478, 270, 493], orelha: [-131, -186, 262, 203], passarex: [-183, -300, 365, 313],
  passaroEsferas: [-161, -210, 323, 223], ratabrumga: [-111, -100, 215, 113], rosengo: [-70, -401, 166, 414], serjao: [-100, -406, 300, 420], ted: [-89, -344, 178, 344],
  uperFleguis: [-132, -400, 264, 413],
};
const CLUB_IMG = {};
E.clubImg = name => {
  if (CLUB_IMG[name]) return CLUB_IMG[name];
  if (name === 'ted') {   // o TED é o próprio cachorro da foto, recortado e em pixel art (img/ted.png)
    const img = new Image(), r = { img, W: 178, H: 344, aspect: 178 / 344, ready: null };
    r.ready = new Promise(res => { img.onload = () => res(r); img.onerror = () => res(r); }); img.src = 'img/ted.png';
    return (CLUB_IMG[name] = r);
  }
  if (name === 'passarex' && window.drawPassarex) {   // o Passarex é um só (design 2.7): o mesmo desenho do jogo também na skin e nos Portões
    const big = document.createElement('canvas'); big.width = 520; big.height = 860;
    const bg = big.getContext('2d'); bg.translate(260, 830); bg.scale(1.05, 1.05); window.drawPassarex(bg, 1.6, {});
    const d = bg.getImageData(0, 0, 520, 860).data; let x0 = 520, x1 = 0, y0 = 860, y1 = 0;
    for (let yy = 0; yy < 860; yy++) for (let xx = 0; xx < 520; xx++) if (d[(yy * 520 + xx) * 4 + 3] > 20) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    if (x1 < x0) { x0 = 0; y0 = 0; x1 = 519; y1 = 859; }
    const c = document.createElement('canvas'); c.width = x1 - x0 + 9; c.height = y1 - y0 + 9; c.getContext('2d').drawImage(big, x0 - 4, y0 - 4, c.width, c.height, 0, 0, c.width, c.height);
    c.complete = true;
    const r = { img: c, W: c.width, H: c.height, aspect: c.width / c.height, ready: null }; r.ready = Promise.resolve(r);
    return window.PX_OK ? (CLUB_IMG[name] = r) : r;
  }
  const [x, y, w, h] = CLUB_BOX[name], H = 300, W = Math.round(H * (w + 12) / (h + 12));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - 6} ${y - 6} ${w + 12} ${h + 12}" width="${W}" height="${H}">${window.CLUBEX.DEFS}${window.CLUBEX[name]()}</svg>`;
  const img = new Image(), r = { img, W, H, aspect: W / H, ready: null };
  r.ready = new Promise(res => { img.onload = () => res(r); img.onerror = () => res(r); });
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return (CLUB_IMG[name] = r);
};
// figurinha do elenco em pé no mundo (sola no chão), sempre virada para o jogador
E.club = (name, height, o = {}) => {
  const ci = E.clubImg(name);
  const c = document.createElement('canvas'); c.width = ci.W; c.height = ci.H;
  const tex = texFrom(c);
  ci.ready.then(() => { c.getContext('2d').drawImage(ci.img, 0, 0); if (o.dark) { const g = c.getContext('2d'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = o.dark; g.fillRect(0, 0, c.width, c.height); } tex.needsUpdate = true; });
  const grp = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(height * ci.aspect, height), E.basic({ map: tex, transparent: true, alphaTest: .5, fog: o.fog ?? true, side: THREE.DoubleSide }));
  m.position.y = height / 2 - height * 6 / (CLUB_BOX[name][3] + 12) * .5; grp.add(m);
  if (o.billboard !== false) L.billboards.push(grp);
  return grp;
};
// quadro na parede com um personagem do elenco
E.quadro = (name, w, h, bg = '#e9dcc0', caption = '') => {
  const c = document.createElement('canvas'); c.width = 96; c.height = Math.round(96 * h / w);
  const tex = texFrom(c), g = c.getContext('2d');
  const paint = img => {
    g.fillStyle = '#5a3a22'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = bg; g.fillRect(6, 6, c.width - 12, c.height - 12);
    if (img) { const ih = (c.height - 12) * (caption ? .78 : .9), iw = ih * img.aspect; g.drawImage(img.img, (c.width - iw) / 2, 8 + (c.height - 12) * .02, iw, ih); }
    if (caption) { g.fillStyle = '#241726'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText(caption, c.width / 2, c.height - 10); }
    tex.needsUpdate = true;
  };
  paint(null); E.clubImg(name).ready.then(paint);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), E.basic({ map: tex }));
};
// segredos do Clubex espalhados pelo jogo
const OVOS_TOTAL = 12;
E.OVOS_TOTAL = OVOS_TOTAL;
E.ovosAchados = () => Object.keys(state.flags.ovos || {}).length;
E.ovo = (id, obj, label, fn) => { if (E.META) { E.META.ovoLvl = E.META.ovoLvl || {}; if (E.META.ovoLvl[id] !== L.id) { E.META.ovoLvl[id] = L.id; E.salvarMeta(); } } return E.interact(obj, {
  label: () => '[E] ' + (typeof label === 'function' ? label() : label),
  act: () => {
    fn && fn();
    state.flags.ovos = state.flags.ovos || {};
    if (!state.flags.ovos[id]) {
      if (E.META) { E.META.ovos = E.META.ovos || {}; E.META.ovos[id] = 1; E.salvarMeta(); }
      state.flags.ovos[id] = true; E.sfx.chime(); if (E.ovosAchados() >= OVOS_TOTAL) E.conquista && E.conquista('segredos');
      setTimeout(() => E.toast(`Segredo do Clubex<small>${E.ovosAchados()}/${OVOS_TOTAL} achados</small>`), 600);
      E.save();
    }
  }
}); };

/* ============ construção dentro da fase atual ============ */
E.add = obj => { L.group.add(obj); return obj; };
E.box = (w, h, d, mat, x, y, z, o = {}) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); (o.parent || L.group).add(m);
  if (o.occ !== false) L.occluders.push(m);
  if (o.solid) E.solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  return m;
};
E.solid = (x0, x1, z0, z1) => L.colliders.push({ x0, x1, z0, z1 });
E.circle = (x, z, r) => { const c = { x, z, r }; L.circles.push(c); return c; };
E.interact = (obj, it) => { obj.userData.it = it; L.interactables.push(obj); return obj; };
E.unInteract = obj => { const i = L.interactables.indexOf(obj); if (i >= 0) L.interactables.splice(i, 1); };
E.hitbox = (w, h, d, x, y, z, parent) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
  m.position.set(x, y, z); (parent || L.group).add(m); return m;
};
E.trigger = (test, fn, once = true) => L.triggers.push({ test, fn, once, done: false });
E.later = (sec, fn) => L.events.push({ at: L.t + sec, fn });

/* ============ áudio (tudo sintetizado) ============ */
let AC = null, master, noiseBuf;
E.ac = () => AC;
function initAudio() {
  if (AC) return;
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = OPT.vol; master.connect(AC.destination);
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  E.master = master;
}
const dest = d => d || (L && L.bus) || master;
E.gain = (v, d) => { const g = AC.createGain(); g.gain.value = v; g.connect(dest(d)); return g; };
E.loopNoise = (type, freq, q, vol, d) => {
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
  const g = AC.createGain(); g.gain.value = vol; s.connect(f).connect(g).connect(dest(d)); s.start(); return g;
};
E.noiseHit = (dur, vol, freq, d, type = 'lowpass') => {
  if (!AC) return;
  const t = AC.currentTime, s = AC.createBufferSource(); s.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f).connect(g).connect(dest(d)); s.start(t, Math.random()); s.stop(t + dur + .05);
};
E.tone = (freq, dur, vol, type = 'sine', d, delay = 0, detune = 0, freqEnd) => {
  if (!AC) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(dest(d)); o.start(t); o.stop(t + dur + .05);
};
// "fiu fiu" (com posição esquerda/direita opcional)
/* sons gravados pelo Davy (audio/sfx): fiu fiu, susto, música e trilha */
const SFX = {};
async function loadSfx(names) {
  await Promise.all(names.map(async n => {
    if (SFX[n]) return;
    try { const ab = await (await fetch(`audio/sfx/${n}.mp3`)).arrayBuffer(); SFX[n] = await AC.decodeAudioData(ab); } catch (e) {}
  }));
}
function playBuf(buf, vol, o = {}) {
  let out = dest(o.dest);
  if (o.pan !== undefined) { const p = AC.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); p.connect(out); out = p; }
  const s = AC.createBufferSource(); s.buffer = buf; s.playbackRate.value = o.rate || 1;
  const g = AC.createGain(); g.gain.value = vol; s.connect(g).connect(out); s.start(AC.currentTime + (o.delay || 0));
  return s;
}
// áudio gravado avulso (ex.: "PÁSSARO!", "O Clubex me chamou"), carregado na hora
E.somGravado = async (n, vol = 1, o = {}) => { if (!AC) return; await loadSfx([n]); if (SFX[n]) playBuf(SFX[n], vol, o); };
// música de fundo em loop, com troca suave e abaixando quando alguém fala
const MUS = { name: null, src: null, g: null, base: 0 };
function setMusic(name, vol = .2) {
  if (!AC) return;
  if (MUS.name === name && MUS.src) { MUS.base = vol; return; }
  if (MUS.src) { const { src, g } = MUS; g.gain.setTargetAtTime(0, AC.currentTime, .4); setTimeout(() => { try { src.stop(); } catch (e) {} }, 2000); }
  MUS.name = name; MUS.src = null; MUS.base = vol;
  if (!name || !SFX[name]) return;
  const g = AC.createGain(); g.gain.value = 0; g.connect(master);
  const s = AC.createBufferSource(); s.buffer = SFX[name]; s.loop = true; s.connect(g); s.start();
  g.gain.setTargetAtTime(vol * OPT.music, AC.currentTime, .6);
  MUS.src = s; MUS.g = g;
}
function duckMusic() {   // abaixa a música enquanto uma voz fala
  if (!MUS.g || !AC) return;
  const talking = AC.currentTime < (VOZ.until || 0) || state.dlg;   // também abaixa durante as conversas
  MUS.g.gain.setTargetAtTime(MUS.base * OPT.music * (talking ? .4 : 1), AC.currentTime, .25);
}
E.setMusic = setMusic; E.MUS = MUS; E.loadSfx = loadSfx;
// a trilha toca em loop o jogo inteiro; a floresta e os lugares do sonho têm a música dark fantasy deles
const MUSICA_FASE = { floresta: ['fantasia', .3], vilasol: ['fantasia', .3], estrelas: ['fantasia', .3], reino: ['adormecido', .32] };
function levelMusic() {
  if (RADIO_ON) return;
  const [nome, vol] = (L && MUSICA_FASE[L.id]) || ['trilha', .22];
  if (!AC) return;
  loadSfx([nome]).then(() => { const [agora] = (L && MUSICA_FASE[L.id]) || ['trilha']; if (agora === nome && !state.ended && !RADIO_ON) setMusic(nome, vol); });
}

// legenda de som (só no inglês): quem não entende português acompanha o que está acontecendo. No máximo uma a cada 6 s,
// e nunca por cima de uma fala.
let capSomT = 0;
function capSom(txt) {
  if (!window.I18N || I18N.lang !== 'en' || !OPT.subs || !state.started) return;
  const agora = performance.now(); if (agora < capSomT || subT > .2) return;
  capSomT = agora + 6000; E.say(txt, 1.8, 'som');
}
E.capSom = capSom;
E.whistle = (vol, o = {}) => {
  if (!AC) return;
  if (vol >= .04) capSom('[♪ whistling: “fiu fiu” ♪]');
  if (SFX.fiufiu) { playBuf(SFX.fiufiu, Math.min(1.2, vol * 9), { ...o, rate: o.pitch ? Math.min(1.3, Math.max(.8, o.pitch)) : 1 }); return; }
  let out = dest(o.dest);
  if (o.pan !== undefined) { const p = AC.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); p.connect(out); out = p; }
  const t0 = AC.currentTime + (o.delay || 0), k = o.pitch || 1;
  [[1500, 2700, 2300], [2600, 2000, 1500]].forEach(([a, b, c], i) => {
    const t = t0 + i * .36, osc = AC.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(a * k, t); osc.frequency.linearRampToValueAtTime(b * k, t + .12); osc.frequency.linearRampToValueAtTime(c * k, t + .26);
    const g = AC.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .03);
    g.gain.setValueAtTime(vol, t + .2); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
    osc.connect(g).connect(out); osc.start(t); osc.stop(t + .35);
  });
};
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), fwd = new THREE.Vector3();
E.fwd = fwd;
E.pan = p => { tmpA.copy(p).sub(camera.position).setY(0).normalize(); return tmpA.x * Math.cos(player.yaw) - tmpA.z * Math.sin(player.yaw); };
E.near = (p, ref = 1.5, max = 1) => Math.min(max, ref / (1 + camera.position.distanceTo(p)));
E.sfx = {
  click: () => E.noiseHit(.04, .35, 3500, null, 'highpass'),
  pick: () => { E.noiseHit(.05, .25, 1800); E.tone(220, .08, .05, 'square'); },
  knob: () => { E.noiseHit(.05, .4, 2000, null, 'highpass'); E.noiseHit(.12, .3, 500); },
  drawer: () => { E.noiseHit(.25, .15, 900); E.noiseHit(.06, .25, 300); },
  creak: () => { E.tone(180, .7, .05, 'sawtooth', null, 0, 0, 120); E.noiseHit(.5, .06, 700, null, 'bandpass'); },
  boing: () => E.tone(260, .25, .08, 'triangle', null, 0, 0, 520),
  chime: () => { E.tone(1320, .9, .06, 'triangle'); E.tone(1980, .7, .03, 'sine', null, .08); },
  step: () => {
    const f = L.floor;
    if (f === 'grass') E.noiseHit(.14, .06, 1400, null, 'bandpass');
    else if (f === 'carpet') E.noiseHit(.1, .09, 260);
    else E.noiseHit(.09, .12, 380);
  }
};

/* ============ HUD ============ */
let subT = 0, toastT = 0;
E.say = (text, dur = 3.5, cls = 'eu') => {
  const tag = { tv: '<b>PASSAREX:</b> ', dica: '<b>DICA:</b> ', nar: '<b>ARQUIVO:</b> ' }[cls] || '';
  $('sub').innerHTML = `<span class="${cls}">${tag}${text}</span>`;
  subT = dur;
};
E.toast = text => { $('toast').innerHTML = text; $('toast').classList.add('on'); toastT = 4; };
E.osd = (tl, bl) => { $('tl').innerHTML = tl; $('bl').innerHTML = bl; };
E.note = html => {
  state.noteOpen = true; $('noteBody').innerHTML = html; $('note').classList.remove('hidden');
  E.noiseHit(.2, .2, 3000, null, 'highpass');
};
function closeNote() { if (state.painting) return; state.noteOpen = false; $('note').classList.add('hidden'); }
E.choice = (q, opts, def = opts.length - 1, timeout = 8) => new Promise(res => {
  state.choosing = { res, def, t: timeout, T: timeout };
  $('choice').innerHTML = `<div class="q">${q}</div>` + opts.map((o, i) => `<div class="opt">[${i + 1}] ${o}</div>`).join('') + '<div class="bar"><i></i></div>';
  $('choice').classList.remove('hidden');
  // no celular: botões grandes por cima dos controles de toque
  const tc = $('tchoice');
  tc.innerHTML = `<div class="q">${q}</div>` + opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join('') + '<div class="bar"><i></i></div>';
  tc.classList.remove('hidden');
});
function pick(i) {
  const c = state.choosing; if (!c) return;
  state.choosing = null; $('choice').classList.add('hidden'); $('tchoice').classList.add('hidden'); c.res(i);
}
$('tchoice').addEventListener('touchstart', e => {
  const b = e.target.closest('button'); if (!b) return;
  e.preventDefault(); e.stopPropagation(); pick(+b.dataset.i);
}, { passive: false });
$('tchoice').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pick(+b.dataset.i); });
E.end = html => {
  if (state.ended) return;
  state.ended = true;
  document.exitPointerLock && document.exitPointerLock();
  if (AC && L.bus) L.bus.gain.setTargetAtTime(0, AC.currentTime + .4, .3);
  setTimeout(() => setMusic('musica', .45), 1500);
  setTimeout(() => {
    const e = $('end'); e.innerHTML = html; e.classList.remove('hidden'); e.scrollTop = 0;
    const deNovo = () => { if (REPLAY) irPara({}); else location.reload(); };
    // na tela grande do final, só o botão reinicia (clicar em link, no tira-dúvidas ou rolar não pode reiniciar o jogo)
    e.onclick = ev => { if (ev.target.closest('[data-fim]')) return deNovo(); if (e.querySelector('.fimBox') || ev.target.closest('a, details, summary, button')) return; deNovo(); };
  }, 900);
};

/* ============ vozes (geradas no VoiceStudio: audio/voz/*.mp3) ============ */
const VOZ = { dur: {}, buf: {}, src: null };
async function loadVoices() {
  try { VOZ.dur = await (await fetch('audio/voz/duracoes.json', { cache: 'no-cache' })).json(); } catch (e) { return; }
  await Promise.all(Object.keys(VOZ.dur).filter(id => !id.startsWith('f_')).map(async id => {
    try { const ab = await (await fetch(`audio/voz/${id}.mp3`)).arrayBuffer(); VOZ.buf[id] = await AC.decodeAudioData(ab); } catch (e) {}
  }));
}
// voz de uma fala de diálogo: o arquivo se chama 'f_' + uma conta feita com "QUEM|texto" (a mesma do ferramentas/falas_principais.py)
const idFala = s => { let h = 5381; for (const c of s) h = (Math.imul(h, 33) ^ c.codePointAt(0)) >>> 0; return 'f_' + h.toString(16).padStart(8, '0'); };
let falaVez = 0, falaSrc = null;
E.falaPara = () => { falaVez++; if (falaSrc) { try { falaSrc.stop(); } catch (e) {} if (VOZ.src === falaSrc) VOZ.until = 0; falaSrc = null; } };
E.falaDe = async (quem, txt) => {
  E.falaPara();
  const id = idFala(`${quem}|${txt}`), vez = falaVez;
  if (!AC || !VOZ.dur[id]) return false;
  try { if (!VOZ.buf[id]) VOZ.buf[id] = await AC.decodeAudioData(await (await fetch(`audio/voz/${id}.mp3`)).arrayBuffer()); } catch (e) { return false; }
  if (vez !== falaVez) return false;   // já passou pra outra fala
  if (VOZ.src) { try { VOZ.src.stop(); } catch (e) {} }
  const s = AC.createBufferSource(); s.buffer = VOZ.buf[id]; s.connect(E.gain(1.15, master)); s.start();
  falaSrc = VOZ.src = s; VOZ.until = AC.currentTime + s.buffer.duration;
  return true;
};
E.idFala = idFala;
// toca uma fala com legenda; o:{dest, pan, vol}
E.voice = (id, text, cls = 'tv', o = {}) => {
  const b = VOZ.buf[id], dur = b ? b.duration : (VOZ.dur[id] || Math.max(2, text.length / 14));
  E.say(text, dur + .8, cls);
  if (b && AC) {
    if (VOZ.src && !o.overlap) { try { VOZ.src.stop(); } catch (e) {} }
    const s = AC.createBufferSource(); s.buffer = b;
    let out = o.dest || master;
    const g = AC.createGain(); g.gain.value = o.vol ?? 1;
    if (o.pan !== undefined) { const p = AC.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); p.connect(out); out = p; }
    s.connect(g).connect(out); s.start();
    VOZ.src = s; VOZ.until = AC.currentTime + b.duration;
  }
  return dur;
};

/* ============ sustos ============ */
// o rosto: o Passarex enorme, olhos vazios, boca aberta, tudo avermelhado
const scareCv = document.createElement('canvas'); scareCv.width = 854; scareCv.height = 480; scareCv.id = 'scareCv';
$('scare').appendChild(scareCv);
function drawScare(k = 0) {
  const g = scareCv.getContext('2d'), s = 2.5 + k * .25;
  g.fillStyle = '#000'; g.fillRect(0, 0, 854, 480);
  g.save(); g.translate(427 + (Math.random() - .5) * 20, 230 + 600 * s * 1.25); g.scale(s, s * 1.25);
  window.drawPassarex(g, 1.6, {});
  g.fillStyle = '#000';
  const PE = window.PX_EYE;
  for (const ex of [PE.lx, PE.rx]) { g.beginPath(); g.ellipse(ex, PE.y, 26, 30, 0, 0, 7); g.fill(); }
  g.fillStyle = '#f4e2a8'; for (const ex of [PE.lx, PE.rx]) { g.beginPath(); g.arc(ex + (Math.random() - .5) * 4, PE.y + 4, 2.6, 0, 7); g.fill(); }
  g.fillStyle = '#0a0203'; g.beginPath(); g.ellipse(2, PE.my + 12, 22, 40, 0, 0, 7); g.fill();
  g.restore();
  g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c8241c'; g.fillRect(0, 0, 854, 480);
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(427, 240, 150, 427, 240, 520); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.9)');
  g.fillStyle = vg; g.fillRect(0, 0, 854, 480);
  for (let i = 0; i < 1200; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.5)' : 'rgba(255,200,190,.25)'; g.fillRect(Math.random() * 854, Math.random() * 480, 2, 2); }
  for (let i = 0; i < 14; i++) { const y = Math.random() * 480, h = 2 + Math.random() * 10; g.drawImage(scareCv, 0, y, 854, h, (Math.random() - .5) * 60, y, 854, h); }
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 0; y < 480; y += 3) g.fillRect(0, y, 854, 1);
}
let scareT = 0, scareDur = 0, glitchTxtT = 0;
E.scream = (vol = .5) => {
  capSom('[scream]');
  if (!AC) return;
  if (SFX.jumpscare) { playBuf(SFX.jumpscare, Math.min(1.4, vol * 2.4), { dest: master }); E.noiseHit(.5, vol * .4, 2500, master, 'highpass'); return; }
  E.noiseHit(1.1, vol, 2500, master, 'highpass'); E.noiseHit(.6, vol * .8, 600, master);
  for (const [f, d] of [[880, 0], [932, 0], [620, 7]]) E.tone(f, 1.0, vol * .18, 'sawtooth', master, 0, d, 110);
  E.tone(55, .9, vol * .5, 'square', master);
};
// susto dos OUTROS (Ratabrumga, Acerolito, Rosengo, a luta...): o áudio gravado do Davy é só do Passarex.
// Aqui sai um "piscar" de tela ou um grito sintetizado, sorteado e com tom diferente a cada vez.
E.gritoOutro = (vol = .5) => {
  capSom('[screech]');
  if (!AC) return;
  const t = AC.currentTime, r = Math.random();
  if (r < .4) {   // piscar: dois estalos secos e um bip agudo
    E.noiseHit(.06, vol * .9, 4000, master, 'highpass'); setTimeout(() => E.noiseHit(.05, vol * .8, 3000, master, 'highpass'), 90);
    E.tone(1800 + Math.random() * 900, .12, vol * .25, 'square', master, .04); E.tone(70, .3, vol * .6, 'square', master);
    return;
  }
  // grito: serra com glissando + duas formantes de voz + ruído
  const f0 = 520 + Math.random() * 700, dur = .55 + Math.random() * .45;
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * .8, t); o.frequency.exponentialRampToValueAtTime(f0 * (1.1 + Math.random() * .4), t + .08); o.frequency.exponentialRampToValueAtTime(f0 * .45, t + dur);
  const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 7 + Math.random() * 6; lg.gain.value = f0 * .04; lfo.connect(lg).connect(o.frequency);
  const g = AC.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol * .7, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  for (const [fq, q] of [[900 + Math.random() * 400, 6], [2400 + Math.random() * 600, 8]]) { const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q; o.connect(bp).connect(g); }
  g.connect(master); o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
  E.noiseHit(dur * .8, vol * .35, 2200, master, 'bandpass');
};
// susto grande (rosto na tela inteira, grito, tremida)
E.scare = (dur = .9, vol = .5) => {
  scareT = dur; scareDur = dur; drawScare(); $('scare').classList.remove('hidden'); E.scream(vol);
};
// susto pequeno (um quadro do rosto, quase subliminar)
E.flash = () => { scareT = .13; scareDur = .13; drawScare(); $('scare').classList.remove('hidden'); E.noiseHit(.25, .3, 3000, master, 'highpass'); };
// falha de tela com texto
E.glitchText = (txt, dur = .35) => { glitchTxtT = dur; $('gtext').textContent = txt; $('gtext').classList.remove('hidden'); E.noiseHit(dur, .25, 2000, master, 'bandpass'); };
function updateScare(dt) {
  if (scareT > 0) {
    scareT -= dt;
    if (Math.random() < .5) drawScare(1 - scareT / scareDur);
    wrap.style.transform = `translate(calc(-50% + ${(Math.random() - .5) * 24}px), calc(-50% + ${(Math.random() - .5) * 24}px))`;
    if (scareT <= 0) { $('scare').classList.add('hidden'); wrap.style.transform = ''; }
  }
  if (glitchTxtT > 0) {
    glitchTxtT -= dt; $('gtext').style.transform = `translate(${(Math.random() - .5) * 14}px, ${(Math.random() - .5) * 6}px)`;
    if (glitchTxtT <= 0) $('gtext').classList.add('hidden');
  }
}
// morte: susto, tela de sinal perdido, volta do último ponto
E.die = respawn => {
  if (state.dead) return;
  state.dead = true;
  E.voice('p_peguei', 'Te peguei.', 'tv', { overlap: true });
  E.scare(1.0, .6);
  setTimeout(() => { $('lost').classList.remove('hidden'); E.voice('n_sinal', 'Sinal perdido. Retomando a fita.', 'nar'); }, 950);
  setTimeout(() => { respawn && respawn(); }, 2600);
  setTimeout(() => { $('lost').classList.add('hidden'); state.dead = false; }, 3600);
};

/* ============ passarinho guia (dica) ============ */
const guideTex = E.canvasTex(16, 16, g => {
  g.fillStyle = '#ffd94a'; g.fillRect(4, 6, 8, 6); g.fillRect(9, 4, 4, 4);
  g.fillStyle = '#f2a81d'; g.fillRect(2, 7, 3, 3); g.fillRect(6, 5, 3, 2);
  g.fillStyle = '#e8762a'; g.fillRect(13, 6, 2, 1);
  g.fillStyle = '#222'; g.fillRect(11, 5, 1, 1);
  g.fillStyle = 'rgba(255,240,170,.6)'; g.fillRect(5, 9, 5, 2);
});
let guide = null;
E.guide = pts => {
  if (guide) scene.remove(guide.sp);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: guideTex, fog: false, transparent: true, depthTest: false }));
  sp.scale.set(.22, .22, 1); sp.renderOrder = 10;
  camera.getWorldDirection(tmpA);
  sp.position.copy(camera.position).addScaledVector(tmpA, 1.1); sp.position.y -= .12;
  scene.add(sp);
  guide = { sp, pts: pts.map(p => p.clone()), i: 0, life: 0, fade: 0, wt: 0 };
};
function updateGuide(dt) {
  if (!guide) return;
  const g = guide, p = g.sp.position;
  g.life += dt;
  if (g.i < g.pts.length && g.life < 20) {
    const t = g.pts[g.i]; tmpA.copy(t).sub(p); const d = tmpA.length();
    // espera um instante na sua frente, depois voa; se você ficar para trás, ele te espera
    const waiting = g.life < .8 || camera.position.distanceTo(p) > 5.5;
    if (d < .25) g.i++; else if (!waiting) p.addScaledVector(tmpA.normalize(), Math.min(d, 2.8 * dt));
  } else {
    g.fade += dt; g.sp.material.opacity = Math.max(0, 1 - g.fade / 1.2);
    if (g.fade > 1.2) { scene.remove(g.sp); guide = null; return; }
  }
  p.y += Math.sin(g.life * 14) * .004;
  g.wt -= dt; if (g.wt <= 0) { g.wt = 1.5; E.whistle(.05 * E.near(p, 2.5), { pan: E.pan(p), pitch: 1.35 }); }
}
let hintCd = 0;
function hint() {
  if (!L.hint || hintCd > 0 || !state.started || state.paused || state.ended) return;
  hintCd = 3;
  const h = L.hint(); if (!h) return;
  E.say(h.text, 5, 'dica');
  const pts = h.path || (h.target ? [h.target] : null);
  if (pts) E.guide(pts);
}

/* ============ jogador ============ */
const player = E.player = { pos: new THREE.Vector3(), yaw: 0, pitch: 0, bob: 0, camY: 1.58 };
const R = .28;
function blocked(x, z) {
  if (L.walkable) { if (!L.walkable(x, z)) return true; }
  else { const r = L.rect; if (x < r.x0 + R || x > r.x1 - R || z < r.z0 + R || z > r.z1 - R) return true; }
  for (const c of L.colliders) if (x > c.x0 - R && x < c.x1 + R && z > c.z0 - R && z < c.z1 + R) return true;
  for (const c of L.circles) if (Math.hypot(x - c.x, z - c.z) < c.r + R) return true;
  return false;
}
E.blocked = blocked;
E.ground = (x, z) => L.ground ? L.ground(x, z) : 0;
const keys = {};
// direção pedida pelo jogador (teclado ou joystick), para fases que usam o movimento de outro jeito (o leme do navio)
E.axis = () => {
  let f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  let s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  if (touch.stick) { f -= touch.stick.y; s += touch.stick.x; }
  return { f, s };
};
let stepT = 0;
function move(dt) {
  let f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  let s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  if (touch.stick) { f -= touch.stick.y; s += touch.stick.x; }
  let vx = -Math.sin(player.yaw) * f + Math.cos(player.yaw) * s, vz = -Math.cos(player.yaw) * f - Math.sin(player.yaw) * s;
  const l = Math.hypot(vx, vz);
  if (l > .08) {
    const m = Math.min(1, l); vx /= l; vz /= l;
    const run = keys.ShiftLeft || keys.ShiftRight || touch.run;
    const sp = L.speed * (run ? 1.5 : 1) * m * dt * (1 - (L.pull || 0) * .8), p = player.pos;
    if (!blocked(p.x + vx * sp, p.z)) p.x += vx * sp;
    if (!blocked(p.x, p.z + vz * sp)) p.z += vz * sp;
    player.run = !!run && !L.speedFixa;
    player.bob += dt * (run ? 13 : 8.5); stepT -= dt; if (stepT <= 0) { E.sfx.step(); stepT = run ? .3 : .5; }
  } else player.run = false;
}

/* ============ entrada ============ */
const cv = renderer.domElement;
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyE') { if (state.exerc) E.sairExerc(); else if (state.dlg) E.dlgNext(); else if (state.noteOpen) closeNote(); else doInteract(true); }
  if (e.code === 'KeyV' && state.started && !state.choosing) { e.preventDefault(); E.trocaCamera(); }
  if (e.code === 'KeyC' && state.started && !state.paused && L.onCall) L.onCall();
  if (e.code === 'KeyQ' && !e.repeat && state.started && !state.paused && !state.choosing && L.onCap) L.onCap();
  if (e.code === 'KeyT' && state.started && !state.paused && !state.choosing && L.onSwap) L.onSwap();
  if ((e.code === 'KeyI' || e.code === 'Tab') && state.started && !state.paused && !state.choosing) { e.preventDefault(); E.abrirInventario && E.abrirInventario(); }
  if (/^Digit[1-3]$/.test(e.code) && state.started && !state.choosing && L.onGear) L.onGear(+e.code.slice(-1) - 1);
  if (e.code === 'KeyH') hint();
  if (state.choosing && /^(Digit|Numpad)[1-9]$/.test(e.code)) { const n = +e.code.slice(-1) - 1; if (document.querySelectorAll("#choice .opt").length > n) pick(n); }
  if (e.code === 'Backquote') $('debug').classList.toggle('hidden');
  if (e.code === 'KeyR' && state.ended) location.reload();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
E.soltarTeclas = () => { for (const k in keys) keys[k] = false; };
addEventListener('mousemove', e => {
  if ((document.pointerLockElement !== cv && !(e.buttons & 1)) || !state.started || state.noteOpen || state.ended) return;
  player.yaw -= e.movementX * .0022 * OPT.sens; player.pitch -= e.movementY * .0022 * OPT.sens;
  player.pitch = Math.max(-1.35, Math.min(1.35, player.pitch));
});
cv.addEventListener('mousedown', () => {
  if (!state.started) return;
  if (state.dlg) E.dlgNext(); else if (state.noteOpen) closeNote(); else doInteract();
  if (document.pointerLockElement !== cv) lock();
});
E.lockPtr = () => { if (!IS_TOUCH) lock(); };
function lock() { try { const p = cv.requestPointerLock && cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
let everLocked = false;
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === cv) { everLocked = true; return; }
  if (everLocked && state.started && !state.ended && !state.painting) {
    if (state.noteOpen) closeNote();
    state.paused = true; $('pause').classList.remove('hidden');
  }
});
// links do Instagram não podem fechar a pausa nem reiniciar o jogo
document.addEventListener('click', e => { if (e.target.closest('.promo a')) e.stopPropagation(); }, true);
E.promo = `<div class="promo big">
  <p>Gostou? Dá uma moral pro criador:</p>
  <a class="ig" href="https://www.instagram.com/odavyyy1/" target="_blank" rel="noopener">▶ SEGUE O @odavyyy1 NO INSTAGRAM</a>
  <p class="dim">Feito por oDavyy com Claude Code · Passarex e a lore são d’<a href="https://www.instagram.com/os_bacanos67/" target="_blank" rel="noopener">Os Bacanos</a> · <a href="https://odavyyy.github.io/registro-1367/" target="_blank" rel="noopener">como foi feito</a></p>
  <p><a href="https://youtu.be/6tqPn_Aw5b8" target="_blank" rel="noopener">▶ assista o trailer no YouTube</a> · novas partes chegam em atualizações, sempre que possível</p>
</div>`;

/* ============ save (fica no navegador de quem joga) ============ */
const SAVE_KEY = 'registro1367-save';
const NOMES = { ilha: 'a ilha dos Passarex', casa: 'a sala de casa', colinas: 'as colinas', amarelas: 'as salas amarelas', vilasol: 'a vila do sol que dorme', estrelas: 'a estrada das estrelas', reino: 'o reino adormecido', brinquedo: 'a sala de brincar', avenida: 'a avenida de Naviraí', navio: 'o navio de 1491', salabranca: 'a sala branca', centro: 'o centro de Naviraí', floresta: 'a floresta de cogumelos', matagale: 'Matagalé', arvore: 'a árvore do Passarex', portoes: 'os Portões do Clubex' };
function readSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && FASES[s.fase] ? s : null; } catch (e) { return null; }
}
let savedT = 0, resumePos = null;
E.save = (extra = {}) => {
  if (REPLAY) return;   // repetindo uma fase: não mexe no save
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      fase: L.id, noticed: state.noticed, clues: state.clues, penas: state.penas, flags: state.flags,
      pos: extra.pos || null, t: Date.now()
    }));
    $('saved').classList.add('on'); savedT = 2;
  } catch (e) {}
};
E.clearSave = () => { if (REPLAY) return; try { localStorage.removeItem(SAVE_KEY); } catch (e) {} };
const SAVE0 = params.get('fase') || params.get('cap') ? null : readSave();

/* ============ fases terminadas (dá pra repetir pelo menu) ============ */
const REPLAY = params.has('repetir');
const FASE_ORDER = ['casa', 'colinas', 'amarelas', 'vilasol', 'estrelas', 'reino', 'brinquedo', 'navio', 'salabranca', 'avenida', 'centro', 'floresta', 'matagale', 'arvore'];
const DONE_KEY = 'registro1367-fases';
const DONE = new Set((() => { try { return JSON.parse(localStorage.getItem(DONE_KEY)) || []; } catch (e) { return []; } })());
function markDone(id) {
  if (REPLAY || !FASE_ORDER.includes(id) || DONE.has(id)) return;
  DONE.add(id); try { localStorage.setItem(DONE_KEY, JSON.stringify([...DONE])); } catch (e) {}
}
if (SAVE0) FASE_ORDER.slice(0, Math.max(0, FASE_ORDER.indexOf(SAVE0.fase))).forEach(markDone);   // quem já tinha save não perde nada
if (DONE.has('brinquedo')) for (const id of ['vilasol', 'estrelas', 'reino']) { DONE.add(id); try { localStorage.setItem(DONE_KEY, JSON.stringify([...DONE])); } catch (e) {} }   // fases novas: já liberadas pra quem tinha passado dali
/* ============ capítulos: dá pra voltar em qualquer um que você já alcançou (pra pegar o que faltou) ============ */
const ACHOU = { st: 1, found: { praca: 1, pobreza: 1, if: 1 } };
const CAPS = [
  { id: 'casa', nome: 'A fita', fase: 'casa' },
  { id: 'colinas', nome: 'As colinas', fase: 'colinas' },
  { id: 'amarelas', nome: 'As salas amarelas', fase: 'amarelas' },
  { id: 'vilasol', nome: 'A vila do sol que dorme', fase: 'vilasol' },
  { id: 'estrelas', nome: 'A estrada das estrelas', fase: 'estrelas' },
  { id: 'reino', nome: 'O reino adormecido', fase: 'reino' },
  { id: 'brinquedo', nome: 'A sala de brincar', fase: 'brinquedo' },
  { id: 'navio', nome: 'Registro 1491', fase: 'navio' },
  { id: 'salabranca', nome: 'A sala branca', fase: 'salabranca' },
  { id: 'avenida', nome: 'A avenida de Naviraí', fase: 'avenida' },
  { id: 'centro', nome: 'O centro: os três esconderijos', fase: 'centro', Q: { st: 0, found: {} } },
  { id: 'floresta', nome: 'A floresta e as goiabas', fase: 'floresta', Q: ACHOU },
  { id: 'matagale', nome: 'Matagalé: o rastro do Serjão', fase: 'matagale', Q: { ...ACHOU, st: 1, plano: 1, doces: 1, azedas: 1, armas: 1, mata: 1 } },
  { id: 'arvore', nome: 'A árvore do Passarex', fase: 'arvore', Q: { ...ACHOU, st: 1, plano: 1, doces: 1, azedas: 1, armas: 1, mata: 2 } },
  { id: 'luta', nome: 'A luta contra o Passarex', fase: 'centro', Q: { ...ACHOU, st: 2, plano: 1, doces: 1, azedas: 1, armas: 1, mata: 6 } },
  { id: 'apoc', nome: 'Depois da luta: o café', fase: 'centro', Q: { ...ACHOU, st: 3, plano: 1, doces: 1, azedas: 1, armas: 1, mata: 6 } },
  { id: 'portoes', nome: 'Os Portões do Clubex', fase: 'portoes', flags: { final: 'A' } },
  { id: 'ilha', nome: '★ A ilha dos Passarex', fase: 'ilha', secreto: true },   // só aparece com o final D ou com o código
];
E.CAPS = CAPS;
const CAP0 = CAPS.find(c => c.id === params.get('cap')) || null;
E.marcaCap = id => { if (REPLAY || !E.META) return; E.META.caps = E.META.caps || {}; if (!E.META.caps[id]) { E.META.caps[id] = 1; E.salvarMeta(); } };
const finalD = () => { try { return (JSON.parse(localStorage.getItem('registro1367-finais')) || []).includes('D'); } catch (e) { return false; } };
const capLiberado = c => (E.META && E.META.caps && E.META.caps[c.id]) || (c.secreto ? finalD() : DONE.has(c.fase)) || (c.id === 'casa');
function buildFases() {
  const M = E.META || { coins: {}, coinTot: {}, ovos: {}, ovoLvl: {} };
  $('faseList').innerHTML = CAPS.map((c, i) => {
    if (c.secreto && !capLiberado(c)) return '';
    const ok = capLiberado(c), tot = (M.coinTot || {})[c.fase] || 0, got = Object.keys(M.coins || {}).filter(k => k.startsWith(c.fase + ':')).length;
    const ovT = Object.keys(M.ovoLvl || {}).filter(k => M.ovoLvl[k] === c.fase), ovG = ovT.filter(k => (M.ovos || {})[k]).length;
    const extra = [tot ? `🪙 ${got}/${tot}` : '', ovT.length ? `★ ${ovG}/${ovT.length}` : ''].filter(Boolean).join(' · ');
    return ok ? `<button data-c="${c.id}">Cap. ${i + 1} · ${c.nome}<small>${extra || 'jogar'}${extra ? ' · jogar' : ''}</small></button>`
      : `<button disabled>Cap. ${i + 1} · ???<small>chegue lá jogando para liberar</small></button>`;
  }).join('');
}
// troca de capítulo / volta ao menu sem perder os parâmetros que já vêm no endereço
// (o itch serve o jogo com uma chave no final do link; se ela sumir, o servidor responde 404)
function irPara(novos) {
  const q = new URLSearchParams(location.search);
  ['cap', 'fase', 'repetir'].forEach(k => q.delete(k));
  for (const k in novos) q.set(k, novos[k]);
  const qs = q.toString();
  location.href = location.pathname + (qs ? '?' + qs : '') + location.hash;
}
// código secreto: 1367 libera todos os capítulos, skins e roupas
$('codigoBtn').addEventListener('click', () => { $('codigoForm').classList.remove('hidden'); $('codigoBtn').classList.add('hidden'); $('codigoIn').focus(); });
$('codigoIn').addEventListener('keydown', e => e.stopPropagation());
$('codigoForm').addEventListener('submit', e => {
  e.preventDefault();
  const box = $('codigoBox'), v = $('codigoIn').value.replace(/\D/g, '');
  box.classList.remove('erro');
  if (v === '1367') {
    E.liberarTudo && E.liberarTudo();
    E.META.caps = E.META.caps || {}; for (const c of CAPS) E.META.caps[c.id] = 1; E.salvarMeta();
    buildFases();
    $('codigoMsg').innerHTML = '<b style="color:#9fe3aa">✔ TUDO LIBERADO</b>: todos os capítulos, skins, roupas, conquistas e finais.';
    $('codigoIn').value = ''; E.tone && (E.tone(660, .12, .05, 'square'), E.tone(990, .2, .05, 'square', null, .12));
  } else {
    void box.offsetWidth; box.classList.add('erro');
    $('codigoMsg').textContent = 'Código errado.'; E.tone && E.tone(140, .2, .05, 'square');
  }
});
$('faseList').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) irPara({ cap: b.dataset.c, repetir: 1 }); });
function fimRepeticao() {
  if (state.ended) return;
  state.ended = true; document.exitPointerLock && document.exitPointerLock();
  if (AC && L.bus) L.bus.gain.setTargetAtTime(0, AC.currentTime + .3, .3);
  const e = $('end');
  e.innerHTML = `<h1>■ FASE CONCLUÍDA</h1><p>${NOMES[L.id]}</p><p class="go">[ clique para voltar ao menu ]</p>`;
  e.classList.remove('hidden'); e.onclick = () => { irPara({}); };
}

/* ============ rádio Clubex FM: as músicas do Suno pelo player deles ============ */
let RADIO = [], RADIO_ON = false, radioI = -1;
fetch('audio/radio/suno.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).then(l => { RADIO = (Array.isArray(l) ? l : []).filter(m => /^[0-9a-f-]{36}$/.test(m.id)); }).catch(() => {});
function buildRadio() {
  $('radioList').innerHTML = RADIO.length ? RADIO.map((m, i) => `<button data-r="${i}" class="${i === radioI ? 'on' : ''}">${i === radioI ? '♪ ' : ''}${m.titulo}<small> · ${m.autor || ''}</small></button>`).join('') : '<p class="dim">nenhuma música ainda</p>';
}
function tocarRadio(i) {
  E.conquista && E.conquista('radio');
  const m = RADIO[i]; if (!m) return;
  radioI = i; RADIO_ON = true; setMusic(null);
  $('radioEmbed').innerHTML = `<iframe src="https://suno.com/embed/${m.id}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="${m.titulo}"></iframe>`;
  $('radioInfo').textContent = `tocando: ${m.titulo} · ${m.autor || ''} — aperte o play no player`;
  buildRadio();
}
E.radio = () => {
  const inGame = state.started && !state.ended && !state.paused;
  if (inGame) { state.painting = true; state.noteOpen = true; document.exitPointerLock && document.exitPointerLock(); }
  buildRadio(); $('radioP').classList.remove('hidden', 'bg');
  if (radioI < 0 && RADIO.length) tocarRadio(0);
};
function fecharRadio() {
  $('radioP').classList.add(radioI >= 0 ? 'bg' : 'hidden');   // escondido mas vivo: a música continua tocando
  if (state.started && state.painting) { state.painting = false; state.noteOpen = false; if (!IS_TOUCH && !state.paused) lock(); }
}
function pararRadio() {
  $('radioEmbed').innerHTML = ''; radioI = -1; RADIO_ON = false;
  $('radioP').classList.add('hidden'); $('radioP').classList.remove('bg');
  if (state.started && state.painting) { state.painting = false; state.noteOpen = false; if (!IS_TOUCH && !state.paused) lock(); }
  if (state.started) levelMusic(); else applyOpt();
}
$('radioList').addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) tocarRadio(+b.dataset.r); });
$('rBack').addEventListener('click', fecharRadio);
$('rStop').addEventListener('click', pararRadio);

/* ============ menu principal, opções, pausa ============ */
const OPT_KEY = 'registro1367-opcoes';
const OPT = Object.assign({ vol: .9, music: .7, menuMusic: true, subs: true, sens: 1 }, (() => { try { return JSON.parse(localStorage.getItem(OPT_KEY)) || {}; } catch (e) { return {}; } })());
E.OPT = OPT;
if (OPT.cam === undefined) OPT.cam = OPT.third ? 1 : 0;
E.salvarOpt = () => saveOpt();
function saveOpt() { try { localStorage.setItem(OPT_KEY, JSON.stringify(OPT)); } catch (e) {} applyOpt(); }
function applyOpt() {
  if (master) master.gain.value = OPT.vol;
  if (MUS.g && AC) MUS.g.gain.setTargetAtTime(MUS.base * OPT.music * (state.paused ? .5 : 1), AC.currentTime, .2);
  if (!state.started && AC && !RADIO_ON) { if (OPT.menuMusic) setMusic('musica', .4); else setMusic(null); }
  document.body.classList.toggle('nosubs', !OPT.subs);
}
function show(id) { for (const x of ['start', 'menu', 'opts', 'how', 'cred', 'fasesP', 'extrasP']) $(x).classList.toggle('hidden', x !== id); }
let optBack = 'menu';
function buildOpts() {
  const pct = v => Math.round(v * 100) + '%';
  $('optList').innerHTML = `
    <label>Volume geral <span>${pct(OPT.vol)}</span><input type="range" min="0" max="1" step=".05" value="${OPT.vol}" data-k="vol"></label>
    <label>Música <span>${OPT.music ? pct(OPT.music) : 'desligada'}</span><input type="range" min="0" max="1" step=".05" value="${OPT.music}" data-k="music"></label>
    <button class="tog" data-t="menuMusic">Música no menu: <b>${OPT.menuMusic ? 'LIGADA' : 'DESLIGADA'}</b></button>
    <button class="tog" data-t="subs">Legendas das vozes: <b>${OPT.subs ? 'LIGADAS' : 'DESLIGADAS'}</b></button>
    <label>Sensibilidade da câmera <span>${OPT.sens.toFixed(1)}x</span><input type="range" min=".4" max="2" step=".1" value="${OPT.sens}" data-k="sens"></label>
    <button class="tog" data-t="cam">Câmera: <b>${['1ª PESSOA', '3ª PESSOA (POR TRÁS)', '3ª PESSOA (DE FRENTE)'][(OPT.cam | 0) % 3]}</b> <small>(V)</small></button>
    <button class="tog" data-t="tutor">Ver o tutorial de novo</button>
    <button class="tog" data-t="full">Tela cheia</button>
    <button class="tog" data-t="apagar">🗑 Apagar meus dados deste jogo</button>
    <button class="tog" data-t="lang" data-no-tr>🌐 Idioma / Language: <b>${window.I18N && I18N.lang === 'en' ? 'ENGLISH' : 'PORTUGUÊS'}</b></button>`;
}
$('optList').addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; OPT[k] = +e.target.value; saveOpt(); const sp = e.target.previousElementSibling; sp.textContent = k === 'sens' ? OPT.sens.toFixed(1) + 'x' : (k === 'music' && !OPT.music ? 'desligada' : Math.round(OPT[k] * 100) + '%'); });
$('optList').addEventListener('click', e => {
  const t = e.target.closest('[data-t]'); if (!t) return;
  if (t.dataset.t === 'cam') { OPT.cam = ((OPT.cam | 0) + 1) % 3; OPT.third = OPT.cam > 0; saveOpt(); buildOpts(); return; }
  if (t.dataset.t === 'tutor') { if (state.started) { $('opts').classList.add('hidden'); resume(); E.tutorialBasico(true); } else { $('opts').classList.add('hidden'); show('how'); } return; }
  if (t.dataset.t === 'lang') { if (window.I18N) I18N.set(I18N.lang === 'en' ? 'pt' : 'en'); return; }
  if (t.dataset.t === 'apagar') {   // tudo que o jogo guarda fica no navegador: aqui a pessoa apaga tudo de uma vez (2 cliques)
    if (!t.dataset.ok) { t.dataset.ok = 1; t.textContent = 'Clique de novo para apagar save, conquistas, skins e opções'; t.style.borderColor = '#ff5d4e'; return; }
    try { Object.keys(localStorage).filter(k => k.startsWith('registro1367-')).forEach(k => localStorage.removeItem(k)); } catch (er) {}
    window.__apagando = true; location.reload(); return;
  }
  if (t.dataset.t === 'full') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (er) {} return; }
  OPT[t.dataset.t] = !OPT[t.dataset.t]; saveOpt(); buildOpts();
});
function openOpts(from) { optBack = from; buildOpts(); if (from === 'pause') { $('pause').classList.add('hidden'); $('opts').classList.remove('hidden'); } else show('opts'); }
$('optBack').addEventListener('click', () => { if (optBack === 'pause') { $('opts').classList.add('hidden'); $('pause').classList.remove('hidden'); } else show('menu'); });
for (const [b, p] of [['mHow', 'how'], ['mCred', 'cred']]) $(b).addEventListener('click', () => show(p));
$('mFases').addEventListener('click', () => { buildFases(); show('fasesP'); });
$('mExtras').addEventListener('click', () => show('extrasP'));
$('mConq').addEventListener('click', () => E.abrirConquistas());
$('mSkin').addEventListener('click', () => E.abrirSkins());
$('pSkin').addEventListener('click', () => E.abrirSkins());
$('mRadio').addEventListener('click', () => E.radio());
$('pRadio').addEventListener('click', () => E.radio());
for (const b of document.querySelectorAll('.backMenu')) b.addEventListener('click', () => show('menu'));
$('mOpt').addEventListener('click', () => openOpts('menu'));
if (SAVE0) { $('mCont').classList.remove('hidden'); $('mCont').querySelector('small').textContent = NOMES[SAVE0.fase]; }
$('mCont').addEventListener('click', () => begin(true));
$('mNew').addEventListener('click', () => begin(false));
// 1º clique: libera o som e abre o menu (com a música do menu)
// idioma: botões na tela inicial (o clique neles não entra no jogo)
document.querySelectorAll('#start .langs button').forEach(b => {
  if (window.I18N && b.dataset.l === I18N.lang) b.classList.add('on');
  b.addEventListener('click', e => { e.stopPropagation(); if (window.I18N && b.dataset.l !== I18N.lang) I18N.set(b.dataset.l); }, true);
});
document.querySelectorAll('#start .legal a').forEach(a => a.addEventListener('click', e => e.stopPropagation(), true));
$('start').addEventListener('click', () => {
  initAudio(); AC.resume(); applyOpt();
  show('menu');
  loadSfx(['musica']).then(() => { if (!state.started) applyOpt(); });
  loadVoices(); loadSfx(['fiufiu', 'jumpscare', 'trilha']);   // já vai carregando o resto
});
if (params.get('fase') || CAP0) { $('start').addEventListener('click', () => begin(false), { once: true }); }

let starting = false;
async function begin(cont) {
  if (starting) return; starting = true;
  goFullscreen();
  initAudio(); AC.resume();
  show(null); $('loading').classList.remove('hidden');
  if (!IS_TOUCH) lock();
  if (cont && SAVE0) {
    state.noticed = SAVE0.noticed || 0; state.clues = SAVE0.clues || {}; state.penas = SAVE0.penas || 0; state.flags = SAVE0.flags || {};
    resumePos = SAVE0.pos; load(SAVE0.fase);
  } else if (SAVE0) { E.clearSave(); load(L.id); }
  await Promise.race([Promise.all([loadVoices(), loadSfx(['fiufiu', 'jumpscare']), window.PX_PRONTO]), new Promise(r => setTimeout(r, 8000))]);
  setMusic(null);
  loadSfx(['trilha', 'musica']).then(() => { if (!state.ended) levelMusic(); });   // a trilha toca em loop o jogo inteiro
  startAmb();
  $('loading').classList.add('hidden');
  if (!E.META.corpo && E.criarPersonagem && !REPLAY) await E.criarPersonagem();
  state.started = true; if (!IS_TOUCH) lock();
  E.save(cont && SAVE0 && SAVE0.pos ? { pos: SAVE0.pos } : {});
  L.enter && L.enter();
  capituloEntra();
  setTimeout(() => E.tutorialBasico && E.tutorialBasico(), 2500);
}
// pausa: continuar, opções, menu principal
function resume() { AC && AC.resume(); $('pause').classList.add('hidden'); $('opts').classList.add('hidden'); state.paused = false; applyOpt(); if (!IS_TOUCH) lock(); }
$('pCont').addEventListener('click', resume);
$('pOpt').addEventListener('click', () => openOpts('pause'));
$('pMenu').addEventListener('click', () => { E.save(); if (REPLAY) irPara({}); else location.reload(); });
new MutationObserver(() => applyOpt()).observe($('pause'), { attributes: true, attributeFilter: ['class'] });
applyOpt();
$('note').addEventListener('click', () => closeNote());

/* ============ celular: joystick, arrastar para olhar, botões ============ */
const IS_TOUCH = params.has('touch') || matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
const touch = { stick: null, run: false, moveId: null, lookId: null, ox: 0, oy: 0, lx: 0, ly: 0, t0: 0, moved: 0 };
E.isTouch = IS_TOUCH;
if (IS_TOUCH) {
  document.body.classList.add('touch');
  const stickEl = $('stick'), knob = stickEl.firstElementChild, R0 = 46;
  const find = (list, id) => { for (const t of list) if (t.identifier === id) return t; return null; };
  $('tzMove').addEventListener('touchstart', e => {
    e.preventDefault(); const t = e.changedTouches[0]; if (touch.moveId !== null) return;
    touch.moveId = t.identifier; touch.ox = t.clientX; touch.oy = t.clientY; touch.stick = { x: 0, y: 0 };
    stickEl.style.display = 'block'; stickEl.style.left = t.clientX + 'px'; stickEl.style.top = t.clientY + 'px'; knob.style.transform = '';
  }, { passive: false });
  $('tzLook').addEventListener('touchstart', e => {
    e.preventDefault(); const t = e.changedTouches[0]; if (touch.lookId !== null) return;
    touch.lookId = t.identifier; touch.lx = t.clientX; touch.ly = t.clientY; touch.t0 = performance.now(); touch.moved = 0;
  }, { passive: false });
  addEventListener('touchmove', e => {
    const m = find(e.changedTouches, touch.moveId);
    if (m) {
      let dx = m.clientX - touch.ox, dy = m.clientY - touch.oy; const d = Math.hypot(dx, dy);
      if (d > R0) { dx *= R0 / d; dy *= R0 / d; }
      touch.stick = { x: dx / R0, y: dy / R0 }; knob.style.transform = `translate(${dx}px,${dy}px)`;
    }
    const k = find(e.changedTouches, touch.lookId);
    if (k && state.started && !state.noteOpen && !state.ended) {
      const dx = k.clientX - touch.lx, dy = k.clientY - touch.ly; touch.lx = k.clientX; touch.ly = k.clientY;
      touch.moved += Math.abs(dx) + Math.abs(dy);
      player.yaw -= dx * .0065 * OPT.sens; player.pitch = Math.max(-1.35, Math.min(1.35, player.pitch - dy * .0065 * OPT.sens));
    }
  }, { passive: true });
  const end = e => {
    if (find(e.changedTouches, touch.moveId)) { touch.moveId = null; touch.stick = null; stickEl.style.display = 'none'; }
    if (find(e.changedTouches, touch.lookId)) {
      touch.lookId = null;
      if (touch.moved < 12 && performance.now() - touch.t0 < 300) { if (state.dlg) E.dlgNext(); else if (state.noteOpen) closeNote(); else doInteract(); }   // toque rápido = interagir
    }
  };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  const btn = (id, fn) => $(id).addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
  btn('bAct', () => { if (state.exerc) E.sairExerc(); else if (state.dlg) E.dlgNext(); else if (state.noteOpen) closeNote(); else doInteract(true); });
  btn('bHint', () => hint());
  btn('bRun', () => { touch.run = !touch.run; $('bRun').classList.toggle('on', touch.run); });
  btn('bPause', () => { state.paused = true; $('pause').classList.remove('hidden'); });
  btn('bCam', () => E.trocaCamera && E.trocaCamera());
  btn('bCap', () => L.onCap && L.onCap());
  btn('bInv', () => E.abrirInventario && E.abrirInventario());
  $('choice').addEventListener('click', e => {
    const opts = [...document.querySelectorAll('#choice .opt')], i = opts.indexOf(e.target.closest('.opt'));
    if (i >= 0) pick(i);
  });
}
function goFullscreen() {
  if (!IS_TOUCH) return;
  try {
    const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
    const p = rq && rq.call(el);
    const lockO = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} };
    if (p && p.then) p.then(lockO).catch(() => {}); else lockO();
  } catch (e) {}
}
function updateTouchUI() {
  if (!IS_TOUCH) return;
  const playing = state.started && !state.paused && !state.ended && !state.noteOpen && !state.dead;
  $('touch').classList.toggle('hidden', false);
  $('touch').classList.toggle('off', !playing);
  $('touch').classList.toggle('choosing', !!state.choosing);
  $('rotate').classList.toggle('hidden', innerWidth >= innerHeight);
  $('bCap').style.display = L && L.onCap && L.temBone && L.temBone() ? '' : 'none';
  if (!playing && touch.stick) { touch.stick = null; touch.moveId = null; $('stick').style.display = 'none'; }
}

/* ============ interação ============ */
const ray = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let target = null;
function findTarget() {
  ray.far = L.reach || 1.9;
  if (E.third && E.third()) ray.set(tmpB.set(player.pos.x, player.camY, player.pos.z), E.dirOlhar(tmpA));   // 3ª pessoa: mira de onde você olha
  else ray.setFromCamera(center, camera);
  const hits = ray.intersectObjects([...L.occluders, ...L.interactables], true);
  for (const h of hits) {
    let o = h.object;
    while (o && !o.userData.it) o = o.parent;
    return o || null;
  }
  return null;
}
function doInteract(key) {
  if (!state.started || state.paused || state.ended || state.trans) return;
  if (target) target.userData.it.act();
  else if (key && L.onEmpty) L.onEmpty();   // apertar sem mirar em nada (ex.: descer do patinete)
}
// está olhando para este ponto, sem parede no meio?
E.looking = (p, minDot = .96) => {
  tmpB.copy(p).sub(camera.position); const dist = tmpB.length(); tmpB.normalize();
  if (tmpB.dot(fwd) < minDot) return false;
  ray.far = dist; ray.set(camera.position, tmpB);
  return ray.intersectObjects(L.occluders, false).length === 0;
};

/* ============ fases ============ */
function startAmb() {
  if (!AC || !L || L.bus) return;
  L.bus = AC.createGain(); L.bus.gain.value = 0; L.bus.connect(master);
  L.bus.gain.setTargetAtTime(1, AC.currentTime, .4);
  L.ambience && L.ambience(L.bus);
}
const HIST = {
  casa: [12, 'O Arquivo Passarex guarda fitas de quem viu o pássaro. Esta é a de número mil trezentos e sessenta e sete.'],
  colinas: [6, 'Quem assiste a fita entra nela. Os relatos de Naviraí falam de um pássaro com rosto de gente, que só assobia.'],
  amarelas: [6, 'Sessenta e sete relatos. Todos falam de corredores amarelos, de um zumbido e de um assobio no fim.'],
  vilasol: [9, 'Atrás da porta do arco-íris não tinha sala nenhuma. Os relatos chamam isto de os lugares que a fita sonha.'],
  estrelas: [10, 'Quem anda aqui não lembra de ter começado. Siga as luzes, e não discuta com quem for maior que você.'],
  reino: [10, 'No fim do sonho tem um reino. Todo mundo aqui dorme. Não acorde ninguém.'],
  brinquedo: [9, 'Cada porta leva a uma lembrança. Uma delas leva até ele.'],
  navio: [12, 'Antes de Naviraí, antes de tudo: o pássaro já mostrava o caminho. O Douradex foi o primeiro a confiar nele.'],
  salabranca: [6, 'Entre um registro e outro, a fita grava esta sala. Ninguém sabe de quem é o computador.'],
  avenida: [13, 'Naviraí, Mato Grosso do Sul. Foi aqui que os relatos começaram. Depois que escurece, nada de área aberta.'],
  centro: [6, 'Ele se alimenta do susto. Quanto mais você olha pra ele, mais ele te nota.'],
  floresta: [2, 'A floresta do curta. O Mago e o Macaco sabem como enfrentar o pássaro.'],
  matagale: [3, 'Matagalé, em Acerolândia. Os Acerolitos moram aqui. Faz três noites que eles não dormem.'],
  arvore: [3, 'A árvore do Passarex. Ela não aparece em mapa nenhum. Quem entra, anda devagar.'],
  luta: [2, 'Para encarar o Passarex, é preciso aura. E goiabas.'],
  apoc: [16, 'Ele caiu. Mas ainda respira. Só o café de Naviraí faz o soro.'],
  portoes: [12, 'O Clubex. Uma Confraria que só abre os portões pra quem tem aura.'],
};
function capituloAtual() {
  if (L.id === 'casa' && state.flags.final) return null;
  if (L.id === 'centro') { const st = (state.flags.centro || {}).st || 0; return st >= 3 ? 'apoc' : st >= 2 ? 'luta' : 'centro'; }
  return L.id;
}
function capituloEntra() {
  const id = capituloAtual(); if (!id || state.ultimoCap === id) return;
  state.ultimoCap = id;
  const i = CAPS.findIndex(c => c.id === id); if (i < 0) return;
  setTimeout(() => E.capCard && E.capCard(i + 1, CAPS[i].nome), 300);
  const h = HIST[id]; if (h) E.later(h[0], () => { if (!state.dlg) E.voice('n_cap_' + id, h[1], 'nar'); });
}
function load(id) {
  state.prevId = L ? L.id : null;
  E.dlgFechar && E.dlgFechar();
  if (L && state.started && L.id !== id) markDone(L.id);
  if (FASES[id] && ['casa', 'colinas', 'amarelas', 'vilasol', 'estrelas', 'reino', 'brinquedo', 'navio', 'salabranca', 'avenida', 'floresta', 'matagale', 'arvore', 'portoes'].includes(id) && !(id === 'casa' && state.flags.final)) E.marcaCap && E.marcaCap(id);
  if (L) {
    L.exit && L.exit();
    scene.remove(L.group);
    L.group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    if (L.bus) { const b = L.bus; b.gain.setTargetAtTime(0, AC.currentTime, .25); setTimeout(() => b.disconnect(), 2500); }
  }
  if (guide) { scene.remove(guide.sp); guide = null; }
  $('toast').classList.remove('on'); toastT = 0; $('sub').innerHTML = ''; subT = 0;
  L = E.L = {
    id, group: new THREE.Group(), colliders: [], circles: [], occluders: [], interactables: [], triggers: [],
    billboards: [], events: [], t: 0, rect: { x0: -3, x1: 3, z0: -3, z1: 3 }, eye: 1.58, speed: 1.5,
    floor: 'wood', reach: 1.9, spawn: { x: 0, z: 0, yaw: 0 }
  };
  scene.add(L.group);
  scene.fog = null; scene.background = new THREE.Color(0); camera.far = 90;
  FASES[id].build(E, L);
  // chão em camadas (rua, calçada, caminho, tapete...) piscava: cada camada plana perto do chão ganha um "empurrão" de profundidade
  L.group.updateMatrixWorld(true);
  const up = new THREE.Vector3(), nq = new THREE.Quaternion();
  L.group.traverse(o => {
    if (!o.isMesh || !o.geometry || Array.isArray(o.material) || !/Plane|Circle|Ring/.test(o.geometry.type)) return;
    o.getWorldQuaternion(nq); up.set(0, 0, 1).applyQuaternion(nq);
    const y = o.getWorldPosition(new THREE.Vector3()).y - (L.ground ? L.ground(o.position.x, o.position.z) : 0);
    if (up.y < .95 || y > .4 || y < -.05) return;
    const lvl = 1 + Math.round(y * 50);
    o.material = o.material.clone(); o.material.polygonOffset = true; o.material.polygonOffsetFactor = -lvl; o.material.polygonOffsetUnits = -lvl * 4;
  });
  camera.updateProjectionMatrix();
  player.pos.set(L.spawn.x, 0, L.spawn.z); player.yaw = L.spawn.yaw || 0; player.pitch = L.spawn.pitch || 0;
  if (resumePos) { player.pos.set(resumePos.x, 0, resumePos.z); player.yaw = resumePos.yaw || 0; resumePos = null; }
  player.camY = E.ground(player.pos.x, player.pos.z) + L.eye;
  if (AC) startAmb();
  if (state.started) { E.save(); levelMusic(); L.enter && L.enter(); capituloEntra(); }
}
E.goTo = id => {
  if (REPLAY && L) {
    const Q = state.flags.centro || {};
    const segue = CAP0 && ((CAP0.id === 'floresta' && id === 'centro' && (Q.st || 0) < 2) || (CAP0.id === 'floresta' && id === 'floresta') || (['matagale', 'arvore'].includes(CAP0.id) && ['matagale', 'arvore'].includes(id)) || (id === L.id && !(CAP0.id === 'luta' && Q.st >= 3)) || (CAP0.id === 'apoc' && ['floresta', 'centro', 'ilha'].includes(id)) || (CAP0.id === 'ilha' && id === 'portoes'));
    if (!segue && (id !== L.id || CAP0)) { fimRepeticao(); return; }
  }
  if (state.trans) return;
  state.trans = { id, t: 0, swapped: false };
  E.noiseHit(1.4, .3, 3000, master, 'highpass');
};

/* ============ laço ============ */
let last = performance.now(), gameT = 0;
function update(dt) {
  gameT += dt; L.t += dt;
  const tr = state.trans;
  if (tr) {
    tr.t += dt;
    postU.fade.value = tr.t < .7 ? tr.t / .7 : Math.max(0, 1 - (tr.t - .9) / .9);
    if (!tr.swapped && tr.t >= .75) { tr.swapped = true; load(tr.id); }
    if (tr.t > 1.8) { state.trans = null; postU.fade.value = 0; }
  }
  if (!state.noteOpen && !state.dlg && !state.exerc && !(tr && tr.t < .9) && !state.ended && !state.dead) move(dt);
  updateScare(dt);
  duckMusic();
  const p = player.pos;
  const gy = E.ground(p.x, p.z) + L.eye;
  player.camY += (gy - player.camY) * Math.min(1, dt * 12);
  // correndo: a câmera balança bem mais (sobe e desce, vai de um lado pro outro, inclina) e o campo de visão abre um pouco
  const rk = player.runK = (player.runK || 0) + ((player.run ? 1 : 0) - (player.runK || 0)) * Math.min(1, dt * 6);
  const lado = Math.cos(player.bob * .5) * rk * .06;
  camera.position.set(p.x + Math.cos(player.yaw) * lado, player.camY + Math.sin(player.bob) * (.022 + rk * .055), p.z - Math.sin(player.yaw) * lado);
  camera.rotation.set(player.pitch - Math.abs(Math.sin(player.bob)) * rk * .012, player.yaw, (L.roll || 0) + Math.sin(player.bob * .5) * rk * .028);
  const fovAlvo = 62 + rk * 7; if (Math.abs(camera.fov - fovAlvo) > .05) { camera.fov = fovAlvo; camera.updateProjectionMatrix(); }
  camera.getWorldDirection(fwd);
  E.cameraTerceira && E.cameraTerceira();
  E.extrasTick && E.extrasTick(dt);

  for (const b of L.billboards) b.rotation.y = Math.atan2(camera.position.x - b.position.x, camera.position.z - b.position.z);
  for (const t of L.triggers) if (!t.done && t.test(p)) { t.fn(); if (t.once) t.done = true; }
  for (let i = L.events.length - 1; i >= 0; i--) if (L.t >= L.events[i].at) { const ev = L.events.splice(i, 1)[0]; ev.fn(); }
  // um erro numa fase não pode congelar o jogo: registra uma vez e segue desenhando
  try { L.update && L.update(dt); } catch (e) { if (!L.erroLogado) { L.erroLogado = true; console.error('fase ' + L.id, e); } }
  updateGuide(dt);

  if (state.choosing) {
    const c = state.choosing; c.t -= dt;
    document.querySelectorAll('#choice .bar i, #tchoice .bar i').forEach(bar => { bar.style.width = Math.max(0, c.t / c.T * 100) + '%'; });
    if (c.t <= 0) pick(c.def);
  }
  if (subT > 0) { subT -= dt; if (subT <= 0) $('sub').innerHTML = ''; }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
  if (hintCd > 0) hintCd -= dt;
  if (savedT > 0) { savedT -= dt; if (savedT <= 0) $('saved').classList.remove('on'); }
  $('tr').textContent = L.clock ? L.clock(gameT) : `23:${String(Math.min(59, 41 + Math.floor(gameT / 45))).padStart(2, '0')}`;

  target = findTarget();
  const label = target ? target.userData.it.label() : '';
  $('prompt').textContent = IS_TOUCH ? label.replace('[E]', '✋') : label;
  $('cross').classList.toggle('on', label.startsWith('[E]'));

  postU.pull.value = L.pull || 0;
  postU.red.value = L.red || 0;
  postU.glitch.value = Math.max(L.glitch || 0, (L.pull || 0) * .5);

  if (!$('debug').classList.contains('hidden'))
    $('debug').textContent = `${L.id} · notou ${state.noticed}/5 · pistas ${Object.keys(state.clues).length} · penas ${state.penas}/3 · x ${p.x.toFixed(1)} z ${p.z.toFixed(1)}`;
}
function frame(now) {
  if (!L) { last = now; requestAnimationFrame(frame); return; }   // primeira fase ainda esperando a imagem do Passarex
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  postU.time.value = now / 1000;
  updateTouchUI();
  if (state.started && !state.paused && !state.ended) update(dt);
  else if (!state.started) {
    camera.position.set(player.pos.x, player.camY, player.pos.z); camera.rotation.set(player.pitch, player.yaw, 0);
    camera.getWorldDirection(fwd);
    L.idle && L.idle(now / 1000);
  }
  renderer.setRenderTarget(rt); renderer.render(scene, camera);
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  requestAnimationFrame(frame);
}

instalarExtras(E);
if (CAP0) { if (CAP0.Q) state.flags.centro = JSON.parse(JSON.stringify(CAP0.Q)); if (CAP0.flags) Object.assign(state.flags, CAP0.flags); if (!state.flags.rota) state.flags.rota = 'noite'; }
const startAt = CAP0 ? CAP0.fase : FASES[params.get('fase')] ? params.get('fase') : 'casa';
// a primeira fase só monta depois que a imagem do Passarex está pronta (senão as figurinhas dele ficariam vazias)
if (window.PX_OK) load(startAt); else (window.PX_PRONTO || Promise.resolve()).then(() => load(startAt));
requestAnimationFrame(frame);
if (DEBUG) $('debug').classList.remove('hidden');
// atalhos para testes
window.G = {
  E, state, player, load, get L() { return L; },
  // avança o jogo sem depender do requestAnimationFrame (painel escondido)
  step(n = 1, dt = 1 / 30) {
    for (let i = 0; i < n; i++) update(dt);
    renderer.setRenderTarget(rt); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  }
};
