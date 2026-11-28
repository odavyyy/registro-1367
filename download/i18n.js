// Idioma do jogo (português / English). O dicionário fica em i18n-en.js (window.I18N_EN: texto em português -> inglês).
// Traduz sozinho tudo o que aparece na tela: textos do HTML (menus, legendas, avisos, escolhas) e o que é desenhado
// em canvas (placas, cartazes, jornal, luta). Números viram '#' na chave e voltam no lugar na tradução.
(() => {
  const KEY = 'registro1367-lang';
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) {}
  if (lang !== 'pt' && lang !== 'en') lang = /^pt/i.test(navigator.language || 'pt') ? 'pt' : 'en';
  const D = window.I18N_EN || {};
  const cache = new Map();
  function tr1(n) {   // n já sem espaços nas pontas
    const nums = n.match(/\d+/g) || [];
    let v = D[n.replace(/\d+/g, '#')];
    if (v === undefined) return null;
    let i = 0; return v.replace(/#/g, () => (i < nums.length ? nums[i++] : '#'));
  }
  function T(s) {
    if (lang !== 'en' || typeof s !== 'string' || !s || !/[A-Za-zÀ-ÿ]/.test(s)) return s;
    if (cache.has(s)) return cache.get(s);
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    const n = s.replace(/\s+/g, ' ').trim();
    let v = tr1(n);
    if (v === null) {   // tentativas: prefixo tipo "[1] " / "[E] ", e trechos separados por " · "
      const m = n.match(/^(\[[^\]]*\]\s*|[^\wÀ-ÿ\[“"(]+\s*)(.+)$/);
      if (m) { const r = tr1(m[2]); if (r !== null) v = m[1] + r; }
      if (v === null) { const m2 = n.match(/^(.*?)(\s*\([\d\/ ]+\)|\s*\d+\/\d+|\s*\d+s)$/); if (m2) { const r = tr1(m2[1]); if (r !== null) v = r + m2[2]; } }   // "texto (0/3)"
      if (v === null && n.includes(' · ')) { const ps = n.split(' · '); const rs = ps.map(p => tr1(p)); if (rs.some(r => r !== null)) v = ps.map((p, i) => rs[i] ?? p).join(' · '); }
    }
    if (v === null && window.__i18nFaltas && /[A-Za-zÀ-ÿ]{3}/.test(n)) window.__i18nFaltas.add(n);   // depuração: o que não tem tradução
    const out = v === null ? s : lead + v + trail;
    if (cache.size < 5000) cache.set(s, out);
    return out;
  }
  function set(l) { try { localStorage.setItem(KEY, l); } catch (e) {} location.reload(); }
  window.I18N = { lang, T, set };
  if (lang !== 'en') return;
  document.documentElement.lang = 'en';

  // canvas: placas, cartazes, jornal, a luta, o fliperama
  const C2 = CanvasRenderingContext2D.prototype;
  for (const f of ['fillText', 'strokeText', 'measureText']) {
    const o = C2[f];
    C2[f] = function (t, ...r) { return o.call(this, typeof t === 'string' ? T(t) : t, ...r); };
  }
  // HTML: traduz cada texto que entra na página (e o que muda depois)
  const pula = el => el && el.closest && el.closest('script,style,[data-no-tr]');
  const texto = node => { if (pula(node.parentElement)) return; const v = T(node.nodeValue); if (v !== node.nodeValue) node.nodeValue = v; };
  const attrs = el => { for (const a of ['placeholder', 'title', 'aria-label']) { const v = el.getAttribute && el.getAttribute(a); if (v) { const t = T(v); if (t !== v) el.setAttribute(a, t); } } };
  const varre = root => {
    if (root.nodeType === 3) return texto(root);
    if (root.nodeType !== 1 || pula(root)) return;
    attrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) texto(n); else attrs(n); }
  };
  const obs = new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === 'characterData') texto(m.target);
      else if (m.type === 'attributes') attrs(m.target);
      else for (const n of m.addedNodes) varre(n);
    }
  });
  const liga = () => { document.title = T(document.title); varre(document.body); obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] }); };
  if (document.body) liga(); else document.addEventListener('DOMContentLoaded', liga);
})();
