// FASE 4 · A avenida de Naviraí. Lojas fechadas, postes, um orelhão que toca, a escola com a página de colorir
// e, no fim da avenida, a sua casa. De tardinha ou de noite, conforme a porta que você escolheu.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(97);
  const noite = (S.flags.rota || 'noite') !== 'entardecer';
  const HOR = noite ? '#1c2244' : '#f0a68a', TOP = noite ? '#03050c' : '#4a3266';
  E.scene.background = new THREE.Color(HOR);
  E.scene.fog = new THREE.FogExp2(HOR, noite ? .05 : .034);
  E.camera.far = 130;
  L.floor = 'rua'; L.speed = 2.2; L.eye = 1.6; L.reach = 2.2;
  E.osd('▶ PLAY', 'REGISTRO 1367 · NAVIRAÍ — MS');
  L.clock = t => noite ? `23:${String(Math.min(59, 58 + Math.floor(t / 300))).padStart(2, '0')}` : '17:46';
  const { lam, basic, box } = E;
  const C = { ring: false, called: false, calling: false, page: false, eyes: false, lookT: 0, counted: false, pxCd: 3, spot: -1, said: {} };
  const END_Z = -109;

  /* chão e limites */
  const SCH = { x0: 7, x1: 15, z0: -54, z1: -44, door: -49 };
  L.spawn = { x: 0, z: 7, yaw: 0, pitch: -.02 };
  E.cartazCapinha('a1', -6.1, -10, Math.PI / 2); E.cartazCapinha('a2', 6.1, -42, -Math.PI / 2);
  L.walkable = (x, z) => {
    if (x > -6.6 && x < 6.6 && z > END_Z + .6 && z < 9.6) return true;
    if (x >= 6.6 && x < 7.7 && Math.abs(z - SCH.door) < .42) return true;                     // porta da escola
    return x >= 7.7 && x < SCH.x1 - .35 && z > SCH.z0 + .35 && z < SCH.z1 - .35;              // dentro da escola
  };
  const asph = E.canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#3a3a40'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 600, ['#2c2c32', '#48484e', '#333338']); g.fillStyle = '#2a2a2e'; g.fillRect(10, 40, 20, 1); g.fillRect(40, 12, 1, 14); }, [6, 60]);
  const road = E.add(new THREE.Mesh(new THREE.PlaneGeometry(14, 190, 4, 95), lam({ map: asph }))); road.rotation.x = -Math.PI / 2; road.position.z = -30;
  const sideT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#8c8578'; g.fillRect(0, 0, w, h); g.fillStyle = '#6f695e'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); E.speckle(g, w, h, 120, ['#7e776b', '#9a9386']); }, [2, 75]);
  for (const sx of [-1, 1]) {
    const sw = E.add(new THREE.Mesh(new THREE.PlaneGeometry(3, 190, 1, 95), lam({ map: sideT }))); sw.rotation.x = -Math.PI / 2; sw.position.set(sx * 5.5, .03, -30);
    for (let z = 60; z > -120; z -= 10) box(.18, .12, 10, lam({ color: 0x9a948a }), sx * 4, .06, z - 5, { occ: false });   // em pedaços: o tremido PS1 estica peças longas
  }
  const dashM = basic({ color: noite ? 0x8a7a30 : 0xd8b848 });
  for (let z = 58; z > END_Z; z -= 4) { const d = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.15, 2), dashM)); d.rotation.x = -Math.PI / 2; d.position.set(0, .012, z); }

  /* céu (vai junto com a câmera) */
  const skyTex = E.canvasTex(512, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, TOP); gr.addColorStop(.48, noite ? '#0d1330' : '#c46a7a'); gr.addColorStop(.5, HOR); gr.addColorStop(1, HOR);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (noite) for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(255,255,240,.7)'; g.fillRect((E.rnd() * w) | 0, (E.rnd() * h * .42) | 0, 1, 1); }
  });
  const sky = new THREE.Group(); E.add(sky);
  sky.add(new THREE.Mesh(new THREE.SphereGeometry(115, 16, 12), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })));   // sem o tremido PS1 (esticava faixas no céu)
  const orb = new THREE.Mesh(new THREE.CircleGeometry(noite ? 4 : 9, 20), new THREE.MeshBasicMaterial({ color: noite ? 0xf2eedc : 0xffd27a, fog: false, depthWrite: false }));
  orb.position.set(noite ? 18 : 0, noite ? 34 : 7, -108); sky.add(orb);
  { const nT = E.canvasTex(64, 32, g => { g.fillStyle = noite ? 'rgba(50,56,90,.85)' : 'rgba(255,214,200,.9)'; for (const [x, y, r] of [[18, 20, 10], [30, 14, 13], [44, 19, 11], [52, 23, 8], [10, 24, 7]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, n = new THREE.Mesh(new THREE.PlaneGeometry(34 + k * 3, 12), new THREE.MeshBasicMaterial({ map: nT, transparent: true, fog: false, depthWrite: false })); n.position.set(Math.sin(a) * 95, 34 + (k % 3) * 8, Math.cos(a) * 95); n.lookAt(0, 20, 0); sky.add(n); } }
  sky.children.forEach(m => m.renderOrder = -1);

  /* luz */
  E.add(new THREE.HemisphereLight(noite ? 0x5a6aa0 : 0xffc6a8, noite ? 0x22222e : 0x6a4a5a, noite ? 1.7 : 2.1));
  if (!noite) { const sun = E.add(new THREE.DirectionalLight(0xffb080, 1.2)); sun.position.set(0, 8, -60); }

  /* fachadas */
  const SHOPS_L = [
    ['PADARIA PÃO DE MEL', '#e9d6a8', '#a8402c'], ['LOCADORA VÍDEO 97', '#c8d0e8', '#2a3a8a', 'tv'], ['FARMÁCIA', '#e8eee6', '#2a8a4a'],
    ['BAR DO TONHO', '#e0b080', '#7a2a2a'], ['SAPATARIA', '#d8c8e0', '#5a3a7a'], ['MERCADINHO', '#f0e0a0', '#c06020'],
    ['ÓTICA', '#d0e8e8', '#206a7a'], ['LOCADORA VÍDEO 97', '#c8d0e8', '#2a3a8a', 'tv'], ['PADARIA PÃO DE MEL', '#e9d6a8', '#a8402c'],
  ];
  const SHOPS_R = [
    ['MERCEARIA', '#e6dcc0', '#8a5a2a'], ['ARMARINHO', '#f0c8d0', '#a03050'], ['ESPETINHO DO SERJÃO', '#f0e8e0', '#b02020'],
    ['CORREIOS', '#f0e070', '#2050a0'], null /* escola */, ['BRINQUEDOS', '#d0f0d8', '#d05090'],
    ['SORVETERIA', '#f8d8e8', '#4080c0'], ['FOTO 1 HORA', '#e0e0e0', '#c02020'], ['MERCEARIA', '#e6dcc0', '#8a5a2a'],
  ];
  const facade = (name, wall, accent, h) => E.canvasTex(96, Math.round(96 * h / 11.5), (g, w, hh) => {
    g.fillStyle = wall; g.fillRect(0, 0, w, hh); E.speckle(g, w, hh, 160, ['rgba(0,0,0,.08)', 'rgba(255,255,255,.08)']);
    const base = hh - 30;
    g.fillStyle = accent; g.fillRect(4, base - 10, w - 8, 9);
    g.fillStyle = accent; g.fillRect(4, base - 13, w - 8, 12); g.fillStyle = '#fff'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillText(name, w / 2, base - 4, w - 12);
    g.fillStyle = '#6a6a70'; g.fillRect(14, base, w - 28, 28);                                  // porta de enrolar fechada
    g.fillStyle = '#58585e'; for (let y = base + 2; y < hh; y += 3) g.fillRect(14, y, w - 28, 1);
    g.fillStyle = '#4a4a50'; g.fillRect(w / 2 - 4, hh - 4, 8, 2);
    if (hh > 60) { g.fillStyle = noite ? '#1a1c28' : '#5a6a8a'; for (const x of [18, 54]) g.fillRect(x, 10, 22, 16); g.fillStyle = 'rgba(255,255,255,.15)'; for (const x of [18, 54]) g.fillRect(x, 10, 22, 2); }
  });
  const shops = [];
  function building(side, zc, w, s) {
    const h = 4.2 + rnd() * 2.6, cx = side * 10;
    const wallM = lam({ color: new THREE.Color(s[1]).multiplyScalar(.8) });
    const faceM = lam({ map: facade(s[0], s[1], s[2], h) });
    const mats = [wallM, wallM, wallM, wallM, wallM, wallM]; mats[side < 0 ? 0 : 1] = faceM;
    box(6, h, w, mats, cx, h / 2, zc);
    const b = { side, z: zc, name: s[0], tv: s[3] === 'tv' };
    shops.push(b); return b;
  }
  const BW = 12.2;
  SHOPS_L.forEach((s, i) => building(-1, 2 - i * BW, BW - .5, s));
  SHOPS_R.forEach((s, i) => { if (s) building(1, 2 - i * BW, BW - .5, s); });
  // atrás de você: mais lojas, um quarteirão fechando a rua lá no fundo e um cavalete de obra
  [['AÇOUGUE BOI GORDO', '#f0d8d0', '#a02828'], ['LAN HOUSE', '#c8d8f0', '#2a3a6a'], ['BARBEARIA', '#e8e0d0', '#2a5a8a']].forEach((s, i) => building(-1, 2 + (i + 1) * BW, BW - .5, s));
  [['PAPELARIA', '#f0f0d0', '#4a7a2a'], ['AUTO PEÇAS', '#d8d8d8', '#c06020'], ['LOTERIA', '#e0f0e0', '#1a6a9a']].forEach((s, i) => building(1, 2 + (i + 1) * BW, BW - .5, s));
  for (let i = 1; i < 4; i++) for (const sx of [-1, 1]) box(5.6, 3, .5, basic({ color: noite ? 0x07080c : 0x2a1c26 }), sx * 9.8, 1.5, 2 + i * BW - BW / 2, { occ: false });
  { const fundo = E.canvasTex(192, 48, (g, w, h) => {
      g.fillStyle = noite ? '#5a5048' : '#c8a088'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 300, ['rgba(0,0,0,.1)', 'rgba(255,255,255,.08)']);
      for (let x = 6; x < w; x += 22) { g.fillStyle = noite ? (x % 3 ? '#e8c070' : '#20222c') : '#5a6a8a'; g.fillRect(x, 10, 10, 10); g.fillRect(x, 28, 10, 12); }
    });
    box(30, 7, 3, lam({ map: fundo }), 0, 3.5, 2 + 3.5 * BW + 1.5, { occ: false }); }
  { const obra = E.canvasTex(64, 16, (g, w, h) => { for (let x = -16; x < w + 16; x += 12) { g.fillStyle = '#f0f0f0'; g.fillRect(x, 0, 6, h); g.fillStyle = '#d02020'; g.fillRect(x + 6, 0, 6, h); } g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(14, 3, 36, 10); g.fillStyle = '#ffd23a'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('OBRAS', 32, 11); });
    for (const x of [-4.2, 0, 4.2]) { box(3.6, .5, .12, lam({ map: obra }), x, .85, 10.2, { occ: false }); for (const dx of [-1.5, 1.5]) box(.08, .9, .5, lam({ color: 0x8a8a8a }), x + dx, .45, 10.2, { occ: false }); } }
  // becos escuros entre os prédios
  for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) box(5.6, 3, .5, basic({ color: noite ? 0x07080c : 0x2a1c26 }), sx * 9.8, 1.5, 2 - i * BW + BW / 2, { occ: false });

  // TVs na vitrine da locadora
  const tvC = document.createElement('canvas'); tvC.width = 64; tvC.height = 48;
  const tvT = E.texFrom(tvC), tvG = tvC.getContext('2d');
  const pxS = E.passarexCanvas(.05, { outline: true });
  const tvs = [];
  shops.filter(b => b.tv).forEach(b => {
    for (const dz of [-1.6, 0, 1.6]) {
      box(.5, .46, .7, lam({ color: 0x2a2826 }), -6.95 + .25, 1.15, b.z + dz, { occ: false });
      const sc = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.58, .4), basic({ map: tvT }))); sc.rotation.y = Math.PI / 2; sc.position.set(-6.43, 1.15, b.z + dz);
      tvs.push(sc);
    }
    box(.45, .9, 5, lam({ color: 0x4a4038 }), -6.72, .45, b.z, { occ: false }); E.solid(-6.95, -6.4, b.z - 2.5, b.z + 2.5);
  });
  function drawTVs(t) {
    const g = tvG;
    if ((t % 6) < 4.2) {
      g.fillStyle = '#9fd39a'; g.fillRect(0, 0, 64, 48); g.fillStyle = '#f7c3d6'; g.fillRect(0, 0, 64, 26);
      const sc = 1.1; g.drawImage(pxS.canvas, 32 - pxS.ox * sc, 50 - pxS.oy * sc, pxS.pw * sc, pxS.ph * sc);
    } else {
      const img = g.createImageData(64, 48), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(img, 0, 0);
    }
    g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(0, (t * 30) % 60 - 6, 64, 2);
    tvT.needsUpdate = true;
  }

  /* postes */
  const poleM = lam({ color: 0x45454a });
  const poolTex = E.canvasTex(64, 64, g => {
    const r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,190,120,.8)'); r.addColorStop(.5, 'rgba(255,160,90,.3)'); r.addColorStop(1, 'rgba(255,140,80,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  });
  const LAMPS = [];
  for (let i = 0; i < 10; i++) {
    const z = 3 - i * 12, sx = i % 2 ? 1 : -1, x = sx * 6.3, hx = sx * 5.2;
    const p = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, 5, 6), poleM)); p.position.set(x, 2.5, z); E.circle(x, z, .2);
    box(1.2, .08, .08, poleM, (x + hx) / 2, 4.95, z, { occ: false });
    const head = box(.4, .12, .22, basic({ color: 0xffc27a }), hx, 4.88, z, { occ: false });
    const pool = E.add(new THREE.Mesh(new THREE.PlaneGeometry(noite ? 8 : 6, noite ? 8 : 6),
      basic({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: noite ? 1 : .45 })));
    pool.rotation.x = -Math.PI / 2; pool.position.set(hx * .85, .07, z);
    const li = E.add(new THREE.PointLight(0xffa860, noite ? 70 : 25, 16, 1.6)); li.position.set(hx, 4.6, z);
    LAMPS.push({ x: hx * .8, z, head, pool, li, flick: 0 });
  }
  /* placa NAVIRAÍ */
  const signT = E.canvasTex(64, 24, g => { g.fillStyle = '#1f6a3a'; g.fillRect(0, 0, 64, 24); g.strokeStyle = '#fff'; g.strokeRect(1.5, 1.5, 61, 21); g.fillStyle = '#fff'; g.font = 'bold 11px monospace'; g.textAlign = 'center'; g.fillText('NAVIRAÍ', 32, 12); g.font = 'bold 7px monospace'; g.fillText('CENTRO →', 32, 20); });
  { const sp = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3, 6), poleM)); sp.position.set(5.2, 1.5, 4); E.circle(5.2, 4, .15);
    const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.2, .82), basic({ map: signT, side: THREE.DoubleSide }))); s.position.set(5.2, 3, 4); }

  /* orelhão */
  const OR = new THREE.Vector3(-5.3, 0, -15);
  const orG = E.add(new THREE.Group()); orG.position.copy(OR);
  { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.2, 6), poleM); pl.position.y = 1.1; orG.add(pl);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8, 0, Math.PI * 2, 0, Math.PI * .6), lam({ color: 0xf08a24, side: THREE.DoubleSide }));
    hood.scale.set(1, 1.25, 1); hood.position.set(-.05, 1.62, 0); hood.rotation.z = .9; orG.add(hood);
    const ph = new THREE.Mesh(new THREE.BoxGeometry(.14, .32, .22), lam({ color: 0x3a5a8a })); ph.position.set(.12, 1.45, 0); orG.add(ph);
    const hs = new THREE.Mesh(new THREE.BoxGeometry(.05, .22, .06), lam({ color: 0x222228 })); hs.position.set(.21, 1.5, .07); orG.add(hs); C.handset = hs; }
  E.circle(OR.x, OR.z, .35);
  const orHit = E.hitbox(.8, 1.3, 1.1, OR.x + .2, 1.4, OR.z);
  E.interact(orHit, { label: () => C.ring ? '[E] Atender o orelhão' : C.called ? 'Orelhão' : 'Orelhão (mudo)', act: () => { if (C.ring) answer(); } });
  function answer() {
    C.ring = false; C.calling = true; C.handset.position.y = 1.62; E.sfx.pick();
    const pb = E.gain(.4); const hiss = E.loopNoise('bandpass', 1800, 1.5, .03, pb);
    const v = id => E.voice(id, LINES[id], 'tv', { vol: 1.3 });
    const LINES = { p_orelhao: 'Alô? Oi, amiguinho! Você chegou na cidade!', p_folhinha: 'Deixei uma folhinha pra você pintar. Lá na escola.', p_nao_esquece: 'Não esquece de pintar os olhinhos.' };
    let t = .6; E.later(t, () => { t = v('p_orelhao'); E.later(t + .4, () => { const t2 = v('p_folhinha'); E.later(t2 + .6, () => {
      const t3 = v('p_nao_esquece');
      E.later(t3 + .5, () => { hiss.gain.value = 0; E.noiseHit(.05, .4, 1500); C.handset.position.y = 1.5; C.calling = false; C.called = true; S.flags.orelhao = true; E.save();
        E.toast('Escola Municipal<small>do lado direito da avenida · [H] dica</small>'); });
    }); }); });
  }

  /* escola */
  const schoolWall = lam({ color: 0xe8e0c8 }), schoolOut = lam({ color: 0xd8c890 });
  const D = SCH.door, HW = 3.2;
  box(.3, HW, (D - .6) - SCH.z0, schoolOut, 7.15, HW / 2, (SCH.z0 + D - .6) / 2);
  box(.3, HW, SCH.z1 - (D + .6), schoolOut, 7.15, HW / 2, (SCH.z1 + D + .6) / 2);
  box(.3, HW - 2.2, 1.2, schoolOut, 7.15, 2.2 + (HW - 2.2) / 2, D);
  box(.3, HW, SCH.z1 - SCH.z0, schoolWall, SCH.x1 + .15, HW / 2, (SCH.z0 + SCH.z1) / 2);
  box(SCH.x1 - SCH.x0, HW, .3, schoolWall, (SCH.x0 + SCH.x1) / 2, HW / 2, SCH.z0 - .15);
  box(SCH.x1 - SCH.x0, HW, .3, schoolWall, (SCH.x0 + SCH.x1) / 2, HW / 2, SCH.z1 + .15);
  box(SCH.x1 - SCH.x0 + .6, .3, SCH.z1 - SCH.z0 + .6, schoolOut, (SCH.x0 + SCH.x1) / 2, HW + .15, (SCH.z0 + SCH.z1) / 2, { occ: false });
  box(6, 1.6, 12, lam({ color: 0xc8b880 }), 10, HW + 1.1, -49, { occ: false });
  const tile = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8b098'; g.fillRect(0, 15, w, 1); g.fillRect(15, 0, 1, h); g.fillStyle = '#a04040'; g.fillRect(0, 0, 15, 15); g.fillRect(16, 16, 15, 15); }, [8, 10]);
  { const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(8, 10), lam({ map: tile }))); f.rotation.x = -Math.PI / 2; f.position.set(11, .015, -49);
    const c = E.add(new THREE.Mesh(new THREE.PlaneGeometry(8, 10), lam({ color: 0xe0dccc }))); c.rotation.x = Math.PI / 2; c.position.set(11, HW - .01, -49); }
  const schSign = E.canvasTex(96, 16, g => { g.fillStyle = '#2a4a8a'; g.fillRect(0, 0, 96, 16); g.fillStyle = '#fff'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('ESCOLA MUNICIPAL', 48, 8, 92); g.font = 'bold 6px monospace'; g.fillText('PASSARINHOS DE NAVIRAÍ', 48, 14.5, 92); });
  { const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(4, .66), basic({ map: schSign }))); s.rotation.y = -Math.PI / 2; s.position.set(6.92, 2.7, D); }
  { const hinge = E.add(new THREE.Group()); hinge.position.set(7.05, 0, D + .58); hinge.rotation.y = -1.7;
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(.05, 2.15, 1.15), lam({ color: 0x3a6a9a })); leaf.position.set(0, 1.08, -.57); hinge.add(leaf); }
  // luz fria, uma lâmpada falhando
  const fl = E.add(new THREE.PointLight(0xe8f4ff, 26, 12, 1.6)); fl.position.set(11, 2.9, -49);
  const tubes = [];
  for (const z of [-51, -47]) { const t = box(1.4, .05, .18, basic({ color: 0xf4fbff }), 11, HW - .05, z, { occ: false }); tubes.push(t); }
  // carteiras
  const deskM = lam({ color: 0xb8925a }), metal = lam({ color: 0x4a5a6a });
  for (const x of [9.2, 11.2]) for (const z of [-52.2, -50.6, -47.4, -45.8]) {
    box(.55, .05, .65, deskM, x, .72, z, { occ: false }); box(.5, .7, .05, metal, x, .36, z - .28, { occ: false }); box(.5, .7, .05, metal, x, .36, z + .28, { occ: false });
    box(.4, .04, .4, deskM, x - .55, .44, z, { occ: false }); box(.04, .45, .4, deskM, x - .75, .66, z, { occ: false });
    E.solid(x - .8, x + .3, z - .35, z + .35);
  }
  // mesa da professora e a folha
  box(.8, .06, 1.5, deskM, 13.4, .78, D); box(.75, .75, .06, metal, 13.4, .38, D - .7, { occ: false }); box(.75, .75, .06, metal, 13.4, .38, D + .7, { occ: false });
  E.solid(13, 13.8, D - .78, D + .78);
  // lousa
  const boardT = E.canvasTex(128, 48, g => {
    g.fillStyle = '#25402e'; g.fillRect(0, 0, 128, 48); E.speckle(g, 128, 48, 200, ['#2d4a36', '#20382a']);
    g.fillStyle = '#e8ecdc'; g.font = '8px monospace'; g.fillText('AULA DE ARTES', 8, 12); g.fillText('PINTE O PASSARINHO', 8, 24);
    g.font = '6px monospace'; g.fillText('ele não fala. só assobia.', 8, 36);
    g.fillStyle = 'rgba(240,200,200,.75)'; g.font = '5px monospace'; g.fillText('não pinta os olhos dele', 78, 44);
  });
  box(.06, 1.3, 4, lam({ color: 0x6a4a2a }), SCH.x1 - .04, 1.65, D, { occ: false });
  { const b = E.add(new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.15), basic({ map: boardT }))); b.rotation.y = -Math.PI / 2; b.position.set(SCH.x1 - .13, 1.65, D); }
  // desenhos das crianças nas paredes
  const pxK = E.passarexCanvas(.035, {});
  [[8.6, 1], [10.4, 1], [12.4, 1], [8.8, -1], [10.8, -1], [12.8, -1]].forEach(([x, s], i) => {
    const t = E.canvasTex(32, 40, g => {
      g.fillStyle = '#f4f0e4'; g.fillRect(0, 0, 32, 40);
      g.fillStyle = ['#9fd8ff', '#ffd0e0', '#d8f0b0'][i % 3]; g.fillRect(2, 2, 28, 22);
      g.drawImage(pxK.canvas, 16 - pxK.ox * .9, 36 - pxK.oy * .9, pxK.pw * .9, pxK.ph * .9);
      if (i % 2) { g.fillStyle = '#ffe070'; g.fillRect(13, 12, 2, 2); g.fillRect(17, 12, 2, 2); g.fillStyle = '#c03030'; g.font = '5px monospace'; g.fillText('ELE ME VÊ', 2, 39); }
    });
    const m = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.5, .62), basic({ map: t })));
    m.position.set(x, 1.6, s > 0 ? SCH.z0 + .05 : SCH.z1 - .05); m.rotation.y = s > 0 ? 0 : Math.PI; m.rotation.z = (rnd() - .5) * .15;
  });

  /* a página de colorir */
  const PG = { W: 160, H: 200 };
  const REG = { ceu: 1, chao: 2, sol: 3, casa: 4, telhado: 5, corpo: 6, cabeca: 7, barriga: 8, olhos: 9 };
  const NOME = ['', 'o céu', 'o chão', 'o sol', 'a casinha', 'o telhado', 'o corpo', 'a cabeça', 'a barriga', 'os olhos'];
  const regMap = new Uint8Array(PG.W * PG.H), edge = new Uint8Array(PG.W * PG.H);
  (function buildRegions() {
    const c = document.createElement('canvas'); c.width = PG.W; c.height = PG.H; const g = c.getContext('2d');
    const col = id => `rgb(${id * 25},0,0)`;
    g.fillStyle = col(REG.ceu); g.fillRect(0, 0, PG.W, PG.H);
    g.fillStyle = col(REG.chao); g.beginPath(); g.ellipse(80, 236, 150, 74, 0, 0, 7); g.fill();
    g.fillStyle = col(REG.sol); g.beginPath(); g.arc(132, 30, 15, 0, 7); g.fill();
    g.fillStyle = col(REG.casa); g.fillRect(112, 132, 32, 28);
    g.fillStyle = col(REG.telhado); g.beginPath(); g.moveTo(106, 133); g.lineTo(128, 112); g.lineTo(150, 133); g.fill();
    const t = document.createElement('canvas'); t.width = PG.W; t.height = PG.H; const tg = t.getContext('2d');
    tg.translate(58, 184); tg.scale(.19, .19); window.drawPassarex(tg, 1.6, { sil: true });
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col(REG.corpo); tg.fillRect(0, 0, PG.W, PG.H);
    g.drawImage(t, 0, 0);
    g.fillStyle = col(REG.barriga); g.beginPath(); g.ellipse(57, 124, 13, 22, 0, 0, 7); g.fill();
    g.fillStyle = col(REG.cabeca); g.beginPath(); g.ellipse(58, 70, 22, 19, 0, 0, 7); g.fill();
    g.fillStyle = col(REG.olhos); for (const ex of [-8, 8]) { g.beginPath(); g.arc(58 + ex, 70, 5.5, 0, 7); g.fill(); }
    const d = g.getImageData(0, 0, PG.W, PG.H).data;
    for (let i = 0; i < regMap.length; i++) regMap[i] = d[i * 4 + 3] < 128 ? REG.ceu : Math.max(1, Math.min(9, Math.round(d[i * 4] / 25)));
    for (let y = 0; y < PG.H; y++) for (let x = 0; x < PG.W; x++) {
      const i = y * PG.W + x, r = regMap[i];
      edge[i] = (x < PG.W - 1 && regMap[i + 1] !== r) || (y < PG.H - 1 && regMap[i + PG.W] !== r) || (x > 0 && regMap[i - 1] !== r) || (y > 0 && regMap[i - PG.W] !== r) ? 1 : 0;
    }
  })();
  const paint = {};
  const pageC = document.createElement('canvas'); pageC.width = PG.W; pageC.height = PG.H;
  function renderPage(cv) {
    const g = cv.getContext('2d'), img = g.createImageData(PG.W, PG.H), d = img.data;
    const rgb = {}; for (const k in paint) { const c = new THREE.Color(paint[k]); rgb[k] = [c.r * 255, c.g * 255, c.b * 255]; }
    for (let i = 0; i < regMap.length; i++) {
      let r = 252, gg = 250, b = 244;
      if (edge[i]) { r = 34; gg = 30; b = 36; } else if (rgb[regMap[i]]) [r, gg, b] = rgb[regMap[i]];
      d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  renderPage(pageC);
  const pageT = E.texFrom(pageC);
  const page = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.32, .4), basic({ map: pageT })));
  page.rotation.x = -Math.PI / 2; page.rotation.z = -Math.PI / 2 + .15; page.position.set(13.35, .815, D);
  const crayons = [0xe8505a, 0xf3d84a, 0x5a9be0, 0x6cc46a];
  crayons.forEach((c, i) => { const m = box(.12, .025, .025, lam({ color: c }), 13.2 + i * .03, .82, D + .32 + i * .05, { occ: false }); m.rotation.y = .4; });
  E.interact(page, { label: () => C.page ? '[E] Ver o desenho' : '[E] Pintar a folhinha', act: () => C.page ? E.note(backNote()) : openPaint() });

  const CORES = ['#e8505a', '#f39a3a', '#f3d84a', '#6cc46a', '#5a9be0', '#9a6ad0', '#f2a6c8', '#8a5a3a', '#2a2a30'];
  function openPaint() {
    S.painting = true; S.noteOpen = true;
    document.exitPointerLock && document.exitPointerLock();
    const ov = document.createElement('div'); ov.id = 'colorir';
    ov.innerHTML = `<style>
      #colorir{position:fixed;inset:0;z-index:50;background:rgba(6,6,12,.9);display:flex;align-items:center;justify-content:center;gap:18px;padding:12px;font-family:'VT323',monospace;color:#ffe9a8}
      #colorir canvas{height:min(84vh,460px);aspect-ratio:160/200;image-rendering:pixelated;cursor:crosshair;box-shadow:0 0 0 6px #f4f0e4,0 8px 30px #000;transform:rotate(-1deg);touch-action:none}
      #colorir .side{display:flex;flex-direction:column;gap:10px;max-width:220px}
      #colorir h3{margin:0;font-size:26px;font-weight:normal;letter-spacing:.05em}
      #colorir .pal{display:grid;grid-template-columns:repeat(3,52px);gap:8px}
      #colorir .pal button{width:52px;height:40px;border:3px solid #111;border-radius:6px;cursor:pointer}
      #colorir .pal button.on{border-color:#fff;transform:scale(1.08)}
      #colorir .ok{font:inherit;font-size:26px;padding:6px 14px;background:#ffe9a8;color:#111;border:0;cursor:pointer}
      #colorir small{font-size:18px;opacity:.75}
      @media (max-height:420px){#colorir .pal{grid-template-columns:repeat(3,44px)}#colorir .pal button{width:44px;height:32px}#colorir h3{font-size:20px}}
    </style>
    <canvas width="${PG.W}" height="${PG.H}"></canvas>
    <div class="side"><h3>PINTE O PASSARINHO</h3><small>escolha uma cor e toque numa parte do desenho</small>
      <div class="pal">${CORES.map((c, i) => `<button data-c="${c}" style="background:${c}" class="${i ? '' : 'on'}"></button>`).join('')}</div>
      <small class="msg">&nbsp;</small><button class="ok">PRONTO</button></div>`;
    document.body.appendChild(ov);
    const cv = ov.querySelector('canvas'), msg = ov.querySelector('.msg');
    let cor = CORES[0];
    renderPage(cv);
    ov.querySelector('.pal').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cor = b.dataset.c; ov.querySelectorAll('.pal button').forEach(x => x.classList.toggle('on', x === b)); });
    const at = (cx, cy) => {
      const r = cv.getBoundingClientRect();
      let x = Math.floor((cx - r.left) / r.width * PG.W), y = Math.floor((cy - r.top) / r.height * PG.H);
      for (let k = 0; k < 9; k++) {   // caiu na linha? procura o lado mais perto
        const xx = Math.max(0, Math.min(PG.W - 1, x + (k % 3) - 1)), yy = Math.max(0, Math.min(PG.H - 1, y + ((k / 3) | 0) - 1));
        if (!edge[yy * PG.W + xx]) return regMap[yy * PG.W + xx];
      }
      return 0;
    };
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); const id = at(e.clientX, e.clientY); if (!id) return;
      paint[id] = cor; E.sfx.pick();
      if (id === REG.olhos) {
        paint[id] = '#f4e2a8';
        if (!C.eyes) { C.eyes = true; S.flags.olhos = true; S.noticed++; E.whistle(.07); E.voice('p_agora_vejo', 'Agora eu consigo te ver.', 'tv'); msg.textContent = '(os olhos acenderam sozinhos)'; }
      } else msg.textContent = 'você pintou ' + NOME[id];
      renderPage(cv);
    });
    ov.querySelector('.ok').addEventListener('click', () => {
      if (Object.keys(paint).length < 3) { msg.textContent = 'pinta mais um pouquinho'; return; }
      ov.remove(); S.painting = false; S.noteOpen = false;
      renderPage(pageC); pageT.needsUpdate = true;
      C.page = true; S.clues.colorir = true; E.save();
      if (!C.eyes) { E.conquista('sem_olhos'); E.later(.3, () => E.voice('p_que_bonito', 'Que desenho bonito.', 'tv')); }
      E.later(.2, () => E.note(backNote()));
    });
  }
  const backNote = () => `<small>ESCOLA MUNICIPAL DE NAVIRAÍ · AULA DE ARTES · 2ª SÉRIE</small>
    <h2>O passarinho de Naviraí</h2>
    <p>Atrás da folha, alguém escreveu com lápis de cor: <b>“ele pede pra todo mundo pintar ele. quem pinta os olhos, ele enxerga de volta.”</b></p>
    <p>${C.eyes ? 'Você pintou os olhos.' : 'Você não pintou os olhos.'}</p>
    <p class="hand">depois da aula, cada um vai direto pra casa</p>`;

  /* a sua casa, no fim da avenida */
  const houseT = E.canvasTex(128, 48, g => {
    g.fillStyle = '#e8c8b8'; g.fillRect(0, 0, 128, 48); E.speckle(g, 128, 48, 300, ['#dcb8a8', '#f0d4c4']);
    g.fillStyle = '#b05a4a'; g.fillRect(0, 0, 128, 4);
    g.fillStyle = '#8a8070'; g.fillRect(0, 40, 128, 8);
  });
  box(16, 3.4, .6, lam({ map: houseT }), 0, 1.7, END_Z - .3);
  { const rg = new THREE.CylinderGeometry(.01, 5, 2.2, 4, 1); rg.rotateY(Math.PI / 4); const roof = E.add(new THREE.Mesh(rg, lam({ color: 0x9a4a3a }))); roof.position.set(0, 4.5, END_Z - 3.45); roof.scale.set(2.4, 1, 1); }
  box(16, 3.4, 6, lam({ color: 0xd8b8a8 }), 0, 1.7, END_Z - 3.6, { occ: false });
  const hdoor = box(1.1, 2.1, .1, lam({ color: 0x7a5636 }), 1.8, 1.05, END_Z + .02);
  box(.07, .07, .07, lam({ color: 0xc8b070 }), 1.4, 1.0, END_Z + .1, { occ: false });
  const winC = document.createElement('canvas'); winC.width = 32; winC.height = 24; const winT = E.texFrom(winC), winG = winC.getContext('2d');
  const win = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), basic({ map: winT, fog: false }))); win.position.set(-2.4, 1.6, END_Z + .05);
  for (const [w, h, x, y] of [[1.55, .08, -2.4, 2.12], [1.55, .08, -2.4, 1.08], [.08, 1.1, -3.13, 1.6], [.08, 1.1, -1.67, 1.6], [.05, 1, -2.4, 1.6]]) box(w, h, .06, lam({ color: 0xe8e0d0 }), x, y, END_Z + .05, { occ: false });
  const numT = E.canvasTex(16, 8, g => { g.fillStyle = '#2a4a8a'; g.fillRect(0, 0, 16, 8); g.fillStyle = '#fff'; g.font = '7px monospace'; g.fillText('1367', 0, 7); });
  { const n = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.4, .2), basic({ map: numT }))); n.position.set(2.8, 2.0, END_Z + .06); }
  const winLight = E.add(new THREE.PointLight(0x9fb4ff, 0, 7, 1.6)); winLight.position.set(-2.4, 1.6, END_Z + 1.2);
  E.interact(hdoor, {
    label: () => C.page ? '[E] Abrir a porta de casa' : 'A porta de casa',
    act: () => {
      if (!C.page) { E.sfx.knob(); E.say(C.called ? '(Ainda não. A folhinha tá me esperando na escola.)' : '(Trancada. E aquele orelhão não para de tocar...)', 3.5); return; }
      if (C.going) return; C.going = true; E.sfx.knob();
      E.say('(Trancada. A chave ficou no centro. O rádio do vizinho chia: “atenção, centro de Naviraí...”)', 4.5);
      E.later(4, () => { E.glitchText('CENTRO', .6); E.later(.5, () => E.goTo('centro')); });
    }
  });
  function finale() {
    if (C.going) return; C.going = true;
    const pistas = ['recorte', 'diario', 'colorir'].filter(k => S.clues[k]).length;
    const fin = pistas === 3 && S.penas >= 3 && S.noticed <= 1 ? 'C' : S.noticed >= 3 ? 'B' : 'A';
    S.flags.final = fin; E.sfx.knob(); E.sfx.creak();
    E.later(.6, () => E.goTo('casa'));
  }

  /* ele, sempre um poste à frente */
  const px = E.add(E.sticker(1.8, { sil: true, eyes: true, s: .14 }));
  px.visible = false;
  const tmp = new THREE.Vector3();
  function updatePx(dt, p) {
    if (C.pxCd > 0) C.pxCd -= dt;
    const inSchool = p.x > 7;
    if (px.visible) {
      const d = Math.hypot(px.position.x - p.x, px.position.z - p.z);
      const look = E.looking(tmp.set(px.position.x, 1.4, px.position.z), .97);
      if (look) { C.lookT += dt; if (C.lookT > 2.6 && !C.counted) { C.counted = true; S.noticed++; E.say('(Não olha muito tempo pra ele.)', 3); E.whistle(.03, { pan: E.pan(px.position) }); } }
      if (d < 10 || inSchool || C.going) {
        px.visible = false; C.pxCd = 5 + rnd() * 4; L.glitchT = .35;
        E.whistle(.045, { pan: E.pan(px.position) }); E.noiseHit(.3, .12, 2500, null, 'highpass');
      }
    } else if (C.pxCd <= 0 && !inSchool && !C.going && !C.calling) {
      const opts = LAMPS.map((l, i) => i).filter(i => LAMPS[i].z < p.z - 16 && LAMPS[i].z > p.z - 30 && i !== C.spot);
      if (opts.length) {
        const i = opts[(rnd() * opts.length) | 0], l = LAMPS[i];
        tmp.set(l.x, 1.4, l.z);
        if (!E.looking(tmp, .9)) { C.spot = i; px.position.set(l.x, 0, l.z); px.visible = true; l.flick = .5; }
      }
    }
  }

  /* som: vento, cigarras (de tarde) ou grilos (de noite), cachorro longe */
  L.ambience = bus => {
    E.loopNoise('lowpass', 300, 0, .045, bus);
    E.loopNoise('bandpass', noite ? 4200 : 6200, 8, noite ? .02 : .016, bus);
    C.ringBus = E.gain(0, bus);
  };
  let bark = 9, chirp = 0, ringT = 0;
  L.enter = () => {
    E.later(12, () => E.tutorial('avenida', 'A avenida de Naviraí', [['E', '✋', 'atender o orelhão, falar com o Serjão, entrar na escola'], ['clique', 'toque', 'na folhinha: escolha uma cor e clique na parte do desenho'], ['🪙', '🪙', 'moedas: é só passar por cima']], 'Siga a avenida. Um orelhão vai tocar.'));
    E.later(1, () => E.voice('n_avenida', 'Avenida principal de Naviraí. A data da gravação foi apagada.', 'nar'));
    E.later(6.5, () => E.toast(`A avenida de Naviraí<small>${noite ? 'quase meia-noite' : 'fim de tarde'} · [H] dica</small>`));
    E.later(9, () => E.say('(Naviraí? Eu moro aqui. Mas tá tudo fechado.)', 4));
  };
  L.update = dt => {
    const p = E.player.pos, ac = E.ac();
    sky.position.set(E.camera.position.x, 0, E.camera.position.z);
    drawTVs(L.t);
    // orelhão
    if (!C.ring && !C.called && !C.calling && p.z < -4 && !S.flags.orelhao) { C.ring = true; ringT = 0; }
    if (S.flags.orelhao && !C.called) C.called = true;
    if (C.ring) {
      ringT += dt;
      const ph = ringT % 3.2;
      if (ph < dt && C.ringBus) { E.tone(440, 1.2, .09, 'square', C.ringBus); E.tone(480, 1.2, .09, 'square', C.ringBus); E.tone(440, 1.0, .09, 'square', C.ringBus, 1.5); E.tone(480, 1.0, .09, 'square', C.ringBus, 1.5); }
      if (C.ringBus && ac) C.ringBus.gain.value = Math.min(.8, 6 / (1 + p.distanceTo(OR)));
      C.handset.position.x = .21 + (ph < 1.2 ? (Math.random() - .5) * .01 : 0);
    } else if (C.ringBus) C.ringBus.gain.value = 0;
    // falas soltas
    if (!C.said.loc && Math.abs(p.z - shops[1].z) < 4 && p.x < -2) { C.said.loc = true; E.say('(A locadora. As TVs da vitrine tão ligadas.)', 3.5); }
    if (!C.said.pad && p.z < shops[8].z + 4) { C.said.pad = true; E.say('(Essa padaria de novo? Eu já passei por ela.)', 3.5); }
    if (!C.said.esc && p.x > 7.8) { C.said.esc = true; E.say('(A minha escola. A luz ficou acesa.)', 3); }
    if (C.page && !C.said.casa && p.x < 6) { C.said.casa = true; E.later(1, () => E.voice('p_vai_pra_casa', 'Tá ficando tarde. Vai pra casa, amiguinho.', 'tv')); }
    // postes: piscam devagar quando ele aparece
    for (const l of LAMPS) {
      if (l.flick > 0) l.flick -= dt;
      const on = !(l.flick > 0 && Math.floor(l.flick / .25) % 2);
      l.li.intensity = on ? (noite ? 70 : 25) : 2; l.pool.visible = on; l.head.material.color.setHex(on ? 0xffc27a : 0x3a3020);
    }
    // escola: uma lâmpada fraquejando, sem piscar rápido
    const fk = (Math.sin(L.t * .7) + Math.sin(L.t * 1.9)) > 1.5;
    fl.intensity = fk ? 12 : 26; tubes[0].material.color.setHex(fk ? 0x8a9098 : 0xf4fbff);
    // janela de casa: luz de TV
    const tf = .6 + .4 * Math.sin(L.t * 3) * Math.sin(L.t * 1.3);
    winG.fillStyle = `rgb(${40 + tf * 60 | 0},${60 + tf * 80 | 0},${120 + tf * 110 | 0})`; winG.fillRect(0, 0, 32, 24);
    winG.fillStyle = 'rgba(20,10,20,.8)'; winG.fillRect(4, 14, 14, 10); winG.fillRect(2, 0, 3, 24); winG.fillRect(27, 0, 3, 24);
    winT.needsUpdate = true; winLight.intensity = 2 + tf * 4;
    // ele
    updatePx(dt, p);
    L.serjTick && L.serjTick(L.t);
    L.heliTick && L.heliTick(dt);
    if (L.glitchT > 0) L.glitchT -= dt;
    L.glitch = L.glitchT > 0 ? .5 : 0;
    // grilos / cachorro
    chirp -= dt; if (chirp <= 0 && noite) { chirp = .9 + rnd() * 2; E.tone(4300, .05, .012, 'sine', null, 0); E.tone(4300, .05, .012, 'sine', null, .09); }
    bark -= dt; if (bark <= 0) { bark = 14 + rnd() * 16; for (let k = 0; k < 2; k++) { E.noiseHit(.12, .05, 500, null, 'bandpass'); E.tone(320, .1, .02, 'sawtooth', null, k * .22, 0, 200); } }
  };
  L.exit = () => { const ov = document.getElementById('colorir'); if (ov) ov.remove(); S.painting = false; };
  /* segredos do Clubex na avenida */
  { const sj = shops.find(b => b.name.startsWith('ESPETINHO'));
    E.ovo('serjao', E.hitbox(.3, 2.2, 6, 6.9, 1.2, sj.z), 'Espetinho do Serjão', () => E.say('(Na porta, uma plaquinha nova: “VOLTEI. Mas só asso se pedirem.” — Serjão)', 4.5));
    // o Serjão voltou! Na calçada, assando espeto (mas só se você pedir)
    const SX = 5.5, SZ = sj.z + 2.4;
    const serj = E.add(E.club('serjao', 1.85)); serj.position.set(SX + .4, 0, SZ); E.circle(SX + .4, SZ, .35);
    box(.9, .75, .5, lam({ color: 0x3a3a3e }), SX - .5, .38, SZ - .1, { solid: true });
    box(.95, .06, .55, lam({ color: 0x1a1a1a }), SX - .5, .78, SZ - .1, { occ: false });
    const brasa = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.8, .45), basic({ color: 0xff6a1a }))); brasa.rotation.x = -Math.PI / 2; brasa.position.set(SX - .5, .79, SZ - .1);
    const espM = lam({ color: 0x8a4a22 }), espetos = [];
    for (let k = 0; k < 4; k++) { const e = box(.06, .06, .5, espM, SX - .8 + k * .2, .86, SZ - .1, { occ: false }); espetos.push(e); }
    const grillL = E.add(new THREE.PointLight(0xff7a2a, 8, 4, 1.6)); grillL.position.set(SX - .5, 1.1, SZ - .1);
    const smokeM = basic({ color: 0xbab0a8, transparent: true, opacity: .35, depthWrite: false });
    const smoke = []; for (let k = 0; k < 6; k++) { const s = E.add(new THREE.Mesh(new THREE.SphereGeometry(.12, 5, 4), smokeM)); s.userData.ph = k / 6; smoke.push(s); }
    L.serjTick = t => { for (const s of smoke) { const k = (t * .35 + s.userData.ph) % 1; s.position.set(SX - .5 + Math.sin(k * 6 + s.userData.ph * 9) * .15, .9 + k * 2.2, SZ - .1); s.scale.setScalar(.6 + k * 2.4); s.material.opacity = .35 * (1 - k); } grillL.intensity = 7 + Math.sin(t * 9) * 1.5; };
    const SJ = '#ffb070';
    let ocupado = false;
    E.interact(E.hitbox(1.2, 1.9, 1, SX, .95, SZ), { label: () => S.dlg ? '' : '[E] Falar com o Serjão', act: async () => {
      if (ocupado || S.dlg) return; ocupado = true;
      try {
        if (!S.flags.espeto) await E.conversa([
          ['SERJÃO', 'Boa noite, boa noite! Serjão dos Espetos, rei da churrasqueira, mestre do espeto e do molho.', SJ],
          ['SERJÃO', 'Mas presta atenção: eu só asso se pedirem. Se ninguém pede, eu não asso.', SJ],
          ['SERJÃO', 'Teve um dia que ninguém pediu. Eu fechei a grelha e fui embora. A Confraria inteira ficou esperando eu voltar...', SJ],
          ['SERJÃO', '...e eu voltei. Hoje a grelha tá acesa. E tem o ESPETÃO, pra quem tiver moeda.', SJ],
          ['SERJÃO', 'Mas olha... cê viu o jornal? Tão falando de um tal de Passarex. Metade da freguesia nem sai mais de casa.', SJ],
          ['SERJÃO', 'Dizem que ele assobia antes de aparecer. Se ouvir um “fiu fiu”... não olha muito tempo, viu?', SJ],
        ]);
        else await E.conversa([['SERJÃO', 'Voltou! Vai querer o quê? É só pedir.', SJ]]);
        const temEspetao = E.META.inv && E.META.inv.espetao;
        const ops = ['Pedir um espeto', temEspetao ? 'Já tenho o ESPETÃO' : `Comprar o ESPETÃO (5 🪙 · você tem ${E.saldo()})`, 'Só tô olhando'];
        const i = await E.choice('Serjão dos Espetos', ops, 2, 12);
        if (i === 2) { await E.conversa([['SERJÃO', 'Tranquilo. Sem pedido, sem espeto. É a regra.', SJ]]); return; }
        if (i === 1) {
          if (temEspetao) { await E.conversa([['SERJÃO', 'Esse aí é pra vida toda. Cuida bem dele.', SJ]]); return; }
          if (E.saldo() < 5) { await E.conversa([['SERJÃO', 'O ESPETÃO é 5 moedas, parceiro. Junta mais umas aí pela cidade e volta.', SJ]]); return; }
          E.META.gastas = (E.META.gastas || 0) + 5; E.salvarMeta();
          for (let k = 0; k < 8; k++) E.later(k * .2, () => E.noiseHit(.3, .08, 3000, null, 'highpass'));
          await E.conversa([['SERJÃO', 'O ESPETÃO! Ninguém pede o ESPETÃO! Hoje é dia!', SJ], ['SERJÃO', 'Toma. Um metro de espeto. Carrega com orgulho.', SJ], ['VOCÊ', '(Você ganhou o ESPETÃO do Serjão. Ele está no inventário, e já está na sua mão.)']]);
          E.ganhaItem('espetao'); E.segurar('espetao');
          E.conquista('espeto'); return;
        }
        for (let k = 0; k < 5; k++) E.later(k * .25, () => E.noiseHit(.3, .08, 3000, null, 'highpass'));
        await E.conversa([['SERJÃO', 'Pedido feito! Ó o barulhinho...', SJ], ['SERJÃO', 'Espetinho no capricho, com farofa. Toma!', SJ], ['VOCÊ', '(Você ganhou um espeto do Serjão. Ele está no inventário: dá pra segurar ou comer.)']]);
        E.ganhaItem('espeto');
        S.flags.espeto = true; E.save(); E.conquista('espeto'); espetos[0].visible = false;
      } finally { ocupado = false; }
    } });
    const az = 2 - 3 * BW + BW / 2;
    const rat = E.add(E.club('ratabrumga', .32)); rat.position.set(-6.85, 0, az);
    E.ovo('rata', E.hitbox(.6, .5, .8, -6.85, .25, az), 'Tem algo no beco', () => { E.say('(A Ratabrumga. Índole questionável. Ela olha pro seu boné.)', 4); E.tone(1800, .08, .03, 'square'); }); }
  /* um helicóptero vazio, sem ninguém dentro, passa engasgando e cai atrás dos prédios */
  const heli = new THREE.Group(); E.add(heli); heli.visible = false;
  { const cor = lam({ color: 0x3a4a5a }), escuro = lam({ color: 0x15181c }), vidro = basic({ color: 0x8ab0c8, transparent: true, opacity: .55 });
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), cor); corpo.scale.set(1, .8, 1.5); heli.add(corpo);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.95, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), vidro); cab.position.set(0, .2, -.9); cab.rotation.x = -.6; heli.add(cab);
    const cauda = new THREE.Mesh(new THREE.BoxGeometry(.28, .28, 4), cor); cauda.position.set(0, .3, 2.8); heli.add(cauda);
    const aleta = new THREE.Mesh(new THREE.BoxGeometry(.08, 1, .6), cor); aleta.position.set(0, .8, 4.6); heli.add(aleta);
    for (const sx of [-1, 1]) { const esqui = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 2.6), escuro); esqui.position.set(sx * .8, -1.15, 0); heli.add(esqui); }
    const rotor = new THREE.Group(); rotor.position.y = 1.2; heli.add(rotor);
    for (const r of [0, Math.PI / 2]) { const pa = new THREE.Mesh(new THREE.BoxGeometry(7, .05, .25), escuro); pa.rotation.y = r; rotor.add(pa); }
    const luz = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 4), basic({ color: 0xff3030 })); luz.position.set(0, -.6, 0); heli.add(luz);
    const holo = new THREE.Mesh(new THREE.CylinderGeometry(.15, 3.2, 14, 10, 1, true), basic({ color: 0x8a8060, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    holo.position.set(0, -7.5, -1); heli.add(holo);
    const farol = new THREE.PointLight(0xfff0c0, 30, 30, 1.4); farol.position.set(0, -2, -1); heli.add(farol);
    heli.userData = { rotor, luz }; heli.scale.setScalar(1.3); }
  const fumaca = [], fogoL = E.add(new THREE.PointLight(0xff6a1a, 0, 30, 1.4));
  const fumM = basic({ color: 0x2a2624, transparent: true, opacity: .5, depthWrite: false });
  let H = null;
  function heliCai() {
    if (H || S.flags.heli) return; S.flags.heli = true;
    H = { t: 0 }; heli.visible = true; heli.position.set(-40, 19, -84);
  }
  E.trigger(p => p.z < -58 && C.page, () => heliCai());
  L.heliTick = dt => {
    if (!H) return;
    H.t += dt; const t = H.t, ud = heli.userData;
    ud.rotor.rotation.y += dt * (t < 4 ? 26 : 26 * Math.max(.2, 1 - (t - 4) / 3));
    ud.luz.visible = Math.floor(t * 2) % 2 === 0;
    if (t < 4) {   // passa engasgando, com o motor falhando
      heli.position.x = -40 + t * 11; heli.position.y = 19 - t * .5; heli.rotation.z = Math.sin(t * 3) * .15;
      if (Math.random() < dt * 3) E.noiseHit(.15, .06, 400);
      if (!H.som) { H.som = 1; E.say('(Um helicóptero. Tá fazendo um barulho estranho.)', 3.5); }
    } else if (t < 7.2) {   // gira e cai
      const k = t - 4; heli.position.x = 4 + k * 3; heli.position.y = Math.max(0, 17 - k * k * 1.9); heli.rotation.y += dt * (2 + k * 2); heli.rotation.z = .4;
      if (Math.random() < dt * 8) E.noiseHit(.2, .05, 600);
      if (!H.cai) { H.cai = 1; E.tone(300, 2.5, .05, 'sawtooth', null, 0, 0, 60); }
    } else if (!H.bum) {   // a queda: um estrondo, fogo e uma coluna de fumaça que fica
      H.bum = 1; heli.visible = false;
      E.noiseHit(1.6, .5, 160); E.noiseHit(.8, .3, 900); E.tone(48, 1.2, .2, 'sine'); L.glitchT = .6;
      fogoL.position.set(14, 3, -92); fogoL.intensity = 60;
      for (let k = 0; k < 14; k++) { const f = E.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 5), fumM)); f.userData.ph = k / 14; fumaca.push(f); }
      E.later(1.2, () => E.say('(Caiu. Atrás dos prédios. Não tinha ninguém lá dentro... tinha?)', 4.5));
    }
    if (H.bum) {
      fogoL.intensity = 40 + Math.sin(L.t * 9) * 8;
      for (const f of fumaca) { const k = (L.t * .08 + f.userData.ph) % 1; f.position.set(14 + Math.sin(k * 5 + f.userData.ph * 9) * 1.5, 2 + k * 26, -92 + Math.cos(k * 4) * 1.2); f.scale.setScalar(1 + k * 3); f.material.opacity = .5 * (1 - k); }
    }
  };
  E.moedas([[-3, null, -15], [-3, null, -35], [3, null, -55], [0, null, -75], [0, null, -95], [10, null, -47]]);
  L.hint = () => {
    const p = E.player.pos;
    if (!C.called) return { text: C.ring ? 'Tem um orelhão tocando na calçada da esquerda.' : 'Siga pela avenida.', target: OR.clone().setY(1.4) };
    if (!C.page) {
      const door = new THREE.Vector3(6.2, 1.2, D), desk = new THREE.Vector3(12.6, 1, D);
      return { text: 'A escola fica do lado direito da avenida. A folhinha está na mesa da professora.', path: p.x > 7 ? [desk] : [door, new THREE.Vector3(8.5, 1.2, D), desk] };
    }
    if (p.x > 7) return { text: 'Saia da escola e siga a avenida até o fim. Sua casa está lá.', path: [new THREE.Vector3(6, 1.2, D), new THREE.Vector3(1.8, 1.2, END_Z + 1.5)] };
    return { text: 'Siga a avenida até o fim. Sua casa está lá.', target: new THREE.Vector3(1.8, 1.2, END_Z + 1.5) };
  };
  L.debug = { C, paintAll: eyes => { for (const k of [1, 2, 3, 6]) paint[k] = '#5a9be0'; if (eyes) { paint[9] = '#f4e2a8'; C.eyes = true; S.noticed++; } C.called = true; S.flags.orelhao = true; C.page = true; S.clues.colorir = true; renderPage(pageC); pageT.needsUpdate = true; }, finale, openPaint };
}
