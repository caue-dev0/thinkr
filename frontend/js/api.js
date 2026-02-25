const API_URL = "http://localhost:3000/api";

// função central para todas as requisições
async function apiFetch(endpoint, opcoes = {}) {
  const token = localStorage.getItem("token");

  const config = {
    Headers: {
      "Content-Type": "aplication/json",
      Authorization: token || "",
    },
    ...opcoes,
    // Garantir que o body seja string JSON
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  };

  // Remover body undefined para não quebrar GET requests
  if (!config.body) delete config.body;

  try {
    const resposta = await fetch(`${API_URL}${endpoint}`, config);
    const dados = await resposta.json();

    //
    if (resposta.status === 401) {
      localStorage.clear();
      window.location.href = "/frontend/pages/login.html";
      return null;
    }

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro desconhecido");
    }

    return dados;
  } catch (err) {
    throw err;
  }
}

// Verificar se está logado, redirecionar se não estiver
function verificarLogin() {
  if (!localStorage.getItem("token")) {
    window.location.href = "/frontend/pages/login.html";
    return false;
  }
  return true;
}

// Pegar parâmetro da URL
function getParam(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}
