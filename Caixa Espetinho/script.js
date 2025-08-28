let estoque = {
  "Espetinho de Carne": 10,
  "Espetinho de Frango": 10,
  "Espetinho de Queijo": 10,
  "Refrigerante Lata": 10,
  "Cerveja Lata": 10,
  "Água Mineral": 10
};

let comanda = {};
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

// Adicionar item à comanda
function adicionarComandaMesa(nome, preco) {
  const mesa = document.getElementById('mesaSelecionada').value;
  if (!mesa) return alert("Informe o número da mesa!");
  if (estoque[nome] <= 0) return alert("Produto sem estoque!");
  if (!comanda[mesa]) comanda[mesa] = [];
  comanda[mesa].push({ nome, preco });
  estoque[nome]--;
  atualizarComanda();
  atualizarEstoque();
}

function adicionarProdutoSelecionado() {
  const select = document.getElementById('produtoSelecionado');
  const nome = select.value;
  if (!nome) return alert("Selecione um produto.");
  const preco = parseFloat(select.options[select.selectedIndex].getAttribute('data-preco'));
  adicionarComandaMesa(nome, preco);
}

// Atualizar comanda
function atualizarComanda() {
  const comandaLista = document.getElementById('comandaLista');
  comandaLista.innerHTML = '';
  for (const mesa in comanda) {
    const divMesa = document.createElement('div');
    divMesa.innerHTML = `<strong>Mesa ${mesa}:</strong>`;
    comanda[mesa].forEach((item, i) => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('comanda-item');
      itemDiv.innerHTML = `${item.nome} - R$${item.preco.toFixed(2)} 
        <button onclick="removerItemMesa('${mesa}', ${i})">Remover</button>`;
      divMesa.appendChild(itemDiv);
    });
    comandaLista.appendChild(divMesa);
  }
}

// Remover item
function removerItemMesa(mesa, index) {
  estoque[comanda[mesa][index].nome]++;
  comanda[mesa].splice(index, 1);
  if (comanda[mesa].length === 0) delete comanda[mesa];
  atualizarComanda();
  atualizarEstoque();
}

// Finalizar comanda
function finalizarComanda() {
  const mesa = document.getElementById('mesaSelecionada').value;
  if (!mesa || !comanda[mesa] || comanda[mesa].length === 0) return alert("Mesa sem itens.");
  const total = comanda[mesa].reduce((acc, i) => acc + i.preco, 0);
  const cliente = prompt("Nome do cliente da mesa:");
  const formaPagamento = prompt("Forma de pagamento (Dinheiro, Cartão, PIX):");
  if (!cliente || !formaPagamento) return alert("Dados incompletos.");

  const venda = {
    data: new Date().toISOString(),
    cliente,
    mesa,
    total,
    itens: comanda[mesa],
    pagamento: formaPagamento
  };

  vendas.push(venda);
  localStorage.setItem('vendas', JSON.stringify(vendas));

  alert(`Conta da Mesa ${mesa} finalizada! Total: R$ ${total.toFixed(2)} | Pagamento: ${formaPagamento}`);
  delete comanda[mesa];
  atualizarComanda();
  atualizarEstoque();
}

// Estoque
function atualizarEstoque() {
  const estoqueDiv = document.getElementById('estoqueLista');
  estoqueDiv.innerHTML = '';
  for (const nome in estoque) {
    const div = document.createElement('div');
    div.classList.add('estoque-item');
    div.innerHTML = `${nome}: ${estoque[nome]} 
      <button onclick="reporEstoque('${nome}')">Repor</button>`;
    estoqueDiv.appendChild(div);
  }
}

function reporEstoque(nome) {
  const qtd = parseInt(prompt(`Quantidade para repor de ${nome}:`));
  if (!isNaN(qtd) && qtd > 0) estoque[nome] += qtd;
  atualizarEstoque();
}

// Relatório
function gerarRelatorioPorData(dataSelecionada) {
  const relatorioDiv = document.getElementById('relatorioVendas');
  if (!dataSelecionada) {
    relatorioDiv.innerHTML = "<p>Selecione uma data válida.</p>";
    return;
  }

  const filtradas = vendas.filter(v => v.data.startsWith(dataSelecionada));
  if (filtradas.length === 0) {
    relatorioDiv.innerHTML = "<p>Nenhuma venda encontrada.</p>";
    return;
  }

  let html = "<ul>";
  let totalDia = 0;

  filtradas.forEach((v, i) => {
    const hora = new Date(v.data).toLocaleTimeString();
    const itens = v.itens.map(it => `${it.nome} (R$${it.preco.toFixed(2)})`).join(", ");
    html += `<li><strong>${i + 1}:</strong> ${hora} - Mesa ${v.mesa} - Cliente: ${v.cliente} - Total: R$ ${v.total.toFixed(2)} | Pagamento: ${v.pagamento}<br>Itens: ${itens}</li>`;
    totalDia += v.total;
  });

  html += "</ul>";
  html += `<p><strong>Total do dia:</strong> R$ ${totalDia.toFixed(2)}</p>`;
  relatorioDiv.innerHTML = html;
}

function apagarCaixaPorData() {
  const dataSelecionada = document.getElementById('dataBusca').value;
  if (!dataSelecionada) return alert("Selecione uma data para apagar.");
  const senha = prompt("Digite a senha para apagar as vendas:");
  if (senha !== "1234") return alert("Senha incorreta!");
  vendas = vendas.filter(v => !v.data.startsWith(dataSelecionada));
  localStorage.setItem('vendas', JSON.stringify(vendas));
  alert(`Vendas do dia ${dataSelecionada} apagadas.`);
  gerarRelatorioPorData(dataSelecionada);
}

// Fechamento de Caixa
function exibirFechamentoCaixa() {
  const div = document.getElementById('fechamentoCaixa');
  if (vendas.length === 0) {
    div.innerHTML = "<p>Nenhuma venda registrada.</p>";
    return;
  }

  let total = 0;
  let porForma = {};

  vendas.forEach(v => {
    total += v.total;
    porForma[v.pagamento] = (porForma[v.pagamento] || 0) + v.total;
  });

  let html = `<p><strong>Total geral:</strong> R$ ${total.toFixed(2)}</p><ul>`;
  for (const forma in porForma) {
    html += `<li>${forma}: R$ ${porForma[forma].toFixed(2)}</li>`;
  }
  html += "</ul>";

  div.innerHTML = html;
}

function fecharCaixa() {
  const senha = prompt("Digite a senha para fechar o caixa:");
  if (senha !== "1234") return alert("Senha incorreta!");
  if (confirm("Deseja realmente zerar o caixa?")) {
    vendas = [];
    localStorage.removeItem('vendas');
    alert("Caixa zerado com sucesso.");
    exibirFechamentoCaixa();
  }
}

// Navegação
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.sessao').forEach(s => s.classList.remove('ativa'));
    document.getElementById(btn.dataset.target).classList.add('ativa');
    if (btn.dataset.target === "caixa") exibirFechamentoCaixa();
    if (window.innerWidth <= 768) document.querySelector('.menu-list').classList.remove('mostrar');
  });
});

document.getElementById('btnToggle').addEventListener('click', () => {
  document.querySelector('.menu-list').classList.toggle('mostrar');
});

// Inicializar
window.onload = () => {
  atualizarEstoque();
  atualizarComanda();
};
