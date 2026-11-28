// A ÁRVORE DO PASSAREX · exploração furtiva com o boné, a RataBrumga, o resgate do Serjão e a fuga.
// Aqui o tom é sério: pouca luz, ele ronda de verdade, ouve, procura e persegue.
import { criaMapa, desenhaMapa, criaBone, T } from './bone.js';
import { EXPLORA, FUGA } from './arvore-mapas.js';
import { lutar } from './boss.js';

const FORCA_LANTERNA = 34;   // subir se ainda estiver escuro demais
const ORDEM = ['c', 'a', 'b'];   // BRASA, FOLHA, OSSO
const SELOS = { a: ['FOLHA', 0x4ab04a], b: ['OSSO', 0xe8e0c8], c: ['BRASA', 0xe8582a] };
const CHECK = [null, [10, 28], [10, 18], [10, 7]];   // 0 = a entrada (S)

export function build(E, L) {
  const { THREE, lam, basic } = E, S = E.state, rnd = E.rnd;
  E.seed(6767);
  const Q = S.flags.centro = S.flags.centro || { st: 1, found: {} };
  if (!Q.mata || Q.mata < 2) Q.mata = 2;
  const A = Q.arv = Q.arv || { selos: [], cp: 0 };
  const FUGINDO = Q.mata === 4;
  const M = criaMapa(FUGINDO ? FUGA : EXPLORA);
  if (!FUGINDO) {   // o que já foi aberto continua aberto
    const abre = n => M.g.forEach((l, r) => l.forEach((ch, c) => { if (ch === n) M.set(c, r, '.'); }));
    if (A.p1) abre('1'); if (A.p2) abre('2'); if (A.p3) abre('3'); if (Q.mata >= 3) abre('4');
  }
  E.camera.far = 60;
  L.semAssombro = true;   // aqui dentro só existe o Passarex de verdade
  L.objetivo = () => Q.mata === 4 ? 'Tire o Serjão da árvore. Não pare.' : Q.mata >= 3 ? 'Encontre o Serjão.' : A.p3 ? 'Siga em frente. Tem alguma coisa se mexendo lá dentro.' : A.p2 ? 'Abra o caminho da galeria que muda.' : A.p1 ? 'Passe pelo segundo portão sem ser visto.' : 'Ache um jeito de subir pela árvore sem ser visto.';
  L.floor = 'wood'; L.speed = 2.1; L.eye = 1.55; L.reach = 2.4;
  E.osd('<span class="rec">● REC</span>', FUGINDO ? 'A ÁRVORE · SAIA DAÍ' : 'A ÁRVORE DO PASSAREX');
  L.clock = t => (Math.floor(t * 2) % 7 === 0 ? '??' : '03') + ':67';

  /* ---------------- o lado de dentro da árvore ---------------- */
  const casca = E.canvasTex(32, 48, (g, w, h) => { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 3) { g.fillStyle = ['#1a0f08', '#3a2616', '#231509'][(x / 3) % 3]; g.fillRect(x + (rnd() * 2 | 0), 0, 1 + (rnd() * 2 | 0), h); } E.speckle(g, w, h, 160, ['#120a05', '#46301a', '#1e2a14']); });
  const chaoT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#4a3220'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 240, ['#3a2616', '#5a3e28', '#2a1a0e', '#3a3a1a']); });
  chaoT.wrapS = chaoT.wrapT = THREE.RepeatWrapping;
  const raizM = lam({ color: 0x4a2e1a });
  const D = desenhaMapa(E, L, M, {
    chao: 0xffffff, chaoTex: chaoT, alturaParede: 3.5, giraParede: true,
    geoParede: () => new THREE.BoxGeometry(T, 3.5, T),
    matParede: lam({ map: casca }), matParedeD: lam({ color: 0x5a2a7a, map: casca }), matRaiz: raizM,
    matPortao: () => lam({ color: 0x8a5a30, map: casca }),
    matBuraco: basic({ color: 0x000000 }), matLama: lam({ color: 0x1e1206 }),
  });
  { const teto = E.add(new THREE.Mesh(new THREE.PlaneGeometry(M.W * T + 8, M.H * T + 8), lam({ color: 0x1a100a }))); teto.rotation.x = Math.PI / 2; teto.position.y = 3.52; }
  E.add(new THREE.HemisphereLight(0x7a6a88, 0x24160c, FUGINDO ? 1.15 : .8));
  const lampiao = E.add(new THREE.PointLight(0xffd49a, 13, 13, 1.5));
  // cogumelos que brilham: pouca luz, mas dá pra se orientar
  { const gm = basic({ color: 0x6affc0 }), g = new THREE.SphereGeometry(.07, 5, 4);
    for (let r = 1; r < M.H - 1; r++) for (let c = 1; c < M.W - 1; c++) if (M.at(c, r) === '#' && rnd() < .09) {
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (M.at(c + dc, r + dr) === '.') { const p = M.pos(c, r); for (let k = 0; k < 4; k++) { const m = E.add(new THREE.Mesh(g, gm)); m.position.set(p.x + dc * 1.03 + (dr ? rnd() - .5 : 0), .25 + rnd() * .5, p.z + dr * 1.03 + (dc ? rnd() - .5 : 0)); } break; }
    } }

  L.walkable = (x, z) => M.anda(x, z, bone.dim);
  { const cp = !FUGINDO && CHECK[A.cp], s = cp ? M.pos(cp[0], cp[1]) : M.marca('S'); L.spawn = { x: s.x, z: s.z, yaw: FUGINDO ? Math.PI : 0 }; }
  const livreIA = () => !(S.dlg || S.choosing || S.noteOpen || S.dead || S.trans || S.ended || S.painting || (E.invAberto && E.invAberto()));

  const bone = criaBone(E, L, {
    M, D, tem: () => Q.mata >= 2 && Q.mata < 6,
    ceuN: 0x070403, ceuD: 0x1a0630, nevoaN: FUGINDO ? .085 : .115, nevoaD: FUGINDO ? .085 : .105,
    pode: alvo => FUGINDO && serj && !M.anda(serj.obj.position.x, serj.obj.position.z, alvo) ? 'SERJÃO: Peraí! Se virar agora eu fico no vazio!' : null,
    aoTrocar: alvo => { lampiao.color.set(alvo ? 0xc090ff : 0xffd49a); if (FUGINDO) { if (caca) caca.furia = 3; E.whistle(.07); } else px && px.sentiu(E.player.pos); },
  });

  /* ---------------- o HUD da tensão ---------------- */
  const hud = document.createElement('div');
  hud.style.cssText = "position:absolute;left:50%;top:6%;transform:translateX(-50%);z-index:3;pointer-events:none;font-family:'VT323',monospace;color:#ece6cf;text-align:center;font-size:3vmin;text-shadow:0 0 5px #000;width:46%";
  hud.innerHTML = '<div class="est"></div><div class="bar" style="height:.55em;border:1px solid rgba(236,230,207,.45);margin:.15em auto;width:70%"><i style="display:block;height:100%;width:0;background:#e8c84a"></i></div>';
  E.$('wrap').appendChild(hud);
  hud.querySelector('.bar').style.visibility = 'hidden';
  const hudEst = hud.querySelector('.est'), hudBar = hud.querySelector('.bar'), hudI = hud.querySelector('i');
  let ultHud = '';
  const poeHud = (txt, k, cor) => { if (txt !== ultHud) { hudEst.textContent = txt; ultHud = txt; } hudBar.style.visibility = k > .02 ? 'visible' : 'hidden'; hudI.style.width = Math.min(100, k * 100) + '%'; hudI.style.background = cor; };

  /* ---------------- o Passarex em pé no mundo ---------------- */
  function bicho(alt) {
    const o = E.sticker(alt, { eyes: true, s: .14 }); E.add(o);
    const lz = new THREE.PointLight(0xffe0a0, 2.2, 4, 1.6); lz.position.set(0, alt * .8, .3); o.add(lz);
    // os olhos acesos atravessam o escuro: dá pra ver de longe que ele está ali
    const pc = E.passarexCanvas(.14, {}), PE = window.PX_EYE, larg = alt * pc.pw / pc.ph, base = alt / 2 - alt * (pc.ph - pc.oy) / pc.ph;
    const halo = E.canvasTex(16, 16, g => { const rg = g.createRadialGradient(8, 8, 0, 8, 8, 8); rg.addColorStop(0, '#fff'); rg.addColorStop(.3, '#ffe6a0'); rg.addColorStop(1, 'rgba(255,180,60,0)'); g.fillStyle = rg; g.fillRect(0, 0, 16, 16); });
    const hm = new THREE.MeshBasicMaterial({ map: halo, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
    for (const sx of [PE.lx, PE.rx]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(.22, .22), hm); e.position.set((pc.ox + sx * pc.s - pc.pw / 2) / pc.pw * larg, base + (pc.ph / 2 - (pc.oy + PE.y * pc.s)) / pc.ph * alt, .03); o.add(e); }
    return o;
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  let coracaoT = 0;
  function coracao(dt, d) {
    coracaoT -= dt;
    if (d < 13 && coracaoT <= 0) { coracaoT = .35 + d / 13 * .85; const v = .13 * (1 - d / 15); E.tone(58, .14, v, 'sine'); E.tone(50, .16, v * .8, 'sine', null, .17); }
  }
  // anda por um caminho de casas; devolve true quando chegou
  function andaAte(pos, cam, v, dt) {
    let passo = v * dt;
    while (passo > 0 && cam.length) {
      const q = M.pos(cam[0][0], cam[0][1]), dx = q.x - pos.x, dz = q.z - pos.z, l = Math.hypot(dx, dz);
      if (l <= passo) { pos.x = q.x; pos.z = q.z; passo -= l; cam.shift(); } else { pos.x += dx / l * passo; pos.z += dz / l * passo; return false; }
    }
    return !cam.length;
  }

  let px = null, caca = null, serj = null, esconderijo = null;
  let falha = null;   // limpa a tela de falha da fuga
  L.exit = () => { bone.sai(); hud.remove(); falha && falha(); };

  if (FUGINDO) montaFuga(); else montaExploracao();

  /* ==================================================================================== EXPLORAÇÃO */
  function montaExploracao() {
    const abre = n => { D.abre(n); bone.aplica(); E.noiseHit(1.1, .3, 220); E.tone(70, 1, .07, 'sawtooth', null, 0, 0, 40); };
    const ponto = (obj, quando, label, act) => bone.interact(obj, quando, { label: () => S.dlg || S.choosing || esconderijo ? '' : label(), act: () => { if (!S.dlg && !S.choosing && !esconderijo) act(); } });
    const placa = (txt, cor, w = 64, h = 24) => E.canvasTex(w, h, g => { g.fillStyle = '#160c06'; g.fillRect(0, 0, w, h); g.fillStyle = cor; g.font = 'bold 7px monospace'; g.textAlign = 'center'; txt.split('|').forEach((t, i) => g.fillText(t, w / 2, 9 + i * 9)); });
    const cp = n => { if (n > A.cp) { A.cp = n; E.save(); } };

    /* esconderijos: raízes e troncos ocos */
    for (let r = 0; r < M.H; r++) for (let c = 0; c < M.W; c++) {
      const ch = M.at(c, r); if (ch !== 'r' && ch !== 't') continue;
      const p = M.pos(c, r);
      if (ch === 'r') for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28, m = E.add(new THREE.Mesh(new THREE.TorusGeometry(.78, .07, 5, 9, Math.PI * .62), raizM)); m.position.set(p.x, .02, p.z); m.rotation.set(0, a, 0); }
      else { const tr = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.86, .86, 1.7, 11, 1, true), lam({ color: 0x6a4424, map: casca, side: THREE.DoubleSide }))); tr.rotation.z = Math.PI / 2; tr.position.set(p.x, .52, p.z); }
      const nome = ch === 'r' ? 'as raízes' : 'o tronco oco', hb = E.hitbox(1.3, 1, 1.3, p.x, .45, p.z);
      bone.interact(hb, '*', { label: () => esconderijo ? '[E] Sair' : S.dlg ? '' : `[E] Entrar n${nome}`, act: () => esconderijo ? sai() : entra(p) });
    }
    function entra(p) {
      if (S.dlg || esconderijo) return;
      const volta = { x: E.player.pos.x, z: E.player.pos.z };
      esconderijo = { volta, visto: px.vendo };
      E.player.pos.set(p.x, 0, p.z); L.speed = 0; L.eye = .62; E.noiseHit(.3, .1, 900);
    }
    function sai() {
      if (!esconderijo) return;
      E.player.pos.set(esconderijo.volta.x, 0, esconderijo.volta.z); esconderijo = null; L.speed = 2.1; L.eye = 1.55; E.noiseHit(.25, .08, 900);
    }
    L.onEmpty = () => { if (esconderijo) sai(); };

    /* puzzle 1: a alavanca que só existe do outro lado abre o portão de baixo */
    { const p = M.marca('A'), base = new THREE.Mesh(new THREE.BoxGeometry(.5, .25, .5), basic({ color: 0x6a3a9a })), cabo = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1, 6), basic({ color: 0xe0b0ff, fog: false }));
      base.position.set(p.x, .13, p.z); cabo.position.set(p.x, .65, p.z); cabo.rotation.z = A.p1 ? -.7 : .7; D.soD.add(base, cabo);
      ponto(E.hitbox(1, 1.4, 1, p.x, .7, p.z), 'D', () => A.p1 ? 'A alavanca já foi puxada' : '[E] Puxar a alavanca', () => {
        if (A.p1) return; A.p1 = 1; cabo.rotation.z = -.7; abre('1'); E.save(); E.toast('Um portão abriu<small>no fim do corredor do norte</small>'); px.sentiu(E.player.pos);
      }); }
    // a escrita da entrada ensina o boné
    { const p = M.pos(10, 29), s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, .6), basic({ map: placa('O QUE ABRE|NÃO ESTÁ AQUI', '#c8a070') }))); s.position.set(p.x, 2.3, p.z + 1.02); if (A.p1) s.visible = false; L.placa1 = s; }

    /* puzzle 2: a manivela está do outro lado; o guincho, deste */
    { const p = M.marca('M'), grp = new THREE.Group(); grp.position.set(p.x, .75, p.z);
      const m = basic({ color: 0xffd86a, fog: false }); const eixo = new THREE.Mesh(new THREE.BoxGeometry(.5, .07, .07), m), pega = new THREE.Mesh(new THREE.BoxGeometry(.07, .3, .07), m), anel = new THREE.Mesh(new THREE.TorusGeometry(.13, .04, 5, 10), m);
      eixo.position.x = 0; pega.position.set(.25, -.15, 0); anel.position.x = -.33; grp.add(eixo, pega, anel); D.soD.add(grp); grp.visible = !A.manivela; L.manivela = grp;
      const hb = E.hitbox(1, 1.3, 1, p.x, .7, p.z);
      ponto(hb, 'D', () => A.manivela ? '' : '[E] Pegar a manivela', () => { if (A.manivela) return; A.manivela = 1; grp.visible = false; E.sfx.pick(); E.save(); E.toast('Manivela<small>ela é de um guincho do lado de cá</small>'); });
    }
    { const p = M.marca('G'), grp = new THREE.Group(); grp.position.set(p.x, 0, p.z - .62);
      const tambor = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .8, 10), lam({ color: 0x8a8a94 })); tambor.rotation.z = Math.PI / 2; tambor.position.y = .9;
      const pe = new THREE.Mesh(new THREE.BoxGeometry(.9, .75, .35), lam({ color: 0x3a2616 })); pe.position.y = .38;
      const cabo = new THREE.Mesh(new THREE.BoxGeometry(.05, 2, .05), lam({ color: 0xb8905a })); cabo.position.set(.3, 1.9, 0); grp.add(tambor, pe, cabo); D.soN.add(grp);
      ponto(E.hitbox(1.2, 1.5, .7, p.x, .8, p.z - .62), 'N', () => A.p2 ? 'O guincho já girou' : A.manivela ? '[E] Encaixar a manivela e girar' : '[E] Guincho', () => {
        if (A.p2) return;
        if (!A.manivela) return E.say('(Um guincho preso no portão. Falta a manivela. Aqui deste lado não tem.)', 4);
        A.p2 = 1; delete A.manivela; for (let k = 0; k < 6; k++) E.later(k * .18, () => E.noiseHit(.08, .2, 1500, null, 'highpass')); E.later(1.1, () => abre('2')); E.save(); E.toast('O portão subiu<small>ele ouviu o barulho</small>'); px.ouviu(E.player.pos, 1);
      }); }

    /* puzzle 3: três selos de seiva; a ordem só aparece do outro lado */
    const selos = {};
    for (const ch of ['a', 'b', 'c']) {
      const [nome, cor] = SELOS[ch], p = M.marca(ch), cel = M.marcas[ch][0];
      // o selo encosta na parede de cima ou de baixo
      const zp = M.at(cel[0], cel[1] - 1) === '#' ? -.9 : .9;
      const disco = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .14, 12), basic({ color: cor })); disco.rotation.x = Math.PI / 2; disco.position.set(p.x, 1.25, p.z + zp); D.soN.add(disco);
      const nm = new THREE.Mesh(new THREE.PlaneGeometry(.9, .3), basic({ map: E.canvasTex(36, 12, g => { g.fillStyle = '#160c06'; g.fillRect(0, 0, 36, 12); g.fillStyle = '#ffe9a8'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText(nome, 18, 9); }), side: THREE.DoubleSide })); nm.position.set(p.x, 1.85, p.z + zp * .98); D.soN.add(nm);
      selos[ch] = disco;
      ponto(E.hitbox(1, 1.2, .5, p.x, 1.25, p.z + zp), 'N', () => A.p3 || A.selos.includes(ch) ? 'Selo aceso' : `[E] Apertar o selo ${nome}`, () => {
        if (A.p3 || A.selos.includes(ch)) return;
        if (ch !== ORDEM[A.selos.length]) {
          A.selos = []; pintaSelos(); E.tone(90, .8, .1, 'sawtooth'); E.noiseHit(.6, .35, 500); L.glitchT = .5;
          E.say('(A seiva ferveu e apagou tudo. Ordem errada. E fez um barulhão.)', 4); px.ouviu(E.player.pos, 1); E.save(); return;
        }
        A.selos.push(ch); pintaSelos(); E.tone(330 + A.selos.length * 140, .5, .07, 'triangle'); E.save();
        if (A.selos.length === 3) { A.p3 = 1; E.later(.8, () => { abre('3'); E.toast('O caminho do ninho abriu<small>no meio da galeria de cima</small>'); E.save(); }); }
      });
    }
    function pintaSelos() { for (const ch in selos) { const on = A.p3 || A.selos.includes(ch); selos[ch].scale.setScalar(on ? 1.25 : 1); selos[ch].material.color.set(on ? 0xffffff : SELOS[ch][1]); } }
    pintaSelos();
    { const p = M.marca('g'), tx = E.canvasTex(96, 48, g => { g.fillStyle = '#1a0a30'; g.fillRect(0, 0, 96, 48); g.fillStyle = '#e8c8ff'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('PRIMEIRO A BRASA', 48, 13); g.fillText('DEPOIS A FOLHA', 48, 26); g.fillText('POR ÚLTIMO O OSSO', 48, 39); });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .95), new THREE.MeshBasicMaterial({ map: tx, fog: false })); s.position.set(p.x, 1.7, p.z + .92); s.rotation.y = Math.PI; D.soD.add(s);
      ponto(E.hitbox(1.9, 1, .3, p.x, 1.7, p.z + .88), 'D', () => '[E] Ler a escrita', () => E.say('(“Primeiro a brasa. Depois a folha. Por último o osso.” Alguém cozinhou aqui.)', 5)); }

    /* a RataBrumga no ninho */
    const ratLugar = M.marca('Z');
    let rata = null;
    if (Q.mata < 3) { rata = E.add(E.club('ratabrumga', 1.5)); rata.position.set(ratLugar.x, 0, ratLugar.z - 1.6); }
    { const qm = lam({ color: 0xe8b030 }); for (let i = 0; i < 14; i++) { const m = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.22 + rnd() * .2, .22 + rnd() * .2, .2, 3), qm)); m.position.set(ratLugar.x + (rnd() - .5) * 20, .1, ratLugar.z + (rnd() - .5) * 6); m.rotation.y = rnd() * 6; } }
    let lutando = false;
    function lutaRata() {
      lutando = true; bone.poe(false); sai(); px.some();
      E.glitchText('SAI DA TERRA', .8); E.gritoOutro(.45);
      E.conversa([['RATABRUMGA', 'Olha o que veio parar na minha despensa... com o BONÉ do rosado na cabeça.', '#c8c8c8'], ['VOCÊ', 'Esse boné é emprestado.'], ['RATABRUMGA', 'Agora é meu. De novo. E o queijo também é meu. Tudo é meu!', '#c8c8c8']])
        .then(() => lutar(E, { chefe: 'rata' }))
        .then(() => {
          Q.mata = 3; A.cp = 3; rata && rata.removeFromParent(); rata = null; E.save(); abre('4');
          E.toast('RataBrumga fugiu<small>o caminho do norte abriu · [H] dica</small>');
          E.later(2, () => E.say('(Lá de cima vem um cheiro de carvão.)', 4));
        });
    }

    /* o Serjão preso */
    const jp = M.marca('J');
    const preso = E.add(E.club('serjao', 1.85)); preso.position.set(jp.x, 0, jp.z - .7);
    const jaula = E.add(new THREE.Group());
    for (let i = -4; i <= 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.05, .08, 3.4, 5), raizM); b.position.set(jp.x + i * .3, 1.7, jp.z + .1 + Math.abs(i) * -.03); b.rotation.z = Math.sin(i * 2.3) * .07; jaula.add(b); }
    { const lz = E.add(new THREE.PointLight(0xff9040, 5, 6, 1.5)); lz.position.set(jp.x, 2.4, jp.z + .6); }
    E.solid(jp.x - 1.4, jp.x + 1.4, jp.z - .3, jp.z + .25);
    let soltando = false;
    ponto(E.hitbox(2.6, 2.2, .4, jp.x, 1.2, jp.z + .3), '*', () => Q.mata === 3 && !soltando ? '[E] Serjão!' : '', async () => {
      if (Q.mata !== 3 || soltando) return; soltando = true;
      if (bone.dim) bone.poe(false);
      const SJ = '#ffb070';
      await E.conversa([
        ['VOCÊ', 'Serjão?'],
        ['SERJÃO', 'Boa noite, boa noite... falando baixinho hoje.', SJ],
        ['SERJÃO', 'Ele quer que eu asse pra ele. Só que não pede. Fica olhando. Sem pedido, não tem espeto. É a regra.', SJ],
        ['VOCÊ', 'O Rosengo me mandou.'],
        ['SERJÃO', 'O rosado dos sessenta e sete palitos? Esse é cliente.', SJ],
        ['VOCÊ', 'Segura firme. Vou quebrar essas raízes.'],
        ['SERJÃO', 'Vai devagar. Ele escuta até a brasa estalando. E olha, eu não aguento um peteleco dele.', SJ],
      ]);
      jaula.visible = false; E.noiseHit(.9, .5, 900); E.tone(60, .6, .1, 'sawtooth', null, 0, 0, 35);
      E.later(.9, () => { E.whistle(.16); E.flash(); L.glitchT = 1.4; E.glitchText('ELE OUVIU', .9); });
      E.later(2.3, async () => {
        await E.conversa([['SERJÃO', '...Eu falei devagar.', SJ], ['VOCÊ', 'CORRE!']]);
        Q.mata = 4; bone.poe(false); E.save(); E.goTo('arvore');
      });
    });

    px = criaCacador();
    let entrou = false;
    L.enter = () => {
      if (entrou) return; entrou = true;
      E.later(1, () => E.toast(A.cp ? 'A árvore<small>continuando de onde parou</small>' : 'A árvore do Passarex<small>ande devagar · esconda-se nas raízes e troncos · [H] dica</small>'));
      if (!A.cp && !A.p1) E.later(4.5, () => E.say('(Ele mora aqui. Se eu correr, ele escuta. Se me vir, corro pra um esconderijo longe do olho dele.)', 6));
    };
    L.update = dt => {
      const p = E.player.pos, [pc, pr] = M.cel(p.x, p.z);
      bone.tick(dt);
      if (!esconderijo) L.speed = M.at(pc, pr) === 'm' ? 1.3 : 2.1;
      lampiao.position.set(E.camera.position.x, E.camera.position.y + .25, E.camera.position.z); lampiao.intensity = (esconderijo ? 8 : 13) + Math.sin(L.t * 11) * .5;
      if (A.p1) L.placa1.visible = false;
      if (pr <= 28) cp(1); if (pr <= 18) cp(2);
      if (rata) { rata.position.y = Math.abs(Math.sin(L.t * 3)) * .1; if (!lutando && livreIA() && pr <= 7 && pr >= 5) lutaRata(); }
      preso.position.y = Q.mata === 3 ? Math.abs(Math.sin(L.t * 2)) * .03 : 0;
      px.tick(dt);
      if (L.glitchT > 0) L.glitchT -= dt; L.glitch = Math.max(L.glitchT > 0 ? .35 : 0, px.perto * .12);
    };

    // dica: o próximo objetivo, pelo caminho de verdade na dimensão em que você está
    const rumo = (txt, alvo) => {
      const p = E.player.pos, cam = M.caminho(M.cel(p.x, p.z), alvo, bone.dim, 'jog');
      return { text: txt + (cam.chegou ? '' : ' (Do outro lado do boné o caminho é outro.)'), path: cam.filter((_, i) => i % 2 === 1 || i === cam.length - 1).slice(0, 6).map(([c, r]) => { const q = M.pos(c, r); return new THREE.Vector3(q.x, 1.3, q.z); }) };
    };
    L.hint = () => {
      const em = ch => M.marcas[ch][0];
      if (!A.p1) return rumo('O portão não abre daqui. Num beco do canto leste, do outro lado, tem uma alavanca.', em('A'));
      if (!A.p2) return A.manivela ? rumo('O guincho fica ao norte da fenda, deste lado. Atravesse pela ponte que só existe do outro lado.', em('G'))
        : rumo('Há um guincho sem manivela. Do outro lado, no sudoeste da fenda, tem uma salinha que não existe aqui.', em('M'));
      if (!A.p3) { const prox = ORDEM[A.selos.length]; return A.selos.length ? rumo(`Próximo selo: ${SELOS[prox][0]}.`, em(prox)) : rumo('Três selos de seiva. A ordem está escrita no meio da galeria de cima, mas só aparece do outro lado.', em('g')); }
      if (Q.mata < 3) return rumo('O caminho do ninho está aberto, no meio da galeria de cima.', em('Z'));
      return rumo('O Serjão está no alto da árvore.', [10, 3]);
    };
    L.debug = { Q, A, M, D, bone, px, fuga: false, esconderijo: () => esconderijo, sai };

    /* ---------------- a cabeça dele ---------------- */
    function criaCacador() {
      const obj = bicho(2.7);
      const C = { obj, pos: obj.position, est: 'ronda', cam: [], olhar: 0, suspeita: 0, fenda: 0, espera: 0, perdido: 0, alvo: null, graca: 8, recalc: 0, passoT: 0, fiuT: 6, buscas: 0, vendo: false, perto: 0, ativo: true, ouviuCd: 0 };
      const andavel = () => M.alcance(M.cel(E.player.pos.x, E.player.pos.z), false, 'px').filter(([c, r]) => r >= 10);
      const celPx = () => M.cel(C.pos.x, C.pos.z);
      const manda = (para, est) => { C.cam = M.caminho(celPx(), para, false, 'px'); C.est = est; C.espera = 0; };
      // aparece em outro canto: longe de você, numa parte da árvore ligada a onde você está
      C.realoca = (min = 7) => {
        const p = E.player.pos, pc = M.cel(p.x, p.z);
        let op = andavel().filter(([c, r]) => { const q = M.pos(c, r), d = dist(q, p); return d > min * T && !M.ve(q.x, q.z, p.x, p.z); });
        if (!op.length) {   // você está numa salinha isolada (só do outro lado): ele fica na galeria
          op = []; for (let r = 10; r < M.H - 4; r++) for (let c = 1; c < M.W - 1; c++) if (!M.parede(c, r, false, 'px') && Math.hypot(c - pc[0], r - pc[1]) > min && Math.abs(r - pc[1]) < 10) op.push([c, r]);
        }
        if (!op.length) return;
        const [c, r] = op[(Math.random() * op.length) | 0], q = M.pos(c, r); C.pos.set(q.x, 0, q.z); C.cam = []; C.est = 'ouvir'; C.espera = 1.5;
      };
      const novaRonda = () => {
        const p = E.player.pos, minha = M.alcance(celPx(), false, 'px').filter(([, r]) => r >= 10), pc = M.cel(p.x, p.z);
        // ficou preso numa parte sem ligação com você? Some e aparece em outra
        if (!minha.some(([c, r]) => c === pc[0] && r === pc[1]) && pr_ok(pc) && Math.random() < .75 && dist(C.pos, p) > 8) { C.realoca(); if (Math.random() < .5) E.whistle(.03, { pan: E.pan(C.pos), pitch: .8 }); return; }
        // às vezes ronda perto de você, às vezes vai pra qualquer canto
        const perto = minha.filter(([c, r]) => { const d = Math.hypot(c - pc[0], r - pc[1]); return d > 2 && d < 7; });
        const op = perto.length && Math.random() < .5 ? perto : minha;
        if (op.length) manda(op[(Math.random() * op.length) | 0], 'ronda');
      };
      const pr_ok = ([, r]) => r >= 10;
      C.some = () => { C.pos.set(0, -20, 0); C.cam = []; C.est = 'ronda'; C.suspeita = 0; C.graca = 4; };
      // um barulho num lugar: ele vai conferir (com um erro de uma casa ou duas)
      C.ouviu = (onde, forte = 0) => {
        const [c, r] = M.cel(onde.x, onde.z); if (!pr_ok([c, r]) || C.est === 'caca') return;
        if (C.pos.y < -5 || dist(C.pos, onde) > (forte ? 40 : 22)) { if (!forte) return; C.realoca(5); }
        manda([c, r], 'investiga'); C.suspeita = Math.max(C.suspeita, forte ? .35 : .15);
        if (C.ouviuCd <= 0) { C.ouviuCd = 5; E.whistle(.06, { pan: E.pan(C.pos) }); }
      };
      // o boné: ele sente a árvore se dobrando
      C.sentiu = onde => {
        const [c, r] = M.cel(onde.x, onde.z); if (!pr_ok([c, r]) || C.graca > 0) return;
        const e = () => ((Math.random() * 3) | 0) - 1;
        if (C.est === 'caca') { C.perdido = 2.2; C.alvo = [c, r]; return; }   // sumir da frente dele ajuda, mas ele sabe onde foi
        if (dist(C.pos, onde) > 24 && Math.random() < .4) C.realoca(5);
        if (dist(C.pos, onde) < 26) C.ouviu(M.pos(c + e(), r + e()));
      };
      function pegou() {
        const cp = CHECK[A.cp], q = cp ? M.pos(cp[0], cp[1]) : M.marca('S');
        E.die(() => { sai(); bone.poe(false); E.player.pos.set(q.x, 0, q.z); E.player.yaw = 0; C.suspeita = 0; C.fenda = 0; C.graca = 8; C.est = 'ronda'; C.realoca(8); });
      }
      C.tick = dt => {
        if (!C.ativo) return;
        const p = E.player.pos, [, pr] = M.cel(p.x, p.z);
        if (pr < 10 || Q.mata >= 3 || lutando) { C.obj.visible = false; C.vendo = false; C.perto = 0; poeHud(bone.dim ? 'DO OUTRO LADO' : '', 0, '#b080ff'); return; }   // ninho e cela: ele não entra
        C.obj.visible = true;
        if (!livreIA()) return;
        if (C.pos.y < -5) { C.pos.y = 0; C.realoca(7); }
        if (C.graca > 0) C.graca -= dt; if (C.ouviuCd > 0) C.ouviuCd -= dt;
        const d = dist(C.pos, p), dx = p.x - C.pos.x, dz = p.z - C.pos.z;
        let ang = Math.atan2(dx, dz) - C.olhar; ang = Math.atan2(Math.sin(ang), Math.cos(ang));
        const alcance = player_run() ? 13 : 10.5;
        C.vendo = !bone.dim && !esconderijo && C.graca <= 0 && d < alcance && (Math.abs(ang) < 1.05 || d < 2.4) && M.ve(C.pos.x, C.pos.z, p.x, p.z);
        C.perto = Math.max(0, 1 - d / 12);
        // ouvir passos
        if (!bone.dim && !esconderijo && C.graca <= 0 && C.est !== 'caca' && C.ouviuCd <= 0 && andando() && d < (player_run() ? 11 : 3.2)) C.ouviu(p);
        // do outro lado ele não te vê, mas a fenda vai abrindo
        C.fenda = Math.max(0, Math.min(1, C.fenda + dt * (bone.dim ? 1 / 11 : -1 / 7)));
        if (C.fenda >= 1) { C.fenda = .45; E.say('(A fenda rangeu. Ele sabe onde estou.)', 3); C.ouviu(p, 1); }
        if (C.est !== 'caca') {
          C.suspeita = Math.max(0, Math.min(1, C.suspeita + dt * (C.vendo ? (d < 4 ? 2.2 : d < 7 ? 1.05 : .6) : -.22)));
          if (C.vendo && C.suspeita > .45 && C.est !== 'alerta') { C.cam = []; C.est = 'alerta'; }
          if (C.suspeita >= 1) { C.est = 'caca'; C.perdido = 0; C.recalc = 0; E.whistle(.16); E.flash(); L.glitchT = .6; E.glitchText('ELE TE VIU', .6); }
        }
        let v = 0;
        if (C.est === 'ronda' || C.est === 'investiga') {
          v = C.est === 'ronda' ? 1.35 : 2;
          if (andaAte(C.pos, C.cam, v, dt)) {
            if (C.est === 'investiga') { C.est = 'procura'; C.buscas = 3; C.espera = 1.4; }
            else if (Math.random() < .45) { C.est = 'ouvir'; C.espera = 1.2 + Math.random() * 2.2; } else novaRonda();
          } else if (C.est === 'ronda' && Math.random() < dt * .045) { C.cam = []; C.est = 'ouvir'; C.espera = .8 + Math.random() * 1.5; }   // para do nada
        } else if (C.est === 'ouvir') {
          C.olhar += dt * 1.7 * (Math.sin(L.t * .9) > 0 ? 1 : -1);
          if ((C.espera -= dt) <= 0) novaRonda();
        } else if (C.est === 'alerta') {
          C.olhar = Math.atan2(dx, dz); v = .6;
          if (!C.vendo) { manda(M.cel(p.x, p.z), 'investiga'); }
        } else if (C.est === 'caca') {
          v = 2.75;
          if (C.vendo) { C.perdido = 0; C.alvo = M.cel(p.x, p.z); } else C.perdido += dt;
          if ((C.recalc -= dt) <= 0) { C.recalc = .35; C.cam = M.caminho(celPx(), C.alvo || M.cel(p.x, p.z), false, 'px'); }
          if (C.vendo && d < 2.6) { C.pos.x += dx / d * v * dt; C.pos.z += dz / d * v * dt; C.olhar = Math.atan2(dx, dz); } else andaAte(C.pos, C.cam, v, dt);
          // te viu entrar no esconderijo: ele vai até lá e te puxa
          if (esconderijo && esconderijo.visto && d < 1.5) return pegou();
          if (esconderijo && esconderijo.visto) { C.perdido = 0; C.alvo = M.cel(p.x, p.z); }
          if (C.perdido > 3.4) { C.est = 'procura'; C.buscas = 4; C.espera = 1.2; C.suspeita = .35; C.cam = []; E.say('(Ele perdeu meu rastro. Está procurando.)', 2.5); }
        } else if (C.est === 'procura') {
          v = 1.7;
          if (C.espera > 0) { C.espera -= dt; C.olhar += dt * 2.4; }
          else if (!C.cam.length) {
            if (C.buscas-- <= 0) novaRonda();
            else { const [c, r] = celPx(), op = M.alcance([c, r], false, 'px').filter(([cc, rr]) => rr >= 10 && Math.abs(cc - c) + Math.abs(rr - r) <= 4); if (op.length) C.cam = M.caminho([c, r], op[(Math.random() * op.length) | 0], false, 'px'); }
          } else if (andaAte(C.pos, C.cam, v, dt)) C.espera = .6 + Math.random();
        }
        // vira pra onde está andando
        if (C.cam.length) { const q = M.pos(C.cam[0][0], C.cam[0][1]); C.olhar = Math.atan2(q.x - C.pos.x, q.z - C.pos.z); }
        if (!bone.dim && !esconderijo && C.graca <= 0 && d < .95) return pegou();
        // do outro lado ele vira um vulto roxo, pra dar pra planejar
        const m0 = C.obj.children[0].material; m0.transparent = bone.dim; m0.opacity = bone.dim ? .3 : 1; m0.alphaTest = bone.dim ? .05 : .5;
        // som
        C.passoT -= dt; if (v > 1 && C.passoT <= 0 && d < 16) { C.passoT = 1.1 / v; E.noiseHit(.14, .22 * (1 - d / 17), 170, null, 'lowpass'); }
        C.fiuT -= dt; if (C.fiuT <= 0 && C.est !== 'caca') { C.fiuT = 9 + Math.random() * 12; E.whistle(.015 + .05 * Math.max(0, 1 - d / 30), { pan: E.pan(C.pos), pitch: .85 }); }
        coracao(dt, C.est === 'caca' ? Math.min(d, 5) : d);
        if (esconderijo) poeHud(C.est === 'caca' ? 'ESCONDIDO · ELE VIU ONDE' : 'ESCONDIDO', C.suspeita, '#e8c84a');
        else if (bone.dim) poeHud('DO OUTRO LADO · FENDA', C.fenda, '#b080ff');
        else if (C.est === 'caca') poeHud('FUJA', 1, '#ff3a2a');
        else if (C.est === 'procura') poeHud('ELE ESTÁ PROCURANDO', C.suspeita, '#e8c84a');
        else if (C.est === 'investiga') poeHud('ELE OUVIU ALGUMA COISA', C.suspeita, '#e8c84a');
        else poeHud(C.suspeita > .05 ? 'ELE ESTÁ OLHANDO' : '', C.suspeita, '#e8c84a');
      };
      let ultBob = 0, mexeu = false;
      const andando = () => mexeu, player_run = () => E.player.run;
      const tickBase = C.tick;
      C.tick = dt => { mexeu = Math.abs(E.player.bob - ultBob) > 1e-4; ultBob = E.player.bob; tickBase(dt); };
      C.some();
      return C;
    }
  }

  /* ==================================================================================== FUGA */
  function montaFuga() {
    const pi = M.marca('P'), si = M.marca('s');
    const sj = E.add(E.club('serjao', 1.8)); sj.position.set(si.x, 0, si.z);
    serj = { obj: sj, trilha: [{ x: si.x, z: si.z }, { x: L.spawn.x, z: L.spawn.z }] };
    const obj = bicho(3);
    obj.position.set(pi.x, 0, pi.z);
    caca = { obj, pos: obj.position, espera: 3, cam: [], recalc: 0, furia: 0, passoT: 0, ultAlvo: M.cel(si.x, si.z) };
    let falhou = false, saiu = false;

    /* o Serjão avisa quando ele chega perto */
    const FALAS = [
      null,
      ['Tô ouvindo as asa! Não para!', 'Ele ainda tá vindo, viu?', 'Corre que a brasa não espera!'],
      ['Ele tá chegando perto!', 'Anda, anda! Tô vendo o olho dele!', 'Ó o fiu fiu na minha orelha!'],
      ['ELE TÁ AQUI! ELE TÁ AQUI!', 'NÃO OLHA PRA TRÁS, CORRE!', 'ELE PUXOU MEU AVENTAL!'],
    ];
    const aviso = { faixa: 0, cd: 0, por: [0, 0, 0, 0], ult: ['', '', '', ''], log: [] };
    function falaSerj(faixa, txt) { E.say('SERJÃO: ' + txt, 2.4, 'npc'); aviso.log.push([faixa, txt, L.t]); E.tone(faixa === 3 ? 620 : 420, .08, .03, 'square'); }
    function avisos(dt, d) {
      aviso.cd -= dt; for (let i = 1; i < 4; i++) aviso.por[i] -= dt;
      const faixa = d < 4.5 ? 3 : d < 7.5 ? 2 : d < 11.5 ? 1 : 0;
      const chegou = faixa > aviso.faixa;
      if (faixa === 0 && aviso.faixa >= 2 && d > 14 && aviso.cd <= 0) { falaSerj(0, 'Ufa, abriu distância. Não para!'); aviso.cd = 6; aviso.faixa = 0; return; }
      if (faixa === 0) { if (d > 14) aviso.faixa = 0; return; }
      // fala quando ele muda de faixa pra mais perto; na mesma faixa, só depois de um bom tempo
      if ((chegou && aviso.cd <= 2) || (aviso.por[faixa] <= 0 && aviso.cd <= 0)) {
        const op = FALAS[faixa].filter(f => f !== aviso.ult[faixa]), f = op[(Math.random() * op.length) | 0];
        aviso.ult[faixa] = f; aviso.por[faixa] = 9; aviso.cd = 3.6; falaSerj(faixa, f);
      }
      aviso.faixa = faixa;
    }

    function fim(motivo) {
      if (falhou || saiu) return; falhou = true; S.dead = true;
      E.scare(1, .55); poeHud('', 0, '#000');
      setTimeout(() => { if (E.L === L) telaFalha(motivo); }, 1100);
    }
    // tela própria: vale toque, clique ou tecla. (A caixa de escolhas não servia: no celular ela some junto com os
    // controles quando você morre, e no PC não dava pra clicar. Parecia que o jogo tinha travado.)
    function telaFalha(motivo) {
      E.$('sub').innerHTML = '';
      const el = document.createElement('div'); el.className = 'overlay'; el.id = 'falhaFuga';
      el.innerHTML = `<h1>MISSÃO FALHOU</h1><p>${motivo}</p><p class="go">${E.isTouch ? '[ toque pra tentar de novo ]' : '[ clique ou aperte E pra tentar de novo ]'}</p>`;
      const lost = E.$('lost'); lost.parentNode.insertBefore(el, lost);   // antes do menu de pausa, que continua por cima
      let pronta = false, foi = false;
      const pausado = () => !E.$('pause').classList.contains('hidden');
      function tenta() {
        if (foi || pausado()) return; foi = true; tira(); S.dead = false; E.goTo('arvore');
      }
      const aperto = e => { if (!pronta || pausado() || (e.target.closest && e.target.closest('#pause, #opts'))) return; if (e.type === 'keydown' && !['KeyE', 'Enter', 'NumpadEnter', 'Space', 'Digit1', 'Numpad1', 'KeyR'].includes(e.code)) return; e.preventDefault(); e.stopPropagation(); tenta(); };
      const tipos = ['pointerdown', 'mousedown', 'touchend', 'keydown'];
      tipos.forEach(t => addEventListener(t, aperto, { capture: true, passive: false }));
      function tira() { tipos.forEach(t => removeEventListener(t, aperto, { capture: true })); el.remove(); falha = null; }
      falha = tira;
      setTimeout(() => { pronta = true; }, 600);   // um respiro, pra quem estava apertando tudo na correria não pular sem ver
      E.later(7, tenta);   // e se ninguém apertar nada, recomeça sozinho
    }

    /* obstáculos: raízes que brotam e troncos que desabam */
    const obst = [];
    for (const [c, r] of M.marcas.u || []) {
      const p = M.pos(c, r), grp = E.add(new THREE.Group()); grp.position.set(p.x, -2.2, p.z);
      for (let k = 0; k < 6; k++) { const e = new THREE.Mesh(new THREE.ConeGeometry(.22, 1.8 + rnd() * .5, 5), lam({ color: 0x5a3418, emissive: 0x1a0a02 })); e.position.set((rnd() - .5) * 1.4, .9, (rnd() - .5) * 1.4); e.rotation.set((rnd() - .5) * .5, 0, (rnd() - .5) * .5); grp.add(e); }
      const marca = E.add(new THREE.Mesh(new THREE.CircleGeometry(.85, 14), basic({ color: 0xff3a1a, transparent: true, opacity: 0 }))); marca.rotation.x = -Math.PI / 2; marca.position.set(p.x, .07, p.z);
      obst.push({ k: 'raiz', p, grp, marca, t: -1 });
    }
    { const filas = {}; for (const [c, r] of M.marcas.v || []) (filas[r] = filas[r] || []).push(c);
      for (const r in filas) {
        const cs = filas[r], a = M.pos(cs[0], +r), b = M.pos(cs[cs.length - 1], +r), cx = (a.x + b.x) / 2, larg = b.x - a.x + T;
        const tr = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.5, .6, larg - .15, 9), lam({ color: 0x6a4020, map: casca }))); tr.rotation.z = Math.PI / 2; tr.position.set(cx, 3.2, a.z); tr.visible = false;
        const marca = E.add(new THREE.Mesh(new THREE.PlaneGeometry(larg - .2, 1.2), basic({ color: 0xff3a1a, transparent: true, opacity: 0 }))); marca.rotation.x = -Math.PI / 2; marca.position.set(cx, .07, a.z);
        obst.push({ k: 'tronco', p: { x: cx, z: a.z }, larg, tr, marca, t: -1 });
      } }
    let atordoado = 0;
    function tickObst(dt) {
      const p = E.player.pos;
      for (const o of obst) {
        if (o.t < 0) { if (dist(o.p, p) < (o.k === 'raiz' ? 5.2 : 6) && caca.espera <= 0) { o.t = 0; E.noiseHit(.5, .22, o.k === 'raiz' ? 500 : 1400, null, 'bandpass'); } continue; }
        o.t += dt;
        const avisoDur = .75;
        if (o.t < avisoDur) { o.marca.material.opacity = .25 + .3 * Math.abs(Math.sin(o.t * 18)); if (o.k === 'tronco') { o.tr.visible = true; o.tr.position.y = 3.2; } continue; }
        o.marca.material.opacity = 0;
        const dentro = o.k === 'raiz' ? dist(o.p, p) < 1.2 : Math.abs(p.x - o.p.x) < o.larg / 2 + .28 && Math.abs(p.z - o.p.z) < .9;
        if (!o.caiu) {
          o.caiu = true; E.noiseHit(.5, .4, 160); L.shake = .3;
          if (dentro) { atordoado = .9; E.say('(Me pegou de raspão! Levanta, levanta!)', 1.6); E.noiseHit(.3, .3, 600); }
        }
        if (o.k === 'raiz') {
          const some = o.t > avisoDur + 2.6; o.grp.position.y = some ? Math.max(-2.2, o.grp.position.y - dt * 6) : Math.min(0, o.grp.position.y + dt * 14);
          if (!some && !o.col && !dentro) o.col = E.circle(o.p.x, o.p.z, .72);
          if (some && o.col) { L.circles.splice(L.circles.indexOf(o.col), 1); o.col = null; }
        } else {
          o.tr.position.y = Math.max(.52, o.tr.position.y - dt * 12);
          if (!o.col && !dentro) { o.col = { x0: o.p.x - o.larg / 2 + .1, x1: o.p.x + o.larg / 2 - .1, z0: o.p.z - .45, z1: o.p.z + .45 }; L.colliders.push(o.col); }
        }
      }
    }

    const saida = M.marca('X');
    { const luz = E.add(new THREE.PointLight(0xbfe8ff, 26, 16, 1.3)); luz.position.set(saida.x, 2, saida.z + 1);
      const vao = E.add(new THREE.Mesh(new THREE.CircleGeometry(1.2, 14), basic({ color: 0xe0f4ff, fog: false }))); vao.position.set(saida.x, 1.2, saida.z + .98); vao.rotation.y = Math.PI; }

    function tickSerj(dt) {
      const p = E.player.pos, tr = serj.trilha, ult = tr[tr.length - 1];
      if (Math.hypot(p.x - ult.x, p.z - ult.z) > .28) tr.push({ x: p.x, z: p.z });
      // quanto falta andar pelas suas pegadas
      let resta = 0, q = sj.position; for (const n of tr) { resta += Math.hypot(n.x - q.x, n.z - q.z); q = n; }
      let passo = Math.min(Math.max(0, resta - 1.25), (resta > 3 ? 3.6 : 3.2) * dt);
      const andou = passo > .002;
      while (passo > 0 && tr.length) {
        const n = tr[0], dx = n.x - sj.position.x, dz = n.z - sj.position.z, l = Math.hypot(dx, dz);
        if (l <= passo) { sj.position.x = n.x; sj.position.z = n.z; passo -= l; if (tr.length > 1) tr.shift(); else break; } else { sj.position.x += dx / l * passo; sj.position.z += dz / l * passo; passo = 0; }
      }
      sj.position.y = andou ? Math.abs(Math.sin(L.t * 11)) * .09 : 0;
    }

    function tickCaca(dt) {
      const sp = sj.position, p = E.player.pos;
      if (caca.espera > 0) { caca.espera -= dt; if (caca.espera <= 0) { E.whistle(.17); E.scream(.18); L.glitchT = .7; } poeHud(caca.espera > 1.5 ? 'CORRA' : 'ELE VEM VINDO', 0, '#ff3a2a'); return; }
      // ele quer o Serjão. Se o Serjão está do outro lado (ponte), vai até o último chão onde o viu
      const alvo = M.cel(sp.x, sp.z);
      if (!M.parede(alvo[0], alvo[1], false, 'px')) caca.ultAlvo = alvo;
      if ((caca.recalc -= dt) <= 0) { caca.recalc = .3; caca.cam = M.caminho(M.cel(caca.pos.x, caca.pos.z), caca.ultAlvo, false, 'px'); }
      const dReta = dist(caca.pos, sp), longe = caca.cam.length * T;
      let v = longe > 10 ? 3.75 : dReta < 4 ? 2.35 : longe > 6 ? 3.15 : 2.8;   // cola em você; perto ele alivia um pouco, longe ele dispara
      if (caca.furia > 0) { caca.furia -= dt; v += .45; }
      const aqui = M.cel(caca.pos.x, caca.pos.z);
      if (obst.some(o => o.caiu && o.k === 'tronco' && Math.abs(caca.pos.x - o.p.x) < o.larg / 2 && Math.abs(caca.pos.z - o.p.z) < .8)) v *= .6;   // arrebentando o tronco
      if (M.at(aqui[0], aqui[1]) === 'm') v *= .85;
      if (dReta < 2.4 && M.ve(caca.pos.x, caca.pos.z, sp.x, sp.z)) { caca.pos.x += (sp.x - caca.pos.x) / dReta * v * dt; caca.pos.z += (sp.z - caca.pos.z) / dReta * v * dt; }
      else andaAte(caca.pos, caca.cam, v, dt);
      caca.passoT -= dt; if (caca.passoT <= 0 && dReta < 18) { caca.passoT = .38; E.noiseHit(.15, .3 * (1 - dReta / 19), 160); }
      coracao(dt, Math.min(dReta, 11));
      avisos(dt, dReta);
      poeHud(`SERJÃO ♥ · PASSAREX A ${Math.max(1, Math.round(dReta))} M`, Math.max(0, 1 - dReta / 14), dReta < 4.5 ? '#ff3a2a' : '#e88a2a');
      if (dist(caca.pos, sp) < .95) return fim('O Passarex pegou o Serjão');
      if (dist(caca.pos, p) < .85) return fim('O Passarex te pegou');
    }

    let entrou = false;
    L.enter = () => {
      if (entrou) return; entrou = true;
      E.later(.6, () => falaSerj(0, 'É AGORA! Corre que eu vou atrás!'));
      E.later(1.2, () => E.toast(`FUJA COM O SERJÃO<small>${E.isTouch ? 'ligue o botão 🏃' : 'segure SHIFT pra correr'} · ele não aguenta um golpe</small>`));
    };
    L.update = dt => {
      const p = E.player.pos;
      bone.tick(dt);
      lampiao.position.set(E.camera.position.x, E.camera.position.y + .25, E.camera.position.z); lampiao.intensity = 15 + Math.sin(L.t * 13);
      if (atordoado > 0) atordoado -= dt;
      L.speed = atordoado > 0 ? .9 : M.at(...M.cel(p.x, p.z)) === 'm' ? 1.45 : 2.15;
      if (L.shake > 0) L.shake -= dt; L.roll = L.shake > 0 ? Math.sin(L.t * 50) * .025 : 0;
      if (L.glitchT > 0) L.glitchT -= dt; L.glitch = L.glitchT > 0 ? .4 : 0;
      if (falhou || saiu || !livreIA()) return;
      tickSerj(dt); tickObst(dt); tickCaca(dt);
      if (!falhou && Math.hypot(p.x - saida.x, p.z - saida.z) < 1.3) {
        if (dist(sj.position, p) > 4.5) { if (!L.espera) { L.espera = 1; E.say('SERJÃO: Não me deixa pra trás!', 2, 'npc'); } return; }
        saiu = true; bone.poe(false); Q.mata = 5; E.save(); poeHud('', 0, '#000');
        E.glitchText('SAÍMOS', .8); E.sfx.chime(); E.toast('Vocês saíram da árvore<small>devolva o boné ao Rosengo</small>');
        E.later(1.2, () => E.goTo('matagale'));
      }
    };
    L.hint = () => {
      const p = E.player.pos, cam = M.caminho(M.cel(p.x, p.z), M.marcas.X[0], bone.dim, 'jog');
      return { text: 'Não para. A saída é pro sul. Onde o chão some, o boné pode ter uma ponte.', path: cam.filter((_, i) => i % 2 === 1).slice(0, 5).map(([c, r]) => { const q = M.pos(c, r); return new THREE.Vector3(q.x, 1.3, q.z); }) };
    };
    L.debug = { Q, M, D, bone, fuga: true, caca, serj, aviso, obst, falhou: () => falhou };
  }

  /* ---------------- som: madeira rangendo, gotas e um grave que não para ---------------- */
  L.ambience = bus => { E.loopNoise('lowpass', 130, 0, .09, bus); E.loopNoise('bandpass', 620, 6, .012, bus); };
  let rangeT = 4;
  const upd = L.update;
  // a lanterna: um facho fraco que acompanha pra onde você olha (em 1ª e em 3ª pessoa)
  const facho = E.add(new THREE.SpotLight(0xfff1d6, FORCA_LANTERNA, 17, .46, .75, 1.3)); E.add(facho.target);
  function miraLanterna() {
    const p = E.player.pos, yaw = E.player.yaw, pit = E.player.pitch, y = E.player.camY;
    facho.position.set(p.x, y - .12, p.z);
    facho.target.position.set(p.x - Math.sin(yaw) * Math.cos(pit) * 4, y - .12 + Math.sin(pit) * 4, p.z - Math.cos(yaw) * Math.cos(pit) * 4);
    facho.color.set(bone.dim ? 0xe0c8ff : 0xfff1d6);
    facho.intensity = FORCA_LANTERNA * (esconderijo ? .3 : 1);   // escondido ele quase apaga
  }
  miraLanterna();
  L.update = dt => {
    rangeT -= dt;
    if (rangeT <= 0 && livreIA()) { rangeT = 3 + Math.random() * 8; const r = Math.random(); if (r < .45) E.sfx.creak(); else if (r < .75) E.tone(900 + Math.random() * 600, .08, .02, 'sine', null, 0, 0, 400); else E.noiseHit(1.3, .05, 240); }
    upd(dt);
    miraLanterna();
  };
}
