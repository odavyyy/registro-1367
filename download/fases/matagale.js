// MATAGALÉ (Acerolândia) · a investigação. Testemunhos, rastros e relatos dos Acerolitos levam até a árvore do Passarex.
// O Rosengo mora num recanto escondido, empresta o boné e, na volta, dá a recompensa.
import { criaMapa, desenhaMapa, criaBone, T } from './bone.js';

export const MAPA = [
  '###################',
  '########.A.########',
  '########...########',
  '#########1#########',
  '#....###...###mmm.#',
  '#.n..###.#.###mhm.#',
  '#....#.....#..mm..#',
  '###.###.###.#.....#',
  '###...#.#w#.#.#####',
  '#.#.....#...#.....#',
  '#.p.###...###.###.#',
  '#R#.####.####.xxx.#',
  '#.#.......###.xxx.#',
  '###.##.##.###..f..#',
  '#.....e##.....#####',
  '#.a.....###.#...###',
  '#.....#...#...#...#',
  '###.###.....###.g.#',
  '#.c...###.#######.#',
  '#########.....##..#',
  '########.....#....#',
  '########..S..######',
  '########.....######',
  '########.....######',
  '###################',
];
export const NECESSARIAS = 4;   // relatos e rastros antes do ancião juntar as peças
const FONTES = ['vigia', 'pescador', 'pena', 'pegadas', 'brasa'];

export function build(E, L) {
  const { THREE, lam, basic, box } = E, S = E.state, rnd = E.rnd;
  E.seed(1367);
  const Q = S.flags.centro = S.flags.centro || { st: 1, found: {} };
  if (!Q.mata) Q.mata = 1;
  Q.pistas = Q.pistas || {};
  const M = criaMapa(MAPA);
  if (Q.pistas.anciao) for (const [c, r] of [[9, 3]]) M.set(c, r, 'D');   // a cortina de cipós só aparece depois que o ancião explica
  E.camera.far = 90;
  L.floor = 'grass'; L.speed = 2.2; L.eye = 1.6; L.reach = 2.6;
  E.osd('▶ PLAY', 'MATAGALÉ · ACEROLÂNDIA');
  L.clock = () => '03:67';

  const chaoT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#35532a'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 260, ['#2c4623', '#456a33', '#5a7a30', '#4a3a22']); });
  chaoT.wrapS = chaoT.wrapT = THREE.RepeatWrapping;
  const folhaT = E.canvasTex(32, 48, (g, w, h) => { g.fillStyle = '#17301c'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 420, ['#1f4226', '#2c5a30', '#0e2012', '#3a6a2e']); });
  const D = desenhaMapa(E, L, M, {
    chao: 0xffffff, chaoTex: chaoT, alturaParede: 3.4,
    geoParede: () => new THREE.BoxGeometry(T, 3.4, T),
    matParede: lam({ map: folhaT }), matParedeD: lam({ color: 0x4a2a6a }), matRaiz: lam({ color: 0x4a3220 }),
    matBuraco: basic({ color: 0x1e5a7a }), matLama: lam({ color: 0x3a2616 }),
  });
  // copas por cima das paredes de mato (só enfeite)
  { const copaG = new THREE.IcosahedronGeometry(1.35, 0), copaM = lam({ color: 0x1c3a20 }), lista = [];
    for (let r = 0; r < M.H; r++) for (let c = 0; c < M.W; c++) if (M.at(c, r) === '#' && (c * 7 + r * 3) % 3 === 0) { let borda = false; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (M.at(c + dc, r + dr) !== '#') borda = true; if (borda) lista.push(M.pos(c, r)); }
    const inst = new THREE.InstancedMesh(copaG, copaM, lista.length), o = new THREE.Object3D();
    lista.forEach((p, i) => { o.position.set(p.x, 3.5 + rnd() * .9, p.z); o.rotation.y = rnd() * 6; o.scale.setScalar(.7 + rnd() * .7); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); });
    inst.instanceMatrix.needsUpdate = true; inst.computeBoundingSphere(); E.add(inst); }
  // folhagem saindo das paredes e tufos no chão: mato de verdade, não corredor liso
  { const folhas = [[], []], tufos = [];
    for (let r = 0; r < M.H; r++) for (let c = 0; c < M.W; c++) {
      const p = M.pos(c, r);
      if (M.at(c, r) === '#') for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (M.at(c + dc, r + dr) === '#' || (r + dr === 3 && c + dc === 9)) continue;
        for (let k = 0; k < 5; k++) { const l = rnd() * 1.8 - .9; folhas[(rnd() * 2) | 0].push([p.x + dc * .9 + (dr ? l : 0), .15 + rnd() * 3.1, p.z + dr * .9 + (dc ? l : 0), .18 + rnd() * .2]); }
      } else if (M.at(c, r) === '.') for (let k = 0; k < 3; k++) tufos.push([p.x + rnd() * 1.8 - .9, .08, p.z + rnd() * 1.8 - .9, .5 + rnd() * .9]);
    }
    const o = new THREE.Object3D(), semeia = (geo, mat, lista, gira) => { const inst = new THREE.InstancedMesh(geo, mat, lista.length); lista.forEach(([x, y, z, s], i) => { o.position.set(x, y, z); o.rotation.set(gira ? rnd() * 3 : 0, rnd() * 6, gira ? rnd() * 3 : 0); o.scale.setScalar(s); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); }); inst.instanceMatrix.needsUpdate = true; inst.computeBoundingSphere(); E.add(inst); };
    const folhaG = new THREE.IcosahedronGeometry(1, 0);
    semeia(folhaG, lam({ color: 0x2f6a30 }), folhas[0], true); semeia(folhaG, lam({ color: 0x4c8a34 }), folhas[1], true);
    semeia(new THREE.ConeGeometry(.09, .3, 4), lam({ color: 0x5e9a3a }), tufos, false); }
  E.add(new THREE.HemisphereLight(0xa8c8e0, 0x2a3a1a, 1.75));
  const lua = E.add(new THREE.DirectionalLight(0xd8e0ff, .65)); lua.position.set(-8, 20, 6);

  const cortina = () => {
    const p = M.pos(9, 3), g = new THREE.Group();
    for (let i = 0; i < 11; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.035, .06, 3.2, 5), lam({ color: i % 2 ? 0x7ab04a : 0x9ac86a, emissive: 0x14280a })); m.position.set(p.x - .9 + i * .18, 1.65, p.z + 1.04 + (i % 3) * .03); m.rotation.z = Math.sin(i * 2.7) * .05; g.add(m); }
    D.soN.add(g);
  };
  L.walkable = (x, z) => M.anda(x, z, bone.dim);
  { const s = M.marca('S'); L.spawn = { x: s.x, z: s.z + 1.4, yaw: 0 }; }
  if (S.prevId === 'arvore') { const s = M.pos(9, 4); L.spawn = { x: s.x, z: s.z + .3, yaw: Math.PI }; }   // saindo da árvore: do lado de cá dos cipós
  const bone = criaBone(E, L, {
    M, D, tem: () => Q.mata >= 2 && Q.mata < 6,
    ceuN: 0x2e5440, ceuD: 0x2a1040, nevoaN: .048, nevoaD: .07,
    aoTrocar: dim => { if (dim && Q.mata < 4 && Math.random() < .4) E.later(1.2, () => { E.whistle(.035, { pan: Math.random() * 2 - 1 }); E.say('(Um fiu fiu bem longe. Ele sente quando eu viro o boné.)', 3.5); }); },
  });
  L.exit = () => bone.sai();
  if (Q.pistas.anciao) cortina();
  L.objetivo = () => Q.mata >= 6 ? 'Volte pela floresta e vá até o centro da praça.' : Q.mata === 5 ? 'Devolva o boné ao Rosengo.' : !Q.pistas.anciao ? (nPistas() < NECESSARIAS ? `Descubra pra onde o Passarex levou o Serjão: converse e procure rastros (${nPistas()}/${NECESSARIAS}).` : 'Alguém que conhece o mato pode juntar essas pistas.') : Q.mata < 2 ? 'Explore Matagalé. Tem mais alguém aqui.' : 'Encontre a árvore do Passarex.';

  /* ---------------- falar sem repetir clique ---------------- */
  let falando = false;
  const livre = () => !falando && !S.dlg && !S.choosing;
  const ponto = (obj, label, fn, quando = 'N') => bone.interact(obj, quando, { label: () => livre() ? '[E] ' + (typeof label === 'function' ? label() : label) : '', act: () => { if (!livre()) return; falando = true; Promise.resolve(fn()).finally(() => { falando = false; }); } });
  const nPistas = () => FONTES.filter(k => Q.pistas[k]).length;
  function anota(id, texto) {
    if (Q.pistas[id]) return;
    Q.pistas[id] = 1; E.save(); E.sfx.chime();
    E.toast(`Pista anotada<small>${texto} · ${Math.min(nPistas(), NECESSARIAS)}/${NECESSARIAS}</small>`);
    if (nPistas() === NECESSARIAS && !Q.pistas.anciao) E.later(4.2, () => E.say('(Já dá pra juntar as peças. O ancião da vila conhece esse mato.)', 4.5));
  }

  /* ---------------- os Acerolitos ---------------- */
  const AC = '#ffd23a', pulam = [];
  function aceroli(marca, alt, o, ox = 0, oz = 0) {
    const m0 = M.marca(marca), p = { x: m0.x + ox, z: m0.z + oz }, a = E.add(E.club('acerolito', alt, o)); a.position.set(p.x, 0, p.z); E.circle(p.x, p.z, .35);
    pulam.push({ a, ph: pulam.length * 1.7 });
    return { p, a, hit: E.hitbox(1.1, 1.6, 1.1, p.x, .8, p.z) };
  }
  const vigia = aceroli('a', 1.05);
  ponto(vigia.hit, 'Acerolito vigia', async () => {
    if (Q.mata >= 5) return E.conversa([['ACEROLITO VIGIA', 'Que isso? O Serjão voltou! Que isso!', AC]]);
    await E.conversa([
      ['ACEROLITO VIGIA', 'Que isso? Gente de fora?', AC],
      ['VOCÊ', 'Estou procurando o Passarex. Ele levou o Serjão.'],
      ['ACEROLITO VIGIA', 'Eu tava de vigia. Ouvi um fiu fiu vindo do lado da água. Depois um cheiro de carvão passou voando.', AC],
      ['ACEROLITO VIGIA', 'Quem pesca no riacho viu mais do que eu. Fica pro leste, depois do mato fechado.', AC],
    ]);
    anota('vigia', 'um fiu fiu e cheiro de carvão perto da água');
  });
  const pescador = aceroli('f', 1, undefined, 0, -.65);
  ponto(pescador.hit, 'Acerolito pescador', async () => {
    if (Q.mata >= 5) return E.conversa([['ACEROLITO PESCADOR', 'Voltou todo mundo. Até o peixe voltou.', AC]]);
    await E.conversa([
      ['ACEROLITO PESCADOR', 'Shhh. Peixe tem ouvido.', AC],
      ['ACEROLITO PESCADOR', 'Vi uma sombra do tamanho de uma casa. Carregava um homem de avental, e o homem gritava “ninguém pediu!”.', AC],
      ['ACEROLITO PESCADOR', 'Voou baixo, pro norte. Foi derrubando coisa pelo caminho.', AC],
    ]);
    anota('pescador', 'a sombra levou o Serjão pro norte');
  });
  const crianca = aceroli('c', .72, undefined, 0, .68);
  let nc = 0;
  ponto(crianca.hit, 'Acerolitinho', () => E.conversa([['ACEROLITINHO', ['Que isso?', 'O moço do espeto foi comprar farofa. Mentira. Eu inventei.', 'Meu pai falou pra não ir no mato depois do três e sessenta e sete.'][nc++ % 3], AC]]));
  const anciao = aceroli('e', 1.2, { dark: 'rgba(40,40,70,.28)' }, .68, .5);
  ponto(anciao.hit, () => !Q.pistas.anciao && nPistas() >= NECESSARIAS ? 'Contar as pistas ao ancião' : 'Acerolito ancião', async () => {
    if (Q.mata >= 5) return E.conversa([['ACEROLITO ANCIÃO', 'Você entrou na árvore e saiu. Em sessenta e sete anos, nunca vi isso.', AC]]);
    if (Q.pistas.anciao) return E.conversa([['ACEROLITO ANCIÃO', 'No fim do caminho do norte, os cipós que não balançam. De um lado são parede. Do outro, quem sabe.', AC], ...(Q.mata < 2 ? [['ACEROLITO ANCIÃO', 'Um rosado de boné mora escondido no oeste. Quem cabe nas raízes acha.', AC]] : [])]);
    if (nPistas() < NECESSARIAS) return E.conversa([
      ['ACEROLITO ANCIÃO', 'Você quer o caminho sem saber o que procura.', AC],
      ['ACEROLITO ANCIÃO', 'Escuta quem viu, olha o que ficou no chão. Depois volta. Velho não adivinha, velho junta.', AC],
      ['VOCÊ', `(Tenho ${nPistas()} de ${NECESSARIAS} pistas.)`],
    ]);
    await E.conversa([
      ['VOCÊ', 'Fiu fiu perto da água, uma sombra indo pro norte e o rastro que ficou no chão.'],
      ['ACEROLITO ANCIÃO', '...Então ele voltou pra casa.', AC],
      ['ACEROLITO ANCIÃO', 'É uma árvore morta que não balança com o vento. Ela não aparece pra quem procura de qualquer jeito.', AC],
      ['ACEROLITO ANCIÃO', 'Vá pelo caminho do norte, depois da pedra riscada. No fundo tem uma cortina de cipós. Cipó não é pra ser tão duro assim.', AC],
      ['ACEROLITO ANCIÃO', 'E ninguém atravessa aquilo andando. Não do lado de cá.', AC],
    ]);
    Q.pistas.anciao = 1; D.troca(9, 3, 'D'); cortina(); bone.aplica(); E.save(); E.sfx.chime();
    E.toast('A árvore do Passarex<small>no norte, atrás da cortina de cipós</small>');
  });

  /* ---------------- os rastros ---------------- */
  { const p = M.marca('n'), grp = E.add(new THREE.Group()); grp.position.set(p.x, 0, p.z);
    const galho = new THREE.Mesh(new THREE.CylinderGeometry(.04, .09, 1.6, 5), lam({ color: 0x5a3a22 })); galho.position.y = .8; galho.rotation.z = .35; grp.add(galho);
    const pena = new THREE.Mesh(new THREE.SphereGeometry(.5, 8, 6), basic({ color: 0x120a16 })); pena.scale.set(.22, 1, .07); pena.position.set(-.35, 1.45, 0); pena.rotation.z = -.9; grp.add(pena);
    const talo = new THREE.Mesh(new THREE.BoxGeometry(.03, 1.05, .03), basic({ color: 0xf4e2a8 })); talo.position.copy(pena.position); talo.rotation.z = -.9; grp.add(talo);
    E.circle(p.x, p.z, .2);
    ponto(E.hitbox(1.1, 1.9, .8, p.x - .15, 1, p.z), 'Uma pena enorme', async () => {
      await E.conversa([['VOCÊ', '(Uma pena preta do tamanho do meu braço, presa num galho. Ainda está morna.)'], ['VOCÊ', '(O galho quebrou na direção do norte.)']]);
      anota('pena', 'pena preta num galho quebrado');
    }); }
  { const p = M.marca('h');
    const pegT = E.canvasTex(32, 32, g => { g.fillStyle = '#140c06'; for (const [a, c] of [[-.55, 11], [0, 14], [.55, 11], [Math.PI, 8]]) { g.save(); g.translate(16, 19); g.rotate(a); g.fillRect(-2, -c - 2, 4, c + 2); g.fillRect(-1, -c - 5, 2, 4); g.restore(); } g.beginPath(); g.arc(16, 19, 4, 0, 7); g.fill(); });
    for (let k = 0; k < 3; k++) { const m = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), basic({ map: pegT, transparent: true, alphaTest: .4 }))); m.rotation.x = -Math.PI / 2; m.position.set(p.x + (k % 2) * .6 - .3, .06 + k * .005, p.z + 1.3 - k * 1.3); }
    ponto(E.hitbox(1.6, 1, 2.4, p.x, .3, p.z), 'Pegadas na lama', async () => {
      await E.conversa([['VOCÊ', '(Pegadas de três dedos, cada uma maior que uma bacia. Fundas, como de quem pousou carregando peso.)'], ['VOCÊ', '(Do lado, um rastro de dois calcanhares arrastados. O Serjão não foi de bom grado.)']]);
      anota('pegadas', 'pegadas gigantes e calcanhares arrastados');
    }); }
  const brasaLuz = new THREE.PointLight(0xff6a20, 5, 5, 1.6);
  { const p = M.marca('g'), x = p.x + .3, z = p.z;
    box(1.3, .5, .6, lam({ color: 0x2a2a2e }), x, .75, z, { occ: false }); for (const dx of [-.55, .55]) box(.08, .5, .08, lam({ color: 0x1a1a1e }), x + dx, .25, z, { occ: false });
    const br = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.15, .46), basic({ color: 0xc8401a }))); br.rotation.x = -Math.PI / 2; br.position.set(x, 1.01, z);
    brasaLuz.position.set(x, 1.5, z); E.add(brasaLuz); E.circle(x, z, .7);
    for (let k = 0; k < 5; k++) { const e = box(.04, .02, .5, lam({ color: 0xb8905a }), x - 1 - k * .25, .05, z - .4 - k * .6, { occ: false }); e.rotation.y = rnd() * 3; }
    ponto(E.hitbox(1.7, 1.4, 1.1, x, .8, z), 'Churrasqueira abandonada', async () => {
      await E.conversa([['VOCÊ', '(A churrasqueira do Serjão. A brasa ainda está acesa. Um espeto ficou pela metade.)'], ['VOCÊ', '(No chão, palitos caídos um atrás do outro, com farofa. Ele deixou um rastro de propósito. Vai pro norte.)']]);
      anota('brasa', 'palitos com farofa indo pro norte');
    }); }
  // a pedra riscada: confirma o caminho depois que o ancião fala
  { const p = M.marca('w'), pedra = E.add(new THREE.Mesh(new THREE.DodecahedronGeometry(.75, 0), lam({ color: 0x6a6a72 }))); pedra.position.set(p.x, .6, p.z - .45);
    for (let k = -1; k <= 1; k++) { const r2 = E.add(new THREE.Mesh(new THREE.PlaneGeometry(.06, .8), basic({ color: 0x1a0a0a, fog: false }))); r2.position.set(p.x + k * .2, .7, p.z + .3); r2.rotation.z = .35; }
    ponto(E.hitbox(1.4, 1.4, .8, p.x, .7, p.z), 'Pedra riscada', () => E.say(Q.pistas.anciao ? '(A pedra riscada que o ancião falou. O caminho do norte começa aqui perto.)' : '(Três riscos fundos na pedra. Garra de alguma coisa grande.)', 4), '*'); }

  /* ---------------- o Rosengo ---------------- */
  const RO = '#ff8fb1', SJ = '#ffb070';
  const rp = M.marca('R');
  const rosengo = E.add(E.club('rosengo', 1.75)); rosengo.position.set(rp.x, 0, rp.z + .55); E.circle(rp.x, rp.z + .55, .35);
  { const lz = E.add(new THREE.PointLight(0xff8fb1, 4, 5, 1.6)); lz.position.set(rp.x, 2.2, rp.z + .5); }
  let serjao = null;
  const poeSerjao = () => { if (serjao || Q.mata < 5) return; serjao = E.add(E.club('serjao', 1.85)); serjao.position.set(rp.x, 0, rp.z - .75); E.circle(rp.x, rp.z - .75, .35); };
  poeSerjao();
  ponto(E.hitbox(1.2, 1.9, 1.4, rp.x, .95, rp.z + .55), () => Q.mata === 5 ? 'Devolver o boné' : 'El Rosengo', async () => {
    if (Q.mata === 5) return recompensa();
    if (Q.mata >= 6) return E.conversa([['EL ROSENGO', '¡EL ROSENGO!', RO], ['VOCÊ', '(Ele está comendo um espeto de olhos fechados.)']]);
    if (Q.mata >= 2) return E.conversa([['EL ROSENGO', 'El Rosengo espera. Traz o Serjão.', RO], ...(Q.pistas.anciao ? [] : [['EL ROSENGO', 'Não sabe onde é? O ancião dos Acerolitos sabe. Se você levar pistas pra ele.', RO]])]);
    await E.conversa([
      ['EL ROSENGO', '¡EL ROSENGO!', RO],
      ['EL ROSENGO', 'Você... vai atrás do Serjão? El Rosengo ouviu os Acerolitos cochichando.', RO],
      ['EL ROSENGO', 'O Serjão não é um churrasqueiro. É O churrasqueiro. El Rosengo é fã desde o primeiro espeto.', RO],
      ['EL ROSENGO', 'El Rosengo guarda sessenta e sete palitos dele. Numerados.', RO],
      ['EL ROSENGO', 'Traz ele de volta. Por favor.', RO],
      ['VOCÊ', 'Eu vou. Mas como eu entro onde o Passarex mora?'],
      ['VOCÊ', '(Ele tira o boné e coloca na sua mão, com as duas mãos, bem sério.)'],
      ['VOCÊ', 'O boné? O que ele faz?'],
      ['EL ROSENGO', 'El Rosengo.', RO],
      ['VOCÊ', 'Como assim? Ele faz alguma coisa?'],
      ['EL ROSENGO', 'El. Ro-sen-go.', RO],
      ['VOCÊ', 'Ahh... entendi. Se eu virar o boné, ele abre uma dimensão. O mundo troca pro outro lado, e lá o caminho é diferente.'],
      ['EL ROSENGO', '¡EL ROSENGO!', RO],
      ['VOCÊ', 'E o Passarex percebe quando alguém faz isso. Certo. Obrigado.'],
      ['VOCÊ', '(Não faço a menor ideia de como eu entendi isso.)'],
    ]);
    Q.mata = 2; E.save(); E.sfx.chime(); E.tone(392, .5, .05, 'triangle'); E.tone(587, .7, .05, 'triangle', null, .18);
    E.toast(`🧢 Boné do Rosengo<small>${E.isTouch ? 'botão 🧢' : 'aperte Q'} pra trocar de lado</small>`);
    E.later(4.4, () => E.tutorial && E.tutorial('bone', 'O boné do Rosengo', [['Q', '🧢', 'vira o boné e troca de dimensão']], 'Do outro lado, paredes somem, outras aparecem e pontes surgem. O Passarex sente cada troca.'));
  });
  async function recompensa() {
    await E.conversa([
      ['EL ROSENGO', '¡SERJÃO! ¡EL ROSENGO!', RO],
      ['SERJÃO', 'Boa noite, boa noite! Voltei de novo, hein. Já tô ficando bom nisso.', SJ],
      ['VOCÊ', 'E isto aqui é seu. Obrigado por emprestar.'],
      ['VOCÊ', '(Você devolve o boné. O Rosengo ajeita na cabeça com muito cuidado.)'],
      ['EL ROSENGO', 'El Rosengo agradece. De coração. Três noites sem o Serjão. El Rosengo ficou cheirando palito vazio.', RO],
      ['SERJÃO', 'Isso é... bonito. Esquisito, mas bonito.', SJ],
      ['EL ROSENGO', 'O espeto do Serjão é a coisa mais linda de Acerolândia. No ponto, com farofa, sem pressa. El Rosengo sonha com ele.', RO],
      ['EL ROSENGO', 'Quem salva o Serjão não pode nunca mais ficar sem. El Rosengo pede por você. Pra sempre.', RO],
      ['SERJÃO', 'Opa. Pediu, tá pedido. E esse pedido não tem fim: toma, espetinho infinito!', SJ],
    ]);
    Q.mata = 6; Q.st = 2; E.META.espetoInf = 1; E.salvarMeta(); bone.poe(false); E.save(); E.marcaCap && E.marcaCap('luta');
    E.sfx.chime(); E.tone(523, .4, .05, 'triangle'); E.tone(659, .4, .05, 'triangle', null, .2); E.tone(784, .8, .05, 'triangle', null, .4);
    E.toast('🎒 Espetinhos infinitos do Serjão<small>no inventário · comer não gasta</small>');
    await E.conversa([['SERJÃO', 'E aquele pássaro? Ele tá bravo. Desceu pro centro, direto pra praça.', SJ], ['VOCÊ', 'Então é lá que isso acaba. Eu tenho as máquinas de goiaba.'], ['EL ROSENGO', '¡EL ROSENGO!', RO]]);
    E.later(2, () => E.toast('A luta final<small>volte pela floresta e vá até o centro da praça</small>'));
  }

  /* ---------------- cabaninhas, vagalumes, flores do outro lado ---------------- */
  for (const [c, r, dx, dz] of [[1, 14, -.75, -.4], [4, 16, 0, .75], [1, 18, -.75, .2], [7, 15, .75, -.3]]) {   // encostadas na parede, fora do caminho
    const p = M.pos(c, r), x = p.x + dx, z = p.z + dz;
    const casa = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.42, .48, .7, 7), lam({ color: 0xb89a6a }))); casa.position.set(x, .35, z);
    const teto = E.add(new THREE.Mesh(new THREE.ConeGeometry(.62, .55, 7), lam({ color: 0x16120e }))); teto.position.set(x, .97, z);
    const aba = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .05, 7), lam({ color: 0x16120e }))); aba.position.set(x, .72, z);
    E.circle(x, z, .3);
  }
  { const lz = E.add(new THREE.PointLight(0xffc860, 7, 8, 1.5)); const p = M.pos(3, 15); lz.position.set(p.x, 2, p.z); }
  const vagas = [];
  { const vm = basic({ color: 0xfff0a0, fog: false }), livres = M.alcance(M.cel(M.marca('S').x, M.marca('S').z));
    for (let i = 0; i < 34; i++) { const [c, r] = livres[(rnd() * livres.length) | 0], p = M.pos(c, r), m = E.add(new THREE.Mesh(new THREE.SphereGeometry(.03, 4, 3), vm)); m.userData.p = [p.x, p.z, .6 + rnd() * 1.8, rnd() * 6]; vagas.push(m); }
    const fm = basic({ color: 0xd8a0ff, fog: false });
    for (let i = 0; i < 40; i++) { const [c, r] = livres[(rnd() * livres.length) | 0], p = M.pos(c, r), m = new THREE.Mesh(new THREE.SphereGeometry(.07, 5, 4), fm); m.position.set(p.x + rnd() * 1.4 - .7, .12 + rnd() * .5, p.z + rnd() * 1.4 - .7); D.soD.add(m); } }

  /* ---------------- entradas e saídas ---------------- */
  { const a = M.marca('A');
    const tronco = E.add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 12, 11, 1, true), lam({ color: 0x1e140e, side: THREE.DoubleSide }))); tronco.position.set(a.x, 6, a.z - 3.4);
    const boca = E.add(new THREE.Mesh(new THREE.CircleGeometry(1.15, 14), basic({ color: 0x000000 }))); boca.position.set(a.x, 1.15, a.z - .55);
    for (const s of [-1, 1]) { const o = E.add(new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 5), basic({ color: 0xf4e2a8, fog: false }))); o.position.set(a.x + s * .35, 2.9, a.z - .75); }
    E.trigger(p => Math.hypot(p.x - a.x, p.z - a.z) < 1.15 && Q.mata >= 2 && Q.mata < 5, () => { E.later(.1, () => E.goTo('arvore')); });
    let avisou = false;
    L.avisaArvore = p => { if (!avisou && Math.hypot(p.x - a.x, p.z - a.z) < 1.4 && Q.mata >= 5) { avisou = true; E.say('(Não. Lá dentro eu não volto.)', 3); } }; }
  const sul = M.pos(9, 23).z;
  E.portal(M.marca('S').x, sul + .9, Math.PI, '← FLORESTA', '#7affd8');
  E.trigger(p => p.z > sul + .35, () => { E.goTo('floresta'); });
  E.moedas([[1, 4], [17, 6], [17, 19], [1, 18], [7, 8]].map(([c, r]) => { const p = M.pos(c, r); return [p.x, null, p.z]; }));

  L.ambience = bus => { E.loopNoise('bandpass', 4600, 10, .016, bus); E.loopNoise('lowpass', 220, 0, .035, bus); E.loopNoise('bandpass', 900, 2, .008, bus); };
  L.enter = () => {
    E.later(1, () => E.toast(Q.mata >= 6 ? 'Matagalé<small>Acerolândia</small>' : Q.mata === 5 ? 'Matagalé<small>devolva o boné ao Rosengo · [H] dica</small>' : 'Matagalé<small>pergunte aos Acerolitos e procure rastros · [H] dica</small>'));
    if (Q.mata === 5) E.later(4, () => E.say('SERJÃO: Vou na frente avisar o rosado. Te espero lá no recanto dele.', 4, 'npc'));
  };
  let fiuT = 25;
  L.update = dt => {
    const t = L.t, p = E.player.pos;
    bone.tick(dt);
    for (const v of pulam) v.a.position.y = Math.max(0, Math.sin(t * 3 + v.ph)) * (Math.sin(t * .5 + v.ph) > .4 ? .22 : 0);
    for (const m of vagas) { const [x, z, y, f] = m.userData.p; m.position.set(x + Math.sin(t * .6 + f) * .8, y + Math.sin(t * 1.7 + f) * .25, z + Math.cos(t * .5 + f) * .8); }
    brasaLuz.intensity = 5 + Math.sin(t * 9) * .8;
    L.speed = M.at(...M.cel(p.x, p.z)) === 'm' ? 1.35 : 2.2;
    L.avisaArvore(p);
    if (Q.mata < 5 && !S.dlg) { fiuT -= dt; if (fiuT <= 0) { fiuT = 30 + Math.random() * 30; E.whistle(.025, { pan: Math.random() * 2 - 1, pitch: .85 }); } }
    if (L.glitchT > 0) L.glitchT -= dt; L.glitch = L.glitchT > 0 ? .35 : 0;
  };
  // dica: o caminho de verdade, casa por casa (na dimensão atual)
  const rumo = (txt, c, r) => {
    const p = E.player.pos, cam = M.caminho(M.cel(p.x, p.z), [c, r], bone.dim, 'jog');
    return { text: txt, path: cam.filter((_, i) => i % 2 === 1 || i === cam.length - 1).slice(0, 7).map(([cc, rr]) => { const q = M.pos(cc, rr); return new THREE.Vector3(q.x, 1.3, q.z); }) };
  };
  const em = ch => M.marcas[ch][0];
  L.hint = () => {
    if (Q.mata >= 6) return rumo('Volte pela floresta e vá até o centro da praça.', ...em('S'));
    if (Q.mata === 5) return rumo('Devolva o boné ao Rosengo, no recanto escondido do oeste.', 1, 10);
    if (!Q.pistas.anciao) {
      if (nPistas() >= NECESSARIAS) return rumo('Leve as pistas ao ancião, na vila.', ...em('e'));
      const falta = [['vigia', 'a', 'Pergunte ao vigia, na vila dos Acerolitos (oeste).'], ['pescador', 'f', 'Alguém pesca no riacho, a leste. Pergunte o que viu.'], ['brasa', 'g', 'Siga o cheiro de carvão no sudeste.'], ['pegadas', 'h', 'Procure no lamaçal, no nordeste.'], ['pena', 'n', 'Olhe os galhos do noroeste.']].find(f => !Q.pistas[f[0]]);
      return rumo(`${falta[2]} (${nPistas()}/${NECESSARIAS})`, ...em(falta[1]));
    }
    if (Q.mata < 2) return rumo('Tem alguém no oeste, atrás de uma passagem estreita entre raízes.', 1, 10);
    if (!bone.dim) return rumo('A cortina de cipós fica no fim do caminho do norte. Chegue perto e vire o boné.', 9, 4);
    return rumo('Atravesse o vão dos cipós até a árvore.', ...em('A'));
  };
  L.debug = { Q, M, D, bone, nPistas };
}
