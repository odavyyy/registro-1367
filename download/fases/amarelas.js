// FASE 2 · As salas amarelas. Dentro da casinha não tem casinha: tem um labirinto de salas iguais.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(1367);
  E.scene.background = new THREE.Color(0xb3a466);
  E.scene.fog = new THREE.FogExp2(0xbcae6e, .05);
  E.camera.far = 60;
  L.floor = 'carpet'; L.speed = 1.8; L.eye = 1.6;
  E.osd('▶ PLAY', 'REGISTRO 1367 · ??/??/??');
  L.music = 'trilha'; L.musicVol = 0.1;
  L.clock = t => Math.floor(t * 2) % 9 === 0 ? '--:--' : '03:33';
  const { lam, basic } = E;

  const N = 8, CS = 4.5, H = 2.8, half = N * CS / 2;
  L.rect = { x0: -half, x1: half, z0: -half, z1: half };
  const cx = i => -half + CS / 2 + i * CS, cz = j => -half + CS / 2 + j * CS;
  const cellOf = (x, z) => [Math.max(0, Math.min(N - 1, Math.floor((x + half) / CS))), Math.max(0, Math.min(N - 1, Math.floor((z + half) / CS)))];

  /* labirinto: DFS e depois abre paredes extras (backrooms são abertos) */
  const vW = [...Array(N - 1)].map(() => Array(N).fill(true));   // parede entre (i,j) e (i+1,j)
  const hW = [...Array(N)].map(() => Array(N - 1).fill(true));   // parede entre (i,j) e (i,j+1)
  {
    const seen = [...Array(N)].map(() => Array(N).fill(false)), st = [[0, N - 1]]; seen[0][N - 1] = true;
    while (st.length) {
      const [i, j] = st[st.length - 1];
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [i + a, j + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && !seen[a][b]);
      if (!nb.length) { st.pop(); continue; }
      const [a, b] = nb[(rnd() * nb.length) | 0];
      if (a !== i) vW[Math.min(a, i)][j] = false; else hW[i][Math.min(b, j)] = false;
      seen[a][b] = true; st.push([a, b]);
    }
    for (let i = 0; i < N - 1; i++) for (let j = 0; j < N; j++) if (vW[i][j] && rnd() < .3) vW[i][j] = false;
    for (let i = 0; i < N; i++) for (let j = 0; j < N - 1; j++) if (hW[i][j] && rnd() < .3) hW[i][j] = false;
    // um salão grande no meio
    for (let i = 3; i <= 4; i++) for (let j = 2; j <= 4; j++) { if (i < 4) vW[i][j] = false; if (j < 4) hW[i][j] = false; }
  }
  const open = (i, j, a, b) => {
    if (a < 0 || b < 0 || a >= N || b >= N) return false;
    if (a !== i) return !vW[Math.min(a, i)][j];
    return !hW[i][Math.min(b, j)];
  };
  function bfs(from) {
    const dist = [...Array(N)].map(() => Array(N).fill(-1)), prev = {};
    const q = [from]; dist[from[0]][from[1]] = 0;
    while (q.length) {
      const [i, j] = q.shift();
      for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (open(i, j, a, b) && dist[a][b] < 0) { dist[a][b] = dist[i][j] + 1; prev[a + ',' + b] = [i, j]; q.push([a, b]); }
    }
    return { dist, prev };
  }

  /* materiais */
  const wallTex = E.canvasTex(32, 64, (g, w, h) => {
    g.fillStyle = '#d4c77e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c1b46c';
    for (let y = -8; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.fillRect(x + 1, y + (x % 16 ? 2 : 6), 2, 2); g.fillRect(x + 3, y + 4, 2, 2); g.fillRect(x + 5, y + (x % 16 ? 6 : 2), 2, 2); }
    E.speckle(g, w, h, 90, ['#c9bc74', '#ddd18a']);
    g.fillStyle = '#9a8a4c'; g.fillRect(0, h - 3, w, 3);
  }, [4, 1]);
  const carpet = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#a99559'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 400, ['#9c8850', '#b5a265', '#93804a']); }, [N * 3, N * 3]);
  const tiles = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#ddd5ae'; g.fillRect(0, 0, w, h); g.fillStyle = '#b9b08a'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); E.speckle(g, w, h, 80, ['#cfc7a0', '#e6dfba']); }, [N * 3, N * 3]);
  const wallMat = lam({ map: wallTex });

  const floor = E.add(new THREE.Mesh(new THREE.PlaneGeometry(N * CS, N * CS), lam({ map: carpet }))); floor.rotation.x = -Math.PI / 2;
  const ceil = E.add(new THREE.Mesh(new THREE.PlaneGeometry(N * CS, N * CS), lam({ map: tiles }))); ceil.rotation.x = Math.PI / 2; ceil.position.y = H;
  E.box(N * CS + .3, H, .3, wallMat, 0, H / 2, -half - .15); E.box(N * CS + .3, H, .3, wallMat, 0, H / 2, half + .15);
  E.box(.3, H, N * CS + .3, wallMat, -half - .15, H / 2, 0); E.box(.3, H, N * CS + .3, wallMat, half + .15, H / 2, 0);
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < N; j++) if (vW[i][j]) E.box(.24, H, CS + .24, wallMat, -half + (i + 1) * CS, H / 2, cz(j), { solid: true });
  for (let i = 0; i < N; i++) for (let j = 0; j < N - 1; j++) if (hW[i][j]) E.box(CS + .24, H, .24, wallMat, cx(i), H / 2, -half + (j + 1) * CS, { solid: true });

  // lâmpadas fluorescentes
  const panelOn = basic({ color: 0xfffbe2 }), panelOff = basic({ color: 0x6f6a48 });
  const panels = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const m = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.7, 1.4), rnd() < .1 ? panelOff : panelOn));
    m.rotation.x = Math.PI / 2; m.position.set(cx(i), H - .03, cz(j)); panels.push(m);
  }
  const amb = E.add(new THREE.AmbientLight(0xfff0c0, 1.5));
  const hemi = E.add(new THREE.HemisphereLight(0xfff6d6, 0x7a6a35, 1.6));

  /* início e saída */
  const start = [0, N - 1], exit = [N - 1, 0];
  L.spawn = { x: cx(start[0]), z: cz(start[1]) + 1, yaw: 0 };
  // a porta rosa por onde você entrou (atrás de você)
  E.box(.95, 2.05, .08, lam({ color: 0x9fcfe0 }), cx(0), 1.03, half - .02);
  E.interact(E.hitbox(1, 2, .3, cx(0), 1, half - .1), { label: () => '[E] Porta', act: () => { E.sfx.knob(); E.say('(Não abre. Do outro lado era a casinha.)', 3); } });
  // a saída: porta pastel com arco-íris, num mundo amarelo ela brilha
  const exitX = cx(exit[0]), exitZ = -half;
  const arch = E.canvasTex(48, 24, g => {
    ['#ff8f9f', '#ffc07a', '#fff07a', '#9fe39a', '#8fc8ff', '#c79bff'].forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(24, 24, 22 - k * 3, Math.PI, 0); g.stroke(); });
  });
  const archM = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8, .9), basic({ map: arch, transparent: true, alphaTest: .5, fog: false })));
  archM.position.set(exitX, 2.35, exitZ + .17);
  const exitDoor = E.box(1, 2.05, .08, basic({ color: 0xf6c1d6, fog: false }), exitX, 1.03, exitZ + .18);
  E.box(.08, .08, .06, basic({ color: 0xf0d070, fog: false }), exitX + .32, 1.0, exitZ + .24, { occ: false });
  const exitPos = new THREE.Vector3(exitX, 1.3, exitZ + .6);
  E.interact(exitDoor, { label: () => '[E] Abrir a porta do arco-íris', act: () => { E.sfx.creak(); E.goTo('vilasol'); } });

  /* o desenho de criança perto do começo */
  const draw = E.canvasTex(64, 48, g => {
    g.fillStyle = '#f7f3e8'; g.fillRect(0, 0, 64, 48);
    g.save(); g.translate(18, 44); g.scale(.05, .05); window.drawPassarex(g, 1.6, {}); g.restore();
    g.fillStyle = '#d23c3c'; g.font = 'bold 8px monospace'; g.fillText('ACHA AS', 30, 16); g.fillText('3 PENAS', 30, 26);
    g.strokeStyle = '#4e4358'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(34 + k * 9, 40); g.lineTo(38 + k * 9, 32); g.stroke(); }
  });
  const drawing = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.8, .6), basic({ map: draw })));
  drawing.rotation.y = Math.PI / 2; drawing.position.set(-half + .02, 1.5, cz(N - 1) - .6);
  E.interact(drawing, { label: () => '[E] Desenho', act: () => E.say('(“Acha as 3 penas”. Letra de criança.)', 3.5) });

  /* penas: escondidas nos becos sem saída */
  const { dist: dStart } = bfs(start);
  const ends = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const deg = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => open(i, j, a, b)).length;
    if ((i !== start[0] || j !== start[1]) && (i !== exit[0] || j !== exit[1])) ends.push({ i, j, deg, d: dStart[i][j] });
  }
  ends.sort((a, b) => (a.deg - b.deg) || (b.d - a.d));
  const picks = [];
  for (const c of ends) { if (picks.every(p => Math.abs(p.i - c.i) + Math.abs(p.j - c.j) > 3)) picks.push(c); if (picks.length === 3) break; }
  const featherTex = E.canvasTex(16, 32, g => {
    g.fillStyle = '#6a5a78'; g.beginPath(); g.ellipse(8, 14, 5, 12, .15, 0, 7); g.fill();
    g.fillStyle = '#4e4358'; g.beginPath(); g.ellipse(8, 16, 3, 9, .15, 0, 7); g.fill();
    g.strokeStyle = '#efe4f0'; g.lineWidth = 1; g.beginPath(); g.moveTo(9, 2); g.lineTo(7, 31); g.stroke();
  });
  const glowTex = E.canvasTex(32, 32, g => { const r = g.createRadialGradient(16, 16, 1, 16, 16, 16); r.addColorStop(0, 'rgba(255,250,220,.9)'); r.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });
  const feathers = picks.map((c, idx) => {
    const g = E.add(new THREE.Group()); g.position.set(cx(c.i) + (rnd() - .5) * 1.5, 1.0, cz(c.j) + (rnd() - .5) * 1.5);
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(.22, .44), basic({ map: featherTex, transparent: true, alphaTest: .5, side: THREE.DoubleSide, fog: false })));
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, fog: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 }));
    gl.scale.set(.9, .9, 1); g.add(gl);
    E.interact(g, { label: () => '[E] Pegar a pena', act: () => takeFeather(g, idx) });
    if ((S.flags.penas || []).includes(idx)) { g.visible = false; E.unInteract(g); }   // já pega num save anterior
    return g;
  });
  function takeFeather(g, idx) {
    g.visible = false; E.unInteract(g); S.penas++; E.sfx.chime();
    S.flags.penas = [...(S.flags.penas || []), idx]; E.save(); if (S.penas >= 3) E.conquista('penas');
    E.say(`(Uma pena cinza-arroxeada. ${S.penas}/3)`, 3);
    if (S.penas === 3) E.later(3.2, () => { E.say('(Três penas. Todas iguais às dele.)', 3.5); E.whistle(.05, { delay: .8 }); });
  }

  /* telefone no chão do salão */
  const phonePos = new THREE.Vector3(cx(3) + .6, 0, cz(3) + .4);
  const phone = E.add(new THREE.Group()); phone.position.copy(phonePos);
  E.box(.24, .08, .18, lam({ color: 0x8a2b26 }), 0, .04, 0, { parent: phone });
  const handset = E.box(.26, .05, .07, lam({ color: 0x8a2b26 }), 0, .11, 0, { parent: phone });
  const C = { ringing: false, answered: false, ringT: 0, pxI: 0, pxGone: 0, lookT: 0, counted: false, flick: 0, nextFlick: 6 };
  E.interact(phone, { label: () => C.ringing ? '[E] Atender' : 'Telefone', act: () => { if (C.ringing) answer(); } });
  E.trigger(p => Math.hypot(p.x - phonePos.x, p.z - phonePos.z) < 7, () => { C.ringing = true; });
  function answer() {
    C.ringing = false; C.answered = true; handset.position.y = .35; E.sfx.pick();
    const ph = (id, text) => E.voice(id, text, 'tv', { vol: .9 }) + .4;
    E.later(.3, () => {
      const t1 = ph('p_alo', 'Alô, amiguinho? Você tá indo muito bem.');
      E.later(t1, () => {
        const t2 = ph('p_zumbido', 'Tá ouvindo o zumbido? A saída zumbe mais alto.');
        E.later(t2, () => {
          const t3 = ph('p_nao_olha', 'Ah... e se ele aparecer no fim do corredor, não fica olhando.');
          E.later(t3, () => { handset.position.y = .11; E.noiseHit(.05, .4, 1500); E.toast('Ache a porta do arco-íris<small>penas: opcional</small>'); });
        });
      });
    });
  }

  /* ele, no fim do corredor (some quando você chega perto) */
  const midCells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (dStart[i][j] >= 4 && dStart[i][j] <= 12 && !(i === 3 && j === 3)) midCells.push([i, j]);
  const spots = [0, 1, 2, 3].map(() => midCells[(rnd() * midCells.length) | 0]);
  const px = E.add(E.sticker(1.75, { sil: true, eyes: true, s: .14 }));
  const placePx = k => { const [i, j] = spots[k % spots.length]; px.position.set(cx(i), 0, cz(j)); px.visible = true; };
  placePx(0);

  /* a fuga: perto da saída, ele te acha e vem atrás (bem devagar) */
  const { dist: dExit } = bfs(exit);
  const CH = { phase: 'idle', speed: 1.45, t: 0, retarget: 0, target: null, cp: null, deaths: 0, beat: 0, wh: 1 };
  const chaser = E.add(E.sticker(1.95, { sil: true, eyes: true, s: .14 })); chaser.visible = false;
  const nbs = (i, j) => [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => open(i, j, a, b));
  // uma sala 2-3 passos atrás de você (mais longe da saída do que você)
  function behind(cell) {
    const { dist } = bfs(cell), d0 = dExit[cell[0]][cell[1]];
    let best = null, bs = -1e9;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const d = dist[i][j]; if (d < 2 || d > 3) continue;
      const sc = (dExit[i][j] > d0 ? 100 : 0) + dExit[i][j] + d;
      if (sc > bs) { bs = sc; best = [i, j]; }
    }
    return best || cell;
  }
  function placeChaser() {
    const p = E.player.pos, bc = behind(cellOf(p.x, p.z));
    chaser.position.set(cx(bc[0]), 0, cz(bc[1]));
  }
  E.trigger(p => { const [i, j] = cellOf(p.x, p.z); return dExit[i][j] <= 6 && dStart[i][j] >= 4; }, () => startChase());
  function startChase() {
    const p = E.player.pos;
    CH.cp = { x: p.x, z: p.z, yaw: E.player.yaw };
    E.save({ pos: CH.cp });   // checkpoint: se fechar o jogo, volta daqui
    CH.phase = 'intro'; C.flick = 1.4; amb.color.setHex(0xff8070); px.visible = false; C.pxGone = 1e9;
    E.voice('p_achei', 'Achei você.', 'tv', { vol: 1.3 }); E.glitchText('ACHEI VOCÊ', .6);
    E.later(1.8, () => {
      placeChaser(); chaser.visible = true; CH.phase = 'run'; CH.t = 0;
      E.voice('p_corre', 'Corre, amiguinho. Corre!', 'tv', { vol: 1.2 });
      E.toast('CORRE!<small>Shift para correr · siga para a porta do arco-íris</small>');
      const h = L.hint(); if (h && h.path) E.guide(h.path);
    });
  }
  function updateChase(dt) {
    if (CH.phase === 'film') {   // só para o trailer: ele vem em linha reta até você
      const p = E.player.pos, dx = p.x - chaser.position.x, dz = p.z - chaser.position.z, d = Math.hypot(dx, dz);
      if (d > CH.stop) { chaser.position.x += dx / d * CH.filmSpeed * dt; chaser.position.z += dz / d * CH.filmSpeed * dt; }
      chaser.children.forEach(c => { c.position.x = (Math.random() - .5) * .05; });
      L.glitch = (1 - Math.min(1, d / 8)) * .8;
      if (d < 4 && Math.random() < .02) { const m = panels[(Math.random() * panels.length) | 0]; m.material = m.material === panelOn ? panelOff : panelOn; }
      return;
    }
    if (CH.phase !== 'run' || S.dead) return;
    const p = E.player.pos;
    CH.t += dt; CH.retarget -= dt;
    if (CH.retarget <= 0) {
      CH.retarget = .3;
      const pc = cellOf(p.x, p.z), cc = cellOf(chaser.position.x, chaser.position.z);
      if (pc[0] === cc[0] && pc[1] === cc[1]) CH.target = null;
      else {
        const { dist } = bfs(pc);
        const n = nbs(cc[0], cc[1]).filter(([a, b]) => dist[a][b] >= 0).sort((A, B) => dist[A[0]][A[1]] - dist[B[0]][B[1]]);
        CH.target = n.length ? new THREE.Vector3(cx(n[0][0]), 0, cz(n[0][1])) : null;
      }
    }
    const tx = CH.target ? CH.target.x : p.x, tz = CH.target ? CH.target.z : p.z;
    const dx = tx - chaser.position.x, dz = tz - chaser.position.z, d = Math.hypot(dx, dz);
    if (d > .05) { const sp = Math.min(d, CH.speed * dt); chaser.position.x += dx / d * sp; chaser.position.z += dz / d * sp; }
    chaser.children.forEach(c => { c.position.x = (Math.random() - .5) * .05; });
    const dp = Math.hypot(p.x - chaser.position.x, p.z - chaser.position.z);
    CH.beat -= dt; if (CH.beat <= 0) { CH.beat = .32 + Math.min(1, dp / 10) * .6; E.tone(62, .2, .06 + .3 * (1 - Math.min(1, dp / 14)), 'sine', null, 0, 0, 38); }
    CH.wh -= dt; if (CH.wh <= 0) { CH.wh = 2 + Math.random(); E.whistle(.07 * E.near(chaser.position, 4, 1), { pan: E.pan(chaser.position), pitch: .85 }); }
    L.glitch = Math.max(L.glitch || 0, (1 - Math.min(1, dp / 7)) * .75);
    if (dp < 4 && Math.random() < .02) { const m = panels[(Math.random() * panels.length) | 0]; m.material = m.material === panelOn ? panelOff : panelOn; }
    if (dp < .8) {
      CH.phase = 'dead'; CH.deaths++; chaser.visible = false;
      E.die(() => {
        const cp = CH.cp; E.player.pos.set(cp.x, 0, cp.z); E.player.yaw = cp.yaw;
        CH.speed = Math.max(1.05, 1.45 - CH.deaths * .15);
        placeChaser(); CH.phase = 'wait';
        E.later(2.2, () => { chaser.visible = true; CH.phase = 'run'; E.voice('p_corre', 'Corre, amiguinho. Corre!', 'tv', { vol: 1.2 }); });
      });
    }
    if (CH.t > 45) {
      CH.phase = 'done'; chaser.visible = false; amb.color.setHex(0xfff0c0); L.glitch = 0;
      E.voice('p_dessa_vez', 'Dessa vez.', 'tv');
    }
  }

  /* som */
  let exitG = null, ringG = null;
  L.ambience = bus => {
    const ac = E.ac();
    const o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 120;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    const g = E.gain(.018, bus); o1.connect(f).connect(g); o1.start();
    const o2 = ac.createOscillator(); o2.frequency.value = 240; o2.connect(E.gain(.006, bus)); o2.start();
    E.loopNoise('lowpass', 300, 0, .03, bus);
    exitG = E.gain(0, bus);
    const o3 = ac.createOscillator(); o3.type = 'sawtooth'; o3.frequency.value = 180; const f3 = ac.createBiquadFilter(); f3.type = 'lowpass'; f3.frequency.value = 700;
    o3.connect(f3).connect(exitG); o3.start();
    ringG = E.gain(0, bus);
    const am = ac.createGain(); am.gain.value = .5; const lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 20;
    const lg = ac.createGain(); lg.gain.value = .5; lfo.connect(lg).connect(am.gain); lfo.start();
    for (const fr of [440, 480]) { const o = ac.createOscillator(); o.frequency.value = fr; o.connect(am); o.start(); }
    am.connect(ringG);
  };

  L.enter = () => {
    E.later(5, () => E.tutorial('amarelas', 'As salas amarelas', [['Shift', '🏃', 'correr'], ['H', '💡', 'o passarinho guia mostra a saída'], ['E', '✋', 'pegar as penas escondidas (3)'], ['não olhe', '', 'se ele aparecer no fim do corredor, não fique olhando']], 'Ache a saída: a porta com arco-íris. Perto dela, ele vai correr atrás de você.'));
    E.later(1, () => E.voice('n_amarelas', 'Nenhuma planta da casa tem esses corredores.', 'nar'));
    E.later(5, () => { E.say('(Isso não é a casinha.)', 3); E.toast('As salas amarelas<small>explore · [H] dica</small>'); });
  };
  const tmp = new THREE.Vector3();
  L.update = dt => {
    const p = E.player.pos;
    if (exitG) exitG.gain.value = Math.min(.05, .9 / (1 + Math.hypot(p.x - exitPos.x, p.z - exitPos.z) ** 1.3));
    if (ringG) {
      if (C.ringing) { C.ringT += dt; ringG.gain.value = (C.ringT % 4 < 1.6 ? .1 : 0) * Math.min(1, 3 / (1 + p.distanceTo(phonePos))); }
      else ringG.gain.value = 0;
    }
    if (C.ringing) phone.position.x = phonePos.x + (C.ringT % 4 < 1.6 ? (Math.random() - .5) * .008 : 0);
    // penas flutuam e giram
    feathers.forEach((g, k) => { g.position.y = 1 + Math.sin(L.t * 2 + k) * .08; g.children[0].rotation.y += dt * 1.2; });
    // piscadas das lâmpadas
    C.nextFlick -= dt;
    if (C.nextFlick <= 0) {
      C.flick = .18 + Math.random() * .25; C.nextFlick = 6 + Math.random() * 9; E.noiseHit(.15, .08, 4000, null, 'highpass');
      if (C.answered && !C.flashed && CH.phase === 'idle' && Math.random() < .5) { C.flashed = true; E.flash(); }
    }
    if (C.flick > 0) {
      C.flick -= dt; const off = Math.floor(C.flick / .2) % 2 === 0;   // no máximo ~2,5 piscadas por segundo (seguro p/ fotossensibilidade)
      amb.intensity = off ? .85 : 1.5; hemi.intensity = off ? .85 : 1.6;
      panels.forEach((m, k) => { if (k % 3 === 0) m.material = off ? panelOff : panelOn; });
      if (C.flick <= 0) { amb.intensity = 1.5; hemi.intensity = 1.6; panels.forEach((m, k) => { if (k % 3 === 0) m.material = panelOn; }); }
    }
    L.glitch = 0;
    updateChase(dt);
    // ele no fim do corredor
    if (CH.phase !== 'idle') { /* durante a fuga ele está atrás de você */ }
    else if (px.visible) {
      const d = Math.hypot(p.x - px.position.x, p.z - px.position.z);
      const look = E.looking(tmp.set(px.position.x, 1.4, px.position.z), .95);
      if (look) {
        C.lookT += dt;
        if (C.lookT > 2.2 && !C.counted) { C.counted = true; S.noticed++; E.say('(Não fica olhando.)', 2.5); }
      }
      if ((look && d < 9) || d < 4) {
        px.visible = false; C.pxGone = 18 + Math.random() * 10; C.flick = .3; E.whistle(.04, { pan: E.pan(px.position) });
      }
    } else if (C.pxGone > 0) { C.pxGone -= dt; if (C.pxGone <= 0) { C.pxI++; placePx(C.pxI); if (Math.hypot(p.x - px.position.x, p.z - px.position.z) < 10) px.visible = false, C.pxGone = 5; } }
  };
  L.debug = { CH, chaser, startChase, film(x, z, speed = 2.2, stop = 1.4) { chaser.position.set(x, 0, z); chaser.visible = true; Object.assign(CH, { phase: 'film', filmSpeed: speed, stop }); } };
  /* segredo do Clubex: um quadro onde não devia ter quadro */
  { const q = E.add(E.quadro('homemDistinto', .7, .95, '#efe6c8', 'EU SEI.')); q.position.set(-half + .08, 1.6, cz(start[1]) + 1.15); q.rotation.y = Math.PI / 2;
    E.ovo('distinto', q, 'Quadro', () => E.say('(O Homem-Distinto, guardião dos portões. Enquanto todo mundo pergunta “que isso?”, ele já sabe.)', 4.5)); }
  E.moedas([[cx(1), null, cz(7)], [cx(3), null, cz(5)], [cx(3), null, cz(3)], [cx(6), null, cz(1)], [cx(5), null, cz(5)]]);
  L.hint = () => {
    const p = E.player.pos;
    if (C.ringing && p.distanceTo(phonePos) < 12) return { text: 'Atende o telefone no salão.', target: phonePos.clone().setY(.4) };
    const { prev } = bfs(cellOf(p.x, p.z));
    const path = []; let c = exit;
    while (c) { path.unshift(new THREE.Vector3(cx(c[0]), 1.4, cz(c[1]))); c = prev[c[0] + ',' + c[1]]; }
    path.push(exitPos.clone());
    const pen = S.penas < 3 ? ` (Penas: ${S.penas}/3, são opcionais.)` : '';
    return { text: 'Siga o zumbido até a porta com arco-íris.' + pen, path: path.slice(1, 7) };
  };
}
