// Editor visual do jornal TEP. Sem dependências além do jsPDF (usado em export.js).
'use strict';

const STORAGE_KEY = 'tep-editor:v1';
const ASC = 1900 / 2048;   // ascendente da Roboto (todas as variantes)
const DESC = 500 / 2048;   // descendente da Roboto

/* ---------- fontes ---------- */

function fam(key) { return `"F-${key}"`; }

(function registerFonts() {
  const css = Object.keys(FONTS).map(k => `@font-face{font-family:"F-${k}";src:url("fonts/${k}.ttf") format("truetype");` +
    `ascent-override:${(ASC * 100).toFixed(4)}%;descent-override:${(DESC * 100).toFixed(4)}%;line-gap-override:0%;font-display:block;}`).join('\n');
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
})();

function loadFonts() {
  return Promise.all(Object.keys(FONTS).map(k => document.fonts.load(`16px ${fam(k)}`)));
}

/* ---------- imagens enviadas (IndexedDB) ---------- */

const Uploads = {
  db: null,
  urls: {},   // id -> objectURL
  meta: {},   // id -> {name, w, h}
  open() {
    return new Promise((res) => {
      let req;
      try { req = indexedDB.open('tep-editor', 1); } catch (e) { res(); return; }
      req.onupgradeneeded = () => req.result.createObjectStore('imgs', { keyPath: 'id' });
      req.onsuccess = () => { this.db = req.result; res(); };
      req.onerror = () => res();
    });
  },
  async loadAll() {
    if (!this.db) return;
    const all = await new Promise((res) => {
      const r = this.db.transaction('imgs').objectStore('imgs').getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => res([]);
    });
    for (const it of all) {
      this.urls[it.id] = URL.createObjectURL(it.blob);
      this.meta[it.id] = { name: it.name, w: it.w, h: it.h };
    }
  },
  async add(blob, name) {
    if (Sync.online) {
      const src = await Sync.upload(blob, name);
      const dims = await imageSize(URL.createObjectURL(blob));
      return { src, w: dims.w, h: dims.h };
    }
    const id = uid();
    const url = URL.createObjectURL(blob);
    const dims = await imageSize(url);
    this.urls[id] = url;
    this.meta[id] = { name, w: dims.w, h: dims.h };
    if (this.db) {
      await new Promise((res) => {
        const tx = this.db.transaction('imgs', 'readwrite');
        tx.objectStore('imgs').put({ id, blob, name, w: dims.w, h: dims.h });
        tx.oncomplete = res; tx.onerror = res;
      });
    }
    return { src: 'idb:' + id, w: dims.w, h: dims.h };
  },
  async blob(id) {
    const r = await fetch(this.urls[id]);
    return r.blob();
  },
};

function imageSize(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = rej;
    im.src = url;
  });
}

function resolveSrc(src) {
  if (!src) return null;
  if (src.startsWith('idb:')) return Uploads.urls[src.slice(4)] || null;
  return src;
}

/* ---------- estado e histórico ---------- */

let state = null;
let selId = null;
let hoverId = null;
let zoom = 1;
let cropMode = false;
let editingId = null;
let showGuides = true;
let guides = [];          // linhas de encaixe visíveis durante o arrasto
let drag = null;
let clipboard = null;
const hist = { past: [], future: [], last: '' };

function page() { return state.pages[state.cur]; }
function els() { return page().elements; }
function getEl(id) { return els().find(e => e.id === id) || null; }
function selected() { return selId ? getEl(selId) : null; }

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && s.pages && s.pages.length) {
      const added = addNewTemplatePages(s).concat(autoUpdateUntouched(s));
      const updated = s.pages.filter(hasTemplateUpdate).map(p => p.name);
      const msg = [];
      if (added.length) msg.push('Página nova ou atualizada no modelo: ' + added.join(', ') + '.');
      if (updated.length) msg.push('Versão nova disponível: ' + updated.join(', ') + ' (veja no painel da página).');
      if (msg.length) setTimeout(() => toast(msg.join(' '), 6000), 800);
      return s;
    }
  } catch (e) { /* sem acesso ao armazenamento */ }
  return defaultState();
}

// Modelo de uma página pelo seu "tid" (null se a página não veio do modelo).
function templateFor(tid) {
  return tid ? defaultState().pages.find(p => p.tid === tid) || null : null;
}

function hasTemplateUpdate(p) {
  const t = templateFor(p.tid);
  return !!t && (t.tver || 1) > (p.tver || 1);
}

// Troca a página atual pela do modelo; a versão da pessoa fica logo depois, como cópia.
function useTemplateVersion() {
  const old = page();
  const fresh = templateFor(old.tid);
  if (!fresh) return;
  fresh.id = uid();
  old.name = old.name.replace(/ \(sua versão anterior\)$/, '') + ' (sua versão anterior)';
  delete old.tid;
  state.pages.splice(state.cur, 0, fresh);
  selId = null; cropMode = false;
  commit(); renderAll();
  toast('Página atualizada. A sua versão anterior ficou logo abaixo na lista; apague se não precisar.', 6000);
}

// Página do modelo que ninguém editou: compara com a assinatura guardada (ou com versões antigas do modelo).
function isUntouched(p) {
  const sig = pageSig(p);
  if (p.tsig && (p.tsig === sig || p.tsig === legacySig(p))) return true;
  const t = templateFor(p.tid);
  if (t && pageSig(t) === sig) return true;
  return legacyTemplates().some(l => l.tid === p.tid && pageSig(l) === sig);
}

// Troca, sem perguntar, as páginas do modelo que têm versão nova e não foram editadas.
function autoUpdateUntouched(s) {
  const done = [];
  s.pages.forEach((p, i) => {
    if (hasTemplateUpdate(p) && isUntouched(p)) {
      const t = templateFor(p.tid);
      t.id = p.id;
      s.pages[i] = t;
      done.push(t.name);
    }
  });
  return done;
}

// Insere no trabalho salvo as páginas do modelo que a pessoa ainda não recebeu.
// Uma página recebida e depois apagada não volta (fica registrada em seenTids).
function addNewTemplatePages(s) {
  if (!s.seenTids) {
    s.seenTids = [];
    if (s.pages[0] && !s.pages[0].tid && s.pages[0].name === 'Capa') s.pages[0].tid = 'capa';
  }
  for (const p of s.pages) if (p.tid && !s.seenTids.includes(p.tid)) s.seenTids.push(p.tid);
  const added = [];
  defaultState().pages.forEach((p, i) => {
    if (s.seenTids.includes(p.tid)) return;
    const at = Math.min(i, s.pages.length);
    s.pages.splice(at, 0, p);
    if (s.pages.length > 1 && at <= (s.cur || 0)) s.cur = (s.cur || 0) + 1;
    s.seenTids.push(p.tid);
    added.push(p.name);
  });
  return added;
}

let saveTimer = null;
function persist() {
  if (Sync.online) { Sync.schedule(); return; }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, hist.last); } catch (e) { /* cheio ou bloqueado */ }
  }, 300);
}

function commit() {
  const s = JSON.stringify(state);
  if (s === hist.last) return;
  hist.past.push(hist.last);
  if (hist.past.length > 150) hist.past.shift();
  hist.future = [];
  hist.last = s;
  persist();
}

function undo() {
  if (!hist.past.length) return;
  hist.future.push(hist.last);
  hist.last = hist.past.pop();
  state = JSON.parse(hist.last);
  afterHistory();
}

function redo() {
  if (!hist.future.length) return;
  hist.past.push(hist.last);
  hist.last = hist.future.pop();
  state = JSON.parse(hist.last);
  afterHistory();
}

function afterHistory() {
  if (selId && !getEl(selId)) selId = null;
  cropMode = false;
  persist();
  renderAll();
}

/* ---------- referências do DOM ---------- */

const $ = (s, r = document) => r.querySelector(s);
const pageDiv = $('#page');
const overlay = $('#overlay');
const stage = $('#stage');
const viewport = $('#viewport');
const panel = $('#panel');
const nodes = new Map();

function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------- desenho dos elementos ---------- */

function buildNode(el) {
  const n = document.createElement('div');
  n.className = 'el el-' + (el.type === 'image' ? 'img' : el.type);
  n.dataset.id = el.id;
  if (el.type === 'text') {
    const t = document.createElement('div');
    t.className = 'txt';
    n.appendChild(t);
  }
  return n;
}

function setRich(inner, el) {
  const key = el.text + '\u0000' + el.font;
  if (inner._key === key) return;
  inner._key = key;
  inner.textContent = '';
  const parts = el.text.split('**');
  const boldKey = (FONTS[el.font] || FONTS['Roboto-Regular']).bold;
  parts.forEach((p, i) => {
    if (!p) return;
    const s = document.createElement('span');
    const f = i % 2 ? boldKey : el.font;
    s.dataset.font = f;
    s.style.fontFamily = fam(f);
    s.textContent = p;
    inner.appendChild(s);
  });
}

function paintNode(n, el, forExport) {
  const st = n.style;
  st.left = el.x + 'px';
  st.top = el.y + 'px';
  st.width = el.w + 'px';
  st.height = el.h + 'px';
  st.opacity = (el.opacity ?? 100) / 100;
  n.classList.toggle('hidden', !!el.hidden);
  n.classList.toggle('locked', !!el.locked);

  if (el.type === 'text') {
    st.background = el.bg || 'transparent';
    st.padding = `${el.padT}px ${el.padR}px ${el.padB}px ${el.padL}px`;
    st.boxSizing = 'border-box';
    const t = n.firstChild;
    t.style.fontFamily = fam(el.font);
    t.style.fontSize = el.size + 'px';
    t.style.lineHeight = el.lh + 'px';
    t.style.color = el.color;
    t.style.textAlign = el.align;
    if (el.align === 'justify') t.style.textAlignLast = 'left';
    if (forExport || editingId !== el.id) setRich(t, el);
    if (!forExport) {
      const over = t.offsetHeight + el.padT + el.padB > el.h + 0.5;
      n.classList.toggle('overflow', over);
    }
  } else if (el.type === 'image') {
    const url = resolveSrc(el.src);
    let img = n.querySelector('img');
    n.classList.toggle('empty', !url);
    if (!url) { if (img) img.remove(); return; }
    if (!img) {
      img = document.createElement('img');
      img.draggable = false;
      img.alt = '';
      n.appendChild(img);
    }
    if (img._src !== url) {
      if (/^https?:/.test(url)) img.crossOrigin = 'anonymous';
      img.src = url; img._src = url;
    }
    img.style.left = el.ix + 'px';
    img.style.top = el.iy + 'px';
    img.style.width = el.iw + 'px';
    img.style.height = (el.iw * el.nh / el.nw) + 'px';
  } else if (el.type === 'rect') {
    st.background = el.fill || 'transparent';
    st.border = el.sw > 0 ? `${el.sw}px solid ${el.stroke}` : '0';
    st.boxSizing = 'border-box';
  }
}

function renderPage() {
  const list = els();
  const seen = new Set();
  list.forEach((el, i) => {
    let n = nodes.get(el.id);
    if (!n || n._type !== el.type) {
      if (n) n.remove();
      n = buildNode(el);
      n._type = el.type;
      nodes.set(el.id, n);
      pageDiv.appendChild(n);
    }
    n.style.zIndex = i + 1;
    paintNode(n, el);
    seen.add(el.id);
  });
  for (const [id, n] of nodes) {
    if (!seen.has(id)) { n.remove(); nodes.delete(id); }
  }
}

function applyZoom() {
  pageDiv.style.width = PAGE_W + 'px';
  pageDiv.style.height = PAGE_H + 'px';
  pageDiv.style.transform = `scale(${zoom})`;
  overlay.style.width = PAGE_W + 'px';
  overlay.style.height = PAGE_H + 'px';
  overlay.style.transform = `scale(${zoom})`;
  stage.style.width = PAGE_W * zoom + 'px';
  stage.style.height = PAGE_H * zoom + 'px';
  $('#zoomLabel').textContent = Math.round(zoom * 100) + '%';
}

function zoomFit() {
  const z = Math.min((viewport.clientWidth - 60) / PAGE_W, (viewport.clientHeight - 80) / PAGE_H);
  setZoom(z);
}

function setZoom(z) {
  zoom = Math.max(0.2, Math.min(4, z));
  applyZoom();
  renderOverlay();
}

/* ---------- overlay: seleção, alças e guias ---------- */

function box(cls, x, y, w, h, extra) {
  const d = document.createElement('div');
  d.className = cls;
  Object.assign(d.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }, extra || {});
  return d;
}

function renderOverlay() {
  overlay.textContent = '';
  const px = 1 / zoom;
  if (showGuides) {
    overlay.appendChild(box('marginbox', MARGIN.l, MARGIN.t, MARGIN.r - MARGIN.l, MARGIN.b - MARGIN.t,
      { borderWidth: px + 'px' }));
  }
  const h = hoverId && hoverId !== selId ? getEl(hoverId) : null;
  if (h && !h.hidden) overlay.appendChild(box('hoverbox', h.x, h.y, h.w, h.h, { borderWidth: px + 'px' }));

  const el = selected();
  if (el && !el.hidden) {
    if (cropMode && el.type === 'image' && resolveSrc(el.src)) {
      const g = document.createElement('img');
      g.className = 'ghost';
      g.src = resolveSrc(el.src);
      Object.assign(g.style, {
        left: el.x + el.ix + 'px', top: el.y + el.iy + 'px',
        width: el.iw + 'px', height: el.iw * el.nh / el.nw + 'px',
      });
      overlay.appendChild(g);
      overlay.appendChild(box('cropframe', el.x, el.y, el.w, el.h, { borderWidth: 2 * px + 'px' }));
    } else {
      const sb = box('selbox' + (el.locked ? ' locked' : ''), el.x, el.y, el.w, el.h, { borderWidth: 1.5 * px + 'px' });
      overlay.appendChild(sb);
      if (!el.locked && editingId !== el.id) {
        const s = 9 * px;
        const pts = {
          nw: [0, 0], n: [0.5, 0], ne: [1, 0], e: [1, 0.5],
          se: [1, 1], s: [0.5, 1], sw: [0, 1], w: [0, 0.5],
        };
        for (const [k, [fx, fy]] of Object.entries(pts)) {
          const hd = box('handle ' + k, el.x + el.w * fx - s / 2, el.y + el.h * fy - s / 2, s, s,
            { borderWidth: px + 'px' });
          hd.dataset.handle = k;
          overlay.appendChild(hd);
        }
      }
    }
    if (drag && (drag.kind === 'move' || drag.kind === 'resize')) {
      const d = document.createElement('div');
      d.className = 'dims';
      d.textContent = drag.kind === 'move'
        ? `x ${fmt(el.x)}  y ${fmt(el.y)}`
        : `${fmt(el.w)} × ${fmt(el.h)} pt`;
      Object.assign(d.style, { left: el.x + 'px', top: el.y + el.h + 6 * px + 'px', transform: `scale(${px})` });
      overlay.appendChild(d);
    }
  }
  for (const g of guides) {
    if (g.axis === 'x') overlay.appendChild(box('guide', g.v - px / 2, 0, px, PAGE_H));
    else overlay.appendChild(box('guide', 0, g.v - px / 2, PAGE_W, px));
  }
}

function fmt(v) { return (Math.round(v * 10) / 10).toString().replace('.', ','); }

/* ---------- interação com o mouse ---------- */

function toPt(e) {
  const r = pageDiv.getBoundingClientRect();
  return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
}

function elAt(e) {
  const n = e.target.closest && e.target.closest('#page .el');
  return n ? getEl(n.dataset.id) : null;
}

function snapTargets(excludeId) {
  const xs = [MARGIN.l, MARGIN.r, PAGE_W / 2];
  const ys = [MARGIN.t, MARGIN.b, PAGE_H / 2];
  for (const o of els()) {
    if (o.id === excludeId || o.hidden) continue;
    xs.push(o.x, o.x + o.w / 2, o.x + o.w);
    ys.push(o.y, o.y + o.h / 2, o.y + o.h);
  }
  return { xs, ys };
}

// procura o menor ajuste que encaixa alguma das bordas "edges" numa guia
function snap1(edges, targets) {
  const th = 6 / zoom;
  let best = null;
  for (const e of edges) {
    for (const t of targets) {
      const d = t - e;
      if (Math.abs(d) <= th && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, v: t };
    }
  }
  return best;
}

viewport.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  const hd = e.target.dataset && e.target.dataset.handle;
  const el = selected();
  if (hd && el) {
    e.preventDefault();
    startDrag(e, 'resize', el, hd);
    return;
  }
  if (editingId) {
    const n = nodes.get(editingId);
    if (n && n.contains(e.target)) return;   // clique dentro do texto em edição
    stopEditing();
  }
  const hit = elAt(e);
  if (cropMode && el && hit && hit.id === el.id) {
    e.preventDefault();
    startDrag(e, 'pan', el);
    return;
  }
  if (cropMode && (!hit || hit.id !== selId)) cropMode = false;
  if (!hit) {
    if (e.target === viewport || e.target === stage || e.target === pageDiv || pageDiv.contains(e.target)) {
      select(null);
    }
    return;
  }
  e.preventDefault();
  if (hit.id !== selId) select(hit.id);
  if (!hit.locked) startDrag(e, 'move', hit);
});

function startDrag(e, kind, el, handle) {
  drag = {
    kind, handle, id: el.id, p0: toPt(e),
    g0: { x: el.x, y: el.y, w: el.w, h: el.h, ix: el.ix, iy: el.iy, iw: el.iw },
    moved: false,
  };
  viewport.setPointerCapture(e.pointerId);
}

viewport.addEventListener('pointermove', (e) => {
  if (!drag) {
    const hit = elAt(e);
    const id = hit ? hit.id : null;
    if (id !== hoverId) { hoverId = id; renderOverlay(); }
    return;
  }
  const el = getEl(drag.id);
  if (!el) return;
  const p = toPt(e);
  let dx = p.x - drag.p0.x;
  let dy = p.y - drag.p0.y;
  if (!drag.moved && Math.hypot(dx, dy) * zoom < 2) return;
  drag.moved = true;
  const g = drag.g0;
  guides = [];

  if (drag.kind === 'move') {
    let nx = g.x + dx, ny = g.y + dy;
    if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) ny = g.y; else nx = g.x; }
    if (!e.altKey) {
      const T = snapTargets(el.id);
      const sx = snap1([nx, nx + g.w / 2, nx + g.w], T.xs);
      const sy = snap1([ny, ny + g.h / 2, ny + g.h], T.ys);
      if (sx) { nx += sx.d; guides.push({ axis: 'x', v: sx.v }); }
      if (sy) { ny += sy.d; guides.push({ axis: 'y', v: sy.v }); }
    }
    el.x = nx; el.y = ny;
  } else if (drag.kind === 'pan') {
    el.ix = g.ix + dx;
    el.iy = g.iy + dy;
    clampImage(el);
  } else if (drag.kind === 'resize') {
    resizeEl(el, drag.handle, dx, dy, e.shiftKey, e.altKey);
  }
  paintNode(nodes.get(el.id), el);
  renderOverlay();
  updatePanelGeom();
});

function resizeEl(el, hd, dx, dy, keepRatio, noSnap) {
  const g = drag.g0;
  const corner = hd.length === 2;
  const imgScale = el.type === 'image' && corner;     // cantos da foto: escala foto + quadro
  let x = g.x, y = g.y, w = g.w, h = g.h;
  if (hd.includes('e')) w = g.w + dx;
  if (hd.includes('w')) { w = g.w - dx; }
  if (hd.includes('s')) h = g.h + dy;
  if (hd.includes('n')) { h = g.h - dy; }

  if (!noSnap && !(imgScale || (corner && keepRatio))) {
    const T = snapTargets(el.id);
    if (hd.includes('e')) { const s = snap1([g.x + w], T.xs); if (s) { w += s.d; guides.push({ axis: 'x', v: s.v }); } }
    if (hd.includes('w')) { const s = snap1([g.x + g.w - w], T.xs); if (s) { w -= s.d; guides.push({ axis: 'x', v: s.v }); } }
    if (hd.includes('s')) { const s = snap1([g.y + h], T.ys); if (s) { h += s.d; guides.push({ axis: 'y', v: s.v }); } }
    if (hd.includes('n')) { const s = snap1([g.y + g.h - h], T.ys); if (s) { h -= s.d; guides.push({ axis: 'y', v: s.v }); } }
  }

  if (imgScale || (corner && keepRatio)) {
    const f = Math.max(w / g.w, h / g.h, 0.02);
    w = g.w * f; h = g.h * f;
  }
  w = Math.max(4, w); h = Math.max(4, h);
  if (hd.includes('w')) x = g.x + g.w - w;
  if (hd.includes('n')) y = g.y + g.h - h;
  el.x = x; el.y = y; el.w = w; el.h = h;

  if (el.type === 'image') {
    if (imgScale) {
      const f = w / g.w;
      el.iw = g.iw * f; el.ix = g.ix * f; el.iy = g.iy * f;
    } else {
      // laterais cortam: a foto fica parada na página
      el.ix = g.ix - (x - g.x);
      el.iy = g.iy - (y - g.y);
    }
  }
}

viewport.addEventListener('pointerup', () => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  guides = [];
  renderOverlay();
  if (moved) { commit(); renderPanel(); }
  Sync.applyPending();
});

viewport.addEventListener('dblclick', (e) => {
  // a captura do ponteiro faz o alvo do dblclick ser o viewport; procura o item pelo ponto
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const hit = under ? elAt({ target: under }) : null;
  if (!hit || hit.locked) return;
  if (hit.type === 'text') startEditing(hit, { x: e.clientX, y: e.clientY });
  else if (hit.type === 'image' && resolveSrc(hit.src)) {
    select(hit.id);
    cropMode = !cropMode;
    renderOverlay(); renderPanel();
    if (cropMode) toast('Reenquadrar: arraste a foto e use a rodinha do mouse para zoom. Esc para sair.');
  }
});

viewport.addEventListener('wheel', (e) => {
  const el = selected();
  if (cropMode && el && el.type === 'image') {
    e.preventDefault();
    const p = toPt(e);
    zoomImage(el, Math.exp(-e.deltaY * 0.0015), p.x - el.x, p.y - el.y);
    paintNode(nodes.get(el.id), el); renderOverlay(); updatePanelGeom();
    clearTimeout(viewport._wt); viewport._wt = setTimeout(() => { commit(); renderPanel(); }, 350);
    return;
  }
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    setZoom(zoom * Math.exp(-e.deltaY * 0.002));
  }
}, { passive: false });

viewport.addEventListener('pointerleave', () => { if (hoverId) { hoverId = null; renderOverlay(); } });

// arrastar arquivos de imagem para dentro da página
viewport.addEventListener('dragover', (e) => { e.preventDefault(); });
viewport.addEventListener('drop', async (e) => {
  e.preventDefault();
  const f = [...(e.dataTransfer.files || [])].find(x => x.type.startsWith('image/'));
  if (!f) return;
  const p = toPt(e);
  const hit = elAt(e);
  if (hit && hit.type === 'image' && !hit.locked) await replaceImage(hit, f);
  else await addImageFromFile(f, p);
});

/* ---------- fotos: zoom, preencher, encaixar ---------- */

function imgH(el) { return el.iw * el.nh / el.nw; }

function clampImage(el) {
  const ih = imgH(el);
  if (el.iw >= el.w) el.ix = Math.min(0, Math.max(el.w - el.iw, el.ix));
  if (ih >= el.h) el.iy = Math.min(0, Math.max(el.h - ih, el.iy));
}

function zoomImage(el, f, cx, cy) {
  if (cx == null) { cx = el.w / 2; cy = el.h / 2; }
  const minIw = Math.max(el.w, el.h * el.nw / el.nh) * 0.2;
  const iw = Math.max(minIw, el.iw * f);
  const k = iw / el.iw;
  el.ix = cx - (cx - el.ix) * k;
  el.iy = cy - (cy - el.iy) * k;
  el.iw = iw;
  clampImage(el);
}

function fitImage(el, mode) {
  const s = mode === 'cover' ? Math.max(el.w / el.nw, el.h / el.nh) : Math.min(el.w / el.nw, el.h / el.nh);
  el.iw = el.nw * s;
  el.ix = (el.w - el.iw) / 2;
  el.iy = (el.h - imgH(el)) / 2;
}

function effectiveDpi(el) {
  return Math.round(el.nw * (el.k || 1) / (el.iw / 72));
}

async function replaceImage(el, file) {
  const up = await Uploads.add(file, file.name);
  setImageSource(el, up.src, up.w, up.h, 1);
}

function setImageSource(el, src, nw, nh, k) {
  el.src = src; el.nw = nw; el.nh = nh; el.k = k;
  fitImage(el, 'cover');
  commit(); renderAll();
}

async function addImageFromFile(file, at) {
  const up = await Uploads.add(file, file.name);
  const w = 300;
  const h = w * up.h / up.w;
  const el = imageEl({
    src: up.src, nw: up.w, nh: up.h, w, h, iw: w,
    x: at ? at.x - w / 2 : (PAGE_W - w) / 2, y: at ? at.y - h / 2 : 150,
  });
  els().push(el);
  selId = el.id;
  commit(); renderAll();
}

/* ---------- edição de texto no lugar ---------- */

function startEditing(el, at) {
  select(el.id);
  editingId = el.id;
  const t = nodes.get(el.id).firstChild;
  t._key = null;
  t.textContent = el.text;
  try { t.contentEditable = 'plaintext-only'; } catch (e) { t.contentEditable = 'true'; }
  if (t.contentEditable !== 'plaintext-only') t.contentEditable = 'true';
  t.focus();
  // com clique: cursor no ponto clicado; sem clique (texto novo / Enter): seleciona tudo
  let r = null;
  if (at && document.caretRangeFromPoint) r = document.caretRangeFromPoint(at.x, at.y);
  else if (at && document.caretPositionFromPoint) {
    const cp = document.caretPositionFromPoint(at.x, at.y);
    if (cp) { r = document.createRange(); r.setStart(cp.offsetNode, cp.offset); }
  }
  if (!r || !t.contains(r.startContainer)) { r = document.createRange(); r.selectNodeContents(t); }
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  t.oninput = () => {
    el.text = t.innerText.replace(/\n$/, '');
    paintNode(nodes.get(el.id), el);
    const ta = $('#p-text');
    if (ta) ta.value = el.text;
    renderOverlay();
  };
  t.onkeydown = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); stopEditing(); } };
  renderOverlay();
}

function stopEditing() {
  if (!editingId) return;
  const el = getEl(editingId);
  const n = nodes.get(editingId);
  editingId = null;
  if (n) {
    const t = n.firstChild;
    t.contentEditable = 'false';
    t.oninput = null;
    t.onkeydown = null;
    t._key = null;
  }
  getSelection().removeAllRanges();
  if (el) { paintNode(n, el); commit(); }
  renderOverlay(); renderPanel();
  Sync.applyPending();
}

/* ---------- seleção e comandos ---------- */

function select(id) {
  if (editingId && editingId !== id) stopEditing();
  if (id !== selId) cropMode = false;
  selId = id;
  renderOverlay();
  renderPanel();
}

function addElement(el) {
  els().push(el);
  selId = el.id;
  commit(); renderAll();
}

function duplicateSel() {
  const el = selected();
  if (!el) return;
  const c = JSON.parse(JSON.stringify(el));
  c.id = uid(); c.x += 12; c.y += 12; c.locked = false;
  const list = els();
  list.splice(list.indexOf(el) + 1, 0, c);
  selId = c.id;
  commit(); renderAll();
}

function deleteSel() {
  const el = selected();
  if (!el) return;
  if (el.locked) { toast('Este item está travado. Destrave no painel para apagar.'); return; }
  page().elements = els().filter(e => e.id !== el.id);
  selId = null; cropMode = false;
  commit(); renderAll();
}

function moveLayer(dir) {
  const el = selected();
  if (!el) return;
  const list = els();
  const i = list.indexOf(el);
  list.splice(i, 1);
  let j = i;
  if (dir === 'up') j = Math.min(list.length, i + 1);
  if (dir === 'down') j = Math.max(0, i - 1);
  if (dir === 'top') j = list.length;
  if (dir === 'bottom') j = 0;
  list.splice(j, 0, el);
  commit(); renderAll();
}

function nudge(dx, dy) {
  const el = selected();
  if (!el || el.locked) return;
  if (cropMode && el.type === 'image') { el.ix += dx; el.iy += dy; }
  else { el.x += dx; el.y += dy; }
  paintNode(nodes.get(el.id), el); renderOverlay(); updatePanelGeom();
  clearTimeout(nudge._t); nudge._t = setTimeout(commit, 400);
}

document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); return; }
  if (typing) return;
  if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSel(); return; }
  if (mod && e.key.toLowerCase() === 'c') { const el = selected(); if (el) clipboard = JSON.stringify(el); return; }
  if (mod && e.key.toLowerCase() === 'v' && clipboard) {
    e.preventDefault();
    const c = JSON.parse(clipboard); c.id = uid(); c.x += 12; c.y += 12; c.locked = false;
    addElement(c); return;
  }
  if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom(zoom * 1.2); return; }
  if (mod && e.key === '-') { e.preventDefault(); setZoom(zoom / 1.2); return; }
  if (mod && e.key === '0') { e.preventDefault(); zoomFit(); return; }
  const step = e.shiftKey ? 10 : 1;
  switch (e.key) {
    case 'Delete': case 'Backspace': e.preventDefault(); deleteSel(); break;
    case 'Escape': if (cropMode) { cropMode = false; renderOverlay(); renderPanel(); } else select(null); break;
    case 'ArrowLeft': e.preventDefault(); nudge(-step, 0); break;
    case 'ArrowRight': e.preventDefault(); nudge(step, 0); break;
    case 'ArrowUp': e.preventDefault(); nudge(0, -step); break;
    case 'ArrowDown': e.preventDefault(); nudge(0, step); break;
    case 'Enter': { const el = selected(); if (el && el.type === 'text' && !el.locked) { e.preventDefault(); startEditing(el); } break; }
  }
});

/* ---------- painel de propriedades ---------- */

const SWATCHES = [COLORS.laranja, COLORS.laranjaFaixa, COLORS.verde, COLORS.texto, COLORS.preto, COLORS.branco, COLORS.cinzaSelo, '#1f3c88', '#ffd200'];

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function num(id, label, v, step = 0.5) {
  return `<label>${label}<input type="number" step="${step}" data-prop="${id}" value="${Math.round(v * 100) / 100}"></label>`;
}

function colorRow(label, prop, v, allowNone) {
  const none = allowNone ? `<label class="check"><input type="checkbox" data-none="${prop}" ${v ? '' : 'checked'}> sem</label>` : '';
  const sw = SWATCHES.map(c => `<button class="swatch" title="${c}" style="background:${c}" data-swatch="${prop}" data-c="${c}"></button>`).join('');
  return `<div class="row"><label>${label}</label><input type="color" data-prop="${prop}" value="${v || '#ffffff'}">${none}</div>
    <div class="row"><label></label><div class="swatches">${sw}</div></div>`;
}

function elName(el) {
  if (el.name) return el.name;
  if (el.type === 'text') return 'Texto: ' + el.text.replace(/\*\*/g, '').slice(0, 26);
  if (el.type === 'image') return 'Imagem';
  return 'Retângulo';
}

function layersHtml() {
  const list = els().slice().reverse();
  return `<div class="layers">${list.map(el => `
    <div class="layer ${el.id === selId ? 'sel' : ''}" data-layer="${el.id}">
      <span class="nm">${esc(elName(el))}</span>
      <button data-vis="${el.id}" class="${el.hidden ? '' : 'on'}" title="Mostrar/ocultar">${el.hidden ? '◌' : '●'}</button>
      <button data-lock="${el.id}" class="${el.locked ? 'on' : ''}" title="Travar/destravar">${el.locked ? '🔒' : '🔓'}</button>
    </div>`).join('') || '<div class="layer muted">Página vazia</div>'}</div>`;
}

function renderPanel() {
  const el = selected();
  let h = '';
  if (!el) {
    h += `<h3>Página</h3>
      <div class="row"><label>Nome</label><input type="text" id="p-pagename" value="${esc(page().name)}"></div>
      <p class="muted">Tamanho: ${fmt(PAGE_W)} × ${fmt(PAGE_H)} pt (≈ 27,2 × 38 cm), margens de 56,7 pt.</p>
      <p class="muted">Clique em qualquer item da página para editar. Use a lista abaixo para pegar itens que estão por baixo de outros.</p>
      ${templateNotice()}
      <h4>Camadas (de cima para baixo)</h4>${layersHtml()}
      ${Sync.online ? `<h4>Segurança</h4>
      <div class="btnrow"><button data-act="page-history" title="Cópias guardadas antes de cada alteração">Histórico desta página</button>
        <button data-act="pages-deleted">Páginas apagadas</button></div>` : ''}
      ${!Sync.online || Sync.edition === TEMPLATE_EDITION ? '<hr><button class="danger" data-act="reset">Restaurar modelo original</button>' : ''}`;
    panel.innerHTML = h;
    return;
  }
  const typeLabel = { text: 'Texto', image: 'Imagem', rect: 'Retângulo' }[el.type];
  h += `<h3>${typeLabel}${el.locked ? ' · travado' : ''}</h3>
    <div class="row"><label>Nome</label><input type="text" data-prop="name" value="${esc(el.name || '')}" placeholder="${esc(elName(el))}"></div>
    <div class="grid4" id="geom">${num('x', 'X', el.x)}${num('y', 'Y', el.y)}${num('w', 'Larg.', el.w)}${num('h', 'Alt.', el.h)}</div>`;

  if (el.type === 'text') {
    const fontOpts = Object.entries(FONTS).map(([k, f]) => `<option value="${k}" ${k === el.font ? 'selected' : ''}>${f.label}</option>`).join('');
    const al = (a, t) => `<button data-align="${a}" class="${el.align === a ? 'on' : ''}">${t}</button>`;
    h += `<h4>Conteúdo</h4>
      <textarea id="p-text" data-prop="text">${esc(el.text)}</textarea>
      <p class="muted">Enter quebra a linha. <code>**palavras**</code> ficam em negrito.</p>
      <h4>Tipografia</h4>
      <div class="row"><label>Fonte</label><select data-prop="font">${fontOpts}</select></div>
      <div class="grid4">${num('size', 'Corpo', el.size, 0.5)}${num('lh', 'Entrelinha', el.lh, 0.5)}
        <label>&nbsp;<button data-act="size-down" title="Diminuir texto">A−</button></label>
        <label>&nbsp;<button data-act="size-up" title="Aumentar texto">A+</button></label></div>
      <div class="btnrow">${al('left', '⯇ Esq.')}${al('center', 'Centro')}${al('right', 'Dir. ⯈')}${al('justify', 'Justif.')}</div>
      ${colorRow('Cor', 'color', el.color)}
      <h4>Caixa</h4>
      ${colorRow('Fundo', 'bg', el.bg, true)}
      <div class="grid4">${num('padT', 'Topo', el.padT)}${num('padR', 'Dir.', el.padR)}${num('padB', 'Base', el.padB)}${num('padL', 'Esq.', el.padL)}</div>
      <div class="btnrow"><button data-act="fit-height">Ajustar altura ao texto</button></div>`;
  } else if (el.type === 'image') {
    const has = !!resolveSrc(el.src);
    h += `<h4>Foto</h4>
      <div class="btnrow"><button data-act="replace-image">Trocar por arquivo…</button></div>`;
    if (has) {
      const dpi = effectiveDpi(el);
      const zoomPct = Math.round(el.iw / Math.max(el.w / el.nw, el.h / el.nh) / el.nw * 100);
      h += `<div class="btnrow"><button data-act="crop" class="${cropMode ? 'on' : ''}">${cropMode ? 'Concluir reenquadre' : 'Reenquadrar'}</button>
        <button data-act="fit-cover" title="A foto preenche todo o quadro">Preencher</button>
        <button data-act="fit-contain" title="A foto inteira aparece no quadro">Encaixar</button></div>
        <div class="row"><label>Zoom da foto</label><input type="range" id="p-izoom" min="20" max="400" value="${zoomPct}"></div>
        <div class="btnrow"><button data-act="frame-to-image" title="Ajusta o quadro à proporção da foto">Quadro na proporção da foto</button></div>
        <p class="${dpi < 150 ? 'warn' : 'ok'}">Resolução efetiva: ${dpi} dpi ${dpi < 150 ? '— baixa para impressão (ideal: 200+)' : '— boa para impressão'}</p>`;
    }
    const ups = Sync.online
      ? Sync.uploads.map(u => ({ src: u.src, name: u.name, nw: 0, nh: 0, k: 1 }))
      : Object.entries(Uploads.meta).map(([id, m]) => ({ src: 'idb:' + id, name: m.name, nw: m.w, nh: m.h, k: 1 }));
    const gal = ASSETS.concat(ups).filter(a => a.src !== 'assets/cabecalho.png' || el.src === a.src);
    h += `<h4>Imagens do projeto</h4><div class="gallery">${gal.map((a, i) =>
      `<img src="${esc(resolveSrc(a.src))}" title="${esc(a.name)}" data-gal="${i}" loading="lazy">`).join('')}</div>`;
    panel._gallery = gal;
  } else if (el.type === 'rect') {
    h += `<h4>Aparência</h4>${colorRow('Preench.', 'fill', el.fill, true)}${colorRow('Contorno', 'stroke', el.stroke)}
      <div class="grid4">${num('sw', 'Espessura', el.sw, 0.25)}</div>`;
  }
  h += `<div class="row"><label>Opacidade</label><input type="range" min="0" max="100" data-prop="opacity" value="${el.opacity ?? 100}"></div>
    <h4>Organizar</h4>
    <div class="btnrow"><button data-act="layer-top" title="Trazer para a frente de tudo">⤒ Frente</button><button data-act="layer-up">↑ Subir</button>
      <button data-act="layer-down">↓ Descer</button><button data-act="layer-bottom" title="Mandar para trás de tudo">⤓ Fundo</button></div>
    <div class="btnrow"><button data-act="align-hcenter" title="Centralizar na página">Centralizar</button><button data-act="align-margins" title="Ocupar a largura entre as margens">Largura total</button></div>
    <div class="btnrow"><button data-act="duplicate">Duplicar</button><button data-act="toggle-lock">${el.locked ? 'Destravar' : 'Travar'}</button>
      <button data-act="delete" class="danger">Apagar</button></div>
    <h4>Camadas</h4>${layersHtml()}`;
  panel.innerHTML = h;
}

function templateNotice() {
  const p = page();
  if (!templateFor(p.tid)) return '';
  if (hasTemplateUpdate(p)) {
    return `<div class="notice"><b>Há uma versão nova desta página no modelo.</b>
      <p>Ela substitui esta página; a sua versão atual fica guardada logo abaixo, como cópia.</p>
      <button class="primary" data-act="page-use-template">Usar a versão nova</button></div>`;
  }
  return `<div class="btnrow"><button data-act="page-use-template" title="Volta esta página ao modelo; a sua versão fica como cópia">Voltar esta página ao modelo</button></div>`;
}

function updatePanelGeom() {
  const el = selected();
  const g = $('#geom');
  if (!el || !g) return;
  for (const k of ['x', 'y', 'w', 'h']) {
    const inp = g.querySelector(`[data-prop="${k}"]`);
    if (inp && document.activeElement !== inp) inp.value = Math.round(el[k] * 100) / 100;
  }
}

panel.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'p-pagename') { page().name = t.value; renderPagesList(); return; }
  if (t.id === 'p-izoom') {
    const el = selected();
    const base = Math.max(el.w / el.nw, el.h / el.nh) * el.nw;
    zoomImage(el, (base * t.value / 100) / el.iw);
    paintNode(nodes.get(el.id), el); renderOverlay();
    return;
  }
  const prop = t.dataset.prop;
  const el = selected();
  if (!prop || !el) return;
  let v = t.value;
  if (t.type === 'number' || t.type === 'range') { v = parseFloat(v); if (isNaN(v)) return; }
  if (prop === 'bg' || prop === 'fill') {
    const none = panel.querySelector(`[data-none="${prop}"]`);
    if (none) none.checked = false;
  }
  setProp(el, prop, v);
});

function setProp(el, prop, v) {
  if (el.type === 'image' && (prop === 'w' || prop === 'h')) {
    el[prop] = Math.max(4, v);
  } else {
    el[prop] = v;
  }
  paintNode(nodes.get(el.id), el);
  renderOverlay();
  if (prop === 'name') renderLayersOnly();
}

function renderLayersOnly() {
  const L = panel.querySelector('.layers');
  if (L) L.outerHTML = layersHtml();
}

panel.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'p-pagename') { commit(); return; }
  if (t.dataset.none) {
    const el = selected();
    el[t.dataset.none] = t.checked ? null : (panel.querySelector(`input[type=color][data-prop="${t.dataset.none}"]`).value);
    paintNode(nodes.get(el.id), el); commit();
    return;
  }
  commit();
  if (t.dataset.prop === 'font' || t.id === 'p-izoom') renderPanel();
});

panel.addEventListener('click', async (e) => {
  const b = e.target.closest('button, img, .layer');
  if (!b) return;
  const el = selected();
  if (b.dataset.swatch) {
    setProp(el, b.dataset.swatch, b.dataset.c);
    commit(); renderPanel(); return;
  }
  if (b.dataset.align) { el.align = b.dataset.align; paintNode(nodes.get(el.id), el); commit(); renderPanel(); return; }
  if (b.dataset.vis) {
    const o = getEl(b.dataset.vis); o.hidden = !o.hidden; commit(); renderAll(); return;
  }
  if (b.dataset.lock) {
    const o = getEl(b.dataset.lock); o.locked = !o.locked; commit(); renderAll(); return;
  }
  if (b.dataset.layer) { select(b.dataset.layer); return; }
  if (b.dataset.gal != null && el && el.type === 'image') {
    const a = panel._gallery[+b.dataset.gal];
    if (!a.nw) { const d = await imageSize(resolveSrc(a.src)); a.nw = d.w; a.nh = d.h; }
    setImageSource(el, a.src, a.nw, a.nh, a.k);
    return;
  }
  const act = b.dataset.act;
  if (act) await runAction(act);
});

/* ---------- ações (barra, painel e páginas) ---------- */

async function runAction(act) {
  const el = selected();
  switch (act) {
    case 'add-text': {
      const t = textEl({ x: 120, y: 120, w: 260, h: 26, text: 'Novo texto', size: 16, lh: 20 });
      addElement(t);
      startEditing(t);
      break;
    }
    case 'add-image': $('#fileImage').dataset.mode = 'add'; $('#fileImage').click(); break;
    case 'replace-image': $('#fileImage').dataset.mode = 'replace'; $('#fileImage').click(); break;
    case 'add-rect': addElement(rectEl({ x: 200, y: 200 })); break;
    case 'undo': undo(); break;
    case 'redo': redo(); break;
    case 'zoom-in': setZoom(zoom * 1.2); break;
    case 'zoom-out': setZoom(zoom / 1.2); break;
    case 'zoom-fit': zoomFit(); break;
    case 'size-down': case 'size-up': {
      const f = act === 'size-up' ? 1.06 : 1 / 1.06;
      el.size = Math.round(el.size * f * 10) / 10;
      el.lh = Math.round(el.lh * f * 10) / 10;
      paintNode(nodes.get(el.id), el); commit(); renderPanel(); renderOverlay();
      break;
    }
    case 'fit-height': {
      const t = nodes.get(el.id).firstChild;
      el.h = Math.ceil((t.offsetHeight + el.padT + el.padB) * 10) / 10;
      commit(); renderAll();
      break;
    }
    case 'crop': cropMode = !cropMode; renderOverlay(); renderPanel(); break;
    case 'fit-cover': fitImage(el, 'cover'); commit(); renderAll(); break;
    case 'fit-contain': fitImage(el, 'contain'); commit(); renderAll(); break;
    case 'frame-to-image': {
      // mantém a largura e acerta a altura do quadro na proporção da foto
      el.h = el.w * el.nh / el.nw;
      el.iw = el.w; el.ix = 0; el.iy = 0;
      commit(); renderAll();
      break;
    }
    case 'layer-top': moveLayer('top'); break;
    case 'layer-up': moveLayer('up'); break;
    case 'layer-down': moveLayer('down'); break;
    case 'layer-bottom': moveLayer('bottom'); break;
    case 'align-hcenter': el.x = (PAGE_W - el.w) / 2; commit(); renderAll(); break;
    case 'align-margins': {
      const f = (MARGIN.r - MARGIN.l) / el.w;
      if (el.type === 'image') { el.iw *= f; el.ix *= f; el.iy *= f; el.h *= f; }
      el.x = MARGIN.l; el.w = MARGIN.r - MARGIN.l;
      commit(); renderAll();
      break;
    }
    case 'duplicate': duplicateSel(); break;
    case 'toggle-lock': el.locked = !el.locked; commit(); renderAll(); break;
    case 'delete': deleteSel(); break;
    case 'page-history': Sync.showHistory(); break;
    case 'pages-deleted': Sync.showDeleted(); break;
    case 'reset':
      if (confirm(Sync.online
        ? 'Voltar TODAS as páginas ao modelo original, para todo mundo que usa o editor? As versões atuais ficam no histórico de cada página.'
        : 'Voltar todas as páginas ao modelo original? O que foi feito será perdido (dá para desfazer com Ctrl+Z).')) {
        state = defaultState(); selId = null; commit(); renderAll(); zoomFit();
      }
      break;
    case 'page-materia': addPage(templateMateria()); break;
    case 'page-capa': addPage(templateCapa()); break;
    case 'page-branco': addPage(templateBranco()); break;
    case 'page-use-template': useTemplateVersion(); break;
    case 'save-project': await saveProject(); break;
    case 'open-project': $('#fileProject').click(); break;
    case 'export-pdf': await exportPDF(); break;
    case 'export-png': await exportPNG(); break;
  }
}

$('#toolbar').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (b) runAction(b.dataset.act);
});
$('#pagesPanel').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (b) runAction(b.dataset.act);
});
$('#guidesToggle').addEventListener('change', (e) => { showGuides = e.target.checked; renderOverlay(); });

$('#fileImage').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  const el = selected();
  if (e.target.dataset.mode === 'replace' && el && el.type === 'image') await replaceImage(el, f);
  else await addImageFromFile(f);
});

/* ---------- páginas ---------- */

function addPage(p) {
  state.pages.splice(state.cur + 1, 0, p);
  state.cur += 1;
  selId = null;
  commit(); renderAll();
}

function renderPagesList() {
  $('#pagesList').innerHTML = state.pages.map((p, i) => `
    <div class="pageItem ${i === state.cur ? 'cur' : ''}" data-page="${i}">
      <span class="num">${i + 1}</span><span class="nm">${esc(p.name)}</span>${hasTemplateUpdate(p) ? '<span class="badge" title="Há uma versão nova desta página no modelo">●</span>' : ''}${
        Sync.others.filter(o => o.page === p.id).map(o => `<span class="who sm" title="${esc(o.name)} está aqui">${esc(initials(o.name))}</span>`).join('')}
      <button data-pmove="${i}:-1" title="Subir">↑</button><button data-pmove="${i}:1" title="Descer">↓</button>
      <button data-pdup="${i}" title="Duplicar página">⧉</button><button data-pdel="${i}" title="Apagar página">✕</button>
    </div>`).join('');
  Sync.track();
}

$('#pagesList').addEventListener('click', (e) => {
  const t = e.target;
  if (t.dataset.pmove) {
    const [i, d] = t.dataset.pmove.split(':').map(Number);
    const j = i + d;
    if (j < 0 || j >= state.pages.length) return;
    const [p] = state.pages.splice(i, 1);
    state.pages.splice(j, 0, p);
    if (state.cur === i) state.cur = j; else if (state.cur === j) state.cur = i;
    commit(); renderPagesList();
    return;
  }
  if (t.dataset.pdup) {
    const i = +t.dataset.pdup;
    const c = JSON.parse(JSON.stringify(state.pages[i]));
    c.id = uid(); c.name += ' (cópia)'; delete c.tid;
    c.elements.forEach(x => { x.id = uid(); });
    state.pages.splice(i + 1, 0, c);
    state.cur = i + 1; selId = null;
    commit(); renderAll();
    return;
  }
  if (t.dataset.pdel) {
    const i = +t.dataset.pdel;
    if (state.pages.length === 1) { toast('O jornal precisa de pelo menos uma página.'); return; }
    if (!confirm(`Apagar a página ${i + 1} (${state.pages[i].name})?`)) return;
    state.pages.splice(i, 1);
    state.cur = Math.min(state.cur, state.pages.length - 1);
    selId = null;
    commit(); renderAll();
    return;
  }
  const it = t.closest('.pageItem');
  if (it) {
    const i = +it.dataset.page;
    if (i === state.cur) return;
    if (editingId) stopEditing();
    state.cur = i; selId = null; cropMode = false;
    hist.last = JSON.stringify(state); persist();
    renderAll();
  }
});

/* ---------- salvar / abrir projeto ---------- */

function blobToDataURL(b) {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

async function saveProject() {
  const used = new Set();
  state.pages.forEach(p => p.elements.forEach(e => { if (e.type === 'image' && e.src && e.src.startsWith('idb:')) used.add(e.src.slice(4)); }));
  const uploads = {};
  for (const id of used) {
    if (!Uploads.urls[id]) continue;
    uploads[id] = { ...Uploads.meta[id], data: await blobToDataURL(await Uploads.blob(id)) };
  }
  const data = { format: 'tep-editor', version: 1, savedAt: new Date().toISOString(), state, uploads };
  download(new Blob([JSON.stringify(data)], { type: 'application/json' }), `${fileTag()}_projeto_${stamp()}.json`);
  toast('Projeto salvo. Use "Abrir" para continuar de onde parou.');
}

$('#fileProject').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (data.format !== 'tep-editor' || !data.state) throw new Error('formato');
    if (Sync.online && !confirm('Abrir este projeto substitui o jornal compartilhado para todo mundo. As páginas atuais ficam em "Páginas apagadas". Continuar?')) return;
    const remap = {};
    for (const [id, u] of Object.entries(data.uploads || {})) {
      const blob = await (await fetch(u.data)).blob();
      const up = await Uploads.add(blob, u.name || 'imagem');
      remap['idb:' + id] = up.src;
    }
    data.state.pages.forEach(p => p.elements.forEach(el => { if (remap[el.src]) el.src = remap[el.src]; }));
    state = data.state;
    state.cur = Math.min(state.cur || 0, state.pages.length - 1);
    selId = null;
    commit(); renderAll(); zoomFit();
    toast('Projeto aberto.');
  } catch (err) {
    toast('Não consegui abrir esse arquivo. Ele precisa ser um projeto salvo por este editor.');
  }
});

function stamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

/* ---------- inicialização ---------- */

function renderAll() {
  applyZoom();
  renderPage();
  renderOverlay();
  renderPanel();
  renderPagesList();
}

window.addEventListener('resize', () => { if (window._autoFit) zoomFit(); });

(async function init() {
  await Uploads.open();
  await Uploads.loadAll();
  const shared = await Sync.init();
  if (shared) {
    state = shared.state;
    if (shared.changed.length) setTimeout(() => toast('Página nova ou atualizada no modelo: ' + shared.changed.join(', ') + '.', 6000), 800);
  } else {
    state = loadState();
    Sync.setStatus('offline');
  }
  hist.last = JSON.stringify(state);
  await loadFonts();
  renderAll();
  if (shared) {
    Sync.connect();
    renderEditions();
    Sync.schedule();                 // grava páginas novas do modelo, se houver (não espera o nome)
    await Sync.askName();
    Sync.offerLocalImport();
  }
  zoomFit();
  window._autoFit = true;
  viewport.addEventListener('pointerdown', () => { window._autoFit = false; }, { once: true });
})();
