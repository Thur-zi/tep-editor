# Instruções para agentes (Codex e outros)

Este repositório é o editor do jornal mensal impresso **Transformar é Possível (TEP)**, do vereador Wanderley Porto
(Belo Horizonte). As páginas ficam num banco compartilhado: o que você gravar aparece em segundos para todo mundo
que está com o editor aberto em https://thur-zi.github.io/tep-editor/.

Quando a pessoa pedir para criar ou mudar uma página do jornal, **não altere o código do site**. Use a ferramenta
`tools/tep.mjs` (Node 18 ou mais novo, sem instalar nada):

```bash
node tools/tep.mjs edicoes                          # lista as edições (cada TEP)
node tools/tep.mjs paginas [--ed ID]                # páginas de uma edição (padrão: a mais recente)
node tools/tep.mjs baixar 3 [--ed ID]               # salva a página 3 em paginas/03-....json
node tools/tep.mjs verificar paginas/03-....json    # confere margens, fontes, imagens e se os textos cabem
node tools/tep.mjs ver paginas/03-....json          # gera pagina.png para você conferir o resultado (precisa de Playwright)
node tools/tep.mjs enviar paginas/03-....json       # grava a página editada
node tools/tep.mjs nova arquivo.json [--depois 3]   # cria uma página nova (depois da página 3)
node tools/tep.mjs foto caminho/foto.jpg            # envia uma foto e devolve src, nw, nh
node tools/tep.mjs galeria                          # imagens que já existem em assets/
```

Defina o nome de quem está editando com `TEP_NOME="Nome da pessoa"` antes dos comandos (aparece no histórico).

## Fluxo de trabalho

1. `paginas` para achar a página; `baixar` para pegar a versão mais recente. **Sempre baixe de novo antes de editar**:
   outras pessoas mexem ao mesmo tempo.
2. Edite o JSON. Mude só o que foi pedido e preserve os outros itens e os campos `_id`, `_rev`, `_edicao`.
3. `verificar` e, se possível, `ver`, e olhe a imagem. Corrija textos que não cabem e itens desalinhados.
4. `enviar`. Se responder que alguém alterou a página, baixe de novo e refaça só a sua alteração.
5. Nada é apagado de verdade: cada envio guarda a versão anterior no "Histórico desta página" do editor.

Para `ver`: `npm install` (instala o Playwright do package.json) e `npx playwright install chromium`.
Se o ambiente não tiver acesso à internet, libere os domínios `zaswidphfhxqsmneekrm.supabase.co`,
`thur-zi.github.io` (para `ver`) e o registro do npm.

## A página

- Unidade: pontos (pt). Página 772.4 × 1077.2. Origem (0,0) no canto superior esquerdo.
- Área útil: x de 56.7 a 715.7 (largura 659) e y de 85 a 1020.5. Nada pode sair dessa área.
- Faixa da editoria (toda página de matéria começa com ela):
  `{"type":"rect","name":"Faixa da editoria","x":56.7,"y":85,"w":659,"h":40.1,"fill":"#f37648"}` e
  `{"type":"text","name":"Editoria","text":"NOME","font":"Roboto-Regular","size":23.2,"lh":28,"color":"#ffffff","align":"center","x":56.7,"y":92.07,"w":659,"h":28}`
- Título: Roboto-Black 30–33, cor `#231f20`, centralizado. Linha fina: Roboto-Italic 16, cor `#4da699`.
- Texto corrido: Roboto-Regular 11.5, entrelinha (`lh`) 16, cor `#231f20`.
- Respiro de 10 a 16 pt entre blocos; blocos lado a lado com o mesmo `y`, colunas com o mesmo `x`.
- Cores: laranja `#f26532`, faixa `#f37648`, verde `#4da699`, verde-escuro de gráfico `#178f7f`,
  texto `#231f20`, fundo claro de box `#fdeae2`, branco `#ffffff`.

## Formato do JSON

```json
{ "name": "Nome da página", "elements": [ ...itens do fundo para a frente... ] }
```

Todo item tem `id` (qualquer texto único; a ferramenta cria se faltar), `type`, `name`, `x`, `y`, `w`, `h`
e opcionalmente `opacity` (0–100), `locked`, `hidden`.

- **text**: `text` (`\n` quebra linha, `**assim**` deixa em negrito), `font` (Roboto-Regular, Roboto-Italic,
  Roboto-Medium, Roboto-Bold, Roboto-BoldItalic, Roboto-Black, RobotoCondensed-Regular, RobotoCondensed-Bold),
  `size`, `lh`, `color`, `align` (left, center, right, justify), `bg` (cor de fundo ou null), `padT`, `padR`,
  `padB`, `padL`. A altura `h` precisa caber o texto (linhas × `lh` + margens internas).
- **rect**: `fill` (cor ou null), `stroke`, `sw` (espessura do contorno). Fio = retângulo com `h` de 1 a 1.5.
- **image**: `src` (`assets/...` da galeria ou o `src` devolvido por `foto`; null = quadro vazio), `nw`, `nh`
  (tamanho da imagem em pixels) e o enquadramento `ix`, `iy`, `iw` (posição e largura da imagem dentro do quadro,
  em pt; altura = `iw × nh / nw`). Para preencher o quadro centralizado:
  `f = max(w/nw, h/nh); iw = nw*f; ix = (w - iw)/2; iy = (h - nh*f)/2` (para pessoas, use `iy = 0` para não cortar cabeças).

## Regras

- Use só os textos que a pessoa mandar; pode corrigir ortografia e encurtar para caber, avisando o que mudou.
  Nunca invente números, nomes, falas ou fatos.
- Não mexa em páginas que a pessoa não pediu.
- Fotos de terceiros: confirme que podem ser usadas e coloque o crédito (texto pequeno, Roboto-Italic 8, cor `#77746d`).
