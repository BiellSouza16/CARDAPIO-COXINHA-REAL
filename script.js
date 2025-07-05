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
  { nome: "IT Guaraná 2L", preco: 8 },
  { nome: "IT Cola 2L", preco: 8 },
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
function alterarQtd(botao, delta, comboId) {
  const qtdSpan = botao.parentElement.querySelector('span[data-qtd]');
  let qtdAtual = parseInt(qtdSpan.dataset.qtd);

  if (!comboId) {
    // Produtos avulsos (fora dos combos)
    qtdAtual += delta;
    if (qtdAtual < 0) qtdAtual = 0;
    qtdSpan.dataset.qtd = qtdAtual;
    qtdSpan.textContent = qtdAtual;
    atualizar();
    return;
  }

  // Extrai o nome do combo e o título da opção
  const isRefri = comboId.includes('-refri');
const baseId = isRefri ? comboId.replace('-refri', '') : comboId;
const [comboBase, opcaoTitulo] = baseId.split(' – ');
  const comboObj = combos.find(c => c.nome === comboBase);
  const opcaoObj = comboObj?.opcoes.find(o => o.titulo === opcaoTitulo);
  if (!comboObj || !opcaoObj) {
    qtdAtual += delta;
    if (qtdAtual < 0) qtdAtual = 0;
    qtdSpan.dataset.qtd = qtdAtual;
    qtdSpan.textContent = qtdAtual;
    atualizar();
    return;
  }

  const multInput = document.querySelector(`input[data-combo-mult="${comboBase} – ${opcaoTitulo}"]`);
  const multiplicador = multInput ? Math.max(1, parseInt(multInput.value)) : 1;

  // Coleta todos os spans do combo (salgados ou refri)
  const spansCombo = document.querySelectorAll(`span[data-combo='${comboId}']`);
  let soma = 0;
  spansCombo.forEach(span => {
    soma += parseInt(span.dataset.qtd);
  });

  const limite = isRefri
    ? (opcaoObj.refri || 0) * multiplicador
    : (opcaoObj.qtd || 0) * multiplicador;

  if (delta > 0 && soma >= limite) {
    const box = document.querySelector(`[data-combo-box='${comboBase} – ${opcaoTitulo}']`);
    if (box) {
      box.classList.add('erro-combo');
      setTimeout(() => box.classList.remove('erro-combo'), 800);
    }
    return;
  }

  qtdAtual += delta;
  if (qtdAtual < 0) qtdAtual = 0;
  qtdSpan.dataset.qtd = qtdAtual;
  qtdSpan.textContent = qtdAtual;
  atualizar();
}

function criarBloco(id, itens, precoFixo = 1) {
  const container = document.getElementById(id);
  itens.forEach(item => {
    const preco = item.preco || precoFixo;
    const nome = item.nome || item;
    const texto = (id === 'bebidas') ? `${nome} (R$${preco.toFixed(2)})` : nome;
    const box = document.createElement('div');
    box.className = 'card-box';
    box.innerHTML = `
      <div class="item">
        <span>${texto}</span>
        <div class="quantidade">
          <button onclick="alterarQtd(this, -1)">-</button>
          <span data-nome="${nome}" data-preco="${preco}" data-qtd="0">0</span>
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
      const idCombo = `${combo.nome} – ${opcao.titulo}`;
      const box = document.createElement('div');
      box.className = 'card-box';
      box.setAttribute('data-combo-box', idCombo);

      // Primeiro monta o conteúdo base no innerHTML
      box.innerHTML = `
        <div class="combo-title">${combo.nome} – ${opcao.titulo}</div>
        <div class="combo-sub">${opcao.qtd} mini salgados – R$${opcao.preco.toFixed(2)}</div>
        <label>Quantidade de combos:
          <input type="number" min="1" value="1" data-combo-mult="${idCombo}" style="width:50px; margin-left:10px;">
        </label>
        <div class="combo-actions">
          <button class="limpar-combo" onclick="limparCombo('${idCombo}')">Limpar Combo</button>
        </div>
      `;

      // Depois adiciona a div de mensagem de erro para avisos visuais
      const mensagemErro = document.createElement('div');
      mensagemErro.className = 'mensagem-erro';
      box.appendChild(mensagemErro);

      // Adiciona os sabores dos salgados
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

      // Se a opção tiver refrigerante, adiciona a área para escolher refri
      if (opcao.refri) {
        const refriDiv = document.createElement('div');
        refriDiv.classList.add('refri-area');
        refriDiv.innerHTML = `<strong class="refri-titulo">Escolha os refrigerantes:</strong>`;
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

function limparCombo(comboId) {
  const spans = document.querySelectorAll(`[data-combo='${comboId}'], [data-combo='${comboId}-refri']`);
  spans.forEach(el => {
    el.dataset.qtd = '0';
    el.textContent = '0';
  });
  atualizar();
}

function pegarDataHora() {
  const data = document.getElementById('dataRetirada').value;
  const hora = document.getElementById('horaRetirada').value;
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];
  if (!data || !hora) return '';
  if (data === hojeStr) {
    return `Para hoje às ${hora}`;
  } else {
    const partes = data.split('-');
    return `Para dia ${partes[2]}/${partes[1]} às ${hora}`;
  }
}

// 👉 Parte final virá em seguida com a função atualizar completa
// que inclui os destaques visuais e o novo resumo com data/hora
// script.js (final - atualização completa)

function atualizar() {
  const spans = document.querySelectorAll('[data-nome]');
  const lista = document.getElementById('lista');
  const nomeCliente = document.getElementById('nomeCliente').value.trim();
  const totalEl = document.getElementById('total');
  const dataHora = pegarDataHora();

  let total = 0;
  let text = '';
  const combosAgrupados = {};
  let avulsos = '';
  const combosUsados = new Set();
  const multiplicadores = {};

  document.querySelectorAll('input[data-combo-mult]').forEach(input => {
    multiplicadores[input.dataset.comboMult] = Math.max(1, parseInt(input.value));
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
    const mult = multiplicadores[comboKey] || 1;
    if (!combo.includes('-refri') && !combosAdicionados.has(comboKey)) {
      text += `\n${mult}x ${comboKey}\n`;
      total += comboData.preco * mult;
      combosAdicionados.add(comboKey);
    }
    itens.forEach(({ nome, qtd }) => {
      text += `- ${qtd}x ${nome}\n`;
    });
  });

  if (avulsos) {
    text += `\nSalgados Avulsos:\n${avulsos}`;
  }

  lista.textContent = text || '(nenhum item)';
  totalEl.textContent = `Total: R$${total.toFixed(2)}`;

  const resumo = `Resumo do pedido de ${nomeCliente || '(cliente)'}:\n${dataHora ? `${dataHora}\n\n` : ''}${text}\nTotal: R$${total.toFixed(2)}`;

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

  const botao = document.getElementById('whatsapp-btn');

  document.querySelectorAll('[data-combo-box]').forEach(box => {
    box.classList.remove('erro-combo');
  });

Object.keys(combosAgrupados).forEach(comboKey => {
  const baseKey = comboKey.replace('-refri', '');
  const box = document.querySelector(`[data-combo-box='${baseKey}']`);
  if (!box) return;

  const isRefriCombo = combos.some(c =>
    c.opcoes.some(o => `${c.nome} – ${o.titulo}` === baseKey && o.refri)
  );

  const salgados = Object.entries(combosAgrupados)
  .filter(([combo]) => combo.replace('-refri', '') === baseKey && !combo.includes('-refri'))
  .flatMap(([, itens]) => itens)
  .filter(item => item.qtd > 0);

  const refri = Object.entries(combosAgrupados)
    .filter(([combo]) => combo === `${baseKey}-refri`)
    .flatMap(([, itens]) => itens);

  const comboData = combos.flatMap(c => c.opcoes.map(o => ({ ...o, combo: `${c.nome} – ${o.titulo}` })))
    .find(c => c.combo === baseKey);

  const mult = multiplicadores[baseKey] || 1;
  const totalSalgados = salgados.reduce((sum, { qtd }) => sum + qtd, 0);
  const totalEsperadoSalg = (comboData?.qtd || 0) * mult;
  const totalRefri = refri.reduce((sum, { qtd }) => sum + qtd, 0);
  const totalEsperadoRefri = (comboData?.refri || 0) * mult;

  const mensagemDiv = box.querySelector('.mensagem-erro');

  if (totalSalgados === 0) {
  mensagemDiv.style.display = 'none';
} else if (totalSalgados < totalEsperadoSalg) {
  mensagemDiv.textContent = `Faltam ${totalEsperadoSalg - totalSalgados} mini salgados para completar o combo.`;
  mensagemDiv.style.display = 'block';
} else if (isRefriCombo && totalRefri < totalEsperadoRefri) {
  mensagemDiv.textContent = `Faltam ${totalEsperadoRefri - totalRefri} refrigerantes para completar o combo.`;
  mensagemDiv.style.display = 'block';
} else {
  mensagemDiv.style.display = 'none';
}
});

  if (!nomeCliente || !salgadosOk || !refriOk) {
    botao.href = '#';
    botao.style.pointerEvents = 'none';
    botao.style.opacity = 0.5;

    if (!nomeCliente) lista.textContent = 'Por favor, digite seu nome para finalizar.';
    else if (!salgadosOk) lista.textContent = 'Preencha corretamente a quantidade de salgados em cada combo.';
    else if (!refriOk) lista.textContent = 'Preencha corretamente os refrigerantes nos combos com bebida.';

    if (!refriOk) {
      Object.keys(combosAgrupados).forEach(comboKey => {
        if (comboKey.includes('-refri')) {
          const box = document.querySelector(`[data-combo-box='${comboKey.replace('-refri','')}']`);
          if (box) box.classList.add('erro-combo');
        }
      });
    }
    return;
  }

  botao.href = `https://wa.me/5573981741968?text=${encodeURIComponent(resumo)}`;
  botao.style.pointerEvents = 'auto';
  botao.style.opacity = 1;
}

document.getElementById('nomeCliente').addEventListener('input', atualizar);
document.getElementById('dataRetirada').addEventListener('change', atualizar);
document.getElementById('horaRetirada').addEventListener('change', atualizar);
document.addEventListener('input', atualizar);

criarBloco('salgados', salgadosLista);
criarBloco('bebidas', bebidas);
criarCombos();
atualizar();

window.addEventListener('beforeunload', function (e) {
  // Verifica se tem algo selecionado no pedido
  const spans = document.querySelectorAll('[data-qtd]');
  let pedidoTemItens = false;
  spans.forEach(el => {
    if (parseInt(el.dataset.qtd) > 0) pedidoTemItens = true;
  });

  if (pedidoTemItens) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
  // Se não tiver nada, não mostra aviso
});
