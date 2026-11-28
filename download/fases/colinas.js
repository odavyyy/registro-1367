// FASE 1 · As colinas. Mesas verdes de sonho, pirulitos gigantes, uma TV na grama e a casinha rosa lá no alto.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(21);
  E.scene.background = new THREE.Color(0xf6d9e2);
  E.scene.fog = new THREE.FogExp2(0xf3dbe2, .0085);
  E.camera.far = 420;
  L.speed = 2.6; L.floor = 'grass'; L.eye = 1.6; L.reach = 2.4;
  E.osd('▶ PLAY', 'REGISTRO 1367 · ??/??/??');
  L.music = 'trilha'; L.musicVol = 0.22;
  L.clock = t => (Math.floor(t * 3) % 7 === 0 ? '?' : '1') + '2:00';
  const { lam, basic } = E;
  const C = { tvTalked: false, talking: false, pxSpot: 0, pxLookT: 0, pxWas: false, doorPx: true };

  /* luz */
  E.add(new THREE.HemisphereLight(0xffe6f0, 0x5f9e5a, 2.4));
  const sun = E.add(new THREE.DirectionalLight(0xfff0d8, 1.5)); sun.position.set(30, 50, 20);

  /* terreno: mesas com paredões, ligadas por uma crista com caminho de terra */
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const MESAS = [
    { x: 0, z: 0, r: 22, h: 0, walk: true },
    { x: 6, z: -74, r: 13, h: 3, walk: true, flat: true },
    { x: -50, z: -40, r: 11, h: 2 }, { x: 46, z: -30, r: 10, h: 6 }, { x: -34, z: 42, r: 9, h: 1 },
    { x: 38, z: 36, r: 12, h: -1 }, { x: -12, z: -130, r: 15, h: 7 }, { x: 52, z: -100, r: 9, h: 9 }, { x: -60, z: -95, r: 10, h: 4 },
  ];
  const RIDGE = [[0, -20], [-3, -34], [3, -48], [6, -62]];
  const PATH = [[0, 12], [0, 0], [0, -20], ...RIDGE.slice(1), [6, -67], [6, -70.6]];
  const segLen = [], ridgeTot = (() => { let s = 0; for (let i = 1; i < RIDGE.length; i++) { const l = Math.hypot(RIDGE[i][0] - RIDGE[i - 1][0], RIDGE[i][1] - RIDGE[i - 1][1]); segLen.push(l); s += l; } return s; })();
  function ridgeInfo(x, z) {
    let best = { d: 1e9, s: 0 }, acc = 0;
    for (let i = 1; i < RIDGE.length; i++) {
      const [ax, az] = RIDGE[i - 1], [bx, bz] = RIDGE[i], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
      const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      const d = Math.hypot(x - ax - dx * u, z - az - dz * u);
      if (d < best.d) best = { d, s: (acc + u * segLen[i - 1]) / ridgeTot };
      acc += segLen[i - 1];
    }
    return best;
  }
  const valley = (x, z) => -17 + 2.5 * Math.sin(x * .06) * Math.cos(z * .05) + 1.2 * Math.sin(x * .17 + z * .11);
  function ground(x, z) {
    const v = valley(x, z); let h = v;
    for (const m of MESAS) {
      const d = Math.hypot(x - m.x, z - m.z), k = sm(m.r + 9, m.r, d);
      if (k <= 0) continue;
      const top = m.h + (m.flat ? 0 : .45 * Math.sin(x * .3) * Math.sin(z * .27));
      h = Math.max(h, v + (top - v) * k);
    }
    const ri = ridgeInfo(x, z), k = sm(11, 2.6, ri.d);
    if (k > 0) { const s = ri.s, top = 3 * s * s * (3 - 2 * s) + Math.sin(s * Math.PI) * 1.2; h = Math.max(h, v + (top - v) * k); }
    return h;
  }
  L.ground = ground;
  L.walkable = (x, z) => {
    for (const m of MESAS) if (m.walk && Math.hypot(x - m.x, z - m.z) < m.r + 1.2) return true;
    return ridgeInfo(x, z).d < 2.3;
  };
  E.cartazCapinha('k1', -2.6, 7.5, 0);
  L.spawn = { x: 0, z: 12, yaw: 0, pitch: -.05 };

  const geo = new THREE.PlaneGeometry(360, 360, 180, 180); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -50);
  const pa = geo.attributes.position, cols = new Float32Array(pa.count * 3), col = new THREE.Color();
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), z = pa.getZ(i), y = ground(x, z); pa.setY(i, y);
    const k = sm(-15, 1, y);
    col.setRGB(.17 + .38 * k, .42 + .4 * k, .2 + .26 * k);
    const j = (rnd() - .5) * .05; col.r += j; col.g += j; col.b += j * .5;
    cols.set([col.r, col.g, col.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const grass = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#d8e8d0'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 220, ['#c2d8b8', '#eef6e6', '#b4cca8']); }, [90, 90]);
  E.add(new THREE.Mesh(geo, lam({ vertexColors: true, map: grass })));

  // caminho de terra (fita sobre o chão)
  {
    const pts = [];
    for (let i = 1; i < PATH.length; i++) {
      const [ax, az] = PATH[i - 1], [bx, bz] = PATH[i], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 1);
      for (let k = 0; k < n; k++) pts.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
    }
    pts.push(PATH[PATH.length - 1]);
    const pos = [], idx = [];
    pts.forEach(([x, z], i) => {
      const [nx, nz] = pts[Math.min(i + 1, pts.length - 1)], [px, pz] = pts[Math.max(i - 1, 0)];
      let dx = nx - px, dz = nz - pz; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const w = .85 + .15 * Math.sin(i * .7);
      for (const s of [-1, 1]) { const X = x - dz * w * s, Z = z + dx * w * s; pos.push(X, ground(X, Z) + .05, Z); }
      if (i) idx.push((i - 1) * 2, (i - 1) * 2 + 1, i * 2, (i - 1) * 2 + 1, i * 2 + 1, i * 2);
    });
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setIndex(idx); pg.computeVertexNormals();
    const dirt = E.canvasTex(16, 16, (g, w, h) => { g.fillStyle = '#e7d3a6'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 60, ['#d4bd8c', '#f2e2be']); });
    E.add(new THREE.Mesh(pg, lam({ map: dirt, side: THREE.DoubleSide })));
  }
  const pathPts = (() => { const out = []; for (let i = 1; i < PATH.length; i++) { const [ax, az] = PATH[i - 1], [bx, bz] = PATH[i], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 4); for (let k = 0; k < n; k++) out.push(new THREE.Vector3(ax + (bx - ax) * k / n, 0, az + (bz - az) * k / n)); } out.push(new THREE.Vector3(PATH.at(-1)[0], 0, PATH.at(-1)[1])); out.forEach(v => v.y = ground(v.x, v.z) + 1.4); return out; })();

  /* céu de sonho */
  const skyTex = E.canvasTex(4, 64, g => {
    const gr = g.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, '#e9a7c6'); gr.addColorStop(.35, '#f6c9d8'); gr.addColorStop(.5, '#fdebd8'); gr.addColorStop(.56, '#fff4dc'); gr.addColorStop(1, '#f3dbe2');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 64);
  });
  skyTex.magFilter = skyTex.minFilter = THREE.LinearFilter;
  E.add(new THREE.Mesh(new THREE.SphereGeometry(380, 16, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
  const cloudTex = E.canvasTex(64, 24, g => {
    g.fillStyle = '#ffffff';
    for (const [x, y, r] of [[14, 15, 8], [26, 11, 10], [40, 12, 9], [50, 16, 7], [32, 17, 8]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(230,200,225,.7)'; g.fillRect(8, 19, 48, 4);
  });
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2, d = 200 + rnd() * 120;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true }));
    sp.position.set(Math.cos(a) * d, 30 + rnd() * 70, Math.sin(a) * d - 50); sp.scale.set(60 + rnd() * 40, 22 + rnd() * 12, 1);
    E.add(sp);
  }
  // o olho no céu (é o sol)
  const eyeCanvas = document.createElement('canvas'); eyeCanvas.width = 64; eyeCanvas.height = 32;
  const eyeTex = E.texFrom(eyeCanvas), eg = eyeCanvas.getContext('2d');
  const eye = E.add(new THREE.Mesh(new THREE.PlaneGeometry(56, 28), new THREE.MeshBasicMaterial({ map: eyeTex, transparent: true, fog: false })));
  eye.position.set(-30, 95, -300);
  function drawEye(lx, ly, open) {
    eg.clearRect(0, 0, 64, 32);
    eg.fillStyle = 'rgba(255,240,200,.35)'; eg.beginPath(); eg.ellipse(32, 16, 31, 15, 0, 0, 7); eg.fill();
    eg.fillStyle = '#fffaf0'; eg.beginPath(); eg.moveTo(4, 16); eg.quadraticCurveTo(32, 16 - 22 * open, 60, 16); eg.quadraticCurveTo(32, 16 + 22 * open, 4, 16); eg.fill();
    if (open > .2) { eg.fillStyle = '#7a5a8a'; eg.beginPath(); eg.arc(32 + lx * 8, 16 + ly * 3, 7 * open, 0, 7); eg.fill(); eg.fillStyle = '#2a1a2a'; eg.beginPath(); eg.arc(32 + lx * 8, 16 + ly * 3, 3.5 * open, 0, 7); eg.fill(); }
    eyeTex.needsUpdate = true;
  }
  drawEye(0, 0, 1);

  /* pirulitos */
  const swirl = (c1, c2) => E.canvasTex(32, 32, g => {
    g.fillStyle = c1; g.beginPath(); g.arc(16, 16, 16, 0, 7); g.fill();
    g.strokeStyle = c2; g.lineWidth = 3; g.beginPath();
    for (let a = 0; a < 18; a += .2) { const r = a * .85; g.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); } g.stroke();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(11, 10, 4, 0, 7); g.fill();
  });
  const SW = [['#ff8fb1', '#fff0f5'], ['#8fd1ff', '#ffffff'], ['#ffd36f', '#ff8f6b'], ['#c79bff', '#fff6ff'], ['#9ff0b5', '#ff9fd0']].map(([a, b]) => swirl(a, b));
  const stickMat = lam({ color: 0xfbf6ee });
  function lollipop(x, z, hgt, r, i) {
    const y = ground(x, z);
    const stick = E.add(new THREE.Mesh(new THREE.CylinderGeometry(r * .08, r * .08, hgt, 6), stickMat)); stick.position.set(x, y + hgt / 2, z);
    const side = lam({ color: 0xffffff });
    const candy = E.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * .35, 20), [side, basic({ map: SW[i % SW.length] }), basic({ map: SW[i % SW.length] })]));
    candy.rotation.set(Math.PI / 2, 0, rnd() * Math.PI); candy.position.set(x, y + hgt + r * .9, z);
    E.circle(x, z, r * .1 + .1);
    return candy;
  }
  const candies = [];
  [[-9, 6, 3.2, 1.4], [8, 9, 4, 1.8], [12, -6, 2.6, 1.1], [-14, -10, 5, 2.2], [5, -14, 3, 1.2], [-4, 18, 2.4, 1], [16, 4, 3.4, 1.5], [-17, 2, 2.8, 1.2]]
    .forEach(([x, z, h, r], i) => candies.push(lollipop(x, z, h, r, i)));
  // pirulitos gigantes nas mesas distantes
  [[-50, -40, 14, 6], [46, -30, 18, 7], [38, 36, 12, 5], [-60, -95, 16, 6]].forEach(([x, z, h, r], i) => candies.push(lollipop(x + 4, z + 3, h, r, i + 2)));

  /* a TV na grama */
  const tvPos = new THREE.Vector3(-7, ground(-7, -4), -4);
  const tvGrp = E.add(new THREE.Group()); tvGrp.position.copy(tvPos); tvGrp.rotation.y = .55;
  E.box(.9, .7, .6, lam({ color: 0xe9dcc6 }), 0, .35, 0, { parent: tvGrp });
  E.box(.08, .25, .08, lam({ color: 0x777 }), .2, .82, -.1, { parent: tvGrp, occ: false });
  const tvCanvas = document.createElement('canvas'); tvCanvas.width = 120; tvCanvas.height = 90;
  const tvTex = E.texFrom(tvCanvas), tg = tvCanvas.getContext('2d');
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.66, .5), basic({ map: tvTex })); scr.position.set(0, .37, .305); tvGrp.add(scr);
  E.circle(tvPos.x, tvPos.z, .55);
  E.interact(tvGrp, { label: () => C.talking ? '' : '[E] Mexer na TV', act: () => { if (!C.talking) talk(); } });
  let puff = 0;
  function drawTVScreen(t) {
    const gr = tg.createLinearGradient(0, 0, 0, 90); gr.addColorStop(0, '#bfe4f5'); gr.addColorStop(1, '#fbe3ee');
    tg.fillStyle = gr; tg.fillRect(0, 0, 120, 90);
    tg.fillStyle = '#9fd39a'; tg.fillRect(0, 70, 120, 20);
    tg.save(); tg.translate(60, 84); tg.scale(.095, .095); window.drawPassarex(tg, C.talking ? 1.6 + puff : 1.6, {}); tg.restore();
    tg.fillStyle = 'rgba(0,0,0,.35)'; tg.fillRect(0, 0, 120, 10); tg.fillStyle = '#fff'; tg.font = '8px monospace'; tg.fillText('CANAL DOS PASSARINHOS', 8, 8);
    if (Math.random() < .05) { const y = Math.random() * 90; tg.drawImage(tvCanvas, 0, y, 120, 5, 3, y, 120, 5); }
    tg.fillStyle = 'rgba(255,255,255,.1)'; tg.fillRect(0, (t * 30) % 100 - 5, 120, 2);
    tvTex.needsUpdate = true;
  }
  const tv = (id, text) => E.voice(id, text, 'tv', { pan: E.pan(tvPos), vol: Math.max(.5, E.near(tvPos, 6, 1.4)) });
  function talk() {
    C.talking = true; E.sfx.click();
    let t = tv('p_voce_veio', 'Olá, amiguinho! Você veio.') + .5;
    E.later(t, () => {
      const t2 = tv('p_ninguem_vem', 'Que bom. Quase ninguém vem até aqui.') + .5;
      E.later(t2, () => {
        tv('p_ainda_ai', 'Você ainda está aí?');
        E.choice('Você ainda está aí?', ['Tô aqui.', '(ficar calado)'], 1, 7).then(i => {
          const t3 = i === 0
            ? (S.noticed++, E.later(.3, () => { E.whistle(.08); L.glitchT = .6; }), tv('p_to_vendo', 'Eu sei. Eu tô te vendo.'))
            : tv('p_nao_fala', 'Tudo bem. Ele também não fala.');
          E.later(t3 + .6, () => {
            const t4 = tv('p_casinha', 'A casinha rosa está te esperando. Siga o caminho de terra.');
            C.tvTalked = true; C.talking = false;
            E.later(t4 + .3, () => E.toast('Vá até a casinha rosa<small>siga o caminho de terra</small>'));
          });
        });
      });
    });
  }
  E.trigger(p => !C.tvTalked && !C.talking && p.distanceTo(tvPos) < 5, () => talk());

  /* a casinha rosa */
  const hx = 6, hz = -76, hy = ground(hx, hz);
  const pink = lam({ color: 0xf2b6c4 }), roofM = lam({ color: 0xe08aa2 }), white = lam({ color: 0xfbf6ee });
  E.box(7, 3.6, 5, pink, hx, hy + 1.8, hz, { solid: true });
  const roof = E.add(new THREE.Mesh(new THREE.ConeGeometry(5.4, 2.6, 4), roofM)); roof.rotation.y = Math.PI / 4; roof.scale.z = .78; roof.position.set(hx, hy + 4.9, hz);
  E.box(.8, 1.4, .8, pink, hx + 2, hy + 5.2, hz - .5, { occ: false });
  const winTex = E.canvasTex(16, 16, g => { g.fillStyle = '#fbf6ee'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#9fc6dd'; g.fillRect(2, 2, 5, 5); g.fillRect(9, 2, 5, 5); g.fillRect(2, 9, 5, 5); g.fillRect(9, 9, 5, 5); g.fillStyle = '#f7d6e0'; g.fillRect(2, 2, 2, 12); g.fillRect(12, 2, 2, 12); });
  for (const wx of [-2.3, 2.3]) { const w = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), basic({ map: winTex }))); w.position.set(hx + wx, hy + 2.1, hz + 2.51); }
  E.box(1.5, .25, .9, white, hx, hy + .12, hz + 2.9, { occ: false });
  const door = E.box(.95, 2.05, .1, lam({ color: 0x9fcfe0 }), hx, hy + 1.1, hz + 2.52);
  E.box(.08, .08, .08, lam({ color: 0xf0d070 }), hx + .3, hy + 1.05, hz + 2.6, { occ: false });
  const doorPos = new THREE.Vector3(hx, hy + 1.2, hz + 2.6);
  E.interact(door, { label: () => '[E] Entrar na casinha', act: () => { E.sfx.knob(); E.sfx.creak(); E.goTo('amarelas'); } });
  const bush = lam({ color: 0x5fae62 });
  for (const [bx, bz, r] of [[-3, 3, .7], [3.2, 3.1, .8], [-3.6, -1, .9], [3.8, 1, .7], [-1.8, 3.4, .5]]) {
    const b = E.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), bush)); b.position.set(hx + bx, hy + r * .6, hz + bx * 0 + bz); E.circle(hx + bx, hz + bz, r * .8);
  }
  for (let i = -6; i <= 6; i++) if (Math.abs(i) > 1) E.box(.12, .7, .08, white, hx + i * .55, hy + .35, hz + 5.2, { occ: false });
  E.box(6.8, .08, .06, white, hx, hy + .55, hz + 5.2, { occ: false }); E.solid(hx - 3.5, hx - .6, hz + 5.1, hz + 5.3); E.solid(hx + .6, hx + 3.5, hz + 5.1, hz + 5.3);

  /* o Passarex: gigante nas mesas distantes; muda de lugar quando você para de olhar */
  const SPOTS = [[46, -30], [-50, -40], [-12, -130], [38, 36], [52, -100]];
  const giant = E.add(E.sticker(11, { outline: true, s: .2 }));
  const placeGiant = i => { const [x, z] = SPOTS[i]; giant.position.set(x, ground(x, z) - .2, z); };
  placeGiant(0);
  // e pequeno, ao lado da porta da casinha (some quando você chega perto)
  const small = E.add(E.sticker(1.75, { outline: true, s: .14 }));
  small.position.set(hx - 1.4, hy, hz + 3.4);

  /* som */
  let tvBus = null, windG = null;
  L.ambience = bus => {
    windG = E.loopNoise('lowpass', 520, 0, .045, bus);
    tvBus = E.gain(0, bus);
  };
  const MEL = [523, 659, 784, 659, 698, 587, 523, 0, 587, 698, 880, 698, 659, 523, 587, 0];
  let noteT = 0, noteI = 0, birdT = 2, eyeT = 0, blinkT = 0;

  L.enter = () => {
    E.later(1, () => E.voice('n_colinas', 'A gravação continua. O local não foi identificado.', 'nar'));
    E.later(5.5, () => { E.say('(...onde eu tô?)', 3); E.toast('As colinas<small>explore · [H] dica</small>'); });
  };
  L.update = dt => {
    const p = E.player.pos, t = L.t;
    // vento que vai e volta
    if (windG) windG.gain.value = .03 + .03 * (Math.sin(t * .4) * .5 + .5);
    // passarinhos ao longe
    birdT -= dt; if (birdT <= 0) { birdT = 2 + Math.random() * 4; const f = 2600 + Math.random() * 1400; E.tone(f, .09, .015, 'sine', null, 0, 0, f * 1.3); E.tone(f * 1.1, .07, .012, 'sine', null, .12, 0, f * .9); }
    // caixinha de música da TV
    if (tvBus) {
      tvBus.gain.value = E.near(tvPos, 4, .9);
      noteT -= dt; if (noteT <= 0) { noteT = .48; const f = MEL[noteI++ % MEL.length]; if (f) E.tone(f, .8, .08, 'triangle', tvBus, 0, Math.sin(t) * 25); }
    }
    puff = C.talking ? (Math.sin(t * 2) * .5 + .5) * 1.1 : 0;
    drawTVScreen(t);
    // pirulitos giram devagar
    candies.forEach((c, i) => { c.rotation.z += dt * .15 * (i % 2 ? 1 : -1); });
    // o olho segue você
    eyeT -= dt; blinkT -= dt;
    if (eyeT <= 0) {
      eyeT = .12;
      const dx = p.x - eye.position.x, dz = p.z - eye.position.z;
      const open = blinkT < 0 && blinkT > -.18 ? .1 : 1; if (blinkT < -.18) blinkT = 3 + Math.random() * 5;
      drawEye(Math.max(-1, Math.min(1, dx / 60)), Math.max(-1, Math.min(1, -dz / 400)), open);
    }
    eye.lookAt(E.camera.position);
    // o gigante: olhou, desviou, ele já está em outro lugar
    const look = E.looking(new THREE.Vector3(giant.position.x, giant.position.y + 6, giant.position.z), .97);
    if (look) C.pxLookT += dt;
    if (!look && C.pxWas && C.pxLookT > 1) { C.pxSpot = (C.pxSpot + 1 + Math.floor(Math.random() * 3)) % SPOTS.length; placeGiant(C.pxSpot); C.pxLookT = 0; L.glitchT = .35; C.moves = (C.moves || 0) + 1; if (C.moves === 3) E.flash(); }
    C.pxWas = look;
    // o pequeno na porta
    if (small.visible && p.distanceTo(small.position) < 7) { small.visible = false; E.whistle(.07, { pan: E.pan(small.position) }); L.glitchT = .4; E.say('(Ele tava bem ali.)', 2.5); }
    if (L.glitchT > 0) L.glitchT -= dt;
    L.glitch = L.glitchT > 0 ? .5 : 0;
  };
  /* segredos do Clubex nas colinas */
  { const tp = new THREE.Vector3(-.2, 0, -27); tp.y = ground(tp.x, tp.z);
    const up = E.add(E.club('uperFleguis', .55)); up.position.copy(tp);
    E.ovo('fleguis', E.hitbox(.7, .7, .7, tp.x, tp.y + .3, tp.z), 'Tênis brilhando', () => E.say('(Um par de tênis brilhando no meio da grama. As uper fléguis. Ninguém ousa tocar nelas.)', 4.5));
    const rp = new THREE.Vector3(-13, 0, 4); rp.y = ground(rp.x, rp.z);
    const ro = E.add(E.club('rosengo', 1.7)); ro.position.copy(rp); E.circle(rp.x, rp.z, .35);
    E.ovo('rosengo', E.hitbox(.8, 1.7, .8, rp.x, rp.y + .85, rp.z), 'Quem é você?', () => E.say('EL ROSENGO: ¡EL ROSENGO!', 3, 'npc')); }
  E.moedas([[0, null, 0], [0, null, -20], [-1, null, -40], [5, null, -60], [10, null, 4]]);
  L.hint = () => {
    if (!C.tvTalked) return { text: 'Tem uma TV ligada no meio da grama.', target: tvPos.clone().setY(tvPos.y + .8) };
    const p = E.player.pos;
    let bi = 0, bd = 1e9; pathPts.forEach((v, i) => { const d = Math.hypot(v.x - p.x, v.z - p.z); if (d < bd) { bd = d; bi = i; } });
    return { text: 'Siga o caminho de terra até a casinha rosa.', path: [...pathPts.slice(bi, bi + 7), doorPos] };
  };
}
