// Aceita fotos em praticamente qualquer formato e as converte antes de enviar:
// JPEG e PNG passam direto; AVIF, WebP, GIF, BMP, ICO, SVG (o navegador lê), HEIC/HEIF de iPhone e TIFF
// (lidos por bibliotecas carregadas só quando precisa) viram JPEG — ou PNG, se tiverem transparência.
'use strict';

const IMG_MAX_LADO = 5000;      // limite do lado maior (≈ 42 cm a 300 dpi); fotos maiores são reduzidas
const IMG_QUALIDADE = 0.92;
const EXT_IMAGEM = /\.(jpe?g|png|avif|webp|gif|bmp|ico|svg|heic|heif|tiff?)$/i;

function ehImagem(f) {
  return (f.type || '').startsWith('image/') || EXT_IMAGEM.test(f.name || '');
}

function carregarScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('não consegui carregar ' + src));
    document.head.appendChild(s);
  });
}

function tipoDe(f) {
  const ext = ((f.name || '').match(/\.([a-z0-9]+)$/i) || [])[1] || '';
  const t = (f.type || '').toLowerCase();
  if (/heic|heif/.test(t) || /^hei[cf]$/i.test(ext)) return 'heic';
  if (/tiff/.test(t) || /^tiff?$/i.test(ext)) return 'tiff';
  if (t === 'image/jpeg' || /^jpe?g$/i.test(ext)) return 'jpeg';
  if (t === 'image/png' || /^png$/i.test(ext)) return 'png';
  return 'outro';
}

async function bitmapDe(blob) {
  try { return await createImageBitmap(blob); } catch (e) { /* tenta pelo <img> */ }
  const url = URL.createObjectURL(blob);
  try {
    const im = new Image();
    im.decoding = 'async';
    await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = url; });
    return im;
  } catch (e) {
    throw new Error('o navegador não conseguiu abrir esta imagem');
  } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

async function heicParaBlob(f) {
  try { return await createImageBitmap(f).then(() => f); } catch (e) { /* Safari lê HEIC sozinho; os outros não */ }
  await carregarScript('js/vendor/heic2any.min.js');
  const r = await window.heic2any({ blob: f, toType: 'image/png' });
  return Array.isArray(r) ? r[0] : r;
}

async function tiffParaCanvas(f) {
  await carregarScript('js/vendor/UTIF.js');
  const buf = await f.arrayBuffer();
  const ifds = window.UTIF.decode(buf);
  window.UTIF.decodeImage(buf, ifds[0]);
  const rgba = window.UTIF.toRGBA8(ifds[0]);
  const cv = document.createElement('canvas');
  cv.width = ifds[0].width; cv.height = ifds[0].height;
  cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer), cv.width, cv.height), 0, 0);
  return cv;
}

function temTransparencia(ctx, w, h) {
  // amostra a imagem numa grade (rápido mesmo em fotos grandes)
  const passo = Math.max(1, Math.floor(Math.max(w, h) / 400));
  const d = ctx.getImageData(0, 0, w, h).data;
  for (let y = 0; y < h; y += passo) {
    for (let x = 0; x < w; x += passo) if (d[(y * w + x) * 4 + 3] < 250) return true;
  }
  return false;
}

// Devolve { blob, name } pronto para enviar (JPEG ou PNG).
async function prepararImagem(f) {
  const tipo = tipoDe(f);
  if (tipo === 'jpeg' || tipo === 'png') return { blob: f, name: f.name };
  if (tipo !== 'outro') toast(`Convertendo ${tipo.toUpperCase()}…`, 20000);
  let origem;
  if (tipo === 'tiff') origem = await tiffParaCanvas(f);
  else origem = await bitmapDe(tipo === 'heic' ? await heicParaBlob(f) : f);
  let w = origem.width || origem.naturalWidth, h = origem.height || origem.naturalHeight;
  if (!w || !h) throw new Error('imagem sem tamanho (talvez um SVG sem largura e altura)');
  const k = Math.min(1, IMG_MAX_LADO / Math.max(w, h));
  w = Math.round(w * k); h = Math.round(h * k);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(origem, 0, 0, w, h);
  const png = temTransparencia(ctx, w, h);
  if (!png) {   // JPEG não tem transparência: garante fundo branco
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  }
  const blob = await new Promise(res => cv.toBlob(res, png ? 'image/png' : 'image/jpeg', IMG_QUALIDADE));
  const base = (f.name || 'foto').replace(/\.[a-z0-9]+$/i, '');
  return { blob, name: `${base}.${png ? 'png' : 'jpg'}` };
}
