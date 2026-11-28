// FASE 7 · O centro de Naviraí: a praça redonda com a catedral, a Pobresa Conveniência e o IFMS.
// 1) ache o Passarex escondido nos três lugares; 2) missão do Mago e do Macaco (com o Pássaro Cocô e o Pássaro das Esferas)
// para ganhar as máquinas de goiaba; 3) a luta na praça; 4) a cidade destruída: leve o café de Naviraí para a polícia antes que ele acorde.
import { lutar } from './boss.js';

export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(79950);
  const Q = S.flags.centro = S.flags.centro || { st: 0, found: {} };
  const APOC = Q.st >= 3;
  E.marcaCap && E.marcaCap(Q.st >= 3 ? 'apoc' : Q.st >= 2 ? 'luta' : 'centro');
  const SKY = APOC ? 0x5a2a1e : 0x1c2244;
  E.scene.background = new THREE.Color(SKY);
  E.scene.fog = new THREE.FogExp2(APOC ? 0x6a3a22 : 0x1c2244, APOC ? .045 : .03);
  E.camera.far = 130;
  L.floor = 'rua'; L.speed = 2.3; L.eye = 1.6; L.reach = 2.3;
  E.osd(APOC ? '<span class="rec">● REC</span>' : '▶ PLAY', APOC ? 'NAVIRAÍ · DEPOIS DA LUTA' : 'CENTRO DE NAVIRAÍ · MS');
  L.clock = () => APOC ? '04:44' : '23:59';
  const { lam, basic, box } = E;
  const C = { said: {}, talking: false, timer: 100, cafe: false, deliver: false, pxBig: null };

  /* ---------------- chão: praça, rótula, avenida até o IF ---------------- */
  const RP = 13, RR = 19.4;
  const IFZ = 62;
  const POB = { x0: -27, x1: -19.6, z0: -4, z1: 4 };
  const CH = { x0: -5.6, x1: 5.6, z0: -32.6, z1: -21.6 }, CHM = (CH.z0 + CH.z1) / 2, CHH = 8;
  L.temCafe = () => APOC && C.cafe && !C.deliver;
  L.zonaCalma = (x, z) => x > CH.x0 - 1 && x < CH.x1 + 1 && z > CH.z0 - 1 && z < CH.z1 + 2.5;   // a catedral: lugar de paz
  L.walkable = (x, z) => {
    if (Math.hypot(x, z) < RR) return true;
    if (C.naAcademia && C.naAcademia(x, z)) return true;                                       // academia
    if (Math.abs(x) < 3.8 && z > 0 && z < IFZ - 5.5) return true;                       // avenida até o IF
    if (x > CH.x0 + .55 && x < CH.x1 - .55 && z > CH.z0 + .3 && z < CH.z1 - .3) return true;   // dentro da catedral
    if (Math.abs(x) < 1 && z >= CH.z1 - .4 && z < -19) return true;                        // porta da catedral
    if (Math.abs(x) < 11.6 && z >= IFZ - 6 && z < IFZ - .4) return true;                 // pátio do IF
    if (x <= -19 && x > POB.x0 + .4 && Math.abs(z) < 3.5) return x > -19.9 ? Math.abs(z) < 1.1 : true;   // Pobresa (porta + loja)
    return false;
  };
  L.spawn = APOC ? { x: 0, z: 17, yaw: 0 } : { x: 0, z: 34, yaw: 0, pitch: -.02 };
  const asph = E.canvasTex(64, 64, (g, w, h) => { g.fillStyle = APOC ? '#2e2824' : '#3a3a40'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 600, ['#2c2c32', '#48484e', '#333338']); }, [24, 24]);
  const road = E.add(new THREE.Mesh(new THREE.PlaneGeometry(160, 160, 40, 40), lam({ map: asph }))); road.rotation.x = -Math.PI / 2; road.position.z = 20;
  const grassT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = APOC ? '#5a5030' : '#3f6a34'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 300, APOC ? ['#4a4028', '#6a5a38'] : ['#36602e', '#4a7a3c', '#2f5a2a']); }, [10, 10]);
  const praca = E.add(new THREE.Mesh(new THREE.CircleGeometry(RP, 8), lam({ map: grassT }))); praca.rotation.x = -Math.PI / 2; praca.rotation.z = Math.PI / 8; praca.position.y = .03;
  const pave = lam({ color: APOC ? 0x6a5a4a : 0xb8b0a0 });
  for (const r of [0, Math.PI / 2]) { const p = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, RP * 2), pave)); p.rotation.set(-Math.PI / 2, 0, r); p.position.y = .07 + r * .01; }
  { const ring = E.add(new THREE.Mesh(new THREE.RingGeometry(RP - .5, RP, 8), pave)); ring.rotation.x = -Math.PI / 2; ring.rotation.z = Math.PI / 8; ring.position.y = .05; }
  const side = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, IFZ - 20, 1, 20), pave)); side.rotation.x = -Math.PI / 2; side.position.set(-3.6, .04, (IFZ + 20) / 2 - 1);
  const side2 = side.clone(); side2.position.x = 3.6; E.add(side2);

  /* céu: estrelas, lua e nuvens (ou céu vermelho e fumaça, depois da luta) */
  const ceuT = E.canvasTex(512, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, APOC ? '#2a0a08' : '#05070f'); gr.addColorStop(.5, APOC ? '#7a2a14' : '#1c2244'); gr.addColorStop(1, APOC ? '#6a3a22' : '#1c2244');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (!APOC) for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,240,${.3 + Math.random() * .6})`; g.fillRect((Math.random() * w) | 0, (Math.random() * h * .45) | 0, 1, 1); }
  });
  const ceu = new THREE.Group(); E.add(ceu);
  ceu.add(new THREE.Mesh(new THREE.SphereGeometry(120, 16, 12), new THREE.MeshBasicMaterial({ map: ceuT, side: THREE.BackSide, fog: false, depthWrite: false })));
  const lua = new THREE.Mesh(new THREE.CircleGeometry(APOC ? 9 : 5, 20), new THREE.MeshBasicMaterial({ color: APOC ? 0xff6a3a : 0xf2eedc, fog: false, depthWrite: false })); lua.position.set(-30, 52, -90); lua.lookAt(0, 0, 0); ceu.add(lua);
  const halo2 = new THREE.Mesh(new THREE.CircleGeometry(APOC ? 22 : 13, 20), new THREE.MeshBasicMaterial({ color: APOC ? 0xff4a1a : 0xc8d0ff, transparent: true, opacity: .18, fog: false, depthWrite: false })); halo2.position.copy(lua.position).multiplyScalar(1.01); halo2.lookAt(0, 0, 0); ceu.add(halo2);
  const nuvT2 = E.canvasTex(64, 32, g => { g.fillStyle = APOC ? 'rgba(40,20,16,.9)' : 'rgba(60,70,110,.85)'; for (const [x, y, r] of [[18, 20, 10], [30, 14, 13], [44, 19, 11], [52, 23, 8], [10, 24, 7]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
  const nuvs = []; for (let k = 0; k < 10; k++) { const n = new THREE.Mesh(new THREE.PlaneGeometry(36 + Math.random() * 24, 12 + Math.random() * 6), new THREE.MeshBasicMaterial({ map: nuvT2, transparent: true, fog: false, depthWrite: false })); n.userData = { a: k / 10 * Math.PI * 2, h: 38 + Math.random() * 25 }; ceu.add(n); nuvs.push(n); }
  ceu.children.forEach(m => m.renderOrder = -1);
  L.ceuTick = t => { ceu.position.set(E.camera.position.x, 0, E.camera.position.z); for (const n of nuvs) { const a = n.userData.a + t * .006; n.position.set(Math.sin(a) * 100, n.userData.h, Math.cos(a) * 100); n.lookAt(0, n.userData.h * .4, 0); } };

  /* luz */
  E.add(new THREE.HemisphereLight(APOC ? 0xff9a6a : 0x6a7ab0, APOC ? 0x2a1a14 : 0x22222e, APOC ? 1.6 : 1.8));
  const lampHeads = [];
  const poolTex = E.canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 32); r.addColorStop(0, 'rgba(255,190,120,.8)'); r.addColorStop(1, 'rgba(255,140,80,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  function poste(x, z, h = 4.2) {
    const p = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, h, 6), lam({ color: 0x3a3a40 }))); p.position.set(x, h / 2, z); E.circle(x, z, .18);
    const hd = box(.34, .3, .34, basic({ color: APOC ? 0x4a3a2a : 0xfff0c0 }), x, h + .1, z, { occ: false }); lampHeads.push(hd);
    if (!APOC) { const pool = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), basic({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))); pool.rotation.x = -Math.PI / 2; pool.position.set(x, .04, z);
      const li = E.add(new THREE.PointLight(0xffb070, 30, 12, 1.6)); li.position.set(x, h - .3, z); }
  }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; poste(Math.sin(a) * (RP - 1.2), Math.cos(a) * (RP - 1.2)); }
  for (const z of [26, 40, 54]) { poste(-3.4, z); poste(3.4, z); }

  /* ---------------- a praça: coreto, árvores, bancos ---------------- */
  const white = lam({ color: APOC ? 0x8a7a6a : 0xf0ece2 }), roofM = lam({ color: APOC ? 0x3a2a22 : 0x8a3a32 });
  { const base = E.add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, .5, 8), white)); base.position.y = .25;
    for (let k = 0; k < 8; k++) { const a = (k + .5) / 8 * Math.PI * 2; box(.14, 2.6, .14, white, Math.sin(a) * 2.1, 1.8, Math.cos(a) * 2.1, { occ: false }); }   // vão na frente: dá pra ver o show
    const roof = E.add(new THREE.Mesh(new THREE.ConeGeometry(3, 1.5, 8), roofM)); roof.position.y = 3.85;
    if (APOC) roof.rotation.z = .35;
    E.circle(0, 0, 2.7); }
  /* ---------------- o show no coreto: El Rosengo canta “O Peso de Existir” com os Acerolitos na banda ---------------- */
  const SHOW = !APOC && (Q.st || 0) < 2 && !Q.mata ? {} : null;   // depois do sequestro o Rosengo está em Matagalé
  if (SHOW) {
    const Y = .5;   // altura do piso do coreto
    const banda = [];
    const ros = E.add(E.club('rosengo', 2.3)); ros.position.set(0, Y, 1.2); banda.push(ros);
    { const sp = E.add(new THREE.SpotLight(0xfff4e0, 30, 9, .35, .5, 1.2)); sp.position.set(0, 4.6, 3.2); sp.target = ros; }   // canhão de luz no Rosengo
    const instr = (tipo, w, h) => E.canvasTex(32, 32, g => {
      g.lineWidth = 2;
      if (tipo === 'violao' || tipo === 'guitarra') {
        g.fillStyle = tipo === 'violao' ? '#c88a3a' : '#c8202c'; g.beginPath(); g.ellipse(12, 22, 8, 7, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(16, 15, 5.5, 5, 0, 0, 7); g.fill();
        g.fillStyle = '#3a2418'; g.fillRect(17, 2, 3, 15); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(13, 20, 2.4, 0, 7); g.fill();
      } else if (tipo === 'mic') { g.fillStyle = '#888'; g.fillRect(15, 10, 2, 22); g.fillStyle = '#222'; g.beginPath(); g.arc(16, 8, 4, 0, 7); g.fill(); }
    });
    const mb = (t, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide }));
    const musicos = [['violao', -1.7, .6], ['guitarra', 1.7, .6], ['violao', -1.1, -1.1], ['violao', 1.1, -1.1]];
    for (const [tipo, x, z] of musicos) {
      const a = E.add(E.club('acerolito', 1.05)); a.position.set(x, Y, z); banda.push(a);
      const i = E.add(mb(instr(tipo), .6, .6)); i.position.set(x + .12, Y + .45, z + .12); L.billboards.push(i); banda.push(i);
    }
    // o piano (com um Acerolito tocando)
    const pianista = E.add(E.club('acerolito', 1.05)); pianista.position.set(0, Y, -1.6); banda.push(pianista);
    box(1.5, .75, .55, lam({ color: 0x1a1a1e }), 0, Y + .375, -1.15, { occ: false });
    const teclas = E.canvasTex(64, 8, g => { g.fillStyle = '#f4f0e4'; g.fillRect(0, 0, 64, 8); g.fillStyle = '#111'; for (let x = 0; x < 64; x += 4) g.fillRect(x, 0, 1, 8); for (let x = 2; x < 64; x += 8) g.fillRect(x, 0, 2, 5); });
    const tk = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.4, .16), basic({ map: teclas }))); tk.rotation.x = -Math.PI / 2 + .3; tk.position.set(0, Y + .77, -.88);
    // microfone na frente do Rosengo
    const mic = E.add(mb(instr('mic'), .5, 1.3)); mic.position.set(.5, Y + .62, 1.6); L.billboards.push(mic);
    // caixas de som dos dois lados
    const cxT = E.canvasTex(32, 48, g => { g.fillStyle = '#111'; g.fillRect(0, 0, 32, 48); g.fillStyle = '#333'; g.beginPath(); g.arc(16, 32, 11, 0, 7); g.fill(); g.beginPath(); g.arc(16, 11, 6, 0, 7); g.fill(); g.fillStyle = '#555'; g.beginPath(); g.arc(16, 32, 4, 0, 7); g.fill(); });
    const caixas = [];
    for (const sx of [-1, 1]) { const c = E.add(new THREE.Mesh(new THREE.BoxGeometry(.9, 1.5, .7), [lam({ color: 0x111111 }), lam({ color: 0x111111 }), lam({ color: 0x111111 }), lam({ color: 0x111111 }), basic({ map: cxT }), lam({ color: 0x111111 })])); c.position.set(sx * 3.4, .75, 2.2); E.circle(sx * 3.4, 2.2, .6); caixas.push(c); }
    // treliça de luz com refletores coloridos
    const tr = lam({ color: 0x8a8a94 });
    for (const sx of [-1, 1]) box(.12, 5, .12, tr, sx * 3.4, 2.5, 3.1, { occ: false });
    box(7, .14, .14, tr, 0, 5, 3.1, { occ: false });
    const cores = [0xff3a6a, 0x3ab0ff, 0xffd23a, 0x9a5aff];
    const luzes = cores.map((c, k) => {
      const x = -2.4 + k * 1.6;
      const fe = new THREE.Mesh(new THREE.ConeGeometry(.9, 4.4, 14, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      fe.position.set(x, 2.8, 2.2); fe.rotation.x = -.35; E.add(fe);
      const li = E.add(new THREE.PointLight(c, 8, 7, 1.5)); li.position.set(x, 3.2, 1.6);
      return { fe, li, x };
    });
    // faixa do show
    const fx = E.canvasTex(128, 24, g => { g.fillStyle = '#1a0a1e'; g.fillRect(0, 0, 128, 24); g.strokeStyle = '#ffd23a'; g.strokeRect(1, 1, 126, 22); g.fillStyle = '#ffd23a'; g.font = 'bold 10px monospace'; g.textAlign = 'center'; g.fillText('EL ROSENGO AO VIVO', 64, 11); g.fillStyle = '#ff8fb1'; g.font = 'bold 7px monospace'; g.fillText('“O PESO DE EXISTIR”', 64, 20); });
    const faixa = E.add(new THREE.Mesh(new THREE.PlaneGeometry(4.6, .86), basic({ map: fx, side: THREE.DoubleSide }))); faixa.position.set(0, 4.45, 3.1);
    E.interact(E.hitbox(1, 1.8, 1, 0, Y + .9, 1.2), { label: () => S.dlg ? '' : '[E] El Rosengo', act: () => E.say('EL ROSENGO! (Ele aponta o microfone pra você e continua cantando.)', 3.5, 'npc') });
    Object.assign(SHOW, { banda, luzes, caixas });
    // a música: só dá pra ouvir chegando perto (some com a distância e fica abafada de longe)
    SHOW.som = () => {   // liga o som assim que o áudio do jogo existir
      const ac = E.ac(); if (!ac || SHOW.g || SHOW.parou) return;
      SHOW.g = E.gain(0); SHOW.pan = ac.createStereoPanner(); SHOW.lp = ac.createBiquadFilter(); SHOW.lp.type = 'lowpass'; SHOW.lp.frequency.value = 800;
      SHOW.an = ac.createAnalyser(); SHOW.an.fftSize = 256; SHOW.dados = new Uint8Array(SHOW.an.frequencyBinCount);
      SHOW.lp.connect(SHOW.pan).connect(SHOW.g); SHOW.lp.connect(SHOW.an);
      const toca = buf => { if (SHOW.parou) return; const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(SHOW.lp); src.start(0, Math.random() * 60); SHOW.src = src; };
      if (E._showBuf) toca(E._showBuf);
      else fetch('audio/sfx/rosengo_show.mp3').then(r => r.arrayBuffer()).then(ab => ac.decodeAudioData(ab)).then(b => { E._showBuf = b; toca(b); }).catch(() => {});
    };
    SHOW.som();
    SHOW.parar = () => { SHOW.parou = true; try { SHOW.src && SHOW.src.stop(); } catch (e) {} if (SHOW.g) SHOW.g.gain.value = 0; if (SHOW.musBase !== undefined && E.MUS) E.MUS.base = SHOW.musBase; };
    SHOW.tick = (dt, t) => {
      if (!SHOW.g) SHOW.som();
      const p = E.player.pos, d = Math.hypot(p.x, p.z - 1);
      const v = d < 5 ? 1 : Math.pow(Math.max(0, 1 - (d - 5) / 15), 1.6);
      if (SHOW.g) { const ac = E.ac(); SHOW.g.gain.setTargetAtTime(v * .55, ac.currentTime, .2); SHOW.lp.frequency.setTargetAtTime(800 + v * 15000, ac.currentTime, .2); SHOW.pan.pan.value = Math.max(-.8, Math.min(.8, E.pan(new THREE.Vector3(0, 0, 1)) * Math.min(1, d / 6))); }
      // a trilha do jogo abaixa perto do palco
      if (E.MUS) { if (SHOW.musBase === undefined) SHOW.musBase = E.MUS.base; E.MUS.base = SHOW.musBase * (1 - v * .9); }
      let nivel = .3;
      if (SHOW.an) { SHOW.an.getByteFrequencyData(SHOW.dados); let soma = 0; for (let k = 0; k < 24; k++) soma += SHOW.dados[k]; nivel = soma / (24 * 255); }
      SHOW.banda.forEach((b, i) => { const pulo = Math.abs(Math.sin(t * 4.2 + i * 1.3)) * (.03 + nivel * .12); if (b.userData.y0 === undefined) b.userData.y0 = b.position.y; b.position.y = b.userData.y0 + pulo; });
      SHOW.luzes.forEach((l, k) => { const a = Math.sin(t * (1.1 + k * .3) + k * 2) * .6; l.fe.rotation.z = a; l.fe.position.x = l.x + Math.sin(a) * 1.4; l.li.intensity = 4 + nivel * 18 + Math.sin(t * 7 + k) * 2; l.fe.material.opacity = .05 + nivel * .12; });
      SHOW.caixas.forEach(c => c.scale.set(1, 1 + nivel * .05, 1 + nivel * .1));
    };
  }
  const trunkM = lam({ color: 0x5a4030 }), leafM = lam({ color: APOC ? 0x3a3020 : 0x2f6a34 });
  const TREES = [[7, -6], [-7, -6], [7.5, 5.5], [-6.5, 7], [0, -9.5], [9.5, 0], [-9.5, -1]];
  for (const [x, z] of TREES) {
    const t = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, 2.4, 6), trunkM)); t.position.set(x, 1.2, z); E.circle(x, z, .35);
    if (!APOC || rnd() < .5) { const c = E.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2, 0), leafM)); c.position.set(x, 3.6, z); }
  }
  const benchM = lam({ color: 0x7a5a3a });
  for (const [x, z, r] of [[4, -2, 0], [-4, 2, 0], [2, 4.5, Math.PI / 2], [-2.5, -5, Math.PI / 2]]) { const b = box(1.6, .08, .45, benchM, x, .48, z, { occ: false }); b.rotation.y = r; E.circle(x, z, .5); }

  if (!APOC) { E.cartazCapinha('c1', 2.4, 25, 0); E.cartazCapinha('c2', -8.6, 4, Math.PI / 2); E.cartazCapinha('c3', 4.5, IFZ - 9.5, Math.PI); }
  /* ---------------- a banca de jornal: a cidade com medo do Passarex ---------------- */
  { const JX = 3.4, JZ = 13.2;
    const capa = E.canvasTex(48, 64, g => {
      g.fillStyle = '#efe8d4'; g.fillRect(0, 0, 48, 64); g.fillStyle = '#1a1a1a'; g.font = 'bold 6px monospace'; g.textAlign = 'center';
      g.fillText('O NAVIRAIENSE', 24, 8); g.fillRect(3, 10, 42, 1);
      g.fillStyle = '#b0201a'; g.font = 'bold 7px monospace'; (APOC ? ['EXTRA!', 'ELE CAIU', 'NA PRAÇA'] : ['PÁSSARO', 'ASSUSTA', 'NAVIRAÍ']).forEach((l, i) => g.fillText(l, 24, 19 + i * 8));
      g.fillStyle = '#333'; g.fillRect(8, 44, 32, 14); g.fillStyle = '#efe8d4'; g.fillRect(19, 47, 3, 3); g.fillRect(26, 47, 3, 3);   // a "foto": um vulto de olhos brancos
      g.fillStyle = '#555'; for (let y = 60; y < 63; y += 2) g.fillRect(4, y, 40, 1);
    });
    const kiosk = lam({ color: APOC ? 0x3a4a3a : 0x2e6a4a });
    box(1.8, 2.2, 1.2, kiosk, JX, 1.1, JZ, { solid: true }); box(2.3, .12, 1.7, lam({ color: 0xd8c040 }), JX, 2.3, JZ, { occ: false });
    const pl = E.canvasTex(64, 12, g => { g.fillStyle = '#d8c040'; g.fillRect(0, 0, 64, 12); g.fillStyle = '#1a1a1a'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('BANCA DE JORNAL', 32, 9); });
    const pm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8, .34), basic({ map: pl }))); pm.position.set(JX, 2.55, JZ + .62);
    for (const dx of [-.5, 0, .5]) { const j = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.42, .56), basic({ map: capa }))); j.position.set(JX + dx, 1.3, JZ + .61); }
    const J = '#efe8d4';
    E.interact(E.hitbox(1.9, 2.2, 1.3, JX, 1.1, JZ), { label: () => S.dlg ? '' : '[E] Ler o jornal', act: () => E.conversa(APOC ? [
      ['O NAVIRAIENSE · EXTRA', 'ELE CAIU NA PRAÇA. O pássaro de rosto humano foi derrubado a goiabadas no centro da cidade.', J],
      ['O NAVIRAIENSE · EXTRA', 'Mas ele ainda respira. A polícia pede: quem tiver o café de Naviraí, leve até a delegacia. Só ele faz o soro.', J],
      ['VOCÊ', '(Eu sei onde tem café. Na Pobresa.)'],
    ] : [
      ['O NAVIRAIENSE', 'PÁSSARO COM ROSTO DE GENTE ASSUSTA NAVIRAÍ', J],
      ['O NAVIRAIENSE', 'Já são sessenta e sete relatos em três semanas. Moradores falam de um assobio no escuro, “fiu fiu”, e de olhos brancos no alto da catedral.', J],
      ['O NAVIRAIENSE', 'Comerciantes estão fechando mais cedo. Pais não deixam as crianças saírem depois que escurece. A prefeitura pede calma.', J],
      ['O NAVIRAIENSE', 'Uma testemunha, que pediu pra não ser identificada: “Ele não fala. Só assobia. E não olhe muito tempo pra ele.”', J],
      ['VOCÊ', '(A cidade inteira está com medo. E ele está em algum lugar por aqui.)'],
    ]) });
    // um jornal largado no banco da praça
    const jb = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.42, .56), basic({ map: capa }))); jb.position.set(-4, .53, 2); jb.rotation.set(-Math.PI / 2, 0, .4);
  }

  /* ---------------- prédios em volta da praça ---------------- */
  const facadeTex = (name, wall, accent) => E.canvasTex(96, 56, (g, w, h) => {
    g.fillStyle = wall; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 140, ['rgba(0,0,0,.08)', 'rgba(255,255,255,.08)']);
    g.fillStyle = accent; g.fillRect(4, 26, w - 8, 9); g.fillStyle = '#fff'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText(name, w / 2, 33);
    g.fillStyle = '#6a6a70'; g.fillRect(14, 37, w - 28, 19); g.fillStyle = '#58585e'; for (let y = 39; y < h; y += 3) g.fillRect(14, y, w - 28, 1);
    g.fillStyle = APOC ? '#1a1010' : '#1a1c28'; for (const x of [18, 54]) g.fillRect(x, 6, 22, 14);
    if (APOC) { g.fillStyle = 'rgba(20,10,5,.55)'; for (let i = 0; i < 6; i++) g.fillRect(Math.random() * w, 0, 8 + Math.random() * 14, h); }
  });
  function predio(ang, name, wall, accent, h = 6, w = 13) {
    const grp = E.add(new THREE.Group()); grp.rotation.y = ang; grp.position.set(Math.sin(ang) * -(RR + 4.2), 0, Math.cos(ang) * -(RR + 4.2));
    const wm = lam({ color: new THREE.Color(wall).multiplyScalar(APOC ? .5 : .85) });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8), [wm, wm, wm, wm, lam({ map: facadeTex(name, wall, accent) }), wm]); m.position.y = h / 2; grp.add(m); L.occluders.push(m);
    return grp;
  }
  // diagonais: lojas
  // ACADEMIA CORPOLEO SAUDÁVEL (noroeste da praça): aberta na frente, dá pra entrar e treinar (supino e agachamento)
  const GY = { a: Math.PI / 4 }; GY.x = Math.sin(GY.a) * -(RR + 4.2); GY.z = Math.cos(GY.a) * -(RR + 4.2);
  const gW = (lx, lz) => [GY.x + lx * Math.cos(GY.a) + lz * Math.sin(GY.a), GY.z - lx * Math.sin(GY.a) + lz * Math.cos(GY.a)];
  const gL = (x, z) => { const dx = x - GY.x, dz = z - GY.z; return [dx * Math.cos(GY.a) - dz * Math.sin(GY.a), dx * Math.sin(GY.a) + dz * Math.cos(GY.a)]; };
  C.naAcademia = (x, z) => { const [lx, lz] = gL(x, z); return Math.abs(lx) < 6.1 && lz > -3.6 && lz < 4.6; };
  { const grp = E.add(new THREE.Group()); grp.position.set(GY.x, 0, GY.z); grp.rotation.y = GY.a;
    const parede = lam({ color: APOC ? 0x4a4a50 : 0x2a2a32 }), amarelo = lam({ color: 0xf2c84a });
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); grp.add(m); L.occluders.push(m); return m; };
    add(new THREE.BoxGeometry(13, 5, .3), parede, 0, 2.5, -4);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(.3, 5, 8), parede, sx * 6.5, 2.5, 0);
    add(new THREE.BoxGeometry(13.6, .3, 8.6), parede, 0, 5.1, 0);
    add(new THREE.BoxGeometry(13.6, .5, .4), amarelo, 0, 4.7, 4.1);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 7.8), lam({ color: 0x1a1a1e })); piso.rotation.x = -Math.PI / 2; piso.position.set(0, .07, 0); grp.add(piso);
    const espelho = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.4), basic({ color: APOC ? 0x2a3440 : 0x4a5a70 })); espelho.position.set(0, 1.8, -3.82); grp.add(espelho);
    const placa = E.canvasTex(256, 56, g => { g.fillStyle = '#111'; g.fillRect(0, 0, 256, 56); g.strokeStyle = '#f2c84a'; g.lineWidth = 3; g.strokeRect(2, 2, 252, 52); g.fillStyle = '#f2c84a'; g.font = 'bold 24px monospace'; g.textAlign = 'center'; g.fillText('CORPOLEO SAUDÁVEL', 128, 28); g.fillStyle = '#fff'; g.font = 'bold 12px monospace'; g.fillText('ACADEMIA · 24 HORAS', 128, 46); });
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 2.1), basic({ map: placa })); pm.position.set(0, 6.3, 4.34); grp.add(pm);
    const cartaz = (txt, sub, x, z, ry) => { const t = E.canvasTex(48, 64, g => { g.fillStyle = '#f2c84a'; g.fillRect(0, 0, 48, 64); g.fillStyle = '#111'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; txt.split('|').forEach((l, i) => g.fillText(l, 24, 18 + i * 9)); g.font = '5px monospace'; g.fillText(sub, 24, 58); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.2), basic({ map: t })); m.position.set(x, 2, z); m.rotation.y = ry; grp.add(m); return m; };
    const c1 = cartaz('NÃO PULE|O LEG|DAY', 'a gerência', 6.33, -1, -Math.PI / 2);
    const c2 = cartaz('PROSSEGUI,|MEUS|DESCENDENTES', 'Marcão da Calçaria', -6.33, -1, Math.PI / 2);
    // supino: banco e suporte
    const metal = lam({ color: 0x6a6a74 }), banco = lam({ color: 0x8a1a1a });
    const sup = new THREE.Group(); sup.position.set(-3, 0, -.6); grp.add(sup);
    { const b = new THREE.Mesh(new THREE.BoxGeometry(.45, .12, 1.4), banco); b.position.y = .45; sup.add(b); const p = new THREE.Mesh(new THREE.BoxGeometry(.2, .4, 1.2), metal); p.position.y = .2; sup.add(p);
      for (const sx of [-1, 1]) { const u = new THREE.Mesh(new THREE.BoxGeometry(.07, 1.2, .07), metal); u.position.set(sx * .6, .6, -.55); sup.add(u); } }
    // agachamento: gaiola
    const agc = new THREE.Group(); agc.position.set(3, 0, -.8); grp.add(agc);
    for (const [x, z] of [[-.8, -.6], [.8, -.6], [-.8, .6], [.8, .6]]) { const u = new THREE.Mesh(new THREE.BoxGeometry(.08, 2.4, .08), metal); u.position.set(x, 1.2, z); agc.add(u); }
    for (const z of [-.6, .6]) { const t = new THREE.Mesh(new THREE.BoxGeometry(1.7, .08, .08), metal); t.position.set(0, 2.4, z); agc.add(t); }
    // halteres
    for (let k = 0; k < 6; k++) { const h = new THREE.Mesh(new THREE.BoxGeometry(.28, .12, .12), lam({ color: 0x1a1a1e })); h.position.set(-1 + k * .4, .75, -3.5); grp.add(h); }
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.6, .7, .45), metal); rack.position.set(0, .35, -3.55); grp.add(rack);
    for (const lx of [-3.5, 3.5]) { const gl = new THREE.PointLight(0xfff2d8, APOC ? 6 : 30, 14, 1.2); gl.position.set(lx, 4.3, .5); grp.add(gl); }
    grp.updateMatrixWorld(true);
    const [sx, sz] = gW(-3, -.6), [ax, az] = gW(3, -.8);
    E.circle(sx, sz, .55); E.circle(ax, az, .55); { const [rx, rz] = gW(0, -3.5); E.circle(rx, rz, .9); }
    E.interact(E.hitbox(1, 1.4, 1, 0, .6, 0, sup), { label: () => S.exerc ? '' : '[E] Fazer supino', act: () => E.exercicio('supino', new THREE.Vector3(sx, 0, sz), GY.a) });
    E.interact(E.hitbox(1.6, 2.4, 1.2, 0, 1.2, 0, agc), { label: () => S.exerc ? '' : '[E] Fazer agachamento', act: () => E.exercicio('agachamento', new THREE.Vector3(ax, 0, az), GY.a + Math.PI) });
    E.interact(c1, { label: () => '[E] Cartaz', act: () => E.say('(“NÃO PULE O LEG DAY”. Tem gente no Clubex que foge do treino de perna até hoje.)', 4) });
    E.interact(c2, { label: () => '[E] Cartaz', act: () => E.say('(“Prossegui, meus descendentes.” — o Marcão da Calçaria abençoa quem treina.)', 4) });
  }

  predio(-Math.PI / 4, 'SORVETERIA', '#f8d8e8', '#4080c0');
  predio(Math.PI * .75, 'FARMÁCIA', '#e8eee6', '#2a8a4a', 5);
  predio(-Math.PI * .75, 'PADARIA', '#e9d6a8', '#a8402c', 5);

  // CATEDRAL (norte): dá pra entrar. Lá dentro, o sacrário. Lugar de respeito: aqui não tem susto, falha de tela nem Passarex.
  { const cw = lam({ color: 0xf6f1e4, side: THREE.DoubleSide }), wood = lam({ color: 0x6a4428 });
    // A Catedral de Naviraí de verdade: "abas" curvas em camadas, que nem uma tenda, subindo até a cruz.
    // Cada aba tem a borda creme/dourada e uma faixa branca; as de fora são mais baixas e mais largas.
    const faixa = E.canvasTex(8, 32, (g, w, h) => { g.fillStyle = '#dcc48e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, w, 13); g.fillStyle = '#c8ac72'; g.fillRect(0, 13, w, 1); });
    const abaM = lam({ map: faixa, side: THREE.DoubleSide, emissive: 0x5a4a2c });
    const frenteT = E.canvasTex(4, 32, (g, w, h) => { g.fillStyle = '#d9bd84'; g.fillRect(0, 0, w, 18); g.fillStyle = '#c4a468'; g.fillRect(0, 17, w, 1); g.fillStyle = '#f8f4ea'; g.fillRect(0, 18, w, 14); });
    const frenteM = lam({ map: frenteT, side: THREE.DoubleSide, emissive: 0x7a6a48 });
    const P1 = 1.6, Q1 = 1.2;   // formato do arco: bico no alto, abre e deita perto do chão
    const arco = (w, H, a) => [w * Math.pow(a, P1), H * Math.pow(1 - a, Q1)];
    function aba(w, H, zF, zB) {
      const N = 56, M = 6, pos = [], uv = [], idx = [], fundo = Math.abs(zF - zB);
      for (let j = 0; j <= M; j++) for (let i = 0; i <= N; i++) {
        const t = i / N * 2 - 1, [x, y] = arco(w, H, Math.abs(t));
        pos.push(Math.sign(t) * x, y, zF + (zB - zF) * j / M); uv.push(i / N, Math.min(1, j / M * fundo / 1.6));
      }
      for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + N + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      const m = E.add(new THREE.Mesh(geo, abaM)); L.occluders.push(m);
      // a frente da aba: uma faixa grossa em arco (dourado por fora, branco por dentro), como na foto
      { const N2 = 56, TH = 1.05, fp = [], fu = [], fi = [];
        for (let i = 0; i <= N2; i++) { const t = i / N2 * 2 - 1, a = Math.abs(t), sg = Math.sign(t) || 1, [xo, yo] = arco(w, H, a), [xi, yi] = arco(w - TH, H - TH * 1.5, a);
          fp.push(sg * xo, yo, zF + .02, sg * xi, yi, zF + .02); fu.push(i / N2, 0, i / N2, 1); }
        for (let i = 0; i < N2; i++) { const a = i * 2; fi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(fu, 2)); fg.setIndex(fi); fg.computeVertexNormals();
        E.add(new THREE.Mesh(fg, frenteM)); }
      // a borda da frente, grossinha e clara
      const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40 * 2 - 1, [x, y] = arco(w, H, Math.abs(t)); pts.push(new THREE.Vector3(Math.sign(t) * x, y + .05, zF)); }
      E.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .16, 5, false), lam({ color: 0xfaf6ec, emissive: 0x3a3428 })));
    }
    const W0 = 7, H0 = 15, ABAS = 4;
    for (let k = ABAS - 1; k >= 0; k--) aba(W0 + k * 1.1, H0 - k * 1.9, CH.z1 + .1 + k * .55, k ? CH.z1 + (k - 1) * .55 - .25 : CH.z0 - .4);
    // a fachada branca (o "triângulo" de dentro), com a entrada de vidro azul, e o fundo
    const forma = buraco => { const sh = new THREE.Shape(); sh.moveTo(-W0, 0); for (let i = 1; i <= 30; i++) { const [x, y] = arco(W0, H0, 1 - i / 30); sh.lineTo(-x, y); } for (let i = 29; i >= 0; i--) { const [x, y] = arco(W0, H0, 1 - i / 30); sh.lineTo(x, y); } if (buraco) { sh.lineTo(2.2, 0); sh.lineTo(2.2, 3.4); sh.lineTo(-2.2, 3.4); sh.lineTo(-2.2, 0); } sh.lineTo(-W0, 0); return sh; };
    const fach = E.add(new THREE.Mesh(new THREE.ShapeGeometry(forma(true)), lam({ color: 0xfbf8f0, emissive: 0x6e6a5e, side: THREE.DoubleSide }))); fach.position.z = CH.z1; L.occluders.push(fach);
    const fundoP = E.add(new THREE.Mesh(new THREE.ShapeGeometry(forma(false)), cw)); fundoP.position.z = CH.z0 - .3; L.occluders.push(fundoP);
    const mosaico = E.canvasTex(32, 24, (g, w, h) => { const cs = ['#1f4f9a', '#3a7ad0', '#6aa8e8', '#2a3a7a', '#e8c84a', '#9ad0f0']; for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) { g.fillStyle = cs[(x * 7 + y * 3 + ((x * y) % 5)) % cs.length]; g.fillRect(x, y, 3, 3); } g.fillStyle = '#1a1410'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 1, h); g.fillRect(0, 0, w, 1); });
    for (const sx of [-1, 1]) { const v = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.4), basic({ map: mosaico, side: THREE.DoubleSide }))); v.position.set(sx * 1.6, 1.7, CH.z1); }
    const verga = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2, .7), basic({ map: mosaico, side: THREE.DoubleSide }))); verga.position.set(0, 3.05, CH.z1);
    const sign = E.canvasTex(128, 12, g => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, 128, 12); g.fillStyle = '#6a5a3a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('CATEDRAL NOSSA SENHORA DE FÁTIMA', 64, 8); });
    const sm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6.4, .6), basic({ map: sign }))); sm.position.set(0, 4.3, CH.z1 + .03);
    // a cruz branca acesa lá no bico
    const luzB = basic({ color: 0xfffbf0 });
    box(.4, 4.4, .4, luzB, 0, H0 + 2, CH.z1 - .3, { occ: false }); box(2.4, .4, .4, luzB, 0, H0 + 2.9, CH.z1 - .3, { occ: false });
    // luzes de baixo pra cima, como de noite na foto
    for (const sx of [-1, 0, 1]) { const l = E.add(new THREE.PointLight(0xffe2a8, 6, 16, 1.4)); l.position.set(sx * 5.5, .6, CH.z1 + 4); }
    // o campanário: duas colunas brancas finas com travessas e lâmpadas, do lado esquerdo
    const TX = -10.6, TZ = CH.z1 - 1.2, colM = lam({ color: 0xf6f1e4, emissive: 0x2a2620 }), lampM = basic({ color: 0xfff0c8 });
    for (const sx of [-.8, .8]) box(.5, 17, .5, colM, TX + sx, 8.5, TZ);
    for (let y = 3.6; y <= 16.4; y += 3.2) { box(2.1, .3, .45, colM, TX, y, TZ, { occ: false }); const lm = E.add(new THREE.Mesh(new THREE.SphereGeometry(.26, 8, 6), lampM)); lm.position.set(TX, y - .5, TZ); }
    box(3, 1.4, 3, cw, TX, .7, TZ, { occ: false });   // a base do campanário
    C.cathTop = new THREE.Vector3(TX, 17, TZ);
    // canteiros com oliveira na frente, como na foto
    const folhaM = lam({ color: 0x5a7a4a }), vasoM = lam({ color: 0xd8d0c0 });
    for (const sx of [-1, 1]) { const vx = sx * 7.6, vz = CH.z1 + 2.6; const vaso = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.9, .8, .7, 10), vasoM)); vaso.position.set(vx, .35, vz); box(.14, 1, .14, wood, vx, 1.1, vz, { occ: false }); const copa = E.add(new THREE.Mesh(new THREE.SphereGeometry(.75, 7, 5), folhaM)); copa.position.set(vx, 1.9, vz); copa.scale.y = .8; }
    // por dentro
    const floorT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#c8b898'; g.fillRect(0, 0, w, h); g.fillStyle = '#a89878'; g.fillRect(0, 15, w, 1); g.fillRect(15, 0, 1, h); g.fillStyle = '#8a3a32'; g.fillRect(6, 6, 4, 4); g.fillRect(22, 22, 4, 4); }, [5, 5]);
    const fl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(14.4, CH.z1 - CH.z0), lam({ map: floorT }))); fl.rotation.x = -Math.PI / 2; fl.position.set(0, .06, CHM);
    const carpet = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, CH.z1 - CH.z0 - 3.8), lam({ color: 0x8a2a2a }))); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, .1, CHM + 1.9);
    // bancos
    for (let z = CH.z1 - 1.6; z > CH.z0 + 4.8; z -= 1.35) for (const sx of [-1, 1]) {
      box(3.6, .1, .45, wood, sx * 2.9, .48, z, { occ: false }); box(3.6, .55, .08, wood, sx * 2.9, .78, z + .24, { occ: false }); box(3.6, .48, .06, wood, sx * 2.9, .24, z - .1, { occ: false });
      E.solid(sx * 2.9 - 1.8, sx * 2.9 + 1.8, z - .26, z + .3);
    }
    // presbitério: degrau, altar, a cruz e o sacrário com a lamparina acesa
    box(CH.x1 - CH.x0, .35, 3.8, lam({ color: 0xd8ccb0 }), 0, .175, CH.z0 + 1.9); E.solid(CH.x0, CH.x1, CH.z0, CH.z0 + 3.9);
    box(2.6, 1, 1, lam({ color: 0xf4f0e4 }), 0, .85, CH.z0 + 2.9); box(2.7, .06, 1.1, lam({ color: 0xffffff }), 0, 1.38, CH.z0 + 2.9, { occ: false });
    const flameT = E.canvasTex(8, 12, g => { const gr = g.createLinearGradient(0, 12, 0, 0); gr.addColorStop(0, '#ffd23a'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(4, 7, 3, 5, 0, 0, 7); g.fill(); });
    const flames = [];
    for (const x of [-1, 1]) { box(.06, .4, .06, lam({ color: 0xf4f0e4 }), x, 1.6, CH.z0 + 2.9, { occ: false }); const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.08, .14), basic({ map: flameT, transparent: true, depthWrite: false }))); f.position.set(x, 1.86, CH.z0 + 2.95); flames.push(f); }
    box(.16, 3, .12, wood, 0, 4.9, CH.z0 + .12, { occ: false }); box(1.5, .16, .12, wood, 0, 5.6, CH.z0 + .12, { occ: false });
    const gold = lam({ color: 0xd8b040, emissive: 0x3a2a08 });
    box(.6, 1.3, .6, lam({ color: 0xe8e0cc }), 0, 1, CH.z0 + 1.1);
    box(.62, .62, .48, gold, 0, 1.96, CH.z0 + 1.1);
    const dome = E.add(new THREE.Mesh(new THREE.SphereGeometry(.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), gold)); dome.position.set(0, 2.27, CH.z0 + 1.1);
    box(.05, .26, .05, gold, 0, 2.66, CH.z0 + 1.1, { occ: false }); box(.16, .05, .05, gold, 0, 2.7, CH.z0 + 1.1, { occ: false });
    const tabDoor = E.canvasTex(16, 16, g => { g.fillStyle = '#c89a30'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#f4d880'; g.fillRect(7, 3, 2, 10); g.fillRect(4, 6, 8, 2); g.strokeStyle = '#8a6a1a'; g.strokeRect(1.5, 1.5, 13, 13); });
    const td = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.4, .4), basic({ map: tabDoor }))); td.position.set(0, 1.96, CH.z0 + 1.37);
    // a lamparina do Santíssimo (vermelha, sempre acesa)
    box(.04, 1.6, .04, gold, 1.05, 1.15, CH.z0 + 1.2, { occ: false });
    const lampG = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .07, .2, 8), basic({ color: 0xd02020, transparent: true, opacity: .85 }))); lampG.position.set(1.05, 2.05, CH.z0 + 1.2);
    const lampL = E.add(new THREE.PointLight(0xff3a20, 5, 4, 1.6)); lampL.position.set(1.05, 2.15, CH.z0 + 1.4);
    const inL = E.add(new THREE.PointLight(0xffe0b0, 22, 14, 1.4)); inL.position.set(0, 6.5, CHM);
    C.church = { flames, lampL };
    // memorial da Rosinha: a garrafinha de água rosa do Guilherme. Ela quebrou, mas a turma não esquece.
    { const mx = -4.85, mz = CH.z1 - .75;
      box(.9, .8, .55, lam({ color: 0x5a3a22 }), mx, .4, mz); box(.95, .03, .6, lam({ color: 0xf8f4ec }), mx, .815, mz, { occ: false }); E.circle(mx, mz, .5);
      const rosa = basic({ color: 0xff8fc8, transparent: true, opacity: .85 });
      const base = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .14, 10), rosa)); base.position.set(mx - .1, .9, mz);
      const topo = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .16, 10), rosa)); topo.position.set(mx + .14, .86, mz + .05); topo.rotation.z = 1.35;
      const tampa = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .05, 8), basic({ color: 0xffffff }))); tampa.position.set(mx + .26, .86, mz + .08); tampa.rotation.z = 1.35;
      for (let k = 0; k < 5; k++) { const c = E.add(new THREE.Mesh(new THREE.BoxGeometry(.03, .01, .02), rosa)); c.position.set(mx - .25 + k * .1, .83, mz + .15 - (k % 2) * .08); c.rotation.y = k; }
      for (const dx of [-.35, .35]) { box(.04, .14, .04, lam({ color: 0xf4f0e4 }), mx + dx, .9, mz + .15, { occ: false }); const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.06, .1), basic({ map: flameT, transparent: true, depthWrite: false }))); f.position.set(mx + dx, 1.02, mz + .14); f.rotation.y = Math.PI; C.church.flames.push(f); }
      const plT = E.canvasTex(64, 40, g => { g.fillStyle = '#f4ecdc'; g.fillRect(0, 0, 64, 40); g.strokeStyle = '#c8a040'; g.strokeRect(1.5, 1.5, 61, 37); g.fillStyle = '#5a2a3a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('EM MEMÓRIA DE', 32, 11); g.fillStyle = '#d8508a'; g.font = 'bold 9px monospace'; g.fillText('ROSINHA', 32, 22); g.fillStyle = '#5a2a3a'; g.font = '4px monospace'; g.fillText('garrafinha d’água do Guilherme', 32, 30); g.fillText('hidratou a turma até o fim', 32, 35); });
      const pl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.6, .38), basic({ map: plT }))); pl.position.set(mx, 1.2, mz + .3); pl.rotation.y = Math.PI;
      E.interact(E.hitbox(1, 1, .8, mx, 1, mz), { label: () => S.dlg ? '' : '[E] Memorial da Rosinha', act: () => E.conversa([
        ['MEMORIAL', 'Em memória de Rosinha.'],
        ['MEMORIAL', 'A garrafinha de água rosa do Guilherme. Acompanhou a turma em todas as aulas, em todas as provas, em todos os ensaios.'],
        ['MEMORIAL', 'Um dia ela caiu. E quebrou. A turma nunca mais foi a mesma.'],
        ['VOCÊ', '(Você fica um tempo em silêncio. Descanse em paz, Rosinha.)'],
      ]) }); }

    // fiéis sentados nos bancos. Ninguém fala nada. Todos viram a cabeça e ficam te olhando, o tempo todo.
    const fiel = k => { const c = document.createElement('canvas'); c.width = 32; c.height = 48; const g = c.getContext('2d');
      g.fillStyle = ['#1a1a22', '#2a1a1a', '#1a2224', '#22201a'][k % 4]; g.fillRect(6, 20, 20, 28);
      g.fillStyle = '#c8c0b8'; g.beginPath(); g.ellipse(16, 12, 7, 9, 0, 0, 7); g.fill();
      g.fillStyle = k % 2 ? '#3a2a22' : '#6a6a6a'; g.beginPath(); g.ellipse(16, 6, 8, 5, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#0a0808'; g.beginPath(); g.ellipse(13, 12, 1.8, 2.4, 0, 0, 7); g.ellipse(19, 12, 1.8, 2.4, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.fillRect(13, 11, 1, 1); g.fillRect(19, 11, 1, 1);
      g.fillStyle = '#5a4a44'; g.fillRect(13, 18, 6, 1);
      return E.texFrom(c); };
    C.fieis = [];
    [[-1.7, 0], [3.6, 1], [-4, 2], [2.2, 3], [-2.6, 3], [4.1, 0]].forEach(([x, row], k) => {
      const z = CH.z1 - 1.6 - row * 1.35 - .05;
      const grp = E.add(new THREE.Group()); const m = new THREE.Mesh(new THREE.PlaneGeometry(.62, .93), basic({ map: fiel(k), transparent: true, alphaTest: .5 })); m.position.y = .47 + .46; grp.add(m);
      grp.position.set(x, 0, z); L.billboards.push(grp); C.fieis.push(grp);
    });
    E.interact(E.hitbox(1.4, 1.6, 3.6, 0, 1.8, CH.z0 + 2.2), { label: () => '[E] Sacrário', act: () => E.say('(O sacrário, com a lamparina vermelha acesa ao lado. Aqui é lugar de silêncio e respeito.)', 5) });
  }

  // DELEGACIA (leste)
  const DEL = new THREE.Vector3(RR + .2, 0, 0);
  { const dw = lam({ color: APOC ? 0x6a6a72 : 0xe6eaf2 });
    box(8, 5.5, 14, dw, RR + 4.2, 2.75, 0);
    const sign = E.canvasTex(96, 20, g => { g.fillStyle = '#1a3a7a'; g.fillRect(0, 0, 96, 20); g.fillStyle = '#fff'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('POLÍCIA CIVIL', 48, 9); g.font = '6px monospace'; g.fillText('DELEGACIA DE NAVIRAÍ', 48, 17); });
    const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1), basic({ map: sign }))); s.position.set(RR + .08, 4.4, 0); s.rotation.y = -Math.PI / 2;
    const dd = box(.08, 2.3, 1.6, lam({ color: 0x2a3a5a }), RR + .12, 1.15, 0, { occ: false });
    E.interact(E.hitbox(.4, 2.3, 1.6, RR - .1, 1.15, 0), { label: () => APOC ? (C.deliver ? '' : C.cafe ? '[E] Entregar o café' : 'Delegacia') : 'Delegacia (fechada)', act: () => { if (APOC && C.cafe && !C.deliver) entregar(); else if (!APOC) E.say('(Fechada. Um papel na porta: “plantão só em caso de pássaro”.)', 3.5); else E.say('(O policial grita lá de dentro: “Cadê o café?!”)', 3); } }); }

  // Pobresa Conveniência (oeste), dá pra entrar
  const PB = { door: new THREE.Vector3(-19.8, 1.2, 0) };
  { const fw = lam({ color: APOC ? 0x4a4a4e : 0x2a2a30 }), inW = lam({ color: APOC ? 0x8a8478 : 0xf4f4f0 });
    box(.4, 4, 3, fw, -19.8, 2, -2.5); box(.4, 4, 3, fw, -19.8, 2, 2.5); box(.4, 1.6, 2.2, fw, -19.8, 3.2, 0);
    box(7.6, 4, .3, fw, -23.6, 2, -4.15); box(7.6, 4, .3, fw, -23.6, 2, 4.15); box(.3, 4, 8.6, fw, -27.15, 2, 0);
    for (const z of [-3.95, 3.95]) box(7.2, 3.6, .05, inW, -23.4, 1.8, z * .995, { occ: false });
    box(.05, 3.6, 7.8, inW, -26.92, 1.8, 0, { occ: false });
    const tile = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = APOC ? '#8a8478' : '#ece8de'; g.fillRect(0, 0, w, h); g.fillStyle = APOC ? '#6a6458' : '#d8d2c4'; g.fillRect(0, 15, w, 1); g.fillRect(15, 0, 1, h); }, [4, 4]);
    const fl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(7.4, 8), lam({ map: tile }))); fl.rotation.x = -Math.PI / 2; fl.position.set(-23.4, .05, 0);
    const ce = E.add(new THREE.Mesh(new THREE.PlaneGeometry(7.4, 8), basic({ color: APOC ? 0x3a3a3a : 0xffffff }))); ce.rotation.x = Math.PI / 2; ce.position.set(-23.4, 3.6, 0);
    box(7.4, .5, 1.2, basic({ color: 0x15151a }), -23.4, 3.3, 0, { occ: false });
    const sign = E.canvasTex(96, 24, g => { g.fillStyle = '#111'; g.fillRect(0, 0, 96, 24); g.fillStyle = '#ffd23a'; g.font = 'bold 12px monospace'; g.textAlign = 'center'; g.fillText('Pobresa', 48, 13); g.fillStyle = '#fff'; g.font = '6px monospace'; g.fillText('CONVENIÊNCIA', 48, 21); });
    const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), basic({ map: sign }))); s.position.set(-19.57, 3.4, 0); s.rotation.y = Math.PI / 2;
    // geladeiras de vidro com bebidas
    const fridgeT = E.canvasTex(32, 64, (g, w, h) => {
      g.fillStyle = APOC ? '#2a2a2a' : '#dfe8ee'; g.fillRect(0, 0, w, h);
      for (let y = 6; y < 60; y += 11) { g.fillStyle = '#9aa4aa'; g.fillRect(1, y + 9, w - 2, 1); for (let x = 2; x < 30; x += 4) { g.fillStyle = ['#c8302c', '#2a6ac8', '#f2c84a', '#2a8a3a', '#e86a1a', '#1a1a1a'][(x + y) % 6]; if (!APOC || Math.random() < .3) g.fillRect(x, y + 1, 3, 8); } }
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(4, 0, 2, h); g.strokeStyle = '#8a9aa4'; g.strokeRect(.5, .5, w - 1, h - 1);
    });
    const fm = basic({ map: fridgeT });
    C.fridges = [];
    for (let k = 0; k < 4; k++) { const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.4), fm)); f.position.set(-26.8, 1.25, -2.6 + k * 1.75); f.rotation.y = Math.PI / 2; C.fridges.push(f); }
    for (let k = 0; k < 3; k++) { const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.4), fm)); f.position.set(-25.6 + k * 1.7, 1.25, -3.9); C.fridges.push(f); }
    box(1.8, .9, .9, lam({ color: 0xe8e8f0 }), -23.4, .45, 2.6, { solid: true });   // freezer de sorvete
    box(.6, 1, 2.2, lam({ color: APOC ? 0x3a3a3a : 0x3a3a44 }), -21.2, .5, 2.4, { solid: true });   // caixa
    E.solid(-27, -26.5, -3.5, 3.5); E.solid(-26.4, -21, -4, -3.4);
    if (!APOC) { const pl = E.add(new THREE.PointLight(0xffffff, 12, 9, 1.4)); pl.position.set(-23.4, 3.2, 0); } }

  // IFMS Campus Naviraí (sul)
  { const iw = lam({ color: APOC ? 0x5a6a3a : 0x8cc63e }), ig = lam({ color: APOC ? 0x3a4a2a : 0x6aa82e });
    box(32, 7.4, 10, iw, 0, 3.7, IFZ + 5); box(32.4, .4, 10.4, ig, 0, 7.4, IFZ + 5, { occ: false });
    // o bloco de vidro escuro do meio
    const glassT = E.canvasTex(64, 32, (g, w, h) => { g.fillStyle = APOC ? '#1a1a1a' : '#3a3e46'; g.fillRect(0, 0, w, h); g.fillStyle = APOC ? '#2a2a2a' : '#4a505a'; for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1); });
    const gl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(10, 5.6), lam({ map: glassT }))); gl.position.set(1, 3.4, IFZ - .1); gl.rotation.y = Math.PI;
    box(2.4, 2.6, .1, lam({ color: 0x2a2e34 }), 1, 1.3, IFZ - .18, { occ: false });
    // as letras ♥IFMSNV no gramado
    const letras = E.canvasTex(160, 40, g => {
      g.clearRect(0, 0, 160, 40);
      g.fillStyle = '#e02a2a'; g.beginPath(); g.moveTo(14, 32); g.bezierCurveTo(-4, 18, 4, 4, 14, 13); g.bezierCurveTo(24, 4, 32, 18, 14, 32); g.fill();
      g.font = 'bold 30px sans-serif'; g.fillStyle = APOC ? '#8a8a80' : '#ffffff'; g.fillText('IFMS', 30, 32); g.fillStyle = APOC ? '#4a6a2a' : '#4caf2a'; g.fillText('NV', 110, 32);
    });
    const lt = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), basic({ map: letras, transparent: true, alphaTest: .4, side: THREE.DoubleSide }))); lt.position.set(-11.2, .95, IFZ - 7.8); lt.rotation.y = Math.PI;   // de frente pra quem chega pela avenida (antes aparecia espelhado)
    if (APOC) lt.rotation.z = .2;
    const ifTag = E.canvasTex(96, 14, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 96, 14); g.fillStyle = '#2e6a2a'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText('IFMS · CAMPUS NAVIRAÍ', 48, 10); });
    const tg = E.add(new THREE.Mesh(new THREE.PlaneGeometry(5, .75), basic({ map: ifTag }))); tg.position.set(1, 6.6, IFZ - .14); tg.rotation.y = Math.PI;
    // grade e portão aberto
    for (const sx of [-1, 1]) for (let x = 4.2; x < 12; x += .4) box(.05, 1.8, .05, lam({ color: 0x2e8a3a }), sx * x, .9, IFZ - 6.2, { occ: false });
    const gM = lam({ color: APOC ? 0x2a2a2a : 0x2e8a4a });
    for (const sx of [-1, 1]) { const gt = box(3.6, 1.8, .06, gM, sx * 5.8, .9, IFZ - 7.4, { occ: false }); gt.rotation.y = sx * 1.2; }
    // janelas dos dois lados do bloco de vidro
    const jan = E.canvasTex(64, 32, (g, w, h) => { g.fillStyle = APOC ? '#5a6a3a' : '#8cc63e'; g.fillRect(0, 0, w, h); g.fillStyle = APOC ? '#151510' : '#2e3a44'; for (let x = 2; x < w; x += 8) { g.fillRect(x, 4, 6, 9); g.fillRect(x, 19, 6, 9); } g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 2; x < w; x += 8) { g.fillRect(x, 4, 6, 1); g.fillRect(x, 19, 6, 1); } }, [2, 1]);
    for (const [x, w] of [[-10.5, 11], [11.5, 9]]) { const j = E.add(new THREE.Mesh(new THREE.PlaneGeometry(w, 6.4), lam({ map: jan }))); j.position.set(x, 3.6, IFZ - .06); j.rotation.y = Math.PI; }
    // alas laterais (um andar) fechando o pátio
    for (const sx of [-1, 1]) { box(4, 4, 12, iw, sx * 13.8, 2, IFZ - 4); box(4.3, .3, 12.3, ig, sx * 13.8, 4.1, IFZ - 4, { occ: false });
      const jl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(11, 3.2), lam({ map: jan }))); jl.position.set(sx * 11.76, 2, IFZ - 4); jl.rotation.y = -sx * Math.PI / 2; }
    // marquise da entrada, com colunas
    box(7, .25, 3.2, ig, 1, 3.1, IFZ - 1.6, { occ: false });
    for (const x of [-2.2, 4.2]) { box(.25, 3, .25, lam({ color: 0xe8e8e0 }), x, 1.5, IFZ - 3); E.circle(x, IFZ - 3, .2); }
    box(4, .14, 1.2, lam({ color: 0xb8b8b0 }), 1, .07, IFZ - .7, { occ: false });
    // mastros com as bandeiras (Brasil, Mato Grosso do Sul, IFMS)
    const flagT = k => E.canvasTex(30, 20, g => {
      if (k === 0) { g.fillStyle = '#2a9a3a'; g.fillRect(0, 0, 30, 20); g.fillStyle = '#f2d23a'; g.beginPath(); g.moveTo(15, 2); g.lineTo(28, 10); g.lineTo(15, 18); g.lineTo(2, 10); g.fill(); g.fillStyle = '#2a4ab0'; g.beginPath(); g.arc(15, 10, 4.5, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(11, 9, 8, 1); }
      else if (k === 1) { g.fillStyle = '#2a9a3a'; g.fillRect(0, 0, 30, 20); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(30, 0); g.lineTo(0, 20); g.fill(); g.fillStyle = '#2a4ab0'; g.beginPath(); g.moveTo(0, 0); g.lineTo(20, 0); g.lineTo(0, 13); g.fill(); g.fillStyle = '#f2d23a'; g.beginPath(); g.arc(6, 5, 2, 0, 7); g.fill(); }
      else { g.fillStyle = '#fff'; g.fillRect(0, 0, 30, 20); g.fillStyle = '#c8202c'; g.beginPath(); g.arc(7, 6, 2.5, 0, 7); g.fill(); g.fillStyle = '#2e8a4a'; for (const [x, y] of [[11, 3], [5, 10], [11, 10], [17, 10], [5, 15], [11, 15]]) g.fillRect(x, y, 4, 4); }
    });
    C.flags = [];
    [-10.4, -9.2, -8].forEach((x, k) => {
      const pole = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 6, 6), lam({ color: 0xd8d8d8 }))); pole.position.set(x, 3, IFZ - 5.3); E.circle(x, IFZ - 5.3, .12);
      const fg = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, .8, 6, 1), lam({ map: flagT(k), side: THREE.DoubleSide }))); fg.position.set(x + .62, 5.5, IFZ - 5.3); C.flags.push(fg);
    });
    // bicicletário com bicicletas
    box(2.6, .06, .06, lam({ color: 0x8a8a90 }), 10, .5, IFZ - 5.2, { occ: false }); E.solid(8.6, 11.4, IFZ - 5.5, IFZ - 4.9);
    for (const [x, c] of [[9.1, 0xc82a2a], [10.1, 0x2a5ac8], [11, 0x2a2a2a]]) { const bm = lam({ color: c });
      for (const dz of [-.42, .42]) { const wh = E.add(new THREE.Mesh(new THREE.TorusGeometry(.3, .03, 4, 12), lam({ color: 0x1a1a1a }))); wh.position.set(x, .32, IFZ - 5.2 + dz); wh.rotation.y = Math.PI / 2; }
      box(.04, .04, .85, bm, x, .55, IFZ - 5.2, { occ: false }); box(.04, .4, .04, bm, x, .55, IFZ - 5.35, { occ: false }); }
    // portaria, do lado de fora do portão
    box(1.8, 2.4, 1.8, lam({ color: APOC ? 0x6a6a62 : 0xe8e8e0 }), 6, 1.2, IFZ - 8.2); box(2.1, .2, 2.1, ig, 6, 2.5, IFZ - 8.2, { occ: false });
    const port = E.canvasTex(48, 10, g => { g.fillStyle = '#2e6a2a'; g.fillRect(0, 0, 48, 10); g.fillStyle = '#fff'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText('PORTARIA', 24, 8); });
    const pm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, .34), basic({ map: port }))); pm.position.set(6, 2.1, IFZ - 9.16); pm.rotation.y = Math.PI;
    // faixa na grade e bancos no pátio
    const faixa = E.canvasTex(96, 12, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 96, 12); g.fillStyle = '#2e6a2a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('EDUCAÇÃO PÚBLICA, GRATUITA E DE QUALIDADE', 48, 8); });
    const fx = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6.4, .8), basic({ map: faixa, side: THREE.DoubleSide }))); fx.position.set(8, 1.3, IFZ - 6.28);
    for (const x of [-4.5, 5.6]) { box(1.6, .08, .45, lam({ color: 0x6a5a4a }), x, .45, IFZ - 1.1, { occ: false }); E.solid(x - .8, x + .8, IFZ - 1.35, IFZ - .85); }
    for (const x of [-11, 11]) { const t = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 2, 5), lam({ color: 0x6a4a2a }))); t.position.set(x, 1, IFZ - 1.2); const c = E.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), lam({ color: APOC ? 0x3a3020 : 0x3a7a34 }))); c.position.set(x, 2.6, IFZ - 1.2); E.circle(x, IFZ - 1.2, .25); }
    // canteiros
    for (const sx of [-1, 1]) { const c = box(5, .3, 3, lam({ color: APOC ? 0x4a3a2a : 0x3a6a34 }), sx * 8, .15, IFZ - 2.2, { occ: false }); E.solid(sx * 8 - 2.5, sx * 8 + 2.5, IFZ - 3.7, IFZ - .7); } }

  /* ---------------- o Passarex escondido nos três lugares ---------------- */
  const HIDE = {
    praca: { pos: new THREE.Vector3(7.5, 2.15, 5.5), nome: 'na praça' },
    pobresa: { pos: new THREE.Vector3(-26.75, 1.05, .9), nome: 'na Pobresa' },
    if: { pos: new THREE.Vector3(9.6, .35, IFZ - 2.2), nome: 'no IF' },
  };
  const hiders = {};
  if (Q.st === 0) for (const id of Object.keys(HIDE)) {
    if (Q.found[id]) continue;
    const h = HIDE[id], sp = E.add(E.sticker(id === 'pobresa' ? .55 : .8, { outline: true, s: .1 }));
    sp.position.copy(h.pos); hiders[id] = sp;
    E.interact(E.hitbox(.7, .9, .7, h.pos.x, h.pos.y + .4, h.pos.z), { label: () => hiders[id] && hiders[id].visible ? '[E] Que isso?' : '', act: () => achou(id) });
  }
  function achou(id) {
    if (!hiders[id] || !hiders[id].visible) return;
    hiders[id].visible = false; Q.found[id] = true;
    E.whistle(.08, { pan: E.pan(HIDE[id].pos) }); L.glitchT = .4; E.noiseHit(.3, .15, 2500, null, 'highpass');
    const n = Object.keys(Q.found).length;
    E.toast(`Passarex ${HIDE[id].nome}<small>${n}/3 achados</small>`); E.save();
    if (n >= 3) E.later(2.5, acordou);
  }
  function acordou() {
    Q.st = 1; E.save();
    pousaGigante();
    E.later(.5, () => { E.scream(.25); L.glitchT = .8; });
    E.later(2.5, () => E.say('(Ele pousou na catedral. Gigante. E tá olhando pra mim.)', 4));
    E.later(7, () => E.toast('A floresta de cogumelos<small>o Mago e o Macaco têm um plano · trilha no leste da praça</small>'));
  }
  function pousaGigante() {
    if (C.pxBig) return;
    C.pxBig = E.add(E.sticker(9, { eyes: true, s: .2, fog: false })); C.pxBig.position.copy(C.cathTop).setY(C.cathTop.y - 1.5);
    const luz = E.add(new THREE.PointLight(0xffe2b0, 60, 22, 1.4)); luz.position.copy(C.cathTop).add(new THREE.Vector3(0, 3, 6)); C.pxLuz = luz;   // um holofote nele: dá pra ver lá de baixo
  }
  if (Q.st >= 1 && Q.st < 3) pousaGigante();

  /* ---------------- a trilha da floresta de cogumelos (onde moram o Mago e o Macaco) ---------------- */
  const TRILHA = new THREE.Vector3(16.4, 0, -6.9);
  { const capM = lam({ color: 0xc8302c }), stM = lam({ color: 0xece2c8 });
    for (const dz of [-1.4, 1.4]) { const st = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, 2.6, 7), stM)); st.position.set(TRILHA.x + .8, 1.3, TRILHA.z + dz); E.circle(TRILHA.x + .8, TRILHA.z + dz, .3);
      const cap = E.add(new THREE.Mesh(new THREE.SphereGeometry(.9, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), capM)); cap.position.set(TRILHA.x + .8, 2.5, TRILHA.z + dz); cap.scale.y = .6; }
    const sg = E.canvasTex(64, 16, g => { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#ffe9a8'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('TRILHA DA FLORESTA →', 32, 10); });
    if (APOC) { const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.2, .55), basic({ map: sg, side: THREE.DoubleSide }))); s.position.set(TRILHA.x + .8, 3.2, TRILHA.z); s.rotation.y = -Math.PI / 2; }
    if (!APOC) E.portal(TRILHA.x + .8, TRILHA.z, -Math.PI / 2, 'FLORESTA →', '#7affd8'); }
  E.trigger(p => Math.hypot(p.x - TRILHA.x - .8, p.z - TRILHA.z) < 1.1, () => { if (APOC || Q.st >= 1 || !C.said.trilha) { C.said.trilha = true; E.goTo('floresta'); } });   // depois da luta não tem portal: só quem lembrar da trilha acha o segredo
  if (APOC) { const luz = E.add(new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), basic({ color: 0xc8a0ff, fog: false }))); luz.position.copy(TRILHA).setY(1.3); const lz = E.add(new THREE.PointLight(0xb080ff, 1.6, 3, 1.5)); lz.position.copy(luz.position); C.luzTrilha = luz; }
  if (S.prevId === 'floresta') { L.spawn = { x: TRILHA.x - 2, z: TRILHA.z, yaw: Math.PI / 2 }; }

  /* ---------------- o fliperama da Pobresa: PEGA A RATABRUMGA! ---------------- */
  { const cab = box(.9, 1.9, .75, lam({ color: 0x2a1a4a }), -25.6, .95, 3.35);
    const scr = E.canvasTex(32, 24, g => { g.fillStyle = '#10141e'; g.fillRect(0, 0, 32, 24); g.fillStyle = '#ffd23a'; g.font = 'bold 5px monospace'; g.textAlign = 'center'; g.fillText('PEGA A', 16, 8); g.fillText('RATABRUMGA!', 16, 15); g.fillStyle = '#ff8fb1'; g.fillText('INSERT 67', 16, 22); });
    const sm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.62, .46), basic({ map: scr }))); sm.position.set(-25.6, 1.35, 2.96); sm.rotation.y = Math.PI;
    const mq = E.canvasTex(48, 10, g => { g.fillStyle = '#c8202c'; g.fillRect(0, 0, 48, 10); g.fillStyle = '#fff'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('CLUBEX ARCADE', 24, 7); });
    const mqm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.86, .2), basic({ map: mq }))); mqm.position.set(-25.6, 1.8, 2.96); mqm.rotation.y = Math.PI;
    E.solid(-26.05, -25.15, 2.95, 3.75);
    E.interact(E.hitbox(.9, 1.2, .3, -25.6, 1.3, 2.9), { label: () => '[E] Jogar fliperama', act: () => import('../arcade.js').then(m => m.jogarArcade(E)) }); }

  /* ---------------- o padre, na catedral (com todo respeito) ---------------- */
  { const c = document.createElement('canvas'); c.width = 48; c.height = 96; const g = c.getContext('2d');
    g.fillStyle = '#16141a'; g.beginPath(); g.moveTo(14, 26); g.lineTo(34, 26); g.lineTo(38, 94); g.lineTo(10, 94); g.fill();
    g.fillStyle = '#2a7a3a'; g.fillRect(18, 28, 4, 50); g.fillRect(26, 28, 4, 50);
    g.fillStyle = '#ffffff'; g.fillRect(21, 24, 6, 3);
    g.fillStyle = '#d8a888'; g.beginPath(); g.arc(24, 15, 9, 0, 7); g.fill();
    g.fillStyle = '#8a8a8a'; g.beginPath(); g.arc(24, 10, 8, Math.PI, 0); g.fill();
    g.fillStyle = '#1a1a1a'; g.fillRect(20, 15, 2, 2); g.fillRect(27, 15, 2, 2); g.fillRect(22, 20, 5, 1);
    g.fillStyle = '#d8a888'; g.fillRect(10, 50, 5, 6); g.fillRect(33, 50, 5, 6);
    const padre = E.add(new THREE.Group()); const m = new THREE.Mesh(new THREE.PlaneGeometry(.85, 1.72), basic({ map: E.texFrom(c), transparent: true, alphaTest: .5 })); m.position.y = .86; padre.add(m); L.billboards.push(padre);
    padre.position.set(-2.3, 0, CH.z0 + 4.4); E.circle(-2.3, CH.z0 + 4.4, .3);
    const P = '#e8e0c0';
    E.interact(E.hitbox(.9, 1.8, .9, -2.3, .9, CH.z0 + 4.4), { label: () => S.dlg ? '' : '[E] Falar com o padre', act: async () => {
      if (S.dlg || C.padre) return; C.padre = true;
      try {
        await E.conversa([['PADRE', 'Boa noite. Seja bem-vindo à casa de Deus.', P]].concat(APOC ? [['PADRE', 'Depois do que aconteceu na praça, muita gente veio pra cá rezar. Fique à vontade.', P]] : [['PADRE', 'Desde que saiu no jornal, o povo anda com medo de sair de casa. Falam de um pássaro com rosto de gente, que assobia no escuro.', P], ['PADRE', 'Esses bancos lotaram. Todo mundo veio pedir proteção.', P]]).concat([['PADRE', 'Mas aqui dentro tem paz. Posso ajudar?', P]]));
        const i = await E.choice('O que você quer?', ['Quero comungar', 'Quero me confessar', 'Só vim rezar um pouco'], 2, 14);
        if (i === 0) {
          await E.conversa([['PADRE', 'Antes, preciso te perguntar umas coisas, com carinho.', P], ['PADRE', 'Você é católico?', P]]);
          const cat = await E.choice('Você é católico?', ['Sou católico', 'Não sou'], 1, 12);
          if (cat === 1) { await E.conversa([['PADRE', 'Tudo bem. Quem não é católico não comunga, mas pode receber uma bênção. Venha.', P]]); return bencao(); }
          await E.conversa([['PADRE', 'Você se confessou recentemente? Está em paz com Deus, sem nenhum pecado grave?', P]]);
          const conf = await E.choice('Você se confessou?', ['Sim, estou em paz', 'Não, faz tempo'], 1, 12);
          if (conf === 1) { await E.conversa([['PADRE', 'Então primeiro procure a confissão, com calma. É lá que a gente volta a ficar em paz.', P], ['PADRE', 'Hoje, receba uma bênção.', P]]); return bencao(); }
          await E.conversa([['PADRE', 'E guardou o jejum de uma hora antes?', P]]);
          const jej = await E.choice('Guardou o jejum?', ['Guardei', 'Comi agora há pouco'], 1, 12);
          if (jej === 1) { await E.conversa([['PADRE', 'Então hoje não. Fica pra próxima missa. Receba uma bênção.', P]]); return bencao(); }
          E.sfx.chime();
          await E.conversa([['PADRE', 'O Corpo de Cristo.', P], ['VOCÊ', 'Amém.']]);
          L.calmT = 4;
          await E.conversa([['VOCÊ', '(Você volta pro banco e fica um tempo em silêncio.)']]);
        } else if (i === 1) {
          await E.conversa([['PADRE', 'A confissão é um sacramento de verdade, feito pessoalmente, com um padre de verdade. Um jogo não substitui isso.', P], ['PADRE', 'Procure a sua paróquia. O padre vai te receber de braços abertos. Que Deus te abençoe.', P]]);
        } else {
          await E.conversa([['PADRE', 'Fique à vontade. Aqui dentro o tempo passa diferente.', P], ['VOCÊ', '(Você reza em silêncio. A lamparina vermelha continua acesa ao lado do sacrário.)']]);
        }
      } finally { C.padre = false; }
    } });
    async function bencao() { E.sfx.chime(); L.calmT = 3; await E.conversa([['PADRE', 'Que Deus te abençoe e te guarde. Em nome do Pai, do Filho e do Espírito Santo.', P], ['VOCÊ', 'Amém.']]); }
  }

  // as geladeiras: refri pro Pássaro Cocô
  if (!APOC) for (const f of C.fridges) E.interact(f, { label: () => Q.pediuRefri && !Q.refri && !Q.azedas ? '[E] Pegar um refri gelado' : 'Geladeira', act: () => {
    if (Q.pediuRefri && !Q.refri && !Q.azedas) { Q.refri = true; E.save(); E.sfx.pick(); E.noiseHit(.3, .1, 3000, null, 'highpass'); E.toast('Refri gelado<small>leve pro Pássaro Cocô, na floresta</small>'); }
    else E.say(APOC ? '(Tudo quebrado.)' : '(Geladinha. Mas agora não.)', 2);
  } });

  /* ---------------- a rádio ---------------- */
  const RADIO = new THREE.Vector3(-21, 1.06, 2.4);
  { const r = box(.5, .28, .2, lam({ color: 0x6a4a2a }), RADIO.x, RADIO.y + .14, RADIO.z, { occ: false });
    box(.04, .4, .04, lam({ color: 0xc0c0c0 }), RADIO.x + .2, RADIO.y + .45, RADIO.z, { occ: false });
    E.interact(E.hitbox(.6, .5, .4, RADIO.x, RADIO.y + .2, RADIO.z), { label: () => '[E] Rádio Clubex FM', act: () => E.radio() }); }
  let radioList = null, radioSrc = null, radioI = 0;
  fetch('audio/radio/lista.json').then(r => r.ok ? r.json() : []).then(l => { radioList = Array.isArray(l) ? l : []; }).catch(() => { radioList = []; });
  async function radio() {
    const ac = E.ac(); if (!ac) return;
    if (C.radioOn) { C.radioOn = false; try { radioSrc && radioSrc.stop(); } catch (e) {} radioSrc = null; E.sfx.click(); if (E.MUS.g) E.setMusic('trilha', .22); return; }
    C.radioOn = true; E.sfx.click(); E.noiseHit(.6, .15, 2000, null, 'bandpass');
    if (!radioList || !radioList.length) {
      E.say('RÁDIO CLUBEX FM: “...as músicas do Suno chegam na próxima atualização. Fique ligado.”', 5, 'npc');
      [523, 659, 784, 1046].forEach((f, k) => E.tone(f, .3, .05, 'triangle', null, .8 + k * .18));
      E.later(5, () => { C.radioOn = false; });
      return;
    }
    E.setMusic(null);
    const tocar = async () => {
      if (!C.radioOn) return;
      const it = radioList[radioI++ % radioList.length];
      E.toast(`Rádio Clubex FM<small>${it.titulo || it.arquivo}${it.autor ? ' · ' + it.autor : ''}</small>`);
      try { const ab = await (await fetch('audio/radio/' + it.arquivo)).arrayBuffer(); const buf = await ac.decodeAudioData(ab);
        if (!C.radioOn) return;
        const s = ac.createBufferSource(); s.buffer = buf; const gg = E.gain(.5); s.connect(gg); s.start(); radioSrc = s; s.onended = () => { if (radioSrc === s) tocar(); };
      } catch (e) { C.radioOn = false; }
    };
    tocar();
  }

  /* ---------------- depois da luta: fogo, destroços, o café, a polícia ---------------- */
  let fires = [], koPx = null, cafe = null, cafeTex = null, police = null;
  if (APOC) {
    const fireT = E.canvasTex(16, 24, g => { const gr = g.createLinearGradient(0, 24, 0, 0); gr.addColorStop(0, '#ffd23a'); gr.addColorStop(.5, '#ff6a1a'); gr.addColorStop(1, 'rgba(120,20,10,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(8, 0); g.quadraticCurveTo(16, 14, 12, 24); g.lineTo(4, 24); g.quadraticCurveTo(0, 14, 8, 0); g.fill(); });
    for (const [x, z] of [[-10, 14], [12, -10], [-14, -9], [15, 12], [-5, -15], [6, 15], [-16, 4], [2, 30], [-2, 46]]) {
      const f = E.add(new THREE.Group()); f.position.set(x, 0, z); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), basic({ map: fireT, transparent: true, depthWrite: false, fog: false })); m.position.y = 1; f.add(m); L.billboards.push(f);
      const li = E.add(new THREE.PointLight(0xff7a2a, 18, 9, 1.6)); li.position.set(x, 1.5, z); fires.push({ f, li, ph: rnd() * 6 });
    }
    // destroços e carros virados
    for (let k = 0; k < 16; k++) { const a = rnd() * 6.28, r = 6 + rnd() * 12, x = Math.sin(a) * r, z = Math.cos(a) * r; const b = box(.4 + rnd(), .3 + rnd() * .5, .4 + rnd(), lam({ color: 0x4a3a2e }), x, .25, z, { occ: false }); b.rotation.set(rnd(), rnd() * 3, rnd()); }
    for (const [x, z, r] of [[-15, -6, .4], [14, 7, -.7], [1.5, 24, 1.3]]) { const car = box(3.6, 1.2, 1.7, lam({ color: 0x3a3a44 }), x, .8, z); car.rotation.set(0, r, Math.PI * .9); E.solid(x - 1.6, x + 1.6, z - 1.2, z + 1.2); }
    // ele, nocauteado no meio da praça
    { const c = document.createElement('canvas'); c.width = 180; c.height = 120; const g = c.getContext('2d');
      g.translate(90, 112); g.rotate(-Math.PI / 2 + .1); g.scale(.14, .14); window.drawPassarex(g, 1.6, {});
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1a1a1a'; g.font = 'bold 14px monospace'; g.fillText('x  x', 40, 60);
      koPx = E.add(new THREE.Mesh(new THREE.PlaneGeometry(9, 6), basic({ map: E.texFrom(c), transparent: true, alphaTest: .5, side: THREE.DoubleSide })));
      koPx.rotation.x = -Math.PI / 2; koPx.rotation.z = .5; koPx.position.set(-6, .45, 6.5); }
    // o café de Naviraí (o pacote girando), no balcão da Pobresa
    { const img = new Image(); img.src = 'img/cafe.png';
      const c = document.createElement('canvas'); c.width = 96; c.height = 109; cafeTex = E.texFrom(c); cafeTex.userData.img = img;
      cafe = E.add(new THREE.Group()); const m = new THREE.Mesh(new THREE.PlaneGeometry(.42, .48), basic({ map: cafeTex, transparent: true, alphaTest: .4, fog: false })); m.position.y = .24; cafe.add(m); L.billboards.push(cafe);
      cafe.position.set(-21.2, 1.02, 2.0);
      const glow = E.add(new THREE.PointLight(0xffe0a0, 6, 3, 1.5)); glow.position.set(-21.2, 1.6, 2.0); C.cafeGlow = glow;
      E.interact(E.hitbox(.6, .7, .6, -21.2, 1.25, 2.0), { label: () => C.cafe ? '' : '[E] Pegar o café de Naviraí', act: () => { if (C.cafe) return; C.cafe = true; cafe.visible = false; glow.intensity = 0; E.sfx.chime(); E.toast('Café de Naviraí<small>leve pra delegacia, do outro lado da praça!</small>'); } }); }
    // o policial na porta da delegacia
    { const c = document.createElement('canvas'); c.width = 48; c.height = 96; const g = c.getContext('2d');
      g.fillStyle = '#1a2a4a'; g.fillRect(14, 50, 8, 44); g.fillRect(26, 50, 8, 44); g.fillStyle = '#2a3a6a'; g.fillRect(10, 24, 28, 30); g.fillStyle = '#f2c84a'; g.fillRect(28, 30, 5, 5);
      g.fillStyle = '#c89a78'; g.beginPath(); g.arc(24, 16, 9, 0, 7); g.fill(); g.fillStyle = '#1a2a4a'; g.fillRect(13, 4, 22, 6); g.fillRect(10, 9, 28, 2);
      g.fillStyle = '#1a1a1a'; g.fillRect(20, 15, 2, 2); g.fillRect(27, 15, 2, 2);
      police = E.add(new THREE.Group()); const m = new THREE.Mesh(new THREE.PlaneGeometry(.85, 1.75), basic({ map: E.texFrom(c), transparent: true, alphaTest: .5 })); m.position.y = .87; police.add(m); L.billboards.push(police);
      police.position.set(RR - .6, 0, 1.4); E.circle(RR - .6, 1.4, .3); }
  }
  function entregar() {
    E.conquista('soro');
    C.deliver = true;
    const d = E.voice('po_cafe', 'POLICIAL: É o café de Naviraí? Rápido, me dá isso!', 'npc', { pan: E.pan(DEL) });
    for (let k = 0; k < 5; k++) E.later(d + .3 + k * .4, () => E.tone(300 + k * 120, .2, .04, 'sine'));
    E.later(d + 2.6, () => { police.position.set(0, 0, -3.2); E.noiseHit(.3, .2, 1500); L.glitchT = .3; });
    E.later(d + 3.2, () => { const d2 = E.voice('po_soro', 'POLICIAL: O soro tá pronto. Ele vai dormir por um bom tempo.', 'npc'); C.soro = true;
      E.later(d2 + 1, () => E.note(`<small>ARQUIVO PASSAREX · OCORRÊNCIA DE NAVIRAÍ</small><h2>Soro aplicado</h2>
        <p>Com o café de Naviraí, a polícia fez o soro e aplicou no pássaro nocauteado no meio da praça. Ele dormiu. A cidade ainda está de pé.</p>
        <p>O Mago e o Macaco guardaram as máquinas de goiaba. O Pássaro das Esferas não concedeu mais nada: ninguém pediu.</p>
        <p class="hand">agora sim. vai pra casa.</p>`));
      E.later(d2 + 1.5, () => E.trigger(() => !S.noteOpen, () => irPraCasa())); });
  }
  function irPraCasa() {
    const pistas = ['recorte', 'diario', 'colorir'].filter(k => S.clues[k]).length;
    S.flags.final = pistas === 3 && S.penas >= 3 && S.noticed <= 1 ? 'C' : S.noticed >= 3 ? 'B' : 'A';
    E.glitchText('VOLTANDO PRA CASA', .7);
    E.later(.8, () => E.goTo('casa'));
  }

  /* ---------------- pra andar mais rápido: patinete elétrico e o Cachorro Orelha ---------------- */
  // o desenho de baixo da tela fica ATRÁS das legendas e bem mais baixo
  const hudC = document.createElement('canvas'); hudC.width = 320; hudC.height = 120;
  hudC.style.cssText = 'position:absolute;left:50%;bottom:0;width:66%;transform:translateX(-50%);image-rendering:pixelated;pointer-events:none;display:none';
  document.getElementById('wrap').insertBefore(hudC, document.getElementById('hud'));   // logo abaixo do HUD: pausa, menus e diálogos ficam por cima
  const hg = hudC.getContext('2d');
  const MARCHAS = [3.4, 6, 9.5];
  function drawHud(kind, bob = 0) {
    hg.clearRect(0, 0, 320, 120);
    if (kind === 'patinete') {
      hg.fillStyle = '#2a2a30'; hg.fillRect(152, 50, 16, 70);
      hg.fillStyle = '#1a1a1e'; hg.fillRect(40, 44, 240, 12); hg.fillStyle = '#3a3a40'; hg.fillRect(40, 44, 240, 3);
      hg.fillStyle = '#111'; hg.fillRect(20, 40, 40, 20); hg.fillRect(260, 40, 40, 20);
      hg.fillStyle = '#0a0a0a'; hg.fillRect(138, 56, 44, 22); hg.fillStyle = '#4af07a'; hg.font = 'bold 12px monospace'; hg.textAlign = 'center'; hg.fillText('25km/h', 160, 72);
      return;
    }
    if (kind === 'ted') { drawHudTed(bob); return; }
    // montado no Orelha: você vê as costas dele, a nuca e as orelhas enormes balançando pros lados
    const y0 = 30 + bob, ear = Math.sin(L.t * 9) * (C.marcha + 1) * 2.5;
    const pelo = (x, y, rx, ry, c, rot = 0) => { hg.fillStyle = c; hg.beginPath(); hg.ellipse(x, y, rx, ry, rot, 0, 7); hg.fill(); hg.strokeStyle = '#241008'; hg.lineWidth = 2; hg.stroke(); };
    pelo(160, 150 + bob, 130, 82, '#7a4a28');                         // costas
    pelo(160, 146 + bob, 92, 58, '#8a5a32');
    hg.fillStyle = '#c8202c'; hg.fillRect(118, y0 + 44, 84, 9);       // coleira
    hg.fillStyle = '#ffd23a'; hg.beginPath(); hg.arc(160, y0 + 56, 6, 0, 7); hg.fill();
    pelo(160, y0 + 26, 40, 30, '#7a4a28');                             // nuca
    hg.save(); hg.translate(126, y0 + 16); hg.rotate(-.55 - ear * .03); pelo(-44, 16, 54, 24, '#5a3418', -.2); hg.restore();   // orelhas gigantes
    hg.save(); hg.translate(194, y0 + 16); hg.rotate(.55 + ear * .03); pelo(44, 16, 54, 24, '#5a3418', .2); hg.restore();
    hg.fillStyle = 'rgba(255,230,200,.18)'; hg.fillRect(148, y0 + 8, 24, 4); hg.fillRect(120, 110 + bob, 80, 3);
    hg.fillStyle = '#000a'; hg.fillRect(4, 98, 96, 20); hg.fillStyle = '#ffd23a'; hg.font = 'bold 12px monospace'; hg.textAlign = 'left'; hg.fillText(`${C.marcha + 1}ª MARCHA`, 10, 112);
  }
  // montado no TED: pelo caramelo, pescoço fino e as orelhas de pinscher em pé, com a aura em volta
  function drawHudTed(bob) {
    const y0 = 30 + bob, ear = Math.sin(L.t * 9) * (C.marcha + 1) * 1.6;
    const pelo = (x, y, rx, ry, c) => { hg.fillStyle = c; hg.beginPath(); hg.ellipse(x, y, rx, ry, 0, 0, 7); hg.fill(); hg.strokeStyle = '#241008'; hg.lineWidth = 2; hg.stroke(); };
    const aura = hg.createRadialGradient(160, y0 + 50, 20, 160, y0 + 50, 150); aura.addColorStop(0, `rgba(255,225,120,${.28 + .12 * Math.sin(L.t * 7)})`); aura.addColorStop(1, 'rgba(255,225,120,0)'); hg.fillStyle = aura; hg.fillRect(0, 0, 320, 120);
    pelo(160, 152 + bob, 112, 78, '#9a5228'); pelo(160, 148 + bob, 74, 56, '#b0652f');
    pelo(160, y0 + 48, 24, 34, '#a85c2c');
    hg.fillStyle = '#2a6ac8'; hg.fillRect(134, y0 + 56, 52, 8); hg.fillStyle = '#ffd23a'; hg.beginPath(); hg.arc(160, y0 + 68, 5, 0, 7); hg.fill();
    for (const sx of [-1, 1]) {
      hg.save(); hg.translate(160 + sx * 20, y0 + 14); hg.rotate(sx * (.55 + ear * .03));
      hg.fillStyle = '#6a3418'; hg.strokeStyle = '#241008'; hg.lineWidth = 2; hg.beginPath(); hg.moveTo(-16, 6); hg.quadraticCurveTo(-14, -30, 0, -46); hg.quadraticCurveTo(15, -28, 16, 6); hg.closePath(); hg.fill(); hg.stroke();
      hg.fillStyle = '#3e1c0e'; hg.beginPath(); hg.moveTo(-7, 2); hg.quadraticCurveTo(-6, -22, 0, -34); hg.quadraticCurveTo(7, -20, 7, 2); hg.closePath(); hg.fill(); hg.restore();
    }
    pelo(160, y0 + 22, 28, 24, '#b56a34');
    hg.fillStyle = '#000a'; hg.fillRect(4, 98, 96, 20); hg.fillStyle = '#ffd23a'; hg.font = 'bold 12px monospace'; hg.textAlign = 'left'; hg.fillText(`${C.marcha + 1}ª MARCHA`, 10, 112);
  }
  function makeScooter(x, z, ry) {
    const g = E.add(new THREE.Group()); g.position.set(x, 0, z); g.rotation.y = ry;
    const red = lam({ color: 0xc8202c }), blk = lam({ color: 0x1a1a1e });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(.16, .06, .8), blk); deck.position.y = .12; g.add(deck);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(.05, 1, .05), red); stem.position.set(0, .62, -.36); g.add(stem);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.5, .04, .04), blk); bar.position.set(0, 1.1, -.36); g.add(bar);
    for (const dz of [-.36, .36]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .05, 10), blk); w.rotation.z = Math.PI / 2; w.position.set(0, .09, dz); g.add(w); }
    const hit = E.hitbox(.7, 1.2, 1, 0, .6, 0, g);
    E.interact(hit, { label: () => C.mount || !g.visible ? '' : '[E] Subir no patinete', act: () => { if (g.visible) montar('patinete', g); } });
    return g;
  }
  C.marcha = 1;
  // os dois cachorros de montaria: o Orelha e o TED (o TED é desbloqueado na frente da igreja; fica salvo)
  const CAES = {
    orelha: { nome: 'Orelha', au: 'ORELHA: Au!', tom: [520, 420], altura: .95 },
    ted: { nome: 'TED', au: 'TED: Au!', tom: [760, 620], altura: 1.05 },
  };
  const ehCao = k => !!CAES[k];
  const temTed = () => !!(E.META && E.META.ted);
  const dogs = { orelha: { kind: 'orelha', obj: null, mode: 'livre', t: 2, alvo: new THREE.Vector3() }, ted: { kind: 'ted', obj: null, mode: 'parado', t: 1e9, alvo: new THREE.Vector3() } };
  const hearts = [];
  C.cao = temTed() && E.META.caoAtivo === 'ted' ? 'ted' : 'orelha';   // quem vem quando você chama
  const naIgreja = () => { const p = E.player.pos; return p.x > CH.x0 && p.x < CH.x1 && p.z > CH.z0 && p.z < CH.z1 - .2; };
  function escolheCao(k) { C.cao = k; if (E.META) { E.META.caoAtivo = k; E.salvarMeta(); } }
  function montar(kind, obj, quieto) {
    if (C.mount || C.lutando) return;
    C.mount = { kind, obj }; obj.visible = false;
    L.speed = kind === 'patinete' ? 6.5 : MARCHAS[C.marcha];
    drawHud(kind); hudC.style.display = 'block';
    const ac = E.ac();
    if (kind === 'patinete' && ac) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 90; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; const gg = E.gain(0); o.connect(f).connect(gg); o.start(); C.mount.hum = { o, g: gg }; E.tone(300, .3, .05, 'square', null, 0, 0, 900); }
    if (ehCao(kind)) {   // em cima do cachorro a câmera vai pra 3ª pessoa (por trás): dá pra ver você montado
      if (C.camAntes === undefined) { C.camAntes = E.OPT.cam | 0; if (!C.camAntes) E.OPT.cam = 1; }
      if (kind === 'orelha') E.conquista('orelha'); escolheCao(kind); dogs[kind].mode = 'montado'; E.say(CAES[kind].au, 2, 'npc'); latido(kind);
    }
    if (botaoMarcha) botaoMarcha.style.display = ehCao(kind) ? 'block' : 'none';
    if (quieto) return;
    E.toast((kind === 'patinete' ? 'Patinete elétrico' : 'Montado no ' + CAES[kind].nome + '<small>' + (E.isTouch ? 'MARCHA troca a velocidade · ✋ sem mirar em nada desce' : '[1] [2] [3] marchas · [E] sem mirar em nada desce') + '</small>') + (kind === 'patinete' ? (E.isTouch ? '<small>✋ sem mirar em nada para descer</small>' : '<small>[E] sem mirar em nada para descer</small>') : ''));
  }
  function descer(msg, trocando) {
    const m = C.mount; if (!m) return;
    C.mount = null; L.montaria = null; hudC.style.visibility = 'visible'; L.speed = 2.3; hudC.style.display = 'none'; if (botaoMarcha) botaoMarcha.style.display = 'none';
    const p = E.player.pos; m.obj.position.set(p.x + Math.sin(E.player.yaw) * -.9, 0, p.z + Math.cos(E.player.yaw) * -.9); m.obj.visible = true; m.obj.scale.setScalar(1);
    if (!L.walkable(m.obj.position.x, m.obj.position.z)) m.obj.position.set(p.x, 0, p.z);
    if (m.hum) { try { m.hum.o.stop(); } catch (e) {} }
    if (ehCao(m.kind)) { dogs[m.kind].mode = 'livre'; dogs[m.kind].t = 1.5; if (!trocando) { if (C.camAntes === 0 && E.OPT.cam === 1) E.OPT.cam = 0; C.camAntes = undefined; } }
    if (msg) E.say(msg, 3.5);
  }
  // [T] (ou o botão TROCAR): alterna entre o Orelha e o TED, montado ou a pé
  L.onSwap = () => {
    if (!temTed() || C.lutando || S.dlg) return;
    const novo = C.cao === 'ted' ? 'orelha' : 'ted';
    if (C.mount && ehCao(C.mount.kind)) {
      const velho = C.mount.kind; descer(null, true); dogs[velho].mode = 'parado'; dogs[velho].t = 5;
      dogs[novo].obj.position.set(E.player.pos.x, 0, E.player.pos.z); montar(novo, dogs[novo].obj, true);
      E.toast('Montado no ' + CAES[novo].nome);
      return;
    }
    escolheCao(novo); latido(novo);
    E.toast('Cachorro escolhido: ' + CAES[novo].nome + '<small>' + (E.isTouch ? 'CHAMAR traz ele até você' : '[C] chama ele até você') + '</small>');
  };
  L.onEmpty = () => descer();
  L.onGear = n => { if (!C.mount || !ehCao(C.mount.kind)) return; C.marcha = Math.max(0, Math.min(2, n)); L.speed = MARCHAS[C.marcha]; E.tone(300 + C.marcha * 200, .1, .05, 'square'); latido(C.mount.kind); };
  const latido = (k = C.cao) => { const [a, b] = CAES[k].tom; E.tone(a, .12, .06, 'square'); E.tone(b, .14, .06, 'square', null, .14); };
  const heartT = E.canvasTex(16, 16, g => { g.fillStyle = '#ff5d8a'; g.beginPath(); g.moveTo(8, 14); g.bezierCurveTo(-2, 7, 3, 0, 8, 5); g.bezierCurveTo(13, 0, 18, 7, 8, 14); g.fill(); });
  const coracoes = (x, z, n) => { for (let k = 0; k < n; k++) { const h = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.22, .22), basic({ map: heartT, transparent: true, depthWrite: false }))); h.position.set(x + (Math.random() - .5) * .5, 1 + k * .15, z + (Math.random() - .5) * .5); h.userData.v = .6 + Math.random() * .4; hearts.push(h); L.billboards.push(h); } };
  // o cachorro escolhido: vem quando você chama ([C] ou o botão 🐕), passeia por perto e aceita carinho
  L.onCall = () => {
    const d = dogs[C.cao];
    if (!d.obj || C.mount) return;
    if (naIgreja()) { E.say('(Aqui dentro, não. Ele espera lá fora.)', 3); return; }
    E.tone(1800, .2, .04, 'sine', null, 0, 0, 2400);
    // ele aparece logo atrás de você (ou do lado, se atrás tiver parede)
    const p = E.player.pos, yaw = E.player.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const chegou = C.cao === 'ted' ? '(Você assobia. O TED chegou num instante, tá logo atrás de você.)' : '(Você assobia. O Orelha chegou correndo, tá logo atrás de você.)';
    for (const [a, r] of [[0, 1.6], [.7, 1.6], [-.7, 1.6], [1.57, 1.3], [-1.57, 1.3], [0, .9]]) {
      const bx = -fx * Math.cos(a) - -fz * Math.sin(a), bz = -fx * Math.sin(a) + -fz * Math.cos(a);
      const x = p.x + bx * r, z = p.z + bz * r;
      if (L.walkable(x, z)) {
        d.obj.position.set(x, 0, z); d.obj.visible = true; d.mode = 'parado'; d.t = 6; latido(C.cao);
        E.say(chegou, 3); coracoes(x, z, 3);
        return;
      }
    }
    d.mode = 'vindo'; E.say(C.cao === 'ted' ? '(Você assobia. Lá vem o TED.)' : '(Você assobia. Lá vem o Orelha.)', 2.5);
  };
  let wobAura = 0;
  function carinho(k) {
    const d = dogs[k]; latido(k); E.say(k === 'ted' ? 'TED: Au! Au!' : 'ORELHA: Au! Au!', 2, 'npc');
    coracoes(d.obj.position.x, d.obj.position.z, 4);
    d.mode = 'parado'; d.t = 3;
  }
  async function falarCao(k) {
    const d = dogs[k];
    if (!d.obj.visible || C.mount || C.falando) return;
    C.falando = true; d.mode = 'parado'; d.t = 99;
    try {
      if (k === 'ted' && !temTed()) {   // o encontro: a lenda e o desbloqueio (fica salvo pra sempre)
        latido('ted');
        await E.conversa([
          ['VOCÊ', '(Um cachorrinho cor de caramelo, sentado bem na frente da igreja. Ele me olha como quem já sabia que eu vinha.)'],
          ['ARQUIVO DO CLUBEX', 'TED, o cachorro do Kaiky. Ser lendário do Clubex.', '#ffd23a'],
          ['ARQUIVO DO CLUBEX', 'A aura de poder do TED é tão absurda que nunca foi possível estimar a intensidade.', '#ffd23a'],
          ['ARQUIVO DO CLUBEX', 'Todos os medidores de aura usados pra tentar medir o poder dele quebraram.', '#ffd23a'],
          ['VOCÊ', '(O medidor de aura no meu bolso começa a chiar... e estoura.)'],
          ['TED', 'Au.', '#e8b070'],
        ]);
        E.META.ted = 1; escolheCao('ted');
        L.glitchT = .35; E.noiseHit(.45, .3, 3000, null, 'highpass'); E.tone(1400, .5, .06, 'sawtooth', null, 0, 0, 120); wobAura = 1.2;
        E.toast('TED desbloqueado!<small>' + (E.isTouch ? 'TROCAR alterna entre o TED e o Orelha' : '[C] chama · [T] alterna entre o TED e o Orelha') + '</small>');
      }
      const i = await E.choice(k === 'ted' ? 'TED' : 'Cachorro Orelha', ['Montar nele', 'Fazer carinho', 'Deixar passear'], 2, 10);
      if (i === 0) montar(k, d.obj); else if (i === 1) carinho(k); else { d.mode = 'livre'; d.t = 0; escolheCao(k); }
    } finally { C.falando = false; }
  }
  let botaoMarcha = null, botaoChamar = null, botaoTroca = null;
  {
    const spots = APOC ? [[2.2, 17.5, .4]] : [[2.4, 31, .4], [4.2, 15.5, -.6]];
    for (const [x, z, r] of spots) makeScooter(x, z, r);
    const [ox, oz] = APOC ? [-2.6, 16.5] : [-5, 9.5];
    // o TED começa sentado na frente da igreja (do lado de fora, ao lado da porta)
    for (const [k, x, z] of [['orelha', ox, oz], ['ted', 2.3, -19.15]]) {
      const d = dogs[k]; d.obj = E.add(E.club(k, CAES[k].altura)); d.obj.position.set(x, 0, z);
      E.interact(E.hitbox(1, 1.1, 1, 0, .55, 0, d.obj), { label: () => C.mount || !d.obj.visible || S.dlg ? '' : '[E] ' + (k === 'ted' ? 'TED' : 'Orelha'), act: () => falarCao(k) });
    }
    if (E.isTouch) {
      const mk = (txt, css, fn) => { const b = document.createElement('button'); b.textContent = txt; b.style.cssText = 'position:absolute;z-index:21;font-family:VT323,monospace;font-size:20px;padding:6px 10px;border-radius:10px;border:2px solid rgba(255,233,168,.6);background:rgba(20,16,30,.55);color:#ffe9a8;' + css; b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false }); (document.getElementById('touch') || document.body).appendChild(b); return b; };
      const tam = 'width:118px;height:48px;white-space:nowrap;line-height:1;box-sizing:border-box;';   // tamanho fixo: um embaixo do outro sem encavalar
      botaoChamar = mk('🐕 CHAMAR', tam + 'right:138px;top:22%;', () => L.onCall());
      botaoMarcha = mk('⚙ MARCHA', tam + 'right:12px;top:22%;display:none;', () => L.onGear((C.marcha + 1) % 3));
      botaoTroca = mk('🔁 TROCAR', tam + 'right:138px;top:calc(22% + 56px);display:none;', () => L.onSwap());
    }
  }
  // PC: as teclas dos cachorros sempre escritas na tela
  const dogHint = E.isTouch ? null : document.createElement('div');
  if (dogHint) { dogHint.style.cssText = "position:absolute;right:2.4%;top:17%;font-family:'VT323',monospace;font-size:2.8vmin;color:#ffe9a8;text-shadow:1px 1px 0 #000,0 0 4px #000;z-index:4;pointer-events:none;text-align:right;line-height:1.15"; document.getElementById('wrap').appendChild(dogHint); }
  function tickDogHint() {
    if (botaoTroca) botaoTroca.style.display = temTed() ? 'block' : 'none';
    if (!dogHint) return;
    const troca = temTed() ? '<br>[T] trocar de cachorro' : '';
    const txt = C.mount && ehCao(C.mount.kind) ? `🐕 MARCHA ${C.marcha + 1}<br>[1] [2] [3] trocar a marcha<br>[E] descer${troca}` : C.mount ? '[E] descer' : dogs[C.cao].obj && dogs[C.cao].obj.visible ? `🐕 [C] chamar o ${CAES[C.cao].nome}${troca}` : '';
    if (dogHint.innerHTML !== txt) dogHint.innerHTML = txt;
  }
  function tickDog(dt) {
    tickDogHint();
    for (const h of hearts) { h.position.y += h.userData.v * dt; h.material.opacity = Math.max(0, (h.material.opacity ?? 1) - dt * .5); }
    for (let i = hearts.length - 1; i >= 0; i--) if (hearts[i].material.opacity <= 0) { hearts[i].removeFromParent(); hearts.splice(i, 1); }
    if (wobAura > 0) { wobAura -= dt; if (Math.random() < dt * 20) coracoes(dogs.ted.obj.position.x, dogs.ted.obj.position.z, 1); }
    const p = E.player.pos;
    for (const d of Object.values(dogs)) {
      const og = d.obj;
      if (!og || d.mode === 'montado' || (C.mount && C.mount.obj === og) || (d.kind === 'ted' && !temTed())) continue;
      const dist = Math.hypot(og.position.x - p.x, og.position.z - p.z), meu = d.kind === C.cao;
      d.t -= dt;
      let alvo = null, vel = 2;
      if (d.mode === 'vindo') { alvo = p; vel = 6.5; if (dist < 1.6) { d.mode = 'parado'; d.t = 4; latido(d.kind); } }
      else if (d.mode === 'parado') { if (d.t <= 0) d.mode = 'livre'; }
      else if (!meu) continue;   // o que não está escolhido fica esperando onde está
      else {
        if (dist > 14 && !naIgreja()) { alvo = p; vel = 4.5; }
        else if (d.t <= 0) { d.t = 3 + Math.random() * 4; const a = Math.random() * 6.28, r = 3 + Math.random() * 4; d.alvo.set(p.x + Math.sin(a) * r, 0, p.z + Math.cos(a) * r); }
        else if (d.alvo.lengthSq()) alvo = d.alvo;
      }
      if (alvo) {
        const dx = alvo.x - og.position.x, dz = alvo.z - og.position.z, l = Math.hypot(dx, dz);
        if (l > .3) { const nx = og.position.x + dx / l * vel * dt, nz = og.position.z + dz / l * vel * dt; const dentro = nz < CH.z1 && Math.abs(nx) < CH.x1; if (L.walkable(nx, nz) && !dentro) og.position.set(nx, Math.abs(Math.sin(L.t * 12)) * .06, nz); else d.t = 0; }
      }
    }
  }
  const exitDog = () => { botaoChamar && botaoChamar.remove(); botaoMarcha && botaoMarcha.remove(); botaoTroca && botaoTroca.remove(); };

  /* ---------------- som ---------------- */
  L.ambience = bus => {
    E.loopNoise('lowpass', APOC ? 500 : 280, 0, APOC ? .07 : .04, bus);
    if (APOC) E.loopNoise('bandpass', 1400, .8, .02, bus); else E.loopNoise('bandpass', 4300, 8, .015, bus);
  };
  L.enter = () => {
    E.later(9, () => E.tutorial('centro', 'O centro de Naviraí', [['E', '✋', 'subir no patinete ou chamar o Orelha pra montar'], ['1 2 3', 'MARCHA', 'marchas do cachorro (velocidade)'], ['C', '🐕 CHAMAR', 'o cachorro vem até você'], ['E sem mirar', '✋', 'descer do patinete ou do cachorro']], 'A praça, a Pobresa e o IF ficam aqui. O Passarex está escondido nos três.'));
    if (APOC) {
      E.later(1, () => E.voice('n_apoc', 'Depois da luta, a cidade ficou assim. Ele ainda respira.', 'nar'));
      E.later(5.5, () => E.voice('n_cafe', 'Só o café de Naviraí faz o soro. A delegacia fica do outro lado da praça.', 'nar'));
      E.later(11, () => E.toast('Antes que ele acorde<small>café na Pobresa → delegacia · [H] dica</small>'));
      C.timer = 110;
    } else if (Q.st === 0) {
      E.later(1, () => E.voice('n_centro', 'Centro de Naviraí. Três lugares marcados no mapa.', 'nar'));
      E.later(5.5, () => E.toast('Centro de Naviraí<small>ache o Passarex na praça, na Pobresa e no IF · [H] dica</small>'));
    } else if (Q.st === 1 && Q.armas) E.later(1, () => E.toast(Q.mata ? 'Matagalé<small>volte à floresta e atravesse o corredor · [H] dica</small>' : 'A floresta do Mago e do Macaco<small>eles precisam falar com você · trilha no leste da praça</small>'));
    else if (Q.st === 1) E.later(1, () => E.toast('A floresta de cogumelos<small>trilha no leste da praça · [H] dica</small>'));
    else if (Q.st === 2) E.later(1, () => E.toast('Vá até o centro da praça<small>com as máquinas de goiaba</small>'));
  };
  let cafeF = 0, cafeT = 0;
  L.update = dt => {
    const p = E.player.pos;
    L.ceuTick && L.ceuTick(L.t);
    // na catedral: silêncio. Sem patinete, sem cachorro, sem susto, e o relógio do pós-luta para
    const inChurch = p.x > CH.x0 && p.x < CH.x1 && p.z > CH.z0 && p.z < CH.z1 - .2;
    if (inChurch && C.mount) { const k = C.mount.kind; descer(k === 'patinete' ? '(Desci do patinete. Aqui dentro, não.)' : k === 'ted' ? '(O TED ficou esperando lá fora.)' : '(O Orelha ficou esperando lá fora.)');
      if (ehCao(k)) { dogs[k].obj.position.set(2.3, 0, -19.4); dogs[k].mode = 'parado'; dogs[k].t = 20; } }   // ele espera do lado de fora da porta
    if (inChurch && !C.said.igreja) { C.said.igreja = true; E.say('(Silêncio. Todo mundo nos bancos virou a cabeça. Estão olhando pra mim.)', 4.5); }
    if (inChurch && C.fieis) { C.sussT = (C.sussT || 4) - dt; if (C.sussT <= 0) { C.sussT = 6 + Math.random() * 6; E.noiseHit(.9, .025, 1800, null, 'bandpass'); } }
    if (C.church) { const k = .9 + .1 * Math.sin(L.t * 2.1); C.church.lampL.intensity = 5 * k; C.church.flames.forEach((f, i) => f.scale.y = .9 + .12 * Math.sin(L.t * 6 + i)); }
    if (C.flags) C.flags.forEach((f, i) => { f.rotation.y = Math.sin(L.t * 1.6 + i) * .25; });
    if (C.mount) {
      const moving = Math.abs(E.player.bob - (C.lastBob || 0)) > 0; C.lastBob = E.player.bob;
      if (ehCao(C.mount.kind)) drawHud(C.mount.kind, moving ? Math.abs(Math.sin(E.player.bob * .6)) * 6 : 0); else hudC.style.transform = `translateX(-50%) translateY(${moving ? Math.abs(Math.sin(E.player.bob * .3)) * 6 : 0}px)`;
      if (C.mount.hum) C.mount.hum.g.gain.value = moving ? .035 : .01;
      const t3 = E.third && E.third(); hudC.style.visibility = t3 ? 'hidden' : 'visible'; C.mount.obj.visible = !!t3; L.montaria = t3 ? C.mount : null;   // 3ª pessoa: você aparece montado
      if (ehCao(C.mount.kind) && moving && Math.random() < dt * .1) E.say(C.mount.kind === 'ted' ? 'TED: Au.' : 'ORELHA: Au.', 1.5, 'npc');
    }
    tickDog(dt);
    {
    }
    // a luta começa no meio da praça
    if (Q.st === 2 && !C.lutando && Math.hypot(p.x, p.z) < 6) {
      C.lutando = true; descer();
      E.whistle(.12); L.glitchT = 1; E.glitchText('ELE DESCEU', .7);
      if (C.pxBig) C.pxBig.visible = false;
      E.later(1.2, () => lutar(E).then(() => { Q.st = 3; E.save(); E.glitchText('NOCAUTE', .6); E.later(.6, () => E.goTo('centro')); }));
    }
    if (C.pxBig) { C.pxBig.position.y = 13.5 + Math.sin(L.t * .8) * .1; }
    if (APOC) {
      for (const f of fires) { const k = .8 + .2 * Math.sin(L.t * 9 + f.ph) * Math.sin(L.t * 5.3 + f.ph); f.li.intensity = 18 * k; f.f.scale.y = .9 + .15 * k; }
      if (koPx) koPx.position.y = .45 + Math.sin(L.t * 1.4) * .05;   // ele respira
      if (C.luzTrilha) C.luzTrilha.position.y = 1.3 + Math.sin(L.t * 1.7) * .15;
      if (cafe && cafe.visible) { cafeT += dt; if (cafeT > .09) { cafeT = 0; const im = cafeTex.userData.img; if (im.complete) { const g = cafeTex.userData.ctx; g.clearRect(0, 0, 96, 109); g.drawImage(im, (cafeF++ % 12) * 96, 0, 96, 109, 0, 0, 96, 109); cafeTex.needsUpdate = true; } } cafe.position.y = 1.02 + Math.sin(L.t * 2) * .04; }
      if (!C.soro && !S.dead) {
        if (!inChurch) C.timer -= dt;
        E.osd('<span class="rec">● REC</span>', `ELE ACORDA EM ${Math.max(0, Math.ceil(C.timer))}s${C.cafe ? ' · CAFÉ NA MÃO' : ''}`);
        if (C.timer <= 0) {
          E.die(() => { E.player.pos.set(0, 0, 17); E.player.yaw = 0; C.timer = 110; C.cafe = false; C.deliver = false; cafe.visible = true; C.cafeGlow.intensity = 6; });
          E.later(.1, () => { C.timer = 999; });
        }
      }
    }
    // o sino da catedral: de vez em quando (a cada 50-110 s), 2 a 4 badaladas, mais alto perto da igreja
    if (!S.dead && !C.lutando) {
      C.sinoT = (C.sinoT ?? 5 + Math.random() * 6) - dt;
      if (C.sinoT <= 0) {
        C.sinoT = 28 + Math.random() * 22;
        const d = Math.hypot(p.x, p.z - CH.z1), vol = Math.max(.45, Math.min(1.4, 20 / (d + 4))) * (APOC ? .7 : 1);
        if (d < 120) sino(2 + Math.floor(Math.random() * 3), vol);
      }
    }
    if (SHOW && !SHOW.parou) { if (C.lutando) SHOW.parar(); else SHOW.tick(dt, L.t); }
    if (L.glitchT > 0) L.glitchT -= dt;
    L.glitch = L.glitchT > 0 && !inChurch ? .5 : 0;
  };
  // badalada: parciais inarmônicos de sino (grave, longo, com um "tlim" no começo)
  function sino(n, vol) {
    const f0 = 196 + Math.random() * 20;
    for (let k = 0; k < n; k++) {
      const t = k * 2.1;
      for (const [r, a, d] of [[.5, .5, 6], [1, 1, 5], [1.19, .45, 3.5], [1.5, .35, 3], [2, .5, 2.5], [2.74, .22, 1.6], [3.76, .12, 1]])
        E.tone(f0 * r, d, .06 * a * vol, 'sine', null, t);
      E.tone(f0 * 5.4, .12, .04 * vol, 'triangle', null, t);   // o "tlim" do badalo
    }
  }
  L.debugSino = () => sino(3, 1);
  L.exit = () => { SHOW && SHOW.parar(); C.radioOn = false; try { radioSrc && radioSrc.stop(); } catch (e) {} descer(); hudC.remove(); exitDog(); dogHint && dogHint.remove(); };
  E.moedas(APOC ? [[0, null, 12], [-23, null, -1.5]] : [[0, null, 9.5], [-9, null, 2], [11, null, 9], [0, null, 38], [-24.5, null, 1], [9, null, IFZ - 3.6], [15, null, -3]]);
  L.hint = () => {
    const p = E.player.pos;
    if (APOC) {
      if (!C.cafe) return { text: 'O café de Naviraí está no balcão da Pobresa, no lado oeste da praça.', path: p.x > -19 ? [new THREE.Vector3(-17.5, 1.2, 0), new THREE.Vector3(-21, 1.2, 2)] : [new THREE.Vector3(-21, 1.2, 2)] };
      return { text: 'Leve o café para a delegacia, do outro lado da praça (leste).', path: p.x < -19 ? [new THREE.Vector3(-17.5, 1.2, 0), new THREE.Vector3(17.5, 1.2, 0)] : [new THREE.Vector3(17.5, 1.2, 0)] };
    }
    if (Q.st === 0) {
      const falta = Object.keys(HIDE).filter(k => !Q.found[k]);
      const alvo = falta.map(k => HIDE[k]).sort((a, b) => a.pos.distanceTo(p) - b.pos.distanceTo(p))[0];
      const pista = { praca: 'Na praça, olhe nos galhos baixos das árvores.', pobresa: 'Na Pobresa, olhe dentro das geladeiras.', if: 'No IF, olhe nos canteiros do pátio.' }[falta.find(k => HIDE[k] === alvo)];
      return { text: pista + ` (${3 - falta.length}/3)`, target: alvo.pos.clone().setY(1.2) };
    }
    if (Q.st === 1 && Q.armas) return { text: Q.mata ? 'Matagalé fica depois da floresta de cogumelos. A trilha é no leste da praça.' : 'Volte à floresta do Mago e do Macaco. A trilha fica no leste da praça.', target: TRILHA.clone().setY(1.2) };
    if (Q.st === 1) {
      if (Q.pediuRefri && !Q.refri && !Q.azedas) return { text: 'Pegue um refri gelado nas geladeiras da Pobresa.', target: new THREE.Vector3(-25.5, 1.2, 0) };
      return { text: 'O Mago e o Macaco moram na floresta de cogumelos. A trilha fica no leste da praça, perto da delegacia.', target: TRILHA.clone().setY(1.2) };
    }
    return { text: 'Vá até o centro da praça. Ele está esperando.', target: new THREE.Vector3(0, 1.2, 4) };
  };
  L.debug = { Q, C, dogs, achou, lutar: () => lutar(E), entregar, falarCao, montar: k => montar(k, dogs[k] ? dogs[k].obj : null) };
}
