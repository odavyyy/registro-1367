// FASE 0 · A sala de casa (1997). Achar a fita, colocar no videocassete, ser puxado pela TV.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(7);
  E.scene.background = new THREE.Color(0x05060a);
  E.scene.fog = new THREE.FogExp2(0x05060a, .06);
  L.rect = { x0: -3, x1: 3, z0: -3, z1: 3 };
  L.spawn = { x: 1.9, z: 2.3, yaw: .46, pitch: -.05 };
  L.floor = 'wood';
  E.osd('<span class="rec">● REC</span>', 'OUT. 24 1997 · NAVIRAÍ — MS');
  const { lam, basic, box } = E;

  const C = { hasTape: false, tapeIn: false, tapeT: -1, drawerOpen: false, lampOn: true, ringing: false, ringT: 0, ringIn: -1,
    birdGone: false, tvStaticT: 0, figLookT: 0, figCounted: false, figAwayT: 0, figWas: false, nextLine: 0, noteT: 0, noteIdx: 0, pulled: false };

  const T = {
    wood: E.canvasTex(64, 64, (g, w, h) => {
      g.fillStyle = '#6a4a30'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) {
        g.fillStyle = ['#5f412a', '#715036', '#664630', '#6e4b31'][(y / 16) % 4]; g.fillRect(0, y, w, 15);
        g.fillStyle = '#3a271a'; g.fillRect(0, y + 15, w, 1); g.fillRect(((y * 7) % 48) + 8, y, 1, 15);
      }
      E.speckle(g, w, h, 260, ['#4c3322', '#7d5a3e', '#58402b']);
    }, [6, 6]),
    paper: E.canvasTex(64, 64, (g, w, h) => {
      g.fillStyle = '#c3b48c'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 16) { g.fillStyle = '#b4a47b'; g.fillRect(x, 0, 6, h); }
      for (let i = 0; i < 18; i++) { g.fillStyle = '#9d8762'; const x = (i * 23) % 64, y = (i * 37) % 64; g.fillRect(x + 10, y, 2, 2); }
      E.speckle(g, w, h, 200, ['#b8a982', '#cdbe96', '#a99a72']);
    }, [5, 2]),
    ceiling: E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#b5ad98'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 120, ['#a59d88', '#bfb7a2']); }, [6, 6]),
    rug: E.canvasTex(64, 64, (g, w, h) => {
      g.fillStyle = '#6e2a27'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c9a25d'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8);
      g.strokeStyle = '#2f3a5a'; g.strokeRect(9, 9, w - 18, h - 18);
      E.speckle(g, w, h, 300, ['#5a2220', '#7d3431']);
    }),
    fabric: E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#56603f'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 300, ['#4a5336', '#646f4b']); }, [2, 1]),
    asphalt: E.canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#3a3a3e'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 500, ['#2a2a2e', '#46464a']); }, [20, 20]),
    dark: E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#26221f'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 150, ['#1c1a18', '#302b27']); }),
  };

  /* sala */
  const W = 3, HGT = 2.6, wallMat = lam({ map: T.paper });
  const floor = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), lam({ map: T.wood }))); floor.rotation.x = -Math.PI / 2;
  const ceil = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), lam({ map: T.ceiling }))); ceil.rotation.x = Math.PI / 2; ceil.position.y = HGT;
  box(6.2, HGT, .1, wallMat, 0, HGT / 2, -W - .05);
  box(6.2, HGT, .1, wallMat, 0, HGT / 2, W + .05);
  box(.1, HGT, 6.2, wallMat, W + .05, HGT / 2, 0);
  box(.1, HGT, 1.5, wallMat, -W - .05, HGT / 2, -2.3);
  box(.1, HGT, 3.5, wallMat, -W - .05, HGT / 2, 1.3);
  box(.1, 1.0, 1.2, wallMat, -W - .05, .5, -1.0);
  box(.1, .6, 1.2, wallMat, -W - .05, 2.3, -1.0);
  const frameMat = lam({ color: 0xd8d0bc });
  box(.14, .06, 1.3, frameMat, -W, 1.0, -1.0); box(.14, .06, 1.3, frameMat, -W, 2.0, -1.0);
  box(.14, 1.0, .06, frameMat, -W, 1.5, -1.62); box(.14, 1.0, .06, frameMat, -W, 1.5, -.38);
  box(.1, 1.0, .04, frameMat, -W, 1.5, -1.0, { occ: false }); box(.1, .04, 1.2, frameMat, -W, 1.5, -1.0, { occ: false });
  const glass = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), basic({ color: 0x8aa0c8, transparent: true, opacity: .08 })));
  glass.rotation.y = Math.PI / 2; glass.position.set(-W, 1.5, -1.0);
  const curtMat = lam({ color: 0x8a6f86 });
  box(.06, 1.5, .35, curtMat, -W + .12, 1.65, -1.82); box(.06, 1.5, .35, curtMat, -W + .12, 1.65, -.18);
  E.interact(E.hitbox(.2, 1, 1.2, -W + .1, 1.5, -1.0), {
    label: () => '[E] Olhar a rua',
    act: () => E.say(C.tapeT > 8 ? '(Tem alguém parado lá fora. Não se mexe.)' : '(A rua tá vazia. Só o poste aceso.)', 3.5)
  });
  const rug = E.add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.4), lam({ map: T.rug }))); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .02, -.9);

  // sofá
  const sofaMat = lam({ map: T.fabric });
  box(2.0, .42, .85, sofaMat, 0, .21, 1.05); box(2.0, .55, .22, sofaMat, 0, .62, 1.42);
  box(.2, .62, .9, sofaMat, -1.05, .31, 1.08); box(.2, .62, .9, sofaMat, 1.05, .31, 1.08);
  box(.6, .12, .6, lam({ color: 0x7a6a4a }), -.55, .48, 1.0); box(.6, .12, .6, lam({ color: 0x6a7a5a }), .55, .48, 1.0);
  E.solid(-1.2, 1.2, .55, 1.6);

  // rack, TV, videocassete
  box(1.8, .5, .45, lam({ map: T.dark }), 0, .25, -2.75); E.solid(-.95, .95, -3, -2.45);
  box(.8, .62, .55, lam({ color: 0x3b3833 }), 0, .81, -2.7);
  box(.7, .52, .05, lam({ color: 0x1d1c1a }), 0, .83, -2.43);
  const tvCanvas = document.createElement('canvas'); tvCanvas.width = 160; tvCanvas.height = 120;
  const tvTex = E.texFrom(tvCanvas), tvCtx = tvCanvas.getContext('2d');
  const screen = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.6, .45), basic({ map: tvTex })));
  screen.position.set(0, .83, -2.4);
  const TV_POS = screen.position.clone();
  E.interact(screen, {
    label: () => C.tapeIn ? '' : '[E] Ligar a TV',
    act: () => { if (!C.tapeIn) { E.sfx.click(); E.say('(Só chuvisco. Nenhum canal pega a essa hora.)', 3); C.tvStaticT = 2.5; } }
  });
  const vcrDisp = E.canvasTex(48, 12, g => { g.fillStyle = '#111'; g.fillRect(0, 0, 48, 12); g.fillStyle = '#3f6'; g.font = '10px monospace'; g.fillText('--:--', 10, 10); });
  const dk = lam({ color: 0x222222 });
  const vcr = box(.42, .09, .3, [dk, dk, lam({ color: 0x2a2a2a }), dk, basic({ map: vcrDisp }), dk], .62, .545, -2.68);
  E.interact(vcr, {
    label: () => C.tapeIn ? 'Videocassete (rodando)' : C.hasTape ? '[E] Colocar a fita' : 'Videocassete vazio',
    act: () => { if (C.hasTape && !C.tapeIn) insertTape(); }
  });
  box(.12, .2, .12, lam({ color: 0x9a7b4f }), -.7, .6, -2.75);

  // estante
  const shelfMat = lam({ color: 0x5b4330 }), sx = 2.8, sz = -1.2;
  box(.35, 1.8, .04, shelfMat, sx, .9, sz - .6); box(.35, 1.8, .04, shelfMat, sx, .9, sz + .6);
  for (const y of [.02, .6, 1.2, 1.78]) box(.35, .03, 1.2, shelfMat, sx, y, sz);
  box(.02, 1.8, 1.2, shelfMat, sx + .17, .9, sz);
  E.solid(2.6, 3, -1.85, -.55);
  const spineCols = [0x2a2a2a, 0x1e3a6a, 0x6a1e1e, 0x2a5a2a, 0x3a3a3a, 0xb09a50, 0x222222];
  for (const y of [.035, .615]) {
    let z = sz - .55;
    while (z < sz + .5) { box(.1, .19, .03, lam({ color: spineCols[(rnd() * spineCols.length) | 0] }), sx - .05, y + .095, z, { occ: false }); z += .034 + (rnd() < .15 ? .06 : 0); }
  }
  for (let i = 0; i < 5; i++) box(.2, .14, .14, lam({ color: [0x7a5a3a, 0x3a4a6a, 0x8a3a3a][i % 3] }), sx - .02, 1.285, sz - .4 + i * .16, { occ: false });
  const tapeLabel = E.canvasTex(64, 32, g => {
    g.fillStyle = '#efe7cf'; g.fillRect(0, 0, 64, 32); g.fillStyle = '#f3a9c0'; g.fillRect(0, 0, 64, 6);
    g.fillStyle = '#333'; g.font = '7px monospace'; g.fillText('CANAL DOS', 4, 15); g.fillText('PASSARINHOS', 4, 22);
    g.fillStyle = '#b3261e'; g.font = 'bold 8px monospace'; g.fillText('1367', 38, 30);
  });
  const tb = lam({ color: 0x151515 });
  const tape = E.add(new THREE.Mesh(new THREE.BoxGeometry(.19, .026, .105), [tb, tb, basic({ map: tapeLabel }), tb, tb, tb]));
  tape.position.set(sx - .1, 1.23, sz + .36); tape.rotation.y = .5; tape.scale.setScalar(1.25);
  const tapeHit = E.interact(E.hitbox(.3, .16, .26, tape.position.x, tape.position.y, tape.position.z), {
    label: () => '[E] Pegar a fita', act: () => pickTape()
  });

  // mesinha, gaveta, telefone, abajur
  const tx = -1.6, tz = 1.05, tableMat = lam({ color: 0x6a4c33 });
  box(.5, .04, .5, tableMat, tx, .55, tz);
  for (const [dx, dz] of [[-.22, -.22], [.22, -.22], [-.22, .22], [.22, .22]]) box(.04, .53, .04, tableMat, tx + dx, .265, tz + dz);
  box(.46, .04, .46, tableMat, tx, .3, tz, { occ: false });
  E.solid(tx - .3, tx + .3, tz - .3, tz + .3);
  const drawer = E.add(new THREE.Group()); drawer.position.set(tx, .45, tz);
  const drawerBox = box(.42, .14, .44, lam({ color: 0x5c412b }), 0, 0, 0, { parent: drawer });
  box(.06, .03, .02, lam({ color: 0xc8b070 }), 0, 0, .23, { parent: drawer, occ: false });
  const clipTex = E.canvasTex(32, 40, g => {
    g.fillStyle = '#ddd3b8'; g.fillRect(0, 0, 32, 40); g.fillStyle = '#333'; g.fillRect(3, 3, 26, 4);
    for (let y = 10; y < 38; y += 3) g.fillRect(3, y, 10 + ((y * 5) % 14), 1);
    g.fillStyle = '#555'; g.fillRect(17, 10, 12, 10);
  });
  const clip = new THREE.Mesh(new THREE.PlaneGeometry(.16, .2), basic({ map: clipTex }));
  clip.rotation.x = -Math.PI / 2; clip.rotation.z = .2; clip.position.set(.02, .072, 0); drawer.add(clip);
  E.interact(drawerBox, {
    label: () => C.drawerOpen ? '[E] Fechar a gaveta' : '[E] Abrir a gaveta',
    act: () => { C.drawerOpen = !C.drawerOpen; E.sfx.drawer(); }
  });
  E.interact(clip, { label: () => C.drawerOpen ? '[E] Ler o recorte' : '', act: () => { if (C.drawerOpen) readClip(); } });
  const phone = E.add(new THREE.Group()); phone.position.set(tx + .1, .57, tz - .08);
  box(.2, .07, .16, lam({ color: 0x8a2b26 }), 0, .035, 0, { parent: phone });
  const handset = box(.22, .045, .06, lam({ color: 0x8a2b26 }), 0, .09, 0, { parent: phone });
  E.interact(phone, { label: () => C.ringing ? '[E] Atender' : 'Telefone', act: () => { if (C.ringing) answerPhone(); } });
  const lampBase = box(.12, .3, .12, lam({ color: 0xb89a6a }), tx - .12, .72, tz + .1);
  const shade = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .17, .2, 8, 1, true), basic({ color: 0xffd9a0, side: THREE.DoubleSide })));
  shade.position.set(tx - .12, .95, tz + .1);
  const lampLight = E.add(new THREE.PointLight(0xffb873, 9, 0, 2)); lampLight.position.set(tx - .12, 1.0, tz + .1);
  for (const o of [lampBase, shade]) E.interact(o, { label: () => '[E] Abajur', act: () => { C.lampOn = !C.lampOn; E.sfx.click(); } });

  // porta, quadro, relógio, luz do teto
  const door = box(.9, 2.05, .06, lam({ color: 0x7a5636 }), 1.8, 1.025, W - .02);
  box(.06, .06, .06, lam({ color: 0xc8b070 }), 1.45, 1.0, W - .07, { occ: false });
  E.interact(door, { label: () => '[E] Porta', act: () => { E.sfx.knob(); E.say('(Trancada por fora. Quem trancou?)', 3); } });
  const birdCanvas = empty => E.canvasTex(48, 40, g => {
    g.fillStyle = '#d9e6e8'; g.fillRect(0, 0, 48, 40); g.fillStyle = '#b7cdb0'; g.fillRect(0, 30, 48, 10);
    g.strokeStyle = '#5a4030'; g.lineWidth = 2; g.beginPath(); g.moveTo(2, 26); g.lineTo(40, 20); g.stroke();
    if (!empty) {
      g.fillStyle = '#e8a33a'; g.beginPath(); g.ellipse(24, 16, 6, 5, 0, 0, 7); g.fill();
      g.beginPath(); g.arc(29, 11, 3.5, 0, 7); g.fill();
      g.fillStyle = '#222'; g.fillRect(30, 10, 1, 1); g.fillStyle = '#c55'; g.fillRect(32, 11, 2, 1);
    }
  });
  const birdFull = birdCanvas(false), birdEmpty = birdCanvas(true);
  box(.06, .5, .6, lam({ color: 0x3a2a1a }), W - .03, 1.6, 1.4);
  const picMat = basic({ map: birdFull });
  const pic = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.5, .4), picMat)); pic.rotation.y = -Math.PI / 2; pic.position.set(W - .065, 1.6, 1.4);
  E.interact(pic, { label: () => '[E] Quadro', act: () => E.say(C.birdGone ? '(O galho tá vazio.)' : '(Um passarinho num galho. Sempre esteve aí.)', 3) });
  const clockTex = E.canvasTex(32, 32, g => {
    g.fillStyle = '#e8e0cc'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill();
    g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(16 + Math.sin(a) * 12, 16 - Math.cos(a) * 12, 1, 1); }
    g.strokeStyle = '#222'; g.beginPath(); g.moveTo(16, 16); g.lineTo(16, 7); g.moveTo(16, 16); g.lineTo(20, 19); g.stroke();
  });
  const clock = E.add(new THREE.Mesh(new THREE.CircleGeometry(.16, 12), basic({ map: clockTex }))); clock.position.set(-1.2, 2.0, W - .01); clock.rotation.y = Math.PI;
  box(.3, .05, .3, lam({ color: 0xddd6c2 }), 0, HGT - .03, 0, { occ: false });

  /* lá fora */
  const ground = E.add(new THREE.Mesh(new THREE.PlaneGeometry(60, 60), lam({ map: T.asphalt }))); ground.rotation.x = -Math.PI / 2; ground.position.set(-33, -.02, 0);
  const walk = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.5, 60), lam({ color: 0x8a8478 }))); walk.rotation.x = -Math.PI / 2; walk.position.set(-4.3, 0, 0);
  const poleMat = lam({ color: 0x3a3a3a });
  const pole = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 4.6, 6), poleMat)); pole.position.set(-8, 2.3, -1.6);
  box(.9, .08, .08, poleMat, -7.6, 4.55, -1.6, { occ: false });
  box(.3, .1, .18, basic({ color: 0xffc27a, fog: false }), -7.2, 4.5, -1.6, { occ: false });
  const streetLight = E.add(new THREE.PointLight(0xffa860, 140, 0, 2)); streetLight.position.set(-7.2, 4.2, -1.6);
  const poolTex = E.canvasTex(64, 64, g => {
    const r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,190,120,.85)'); r.addColorStop(.5, 'rgba(255,160,90,.35)'); r.addColorStop(1, 'rgba(255,140,80,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  });
  const poolMat = basic({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const pool = E.add(new THREE.Mesh(new THREE.PlaneGeometry(7, 7), poolMat)); pool.rotation.x = -Math.PI / 2; pool.position.set(-7.2, .02, -1.6);
  const cone = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.15, 2.2, 4.4, 10, 1, true),
    basic({ color: 0x1c1209, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
  cone.position.set(-7.2, 2.3, -1.6);
  for (const [x, z, w, h] of [[-17, -6, 5, 3.2], [-17, 1, 4, 3.6], [-18, 7, 6, 3], [-16, -12, 4, 3.4]]) {
    box(4, h, w, lam({ color: 0x2b2a2e }), x, h / 2, z, { occ: false });
    box(.05, .5, .6, basic({ color: z === 1 ? 0x8a7040 : 0x1a1a22 }), x + 2.03, 1.6, z, { occ: false });
  }
  // o vulto: o Passarex da série, em silhueta, com os olhos acesos
  const fig = E.add(E.sticker(1.75, { sil: true, eyes: true, s: .14 }));
  fig.visible = false; fig.position.set(-12.5, 0, -1.2);

  E.add(new THREE.AmbientLight(0x3a4260, 1.4));
  const tvLight = E.add(new THREE.PointLight(0x9fb4ff, 0, 0, 2)); tvLight.position.set(0, .9, -2.0);

  /* som */
  let tvBus, phoneBus, staticG, humG, ringG;
  L.ambience = bus => {
    E.loopNoise('lowpass', 220, 0, .05, bus);
    tvBus = E.gain(0, bus); phoneBus = E.gain(0, bus);
    staticG = E.loopNoise('bandpass', 2600, .6, 0, tvBus);
    const ac = E.ac();
    const hum = ac.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 60;
    const hf = ac.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 240;
    humG = ac.createGain(); humG.gain.value = 0; hum.connect(hf).connect(humG).connect(tvBus); hum.start();
    ringG = ac.createGain(); ringG.gain.value = 0;
    const am = ac.createGain(); am.gain.value = .5;
    const lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 20;
    const lfoG = ac.createGain(); lfoG.gain.value = .5; lfo.connect(lfoG).connect(am.gain); lfo.start();
    for (const f of [440, 480]) { const o = ac.createOscillator(); o.frequency.value = f; o.connect(am); o.start(); }
    am.connect(ringG).connect(phoneBus);
  };
  const MELODY = [659, 784, 880, 784, 659, 587, 659, 0, 523, 587, 659, 587, 523, 494, 523, 0];
  const musicNote = (i, det) => { const f = MELODY[i % MELODY.length]; if (!f || !tvBus) return; E.tone(f, .9, .1, 'triangle', tvBus, 0, det); E.tone(f * 2, .4, .03, 'sine', tvBus, 0, det * 1.5); };

  /* ações */
  function pickTape() {
    C.hasTape = true; tape.visible = false; E.unInteract(tapeHit); tapeHit.removeFromParent();
    E.sfx.pick();
    E.say('(“Canal dos Passarinhos · Registro 1367”. Nunca vi essa fita.)', 4);
    C.ringIn = 6;
  }
  function insertTape() {
    E.conquista('fita');
    C.tapeIn = true; C.hasTape = false; C.tapeT = 0; C.ringing = false;
    E.noiseHit(.15, .3, 700); E.noiseHit(.08, .4, 2500, null, 'highpass'); E.tone(90, .4, .15, 'square', null, .2);
    const g = vcrDisp.userData.ctx; g.fillStyle = '#111'; g.fillRect(0, 0, 48, 12); g.fillStyle = '#3f6'; g.font = '10px monospace'; g.fillText('▶ PLAY', 6, 10); vcrDisp.needsUpdate = true;
    E.osd('▶ PLAY', 'OUT. 24 1997 · NAVIRAÍ — MS');
  }
  function answerPhone() {
    C.ringing = false; S.noticed++; handset.position.y = .2; E.sfx.pick();
    const pb = E.gain(.5); const g = E.loopNoise('bandpass', 1800, 1.5, .04, pb);
    E.say('(Alô?)', 2);
    E.later(2, () => E.say('(...só chiado do outro lado.)', 3));
    E.later(4.3, () => E.whistle(.05, { dest: pb }));
    E.later(6.2, () => { g.gain.value = 0; E.noiseHit(.05, .4, 1500); handset.position.y = .09; E.say('(Desligaram.)', 2.5); });
  }
  function readClip() {
    S.clues.recorte = true; E.save();
    E.note(`<small>GAZETA DE NAVIRAÍ · 23 DE OUTUBRO DE 1997</small>
      <h2>Moradores relatam “pássaro” na saída da cidade</h2>
      <p>Relatos <b>não verificados</b> falam de uma figura parada à beira da avenida, sempre depois de escurecer. Corpo de ave, cabeça de gente. Não se aproxima. Só assobia.</p>
      <p>A prefeitura não confirma a ocorrência e pede calma à população.</p>
      <p class="hand">não olha muito tempo pra ele</p>`);
  }

  /* TV */
  const pxTV = E.passarexCanvas(.06, { outline: true });
  const TV_LINES = [[9, 'p_ola_amiguinhos', 'Olá, amiguinhos.'], [12.5, 'p_conhecer', 'Hoje vamos conhecer um passarinho... de Naviraí.'], [19, 'p_so_assobia', 'Ele não fala. Só assobia.'], [25.5, 'p_ainda_aqui', 'Vocês ainda estão aqui?'], [31, 'p_mais_perto_tv', 'Cheguem mais perto da TV.']];
  const tvVoice = (id, text) => E.voice(id, text, 'tv', { dest: tvBus || undefined, vol: 1.8 });
  function drawStatic(g) {
    const img = g.createImageData(160, 120), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }
  function drawTV(t, now) {
    const g = tvCtx;
    if (!C.tapeIn) {
      if (C.tvStaticT > 0) drawStatic(g);
      else { g.fillStyle = '#1b1d1f'; g.fillRect(0, 0, 160, 120); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(14, 10, 40, 20); }
      return;
    }
    if (t < 2.5) return drawStatic(g);
    if (t < 4.5) {
      ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * 160 / 7, 0, 160 / 7 + 1, 90); });
      g.fillStyle = '#111'; g.fillRect(0, 90, 160, 30); return;
    }
    if (t < 8) { g.fillStyle = '#1d2c8c'; g.fillRect(0, 0, 160, 120); g.fillStyle = '#e8e8ff'; g.font = '12px monospace'; g.fillText('▶ PLAY', 10, 20); g.fillText('REGISTRO 1367', 32, 66); return; }
    const sky = g.createLinearGradient(0, 0, 0, 80); sky.addColorStop(0, '#f7c3d6'); sky.addColorStop(1, '#fde6b0');
    g.fillStyle = sky; g.fillRect(0, 0, 160, 80);
    g.fillStyle = '#fff';
    for (const [cx, cy] of [[30, 20], [70, 14], [130, 26]]) { const x = (cx + now * 3) % 190 - 15; g.beginPath(); g.ellipse(x, cy, 14, 5, 0, 0, 7); g.ellipse(x + 8, cy - 3, 9, 5, 0, 0, 7); g.fill(); }
    const blink = (now % 5) > 4.85;
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(118, 24, 10, blink ? 1 : 5, 0, 0, 7); g.fill();
    if (!blink) { g.fillStyle = '#3b2a2a'; g.beginPath(); g.arc(118 + Math.max(-4, Math.min(4, E.player.pos.x * 2)), 24, 3, 0, 7); g.fill(); }
    g.fillStyle = '#9fd39a'; g.fillRect(0, 78, 160, 42);
    g.fillStyle = '#e9a0b0'; g.fillRect(20, 62, 16, 16); g.fillStyle = '#b5546a'; g.beginPath(); g.moveTo(17, 62); g.lineTo(28, 53); g.lineTo(39, 62); g.fill();
    for (const [lx, ly, c] of [[52, 92, '#ff8fb1'], [140, 96, '#8fd1ff'], [10, 104, '#ffd36f'], [104, 106, '#c79bff']]) {
      g.fillStyle = '#eee'; g.fillRect(lx - 1, ly - 2, 2, 14); g.fillStyle = c; g.beginPath(); g.arc(lx, ly - 6, 6, 0, 7); g.fill();
    }
    const k = Math.min(1, Math.max(0, (t - 8) / 30)), sc = .5 + k * 2.6;
    g.drawImage(pxTV.canvas, 80 - pxTV.ox * sc, 86 + k * 50 - pxTV.oy * sc, pxTV.pw * sc, pxTV.ph * sc);
    if (t < 12) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 106, 160, 14); g.fillStyle = '#fff'; g.font = '9px monospace'; g.fillText('CANAL DOS PASSARINHOS', 22, 116); }
    const ty = (now * 40) % 140 - 10; g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, ty, 160, 3);
    if (Math.random() < .04) { const y = Math.random() * 120; g.drawImage(tvCanvas, 0, y, 160, 6, 4 + Math.random() * 6, y, 160, 6); }
  }

  /* laço */
  const tmp = new THREE.Vector3();
  let tickT = 0, glitchT = 0;
  L.idle = now => { drawTV(-1, now); tvTex.needsUpdate = true; };
  L.enter = () => {
    E.voice('n_intro', 'Registro 1367. Fita encontrada numa casa em Naviraí. Outubro de 1997.', 'nar');
    E.later(9.5, () => { E.say('(Já passou da meia-noite. Não consigo dormir.)', 4); E.toast('Sala de casa<small>explore · [H] dica</small>'); });
  };
  L.update = dt => {
    const p = E.player.pos;
    tickT -= dt; if (tickT <= 0) { tickT = 1; E.tone(2200, .02, .012, 'square'); }
    if (C.ringIn > 0) { C.ringIn -= dt; if (C.ringIn <= 0 && !C.tapeIn) { C.ringing = true; C.ringT = 0; } }
    if (C.ringing) {
      C.ringT += dt; const ph = C.ringT % 4;
      if (ringG) ringG.gain.value = ph < 1.6 ? .12 : 0;
      phone.position.x = tx + .1 + (ph < 1.6 ? (Math.random() - .5) * .006 : 0);
      if (C.ringT > 20) { C.ringing = false; E.say('(Parou de tocar.)', 2.5); }
    } else if (ringG) ringG.gain.value = 0;
    if (phoneBus) phoneBus.gain.value = Math.min(1, 1.4 / (1 + p.distanceTo(phone.position)));

    if (C.tvStaticT > 0) C.tvStaticT -= dt;
    const dTV = Math.hypot(p.x - TV_POS.x, p.z - TV_POS.z);
    if (tvBus) tvBus.gain.value = Math.min(1.2, 1.6 / (1 + dTV * .8));
    let tvOn = C.tvStaticT > 0;
    L.red = 0;
    if (C.tapeIn) {
      tvOn = true;
      const t = C.tapeT += dt;
      if (C.nextLine < TV_LINES.length && t >= TV_LINES[C.nextLine][0]) {
        tvVoice(TV_LINES[C.nextLine][1], TV_LINES[C.nextLine][2]);
        if (C.nextLine === 2) E.whistle(.12, { dest: tvBus, delay: 1.2 });
        C.nextLine++;
      }
      if (t > 41 && Math.floor((t - 41) / 10) !== Math.floor((t - 41 - dt) / 10)) tvVoice('p_mais_perto', 'Mais perto.');
      if (t > 19 && !C.birdGone) { C.birdGone = true; picMat.map = birdEmpty; }
      L.red = (t > 19.4 && t < 19.55) ? 1 : 0;
      if (t > 8.5) { C.noteT -= dt; if (C.noteT <= 0) { C.noteT = .42 + Math.max(0, t - 20) * .006; musicNote(C.noteIdx++, (t - 8) * 3 + (Math.random() - .5) * 20); } }
      if (staticG) staticG.gain.value = (t < 2.5 ? .25 : .02) + (L.pull || 0) * .35;
      if (humG) humG.gain.value = .03;
    } else {
      if (staticG) staticG.gain.value = C.tvStaticT > 0 ? .25 : 0;
      if (humG) humG.gain.value = tvOn ? .03 : 0;
    }
    drawTV(C.tapeT, L.t); tvTex.needsUpdate = true;
    tvLight.intensity = tvOn ? 1.6 + Math.random() * .9 : 0;
    tvLight.color.setHex(C.tapeT > 8 ? 0xffd0e0 : 0x9fb4ff);
    lampLight.intensity = C.lampOn ? 9 : 0;
    shade.material.color.setHex(C.lampOn ? 0xffd9a0 : 0x4a4038);
    const flick = Math.random() < .015;
    streetLight.intensity = flick ? 10 : 140; poolMat.opacity = cone.material.opacity = flick ? .15 : 1;

    // o vulto: cada vez que você desvia o olhar e volta, ele está mais perto
    fig.visible = C.tapeT > 8;
    if (fig.visible) {
      const looking = E.looking(tmp.set(fig.position.x, 1.3, fig.position.z));
      if (looking) {
        if (!C.figWas && C.figAwayT > 1.5 && fig.position.x < -5.2) {
          fig.position.x = Math.min(-5.2, fig.position.x + 2.5); glitchT = .5; E.noiseHit(.4, .15, 2500, null, 'highpass');
          if (fig.position.x >= -5.2 && !C.flashed) { C.flashed = true; E.flash(); }
        }
        C.figAwayT = 0; C.figLookT += dt;
        if (C.figLookT > 3 && !C.figCounted) { C.figCounted = true; S.noticed++; E.say('(Ele não se mexe. Mas tá olhando pra cá.)', 3.5); E.whistle(.025); }
      } else C.figAwayT += dt;
      C.figWas = looking;
    }

    // a TV puxa você
    tmp.copy(TV_POS).sub(E.camera.position).normalize();
    const facing = tmp.dot(E.fwd) > .85;
    if (C.tapeT > 31 && dTV < 1.5 && facing) {
      L.pull = Math.min(1, (L.pull || 0) + dt * .2);
      if (!C.saidPull) { C.saidPull = true; tvVoice('p_isso', 'Isso. Mais perto...'); }
    } else L.pull = Math.max(0, (L.pull || 0) - dt * .35);
    if (L.pull > .7 && !C.pullFlash) { C.pullFlash = true; E.flash(); }
    if (L.pull >= 1 && !C.pulled) { C.pulled = true; E.goTo('colinas'); }
    if (glitchT > 0) glitchT -= dt;
    L.glitch = Math.max(glitchT > 0 ? .6 : 0, C.tapeT > 0 && C.tapeT < 2.5 ? .4 : 0);
    drawer.position.z += ((C.drawerOpen ? tz + .3 : tz) - drawer.position.z) * Math.min(1, dt * 10);
  };
  L.exit = () => { L.pull = 0; };

  /* segredo do Clubex: uma fita a mais na estante */
  { const t2 = E.canvasTex(64, 32, g => { g.fillStyle = '#241726'; g.fillRect(0, 0, 64, 32); g.fillStyle = '#c8a04a'; g.font = 'bold 7px monospace'; g.fillText('OS PORTÕES', 4, 13); g.fillText('DO CLUBEX', 4, 22); g.fillStyle = '#c8202c'; g.fillRect(0, 27, 64, 5); });
    const tb2 = lam({ color: 0x151515 });
    const vhs = E.add(new THREE.Mesh(new THREE.BoxGeometry(.19, .026, .105), [tb2, tb2, basic({ map: t2 }), tb2, tb2, tb2]));
    vhs.position.set(sx - .08, 1.81, sz - .3); vhs.rotation.y = -.3; vhs.scale.setScalar(1.25);
    E.ovo('fita', E.hitbox(.3, .16, .26, sx - .08, 1.82, sz - .3), 'Fita “Os Portões do Clubex”', () => E.note(`<small>FITA VHS · SEM ETIQUETA DE LOCADORA</small><h2>Os Portões do Clubex</h2>
      <p>Na lombada, escrito à mão: <b>“só entra quem tem aura”</b>. Dentro da caixinha, um papel dobrado com quatro regras: ser muito maneiro, ter muita aura, ser uma pessoa distinta e ser espirituoso, sobremaneira.</p>
      <p class="hand">o guardião dos portões já sabe. ele sempre sabe.</p>`)); }
  if (!S.flags.final) E.moedas([[-2.2, null, -2.2], [-.6, null, 2.5]]);
  L.hint = () => {
    if (!C.hasTape && !C.tapeIn) return { text: 'Tem uma fita diferente na estante.', target: tape.position.clone() };
    if (C.hasTape) return { text: 'Coloque a fita no videocassete, embaixo da TV.', target: vcr.position.clone() };
    if (C.tapeT < 31) return { text: 'Assista à fita. E de vez em quando, olhe pela janela.', target: TV_POS.clone() };
    return { text: 'Chegue bem perto da TV e olhe para a tela.', target: TV_POS.clone() };
  };
  L.debug = { skipTape: () => { if (!C.hasTape && !C.tapeIn) pickTape(); insertTape(); }, C };

  /* ===== os três finais (voltando da avenida, a fita termina aqui) ===== */
  L.semAssombro = !!S.flags.final;
  if (S.flags.final) finalMode(S.flags.final);
  function finalMode(F) {
    L.interactables.length = 0; L.speed = 0; L.hint = null; L.debug.final = F;
    tape.visible = false; fig.visible = false; C.lampOn = true;
    L.spawn = F === 'C' ? { x: -4.5, z: -2.4, yaw: -2.22, pitch: -.02 } : { x: 0, z: .35, yaw: 0, pitch: -.12 };
    if (F === 'C') L.eye = 1.36;
    L.clock = () => F === 'C' ? '00:13' : '00:04';
    const gv = vcrDisp.userData.ctx, vcrTxt = t => { gv.fillStyle = '#111'; gv.fillRect(0, 0, 48, 12); gv.fillStyle = '#3f6'; gv.font = '10px monospace'; gv.fillText(t, 6, 10); vcrDisp.needsUpdate = true; };
    const ej = E.add(new THREE.Mesh(tape.geometry, tape.material)); ej.position.set(.62, .55, -2.72); ej.visible = false;
    // você mesmo, sentado no sofá (só aparece no final C, visto de fora)
    const me = E.add(new THREE.Group()); me.position.set(0, 0, 1.0); me.visible = F === 'C';
    const dark = lam({ color: 0x1a1820 });
    { const b = new THREE.Mesh(new THREE.BoxGeometry(.46, .62, .28), dark); b.position.y = .82; me.add(b); }
    const meHead = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), dark); meHead.position.y = 1.26; me.add(meHead);
    { const face = new THREE.Mesh(new THREE.PlaneGeometry(.14, .12), basic({ color: 0xb8a898 })); face.position.set(0, 0, -.125); face.rotation.y = Math.PI; meHead.add(face); }
    let ft = 0, mode = 'play', lampOff = false, headTurn = 0, ejecting = false;
    const blueScreen = (a, b) => { const g = tvCtx; g.fillStyle = '#1d2c8c'; g.fillRect(0, 0, 160, 120); g.fillStyle = '#e8e8ff'; g.font = '12px monospace'; g.fillText(a, 10, 20); if (b) g.fillText(b, 30, 66); };
    function drawFinal() {
      const g = tvCtx;
      if (F === 'C') { C.tapeIn = true; drawTV(20, L.t); return; }
      if (mode === 'play') return blueScreen('▶ PLAY', 'REGISTRO 1367');
      if (mode === 'stop') return blueScreen('■ STOP', '⏏ EJECT');
      drawStatic(g);
      if (F === 'B' && Math.floor(L.t) % 2 === 0) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 50, 160, 22); g.fillStyle = '#ff4040'; g.font = '11px monospace'; g.fillText('CONEXÃO PERDIDA', 26, 65); }
    }
    function ending() {
      let got = []; try { got = JSON.parse(localStorage.getItem('registro1367-finais')) || []; } catch (e) {}
      if (!got.includes(F)) got.push(F); try { localStorage.setItem('registro1367-finais', JSON.stringify(got)); } catch (e) {}
      const T = {
        A: ['FINAL A · FITA EJETADA', 'Ele quase não te notou. A fita saiu sozinha e, lá longe, alguém assobiou.'],
        B: ['FINAL B · CONEXÃO PERDIDA', 'Ele te notou demais. E agora sabe onde você mora.'],
        C: ['FINAL C · REGISTRO 1368', 'Final secreto. Você achou todas as pistas e todas as penas sem chamar a atenção dele. Mas alguém continua gravando.'],
      }[F];
      E.save();
      // a fita acaba... e alguma coisa te chama lá pra cima
      E.note(`<small>ARQUIVO PASSAREX · FIM DO REGISTRO</small><h2>${T[0]}</h2><p>${T[1]}</p><p class="hand">e então, uma música começou a tocar, lá do céu</p>`);
      E.trigger(() => !S.noteOpen, () => { E.glitchText('↑', .6); E.later(.5, () => E.goTo('portoes')); });
    }
    L.enter = () => {
      if (F === 'A') {
        E.osd('▶ PLAY', 'OUT. 25 1997 · NAVIRAÍ — MS');
        E.later(.8, () => E.say('(Acordei no sofá. A fita ainda tava rodando.)', 3.5));
        E.later(3.2, () => { mode = 'static'; });
        E.later(4.4, () => { mode = 'stop'; vcrTxt('EJECT'); ejecting = true; ej.visible = true; E.noiseHit(.15, .3, 700); E.tone(90, .4, .15, 'square', null, .1); E.osd('■ STOP', 'OUT. 25 1997 · NAVIRAÍ — MS'); });
        E.later(5.6, () => E.voice('n_final_a', 'Fita ejetada. Nenhuma outra gravação foi encontrada na casa.', 'nar'));
        E.later(11, () => E.whistle(.02, { pan: -.9 }));
        E.later(12.6, () => E.say('(...lá fora. Bem longe.)', 3));
        E.later(15.5, ending);
      } else if (F === 'B') {
        E.osd('<span class="rec">● REC</span>', 'OUT. 25 1997 · NAVIRAÍ — MS');
        mode = 'static';
        E.later(.8, () => E.say('(Acordei no sofá. A TV só chiava.)', 3.5));
        E.later(3.4, () => { C.lampOn = false; E.sfx.click(); });
        E.later(4.4, () => { lampOff = true; E.sfx.click(); });
        E.later(5.6, () => {
          const f = E.fwd; fig.position.set(E.player.pos.x + f.x * 1.3, 0, E.player.pos.z + f.z * 1.3); fig.visible = true;
          E.noiseHit(.5, .2, 2500, null, 'highpass'); L.glitchT = .5;
        });
        E.later(6.2, () => E.voice('p_achei_casa', 'Achei a sua casa.', 'tv'));
        E.later(9, () => E.scare(1.1, .6));
        E.later(10.2, () => E.voice('n_final_b', 'Conexão perdida. O morador nunca foi localizado.', 'nar', { overlap: true }));
        E.later(10.4, ending);
      } else {
        E.osd('<span class="rec">● REC</span>', 'REGISTRO 1368 · NAVIRAÍ — MS');
        E.later(1.4, () => E.voice('p_minha_vez', 'Agora é a minha vez de gravar.', 'tv'));
        E.later(5, () => { headTurn = 1; });
        E.later(7.2, () => E.voice('n_final_c', 'Registro mil trezentos e sessenta e oito. Gravado do lado de fora da janela.', 'nar'));
        E.later(11.5, () => E.whistle(.06));
        E.later(13.5, ending);
      }
    };
    const baseYaw = L.spawn.yaw;
    L.update = dt => {
      ft += dt;
      drawFinal(); tvTex.needsUpdate = true;
      tvLight.intensity = 1.6 + Math.random() * .9; tvLight.color.setHex(F === 'C' ? 0xffd0e0 : 0x9fb4ff);
      const lampOn = C.lampOn || (!lampOff && Math.floor(L.t * 2) % 2 === 0);
      lampLight.intensity = lampOn ? 9 : 0; shade.material.color.setHex(lampOn ? 0xffd9a0 : 0x4a4038);
      if (tvBus) tvBus.gain.value = F === 'C' ? .25 : .7;
      if (staticG) staticG.gain.value = mode === 'static' ? .12 : .01;
      if (humG) humG.gain.value = .03;
      if (ejecting) ej.position.z = Math.min(-2.42, ej.position.z + dt * .12);
      if (F === 'C') {   // câmera na mão, do lado de fora
        E.player.yaw += (baseYaw + Math.sin(ft * .5) * .03 - E.player.yaw) * Math.min(1, dt * 2);
        meHead.rotation.y += ((headTurn ? 1.4 : 0) - meHead.rotation.y) * Math.min(1, dt * .8);
      }
      if (L.glitchT > 0) L.glitchT -= dt;
      L.glitch = L.glitchT > 0 ? .6 : 0; L.red = 0; L.pull = 0;
    };
  }
}
