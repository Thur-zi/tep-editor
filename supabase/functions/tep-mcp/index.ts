// Servidor MCP do jornal TEP (Supabase Edge Function).
// Qualquer IA compatível com MCP (Claude, ChatGPT, Codex, Cursor, VS Code...) conecta neste endereço e lê/edita
// as mesmas páginas do editor https://thur-zi.github.io/tep-editor/. As mudanças aparecem ao vivo no editor.
// Transporte: "Streamable HTTP" sem estado (cada POST traz uma mensagem JSON-RPC; a resposta vem em JSON).
// Acesso igual ao do editor: aberto para quem tem o endereço; as regras do banco não deixam apagar nada.

const DB = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const EDITOR = "https://thur-zi.github.io/tep-editor/";
const PAGE_W = 772.441, PAGE_H = 1077.17;
const FONTES = ["Roboto-Regular", "Roboto-Italic", "Roboto-Medium", "Roboto-Bold", "Roboto-BoldItalic", "Roboto-Black",
  "RobotoCondensed-Regular", "RobotoCondensed-Bold"];

const GUIA = `Jornal mensal impresso "Transformar é Possível" (TEP), do vereador Wanderley Porto (Belo Horizonte).
Cada edição (TEP) tem páginas; cada página é {name, elements:[...]} com itens do fundo para a frente.

COMO TRABALHAR
- listar_edicoes → listar_paginas → ler_pagina (sempre leia a versão mais recente antes de mudar) → salvar_pagina.
- Mude só o que foi pedido; preserve os outros itens (mesmo "id"). Se salvar_pagina disser que a página mudou, leia de novo e refaça só a sua alteração.
- Use só os textos que a pessoa mandar; pode corrigir ortografia e encurtar para caber, avisando. Nunca invente números, nomes, falas ou fatos.
- Depois de salvar, mostre o link do editor (ver_pagina) para a pessoa conferir. Nada é apagado de verdade: o editor guarda o histórico.

PÁGINA (unidade: pontos, pt)
- Página 772.4 × 1077.2, origem no canto superior esquerdo. Área útil: x 56.7–715.7 (largura 659), y 85–1020.5.
- Faixa da editoria: {"type":"rect","name":"Faixa da editoria","x":56.7,"y":85,"w":659,"h":40.1,"fill":"#f37648"} e
  {"type":"text","name":"Editoria","text":"NOME","font":"Roboto-Regular","size":23.2,"lh":28,"color":"#ffffff","align":"center","x":56.7,"y":92.07,"w":659,"h":28}
- Título: Roboto-Black 30–33, cor #231f20, centralizado. Linha fina: Roboto-Italic 16, cor #4da699. Texto: Roboto-Regular 11.5, lh 16, cor #231f20.
- Respiro de 10–16 pt entre blocos; blocos lado a lado com o mesmo y; colunas com o mesmo x.
- Cores: laranja #f26532, faixa #f37648, verde #4da699, verde-escuro #178f7f, texto #231f20, fundo de box #fdeae2, branco #ffffff.

ITENS (todos têm id, type, name, x, y, w, h; opcionais opacity 0–100, locked, hidden)
- text: text (\\n quebra linha, **negrito**), font (${FONTES.join(", ")}), size, lh, color, align (left|center|right|justify),
  bg (cor ou null), padT/padR/padB/padL. A altura h precisa caber: linhas × lh + margens (≈ w ÷ (size × 0,52) caracteres por linha).
- rect: fill (cor ou null), stroke, sw. Fio = retângulo de altura 1 a 1.5.
- image: src (de "galeria" ou de enviar_imagem_por_url; null = quadro vazio), nw, nh (pixels) e enquadramento ix, iy, iw em pt
  (altura da imagem = iw × nh / nw). Preencher o quadro: f = max(w/nw, h/nh); iw = nw×f; ix = (w−iw)/2; iy = (h−nh×f)/2 (pessoas: iy = 0).
- Fotos de terceiros: crédito em texto pequeno (Roboto-Italic 8, cor #77746d).`;

// ---------- banco ----------
async function api(caminho: string, init: RequestInit = {}) {
  const r = await fetch(`${DB}/rest/v1/${caminho}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json",
      Prefer: "return=representation", ...(init.headers || {}) },
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`banco respondeu ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}

async function edicoes() { return api("editions?select=id,name,created_at&order=created_at"); }

async function edicao(ref?: string) {
  const eds = await edicoes();
  if (!ref) return eds[eds.length - 1];
  const e = eds.find((x: any) => x.id === ref || x.name === ref || x.name.includes(ref));
  if (!e) throw new Error(`edição "${ref}" não encontrada. Edições: ${eds.map((x: any) => x.name).join("; ")}`);
  return e;
}

async function paginas(ed: any) {
  return api(`pages?select=id,position,rev,updated_by,updated_at,data&edition_id=eq.${encodeURIComponent(ed.id)}&deleted=eq.false&order=position`);
}

async function acharPagina(ref: string | number, edRef?: string) {
  const ed = await edicao(edRef);
  const lista = await paginas(ed);
  const s = String(ref);
  const p = /^\d+$/.test(s) ? lista[+s - 1] : lista.find((x: any) => x.id === s || x.data?.name === s);
  if (!p) throw new Error(`página "${s}" não encontrada na edição ${ed.name} (${lista.length} páginas).`);
  return { ed, p, lista, n: lista.indexOf(p) + 1 };
}

// "(IA)" no fim do nome faz o editor avisar quem está online que a mudança veio de uma IA
function autor(a: any) { return `${String(a.autor || "Agente").slice(0, 40)} (IA)`; }

function uid() { return crypto.randomUUID().replace(/-/g, "").slice(0, 16); }

function normalizar(pg: any) {
  if (!pg || !Array.isArray(pg.elements)) throw new Error('a página precisa de "elements" (lista de itens)');
  const d: any = { name: String(pg.name || "Página").slice(0, 60), elements: pg.elements };
  d.elements.forEach((e: any) => { if (!e.id) e.id = uid(); });
  for (const k of ["tid", "tver", "tsig"]) if (pg[k]) d[k] = pg[k];
  return d;
}

function verificar(d: any) {
  const av: string[] = [];
  for (const e of d.elements) {
    const nome = `"${e.name || e.type}"`;
    if (!["text", "image", "rect"].includes(e.type)) av.push(`${nome}: tipo "${e.type}" não existe`);
    for (const k of ["x", "y", "w", "h"]) if (typeof e[k] !== "number") av.push(`${nome}: falta "${k}" numérico`);
    if (e.x < 0 || e.y < 0 || e.x + e.w > PAGE_W + 0.5 || e.y + e.h > PAGE_H + 0.5) av.push(`${nome}: sai da página`);
    if (e.type === "text") {
      if (!FONTES.includes(e.font)) av.push(`${nome}: fonte "${e.font}" não existe`);
      const larg = e.w - (e.padL || 0) - (e.padR || 0);
      const porLinha = Math.max(1, Math.floor(larg / (e.size * (/Black|Bold/.test(e.font) ? 0.56 : 0.52))));
      const linhas = String(e.text ?? "").replace(/\*\*/g, "").split("\n").reduce((n, p) => n + Math.max(1, Math.ceil(p.length / porLinha)), 0);
      const precisa = linhas * e.lh + (e.padT || 0) + (e.padB || 0);
      if (precisa > e.h + 0.5) av.push(`${nome}: o texto deve precisar de ~${Math.round(precisa)} pt de altura e a caixa tem ${e.h}`);
    }
    if (e.type === "image" && e.src && (!e.nw || !e.nh || e.iw == null)) av.push(`${nome}: imagem precisa de nw, nh, ix, iy, iw`);
  }
  return av;
}

function link(ed: any, n: number) { return `${EDITOR}?ed=${encodeURIComponent(ed.id)}&p=${n}`; }

function tamanhoImagem(b: Uint8Array): { w: number; h: number; tipo: string } | null {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const asc = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));
  if (b[0] === 0x89 && asc(1, 3) === "PNG") return { w: dv.getUint32(16), h: dv.getUint32(20), tipo: "image/png" };
  if (asc(0, 3) === "GIF") return { w: dv.getUint16(6, true), h: dv.getUint16(8, true), tipo: "image/gif" };
  if (asc(0, 4) === "RIFF" && asc(8, 4) === "WEBP") {
    const c = asc(12, 4);
    if (c === "VP8X") return { w: 1 + (b[24] | b[25] << 8 | b[26] << 16), h: 1 + (b[27] | b[28] << 8 | b[29] << 16), tipo: "image/webp" };
    if (c === "VP8 ") return { w: dv.getUint16(26, true) & 0x3fff, h: dv.getUint16(28, true) & 0x3fff, tipo: "image/webp" };
    if (c === "VP8L") { const v = dv.getUint32(21, true); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1, tipo: "image/webp" }; }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      const m = b[i + 1], len = dv.getUint16(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: dv.getUint16(i + 7), h: dv.getUint16(i + 5), tipo: "image/jpeg" };
      i += 2 + len;
    }
  }
  return null;
}

// ---------- ferramentas ----------
const TOOLS: Record<string, { description: string; inputSchema: any; run: (a: any) => Promise<any> }> = {
  guia_de_diagramacao: {
    description: "Regras do jornal: tamanho da página, margens, fontes, cores e o formato JSON dos itens. Leia antes de criar ou mudar páginas.",
    inputSchema: { type: "object", properties: {} },
    run: async () => GUIA,
  },
  listar_edicoes: {
    description: "Lista as edições (cada TEP). A mais recente é a usada quando nenhuma edição é informada.",
    inputSchema: { type: "object", properties: {} },
    run: async () => (await edicoes()).map((e: any) => ({ id: e.id, nome: e.name })),
  },
  listar_paginas: {
    description: "Lista as páginas de uma edição, na ordem (número, id, nome, versão e quem mexeu por último).",
    inputSchema: { type: "object", properties: { edicao: { type: "string", description: "id ou nome da edição (padrão: a mais recente)" } } },
    run: async (a) => {
      const ed = await edicao(a.edicao);
      const lista = await paginas(ed);
      return { edicao: ed.name, paginas: lista.map((p: any, i: number) =>
        ({ numero: i + 1, id: p.id, nome: p.data?.name, versao: p.rev, ultimo_a_mexer: p.updated_by, link: link(ed, i + 1) })) };
    },
  },
  ler_pagina: {
    description: "Lê uma página completa (JSON com todos os itens). Guarde o 'id' e a 'versao' para salvar depois.",
    inputSchema: { type: "object", required: ["pagina"], properties: {
      pagina: { type: "string", description: "número da página (1 = capa), id ou nome" },
      edicao: { type: "string", description: "id ou nome da edição (padrão: a mais recente)" } } },
    run: async (a) => {
      const { ed, p, n } = await acharPagina(a.pagina, a.edicao);
      return { id: p.id, versao: p.rev, numero: n, edicao: ed.name, link: link(ed, n), pagina: p.data };
    },
  },
  salvar_pagina: {
    description: "Grava a página inteira (name + elements) por cima da versão lida. Falha se alguém mudou a página depois da leitura: leia de novo e refaça só a sua alteração.",
    inputSchema: { type: "object", required: ["id", "versao", "pagina"], properties: {
      id: { type: "string" }, versao: { type: "number", description: "a 'versao' devolvida por ler_pagina" },
      pagina: { type: "object", description: "{ name, elements: [...] }" },
      autor: { type: "string", description: "nome de quem pediu a mudança (aparece no histórico)" },
      ignorar_avisos: { type: "boolean", description: "grava mesmo com avisos de texto que não cabe etc." } } },
    run: async (a) => {
      const d = normalizar(a.pagina);
      const av = verificar(d);
      if (av.length && !a.ignorar_avisos) return { gravado: false, avisos: av, dica: "Corrija e salve de novo (ou use ignorar_avisos)." };
      const r = await api(`pages?id=eq.${encodeURIComponent(a.id)}&rev=eq.${a.versao}&deleted=eq.false`, {
        method: "PATCH", body: JSON.stringify({ data: d, updated_by: autor(a) }) });
      if (!r.length) return { gravado: false, erro: "Alguém alterou essa página depois da leitura (ou ela foi apagada). Leia de novo e refaça só a sua alteração." };
      const { ed, n } = await acharPagina(a.id, r[0].edition_id);
      return { gravado: true, nova_versao: r[0].rev, avisos: av, link: link(ed, n) };
    },
  },
  criar_pagina: {
    description: "Cria uma página nova numa edição (no fim, ou depois de uma página).",
    inputSchema: { type: "object", required: ["pagina"], properties: {
      pagina: { type: "object", description: "{ name, elements: [...] }" },
      edicao: { type: "string", description: "id ou nome da edição (padrão: a mais recente)" },
      depois_da_pagina: { type: "number", description: "número da página depois da qual a nova entra" },
      autor: { type: "string" }, ignorar_avisos: { type: "boolean" } } },
    run: async (a) => {
      const d = normalizar(a.pagina);
      const av = verificar(d);
      if (av.length && !a.ignorar_avisos) return { gravado: false, avisos: av, dica: "Corrija e tente de novo (ou use ignorar_avisos)." };
      const ed = await edicao(a.edicao);
      const lista = await paginas(ed);
      let pos = lista.length ? lista[lista.length - 1].position + 1 : 0;
      const k = Number(a.depois_da_pagina);
      if (k && lista[k - 1]) pos = lista[k] ? (lista[k - 1].position + lista[k].position) / 2 : lista[k - 1].position + 1;
      const id = uid();
      await api("pages", { method: "POST", body: JSON.stringify({ id, position: pos, edition_id: ed.id, data: d, updated_by: autor(a) }) });
      const n = (await paginas(ed)).findIndex((p: any) => p.id === id) + 1;
      return { gravado: true, id, numero: n, avisos: av, link: link(ed, n) };
    },
  },
  galeria: {
    description: "Imagens que já existem no projeto (src, tamanho em pixels e descrição), para usar em itens 'image'.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const t = await (await fetch(`${EDITOR}js/template.js`)).text();
      return [...t.matchAll(/\{ src: '(assets\/[^']+)', name: '([^']+)', nw: (\d+), nh: (\d+)/g)]
        .map(([, src, nome, nw, nh]) => ({ src, nome, nw: +nw, nh: +nh }));
    },
  },
  enviar_imagem_por_url: {
    description: "Baixa uma imagem (JPG, PNG, WebP ou GIF) de um link público e guarda no projeto. Devolve src, nw e nh para usar num item 'image'.",
    inputSchema: { type: "object", required: ["url"], properties: { url: { type: "string" }, nome: { type: "string" } } },
    run: async (a) => {
      const r = await fetch(a.url);
      if (!r.ok) throw new Error(`não consegui baixar a imagem (${r.status})`);
      const b = new Uint8Array(await r.arrayBuffer());
      if (b.length > 15 * 1024 * 1024) throw new Error("imagem maior que 15 MB");
      const info = tamanhoImagem(b);
      if (!info) throw new Error("formato não suportado aqui: use JPG, PNG, WebP ou GIF (outros formatos dá para enviar pelo editor)");
      const ext = info.tipo.split("/")[1].replace("jpeg", "jpg");
      const base = String(a.nome || a.url.split(/[?#]/)[0].split("/").pop() || "imagem").normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "imagem";
      const nome = `${Date.now()}-${uid().slice(0, 5)}-${base}.${ext}`;
      const up = await fetch(`${DB}/storage/v1/object/uploads/${nome}`, {
        method: "POST", body: b, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": info.tipo } });
      if (!up.ok) throw new Error(`não consegui guardar a imagem: ${await up.text()}`);
      return { src: `${DB}/storage/v1/object/public/uploads/${nome}`, nw: info.w, nh: info.h };
    },
  },
  ver_pagina: {
    description: "Devolve o link do editor aberto na página, para a pessoa conferir o resultado.",
    inputSchema: { type: "object", required: ["pagina"], properties: {
      pagina: { type: "string", description: "número da página (1 = capa), id ou nome" }, edicao: { type: "string" } } },
    run: async (a) => { const { ed, n, p } = await acharPagina(a.pagina, a.edicao); return { link: link(ed, n), pagina: p.data?.name }; },
  },
};

// ---------- protocolo MCP (JSON-RPC) ----------
const VERSOES = ["2025-06-18", "2025-03-26", "2024-11-05"];

async function tratar(msg: any) {
  const { id, method, params } = msg;
  const ok = (result: any) => ({ jsonrpc: "2.0", id, result });
  const erro = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
  switch (method) {
    case "initialize": {
      const pedida = params?.protocolVersion;
      return ok({
        protocolVersion: VERSOES.includes(pedida) ? pedida : VERSOES[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "tep-jornal", title: "Jornal TEP", version: "1.0.0" },
        instructions: GUIA,
      });
    }
    case "ping": return ok({});
    case "tools/list":
      return ok({ tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema })) });
    case "tools/call": {
      const t = TOOLS[params?.name];
      if (!t) return erro(-32602, `ferramenta desconhecida: ${params?.name}`);
      try {
        const r = await t.run(params?.arguments || {});
        return ok({ content: [{ type: "text", text: typeof r === "string" ? r : JSON.stringify(r, null, 2) }] });
      } catch (e) {
        return ok({ content: [{ type: "text", text: "Erro: " + ((e as Error).message || e) }], isError: true });
      }
    }
    case "resources/list": return ok({ resources: [] });
    case "prompts/list": return ok({ prompts: [] });
    default:
      if (id === undefined) return null;   // notificação: sem resposta
      return erro(-32601, `método não suportado: ${method}`);
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method === "GET") {
    const aceita = req.headers.get("accept") || "";
    if (aceita.includes("text/event-stream")) return new Response(null, { status: 405, headers: CORS });   // sem fluxo SSE
    return new Response(`Servidor MCP do jornal TEP. Conecte este endereço na sua IA (Claude, ChatGPT, Codex, Cursor...).\nEditor: ${EDITOR}\n`,
      { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (req.method === "DELETE") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response(null, { status: 405, headers: CORS });
  let corpo: any;
  try { corpo = await req.json(); } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON inválido" } }, { status: 400, headers: CORS });
  }
  const lote = Array.isArray(corpo) ? corpo : [corpo];
  const respostas = (await Promise.all(lote.map(tratar))).filter(Boolean);
  if (!respostas.length) return new Response(null, { status: 202, headers: CORS });
  return Response.json(Array.isArray(corpo) ? respostas : respostas[0], { headers: CORS });
});
