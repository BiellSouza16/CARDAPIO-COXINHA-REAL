// JavaScript completo para o cardápio interativo Coxinha Real

const salgadosLista = [ "Coxinha (Frango)", "Palitinho (Queijo com Presunto)", "Balãozinho (Frango com Requeijão)", "Travesseirinho (Carne)", "Kibe de Queijo", "Kibe de Carne", "Churros de Doce de Leite", "Churros de Chocolate", "Enroladinho de Salsicha", "Boliviano (Carne)" ];

const bebidas = [ { nome: "Guaraná 200ml", preco: 3 }, { nome: "Pepsi 200ml", preco: 3 }, { nome: "Guaraná Lata 350ml", preco: 4 }, { nome: "Pepsi Lata 350ml", preco: 4 }, { nome: "Água Mineral", preco: 2 }, { nome: "Água com Gás", preco: 3 }, { nome: "Guaraná 1L", preco: 7 }, { nome: "Pepsi 1L", preco: 7 }, { nome: "IT Guaraná", preco: 8 }, { nome: "IT Cola", preco: 8 } ];

const combos = [ { nome: "Combo A Dois", opcoes: [ { titulo: "sem refri", preco: 20, qtd: 25 }, { titulo: "com 2x refri de 200ml", preco: 24, qtd: 25, refri: 2, tamanhos: ["200ml"] } ]}, { nome: "Combo Grupinho", opcoes: [ { titulo: "sem refri", preco: 35, qtd: 50 }, { titulo: "com 1x refri de 1L", preco: 40, qtd: 50, refri: 1, tamanhos: ["1L"] } ]}, { nome: "Combo Galera", opcoes: [ { titulo: "sem refri", preco: 65, qtd: 100 }, { titulo: "com 1x refri de 2L", preco: 70, qtd: 100, refri: 1, tamanhos: ["2L"] } ]} ];

function criarBloco(id, itens, precoFixo = 1) { const container = document.getElementById(id); itens.forEach(item => { const box = document.createElement('div'); box.className = 'card-box'; box.innerHTML =  <div class="item"> <span>${item.nome || item}</span> <div class="quantidade"> <button onclick="alterarQtd(this, -1)">-</button> <span data-nome="${item.nome || item}" data-preco="${item.preco || precoFixo}" data-qtd="0">0</span> <button onclick="alterarQtd(this, 1)">+</button> </div> </div>; container.appendChild(box); }); }

function criarCombos() { const container = document.getElementById('combos'); combos.forEach(combo => { combo.opcoes.forEach(opcao => { const box = document.createElement('div'); box.className = 'card-box'; const idCombo = ${combo.nome} – ${opcao.titulo}; box.innerHTML =  <div class="combo-title">${combo.nome} – ${opcao.titulo}</div> <div class="combo-sub">${opcao.qtd} mini salgados – R$${opcao.preco.toFixed(2)}</div>;

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

}); }

function alterarQtd(btn, delta, comboNome = null) { const span = btn.parentNode.querySelector('span'); let qtd = parseInt(span.dataset.qtd); let novo = qtd + delta; if (novo < 0) novo = 0; if (comboNome) { const total = [...document.querySelectorAll([data-combo='${comboNome}'])] .reduce((sum, el) => sum + parseInt(el.dataset.qtd), 0); const combo = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: ${c.nome} – ${o.titulo}}))) .find(c => c.combo === comboNome.replace('-refri','')); const max = comboNome.includes('refri') ? combo?.refri : combo?.qtd; if (total + delta > max) return; } span.dataset.qtd = novo; span.textContent = novo; atualizar(); }

function atualizar() { const spans = document.querySelectorAll('[data-nome]'); const lista = document.getElementById('lista'); const nomeCliente = document.getElementById('nomeCliente').value.trim(); const totalEl = document.getElementById('total'); let total = 0; let text = ''; const combosAgrupados = {}; spans.forEach(el => { const qtd = parseInt(el.dataset.qtd); if (qtd > 0) { const nome = el.dataset.nome; const preco = parseFloat(el.dataset.preco); total += preco * qtd; const combo = el.dataset.combo; if (combo) { if (!combosAgrupados[combo]) combosAgrupados[combo] = []; combosAgrupados[combo].push(- ${qtd}x ${nome}); } else { text += ${qtd}x ${nome}\n; } } }); Object.entries(combosAgrupados).forEach(([combo, itens]) => { const comboData = combos.flatMap(c => c.opcoes.map(o => ({...o, combo: ${c.nome} – ${o.titulo}}))) .find(c => c.combo === combo.replace('-refri','')); if (!combo.includes('refri')) { text += \n${combo}\n; } text += itens.join('\n') + '\n'; if (!combo.includes('refri')) total += comboData.preco; }); lista.textContent = text || '(nenhum item)'; totalEl.textContent = Total: R$${total.toFixed(2)}; const resumo = Resumo do pedido de ${nomeCliente || '(cliente)'}\n\n + text + \nTotal: R$${total.toFixed(2)}; document.getElementById('whatsapp-btn').href = https://wa.me/5573981741968?text=${encodeURIComponent(resumo)}; }

criarBloco('salgados', salgadosLista); criarBloco('bebidas', bebidas); criarCombos(); atualizar();
