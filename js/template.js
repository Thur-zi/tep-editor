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
  { src: 'assets/casa-equipamento.jpg', name: 'CASA: olhando o equipamento (vídeo)', nw: 1080, nh: 1920, k: 1 },
  { src: 'assets/casa-conversa-diretoria.jpg', name: 'CASA: conversa com a diretoria (original)', nw: 1080, nh: 1920, k: 1 },
  { src: 'assets/casa-corredor.jpg', name: 'CASA: corredor com a equipe (original)', nw: 1080, nh: 1920, k: 1 },
  { src: 'assets/casa-sala-atendimento.jpg', name: 'CASA: sala de atendimento (original)', nw: 1080, nh: 1920, k: 1 },
  { src: 'assets/casa-fachada.jpg', name: 'CASA: fachada (original)', nw: 1080, nh: 1920, k: 1 },
  { src: 'assets/capa-casa-cumprimento.jpg', name: 'CASA: cumprimento na entrada (original)', nw: 1080, nh: 1920, k: 1 },
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
  { src: 'assets/dia-evento-criancas.jpg', name: 'Evento para as crianças no Diamante', nw: 960, nh: 1708, k: 0.5 },
  { src: 'assets/dia-campanha.jpg', name: 'Campanha presidencial', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/icone-instagram.svg', name: 'Ícone do Instagram', nw: 512, nh: 512, k: 1 },
  { src: 'assets/tirol-drenagem.jpg', name: 'Tirol: obra de drenagem (Divulgação/PBH)', nw: 1600, nh: 808, k: 1 },
  { src: 'assets/tirol-wanderley.jpg', name: 'Tirol: Wanderley na obra', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/tirol-asfalto.jpg', name: 'Tirol: Rua Júlio Mesquita', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/tirol-canteiro.jpg', name: 'Tirol: canteiro da avenida', nw: 720, nh: 1280, k: 1 },
  { src: 'assets/qr-whatsapp.svg', name: 'QR code do WhatsApp (31) 98282-6850', nw: 1024, nh: 1024, k: 1 },
  { src: 'assets/novembro-azul-foto.jpg', name: 'Novembro Azul: foto', nw: 1110, nh: 550, k: 1 },
  { src: 'assets/laco-novembro-azul.svg', name: 'Laço do Novembro Azul', nw: 1024, nh: 1024, k: 1 },
  { src: 'assets/empreendedoras.svg', name: 'Ilustração: empreendedoras', nw: 2048, nh: 512, k: 1 },
  { src: 'assets/bandeira-wanderley.jpg', name: 'Wanderley com a bandeira', nw: 2000, nh: 2000, k: 1 },
  { src: 'assets/bandeira-palmeiras.jpg', name: 'Bandeira com palmeiras (Unsplash)', nw: 2600, nh: 1733, k: 1 },
  { src: 'assets/icone-empreendedorismo.svg', name: 'Ícone: empreendedorismo feminino', nw: 600, nh: 600, k: 1 },
  { src: 'assets/icone-empreendedora.svg', name: 'Ícone: empreendedora', nw: 600, nh: 600, k: 1 },
  { src: 'assets/bandeira-brasil.svg', name: 'Bandeira do Brasil', nw: 1000, nh: 700, k: 1 },
  { src: 'assets/anuncios-coluna.jpg', name: 'Anúncios da última página (coluna)', nw: 859, nh: 3539, k: 1 },
  { src: 'assets/rodape-anuncios-contato.jpg', name: 'Anúncios, atendimento e expediente', nw: 1802, nh: 1495, k: 1 },
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
    id: uid(), tid: 'capa', tver: 2, name: 'Capa', elements: [
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
        name: 'Foto da capa', src: 'assets/capa-casa-cumprimento.jpg', nw: 1080, nh: 1920, k: 1,
        x: 300, y: 253.3, w: 415.7, h: 234.5, ix: 0, iy: -107.77, iw: 415.7,
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
    id: uid(), tid: 'p3', tver: 5, name: 'Causa Animal', elements: [
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
        name: 'Foto: fachada', src: 'assets/casa-fachada.jpg', nw: 1080, nh: 1920, k: 1,
        x: 56.7, y: 405, w: 207.4, h: 175, ix: 0, iy: -72.97, iw: 207.4,
      }),
      imageEl({
        name: 'Foto: visita ao centro cirúrgico', src: 'assets/casa-equipamento.jpg', nw: 1080, nh: 1920, k: 1,
        x: 280, y: 278, w: 435.7, h: 302, ix: 0, iy: -137.16, iw: 435.7,
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

// Pág. 5 – Tirol: melhorias na prática (duas notas: asfalto da Júlio Mesquita e drenagem da rotatória)
function templateP5() {
  // foto recortada: (cx, cy, cw) é a área da foto original que aparece no quadro
  const crop = (o, cx, cy, cw) => {
    const f = o.w / cw;
    return imageEl(Object.assign(o, { iw: o.nw * f, ix: -cx * f, iy: -cy * f }));
  };
  const stat = (name, a, b, y) => [
    textEl({ name: name + ': número', text: a, font: 'Roboto-Black', size: 30, lh: 34, color: COLORS.laranja,
      align: 'center', x: 56.7, y, w: 263, h: 34 }),
    textEl({ name: name + ': legenda', text: b, font: 'Roboto-Regular', size: 12.5, lh: 16, color: COLORS.texto,
      align: 'center', x: 56.7, y: y + 36, w: 263, h: 16 }),
  ];
  return {
    id: uid(), tid: 'p5', tver: 3, name: 'Tirol', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'TIROL', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'Melhorias na prática', font: 'Roboto-Black', size: 33, lh: 40,
        color: COLORS.texto, align: 'center', x: 56.7, y: 150, w: 659, h: 42,
      }),
      textEl({
        name: 'Linha fina', text: 'Pedidos levados pelo vereador Wanderley Porto viram obras no bairro',
        font: 'Roboto-Italic', size: 16, lh: 20, color: COLORS.verde, align: 'center', x: 56.7, y: 196, w: 659, h: 22,
      }),
      // nota 1: asfalto
      crop({ name: 'Foto: Rua Júlio Mesquita', src: 'assets/tirol-asfalto.jpg', nw: 720, nh: 1280,
        x: 56.7, y: 240, w: 380, h: 290 }, 0, 190, 720),
      textEl({
        name: 'Asfalto: título', text: 'Rua Júlio Mesquita ganha asfalto novo', font: 'Roboto-Black', size: 22, lh: 27,
        color: COLORS.texto, x: 452, y: 240, w: 263.7, h: 54,
      }),
      textEl({
        name: 'Asfalto: texto',
        text: 'Uma reivindicação dos moradores e comerciantes está sendo atendida! O recapeamento foi solicitado ' +
          'pelo vereador Wanderley Porto, após receber um abaixo-assinado com mais de 100 assinaturas.',
        font: 'Roboto-Regular', size: 13, lh: 18, color: COLORS.texto, x: 452, y: 306, w: 263.7, h: 112,
      }),
      rectEl({ name: 'Asfalto: fundo do destaque', fill: '#fdeae2', x: 452, y: 440, w: 263.7, h: 90 }),
      textEl({
        name: 'Asfalto: número', text: '+ de 100', font: 'Roboto-Black', size: 30, lh: 34, color: COLORS.laranja,
        align: 'center', x: 452, y: 454, w: 263.7, h: 34,
      }),
      textEl({
        name: 'Asfalto: legenda do número', text: 'assinaturas no abaixo-assinado', font: 'Roboto-Regular', size: 12.5, lh: 16,
        color: COLORS.texto, align: 'center', x: 452, y: 492, w: 263.7, h: 16,
      }),
      rectEl({ name: 'Divisória entre as notas', fill: COLORS.verde, x: 56.7, y: 552, w: 659, h: 1.5 }),
      // nota 2: drenagem
      textEl({
        name: 'Drenagem: título', text: 'R$\u00a014,7 milhões para reduzir alagamentos', font: 'Roboto-Black', size: 28,
        lh: 34, color: COLORS.texto, align: 'center', x: 56.7, y: 570, w: 659, h: 34,
      }),
      textEl({
        name: 'Drenagem: texto',
        text: 'A nova rede de drenagem na rotatória do Tirol (Praça Deputado José Raimundo) e no entorno vai melhorar ' +
          'o escoamento da água da chuva e ajudar a prevenir enchentes em 13 ruas e avenidas.\n\n' +
          'A obra está sendo realizada após cobrança feita pelo vereador Wanderley Porto.',
        font: 'Roboto-Regular', size: 13, lh: 18, color: COLORS.texto, x: 56.7, y: 620, w: 263, h: 146,
      }),
      rectEl({ name: 'Drenagem: fundo dos números', fill: '#fdeae2', x: 56.7, y: 778, w: 263, h: 242.5 }),
      ...stat('Investimento', 'R$\u00a014,7 mi', 'em obras de drenagem', 818),
      rectEl({ name: 'Drenagem: divisória dos números', fill: COLORS.laranja, x: 128.2, y: 898.5, w: 120, h: 1 }),
      ...stat('Ruas', '13', 'ruas e avenidas beneficiadas', 925),
      crop({ name: 'Foto: obra de drenagem', src: 'assets/tirol-drenagem.jpg', nw: 1600, nh: 808,
        x: 335.7, y: 620, w: 380, h: 388 }, 660, 0, 791),
      textEl({
        name: 'Crédito da foto de drenagem', text: 'Foto: Divulgação/PBH', font: 'Roboto-Italic', size: 8, lh: 10,
        color: '#77746d', align: 'right', x: 335.7, y: 1010.5, w: 380, h: 10,
      }),
    ],
  };
}

// Pág. 6 – Atendimentos (números de janeiro a julho de 2026, com gráfico de barras feito de retângulos)
function templateP6() {
  const OFI = '#f26532', VIS = '#178f7f';            // par validado (cores distintas também para daltonismo)
  const meses = [['Jan', 24, 0], ['Fev', 36, 4], ['Mar', 33, 11], ['Abr', 37, 8], ['Mai', 33, 9], ['Jun', 20, 11], ['Jul', 23, 11]];
  const tileW = (659 - 2 * 16) / 3;
  const tiles = [['+ de 300', 'conversas pelo WhatsApp'], ['206', 'ofícios enviados'], ['54', 'visitas técnicas']]
    .flatMap(([n, l], i) => {
      const x = 56.7 + i * (tileW + 16);
      return [
        rectEl({ name: `Destaque ${i + 1}: fundo`, fill: '#fdeae2', x, y: 262, w: tileW, h: 118 }),
        textEl({ name: `Destaque ${i + 1}: número`, text: n, font: 'Roboto-Black', size: 46, lh: 52, color: COLORS.laranja,
          align: 'center', x, y: 282, w: tileW, h: 52 }),
        textEl({ name: `Destaque ${i + 1}: legenda`, text: l, font: 'Roboto-Regular', size: 15, lh: 19, color: COLORS.texto,
          align: 'center', x, y: 338, w: tileW, h: 19 }),
      ];
    });
  // gráfico: uma escala só (quantidade), 0 a 40, 7,5 pt por unidade
  const base = 762, unit = 7.5, x0 = 96, x1 = MARGIN.r, gw = (x1 - x0) / meses.length, bw = 30;
  const chart = [];
  for (const v of [10, 20, 30, 40]) {
    chart.push(rectEl({ name: `Grade ${v}`, fill: '#e6e5e0', x: x0, y: base - v * unit, w: x1 - x0, h: 0.75 }));
    chart.push(textEl({ name: `Escala ${v}`, text: String(v), font: 'Roboto-Regular', size: 10, lh: 12, color: '#77746d',
      align: 'right', x: 56.7, y: base - v * unit - 6, w: 32, h: 12 }));
  }
  meses.forEach(([m, o, v], i) => {
    const cx = x0 + gw * i + gw / 2;
    [[o, OFI, cx - bw - 1, 'ofícios'], [v, VIS, cx + 1, 'visitas']].forEach(([val, cor, bx, nome]) => {
      if (val > 0) chart.push(rectEl({ name: `Barra ${m} ${nome}`, fill: cor, x: bx, y: base - val * unit, w: bw, h: val * unit }));
      chart.push(textEl({ name: `Valor ${m} ${nome}`, text: String(val), font: 'Roboto-Bold', size: 12, lh: 14, color: COLORS.texto,
        align: 'center', x: bx - 6, y: base - val * unit - 17, w: bw + 12, h: 14 }));
    });
    chart.push(textEl({ name: `Mês ${m}`, text: m, font: 'Roboto-Regular', size: 13, lh: 16, color: COLORS.texto,
      align: 'center', x: cx - gw / 2, y: base + 8, w: gw, h: 16 }));
  });
  chart.push(rectEl({ name: 'Linha de base', fill: COLORS.texto, x: x0, y: base, w: x1 - x0, h: 1 }));
  return {
    id: uid(), tid: 'p6', tver: 2, name: 'Atendimentos', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'ATENDIMENTOS', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'Nosso trabalho começa ouvindo você!', font: 'Roboto-Black', size: 33, lh: 40,
        color: COLORS.texto, align: 'center', x: 56.7, y: 150, w: 659, h: 42,
      }),
      textEl({
        name: 'Linha fina',
        text: 'Confira os números de demandas recebidas e encaminhadas pela equipe do vereador Wanderley Porto, ' +
          'por WhatsApp, ofícios e visitas técnicas.',
        font: 'Roboto-Italic', size: 16, lh: 21, color: COLORS.verde, align: 'center', x: 96.2, y: 198, w: 580, h: 42,
      }),
      ...tiles,
      textEl({
        name: 'Período', text: '*Janeiro a julho de 2026', font: 'Roboto-Italic', size: 11, lh: 14, color: '#77746d',
        align: 'right', x: 56.7, y: 386, w: 659, h: 14,
      }),
      textEl({
        name: 'Gráfico: título', text: 'Ofícios e visitas técnicas por mês', font: 'Roboto-Black', size: 20, lh: 24,
        color: COLORS.texto, x: 56.7, y: 424, w: 400, h: 24,
      }),
      // legenda (identidade nunca só pela cor: legenda + valores em cada barra)
      rectEl({ name: 'Legenda: cor ofícios', fill: OFI, x: 470, y: 431, w: 11, h: 11 }),
      textEl({ name: 'Legenda: ofícios', text: 'Ofícios', font: 'Roboto-Regular', size: 13, lh: 16, color: COLORS.texto,
        x: 486, y: 428.5, w: 60, h: 16 }),
      rectEl({ name: 'Legenda: cor visitas', fill: VIS, x: 562, y: 431, w: 11, h: 11 }),
      textEl({ name: 'Legenda: visitas', text: 'Visitas técnicas', font: 'Roboto-Regular', size: 13, lh: 16, color: COLORS.texto,
        x: 578, y: 428.5, w: 137.7, h: 16 }),
      ...chart,
      textEl({
        name: 'Fonte', text: 'Fonte: gabinete do vereador Wanderley Porto. Visitas técnicas realizadas entre 26/02 e 31/07.',
        font: 'Roboto-Italic', size: 10, lh: 12, color: '#77746d', align: 'right', x: 56.7, y: 792, w: 659, h: 12,
      }),
      // destaque: fale com a equipe pelo WhatsApp
      rectEl({ name: 'WhatsApp: fundo', fill: COLORS.laranja, x: 56.7, y: 814, w: 659, h: 206.5 }),
      rectEl({ name: 'WhatsApp: moldura do QR', fill: COLORS.branco, x: 74.7, y: 829, w: 176.5, h: 176.5 }),
      imageEl({
        name: 'QR code do WhatsApp', src: 'assets/qr-whatsapp.svg', nw: 1024, nh: 1024,
        x: 78.7, y: 833, w: 168.5, h: 168.5, ix: 0, iy: 0, iw: 168.5,
      }),
      textEl({
        name: 'WhatsApp: chamada', text: 'Fale com a nossa equipe!', font: 'Roboto-Black', size: 30, lh: 36,
        color: COLORS.branco, x: 272, y: 842, w: 430, h: 36,
      }),
      textEl({
        name: 'WhatsApp: número', text: '(31) 98282-6850', font: 'Roboto-Black', size: 44, lh: 50,
        color: COLORS.branco, x: 272, y: 882, w: 430, h: 50,
      }),
      textEl({
        name: 'WhatsApp: instrução',
        text: 'Aponte a câmera do celular para o QR code\ne mande sua mensagem pelo WhatsApp.',
        font: 'Roboto-Bold', size: 15, lh: 20, color: COLORS.branco, x: 272, y: 944, w: 430, h: 40,
      }),
    ],
  };
}

// Pág. 7 – Novembro Azul (página de serviço, em azul; laço: Fluent Emoji, MIT, recolorido)
function templateP7() {
  const AZUL = '#1f5fa8', AZUL_CLARO = '#e3edf8';
  const itens = [
    ['Converse com um profissional de saúde sobre os cuidados e exames indicados para sua idade e seus fatores de risco.', 42],
    ['Histórico familiar da doença merece atenção especial.', 21],
    ['Dificuldade para urinar e presença de sangue na urina precisam de avaliação médica. A doença também pode não apresentar sintomas no início.', 42],
  ];
  const lista = [];
  let y = 700;
  itens.forEach(([t, h], i) => {
    lista.push(imageEl({ name: `Atenção ${i + 1}: marcador`, src: 'assets/laco-novembro-azul.svg', nw: 1024, nh: 1024,
      x: 78, y: y - 1, w: 22, h: 22, ix: 0, iy: 0, iw: 22 }));
    lista.push(textEl({ name: `Atenção ${i + 1}`, text: t, font: 'Roboto-Regular', size: 15, lh: 21, color: COLORS.texto,
      x: 108, y, w: 587, h }));
    y += h + 12;
  });
  return {
    id: uid(), tid: 'p7', tver: 3, name: 'Novembro Azul', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: 'NOVEMBRO AZUL', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      textEl({
        name: 'Título', text: 'HOMEM QUE SE CUIDA', font: 'Roboto-Black', size: 48, lh: 54,
        color: AZUL, align: 'center', x: 56.7, y: 146, w: 659, h: 54,
      }),
      textEl({
        name: 'Título: complemento', text: 'vive mais e melhor!', font: 'Roboto-BoldItalic', size: 34, lh: 40,
        color: COLORS.texto, align: 'center', x: 56.7, y: 200, w: 659, h: 40,
      }),
      textEl({
        name: 'Linha fina', text: 'Novembro Azul é um alerta: cuidar da saúde também é coisa de homem.',
        font: 'Roboto-Italic', size: 17, lh: 22, color: COLORS.verde, align: 'center', x: 56.7, y: 250, w: 659, h: 22,
      }),
      imageEl({
        name: 'Foto do Novembro Azul', src: 'assets/novembro-azul-foto.jpg', nw: 1110, nh: 550,
        x: 56.7, y: 288, w: 659, h: 270, ix: 0, iy: -28.27, iw: 659,
      }),
      textEl({
        name: 'Texto',
        text: 'O câncer de próstata é um dos mais comuns entre os homens. O **diagnóstico precoce** aumenta as ' +
          'chances de sucesso no tratamento.',
        font: 'Roboto-Regular', size: 18, lh: 25, color: COLORS.texto, x: 56.7, y: 574, w: 659, h: 50,
      }),
      rectEl({ name: 'Fique atento: fundo', fill: AZUL_CLARO, x: 56.7, y: 640, w: 659, h: 206 }),
      textEl({
        name: 'Fique atento: título', text: 'FIQUE ATENTO!', font: 'Roboto-Black', size: 26, lh: 30, color: AZUL,
        x: 80, y: 658, w: 400, h: 30,
      }),
      ...lista,
      rectEl({ name: 'Chamada: fundo', fill: AZUL, x: 56.7, y: 860, w: 659, h: 160.5 }),
      textEl({
        name: 'Chamada: título', text: 'NÃO ESPERE SENTIR ALGO PARA SE CUIDAR!', font: 'Roboto-Black', size: 27, lh: 32,
        color: COLORS.branco, align: 'center', x: 56.7, y: 876, w: 659, h: 32,
      }),
      textEl({
        name: 'Chamada: texto',
        text: 'Procure uma unidade de saúde e converse com um profissional\nsobre a prevenção e a detecção precoce do câncer de próstata.',
        font: 'Roboto-Regular', size: 16, lh: 21, color: COLORS.branco, align: 'center', x: 56.7, y: 916, w: 659, h: 42,
      }),
      textEl({
        name: 'Chamada: fecho', text: 'Sua saúde importa. Cuide-se!', font: 'Roboto-BoldItalic', size: 26, lh: 30,
        color: COLORS.branco, align: 'center', x: 56.7, y: 970, w: 659, h: 30,
      }),
    ],
  };
}

// Pág. 8 – 19 de novembro (Empreendedorismo Feminino e Dia da Bandeira) + anúncios e rodapé da edição anterior
function templateP8() {
  const W = 431.8;                                  // coluna de texto, à esquerda da coluna de anúncios
  const label = (name, text, y) => textEl({ name, text, font: 'Roboto-Bold', size: 13, lh: 16, color: COLORS.laranja,
    x: 56.7, y, w: W, h: 16 });
  return {
    id: uid(), tid: 'p8', tver: 5, name: '19 de novembro', elements: [
      rectEl({ name: 'Faixa da editoria', fill: COLORS.laranjaFaixa, x: 56.7, y: 85, w: 659, h: 40.1, locked: true }),
      textEl({
        name: 'Editoria', text: '19 DE NOVEMBRO', font: 'Roboto-Regular', size: 23.2, lh: 28,
        color: COLORS.branco, align: 'center', x: 56.7, y: 92.07, w: 659, h: 28,
      }),
      // dia da bandeira: foto do Wanderley com a bandeira inteira, em destaque (selo da data sobre a foto)
      imageEl({
        name: 'Foto: Wanderley com a bandeira', src: 'assets/bandeira-wanderley.jpg', nw: 2000, nh: 2000,
        x: 56.7, y: 140, w: W, h: 289.3, ix: 0, iy: -45.34, iw: W,
      }),
      rectEl({ name: 'Bandeira: selo', fill: COLORS.laranja, x: 56.7, y: 152, w: 132, h: 24 }),
      textEl({ name: 'Bandeira: data', text: 'DIA DA BANDEIRA', font: 'Roboto-Bold', size: 12, lh: 15,
        color: COLORS.branco, align: 'center', x: 56.7, y: 157, w: 132, h: 15 }),
      textEl({
        name: 'Bandeira: título', text: 'Orgulho de ser brasileiro. Compromisso com o nosso Brasil!', font: 'Roboto-Black',
        size: 15.5, lh: 19, color: COLORS.texto, x: 56.7, y: 439.3, w: W, h: 19,
      }),
      textEl({
        name: 'Bandeira: texto',
        text: 'Amar o Brasil é defender a liberdade, valorizar a família, respeitar nossos símbolos e trabalhar por um ' +
          'país com mais segurança, oportunidades e dignidade para todos.',
        font: 'Roboto-Regular', size: 10.5, lh: 14, color: COLORS.texto, x: 56.7, y: 464.3, w: W, h: 28,
      }),
      textEl({
        name: 'Bandeira: fecho', text: 'Deus, Pátria e Família: valores que nos inspiram a construir um Brasil melhor!',
        font: 'Roboto-Bold', size: 10.5, lh: 14, color: COLORS.verde, x: 56.7, y: 496.3, w: W, h: 14,
      }),
      // empreendedorismo feminino: box com fundo colorido e ícone
      rectEl({ name: 'Empreendedorismo: fundo', fill: COLORS.laranja, x: 56.7, y: 520, w: W, h: 136 }),
      imageEl({
        name: 'Ícone: empreendedorismo', src: 'assets/icone-empreendedorismo.svg', nw: 600, nh: 600,
        x: 68, y: 528, w: 54, h: 54, ix: 0, iy: 0, iw: 54,
      }),
      textEl({ name: 'Empreendedorismo: data', text: 'DIA DO EMPREENDEDORISMO FEMININO', font: 'Roboto-Bold', size: 10, lh: 12,
        color: '#ffe3d6', x: 132, y: 536, w: 345, h: 12 }),
      textEl({
        name: 'Empreendedorismo: título', text: 'Elas empreendem, geram renda e transformam vidas!', font: 'Roboto-Black',
        size: 14, lh: 17, color: COLORS.branco, x: 132, y: 551, w: 345, h: 17,
      }),
      textEl({
        name: 'Empreendedorismo: texto',
        text: 'À frente de muitos negócios, existem mulheres que enfrentam desafios, movimentam a economia, geram ' +
          'oportunidades e correm atrás dos seus sonhos.',
        font: 'Roboto-Regular', size: 10.5, lh: 13.5, color: COLORS.branco, x: 68, y: 592, w: 409, h: 27,
      }),
      textEl({
        name: 'Empreendedorismo: fecho',
        text: 'Valorizar essas mulheres é reconhecer a força de quem faz acontecer todos os dias!',
        font: 'Roboto-Bold', size: 10.5, lh: 13.5, color: COLORS.branco, x: 68, y: 623, w: 409, h: 27,
      }),
      // anúncios e rodapé: os mesmos da edição de outubro
      imageEl({
        name: 'Anúncios (coluna)', src: 'assets/anuncios-coluna.jpg', nw: 859, nh: 3539,
        x: 510.4, y: 171.4, w: 206, h: 849.1, ix: 0, iy: 0, iw: 206,
      }),
      imageEl({
        name: 'Anúncios, atendimento e expediente', src: 'assets/rodape-anuncios-contato.jpg', nw: 1802, nh: 1495,
        x: 56.7, y: 662, w: 432.2, h: 358.5, ix: 0, iy: 0, iw: 432.2,
      }),
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
  // Legenda null: a foto usa a legenda da linha (a visita técnica tem uma legenda só para as três fotos).
  const fotos = [
    ['dia-visita-grupo.jpg', 960, 1708, 0.5, 120, 280, 710, null],
    ['dia-visita-conversa.jpg', 960, 1708, 0.5, 150, 290, 700, null],
    ['dia-evento-criancas.jpg', 960, 1708, 0.5, 0, 400, 960, 'Evento para as crianças no Diamante'],
    ['dia-sofia-feldman.jpg', 720, 1280, 1, 72, 270, 576, 'Apoio ao Hospital Sofia Feldman'],
    ['dia-coworking.jpg', 720, 1280, 1, 10, 190, 700, 'Coworking Barreiro'],
    ['dia-demanda.jpg', 720, 1600, 1, 0, 200, 720, 'Rua Aldran'],
    ['dia-campanha.jpg', 720, 1280, 1, 0, 330, 720, 'Campanha presidencial'],
    ['dia-comissao.jpg', 720, 1280, 1, 0, 340, 720, 'Presidindo a Comissão de Meio Ambiente,\nDefesa dos Animais e Política Urbana'],
    ['dia-tribuna.jpg', 720, 1280, 1, 160, 640, 560, 'Plenário da Câmara Municipal de BH'],
  ];
  const tiles = [];
  fotos.forEach(([file, nw, nh, k, cx, cy, side, legenda], i) => {
    const x = xs[i % 3], y = ys[Math.floor(i / 3)], f = S / side;
    tiles.push(imageEl({
      name: `Foto ${i + 1}`, src: 'assets/' + file, nw, nh, k,
      x, y, w: S, h: S, ix: -cx * f, iy: -cy * f, iw: nw * f,
    }));
    if (legenda) {
      tiles.push(textEl({
        name: `Legenda ${i + 1}`, text: legenda, font: 'RobotoCondensed-Bold', size: 12.4, lh: 15.6,
        color: '#ea5b27', align: 'center', x: x - 6, y: y + S + 6, w: S + 12, h: 32,
      }));
    }
  });
  tiles.push(textEl({
    name: 'Legenda da visita técnica', text: 'Visita técnica Diamante/Olaria – Avaliar melhorias na sinalização',
    font: 'RobotoCondensed-Bold', size: 12.4, lh: 15.6, color: '#ea5b27', align: 'center',
    x: MARGIN.l, y: ys[0] + S + 6, w: xs[1] + S - MARGIN.l, h: 16,
  }));
  return {
    id: uid(), tid: 'p2', tver: 5, name: 'Dia a dia em ação', elements: [
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
      // rodapé: ícone do Instagram + texto, centralizados juntos
      imageEl({
        name: 'Ícone do Instagram', src: 'assets/icone-instagram.svg', nw: 512, nh: 512,
        x: 171, y: 1006.4, w: 17, h: 17, ix: 0, iy: 0, iw: 17,
      }),
      textEl({
        name: 'Rodapé', text: '@wanderleyporto Conheça mais o trabalho do vereador!', font: 'Roboto-Bold', size: 16, lh: 20,
        color: COLORS.preto, align: 'left', x: 194, y: 1004.9, w: 412, h: 20,
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

// JSON com as chaves em ordem alfabética: a mesma página gera sempre o mesmo texto,
// venha ela do editor ou do banco (que reordena as chaves).
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
}

// Conteúdo da página sem os identificadores, para comparar versões.
function pageSig(p) {
  return canon(p.elements.map(({ id, ...rest }) => rest));
}

// Assinatura no formato antigo (antes do jornal compartilhado), para reconhecer páginas salvas naquela época.
function legacySig(p) {
  return JSON.stringify(p.elements.map(({ id, ...rest }) => rest));
}

// Páginas da edição atual, na ordem. Cada uma tem um "tid" fixo: quando uma página nova entra aqui,
// quem já usa o editor recebe essa página automaticamente, sem perder o que já editou.
function defaultState() {
  const pages = [templateCapa(), templateP2(), templateP3(), templateP4(), templateP5(), templateP6(), templateP7(), templateP8()];
  // id fixo por página do modelo: se duas pessoas abrirem o editor ao mesmo tempo, não duplica
  pages.forEach(p => { p.id = 'tpl-' + p.tid; p.tsig = pageSig(p); });
  return { version: 1, cur: 0, pages, seenTids: pages.map(p => p.tid) };
}
