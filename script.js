let palavras = [];
let palavraAtual;
let mostrandoIngles = true;

// Carrega JSON
fetch('palavras.json')
  .then(response => response.json())
  .then(data => {
    palavras = data;

    // Atualiza histórico de cada palavra com o que existe no localStorage
    palavras.forEach(p => {
      const hist = localStorage.getItem(`palavra_${p.id}`);
      p.history = hist ? JSON.parse(hist) : [];
    });

    novaPalavra(); // mostra a primeira palavra
  })
  .catch(err => {
    console.error("Erro ao carregar palavras JSON:", err);
    document.getElementById("palavra").textContent = "Erro ao carregar palavras!";
  });

// Calcula peso baseado nos últimos 5 acertos
function calcularPeso(palavra) {
  if (!palavra.history || palavra.history.length === 0) return 1;
  const acertos = palavra.history.reduce((sum, val) => sum + (val ? 1 : 0), 0);
  return 1 - acertos / palavra.history.length; // 0 = muito certo, 1 = muito errado
}

// Escolhe palavra ponderada pelo histórico
function escolherPalavra() {
  const pesos = palavras.map(calcularPeso);
  const somaPesos = pesos.reduce((a,b) => a+b, 0);
  let r = Math.random() * somaPesos;

  for (let i = 0; i < palavras.length; i++) {
    if (r < pesos[i]) return palavras[i];
    r -= pesos[i];
  }
  return palavras[palavras.length - 1];
}

// Mostra nova palavra
function novaPalavra() {
  palavraAtual = escolherPalavra();
  mostrandoIngles = Math.random() < 0.5;

  const card = document.getElementById("card");
  const palavraEl = document.getElementById("palavra");
  palavraEl.textContent = mostrandoIngles ? palavraAtual.word.toUpperCase() : palavraAtual.translation.toUpperCase();

  const img = document.getElementById("imagem");
  if (palavraAtual.image && palavraAtual.image.trim() !== "") {
    img.src = palavraAtual.image;
    img.alt = palavraAtual.word;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  const input = document.getElementById("resposta");
  input.value = "";
  input.focus();
  document.getElementById("feedback").textContent = "";
  card.classList.remove("correct", "wrong");
}

// Verifica resposta
function verificarResposta() {
  const resposta = document.getElementById("resposta").value.trim().toUpperCase();
  const card = document.getElementById("card");
  const feedback = document.getElementById("feedback");

  // Define a resposta correta dependendo do idioma mostrado
  const correta = mostrandoIngles ? palavraAtual.translation.toUpperCase() : palavraAtual.word.toUpperCase();
  const acertou = resposta === correta;

  // Atualiza histórico apenas no localStorage
  if (!palavraAtual.history) palavraAtual.history = [];
  palavraAtual.history.push(acertou);
  if (palavraAtual.history.length > 5) palavraAtual.history.shift();

  // Salva no localStorage usando o id
  localStorage.setItem(`palavra_${palavraAtual.id}`, JSON.stringify(palavraAtual.history));

  // Feedback visual
  if (acertou) {
    feedback.textContent = "✅ Correto!";
    card.classList.add("correct");
  } else {
    feedback.textContent = `❌ Errado! A resposta correta é: ${correta}`;
    card.classList.add("wrong");
  }

  setTimeout(novaPalavra, 1500);
}

// Eventos
document.getElementById("verificar").addEventListener("click", verificarResposta);
document.getElementById("resposta").addEventListener("keypress", e => {
  if (e.key === "Enter") verificarResposta();
});
