// Modelos de página do jornal "Transformar é Possível" (TEP).
// Todas as medidas estão em pontos (pt), no tamanho real da página impressa.

const PAGE_W = 772.441;
const PAGE_H = 1077.17;
const MARGIN = { l: 56.7, r: 715.7, t: 56.7, b: 1020.5 };

const COLORS = {
  laranja: '#f26532',
  laranjaFaixa: '#f37648',
  verde: '#4da699',
  texto: '#231f20',
  cinzaSelo: '#7c7e70',
  preto: '#000000',
  branco: '#ffffff',
};

// Fontes disponíveis. "bold" é a variante usada no trecho marcado com **negrito**.
const FONTS = {
  'Roboto-Regular': { label: 'Roboto', bold: 'Roboto-Bold' },
  'Roboto-Italic': { label: 'Roboto Itálico', bold: 'Roboto-BoldItalic' },
  'Roboto-Medium': { label: 'Roboto Medium', bold: 'Roboto-Black' },
  'Roboto-Bold': { label: 'Roboto Negrito', bold: 'Roboto-Black' },
  'Roboto-BoldItalic': { label: 'Roboto Negrito Itálico', bold: 'Roboto-BoldItalic' },
  'Roboto-Black': { label: 'Roboto Black', bold: 'Roboto-Black' },
  'RobotoCondensed-Regular': { label: 'Roboto Condensed', bold: 'RobotoCondensed-Bold' },
  'RobotoCondensed-Bold': { label: 'Roboto Condensed Negrito', bold: 'RobotoCondensed-Bold' },
};

// Imagens que já vêm no editor. "k" = fator de resolução real (frames de vídeo foram ampliados 2x).
const ASSETS = [
  { src: 'assets/foto-sala-espera.jpg', name: 'Sala de espera', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/foto-sala-espera-2.jpg', name: 'Sala de espera 2', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/foto-sorriso.jpg', name: 'Conversa com tutora', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/foto-cumprimento.jpg', name: 'Cumprimento', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/foto-fachada.jpg', name: 'Fachada do CASA', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/anuncio-blackzap.jpg', name: 'Anúncio BlackZAP', nw: 1600, nh: 1240, k: 1 },
  { src: 'assets/cabecalho.png', name: 'Cabeçalho', nw: 2784, nh: 601, k: 1 },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function textEl(o) {
  return Object.assign({
    id: uid(), type: 'text', name: '', x: 100, y: 100, w: 250, h: 40,
    text: 'Novo texto', font: 'Roboto-Regular', size: 16, lh: 20, color: COLORS.texto,
    align: 'left', bg: null, padT: 0, padR: 0, padB: 0, padL: 0,
    opacity: 100, locked: false, hidden: false,
  }, o);
}

function imageEl(o) {
  return Object.assign({
    id: uid(), type: 'image', name: '', x: 100, y: 100, w: 300, h: 200,
    src: null, nw: 1, nh: 1, k: 1, ix: 0, iy: 0, iw: 300,
    opacity: 100, locked: false, hidden: false,
  }, o);
}

function rectEl(o) {
  return Object.assign({
    id: uid(), type: 'rect', name: '', x: 100, y: 100, w: 200, h: 100,
    fill: COLORS.laranja, stroke: '#000000', sw: 0,
    opacity: 100, locked: false, hidden: false,
  }, o);
}

function templateCapa() {
  return {
    id: uid(), name: 'Capa', elements: [
      imageEl({
        name: 'Cabeçalho', src: 'assets/cabecalho.png', nw: 2784, nh: 601,
        x: 47.92, y: 88.0, w: 668.16, h: 144.24, ix: 0, iy: 0, iw: 668.16, locked: true,
      }),
      textEl({
        name: 'Selo: mês', text: 'Novembro', font: 'RobotoCondensed-Bold', size: 9, lh: 10.8,
        color: COLORS.cinzaSelo, align: 'center', x: 630.3, y: 101.23, w: 45.4, h: 11,
      }),
      textEl({
        name: 'Selo: ano', text: '2026', font: 'RobotoCondensed-Bold', size: 21.1, lh: 21.1,
        color: COLORS.cinzaSelo, x: 630.3, y: 112.14, w: 50, h: 22,
      }),
      textEl({
        name: 'Selo: número', text: 'Nº 107\nANO IX', font: 'RobotoCondensed-Bold', size: 9, lh: 11,
        color: COLORS.cinzaSelo, x: 683.6, y: 109.67, w: 32, h: 23,
      }),
      imageEl({
        name: 'Foto da capa', src: 'assets/foto-sala-espera.jpg', nw: 960, nh: 1708, k: 0.5,
        x: 300, y: 253.3, w: 415.7, h: 234.5, ix: 0, iy: -173.2, iw: 415.7,
      }),
      textEl({
        name: 'Manchete', text: 'Centro Avançado de\nSaúde Animal', font: 'Roboto-Black', size: 27, lh: 35,
        color: COLORS.branco, bg: COLORS.laranja, x: 75, y: 259, w: 273, h: 90,
        padT: 7, padR: 16, padB: 13, padL: 11,
      }),
      textEl({
        name: 'Texto da capa',
        text: 'Novo hospital público veterinário de BH é referência em tecnologia e estrutura. ' +
          'O vereador Wanderley Porto foi recebido pela diretoria da unidade e conheceu toda a sede, no bairro Buritis.',
        font: 'Roboto-Regular', size: 13, lh: 17, color: COLORS.preto, x: 74.6, y: 362, w: 210, h: 122,
      }),
      imageEl({
        name: 'Anúncio', src: 'assets/anuncio-blackzap.jpg', nw: 1600, nh: 1240,
        x: 56.7, y: 509.775, w: 659, h: 510.725, ix: 0, iy: 0, iw: 659,
      }),
    ],
  };
}

function templateMateria() {
  return {
    id: uid(), name: 'Matéria', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'EDITORIA', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'Título da matéria', font: 'Roboto-Black', size: 33, lh: 40,
        color: COLORS.texto, align: 'center', x: 56.7, y: 162, w: 659, h: 42,
      }),
      textEl({
        name: 'Linha fina', text: 'Linha fina que resume a matéria', font: 'Roboto-Italic', size: 16, lh: 20,
        color: COLORS.verde, align: 'center', x: 56.7, y: 207.7, w: 659, h: 22,
      }),
      textEl({
        name: 'Texto', text: 'Cole aqui o texto da matéria. Use **dois asteriscos** para destacar em negrito.',
        font: 'Roboto-Regular', size: 11.5, lh: 16, color: COLORS.texto, align: 'justify',
        x: 56.7, y: 250.9, w: 207.4, h: 360,
      }),
      imageEl({ name: 'Foto', x: 280, y: 250.6, w: 435.7, h: 300, iw: 435.7 }),
      textEl({
        name: 'Citação', text: '“O texto da citação vai aqui.”\nNome, cargo', font: 'Roboto-Bold', size: 14.6, lh: 20,
        color: COLORS.branco, bg: COLORS.verde, align: 'center',
        x: 280, y: 595.8, w: 208.3, h: 109.8, padT: 14, padR: 14, padB: 14, padL: 14,
      }),
    ],
  };
}

function templateBranco() {
  return { id: uid(), name: 'Página em branco', elements: [] };
}

function defaultState() {
  return { version: 1, cur: 0, pages: [templateCapa()] };
}
