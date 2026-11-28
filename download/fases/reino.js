// SONHO 3 · O reino adormecido (dark fantasy mais "de verdade"): a colina do cavaleiro ao entardecer,
// a praia da lua, a ravina de musgo e o vale do castelo da lua vermelha. Todo mundo dorme. Não acorde ninguém.
import { kit, trilho, BORDAS } from './mundo.js';

export function build(E, L) {
  const { THREE } = E;
  E.seed(4903);
  E.camera.far = 90;
  L.speed = 2.4; L.eye = 1.6; L.reach = 2.4;
  L.clock = t => Math.floor(t * .8) % 8 === 0 ? '--:--' : '18:67';
  const Z = kit(E, L), R = Z.R;

  // pedra com textura de verdade (granulada, com musgo por cima)
  const pedraTex = (base, claras, musgo) => Z.tela(128, 128, g => {
    g.fillStyle = base; g.fillRect(0, 0, 128, 128); Z.manchas(g, 128, 128, 1100, claras, 1, 4);
    g.strokeStyle = 'rgba(0,0,0,.4)'; for (let i = 0; i < 26; i++) { let x = R() * 128, y = R() * 128; g.lineWidth = 1 + R(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (R() - .5) * 14; y += R() * 16; g.lineTo(x, y); } g.stroke(); }
    if (musgo) for (let i = 0; i < 46; i++) { const x = R() * 128, y = R() * 128; g.fillStyle = musgo[(R() * musgo.length) | 0]; for (let k = 0; k < 26; k++) g.fillRect(x + (R() - .5) * 20, y + (R() - .5) * 11, 2, 2); }
  }, { rep: [3, 3] });
  const rochaM = (tex, brilha = '#000000') => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; return new THREE.MeshLambertMaterial({ map: tex, flatShading: true, emissive: new THREE.Color(brilha) }); };
  const pedregulho = (p, mat, x, y, z, r, sx = 1, sy = 1, sz = 1, tort = .38) => { const m = Z.malha(p, Z.rocha(r, tort, 2), mat, x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = R() * 6.28; return m; };
  const dormindo = (A, x, y, z) => {   // os "z" subindo de quem está dormindo
    const zT = Z.tela(32, 32, g => { g.fillStyle = '#ffffff'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText('z', 16, 24); });
    const zs = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, color: '#cfe0ff', transparent: true, depthWrite: false })); A.g.add(s); return s; });
    Z.anima((dt, t) => zs.forEach((s, i) => { const k = (t * .22 + i / 3) % 1; s.position.set(x + Math.sin(k * 5) * .2 + k * .35, y + k * 1.1, z); s.scale.setScalar(.14 + k * .22); s.material.opacity = Math.sin(k * Math.PI) * .85; }));
  };

  /* ---------- armadura deitada, encostada (o cavaleiro) ---------- */
  function cavaleiro(A) {
    const g = new THREE.Group(); A.g.add(g);
    const aco = new THREE.MeshPhongMaterial({ color: '#7a8aa8', specular: '#e8f0ff', shininess: 42, emissive: '#141a2a', flatShading: true }), aco2 = new THREE.MeshPhongMaterial({ color: '#4a566e', specular: '#a8c0f0', shininess: 30, emissive: '#0a0e1a', flatShading: true }), couro = Z.solido('#2a1810'), capa = Z.solido('#4a1420', { side: THREE.DoubleSide });
    const peca = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = Z.malha(g, geo, m, x, y, z); o.rotation.set(rx, ry, rz); return o; };
    const cil = (r1, r2, h, n = 9) => new THREE.CylinderGeometry(r1, r2, h, n), bola = r => new THREE.SphereGeometry(r, 10, 8);
    // costas apoiadas, pernas esticadas morro abaixo (+x)
    const peito = peca(cil(.34, .26, .78), aco, -.38, .62, 0, 0, 0, .92); peito.scale.z = 1.18;
    peca(cil(.25, .3, .3), couro, -.03, .36, 0, 0, 0, 1.2);
    peca(cil(.27, .27, .1), aco2, .02, .34, 0, 0, 0, 1.2);
    for (const s of [-1, 1]) {
      peca(bola(.2), aco, -.63, .82, s * .42).scale.set(1.15, .8, 1);
      peca(cil(.11, .1, .55), aco2, -.4, .55, s * .52, s * .1, 0, .62);
      peca(bola(.11), aco, -.22, .32, s * .55); peca(cil(.095, .12, .48), aco, .02, .36, s * .38, -s * .55, 0, 1.35); peca(bola(.11), aco2, .2, .4, s * .2);
      peca(cil(.15, .12, .62), aco2, .43, .26, s * .19, 0, s * -.12, 1.52); peca(bola(.14), aco, .75, .27, s * .23); peca(cil(.115, .09, .66), aco, 1.1, .18, s * .26, 0, 0, 1.66);
      peca(new THREE.BoxGeometry(.2, .34, .2), aco2, 1.5, .24, s * .26, 0, 0, -.18);
    }
    const cab = new THREE.Group(); cab.position.set(-.84, 1.05, 0); cab.rotation.z = .5; g.add(cab);
    Z.malha(cab, bola(.24), aco); Z.malha(cab, cil(.2, .25, .2), aco2, 0, -.14, 0); Z.malha(cab, new THREE.BoxGeometry(.06, .035, .3), Z.luz('#05060a'), .23, .01, 0); Z.malha(cab, new THREE.BoxGeometry(.5, .07, .04), aco2, 0, .21, 0);
    const pano = Z.malha(g, new THREE.PlaneGeometry(1.5, .95, 5, 3), capa, -.35, .12, 0); pano.rotation.x = -Math.PI / 2;
    { const p = pano.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, R() * .09); pano.geometry.computeVertexNormals(); }
    // a espada caída ao lado
    peca(new THREE.BoxGeometry(1.35, .035, .1), aco, .45, .12, .72, 0, .16, 0); peca(new THREE.BoxGeometry(.07, .08, .4), aco2, -.25, .13, .83, 0, .16, 0); peca(cil(.035, .035, .32), couro, -.44, .13, .86, 0, .16, Math.PI / 2);
    Z.anima((dt, t) => { const k = 1 + Math.sin(t * 1.25) * .035; peito.scale.set(k, 1, 1.18 * k); cab.rotation.z = .5 + Math.sin(t * 1.25 - .4) * .025; });
    return g;
  }

  /* ---------- o goblin de armadura que cochila na ravina ---------- */
  function goblin(A) {
    const g = new THREE.Group(); A.g.add(g);
    const pele = Z.solido('#5a8a4a', { emissive: new THREE.Color('#0c1c0a') }), dentro = Z.solido('#b86a5a', { emissive: new THREE.Color('#24100c') }), aco = new THREE.MeshPhongMaterial({ color: '#5a6068', specular: '#d8e8ff', shininess: 36, flatShading: true }), pano = Z.solido('#6a3a22'), preto = Z.solido('#14100c'), osso = Z.solido('#d8d0a8');
    const peca = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = Z.malha(g, geo, m, x, y, z); o.rotation.set(rx, ry, rz); return o; };
    const cil = (r1, r2, h) => new THREE.CylinderGeometry(r1, r2, h, 9), bola = r => new THREE.SphereGeometry(r, 10, 8);
    const peito = peca(cil(.38, .34, .72), aco, 0, .86, -.12, -.34); peito.scale.z = .8;
    peca(cil(.35, .42, .36), pano, 0, .42, .02);
    for (const s of [-1, 1]) {
      peca(bola(.2), aco, s * .44, 1.14, -.17).scale.y = .75;
      peca(cil(.1, .09, .52), pele, s * .55, .86, -.1, -.1, 0, s * .22); peca(cil(.12, .1, .45), aco, s * .6, .48, .14, -.9, 0, s * .1); peca(bola(.13), pele, s * .62, .34, .36);
      peca(cil(.16, .13, .6), pano, s * .22, .3, .36, -1.35, s * .22); peca(bola(.14), aco, s * .3, .38, .68); peca(cil(.12, .1, .52), aco, s * .34, .22, .94, -1.9, s * .12); peca(new THREE.BoxGeometry(.24, .18, .4), preto, s * .38, .1, 1.24);
    }
    const cab = new THREE.Group(); cab.position.set(.03, 1.52, -.24); cab.rotation.set(-.22, 0, .2); g.add(cab);
    const c = Z.malha(cab, bola(.31), pele); c.scale.set(1.1, .95, .95);
    for (const s of [-1, 1]) {
      const orelha = Z.malha(cab, new THREE.ConeGeometry(.15, .68, 4), pele, s * .55, .1, -.04); orelha.rotation.z = -s * 1.38; orelha.scale.z = .35;
      const meio = Z.malha(cab, new THREE.ConeGeometry(.08, .46, 4), dentro, s * .52, .1, .015); meio.rotation.z = -s * 1.38; meio.scale.z = .2;
      Z.malha(cab, bola(.1), pele, s * .12, .06, .25).scale.set(1.1, .6, .7); Z.malha(cab, new THREE.BoxGeometry(.17, .022, .04), preto, s * .12, .02, .325).rotation.z = s * .12;
      Z.malha(cab, new THREE.ConeGeometry(.025, .09, 4), osso, s * .1, -.15, .29);
    }
    Z.malha(cab, new THREE.ConeGeometry(.09, .3, 6), pele, 0, -.04, .39).rotation.x = Math.PI / 2 + .3;
    Z.malha(cab, new THREE.BoxGeometry(.26, .03, .03), preto, 0, -.17, .27);
    Z.malha(cab, new THREE.SphereGeometry(.325, 10, 5, 0, 6.3, 0, 1.1), aco, 0, .05, -.03);
    Z.anima((dt, t) => { const k = 1 + Math.sin(t * 1.05) * .05; peito.scale.set(k, 1, .8 * k); cab.rotation.x = -.22 + Math.sin(t * 1.05 - .5) * .05; });
    return g;
  }

  // chão com relevo (a colina): usa a mesma conta do caminhar
  function terreno(p, w, d, cz, alt, mat) {
    const geo = new THREE.PlaneGeometry(w, d, 46, 60); geo.rotateX(-Math.PI / 2);
    const a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) a.setY(i, alt(a.getX(i), a.getZ(i) + cz));
    geo.computeVertexNormals(); return Z.malha(p, geo, mat, 0, 0, cz);
  }
  const subida = z => 2.6 * Math.exp(-Math.pow((z + 21) / 12, 2));
  const colina = (x, z) => subida(z) - Math.max(0, x - 5) * .42 + Math.max(0, -x - 6) * .3 + (Z.ruido(x * .22, z * .22, 3) - .5) * .9 * Math.min(1, Math.max(0, Math.abs(x) - 3) / 4);
  // fita de espuma acompanhando a beira do mar
  const vale = (x, z) => Math.max(0, Math.abs(x - Math.sin(z * .09) * 2) - 6.5) * .72 + (Z.ruido(x * .25, z * .25, 7) - .5) * 1.4 * Math.min(1, Math.max(0, Math.abs(x) - 5) / 3);
  const praia = (x, z) => x < -3 ? (x + 3) * .14 : Math.max(0, x - 6) * .28 + (x > 5 ? (Z.ruido(x * .4, z * .4, 1) - .5) * .7 : 0);
  const marX = (z, t = 0) => -4.6 - Math.sin(z * .19) * .7 - Math.sin(z * .07 + 2) * .8 + Math.sin(t * .7 + z * .12) * .35;

  const trechos = [
    /* ===================== 1 · a colina do cavaleiro ===================== */
    {
      nome: 'A colina do cavaleiro', placa: 'DESCER →', cor: '#ff9a6a', chao: 'grass', fog: ['#2a3450', .016],
      caminho: [[0, 6], [.6, -8], [-1.4, -18], [.4, -27], [0, -40]], area: [-13, 13, -46, 10], borda: BORDAS.mata('#10382c', 3.8),
      ground: colina,
      pensa: '(Esse céu eu já vi num sonho. Ou numa fita.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#0a1850'], [.45, '#1c3a8a'], [.23, '#5a62b0'], [.12, '#ff6a8a'], [.04, '#ff8a2a'], [-.03, '#7a3a3a'], [-.2, '#141a28'], [-1, '#060a10']], nuvens: { cor: '#16224e', cor2: '#4a5a9a', de: .49, ate: .66, escala: 2.1, torce: .5, forca: 1, alt0: .05, alt1: .7 }, estrelas: 60, clarao: [{ az: Math.PI + .5, el: .06, raio: .9, cor: '#ffb040', forca: .7 }] }));
        Z.serra(A.longe, { raio: 78, base: -14, alt: 13, pico: 8, cor: '#1c2840', bruma: '#5a3c5a', freq: 3, seed: 71, ponta: 1.2 });
        Z.serra(A.longe, { raio: 68, base: -16, alt: 11, pico: 7, cor: '#0c1a1e', bruma: '#2a2c48', freq: 4.4, seed: 74, ponta: 1.3 });
        A.hemi('#b8ccff', '#2a5a34', 2.7); A.sol('#ff9a58', 2.3, -12, 5, -9); A.sol('#7aa0ff', 1.2, 10, 8, 6); A.ponto('#a8c4ff', 16, 8, -2.2, colina(-3, -19) + 2.4, -17.6);
        const gramaT = Z.tela(64, 64, g => { g.fillStyle = '#2c6a36'; g.fillRect(0, 0, 64, 64); Z.manchas(g, 64, 64, 800, ['#1e522a', '#3a8040', '#4a984a', '#265a44', '#5a8c38'], 1, 2); }, { nitido: true, rep: [20, 26] });
        terreno(A.g, 76, 100, -22, colina, new THREE.MeshLambertMaterial({ map: gramaT, emissive: new THREE.Color('#06120a') }));
        // capim comprido balançando no vento
        for (const [n, perto, longeZ, alt] of [[2600, 0, 15, .42], [1100, 1.7, 3, .24]]) {
          const tufos = Z.capim(A.g, n, i => { const s = i % 2 ? 1 : -1, z = 10 - R() * 56, x = (this.caminho.find((c, k) => k && z >= c[1]) || [0])[0] * .8 + s * ((perto || 2.1) + R() * longeZ); return [x, colina(x, z) - .03, z]; }, ['#48a04c', '#66bc58', '#368044', '#7ab84a'], alt);
          Z.anima((dt, t) => { tufos.position.x = Math.sin(t * 1.4) * .035; });
        }
        const rm = rochaM(pedraTex('#3a463e', ['#2a342c', '#56644e', '#1c241e', '#6a7660'], ['#2c5a2a', '#44742e']), '#080e0a');
        // o paredão onde o cavaleiro se encosta
        const bx = -7, bz = -19.5, by = colina(-5, -19.5);
        pedregulho(A.g, rm, bx - 1.4, by + 2.6, bz - .6, 2.9, .9, 1.8, 1.1, .3); pedregulho(A.g, rm, bx - 1, by + 7, bz - 1, 2.3, .85, 1.5, .9, .35); pedregulho(A.g, rm, bx + .5, by + 10, bz - .8, 2, 1.5, .8, 1, .35); pedregulho(A.g, rm, bx - .8, by + .4, bz + 2.4, 1.7, 1.2, .8, 1);
        A.bloco(bx - 1, bz, 2.6);
        const cav = cavaleiro(A); cav.position.set(-4.35, colina(-4.35, -19) - .02, -19); cav.rotation.y = .22; cav.scale.setScalar(1.12);
        A.bloco(-4.2, -19, .85);
        dormindo(A, -5.2, colina(-4.35, -19) + 1.55, -19);
        A.interage(2.2, 1.4, 1.8, -4, colina(-4.35, -19) + .7, -19, 'Cavaleiro', () => E.conversa([['VOCÊ', 'Ei... moço? Você tá bem?'], ['CAVALEIRO', '...só mais cinco minutinhos...', '#b8c8f0'], ['VOCÊ', '(Deixa ele. Pela ferrugem, esses cinco minutos já duram uns anos.)']]));
        for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1, z = 6 - R() * 52, x = s * (4.5 + R() * 12); if (s < 0 && Math.abs(z + 19) < 6) continue; pedregulho(A.g, rm, x, colina(x, z) + .1, z, .3 + R() * R() * 1.8, 1, .6 + R() * .6, 1); }
        Z.flores(A.g, 120, i => { const s = i % 2 ? 1 : -1, z = 6 - R() * 46, x = s * (2.1 + R() * 5); return [x, colina(x, z) + .2, z]; }, ['#ffd0a0', '#c8a0ff', '#ffffff'], .05);
        // um dragão passando bem longe, contra o pôr do sol
        Z.voa(Z.dragao(A.g, { s: .9, cor: '#0e1222', barriga: '#1c1a2c', asa: '#141428', olho: '#ff9a3a' }), { cx: -14, cz: -66, y: 17, r: 20, rz: 9, vel: .12, fase: 1 });
        for (let i = 0; i < 3; i++) Z.voa(Z.revoada(A.g, { s: .22, cor: '#0a0c18' }), { cx: 20 + i * 2, cz: -58 - i * 2, y: 19 + i, r: 11, vel: .2, fase: i * .22, plana: 0 });
        Z.vagalumes(A.g, 45, [-8, 8, .5, 5, -34, 4], '#ffb070', .03, .25);
        A.moeda(.8, -10); A.moeda(-2.2, -20.2); A.moeda(0, -31);
      },
    },
    /* ===================== 2 · a praia da lua ===================== */
    {
      nome: 'A praia da lua', placa: 'CONTINUAR →', cor: '#5a8aff', chao: 'carpet', fog: ['#0a1650', .014],
      caminho: [[1.5, 6], [-.4, -8], [.6, -20], [-1, -31], [2.6, -43]],
      ground: praia, livre: (x, z) => x > marX(z) - .5 && x < 8.4 && z > -46 && z < 10,
      pensa: '(O mar está aceso de azul. Faz barulho de gente respirando.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#01020c'], [.5, '#040c34'], [.2, '#0e2a8a'], [.04, '#2a54c0'], [-.04, '#0c2478'], [-1, '#020618']], nuvens: { cor: '#02040e', cor2: '#2a52b8', de: .45, ate: .68, escala: 2.8, torce: .8, forca: 1, alt0: .05, alt1: .9 }, estrelas: 160, clarao: [{ az: Math.PI + .42, el: .27, raio: .5, cor: '#6a9aff', forca: .85 }] }));
        Z.lua(A.longe, { az: Math.PI + .42, el: .27, tam: 7, cor: '#eef6ff', sombra: '#5a8ae0', halo: '#5a90ff' });
        A.hemi('#98b4ff', '#4a3020', 2.5); A.sol('#98c0ff', 2, -9, 8, -12); A.sol('#ffb890', .6, 10, 6, 6);
        // areia molhada e pisada
        const areiaT = Z.tela(64, 64, g => { g.fillStyle = '#76584c'; g.fillRect(0, 0, 64, 64); Z.manchas(g, 64, 64, 700, ['#5e463e', '#8a6a58', '#a07c64', '#483430'], 1, 2); }, { nitido: true, rep: [14, 28] });
        const areia = terreno(A.g, 36, 100, -22, () => 0, new THREE.MeshLambertMaterial({ map: areiaT })); areia.position.x = 11;
        { const a = areia.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i) + 11; a.setY(i, praia(x, a.getZ(i) - 22)); } a.needsUpdate = true; areia.geometry.computeVertexNormals(); }
        Z.copias(A.g, Z.rocha(.09, .5, 0), Z.solido('#33262a'), 420, (o, i) => { const z = 9 - R() * 56, x = -3.6 + R() * 13; o.position.set(x, .02, z); o.rotation.set(R() * 3, R() * 3, 0); o.scale.set(.5 + R() * 1.6, .4 + R() * .7, .5 + R() * 1.4); });
        // o mar
        const marT = Z.tela(128, 128, g => { g.fillStyle = '#0a2a9a'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 260; i++) { g.strokeStyle = ['#1c4ad0', '#06206a', '#3a74ff', '#0c36b0'][(R() * 4) | 0]; g.lineWidth = 1 + R() * 2; const x = R() * 128, y = R() * 128, w = 5 + R() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 3, x + w, y); g.stroke(); } }, { nitido: true, rep: [10, 14] });
        const mar = Z.malha(A.g, new THREE.PlaneGeometry(90, 130), Z.luz({ map: marT, fog: true }), -49, -.2, -25); mar.rotation.x = -Math.PI / 2;
        const raso = Z.malha(A.g, new THREE.PlaneGeometry(1, 100, 1, 60), Z.luz({ color: '#2a6aff', transparent: true, opacity: .55, fog: true, side: THREE.DoubleSide, depthWrite: false }));
        const espuma = [0, 1].map(k => Z.malha(A.g, new THREE.PlaneGeometry(1, 100, 1, 90), Z.luz({ color: k ? '#6a9aff' : '#cfe4ff', transparent: true, opacity: k ? .5 : .9, fog: true, side: THREE.DoubleSide, depthWrite: false })));
        const fita = (m, y, x0, x1) => { const a = m.geometry.attributes.position, linhas = a.count / 2; for (let i = 0; i < linhas; i++) { const z = 28 - i / (linhas - 1) * 100; a.setXYZ(i * 2, x0(z), y, z); a.setXYZ(i * 2 + 1, x1(z), y, z); } a.needsUpdate = true; m.frustumCulled = false; };
        let acc = 1;
        Z.anima((dt, t) => {
          marT.offset.y = t * .018; marT.offset.x = Math.sin(t * .24) * .02;
          acc += dt; if (acc < .05) return; acc = 0;
          fita(raso, -.12, z => -10, z => marX(z, t));
          fita(espuma[0], -.09, z => marX(z, t) - .13 - Math.sin(z * 1.7 + t * 2) * .05, z => marX(z, t));
          fita(espuma[1], -.1, z => marX(z, t - 2.2) - 1.35, z => marX(z, t - 2.2) - 1.2);
        });
        // o caminho da lua na água
        const brilhos = [...Array(46)].map((_, i) => { const d = 9 + i * 1.25, s = Z.brilho(A.g, '#a8ccff', .5, -8 - d * .43 + (R() - .5) * 2.4, -.08, -6 - d * .92 + (R() - .5), .6); s.scale.set(1 + R() * 2.4, .14, 1); return s; });
        Z.anima((dt, t) => brilhos.forEach((s, i) => { s.material.opacity = .25 + .55 * Math.abs(Math.sin(t * (1 + (i % 5) * .35) + i)); }));
        // rochedos no mar e o paredão da direita
        const rn = rochaM(pedraTex('#241c28', ['#161018', '#382c3a', '#0e0a12', '#44364a'], null), '#06040c');
        const agulhas = (cx, cz, n, esp, alt) => { for (let i = 0; i < n; i++) { const x = cx + (R() - .5) * esp * 2, z = cz + (R() - .5) * esp * .8, h = alt * (.35 + R() * .75); const c = Z.malha(A.g, new THREE.ConeGeometry(1.3 + R() * 1.5, h, 7, 4), rn, x, h / 2 - .6, z); const a = c.geometry.attributes.position; for (let k = 0; k < a.count; k++) { const yy = a.getY(k); if (yy < h / 2 - .1) { const f = 1 + (Z.ruido(a.getX(k) * 1.3, yy * .8, a.getZ(k) * 1.3 + i) - .5) * .85; a.setX(k, a.getX(k) * f); a.setZ(k, a.getZ(k) * f); } } c.geometry.computeVertexNormals(); } pedregulho(A.g, rn, cx, -.7, cz, esp * 1.15, 1.2, .35, .7); };
        agulhas(-26, -52, 15, 5.5, 17); agulhas(-30, -14, 7, 3, 12); agulhas(-14, -66, 6, 3, 9);
        for (let i = 0; i < 18; i++) { const z = 10 - i * 3.6; pedregulho(A.g, rn, 11.5 + (i % 3) * 1.3, 1.4, z, 2.6 + R() * 1.5, .9, 1.2 + R() * 1.1, 1.1); }
        pedregulho(A.g, rn, 4, 5, -52, 5, 1.4, 1.9, .9);
        for (const [x, z, r] of [[-3.2, -14, .55], [3.9, -25, .8], [-3.6, -37, .7], [4.5, -6, .5]]) { pedregulho(A.g, rn, x, .15, z, r, 1.1, .7, 1); A.bloco(x, z, r * .9); }
        for (const z of [11.4, -47.6]) for (let x = -5; x < 10; x += 1.9) { if (z < 0 && Math.abs(x - 2.6) < 3) continue; pedregulho(A.g, rn, x, .2, z, 1.2 + R() * .6, 1, .8 + R() * .8, 1); }
        // conchas e uma garrafa com bilhete
        Z.flores(A.g, 70, () => [-3.8 + R() * 2.2, .04, 6 - R() * 48], ['#d8c8e8', '#a8d8ff'], .05);
        const garrafa = Z.malha(A.g, new THREE.CylinderGeometry(.09, .12, .42, 8), new THREE.MeshBasicMaterial({ color: '#8affc8', transparent: true, opacity: .8 }), -1.9, .12, -23); garrafa.rotation.z = 1.35;
        Z.brilho(A.g, '#7affc0', .9, -1.9, .18, -23, .55);
        A.interage(1, .8, 1, -1.9, .3, -23, 'Garrafa com bilhete', () => { E.sfx.pick(); return E.note('<small>BILHETE NA GARRAFA</small><p>“Se você está lendo isto, também entrou pela porta do arco-íris.</p><p>Não acorde ninguém. Quando o reino dorme, <b>ele não escuta</b>.”</p><p class="dim">(sem assinatura)</p>'); });
        Z.vagalumes(A.g, 40, [-12, 7, .2, 4, -46, 6], '#8ab8ff', .03, .2);
        A.moeda(.2, -11); A.moeda(1.6, -26); A.moeda(.6, -38);
      },
    },
    /* ===================== 3 · a ravina de musgo ===================== */
    {
      nome: 'A ravina de musgo', placa: 'SAIR →', cor: '#6affa0', chao: 'wood', fog: ['#0a221c', .04],
      caminho: [[0, 5], [.2, -7], [-2.6, -14], [-.6, -23], [2.4, -30], [0, -38]],
      livre: function (x, z) { if (z > 7.5 || z < -40.5) return false; let m = 0; const c = this.caminho; for (let i = 0; i < c.length - 1; i++) { const [ax, az] = c[i], [bx, bz] = c[i + 1]; if (z <= az && z >= bz) m = ax + (bx - ax) * (z - az) / (bz - az); } const d = x - m; return d > -3.5 && d < (z < -13 && z > -24 ? 6.4 : 3.5); },
      pensa: '(Pinga água de todo lado. E alguém está roncando.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#2a5a6a'], [.6, '#163c3c'], [.2, '#08201a'], [-1, '#020806']], nuvens: { cor: '#0c2420', cor2: '#4a8a82', de: .48, ate: .76, escala: 3, torce: .6, forca: .8, alt0: .25, alt1: 1 } }));
        A.hemi('#c0f0d8', '#2a3a1c', 2.5); A.sol('#e0fff0', 1.6, 2, 14, 3);
        A.ponto('#6affb0', 9, 12, 2, 3, -18); A.ponto('#8ac8ff', 12, 14, 0, 4, -37);
        const lama = Z.tela(64, 64, g => { g.fillStyle = '#26200f'; g.fillRect(0, 0, 64, 64); Z.manchas(g, 64, 64, 600, ['#1a160a', '#362c18', '#1c3016', '#44381e'], 1, 3); }, { nitido: true, rep: [9, 18] });
        Z.malha(A.g, new THREE.PlaneGeometry(36, 72), new THREE.MeshPhongMaterial({ map: lama, specular: '#2a4a3a', shininess: 22 }), 0, -.01, -17).rotation.x = -Math.PI / 2;
        const musgo = rochaM(pedraTex('#33463a', ['#222f26', '#4a6048', '#16201a', '#5a7258'], ['#2a6a2c', '#4a8a30', '#1c5026', '#6a9a3a']), '#07100a');
        const cam = this.caminho;
        const meio = z => { for (let i = 0; i < cam.length - 1; i++) { const [ax, az] = cam[i], [bx, bz] = cam[i + 1]; if (z <= az && z >= bz) return ax + (bx - ax) * (z - az) / (bz - az); } return 0; };
        // paredões dos dois lados, apertando o caminho
        for (let i = 0; i < 24; i++) for (const s of [-1, 1]) {
          const z = 9 - i * 2.15 + (s > 0 ? 1 : 0), alarga = s > 0 && z < -13 && z > -24 ? 3.2 : 0, x = meio(z) + s * (5.5 + R() * .7 + alarga);
          if (z < -39) continue;
          pedregulho(A.g, musgo, x, 1.6, z, 2.1, .85, 1.5 + R() * .7, 1, .32);
          pedregulho(A.g, musgo, x + s * 1.5, 5.4 + R() * 1.6, z - .6, 2.2, .9, 1.3 + R() * .7, 1.1, .35);
        }
        for (let i = 0; i < 44; i++) { const s = i % 2 ? 1 : -1, z = 6 - R() * 44, x = meio(z) + s * (2.3 + R() * 1.6), r = .22 + R() * .5; if (s > 0 && z < -14 && z > -23) continue; pedregulho(A.g, musgo, x, .05, z, r, 1.2, .7, 1); if (r > .42 && Math.abs(x - meio(z)) > r + 1.1) A.bloco(x, z, r * .95); }
        for (const z of [9.2, -42.4]) for (let k = -4; k <= 4; k += 1.6) { if (z < 0 && Math.abs(k) < 2) continue; pedregulho(A.g, musgo, meio(Math.max(-38, Math.min(5, z))) + k, 1, z, 1.4, 1, 1.5, 1); }
        Z.capim(A.g, 700, i => { const s = i % 2 ? 1 : -1, z = 7 - R() * 46; return [meio(z) + s * (1.7 + R() * 1.8), 0, z]; }, ['#2a6a2a', '#3a8a32', '#1c5230', '#5a8a2c'], .3);
        Z.flores(A.g, 130, i => { const s = i % 2 ? 1 : -1, z = 6 - R() * 44; return [meio(z) + s * (2.3 + R() * 1.2), .15 + R() * 1.5, z]; }, ['#8affb0', '#caffd8', '#6ae8ff'], .05);
        for (let i = 0; i < 14; i++) { const s = i % 2 ? 1 : -1, z = 4 - i * 3, x = meio(z) + s * 2.7; if (s > 0 && z < -13 && z > -24) continue; Z.cogumelo(A.g, x, z, .13 + R() * .16, i % 3 ? '#2a8a7a' : '#8a6a2a', '#d8ffe8'); }
        // cipós pendurados
        Z.copias(A.g, new THREE.CylinderGeometry(.025, .015, 1, 4), Z.solido('#2a5a24'), 90, (o, i) => { const s = i % 2 ? 1 : -1, z = 6 - R() * 42, l = 1 + R() * 3.5; o.position.set(meio(z) + s * (4.1 + R() * .9), 6.4 - l / 2, z); o.scale.y = l; });
        // pingos
        const gotas = [...Array(26)].map(() => Z.brilho(A.g, '#a8ffe0', .09, 0, -9, 0, .9)), dg = gotas.map(() => { const z = 4 - R() * 40; return [meio(z) + (R() - .5) * 4, z, R(), .5 + R() * .5]; });
        Z.anima((dt, t) => gotas.forEach((s, i) => { const [x, z, f, v] = dg[i], k = (t * v + f) % 1; s.position.set(x, 6 * (1 - k * k), z); }));
        let ping = 2, ronco = 1.5;
        Z.anima(dt => {
          ping -= dt; if (ping <= 0) { ping = .8 + R() * 2.4; E.tone(900 + R() * 900, .09, .02, 'sine', null, 0, 0, 500); }
          ronco -= dt; if (ronco <= 0) { ronco = 6; if (A.perto(2.6, -19, 9)) { E.noiseHit(1.3, .11, 230); E.tone(70, 1.1, .05, 'sawtooth', null, .1, 0, 52); } }
        });
        const gb = goblin(A); gb.position.set(3.35, .12, -19); gb.rotation.y = -1.15; gb.scale.setScalar(1.2);
        pedregulho(A.g, musgo, 4.5, .55, -19.5, 1.05, .8, 1.25, 1.2, .22); pedregulho(A.g, musgo, 2.9, -.05, -17.6, .5, 1.3, .6, 1);
        A.bloco(3.5, -19.1, 1.05);
        dormindo(A, 3.6, 2.35, -18.8);
        A.interage(1.7, 1.8, 1.7, 3, 1, -19, 'Goblin dormindo', async () => {
          const i = await E.choice('Um goblin de armadura, roncando.', ['Cutucar', 'Deixar dormir'], 1, 10);
          if (i === 0) { E.noiseHit(.5, .2, 300); return E.conversa([['GOBLIN', '...mãe... hoje não tem guarda... é feriado...', '#9ae88a'], ['VOCÊ', '(Virou pro outro lado e continuou. Melhor não abusar.)']]); }
          return E.conversa([['VOCÊ', '(Bom descanso, soldado.)']]);
        });
        A.moeda(-1.8, -12.4); A.moeda(1.2, -17.4); A.moeda(2, -29);
      },
    },
    /* ===================== 4 · o vale do castelo ===================== */
    {
      nome: 'O vale da lua vermelha', placa: 'A PORTA →', cor: '#ff6a8a', chao: 'wood', fog: ['#16244e', .013],
      caminho: [[0, 6], [0, -10], [-3, -19], [-1, -28], [1.2, -36], [0, -43]],
      ground: vale, area: [-12, 12, -46, 10], borda: BORDAS.mata('#0e2e34', 4.4),
      pensa: '(O castelo. E a coisa enrolada na frente dele... está respirando.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#060c34'], [.5, '#122266'], [.2, '#2a44a0'], [.04, '#4a64b0'], [-.1, '#14243e'], [-1, '#040a10']], nuvens: { cor: '#131c54', cor2: '#7a8ad0', de: .42, ate: .72, escala: 2.4, torce: .9, forca: .95, alt0: 0, alt1: .9 }, estrelas: 130, clarao: [{ az: Math.PI + .22, el: .36, raio: .42, cor: '#e86a9a', forca: .75 }] }));
        Z.lua(A.longe, { az: Math.PI + .22, el: .36, tam: 6.5, cor: '#ff9ab0', sombra: '#b8365a', halo: '#ff4a7a' });
        Z.serra(A.longe, { raio: 76, base: -6, alt: 12, pico: 22, cor: '#0c1a34', bruma: '#2c4484', freq: 5, seed: 81, ponta: 1.7 });
        A.hemi('#b0c8ff', '#1e4a30', 2.5); A.sol('#ff90b0', 1.3, -6, 12, -14); A.sol('#8ab0ff', 1.4, 8, 7, 8); A.ponto('#ffa870', 26, 13, -4.5, 3.2, -30);
        const relva = Z.tela(64, 64, g => { g.fillStyle = '#1e4c3c'; g.fillRect(0, 0, 64, 64); Z.manchas(g, 64, 64, 700, ['#143a2e', '#2c664a', '#367056', '#24404e'], 1, 2); }, { nitido: true, rep: [20, 24] });
        const alt = vale;
        terreno(A.g, 70, 90, -22, alt, new THREE.MeshLambertMaterial({ map: relva, emissive: new THREE.Color('#05100c') }));
        const pm = rochaM(pedraTex('#222c3e', ['#161e2c', '#34425a', '#0e141e', '#42506a'], ['#16403a', '#1e4a34']), '#060a14');
        for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const z = 4 - i * 8.4, x = s * (17 + (i % 3) * 2.5); const h = 12 + R() * 13; const c = Z.malha(A.g, new THREE.ConeGeometry(6 + R() * 3, h, 8, 5), pm, x, h / 2 + 1.5, z); const a = c.geometry.attributes.position; for (let k = 0; k < a.count; k++) { const yy = a.getY(k); if (yy < h / 2 - .1) { const f = 1 + (Z.ruido(a.getX(k) * .55, yy * .35, a.getZ(k) * .55 + i * 3) - .5) * .75; a.setX(k, a.getX(k) * f); a.setZ(k, a.getZ(k) * f); } } c.geometry.computeVertexNormals(); }
        for (let i = 0; i < 60; i++) { const s = i % 2 ? 1 : -1, z = 8 - R() * 52, x = s * (4.6 + R() * 7); pedregulho(A.g, pm, x, alt(x, z), z, .25 + R() * R() * 1.4, 1.1, .6 + R() * .5, 1); }
        Z.capim(A.g, 1700, i => { const s = i % 2 ? 1 : -1, z = 9 - R() * 52, x = s * (2.3 + R() * 9); return [x, alt(x, z) - .03, z]; }, ['#1c5a3a', '#2a7046', '#184a40', '#2a5a5a'], .34);
        const agua = Z.rachado('#10245e', '#8ab0ff', 20);
        Z.estrada(A.g, [[11, 8], [6.5, -8], [4.8, -22], [6.8, -34], [3.5, -46], [-6, -52]], 2.4, agua, { y: .07, brilha: true });
        Z.anima(dt => { agua.offset.y -= dt * .09; });
        Z.estrada(A.g, [[0, 12], [0, -10], [-3, -19], [-1, -28], [1.2, -36], [0, -52]], 2.7, Z.pedrinhas('#141a2c', ['#38425e', '#46506e', '#2c344e', '#525c7a']), { y: .035 });
        Z.pinheiros(A.g, 110, i => { const s = i % 2 ? 1 : -1, z = 6 - R() * 66, x = s * (9.5 + R() * 9); return [x, alt(x, z) - .4, z]; }, '#0c2430', 3.4);
        // o castelo gótico
        const cas = Z.castelo(A.g, { x: -4, y: 3, z: -64, s: 1.25, pedra: '#1a1e34', pedra2: '#282e4c', telhado: '#0a0c1a', janela: '#ffb45a' }); cas.rotation.y = .12;
        for (const [dx, dz, h] of [[-3.4, 3.4, 15], [3.2, 2.6, 17], [-1, -1, 20]]) { Z.malha(cas, new THREE.ConeGeometry(.55, h, 6), Z.solido('#0c0e1e', { emissive: new THREE.Color('#080a16'), fog: false }), dx, h / 2 + 3, dz); }
        // o dragão que dorme enrolado nas pedras, antes da porta
        const bx = -9.4, bz = -33;
        pedregulho(A.g, pm, bx, 0, bz, 3.1, 1.25, .5, 1.15, .22);
        const d = Z.dragao(A.g, { s: 1.65, cor: '#2e7a82', barriga: '#c8b88a', asa: '#5a3a8a', olho: '#ff7a2a', longe: false });
        d.position.set(bx, 2.85, bz); d.rotation.y = 1.05; d.userData.dormir();
        const fumo = [0, 1, 2, 3, 4].map(() => Z.brilho(A.g, '#a8b8d8', .5, 0, -9, 0, 0)), bico = new THREE.Vector3();
        let respiro = 0;
        Z.anima((dt, t) => {
          d.userData.pose(t * .35, 'pousado');
          const nk = d.userData.pescoco; nk.rotation.x = 1.02 + Math.sin(t * .9) * .035; nk.rotation.y = .3; d.userData.cabeca.rotation.x = -.62;
          d.scale.set(1.65, 1.65 * (1 + Math.sin(t * .9) * .022), 1.65);
          d.userData.cabeca.localToWorld(bico.set(0, .05, 1.1)); A.g.worldToLocal(bico);
          fumo.forEach((f, i) => { const k = (t * .24 + i / 5) % 1; f.position.set(bico.x + k * .9, bico.y + k * 1.5, bico.z + k * .5); f.scale.setScalar(.2 + k * 1.1); f.material.opacity = .3 * (1 - k); });
          respiro -= dt; if (respiro <= 0) { respiro = 6.98; if (A.perto(bx, bz, 19)) Z.somDragao('ronco', 1, d.getWorldPosition(bico.clone())); }
        });
        A.bloco(bx, bz, 4);
        A.interage(4, 3, 2.4, -2.6, 1.4, -29, 'Dragão dormindo', () => { Z.somDragao('ronco', 1.2); E.later(1.6, () => Z.somDragao('longe', .5)); return E.conversa([['VOCÊ', '(Não encosta. Não respira alto. Não faz “fiu fiu”.)']]); });
        Z.voa(Z.dragao(A.g, { s: .9, cor: '#141c3a', barriga: '#3a3a5a', asa: '#241a44', olho: '#ff6a8a' }), { cx: -4, cz: -60, y: 24, r: 15, vel: .2 });
        // tochas do caminho até a porta
        for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const z = -33 - i * 3.2, x = (i < 2 ? 1.2 : .4) + s * 2.5; if (z < -47) continue; Z.malha(A.g, new THREE.CylinderGeometry(.06, .09, 1.3, 5), Z.solido('#1a100c'), x, .65, z); const ch = Z.brilho(A.g, '#ff8a2a', 1.1, x, 1.45, z, .9); Z.brilho(A.g, '#ffd86a', .35, x, 1.4, z, 1); Z.anima((dt, t) => { const k = 1 + Math.sin(t * 13 + i * 2 + s) * .14; ch.scale.set(1.1 * k, 1.3 * k, 1); }); }
        Z.vagalumes(A.g, 60, [-8, 8, .3, 4, -46, 6], '#a8d8ff', .03);
        A.moeda(0, -9); A.moeda(-2.8, -21); A.moeda(1.2, -35);
      },
    },
  ];

  const tr = trilho(E, L, Z, trechos, 'brinquedo');
  L.ambience = bus => { E.loopNoise('lowpass', 420, 0, .045, bus); E.loopNoise('bandpass', 5200, 10, .006, bus); };
  L.enter = () => L.anuncia();
  L.update = dt => tr.passo(dt);
  L.idle = () => tr.idle();
  L.exit = () => Z.soltar();
  L.hint = tr.dica;
  L.debug = { tr };
}
