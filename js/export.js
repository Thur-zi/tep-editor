// Exportação: PDF (texto em vetor, com as fontes embutidas) e PNG em 300 dpi.
// O texto é medido no próprio navegador, palavra por palavra, para sair igual ao que se vê na tela.
'use strict';

const PNG_DPI = 300;

const imgCache = new Map();
function loadImg(url) {
  if (!imgCache.has(url)) {
    imgCache.set(url, new Promise((res, rej) => {
      const im = new Image();
      if (/^https?:/.test(url)) im.crossOrigin = 'anonymous';   // fotos do banco: permite usar no PDF/PNG
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = url;
    }));
  }
  return imgCache.get(url);
}

// Monta a página num contêiner invisível em escala 1 e devolve as palavras com posição (pt) e linha de base.
async function layoutText(p) {
  await loadFonts();
  const m = $('#measure');
  m.textContent = '';
  m.style.width = PAGE_W + 'px';
  m.style.height = PAGE_H + 'px';
  const out = new Map();
  const pending = [];
  for (const el of p.elements) {
    if (el.hidden || el.type !== 'text') continue;
    const n = buildNode(el);
    m.appendChild(n);
    paintNode(n, el, true);
    pending.push([el, n]);
  }
  const mr = m.getBoundingClientRect();
  for (const [el, n] of pending) {
    const words = [];
    for (const span of n.firstChild.children) {
      const tn = span.firstChild;
      if (!tn) continue;
      const re = /\S+/g;
      let mt;
      while ((mt = re.exec(tn.data))) {
        const r = document.createRange();
        r.setStart(tn, mt.index);
        r.setEnd(tn, mt.index + mt[0].length);
        const rc = r.getClientRects()[0];
        if (!rc) continue;
        words.push({
          text: mt[0],
          font: span.dataset.font,
          x: rc.left - mr.left,
          y: rc.top - mr.top + ASC * el.size,
        });
      }
    }
    out.set(el.id, words);
  }
  m.textContent = '';
  return out;
}

// Recorta a parte visível da foto dentro do quadro (em pt) e na resolução original (px).
function visibleCrop(el) {
  const ih = el.iw * el.nh / el.nw;
  const ax = el.x + el.ix, ay = el.y + el.iy;
  const x0 = Math.max(el.x, ax), y0 = Math.max(el.y, ay);
  const x1 = Math.min(el.x + el.w, ax + el.iw), y1 = Math.min(el.y + el.h, ay + ih);
  if (x1 <= x0 || y1 <= y0) return null;
  const k = el.nw / el.iw;
  return {
    dx: x0, dy: y0, dw: x1 - x0, dh: y1 - y0,
    sx: (x0 - ax) * k, sy: (y0 - ay) * k, sw: (x1 - x0) * k, sh: (y1 - y0) * k,
  };
}

function isPng(url, src) {
  return /\.(png|svg)($|\?)/i.test(src || '') || /^data:image\/png/.test(url) || (src || '').startsWith('idb:') && /png/i.test((Uploads.meta[src.slice(4)] || {}).name || '');
}

async function cropToDataURL(el) {
  const url = resolveSrc(el.src);
  const c = visibleCrop(el);
  if (!url || !c) return null;
  const im = await loadImg(url);
  // a imagem carregada pode ter tamanho diferente do registrado; ajusta a escala
  const kx = im.naturalWidth / el.nw, ky = im.naturalHeight / el.nh;
  const sw = Math.max(1, Math.round(c.sw * kx)), sh = Math.max(1, Math.round(c.sh * ky));
  const cv = document.createElement('canvas');
  cv.width = sw; cv.height = sh;
  const ctx = cv.getContext('2d');
  const png = isPng(url, el.src);
  if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); }
  ctx.drawImage(im, c.sx * kx, c.sy * ky, c.sw * kx, c.sh * ky, 0, 0, sw, sh);
  return { data: cv.toDataURL(png ? 'image/png' : 'image/jpeg', 0.93), fmt: png ? 'PNG' : 'JPEG', c };
}

async function fontBase64(key) {
  const buf = await (await fetch(`fonts/${key}.ttf`)).arrayBuffer();
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function exportPDF() {
  if (editingId) stopEditing();
  toast('Gerando o PDF…', 60000);
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: [PAGE_W, PAGE_H], orientation: 'portrait', compress: true, putOnlyUsedFonts: true });
    const layouts = [];
    const used = new Set();
    for (const p of state.pages) {
      const L = await layoutText(p);
      layouts.push(L);
      for (const words of L.values()) words.forEach(w => used.add(w.font));
    }
    for (const key of used) {
      pdf.addFileToVFS(key + '.ttf', await fontBase64(key));
      pdf.addFont(key + '.ttf', key, 'normal');
    }
    for (let pi = 0; pi < state.pages.length; pi++) {
      if (pi > 0) pdf.addPage([PAGE_W, PAGE_H], 'portrait');
      const p = state.pages[pi];
      for (const el of p.elements) {
        if (el.hidden) continue;
        const op = (el.opacity ?? 100) / 100;
        if (op < 1) pdf.setGState(new pdf.GState({ opacity: op, 'stroke-opacity': op }));
        if (el.type === 'rect') {
          const sw = el.sw || 0;
          if (el.fill) { pdf.setFillColor(el.fill); pdf.rect(el.x, el.y, el.w, el.h, 'F'); }
          if (sw > 0) {
            pdf.setDrawColor(el.stroke); pdf.setLineWidth(sw);
            pdf.rect(el.x + sw / 2, el.y + sw / 2, el.w - sw, el.h - sw, 'S');
          }
        } else if (el.type === 'image') {
          const r = await cropToDataURL(el);
          if (r) pdf.addImage(r.data, r.fmt, r.c.dx, r.c.dy, r.c.dw, r.c.dh, undefined, 'FAST');
        } else if (el.type === 'text') {
          if (el.bg) { pdf.setFillColor(el.bg); pdf.rect(el.x, el.y, el.w, el.h, 'F'); }
          pdf.setTextColor(el.color);
          pdf.setFontSize(el.size);
          for (const w of layouts[pi].get(el.id) || []) {
            pdf.setFont(w.font, 'normal');
            pdf.text(w.text, w.x, w.y, { baseline: 'alphabetic' });
          }
        }
        if (op < 1) pdf.setGState(new pdf.GState({ opacity: 1, 'stroke-opacity': 1 }));
      }
    }
    download(pdf.output('blob'), `TEP_${stamp()}.pdf`);
    toast('PDF pronto! Confira a pasta de downloads.');
  } catch (err) {
    console.error(err);
    toast('Não consegui gerar o PDF: ' + err.message, 6000);
  }
}

async function renderPageCanvas(p, dpi) {
  const s = dpi / 72;
  const L = await layoutText(p);
  const cv = document.createElement('canvas');
  cv.width = Math.round(PAGE_W * s);
  cv.height = Math.round(PAGE_H * s);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cv.width, cv.height);
  for (const el of p.elements) {
    if (el.hidden) continue;
    ctx.globalAlpha = (el.opacity ?? 100) / 100;
    if (el.type === 'rect') {
      if (el.fill) { ctx.fillStyle = el.fill; ctx.fillRect(el.x * s, el.y * s, el.w * s, el.h * s); }
      if (el.sw > 0) {
        ctx.strokeStyle = el.stroke; ctx.lineWidth = el.sw * s;
        ctx.strokeRect((el.x + el.sw / 2) * s, (el.y + el.sw / 2) * s, (el.w - el.sw) * s, (el.h - el.sw) * s);
      }
    } else if (el.type === 'image') {
      const url = resolveSrc(el.src);
      const c = visibleCrop(el);
      if (url && c) {
        const im = await loadImg(url);
        const kx = im.naturalWidth / el.nw, ky = im.naturalHeight / el.nh;
        ctx.drawImage(im, c.sx * kx, c.sy * ky, c.sw * kx, c.sh * ky, c.dx * s, c.dy * s, c.dw * s, c.dh * s);
      }
    } else if (el.type === 'text') {
      if (el.bg) { ctx.fillStyle = el.bg; ctx.fillRect(el.x * s, el.y * s, el.w * s, el.h * s); }
      ctx.fillStyle = el.color;
      ctx.textBaseline = 'alphabetic';
      for (const w of L.get(el.id) || []) {
        ctx.font = `${el.size * s}px ${fam(w.font)}`;
        ctx.fillText(w.text, w.x * s, w.y * s);
      }
    }
  }
  ctx.globalAlpha = 1;
  return cv;
}

async function exportPNG() {
  if (editingId) stopEditing();
  toast('Gerando a imagem…', 60000);
  try {
    const cv = await renderPageCanvas(page(), PNG_DPI);
    const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
    download(blob, `TEP_pagina${state.cur + 1}_${stamp()}.png`);
    toast('PNG pronto (300 dpi).');
  } catch (err) {
    console.error(err);
    toast('Não consegui gerar o PNG: ' + err.message, 6000);
  }
}
