// FIM · Os Portões do Clubex. Depois da fita, um hino sobe pro céu e você chega nos portões, acima das nuvens.
// O Homem-Distinto te recebe ("Eu sei."), os portões se abrem e lá dentro fica o salão dos segredos do Clubex:
// o elenco em pedestais, a história da Confraria e dos Bacanos, a jukebox com "Portões Abertos do Clubex" e a porta do fim.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(6767);
  E.scene.background = new THREE.Color(0xf6e2c8);
  E.scene.fog = new THREE.FogExp2(0xf8ead8, .011);
  E.camera.far = 160;
  L.semAssombro = true;
  L.floor = 'carpet'; L.speed = 2.2; L.eye = 1.6; L.reach = 2.4;
  E.osd('▶ PLAY', 'PORTÕES DO CLUBEX · ∞');
  L.clock = () => '67:67';
  const { lam, basic, box } = E;
  const C = { aberto: false, falou: false, said: {}, gate: 0, sobe: 1 };
  const GZ = 0;
  L.walkable = (x, z) => (Math.abs(x) < 2.6 && z > GZ + .5 && z < 34) || (C.aberto && ((Math.abs(x) < 2.4 && z > GZ - 2 && z <= GZ + .6) || Math.hypot(x, z + 15) < 13));
  L.spawn = { x: 0, z: 31, yaw: 0, pitch: .05 };

  /* céu, nuvens, sol */
  const skyT = E.canvasTex(4, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ab8f0'); gr.addColorStop(.45, '#f6d8e8'); gr.addColorStop(.55, '#fff0d8'); gr.addColorStop(1, '#fff6e8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sky = new THREE.Group(); E.add(sky);
  sky.add(new THREE.Mesh(new THREE.SphereGeometry(150, 16, 10), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false })));
  const sol = new THREE.Mesh(new THREE.CircleGeometry(16, 24), new THREE.MeshBasicMaterial({ color: 0xfff2c0, fog: false, depthWrite: false })); sol.position.set(0, 40, -140); sky.add(sol);
  sky.children.forEach(m => m.renderOrder = -1);
  const nuvemM = lam({ color: 0xffffff, emissive: 0x3a3a3a });
  const nuvens = [];
  for (let i = 0; i < 70; i++) { const a = rnd() * 6.28, r = 8 + rnd() * 70; const n = E.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2 + rnd() * 4, 0), nuvemM)); n.position.set(Math.sin(a) * r, -3 - rnd() * 4, Math.cos(a) * r - 10); n.scale.y = .5; nuvens.push(n); }
  E.add(new THREE.HemisphereLight(0xfff6e0, 0xb8a8d0, 1.5));
  const sun = E.add(new THREE.DirectionalLight(0xfff0c8, 1.2)); sun.position.set(10, 30, 20);

  /* caminho de nuvem dourada até os portões */
  const caminhoT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 160, ['#f2e2c0', '#fffaf0', '#f8e8c8']); g.fillStyle = '#e8c870'; g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); }, [1, 10]);
  const cam = E.add(new THREE.Mesh(new THREE.PlaneGeometry(5.4, 34), lam({ map: caminhoT }))); cam.rotation.x = -Math.PI / 2; cam.position.set(0, .02, 17);
  const salaoT = E.canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#fff2d8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c870'; g.lineWidth = 2; for (let r = 6; r < 32; r += 8) { g.beginPath(); g.arc(32, 32, r, 0, 7); g.stroke(); } g.fillStyle = '#c8a040'; g.font = 'bold 12px monospace'; g.textAlign = 'center'; g.fillText('67', 32, 37); });
  const salao = E.add(new THREE.Mesh(new THREE.CircleGeometry(13.5, 24), lam({ map: salaoT }))); salao.rotation.x = -Math.PI / 2; salao.position.set(0, .03, -15);

  /* os portões */
  const ouro = lam({ color: 0xe8b830, emissive: 0x4a3008 });
  for (const sx of [-1, 1]) { box(1.2, 7, 1.2, lam({ color: 0xfff2e0 }), sx * 3.4, 3.5, GZ); const bola = E.add(new THREE.Mesh(new THREE.SphereGeometry(.7, 10, 8), ouro)); bola.position.set(sx * 3.4, 7.5, GZ); }
  const arcoT = E.canvasTex(96, 24, g => { g.fillStyle = '#241726'; g.fillRect(0, 0, 96, 24); g.fillStyle = '#ffd23a'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText('CLUBEX', 48, 17); });
  const arco = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), basic({ map: arcoT }))); arco.position.set(0, 7.2, GZ + .62);
  const portas = [];
  for (const sx of [-1, 1]) {
    const h = E.add(new THREE.Group()); h.position.set(sx * 2.8, 0, GZ);
    for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.09, 6, .09), ouro); b.position.set(-sx * (.2 + k * .48), 3, 0); h.add(b); }
    for (const y of [1, 3, 5.6]) { const t = new THREE.Mesh(new THREE.BoxGeometry(2.8, .12, .12), ouro); t.position.set(-sx * 1.4, y, 0); h.add(t); }
    const m67 = new THREE.Mesh(new THREE.CircleGeometry(.45, 12), ouro); m67.position.set(-sx * 1.4, 3.4, .08); h.add(m67);
    portas.push({ h, sx }); L.occluders.push(h.children[0]);
  }
  const brilho = E.add(new THREE.PointLight(0xffe0a0, 20, 14, 1.4)); brilho.position.set(0, 4, GZ - 3);

  /* o Homem-Distinto, guardião dos portões */
  const hd = E.add(E.club('homemDistinto', 1.95)); hd.position.set(1.4, 0, GZ + 2.2); E.circle(1.4, GZ + 2.2, .35);
  const HD = '#ff8f8f';
  E.interact(E.hitbox(1, 2, 1, 1.4, 1, GZ + 2.2), { label: () => S.dlg ? '' : '[E] Falar com o Homem-Distinto', act: () => falaHD() });
  async function falaHD() {
    if (S.dlg) return;
    if (C.aberto) return E.conversa([['HOMEM-DISTINTO', 'Pode entrar. Os segredos estão lá dentro. Eu já sei quais você vai achar.', HD]]);
    E.voice('h_eu_sei', '', 'x');
    await E.conversa([
      ['HOMEM-DISTINTO', 'Eu sei.', HD],
      ['VOCÊ', 'Sabe o quê?'],
      ['HOMEM-DISTINTO', 'Eu sei quem você é. Eu sei o que você viu naquela fita. O pássaro, as colinas, as salas amarelas, o mar de 1491.', HD],
      ['HOMEM-DISTINTO', 'Eu nasci pequenino em Acerolândia. Atravessei montanhas e escuridão até chegar aqui. Fui o primeiro Acerolito a alcançar estes portões.', HD],
      ['HOMEM-DISTINTO', 'Aqui é o Clubex. A Confraria. A respeitabilíssima agremiação.', HD],
      ['HOMEM-DISTINTO', 'Pra entrar, são quatro regras: ser muito maneiro. Ter muita aura. Ser uma pessoa distinta. E ser espirituoso, sobremaneira.', HD],
    ]);
    const i = await E.choice('Você tem aura?', ['Tenho', 'Não sei', 'Que isso?'], 1, 14);
    const resp = ['Eu sei.', 'Eu sei. Você tem.', 'Todo mundo pergunta “que isso?”. Eu não preciso perguntar. Eu já sei.'][i];
    await E.conversa([['HOMEM-DISTINTO', resp, HD], ['HOMEM-DISTINTO', 'Quem enfrenta o Passarex e volta pra casa tem aura de sobra. Os portões estão abertos pra você.', HD]]);
    abrir();
  }
  function abrir() {
    if (C.aberto) return; C.aberto = true; E.save();
    E.sfx.chime(); E.tone(523, 1.2, .05, 'triangle'); E.tone(659, 1.2, .05, 'triangle', null, .2); E.tone(784, 1.6, .05, 'triangle', null, .4); E.tone(1046, 2, .05, 'triangle', null, .6);
    E.toast('Os Portões do Clubex<small>os segredos estão lá dentro</small>');
  }

  /* o salão dos segredos: o elenco em pedestais, cada um com a sua história */
  const SALA = [
    ['acerolito', 1, 'ACEROLITOS', ['Pequenos, de mini cartola torta e bico laranja. Vivem em Acerolândia, dão pulinhos e perguntam pra tudo: “Que isso?”', 'Se ajoelham quando o Homem-Distinto passa.']],
    ['bicho', 1.9, 'O BICHO QUE SABE', ['O oráculo do Clubex. Consulta os autos e conhece o roteiro do universo.', '“Ele sabe. Ele sabe muito. Ele sabe demasiado.”', 'Uma vez, pela primeira vez, ele não soube. Mas era “QUE NADA!”.']],
    ['douradex', 1.9, 'DOURADEX', ['O Rei do Ouro, o Rei da Expedição. Navegou com o Passarex em 1491 e confiou no pássaro mesmo sem respostas.', '“É por ali, confia!”']],
    ['rosengo', 1.8, 'EL ROSENGO', ['Ser rosado, de boné Douradex e vestes verdolengas. Mora no matagalé.', 'A resposta pra tudo é o próprio nome: “¡EL ROSENGO!”', 'A Ratabrumga roubou o boné dele. Com a ajuda de um Acerolito caído, ele recuperou. E o Acerolito foi perdoado.']],
    ['serjao', 1.85, 'SERJÃO DOS ESPETOS', ['Rei da churrasqueira. Só assa se pedirem.', 'Um dia ninguém pediu e ele partiu. Mas prometeu voltar. E voltou.']],
    ['orelha', .95, 'CACHORRO ORELHA', ['Orelhas gigantes: escuta tudo, até pensamento.', 'Foi trancado numa ilha no meio do Atlântico. Os Acerolitos foram lá e salvaram ele.', '“Au.”']],
    ['ted', 1.25, 'TED', ['O cachorro do Kaiky. Ser lendário do Clubex.', 'A aura dele é tão absurda que nunca foi possível estimar a intensidade: todos os medidores de aura quebraram.', '“Au.”']],
    ['uperFleguis', 1.2, 'MARCÃO DA CALÇARIA', ['O ancestral dos descendentes, guardião da calçada. As uper fléguis são os tênis sagrados: ninguém ousa tocar.', '“Prossegui, meus descendentes.”']],
    ['passaroEsferas', 1.3, 'PÁSSARO DAS ESFERAS', ['Concede pedidos, mas só se você pedir. No curta em stop motion, alguém pediu errado e todo mundo ficou careca.', 'Mora numa floresta de cogumelos com o Mago e o Macaco.']],
    ['ratabrumga', .45, 'RATABRUMGA', ['Rata. Índole questionável. Roubou o boné do El Rosengo e foi derrotada nos Portões do Clubex.', 'Dizem que ainda ronda o QG nas noites de plantão.']],
    ['passarex', 1.6, 'PASSAREX', ['Corpo de ave, rosto humano, olhos brancos. Não fala: só assobia. Fiu fiu.', 'Não quer a sua alma. Quer o seu susto. Quem tem aura passa reto; quem não tem, recebe o fiu fiu na janela.', 'Incidente 1367: 67 relatos, três semanas de tensão, em Naviraí. Esta fita.']],
  ];
  SALA.forEach(([club, h, nome, texto], k) => {
    const a = Math.PI + (k / SALA.length) * Math.PI * 2 + Math.PI / SALA.length, r = 10.5, x = Math.sin(a) * r, z = -15 + Math.cos(a) * r;
    const ry = Math.atan2(-Math.sin(a), -Math.cos(a));
    box(1.4, .7, 1.4, lam({ color: 0xfff2e0 }), x, .35, z).rotation.y = ry; box(1.5, .1, 1.5, ouro, x, .72, z, { occ: false }).rotation.y = ry; E.circle(x, z, .9);
    const f = E.add(E.club(club, h)); f.position.set(x, .77, z);
    const plT = E.canvasTex(64, 12, g => { g.fillStyle = '#241726'; g.fillRect(0, 0, 64, 12); g.fillStyle = '#ffd23a'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText(nome, 32, 8.5, 60); });
    const pl = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.3, .25), basic({ map: plT }))); const dx = -Math.sin(a), dz = -Math.cos(a);
    pl.position.set(x + dx * .715, .42, z + dz * .715); pl.rotation.y = Math.atan2(dx, dz);
    E.interact(E.hitbox(1.6, 2.6, 1.6, x, 1.3, z), { label: () => S.dlg ? '' : '[E] ' + nome, act: () => { if (!S.dlg) { C.said['p' + k] = true; E.conversa(texto.map(t => [nome, t])); } } });
  });
  // o monumento 67 no meio
  const m67T = E.canvasTex(48, 48, g => { g.fillStyle = '#e8b830'; g.fillRect(0, 0, 48, 48); g.fillStyle = '#fff2c0'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText('67', 24, 34); });
  const mon = E.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), lam({ map: m67T, emissive: 0x3a2808 }))); mon.position.set(0, 1.6, -15); E.circle(0, -15, 1.3);
  box(2.2, .8, 2.2, lam({ color: 0xfff2e0 }), 0, .4, -15);
  E.interact(E.hitbox(2.2, 3, 2.2, 0, 1.5, -15), { label: () => S.dlg ? '' : '[E] O 67', act: () => E.conversa([['MONUMENTO', 'O número 67. O símbolo máximo do Clubex.'], ['MONUMENTO', 'Ninguém explica. Ninguém precisa explicar. Quem tem aura entende.'], ['MONUMENTO', 'E quem chegou até aqui guarda o segredo: perdeu o save? Em CAPÍTULOS, “Tenho um código”, digite 1367.']]) });
  /* ---------------- a festa nos Portões: todo mundo junto, e cada um avalia como você foi ---------------- */
  // números da sua partida
  const stats = () => {
    const M = E.META || {}, fl = S.flags || {};
    let finais = 0; try { finais = (JSON.parse(localStorage.getItem('registro1367-finais') || '[]') || []).filter(f => 'ABC'.includes(f)).length; } catch (e) {}
    const st = {
      min: Math.max(1, Math.round((fl.tempo || 0) / 60)), notou: S.noticed || 0, pistas: Object.keys(S.clues || {}).length, penas: S.penas || 0,
      moedas: E.totalMoedas ? E.totalMoedas() : 0, segredos: E.ovosAchados ? E.ovosAchados() : 0, conq: Object.keys(M.conq || {}).length,
      cartazes: Object.keys(M.capinha || {}).length, luta: fl.luta || null, finais, gastas: M.gastas || 0,
    };
    let p = 0;   // nota geral
    p += st.min <= 45 ? 2 : st.min <= 90 ? 1 : 0; p += st.notou <= 1 ? 2 : st.notou <= 3 ? 1 : 0; p += Math.min(2, Math.floor(st.segredos / 4));
    p += st.moedas >= 30 ? 2 : st.moedas >= 15 ? 1 : 0; p += st.luta ? ({ S: 3, A: 2, B: 1 }[st.luta.nota] || 0) : 0; p += st.cartazes >= 7 ? 1 : 0; p += st.pistas + st.penas >= 5 ? 1 : 0;
    st.geral = p >= 11 ? 'S' : p >= 8 ? 'A' : p >= 5 ? 'B' : 'C';
    return st;
  };
  const sprite = (cv, h) => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(h * cv.width / cv.height, h), basic({ map: E.texFrom(cv), transparent: true, alphaTest: .5, side: THREE.DoubleSide })); m.position.y = h / 2; g.add(m); L.billboards.push(g); return E.add(g); };
  const tela = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d')); return c; };
  // Magnific Cerolitos-Man: herói de malha amarela e roxa, cartola preta com aranha vermelha e o Acerolito no peito
  const cerolitos = tela(64, 112, g => {
    g.fillStyle = '#6a2fb0'; g.fillRect(19, 66, 11, 38); g.fillRect(34, 66, 11, 38);   // calça roxa
    g.fillStyle = '#f2c81e'; g.fillRect(18, 100, 12, 8); g.fillRect(34, 100, 12, 8);   // botas amarelas
    g.fillStyle = '#f2c81e'; g.fillRect(16, 34, 32, 34);   // tronco
    g.fillStyle = '#6a2fb0'; g.beginPath(); g.moveTo(16, 38); g.lineTo(24, 38); g.lineTo(16, 60); g.fill(); g.beginPath(); g.moveTo(48, 38); g.lineTo(40, 38); g.lineTo(48, 60); g.fill();
    g.fillStyle = '#f2c81e'; g.fillRect(8, 36, 8, 22); g.save(); g.translate(50, 36); g.rotate(-.9); g.fillRect(0, 0, 8, 24); g.restore();   // braço esquerdo e o direito pra cima
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(66, 4); g.lineTo(58, 18); g.stroke();   // teia
    g.fillStyle = '#f2c81e'; g.beginPath(); g.ellipse(32, 24, 11, 12, 0, 0, 7); g.fill();   // cabeça
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 1.2; for (const [x, s] of [[26, -1], [38, 1]]) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x + s * 5, 23); g.lineTo(x, 28); g.closePath(); g.fill(); g.stroke(); }
    g.strokeStyle = 'rgba(160,90,20,.55)'; g.lineWidth = .6; for (let y = 36; y < 68; y += 5) { g.beginPath(); g.moveTo(16, y); g.lineTo(48, y); g.stroke(); } for (let x = 20; x < 48; x += 6) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x, 68); g.stroke(); }
    g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(32, 48, 5, 0, 7); g.fill(); g.fillStyle = '#111'; g.fillRect(29, 41, 6, 4); g.fillRect(27, 44, 10, 1);   // o Acerolito no peito
    g.fillStyle = '#121014'; g.fillRect(21, 0, 22, 14); g.fillRect(16, 13, 32, 3);   // cartola
    g.fillStyle = '#d0202c'; g.beginPath(); g.arc(32, 8, 2.2, 0, 7); g.fill(); g.strokeStyle = '#d0202c'; g.lineWidth = .8; for (const s of [-1, 1]) for (const dy of [-2, 0, 2]) { g.beginPath(); g.moveTo(32, 8); g.lineTo(32 + s * 5, 8 + dy); g.stroke(); }
  });
  // os Bacanos: braços cruzados, como na foto
  const bacano = o => tela(64, 128, g => {
    g.fillStyle = o.tenis; g.fillRect(14, 116, 15, 9); g.fillRect(35, 116, 15, 9);
    if (o.tenis2) { g.fillStyle = o.tenis2; g.fillRect(14, 121, 15, 2); g.fillRect(35, 121, 15, 2); }
    g.fillStyle = o.calca; g.fillRect(16, 72, 14, 46); g.fillRect(34, 72, 14, 46);
    if (o.cargo) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(14, 86, 4, 10); g.fillRect(46, 86, 4, 10); }
    g.fillStyle = o.camisa; g.fillRect(12, 38, 40, 38);
    g.fillStyle = o.pele; g.fillRect(8, 52, 48, 9);   // braços cruzados
    g.fillStyle = o.camisa; g.fillRect(8, 40, 10, 14); g.fillRect(46, 40, 10, 14);   // mangas
    g.fillStyle = o.pele; g.fillRect(27, 30, 10, 9); g.beginPath(); g.ellipse(32, 22, 12, 13, 0, 0, 7); g.fill();
    g.fillStyle = o.cabelo; g.beginPath(); g.ellipse(32, 13, 13, o.cachos ? 9 : 7, 0, Math.PI, 0); g.fill(); g.fillRect(19, 10, 26, 5);
    if (o.cachos) for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(20 + k * 4, 9 + (k % 2) * 2, 3, 0, 7); g.fill(); }
    if (o.barba) { g.fillStyle = 'rgba(20,14,10,.55)'; g.fillRect(25, 31, 14, 3); }
    g.fillStyle = '#1a1a1a'; g.fillRect(26, 21, 3, 3); g.fillRect(35, 21, 3, 3); g.fillRect(29, 29, 6, 1.5);
    if (o.oculos) { g.strokeStyle = '#1a1a1a'; g.lineWidth = 1.4; g.strokeRect(23.5, 19.5, 8, 6); g.strokeRect(32.5, 19.5, 8, 6); g.beginPath(); g.moveTo(31.5, 22); g.lineTo(32.5, 22); g.stroke(); }
  });
  const nomeTag = (txt, cor = '#ffd23a') => tela(96, 18, g => { g.fillStyle = 'rgba(20,12,30,.85)'; g.fillRect(0, 0, 96, 18); g.fillStyle = cor; g.font = 'bold 11px monospace'; g.textAlign = 'center'; g.fillText(txt, 48, 13); });
  const cocoCv = tela(64, 72, g => {
    g.fillStyle = '#e0a040'; g.fillRect(24, 58, 3, 10); g.fillRect(37, 58, 3, 10);
    g.fillStyle = '#7a4a24'; g.beginPath(); g.ellipse(32, 40, 22, 22, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(32, 18, 9, 7, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(36, 10, 5, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#a8703a'; g.beginPath(); g.ellipse(32, 46, 13, 12, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(25, 32, 6, 0, 7); g.arc(39, 32, 6, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(26, 33, 2.4, 0, 7); g.arc(38, 33, 2.4, 0, 7); g.fill();
    g.fillStyle = '#f0b040'; g.beginPath(); g.moveTo(28, 39); g.lineTo(36, 39); g.lineTo(32, 45); g.fill();
  });
  const N = n => n === 1 ? '' : 's';
  const EN = () => !!(window.I18N && I18N.lang === 'en');
  const tx = (pt, en) => EN() ? en : pt;   // as avaliações têm números e trechos variáveis: cada fala já vem nos dois idiomas
  const ord = n => EN() ? n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th') : n + 'ª';
  const notaTxt = g => g === 'S' ? tx('Aura no máximo.', 'Maximum aura.') : g === 'A' ? tx('Tem muita aura.', 'You have lots of aura.') : g === 'B' ? tx('Tem aura, dá pra ter mais.', 'You have aura, but you can have more.') : tx('Joga de novo que a aura vem.', 'Play again and the aura will come.');
  // quem está na festa, e o que cada um acha da sua partida
  const FESTA = [
    // fila da frente: os Bacanos e o Cerolitos-Man
    ['DAVY', () => sprite(bacano({ pele: '#b07a52', cabelo: '#141010', cachos: true, oculos: true, camisa: '#f4f2ec', calca: '#b8d0e8', cargo: true, tenis: '#d8dce4', tenis2: '#6a7280' }), 1.85), -1.6, 4.3, '#9fe3aa',
      s => [tx('Você chegou! Valeu por jogar o nosso jogo.', 'You made it! Thanks for playing our game.'), tx(`Nota geral da sua fita: ${s.geral}. `, `Your tape's overall grade: ${s.geral}. `) + notaTxt(s.geral), tx('O jogo tá em alfa e recebe atualização quase todo dia. Volta sempre!', "The game is in alpha and gets updates almost every day. Come back anytime!")]],
    ['LUIS', () => sprite(bacano({ pele: '#d8a880', cabelo: '#1a1412', oculos: true, camisa: '#1e1e22', calca: '#b0a080', tenis: '#1a1a1a' }), 1.9), 0, 4.6, '#9fe3aa',
      s => [tx('Bem-vindo aos Portões!', 'Welcome to the Gates!'), tx(`Você jogou por ${s.min} minuto${N(s.min)}. `, `You played for ${s.min} minute${N(s.min)}. `) + (s.min <= 45 ? tx('Rápido demais, hein.', 'Way too fast, huh.') : s.min <= 90 ? tx('No tempo certo.', 'Right on time.') : tx('Aproveitou cada canto, gostei.', 'You enjoyed every corner, I like that.'))]],
    ['GUSTAVO', () => sprite(bacano({ pele: '#8a5634', cabelo: '#141010', barba: true, camisa: '#f4f2ec', calca: '#b8b8bc', tenis: '#1a1a1a' }), 1.9), 1.6, 4.3, '#9fe3aa',
      s => [tx('Chegou na festa!', 'You made it to the party!'), s.luta ? tx(`Vi a sua luta: nota ${s.luta.nota}, em ${s.luta.tempo} segundos`, `I saw your fight: grade ${s.luta.nota}, in ${s.luta.tempo} seconds`) + (s.luta.tentativas > 1 ? tx(`, na ${ord(s.luta.tentativas)} tentativa.`, `, on the ${ord(s.luta.tentativas)} try.`) : tx(', de primeira.', ', first try.')) : tx('Você chegou aqui sem lutar? Respeito.', 'You got here without fighting? Respect.'), tx('Pena rosa é parry. Nunca esqueça.', 'Pink feather means parry. Never forget.')]],
    ['MAGNIFIC CEROLITOS-MAN', () => sprite(cerolitos, 1.9), 3.2, 3.6, '#ffd23a',
      s => [tx('O CLUBEX É PRA TODOS!', 'CLUBEX IS FOR EVERYONE!'), tx(`Ele não é só um herói... ele é o Homem-Cerolitos. E ele diz: sua nota é ${s.geral}.`, `He's not just a hero... he's the Cerolitos-Man. And he says: your grade is ${s.geral}.`)]],
    // o pessoal do Clubex e do Arquivo Passarex
    ['PASSAREX', () => E.add(E.club('passarex', 1.6)), -3.4, 3.4, '#ff8f8f',
      s => E.state.flags.final === 'D' ? [tx('fiu fiu.', 'fiu fiu.'), tx('(Ele assobia pra você, bem baixinho, e encosta a cabeça no seu ombro. Agora o fiu fiu é só um oi.)', '(He whistles at you, very softly, and rests his head on your shoulder. Now “fiu fiu” just means hi.)')] : [tx('fiu fiu.', 'fiu fiu.'), s.notou <= 1 ? tx(`(Ele te olha, meio decepcionado. Você quase não chamou a atenção dele: ${s.notou} vez${s.notou === 1 ? '' : 'es'}.)`, `(He looks at you, a little disappointed. You barely caught his attention: ${s.notou} time${N(s.notou)}.)`) : tx(`(Ele te notou ${s.notou} vezes. Ele lembra de você. Ele sempre vai lembrar.)`, `(He noticed you ${s.notou} times. He remembers you. He always will.)`)]],
    ['BICHO QUE SABE', () => E.add(E.club('bicho', 1.8)), -4.6, 1.6, '#c8a0ff',
      s => [tx('Eu sei. Eu sei muito. Eu sei demasiado.', 'I know. I know a lot. I know too much.'), tx(`Por exemplo: você achou ${s.segredos} de 12 segredos do Clubex.`, `For example: you found ${s.segredos} of the 12 Clubex secrets.`), s.segredos >= 12 ? tx('Você também sabe demasiado.', 'You know too much too.') : tx('Os outros ainda estão escondidos. Eu sei onde. Não vou contar.', "The others are still hidden. I know where. I won't tell.")]],
    ['DOURADEX', () => E.add(E.club('douradex', 1.78)), -5.2, -.6, '#ffd23a',
      s => [tx('Eu falei que era por ali!', 'I told you it was that way!'), tx(`Você achou ${s.pistas} pista${N(s.pistas)} e ${s.penas} pena${N(s.penas)} na fita. `, `You found ${s.pistas} clue${N(s.pistas)} and ${s.penas} feather${N(s.penas)} on the tape. `) + (s.pistas + s.penas >= 6 ? tx('Rei da Expedição!', 'Expedition King!') : tx('Dá pra achar mais, confia.', 'You can find more, trust me.'))]],
    ['COLOMBO', () => E.add(E.figura('drawColombo', 1.8)), -5.4, -2.8, '#9fd8ff',
      s => [tx('Eu levei setenta dias pra cruzar o oceano.', 'It took me seventy days to cross the ocean.'), tx(`Você levou ${s.min} minuto${N(s.min)} pra chegar aqui. Ninguém vai acreditar nisso.`, `It took you ${s.min} minute${N(s.min)} to get here. Nobody's going to believe this.`)]],
    ['TONHO', () => E.add(E.figura('drawTonho', 1.72)), -4.6, -4.8, '#ffb070',
      s => [tx('Terra à vista!', 'Land ho!'), tx(`Você viu ${s.finais} de 3 finais da fita. `, `You've seen ${s.finais} of the tape's 3 endings. `) + (s.finais >= 3 ? tx('Viu tudo, chefe!', 'You saw everything, boss!') : tx('Tem final que você ainda não viu, chefe.', "There's an ending you haven't seen yet, boss."))]],
    ['SERJÃO', () => E.add(E.club('serjao', 1.8)), 4.6, 1.6, '#ffb070',
      s => [tx('Ô, chegou! Boa noite, boa noite!', 'Hey, you made it! Good evening, good evening!'), tx(`Você juntou ${s.moedas} moeda${N(s.moedas)}. `, `You collected ${s.moedas} coin${N(s.moedas)}. `) + (s.moedas >= 30 ? tx('Dá pra muito espeto!', "That's a lot of skewers!") : tx('Junta mais, que o ESPETÃO tá esperando.', 'Collect more, the BIG SKEWER is waiting.'))]],
    ['ACEROLITO', () => E.add(E.club('acerolito', 1.05)), 5.4, -.6, '#ffd23a',
      s => [tx('Que isso?!', "What's that?!"), tx(`Você tem ${s.conq} conquista${N(s.conq)}! Que isso?!`, `You have ${s.conq} achievement${N(s.conq)}! What's that?!`)]],
    ['EL ROSENGO', () => E.add(E.club('rosengo', 1.8)), 5.4, -2.8, '#ff8fb1',
      s => ['¡EL ROSENGO!', s.conq >= 10 ? tx('¡EL ROSENGO! (Ele aprova. Muitas conquistas.)', '¡EL ROSENGO! (He approves. Lots of achievements.)') : tx('¡EL ROSENGO...? (Ele acha que dá pra pegar mais conquistas.)', '¡EL ROSENGO...? (He thinks you can get more achievements.)')]],
    ['RATABRUMGA', () => E.add(E.club('ratabrumga', .5)), 4.8, -4.8, '#c8c8c8',
      s => [tx('(Ela olha pro seu boné.)', '(She eyes your cap.)'), s.gastas > 0 ? tx(`(Ela sabe que você gastou ${s.gastas} moedas. Índole questionável: ela queria ter roubado antes.)`, `(She knows you spent ${s.gastas} coins. Questionable character: she wishes she'd stolen them first.)`) : tx('(Você não gastou nenhuma moeda. Ela está impressionada. E com fome.)', "(You didn't spend a single coin. She's impressed. And hungry.)")]],
    ['ORELHA', () => E.add(E.club('orelha', .95)), 2.2, -6.2, '#e8b070',
      s => [tx('Au!', 'Woof!'), tx(`(Ele farejou ${s.cartazes} de 7 cartazes do Cavalo Capinha.) `, `(He sniffed out ${s.cartazes} of the 7 Cavalo Capinha posters.) `) + (s.cartazes >= 7 ? tx('Au au! (Ele acha que o Capinha tá perto.)', 'Woof woof! (He thinks Capinha is close.)') : tx('Au. (Ainda tem cartaz por aí.)', "Woof. (There are still posters out there.)"))]],
    ['TED', () => E.add(E.club('ted', 1.15)), 1.5, -4.2, '#ffd23a',
      s => [tx('Au.', 'Woof.'), tx('(O medidor de aura estoura antes de chegar perto dele. De novo.)', '(The aura meter bursts before it even gets close to him. Again.)')]],
    ['MAGO', () => E.add(E.club('mago', 1.9)), -2.2, -6.4, '#c8a0ff',
      s => [tx('Ah... você chegou ao fim, viajante.', 'Ah... you reached the end, traveler.'), s.luta ? tx(`Você enfrentou o pássaro com as goiabas. Nota ${s.luta.nota}. `, `You faced the bird with the guavas. Grade ${s.luta.nota}. `) + (s.luta.nota === 'S' ? tx('Perfeito.', 'Perfect.') : tx('Ainda dá pra melhorar o parry.', 'Your parry can still improve.')) : tx('Você nem precisou das goiabas? Curioso.', "You didn't even need the guavas? Curious.")]],
    ['MACACO', () => E.add(E.club('macaco', 1.1)), -.6, -6.8, '#e8b070',
      s => [tx('Sócio! As máquinas funcionaram?', 'Partner! Did the blasters work?'), s.luta && s.luta.tentativas === 1 ? tx('De primeira! Eu sou um gênio.', "First try! I'm a genius.") : tx('Funcionaram. Uma hora funcionaram.', 'They worked. Eventually they worked.')]],
    ['PÁSSARO DAS ESFERAS', () => E.add(E.club('passaroEsferas', 1.3)), .9, -7, '#9fd8ff',
      s => [tx('Você pediu certo.', 'You asked right.'), tx(`Minha avaliação: nota ${s.geral}. E ninguém ficou careca.`, `My assessment: grade ${s.geral}. And nobody went bald.`)]],
    ['PÁSSARO COCÔ', () => sprite(cocoCv, .9), 3.4, -6.4, '#d8a070',
      s => [tx('Boa noite, pessoal do grupo. Quer dizer... boa noite, você.', 'Good night, group chat. I mean... good night, you.'), tx(`Você jogou ${s.min} minuto${N(s.min)} sem parar. Já foi no banheiro? Não segura, hein.`, `You played ${s.min} minute${N(s.min)} straight. Have you been to the bathroom? Don't hold it in, okay.`)]],
    ['MARCÃO DA CALÇARIA', () => E.add(E.club('uperFleguis', 1.2)), -3.6, -6.2, '#ffd23a',
      s => [tx('Prossegui, meus descendentes.', 'Carry on, my descendants.'), s.geral === 'S' || s.geral === 'A' ? tx('Você honrou as uper fléguis.', 'You honored the uper fléguis.') : tx('As uper fléguis esperam mais de você.', 'The uper fléguis expect more from you.')]],
  ];
  const festa = [];
  FESTA.forEach(([nome, cria, x, z, cor, falas]) => {
    const px = x, pz = -15 + z;
    const f = cria(); f.position.set(px, 0, pz); E.circle(px, pz, .35);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.25, .24), basic({ map: E.texFrom(nomeTag(nome, cor)), transparent: true, depthWrite: false })); tag.position.set(px, nome === 'RATABRUMGA' ? .85 : nome === 'ORELHA' || nome === 'PÁSSARO COCÔ' ? 1.25 : nome === 'TED' ? 1.45 : 2.25, pz); E.add(tag); L.billboards.push(tag);
    festa.push({ f, ph: Math.random() * 6, y0: 0 });
    E.interact(E.hitbox(1, 2, 1, px, 1, pz), { label: () => S.dlg ? '' : `[E] ${nome}`, act: () => { if (S.dlg) return; C.said['f' + nome] = true; const st = stats(); E.conversa(falas(st).map(t => [nome, t, cor])); } });
  });
  // o boletim: tudo da sua partida num quadro só
  { const bT = E.canvasTex(96, 64, g => { g.fillStyle = '#241726'; g.fillRect(0, 0, 96, 64); g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.strokeRect(2, 2, 92, 60); g.fillStyle = '#ffd23a'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillText('BOLETIM', 48, 18); g.fillText('DO CLUBEX', 48, 30); g.fillStyle = '#fff'; g.font = '6px monospace'; g.fillText('a sua avaliação', 48, 46); });
    const b = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), basic({ map: bT, side: THREE.DoubleSide }))); b.position.set(-2.6, 1.6, -15 + 7.2); box(.1, 1.6, .1, ouro, -2.6, .8, -15 + 7.2, { occ: false });
    E.interact(b, { label: () => S.dlg ? '' : '[E] Boletim do Clubex', act: () => {
      if (S.dlg) return; const s = stats();
      E.conversa([
        ['BOLETIM', tx(`Tempo de jogo: ${s.min} minuto${N(s.min)}.`, `Play time: ${s.min} minute${N(s.min)}.`)],
        ['BOLETIM', tx(`Vezes que o Passarex te notou: ${s.notou}. Pistas: ${s.pistas}/3. Penas: ${s.penas}/3.`, `Times the Passarex noticed you: ${s.notou}. Clues: ${s.pistas}/3. Feathers: ${s.penas}/3.`)],
        ['BOLETIM', tx(`Moedas: ${s.moedas}. Segredos do Clubex: ${s.segredos}/12. Cartazes do Cavalo Capinha: ${s.cartazes}/7.`, `Coins: ${s.moedas}. Clubex secrets: ${s.segredos}/12. Cavalo Capinha posters: ${s.cartazes}/7.`)],
        ['BOLETIM', s.luta ? tx(`Luta: nota ${s.luta.nota}, ${s.luta.tempo} segundos, ${s.luta.tentativas} tentativa${N(s.luta.tentativas)}.`, `Fight: grade ${s.luta.nota}, ${s.luta.tempo} seconds, ${s.luta.tentativas} tr${s.luta.tentativas === 1 ? 'y' : 'ies'}.`) : tx('Luta: sem registro.', 'Fight: no record.')],
        ['BOLETIM', tx(`Conquistas: ${s.conq}. Finais vistos: ${s.finais}/3.`, `Achievements: ${s.conq}. Endings seen: ${s.finais}/3.`)],
        ['BOLETIM', tx(`NOTA GERAL: ${s.geral}. `, `OVERALL GRADE: ${s.geral}. `) + (s.geral === 'S' ? tx('Aura máxima. O Homem-Distinto já sabia.', 'Maximum aura. The Distinguished Man already knew.') : tx('Fale com cada um da festa: todo mundo tem uma opinião sobre você.', 'Talk to everyone at the party: they all have an opinion about you.')), '#ffd23a'],
      ]);
    } });
  }
  // faixa da festa e os pulinhos de todo mundo
  { const fT = E.canvasTex(128, 20, g => { g.fillStyle = '#ff5d8a'; g.fillRect(0, 0, 128, 20); g.fillStyle = '#fff'; g.font = 'bold 11px monospace'; g.textAlign = 'center'; g.fillText('FESTA NOS PORTÕES', 64, 14); });
    const fx = E.add(new THREE.Mesh(new THREE.PlaneGeometry(6, .95), basic({ map: fT, side: THREE.DoubleSide }))); fx.position.set(0, 4.6, -15 - 7.6); }
  (L._portais || (L._portais = [])).push(dt => { for (const p of festa) p.f.position.y = Math.abs(Math.sin(L.t * 3 + p.ph)) * .12; });

  // a placa dos Bacanos
  const bacT = E.canvasTex(96, 56, g => { g.fillStyle = '#fff6e0'; g.fillRect(0, 0, 96, 56); g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.strokeRect(2, 2, 92, 52); g.fillStyle = '#241726'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.fillText('OS BACANOS', 48, 16); g.font = '5px monospace'; g.fillText('turma 1025A · IFMS Campus Naviraí', 48, 26); g.fillText('músicas · curtas · @os_bacanos67', 48, 34); g.fillText('foram eles que abriram estes portões', 48, 44); });
  { const b = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), basic({ map: bacT, side: THREE.DoubleSide }))); b.position.set(-4.5, 1.6, -26.6); b.rotation.y = .4; box(.1, 1.6, .1, ouro, -4.5, .8, -26.6, { occ: false });
    E.interact(b, { label: () => S.dlg ? '' : '[E] Placa dos Bacanos', act: () => E.conversa([
      ['PLACA', 'O Clubex nasceu de verdade, numa escola: o IFMS Campus Naviraí, em 2026, com a turma 1025A, os Bacanos.'],
      ['PLACA', 'Três coisas de verdade viraram mitologia: o curta em stop motion “O Pássaro das Esferas”, o espetáculo musical da turma na FECINAV e o Instagram @os_bacanos67.'],
      ['PLACA', 'Depois vieram as músicas, os bordões, os personagens. Tudo que é cantado vira canônico. Todas as versões valem.'],
      ['PLACA', 'Este jogo foi feito pelo oDavyy, um dos Bacanos, com o Claude Code. Passarex, o Clubex e toda a lore são d’Os Bacanos.'],
    ]) }); }
  // a placa de perguntas: por que cada coisa está no jogo
  const FAQ = [['Quem é o Passarex?', 'Um personagem d’Os Bacanos: corpo de ave, rosto de gente, olhos brancos. Não fala, só assobia (fiu fiu). Ele não quer a sua alma: quer o seu susto.'], ['Por que Naviraí?', 'Os Bacanos são de Naviraí, no Mato Grosso do Sul, e estudam no IFMS de lá. Na lore, os relatos do Passarex começam nessa cidade.'], ['Por que “Registro 1367”?', 'É o Incidente 1367 do Arquivo Passarex: 67 relatos em três semanas. O 67 é o número sagrado do Clubex.'], ['O que é o Clubex?', 'A Confraria inventada pelos Bacanos: só entra quem tem aura, é maneiro, distinto e espirituoso. O Homem-Distinto guarda os portões.'], ['Por que 1491 e o Douradex?', 'No episódio “Fiu Fiu, 1491”, o Passarex mostra o caminho das Américas um ano antes de Colombo, e o Douradex confia nele: “É por ali, confia!”.'], ['Por que goiabas, Mago e Macaco?', 'Vêm do curta em stop motion “O Pássaro das Esferas”, feito pelos Bacanos: um pássaro que só concede pedidos se você pedir, e uma poção que deixou todo mundo careca.'], ['Por que a Pobresa, o IF e a praça?', 'São lugares de verdade do centro de Naviraí que a turma conhece. A conveniência virou “Pobresa”, com S, de propósito.'], ['Por que o Serjão, o Orelha, a Ratabrumga...?', 'Todos são personagens das músicas e memes do Clubex. Cada um tem a sua história no salão dos segredos, nos Portões.'], ['Por que a catedral e o sacrário?', 'O criador é católico. A catedral entrou com respeito: lá dentro o Passarex não te segue e não tem susto.'], ['Quem é a Rosinha?', 'A garrafinha de água rosa do Guilherme, um dos Bacanos. Ela quebrou. Ganhou um memorial na catedral.'], ['O jogo está pronto?', 'Ainda não: está em ALFA e recebe atualização quase todo dia. Achou um bug? Relata que a gente corrige o mais rápido possível.']];
  { const fT = E.canvasTex(64, 48, g => { g.fillStyle = '#241726'; g.fillRect(0, 0, 64, 48); g.fillStyle = '#ffd23a'; g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillText('?', 32, 24); g.font = 'bold 6px monospace'; g.fillText('TIRA-DÚVIDAS', 32, 38); });
    const fm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), basic({ map: fT, side: THREE.DoubleSide }))); fm.position.set(-7.5, 1.6, -22); fm.rotation.y = .9; box(.1, 1.6, .1, ouro, -7.5, .8, -22, { occ: false });
    E.interact(fm, { label: () => S.dlg ? '' : '[E] Tira-dúvidas', act: async () => {
      const i = await E.choice('Tira-dúvidas', FAQ.slice(0, 5).map(f => f[0]).concat(['Mais perguntas...']), 5, 20);
      let f = FAQ[i];
      if (i === 5) { const j = await E.choice('Mais perguntas', FAQ.slice(5).map(f => f[0]), 0, 20); f = FAQ[5 + j]; }
      if (f) E.conversa([['PERGUNTA', f[0]], ['RESPOSTA', f[1], '#9fe3aa']]);
    } }); }
  // a jukebox: "Portões Abertos do Clubex"
  { const jb = box(1, 1.8, .7, lam({ color: 0xc8202c }), 4.6, .9, -26.4); jb.rotation.y = -.4;
    const jt = E.canvasTex(32, 32, g => { g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(16, 14, 12, Math.PI, 0); g.fill(); g.fillStyle = '#241726'; g.font = 'bold 5px monospace'; g.textAlign = 'center'; g.fillText('♪ CLUBEX', 16, 12); g.fillStyle = '#ff8fb1'; for (let i = 0; i < 4; i++) g.fillRect(6 + i * 6, 18, 4, 10); });
    const jm = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), basic({ map: jt }))); jm.position.set(4.6 - Math.sin(.4) * .36, 1.25, -26.4 + Math.cos(.4) * .36); jm.rotation.y = -.4;
    E.interact(E.hitbox(1.2, 1.9, 1, 4.6, .95, -26.2), { label: () => '[E] Jukebox: “Portões Abertos do Clubex”', act: () => { pararHino(); E.radio && E.radio(); } }); }
  // a porta do fim
  const fimT = E.canvasTex(32, 48, g => { g.fillStyle = '#fff2c0'; g.fillRect(0, 0, 32, 48); g.fillStyle = '#e8b830'; g.fillRect(3, 3, 26, 45); g.fillStyle = '#fff8e0'; g.beginPath(); g.arc(16, 18, 9, 0, 7); g.fill(); g.fillStyle = '#241726'; g.font = 'bold 5px monospace'; g.textAlign = 'center'; g.fillText('FIM DA', 16, 34); g.fillText('FITA', 16, 41); });
  const fim = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.7), basic({ map: fimT }))); fim.position.set(0, 1.35, -27.9);
  E.interact(fim, { label: () => '[E] Fim da fita', act: () => terminar() });

  E.moedas([[0, null, 26], [0, null, 11], [6, null, -9]]);

  /* o hino: um coral sintetizado subindo (acordes lentos, vozes em "aah") */
  let hinoBus = null, acordeT = 0, acordeI = 0;
  const ACORDES = [[261.6, 329.6, 392.0], [349.2, 440.0, 523.3], [392.0, 493.9, 587.3], [261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [349.2, 440.0, 523.3], [392.0, 493.9, 587.3], [261.6, 392.0, 523.3]];
  function acorde(notas, dur) {
    const ac = E.ac(); if (!ac || !hinoBus) return;
    const t = ac.currentTime;
    for (const f of [...notas, notas[0] / 2]) for (const det of [-6, 6]) {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      const vib = ac.createOscillator(); vib.frequency.value = 5; const vg = ac.createGain(); vg.gain.value = 3; vib.connect(vg).connect(o.detune); vib.start(t); vib.stop(t + dur + .5);
      const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 1100; flt.Q.value = 2;
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.018, t + .9); g.gain.setValueAtTime(.018, t + dur - .4); g.gain.linearRampToValueAtTime(0, t + dur + .4);
      o.connect(flt).connect(g).connect(hinoBus); o.start(t); o.stop(t + dur + .5);
    }
    // um sino no começo de cada acorde
    E.tone(notas[2] * 2, 2.5, .025, 'sine', hinoBus);
  }
  function pararHino() { if (hinoBus) { hinoBus.gain.setTargetAtTime(0, E.ac().currentTime, .6); hinoBus = null; } }

  function terminar() {
    if (C.fim) return; C.fim = true;
    pararHino();
    const F = S.flags.final || 'A';
    const T = {
      A: ['FINAL A · FITA EJETADA', 'Ele quase não te notou. A fita saiu sozinha e, lá longe, alguém assobiou.'],
      B: ['FINAL B · CONEXÃO PERDIDA', 'Ele te notou demais. E agora sabe onde você mora.'],
      C: ['FINAL C · REGISTRO 1368', 'Final secreto. Todas as pistas e todas as penas, sem chamar a atenção dele. Mas alguém continua gravando.'],
      D: ['FINAL D · ELE NUNCA FOI MAU', 'Final secreto do tempo. Você voltou a 1491 e salvou o bando. Agora o fiu fiu é só um oi.'],
    }[F];
    let got = []; try { got = JSON.parse(localStorage.getItem('registro1367-finais')) || []; } catch (e) {}
    const pistas = ['recorte', 'diario', 'colorir'].filter(k => S.clues[k]).length;
    const nConq = Object.keys(E.META.conq).length;
    E.clearSave();
    E.end(`<div class="fimBox">
      <h1>■ ${T[0]}</h1>
      <p>${T[1]}</p>
      <p class="dim">Você passou pelos Portões do Clubex. O Homem-Distinto já sabia.</p>
      <div class="stats"><span>Pistas ${pistas}/3</span><span>Penas ${S.penas}/3</span><span>Ele te notou ${S.noticed}x</span><span>Segredos ${E.ovosAchados()}/${E.OVOS_TOTAL}</span><span>🪙 ${E.totalMoedas()}</span><span>🏆 ${nConq}/${E.CONQ.length}</span></div>
      <p>Finais encontrados: ${got.filter(f => f !== 'D').length}/3${got.includes('D') ? ' + ★ o final do tempo' : ''}</p>
      <p class="dim"><b>SKINS LIBERADAS</b>: troque no menu em “Skins e roupas”.</p>
      <p class="codigo">🔑 Perdeu o save? No menu, vá em <b style="font-size:1em;letter-spacing:0">CAPÍTULOS</b> → <b style="font-size:1em;letter-spacing:0">TENHO UM CÓDIGO</b> e digite <b>1367</b>. Libera tudo de novo.</p>
      ${E.promo}
      <details><summary>Créditos, bugs e tira-dúvidas</summary>
        <div style="text-align:center"><img src="${(() => { const c = document.createElement('canvas'); c.width = 240; c.height = 340; const g = c.getContext('2d'); g.translate(120, 330); g.scale(.42, .42); window.drawPassarex(g, 1.6, {}); return c.toDataURL(); })()}" alt="Passarex" style="height:120px;image-rendering:pixelated">
        <h2 style="margin:.2em 0">REGISTRO 1367 · um jogo do Arquivo Passarex</h2>
        <p><b>Feito por oDavyy e Os Bacanos</b> (turma 1025A · IFMS Campus Naviraí), com Claude Code.<br>Passarex, o Clubex e toda a lore são d’Os Bacanos. Obrigado por jogar.</p>
        <p class="dim">🚧 O jogo está em ALFA e recebe atualização quase todo dia. Achou um bug? <a href="https://github.com/odavyyy/registro-1367/issues/new?template=bug.yml" target="_blank" rel="noopener">Relate aqui</a> que a gente corrige o mais rápido possível.</p>
        </div>
        <h3 style="color:#ffd94a;font-weight:400;margin:.6em 0 .2em">Tira-dúvidas: por que cada coisa está no jogo</h3>
        ${FAQ.map(f => `<p><b>${f[0]}</b><br>${f[1]}</p>`).join('')}
      </details>
      </div>
      <div class="fimBtns"><button data-fim="1">↻ JOGAR DE NOVO <small>[R]</small></button></div>`);
  }

  L.ambience = bus => { E.loopNoise('lowpass', 500, 0, .02, bus); hinoBus = E.gain(.9, bus); };
  L.enter = () => {
    // zerou!
    E.META.zerou = true; E.salvarMeta();
    E.conquista('portoes'); E.conquista('final_' + (S.flags.final || 'a').toLowerCase());
    E.setMusic && E.setMusic(null);
    L.eye = 9; C.sobe = 1;
    E.later(1, () => E.say('(Uma música começa a tocar. Você está subindo.)', 4));
    E.later(7, () => E.toast('Os Portões do Clubex<small>alguém está esperando no portão</small>'));
  };
  L.update = dt => {
    sky.position.set(E.camera.position.x, 0, E.camera.position.z);
    if (C.sobe > 0) { C.sobe = Math.max(0, C.sobe - dt / 6); L.eye = 1.6 + C.sobe * C.sobe * 7.4;
      if (C.sobe === 0 && !C.chamou) { C.chamou = true; E.somGravado && E.somGravado('oclubex', 1.1); } }   // chegou: "O Clubex me chamou", uma vez só
    acordeT -= dt; if (acordeT <= 0 && hinoBus) { acordeT = 3.2; acorde(ACORDES[acordeI++ % ACORDES.length], 3.4); }
    for (const n of nuvens) n.position.x += Math.sin(L.t * .1 + n.position.z) * dt * .2;
    if (C.aberto && C.gate < 1) { C.gate = Math.min(1, C.gate + dt * .5); for (const p of portas) p.h.rotation.y = p.sx * C.gate * 1.6; }
    mon.rotation.y += dt * .4;
  };
  L.exit = () => pararHino();
  L.hint = () => {
    if (!C.aberto) return { text: 'Fale com o Homem-Distinto, no portão.', target: hd.position.clone().setY(1.2) };
    return { text: 'Veja os segredos do salão. Quando quiser, a porta dourada no fundo termina a fita.', target: fim.position.clone() };
  };
  L.debug = { C, abrir, terminar };
}
