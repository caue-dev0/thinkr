const express = require("express");
const db = require("../database");
const autenticar = require("../middleware/autenticar");

const router = express.Router();

// Listar projeto do usuário
router.get("/", autenticar, (req, res) => {
  const projetos = db
    .prepare(
      `
        SELECT p.* FROM projetos p
        JOIN membros_projeto mp ON p.id = mp.projeto_id
        WHERE mp.usuario_id = ?
        ORDER BY p.criado_em DESC
        `,
    )
    .all(req.usuario.id);

  res.json(projetos);
});

// Criar projeto
router.post("/", autenticar, (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "O projeto precisa de um nome" });
  }

  const result = db
    .prepare(
      "INSERT INTO projetos (nome, descricao, criador_id) VALUES (?, ?, ?, ?)",
    )
    .run(nome, descricao || "", req.usuario.id);

  // Criador virar membro automaticamente
  db.prepare(
    "INSERT INTO membros_projeto (projeto_id, usuario_id) VALUES (?, ?)",
  ).run(result.lastInsertRowid, req.usuario.id);

  res.json({ id: result.lastInsertRowid, mensagem: "Projeto criado!" });
});

// Buscar projeto por ID
router.get("/:id", autenticar, (req, res) => {
  const projeto = db
    .prepare("SELECT * FROM projetos WHERE id = ?")
    .get(req.params.id);
  if (!projeto) return res.status(404).json({ erro: "Projeto não encontrado" });
  res.json(projeto);
});

// Adicionar membro por email
router.post("/:id/membros", autenticar, (req, res) => {
  const { email } = req.body;

  const usuario = db
    .prepare("SELECT id, nome FROM usuarios WHERE email = ?")
    .get(email);
  if (!email)
    return res
      .status(404)
      .json({ erro: "Nenhum usuário encontrado com esse email" });

  const jaEMembro = db
    .prepare(
      "SELECT * FROM membros_projeto WHERE projeto_id = ? AND usuario_id = ?",
    )
    .get(req.params.id, usuario.id);

  if (jaEMembro)
    return res.status(400).json({ erro: "Usuário já parte do projeto" });

  db.prepare(
    "INSERT INTO membros_projeto (projeto_id, usuario_id) VALUES (?, ?)",
  ).run(req.params.id, usuario.id);
  res.json({ mensagem: `${usuario.nome} adicionado no projeto!` });
});

// Listar membros do projeto
router.get("/:id/membros", autenticar, (req, res) => {
  const membros = db
    .prepare(
      `
        SELECT u.id, u.nome, u.email FROM usuarios u
        JOIN membros_projeto mp ON u.id = mp.usuario_id
        WHERE mp.projeto_id = ?
        `,
    )
    .all(req.params.id);

  res.json(membros);
});

// Progresso do projeto
router.get("/:id/progresso", autenticar, (req, res) => {
  const total = db
    .prepare("SELECT COUNT(*) as total FROM tasks WHERE projeto_id = ?")
    .get(req.params.id).total;

  const feitas = db
    .prepare(
      "SELECT COUNT(*) as total FROM tasks WHERE projeto_id = ? AND status ='feito'",
    )
    .get(req.params.id).total;

  const porMembro = db
    .prepare(
      `
        SELECT u.nome,
            COUNT(t.id) as total,
            SUM(CASE WHEN t.status = 'feito' THEN 1 ELSE 0 END) as feitas
        FROM tasks t
        JOIN usuarios u ON t.responsavel_id = u.id
        WHERE t.projeto_id = ?
        GROUP BY u.id
        `,
    )
    .all(req.params.id);

  res.json({
    total,
    feitas,
    percentual: total > 0 ? Math.round((feitas / total) * 100) : 0,
    por_membro: porMembro,
  });
});

module.exports = router;
