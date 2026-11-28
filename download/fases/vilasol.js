// SONHO 1 · A vila do sol que dorme. Depois das salas amarelas, a porta do arco-íris não dá em sala nenhuma:
// uma vila de conto de fadas debaixo de um sol com cara, a mata dos cogumelos acesos e a estrada de água acesa.
import { kit, trilho, BORDAS } from './mundo.js';

export function build(E, L) {
  const { THREE } = E;
  E.seed(2101);
  E.camera.far = 90;
  L.speed = 2.5; L.eye = 1.6; L.reach = 2.4;
  L.clock = t => Math.floor(t * 1.1) % 7 === 0 ? '--:--' : '06:67';
  const Z = kit(E, L), R = Z.R;
  const AM = '#ffd27a';

  /* ---------- o sol que dorme (desenho do jogo: cara redonda, bochechas, raios que giram) ---------- */
  function sol(longe, az, el, dist, tam) {
    const cara = aberto => Z.tela(256, 256, g => {
      const f = g.createRadialGradient(104, 96, 16, 128, 128, 124); f.addColorStop(0, '#ffd45a'); f.addColorStop(.55, '#f08a22'); f.addColorStop(1, '#b4361a');
      g.fillStyle = f; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill();
      Z.manchas(g, 256, 256, 0, ['#000']);
      for (let i = 0; i < 900; i++) { const a = R() * 7, r = Math.sqrt(R()) * 119; g.fillStyle = R() < .5 ? 'rgba(120,20,0,.2)' : 'rgba(255,230,140,.16)'; g.fillRect(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 3, 3); }
      g.lineCap = 'round';
      for (const s of [-1, 1]) {
        const x = 128 + s * 44;
        g.strokeStyle = '#7a1c0c'; g.lineWidth = 7; g.beginPath(); g.arc(x, 112, 31, Math.PI * 1.17, Math.PI * 1.83); g.stroke();
        if (aberto) { g.fillStyle = '#fff2c8'; g.beginPath(); g.ellipse(x, 108, 22, 13, 0, 0, 7); g.fill(); g.fillStyle = '#4a1206'; g.beginPath(); g.arc(x, 112, 8, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(x - 5, 107, 4, 4); g.fillStyle = '#c8541c'; g.fillRect(x - 25, 90, 50, 12); }
        else { g.lineWidth = 6; g.beginPath(); g.arc(x, 96, 25, Math.PI * .2, Math.PI * .8); g.stroke(); for (let k = -2; k <= 2; k++) { g.lineWidth = 3; g.beginPath(); g.moveTo(x + k * 9, 119 - Math.abs(k) * 3); g.lineTo(x + k * 12, 129 - Math.abs(k) * 3); g.stroke(); } }
        g.fillStyle = 'rgba(200,30,40,.32)'; g.beginPath(); g.ellipse(128 + s * 66, 152, 22, 15, 0, 0, 7); g.fill();
      }
      g.strokeStyle = '#8a2410'; g.lineWidth = 6; g.beginPath(); g.moveTo(130, 106); g.quadraticCurveTo(112, 156, 134, 156); g.stroke();
      g.fillStyle = '#9a1c18'; g.beginPath(); g.moveTo(94, 188); g.quadraticCurveTo(128, 172, 162, 188); g.quadraticCurveTo(128, aberto ? 216 : 202, 94, 188); g.fill();
      g.strokeStyle = '#5a0c08'; g.lineWidth = 3; g.beginPath(); g.moveTo(94, 188); g.quadraticCurveTo(128, 192, 162, 188); g.stroke();
    });
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const g = new THREE.Group(); g.position.copy(dir).multiplyScalar(dist); longe.add(g); g.lookAt(0, 0, 0);
    Z.brilho(g, '#ff9a2a', tam * 2.4, 0, 0, -.6, .6);
    const raios = new THREE.Group(); g.add(raios);
    const tri = (w, h) => { const s = new THREE.Shape([new THREE.Vector2(-w, 0), new THREE.Vector2(w, 0), new THREE.Vector2(w * .12, h)]); return new THREE.ShapeGeometry(s); };
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, m = Z.malha(raios, tri(tam * .07, tam * (i % 2 ? .22 : .34)), Z.luz({ color: i % 2 ? '#ff7a1a' : '#ffc83a', side: THREE.DoubleSide }), Math.sin(-a) * tam * .5, Math.cos(a) * tam * .5, -.2); m.rotation.z = a; }
    const fechado = cara(false), aberto = cara(true);
    const disco = Z.malha(g, new THREE.CircleGeometry(tam / 2, 40), Z.luz({ map: fechado }));
    const o = { acordado: false, abre(v) { if (v !== o.acordado) { o.acordado = v; disco.material.map = v ? aberto : fechado; } } };
    Z.anima((dt, t) => { raios.rotation.z = t * .05; const k = 1 + Math.sin(t * .8) * .018; disco.scale.set(k, k, 1); });
    return o;
  }

  const trechos = [
    /* ===================== 1 · a rua da vila ===================== */
    {
      nome: 'A vila do sol que dorme', placa: 'PRA MATA →', cor: '#ffc04a', chao: 'wood', fog: ['#5a74c8', .014],
      caminho: [[0, 6], [0, -8], [1.6, -18], [-.6, -28], [0, -38]], area: [-14, 14, -45, 10], borda: BORDAS.mata('#17483a', 4.6),
      pensa: '(Isso não é uma sala. Isso é... o lado de fora?)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#0c1650'], [.5, '#1c3694'], [.16, '#3a66d0'], [0, '#a8c4ff'], [-.2, '#4a5aa8'], [-1, '#1a2048']], nuvens: { cor: '#4a3a86', cor2: '#d8b8f8', de: .5, ate: .72, escala: 2.4, torce: .7, forca: .9, alt0: .02, alt1: .8 }, estrelas: 90, clarao: [{ az: Math.PI, el: .35, raio: .8, cor: '#ffb868', forca: .7 }] }));
        const S0 = sol(A.longe, Math.PI + .06, .36, 70, 24);
        Z.serra(A.longe, { raio: 76, base: -4, alt: 8, pico: 9, cor: '#2a4a7a', bruma: '#8aa8e8', freq: 4, seed: 11 });
        A.hemi('#cfd8ff', '#4a5a3a', 2); A.sol('#ffc890', 1.5, 4, 9, -12);
        Z.chao(A.g, 70, 90, ['#2c6a3a', '#245a32', '#3a7c42', '#4a8a4a'], { z: -22, y: -.01 });
        Z.estrada(A.g, [[0, 12], [0, -8], [1.6, -18], [-.6, -28], [0, -44]], 4.4, Z.pedrinhas('#3c3442', ['#9a8a8a', '#8a7a86', '#aa9a90', '#7c6c7e']), { y: .03 });
        const rebocos = ['#d8c49a', '#c8a888', '#b8b0c8', '#d0b8a0'], telhados = [['#1e6a62', '#2e9288'], ['#8a3a2a', '#b8503a'], ['#3a4a8a', '#5266b0'], ['#2a6a4a', '#3e9266']];
        for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
          const z = 4 - i * 6.4 - (s > 0 ? 2.4 : 0), x = (z < -12 && z > -22 ? 1.4 : 0) + s * (5.2 + (i % 2) * .7 + (s > 0 && Math.abs(z + 18) < 4 ? 3 : 0)), k = (i * 2 + (s > 0 ? 1 : 0)) % 4;
          Z.casinha(A.g, x, z, { rotY: -s * Math.PI / 2 + (R() - .5) * .3, w: 3.4 + R() * 1.2, h: 2.4 + R() * 1.1, d: 3, reboco: rebocos[k], viga: '#3a1e14', telha: telhados[k][0], telha2: telhados[k][1], torta: (R() - .5) * .16 });
          if (i % 3 === 1) Z.casinha(A.g, x + s * 4.6, z - 3, { rotY: -s * 1.1, w: 3, h: 4.2, d: 2.8, reboco: rebocos[(k + 1) % 4], viga: '#3a1e14', telha: telhados[(k + 2) % 4][0], telha2: telhados[(k + 2) % 4][1], torta: s * .1 });
        }
        // lampiões, moitas e flores
        for (let i = 0; i < 6; i++) { const z = -1 - i * 6.6, x = (i % 2 ? 2.7 : -2.7); Z.malha(A.g, new THREE.CylinderGeometry(.05, .08, 2.3, 6), Z.solido('#2a1c18'), x, 1.15, z); Z.malha(A.g, new THREE.OctahedronGeometry(.2, 0), Z.luz('#ffe080'), x, 2.45, z); Z.brilho(A.g, '#ffb040', 1.8, x, 2.45, z, .7); A.bloco(x, z, .15); }
        Z.copias(A.g, Z.rocha(.55, .3, 1), Z.solido('#2f7a42', { emissive: new THREE.Color('#0c2412') }), 90, (o, i) => { const s = i % 2 ? 1 : -1; o.position.set(s * (3 + R() * 1), .25, 8 - R() * 52); o.scale.set(.6 + R() * .7, .5 + R() * .6, .6 + R() * .7); });
        Z.flores(A.g, 260, i => [(i % 2 ? 1 : -1) * (2.5 + R() * 1.6), .08 + R() * .2, 8 - R() * 52], ['#ff8ab0', '#ffe070', '#9ab8ff', '#ffffff'], .08);
        Z.capim(A.g, 500, i => [(i % 2 ? 1 : -1) * (2.4 + R() * 14), 0, 10 - R() * 56], ['#3a8a4a', '#58a858', '#2e7a52']);
        Z.pinheiros(A.g, 60, i => [(i % 2 ? 1 : -1) * (14 + R() * 16), 0, 8 - R() * 70], '#184a3a', 4);
        // fumaça das chaminés virando nuvenzinha
        for (let c = 0; c < 4; c++) { const bx = (c % 2 ? 6 : -6), bz = -6 - c * 8, ps = [0, 1, 2, 3].map(() => Z.brilho(A.g, '#e8e0ff', 1, bx, 5, bz, .3)); Z.anima((dt, t) => ps.forEach((m, i) => { const k = (t * .16 + i / 4) % 1; m.position.set(bx + Math.sin(k * 4 + c) * .6, 4.6 + k * 4.5, bz); m.scale.setScalar(.6 + k * 2); m.material.opacity = .34 * (1 - k); })); }
        Z.vagalumes(A.g, 40, [-6, 6, .5, 4, -38, 6], '#fff0a0', .035);
        // o poço
        const pm = Z.solido('#6a6a86');
        Z.malha(A.g, new THREE.CylinderGeometry(.8, .9, .8, 10, 1, true), pm, 4.4, .4, -18).material.side = THREE.DoubleSide;
        Z.malha(A.g, new THREE.CircleGeometry(.76, 12), Z.luz('#3a8ac8'), 4.4, .55, -18).rotation.x = -Math.PI / 2;
        for (const s of [-1, 1]) Z.malha(A.g, new THREE.BoxGeometry(.1, 1.7, .1), Z.solido('#3a2418'), 4.4 + s * .75, .9, -18);
        Z.malha(A.g, new THREE.ConeGeometry(1.15, .8, 4), Z.solido('#8a3a2a'), 4.4, 2.1, -18).rotation.y = Math.PI / 4;
        A.bloco(4.4, -18, .95);
        A.interage(1.8, 1.8, 1.8, 4.4, .9, -18, 'Olhar no poço', () => E.conversa([['VOCÊ', '(No fundo do poço tem um céu. Com outro sol. Dormindo também.)']]));
        // placa
        const placaT = Z.tela(128, 64, g => { g.fillStyle = '#e8d4a0'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#5a2a12'; g.textAlign = 'center'; g.font = 'bold 17px monospace'; g.fillText('SILÊNCIO', 64, 25); g.font = 'bold 11px monospace'; g.fillText('o sol está', 64, 43); g.fillText('dormindo', 64, 55); });
        Z.malha(A.g, new THREE.BoxGeometry(.12, 1.4, .12), Z.solido('#3a2418'), -2.55, .7, -4);
        Z.malha(A.g, new THREE.PlaneGeometry(1.25, .62), Z.luz({ map: placaT, side: THREE.DoubleSide }), -2.5, 1.5, -4).rotation.y = .35;
        A.bloco(-2.55, -4, .2);
        A.interage(1.2, .8, .4, -2.5, 1.5, -4, 'Placa', () => E.conversa([['PLACA', '“Silêncio. O sol está dormindo. Quem acordar o sol, faz o dia.”']]));
        // chegando perto do fim da rua, o sol abre os olhos
        Z.anima(() => { const j = A.jogador(), perto = j.z < -27; S0.abre(perto); if (perto) A.fala('sol', () => { E.tone(110, 2.2, .05, 'sine', null, 0, 0, 220); E.say('(Ele abriu os olhos. Devagarinho. E está olhando pra você.)', 4.5); }); });
        A.moeda(-1.4, -10); A.moeda(3.6, -19.4); A.moeda(1, -31);
      },
    },
    /* ===================== 2 · a mata dos cogumelos acesos ===================== */
    {
      nome: 'A mata dos cogumelos acesos', placa: 'CONTINUAR →', cor: '#6ac8ff', chao: 'grass', fog: ['#30228a', .023],
      caminho: [[0, 6], [-.5, -6], [-4, -14], [-2, -22], [3.5, -29], [2, -38], [0, -44]], area: [-14, 14, -49, 10], borda: BORDAS.mata('#151a44', 5.4),
      pensa: '(Anoiteceu num passo só.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#080428'], [.45, '#1c0e6a'], [.12, '#3a1cb0'], [-.05, '#5a34c8'], [-1, '#0c0830']], nuvens: { cor: '#2a14b8', cor2: '#a478ff', de: .42, ate: .7, escala: 3, torce: 1.5, forca: 1, alt0: -.02, alt1: .95 }, estrelas: 220 }));
        Z.relampago(A.longe, { de: Math.PI - .9, ate: Math.PI + .9, dist: 70, y: 20, alt: 30, cada: 8 });
        Z.serra(A.longe, { raio: 72, base: -4, alt: 12, pico: 10, cor: '#0e0a34', bruma: '#2a1c78', freq: 6, seed: 23 });
        A.hemi('#baa8ff', '#2a5a34', 2.5); A.sol('#a8d0ff', 1.3, -6, 10, -4);
        A.ponto('#ffa040', 10, 11, -3, 2.2, -12); A.ponto('#50a0ff', 12, 13, 2.5, 2.4, -32);
        Z.chao(A.g, 76, 90, ['#12321e', '#0e2a1a', '#1c4426', '#241e4a'], { z: -20, y: -.01 });
        Z.estrada(A.g, [[0, 12], [0, 6], [-.5, -6], [-4, -14], [-2, -22], [3.5, -29], [2, -38], [0, -48]], 2.9, Z.pedrinhas('#2a1a14', ['#4a3424', '#5a4030', '#3e2c20', '#62483a']), { y: .035 });
        const noCaminho = (x, z, folga) => { const c = this.caminho; for (let i = 0; i < c.length - 1; i++) { const [ax, az] = c[i], [bx, bz] = c[i + 1], dx = bx - ax, dz = bz - az, k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); if (Math.hypot(x - ax - dx * k, z - az - dz * k) < folga) return true; } return Math.hypot(x + 6.6, z + 15) < folga + .8; };
        const solto = (folga, larg = 17) => { for (let n = 0; n < 40; n++) { const x = (R() - .5) * larg * 2, z = 12 - R() * 62; if (!noCaminho(x, z, folga)) return [x, z]; } return [20, 0]; };
        // brasinhas alaranjadas no chão do caminho
        for (let i = 0; i < 34; i++) { const k = i / 34 * (this.caminho.length - 1), j = Math.floor(k), f = k - j, [ax, az] = this.caminho[j], [bx, bz] = this.caminho[j + 1], x = ax + (bx - ax) * f + (R() - .5) * 2.2, z = az + (bz - az) * f; const q = Z.malha(A.g, new THREE.CircleGeometry(.13 + R() * .1, 6), Z.luz({ color: R() < .3 ? '#ffe060' : '#ff8a1a', fog: true }), x, .055, z); q.rotation.x = -Math.PI / 2; if (i % 3 === 0) Z.brilho(A.g, '#ff7a10', .7, x, .2, z, .4); }
        const flor = [...Array(60)].map(() => solto(2.2, 9));
        Z.flores(A.g, 800, i => { const [x, z] = flor[i % 60], a = x + (R() - .5) * 1.5, b = z + (R() - .5) * 1.5; return noCaminho(a, b, 1.9) ? [a, -1, b] : [a, .06 + R() * .4, b]; }, ['#4a8aff', '#8ac8ff', '#c8e8ff', '#7a5aff', '#4affd0'], .1);
        for (let i = 0; i < 14; i++) { const [x, z] = flor[i]; Z.brilho(A.g, '#4a8aff', 2.2, x, .3, z, .22); }
        Z.capim(A.g, 700, () => { const [x, z] = solto(2, 20); return [x, 0, z]; }, ['#1c5a30', '#2a7a40', '#1c4a52']);
        // cogumelos de chapéu pintado, grandes e pequenos
        const cores = ['#241a3e', '#3a2250', '#5a2a20', '#1a2a52'];
        for (let i = 0; i < 34; i++) { const [x, z] = solto(3.4, 15); Z.cogumelo(A.g, x, z, .9 + R() * 1.7, cores[i % 4], '#d8e8ff'); }
        for (let i = 0; i < 30; i++) { const [x, z] = solto(2.3, 8); Z.cogumelo(A.g, x, z, .18 + R() * .35, i % 2 ? '#c82a2a' : '#8a3ac8'); }
        const tronco = Z.solido('#2a1a24', { emissive: new THREE.Color('#10081a') });
        for (let i = 0; i < 24; i++) { const [x, z] = solto(4.2, 18); Z.galhada(A.g, x, z, 1.2 + R() * 1.1, tronco); }
        // as casinhas tortas
        for (const [x, z, r, h] of [[5.4, -9, -1.2, 2.2], [-9.6, -25, 1.1, 3], [8.6, -21, -.9, 2.6], [-6.4, -37, .7, 2.3], [8.2, -40, -1.5, 3.1]]) Z.casinha(A.g, x, z, { rotY: r, w: 2.6, h, d: 2.4, reboco: '#6a4a3a', viga: '#24120c', telha: '#2a2250', telha2: '#443a7a', torta: (R() - .5) * .3 });
        // a árvore que dorme (cara no tronco)
        const arvM = Z.solido('#4a2e20', { emissive: new THREE.Color('#150a08') });
        const arv = new THREE.Group(); arv.position.set(-9.4, 0, -15); arv.rotation.y = Math.PI / 2; A.g.add(arv);
        Z.malha(arv, new THREE.CylinderGeometry(1.1, 1.7, 5.2, 9), arvM, 0, 2.6, 0);
        for (const s of [-1, 1]) { const o = Z.malha(arv, new THREE.TorusGeometry(.3, .07, 5, 10, Math.PI), Z.solido('#1a0c06'), s * .45, 2.5, 1.38); o.rotation.z = Math.PI; Z.malha(arv, new THREE.BoxGeometry(.75, .16, .2), arvM, s * .48, 2.86, 1.36).rotation.z = -s * .18; }
        Z.malha(arv, new THREE.ConeGeometry(.26, .8, 6), arvM, 0, 2.1, 1.55).rotation.x = Math.PI / 2;
        const boca = Z.malha(arv, new THREE.CircleGeometry(.28, 10), Z.solido('#120604'), 0, 1.32, 1.52); boca.rotation.x = -.1;
        Z.copias(arv, Z.rocha(1.5, .3, 1), Z.solido('#1c4a3a', { emissive: new THREE.Color('#081c18') }), 9, (o, i) => { const a = i * 2.4; o.position.set(Math.sin(a) * (1 + (i % 3)), 5.4 + (i % 3) * .7, Math.cos(a) * 1.6 - .4); o.scale.setScalar(.7 + (i % 3) * .2); });
        Z.anima((dt, t) => { const k = .5 + .5 * Math.sin(t * 1.15); boca.scale.set(1 - k * .25, .35 + k * .7, 1); });
        A.bloco(-9.4, -15, 1.7);
        A.interage(2, 2.6, 1.2, -7.9, 1.8, -15, 'Árvore', () => { E.noiseHit(1.4, .08, 260); return E.conversa([['ÁRVORE', 'Rrrrr... zzz... não... o assobio não...', '#c8a878'], ['VOCÊ', '(Ela está sonhando. E não parece um sonho bom.)']]); });
        Z.vagalumes(A.g, 90, [-9, 9, .3, 4, -44, 8], '#ffd860', .04);
        A.moeda(-3.6, -13); A.moeda(-6.8, -16.2); A.moeda(3.2, -30);
      },
    },
    /* ===================== 3 · a estrada de água acesa ===================== */
    {
      nome: 'A estrada de água acesa', placa: 'SEGUIR →', cor: '#5affe0', chao: 'wood', fog: ['#2a147a', .016],
      caminho: [[0, 6], [0, -20], [0, -46]], area: [-4.2, 4.2, -49, 9],
      pensa: '(Lá no fundo tem uma fortaleza. E coisas voando em volta dela.)',
      monta(A) {
        A.longe.add(Z.ceu({ grad: [[1, '#060220'], [.5, '#1a0860'], [.16, '#4416b8'], [.02, '#8a48e8'], [-.12, '#2a1478'], [-1, '#080420']], nuvens: { cor: '#240c90', cor2: '#b080ff', de: .4, ate: .68, escala: 2.7, torce: 1.9, forca: 1, alt0: -.03, alt1: .96 }, estrelas: 120, clarao: [{ az: Math.PI, el: .16, raio: .6, cor: '#f0e0ff', forca: .85 }] }));
        Z.relampago(A.longe, { de: Math.PI - .35, ate: Math.PI + .35, dist: 68, y: 21, alt: 32, cada: 5, cor: '#e8d8ff' });
        Z.serra(A.longe, { raio: 74, base: -16, alt: 18, pico: 16, cor: '#12063a', bruma: '#4a20a0', freq: 7, seed: 31, ponta: 2 });
        A.hemi('#a890ff', '#10403a', 1.7); A.sol('#d0b0ff', .9, 2, 12, -20);
        A.ponto('#40ffe0', 14, 16, 0, 1.6, -8); A.ponto('#40ffe0', 14, 16, 0, 1.6, -30);
        const agua = Z.rachado('#042a34', '#62ffe8', 17); agua.repeat.set(1, 1);
        Z.estrada(A.g, [[0, 12], [0, -20], [0, -52]], 8.8, agua, { y: .02, brilha: true });
        Z.anima(dt => { agua.offset.y -= dt * .16; agua.offset.x = Math.sin(performance.now() / 2600) * .03; });
        // as beiradas de pedra e o abismo
        const pedra = Z.solido('#241a52', { emissive: new THREE.Color('#0e0830') });
        Z.copias(A.g, Z.rocha(.7, .45, 0), pedra, 160, (o, i) => { const s = i % 2 ? 1 : -1; o.position.set(s * (4.9 + R() * .6), .05, 12 - (i / 160) * 66); o.rotation.set(R() * 3, R() * 3, 0); o.scale.set(.7 + R() * .6, .4 + R() * .7, .7 + R() * .9); });
        for (const s of [-1, 1]) Z.malha(A.g, new THREE.BoxGeometry(1.6, 12, 70), pedra, s * 5.3, -6.4, -21);
        for (const z of [9.8, -50.4]) Z.copias(A.g, Z.rocha(.8, .4, 0), pedra, 12, (o, i) => { if (z < 0 && Math.abs(i - 5.5) < 2) { o.scale.setScalar(0); return; } o.position.set(-4.6 + i * .84, .15, z); o.rotation.set(R() * 3, R() * 3, 0); o.scale.set(1, .6 + R() * .8, 1); });
        Z.chao(A.g, 120, 120, ['#0c0630', '#0a0428', '#140a44'], { z: -25, y: -11 });
        // penhascos retorcidos dos dois lados, com árvores secas e luzinhas
        Z.copias(A.g, Z.rocha(2.6, .5, 1), pedra, 52, (o, i) => { const s = i % 2 ? 1 : -1, z = 8 - Math.floor(i / 2) * 2.5 + R() * 1.6; o.position.set(s * (11 + R() * 7), -3 + R() * 4, z); o.rotation.set(R(), R() * 6, s * (R() * .5)); o.scale.set(.8 + R() * .7, 1.1 + R() * 2.4, .8 + R() * .8); });
        const seco = Z.solido('#0e0624');
        for (let i = 0; i < 12; i++) Z.galhada(A.g, (i % 2 ? 1 : -1) * (8 + R() * 4), 2 - i * 4, 1.3 + R(), seco, 2 + R() * 3);
        Z.flores(A.g, 220, i => [(i % 2 ? 1 : -1) * (4.5 + R() * .8), .3 + R() * .35, 8 - R() * 56], ['#c8f8ff', '#7affe0', '#d8a8ff'], .07);
        Z.vagalumes(A.g, 80, [-10, 10, -4, 7, -48, 6], '#8affec', .045, .7);
        // a fortaleza no fim
        Z.castelo(A.g, { x: 2, y: 5.5, z: -68, s: 1.1, pedra: '#160a3a', pedra2: '#2a1668', telhado: '#0a0420', janela: '#ff7ad8' });
        Z.brilho(A.g, '#b070ff', 38, 2, 12, -74, .4);
        Z.voa(Z.dragao(A.g, { s: 1.1, cor: '#1c1050', barriga: '#4a2a8a', asa: '#3a1a7a', olho: '#7affe0' }), { cx: 2, cz: -64, y: 21, r: 16, vel: .25 });
        Z.voa(Z.dragao(A.g, { s: .8, cor: '#2a0e46', barriga: '#6a2a7a', asa: '#551a6a', olho: '#7affe0' }), { cx: -4, cz: -58, y: 15, r: 20, vel: -.2, fase: 2.4 });
        const raso = Z.voa(Z.dragao(A.g, { s: 1.55, cor: '#14406a', barriga: '#50e0d0', asa: '#1a2a7a', olho: '#ffe860' }), { cx: 0, cz: -24, y: 10.5, r: 15, rz: 24, vel: .19, fase: 3.4, plana: .7 });
        let passou = 99;
        const rasoP = new THREE.Vector3();
        Z.anima(dt => { passou += dt; raso.getWorldPosition(rasoP); if (passou > 14 && rasoP.distanceTo(E.camera.position) < 19) { passou = 0; Z.somDragao('rugido', 1, rasoP); } });
        A.interage(2.6, 1.4, 1, 0, .8, -23, 'Olhar pra água acesa', () => E.conversa([['VOCÊ', '(Não molha. É luz com cara de água.)'], ['VOCÊ', '(Lá embaixo passou um dragão. Ele nem me viu. Eu acho.)']]));
        A.moeda(-1.2, -12); A.moeda(1.2, -27); A.moeda(0, -39);
      },
    },
  ];

  const tr = trilho(E, L, Z, trechos, 'estrelas');
  L.ambience = bus => { E.loopNoise('bandpass', 4600, 8, .01, bus); E.loopNoise('lowpass', 210, 0, .035, bus); };
  L.enter = () => {
    L.anuncia();
    E.tutorial('sonho', 'Os lugares que a fita sonha', [['W A S D', 'joystick (esquerda)', 'andar pelo caminho'], ['Shift', '🏃', 'correr'], ['H', '💡', 'o passarinho guia mostra o caminho'], ['E', '✋', 'olhar de perto']], 'Siga o caminho até o portal. Olhe em volta: não tem pressa.');
  };
  L.update = dt => tr.passo(dt);
  L.idle = () => tr.idle();
  L.exit = () => Z.soltar();
  L.hint = tr.dica;
  L.debug = { tr };
}
