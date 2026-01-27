let palavras = [];
let frasesAlternativas = [];
let palavraAtual;
let mostrandoIngles = true;
let usarFrases = false;

// Carrega JSON principal
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
    console.error("Erro ao carregar palavras:", err);
    document.getElementById("palavra").textContent = "Erro ao carregar palavras!";
  });

// Checkbox frases
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
      })
      .catch(err => console.error("Erro ao carregar frases:", err));
  } else {
    novaPalavra();
  }
});

// Peso adaptativo
function calcularPeso(palavra) {
  if (!palavra.history || palavra.history.length === 0) return 1;
  const acertos = palavra.history.reduce((s, v) => s + (v ? 1 : 0), 0);
  return 1 - acertos / palavra.history.length;
}

// Escolhe palavra
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

// Nova palavra
function novaPalavra() {
  palavraAtual = escolherPalavra();
  mostrandoIngles = Math.random() < 0.5;

  const card = document.getElementById("card");
  const palavraEl = document.getElementById("palavra");

  palavraEl.textContent = mostrandoIngles
    ? palavraAtual.word.toUpperCase()
    : palavraAtual.translation.toUpperCase();

  document.getElementById("resposta").value = "";
  document.getElementById("resposta").focus();
  document.getElementById("feedback").textContent = "";

  card.classList.remove("correct", "wrong");
}

// Verificar resposta (SALVA histórico)
function verificarResposta() {
  const resposta = document.getElementById("resposta").value.trim().toUpperCase();
  const card = document.getElementById("card");
  const feedback = document.getElementById("feedback");

  let opcoesCorretas;
  let acertou;

  if (mostrandoIngles) {
    opcoesCorretas = palavraAtual.translation
      .split(',')
      .map(t => t.trim().toUpperCase());
    acertou = opcoesCorretas.includes(resposta);
  } else {
    opcoesCorretas = [palavraAtual.word.toUpperCase()];
    acertou = opcoesCorretas.includes(resposta);
  }

  // Atualiza histórico
  palavraAtual.history.push(acertou);
  if (palavraAtual.history.length > 5) palavraAtual.history.shift();
  localStorage.setItem(`palavra_${palavraAtual.id}`, JSON.stringify(palavraAtual.history));

  if (acertou) {
    feedback.textContent = "✅ Correto!";
    card.classList.add("correct");
  } else {
    feedback.textContent = `❌ Errado! Resposta correta: ${opcoesCorretas.join(', ')}`;
    card.classList.add("wrong");
  }

  setTimeout(novaPalavra, 1500);
}

// Mostrar resposta (NÃO salva histórico)
document.getElementById("mostrarResposta").addEventListener("click", () => {
  const feedback = document.getElementById("feedback");
  const card = document.getElementById("card");

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
  card.classList.remove("correct", "wrong");

  setTimeout(() => {
    feedback.textContent = "";
    novaPalavra();
  }, 1500);
});

// Eventos
document.getElementById("verificar").addEventListener("click", verificarResposta);
document.getElementById("resposta").addEventListener("keypress", e => {
  if (e.key === "Enter") verificarResposta();
});
