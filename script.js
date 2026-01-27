let palavras = [];
let palavraAtual;
let mostrandoIngles = true;

// Carrega JSON com tratamento de erros
fetch('palavras.json')
  .then(response => {
    if (!response.ok) throw new Error("Erro ao carregar JSON");
    return response.json();
  })
  .then(data => {
    palavras = data;
    if (!palavras || palavras.length === 0) {
      throw new Error("JSON vazio ou mal formatado");
    }
    novaPalavra();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("palavra").textContent = "Erro ao carregar palavras!";
  });

// Função para calcular o peso baseado no histórico
function calcularPeso(palavra) {
  if (!palavra.history || palavra.history.length === 0) return 1;
  const acertos = palavra.history.reduce((sum, val) => sum + (val ? 1 : 0), 0);
  return 1 - acertos / palavra.history.length; // 0 a 1
}

// Escolhe palavra aleatória ponderada
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

// Função para pegar nova palavra
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

  const correta = mostrandoIngles ? palavraAtual.translation.toUpperCase() : palavraAtual.word.toUpperCase();
  const acertou = resposta === correta;

  if (!palavraAtual.history) palavraAtual.history = [];
  palavraAtual.history.push(acertou);
  if (palavraAtual.history.length > 5) palavraAtual.history.shift();

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
