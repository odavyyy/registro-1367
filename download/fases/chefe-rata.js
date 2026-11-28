// A RATABRUMGA · o chefe de dentro da árvore. Usa o mesmo motor da luta (boss.js): suas goiabas, parry e cartas.
// Fase 1: queijo em arco, toca (some na terra; a rachadura com "!" mostra onde ela sai), roda de queijo, rabada.
// Fase 2: + chuva de queijo suíço, fedor de gorgonzola, filhotes e a corrida. Fase 3: + ratoeiras, tudo mais rápido.
export function criaRata(c) {
  const { E, W, H, GY, g } = c;
  const img = E.clubImg('ratabrumga');
  const brancoCv = document.createElement('canvas'), alt = 66, larg = () => Math.round(alt * (img.aspect || 1.9));
  const preso = x => Math.max(36, Math.min(W - 36, x));
  const R = {};
  R.fases = ['', 'FASE 2 · O GORGONZOLA', 'FASE 3 · O BANQUETE'];

  R.reset = (B) => { Object.assign(B, { x: 380, y: GY, sub: false, afunda: 0, toca: null, aperto: 0, rabo: 0, correndo: 0 }); };

  const queijo = (x, y, vx, vy, o = {}) => c.add({ k: 'queijo', x, y, vx, vy, g: o.g || 0, r: o.r || 7, life: o.life || 4, pink: o.pink, gira: Math.random() * 6 });

  R.start = (ph, forca) => {
    const B = c.B(), P = c.P(), d = Math.abs(P.x - B.x);
    const lista = ph === 1 ? ['queijo', 'toca', 'roda', 'rabada'] : ph === 2 ? ['queijo', 'toca', 'roda', 'rabada', 'suico', 'fedor', 'filhotes', 'corrida'] : ['queijo', 'toca', 'roda', 'rabada', 'suico', 'fedor', 'filhotes', 'corrida', 'ratoeira'];
    const peso = { queijo: 1.5, toca: 2.2, roda: 1, rabada: .3, suico: 1, fedor: .8, filhotes: .8, corrida: .9, ratoeira: 1.4 };
    if (d < 100) { peso.rabada += 3; peso.corrida += .8; } else if (d > 220) { peso.queijo += 1; peso.roda += 1; }
    const ops = lista.filter(x => x !== B.last && x !== B.last2); let tot = 0; for (const x of ops) tot += peso[x];
    let r = Math.random() * tot, a = ops[0]; for (const x of ops) { r -= peso[x]; if (r <= 0) { a = x; break; } }
    if (forca) a = forca;
    B.last2 = B.last; B.last = a; B.atk = { k: a, t: 0, n: 0 };
    B.dir = Math.sign(P.x - B.x) || B.dir;
    if (a === 'toca') { B.atk.vezes = ph === 3 ? 3 : ph === 2 ? 2 : 1; B.atk.i = 0; E.noiseHit(.6, .25, 300); c.say('ELA ENTROU NA TERRA', .9); }
    if (a === 'suico') { const n = 4 + ph * 2; for (let i = 0; i < n; i++) { const x = i % 3 === 0 ? preso(P.x + P.vx * .4) : 16 + Math.random() * (W - 32); c.add({ k: 'aviso', x, y: GY, life: .75 + i * .17, then: () => queijo(x, -10, 0, 200 + ph * 25, { r: 7 }) }); } E.tone(900, .15, .03, 'square', null, 0, 0, 1400); }
    if (a === 'rabada') E.tone(500, .15, .05, 'square');
    if (a === 'ratoeira') { const xs = [preso(P.x), preso(P.x + 95), preso(P.x - 95)]; xs.forEach((x, i) => c.add({ k: 'ratoeira', x, y: GY - 5, t: -i * .35, r: 11, life: 3.4 })); c.say('RATOEIRAS!', .9); }
  };

  R.run = (dt, a, ph) => {
    const B = c.B(), P = c.P(), olha = () => { B.dir = Math.sign(P.x - B.x) || B.dir; };
    const acaba = () => { B.atk = null; B.aperto = 0; B.rabo = 0; B.correndo = 0; };
    if (a.k === 'queijo') {   // ela enrola o braço e arremessa os queijos em arco
      olha(); const every = ph === 3 ? .34 : ph === 2 ? .45 : .6, tot = 2 + ph;
      if (a.n < tot && a.t > .55 + a.n * every) {
        a.n++; const x0 = B.x + B.dir * 26, y0 = GY - 48, T = .85 + Math.random() * .25, g0 = 420;
        const alvo = preso(P.x + P.vx * T * (a.n % 2 ? .6 : 0) + (Math.random() - .5) * 40);
        queijo(x0, y0, (alvo - x0) / T, (GY - 10 - y0 - .5 * g0 * T * T) / T, { g: g0, pink: a.n === 2 });
        B.aperto = .2; E.noiseHit(.1, .14, 1700, null, 'bandpass');
      }
      if (a.t > .9 + tot * every) acaba();
      return;
    }
    if (a.k === 'toca') {   // afunda → o montinho corre pela terra → a rachadura trava (com "!") → ela sai
      const corre = ph === 3 ? .55 : .75, aviso = ph === 3 ? .6 : ph === 2 ? .7 : .85;
      if (a.fase === undefined) { a.fase = 'desce'; a.ft = 0; }
      a.ft += dt;
      if (a.fase === 'desce') { B.afunda = Math.min(1, a.ft / .45); if (a.ft >= .45) { B.sub = true; a.fase = 'corre'; a.ft = 0; B.toca = { x: B.x, trava: false }; } return; }
      if (a.fase === 'corre') {
        B.toca.x += Math.sign(P.x - B.toca.x) * Math.min(Math.abs(P.x - B.toca.x), (170 + ph * 25) * dt);
        if (Math.random() < dt * 14) c.fx({ x: B.toca.x + (Math.random() - .5) * 20, y: GY - 2, t: .25, c: '#7a5230' });
        if (a.ft >= corre) { a.fase = 'avisa'; a.ft = 0; B.toca = { x: preso(P.x + P.vx * .18), trava: true }; E.tone(180, .5, .06, 'sawtooth', null, 0, 0, 520); E.noiseHit(aviso, .22, 260); }
        return;
      }
      if (a.fase === 'avisa') {
        if (a.ft >= aviso) {
          a.fase = 'sai'; a.ft = 0; B.sub = false; B.x = B.toca.x; B.afunda = 1; olha(); c.tremer(.35); E.noiseHit(.45, .4, 190);
          if (Math.abs(P.x - B.x) < 32 && P.y > GY - 84) c.hurt();
          if (ph > 1) for (const s of [-1, 1]) queijo(B.x + s * 20, GY - 30, s * 120, -230, { g: 520, r: 6 });
          B.toca = null;
        }
        return;
      }
      B.afunda = Math.max(0, 1 - a.ft / .18);
      a.i = a.i || 0;
      const resto = a.i + 1 < a.vezes ? .55 : 1.25;   // depois da última ela fica de fora, tonta: hora de bater
      if (a.ft >= resto) { if (++a.i < a.vezes) { a.fase = 'desce'; a.ft = 0; } else acaba(); }
      return;
    }
    if (a.k === 'roda') {   // a rodona de queijo rolando: pule
      olha(); const tot = ph === 3 ? 2 : 1;
      if (a.n < tot && a.t > .65 + a.n * .85) { a.n++; c.add({ k: 'roda', x: B.x + B.dir * 34, y: GY - 13, vx: B.dir * (165 + ph * 25), r: 12, life: 5, gira: 0 }); E.noiseHit(.4, .25, 130); }
      B.aperto = a.t < .65 ? a.t / .65 * .25 : 0;
      if (a.t > 1.3 + tot * .85) acaba();
      return;
    }
    if (a.k === 'rabada') {   // gira e varre o chão com o rabo: pule
      if (a.t < .55) { B.rabo = -1; return; }
      if (a.t < .85) { const k = (a.t - .55) / .3; B.rabo = k; if (!a.som) { a.som = 1; E.noiseHit(.22, .25, 1500, null, 'highpass'); } if (Math.abs(P.x - B.x) < 30 + k * 85 && P.y > GY - 16) c.hurt(); return; }
      B.rabo = 0; if (a.t > 1.35) acaba();
      return;
    }
    if (a.k === 'corrida') {   // dispara até o outro canto: pulo duplo ou dash
      if (a.t < .6) { olha(); B.aperto = .3; a.alvo = P.x < W / 2 ? 40 : W - 40; if (Math.abs(a.alvo - B.x) < 140) a.alvo = B.x < W / 2 ? W - 40 : 40; B.dir = Math.sign(a.alvo - B.x) || B.dir; return; }
      B.aperto = 0; B.correndo = 1; const d = a.alvo - B.x, passo = (300 + ph * 30) * dt;
      if (Math.abs(d) <= passo) { B.x = a.alvo; B.correndo = 0; olha(); if (!a.fim) a.fim = a.t; if (a.t - a.fim > .35) acaba(); } else B.x += Math.sign(d) * passo;
      if (Math.random() < dt * 20) c.fx({ x: B.x - B.dir * 30, y: GY - 3, t: .2, c: '#8a6a4a' });
      return;
    }
    if (a.k === 'fedor') {   // nuvens de gorgonzola que vêm devagar atrás de você: atire nelas
      olha(); const tot = 1 + ph;
      if (a.n < tot && a.t > .4 + a.n * .5) { a.n++; c.add({ k: 'fedor', x: B.x, y: GY - 80 - Math.random() * 40, vx: B.dir * 40, vy: 0, home: 3.2, r: 9, hp: 3, life: 5.5, pink: a.n === 2 }); E.noiseHit(.3, .12, 700, null, 'bandpass'); }
      if (a.t > .8 + tot * .5) acaba();
      return;
    }
    if (a.k === 'filhotes') {   // ratinhos atravessando o chão: pule ou derrube
      const tot = 1 + ph;
      if (a.n < tot && a.t > .35 + a.n * .65) { a.n++; const de = a.n % 2 ? 1 : -1; c.add({ k: 'filhote', x: de > 0 ? -12 : W + 12, y: GY - 6, vx: de * (105 + ph * 12), r: 6, hp: 2, life: 7, ph: Math.random() * 6 }); E.tone(1900, .06, .03, 'square'); }
      if (a.t > .8 + tot * .65) acaba();
      return;
    }
    if (a.k === 'suico') { olha(); if (a.t > 2.4 + ph * .25) acaba(); return; }
    if (a.k === 'ratoeira') { olha(); if (a.t > 2.3) acaba(); return; }
    acaba();
  };

  // perigos próprios; true = já resolvido aqui (o laço comum não mexe)
  R.perigo = (f, dt) => {
    const P = c.P();
    if (f.k === 'queijo') { f.gira += dt * 9; if (f.y > GY - 3 && f.vy > 0) { f.life = 0; c.fx({ x: f.x, y: GY - 4, t: .22, c: '#e8b030' }); } return false; }
    if (f.k === 'roda') { f.gira += dt * 10 * Math.sign(f.vx); return false; }
    if (f.k === 'ratoeira') {
      f.t += dt;
      if (f.t >= .95 && !f.pegou) { f.pegou = 1; E.noiseHit(.1, .3, 3000, null, 'highpass'); if (Math.abs(P.x - f.x) < 17 && P.y > GY - 20) c.hurt(); }
      else if (f.pegou && f.t < 1.5 && Math.abs(P.x - f.x) < 12 && P.y > GY - 8) c.hurt();
      if (f.t > 1.9) f.life = 0;
      return true;
    }
    return false;
  };
  R.destrutivel = f => f.k === 'fedor' || f.k === 'filhote';

  R.aceita = s => { const B = c.B(); return !B.sub && B.afunda < .6 && Math.abs(s.x - B.x) < (s.r || 0) + 34 && s.y > GY - 78 && s.y < GY - 2; };
  R.contato = () => { const B = c.B(), P = c.P(); return !B.sub && B.afunda < .5 && Math.abs(P.x - B.x) < 30 && P.y > GY - (B.correndo ? 36 : 54); };

  R.fundo = b => {   // o oco da árvore: a despensa dela
    const sk = b.createLinearGradient(0, 0, 0, GY); sk.addColorStop(0, '#120a08'); sk.addColorStop(.7, '#3a2012'); sk.addColorStop(1, '#5a3418'); b.fillStyle = sk; b.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const x = (i * 97) % W; b.strokeStyle = i % 2 ? '#24140a' : '#4a2a14'; b.lineWidth = 3 + (i % 4) * 2; b.beginPath(); b.moveTo(x, -8); b.bezierCurveTo(x + 30, 60, x - 34, 120, x + ((i * 13) % 40) - 20, GY - 40 - (i % 5) * 18); b.stroke(); }
    for (const [x, y, rx] of [[70, 150, 26], [245, 96, 18], [412, 168, 30]]) { b.fillStyle = '#080403'; b.beginPath(); b.ellipse(x, y, rx, rx * .8, 0, 0, 7); b.fill(); b.fillStyle = '#f4e2a8'; b.fillRect(x - 6, y - 2, 2, 2); b.fillRect(x + 4, y - 2, 2, 2); }
    for (const [x, n] of [[24, 5], [160, 3], [330, 4], [452, 6]]) for (let k = 0; k < n; k++) { const qx = x + (k % 3) * 16 - 12, qy = GY - 8 - Math.floor(k / 3) * 14; b.fillStyle = '#b8861c'; b.beginPath(); b.moveTo(qx - 12, qy + 8); b.lineTo(qx + 12, qy + 8); b.lineTo(qx + 12, qy - 6); b.fill(); b.fillStyle = '#6a4a0c'; b.fillRect(qx + 2, qy + 1, 3, 3); b.fillRect(qx + 7, qy - 2, 2, 2); }
    for (const x of [30, 118, 300, 445]) { b.fillStyle = 'rgba(120,255,190,.5)'; b.beginPath(); b.arc(x, GY - 46 - (x % 30), 2, 0, 7); b.fill(); }
    b.fillStyle = '#4a2c16'; b.fillRect(0, GY, W, H - GY); b.fillStyle = '#5e3a1e'; for (let x = 0; x < W; x += 7) b.fillRect(x, GY + (x % 3), 4, 2); b.fillStyle = '#2a180a'; b.fillRect(0, GY + 12, W, H);
  };

  function rachadura(x, forte) {
    const t = c.B().t, k = forte ? 1 : .5;
    g.fillStyle = '#8a5a32'; g.beginPath(); g.ellipse(x, GY + 1, 22 + Math.sin(t * 30) * 3, 8 * k + Math.random() * 3, 0, Math.PI, 0); g.fill();
    if (!forte) return;
    g.fillStyle = `rgba(255,70,40,${.35 + .3 * Math.sin(t * 26)})`; g.beginPath(); g.ellipse(x, GY + 3, 32, 5, 0, 0, 7); g.fill();
    g.strokeStyle = '#ffd08a'; g.lineWidth = 2; g.beginPath(); for (const s of [-1, 1]) { g.moveTo(x, GY + 2); g.lineTo(x + s * 10, GY + 7); g.lineTo(x + s * 21, GY + 1); g.lineTo(x + s * 30, GY + 6); } g.stroke();
    g.fillStyle = '#ff5d4e'; g.font = 'bold 24px monospace'; g.textAlign = 'center'; g.fillText('!', x, GY - 20 + Math.sin(t * 20) * 2);
  }
  R.desenha = (morta, stT) => {
    const B = c.B();
    if (B.sub) { if (B.toca) rachadura(B.toca.x, B.toca.trava); return; }
    const w = larg(), bob = B.correndo ? Math.abs(Math.sin(B.t * 24)) * 4 : Math.sin(B.t * 4) * 1.5;
    let fonte = img.img;
    if (!fonte || (fonte.complete === false)) return;
    if (B.flash > 0) { brancoCv.width = w; brancoCv.height = alt; const bg = brancoCv.getContext('2d'); bg.drawImage(fonte, 0, 0, w, alt); bg.globalCompositeOperation = 'source-in'; bg.fillStyle = '#fff'; bg.fillRect(0, 0, w, alt); fonte = brancoCv; }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(B.x, GY + 3, 36, 5, 0, 0, 7); g.fill();
    if (B.rabo) {   // o rabo: armando (atrás) e varrendo
      g.strokeStyle = '#d89a94'; g.lineWidth = 5; g.lineCap = 'round';
      if (B.rabo < 0) { g.beginPath(); g.moveTo(B.x - B.dir * 22, GY - 14); g.quadraticCurveTo(B.x - B.dir * 66, GY - 20, B.x - B.dir * 52, GY - 74); g.stroke(); g.fillStyle = '#ff5d4e'; g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillText('!', B.x, GY - 90); g.font = '9px monospace'; g.fillText('pule!', B.x, GY - 78); }
      else for (const s of [-1, 1]) { g.beginPath(); g.moveTo(B.x + s * 18, GY - 12); g.quadraticCurveTo(B.x + s * (40 + B.rabo * 40), GY - 2, B.x + s * (30 + B.rabo * 85), GY - 6); g.stroke(); }
      g.lineCap = 'butt';
    }
    g.save(); g.beginPath(); g.rect(0, 0, W, GY + 5); g.clip();
    g.translate(B.x, GY + 4 + B.afunda * alt - bob);
    if (morta) { g.translate(0, -alt / 2); g.rotate(Math.min(Math.PI, stT * 3)); g.translate(0, alt / 2); }
    if (B.dir < 0) g.scale(-1, 1);   // o desenho dela olha pra direita
    if (B.aperto > 0) g.scale(1 + B.aperto * .35, 1 - B.aperto * .25);
    g.drawImage(fonte, -w / 2, -alt, w, alt);
    g.restore();
    if (B.afunda > 0 && B.afunda < 1) rachadura(B.x, false);
    if (B.atk && B.atk.k === 'corrida' && B.atk.t < .6) { g.fillStyle = '#ff5d4e'; g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillText('!', B.x, GY - 88); g.font = '9px monospace'; g.fillText('lá vem!', B.x, GY - 76); }
  };

  const cunha = (x, y, r, a, rosa) => {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = rosa ? '#ff8fb1' : '#f2c030'; g.beginPath(); g.moveTo(-r - 2, r * .7); g.lineTo(r + 2, r * .7); g.lineTo(r + 2, -r * .8); g.closePath(); g.fill();
    g.strokeStyle = rosa ? '#fff' : '#8a6410'; g.lineWidth = 1; g.stroke();
    g.fillStyle = rosa ? '#fff' : '#a87c10'; g.fillRect(1, 0, 3, 3); g.fillRect(r - 3, -3, 2, 2); g.restore();
  };
  R.desenhaPerigo = f => {
    const t = c.B().t;
    if (f.k === 'queijo') { cunha(f.x, f.y, f.r, f.gira, f.pink); return true; }
    if (f.k === 'roda') { g.save(); g.translate(f.x, f.y); g.rotate(f.gira); g.fillStyle = '#f2c030'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill(); g.strokeStyle = '#8a6410'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#a87c10'; for (const [x, y, r] of [[-5, -3, 3], [5, 4, 2.5], [3, -6, 2], [-3, 6, 1.5]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore(); return true; }
    if (f.k === 'fedor') { g.fillStyle = f.pink ? 'rgba(255,143,177,.85)' : 'rgba(150,200,90,.75)'; for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.57; g.beginPath(); g.arc(f.x + Math.cos(a) * 5, f.y + Math.sin(a) * 4, 6, 0, 7); g.fill(); } g.fillStyle = '#1a2a10'; g.fillRect(f.x - 4, f.y - 2, 2, 2); g.fillRect(f.x + 2, f.y - 2, 2, 2); g.fillRect(f.x - 3, f.y + 3, 6, 1); return true; }
    if (f.k === 'filhote') { const d = Math.sign(f.vx), pe = Math.sin(t * 22 + f.ph) * 2; g.fillStyle = '#8a8a90'; g.beginPath(); g.ellipse(f.x, f.y, 9, 5, 0, 0, 7); g.fill(); g.beginPath(); g.arc(f.x + d * 8, f.y - 2, 4, 0, 7); g.fill(); g.fillStyle = '#d89a94'; g.beginPath(); g.arc(f.x + d * 7, f.y - 6, 2.2, 0, 7); g.fill(); g.fillRect(f.x - 4 + pe, f.y + 4, 2, 3); g.fillRect(f.x + 3 - pe, f.y + 4, 2, 3); g.strokeStyle = '#d89a94'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(f.x - d * 8, f.y); g.quadraticCurveTo(f.x - d * 16, f.y - 6 + pe, f.x - d * 19, f.y + 1); g.stroke(); g.fillStyle = '#1a1a1a'; g.fillRect(f.x + d * 9, f.y - 3, 1.5, 1.5); return true; }
    if (f.k === 'ratoeira') { if (f.t < 0) return true; const x = f.x; g.fillStyle = '#a87c48'; g.fillRect(x - 14, GY - 4, 28, 6); g.strokeStyle = '#d8d8e0'; g.lineWidth = 2; g.beginPath(); if (f.pegou) { g.moveTo(x - 13, GY - 4); g.quadraticCurveTo(x, GY - 20, x + 13, GY - 4); g.moveTo(x - 6, GY - 4); g.lineTo(x - 6, GY - 11); g.moveTo(x + 6, GY - 4); g.lineTo(x + 6, GY - 11); } else { g.moveTo(x - 13, GY - 4); g.lineTo(x - 13, GY - 7); g.lineTo(x - 1, GY - 6); g.fillStyle = '#f2c030'; g.fillRect(x + 3, GY - 9, 6, 5); } g.stroke(); if (!f.pegou) { g.fillStyle = `rgba(255,60,60,${.35 + .35 * Math.sin(t * 22)})`; g.beginPath(); g.ellipse(x, GY + 5, 17, 3, 0, 0, 7); g.fill(); } return true; }
    return false;
  };
  return R;
}
