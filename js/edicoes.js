// Várias edições (cada TEP): escolher qual abrir, criar um TEP novo e mudar o nome.
'use strict';

function renderEditions() {
  const box = document.getElementById('edicoes');
  if (!box) return;
  box.hidden = !Sync.online;
  if (!Sync.online) return;
  const sel = document.getElementById('edSelect');
  const lista = Sync.editions.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  sel.innerHTML = lista.map(e => `<option value="${esc(e.id)}" ${e.id === Sync.edition ? 'selected' : ''}>${esc(e.name)}</option>`).join('');
  document.title = `${editionName() || 'Editor'} · TEP`;
}

function proximaEdicao() {
  // sugere o número e o mês seguintes ao da edição mais recente ("Nº 107 · Novembro 2026" -> 108, Dezembro, 2026)
  let numero = 1, mes = new Date().getMonth(), ano = new Date().getFullYear();
  for (const e of Sync.editions) {
    const m = String(e.name).match(/N[ºo°]\s*(\d+)\s*·?\s*([A-Za-zçÇ]+)?\s*(\d{4})?/);
    if (m && +m[1] >= numero) {
      numero = +m[1] + 1;
      const i = MESES.findIndex(x => m[2] && x.toLowerCase() === m[2].toLowerCase());
      if (i >= 0) { mes = (i + 1) % 12; ano = (m[3] ? +m[3] : ano) + (i === 11 ? 1 : 0); }
    }
  }
  return { numero, mes, ano };
}

function abrirNovoTep() {
  const s = proximaEdicao();
  const opcoes = Sync.editions.map(e => `<option value="${esc(e.id)}" ${e.id === Sync.edition ? 'selected' : ''}>${esc(e.name)}</option>`).join('');
  openModal(`<h3>Novo TEP</h3>
    <p class="muted">Cria uma edição separada. As outras edições continuam salvas e podem ser abertas pela lista no alto.</p>
    <div class="grid4">
      <label>Número<input type="number" id="ntNumero" value="${s.numero}"></label>
      <label style="grid-column: span 2">Mês<select id="ntMes">${MESES.map((m, i) => `<option ${i === s.mes ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
      <label>Ano<input type="number" id="ntAno" value="${s.ano}"></label>
    </div>
    <h4>Começar</h4>
    <label class="check"><input type="radio" name="ntBase" value="zero" checked> Do zero: capa, 6 páginas de matéria e a última página com os anúncios</label><br>
    <label class="check"><input type="radio" name="ntBase" value="copia"> Copiando todas as páginas de:</label>
    <div class="row"><select id="ntCopia">${opcoes}</select></div>
    <p id="ntErro" class="warn"></p>
    <div class="btnrow"><button class="primary" id="ntCriar">Criar e abrir</button></div>`);
  document.getElementById('ntCopia').onfocus = () => { document.querySelector('input[name=ntBase][value=copia]').checked = true; };
  document.getElementById('ntCriar').onclick = async (ev) => {
    const btn = ev.target;
    const numero = parseInt(document.getElementById('ntNumero').value, 10);
    const mes = document.getElementById('ntMes').value;
    const ano = parseInt(document.getElementById('ntAno').value, 10);
    const erro = document.getElementById('ntErro');
    if (!numero || !ano) { erro.textContent = 'Preencha o número e o ano.'; return; }
    const nome = `Nº ${numero} · ${mes} ${ano}`;
    if (Sync.editions.some(e => e.name === nome)) { erro.textContent = `Já existe a edição "${nome}".`; return; }
    btn.disabled = true; btn.textContent = 'Criando…';
    try {
      const base = document.querySelector('input[name=ntBase]:checked').value;
      let paginas;
      if (base === 'copia') {
        paginas = await Sync.copyPagesFrom(document.getElementById('ntCopia').value);
        const capa = paginas[0] && paginas[0].elements;
        if (capa) {   // atualiza o selo da capa copiada
          const set = (n, t) => { const e = capa.find(x => x.name === n); if (e) e.text = t; };
          set('Selo: mês', mes); set('Selo: ano', String(ano)); set('Selo: número', `Nº ${numero}\nANO ${romano(ano - 2017)}`);
        }
      } else {
        paginas = templateEdicaoNova(numero, mes, ano);
      }
      const id = await Sync.createEdition(nome, paginas);
      await Sync.openEdition(id);
    } catch (e) {
      console.error(e);
      erro.textContent = 'Não consegui criar: ' + (e.message || e);
      btn.disabled = false; btn.textContent = 'Criar e abrir';
    }
  };
}

async function renomearTep() {
  const novo = prompt('Nome desta edição:', editionName());
  if (!novo || !novo.trim() || novo.trim() === editionName()) return;
  try { await Sync.renameEdition(novo.trim()); toast('Nome da edição atualizado.'); }
  catch (e) { toast('Não consegui mudar o nome.'); }
}

document.getElementById('edSelect').addEventListener('change', (e) => Sync.openEdition(e.target.value));
document.getElementById('btnNovoTep').addEventListener('click', abrirNovoTep);
document.getElementById('btnRenomearTep').addEventListener('click', renomearTep);
