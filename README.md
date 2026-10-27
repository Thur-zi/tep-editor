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
- **Várias edições:** a lista no alto troca o TEP aberto; **＋ Novo TEP** cria uma edição nova (do zero ou copiando
  outra) e ✎ muda o nome. Cada edição fica salva separadamente, e o link da página guarda a edição (`?ed=...`).
- **Edição compartilhada:** o jornal fica num banco de dados (Supabase) e qualquer pessoa com o link edita a
  mesma edição. As mudanças aparecem ao vivo para todos, a barra de cima mostra quem está online e em qual página,
  e quando duas pessoas mexem na mesma página as alterações são juntadas item por item.
- **Segurança:** nada é apagado de verdade. Cada página guarda cópias automáticas ("Histórico desta página") e as
  páginas apagadas podem ser recuperadas ("Páginas apagadas"). Os dois botões ficam no painel da direita, com nada selecionado.
- **Sem internet:** o editor continua funcionando e salva só no navegador até a conexão voltar.
- **Salvar projeto** baixa um `.json` (com as fotos) como cópia de segurança; "Abrir" substitui o jornal compartilhado.
- **Colar página da IA:** funciona com qualquer IA de chat (Claude, ChatGPT, Gemini, Copilot, inclusive nos planos
  grátis). Clique no botão, copie as instruções, cole na IA e depois cole a resposta dela de volta. A página entra como página nova.
- **Baixar PDF:** todas as páginas, com o texto em vetor e as fontes Roboto embutidas.
  **PNG:** a página atual em 300 dpi.

## Editar pelo Codex (ou outro agente)

`tools/tep.mjs` lê e grava as páginas do jornal pela linha de comando; as instruções para o agente estão em
`AGENTS.md`. Exemplo: `node tools/tep.mjs paginas`, `node tools/tep.mjs baixar 3`, `node tools/tep.mjs enviar ...`.

## Banco de dados

Projeto Supabase `tep-editor` (São Paulo). Tabelas `pages` (uma linha por página), `page_history` (cópias
automáticas, feitas por gatilho no banco) e o armazenamento `uploads` (fotos enviadas). O endereço e a chave pública
ficam em `js/config.js`; as regras do banco permitem ver, criar e editar, mas não apagar.

O plano gratuito pausa o projeto após 7 dias sem uso. O agendamento `.github/workflows/manter-supabase-ativo.yml`
consulta o banco às segundas e quintas para evitar isso; se a consulta falhar, o GitHub avisa por e-mail.

## Publicar no GitHub Pages

Settings → Pages → *Deploy from a branch* → branch `main`, pasta `/ (root)`.

## Arquivos

- `index.html`, `css/`, `js/`: o editor (sem build, só arquivos estáticos).
- `js/template.js`: os modelos de página com as medidas do jornal.
- `assets/`: cabeçalho, frames do vídeo do CASA e anúncio da BlackZAP.
- `fonts/`: Roboto (Apache License 2.0), reduzida aos caracteres latinos.
- `js/sync.js`: salvamento no banco, ao vivo, junção de alterações, histórico e presença.
- `js/vendor/jspdf.umd.min.js`: jsPDF 2.5.1 (MIT), usado para gerar o PDF.
- `js/vendor/supabase.min.js`: supabase-js 2.45.4 (MIT).
