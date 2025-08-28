let carrinho = [];

function contarItens() {
  const contagem = {};
  carrinho.forEach(item => {
    contagem[item.nome] = (contagem[item.nome] || 0) + 1;
  });
  return contagem;
}

function atualizarQuantidadeProdutos() {
  const contagem = contarItens();
  document.querySelectorAll('#produtos .produto').forEach(div => {
    const btn = div.querySelector('button');
    const nome = btn.getAttribute('data-nome');
    const preco = parseFloat(btn.getAttribute('data-preco'));
    const span = div.querySelector('span');

    const qtd = contagem[nome] || 0;
    let texto = `${nome} - R$ ${preco.toFixed(2)}`;
    if (qtd > 0) texto += ` (${qtd})`;

    span.textContent = texto;
  });
}

function adicionarItem(nome, preco) {
  carrinho.push({ nome, preco });
  atualizarCarrinho();
  atualizarQuantidadeProdutos();
}

function removerPrimeiro(nome) {
  const index = carrinho.findIndex(item => item.nome === nome);
  if (index !== -1) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
    atualizarQuantidadeProdutos();
  }
}

function atualizarCarrinho() {
  const itensCarrinho = document.getElementById('itensCarrinho');
  const totalSpan = document.getElementById('total');
  const valorRecebidoInput = document.getElementById('valorRecebido');
  const trocoDiv = document.getElementById('troco');

  itensCarrinho.innerHTML = '';
  let total = 0;
  const resumo = {};

  carrinho.forEach(item => {
    if (!resumo[item.nome]) resumo[item.nome] = { qtd: 0, preco: item.preco };
    resumo[item.nome].qtd++;
  });

  for (const nome in resumo) {
    const { qtd, preco } = resumo[nome];
    const totalItem = qtd * preco;
    total += totalItem;

    const div = document.createElement('div');
    div.classList.add('carrinho-item');
    div.innerHTML = `
      <span>${nome} (${qtd}x) - R$ ${totalItem.toFixed(2)}</span>
      <button onclick="removerPrimeiro('${nome}')" title="Remover um">&minus;</button>
    `;
    itensCarrinho.appendChild(div);
  }

  totalSpan.textContent = `Total: R$ ${total.toFixed(2)}`;

  const valorRecebido = parseFloat(valorRecebidoInput.value);
  if (!isNaN(valorRecebido) && valorRecebido >= total) {
    const troco = valorRecebido - total;
    trocoDiv.textContent = `Troco: R$ ${troco.toFixed(2)}`;
  } else {
    trocoDiv.textContent = 'Troco: R$ 0,00';
  }
}

function finalizarVenda() {
  const valorRecebidoInput = document.getElementById('valorRecebido');
  const nomeCliente = document.getElementById('nomeCliente').value.trim();
  const valorRecebido = parseFloat(valorRecebidoInput.value);
  const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

  if (carrinho.length === 0) return alert('O carrinho está vazio!');
  if (!nomeCliente) return alert('Informe o nome do cliente.');
  if (isNaN(valorRecebido) || valorRecebido < total) {
    return alert('Valor recebido é insuficiente.');
  }

  const venda = {
    data: new Date().toISOString(),
    cliente: nomeCliente,
    total,
    itens: [...carrinho]
  };

  let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
  vendas.push(venda);
  localStorage.setItem('vendas', JSON.stringify(vendas));

  alert(`Venda finalizada para ${nomeCliente}! Total: R$ ${total.toFixed(2)} | Troco: R$ ${(valorRecebido - total).toFixed(2)}`);

  carrinho = [];
  document.getElementById('valorRecebido').value = '';
  document.getElementById('nomeCliente').value = '';
  atualizarCarrinho();
  atualizarQuantidadeProdutos();
}

function fecharCaixa() {
  const senha = prompt('Digite a senha para fechar o caixa:');
  if (senha !== '1234') return alert('Senha incorreta!');

  const relatorioDiv = document.getElementById('relatorioVendas');
  const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = vendas.filter(v => v.data.startsWith(hoje));

  if (vendasHoje.length === 0) {
    relatorioDiv.innerHTML = '<p>Nenhuma venda registrada hoje.</p>';
    return;
  }

  let html = '<h3>Vendas de Hoje</h3><ul>';
  let totalDia = 0;

  vendasHoje.forEach((venda, i) => {
    const hora = new Date(venda.data).toLocaleTimeString();
    const itens = venda.itens.map(it => `${it.nome} (R$${it.preco.toFixed(2)})`).join(', ');
    html += `<li><strong>${i + 1}:</strong> ${hora} - <strong>${venda.cliente}</strong> - Total: R$ ${venda.total.toFixed(2)}<br>Itens: ${itens}</li>`;
    totalDia += venda.total;
  });

  html += `</ul><p><strong>Total do dia:</strong> R$ ${totalDia.toFixed(2)}</p>`;
  relatorioDiv.innerHTML = html;
}

function gerarRelatorioPorData() {
  const dataSelecionada = document.getElementById('dataBusca').value;
  const relatorioDiv = document.getElementById('relatorioVendas');
  const vendas = JSON.parse(localStorage.getItem('vendas')) || [];

  if (!dataSelecionada) {
    relatorioDiv.innerHTML = '<p>Selecione uma data válida.</p>';
    return;
  }

  const vendasSelecionadas = vendas.filter(v => v.data.startsWith(dataSelecionada));

  if (vendasSelecionadas.length === 0) {
    relatorioDiv.innerHTML = '<p>Nenhuma venda encontrada para esta data.</p>';
    return;
  }

  let html = `<h3>Vendas em ${dataSelecionada}</h3><ul>`;
  let totalDia = 0;

  vendasSelecionadas.forEach((venda, i) => {
    const hora = new Date(venda.data).toLocaleTimeString();
    const itens = venda.itens.map(it => `${it.nome} (R$${it.preco.toFixed(2)})`).join(', ');
    html += `<li><strong>${i + 1}:</strong> ${hora} - <strong>${venda.cliente}</strong> - Total: R$ ${venda.total.toFixed(2)}<br>Itens: ${itens}</li>`;
    totalDia += venda.total;
  });

  html += `</ul><p><strong>Total do dia:</strong> R$ ${totalDia.toFixed(2)}</p>`;
  relatorioDiv.innerHTML = html;
}

function apagarCaixaPorData() {
  const dataSelecionada = document.getElementById('dataBusca').value;
  if (!dataSelecionada) return alert('Selecione uma data para apagar.');

  const senha = prompt('Digite a senha para apagar as vendas:');
  if (senha !== '1234') {
    alert('Senha incorreta!');
    return;
  }

  let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
  const vendasRestantes = vendas.filter(v => !v.data.startsWith(dataSelecionada));

  if (vendas.length === vendasRestantes.length) {
    alert('Nenhuma venda encontrada para essa data.');
    return;
  }

  localStorage.setItem('vendas', JSON.stringify(vendasRestantes));
  alert(`Vendas do dia ${dataSelecionada} apagadas com sucesso!`);
  gerarRelatorioPorData();
}

// Navegação entre abas
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.sessao').forEach(sec => sec.classList.remove('ativa'));
    document.getElementById(btn.getAttribute('data-target')).classList.add('ativa');

    if (window.innerWidth <= 768) {
      document.querySelector('.menu-list').classList.remove('mostrar');
    }
  });
});

// Toggle menu mobile
document.getElementById('btnToggle').addEventListener('click', () => {
  document.querySelector('.menu-list').classList.toggle('mostrar');
});

// Atualiza troco quando digita
document.getElementById('valorRecebido').addEventListener('input', atualizarCarrinho);

// Ao iniciar
window.onload = () => {
  atualizarQuantidadeProdutos();
  atualizarCarrinho();
};
