// FASE SECRETA · A Ilha dos Passarex, 1491. Só se chega pela máquina do tempo que o Pássaro das Esferas concede
// (se você, depois da luta, em vez de buscar o café, voltar à floresta e pedir). Aqui os Passarex ainda são um
// bando tranquilo que só assobia. O Colombo acabou de chegar e quer acabar com todos. Se você vencer, ele nunca
// aprende a ter medo de gente, e ninguém aprende a ter medo dele: FINAL D · ELE NUNCA FOI MAU.
import { lutar } from './boss.js';

export function build(E, L) {
  const { THREE } = E, S = E.state, rnd = E.rnd;
  E.seed(1491);
  const { lam, basic, box } = E;
  E.scene.background = new THREE.Color(0xf6b48a);
  E.scene.fog = new THREE.FogExp2(0xf2b08a, .012);
  E.camera.far = 220;
  L.floor = 'grass'; L.speed = 2; L.eye = 1.6; L.reach = 2.4;
  E.osd('▶ PLAY', 'ILHA DOS PASSAREX · 1491');
  L.clock = () => '17:49';
  L.semAssombro = true;   // aqui ninguém assusta ninguém
  const C = { falou: false, lutando: false, venceu: false, navioSai: 0, said: {} };
  const R = 17;
  L.walkable = (x, z) => Math.hypot(x, z * 1.15) < R - .6;
  L.spawn = { x: 0, z: 11, yaw: 0, pitch: .02 };

  /* luz de fim de tarde */
  E.add(new THREE.AmbientLight(0xffd8b8, .75));
  const sol = E.add(new THREE.DirectionalLight(0xffc890, 1.3)); sol.position.set(-20, 18, -30);

  /* céu, sol e mar */
  const dome = E.add(new THREE.Mesh(new THREE.SphereGeometry(180, 16, 10), new THREE.MeshBasicMaterial({ map: E.canvasTex(4, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a6aa8'); gr.addColorStop(.45, '#f29a6a'); gr.addColorStop(.55, '#ffd08a'); gr.addColorStop(1, '#ffd08a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), side: THREE.BackSide, fog: false, depthWrite: false })));
  dome.renderOrder = -2;
  const sun = E.add(new THREE.Mesh(new THREE.CircleGeometry(11, 20), new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false, depthWrite: false }))); sun.position.set(-40, 14, -150); sun.lookAt(0, 0, 0); sun.renderOrder = -1;
  const seaT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#3e7aa8'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 160, ['#356c98', '#5a92bc', '#6aa2c8']); g.fillStyle = 'rgba(255,230,200,.4)'; g.fillRect(4, 10, 6, 1); g.fillRect(20, 24, 5, 1); }, [50, 50]);
  const seaGeo = new THREE.PlaneGeometry(360, 360, 36, 36); seaGeo.rotateX(-Math.PI / 2);
  const sea = E.add(new THREE.Mesh(seaGeo, lam({ map: seaT }))); sea.position.y = -.25;
  const seaBase = Float32Array.from(seaGeo.attributes.position.array);

  /* a ilha: areia, um morrinho verde no meio e coqueiros */
  const areiaT = E.canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#e8cc8a'; g.fillRect(0, 0, w, h); E.speckle(g, w, h, 220, ['#dcbc78', '#f2d8a0', '#c8a868']); }, [10, 10]);
  const ilha = E.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R + 3, 1, 28), lam({ map: areiaT }))); ilha.scale.z = 1 / 1.15; ilha.position.y = -.5;
  const morro = E.add(new THREE.Mesh(new THREE.SphereGeometry(6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x4a8a4a }))); morro.position.set(-2, -.6, 9.5); morro.scale.y = .45;
  const tronco = lam({ color: 0x8a6a4a }), folha = lam({ color: 0x2e7a3a, side: THREE.DoubleSide });
  for (const [x, z, h] of [[-12, 4, 6.5], [-9, -7, 7.5], [11, 5, 6], [13, -3, 7], [6, 12, 5.5], [-6, 13, 6.2], [2, -11.5, 6.8]]) {
    const t = E.add(new THREE.Mesh(new THREE.CylinderGeometry(.18, .3, h, 6), tronco)); t.position.set(x, h / 2, z); t.rotation.z = (rnd() - .5) * .25;
    for (let k = 0; k < 7; k++) { const f = E.add(new THREE.Mesh(new THREE.PlaneGeometry(3, .8), folha)); f.position.set(x, h, z); f.rotation.order = 'YZX'; f.rotation.set(-Math.PI / 2, k / 7 * Math.PI * 2, -.45); f.translateX(1.35); }
    E.circle(x, z, .45);
  }

  /* o bando: Passarex tranquilos, de dia, brincando na areia */
  const bando = [];
  for (const [x, z, h] of [[-5, 2, 1.7], [-3.4, 4.2, 1.2], [4.6, 1.5, 1.8], [6.4, 3.8, 1.1], [-7.2, -2.5, 1.6], [7.8, -1.8, 1.7], [-1.2, 6.6, .9], [1.6, 6.2, .95]]) {
    const p = E.add(E.sticker(h, { s: .12 })); p.position.set(x, 0, z); p.userData.base = { x, z, h, ph: rnd() * 6 }; bando.push(p); E.circle(x, z, .3);
  }
  const fiuBando = () => { for (let i = 0; i < 3; i++) E.later(i * .35, () => E.whistle(.035, { pitch: 1 + i * .1 })); };
  for (const p of bando) E.interact(E.hitbox(.8, p.userData.base.h, .8, p.position.x, p.userData.base.h / 2, p.position.z), {
    label: () => C.lutando || S.dlg || (C.venceu && !C.fimFeito) ? '' : '[E] Passarex',
    act: () => { if (S.dlg || C.lutando || (C.venceu && !C.fimFeito)) return; E.whistle(.05, { pitch: 1.15 }); E.conversa([['PASSAREX', 'fiu fiu?', '#ff8fb1'], ['VOCÊ', C.venceu ? '(Ele encosta a cabeça no seu ombro. Agora ele não tem medo de nada.)' : '(Ele inclina a cabeça pro lado, curioso. Não tem nada de assustador nisso.)']]); },
  });

  /* a caravela, ancorada perto da praia, e o bote */
  const navio = new THREE.Group(); E.add(navio); navio.position.set(4, 0, -34);
  { const casco = lam({ color: 0x5a3a22 }), vela = lam({ color: 0xf2e6cc, side: THREE.DoubleSide }), cruz = basic({ color: 0xc8302c, side: THREE.DoubleSide });
    const h = new THREE.Mesh(new THREE.BoxGeometry(5, 2.4, 14), casco); h.position.y = .8; navio.add(h);
    const proa = new THREE.Mesh(new THREE.ConeGeometry(2.5, 4, 4), casco); proa.rotation.x = Math.PI / 2; proa.rotation.y = Math.PI / 4; proa.position.set(0, .8, 9); proa.scale.y = .6; navio.add(proa);
    for (const [z, hm, w] of [[-3, 11, 5], [2.5, 13, 6]]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, hm, 5), casco); m.position.set(0, hm / 2 + 1.5, z); navio.add(m);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(w, w * .8), vela); v.position.set(0, hm * .62 + 1.5, z + .2); navio.add(v);
      const c1 = new THREE.Mesh(new THREE.PlaneGeometry(.5, 2), cruz); c1.position.set(0, hm * .62 + 1.5, z + .25); navio.add(c1);
      const c2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .5), cruz); c2.position.set(0, hm * .62 + 1.9, z + .25); navio.add(c2);
    }
  }
  const bote = E.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, .5, 3.4), lam({ color: 0x6a4428 }))); bote.position.set(1.5, .05, -14.5); bote.rotation.y = .3;

  /* o Colombo e o Tonho, na beira da praia, com uma rede */
  const colombo = E.add(E.figura('drawColombo', 1.8, { flip: true })); colombo.position.set(0, 0, -10.5);
  const tonho = E.add(E.figura('drawTonho', 1.72)); tonho.position.set(2.4, 0, -11.6);
  const rede = E.add(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), basic({ map: E.canvasTex(32, 24, g => { g.strokeStyle = '#c8b088'; g.lineWidth = 1; for (let i = 0; i < 32; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 24); g.stroke(); g.beginPath(); g.moveTo(i + 8, 0); g.lineTo(i, 24); g.stroke(); } }), transparent: true, side: THREE.DoubleSide }))); rede.position.set(1.4, .7, -11); rede.rotation.y = .4;
  E.circle(0, -10.5, .45); E.circle(2.4, -11.6, .45);
  const CO = '#ffb070', TO = '#9fd8ff', PX = '#ff8fb1';

  async function confronto() {
    if (C.falou) return; C.falou = true; C.lutando = true;
    await E.conversa([
      ['COLOMBO', 'Terra à vista! Uma ilha que não está em mapa nenhum.', CO],
      ['COLOMBO', 'E esses pássaros com cara de gente... isso não pode ficar aqui. Tonho, as redes!', CO],
      ['TONHO', 'Chefe... eles só tão assobiando.', TO],
      ['COLOMBO', 'Por isso mesmo. Daqui a quinhentos anos ninguém vai lembrar que eles existiram.', CO],
      ['VOCÊ', '(Então foi aqui. Foi aqui que ele aprendeu a ter medo de gente. E a gente, a ter medo dele.)'],
      ['VOCÊ', 'Ninguém vai encostar neles.'],
      ['COLOMBO', 'E quem é você? Com uma... goiaba?', CO],
    ]);
    E.glitchText('1491', .6);
    E.later(.8, () => lutar(E, { chefe: 'colombo' }).then(venceu));
  }
  async function venceu() {
    C.venceu = true; C.lutando = false;
    colombo.position.set(.6, 0, -12.5);
    E.conquista && E.conquista('colombo');
    await E.conversa([
      ['COLOMBO', 'Retirada! RETIRADA! Essa ilha não existe! Não tá no mapa! Ninguém fala dela!', CO],
      ['TONHO', 'Eu falei, chefe.', TO],
    ]);
    colombo.visible = false; tonho.visible = false; rede.visible = false; bote.visible = false;
    C.navioSai = .001; C.tFinal = L.t + 9;   // rede de segurança: se a conversa do bando for interrompida, o final vem mesmo assim
    E.later(1.2, () => fiuBando());
    E.later(2.5, () => E.conversa([
      ['PASSAREX', 'fiu fiu.', PX],
      ['VOCÊ', '(O bando inteiro assobia junto. É a coisa mais bonita que eu já ouvi.)'],
      ['VOCÊ', '(Um deles chega perto, bem devagar, e deixa uma pena dourada na minha mão.)'],
    ]).then(() => final()));
  }
  function final() {
    if (C.fimFeito) return; C.fimFeito = true;
    let got = []; try { got = JSON.parse(localStorage.getItem('registro1367-finais')) || []; } catch (e) {}
    if (!got.includes('D')) got.push('D'); try { localStorage.setItem('registro1367-finais', JSON.stringify(got)); } catch (e) {}
    S.flags.final = 'D'; E.save();
    E.note(`<small>ARQUIVO PASSAREX · REGISTRO APAGADO</small><h2>FINAL D · ELE NUNCA FOI MAU</h2>
      <p>Você voltou a 1491 e não deixou o Colombo caçar os Passarex. Ninguém teve medo deles, então eles nunca aprenderam a assustar.</p>
      <p>Em 1997, em Naviraí, ainda tem um assobio no escuro: “fiu fiu”. Mas agora ele só quer dar oi.</p>
      <p class="hand">e então, uma música começou a tocar, lá do céu</p>`);
    E.trigger(() => !S.noteOpen, () => { E.glitchText('↑', .6); E.later(.5, () => E.goTo('portoes')); });
  }

  E.trigger(() => C.venceu && !C.fimFeito && C.tFinal && L.t > C.tFinal && !S.dlg && !S.noteOpen, () => final());
  E.trigger(p => !C.falou && Math.hypot(p.x - colombo.position.x, p.z - colombo.position.z) < 4.2, () => confronto());

  L.ambience = bus => { E.loopNoise('lowpass', 420, 0, .05, bus); E.loopNoise('bandpass', 900, .5, .012, bus); };
  L.enter = () => {
    E.glitchText('1491', .8);
    E.later(1, () => E.toast('Ilha dos Passarex<small>1491 · antes de tudo</small>'));
    E.later(2.2, () => E.say('(A máquina me jogou na areia. Tá cheio deles aqui. E eles... estão brincando.)', 4.5));
    E.later(5, () => fiuBando());
    E.later(9, () => { if (!C.falou) E.say('(Tem um navio na beira da praia. E um homem de chapéu apontando uma luneta pra eles.)', 4.5); });
  };
  L.update = dt => {
    const t = L.t;
    const a = seaGeo.attributes.position;
    for (let i = 0; i < a.count; i++) a.array[i * 3 + 1] = seaBase[i * 3 + 1] + Math.sin(seaBase[i * 3] * .08 + t * .9) * .18 + Math.cos(seaBase[i * 3 + 2] * .07 + t * .7) * .14;
    a.needsUpdate = true;
    for (const p of bando) { const b = p.userData.base; p.position.y = Math.abs(Math.sin(t * 2 + b.ph)) * (C.venceu ? .18 : .06); }
    if (C.navioSai) { C.navioSai += dt; navio.position.z = -34 - C.navioSai * C.navioSai * 1.2; navio.rotation.z = Math.sin(t) * .03; } else navio.rotation.z = Math.sin(t * .8) * .02;
    colombo.userData.anim && colombo.userData.anim(t); tonho.userData.anim && tonho.userData.anim(t);
  };
  L.hint = () => C.falou ? null : { text: 'O Colombo está na beira da praia, com uma rede. Não deixe ele chegar no bando.', target: colombo.position.clone().setY(1.2) };
  L.debug = { C, confronto, venceu, final };
}
