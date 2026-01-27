let palavras = [];
let frasesAlternativas = []; // JSON de frases
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

// Evento checkbox
document.getElementById("usarFrases").addEventListener("change", e => {
  usarFrases = e.target.checked;
  if (usarFrases && frasesAlternativas.length === 0) {
    // Carrega JSON de frases se ainda não carregou
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

// Função de peso adaptativo
function calcularPeso(palavra) {
  if (!palavra.history || palavra.history.length === 0) return 1;
  const acertos = palavra.history.reduce((sum, val) => sum + (val ? 1 : 0), 0);
  return 1 - acertos / palavra.history.length;
}

// Escolhe palavra ponderada
function escolherPalavra() {
  const lista = usarFrases ? frasesAlternativas : palavras;
  const pesos = lista.map(calcularPeso);
  const soma = pesos.reduce((a,b)=>a+b,0);
  let r = Math.random() * soma;
  for (let i=0;i<lista.length;i++){
    if (r < pesos[i]) return lista[i];
    r -= pesos[i];
  }
  return lista[lista.length-1];
}

// Mostra nova palavra
function novaPalavra() {
  palavraAtual = escolherPalavra();
  mostrandoIngles = Math.random() < 0.5;

  const card = document.getElementById("card");
  const palavraEl = document.getElementById("palavra");
  palavraEl.textContent = mostrandoIngles ? palavraAtual.word.toUpperCase() : palavraAtual.translation.toUpperCase();

  const input = document.getElementById("resposta");
  input.value = "";
  input.focus();
  document.getElementById("feedback").textContent = "";
  card.classList.remove("correct","wrong");
}

// Verifica resposta
function verificarResposta() {
  const resposta = document.getElementById("resposta").value.trim().toUpperCase();
  const card = document.getElementById("card");
  const feedback = document.getElementById("feedback");

  let opcoesCorretas;
  let acertou;

  if (mostrandoIngles) {
    // Se estiver mostrando inglês, aceita qualquer tradução
    opcoesCorretas = palavraAtual.translation.split(',').map(t => t.trim().toUpperCase());
    acertou = opcoesCorretas.includes(resposta);
  } else {
    opcoesCorretas = [palavraAtual.word.toUpperCase()];
    acertou = opcoesCorretas.includes(resposta);
  }

  // Atualiza histórico no localStorage
  if (!palavraAtual.history) palavraAtual.history = [];
  palavraAtual.history.push(acertou);
  if (palavraAtual.history.length > 5) palavraAtual.history.shift();
  localStorage.setItem(`palavra_${palavraAtual.id}`, JSON.stringify(palavraAtual.history));

  // Feedback visual
  if (acertou) {
    feedback.textContent = "✅ Correto!";
    card.classList.add("correct");
  } else {
    feedback.textContent = `❌ Errado! Resposta correta: ${opcoesCorretas.join(', ')}`;
    card.classList.add("wrong");
  }

  setTimeout(novaPalavra, 1500);
}

// Eventos
document.getElementById("verificar").addEventListener("click", verificarResposta);
document.getElementById("resposta").addEventListener("keypress", e=>{
  if (e.key === "Enter") verificarResposta();
});
