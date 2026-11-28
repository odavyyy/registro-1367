// O boné do Rosengo e o mapa em grade usado em Matagalé e na árvore do Passarex.
// A mesma grade decide colisão, visão, caminho e o desenho das duas dimensões.
//   '#' parede nas duas        '.' chão nas duas          'D' só abre do outro lado do boné
//   'k' só vira parede do outro lado                      '=' buraco aqui, ponte do outro lado
//   'x' buraco/água nas duas   'r' raízes e 't' tronco oco (esconderijos)
//   'p' passagem estreita (o Passarex não cabe)           'm' lama (devagar)
//   '1'..'9' portão fechado até alguma coisa abrir        outras letras: marcadores em chão normal
export const T = 2;
const RAIO = .3;

export function criaMapa(linhas) {
  const H = linhas.length, W = linhas[0].length;
  if (linhas.some(l => l.length !== W)) console.error('mapa torto: ' + linhas.map(l => l.length).join(','));
  const g = linhas.map(l => l.split('')), marcas = {};
  g.forEach((l, r) => l.forEach((ch, c) => { if (!'#.Dk=xrtpm123456789'.includes(ch)) { (marcas[ch] = marcas[ch] || []).push([c, r]); g[r][c] = '.'; } }));
  const M = { W, H, g, marcas };
  M.at = (c, r) => (r < 0 || c < 0 || r >= H || c >= W ? '#' : g[r][c]);
  M.set = (c, r, ch) => { g[r][c] = ch; };
  M.pos = (c, r) => ({ x: (c - W / 2 + .5) * T, z: (r - H / 2 + .5) * T });
  M.cel = (x, z) => [Math.floor(x / T + W / 2), Math.floor(z / T + H / 2)];
  M.marca = ch => { const m = marcas[ch] && marcas[ch][0]; return m ? M.pos(m[0], m[1]) : { x: 0, z: 0 }; };
  // quem: 'jog' (o jogador) ou 'px' (o Passarex, que não passa nas estreitas)
  M.parede = (c, r, dim, quem = 'jog') => {
    const ch = M.at(c, r);
    if (ch === '#' || ch === 'x' || (ch >= '1' && ch <= '9')) return true;
    if (ch === 'D' || ch === '=') return !dim;
    if (ch === 'k') return !!dim;
    return ch === 'p' && quem === 'px';
  };
  M.cegueira = (c, r, dim) => { const ch = M.at(c, r); return ch !== 'x' && ch !== '=' && M.parede(c, r, dim); };   // buraco não tapa a visão
  M.anda = (x, z, dim) => {
    for (const [dx, dz] of [[0, 0], [RAIO, RAIO], [-RAIO, RAIO], [RAIO, -RAIO], [-RAIO, -RAIO]]) { const [c, r] = M.cel(x + dx, z + dz); if (M.parede(c, r, dim)) return false; }
    return true;
  };
  M.ve = (ax, az, bx, bz, dim = false) => {
    const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / .35);
    for (let i = 1; i < n; i++) { const [c, r] = M.cel(ax + (bx - ax) * i / n, az + (bz - az) * i / n); if (M.cegueira(c, r, dim)) return false; }
    return true;
  };
  // caminho em casas (4 direções). Sem caminho: vai até a casa alcançável mais perto do alvo.
  M.caminho = (de, para, dim = false, quem = 'px') => {
    const key = (c, r) => r * W + c, ant = new Map([[key(de[0], de[1]), null]]), fila = [de];
    let melhor = de, md = Math.abs(de[0] - para[0]) + Math.abs(de[1] - para[1]);
    for (let i = 0; i < fila.length && md > 0; i++) {
      const [c, r] = fila[i];
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (ant.has(k) || M.parede(nc, nr, dim, quem)) continue;
        ant.set(k, [c, r]); fila.push([nc, nr]);
        const d = Math.abs(nc - para[0]) + Math.abs(nr - para[1]); if (d < md) { md = d; melhor = [nc, nr]; }
      }
    }
    const out = [];
    for (let p = melhor; p && (p[0] !== de[0] || p[1] !== de[1]); p = ant.get(key(p[0], p[1]))) out.unshift(p);
    out.chegou = md === 0;
    return out;
  };
  M.alcance = (de, dim = false, quem = 'px') => {
    const vis = new Set([de[1] * W + de[0]]), fila = [de];
    for (let i = 0; i < fila.length; i++) for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = fila[i][0] + dc, r = fila[i][1] + dr, k = r * W + c;
      if (!vis.has(k) && !M.parede(c, r, dim, quem)) { vis.add(k); fila.push([c, r]); }
    }
    return fila;
  };
  return M;
}

/* Desenho do mapa. est: { parede(grupo, instâncias), tema:{...} } */
export function desenhaMapa(E, L, M, tema) {
  const { THREE, lam, basic } = E, rnd = E.rnd;
  const raiz = E.add(new THREE.Group()), soN = new THREE.Group(), soD = new THREE.Group(), sempre = new THREE.Group();
  raiz.add(sempre, soN, soD); soD.visible = false;
  const portoes = {}, chaoN = lam({ color: tema.chao, map: tema.chaoTex || null });
  const plano = (w, h, mat, x, y, z, pai) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); pai.add(m); return m; };
  const chao = plano(M.W * T + 20, M.H * T + 20, chaoN, 0, 0, 0, sempre);
  if (chaoN.map) { chaoN.map.repeat.set(M.W + 10, M.H + 10); chao.material = chaoN; }

  // paredes comuns: um InstancedMesh só (centenas de casas, um desenho)
  const comuns = [];
  for (let r = 0; r < M.H; r++) for (let c = 0; c < M.W; c++) {
    if (M.at(c, r) !== '#') continue;
    let borda = false; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (M.at(c + dc, r + dr) !== '#') borda = true;
    if (borda) comuns.push([c, r]);
  }
  const geo = tema.geoParede(), inst = new THREE.InstancedMesh(geo, tema.matParede, comuns.length), obj = new THREE.Object3D();
  comuns.forEach(([c, r], i) => { const p = M.pos(c, r); obj.position.set(p.x, tema.alturaParede / 2, p.z); obj.rotation.y = tema.giraParede ? Math.floor(rnd() * 4) * Math.PI / 2 : 0; obj.scale.set(1, .92 + rnd() * .16, 1); obj.updateMatrix(); inst.setMatrixAt(i, obj.matrix); });
  inst.instanceMatrix.needsUpdate = true; inst.computeBoundingSphere(); sempre.add(inst);

  const bloco = (p, mat, pai) => { const m = new THREE.Mesh(tema.geoParede(), mat); m.position.set(p.x, tema.alturaParede / 2, p.z); pai.add(m); return m; };
  const fantasma = new THREE.MeshBasicMaterial({ color: 0xb080ff, transparent: true, opacity: .13, depthWrite: false, fog: false });
  const paredeD = tema.matParedeD, ponteM = basic({ color: 0x9a6ae8 }), bordaM = basic({ color: 0xd8b0ff, fog: false });
  const especiais = [];
  function casa(c, r) {
    const ch = M.at(c, r), p = M.pos(c, r), gr = [];
    const add = (o, pai) => { pai.add(o); gr.push(o); return o; };
    if (ch >= '1' && ch <= '9') { const m = bloco(p, tema.matPortao ? tema.matPortao(ch) : tema.matParede, sempre); gr.push(m); (portoes[ch] = portoes[ch] || []).push({ c, r, m }); }
    else if (ch === 'D') {   // aqui: parede igual às outras. Do outro lado: um vão com a moldura brilhando
      gr.push(bloco(p, tema.matParede, soN));
      add(plano(T * .9, T * .9, fantasma, p.x, .03, p.z, soD), soD);
      for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, T), bordaM); b.position.set(p.x + s * T * .47, 2.3, p.z); add(b, soD); }
    } else if (ch === 'k') { gr.push(bloco(p, paredeD, soD)); }
    else if (ch === 'x' || ch === '=') {
      add(plano(T, T, tema.matBuraco, p.x, .015, p.z, sempre), sempre);
      if (ch === '=') {
        add(plano(T * .9, T * 1.02, ponteM, p.x, .05, p.z, soD), soD);
        for (let k = 0; k < 4; k++) { const t = plano(T * .86, .06, bordaM, p.x, .06, p.z - T / 2 + .25 + k * .5, soD); gr.push(t); }
      }
    } else if (ch === 'm') add(plano(T * .98, T * .98, tema.matLama || basic({ color: 0x2a1a10 }), p.x, .02, p.z, sempre), sempre);
    else if (ch === 'p') {   // raízes em arco: você passa abaixado entre elas, ele não
      const rm = tema.matRaiz;
      const vertical = !M.parede(c, r - 1, false) || !M.parede(c, r + 1, false);
      for (let k = -1; k <= 1; k += 2) {
        const a = new THREE.Mesh(new THREE.BoxGeometry(vertical ? .28 : .16, 2.3, vertical ? .16 : .28), rm);
        a.position.set(p.x + (vertical ? k * .86 : .3 * k), 1.15, p.z + (vertical ? .3 * k : k * .86)); a.rotation.set(vertical ? 0 : k * .1, 0, vertical ? k * .14 : 0); add(a, sempre);
      }
      const top = new THREE.Mesh(new THREE.BoxGeometry(vertical ? T : .3, .35, vertical ? .3 : T), rm); top.position.set(p.x, 2.15, p.z); add(top, sempre);
    }
    if (gr.length) especiais.push({ c, r, gr });
  }
  for (let r = 0; r < M.H; r++) for (let c = 0; c < M.W; c++) if (!'#.rt'.includes(M.at(c, r))) casa(c, r);
  return {
    raiz, soN, soD, sempre, inst,
    // troca o tipo de uma casa com o jogo rodando (abrir portão, revelar passagem)
    troca(c, r, ch) { for (let i = especiais.length - 1; i >= 0; i--) if (especiais[i].c === c && especiais[i].r === r) { for (const o of especiais[i].gr) o.removeFromParent(); especiais.splice(i, 1); } M.set(c, r, ch); if (ch !== '.') casa(c, r); },
    abre(num) { for (const g of portoes[num] || []) { this.troca(g.c, g.r, '.'); } portoes[num] = []; },
  };
}

/* O boné: troca de dimensão. cfg: { M, D (desenho), tem(), ceuN, ceuD, nevoaN, nevoaD, pode(dim), aoTrocar(dim) } */
export function criaBone(E, L, cfg) {
  const { THREE, $ } = E, S = E.state;
  const B = { dim: false, espera: 0, lista: [], fixos: [] };
  const veu = document.createElement('div');
  veu.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at 50% 50%,rgba(120,60,200,.06) 35%,rgba(110,40,190,.55) 100%)';
  $('wrap').appendChild(veu);
  // o que dá pra mirar (e o que tapa a mira) muda junto com a dimensão
  B.interact = (obj, quando, it) => { obj.userData.it = it; B.lista.push({ obj, quando }); B.aplica(); return obj; };
  B.some = obj => { B.lista = B.lista.filter(e => e.obj !== obj); B.aplica(); };
  B.aplica = () => {
    const d = B.dim;
    cfg.D.soN.visible = !d; cfg.D.soD.visible = d;
    L.interactables = B.lista.filter(e => e.quando === '*' || (e.quando === 'D') === d).map(e => e.obj);
    L.occluders = [cfg.D.inst, ...[...cfg.D.sempre.children, ...(d ? cfg.D.soD : cfg.D.soN).children].filter(o => o.isMesh && o.geometry.type === 'BoxGeometry')];
    E.scene.background = new THREE.Color(d ? cfg.ceuD : cfg.ceuN);
    E.scene.fog = new THREE.FogExp2(d ? cfg.ceuD : cfg.ceuN, d ? cfg.nevoaD : cfg.nevoaN);
    veu.style.opacity = d ? 1 : 0;
  };
  B.poe = d => { B.dim = d; B.aplica(); };
  B.trocar = () => {
    if (!cfg.tem() || B.espera > 0 || S.dlg || S.noteOpen || S.choosing || S.dead || S.trans || S.ended || (E.invAberto && E.invAberto())) return false;
    const alvo = !B.dim, p = E.player.pos;
    const nao = (cfg.pode && cfg.pode(alvo)) || (!cfg.M.anda(p.x, p.z, alvo) ? (alvo ? '(Do outro lado tem uma coisa bem aqui. Não dá pra trocar neste lugar.)' : '(Se eu voltar agora, caio no buraco ou fico dentro da madeira.)') : null);
    if (nao) { E.say(nao, 2.6); E.tone(140, .15, .05, 'square'); B.espera = .5; return false; }
    B.poe(alvo); B.espera = 1.1;
    L.glitchT = .35;
    E.tone(alvo ? 220 : 660, .5, .06, 'triangle', null, 0, 0, alvo ? 880 : 180); E.noiseHit(.35, .16, alvo ? 1800 : 600, null, 'bandpass');
    cfg.aoTrocar && cfg.aoTrocar(alvo);
    return true;
  };
  B.tick = dt => { if (B.espera > 0) B.espera -= dt; };
  B.sai = () => veu.remove();
  L.onCap = () => B.trocar();
  L.temBone = () => cfg.tem();
  return B;
}
