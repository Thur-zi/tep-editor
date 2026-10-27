// "Colar página do Claude": transforma o texto gerado por um Claude (no chat comum) em uma página nova do jornal.
// Não apaga nada: a página entra logo depois da página aberta.
'use strict';

const FIT_MODES = ['cover', 'contain'];

function promptParaClaude() {
  const fontes = Object.keys(FONTS).join(', ');
  const galeria = ASSETS.filter(a => a.src !== 'assets/cabecalho.png').map(a => `- "${a.name}"`).join('\n');
  return `Você vai me ajudar a montar páginas do jornal mensal impresso "Transformar é Possível" (TEP), do vereador Wanderley Porto, de Belo Horizonte. Eu monto as páginas num editor visual; você me devolve cada página como um bloco JSON que eu colo no botão "Colar página do Claude" do editor.

COMO RESPONDER
- Quando eu pedir uma página, responda com UM bloco de código \`\`\`json contendo a página, e depois, fora do bloco, no máximo 3 linhas explicando o que fez.
- Use só os textos que eu mandar. Pode corrigir ortografia e encurtar se não couber, mas me avise o que mudou. Nunca invente dados, números, nomes ou falas.
- Se eu pedir ajuste numa página já feita, devolva a página inteira de novo, corrigida.

A PÁGINA
- Unidade: pontos (pt). Página: 772.4 de largura × 1077.2 de altura. Origem (0,0) no canto superior esquerdo.
- Área útil: x de 56.7 a 715.7 (largura 659) e y de 85 a 1020.5. Nada pode sair dessa área.
- Toda página começa com a faixa laranja da editoria (copie exatamente, trocando só o texto da editoria):
  {"type":"rect","name":"Faixa da editoria","x":56.7,"y":85,"w":659,"h":40.1,"fill":"#f37648"},
  {"type":"text","name":"Editoria","text":"NOME DA EDITORIA","font":"Roboto-Regular","size":23.2,"lh":28,"color":"#ffffff","align":"center","x":56.7,"y":92.07,"w":659,"h":28}
- Logo abaixo, o título centralizado (Roboto-Black, 30 a 33, cor #231f20) e a linha fina (Roboto-Italic 16, cor #4da699).
- Texto corrido: Roboto-Regular 11.5, entrelinha (lh) 16, cor #231f20, alinhado à esquerda ou "justify" em colunas de 200 pt ou mais.
- Deixe pelo menos 10 a 16 pt de espaço entre blocos. Alinhe as bordas: blocos lado a lado com o mesmo y, colunas com o mesmo x.

FORMATO DO JSON
{
  "name": "Nome curto da página",
  "elements": [ ...itens, do fundo para a frente (o primeiro fica atrás)... ]
}
Cada item tem "type" ("text", "image" ou "rect"), "name" (descrição curta), "x", "y", "w", "h".

Texto ("type":"text"):
- "text": o conteúdo. Use \\n para quebrar linha e **assim** para negrito.
- "font": uma destas: ${fontes}
- "size" (corpo) e "lh" (entrelinha, em geral 1,3 a 1,4 vezes o corpo).
- "color" em hexadecimal; "align": "left", "center", "right" ou "justify".
- Opcional: "bg" (cor de fundo da caixa) e "padT", "padR", "padB", "padL" (margem interna).
- A altura "h" precisa caber o texto: número de linhas × lh + margens internas. Calcule as linhas pela largura (em média cabem w ÷ (size × 0,5) caracteres por linha). Se não couber, diminua o texto ou aumente a caixa. Texto que estoura aparece com borda vermelha no editor.

Retângulo ("type":"rect"): "fill" (cor ou null), opcional "stroke" (cor do contorno) e "sw" (espessura). Use para boxes, faixas e fios (fio = retângulo com h 1 a 1.5).

Imagem ("type":"image"):
- "src": o nome exato de uma imagem da galeria abaixo, ou null quando a foto ainda não existe (eu coloco a foto depois no editor; deixe o quadro do tamanho certo).
- "fit": "cover" (preenche o quadro, cortando o excesso) ou "contain" (mostra a imagem inteira).
- "foco": "topo", "centro" ou "base" (qual parte da foto aparece quando o "cover" corta em cima ou embaixo; para fotos de pessoas use "topo").

CORES DO JORNAL
- Laranja: #f26532 (destaques, números, boxes) · Faixa: #f37648
- Verde: #4da699 (linha fina, fios, citações) · Verde-escuro para gráficos: #178f7f
- Texto: #231f20 · Branco: #ffffff · Fundo claro de box: #fdeae2
- Recursos comuns: citação em laranja itálico entre aspas grandes; box de números com fundo #fdeae2 e números em Roboto-Black laranja; box de serviço com contorno verde.

IMAGENS DA GALERIA (use o nome exato):
${galeria}

Confirme que entendeu em uma frase e espere eu mandar o conteúdo da primeira página.`;
}

// Tira o JSON de dentro do texto colado (aceita o bloco ```json, texto antes/depois, uma página ou {"pages":[...]})
function extrairJSON(texto) {
  const bloco = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let t = bloco ? bloco[1] : texto;
  const i = t.indexOf('{'), j = t.lastIndexOf('}');
  if (i < 0 || j < i) throw new Error('não encontrei nenhum bloco { ... } no texto colado');
  t = t.slice(i, j + 1).replace(/[“”]/g, '"').replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(t);
}

function numero(v, padrao) {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return Number.isFinite(n) ? n : padrao;
}

function cor(v, padrao) {
  if (v === null) return null;
  return typeof v === 'string' && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v.trim()) ? v.trim() : padrao;
}

function acharImagem(src) {
  if (!src) return null;
  const s = String(src).trim().toLowerCase();
  return ASSETS.find(a => a.src.toLowerCase() === s || a.name.toLowerCase() === s)
    || ASSETS.find(a => a.name.toLowerCase().includes(s) || s.includes(a.name.toLowerCase()))
    || null;
}

function normalizarElemento(o, avisos) {
  const g = {
    name: String(o.name || '').slice(0, 80),
    x: numero(o.x, MARGIN.l), y: numero(o.y, 140), w: Math.max(4, numero(o.w, 200)), h: Math.max(4, numero(o.h, 40)),
    opacity: Math.min(100, Math.max(0, numero(o.opacity, 100))),
  };
  if (g.x < 0 || g.y < 0 || g.x + g.w > PAGE_W + 0.5 || g.y + g.h > PAGE_H + 0.5) {
    avisos.push(`"${g.name || o.type}" sai da página`);
  }
  if (o.type === 'text') {
    let font = FONTS[o.font] ? o.font : 'Roboto-Regular';
    if (o.font && !FONTS[o.font]) avisos.push(`fonte "${o.font}" não existe; usei Roboto`);
    const size = numero(o.size, 11.5);
    return textEl(Object.assign(g, {
      text: String(o.text ?? ''), font, size, lh: numero(o.lh, Math.round(size * 1.35 * 10) / 10),
      color: cor(o.color, COLORS.texto), align: ['left', 'center', 'right', 'justify'].includes(o.align) ? o.align : 'left',
      bg: o.bg ? cor(o.bg, null) : null,
      padT: numero(o.padT, 0), padR: numero(o.padR, 0), padB: numero(o.padB, 0), padL: numero(o.padL, 0),
    }));
  }
  if (o.type === 'rect') {
    return rectEl(Object.assign(g, {
      fill: o.fill === null ? null : cor(o.fill, COLORS.laranja), stroke: cor(o.stroke, '#000000'), sw: numero(o.sw, 0),
    }));
  }
  if (o.type === 'image') {
    const el = imageEl(Object.assign(g, { iw: g.w }));
    const a = acharImagem(o.src);
    if (o.src && !a) avisos.push(`imagem "${o.src}" não está na galeria; deixei o quadro vazio`);
    if (a) {
      Object.assign(el, { src: a.src, nw: a.nw, nh: a.nh, k: a.k || 1 });
      const modo = FIT_MODES.includes(o.fit) ? o.fit : 'cover';
      const f = modo === 'cover' ? Math.max(el.w / el.nw, el.h / el.nh) : Math.min(el.w / el.nw, el.h / el.nh);
      el.iw = el.nw * f;
      const ih = el.nh * f;
      el.ix = (el.w - el.iw) / 2;
      el.iy = o.foco === 'topo' ? 0 : o.foco === 'base' ? el.h - ih : (el.h - ih) / 2;
    }
    return el;
  }
  avisos.push(`item de tipo "${o.type}" ignorado`);
  return null;
}

function paginasDoJSON(dados, avisos) {
  const lista = Array.isArray(dados) ? dados : Array.isArray(dados.pages) ? dados.pages : [dados];
  return lista.map((p, n) => {
    if (!p || !Array.isArray(p.elements)) throw new Error(`a página ${n + 1} não tem a lista "elements"`);
    return {
      id: uid(),
      name: String(p.name || 'Página do Claude').slice(0, 60),
      elements: p.elements.map(o => normalizarElemento(o || {}, avisos)).filter(Boolean),
    };
  });
}

function abrirColar() {
  openModal(`<h3>Colar página do Claude</h3>
    <p class="muted">Cole aqui a resposta do Claude (pode ser a mensagem inteira). A página entra logo depois da página aberta, sem apagar nada.</p>
    <textarea id="colarTexto" style="min-height:220px;font-family:ui-monospace,monospace;font-size:12px" placeholder='{ "name": "...", "elements": [ ... ] }'></textarea>
    <p id="colarErro" class="warn"></p>
    <div class="btnrow"><button class="primary" id="colarOk">Adicionar ao jornal</button></div>
    <hr>
    <p class="muted">Primeira vez? Copie as instruções e cole no começo de uma conversa nova com o Claude.</p>
    <div class="btnrow"><button id="colarPrompt">Copiar instruções para o Claude</button></div>`);
  document.getElementById('colarTexto').focus();
  document.getElementById('colarPrompt').onclick = async () => {
    const t = promptParaClaude();
    try { await navigator.clipboard.writeText(t); toast('Instruções copiadas. Cole no Claude.'); }
    catch (e) { document.getElementById('colarTexto').value = t; toast('Não consegui copiar sozinho: as instruções estão na caixa, copie com Ctrl+C.', 5000); }
  };
  document.getElementById('colarOk').onclick = () => {
    const erro = document.getElementById('colarErro');
    const avisos = [];
    let paginas;
    try {
      paginas = paginasDoJSON(extrairJSON(document.getElementById('colarTexto').value), avisos);
    } catch (e) {
      erro.textContent = 'Não consegui ler: ' + e.message + '. Peça ao Claude para mandar só o bloco JSON.';
      return;
    }
    if (editingId) stopEditing();
    for (const p of paginas) {
      state.pages.splice(state.cur + 1, 0, p);
      state.cur += 1;
    }
    selId = null;
    commit(); renderAll(); closeModal();
    toast(`${paginas.length > 1 ? paginas.length + ' páginas adicionadas' : 'Página adicionada'}.` +
      (avisos.length ? ' Atenção: ' + [...new Set(avisos)].slice(0, 3).join('; ') + '.' : ''), avisos.length ? 8000 : 3000);
  };
}

document.getElementById('btnColar').addEventListener('click', abrirColar);
