let palavras = [];
let palavraAtual;

// Carrega JSON
fetch('palavras.json')
  .then(response => response.json())
  .then(data => {
    palavras = data;
    novaPalavra();
  });

// Função para pegar uma palavra aleatória
function novaPalavra() {
  const index = Math.floor(Math.random() * palavras.length);
  palavraAtual = palavras[index];

  const mostrarIngles = Math.random() < 0.5;
  const card = document.getElementById("card");
  const palavraEl = document.getElementById("palavra");
  palavraEl.textContent = mostrarIngles ? palavraAtual.word.toUpperCase() : palavraAtual.translation.toUpperCase();

  // Atualiza imagem
  const img = document.getElementById("imagem");
  if (palavraAtual.image && palavraAtual.image.trim() !== "") {
    img.src = palavraAtual.image;
    img.alt = palavraAtual.word;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  // Limpa input, feedback e remove cores
  const input = document.getElementById("resposta");
  input.value = "";
  input.focus();
  document.getElementById("feedback").textContent = "";
  card.classList.remove("correct", "wrong");
}

// Verifica resposta
function verificarResposta() {
  const resposta = document.getElementById("resposta").value.trim().toUpperCase();
  const respostasPossiveis = [
    palavraAtual.word.toUpperCase(),
    palavraAtual.translation.toUpperCase()
  ];

  const card = document.getElementById("card");
  const feedback = document.getElementById("feedback");

  if (respostasPossiveis.includes(resposta)) {
    feedback.textContent = "✅ Correto!";
    card.classList.add("correct");
  } else {
    feedback.textContent = `❌ Errado! A resposta correta é: ${palavraAtual.word} — ${palavraAtual.translation}`;
    card.classList.add("wrong");
  }

  setTimeout(novaPalavra, 1500);
}

// Botão
document.getElementById("verificar").addEventListener("click", verificarResposta);

// Enter
document.getElementById("resposta").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    verificarResposta();
  }
});
