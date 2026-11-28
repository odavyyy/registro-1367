// FASE 3 · A sala de brincar. Paredes de nuvem, colunas, bolinhas, arco-íris e oito portas. Escolha uma.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(88);
  E.scene.background = new THREE.Color(0xc4dbe6);
  E.scene.fog = new THREE.FogExp2(0xcfe2ea, .022);
  E.camera.far = 80;
  L.floor = 'carpet'; L.speed = 1.9; L.eye = 1.6;
  E.osd('▶ PLAY', 'REGISTRO 1367 · ??/??/??');
  L.music = 'trilha'; L.musicVol = 0.2;
  L.clock = () => '00:00';
  const { lam, basic, box } = E;
  const X = 12, Z = 10, HT = 7, MZ = 3.4;    // salão 24 x 20 com mezanino ao fundo
  L.rect = { x0: -X, x1: X, z0: -Z, z1: Z };
  L.spawn = { x: 0, z: 7.5, yaw: 0 };

  const clouds = E.canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#a9c7da'; g.fillRect(0, 0, w, h);
    E.speckle(g, w, h, 200, ['#a1bfd3', '#b2cfe0']);
    g.fillStyle = '#eef6fa';
    for (const [x, y] of [[12, 14], [44, 40], [30, 56]]) { g.beginPath(); g.ellipse(x, y, 9, 4, 0, 0, 7); g.ellipse(x + 7, y - 2, 6, 4, 0, 0, 7); g.ellipse(x - 6, y + 1, 5, 3, 0, 0, 7); g.fill(); }
  }, [5, 2]);
  const wallM = lam({ map: clouds }), whiteM = lam({ color: 0xeef3f4 });
  const floorT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#8cc7a0'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 160, ['#84bf98', '#96d1aa']); }, [16, 14]);
  const fl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2 * X, 2 * Z), lam({ map: floorT }))); fl.rotation.x = -Math.PI / 2;
  const ce = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2 * X, 2 * Z), basic({ color: 0xc9dbe4 }))); ce.rotation.x = Math.PI / 2; ce.position.y = HT;
  box(2 * X + .4, HT, .4, wallM, 0, HT / 2, -Z - .2); box(2 * X + .4, HT, .4, wallM, 0, HT / 2, Z + .2);
  box(.4, HT, 2 * Z + .4, wallM, -X - .2, HT / 2, 0); box(.4, HT, 2 * Z + .4, wallM, X + .2, HT / 2, 0);
  // mezanino (inalcançável, como no sonho)
  box(2 * X, .4, 5, whiteM, 0, MZ, -Z + 2.5);
  box(2 * X, 1.0, .3, whiteM, 0, MZ + .7, -Z + 5);
  const archUp = E.canvasTex(32, 48, g => {
    g.fillStyle = '#2a3440'; g.beginPath(); g.moveTo(6, 48); g.lineTo(6, 18); g.arc(16, 18, 10, Math.PI, 0); g.lineTo(26, 48); g.fill();
    ['#ff8f9f', '#ffd07a', '#9fe39a', '#8fc8ff'].forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.arc(16, 18, 12 + k * 2, Math.PI, 0); g.stroke(); });
  });
  for (const ax of [-8, 0, 8]) { const a = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), basic({ map: archUp, transparent: true, alphaTest: .5 }))); a.position.set(ax, MZ + 1.4, -Z + .02); }
  // colunas
  for (const [x, z, r] of [[-5, -5, .5], [5, -5, .5], [2, 1.5, .75]]) {
    const c = E.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, HT, 12), whiteM)); c.position.set(x, HT / 2, z); L.occluders.push(c); E.circle(x, z, r);
  }
  // paredes soltas que escondem o caminho
  box(.45, HT, 5, whiteM, -7.5, HT / 2, 4, { solid: true });
  box(5, HT, .45, whiteM, 7.5, HT / 2, 2.5, { solid: true });
  E.add(new THREE.HemisphereLight(0xf2f8ff, 0xc8dcd2, 2.2));
  const dl = E.add(new THREE.DirectionalLight(0xffffff, .8)); dl.position.set(-5, 10, 6);

  /* arco-íris de brinquedo */
  const RB = [0xe8505a, 0xf39a3a, 0xf3d84a, 0x6cc46a, 0x5a9be0, 0x9a6ad0];
  function rainbow(x, z, s, ry) {
    const g = E.add(new THREE.Group()); g.position.set(x, 0, z); g.rotation.y = ry;
    RB.forEach((c, k) => { const m = new THREE.Mesh(new THREE.TorusGeometry((1 - k * .14) * s, .07 * s, 6, 16, Math.PI), lam({ color: c })); g.add(m); });
    E.circle(x + Math.cos(ry) * s * .8, z - Math.sin(ry) * s * .8, .25 * s); E.circle(x - Math.cos(ry) * s * .8, z + Math.sin(ry) * s * .8, .25 * s);
  }
  rainbow(9, -7.5, 1.4, -.4); rainbow(-3, 6.5, .8, .3); rainbow(-9, -2, 1.1, 1.3);

  /* bolinhas (dá pra chutar) */
  const BC = [0xe8505a, 0xf3d84a, 0x8fc8ff, 0x9fe3aa, 0xc79bff, 0xffffff, 0xf39a3a];
  const balls = [];
  for (let i = 0; i < 18; i++) {
    const r = .18 + rnd() * .16;
    const m = E.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), lam({ color: BC[i % BC.length] })));
    m.position.set((rnd() - .5) * 20, r, (rnd() - .5) * 16);
    balls.push({ m, r, vx: 0, vz: 0, cd: 0 });
  }

  /* as portas */
  const SCENES = {
    praia: g => { const s = g.createLinearGradient(0, 0, 0, 60); s.addColorStop(0, '#f6a07a'); s.addColorStop(1, '#ffd9a8'); g.fillStyle = s; g.fillRect(0, 0, 64, 60); g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(32, 58, 12, Math.PI, 0); g.fill(); g.fillStyle = '#5a8ab0'; g.fillRect(0, 58, 64, 12); g.fillStyle = '#ecd6a8'; g.fillRect(0, 70, 64, 26); },
    navio: g => { g.fillStyle = '#2f4a5e'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#d8c8a0'; g.fillRect(0, 66, 64, 30); g.fillStyle = '#3a2a22'; g.save(); g.translate(32, 66); g.rotate(-.18); g.fillRect(-24, -10, 48, 12); g.fillRect(-2, -42, 3, 34); g.fillStyle = '#e8e0d0'; g.fillRect(2, -40, 14, 16); g.restore(); },
    escada: g => { g.fillStyle = '#f5e6a8'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#e0cc84'; for (let k = 0; k < 8; k++) g.fillRect(8 + k * 5, 90 - k * 9, 56 - k * 5, 9); g.fillStyle = '#6fa8dc'; g.fillRect(46, 10, 12, 20); },
    rua: g => { const s = g.createLinearGradient(0, 0, 0, 50); s.addColorStop(0, '#5a3a6a'); s.addColorStop(1, '#e0907a'); g.fillStyle = s; g.fillRect(0, 0, 64, 50); g.fillStyle = '#3a3a40'; g.beginPath(); g.moveTo(0, 96); g.lineTo(30, 50); g.lineTo(34, 50); g.lineTo(64, 96); g.fill(); g.fillStyle = '#2a7a3a'; g.fillRect(6, 36, 12, 6); g.fillStyle = '#fff'; g.font = '4px monospace'; g.fillText('NAVIRAÍ', 6, 41); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(46, 16, 6, 3, 0, 0, 7); g.fill(); g.fillStyle = '#333'; g.fillRect(45, 15, 2, 2); },
    campo: g => { g.fillStyle = '#f7c3d6'; g.fillRect(0, 0, 64, 60); g.fillStyle = '#8fd17e'; g.beginPath(); g.ellipse(32, 80, 50, 30, 0, 0, 7); g.fill(); g.fillStyle = '#f2b6c4'; g.fillRect(26, 44, 12, 9); g.fillStyle = '#e08aa2'; g.beginPath(); g.moveTo(24, 44); g.lineTo(32, 37); g.lineTo(40, 44); g.fill(); },
    quarto: g => { g.fillStyle = '#c9b8e0'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#a58fc8'; g.fillRect(0, 70, 64, 26); g.fillStyle = '#fff'; g.fillRect(20, 20, 22, 28); g.strokeStyle = '#4e4358'; g.beginPath(); g.arc(31, 32, 5, 0, 7); g.stroke(); g.fillStyle = '#e8a0b0'; g.fillRect(4, 62, 26, 12); },
    vermelho: g => { g.fillStyle = '#8a0c12'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#3a0408'; g.fillRect(14, 50, 36, 3); g.fillStyle = '#f4e2a8'; g.fillRect(22, 34, 3, 3); g.fillRect(39, 34, 3, 3); },
    parede: g => { g.fillStyle = '#b8846a'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#9a6a52'; for (let y = 0; y < 96; y += 6) { g.fillRect(0, y, 64, 1); for (let x = (y / 6) % 2 ? 0 : 8; x < 64; x += 16) g.fillRect(x, y, 1, 6); } },
  };
  const DOORS = [
    { id: 'praia', side: 'W', p: -1.5, rota: 'entardecer', color: 0xf6c1cf, line: '(Uma praia vazia, de tardinha.)' },
    { id: 'navio', side: 'W', p: 5.5, rota: 'noite', color: 0xbfe0f0, line: '(Cheiro de mar. Um navio encalhado.)' },
    { id: 'escada', side: 'E', p: -1.5, rota: 'entardecer', color: 0xfbe3a1, line: '(Uma escada. Lá em cima, uma porta azul.)' },
    { id: 'rua', side: 'E', p: 6, rota: 'noite', color: 0xcbb8ec, line: '(Uma avenida. A placa diz NAVIRAÍ.)' },
    { id: 'campo', side: 'S', p: -6, rota: 'entardecer', color: 0xbfeac0, line: '(As colinas de novo. A casinha rosa.)' },
    { id: 'quarto', side: 'S', p: 6, rota: 'noite', color: 0xf8cfa8, line: '(Um quarto de criança. Uma página de colorir na parede.)' },
    { id: 'vermelho', side: 'N', p: -4, color: 0xf2a6a6, bad: true },
    { id: 'parede', side: 'N', p: 4.5, color: 0xd6d6d6, wall: true },
  ];
  const archTex = E.canvasTex(48, 24, g => { ['#ff8f9f', '#ffc07a', '#fff07a', '#9fe39a', '#8fc8ff', '#c79bff'].forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(24, 24, 22 - k * 3, Math.PI, 0); g.stroke(); }); });
  const frameM = lam({ color: 0xffffff });
  DOORS.forEach(d => {
    const g = E.add(new THREE.Group());
    if (d.side === 'W') { g.position.set(-X, 0, d.p); g.rotation.y = Math.PI / 2; }
    if (d.side === 'E') { g.position.set(X, 0, d.p); g.rotation.y = -Math.PI / 2; }
    if (d.side === 'S') { g.position.set(d.p, 0, Z); g.rotation.y = Math.PI; }
    if (d.side === 'N') { g.position.set(d.p, 0, -Z); }
    d.g = g; g.updateMatrixWorld(true);
    const view = E.canvasTex(64, 96, SCENES[d.id]);
    const peek = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.15), basic({ map: view, fog: false })); peek.position.set(0, 1.08, .02); g.add(peek);
    for (const [w, h, x, y] of [[.12, 2.3, -.61, 1.15], [.12, 2.3, .61, 1.15], [1.34, .12, 0, 2.24]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, .12), frameM); f.position.set(x, y, .06); g.add(f); }
    const a = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .85), basic({ map: archTex, transparent: true, alphaTest: .5 })); a.position.set(0, 2.7, .03); g.add(a);
    const hinge = new THREE.Group(); hinge.position.set(-.55, 0, .07); g.add(hinge);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.15, .06), lam({ color: d.color })); leaf.position.set(.55, 1.08, 0); hinge.add(leaf);
    const knob = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, .07), lam({ color: 0xf0d070 })); knob.position.set(.95, 1.0, .05); hinge.add(knob);
    L.occluders.push(leaf);
    d.hinge = hinge; d.open = 0; d.target = 0; d.locked = false;
    E.interact(leaf, {
      label: () => d.locked ? 'Trancada' : d.target ? (d.wall ? 'Só parede' : '[E] Entrar') : '[E] Abrir a porta',
      act: () => openDoor(d)
    });
    E.interact(peek, { label: () => d.target && !d.wall && !d.locked ? '[E] Entrar' : '', act: () => { if (d.target) openDoor(d); } });
    d.world = new THREE.Vector3(); g.localToWorld(d.world.set(0, 1.2, .8));
  });
  function openDoor(d) {
    if (d.locked) { E.sfx.knob(); return; }
    if (!d.target) {
      d.target = 1; E.sfx.creak();
      if (d.bad) {
        L.redT = 1.2; E.later(.35, () => E.scare(.85, .5));
        E.later(1.3, () => { d.target = 0; d.locked = true; E.noiseHit(.2, .5, 400); S.noticed++; E.voice('p_essa_nao', 'Essa não.', 'tv'); });
        return;
      }
      if (d.wall) { E.say('(Só parede.)', 2.5); return; }
      E.say(d.line, 3.5);
      if (d.id === 'navio' && !S.clues.diario) E.later(.8, () => { paper.visible = true; E.noiseHit(.3, .1, 1200); E.say('(Um papel molhado escorregou pra fora.)', 3); });
      return;
    }
    if (d.wall) return;
    E.choice('Entrar por essa porta?', ['Entrar', 'Ainda não'], 1, 10).then(i => { if (i === 0) finish(d); });
  }
  // o papel do navio (pista 2)
  const navio = DOORS.find(d => d.id === 'navio');
  const paperTex = E.canvasTex(24, 32, g => { g.fillStyle = '#cfc6a8'; g.fillRect(0, 0, 24, 32); g.fillStyle = '#5a6a7a'; for (let y = 4; y < 30; y += 3) g.fillRect(3, y, 8 + (y * 7) % 12, 1); g.fillStyle = 'rgba(80,110,140,.3)'; g.fillRect(10, 14, 14, 18); });
  const paper = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.3, .4), basic({ map: paperTex })));
  { const v = new THREE.Vector3(.5, .012, 1.7); navio.g.localToWorld(v); paper.position.copy(v); }
  paper.rotation.x = -Math.PI / 2; paper.rotation.z = .4; paper.visible = false;
  E.interact(paper, {
    label: () => paper.visible ? '[E] Ler o papel molhado' : '', act: () => {
      if (!paper.visible) return;
      S.clues.diario = true; E.save();
      E.note(`<small>DIÁRIO DE BORDO · PÁGINA SOLTA · SEM DATA</small>
        <h2>Encalhados há três noites</h2>
        <p>O assobio vem da praia sempre que escurece. Dois toques: um que sobe e um que desce. O cozinheiro jura que viu uma ave do tamanho de um homem, parada na areia, olhando o navio.</p>
        <p>Ninguém mais viu. Ninguém confirma.</p>
        <p class="hand">a gente aprendeu a não responder</p>`);
    }
  });

  /* ele, no mezanino, olhando lá de cima */
  const PXS = [[-6, -7.2], [0.5, -7.8], [7, -6.8], [-9.5, -8]];
  const px = E.add(E.sticker(1.75, { outline: true, s: .14 }));
  let pxI = 0, pxLook = 0, pxWas = false;
  const placePx = i => { const [x, z] = PXS[i]; px.position.set(x, MZ + .2, z); };
  placePx(0);

  // atravessar a porta: a fita segue para a avenida de Naviraí (de tardinha ou de noite)
  function finish(d) {
    if (L.leaving) return; L.leaving = true;
    S.rota = d.rota; S.flags.rota = d.rota; S.flags.porta = d.id;
    E.whistle(.06);
    E.glitchText('REGISTRO 1491', .6);
    E.later(.4, () => E.goTo('navio'));   // antes de Naviraí, a fita pula para 1491
  }

  /* som: caixinha de música com eco, ar da sala */
  let mbus = null;
  L.ambience = bus => {
    const ac = E.ac();
    E.loopNoise('highpass', 2500, 0, .006, bus);
    mbus = E.gain(.7, bus);
    const dly = ac.createDelay(1); dly.delayTime.value = .38; const fb = ac.createGain(); fb.gain.value = .38;
    mbus.connect(dly); dly.connect(fb).connect(dly); dly.connect(bus);
  };
  const MEL = [784, 659, 523, 659, 784, 880, 784, 0, 698, 587, 494, 587, 698, 784, 698, 0];
  let noteT = 1, noteI = 0, voiceT = 22;
  const VOZ = [['p_essa', 'Essa? Essa?'], ['p_qualquer', 'Qualquer uma. Todas dão no mesmo lugar.'], ['p_quase', '...quase todas.'], ['p_ainda_aqui', 'Vocês ainda estão aqui?']];
  let voiceI = 0;

  L.enter = () => {
    E.later(1, () => E.voice('n_brinquedo', 'Última sala registrada antes da falha.', 'nar'));
    E.later(5, () => E.voice('p_escolha', 'Escolha uma porta.', 'tv', { pan: E.pan(px.position) }));
    E.later(7, () => E.toast('A sala de brincar<small>escolha uma porta · [H] dica</small>'));
  };
  const tmp = new THREE.Vector3();
  L.update = dt => {
    const p = E.player.pos;
    if (mbus) { noteT -= dt; if (noteT <= 0) { noteT = .55; const f = MEL[noteI++ % MEL.length]; if (f) E.tone(f, 1, .05, 'triangle', mbus, 0, Math.sin(L.t * .5) * 30); } }
    voiceT -= dt; if (voiceT <= 0 && !S.ended) { voiceT = 24 + Math.random() * 10; const [vid, vt] = VOZ[voiceI++ % VOZ.length]; E.voice(vid, vt, 'tv', { pan: E.pan(px.position) }); }
    // portas abrindo
    DOORS.forEach(d => { d.open += (d.target - d.open) * Math.min(1, dt * 5); d.hinge.rotation.y = -d.open * 1.75; });
    // vermelho
    if (L.redT > 0) { L.redT -= dt; L.red = Math.min(.8, L.redT * 1.4); L.glitch = .5; }   // vermelho que apaga suave (sem piscar)
    else { L.red = 0; L.glitch = 0; }
    // bolinhas
    balls.forEach(b => {
      const m = b.m, dx = m.position.x - p.x, dz = m.position.z - p.z, d = Math.hypot(dx, dz);
      b.cd -= dt;
      if (d < b.r + .35 && d > 0) { b.vx = dx / d * 2.4; b.vz = dz / d * 2.4; if (b.cd <= 0) { b.cd = .4; E.sfx.boing(); } }
      m.position.x += b.vx * dt; m.position.z += b.vz * dt;
      const k = Math.max(0, 1 - 1.6 * dt); b.vx *= k; b.vz *= k;
      if (m.position.x < -X + b.r || m.position.x > X - b.r) { b.vx *= -.7; m.position.x = Math.max(-X + b.r, Math.min(X - b.r, m.position.x)); }
      if (m.position.z < -Z + b.r || m.position.z > Z - b.r) { b.vz *= -.7; m.position.z = Math.max(-Z + b.r, Math.min(Z - b.r, m.position.z)); }
      for (const c of L.circles) { const ex = m.position.x - c.x, ez = m.position.z - c.z, ed = Math.hypot(ex, ez); if (ed < c.r + b.r && ed > 0) { m.position.x = c.x + ex / ed * (c.r + b.r); m.position.z = c.z + ez / ed * (c.r + b.r); const dot = b.vx * ex / ed + b.vz * ez / ed; b.vx -= 1.7 * dot * ex / ed; b.vz -= 1.7 * dot * ez / ed; } }
      for (const c of L.colliders) if (m.position.x > c.x0 - b.r && m.position.x < c.x1 + b.r && m.position.z > c.z0 - b.r && m.position.z < c.z1 + b.r) { b.vx *= -.7; b.vz *= -.7; m.position.x += b.vx * dt * 2; m.position.z += b.vz * dt * 2; }
      m.rotation.x += b.vz * dt / b.r; m.rotation.z -= b.vx * dt / b.r;
    });
    // ele no mezanino muda de lugar quando você desvia o olhar
    const look = E.looking(tmp.set(px.position.x, px.position.y + 1.3, px.position.z), .96);
    if (look) pxLook += dt;
    if (!look && pxWas && pxLook > 1.2) { pxI = (pxI + 1 + ((Math.random() * 2) | 0)) % PXS.length; placePx(pxI); pxLook = 0; E.whistle(.03, { pan: E.pan(px.position), delay: .3 }); }
    pxWas = look;
  };
  L.debug = { open: id => openDoor(DOORS.find(d => d.id === id)) };
  /* segredos do Clubex na sala de brincar */
  { const q = E.add(E.quadro('passaroEsferas', 1.1, .85, '#d8ecf4', 'SÓ SE VOCÊ PEDIR')); q.position.set(0, 1.9, Z - .02); q.rotation.y = Math.PI;
    E.ovo('esferas', q, 'Quadro', () => E.say('(O Pássaro das Esferas. Ele concede pedidos, mas só se você pedir.)', 4));
    const or = E.add(E.club('orelha', .75)); or.position.set(3.15, 0, 2.2);
    E.ovo('orelha', E.hitbox(.9, .8, .7, 3.15, .4, 2.2), 'Cachorro?', () => { E.say('ORELHA: Au.', 2.5, 'npc'); E.tone(520, .12, .05, 'square'); E.tone(420, .14, .05, 'square', null, .14); }); }
  E.moedas([[-8, null, 6], [-6, null, -6], [6, null, -5], [3, null, 8]]);
  L.hint = () => {
    if (!S.clues.diario) return { text: 'Uma das portas tem cheiro de mar.', target: navio.world.clone() };
    const p = E.player.pos;
    const ok = DOORS.filter(d => !d.bad && !d.wall && !d.locked).sort((a, b) => a.world.distanceTo(p) - b.world.distanceTo(p));
    return { text: 'Escolha uma porta e entre. Só não confie na vermelha.', target: ok[0].world.clone() };
  };
}
