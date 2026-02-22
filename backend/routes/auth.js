const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

// Cadastro
router.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  if (senha.length < 6) {
    return res
      .status(400)
      .json({ erro: "A senha precisa ter pelo menos 6 caracteres" });
  }

  const senhaCriptografada = bcrypt.hashSync(senha, 10);

  try {
    const statement = db.prepare(
      "INSERT INTO usuarios (nome, email, senha) VALUES(?, ?, ?)",
    );
    statement.run(nome, email, senhaCriptografada);
    res.json({ mensagem: "Conta criada com sucesso!" });
  } catch (err) {
    return res.status(400).json({ erro: "Este email já está cadastrado" });
  }
});

// Login
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !email) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  const usuario = db
    .prepare("SELECT * FROM usuarios WHERE email = ?")
    .get(email);

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ erro: "Email ou senha incorretos" });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SEGREDO,
    { expiresIn: "7d" },
  );

  res.json({ token, nome: usuario.nome, id: usuario.id });
});

module.exports = router;
