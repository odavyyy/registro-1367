// Kit "dark fantasy nostálgico": céus pintados na hora, montanhas, castelos, dragões, casinhas, brilhos
// e o "trilho" (fase feita de vários trechos). Usado pela floresta e pelas fases do sonho.
// Tudo é desenhado por código: nenhum arquivo de imagem ou som novo (o zip precisa ficar abaixo de 10 MB).
// Direções do céu: az = atan2(x, z). az 0 = +z (sul), PI = -z (norte, pra onde se olha ao chegar), PI/2 = leste.

export function kit(E, L) {
  const THREE = E.THREE, V3 = THREE.Vector3;
  let sm = 91;
  const R = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
  const vivos = [];                 // funções (dt, t) chamadas a cada quadro
  const descartar = [];             // texturas criadas aqui, soltas quando a fase fecha
  const anima = fn => vivos.push(fn);
  let obra = null;   // { g: grupo do trecho, caminho: [[x,z]...], bloco(x,z,r) }
  const aoCaminho = (x, z) => { let m = 1e9; const c = obra.caminho; for (let i = 0; i < c.length - 1; i++) { const [ax, az] = c[i], [bx, bz] = c[i + 1], dx = bx - ax, dz = bz - az, k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); m = Math.min(m, Math.hypot(x - ax - dx * k, z - az - dz * k)); } return m; };
  // reserva o espaço de um objeto sólido (lista de círculos [x, z, r]); devolve false se ele taparia o caminho
  const ocupa = (p, circulos) => {
    if (!obra || p !== obra.g) return true;
    if (circulos.some(([x, z, r]) => aoCaminho(x, z) < r + .85)) return false;
    for (const c of circulos) obra.bloco(...c);
    return true;
  };
  const hex = c => new THREE.Color(c);

  /* ---------- materiais ---------- */
  // 'luz' = não depende das lâmpadas nem da névoa (coisas que brilham ou ficam muito longe)
  const luz = (o) => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, typeof o === 'object' ? o : { color: o }));
  const solido = (cor, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: cor, flatShading: true }, o));
  const tela = (w, h, draw, o = {}) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    if (o.nitido) { t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
    if (o.rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.rep[0], o.rep[1]); }
    descartar.push(t); return t;
  };
  const manchas = (g, w, h, n, cores, r0 = 1, r1 = 2) => {
    for (let i = 0; i < n; i++) { g.fillStyle = cores[(R() * cores.length) | 0]; const r = r0 + R() * (r1 - r0); g.fillRect(R() * w, R() * h, r, r); }
  };

  /* ---------- juntar peças: muitas malhas do mesmo material viram uma (bem menos trabalho pro celular) ----------
     tudo = true: o objeto inteiro é parado, junta a árvore toda. false: junta só as peças presas na mesma junta (dragão).
     peça com userData.vivo (que pisca, escala ou some sozinha) fica de fora. */
  function funde(g, tudo = true) {
    g.updateMatrixWorld(true);
    const nos = []; if (tudo) nos.push(g); else g.traverse(o => { if (!o.isMesh) nos.push(o); });
    for (const no of nos) {
      const porMat = new Map(), inv = new THREE.Matrix4().copy(no.matrixWorld).invert();
      const junta = o => { if (o.isMesh && !o.isInstancedMesh && !o.userData.vivo && !o.children.length && !Array.isArray(o.material)) { if (!porMat.has(o.material)) porMat.set(o.material, []); porMat.get(o.material).push(o); } };
      if (tudo) no.traverse(junta); else no.children.forEach(junta);
      for (const [mat, lista] of porMat) {
        if (lista.length < 2) continue;
        const pos = [], nor = [], uv = [];
        for (const m of lista) {
          const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
          if (!geo.attributes.normal) geo.computeVertexNormals();
          geo.applyMatrix4(tudo ? new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld) : m.matrix);
          const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv;
          for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0); }
          geo.dispose(); m.removeFromParent();
        }
        const G2 = new THREE.BufferGeometry();
        G2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G2.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G2.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        no.add(new THREE.Mesh(G2, mat));
      }
    }
    return g;
  }
  // bicho voando lá longe: de perto não se vê, então são só três peças
  function revoada(p, { s = .25, cor = '#14123a' } = {}) {
    const g = new THREE.Group(); p.add(g); g.scale.setScalar(s * 1.6);
    const m = luz({ color: cor, side: THREE.DoubleSide });
    const corpo = malha(g, new THREE.ConeGeometry(.35, 4.2, 4), m); corpo.rotation.x = Math.PI / 2;
    const asas = [-1, 1].map(x => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .7, x * 3.6, 0, .2, x * 1.7, 0, -.5, 0, 0, .7, x * 1.7, 0, -.5, 0, 0, -.9], 3)); return { x, m: malha(g, geo, m) }; });
    g.userData.pose = (t, modo, fase = 0) => { for (const a of asas) a.m.rotation.z = a.x * Math.sin(t * 5 + fase) * .55; };
    return g;
  }

  /* ---------- brilhos ---------- */
  const haloT = tela(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  function brilho(p, cor, tam, x, y, z, op = .8) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloT, color: cor, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.scale.set(tam, tam, 1); s.position.set(x, y, z); p.add(s); return s;
  }
  const malha = (p, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  // muitas cópias iguais numa chamada só (flores, milho, pedras...): fn(objeto, i) posiciona e devolve a cor (opcional)
  function copias(p, geo, mat, n, fn) {
    const im = new THREE.InstancedMesh(geo, mat, n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); const c = fn(o, i); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (c !== undefined && c !== null) im.setColorAt(i, hex(c)); }
    im.frustumCulled = false; p.add(im); return im;
  }

  /* ---------- ruído (pra nuvens e rochas) ---------- */
  const h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
  function ruido(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z); let xf = x - xi, yf = y - yi, zf = z - zi;
    xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf); zf = zf * zf * (3 - 2 * zf);
    const m = (a, b, k) => a + (b - a) * k;
    return m(m(m(h3(xi, yi, zi), h3(xi + 1, yi, zi), xf), m(h3(xi, yi + 1, zi), h3(xi + 1, yi + 1, zi), xf), yf),
      m(m(h3(xi, yi, zi + 1), h3(xi + 1, yi, zi + 1), xf), m(h3(xi, yi + 1, zi + 1), h3(xi + 1, yi + 1, zi + 1), xf), yf), zf);
  }
  const fbm = (x, y, z, n = 4) => { let a = .5, s = 0, f = 1; for (let i = 0; i < n; i++) { s += a * ruido(x * f, y * f, z * f); a *= .5; f *= 2.1; } return s / (1 - Math.pow(.5, n)); };

  // pedra torta: um sólido simples com cada ponta empurrada pra um lado
  function rocha(raio, tort = .35, det = 1) {
    const g = new THREE.IcosahedronGeometry(raio, det), p = g.attributes.position, seed = R() * 90;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + (ruido(x / raio * 1.9 + seed, y / raio * 1.9, z / raio * 1.9) - .5) * 2 * tort;
      p.setXYZ(i, x * k, y * k, z * k);
    }
    g.computeVertexNormals(); return g;
  }

  /* ---------- céu ----------
     o: { grad: [[altura -1..1, cor]...] de cima pra baixo, nuvens: {cor, cor2, de, ate, forca, escala, torce, alt0, alt1},
          estrelas: n, espiral: {az, el, raio, cor, cor2, bracos, torce}, clarao: [{az, el, raio, cor, forca}] } */
  function ceu(o) {
    const W = 768, H = 384;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), img = g.createImageData(W, H), D = img.data;
    const rgb = s => { const n = parseInt(s.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const grad = o.grad.map(([a, k]) => [a, rgb(k)]);
    const nv = o.nuvens && { esc: 2.6, torce: .8, forca: 1, de: .42, ate: .72, alt0: -.05, alt1: 1, ...o.nuvens };
    const n1 = nv && rgb(nv.cor), n2 = nv && rgb(nv.cor2 || nv.cor);
    const dirAE = (az, el) => [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    const sp = o.espiral && { raio: .55, bracos: 3, torce: 7, forca: 1, ...o.espiral };
    let sc, su, sv, s1, s2;
    if (sp) {
      sc = dirAE(sp.az, sp.el); su = [Math.cos(sp.az), 0, -Math.sin(sp.az)];
      sv = [sc[1] * su[2] - sc[2] * su[1], sc[2] * su[0] - sc[0] * su[2], sc[0] * su[1] - sc[1] * su[0]];
      s1 = rgb(sp.cor); s2 = rgb(sp.cor2);
    }
    const clar = (o.clarao || []).map(k => ({ d: dirAE(k.az, k.el), raio: k.raio, cor: rgb(k.cor), forca: k.forca ?? 1 }));
    for (let j = 0; j < H; j++) {
      const th = (j + .5) / H * Math.PI, y = Math.cos(th), s = Math.sin(th);
      let a = 0; while (a < grad.length - 2 && y < grad[a + 1][0]) a++;
      const [y0, c0] = grad[a], [y1, c1] = grad[a + 1], kg = Math.max(0, Math.min(1, (y0 - y) / (y0 - y1)));
      for (let i = 0; i < W; i++) {
        const ph = (i + .5) / W * Math.PI * 2, x = -Math.cos(ph) * s, z = Math.sin(ph) * s;
        let r = c0[0] + (c1[0] - c0[0]) * kg, gg = c0[1] + (c1[1] - c0[1]) * kg, b = c0[2] + (c1[2] - c0[2]) * kg;
        for (const k of clar) {
          const d = Math.acos(Math.max(-1, Math.min(1, x * k.d[0] + y * k.d[1] + z * k.d[2])));
          if (d < k.raio) { const m = Math.pow(1 - d / k.raio, 2) * k.forca; r += (k.cor[0] - r) * m; gg += (k.cor[1] - gg) * m; b += (k.cor[2] - b) * m; }
        }
        if (sp) {
          const dot = x * sc[0] + y * sc[1] + z * sc[2];
          if (dot > 0) {
            const u = x * su[0] + y * su[1] + z * su[2], v = x * sv[0] + y * sv[1] + z * sv[2], rr = Math.hypot(u, v) / sp.raio;
            if (rr < 1) {
              const an = Math.atan2(v, u), n = fbm(u * 9, v * 9, 3, 3);
              const braco = Math.pow(.5 + .5 * Math.sin(an * sp.bracos + Math.log(rr + .03) * sp.torce + n * 2.2), 2.2);
              const m = Math.min(1, braco * Math.pow(1 - rr, .8) * 1.35 * sp.forca), nucleo = Math.pow(Math.max(0, 1 - rr * 4), 2);
              const mix = Math.min(1, rr * 1.5), cr = s1[0] + (s2[0] - s1[0]) * mix, cg = s1[1] + (s2[1] - s1[1]) * mix, cb = s1[2] + (s2[2] - s1[2]) * mix;
              r += (cr - r) * m + 230 * nucleo; gg += (cg - gg) * m + 235 * nucleo; b += (cb - b) * m + 255 * nucleo;
            }
          }
        }
        if (nv && y > nv.alt0 && y < nv.alt1) {
          const w = fbm(x * 1.7 + 11, y * 3, z * 1.7, 3) * nv.torce * 3;
          const n = fbm(x * nv.esc + w, y * nv.esc * 2.4 + w * .4, z * nv.esc - w, 4);
          let m = Math.max(0, Math.min(1, (n - nv.de) / (nv.ate - nv.de)));
          m *= Math.min(1, (y - nv.alt0) * 6) * Math.min(1, (nv.alt1 - y) * 4) * nv.forca;
          if (m > 0) {
            const k2 = Math.max(0, Math.min(1, (n - nv.ate + .08) * 5));
            r += (n1[0] + (n2[0] - n1[0]) * k2 - r) * m; gg += (n1[1] + (n2[1] - n1[1]) * k2 - gg) * m; b += (n1[2] + (n2[2] - n1[2]) * k2 - b) * m;
          }
        }
        const p = (j * W + i) * 4; D[p] = r; D[p + 1] = gg; D[p + 2] = b; D[p + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    for (let k = 0; k < (o.estrelas || 0); k++) {
      const y = R() * .98 + .02, j = Math.acos(y) / Math.PI * H, i = R() * W, br = R(), larg = 1 / Math.max(.25, Math.sqrt(1 - y * y));
      g.fillStyle = `rgba(${220 + br * 35},${225 + br * 30},255,${.35 + br * .65})`;
      g.fillRect(i, j, (br > .93 ? 2 : 1) * larg, br > .93 ? 2 : 1);
      if (br > .985) { g.fillStyle = 'rgba(200,220,255,.55)'; g.fillRect(i - 3 * larg, j + .5, 8 * larg, 1); g.fillRect(i + .5 * larg, j - 3, larg, 8); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; descartar.push(t);
    const m = new THREE.Mesh(new THREE.SphereGeometry(86, 32, 20), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
    m.renderOrder = -10; m.frustumCulled = false; return m;
  }

  /* ---------- cordilheira (silhueta em volta): fica "no infinito", acompanhando o jogador ---------- */
  function serra(p, { raio = 70, base = -10, alt = 14, pico = 10, cor = '#141640', bruma = '#3a3a8a', freq = 5, seed = 1, de = 0, ate = Math.PI * 2, ponta = 1.6 }) {
    const N = 220, pos = [], col = [], idx = [], A = hex(bruma), B = hex(cor);
    for (let i = 0; i <= N; i++) {
      const a = de + (ate - de) * i / N, x = Math.sin(a), z = Math.cos(a);
      const n = fbm(x * freq + seed * 7, z * freq, seed, 4), agudo = Math.pow(Math.max(0, n - .3) / .5, ponta);
      const borda = ate - de < 6.2 ? Math.min(1, Math.min(i, N - i) / 14) : 1;
      const topo = base + (alt + agudo * pico) * borda;
      pos.push(x * raio, base, z * raio, x * raio, base + (topo - base) * .45, z * raio, x * raio, topo, z * raio);
      const meio = A.clone().lerp(B, .65);
      col.push(A.r, A.g, A.b, meio.r, meio.g, meio.b, B.r, B.g, B.b);
      if (i < N) { const k = i * 3; for (const q of [0, 1]) idx.push(k + q, k + q + 3, k + q + 1, k + q + 1, k + q + 3, k + q + 4); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false })); m.frustumCulled = false; p.add(m); return m;
  }

  /* ---------- lua (com crateras e halo) ---------- */
  function lua(p, { az = Math.PI, el = .35, dist = 72, tam = 7, cor = '#dfe8ff', sombra = '#8fa0d8', halo = '#6a8cff' }) {
    const t = tela(128, 128, g => {
      g.save(); g.beginPath(); g.arc(64, 64, 62, 0, 7); g.clip();
      g.fillStyle = cor; g.fillRect(0, 0, 128, 128);
      g.fillStyle = sombra;
      for (let i = 0; i < 38; i++) { g.globalAlpha = .16 + R() * .4; g.beginPath(); g.arc(R() * 128, R() * 128, 2 + R() * R() * 17, 0, 7); g.fill(); }
      g.globalAlpha = 1;
      const s = g.createRadialGradient(46, 46, 20, 64, 64, 66); s.addColorStop(0, 'rgba(255,255,255,.18)'); s.addColorStop(1, 'rgba(10,10,60,.45)'); g.fillStyle = s; g.fillRect(0, 0, 128, 128);
      g.restore();
    });
    const pos = new V3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(dist);
    brilho(p, halo, tam * 3.6, pos.x * 1.01, pos.y * 1.01, pos.z * 1.01, .75);
    const m = malha(p, new THREE.CircleGeometry(tam / 2, 32), luz({ map: t }), pos.x, pos.y, pos.z); m.lookAt(0, 0, 0); return m;
  }

  /* ---------- castelo ---------- */
  function castelo(p, { x = 0, y = 0, z = 0, s = 1, pedra = '#1c2058', pedra2 = '#2a2f78', telhado = '#0e1038', janela = '#ffd45a', base = true, longe = true } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g);
    const tij = (a, b) => tela(64, 64, c => { c.fillStyle = a; c.fillRect(0, 0, 64, 64); c.fillStyle = b; for (let yy = 0; yy < 64; yy += 8) for (let xx = (yy / 8) % 2 ? -6 : 0; xx < 64; xx += 12) c.fillRect(xx + 1, yy + 1, 10, 6); manchas(c, 64, 64, 120, ['rgba(0,0,0,.25)', 'rgba(150,170,255,.12)'], 1, 3); }, { nitido: true, rep: [3, 3] });
    const o = longe ? { fog: false } : {};
    const m1 = new THREE.MeshLambertMaterial({ map: tij(pedra, pedra2), emissive: hex(pedra).multiplyScalar(.7), ...o });
    const mT = solido(telhado, { emissive: hex(telhado).multiplyScalar(.6), ...o }), mJ = luz(janela), mR = solido(pedra, { emissive: hex(pedra).multiplyScalar(.35), ...o });
    const jan = [];
    const torre = (tx, tz, r, alt, y0 = 0) => {
      malha(g, new THREE.CylinderGeometry(r * .9, r, alt, 9), m1, tx, y0 + alt / 2, tz);
      malha(g, new THREE.CylinderGeometry(r * 1.18, r * .95, r * .5, 9), m1, tx, y0 + alt + r * .2, tz);
      malha(g, new THREE.ConeGeometry(r * 1.28, r * 3.4, 9), mT, tx, y0 + alt + r * 2.1, tz);
      malha(g, new THREE.CylinderGeometry(.03, .03, r * 1.2, 4), mT, tx, y0 + alt + r * 4.3, tz);
      for (let k = 0; k < Math.floor(alt / 1.1); k++) { const a = R() * Math.PI * 2; jan.push([tx + Math.sin(a) * r * 1.01, y0 + 1 + k * 1.05, tz + Math.cos(a) * r * 1.01, a]); }
    };
    torre(0, 0, 1.7, 11); torre(-4.2, 1.6, 1.05, 7.5); torre(4.4, 1.2, 1.15, 8.6); torre(-2.2, -2.4, .8, 10.5); torre(2.4, -2, .7, 12.2); torre(-6.6, -.4, .75, 4.8); torre(6.7, -.8, .8, 5.6); torre(.9, 2.9, .55, 8.8); torre(-1.3, 2.7, .5, 7.2);
    const bloco = (bx, bz, w, h, d, telha = true) => {
      malha(g, new THREE.BoxGeometry(w, h, d), m1, bx, h / 2, bz);
      if (telha) { const t = malha(g, new THREE.ConeGeometry(.72, 1, 4), mT, bx, h + d * .3, bz); t.rotation.y = Math.PI / 4; t.scale.set(w, d * .6, d); }
      for (let u = -w / 2 + .6; u < w / 2 - .3; u += .9) for (let v = 1.2; v < h - .4; v += 1.15) if (R() < .6) jan.push([bx + u, v, bz + d / 2 + .02, 0], [bx + u, v, bz - d / 2 - .02, Math.PI]);
    };
    bloco(0, 1.4, 5.4, 5.2, 3.2); bloco(-4.4, 0, 3.6, 3.4, 2.2); bloco(4.6, -.2, 3.8, 3.9, 2.4); bloco(0, 3.6, 11.6, 2.1, .7, false);
    for (let u = -5.6; u <= 5.6; u += .75) malha(g, new THREE.BoxGeometry(.35, .4, .75), m1, u, 2.3, 3.6);
    // portão iluminado
    const porta = malha(g, new THREE.CircleGeometry(.75, 12, 0, Math.PI), mJ, 0, .75, 3.98); porta.material = luz('#ffb23a'); malha(g, new THREE.PlaneGeometry(1.5, .76), porta.material, 0, .38, 3.98);
    brilho(g, '#ffb040', 4.5, 0, 1, 4.4, .65);
    const jg = new THREE.PlaneGeometry(.2, .38);
    copias(g, jg, mJ, jan.length, (ob, i) => { const [a, b, c, an] = jan[i]; ob.position.set(a, b, c); ob.rotation.y = an; });
    if (base) {
      malha(g, rocha(8.6, .25, 2), mR, 0, -5.4, 0).scale.set(1.05, .68, .8);
      malha(g, rocha(6, .4, 1), mR, -5.5, -8, .8).scale.set(.8, 1.3, .8);
      malha(g, rocha(6.5, .4, 1), mR, 5.2, -9, -.6).scale.set(.8, 1.5, .8);
      malha(g, new THREE.ConeGeometry(5, 14, 8), mR, 0, -13, 0).rotation.x = Math.PI;
    }
    return funde(g);
  }

  /* ---------- dragão ----------
     frente = +z. Corpo, pescoço em curva, cabeça com chifres e mandíbula, cauda em corrente e asas em duas partes. */
  function dragao(p, { s = 1, cor = '#2a2f86', barriga = '#8a5ab0', asa = '#4a2a8a', olho = '#ffd23a', longe = true } = {}) {
    const g = new THREE.Group(); p.add(g); g.scale.setScalar(s);
    const o = longe ? { fog: false } : {};
    const mC = solido(cor, { emissive: hex(cor).multiplyScalar(.38), ...o }), mB = solido(barriga, { emissive: hex(barriga).multiplyScalar(.3), ...o });
    const mA = solido(asa, { emissive: hex(asa).multiplyScalar(.45), side: THREE.DoubleSide, ...o }), mO = luz(olho), mH = solido('#d8c8a0', { emissive: hex('#3a2c1a'), ...o });
    const bola = new THREE.IcosahedronGeometry(1, 1), cone = new THREE.ConeGeometry(1, 1, 6);
    const el = (pai, mat, x, y, z, sx, sy, sz) => { const m = malha(pai, bola, mat, x, y, z); m.scale.set(sx, sy, sz); return m; };
    const ch = (pai, mat, x, y, z, r, h, rx = 0, rz = 0) => { const m = malha(pai, cone, mat, x, y, z); m.scale.set(r, h, r); m.rotation.set(rx, 0, rz); return m; };
    el(g, mC, 0, 0, 0, .72, .68, 1.5); el(g, mB, 0, -.24, .12, .56, .5, 1.28); el(g, mC, 0, .08, .85, .66, .66, .72);
    for (let i = 0; i < 6; i++) ch(g, mH, 0, .72 - Math.abs(i - 2) * .05, 1 - i * .4, .09, .34, -.4);
    // pescoço
    const pesc = new THREE.Group(); pesc.position.set(0, .28, 1.2); g.add(pesc);
    const elos = []; let pai = pesc;
    for (let i = 0; i < 5; i++) {
      const n = new THREE.Group(); n.position.set(0, i ? .3 : 0, i ? .34 : 0); pai.add(n); const r = .44 - i * .045;
      el(n, mC, 0, .1, .14, r, r, r * 1.35); el(n, mB, 0, -.02, .2, r * .72, r * .72, r * 1.1); ch(n, mH, 0, r + .2, .08, .07, .26, -.5);
      elos.push(n); pai = n;
    }
    const cab = new THREE.Group(); cab.position.set(0, .34, .42); pai.add(cab);
    const olhosD = [];
    g.userData.dormir = () => { for (const m of olhosD) m.scale.y = .01; };   // olhos fechados
    el(cab, mC, 0, .04, .08, .36, .32, .42);
    ch(cab, mC, 0, .02, .66, .26, .82, Math.PI / 2); el(cab, mC, 0, .1, .98, .15, .11, .15);
    const queixo = new THREE.Group(); queixo.position.set(0, -.14, .2); cab.add(queixo); ch(queixo, mB, 0, -.04, .4, .19, .72, Math.PI / 2);
    for (const x of [-1, 1]) {
      const olhoM = el(cab, mO, x * .25, .15, .3, .085, .06, .1); olhoM.userData.vivo = true; olhosD.push(olhoM);
      ch(cab, mH, x * .22, .38, -.24, .1, .78, -1.05, -x * .28); ch(cab, mH, x * .36, .08, -.18, .06, .46, -1.35, -x * .7);
      for (let k = 0; k < 3; k++) { ch(cab, mH, x * (.15 - k * .028), -.1, .48 + k * .19, .03, .12, Math.PI); }
      el(cab, mC, x * .22, .26, .24, .17, .08, .22);
    }
    // cauda
    const cauda = []; pai = g;
    for (let i = 0; i < 10; i++) {
      const n = new THREE.Group(); n.position.set(0, i ? -.01 : 0, i ? -.45 : -1.25); pai.add(n); const r = .42 * (1 - i / 11.5);
      el(n, mC, 0, 0, -.2, r, r * .9, .38); if (i < 8) ch(n, mH, 0, r + .08, -.2, .05, .22 - i * .015, -.6);
      cauda.push(n); pai = n;
    }
    const pa = ch(pai, mA, 0, 0, -.72, .36, .66, -Math.PI / 2); pa.scale.set(.36, .66, .05);
    // patas
    for (const x of [-1, 1]) for (const z of [.75, -.8]) {
      const perna = new THREE.Group(); perna.position.set(x * .55, -.32, z); g.add(perna); perna.rotation.x = z > 0 ? -.35 : .45;
      el(perna, mC, x * .05, -.24, 0, .2, .38, .24); el(perna, mC, x * .07, -.6, .08, .12, .3, .13); el(perna, mB, x * .07, -.86, .22, .17, .09, .26);
      for (let k = -1; k <= 1; k++) ch(perna, mH, x * .07 + k * .09, -.9, .48, .035, .18, Math.PI / 2);
    }
    // asas: membrana com a borda recortada + ossos
    const mem = pts => { const pos = []; for (const [a, b, c] of pts) pos.push(...a, ...b, ...c); const gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gm.computeVertexNormals(); return gm; };
    const osso = (pai2, a, b, r) => { const A = new V3(...a), B = new V3(...b), d = B.clone().sub(A), m = malha(pai2, new THREE.CylinderGeometry(r * .55, r, d.length(), 5), mC); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); };
    const asas = [-1, 1].map(x => {
      const raiz = new THREE.Group(); raiz.position.set(x * .48, .42, .5); g.add(raiz);
      const S0 = [0, 0, 0], E1 = [x * 1.9, .25, .45], T0 = [x * .15, -.1, -1.55], M0 = [x * .95, -.02, -1.05], M1 = [x * 1.9, .05, -1.45];
      malha(raiz, mem([[S0, E1, M0], [S0, M0, T0], [E1, M1, M0]]), mA); osso(raiz, S0, E1, .13);
      const fora = new THREE.Group(); fora.position.set(...E1); raiz.add(fora);
      const O = [0, 0, 0], P1 = [x * 2.7, .1, .15], I1 = [x * 1.65, .02, -.62], P2 = [x * 2.15, .03, -1.45], I2 = [x * 1.02, .01, -1.25], P3 = [x * 1.05, 0, -2.05], I3 = [x * .35, 0, -1.5], B0 = [0, -.2, -1.9];
      malha(fora, mem([[O, P1, I1], [O, I1, P2], [O, P2, I2], [O, I2, P3], [O, P3, I3], [O, I3, B0]]), mA);
      for (const q of [P1, P2, P3]) osso(fora, O, q, .08);
      ch(fora, mH, 0, .1, .2, .07, .32, 1.1);
      return { raiz, fora, x };
    });
    // pose / animação: m = 'voa' | 'planando' | 'pousado'
    g.userData.pose = (t, m = 'voa', fase = 0) => {
      const bate = Math.sin(t * 3.1 + fase), atraso = Math.sin(t * 3.1 + fase - 1.15);
      for (const a of asas) {
        if (m === 'pousado') { a.raiz.rotation.set(0, a.x * .72, a.x * (.88 + Math.sin(t * .9) * .05)); a.fora.rotation.set(0, a.x * .25, a.x * -1.95); }
        else if (m === 'planando') { a.raiz.rotation.set(0, 0, a.x * (.16 + bate * .06)); a.fora.rotation.set(0, 0, a.x * (-.06 + atraso * .05)); }
        else { a.raiz.rotation.set(0, 0, a.x * (.12 + bate * .62)); a.fora.rotation.set(0, 0, a.x * atraso * .55); }
      }
      elos.forEach((n, i) => { n.rotation.x = (m === 'pousado' ? [-.34, -.2, -.02, .2, .3] : [.16, .06, -.04, -.1, -.1])[i] + Math.sin(t * 1.2 + i * .5 + fase) * .035; n.rotation.y = Math.sin(t * .8 + i * .55 + fase) * .06; });
      cab.rotation.x = (m === 'pousado' ? .12 : .1) + Math.sin(t * 1.1) * .05;
      cauda.forEach((n, i) => { n.rotation.y = Math.sin(t * 1.7 - i * .55 + fase) * (m === 'pousado' ? .05 : .13) + (m === 'pousado' ? .2 : 0); n.rotation.x = (m === 'pousado' ? (i < 3 ? -.2 : i < 7 ? .08 : .12) : Math.sin(t * 3.1 - i * .5 + fase) * .06); });
      queixo.rotation.x = .08 + (g.userData.boca || 0) * .55;
    };
    funde(g, false);
    g.userData.cabeca = cab; g.userData.pescoco = pesc; g.userData.pose(0, 'voa');
    return g;
  }
  // dragão dando voltas: centro (cx, y, cz), raio r, vel em rad/s (negativa = sentido contrário)
  let ultimoUivo = 0, ultimaAsa = 0;   // um relógio só pra todos: dragão nenhum atropela o outro
  const mundoD = new V3();
  function voa(d, { cx = 0, cz = 0, y = 14, r = 30, rz, vel = .12, fase = 0, plana = .35 }) {
    const grande = d.scale.x >= .7;
    const f = (dt, t) => {
      if (grande && t > 3) {
        d.getWorldPosition(mundoD); const dist = mundoD.distanceTo(E.camera.position), agora = performance.now() / 1000;
        if (dist < 24 && agora - ultimaAsa > 7) { ultimaAsa = agora; somDragao('asas', .9, mundoD); }
        if (agora - ultimoUivo > 17 + R() * 40) { ultimoUivo = agora; somDragao(R() < .65 ? 'longe' : 'guincho', .75, mundoD); }
      }
      const a = t * vel + fase, rr = rz || r;
      d.position.set(cx + Math.sin(a) * r, y + Math.sin(t * .6 + fase) * 1.6, cz + Math.cos(a) * rr);
      d.rotation.set(Math.sin(t * .6 + fase + 1.2) * -.08, Math.atan2(Math.cos(a) * r * Math.sign(vel), -Math.sin(a) * rr * Math.sign(vel)), -Math.sign(vel) * .28, 'YXZ');
      d.userData.pose(t, Math.sin(t * .37 + fase * 3) > 1 - plana * 2 ? 'planando' : 'voa', fase * 2);
    };
    anima(f); f(0, 0); return d;
  }
  // sopro de fogo: faíscas que saem da boca por uns segundos. Devolve disparar()
  function fogo(p, boca, frente, cores = ['#ffe070', '#ff8a2a', '#ff4a2a']) {
    const parts = []; let resta = 0;
    for (let i = 0; i < 34; i++) { const s = brilho(p, cores[i % cores.length], .5, 0, -50, 0, 0); s.userData = { v: new V3(), vida: 0 }; parts.push(s); }
    const A = new V3(), B = new V3(); let k = 0, acc = 0;
    anima(dt => {
      if (resta > 0) {
        resta -= dt; acc += dt;
        while (acc > .035) { acc -= .035; const s = parts[k++ % parts.length]; boca(A); frente(B); s.position.copy(A); p.worldToLocal(s.position); s.userData.v.copy(B).multiplyScalar(6 + R() * 3); s.userData.v.x += (R() - .5) * 1.6; s.userData.v.y += (R() - .5) * 1.6; s.userData.v.z += (R() - .5) * 1.6; s.userData.vida = 1; }
      }
      for (const s of parts) if (s.userData.vida > 0) { const u = s.userData; u.vida -= dt * 1.25; s.position.addScaledVector(u.v, dt); u.v.multiplyScalar(1 - dt * .8); u.v.y += dt * 1.2; s.material.opacity = Math.max(0, u.vida); const e = .35 + (1 - u.vida) * 1.7; s.scale.set(e, e, 1); }
    });
    return (dur = 1.6) => { resta = dur; };
  }
  // sons de dragão (audio/sfx/dragao_*.mp3, feitos pelo ferramentas/gerar_sons.py)
  // nome: 'longe' | 'rugido' | 'guincho' | 'ronco' | 'asas' | 'fogo'; onde = posição no mundo (dá o lado e a distância)
  const legendas = { longe: '[distant roar]', rugido: '[dragon roar]', guincho: '[dragon screech]', ronco: '[dragon snoring]', fogo: '[fire breath]' };
  const ouvido = new V3();
  function somDragao(nome, vol = .8, onde) {
    if (!E.ac()) return;
    const o = {};
    if (onde) { const d = E.camera.position.distanceTo(onde); vol *= Math.max(.25, Math.min(1, 22 / (d + 6))); o.pan = E.pan(ouvido.copy(onde)) * .8; }
    o.rate = .93 + R() * .14;
    E.somGravado('dragao_' + nome, vol, o);
    if (legendas[nome] && vol > .3) E.capSom && E.capSom(legendas[nome]);
  }
  const rugido = (vol = .7, nome = 'longe', onde) => somDragao(nome, vol, onde);

  /* ---------- casinha torta de conto de fadas ---------- */
  const enxaimel = (reboco, viga) => tela(64, 64, g => { g.fillStyle = reboco; g.fillRect(0, 0, 64, 64); manchas(g, 64, 64, 160, ['rgba(0,0,0,.14)', 'rgba(255,255,255,.1)'], 1, 3); g.strokeStyle = viga; g.lineWidth = 4; for (const x of [2, 22, 42, 62]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 64); g.stroke(); } for (const y of [2, 30, 62]) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y); g.stroke(); } g.lineWidth = 3; g.beginPath(); g.moveTo(2, 30); g.lineTo(22, 62); g.moveTo(62, 30); g.lineTo(42, 62); g.stroke(); }, { nitido: true });
  const telhas = (a, b) => tela(64, 64, g => { g.fillStyle = a; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 7) for (let x = (y / 7) % 2 ? -4 : 0; x < 64; x += 9) { g.fillStyle = b; g.beginPath(); g.arc(x + 4, y + 2, 4.4, 0, Math.PI); g.fill(); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + 8, y, 1, 7); } }, { nitido: true, rep: [3, 2] });
  const vidro = tela(32, 32, g => { g.fillStyle = '#ffd860'; g.fillRect(0, 0, 32, 32); const r = g.createRadialGradient(16, 20, 2, 16, 20, 20); r.addColorStop(0, 'rgba(255,255,220,.9)'); r.addColorStop(1, 'rgba(255,130,20,.5)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); g.fillStyle = '#2a1408'; g.fillRect(15, 0, 2, 32); g.fillRect(0, 15, 32, 2); g.strokeStyle = '#2a1408'; g.lineWidth = 4; g.strokeRect(0, 0, 32, 32); }, { nitido: true });
  const casas = {};
  function casinha(p, x, z, { rotY = 0, w = 3, h = 2.4, d = 2.6, reboco = '#8a7a9a', viga = '#2a1a2a', telha = '#2a5a66', telha2 = '#3a7a80', torta = .05, y = 0 } = {}) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; p.add(g);
    {   // a pegada da casa vira uma fileira de círculos no sentido mais comprido, mais os quatro cantos
      const cs = Math.cos(rotY), sn = Math.sin(rotY), mundo = (lx, lz, r) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs, r];
      const lar = w >= d, curto = Math.min(w, d) / 2, sobra = Math.max(w, d) / 2 - curto, pts = [-1, -.5, 0, .5, 1].map(k => mundo(lar ? k * sobra : 0, lar ? 0 : k * sobra, curto));
      for (const a of [-1, 1]) for (const b of [-1, 1]) pts.push(mundo(a * (w / 2 - .3), b * (d / 2 - .3), .3));
      if (!ocupa(p, pts)) { g.removeFromParent(); return new THREE.Group(); }
    }
    const ch = reboco + viga + telha;
    const M = casas[ch] || (casas[ch] = { par: new THREE.MeshLambertMaterial({ map: enxaimel(reboco, viga), emissive: '#14101c' }), tel: new THREE.MeshLambertMaterial({ map: telhas(telha, telha2), side: THREE.DoubleSide, emissive: '#0a0a14' }), mad: solido(viga), jan: new THREE.MeshBasicMaterial({ map: vidro }) });
    malha(g, new THREE.BoxGeometry(w, h, d), M.par, 0, h / 2, 0);
    const th = h * .85, tri = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(torta * w * 2, th)]);
    malha(g, new THREE.ExtrudeGeometry(tri, { depth: d - .02, bevelEnabled: false }), M.par, 0, h, -d / 2 + .01);
    for (const lado of [-1, 1]) {
      const bx = lado * (w / 2 + .22), by = -.2, tx = torta * w * 2, ty = th + .08, len = Math.hypot(bx - tx, by - ty);
      const m = malha(g, new THREE.BoxGeometry(len, .12, d + .5), M.tel, (bx + tx) / 2, h + (by + ty) / 2, 0); m.rotation.z = Math.atan2(by - ty, bx - tx);
    }
    const jan = (jx, jy, jw, jh) => { for (const s of [1, -1]) malha(g, new THREE.PlaneGeometry(jw, jh), M.jan, jx * s, jy, (d / 2 + .02) * s).rotation.y = s < 0 ? Math.PI : 0; };
    jan(-w * .27, h * .62, .52, .6); jan(w * .27, h * .62, .52, .6); jan(torta * w, h + th * .3, .4, .44);
    for (const s of [1, -1]) malha(g, new THREE.PlaneGeometry(.52, .6), M.jan, s * (w / 2 + .02), h * .6, 0).rotation.y = s * Math.PI / 2;
    malha(g, new THREE.BoxGeometry(.66, 1.15, .08), M.mad, 0, .58, d / 2 + .01);
    const cham = malha(g, new THREE.BoxGeometry(.34, 1.2, .34), M.mad, -w * .24, h + th * .72, -d * .2); cham.rotation.z = .12;
    brilho(g, '#ffa030', 2.4, -w * .27, h * .6, d / 2 + .25, .32); brilho(g, '#ffa030', 2.4, w * .27, h * .6, d / 2 + .25, .32);
    return funde(g);
  }

  /* ---------- plantas, pedras e luzinhas ---------- */
  function cogumelo(p, x, z, s, cor, pinta = '#f4ecff', y = 0) {
    const chave = 'cog' + cor;
    const M = casas[chave] || (casas[chave] = {
      cap: new THREE.MeshLambertMaterial({ map: tela(64, 32, g => { g.fillStyle = cor; g.fillRect(0, 0, 64, 32); g.fillStyle = pinta; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc((i * 13.7) % 62 + 1, (i * 7.3) % 26 + 3, 1.4 + (i % 3), 0, 7); g.fill(); } }, { nitido: true, rep: [3, 1] }), side: THREE.DoubleSide, emissive: hex(cor).multiplyScalar(.28) }),
      pe: solido('#cfc4d8', { emissive: '#1a1626' }), sai: new THREE.MeshBasicMaterial({ color: hex(pinta).multiplyScalar(.75), side: THREE.DoubleSide }),
    });
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.set((R() - .5) * .14, R() * 6.28, (R() - .5) * .14); p.add(g);
    if (s > .55 && !ocupa(p, [[x, z, .36 * s]])) { g.removeFromParent(); return g; }
    malha(g, new THREE.CylinderGeometry(.22, .38, 2, 8), M.pe, 0, 1, 0);
    malha(g, new THREE.SphereGeometry(1.25, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), M.cap, 0, 1.86, 0).scale.y = .72;
    malha(g, new THREE.RingGeometry(.3, 1.2, 14), M.sai, 0, 1.87, 0).rotation.x = Math.PI / 2;
    return g;
  }
  // tapete de flores que brilham; pts = função(i) => [x, y, z]
  function flores(p, n, pos, cores, tam = .11) {
    const petala = new THREE.OctahedronGeometry(tam, 0); petala.scale(1, .45, 1);
    copias(p, petala, new THREE.MeshBasicMaterial({ color: 0xffffff }), n, (o, i) => { const [x, y, z] = pos(i); o.position.set(x, y, z); o.rotation.set((R() - .5) * .8, R() * 3, (R() - .5) * .8); o.scale.setScalar(.6 + R() * .8); return cores[(R() * cores.length) | 0]; });
  }
  function capim(p, n, pos, cores, alt = .35) {
    const t = new THREE.ConeGeometry(.035, alt, 3); t.translate(0, alt / 2, 0);
    return copias(p, t, new THREE.MeshLambertMaterial({ color: 0xffffff }), n, (o, i) => { const [x, y, z] = pos(i); o.position.set(x, y, z); o.rotation.set((R() - .5) * .7, R() * 3, (R() - .5) * .7); o.scale.set(1, .5 + R(), 1); return cores[(R() * cores.length) | 0]; });
  }
  // árvore retorcida e sem folha
  function galhada(p, x, z, s, mat, y = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = R() * 6.28; p.add(g);
    if (y < .5 && !ocupa(p, [[x, z, .28 * s]])) { g.removeFromParent(); return g; }
    const ramo = (pai, len, r, nivel) => {
      const m = malha(pai, new THREE.CylinderGeometry(r * .6, r, len, 5), mat, 0, len / 2, 0); void m;
      if (nivel <= 0) return;
      const n = nivel > 1 ? 3 : 2;
      for (let i = 0; i < n; i++) { const q = new THREE.Group(); q.position.y = len * (.62 + i * .19); q.rotation.set((R() - .5) * .5, i * 2.3 + R(), (i % 2 ? 1 : -1) * (.5 + R() * .6)); pai.add(q); ramo(q, len * (.58 + R() * .14), r * .52, nivel - 1); }
    };
    ramo(g, 2.2, .26, 2); return funde(g);
  }
  function pinheiros(p, n, pos, cor = '#0c1a2e', alt = 3) {
    const t = new THREE.ConeGeometry(.9, alt, 6); t.translate(0, alt / 2, 0);
    copias(p, t, new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: hex(cor).multiplyScalar(.5) }), n, (o, i) => { const [x, y, z] = pos(i); o.position.set(x, y, z); o.scale.setScalar(.6 + R() * .9); return cor; });
  }
  // luzinhas voando (vagalumes, brasas, poeira de estrela)
  function vagalumes(p, n, caixa, cor, tam = .05, sobe = 0) {
    const geo = new THREE.OctahedronGeometry(tam, 0), im = new THREE.InstancedMesh(geo, luz(cor), n), o = new THREE.Object3D();
    const d = [...Array(n)].map(() => [caixa[0] + R() * (caixa[1] - caixa[0]), caixa[2] + R() * (caixa[3] - caixa[2]), caixa[4] + R() * (caixa[5] - caixa[4]), R() * 6.28, .5 + R()]);
    im.frustumCulled = false; p.add(im);
    const f = (dt, t) => {
      d.forEach(([x, y, z, a, v], i) => {
        const yy = sobe ? caixa[2] + ((y - caixa[2] + t * sobe * v) % (caixa[3] - caixa[2])) : y + Math.sin(t * v * 1.4 + a) * .35;
        o.position.set(x + Math.sin(t * .35 * v + a) * 1.1, yy, z + Math.cos(t * .3 * v + a * 2) * 1.1); o.scale.setScalar(.6 + .5 * Math.abs(Math.sin(t * 2 * v + a))); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    };
    anima(f); f(0, 0); return im;
  }
  // chão plano pintado
  function chao(p, w, d, cores, o = {}) {
    const t = tela(64, 64, g => { g.fillStyle = cores[0]; g.fillRect(0, 0, 64, 64); manchas(g, 64, 64, 520, cores.slice(1), 1, 3); }, { nitido: true, rep: [w / 4, d / 4] });
    const m = malha(p, new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: t }), o.x || 0, o.y || 0, o.z || 0); m.rotation.x = -Math.PI / 2; return m;
  }
  // fita de caminho seguindo uma linha de pontos [x, z]
  function estrada(p, pts, larg, tex, o = {}) {
    const pos = [], uv = [], idx = []; let dist = 0;
    const passos = [];
    for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 1.2)); for (let k = 0; k < n + (i === pts.length - 2 ? 1 : 0); k++) passos.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]); }
    passos.forEach(([x, z], i) => {
      const [ax, az] = passos[Math.max(0, i - 1)], [bx, bz] = passos[Math.min(passos.length - 1, i + 1)];
      let tx = bx - ax, tz = bz - az; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      if (i) dist += Math.hypot(x - passos[i - 1][0], z - passos[i - 1][1]);
      for (const s of [-1, 1]) { const px = x - tz * s * larg / 2, pz = z + tx * s * larg / 2; pos.push(px, (o.y ?? .03) + (o.ground ? o.ground(px, pz) : 0), pz); uv.push(s < 0 ? 0 : 1, dist / larg); }
      if (i < passos.length - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const mat = o.brilha ? new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, fog: o.fog ?? true }) : new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide });
    mat.polygonOffset = true; mat.polygonOffsetFactor = -3; mat.polygonOffsetUnits = -12;
    return malha(p, g, mat);
  }
  // textura de pedras redondas (paralelepípedo) e de rachaduras que brilham
  const pedrinhas = (fundo, cores) => tela(64, 64, g => { g.fillStyle = fundo; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 8; y++) for (let x = 0; x < 6; x++) { g.fillStyle = cores[(R() * cores.length) | 0]; g.beginPath(); g.ellipse(x * 11 + (y % 2 ? 5 : 0) + 4, y * 8 + 4, 4.6 + R(), 3.2 + R() * .6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x * 11 + (y % 2 ? 5 : 0) + 2, y * 8 + 2, 4, 1); } }, { nitido: true, rep: [1, 1] });
  const rachado = (fundo, veio, n = 15) => tela(128, 128, g => {
    const pts = [...Array(n)].map(() => [R() * 128, R() * 128]), img = g.createImageData(128, 128);
    const a = hex(fundo), b = hex(veio), to = c => c.clone().convertLinearToSRGB(), A = to(a), B = to(b);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      let d1 = 1e9, d2 = 1e9;
      for (const [px, py] of pts) { let dx = Math.abs(x - px), dy = Math.abs(y - py); dx = Math.min(dx, 128 - dx); dy = Math.min(dy, 128 - dy); const d = Math.hypot(dx, dy); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
      const k = Math.pow(Math.max(0, 1 - (d2 - d1) / 9), 2), i = (y * 128 + x) * 4;
      img.data[i] = (A.r + (B.r - A.r) * k) * 255; img.data[i + 1] = (A.g + (B.g - A.g) * k) * 255; img.data[i + 2] = (A.b + (B.b - A.b) * k) * 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, { rep: [1, 1] });
  // relâmpago ao longe (fraco e raro, pra não incomodar quem tem sensibilidade a luz)
  function relampago(p, { de = Math.PI - 1, ate = Math.PI + 1, dist = 66, y = 20, alt = 26, cor = '#cdb8ff', cada = 7 }) {
    const raios = [0, 1, 2].map(() => {
      const t = tela(64, 128, g => { g.strokeStyle = '#fff'; g.lineCap = 'round'; const ramo = (x, yy, w, ate2) => { g.lineWidth = w; g.beginPath(); g.moveTo(x, yy); while (yy < ate2) { x += (R() - .5) * 18; yy += 5 + R() * 9; g.lineTo(x, yy); } g.stroke(); }; ramo(32, 0, 2.5, 128); ramo(26 + R() * 14, 30 + R() * 30, 1.2, 100); });
      const m = malha(p, new THREE.PlaneGeometry(alt * .5, alt), luz({ map: t, color: cor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); return m;
    });
    let prox = 2 + R() * 3, vida = 0, qual = 0;
    anima(dt => {
      prox -= dt;
      if (prox <= 0) { prox = cada * (.6 + R()); vida = .45; qual = (R() * 3) | 0; const a = de + R() * (ate - de); raios[qual].position.set(Math.sin(a) * dist, y, Math.cos(a) * dist); raios[qual].lookAt(p.position.x, y, p.position.z); E.later(.8 + R(), () => E.noiseHit(1.6, .09, 190)); }
      if (vida > 0) { vida -= dt; raios[qual].material.opacity = Math.max(0, vida / .45) * .85; } else raios[qual].material.opacity = 0;
    });
  }

  const tique = (dt, t) => { for (const f of vivos) f(dt, t); };
  const soltar = () => { for (const t of descartar) t.dispose(); };
  return { THREE, R, somDragao, set obra(v) { obra = v; }, funde, revoada, anima, tique, soltar, luz, solido, tela, manchas, brilho, malha, copias, ruido, fbm, rocha, ceu, serra, lua, castelo, dragao, voa, fogo, rugido, casinha, cogumelo, flores, capim, galhada, pinheiros, vagalumes, chao, estrada, pedrinhas, rachado, relampago, vivos };
}

// as bordas das áreas abertas
export const BORDAS = {
  mata: (cor = '#123a34', alt = 4.4) => (A, pts) => A.K.pinheiros(A.g, pts.length, i => [pts[i][0], pts[i][1] - .3, pts[i][2]], cor, alt),
  pedras: (cor = '#2c2a5e', brilha = '#0e0c2a') => (A, pts) => A.K.copias(A.g, A.K.rocha(1, .42, 1), A.K.solido(cor, { emissive: new A.K.THREE.Color(brilha) }), pts.length, (o, i) => { const [x, y, z, f] = pts[i]; o.position.set(x, y + .4, z); o.rotation.set(A.K.R() * .6, A.K.R() * 6, A.K.R() * .6); o.scale.set(.9 + A.K.R() * .5, 1.1 + A.K.R() * (1 + f), .9 + A.K.R() * .5); }),
};

/* ============ trilho: uma fase feita de vários trechos, um depois do outro ============
   cada trecho: { nome, placa, cor, chao: 'grass'|'wood'|'carpet', fog: [cor, densidade], caminho: [[x,z]...], larg,
                  clareiras: [[x,z,raio]], ground(x,z), yaw, monta(T) }
   monta(T) recebe: g (grupo do trecho, já na posição certa; use coordenadas locais), longe (grupo que acompanha o jogador:
   céu, lua, serras), K, anima, interage(w,h,d,x,y,z,label,fn), bloco(x,z,r), moeda(x,z)
   Só o trecho atual é desenhado e animado: leve no celular. */
export function trilho(E, L, K, trechos, destino) {
  const THREE = E.THREE, S = E.state;
  const passo = 400;                       // distância entre os trechos no mundo (nunca se enxergam: o céu fecha antes)
  const salvos = S.flags.trecho || (S.flags.trecho = {});
  let atual = 0, troca = null, saiu = false;
  const T = [], moedas = [];
  trechos.forEach((z, i) => {
    const g = new THREE.Group(); g.position.x = i * passo; E.add(g);
    const longe = new THREE.Group(); E.add(longe);
    const vivos = [];
    const larg = z.larg || 3.4;
    const t = { ...z, i, g, longe, vivos, larg, ox: i * passo, ground: z.ground || (() => 0), dicas: [], falas: {} };
    T.push(t);
  });
  const monta = t => {
    const antes = K.vivos.length;
    const A = {
      g: t.g, longe: t.longe, K, E, ox: t.ox, ground: t.ground, trecho: t,
      anima: fn => K.anima(fn),
      hemi: (ceu, terra, i) => { const h = new THREE.HemisphereLight(ceu, terra, i); h.position.set(-t.ox, 1, 0); t.g.add(h); return h; },
      sol: (cor, i, x, y, z) => { const d = new THREE.DirectionalLight(cor, i); d.position.set(x, y, z); t.g.add(d, d.target); return d; },
      ponto: (cor, i, alcance, x, y, z) => { const d = new THREE.PointLight(cor, i, alcance, 1.5); d.position.set(x, y, z); t.g.add(d); return d; },
      interage: (w, h, d, x, y, z, label, fn) => E.interact(E.hitbox(w, h, d, x, y, z, t.g), { label: () => S.dlg ? '' : '[E] ' + label, act: () => { if (!S.dlg) fn(); } }),
      bloco: (x, z, r) => E.circle(x + t.ox, z, r),
      moeda: (x, z) => moedas.push([x + t.ox, null, z, t.i]),
      fala: (id, quem) => { if (!t.falas[id]) { t.falas[id] = 1; return quem(); } },
      perto: (x, z, r) => Math.hypot(E.player.pos.x - t.ox - x, E.player.pos.z - z) < r,
      jogador: () => ({ x: E.player.pos.x - t.ox, z: E.player.pos.z }),
    };
    K.obra = { g: t.g, caminho: t.caminho, bloco: A.bloco };
    t.monta(A);
    // borda da área aberta: mata ou pedras bem à vista, pra nunca bater em parede invisível
    if (t.area && t.borda) {
      const [x0, x1, z0, z1] = t.area, pts = [];
      for (let fila = 0; fila < 3; fila++) {
        const fora = 1.1 + fila * 1.7, passo2 = 1.5 + fila * .3;
        for (let x = x0 - fora; x <= x1 + fora; x += passo2) pts.push([x, z0 - fora, fila], [x, z1 + fora, fila]);
        for (let z = z0 - fora + passo2; z < z1 + fora; z += passo2) pts.push([x0 - fora, z, fila], [x1 + fora, z, fila]);
      }
      const [fx, fz] = t.caminho[t.caminho.length - 1];
      const solo = t.ground, uso = pts.filter(([x, z]) => Math.hypot(x - fx, z - fz) > 4);
      t.borda(A, uso.map(([x, z, f]) => [x + (K.R() - .5) * .7, solo(x, z), z + (K.R() - .5) * .7, f]));
    }
    K.obra = null;
    t.vivos.push(...K.vivos.splice(antes));      // as animações deste trecho só rodam quando ele está na tela
    const fim = t.caminho[t.caminho.length - 1];
    const ant = t.caminho[t.caminho.length - 2];
    const ang = Math.atan2(fim[0] - ant[0], fim[1] - ant[1]);
    t.fim = new THREE.Vector3(fim[0] + t.ox, 1.2, fim[1]);
    const pt = E.portal(fim[0] + t.ox, fim[1], ang + Math.PI, t.placa, t.cor || '#9fd8ff');
    pt.position.y = t.ground(fim[0], fim[1]);
    t.portal = pt;
  };

  // caminhar só em cima do trilho (ou nas clareiras)
  const distSeg = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, k = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1))); return [Math.hypot(px - ax - dx * k, pz - az - dz * k), k]; };
  L.walkable = (x, z) => {
    const t = T[atual], lx = x - t.ox;
    if (t.livre) return t.livre(lx, z);
    if (t.area) { const [x0, x1, z0, z1] = t.area; return lx > x0 && lx < x1 && z > z0 && z < z1; }
    for (let i = 0; i < t.caminho.length - 1; i++) if (distSeg(lx, z, t.caminho[i], t.caminho[i + 1])[0] < t.larg / 2) return true;
    for (const [cx, cz, r] of t.clareiras || []) if (Math.hypot(lx - cx, z - cz) < r) return true;
    return false;
  };
  L.ground = (x, z) => { const i = Math.max(0, Math.min(T.length - 1, Math.round(x / passo))); return T[i].ground(x - T[i].ox, z); };

  const inicio = t => { const [x, z] = t.caminho[0], [bx, bz] = t.caminho[1]; return { x: x + t.ox, z, yaw: t.yaw ?? Math.atan2(-(bx - x), -(bz - z)) }; };
  const mostra = i => {
    atual = i;
    T.forEach((t, k) => { t.g.visible = t.longe.visible = k === i; if (t.portal) t.portal.visible = k === i; });
    const t = T[i];
    E.scene.fog = new THREE.FogExp2(t.fog[0], t.fog[1]);
    E.scene.background = new THREE.Color(t.fog[0]);
    L.floor = t.chao || 'grass';
    for (const m of L.coins || []) m.visible = m.userData.trecho === i && !(E.META && E.META.coins[m.userData.coin.id]);
    segue();
  };
  const segue = () => { const c = E.camera.position, t = T[atual]; t.longe.position.set(c.x, 0, c.z); };

  T.forEach(monta);
  E.moedas(moedas.map(m => m.slice(0, 3)));
  for (const m of L.coins || []) { const n = +m.userData.coin.id.split(':')[1]; m.userData.trecho = moedas[n][3]; }

  const guardado = Math.min(T.length - 1, salvos[L.id] || 0);   // "continuar" volta no trecho em que parou (a saída final apaga)
  L.spawn = inicio(T[guardado]);
  E.camera.position.set(L.spawn.x, 1.6, L.spawn.z);
  mostra(guardado);

  const anuncia = t => { E.osd('▶ PLAY', t.nome.toUpperCase() + ' · ??:??'); E.later(1.2, () => E.toast(`${t.nome}<small>siga o caminho · [H] dica</small>`)); if (t.pensa) E.later(5.5, () => E.say(t.pensa, 4.5)); };
  const vai = i => {
    salvos[L.id] = i; mostra(i);
    const s = inicio(T[i]);
    E.player.pos.set(s.x, 0, s.z); E.player.yaw = s.yaw; E.player.pitch = 0; E.player.camY = E.ground(s.x, s.z) + L.eye;
    E.camera.position.set(s.x, E.player.camY, s.z); segue();
    E.save(); anuncia(T[i]); T[i].entrou && T[i].entrou();
  };
  L.anuncia = () => anuncia(T[atual]);

  let tempo = 0;
  const passoTrilho = dt => {
    tempo += dt; segue();
    for (const f of T[atual].vivos) f(dt, tempo);
    if (troca) {
      troca.t += dt;
      E.post.fade.value = troca.t < .55 ? troca.t / .55 : Math.max(0, 1 - (troca.t - .7) / .8);
      if (!troca.foi && troca.t >= .6) { troca.foi = true; vai(troca.i); }
      if (troca.t > 1.5) { troca = null; E.post.fade.value = 0; }
    } else if (!S.trans) {
      const t = T[atual], p = E.player.pos;
      if (Math.hypot(p.x - t.fim.x, p.z - t.fim.z) < 1.15) {
        if (atual < T.length - 1) { troca = { t: 0, i: atual + 1, foi: false }; E.noiseHit(1.2, .22, 2600, null, 'highpass'); E.sfx.chime(); }
        else if (!saiu) { saiu = true; delete salvos[L.id]; E.goTo(destino); }
      }
    }
  };
  // dica: o passarinho segue os pontos do caminho que ainda faltam
  const dica = () => {
    const t = T[atual], p = E.player.pos; let melhor = 0, md = 1e9;
    for (let i = 0; i < t.caminho.length - 1; i++) { const d = distSeg(p.x - t.ox, p.z, t.caminho[i], t.caminho[i + 1])[0]; if (d < md) { md = d; melhor = i; } }
    const path = t.caminho.slice(melhor + 1).map(([x, z]) => new THREE.Vector3(x + t.ox, t.ground(x, z) + 1.4, z));
    return { text: `Siga o caminho até o portal: ${t.placa.replace(' →', '')}.`, path: path.slice(0, 5) };
  };
  return { passo: passoTrilho, dica, vai, get atual() { return atual; }, T, idle: () => { segue(); } };
}
