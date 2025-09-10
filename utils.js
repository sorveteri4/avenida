// Função para atualizar o badge do carrinho
function atualizarBadgeCarrinho() {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let badge = document.getElementById("carrinho-contador");

  if (!badge) return; // evita erro caso não exista na página

  if (carrinho.length > 0) {
    badge.style.display = "inline";
    badge.textContent = carrinho.length;
  } else {
    badge.style.display = "none";
  }
}

// Atualiza automaticamente ao carregar qualquer página
window.addEventListener("load", atualizarBadgeCarrinho);
