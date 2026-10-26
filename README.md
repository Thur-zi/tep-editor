# Editor TEP — Transformar é Possível

Editor visual, no navegador, para montar as páginas do jornal mensal **Transformar é Possível**
no tamanho real de impressão (772,4 × 1077,2 pt ≈ 27,2 × 38 cm).

## Como usar

- **Mover:** arraste qualquer item. **Redimensionar:** puxe as bolinhas azuis.
- **Texto:** duplo clique para editar na página, ou use a caixa de texto no painel da direita.
  `**palavras**` ficam em negrito. Fonte, corpo, entrelinha, cor, alinhamento e fundo ficam no painel.
- **Fotos:** duplo clique para reenquadrar (arraste a foto e use a rodinha do mouse para zoom).
  Os cantos aumentam a foto e o quadro juntos; as laterais cortam. "Trocar por arquivo…" envia uma foto do computador,
  e também dá para arrastar a imagem direto para a página.
  O painel mostra a **resolução efetiva** (ideal acima de 200 dpi para impressão).
- **Páginas:** coluna da esquerda. Há modelos de capa, de matéria (faixa laranja, título, linha fina, texto, foto, citação) e de página em branco.
- **Atalhos:** Ctrl+Z / Ctrl+Shift+Z, Ctrl+D duplica, Delete apaga, setas movem 1 pt (Shift = 10 pt),
  Shift mantém proporção, Alt desliga o encaixe nas guias, Ctrl + rodinha dá zoom.
- **Salvar:** o trabalho fica salvo automaticamente neste navegador. "Salvar projeto" baixa um `.json`
  (com as fotos enviadas) para continuar em outro computador com "Abrir".
- **Baixar PDF:** todas as páginas, com o texto em vetor e as fontes Roboto embutidas.
  **PNG:** a página atual em 300 dpi.

## Publicar no GitHub Pages

Settings → Pages → *Deploy from a branch* → branch `main`, pasta `/ (root)`.

## Arquivos

- `index.html`, `css/`, `js/`: o editor (sem build, só arquivos estáticos).
- `js/template.js`: os modelos de página com as medidas do jornal.
- `assets/`: cabeçalho, frames do vídeo do CASA e anúncio da BlackZAP.
- `fonts/`: Roboto (Apache License 2.0), reduzida aos caracteres latinos.
- `js/vendor/jspdf.umd.min.js`: jsPDF 2.5.1 (MIT), usado para gerar o PDF.
