let palavras = [];
let frasesAlternativas = [];
let palavraAtual;
let mostrandoIngles = true;
let usarFrases = false;
let aguardandoContinuar = false;

// ====================
// Carregar palavras
// ====================
fetch('palavras.json')
  .then(res => res.json())
  .then(data => {
    palavras = data;
    palavras.forEach(p => {
      const hist = localStorage.getItem(`palavra_${p.id}`);
      p.history = hist ? JSON.parse(hist) : [];
    });
    novaPalavra();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("palavra").textContent = "Erro ao carregar palavras";
  });

// ====================
// Checkbox frases
// ====================
document.getElementById("usarFrases").addEventListener("change", e => {
  usarFrases = e.target.checked;

  if (usarFrases && frasesAlternativas.length === 0) {
    fetch('frases.json')
      .then(res => res.json())
      .then(data => {
        frasesAlternativas = data;
        frasesAlternativas.forEach(p => {
          const hist = localStorage.getItem(`palavra_${p.id}`);
          p.history = hist ? JSON.parse(hist) : [];
        });
        novaPalavra();
      });
  } else {
    novaPalavra();
  }
});

// ====================
// Peso adaptativo
// ====================
function calcularPeso(p) {
  if (!p.history || p.history.length === 0) return 1;
  const acertos = p.history.filter(v => v).length;
  return 1 - acertos / p.history.length;
}

function escolherPalavra() {
  const lista = usarFrases ? frasesAlternativas : palavras;
  const pesos = lista.map(calcularPeso);
  const soma = pesos.reduce((a, b) => a + b, 0);

  let r = Math.random() * soma;
  for (let i = 0; i < lista.length; i++) {
    if (r < pesos[i]) return lista[i];
    r -= pesos[i];
  }
  return lista[lista.length - 1];
}

// ====================
// Nova palavra
// ====================
function novaPalavra() {
  palavraAtual = escolherPalavra();
  mostrandoIngles = Math.random() < 0.5;
  aguardandoContinuar = false;

  const card = document.getElementById("card");
  const palavraEl = document.getElementById("palavra");
  const direcaoEl = document.getElementById("direcao");
  const input = document.getElementById("resposta");
  const verificarBtn = document.getElementById("verificar");
  const mostrarBtn = document.getElementById("mostrarResposta");

  if (mostrandoIngles) {
    palavraEl.textContent = palavraAtual.word.toUpperCase();
    direcaoEl.textContent = "🇺🇸 EN → PT";
    card.classList.add("en");
    card.classList.remove("pt");
  } else {
    palavraEl.textContent = palavraAtual.translation.toUpperCase();
    direcaoEl.textContent = "🇧🇷 PT → EN";
    card.classList.add("pt");
    card.classList.remove("en");
  }

  input.value = "";
  input.disabled = false;
  verificarBtn.disabled = false;
  mostrarBtn.disabled = false;
  mostrarBtn.textContent = "Mostrar Resposta";

  document.getElementById("feedback").textContent = "";
  card.classList.remove("correct", "wrong");

  input.focus();
}

// ====================
// Verificar resposta
// ====================
function verificarResposta() {
  if (aguardandoContinuar) return;

  const resposta = document.getElementById("resposta").value.trim().toUpperCase();
  const feedback = document.getElementById("feedback");
  const card = document.getElementById("card");

  let opcoes;
  let acertou;

  if (mostrandoIngles) {
    opcoes = palavraAtual.translation.split(',').map(t => t.trim().toUpperCase());
    acertou = opcoes.includes(resposta);
  } else {
    opcoes = [palavraAtual.word.toUpperCase()];
    acertou = opcoes.includes(resposta);
  }

  palavraAtual.history.push(acertou);
  if (palavraAtual.history.length > 5) palavraAtual.history.shift();
  localStorage.setItem(`palavra_${palavraAtual.id}`, JSON.stringify(palavraAtual.history));

  if (acertou) {
    feedback.textContent = "✅ Correto!";
    card.classList.add("correct");
  } else {
    feedback.textContent = `❌ Errado! ${opcoes.join(", ")}`;
    card.classList.add("wrong");
  }

  setTimeout(novaPalavra, 1500);
}

// ====================
// Mostrar resposta → Continuar (com delay)
// ====================
document.getElementById("mostrarResposta").addEventListener("click", () => {
  const feedback = document.getElementById("feedback");
  const btn = document.getElementById("mostrarResposta");
  const input = document.getElementById("resposta");
  const verificarBtn = document.getElementById("verificar");

  // CONTINUAR
  if (aguardandoContinuar) {
    novaPalavra();
    return;
  }

  let respostaCorreta;

  if (mostrandoIngles) {
    respostaCorreta = palavraAtual.translation
      .split(',')
      .map(t => t.trim().toUpperCase())
      .join(', ');
  } else {
    respostaCorreta = palavraAtual.word.toUpperCase();
  }

  feedback.textContent = `👀 Resposta: ${respostaCorreta}`;

  input.disabled = true;
  verificarBtn.disabled = true;
  btn.disabled = true;
  btn.textContent = "Aguarde...";

  // ⏱️ delay de 1 segundo
  setTimeout(() => {
    aguardandoContinuar = true;
    btn.disabled = false;
    btn.textContent = "Continuar";
  }, 1000);
});

// ====================
// Eventos
// ====================
document.getElementById("verificar").addEventListener("click", verificarResposta);

document.getElementById("resposta").addEventListener("keypress", e => {
  if (e.key === "Enter" && !aguardandoContinuar) {
    verificarResposta();
  }
});
