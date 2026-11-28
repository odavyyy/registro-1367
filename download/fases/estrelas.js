// SONHO 2 · A estrada das estrelas: a cidade vigiada pelo gigante de pedra, o corredor de xadrez,
// o milharal da lua cheia e a ponte das lanternas até o castelo.
import { kit, trilho, BORDAS } from './mundo.js';

export function build(E, L) {
  const { THREE } = E;
  E.seed(3302);
  E.camera.far = 90;
  L.speed = 2.5; L.eye = 1.6; L.reach = 2.4;
  L.clock = t => Math.floor(t * 1.2) % 6 === 0 ? '??:??' : '03:67';
  const Z = kit(E, L), R = Z.R, V3 = THREE.Vector3;

  /* ---------- o gigante de pedra com veias de luz: os olhos seguem você ---------- */
  function gigante(A, x, z) {
    const veias = Z.rachado('#10221e', '#5a78ff', 30); veias.wrapS = veias.wrapT = THREE.RepeatWrapping; veias.repeat.set(2, 2);
    const mat = Z.luz({ map: veias }), escuro = Z.luz({ map: veias, color: '#8a8ac8' });
    const g = new THREE.Group(); g.position.set(x, -3, z); g.scale.setScalar(1.32); A.g.add(g);
    const pedra = (pai, m, px, py, pz, r, sx = 1, sy = 1, sz = 1, tort = .2) => { const o = Z.malha(pai, Z.rocha(r, tort, 2), m, px, py, pz); o.scale.set(sx, sy, sz); return o; };
    pedra(g, escuro, 0, 5, -2, 9, 1.35, .95, .6, .28);
    pedra(g, escuro, -9, 10, -2, 4, 1.2, .9, .7); pedra(g, escuro, 9, 10, -2, 4, 1.2, .9, .7);
    const cab = new THREE.Group(); cab.position.set(0, 18, 0); g.add(cab);
    pedra(cab, mat, 0, 0, 0, 6, .92, 1.1, .75, .1);
    pedra(cab, mat, 0, 2.5, 3.7, 1.5, 3, .55, .8, .18);                       // sobrancelha
    pedra(cab, mat, 0, -.9, 4.7, 1.1, .8, 1.9, .8, .1);                       // nariz
    pedra(cab, escuro, 0, -4.2, 3.9, 1.4, 1.8, .45, .7, .12);                 // boca
    pedra(cab, mat, 0, -5.6, 2.6, 2, 1.5, .8, .8, .2);                        // queixo
    for (let i = 0; i < 7; i++) { const a = (i - 3) * .36, h = 3.4 + (i % 2) * 2.2; const c = Z.malha(cab, new THREE.ConeGeometry(.9, h, 5), mat, Math.sin(a) * 5.4, Math.cos(a) * 5.6 + h * .28, -.6); c.rotation.z = -a; }
    const olhos = [-1, 1].map(s => {
      const o = new THREE.Group(); o.position.set(s * 2.3, .9, 4.65); cab.add(o);
      const branco = Z.malha(o, new THREE.CircleGeometry(1, 20), Z.luz('#eef0ff')); branco.scale.set(1.35, .66, 1); branco.rotation.z = s * .22;
      const iris = new THREE.Group(); iris.position.z = .06; o.add(iris);
      Z.malha(iris, new THREE.CircleGeometry(.46, 16), Z.luz('#2a1a7a')); Z.malha(iris, new THREE.PlaneGeometry(.16, .7), Z.luz('#04020e'), 0, 0, .01); Z.malha(iris, new THREE.CircleGeometry(.1, 8), Z.luz('#ffffff'), -.16, .16, .02);
      const palp = Z.malha(o, new THREE.PlaneGeometry(2.9, 1.45), Z.luz('#16263a'), 0, 1.45, .12);
      return { o, iris, palp };
    });
    for (const s of [-1, 1]) {
      const mao = new THREE.Group(); mao.position.set(s * 14, 7, 3); g.add(mao);
      pedra(mao, mat, 0, 0, 0, 3, 1, 1.15, .6, .16);
      for (let d = 0; d < 4; d++) { const dx = (d - 1.5) * 1.55, alt = 3.6 - Math.abs(d - 1.5) * .7; pedra(mao, mat, dx, 2.6 + alt / 2, .2, .75, .85, alt / 1.4, .8, .12); pedra(mao, mat, dx * 1.12, 2.8 + alt * 1.2, .4, .55, .8, 1.6, .7, .1); }
      pedra(mao, mat, -s * 3.2, .6, .6, .85, .8, 2.1, .8, .12).rotation.z = s * .8;
      pedra(g, escuro, s * 12, 1.5, 0, 2.4, 1, 2.6, .8, .25).rotation.z = -s * .35;
      Z.anima((dt, t) => { mao.position.y = 7 + Math.sin(t * .42 + s) * .8; mao.rotation.z = Math.sin(t * .3 + s * 2) * .07; });
    }
    Z.brilho(g, '#5a68ff', 46, 0, 15, -9, .5);
    let piscar = 4;
    const alvo = new V3();
    Z.anima((dt, t) => {
      cab.position.y = 18 + Math.sin(t * .55) * .4;
      alvo.copy(E.camera.position); alvo.x -= A.ox; alvo.sub(new V3(x, 20, z));
      const dx = Math.max(-.62, Math.min(.62, alvo.x / alvo.z * 2.2)), dy = Math.max(-.2, Math.min(.12, alvo.y / alvo.z));
      cab.rotation.y += (Math.atan2(alvo.x, alvo.z) * .5 - cab.rotation.y) * Math.min(1, dt);
      piscar -= dt; const f = piscar < .3 ? 1 - Math.abs(piscar - .15) / .15 : 0; if (piscar < 0) piscar = 4 + R() * 5;
      for (const o of olhos) { o.iris.position.x += (dx - o.iris.position.x) * Math.min(1, dt * 3); o.iris.position.y += (dy - o.iris.position.y) * Math.min(1, dt * 3); o.palp.position.y = 1.45 - Math.max(0, f) * 1.35; }
    });
    return g;
  }

  const trechos = [
    /* ===================== 1 · a cidade do gigante ===================== */
    {
      nome: 'A cidade do gigante', placa: 'CONTINUAR →', cor: '#7a8aff', chao: 'wood', fog: ['#2a2284', .015],
      caminho: [[0, 6], [0, -10], [-1.4, -20], [0, -27], [-.8, -33.5]], area: [-15, 15, -43, 10], borda: BORDAS.pedras('#24205a', '#0c0a2c'),
      pensa: '(Aquilo atrás das casas não é uma montanha.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#04021a'], [.5, '#140a52'], [.16, '#2e1c9c'], [0, '#6a58e0'], [-.2, '#241a68'], [-1, '#080620']], nuvens: { cor: '#2a1c9c', cor2: '#9a88ff', de: .4, ate: .68, escala: 2.2, torce: 1.6, forca: 1, alt0: -.05, alt1: .95 }, estrelas: 60 }));
        Z.serra(A.longe, { raio: 80, base: -4, alt: 7, pico: 8, cor: '#14103e', bruma: '#3a2c94', freq: 5, seed: 41 });
        A.hemi('#a8a0ff', '#243a34', 1.9); A.sol('#9ab0ff', 1.1, -5, 10, 8);
        A.ponto('#ffb050', 9, 10, -2.5, 2, -8); A.ponto('#ffb050', 9, 10, 2, 2, -24);
        Z.chao(A.g, 90, 96, ['#1c3a30', '#163028', '#24483a', '#2a2a52'], { z: -24, y: -.01 });
        Z.estrada(A.g, [[0, 12], [0, -10], [-1.4, -20], [0, -27], [-.8, -33.5], [-1, -45]], 4.2, Z.pedrinhas('#221c3a', ['#5a5a8a', '#68689a', '#4c4c7a', '#7472a4']), { y: .03 });
        for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
          const z = 3 - i * 5.8 - (s > 0 ? 2 : 0), x = (z < -14 && z > -25 ? -1.2 : 0) + s * (5 + (i % 3) * .6);
          Z.casinha(A.g, x, z, { rotY: -s * Math.PI / 2 + (R() - .5) * .4, w: 3.2 + R(), h: 2 + R() * 1.1, d: 2.9, reboco: '#6a6a96', viga: '#1a1438', telha: '#3a3070', telha2: '#5a4c9a', torta: (R() - .5) * .22 });
          Z.casinha(A.g, x + s * (4.6 + R() * 2), z - 2.6, { rotY: -s * 1.2, w: 3, h: 1.9 + R(), d: 2.6, reboco: '#52527e', viga: '#14102c', telha: '#2c2660', telha2: '#463c86', torta: s * .1 });
        }
        // a torre de pedra
        const tij = Z.tela(64, 64, g => { g.fillStyle = '#2a2850'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? -6 : 0; x < 64; x += 12) { g.fillStyle = R() < .5 ? '#7a78a8' : '#68669a'; g.fillRect(x + 1, y + 1, 10, 6); } }, { nitido: true, rep: [3, 5] });
        const tm = new THREE.MeshLambertMaterial({ map: tij, emissive: new THREE.Color('#14123a') });
        Z.malha(A.g, new THREE.CylinderGeometry(1.7, 2.2, 10.5, 11), tm, -8.4, 5.25, -29);
        Z.malha(A.g, new THREE.CylinderGeometry(2.15, 1.75, 1.2, 11), tm, -8.4, 11, -29);
        for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; Z.malha(A.g, new THREE.BoxGeometry(.6, .8, .6), tm, -8.4 + Math.sin(a) * 1.85, 11.9, -29 + Math.cos(a) * 1.85); }
        for (const y of [3.4, 6.4, 9.4]) { Z.malha(A.g, new THREE.PlaneGeometry(.55, .85), Z.luz('#ffc050'), -8.4 + .85, y, -29 + 1.9 - (y > 8 ? .2 : 0)).rotation.y = .42; Z.brilho(A.g, '#ffa030', 2, -7.3, y, -26.8, .45); }
        A.bloco(-8.4, -29, 2.3);
        gigante(A, 1.5, -61);
        for (let i = 0; i < 8; i++) { const x = (i % 2 ? 2.6 : -2.6) + (i > 2 && i < 5 ? -1.2 : 0), z = 1 - i * 4.4; Z.malha(A.g, new THREE.BoxGeometry(.12, 1.6, .12), Z.solido('#141030'), x, .8, z); Z.malha(A.g, new THREE.OctahedronGeometry(.16, 0), Z.luz('#ffc860'), x, 1.75, z); Z.brilho(A.g, '#ffa838', 1.4, x, 1.75, z, .7); A.bloco(x, z, .12); }
        Z.capim(A.g, 600, i => [(i % 2 ? 1 : -1) * (2.7 + R() * 18), 0, 10 - R() * 60], ['#2a5a46', '#3a3a7a', '#24503c']);
        Z.vagalumes(A.g, 40, [-8, 8, .5, 6, -34, 6], '#9ab0ff', .045, .3);
        Z.relampago(A.longe, { de: Math.PI - 1.4, ate: Math.PI + 1.4, dist: 74, y: 22, alt: 30, cada: 9 });
        A.interage(1, 2, 1, -2.3, 1, -20, 'Olhar pro gigante', () => { E.noiseHit(2, .2, 90); return E.conversa([['VOCÊ', '(Ele não se mexe do lugar. Só os olhos. Eles vêm comigo.)'], ['???', '...a fita... já passou... por aqui...', '#9aa8ff']]); });
        A.moeda(1.2, -9); A.moeda(-2.4, -21); A.moeda(0, -30);
      },
    },
    /* ===================== 2 · o corredor de xadrez ===================== */
    {
      nome: 'O corredor de xadrez', placa: 'CONTINUAR →', cor: '#c88aff', chao: 'wood', fog: ['#10104a', .02],
      caminho: [[0, 5], [0, -48]], area: [-3.5, 3.5, -50, 8],
      pensa: '(Eles estavam olhando pra frente. Estavam.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#02020e'], [.4, '#0a0a3c'], [.05, '#1c1c74'], [-.2, '#0c0c34'], [-1, '#02020c']], estrelas: 1500, espiral: { az: Math.PI, el: .3, raio: .85, cor: '#e8f0ff', cor2: '#4a48d8', bracos: 4, torce: 9 } }));
        A.hemi('#b8b0ff', '#1a1a30', 1.6); A.sol('#d0c8ff', .9, 2, 9, 6);
        A.ponto('#ffd080', 8, 10, 0, 2.2, -14); A.ponto('#ffd080', 8, 10, 0, 2.2, -34);
        const xad = Z.tela(64, 64, g => { for (let i = 0; i < 4; i++) { const x = (i % 2) * 32, y = (i > 1) * 32; g.fillStyle = (i === 0 || i === 3) ? '#c8c4e0' : '#14122a'; g.fillRect(x, y, 32, 32); } Z.manchas(g, 64, 64, 260, ['rgba(60,60,130,.28)', 'rgba(255,255,255,.14)', 'rgba(0,0,0,.22)'], 1, 3); }, { nitido: true, rep: [3, 38] });
        const piso = Z.malha(A.g, new THREE.PlaneGeometry(5, 63), new THREE.MeshLambertMaterial({ map: xad, emissive: new THREE.Color('#0a0a1c') }), 0, 0, -20.5); piso.rotation.x = -Math.PI / 2;
        const parT = Z.tela(64, 64, g => { for (let i = 0; i < 4; i++) { g.fillStyle = (i === 0 || i === 3) ? '#1c3a5a' : '#0c1030'; g.fillRect((i % 2) * 32, (i > 1) * 32, 32, 32); } Z.manchas(g, 64, 64, 200, ['rgba(80,120,220,.25)', 'rgba(0,0,0,.3)'], 1, 3); }, { nitido: true, rep: [34, 1.5] });
        const parM = new THREE.MeshLambertMaterial({ map: parT, emissive: new THREE.Color('#080c24') });
        for (const s of [-1, 1]) { Z.malha(A.g, new THREE.BoxGeometry(.5, 1.5, 63), parM, s * 4, .75, -20.5); Z.malha(A.g, new THREE.BoxGeometry(1.6, .2, 63), Z.solido('#14123a'), s * 3.1, -.12, -20.5); }
        // guardiões de manto com lamparina: viram pra você quando chega perto
        const manto = Z.solido('#4a1c8a', { emissive: new THREE.Color('#14062e') }), dobra = Z.solido('#2e1060', { emissive: new THREE.Color('#0c0420') }), ouro = Z.solido('#c8a040', { emissive: new THREE.Color('#3a2a08') }), vazio = Z.luz('#04020a'), olhoM = Z.luz('#8affe0');
        const guardas = [];
        for (let i = 0; i < 11; i++) for (const s of [-1, 1]) {
          const g = new THREE.Group(); g.position.set(s * 2.75, 0, -1.5 - i * 4.2); g.rotation.y = -s * Math.PI / 2; A.g.add(g);
          Z.malha(g, new THREE.ConeGeometry(.62, 1.9, 9), manto, 0, .95, 0);
          Z.malha(g, new THREE.ConeGeometry(.3, 1.2, 5), dobra, 0, .72, .26);
          Z.malha(g, new THREE.SphereGeometry(.34, 10, 8), manto, 0, 1.95, 0);
          Z.malha(g, new THREE.ConeGeometry(.2, .55, 7), manto, 0, 2.28, -.14).rotation.x = -.7;
          Z.malha(g, new THREE.CircleGeometry(.22, 12), vazio, 0, 1.92, .335);
          const olhos = [-1, 1].map(k => { const o = Z.malha(g, new THREE.PlaneGeometry(.075, .04), olhoM, k * .08, 1.95, .345); o.userData.vivo = true; return o; });
          Z.malha(g, new THREE.TorusGeometry(.34, .035, 5, 14), ouro, 0, 1.66, 0).rotation.x = Math.PI / 2;
          for (const k of [-1, 1]) Z.malha(g, new THREE.CylinderGeometry(.08, .15, .72, 6), manto, k * .24, 1.3, .3).rotation.set(-1.05, 0, k * .45);
          Z.malha(g, new THREE.OctahedronGeometry(.13, 0), Z.luz('#ffd070'), 0, 1.16, .62); const b = Z.brilho(g, '#ffb040', 1.05, 0, 1.16, .64, .7);
          Z.funde(g);
          guardas.push({ g, olhos, b, base: -s * Math.PI / 2, z: g.position.z, fase: i + s });
        }
        for (const q of guardas) A.bloco(q.g.position.x, q.z, .45);
        Z.anima((dt, t) => {
          const j = A.jogador();
          for (const q of guardas) {
            const perto = q.z > j.z - 7 && q.z < j.z + 12;
            const quer = perto ? Math.atan2(j.x - q.g.position.x, j.z - q.z) : q.base;
            q.g.rotation.y += Math.atan2(Math.sin(quer - q.g.rotation.y), Math.cos(quer - q.g.rotation.y)) * Math.min(1, dt * .9);
            for (const o of q.olhos) o.visible = perto;
            q.b.material.opacity = .55 + Math.sin(t * 3 + q.fase) * .18;
          }
        });
        // pedaços de xadrez soltos flutuando no céu
        const solto = Z.copias(A.g, new THREE.BoxGeometry(1.4, .18, 1.4), Z.solido('#8a88c8', { emissive: new THREE.Color('#181844') }), 40, (o, i) => { o.position.set((i % 2 ? 1 : -1) * (7 + R() * 14), -2 + R() * 12, 4 - R() * 62); o.rotation.set(R() * .7, R() * 3, R() * .7); o.scale.setScalar(.4 + R()); return i % 2 ? '#d8d4f0' : '#2a2860'; });
        Z.anima((dt, t) => { solto.position.y = Math.sin(t * .5) * .45; });
        Z.vagalumes(A.g, 60, [-8, 8, .5, 8, -50, 6], '#c8d8ff', .035, .25);
        A.interage(1.2, 2.2, 1.2, 2.5, 1.2, -22.5, 'Guardião de manto', () => { E.sfx.chime(); return E.conversa([['GUARDIÃO', 'Registro mil trezentos e sessenta e sete. Pode passar.', '#c8a0ff'], ['VOCÊ', '(Como é que ele sabe o número da fita?)']]); });
        A.moeda(-1, -10); A.moeda(1, -26); A.moeda(0, -41);
      },
    },
    /* ===================== 3 · o milharal da lua cheia ===================== */
    {
      nome: 'O milharal da lua cheia', placa: 'CONTINUAR →', cor: '#ffb04a', chao: 'grass', fog: ['#14267a', .022],
      caminho: [[0, 6], [0, -8], [4.5, -16], [4.5, -24], [-3, -32], [-3, -40], [0, -46]], area: [-14, 14, -49, 9], borda: BORDAS.mata('#12303a', 4),
      pensa: '(Milho mais alto que eu. E a lua do tamanho de um prato.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#06103a'], [.45, '#0e2488'], [.1, '#2048c0'], [-.05, '#3a62c8'], [-1, '#0a1030']], nuvens: { cor: '#1a2a80', cor2: '#7a98e8', de: .55, ate: .8, escala: 2.4, torce: .8, forca: .75, alt0: .05, alt1: .7 }, estrelas: 420 }));
        Z.lua(A.longe, { az: Math.PI - .12, el: .34, tam: 11, cor: '#f4f4ff', sombra: '#8a9ac8', halo: '#9ab8ff' });
        Z.serra(A.longe, { raio: 78, base: -4, alt: 6, pico: 5, cor: '#0a1440', bruma: '#2a48a8', freq: 5, seed: 51 });
        A.hemi('#b0c8ff', '#4a3a1a', 1.9); A.sol('#d8e4ff', 1.2, -2, 10, -14);
        A.ponto('#ff7030', 9, 10, 4, 1.6, -20); A.ponto('#ff7030', 9, 10, -3, 1.6, -36);
        Z.chao(A.g, 70, 90, ['#4a3420', '#3c2a1a', '#5a4228', '#33422a'], { z: -20, y: -.01 });
        Z.estrada(A.g, [[0, 12], [0, -8], [4.5, -16], [4.5, -24], [-3, -32], [-3, -40], [0, -46], [0, -52]], 3, Z.pedrinhas('#3a2416', ['#6a4a2c', '#7a5634', '#5c3e24', '#866040']), { y: .03 });
        const cam = this.caminho;
        const dist = (x, z) => { let m = 99; for (let i = 0; i < cam.length - 1; i++) { const [ax, az] = cam[i], [bx, bz] = cam[i + 1], dx = bx - ax, dz = bz - az, k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); m = Math.min(m, Math.hypot(x - ax - dx * k, z - az - dz * k)); } return m; };
        // pés de milho: duas folhas cruzadas por pé, tudo numa chamada só
        const milhoT = Z.tela(64, 128, g => {
          g.strokeStyle = '#5a7a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(32, 128); g.lineTo(32, 16); g.stroke();
          for (let i = 0; i < 9; i++) { const y = 112 - i * 11, s = i % 2 ? 1 : -1; g.fillStyle = ['#3a6a24', '#4e8a2e', '#6a8a2a', '#2e5a28'][i % 4]; g.beginPath(); g.moveTo(32, y); g.quadraticCurveTo(32 + s * 26, y - 22, 32 + s * 31, y + 8); g.quadraticCurveTo(32 + s * 18, y - 9, 32, y + 7); g.fill(); }
          g.fillStyle = '#e8b83a'; g.beginPath(); g.ellipse(40, 66, 5, 14, .35, 0, 7); g.fill(); g.fillStyle = '#6a9a30'; g.beginPath(); g.moveTo(34, 80); g.lineTo(38, 58); g.lineTo(45, 76); g.fill();
          g.strokeStyle = '#c89a4a'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(32, 18); g.lineTo(32 + k * 8, 2 + Math.abs(k) * 3); g.stroke(); }
        }, { nitido: true });
        const milhoM = new THREE.MeshLambertMaterial({ map: milhoT, alphaTest: .5, side: THREE.DoubleSide, emissive: new THREE.Color('#0c1a14') });
        const pes = [];
        for (let x = -19; x <= 20; x += 1.15) for (let z = 11; z >= -52; z -= 1.15) { const px = x + (R() - .5) * .8, pz = z + (R() - .5) * .8, d = dist(px, pz); if (d > 2.15 && d < 9.5) pes.push([px, pz, 2.1 + R() * 1.1, R() * 3.14]); }
        const plano = new THREE.PlaneGeometry(.9, 1); plano.translate(0, .5, 0);
        for (const giro of [0, Math.PI / 2]) Z.copias(A.g, plano, milhoM, pes.length, (o, i) => { const [x, z, h, a] = pes[i]; o.position.set(x, 0, z); o.rotation.y = a + giro; o.scale.set(h * .52, h, 1); });
        // abóboras acesas na beira do caminho
        const abo = Z.solido('#e86a1a', { emissive: new THREE.Color('#5a1a04') });
        for (let i = 0; i < 16; i++) { const k = (i + .5) / 16 * (cam.length - 1), j = Math.floor(k), f = k - j, [ax, az] = cam[j], [bx, bz] = cam[j + 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz), s = i % 2 ? 1 : -1, x = ax + dx * f - dz / l * s * 1.85, z = az + dz * f + dx / l * s * 1.85; Z.malha(A.g, new THREE.SphereGeometry(.28, 9, 6), abo, x, .22, z).scale.y = .78; for (const e of [-1, 1]) Z.malha(A.g, new THREE.CircleGeometry(.06, 3), Z.luz('#fff0a0'), x + e * .09, .28, z + .275); Z.malha(A.g, new THREE.PlaneGeometry(.22, .06), Z.luz('#fff0a0'), x, .16, z + .28); Z.brilho(A.g, '#ff7a18', 1.5, x, .35, z, .5); }
        Z.vagalumes(A.g, 70, [-8, 9, .4, 3.4, -48, 6], '#ffd060', .035);
        // o espantalho: só anda quando você não está olhando
        const esp = new THREE.Group(); A.g.add(esp);
        { const palha = Z.solido('#c8a04a', { emissive: new THREE.Color('#2a1e08') }), saco = Z.solido('#a8825a', { emissive: new THREE.Color('#221608') }), roupa = Z.solido('#5a2a3a', { emissive: new THREE.Color('#18080e') }), pau = Z.solido('#2a1a10'), preto = Z.luz('#100804');
          Z.malha(esp, new THREE.BoxGeometry(.1, 1.5, .1), pau, 0, .75, 0); Z.malha(esp, new THREE.BoxGeometry(1.5, .1, .1), pau, 0, 1.55, 0);
          Z.malha(esp, new THREE.ConeGeometry(.46, 1, 7), roupa, 0, 1.2, 0); Z.malha(esp, new THREE.SphereGeometry(.27, 9, 7), saco, 0, 1.95, 0);
          Z.malha(esp, new THREE.CylinderGeometry(.55, .55, .05, 12), palha, 0, 2.17, 0); Z.malha(esp, new THREE.ConeGeometry(.28, .42, 9), palha, 0, 2.4, 0);
          for (const s of [-1, 1]) { Z.malha(esp, new THREE.TorusGeometry(.055, .018, 4, 8), preto, s * .1, 1.99, .262); Z.malha(esp, new THREE.ConeGeometry(.1, .35, 5), palha, s * .78, 1.52, 0).rotation.z = s * 1.57; }
          for (let k = -2; k <= 2; k++) Z.malha(esp, new THREE.BoxGeometry(.02, .09, .01), preto, k * .055, 1.84, .27).rotation.z = k * .2;
        }
        const POUSOS = [[2.4, -11], [6.4, -20], [2.2, -28.6], [-5, -36], [-1.7, -43]];
        let onde = 0; const pousa = () => { const [x, z] = POUSOS[onde]; esp.position.set(x, 0, z); esp.rotation.y = Math.atan2(-x * .2, 1); };
        pousa();
        const olho = new V3();
        Z.anima(() => {
          const j = A.jogador();
          const olhando = E.looking(olho.set(esp.position.x + A.ox, 1.7, esp.position.z), .6);
          if (olhando) return;
          if (onde < POUSOS.length - 1 && j.z < POUSOS[onde][1] - 2.5) { onde++; pousa(); E.noiseHit(.35, .07, 1800, null, 'bandpass'); A.fala('esp', () => E.later(1.4, () => E.say('(O espantalho estava lá atrás. Agora está na frente.)', 4))); }
          else if (!olhando) esp.rotation.y = Math.atan2(j.x - esp.position.x, j.z - esp.position.z);
        });
        A.interage(2.2, 1.6, 1.4, 0, 1, -45, 'Procurar o espantalho', () => E.conversa([['VOCÊ', '(É só palha e pano. Palha e pano não andam. Né?)']]));
        A.moeda(0, -7); A.moeda(4.5, -22); A.moeda(-3, -38);
      },
    },
    /* ===================== 4 · a ponte das lanternas ===================== */
    {
      nome: 'A ponte das estrelas', placa: 'CONTINUAR →', cor: '#6ab8ff', chao: 'wood', fog: ['#0c1a5a', .013],
      caminho: [[0, 6], [0, -22], [0, -42]], area: [-2.15, 2.15, -46, 10],
      pensa: '(Todas as janelas do castelo estão acesas.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#02041a'], [.5, '#06104a'], [.15, '#0e2a82'], [0, '#1c5a94'], [-.2, '#0a1848'], [-1, '#02040e']], nuvens: { cor: '#127a7a', cor2: '#3ae0a8', de: .56, ate: .82, escala: 1.8, torce: 1.8, forca: .6, alt0: .08, alt1: .62 }, estrelas: 1700, espiral: { az: Math.PI, el: .42, raio: .75, cor: '#bff0ff', cor2: '#2a62e0', bracos: 2, torce: 11 } }));
        Z.serra(A.longe, { raio: 76, base: -18, alt: 16, pico: 10, cor: '#06102e', bruma: '#123468', freq: 5, seed: 61 });
        A.hemi('#a8d0ff', '#0c2430', 1.8); A.sol('#a8c8ff', 1, -4, 12, 6);
        A.ponto('#50a0ff', 12, 13, 0, 2.2, -10); A.ponto('#50a0ff', 12, 13, 0, 2.2, -30);
        const lajes = Z.rachado('#1c2a62', '#7ab8ff', 26);
        Z.estrada(A.g, [[0, 12], [0, -47]], 4.6, lajes, { y: .02, brilha: true });
        const mur = new THREE.MeshLambertMaterial({ map: Z.pedrinhas('#121438', ['#4a5288', '#5a6298', '#3c4478']), emissive: new THREE.Color('#0a0e2c') });
        mur.map.wrapS = mur.map.wrapT = THREE.RepeatWrapping; mur.map.repeat.set(1, 1);
        Z.copias(A.g, new THREE.BoxGeometry(.5, .72, 1.3), Z.solido('#464e86', { emissive: new THREE.Color('#0c1030') }), 80, (o, i) => { const s = i % 2 ? 1 : -1; o.position.set(s * 2.45, .36, 11 - Math.floor(i / 2) * 1.46); });
        for (const s of [-1, 1]) Z.malha(A.g, new THREE.BoxGeometry(.62, .16, 59), Z.solido('#6a74ac', { emissive: new THREE.Color('#141a40') }), s * 2.45, .8, -17.5);
        Z.malha(A.g, new THREE.BoxGeometry(5.4, 2, 59), mur, 0, -1.03, -17.5);
        for (let i = 0; i < 6; i++) Z.malha(A.g, new THREE.BoxGeometry(4.4, 12, 1.8), mur, 0, -8, 6 - i * 10);
        for (let i = 0; i < 12; i++) { const z = 2 - i * 4; for (const s of [-1, 1]) { Z.malha(A.g, new THREE.CylinderGeometry(.04, .06, 1.2, 5), Z.solido('#101434'), s * 2.45, 1.4, z); Z.malha(A.g, new THREE.BoxGeometry(.26, .32, .26), Z.luz('#9adcff'), s * 2.45, 2.12, z); Z.malha(A.g, new THREE.ConeGeometry(.24, .2, 4), Z.solido('#101434'), s * 2.45, 2.38, z).rotation.y = Math.PI / 4; Z.brilho(A.g, '#4a9aff', 1.7, s * 2.45, 2.12, z, .65); } }
        Z.chao(A.g, 130, 130, ['#06122e', '#081838', '#0a1e30'], { z: -25, y: -12 });
        Z.pinheiros(A.g, 420, i => { const s = i % 2 ? 1 : -1; return [s * (6 + R() * 34), -12 + R() * 1.4, 14 - R() * 84]; }, '#0c2a3e', 5);
        Z.castelo(A.g, { x: 0, y: 1.6, z: -66, s: 1.35, pedra: '#12205a', pedra2: '#1e307a', telhado: '#080e30', janela: '#ffe060' });
        Z.brilho(A.g, '#4a78ff', 40, 0, 13, -74, .3);
        Z.voa(Z.dragao(A.g, { s: .85, cor: '#183a7a', barriga: '#58a8e0', asa: '#1c2a6a', olho: '#ffe060' }), { cx: 0, cz: -64, y: 24, r: 15, vel: .18 });
        // estrelas cadentes
        for (let k = 0; k < 3; k++) { const s = [0, 1, 2, 3, 4].map(i => Z.brilho(A.longe, '#cfe8ff', 1.5 - i * .22, 0, -99, 0, 0)); let prox = 2 + k * 3.5, t0 = 9, a = 0, y = 0;
          Z.anima(dt => { prox -= dt; if (prox <= 0) { prox = 6 + R() * 8; t0 = 0; a = Math.PI + (R() - .5) * 2.2; y = 28 + R() * 20; } t0 += dt; s.forEach((m, i) => { const u = t0 - i * .035; if (u < 0 || u > 1.1) { m.material.opacity = 0; return; } m.position.set(Math.sin(a + u * .3) * 62, y - u * 17, Math.cos(a + u * .3) * 62); m.material.opacity = (1 - u / 1.1) * (1 - i * .17); }); });
        }
        Z.vagalumes(A.g, 90, [-9, 9, -1, 7, -44, 8], '#a8e8ff', .035, .3);
        A.interage(3.4, 1.6, 1, 0, 1, -22, 'Olhar pro céu', () => E.conversa([['VOCÊ', '(O céu está girando bem devagar. Se eu ficar olhando, esqueço pra onde eu ia.)']]));
        A.moeda(-1.1, -9); A.moeda(1.1, -25); A.moeda(0, -38);
      },
    },
  ];

  const tr = trilho(E, L, Z, trechos, 'reino');
  L.ambience = bus => { E.loopNoise('bandpass', 3200, 6, .008, bus); E.loopNoise('lowpass', 180, 0, .04, bus); };
  L.enter = () => L.anuncia();
  L.update = dt => tr.passo(dt);
  L.idle = () => tr.idle();
  L.exit = () => Z.soltar();
  L.hint = tr.dica;
  L.debug = { tr };
}
