#!/usr/bin/env node
// Ferramenta de linha de comando para editar o jornal TEP fora do editor visual (feita para agentes como o Codex).
// Lê e grava as mesmas páginas que o editor usa (banco Supabase do projeto). Não precisa instalar nada: Node 18+.
//
//   node tools/tep.mjs edicoes                         lista as edições (TEPs)
//   node tools/tep.mjs paginas [--ed ID]               lista as páginas de uma edição (padrão: a mais recente)
//   node tools/tep.mjs baixar <n|id> [--ed ID]         salva a página em paginas/<nome>.json para editar
//   node tools/tep.mjs verificar <arquivo.json>        confere se tudo cabe na página e se as fontes/imagens existem
//   node tools/tep.mjs enviar <arquivo.json>           grava a página editada no jornal (falha se alguém mudou antes)
//   node tools/tep.mjs nova <arquivo.json> [--ed ID] [--depois N]   cria uma página nova (padrão: no fim)
//   node tools/tep.mjs foto <imagem.jpg|png>           envia uma foto e mostra o "src", "nw" e "nh" para usar
//   node tools/tep.mjs galeria                         lista as imagens que já existem no projeto (assets/)
//   node tools/tep.mjs ver <n|id|arquivo.json> [--ed ID] [--saida arquivo.png]   gera a imagem da página (precisa de Playwright)
//
// Unidades em pontos (pt). Página 772.4 × 1077.2; área útil x 56.7–715.7, y 85–1020.5. Detalhes em AGENTS.md.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const EDITOR_URL = 'https://thur-zi.github.io/tep-editor/';
const PAGE_W = 772.441, PAGE_H = 1077.17;
const FONTES = ['Roboto-Regular', 'Roboto-Italic', 'Roboto-Medium', 'Roboto-Bold', 'Roboto-BoldItalic', 'Roboto-Black',
  'RobotoCondensed-Regular', 'RobotoCondensed-Bold'];
const AUTOR = process.env.TEP_NOME || 'Codex';

const cfg = await readFile(join(RAIZ, 'js/config.js'), 'utf8');
const URL_DB = cfg.match(/SUPABASE_URL\s*=\s*'([^']+)'/)[1];
const KEY = cfg.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)[1];
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

function falha(msg) { console.error('ERRO: ' + msg); process.exit(1); }

async function api(caminho, opcoes = {}) {
  const r = await fetch(`${URL_DB}/rest/v1/${caminho}`, { ...opcoes, headers: { ...H, ...(opcoes.headers || {}) } });
  const t = await r.text();
  if (!r.ok) falha(`${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}

function args() {
  const a = process.argv.slice(2), o = { _: [] };
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1], i++;
    else o._.push(a[i]);
  }
  return o;
}

async function edicoes() { return api('editions?select=id,name,created_at&order=created_at'); }

async function edicao(o) {
  const eds = await edicoes();
  if (o.ed) {
    const e = eds.find(x => x.id === o.ed || x.name === o.ed);
    if (!e) falha(`edição "${o.ed}" não existe. Use: node tools/tep.mjs edicoes`);
    return e;
  }
  return eds[eds.length - 1];
}

async function paginas(ed) {
  return api(`pages?select=id,position,rev,updated_by,updated_at,data&edition_id=eq.${encodeURIComponent(ed.id)}&deleted=eq.false&order=position`);
}

async function acharPagina(ref, o) {
  const ed = await edicao(o);
  const lista = await paginas(ed);
  const p = /^\d+$/.test(ref) ? lista[+ref - 1] : lista.find(x => x.id === ref);
  if (!p) falha(`página "${ref}" não encontrada na edição ${ed.name}. Use: node tools/tep.mjs paginas`);
  return { ed, p, lista };
}

function slug(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pagina';
}

function uid() { return Math.random().toString(36).slice(2, 10); }

async function lerPagina(arquivo) {
  const j = JSON.parse(await readFile(arquivo, 'utf8'));
  if (!Array.isArray(j.elements)) falha('o arquivo precisa ter "elements" (lista de itens)');
  j.elements.forEach(e => { if (!e.id) e.id = uid(); });
  return j;
}

function dadosDaPagina(j) {
  const d = { name: j.name || 'Página', elements: j.elements };
  for (const k of ['tid', 'tver', 'tsig']) if (j[k]) d[k] = j[k];
  return d;
}

// Estimativa simples (média de 0,52 × corpo por caractere) para avisar quando um texto não cabe na caixa.
function linhasEstimadas(el) {
  const larg = el.w - (el.padL || 0) - (el.padR || 0);
  const media = el.size * (/Black|Bold/.test(el.font) ? 0.56 : 0.52);
  const porLinha = Math.max(1, Math.floor(larg / media));
  return String(el.text || '').replace(/\*\*/g, '').split('\n')
    .reduce((n, par) => n + Math.max(1, Math.ceil(par.length / porLinha)), 0);
}

function verificar(j) {
  const avisos = [];
  for (const e of j.elements) {
    const nome = `"${e.name || e.type}"`;
    if (!['text', 'image', 'rect'].includes(e.type)) avisos.push(`${nome}: tipo "${e.type}" não existe (text, image ou rect)`);
    for (const k of ['x', 'y', 'w', 'h']) if (typeof e[k] !== 'number') avisos.push(`${nome}: falta "${k}" numérico`);
    if (e.x < 0 || e.y < 0 || e.x + e.w > PAGE_W + 0.5 || e.y + e.h > PAGE_H + 0.5) avisos.push(`${nome}: sai da página`);
    if (e.type === 'text') {
      if (!FONTES.includes(e.font)) avisos.push(`${nome}: fonte "${e.font}" não existe (${FONTES.join(', ')})`);
      const precisa = linhasEstimadas(e) * e.lh + (e.padT || 0) + (e.padB || 0);
      if (precisa > e.h + 0.5) avisos.push(`${nome}: o texto deve precisar de ~${Math.round(precisa)} pt de altura e a caixa tem ${e.h} (confira com "ver")`);
    }
    if (e.type === 'image' && e.src) {
      if (e.src.startsWith('assets/') && !existsSync(join(RAIZ, e.src))) avisos.push(`${nome}: imagem ${e.src} não existe`);
      if (!e.nw || !e.nh || !e.iw) avisos.push(`${nome}: imagem precisa de "nw", "nh" (tamanho em pixels) e "ix", "iy", "iw" (enquadramento)`);
    }
  }
  return avisos;
}

function tamanhoImagem(buf) {
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  falha('formato de imagem não reconhecido: use JPG ou PNG');
}

const o = args();
const [cmd, ref] = o._;

switch (cmd) {
  case 'edicoes': {
    for (const e of await edicoes()) console.log(`${e.id}\t${e.name}`);
    break;
  }
  case 'paginas': {
    const ed = await edicao(o);
    console.log(`Edição: ${ed.name} (${ed.id})`);
    (await paginas(ed)).forEach((p, i) => console.log(`${i + 1}\t${p.id}\t${p.data.name}\t(rev ${p.rev}, por ${p.updated_by || '?'})`));
    break;
  }
  case 'baixar': {
    if (!ref) falha('diga qual página: node tools/tep.mjs baixar 3');
    const { ed, p } = await acharPagina(ref, o);
    const saida = o.saida || join('paginas', `${String(p.position + 1).padStart(2, '0')}-${slug(p.data.name)}.json`);
    await mkdir(dirname(saida), { recursive: true });
    await writeFile(saida, JSON.stringify({ _id: p.id, _rev: p.rev, _edicao: ed.id, ...p.data }, null, 2));
    console.log(`Salvo em ${saida} (página "${p.data.name}", edição ${ed.name}). Edite e depois: node tools/tep.mjs enviar ${saida}`);
    break;
  }
  case 'verificar': {
    const j = await lerPagina(ref);
    const av = verificar(j);
    console.log(av.length ? av.map(a => '- ' + a).join('\n') : 'OK: nenhum problema encontrado.');
    process.exit(av.length ? 2 : 0);
  }
  case 'enviar': {
    const j = await lerPagina(ref);
    if (!j._id) falha('esse arquivo não veio de "baixar" (sem "_id"). Para página nova use: node tools/tep.mjs nova arquivo.json');
    const av = verificar(j);
    if (av.length && !('forcar' in o)) falha('corrija antes de enviar (ou use --forcar sim):\n' + av.map(a => '- ' + a).join('\n'));
    const r = await api(`pages?id=eq.${encodeURIComponent(j._id)}&rev=eq.${j._rev}`, {
      method: 'PATCH', body: JSON.stringify({ data: dadosDaPagina(j), updated_by: AUTOR }),
    });
    if (!r.length) falha('alguém alterou essa página depois que você baixou. Baixe de novo, refaça a alteração e envie.');
    j._rev = r[0].rev;
    await writeFile(ref, JSON.stringify(j, null, 2));
    console.log(`Enviado. A página aparece atualizada no editor em segundos (versão ${r[0].rev}). Versão anterior fica no histórico.`);
    break;
  }
  case 'nova': {
    const j = await lerPagina(ref);
    const av = verificar(j);
    if (av.length && !('forcar' in o)) falha('corrija antes de enviar (ou use --forcar sim):\n' + av.map(a => '- ' + a).join('\n'));
    const ed = await edicao(o);
    const lista = await paginas(ed);
    let pos = lista.length ? lista[lista.length - 1].position + 1 : 0;
    if (o.depois) {
      const n = +o.depois;
      if (lista[n - 1]) pos = lista[n] ? (lista[n - 1].position + lista[n].position) / 2 : lista[n - 1].position + 1;
    }
    const id = uid() + uid();
    await api('pages', { method: 'POST', body: JSON.stringify({ id, position: pos, edition_id: ed.id, data: dadosDaPagina(j), updated_by: AUTOR }) });
    console.log(`Página "${j.name}" criada na edição ${ed.name} (id ${id}).`);
    break;
  }
  case 'foto': {
    if (!ref) falha('diga o arquivo: node tools/tep.mjs foto foto.jpg');
    const buf = await readFile(ref);
    const { w, h } = tamanhoImagem(buf);
    const ext = extname(ref).toLowerCase().replace('.jpeg', '.jpg');
    const nome = `${Date.now()}-${uid().slice(0, 5)}-${slug(basename(ref, extname(ref))).slice(0, 40)}${ext}`;
    const r = await fetch(`${URL_DB}/storage/v1/object/uploads/${nome}`, {
      method: 'POST', body: buf,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': ext === '.png' ? 'image/png' : 'image/jpeg' },
    });
    if (!r.ok) falha(`${r.status} ${await r.text()}`);
    const src = `${URL_DB}/storage/v1/object/public/uploads/${nome}`;
    console.log(JSON.stringify({ src, nw: w, nh: h }, null, 2));
    console.log('Use esse "src", "nw" e "nh" num item "image" (veja AGENTS.md para o enquadramento).');
    break;
  }
  case 'galeria': {
    const t = await readFile(join(RAIZ, 'js/template.js'), 'utf8');
    const lista = [...t.matchAll(/\{ src: '(assets\/[^']+)', name: '([^']+)', nw: (\d+), nh: (\d+)/g)];
    for (const [, src, name, nw, nh] of lista) console.log(`${src}\t${nw}x${nh}\t${name}`);
    break;
  }
  case 'ver': {
    if (!ref) falha('diga a página ou o arquivo: node tools/tep.mjs ver 3');
    let pw;
    try { pw = await import('playwright'); } catch (e) {
      falha('o comando "ver" precisa do Playwright: npm i -D playwright && npx playwright install chromium');
    }
    let dados;
    if (existsSync(ref)) dados = dadosDaPagina(await lerPagina(ref));
    else dados = (await acharPagina(ref, o)).p.data;
    const saida = o.saida || 'pagina.png';
    const b = await pw.chromium.launch();
    const pg = await b.newPage();
    await pg.route('**/*supabase.co/rest/**', r => r.abort());   // só desenha: não grava nada no jornal
    await pg.goto(EDITOR_URL);
    await pg.waitForFunction(() => typeof renderPageCanvas === 'function' && typeof state !== 'undefined' && !!state);
    const png = await pg.evaluate(async (d) => {
      const cv = await renderPageCanvas({ id: 'ver', name: d.name, elements: d.elements }, 110);
      return cv.toDataURL('image/png');
    }, dados);
    await writeFile(saida, Buffer.from(png.split(',')[1], 'base64'));
    await b.close();
    console.log(`Imagem da página salva em ${saida}`);
    break;
  }
  default:
    console.log((await readFile(fileURLToPath(import.meta.url), 'utf8')).split('\n').slice(1, 14).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
