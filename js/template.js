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
  { src: 'assets/foto-visita-cirurgia.jpg', name: 'Visita ao centro cirúrgico', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/dia-comissao.jpg', name: 'Comissão de Meio Ambiente', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/dia-tribuna.jpg', name: 'Tribuna da Câmara', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/dia-sofia-feldman.jpg', name: 'Hospital Sofia Feldman', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/dia-visita-grupo.jpg', name: 'Visita técnica Diamante/Olaria', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/dia-visita-moradora.jpg', name: 'Visita técnica: moradora', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/dia-visita-conversa.jpg', name: 'Visita técnica: conversa', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/dia-visita-agente.jpg', name: 'Visita técnica: agente', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/dia-coworking.jpg', name: 'Coworking Barreiro', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/dia-demanda.jpg', name: 'Demanda atendida', nw: 720, nh: 1600, k: 1 },
  { src: 'assets/saude-premiacao.jpg', name: 'Hospital Célio de Castro: premiação', nw: 1200, nh: 800, k: 1 },
  { src: 'assets/saude-premiacao-2.jpg', name: 'Hospital Célio de Castro: premiação 2', nw: 1200, nh: 800, k: 1 },
  { src: 'assets/saude-equipe.jpg', name: 'Hospital Célio de Castro: equipe', nw: 1200, nh: 800, k: 1 },
  { src: 'assets/saude-abraco.jpg', name: 'Hospital Célio de Castro: abraço', nw: 1200, nh: 800, k: 1 },
  { src: 'assets/saude-aplausos.jpg', name: 'Hospital Célio de Castro: aplausos', nw: 1200, nh: 800, k: 1 },
  { src: 'assets/saude-sorriso.jpg', name: 'Hospital Célio de Castro: profissional', nw: 1200, nh: 800, k: 1 },
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
    id: uid(), tid: 'capa', name: 'Capa', elements: [
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

// Pág. 3 – Causa Animal (edição Nº 107, novembro de 2026)
function templateP3() {
  const col = (MARGIN.r - MARGIN.l) / 3;
  const num = (i, n, label) => [
    textEl({ name: `Número ${i + 1}`, text: n, font: 'Roboto-Black', size: 40, lh: 44, color: COLORS.laranja,
      align: 'center', x: MARGIN.l + col * i, y: 822, w: col, h: 44 }),
    textEl({ name: `Legenda do número ${i + 1}`, text: label, font: 'Roboto-Regular', size: 14, lh: 18, color: COLORS.texto,
      align: 'center', x: MARGIN.l + col * i, y: 866, w: col, h: 18 }),
  ];
  return {
    id: uid(), tid: 'p3', tver: 2, name: 'Causa Animal', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'CAUSA ANIMAL', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'Tecnologia de ponta e atendimento gratuito', font: 'Roboto-Black', size: 33, lh: 40,
        color: COLORS.texto, align: 'center', x: 126.2, y: 150, w: 520, h: 80,
      }),
      textEl({
        name: 'Linha fina', text: 'Hospital veterinário de BH é referência em cuidado animal', font: 'Roboto-Italic',
        size: 16, lh: 20, color: COLORS.verde, align: 'center', x: 56.7, y: 236, w: 659, h: 22,
      }),
      textEl({
        name: 'Texto',
        text: 'O vereador Wanderley Porto visitou o Centro Avançado de Saúde Animal (Casa), inaugurado no Buritis, ' +
          'no dia 2 de setembro, e conheceu de perto uma estrutura moderna, com tecnologia para exames, ' +
          'cirurgias e tratamento de cães e gatos.',
        font: 'Roboto-Regular', size: 11.5, lh: 16, color: COLORS.texto, align: 'justify',
        x: 56.7, y: 278, w: 207.4, h: 115,
      }),
      imageEl({
        name: 'Foto: fachada', src: 'assets/foto-fachada.jpg', nw: 960, nh: 1708, k: 0.5,
        x: 56.7, y: 405, w: 207.4, h: 175, ix: 0, iy: -51.8, iw: 207.4,
      }),
      imageEl({
        name: 'Foto: visita ao centro cirúrgico', src: 'assets/foto-visita-cirurgia.jpg', nw: 960, nh: 1708, k: 0.5,
        x: 280, y: 278, w: 435.7, h: 302, ix: 0, iy: -181.5, iw: 435.7,
      }),
      // olho
      rectEl({ name: 'Fio acima do olho', fill: COLORS.verde, x: 56.7, y: 600, w: 659, h: 1.5 }),
      textEl({
        name: 'Aspas de abertura', text: '“', font: 'Roboto-Black', size: 72, lh: 72, color: COLORS.laranja,
        x: 64, y: 604, w: 50, h: 72,
      }),
      textEl({
        name: 'Olho',
        text: 'Equipamentos modernos, estrutura ampla e confortável e profissionais preparados para casos de maior ' +
          'complexidade. Uma grande melhoria na qualidade do atendimento e, principalmente, no bem-estar dos animais. ' +
          'É a realização de um sonho para a rede pública de proteção animal de BH.',
        font: 'Roboto-BoldItalic', size: 18, lh: 24, color: COLORS.laranja, align: 'center',
        x: 120, y: 616, w: 532, h: 122,
      }),
      textEl({
        name: 'Aspas de fechamento', text: '”', font: 'Roboto-Black', size: 72, lh: 72, color: COLORS.laranja,
        x: 666, y: 690, w: 50, h: 72,
      }),
      textEl({
        name: 'Autor do olho', text: 'Vereador Wanderley Porto', font: 'Roboto-Regular', size: 12, lh: 16,
        color: COLORS.verde, align: 'center', x: 120, y: 744, w: 532, h: 16,
      }),
      rectEl({ name: 'Fio abaixo do olho', fill: COLORS.verde, x: 56.7, y: 772, w: 659, h: 1.5 }),
      // infográfico
      rectEl({ name: 'Fundo do infográfico', fill: '#fdeae2', x: 56.7, y: 790, w: 659, h: 110 }),
      textEl({
        name: 'Título do infográfico', text: 'ATENDIMENTOS GRATUITOS REALIZADOS EM UM MÊS', font: 'Roboto-Bold',
        size: 12, lh: 16, color: COLORS.texto, align: 'center', x: 56.7, y: 801, w: 659, h: 16,
      }),
      ...num(0, '934', 'atendimentos'),
      ...num(1, '226', 'cirurgias'),
      ...num(2, '+1.700', 'exames'),
      rectEl({ name: 'Divisória 1', fill: COLORS.laranja, x: MARGIN.l + col - 0.5, y: 830, w: 1, h: 52 }),
      rectEl({ name: 'Divisória 2', fill: COLORS.laranja, x: MARGIN.l + col * 2 - 0.5, y: 830, w: 1, h: 52 }),
      // box de serviço: título centralizado e duas colunas iguais, separadas por um fio
      rectEl({ name: 'Box de serviço', fill: null, stroke: COLORS.verde, sw: 1.5, x: 56.7, y: 908, w: 659, h: 112.5 }),
      textEl({
        name: 'Serviço: título', text: 'Serviço', font: 'Roboto-Medium', size: 20, lh: 24, color: COLORS.laranja,
        align: 'center', x: 56.7, y: 916, w: 659, h: 24,
      }),
      textEl({
        name: 'Serviço: endereço',
        text: '**Casa (Centro Avançado de Saúde Animal)**\nRua Líbero Leone, 259, Bloco Carandá 2 – Buritis\n**Telefone:** (31) 2888-0909 - ramal 2',
        font: 'Roboto-Regular', size: 11.5, lh: 16, color: COLORS.texto, align: 'center',
        x: 70.7, y: 946, w: 301.5, h: 64,
      }),
      rectEl({ name: 'Serviço: divisória', fill: COLORS.verde, x: 385.7, y: 948, w: 1, h: 60 }),
      textEl({
        name: 'Serviço: atendimento',
        text: '**Atendimento**\nDistribuição de 45 senhas diárias por ordem de chegada,\ncom horário de funcionamento de 8h às 17h,\nde segunda a sexta.',
        font: 'Roboto-Regular', size: 11.5, lh: 16, color: COLORS.texto, align: 'center',
        x: 400.7, y: 946, w: 301.5, h: 64,
      }),
    ],
  };
}

// Pág. 4 – Saúde (Hospital Metropolitano Dr. Célio de Castro)
function templateP4() {
  // foto que preenche o quadro, centralizada
  const cover = (o) => {
    const f = Math.max(o.w / o.nw, o.h / o.nh);
    return imageEl(Object.assign(o, { iw: o.nw * f, ix: (o.w - o.nw * f) / 2, iy: (o.h - o.nh * f) / 2 }));
  };
  const premio = (i, a, b) => [
    textEl({ name: `Prêmio ${i + 1}`, text: a, font: 'Roboto-Black', size: 36, lh: 40, color: COLORS.laranja,
      align: 'center', x: 56.7 + i * 216, y: 664, w: 216, h: 40 }),
    textEl({ name: `Categoria ${i + 1}`, text: b, font: 'Roboto-Regular', size: 13, lh: 16, color: COLORS.texto,
      align: 'center', x: 56.7 + i * 216, y: 704, w: 216, h: 16 }),
  ];
  return {
    id: uid(), tid: 'p4', tver: 1, name: 'Saúde', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'SAÚDE', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'Hospital do Barreiro é premiado por iniciativas\nde valorização dos profissionais',
        font: 'Roboto-Black', size: 30, lh: 36, color: COLORS.texto, align: 'center', x: 56.7, y: 150, w: 659, h: 72,
      }),
      textEl({
        name: 'Linha fina', text: 'Prêmio Ser Humano reconhece projetos do Hospital Metropolitano Dr. Célio de Castro',
        font: 'Roboto-Italic', size: 16, lh: 20, color: COLORS.verde, align: 'center', x: 56.7, y: 228, w: 659, h: 22,
      }),
      textEl({
        name: 'Texto',
        text: 'O Hospital Metropolitano Dr. Célio de Castro, no Barreiro, conquistou dois reconhecimentos no Prêmio ' +
          'Ser Humano, promovido pela Associação Brasileira de Recursos Humanos de Minas Gerais.\n\n' +
          'A instituição alcançou o 1º lugar na categoria Desenvolvimento e o 3º lugar em Excelência Organizacional, ' +
          'com projetos voltados à valorização dos profissionais e ao aprimoramento da gestão hospitalar.\n\n' +
          'As iniciativas premiadas fortalecem a confiança entre as lideranças e incentivam o acolhimento, ' +
          'o autocuidado e o bem-estar das equipes. Cuidar de quem cuida também contribui para a qualidade ' +
          'do atendimento à população.',
        font: 'Roboto-Regular', size: 11.5, lh: 16, color: COLORS.texto, align: 'left',
        x: 56.7, y: 268, w: 207.4, h: 336,
      }),
      cover({ name: 'Foto principal', src: 'assets/saude-premiacao.jpg', nw: 1200, nh: 800, x: 280, y: 268, w: 435.7, h: 330 }),
      textEl({
        name: 'Crédito das fotos', text: 'Fotos: divulgação / Hospital Metropolitano Dr. Célio de Castro',
        font: 'Roboto-Italic', size: 8, lh: 10, color: '#77746d', align: 'right', x: 280, y: 601, w: 435.7, h: 10,
      }),
      // prêmios + emendas
      rectEl({ name: 'Fundo dos prêmios', fill: '#fdeae2', x: 56.7, y: 622, w: 432, h: 110 }),
      textEl({
        name: 'Título dos prêmios', text: 'PRÊMIO SER HUMANO · ABRH-MG', font: 'Roboto-Bold', size: 12, lh: 16,
        color: COLORS.texto, align: 'center', x: 56.7, y: 634, w: 432, h: 16,
      }),
      ...premio(0, '1º lugar', 'Desenvolvimento'),
      ...premio(1, '3º lugar', 'Excelência Organizacional'),
      rectEl({ name: 'Divisória dos prêmios', fill: COLORS.laranja, x: 272.2, y: 664, w: 1, h: 52 }),
      rectEl({ name: 'Fundo das emendas', fill: COLORS.verde, x: 503.7, y: 622, w: 212, h: 110 }),
      textEl({
        name: 'Emendas: valor', text: '+ de R$\u00a01,2 milhão', font: 'Roboto-Black', size: 22, lh: 26, color: COLORS.branco,
        align: 'center', x: 503.7, y: 646, w: 212, h: 26,
      }),
      textEl({
        name: 'Emendas: legenda', text: 'em emendas do vereador\nWanderley Porto para o hospital', font: 'Roboto-Regular',
        size: 12.5, lh: 16, color: COLORS.branco, align: 'center', x: 503.7, y: 678, w: 212, h: 32,
      }),
      // citação + foto da equipe
      textEl({
        name: 'Citação',
        text: '“Tenho uma grande satisfação em apoiar o Hospital com a destinação de recursos. Já destinei mais de ' +
          'R$\u00a01,2 milhão em emendas parlamentares para fortalecer o atendimento.”',
        font: 'Roboto-Bold', size: 15, lh: 21, color: COLORS.branco, bg: COLORS.verde, align: 'center',
        x: 56.7, y: 752, w: 300, h: 268.5, padT: 62, padR: 22, padB: 18, padL: 22,
      }),
      textEl({
        name: 'Autor da citação', text: 'Vereador Wanderley Porto', font: 'Roboto-Regular', size: 11, lh: 14,
        color: COLORS.branco, align: 'center', x: 56.7, y: 958, w: 300, h: 14,
      }),
      cover({ name: 'Foto da equipe', src: 'assets/saude-equipe.jpg', nw: 1200, nh: 800, x: 372, y: 752, w: 343.7, h: 268.5 }),
    ],
  };
}

function templateBranco() {
  return { id: uid(), name: 'Página em branco', elements: [] };
}

// Pág. 2 – Dia a dia em ação: grade 3 × 3 de fotos com legenda, como nas edições de maio e junho
function templateP2() {
  const S = 204.5;                                   // lado de cada foto
  const xs = [MARGIN.l, (PAGE_W - S) / 2, MARGIN.r - S];
  const ys = [238.5, 485, 731.5];
  // [arquivo, largura, altura, fator de resolução, recorte quadrado na foto original (x, y, lado), legenda]
  const fotos = [
    ['dia-comissao.jpg', 720, 1280, 1, 0, 340, 720, 'Comissão de Meio Ambiente, Defesa\ndos Animais e Política Urbana'],
    ['dia-tribuna.jpg', 720, 1280, 1, 160, 640, 560, 'Pronunciamento no plenário\nda Câmara Municipal'],
    ['dia-sofia-feldman.jpg', 720, 1280, 1, 72, 270, 576, 'Emendas destinadas ao\nHospital Sofia Feldman'],
    ['dia-visita-grupo.jpg', 960, 1708, 0.5, 120, 280, 710, 'Visita técnica sobre sinalização\nnos bairros Diamante e Olaria'],
    ['dia-visita-conversa.jpg', 960, 1708, 0.5, 150, 290, 700, 'Conversa sobre as demandas\nde trânsito da região'],
    ['dia-visita-agente.jpg', 960, 1708, 0.5, 200, 280, 710, 'Avaliação de melhorias\nde sinalização no local'],
    ['dia-coworking.jpg', 720, 1280, 1, 10, 190, 700, 'Encontro no Coworking Barreiro\nsobre projetos sociais'],
    ['foto-cumprimento.jpg', 960, 1708, 0.5, 0, 0, 960, 'Visita ao Centro Avançado de\nSaúde Animal – Buritis'],
    ['dia-demanda.jpg', 720, 1600, 1, 0, 200, 720, 'Demanda atendida pelo gabinete'],
  ];
  const tiles = [];
  fotos.forEach(([file, nw, nh, k, cx, cy, side, legenda], i) => {
    const x = xs[i % 3], y = ys[Math.floor(i / 3)], f = S / side;
    tiles.push(imageEl({
      name: `Foto ${i + 1}`, src: 'assets/' + file, nw, nh, k,
      x, y, w: S, h: S, ix: -cx * f, iy: -cy * f, iw: nw * f,
    }));
    tiles.push(textEl({
      name: `Legenda ${i + 1}`, text: legenda, font: 'RobotoCondensed-Bold', size: 12.4, lh: 15.6,
      color: '#ea5b27', align: 'center', x, y: y + S + 6, w: S, h: 32,
    }));
  });
  return {
    id: uid(), tid: 'p2', tver: 3, name: 'Dia a dia em ação', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'DIA A DIA EM AÇÃO', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'Trabalho que não para!', font: 'Roboto-Black', size: 33, lh: 40,
        color: COLORS.preto, align: 'center', x: 56.7, y: 162, w: 659, h: 42,
      }),
      ...tiles,
      textEl({
        name: 'Rodapé', text: '@wanderleyporto Conheça mais o trabalho do vereador!', font: 'Roboto-Bold', size: 16, lh: 20,
        color: COLORS.preto, align: 'center', x: 56.7, y: 1004.9, w: 659, h: 20,
      }),
    ],
  };
}

// Versões antigas de páginas do modelo. Se a página salva ainda estiver igual a uma delas
// (ninguém mexeu), ela é trocada pela versão nova automaticamente.
function legacyTemplates() {
  const p2 = templateMateria();
  p2.tid = 'p2';
  p2.name = 'Pág. 2 (a definir)';
  return [p2];
}

// Conteúdo da página sem os identificadores, para comparar versões.
function pageSig(p) {
  return JSON.stringify(p.elements.map(({ id, ...rest }) => rest));
}

// Páginas da edição atual, na ordem. Cada uma tem um "tid" fixo: quando uma página nova entra aqui,
// quem já usa o editor recebe essa página automaticamente, sem perder o que já editou.
function defaultState() {
  const pages = [templateCapa(), templateP2(), templateP3(), templateP4()];
  pages.forEach(p => { p.tsig = pageSig(p); });
  return { version: 1, cur: 0, pages, seenTids: pages.map(p => p.tid) };
}
