// A LUTA · Passarex em 2D, no estilo dos chefões de desenho antigo.
// Você: anda, pula duas vezes, dá dash, atira goiaba (doce: rápida; azeda: tiro triplo forte e curto),
// faz PARRY nas penas ROSAS (pule de novo encostado nelas), enche as cartas de especial e solta o EX (1 carta)
// ou a SUPER GOIABADA (5 cartas). Goiabas douradas caem de vez em quando e devolvem vida.
// Ele: 3 fases, com chuva de penas, rajadas, bicadas, leque, ondas de fiu fiu, mergulho, passarinhos,
// o giro (se envolve nas asas e vira um redemoinho) e penas teleguiadas. No fim, a nota da luta.
import { criaRata } from './chefe-rata.js';
export function lutar(E, opts = {}) {
  return new Promise(resolve => {
    const S = E.state;
    const COL = opts.chefe === 'colombo';   // o final secreto: a mesma luta, mas contra o Colombo, na ilha dos Passarex em 1491
    const RATA = opts.chefe === 'rata';   // a RataBrumga, dentro da árvore (o resto dela está em chefe-rata.js)
    S.painting = true; S.noteOpen = true;
    E.soltarTeclas && E.soltarTeclas();   // o W/Shift que você segurava antes da luta não fica 'preso'
    // música da luta ("Derrote o Pássaro", em 8 bits); na saída volta a trilha da cidade
    const musAntes = E.MUS && E.MUS.name;
    E.loadSfx && E.loadSfx(['chefao']).then(() => { if (!acabou) E.setMusic('chefao', .4); });
    document.exitPointerLock && document.exitPointerLock();
    const W = 480, H = 270, GY = 232;
    const ov = document.createElement('div'); ov.id = 'chefao';
    const touch = E.isTouch;
    ov.innerHTML = `<style>
      #chefao{position:fixed;inset:0;z-index:50;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'VT323',monospace;color:#ffe9a8;user-select:none;-webkit-user-select:none;touch-action:none}
      #chefao canvas{width:min(100vw,calc(100vh * 16 / 9));aspect-ratio:16/9;image-rendering:pixelated}
      #chefao .keys{font-size:17px;color:#a79fb0;margin-top:4px;text-align:center}
      #chefao .pad{position:fixed;bottom:8px;display:flex;gap:8px;flex-wrap:wrap}
      #chefao .pad button{width:62px;height:54px;font:inherit;font-size:18px;border-radius:12px;border:2px solid rgba(255,233,168,.6);background:rgba(20,16,30,.55);color:#ffe9a8;touch-action:none}
      #chefao .pad button.on{background:rgba(255,233,168,.45)}
      #chefao .pad button.sp{border-color:#ff8fb1;color:#ff8fb1}
      #chefao .l{left:10px} #chefao .r{right:10px;justify-content:flex-end;max-width:290px}
      #chefao .stick{position:fixed;bottom:18px;width:128px;height:128px;border-radius:50%;border:2px solid rgba(255,233,168,.45);background:rgba(20,16,30,.35);touch-action:none}
      #chefao .stick .kn{position:absolute;left:39px;top:39px;width:50px;height:50px;border-radius:50%;background:rgba(255,233,168,.5);pointer-events:none}
      #chefao .stick small{position:absolute;left:0;right:0;top:-20px;text-align:center;font-size:15px;color:#ffe9a8;opacity:.75}
      #chefao .stick.mira{border-color:rgba(255,143,177,.7)} #chefao .stick.mira .kn{background:rgba(255,143,177,.6)}
      #chefao .bt{position:fixed;width:66px;height:66px;border-radius:50%;font:inherit;font-size:16px;border:2px solid rgba(255,233,168,.6);background:rgba(20,16,30,.55);color:#ffe9a8;touch-action:none;padding:0}
      #chefao .bt.on{background:rgba(255,233,168,.45)} #chefao .bt.sp{border-color:#ff8fb1;color:#ff8fb1} #chefao .bt.big{width:78px;height:78px;font-size:18px}
    </style>
    <canvas width="${W}" height="${H}"></canvas>
    ${touch ? `<div class="stick anda" style="left:18px"><small>ANDAR</small><div class="kn"></div></div>
      <div class="stick mira" style="right:18px"><small>MIRAR E ATIRAR</small><div class="kn"></div></div>
      <button class="bt big" data-k="J" style="right:160px;bottom:24px">PULA</button>
      <button class="bt" data-k="D" style="right:166px;bottom:112px">DASH</button>
      <button class="bt sp" data-k="X" style="right:92px;bottom:190px">ESPEC.</button>
      <button class="bt" data-k="T" style="right:14px;bottom:190px;font-size:14px">TROCA</button>`
      : `<div class="keys">A D andar · ESPAÇO pular · CLIQUE (segure) atirar · SHIFT dash · CLIQUE DIREITO ou E especial · Q ou rodinha troca a goiaba</div>`}`;
    document.body.appendChild(ov);
    const cv = ov.querySelector('canvas'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const K = {};
    const map = { KeyA: 'L', ArrowLeft: 'L', KeyD: 'R', ArrowRight: 'R', KeyW: 'J', ArrowUp: 'J', Space: 'J', KeyJ: 'F', KeyZ: 'F', KeyK: 'D', ShiftLeft: 'D', ShiftRight: 'D', KeyQ: 'T', KeyX: 'T', KeyL: 'X', KeyE: 'X', KeyC: 'X' };
    const down = e => { const k = map[e.code]; if (k) { e.preventDefault(); e.stopPropagation(); if (!K[k]) press(k); K[k] = true; } };
    const up = e => { const k = map[e.code]; if (k) { e.preventDefault(); e.stopPropagation(); K[k] = false; } };
    addEventListener('keydown', down, true); addEventListener('keyup', up, true);
    cv.addEventListener('pointerdown', e => { if (!touch) { if (e.button === 2) press('X'); else K.F = true; } });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('wheel', e => { e.preventDefault(); press('T'); }, { passive: false });
    const pu = () => { if (!touch) K.F = false; };
    addEventListener('pointerup', pu);
    ov.querySelectorAll('.pad button, .bt').forEach(b => {
      const k = b.dataset.k;
      b.addEventListener('touchstart', e => { e.preventDefault(); if (!K[k]) press(k); K[k] = true; b.classList.add('on'); }, { passive: false });
      const off = e => { e.preventDefault(); K[k] = false; b.classList.remove('on'); };
      b.addEventListener('touchend', off, { passive: false }); b.addEventListener('touchcancel', off, { passive: false });
    });

    // joysticks do celular: o da esquerda anda, o da direita mira e atira pra onde você aponta
    const mira = { x: 1, y: 0, ativa: false };
    function joystick(el, onMove, onEnd) {
      if (!el) return;
      const kn = el.querySelector('.kn'); let id = null;
      const mv = t => {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let dx = (t.clientX - cx) / (r.width / 2), dy = (t.clientY - cy) / (r.height / 2); const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
        kn.style.transform = `translate(${dx * 40}px, ${dy * 40}px)`; onMove(dx, dy);
      };
      el.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; id = t.identifier; mv(t); }, { passive: false });
      el.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === id) mv(t); }, { passive: false });
      const fim = e => { for (const t of e.changedTouches) if (t.identifier === id) { id = null; kn.style.transform = ''; onEnd(); } };
      el.addEventListener('touchend', fim); el.addEventListener('touchcancel', fim);
    }
    joystick(ov.querySelector('.stick.anda'), (dx) => { K.L = dx < -.3; K.R = dx > .3; }, () => { K.L = K.R = false; });
    joystick(ov.querySelector('.stick.mira'), (dx, dy) => {
      const l = Math.hypot(dx, dy); if (l < .25) { K.F = false; mira.ativa = false; return; }
      mira.x = dx / l; mira.y = dy / l; mira.ativa = true; K.F = true;
    }, () => { K.F = false; mira.ativa = false; });

    const pxImg = sil => { const c = document.createElement('canvas'); c.width = 130; c.height = 190; const x = c.getContext('2d'); x.translate(65, 182); x.scale(.22, .22); window.drawPassarex(x, 1.6, { sil }); return c; };
    const PX = { cor: pxImg(false), sil: pxImg(true) };
    // dano: o próprio desenho pisca em branco (sem retângulo em volta)
    const brancoCv = document.createElement('canvas'); brancoCv.width = 130; brancoCv.height = 190; const brancoG = brancoCv.getContext('2d');
    const branco = img => { brancoG.globalCompositeOperation = 'source-over'; brancoG.clearRect(0, 0, 130, 190); brancoG.drawImage(img, 0, 0); brancoG.globalCompositeOperation = 'source-in'; brancoG.fillStyle = '#fff'; brancoG.fillRect(0, 0, 130, 190); return brancoCv; };
    // o Colombo é desenhado de novo a cada quadro (ele mexe o casaco e a luneta)
    const colCv = document.createElement('canvas'); colCv.width = 130; colCv.height = 190; const colG = colCv.getContext('2d');
    const desenhaColombo = t => { colG.setTransform(1, 0, 0, 1, 0, 0); colG.clearRect(0, 0, 130, 190); colG.translate(65, 184); colG.scale(-.215, .215); window.drawColombo(colG, t, {}); };
    let barris = [], tries = 0, P, B, shots, foes, fx, items, state, stT, last = performance.now(), raf = 0, msg = '', msgT = 0, wob = 0, banner = '', bannerT = 0, flashT = 0, stats;

    const R = RATA ? criaRata({ E, W, H, GY, g, P: () => P, B: () => B, add: f => foes.push(f), fx: f => fx.push(f), say: (t, d) => say(t, d), hurt: () => hurt(), tremer: v => { wob = v; } }) : null;
    function reset() {
      const easy = Math.min(3, tries);
      P = { x: 70, y: GY, vx: 0, vy: 0, ground: true, face: 1, hp: (COL ? 7 : 6) + (easy > 0 ? 1 : 0) + (easy > 2 ? 1 : 0), inv: 0, dash: 0, dashCd: 0, fireT: 0, gun: 0, jumps: 0, cards: 0, jumpT: 0, super: 0 };
      B = { x: 380, y: GY, hp: (COL ? 230 : 280) * (1 - easy * .15), max: 0, cd: 2.6, atk: null, t: 0, flash: 0, ph: 1, lean: 0, neck: 0, spin: 0, puff: 0, dir: -1, atras: 0, last2: null };   // dir: pra onde ele olha (-1 = esquerda)
      if (RATA) { B.hp = 195 * (1 - easy * .15); R.reset(B); }
      B.max = B.hp;
      shots = []; foes = []; fx = []; items = [];
      barris = COL ? [{ x: 150, hp: 3, resp: 0 }, { x: 292, hp: 3, resp: 0 }] : [];   // Colombo: barris na areia (dá pra subir e se esconder)
      Object.assign(B, { tonto: 0, mareT: 0, mare: 0, luneta: 0 });
      stats = { t: 0, parry: 0, supers: 0, hits: 0 };
      leitura = { ar: 0, parado: 0 };   // o que ele 'aprende' de você: quanto tempo no ar e parado
      state = 'intro'; stT = 0; banner = ''; bannerT = 0;
    }
    const say = (t, d = 1) => { msg = t; msgT = d; };
    function press(k) {
      if (state !== 'luta') return;
      if (P.preso > 0) {   // preso na rede: só dá pra se debater (PULAR várias vezes)
        if (k === 'J') { P.preso -= .32; wob = .08; E.tone(300 + Math.random() * 200, .05, .03, 'square'); if (P.preso <= 0) { say('SOLTOU!', .7); P.inv = Math.max(P.inv, .5); } }
        return;
      }
      if (k === 'J') {
        P.jumpT = .2;
        if (!P.ground && tryParry()) return;
        if (P.jumps < 2) { P.vy = P.jumps ? -300 : -360; P.ground = false; P.jumps++; E.tone(420 + P.jumps * 120, .08, .03, 'square'); }
      }
      if (k === 'D' && P.dashCd <= 0) { P.dash = .18; P.dashCd = .65; P.inv = Math.max(P.inv, .2); E.noiseHit(.15, .12, 1200); }
      if (k === 'T') { P.gun = 1 - P.gun; E.tone(P.gun ? 300 : 600, .1, .04, 'triangle'); say(P.gun ? 'GOIABA AZEDA' : 'GOIABA DOCE'); }
      if (k === 'X') especial();
    }
    // parry: encostar numa coisa ROSA e apertar pular no ar
    function tryParry() {
      for (const f of foes) {
        if (!f.pink || f.life <= 0) continue;
        if (Math.abs(f.x - P.x) < 18 && Math.abs(f.y - (P.y - 14)) < 22) {
          f.life = 0; P.cards = Math.min(5, P.cards + 1); P.vy = -330; P.jumps = 1; stats.parry++;
          fx.push({ x: f.x, y: f.y, t: .35, c: '#ff8fb1', ring: 1 }); E.tone(1320, .12, .06, 'triangle'); E.tone(1760, .2, .05, 'triangle', null, .06);
          say('PARRY!', .8); flashT = .06; return true;
        }
      }
      return false;
    }
    function especial() {
      if (B.t - (P.ultEsp ?? -9) < EX_ESPERA) return;   // recarga entre especiais
      if (P.cards >= 1) P.ultEsp = B.t;
      if (P.cards >= 5) {   // SUPER GOIABADA
        P.cards = 0; stats.supers++; P.super = 1.1; P.inv = Math.max(P.inv, 1.3);
        shots.push({ x: P.x + P.face * 14, y: P.y - 16, vx: P.face * 240, vy: 0, d: 0, life: 2.4, c: '#ff5d8a', sup: 1, r: 26, tick: 0, resta: SUPER_TETO });
        E.gritoOutro(.2); E.tone(110, .9, .08, 'sawtooth', null, 0, 0, 440); say('SUPER GOIABADA!', 1.4); wob = .3;
      } else if (P.cards >= 1) {   // EX
        P.cards -= 1;
        shots.push({ x: P.x + P.face * 12, y: P.y - 16, vx: P.face * 300, vy: 0, d: EX_DANO, life: 1.6, c: '#ffd23a', big: 2, r: 9, esp: 1 });
        E.tone(260, .2, .07, 'square', null, 0, 0, 520); say('GOIABA EX', .8);
      } else { say('sem carta de especial', .8); E.tone(120, .1, .04, 'square'); }
    }
    const CARTA = .03, EX_DANO = 11, EX_ESPERA = .7, SUPER_TICK = 5.5, SUPER_TETO = 30, AZEDA = 1.7;   // balanceamento da goiaba (2.8)
    const phase = () => B.hp > B.max * .66 ? 1 : B.hp > B.max * .33 ? 2 : 3;
    const hitBoss = (d, esp) => { if (B.atk && B.atk.k === 'giro') d *= .5; if (COL && B.tonto > 0 && !esp) d *= 2; B.hp -= d; if (!(B.flashCd > 0)) { B.flash = .09; B.flashCd = .3; }   /* piscar no máximo ~3x por segundo (fotossensibilidade) */ if (!esp) P.cards = Math.min(5, P.cards + d * CARTA); };   // o especial não devolve carta (antes ele se pagava sozinho)

    /* ---- ataques ---- */
    let leitura = { ar: 0, parado: 0 };
    const HX = () => B.dir < 0 ? 380 : 100;   // o canto dele (muda quando ele vira de lado)
    const naFrente = () => (P.x - B.x) * B.dir > 0;
    function feather(x, y, vx, vy, o = {}) { foes.push({ k: 'pena', x, y, vx, vy, r: 6, life: o.life || 6, home: o.home || 0, pink: o.pink || (Math.random() < .16 && !o.noPink) }); }
    const LIST = COL ? {   // Colombo: canhão da caravela, espada (a "bicada"), ondas do mar, gaivotas e bússolas teleguiadas
      1: ['chuva', 'rajada', 'bicada', 'canhao', 'leque'],
      2: ['chuva', 'rajada', 'bicada', 'canhao', 'fiu', 'mergulho', 'passarinhos', 'leque'],
      3: ['giro', 'teleguiada', 'bicada', 'canhao', 'rajada', 'mergulho', 'chuva', 'fiu'],
    } : {
      1: ['chuva', 'rajada', 'bicada', 'leque'],
      2: ['chuva', 'rajada', 'bicada', 'fiu', 'mergulho', 'passarinhos', 'leque'],
      3: ['giro', 'teleguiada', 'bicada', 'fiu', 'rajada', 'mergulho', 'chuva'],
    };
    const topo = b => GY - 28 - B.mare;   // os barris boiam quando a maré sobe
    const escondido = () => barris.some(b => b.hp > 0 && (b.x - B.x) * (P.x - b.x) > 0 && Math.abs(P.x - b.x) < 32 && P.y > topo(b) - 2);
    function poeMira(atraso) { foes.push({ k: 'mira', x: P.x, y: GY, t: -atraso, segue: .9, cai: .45, life: 9 }); }
    function startCol(ph) {
      const lista = ph === 1 ? ['luneta', 'rede', 'rola', 'estocada'] : ph === 2 ? ['luneta', 'rede', 'rola', 'estocada', 'mare', 'marujos'] : ['luneta', 'rede', 'rola', 'estocada', 'mare', 'marujos', 'bombardeio'];
      const dist = Math.abs(P.x - B.x), peso = { luneta: 1.3, rede: 1, rola: 1, estocada: 1, mare: 1, marujos: .8, bombardeio: 1 };
      if (dist < 140) peso.estocada += 2; else if (dist > 220) { peso.rede += 1.5; peso.rola += 1; }
      if (leitura.parado > 1) { peso.bombardeio += 2; peso.estocada += 1; }
      if (B.mareT > 0) peso.mare = 0;
      const ops = lista.filter(x => x !== B.last && peso[x] > 0); let tot = 0; for (const x of ops) tot += peso[x];
      let r = Math.random() * tot, a = ops[0]; for (const x of ops) { r -= peso[x]; if (r <= 0) { a = x; break; } }
      B.last2 = B.last; B.last = a; B.atk = { k: a, t: 0, n: 0 };
      if (a === 'estocada') B.atk.vezes = ph === 3 ? 4 : ph === 2 ? 3 : 2;
      if (a === 'mare') { B.mareT = 6.5; B.atk = null; say('A MARÉ ESTÁ SUBINDO!', 1.4); E.noiseHit(1.2, .2, 300); }
      if (a === 'luneta') E.tone(660, .2, .03, 'triangle', null, 0, 0, 990);
    }
    function runCol(dt, a, ph) {
      if (a.k === 'luneta') {   // ele olha pela luneta: um cone varre a areia. Atrás de um barril, ele não te vê
        if (a.t < .6) { B.luneta = a.t / .6; return; }
        const k = (a.t - .6) / (ph === 3 ? 1.6 : 2);
        a.cx = B.x + B.dir * (30 + k * (W + 40));
        if (!a.viu && Math.abs(P.x - a.cx) < 30 && !escondido()) {
          a.viu = 1; a.fim = a.t + .5; say('TERRA À VISTA!', 1.2); E.noiseHit(.4, .3, 200); wob = .15;
          for (let i = 0; i < 2 + ph; i++) poeMira(i * .55);
        }
        if (a.viu && a.t > a.fim) { B.atk = null; B.luneta = 0; return; }
        if (k >= 1) { B.atk = null; B.luneta = 0; B.tonto = 2; say('COLOMBO: Hmm... cadê você?', 1.6); E.tone(300, .4, .03, 'sine', null, 0, 0, 200); }
        return;
      }
      if (a.k === 'rede') {   // a rede em arco: se pegar, você fica preso. Dá pra destruir com tiros
        const n = ph > 1 ? 2 : 1;
        if (a.n < n && a.t > .45 + a.n * .55) {
          a.n++; const x0 = B.x + B.dir * 26, y0 = GY - 110, T = .95, g0 = 330, alvo = Math.max(20, Math.min(W - 20, P.x + P.vx * T * (a.n === 2 ? .9 : .2)));
          foes.push({ k: 'rede', x: x0, y: y0, vx: (alvo - x0) / T, vy: (GY - 18 - y0 - .5 * g0 * T * T) / T, g: g0, r: 13, hp: 3, life: 3 });
          E.noiseHit(.25, .2, 900);
        }
        if (a.t > 1.6 + (n - 1) * .55) B.atk = null;
        return;
      }
      if (a.k === 'rola') {   // balas de canhão rolando e quicando pela areia (rasteira, média ou alta)
        const tot = 2 + ph, every = ph === 3 ? .55 : .75;
        if (a.n < tot && a.t > .4 + a.n * every) {
          a.n++; const de = B.x > W / 2 ? 1 : -1, x0 = de > 0 ? W + 12 : -12, alt = [0, 34, 64][(Math.random() * 3) | 0];
          foes.push({ k: 'rola', bala: 1, x: x0, y: GY - 8, vx: -de * (150 + ph * 25), bh: alt, bf: 4 + Math.random() * 2, t: 0, r: 8, life: 6, pink: a.n === 2 && Math.random() < .6 });
          E.noiseHit(.3, .25, 160);
        }
        if (a.t > .9 + tot * every) B.atk = null;
        return;
      }
      if (a.k === 'estocada') {   // ele ATRAVESSA a tela com a espada. Pular não adianta: use o DASH (você fica invencível)
        const cyc = ph === 3 ? .62 : .75, tt = a.t % cyc, rep = Math.floor(a.t / cyc);
        if (rep >= a.vezes) { B.atk = null; B.prep = 0; return; }
        if (tt < .34) { B.prep = 1; B.dir = Math.sign(P.x - B.x) || B.dir; a['alvo' + rep] = Math.max(30, Math.min(W - 30, P.x + B.dir * 60)); if (!a['w' + rep]) { a['w' + rep] = 1; E.tone(880, .08, .04, 'square'); } }
        else { B.prep = 0; const alvo = a['alvo' + rep], d = alvo - B.x; B.x += Math.sign(d) * Math.min(Math.abs(d), 950 * dt); if (Math.random() < .6) fx.push({ x: B.x - B.dir * 20, y: B.y - 60 - Math.random() * 60, t: .2, c: '#e8ecf4' }); if (!a['s' + rep]) { a['s' + rep] = 1; E.noiseHit(.2, .2, 1800, null, 'highpass'); } }
        return;
      }
      if (a.k === 'marujos') {   // marujos com redes atravessando a areia: pule por cima ou derrube
        const tot = 1 + ph;
        if (a.n < tot && a.t > .3 + a.n * .8) { a.n++; const de = Math.random() < .5 ? 1 : -1; foes.push({ k: 'marujo', x: de > 0 ? -12 : W + 12, y: GY - 12, vx: de * (85 + ph * 10), r: 9, hp: 3, life: 8, ph: Math.random() * 6 }); }
        if (a.t > .6 + tot * .8) B.atk = null;
        return;
      }
      if (a.k === 'bombardeio') {   // a caravela mira em você: as miras te seguem e travam
        if (a.n === 0) { a.n = 1; say('FOGO!', 1); for (let i = 0; i < 3 + ph; i++) poeMira(i * .45); }
        if (a.t > 2.2 + ph * .45) B.atk = null;
        return;
      }
      B.atk = null;
    }
    function startAttack() {
      if (RATA) return R.start(phase());
      if (COL) return startCol(phase());
      const ph = phase(), list = LIST[ph];
      // ele lê você: perto → bicada/giro; longe → rajada/assobio/teleguiada/mergulho; muito no ar → leque; parado → chuva/mergulho
      const dist = Math.abs(P.x - B.x), peso = { bicada: 1, giro: 1, leque: 1, rajada: 1, fiu: 1, teleguiada: 1, mergulho: 1, chuva: 1, passarinhos: .7, canhao: 1.2 };
      if (dist < 150) { peso.bicada += 2.5; peso.giro += 2; peso.leque += 1; } else if (dist > 220) { peso.canhao += 1.5; peso.rajada += 1.5; peso.fiu += 1.5; peso.teleguiada += 1.5; peso.mergulho += 2; }
      if (leitura.ar > .45) { peso.leque += 2; peso.chuva += 1; peso.teleguiada += 1; }
      if (leitura.parado > 1) { peso.chuva += 3; peso.mergulho += 2; }
      const ops = list.filter(x => x !== B.last && x !== B.last2); let tot = 0; for (const x of ops) tot += peso[x] || 1;
      let r = Math.random() * tot, a = ops[0]; for (const x of ops) { r -= peso[x] || 1; if (r <= 0) { a = x; break; } }
      B.last2 = B.last; B.last = a; B.atk = { k: a, t: 0, n: 0 };
      if (a === 'chuva') { const n = 5 + ph * 2; for (let i = 0; i < n; i++) { const x = i % 2 === 0 ? Math.max(14, Math.min(W - 14, P.x + P.vx * .45 + (Math.random() - .5) * 70)) : 14 + Math.random() * (W - 28);   /* metade cai onde você vai estar; a outra cobre a tela toda */ foes.push({ k: 'aviso', x, y: GY, life: .7 + i * (ph === 3 ? .12 : .18), then: () => feather(x, -10, 0, 210 + ph * 25) }); } }
      if (a === 'fiu') { if (COL) E.noiseHit(.5, .3, 400); else E.whistle(.1); B.puff = .6; }
      if (a === 'canhao') B.atk.tiros = 2 + ph;
      if (a === 'bicada') { B.atk.alto = Math.random() < (ph > 1 ? .25 : .45) ? Math.random() < .5 : !P.ground; B.atk.vezes = ph === 3 ? 3 : ph === 2 ? 2 : 1; }   // no chão → bicada baixa (te obriga a pular); no ar → alta
    }
    function runAttack(dt) {
      const a = B.atk; a.t += dt; const ph = phase();
      if (RATA) return R.run(dt, a, ph);
      if (COL) return runCol(dt, a, ph);
      if (a.k === 'chuva' && a.t > 2.6 + ph * .3) B.atk = null;
      if (a.k === 'rajada') {
        const every = ph === 3 ? .45 : .7;
        if (a.t > .4 + a.n * every && a.n < 3 + ph) { a.n++; const low = Math.random() < .55; const mira = ph > 1 && Math.random() < .5, yy = mira ? Math.max(GY - 90, Math.min(GY - 8, P.y - 14)) : low ? GY - 8 : GY - 46; feather(B.x + B.dir * 30, yy, B.dir * (210 + ph * 30), 0); if (ph > 1 && Math.random() < .4) feather(B.x + B.dir * 30, GY - 84, B.dir * (180 + ph * 30), 30); E.noiseHit(.08, .08, 3000, null, 'highpass'); }
        if (a.t > 1 + (3 + ph) * every) B.atk = null;
      }
      if (a.k === 'bicada') {   // ele recua, avisa e estica o pescoço pra frente (baixo: pule; alto: fique no chão)
        const cyc = 1.25, tt = a.t % cyc, rep = Math.floor(a.t / cyc);
        if (rep >= a.vezes) { B.atk = null; B.lean = 0; B.neck = 0; return; }
        if (tt < .6) { B.lean = -tt / .6 * .25; B.neck = 0; if (!a['w' + rep]) { a['w' + rep] = 1; E.tone(880, .12, .04, 'square'); a.alto = rep ? (ph > 1 ? !P.ground : !a.alto) : a.alto; } }
        else if (tt < .95) { B.lean = .3; B.neck = Math.min(1, (tt - .6) / .12); if (!a['s' + rep]) { a['s' + rep] = 1; E.noiseHit(.2, .2, 1800, null, 'highpass'); wob = .15; } }
        else { B.lean *= .8; B.neck = Math.max(0, 1 - (tt - .95) / .2); }
      }
      if (a.k === 'leque') {
        if (a.t > .5 && a.n === 0) { a.n = 1; B.puff = .5; const base = Math.atan2(P.y - 14 - (GY - 100), P.x - B.x); for (let i = 0; i < 7 + ph; i++) { const ang = base + (i / (6 + ph) - .5) * 1.4; feather(B.x + B.dir * 10, GY - 100, Math.cos(ang) * 190, Math.sin(ang) * 190); } E.noiseHit(.2, .12, 2500, null, 'highpass'); }
        if (ph > 1 && a.t > 1.2 && a.n === 1) { a.n = 2; const base = Math.atan2(P.y - 14 - (GY - 100), P.x - B.x); for (let i = 0; i < 6; i++) { const ang = base + (i / 5 - .5) * 1.2 + .1; feather(B.x + B.dir * 10, GY - 100, Math.cos(ang) * 170, Math.sin(ang) * 170); } }
        if (a.t > 2) B.atk = null;
      }
      if (a.k === 'fiu') {
        if (a.t > .5 && a.n === 0) { a.n = 1; foes.push({ k: 'onda', x: B.x + B.dir * 40, y: GY, vx: B.dir * (170 + ph * 20), life: 4, r: 10 }); }
        if (ph === 3 && a.t > 1.4 && a.n === 1) { a.n = 2; foes.push({ k: 'onda', x: B.x + B.dir * 40, y: GY, vx: B.dir * 210, life: 4, r: 10 }); }
        if (a.t > 2.6) B.atk = null;
      }
      if (a.k === 'mergulho') {
        if (a.t < 1.2) { B.y += (GY - 150 - B.y) * Math.min(1, dt * 4); B.x += (Math.max(30, Math.min(W - 30, P.x + P.vx * .35)) - B.x) * Math.min(1, dt * (ph > 1 ? 3 : 2)); if (a.t > .9 && !a.w) { a.w = 1; foes.push({ k: 'aviso', x: B.x, y: GY, life: .5, big: 1 }); } }
        else if (a.t < 1.6) { B.y = Math.min(GY, B.y + dt * 700); if (B.y >= GY && !a.boom) { a.boom = 1; E.noiseHit(.4, .35, 200); wob = .4; for (const s of [-1, 1]) feather(B.x, GY - 10, s * 200, -40); } }
        else { if (!a.lado) { a.lado = 1; B.dir = P.x < 240 ? -1 : 1; } B.x += (HX() - B.x) * Math.min(1, dt * 3); B.y = GY; if (a.t > 2.6) { B.atk = null; B.x = HX(); } }   // volta pro canto mais longe de você
      }
      if (a.k === 'passarinhos') {   // passarinhos que atravessam a tela em onda: dá pra derrubar (enchem o especial)
        if (a.t > .3 + a.n * .5 && a.n < 4) { a.n++; foes.push({ k: 'ave', x: B.dir < 0 ? W + 10 : -10, y: 120 + Math.random() * 70, vx: B.dir * 120, ph: Math.random() * 6, life: 6, r: 8, hp: 3, pink: a.n === 3 }); }
        if (a.t > 3) B.atk = null;
      }
      if (a.k === 'giro') {   // ele se envolve nas asas e vira um redemoinho que cruza a tela
        if (a.t < .7) { B.spin = a.t / .7; }
        else if (a.t < 2.4) { B.spin = 1; B.x = HX() + B.dir * Math.sin((a.t - .7) / 1.7 * Math.PI) * 330; if (Math.random() < dt * 6) feather(B.x, GY - 40 - Math.random() * 30, (Math.random() - .5) * 160, -120, { life: 3 }); }
        else { B.spin = Math.max(0, 1 - (a.t - 2.4) / .5); B.x = HX(); if (a.t > 3) { B.atk = null; B.spin = 0; } }
      }
      if (a.k === 'canhao') {   // BUM: a caravela atira do fundo; a bala cai em arco onde você vai estar
        const every = ph === 3 ? .5 : .75;
        if (a.t > .5 + a.n * every && a.n < a.tiros) {
          a.n++; const x0 = B.dir < 0 ? W + 6 : -6, y0 = 70, T = 1.25 + Math.random() * .25, g0 = 300;
          const alvo = Math.max(12, Math.min(W - 12, P.x + P.vx * T * .6 + (Math.random() - .5) * 30));
          foes.push({ k: 'pena', bala: 1, x: x0, y: y0, vx: (alvo - x0) / T, vy: (GY - 10 - y0 - .5 * g0 * T * T) / T, g: g0, r: 8, life: 4, pink: a.n === 2 && Math.random() < .5 });
          E.noiseHit(.35, .25, 160); wob = .12;
        }
        if (a.t > .9 + a.tiros * every) B.atk = null;
      }
      if (a.k === 'virada') {   // você ficou atrás dele: ele solta penas pra trás e PULA pro outro lado
        if (a.t < .3) { B.lean = .15; if (!a.w) { a.w = 1; if (COL) E.noiseHit(.2, .15, 900); else E.whistle(.08); for (let i = 0; i < 3 + ph; i++) feather(B.x - B.dir * 20, GY - 30 - i * 22, -B.dir * (220 + ph * 20), 0, { noPink: true }); } }
        else if (a.t < 1) { const k = (a.t - .3) / .7; if (a.x0 === undefined) { a.x0 = B.x; a.x1 = B.dir < 0 ? 100 : 380; } B.lean = 0; B.x = a.x0 + (a.x1 - a.x0) * k; B.y = GY - Math.sin(k * Math.PI) * 150; }
        else { if (!a.boom) { a.boom = 1; B.dir = -B.dir; B.x = HX(); B.y = GY; E.noiseHit(.4, .35, 200); wob = .4; for (const s2 of [-1, 1]) foes.push({ k: 'onda', x: B.x + s2 * 30, y: GY, vx: s2 * 200, life: 3, r: 10 }); } if (a.t > 1.4) B.atk = null; }
      }
      if (a.k === 'teleguiada') {
        if (a.t > .3 + a.n * .45 && a.n < 3) { a.n++; feather(B.x + B.dir * 20, GY - 120, B.dir * 80, -40, { home: ph === 3 ? 2.8 : 2.2, life: 5, pink: a.n === 2 }); }
        if (a.t > 3.2) B.atk = null;
      }
    }

    /* ---- laço ---- */
    function tick(dt) {
      stT += dt; if (msgT > 0) msgT -= dt; if (wob > 0) wob -= dt; if (bannerT > 0) bannerT -= dt; if (flashT > 0) flashT -= dt;
      if (state === 'intro') { if ((tries > 0 && stT > 2.2) || (stT > .8 && (K.J || K.F))) { state = 'luta'; stT = 0; K.J = K.F = false; } return; }
      if (state === 'perdeu') { if (stT > 2.4) { tries++; reset(); state = 'intro'; stT = 1; } return; }
      if (state === 'ganhou') { if (stT > 5.5 || (stT > 2.5 && (K.J || K.F))) fim(); return; }
      stats.t += dt;
      // você
      const sp = 150; P.vx = ((K.R ? 1 : 0) - (K.L ? 1 : 0)) * sp; if (P.vx) P.face = Math.sign(P.vx);
      if (mira.ativa && Math.abs(mira.x) > .15) P.face = Math.sign(mira.x);   // no celular, você vira pra onde mira
      if (COL) {
        if (P.preso > 0) { P.preso -= dt; P.vx = 0; P.dash = 0; if (P.preso <= 0) P.inv = Math.max(P.inv, .5); }   // a rede solta sozinha em 1,8 s; PULAR solta mais rápido
        else if (B.mare > 4 && P.y >= GY - B.mare - 1) { P.vx = P.vx * .5 + Math.sign(B.x - P.x) * 55; }   // na água: lento e a correnteza puxa pra ele
      }
      if (P.dash > 0) { P.dash -= dt; P.vx = P.face * 420; P.vy = 0; }
      P.dashCd -= dt; P.inv -= dt; P.jumpT -= dt; if (P.super > 0) P.super -= dt;
      P.vy += 900 * dt; if (P.dash > 0) P.vy = 0;
      const y0 = P.y;
      P.x = Math.max(10, Math.min(W - 10, P.x + P.vx * dt)); P.y += P.vy * dt;
      let chao = GY;
      for (const b of barris) if (b.hp > 0 && Math.abs(P.x - b.x) < 14 && y0 <= topo(b) + 4 && P.y >= topo(b) && P.vy >= 0) chao = Math.min(chao, topo(b));
      if (P.y >= chao) { P.y = chao; P.vy = 0; P.ground = true; P.jumps = 0; } else P.ground = false;
      P.fireT -= dt;
      if (K.F && P.fireT <= 0 && P.super <= 0 && !(P.preso > 0)) {
        const ax = mira.ativa ? mira.x : P.face, ay = mira.ativa ? mira.y : 0, ang = Math.atan2(ay, ax);
        if (P.gun === 0) { P.fireT = .12; shots.push({ x: P.x + ax * 10, y: P.y - 14 + ay * 10, vx: ax * 380, vy: ay * 380, d: 1, life: 1.4, c: '#f2a6c8' }); E.tone(900, .03, .015, 'square'); }
        else { P.fireT = .42; for (const a of [-.25, 0, .25]) shots.push({ x: P.x + ax * 10, y: P.y - 14 + ay * 10, vx: 320 * Math.cos(ang + a), vy: 320 * Math.sin(ang + a), d: AZEDA, life: .38, c: '#b8e05a', big: 1 }); E.tone(220, .08, .04, 'sawtooth'); }
      }
      // tiros
      for (const s of shots) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.sup) { s.tick -= dt; if (Math.abs(s.x - B.x) < 50 && !(RATA && B.sub) && s.tick <= 0 && s.resta > 0) { s.tick = .08; const d = Math.min(SUPER_TICK, s.resta); s.resta -= d; hitBoss(d, true); fx.push({ x: B.x - 20 + Math.random() * 40, y: B.y - 40 - Math.random() * 100, t: .3, c: '#ff5d8a' }); } continue; }
        if (RATA) for (const f of foes) if (R.destrutivel(f) && f.life > 0 && Math.abs(s.x - f.x) < 12 && Math.abs(s.y - f.y) < 14) { f.hp -= s.d; s.life = 0; if (f.hp <= 0) { f.life = 0; P.cards = Math.min(5, P.cards + .4); fx.push({ x: f.x, y: f.y, t: .3, c: '#fff2d6', ring: 1 }); E.tone(1500, .08, .03, 'square'); } }
        for (const f of foes) if ((f.k === 'ave' || f.k === 'rede' || f.k === 'marujo') && f.life > 0 && Math.abs(s.x - f.x) < (f.k === 'ave' ? 10 : 14) && Math.abs(s.y - f.y) < (f.k === 'marujo' ? 16 : f.k === 'rede' ? 14 : 10)) { f.hp -= s.d; s.life = 0; if (f.hp <= 0) { f.life = 0; P.cards = Math.min(5, P.cards + .4); fx.push({ x: f.x, y: f.y, t: .3, c: '#fff2d6', ring: 1 }); E.tone(1500, .08, .03, 'square'); } }
        const bt = B.spin > .5 ? 60 : 160;
        if (s.life > 0 && (RATA ? R.aceita(s) : Math.abs(s.x - B.x) < (s.r || 0) + 32 && s.y > B.y - bt && s.y < B.y - 10)) { s.life = 0; hitBoss(s.d, !!s.esp); fx.push({ x: s.x, y: s.y, t: .2, c: s.c }); }
      }
      shots = shots.filter(s => s.life > 0 && s.x > -40 && s.x < W + 40 && s.y > -40 && s.y < H + 40);
      // goiabas douradas caindo (vida)
      if (Math.random() < dt / 16 && items.length < 1) items.push({ x: 40 + Math.random() * 280, y: -10, vy: 60 });
      for (const it of items) { it.y = Math.min(GY - 8, it.y + it.vy * dt); it.life = (it.life ?? 9) - dt; if (Math.abs(it.x - P.x) < 14 && Math.abs(it.y - (P.y - 12)) < 18) { it.life = 0; P.hp = Math.min(9, P.hp + 1); say('+1 VIDA', 1); E.sfx.chime(); } }
      items = items.filter(i => i.life > 0);
      // ele
      if (B.flash > 0) B.flash -= dt; if (B.flashCd > 0) B.flashCd -= dt; if (B.puff > 0) B.puff -= dt;
      B.t += dt;
      if (COL) {
        if (B.tonto > 0) B.tonto -= dt;
        if (B.mareT > 0) { B.mareT -= dt; B.mare = Math.min(16, B.mare + dt * 16); } else B.mare = Math.max(0, B.mare - dt * 12);
        for (const b of barris) if (b.hp <= 0 && (b.resp -= dt) <= 0) { b.hp = 3; fx.push({ x: b.x, y: GY - 14, t: .3, c: '#c8a070', ring: 1 }); }
      }
      const ph = phase();
      if (RATA && ph !== B.ph) { B.ph = ph; banner = R.fases[ph - 1]; bannerT = 2.2; B.atk = null; B.cd = 1.6; B.sub = false; B.afunda = 0; B.toca = null; B.rabo = 0; B.correndo = 0; B.aperto = 0; foes = foes.filter(f => f.k !== 'aviso'); E.gritoOutro(.35); wob = .5; }
      if (ph !== B.ph) { B.ph = ph; banner = COL ? (ph === 2 ? 'FASE 2 · TERRA À VISTA!' : 'FASE 3 · O ALMIRANTE') : ph === 2 ? 'FASE 2 · ELE SE IRRITOU' : 'FASE 3 · O VULTO'; bannerT = 2.2; B.atk = null; B.cd = 1.6; B.spin = 0; B.lean = 0; B.neck = 0; B.x = HX(); B.y = GY; foes = foes.filter(f => f.k !== 'aviso'); if (COL) E.noiseHit(.5, .4, 180); else E.whistle(.12); wob = .5; }
      // ele presta atenção em você
      leitura.ar += ((P.ground ? 0 : 1) - leitura.ar) * Math.min(1, dt * .8);
      leitura.parado = Math.abs(P.vx) < 1 && P.ground ? leitura.parado + dt : 0;
      // ficou atrás dele? não tem esconderijo: ele vira e pula pro outro lado
      if (!RATA && !naFrente() && B.y >= GY - 1 && !(B.atk && (B.atk.k === 'virada' || B.atk.k === 'mergulho' || B.atk.k === 'giro' || B.atk.k === 'estocada'))) {
        B.atras += dt;
        if (B.atras > (ph === 1 ? .6 : .35)) { B.atras = 0; B.atk = COL ? { k: 'estocada', t: 0, n: 0, vezes: 1 } : { k: 'virada', t: 0, n: 0 }; B.neck = 0; B.lean = 0; B.spin = 0; }
      } else B.atras = 0;
      if (!B.atk) { B.cd -= dt; if (B.cd <= 0) { startAttack(); B.cd = (ph === 3 ? 1.05 : ph === 2 ? 1.35 : 1.7) * (COL ? 1.25 : RATA ? .72 : 1) * (ph > 1 && Math.random() < .2 ? .6 : 1) * (.85 + Math.random() * .3); } }   // na fase 2+ às vezes emenda um ataque no outro
      else runAttack(dt);
      // perigos
      for (const f of foes) {
        f.life -= dt;
        if (RATA && R.perigo(f, dt)) continue;
        if (f.k === 'aviso') { if (f.life <= 0 && f.then) f.then(); continue; }
        if (f.k === 'mira') {
          f.t += dt; if (f.t < 0) continue;
          if (f.t < f.segue) f.x += (P.x - f.x) * Math.min(1, dt * 5);
          else if (f.t >= f.segue + f.cai) {
            f.life = 0; E.noiseHit(.35, .3, 180); wob = .15; fx.push({ x: f.x, y: GY - 8, t: .35, c: '#ffb070', ring: 1 });
            let protegido = false; for (const b of barris) if (b.hp > 0 && Math.abs(f.x - b.x) < 14) { b.hp--; protegido = true; if (b.hp <= 0) b.resp = 7; }
            if (!protegido && Math.abs(P.x - f.x) < 22 && P.y > GY - 48) hurt();
          }
          continue;
        }
        if (f.k === 'rola') { f.t += dt; f.y = GY - 8 - Math.abs(Math.sin(f.t * f.bf)) * f.bh; }
        if (f.k === 'marujo') { f.ph += dt * 10; }
        if (f.home > 0) { f.home -= dt; const dx = P.x - f.x, dy = P.y - 14 - f.y, d = Math.hypot(dx, dy) || 1; f.vx += dx / d * 260 * dt; f.vy += dy / d * 260 * dt; const v = Math.hypot(f.vx, f.vy); if (v > 150) { f.vx *= 150 / v; f.vy *= 150 / v; } }
        if (f.k === 'ave') { f.ph += dt * 4; f.y += Math.cos(f.ph) * 40 * dt; }
        if (f.g) f.vy += f.g * dt;
        f.x += (f.vx || 0) * dt; f.y += (f.vy || 0) * dt;
        if (f.k === 'pena' && f.y > GY + 4 && f.vy > 0) f.life = 0;
        if (f.k === 'rede' && f.y > GY - 6) { f.y = GY - 6; f.vx = 0; f.vy = 0; f.g = 0; f.life = Math.min(f.life, .6); }
        if (COL && (f.bala || f.k === 'rola')) for (const b of barris) if (b.hp > 0 && Math.abs(f.x - b.x) < 13 && f.y > topo(b) - 4) { f.life = 0; b.hp--; if (b.hp <= 0) b.resp = 7; fx.push({ x: b.x, y: topo(b), t: .3, c: '#c8a070', ring: 1 }); E.noiseHit(.2, .15, 500); }
        if (f.life <= 0) continue;
        const hit = f.k === 'onda' ? Math.abs(f.x - P.x) < 12 && P.y > GY - 18 : Math.abs(f.x - P.x) < f.r + 6 && Math.abs(f.y - (P.y - 12)) < f.r + 11;
        if (hit && f.k === 'rede') { if (P.inv <= 0 && !(P.preso > 0)) { P.preso = 1.8; say('PRESO NA REDE! Aperte PULAR', 1.4); E.noiseHit(.3, .2, 700); } f.life = 0; continue; }
        if (hit) { if (f.pink && !P.ground && P.jumpT > 0 && tryParry()) continue; hurt(); }
      }
      foes = foes.filter(f => f.life > 0 && f.x > -40 && f.x < W + 40);
      // contato com ele, a bicada e o redemoinho
      if (RATA ? R.contato() : Math.abs(P.x - B.x) < (B.spin > .5 ? 34 : naFrente() ? 26 : 40) && P.y > B.y - (B.spin > .5 ? 60 : 150) && P.y - 30 < B.y) hurt();   // quando ele pula por cima, só pega se encostar
      if (B.neck > .3) { const tip = B.x + B.dir * (40 + B.neck * 250), hy = B.atk && B.atk.alto ? GY - 62 : GY - 22; if (Math.min(tip, B.x + B.dir * 30) < P.x && P.x < Math.max(tip, B.x + B.dir * 30) && Math.abs(P.y - 14 - hy) < 16) hurt(); }
      fx = fx.filter(f => (f.t -= dt) > 0);
      if (B.hp <= 0) { if (RATA) S.flags.lutaRata = { nota: nota(), tempo: Math.round(stats.t), tentativas: tries + 1 }; else if (COL) S.flags.lutaColombo = { nota: nota(), tempo: Math.round(stats.t), tentativas: tries + 1 }; else S.flags.luta = { nota: nota(), tempo: Math.round(stats.t), tentativas: tries + 1 }; !COL && !RATA && E.conquista && (E.conquista('nocaute'), stats.parry >= 5 && E.conquista('parry'), nota() === 'S' && E.conquista('nota_s')); state = 'ganhou'; stT = 0; setTimeout(() => fim(), 8000); /* trava de segurança: sai do NOCAUTE mesmo se o laço parar */ foes = []; items = []; if (RATA) E.gritoOutro(.4); else if (!COL) E.scream(.3); else E.noiseHit(.6, .4, 300); E.sfx.chime(); E.tone(523, .4, .06, 'triangle', null, .4); E.tone(659, .4, .06, 'triangle', null, .6); E.tone(784, .9, .06, 'triangle', null, .8); }
    }
    function hurt() {
      if (P.inv > 0 || state !== 'luta') return;
      P.hp--; P.inv = 1.9; wob = .3; stats.hits++; E.noiseHit(.3, .3, 800); E.tone(160, .25, .08, 'square', null, 0, 0, 80);
      if (P.hp <= 0) { state = 'perdeu'; stT = 0; if (RATA) E.gritoOutro(.35); else E.scream(.35); }
    }
    function nota() {
      let pts = 0;
      pts += stats.t < 80 ? 3 : stats.t < 120 ? 2 : 1;
      pts += Math.max(0, 3 - stats.hits);
      pts += Math.min(2, stats.parry);
      pts += Math.min(2, stats.supers * 2);
      return pts >= 9 ? 'S' : pts >= 7 ? 'A+' : pts >= 6 ? 'A' : pts >= 4 ? 'B' : 'C';
    }

    /* ---- desenho ---- */
    const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
    if (RATA) R.fundo(bg.getContext('2d'));
    else if (COL) { const b = bg.getContext('2d');   // a ilha dos Passarex, 1491: mar, a caravela e o bando olhando de longe
      const sk = b.createLinearGradient(0, 0, 0, GY); sk.addColorStop(0, '#4a5a9a'); sk.addColorStop(.55, '#f29a6a'); sk.addColorStop(1, '#ffd08a'); b.fillStyle = sk; b.fillRect(0, 0, W, GY);
      b.fillStyle = '#ffe6a0'; b.beginPath(); b.arc(120, 150, 34, 0, 7); b.fill();
      b.fillStyle = '#3a6a9a'; b.fillRect(0, 168, W, GY - 168); b.fillStyle = '#5a8aba'; for (let x = 0; x < W; x += 14) b.fillRect(x + (x % 28 ? 4 : 0), 176 + (x % 3) * 9, 8, 1);
      // a caravela, ancorada
      b.fillStyle = '#3a2418'; b.beginPath(); b.moveTo(318, 176); b.lineTo(428, 176); b.lineTo(416, 192); b.lineTo(330, 192); b.fill();
      b.fillRect(352, 104, 3, 74); b.fillRect(388, 92, 3, 86); b.fillStyle = '#f2e6cc';
      for (const [x, y, w, h] of [[340, 110, 28, 26], [374, 98, 32, 32], [376, 136, 28, 22]]) b.fillRect(x, y, w, h);
      b.fillStyle = '#c8302c'; b.fillRect(386, 106, 8, 2); b.fillRect(389, 103, 2, 8); b.fillRect(351, 118, 8, 2); b.fillRect(354, 115, 2, 8);
      b.fillStyle = '#1a1210'; b.fillRect(404, 184, 6, 3);
      // areia e coqueiros
      b.fillStyle = '#e8cc8a'; b.fillRect(0, GY - 10, W, 10);
      for (const [x, h] of [[30, 120], [78, 96], [450, 110]]) { b.strokeStyle = '#6a4a2a'; b.lineWidth = 5; b.beginPath(); b.moveTo(x, GY); b.quadraticCurveTo(x + 10, GY - h / 2, x + 4, GY - h); b.stroke(); b.fillStyle = '#2e6a3a'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; b.beginPath(); b.ellipse(x + 4 + Math.cos(a) * 14, GY - h + Math.sin(a) * 5, 16, 4, a, 0, 7); b.fill(); } }
      // o bando de Passarex, pequenininho no fundo, assistindo
      b.fillStyle = '#d8bc7a'; b.beginPath(); b.ellipse(214, 176, 64, 7, 0, Math.PI, 0); b.fill(); b.fillStyle = '#2e6a3a'; b.beginPath(); b.ellipse(232, 170, 22, 6, 0, Math.PI, 0); b.fill();
      for (const [x, y] of [[176, 174], [192, 173], [206, 172], [222, 172], [240, 173], [254, 174]]) { b.save(); b.translate(x, y); b.scale(.016, .016); window.drawPassarex(b, 1.6, {}); b.restore(); }
      b.fillStyle = '#5a7a3a'; b.fillRect(0, GY, W, H - GY); b.fillStyle = '#d8bc7a'; b.fillRect(0, GY, W, H - GY); b.fillStyle = '#c8ac6a'; for (let x = 0; x < W; x += 6) b.fillRect(x, GY, 3, 2);
      b.fillStyle = '#b89a5a'; b.fillRect(0, GY + 10, W, 8);
    } else { const b = bg.getContext('2d');
      const sk = b.createLinearGradient(0, 0, 0, GY); sk.addColorStop(0, '#3a2a52'); sk.addColorStop(.6, '#c86a5a'); sk.addColorStop(1, '#f2b07a'); b.fillStyle = sk; b.fillRect(0, 0, W, GY);
      b.fillStyle = '#ffd08a'; b.beginPath(); b.arc(300, 150, 40, 0, 7); b.fill();
      b.fillStyle = '#2a1e30';
      // a catedral de Naviraí no contraluz: abas em tenda até a cruz, e o campanário de duas colunas
      const CX = 272, arcoB = (w, h, t) => [CX + Math.sign(t) * w * Math.pow(Math.abs(t), 1.6), GY - h * Math.pow(1 - Math.abs(t), 1.2)];
      for (let k = 3; k >= 0; k--) { const w = 58 + k * 10, h = 150 - k * 19; b.fillStyle = k % 2 ? '#2a1e30' : '#33243a'; b.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = arcoB(w, h, i / 20 - 1); i ? b.lineTo(x, y) : b.moveTo(x, y); } b.fill(); }
      b.strokeStyle = '#4a3650'; b.lineWidth = 1; for (let k = 0; k < 4; k++) { const w = 58 + k * 10, h = 150 - k * 19; b.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = arcoB(w, h, i / 20 - 1); i ? b.lineTo(x, y) : b.moveTo(x, y); } b.stroke(); }
      b.fillStyle = '#2a1e30'; b.fillRect(CX - 1, GY - 170, 3, 22); b.fillRect(CX - 7, GY - 163, 15, 3);
      b.fillRect(186, GY - 140, 4, 140); b.fillRect(200, GY - 140, 4, 140); for (let y = GY - 130; y < GY - 10; y += 24) { b.fillRect(186, y, 18, 3); }
      b.fillStyle = '#ffd08a'; for (let y = GY - 130; y < GY - 10; y += 24) b.fillRect(194, y + 5, 2, 2);
      b.fillStyle = '#2a1e30';
      for (const [x, r] of [[40, 30], [110, 22], [175, 30], [400, 28], [455, 24]]) { b.fillRect(x - 3, GY - 40, 6, 40); b.beginPath(); b.arc(x, GY - 50, r, 0, 7); b.fill(); }
      b.fillRect(135, GY - 34, 34, 4); b.beginPath(); b.moveTo(130, GY - 34); b.lineTo(152, GY - 52); b.lineTo(174, GY - 34); b.fill(); b.fillRect(137, GY - 30, 3, 30); b.fillRect(164, GY - 30, 3, 30);
      b.fillStyle = '#5a7a3a'; b.fillRect(0, GY, W, H - GY); b.fillStyle = '#4a6a30'; for (let x = 0; x < W; x += 6) b.fillRect(x, GY, 3, 2);
      b.fillStyle = '#8a7a60'; b.fillRect(0, GY + 10, W, 8);
    }
    function drawFeather(f) {
      if (COL) {   // balas de canhão e de mosquete (as rosas dá pra rebater)
        const r = f.bala ? 7 : 4.5; g.fillStyle = f.pink ? '#ff8fb1' : '#1a1418'; g.beginPath(); g.arc(f.x, f.y, r, 0, 7); g.fill();
        g.fillStyle = f.pink ? '#fff' : '#6a6070'; g.fillRect(f.x - r * .4, f.y - r * .5, 2, 2); return;
      }
      const a = Math.atan2(f.vy || 0, f.vx || -1);
      g.save(); g.translate(f.x, f.y); g.rotate(a);
      g.fillStyle = f.pink ? '#ff8fb1' : '#1a1220'; g.beginPath(); g.ellipse(0, 0, 11, 4, 0, 0, 7); g.fill();
      g.fillStyle = '#f4e2a8'; g.fillRect(-12, -1, 4, 2); g.strokeStyle = f.pink ? '#fff' : '#6a5a7a'; g.beginPath(); g.moveTo(-11, 0); g.lineTo(11, 0); g.stroke();
      g.restore();
    }
    function drawBird(f) {
      g.save(); g.translate(f.x, f.y);
      g.fillStyle = f.pink ? '#ff8fb1' : '#2a1e30'; g.beginPath(); g.ellipse(0, 0, 7, 5, 0, 0, 7); g.fill();
      const w = Math.sin(f.ph * 3) * 5; g.beginPath(); g.moveTo(-2, 0); g.lineTo(3, -6 - w); g.lineTo(6, 0); g.fill();
      g.fillStyle = '#f4e2a8'; g.fillRect(-5, -2, 2, 2); g.fillStyle = '#f0a040'; g.fillRect(-9, 0, 3, 2);
      g.restore();
    }
    function drawYou() {
      if (P.inv > 0 && P.super <= 0 && Math.floor(P.inv * 10) % 2) return;
      const x = P.x, y = P.y, f = P.face;
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x, GY + 2, 9, 3, 0, 0, 7); g.fill();
      if (P.dash > 0) { g.fillStyle = 'rgba(255,233,168,.35)'; g.fillRect(x - f * 26, y - 22, 22, 18); }
      const sk = E.skinCanvas && E.skinCanvas();   // a skin escolhida (ou você com a roupa) também luta
      if (sk) { g.save(); g.translate(x, y); if (f < 0) g.scale(-1, 1); g.drawImage(sk, -17, -44, 34, 45); g.restore(); }
      else {
      g.fillStyle = '#2a3a6a'; g.fillRect(x - 5, y - 8, 4, 8); g.fillRect(x + 1, y - 8, 4, 8);
      g.fillStyle = '#e8e0d0'; g.fillRect(x - 6, y - 20, 12, 13);
      g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(x, y - 25, 6, 0, 7); g.fill();
      g.fillStyle = '#c8302c'; g.fillRect(x - 7, y - 32, 13, 4); g.fillRect(x + (f > 0 ? 3 : -9), y - 29, 6, 2);
      g.fillStyle = '#1a1a1a'; g.fillRect(x + f * 2, y - 26, 2, 2);
      }
      g.fillStyle = P.gun ? '#b8e05a' : '#f2a6c8'; g.fillRect(x + (f > 0 ? 4 : -14), y - 17, 10, 5);
      g.fillStyle = '#3a6a2a'; g.fillRect(x + (f > 0 ? 12 : -16), y - 16, 4, 3);
      if (P.cards >= 5) { g.strokeStyle = `rgba(255,143,177,${.4 + .4 * Math.sin(stT * 10)})`; g.lineWidth = 2; g.strokeRect(x - 9, y - 35, 18, 36); }
    }
    function drawCena() {   // barris, maré e o cone da luneta (só na luta do Colombo)
      if (!COL) return;
      for (const b of barris) { if (b.hp <= 0) continue; const y = topo(b); g.fillStyle = '#7a4a24'; g.fillRect(b.x - 12, y, 24, 28); g.fillStyle = '#5a3418'; g.fillRect(b.x - 12, y + 6, 24, 3); g.fillRect(b.x - 12, y + 19, 24, 3); g.fillStyle = '#9a6a3a'; g.fillRect(b.x - 10, y + 1, 4, 26); if (b.hp < 3) { g.strokeStyle = '#2a1a10'; g.beginPath(); g.moveTo(b.x - 4, y + 2); g.lineTo(b.x + 2, y + 12); g.lineTo(b.x - 2, y + 20); g.stroke(); } }
      if (B.atk && B.atk.k === 'luneta' && B.atk.cx !== undefined) { const ox = B.x + B.dir * 22, oy = B.y - 150, cx = B.atk.cx; g.fillStyle = B.atk.viu ? 'rgba(255,60,40,.28)' : 'rgba(255,240,140,.22)'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(cx - 30, GY); g.lineTo(cx + 30, GY); g.closePath(); g.fill(); }
    }
    function drawAgua() {
      if (!COL || B.mare <= .5) return;
      g.fillStyle = 'rgba(60,120,190,.55)'; g.fillRect(0, GY - B.mare, W, B.mare + 14);
      g.fillStyle = 'rgba(200,235,255,.7)'; for (let x = 0; x < W; x += 12) g.fillRect(x + Math.sin(B.t * 3 + x) * 3, GY - B.mare - 1, 7, 2);
    }
    function drawBoss() {
      if (RATA) return R.desenha(state === 'ganhou', stT);
      if (COL) desenhaColombo(B.tonto > 0 ? B.t * .3 : B.t);
      const img0 = COL ? colCv : phase() === 3 ? PX.sil : PX.cor, img = B.flash > 0 ? branco(img0) : img0, bob = Math.sin(B.t * 3) * 2;
      g.save(); g.translate(B.x, B.y + bob);
      if (state === 'ganhou') g.rotate(Math.min(1.4, stT * 2));
      if (B.dir > 0) g.scale(-1, 1);   // virado pra direita
      if (B.spin > 0) {   // se envolvendo nas asas: um redemoinho de penas
        const k = B.spin;
        g.save(); g.scale(Math.cos(B.t * 22) * (1 - k * .3), 1 - k * .35); g.drawImage(img, -65, -182); g.restore();
        g.fillStyle = 'rgba(20,14,26,' + (.75 * k) + ')';
        for (let i = 0; i < 10; i++) { const a = B.t * 14 + i * .63; g.beginPath(); g.ellipse(Math.cos(a) * 34, -40 + Math.sin(a * 1.3) * 26, 14, 5, a, 0, 7); g.fill(); }
      } else {
        g.rotate(B.lean);
        if (B.puff > 0) g.scale(1 + B.puff * .12, 1 + B.puff * .06);
        g.drawImage(img, -65, -182);
        if (B.neck > 0 && COL) {   // a estocada: a espada estica até a ponta
          const hy = (B.atk && B.atk.alto ? -62 : -22) - bob, tip = -40 - B.neck * 250;
          g.rotate(-B.lean);
          g.strokeStyle = '#3a2418'; g.lineWidth = 5; g.beginPath(); g.moveTo(-18, -96); g.lineTo(-38, hy); g.stroke();
          g.fillStyle = '#d8b040'; g.fillRect(-44, hy - 7, 6, 14);
          g.strokeStyle = '#e8ecf4'; g.lineWidth = 3; g.beginPath(); g.moveTo(-44, hy); g.lineTo(tip, hy); g.stroke();
          g.strokeStyle = '#9aa0b0'; g.lineWidth = 1; g.beginPath(); g.moveTo(-44, hy + 1); g.lineTo(tip + 4, hy + 1); g.stroke();
        } else if (B.neck > 0) {   // a bicada: o pescoço estica até a ponta do bico
          const hy = (B.atk && B.atk.alto ? -62 : -22) - bob, tip = -40 - B.neck * 250;
          g.rotate(-B.lean);
          g.strokeStyle = phase() === 3 ? '#0b080d' : '#e9c0a0'; g.lineWidth = 9; g.beginPath(); g.moveTo(-20, -130); g.quadraticCurveTo(-60, hy - 30, tip + 20, hy); g.stroke();
          g.fillStyle = phase() === 3 ? '#0b080d' : '#e9c0a0'; g.beginPath(); g.arc(tip + 24, hy, 13, 0, 7); g.fill();
          g.fillStyle = '#f0a040'; g.beginPath(); g.moveTo(tip + 14, hy - 5); g.lineTo(tip - 6, hy); g.lineTo(tip + 14, hy + 5); g.fill();
          g.fillStyle = '#f4e2a8'; g.fillRect(tip + 20, hy - 5, 3, 3);
        }
        if (B.atk && B.atk.k === 'bicada' && B.neck === 0 && B.atk.t % 1.25 < .6) { g.rotate(-B.lean); if (B.dir > 0) g.scale(-1, 1); g.fillStyle = '#ff5d4e'; g.font = 'bold 22px monospace'; g.textAlign = 'center'; g.fillText('!', B.dir * 40, -190); g.font = '9px monospace'; g.fillText(B.atk.alto ? 'fique no chão' : 'pule!', B.dir * 40, -178); }
      }
      if (COL) {
        if (B.luneta > 0) { g.save(); g.fillStyle = '#c8a040'; g.translate(-24, -150); g.rotate(-.25 * B.luneta); g.fillRect(-22, -3, 26, 6); g.fillStyle = '#3a2418'; g.fillRect(-24, -4, 4, 8); g.restore(); }   // a luneta, do lado pra onde ele olha
        g.save(); if (B.dir > 0) g.scale(-1, 1);   // textos sempre legíveis
        if (B.prep) { g.fillStyle = '#ff5d4e'; g.font = 'bold 20px monospace'; g.textAlign = 'center'; g.fillText('!', 0, -196); }
        if (B.tonto > 0) { g.fillStyle = '#ffe9a8'; g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillText('?', 0, -200 + Math.sin(B.t * 6) * 3); for (let i = 0; i < 3; i++) { const a = B.t * 4 + i * 2.1; g.fillRect(Math.cos(a) * 22 - 2, -190 + Math.sin(a) * 6, 4, 4); } }
        g.restore();
      }
      g.restore();
    }
    function draw() {
      g.setTransform(1, 0, 0, 1, 0, 0);
      const sh = wob > 0 ? (Math.random() - .5) * 8 : 0;
      g.translate(sh, sh * .5);
      g.drawImage(bg, 0, 0);
      drawCena();
      drawBoss();
      for (const f of foes) {
        if (RATA && R.desenhaPerigo(f)) continue;
        if (f.k === 'aviso') { g.fillStyle = `rgba(255,60,60,${.35 + .3 * Math.sin(stT * 20)})`; g.beginPath(); g.ellipse(f.x, GY + 3, f.big ? 30 : 10, 3, 0, 0, 7); g.fill(); }
        else if (f.k === 'onda') { g.strokeStyle = COL ? '#8ad0ff' : '#fff2d6'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(f.x + k * 7, GY, 10 + k * 3, Math.PI * .6, Math.PI * 1.4); g.stroke(); } }
        else if (f.k === 'ave') drawBird(f);
        else if (f.k === 'mira') { if (f.t < 0) continue; const trav = f.t >= f.segue; g.strokeStyle = trav ? '#ff3a2a' : 'rgba(255,90,60,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(f.x, GY - 6, trav ? 10 : 14, 0, 7); g.stroke(); g.beginPath(); g.moveTo(f.x - 16, GY - 6); g.lineTo(f.x + 16, GY - 6); g.moveTo(f.x, GY - 22); g.lineTo(f.x, GY + 10); g.stroke();
          if (trav) { const k = (f.t - f.segue) / f.cai; g.fillStyle = '#1a1418'; g.beginPath(); g.arc(f.x, -10 + k * (GY - 4), 7, 0, 7); g.fill(); } }
        else if (f.k === 'rede') { g.strokeStyle = '#d8c090'; g.lineWidth = 1; for (let i = -12; i <= 12; i += 6) { g.beginPath(); g.moveTo(f.x + i, f.y - 12); g.lineTo(f.x + i, f.y + 12); g.stroke(); g.beginPath(); g.moveTo(f.x - 12, f.y + i); g.lineTo(f.x + 12, f.y + i); g.stroke(); } g.fillStyle = '#8a6a3a'; for (const [dx, dy] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) g.fillRect(f.x + dx - 2, f.y + dy - 2, 4, 4); }
        else if (f.k === 'marujo') { const x = f.x, y = f.y + 12, pe = Math.sin(f.ph) * 3; g.fillStyle = '#2a3a6a'; g.fillRect(x - 5 + pe, y - 9, 4, 9); g.fillRect(x + 1 - pe, y - 9, 4, 9); g.fillStyle = '#f2f2f2'; g.fillRect(x - 6, y - 21, 12, 12); g.fillStyle = '#2a4a9a'; for (let k = 0; k < 3; k++) g.fillRect(x - 6, y - 19 + k * 4, 12, 1.5); g.fillStyle = '#e0b08a'; g.beginPath(); g.arc(x, y - 26, 5, 0, 7); g.fill(); g.fillStyle = '#c8302c'; g.fillRect(x - 5, y - 32, 10, 3); g.strokeStyle = '#d8c090'; g.lineWidth = 1; g.strokeRect(x + (f.vx > 0 ? 5 : -13), y - 22, 8, 8); }
        else drawFeather(f);
      }
      for (const it of items) { g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(it.x, it.y, 6 + Math.sin(stT * 6), 0, 7); g.fill(); g.fillStyle = '#3a6a2a'; g.fillRect(it.x - 1, it.y - 9, 3, 4); }
      for (const s of shots) {
        if (s.sup) { g.fillStyle = 'rgba(255,93,138,.85)'; g.beginPath(); g.arc(s.x, s.y, 24 + Math.sin(stT * 30) * 3, 0, 7); g.fill(); g.fillStyle = '#fff2d6'; g.beginPath(); g.arc(s.x, s.y, 10, 0, 7); g.fill(); g.fillStyle = '#3a6a2a'; g.fillRect(s.x - 3, s.y - 30, 6, 8); continue; }
        g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, s.big === 2 ? 8 : s.big ? 4 : 3, 0, 7); g.fill(); g.fillStyle = '#3a6a2a'; g.fillRect(s.x - 1, s.y - (s.big === 2 ? 10 : s.big ? 5 : 4), 2, 2);
      }
      for (const f of fx) { g.globalAlpha = Math.min(1, f.t * 4); if (f.ring) { g.strokeStyle = f.c; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, 18 - f.t * 30, 0, 7); g.stroke(); } else { g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, 7 - f.t * 20, 0, 7); g.fill(); } g.globalAlpha = 1; }
      drawYou();
      if (COL && P.preso > 0) { g.strokeStyle = '#d8c090'; g.lineWidth = 1; for (let i = -12; i <= 12; i += 5) { g.beginPath(); g.moveTo(P.x + i, P.y - 34); g.lineTo(P.x + i, P.y); g.stroke(); g.beginPath(); g.moveTo(P.x - 12, P.y - 34 + (i + 12) * 1.3); g.lineTo(P.x + 12, P.y - 34 + (i + 12) * 1.3); g.stroke(); } }
      drawAgua();
      g.setTransform(1, 0, 0, 1, 0, 0);
      if (flashT > 0) { g.fillStyle = 'rgba(255,240,250,.25)'; g.fillRect(0, 0, W, H); }
      // HUD
      g.fillStyle = '#000a'; g.fillRect(120, 8, 240, 10); g.fillStyle = phase() === 3 ? '#c8302c' : '#f2c84a'; g.fillRect(122, 10, 236 * Math.max(0, B.hp / B.max), 6);
      g.fillStyle = '#fff'; g.font = '9px monospace'; g.textAlign = 'center'; g.fillText(RATA ? 'RATABRUMGA' : COL ? 'CRISTÓVÃO COLOMBO' : 'PASSAREX', 240, 28);
      g.textAlign = 'left'; g.fillStyle = '#000a'; g.fillRect(8, H - 24, 210, 18);
      g.fillStyle = P.hp > 1 ? '#fff' : '#ff5d4e'; g.font = '11px monospace'; g.fillText('VIDA ' + '♥'.repeat(Math.max(0, P.hp)), 12, H - 11);
      for (let i = 0; i < 5; i++) { const fill = Math.max(0, Math.min(1, P.cards - i)); g.fillStyle = '#3a2a3a'; g.fillRect(100 + i * 12, H - 21, 9, 13); g.fillStyle = fill >= 1 ? '#ff8fb1' : '#8a5a6a'; g.fillRect(100 + i * 12, H - 21 + 13 * (1 - fill), 9, 13 * fill); }
      g.fillStyle = P.gun ? '#b8e05a' : '#f2a6c8'; g.fillText(P.gun ? 'AZEDA' : 'DOCE', 166, H - 11);
      for (let i = 0; i < 90; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.25)' : 'rgba(255,240,220,.15)'; g.fillRect(Math.random() * W, Math.random() * H, 1, 1); }
      const vg = g.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,15,5,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      g.textAlign = 'center';
      const big = (t, y, c = '#ffe9a8', s = 30) => { g.font = `bold ${s}px monospace`; g.fillStyle = '#000'; g.fillText(t, W / 2 + 2, y + 2); g.fillStyle = c; g.fillText(t, W / 2, y); };
      if (state === 'intro') {
        big(RATA ? 'RATABRUMGA' : COL ? 'COLOMBO' : 'PASSAREX', 50, '#ffe9a8', 30); g.font = '11px monospace'; g.fillStyle = '#e8d8c8'; g.fillText(RATA ? 'índole questionável' : COL ? 'o almirante de 1491' : 'o arauto do fiu fiu', W / 2, 66);
        g.fillStyle = '#000b'; g.fillRect(70, 76, 340, COL ? 166 : RATA ? 152 : 138); g.textAlign = 'left'; g.font = '10px monospace';
        const L2 = touch ? [['JOYSTICK ESQ.', 'andar'], ['JOYSTICK DIR.', 'aponte pra mirar e atirar'], ['PULA', 'pular (2x = pulo duplo)'], ['DASH', 'desvia rápido (fica invencível)'], ['TROCA', 'doce (rápida) ⇄ azeda (forte e curta)'], ['ESPECIAL', 'gasta as cartas rosas']]
          : [['A  D', 'andar'], ['ESPAÇO', 'pular (2x = pulo duplo)'], ['CLIQUE', 'segure pra atirar goiaba'], ['SHIFT', 'desvia rápido (fica invencível)'], ['Q / rodinha', 'doce (rápida) ⇄ azeda (forte e curta)'], ['CLIQUE DIR. / E', 'especial: gasta as cartas rosas']];
        L2.forEach(([k, d], i) => { g.fillStyle = '#ffe9a8'; g.fillText(k, 84, 94 + i * 15); g.fillStyle = '#e8d8c8'; g.fillText(d, 200, 94 + i * 15); });
        g.fillStyle = '#ff8fb1'; g.fillText(RATA ? 'Queijos ROSAS: pule de novo encostado = PARRY' : COL ? 'Balas ROSAS: pule de novo encostado nelas = PARRY' : 'Penas ROSAS: pule de novo encostado nelas = PARRY (enche carta)', 84, 94 + 6 * 15 + 4);
        if (RATA) { g.fillStyle = '#9fd8ff'; g.fillText('Rachadura com “!”: ela vai sair BEM ALI', 84, 94 + 7 * 15 + 4); }
        if (COL) { g.fillStyle = '#9fd8ff'; g.fillText('LUNETA: se esconda atrás de um BARRIL (ele fica tonto)', 84, 94 + 7 * 15 + 4); g.fillText('REDE: aperte PULAR várias vezes · ESPADA: use o DASH', 84, 94 + 8 * 15 + 4); }
        g.textAlign = 'center';
        if (Math.floor(stT * 2) % 2) big(touch ? 'TOQUE EM PULA PRA LUTAR' : 'APERTE ESPAÇO PRA LUTAR', COL ? 258 : RATA ? 246 : 236, '#ff8f6a', 16);
      }
      if (state === 'perdeu') { big(RATA ? 'VOCÊ VIROU QUEIJO' : COL ? 'VOCÊ FOI PRO MAR' : 'VOCÊ FOI DE PENAS', 120, '#ff8f6a', 24); g.font = '12px monospace'; g.fillStyle = '#e8d8c8'; g.fillText('tentando de novo (um pouco mais fácil)...', W / 2, 146); }
      if (state === 'ganhou' && stT > .4) {
        big('NOCAUTE!', 92, '#ffe9a8', 40);
        if (stT > 1.2) { g.fillStyle = '#000b'; g.fillRect(140, 112, 200, 100); g.font = '12px monospace'; g.fillStyle = '#e8d8c8'; g.textAlign = 'left';
          const mm = Math.floor(stats.t / 60), ss = String(Math.floor(stats.t % 60)).padStart(2, '0');
          g.fillText(`tempo ......... ${mm}:${ss}`, 152, 132); g.fillText(`vida .......... ${'♥'.repeat(Math.max(0, P.hp))}`, 152, 148); g.fillText(`parry ......... ${stats.parry}`, 152, 164); g.fillText(`super goiabada  ${stats.supers}`, 152, 180);
          g.textAlign = 'center'; g.font = 'bold 22px monospace'; g.fillStyle = '#ff8fb1'; g.fillText('NOTA ' + nota(), W / 2, 204); }
      }
      if (bannerT > 0) big(banner, 70, '#ff8f6a', 18);
      if (msgT > 0) { g.font = '12px monospace'; g.fillStyle = '#fff'; g.fillText(msg, W / 2, H - 34); }
    }
    function loop(now) {
      const dt = Math.min(.04, (now - last) / 1000); last = now;
      tick(dt); if (raf !== -1) draw();
      if (raf !== -1) raf = requestAnimationFrame(loop);
    }
    let acabou = false;
    function fim() {
      if (acabou) return; acabou = true;
      E.setMusic && E.setMusic(musAntes === 'chefao' ? 'trilha' : (musAntes || 'trilha'), .22);
      cancelAnimationFrame(raf); raf = -1;
      E.soltarTeclas && E.soltarTeclas();
      removeEventListener('keydown', down, true); removeEventListener('keyup', up, true); removeEventListener('pointerup', pu);
      ov.remove(); S.painting = false; S.noteOpen = false;
      resolve();
    }
    reset();
    raf = requestAnimationFrame(loop);
    E.bossDebug = { chefe: opts.chefe || 'passarex', atacar: k => R && R.start(phase(), k), win: () => { B.hp = 0; }, get: () => ({ P, B, state, stats }), cards: n => { P.cards = n; }, K, pausar: () => { cancelAnimationFrame(raf); raf = -2; }, passo: dt => { tick(dt); draw(); }, pular: () => { state = 'luta'; stT = 0; }, fechar: () => fim() };
  });
}
