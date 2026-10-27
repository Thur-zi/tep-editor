// Jornal compartilhado: cada página é uma linha na tabela "pages" do Supabase.
// O editor continua trabalhando com o objeto "state" local; aqui ele é salvo, recebe as mudanças
// dos outros ao vivo e, quando duas pessoas mexem na mesma página, as mudanças são juntadas item por item.
'use strict';

const NAME_KEY = 'tep-editor:nome';
const EDITION_KEY = 'tep-editor:edicao';
const TEMPLATE_EDITION = 'ed-107';   // edição que recebe as páginas do modelo (js/template.js)

const Sync = {
  db: null,
  online: false,
  rows: new Map(),      // id da página -> { rev, json (canônico), position, deleted } como está no servidor
  pending: new Map(),   // mudanças remotas que chegaram durante um arrasto ou edição de texto
  timer: null,
  flushing: false,
  again: false,
  channel: null,
  clientId: Math.random().toString(36).slice(2, 10),
  name: '',
  others: [],
  uploads: [],
  trackedPage: null,
  edition: null,        // id da edição aberta
  editions: [],         // [{id, name, created_at}]
};

// Nome da edição para usar em arquivos baixados ("Nº 107 · Novembro 2026" -> "TEP_107_Novembro_2026")
function fileTag() {
  const n = editionName().replace(/^N[ºo°]\s*/, '');
  return 'TEP_' + (n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'jornal');
}

function editionName() {
  const e = Sync.editions.find(x => x.id === Sync.edition);
  return e ? e.name : '';
}

function pageData(p) {
  return { name: p.name, tid: p.tid || null, tver: p.tver || null, tsig: p.tsig || null, elements: p.elements || [] };
}

function pageFromData(id, d) {
  const p = { id, name: d.name || 'Página', elements: d.elements || [] };
  if (d.tid) p.tid = d.tid;
  if (d.tver) p.tver = d.tver;
  if (d.tsig) p.tsig = d.tsig;
  return p;
}

// Junta três versões de uma página: a que foi carregada (base), a desta pessoa (local) e a do servidor (remota).
// Item alterado aqui fica com a versão daqui; item alterado só lá fica com a de lá.
function mergePage(base, local, remote) {
  if (!base) return local;
  const out = {};
  for (const k of ['name', 'tid', 'tver', 'tsig']) {
    out[k] = canon(local[k]) !== canon(base[k]) ? local[k] : remote[k];
  }
  const B = new Map(base.elements.map(e => [e.id, e]));
  const L = new Map(local.elements.map(e => [e.id, e]));
  const R = new Map(remote.elements.map(e => [e.id, e]));
  const changedHere = (id) => !B.has(id) || canon(L.get(id)) !== canon(B.get(id));
  const changedThere = (id) => !B.has(id) || canon(R.get(id)) !== canon(B.get(id));
  const keep = new Map();
  for (const [id, r] of R) {
    if (L.has(id)) keep.set(id, changedHere(id) ? L.get(id) : r);
    else if (!B.has(id) || changedThere(id)) keep.set(id, r);        // novo lá, ou apagado aqui mas alterado lá
  }
  for (const [id, l] of L) {
    if (R.has(id)) continue;
    if (!B.has(id) || changedHere(id)) keep.set(id, l);              // novo aqui, ou apagado lá mas alterado aqui
  }
  // ordem das camadas: se ela mudou aqui, vale a daqui; senão, a de lá. Itens que sobram vão para o fim.
  const order = (list) => list.map(e => e.id).filter(id => keep.has(id));
  const baseOrder = order(base.elements).join();
  const localOrder = order(local.elements);
  const primary = localOrder.join() !== baseOrder ? localOrder : order(remote.elements);
  const ids = primary.concat([...keep.keys()].filter(id => !primary.includes(id)));
  out.elements = ids.map(id => keep.get(id));
  return out;
}

Sync.setStatus = function (s) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  const labels = {
    saved: ['ok', '● Salvo para todos'],
    saving: ['busy', '● Salvando…'],
    error: ['err', '● Erro ao salvar, tentando de novo…'],
    offline: ['err', '● Sem conexão: salvando só neste navegador'],
  };
  const [cls, txt] = labels[s] || labels.saved;
  el.className = 'sync ' + cls;
  el.textContent = txt;
};

Sync.remember = function (row) {
  this.rows.set(row.id, {
    rev: row.rev,
    json: canon(pageData(pageFromData(row.id, row.data))),
    position: row.position,
    deleted: row.deleted,
  });
};

Sync.init = async function () {
  if (!window.supabase || typeof SUPABASE_URL === 'undefined') return null;
  try {
    this.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });
    const edRes = await this.db.from('editions').select('*').order('created_at');
    if (edRes.error) throw edRes.error;
    this.editions = edRes.data;
    let wanted = new URLSearchParams(location.search).get('ed');
    if (!wanted) { try { wanted = localStorage.getItem(EDITION_KEY); } catch (e) { /* sem armazenamento */ } }
    this.edition = (this.editions.find(e => e.id === wanted) || this.editions[this.editions.length - 1] || { id: TEMPLATE_EDITION }).id;
    try { localStorage.setItem(EDITION_KEY, this.edition); } catch (e) { /* sem armazenamento */ }
    const pagesRes = await this.db.from('pages').select('*').eq('edition_id', this.edition).order('position');
    if (pagesRes.error) throw pagesRes.error;
    this.online = true;
    // páginas do modelo já entregues = as que existem no banco, inclusive as apagadas (essas não voltam)
    const s = { version: 1, cur: 0, pages: [], seenTids: [] };
    for (const r of pagesRes.data) {
      this.remember(r);
      if (r.data && r.data.tid) s.seenTids.push(r.data.tid);
      if (!r.deleted) s.pages.push(pageFromData(r.id, r.data));
    }
    // só a edição do modelo recebe páginas novas/atualizadas de js/template.js
    const changed = this.edition === TEMPLATE_EDITION ? addNewTemplatePages(s).concat(autoUpdateUntouched(s)) : [];
    if (!s.pages.length) s.pages.push(templateBranco());
    s.cur = Math.max(0, Math.min(s.cur || 0, s.pages.length - 1));
    this.listUploads();
    return { state: s, changed };
  } catch (e) {
    console.warn('Sem banco compartilhado:', e);
    this.online = false;
    return null;
  }
};

// Liga o "ao vivo": mudanças de páginas e quem está online.
Sync.connect = function () {
  if (!this.online) return;
  this.channel = this.db.channel('tep', { config: { presence: { key: this.clientId } } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pages', filter: `edition_id=eq.${this.edition}` },
      (pl) => this.onRemote(pl.new))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'editions' }, (pl) => this.onEdition(pl.new))
    .on('presence', { event: 'sync' }, () => this.onPresence())
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') { this.trackedPage = null; this.track(); this.catchUp(); }
    });
  // rede de segurança: confere a cada 20 s se alguma mudança passou sem aviso (ex.: queda de internet)
  setInterval(() => { if (!document.hidden) this.catchUp(); }, 20000);
  this.setStatus('saved');
};

// Busca no banco o que mudou desde a última versão conhecida de cada página.
Sync.catchUp = async function () {
  if (!this.online || this.flushing) return;
  const { data, error } = await this.db.from('pages').select('id, rev').eq('edition_id', this.edition);
  if (error || !data) return;
  const stale = data.filter(r => { const k = this.rows.get(r.id); return !k || r.rev > k.rev; }).map(r => r.id);
  if (!stale.length) return;
  const full = await this.db.from('pages').select('*').in('id', stale);
  if (full.error) return;
  full.data.forEach(r => this.onRemote(r));
};

Sync.setName = function (name) {
  this.name = name;
  this.trackedPage = null;
  this.track();
};

Sync.schedule = function () {
  if (!this.online) return;
  clearTimeout(this.timer);
  this.timer = setTimeout(() => this.flush(), 500);
};

Sync.flush = async function () {
  if (!this.online) return;
  if (this.flushing) { this.again = true; return; }
  this.flushing = true;
  let failed = false;
  try {
    const ids = new Set(state.pages.map(p => p.id));
    for (let i = 0; i < state.pages.length; i++) {
      if (this.dirty(state.pages[i], i)) { this.setStatus('saving'); await this.pushPage(state.pages[i].id); }
    }
    for (const [id, r] of this.rows) {
      if (!r.deleted && !ids.has(id)) { this.setStatus('saving'); await this.pushDelete(id); }
    }
  } catch (e) {
    console.error(e);
    failed = true;
    this.setStatus('error');
    setTimeout(() => this.schedule(), 4000);
  }
  this.flushing = false;
  if (!failed) this.setStatus('saved');
  if (this.again) { this.again = false; this.flush(); }
};

Sync.dirty = function (p, pos) {
  const known = this.rows.get(p.id);
  return !known || known.deleted || known.position !== pos || known.json !== canon(pageData(p));
};

Sync.pushPage = async function (id, tries = 0) {
  const pos = state.pages.findIndex(p => p.id === id);
  if (pos < 0) return;
  const p = state.pages[pos];
  const known = this.rows.get(id);
  const body = { position: pos, data: pageData(p), deleted: false, updated_by: this.name, edition_id: this.edition };
  let res;
  if (!known) {
    res = await this.db.from('pages').insert(Object.assign({ id }, body)).select();
    if (res.error && res.error.code !== '23505') throw res.error;   // 23505: outra pessoa criou a mesma página
  } else {
    res = await this.db.from('pages').update(body).eq('id', id).eq('rev', known.rev).select();
    if (res.error) throw res.error;
  }
  if (res.data && res.data.length) { this.remember(res.data[0]); return; }
  if (tries > 3) throw new Error('conflito persistente na página ' + p.name);
  await this.resolveConflict(id);
  await this.pushPage(id, tries + 1);
};

// Alguém salvou esta página antes: junta as duas versões e tenta de novo.
Sync.resolveConflict = async function (id) {
  const { data: row, error } = await this.db.from('pages').select('*').eq('id', id).single();
  if (error) throw error;
  const known = this.rows.get(id);
  const p = state.pages.find(x => x.id === id);
  const base = known ? JSON.parse(known.json) : null;
  const merged = mergePage(base, pageData(p), pageData(pageFromData(id, row.data)));
  this.remember(row);
  this.replaceLocal(id, merged);
};

Sync.pushDelete = async function (id) {
  const { data, error } = await this.db.from('pages')
    .update({ deleted: true, updated_by: this.name }).eq('id', id).select();
  if (error) throw error;
  if (data && data.length) this.remember(data[0]);
};

Sync.replaceLocal = function (id, data) {
  const i = state.pages.findIndex(p => p.id === id);
  if (i < 0) return;
  state.pages[i] = pageFromData(id, data);
  this.afterRemote(i === state.cur);
};

/* ---------- mudanças que chegam dos outros ---------- */

Sync.onRemote = function (row) {
  if (!row || !row.id) return;
  if (!row.data) {                                                    // aviso sem o conteúdo: busca a página inteira
    this.db.from('pages').select('*').eq('id', row.id).single().then(r => { if (r.data && r.data.data) this.onRemote(r.data); });
    return;
  }
  const known = this.rows.get(row.id);
  if (known && row.rev <= known.rev) return;                          // eco do próprio salvamento
  const local = state.pages.find(p => p.id === row.id);
  if (local && !row.deleted && canon(pageData(pageFromData(row.id, row.data))) === canon(pageData(local))) {
    this.remember(row);                                               // igual ao que já temos: só anota a versão
    return;
  }
  if (drag || editingId) { this.pending.set(row.id, row); return; }
  this.applyRemote(row);
};

Sync.applyPending = function () {
  if (!this.pending.size) return;
  const rows = [...this.pending.values()];
  this.pending.clear();
  rows.forEach(r => this.onRemote(r));
};

Sync.applyRemote = function (row) {
  const known = this.rows.get(row.id);
  const idx = state.pages.findIndex(p => p.id === row.id);
  const curId = page() && page().id;
  let pushBack = false;
  if (row.deleted) {
    if (idx >= 0) {
      const local = state.pages[idx];
      const hasLocal = known && canon(pageData(local)) !== known.json;
      if (hasLocal) pushBack = true;                                   // estava editando: a página volta
      else {
        state.pages.splice(idx, 1);
        if (row.id === curId) toast(`A página "${local.name}" foi apagada por ${row.updated_by || 'outra pessoa'}. Dá para recuperar em "Páginas apagadas".`, 6000);
      }
    }
  } else if (idx < 0) {
    state.pages.push(pageFromData(row.id, row.data));
  } else {
    const local = state.pages[idx];
    const localData = pageData(local);
    let data = row.data;
    if (known && canon(localData) !== known.json) {
      data = mergePage(JSON.parse(known.json), localData, pageData(pageFromData(row.id, row.data)));
      pushBack = true;
    }
    state.pages[idx] = pageFromData(row.id, data);
  }
  this.remember(row);
  // ordem das páginas segue a posição no servidor (páginas novas daqui ficam onde estão)
  const pos = (p, i) => (this.rows.has(p.id) ? this.rows.get(p.id).position : i);
  state.pages = state.pages.map((p, i) => [p, pos(p, i), i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(x => x[0]);
  if (!state.pages.length) state.pages.push(templateBranco());
  const ci = state.pages.findIndex(p => p.id === curId);
  state.cur = ci >= 0 ? ci : Math.min(state.cur, state.pages.length - 1);
  this.afterRemote(true);
  if (pushBack) this.schedule();
};

// Depois de uma mudança remota: redesenha sem atrapalhar quem está digitando no painel,
// e zera o desfazer (para o Ctrl+Z não desfazer o trabalho dos outros).
Sync.afterRemote = function (redraw) {
  if (selId && !els().some(e => e.id === selId)) { selId = null; cropMode = false; }
  hist.past = []; hist.future = []; hist.last = JSON.stringify(state);
  if (!redraw) return;
  renderPage();
  renderOverlay();
  renderPagesList();
  if (!panel.contains(document.activeElement)) renderPanel();
};

/* ---------- edições (cada TEP) ---------- */

Sync.onEdition = function (row) {
  if (!row || !row.id) return;
  const i = this.editions.findIndex(e => e.id === row.id);
  if (i >= 0) this.editions[i] = row; else this.editions.push(row);
  renderEditions();
};

Sync.openEdition = async function (id) {
  if (id === this.edition) return;
  clearTimeout(this.timer);
  await this.flush();                      // termina de salvar a edição atual antes de trocar
  try { localStorage.setItem(EDITION_KEY, id); } catch (e) { /* sem armazenamento */ }
  const u = new URL(location.href);
  u.searchParams.set('ed', id);
  location.href = u.toString();
};

Sync.createEdition = async function (name, pages) {
  const id = 'ed-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const ed = await this.db.from('editions').insert({ id, name, created_by: this.name }).select();
  if (ed.error) throw ed.error;
  const rows = pages.map((p, i) => ({ id: uid() + uid(), position: i, data: pageData(p), edition_id: id, updated_by: this.name }));
  const res = await this.db.from('pages').insert(rows);
  if (res.error) throw res.error;
  return id;
};

Sync.renameEdition = async function (name) {
  const { data, error } = await this.db.from('editions').update({ name }).eq('id', this.edition).select();
  if (error || !data.length) throw error || new Error('sem permissão');
  this.onEdition(data[0]);
};

// Páginas de outra edição, prontas para copiar (ids novos, sem vínculo com o modelo)
Sync.copyPagesFrom = async function (editionId) {
  const { data, error } = await this.db.from('pages').select('*').eq('edition_id', editionId).eq('deleted', false).order('position');
  if (error) throw error;
  return data.map(r => {
    const p = JSON.parse(JSON.stringify(pageFromData(r.id, r.data)));
    delete p.tid; delete p.tver; delete p.tsig;
    p.elements.forEach(el => { el.id = uid(); });
    return p;
  });
};

/* ---------- quem está online ---------- */

Sync.track = function () {
  if (!this.channel || !state) return;
  const pid = page() && page().id;
  if (pid === this.trackedPage) return;
  this.trackedPage = pid;
  this.channel.track({ name: this.name, page: pid, edition: this.edition });
};

Sync.onPresence = function () {
  const st = this.channel.presenceState();
  const todos = Object.entries(st).filter(([k]) => k !== this.clientId).map(([, v]) => v[0]).filter(Boolean);
  this.others = todos.filter(o => o.edition === this.edition);
  const box = document.getElementById('presence');
  if (box) {
    box.innerHTML = this.others.map(o => {
      const i = state.pages.findIndex(p => p.id === o.page);
      return `<span class="who" title="${esc(o.name)} está na página ${i + 1}">${esc(initials(o.name))}<small>${i >= 0 ? 'p.' + (i + 1) : ''}</small></span>`;
    }).join('');
  }
  renderPagesList();
};

function initials(n) {
  const parts = String(n || '?').trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/* ---------- fotos enviadas ---------- */

Sync.upload = async function (blob, name) {
  const ext = ((blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace('svg+xml', 'svg'));
  const safe = String(name || 'foto').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'foto';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}.${ext}`;
  const { error } = await this.db.storage.from('uploads').upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;
  const url = this.db.storage.from('uploads').getPublicUrl(path).data.publicUrl;
  this.uploads.unshift({ src: url, name: name || path });
  return url;
};

Sync.listUploads = async function () {
  const { data, error } = await this.db.storage.from('uploads')
    .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
  if (error || !data) return;
  this.uploads = data.filter(f => f.id).map(f => ({
    src: this.db.storage.from('uploads').getPublicUrl(f.name).data.publicUrl,
    name: f.name.replace(/^\d+-[a-z0-9]+-/, ''),
  }));
};

/* ---------- histórico e páginas apagadas ---------- */

function openModal(html) {
  const m = document.getElementById('modal');
  document.getElementById('modalBody').innerHTML = html;
  m.hidden = false;
  return m;
}

function closeModal() { document.getElementById('modal').hidden = true; }

function when(ts) {
  return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

Sync.showHistory = async function () {
  const p = page();
  const m = openModal('<h3>Histórico desta página</h3><p class="muted">Carregando…</p>');
  const { data, error } = await this.db.from('page_history').select('id, saved_at, saved_by, data')
    .eq('page_id', p.id).order('saved_at', { ascending: false }).limit(50);
  if (error) { m.querySelector('#modalBody').innerHTML = '<p class="warn">Não consegui carregar o histórico.</p>'; return; }
  this._hist = data;
  document.getElementById('modalBody').innerHTML = `<h3>Histórico: ${esc(p.name)}</h3>
    <p class="muted">Cópias guardadas automaticamente antes de cada alteração. Restaurar troca o conteúdo atual pela cópia
    (a versão atual também fica guardada aqui).</p>
    ${data.length ? `<div class="hlist">${data.map((h, i) => `<div class="hrow"><span>${when(h.saved_at)} · ${esc(h.saved_by || 'sem nome')}
      · ${(h.data.elements || []).length} itens</span><button data-hist="${i}">Restaurar</button></div>`).join('')}</div>`
    : '<p class="muted">Ainda não há cópias anteriores desta página.</p>'}`;
};

Sync.restoreHistory = function (i) {
  const h = this._hist[i];
  const p = page();
  const d = pageFromData(p.id, h.data);
  p.name = d.name; p.elements = d.elements;
  ['tid', 'tver', 'tsig'].forEach(k => { if (d[k]) p[k] = d[k]; else delete p[k]; });
  selId = null; cropMode = false;
  commit(); renderAll(); closeModal();
  toast('Versão restaurada.');
};

Sync.showDeleted = async function () {
  openModal('<h3>Páginas apagadas</h3><p class="muted">Carregando…</p>');
  const { data, error } = await this.db.from('pages').select('id, data, updated_at, updated_by')
    .eq('deleted', true).eq('edition_id', this.edition).order('updated_at', { ascending: false }).limit(50);
  if (error) { document.getElementById('modalBody').innerHTML = '<p class="warn">Não consegui carregar.</p>'; return; }
  document.getElementById('modalBody').innerHTML = `<h3>Páginas apagadas</h3>
    ${data.length ? `<div class="hlist">${data.map(r => `<div class="hrow"><span><b>${esc(r.data.name || 'Página')}</b> · apagada ${when(r.updated_at)}
      por ${esc(r.updated_by || 'sem nome')}</span><button data-undelete="${esc(r.id)}">Recuperar</button></div>`).join('')}</div>`
    : '<p class="muted">Nenhuma página apagada.</p>'}`;
};

Sync.undelete = async function (id) {
  const { data, error } = await this.db.from('pages').update({ deleted: false, updated_by: this.name }).eq('id', id).select();
  if (error || !data.length) { toast('Não consegui recuperar a página.'); return; }
  this.remember(data[0]);
  if (!state.pages.some(p => p.id === id)) state.pages.push(pageFromData(id, data[0].data));
  state.cur = state.pages.findIndex(p => p.id === id);
  selId = null;
  hist.last = JSON.stringify(state);
  renderAll(); closeModal();
  toast('Página recuperada. Ela foi para o fim da lista; use as setas para colocar no lugar.');
  this.schedule();
};

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-close]') || t.id === 'modal') { closeModal(); return; }
  if (t.dataset.hist != null) Sync.restoreHistory(+t.dataset.hist);
  if (t.dataset.undelete) Sync.undelete(t.dataset.undelete);
});

/* ---------- nome de quem edita ---------- */

Sync.askName = function () {
  return new Promise((res) => {
    let saved = '';
    try { saved = localStorage.getItem(NAME_KEY) || ''; } catch (e) { /* sem armazenamento */ }
    if (saved) { this.setName(saved); res(); return; }
    openModal(`<h3>Como você quer aparecer para a equipe?</h3>
      <p class="muted">O jornal é editado por todos juntos. Seu nome aparece para quem estiver online e no histórico das páginas.</p>
      <div class="row"><input type="text" id="nameInput" placeholder="Seu nome" maxlength="40"></div>
      <div class="btnrow"><button class="primary" id="nameOk">Entrar</button></div>`);
    document.querySelector('#modal [data-close]').hidden = true;
    const inp = document.getElementById('nameInput');
    inp.focus();
    const done = () => {
      this.setName(inp.value.trim() || 'Visitante');
      try { localStorage.setItem(NAME_KEY, this.name); } catch (e) { /* sem armazenamento */ }
      document.querySelector('#modal [data-close]').hidden = false;
      closeModal();
      res();
    };
    document.getElementById('nameOk').onclick = done;
    inp.onkeydown = (ev) => { if (ev.key === 'Enter') done(); };
  });
};

/* ---------- trabalho que ficou só neste navegador (antes do jornal compartilhado) ---------- */

Sync.offerLocalImport = function () {
  let old = null;
  try { old = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* nada salvo */ }
  if (!old || !old.pages) return;
  const mine = old.pages.filter(p => !(p.tid && isUntouched(p)));
  if (!mine.length) { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ok */ } return; }
  openModal(`<h3>Você tem alterações salvas só neste navegador</h3>
    <p>Antes do jornal virar compartilhado, você editou estas páginas aqui: <b>${mine.map(p => esc(p.name)).join(', ')}</b>.</p>
    <p class="muted">Posso trazê-las para o jornal compartilhado como páginas extras (no fim da lista). Depois é só apagar as que não quiser.</p>
    <div class="btnrow"><button class="primary" id="impYes">Trazer para o jornal</button><button id="impNo" class="danger">Descartar</button></div>`);
  document.getElementById('impNo').onclick = () => {
    if (!confirm('Descartar as alterações que ficaram só neste navegador?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ok */ }
    closeModal();
  };
  document.getElementById('impYes').onclick = async () => {
    document.getElementById('modalBody').innerHTML = '<p>Enviando…</p>';
    for (const p of mine) {
      const c = JSON.parse(JSON.stringify(p));
      c.id = uid();
      c.name = p.name + ' (deste navegador)';
      delete c.tid; delete c.tver; delete c.tsig;
      for (const el of c.elements) {
        el.id = uid();
        if (el.type === 'image' && el.src && el.src.startsWith('idb:') && Uploads.urls[el.src.slice(4)]) {
          try { el.src = await this.upload(await Uploads.blob(el.src.slice(4)), (Uploads.meta[el.src.slice(4)] || {}).name); }
          catch (e) { el.src = null; }
        }
      }
      state.pages.push(c);
    }
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ok */ }
    commit(); renderAll(); closeModal();
    toast('Pronto: suas páginas foram para o fim da lista.');
  };
};
