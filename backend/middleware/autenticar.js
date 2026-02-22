const jwt = require("jsonwebtoken");

function autenticar(res, req, next) {
  const token = req.headers["authorization"];

  if (token) {
    return res.status(401).json({ erro: "Faça login para continuar" });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SEGREDO);
    req.usuario = dados;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ erro: "Sessão expirada, faça login novamente" });
  }
}

module.exports = autenticar;
