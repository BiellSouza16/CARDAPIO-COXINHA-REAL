// script.js (completo)

const salgadosLista = [
  "Coxinha (Frango)", "Palitinho (Queijo com Presunto)", "Balãozinho (Frango com Requeijão)",
  "Travesseirinho (Carne)", "Kibe de Queijo", "Kibe de Carne",
  "Churros de Doce de Leite", "Churros de Chocolate",
  "Enroladinho de Salsicha", "Boliviano (Carne)"
];

const bebidas = [
  { nome: "Guaraná 200ml", preco: 3 },
  { nome: "Pepsi 200ml", preco: 3 },
  { nome: "Guaraná Lata 350ml", preco: 4 },
  { nome: "Pepsi Lata 350ml", preco: 4 },
  { nome: "Água Mineral", preco: 2 },
  { nome: "Água com Gás", preco: 3 },
  { nome: "Guaraná 1L", preco: 7 },
  { nome: "Pepsi 1L", preco: 7 },
  { nome: "IT Guaraná", preco: 8 },
  { nome: "IT Cola", preco: 8 },
];

const combos = [
  { nome: "Combo A Dois", opcoes: [
    { titulo: "Sem refri", preco: 20, qtd: 25 },
    { titulo: "Com 2x refri de 200ml", preco: 24, qtd: 25, refri: 2, tamanhos: ["200ml"] }
  ]},
  { nome: "Combo Grupinho", opcoes: [
    { titulo: "Sem refri", preco: 35, qtd: 50 },
    { titulo: "Com 1 refri de 1L", preco: 40, qtd: 50, refri: 1, tamanhos: ["1L"] }
  ]},
  { nome: "Combo Galera", opcoes: [
    { titulo: "Sem refri", preco: 65, qtd: 100 },
    { titulo: "Com 1 refri de 2L", preco: 70, qtd: 100, refri: 1, tamanhos: ["2L", "IT"] }
  ]},
];

// Inicia a interface
criarBloco('salgados', salgadosLista);
criarBloco('bebidas', bebidas);
criarCombos();

// Atualiza o resumo sempre que o nome ou algo for alterado
atualizar();
document.getElementById('nomeCliente').addEventListener('input', atualizar);
document.addEventListener('input', atualizar);

function criarBloco(id, itens, precoFixo = 1) {
  const container = document.getElementById(id);
  itens.forEach(item => {
    const box = document.createElement('div');
    box.className = 'card-box';
    box.innerHTML = `
      <div class="item">
        <span>${item.nome || item}</span>
        <div class="quantidade">
          <button onclick="alterarQtd(this, -1)">-</button>
          <span data-nome="${item.nome || item}" data-preco="${item.preco || precoFixo}" data-qtd="0">0</span>
          <button onclick="alterarQtd(this, 1)">+</button>
        </div>
      </div>`;
    container.appendChild(box);
  });
}

function criarCombos() {
  const container = document.getElementById('combos');
  combos.forEach(combo => {
    combo.opcoes.forEach(opcao => {
      const box = document.createElement('div');
      box.className = 'card-box';
      const idCombo = `${combo.nome} – ${opcao.titulo}`;
      box.innerHTML = `
        <div class="combo-title">${combo.nome} – ${opcao.titulo}</div>
        <div class="combo-sub">${opcao.qtd} mini salgados – R$${opcao.preco.toFixed(2)}</div>
        <label>Quantidade de combos:
          <input type="number" min="1" value="1" data-combo-mult="${idCombo}" style="width:50px; margin-left:10px;">
        </label>`;

      const saboresDiv = document.createElement('div');
      saboresDiv.className = 'sabores';
      saboresDiv.innerHTML = salgadosLista.map(sabor => `
        <div class="item">
          <span>${sabor}</span>
          <div class="quantidade">
            <button onclick="alterarQtd(this, -1, '${idCombo}')">-</button>
            <span data-nome="${sabor}" data-preco="0" data-qtd="0" data-combo="${idCombo}">0</span>
            <button onclick="alterarQtd(this, 1, '${idCombo}')">+</button>
          </div>
        </div>`).join('');
      box.appendChild(saboresDiv);

      if (opcao.refri) {
        const refriDiv = document.createElement('div');
        refriDiv.innerHTML = `<strong>Escolha os refrigerantes:</strong>`;
        bebidas.filter(b => opcao.tamanhos.some(t => b.nome.includes(t))).forEach(b => {
          const linha = document.createElement('div');
          linha.className = 'item';
          linha.innerHTML = `
            <span>${b.nome}</span>
            <div class="quantidade">
              <button onclick="alterarQtd(this, -1, '${idCombo}-refri')">-</button>
              <span data-nome="${b.nome}" data-preco="0" data-qtd="0" data-combo="${idCombo}-refri">0</span>
              <button onclick="alterarQtd(this, 1, '${idCombo}-refri')">+</button>
            </div>
          `;
          refriDiv.appendChild(linha);
        });
        box.appendChild(refriDiv);
      }

      container.appendChild(box);
    });
  });
}

function alterarQtd(btn, delta, comboNome = null) {
  const span = btn.parentNode.querySelector('span');
  let qtd = parseInt(span.dataset.qtd);
  let novo = qtd + delta;
  if (novo < 0) novo = 0;

  if (comboNome) {
    const comboKey = comboNome.replace('-refri', '');
    const combo = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
      .find(c => c.combo === comboKey);
    const isRefri = comboNome.includes('-refri');
    const multInput = document.querySelector(`input[data-combo-mult="${comboKey}"]`);
    const multiplicador = multInput ? Math.max(1, parseInt(multInput.value)) : 1;
    const max = isRefri ? (combo?.refri || 0) * multiplicador : (combo?.qtd || 0) * multiplicador;
    const totalAtual = [...document.querySelectorAll(`[data-combo='${comboNome}']`)]
      .reduce((sum, el) => sum + parseInt(el.dataset.qtd), 0);
    if (delta > 0 && totalAtual >= max) return;
  }

  span.dataset.qtd = novo;
  span.textContent = novo;
  atualizar();
}

function atualizar() {
  const spans = document.querySelectorAll('[data-nome]');
  const lista = document.getElementById('lista');
  const nomeCliente = document.getElementById('nomeCliente').value.trim();
  const totalEl = document.getElementById('total');
  let total = 0;
  let text = '';
  const combosAgrupados = {};
  let avulsos = '';
  const combosUsados = new Set();

  const multiplicadores = {};
  document.querySelectorAll('input[data-combo-mult]').forEach(input => {
    multiplicadores[input.dataset.comboMult || input.getAttribute('data-combo-mult')] = Math.max(1, parseInt(input.value));
  });

  spans.forEach(el => {
    const qtd = parseInt(el.dataset.qtd);
    if (qtd > 0) {
      const nome = el.dataset.nome;
      const preco = parseFloat(el.dataset.preco);
      const combo = el.dataset.combo;
      if (combo) {
        if (!combosAgrupados[combo]) combosAgrupados[combo] = [];
        combosAgrupados[combo].push({ nome, qtd });
        combosUsados.add(combo.replace('-refri',''));
      } else {
        total += preco * qtd;
        avulsos += `${qtd}x ${nome}\n`;
      }
    }
  });

  const combosAdicionados = new Set();
  Object.entries(combosAgrupados).forEach(([combo, itens]) => {
    const comboKey = combo.replace('-refri','');
    const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
      .find(c => c.combo === comboKey);
    if (!combosAdicionados.has(comboKey)) {
      const mult = multiplicadores[comboKey] || 1;
      text += `\n${mult}x ${comboKey}\n`;
      total += comboData.preco * mult;
      combosAdicionados.add(comboKey);
    }
    itens.forEach(({ nome, qtd }) => {
      text += `- ${qtd}x ${nome}\n`;
    });
  });

  if (avulsos) {
    text += `\nSalgados Avulsos:\n` + avulsos;
  }

  lista.textContent = text || '(nenhum item)';
  totalEl.textContent = `Total: R$${total.toFixed(2)}`;
  const resumo = `Resumo do pedido de ${nomeCliente || '(cliente)'}\n\n` + text + `\nTotal: R$${total.toFixed(2)}`;

  const refriOk = Object.entries(combosAgrupados).every(([combo, itens]) => {
    if (!combo.includes('-refri')) return true;
    const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
      .find(c => `${c.combo}-refri` === combo);
    const totalRefri = itens.reduce((sum, {qtd}) => sum + qtd, 0);
    const mult = multiplicadores[combo.replace('-refri','')] || 1;
    return totalRefri === (comboData?.refri || 0) * mult;
  });

  const salgadosOk = Array.from(combosUsados).every(comboKey => {
    const salgados = Object.entries(combosAgrupados)
      .filter(([combo]) => combo.replace('-refri','') === comboKey && !combo.includes('-refri'))
      .flatMap(([, itens]) => itens);
    const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: `${c.nome} – ${o.titulo}`})))
      .find(c => c.combo === comboKey);
    const totalSalgados = salgados.reduce((sum, {qtd}) => sum + qtd, 0);
    const mult = multiplicadores[comboKey] || 1;
    return totalSalgados === (comboData?.qtd || 0) * mult;
  });

  const algumItem = spans.length > 0 && [...spans].some(el => parseInt(el.dataset.qtd) > 0);
  const botao = document.getElementById('whatsapp-btn');

  if (nomeCliente && salgadosOk && refriOk && algumItem) {
    botao.href = `https://wa.me/5573981741968?text=${encodeURIComponent(resumo)}`;
    botao.style.pointerEvents = 'auto';
    botao.style.opacity = 1;
  } else {
    botao.href = '#';
    botao.style.pointerEvents = 'none';
    botao.style.opacity = 0.5;
    if (!nomeCliente) lista.textContent = 'Por favor, digite seu nome para finalizar.';
    else if (!algumItem) lista.textContent = 'Selecione pelo menos um item para fazer o pedido.';
    else if (!salgadosOk) lista.textContent = 'Preencha corretamente os salgados dos combos.';
    else if (!refriOk) lista.textContent = 'Preencha corretamente os refrigerantes dos combos com bebida.';
  }
}
