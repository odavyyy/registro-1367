// FASE 8 · A floresta de cogumelos. Igual ao curta em stop motion: o Mago, o Macaco, o Pássaro das Esferas
// (que só concede se você pedir) e o Pássaro Cocô. Aqui se monta as máquinas de goiaba para a luta.
import { kit } from './mundo.js';

export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(1025);
  const Q = S.flags.centro = S.flags.centro || { st: 0, found: {} };
  E.scene.background = new THREE.Color(0x1a1450);
  E.scene.fog = new THREE.FogExp2(0x38268c, .017);
  E.camera.far = 90;
  L.floor = 'grass'; L.speed = 2.1; L.eye = 1.6; L.reach = 2.4;
  E.osd('▶ PLAY', 'FLORESTA DE COGUMELOS · ??:??');
  L.clock = t => (Math.floor(t * 1.3) % 5 === 0 ? '?' : '0') + '0:67';
  const { lam, basic, box } = E;
  const C = { talking: false, said: {} };
  const R = 15;
  const talos = [0, 1, 2, 3, 4].flatMap(i => [[-1.95, -R + .2 - i * 1.25], [1.95, -R + .2 - i * 1.25]]);
  const barrado = (x, z) => (Q.mata >= 1 ? talos.some(([a, b]) => Math.hypot(x - a, z - b) < .42) : Math.abs(x) < 3.3 && z < -R + .3 && z > -R - 2.4);   // o mato fechado (ou os talos do corredor)
  L.walkable = (x, z) => (Math.hypot(x, z) < R + 5.5 && !barrado(x, z)) || (x > 12 && x < 22 && Math.abs(z + 1.5) < 1.2) || Math.hypot(x - 23.6, z + 1.5) < 2.7 || (Math.abs(x) < 1.6 && z > 0 && z < R + 5) || (Q.mata >= 1 && Math.abs(x) < 1.5 && z < 0 && z > -R - 5);
  L.spawn = S.prevId === 'matagale' ? { x: 0, z: -R - 2.6, yaw: Math.PI } : { x: 0, z: R + 3.5, yaw: 0 };

  /* ---------- o cenário: um planalto de cogumelos no alto de um penhasco, com vista pro vale, pro castelo e pros dragões ---------- */
  const Z = kit(E, L);
  const longe = E.add(new THREE.Group());   // céu, lua e serras: acompanham o jogador (parecem infinitos)
  longe.add(Z.ceu({
    grad: [[1, '#070626'], [.55, '#1a1460'], [.25, '#3a2494'], [.07, '#7a3cb0'], [-.02, '#c25aa8'], [-.18, '#2a2470'], [-1, '#0a0a24']],
    nuvens: { cor: '#4a2ab4', cor2: '#c48cff', de: .47, ate: .74, escala: 2.2, torce: .9, forca: .85, alt0: .0, alt1: .62 },
    estrelas: 900, espiral: { az: Math.PI + .28, el: .62, raio: .62, cor: '#bfe4ff', cor2: '#5a52e0', bracos: 3, torce: 8 },
    clarao: [{ az: Math.PI - .15, el: .05, raio: .9, cor: '#ff7ab0', forca: .75 }, { az: Math.PI / 2, el: .02, raio: .7, cor: '#4ae0d0', forca: .4 }],
  }));
  Z.lua(longe, { az: Math.PI - .27, el: .31, tam: 8.5, cor: '#f2f0ff', sombra: '#8c92d8', halo: '#8a7cff' });
  Z.serra(longe, { raio: 78, base: -22, alt: 20, pico: 17, cor: '#2a2276', bruma: '#7a46ac', freq: 4.2, seed: 2 });
  Z.serra(longe, { raio: 70, base: -24, alt: 17, pico: 12, cor: '#141248', bruma: '#43308c', freq: 6, seed: 5 });
  E.add(new THREE.HemisphereLight(0xb4a6ff, 0x1e3c34, 1.9));
  const moon = E.add(new THREE.DirectionalLight(0xa8bcff, 1.25)); moon.position.set(10, 16, -18);
  const rosa = E.add(new THREE.DirectionalLight(0xff8ac0, .35)); rosa.position.set(-14, 6, -10);

  // o planalto e o paredão
  const BORDA = R + 6.6;
  const moss = E.canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#1f4a3a'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 1100, ['#173c32', '#2a5e42', '#38704a', '#3a3a78', '#245046']); }, [11, 11]);
  const gr = E.add(new THREE.Mesh(new THREE.CircleGeometry(BORDA, 40), lam({ map: moss }))); gr.rotation.x = -Math.PI / 2;
  const pedraM = Z.solido('#2c2a5e', { emissive: new THREE.Color('#0e0c2a') });
  const pared = Z.malha(L.group, new THREE.CylinderGeometry(BORDA, BORDA - 4, 12, 40, 3, true), pedraM, 0, -6.02, 0);
  { const p = pared.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 5.9) continue; const x = p.getX(i), z = p.getZ(i), k = 1 + (Z.ruido(x * .5, y * .6, z * .5) - .5) * .22; p.setXYZ(i, x * k, y, z * k); } pared.geometry.computeVertexNormals(); }
  const naVista = a => { const d = x => Math.abs(Math.atan2(Math.sin(a - x), Math.cos(a - x))); return d(Math.PI) < .98 || d(Math.PI / 2) < .42; };
  // mureta natural de pedras na beirada
  Z.copias(L.group, Z.rocha(1, .4, 0), Z.solido('#3a3878', { emissive: new THREE.Color('#121038') }), 90, (o, i) => { const a = i / 90 * Math.PI * 2, r = BORDA - .35 + (Z.R() - .5) * .5; if (Math.abs(Math.sin(a)) * r < 2.4 || (Math.sin(a) > 0 && Math.abs(Math.cos(a) * r + 1.5) < 2.2)) { o.scale.setScalar(0); return; } o.position.set(Math.sin(a) * r, .05, Math.cos(a) * r); o.rotation.set(Z.R() * 3, Z.R() * 3, 0); o.scale.set(.35 + Z.R() * .5, .25 + Z.R() * (naVista(a) ? .22 : .8), .35 + Z.R() * .5); });

  // o vale lá embaixo: mata, rio que brilha, lago e a vila com as janelas acesas
  const VY = -9.5;
  const valeT = Z.tela(64, 64, g => { g.fillStyle = '#14234e'; g.fillRect(0, 0, 64, 64); Z.manchas(g, 64, 64, 420, ['#0f1c40', '#1c3466', '#20426a', '#241a58'], 1, 4); }, { nitido: true, rep: [16, 16] });
  Z.malha(L.group, new THREE.CircleGeometry(80, 40), new THREE.MeshLambertMaterial({ map: valeT, emissive: new THREE.Color('#121c4c') }), 0, VY, 0).rotation.x = -Math.PI / 2;
  const aguaT = Z.rachado('#1c4a9a', '#8ae8ff', 22); aguaT.wrapS = aguaT.wrapT = THREE.RepeatWrapping;
  Z.estrada(L.group, [[70, 22], [52, 8], [42, -10], [28, -24], [20, -40], [2, -48], [-8, -62], [-6, -74]], 4.4, aguaT, { y: VY + .08, brilha: true, fog: false });
  Z.malha(L.group, new THREE.CircleGeometry(11, 24), Z.luz({ map: aguaT, color: '#9aa8ff' }), 20, VY + .06, -42).rotation.x = -Math.PI / 2;
  Z.pinheiros(L.group, 260, () => { const a = Z.R() * Math.PI * 2, r = BORDA + 2 + Z.R() * 40, x = Math.sin(a) * r, z = Math.cos(a) * r; return [x, Math.hypot(x - 36, z + 2) < 15 ? VY - 9 : VY, z]; }, '#101c46', 2.7);
  [[35, -5], [39, 1], [33.5, 4.5], [41, -11], [45, -3], [37, 11], [31, -13], [47, 8]].forEach(([x, z], i) => { const c = Z.casinha(L.group, x, z, { rotY: i * 1.7, y: VY, w: 2.6 + (i % 3) * .5, h: 2 + (i % 2) * .8, reboco: i % 2 ? '#6a5a8a' : '#7a6a72', telha: i % 3 ? '#38307a' : '#7a2a4a', telha2: i % 3 ? '#5048a0' : '#a03a5a', torta: i % 2 ? .08 : -.07 }); c.scale.setScalar(1.25); Z.brilho(L.group, '#ffa838', 3.4, x - 1.2, VY + 2, z + (i % 2 ? 1 : -1), .55); });
  Z.copias(L.group, new THREE.OctahedronGeometry(.16, 0), Z.luz('#ffc860'), 90, o => { const a = Z.R() * 6.28, r = Z.R() * 13; o.position.set(37 + Math.sin(a) * r, VY + .3 + Z.R() * .5, -1 + Math.cos(a) * r); });
  Z.brilho(L.group, '#ff9a48', 26, 38, VY + 1, -1, .28);
  { const torre = [40, 3]; Z.malha(L.group, new THREE.CylinderGeometry(1.1, 1.4, 9, 8), Z.solido('#3a3874', { emissive: new THREE.Color('#141240'), fog: false }), torre[0], VY + 4.5, torre[1]); Z.malha(L.group, new THREE.ConeGeometry(1.6, 3.4, 8), Z.solido('#5a2a6a', { emissive: new THREE.Color('#200c30'), fog: false }), torre[0], VY + 10.6, torre[1]); Z.brilho(L.group, '#ffb040', 3.6, torre[0] - 1.4, VY + 7.4, torre[1], .8); }

  // o castelo no pico e os picos de pedra
  Z.castelo(L.group, { x: -22, y: 1.2, z: -45, s: 1.18, pedra: '#2a2c78', pedra2: '#3c3e98', telhado: '#171448' }).rotation.y = .42;
  Z.brilho(L.group, '#7a68ff', 34, -23, 8, -50, .34);
  const picoM = Z.solido('#241f5c', { emissive: new THREE.Color('#171244'), fog: false });
  for (const [x, z, a, r] of [[-38, -26, 13, 5], [-8, -62, 9, 4], [36, -38, 17, 5.5], [48, -22, 11, 4], [-46, 6, 12, 5], [-34, 32, 9, 5], [44, 30, 10, 4.5]]) {
    Z.malha(L.group, new THREE.ConeGeometry(r, a - VY, 7, 3), picoM, x, VY + (a - VY) / 2, z).rotation.y = x;
    Z.malha(L.group, Z.rocha(r * .5, .45, 1), picoM, x + r * .35, VY + (a - VY) * .42, z + r * .2);
  }

  // o mirante: uma ponte de pedra que avança sobre o vale, com o parapeito baixo e uma lanterna
  {
    const lajeT = Z.pedrinhas('#2a2450', ['#6a5a86', '#7a6a96', '#584a74']);
    Z.estrada(L.group, [[12.5, -1.5], [22.5, -1.5]], 2.6, lajeT, { y: .045 });
    const sacada = Z.malha(L.group, new THREE.CylinderGeometry(3, 2.2, 1.2, 14), pedraM, 23.6, -.6, -1.5); void sacada;
    const laje = Z.malha(L.group, new THREE.CircleGeometry(3, 14), lam({ map: lajeT }), 23.6, .05, -1.5); laje.rotation.x = -Math.PI / 2;
    Z.malha(L.group, new THREE.CylinderGeometry(1.1, .5, 9.5, 7), pedraM, 23.4, -5.8, -1.5);
    for (let i = -6; i <= 6; i++) { const a = Math.PI / 2 + i * .34; Z.malha(L.group, new THREE.BoxGeometry(.24, .34, .24), pedraM, 23.6 + Math.sin(a) * 2.9, .17, -1.5 + Math.cos(a) * 2.9); }
    for (const z of [-2.9, -.1]) for (let x = 15; x <= 21.4; x += 1.6) Z.malha(L.group, new THREE.BoxGeometry(.22, .32, .22), pedraM, x, .16, z);
    Z.malha(L.group, new THREE.BoxGeometry(.12, 2, .12), Z.solido('#1a1230'), 21.2, 1, -3);
    Z.malha(L.group, new THREE.OctahedronGeometry(.24, 0), Z.luz('#ffd060'), 21.2, 2.15, -3); Z.brilho(L.group, '#ffb040', 2.6, 21.2, 2.15, -3, .8);
    E.interact(E.hitbox(1.4, 1.2, 2.4, 26.2, .7, -1.5), { label: () => S.dlg ? '' : '[E] Olhar a vista', act: () => E.conversa([['VOCÊ', '(O vale inteiro. Um rio que brilha, uma vila com as luzes acesas e, lá no alto, o castelo.)'], ['VOCÊ', '(Os dragões nem ligam pra você. Ainda bem.)']]) });
  }

  // dragões: um pousado na pedra do lado do castelo, dois rondando a torre e um grande que passa por cima da floresta
  const agulha = [15.5, -27];
  Z.malha(L.group, new THREE.CylinderGeometry(2.3, 4.6, 12.4, 7, 3), pedraM, agulha[0], -3.9, agulha[1]);
  Z.malha(L.group, Z.rocha(2.9, .3, 1), pedraM, agulha[0], 1.5, agulha[1]).scale.y = .55;
  const guardiao = Z.dragao(L.group, { s: 1.65, cor: '#35309a', barriga: '#b06ac0', asa: '#7a2a9a', olho: '#ffd23a' });
  guardiao.position.set(agulha[0], 4.55, agulha[1]); guardiao.rotation.y = Math.atan2(-agulha[0], 10 - agulha[1]);
  const soprar = Z.fogo(L.group, v => guardiao.userData.cabeca.localToWorld(v.set(0, -.08, 1.15)), v => guardiao.userData.cabeca.getWorldDirection(v));
  let proxSopro = 9, abrindo = 0;
  const olharD = new THREE.Vector3();
  Z.anima((dt, t) => {
    guardiao.userData.pose(t, 'pousado');
    // a cabeça acompanha você
    olharD.copy(E.camera.position); guardiao.worldToLocal(olharD);
    guardiao.userData.pescoco.rotation.y += (Math.max(-.7, Math.min(.7, Math.atan2(olharD.x, olharD.z))) - guardiao.userData.pescoco.rotation.y) * Math.min(1, dt * 1.2);
    proxSopro -= dt;
    if (proxSopro <= 0) { proxSopro = 17 + Z.R() * 12; abrindo = 2.4; Z.somDragao('rugido', 1, guardiao.position); E.later(.55, () => { soprar(1.7); Z.somDragao('fogo', .9, guardiao.position); }); }
    abrindo = Math.max(0, abrindo - dt); guardiao.userData.boca = Math.min(1, abrindo * 1.6);
    guardiao.userData.pescoco.rotation.x = -Math.min(1, abrindo) * .28;
  });
  Z.voa(Z.dragao(L.group, { s: 1.05, cor: '#1c6a8a', barriga: '#6ad0c0', asa: '#25488a', olho: '#c8ff6a' }), { cx: -21, cz: -44, y: 20, r: 16, vel: .21, fase: 1.4 });
  Z.voa(Z.dragao(L.group, { s: .75, cor: '#6a2a7a', barriga: '#e08ab0', asa: '#a03a7a' }), { cx: -16, cz: -42, y: 14, r: 21, vel: -.16, fase: 4 });
  const grandao = Z.voa(Z.dragao(L.group, { s: 2.1, cor: '#7a2440', barriga: '#f0a040', asa: '#b03030', olho: '#fff07a' }), { cx: 0, cz: -2, y: 15.5, r: 31, rz: 27, vel: .13, fase: 2.35, plana: .6 });
  [0, 1, 2, 3].forEach(i => Z.voa(Z.revoada(L.group, { s: .24 }), { cx: 28 + i * 1.4, cz: -48 - i * 1.1, y: 17 + (i % 2) * 1.6, r: 13, vel: .17, fase: i * .17, plana: 0 }));
  let passou = 99;   // quando o grandão passa por perto, ele ruge baixinho
  Z.anima(dt => { passou += dt; if (passou > 24 && grandao.position.distanceTo(E.camera.position) < 31) { passou = 0; Z.somDragao('guincho', .9, grandao.position); } });

  // a floresta: cogumelos gigantes em volta (abertos onde tem vista), árvores retorcidas, flores que brilham
  const coresC = ['#c8302c', '#8a3ac8', '#e87a2a', '#2a7ad8', '#c83a8a'];
  const stemM = lam({ color: 0xd8d0e8, emissive: 0x1a1428 });
  const gigante = (x, z, s, k) => { Z.cogumelo(L.group, x, z, s, coresC[k % 5]); if (s > .55 && Math.hypot(x, z) < R + 6) E.circle(x, z, .37 * s); };
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2 + rnd() * .1, r = R + 1.2 + rnd() * 3.8;
    if (Math.abs(Math.sin(a)) < .22) continue;
    if (naVista(a)) { if (i % 3 === 0) gigante(Math.sin(a) * (R + 2 + (i % 2) * 2.4), Math.cos(a) * (R + 2 + (i % 2) * 2.4), .35 + rnd() * .3, i); continue; }
    gigante(Math.sin(a) * r, Math.cos(a) * r, 1.5 + rnd() * 2, i);
  }
  // os dois gigantes que emolduram a entrada
  gigante(-5.2, 17.6, 2.7, 1); gigante(5.4, 18.2, 2.2, 3);
  for (let i = 0; i < 9; i++) { const a = rnd() * 6.28, r = 5 + rnd() * 8; gigante(Math.sin(a) * r, Math.cos(a) * r, .35 + rnd() * .5, i); }
  const troncoM = lam({ color: 0x2a1c3a, emissive: 0x0c0818 });
  for (const [x, z, s] of [[-17.8, 8.6, 1.5], [-19.6, -11.5, 1.8], [18.4, 10.5, 1.4], [19.2, -8.6, 1.1], [-11.5, 16.4, 1.2], [12.6, 15.6, 1.35]]) { Z.galhada(L.group, x, z, s, troncoM); E.circle(x, z, .3 * s); }
  // as casinhas tortas do Mago e do Macaco, na beirada do planalto
  Z.casinha(L.group, -18.2, .6, { rotY: Math.PI / 2 + .12, w: 4.2, h: 2.9, d: 3.2, reboco: '#8a76a8', telha: '#1c6a70', telha2: '#2a9a92', torta: .09 });
  Z.casinha(L.group, -16.6, -7.6, { rotY: 1.02, w: 2.6, h: 2, d: 2.2, reboco: '#9a7a62', telha: '#7a2a5a', telha2: '#a83a72', torta: -.1 });
  Z.cogumelo(L.group, -19.4, 4.4, 2.3, '#c83a8a'); E.circle(-19.4, 4.4, .85);
  for (const [x, z, r] of [[-18.2, -.7, 1.7], [-18.2, .6, 1.7], [-18.2, 1.9, 1.7], [-16.6, -7.6, 1.35]]) E.circle(x, z, r);   // as duas casinhas
  const longeDaTrilha = (x, z) => !(Math.abs(x) < 1.7 && (z > 1 || z < -R + 1));
  const touceiras = [...Array(34)].map((_, i) => { const a = i / 34 * 6.28 + rnd() * .3, r = i % 3 ? R - 1.2 + rnd() * 6 : 5 + rnd() * 9; return [Math.sin(a) * r, Math.cos(a) * r]; }).filter(([x, z]) => longeDaTrilha(x, z));
  Z.flores(L.group, 520, i => { const [cx, cz] = touceiras[i % touceiras.length], x = cx + (Z.R() - .5) * 1.7, z = cz + (Z.R() - .5) * 1.7; return longeDaTrilha(x, z) ? [x, .08 + Z.R() * .22, z] : [x, -1, z]; }, ['#6ac8ff', '#a8e8ff', '#7a8aff', '#c89aff', '#8affd8']);
  Z.capim(L.group, 700, () => { const a = Z.R() * 6.28, r = 2.5 + Math.sqrt(Z.R()) * (BORDA - 3.4), x = Math.sin(a) * r, z = Math.cos(a) * r; return longeDaTrilha(x, z) ? [x, 0, z] : [x, -1, z]; }, ['#2a6a52', '#3a8a62', '#2a5a7a', '#5a4a9a']);
  // a trilha de pedras com brasinhas
  const trilhaT = Z.pedrinhas('#241c3e', ['#5a4a72', '#6a5880', '#4a3e68', '#74608a']);
  Z.estrada(L.group, [[0, R + 6.4], [.25, 13], [-.3, 8], [-.9, 3], [-1.7, -2.6]], 2.5, trilhaT, { y: .035 });
  for (let i = 0; i < 18; i++) { const z = R + 5.6 - i * 1.3, x = (i % 2 ? 1 : -1) * (1.15 + Z.R() * .2) - Math.max(0, 8 - z) * .1; Z.brilho(L.group, i % 4 ? '#ff9a2a' : '#ffd24a', .55, x, .1, z, .95); Z.brilho(L.group, '#ff6a10', 1.5, x, .08, z, .22); }
  for (const [x, z, c] of [[-3.4, -4, '#6aff8a'], [3.4, -6, '#6ab8ff'], [-7.2, 3.4, '#8ae8c8']]) Z.brilho(L.group, c, 3, x, .9, z, .3);
  Z.vagalumes(L.group, 70, [-16, 16, .3, 3.4, -16, 18], '#fff2a0', .04);
  Z.vagalumes(L.group, 50, [-20, 20, .2, 9, -22, 18], '#9ad8ff', .035, .35);
  Z.relampago(longe, { de: Math.PI + .5, ate: Math.PI + 1.7, dist: 66, y: 17, alt: 28, cada: 11 });

  // o fim da floresta: antes da revelação é só mato fechado; depois vira o corredor de cogumelos até Matagalé
  const tampa = E.add(new THREE.Group()), corredor = E.add(new THREE.Group());
  { const folha = lam({ color: 0x1e4a3a, emissive: 0x08180e });
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + (i % 3) * .3, 0), folha); m.position.set(-2.4 + (i % 5) * 1.2, .7 + (i > 4 ? 1.1 : 0), -R - .6 - (i > 4 ? .5 : 0)); tampa.add(m); }
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const alt = 2.4 + (i % 2) * .7, z = -R + .2 - i * 1.25;
      const st = new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, alt, 6), stemM); st.position.set(s * 1.95, alt / 2, z); corredor.add(st);
      const cp = new THREE.Mesh(new THREE.SphereGeometry(.85, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: i % 2 ? 0x3ac8a0 : 0x6ad04a, emissive: i % 2 ? 0x104a38 : 0x1c4010, side: THREE.DoubleSide })); cp.position.set(s * 1.95, alt, z); cp.scale.y = .6; corredor.add(cp); } }
  let abriu = false;
  const abreCorredor = () => {
    const on = Q.mata >= 1; tampa.visible = !on; corredor.visible = on;
    if (on && !abriu) { abriu = true; E.portal(0, -R - 4.9, 0, 'MATAGALÉ →', '#9aff7a'); }
  };
  E.trigger(p => Q.mata >= 1 && p.z < -R - 4.2 && Math.abs(p.x) < 1.7, () => { E.goTo('matagale'); });
  const pl = E.add(new THREE.PointLight(0x9affd8, 12, 13, 1.5)); pl.position.set(0, 2, -2);

  /* o cantinho do Mago: caldeirão, a poção de calvície e o aviso do Goblin */
  const caul = E.add(new THREE.Mesh(new THREE.SphereGeometry(.55, 10, 6, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 1.7), lam({ color: 0x2a2a2e, side: THREE.DoubleSide }))); caul.position.set(-3.4, .5, -4);
  const brew = E.add(new THREE.Mesh(new THREE.CircleGeometry(.48, 12), basic({ color: 0x7aff8a }))); brew.rotation.x = -Math.PI / 2; brew.position.set(-3.4, .72, -4);
  const fire = E.add(new THREE.PointLight(0x7aff8a, 6, 4, 1.6)); fire.position.set(-3.4, 1.2, -4); E.circle(-3.4, -4, .6);
  const bottle = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, .3, 8), basic({ color: 0xc89aff, transparent: true, opacity: .85 }))); bottle.position.set(-2.4, .15, -4.7);
  E.interact(E.hitbox(.4, .5, .4, -2.4, .25, -4.7), { label: () => '[E] Frasco: “POÇÃO DE CALVÍCIE”', act: () => E.conversa([['MACARO?', ''], ['MACACO', 'Não! Essa aí não! Da última vez que alguém bebeu, ficou todo mundo careca. Até o pássaro!'], ['VOCÊ', '(Melhor deixar quieto.)']].slice(1)) });
  const goblinT = E.canvasTex(48, 40, g => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, 48, 40); g.fillStyle = '#5a2a1a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('AVISO', 24, 9); g.font = '5px monospace'; g.fillText('TAXA DE COGUMELO:', 24, 18); g.fillText('3 GOIABAS', 24, 25); g.fillText('— Goblin dos Impostos', 24, 34); });
  { const post = box(.08, 1.4, .08, lam({ color: 0x5a3a22 }), 5.6, .7, -6, { occ: false }); const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.9, .75), basic({ map: goblinT, side: THREE.DoubleSide }))); s.position.set(5.6, 1.45, -6); s.rotation.y = -.5;
    E.interact(E.hitbox(1, .8, .3, 5.6, 1.45, -6), { label: () => '[E] Placa', act: () => E.conversa([['PLACA', '“Taxa de cogumelo: 3 goiabas. Assinado: Goblin dos Impostos.”'], ['MAGO', 'Ignora. Ele só existe no filme. Pelo menos é o que a gente fala pra ele.']]) }); }
  // o cartaz do curta
  { const posterT = E.canvasTex(48, 64, g => { g.fillStyle = '#2a1a3a'; g.fillRect(0, 0, 48, 64); g.fillStyle = '#ffd23a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('O PÁSSARO', 24, 10); g.fillText('DAS ESFERAS', 24, 17); g.fillStyle = '#e8d8ff'; g.font = '4px monospace'; g.fillText('um filme em stop motion', 24, 56); g.fillText('3º Prêmio Capivara', 24, 61); });
    const pst = E.add(E.quadro('passaroEsferas', 1, 1.3, '#2a1a3a', 'O PÁSSARO DAS ESFERAS')); pst.position.set(-6.4, 1.6, -9.2); pst.rotation.y = .6;
    box(.08, 1.6, .08, lam({ color: 0x5a3a22 }), -6.4, .8, -9.25, { occ: false });
    E.interact(pst, { label: () => '[E] Cartaz', act: () => E.conversa([['CARTAZ', '“O Pássaro das Esferas” — um curta em stop motion, feito quadro por quadro por estudantes de Naviraí. Premiado no 3º Prêmio Capivara.'], ['MAGO', 'Esse sou eu. E o Macaco. E aquele pássaro ali. No fim todo mundo ficou careca. Tem uma lição nisso.'], ['MACACO', 'A lição é: não pede besteira.']]) }); }

  /* o elenco */
  const mago = E.add(E.club('mago', 1.95)); mago.position.set(-2.2, 0, -5.2);
  const macaco = E.add(E.club('macaco', 1.05)); macaco.position.set(-.6, 0, -4.4);
  const esferas = E.add(E.club('passaroEsferas', 1.3)); esferas.position.set(3.4, 0, -6);
  // Pássaro Cocô (ave marrom redondinha, cara de grupo da família às 23h)
  const coco = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 72; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(32, 69, 18, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#e0a040'; g.fillRect(24, 58, 3, 10); g.fillRect(37, 58, 3, 10);
    g.fillStyle = '#7a4a24'; g.beginPath(); g.ellipse(32, 40, 22, 22, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(32, 18, 9, 7, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(36, 10, 5, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#a8703a'; g.beginPath(); g.ellipse(32, 46, 13, 12, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(25, 32, 6, 0, 7); g.arc(39, 32, 6, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(26, 33, 2.4, 0, 7); g.arc(38, 33, 2.4, 0, 7); g.fill();
    g.fillStyle = '#f0b040'; g.beginPath(); g.moveTo(28, 39); g.lineTo(36, 39); g.lineTo(32, 45); g.fill();
    const grp = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(.75, .84), basic({ map: E.texFrom(c), transparent: true, alphaTest: .5 })); m.position.y = .42; grp.add(m); L.billboards.push(grp);
    return E.add(grp); })();
  coco.position.set(5.6, 0, -3);
  for (const n of [mago, macaco, esferas, coco]) E.circle(n.position.x, n.position.z, .35);
  const talkBox = (n, label, fn) => E.interact(E.hitbox(.9, 1.8, .9, n.position.x, 1, n.position.z), { label: () => C.talking || S.dlg ? '' : '[E] ' + label, act: () => { if (!C.talking && !S.dlg) { C.talking = true; Promise.resolve(fn()).finally(() => { C.talking = false; }); } } });
  const M = '#c8a0ff', K = '#e8b070', PE = '#9fd8ff', PC = '#d8a070';
  // depois das goiabas: o sequestro. A luta final só abre depois de resgatar o Serjão e devolver o boné
  const precisaMata = () => Q.armas && (Q.st || 0) < 2;
  async function sequestro() {
    if (!Q.mata) {
      await E.conversa([
        ['MAGO', 'Espera. Não vai ainda. As esferas do Pássaro acabaram de ficar pretas.', M],
        ['MACACO', 'Chefe... deu ruim. Deu muito ruim.', K],
        ['MAGO', 'O Passarex sequestrou o Serjão dos Espetos.', M],
        ['VOCÊ', 'O Serjão? O do espeto?'],
        ['MACACO', 'Pegou o homem no meio da brasa. E ninguém tinha nem pedido nada!', K],
        ['MAGO', 'Se você for pra praça agora, ele some com o Serjão pra sempre. Primeiro o resgate. A luta fica pra depois.', M],
        ['MAGO', 'Procure Matagalé, em Acerolândia, onde moram os Acerolitos. Alguém lá viu pra onde ele foi.', M],
        ['MACACO', 'Abrimos o mato no fim da floresta. É só atravessar o corredor. E leva as máquinas!', K],
      ]);
      Q.mata = 1; E.save(); abreCorredor(); E.noiseHit(.8, .35, 700); L.glitchT = .4;
      E.toast('Matagalé<small>o corredor no fim da floresta · [H] dica</small>');
      return;
    }
    return E.conversa([['MAGO', Q.mata >= 5 ? 'Você trouxe ele de volta. Agora devolva o boné pro dono, lá em Matagalé.' : 'O Serjão está esperando. Matagalé fica no fim da floresta, pelo corredor.', M]]);
  }
  talkBox(mago, 'Falar com o Mago', async () => {
    if (precisaMata()) return sequestro();
    if (Q.st === 0) return E.conversa([['MAGO', 'Ainda não é hora, viajante.', M], ['MAGO', 'O pássaro de Naviraí ainda está escondido pela cidade: na praça, na Pobresa e no IF. Ache ele primeiro.', M]]);
    if (Q.armas) return E.conversa([['MAGO', 'Vá até o centro da praça. E lembre: pena rosa dá pra rebater no ar.', M]]);
    if (Q.doces && Q.azedas) return E.conversa([['MAGO', 'As duas goiabas! Entregue ao Macaco. Ele monta as máquinas.', M]]);
    if (!Q.plano) {
      await E.conversa([
        ['MAGO', 'Ah... você veio. Eu sou o Mago. Esse aqui é o Macaco, meu assistente.', M],
        ['MACACO', 'Assistente não! Sócio.', K],
        ['MAGO', 'A gente veio de um filme feito à mão, quadro por quadro, por uns estudantes daqui de Naviraí. Ganhou prêmio, viu?', M],
        ['MAGO', 'Aquele pássaro com as esferas concede pedidos. Mas só se você pedir. Essa é a regra. Sempre foi.', M],
        ['MAGO', 'Agora o Passarex acordou de vez. Pousou na torre da catedral. Ele não quer sua alma, sabe? Quer o seu susto. Se alimenta do “que isso?”.', M],
        ['VOCÊ', 'E como a gente para ele?'],
        ['MAGO', 'Com goiaba. Duas máquinas de atirar goiaba: uma doce, que atira rápido, e uma azeda, que bate forte.', M],
      ]);
      Q.plano = true; E.save();
      await E.conversa([['MAGO', 'Traga as goiabas doces e as azedas. O resto, o Macaco monta.', M]]);
      E.toast('Missão das goiabas<small>doces: Pássaro das Esferas · azedas: Pássaro Cocô</small>');
      return;
    }
    return E.conversa([['MAGO', `Ainda falta${Q.doces ? '' : ' a doce'}${!Q.doces && !Q.azedas ? ' e' : ''}${Q.azedas ? '' : ' a azeda'}. As doces estão com o Pássaro das Esferas; as azedas, com o Pássaro Cocô.`, M]]);
  });
  talkBox(macaco, 'Falar com o Macaco', async () => {
    if (precisaMata()) return sequestro();
    if (!Q.plano) return E.conversa([['MACACO', 'Fala com o Mago primeiro, chefe. Ele gosta de explicar as coisas.', K]]);
    if (Q.armas) return E.conversa([['MACACO', 'Doce no [Q], azeda no [Q] de novo. E se encher as cartas... SUPER GOIABADA! Eu que inventei.', K]]);
    if (!(Q.doces && Q.azedas)) return E.conversa([['MACACO', 'Sem goiaba não tem máquina! Uma doce e uma azeda.', K]]);
    await E.conversa([['MACACO', 'Ô, chegou com as goiabas! Segura aí.', K]]);
    for (let k = 0; k < 6; k++) E.later(k * .3, () => { E.noiseHit(.08, .25, 1800, null, 'highpass'); E.tone(180, .06, .06, 'square'); });
    await E.conversa([['MACACO', 'Aperta aqui... solda ali... um pouquinho de mágica do Mago...', K], ['MAGO', '*faz um gesto misterioso com as mãos*', M]]);
    E.sfx.chime(); L.glitchT = .2;
    await E.conversa([['MACACO', 'Pronto, chefe! Duas máquinas: uma doce, uma azeda.', K], ['MAGO', 'A doce atira rápido. A azeda bate forte. Pena rosa você rebate pulando de novo em cima. E se encher as cartas, solta o especial.', M], ['MAGO', 'Guarde bem. Essas máquinas vão com você até o fim.', M]]);
    Q.armas = true; E.save();
    E.toast('Arma especial: máquinas de goiaba<small>ela é sua daqui pra frente · fale com o Mago</small>');
  });
  // o pedido sendo concedido: as esferas acendem, um anel de luz abre, faíscas sobem em espiral e voam até você, e a goiaba aparece
  function concede() {
    E.somGravado && E.somGravado('passaro', 1.1);   // "PÁSSARO!" toda vez que ele concede um pedido
    return new Promise(res => {
      const mb = o => new THREE.MeshBasicMaterial(Object.assign({ fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }, o));
      const grp = new THREE.Group(); grp.position.copy(esferas.position); E.add(grp);
      const brilho = document.createElement('canvas'); brilho.width = brilho.height = 64; { const g = brilho.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#ffffff'); r.addColorStop(.3, '#9fd8ff'); r.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
      const bT = new THREE.CanvasTexture(brilho);
      const esf = [-.42, .42].map(dx => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), mb({ map: bT })); m.position.set(dx, .75, .25); grp.add(m); return m; });
      const anel = new THREE.Mesh(new THREE.RingGeometry(.2, .32, 32), mb({ color: 0x9fd8ff, side: THREE.DoubleSide })); anel.rotation.x = -Math.PI / 2; anel.position.y = .05; grp.add(anel);
      const coluna = new THREE.Mesh(new THREE.CylinderGeometry(.6, .9, 6, 16, 1, true), mb({ color: 0x9fd8ff, opacity: 0, side: THREE.DoubleSide })); coluna.position.y = 3; grp.add(coluna);
      const luz = new THREE.PointLight(0x9fd8ff, 0, 10, 1.4); luz.position.y = 1.2; grp.add(luz);
      const fa = []; for (let k = 0; k < 28; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .12), mb({ map: bT })); m.userData = { a: k / 28 * 6.28, r: .3 + Math.random() * .4, y: Math.random() * .4, v: 1 + Math.random() }; grp.add(m); fa.push(m); }
      const goiT = document.createElement('canvas'); goiT.width = goiT.height = 32; { const g = goiT.getContext('2d'); g.fillStyle = '#7ac83a'; g.beginPath(); g.ellipse(16, 18, 11, 12, 0, 0, 7); g.fill(); g.fillStyle = '#ff8fb1'; g.beginPath(); g.ellipse(16, 18, 6, 7, 0, 0, 7); g.fill(); g.fillStyle = '#4a7a2a'; g.fillRect(15, 3, 2, 5); }
      const goi = new THREE.Mesh(new THREE.PlaneGeometry(.45, .45), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(goiT), transparent: true, fog: false })); goi.visible = false; E.add(goi); L.billboards.push(goi);
      [784, 988, 1175, 1568].forEach((fq, k) => E.tone(fq, 1.2, .045, 'triangle', null, k * .18));
      E.noiseHit(2.4, .05, 5000, null, 'highpass');
      let t = 0; const cam = E.camera.position;
      (L._anims || (L._anims = [])).push(dt => {
        t += dt;
        const sobe = Math.min(1, t / .8), some = t > 2.6 ? Math.max(0, 1 - (t - 2.6) / .6) : 1;
        esf.forEach((m, i) => { const k = (1 + Math.sin(t * 9 + i * 3) * .25) * (.6 + sobe * 1.4) * some; m.scale.setScalar(k); m.lookAt(cam); m.material.opacity = some; });
        anel.scale.setScalar(1 + t * 7); anel.material.opacity = Math.max(0, 1 - t / 1.4);
        coluna.material.opacity = .25 * sobe * some; coluna.rotation.y += dt * 2;
        luz.intensity = 14 * sobe * some + Math.sin(t * 20) * 2 * some;
        for (const m of fa) {
          const u = m.userData;
          if (t < 1.8) { u.a += dt * (3 + u.v); u.y += dt * u.v * 1.1; m.position.set(Math.cos(u.a) * u.r * (1 + u.y * .3), u.y, Math.sin(u.a) * u.r * (1 + u.y * .3)); }
          else { const alvo = grp.worldToLocal(cam.clone()).multiplyScalar(.55); m.position.lerp(alvo.setY(alvo.y - .2), Math.min(1, dt * 3)); }
          m.lookAt(cam); m.material.opacity = some * (t > 1.8 ? Math.max(0, 1 - (t - 1.8) / 1.1) : 1);
        }
        if (t > 1.9 && !goi.visible) { goi.visible = true; E.sfx.chime(); }
        if (goi.visible) { const k = Math.min(1, (t - 1.9) / .8); goi.position.lerpVectors(esferas.position.clone().setY(1.2), cam.clone().setY(cam.y - .25), k * .8); goi.material.opacity = some; goi.scale.setScalar(.6 + Math.sin(t * 8) * .08 + k * .5); }
        if (t > 3.3) { grp.removeFromParent(); goi.removeFromParent(); res(); return false; }
      });
    });
  }
  talkBox(esferas, 'Falar com o Pássaro das Esferas', async () => {
    if (Q.st >= 3) return tempoQuest();   // o segredo: depois da luta, ele tem uma coisa grande pra conceder
    if (!Q.plano) return E.conversa([['PÁSSARO DAS ESFERAS', '...', PE], ['VOCÊ', '(Ele te olha. As duas esferas brilham. Não diz nada.)']]);
    if (Q.doces) return E.conversa([['PÁSSARO DAS ESFERAS', 'Já concedi. E não peça careca.', PE]]);
    await E.conversa([['PÁSSARO DAS ESFERAS', 'Eu concedo pedidos.', PE], ['PÁSSARO DAS ESFERAS', 'Mas só se você pedir.', PE]]);
    const i = await E.choice('O que você faz?', ['Pedir as goiabas doces', 'Ficar quieto'], 1, 12);
    if (i === 0) { await E.conversa([['VOCÊ', 'Eu peço... as goiabas doces.']]); await concede(); await E.conversa([['PÁSSARO DAS ESFERAS', 'Pedido concedido. Goiabas doces.', PE], ['PÁSSARO DAS ESFERAS', 'Da última vez pediram uma poção e todo mundo ficou careca. Você pediu certo.', PE]]); Q.doces = true; E.save(); E.toast('Goiabas doces<small>' + (Q.azedas ? 'leve pro Macaco' : 'falta a azeda') + '</small>'); }
    else await E.conversa([['VOCÊ', '(Você não pediu. Ele não concedeu. Funciona assim.)']]);
  });
  talkBox(coco, 'Falar com o Pássaro Cocô', async () => {
    if (Q.azedas) return E.conversa([['PÁSSARO COCÔ', 'Bom descanso. E não segura o cocô.', PC]]);
    if (Q.refri) { await E.conversa([['PÁSSARO COCÔ', 'Geladinho! Toma as azedas. E não segura o cocô.', PC]]); Q.azedas = true; Q.refri = false; E.save(); E.sfx.chime(); E.toast('Goiabas azedas<small>' + (Q.doces ? 'leve pro Macaco' : 'falta a doce') + '</small>'); return; }
    await E.conversa([['PÁSSARO COCÔ', 'Boa noite, pessoal do grupo. Quer dizer... boa noite, você.', PC], ['PÁSSARO COCÔ', 'Antes de todo mundo ir dormir, uma pergunta muito importante: você já fez cocô hoje?', PC]]);
    const i = await E.choice('Já fez cocô hoje?', ['Já', 'Ainda não'], 1, 10);
    await E.conversa([['PÁSSARO COCÔ', i === 0 ? 'Muito bem. Orgulho da família.' : 'Não segura, hein. Faz mal.', PC]]);
    if (!Q.plano) return;
    await E.conversa([['PÁSSARO COCÔ', 'Eu fico acordado até tarde mandando mensagem no grupo. Dá uma sede...', PC], ['PÁSSARO COCÔ', 'Troco minhas goiabas azedas por um refri gelado da Pobresa.', PC]]);
    Q.pediuRefri = true; E.save(); E.toast('Um refri gelado<small>nas geladeiras da Pobresa, no centro</small>');
  });

  /* o ser da bolha: um bichinho verde de olhos enormes que mora dentro de uma bolha de sabão e só fala "zuprum" */
  const bolhaCv = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 104; const g = c.getContext('2d');
    // a bolha (fundo bem transparente com borda furta-cor)
    const fundo = g.createRadialGradient(44, 40, 6, 48, 48, 46); fundo.addColorStop(0, 'rgba(200,240,255,.10)'); fundo.addColorStop(.85, 'rgba(160,210,255,.16)'); fundo.addColorStop(1, 'rgba(255,255,255,.32)');
    g.fillStyle = fundo; g.beginPath(); g.arc(48, 48, 46, 0, 7); g.fill();
    // águas-vivas azuis dos lados (tipo asas transparentes)
    g.fillStyle = 'rgba(120,190,255,.55)';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(48 + s * 24, 60, 13, 17, s * .5, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.fillRect(48 + s * (16 + i * 5), 72, 2, 9 + (i % 2) * 5); } }
    // corpo enrugado
    g.fillStyle = '#6a7a34'; g.beginPath(); g.ellipse(48, 72, 14, 18, 0, 0, 7); g.fill();
    g.strokeStyle = '#4e5a24'; g.lineWidth = 1; for (let y = 62; y < 88; y += 4) { g.beginPath(); g.moveTo(38, y); g.quadraticCurveTo(48, y + 2, 58, y); g.stroke(); }
    // perninhas e bracinhos finos
    g.fillStyle = '#5a6a2c'; g.fillRect(40, 86, 3, 12); g.fillRect(53, 86, 3, 12); g.fillRect(30, 70, 9, 3); g.fillRect(57, 70, 9, 3);
    // cabeção
    g.fillStyle = '#8a9a44'; g.beginPath(); g.ellipse(48, 42, 25, 22, 0, 0, 7); g.fill();
    g.fillStyle = '#a2b05a'; g.beginPath(); g.ellipse(46, 32, 14, 8, 0, 0, 7); g.fill();
    // olhos enormes, escuros e brilhantes
    for (const x of [37, 59]) { g.fillStyle = '#e8d8a0'; g.beginPath(); g.arc(x, 44, 9.5, 0, 7); g.fill(); g.fillStyle = '#3a1410'; g.beginPath(); g.arc(x, 44, 8, 0, 7); g.fill(); g.fillStyle = '#8a2a1a'; g.beginPath(); g.arc(x + 1, 46, 4, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 3, 40, 2.4, 0, 7); g.fill(); g.fillRect(x + 3, 47, 1, 1); }
    g.fillStyle = '#4e5a24'; g.fillRect(44, 55, 8, 1.5);
    // brilho e borda furta-cor da bolha por cima
    for (const [cor, r] of [['rgba(255,140,220,.55)', 45], ['rgba(120,230,255,.6)', 44], ['rgba(255,240,140,.45)', 43]]) { g.strokeStyle = cor; g.lineWidth = 1.4; g.beginPath(); g.arc(48, 48, r, 0, 7); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(26, 22, 9, 4, -.7, 0, 7); g.fill(); g.beginPath(); g.arc(70, 76, 2.5, 0, 7); g.fill();
    return c; })();
  const bolha = new THREE.Group();
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.25), basic({ map: E.texFrom(bolhaCv), transparent: true, depthWrite: false })); bolha.add(m); L.billboards.push(bolha); E.add(bolha); }
  const BX = -7.2, BZ = 3.4; bolha.position.set(BX, 1.4, BZ); E.circle(BX, BZ, .45);
  const ZB = '#9fe8c8';
  const zuprumSom = () => {   // a "voz" dele: borbulhas que sobem e descem
    [[520, 780], [700, 460], [430, 900], [880, 520], [600, 1100], [980, 640], [520, 1300]].forEach(([a, b], i) => E.tone(a, .11, .035, 'sine', null, i * .13, 0, b));
    E.tone(1600, .05, .02, 'triangle', null, .95, 0, 2400);
  };
  const FALAS_Z = [['Zuprum zuprum carambufa bibilulú.'], ['Bibilulú?', 'Carambufa. Zuprum.'], ['Zuprum zuprum... carambufa bibilulú!']];
  let zN = 0;
  talkBox(bolha, 'Falar com o ser da bolha', async () => {
    zuprumSom();
    const f = FALAS_Z[zN % FALAS_Z.length]; zN++;
    await E.conversa(f.map(t => ['???', t, ZB]).concat([['VOCÊ', zN === 1 ? '(Ele mora dentro de uma bolha. Ninguém sabe de onde ele veio. Nem ele.)' : '(Você não entendeu nada. Mas ele parece muito satisfeito.)']]));
    E.conquista && E.conquista('zuprum');
  });
  bolha.userData.tick = t => { bolha.position.y = 1.4 + Math.sin(t * 1.3) * .14; bolha.position.x = BX + Math.sin(t * .4) * .1; };

  /* ---------- O SEGREDO DO TEMPO (só depois da luta) ----------
     Em vez de levar o café, volte pela trilha. O Pássaro das Esferas conta que o Passarex não nasceu assim,
     pede as 3 luzes que caíram das esferas e, se você pedir certo, concede uma máquina do tempo pra 1491. */
  const luzT = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff'); r.addColorStop(.3, '#d8b0ff'); r.addColorStop(1, 'rgba(140,80,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return E.texFrom(c); })();
  const LUZES = [['a', -11.2, -5.8], ['b', 10.6, 7.4], ['c', 1.8, -12.8]];
  const luzes = LUZES.map(([id, x, z]) => { const m = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), new THREE.MeshBasicMaterial({ map: luzT, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }))); m.position.set(x, .7, z); m.visible = false; m.userData.id = id; L.billboards.push(m); return m; });
  const luzAch = () => LUZES.filter(([id]) => Q.luzes && Q.luzes[id]).length;
  const mostraLuzes = () => luzes.forEach(m => { m.visible = Q.tempo === 1 && !(Q.luzes && Q.luzes[m.userData.id]); });
  // a máquina do tempo: um armário de madeira com um relógio na porta e dois anéis de latão girando
  const maquina = new THREE.Group(); maquina.position.set(-4.6, 0, -10.2); maquina.visible = false; E.add(maquina);
  const aneis = [];
  { const madeira = lam({ color: 0x6a4428 }), latao = lam({ color: 0xd8b040, emissive: 0x3a2a08 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.5, 1.1), madeira); cab.position.y = 1.25; maquina.add(cab);
    const relT = E.canvasTex(32, 32, g => { g.fillStyle = '#f2e6cc'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.strokeStyle = '#3a2418'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#3a2418'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(16 + Math.cos(a) * 12 - 1, 16 + Math.sin(a) * 12 - 1, 2, 2); } g.fillRect(15, 6, 2, 10); g.fillRect(15, 15, 8, 2); g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillStyle = '#c8302c'; g.fillText('1491', 16, 25); });
    const rel = new THREE.Mesh(new THREE.CircleGeometry(.45, 18), basic({ map: relT })); rel.position.set(0, 1.75, .56); maquina.add(rel);
    const porta = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.1), basic({ color: 0x8a5cff })); porta.position.set(0, .75, .56); maquina.add(porta);
    for (const [r, inc] of [[1.05, .4], [1.25, -.6]]) { const a = new THREE.Mesh(new THREE.TorusGeometry(r, .05, 6, 28), latao); a.position.y = 1.3; a.rotation.x = inc; maquina.add(a); aneis.push(a); }
    const luzM = new THREE.PointLight(0xa070ff, 5, 6, 1.5); luzM.position.set(0, 1.4, 1); maquina.add(luzM);
  }
  const mostraMaquina = () => { maquina.visible = Q.tempo === 2; };
  E.circle(-4.6, -10.2, .8);
  E.interact(E.hitbox(1.4, 2.5, 1.4, -4.6, 1.25, -10.2), {
    label: () => maquina.visible && !S.dlg ? '[E] Máquina do tempo' : '',
    act: async () => {
      if (!maquina.visible || S.dlg) return;
      const i = await E.choice('Viajar para 1491?', ['Sim', 'Ainda não'], 1, 10);
      if (i !== 0) return;
      E.noiseHit(.8, .5, 600); L.glitchT = 1.2; E.glitchText('1491', 1);
      E.later(1, () => E.goTo('ilha'));
    },
  });
  async function tempoQuest() {
    Q.luzes = Q.luzes || {};
    if (Q.tempo === 2) return E.conversa([['PÁSSARO DAS ESFERAS', 'A máquina está ali, entre os cogumelos. Ela só vai pra um lugar.', PE], ['PÁSSARO DAS ESFERAS', 'Não deixe ninguém machucar eles.', PE]]);
    if (Q.tempo === 1 && luzAch() < 3) return E.conversa([['PÁSSARO DAS ESFERAS', `Ainda faltam ${3 - luzAch()}. As luzes gostam de se esconder perto da beirada.`, PE]]);
    if (!Q.tempo) {
      await E.conversa([
        ['PÁSSARO DAS ESFERAS', 'Você voltou. E a cidade está pegando fogo.', PE],
        ['PÁSSARO DAS ESFERAS', 'Ele não nasceu assim, sabia? Ninguém nasce assobiando no escuro pra assustar os outros.', PE],
        ['PÁSSARO DAS ESFERAS', 'Em 1491, alguém chegou na ilha dele. E não foi pra conhecer.', PE],
        ['PÁSSARO DAS ESFERAS', 'Eu posso conceder uma coisa muito grande. Mas minhas esferas perderam o brilho: três luzes caíram pela floresta.', PE],
        ['VOCÊ', '(Três luzinhas roxas. Devem estar escondidas entre os cogumelos.)'],
      ]);
      Q.tempo = 1; E.save(); mostraLuzes();
      return;
    }
    // as três luzes de volta: agora é só pedir (certo)
    await E.conversa([['PÁSSARO DAS ESFERAS', 'As três! As esferas estão brilhando de novo.', PE], ['PÁSSARO DAS ESFERAS', 'Eu concedo pedidos. Mas só se você pedir.', PE]]);
    const i = await E.choice('O que você pede?', ['Mais goiabas', 'Uma máquina do tempo', 'Não pedir nada'], 2, 12);
    if (i === 0) return E.conversa([['VOCÊ', 'Eu peço... mais goiabas.'], ['PÁSSARO DAS ESFERAS', 'Pedido concedido.', PE], ['VOCÊ', '(Caíram três goiabas na sua cabeça. Não era bem isso.)']]);
    if (i !== 1) return E.conversa([['VOCÊ', '(Você não pediu. Ele não concedeu. Funciona assim.)']]);
    await E.conversa([['VOCÊ', 'Eu peço... uma máquina do tempo.']]);
    await concede();
    Q.tempo = 2; E.save(); mostraMaquina(); E.noiseHit(.6, .4, 500); E.sfx.chime();
    await E.conversa([['PÁSSARO DAS ESFERAS', 'Pedido concedido. Uma máquina do tempo.', PE], ['PÁSSARO DAS ESFERAS', 'Ela só vai pra um lugar: a ilha dele, em 1491. Não deixe ninguém machucar eles.', PE]]);
  }
  mostraLuzes(); mostraMaquina(); abreCorredor();

  E.cartazCapinha('f1', -2.2, R + .8, 0);
  /* a trilha de volta pro centro */
  const arch = E.canvasTex(48, 16, g => { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 48, 16); g.fillStyle = '#ffe9a8'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('← CENTRO', 24, 10); });
  { const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, .55), basic({ map: arch, side: THREE.DoubleSide }))); s.position.set(1.8, 1.7, R + 2); box(.08, 1.7, .08, lam({ color: 0x5a3a22 }), 1.8, .85, R + 2.02, { occ: false }); }
  E.portal(0, R + 4.9, Math.PI, '← VOLTAR PRO CENTRO', '#ffd23a');
  E.trigger(p => p.z > R + 4.4 && Math.abs(p.x) < 1.7, () => { E.goTo('centro'); });

  E.moedas([[0, null, 10], [-8, null, -1], [0, null, -9], [6, null, -9.5]]);

  L.ambience = bus => { E.loopNoise('bandpass', 5200, 9, .012, bus); E.loopNoise('lowpass', 240, 0, .03, bus); };
  L.idle = () => { longe.position.set(E.camera.position.x, 0, E.camera.position.z); Z.tique(1 / 60, performance.now() / 1000); };
  L.exit = () => Z.soltar();
  L.enter = () => {
    E.later(1, () => E.toast('Floresta de cogumelos<small>o Mago e o Macaco moram aqui · [H] dica</small>'));
    if (precisaMata() && !Q.mata) E.later(3, () => E.say('(O Mago está me chamando. Ele parece preocupado.)', 4));
    if (Q.st >= 1 && !Q.plano) E.later(3, () => E.say('(Uma luzinha verde perto do caldeirão. Alguém está mexendo uma poção.)', 4));
    if (Q.st >= 3 && !Q.tempo) E.later(3, () => E.say('(A floresta está quieta. Só as esferas do Pássaro ainda brilham.)', 4));
  };
  L.update = dt => {
    const t = L.t;
    longe.position.set(E.camera.position.x, 0, E.camera.position.z); Z.tique(dt, t);
    bolha.userData.tick(t);
    if (Q.tempo === 1) { const p = E.player.pos; for (const m of luzes) { if (!m.visible) continue; m.position.y = .7 + Math.sin(t * 2 + m.position.x) * .15; if (Math.hypot(p.x - m.position.x, p.z - m.position.z) < 1.1) { Q.luzes[m.userData.id] = true; m.visible = false; E.save(); E.sfx.chime(); E.toast(`Luz das esferas<small>${luzAch()}/3</small>`); if (luzAch() === 3) E.later(1.5, () => E.say('(As três. Agora é voltar pro Pássaro das Esferas.)', 4)); } } }
    if (maquina.visible) { aneis[0].rotation.y += dt * 1.6; aneis[1].rotation.z += dt * 1.1; }
    brew.material.color.setHSL(.33 + Math.sin(t * 2) * .03, 1, .6); fire.intensity = 6 + Math.sin(t * 7) * 1.2;
    if (L.glitchT > 0) L.glitchT -= dt; L.glitch = L.glitchT > 0 ? .3 : 0;
  };
  L.hint = () => {
    if (Q.st >= 3 && Q.tempo === 1) return luzAch() < 3 ? { text: 'As três luzes roxas estão escondidas perto da beirada da floresta.', target: luzes.find(m => m.visible)?.position.clone().setY(1) } : { text: 'Volte pro Pássaro das Esferas. E peça.', target: esferas.position.clone().setY(1) };
    if (Q.st >= 3 && Q.tempo === 2) return { text: 'A máquina do tempo está entre os cogumelos.', target: maquina.position.clone().setY(1.2) };
    if (Q.st >= 3) return { text: 'Volte pela trilha pro centro: o café de Naviraí está na Pobresa.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (Q.st === 0) return { text: 'Ainda não é hora. Volte pro centro e ache o Passarex nos três lugares.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (!Q.plano) return { text: 'O Mago está perto do caldeirão verde.', target: mago.position.clone().setY(1.2) };
    if (precisaMata()) return !Q.mata ? { text: 'O Mago quer te contar uma coisa. Fale com ele.', target: mago.position.clone().setY(1.2) }
      : { text: Q.mata >= 5 ? 'Devolva o boné ao Rosengo, em Matagalé, pelo corredor no fim da floresta.' : 'Atravesse o corredor no fim da floresta até Matagalé.', target: new THREE.Vector3(0, 1.2, -R - 3) };
    if (Q.armas) return { text: 'Volte pela trilha e vá até o centro da praça.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (Q.pediuRefri && !Q.refri && !Q.azedas) return { text: 'O Pássaro Cocô quer um refri gelado da Pobresa, lá no centro.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (!Q.azedas) return { text: 'As goiabas azedas estão com o Pássaro Cocô.', target: coco.position.clone().setY(1) };
    if (!Q.doces) return { text: 'As goiabas doces: fale com o Pássaro das Esferas. Ele só concede se você pedir.', target: esferas.position.clone().setY(1) };
    return { text: 'Leve as goiabas pro Macaco montar as máquinas.', target: macaco.position.clone().setY(1) };
  };
  L.debug = { Q, concede };
}
