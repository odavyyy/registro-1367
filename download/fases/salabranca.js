// FASE 6 · A sala branca. Nenhuma janela, uma mesa e um computador ligado. No PC, um joguinho:
// "Plantão no Clubex" — sobreviva de 0h às 6h vigiando os portões, as portas e as câmeras (bem fácil e curto).
export function build(E, L) {
  const { THREE } = E, S = E.state;
  E.seed(67);
  E.scene.background = new THREE.Color(0xf4f4f0);
  E.scene.fog = new THREE.FogExp2(0xf4f4f0, .045);
  L.semAssombro = true;
  L.floor = 'carpet'; L.speed = 1.6; L.eye = 1.6; L.reach = 2.2;
  E.osd('▶ PLAY', 'SALA SEM REGISTRO');
  L.clock = t => (Math.floor(t) % 4 === 0 ? '--' : '00') + ':00';
  const { lam, basic, box } = E;
  const R = 4;
  L.rect = { x0: -R, x1: R, z0: -R, z1: R };
  L.spawn = { x: 0, z: 3, yaw: 0, pitch: -.04 };
  const white = lam({ color: 0xf2f2ee }), white2 = lam({ color: 0xe6e6e2 });
  const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), white)); f.rotation.x = -Math.PI / 2;
  const c = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), basic({ color: 0xffffff }))); c.rotation.x = Math.PI / 2; c.position.y = 3;
  box(2 * R, 3, .2, white2, 0, 1.5, -R - .1); box(2 * R, 3, .2, white2, 0, 1.5, R + .1); box(.2, 3, 2 * R, white2, -R - .1, 1.5, 0); box(.2, 3, 2 * R, white2, R + .1, 1.5, 0);
  for (const z of [-2, 2]) box(1.6, .04, .3, basic({ color: 0xffffff }), 0, 2.97, z, { occ: false });
  E.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d0, 2.6));
  // uma porta que não abre
  box(1, 2.1, .06, lam({ color: 0xffffff }), 2.4, 1.05, R - .02);
  // mesa, cadeira, computador
  const desk = lam({ color: 0xe0dcd2 });
  box(1.6, .06, .8, desk, 0, .76, -3.1); for (const [x, z] of [[-.75, -3.45], [.75, -3.45], [-.75, -2.75], [.75, -2.75]]) box(.05, .76, .05, desk, x, .38, z, { occ: false });
  E.solid(-.85, .85, -3.55, -2.65);
  box(.5, .05, .5, desk, 0, .48, -2.25, { occ: false }); box(.5, .6, .05, desk, 0, .78, -2.0, { occ: false });
  box(.55, .45, .45, lam({ color: 0xd8d0b8 }), 0, 1.03, -3.25);
  const scrC = document.createElement('canvas'); scrC.width = 96; scrC.height = 72;
  const scrT = E.texFrom(scrC), scrG = scrC.getContext('2d');
  const screen = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.44, .33), basic({ map: scrT, fog: false }))); screen.position.set(0, 1.05, -3.02);
  box(.5, .03, .18, lam({ color: 0xd0c8b0 }), 0, .8, -2.85, { occ: false });
  const glow = E.add(new THREE.PointLight(0xa0c0ff, 2, 4, 1.6)); glow.position.set(0, 1.1, -2.6);
  const C = { won: false, playing: false, tries: 0 };
  E.interact(E.hitbox(.9, .9, .3, 0, 1.2, -2.9), { label: () => C.won ? '' : '[E] Jogar no computador', act: () => { if (!C.won) openGame(); } });

  /* segredos do Clubex */
  const q = E.add(E.quadro('bicho', .7, .9, '#efe6d0', 'ELE SABE DEMASIADO')); q.position.set(-R + .02, 1.6, -1); q.rotation.y = Math.PI / 2;
  E.ovo('bicho', q, 'Quadro', () => E.say('(“O Bicho Que Sabe. Ele sabe. Ele sabe muito. Ele sabe demasiado.”)', 4));
  const nota = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.09, .09), basic({ map: E.canvasTex(16, 16, g => { g.fillStyle = '#ffe97a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#5a4a20'; g.font = '6px monospace'; g.fillText('67', 3, 11); }) })));
  nota.position.set(.62, .795, -2.85); nota.rotation.x = -Math.PI / 2; nota.rotation.z = .3; nota.scale.setScalar(1.6);
  E.ovo('senha', nota, 'Bilhetinho', () => E.say('(Um bilhetinho colado no monitor: “senha do PC: 67”.)', 3.5));

  function drawScreen(t) {
    const g = scrG;
    g.fillStyle = '#10141e'; g.fillRect(0, 0, 96, 72);
    g.fillStyle = C.won ? '#9fe3aa' : '#ffd27a'; g.font = '8px monospace'; g.textAlign = 'center';
    if (C.won) { g.fillText('6:00 AM', 48, 34); g.font = '6px monospace'; g.fillText('PLANTÃO CONCLUÍDO', 48, 46); }
    else { g.fillText('PLANTÃO', 48, 26); g.fillText('NO CLUBEX', 48, 36); g.font = '6px monospace'; g.fillStyle = '#e8e8f0'; if (Math.floor(t * 2) % 2) g.fillText('aperte E', 48, 54); }
    g.fillStyle = 'rgba(255,255,255,.06)'; for (let y = 0; y < 72; y += 3) g.fillRect(0, y, 96, 1);
    scrT.needsUpdate = true;
  }

  /* ===================== o minijogo ===================== */
  const NAMES = { acerolito: 'Acerolito', ratabrumga: 'Ratabrumga', homemDistinto: 'Homem-Distinto', rosengo: 'El Rosengo' };
  const CAMS = [
    { id: 'portoes', nome: 'CAM 1 · PORTÕES', bg: '#2a2440' },
    { id: 'calcada', nome: 'CAM 2 · CALÇADA', bg: '#3a3a36' },
    { id: 'matagale', nome: 'CAM 3 · MATAGALÉ', bg: '#1e3a24' },
    { id: 'qg', nome: 'CAM 4 · QG', bg: '#3a2430' },
  ];
  const IMG = {}; for (const n of Object.keys(NAMES)) IMG[n] = E.clubImg(n);
  let G = null;
  function openGame() {
    if (C.playing) return;
    C.playing = true; S.painting = true; S.noteOpen = true;
    document.exitPointerLock && document.exitPointerLock();
    const ov = document.createElement('div'); ov.id = 'plantao';
    ov.innerHTML = `<style>
      #plantao{position:fixed;inset:0;z-index:50;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-family:'VT323',monospace;color:#ffe9a8;user-select:none;-webkit-user-select:none}
      #plantao canvas{width:min(96vw,calc((100vh - 120px) * 1.6));aspect-ratio:320/200;image-rendering:pixelated;border:2px solid #333}
      #plantao .bar{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
      #plantao button{font:inherit;font-size:22px;padding:6px 12px;min-width:84px;background:#1c1a24;color:#ffe9a8;border:2px solid #5a5070;border-radius:5px;touch-action:manipulation}
      #plantao button.on{background:#ffe9a8;color:#111}
      #plantao button.warn{border-color:#ff5d4e;box-shadow:0 0 10px #ff5d4e}
      #plantao .cams button{min-width:60px;font-size:18px}
      #plantao .keys{font-size:17px;color:#a79fb0}
      @media (max-height:430px){#plantao button{font-size:18px;padding:4px 8px;min-width:64px}}
    </style>
    <canvas width="960" height="600"></canvas>
    <div class="bar"><button data-a="pE">◀ PORTA</button><button data-a="lE">◀ LUZ</button><button data-a="cam">CÂMERAS</button><button data-a="lD">LUZ ▶</button><button data-a="pD">PORTA ▶</button></div>
    <div class="keys">${E.isTouch ? 'feche a porta quando o botão ficar vermelho · sobreviva até as 6h' : '[A] porta · [Q] luz · [S] câmeras · [E] luz · [D] porta · sobreviva até as 6h · [F] sai'}</div>
    <div class="bar cams" style="display:none">${CAMS.map((c, i) => `<button data-c="${i}">CAM ${i + 1}</button>`).join('')}</div>`;
    document.body.appendChild(ov);
    const cv = ov.querySelector('canvas'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const btn = a => ov.querySelector(`[data-a="${a}"]`);
    const press = a => {
      if (G && G.ligacao) { if (G.ligT > 1) { G.ligacao = false; G.t = 0; E.sfx.click(); } return; }
      if (!G || G.over) return;
      if (a === 'pE' || a === 'pD') { const k = a === 'pE' ? 'L' : 'R'; G.door[k] = !G.door[k]; E.noiseHit(.15, .3, 600); E.tone(90, .15, .1, 'square'); }
      if (a === 'lE' || a === 'lD') { const k = a === 'lE' ? 'L' : 'R'; G.light[k] = !G.light[k]; if (G.light[k]) G.light[k === 'L' ? 'R' : 'L'] = false; E.sfx.click(); }
      if (a === 'cam') { G.camStatic = .3; G.cam = !G.cam; ov.querySelector('.cams').style.display = G.cam ? 'flex' : 'none'; E.noiseHit(.2, .15, 3000, null, 'highpass'); }
      sync();
    };
    ov.querySelector('.bar').addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (b) { e.preventDefault(); press(b.dataset.a); } });
    ov.querySelector('.cams').addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (b) { e.preventDefault(); G.camStatic = .25; G.camI = +b.dataset.c; E.noiseHit(.12, .12, 3000, null, 'highpass'); sync(); } });
    const keyH = e => {
      const m = { KeyA: 'pE', KeyQ: 'lE', KeyS: 'cam', Space: 'cam', KeyE: 'lD', KeyD: 'pD' }[e.code];
      if (m) { e.preventDefault(); e.stopPropagation(); press(m); }
      if (G && G.cam && /^Digit[1-4]$/.test(e.code)) { G.camStatic = .25; G.camI = +e.code.slice(-1) - 1; sync(); }
      if (e.code === 'KeyF') { e.preventDefault(); e.stopPropagation(); close(false); E.say('(Larguei o plantão. Dá pra voltar no computador quando quiser.)', 3); return; }
      if (G && G.ligacao && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); e.stopPropagation(); press('x'); }
    };
    addEventListener('keydown', keyH, true);
    function sync() {
      if (!G) return;
      btn('pE').classList.toggle('on', G.door.L); btn('pD').classList.toggle('on', G.door.R);
      btn('lE').classList.toggle('on', G.light.L); btn('lD').classList.toggle('on', G.light.R); btn('cam').classList.toggle('on', G.cam);
      btn('pE').classList.toggle('warn', !!G.atDoor.L && !G.door.L); btn('pD').classList.toggle('warn', !!G.atDoor.R && !G.door.R);
      ov.querySelectorAll('.cams button').forEach((b, i) => b.classList.toggle('on', i === G.camI));
    }
    function newNight() {
      const easy = Math.min(2, C.tries);   // perdeu? fica ainda mais fácil
      G = {
        t: 0, hourLen: 11, power: 100, door: { L: false, R: false }, light: { L: false, R: false }, cam: false, camI: 0,
        atDoor: { L: null, R: null }, over: false, jump: null, jumpT: 0, msg: 'NOITE 1 · 0:00', msgT: 3, ligacao: !C.ouviu, ligT: 0, camStatic: 0, fan: 0, pisca: 0,
        bots: [
          { n: 'acerolito', side: 'L', path: ['portoes', 'calcada', 'door'], i: 0, cd: 7 + easy * 2, every: 6 + easy * 2 },
          { n: 'ratabrumga', side: 'R', path: ['matagale', 'qg', 'door'], i: 0, cd: 10 + easy * 2, every: 7 + easy * 2 },
          { n: 'rosengo', side: 'L', path: ['matagale', 'calcada', 'door'], i: 0, cd: 22 + easy * 3, every: 8 + easy * 2 },
        ],
      };
      ov.querySelector('.cams').style.display = 'none';
      sync();
    }
    newNight();
    let last = performance.now(), raf = 0, stepT = 0;
    function loop(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (G) { tick(dt); if (G) draw(); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    function tick(dt) {
      if (G.ligacao) { if (!G.ligT) { E.tone(440, .4, .05, 'square'); E.tone(480, .4, .05, 'square'); E.tone(440, .4, .05, 'square', null, .8); E.tone(480, .4, .05, 'square', null, .8); } G.ligT += dt; C.ouviu = true; return; }
      if (G.msgT > 0) G.msgT -= dt;
      if (G.camStatic > 0) G.camStatic -= dt;
      G.fan += dt * 14; G.pisca -= dt; if (G.pisca < -6 + Math.random() * 3) G.pisca = .25;
      if (Math.random() < dt * .08) E.tone([523, 587, 659, 784][(Math.random() * 4) | 0], .6, .015, 'triangle');   // caixinha de música longe
      if (G.jump) { G.jumpT += dt; if (G.jumpT > 2.2) { C.tries++; newNight(); G.msg = 'TENTE DE NOVO · NOITE 1'; G.msgT = 3; } return; }
      if (G.over) { G.t += dt; if (G.t > 4) close(true); return; }
      G.t += dt;
      const drain = .22 + (G.door.L ? .55 : 0) + (G.door.R ? .55 : 0) + (G.light.L || G.light.R ? .3 : 0) + (G.cam ? .15 : 0);
      G.power = Math.max(0, G.power - drain * dt);
      if (G.power <= 0) { G.door.L = G.door.R = false; G.light.L = G.light.R = false; G.cam = false; sync(); }
      if (G.t >= G.hourLen * 6) { G.over = true; G.t = 0; E.sfx.chime(); [523, 659, 784, 1046, 1318].forEach((f, i) => E.tone(f, .6, .06, 'triangle', null, .2 + i * .18)); G.confete = Array.from({ length: 60 }, () => ({ x: Math.random() * 320, y: -Math.random() * 200, v: 30 + Math.random() * 50, c: ['#ffd23a', '#ff8fb1', '#9fe3aa', '#8fc8ff'][(Math.random() * 4) | 0] })); sync(); return; }
      for (const b of G.bots) {
        b.cd -= dt;
        const at = b.path[b.i];
        if (at === 'door') {
          b.wait -= dt;
          if (G.door[b.side]) {   // porta fechada: ele desiste e volta
            if (b.wait < 3.2) { b.i = 0; b.cd = b.every; G.atDoor[b.side] = null; E.noiseHit(.2, .2, 400); E.say(b.n === 'acerolito' ? 'ACEROLITO: Que isso?' : b.n === 'rosengo' ? 'EL ROSENGO!' : '(Um guincho do outro lado da porta.)', 2, 'npc'); sync(); }
          } else if (b.wait <= 0) { G.jump = b.n; G.jumpT = 0; E.gritoOutro(.55); G.cam = false; sync(); return; }
        } else if (b.cd <= 0) {
          b.cd = b.every * (.8 + Math.random() * .5);
          if (Math.random() < .7) {
            b.i++;
            if (b.path[b.i] === 'door') {
              if (G.atDoor[b.side]) { b.i--; continue; }
              G.atDoor[b.side] = b; b.wait = 6;
              stepT = .4; E.noiseHit(.3, .12, 300); E.tone(70, .3, .06, 'sine', null, 0);
            } else E.noiseHit(.1, .04, 2500, null, 'highpass');
            sync();
          }
        }
      }
      if (stepT > 0) stepT -= dt;
    }
    const imgDraw = (name, x, y, h, dark) => {
      const ci = IMG[name]; if (!ci.img.complete) return;
      const w = h * ci.aspect; g.drawImage(ci.img, x - w / 2, y - h, w, h);
      if (dark) { g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(x - w / 2, y - h, w, h); }
    };
    function draw() {
      g.setTransform(3, 0, 0, 3, 0, 0); g.imageSmoothingEnabled = false;
      if (G.ligacao) {   // a ligação do Homem-Distinto, explicando a primeira noite
        g.fillStyle = '#0a0810'; g.fillRect(0, 0, 320, 200);
        imgDraw('homemDistinto', 52, 190, 110, 0);
        const L2 = ['📞 Alô? Primeira noite no Clubex?', 'Eu sei. Eu sempre sei.', 'Você vigia o QG até as 6 da manhã.', 'Uns visitantes sem aura vão tentar entrar:', 'o Acerolito, o El Rosengo e a Ratabrumga.', 'Use as CÂMERAS pra ver onde eles estão.', 'Quando o botão da PORTA ficar VERMELHO,', 'alguém chegou: FECHE a porta.', 'Porta e luz gastam energia. Abra depois.'];
        const n = Math.min(L2.length, Math.floor(G.ligT * 1.6));
        g.textAlign = 'left'; g.font = '9px monospace';
        L2.slice(0, n).forEach((l, i) => { g.fillStyle = i < 2 ? '#ffd27a' : i === 6 || i === 7 ? '#ff8f6a' : '#e8e0d0'; g.fillText(l, 108, 22 + i * 16); });
        if (G.ligT > 1 && Math.floor(G.ligT * 2) % 2) { g.textAlign = 'center'; g.fillStyle = '#ff8fb1'; g.font = 'bold 11px monospace'; g.fillText(E.isTouch ? 'toque num botão pra começar' : 'aperte ESPAÇO ou um botão pra começar', 200, 190); }
        return;
      }
      if (G.camStatic > 0 && G.cam) { const img = g.createImageData(960, 600), d = img.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } g.putImageData(img, 0, 0); return; }
      if (G.jump) {
        const k = Math.min(1, G.jumpT * 3), sh = (Math.random() - .5) * 10 * (1 - Math.min(1, G.jumpT));
        g.fillStyle = '#120608'; g.fillRect(0, 0, 320, 200);
        imgDraw(G.jump, 160 + sh, 220 + sh, 120 + k * 200);
        g.fillStyle = 'rgba(200,30,30,.25)'; g.fillRect(0, 0, 320, 200);
        if (G.jumpT > 1) { g.fillStyle = '#fff'; g.font = '16px monospace'; g.textAlign = 'center'; g.fillText(NAMES[G.jump].toUpperCase() + ' ENTROU', 160, 30); }
        return;
      }
      if (G.over) {
        g.fillStyle = '#000'; g.fillRect(0, 0, 320, 200); g.textAlign = 'center';
        g.fillStyle = '#ffe9a8'; g.font = '28px monospace'; g.fillText('6:00 AM', 160, 90);
        g.font = '11px monospace'; g.fillStyle = '#c8c0d8'; g.fillText('o plantão acabou. bem-vindo ao Clubex.', 160, 118);
        imgDraw('homemDistinto', 160, 196, 60 * Math.min(1, G.t), 0);
        for (const c of G.confete || []) { c.y += c.v / 60; if (c.y > 200) c.y = -5; g.fillStyle = c.c; g.fillRect(c.x + Math.sin(c.y * .1) * 6, c.y, 3, 4); }
        g.fillStyle = '#ff8fb1'; g.font = '9px monospace'; g.fillText('HOMEM-DISTINTO: Eu sei. Você tem aura.', 160, 140);
        return;
      }
      if (G.cam) drawCam(); else drawOffice();
      // HUD
      const hr = Math.min(6, Math.floor(G.t / G.hourLen));
      g.fillStyle = '#fff'; g.font = '12px monospace'; g.textAlign = 'right'; g.fillText((hr === 0 ? '12' : hr) + ' AM', 314, 14);
      g.textAlign = 'left'; g.font = '9px monospace'; g.fillText('ENERGIA ' + Math.ceil(G.power) + '%', 6, 192);
      g.fillStyle = G.power > 25 ? '#9fe3aa' : '#ff5d4e'; g.fillRect(70, 186, G.power * .5, 6);
      if (G.msgT > 0) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(70, 80, 180, 30); g.fillStyle = '#ffe9a8'; g.textAlign = 'center'; g.font = '12px monospace'; g.fillText(G.msg, 160, 99); }
    }
    function drawOffice() {
      // o QG do Clubex à noite: parede, mesa, duas portas
      g.fillStyle = '#2a2236'; g.fillRect(0, 0, 320, 200);
      g.fillStyle = '#342a44'; for (let x = 0; x < 320; x += 20) g.fillRect(x, 0, 1, 140);
      g.fillStyle = '#3c3048'; g.fillRect(0, 140, 320, 60);
      g.fillStyle = '#6a4a2a'; g.fillRect(70, 132, 180, 12); g.fillStyle = '#4a3220'; g.fillRect(80, 144, 8, 40); g.fillRect(232, 144, 8, 40);
      g.fillStyle = '#1a1a1a'; g.fillRect(130, 104, 60, 28); g.fillStyle = '#304a40'; g.fillRect(134, 108, 52, 20);
      g.fillStyle = '#9fe3aa'; g.font = '6px monospace'; g.textAlign = 'center'; g.fillText('CLUBEX', 160, 120);
      g.fillStyle = '#c8a04a'; g.font = 'bold 14px monospace'; g.fillText('67', 160, 40);
      g.fillStyle = '#e8dcc0'; g.fillRect(112, 48, 96, 34); g.fillStyle = '#241726'; g.font = 'bold 9px monospace'; g.fillText('SÓ ENTRA QUEM', 160, 62); g.fillText('TEM AURA', 160, 75);
      for (const [k, x0] of [['L', 6], ['R', 254]]) {
        g.fillStyle = '#050508'; g.fillRect(x0, 40, 60, 110);
        const who = G.atDoor[k];
        if (G.light[k]) { g.fillStyle = '#3a3a30'; g.fillRect(x0, 40, 60, 110); if (who) imgDraw(who.n, x0 + 30, 150, who.n === 'ratabrumga' ? 36 : 96, .15); }
        else if (who && Math.floor(G.t * 1.5) % 3 === 0) { g.fillStyle = 'rgba(255,240,200,.5)'; g.fillRect(x0 + 24, 70, 3, 3); g.fillRect(x0 + 33, 70, 3, 3); }
        if (G.door[k]) { g.fillStyle = '#7a7a84'; g.fillRect(x0, 40, 60, 110); g.fillStyle = '#5a5a64'; for (let y = 44; y < 150; y += 6) g.fillRect(x0, y, 60, 2); }
        g.strokeStyle = '#6a5a7a'; g.lineWidth = 2; g.strokeRect(x0, 40, 60, 110);
      }
      g.fillStyle = '#c8c0d8'; g.font = '8px monospace'; g.textAlign = 'center'; g.fillText('ESQ', 36, 160); g.fillText('DIR', 284, 160);
      // ventilador na mesa e a lâmpada falhando
      g.save(); g.translate(228, 122); g.fillStyle = '#3a3a44'; g.fillRect(-2, 0, 4, 10); g.rotate(G.fan); g.fillStyle = '#8a8a94'; for (let k = 0; k < 3; k++) { g.rotate(Math.PI * 2 / 3); g.fillRect(0, -2, 10, 4); } g.restore();
      if (G.pisca > 0) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, 320, 200); }
      if (G.power < 30) { g.fillStyle = `rgba(0,0,0,${(30 - G.power) / 60})`; g.fillRect(0, 0, 320, 200); }
    }
    function drawCam() {
      const cam = CAMS[G.camI];
      g.fillStyle = cam.bg; g.fillRect(0, 0, 320, 200);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 130, 320, 70);
      if (cam.id === 'portoes') { g.fillStyle = '#c8a04a'; for (let x = 90; x <= 230; x += 14) g.fillRect(x, 40, 4, 100); g.fillRect(86, 40, 150, 6); imgDraw('homemDistinto', 60, 150, 100, .1); }
      if (cam.id === 'calcada') { g.fillStyle = '#6a6a64'; g.fillRect(0, 120, 320, 30); g.fillStyle = '#4a4a44'; for (let x = 0; x < 320; x += 24) g.fillRect(x, 120, 1, 30); }
      if (cam.id === 'matagale') { g.fillStyle = '#2a5a30'; for (let x = 0; x < 320; x += 9) g.fillRect(x, 110 + (x * 7) % 20, 5, 60); }
      if (cam.id === 'qg') { g.fillStyle = '#5a3a2a'; g.fillRect(40, 100, 240, 10); g.fillStyle = '#e8dcc0'; g.fillRect(140, 40, 40, 30); }
      const here = G.bots.filter(b => b.path[b.i] === cam.id);
      here.forEach((b, i) => imgDraw(b.n, 140 + i * 70, 160, b.n === 'ratabrumga' ? 34 : 90, .1));
      if (cam.id === 'portoes' && here.length === 0 && Math.floor(G.t) % 5 === 0) { g.fillStyle = '#ffe9a8'; g.font = '8px monospace'; g.textAlign = 'left'; g.fillText('HOMEM-DISTINTO: Eu sei.', 10, 30); }
      // chiado da câmera
      for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.2)'; g.fillRect(Math.random() * 320, Math.random() * 200, 2, 1); }
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, (G.t * 60) % 220 - 10, 320, 4);
      g.fillStyle = '#fff'; g.font = '9px monospace'; g.textAlign = 'left'; g.fillText(cam.nome, 6, 14);
      if (Math.floor(G.t * 2) % 2) { g.fillStyle = '#ff5d4e'; g.beginPath(); g.arc(8, 24, 3, 0, 7); g.fill(); }
    }
    function close(won) {
      cancelAnimationFrame(raf); removeEventListener('keydown', keyH, true);
      ov.remove(); G = null; C.playing = false; S.painting = false; S.noteOpen = false;
      if (won) win();
    }
    C.close = close; C.cheat = () => { if (G) { G.t = G.hourLen * 6; } };
    C.G = () => G;
  }
  function win() {
    E.conquista('plantao');
    C.won = true; S.flags.plantao = true; E.save();
    E.later(.6, () => E.say('(6 da manhã. A tela tá puxando de novo.)', 3.5));
    E.later(2, () => { C.pulling = true; });
  }

  /* som: zumbido branco */
  L.ambience = bus => { E.loopNoise('highpass', 6000, 0, .008, bus); const ac = E.ac(), o = ac.createOscillator(); o.frequency.value = 120; const gg = E.gain(.012, bus); o.connect(gg); o.start(); };
  L.enter = () => {
    E.later(1, () => E.voice('n_salabranca', 'Sala sem registro. Nenhuma janela. Um computador ligado.', 'nar'));
    E.later(6, () => E.toast('A sala branca<small>o computador está ligado · [H] dica</small>'));
  };
  const tmp = new THREE.Vector3();
  L.update = dt => {
    drawScreen(L.t);
    glow.intensity = 2 + Math.sin(L.t * 3) * .3;
    if (C.pulling) {
      L.pull = Math.min(1, (L.pull || 0) + dt * .45);
      if (L.pull >= 1 && !C.gone) { C.gone = true; E.goTo('avenida'); }
    }
  };
  L.exit = () => { if (C.close && C.playing) C.close(false); L.pull = 0; S.painting = false; };
  E.moedas([[-2.5, null, 3]]);
  L.hint = () => C.won ? { text: 'Deixe a tela te levar.', target: null } : { text: 'Sente no computador e jogue. Feche as portas quando alguém aparecer nelas.', target: screen.position.clone() };
  L.debug = { C, openGame };
}
