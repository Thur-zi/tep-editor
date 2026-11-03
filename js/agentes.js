// "Conectar IA": mostra o endereço do servidor MCP do jornal e como ligá-lo em cada IA.
'use strict';

const MCP_URL = SUPABASE_URL + '/functions/v1/tep-mcp';

function abrirConectarIA() {
  const url = esc(MCP_URL);
  const json = esc(JSON.stringify({ mcpServers: { tep: { url: MCP_URL } } }, null, 2));
  openModal(`<h3>Conectar uma IA ao jornal</h3>
    <p class="muted">Qualquer IA que aceite <b>conectores MCP</b> (Claude, ChatGPT, Codex, Cursor, VS Code…) pode ler e editar
    as páginas por este endereço. As mudanças aparecem aqui na hora, com o aviso 🤖, e ficam no histórico de cada página.</p>
    <div class="row"><input type="text" id="mcpUrl" value="${url}" readonly style="font-family:ui-monospace,monospace;font-size:12px">
      <button id="mcpCopiar" class="primary">Copiar</button></div>
    <details open><summary><b>Claude</b> (claude.ai ou app)</summary>
      <p class="muted">Configurações → Conectores → <b>Adicionar conector personalizado</b> → dê o nome "Jornal TEP" e cole o endereço.
      Depois, na conversa, ative o conector no botão de ferramentas. (A opção depende do plano da conta.)</p></details>
    <details><summary><b>ChatGPT</b></summary>
      <p class="muted">Configurações → Aplicativos e conectores → ative o <b>modo de desenvolvedor</b> → Criar → cole o endereço,
      sem autenticação. Na conversa, escolha o conector "Jornal TEP". (A opção depende do plano da conta.)</p></details>
    <details><summary><b>Codex</b>, <b>Cursor</b>, <b>VS Code</b>, <b>Claude Code</b> e outros</summary>
      <p class="muted">Adicione um servidor MCP do tipo HTTP com este endereço. Na maioria, é este trecho no arquivo de configuração de MCP:</p>
      <textarea readonly style="min-height:96px;font-family:ui-monospace,monospace;font-size:12px">${json}</textarea>
      <p class="muted">No Claude Code: <code>claude mcp add --transport http tep ${url}</code><br>
      No Codex: em <code>~/.codex/config.toml</code>, <code>[mcp_servers.tep]</code> com <code>url = "${url}"</code>.</p></details>
    <h4>O que pedir</h4>
    <p class="muted">“Liste as páginas do TEP mais recente.” · “Na página 5, troque o título por … e o texto por …” ·
    “Crie uma página de SAÚDE depois da página 4 com este texto e esta foto (link).” · “Me mande o link para conferir.”</p>
    <p class="muted">A IA usa as mesmas regras do jornal (margens, fontes, cores) e não grava por cima de quem mexeu antes.
    Quem tiver o endereço consegue editar, então compartilhe só com a equipe.</p>`);
  document.getElementById('mcpCopiar').onclick = async () => {
    try { await navigator.clipboard.writeText(MCP_URL); toast('Endereço copiado.'); }
    catch (e) { const i = document.getElementById('mcpUrl'); i.select(); toast('Copie com Ctrl+C.'); }
  };
}

document.getElementById('btnConectarIA').addEventListener('click', abrirConectarIA);
