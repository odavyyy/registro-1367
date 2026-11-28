// Coisas que valem o jogo inteiro: conversas com caixa de diálogo, moedas, conquistas, skins e a câmera em 3ª pessoa.
// Tudo que precisa durar entre partidas fica em localStorage 'registro1367-meta'.
export function instalar(E) {
  const { THREE } = E, S = E.state, $ = id => document.getElementById(id);
  const KEY = 'registro1367-meta';
  const META = Object.assign({ coins: {}, conq: {}, zerou: false, skin: 'voce', roupa: 'bone', owned: { voce: 1, bone: 1 }, gastas: 0 },
    (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
  const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(META)); } catch (e) {} };
  E.META = META; E.salvarMeta = salvar;

  /* ---------------- caixa de diálogo ---------------- */
  const css = document.createElement('style');
  css.textContent = `
    #dlg{position:absolute;left:50%;bottom:7%;transform:translateX(-50%);width:min(86%,760px);background:rgba(8,6,14,.88);border:2px solid rgba(255,233,168,.55);padding:.7em 1em .9em;z-index:8;font-family:'VT323',monospace;color:#ece6cf;display:none}
    #dlg.on{display:block}
    #dlg .q{font-size:3.6vmin;color:#ffd27a;letter-spacing:.05em}
    #dlg .t{font-size:3.6vmin;line-height:1.2;min-height:2.4em}
    #dlg .n{position:absolute;right:.7em;bottom:.3em;font-size:2.6vmin;opacity:.7;animation:dlgb 1s infinite}
    @keyframes dlgb{50%{opacity:.2}}
    #avHud{position:absolute;right:1.2%;top:12%;font-family:'VT323',monospace;color:#ffd23a;font-size:3vmin;z-index:4;text-shadow:1px 1px 0 #000;pointer-events:none}
    .grid3{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(26vmin,100%),1fr));gap:1.2vmin;width:min(96%,980px);max-height:62vh;overflow:auto;touch-action:pan-y;overscroll-behavior:contain;flex-shrink:0;margin:.4em 0 .8em;padding:.2em}
    .grid3 .c{border:2px solid rgba(236,230,207,.3);padding:.5em;font-family:'VT323',monospace;color:#ece6cf;background:rgba(255,255,255,.04);text-align:left;cursor:pointer;font-size:3vmin;line-height:1.1}
    .grid3 .c small{display:block;opacity:.7;font-size:.8em}
    .grid3 .c.ok{border-color:#ffd23a}
    .grid3 .c.sel{border-color:#9fe3aa;background:rgba(159,227,170,.12)}
    .grid3 .c.foco{outline:3px solid #ffd94a;outline-offset:2px;background:rgba(255,217,74,.14)}
    .grid3 .c.lock{opacity:.45;cursor:default}
    .grid3 canvas{width:100%;height:16vmin;image-rendering:pixelated;background:rgba(255,255,255,.05);display:block;margin-bottom:.3em;object-fit:contain}`;
  document.head.appendChild(css);
  const dlg = document.createElement('div'); dlg.id = 'dlg'; dlg.innerHTML = '<div class="q"></div><div class="t" data-no-tr></div><div class="n">▶ E / clique</div>';
  $('wrap').appendChild(dlg);
  let fila = null, tipT = 0, cheio = '', mostrando = 0;
  // E.conversa([['MAGO', 'texto'], ['VOCÊ', '...'], ...]) → promessa que resolve no fim
  E.conversa = (linhas) => new Promise(res => {
    fila = { linhas: linhas.slice(), res }; S.dlg = true; prox();
  });
  function prox() {
    if (!fila) return;
    if (mostrando < cheio.length) { mostrando = cheio.length; dlg.querySelector('.t').textContent = cheio; return; }   // pula a digitação
    const l = fila.linhas.shift();
    if (!l) { E.falaPara(); dlg.classList.remove('on'); const r = fila.res; fila = null; S.dlg = false; r(); return; }
    const [quem, txt, cor] = Array.isArray(l) ? l : [l.quem, l.txt, l.cor];
    E.falaDe(quem, txt);   // quem tem voz gravada fala; os outros ficam só na legenda
    const tr = s => (window.I18N ? I18N.T(s) : s);   // o texto vai traduzido inteiro (a digitação letra a letra não passa pelo tradutor)
    dlg.querySelector('.q').textContent = tr(quem || ''); dlg.querySelector('.q').style.color = cor || (quem === 'VOCÊ' ? '#9fd8ff' : '#ffd27a');
    cheio = tr(txt || ''); mostrando = 0; dlg.querySelector('.t').textContent = ''; dlg.classList.add('on');
    if (quem && E.ac()) E.tone(quem === 'VOCÊ' ? 500 : 340, .05, .02, 'square');
  }
  E.dlgNext = prox;
  E.dlgFechar = () => { if (!fila) return; E.falaPara(); dlg.classList.remove('on'); const r = fila.res; fila = null; S.dlg = false; cheio = ''; mostrando = 0; r(); };
  E.dlgTick = dt => {
    if (!fila || mostrando >= cheio.length) return;
    tipT += dt; while (tipT > .022 && mostrando < cheio.length) { tipT -= .022; mostrando++; }
    dlg.querySelector('.t').textContent = cheio.slice(0, mostrando);
  };

  /* ---------------- conquistas ---------------- */
  const CONQ = [
    ['fita', 'Aperte o play', 'Coloque a fita no videocassete.'],
    ['capinha', 'Procura-se', 'Leia os 7 cartazes do Cavalo Capinha.'],
    ['penas', 'Três penas', 'Ache as 3 penas nas salas amarelas.'],
    ['navegador', 'É por ali, confia', 'Chegue às Américas em 1491.'],
    ['plantao', 'Seis da manhã', 'Sobreviva ao Plantão no Clubex.'],
    ['sem_olhos', 'Ele não enxerga', 'Termine a folhinha sem pintar os olhos.'],
    ['espeto', 'Só se pedir', 'Peça um espeto pro Serjão.'],
    ['orelha', 'Au.', 'Monte no Cachorro Orelha.'],
    ['fliperama', 'Boné de volta', 'Recupere o boné do El Rosengo no fliperama.'],
    ['nocaute', 'Nocaute!', 'Vença o Passarex na luta.'],
    ['nota_s', 'Nota S', 'Tire nota S na luta.'],
    ['parry', 'Rosa é parry', 'Faça 5 parries numa luta.'],
    ['soro', 'Café de Naviraí', 'Leve o café pra polícia a tempo.'],
    ['segredos', 'Sabe demasiado', 'Ache os 12 segredos do Clubex.'],
    ['moedas', 'Rei do Ouro', 'Junte 40 moedas.'],
    ['radio', 'Clubex FM', 'Ligue a rádio.'],
    ['zuprum', 'Carambufa bibilulú', 'Converse com o ser da bolha na floresta de cogumelos.'],
    ['final_a', 'Fita ejetada', 'Veja o final A.'],
    ['final_b', 'Conexão perdida', 'Veja o final B.'],
    ['final_c', 'Registro 1368', 'Veja o final secreto.'],
    ['colombo', 'Não tá no mapa', 'Um segredo que fica muito longe daqui.'],
    ['final_d', 'Ele nunca foi mau', 'Um final que não acontece em 1997.'],
    ['portoes', 'Portões abertos', 'Entre nos Portões do Clubex (zerar o jogo).'],
  ];
  E.CONQ = CONQ;
  E.conquista = id => {
    if (META.conq[id] || !CONQ.find(c => c[0] === id)) return;
    META.conq[id] = Date.now(); salvar();
    const c = CONQ.find(c => c[0] === id);
    setTimeout(() => { E.toast(`🏆 ${c[1]}<small>${c[2]}</small>`); E.sfx && E.sfx.chime(); }, 400);
  };

  /* ---------------- moedas ---------------- */
  const coinTex = E.canvasTex(32, 32, g => {
    g.fillStyle = '#c8901a'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill();
    g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(16, 16, 12, 0, 7); g.fill();
    g.fillStyle = '#a8700a'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText('67', 16, 21);
  });
  E.totalMoedas = () => Object.keys(META.coins).length;
  E.saldo = () => E.totalMoedas() - (META.gastas || 0);
  // E.moedas([[x, y, z], ...]): moedas girando que você pega só de passar por cima (ficam pegas pra sempre)
  E.moedas = lista => {
    const L = E.L;
    META.coinTot = META.coinTot || {}; if (META.coinTot[L.id] !== lista.length) { META.coinTot[L.id] = lista.length; salvar(); }
    lista.forEach(([x, y, z], i) => {
      const id = L.id + ':' + i; if (META.coins[id]) return;
      const m = E.add(new THREE.Group());
      const aro = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .05, 12), E.lam({ color: 0xc8901a })); aro.rotation.x = Math.PI / 2; m.add(aro);
      for (const s of [1, -1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(.22, 12), E.basic({ map: coinTex, transparent: true, alphaTest: .5 })); f.position.z = s * .027; if (s < 0) f.rotation.y = Math.PI; m.add(f); }
      m.position.set(x, y ?? (E.ground(x, z) + .7), z);
      m.userData.coin = { id, y: m.position.y, ph: i };
      (L.coins = L.coins || []).push(m);
    });
  };
  function tickMoedas(dt) {
    const L = E.L; if (!L || !L.coins) return;
    const p = E.player.pos;
    for (const m of L.coins) {
      if (!m.visible) continue;
      const c = m.userData.coin; m.rotation.y += dt * 3; m.position.y = c.y + Math.sin(L.t * 2 + c.ph) * .06;
      if (Math.hypot(m.position.x - p.x, m.position.z - p.z) < .8 && Math.abs(m.position.y - (E.player.camY - .9)) < 1.6) {
        m.visible = false; META.coins[c.id] = 1; salvar();
        E.tone(1320, .08, .05, 'square'); E.tone(1760, .12, .05, 'square', null, .07);
        hudMoedas(true);
        if (E.totalMoedas() >= 40) E.conquista('moedas');
      }
    }
  }
  const avHud = document.createElement('div'); avHud.id = 'avHud'; avHud.style.opacity = 0; $('wrap').appendChild(avHud);
  let hudT = 0;
  function hudMoedas(show) { avHud.textContent = '🪙 ' + E.saldo(); if (show) hudT = 3; }

  /* ---------------- skins e roupas ---------------- */
  // personagens (depois de zerar) e roupas pra você mesmo; algumas custam moedas, outras vêm de conquistas
  const SKINS = [
    { id: 'voce', nome: 'Você', info: 'quem assiste a fita' },
    { id: 'acerolito', nome: 'Acerolito', info: 'grátis ao zerar', club: 'acerolito' },
    { id: 'rosengo', nome: 'El Rosengo', info: 'conquista “Boné de volta” ou 15 moedas', club: 'rosengo', conq: 'fliperama', preco: 15 },
    { id: 'douradex', nome: 'Douradex', info: 'conquista “É por ali, confia”', club: 'douradex', conq: 'navegador' },
    { id: 'serjao', nome: 'Serjão dos Espetos', info: 'conquista “Só se pedir”', club: 'serjao', conq: 'espeto' },
    { id: 'macaco', nome: 'Macaco', info: '10 moedas', club: 'macaco', preco: 10 },
    { id: 'mago', nome: 'Mago', info: '15 moedas', club: 'mago', preco: 15 },
    { id: 'bicho', nome: 'Bicho Que Sabe', info: '20 moedas', club: 'bicho', preco: 20 },
    { id: 'homem', nome: 'Homem-Distinto', info: 'conquista “Sabe demasiado” ou 30 moedas', club: 'homemDistinto', conq: 'segredos', preco: 30 },
    { id: 'passarex', nome: 'Passarex', info: 'final secreto ou 40 moedas', club: 'passarex', conq: 'final_c', preco: 40 },
  ];
  const ROUPAS = [
    { id: 'bone', nome: 'Boné vermelho', info: 'padrão' },
    { id: 'cartola', nome: 'Mini cartola', info: 'a dos Acerolitos · 5 moedas', preco: 5 },
    { id: 'dourado', nome: 'Boné Douradex', info: 'o do El Rosengo · 8 moedas', preco: 8 },
    { id: 'capa', nome: 'Capa vermelha', info: 'distinta · 10 moedas', preco: 10 },
    { id: 'corrente', nome: 'Corrente de ouro', info: 'Rei da Expedição · 12 moedas', preco: 12 },
    { id: 'fleguis', nome: 'Uper fléguis', info: 'os tênis sagrados · 15 moedas', preco: 15 },
    { id: 'aureola', nome: 'Auréola de aura', info: 'conquista “Portões abertos”', conq: 'portoes' },
  ];
  E.SKINS = SKINS; E.ROUPAS = ROUPAS;
  E.liberarTudo = () => {   // código 1367: libera capítulos, skins, roupas, conquistas e os finais
    META.zerou = true; META.ted = 1; for (const it of [...SKINS, ...ROUPAS]) META.owned[it.id] = 1;
    for (const c of CONQ) if (!META.conq[c[0]]) META.conq[c[0]] = Date.now();
    salvar();
    try { const f = JSON.parse(localStorage.getItem('registro1367-finais')) || []; localStorage.setItem('registro1367-finais', JSON.stringify([...new Set([...f, 'A', 'B', 'C', 'D'])])); } catch (e) {}
  };
  const liberado = it => META.owned[it.id] || (it.conq && META.conq[it.conq]) || (it.id === 'acerolito' && META.zerou);
  // desenho de "você" com a roupa escolhida (pixel art, de frente)
  // aparência escolhida no começo do jogo (menino/menina, pele, cabelo)
  const PELES = ['#f6d6b8', '#eec29a', '#d6a072', '#b07a4e', '#8a5634', '#5e3a22'];
  const CABELOS = ['#1a1412', '#4a2a18', '#8a5a2a', '#d8b060', '#c8502a', '#e8e4dc', '#4a7ad8', '#d85a9a'];
  const corpo = () => Object.assign({ genero: 'menino', pele: '#f2c8a0', cabelo: '#3a2418' }, META.corpo || {});
  E.corpo = corpo;
  function desenhaVoce(g, w, h, roupa, cp, passo = 0) {
    const s = h / 64; g.save(); g.scale(s, s); g.translate((w / s - 32) / 2, 0);
    const C = cp || corpo(), menina = C.genero === 'menina';
    if (menina) { g.fillStyle = C.cabelo; g.fillRect(7, 12, 18, 20); }   // cabelo comprido, atrás da cabeça
    if (roupa === 'capa') { g.fillStyle = '#b8202c'; g.beginPath(); g.moveTo(8, 24); g.lineTo(24, 24); g.lineTo(28, 54); g.lineTo(4, 54); g.fill(); }
    const pe = passo === 1 ? [-1.5, -2.5, 1.5, 0] : passo === -1 ? [-1.5, 0, 1.5, -2.5] : [0, 0, 0, 0];   // [dx esq, sobe esq, dx dir, sobe dir]
    g.fillStyle = roupa === 'fleguis' ? '#f2f2f2' : '#3a2a2a'; g.fillRect(9 + pe[0], 58 + pe[1], 6, 4); g.fillRect(17 + pe[2], 58 + pe[3], 6, 4);
    if (roupa === 'fleguis') { g.fillStyle = '#e8c84a'; g.fillRect(9 + pe[0], 60 + pe[1], 6, 1); g.fillRect(17 + pe[2], 60 + pe[3], 6, 1); }
    g.fillStyle = '#2a3a6a'; g.fillRect(10 + pe[0], 42, 5, 16 + pe[1]); g.fillRect(17 + pe[2], 42, 5, 16 + pe[3]);
    if (menina) { g.fillStyle = '#7a3a6a'; g.fillRect(8, 40, 16, 8); }   // saia
    g.fillStyle = menina ? '#f0d8e4' : '#e8e0d0'; g.fillRect(8, 24, 16, 19); g.fillStyle = menina ? '#d8b8c8' : '#c8c0b0'; g.fillRect(8, 40, 16, 3);
    g.fillStyle = C.pele; g.fillRect(5, 26, 3, 12); g.fillRect(24, 26, 3, 12);
    g.fillStyle = C.pele; g.beginPath(); g.arc(16, 16, 8, 0, 7); g.fill();
    g.fillStyle = C.cabelo; g.beginPath(); g.arc(16, 13, 8.5, Math.PI * 1.05, Math.PI * 1.95); g.fill(); g.fillRect(8, 9, 16, 4);   // franja
    if (menina) { g.fillRect(7, 12, 3, 14); g.fillRect(22, 12, 3, 14); }
    g.fillStyle = '#1a1a1a'; g.fillRect(12, 15, 2, 2); g.fillRect(18, 15, 2, 2); g.fillRect(14, 20, 4, 1);
    if (menina) { g.fillStyle = '#e88aa8'; g.fillRect(11, 18, 2, 1); g.fillRect(19, 18, 2, 1); }
    if (roupa === 'corrente') { g.strokeStyle = '#ffd23a'; g.lineWidth = 1.5; g.beginPath(); g.arc(16, 25, 6, .2, Math.PI - .2); g.stroke(); g.fillStyle = '#ffd23a'; g.fillRect(14, 30, 4, 4); }
    if (roupa === 'bone' || roupa === 'capa' || roupa === 'corrente' || roupa === 'fleguis') { g.fillStyle = '#c8302c'; g.fillRect(7, 7, 18, 5); g.fillRect(20, 10, 9, 3); }
    if (roupa === 'dourado') { g.fillStyle = '#d8a020'; g.fillRect(7, 7, 18, 5); g.fillRect(20, 10, 9, 3); g.fillStyle = '#fff2a0'; g.fillRect(14, 8, 4, 2); }
    if (roupa === 'cartola') { g.fillStyle = '#17151c'; g.fillRect(10, -2, 12, 11); g.fillRect(7, 8, 18, 2); g.fillStyle = '#c8202c'; g.fillRect(10, 5, 12, 2); }
    if (roupa === 'aureola') { g.strokeStyle = '#fff2a0'; g.lineWidth = 2; g.beginPath(); g.ellipse(16, 4, 9, 2.5, 0, 0, 7); g.stroke(); g.fillStyle = '#5a3a22'; g.fillRect(9, 7, 14, 4); }
    g.restore();
  }
  // a figura atual (skin ou você + roupa), de frente e de costas
  const skinC = document.createElement('canvas'); skinC.width = 96; skinC.height = 128;
  const skinB = document.createElement('canvas'); skinB.width = 96; skinB.height = 128;
  function costas() {   // de costas: a mesma silhueta espelhada, sem rosto, com sombra (e o boné/cabelo por trás)
    const b = skinB.getContext('2d'); b.clearRect(0, 0, 96, 128);
    b.save(); b.translate(96, 0); b.scale(-1, 1); b.drawImage(skinC, 0, 0); b.restore();
    b.globalCompositeOperation = 'source-atop'; b.fillStyle = 'rgba(26,18,22,.55)'; b.fillRect(0, 0, 96, 128); b.globalCompositeOperation = 'source-over';
    if (META.skin === 'voce') { const s = 2, C = corpo(); b.fillStyle = C.cabelo; b.beginPath(); b.arc(48, 32, 8 * s, 0, 7); b.fill(); if (C.genero === 'menina') b.fillRect(32, 32, 32, 30); if (['bone', 'capa', 'corrente', 'fleguis', 'dourado'].includes(META.roupa)) { b.fillStyle = META.roupa === 'dourado' ? '#b8901a' : '#a82a26'; b.fillRect(32, 14, 32, 10); } }
    if (avTex) { avTex.needsUpdate = true; avTexB.needsUpdate = true; }
  }
  const passoC = [document.createElement('canvas'), document.createElement('canvas')]; passoC.forEach(c => { c.width = 96; c.height = 128; });
  let temPasso = false;
  function pintaSkin() {
    temPasso = false;
    const g = skinC.getContext('2d'); g.clearRect(0, 0, 96, 128);
    const sk = SKINS.find(s => s.id === META.skin) || SKINS[0];
    if (sk.club) { const ci = E.clubImg(sk.club); ci.ready.then(() => { const h = 128, w = Math.min(96, h * ci.aspect), hh = w / ci.aspect; g.clearRect(0, 0, 96, 128); g.drawImage(ci.img, (96 - w) / 2, 128 - hh, w, hh); costas(); }); }
    else { desenhaVoce(g, 96, 128, META.roupa); costas(); passoC.forEach((c, i) => { const x = c.getContext('2d'); x.clearRect(0, 0, 96, 128); desenhaVoce(x, 96, 128, META.roupa, null, i ? -1 : 1); }); temPasso = true; if (avPasso) avPasso.forEach(t => t.needsUpdate = true); }
  }
  E.skinCanvas = () => skinC;

  /* ---------------- câmera: 1ª pessoa, 3ª por trás (sobre o ombro) e 3ª de frente — V alterna ---------------- */
  let av = null, avTex = null, avTexB = null, avPasso = null, ultimo = null, andar = 0;
  function garanteAvatar() {
    if (av) return;
    avTex = E.texFrom(skinC); avTexB = E.texFrom(skinB); avPasso = passoC.map(c => E.texFrom(c));
    av = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), E.basic({ map: avTexB, transparent: true, alphaTest: .5 }));
    E.scene.add(av);
  }
  const ray = new THREE.Raycaster(), head = new THREE.Vector3(), back = new THREE.Vector3(), lado = new THREE.Vector3();
  const modo = () => (E.OPT.cam | 0) % 3;
  E.camModo = modo;
  E.third = () => modo() > 0 && S.started && !S.ended;
  E.trocaCamera = () => {
    E.OPT.cam = (modo() + 1) % 3; E.OPT.third = E.OPT.cam > 0; E.salvarOpt && E.salvarOpt();
    E.toast(['1ª pessoa', '3ª pessoa · por trás', '3ª pessoa · de frente'][E.OPT.cam] + '<small>V troca a câmera</small>');
  };
  // direção pra onde VOCÊ está olhando (não a câmera): usada pra mirar e interagir em 3ª pessoa
  E.dirOlhar = v => v.set(-Math.sin(E.player.yaw) * Math.cos(E.player.pitch), Math.sin(E.player.pitch), -Math.cos(E.player.yaw) * Math.cos(E.player.pitch));
  let dSuave = 3;
  E.cameraTerceira = () => {
    garanteAvatar();
    if (S.exerc) { E.exercTick(1 / 60); return; }
    const m = E.third() ? modo() : 0;
    av.visible = m > 0;
    if (!m) return;
    const p = E.player.pos, cam = E.camera, yaw = E.player.yaw, pitch = E.player.pitch;
    const by = E.ground(p.x, p.z);
    head.set(p.x, by + 1.05, p.z);                              // o foco é o peito do boneco: ele fica sempre no meio da tela
    let d = m === 1 ? 3 : 2.7, dir;
    if (m === 1) {   // por trás: a câmera orbita atrás de você, na direção contrária de onde você olha
      dir = back.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    } else {         // de frente: a câmera fica na sua frente, um pouco acima, olhando pra você
      const pp = Math.max(-.35, Math.min(.9, .18 - pitch * .6));
      dir = back.set(-Math.sin(yaw) * Math.cos(pp), Math.sin(pp), -Math.cos(yaw) * Math.cos(pp));
    }
    ray.set(head, dir); ray.far = d + .3;
    const hit = ray.intersectObjects(E.L.occluders, false)[0];
    if (hit) d = Math.max(.5, hit.distance - .3);
    dSuave += (d - dSuave) * .25; if (hit) dSuave = Math.min(dSuave, d);
    cam.position.copy(head).addScaledVector(dir, dSuave);
    cam.position.y = Math.max(cam.position.y, by + .25);
    if (m === 1) cam.rotation.set(pitch, yaw, E.L.roll || 0);
    else { cam.lookAt(head); }
    // andando: passinhos, balanço e um pulinho a cada passo (em vez de deslizar flutuando)
    const mov = ultimo ? Math.hypot(p.x - ultimo.x, p.z - ultimo.z) : 0; ultimo = { x: p.x, z: p.z };
    const anda = mov > .002; andar = anda ? andar + mov * 4.2 : 0;
    const fase = Math.sin(andar), mont = E.L.montaria;
    let map = m === 1 ? avTexB : avTex, y = by + .8, tilt = 0, sy = 1;
    if (mont) {   // montado no Orelha ou no patinete: sentado em cima, balançando no galope
      const o = mont.obj, cao = mont.kind !== 'patinete', galope = anda ? Math.abs(Math.sin(andar * (cao ? 1.3 : .5))) : 0;
      o.position.set(p.x - dir.x * .06, by + (cao ? galope * .08 : 0), p.z - dir.z * .06);
      if (!cao) o.rotation.y = yaw; else o.scale.setScalar(mont.kind === 'ted' ? 1.7 : 1.6);   // o cachorro maior, pra caber você em cima
      y = by + (mont.kind === 'ted' ? 1.22 : cao ? 1.25 : .95) + galope * .1; tilt = anda ? Math.sin(andar * .65) * .05 : 0;
    } else if (anda) {
      if (temPasso && m === 2) map = avPasso[fase > 0 ? 0 : 1];
      const corre = E.player.run ? 1.8 : 1;   // correndo: passo mais largo, balanço e pulinho maiores
      tilt = fase * .09 * corre; y += Math.abs(fase) * .07 * corre; sy = 1 - Math.abs(Math.cos(andar)) * .03 * corre;
    }
    av.material.map = map;
    av.position.set(p.x, y, p.z);
    av.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0); av.rotateZ(tilt); av.scale.set(1, sy, 1);
  };

  /* ---------------- criar personagem (no começo do jogo e no painel de skins) ---------------- */
  const pCria = document.createElement('div'); pCria.className = 'overlay hidden panel'; pCria.id = 'criaP'; pCria.style.zIndex = 48;
  pCria.innerHTML = `<h2>QUEM É VOCÊ?</h2><p class="dim">Monte o seu personagem. Ele aparece na 3ª pessoa e na luta.</p>
    <div style="display:flex;gap:4vmin;align-items:center;flex-wrap:wrap;justify-content:center">
      <canvas id="criaCv" width="96" height="128" style="width:24vmin;height:32vmin;image-rendering:pixelated;background:rgba(255,255,255,.05)"></canvas>
      <div style="font-family:VT323,monospace;font-size:3.4vmin;color:#ece6cf;text-align:left">
        <div>VOCÊ É</div><div class="cria-g" style="display:flex;gap:1vmin;margin:.3em 0 .7em"><button data-g="menino" style="font-size:3.6vmin;padding:.3em 1em">👦 MENINO</button><button data-g="menina" style="font-size:3.6vmin;padding:.3em 1em">👧 MENINA</button></div>
        <div>PELE</div><div class="cria-p" style="display:flex;gap:1vmin;flex-wrap:wrap;margin:.3em 0 .7em"></div>
        <div>CABELO</div><div class="cria-c" style="display:flex;gap:1vmin;flex-wrap:wrap;margin:.3em 0 .7em"></div>
      </div>
    </div><button class="ok" style="margin-top:1em;font-size:4.4vmin;padding:.3em 2em">PRONTO ▶</button>`;
  document.body.appendChild(pCria);
  const bola = (cor, attr) => `<button ${attr}="${cor}" style="width:6vmin;height:6vmin;min-width:0;padding:0;border-radius:50%;background:${cor};border:3px solid rgba(255,255,255,.25)"></button>`;
  pCria.querySelector('.cria-p').innerHTML = PELES.map(c => bola(c, 'data-p')).join('');
  pCria.querySelector('.cria-c').innerHTML = CABELOS.map(c => bola(c, 'data-c')).join('');
  let rasc = null;
  const previa = () => {
    const g = pCria.querySelector('#criaCv').getContext('2d'); g.clearRect(0, 0, 96, 128); desenhaVoce(g, 96, 128, 'nada', rasc);
    pCria.querySelectorAll('[data-g]').forEach(b => b.style.outline = b.dataset.g === rasc.genero ? '3px solid #9fe3aa' : '');
    pCria.querySelectorAll('[data-p]').forEach(b => b.style.borderColor = b.dataset.p === rasc.pele ? '#9fe3aa' : 'rgba(255,255,255,.25)');
    pCria.querySelectorAll('[data-c]').forEach(b => b.style.borderColor = b.dataset.c === rasc.cabelo ? '#9fe3aa' : 'rgba(255,255,255,.25)');
  };
  pCria.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !rasc) return;
    if (b.dataset.g) rasc.genero = b.dataset.g; if (b.dataset.p) rasc.pele = b.dataset.p; if (b.dataset.c) rasc.cabelo = b.dataset.c;
    E.tone && E.tone(600, .05, .03, 'square');
    if (b.classList.contains('ok')) { META.corpo = rasc; rasc = null; salvar(); pintaSkin(); pCria.classList.add('hidden'); E.lockPtr && E.lockPtr(); const r = pCria._res; pCria._res = null; r && r(); return; }
    previa();
  });
  E.criarPersonagem = () => new Promise(res => {
    rasc = Object.assign({}, corpo(), META.corpo ? {} : { pele: PELES[1], cabelo: CABELOS[1] });
    pCria._res = res; previa(); pCria.classList.remove('hidden');
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
  });

  /* ---------------- painéis do menu: conquistas e skins ---------------- */
  const mk = (id, titulo, sub) => { const d = document.createElement('div'); d.className = 'overlay hidden panel'; d.id = id; d.style.zIndex = 47; d.innerHTML = `<h2>${titulo}</h2><p class="dim">${sub}</p><div class="grid3"></div><button class="back">VOLTAR</button>`; document.body.appendChild(d); d.querySelector('.back').onclick = () => d.classList.add('hidden'); return d; };
  const pConq = mk('conqP', 'CONQUISTAS', ''), pSkin = mk('skinP', 'SKINS E ROUPAS', '');
  { const bt = document.createElement('button'); bt.textContent = 'MUDAR APARÊNCIA'; bt.onclick = () => { pSkin.classList.add('hidden'); E.criarPersonagem().then(() => E.abrirSkins()); }; pSkin.insertBefore(bt, pSkin.querySelector('.back')); }
  E.abrirConquistas = () => {
    const n = Object.keys(META.conq).length;
    pConq.querySelector('.dim').textContent = `${n}/${CONQ.length} conquistas · 🪙 ${E.totalMoedas()} moedas juntadas · segredos do Clubex ${E.ovosAchados ? E.ovosAchados() : 0}/${E.OVOS_TOTAL || 12}`;
    pConq.querySelector('.grid3').innerHTML = CONQ.map(([id, t, d]) => `<div class="c ${META.conq[id] ? 'ok' : 'lock'}">${META.conq[id] ? '🏆' : '🔒'} ${t}<small>${d}</small></div>`).join('');
    pConq.classList.remove('hidden');
  };
  E.abrirSkins = () => {
    const z = META.zerou;
    pSkin.querySelector('.dim').textContent = (z ? 'Escolha quem você é. ' : 'Zere o jogo para liberar os personagens. As roupas você já pode usar. ') + `🪙 ${E.saldo()} moedas · a skin aparece na 3ª pessoa (opção em OPÇÕES ou tecla V) e na luta.`;
    const card = (it, tipo) => {
      const ok = liberado(it), bloqueadoZerar = tipo === 'skin' && !z && it.id !== 'voce';
      const sel = tipo === 'skin' ? META.skin === it.id : META.skin === 'voce' && META.roupa === it.id;
      const podeComprar = !ok && it.preco && !bloqueadoZerar && E.saldo() >= it.preco;
      return `<div class="c ${sel ? 'sel' : ok && !bloqueadoZerar ? 'ok' : 'lock'}" data-t="${tipo}" data-id="${it.id}"><canvas width="48" height="64"></canvas>${it.nome}<small>${bloqueadoZerar ? 'zere o jogo' : ok ? (sel ? 'em uso' : 'liberado · clique pra usar') : podeComprar ? `comprar por 🪙 ${it.preco}` : it.info}</small></div>`;
    };
    pSkin.querySelector('.grid3').innerHTML = SKINS.map(s => card(s, 'skin')).join('') + ROUPAS.map(r => card(r, 'roupa')).join('');
    pSkin.querySelectorAll('.c').forEach(c => {
      const cv = c.querySelector('canvas'), g = cv.getContext('2d'), it = (c.dataset.t === 'skin' ? SKINS : ROUPAS).find(x => x.id === c.dataset.id);
      if (it.club) E.clubImg(it.club).ready.then(ci => { const w = Math.min(48, 64 * ci.aspect), h = w / ci.aspect; g.drawImage(ci.img, (48 - w) / 2, 64 - h, w, h); });
      else desenhaVoce(g, 48, 64, c.dataset.t === 'roupa' ? it.id : META.roupa);
      c.onclick = () => {
        if (c.dataset.t === 'skin' && !z && it.id !== 'voce') return;
        if (!liberado(it)) { if (it.preco && E.saldo() >= it.preco) { META.gastas = (META.gastas || 0) + it.preco; META.owned[it.id] = 1; E.tone(1046, .2, .05, 'triangle'); } else return; }
        if (c.dataset.t === 'skin') META.skin = it.id; else { META.roupa = it.id; META.skin = 'voce'; }
        salvar(); pintaSkin(); E.abrirSkins();
      };
    });
    pSkin.classList.remove('hidden');
  };

  /* ---------------- tutoriais, objetivo na tela e cartão de capítulo ---------------- */
  const css2 = document.createElement('style');
  css2.textContent = `
    #obj{position:absolute;left:2.4%;top:11%;max-width:44%;font-family:'VT323',monospace;font-size:2.9vmin;color:#ffe9a8;text-shadow:1px 1px 0 #000,0 0 4px #000;z-index:4;pointer-events:none;line-height:1.1;opacity:.92}
    #obj b{color:#ff8f6a;font-weight:normal;letter-spacing:.08em}
    #capCard{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:7;pointer-events:none;font-family:'VT323',monospace;opacity:0;transition:opacity .8s;background:radial-gradient(ellipse at center,rgba(0,0,0,.55),rgba(0,0,0,0) 70%)}
    #capCard .n{font-size:4vmin;color:#ff8f6a;letter-spacing:.3em}
    #capCard .t{font-size:9vmin;color:#ffe9a8;text-shadow:3px 0 rgba(40,220,255,.4),-3px 0 rgba(255,60,60,.4)}
    .tut{display:grid;grid-template-columns:auto 1fr;gap:.35em 1em;text-align:left;margin:.6em auto 0;max-width:34em}
    .tut kbd{font-family:'VT323',monospace;background:#ffe9a8;color:#111;border-radius:4px;padding:0 .4em;font-size:1em;white-space:nowrap;justify-self:end}`;
  document.head.appendChild(css2);
  const objEl = document.createElement('div'); objEl.id = 'obj'; $('wrap').appendChild(objEl);
  const capEl = document.createElement('div'); capEl.id = 'capCard'; capEl.innerHTML = '<div class="n"></div><div class="t"></div>'; $('wrap').appendChild(capEl);
  let objT = 0;
  function tickObj(dt) {
    objT -= dt; if (objT > 0) return; objT = 1.2;
    const L = E.L;
    if (!S.started || S.ended || !L || !L.hint || S.dlg) { objEl.textContent = ''; return; }
    let h = null; try { h = L.objetivo ? { text: L.objetivo() } : L.hint(); } catch (e) {}   // fase de investigação: o quadro fica vago, a solução só no [H]
    objEl.innerHTML = h && h.text ? `<b>OBJETIVO</b><br>${h.text}` : '';
  }
  E.capCard = (n, nome) => {
    capEl.querySelector('.n').textContent = 'CAPÍTULO ' + n; capEl.querySelector('.t').textContent = nome;
    capEl.style.opacity = 1; setTimeout(() => { capEl.style.opacity = 0; }, 3200);
    E.noiseHit && E.noiseHit(.4, .08, 2500, null, 'highpass');
  };
  // E.tutorial('id', 'TÍTULO', [[tecla PC, tecla celular, o que faz], ...], 'texto extra') — aparece uma vez por tipo
  E.tutorial = (id, titulo, linhas, extra = '', sempre = false) => {
    META.tut = META.tut || {};
    if (META.tut[id] && !sempre) return;
    META.tut[id] = 1; salvar();
    const t = E.isTouch;
    E.note(`<small>COMO JOGAR</small><h2>${titulo}</h2>${extra ? `<p>${extra}</p>` : ''}
      <div class="tut">${linhas.map(([pc, cel, o]) => `<kbd>${t ? cel : pc}</kbd><span>${o}</span>`).join('')}</div>
      <p class="dim" style="margin-top:.8em">${t ? 'toque pra continuar' : 'E ou clique pra continuar'}</p>`);
  };
  E.tutorialBasico = (sempre) => E.tutorial('basico', 'O básico', [
    ['W A S D', 'joystick (esquerda)', 'andar'],
    ['mouse', 'arrastar (direita)', 'olhar em volta'],
    ['E', '✋ ou tocar na tela', 'interagir, pegar, conversar, passar o diálogo'],
    ['Shift', '🏃', 'correr'],
    ['H', '💡', 'dica: um passarinho amarelo mostra o caminho'],
    ['V', 'OPÇÕES', 'trocar a câmera (1ª pessoa, por trás, de frente)'],
    ['Esc', '❚❚', 'pausa'],
  ], 'O objetivo de cada parte fica no canto de cima da tela.', sempre);

  /* ---------------- o Passarex te seguindo: aparece atrás, lá na frente, ou dá um "piscar" na tela ---------------- */
  const AS = { t: 25, fig: null, tipo: null, vida: 0, olhou: 0, lvl: null };
  const tmpV = new THREE.Vector3();
  function some(susto) {
    if (!AS.fig) return;
    if (susto) { E.whistle(.06, { pan: E.pan(AS.fig.position) }); E.noiseHit(.35, .14, 2600, null, 'highpass'); if (Math.random() < .35) E.flash(); E.L.glitchT = Math.max(E.L.glitchT || 0, .45); }
    AS.fig.removeFromParent(); AS.fig = null;
  }
  function livre(x, z) { const L = E.L; try { return !E.blocked(x, z) && (!L.zonaCalma || !L.zonaCalma(x, z)); } catch (e) { return false; } }
  function aparece(tipo) {
    const p = E.player.pos, yaw = E.player.yaw;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    for (let tent = 0; tent < 8; tent++) {
      const d = tipo === 'atras' ? 4.5 + Math.random() * 3 : 13 + Math.random() * 8, lat = (Math.random() - .5) * (tipo === 'atras' ? 3 : 6);
      const s = tipo === 'atras' ? -1 : 1, x = p.x + fx * d * s + fz * lat, z = p.z + fz * d * s - fx * lat;
      if (!livre(x, z)) continue;
      AS.fig = E.add(E.sticker(1.8, { sil: true, eyes: true, s: .14 })); AS.fig.position.set(x, E.ground(x, z), z);
      AS.tipo = tipo; AS.vida = tipo === 'atras' ? 8 : 10; AS.olhou = 0;
      if (tipo === 'atras') E.later(.4, () => E.tone(90, 1.4, .05, 'sine'));   // um zumbido grave avisando
      return true;
    }
    return false;
  }
  function tickAssombro(dt) {
    const L = E.L;
    if (!L || AS.lvl !== L) { AS.lvl = L; AS.fig = null; AS.t = 25 + Math.random() * 15; }
    if (!S.started || S.ended || S.dlg || S.noteOpen || S.painting || S.dead || S.trans || L.semAssombro) return;
    if (L.zonaCalma && L.zonaCalma(E.player.pos.x, E.player.pos.z)) { if (AS.fig) some(false); return; }
    if (AS.fig) {
      AS.vida -= dt;
      const olhando = E.looking(tmpV.set(AS.fig.position.x, AS.fig.position.y + 1.4, AS.fig.position.z), .93);
      if (olhando) AS.olhou += dt;
      if (AS.tipo === 'atras' && AS.olhou > .35) { some(true); E.say(['(Tinha alguém atrás de mim.)', '(...)', '(Não. Não olha de novo.)'][(Math.random() * 3) | 0], 2.5); }
      else if (AS.tipo === 'frente' && AS.olhou > 1.2) { some(true); }
      else if (AS.vida <= 0) some(false);
      return;
    }
    AS.t -= dt; if (AS.t > 0) return;
    AS.t = 35 + Math.random() * 35;
    const r = Math.random();
    if (r < .45) aparece('atras');
    else if (r < .8) aparece('frente');
    else { E.flash(); E.whistle(.05, { pan: Math.random() * 2 - 1 }); if (Math.random() < .5) E.glitchText(['NÃO OLHA', 'FIU FIU', 'ELE TE VÊ', '1367'][(Math.random() * 4) | 0], .35); }
  }

  /* ---------------- inventário: o que você carrega (e o que dá pra segurar na mão) ---------------- */
  // itens guardados pra sempre (META.inv) + itens da missão do centro (Q)
  const ITENS = {
    espeto: { nome: 'Espeto do Serjão', info: 'Espetinho no capricho, com farofa. Dá pra comer.', segura: true, cor: '#8a4a22' },
    espetao: { nome: 'ESPETÃO do Serjão', info: 'O espeto gigante. Comprado com moedas. Pesa, mas dá pra carregar.', segura: true, cor: '#6a3a1a' },
    refri: { nome: 'Refri gelado', info: 'Da Pobresa. Pro Pássaro Cocô.', cor: '#2a6ac8' },
    doces: { nome: 'Goiabas doces', info: 'Do Pássaro das Esferas (você pediu).', cor: '#f2a6c8' },
    azedas: { nome: 'Goiabas azedas', info: 'Do Pássaro Cocô.', cor: '#b8e05a' },
    armas: { nome: 'Máquinas de goiaba', info: 'Doce atira rápido, azeda bate forte. Montadas pelo Macaco.', cor: '#3a6a2a' },
    cafe: { nome: 'Café de Naviraí', info: 'O único jeito de fazer o soro.', cor: '#2a3a8a' },
    espetoInf: { nome: 'Espetinhos infinitos do Serjão', info: 'Presente do Rosengo. Nunca acabam.', segura: true, cor: '#c8782a' },
    boneRosengo: { nome: 'Boné do Rosengo', info: 'Emprestado. Aperte Q (no celular, o botão 🧢). El Rosengo.', cor: '#d8b040' },
  };
  META.inv = META.inv || {};
  const invLista = () => {
    const Q = S.flags.centro || {}, out = [];
    for (const id of ['espeto', 'espetao']) if (META.inv[id]) out.push([id, META.inv[id]]);
    if (META.espetoInf) out.unshift(['espetoInf', 1]);
    for (const id of ['refri', 'doces', 'azedas', 'armas']) if (Q[id]) out.push([id, 1]);
    if (Q.mata >= 2 && Q.mata < 6) out.push(['boneRosengo', 1]);
    if (E.L && E.L.temCafe && E.L.temCafe()) out.push(['cafe', 1]);
    return out;
  };
  E.ganhaItem = (id, n = 1) => { META.inv[id] = (META.inv[id] || 0) + n; salvar(); E.toast(`🎒 ${ITENS[id].nome}<small>no inventário · ${E.isTouch ? 'botão 🎒' : 'tecla I'}</small>`); };
  const ehEspeto = id => id === 'espeto' || id === 'espetoInf';   // os que dá pra comer
  function icone(g, id, w, h) {
    const it = ITENS[id]; g.clearRect(0, 0, w, h);
    if (id === 'boneRosengo') {
      g.fillStyle = '#d8b040'; g.beginPath(); g.arc(w * .46, h * .56, w * .28, Math.PI, 0); g.fill(); g.fillRect(w * .18, h * .54, w * .56, h * .1);
      g.fillStyle = '#a87c18'; g.fillRect(w * .6, h * .6, w * .32, h * .07); g.fillStyle = '#fff2d6'; g.fillRect(w * .42, h * .36, w * .08, h * .08); return;
    }
    if (ehEspeto(id) || id === 'espetao') {
      const big = id === 'espetao';
      g.strokeStyle = '#c8a070'; g.lineWidth = big ? 3 : 2; g.beginPath(); g.moveTo(w * .15, h * .85); g.lineTo(w * .85, h * .15); g.stroke();
      for (let k = 0; k < (big ? 5 : 3); k++) { const t = .35 + k * (big ? .11 : .15); g.fillStyle = k % 2 ? '#a85a2a' : '#7a3a1a'; g.beginPath(); g.ellipse(w * (.15 + .7 * t), h * (.85 - .7 * t), w * (big ? .11 : .08), h * (big ? .09 : .07), -.8, 0, 7); g.fill(); }
      if (id === 'espetoInf') { g.fillStyle = '#ffd23a'; g.font = `bold ${w * .42 | 0}px monospace`; g.textAlign = 'center'; g.fillText('∞', w * .76, h * .84); }
      return;
    }
    g.fillStyle = it.cor; g.beginPath(); g.arc(w / 2, h / 2, w * .3, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = `bold ${w * .28 | 0}px monospace`; g.textAlign = 'center'; g.fillText(it.nome[0], w / 2, h / 2 + w * .1);
  }
  const pInv = mk('invP', 'INVENTÁRIO', 'o que você está carregando');
  E.abrirInventario = () => {
    if (!S.started || S.ended) return;
    const lista = invLista();
    pInv.querySelector('.dim').textContent = lista.length ? `🪙 ${E.saldo()} moedas · clique num item pra usar` : 'vazio por enquanto · fale com o Serjão na avenida';
    pInv.querySelector('.grid3').innerHTML = lista.map(([id, n]) => `<div class="c ${E.segurando === id ? 'sel' : 'ok'}" data-id="${id}"><canvas width="48" height="48"></canvas>${ITENS[id].nome}${id === 'espetoInf' ? ' ×∞' : n > 1 ? ' ×' + n : ''}<small>${ITENS[id].info}${ITENS[id].segura ? (E.segurando === id ? ' · na mão (clique pra guardar)' : ' · clique pra segurar') : ''}${ehEspeto(id) ? ' · ou comer (na mão: segure o clique esquerdo)' : ''}</small></div>`).join('');
    pInv.querySelectorAll('.c').forEach(c => {
      icone(c.querySelector('canvas').getContext('2d'), c.dataset.id, 48, 48);
      c.onclick = async () => {
        const id = c.dataset.id, it = ITENS[id]; if (!it.segura) return;
        if (E.segurando === id) { E.segurando = null; pintaMao(); E.abrirInventario(); return; }
        if (ehEspeto(id)) {
          pInv.classList.add('hidden');
          const i = await E.choice('Espeto do Serjão', ['Segurar na mão', 'Comer'], 0, 8);
          if (i === 1) { comerEspeto(id); return; }
        }
        E.segurando = id; pintaMao(); pInv.classList.add('hidden');
      };
    });
    pInv.classList.remove('hidden');
    invFoco = Math.min(invFoco, Math.max(0, lista.length - 1)); marcaFoco();
  };
  // inventário pelo teclado: TAB ou I fecha, setas escolhem, Enter / E / espaço usa, Esc fecha
  let invFoco = 0;
  const invCards = () => [...pInv.querySelectorAll('.c')];
  function marcaFoco() { invCards().forEach((c, i) => c.classList.toggle('foco', i === invFoco)); const c = invCards()[invFoco]; if (c) c.scrollIntoView({ block: 'nearest' }); }
  E.invAberto = () => !pInv.classList.contains('hidden');
  addEventListener('keydown', e => {
    if (!E.invAberto()) return;
    const k = e.code, cs = invCards();
    if (k === 'Tab' || k === 'KeyI' || k === 'Escape') { pInv.classList.add('hidden'); }
    else if (/^Arrow/.test(k) || /^Key[WASD]$/.test(k)) {
      if (cs.length) {
        const cols = Math.max(1, getComputedStyle(pInv.querySelector('.grid3')).gridTemplateColumns.split(' ').length);
        const d = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1, ArrowUp: -cols, KeyW: -cols, ArrowDown: cols, KeyS: cols }[k];
        invFoco = Math.max(0, Math.min(cs.length - 1, invFoco + d)); marcaFoco(); E.sfx && E.sfx.click && E.sfx.click();
      }
    } else if (k === 'Enter' || k === 'KeyE' || k === 'Space') { const c = cs[invFoco]; if (c) c.click(); }
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  // o item na mão: no canto de baixo (1ª pessoa) e do lado do boneco (3ª pessoa)
  const maoC = document.createElement('canvas'); maoC.width = 96; maoC.height = 96;
  maoC.style.cssText = 'position:absolute;right:6%;bottom:0;width:18%;image-rendering:pixelated;pointer-events:none;z-index:2;display:none;transform-origin:bottom right';
  $('wrap').appendChild(maoC);
  let maoMesh = null; const maoTex = E.texFrom(maoC);
  function pintaMao() {
    const id = E.segurando; maoC.style.display = id ? 'block' : 'none';
    if (!id) { if (maoMesh) maoMesh.visible = false; return; }
    const g = maoC.getContext('2d'); g.clearRect(0, 0, 96, 96);
    icone(g, id, 96, 96);
    g.fillStyle = '#f2c8a0'; g.beginPath(); g.ellipse(30, 74, 13, 9, -.6, 0, 7); g.fill();   // a mão segurando
    maoTex.needsUpdate = true;
  }
  E.segurar = id => { E.segurando = id; pintaMao(); };
  function comerEspeto(id = 'espeto') {
    if (id === 'espetoInf') { if (!META.espetoInf) return; }   // infinito: não gasta e continua na mão
    else {
      if (!META.inv.espeto) return;
      META.inv.espeto--; if (!META.inv.espeto) delete META.inv.espeto; salvar();
      if (E.segurando === 'espeto' && !META.inv.espeto) E.segurando = null;
    }
    pintaMao(); E.say(id === 'espetoInf' ? '(Comi um. Já tem outro no lugar. El Rosengo.)' : '(Hmm. O Serjão é o rei da churrasqueira mesmo.)', 3); E.tone(300, .1, .04, 'square');
  }
  // igual no Minecraft: com o espeto na mão, segure o botão esquerdo pra comer
  let comendo = null;
  $('wrap').addEventListener('mousedown', e => { if (e.button === 0 && ehEspeto(E.segurando) && S.started && !S.paused && !S.dlg && !S.noteOpen) comendo = { t: 0, n: 0 }; });
  addEventListener('mouseup', e => { if (e.button === 0) { comendo = null; maoC.style.marginBottom = ''; } });
  setInterval(() => {
    if (!comendo) return;
    if (!ehEspeto(E.segurando) || S.paused || S.dlg) { comendo = null; return; }
    comendo.t += .05;
    maoC.style.marginBottom = (Math.sin(comendo.t * 22) * 2.2 - 4) + '%';   // a mão leva o espeto até a boca
    if (comendo.t > comendo.n * .28) { comendo.n++; E.noiseHit && E.noiseHit(.06, .05, 900 + Math.random() * 600); }
    if (comendo.t >= 1.2) { comendo = null; maoC.style.marginBottom = ''; comerEspeto(E.segurando); }
  }, 50);
  E.maoTick = (dt, third) => {
    if (!E.segurando) return;
    const b = Math.sin(E.player.bob) * 6;
    maoC.style.display = third || S.exerc ? 'none' : 'block';
    maoC.style.transform = `translateY(${Math.abs(b)}px) rotate(${b * .4}deg)`;
    if (!maoMesh) { maoMesh = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), E.basic({ map: maoTex, transparent: true, alphaTest: .4 })); E.scene.add(maoMesh); }
    maoMesh.visible = third && !S.exerc;
    if (third) { const p = E.player.pos, yaw = E.player.yaw; maoMesh.position.set(p.x + Math.cos(yaw) * .45, E.ground(p.x, p.z) + .9, p.z - Math.sin(yaw) * .45); maoMesh.rotation.y = Math.atan2(E.camera.position.x - maoMesh.position.x, E.camera.position.z - maoMesh.position.z); }
  };

  /* ---------------- exercício (academia): a câmera mostra o boneco treinando em 3ª pessoa ---------------- */
  let barra = null;
  E.exercicio = (tipo, pos, yaw) => {
    if (S.exerc) return;
    S.exerc = { tipo, pos: pos.clone(), yaw, t: 0, reps: 0, ult: 0 };
    garanteAvatar();
    if (!barra) {
      barra = new THREE.Group(); const bm = E.lam({ color: 0x8a8a94 }), pm = E.lam({ color: 0x1a1a1e });
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.8, 6), bm); b.rotation.z = Math.PI / 2; barra.add(b);
      for (const s of [-1, 1]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .06, 12), pm); pl.rotation.z = Math.PI / 2; pl.position.x = s * .75; barra.add(pl); }
      E.scene.add(barra);
    }
    barra.visible = true;
    E.toast((tipo === 'supino' ? 'Supino' : 'Agachamento') + `<small>${E.isTouch ? '✋' : 'E'} pra parar · só pela saúde, não ganha nada</small>`);
  };
  E.sairExerc = () => { if (!S.exerc) return; S.exerc = null; if (barra) barra.visible = false; if (av) { av.rotation.set(0, 0, 0); av.scale.set(1, 1, 1); } E.say('(Bom treino. Corpoleo saudável.)', 2.5); };
  E.exercTick = dt => {
    const X = S.exerc; if (!X) return false;
    X.t += dt;
    const ciclo = (Math.sin(X.t * 2.6) + 1) / 2;   // 0 = em cima, 1 = embaixo
    if (ciclo > .97 && X.t - X.ult > 1) { X.ult = X.t; X.reps++; E.tone(440 + X.reps * 10, .06, .03, 'square'); E.say(`${X.tipo === 'supino' ? 'Supino' : 'Agachamento'}: ${X.reps} ${X.reps === 1 ? 'repetição' : 'repetições'}`, 1.2, 'npc'); }
    const fx = Math.sin(X.yaw), fz = Math.cos(X.yaw), lx = Math.cos(X.yaw), lz = -Math.sin(X.yaw);
    av.visible = true; av.material.map = avTex;
    if (X.tipo === 'agachamento') {
      av.rotation.set(0, 0, 0); av.scale.set(1, 1 - ciclo * .32, 1);
      av.position.set(X.pos.x, E.ground(X.pos.x, X.pos.z) + .8 * (1 - ciclo * .32), X.pos.z);
      barra.position.set(X.pos.x, av.position.y + .42 * (1 - ciclo * .3), X.pos.z); barra.rotation.set(0, X.yaw, 0);
      E.camera.position.set(X.pos.x + lx * 3 + fx * .6, X.pos.y + 1.3, X.pos.z + lz * 3 + fz * .6);
    } else {   // supino: deitado no banco, a barra sobe e desce
      av.scale.set(1, 1, 1); av.position.set(X.pos.x, X.pos.y + .62, X.pos.z); av.rotation.set(-Math.PI / 2, 0, X.yaw);
      barra.position.set(X.pos.x - fx * .25, X.pos.y + .78 + (1 - ciclo) * .45, X.pos.z - fz * .25); barra.rotation.set(0, X.yaw, 0);
      E.camera.position.set(X.pos.x + lx * 2.6, X.pos.y + 1.7, X.pos.z + lz * 2.6);
    }
    E.camera.lookAt(X.pos.x, X.pos.y + .7, X.pos.z);
    return true;
  };

  /* ---------------- portal (bem chamativo): anel girando, redemoinho, faíscas, feixe de luz e placa ---------------- */
  E.portal = (x, z, rotY, texto, cor = '#7affd8') => {
    const L = E.L, c3 = new THREE.Color(cor);
    const grp = new THREE.Group(); grp.position.set(x, E.ground ? E.ground(x, z) : 0, z); grp.rotation.y = rotY; E.add(grp);
    const mb = o => new THREE.MeshBasicMaterial(Object.assign({ fog: false }, o));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, .13, 8, 32), mb({ color: c3 })); ring.position.y = 1.4; grp.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.32, .05, 6, 32), mb({ color: 0xffffff, transparent: true, opacity: .7 })); ring2.position.y = 1.4; grp.add(ring2);
    const sw = document.createElement('canvas'); sw.width = sw.height = 128; const g = sw.getContext('2d');
    const rg = g.createRadialGradient(64, 64, 4, 64, 64, 64); rg.addColorStop(0, '#ffffff'); rg.addColorStop(.35, cor); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
    for (let b = 0; b < 4; b++) { g.beginPath(); for (let t = 0; t < 1; t += .02) { const a = b * Math.PI / 2 + t * 7, r = t * 60; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.stroke(); }
    const swT = new THREE.CanvasTexture(sw);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(1.08, 32), mb({ map: swT, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false })); disco.position.y = 1.4; grp.add(disco);
    const feixe = new THREE.Mesh(new THREE.CylinderGeometry(.35, .9, 16, 12, 1, true), mb({ color: c3, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); feixe.position.y = 8; grp.add(feixe);
    const pl = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), mb({ color: c3, transparent: true, opacity: .35, depthWrite: false })); pl.rotation.x = -Math.PI / 2; pl.position.y = .04; grp.add(pl);
    // placa grande, legível de longe
    const sc = document.createElement('canvas'); sc.width = 256; sc.height = 56; const sg = sc.getContext('2d');
    sg.fillStyle = '#140c1c'; sg.fillRect(0, 0, 256, 56); sg.strokeStyle = cor; sg.lineWidth = 4; sg.strokeRect(3, 3, 250, 50);
    sg.fillStyle = '#ffffff'; sg.font = 'bold 26px monospace'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText(texto, 128, 29);
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .75), mb({ map: new THREE.CanvasTexture(sc), side: THREE.DoubleSide })); placa.position.y = 3.65; grp.add(placa);
    const luz = new THREE.PointLight(c3, 10, 9, 1.4); luz.position.y = 1.4; grp.add(luz);
    const fa = []; for (let k = 0; k < 16; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.07, .07), mb({ color: k % 3 ? c3 : 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false })); f.userData = { a: Math.random() * 6.28, r: .9 + Math.random() * .6, y: Math.random() * 3, v: .5 + Math.random() * .8 }; grp.add(f); fa.push(f); }
    let t = 0;
    (L._portais || (L._portais = [])).push(dt => {
      t += dt; disco.rotation.z -= dt * 1.8; ring.rotation.z += dt * .6; ring2.rotation.z -= dt * .9;
      const k = 1 + Math.sin(t * 3) * .05; ring.scale.set(k, k, 1); luz.intensity = 9 + Math.sin(t * 5) * 3; feixe.material.opacity = .13 + Math.sin(t * 2) * .05;
      for (const f of fa) { const u = f.userData; u.y += u.v * dt; if (u.y > 3.2) u.y = 0; u.a += dt * .8; f.position.set(Math.cos(u.a) * u.r, u.y, Math.sin(u.a) * u.r * .4); f.material.opacity = 1 - u.y / 3.2; f.rotation.y = -rotY; }
    });
    return grp;
  };

  /* ---------------- PROCURA-SE: CAVALO CAPINHA (cartazes espalhados pelo mapa) ---------------- */
  const CAPINHA_TOTAL = 7;
  let capT = null;
  const texCapinha = () => capT || (capT = E.canvasTex(64, 88, g => {
    g.fillStyle = '#efe2b8'; g.fillRect(0, 0, 64, 88); E.speckle && E.speckle(g, 64, 88, 90, ['rgba(120,90,40,.12)', 'rgba(255,255,255,.2)']);
    g.fillStyle = '#b0201a'; g.font = 'bold 11px monospace'; g.textAlign = 'center'; g.fillText('PROCURA-SE', 32, 13);
    // o cavalo, com a capinha vermelha nas costas
    g.fillStyle = '#8a5a2e'; g.fillRect(14, 34, 30, 13); g.fillRect(40, 24, 8, 14); g.fillRect(44, 21, 11, 8);
    g.fillRect(16, 46, 4, 12); g.fillRect(24, 46, 4, 12); g.fillRect(34, 46, 4, 12); g.fillRect(40, 46, 4, 12);
    g.fillStyle = '#3a2414'; g.fillRect(38, 20, 5, 15); g.fillRect(10, 35, 5, 10); g.fillRect(52, 24, 2, 2);
    g.fillStyle = '#d82a3a'; g.beginPath(); g.moveTo(18, 32); g.lineTo(40, 30); g.lineTo(36, 46); g.lineTo(12, 44); g.fill();
    g.fillStyle = '#ffd23a'; g.fillRect(38, 29, 3, 3);
    g.fillStyle = '#1a1a1a'; g.font = 'bold 9px monospace'; g.fillText('CAVALO', 32, 69); g.fillText('CAPINHA', 32, 78);
    g.font = '5px monospace'; g.fillText('ele fugiu de mim', 32, 85);
  }));
  // cria um cartaz num poste de madeira. id único por cartaz (conta pra conquista)
  E.cartazCapinha = (id, x, z, rotY = 0) => {
    const grp = new THREE.Group(); grp.position.set(x, E.ground ? E.ground(x, z) : 0, z); grp.rotation.y = rotY; E.add(grp);
    const poste = new THREE.Mesh(new THREE.BoxGeometry(.1, 2.1, .1), E.lam({ color: 0x5a3a22 })); poste.position.y = 1.05; grp.add(poste);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(.64, .88), E.basic({ map: texCapinha(), side: THREE.DoubleSide })); c.position.set(0, 1.55, .06); c.rotation.z = (Math.random() - .5) * .08; grp.add(c);
    E.circle && E.circle(x, z, .2);
    E.interact(c, { label: () => S.dlg ? '' : '[E] Cartaz: PROCURA-SE', act: async () => {
      META.capinha = META.capinha || {};
      const novo = !META.capinha[id]; META.capinha[id] = 1; salvar();
      const n = Object.keys(META.capinha).length;
      await E.conversa([
        ['CARTAZ', 'PROCURA-SE: CAVALO CAPINHA. Marrom, crina escura, usa uma capinha vermelha nas costas.', '#efe2b8'],
        ['CARTAZ', '“Ele fugiu de mim. Correu de mim. Se você ver ele por aí, por favor, avise.”', '#efe2b8'],
        ['VOCÊ', n >= CAPINHA_TOTAL ? '(Esse é o último cartaz. O Cavalo Capinha continua sumido... por enquanto.)' : `(Mais um cartaz do Cavalo Capinha. ${n} de ${CAPINHA_TOTAL}.)`],
      ]);
      if (novo && n >= CAPINHA_TOTAL) E.conquista('capinha');
    } });
    return grp;
  };

  /* ---------------- laço ---------------- */
  E.extrasTick = dt => {
    if (S.started && !S.paused && !S.ended) { S.flags.tempo = (S.flags.tempo || 0) + dt; META.tempoTotal = (META.tempoTotal || 0) + dt; }   // tempo de jogo (pra avaliação no fim)
    E.dlgTick(dt); tickMoedas(dt); tickObj(dt); tickAssombro(dt); E.maoTick(dt, E.third());
    if (E.L && E.L._portais) for (const f of E.L._portais) f(dt);
    if (E.L && E.L._anims) E.L._anims = E.L._anims.filter(f => f(dt) !== false);   // animações que acabam (devolvem false)
    if (hudT > 0) { hudT -= dt; avHud.style.opacity = Math.min(1, hudT); } else avHud.style.opacity = 0;
  };
  pintaSkin(); hudMoedas(false);
  if (E.ovosAchados && E.ovosAchados() >= 12) E.conquista('segredos');
}
