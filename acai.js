let paginaAtual = 0;
const paginas = document.querySelectorAll(".pagina");

function mostrarPagina(index) {
  paginas.forEach(p => p.classList.remove("ativa"));
  paginas[index].classList.add("ativa");
  paginaAtual = index;
}
function proximaPagina() { if (paginaAtual < paginas.length - 1) mostrarPagina(paginaAtual + 1); }
function paginaAnterior() { if (paginaAtual > 0) mostrarPagina(paginaAtual - 1); }

// ------- PREÇO EM TEMPO REAL
function atualizarPreco() {
  let precoTotal = 0;

  const tamanho = document.querySelector(".Quantidademl.selecionado");
  if (tamanho) precoTotal += parseFloat(tamanho.getAttribute("data-preco"));

  const coberturas = [...document.querySelectorAll(".sabor.selecionado[data-tipo='cobertura']")];
  if (coberturas.length > 1) precoTotal += (coberturas.length - 1) * 1;

  const acompanhamentos = [...document.querySelectorAll(".sabor.selecionado[data-tipo='acompanhamento']")];
  if (acompanhamentos.length > 3) precoTotal += (acompanhamentos.length - 3) * 1;

  const extras = [...document.querySelectorAll(".sabor.selecionado[data-tipo='extra']")];
  extras.forEach(e => precoTotal += parseFloat(e.getAttribute("data-preco")));

  const visor = document.getElementById("precoTotal");
  if (visor) visor.textContent = "Total: R$" + precoTotal.toFixed(2).replace(".", ",");
}

// ------- BADGE CARRINHO
function atualizarBadgeCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const badge = document.getElementById("carrinho-contador");
  if (!badge) return;
  if (carrinho.length > 0) {
    badge.style.display = "inline";
    badge.textContent = carrinho.length;
  } else {
    badge.style.display = "none";
  }
}

// ------- FINALIZAR (ADD/EDIT)
function finalizar() {
  const tamanhoSelecionado = document.querySelector(".Quantidademl.selecionado");
  if (!tamanhoSelecionado) {
    alert("Selecione o tamanho do açaí!");
    return;
  }

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const tamanho = tamanhoSelecionado.getAttribute("data-tamanho");
  const precoBase = parseFloat(tamanhoSelecionado.getAttribute("data-preco"));

  const coberturas = [...document.querySelectorAll(".sabor.selecionado[data-tipo='cobertura']")]
    .map(e => e.textContent.trim());
  const acompanhamentos = [...document.querySelectorAll(".sabor.selecionado[data-tipo='acompanhamento']")]
    .map(e => e.textContent.trim());
  const extras = [...document.querySelectorAll(".sabor.selecionado[data-tipo='extra']")]
    .map(e => ({
      nome: e.childNodes[0].textContent.trim(),
      preco: parseFloat(e.getAttribute("data-preco"))
    }));

  let subtotal = precoBase + extras.reduce((sum, e) => sum + e.preco, 0);
  if (coberturas.length > 1) subtotal += (coberturas.length - 1) * 1;
  if (acompanhamentos.length > 3) subtotal += (acompanhamentos.length - 3) * 1;

  const novoItem = {
    produto: "Açaí",
    tamanho,
    coberturas,
    acompanhamentos,
    extras,
    preco: precoBase,
    subtotal
  };

  const editIndex = localStorage.getItem("editarIndex");
  if (editIndex !== null) {
    carrinho[editIndex] = novoItem; // sobrescreve
    localStorage.removeItem("editarIndex");
  } else {
    carrinho.push(novoItem);
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
  window.location.href = "carrinho.html";
}

// ------- PRÉ-PREENCHER EM MODO EDIÇÃO
function preencherEdicaoSeNecessario() {
  const editIndex = localStorage.getItem("editarIndex");
  if (editIndex === null) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const item = carrinho[editIndex];
  if (!item || item.produto !== "Açaí") return;

  // Tamanho
  const tamanhoDiv = document.querySelector(`.Quantidademl[data-tamanho="${item.tamanho}"]`);
  if (tamanhoDiv) tamanhoDiv.classList.add("selecionado");

  // Coberturas
  (item.coberturas || []).forEach(c => {
    const div = [...document.querySelectorAll(".sabor[data-tipo='cobertura']")]
      .find(el => el.textContent.trim() === c);
    if (div) div.classList.add("selecionado");
  });

  // Acompanhamentos
  (item.acompanhamentos || []).forEach(a => {
    const div = [...document.querySelectorAll(".sabor[data-tipo='acompanhamento']")]
      .find(el => el.textContent.trim() === a);
    if (div) div.classList.add("selecionado");
  });

  // Extras
  (item.extras || []).forEach(e => {
    const div = [...document.querySelectorAll(".sabor[data-tipo='extra']")]
      .find(el => el.childNodes[0].textContent.trim() === e.nome);
    if (div) div.classList.add("selecionado");
  });

  // Troca o texto do botão
  const btn = document.getElementById("btnAdicionar");
  if (btn) btn.textContent = "Salvar Alterações";

  // *** ESSENCIAL: recalcular depois de preencher ***
  atualizarPreco();
}

// ------- INICIALIZAÇÃO SEGURA (sem sobrescrever onload)
document.addEventListener("DOMContentLoaded", () => {
  // Listeners de clique (tamanhos)
  document.querySelectorAll(".Quantidademl").forEach(div => {
    div.addEventListener("click", () => {
      document.querySelectorAll(".Quantidademl").forEach(d => d.classList.remove("selecionado"));
      div.classList.add("selecionado");
      atualizarPreco();
    });
  });

  // Listeners de clique (sabores)
  document.querySelectorAll(".sabor").forEach(div => {
    div.addEventListener("click", () => {
      div.classList.toggle("selecionado");
      atualizarPreco();
    });
  });

  atualizarBadgeCarrinho();
  preencherEdicaoSeNecessario(); // <- pré-preenche e já chama atualizarPreco()
  atualizarPreco(); // segurança extra se não houver edição
});
