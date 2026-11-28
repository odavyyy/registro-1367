// FASE 5 · Registro 1491. A fita pula para um convés no meio do oceano: Douradex aponta, Colombo duvida,
// Tonho entrega o leme e o Passarex, lá no alto do mastro, assobia na direção da terra. Um ano antes de Colombo.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(1491);
  const SKY_T = new THREE.Color('#8a6f8a'), SKY_H = new THREE.Color('#ffc47c'), NIGHT_T = new THREE.Color('#0a0c1c'), NIGHT_H = new THREE.Color('#2a2440');
  E.scene.background = new THREE.Color('#ffc8a0');
  E.scene.fog = new THREE.FogExp2(0xf6b89a, .0042);
  E.camera.far = 400;
  L.floor = 'wood'; L.speed = 1.9; L.eye = 1.6; L.reach = 2.3;
  E.osd('▶ PLAY', 'REGISTRO 1491 · OCEANO ATLÂNTICO');
  L.clock = () => '17:20';
  const { lam, basic, box } = E;
  const C = { H: 0, T: 1.05, D: 430, helm: false, talked: {}, choiceDone: false, land: false, arrived: false, whistleT: 4, nagT: 0, night: 0, back: 0 };

  /* convés: o navio fica parado no mundo; quem gira é o mar, o sol e a terra */
  const deckW = 2.5;
  const halfW = z => z < -6 ? deckW * Math.max(.25, (z + 10.5) / 4.5) : deckW;
  L.walkable = (x, z) => z > -10 && z < 8.4 && Math.abs(x) < halfW(z) - .25;
  L.ground = (x, z) => z > 4.2 ? 1.05 : z > 3 ? (z - 3) / 1.2 * 1.05 : 0;
  L.spawn = { x: .8, z: 1.5, yaw: .2, pitch: -.02 };

  const plank = E.canvasTex(32, 32, (g, w, h) => {
    g.fillStyle = '#8a5f3a'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { g.fillStyle = ['#7d5532', '#936741', '#86603b', '#7a5230'][(x / 8) % 4]; g.fillRect(x, 0, 7, h); g.fillStyle = '#4a3220'; g.fillRect(x + 7, 0, 1, h); }
    E.speckle(g, w, h, 90, ['#6a4628', '#9a6e48']);
  }, [3, 12]);
  const wood = lam({ map: plank }), darkWood = lam({ color: 0x5a3a22 }), rope = lam({ color: 0xc8b088 });
  const deck = E.add(new THREE.Mesh(new THREE.PlaneGeometry(deckW * 2, 19, 1, 10), wood)); deck.rotation.x = -Math.PI / 2; deck.position.z = -1;
  const qd = E.add(new THREE.Mesh(new THREE.PlaneGeometry(deckW * 2, 4.4), wood)); qd.rotation.x = -Math.PI / 2; qd.position.set(0, 1.05, 6.3);
  { const st = E.add(new THREE.Mesh(new THREE.PlaneGeometry(deckW * 2, 1.6), wood)); st.position.set(0, .52, 3.6); st.rotation.x = -Math.PI / 2 - .72;
    for (let k = 1; k < 6; k++) box(deckW * 2, .04, .06, darkWood, 0, k / 6 * 1.05 + .02, 3 + k / 6 * 1.2, { occ: false }); }   // degraus marcados
  // casco e amurada
  box(deckW * 2 + .5, 2.6, 19, darkWood, 0, -1.32, -1, { occ: false });
  box(deckW * 2 + .5, 2, 4.6, darkWood, 0, 0, 6.4, { occ: false });
  for (const sx of [-1, 1]) {
    for (let z = -6; z < 8.5; z += 2) box(.18, .95, 2, wood, sx * (deckW + .1), .48 + (z > 4 ? 1.05 : 0), z + 1, { occ: false });
    box(.14, .9, 4.6, wood, sx * 1.4, .45 + 0, -8.2, { occ: false }).rotation.y = sx * .5;
  }
  box(deckW * 2, .9, .18, wood, 0, 1.5, 8.5, { occ: false });
  const bow = box(.25, .25, 4, wood, 0, .8, -11.5, { occ: false }); bow.rotation.x = -.35;
  // mastros e velas
  const sailT = E.canvasTex(48, 48, (g, w, h) => {
    g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 160, ['#e2d5b4', '#f6eedc']);
    g.fillStyle = '#c99a2e'; g.beginPath(); g.arc(24, 24, 9, 0, 7); g.fill(); g.fillStyle = '#efe4c8'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillText('67', 24, 28);
  });
  const sailM = lam({ map: sailT, side: THREE.DoubleSide });
  const masts = [[0, -1.5, 13], [0, -7, 9]];
  masts.forEach(([x, z, h], i) => {
    const m = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.13, .18, h, 8), darkWood)); m.position.set(x, h / 2, z); E.circle(x, z, .3);
    for (const [y, w, sh] of i ? [[5.5, 4.4, 3.2]] : [[5.2, 5, 3.6], [9.6, 3.8, 2.6]]) {
      box(w + .6, .12, .12, darkWood, x, y + sh / 2 + .1, z, { occ: false });
      const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(w, sh, 4, 3), sailM)); s.position.set(x, y, z + .15);
      const p = s.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const px = p.getX(k), py = p.getY(k); p.setZ(k, -(1 - (px / (w / 2)) ** 2) * .5 * (1 - Math.abs(py) / sh)); }
    }
  });
  // cesto da gávea (onde ele fica)
  const nest = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.6, .5, .6, 10, 1, true), lam({ color: 0x6a4a2a, side: THREE.DoubleSide }))); nest.position.set(0, 11.6, -1.5);
  // leme
  const helmG = E.add(new THREE.Group()); helmG.position.set(0, 1.05, 6.6);
  { const post = new THREE.Mesh(new THREE.BoxGeometry(.2, 1.0, .2), darkWood); post.position.y = .5; helmG.add(post);
    const wheel = new THREE.Group(); wheel.position.set(0, 1.08, -.14); helmG.add(wheel); C.wheel = wheel;
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(.42, .04, 5, 14), wood));
    for (let k = 0; k < 8; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(.035, 1.08, .035), wood); sp.rotation.z = k / 8 * Math.PI; wheel.add(sp); } }
  E.circle(0, 6.6, .3);
  const helmHit = E.hitbox(1.1, 1.4, .6, 0, 1.05 + 1.05, 6.45);
  E.interact(helmHit, { label: () => C.arrived ? '' : C.helm ? `${rumoTxt()}  ·  [E] largar` : '[E] Pegar o leme', act: () => toggleHelm() });
  // barris, caixas, cordas
  const barrelT = name => E.canvasTex(32, 32, g => { g.fillStyle = '#8a6038'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#4a4a50'; g.fillRect(0, 5, 32, 3); g.fillRect(0, 24, 32, 3); if (name) { g.fillStyle = '#f0e0b0'; g.font = 'bold 5px monospace'; g.textAlign = 'center'; g.fillText(name, 16, 18); } }, [2, 1]);
  const barrels = [[-1.8, 2.4, ''], [-1.75, 1.6, 'RUM'], [1.9, -4, ''], [-1.9, -4.6, 'ACEROLÂNDIA']];
  const barrelMesh = {};
  for (const [x, z, n] of barrels) {
    const b = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.32, .3, .8, 10), lam({ map: barrelT(n) }))); b.position.set(x, .4, z); b.rotation.y = rnd() * 6; E.circle(x, z, .35); L.occluders.push(b);
    barrelMesh[n || x] = b;
  }
  box(.8, .6, .7, lam({ color: 0x7a5232 }), 1.85, .3, 2.6, { solid: true }); box(.6, .45, .6, lam({ color: 0x6a4428 }), 1.85, .82, 2.6);
  // mesa com o mapa da expedição
  const mapT = E.canvasTex(64, 48, g => {
    g.fillStyle = '#e4cf9c'; g.fillRect(0, 0, 64, 48); E.speckle(g, 64, 48, 140, ['#d4bd88', '#efdcae']);
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 1; g.strokeRect(2, 2, 60, 44);
    g.fillStyle = '#7a9a6a'; g.beginPath(); g.ellipse(54, 22, 8, 14, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(10, 18, 7, 10, 0, 0, 7); g.fill();
    g.setLineDash([2, 2]); g.strokeStyle = '#8a2a2a'; g.beginPath(); g.moveTo(14, 26); g.quadraticCurveTo(32, 38, 48, 24); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#5a3a22'; g.font = '5px monospace'; g.fillText('É POR ALI →', 20, 12); g.fillText('1491', 4, 44);
    g.fillStyle = '#c99a2e'; g.beginPath(); g.arc(48, 24, 2, 0, 7); g.fill();
  });
  box(1.1, .06, .7, darkWood, -1.4, .82, -2.6); box(.08, .8, .08, darkWood, -1.4, .4, -2.6, { occ: false }); E.circle(-1.4, -2.6, .55);
  const map = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1, .65), basic({ map: mapT }))); map.rotation.x = -Math.PI / 2; map.position.set(-1.4, .86, -2.6);

  /* luz */
  const hemi = E.add(new THREE.HemisphereLight(0xffd8b8, 0x6a5a7a, 2.0));
  const sunL = E.add(new THREE.DirectionalLight(0xffc890, 1.4)); sunL.position.set(-20, 15, 10);

  /* céu, sol, mar */
  const skyC = document.createElement('canvas'); skyC.width = 4; skyC.height = 64;
  const skyT = E.texFrom(skyC), skyG = skyC.getContext('2d');
  const paintSky = k => {
    const top = SKY_T.clone().lerp(NIGHT_T, k), hor = SKY_H.clone().lerp(NIGHT_H, k);
    const gr = skyG.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#' + top.getHexString()); gr.addColorStop(.5, '#' + hor.getHexString()); gr.addColorStop(1, '#' + hor.getHexString());
    skyG.fillStyle = gr; skyG.fillRect(0, 0, 4, 64); skyT.needsUpdate = true;
    E.scene.fog.color.copy(hor); E.scene.background.copy(hor);
  };
  paintSky(0);
  const sky = new THREE.Group(); E.add(sky);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(300, 16, 10), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -2; sky.add(dome);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(14, 20), new THREE.MeshBasicMaterial({ color: 0xffcf9e, fog: false, depthWrite: false })); sun.renderOrder = -1; sky.add(sun);
  const seaT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#4a7a98'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 160, ['#3e6c8a', '#5a8aa8', '#6a9ab4']); g.fillStyle = 'rgba(255,230,200,.35)'; g.fillRect(4, 10, 6, 1); g.fillRect(20, 24, 5, 1); }, [60, 60]);
  const seaGeo = new THREE.PlaneGeometry(420, 420, 42, 42); seaGeo.rotateX(-Math.PI / 2);
  const sea = E.add(new THREE.Mesh(seaGeo, lam({ map: seaT }))); sea.position.y = -1.8;
  const seaBase = Float32Array.from(seaGeo.attributes.position.array);

  /* a terra (as Américas): praia, morros e coqueiros, lá longe */
  const land = new THREE.Group(); E.add(land);
  { const sand = new THREE.Mesh(new THREE.CylinderGeometry(70, 76, 2, 18), lam({ color: 0xe8d29a })); sand.position.y = -2; land.add(sand);
    for (const [x, z, r, h] of [[-20, -30, 30, 16], [15, -40, 26, 22], [40, -20, 20, 12], [-45, -10, 18, 10]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), lam({ color: 0x4f8a4a })); m.position.set(x, h / 2 - 1.5, z); land.add(m); }
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * Math.PI - Math.PI / 2 + (rnd() - .5) * .2, r = 52 + rnd() * 12, x = Math.sin(a) * r, z = Math.cos(a) * r * .6 + 10;
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(.5, .8, 9, 5), lam({ color: 0x8a6a4a })); tr.position.set(x, 3, z); tr.rotation.z = (rnd() - .5) * .3; land.add(tr);
      const lf = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2.5, 6), lam({ color: 0x3a8a4a })); lf.position.set(x, 8, z); land.add(lf);
    }
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), lam({ color: 0xe0b030, side: THREE.DoubleSide })); flag.position.set(3, 7, 62); flag.visible = false; land.add(flag); C.flag = flag;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 9, 5), darkWood); pole.position.set(1, 4.5, 62); pole.visible = false; land.add(pole); C.pole = pole;
  }
  land.visible = false;
  C.bando = [];
  for (let k = 0; k < 9; k++) { const b = E.sticker(2.4, { s: .1 }); L.billboards.splice(L.billboards.indexOf(b), 1); b.position.set(-14 + k * 3.4 + (rnd() - .5), -1, 56 + rnd() * 5); b.userData.ph = rnd() * 6; b.userData.v = 3 + rnd() * 2; land.add(b); C.bando.push(b); }

  /* o elenco */
  const douradex = E.add(E.club('douradex', 1.78)); douradex.position.set(.7, 0, -8);
  const colombo = E.add(E.figura('drawColombo', 1.8, { flip: true })); colombo.position.set(1.3, 0, -1.8);
  const tonho = E.add(E.figura('drawTonho', 1.72)); tonho.position.set(1.1, 1.05, 6.9);
  const px = E.add(E.sticker(1.1, { outline: true, s: .1 })); px.position.set(0, 11.9, -1.5);
  const cast = [douradex, colombo, tonho];
  E.circle(.7, -8, .35); E.circle(1.3, -1.8, .35); E.circle(1.1, 6.9, .35);
  const talk = (who, txt) => E.interact(E.hitbox(.8, 1.8, .8, who.position.x, who.position.y + .9, who.position.z), { label: () => '[E] ' + txt, act: () => talkTo(who) });
  talk(douradex, 'Falar com o Douradex'); talk(colombo, 'Falar com o Colombo'); talk(tonho, 'Falar com o Tonho');
  const v = (id, text, who) => E.voice(id, text, 'npc', { pan: who ? E.pan(who.position) : 0 });
  function talkTo(w) {
    if (w === douradex) {
      if (!C.helm && !C.talked.tonho) return v('d_por_ali', 'DOURADEX: É por ali, confia!', douradex), C.talked.dour = true;
      return dirLine(true);
    }
    if (w === colombo) { C.talked.col = true; return C.choiceDone ? v('c_ninguem', 'COLOMBO: Ninguém vai acreditar nisso.', colombo) : v('c_nao_vejo', 'COLOMBO: Terra? Eu não vejo terra nenhuma.', colombo); }
    if (w === tonho) { C.talked.tonho = true; v('t_leme', 'TONHO: O leme é seu, chefe. Eu só obedeço.', tonho); }
  }
  // o Douradex só fala quando o rumo muda (ou, se você continua no mesmo erro, de vez em quando)
  function dirLine(forca) {
    const rel = wrap(C.T - C.H), dir = Math.abs(rel) < OK ? 0 : rel > 0 ? 1 : -1;
    C.falaT = (C.falaT || 0) + 3;
    const espera = dir === C.ultDir ? (dir === 0 ? 40 : 22) : 5;
    if (!forca && C.falaT < espera) return;
    C.falaT = 0; C.ultDir = dir;
    if (dir === 0) return v('d_por_ali', 'DOURADEX: É por ali, confia!', douradex);
    return rel > 0 ? v('d_direita', 'DOURADEX: Mais pra direita! É por ali, confia.', douradex) : v('d_esquerda', 'DOURADEX: Mais pra esquerda, parceiro!', douradex);
  }
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const OK = .5;   // folga do rumo certo (bem fácil)
  const rumoTxt = () => { const r = wrap(C.T - C.H); return Math.abs(r) < OK ? '✔ NO RUMO CERTO' : r > 0 ? (E.isTouch ? 'VIRE PRA DIREITA ▶▶' : 'SEGURE [D] ▶▶') : (E.isTouch ? '◀◀ VIRE PRA ESQUERDA' : '◀◀ SEGURE [A]'); };

  /* segredos do Clubex no navio */
  let aceroPop = null;
  E.ovo('barril', barrelMesh['ACEROLÂNDIA'], 'Barril de Acerolândia', () => {
    if (!aceroPop) { aceroPop = E.add(E.club('acerolito', .9)); aceroPop.position.set(-1.9, .55, -4.6); aceroPop.userData.t = 0; }
    E.say('ACEROLITO: Que isso?', 3, 'npc'); E.tone(660, .18, .05, 'square'); E.tone(880, .18, .05, 'square', null, .12);
  });
  E.ovo('mapa', map, 'Mapa da expedição', () => E.note(`<small>MAPA DA EXPEDIÇÃO · 1491</small><h2>“É por ali, confia.”</h2>
    <p>Um mapa sem quase nada. Uma linha tracejada atravessa o oceano até uma terra que nenhum livro conhece. No canto, um carimbo dourado: <b>REI DA EXPEDIÇÃO</b>.</p>
    <p class="hand">o pássaro mostrou o caminho. o douradex confiou.</p>`));

  /* leme e navegação */
  function toggleHelm() {
    if (C.arrived) return;
    if (!C.talked.tonho) { talkTo(tonho); }
    C.helm = !C.helm;
    L.speed = C.helm ? 0 : 1.9;
    if (C.helm) { E.player.pos.set(0, 0, 7.25); E.player.yaw = 0; E.player.pitch = -.05; C.nagT = 2; E.toast(E.isTouch ? 'No leme<small>joystick para os lados vira o navio · siga o fiu fiu</small>' : 'No leme<small>[A] e [D] viram o navio · siga o fiu fiu</small>'); }
    E.sfx.knob();
  }

  /* som: mar, vento nas velas, madeira rangendo */
  L.ambience = bus => {
    E.loopNoise('lowpass', 380, 0, .09, bus);
    E.loopNoise('bandpass', 900, .6, .02, bus);
  };
  let creakT = 3;
  L.enter = () => {
    E.later(4, () => E.tutorial('navio', 'O navio de 1491', [['E', '✋', 'falar com a tripulação e pegar o leme (fica lá atrás, na popa)'], ['A  D', 'joystick pros lados', 'virar o navio quando estiver no leme'], ['ouvido', 'fone de ouvido', 'o fiu fiu vem do lado da terra: siga o som'], ['E sem mirar', '✋', 'largar o leme']], 'Leve o navio até a terra. A tela mostra pra que lado virar.'));
    E.later(1, () => E.voice('n_1491', 'Registro mil quatrocentos e noventa e um. Um ano antes de Colombo.', 'nar'));
    E.later(6.5, () => E.toast('Oceano Atlântico, 1491<small>o leme fica lá atrás, na popa · [H] dica</small>'));
    E.later(30, () => { if (!C.helm && !C.talked.tonho) { C.talked.tonho = true; v('t_leme', 'TONHO: O leme é seu, chefe. Eu só obedeço.', tonho); E.later(3, () => E.say('(O leme fica lá atrás, subindo a escadinha. Vire e vá até lá.)', 4)); } });
    E.later(9, () => v('d_por_ali', 'DOURADEX: É por ali, confia!', douradex));
  };
  /* ---------------- o mar em movimento: espuma no casco, respingo na proa, coisas boiando, gaivotas, nuvens ---------------- */
  const foamT = E.canvasTex(16, 64, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${.3 + Math.random() * .5})`; g.fillRect((Math.random() * w) | 0, (Math.random() * h) | 0, 2 + (Math.random() * 3 | 0), 1); } }, [1, 4]);
  const foams = [];
  for (const sx of [-1, 1]) { const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 26), basic({ map: foamT, transparent: true, depthWrite: false }))); f.rotation.x = -Math.PI / 2; f.position.set(sx * 3.9, -1.55, 2); foams.push(f); }
  const wake = E.add(new THREE.Mesh(new THREE.PlaneGeometry(7, 40), basic({ map: foamT, transparent: true, opacity: .7, depthWrite: false }))); wake.rotation.x = -Math.PI / 2; wake.position.set(0, -1.56, 28); foams.push(wake);
  const sprayM = basic({ color: 0xffffff, transparent: true, opacity: .7, depthWrite: false });
  const spray = []; for (let k = 0; k < 14; k++) { const s = E.add(new THREE.Mesh(new THREE.SphereGeometry(.09, 4, 3), sprayM)); s.userData = { t: Math.random() }; spray.push(s); }
  // coisas boiando que passam pelo navio (aí dá pra sentir que ele anda)
  const bobM = [lam({ color: 0x8a6038 }), lam({ color: 0x4a7a3a }), lam({ color: 0xd8c8a0 })];
  const boias = []; for (let k = 0; k < 10; k++) { const b = E.add(new THREE.Mesh(k % 3 ? new THREE.BoxGeometry(.5, .25, 1.2) : new THREE.CylinderGeometry(.3, .3, .8, 6), bobM[k % 3])); b.rotation.set(Math.PI / 2 * (k % 2), k, 0); b.userData = { x: (k % 2 ? 1 : -1) * (6 + Math.random() * 14), z: -60 + k * 14 }; boias.push(b); }
  // gaivotas
  const gaiT = E.canvasTex(16, 8, g => { g.strokeStyle = '#2a2a30'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(4, 0, 8, 5); g.quadraticCurveTo(12, 0, 16, 6); g.stroke(); });
  const gaivotas = []; for (let k = 0; k < 5; k++) { const m = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, .6), basic({ map: gaiT, transparent: true, depthWrite: false, side: THREE.DoubleSide }))); m.userData = { a: Math.random() * 6, r: 14 + k * 5, h: 12 + k * 2 }; gaivotas.push(m); }
  // nuvens no céu e um brilho em volta do sol
  const nuvT = E.canvasTex(64, 32, g => { g.fillStyle = 'rgba(255,236,220,.95)'; for (const [x, y, r] of [[18, 20, 10], [30, 14, 13], [44, 19, 11], [52, 23, 8], [10, 24, 7]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.fillStyle = 'rgba(240,180,170,.6)'; g.fillRect(4, 26, 56, 4); });
  const nuvens = []; for (let k = 0; k < 14; k++) { const n = new THREE.Mesh(new THREE.PlaneGeometry(40 + Math.random() * 30, 16 + Math.random() * 8), new THREE.MeshBasicMaterial({ map: nuvT, transparent: true, fog: false, depthWrite: false })); n.userData = { a: k / 14 * Math.PI * 2 + Math.random() * .3, h: 30 + Math.random() * 40 }; n.renderOrder = -1; sky.add(n); nuvens.push(n); }
  const halo = new THREE.Mesh(new THREE.CircleGeometry(34, 24), new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: .25, fog: false, depthWrite: false })); halo.renderOrder = -1; sky.add(halo);
  // moedas boiando no caminho até a ilha: o navio passa por cima delas quando está no rumo certo
  const MEIO = [380, 330, 270, 210, 150, 95];
  const coinsMar = [];
  { E.moedas([]);
    const tex = E.canvasTex(32, 32, g => { g.fillStyle = '#c8901a'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(16, 16, 12, 0, 7); g.fill(); g.fillStyle = '#a8700a'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText('67', 16, 21); });
    MEIO.forEach((d, i) => { const id = 'navio:mar' + i; if (E.META.coins[id]) return; const m = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .1, 14), [lam({ color: 0xc8901a }), basic({ map: tex }), basic({ map: tex })])); m.rotation.x = Math.PI / 2; m.userData = { d, id }; coinsMar.push(m); });
    E.META.coinTot = E.META.coinTot || {}; E.META.coinTot.navio = MEIO.length; }
  function tickMar(dt, t, rel, anda) {
    const v = anda ? 1 : .15;
    foamT.offset.y = (foamT.offset.y + dt * 1.6 * v) % 1;
    for (const s of spray) { s.userData.t += dt * (anda ? 1.6 : .4); const k = s.userData.t % 1; s.position.set(Math.sin(s.userData.t * 7) * 1.2, -1 + k * 1.6 - k * k * 1.4, -11.5 - k * 1.5); s.visible = anda; }
    for (const b of boias) { b.userData.z += dt * (anda ? 9 : 1); if (b.userData.z > 40) { b.userData.z = -70; b.userData.x = (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 14); } b.position.set(b.userData.x, -1.6 + Math.sin(t * 2 + b.userData.z) * .15, b.userData.z); b.rotation.z += dt * .3; }
    for (const g of gaivotas) { const u = g.userData; u.a += dt * .25; g.position.set(Math.cos(u.a) * u.r, u.h + Math.sin(t * 3 + u.r) * .5, Math.sin(u.a) * u.r - 4); g.rotation.y = -u.a; g.scale.y = .7 + Math.abs(Math.sin(t * 6 + u.r)) * .6; }
    for (const n of nuvens) { const a = n.userData.a - C.H; n.position.set(Math.sin(a) * 240, n.userData.h, -Math.cos(a) * 240); n.lookAt(0, n.userData.h * .5, 0); }
    halo.position.copy(sun.position); halo.quaternion.copy(sun.quaternion); halo.position.multiplyScalar(1.01);
    // moedas no mar
    for (const m of coinsMar) {
      if (!m.visible) continue;
      const ahead = C.D - m.userData.d;
      if (ahead > 150) { m.visible = true; m.position.y = -50; continue; }
      const dz = ahead * 1.0 + 12;
      m.position.set(Math.sin(rel) * dz, -.6 + Math.sin(t * 2 + m.userData.d) * .2, -Math.cos(rel) * dz); m.rotation.z += dt * 2;
      if (ahead <= 0) { m.visible = false; E.META.coins[m.userData.id] = 1; E.salvarMeta(); E.tone(1320, .08, .05, 'square'); E.tone(1760, .12, .05, 'square', null, .07); E.toast(`🪙 Moeda do mar<small>${E.saldo()} moedas</small>`); }
    }
    // o navio balança de leve
    L.roll = Math.sin(t * .9) * (anda ? .025 : .012);
  }

  L.update = dt => {
    const t = L.t, p = E.player.pos;
    for (const c of cast) c.userData.anim && c.userData.anim(t);   // o Douradex (do Clubex) é figurinha parada: sem anim
    if (aceroPop) { aceroPop.userData.t += dt; aceroPop.position.y = .55 + Math.abs(Math.sin(aceroPop.userData.t * 5)) * .25 * Math.max(0, 1 - aceroPop.userData.t / 3); if (aceroPop.userData.t > 3.5) { aceroPop.removeFromParent(); aceroPop = null; } }
    // leme
    if (C.helm) {
      const ax = E.axis();
      if (Math.abs(ax.s) > .1 && !C.arrived) C.H += ax.s * dt * .45;
      p.set(0, 0, 7.25);
      C.wheel.rotation.z += ((-ax.s) * 1.2 - C.wheel.rotation.z) * Math.min(1, dt * 4) + 0;
    }
    if (C.back > 0) { C.back -= dt; C.H += dt * 1.4; }   // o navio dando a volta (e voltando)
    const rel = wrap(C.T - C.H), onCourse = Math.abs(rel) < OK;
    // o navio anda quando está no rumo certo
    if (!C.arrived && C.back <= 0 && (onCourse || C.D < 140)) C.D = Math.max(40, C.D - dt * 9.5);
    // a terra lá longe, girando com o rumo
    land.visible = C.D < 300;
    for (const b of C.bando) b.position.y = -1 + Math.abs(Math.sin(t * b.userData.v + b.userData.ph)) * 1.8;   // pulando, esperando o navio
    land.position.set(Math.sin(rel) * (C.D + 70), 0, -Math.cos(rel) * (C.D + 70)); land.rotation.y = -rel;
    // sol e céu
    sky.position.set(E.camera.position.x, 0, E.camera.position.z);
    const sunRel = wrap(-2.2 - C.H);
    sun.position.set(Math.sin(sunRel) * 250, 26 - C.night * 40, -Math.cos(sunRel) * 250); sun.lookAt(sky.position.x, 0, sky.position.z);
    sunL.position.set(Math.sin(sunRel) * 30, 15, -Math.cos(sunRel) * 30);
    // mar: ondas e correnteza
    const pa = seaGeo.attributes.position;
    for (let k = 0; k < pa.count; k++) { const x = seaBase[k * 3], z = seaBase[k * 3 + 2]; pa.setY(k, Math.sin(x * .08 + t * 1.3) * .35 + Math.cos(z * .07 + t * .9) * .3); }
    pa.needsUpdate = true;
    seaT.offset.y -= dt * (onCourse && !C.arrived ? .14 : .012); seaT.offset.x = Math.sin(t * .2) * .02;
    tickMar(dt, t, rel, onCourse && !C.arrived && C.back <= 0);
    // o fiu fiu vem da direção da terra
    C.whistleT -= dt;
    if (C.whistleT <= 0 && !C.arrived) {
      C.whistleT = C.helm ? 5.5 : 9;
      E.whistle(.07, { pan: E.pan(land.position) });
    }
    if (C.helm && !C.arrived) { C.nagT -= dt; if (C.nagT <= 0) { C.nagT = 3; dirLine(); } }
    // Colombo quer voltar
    if (!C.choiceDone && C.D < 280 && !S.choosing) {
      C.choiceDone = true;
      const d = v('c_voltar', 'COLOMBO: Douradex, faz três dias que a gente não vê terra. Volta esse navio!', colombo);
      E.later(d + .3, () => E.choice('Colombo quer voltar.', ['Confiar no Douradex', 'Voltar pra Espanha'], 0, 9).then(i => {
        if (i === 1) {
          C.back = Math.PI * 2 / 1.4; S.noticed++; L.glitchT = .6;
          E.whistle(.12); E.later(1.2, () => v('d_por_ali', 'DOURADEX: É por ali, confia!', douradex));
          E.later(2.4, () => E.say('(O navio virou sozinho. De volta pro mesmo rumo.)', 3.5));
        } else v('d_por_ali', 'DOURADEX: É por ali, confia!', douradex);
      }));
    }
    // terra à vista
    if (!C.land && C.D < 140) { C.land = true; v('t_terra', 'TONHO: Terra à vista! Terra à vista!', tonho); }
    if (!C.arrived && C.D <= 40.5) arrive();
    // anoitece depois de chegar
    if (C.arrived) { C.night = Math.min(1, C.night + dt * .12); paintSky(C.night); hemi.intensity = 2 - C.night * 1.4; sunL.intensity = 1.4 * (1 - C.night); }
    // rangidos
    creakT -= dt; if (creakT <= 0) { creakT = 4 + rnd() * 5; E.tone(140 + rnd() * 60, .6, .02, 'sawtooth', null, 0, 0, 100); }
    if (L.glitchT > 0) L.glitchT -= dt;
    L.glitch = L.glitchT > 0 ? .5 : 0;
    E.osd('▶ PLAY', C.arrived ? 'REGISTRO 1491 · TERRA FIRME' : C.helm ? `${rumoTxt()} · ${Math.round(C.D * 3)} LÉGUAS` : `REGISTRO 1491 · RUMO ${String(Math.round(((C.H * 180 / Math.PI) % 360 + 360) % 360)).padStart(3, '0')}° · ${Math.round(C.D * 3)} LÉGUAS`);
  };
  function arrive() {
    E.conquista('navegador');
    C.arrived = true; C.helm = false; L.speed = 1.9;
    C.flag.visible = C.pole.visible = true;
    E.glitchText('12 OUT 1491', .7);
    E.later(1.2, () => v('d_eu_falei', 'DOURADEX: Eu falei. Era por ali.', douradex));
    E.later(4.5, () => v('c_ninguem', 'COLOMBO: Ninguém vai acreditar nisso.', colombo));
    E.later(7.5, () => E.note(`<small>ARQUIVO PASSAREX · REGISTRO 1491</small><h2>Um ano antes de Colombo</h2>
      <p>Terra firme do outro lado do oceano. O Douradex fincou uma bandeira dourada na areia. O pássaro do mastro assobiou uma vez e não disse mais nada.</p>
      <p>Um ano depois, em 1492, Colombo voltou. E a fama ficou toda com ele.</p>
      <p class="hand">nenhum livro de história confirma o fiu fiu</p>`));
    E.later(9, () => { px.removeFromParent(); const sil = E.add(E.sticker(1.1, { sil: true, eyes: true, s: .1 })); sil.position.set(0, 11.9, -1.5); E.whistle(.09, { pan: E.pan(sil.position) }); });
    E.trigger(() => !S.noteOpen && C.night > .55, () => { L.glitchT = 1; E.glitchText('SINAL PERDIDO', .8); E.later(.6, () => E.goTo('salabranca')); });
  }
  L.exit = () => { L.speed = 1.9; L.roll = 0; };
  L.hint = () => {
    if (C.arrived) return { text: 'Você chegou. Feche a nota e espere a fita.', target: null };
    if (!C.talked.tonho && !C.helm) return { text: 'O Tonho está no leme, lá em cima, na popa. Fale com ele.', target: new THREE.Vector3(0, 2.1, 6.5) };
    if (!C.helm) return { text: 'Pegue o leme e siga o fiu fiu.', target: new THREE.Vector3(0, 2.1, 6.5) };
    const rel = wrap(C.T - C.H);
    return { text: Math.abs(rel) < OK ? 'Você está no rumo certo. Segure firme.' : rel > 0 ? 'Vire para a direita [D]. O fiu fiu vem de lá.' : 'Vire para a esquerda [A]. O fiu fiu vem de lá.', target: null };
  };
  L.debug = { C, arrive };
}
