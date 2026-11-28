// O fliperama da Pobresa: PEGA A RATABRUMGA! A Ratabrumga roubou o boné do El Rosengo (canônico).
// Escolha o Acerolito ou o próprio El Rosengo e corra atrás dela: pule caixas e poças, pegue goiabas (mais velocidade)
// e alcance a rata antes do fim do matagalé. Curto e fácil.
export function jogarArcade(E) {
  const S = E.state;
  if (document.getElementById('arcade')) return;
  S.painting = true; S.noteOpen = true;
  document.exitPointerLock && document.exitPointerLock();
  const W = 320, H = 180, GY = 150;
  const ov = document.createElement('div'); ov.id = 'arcade';
  ov.innerHTML = `<style>
    #arcade{position:fixed;inset:0;z-index:50;background:#0a0814;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'VT323',monospace;color:#ffe9a8;user-select:none;-webkit-user-select:none;touch-action:none}
    #arcade .cab{border:10px solid #2a1a4a;border-radius:14px;box-shadow:0 0 0 4px #c8202c,0 20px 60px #000;background:#000}
    #arcade canvas{display:block;width:min(92vw,calc((100vh - 120px) * 16 / 9));aspect-ratio:16/9;image-rendering:pixelated}
    #arcade .row{display:flex;gap:10px;margin-top:10px}
    #arcade button{font:inherit;font-size:22px;padding:6px 16px;background:#1c1a24;color:#ffe9a8;border:2px solid #5a5070;border-radius:6px;touch-action:none}
    #arcade .k{font-size:16px;color:#a79fb0;margin-top:6px}
  </style>
  <div class="cab"><canvas width="${W}" height="${H}"></canvas></div>
  <div class="row"><button data-a="pula">PULAR</button><button data-a="sair">SAIR</button></div>
  <div class="k">[Espaço] / [W] / toque em PULAR · escolha com [1] [2] · [F] sai</div>`;
  document.body.appendChild(ov);
  const cv = ov.querySelector('canvas'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const IMG = { acerolito: E.clubImg('acerolito'), rosengo: E.clubImg('rosengo'), ratabrumga: E.clubImg('ratabrumga') };
  let st = 'menu', heroi = 'acerolito', P, obs, itens, dist, vel, ratX, hits, t, raf = 0, last = performance.now(), msgT = 0;
  const META = 1400;
  function novo() { P = { y: GY, vy: 0, chao: true, inv: 0 }; obs = []; itens = []; dist = 0; vel = 110; ratX = 230; hits = 0; t = 0; st = 'corre'; }
  function pular() {
    if (st === 'menu') { novo(); return; }
    if (st !== 'corre') { if (st === 'ganhou' || st === 'perdeu') { if (msgT <= 0) { st = 'menu'; } } return; }
    if (P.chao) { P.vy = -250; P.chao = false; E.tone(600, .08, .04, 'square'); }
  }
  const key = e => {
    if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) { e.preventDefault(); e.stopPropagation(); pular(); }
    if (st === 'menu' && e.code === 'Digit1') { heroi = 'acerolito'; e.stopPropagation(); }
    if (st === 'menu' && e.code === 'Digit2') { heroi = 'rosengo'; e.stopPropagation(); }
    if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'KeyF') { e.preventDefault(); e.stopPropagation(); sair(); }
  };
  addEventListener('keydown', key, true);
  ov.querySelector('[data-a="pula"]').addEventListener('pointerdown', e => { e.preventDefault(); pular(); });
  ov.querySelector('[data-a="sair"]').addEventListener('click', sair);
  cv.addEventListener('pointerdown', e => { if (st === 'menu') { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W; if (x < 140) heroi = 'acerolito'; else if (x < 200) { novo(); return; } else heroi = 'rosengo'; } else pular(); });

  function tick(dt) {
    if (msgT > 0) msgT -= dt;
    if (st !== 'corre') return;
    t += dt; dist += vel * dt;
    P.vy += 700 * dt; P.y += P.vy * dt; if (P.y >= GY) { P.y = GY; P.vy = 0; P.chao = true; }
    P.inv -= dt;
    // obstáculos e goiabas
    if (Math.random() < dt * 1.1 && (!obs.length || obs[obs.length - 1].x < W - 90)) obs.push({ x: W + 10, k: Math.random() < .5 ? 'caixa' : 'poca' });
    if (Math.random() < dt * .7) itens.push({ x: W + 10, y: GY - 30 - Math.random() * 30 });
    for (const o of obs) { o.x -= vel * dt; if (!o.pego && o.x > 52 && o.x < 72 && P.y > GY - (o.k === 'caixa' ? 14 : 4) && P.inv <= 0) { o.pego = 1; hits++; P.inv = 1; vel = Math.max(90, vel - 25); E.noiseHit(.2, .25, 500); E.say(hits >= 3 ? '' : heroi === 'acerolito' ? 'ACEROLITO: Que isso?!' : 'EL ROSENGO!', 1.5, 'npc'); } }
    for (const it of itens) { it.x -= vel * dt; if (!it.pego && Math.abs(it.x - 62) < 12 && Math.abs(it.y - (P.y - 14)) < 16) { it.pego = 1; vel = Math.min(190, vel + 12); E.tone(1320, .06, .04, 'square'); } }
    obs = obs.filter(o => o.x > -20); itens = itens.filter(i => i.x > -20 && !i.pego);
    // a rata: vai ficando mais perto conforme você corre bem
    ratX = Math.max(80, 250 - (dist / META) * 170 - (vel - 110) * .3);
    if (hits >= 3) { st = 'perdeu'; msgT = 1.2; E.tone(160, .4, .06, 'square', null, 0, 0, 80); }
    if (dist >= META) { st = 'ganhou'; msgT = 1.5; E.sfx.chime(); E.conquista && E.conquista('fliperama'); }
  }
  const img = (n, x, y, h, flip) => { const ci = IMG[n]; if (!ci.img.complete) return; const w = h * ci.aspect; g.save(); g.translate(x, y); if (flip) g.scale(-1, 1); g.drawImage(ci.img, -w / 2, -h, w, h); g.restore(); };
  function draw() {
    // fundo: matagalé ao entardecer, rolando
    const sk = g.createLinearGradient(0, 0, 0, GY); sk.addColorStop(0, '#3a2a6a'); sk.addColorStop(1, '#f29a6a'); g.fillStyle = sk; g.fillRect(0, 0, W, GY);
    g.fillStyle = '#ffd08a'; g.beginPath(); g.arc(250, 70, 22, 0, 7); g.fill();
    const off = st === 'corre' ? dist : 0;
    g.fillStyle = '#4a2a5a'; for (let i = -1; i < 6; i++) { const x = i * 80 - (off * .2) % 80; g.beginPath(); g.moveTo(x, GY); g.lineTo(x + 40, GY - 50); g.lineTo(x + 80, GY); g.fill(); }
    g.fillStyle = '#2a6a34'; for (let i = -1; i < 40; i++) { const x = i * 10 - (off * .6) % 10; g.fillRect(x, GY - 6 - (i * 7) % 6, 3, 8); }
    g.fillStyle = '#5a3a22'; g.fillRect(0, GY, W, H - GY); g.fillStyle = '#6a4a2a'; for (let x = -((off) % 16); x < W; x += 16) g.fillRect(x, GY + 4, 8, 2);
    if (st === 'menu') {
      g.fillStyle = '#000a'; g.fillRect(20, 14, 280, 152);
      g.textAlign = 'center'; g.fillStyle = '#ffd23a'; g.font = 'bold 16px monospace'; g.fillText('PEGA A RATABRUMGA!', 160, 34);
      g.fillStyle = '#e8d8c8'; g.font = '8px monospace'; g.fillText('Ela roubou o boné do El Rosengo. Corre atrás dela!', 160, 48);
      img('acerolito', 90, 132, 56); img('rosengo', 230, 140, 80);
      g.strokeStyle = '#ffd23a'; g.lineWidth = 2; heroi === 'acerolito' ? g.strokeRect(56, 70, 68, 68) : g.strokeRect(196, 56, 68, 88);
      g.fillStyle = '#fff'; g.font = '8px monospace'; g.fillText('[1] Acerolito', 90, 154); g.fillText('[2] El Rosengo', 230, 154);
      g.fillStyle = '#ff8fb1'; g.font = 'bold 10px monospace'; if (Math.floor(performance.now() / 400) % 2) g.fillText('PULAR = COMEÇAR', 160, 112);
      return;
    }
    for (const o of obs) { if (o.k === 'caixa') { g.fillStyle = '#a8703a'; g.fillRect(o.x - 8, GY - 14, 16, 14); g.fillStyle = '#6a4422'; g.fillRect(o.x - 8, GY - 8, 16, 2); } else { g.fillStyle = '#3a6ab0'; g.beginPath(); g.ellipse(o.x, GY + 1, 11, 3, 0, 0, 7); g.fill(); } }
    for (const it of itens) { g.fillStyle = '#9fd84a'; g.beginPath(); g.arc(it.x, it.y, 5, 0, 7); g.fill(); g.fillStyle = '#3a6a2a'; g.fillRect(it.x - 1, it.y - 7, 2, 3); }
    // a rata com o boné
    const ry = GY - Math.abs(Math.sin(t * 12)) * 4;
    img('ratabrumga', ratX, ry, 26, true);
    g.fillStyle = '#d8a020'; g.fillRect(ratX - 6, ry - 30, 12, 5); g.fillRect(ratX - 10, ry - 27, 6, 2);
    // você
    if (!(P.inv > 0 && Math.floor(P.inv * 10) % 2)) img(heroi, 62, P.y + (P.chao ? Math.abs(Math.sin(t * 14)) * -2 : 0), heroi === 'acerolito' ? 40 : 56);
    // HUD
    g.fillStyle = '#000a'; g.fillRect(8, 6, 120, 10); g.fillStyle = '#ffd23a'; g.fillRect(10, 8, 116 * Math.min(1, dist / META), 6);
    g.fillStyle = '#fff'; g.font = '7px monospace'; g.textAlign = 'left'; g.fillText('MATAGALÉ', 132, 13); g.textAlign = 'right'; g.fillText('♥'.repeat(Math.max(0, 3 - hits)), 312, 13);
    g.textAlign = 'center';
    if (st === 'ganhou') { g.fillStyle = '#000b'; g.fillRect(40, 50, 240, 70); g.fillStyle = '#ffd23a'; g.font = 'bold 16px monospace'; g.fillText('BONÉ RECUPERADO!', 160, 76); g.fillStyle = '#e8d8c8'; g.font = '9px monospace'; g.fillText('EL ROSENGO: ¡EL ROSENGO!', 160, 94); g.fillText('pular = jogar de novo · sair no botão', 160, 110); }
    if (st === 'perdeu') { g.fillStyle = '#000b'; g.fillRect(40, 50, 240, 60); g.fillStyle = '#ff8f6a'; g.font = 'bold 14px monospace'; g.fillText('A RATA FUGIU!', 160, 76); g.fillStyle = '#e8d8c8'; g.font = '9px monospace'; g.fillText('pular = tentar de novo', 160, 96); }
    // linhas de TV
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
  }
  function loop(now) { const dt = Math.min(.04, (now - last) / 1000); last = now; tick(dt); draw(); raf = requestAnimationFrame(loop); }
  raf = requestAnimationFrame(loop);
  function sair() { cancelAnimationFrame(raf); removeEventListener('keydown', key, true); ov.remove(); S.painting = false; S.noteOpen = false; }
}
