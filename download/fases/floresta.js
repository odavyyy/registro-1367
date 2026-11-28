// FASE 8 · A floresta de cogumelos. Igual ao curta em stop motion: o Mago, o Macaco, o Pássaro das Esferas
// (que só concede se você pedir) e o Pássaro Cocô. Aqui se monta as máquinas de goiaba para a luta.
export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(1025);
  const Q = S.flags.centro = S.flags.centro || { st: 0, found: {} };
  E.scene.background = new THREE.Color(0x1a1230);
  E.scene.fog = new THREE.FogExp2(0x2a1a40, .05);
  E.camera.far = 90;
  L.floor = 'grass'; L.speed = 2.1; L.eye = 1.6; L.reach = 2.4;
  E.osd('▶ PLAY', 'FLORESTA DE COGUMELOS · ??:??');
  L.clock = t => (Math.floor(t * 1.3) % 5 === 0 ? '?' : '0') + '0:67';
  const { lam, basic, box } = E;
  const C = { talking: false, said: {} };
  const R = 15;
  L.walkable = (x, z) => Math.hypot(x, z) < R - .4 || (Math.abs(x) < 1.6 && z > 0 && z < R + 5) || (Q.mata >= 1 && Math.abs(x) < 1.5 && z < 0 && z > -R - 5);
  L.spawn = S.prevId === 'matagale' ? { x: 0, z: -R - 2.6, yaw: Math.PI } : { x: 0, z: R + 3.5, yaw: 0 };

  /* chão de musgo, cogumelos gigantes, vagalumes */
  const moss = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#2e4a2a'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 300, ['#26402a', '#3a5a32', '#4a6a3a', '#5a3a6a']); }, [14, 14]);
  const gr = E.add(new THREE.Mesh(new THREE.CircleGeometry(R + 12, 20), lam({ map: moss }))); gr.rotation.x = -Math.PI / 2;
  const trail = E.add(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 8), lam({ color: 0x6a5238 }))); trail.rotation.x = -Math.PI / 2; trail.position.set(0, .04, R + 1.5);
  E.add(new THREE.HemisphereLight(0x9a8ad8, 0x1a2a1a, 1.6));
  const moon = E.add(new THREE.DirectionalLight(0xc8c0ff, .7)); moon.position.set(-10, 20, -6);
  const capT = (c1, c2) => E.canvasTex(32, 16, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc((i * 11) % 30 + 1, (i * 7) % 12 + 2, 1.6 + (i % 3) * .6, 0, 7); g.fill(); } }, [3, 1]);
  const caps = [capT('#c8302c', '#fff2e6'), capT('#8a4ab0', '#f2c8ff'), capT('#e88a2a', '#fff6d0'), capT('#3a8ac8', '#d8f0ff')];
  const stemM = lam({ color: 0xece2c8 });
  function cogumelo(x, z, s, k) {
    const st = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.25 * s, .35 * s, 2 * s, 7), stemM)); st.position.set(x, s, z);
    const cap = E.add(new THREE.Mesh(new THREE.SphereGeometry(1.2 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ map: caps[k % 4], side: THREE.DoubleSide }))); cap.position.set(x, 2 * s - .1 * s, z); cap.scale.y = .7;
    if (s > .6) E.circle(x, z, .4 * s);
    return cap;
  }
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + rnd() * .2, r = R + 1 + rnd() * 7; if (Math.abs(Math.sin(a)) < .25) continue; cogumelo(Math.sin(a) * r, Math.cos(a) * r, 1.6 + rnd() * 2.2, i); }
  for (let i = 0; i < 9; i++) { const a = rnd() * 6.28, r = 5 + rnd() * 8; cogumelo(Math.sin(a) * r, Math.cos(a) * r, .35 + rnd() * .5, i); }
  // o fim da floresta: antes da revelação é só mato fechado; depois vira o corredor de cogumelos até Matagalé
  const tampa = E.add(new THREE.Group()), corredor = E.add(new THREE.Group());
  { const folha = lam({ color: 0x1e3a22 });
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + (i % 3) * .3, 0), folha); m.position.set(-2.4 + (i % 5) * 1.2, .7 + (i > 4 ? 1.1 : 0), -R - .6 - (i > 4 ? .5 : 0)); tampa.add(m); }
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const alt = 2.4 + (i % 2) * .7, z = -R + .2 - i * 1.25;
      const st = new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, alt, 6), stemM); st.position.set(s * 1.95, alt / 2, z); corredor.add(st);
      const cp = new THREE.Mesh(new THREE.SphereGeometry(.85, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: i % 2 ? 0x3a8a4a : 0x6ab04a, side: THREE.DoubleSide })); cp.position.set(s * 1.95, alt, z); cp.scale.y = .6; corredor.add(cp); } }
  let abriu = false;
  const abreCorredor = () => {
    const on = Q.mata >= 1; tampa.visible = !on; corredor.visible = on;
    if (on && !abriu) { abriu = true; E.portal(0, -R - 4.9, 0, 'MATAGALÉ →', '#9aff7a'); }
  };
  E.trigger(p => Q.mata >= 1 && p.z < -R - 4.2, () => { E.goTo('matagale'); });
  const glowM = basic({ color: 0x9affd8 });
  const glows = [];
  for (let i = 0; i < 30; i++) { const a = rnd() * 6.28, r = 2 + rnd() * 12; const m = E.add(new THREE.Mesh(new THREE.SphereGeometry(.06 + rnd() * .05, 5, 4), glowM)); m.position.set(Math.sin(a) * r, .1, Math.cos(a) * r); }
  const flyM = basic({ color: 0xfff0a0, fog: false });
  for (let i = 0; i < 24; i++) { const m = E.add(new THREE.Mesh(new THREE.SphereGeometry(.035, 4, 3), flyM)); m.userData.p = [rnd() * 6.28, rnd() * 10, .5 + rnd() * 2.5]; glows.push(m); }
  const pl = E.add(new THREE.PointLight(0x9affd8, 14, 12, 1.5)); pl.position.set(0, 2, -2);

  /* o cantinho do Mago: caldeirão, a poção de calvície e o aviso do Goblin */
  const caul = E.add(new THREE.Mesh(new THREE.SphereGeometry(.55, 10, 6, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 1.7), lam({ color: 0x2a2a2e, side: THREE.DoubleSide }))); caul.position.set(-3.4, .5, -4);
  const brew = E.add(new THREE.Mesh(new THREE.CircleGeometry(.48, 12), basic({ color: 0x7aff8a }))); brew.rotation.x = -Math.PI / 2; brew.position.set(-3.4, .72, -4);
  const fire = E.add(new THREE.PointLight(0x7aff8a, 6, 4, 1.6)); fire.position.set(-3.4, 1.2, -4); E.circle(-3.4, -4, .6);
  const bottle = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, .3, 8), basic({ color: 0xc89aff, transparent: true, opacity: .85 }))); bottle.position.set(-2.4, .15, -4.7);
  E.interact(E.hitbox(.4, .5, .4, -2.4, .25, -4.7), { label: () => '[E] Frasco: “POÇÃO DE CALVÍCIE”', act: () => E.conversa([['MACARO?', ''], ['MACACO', 'Não! Essa aí não! Da última vez que alguém bebeu, ficou todo mundo careca. Até o pássaro!'], ['VOCÊ', '(Melhor deixar quieto.)']].slice(1)) });
  const goblinT = E.canvasTex(48, 40, g => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, 48, 40); g.fillStyle = '#5a2a1a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('AVISO', 24, 9); g.font = '5px monospace'; g.fillText('TAXA DE COGUMELO:', 24, 18); g.fillText('3 GOIABAS', 24, 25); g.fillText('— Goblin dos Impostos', 24, 34); });
  { const post = box(.08, 1.4, .08, lam({ color: 0x5a3a22 }), 5.6, .7, -6, { occ: false }); const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.9, .75), basic({ map: goblinT, side: THREE.DoubleSide }))); s.position.set(5.6, 1.45, -6); s.rotation.y = -.5;
    E.interact(E.hitbox(1, .8, .3, 5.6, 1.45, -6), { label: () => '[E] Placa', act: () => E.conversa([['PLACA', '“Taxa de cogumelo: 3 goiabas. Assinado: Goblin dos Impostos.”'], ['MAGO', 'Ignora. Ele só existe no filme. Pelo menos é o que a gente fala pra ele.']]) }); }
  // o cartaz do curta
  { const posterT = E.canvasTex(48, 64, g => { g.fillStyle = '#2a1a3a'; g.fillRect(0, 0, 48, 64); g.fillStyle = '#ffd23a'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('O PÁSSARO', 24, 10); g.fillText('DAS ESFERAS', 24, 17); g.fillStyle = '#e8d8ff'; g.font = '4px monospace'; g.fillText('um filme em stop motion', 24, 56); g.fillText('3º Prêmio Capivara', 24, 61); });
    const pst = E.add(E.quadro('passaroEsferas', 1, 1.3, '#2a1a3a', 'O PÁSSARO DAS ESFERAS')); pst.position.set(-6.4, 1.6, -9.2); pst.rotation.y = .6;
    box(.08, 1.6, .08, lam({ color: 0x5a3a22 }), -6.4, .8, -9.25, { occ: false });
    E.interact(pst, { label: () => '[E] Cartaz', act: () => E.conversa([['CARTAZ', '“O Pássaro das Esferas” — um curta em stop motion, feito quadro por quadro por estudantes de Naviraí. Premiado no 3º Prêmio Capivara.'], ['MAGO', 'Esse sou eu. E o Macaco. E aquele pássaro ali. No fim todo mundo ficou careca. Tem uma lição nisso.'], ['MACACO', 'A lição é: não pede besteira.']]) }); }

  /* o elenco */
  const mago = E.add(E.club('mago', 1.95)); mago.position.set(-2.2, 0, -5.2);
  const macaco = E.add(E.club('macaco', 1.05)); macaco.position.set(-.6, 0, -4.4);
  const esferas = E.add(E.club('passaroEsferas', 1.3)); esferas.position.set(3.4, 0, -6);
  // Pássaro Cocô (ave marrom redondinha, cara de grupo da família às 23h)
  const coco = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 72; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(32, 69, 18, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#e0a040'; g.fillRect(24, 58, 3, 10); g.fillRect(37, 58, 3, 10);
    g.fillStyle = '#7a4a24'; g.beginPath(); g.ellipse(32, 40, 22, 22, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(32, 18, 9, 7, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(36, 10, 5, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#a8703a'; g.beginPath(); g.ellipse(32, 46, 13, 12, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(25, 32, 6, 0, 7); g.arc(39, 32, 6, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(26, 33, 2.4, 0, 7); g.arc(38, 33, 2.4, 0, 7); g.fill();
    g.fillStyle = '#f0b040'; g.beginPath(); g.moveTo(28, 39); g.lineTo(36, 39); g.lineTo(32, 45); g.fill();
    const grp = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(.75, .84), basic({ map: E.texFrom(c), transparent: true, alphaTest: .5 })); m.position.y = .42; grp.add(m); L.billboards.push(grp);
    return E.add(grp); })();
  coco.position.set(5.6, 0, -3);
  for (const n of [mago, macaco, esferas, coco]) E.circle(n.position.x, n.position.z, .35);
  const talkBox = (n, label, fn) => E.interact(E.hitbox(.9, 1.8, .9, n.position.x, 1, n.position.z), { label: () => C.talking || S.dlg ? '' : '[E] ' + label, act: () => { if (!C.talking && !S.dlg) { C.talking = true; Promise.resolve(fn()).finally(() => { C.talking = false; }); } } });
  const voz = id => { if (id) E.voice(id, '', 'x'); };
  const M = '#c8a0ff', K = '#e8b070', PE = '#9fd8ff', PC = '#d8a070';
  // depois das goiabas: o sequestro. A luta final só abre depois de resgatar o Serjão e devolver o boné
  const precisaMata = () => Q.armas && (Q.st || 0) < 2;
  async function sequestro() {
    if (!Q.mata) {
      await E.conversa([
        ['MAGO', 'Espera. Não vai ainda. As esferas do Pássaro acabaram de ficar pretas.', M],
        ['MACACO', 'Chefe... deu ruim. Deu muito ruim.', K],
        ['MAGO', 'O Passarex sequestrou o Serjão dos Espetos.', M],
        ['VOCÊ', 'O Serjão? O do espeto?'],
        ['MACACO', 'Pegou o homem no meio da brasa. E ninguém tinha nem pedido nada!', K],
        ['MAGO', 'Se você for pra praça agora, ele some com o Serjão pra sempre. Primeiro o resgate. A luta fica pra depois.', M],
        ['MAGO', 'Procure Matagalé, em Acerolândia, onde moram os Acerolitos. Alguém lá viu pra onde ele foi.', M],
        ['MACACO', 'Abrimos o mato no fim da floresta. É só atravessar o corredor. E leva as máquinas!', K],
      ]);
      Q.mata = 1; E.save(); abreCorredor(); E.noiseHit(.8, .35, 700); L.glitchT = .4;
      E.toast('Matagalé<small>o corredor no fim da floresta · [H] dica</small>');
      return;
    }
    return E.conversa([['MAGO', Q.mata >= 5 ? 'Você trouxe ele de volta. Agora devolva o boné pro dono, lá em Matagalé.' : 'O Serjão está esperando. Matagalé fica no fim da floresta, pelo corredor.', M]]);
  }
  talkBox(mago, 'Falar com o Mago', async () => {
    if (precisaMata()) return sequestro();
    if (Q.st === 0) return E.conversa([['MAGO', 'Ainda não é hora, viajante.', M], ['MAGO', 'O pássaro de Naviraí ainda está escondido pela cidade: na praça, na Pobresa e no IF. Ache ele primeiro.', M]]);
    if (Q.armas) return E.conversa([['MAGO', 'Vá até o centro da praça. E lembre: pena rosa dá pra rebater no ar.', M]]);
    if (Q.doces && Q.azedas) return E.conversa([['MAGO', 'As duas goiabas! Entregue ao Macaco. Ele monta as máquinas.', M]]);
    if (!Q.plano) {
      await E.conversa([
        ['MAGO', 'Ah... você veio. Eu sou o Mago. Esse aqui é o Macaco, meu assistente.', M],
        ['MACACO', 'Assistente não! Sócio.', K],
        ['MAGO', 'A gente veio de um filme feito à mão, quadro por quadro, por uns estudantes daqui de Naviraí. Ganhou prêmio, viu?', M],
        ['MAGO', 'Aquele pássaro com as esferas concede pedidos. Mas só se você pedir. Essa é a regra. Sempre foi.', M],
        ['MAGO', 'Agora o Passarex acordou de vez. Pousou na torre da catedral. Ele não quer sua alma, sabe? Quer o seu susto. Se alimenta do “que isso?”.', M],
        ['VOCÊ', 'E como a gente para ele?'],
        ['MAGO', 'Com goiaba. Duas máquinas de atirar goiaba: uma doce, que atira rápido, e uma azeda, que bate forte.', M],
      ]);
      Q.plano = true; E.save(); voz('m_goiabas');
      await E.conversa([['MAGO', 'Traga as goiabas doces e as azedas. O resto, o Macaco monta.', M]]);
      E.toast('Missão das goiabas<small>doces: Pássaro das Esferas · azedas: Pássaro Cocô</small>');
      return;
    }
    return E.conversa([['MAGO', `Ainda falta${Q.doces ? '' : ' a doce'}${!Q.doces && !Q.azedas ? ' e' : ''}${Q.azedas ? '' : ' a azeda'}. As doces estão com o Pássaro das Esferas; as azedas, com o Pássaro Cocô.`, M]]);
  });
  talkBox(macaco, 'Falar com o Macaco', async () => {
    if (precisaMata()) return sequestro();
    if (!Q.plano) return E.conversa([['MACACO', 'Fala com o Mago primeiro, chefe. Ele gosta de explicar as coisas.', K]]);
    if (Q.armas) return E.conversa([['MACACO', 'Doce no [Q], azeda no [Q] de novo. E se encher as cartas... SUPER GOIABADA! Eu que inventei.', K]]);
    if (!(Q.doces && Q.azedas)) return E.conversa([['MACACO', 'Sem goiaba não tem máquina! Uma doce e uma azeda.', K]]);
    voz('k_oi');
    await E.conversa([['MACACO', 'Ô, chegou com as goiabas! Segura aí.', K]]);
    for (let k = 0; k < 6; k++) E.later(k * .3, () => { E.noiseHit(.08, .25, 1800, null, 'highpass'); E.tone(180, .06, .06, 'square'); });
    await E.conversa([['MACACO', 'Aperta aqui... solda ali... um pouquinho de mágica do Mago...', K], ['MAGO', '*faz um gesto misterioso com as mãos*', M]]);
    E.sfx.chime(); L.glitchT = .2; voz('k_monta');
    await E.conversa([['MACACO', 'Pronto, chefe! Duas máquinas: uma doce, uma azeda.', K], ['MAGO', 'A doce atira rápido. A azeda bate forte. Pena rosa você rebate pulando de novo em cima. E se encher as cartas, solta o especial.', M], ['MAGO', 'Guarde bem. Essas máquinas vão com você até o fim.', M]]);
    Q.armas = true; E.save();
    E.toast('Arma especial: máquinas de goiaba<small>ela é sua daqui pra frente · fale com o Mago</small>');
  });
  // o pedido sendo concedido: as esferas acendem, um anel de luz abre, faíscas sobem em espiral e voam até você, e a goiaba aparece
  function concede() {
    E.somGravado && E.somGravado('passaro', 1.1);   // "PÁSSARO!" toda vez que ele concede um pedido
    return new Promise(res => {
      const mb = o => new THREE.MeshBasicMaterial(Object.assign({ fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }, o));
      const grp = new THREE.Group(); grp.position.copy(esferas.position); E.add(grp);
      const brilho = document.createElement('canvas'); brilho.width = brilho.height = 64; { const g = brilho.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#ffffff'); r.addColorStop(.3, '#9fd8ff'); r.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
      const bT = new THREE.CanvasTexture(brilho);
      const esf = [-.42, .42].map(dx => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), mb({ map: bT })); m.position.set(dx, .75, .25); grp.add(m); return m; });
      const anel = new THREE.Mesh(new THREE.RingGeometry(.2, .32, 32), mb({ color: 0x9fd8ff, side: THREE.DoubleSide })); anel.rotation.x = -Math.PI / 2; anel.position.y = .05; grp.add(anel);
      const coluna = new THREE.Mesh(new THREE.CylinderGeometry(.6, .9, 6, 16, 1, true), mb({ color: 0x9fd8ff, opacity: 0, side: THREE.DoubleSide })); coluna.position.y = 3; grp.add(coluna);
      const luz = new THREE.PointLight(0x9fd8ff, 0, 10, 1.4); luz.position.y = 1.2; grp.add(luz);
      const fa = []; for (let k = 0; k < 28; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .12), mb({ map: bT })); m.userData = { a: k / 28 * 6.28, r: .3 + Math.random() * .4, y: Math.random() * .4, v: 1 + Math.random() }; grp.add(m); fa.push(m); }
      const goiT = document.createElement('canvas'); goiT.width = goiT.height = 32; { const g = goiT.getContext('2d'); g.fillStyle = '#7ac83a'; g.beginPath(); g.ellipse(16, 18, 11, 12, 0, 0, 7); g.fill(); g.fillStyle = '#ff8fb1'; g.beginPath(); g.ellipse(16, 18, 6, 7, 0, 0, 7); g.fill(); g.fillStyle = '#4a7a2a'; g.fillRect(15, 3, 2, 5); }
      const goi = new THREE.Mesh(new THREE.PlaneGeometry(.45, .45), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(goiT), transparent: true, fog: false })); goi.visible = false; E.add(goi); L.billboards.push(goi);
      [784, 988, 1175, 1568].forEach((fq, k) => E.tone(fq, 1.2, .045, 'triangle', null, k * .18));
      E.noiseHit(2.4, .05, 5000, null, 'highpass');
      let t = 0; const cam = E.camera.position;
      (L._anims || (L._anims = [])).push(dt => {
        t += dt;
        const sobe = Math.min(1, t / .8), some = t > 2.6 ? Math.max(0, 1 - (t - 2.6) / .6) : 1;
        esf.forEach((m, i) => { const k = (1 + Math.sin(t * 9 + i * 3) * .25) * (.6 + sobe * 1.4) * some; m.scale.setScalar(k); m.lookAt(cam); m.material.opacity = some; });
        anel.scale.setScalar(1 + t * 7); anel.material.opacity = Math.max(0, 1 - t / 1.4);
        coluna.material.opacity = .25 * sobe * some; coluna.rotation.y += dt * 2;
        luz.intensity = 14 * sobe * some + Math.sin(t * 20) * 2 * some;
        for (const m of fa) {
          const u = m.userData;
          if (t < 1.8) { u.a += dt * (3 + u.v); u.y += dt * u.v * 1.1; m.position.set(Math.cos(u.a) * u.r * (1 + u.y * .3), u.y, Math.sin(u.a) * u.r * (1 + u.y * .3)); }
          else { const alvo = grp.worldToLocal(cam.clone()).multiplyScalar(.55); m.position.lerp(alvo.setY(alvo.y - .2), Math.min(1, dt * 3)); }
          m.lookAt(cam); m.material.opacity = some * (t > 1.8 ? Math.max(0, 1 - (t - 1.8) / 1.1) : 1);
        }
        if (t > 1.9 && !goi.visible) { goi.visible = true; E.sfx.chime(); }
        if (goi.visible) { const k = Math.min(1, (t - 1.9) / .8); goi.position.lerpVectors(esferas.position.clone().setY(1.2), cam.clone().setY(cam.y - .25), k * .8); goi.material.opacity = some; goi.scale.setScalar(.6 + Math.sin(t * 8) * .08 + k * .5); }
        if (t > 3.3) { grp.removeFromParent(); goi.removeFromParent(); res(); return false; }
      });
    });
  }
  talkBox(esferas, 'Falar com o Pássaro das Esferas', async () => {
    if (Q.st >= 3) return tempoQuest();   // o segredo: depois da luta, ele tem uma coisa grande pra conceder
    if (!Q.plano) return E.conversa([['PÁSSARO DAS ESFERAS', '...', PE], ['VOCÊ', '(Ele te olha. As duas esferas brilham. Não diz nada.)']]);
    if (Q.doces) return E.conversa([['PÁSSARO DAS ESFERAS', 'Já concedi. E não peça careca.', PE]]);
    voz('pe_pedido');
    await E.conversa([['PÁSSARO DAS ESFERAS', 'Eu concedo pedidos.', PE], ['PÁSSARO DAS ESFERAS', 'Mas só se você pedir.', PE]]);
    const i = await E.choice('O que você faz?', ['Pedir as goiabas doces', 'Ficar quieto'], 1, 12);
    if (i === 0) { await E.conversa([['VOCÊ', 'Eu peço... as goiabas doces.']]); await concede(); voz('pe_doces'); await E.conversa([['PÁSSARO DAS ESFERAS', 'Pedido concedido. Goiabas doces.', PE], ['PÁSSARO DAS ESFERAS', 'Da última vez pediram uma poção e todo mundo ficou careca. Você pediu certo.', PE]]); Q.doces = true; E.save(); E.toast('Goiabas doces<small>' + (Q.azedas ? 'leve pro Macaco' : 'falta a azeda') + '</small>'); }
    else await E.conversa([['VOCÊ', '(Você não pediu. Ele não concedeu. Funciona assim.)']]);
  });
  talkBox(coco, 'Falar com o Pássaro Cocô', async () => {
    if (Q.azedas) return E.conversa([['PÁSSARO COCÔ', 'Bom descanso. E não segura o cocô.', PC]]);
    if (Q.refri) { voz('pc_valeu'); await E.conversa([['PÁSSARO COCÔ', 'Geladinho! Toma as azedas. E não segura o cocô.', PC]]); Q.azedas = true; Q.refri = false; E.save(); E.sfx.chime(); E.toast('Goiabas azedas<small>' + (Q.doces ? 'leve pro Macaco' : 'falta a doce') + '</small>'); return; }
    voz('pc_coco');
    await E.conversa([['PÁSSARO COCÔ', 'Boa noite, pessoal do grupo. Quer dizer... boa noite, você.', PC], ['PÁSSARO COCÔ', 'Antes de todo mundo ir dormir, uma pergunta muito importante: você já fez cocô hoje?', PC]]);
    const i = await E.choice('Já fez cocô hoje?', ['Já', 'Ainda não'], 1, 10);
    await E.conversa([['PÁSSARO COCÔ', i === 0 ? 'Muito bem. Orgulho da família.' : 'Não segura, hein. Faz mal.', PC]]);
    if (!Q.plano) return;
    voz('pc_troca');
    await E.conversa([['PÁSSARO COCÔ', 'Eu fico acordado até tarde mandando mensagem no grupo. Dá uma sede...', PC], ['PÁSSARO COCÔ', 'Troco minhas goiabas azedas por um refri gelado da Pobresa.', PC]]);
    Q.pediuRefri = true; E.save(); E.toast('Um refri gelado<small>nas geladeiras da Pobresa, no centro</small>');
  });

  /* o ser da bolha: um bichinho verde de olhos enormes que mora dentro de uma bolha de sabão e só fala "zuprum" */
  const bolhaCv = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 104; const g = c.getContext('2d');
    // a bolha (fundo bem transparente com borda furta-cor)
    const fundo = g.createRadialGradient(44, 40, 6, 48, 48, 46); fundo.addColorStop(0, 'rgba(200,240,255,.10)'); fundo.addColorStop(.85, 'rgba(160,210,255,.16)'); fundo.addColorStop(1, 'rgba(255,255,255,.32)');
    g.fillStyle = fundo; g.beginPath(); g.arc(48, 48, 46, 0, 7); g.fill();
    // águas-vivas azuis dos lados (tipo asas transparentes)
    g.fillStyle = 'rgba(120,190,255,.55)';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(48 + s * 24, 60, 13, 17, s * .5, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.fillRect(48 + s * (16 + i * 5), 72, 2, 9 + (i % 2) * 5); } }
    // corpo enrugado
    g.fillStyle = '#6a7a34'; g.beginPath(); g.ellipse(48, 72, 14, 18, 0, 0, 7); g.fill();
    g.strokeStyle = '#4e5a24'; g.lineWidth = 1; for (let y = 62; y < 88; y += 4) { g.beginPath(); g.moveTo(38, y); g.quadraticCurveTo(48, y + 2, 58, y); g.stroke(); }
    // perninhas e bracinhos finos
    g.fillStyle = '#5a6a2c'; g.fillRect(40, 86, 3, 12); g.fillRect(53, 86, 3, 12); g.fillRect(30, 70, 9, 3); g.fillRect(57, 70, 9, 3);
    // cabeção
    g.fillStyle = '#8a9a44'; g.beginPath(); g.ellipse(48, 42, 25, 22, 0, 0, 7); g.fill();
    g.fillStyle = '#a2b05a'; g.beginPath(); g.ellipse(46, 32, 14, 8, 0, 0, 7); g.fill();
    // olhos enormes, escuros e brilhantes
    for (const x of [37, 59]) { g.fillStyle = '#e8d8a0'; g.beginPath(); g.arc(x, 44, 9.5, 0, 7); g.fill(); g.fillStyle = '#3a1410'; g.beginPath(); g.arc(x, 44, 8, 0, 7); g.fill(); g.fillStyle = '#8a2a1a'; g.beginPath(); g.arc(x + 1, 46, 4, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 3, 40, 2.4, 0, 7); g.fill(); g.fillRect(x + 3, 47, 1, 1); }
    g.fillStyle = '#4e5a24'; g.fillRect(44, 55, 8, 1.5);
    // brilho e borda furta-cor da bolha por cima
    for (const [cor, r] of [['rgba(255,140,220,.55)', 45], ['rgba(120,230,255,.6)', 44], ['rgba(255,240,140,.45)', 43]]) { g.strokeStyle = cor; g.lineWidth = 1.4; g.beginPath(); g.arc(48, 48, r, 0, 7); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(26, 22, 9, 4, -.7, 0, 7); g.fill(); g.beginPath(); g.arc(70, 76, 2.5, 0, 7); g.fill();
    return c; })();
  const bolha = new THREE.Group();
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.25), basic({ map: E.texFrom(bolhaCv), transparent: true, depthWrite: false })); bolha.add(m); L.billboards.push(bolha); E.add(bolha); }
  const BX = -7.2, BZ = 3.4; bolha.position.set(BX, 1.4, BZ); E.circle(BX, BZ, .45);
  const ZB = '#9fe8c8';
  const zuprumSom = () => {   // a "voz" dele: borbulhas que sobem e descem
    [[520, 780], [700, 460], [430, 900], [880, 520], [600, 1100], [980, 640], [520, 1300]].forEach(([a, b], i) => E.tone(a, .11, .035, 'sine', null, i * .13, 0, b));
    E.tone(1600, .05, .02, 'triangle', null, .95, 0, 2400);
  };
  const FALAS_Z = [['Zuprum zuprum carambufa bibilulú.'], ['Bibilulú?', 'Carambufa. Zuprum.'], ['Zuprum zuprum... carambufa bibilulú!']];
  let zN = 0;
  talkBox(bolha, 'Falar com o ser da bolha', async () => {
    zuprumSom();
    const f = FALAS_Z[zN % FALAS_Z.length]; zN++;
    await E.conversa(f.map(t => ['???', t, ZB]).concat([['VOCÊ', zN === 1 ? '(Ele mora dentro de uma bolha. Ninguém sabe de onde ele veio. Nem ele.)' : '(Você não entendeu nada. Mas ele parece muito satisfeito.)']]));
    E.conquista && E.conquista('zuprum');
  });
  bolha.userData.tick = t => { bolha.position.y = 1.4 + Math.sin(t * 1.3) * .14; bolha.position.x = BX + Math.sin(t * .4) * .1; };

  /* ---------- O SEGREDO DO TEMPO (só depois da luta) ----------
     Em vez de levar o café, volte pela trilha. O Pássaro das Esferas conta que o Passarex não nasceu assim,
     pede as 3 luzes que caíram das esferas e, se você pedir certo, concede uma máquina do tempo pra 1491. */
  const luzT = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff'); r.addColorStop(.3, '#d8b0ff'); r.addColorStop(1, 'rgba(140,80,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return E.texFrom(c); })();
  const LUZES = [['a', -11.2, -5.8], ['b', 10.6, 7.4], ['c', 1.8, -12.8]];
  const luzes = LUZES.map(([id, x, z]) => { const m = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), new THREE.MeshBasicMaterial({ map: luzT, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }))); m.position.set(x, .7, z); m.visible = false; m.userData.id = id; L.billboards.push(m); return m; });
  const luzAch = () => LUZES.filter(([id]) => Q.luzes && Q.luzes[id]).length;
  const mostraLuzes = () => luzes.forEach(m => { m.visible = Q.tempo === 1 && !(Q.luzes && Q.luzes[m.userData.id]); });
  // a máquina do tempo: um armário de madeira com um relógio na porta e dois anéis de latão girando
  const maquina = new THREE.Group(); maquina.position.set(-4.6, 0, -10.2); maquina.visible = false; E.add(maquina);
  const aneis = [];
  { const madeira = lam({ color: 0x6a4428 }), latao = lam({ color: 0xd8b040, emissive: 0x3a2a08 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.5, 1.1), madeira); cab.position.y = 1.25; maquina.add(cab);
    const relT = E.canvasTex(32, 32, g => { g.fillStyle = '#f2e6cc'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.strokeStyle = '#3a2418'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#3a2418'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(16 + Math.cos(a) * 12 - 1, 16 + Math.sin(a) * 12 - 1, 2, 2); } g.fillRect(15, 6, 2, 10); g.fillRect(15, 15, 8, 2); g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillStyle = '#c8302c'; g.fillText('1491', 16, 25); });
    const rel = new THREE.Mesh(new THREE.CircleGeometry(.45, 18), basic({ map: relT })); rel.position.set(0, 1.75, .56); maquina.add(rel);
    const porta = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.1), basic({ color: 0x8a5cff })); porta.position.set(0, .75, .56); maquina.add(porta);
    for (const [r, inc] of [[1.05, .4], [1.25, -.6]]) { const a = new THREE.Mesh(new THREE.TorusGeometry(r, .05, 6, 28), latao); a.position.y = 1.3; a.rotation.x = inc; maquina.add(a); aneis.push(a); }
    const luzM = new THREE.PointLight(0xa070ff, 5, 6, 1.5); luzM.position.set(0, 1.4, 1); maquina.add(luzM);
  }
  const mostraMaquina = () => { maquina.visible = Q.tempo === 2; };
  E.circle(-4.6, -10.2, .8);
  E.interact(E.hitbox(1.4, 2.5, 1.4, -4.6, 1.25, -10.2), {
    label: () => maquina.visible && !S.dlg ? '[E] Máquina do tempo' : '',
    act: async () => {
      if (!maquina.visible || S.dlg) return;
      const i = await E.choice('Viajar para 1491?', ['Sim', 'Ainda não'], 1, 10);
      if (i !== 0) return;
      E.noiseHit(.8, .5, 600); L.glitchT = 1.2; E.glitchText('1491', 1);
      E.later(1, () => E.goTo('ilha'));
    },
  });
  async function tempoQuest() {
    Q.luzes = Q.luzes || {};
    if (Q.tempo === 2) return E.conversa([['PÁSSARO DAS ESFERAS', 'A máquina está ali, entre os cogumelos. Ela só vai pra um lugar.', PE], ['PÁSSARO DAS ESFERAS', 'Não deixe ninguém machucar eles.', PE]]);
    if (Q.tempo === 1 && luzAch() < 3) return E.conversa([['PÁSSARO DAS ESFERAS', `Ainda faltam ${3 - luzAch()}. As luzes gostam de se esconder perto da beirada.`, PE]]);
    if (!Q.tempo) {
      await E.conversa([
        ['PÁSSARO DAS ESFERAS', 'Você voltou. E a cidade está pegando fogo.', PE],
        ['PÁSSARO DAS ESFERAS', 'Ele não nasceu assim, sabia? Ninguém nasce assobiando no escuro pra assustar os outros.', PE],
        ['PÁSSARO DAS ESFERAS', 'Em 1491, alguém chegou na ilha dele. E não foi pra conhecer.', PE],
        ['PÁSSARO DAS ESFERAS', 'Eu posso conceder uma coisa muito grande. Mas minhas esferas perderam o brilho: três luzes caíram pela floresta.', PE],
        ['VOCÊ', '(Três luzinhas roxas. Devem estar escondidas entre os cogumelos.)'],
      ]);
      Q.tempo = 1; E.save(); mostraLuzes();
      return;
    }
    // as três luzes de volta: agora é só pedir (certo)
    await E.conversa([['PÁSSARO DAS ESFERAS', 'As três! As esferas estão brilhando de novo.', PE], ['PÁSSARO DAS ESFERAS', 'Eu concedo pedidos. Mas só se você pedir.', PE]]);
    const i = await E.choice('O que você pede?', ['Mais goiabas', 'Uma máquina do tempo', 'Não pedir nada'], 2, 12);
    if (i === 0) return E.conversa([['VOCÊ', 'Eu peço... mais goiabas.'], ['PÁSSARO DAS ESFERAS', 'Pedido concedido.', PE], ['VOCÊ', '(Caíram três goiabas na sua cabeça. Não era bem isso.)']]);
    if (i !== 1) return E.conversa([['VOCÊ', '(Você não pediu. Ele não concedeu. Funciona assim.)']]);
    await E.conversa([['VOCÊ', 'Eu peço... uma máquina do tempo.']]);
    await concede();
    Q.tempo = 2; E.save(); mostraMaquina(); E.noiseHit(.6, .4, 500); E.sfx.chime();
    await E.conversa([['PÁSSARO DAS ESFERAS', 'Pedido concedido. Uma máquina do tempo.', PE], ['PÁSSARO DAS ESFERAS', 'Ela só vai pra um lugar: a ilha dele, em 1491. Não deixe ninguém machucar eles.', PE]]);
  }
  mostraLuzes(); mostraMaquina(); abreCorredor();

  E.cartazCapinha('f1', -2.2, R + .8, 0);
  /* a trilha de volta pro centro */
  const arch = E.canvasTex(48, 16, g => { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 48, 16); g.fillStyle = '#ffe9a8'; g.font = 'bold 6px monospace'; g.textAlign = 'center'; g.fillText('← CENTRO', 24, 10); });
  { const s = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.6, .55), basic({ map: arch, side: THREE.DoubleSide }))); s.position.set(1.8, 1.7, R + 2); box(.08, 1.7, .08, lam({ color: 0x5a3a22 }), 1.8, .85, R + 2.02, { occ: false }); }
  E.portal(0, R + 4.9, Math.PI, '← VOLTAR PRO CENTRO', '#ffd23a');
  E.trigger(p => p.z > R + 4.4, () => { E.goTo('centro'); });

  E.moedas([[0, null, 10], [-8, null, -1], [0, null, -9], [6, null, -9.5]]);

  L.ambience = bus => { E.loopNoise('bandpass', 5200, 9, .012, bus); E.loopNoise('lowpass', 240, 0, .03, bus); };
  L.enter = () => {
    E.later(1, () => E.toast('Floresta de cogumelos<small>o Mago e o Macaco moram aqui · [H] dica</small>'));
    if (precisaMata() && !Q.mata) E.later(3, () => E.say('(O Mago está me chamando. Ele parece preocupado.)', 4));
    if (Q.st >= 1 && !Q.plano) E.later(3, () => E.say('(Uma luzinha verde perto do caldeirão. Alguém está mexendo uma poção.)', 4));
    if (Q.st >= 3 && !Q.tempo) E.later(3, () => E.say('(A floresta está quieta. Só as esferas do Pássaro ainda brilham.)', 4));
  };
  L.update = dt => {
    const t = L.t;
    for (const m of glows) { const [a, h, r] = m.userData.p; m.position.set(Math.sin(a + t * .3) * (3 + h), r + Math.sin(t * 2 + a) * .3, Math.cos(a * 1.3 + t * .25) * (3 + h)); }
    bolha.userData.tick(t);
    if (Q.tempo === 1) { const p = E.player.pos; for (const m of luzes) { if (!m.visible) continue; m.position.y = .7 + Math.sin(t * 2 + m.position.x) * .15; if (Math.hypot(p.x - m.position.x, p.z - m.position.z) < 1.1) { Q.luzes[m.userData.id] = true; m.visible = false; E.save(); E.sfx.chime(); E.toast(`Luz das esferas<small>${luzAch()}/3</small>`); if (luzAch() === 3) E.later(1.5, () => E.say('(As três. Agora é voltar pro Pássaro das Esferas.)', 4)); } } }
    if (maquina.visible) { aneis[0].rotation.y += dt * 1.6; aneis[1].rotation.z += dt * 1.1; }
    brew.material.color.setHSL(.33 + Math.sin(t * 2) * .03, 1, .6); fire.intensity = 6 + Math.sin(t * 7) * 1.2;
    if (L.glitchT > 0) L.glitchT -= dt; L.glitch = L.glitchT > 0 ? .3 : 0;
  };
  L.hint = () => {
    if (Q.st >= 3 && Q.tempo === 1) return luzAch() < 3 ? { text: 'As três luzes roxas estão escondidas perto da beirada da floresta.', target: luzes.find(m => m.visible)?.position.clone().setY(1) } : { text: 'Volte pro Pássaro das Esferas. E peça.', target: esferas.position.clone().setY(1) };
    if (Q.st >= 3 && Q.tempo === 2) return { text: 'A máquina do tempo está entre os cogumelos.', target: maquina.position.clone().setY(1.2) };
    if (Q.st >= 3) return { text: 'Volte pela trilha pro centro: o café de Naviraí está na Pobresa.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (Q.st === 0) return { text: 'Ainda não é hora. Volte pro centro e ache o Passarex nos três lugares.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (!Q.plano) return { text: 'O Mago está perto do caldeirão verde.', target: mago.position.clone().setY(1.2) };
    if (precisaMata()) return !Q.mata ? { text: 'O Mago quer te contar uma coisa. Fale com ele.', target: mago.position.clone().setY(1.2) }
      : { text: Q.mata >= 5 ? 'Devolva o boné ao Rosengo, em Matagalé, pelo corredor no fim da floresta.' : 'Atravesse o corredor no fim da floresta até Matagalé.', target: new THREE.Vector3(0, 1.2, -R - 3) };
    if (Q.armas) return { text: 'Volte pela trilha e vá até o centro da praça.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (Q.pediuRefri && !Q.refri && !Q.azedas) return { text: 'O Pássaro Cocô quer um refri gelado da Pobresa, lá no centro.', target: new THREE.Vector3(0, 1.2, R + 3) };
    if (!Q.azedas) return { text: 'As goiabas azedas estão com o Pássaro Cocô.', target: coco.position.clone().setY(1) };
    if (!Q.doces) return { text: 'As goiabas doces: fale com o Pássaro das Esferas. Ele só concede se você pedir.', target: esferas.position.clone().setY(1) };
    return { text: 'Leve as goiabas pro Macaco montar as máquinas.', target: macaco.position.clone().setY(1) };
  };
  L.debug = { Q, concede };
}
